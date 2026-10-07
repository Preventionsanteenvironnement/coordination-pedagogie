/* Faux Firestore en mémoire, pour les tests : il imite les deux SDK
   (modulaire et compat) et applique les mêmes contrôles que les règles
   publiées pour coordination_pfmp_* (champs autorisés, version +1,
   aucune suppression, aucune liste globale). */
const RE_SUIVI = /^20\d{2}-20\d{2}_[A-Z0-9]{4,6}_p[1-4]$/;
const RE_REF = /^20\d{2}-20\d{2}_\d{6}$/;
const CHAMPS_SUIVI = ['id', 'type', 'annee', 'code', 'classe', 'periode', 'libelle', 'debut', 'fin', 'dernierJour',
  'refSigle', 'etapes', 'pistes', 'trouve', 'visite', 'creeLe', 'majLe', 'majPar', 'version'];
const CHAMPS_REF = ['id', 'type', 'annee', 'code', 'sigle', 'suivis', 'majLe', 'version'];

export function regles(chemin, avant, apres) {
  const p = chemin.split('/');
  const refuse = m => { const e = new Error('permission-denied: ' + m); e.code = 'permission-denied'; throw e; };
  if (p[0] === 'coordination_pfmp_suivi' && p.length === 2) {
    const d = apres;
    if (!RE_SUIVI.test(p[1]) || d.id !== p[1]) refuse('id');
    Object.keys(d).forEach(k => { if (!CHAMPS_SUIVI.includes(k)) refuse('champ ' + k); });
    if (d.type !== 'suivi') refuse('type');
    if (!avant && d.version !== 1) refuse('version création');
    if (avant && d.version !== avant.version + 1) refuse('version');
    if (avant && (d.code !== avant.code || d.annee !== avant.annee || d.periode !== avant.periode)) refuse('identité');
    if (d.etapes && Object.keys(d.etapes).length > 60) refuse('etapes');
    if (d.pistes && d.pistes.length > 40) refuse('pistes');
    return;
  }
  if (p[0] === 'coordination_pfmp_suivi' && p.length === 4 && p[2] === 'messages') {
    if (avant) refuse('message modifié');
    const ok = Object.keys(apres).every(k => ['de', 'sigle', 'texte', 'le'].includes(k));
    if (!ok || !['eleve', 'referent', 'pp'].includes(apres.de) || !apres.texte || apres.texte.length > 1000) refuse('message');
    return;
  }
  if (p[0] === 'coordination_pfmp_suivi' && p.length === 4 && p[2] === 'eleve') {
    if (p[3] !== 'parcours') refuse('eleve');
    const ok = Object.keys(apres).every(k => ['avatar', 'declaration', 'prepa', 'fiche', 'depart', 'recherches', 'majLe'].includes(k));
    if (!ok || typeof apres.majLe !== 'string') refuse('parcours');
    return;
  }
  if (p[0] === 'coordination_pfmp_suivi' && p.length === 4 && p[2] === 'jeux') {
    if (avant) refuse('jeu modifié');
    return;
  }
  if (p[0] === 'coordination_pfmp_suivi' && p.length === 4 && p[2] === 'journal') {
    if (avant) refuse('journal modifié');
    return;
  }
  if (p[0] === 'coordination_pfmp_referents' && p.length === 2) {
    if (!RE_REF.test(p[1]) || apres.id !== p[1]) refuse('id référent');
    Object.keys(apres).forEach(k => { if (!CHAMPS_REF.includes(k)) refuse('champ ' + k); });
    if (apres.version !== ((avant && avant.version) || 0) + 1) refuse('version référent');
    return;
  }
  if (p[0] === 'coordination_rdv') return;
  refuse('collection inconnue ' + p[0]);
}

export function creerBase() {
  const store = new Map();
  const ecouteurs = new Set();
  let n = 0;
  const clone = x => x == null ? x : JSON.parse(JSON.stringify(x));
  function ecrire(chemin, data) {
    regles(chemin, clone(store.get(chemin)) || null, clone(data));
    store.set(chemin, clone(data));
    queueMicrotask(() => ecouteurs.forEach(f => f(chemin)));
  }
  const enfants = col => [...store.keys()].filter(k => k.startsWith(col + '/') && k.slice(col.length + 1).split('/').length === 1);
  const nouvelId = () => 'auto' + (++n).toString().padStart(5, '0');
  return { store, ecouteurs, ecrire, enfants, nouvelId, clone };
}

/* SDK modulaire : doc, collection, runTransaction, setDoc, onSnapshot */
export function fauxModulaire(base = creerBase()) {
  const { store, ecouteurs, ecrire, enfants, nouvelId, clone } = base;
  const db = { faux: true };
  const F = {
    collection: (_db, ...p) => ({ kind: 'col', path: p.join('/') }),
    doc: (a, ...p) => a && a.kind === 'col' ? { kind: 'doc', path: a.path + '/' + (p[0] || nouvelId()) } : { kind: 'doc', path: p.join('/') },
    setDoc: async (ref, data) => ecrire(ref.path, data),
    runTransaction: async (_db, fn) => {
      const ecritures = [];
      const t = { get: async ref => { const v = clone(store.get(ref.path)); return { exists: () => v != null, data: () => v }; }, set: (ref, d) => { ecritures.push([ref.path, d]); } };
      const r = await fn(t);
      ecritures.forEach(([p, d]) => ecrire(p, d));
      return r;
    },
    onSnapshot: (ref, cb) => {
      const envoyer = () => {
        if (ref.kind === 'doc') { const v = clone(store.get(ref.path)); cb({ exists: () => v != null, data: () => v }); }
        else cb({ docs: enfants(ref.path).map(k => ({ id: k.split('/').pop(), data: () => clone(store.get(k)) })) });
      };
      const f = chemin => { if (chemin === ref.path || chemin.startsWith(ref.path + '/')) envoyer(); };
      ecouteurs.add(f); queueMicrotask(envoyer);
      return () => ecouteurs.delete(f);
    }
  };
  return { F, db, base };
}

/* SDK compat (Firebase 8 / compat) : fs.doc(), fs.collection(), fs.runTransaction() */
export function fauxCompat(base = creerBase()) {
  const { store, ecouteurs, ecrire, enfants, nouvelId, clone } = base;
  function docRef(path) {
    return {
      path,
      set: async d => ecrire(path, d),
      onSnapshot(cb) {
        const envoyer = () => { const v = clone(store.get(path)); cb({ exists: v != null, data: () => v }); };
        const f = c => { if (c === path) envoyer(); }; ecouteurs.add(f); queueMicrotask(envoyer); return () => ecouteurs.delete(f);
      }
    };
  }
  const fs = {
    doc: p => docRef(p),
    collection: p => ({
      doc: id => docRef(p + '/' + (id || nouvelId())),
      onSnapshot(cb) {
        const envoyer = () => cb({ docs: enfants(p).map(k => ({ id: k.split('/').pop(), data: () => clone(store.get(k)) })) });
        const f = c => { if (c.startsWith(p + '/')) envoyer(); }; ecouteurs.add(f); queueMicrotask(envoyer); return () => ecouteurs.delete(f);
      }
    }),
    runTransaction: async fn => {
      const ecritures = [];
      const t = { get: async ref => { const v = clone(store.get(ref.path)); return { exists: v != null, data: () => v }; }, set: (ref, d) => ecritures.push([ref.path, d]) };
      const r = await fn(t);
      ecritures.forEach(([p, d]) => ecrire(p, d));
      return r;
    }
  };
  return { fs, base };
}
