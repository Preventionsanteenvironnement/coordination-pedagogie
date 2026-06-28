// Couche Firebase (messagerie AESH ↔ coordinateur).
// Utilise le SDK "compat" chargé en <script> classique dans index.html (global `firebase`).
// Projet : devoirs-pse · collection dédiée coordination_* (jamais les données élèves).
//
// ⚠️ À REMPLIR avant déploiement (les « codes » : apiKey, appId, messagingSenderId).
// Tant que la config n'est pas remplie, la messagerie s'affiche en mode « à configurer ».

export const FIREBASE_CONFIG = {
  apiKey: 'A_REMPLIR',
  authDomain: 'devoirs-pse.firebaseapp.com',
  projectId: 'devoirs-pse',
  storageBucket: 'devoirs-pse.appspot.com',
  messagingSenderId: 'A_REMPLIR',
  appId: 'A_REMPLIR',
};

const COLLECTION = 'coordination_planning_messages';

export function fbConfigured() {
  return FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.apiKey !== 'A_REMPLIR';
}
export function fbAvailable() {
  return typeof firebase !== 'undefined' && fbConfigured();
}

let _db = null;
function db() {
  if (_db) return _db;
  if (!fbAvailable()) return null;
  try {
    if (!firebase.apps || !firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    _db = firebase.firestore();
    return _db;
  } catch (e) { console.warn('Firebase init impossible', e); return null; }
}

export function sendMessage({ from, classe, text }) {
  const d = db();
  if (!d) return Promise.reject(new Error('Messagerie non configurée'));
  return d.collection(COLLECTION).add({
    from: (from || '?').slice(0, 12), classe: classe || '', text: String(text).slice(0, 1000),
    ts: Date.now(), lu: false,
  });
}

export function subscribeMessages(cb) {
  const d = db();
  if (!d) { cb(null); return () => {}; } // null = non disponible
  try {
    return d.collection(COLLECTION).orderBy('ts', 'desc').limit(200)
      .onSnapshot((snap) => cb(snap.docs.map((x) => ({ id: x.id, ...x.data() }))));
  } catch (e) { console.warn(e); cb(null); return () => {}; }
}

export function markRead(id) {
  const d = db();
  if (d) d.collection(COLLECTION).doc(id).update({ lu: true }).catch(() => {});
}

export function deleteMessage(id) {
  const d = db();
  if (d) d.collection(COLLECTION).doc(id).delete().catch(() => {});
}
