import { semainesAB, contexteType, occupationsAB, resumeSemaine, totauxJours, libelleTotal, comptesEleves as comptesClasse, libelleEleves as libelleClasse } from './vues-planning.js?v=2026-09-26a';
import { ouvrirVerification, PERSONNES, lireBrouillon } from './verification.js?v=2026-09-24e';
import { cibleBesoin, enregistrerBesoin } from './besoins.js?v=2026-09-24b';
/* ═══════════════════════════════════════════════════════════════════
   Référents de pôle AESH — application (coordination-pedagogie/referents-aesh/)
   Humeur + pensée → code du pôle → Accueil · Mes AESH · Emploi du temps ·
   Vue d'ensemble · Besoins · Messages · Exporter.
   Firestore : coordination_referents_aesh (pole_, aesh_, place_, abs_, reunion_, msg_, periode_) ; historique hist_ dans coordination_referents_aesh_hist
               coordination_estimation_aesh (cadre en lecture ; besoins partagés enseignants/référents)
   Rien ne s'efface : un retrait est un statut ou une date de fin, et chaque écriture laisse une copie hist_.
   ═══════════════════════════════════════════════════════════════════ */
import { couleurAesh, plagesDe, libelleService } from './presences.js?v=2026-09-24b';
import * as K from './calculs.js?v=2026-09-24f';
import { POLES, pole, FILIERES, filiere, filieresDuPole, filiereDeClasse, EQUIPES_DEPART, COLLECTION, COL_ESTIMATION, couleurMatiere, HUMEURS, PENSEES } from './donnees.js?v=2026-09-24b';
import { enregistrerPlanning } from './enregistrement.js?v=2026-09-24d';
import * as AV from './avatars.js?v=2026-09-24b';

const DELAI = 15000;
const K_SESSION = 'referents-aesh-session-v1', K_HUMEUR = 'referents-aesh-humeur', K_CACHE = 'referents-aesh-cache-v1', K_LU = 'referents-aesh-messages-lus',
  K_FOND = 'referents-aesh-fond', K_SIGN = 'referents-aesh-signature', K_PENSEES = 'referents-aesh-pensees';
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const lsLit = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v ?? d; } catch (e) { return d; } };
const lsEcrit = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
const alea = () => { const a = 'abcdefghijklmnopqrstuvwxyz0123456789', r = crypto.getRandomValues(new Uint8Array(10)); return [...r].map(x => a[x % 36]).join(''); };
const avecDelai = p => { let t; return Promise.race([p, new Promise((_, rej) => { t = setTimeout(() => rej(Object.assign(new Error('delai'), { code: 'delai' })), DELAI); })]).finally(() => clearTimeout(t)); };
const typeErreur = e => { const t = `${(e && e.code) || ''} ${(e && e.message) || ''}`; return /permission|insufficient/i.test(t) ? 'refus' : /delai/.test(t) ? 'delai' : 'horsligne'; };
const messageErreur = e => e && e.code === 'fiche-aesh-manquante' ? 'Non enregistré : le référent doit d’abord enregistrer la fiche et le contrat de cet AESH.' : e && e.code === 'conflit' ? `Non enregistré : ${e.qui || 'un autre référent'} a modifié en même temps ${e.champs && e.champs.length ? '« ' + e.champs.join(' », « ') + ' »' : 'cette donnée'}. Regardez sa valeur ; si vous enregistrez de nouveau, la vôtre la remplacera.` : e && e.code === 'contrat' ? 'Non enregistré : son contrat est déjà terminé à cette date.' : e && e.code === 'volume' ? 'Non enregistré : fiche trop volumineuse.' : ({ refus: 'Non enregistré : espace pas encore ouvert par la coordination.', delai: 'Pas de réponse du serveur. Vérifiez dans un instant.', horsligne: 'Enregistrement non confirmé. Vérifiez la connexion et le planning avant de réessayer.' })[typeErreur(e)];
const anneeScolaire = (d = new Date()) => { const y = d.getFullYear(); return d.getMonth() >= 7 ? `${y}-${y + 1}` : `${y - 1}-${y}`; };
const nomPole = id => (pole(id) || { nom: id }).nom;
const heureFr = iso => { const d = new Date(iso); if (isNaN(d)) return ''; const auj = K.isoLocal(), j = K.isoLocal(d); return `${j === auj ? 'aujourd’hui' : K.dateCourte(j)} · ${d.getHours()} h ${K.z2(d.getMinutes())}`; };
const nombre = v => v === null || v === undefined || v === '' || !Number.isFinite(+v) ? null : +v;
const hOu = v => nombre(v) == null ? '—' : K.fmtH(v);
const CRENEAUX_H = []; for (let m = 7 * 60 + 30; m <= 21 * 60; m += 30) CRENEAUX_H.push(K.hDe(m));

