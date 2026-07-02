/* ============================================================
   PULSE — compteur de visites anonyme, ultra-léger (monde PSE)
   Pour : portail Coordination & pédagogie (site = 'coordination')
   - 1 écriture Firestore atomique par pageview (projet devoirs-pse)
   - Visiteur unique = 1 ID anonyme en localStorage, compté 1 fois par jour
   - Aucune donnée perso, aucun cookie, aucun pistage
   - Ne compte QUE la production (github.io), jamais localhost/aperçu
   ============================================================ */
import { initializeApp, getApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, doc, setDoc, increment, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const SITE = 'coordination';
const FIRE_CFG = {
  apiKey: "AIzaSyAWdCMvOiAJln3eT9LIAQD3RWJUD0lQcLI",
  authDomain: "devoirs-pse.firebaseapp.com",
  projectId: "devoirs-pse",
  storageBucket: "devoirs-pse.firebasestorage.app",
  messagingSenderId: "614730413904",
  appId: "1:614730413904:web:a5dd478af5de30f6bede55"
};

// App Firebase NOMMÉE ('pulse') pour ne jamais entrer en conflit avec
// l'app par défaut qu'initialisent les outils collaboratifs de la page.
let app; try { app = getApp('pulse'); } catch { app = initializeApp(FIRE_CFG, 'pulse'); }
const db = getFirestore(app);

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function monthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}

// Nom de la page = chemin, sans le préfixe du dépôt, sans .html, propre.
// Robuste : "/parcours-pfmp/", "/parcours-pfmp/index.html" -> même clé "parcours-pfmp".
function normalizePath(p) {
  let s = (p || '/').split('?')[0].split('#')[0];
  s = s.replace(/^\/+|\/+$/g, '');                 // retire / de début/fin
  s = s.replace(/^coordination-pedagogie\/?/, ''); // retire le préfixe du dépôt
  s = s.replace(/\.html?$/, '');                   // retire .html
  s = s.replace(/\/index$/, '').replace(/^index$/, ''); // .../index -> dossier
  s = s.replace(/\/+$/, '');
  if (!s) return 'home';
  return s.replace(/[\/\.]/g, '_').substring(0, 80) || 'home';
}

function visitMoment() {
  const hour = new Date().getHours();
  const period = hour >= 5 && hour < 12 ? 'matin'
    : hour >= 12 && hour < 18 ? 'apres_midi'
    : hour >= 18 && hour < 23 ? 'soir'
    : 'nuit';
  return { hour: String(hour).padStart(2, '0'), period };
}

function sourceKey() {
  try {
    if (!document.referrer) return 'direct';
    const from = new URL(document.referrer).hostname.replace(/^www\./, '');
    const here = location.hostname.replace(/^www\./, '');
    if (!from) return 'direct';
    if (from === here) return 'interne';
    if (/google\./i.test(from)) return 'google';
    if (/bing\.|duckduckgo\.|qwant\.|yahoo\./i.test(from)) return 'recherche';
    if (/facebook\.|instagram\.|threads\.|linkedin\.|x\.com$|twitter\.|t\.co$|youtube\./i.test(from)) return 'social';
    return 'autre';
  } catch { return 'direct'; }
}

async function pulse() {
  // On ne compte que le vrai site public — ni aperçu local, ni robots.
  const host = location.hostname || '';
  if (/localhost|127\.0\.0\.1|^$/.test(host)) return;
  if (/bot|spider|crawler|preview|headless/i.test(navigator.userAgent || '')) return;

  const date = todayKey();
  const month = monthKey();
  const pathKey = normalizePath(location.pathname);
  const moment = visitMoment();

  // ---- Doc du JOUR (vues + uniques + vues par page + heures + moments) ----
  const dayUpd = { pageviews: increment(1), lastSeen: serverTimestamp() };
  dayUpd[`pages.${pathKey}`] = increment(1);
  dayUpd[`hours.${moment.hour}`] = increment(1);
  dayUpd[`periods.${moment.period}`] = increment(1);
  try {
    if (localStorage.getItem('pulse_last_day') !== date) {
      dayUpd.uniques = increment(1);
      dayUpd[`sources.${sourceKey()}`] = increment(1);
      localStorage.setItem('pulse_last_day', date);
    }
  } catch {}
  try {
    let upDay = {};
    try { upDay = JSON.parse(localStorage.getItem('pulse_upd') || '{}'); } catch {}
    if (upDay.d !== date) upDay = { d: date, k: [] };
    if (!upDay.k.includes(pathKey)) {
      dayUpd[`upages.${pathKey}`] = increment(1);   // personnes distinctes sur cette page ce jour
      upDay.k.push(pathKey);
      localStorage.setItem('pulse_upd', JSON.stringify(upDay));
    }
  } catch {}

  // ---- Doc du MOIS (même collection 'jours', id spécial) ----
  const moUpd = { pageviews: increment(1) };
  moUpd[`pages.${pathKey}`] = increment(1);
  try {
    if (localStorage.getItem('pulse_last_month') !== month) {
      moUpd.uniques = increment(1);
      localStorage.setItem('pulse_last_month', month);
    }
    let up = {}; try { up = JSON.parse(localStorage.getItem('pulse_upm') || '{}'); } catch {}
    if (up.m !== month) up = { m: month, k: [] };
    if (!up.k.includes(pathKey)) {
      moUpd[`upages.${pathKey}`] = increment(1);
      up.k.push(pathKey);
      localStorage.setItem('pulse_upm', JSON.stringify(up));
    }
  } catch {}

  try { await setDoc(doc(db, 'analytics', SITE, 'jours', date), dayUpd, { merge: true }); } catch (e) { console.warn('pulse day', e); }
  try { await setDoc(doc(db, 'analytics', SITE, 'jours', '_mois_' + month), moUpd, { merge: true }); } catch (e) { console.warn('pulse month', e); }
}

pulse();
