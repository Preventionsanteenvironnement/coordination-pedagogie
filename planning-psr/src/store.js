// ============================================================
// STORE — état global, persistance navigateur, abonnement réactif.
// Pattern simple : un état immuable + un bus d'événements.
// ============================================================
import { seedState, defaultConfig } from './data/seed.js';

const STORAGE_KEY = 'coordination-psr:v2';

// ============================================================
// ADAPTATEUR DE PERSISTANCE — point d'extension unique.
// Aujourd'hui : navigateur (localStorage).
// POUR FIRESTORE : remplacer ces trois méthodes par :
//   read()        → getDoc(...) / récupération initiale
//   write(state)  → setDoc(docRef, state, { merge: true })
//   subscribe(cb) → onSnapshot(docRef, snap => cb(snap.data()))  (temps réel)
// Aucun composant de l'app n'a besoin de changer : tout passe par ce store.
// ============================================================
const storage = {
  read() {
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; }
    catch (e) { console.warn('Lecture stockage impossible', e); return null; }
  },
  write(s) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }
    catch (e) { console.warn('Écriture stockage impossible', e); }
  },
  subscribe() { return () => {}; }, // temps réel : no-op en local, branché par Firestore
};

const listeners = new Set();
let state = load();
let history = [];   // pile d'annulation (undo)

// Complète les états anciens (sauvegardes sans `config`) avec les valeurs par défaut.
function migrate(s) {
  const d = defaultConfig();
  s.config = s.config || {};
  s.config.semaine = { ...d.semaine, ...(s.config.semaine || {}) };
  s.config.calendrier = { ...d.calendrier, ...(s.config.calendrier || {}) };
  s.config.ui = { ...d.ui, ...(s.config.ui || {}) };
  if (!Array.isArray(s.evenements)) s.evenements = [];
  return s;
}

function load() {
  const raw = storage.read();
  return raw ? migrate(raw) : seedState();
}

function persist() {
  // Horodatage pour la synchro (utile à Firestore : détection des changements).
  state.meta = { ...(state.meta || {}), updatedAt: Date.now(), schema: 2 };
  storage.write(state);
}

export function getState() { return state; }

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() { listeners.forEach((fn) => fn(state)); }

// Applique une mutation immuable. `recordUndo` empile l'état précédent.
export function update(mutator, { recordUndo = true } = {}) {
  if (recordUndo) {
    history.push(JSON.stringify(state));
    if (history.length > 50) history.shift();
  }
  const draft = structuredClone(state);
  const next = mutator(draft);
  state = next || draft;
  persist();
  emit();
}

export function canUndo() { return history.length > 0; }

export function undo() {
  if (!history.length) return;
  state = JSON.parse(history.pop());
  persist();
  emit();
}

export function resetToSeed() {
  history.push(JSON.stringify(state));
  state = seedState();
  persist();
  emit();
}

export function replaceState(next) {
  history.push(JSON.stringify(state));
  state = next;
  persist();
  emit();
}

// ─── Mutations métier ───

export function setWeekView({ mode, priority }) {
  update((d) => {
    if (mode !== undefined) d.config.ui.weekMode = mode;
    if (priority !== undefined) d.config.ui.weekPriority = priority;
  }, { recordUndo: false });
}

export function updateSemaine(patch) {
  update((d) => { d.config.semaine = { ...d.config.semaine, ...patch }; });
}

export function addAffectation(aeshId, seanceId, type = 'mutualise') {
  update((d) => {
    const exists = d.affectations.some((a) => a.aesh === aeshId && a.seance === seanceId);
    if (!exists) d.affectations.push({ id: `af-${aeshId}-${seanceId}-${d.affectations.length}`, aesh: aeshId, seance: seanceId, type });
  });
}

// Change le type d'accompagnement d'un AESH sur un créneau (mutualisé, individuel…).
export function setAffectationType(aeshId, seanceId, type) {
  update((d) => {
    const a = d.affectations.find((x) => x.aesh === aeshId && x.seance === seanceId);
    if (a) a.type = type;
  });
}

// Enregistre une remarque courte sur un créneau (couche vivante, non nominative).
export function setSeanceRemarque(seanceId, remarque) {
  update((d) => {
    const s = d.seances.find((x) => x.id === seanceId);
    if (s) s.remarque = remarque;
  });
}

// Change le besoin d'AESH attendu sur un créneau (0 à 4).
export function setBesoinAesh(seanceId, n) {
  update((d) => {
    const s = d.seances.find((x) => x.id === seanceId);
    if (s) s.besoinAesh = Math.max(0, Math.min(4, n));
  });
}

export function removeAffectation(aeshId, seanceId) {
  update((d) => {
    d.affectations = d.affectations.filter((a) => !(a.aesh === aeshId && a.seance === seanceId));
  });
}

export function moveAffectation(aeshId, fromSeanceId, toSeanceId) {
  update((d) => {
    d.affectations = d.affectations.filter((a) => !(a.aesh === aeshId && a.seance === fromSeanceId));
    if (!d.affectations.some((a) => a.aesh === aeshId && a.seance === toSeanceId))
      d.affectations.push({ id: `af-${aeshId}-${toSeanceId}-${d.affectations.length}`, aesh: aeshId, seance: toSeanceId });
  });
}

export function upsertAesh(aesh) {
  update((d) => {
    const i = d.aesh.findIndex((x) => x.id === aesh.id);
    if (i >= 0) d.aesh[i] = aesh; else d.aesh.push(aesh);
  });
}

export function upsertClasse(classe) {
  update((d) => {
    const i = d.classes.findIndex((x) => x.id === classe.id);
    if (i >= 0) d.classes[i] = classe; else d.classes.push(classe);
  });
}

export function upsertSeance(seance) {
  update((d) => {
    const i = d.seances.findIndex((x) => x.id === seance.id);
    if (i >= 0) d.seances[i] = seance; else d.seances.push(seance);
  });
}

export function removeSeance(seanceId) {
  update((d) => {
    d.seances = d.seances.filter((x) => x.id !== seanceId);
    d.affectations = d.affectations.filter((a) => a.seance !== seanceId);
  });
}

export function moveSeance(seanceId, jour, creneau) {
  update((d) => {
    const s = d.seances.find((x) => x.id === seanceId);
    if (s) { s.jour = jour; s.creneau = creneau; }
  });
}

export function upsertEvenement(e) {
  update((d) => {
    if (!Array.isArray(d.evenements)) d.evenements = [];
    const i = d.evenements.findIndex((x) => x.id === e.id);
    if (i >= 0) d.evenements[i] = e; else d.evenements.push(e);
  });
}

export function removeEvenement(id) {
  update((d) => { d.evenements = (d.evenements || []).filter((x) => x.id !== id); });
}

// Ajout en masse (import .ics) avec dédoublonnage par type+classe+date.
export function addEvenementsBulk(list) {
  let added = 0;
  update((d) => {
    if (!Array.isArray(d.evenements)) d.evenements = [];
    const seen = new Set(d.evenements.map((e) => `${e.type}|${e.classe}|${e.debut}`));
    let n = d.evenements.length;
    for (const e of list) {
      const key = `${e.type}|${e.classe}|${e.debut}`;
      if (seen.has(key)) continue;
      seen.add(key);
      d.evenements.push({ id: `ev-imp-${Date.now().toString(36)}-${n++}`, previsionnel: false, titre: '', ...e });
      added++;
    }
  });
  return added;
}
