// Point d'entrée — monte l'application, gère la coquille (sidebar + topbar),
// le routage et les toasts. Re-rendu sur chaque changement d'état ou de route.
import { html, render, useState, useEffect } from '@ui';
import { getState, subscribe, undo, canUndo } from './store.js';
import { resolve, onRouteChange, navigate, currentRoute } from './router.js';
import { Icon } from './components/icons.js';
import { registerToast, toast } from './components/shared.js';
import { alertsSummary } from './lib/alerts.js';
import { exportJSON } from './lib/io.js';

import { Dashboard } from './pages/Dashboard.js';
import { ClasseView } from './pages/ClasseView.js';
import { IntervenantView } from './pages/IntervenantView.js';
import { AffectationView } from './pages/AffectationView.js';
import { ParametresView } from './pages/ParametresView.js';
import { ConsultationView } from './pages/ConsultationView.js';
import { EvenementsView } from './pages/EvenementsView.js';
import { MessagesView } from './pages/MessagesView.js';
import { ContactView } from './pages/ContactView.js';

// ── Accès coordination (clé admin) ──
// Le module démarre en espace INTERVENANT (public, lecture seule) pour tout le monde.
// Le coordinateur déverrouille l'éditeur avec une clé, mémorisée sur SON appareil.
// Garde-fou d'interface (à la manière du portail) — la vraie sécurité viendra des
// règles Firestore. ⚠️ Personnalise ADMIN_KEY avant de publier.
const ADMIN_KEY = 'pse';
const ADMIN_FLAG = 'psr-admin:v1';
const normKey = (k) => String(k == null ? '' : k).trim().toLowerCase();

function isUnlocked() {
  try { return localStorage.getItem(ADMIN_FLAG) === '1'; } catch (e) { return false; }
}
function setUnlocked(v) {
  try { v ? localStorage.setItem(ADMIN_FLAG, '1') : localStorage.removeItem(ADMIN_FLAG); } catch (e) {}
}
// Déverrouillage possible aussi par URL : index.html?admin=LACLE
function unlockFromUrl() {
  const m = location.search.match(/[?&]admin=([^&]+)/);
  if (m && normKey(decodeURIComponent(m[1])) === ADMIN_KEY) {
    setUnlocked(true);
    window.history.replaceState(null, '', location.pathname + location.hash);
    return true;
  }
  return isUnlocked();
}

// Espace COORDINATION (coulisses — toi) : tout l'édition.
const NAV_COORD = [
  { name: 'dashboard', to: '/dashboard', label: 'Tableau de bord', icon: Icon.dashboard },
  { name: 'affectation', to: '/affectation', label: 'Affectation', icon: Icon.puzzle },
  { name: 'classe', to: '/classe', label: 'Emplois du temps', icon: Icon.calendar },
  { name: 'evenements', to: '/evenements', label: 'Périodes & événements', icon: Icon.layers },
  { name: 'messages', to: '/messages', label: 'Messages', icon: Icon.mail },
  { name: 'aesh', to: '/aesh', label: 'Intervenants', icon: Icon.users },
  { name: 'parametres', to: '/parametres', label: 'Paramètres', icon: Icon.settings },
];

// Espace INTERVENANT (public — AESH) : lecture seule.
const NAV_INTERV = [
  { name: 'consultation', to: '/consultation', label: 'Mon emploi du temps', icon: Icon.calendarCheck },
  { name: 'classe', to: '/classe', label: 'Emploi du temps de ma classe', icon: Icon.calendar },
  { name: 'contact', to: '/contact', label: 'Message au coordinateur', icon: Icon.mail },
];

// Routes autorisées dans l'espace intervenant.
const INTERV_ROUTES = new Set(['consultation', 'classe', 'contact']);

const TITLES = {
  dashboard: 'Tableau de bord', classe: 'Emplois du temps', aesh: 'Intervenants',
  affectation: 'Affectation', consultation: 'Mon emploi du temps',
  evenements: 'Périodes & événements', parametres: 'Paramètres',
  messages: 'Messages', contact: 'Contact',
};

function Sidebar({ route, state, mode, isAdmin, onToggleMode, onUnlock, onLock }) {
  const alerts = alertsSummary(state);
  const interv = mode === 'intervenant';
  const nav = interv ? NAV_INTERV : NAV_COORD;
  return html`
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-logo">PSR</div>
        <div>
          <div class="brand-name">${interv ? 'Espace intervenant' : 'Coordination PSR'}</div>
          <div class="brand-sub">${interv ? 'lecture seule' : 'PSR · MELEC'} · ${state.annee}</div>
        </div>
      </div>
      <div class="nav-group-label">${interv ? 'Mon espace' : 'Pilotage'}</div>
      ${nav.map((n) => html`
        <a class=${'nav-item ' + (route.name === n.name ? 'active' : '')} href=${'#' + n.to}>
          <span class="nav-ico">${n.icon({ size: 18 })}</span>
          <span>${n.label}</span>
          ${!interv && n.name === 'dashboard' && alerts.total
            ? html`<span class=${'nav-badge ' + (alerts.danger ? '' : 'warn')}>${alerts.total}</span>` : null}
        </a>`)}
      <div class="sidebar-footer col gap-2">
        ${isAdmin ? html`
          <button class="nav-item" style="width:100%;text-align:left;background:none;border:1px solid var(--border)" onClick=${onToggleMode}>
            <span class="nav-ico">${(interv ? Icon.settings : Icon.calendarCheck)({ size: 16 })}</span>
            <span>${interv ? 'Revenir à la coordination' : 'Aperçu intervenant'}</span>
          </button>
          <button class="nav-item" style="width:100%;text-align:left;background:none;border:none;font-size:12px;opacity:.7" onClick=${onLock}>
            <span class="nav-ico">${Icon.x({ size: 15 })}</span><span>Verrouiller l'éditeur</span>
          </button>`
        : html`
          <button class="nav-item" style="width:100%;text-align:left;background:none;border:1px solid var(--border)" onClick=${onUnlock}>
            <span class="nav-ico">${Icon.settings({ size: 16 })}</span>
            <span>Accès coordination</span>
          </button>`}
      </div>
    </aside>`;
}

