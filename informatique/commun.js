/* ═══════════════════════════════════════════════════════════════════════════
   Informatique — État des lieux des ordinateurs — module commun (10/11/2026)
   • index.html    : page ENSEIGNANT ouverte par le QR code de la salle. Rien à lire :
                     on choisit le poste, on coche, on envoie.
   • referent.html : tableau de bord de l'ENSEIGNANT INFORMATIQUE (accès par code) :
                     salles, plan, fiches des postes (marque, modèle, équipements…),
                     pannes en temps réel, réparations, bilans, QR codes.

   Firestore (projet coordination-pedagogie) :
   • coordination_info_parc/parc_<code 10>   → l'espace du référent : nom, salles, catalogue.
   • coordination_info_salles/salle_<clé 12> → UNE salle : postes, équipements, signalements.
   Lecture par identifiant seulement (get), aucune liste, aucune suppression.
   AUCUN NOM DE PERSONNE : salle, poste, matériel, panne, dates.
   ═══════════════════════════════════════════════════════════════════════════ */
const firebaseConfig = { apiKey:"AIzaSyBj_GXG8ln3GAxNXxiJkT2HPSWIHJpc1lA", authDomain:"coordination-pedagogie.firebaseapp.com",
  projectId:"coordination-pedagogie", storageBucket:"coordination-pedagogie.firebasestorage.app", messagingSenderId:"526058585010", appId:"1:526058585010:web:ba4dd6d9c8281ba5bf02ab" };

export const COL_PARC = 'coordination_info_parc';
export const COL_SALLE = 'coordination_info_salles';
export const RE_PARC = /^parc_[a-z0-9]{10}$/;
export const RE_SALLE = /^salle_[a-z0-9]{12}$/;
export const MAX_POSTES = 80, MAX_SALLES = 30, MAX_SIG = 400, MAX_DATES = 30;

