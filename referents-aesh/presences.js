/* Repères partagés par la grille et les exports, sans données nominatives. */
const couleurs = ['#2563eb','#c45c08','#64748b','#927000','#a32965','#087966','#814c2d','#6945bd','#047c9d','#a62d39','#344b80','#726f28','#8b4471','#316e31','#7c3b20','#445d68','#674575','#956106','#006774','#4d6440','#733b46','#3c5693','#654d30','#675f88'];
export function couleurAesh(id) {
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
export const SIGLES_SERVICE = [['DP', 'Demi-pension'], ['RE', 'Réunion d’équipe'],
  ['RI', 'Réunion institutionnelle'], ['IN', 'Internat'], ['PI', 'PIAL'], ['ES', 'ESAT'], ['PE', 'Périscolaire']];
export function sigleService(nom) {
  const t = String(nom || '').toLowerCase();
  if (['cantine', 'dp', 'demi-pension'].includes(t)) return 'DP';
  if (t.startsWith('réunion d') || t.startsWith('reunion d')) return 'RE';
  if (t.startsWith('réunion') || t.startsWith('reunion')) return 'RI';
  if (t.startsWith('internat')) return 'IN';
  if (t.startsWith('pial')) return 'PI';
  if (t.startsWith('esat')) return 'ES';
  if (t.startsWith('péri') || t.startsWith('peri')) return 'PE';
  return String(nom || '').slice(0, 2).toUpperCase();
}
