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
/* 26/09/2026 — Une seule table des dispositifs. Chacun porte son sigle, son nom en clair et
   la seule chose que la grille a besoin de savoir : est-ce du temps AUPRÈS D'ÉLÈVES ?
   Le repas et l'internat en sont ; le PIAL, le DAFI et l'ESAT n'ont rien à faire dans la
   grille d'une classe — ils appartiennent à la semaine de la personne, pas à celle du groupe.
   Un nom inventé par un référent est montré par défaut : rien ne disparaît en silence.
   Le formulaire permet de le ranger lui-même en « hors classe ». */
export const DISPOSITIFS = [
  { nom: 'Cantine',      sigle: 'DP', lib: 'Demi-pension',            avecEleves: true  },
  { nom: 'Internat',     sigle: 'IN', lib: 'Internat',                avecEleves: true  },
  { nom: 'Périscolaire', sigle: 'PE', lib: 'Périscolaire',            avecEleves: true  },
  { nom: 'Étude',        sigle: 'ÉT', lib: 'Étude',                   avecEleves: true  },
  { nom: 'Vie scolaire', sigle: 'VS', lib: 'Vie scolaire',            avecEleves: true  },
  { nom: 'PIAL',         sigle: 'PI', lib: 'PIAL',                    avecEleves: false },
  { nom: 'DAFI',         sigle: 'DA', lib: 'DAFI',                    avecEleves: false },
  { nom: 'ESAT',         sigle: 'ES', lib: 'ESAT',                    avecEleves: false },
];
export const SERVICES_TYPES = [...DISPOSITIFS.map(d => d.nom), 'Autre'];
const REUNIONS = [['RE', 'Réunion d’équipe'], ['RI', 'Réunion institutionnelle']];
export const SIGLES_SERVICE = [...DISPOSITIFS.map(d => [d.sigle, d.lib]), ...REUNIONS];
const cle = n => String(n || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const trouve = n => DISPOSITIFS.find(d => cle(d.nom) === cle(n));
/* Un service est hors classe s'il le dit lui-même (choix du référent, qui prime), sinon
   d'après la table. Un nom inconnu reste dans la grille. */
export function horsClasse(service) {
  if (service && typeof service.horsClasse === 'boolean') return service.horsClasse;
  const d = trouve(service && service.nom !== undefined ? service.nom : service);
  return d ? !d.avecEleves : false;
}
/* 26/09/2026 — Un dessin au trait devant les deux services qu'on cherche le plus vite du
   regard. Au trait, pas en émoji : il prend la couleur du texte, s'imprime en noir et blanc,
   et ne crie pas sur un bloc de trente minutes. Les lettres restent : un remplaçant lit
   « DP » plus vite qu'il ne décode un pictogramme. */
const LOGOS = {
  DP: '<svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true"><path d="M4 1v5a1.5 1.5 0 0 0 1 1.4V15h1.4V7.4A1.5 1.5 0 0 0 7.4 6V1H6.4v4H5.7V1H4.7v4H4V1Zm7.2 0c-1 0-1.8 1.6-1.8 3.6 0 1.5.5 2.7 1.2 3.1V15h1.4V1Z" fill="currentColor"/></svg>',
  IN: '<svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true"><rect x="1" y="3.5" width="2" height="9" rx=".8" fill="currentColor"/><rect x="1" y="8" width="14" height="2.8" rx="1.1" fill="currentColor"/><rect x="13" y="10.2" width="2" height="2.3" rx=".8" fill="currentColor"/><rect x="3.8" y="5.6" width="4" height="2.2" rx="1" fill="currentColor"/></svg>'
};
export const logoService = sigle => LOGOS[sigle] || '';

export function sigleService(nom) {
  const t = String(nom || '').toLowerCase();
  const d = trouve(nom); if (d) return d.sigle;
  if (['cantine', 'dp', 'demi-pension'].includes(t)) return 'DP';
  if (t.startsWith('réunion d') || t.startsWith('reunion d')) return 'RE';
  if (t.startsWith('réunion') || t.startsWith('reunion')) return 'RI';
  if (t.startsWith('internat')) return 'IN';
  if (t.startsWith('pial')) return 'PI';
  if (t.startsWith('esat')) return 'ES';
  if (t.startsWith('péri') || t.startsWith('peri')) return 'PE';
  return String(nom || '').slice(0, 2).toUpperCase();
}
