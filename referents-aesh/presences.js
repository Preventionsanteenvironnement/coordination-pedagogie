/* Repères partagés par la grille et les exports, sans données nominatives. */
const couleurs = ['#2563eb','#c45c08','#64748b','#927000','#a32965','#087966','#814c2d','#6945bd','#047c9d','#a62d39','#344b80','#726f28','#8b4471','#316e31','#7c3b20','#445d68','#674575','#956106','#006774','#4d6440','#733b46','#3c5693','#654d30','#675f88'];
/* 26/09/2026 — Les couleurs des tableaux d'Antoine, à l'identique. Elles priment sur la
   couleur calculée : celle-ci dépend du rang de création de la fiche, donc elle changerait
   si quelqu'un était retiré puis recréé. Ici, la personne garde la sienne, quoi qu'il arrive. */
export const COULEURS_FIXES = {
  aesh_d01: '#a3c1e3',  /* Antoine  */
  aesh_d02: '#ebb38b',  /* Timothée */
  aesh_d03: '#c9c9c9',  /* Fiona    */
  aesh_d04: '#f8da78',  /* Stella   */
};
/* Un sigle blanc sur un fond clair ne se lit pas, et disparaît à l'impression en noir et
   blanc. L'encre suit la clarté du fond, calculée, jamais devinée. */
export function encreSur(couleur) {
  const c = String(couleur || '').replace('#', '');
  if (c.length !== 6) return '#ffffff';
  const [r, v, b] = [0, 2, 4].map(i => parseInt(c.slice(i, i + 2), 16) / 255)
    .map(x => x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4));
  return 0.2126 * r + 0.7152 * v + 0.0722 * b > 0.42 ? '#12202a' : '#ffffff';
}
export const encreAesh = id => encreSur(couleurAesh(id));
export function couleurAesh(id) {
  if (COULEURS_FIXES[id]) return COULEURS_FIXES[id];
  const initial = /^aesh_d(\d+)$/.exec(id || '');
  let h = 0;
  for (const c of String(id || '')) h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0;
  return couleurs[(initial ? +initial[1] - 1 : h) % couleurs.length];
}
export function plagesDe(valeur, cours) {
  return valeur ? (Array.isArray(valeur) ? valeur : [valeur]) : [{debut:cours.d, fin:cours.f}];
}
export function libelleService(nom) {
  return ['Cantine','DP','Demi-pension'].includes(nom) ? 'DP — Demi-pension' : nom;
}
/* 26/09/2026 — Dans la grille, deux lettres suffisent : le sens est rappelé en légende, sous
   la grille. « DP — Demi-pension » écrit en entier mangeait deux lignes d'un bloc de 30 min. */
/* La table des dispositifs (DISPOSITIFS, SERVICES_TYPES, SIGLES_SERVICE, sigleService,
   horsClasse, avecEleves) vit dans calculs.js : elle sert d'abord à compter des heures.
   presences.js ne garde que ce qui se dessine — et n'importe rien, pour rester chargeable
   seul par les tests. */
/* 26/09/2026 — Un dessin au trait devant les deux services qu'on cherche le plus vite du
   regard. Au trait, pas en émoji : il prend la couleur du texte, s'imprime en noir et blanc,
   et ne crie pas sur un bloc de trente minutes. Les lettres restent : un remplaçant lit
   « DP » plus vite qu'il ne décode un pictogramme. */
const LOGOS = {
  DP: '<svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true"><path d="M4 1v5a1.5 1.5 0 0 0 1 1.4V15h1.4V7.4A1.5 1.5 0 0 0 7.4 6V1H6.4v4H5.7V1H4.7v4H4V1Zm7.2 0c-1 0-1.8 1.6-1.8 3.6 0 1.5.5 2.7 1.2 3.1V15h1.4V1Z" fill="currentColor"/></svg>',
  IN: '<svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true"><rect x="1" y="3.5" width="2" height="9" rx=".8" fill="currentColor"/><rect x="1" y="8" width="14" height="2.8" rx="1.1" fill="currentColor"/><rect x="13" y="10.2" width="2" height="2.3" rx=".8" fill="currentColor"/><rect x="3.8" y="5.6" width="4" height="2.2" rx="1" fill="currentColor"/></svg>'
};
export const logoService = sigle => LOGOS[sigle] || '';