function Toasts() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    registerToast((msg, kind, action) => {
      const id = Math.round(performance.now()) + Math.random();
      setItems((cur) => [...cur, { id, msg, kind, action }]);
      setTimeout(() => setItems((cur) => cur.filter((t) => t.id !== id)), action ? 6000 : 2600);
    });
  }, []);
  const dismiss = (id) => setItems((cur) => cur.filter((t) => t.id !== id));
  return html`<div class="toast-wrap">
    ${items.map((t) => html`<div class=${'toast ' + t.kind}>
      ${t.kind === 'ok' ? Icon.check({ size: 15 }) : Icon.alert({ size: 15 })} <span>${t.msg}</span>
      ${t.action ? html`<button class="toast-action" onClick=${() => { t.action.fn(); dismiss(t.id); }}>${Icon.undo({ size: 13 })} ${t.action.label}</button>` : null}
    </div>`)}
  </div>`;
}

function Page({ route, state, mode }) {
  const interv = mode === 'intervenant';
  switch (route.name) {
    case 'dashboard': return html`<${Dashboard} state=${state} />`;
    case 'classe': return html`<${ClasseView} state=${state} params=${route.params} readOnly=${interv} />`;
    case 'aesh': return html`<${IntervenantView} state=${state} params=${route.params} />`;
    case 'affectation': return html`<${AffectationView} state=${state} />`;
    case 'consultation': return html`<${ConsultationView} state=${state} params=${route.params} />`;
    case 'evenements': return html`<${EvenementsView} state=${state} />`;
    case 'messages': return html`<${MessagesView} />`;
    case 'contact': return html`<${ContactView} state=${state} />`;
    case 'parametres': return html`<${ParametresView} state=${state} />`;
    default: return html`<${Dashboard} state=${state} />`;
  }
}

function App() {
  const [, force] = useState(0);
  const [route, setRoute] = useState(resolve());
  const [isAdmin, setIsAdmin] = useState(() => unlockFromUrl());
  const [mode, setMode] = useState(() => (isUnlocked() ? 'coordination' : 'intervenant'));

  useEffect(() => {
    const u1 = subscribe(() => force((n) => n + 1));
    const u2 = onRouteChange(() => setRoute(resolve()));
    return () => { u1(); u2(); };
  }, []);

  const state = getState();
  // Sans clé admin, on est toujours en espace intervenant (lecture seule).
  const effMode = isAdmin ? mode : 'intervenant';
  const interv = effMode === 'intervenant';

  // Garde : dans l'espace intervenant, seules certaines routes sont permises.
  const effRoute = (interv && !INTERV_ROUTES.has(route.name)) ? { name: 'consultation', params: {} } : route;

  const toggleMode = () => {
    const next = interv ? 'coordination' : 'intervenant';
    setMode(next);
    navigate(next === 'intervenant' ? '/consultation' : '/dashboard');
  };
  const unlock = () => {
    const k = window.prompt('Clé d\'accès coordination :');
    if (k == null) return;
    if (normKey(k) === ADMIN_KEY) { setUnlocked(true); setIsAdmin(true); setMode('coordination'); navigate('/dashboard'); toast('Éditeur déverrouillé'); }
    else toast('Clé incorrecte', 'warn');
  };
  const lock = () => { setUnlocked(false); setIsAdmin(false); setMode('intervenant'); navigate('/consultation'); toast('Éditeur verrouillé'); };

  return html`
    <div class="shell">
      <${Sidebar} route=${effRoute} state=${state} mode=${effMode} isAdmin=${isAdmin}
        onToggleMode=${toggleMode} onUnlock=${unlock} onLock=${lock} />
      <div class="main">
        <header class="topbar">
          <div>
            <h1>${TITLES[effRoute.name] || 'Coordination PSR'}</h1>
            <div class="topbar-sub">Coordination des sections PSR & MELEC</div>
          </div>
          <div class="topbar-actions">
            ${interv ? html`
              <span class="badge info">${Icon.calendarCheck({ size: 14 })} Vue intervenant · lecture seule</span>
              ${isAdmin ? html`<button class="btn" onClick=${toggleMode}>${Icon.settings({ size: 15 })} Coordination</button>` : null}
            ` : html`
              <button class="btn ghost" title="Annuler la dernière action" disabled=${!canUndo()} onClick=${() => undo()}>
                ${Icon.undo({ size: 16 })} Annuler</button>
              <button class="btn" onClick=${() => exportJSON()}>${Icon.download({ size: 16 })} Exporter</button>
            `}
          </div>
        </header>
        <div class="content">
          <div class="content-narrow">
            <${Page} route=${effRoute} state=${state} mode=${effMode} />
          </div>
        </div>
      </div>
    </div>
    <${Toasts} />`;
}

// Démarrage : route par défaut selon le statut (admin → coordination, sinon AESH).
if (!location.hash) navigate(isUnlocked() ? '/dashboard' : '/consultation');
const root = document.getElementById('app');
root.className = '';
root.innerHTML = '';
render(html`<${App} />`, root);
