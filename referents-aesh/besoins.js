/* Même cadre, même clé et même document que la page enseignants. */
import { normaliserCadre, memeEstimation, idCours, idArchiveCours, declarationsDeCours } from '../demandes-aesh/estimation.js?v=2026r16';
export function cibleBesoin(cadreBrut, edt, classe, cours) {
  const cadre = normaliserCadre(cadreBrut, edt);
  const k = cadre?.classes.find(x => x.nom === classe);
  const parite = cours.sem === 'SA' ? 'A' : cours.sem === 'SB' ? 'B' : '';
  const candidats = (k?.creneaux || []).filter(x => x.jour === ['lun','mar','mer','jeu','ven'][cours.j] && x.debut === cours.d && x.fin === cours.f && x.parite === parite);
  const exacts = candidats.filter(x => x.matiere === cours.lib);
  const l = exacts.length ? exacts : candidats;
  if (l.length !== 1) return null; // Ne jamais créer une estimation parallèle ou choisir un cours ambigu.
  const cr = l[0], nom = cr.classeRef || classe;
  return { id:idCours(cadre.periode.debut, nom, cr.cle), classe:nom, cr, periode:cadre.periode, annee:cadre.annee };
}
export async function enregistrerBesoin(FS, db, cible, base, nb, maintenant = new Date().toISOString()) {
  if (!Number.isInteger(nb) || nb < 0 || nb > 6) throw new Error('Nombre invalide');
  const col = 'coordination_estimation_aesh';
  return FS.runTransaction(db, async tx => {
    const ref = FS.doc(db,col,cible.id), snap = await tx.get(ref), actuel = snap.exists() ? snap.data() : null;
    if (!memeEstimation(actuel,base)) throw Object.assign(new Error('Besoin modifié depuis l’ouverture. Fermez puis rouvrez la pastille pour voir la dernière réponse.'), {code:'besoin-conflit'});
    const cr = cible.cr;
    const doc = { ...(actuel || {}), id:cible.id, type:'cours', annee:cible.annee,
      periode:{...cible.periode,label:String(cible.periode.label || '').slice(0,40)}, classe:cible.classe, cle:cr.cle,
      jour:cr.jour, debut:cr.debut, fin:cr.fin, matiere:cr.matiere, parite:cr.parite,
      nb, au:actuel?.au || cible.periode.fin, semaines:actuel?.semaines || 'toutes',
      hDebut:actuel?.hDebut || cr.debut, hFin:actuel?.hFin || cr.fin,
      statut:'active', version:(actuel?.version || 0)+1, majLe:maintenant, source:'referents-aesh' };
    const aid = idArchiveCours(doc.id,doc.version);
    tx.set(ref,doc);
    tx.set(FS.doc(db,col,aid), {...doc,id:aid,type:'archive',declaration:doc.id,lignes:declarationsDeCours([doc])[0].lignes,commentaire:''});
    return doc;
  });
}
