// Jeu d'icônes SVG inline (trait, héritage de la couleur courante).
import { html } from '@ui';

const ico = (path, vb = '0 0 24 24') => (props = {}) => html`
  <svg class=${'ico ' + (props.class || '')} width=${props.size || 18} height=${props.size || 18}
       viewBox=${vb} fill="none" stroke="currentColor" stroke-width=${props.w || 1.8}
       stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;

export const Icon = {
  dashboard: ico(html`<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>`),
  calendar: ico(html`<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>`),
  users: ico(html`<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>`),
  puzzle: ico(html`<path d="M14 4a2 2 0 1 1 4 0v2h2a1 1 0 0 1 1 1v3h-1.5a1.8 1.8 0 1 0 0 3.6H21v3a1 1 0 0 1-1 1h-3v-1.5a1.8 1.8 0 1 0-3.6 0V21H10a1 1 0 0 1-1-1v-3H7.5a1.8 1.8 0 1 1 0-3.6H9V10a1 1 0 0 1 1-1h3V7.5"/>`),
  settings: ico(html`<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.2.61.76 1.05 1.42 1.09H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>`),
  alert: ico(html`<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>`),
  check: ico(html`<path d="M20 6 9 17l-5-5"/>`),
  download: ico(html`<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/>`),
  upload: ico(html`<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v12"/>`),
  undo: ico(html`<path d="M3 7v6h6"/><path d="M3 13a9 9 0 1 0 3-7.7L3 7"/>`),
  plus: ico(html`<path d="M12 5v14M5 12h14"/>`),
  x: ico(html`<path d="M18 6 6 18M6 6l12 12"/>`),
  trash: ico(html`<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>`),
  clock: ico(html`<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`),
  pin: ico(html`<path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>`),
  grid: ico(html`<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>`),
  layers: ico(html`<path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>`),
  sparkle: ico(html`<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>`),
  edit: ico(html`<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>`),
  chevron: ico(html`<path d="M9 18l6-6-6-6"/>`),
  columns: ico(html`<rect x="3" y="4" width="7" height="16" rx="1"/><rect x="14" y="4" width="7" height="16" rx="1"/>`),
  swap: ico(html`<path d="M7 4 3 8l4 4"/><path d="M3 8h13a4 4 0 0 1 4 4M17 20l4-4-4-4"/><path d="M21 16H8a4 4 0 0 1-4-4"/>`),
  stack: ico(html`<path d="M4 7h16M4 12h16M4 17h16"/>`),
  calendarCheck: ico(html`<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4M9 15l2 2 4-4"/>`),
  mail: ico(html`<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>`),
  send: ico(html`<path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/>`),
  inbox: ico(html`<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/>`),
};
