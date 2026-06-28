// Routeur minimal basé sur le hash (#/...) — pas de serveur requis.
const subs = new Set();

export function currentRoute() {
  const hash = location.hash.replace(/^#/, '') || '/';
  const parts = hash.split('/').filter(Boolean);
  return { path: '/' + parts.join('/'), parts };
}

export function navigate(to) {
  if (location.hash.replace(/^#/, '') === to) return;
  location.hash = to;
}

export function onRouteChange(fn) {
  subs.add(fn);
  return () => subs.delete(fn);
}

window.addEventListener('hashchange', () => subs.forEach((fn) => fn(currentRoute())));

// Résout la route en { name, params }.
export function resolve() {
  const { parts } = currentRoute();
  const [seg, id] = parts;
  switch (seg) {
    case undefined:
    case 'dashboard': return { name: 'dashboard', params: {} };
    case 'classe': return { name: 'classe', params: { id } };
    case 'aesh': return { name: 'aesh', params: { id } };
    case 'consultation': return { name: 'consultation', params: { id } };
    case 'evenements': return { name: 'evenements', params: {} };
    case 'messages': return { name: 'messages', params: {} };
    case 'contact': return { name: 'contact', params: {} };
    case 'affectation': return { name: 'affectation', params: {} };
    case 'parametres': return { name: 'parametres', params: {} };
    default: return { name: 'dashboard', params: {} };
  }
}