/* ───────── Icônes (traits, couleur du texte) ───────── */
const P = {
  ecran: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M9 20h6M12 16v4"/>',
  clavier: '<rect x="2.5" y="6.5" width="19" height="11" rx="2"/><path d="M6 10h.01M9 10h.01M12 10h.01M15 10h.01M18 10h.01M7 14h10"/>',
  souris: '<rect x="7" y="3" width="10" height="18" rx="5"/><path d="M12 7v3"/>',
  casque: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
  webcam: '<circle cx="12" cy="10" r="6"/><circle cx="12" cy="10" r="2"/><path d="M8 20h8M12 16v4"/>',
  uc: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M10 6.5h4M12 17h.01"/>',
  portable: '<path d="M5 5.5h14a1 1 0 0 1 1 1V15H4V6.5a1 1 0 0 1 1-1z"/><path d="M2 18.5h20"/>',
  imprimante: '<path d="M7 8V3.5h10V8"/><rect x="3.5" y="8" width="17" height="8" rx="2"/><path d="M7 13.5h10v7H7z"/>',
  videoproj: '<rect x="2.5" y="8" width="19" height="9" rx="2"/><circle cx="16" cy="12.5" r="2.5"/><path d="M6 12.5h4"/>',
  tbi: '<rect x="3" y="3.5" width="18" height="13" rx="1.5"/><path d="M8 20.5l4-4 4 4"/>',
  enceinte: '<rect x="6" y="2.5" width="12" height="19" rx="2"/><circle cx="12" cy="14" r="3"/><path d="M12 7h.01"/>',
  internet: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  power: '<path d="M12 3v8"/><path d="M6.6 6.6a8 8 0 1 0 10.8 0"/>',
  session: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
  lent: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9.5 2.5h5"/>',
  logiciel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 8.5h18M7 6.3h.01M9.5 6.3h.01"/>',
  son: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  cable: '<path d="M7 3v5M17 3v5M5 8h14v3a7 7 0 0 1-14 0zM12 18v3.5"/>',
  autre: '<circle cx="6" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18" cy="12" r="1.3"/>',
  salle: '<path d="M3.5 20.5V8l8.5-5 8.5 5v12.5"/><path d="M9.5 20.5v-6h5v6"/>',
  outil: '<path d="M14.5 6.5a4 4 0 0 0-5.3 5.3L3.5 17.5l3 3 5.7-5.7a4 4 0 0 0 5.3-5.3l-2.5 2.5-2.5-.5-.5-2.5z"/>',
  ok: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  materiel: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9h6v6H9z"/>',
};
export const ICONES = Object.keys(P);
export const icone = (k, cls = 'ico') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[k] || P.materiel}</svg>`;

/* ───────── Catalogue par défaut (le référent le modifie à volonté) ───────── */
export const CATALOGUE_DEFAUT = () => ({
  /* Équipements d'un poste : proposés à l'enseignant comme « manquant ou ne marche pas ». */
  eq: [
    { k: 'uc', lib: 'Unité centrale', ic: 'uc' }, { k: 'ecran', lib: 'Écran', ic: 'ecran' }, { k: 'clavier', lib: 'Clavier', ic: 'clavier' },
    { k: 'souris', lib: 'Souris', ic: 'souris' }, { k: 'casque', lib: 'Casque', ic: 'casque' },
    { k: 'webcam', lib: 'Webcam', ic: 'webcam' },
  ],
  /* Problèmes généraux d'un poste. */
  pannes: [
    { k: 'hs', lib: 'Ne s’allume pas', ic: 'power', on: true }, { k: 'internet', lib: 'Pas d’internet', ic: 'internet', on: true },
    { k: 'session', lib: 'Session / mot de passe', ic: 'session', on: true }, { k: 'lent', lib: 'Très lent, bloqué', ic: 'lent', on: true },
    { k: 'logiciel', lib: 'Logiciel manquant', ic: 'logiciel', on: false }, { k: 'son', lib: 'Pas de son', ic: 'son', on: false },
  ],
  /* Équipements de la salle (hors postes). */
  salle: [
    { k: 'videoproj', lib: 'Vidéoprojecteur', ic: 'videoproj' }, { k: 'imprimante', lib: 'Imprimante', ic: 'imprimante' },
    { k: 'tbi', lib: 'Tableau interactif', ic: 'tbi' }, { k: 'enceinte', lib: 'Enceintes', ic: 'enceinte' },
    { k: 'reseau', lib: 'Internet de toute la salle', ic: 'internet' },
  ],
  /* Étapes de suivi d'une panne, choisies par le référent (il en ajoute, en retire, les renomme). */
  statuts: [
    { k: 'vu', lib: 'Pris en compte', ic: 'ok' }, { k: 'encours', lib: 'Réparation en cours', ic: 'outil' },
    { k: 'piece', lib: 'En attente de pièce', ic: 'materiel' }, { k: 'envoye', lib: 'Envoyé en réparation', ic: 'cable' },
  ],
  /* Le référent décide si les collègues qui scannent voient l'état des ordinateurs. */
  voir: true,
});
export const TYPES_POSTE = [['fixe', 'Fixe'], ['portable', 'Portable'], ['aio', 'Tout-en-un'], ['leger', 'Client léger'], ['tablette', 'Tablette']];

/* Ce que l'enseignant voit dans la salle : copie du catalogue stockée dans la salle. */
export const catSalle = cat => ({
  voir: cat.voir !== false,
  statuts: (cat.statuts || CATALOGUE_DEFAUT().statuts).map(({ k, lib, ic }) => ({ k, lib, ic })),
  eq: (cat.eq || []).map(({ k, lib, ic }) => ({ k, lib, ic })),
  pannes: (cat.pannes || []).filter(x => x.on).map(({ k, lib, ic }) => ({ k, lib, ic })),
  salle: (cat.salle || []).map(({ k, lib, ic }) => ({ k, lib, ic })),
});

let FS = null, db = null, erreurFS = null;
export async function base(nomApp){
  if (db || erreurFS) return { FS, db, erreurFS };
  try {
    FS = window.__FIRESTORE_SHIM__ || await import('https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js');
    let app = null;
    if (!window.__FIRESTORE_SHIM__) { const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js'); app = initializeApp(firebaseConfig, nomApp); }
    db = FS.getFirestore(app);
  } catch (e) { erreurFS = e; }
  return { FS, db, erreurFS };
}

export const $ = s => document.querySelector(s);
export const $$ = s => [...document.querySelectorAll(s)];
export const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const nettoie = (v, max) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
export const maintenant = () => new Date().toISOString();
export const aleatoire = n => { const a = 'abcdefghijklmnopqrstuvwxyz0123456789', r = crypto.getRandomValues(new Uint8Array(n)); return [...r].map(x => a[x % 36]).join(''); };
export const avecDelai = (p, ms = 15000) => { let t; return Promise.race([p, new Promise((_, rej) => { t = setTimeout(() => rej(Object.assign(new Error('délai'), { code: 'delai' })), ms); })]).finally(() => clearTimeout(t)); };

const JOURS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
const heure = d => `${d.getHours()} h ${String(d.getMinutes()).padStart(2, '0')}`;
export const dateLongue = iso => { const d = new Date(iso); if (isNaN(d)) return ''; const t = `${d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} · ${heure(d)}`; return t.charAt(0).toUpperCase() + t.slice(1); };
export const dateCourte = iso => {
  const d = new Date(iso); if (isNaN(d)) return '';
  const auj = new Date(), hier = new Date(Date.now() - 864e5);
  if (d.toDateString() === auj.toDateString()) return `aujourd’hui ${heure(d)}`;
  if (d.toDateString() === hier.toDateString()) return `hier ${heure(d)}`;
  return `${JOURS[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${heure(d)}`;
};
export const duree = ms => { const h = ms / 36e5; if (h < 1) return `${Math.max(1, Math.round(ms / 6e4))} min`; if (h < 48) return `${Math.round(h)} h`; return `${Math.round(h / 24)} j`; };

/* ───────── Postes ───────── */
export const posteVierge = (n, modele = {}) => ({
  n, nom: '', type: modele.type || 'fixe', marque: modele.marque || '', modele: modele.modele || '', inv: '', os: modele.os || '', annee: modele.annee || '',
  eq: Array.isArray(modele.eq) ? [...modele.eq] : ['uc', 'ecran', 'clavier', 'souris'], refs: { ...(modele.refs || {}) }, hs: false, note: '',
});
export const nomPoste = p => p.n === 0 ? 'La salle' : `Poste ${p.n}${p.nom ? ' · ' + p.nom : ''}`;

/* Clé d'un signalement : panne générale « hs », équipement « eq:souris », salle « salle:videoproj », « autre ». */
export function libPanne(salle, t){
  const c = salle?.cat || {};
  if (t === 'autre') return { lib: 'Autre problème', ic: 'autre' };
  if (t.startsWith('eq:')) { const e = (c.eq || []).find(x => x.k === t.slice(3)); return { lib: (e?.lib || 'Équipement') + ' : manquant ou en panne', court: e?.lib || 'Équipement', ic: e?.ic || 'materiel' }; }
  if (t.startsWith('salle:')) { const e = (c.salle || []).find(x => x.k === t.slice(6)); return { lib: e?.lib || 'Équipement de la salle', ic: e?.ic || 'salle' }; }
  const p = (c.pannes || []).find(x => x.k === t) || CATALOGUE_DEFAUT().pannes.find(x => x.k === t);
  return { lib: p?.lib || 'Problème', ic: p?.ic || 'outil' };
}

export const ouverts = (salle, n) => (salle?.sig || []).filter(x => x.etat === 'ouvert' && (n == null || x.p === n));
/* ok · pb (panne partielle) · panne (ne s'allume pas) · hs (retiré par le référent) */
export function etatPoste(salle, poste){
  if (poste.hs) return 'hs';
  const o = ouverts(salle, poste.n);
  if (!o.length) return 'ok';
  return o.some(x => x.t === 'hs') ? 'panne' : 'pb';
}
/* Étape de suivi d'un signalement (« Pris en compte »…), ou null. */
export function libStatut(salle, k){
  if (!k) return null;
  const l = salle?.cat?.statuts || CATALOGUE_DEFAUT().statuts;
  return l.find(x => x.k === k) || null;
}
/* Étape la plus avancée parmi les pannes ouvertes d'un poste (ordre de la liste du référent). */
export function suiviPoste(salle, n){
  const l = salle?.cat?.statuts || CATALOGUE_DEFAUT().statuts;
  const ks = ouverts(salle, n).map(x => x.suivi).filter(Boolean);
  let best = null; l.forEach(x => { if (ks.includes(x.k)) best = x; });
  return best;
}
export const LIB_ETAT = { ok: 'Fonctionne', pb: 'Problème signalé', panne: 'En panne', hs: 'Hors service' };

/* Ajoute un signalement, ou une répétition si la même panne est déjà ouverte sur ce poste. */
export function ajouterSignalement(salle, n, t, txt){
  const s = salle; s.sig = Array.isArray(s.sig) ? s.sig : [];
  const quand = maintenant();
  const deja = s.sig.find(x => x.etat === 'ouvert' && x.p === n && x.t === t);
  if (deja) { deja.d = [...(deja.d || []), quand].slice(-MAX_DATES); if (txt) deja.txt = txt; }
  else s.sig.push({ id: aleatoire(8), p: n, t, lib: libPanne(s, t).lib, d: [quand], etat: 'ouvert', ...(txt ? { txt } : {}) });
  return elaguer(s);
}
export function elaguer(s){
  if (s.sig.length <= MAX_SIG) return s;
  const ouv = s.sig.filter(x => x.etat === 'ouvert');
  const rep = s.sig.filter(x => x.etat !== 'ouvert').sort((a, b) => String(b.rep).localeCompare(String(a.rep))).slice(0, Math.max(0, MAX_SIG - ouv.length));
  s.sig = [...ouv, ...rep];
  return s;
}

/* Écriture sûre : relit le document, applique `modif`, version + 1 (transaction). */
export async function modifierDoc(col, id, modif){
  const ref = FS.doc(db, col, id);
  return avecDelai(FS.runTransaction(db, async tr => {
    const snap = await tr.get(ref);
    if (!snap.exists()) throw Object.assign(new Error('absent'), { code: 'absent' });
    const avant = snap.data();
    const apres = modif(structuredClone(avant)) || avant;
    apres.majLe = maintenant();
    apres.version = (avant.version || 0) + 1;
    tr.set(ref, apres);
    return apres;
  }));
}
export const modifierSalle = (id, modif) => modifierDoc(COL_SALLE, id, modif);
