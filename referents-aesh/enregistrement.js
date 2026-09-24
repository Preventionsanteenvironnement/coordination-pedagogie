/* Écriture atomique des placements et de leur historique.
   La fiche AESH sert de point de concurrence : deux nouveaux placements du même
   AESH ne peuvent pas être confirmés depuis le même état périmé. */
const stable = x => JSON.stringify(x, (_, v) => v && typeof v === 'object' && !Array.isArray(v)
  ? Object.fromEntries(Object.entries(v).sort(([a],[b]) => a.localeCompare(b))) : v);
const conflit = () => Object.assign(new Error('Planning modifié pendant la saisie. Fermez puis rouvrez le cours.'), {code:'conflit', champs:['planning — fermez puis rouvrez le cours']});
export async function enregistrerPlanning({FS, db, collection, historique, docs, base, annee, par, nouvelId, maintenant}) {
  if (!FS.runTransaction) throw Object.assign(new Error('Transaction indisponible'), {code:'transaction-indisponible'});
  const souhaites = new Map(docs.map(d => [d.id,d]));
  const aeshIds = new Set(docs.filter(d => ['place','absence','aesh'].includes(d.type)).map(d => d.type==='aesh'?d.id:d.aeshId));
  // L'ajout d'une absence ou d'une réunion invalide aussi une fenêtre de placement
  // déjà ouverte : ces écritures prennent les mêmes verrous de fiche.
  if(docs.some(d=>d.type==='reunion')) for(const [id,a] of base) if(a.type==='aesh') aeshIds.add(id);
  const ids = new Set([...souhaites.keys(), ...aeshIds]);
  // Contrats, absences, réunions et PFMP consultés doivent encore être identiques.
  for (const [id,d] of base) if (['pole','reunion','absence'].includes(d.type) || (d.type === 'place' && aeshIds.has(d.aeshId))) ids.add(id);
  return FS.runTransaction(db, async tx => {
    const actuels = new Map();
    for (const id of ids) {
      const snap = await tx.get(FS.doc(db,collection,id));
      const actuel = snap.exists() ? {...snap.data(),id} : null, attendu = base.get(id) || null;
      if (stable(actuel) !== stable(attendu)) throw conflit();
      actuels.set(id,actuel);
    }
    const ecritures = new Map(souhaites);
    for (const id of aeshIds) {
      const a = ecritures.get(id) || actuels.get(id);
      if (!a || a.type !== 'aesh' || !a.sigle || !a.equipes || !a.heures)
        throw Object.assign(new Error('Le référent doit enregistrer la fiche et le contrat de cet AESH avant de le placer.'), {code:'fiche-aesh-manquante'});
      ecritures.set(id,{...a,revisionPlanning:(Number(a.revisionPlanning)||0)+1});
    }
    if (ecritures.size * 2 > 480) throw Object.assign(new Error('Trop de modifications en une fois'),{code:'volume'});
    const resultat = [];
    for (const [id,brut] of ecritures) {
      const avant = actuels.get(id), d = {...brut,id,annee,par,majLe:maintenant,creeLe:brut.creeLe || avant?.creeLe || maintenant,version:(Number(avant?.version)||0)+1};
      delete d.depart; Object.keys(d).forEach(k => {if(d[k] === undefined) delete d[k];});
      const contenu = JSON.stringify(d);
      if(contenu.length > 20000) throw Object.assign(new Error('Document trop volumineux'),{code:'volume'});
      const hid = 'hist_' + nouvelId();
      tx.set(FS.doc(db,historique,hid),{id:hid,type:'hist',annee,de:id,typeDe:d.type,version:d.version,majLe:maintenant,par,contenu});
      tx.set(FS.doc(db,collection,id),d); resultat.push(d);
    }
    return resultat;
  });
}