export async function demarrer({ FS, db, erreur, modePlanning = false, ouvrirAccesPlanning }) {
  let droitsPlanning = null;
  const S = {
    annee: anneeScolaire(), edt: null, C: null, docs: new Map(), etat: 'chargement', est: [], cadreEst: null, cadreEstBrut: null, estDocs: new Map(), estEtat: 'chargement',
    session: modePlanning ? null : lsLit(K_SESSION, null), vu: null, route: { e: 'humeur', p: {} }, lundi: null, feuille: null, menu: false, toast: null,
    code: '', codeMsg: '', codeErr: false, form: null, info: null, exp: { quoi: 'pole', ids: [], format: 'pdf' }, msgBrouillon: '', ignorePop: 0, n: 0, flash: null, envoi: false
  };
  const racine = document.getElementById('app');
  document.documentElement.dataset.fond = lsLit(K_FOND, 'clair');

  /* ─────────── données ─────────── */
  try { S.edt = await (await fetch('./edt-lycee.json?v=2026-09-24b')).json(); }
  catch (e) { racine.innerHTML = '<p style="padding:30px;text-align:center">Les emplois du temps n’ont pas pu se charger. Vérifiez la connexion puis rechargez la page.</p>'; return; }
  S.C = K.creerCalendrier(S.edt);
  /* 26/09/2026 — Les codes de suivi (5 caractères, aucun nom) servent à ouvrir une classe
     jamais renseignée. Dès qu'un référent enregistre, c'est le document qui fait foi. */
  try { S.roster = await (await fetch('../observation-besoins/roster.json?v=2026-09-26a')).json(); }
  catch (e) { S.roster = null; }
  S.lundi = semaineParDefaut();
  const cache = lsLit(K_CACHE, null);
  if (!modePlanning && cache && cache.annee === S.annee && Array.isArray(cache.docs)) cache.docs.forEach(d => d && d.id && S.docs.set(d.id, d));
  let I = null, versionI = -1, versionDocs = 0;
  const idx = () => { if (versionI !== versionDocs) { I = K.indexer([...S.docs.values()], EQUIPES_DEPART, POLES.map(x => x.id), FILIERES); versionI = versionDocs; } return I; };
  const ctx = () => ({ C: S.C, edt: S.edt, I: idx(), estimations: S.est, nomPole, aujourdhui: K.isoLocal(), annee: S.annee });

  function resumeDemande(c,iso,bes) {
    const etat=K.etatBesoin(ctx(),c,iso,bes),n=bes?presents(c,iso,bes):0;
    return `<span class="bes-cercle ${etat}" style="position:relative;display:inline-block;left:auto;right:auto;bottom:auto;vertical-align:middle;margin-right:8px" aria-hidden="true">${etat==='inconnu'?'?':etat==='zero'?'╱':''}</span><b>${!bes?'Besoin non renseigné':bes.nb===0?'0 AESH demandé':`${n}/${bes.nb} AESH demandé${bes.nb>1?'s':''}`}</b>`;
  }
  function semaineParDefaut() {
    const auj = K.isoLocal(), js = K.jourSemaine(auj);
    return js >= 5 ? K.ajoute(K.lundiDe(auj), 7) : K.lundiDe(auj);
  }
  /* Tiroir séparé (18/09) : les copies d'historique vont dans COL_HIST, que la page ne télécharge jamais.
     On ne demande que les vrais documents : les anciennes copies hist_ restées dans la collection principale
     ne sont plus téléchargées non plus. Si Firebase réclame un index pour cette demande, on revient seul à
     l'ancienne (toute l'année) : la page continue de marcher. */
  const COL_HIST = COLLECTION + '_hist';
  const TYPES_DOCS = ['pole', 'aesh', 'place', 'absence', 'reunion', 'message', 'periode', 'verification', 'eleves'];
  let arretPlanning = null;
  function ecouter(simple) {
    if (arretPlanning) { arretPlanning(); arretPlanning = null; }
    if (erreur || !FS) { S.etat = 'horsligne'; return; }
    try {
      const q = simple ? FS.query(FS.collection(db, COLLECTION), FS.where('annee', '==', S.annee))
        : FS.query(FS.collection(db, COLLECTION), FS.where('annee', '==', S.annee), FS.where('type', 'in', TYPES_DOCS));
      let arret = null;
      arretPlanning = arret = FS.onSnapshot(q, snap => {
        const m = new Map(); snap.forEach(d => { const x = d.data() || {}; if (x.type !== 'hist') m.set(x.id || d.id, { ...x, id: x.id || d.id }); });
        S.docs = m; versionDocs++; S.etat = 'ok'; appliquerPfmp();
        if (!modePlanning) lsEcrit(K_CACHE, { annee: S.annee, docs: [...m.values()] });
        verifierSession(); rendre({ donnees: true });
      }, err => {
        if (!simple && err && err.code === 'failed-precondition') { try { arret && arret(); } catch (e) { } console.warn('Index Firestore absent : lecture de toute l’année.', err.message || ''); ecouter(true); return; }
        S.etat = typeErreur(err) === 'refus' ? 'refus' : 'horsligne'; rendre({ donnees: true }); });
    } catch (e) { S.etat = 'horsligne'; }
  }
  let estEcoute = false;
  function ecouterEstimations() {
    if (estEcoute || erreur || !FS) return; estEcoute = true;
    try {
      FS.onSnapshot(FS.query(FS.collection(db, COL_ESTIMATION), FS.where('annee', '==', S.annee)), snap => {
        let cadre = null; const l = []; S.estDocs = new Map();
        snap.forEach(d => { const x = d.data() || {}; if(x.type === 'cours') S.estDocs.set(d.id,x); if (x.type === 'cadre' && (x.id || d.id) === 'cadre_' + S.annee) cadre = x; else if (x.type === 'cours' && x.statut === 'active') l.push({ ...x, id: x.id || d.id }); });
        S.cadreEstBrut = cadre; S.cadreEst = cadre && cadre.periode ? cadre.periode : null;
        S.est = S.cadreEst ? l.filter(x => !x.periode || x.periode.debut === S.cadreEst.debut) : l;
        S.estEtat = 'ok'; rendre({ donnees: true });
      }, () => { S.estEtat = 'horsligne'; rendre({ donnees: true }); });
    } catch (e) { S.estEtat = 'horsligne'; }
  }
  const codeDe = id => { const d = S.docs.get('pole_' + id); return d && /^\d{4}$/.test(d.code || '') ? d.code : pole(id).codeDepart; };
  function verifierSession() {
    if (modePlanning) {
      if (S.session && droitsPlanning?.sessionValide && !droitsPlanning.sessionValide(S.docs.get('pole_PSR_MELEC'))) {
        S.session = null; droitsPlanning = null; S.feuille = null;
        S.route = {e:'code',p:{}}; S.codeMsg = 'Le code a changé ou l’accès a été désactivé.';
        history.replaceState({e:'code',p:{},n:S.n},'');
      }
      return;
    }
    if (!S.session || S.etat !== 'ok') return;
    if (codeDe(S.session.pole) !== S.session.code) {
      S.session = null; lsEcrit(K_SESSION, null);
      if (!['humeur', 'code'].includes(S.route.e)) { S.route = { e: 'code', p: {} }; S.codeMsg = 'Le code du pôle a changé. Tapez le nouveau code.'; history.replaceState({ e: 'code', p: {}, n: S.n }, ''); }
    }
  }
  const P = () => pole(S.vu || (S.session && S.session.pole)) || POLES[0];
  /* « Mon emploi du temps est complet jusqu'au … » : porté par le document du pôle. Périmé une fois la date passée. */
  const poleComplet = (pid, lundi) => { const d = S.docs.get('pole_' + pid), c = d && d.complet; const ref = lundi || S.lundi || K.isoLocal(); return c && K.RE_DATE.test(c.jusquau || '') && c.jusquau >= ref ? c : null; };
  const avatarDe = pid => { const d = S.docs.get('pole_' + pid); return d && d.avatar ? AV.normaliser(d.avatar) : null; };
  const humeurDe = () => null;
  /* Petit avatar (ou pastille du pôle tant qu'il n'est pas choisi). */
  const avatarHtml = (pid, taille, o = {}) => { const a = avatarDe(pid), q = pole(pid) || POLES[0]; return a ? AV.svgAvatar(a, { humeur: o.humeur === undefined ? humeurDe(pid) : o.humeur, taille, label: `référent ${q.nom}`, classe: o.classe }) : `<span class="sigle" style="--pole:${q.couleur};width:${taille}px;height:${taille}px;font-size:${Math.max(9, taille * .3)}px" aria-label="référent ${esc(q.nom)}">${esc(q.nom.replace(/[^A-Z]/g, '').slice(0, 3) || q.nom.slice(0, 2))}</span>`; };
  /* Le document du pôle regroupe code, « complet », avatar et humeur : on écrit toujours l'ensemble. */
  const ecrirePole = (pid, patch) => ecrireTransaction('pole_' + pid, serveur => { const d = serveur || S.docs.get('pole_' + pid) || {};
    return { id: 'pole_' + pid, type: 'pole', pole: pid, code: /^\d{4}$/.test(d.code || '') ? d.code : codeDe(pid), complet: d.complet || null, avatar: d.avatar || null, humeur: d.humeur || null, pfmp: d.pfmp || null, ...(d.accesPlanning ? {accesPlanning:d.accesPlanning} : {}), ...(d.creeLe ? { creeLe: d.creeLe } : {}), ...patch }; });
  /* PFMP saisies par les référents (document du pôle, champ pfmp) : elles remplacent celles du fichier pour la classe. */
  const PFMP_FICHIER = {};
  function appliquerPfmp() {
    Object.entries(S.edt.classes).forEach(([nom, k]) => { if (!PFMP_FICHIER[nom]) PFMP_FICHIER[nom] = k.pfmp || []; k.pfmp = PFMP_FICHIER[nom]; });
    POLES.forEach(q => { const d = S.docs.get('pole_' + q.id), m = d && d.pfmp; if (!m || typeof m !== 'object') return;
      Object.entries(m).forEach(([nom, l]) => { const k = S.edt.classes[nom]; if (!k || !classesDu(q.id).includes(nom) || !Array.isArray(l)) return; k.pfmp = l.filter(x => x && K.RE_DATE.test(x.debut || '') && K.RE_DATE.test(x.fin || '') && x.fin >= x.debut).map(x => ({ debut: x.debut, fin: x.fin, label: String(x.label || 'PFMP').slice(0, 30) })); k.pfmpSaisies = true; }); });
    versionDocs++;
  }
  const etatPole = pid => { const c = poleComplet(pid); return c ? `complet jusqu’au ${K.jjmm(c.jusquau)}` : 'saisie en cours'; };
  /* Une alerte lisible, avec l'explication et le bouton pour écrire à l'autre référent. */
  function carteAlerte(a, x, i, prefix) {
    const autres = [...new Set((x.poles || []).filter(q => q !== P().id))];
    const cours = (x.cours || []).find(c => c.pole === P().id) || (x.cours || [])[0];
    const cls = cours && cours.cls ? cours.cls.find(n => classesDu(P().id).includes(n)) : null;
    return `<div class="alerte ${x.type === 'couvrir' ? 'warn' : ''}" id="${prefix}-${i}" style="display:grid;grid-template-columns:auto minmax(0,1fr);gap:6px 12px;align-items:start">
      <button type="button" class="sigle" style="width:38px;height:38px;font-size:.82rem;border:0;cursor:pointer" data-a="fiche" data-v="${esc(a.id)}" aria-label="Fiche de ${esc(a.sigle)}">${esc(a.sigle)}</button>
      <span><b>${esc(a.sigle)}</b> · ${esc(x.texte)}
        <span class="ligne" style="margin-top:6px;gap:6px">${cours && cls ? `<button type="button" class="btn petit" data-a="edt-cours" data-v="${esc(cls)}|${esc(cours.id)}">Voir le cours</button>` : ''}
        ${autres.map(q => `<button type="button" class="btn petit" data-a="ecrire-a" data-v="${esc(q)}" data-sujet="${esc(a.sigle)}|${esc(x.texte)}">✉️ Écrire au référent ${esc(nomPole(q))}</button>`).join('')}</span></span></div>`;
  }
  function carteDisponibles(titre) {
    const p = P(), l = K.disponiblesAilleurs(ctx(), p.id, S.lundi, poleComplet);
    if (!l.length) return '';
    return `<div class="carte pad" style="display:grid;gap:10px"><div><h2>${esc(titre || 'Disponibles ailleurs')}</h2><span class="muted" style="font-size:.9rem">AESH des autres pôles qui ont encore des heures. Placez-les sur vos cours : ça compte dans ${esc(p.nom)}, et leur référent le voit.</span></div>
      ${l.slice(0, 6).map(x => { const pa = pole(Object.keys(x.a.equipes || {})[0]) || p;
        return `<button type="button" class="aesh" id="dispo-${esc(x.a.id)}" data-a="fiche" data-v="${esc(x.a.id)}"><span class="sigle" style="--pole:${pa.couleur}">${esc(x.a.sigle)}</span>
          <span class="det"><b>${K.fmtH(x.dispo)} disponibles</b><span class="leg">${x.complets.map(c => `<span><em style="background:${(pole(c.p) || p).couleur}"></em>${esc(nomPole(c.p))} · ${c.complet ? 'complet' : 'saisie en cours'}</span>`).join('')}</span>
            ${x.libres.length ? `<span class="muted" style="font-size:.85rem">Libre : ${esc(x.libres.slice(0, 6).map(y => y.texte).join(' · '))}${x.libres.length > 6 ? ' …' : ''}</span>` : '<span class="muted" style="font-size:.85rem">Aucune demi-journée libre cette semaine</span>'}</span>
          <span class="droite">${x.soldeRep > 1e-9 ? `<span class="puce ok">${K.fmtH(x.soldeRep)} non réparties</span>` : ''}${x.fiable && x.nonPlace > 1e-9 ? `<span class="puce ok">${K.fmtH(x.nonPlace)} non placées</span>` : ''}${!x.fiable && x.nonPlace > 1e-9 ? `<span class="puce warn" title="Le référent n’a pas encore déclaré son emploi du temps complet">${K.fmtH(x.nonPlace)} non placées · à confirmer</span>` : ''}</span></button>`; }).join('')}</div>`;
  }
  function carteComplet() {
    const p = P(), c = poleComplet(p.id);
    return `<div class="carte pad" style="display:grid;gap:8px"><div class="ligne ecarte"><div><h2>Mon emploi du temps</h2><span class="muted" style="font-size:.9rem">${c ? `Déclaré complet jusqu’au ${esc(K.dateCourte(c.jusquau))}. Les autres référents peuvent compter sur les heures libres de vos AESH.` : 'Quand vos AESH sont tous placés, dites-le : les autres référents sauront que les heures libres sont fiables.'}</span></div>
      ${c ? `<button type="button" class="btn" id="complet-non" data-a="complet-non">Reprendre la saisie</button>` : `<button type="button" class="btn pri" id="complet-oui" data-a="complet">✓ Mon emploi du temps est complet</button>`}</div></div>`;
  }
  const classesDu = pid => modePlanning ? (droitsPlanning?.lectureClasses || []).filter(n => S.edt.classes[n]?.pole === pid) : (S.edt.poles[pid] || []);
  const peutPlacer = nom => !modePlanning || !!droitsPlanning?.ecritureClasses.includes(nom);
  /* 25/09/2026 — Le coordonnateur AESH n'est plus en consultation : il tient les fiches, les
     absences, les réunions, les PFMP et la période comme un référent. Seuls ses placements
     restent bornés aux classes de ecritureClasses. */
  const accesComplet = () => !modePlanning || droitsPlanning?.tousDroits === true;

  /* ─── Période de l'emploi du temps (17/09/2026, décision de Brahim) ───
     Une seule période pour les quatre pôles : c'est ce qui permet aux emplois du temps de se croiser.
     Par défaut jusqu'aux vacances de Noël ; si un référent l'étend, elle est étendue pour tout le monde. */
  function periodesPossibles() {
    const avant = debut => { let f = K.ajoute(debut, -1); while (K.jourSemaine(f) > 4 || S.C.off(f)) f = K.ajoute(f, -1); return f; };
    const out = S.C.vacances.filter(v => /^Vacances/.test(v.label) && !/été/i.test(v.label))
      .map(v => ({ id: 'v-' + v.debut, label: `Jusqu’aux ${v.label.charAt(0).toLowerCase()}${v.label.slice(1)}`, fin: avant(v.debut) }));
    const ete = S.C.vacances.find(v => /été/i.test(v.label));
    out.push({ id: 'annee', label: 'Fin de l’année scolaire', fin: ete ? avant(ete.debut) : '2027-07-02' });
    return out;
  }
  const periodeDefaut = () => { const l = periodesPossibles(), noel = l.find(x => /noël/i.test(x.label)); return (noel || l[l.length - 1]).fin; };
  const periodeEdt = () => { const d = S.docs.get('periode_' + S.annee); return d && K.RE_DATE.test(d.jusquau || '') ? d.jusquau : periodeDefaut(); };
  const periodePar = () => { const d = S.docs.get('periode_' + S.annee); return d && d.par ? d.par : ''; };
  function lignePeriode() {
    const fin = periodeEdt(), qui = periodePar();
    return `<div class="ligne ecarte" style="gap:8px"><span class="muted" style="font-size:.9rem">Période de l’emploi du temps : <b style="color:var(--ink)">jusqu’au ${esc(K.dateLongue(fin))}</b>${qui && qui !== P().id ? ` · fixée par ${esc(nomPole(qui))}` : ''}</span>
      <button type="button" class="btn petit" id="per-edt" data-a="periode-edt">Modifier</button></div>`;
  }
  function feuillePeriode(f) {
    const l = periodesPossibles(), fin = f.fin;
    return teteFeuille('Période de l’emploi du temps', 'Jusqu’où on place les AESH. Elle vaut pour les quatre pôles : c’est ce qui permet aux emplois du temps de se croiser.') + `
      <div class="choix" role="group" aria-label="Jusqu’à">${l.map(r => `<button type="button" id="pe-${r.id}" data-a="per-choix" data-v="${esc(r.fin)}" aria-pressed="${fin === r.fin}">${esc(r.label)} <span class="muted">(${K.jjmm(r.fin)})</span></button>`).join('')}</div>
      <div class="ligne"><label for="pe-date" class="muted">Ou une date :</label><input type="date" id="pe-date" data-i="per-edt-date" value="${esc(fin)}"></div>
      <div class="actions"><button type="button" class="btn" id="pe-fermer" data-a="fermer">Annuler</button>
        <button type="button" class="btn valider" id="pe-valider" data-a="per-valider" ${K.RE_DATE.test(fin) && fin !== periodeEdt() ? '' : 'disabled'}>✓ Enregistrer</button></div>`;
  }

  /* ─────────── écritures ─────────── */
  async function ecrire(doc) {
    if(["absence","reunion"].includes(doc.type)) return (await ecrireLot([doc],new Map(S.docs))).find(d=>d.id===doc.id);
    const prec = S.docs.get(doc.id), maintenant = new Date().toISOString();
    const d = { ...doc, annee: S.annee, version: ((prec && prec.version) || 0) + 1, majLe: maintenant, par: S.session ? S.session.pole : '' };
    delete d.depart;
    if (!d.creeLe) d.creeLe = (prec && prec.creeLe) || maintenant;
    const contenu = JSON.stringify(d);
    if (contenu.length > 20000) throw Object.assign(new Error('trop volumineux'), { code: 'volume' });
    const hid = 'hist_' + alea(), hist = { id: hid, type: 'hist', annee: S.annee, de: d.id, typeDe: d.type, version: d.version, majLe: maintenant, par: d.par, contenu };
    /* Rien ne s'efface : la copie d'historique et le document partent ensemble (lot atomique), ou l'historique d'abord. */
    if (typeof FS.writeBatch === 'function') { const b = FS.writeBatch(db); b.set(FS.doc(db, COL_HIST, hid), hist); b.set(FS.doc(db, COLLECTION, d.id), d); await avecDelai(b.commit()); }
    else { await avecDelai(FS.setDoc(FS.doc(db, COL_HIST, hid), hist)); await avecDelai(FS.setDoc(FS.doc(db, COLLECTION, d.id), d)); }
    S.docs.set(d.id, d); versionDocs++;
    return d;
  }
  async function ecrireTout(docs) { for (const d of docs) await ecrire(d); }
  /* Écriture en transaction (audit C01/C03/C05, 18/09) : le document est RELU sur le serveur au moment d'écrire,
     puis « construire » décide à partir de cette version-là. Deux référents qui enregistrent à la même seconde ne
     s'écrasent plus ; si les deux ont changé la même chose, « construire » lève un conflit et rien n'est écrit. */
  async function ecrireTransaction(id, construire) {
    if (typeof FS.runTransaction !== 'function') return ecrire(construire(S.docs.get(id) || null));
    const ref = FS.doc(db, COLLECTION, id); let ecrit = null;
    await avecDelai(FS.runTransaction(db, async tx => {
      const snap = await tx.get(ref), serveur = snap.exists() ? snap.data() : null;
      const doc = construire(serveur), maintenant = new Date().toISOString();
      const d = { ...doc, id, annee: S.annee, version: ((serveur && serveur.version) || 0) + 1, majLe: maintenant, par: S.session ? S.session.pole : '' };
      delete d.depart; if (!d.creeLe) d.creeLe = (serveur && serveur.creeLe) || maintenant;
      Object.keys(d).forEach(k => { if (d[k] === undefined) delete d[k]; });
      const contenu = JSON.stringify(d);
      if (contenu.length > 20000) throw Object.assign(new Error('trop volumineux'), { code: 'volume' });
      const hid = 'hist_' + alea();
      tx.set(FS.doc(db, COL_HIST, hid), { id: hid, type: 'hist', annee: S.annee, de: d.id, typeDe: d.type, version: d.version, majLe: maintenant, par: d.par, contenu });
      tx.set(ref, d); ecrit = d;
    }));
    S.docs.set(ecrit.id, ecrit); versionDocs++;
    return ecrit;
  }
  /* Écriture groupée (audit P01, 18/09) : tous les documents d'une opération — et leurs copies d'historique —
     partent dans UN seul lot. Une panne au milieu laisse tout inchangé : jamais de placement coupé à moitié. */
  async function ecrireLot(docs, base) {
    if (modePlanning && docs.some(d => {
      if (d.type !== 'place') return !accesComplet();
      const classes = S.edt.cours[d.coursId]?.cls;
      return !Array.isArray(classes) || !classes.length || !classes.every(peutPlacer);
    })) {
      throw Object.assign(new Error('Consultation uniquement'),{code:'permission-denied'});
    }
    if ((docs || []).some(d => ['place','absence','reunion'].includes(d.type))) {
      const resultat = await avecDelai(enregistrerPlanning({ FS, db, collection:COLLECTION, historique:COL_HIST,
        docs, base:base || new Map(S.docs), annee:S.annee, par:S.session ? S.session.pole : '', nouvelId:alea, maintenant:new Date().toISOString() }));
      resultat.forEach(d => S.docs.set(d.id,d)); versionDocs++;
      return resultat;
    }
    const parId = new Map(); (docs || []).forEach(x => { if (x && x.id) parId.set(x.id, x); });
    const liste = [...parId.values()]; if (!liste.length) return [];
    if (liste.length === 1 || typeof FS.writeBatch !== 'function') { const out = []; for (const x of liste) out.push(await ecrire(x)); return out; }
    const maintenant = new Date().toISOString(), prets = [];
    for (const doc of liste) {
      const prec = S.docs.get(doc.id);
      const d = { ...doc, annee: S.annee, version: ((prec && prec.version) || 0) + 1, majLe: maintenant, par: S.session ? S.session.pole : '' };
      delete d.depart; if (!d.creeLe) d.creeLe = (prec && prec.creeLe) || maintenant;
      Object.keys(d).forEach(k => { if (d[k] === undefined) delete d[k]; });
      const contenu = JSON.stringify(d);
      if (contenu.length > 20000) throw Object.assign(new Error('trop volumineux'), { code: 'volume' });
      prets.push({ d, hist: { id: 'hist_' + alea(), type: 'hist', annee: S.annee, de: d.id, typeDe: d.type, version: d.version, majLe: maintenant, par: d.par, contenu } });
    }
    if (prets.length * 2 > 480) throw Object.assign(new Error('trop d’écritures'), { code: 'volume' });
    const b = FS.writeBatch(db);
    prets.forEach(({ d, hist }) => { b.set(FS.doc(db, COL_HIST, hist.id), hist); b.set(FS.doc(db, COLLECTION, d.id), d); });
    await avecDelai(b.commit());
    prets.forEach(({ d }) => S.docs.set(d.id, d)); versionDocs++;
    return prets.map(x => x.d);
  }

  /* ─────────── navigation (flèches du navigateur) ─────────── */
  function aller(e, p = {}, o = {}) {
    if (modePlanning && S.session && !['edt','code'].includes(e)) e = 'edt';
    S.route = { e, p }; S.menu = false;
    if (S.feuille) { S.feuille = null; history.replaceState({ e, p, n: S.n }, ''); }
    else if (o.remplacer) history.replaceState({ e, p, n: S.n }, '');
    else { S.n++; history.pushState({ e, p, n: S.n }, ''); }
    rendre({ haut: true });
  }
  function retour() { if (S.n > 0 && history.state && history.state.n > 0) history.back(); else aller('accueil', {}, { remplacer: true }); }
  function ouvrir(f) { S.feuille = f; S.menu = false; history.pushState({ ...S.route, n: S.n, f: 1 }, ''); rendre({ focus: 'f-titre' }); }
  function fermer() { if (!S.feuille) return; S.feuille = null; S.ignorePop++; history.back(); rendre(); }
  window.addEventListener('popstate', ev => {
    if (S.ignorePop > 0) { S.ignorePop--; if (S.apresPop) { const f = S.apresPop; S.apresPop = null; f(); } return; }
    const st = ev.state;
    if (S.feuille && !(st && st.f)) { if (S.envoi) { history.pushState({ ...S.route, n: S.n, f: 1 }, ''); return; } restaurerFilieres(S.feuille); S.feuille = null; rendre(); return; }
    S.feuille = null; S.menu = false;
    if (!st || !st.e) { S.route = { e: S.session ? 'accueil' : 'code', p: {} }; S.n = 0; rendre({ haut: true }); return; }
    S.n = st.n || 0;
    S.route = { e: st.e, p: st.p || {} };
    if (!S.session && !['humeur', 'code'].includes(st.e)) S.route = { e: 'code', p: {} };
    rendre({ haut: true });
  });

  /* ─────────── rendu ─────────── */
  let toastT = null;
  function toast(t, err) { S.toast = { t, err }; rendre(); clearTimeout(toastT); toastT = setTimeout(() => { S.toast = null; rendre(); }, err ? 4200 : 1800); annonce(t); }
  function annonce(t) { const a = document.getElementById('annonce'); if (a) { a.textContent = ''; setTimeout(() => { a.textContent = t; }, 30); } }
  function rendre(o = {}) {
    const actif = document.activeElement, idActif = actif && racine.contains(actif) ? actif.id : null, y = window.scrollY;
    let sel = null; try { if (actif && typeof actif.selectionStart === 'number') sel = [actif.selectionStart, actif.selectionEnd]; } catch (e) { }
    document.documentElement.style.setProperty('--pole', P().couleur);
    const e = modePlanning && S.session ? 'edt' : S.route.e;
    let html;
    if (e === 'humeur') html = ecranHumeur();
    else if (e === 'code' || !S.session) html = ecranCode();
    else html = `${entete()}<main class="corps" id="contenu" ${S.feuille ? 'inert' : ''}>${bandeauEtat()}${(ECRANS[e] || ECRANS.accueil)()}</main>`;
    if (S.feuille) html += feuille();
    if (S.toast) html += `<div class="toast ${S.toast.err ? 'err' : ''}" role="status">${esc(S.toast.t)}</div>`;
    const decalages=[...racine.querySelectorAll('.planning-horizontal,.comparaison-semaine > .defile')].map(el=>el.scrollLeft);
    racine.innerHTML = html;
    racine.querySelectorAll('.planning-horizontal,.comparaison-semaine > .defile').forEach((el,i)=>{el.scrollLeft=decalages[i]||0;});
    document.title = `${TITRES[e] || 'Référents de pôle'} — Référents de pôle AESH`;
    const f = o.focus && document.getElementById(o.focus);
    if (f) { f.focus({ preventScroll: !o.haut }); if (sel && f.id === idActif) try { f.setSelectionRange(sel[0], sel[1]); } catch (x) { } }
    else if (idActif) { const el = document.getElementById(idActif); if (el) { el.focus({ preventScroll: true }); if (sel) try { el.setSelectionRange(sel[0], sel[1]); } catch (x) { } } }
    if (o.haut) window.scrollTo(0, 0); else if (o.donnees || !o.focus) window.scrollTo(0, y);
    apresRendu();
  }
  const TITRES = { humeur: 'Bonjour', code: 'Code', accueil: 'Accueil', aesh: 'Mes AESH', fiche: 'AESH', absence: 'Absences et formations', reunions: 'Réunions institutionnelles', edt: 'Emploi du temps', ensemble: 'Vue d’ensemble', besoins: 'Besoins', eleves: 'Élèves', messages: 'Messages', exporter: 'Exporter', moncode: 'Mon code', avatar: 'Mon avatar' };
  function apresRendu() {
    if (S.route.e === 'messages') { const f = document.getElementById('fil-fin'); if (f && !apresRendu.vu) { f.scrollIntoView({ block: 'end' }); apresRendu.vu = true; } marquerLus(); }
    else apresRendu.vu = false;
  }

  function bandeauEtat() {
    if (S.etat === 'refus') return `<div class="bandeau warn" role="alert">Espace en cours d’ouverture par la coordination : consultation possible, enregistrement pas encore autorisé.</div>`;
    if (S.etat === 'horsligne') return `<div class="bandeau warn" role="alert">Pas de connexion au serveur : les données affichées sont celles de la dernière visite.</div>`;
    return '';
  }
  function entete() {
    if (modePlanning) return `<header class="tete"><div class="tete-in"><div class="marque"><b>Emplois du temps</b></div><button class="btn petit" data-a="sortir">Se déconnecter</button></div></header>`;
    const e = S.route.e, nonLus = messagesNonLus();
    const ong = [['accueil', 'Accueil'], ['aesh', 'Mes AESH'], ['edt', 'Emploi du temps'], ['ensemble', 'Vue d’ensemble'], ['besoins', 'Besoins'], ['eleves', 'Élèves'], ['messages', 'Messages'], ['exporter', 'Exporter']];
    const actif = { fiche: 'aesh', absence: 'aesh', reunions: 'aesh', moncode: 'accueil' }[e] || e;
    const coord = S.session && pole(S.session.pole).coordination;
    return `<header class="tete"><div class="tete-in">
      ${e !== 'accueil' ? `<button type="button" class="rond" id="t-retour" data-a="retour" aria-label="Retour" title="Retour">←</button>` : ''}
      <div class="marque"><b>Référents de pôle</b><button type="button" class="chip-pole chip-av" id="t-avatar" data-a="menu" title="${esc(P().sous)}" aria-label="Menu du pôle ${esc(P().nom)}">${avatarHtml(P().id, 28, { classe: 'tete-av' })}${esc(P().nom)}</button></div>
      <button type="button" class="rond rel" id="t-messages" data-a="aller" data-v="messages" aria-label="Messages${nonLus ? `, ${nonLus} nouveau${nonLus > 1 ? 'x' : ''}` : ''}" title="Messages">💬${nonLus ? `<span class="badge">${nonLus}</span>` : ''}</button>
      ${e !== 'accueil' ? `<button type="button" class="rond" id="t-accueil" data-a="aller" data-v="accueil" aria-label="Accueil" title="Accueil">⌂</button>` : ''}
      <button type="button" class="rond" id="t-menu" data-a="menu" aria-label="Menu" aria-expanded="${S.menu}" title="Menu">⋯</button>
    </div>
    <nav class="onglets" aria-label="Sections">${ong.map(([k, l]) => `<button type="button" id="o-${k}" data-a="aller" data-v="${k}" ${actif === k ? 'aria-current="page"' : ''}>${l}</button>`).join('')}</nav>
    ${S.menu ? `<div class="menu" role="menu">
      ${S.vu && S.vu !== S.session.pole ? '' : `<button type="button" role="menuitem" id="m-avatar" data-a="aller" data-v="avatar">🙂 ${avatarDe(S.session.pole) ? 'Changer mon avatar' : 'Choisir mon avatar'}</button>`}
      <button type="button" role="menuitem" id="m-code" data-a="aller" data-v="moncode">🔑 Changer mon code</button>
      <button type="button" role="menuitem" id="m-lien" data-a="partager">✉️ Envoyer le lien à mes collègues</button>
      <button type="button" role="menuitem" id="m-fond" data-a="fond">${document.documentElement.dataset.fond === 'blanc' ? '◐ Fond clair' : '○ Fond blanc'}</button>
      ${coord ? `<hr><div style="padding:6px 12px 2px;font-size:.8rem;color:var(--muted);font-weight:700">Voir un pôle</div>${POLES.map(p => `<button type="button" role="menuitem" id="m-vu-${p.id}" data-a="vu" data-v="${p.id}"><span class="chip-pole" style="--pole:${p.couleur}"><i></i>${esc(p.nom)}</span>${P().id === p.id ? ' ✓' : ''}</button>`).join('')}` : ''}
      <hr><button type="button" role="menuitem" id="m-sortir" data-a="sortir">↩︎ Se déconnecter</button></div>` : ''}
    </header>`;
  }

  /* ─────────── entrée : humeur, pensée, code ─────────── */
  function penseeDuJour() {
    const m = lsLit(K_PENSEES, { jour: '', i: -1, vues: [] }), auj = K.isoLocal();
    if (m.jour === auj && PENSEES[m.i]) return PENSEES[m.i];
    let vues = Array.isArray(m.vues) ? m.vues : [], libres = PENSEES.map((_, i) => i).filter(i => !vues.includes(i));
    if (!libres.length) { vues = []; libres = PENSEES.map((_, i) => i); }
    const i = libres[Math.floor(Math.random() * libres.length)]; vues.push(i);
    lsEcrit(K_PENSEES, { jour: auj, i, vues }); return PENSEES[i];
  }
  function ecranHumeur() {
    const [t, a] = penseeDuJour(), h = S.humeur;
    return `<main class="entree">
      <div><h1 id="titre" tabindex="-1">Bonjour</h1><p class="sous">Comment vous sentez-vous aujourd’hui ?</p></div>
      <div class="emos" role="group" aria-label="Comment vous sentez-vous ?">${HUMEURS.map(([e, l], i) => `<button type="button" id="h-${i}" data-a="humeur" data-v="${i}" aria-pressed="${h === i}" aria-label="${l}"><span class="e" aria-hidden="true">${e}</span><span class="l">${l}</span></button>`).join('')}</div>
      <p class="mot-humeur" role="status">${h != null ? esc(HUMEURS[h][2]) : ''}</p>
      <figure class="pensee" style="margin:0"><blockquote>« ${esc(t.replace(/'/g, '’'))} »</blockquote><p>${esc(a)}</p></figure>
      <div style="display:grid;gap:12px;justify-items:center"><button type="button" class="btn" id="h-entrer" data-a="entrer">${h != null ? 'Entrer' : 'Passer'} ›</button></div>
    </main>`;
  }
  function ecranCode() {
    return `<main class="entree">
      <div><h1 id="titre" tabindex="-1">${modePlanning ? "Emplois du temps" : "Référents de pôle"}</h1><p class="sous">${modePlanning ? "Votre code à quatre chiffres" : "Code du pôle"}</p></div>
      <div class="plots ${S.codeErr ? 'err' : ''}" aria-hidden="true">${Array.from({length:4},(_,i)=>i).map(i => `<span class="plot ${i < S.code.length ? 'on' : ''}">${i < S.code.length ? '•' : ''}</span>`).join('')}</div>
      <p class="msg-code" role="status" id="code-msg">${esc(S.codeMsg)}</p>
      <div class="pave" role="group" aria-label="Pavé numérique">${['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map(k => k ? `<button type="button" id="k-${k === '⌫' ? 'eff' : k}" data-a="touche" data-v="${k}" class="${k === '⌫' ? 'fn' : ''}" aria-label="${k === '⌫' ? 'Effacer' : k}">${k}</button>` : '<span></span>').join('')}</div>
      ${modePlanning ? '' : '<button type="button" class="lien" data-a="aller-humeur" id="c-humeur">‹ Retour</button>'}
    </main>`;
  }
  async function tapeCode(k) {
    if (S.authEnCours) return;
    S.codeErr = false; S.codeMsg = '';
    if (k === '⌫') S.code = S.code.slice(0, -1); else if (/^\d$/.test(k) && S.code.length < (4)) S.code += k;
    if (S.code.length === (4)) {
      if (modePlanning) {
        S.authEnCours = true; S.codeMsg = 'Vérification…'; rendre();
        try {
          droitsPlanning = await ouvrirAccesPlanning(S.code);
          S.session = {pole:droitsPlanning.pole}; S.code = ''; S.vu = null;
          ecouter(); ecouterEstimations(); aller('edt',{}, {remplacer:true});
        } catch(e) { S.code = ''; S.codeErr = true; S.codeMsg = e.message || 'Accès indisponible.'; }
        finally { S.authEnCours = false; rendre(); }
        return;
      }
      if (S.etat === 'chargement') { S.codeMsg = 'Vérification…'; rendre(); setTimeout(() => { if (S.code.length === 4) tapeCode(''); }, 600); return; }
      const p = POLES.find(x => codeDe(x.id) === S.code);
      if (p) {
        S.session = { pole: p.id, code: S.code }; lsEcrit(K_SESSION, S.session); S.code = ''; S.vu = null;
        ecouterEstimations(); publierHumeur();
        if (!avatarDe(p.id) && S.etat === 'ok') { S.form = null; aller('avatar', { premiere: 1 }, { remplacer: true }); } else aller('accueil', {}, { remplacer: true }); return;
      }
      S.codeErr = true; S.codeMsg = 'Code inconnu'; S.code = '';
    }
    rendre();
  }

  /* ─────────── semaines ─────────── */
  function selecteurSemaine(id = 'sem') {
    const s = S.C.semaine(S.lundi), v = K.ajoute(S.lundi, 4);
    const lib = s.toute ? (s.jours[0].off || 'Vacances') : `${K.dateCourte(S.lundi)} – ${K.dateCourte(v)}`;
    return `<div class="semaine" role="group" aria-label="Semaine affichée">
      <button type="button" id="${id}-prec" data-a="semaine" data-v="-7" aria-label="Semaine précédente" title="Semaine précédente">‹</button>
      <span><span class="ab ${s.parite ? '' : 'vac'}" title="${s.parite ? 'Semaine ' + s.parite : 'Pas de cours'}">${s.parite || '·'}</span>${esc(lib)}</span>
      <button type="button" id="${id}-suiv" data-a="semaine" data-v="7" aria-label="Semaine suivante" title="Semaine suivante">›</button>
      ${S.lundi !== semaineParDefaut() ? `<button type="button" id="${id}-auj" data-a="semaine" data-v="0" aria-label="Cette semaine" title="Cette semaine" style="width:auto;padding:0 10px;border-radius:999px;font-size:.85rem;font-weight:700">Auj.</button>` : ''}
    </div>`;
  }

  /* ─────────── outils de calcul pour l'affichage ─────────── */
  function bilans(pid) { const c = ctx(); return K.aeshActifs(c.I, pid).map(a => ({ a, b: K.bilan(c, a.id, S.lundi) })); }
  /* Les placements en cours à cette date — pas ceux d'un AESH dont le contrat est fini (audit D01). */
  function placesCours(coursId, iso) {
    const I = idx(); return I.places.filter(p => p.coursId === coursId && K.placementPrevu(S.C, S.edt.cours[coursId], p, iso) && (!p.renfortPfmp || K.placementALieu(ctx(), p, iso)) && !K.contratFini(I.aesh.get(p.aeshId), iso));
  }
  /* Placé ici, cette semaine : en cours le jour du cours. Un placement qui commence plus tard est « à venir » :
     il ne compte pas comme déjà placé et n'est jamais modifié sans le dire (audit D12). */
  const placeIci = (x, c, du) => x.coursId === c.id && K.placementPrevu(S.C, c, x, K.ajoute(du, c.j)) && (!x.renfortPfmp || K.placementALieu(ctx(),x,K.ajoute(du,c.j)));
  const placeAVenir = (x, c, du) => x.coursId === c.id && x.du > K.ajoute(du, c.j);
  /* Présents au pire moment de la plage estimée : 30 min placées sur 3 h ne font pas « couvert » (audit D02). */
  const presents = (c, iso, bes) => K.presentsMin(ctx(), c, iso, bes && bes.plageDebut, bes && bes.plageFin);
  const quand = (iso) => ({ iso, parite: S.C.semaine(K.lundiDe(iso)).parite });
  function jaugeAesh(a) {
    const contrat = nombre(a.contrat), parts = [];
    Object.keys(a.equipes || {}).forEach(q => { const h = nombre((a.heures || {})[q]); if (h) parts.push([`${nomPole(q)} ${K.fmtH(h)}`, h, (pole(q) || P()).couleur]); });
    K.servicesDe(a).forEach(x => parts.push([`${x.nom.toLowerCase()} ${K.fmtH(x.h)}`, x.h, '#94a3b8']));
    if (K.heuresReunion(a)) parts.push([`réunion ${K.fmtH(K.heuresReunion(a))}`, K.heuresReunion(a), '#cbd5e1']);
    const tot = Math.max(contrat || 0, parts.reduce((s, p) => s + p[1], 0)) || 1;
    return `<div class="jauge" aria-hidden="true">${parts.map(p => `<i style="width:${p[1] / tot * 100}%;background:${p[2]}"></i>`).join('')}</div>
      <div class="leg">${parts.map(p => `<span><em style="background:${p[2]}"></em>${esc(p[0])}</span>`).join('')}</div>`;
  }
  const aCompleter = a => nombre(a.contrat) == null || nombre((a.heures || {})[P().id]) == null;

  /* ─── explications ⓘ (17/09/2026) : un mot simple, affiché seulement quand on le demande ─── */
  const AIDES = {
    contrat: 'Le total d’heures dues par semaine : présence élève, services (cantine, internat…), réunion, etc. Il est commun à tous les pôles où l’AESH travaille : on ne le compte qu’une fois.',
    presence: 'Les heures en classe avec les élèves, que vous notez vous-même : le contrat moins la réunion et les services. C’est ce qu’on place dans l’emploi du temps.',
    duree: 'Vide : son contrat couvre toute l’année, on n’y touche pas. Sinon, la date de fin : après elle, il n’est plus proposé dans l’emploi du temps, et ses placements s’arrêtent là.',
    jours: 'Par défaut, il travaille toute la semaine : on ne touche à rien. ✕ indisponible : c’est écrit dans son contrat, il ne travaille pas ce moment-là. ◐ souhait : il aimerait ne pas travailler ce moment-là. Dans les deux cas, on peut quand même le placer : c’est vous qui décidez.',
    reunion: 'La réunion d’équipe : son nombre d’heures par semaine, puis son jour et son heure. Elle ne se compte qu’une fois pour la semaine, même si l’AESH travaille dans deux pôles. Si un autre référent l’a déjà fixée, vous pouvez la changer : il le verra aussi.',
    intervient: 'Les filières et les classes où il intervient, et ses heures dans chacune. Votre filière est mise par défaut. « Tous les niveaux » : toutes les classes de la filière. Ce qu’il reste sur son contrat peut être pris par un autre pôle.'
  };
  /* Contrat, présence élève et réunion sont communs aux pôles : on dit d'où ils viennent, pour qu'on ne les compte pas deux fois. */
  const parQui = (a, champ) => { const q = (a.auteurs || {})[champ]; return q && q !== P().id ? `<small class="par-qui">${champ === 'reunion' ? 'Fixée' : 'Renseigné'} par le référent ${esc(nomPole(q))}</small>` : ''; };
  const aide = cle => `<button type="button" class="pt-aide" id="i-${cle}" data-a="info" data-v="${cle}" aria-expanded="${S.info === cle}" aria-label="Qu’est-ce que c’est ?">?</button>`;
  const aideTexte = cle => S.info === cle ? `<small class="aide">${esc(AIDES[cle] || '')}</small>` : '';
  /* « MELEC · Vannerie (CAP 1 Vannerie) » — une fiche ancienne, sans filières, affiche ses pôles. */
  function libFilieres(a) {
    if (!a) return '—';
    const fl = K.filieresDe(a);
    if (!fl) return Object.keys(a.equipes || {}).map(nomPole).join(' · ') || '—';
    const l = Object.keys(fl).map(id => { const f = filiere(id); if (!f) return null; const cl = fl[id].classes, h = nombre(fl[id].h);
      return `${f.nom}${h != null ? ' ' + K.fmtH(h) : ''}${cl && cl.length ? ` (${cl.map(n => S.edt.classes[n].court).join(', ')})` : ''}`; }).filter(Boolean);
    return l.join(' · ') || '—';
  }
  /* Heures encore à répartir sur sa présence élève : ce que les autres référents peuvent encore prendre. */
  function resteAPartir(a) {
    const presence = K.presenceEleve(a); if (presence == null) return null;
    /* Par pôle : les heures des filières quand elles sont toutes saisies, sinon le total déclaré du pôle.
       Jamais les deux à la fois : pas de double compte (audit D19). */
    const poles = new Set([...Object.keys(a.equipes || {}), ...Object.keys(K.polesDesFilieres(a, FILIERES, null))]);
    let somme = 0, saisi = false;
    poles.forEach(q => { const h = K.heuresPoleSaisie(a, S.form && S.form.orig, FILIERES, q); if (h != null) { somme += h; saisi = true; } });
    const reste = Math.round((presence - somme) * 100) / 100;
    if (!saisi && !reste) return null;
    return { reste, somme, presence,
      texte: reste > 1e-9 ? `${K.fmtH(somme)} réparties sur ${K.fmtH(presence)} de présence élève : <b>${K.fmtH(reste)} encore libres</b>, pour vous ou pour un autre pôle.`
        : reste < -1e-9 ? `${K.fmtH(somme)} réparties pour ${K.fmtH(presence)} de présence élève : <b>${K.fmtH(-reste)} de trop</b>.`
        : `${K.fmtH(presence)} entièrement réparties.` };
  }
  /* Pôle de l'équipe qui gère l'AESH : ce qu'il déclare, sinon le premier pôle où il intervient. */
  const rattachementDe = a => a.rattachement && (a.equipes || {})[a.rattachement] != null ? a.rattachement : Object.keys(a.equipes || {})[0] || P().id;

  /* ═══════════════════ ÉCRANS ═══════════════════ */
  const ECRANS = {
    eleves: ecranEleves,
    accueil() {
      const p = P(), bs = bilans(p.id), alertes = [];
      bs.forEach(({ a, b }) => (b.alertes || []).forEach(x => alertes.push({ a, x })));
      const prevu = bs.reduce((s, { a }) => s + (nombre((a.heures || {})[p.id]) || 0), 0), place = bs.reduce((s, { b }) => s + (b.parPole[p.id] || 0), 0);
      const incomplets = bs.filter(({ a }) => aCompleter(a)).length;
      const nb = besoinsResume(p.id), nonLus = messagesNonLus();
      const d = new Date(), auj = `${K.JOURS[(d.getDay() + 6) % 7] || ['Samedi', 'Dimanche'][d.getDay() === 6 ? 0 : 1]} ${d.getDate()} ${K.MOIS[d.getMonth()]}`;
      return `<div class="salut"><div><h1 id="titre" tabindex="-1">Bonjour</h1><p class="sous">${esc(auj)} · pôle ${esc(p.nom)}</p></div>${selecteurSemaine()}</div>
      ${alertes.length ? `<div class="alertes">${alertes.slice(0, 5).map(({ a, x }, i) => carteAlerte(a, x, i, 'al')).join('')}${alertes.length > 5 ? `<button type="button" class="lien" id="al-plus" data-a="aller" data-v="aesh">+ ${alertes.length - 5} autre${alertes.length - 5 > 1 ? 's' : ''}</button>` : ''}</div>` : ''}
      <div class="tuiles">
        <button type="button" class="tuile" id="tu-aesh" data-a="aller" data-v="aesh"><span class="ic">👥</span><span><b>Mes AESH</b><br><small>${bs.length} AESH · ${K.fmtH(prevu)} dans le pôle${incomplets ? ` · <span style="color:var(--warn);font-weight:700">${incomplets} à compléter</span>` : ''}</small></span></button>
        <button type="button" class="tuile forte" id="tu-edt" data-a="aller" data-v="edt"><span class="ic">🗓️</span><span><b>Emploi du temps</b><br><small>${prevu ? `${K.fmtH(place)} placées sur ${K.fmtH(prevu)} cette semaine` : `${K.fmtH(place)} placées · heures du pôle à compléter`}</small></span><div class="barre-p"><i style="width:${prevu ? Math.min(100, place / prevu * 100) : 0}%"></i></div></button>
        <button type="button" class="tuile" id="tu-ens" data-a="aller" data-v="ensemble"><span class="ic">🧭</span><span><b>Vue d’ensemble</b><br><small>Qui est où, jour par jour</small></span></button>
        <button type="button" class="tuile" id="tu-bes" data-a="aller" data-v="besoins"><span class="ic">📋</span><span><b>Besoins</b><br><small>${nb.estimes} cours avec un besoin renseigné${nb.manque ? ` · <span style="color:var(--warn);font-weight:700">${nb.manque} à couvrir</span>` : ''}</small></span></button>
        <button type="button" class="tuile" id="tu-msg" data-a="aller" data-v="messages"><span class="ic">💬</span><span><b>Messages</b><br><small>${nonLus ? `<span style="color:var(--err);font-weight:700">${nonLus} nouveau${nonLus > 1 ? 'x' : ''}</span>` : 'Entre référents'}</small></span></button>
        <button type="button" class="tuile" id="tu-exp" data-a="aller" data-v="exporter"><span class="ic">⬇️</span><span><b>Exporter</b><br><small>PDF · Excel</small></span></button>
      </div>
      ${lignePeriode()}
      ${carteReferents()}
      ${carteComplet()}
      ${carteDisponibles()}
      <div class="ligne"><button type="button" class="btn" id="acc-partager" data-a="partager">✉️ Envoyer le lien des besoins à mes collègues</button></div>`;
    },

    aesh() {
      const p = P(), bs = bilans(p.id);
      return `<div class="salut"><div><h1 id="titre" tabindex="-1">Mes AESH</h1><p class="sous">${esc(p.nom)} · heures par semaine</p></div>${selecteurSemaine()}</div>
      <div class="liste">${bs.map(({ a, b }) => {
        const hp = nombre((a.heures || {})[p.id]), pl = b.parPole[p.id] || 0;
        return `<button type="button" class="aesh" id="a-${esc(a.id)}" data-a="fiche" data-v="${esc(a.id)}">
          <span class="sigle">${esc(a.sigle)}</span>
          <span class="det"><b>${nombre(a.contrat) != null ? `Contrat ${K.fmtH(a.contrat)}` : 'Contrat à compléter'}${Object.keys(a.equipes || {}).length > 1 ? ` · partagé ${Object.keys(a.equipes).map(nomPole).join(' + ')}` : ''}</b>${jaugeAesh(a)}</span>
          <span class="droite"><span class="heures" title="Placées dans l’emploi du temps cette semaine / prévues dans le pôle">${K.fmtH(pl)} <small>/ ${hOu(hp)}</small></span>
            ${b.reste != null ? `<span class="puce ${b.reste < 0 ? 'err' : 'ok'}" title="Contrat moins tout ce qui est placé, services et réunion">reste ${K.fmtH(b.reste)}</span>` : ''}
            ${K.contratFini(a, K.isoLocal()) ? `<span class="puce err" title="Son contrat s’est arrêté le ${esc(K.dateLongue(a.finContrat))}">contrat terminé</span>` : ''}
            ${aCompleter(a) ? '<span class="puce warn">à compléter</span>' : ''}
            ${b.alertes.filter(x => x.type !== 'repartition' || true).slice(0, 2).map(x => `<span class="puce ${x.type === 'couvrir' ? 'warn' : 'err'}" title="${esc(x.texte)}">${x.type === 'conflit' ? 'conflit' : x.type === 'couvrir' ? 'à couvrir' : x.type === 'pole' ? 'pôle dépassé' : x.type === 'repartition' ? `${K.fmtH(-x.solde)} de trop` : 'dépassement'}</span>`).join('')}</span>
        </button>`;
      }).join('') || `<div class="etat-vide"><b>Aucun AESH dans ce pôle</b>Ajoutez le premier.</div>`}</div>
      <div class="ligne"><button type="button" class="btn pri" id="aesh-ajouter" data-a="fiche" data-v="nouveau">＋ Ajouter un AESH</button>
        <button type="button" class="btn" id="aesh-absence" data-a="aller" data-v="absence">Absence ou formation</button>
        <button type="button" class="btn" id="aesh-reunions" data-a="aller" data-v="reunions">Réunions institutionnelles</button></div>`;
    },

    fiche() { return ecranFiche(); },
    absence() { return ecranAbsence(); },
    reunions() { return ecranReunions(); },
    edt() { return ecranEdt(); },
    ensemble() { return ecranEnsemble(); },
    besoins() { return ecranBesoins(); },
    messages() { return ecranMessages(); },
    exporter() { return ecranExporter(); },
    moncode() { return ecranMonCode(); },
    avatar() { return ecranAvatar(); }
  };

  /* ─────────── fiche AESH ─────────── */
  /* Une fiche d'avant les filières ne dit pas où l'AESH intervient : « dans son pôle » se lit
     « dans toutes les filières de ce pôle ». On ne devine rien de plus. */
  const filieresParDefaut = a => Object.fromEntries(Object.keys(a.equipes || {}).flatMap(q => filieresDuPole(q).map(f => [f.id, { classes: null }])));
  function copieFiche(a) {
    const copie = JSON.parse(JSON.stringify(a)); delete copie.depart;
    copie.reunion=K.reunionDe(a); copie.services = K.servicesDe(a); copie.dispos = K.disposDe(a); delete copie.jours; delete copie.cantine; delete copie.internat; delete copie.service; delete copie.serviceLib;
    if (!K.filieresDe(copie)) copie.filieres = filieresParDefaut(copie);
    copie.rattachement = rattachementDe(copie);
    return copie;
  }
  /* Ce que les deux référents ont changé, chacun de son côté, sur la même donnée (audit C01). */
  function conflitsFiche(orig, a, recent) {
    const n = v => (v === '' || v === undefined) ? null : v, chg = (x, y) => JSON.stringify(n(x)) !== JSON.stringify(n(y));
    const trois = (o, m, r) => chg(o, m) && chg(o, r) && chg(m, r), out = [];
    const num = k => x => nombre((x || {})[k]);
    [['sigle', 'Sigle', x => x.sigle], ['contrat', 'Contrat', num('contrat')], ['presence', 'Présence élève', num('presence')], ['reunionH', 'Réunion', num('reunionH')],
      ['finContrat', 'Durée du contrat', x => x.finContrat || null], ['rattachement', 'Équipe', x => x.rattachement || null], ['reunion', 'Jour de la réunion', x => x.reunion || null], ['reunionsSupplementaires','Réunions supplémentaires',x=>x.reunionsSupplementaires||[]]]
      .forEach(([, lib, v]) => { if (trois(v(orig), v(a), v(recent))) out.push(lib); });
    const fl = x => K.filieresDe(x) || filieresParDefaut(x), dp = x => K.disposDe(x), sv = x => Object.fromEntries(K.servicesDe(x).map(y => [y.nom, y]));
    [[fl, id => (filiere(id) || { nom: id }).nom], [dp, k => `${K.JOURS_C[+k[0]]} ${k[1] === 'M' ? 'matin' : 'ap.-midi'}`], [sv, nom => nom]].forEach(([f, lib]) => {
      const o = f(orig), m = f(a), r = f(recent);
      [...new Set([...Object.keys(o), ...Object.keys(m), ...Object.keys(r)])].forEach(k => { if (trois(o[k], m[k], r[k])) out.push(lib(k)); });
    });
    return [...new Set(out)];
  }
  function initForm(id) {
    const I = idx(), p = P();
    if (id === 'nouveau') return { id: 'nouveau', recherche: '', choisi: null, a: { id: '', type: 'aesh', sigle: '', equipes: { [p.id]: 1 }, contrat: null, heures: { [p.id]: null }, filieres: Object.fromEntries(filieresDuPole(p.id).map(f => [f.id, { classes: null }])), rattachement: p.id, services: [], dispos: {}, reunion: null, actif: true }, orig: null };
    const a = I.aesh.get(id); if (!a) return null;
    const copie = copieFiche(a);
    /* Une fiche d'avant les heures par filière : si le pôle n'a qu'une filière déclarée, ses heures lui reviennent.
       S'il en a plusieurs, on ne devine pas : le total du pôle reste compté tant que rien n'est saisi. */
    POLES.forEach(q => { const h = nombre((copie.heures || {})[q.id]); if (h == null) return;
      const siennes = filieresDuPole(q.id).filter(g => copie.filieres[g.id]);
      if (siennes.length === 1 && nombre(copie.filieres[siennes[0].id].h) == null) copie.filieres[siennes[0].id] = { ...copie.filieres[siennes[0].id], h };
    });
    return { id, a: copie, orig: JSON.parse(JSON.stringify(copie)) };
  }
  function formFiche() {
    const id = S.route.p.id;
    if (!S.form || S.form.kind !== 'fiche' || S.form.cle !== id) { const f = initForm(id); if (!f) return null; S.form = { ...f, kind: 'fiche', cle: id }; }
    return S.form;
  }
  const SERVICES_TYPES = ['Cantine', 'Internat', 'DAFI', 'PIAL', 'Vie scolaire', 'Étude', 'Périscolaire', 'Autre'];
  function changements(f) {
    const a = f.a, o = f.orig || {}, p = P().id, l = [];
    const v = x => nombre(x) == null ? '—' : K.fmtH(x);
    if ((o.sigle || '') !== a.sigle) l.push(['Sigle', o.sigle || '—', a.sigle]);
    if (nombre(o.contrat) !== nombre(a.contrat)) l.push(['Contrat', v(o.contrat), v(a.contrat)]);
    if (nombre(o.presence) !== nombre(a.presence)) l.push(['Présence élève', v(o.presence), v(a.presence)]);
    if ((o.finContrat || '') !== (a.finContrat || '')) l.push(['Durée du contrat', o.finContrat ? K.dateCourte(o.finContrat) : 'toute l’année', a.finContrat ? K.dateCourte(a.finContrat) : 'toute l’année']);
    if (libFilieres(o) !== libFilieres(a)) l.push(['Intervient en', libFilieres(o), libFilieres(a)]);
    if ((o.rattachement || '') !== (a.rattachement || '')) l.push(['Équipe', o.rattachement ? nomPole(o.rattachement) : '—', a.rattachement ? nomPole(a.rattachement) : '—']);
    const tousPoles = [...new Set([...Object.keys(o.equipes || {}), ...Object.keys(a.equipes || {})])];
    tousPoles.forEach(q => { const av = (o.equipes || {})[q] != null ? v((o.heures || {})[q]) : 'pas dans le pôle', ap = (a.equipes || {})[q] != null ? v((a.heures || {})[q]) : 'retiré du pôle'; if (av !== ap) l.push([`Heures ${nomPole(q)}`, av, ap]); });
    const sv = x => (x || []).map(y => `${y.nom} ${v(y.h)}${(y.jours || []).length ? ' (' + y.jours.map(j => K.JOURS_C[j]).join(' ') + ')' : ''}`).join(', ') || 'aucun';
    if (sv(o.services) !== sv(a.services)) l.push(['Services', sv(o.services), sv(a.services)]);
    const dv = x => { const d = K.disposDe(x), l2 = Object.keys(d).sort().map(k => `${K.JOURS_C[+k[0]]} ${k[1] === 'M' ? 'matin' : 'ap.-midi'} ${d[k] === 'x' ? '✕' : '◐'}`); return l2.join(', ') || 'toute la semaine'; };
    if (dv(o) !== dv(a)) l.push(['Quand il travaille', dv(o), dv(a)]);
    const r = x => x && K.RE_HEURE.test(x.debut || '') ? `${K.JOURS[x.jour]} ${K.hFr(x.debut)}–${K.hFr(x.fin)}` : '—';
    if (r(o.reunion) !== r(a.reunion)) l.push(['Jour de la réunion', r(o.reunion), r(a.reunion)]);
    if(JSON.stringify(o.reunionsSupplementaires||[])!==JSON.stringify(a.reunionsSupplementaires||[])) {const desc=x=>(x.reunionsSupplementaires||[]).map(r=>`${nomPole(r.pole)} · ${K.JOURS[r.jour]} ${r.debut}–${r.fin} · ${r.semaines} · ${r.du} → ${r.au}`).join(' ; ')||'Aucune';l.push(['Réunions supplémentaires',desc(o),desc(a)]);}
    if (nombre(o.reunionH) !== nombre(a.reunionH)) l.push(['Réunion', K.fmtH(K.heuresReunion(o)), K.fmtH(K.heuresReunion(a))]);
    return l;
  }
  function champsReunionsSupplementaires(a) {
    const lignes=a.reunionsSupplementaires||[];
    const champ=(r,i,k,label,type='text')=>`<label>${label}<input id="rs-${i}-${k}" type="${type}" data-i="reu-extra-champ" data-index="${i}" data-champ="${k}" value="${esc(r[k])}"></label>`;
    return `<div class="champ" style="grid-template-columns:1fr"><h3>Réunions supplémentaires</h3>${lignes.map((r,i)=>`<fieldset><legend>Réunion ${i+2}</legend><div class="ligne"><label>Pôle <select data-i="reu-extra-champ" data-index="${i}" data-champ="pole">${POLES.map(p=>`<option value="${p.id}" ${p.id===r.pole?'selected':''}>${p.nom}</option>`).join('')}</select></label><label>Jour <select data-i="reu-extra-champ" data-index="${i}" data-champ="jour">${K.JOURS.map((j,n)=>`<option value="${n}" ${n===r.jour?'selected':''}>${j}</option>`).join('')}</select></label>${champ(r,i,'debut','De','time')}${champ(r,i,'fin','À','time')}<label>Semaines <select data-i="reu-extra-champ" data-index="${i}" data-champ="semaines">${['AB','A','B'].map(v=>`<option value="${v}" ${v===r.semaines?'selected':''}>${v==='AB'?'A et B':v}</option>`).join('')}</select></label>${champ(r,i,'du','À partir du','date')}${champ(r,i,'au','Jusqu’au','date')}</div><small>Conservée même lorsqu’une réunion institutionnelle remplace la réunion principale.</small><button class="btn petit" data-a="reu-extra-retirer" data-v="${i}">Retirer cette réunion</button></fieldset>`).join('')}<button class="btn" data-a="reu-extra-ajouter">+ Ajouter une réunion</button></div>`;
  }
  function ecranFiche() {
    const f = formFiche(), p = P();
    if (!f) return `<div class="etat-vide"><b>AESH introuvable</b><button type="button" class="btn" data-a="aller" data-v="aesh" id="f-retour-liste">Mes AESH</button></div>`;
    const a = f.a, nouveau = f.id === 'nouveau', I = idx();
    if (nouveau && !f.choisi) return ecranNouvelAesh(f);
    const autres = Object.keys(a.equipes || {}).filter(q => q !== p.id);
    const ch = changements(f), modifie = ch.length > 0;
    const pas = (cle, val, pasV = 0.5, sous) => { const id = cle.replace(':', '-'); return `<span class="pas"><button type="button" id="pm-${id}" data-a="pas" data-v="${cle}" data-d="-${pasV}" aria-label="Moins">−</button><input id="pv-${id}" data-i="nb" data-v="${cle}" inputmode="decimal" value="${nombre(val) == null ? '' : String(val).replace('.', ',')}" placeholder="—" aria-label="${esc(sous || cle)}"><button type="button" id="pp-${id}" data-a="pas" data-v="${cle}" data-d="${pasV}" aria-label="Plus">+</button></span>`; };
    const estModif = test => test ? 'modif' : '';
    const o = f.orig || {};
    const b = !nouveau ? K.bilan(ctx(), a.id, S.lundi) : null;
    const absences = I.absences.filter(x => x.aeshId === a.id && x.au >= K.isoLocal()).sort((x, y) => x.du.localeCompare(y.du));
    const reu = a.reunion || {};
    const prochaineReunion = reu.debut != null && reu.jour != null ? (() => { let d = K.ajoute(S.lundi, reu.jour); for (let k = 0; k < 8 && (d < K.isoLocal() || S.C.off(d)); k++) d = K.ajoute(d, 7); return d; })() : '';
    const ecart = K.ecartContrat(a);
    return `<div class="fiche">
      <div class="ligne"><span class="sigle grand">${esc(a.sigle || '?')}</span><div style="flex:1;min-width:0"><h1 id="titre" tabindex="-1">${esc(a.sigle || 'Nouvel AESH')}</h1>
        <p class="sous">${[p.nom, ...autres.map(nomPole)].map(esc).join(' + ')}</p></div>${!nouveau ? selecteurSemaine() : ''}</div>
      ${b ? `<div class="stats"><div class="carte stat"><b>${K.fmtH(b.total)}</b><small>cette semaine</small></div><div class="carte stat"><b style="color:${b.reste == null ? 'inherit' : b.reste < 0 ? 'var(--err)' : 'var(--ok)'}">${b.reste == null ? '—' : K.fmtH(b.reste)}</b><small>reste sur le contrat</small></div><div class="carte stat"><b>${K.fmtH(b.parPole[p.id] || 0)}</b><small>placées dans ${esc(p.nom)}</small></div></div>
        <div class="carte pad" style="display:grid;gap:6px"><div class="ligne ecarte"><h2>Ses heures</h2><span class="puce ${b.rep.solde == null ? '' : b.rep.solde < -1e-9 ? 'err' : b.rep.solde > 1e-9 ? 'ok' : 'ok'}">${b.rep.solde == null ? 'contrat ?' : b.rep.solde < -1e-9 ? `${K.fmtH(-b.rep.solde)} de trop` : b.rep.solde > 1e-9 ? `${K.fmtH(b.rep.solde)} disponibles` : 'tout réparti'}</span></div>
          <span class="muted" style="font-size:.92rem">${esc(b.rep.texte)}</span>${jaugeAesh(a)}</div>
        ${b.alertes.length ? `<div class="alertes">${b.alertes.map((x, i) => carteAlerte(a, x, i, 'fa')).join('')}</div>` : ''}` : ''}
      ${f.alerte ? `<div class="bandeau err" role="alert">${esc(f.alerte)}</div>` : ''}
      <div class="champs">
        <div class="champ ${estModif((o.sigle || '') !== a.sigle)}"><span class="lib"><b>Sigle</b><small>initiales, jamais le prénom</small></span><input type="text" id="f-sigle" data-i="sigle" value="${esc(a.sigle)}" maxlength="6" style="width:110px;font-weight:800;text-transform:uppercase;text-align:center"></div>
        <div class="champ ${estModif(nombre(o.contrat) !== nombre(a.contrat))}"><span class="lib"><b>Contrat ${aide('contrat')}</b><small>heures par semaine</small>${parQui(a, 'contrat')}${aideTexte('contrat')}</span>${pas('contrat', a.contrat, 0.5, 'Contrat')}</div>
        <div class="champ ${estModif((o.finContrat || '') !== (a.finContrat || ''))}" style="grid-template-columns:minmax(0,1fr) auto"><span class="lib"><b>Durée du contrat ${aide('duree')}</b><small>${a.finContrat ? `jusqu’au ${esc(K.dateLongue(a.finContrat))}` : 'toute l’année'}</small>${aideTexte('duree')}</span>
          <span class="ligne" style="gap:6px"><input type="date" id="f-fin" data-i="fin-contrat" value="${esc(a.finContrat || '')}" style="min-height:40px">${a.finContrat ? `<button type="button" class="lien" id="f-fin-non" data-a="fin-aucune">toute l’année</button>` : ''}</span></div>
        <div class="champ ${estModif(nombre(o.presence) !== nombre(a.presence))}"><span class="lib"><b>Présence élève ${aide('presence')}</b><small>heures par semaine</small>${parQui(a, 'presence')}${aideTexte('presence')}</span>${pas('presence', a.presence, 0.5, 'Présence élève')}</div>
        ${K.reunionFixePsr(a) ? '<div class="champ"><span class="lib"><b>Réunion d’équipe · 1 h</b><small>Lundi 13 h–14 h · automatique pour cette équipe. Une réunion institutionnelle programmée la remplace cette semaine-là.</small></span></div>' : `        <div class="champ ${estModif(nombre(o.reunionH) !== nombre(a.reunionH) || JSON.stringify(o.reunion || null) !== JSON.stringify(a.reunion || null))}" style="grid-template-columns:minmax(0,1fr) auto"><span class="lib"><b>Réunion ${aide('reunion')}</b><small>heures par semaine</small>${parQui(a, 'reunion')}${aideTexte('reunion')}</span>${pas('reunionH', a.reunionH === undefined ? 1 : a.reunionH, 0.5, 'Réunion')}
          <div class="ligne" style="grid-column:1/-1">${K.JOURS_C.map((j, i) => `<button type="button" class="jourc" id="rj-${i}" data-a="reu-jour" data-v="${i}" aria-pressed="${reu.jour === i && !!reu.debut}">${j}</button>`).join('')}
            <label class="sr" for="f-reu-h">Heure</label><select id="f-reu-h" data-i="reu-h" ${reu.debut ? '' : 'disabled'}>${reu.debut ? '' : '<option value="">heure</option>'}${CRENEAUX_H.slice(0, -2).map(h => `<option value="${h}" ${reu.debut === h ? 'selected' : ''}>${K.hFr(h)} – ${K.hFr(K.hDe(K.min(h) + 60))}</option>`).join('')}</select>
            ${reu.debut ? `<button type="button" class="lien" id="f-reu-non" data-a="reu-aucune">aucune</button>` : ''}</div>
          ${prochaineReunion ? `<small class="muted" style="grid-column:1/-1">Prochaine : ${esc(K.dateLongue(prochaineReunion))}, ${K.hFr(reu.debut)}–${K.hFr(reu.fin)}</small>` : ''}</div>
`}
        ${champsReunionsSupplementaires(a)}
        ${ecart && ecart.ecart ? `<div class="champ" style="grid-template-columns:1fr"><span class="bandeau warn">${K.fmtH(ecart.presence)} de présence élève ${ecart.reunion ? `+ ${K.fmtH(ecart.reunion)} de réunion ` : ''}${ecart.services ? `+ ${K.fmtH(ecart.services)} de services ` : ''}= ${K.fmtH(ecart.somme)}, pour un contrat de ${K.fmtH(ecart.contrat)} : ${ecart.ecart > 0 ? `${K.fmtH(ecart.ecart)} de trop` : `${K.fmtH(-ecart.ecart)} qui manque${-ecart.ecart > 1 ? 'nt' : ''}`}.</span></div>` : ''}
        <div class="champ ${estModif(libFilieres(o) !== libFilieres(a))}" style="grid-template-columns:minmax(0,1fr) auto"><span class="lib"><b>Intervient en ${aide('intervient')}</b><small>${esc(libFilieres(a))}</small>${aideTexte('intervient')}</span><button type="button" class="btn petit" id="f-filieres" data-a="filieres">Modifier</button></div>
        ${(a.services || []).map((x, i) => `<div class="champ ${estModif(JSON.stringify((o.services || [])[i] || null) !== JSON.stringify(x))}" style="grid-template-columns:minmax(0,1fr) auto"><span class="lib"><span class="ligne" style="gap:6px"><select data-i="serv-nom" data-v="${i}" aria-label="Service" style="min-height:38px;padding:6px 10px">${SERVICES_TYPES.map(t => `<option value="${esc(t)}" ${(SERVICES_TYPES.includes(x.nom) ? x.nom : 'Autre') === t ? 'selected' : ''}>${esc(libelleService(t))}</option>`).join('')}</select>${SERVICES_TYPES.includes(x.nom) && x.nom !== 'Autre' ? '' : `<input type="text" data-i="serv-lib" data-v="${i}" value="${esc(x.nom === 'Autre' ? '' : x.nom)}" maxlength="40" placeholder="quel service ?" style="width:150px;min-height:38px">`}<button type="button" class="lien" data-a="serv-retirer" data-v="${i}">retirer</button></span><small>heures par semaine</small></span>${pas('serv:' + i, x.h, 0.5, 'Heures ' + x.nom)}
          <div class="ligne" style="grid-column:1/-1">${K.JOURS_C.map((j, n) => `<button type="button" class="jourc" id="sj-${i}-${n}" data-a="serv-jour" data-v="${i}|${n}" aria-pressed="${(x.jours || []).includes(n)}">${j}</button>`).join('')}</div></div>`).join('')}
        <div class="champ" style="grid-template-columns:1fr"><div class="ligne"><span class="muted" style="font-weight:700">Services :</span><button type="button" class="btn petit" id="f-serv-ajouter" data-a="serv-ajouter">＋ DP — Demi-pension, internat, dispositif</button></div></div>
        <div class="champ ${estModif(JSON.stringify(K.disposDe(o)) !== JSON.stringify(K.disposDe(a)))}" style="grid-template-columns:1fr"><span class="lib"><b>Quand il travaille ${aide('jours')}</b><small>touchez une case pour la changer</small>${aideTexte('jours')}</span>
          <div class="demis" role="group" aria-label="Disponibilités par demi-journée">
            <span></span>${K.JOURS_C.map(j => `<span class="dj-t">${j}</span>`).join('')}
            ${K.DEMIS.map(([code, lib]) => `<span class="dj-t">${lib === 'matin' ? 'Matin' : 'Ap.-midi'}</span>${K.JOURS_C.map((_, i) => { const e = K.etatDemi(a, i, code);
              return `<button type="button" class="dj ${e === 'x' ? 'dj-x' : e === 's' ? 'dj-s' : ''}" id="dj-${i}${code}" data-a="demi" data-v="${i}${code}" aria-label="${esc(K.JOURS[i])} ${esc(lib)} : ${e === 'x' ? 'indisponible' : e === 's' ? 'souhait' : 'il travaille'}">${e === 'x' ? '✕' : e === 's' ? '◐' : '·'}</button>`; }).join('')}`).join('')}
          </div>
          <div class="leg" style="margin-top:6px"><span><b>·</b> il travaille</span><span><b style="color:var(--err)">✕</b> indisponible (contrat)</span><span><b style="color:var(--warn)">◐</b> souhait</span></div></div>
      </div>
      ${!nouveau ? `<div class="carte pad" style="display:grid;gap:10px"><div class="ligne ecarte"><h2>Absences et formations</h2><button type="button" class="btn petit" id="f-abs" data-a="aller" data-v="absence" data-id="${esc(a.id)}">＋ Poser</button></div>
        ${absences.length ? absences.map(x => `<div class="ligne ecarte"><span><span class="puce err">${esc(K.MOTIFS[x.motif] || 'Absence')}</span> ${x.du === x.au ? esc(K.dateLongue(x.du)) : `du ${esc(K.dateCourte(x.du))} au ${esc(K.dateCourte(x.au))}`}${x.journee === false ? ` · ${K.hFr(x.debut)}–${K.hFr(x.fin)}` : ''}</span></div>`).join('') : '<span class="muted">Aucune à venir.</span>'}</div>` : ''}
      <div class="barre-bas">
        ${!nouveau ? `<button type="button" class="btn danger" id="f-retirer" data-a="retirer-aesh">Retirer de mon pôle</button>` : ''}
        ${modifie ? `<button type="button" class="btn" id="f-annuler" data-a="annuler-fiche">Annuler</button>` : ''}
        <button type="button" class="btn valider" id="f-enregistrer" data-a="valider-fiche" ${modifie || nouveau ? '' : 'disabled'}>✓ Enregistrer</button>
      </div></div>`;
  }
  function ecranNouvelAesh(f) {
    const I = idx(), p = P(), q = K.cleSigle(f.recherche);
    const existants = [...I.aesh.values()].filter(a => a.actif !== false && !(a.equipes || {})[p.id] && (!q || K.cleSigle(a.sigle).startsWith(q)));
    const pris = q && [...I.aesh.values()].some(a => a.actif !== false && K.cleSigle(a.sigle) === q);
    return `<div class="fiche"><h1 id="titre" tabindex="-1">Ajouter un AESH</h1>
      <div class="champs"><div class="champ" style="grid-template-columns:1fr"><label class="lib" for="n-sigle"><b>Sigle</b><small>initiales, jamais le prénom</small></label>
        <input type="text" id="n-sigle" data-i="recherche" class="gros-champ" maxlength="6" value="${esc(f.recherche)}" autocomplete="off" placeholder="ex. CÉ"></div></div>
      ${existants.length ? `<div style="display:grid;gap:8px"><h2>Déjà dans l’établissement</h2>${existants.map(a => `<button type="button" class="aesh" id="n-ex-${esc(a.id)}" data-a="choisir-existant" data-v="${esc(a.id)}"><span class="sigle" style="--pole:${pole(Object.keys(a.equipes || {})[0]) ? pole(Object.keys(a.equipes)[0]).couleur : 'var(--pole)'}">${esc(a.sigle)}</span><span class="det"><b>${esc(a.sigle)}</b><span class="muted">${Object.keys(a.equipes || {}).map(x => `${nomPole(x)} ${hOu((a.heures || {})[x])}`).join(' · ') || 'sans pôle'}${nombre(a.contrat) != null ? ` · contrat ${K.fmtH(a.contrat)}` : ''}</span></span><span class="droite"><span class="puce pole">l’ajouter à mon pôle ›</span></span></button>`).join('')}</div>` : ''}
      ${q && !pris ? `<button type="button" class="aesh" id="n-nouveau" data-a="choisir-nouveau"><span class="sigle">${esc(K.normSigle(f.recherche))}</span><span class="det"><b>Nouvel AESH ${esc(K.normSigle(f.recherche))}</b><span class="muted">n’existe dans aucun pôle</span></span><span class="droite"><span class="puce ok">créer ›</span></span></button>` : ''}
      ${pris && !existants.some(a => K.cleSigle(a.sigle) === q) ? `<div class="bandeau warn">Ce sigle est déjà dans votre pôle.</div>` : ''}
    </div>`;
  }
  /* Cours du pôle où le besoin estimé dépasse les AESH placés, cette semaine, et où l'AESH est libre. */
  function ouIntervenir(aeshId) {
    const p = P(), c = ctx(), out = [], vus = new Set();
    classesDu(p.id).forEach(nom => S.edt.classes[nom].cours.forEach(id => {
      const cr = S.edt.cours[id], iso = K.ajoute(S.lundi, cr.j); if (vus.has(id) || !K.coursALieu(S.C, S.edt, cr, iso)) return;
      const bes = K.besoinDuCours(S.est, nom, cr, quand(iso)); if (!bes || !bes.nb) return;
      const pl = new Set(placesCours(id, iso).map(x => x.aeshId)), n = presents(cr, iso, bes); if (n >= bes.nb || pl.has(aeshId)) return;
      const d = K.disponibilite(c, aeshId, id, iso, iso, p.id); if (d.etat !== 'libre') return;
      vus.add(id); out.push({ classe: nom, cours: cr, besoin: bes.nb, places: n });
    }));
    return out.sort((x, y) => (y.besoin - y.places) - (x.besoin - x.places) || x.cours.j - y.cours.j);
  }

  /* ─────────── absences ─────────── */
  function formAbsence() {
    if (!S.form || S.form.kind !== 'absence') {
      const auj = K.isoLocal();
      S.form = { kind: 'absence', aeshId: S.route.p.id || '', motif: 'formation', du: auj, au: auj, journee: true, debut: '08:30', fin: '12:30', note: '' };
    }
    return S.form;
  }
  function coursTouches(f) {
    const I = idx(), out = [];
    if (!f.aeshId || !K.RE_DATE.test(f.du) || !K.RE_DATE.test(f.au) || f.au < f.du) return out;
    for (let d = f.du, n = 0; d <= f.au && n < 190; d = K.ajoute(d, 1), n++) {
      const j = K.jourSemaine(d); if (j > 4 || S.C.off(d)) continue;
      const vus = new Set();
      I.places.forEach(p => {
        if (p.aeshId !== f.aeshId || p.jour !== j || d < p.du || d > p.au || vus.has(p.coursId)) return;
        const c = S.edt.cours[p.coursId]; if (!c || !K.coursALieu(S.C, S.edt, c, d)) return;
        const hp = K.horairePlace(p, c); if (!f.journee && !K.chevauche(f.debut, f.fin, hp.debut, hp.fin)) return;
        vus.add(p.coursId); out.push({ d, c, pole: p.pole });
      });
    }
    return out;
  }
  function ecranAbsence() {
    const f = formAbsence(), p = P(), I = idx(), liste = K.aeshActifs(I, p.id);
    const touches = coursTouches(f), valide = f.aeshId && K.RE_DATE.test(f.du) && K.RE_DATE.test(f.au) && f.au >= f.du && (f.journee || K.min(f.fin) > K.min(f.debut)) && (f.motif !== 'autre' || String(f.note || '').trim());
    const aVenir = I.absences.filter(x => liste.some(a => a.id === x.aeshId) && x.au >= K.isoLocal()).sort((a, b) => a.du.localeCompare(b.du));
    return `<div class="fiche"><h1 id="titre" tabindex="-1">Absence ou formation</h1>
      <div class="champs">
        <div class="champ" style="grid-template-columns:1fr"><span class="lib"><b>Qui</b></span><div class="choix" role="group" aria-label="AESH">${liste.map(a => `<button type="button" id="ab-a-${esc(a.id)}" data-a="abs-aesh" data-v="${esc(a.id)}" aria-pressed="${f.aeshId === a.id}">${esc(a.sigle)}</button>`).join('')}</div></div>
        <div class="champ" style="grid-template-columns:1fr"><span class="lib"><b>Motif</b></span><div class="choix" role="group" aria-label="Motif">${Object.entries(K.MOTIFS).map(([k, l]) => `<button type="button" id="ab-m-${k}" data-a="abs-motif" data-v="${k}" aria-pressed="${f.motif === k}">${l}</button>`).join('')}</div></div>
        <div class="champ" style="grid-template-columns:1fr"><span class="lib"><b>Dates</b></span><div class="ligne"><label for="ab-du">du</label><input type="date" id="ab-du" data-i="abs-du" value="${esc(f.du)}"><label for="ab-au">au</label><input type="date" id="ab-au" data-i="abs-au" value="${esc(f.au)}" min="${esc(f.du)}"></div></div>
        <div class="champ" style="grid-template-columns:1fr"><span class="lib"><b>Horaires</b></span><div class="ligne"><div class="choix" role="group" aria-label="Journée"><button type="button" id="ab-j1" data-a="abs-journee" data-v="1" aria-pressed="${f.journee}">Journée entière</button><button type="button" id="ab-j0" data-a="abs-journee" data-v="0" aria-pressed="${!f.journee}">Quelques heures</button></div>
          ${f.journee ? '' : `<select id="ab-hd" data-i="abs-debut" aria-label="De">${CRENEAUX_H.map(h => `<option ${h === f.debut ? 'selected' : ''} value="${h}">${K.hFr(h)}</option>`).join('')}</select>–<select id="ab-hf" data-i="abs-fin" aria-label="À">${CRENEAUX_H.map(h => `<option ${h === f.fin ? 'selected' : ''} value="${h}">${K.hFr(h)}</option>`).join('')}</select>`}</div></div>
        <div class="champ" style="grid-template-columns:1fr"><label class="lib" for="ab-note"><b>Intitulé</b><small>${f.motif === 'autre' ? 'obligatoire pour « Autre »' : 'ex. formation gestes et postures · sans nom'}</small></label><input type="text" id="ab-note" data-i="abs-note" maxlength="120" value="${esc(f.note)}" placeholder="${f.motif === 'formation' ? 'Quelle formation ?' : f.motif === 'autre' ? 'Quel motif ?' : ''}" style="width:100%;max-width:420px"></div>
      </div>
      ${f.aeshId && valide ? `<div class="bandeau ${touches.length ? 'err' : 'info'}">${touches.length ? `${touches.length} accompagnement${touches.length > 1 ? 's' : ''} à couvrir : ${touches.slice(0, 8).map(t => `${K.JOURS_C[K.jourSemaine(t.d)]} ${K.jjmm(t.d)} ${K.hFr(t.c.d)} ${t.c.cls.map(n => S.edt.classes[n].court).join('/')}${t.pole !== p.id ? ` (${nomPole(t.pole)})` : ''}`).map(esc).join(' · ')}${touches.length > 8 ? ' …' : ''}` : 'Aucun cours placé sur ces dates.'}</div>` : ''}
      <div class="barre-bas">${f.id ? `<button type="button" class="btn" id="ab-annuler" data-a="annuler-absence">Annuler la modification</button>` : ''}<button type="button" class="btn valider" id="ab-valider" data-a="valider-absence" ${valide ? '' : 'disabled'}>✓ ${f.id ? 'Enregistrer la modification' : 'Enregistrer l’absence'}</button></div>
      ${aVenir.length ? `<div class="carte pad" style="display:grid;gap:10px"><h2>À venir</h2>${aVenir.map(x => { const a = I.aesh.get(x.aeshId); return `<div class="ligne ecarte"><span><b>${esc(a ? a.sigle : '?')}</b> · <span class="puce err">${esc(K.MOTIFS[x.motif])}</span> ${x.du === x.au ? esc(K.dateLongue(x.du)) : `du ${esc(K.dateCourte(x.du))} au ${esc(K.dateCourte(x.au))}`}${x.journee === false ? ` · ${K.hFr(x.debut)}–${K.hFr(x.fin)}` : ''}${x.note ? ` · <span class="muted">${esc(x.note)}</span>` : ''}</span><span class="ligne" style="gap:6px"><button type="button" class="btn petit" id="ab-mod-${esc(x.id)}" data-a="modifier-absence" data-v="${esc(x.id)}">Modifier</button><button type="button" class="btn petit danger" id="ab-ret-${esc(x.id)}" data-a="retirer-absence" data-v="${esc(x.id)}">Retirer</button></span></div>`; }).join('')}</div>` : ''}
    </div>`;
  }

  /* ─────────── réunions institutionnelles ─────────── */
  function ecranReunions() {
    const I = idx();
    if (!S.form || S.form.kind !== 'reunion') { let d = K.isoLocal(); while (K.jourSemaine(d) !== 0) d = K.ajoute(d, 1); S.form = { kind: 'reunion', date: d, debut: '08:30', fin: '09:30', base:new Map(S.docs) }; }
    const f = S.form, liste = I.reunions.slice().sort((a, b) => a.date.localeCompare(b.date));
    const valide = K.RE_DATE.test(f.date) && K.duree(f.debut,f.fin)===1 && !S.C.off(f.date) && K.jourSemaine(f.date)===0;
    return `<div class="fiche"><h2>Réunion instit.</h2>
      <p class="sous">Une fois par mois, tous les AESH. Cette semaine-là, elle remplace la réunion d’équipe.</p>
      <div class="champs"><div class="champ" style="grid-template-columns:1fr"><span class="lib"><b>Date</b></span>
        <div class="ligne"><input type="date" id="r-date" data-i="r-date" value="${esc(f.date)}"><select id="r-debut" data-i="r-debut" aria-label="Début">${CRENEAUX_H.map(h => `<option ${h === f.debut ? 'selected' : ''} value="${h}">${K.hFr(h)}</option>`).join('')}</select>–<select id="r-fin" data-i="r-fin" aria-label="Fin">${CRENEAUX_H.map(h => `<option ${h === f.fin ? 'selected' : ''} value="${h}">${K.hFr(h)}</option>`).join('')}</select></div>
        ${K.RE_DATE.test(f.date) ? `<small class="muted">${esc(K.dateLongue(f.date))}${S.C.off(f.date) ? ' · ' + esc(S.C.off(f.date)) : ''}</small>` : ''}</div></div>
      <div class="barre-bas" style="position:static;background:none;padding:0"><button type="button" class="btn valider" id="r-valider" data-a="valider-reunion" ${valide ? '' : 'disabled'}>✓ Ajouter cette date</button></div>
      <div class="carte pad" style="display:grid;gap:10px"><h2>Dates prévues</h2>${liste.length ? liste.map(r => `<div class="ligne ecarte"><span><b>${esc(K.dateLongue(r.date))}</b> · ${K.hFr(r.debut)}–${K.hFr(r.fin)}${r.date < K.isoLocal() ? ' <span class="puce">passée</span>' : ''}</span><button type="button" class="btn petit danger" id="r-ret-${esc(r.id)}" data-a="retirer-reunion" data-v="${esc(r.id)}">Retirer</button></div>`).join('') : '<span class="muted">Aucune date pour l’instant.</span>'}</div>
    </div>`;
  }

  /* ─────────── emploi du temps ─────────── */
  function classeCourante() {
    const l = classesDu(P().id); let c = S.route.p.classe;
    if (!l.includes(c)) c = l.includes(S.derniereClasse) ? S.derniereClasse : l[0];
    S.derniereClasse = c; return c;
  }
  /* La grille d'une classe, comme sur les PDF : réutilisée par « Emploi du temps » (cliquable) et « Vue d'ensemble » (lecture). */
  function grilleClasse(nom, lectureSeule) {
    const k = S.edt.classes[nom], sem = S.C.semaine(S.lundi), I = idx();
    const cours = k.cours.map(id => S.edt.cours[id]).filter(c => S.C.coursSemaine(c, S.lundi));
    const services=K.aeshActifs(I,P().id).flatMap(a=>K.occupations(ctx(),a.id,S.lundi).filter(o=>['service','reunion','institution'].includes(o.type)).map(o=>({...o,a})));
    const H0 = 8 * 60, H1 = Math.max(18*60,...services.map(o=>K.min(o.fin))), PX = 1.25;
    const serviceHtml=j=>{
      const groupes=new Map(); services.filter(o=>o.j===j).forEach(o=>{const key=[o.label,o.debut,o.fin].join('|');if(!groupes.has(key))groupes.set(key,{...o,personnes:[]});groupes.get(key).personnes.push(o.a);});
      const liste=[...groupes.values()].sort((a,b)=>a.debut.localeCompare(b.debut)), cols=[]; liste.forEach(o=>{let n=cols.findIndex(l=>l.every(x=>!K.chevauche(x.debut,x.fin,o.debut,o.fin)));if(n<0){n=cols.length;cols.push([]);}cols[n].push(o);o.col=n;});
      return liste.map(o=>`<button type="button" data-a="service-detail" data-v="${j}" class="service-grille" style="width:${34/cols.length}%;right:calc(2px + ${o.col*34/cols.length}%);top:${(K.min(o.debut)-H0)*PX}px;height:${(K.min(o.fin)-K.min(o.debut))*PX-2}px"><b>${esc(libelleService(o.label))}</b>${K.min(o.debut)%30||K.min(o.fin)%30?`<small>${K.hFr(o.debut)}–${K.hFr(o.fin)}</small>`:''}<span>${o.personnes.map(a=>`<span style="border-left:4px solid ${couleurAesh(a.id)}">${esc(a.sigle)}</span>`).join(' ')}</span></button>`).join('');
    };
    const blocHtml = (c, large) => {
      const iso = K.ajoute(S.lundi, c.j), lieu = K.coursALieu(S.C, S.edt, c, iso);
      const pl = placesCours(c.id, iso), parAesh = new Map(); pl.forEach(x => { if (I.aesh.get(x.aeshId)) parAesh.set(x.aeshId, x); });
      /* 26/09/2026 — Même ordre d'un cours à l'autre. Sans tri, la colonne d'un AESH dépendait
         de l'ordre d'écriture de son placement : ST devant ANT sur un bloc, derrière sur le
         suivant. Le sigle est déjà l'ordre partout ailleurs (calculs.js) : l'œil suit la personne. */
      const aeshs = [...parAesh.keys()].map(id => I.aesh.get(id))
        .sort((x, y) => String(x.sigle).localeCompare(String(y.sigle), 'fr'));
      const bes = K.besoinDuCours(S.est, nom, c, quand(iso)), [mc] = couleurMatiere(c.mat);
      const nbPresents = presents(c, iso, bes);
      const pills = aeshs.map(a => { const hp = K.horairePlace(parAesh.get(a.id), c), ab = K.absentLe(I, a.id, iso, hp.debut, hp.fin), partiel = ab && ab.journee === false && !(K.min(ab.debut) <= K.min(hp.debut) && K.min(ab.fin) >= K.min(hp.fin)); return `<span class="pill ${ab && !partiel ? 'abs' : ''}" title="${ab ? (partiel ? `absent ${K.hFr(ab.debut)}–${K.hFr(ab.fin)} : à couvrir en partie` : 'absent : à couvrir') : (hp.partiel ? `${K.hFr(hp.debut)}–${K.hFr(hp.fin)} seulement` : '')}" style="background:${couleurAesh(a.id)};color:white;border-color:${couleurAesh(a.id)};${(a.equipes || {})[P().id] ? '' : 'border-style:dashed'}${partiel ? ';border-color:var(--warn);color:var(--warn)' : ''}">${esc(a.sigle)}${hp.partiel ? ` <small style="font-weight:600">${K.hFr(hp.debut)}–${K.hFr(hp.fin)}</small>` : ''}${partiel ? ' ·' : ''}</span>`; }).join('');
      const minutes = K.min(c.f)-K.min(c.d);
      const bandes = aeshs.map((a,i) => pl.filter(x => x.aeshId===a.id).map(x => {
        const h=K.horairePlace(x,c), absent=K.absentLe(I,a.id,iso,h.debut,h.fin);
        return `<span class="presence-bande ${absent?'presence-absence':''}" style="background:${couleurAesh(a.id)};top:${100*(K.min(h.debut)-K.min(c.d))/minutes}%;height:${100*(K.min(h.fin)-K.min(h.debut))/minutes}%;left:${i*100/aeshs.length}%;width:${100/aeshs.length}%" title="${esc(a.sigle)} · ${K.hFr(h.debut)}–${K.hFr(h.fin)}${absent?' · absence à vérifier':''}">${esc(a.sigle)}<small class="presence-horaire">${K.hFr(h.debut)}–${K.hFr(h.fin)}</small></span>`;
      }).join('')).join('');
      const decoupes = Array.from({length:Math.max(0,Math.ceil(minutes/30)-1)},(_,i)=>`<span class="presence-repere" style="top:${100*(i+1)*30/minutes}%"></span>`).join('');
      const etat=K.etatBesoin(ctx(),c,iso,bes),libEtat={inconnu:'Besoin non renseigné',zero:'Aucun AESH demandé',vide:'Besoin non couvert',partiel:'Besoin partiellement couvert',plein:'Besoin couvert'};
      const besHtml=`<span class="bes-cercle ${etat}" role="img" aria-label="${libEtat[etat]}" title="${libEtat[etat]}">${etat==='inconnu'?'?':etat==='zero'?'╱':''}</span>`;
      /* 26/09/2026 — Le besoin des élèves, à côté du besoin de l'enseignant : c'est le croisement
         qui permet à un AESH de choisir entre deux cours qui réclament chacun un adulte.
         Des nombres seulement — aucun code, aucune date, aucun nom. */
      const elv = libelleEleves(nom);
      const elvHtml = elv ? `<span class="eleves-bloc" title="Élèves notifiés dans cette classe">${esc(elv)}</span>` : '';

      const lib = `${bes ? `Besoin : ${bes.nb} AESH, présents : ${nbPresents}. ` : 'Besoin non renseigné. '}${K.JOURS[c.j]} ${K.hFr(c.d)}–${K.hFr(c.f)}, ${c.lib}${c.salle.length ? ', ' + c.salle.join(', ') : ''}${aeshs.length ? ', ' + pl.map(x => (I.aesh.get(x.aeshId)?.sigle || '?')+' '+K.horairePlace(x,c).debut+'–'+K.horairePlace(x,c).fin).join(', ') : ', aucun AESH'}`;
      if (large) {
        const top = (K.min(c.d) - H0) * PX, h = (K.min(c.f) - K.min(c.d)) * PX;
        return `<div class="bloc ${aeshs.length ? 'avec-presences' : 'sans-presence'} avec-besoin ${S.flash === c.id ? 'flash' : ''}" style="--mc:${mc};top:${top + 1}px;height:${h - 2}px;left:${3 + (c._col || 0) * (100 / (c._cols || 1))}%;width:calc(${100 / (c._cols || 1)}% - 6px)${lieu ? '' : ';opacity:.45'}">
          <button type="button" class="bloc-contenu" id="c-${esc(c.id)}" data-a="${lectureSeule ? 'lecture' : 'placer'}" data-v="${esc(c.id)}" aria-label="${esc(lib)}"><b>${esc(c.lib)}</b>${h > 38 ? `<span class="salle">${esc(c.salle.join(' · '))}</span>` : ''}${aeshs.length ? `<span class="presence-timeline" aria-hidden="true">${decoupes}${bandes}</span>` : ''}<span class="sr">${aeshs.map(a=>esc(a.sigle)).join(", ")}</span>${h > 54 ? elvHtml : ''}</button>${besHtml}</div>`;
      }
      return `<div class="cours-l" style="--mc:${mc}${lieu ? '' : ';opacity:.5'}"><button type="button" class="cours-contenu" id="cl-${esc(c.id)}" data-a="${lectureSeule ? 'lecture' : 'placer'}" data-v="${esc(c.id)}" aria-label="${esc(lib)}">
        <span class="h">${K.hFr(c.d)}–${K.hFr(c.f)}</span><span class="m"><b>${esc(c.lib)}</b><small>${esc(c.salle.join(' · '))}</small></span>
        <span class="pills">${pills || '<span class="pill" style="opacity:.55">＋</span>'}</span>${elvHtml}</button>${besHtml}</div>`;
    };
    /* colonnes pour les cours qui se chevauchent (semaine A et B affichées séparément, donc rares) */
    [0, 1, 2, 3, 4].forEach(j => {
      const l = cours.filter(c => c.j === j).sort((a, b) => K.min(a.d) - K.min(b.d)), cols = [];
      l.forEach(c => { let i = cols.findIndex(col => col.every(x => !K.chevauche(x.d, x.f, c.d, c.f))); if (i < 0) { cols.push([]); i = cols.length - 1; } cols[i].push(c); c._col = i; });
      l.forEach(c => { const g = l.filter(x => K.chevauche(x.d, x.f, c.d, c.f)); c._cols = Math.max(1, ...g.map(x => x._col + 1)); });
    });
    /* même grille sur téléphone et ordinateur (les référents travaillent sur ce visuel) : sur téléphone, mode panoramique, on la déplace avec le doigt */
    let grille = `<div class="semaine-repere">Semaine ${esc(sem.parite||'—')} · ${K.jjmm(S.lundi)}–${K.jjmm(K.ajoute(S.lundi,4))}</div><div class="defile"><div class="grille-edt" data-vue="${S.route.p.affichage==='jour'?'jour':'semaine'}" data-jour="${+(S.route.p.jour||0)}"><div class="g-tete"></div>${sem.jours.map((jr, j) => `<div class="g-tete jour-col" data-j="${j}">${K.JOURS[j]}<small>${K.jjmm(jr.date)}</small></div>`).join('')}
      <div class="g-heures" style="height:${(H1 - H0) * PX}px">${Array.from({ length: (H1-H0)/60+1 }, (_, i) => `<span style="top:${i * 60 * PX}px">${8 + i}h</span>`).join('')}</div>`;
    sem.jours.forEach((jr, j) => {
      grille += `<div class="g-jour jour-col" data-j="${j}" style="height:${(H1 - H0) * PX}px">${Array.from({ length: (H1-H0)/60 }, (_, i) => `<div class="g-ligne" style="top:${(i + 1) * 60 * PX}px"></div>`).join('')}
        ${jr.off ? `<div class="g-vac">${esc(jr.off)}</div>` : `<div class="cours-zone ${services.some(o=>o.j===j)?'avec-services':''}">${cours.filter(c => c.j === j).map(c => blocHtml(c, true)).join('')}</div>${serviceHtml(j)}`}
        ${!jr.off && K.enPfmp(k, jr.date) ? `<div class="g-filigrane" aria-hidden="true"><b>PFMP</b><small>classe en stage · AESH libres</small></div>` : ''}</div>`;
    });
    grille += `</div></div>`;
    return grille;
  }
  function panneauVerification() {
    if(P().id!=='PSR_MELEC') return '';
    const ds=[...S.docs.values()].filter(d=>d.type==='verification' && PERSONNES.includes(d.aeshId));
    return `<div class="carte pad"><h2>Vérifier les semaines A et B</h2>${ds.map(d=>`<button class="btn" data-a="verification" data-v="${esc(d.id)}">${esc(idx().aesh.get(d.aeshId)?.sigle || d.aeshId)} · ${d.statut==='valide'?'Validé ✓':'À vérifier'}</button>`).join('')}${accesComplet()?'<button class="btn" data-a="verification-import">Charger les propositions Excel préparées</button>':''}</div>`;
  }
  async function ecrireVerification(docs,base) {
    if(!S.session || S.session.pole!=='PSR_MELEC') throw Error('Accès PSR requis.');
    const resultat=await enregistrerPlanning({FS,db,collection:COLLECTION,historique:COL_HIST,docs,base,annee:S.annee,par:'PSR_MELEC',nouvelId:alea,maintenant:new Date().toISOString()});
    resultat.forEach(d=>S.docs.set(d.id,d));versionDocs++;return resultat;
  }
  function lancerVerification(id) {
    const d=S.docs.get(id);if(!d || d.type!=='verification' || d.statut==='valide') {toast('Ce planning a déjà été validé. Les ajustements restent possibles dans la grille.');return;}
    ouvrirVerification({draft:d,base:new Map(S.docs),ctx:ctx(),enregistrer:ecrireVerification,ferme:()=>rendre(),nouvelId:alea});
  }
  function importerVerification() {
    if(!accesComplet() || (!modePlanning && S.session?.pole!=='PSR_MELEC'))return;
    const input=document.createElement('input');input.type='file';input.accept='.json,application/json';
    input.onchange=async()=>{try{
      const file=input.files[0];if(!file || file.size>200000)throw Error('Fichier trop volumineux.');
      const paquet=JSON.parse(await file.text());
      if(paquet.format!=='verification-psr-v1' || paquet.annee!==S.annee || paquet.personnes?.length!==4)throw Error('Fichier de propositions non reconnu.');
      const base=new Map(S.docs),annee=S.annee.replace('-',''),du=K.isoLocal(),au=raccourcis().find(r=>r.id==='annee')?.fin;
      const docs=paquet.personnes.map(p=>({id:'verification_'+p.aeshId.slice(5)+'_'+annee,type:'verification',aeshId:p.aeshId,statut:'brouillon',contenu:JSON.stringify({lignes:p.lignes,notes:p.notes,valides:[],internat:null,dpConfirmee:false,du,au})}));
      docs.forEach(d=>{lireBrouillon(d);if(base.has(d.id))throw Error('Des propositions existent déjà : elles sont conservées.');});
      if(new Set(docs.map(d=>d.id)).size!==4)throw Error('Personne en double.');
      ouvrir({type:'confirmer',titre:'Préparer la vérification',grand:'4 AESH · semaines A et B',lignes:[['Planning','Aucune affectation ne change. Antoine devra vérifier puis confirmer.']],bouton:'Mettre les propositions à disposition',travail:async()=>{await ecrireVerification(docs,base);return {};}});
    }catch(e){toast(e.message,true);}};input.click();
  }
  /* La semaine type d'un AESH : A et B dans une seule grille paysage. */
  function grilleSemaineType(personne,paire,type) {
    const cx=type?contexteType(ctx()):ctx();
    const occ=occupationsAB(K,cx,personne.id,paire.A,paire.B);
    const bA=K.bilan(cx,personne.id,paire.A), bB=K.bilan(cx,personne.id,paire.B);
    const moyenne=(bA.total+bB.total)/2, contrat=bA.contrat;
    const resume=resumeSemaine(K,occ);
    const deuxSemaines=occ.some(o=>o.sem!=='AB');
    return `<div class="semaine-type">
      <div class="st-tete">
        <div><h2>Semaine type · ${esc(personne.sigle)}</h2>
          <p>${type?'Organisation habituelle, hors absences et PFMP. ':''}Semaines A et B réunies.
             ${deuxSemaines?'Les blocs marqués <b>A</b> ou <b>B</b> ne reviennent qu\'une semaine sur deux.':'Toutes les semaines sont identiques.'}</p></div>
        <div class="st-chiffres">
          <div><b>${K.fmtH(moyenne)}</b><small>par semaine en moyenne</small></div>
          ${contrat==null?'':`<div><b>${K.fmtH(contrat)}</b><small>au contrat</small></div>`}
          <div><b>${K.fmtH(bA.total)} / ${K.fmtH(bB.total)}</b><small>semaine A / semaine B</small></div>
        </div>
      </div>
      ${grillePersonne(personne,paire.A,cx,type,occ)}
      ${resume.length?`<div class="st-resume">${resume.map(([n,h])=>`<span><b>${esc(n)}</b> ${K.fmtH(h)}</span>`).join('')}</div>`:''}
      <div class="st-actions">
        <button type="button" class="btn" data-a="export-grille">⬇ Enregistrer en PDF ou Excel</button>
        <button type="button" class="btn ghost" data-a="envoyer-grille">✉️ Envoyer à ${esc(personne.sigle)}</button>
      </div></div>`;
  }

  function grillesPlanning(personne,nom) {
    const choix=S.route.p.parite || (personne?'AB':S.C.parite(S.lundi)), paire=semainesAB(S.C,S.lundi), type=!!S.route.p.edtType;
    /* 25/09/2026 : une personne, un seul document. « A+B » n'aligne plus deux grilles :
       il n'en montre qu'une, où chaque bloc dit s'il revient les deux semaines ou une seule.
       A et B restent accessibles pour entrer dans le détail. */
    if(choix==='AB' && personne) return grilleSemaineType(personne,paire,type);
    const dates=choix==='AB'?[paire.A,paire.B]:[type && !S.C.parite(S.lundi)?paire.A:S.lundi];
    const contenu=dates.map(l=>{
      const cx=type?contexteType(ctx()):ctx(), ancien=S.lundi;let html;
      if(personne) html=grillePersonne(personne,l,cx,type);
      else if(type) {
        const presents=K.aeshActifs(cx.I).flatMap(a=>K.occupations(cx,a.id,l).filter(o=>o.cours?.cls.includes(nom)).map(o=>({...o,sigle:a.sigle})));
        const occ=S.edt.classes[nom].cours.map(id=>S.edt.cours[id]).filter(c=>cx.C.coursSemaine(c,l)).map(c=>({j:c.j,debut:c.d,fin:c.f,cours:c,label:c.lib,detail:presents.filter(o=>o.cours.id===c.id).map(o=>`${o.sigle} ${K.hFr(o.debut)}–${K.hFr(o.fin)}`).join(' · ')}));
        const horsCours=new Map();
        K.aeshActifs(cx.I,P().id).forEach(a=>K.occupations(cx,a.id,l).filter(o=>['service','reunion'].includes(o.type)).forEach(o=>{
          const cle=[o.type,o.label,o.j,o.debut,o.fin].join('|');
          if(!horsCours.has(cle))horsCours.set(cle,{...o,detail:a.sigle});
          else horsCours.get(cle).detail+=' · '+a.sigle;
        }));
        html=grillePersonne({id:'type-classe'},l,cx,true,[...occ,...horsCours.values()]);
      }else {try{S.lundi=l;html=grilleClasse(nom,!peutPlacer(nom));}finally{S.lundi=ancien;}}
      const b=personne?K.bilan(cx,personne.id,l):null;
      return `<section class="comparaison-semaine">${dates.length>1 && b?`<h2>Semaine ${S.C.parite(l)} · ${K.fmtH(b.total)}${b.contrat==null?'':` / ${K.fmtH(b.contrat)}`}</h2>`:''}${html.replaceAll('data-a=',`data-lundi="${l}" data-a=`)}</section>`;
    }).join('');
    const aide=type?'<p class="bandeau">EDT type · organisation habituelle pour la période affichée. Sans absences, vacances, PFMP ni réunions ponctuelles. Consultation.</p>':'';
    return aide+(dates.length>1?`<div class="planning-horizontal" tabindex="0" role="region" aria-label="Planning semaines A et B, défilement horizontal"><div class="planning-ab" data-affichage="${S.route.p.affichage==='jour'?'jour':'semaine'}">${contenu}</div></div>`:contenu);
  }
  function ecranEdt() {
    const p = P(), nom = classeCourante(), k = S.edt.classes[nom], sem = S.C.semaine(S.lundi);
    const pf = (k.pfmp || []).filter(x => x.debut <= K.ajoute(S.lundi, 4) && x.fin >= S.lundi);
    const vue=S.route.p.vue || 'planning';
    const tete=`<div class="salut"><div class="ligne">${vue!=='planning'?'<button class="rond" data-a="edt-page" data-v="planning" aria-label="Retour au planning">←</button>':''}<h1 id="titre" tabindex="-1">${vue==='planning'?'Emploi du temps':vue==='reunions'?'Réunions':'Réglages'}</h1></div><div class="ligne">${selecteurSemaine()}${vue==='planning'?'<button type="button" class="rond" data-a="edt-page" data-v="reglages" aria-label="Réglages">⚙️</button>':''}</div></div>
      ${modePlanning ? `<div class="classes" aria-label="Pôle">${POLES.map(q=>`<button data-a="planning-pole" data-v="${q.id}" aria-pressed="${q.id===p.id}">${esc(q.nom)}</button>`).join('')}</div>`:''}`;
    if(vue==='reunions') return tete+reunionsPole();
    const classes=`<div class="classes" role="group" aria-label="Classe">${classesDu(p.id).map(n=>`<button type="button" id="cls-${n}" data-a="classe" data-v="${n}" aria-pressed="${n===nom}">${esc(S.edt.classes[n].court)}</button>`).join('')}</div>`;
    if(vue==='reglages') return tete+classes+panneauVerification()+`${accesComplet()?lignePeriode():''}
      <div class="carte pad"><h2>PFMP · ${esc(k.court)}</h2><p>${(k.pfmp||[]).map(x=>`${K.jjmm(x.debut)} → ${K.jjmm(x.fin)}`).join(' · ')||'Aucune période'}</p>${accesComplet()?'<button class="btn" data-a="pfmp">Modifier les PFMP</button>':''}</div>
      ${pf.length && accesComplet() ? carteLiberes(nom) : ''}${bandeauServices()}<div class="carte pad carte-reunions"><h2>Réunions</h2><button class="btn" data-a="edt-page" data-v="reunions">Réunion d’équipe · Réunion instit.</button></div><button class="btn" data-a="planning-excel">Exporter en Excel · A et B</button>`;
    const id=S.route.p.aesh, personne=K.aeshActifs(idx(),P().id).find(a=>a.id===id), bilan=personne?K.bilan(S.route.p.edtType?contexteType(ctx()):ctx(),id,S.lundi):null;
    return tete+(modePlanning && [...S.docs.values()].some(d=>d.type==='verification' && d.statut==='brouillon')?panneauVerification():'')+(personne?`<h2 style="border-left:5px solid ${couleurAesh(id)};padding-left:10px">${esc(personne.sigle)} · Toutes ses classes${S.route.p.parite==='AB'?'':` · ${K.fmtH(bilan.total)}${bilan.contrat==null?'':` / ${K.fmtH(bilan.contrat)}`}`}</h2>`:classes)+`
      <div class="ligne filtre-grille"><div class="choix" role="group" aria-label="Vue">${['semaine','jour'].map(v=>`<button type="button" data-a="edt-vue" data-v="${v}" aria-pressed="${(S.route.p.affichage||'semaine')===v}">${v==='semaine'?'Semaine':'Jour'}</button>`).join('')}</div><label>AESH <select data-i="filtre-aesh" id="filtre-aesh"><option value="">Tous</option>${K.aeshActifs(idx(),P().id).map(a=>`<option value="${esc(a.id)}" ${a.id===id?'selected':''}>${esc(a.sigle)}</option>`).join('')}</select></label></div>
      <div class="ligne"><div class="choix" role="group" aria-label="Alternance">${[['AB','Semaine type'],['A','Détail A'],['B','Détail B']].map(([v,t])=>`<button data-a="edt-parite" data-v="${v}" aria-pressed="${(S.route.p.parite || (personne?'AB':S.C.parite(S.lundi)))===v}">${t}</button>`).join('')}</div><button class="btn" data-a="edt-type" aria-pressed="${!!S.route.p.edtType}">EDT type</button></div>
      ${S.route.p.affichage==='jour'?`<nav class="edt-jours" aria-label="Jour">${K.JOURS_C.map((j,i)=>`<button type="button" data-a="edt-jour" data-v="${i}" aria-pressed="${+(S.route.p.jour||0)===i}">${j}</button>`).join('')}</nav>`:''}
      ${personne && (S.route.p.parite||'AB')==='AB' ? '' : '<button class="btn" data-a="export-grille">Exporter la grille · PDF / Excel</button>'}
      ${grillesPlanning(personne,nom)}`;
  }
  function reunionsPole() {
    const liste=K.aeshActifs(idx(),P().id),groupes=P().id==='PSR_MELEC'?['PSR','MELEC']:[P().id];
    const equipes=groupes.map(g=>{const l=liste.filter(a=>P().id!=='PSR_MELEC'||a.filieres?.[g] || (g==='PSR'&&['aesh_d01','aesh_d02','aesh_d03','aesh_d04'].includes(a.id)) || !Object.keys(a.filieres||{}).length);
      return `<div class="carte pad carte-reunions"><h2>Réunion d’équipe · ${esc(g)}</h2>${l.length?l.map(a=>{const r=K.reunionDe(a);return `<p><b style="color:${couleurAesh(a.id)}">${esc(a.sigle)}</b> · ${r?`${K.JOURS[r.jour]} ${K.hFr(r.debut)}–${K.hFr(r.fin)}`:'Horaire à renseigner dans sa fiche'}</p>`;}).join(''):'<p>Aucun AESH rattaché</p>'}</div>`;}).join('');
    return equipes+(modePlanning && !accesComplet()?`<div class="carte pad"><h2>Réunion instit.</h2>${idx().reunions.map(r=>`<p>${K.dateLongue(r.date)} · ${K.hFr(r.debut)}–${K.hFr(r.fin)}</p>`).join('')||'<p>Aucune date prévue</p>'}<p>Dates fixées par les référents.</p></div>`:ecranReunions());
  }
  /* ─── Plage fixe et totaux par jour (25/09/2026) ───
     Les fiches papier des référents tiennent toutes sur la même plage, 8 h → 18 h : les
     créneaux de trente minutes du midi y sont visibles même quand personne ne travaille
     l'après-midi. Ce qui dépasse 18 h passe dans la bande « Soirée », sous la grille,
     plutôt que d'étirer toute la journée. Chaque jour porte son total, comme au crayon. */
  const FIN_GRILLE = 18 * 60;
  function grillePersonne(a,lundi=S.lundi,cx=ctx(),type=false,liste=null) {
    const tous=(liste || K.occupations(cx,a.id,lundi)).filter(o=>!['repos','vacances'].includes(o.type)),px=1.25,fin=FIN_GRILLE;
    const occ=tous.filter(o=>K.min(o.debut)<fin), soir=tous.filter(o=>K.min(o.fin)>fin), tot=totauxJours(K,tous);
    return `<div class="semaine-repere">${type?'EDT type · ':''}Semaine ${S.C.parite(lundi)||'—'} · ${K.jjmm(lundi)}–${K.jjmm(K.ajoute(lundi,4))}</div><div class="defile"><div class="grille-edt" data-vue="${S.route.p.affichage==='jour'?'jour':'semaine'}" data-jour="${+(S.route.p.jour||0)}"><div class="g-tete"></div>${K.JOURS.map((j,i)=>`<div class="g-tete jour-col" data-j="${i}">${j}<small>${K.jjmm(K.ajoute(lundi,i))}</small></div>`).join('')}<div class="g-heures" style="height:${(fin-480)*px}px">${Array.from({length:(fin-480)/60+1},(_,i)=>`<span style="top:${i*60*px}px">${8+i}h</span>`).join('')}</div>${K.JOURS.map((j,i)=>{
      const l=occ.filter(o=>o.j===i),cols=[];l.forEach(o=>{let n=cols.findIndex(c=>c.every(x=>!K.chevauche(x.debut,x.fin,o.debut,o.fin)));if(n<0){n=cols.length;cols.push([]);}cols[n].push(o);o.col=n;});
      return `<div class="g-jour jour-col" data-j="${i}" style="height:${(fin-480)*px}px">${l.map(o=>`<button type="button" ${type?'disabled':''} data-a="${o.cours?'personne-cours':'service-detail'}" data-v="${o.cours?esc(o.cours.id):i}" class="occupation-aesh ${o.absent?'abs':''} ${o.sem&&o.sem!=='AB'?'une-semaine':''} ${(K.min(o.fin)-K.min(o.debut))<45?'court':''}" style="top:${(K.min(o.debut)-480)*px}px;height:${(Math.min(K.min(o.fin),fin)-K.min(o.debut))*px-2}px;left:${o.col*100/cols.length}%;width:${100/cols.length}%;border-left:5px solid ${couleurAesh(a.id)}">${o.sem&&o.sem!=='AB'?`<span class="pastille-sem">${o.sem}</span>`:''}<b>${esc(o.cours?.lib || libelleService(o.label))}</b>${o.cours?`<small>${esc(o.cours.cls.map(c=>S.edt.classes[c]?.court||c).join(' / '))}</small>`:''}<small>${K.hFr(o.debut)}–${K.hFr(o.fin)}</small>${o.detail?`<small>${esc(o.detail)}</small>`:''}${o.absent?'<small>Absent</small>':''}</button>`).join('')}</div>`;
    }).join('')}<div class="g-pied">Total</div>${K.JOURS.map((j,i)=>`<div class="g-pied jour-col" data-j="${i}">${esc(libelleTotal(K,tot[i]))}</div>`).join('')}</div></div>${soir.length?`<div class="bande-soiree"><b>Soirée</b>${soir.map(o=>`<span>${esc(K.JOURS[o.j])} ${K.hFr(o.debut)}–${K.hFr(o.fin)} · ${esc(o.cours?.lib || libelleService(o.label))}</span>`).join('')}</div>`:''}`;
  }

  function palettePlanning() {
    const cx=ctx();
    return `<div class="equipe-compacte" role="group" aria-label="AESH et heures de la semaine">${K.aeshActifs(cx.I,P().id).map(a=>{
      const b=K.bilan(cx,a.id,S.lundi);
      return `<button type="button" class="btn" style="border-left:6px solid ${couleurAesh(a.id)}" data-a="selection-aesh" data-v="${esc(a.id)}"><b>${esc(a.sigle)}</b><span>${K.fmtH(b.total)}${b.contrat==null?'':` / ${K.fmtH(b.contrat)}`}</span></button>`;
    }).join('')}</div>`;
  }

  /* ─── Cantine et internat, sous la grille (17/09/2026, demande de Brahim) ───
     À part de la grille, pour ne pas l'embrouiller. Tous pôles confondus : un AESH de CAPa peut être
     à la cantine le même jour qu'un des vôtres, et chaque référent le voit. */
  const SERVICES_BANDE = ['Cantine', 'Internat'];
  function nomsServices() {
    const l = [...SERVICES_BANDE];
    [...idx().aesh.values()].forEach(a => K.servicesDe(a).forEach(x => { if (!l.includes(x.nom)) l.push(x.nom); }));
    return l;
  }
  function bandeauServices() {
    const anciens=K.aeshActifs(idx(),P().id).flatMap(a=>K.servicesDe(a).filter(x=>!x.calendrierDepuis || x.calendrierDepuis>S.lundi).map(x=>`${a.sigle} · ${libelleService(x.nom)} : ${K.fmtH(x.h)}`));
    return `<div class="carte pad services-bande"><h2>DP — Demi-pension, internat et dispositifs</h2><p class="muted">Repas et soirées : chaque créneau daté compte à sa durée réelle, selon A ou B.</p><button type="button" class="btn" data-a="service-horaire">＋ Planifier DP, internat ou dispositif</button>${resumeHorsClasse()}${anciens.length?`<p class="bandeau">Horaires à préciser : ${esc(anciens.join(' · '))}. Ces volumes restent comptés provisoirement.</p>`:''}</div>`;
  }
  function resumeHorsClasse() {
    return `<div class="hors-classe">${K.JOURS_C.map((j,i)=>{
      const l=K.aeshActifs(idx(),P().id).flatMap(a=>K.occupations(ctx(),a.id,S.lundi).filter(o=>o.j===i && ['service','reunion','institution'].includes(o.type)).map(o=>`<span class="pill" style="border-left:6px solid ${couleurAesh(a.id)}">${esc(a.sigle)} · ${esc(libelleService(o.label))} ${K.hFr(o.debut)}–${K.hFr(o.fin)}</span>`));
      return l.length?`<p><b>${j}</b> ${l.join(' ')}</p>`:'';
    }).join('')}</div>`;
  }
  function feuilleServiceHoraire(f) {
    const champ=(key,label,values)=>`<label>${label} <select id="sh-${key}" data-i="service-champ" data-champ="${key}">${values.map(([v,l])=>`<option value="${esc(v)}" ${String(f[key])===String(v)?'selected':''}>${esc(l)}</option>`).join('')}</select></label>`;
    const services=K.servicesDe(idx().aesh.get(f.aeshId)||{});
    return teteFeuille('Planifier un service','DP = Demi-pension · les horaires indiqués comptent dans la semaine choisie.')+`<div class="presence-reglage">${champ('aeshId','AESH',K.aeshActifs(idx(),P().id).map(a=>[a.id,a.sigle]))}${champ('nom','Activité',['Cantine','Internat','DAFI','PIAL','Autre'].map(n=>[n,libelleService(n)]))}${f.nom==='Autre'?`<label>Activité <input id="sh-libelle" data-i="service-champ" data-champ="libelle" maxlength="40" value="${esc(f.libelle||'')}" placeholder="Nom du service"></label>`:''}${champ('jour','Jour',K.JOURS.map((j,i)=>[i,j]))}${champ('debut','De',CRENEAUX_H.map(h=>[h,K.hFr(h)]))}${champ('fin','À',CRENEAUX_H.map(h=>[h,K.hFr(h)]))}${champ('semaines','Semaines',[['AB','A et B'],['A','A seulement'],['B','B seulement']])}${['du','au'].map(k=>`<label>${k==='du'?'À partir du':'Jusqu’au'} <input id="sh-${k}" type="date" data-i="service-champ" data-champ="${k}" value="${esc(f[k])}"></label>`).join('')}<p>Le calendrier précis remplace le volume forfaitaire de cette activité à partir de la date indiquée. Le passé est conservé.</p><button type="button" class="btn valider" data-a="service-enregistrer">Vérifier le créneau</button></div><h3>Créneaux déjà prévus</h3>${services.flatMap((s,si)=>(s.horaires||[]).map((h,hi)=>`<p>${esc(libelleService(s.nom))} · ${K.JOURS[h.jour]} ${h.debut}–${h.fin} · ${h.semaines} · ${K.jjmm(h.du)} → ${K.jjmm(h.au)} <button class="btn petit" data-a="service-fin" data-v="${si}|${hi}">Arrêter à partir du ${K.jjmm(f.du)}</button></p>`)).join('')}`;
  }
  async function sauvegarderService(f,services) {
    const attendu=f.base.get(f.aeshId);
    if(!attendu) {toast('Le référent doit d’abord enregistrer la fiche AESH.',true);return;}
    await ecrireTransaction(f.aeshId,actuel=>{
      if(actuel?.version!==attendu.version || JSON.stringify(actuel?.services || [])!==JSON.stringify(attendu.services || [])) throw Object.assign(new Error('La fiche a changé. Rouvrez le service.'),{code:'conflit',champs:['services']});
      return {...actuel,services,revisionPlanning:(+actuel.revisionPlanning||0)+1};
    });
  }
  function enregistrerServiceHoraire() {
    const f=S.feuille;
    if(!f.aeshId || !K.RE_DATE.test(f.du)||!K.RE_DATE.test(f.au)||f.au<f.du||K.min(f.fin)<=K.min(f.debut)) {toast('Vérifiez les dates et les horaires.',true);return;}
    const nom=f.nom==='Autre'?String(f.libelle||'').trim().slice(0,40):f.nom; if(!nom){toast('Indiquez le nom du service.',true);return;}
    const services=K.servicesDe(idx().aesh.get(f.aeshId)).map(x=>JSON.parse(JSON.stringify(x)));
    let x=services.find(x=>x.nom===nom);
    if(!x){x={nom,h:K.duree(f.debut,f.fin),jours:[],horaires:[]};services.push(x);}
    x.calendrierDepuis=x.calendrierDepuis && x.calendrierDepuis<f.du ? x.calendrierDepuis:f.du;
    x.horaires=x.horaires||[];
    const h={jour:f.jour,debut:f.debut,fin:f.fin,du:f.du,au:f.au,semaines:f.semaines};
    if(x.horaires.some(y=>JSON.stringify(y)===JSON.stringify(h))){toast('Ce créneau existe déjà.',true);return;}
    x.horaires.push(h); x.jours=[...new Set([...x.jours,f.jour])];
    const futur={...ctx(),I:{...idx(),aesh:new Map(idx().aesh)}};
    futur.I.aesh.set(f.aeshId,{...idx().aesh.get(f.aeshId),services});
    const alertes=[...new Set(K.lundisEntre(S.C,f.du,f.au).flatMap(l=>K.bilan(futur,f.aeshId,l).alertes.map(a=>a.texte)))];
    confirmerPuis({titre:'Enregistrer ce service ?',grand:libelleService(nom),lignes:[['AESH',idx().aesh.get(f.aeshId).sigle],['Horaires',`${K.JOURS[f.jour]} ${f.debut}–${f.fin} (${K.fmtH(K.duree(f.debut,f.fin))})`],['Période',`${f.du} → ${f.au} · ${f.semaines}`]],avert:alertes.join('\n'),bouton:'Enregistrer'},async()=>{await sauvegarderService(f,services);return {};});
  }
  function terminerService(b) {
    const f=S.feuille,[si,hi]=b.dataset.v.split('|').map(Number);
    if(!K.RE_DATE.test(f.du))return;
    const services=K.servicesDe(idx().aesh.get(f.aeshId)).map(x=>JSON.parse(JSON.stringify(x))),h=services[si].horaires[hi];
    h.au=h.au<K.ajoute(f.du,-1)?h.au:K.ajoute(f.du,-1);
    confirmerPuis({titre:'Arrêter ce créneau ?',grand:libelleService(services[si].nom),sous:`À partir du ${K.dateCourte(f.du)}. Les dates précédentes restent conservées.`,bouton:'Confirmer'},async()=>{await sauvegarderService(f,services);return {};});
  }
  function feuilleService(f) {
    const I = idx(), l = K.aeshActifs(I), dedans = new Set(f.choisis);
    const ordre = [...l].sort((x, y) => (dedans.has(y.id) ? 1 : 0) - (dedans.has(x.id) ? 1 : 0));
    return teteFeuille(`${esc(f.nom)} · ${esc(K.JOURS[f.j].toLowerCase())}`, 'Qui assure ce service ce jour-là ? Tous les pôles sont proposés.') + `
      <div class="choix-aesh" role="group" aria-label="AESH">${ordre.map(a => {
        const on = f.choisis.includes(a.id), q = pole(rattachementDe(a)) || P(), b = K.bilan(ctx(), a.id, S.lundi);
        return `<button type="button" id="sa-${esc(a.id)}" data-a="serv-choix" data-v="${esc(a.id)}" aria-pressed="${on}" style="${on ? '' : `border-color:${q.couleur}30`}"><b>${esc(a.sigle)}</b><small style="color:${q.couleur}">${esc(q.nom)}</small><small>${on ? '✓ ' + esc(f.nom.toLowerCase()) : b && b.reste != null ? `reste ${K.fmtH(b.reste)}` : ''}</small></button>`;
      }).join('')}</div>
      <div class="actions"><button type="button" class="btn" id="sv-fermer" data-a="fermer">Annuler</button>
        <button type="button" class="btn valider" id="sv-valider" data-a="serv-valider" ${JSON.stringify([...f.choisis].sort()) === JSON.stringify([...f.avant].sort()) ? 'disabled' : ''}>✓ Enregistrer</button></div>`;
  }
  function validerService() {
    const f = S.feuille, I = idx(), sig = id => (I.aesh.get(id) || {}).sigle || '?';
    const ajout = f.choisis.filter(x => !f.avant.includes(x)), retrait = f.avant.filter(x => !f.choisis.includes(x));
    const lignes = [['Service', `${f.nom} · ${K.JOURS[f.j].toLowerCase()}`]];
    if (ajout.length) lignes.push(['Ajout', ajout.map(sig).join(', ')]);
    if (retrait.length) lignes.push(['Retrait', retrait.map(sig).join(', ')]);
    const avert = ajout.map(id => { const a = I.aesh.get(id); if (!a) return ''; const h = K.servicesDe(a).find(x => x.nom === f.nom);
      return h ? '' : `${a.sigle} : ${f.nom.toLowerCase()} n’était pas dans sa fiche, il y est ajouté (heures à compléter).`; }).filter(Boolean);
    const garde = { ...f };
    S.feuille = { type: 'confirmer', titre: 'Vous confirmez ?', grand: `${f.nom} · ${K.JOURS_C[f.j]}`, lignes, bouton: 'Confirmer', retourService: garde, avert: avert.join('\n'),
      travail: async () => {
        const lot = [];
        for (const id of [...ajout, ...retrait]) {
          const a = idx().aesh.get(id); if (!a) continue;
          const doc = JSON.parse(JSON.stringify(a)); delete doc.depart;
          const serv = K.servicesDe(doc).map(x => ({ ...x, jours: [...x.jours] }));
          let x = serv.find(y => y.nom === f.nom);
          if (ajout.includes(id)) { if (!x) { x = { nom: f.nom, h: 1, jours: [] }; serv.push(x); } if (!x.jours.includes(f.j)) x.jours.push(f.j); x.jours.sort(); }
          else if (x) x.jours = x.jours.filter(j => j !== f.j);
          doc.services = serv; doc.dispos = K.disposDe(doc); delete doc.jours; delete doc.cantine; delete doc.internat; delete doc.service; delete doc.serviceLib;
          lot.push(doc);
        }
        await ecrireLot(lot);
        return {};
      } };
    rendre({ focus: 'cf-oui' });
  }

  /* ─── PFMP : AESH libérés et redéploiement (17/09/2026) ───
     Pendant la PFMP d'une classe, ses cours n'ont pas lieu. Les AESH qui y étaient placés sont libres sur ces
     créneaux : on les montre, et le référent peut les envoyer ailleurs — n'importe quelle classe, n'importe quel
     pôle — pour la semaine ou toute la PFMP. Les heures restent comptées dans SON pôle, comme ses autres placements.
     À la fin de la période, l'AESH retrouve de lui-même son cours habituel : rien n'est retiré. */
  const poleDeClasse = nom => (POLES.find(q => (S.edt.poles[q.id] || []).includes(nom)) || {}).id;
  const creneauxTxt = l => l.map(c => `${K.JOURS_C[c.j]} ${K.hFr(c.debut)}–${K.hFr(c.fin)}`).join(', ');
  function carteLiberes(nom) {
    const k = S.edt.classes[nom], l = K.liberesParPfmp(ctx(), nom, S.lundi);
    return `<div class="carte pad" style="display:grid;gap:8px"><div><h2>AESH libérés par la PFMP</h2><span class="muted" style="font-size:.9rem">${esc(k.court)} est en stage : ces AESH sont libres sur leurs créneaux habituels. Touchez-en un pour le placer ailleurs, dans n’importe quelle classe.</span></div>
      ${l.length ? `<div class="choix" role="group" aria-label="AESH libérés">${l.map(x => `<button type="button" id="lib-${esc(x.a.id)}" data-a="pfmp-deplacer" data-v="${esc(x.a.id)}"><b>${esc(x.a.sigle)}</b> <span class="muted">· ${K.fmtH(x.heures)} · ${esc(creneauxTxt(x.creneaux))}</span></button>`).join('')}</div>` : `<span class="muted">Aucun AESH n’était placé sur les cours de ${esc(k.court)} cette semaine.</span>`}</div>`;
  }
  function bornesDeplacer(f) {
    return K.bornesRenfort(S.edt.classes[f.source], S.lundi, f.periode) || { du: S.lundi, au: K.ajoute(S.lundi, -1), pf: null, ven: K.ajoute(S.lundi, 4) };
  }
  function feuilleDeplacer(f) {
    const I = idx(), a = I.aesh.get(f.aeshId) || { sigle: '?' }, src = S.edt.classes[f.source], { du, au, pf, ven } = bornesDeplacer(f);
    const lib = K.liberesParPfmp(ctx(), f.source, S.lundi).find(x => x.a.id === f.aeshId);
    const classes = f.pole ? classesDu(f.pole).filter(n => n !== f.source) : [];
    const poss = f.classe ? K.coursPossibles(ctx(), f.aeshId, [f.classe], du, au, P().id) : [];
    const libres = poss.filter(x => x.d.etat === 'libre' && !x.d.deja && K.datesPlacement(ctx(), {aeshId:f.aeshId,coursId:x.c.id,du,au,sem:x.c.sem,renfortPfmp:f.source}).length), autres = poss.length - libres.length;
    /* D'abord les cours qui tombent PENDANT les créneaux libérés par la PFMP : c'est le temps que l'AESH vient de
       récupérer. Les autres cours où il est libre suivent, pour laisser le choix au référent. */
    const pendant = x => !!lib && lib.creneaux.some(k => k.j === x.c.j && K.chevauche(k.debut, k.fin, x.c.d, x.c.f));
    const boutonCours = x => `<button type="button" id="dep-k-${esc(x.c.id)}" data-a="dep-cours" data-v="${esc(x.c.id)}" aria-pressed="${f.choisis.includes(x.c.id)}">${K.JOURS_C[x.c.j]} ${K.hFr(x.c.d)}–${K.hFr(x.c.f)} · ${esc(x.c.lib)}${x.d.texte && x.d.texte !== 'libre' ? ` <span class="muted">· ${esc(x.d.texte)}</span>` : ''}</button>`;
    const libPendant = libres.filter(pendant), libAutres = libres.filter(x => !pendant(x));
    return teteFeuille(`Où placer ${esc(a.sigle)} ?`, `${esc(src.court)} en PFMP${lib ? ` · libre ${esc(creneauxTxt(lib.creneaux))}` : ''}`) + `
      <div style="display:grid;gap:6px"><b>Pour</b><div class="choix" role="group" aria-label="Période">
        <button type="button" id="dep-sem" data-a="dep-periode" data-v="semaine" aria-pressed="${f.periode === 'semaine'}">Cette semaine <span class="muted">(${K.jjmm(S.lundi)} → ${K.jjmm(ven)})</span></button>
        ${pf && pf.fin > ven ? `<button type="button" id="dep-pfmp" data-a="dep-periode" data-v="pfmp" aria-pressed="${f.periode === 'pfmp'}">Toute la PFMP <span class="muted">(jusqu’au ${K.jjmm(pf.fin)})</span></button>` : ''}</div></div>
      <div style="display:grid;gap:6px"><b>Pôle</b><div class="choix" role="group" aria-label="Pôle">${POLES.map(q => `<button type="button" id="dep-p-${q.id}" data-a="dep-pole" data-v="${q.id}" aria-pressed="${f.pole === q.id}">${esc(q.nom)}</button>`).join('')}</div></div>
      ${f.pole ? `<div style="display:grid;gap:6px"><b>Classe</b><div class="choix" role="group" aria-label="Classe">${classes.map(n => `<button type="button" id="dep-c-${n}" data-a="dep-classe" data-v="${n}" aria-pressed="${f.classe === n}">${esc(S.edt.classes[n].court)}</button>`).join('')}</div></div>` : ''}
      ${f.classe ? `<div style="display:grid;gap:6px">${libres.length ? `${libPendant.length ? `<b>Pendant son temps libéré</b><div class="choix" role="group" aria-label="Cours pendant le temps libéré" id="dep-pendant">${libPendant.map(boutonCours).join('')}</div>` : `<span class="muted">Aucun cours de cette classe pendant son temps libéré.</span>`}${libAutres.length ? `<b style="margin-top:6px">Autres cours où ${esc(a.sigle)} est libre</b><div class="choix" role="group" aria-label="Autres cours" id="dep-autres">${libAutres.map(boutonCours).join('')}</div>` : ''}` : `<span class="muted">Aucun cours libre pour ${esc(a.sigle)} dans cette classe sur la période.</span>`}${autres ? `<span class="muted" style="font-size:.85rem">${autres} autre${autres > 1 ? 's' : ''} cours : déjà pris, réunion, absence ou contrat atteint.</span>` : ''}</div>` : ''}
      <div class="actions"><button type="button" class="btn" id="dep-fermer" data-a="fermer">Fermer</button><button type="button" class="btn valider" id="dep-valider" data-a="dep-valider" ${f.choisis.length ? '' : 'disabled'}>✓ Placer</button></div>`;
  }
  function validerDeplacer() {
    const f = S.feuille, I = idx(), a = I.aesh.get(f.aeshId), p = P(), { du, au } = bornesDeplacer(f);
    const cours = f.choisis.map(id => S.edt.cours[id]).filter(Boolean);
    if (!a || !cours.length) return;
    if (cours.some(c => !K.datesPlacement(ctx(),{aeshId:a.id,coursId:c.id,du,au,sem:c.sem,renfortPfmp:f.source}).length)) {
      toast('Ce renfort ne correspond plus à un créneau libéré par la PFMP. Rouvrez le choix des cours.',true); return;
    }
    const chevauchent = cours.some((x, i) => cours.some((y, k) => k > i && K.placementsEnConflit(ctx(), {aeshId:a.id,coursId:x.id,du,au,sem:x.sem}, {aeshId:a.id,coursId:y.id,du,au,sem:y.sem})));
    if (chevauchent) { toast('Deux cours choisis se chevauchent : gardez-en un seul par créneau.', true); return; }
    const garde = { ...f }, src = S.edt.classes[f.source], dest = S.edt.classes[f.classe];
    S.feuille = { type: 'confirmer', titre: 'Vous confirmez ?', grand: a.sigle, bouton: 'Confirmer', retourDeplacer: garde,
      lignes: [['Libéré par', `PFMP ${src.court}`], ['Placé en', `${dest.court} · ${nomPole(poleDeClasse(f.classe))}`], ['Cours', cours.map(c => `${K.JOURS_C[c.j]} ${K.hFr(c.d)}–${K.hFr(c.f)} ${c.lib}`).join(' · ')], ['Période', `du ${K.dateCourte(du)} au ${K.dateCourte(au)}`], ['Heures comptées dans', p.nom]],
      avert: [`Après le ${K.dateCourte(finPourAesh(a, au))}, ${a.sigle} retrouve ses cours habituels en ${src.court}.`,
        K.finContratDe(a) && K.finContratDe(a) < au ? `Son contrat s’arrête le ${K.dateLongue(K.finContratDe(a))} : le placement s’arrêtera là.` : '',
        poleDeClasse(f.classe) !== p.id ? `${dest.court} est une classe de ${nomPole(poleDeClasse(f.classe))} : un message part à son référent.` : ''].filter(Boolean).join('\n'),
      travail: async () => {
        /* Même règles que le placement ordinaire (audit D10, 18/09) : fin de contrat respectée, référent de la
           classe d'arrivée prévenu s'il est d'un autre pôle, et tout part en un seul lot. */
        const auA = finPourAesh(a, au), lot = [];
        if (auA < du) throw Object.assign(new Error('contrat terminé'), { code: 'contrat' });
        cours.forEach(c => lot.push({ id: 'place_' + alea(), type: 'place', aeshId: a.id, pole: p.id, coursId: c.id, classes: c.cls, jour: c.j, debut: c.d, fin: c.f, sem: c.sem, matiere: c.lib, du, au: auA, statut: 'active', renfortPfmp:f.source }));
        const poleDest = poleDeClasse(f.classe);
        if (poleDest && poleDest !== p.id) {
          const texte = `@ ${nomPole(poleDest)} — pendant la PFMP de ${src.court}, ${a.sigle} est placé en ${dest.court} : ${cours.map(c => `${K.JOURS_C[c.j]} ${K.hFr(c.d)}–${K.hFr(c.f)} ${c.lib}`).join(', ')}, du ${K.dateCourte(du)} au ${K.dateCourte(auA)}. C’est d’accord pour vous ?`;
          lot.push({ id: 'msg_' + alea(), type: 'message', pole: p.id, texte: texte.slice(0, 1000), statut: 'active' });
        }
        await ecrireLot(lot, f.base);
        return { sous: `En ${dest.court} pendant la PFMP de ${src.court}${poleDest && poleDest !== p.id ? ` · message envoyé au référent ${nomPole(poleDest)}` : ''}` };
      } };
    rendre({ focus: 'cf-oui' });
  }

  function ouvrirPlacement(coursId,nom) {
    const c=S.edt.cours[coursId],I=idx(),iso=K.ajoute(S.lundi,c.j);
        if (S.C.semaine(S.lundi).toute) return;
        const choisis = [...new Set(I.places.filter(x => placeIci(x, c, S.lundi)).map(x => x.aeshId))];
        const horaires = {}; choisis.forEach(id => { const ps = I.places.filter(y => y.aeshId === id && placeIci(y,c,S.lundi)).map(y => K.horairePlace(y,c)); if(ps.length>1 || ps[0]?.partiel) horaires[id]=ps.map(h => ({debut:h.debut,fin:h.fin})); });
        ouvrir({ type: 'placer', du: S.lundi, coursId: coursId, classe: nom, choisis, horaires, horairesInit: JSON.parse(JSON.stringify(horaires)), periode: 'annee', semaines: c.sem === 'SA' ? 'A' : c.sem === 'SB' ? 'B' : choisis.length ? S.C.parite(S.lundi) : 'AB', semainesInit: c.sem === 'SA' ? 'A' : c.sem === 'SB' ? 'B' : choisis.length ? S.C.parite(S.lundi) : 'AB', renforts: {}, base: new Map(S.docs), au: '', autres: choisis.some(id => !((I.aesh.get(id) || {}).equipes || {})[P().id]) });
        if (S.aeshChoisi) {
          const id = S.aeshChoisi; S.aeshChoisi = null;
          const choix = document.getElementById('pa-' + id);
          if (choix && !S.feuille.choisis.includes(id)) choix.click();
        }
          }
  /* feuille « placer des AESH » */
  function feuillePlacer(f) {
    const p = P(), c = S.edt.cours[f.coursId], nom = f.classe, I = idx(), cx = ctx(), iso = K.ajoute(S.lundi, c.j);
    const au = finPeriode(f), du = f.du || S.lundi;
    const bes = K.besoinDuCours(S.est, nom, c, quand(iso));
    const dejaIci = new Set(I.places.filter(x => placeIci(x, c, S.lundi)).map(x => x.aeshId));
    const aVenir = I.places.filter(x => placeAVenir(x, c, du) && I.aesh.get(x.aeshId));
    const prevuIci = a => K.prevuPourClasse(a, FILIERES, nom).prevu || !K.prevuPourClasse(a, FILIERES, nom).connu;
    const enContrat = a => !K.contratFini(a, du);
    const candidats = K.aeshActifs(I, p.id).filter(enContrat).slice().sort((x, y) => (prevuIci(y) ? 1 : 0) - (prevuIci(x) ? 1 : 0)), dispo = K.disponiblesAilleurs(cx, p.id, S.lundi, poleComplet), dispoDe = Object.fromEntries(dispo.map(x => [x.a.id, x]));
    const libereDe = a => K.liberePfmpCreneau(cx, a.id, S.lundi, c.j, c.d, c.f);
    const autres = K.aeshActifs(I).filter(a => accesComplet() && !(a.equipes || {})[p.id] && enContrat(a))
      .sort((x, y) => (libereDe(y) ? 1 : 0) - (libereDe(x) ? 1 : 0) || ((dispoDe[y.id] || {}).dispo || 0) - ((dispoDe[x.id] || {}).dispo || 0));
    const liberes = autres.filter(a => libereDe(a));
    /* Rien n'est interdit : un AESH pris, en réunion ou au bout de ses heures reste choisissable.
       Ce qui pose problème est écrit sur son bouton, puis rappelé dans « Vous confirmez ? ». */
    const bouton = (a, ailleurs) => {
      const d = K.disponibilite(cx, a.id, c.id, du, au, p.id, {semaines:f.semaines, ...plagesDe(f.horaires[a.id],c)[0]}), on = f.choisis.includes(a.id);
      const cl = d.etat === 'pris' && !dejaIci.has(a.id) ? 'pris' : d.etat === 'trop' ? 'trop' : d.etat === 'reunion' ? 'reunion' : '';
      const b = K.bilan(cx, a.id, S.lundi), x = dispoDe[a.id];
      const pv = K.prevuPourClasse(a, FILIERES, nom);
      const ligne3 = ailleurs ? (x ? `${K.fmtH(x.dispo)} dispo · ${x.complets.map(q => nomPole(q.p) + (q.complet ? ' complet' : ' en cours')).join(', ')}` : `${Object.keys(a.equipes || {}).map(nomPole).join(', ')} · rien de disponible`) : (b ? `${K.fmtH(b.total)}${b.contrat==null?'':' / '+K.fmtH(b.contrat)}` : '');
      const ct = d.contrainte, lib = libereDe(a);
      return `<button type="button" class="${cl} ${lib ? 'libere' : ''} ${ct ? (ct.etat === 'x' ? 'indispo' : 'souhait') : ''}" style="border-left:8px solid ${couleurAesh(a.id)}" id="pa-${esc(a.id)}" data-a="choix-aesh" data-v="${esc(a.id)}" aria-pressed="${on}" title="${esc(d.detail || '')}"><b>${esc(a.sigle)}</b><small>${on ? '✓ choisi' : esc(dejaIci.has(a.id) ? 'placé' : d.texte)}</small>${ligne3 ? `<small>${esc(ligne3)}</small>` : ''}${lib ? `<small class="ct-lib">libre · PFMP ${esc(S.edt.classes[lib].court)}</small>` : ''}${ct && !on ? `<small class="${ct.etat === 'x' ? 'ct-x' : 'ct-s'}">${ct.etat === 'x' ? '✕ contrat' : '◐ souhait'}</small>` : ''}${pv.connu && !pv.prevu && !dejaIci.has(a.id) ? `<small class="horspr">pas prévu ici</small>` : ''}</button>`;
    };
    const avant = [...dejaIci], ajout = f.choisis.filter(x => !dejaIci.has(x)), retrait = avant.filter(x => !f.choisis.includes(x));
    const rac = raccourcis().filter(r => ['annee','semaine'].includes(r.id)).sort((a,b) => a.id === 'annee' ? -1 : 1);
    const pasH = []; for (let m = K.min(c.d); m <= K.min(c.f); m += 30) pasH.push(K.hDe(m)); if (pasH[pasH.length - 1] !== c.f) pasH.push(c.f);
    const horaires = f.choisis.length ? `<div class="guide-etape"><b>À quelle heure ?</b>${f.choisis.map(id => { const a = I.aesh.get(id), h = f.horaires[id]; return `<div class="presence-reglage"><b style="color:${couleurAesh(id)}">● ${esc(a ? a.sigle : id)}</b>
      <div class="choix"><button type="button" id="ph-tout-${esc(id)}" data-a="horaire-tout" data-v="${esc(id)}" aria-pressed="${!h}">Tout le cours</button><button type="button" id="ph-part-${esc(id)}" data-a="horaire-partie" data-v="${esc(id)}" aria-pressed="${!!h}">Une partie du cours</button></div>
      ${h ? plagesDe(h,c).map((v,i) => `<div class="ligne"><label>De <select id="ph-d-${esc(id)}-${i}" data-i="ph-debut" data-v="${esc(id)}" data-index="${i}">${pasH.slice(0,-1).map(x => `<option value="${x}" ${x===v.debut?'selected':''}>${K.hFr(x)}</option>`).join('')}</select></label><label>à <select id="ph-f-${esc(id)}-${i}" data-i="ph-fin" data-v="${esc(id)}" data-index="${i}">${pasH.slice(1).map(x => `<option value="${x}" ${x===v.fin?'selected':''}>${K.hFr(x)}</option>`).join('')}</select></label><span>${K.fmtH(K.duree(v.debut,v.fin))}</span>${plagesDe(h,c).length>1?`<button type="button" data-a="horaire-retirer" data-v="${esc(id)}" data-index="${i}">Retirer ce passage</button>`:''}</div>`).join('')+`<button type="button" class="btn petit" data-a="horaire-ajouter" data-v="${esc(id)}">＋ Un autre passage dans ce cours</button>` : `<span>${K.hFr(c.d)}–${K.hFr(c.f)} · ${K.fmtH(K.duree(c.d,c.f))}</span>`}</div>`; }).join('')}</div>` : '';
    const modifHoraire = f.choisis.some(id => dejaIci.has(id) && JSON.stringify(f.horaires[id] || null) !== JSON.stringify(f.horairesInit[id] || null));
    return teteFeuille(`${K.JOURS[c.j]} ${K.hFr(c.d)}–${K.hFr(c.f)}`, `${esc(c.lib)} · ${esc(c.cls.map(n => S.edt.classes[n].court).join(' + '))}${c.salle.length ? ' · ' + esc(c.salle.join(' · ')) : ''}${c.sem === 'SA' ? ' · semaine A' : c.sem === 'SB' ? ' · semaine B' : ''}`) + `
      <section class="demande-cours"><div class="bandeau ${bes && presents(c,iso,bes)<bes.nb?'err':'info'}">${resumeDemande(c,iso,bes)}</div>${peutEstimer(nom)?`<button type="button" class="lien" data-a="expliquer-besoin" data-v="${esc(c.id)}" data-classe="${esc(nom)}">Modifier la demande</button>`:''}</section>
      <div><b>Qui accompagne ?</b></div>
      ${aVenir.length ? `<div class="bandeau info">À venir : ${aVenir.map(x => `<b>${esc(I.aesh.get(x.aeshId).sigle)}</b> dès le ${esc(K.dateCourte(x.du))}`).join(', ')} <span class="muted">· vérifiez la période : une nouvelle présence peut remplacer ces prévisions</span></div>` : ''}
      <div class="choix-aesh" role="group" aria-label="AESH du pôle">${candidats.map(a => bouton(a)).join('')}</div>
      ${autres.length ? ((f.autres || liberes.length) ? `<div><b>Autres pôles</b>${liberes.length ? ` <span class="puce warn">${liberes.length} libéré${liberes.length > 1 ? 's' : ''} par une PFMP</span>` : ''} <span class="muted" style="font-weight:500;font-size:.9rem">· triés par heures disponibles</span></div><div class="choix-aesh" role="group" aria-label="AESH des autres pôles">${autres.map(a => bouton(a, true)).join('')}</div>` : `<button type="button" class="lien" id="pa-autres" data-a="autres-aesh">＋ AESH d’un autre pôle${dispo.length ? ` (${dispo.length} avec des heures disponibles)` : ''}</button>`) : ''}
      ${horaires}
      <div class="guide-etape"><b>Quelles semaines ?</b><div class="choix" role="group" aria-label="Semaines du placement">${(c.sem === 'SA' ? ['A'] : c.sem === 'SB' ? ['B'] : ['A','B','AB']).map(q => `<button type="button" id="pl-sem-${q}" data-a="pl-semaines" data-v="${q}" aria-pressed="${f.semaines === q}">${q === 'AB' ? 'A et B' : q + ' seulement'}</button>`).join('')}</div></div>
      ${Object.entries(f.renforts || {}).filter(([id]) => f.choisis.includes(id)).map(([id,r]) => `<div class="bandeau info"><b>Renfort PFMP · ${esc((I.aesh.get(id)||{}).sigle)}</b><br>En soutien depuis ${esc(r.source)}, du ${K.dateCourte(r.du)} au ${K.dateCourte(r.au)}. Son planning habituel et les AESH déjà placés sont conservés.</div>`).join('')}
      <div style="display:grid;gap:8px"><b>Pour quelle période ?</b><label>À partir du <input id="pl-du" type="date" data-i="pl-du" value="${esc(du)}" min="${esc(S.C.debut || S.lundi)}" max="${esc(au)}"></label><b>Jusqu’à</b><div class="choix" role="group" aria-label="Période">${rac.map(r => `<button type="button" id="per-${r.id}" data-a="periode" data-v="${r.id}" aria-pressed="${f.periode === r.id}">${esc(r.label)} <span class="muted">(${K.jjmm(r.fin)})</span></button>`).join('')}
        <button type="button" id="per-date" data-a="periode" data-v="date" aria-pressed="${f.periode === 'date'}">Une date</button></div>
        ${f.periode === 'date' ? `<input type="date" id="per-au" data-i="per-au" value="${esc(f.au || '')}" min="${esc(du)}">` : ''}</div>
      <div class="actions"><button type="button" class="btn" id="pl-fermer" data-a="fermer">Fermer</button>
        <button type="button" class="btn valider" id="pl-valider" data-a="valider-placer" ${(ajout.length || retrait.length || modifHoraire || f.semaines !== f.semainesInit || du !== S.lundi) && K.RE_DATE.test(du) && K.RE_DATE.test(au) && au >= du ? '' : 'disabled'}>Vérifier le placement →</button></div>`;
  }
  function raccourcis() {
    const l = S.lundi, out = [{ id: 'semaine', label: 'Cette semaine', fin: K.ajoute(l, 4) }, { id: 'edt', label: 'Période de l’emploi du temps', fin: periodeEdt() }];
    const avant = debut => { let f = K.ajoute(debut, -1); while (K.jourSemaine(f) > 4 || S.C.off(f)) f = K.ajoute(f, -1); return f; };
    S.C.vacances.filter(v => /^Vacances/.test(v.label) && !/été/.test(v.label) && v.debut > l).slice(0, 2)
      .forEach(v => out.push({ id: 'v-' + v.debut, label: `Jusqu’aux ${v.label.charAt(0).toLowerCase()}${v.label.slice(1)}`, fin: avant(v.debut) }));
    const ete = S.C.vacances.find(v => /été/.test(v.label));
    out.push({ id: 'annee', label: 'Fin de l’année scolaire', fin: ete ? avant(ete.debut) : '2027-07-02' });
    return out;
  }
  const finPeriode = f => f.periode === 'date' ? (f.au || '') : ((raccourcis().find(r => r.id === f.periode) || {}).fin || '');
  /* La fin de contrat l'emporte sur la période : après, l'AESH n'est plus là. */
  const finPourAesh = (a, au) => { const f = K.finContratDe(a); return f && f < au ? f : au; };

  /* ─────────── vue d'ensemble ─────────── */
  function ecranEnsemble() {
    const p = P(), I = idx(), cx = ctx(), tous = !!S.route.p.tous, liste = tous ? K.aeshActifs(I) : K.aeshActifs(I, p.id), sem = S.C.semaine(S.lundi);
    const mode = ['liste', 'aesh'].includes(S.route.p.mode) ? S.route.p.mode : 'classes', modeListe = mode === 'liste';
    let sel = S.route.p.aesh; if (!liste.some(a => a.id === sel)) sel = (liste[0] || {}).id;
    if (mode === 'classes') {
      const pv = pole(S.route.p.pole) || p, cls = classesDu(pv.id); let nom = S.route.p.classe; if (!cls.includes(nom)) nom = cls[0];
      const k = S.edt.classes[nom], lecture = pv.id !== p.id;
      return `<div class="salut"><div><h1 id="titre" tabindex="-1">Vue d’ensemble</h1><p class="sous">Les emplois du temps de chaque pôle · ${sem.parite ? 'semaine ' + sem.parite : 'pas de cours'}</p></div>${selecteurSemaine()}</div>
        <div class="ligne ecarte"><div class="choix" role="group" aria-label="Pôle">${[p, ...POLES.filter(x => x.id !== p.id)].map(x => `<button type="button" id="ens-p-${x.id}" data-a="ens-pole" data-v="${x.id}" aria-pressed="${x.id === pv.id}" style="${x.id === pv.id ? `background:${x.couleur};border-color:${x.couleur};color:#fff` : `color:${x.couleur}`}">${esc(x.nom)}</button>`).join('')}</div>
          <div class="choix" role="group" aria-label="Affichage"><button type="button" id="ens-classes" data-a="ens-mode" data-v="classes" aria-pressed="true">Par classe</button><button type="button" id="ens-paraesh" data-a="ens-mode" data-v="aesh" aria-pressed="false">Par AESH</button><button type="button" id="ens-liste" data-a="ens-mode" data-v="liste" aria-pressed="false">Tableau</button></div></div>
        <div class="classes" role="group" aria-label="Classe">${cls.map(n => `<button type="button" id="ens-c-${n}" data-a="ens-classe" data-v="${n}" aria-pressed="${n === nom}" style="${n === nom ? `background:${pv.couleur};border-color:${pv.couleur}` : ''}">${esc(S.edt.classes[n].court)}</button>`).join('')}</div>
        ${lecture ? `<div class="bandeau info">Emploi du temps du pôle ${esc(pv.nom)}, en lecture. Seul son référent y place des AESH.</div>` : `<div class="muted" style="font-size:.9rem">Touchez un cours pour placer un AESH.</div>`}
        ${grilleClasse(nom, lecture)}`;
    }
    const tete = `<div class="salut"><div><h1 id="titre" tabindex="-1">Vue d’ensemble</h1><p class="sous">${tous ? 'Tous les pôles' : esc(p.nom)} · ${sem.parite ? 'semaine ' + sem.parite : 'pas de cours'}</p></div>${selecteurSemaine()}</div>
      <div class="ligne ecarte"><div class="choix" role="group" aria-label="Qui"><button type="button" id="ens-pole" data-a="ens-tous" data-v="0" aria-pressed="${!tous}">Mon pôle</button><button type="button" id="ens-tous" data-a="ens-tous" data-v="1" aria-pressed="${tous}">Tous les pôles</button></div>
        <div class="choix" role="group" aria-label="Affichage"><button type="button" id="ens-classes" data-a="ens-mode" data-v="classes" aria-pressed="false">Par classe</button><button type="button" id="ens-paraesh" data-a="ens-mode" data-v="aesh" aria-pressed="${!modeListe}">Par AESH</button><button type="button" id="ens-liste" data-a="ens-mode" data-v="liste" aria-pressed="${modeListe}">Tableau</button></div></div>
      <div class="legende">${POLES.map(x => `<span><span class="occ" style="--oc:${x.couleur};display:inline-block;width:auto">${esc(x.nom)}</span></span>`).join('')}<span><span class="occ gris" style="display:inline-block;width:auto">réunion, service</span></span><span><span class="occ absence" style="display:inline-block;width:auto">absence</span></span></div>`;
    if (!liste.length) return tete + `<div class="etat-vide"><b>Aucun AESH</b></div>`;
    if (modeListe) {
      let g = `<div class="t"></div>${sem.jours.map((jr, j) => `<div class="t">${K.JOURS[j]} <span class="muted" style="font-weight:600">${K.jjmm(jr.date)}</span></div>`).join('')}`;
      liste.forEach(a => {
        const b = K.bilan(cx, a.id, S.lundi), occ = b.occ, pa = pole(Object.keys(a.equipes || {})[0]) || p;
        g += `<button type="button" class="n" id="e-${esc(a.id)}" data-a="fiche" data-v="${esc(a.id)}"><span class="sigle" style="--pole:${pa.couleur}">${esc(a.sigle)}</span><span><b>${K.fmtH(b.total)}</b><small>${b.reste == null ? 'contrat à compléter' : `reste ${K.fmtH(b.reste)}`}</small>${b.alertes.some(x => x.type === 'conflit' || x.type === 'contrat') ? '<small style="color:var(--err);font-weight:700">⚠ alerte</small>' : ''}</span></button>`;
        [0, 1, 2, 3, 4].forEach(j => {
          const l = occ.filter(o => o.j === j);
          g += `<div class="c">${l.length ? l.map(o => {
            if (o.type === 'vacances' || o.type === 'repos') return `<span class="occ vac">${esc(o.label)}</span>`;
            if (o.type === 'cours') { const pc = pole(o.pole) || p; return `<button type="button" class="occ ${o.absent ? 'abs' : ''}" style="--oc:${pc.couleur}" id="eo-${esc(a.id)}-${esc(o.cours.id)}" data-a="edt-cours" data-v="${esc(o.cours.cls.find(n => classesDu(p.id).includes(n)) || o.cours.cls[0])}|${esc(o.cours.id)}" title="${esc(`${K.hFr(o.debut)}–${K.hFr(o.fin)} ${o.cours.lib} · ${nomPole(o.pole)}`)}">${K.hFr(o.debut)} ${esc(o.cours.cls.map(n => n.replace(/^(C[12]|B[12T])/, '$1 ')).join('/'))}</button>`; }
            if (o.type === 'absence') return `<span class="occ absence">${esc(o.label)}</span>`;
            return `<span class="occ gris">${K.hFr(o.debut)} ${esc(o.type === 'institution' ? 'réunion instit.' : 'réunion')}</span>`;
          }).join('') : '<span class="libre">libre</span>'}</div>`;
        });
      });
      return tete + `<div class="defile"><div class="ens">${g}</div></div>`;
    }
    /* mode emploi du temps : un AESH à la fois, grille comme celle des classes */
    const a = I.aesh.get(sel), b = K.bilan(cx, sel, S.lundi), occ = b.occ.filter(o => o.type !== 'vacances');
    const services=K.aeshActifs(I,P().id).flatMap(a=>K.occupations(ctx(),a.id,S.lundi).filter(o=>['service','reunion','institution'].includes(o.type)).map(o=>({...o,a})));
    const H0 = 8 * 60, H1 = Math.max(18*60,...services.map(o=>K.min(o.fin))), PX = 1.25;
    const serviceHtml=j=>{
      const groupes=new Map(); services.filter(o=>o.j===j).forEach(o=>{const key=[o.label,o.debut,o.fin].join('|');if(!groupes.has(key))groupes.set(key,{...o,personnes:[]});groupes.get(key).personnes.push(o.a);});
      const liste=[...groupes.values()].sort((a,b)=>a.debut.localeCompare(b.debut)), cols=[]; liste.forEach(o=>{let n=cols.findIndex(l=>l.every(x=>!K.chevauche(x.debut,x.fin,o.debut,o.fin)));if(n<0){n=cols.length;cols.push([]);}cols[n].push(o);o.col=n;});
      return liste.map(o=>`<button type="button" data-a="service-detail" data-v="${j}" class="service-grille" style="width:${34/cols.length}%;right:calc(2px + ${o.col*34/cols.length}%);top:${(K.min(o.debut)-H0)*PX}px;height:${(K.min(o.fin)-K.min(o.debut))*PX-2}px"><b>${esc(libelleService(o.label))}</b><small>${K.hFr(o.debut)}–${K.hFr(o.fin)}</small><span>${o.personnes.map(a=>`<span style="border-left:4px solid ${couleurAesh(a.id)}">${esc(a.sigle)}</span>`).join(' ')}</span></button>`).join('');
    };
    [0, 1, 2, 3, 4].forEach(j => { const l = occ.filter(o => o.j === j && o.type !== 'repos').sort((x, y) => K.min(x.debut) - K.min(y.debut)), cols = []; l.forEach(o => { let i = cols.findIndex(col => col.every(x => !K.chevauche(x.debut, x.fin, o.debut, o.fin))); if (i < 0) { cols.push([]); i = cols.length - 1; } cols[i].push(o); o._col = i; }); l.forEach(o => { o._cols = Math.max(1, ...l.filter(x => K.chevauche(x.debut, x.fin, o.debut, o.fin)).map(x => x._col + 1)); }); });
    const bloc = o => {
      const top = (K.min(o.debut) - H0) * PX, h = (K.min(o.fin) - K.min(o.debut)) * PX, w = `calc(${100 / (o._cols || 1)}% - 6px)`, left = `${3 + (o._col || 0) * (100 / (o._cols || 1))}%`;
      if (o.type === 'cours') { const pc = pole(o.pole) || p, cls = o.cours.cls.find(n => classesDu(p.id).includes(n)); const lib = `${K.JOURS[o.j]} ${K.hFr(o.debut)}–${K.hFr(o.fin)}, ${o.cours.lib}, ${o.cours.cls.map(n => S.edt.classes[n].court).join(' + ')}, ${nomPole(o.pole)}${o.absent ? ', absent : à couvrir' : ''}`;
        return `<button type="button" class="bloc ${o.absent ? 'couvrir' : ''}" style="--mc:${pc.couleur};top:${top + 1}px;height:${h - 2}px;left:${left};width:${w}${cls ? '' : ';cursor:default'}" ${cls ? `data-a="edt-cours" data-v="${esc(cls)}|${esc(o.cours.id)}"` : ''} aria-label="${esc(lib)}"><b>${esc(o.cours.lib)}</b>${h > 30 ? `<span class="salle">${esc(o.cours.cls.map(n => S.edt.classes[n].court).join(' + '))}</span>` : ''}${h > 46 ? `<span class="salle">${esc((o.cours.salle || []).join(' · '))}</span>` : ''}<span class="pills"><span class="pill" style="border-color:${pc.couleur};color:${pc.couleur}">${esc(nomPole(o.pole))}</span>${o.absent ? '<span class="pill abs">absent</span>' : ''}</span></button>`; }
      const coul = o.type === 'absence' ? 'var(--err)' : '#64748b';
      return `<div class="bloc" style="--mc:${coul};top:${top + 1}px;height:${h - 2}px;left:${left};width:${w};cursor:default"><b>${esc(o.label)}</b>${o.type === 'absence' && o.absence && o.absence.note && h > 30 ? `<span class="salle">${esc(o.absence.note)}</span>` : ''}</div>`;
    };
    let grille = `<div class="semaine-repere">Semaine ${esc(sem.parite||'—')} · ${K.jjmm(S.lundi)}–${K.jjmm(K.ajoute(S.lundi,4))}</div><div class="defile"><div class="grille-edt" data-vue="${S.route.p.affichage==='jour'?'jour':'semaine'}" data-jour="${+(S.route.p.jour||0)}"><div class="g-tete"></div>${sem.jours.map((jr, j) => `<div class="g-tete jour-col" data-j="${j}">${K.JOURS[j]}<small>${K.jjmm(jr.date)}</small></div>`).join('')}
      <div class="g-heures" style="height:${(H1 - H0) * PX}px">${Array.from({ length: (H1-H0)/60+1 }, (_, i) => `<span style="top:${i * 60 * PX}px">${8 + i}h</span>`).join('')}</div>`;
    sem.jours.forEach((jr, j) => { const repos = occ.find(o => o.j === j && o.type === 'repos');
      grille += `<div class="g-jour jour-col" data-j="${j}" style="height:${(H1 - H0) * PX}px">${Array.from({ length: (H1-H0)/60 }, (_, i) => `<div class="g-ligne" style="top:${(i + 1) * 60 * PX}px"></div>`).join('')}${jr.off ? `<div class="g-vac">${esc(jr.off)}</div>` : repos ? `<div class="g-vac">Ne travaille pas</div>` : occ.filter(o => o.j === j && o.type !== 'repos').map(bloc).join('')}</div>`; });
    grille += `</div></div>`;
    return tete + `<div class="classes" role="group" aria-label="AESH">${liste.map(x => { const pa = pole(Object.keys(x.equipes || {})[0]) || p; return `<button type="button" id="ens-a-${esc(x.id)}" data-a="ens-aesh" data-v="${esc(x.id)}" aria-pressed="${x.id === sel}" style="${x.id === sel ? `background:${pa.couleur};border-color:${pa.couleur}` : ''}">${esc(x.sigle)}</button>`; }).join('')}</div>
      <div class="ligne ecarte"><span><b>${esc(a.sigle)}</b> · ${K.fmtH(b.total)} cette semaine${b.reste != null ? ` · reste ${K.fmtH(b.reste)}` : ''}</span><button type="button" class="btn petit" data-a="fiche" data-v="${esc(a.id)}">Sa fiche ›</button></div>
      ${grille}`;
  }

  const peutEstimer = nom => !modePlanning && !!S.session && classesDu(S.session.pole).includes(nom);
  function editeurBesoin(f) {
    if(!peutEstimer(f.classe)) return '';
    if(S.estEtat!=='ok' || !f.cible) return '<p class="bandeau info">Saisie indisponible : le cadre des estimations doit être chargé et ce cours doit y être identifié sans ambiguïté.</p>';
    const d=f.base, c=f.cible;
    return `<hr><h3>Modifier le nombre demandé</h3>
      <div class="choix" role="group" aria-label="Nombre d’AESH demandés">${[0,1,2,3,4,5,6].map(n=>`<button type="button" id="besoin-nb-${n}" data-a="besoin-nombre" data-v="${n}" aria-pressed="${f.nb===n}" ${S.envoi?'disabled':''}>${n}</button>`).join('')}</div>
      <p>Semaines : <b>${esc(c.cr.parite || (d?.semaines==='A'||d?.semaines==='B' ? d.semaines : 'A et B'))}</b> · du ${K.jjmm(c.periode.debut)} au ${K.jjmm(d?.au || c.periode.fin)}.</p>

      <button type="button" class="btn valider" data-a="besoin-enregistrer" ${Number.isInteger(f.nb)&&!S.envoi?'':'disabled'}>${S.envoi?'Enregistrement…':f.confirmation?'Confirmer le besoin : '+f.nb+' AESH':'Valider le nombre'}</button>`;
  }
  async function sauverBesoin() {
    const f=S.feuille;
    if(S.envoi || f?.type!=='besoin-detail' || !peutEstimer(f.classe) || !f.cible || S.estEtat!=='ok') return;
    if(!f.confirmation){f.confirmation=true;rendre();return;}
    S.envoi=true; rendre();
    try {
      const d=await avecDelai(enregistrerBesoin(FS,db,f.cible,f.base,f.nb));
      S.estDocs.set(d.id,d); S.est=S.est.filter(x=>x.id!==d.id).concat(d);
      S.envoi=false; fermer(); toast('Besoin enregistré et partagé avec les enseignants et Antoine.');
    } catch(e) { S.envoi=false; toast(e.code==='besoin-conflit'?e.message:messageErreur(e),true); }
  }

  /* ─────────── besoins ─────────── */
  function besoinsResume(pid) {
    let estimes = 0, manque = 0; const vus = new Set();
    classesDu(pid).forEach(nom => S.edt.classes[nom].cours.forEach(id => {
      const c = S.edt.cours[id], iso = K.ajoute(S.lundi, c.j), bes = K.besoinDuCours(S.est, nom, c, quand(iso)); if (!bes) return;
      if (vus.has(id)) return; vus.add(id); estimes++;
      if (bes.nb > 0 && K.coursALieu(S.C, S.edt, c, iso) && presents(c, iso, bes) < bes.nb) manque++;
    }));
    return { estimes, manque };
  }
  /* ═══════════ Élèves notifiés (26/09/2026) ═══════════
     Une entrée par classe, une ligne par CODE de suivi — jamais un nom, jamais un prénom.
     Deux vues sur la même liste : « Aide humaine » sert à placer les AESH toute l'année ;
     « Aménagements d'épreuve » remplit le formulaire d'organisation des CCF du lycée.
     Le support d'épreuve vient de l'Atelier (profil d'édition de l'élève) : il s'affiche,
     il ne se modifie pas ici — sinon deux vérités divergeraient au premier changement. */
  const EL_AMEN = [['tiers', '1/3 temps'], ['lecteur', 'Lecteur'], ['scripteur', 'Scripteur'],
    ['assistant', 'Assistant'], ['ordi', 'Ordinateur'], ['agrandi', 'Sujet agrandi']];
  const EL_NOTIFS = [['oui', 'notifiée'], ['encours', 'en cours'], ['non', 'non']];
  const EL_AIDES = [['individualisee', 'ind.'], ['mutualisee', 'mut.'], ['aucune', 'aucune']];
  const EL_DOCS = [['PPS', 'PPS'], ['PAP', 'PAP'], ['', 'aucun']];

  const docEleves = nom => S.docs.get('eleves_' + nom + '_' + S.annee) || null;
  function elevesDe(nom) {
    const d = docEleves(nom);
    if (d && Array.isArray(d.eleves)) return d.eleves;
    const r = (S.roster && S.roster.classes || []).find(c => c.nom === nom);
    return (r ? r.codes : []).map(code => ({ code, notif: 'non', aide: 'aucune', heures: '', ulis: false, fin: '', doc: '', amenagements: [], support: '' }));
  }
  const comptesEleves = nom => comptesClasse(elevesDe(nom));
  const libelleEleves = nom => libelleClasse(comptesClasse(elevesDe(nom)));

  function ecranEleves() {
    const vue = S.route.p.vueEleves === 'epreuve' ? 'epreuve' : 'aide';
    const ouverte = S.route.p.classeEleves || '';
    const seg = (act, v, opts) => `<div class="seg" role="group">${opts.map(([k, t]) =>
      `<button type="button" data-a="${act}" data-v="${esc(k)}" aria-pressed="${v === k}" class="${v === k ? 'on' : ''}">${esc(t)}</button>`).join('')}</div>`;
    const blocs = POLES.map(q => {
      const classes = (S.edt.poles[q.id] || []);
      return `<h2 class="tete-pole" style="border-left-color:${q.couleur}">${esc(q.nom)}</h2>` + classes.map(nom => {
        const k = S.edt.classes[nom]; if (!k) return '';
        const c = comptesEleves(nom), ouvert = ouverte === nom;
        const liste = elevesDe(nom);
        const resume = `${c.total} élève${c.total > 1 ? 's' : ''} · ${c.notifies} notifié${c.notifies > 1 ? 's' : ''}${c.ai ? ' · ' + c.ai + ' ind.' : ''}${c.am ? ' · ' + c.am + ' mut.' : ''}${c.ulis ? ' · ' + c.ulis + ' ULIS' : ''}`;
        if (!ouvert) return `<button type="button" class="carte-classe" id="cle-${esc(nom)}" data-a="eleves-classe" data-v="${esc(nom)}"><b>${esc(k.court)}</b><span>${esc(resume)}</span></button>`;
        const lignes = liste.map((e, i) => {
          const am = Array.isArray(e.amenagements) ? e.amenagements : [];
          if (vue === 'epreuve') return `<tr>
            <td><span class="codeel">${esc(e.code)}</span></td>
            <td>${seg('el-doc|' + nom + '|' + i, e.doc || '', EL_DOCS)}</td>
            ${EL_AMEN.map(([cle]) => `<td class="ctr"><button type="button" class="case ${am.includes(cle) ? 'on' : ''}" data-a="el-amen" data-v="${esc(nom)}|${i}|${cle}" aria-pressed="${am.includes(cle)}" aria-label="${esc(cle)}">${am.includes(cle) ? '✓' : ''}</button></td>`).join('')}
            <td class="sup">${e.support ? esc(e.support) : '<span class="muet">—</span>'}</td></tr>`;
          return `<tr>
            <td><span class="codeel">${esc(e.code)}</span></td>
            <td>${seg('el-notif|' + nom + '|' + i, e.notif || 'non', EL_NOTIFS)}</td>
            <td>${seg('el-aide|' + nom + '|' + i, e.aide || 'aucune', EL_AIDES)}</td>
            <td><input class="petitchamp" id="elh-${esc(nom)}-${i}" data-i="el-heures" data-v="${esc(nom)}|${i}" value="${esc(e.heures || '')}" placeholder="—" inputmode="decimal" maxlength="6" aria-label="Heures notifiées"></td>
            <td class="ctr"><button type="button" class="case ${e.ulis ? 'on' : ''}" data-a="el-ulis" data-v="${esc(nom)}|${i}" aria-pressed="${!!e.ulis}" aria-label="ULIS">${e.ulis ? '✓' : ''}</button></td>
            <td><input class="datechamp" id="elf-${esc(nom)}-${i}" data-i="el-fin" data-v="${esc(nom)}|${i}" value="${esc(e.fin || '')}" placeholder="—" maxlength="10" aria-label="Notifiée jusqu’au"></td></tr>`;
        }).join('');
        const tete = vue === 'epreuve'
          ? `<th>Code</th><th>PAP / PPS</th>${EL_AMEN.map(([, t]) => `<th class="ctr">${t}</th>`).join('')}<th>Support (Atelier)</th>`
          : '<th>Code</th><th>Notification</th><th>Aide humaine</th><th>Heures</th><th class="ctr">ULIS</th><th>Notifiée jusqu’au</th>';
        return `<section class="cl-ouverte">
          <div class="ligne cl-tete"><button type="button" class="rond" id="cle-fermer" data-a="eleves-classe" data-v="" aria-label="Refermer">←</button>
            <h3>${esc(k.court)}</h3></div>
          <div class="totaux"><span><b>${c.total}</b> élèves</span><span><b>${c.notifies}</b> notifiés</span>
            <span><b>${c.ai}</b> individualisée</span><span><b>${c.am}</b> mutualisée</span>
            <span><b>${c.ulis}</b> ULIS</span><span><b>${K.fmtH(c.heures)}</b> notifiées</span></div>
          <div class="ligne">${seg('eleves-vue', vue, [['aide', 'Aide humaine'], ['epreuve', 'Aménagements d’épreuve']])}
            ${vue === 'epreuve' ? '<button type="button" class="btn petit" data-a="eleves-ccf" data-v="' + esc(nom) + '">⬇ Tableau pour le CCF</button>' : ''}</div>
          <div class="defile-t"><table class="tel"><thead><tr>${tete}</tr></thead><tbody>${lignes}</tbody></table></div>
          ${docEleves(nom) ? '' : '<p class="bandeau">Classe jamais renseignée : les codes viennent des codes de suivi. Le premier enregistrement crée la fiche.</p>'}
        </section>`;
      }).join('');
    }).join('');
    return `<div class="salut"><div><h1 id="titre" tabindex="-1">Élèves</h1>
      <p class="sous">Codes de suivi uniquement · aucun nom en ligne</p></div></div>${blocs}`;
  }

  /* Enregistre sans faire attendre : l'écran suit tout de suite, le réseau derrière.
     Une erreur remet la valeur d'avant et le dit — jamais de modification perdue en silence. */
  function enregistrerEleve(nom, i, patch) {
    const liste = elevesDe(nom).map(x => ({ ...x, amenagements: Array.isArray(x.amenagements) ? [...x.amenagements] : [] }));
    if (!liste[i]) return;
    const avant = S.docs.get('eleves_' + nom + '_' + S.annee);
    Object.assign(liste[i], patch);
    const d = { ...(avant || {}), id: 'eleves_' + nom + '_' + S.annee, type: 'eleves', classe: nom, eleves: liste };
    S.docs.set(d.id, d); versionDocs++; rendre({ donnees: true });
    ecrire(d).catch(e => {
      if (avant) S.docs.set(d.id, avant); else S.docs.delete(d.id);
      versionDocs++; rendre({ donnees: true });
      toast(e && e.code === 'permission-denied' ? 'Règle Firestore « eleves » pas encore publiée.' : 'Enregistrement impossible. Réessayez.', true);
    });
  }

  /* Le tableau que réclame le formulaire « Organisation des CCF » du lycée, prêt à recopier. */
  function tableauCcf(nom) {
    const k = S.edt.classes[nom] || { court: nom };
    const l = elevesDe(nom).filter(e => (e.notif && e.notif !== 'non') || e.doc || (e.amenagements || []).length);
    if (!l.length) { toast('Aucun élève à besoins particuliers dans cette classe.', true); return; }
    const lignes = l.map(e => [e.code, e.doc || '', ...EL_AMEN.map(([c]) => (e.amenagements || []).includes(c) ? 'X' : ''), e.support || ''].join('\t')).join('\n');
    const tete = ['Élève (code)', 'PAP ou PPS', ...EL_AMEN.map(([, t]) => t), 'Support'].join('\t');
    const txt = `Organisation des CCF — élèves à besoins particuliers\n${k.court} · ${S.annee}\n\n${tete}\n${lignes}\n`;
    import('./fichiers.js?v=2026-09-24i')
      .then(F => F.telecharger(new Blob([txt], { type: 'text/plain;charset=utf-8' }), `CCF-${nom}-${S.annee}.txt`))
      .catch(() => toast('Téléchargement impossible.', true));
  }

  /* Écrit une classe. Le document porte la liste entière : une seule version par classe. */
  async function majEleve(nom, i, patch) {
    const liste = elevesDe(nom).map(x => ({ ...x, amenagements: Array.isArray(x.amenagements) ? [...x.amenagements] : [] }));
    if (!liste[i]) return;
    Object.assign(liste[i], patch);
    const d = docEleves(nom) || { id: 'eleves_' + nom + '_' + S.annee, type: 'eleves', classe: nom };
    await ecrire({ ...d, id: 'eleves_' + nom + '_' + S.annee, type: 'eleves', classe: nom, eleves: liste });
  }

  function ecranBesoins() {
    const p = P(), I = idx(), filtre = S.route.p.classe || '', fMat = S.route.p.mat || '';
    let lignes = '', demandees = 0, total = 0, estimes = 0, manque = 0; const comptes = new Set();
    /* « Pas encore estimé » (18/09, demande de Brahim) : les cours sans aucune estimation sur la période,
       regroupés par matière — la matière suffit au référent pour savoir quel collègue aller voir (aucun nom en ligne). */
    const manquants = new Map();
    classesDu(p.id).filter(n => !filtre || n === filtre).forEach(nom => {
      const k = S.edt.classes[nom];
      const cours = k.cours.map(id => S.edt.cours[id]).sort((a, b) => a.j - b.j || K.min(a.d) - K.min(b.d));
      let entete = `<tr class="grp"><td colspan="6">${esc(k.court)}</td></tr>`;
      cours.forEach(c => {
        const premiere = !comptes.has(c.id); comptes.add(c.id); if (premiere) total++;
        /* estimé = un enseignant a répondu pour ce cours sur la période (quelle que soit la semaine affichée) */
        const estime = K.besoinDuCours(S.est, nom, c);
        if (premiere && estime) estimes++;
        if (premiere && !estime) { const m = manquants.get(c.lib) || { lib: c.lib, mat: c.mat, n: 0, classes: new Set() }; m.n++; (c.cls || [nom]).filter(x => S.edt.classes[x]).forEach(x => m.classes.add(x)); manquants.set(c.lib, m); }
        if (fMat && c.lib !== fMat) return;
        if (entete) { lignes += entete; entete = ''; }
        const iso = K.ajoute(S.lundi, c.j), bes = K.besoinDuCours(S.est, nom, c, quand(iso)), lieu = K.coursALieu(S.C, S.edt, c, iso);
        const pl = [...new Set(placesCours(c.id, iso).map(x => x.aeshId))].map(id => I.aesh.get(id)).filter(Boolean);
        const nPres = presents(c, iso, bes);
        if (bes && premiere && lieu) demandees += bes.nb * K.duree(bes.plageDebut, bes.plageFin);
        let etat = '<span class="muted">—</span>';
        if (bes && !lieu) etat = '<span class="puce">pas cette semaine</span>';
        else if (bes && bes.nb === 0) etat = '<span class="puce">pas besoin</span>';
        else if (bes && nPres >= bes.nb) etat = '<span class="puce ok">couvert</span>';
        else if (bes) { etat = `<span class="puce warn">manque ${bes.nb - nPres}</span>`; if (premiere) manque++; }
        lignes += `<tr id="b-${esc(nom)}-${esc(c.id)}" data-a="edt-cours" data-v="${esc(nom)}|${esc(c.id)}" tabindex="0">
          <td class="num" style="white-space:nowrap"><b>${K.JOURS_C[c.j]}</b> ${K.hFr(c.d)}–${K.hFr(c.f)}${c.sem === 'SA' ? ' <span class="puce">A</span>' : c.sem === 'SB' ? ' <span class="puce">B</span>' : ''}</td>
          <td><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${couleurMatiere(c.mat)[0]};margin-right:6px"></span>${esc(c.lib)}</td>
          <td>${bes ? `<span class="gros-nb">${bes.nb}</span>` : estime ? '<span class="muted">—</span>' : '<span class="puce warn">pas estimé</span>'}</td>
          <td>${bes && bes.eleves != null ? `${bes.eleves}` : '<span class="muted">—</span>'}</td>
          <td>${pl.map(a => `<span class="pill ${K.absentLe(I, a.id, iso, c.d, c.f) ? 'abs' : ''}">${esc(a.sigle)}</span>`).join(' ') || '<span class="muted">—</span>'}</td>
          <td>${etat}</td></tr>`;
      });
    });
    const prevu = K.aeshActifs(I, p.id).reduce((s, a) => s + (nombre((a.heures || {})[p.id]) || 0), 0);
    const ordre = [...manquants.values()].sort((a, b) => b.n - a.n || a.lib.localeCompare(b.lib, 'fr'));
    const nManq = ordre.reduce((t, m) => t + m.n, 0), ordreCl = classesDu(p.id);
    const blocManquants = S.estEtat !== 'ok' ? '' : !nManq ? `<div class="manq ok" id="bes-manq"><b>✓ Tous les cours sont estimés</b>${filtre ? ` <span>en ${esc(S.edt.classes[filtre].court)}</span>` : ''}</div>`
      : `<div class="manq" id="bes-manq"><div class="manq-t">⚠️ Pas encore estimé : ${nManq} cours${filtre ? ` <span>en ${esc(S.edt.classes[filtre].court)}</span>` : ''}</div>
        <div class="manq-l">${ordre.map((m, i) => `<button type="button" id="bm-${i}" data-a="bes-mat" data-v="${esc(m.lib)}" aria-pressed="${fMat === m.lib}"><i style="background:${couleurMatiere(m.mat)[0]}"></i><b>${esc(m.lib)}</b><span>${esc([...m.classes].sort((x, y) => ordreCl.indexOf(x) - ordreCl.indexOf(y)).map(x => S.edt.classes[x].court).join(', '))} · ${m.n} cours</span></button>`).join('')}</div></div>`;
    return `<div class="salut"><div><h1 id="titre" tabindex="-1">Besoins</h1><p class="sous">Renseignés par les enseignants ou les référents${S.cadreEst ? ` · ${esc(S.cadreEst.label || '')} ${K.jjmm(S.cadreEst.debut)} → ${K.jjmm(S.cadreEst.fin)}` : ''}</p></div>${selecteurSemaine()}</div>
      <div class="ligne"><button type="button" class="btn pri" id="bes-partager" data-a="partager">✉️ Envoyer le lien à mes collègues</button></div>
      ${S.estEtat === 'horsligne' ? `<div class="bandeau warn">Les estimations n’ont pas pu être lues.</div>` : ''}
      <div class="stats">
        <div class="carte stat"><b>${estimes}<span class="muted" style="font-size:1rem"> / ${total}</span></b><small>cours estimés</small></div>
        <div class="carte stat"><b>${K.fmtH(demandees)}</b><small>demandées cette semaine</small></div>
        <div class="carte stat"><b>${K.fmtH(prevu)}</b><small>heures AESH du pôle</small></div>
        <div class="carte stat"><b style="color:${manque ? 'var(--warn)' : 'var(--ok)'}">${manque}</b><small>cours à couvrir</small></div>
      </div>
      ${blocManquants}
      <div><h2>Résultat des estimations</h2><p class="sous">Ce que les enseignants ont demandé, cours par cours, face aux AESH placés.</p></div>
      <div class="classes" role="group" aria-label="Filtrer"><button type="button" id="bf-tout" data-a="bes-classe" data-v="" aria-pressed="${!filtre}">Toutes</button>${classesDu(p.id).map(n => `<button type="button" id="bf-${n}" data-a="bes-classe" data-v="${n}" aria-pressed="${filtre === n}">${esc(S.edt.classes[n].court)}</button>`).join('')}</div>
      ${fMat ? `<div class="ligne"><button type="button" class="btn petit" id="bes-mat-x" data-a="bes-mat" data-v="">✕ ${esc(fMat)} seulement</button></div>` : ''}
      <div class="defile"><table class="table" style="min-width:680px"><thead><tr><th>Créneau</th><th>Matière</th><th>Besoin</th><th>Élèves</th><th>Placés</th><th>État</th></tr></thead><tbody>${lignes}</tbody></table></div>
      ${manque ? carteDisponibles('Pour couvrir : disponibles ailleurs') : ''}`;
  }

  /* ─────────── messages ─────────── */
  function messagesNonLus() {
    if (!S.session) return 0;
    const lu = lsLit(K_LU, ''), I = idx();
    return I.messages.filter(m => m.statut === 'active' && m.pole !== S.session.pole && String(m.creeLe || '') > lu).length;
  }
  function marquerLus() { const I = idx(), der = I.messages.reduce((m, x) => String(x.creeLe || '') > m ? String(x.creeLe) : m, ''); if (der && der > lsLit(K_LU, '')) { lsEcrit(K_LU, der); } }
  function ecranMessages() {
    const I = idx(), moi = S.session.pole;
    return `<div class="salut"><div><h1 id="titre" tabindex="-1">Messages</h1><p class="sous">Entre référents · tous les pôles</p></div></div>
      <div class="fil" aria-live="polite">${I.messages.length ? (() => { let jour = ''; return I.messages.map(m => {
        const pm = pole(m.pole) || { nom: '?', couleur: '#64748b' }, mien = m.pole === moi, j = String(m.creeLe || '').slice(0, 10);
        const sep = j !== jour ? (jour = j, `<div class="jour-sep"><span>${esc(j === K.isoLocal() ? 'Aujourd’hui' : K.dateLongue(j))}</span></div>`) : '';
        return `${sep}<div class="bulle ${mien ? 'moi' : ''} ${m.statut !== 'active' ? 'retire' : ''}" style="--oc:${pm.couleur}"><span class="bulle-av">${avatarHtml(m.pole, 36)}</span><div class="bulle-corps"><div class="qui"><b>${esc(pm.nom)}</b><span>${esc(String(new Date(m.creeLe).getHours()))} h ${esc(K.z2(new Date(m.creeLe).getMinutes()))}</span>${mien && m.statut === 'active' ? `<button type="button" class="lien" style="font-size:.8rem" id="msg-ret-${esc(m.id)}" data-a="retirer-message" data-v="${esc(m.id)}">retirer</button>` : ''}</div><p>${m.statut === 'active' ? esc(m.texte) : 'Message retiré'}</p></div></div>`;
      }).join(''); })() : `<div class="etat-vide"><b>Aucun message</b>Écrivez le premier.</div>`}<span id="fil-fin"></span></div>
      <div class="ecrire"><div class="choix" role="group" aria-label="Écrire à" style="width:100%;gap:6px">${POLES.filter(x => x.id !== moi).map(x => `<button type="button" class="petit" id="a-${x.id}" data-a="ecrire-a" data-v="${x.id}" style="min-height:32px;padding:4px 10px;font-size:.85rem;border-color:${x.couleur}40;color:${x.couleur}">@ ${esc(x.nom)}</button>`).join('')}</div><label class="sr" for="msg-txt">Votre message</label><textarea id="msg-txt" data-i="msg" maxlength="1000" placeholder="Votre message (sans nom d’élève)">${esc(S.msgBrouillon)}</textarea>
        <button type="button" class="btn pri" id="msg-envoyer" data-a="envoyer-message" ${S.msgBrouillon.trim() && !S.envoi ? '' : 'disabled'}>${S.envoi ? '…' : 'Envoyer'}</button></div>`;
  }

  /* ─────────── exporter ─────────── */
  function ecranExporter() {
    const p = P(), I = idx(), e = S.exp, liste = K.aeshActifs(I, p.id);
    const choix = (id, v, l) => `<button type="button" id="x-q-${v}" data-a="exp-quoi" data-v="${v}" aria-pressed="${e.quoi === v}">${l}</button>`;
    const pret = e.quoi === 'pole' || e.quoi === 'tous' || e.ids.length;
    return `<div class="salut"><div><h1 id="titre" tabindex="-1">Exporter</h1><p class="sous">${esc(p.nom)}</p></div>${selecteurSemaine()}</div>
      <div class="carte pad" style="display:grid;gap:14px">
        <div style="display:grid;gap:8px"><b>Quoi</b><div class="choix" role="group" aria-label="Quoi">${choix('', 'pole', 'Toute l’équipe du pôle')}${choix('', 'aesh', 'Un ou plusieurs AESH')}${choix('', 'classe', 'Une ou plusieurs classes')}${choix('', 'tous', 'Tous les pôles')}</div></div>
        ${e.quoi === 'aesh' ? `<div class="choix" role="group" aria-label="AESH">${liste.map(a => `<button type="button" id="x-a-${esc(a.id)}" data-a="exp-id" data-v="${esc(a.id)}" aria-pressed="${e.ids.includes(a.id)}">${esc(a.sigle)}</button>`).join('')}</div>` : ''}
        ${e.quoi === 'classe' ? `<div class="choix" role="group" aria-label="Classes">${classesDu(p.id).map(n => `<button type="button" id="x-c-${n}" data-a="exp-id" data-v="${n}" aria-pressed="${e.ids.includes(n)}">${esc(S.edt.classes[n].court)}</button>`).join('')}</div>` : ''}
        <div style="display:grid;gap:8px"><b>Format</b><div class="tuiles" style="grid-template-columns:repeat(auto-fill,minmax(180px,1fr))">
          ${[['pdf', '📄', 'PDF', 'en couleurs, à imprimer'], ['excel', '📊', 'Excel', 'en couleurs, modifiable'], ['json', '💾', 'Sauvegarde', 'toutes les données (JSON)']].map(([k, ic, l, s]) => `<button type="button" class="tuile ${e.format === k ? 'forte' : ''}" style="min-height:110px" id="x-f-${k}" data-a="exp-format" data-v="${k}" aria-pressed="${e.format === k}"><span class="ic">${ic}</span><span><b>${l}</b><br><small>${s}</small></span></button>`).join('')}</div></div>
      </div>
      <div class="barre-bas"><button type="button" class="btn valider" id="x-telecharger" data-a="exporter" ${pret || e.format === 'json' ? '' : 'disabled'}>⬇ Télécharger</button></div>`;
  }
  function feuilleExportGrille(f) {
    const a=idx().aesh.get(S.route.p.aesh);
    const choix=(champ,options)=>`<div class="choix" role="group" aria-label="${champ}">${options.map(([v,t])=>`<button data-a="export-grille-choix" data-champ="${champ}" data-v="${v}" aria-pressed="${f[champ]===v}">${esc(t)}</button>`).join('')}</div>`;
    return teteFeuille('Exporter la grille',S.route.p.edtType?'EDT type · Toutes les classes':'Toutes les classes')+
      '<b>Pour qui ?</b>'+choix('qui',[...(a?[['personne',a.sigle]]:[]),['equipe','Toute l’équipe du pôle']])+
      '<b>Semaines</b>'+choix('semaines',[['TYPE','Semaine type · A et B réunies'],['A','A seule'],['B','B seule'],['separe','A et B séparées']])+
      '<p>Une fiche par AESH. La semaine type tient sur une page paysage : c’est le document à remettre à la personne.</p>'+choix('format',[['pdf','PDF'],['excel','Excel']])+
      `<button class="btn valider" data-a="export-grille-telecharger" ${S.envoi?'disabled':''}>${S.envoi?'Préparation…':'Télécharger'}</button>`;
  }
  /* Envoyer sa semaine type à l'AESH : le PDF est préparé et enregistré, puis le message
     s'ouvre, prêt à partir. Un navigateur ne sait pas joindre un fichier lui-même : la pièce
     jointe reste à glisser, et le message le dit. */
  async function envoyerGrille() {
    const cx=S.route.p.edtType?{...contexteType(ctx()),exportType:true}:ctx();
    const a=cx.I.aesh.get(S.route.p.aesh);
    if(!a){toast('Choisissez d’abord un AESH.',true);return;}
    if(S.envoi)return; S.envoi=true; rendre();
    try{
      const X=await import('./exports.js?v=2026-09-26a'),F=await import('./fichiers.js?v=2026-09-24i');
      const blob=X.pdfGrillesAesh(cx,[a.id],S.lundi,'TYPE');
      const nom=`emploi-du-temps-${String(a.sigle).replace(/[^a-zA-Z0-9_-]/g,'-')}.pdf`;
      F.telecharger(blob,nom);
      const sujet=`Votre emploi du temps · ${a.sigle}`;
      const corps=[`Bonjour,`,'',
        `Voici l’emploi du temps de la semaine type, semaines A et B réunies sur une seule page.`,
        `Les blocs marqués A ou B ne reviennent qu’une semaine sur deux ; les autres sont identiques chaque semaine.`,
        '', `Le fichier « ${nom} » vient d’être enregistré : il reste à le joindre à ce message.`,
        '', `Bonne journée.`].join('\n');
      window.open('mailto:?subject='+encodeURIComponent(sujet)+'&body='+encodeURIComponent(corps),'_self');
      toast('PDF enregistré. Joignez-le au message qui vient de s’ouvrir.');
    }catch(e){toast(e.message||'Envoi impossible.',true);}
    finally{S.envoi=false;rendre();}
  }

  async function telechargerGrille() {
    if(S.envoi)return;
    const f={...S.feuille},cx=S.route.p.edtType?{...contexteType(ctx()),exportType:true}:ctx();
    const ids=K.aeshActifs(cx.I,P().id).filter(a=>f.qui==='equipe'||a.id===S.route.p.aesh).map(a=>a.id);
    if(!ids.length){toast('Aucun AESH à exporter.',true);return;}
    S.envoi=true;rendre();
    try{
      const X=await import('./exports.js?v=2026-09-26a'),F=await import('./fichiers.js?v=2026-09-24i');
      const blob=f.format==='pdf'?X.pdfGrillesAesh(cx,ids,S.lundi,f.semaines):X.excelGrillesAesh(cx,ids,S.lundi,f.semaines);
      const nom=(f.qui==='personne'?cx.I.aesh.get(ids[0]).sigle:P().slug).replace(/[^a-zA-Z0-9_-]/g,'-');
      F.telecharger(blob,`EDT-${nom}-${S.lundi}-${f.semaines}${cx.exportType?'-type':''}.${f.format==='pdf'?'pdf':'xlsx'}`);
      S.envoi=false;fermer();
    }catch(e){S.envoi=false;rendre();toast('Export impossible : '+e.message,true);}
  }
  async function exporterPlanningSimple() {
    try {
      const X=await import('./exports.js?v=2026-09-26a'),F=await import('./fichiers.js?v=2026-09-24i');
      F.telecharger(X.excelPlanning(ctx(),classesDu(P().id),K.aeshActifs(idx(),P().id).map(a=>a.id),S.lundi),`planning-${P().slug}-${S.lundi}-A-B.xlsx`);
    } catch(e){toast('L’export n’a pas pu être créé. '+e.message,true);}
  }
  async function lancerExport() {
    const X = await import('./exports.js?v=2026-09-26a'), F = await import('./fichiers.js?v=2026-09-24i');
    const p = P(), cx = ctx(), e = S.exp, s = S.C.semaine(S.lundi), suffixe = `${S.lundi}${s.parite ? '-sem' + s.parite : ''}`;
    const nomF = t => `${t}-${suffixe}`.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9._-]+/g, '-');
    if (e.format === 'json') { F.telecharger(X.json(cx, [...S.docs.values()]), `referents-aesh-sauvegarde-${K.isoLocal()}.json`); return; }
    let ids = [], classes = [];
    if (e.quoi === 'aesh') ids = e.ids.filter(id => cx.I.aesh.has(id));
    if (e.quoi === 'pole') ids = K.aeshActifs(cx.I, p.id).map(a => a.id);
    if (e.quoi === 'tous') ids = K.aeshActifs(cx.I).map(a => a.id);
    if (e.quoi === 'classe') classes = e.ids.filter(n => S.edt.classes[n]);
    const titre = e.quoi === 'classe' ? classes.join('-') : e.quoi === 'aesh' ? ids.map(id => cx.I.aesh.get(id).sigle).join('-') : e.quoi === 'tous' ? 'tous-les-poles' : p.slug;
    if (e.format === 'pdf') {
      if (e.quoi === 'classe') F.telecharger(X.pdfClasses(cx, classes, S.lundi), nomF(`edt-${titre}`) + '.pdf');
      else if (e.quoi === 'pole' || e.quoi === 'tous') F.telecharger(X.pdfEquipe(cx, e.quoi === 'tous' ? POLES.map(x => x.id) : [p.id], ids, S.lundi), nomF(`aesh-${titre}`) + '.pdf');
      else F.telecharger(X.pdfAesh(cx, ids, S.lundi), nomF(`aesh-${titre}`) + '.pdf');
    } else {
      if (e.quoi === 'classe') F.telecharger(X.excelClasses(cx, classes, S.lundi), nomF(`edt-${titre}`) + '.xlsx');
      else F.telecharger(X.excelAesh(cx, ids, S.lundi, e.quoi === 'pole' || e.quoi === 'tous' ? (e.quoi === 'tous' ? POLES.map(x => x.id) : [p.id]) : null), nomF(`aesh-${titre}`) + '.xlsx');
    }
  }

  /* ─────────── avatar et humeur ─────────── */
  function publierHumeur() {
    /* L'humeur reste privée (décision du 17/09) : rien n'est écrit ni montré aux autres référents. */
    return;
    if (!S.session || S.humeur == null || S.etat !== 'ok') return;
    const d = S.docs.get('pole_' + S.session.pole), h = d && d.humeur;
    if (h && h.jour === K.isoLocal() && h.i === S.humeur) return;
    ecrirePole(S.session.pole, { humeur: { jour: K.isoLocal(), i: S.humeur } }).catch(() => { });
  }
  function carteReferents() {
    return `<div class="carte pad" style="display:grid;gap:10px"><h2>Les référents</h2><div class="referents">${POLES.map(q => { const c = poleComplet(q.id), h = humeurDe(q.id), moi = S.session && q.id === S.session.pole;
      return `<button type="button" class="ref-tuile" id="ref-${q.id}" data-a="${moi ? 'aller' : 'ecrire-a'}" data-v="${moi ? 'avatar' : q.id}" style="--pole:${q.couleur}" title="${moi ? 'Changer mon avatar' : 'Écrire au référent ' + esc(q.nom)}">${avatarHtml(q.id, 64, { classe: 'ref-av' })}<b>${esc(q.nom)}</b><small>${c ? `complet jusqu’au ${K.jjmm(c.jusquau)}` : 'saisie en cours'}</small></button>`; }).join('')}</div></div>`;
  }
  function formAvatar() {
    if (!S.form || S.form.kind !== 'avatar') { const a = avatarDe(S.session.pole); S.form = { kind: 'avatar', a: a ? { ...a } : AV.auHasard('portrait'), orig: a ? JSON.stringify(a) : '', groupe: '' }; }
    return S.form;
  }
  function ecranAvatar() {
    const f = formAvatar(), a = f.a, premiere = !!S.route.p.premiere, p = pole(S.session.pole);
    const opts = a.type === 'mascotte' ? AV.OPTIONS_MASCOTTE : AV.OPTIONS_PORTRAIT;
    const modifie = JSON.stringify(AV.normaliser(a)) !== f.orig;
    const pastille = (k, l, v, type) => {
      const on = type === 'b' ? (!!a[k] === (v === 'oui')) : (a[k] || '') === v;
      if (type === 'c') return `<button type="button" class="pcoul" data-a="av-opt" data-k="${k}" data-v="${esc(v)}" aria-pressed="${on}" aria-label="${v ? esc(v) : 'aucune'}" style="background:${v || 'transparent'}${v ? '' : ';border-style:dashed'}"></button>`;
      return `<button type="button" data-a="av-opt" data-k="${k}" data-v="${esc(v)}" aria-pressed="${on}">${esc(v || 'aucune')}</button>`;
    };
    return `<div class="fiche" style="max-width:860px">
      <div><h1 id="titre" tabindex="-1">${premiere ? 'Bienvenue, référent ' + esc(p.nom) : 'Mon avatar'}</h1><p class="sous">${premiere ? 'Choisissez votre avatar : c’est lui qu’on verra dans les messages et sur l’accueil. Modifiable à tout moment.' : 'Modifiable à tout moment, jamais une photo.'}</p></div>
      <div class="atelier-av">
        <div class="av-grand"><button type="button" class="av-cadre" id="av-apercu" data-a="av-clin" aria-label="Aperçu (clin d’œil)">${AV.svgAvatar(a, { taille: 200, id: 'av-svg' })}</button>
          <div class="ligne" style="justify-content:center"><button type="button" class="btn" id="av-hasard" data-a="av-hasard">🎲 Surprends-moi</button></div>
          <div class="choix" role="group" aria-label="Type" style="justify-content:center"><button type="button" id="av-t-portrait" data-a="av-type" data-v="portrait" aria-pressed="${a.type === 'portrait'}">Portrait</button><button type="button" id="av-t-mascotte" data-a="av-type" data-v="mascotte" aria-pressed="${a.type === 'mascotte'}">Mascotte</button></div>
</div>
        <div class="av-opts">${opts.map(([k, l, v, type]) => `<div class="av-opt ${f.groupe === k ? 'ouvert' : ''}"><button type="button" class="av-titre" data-a="av-groupe" data-v="${k}" aria-expanded="${f.groupe === k}"><span>${esc(l)}</span><span class="muted">${type === 'c' ? `<i class="pt" style="background:${a[k] || 'transparent'}"></i>` : type === 'b' ? (a[k] ? 'oui' : 'non') : esc(a[k] || 'aucun')}</span></button>
          ${f.groupe === k ? `<div class="av-puces">${v.map(x => pastille(k, l, x, type)).join('')}</div>` : ''}</div>`).join('')}</div>
      </div>
      <div class="barre-bas">${premiere ? '' : `<button type="button" class="btn" id="av-annuler" data-a="av-annuler">Annuler</button>`}<button type="button" class="btn valider" id="av-valider" data-a="av-valider" ${modifie || premiere ? '' : 'disabled'}>✓ C’est moi</button></div></div>`;
  }

  /* ─────────── mon code ─────────── */
  function ecranMonCode() {
    if (!S.form || S.form.kind !== 'code') S.form = { kind: 'code', voir: false, n1: '', n2: '', antoine1:'', antoine2:'' };
    const f = S.form, p = pole(S.session.pole), actuel = codeDe(p.id);
    const autre = POLES.find(x => x.id !== p.id && codeDe(x.id) === f.n1);
    const ok = /^\d{4}$/.test(f.n1) && f.n1 === f.n2 && f.n1 !== actuel && !autre;
    return `<div class="fiche"><h1 id="titre" tabindex="-1">Mon code</h1><p class="sous">Pôle ${esc(p.nom)}</p>
      <div class="champs">
        <div class="champ"><span class="lib"><b>Code actuel</b></span><span class="ligne"><b class="num" style="font-size:1.3rem;letter-spacing:.2em">${f.voir ? esc(actuel) : '••••'}</b><button type="button" class="lien" id="mc-voir" data-a="code-voir">${f.voir ? 'cacher' : 'afficher'}</button></span></div>
        <div class="champ"><label class="lib" for="mc-n1"><b>Nouveau code</b><small>4 chiffres</small></label><input type="text" id="mc-n1" data-i="n1" inputmode="numeric" maxlength="4" value="${esc(f.n1)}" style="width:120px;text-align:center;font-size:1.3rem;letter-spacing:.2em;font-weight:800"></div>
        <div class="champ"><label class="lib" for="mc-n2"><b>Encore une fois</b></label><input type="text" id="mc-n2" data-i="n2" inputmode="numeric" maxlength="4" value="${esc(f.n2)}" style="width:120px;text-align:center;font-size:1.3rem;letter-spacing:.2em;font-weight:800"></div>
      </div>
      ${autre ? `<div class="bandeau err">Ce code est déjà celui d’un autre pôle.</div>` : f.n2.length === 4 && f.n1 !== f.n2 ? `<div class="bandeau err">Les deux codes ne sont pas identiques.</div>` : ''}
      <div class="barre-bas"><button type="button" class="btn valider" id="mc-valider" data-a="valider-code" ${ok ? '' : 'disabled'}>✓ Changer le code</button></div>${p.id === 'PSR_MELEC' ? carteAccesAntoine(f) : ''}</div>`;
  }

  function carteAccesAntoine(f) {
    const acces = S.docs.get('pole_PSR_MELEC')?.accesPlanning;
    const ok = /^\d{4}$/.test(f.antoine1 || '') && f.antoine1 === f.antoine2
      && !POLES.some(p => codeDe(p.id) === f.antoine1);
    const lien = new URL('../planning-equipe/',location.href).href;
    return `<section class="carte pad" style="margin-top:24px"><h2>Accès Antoine</h2>
      <p>PSR, AGOrA, CAPa et Métiers d’art : saisie des emplois du temps. MELEC : consultation. Les contrats restent gérés par les référents.</p>
      <p><b>${acces?.actif ? 'Accès activé' : 'Accès désactivé'}</b> · <a href="${esc(lien)}" target="_blank" rel="noopener">Ouvrir son interface</a></p>
      <p class="muted">Un code distinct de celui du pôle, à lui transmettre. Votre code de référent ouvre aussi cette interface, même si son accès personnel est désactivé.</p>
      <div class="champs"><div class="champ"><label for="antoine1">Code Antoine — 4 chiffres</label><input type="password" inputmode="numeric" maxlength="4" autocomplete="new-password" id="antoine1" data-i="antoine1" value="${esc(f.antoine1)}"></div>
      <div class="champ"><label for="antoine2">Confirmer le code</label><input type="password" inputmode="numeric" maxlength="4" autocomplete="new-password" id="antoine2" data-i="antoine2" value="${esc(f.antoine2)}"></div></div>
      <div class="actions"><button type="button" class="btn valider" data-a="antoine-activer" ${ok ? '' : 'disabled'}>Enregistrer et activer</button>
      ${acces?.actif ? '<button type="button" class="btn" data-a="antoine-desactiver">Désactiver cet accès</button>' : ''}</div></section>`;
  }

  /* ─────────── feuilles ─────────── */
  /* Toutes les fenêtres ont la même croix en haut à droite : on ouvre pour regarder, on referme d'un geste,
     sans rien valider (demande de Brahim, 17/09). Le titre et la croix restent visibles au défilement. */
  const teteFeuille = (titre, sous) => `<div class="tete-f"><div class="ligne ecarte"><h2 id="f-titre" tabindex="-1">${titre}</h2>
      <button type="button" class="rond" id="f-croix" data-a="fermer" aria-label="Fermer sans rien valider" title="Fermer sans rien valider">✕</button></div>
    ${sous ? `<p class="sous" style="margin:2px 0 0">${sous}</p>` : ''}</div>`;
  function detailCouverture(c,iso,bes) {
    const d=K.min(bes.plageDebut || c.d),z=K.min(bes.plageFin || c.f),l=[];
    for(let m=d;m<z;m+=30){const fin=Math.min(m+30,z),n=K.presentsMin(ctx(),c,iso,K.hDe(m),K.hDe(fin)),last=l[l.length-1];if(last && last.n===n)last.fin=fin;else l.push({debut:m,fin,n});}
    if(l.length<2)return '';
    return `<table><thead><tr><th>Horaire</th><th>Présents</th></tr></thead><tbody>${l.map(x=>`<tr><td>${K.hFr(K.hDe(x.debut))}–${K.hFr(K.hDe(x.fin))}</td><td>${x.n} / ${bes.nb}</td></tr>`).join('')}</tbody></table>`;
  }

  function feuille() {
    const f = S.feuille;
    let h = '', large = false;
    if(f.type==='export-grille') h=feuilleExportGrille(f);
    else if(f.type==='service-detail') h=teteFeuille('Réunions et services',K.dateLongue(K.ajoute(S.lundi,f.jour)))+K.aeshActifs(idx(),P().id).flatMap(a=>K.occupations(ctx(),a.id,S.lundi).filter(o=>o.j===f.jour && ['service','reunion','institution'].includes(o.type)).map(o=>`<p style="border-left:5px solid ${couleurAesh(a.id)};padding-left:10px"><b>${esc(a.sigle)}</b> · ${esc(libelleService(o.label))}<br>${K.hFr(o.debut)}–${K.hFr(o.fin)}</p>`)).join('');
    else if (f.type === 'service-horaire') { h = feuilleServiceHoraire(f); large=true; }
    else if (f.type === 'placer') { h = feuillePlacer(f); large = true; }
    else if (f.type === 'besoin-detail') {
      const c = S.edt.cours[f.coursId], iso = K.ajoute(S.lundi,c.j);
      const bes = K.besoinDuCours(S.est,f.classe,c,quand(iso));
      const nb = bes ? presents(c,iso,bes) : 0, manque = bes ? Math.max(0,bes.nb-nb) : 0;
      h = `<div class="besoin-titre" style="border-left:6px solid ${couleurMatiere(c.mat)[0]}">${teteFeuille(esc(c.lib),`${esc(K.dateLongue(iso))} · ${K.hFr(c.d)}–${K.hFr(c.f)}`)}</div>`+
        `<div class="bandeau ${manque?'err':'info'}">${resumeDemande(c,iso,bes)}</div>${bes?detailCouverture(c,iso,bes):''}`+
        (peutPlacer(f.classe)?`<button type="button" class="btn pri" data-a="besoin-placer" data-v="${esc(c.id)}">Placer un AESH sur ce cours</button>`:'')+
        editeurBesoin(f);

    }
    else if (f.type === 'lecture') {
      const c = S.edt.cours[f.coursId], iso = K.ajoute(S.lundi,c.j), bes = K.besoinDuCours(S.est,f.classe,c,quand(iso));
      h = teteFeuille(esc(c.lib),`${K.JOURS[c.j]} ${K.hFr(c.d)}–${K.hFr(c.f)} · Consultation`) +
        `<div class="bandeau info">${resumeDemande(c,iso,bes)}</div><p>Les affectations sont gérées par le référent.</p>`;
    }
    else if (f.type === 'confirmer') h = feuilleConfirmer(f);
    else if (f.type === 'partager') h = feuillePartager(f);
    else if (f.type === 'pfmp') h = feuillePfmp(f);
    else if (f.type === 'filieres') h = feuilleFilieres(f);
    else if (f.type === 'periode') h = feuillePeriode(f);
    else if (f.type === 'service') { h = feuilleService(f); large = true; }
    else if (f.type === 'deplacer') { h = feuilleDeplacer(f); large = true; }
    return `<div class="voile" data-a="voile"><div class="feuille ${large ? 'large' : ''} ${f.fait ? 'fait' : ''}" role="dialog" aria-modal="true" aria-labelledby="f-titre"><div class="poignee" aria-hidden="true"></div>${h}</div></div>`;
  }
  function feuilleConfirmer(f) {
    if (f.fait) return `<div class="ligne ecarte"><h2 id="f-titre" tabindex="-1">✓ Enregistré</h2><button type="button" class="rond" id="cf-croix" data-a="fermer" aria-label="Fermer">✕</button></div><div class="recap">${f.grand ? `<p class="grand">${esc(f.grand)}</p>` : ''}<p>${esc(f.sous || '')}</p></div>`;
    return `<div class="ligne ecarte"><h2 id="f-titre" tabindex="-1">${esc(f.titre || 'Vous confirmez ?')}</h2>
      <button type="button" class="rond" id="cf-croix" data-a="fermer" aria-label="Fermer sans valider" title="Fermer sans valider" ${S.envoi ? 'disabled' : ''}>✕</button></div>
      <div class="recap">${f.apercu ? `<div style="display:grid;justify-items:center"><span class="av-cadre" style="width:120px;height:120px">${f.apercu}</span></div>` : ''}${f.grand ? `<p class="grand">${esc(f.grand)}</p>` : ''}${f.sous ? `<p>${esc(f.sous)}</p>` : ''}
      ${f.lignes && f.lignes.length ? `<ul>${f.lignes.map(l => `<li><span>${esc(l[0])}</span><b>${l.length > 2 ? `${esc(l[1])} → ${esc(l[2])}` : esc(l[1])}</b></li>`).join('')}</ul>` : ''}
      ${f.choixPeriode ? `<div class="choix" role="group" aria-label="Jusqu’à" style="justify-content:center;margin-top:8px">${f.choixPeriode.map(r => `<button type="button" id="cp-${r.id}" data-a="choix-periode-c" data-v="${r.id}" aria-pressed="${f.periode === r.id}">${esc(r.label)} <span class="muted">(${K.jjmm(r.fin)})</span></button>`).join('')}</div>` : ''}
      ${f.bascule ? `<div class="choix" style="justify-content:center"><button type="button" id="cf-bascule" data-a="bascule" aria-pressed="${f.bascule.on}"><span class="coche" aria-hidden="true">${f.bascule.on ? '✓' : ''}</span>${esc(f.bascule.label)}</button></div>` : ''}
      ${f.avert ? `<div class="bandeau ${f.danger ? 'err' : 'warn'}" style="text-align:left;white-space:pre-line">${esc(f.avert)}</div>` : ''}</div>
      <div class="actions"><button type="button" class="btn" id="cf-non" data-a="confirmer-non" ${S.envoi ? 'disabled' : ''}>${f.danger ? 'Annuler' : 'Modifier'}</button>
        <button type="button" class="btn ${f.danger ? 'danger' : 'valider'}" id="cf-oui" data-a="confirmer-oui" ${S.envoi ? 'disabled' : ''}>${S.envoi ? 'Enregistrement…' : esc(f.bouton || 'Confirmer')}</button></div>`;
  }
  /* ─── « Où intervient X ? » (17/09/2026) ───
     Les filières du lycée, pôle par pôle. Cocher une filière = tous ses niveaux ; on déplie pour
     n'en garder que certaines classes. Rien n'est écrit ici : la fiche enregistre. */
  /* Remet la fiche comme elle était à l'ouverture de la feuille des filières. Croix, Annuler, Échap et « Précédent »
     passent tous par ici (audit I01, 18/09) : aucune sortie ne garde un changement non voulu. */
  function restaurerFilieres(f) {
    const a = S.form && S.form.a;
    if (!a || !f || f.type !== 'filieres' || !f.avant) return;
    a.filieres = f.avant.filieres ? JSON.parse(JSON.stringify(f.avant.filieres)) : undefined; a.rattachement = f.avant.rattachement || undefined;
    a.equipes = JSON.parse(JSON.stringify(f.avant.equipes)); a.heures = JSON.parse(JSON.stringify(f.avant.heures));
  }
  function feuilleFilieres(f) {
    const a = S.form && S.form.a;
    if (!a) return `<h2 id="f-titre" tabindex="-1">Fiche fermée</h2><div class="actions"><button type="button" class="btn" data-a="fermer">Fermer</button></div>`;
    const fl = a.filieres || {}, rat = rattachementDe(a);
    return `<div class="tete-f"><div class="ligne ecarte"><h2 id="f-titre" tabindex="-1">Où intervient ${esc(a.sigle || 'cet AESH')} ?</h2>
        <button type="button" class="rond" id="fil-croix" data-a="fil-annuler" aria-label="Fermer sans rien changer" title="Fermer sans rien changer">✕</button></div>
      <p class="sous" style="margin:2px 0 0">Cochez ses filières, avec leurs heures. Une filière cochée, c’est tous ses niveaux.</p></div>
      ${POLES.map(q => `<div style="display:grid;gap:6px"><b style="color:${q.couleur}">${esc(q.nom)}</b>
        ${K.repartitionIncomplete(a, FILIERES, q.id) && nombre((a.heures || {})[q.id]) != null && K.sommeFilieres((S.form && S.form.orig) || {}, FILIERES, q.id) == null ? `<span class="aide" style="margin:0">${esc(K.fmtH(a.heures[q.id]))} déclarées au total pour ce pôle. Tant que chaque filière cochée n’a pas ses heures, c’est ce total qui compte.</span>` : ''}
        ${filieresDuPole(q.id).map(x => {
          const on = !!fl[x.id], cl = on && Array.isArray(fl[x.id].classes) && fl[x.id].classes.length ? fl[x.id].classes : null, ouvert = f.ouvert === x.id;
          const pasF = (id, val) => `<span class="pas petit"><button type="button" id="pmf-${id}" data-a="fil-pas" data-v="${id}" data-d="-0.5" aria-label="Moins">−</button><input id="pvf-${id}" data-i="fil-h" data-v="${id}" inputmode="decimal" value="${nombre(val) == null ? '' : String(val).replace('.', ',')}" placeholder="—" aria-label="Heures en ${esc(x.nom)}"><button type="button" id="ppf-${id}" data-a="fil-pas" data-v="${id}" data-d="0.5" aria-label="Plus">+</button></span>`;
          return `<div class="fil ${on ? 'on' : ''}">
            <button type="button" class="fil-case" id="fil-${x.id}" data-a="fil-toggle" data-v="${x.id}" aria-pressed="${on}"><span class="coche" aria-hidden="true">${on ? '✓' : ''}</span>${esc(x.nom)}</button>
            ${on ? pasF(x.id, fl[x.id].h) : ''}
            ${on ? `<button type="button" class="lien" id="fild-${x.id}" data-a="fil-deplier" data-v="${x.id}" aria-expanded="${ouvert}">${cl ? esc(cl.map(n => S.edt.classes[n].court).join(', ')) : 'Tous les niveaux'} ${ouvert ? '⌄' : '›'}</button>` : ''}
            ${on && ouvert ? `<div class="choix" style="grid-column:1/-1">${x.classes.map(n => `<button type="button" id="filc-${n}" data-a="fil-classe" data-v="${x.id}|${n}" aria-pressed="${!cl || cl.includes(n)}">${esc(S.edt.classes[n].court)}</button>`).join('')}</div>` : ''}
          </div>`; }).join('')}</div>`).join('')}
      <div style="display:grid;gap:6px"><b>Équipe qui le gère</b><span class="muted" style="font-size:.9rem">Son référent, et sa réunion d’équipe.</span>
        <div class="choix" role="group" aria-label="Équipe de rattachement">${Object.keys(a.equipes || {}).map(pid => `<button type="button" id="fr-${pid}" data-a="fil-rattach" data-v="${pid}" aria-pressed="${rat === pid}">${esc(nomPole(pid))}</button>`).join('')}</div></div>
      ${(() => { const rep = resteAPartir(a); if (!rep) return '';
        const mien = filieresDuPole(P().id).filter(g => (a.filieres || {})[g.id]);
        return `<div class="bandeau ${rep.reste > 0 ? 'info' : 'warn'}" style="display:grid;gap:8px">${rep.texte}
          ${rep.reste > 0 && mien.length === 1 ? `<button type="button" class="btn petit" id="fil-prendre" data-a="fil-prendre" data-v="${mien[0].id}" style="justify-self:start">＋ Prendre les ${K.fmtH(rep.reste)} en ${esc(mien[0].nom)}</button>` : ''}</div>`; })()}
      <div class="bandeau info">Rien n’est enregistré tant que vous n’avez pas touché « ✓ Enregistrer » sur sa fiche.</div>
      <div class="actions"><button type="button" class="btn" id="fil-annuler" data-a="fil-annuler">Annuler</button>
        <button type="button" class="btn valider" id="fil-ok" data-a="fermer">✓ Terminé</button></div>`;
  }
  function feuillePfmp(f) {
    const k = S.edt.classes[f.classe], ok = f.lignes.every(x => K.RE_DATE.test(x.debut || '') && K.RE_DATE.test(x.fin || '') && x.fin >= x.debut);
    return teteFeuille(`PFMP · ${esc(k.court)}`, 'Pendant une PFMP, les cours de la classe n’ont pas lieu : rien n’est compté pour les AESH.') + `
      <div style="display:grid;gap:8px">${f.lignes.map((x, i) => `<div class="ligne" style="gap:8px"><label class="sr" for="pf-du-${i}">Du</label><input type="date" id="pf-du-${i}" data-i="pf-du" data-v="${i}" value="${esc(x.debut)}"><span class="muted">au</span><label class="sr" for="pf-au-${i}">Au</label><input type="date" id="pf-au-${i}" data-i="pf-au" data-v="${i}" value="${esc(x.fin)}" min="${esc(x.debut)}"><button type="button" class="lien" data-a="pfmp-retirer" data-v="${i}">retirer</button></div>`).join('') || '<span class="muted">Aucune période.</span>'}
        <div><button type="button" class="btn petit" id="pf-ajouter" data-a="pfmp-ajouter">＋ Ajouter une période</button></div></div>
      <div class="actions"><button type="button" class="btn" id="pf-fermer" data-a="fermer">Fermer</button><button type="button" class="btn valider" id="pf-valider" data-a="pfmp-valider" ${ok ? '' : 'disabled'}>✓ Enregistrer</button></div>`;
  }
  function lienFiliere(p) { try { return new URL(`../demandes-aesh/?filiere=${p.slug}`, location.href).href; } catch (e) { return `../demandes-aesh/?filiere=${p.slug}`; } }
  function texteMessage(p, signature) {
    return `Bonjour,\n\nAfin d’organiser au mieux l’accompagnement des élèves de la filière ${p.nom}, merci d’indiquer vos besoins en AESH pour chacun de vos cours, directement sur l’emploi du temps de vos classes :\n\n${lienFiliere(p)}\n\nCela prend quelques minutes, et vos réponses restent modifiables.\n\nMerci pour votre aide,\n${signature}`;
  }
  function feuillePartager(f) {
    const p = P();
    return teteFeuille('Envoyer le lien à mes collègues', '') + `
      <label class="sr" for="pt-sign">Signature</label>
      <div class="ligne"><span class="muted">Signature</span><input type="text" id="pt-sign" data-i="signature" value="${esc(f.signature)}" maxlength="80" style="flex:1"></div>
      <label class="sr" for="pt-texte">Message</label>
      <textarea id="pt-texte" data-i="pt-texte" rows="12" style="width:100%;line-height:1.5">${esc(f.texte)}</textarea>
      <div class="actions">
        <button type="button" class="btn valider" id="pt-copier" data-a="copier">${f.copie ? '✓ Copié' : '📋 Copier le message'}</button>
        <a class="btn" id="pt-mail" href="mailto:?subject=${encodeURIComponent(`Besoins d’accompagnement des élèves · ${p.nom}`)}&body=${encodeURIComponent(f.texte)}">✉️ Ouvrir ma messagerie</a>
      </div>
      <div class="ligne ecarte"><a class="lien" id="pt-voir" href="${esc(lienFiliere(p))}" target="_blank" rel="noopener">Voir la page des collègues ↗</a><button type="button" class="lien" id="pt-fermer" data-a="fermer">Fermer</button></div>`;
  }

  /* ═══════════════════ ACTIONS ═══════════════════ */
  async function confirmerPuis(f, travail) {
    S.feuille ? (S.feuille = { ...f, type: 'confirmer', travail }) : ouvrir({ ...f, type: 'confirmer', travail });
    rendre({ focus: 'cf-oui' });
  }
  async function executerConfirmation() {
    const f = S.feuille; if (!f || !f.travail || S.envoi) return;
    S.envoi = true; rendre();
    try {
      const r = await f.travail();
      S.envoi = false;
      S.feuille = { ...f, fait: true, sous: (r && r.sous) || f.faitSous || f.sous, grand: f.grand };
      rendre({ focus: 'f-titre' }); annonce('Enregistré');
      setTimeout(() => { if (S.feuille && S.feuille.fait) { if (r && r.ensuite) S.apresPop = r.ensuite; fermer(); } }, 1400);
    } catch (e) {
      S.envoi = false; if (!e || e.code !== 'conflit') console.error(e);   /* un conflit est un cas prévu, expliqué à l'écran */ toast(messageErreur(e), true); rendre();
    }
  }

  function validerFiche() {
    const f = S.form, p = P(), a = f.a, I = idx();
    a.sigle = K.normSigle(a.sigle);
    if (!a.sigle) { toast('Le sigle est vide.', true); return; }
    const doublon = [...I.aesh.values()].find(x => x.id !== a.id && x.actif !== false && K.cleSigle(x.sigle) === K.cleSigle(a.sigle));
    if (doublon) { toast(`Le sigle ${a.sigle} est déjà utilisé.`, true); return; }
    if((a.reunionsSupplementaires||[]).length>12 || K.reunionsSupplementairesDe(a).length!==(a.reunionsSupplementaires||[]).length || (a.reunionsSupplementaires||[]).some(r=>!POLES.some(p=>p.id===r.pole))){toast('Vérifiez les dates et horaires des réunions supplémentaires (12 maximum).',true);return;}
    const nouveau = f.id === 'nouveau' && !f.existant;
    const cx={...ctx(),I:{...idx(),aesh:new Map(idx().aesh)}};cx.I.aesh.set(a.id,a);
    const alertesReunions=[...new Set((a.reunionsSupplementaires||[]).flatMap(r=>K.lundisEntre(S.C,r.du,r.au).flatMap(l=>(K.bilan(cx,a.id,l)?.alertes||[]).filter(x=>['conflit','contrat'].includes(x.type)).map(x=>`${K.dateCourte(l)} : ${x.texte}`))))];
    const ch = changements(f);
    const recent0 = a.id ? idx().aesh.get(a.id) : null, entreTemps = recent0 && f.orig && recent0.version != null && recent0.version !== f.orig.version;
    confirmerPuis({ titre: nouveau ? 'Ajouter cet AESH ?' : 'Vous confirmez ?', grand: a.sigle, lignes: ch.map(l => nouveau ? [l[0], l[2]] : l), bouton: nouveau ? 'Ajouter' : 'Confirmer', faitSous: nouveau ? `${a.sigle} est dans ${p.nom}` : '',
      avert: alertesReunions.join('\n') + (entreTemps ? `Cette fiche a été modifiée entre-temps par ${nomPole(recent0.par) || 'un autre référent'} : seuls vos changements ci-dessus seront appliqués, le reste est conservé.` : '') }, async () => {
      /* B01 : on repart de la fiche la plus récente et on n'y applique que ce qui a été changé ici.
         Lot 2 (18/09) : « la plus récente » est relue sur le serveur au moment d'écrire (transaction). */
      const orig = f.orig || {};
      const construire = serveur => {
      const depart = EQUIPES_DEPART.find(x => x.id === a.id);
      const recent = serveur ? K.normaliserAesh({ ...(depart || {}), ...serveur, depart: false }, POLES.map(q => q.id), FILIERES) : (a.id ? idx().aesh.get(a.id) : null);
      if (recent && f.orig) { const c = conflitsFiche(orig, a, recent); if (c.length) throw Object.assign(new Error('conflit'), { code: 'conflit', champs: c, qui: nomPole(recent.par) || '', recent }); }
      const doc = recent ? { ...JSON.parse(JSON.stringify(recent)), services: K.servicesDe(recent), dispos: K.disposDe(recent) } : { ...a };
      delete doc.depart; delete doc.cantine; delete doc.internat; delete doc.service; delete doc.serviceLib;
      if (recent) {
        const diff = (x, y) => JSON.stringify(x ?? null) !== JSON.stringify(y ?? null);
        if (diff(orig.sigle, a.sigle)) doc.sigle = a.sigle;
        if (diff(nombre(orig.contrat), nombre(a.contrat))) doc.contrat = a.contrat;
        if (diff(nombre(orig.presence), nombre(a.presence))) doc.presence = a.presence;
        if (diff(orig.finContrat || '', a.finContrat || '')) doc.finContrat = a.finContrat || '';
        if (diff(nombre(orig.reunionH), nombre(a.reunionH))) doc.reunionH = a.reunionH;
        doc.equipes = { ...(doc.equipes || {}) }; doc.heures = { ...(doc.heures || {}) };
        [...new Set([...Object.keys(orig.equipes || {}), ...Object.keys(a.equipes || {})])].forEach(q => {
          if (diff((orig.equipes || {})[q], (a.equipes || {})[q])) { if ((a.equipes || {})[q] == null) delete doc.equipes[q]; else doc.equipes[q] = a.equipes[q]; }
          if (diff(nombre((orig.heures || {})[q]), nombre((a.heures || {})[q]))) { if (nombre((a.heures || {})[q]) == null) delete doc.heures[q]; else doc.heures[q] = a.heures[q]; }
        });
        /* Services fusionnés un par un, par nom (audit C02, 18/09) : un service ajouté par un collègue est conservé. */
        { const parNom = l => Object.fromEntries((l || []).map(x => [x.nom, x])), o = parNom(orig.services), n = parNom(a.services), r = parNom(K.servicesDe(recent));
          [...new Set([...Object.keys(o), ...Object.keys(n)])].forEach(nom => { if (diff(o[nom], n[nom])) { if (n[nom]) r[nom] = n[nom]; else delete r[nom]; } });
          doc.services = Object.values(r); }
        /* Demi-journées fusionnées une par une (audit C02) : le vendredi changé par un collègue n'est pas écrasé. */
        { const o = K.disposDe(orig), n = K.disposDe(a), r = { ...K.disposDe(recent) };
          [...new Set([...Object.keys(o), ...Object.keys(n)])].forEach(k => { if (o[k] !== n[k]) { if (n[k]) r[k] = n[k]; else delete r[k]; } });
          doc.dispos = r; }
        if (diff(orig.reunion, a.reunion)) doc.reunion = a.reunion;
        if(diff(orig.reunionsSupplementaires||[],a.reunionsSupplementaires||[])){doc.reunionsSupplementaires=a.reunionsSupplementaires||[];doc.revisionPlanning=(Number(doc.revisionPlanning)||0)+1;}
        /* B01 : les filières se fusionnent une par une, comme les pôles — un autre référent a pu en ajouter entre-temps. */
        doc.filieres = { ...(K.filieresDe(recent) || filieresParDefaut(recent)) };
        [...new Set([...Object.keys(orig.filieres || {}), ...Object.keys(a.filieres || {})])].forEach(id => {
          if (diff((orig.filieres || {})[id], (a.filieres || {})[id])) { if (!(a.filieres || {})[id]) delete doc.filieres[id]; else doc.filieres[id] = a.filieres[id]; }
        });
        if (diff(orig.rattachement, a.rattachement)) doc.rattachement = a.rattachement;
      }
      if (!doc.id) doc.id = 'aesh_' + alea();
      /* Les filières disent où il intervient ; les pôles (equipes) en découlent, et le pôle du référent en fait partie. */
      doc.filieres = K.normaliserFilieres(doc.filieres || a.filieres, FILIERES);
      if (!Object.keys(doc.filieres).length) doc.filieres = Object.fromEntries(filieresDuPole(p.id).map(g => [g.id, { classes: null }]));
      doc.rattachement = POLES.some(q => q.id === doc.rattachement) ? doc.rattachement : p.id;
      doc.equipes = { ...(doc.equipes || {}) };
      Object.keys(K.polesDesFilieres(doc, FILIERES, doc.rattachement)).forEach(q => { if (doc.equipes[q] == null) doc.equipes[q] = 1; });
      if (doc.equipes[p.id] == null) doc.equipes[p.id] = 1;
      if (doc.equipes[doc.rattachement] == null) doc.rattachement = p.id;
      doc.heures = Object.fromEntries(Object.entries(doc.heures || {}).filter(([, v]) => nombre(v) != null).map(([k, v]) => [k, +v]));
      /* Les heures des filières font foi ; un pôle dont aucune filière n'a d'heures garde son total d'avant. */
      POLES.forEach(q => { const h = K.heuresPoleSaisie(doc, f.orig, FILIERES, q.id); if (h != null) doc.heures[q.id] = h; else if (doc.equipes[q.id] == null) delete doc.heures[q.id]; });
      /* Qui a rempli les trois champs partagés : l'autre référent doit savoir qu'ils sont déjà posés. */
      { const au = { ...(doc.auteurs || {}) }, ref = f.orig || {};
        if (nombre(ref.contrat) !== nombre(a.contrat)) au.contrat = p.id;
        if (nombre(ref.presence) !== nombre(a.presence)) au.presence = p.id;
        if (nombre(ref.reunionH) !== nombre(a.reunionH) || JSON.stringify(ref.reunion || null) !== JSON.stringify(a.reunion || null)) au.reunion = p.id;
        doc.auteurs = au; }
      const borne = x => { const n = nombre(x); return n == null ? null : Math.max(0, Math.min(45, Math.round(n * 2) / 2)); };
      doc.contrat = borne(doc.contrat);
      doc.presence = borne(doc.presence);
      doc.finContrat = K.RE_DATE.test(doc.finContrat || '') ? doc.finContrat : '';
      if (!doc.finContrat) delete doc.finContrat;
      if (doc.presence == null) delete doc.presence;
      doc.reunionH = borne(doc.reunionH); if (doc.reunionH != null) doc.reunionH = Math.min(20, doc.reunionH);
      if (doc.reunionH == null) delete doc.reunionH;
      doc.heures = Object.fromEntries(Object.entries(doc.heures).map(([k, v]) => [k, borne(v)]).filter(([, v]) => v != null));
      doc.services = (doc.services || []).filter(x => x && (borne(x.h) > 0 || (Array.isArray(x.horaires) && x.horaires.length))).map(x => ({ ...x, nom: String(x.nom || 'Autre service').trim().slice(0, 40) || 'Autre service', h: borne(x.h), jours: Array.isArray(x.jours) ? [...new Set(x.jours.map(Number).filter(j => j >= 0 && j <= 4))].sort() : [] }));
      doc.dispos = K.disposDe(doc); delete doc.jours; delete doc.cantine; delete doc.internat; delete doc.service; delete doc.serviceLib;
      doc.actif = true;
      return doc;
      };
      let d;
      try { d = a.id ? await ecrireTransaction(a.id, construire) : await ecrire(construire(null)); }
      catch (e) {
        /* Conflit : la fiche reprend la version du collègue comme point de départ. Les changements saisis ici restent
           à l'écran ; un nouvel enregistrement les appliquera en connaissance de cause. */
        if (e && e.code === 'conflit' && e.recent) { f.orig = copieFiche(e.recent); f.alerte = messageErreur(e); }
        throw e;
      }
      S.form = null;
      return { ensuite: () => aller('fiche', { id: d.id }, { remplacer: true }) };
    });
  }
  function retirerAesh() {
    const f = S.form, p = P(), a = f.a, I = idx(), l = S.lundi;
    const places = I.places.filter(x => x.aeshId === a.id && x.pole === p.id && x.au >= l);
    confirmerPuis({ titre: `Retirer ${a.sigle} de ${p.nom} ?`, danger: true, bouton: 'Retirer', avert: `${places.length ? `${places.length} placement${places.length > 1 ? 's' : ''} dans le pôle s’arrête${places.length > 1 ? 'nt' : ''} à partir de cette semaine. ` : ''}Rien n’est effacé : tout reste dans l’historique.` }, async () => {
      for (const x of places) await ecrire(x.du >= l ? { ...x, statut: 'retire' } : { ...x, au: K.ajoute(l, -1) });
      const doc = JSON.parse(JSON.stringify(I.aesh.get(a.id))); delete doc.depart;
      delete doc.equipes[p.id]; if (doc.heures) delete doc.heures[p.id];
      /* Les filières de ce pôle partent avec lui ; celles des autres pôles restent. */
      if (doc.filieres) { filieresDuPole(p.id).forEach(g => { delete doc.filieres[g.id]; }); if (!Object.keys(doc.filieres).length) delete doc.filieres; }
      if (doc.rattachement === p.id) { const autre = Object.keys(doc.equipes)[0]; if (autre) doc.rattachement = autre; else delete doc.rattachement; }
      if (!Object.keys(doc.equipes).length) doc.actif = false;
      await ecrire(doc); S.form = null;
      return { ensuite: () => aller('aesh', {}, { remplacer: true }) };
    });
  }
  /* ─── placement souple (17/09/2026, décision de Brahim) ───
     « On a une base, mais tout est modifiable. » Plus rien n'est interdit au moment de placer :
     tout ce qui coince est réuni dans « Vous confirmez ? », et le référent décide.
     Un AESH déjà pris ailleurs n'est pas dédoublé : on propose de le déplacer pour la période. */

  /* Libère un placement sur [du, au] sans rien effacer : il s'arrête avant, reprend après.
     Renvoie les documents à écrire — ils partent avec le reste de l'opération, dans le même lot. */
  function morceauxLiberes(x, du, au) {
    if (x.du >= du && x.au <= au) return [{ ...x, statut: 'retire' }];
    if (x.du < du && x.au > au) {
      const suite = { ...x, id: 'place_' + alea(), du: K.ajoute(au, 1) };
      delete suite.version; delete suite.creeLe; delete suite.majLe; delete suite.par;
      return [{ ...x, au: K.ajoute(du, -1) }, suite];
    }
    if (x.du < du) return [{ ...x, au: K.ajoute(du, -1) }];
    return [{ ...x, du: K.ajoute(au, 1) }];
  }
  /* Ajoute la classe (et sa filière) à la fiche de l'AESH. Renvoie { doc, info } à écrire avec le reste, ou null si
     c'était déjà prévu. Les heures de la filière sont conservées (audit D04, 18/09). */
  function ficheAvecClasse(aeshId, classe) {
    const a = idx().aesh.get(aeshId), g = filiereDeClasse(classe);
    if (!a || !g) return null;
    const doc = JSON.parse(JSON.stringify(a)); delete doc.depart;
    doc.filieres = { ...(K.filieresDe(doc) || filieresParDefaut(doc)) };
    const cur = doc.filieres[g.id];
    if (!cur) doc.filieres[g.id] = { classes: [classe], h: null };
    else if (Array.isArray(cur.classes) && cur.classes.length) {
      if (cur.classes.includes(classe)) return null;
      doc.filieres[g.id] = { ...cur, classes: g.classes.filter(n => cur.classes.includes(n) || n === classe) };
    } else return null;
    doc.rattachement = rattachementDe(doc);
    doc.equipes = { ...(doc.equipes || {}) };     /* une part déjà déclarée (0,5) n'est jamais écrasée */
    Object.keys(K.polesDesFilieres(doc, FILIERES, doc.rattachement)).forEach(q => { if (doc.equipes[q] == null) doc.equipes[q] = 1; });
    return { doc, info: `Fiche de ${a.sigle} : ${S.edt.classes[classe].court} ajouté` };
  }

  function validerPlacer() {
    const f = S.feuille, p = P(), c = S.edt.cours[f.coursId], I = idx(), du = f.du || S.lundi, au = finPeriode(f);
    if (!K.RE_DATE.test(du) || !K.RE_DATE.test(au) || au < du) return;
    const sig = id => (I.aesh.get(id) || {}).sigle || '?';
    const avant = [...new Set(I.places.filter(x => placeIci(x, c, S.lundi)).map(x => x.aeshId))];
    const retrait = avant.filter(id => !f.choisis.includes(id));
    const lot = [], avert = [], lignes = [['Cours', `${K.JOURS[c.j]} ${K.hFr(c.d)}–${K.hFr(c.f)} · ${c.lib}`],
      ['Classe', c.cls.map(n => S.edt.classes[n].court).join(' + ')],
      ['Semaines', f.semaines === 'AB' ? 'A et B' : f.semaines + ' seulement'],
      ['Période', `Du ${K.dateCourte(du)} au ${K.dateCourte(au)}. Les autres semaines sont conservées.`]];
    const cx = ctx();
    const modifies = f.choisis.filter(id => !avant.includes(id) || f.semaines !== f.semainesInit || du !== S.lundi
      || JSON.stringify(f.horaires[id] || null) !== JSON.stringify(f.horairesInit[id] || null));
    for (const id of [...new Set([...modifies, ...retrait])]) {
      const a = I.aesh.get(id); if (!a) continue;
      const renfort = (f.renforts || {})[id], debut = renfort && renfort.du > du ? renfort.du : du;
      const fin = finPourAesh(a, renfort ? (renfort.au < au ? renfort.au : au) : au);
      if (fin < debut) { toast(`${sig(id)} : aucune date avant la fin du contrat.`, true); return; }
      const plages = plagesDe(f.horaires[id], c);
      if (!plages.length || plages.some(h => !K.RE_HEURE.test(h.debut) || !K.RE_HEURE.test(h.fin) || K.min(h.debut) < K.min(c.d) || K.min(h.fin) > K.min(c.f) || K.min(h.fin) <= K.min(h.debut))) { toast('Vérifiez les heures de présence dans le cours.', true); return; }
      const fusion = K.unionIntervalles(plages.map(h => [K.min(h.debut),K.min(h.fin)]));
      const h = {debut:K.hDe(fusion[0][0]),fin:K.hDe(fusion[0][1])};
      const prochain = { id:'place_' + alea(), type:'place', aeshId:id, pole:p.id, coursId:c.id, classes:c.cls,
        jour:c.j, debut:h.debut, fin:h.fin, sem:c.sem, semaines:f.semaines, matiere:c.lib, du:debut, au:fin, statut:'active',
        ...(renfort ? { renfortPfmp:renfort.source } : {}) };
      const prochains = fusion.map(([d,z],i) => ({...prochain,id:i ? 'place_'+alea() : prochain.id,debut:K.hDe(d),fin:K.hDe(z)}));
      if (f.choisis.includes(id)) {
        if (!K.datesPlacement(cx, prochain).length) { toast(`${sig(id)} : aucun cours sur les semaines et dates choisies.`, true); return; }
        const conflit = I.places.find(x => x.coursId !== c.id && prochains.some(y => K.placementsEnConflit(cx, x, y)));
        if (conflit) { toast(`${sig(id)} est déjà placé sur un autre cours aux mêmes dates. Modifiez d’abord cette affectation ; aucun retrait automatique.`, true); return; }
        const dispo = K.disponibilite(cx, id, c.id, debut, fin, p.id, prochain);
        if (dispo.contrainte) avert.push(`${sig(id)} : ${dispo.contrainte.texte}.`);
        if (['reunion','absent'].includes(dispo.etat)) avert.push(`${sig(id)} : ${dispo.texte}${dispo.detail ? ' — ' + dispo.detail : ''}.`);
        if (K.finContratDe(a) && fin < au) avert.push(`${sig(id)} : placement limité au ${K.dateCourte(fin)} (contrat ou renfort temporaire).`);
        lignes.push([sig(id), `${prochains.map(y => K.hFr(y.debut)+'–'+K.hFr(y.fin)).join(' puis ')} · ${K.fmtH(fusion.reduce((t,[d,z]) => t+(z-d)/60,0))} par semaine ${f.semaines === 'AB' ? 'A et B' : f.semaines} · du ${K.dateCourte(debut)} au ${K.dateCourte(fin)}${renfort ? ' · renfort PFMP' : ''}`]);
      } else lignes.push(['Retrait', `${sig(id)} : seulement ${f.semaines === 'AB' ? 'en A et B' : 'en '+f.semaines}, du ${K.dateCourte(debut)} au ${K.dateCourte(fin)}`]);
      // Scinder tous les fragments du cours sur la portée explicite, sans toucher aux autres cours.
      I.places.filter(x => x.aeshId === id && x.coursId === c.id).forEach(x =>
        lot.push(...K.modifierPeriode(x, debut, fin, f.semaines, null, () => 'place_' + alea())));
      if (f.choisis.includes(id)) {
        lot.push(...prochains);
        const pv = K.prevuPourClasse(a,FILIERES,f.classe);
        if(accesComplet() && pv.connu && !pv.prevu) { const r = ficheAvecClasse(id,f.classe); if(r) { lot.push(r.doc); avert.push(r.info); } }
        const q = rattachementDe(a);
        if(accesComplet() && q && q !== p.id && !avant.includes(id)) {
          avert.push(`${sig(id)} : un message sera enregistré pour le référent ${nomPole(q)}.`);
          lot.push({id:'msg_'+alea(),type:'message',pole:p.id,statut:'active',texte:`@ ${nomPole(q)} — ${sig(id)} est placé en ${c.cls.join(' + ')} : ${K.JOURS[c.j]} ${K.hFr(h.debut)}–${K.hFr(h.fin)}, semaines ${f.semaines}, du ${debut} au ${fin}. C’est d’accord pour vous ?`});
        }
      }
    }
    if (!lot.length) return;
    const simulation = new Map(I.places.map(x => [x.id,x]));
    lot.filter(x => x.type === 'place').forEach(x => simulation.set(x.id,x));
    const futur = {...cx,I:{...I,places:[...simulation.values()].filter(x => x.statut === 'active')}};
    for (const id of modifies) {
      for (const l of K.lundisEntre(S.C,du,au)) {
        const bilan = K.bilan(futur,id,l);
        if (bilan && bilan.alertes.some(x => x.type === 'conflit')) avert.push(...bilan.alertes.filter(x=>x.type==='conflit').map(x=>sig(id)+' : '+x.texte));
        if (bilan && bilan.alertes.some(x => x.type === 'contrat' || x.type === 'pole')) {
          avert.push(`${sig(id)} : le planning obtenu dépasse un volume prévu la semaine du ${K.dateCourte(l)} (${K.fmtH(bilan.total)} au total).`); break;
        }
      }
    }
    S.feuille = { type:'confirmer', titre:'Vérifier le placement', grand:f.choisis.map(sig).join(' · ') || 'Retrait',
      lignes, avert:[...new Set(avert)].join('\n'), bouton:'Enregistrer', retourPlacer:f,
      travail:async () => { await ecrireLot(lot, f.base); S.flash = c.id; return {}; } };
    rendre({focus:'cf-oui'});
  }

  function gererClic(ev) {
    const b = ev.target.closest('[data-a]'); if (!b || b.disabled || b.getAttribute('aria-disabled') === 'true') { if (b && b.getAttribute('aria-disabled') === 'true') toast(b.title || 'Pas disponible sur ce créneau', true); return; }
    const a = b.dataset.a, v = b.dataset.v;
    if (typeof a === 'string' && /^el-(notif|aide|doc)\|/.test(a)) {
      const [quoi, nom, i] = a.split('|');
      enregistrerEleve(nom, +i, { [quoi.slice(3)]: v }); return;
    }
    if(b.dataset.lundi && K.RE_DATE.test(b.dataset.lundi)){S.lundi=b.dataset.lundi;if(S.route.p.parite!=='AB')S.route.p.parite=S.C.parite(S.lundi);}
    if (modePlanning) {
      /* 25/09/2026 — Avec l'accès complet, le coordonnateur dispose des mêmes actions qu'un
         référent. La liste blanche ne sert plus qu'à l'accès restreint ; dans les deux cas
         il ne touche jamais au code qui lui ouvre la porte (voir « antoine-activer »). */
      const permis = ['export-grille','export-grille-choix','export-grille-telecharger','edt-parite','edt-type','verification','personne-cours','edt-vue','edt-page','edt-jour','service-detail','besoin-placer','service-horaire','service-enregistrer','service-fin','planning-pole','planning-excel','expliquer-besoin','selection-aesh','touche','sortir','semaine','classe','placer','lecture','choix-aesh','pl-semaines','horaire-tout','horaire-partie','horaire-ajouter','horaire-retirer','periode','valider-placer','fermer','voile','confirmer-non','confirmer-oui'];
      if (!accesComplet() && !permis.includes(a)) return;
      if (a === 'sortir') { awaitSortirPlanning(); return; }
      if (['placer','valider-placer','choix-aesh','pl-semaines'].includes(a) && !peutPlacer(classeCourante())) return;
    }
    if (a === 'voile') { if (ev.target === b && !S.envoi && !(S.feuille && S.feuille.type === 'confirmer' && !S.feuille.fait)) fermer(); return; }
    switch (a) {
      case 'verification': lancerVerification(v); return;
      case 'verification-import': importerVerification(); return;
      case 'service-detail': if(/^[0-4]$/.test(v)) ouvrir({type:'service-detail',jour:+v}); return;
      case 'edt-page': if(['planning','reglages','reunions'].includes(v)) aller('edt',{...S.route.p,vue:v}); return;
      case 'personne-cours': {const c=S.edt.cours[v];if(!c)return;const nom=c.cls.find(n=>classesDu(P().id).includes(n));if(nom && peutPlacer(nom))ouvrirPlacement(v,nom);else ouvrir({type:'lecture',coursId:v,classe:c.cls[0]});return;}
      case 'edt-parite': if(['A','B','AB'].includes(v)){if(v!=='AB')S.lundi=semainesAB(S.C,S.lundi)[v];aller('edt',{...S.route.p,parite:v});} return;
      case 'edt-type': aller('edt',{...S.route.p,edtType:!S.route.p.edtType});return;
      /* ─── Élèves notifiés (26/09/2026) ─── */
      case 'eleves-classe': aller('eleves', { ...S.route.p, classeEleves: v || '' }, { remplacer: true }); return;
      case 'eleves-vue': aller('eleves', { ...S.route.p, vueEleves: v }, { remplacer: true }); return;
      case 'eleves-ccf': tableauCcf(v); return;
      case 'el-ulis': { const [nom, i] = v.split('|'); const e = elevesDe(nom)[+i]; if (e) enregistrerEleve(nom, +i, { ulis: !e.ulis }); return; }
      case 'el-amen': { const [nom, i, cle] = v.split('|'); const e = elevesDe(nom)[+i]; if (!e) return;
        const l = Array.isArray(e.amenagements) ? e.amenagements : [];
        enregistrerEleve(nom, +i, { amenagements: l.includes(cle) ? l.filter(x => x !== cle) : [...l, cle] }); return; }
      case 'edt-vue': if(['jour','semaine'].includes(v)) aller('edt',{...S.route.p,affichage:v},{remplacer:true}); return;
      case 'edt-jour': if(/^[0-4]$/.test(v)) aller('edt',{...S.route.p,jour:v},{remplacer:true}); return;
      case 'besoin-placer': if(S.feuille?.type==='besoin-detail' && peutPlacer(S.feuille.classe)){const nom=S.feuille.classe; S.feuille=null; ouvrirPlacement(v,nom);} return;
      case 'service-horaire': ouvrir({type:'service-horaire',aeshId:K.aeshActifs(idx(),P().id)[0]?.id || '',nom:'Cantine',jour:0,debut:'12:30',fin:'13:00',du:S.lundi,au:raccourcis().find(r=>r.id==='annee')?.fin || '',semaines:'AB',base:new Map(S.docs)}); return;
      case 'service-enregistrer': enregistrerServiceHoraire(); return;
      case 'service-fin': terminerService(b); return;
      case 'planning-pole': if(POLES.some(p=>p.id===v)){S.vu=v;S.route.p={};S.aeshChoisi=null;rendre();} return;
      case 'envoyer-grille': envoyerGrille(); return;
      case 'export-grille': ouvrir({type:'export-grille',qui:S.route.p.aesh?'personne':'equipe',semaines:S.route.p.aesh?'TYPE':(S.route.p.parite||S.C.parite(S.lundi)||'AB'),format:'pdf'});return;
      case 'export-grille-choix': if(S.feuille?.type==='export-grille'){S.feuille[b.dataset.champ]=v;rendre();}return;
      case 'export-grille-telecharger': telechargerGrille();return;
      case 'planning-excel': exporterPlanningSimple(); return;
      case 'selection-aesh': S.aeshChoisi = S.aeshChoisi === v ? null : v; aller('edt',{...S.route.p,vue:'planning'}); return;
      case 'humeur': S.humeur = +v; rendre({ focus: b.id }); return;
      case 'entrer': try { sessionStorage.setItem(K_HUMEUR, '1'); } catch (e) { } if (S.session) { ecouterEstimations(); publierHumeur(); aller(!avatarDe(S.session.pole) && S.etat === 'ok' ? 'avatar' : 'accueil', !avatarDe(S.session.pole) ? { premiere: 1 } : {}, { remplacer: true }); } else aller('code'); return;
      case 'aller-humeur': aller('humeur', {}, { remplacer: true }); return;
      case 'touche': tapeCode(v); return;
      case 'retour': retour(); return;
      case 'aller':
        if (['absence', 'reunions', 'moncode', 'avatar'].includes(v)) S.form = null;
        aller(v, b.dataset.id ? { id: b.dataset.id } : {}); return;
      case 'menu': S.menu = !S.menu; rendre(); if (S.menu) AV.clin(document.querySelector('#t-avatar svg')); return;
      case 'fond': { const n = document.documentElement.dataset.fond === 'blanc' ? 'clair' : 'blanc'; document.documentElement.dataset.fond = n; lsEcrit(K_FOND, n); S.menu = false; rendre(); return; }
      case 'vu': S.vu = v === S.session.pole ? null : v; S.menu = false; S.form = null; S.exp.ids = []; rendre(); return;
      case 'sortir': S.session = null; lsEcrit(K_SESSION, null); S.vu = null; S.menu = false; S.route = { e: 'code', p: {} }; history.replaceState({ e: 'code', p: {}, n: 0 }, ''); S.n = 0; rendre({ haut: true }); return;
      case 'semaine': S.lundi = +v === 0 ? semaineParDefaut() : K.ajoute(S.lundi, +v); if(S.route.p.parite!=='AB')delete S.route.p.parite; rendre({ focus: b.id }); return;
      case 'fiche': S.form = null; aller('fiche', { id: v }); return;
      case 'pas': {
        /* Pas de nouveau rendu à chaque appui : des appuis rapides ne doivent jamais se perdre. */
        const f = S.form, k = v, [genre, cle] = k.includes(':') ? k.split(':') : [k, ''];
        const cur = genre === 'pole' ? nombre(f.a.heures[cle]) : genre === 'serv' ? nombre((f.a.services[+cle] || {}).h) : nombre(f.a[k]);
        const n = Math.max(0, Math.min(k === 'reunionH' ? 20 : 40, Math.round(((cur || 0) + (+b.dataset.d)) * 2) / 2));
        if (genre === 'pole') f.a.heures[cle] = n; else if (genre === 'serv') f.a.services[+cle].h = n; else f.a[k] = n;
        const inp = document.getElementById('pv-' + k.replace(':', '-')); if (inp) inp.value = String(n).replace('.', ',');
        const champ = b.closest('.champ'); if (champ) champ.classList.add('modif');
        const en = document.getElementById('f-enregistrer'); if (en) en.disabled = false;
        clearTimeout(gererClic.t); gererClic.t = setTimeout(() => { if (S.route.e === 'fiche' && S.form === f && !S.feuille) rendre({ focus: document.activeElement && document.activeElement.id }); }, 900);
        return;
      }
      case 'reu-extra-ajouter': {const a=S.form.a;a.reunionsSupplementaires=a.reunionsSupplementaires||[];a.reunionsSupplementaires.push({pole:P().id,jour:0,debut:'13:00',fin:'14:00',semaines:'AB',du:K.isoLocal(),au:raccourcis().find(x=>x.id==='annee').fin});rendre();return;}
      case 'reu-extra-retirer': S.form.a.reunionsSupplementaires.splice(+v,1);rendre();return;
      case 'reu-jour': { const f = S.form, r = f.a.reunion || {}; f.a.reunion = { jour: +v, debut: r.debut || '13:00', fin: r.fin || '14:00' }; rendre({ focus: b.id }); return; }
      case 'reu-aucune': S.form.a.reunion = null; rendre(); return;
      case 'fin-aucune': S.form.a.finContrat = ''; rendre(); return;
      case 'info': S.info = S.info === v ? null : v; rendre({ focus: b.id }); return;
      case 'periode-edt': ouvrir({ type: 'periode', fin: periodeEdt(), fin0: periodeEdt() }); return;
      case 'per-choix': S.feuille.fin = v; rendre({ focus: b.id }); return;
      case 'per-valider': { const f = S.feuille, fin = f.fin, avant = periodeEdt(), fin0 = f.fin0 || avant;
        S.feuille = { type: 'confirmer', titre: 'Vous confirmez ?', grand: `Jusqu’au ${K.dateCourte(fin)}`,
          lignes: [['Avant', `jusqu’au ${K.dateLongue(avant)}`], ['Après', `jusqu’au ${K.dateLongue(fin)}`]],
          avert: 'Cette période vaut pour les quatre pôles : PSR · MELEC, AGOrA, CAPa et Métiers d’Art. Les autres référents la verront aussitôt.',
          bouton: 'Confirmer',
          /* Transaction (audit C03) : si un collègue a changé la période depuis l'ouverture de la fenêtre, on n'écrase
             pas sa date sans le dire — on s'arrête et on montre la sienne. */
          travail: async () => {
            await ecrireTransaction('periode_' + S.annee, serveur => {
              const sur = serveur && K.RE_DATE.test(serveur.jusquau || '') ? serveur.jusquau : periodeDefaut();
              if (sur !== fin0 && sur !== fin) throw Object.assign(new Error('conflit'), { code: 'conflit', qui: nomPole(serveur && serveur.par) || '', champs: [`la période (jusqu’au ${K.dateCourte(sur)})`] });
              return { id: 'periode_' + S.annee, type: 'periode', jusquau: fin, ...(serveur && serveur.creeLe ? { creeLe: serveur.creeLe } : {}) };
            });
            return {}; } };
        rendre({ focus: 'cf-oui' }); return; }
      case 'filieres': { const a = S.form && S.form.a; if (!a) return;
        ouvrir({ type: 'filieres', ouvert: null, avant: JSON.parse(JSON.stringify({ filieres: a.filieres || null, rattachement: a.rattachement || null, equipes: a.equipes || {}, heures: a.heures || {} })) }); return; }
      case 'fil-annuler': restaurerFilieres(S.feuille); fermer(); return;
      case 'fil-toggle': {
        const f = S.form, a = f && f.a, x = filiere(v); if (!a || !x) return;
        a.filieres = { ...(a.filieres || {}) };
        if (a.filieres[v]) {
          delete a.filieres[v];
          const reste = Object.keys(a.filieres).some(id => (filiere(id) || {}).pole === x.pole);
          if (!reste && x.pole !== P().id) {
            a.equipes = { ...(a.equipes || {}) }; delete a.equipes[x.pole];
            a.heures = { ...(a.heures || {}) }; delete a.heures[x.pole];
            if (a.rattachement === x.pole) a.rattachement = P().id;
          }
          if (S.feuille) S.feuille.ouvert = null;
        } else {
          a.filieres[v] = { classes: null };
          a.equipes = { ...(a.equipes || {}), [x.pole]: (a.equipes || {})[x.pole] ?? 1 };
          a.heures = { ...(a.heures || {}) }; if (a.heures[x.pole] === undefined) a.heures[x.pole] = null;
        }
        rendre({ focus: b.id }); return;
      }
      case 'service': { const [nom, j] = String(v).split('|'), dedans = K.auService(idx(), nom, +j).map(a => a.id);
        ouvrir({ type: 'service', nom, j: +j, choisis: [...dedans], avant: [...dedans] }); return; }
      case 'serv-choix': { const f = S.feuille, i = f.choisis.indexOf(v); if (i < 0) f.choisis.push(v); else f.choisis.splice(i, 1); rendre({ focus: b.id }); return; }
      case 'serv-valider': validerService(); return;
      case 'fil-pas': { const a = S.form && S.form.a; if (!a || !a.filieres || !a.filieres[v]) return;
        const cur = nombre(a.filieres[v].h), n = Math.max(0, Math.min(45, Math.round(((cur || 0) + (+b.dataset.d)) * 2) / 2));
        a.filieres = { ...a.filieres, [v]: { ...a.filieres[v], h: n } }; rendre({ focus: b.id }); return; }
      case 'fil-prendre': { const a = S.form && S.form.a, rep = a && resteAPartir(a); if (!a || !rep || !a.filieres[v]) return;
        const cur = nombre(a.filieres[v].h) || 0;
        a.filieres = { ...a.filieres, [v]: { ...a.filieres[v], h: Math.round((cur + rep.reste) * 2) / 2 } }; rendre({ focus: 'pvf-' + v }); return; }
      case 'fil-deplier': if (S.feuille) S.feuille.ouvert = S.feuille.ouvert === v ? null : v; rendre({ focus: b.id }); return;
      case 'fil-classe': {
        const [fid, n] = String(v).split('|'), a = S.form && S.form.a, x = filiere(fid); if (!a || !x || !a.filieres || !a.filieres[fid]) return;
        const cur = a.filieres[fid].classes;
        let cl = Array.isArray(cur) && cur.length ? [...cur] : [...x.classes];
        cl = cl.includes(n) ? cl.filter(y => y !== n) : [...cl, n];
        if (!cl.length) cl = [n];                                   /* au moins une classe */
        a.filieres = { ...a.filieres, [fid]: { classes: cl.length === x.classes.length ? null : x.classes.filter(y => cl.includes(y)) } };
        rendre({ focus: b.id }); return;
      }
      case 'fil-rattach': { const a = S.form && S.form.a; if (a) a.rattachement = v; rendre({ focus: b.id }); return; }
      case 'serv-ajouter': { const f = S.form; f.a.services = f.a.services || []; f.a.services.push({ nom: f.a.services.some(x => x.nom === 'Cantine') ? (f.a.services.some(x => x.nom === 'Internat') ? '' : 'Internat') : 'Cantine', h: 1, jours: [] }); rendre(); return; }
      case 'serv-jour': { const f = S.form, [i, j] = String(v).split('|').map(Number), x = f.a.services[i]; if (!x) return;
        const l = Array.isArray(x.jours) ? [...x.jours] : []; x.jours = l.includes(j) ? l.filter(y => y !== j) : [...l, j].sort(); rendre({ focus: b.id }); return; }
      case 'serv-retirer': { const f = S.form; f.a.services.splice(+v, 1); rendre(); return; }
      case 'demi': { const f = S.form, d = { ...K.disposDe(f.a) }, e = d[v];
        if (!e) d[v] = 'x'; else if (e === 'x') d[v] = 's'; else delete d[v];
        f.a.dispos = d; delete f.a.jours; rendre({ focus: b.id }); return; }
      case 'annuler-fiche': S.form = null; rendre(); return;
      case 'valider-fiche': validerFiche(); return;
      case 'retirer-aesh': retirerAesh(); return;
      case 'choisir-existant': { const I = idx(), x = JSON.parse(JSON.stringify(I.aesh.get(v))); delete x.depart; const p = P(); const orig = JSON.parse(JSON.stringify(x)); x.equipes = { ...(x.equipes || {}), [p.id]: 1 }; x.heures = { ...(x.heures || {}), [p.id]: null }; x.services = K.servicesDe(x); x.dispos = K.disposDe(x); delete x.jours; delete x.cantine; delete x.internat; delete x.service; delete x.serviceLib;
        x.filieres = { ...(K.filieresDe(x) || filieresParDefaut(orig)), ...Object.fromEntries(filieresDuPole(p.id).map(g => [g.id, { classes: null }])) }; x.rattachement = rattachementDe(x); S.form = { kind: 'fiche', cle: 'nouveau', id: 'nouveau', existant: true, choisi: true, a: x, orig }; rendre({ haut: true, focus: 'pv-pole-' + p.id }); return; }
      case 'choisir-nouveau': { const f = S.form; f.a.sigle = K.normSigle(f.recherche); f.choisi = true; rendre({ haut: true, focus: 'pv-contrat' }); return; }
      case 'abs-aesh': formAbsence().aeshId = v; rendre({ focus: b.id }); return;
      case 'abs-motif': formAbsence().motif = v; rendre({ focus: b.id }); return;
      case 'abs-journee': formAbsence().journee = v === '1'; rendre({ focus: b.id }); return;
      case 'valider-absence': {
        const f = formAbsence(), I = idx(), t = coursTouches(f), sig = (I.aesh.get(f.aeshId) || {}).sigle;
        confirmerPuis({ titre: f.id ? 'Modifier cette absence ?' : 'Vous confirmez ?', grand: sig, lignes: [['Motif', K.MOTIFS[f.motif] + (String(f.note || '').trim() ? ' · ' + f.note.trim() : '')], ['Dates', f.du === f.au ? K.dateLongue(f.du) : `du ${K.dateLongue(f.du)} au ${K.dateLongue(f.au)}`], ['Horaires', f.journee ? 'journée entière' : `${K.hFr(f.debut)}–${K.hFr(f.fin)}`], ['À couvrir', String(t.length)]], bouton: 'Confirmer' }, async () => {
          await ecrire({ id: f.id || ('abs_' + alea()), type: 'absence', aeshId: f.aeshId, motif: f.motif, du: f.du, au: f.au, journee: !!f.journee, debut: f.journee ? '' : f.debut, fin: f.journee ? '' : f.fin, note: String(f.note || '').slice(0, 120), statut: 'active' });
          S.form = null; return {};
        });
        return;
      }
      case 'modifier-absence': { const x = idx().absences.find(y => y.id === v); if (!x) return; S.form = { kind: 'absence', id: x.id, aeshId: x.aeshId, motif: x.motif, du: x.du, au: x.au, journee: x.journee !== false, debut: x.debut || '08:30', fin: x.fin || '12:30', note: x.note || '' }; rendre({ haut: true, focus: 'ab-du' }); return; }
      case 'annuler-absence': S.form = null; rendre({ haut: true }); return;
      case 'retirer-absence': { const x = idx().absences.find(y => y.id === v), a = x && idx().aesh.get(x.aeshId); if (!x) return;
        confirmerPuis({ titre: 'Retirer cette absence ?', grand: a ? a.sigle : '', lignes: [[K.MOTIFS[x.motif], x.du === x.au ? K.dateLongue(x.du) : `du ${K.dateCourte(x.du)} au ${K.dateCourte(x.au)}`]], danger: true, bouton: 'Retirer' }, async () => { await ecrire({ ...x, statut: 'retire' }); return {}; }); return; }
      case 'valider-reunion': { const f = S.form; if(!f || !K.RE_DATE.test(f.date) || K.jourSemaine(f.date)!==0 || S.C.off(f.date) || K.duree(f.debut,f.fin)!==1){toast('Choisissez un lundi de cours et une durée d’une heure.',true);return;} if (idx().reunions.some(r => K.lundiDe(r.date) === K.lundiDe(f.date))) { toast('Une réunion institutionnelle est déjà prévue cette semaine.', true); return; }
        const reunion={id:'reunion_'+f.date,type:'reunion',date:f.date,debut:f.debut,fin:f.fin,libelle:'Réunion institutionnelle',statut:'active'};
        const futur={...ctx(),I:{...idx(),reunions:[...idx().reunions,reunion]}};
        const alertes=[...new Set(K.aeshActifs(idx()).flatMap(a=>K.bilan(futur,a.id,K.lundiDe(f.date)).alertes.filter(x=>x.type==='conflit').map(x=>a.sigle+' · '+x.texte)))];
        confirmerPuis({ titre: 'Ajouter cette réunion ?', grand: K.dateLongue(f.date), sous: `${K.hFr(f.debut)}–${K.hFr(f.fin)} · tous les AESH · remplace la réunion d’équipe`,avert:alertes.join('\n'), bouton: 'Ajouter' }, async () => { await ecrireLot([reunion],f.base); S.form = null; return {}; }); return; }
      case 'retirer-reunion': { const r = [...S.docs.values()].find(x => x.id === v); if (!r) return; confirmerPuis({ titre: 'Retirer cette date ?', grand: K.dateLongue(r.date), danger: true, bouton: 'Retirer' }, async () => { await ecrire({ ...r, statut: 'retire' }); return {}; }); return; }
      case 'classe': aller('edt', { classe: v }, { remplacer: true }); return;
      case 'pfmp': { const nom = classeCourante(); ouvrir({ type: 'pfmp', classe: nom, lignes: (S.edt.classes[nom].pfmp || []).map(x => ({ debut: x.debut, fin: x.fin, label: x.label || 'PFMP' })) }); return; }
      case 'pfmp-ajouter': S.feuille.lignes.push({ debut: '', fin: '', label: 'PFMP' + (S.feuille.lignes.length + 1) }); rendre({ focus: 'pf-du-' + (S.feuille.lignes.length - 1) }); return;
      case 'pfmp-retirer': S.feuille.lignes.splice(+v, 1); rendre(); return;
      case 'pfmp-valider': { const f = S.feuille, p = P(), k = S.edt.classes[f.classe], lignes = f.lignes.map((x, i) => ({ debut: x.debut, fin: x.fin, label: 'PFMP' + (i + 1) }));
        S.feuille = { type: 'confirmer', titre: 'Vous confirmez ?', grand: k.court, lignes: lignes.length ? lignes.map(x => [x.label, `du ${K.dateLongue(x.debut)} au ${K.dateLongue(x.fin)}`]) : [['PFMP', 'aucune']], bouton: 'Confirmer',
          travail: async () => { const d = S.docs.get('pole_' + p.id) || {}; await ecrirePole(p.id, { pfmp: { ...(d.pfmp || {}), [f.classe]: lignes } }); appliquerPfmp(); return {}; } };
        rendre({ focus: 'cf-oui' }); return; }
      case 'pfmp-deplacer': ouvrir({ type: 'deplacer', aeshId: v, source: classeCourante(), periode: 'pfmp', pole: P().id, classe: null, choisis: [], base: new Map(S.docs) }); return;
      case 'dep-periode': S.feuille.periode = v; S.feuille.choisis = []; rendre({ focus: b.id }); return;
      case 'dep-pole': S.feuille.pole = v; S.feuille.classe = null; S.feuille.choisis = []; rendre({ focus: b.id }); return;
      case 'dep-classe': S.feuille.classe = v; S.feuille.choisis = []; rendre({ focus: b.id }); return;
      case 'dep-cours': { const l = S.feuille.choisis; S.feuille.choisis = l.includes(v) ? l.filter(x => x !== v) : [...l, v]; rendre({ focus: b.id }); return; }
      case 'dep-valider': validerDeplacer(); return;
      case 'placer': ouvrirPlacement(v,classeCourante()); return;
      case 'pl-semaines': S.feuille.semaines = v; rendre({ focus: b.id }); return;
      case 'choix-aesh': {
        const f = S.feuille, i = f.choisis.indexOf(v);
        if (i < 0) {
          f.choisis.push(v);
          const c = S.edt.cours[f.coursId], source = K.liberePfmpCreneau(ctx(), v, S.lundi, c.j, c.d, c.f);
          if (source) { const r = K.bornesRenfort(S.edt.classes[source], S.lundi, 'pfmp'); if (r) f.renforts[v] = { source, du:r.du, au:r.au }; }
        } else { f.choisis.splice(i, 1); delete f.renforts[v]; }
        rendre({ focus: b.id }); return;
      }
      case 'autres-aesh': S.feuille.autres = true; rendre(); return;
      case 'horaire-tout': delete S.feuille.horaires[v]; rendre({ focus: b.id }); return;
      case 'horaire-ajouter': { const f=S.feuille,c=S.edt.cours[f.coursId]; f.horaires[v]=[...plagesDe(f.horaires[v],c),{debut:c.d,fin:K.hDe(Math.min(K.min(c.f),K.min(c.d)+30))}]; rendre(); return; }
      case 'horaire-retirer': S.feuille.horaires[v].splice(+b.dataset.index,1); rendre(); return;
      case 'horaire-partie': { const c = S.edt.cours[S.feuille.coursId]; S.feuille.horaires[v] = { debut: c.d, fin: K.hDe(Math.min(K.min(c.f), K.min(c.d) + 60)) }; rendre({ focus: b.id }); return; }
      /* Relancer l'enseignant d'un cours qui n'a pas encore été estimé : message tout prêt, destinataire au choix. */
      case 'mail-estimation': {
        const c2 = S.edt.cours[v]; if (!c2) return;
        const nom = classeCourante(), k = S.edt.classes[nom], fil = filiereDeClasse(nom);
        const lien = new URL('../demandes-aesh/' + (fil ? '?filiere=' + encodeURIComponent(fil.id) : ''), location.href).href;
        const sujet = `Accompagnement AESH — votre avis pour ${k.court} · ${c2.lib}`;
        const corps = `Bonjour,\n\nPour préparer l'accompagnement des élèves, nous recensons cours par cours le besoin d'AESH.\n\n`
          + `Votre cours : ${k.court} · ${c2.lib} · ${K.JOURS[c2.j]} ${K.hFr(c2.d)}–${K.hFr(c2.f)}`
          + `${c2.sem === 'SA' ? ' (semaines A)' : c2.sem === 'SB' ? ' (semaines B)' : ''}\nIl n'a pas encore été estimé.\n\n`
          + `En deux minutes, sur cette page : ${lien}\nVous y indiquez, pour chacun de vos cours, le nombre d'AESH souhaité.\n\n`
          + `Merci beaucoup,\nLa coordination`;
        try { navigator.clipboard.writeText(corps); } catch (e) { }
        try { window.open('mailto:?subject=' + encodeURIComponent(sujet) + '&body=' + encodeURIComponent(corps), '_self'); } catch (e) { }
        toast('Message préparé — choisissez le destinataire (il est aussi copié).');
        return; }
      case 'expliquer-besoin': if(S.edt.cours[v] && S.edt.classes[b.dataset.classe]) {
        const cible = cibleBesoin(S.cadreEstBrut,S.edt,b.dataset.classe,S.edt.cours[v]);
        const base = cible ? S.estDocs.get(cible.id) || null : null;
        ouvrir({type:'besoin-detail',coursId:v,classe:b.dataset.classe,cible,base:base ? JSON.parse(JSON.stringify(base)) : null,nb:base?.statut==='active' ? base.nb : null});
      } return;
      case 'besoin-nombre': if(S.feuille?.type==='besoin-detail' && peutEstimer(S.feuille.classe)) { S.feuille.nb=Number(v); S.feuille.confirmation=false; rendre({focus:b.id}); } return;
      case 'besoin-enregistrer': sauverBesoin(); return;
      case 'lecture': if(S.edt.cours[v]) ouvrir({type:'lecture',coursId:v,classe:classeCourante()}); return;
      case 'periode': S.feuille.periode = v; if (v === 'date' && !S.feuille.au) S.feuille.au = K.ajoute(S.lundi, 4); rendre({ focus: b.id }); return;
      case 'valider-placer': validerPlacer(); return;
      case 'edt-cours': { const [nom, id] = v.split('|'); const c = S.edt.cours[id]; if (!c) return;
        if (!classesDu(P().id).includes(nom)) { toast('Ce cours est dans un autre pôle.', true); return; }
        if (!S.C.coursSemaine(c, S.lundi)) { S.lundi = K.ajoute(S.lundi, 7); }
        aller('edt', { classe: nom });
        setTimeout(() => { const el = document.getElementById('c-' + id) || document.getElementById('cl-' + id); if (el) { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); el.click(); } }, 60); return; }
      case 'ens-tous': aller('ensemble', { ...S.route.p, tous: +v ? 1 : 0 }, { remplacer: true }); return;
      case 'ens-mode': aller('ensemble', { ...S.route.p, mode: v }, { remplacer: true }); return;
      case 'ens-pole': aller('ensemble', { ...S.route.p, pole: v, classe: '' }, { remplacer: true }); return;
      case 'ens-classe': aller('ensemble', { ...S.route.p, classe: v }, { remplacer: true }); return;
      case 'ens-aesh': aller('ensemble', { ...S.route.p, aesh: v }, { remplacer: true }); return;
      case 'bes-classe': aller('besoins', { ...(v ? { classe: v } : {}), ...(S.route.p.mat ? { mat: S.route.p.mat } : {}) }, { remplacer: true }); return;
      case 'bes-mat': { const m = v && v !== S.route.p.mat ? v : ''; aller('besoins', { ...(S.route.p.classe ? { classe: S.route.p.classe } : {}), ...(m ? { mat: m } : {}) }, { remplacer: true }); return; }
      case 'envoyer-message': {
        const t = S.msgBrouillon.trim().slice(0, 1000); if (!t || S.envoi) return;
        confirmerPuis({ titre: 'Envoyer ce message ?', sous: t.length > 300 ? t.slice(0, 300) + '…' : t, avert: 'Tous les référents le liront. Sans nom d’élève.', bouton: 'Envoyer', faitSous: 'Message envoyé' }, async () => {
          await ecrire({ id: 'msg_' + alea(), type: 'message', pole: S.session.pole, texte: t, statut: 'active' });
          S.msgBrouillon = ''; apresRendu.vu = false; return {};
        });
        return;
      }
      case 'retirer-message': { const m = S.docs.get(v); if (!m) return; confirmerPuis({ titre: 'Retirer ce message ?', sous: m.texte.slice(0, 140), danger: true, bouton: 'Retirer' }, async () => { await ecrire({ ...m, statut: 'retire' }); return {}; }); return; }
      case 'exp-quoi': S.exp.quoi = v; S.exp.ids = []; rendre({ focus: b.id }); return;
      case 'exp-id': { const i = S.exp.ids.indexOf(v); if (i < 0) S.exp.ids.push(v); else S.exp.ids.splice(i, 1); rendre({ focus: b.id }); return; }
      case 'exp-format': S.exp.format = v; rendre({ focus: b.id }); return;
      case 'exporter': b.disabled = true; lancerExport().catch(e => { console.error(e); toast('L’export n’a pas pu être fabriqué.', true); }).finally(() => { b.disabled = false; }); return;
      case 'code-voir': S.form.voir = !S.form.voir; rendre({ focus: b.id }); return;
      case 'antoine-activer': {
        if (modePlanning || S.session?.pole !== 'PSR_MELEC') return;
        const code = S.form?.antoine1;
        if (!/^\d{4}$/.test(code || '') || code !== S.form?.antoine2 || POLES.some(p => codeDe(p.id) === code)) return;
        confirmerPuis({titre:'Activer l’accès Antoine ?',sous:'PSR et autres pôles modifiables et MELEC en consultation dans son interface.',bouton:'Activer'},async()=>{
          await ecrirePole('PSR_MELEC',{accesPlanning:{actif:true,code}}); S.form=null; return {};
        }); return;
      }
      case 'antoine-desactiver': {
        if (modePlanning || S.session?.pole !== 'PSR_MELEC') return;
        const acces=S.docs.get('pole_PSR_MELEC')?.accesPlanning; if(!acces) return;
        confirmerPuis({titre:'Désactiver l’accès Antoine ?',sous:'Les emplois du temps restent conservés.',bouton:'Désactiver'},async()=>{
          await ecrirePole('PSR_MELEC',{accesPlanning:{...acces,actif:false}}); return {};
        }); return;
      }
      case 'valider-code': { const f = S.form, p = pole(S.session.pole);
        confirmerPuis({ titre: 'Changer le code ?', grand: f.n1, sous: `Pôle ${p.nom}. Pensez à le noter : l’ancien code ne marchera plus.`, bouton: 'Changer' }, async () => {
          await ecrirePole(p.id, { code: f.n1 });
          S.session = { pole: p.id, code: f.n1 }; lsEcrit(K_SESSION, S.session); S.form = null;
          return { ensuite: () => aller('accueil', {}, { remplacer: true }) };
        }); return; }
      case 'ecrire-a': { const q = pole(v); if (!q) return; const [sig, txt] = String(b.dataset.sujet || '').split('|');
        S.msgBrouillon = sig ? `@ ${q.nom} — au sujet de ${sig} : ${txt}\n\n` : (S.msgBrouillon.startsWith('@') ? S.msgBrouillon : `@ ${q.nom} — ${S.msgBrouillon}`);
        apresRendu.vu = false; if (S.route.e === 'messages') { rendre({ focus: 'msg-txt' }); const t = document.getElementById('msg-txt'); if (t) t.setSelectionRange(t.value.length, t.value.length); } else aller('messages'); setTimeout(() => { const t = document.getElementById('msg-txt'); if (t) { t.focus(); t.setSelectionRange(t.value.length, t.value.length); } }, 80); return; }
      case 'complet': { const p = P(), r = raccourcis().filter(x => x.id !== 'semaine');
        ouvrir({ type: 'confirmer', titre: 'Emploi du temps complet ?', grand: p.nom, sous: 'Les autres référents pourront compter sur les heures libres de vos AESH. Vous pourrez reprendre la saisie à tout moment.', choixPeriode: r, periode: r[0].id, bouton: 'Confirmer',
          travail: async () => { const f = S.feuille, fin = (r.find(x => x.id === f.periode) || r[0]).fin; await ecrirePole(p.id, { complet: { jusquau: fin, le: new Date().toISOString() } }); return {}; } });
        return; }
      case 'complet-non': { const p = P(); confirmerPuis({ titre: 'Reprendre la saisie ?', grand: p.nom, sous: 'Les heures libres de vos AESH seront de nouveau marquées « à confirmer » pour les autres référents.', bouton: 'Reprendre' }, async () => { await ecrirePole(p.id, { complet: null }); return {}; }); return; }
      case 'av-opt': { const f = formAvatar(), k = b.dataset.k, val = b.dataset.v; const type = (f.a.type === 'mascotte' ? AV.OPTIONS_MASCOTTE : AV.OPTIONS_PORTRAIT).find(o => o[0] === k); f.a[k] = type && type[3] === 'b' ? val === 'oui' : val; rendre({ focus: b.id || undefined }); AV.clin(document.getElementById('av-svg')); return; }
      case 'av-groupe': { const f = formAvatar(); f.groupe = f.groupe === v ? '' : v; rendre(); return; }
      case 'av-hasard': { const f = formAvatar(); f.a = AV.auHasard(f.a.type); rendre({ focus: 'av-hasard' }); AV.clin(document.getElementById('av-svg')); return; }
      case 'av-type': { const f = formAvatar(); if (f.a.type !== v) { f.a = AV.auHasard(v); f.groupe = ''; rendre({ focus: b.id }); } return; }
      case 'av-clin': AV.clin(document.getElementById('av-svg')); return;
      case 'av-annuler': S.form = null; aller('accueil', {}, { remplacer: true }); return;
      case 'av-valider': { const f = formAvatar(), a = AV.normaliser(f.a), p = pole(S.session.pole);
        confirmerPuis({ titre: 'C’est vous ?', sous: `Référent ${p.nom}. On vous verra ainsi dans les messages et sur l’accueil.`, apercu: AV.svgAvatar(a, { taille: 120 }), bouton: 'Oui, c’est moi' }, async () => { await ecrirePole(p.id, { avatar: a }); S.form = null; return { ensuite: () => aller('accueil', {}, { remplacer: true }) }; }); return; }
      case 'choix-periode-c': S.feuille.periode = v; rendre({ focus: b.id }); return;
      case 'bascule': if (S.feuille && S.feuille.bascule) S.feuille.bascule.on = !S.feuille.bascule.on; rendre({ focus: b.id }); return;
      case 'partager': { const p = P(), sign = lsLit(K_SIGN, '') || `Le référent AESH du pôle ${p.nom}`; ouvrir({ type: 'partager', signature: sign, texte: texteMessage(p, sign), copie: false }); return; }
      case 'copier': { const t = S.feuille.texte; const fin = () => { S.feuille.copie = true; rendre({ focus: 'pt-copier' }); setTimeout(() => { if (S.feuille && S.feuille.copie) { S.feuille.copie = false; rendre({ focus: 'pt-copier' }); } }, 2500); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(fin, () => { const ta = document.getElementById('pt-texte'); ta.select(); try { document.execCommand('copy'); fin(); } catch (e) { toast('Sélectionnez le texte puis copiez-le.', true); } });
        else { const ta = document.getElementById('pt-texte'); ta.select(); try { document.execCommand('copy'); fin(); } catch (e) { toast('Sélectionnez le texte puis copiez-le.', true); } }
        return; }
      case 'fermer': fermer(); return;
      case 'confirmer-non': { const f = S.feuille; if (f.retourPlacer) { S.feuille = f.retourPlacer; rendre({ focus: 'pl-valider' }); } else if (f.retourDeplacer) { S.feuille = f.retourDeplacer; rendre({ focus: 'dep-valider' }); } else if (f.retourService) { S.feuille = f.retourService; rendre({ focus: 'sv-valider' }); } else fermer(); return; }
      case 'confirmer-oui': executerConfirmation(); return;
    }
  }
  function gererSaisie(ev) {
    const t = ev.target, k = t.dataset && t.dataset.i;
    if (!k) return;
    const f = S.form;
    if (k === 'el-heures' || k === 'el-fin') {
      const [nom, i] = String(t.dataset.v || '').split('|');
      if (ev.type !== 'change') return;
      enregistrerEleve(nom, +i, k === 'el-heures' ? { heures: t.value.trim().slice(0, 6) } : { fin: t.value.trim().slice(0, 10) });
      return;
    }
    if(k==='filtre-aesh'){if(ev.type==='change') aller('edt',{...S.route.p,aesh:t.value},{remplacer:true});return;}
    if(k==='service-champ') { const q=S.feuille; if(q?.type!=='service-horaire') return; q[t.dataset.champ]=t.dataset.champ==='jour'?+t.value:t.value; if(t.dataset.champ==='nom') { q.debut=q.nom==='Internat'?'18:00':'12:30'; q.fin=q.nom==='Internat'?'21:00':'13:00'; } if(ev.type==='change') rendre({focus:t.id}); return; }
    if (!f && !['per-au', 'per-edt-date', 'ph-debut', 'ph-fin', 'pl-du', 'msg', 'signature', 'pt-texte', 'pf-du', 'pf-au'].includes(k)) return;
    if (k === 'recherche') { f.recherche = t.value; rendre({ focus: t.id }); return; }
    if (k === 'sigle') { f.a.sigle = t.value; const en = document.getElementById('f-enregistrer'); if (en) en.disabled = false; const ch = t.closest('.champ'); if (ch) ch.classList.add('modif'); return; }
    if (k === 'serv-nom') { const i = +t.dataset.v, x = f.a.services[i]; if (x) { x.nom = t.value === 'Autre' ? '' : t.value; rendre({ focus: t.value === 'Autre' ? undefined : t.id }); if (t.value === 'Autre') { const inp = document.querySelector(`[data-i="serv-lib"][data-v="${i}"]`); if (inp) inp.focus(); } } return; }
    if (k === 'serv-lib') { const x = f.a.services[+t.dataset.v]; if (x) x.nom = t.value.slice(0, 40); const en = document.getElementById('f-enregistrer'); if (en) en.disabled = false; return; }
    if (k === 'fil-h') { const a = S.form && S.form.a, id = t.dataset.v; if (!a || !a.filieres || !a.filieres[id]) return;
      const raw = t.value.trim().replace(',', '.'); let n = raw === '' ? null : Number(raw); if (raw !== '' && !Number.isFinite(n)) return;
      if (n != null) n = Math.max(0, Math.min(45, Math.round(n * 2) / 2));
      a.filieres = { ...a.filieres, [id]: { ...a.filieres[id], h: n } };
      clearTimeout(gererSaisie.t); gererSaisie.t = setTimeout(() => { if (S.feuille && S.feuille.type === 'filieres') rendre({ focus: t.id }); }, 700);
      return;
    }
    if (k === 'nb') {
      /* Aucun nouveau rendu ici : la perte du focus (clic sur « Enregistrer ») ne doit pas avaler le clic. */
      const v = t.value.trim().replace(',', '.'); let n = v === '' ? null : Number(v); if (v !== '' && !Number.isFinite(n)) return;
      if (n != null) { n = Math.max(0, Math.min(t.dataset.v === 'reunionH' ? 20 : 45, Math.round(n * 2) / 2)); const aff = String(n).replace('.', ','); if (t.value.trim() !== aff && ev.type === 'change') t.value = aff; }
      { const [genre, cle] = String(t.dataset.v).includes(':') ? t.dataset.v.split(':') : [t.dataset.v, '']; if (genre === 'pole') f.a.heures[cle] = n; else if (genre === 'serv') f.a.services[+cle].h = n; else f.a[t.dataset.v] = n; }
      const champ = t.closest('.champ'); if (champ) champ.classList.add('modif');
      const en = document.getElementById('f-enregistrer'); if (en) en.disabled = false;
      /* Un instant après la frappe, on réaffiche : le contrôle « contrat = présence + réunion + services »
         se met à jour. Jamais tout de suite, pour ne pas avaler le clic sur « Enregistrer ». */
      clearTimeout(gererSaisie.t); gererSaisie.t = setTimeout(() => { if (S.route.e === 'fiche' && S.form === f && !S.feuille) rendre({ focus: document.activeElement && document.activeElement.id }); }, 700);
      return;
    }
    if (k === 'fin-contrat') { f.a.finContrat = t.value || ''; if (ev.type === 'change') rendre({ focus: t.id }); return; }
    if(k==='reu-extra-champ'){const r=f.a.reunionsSupplementaires?.[+t.dataset.index];if(r)r[t.dataset.champ]=t.dataset.champ==='jour'?+t.value:t.value;return;}
    if (k === 'reu-h') { f.a.reunion = { ...(f.a.reunion || { jour: 0 }), debut: t.value, fin: K.hDe(K.min(t.value) + 60) }; rendre({ focus: t.id }); return; }
    if (k === 'abs-du') { f.du = t.value; if (f.au < f.du) f.au = f.du; if (ev.type === 'change') rendre({ focus: t.id }); return; }
    if (k === 'abs-au') { f.au = t.value; if (ev.type === 'change') rendre({ focus: t.id }); return; }
    if (k === 'abs-debut') { f.debut = t.value; rendre({ focus: t.id }); return; }
    if (k === 'abs-fin') { f.fin = t.value; rendre({ focus: t.id }); return; }
    if (k === 'abs-note') { f.note = t.value; const btn = document.getElementById('ab-valider'); if (btn && f.motif === 'autre') btn.disabled = !t.value.trim(); return; }
    if (k === 'r-date') { f.date = t.value; if (ev.type === 'change') rendre({ focus: t.id }); return; }
    if (k === 'r-debut') { f.debut = t.value; if (K.min(f.fin) <= K.min(f.debut)) f.fin = K.hDe(K.min(f.debut) + 60); rendre({ focus: t.id }); return; }
    if (k === 'r-fin') { f.fin = t.value; rendre({ focus: t.id }); return; }
    if (k === 'pf-du' || k === 'pf-au') { const x = S.feuille && S.feuille.lignes[+t.dataset.v]; if (!x) return; if (k === 'pf-du') { x.debut = t.value; if (x.fin && x.fin < x.debut) x.fin = x.debut; } else x.fin = t.value; if (ev.type === 'change') rendre({ focus: t.id }); return; }
    if (k === 'pl-du') { S.feuille.du = t.value; if (ev.type === 'change') rendre({focus:t.id}); return; }
    if (k === 'ph-debut' || k === 'ph-fin') { const h = S.feuille && plagesDe(S.feuille.horaires[t.dataset.v],S.edt.cours[S.feuille.coursId])[+(t.dataset.index || 0)]; if (!h) return; if (k === 'ph-debut') { h.debut = t.value; if (K.min(h.fin) <= K.min(h.debut)) h.fin = K.hDe(Math.min(K.min(S.edt.cours[S.feuille.coursId].f),K.min(h.debut) + 30)); } else { h.fin = t.value; if (K.min(h.fin) <= K.min(h.debut)) h.debut = K.hDe(Math.max(K.min(S.edt.cours[S.feuille.coursId].d),K.min(h.fin) - 30)); } rendre({ focus: t.id }); return; }
    if (k === 'per-edt-date') { if (S.feuille) S.feuille.fin = t.value; if (ev.type === 'change') rendre({ focus: t.id }); return; }
    if (k === 'per-au') { S.feuille.au = t.value; if (ev.type === 'change') rendre({ focus: t.id }); return; }
    if (k === 'msg') { const avant = !!S.msgBrouillon.trim(); S.msgBrouillon = t.value; if (avant !== !!t.value.trim()) { const btn = document.getElementById('msg-envoyer'); if (btn) btn.disabled = !t.value.trim() || S.envoi; } return; }
    if (['n1','n2','antoine1','antoine2'].includes(k)) { f[k] = t.value.replace(/\D/g, '').slice(0, 4); rendre({ focus: t.id }); return; }
    if (k === 'signature') { S.feuille.signature = t.value; lsEcrit(K_SIGN, t.value); S.feuille.texte = texteMessage(P(), t.value); const ta = document.getElementById('pt-texte'); if (ta) ta.value = S.feuille.texte; const m = document.getElementById('pt-mail'); if (m) m.href = `mailto:?subject=${encodeURIComponent(`Besoins d’accompagnement des élèves · ${P().nom}`)}&body=${encodeURIComponent(S.feuille.texte)}`; return; }
    if (k === 'pt-texte') { S.feuille.texte = t.value; const m = document.getElementById('pt-mail'); if (m) m.href = `mailto:?subject=${encodeURIComponent(`Besoins d’accompagnement des élèves · ${P().nom}`)}&body=${encodeURIComponent(t.value)}`; return; }
  }
  racine.addEventListener('dragstart', ev => {
    const b = ev.target.closest('[data-aesh-drag]'); if (!b || !ev.dataTransfer) return;
    ev.dataTransfer.setData('text/plain',b.dataset.aeshDrag); ev.dataTransfer.effectAllowed = 'copy';
  });
  racine.addEventListener('dragover', ev => { if(ev.target.closest('[data-a="placer"]')) ev.preventDefault(); });
  racine.addEventListener('drop', ev => {
    const b = ev.target.closest('[data-a="placer"]'), id = ev.dataTransfer?.getData('text/plain');
    if(!b || !idx().aesh.has(id) || !peutPlacer(classeCourante())) return;
    ev.preventDefault(); S.aeshChoisi = id; b.click();
  });
  racine.addEventListener('click', gererClic);
  racine.addEventListener('input', gererSaisie);
  racine.addEventListener('change', gererSaisie);
  racine.addEventListener('keydown', ev => {
    if (ev.key === 'Enter' && ev.target.tagName === 'TR' && ev.target.dataset.a) { ev.target.click(); return; }
    if (ev.key === 'Enter' && ev.target.id === 'msg-txt' && (ev.metaKey || ev.ctrlKey)) { const b = document.getElementById('msg-envoyer'); if (b && !b.disabled) b.click(); return; }
    if (ev.key === 'Escape') { if (S.menu) { S.menu = false; rendre(); } else if (S.feuille && !S.envoi) { if (S.feuille.type === 'confirmer' && S.feuille.retourPlacer) { S.feuille = S.feuille.retourPlacer; rendre(); } else { restaurerFilieres(S.feuille); fermer(); } } }
  });
  document.addEventListener('keydown', ev => { if (ev.target && /^(INPUT|TEXTAREA|SELECT)$/.test(ev.target.tagName)) return; if ((S.route.e === 'code' || !S.session) && S.route.e !== 'humeur' && /^[0-9]$/.test(ev.key)) tapeCode(ev.key); else if (S.route.e === 'code' && ev.key === 'Backspace') tapeCode('⌫'); });
  document.addEventListener('click', ev => { if (S.menu && !ev.target.closest('.menu') && !ev.target.closest('#t-menu')) { S.menu = false; rendre(); } }, true);

  async function awaitSortirPlanning() {
    try { await droitsPlanning?.deconnecter?.(); } finally { location.reload(); }
  }
  /* ─────────── départ ─────────── */
  if (!modePlanning) ecouter();
  let humeurVue = false; try { humeurVue = !!sessionStorage.getItem(K_HUMEUR); } catch (e) { }
  const premier = modePlanning ? 'code' : !humeurVue ? 'humeur' : S.session ? 'accueil' : 'code';
  S.route = { e: premier, p: {} };
  history.replaceState({ e: premier, p: {}, n: 0 }, '');
  if (S.session) ecouterEstimations();
  rendre({ haut: true });
  window.__REFERENTS__ = { S, idx, ctx };
}
