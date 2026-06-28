// Constantes structurelles : jours, créneaux horaires, disciplines, dispositifs.
// Tout ce qui définit le « cadre » de la grille et qui change rarement.

export const JOURS = [
  { id: 'lun', label: 'Lundi', court: 'Lun' },
  { id: 'mar', label: 'Mardi', court: 'Mar' },
  { id: 'mer', label: 'Mercredi', court: 'Mer' },
  { id: 'jeu', label: 'Jeudi', court: 'Jeu' },
  { id: 'ven', label: 'Vendredi', court: 'Ven' },
  { id: 'sam', label: 'Samedi', court: 'Sam' },
];

// Créneaux horaires. `h` = durée en heures (sert au calcul des volumes).
// `pause` = ligne non travaillée (pause méridienne).
export const CRENEAUX = [
  { id: 'p1', debut: '08:30', fin: '09:30', h: 1 },
  { id: 'p2', debut: '09:30', fin: '10:30', h: 1 },
  { id: 'p3', debut: '10:30', fin: '11:30', h: 1 },
  { id: 'p4', debut: '11:30', fin: '12:30', h: 1 },
  { id: 'pause', debut: '12:30', fin: '13:30', h: 0, pause: true },
  { id: 'p5', debut: '13:30', fin: '14:00', h: 0.5 },
  { id: 'p6', debut: '14:00', fin: '15:00', h: 1 },
  { id: 'p7', debut: '15:00', fin: '16:00', h: 1 },
  { id: 'p8', debut: '16:00', fin: '17:00', h: 1 },
  { id: 'p9', debut: '17:00', fin: '18:00', h: 1 },
  { id: 'soir', debut: '18:00', fin: '21:00', h: 3, soiree: true },
];

export const SEMAINES = [
  { id: 'AB', label: 'A + B', court: 'A+B', desc: 'Toutes les semaines' },
  { id: 'A', label: 'Semaine A', court: 'A' },
  { id: 'B', label: 'Semaine B', court: 'B' },
];

// Disciplines avec leur couleur (teinte + variante douce pour le fond).
export const DISCIPLINES = {
  pole1:    { label: 'PSR Pôle 1 — Production / Réception', court: 'Pôle 1', color: '#d98c5f', soft: 'rgba(217,140,95,0.16)' },
  pole2:    { label: 'PSR Pôle 2 — Service', court: 'Pôle 2', color: '#c98c6f', soft: 'rgba(201,140,111,0.16)' },
  scAppli:  { label: 'PSR Sciences appliquées', court: 'Sc. appli.', color: '#b0a06a', soft: 'rgba(176,160,106,0.16)' },
  chefOeuvre:{ label: "Chef d'œuvre", court: "Chef d'œuvre", color: '#7fa86a', soft: 'rgba(127,168,106,0.16)' },
  maths:    { label: 'Maths-Sciences', court: 'Maths', color: '#5b8def', soft: 'rgba(91,141,239,0.16)' },
  coMaths:  { label: 'Co-enseignement Maths', court: 'Co-ens Maths', color: '#6aa0d8', soft: 'rgba(106,160,216,0.16)' },
  francais: { label: 'Français — Histoire-Géo', court: 'Français', color: '#c98c8c', soft: 'rgba(201,140,140,0.16)' },
  coFr:     { label: 'Co-enseignement Français', court: 'Co-ens Fr.', color: '#bcae5f', soft: 'rgba(188,174,95,0.16)' },
  anglais:  { label: 'Anglais LV1', court: 'Anglais', color: '#b56f6f', soft: 'rgba(181,111,111,0.16)' },
  pse:      { label: 'Prévention-Santé-Environnement', court: 'PSE', color: '#e0a44c', soft: 'rgba(224,164,76,0.16)' },
  arts:     { label: 'Arts appliqués', court: 'Arts', color: '#8aa86a', soft: 'rgba(138,168,106,0.16)' },
  eps:      { label: 'Éducation physique & sportive', court: 'EPS', color: '#4cb0c3', soft: 'rgba(76,176,195,0.16)' },
  ap:       { label: 'Accompagnement personnalisé', court: 'AP', color: '#9a8cd0', soft: 'rgba(154,140,208,0.16)' },
  atelier:  { label: 'Atelier (Vannerie / Cannage…)', court: 'Atelier', color: '#a0855f', soft: 'rgba(160,133,95,0.16)' },
  internat: { label: 'Internat / Soirée', court: 'Internat', color: '#6f7c92', soft: 'rgba(111,124,146,0.16)' },
  autre:    { label: 'Autre', court: 'Autre', color: '#7f8aa0', soft: 'rgba(127,138,160,0.16)' },
};

// Types d'événements de l'année (PFMP, CCF, conseils…). `range` = période (début→fin).
export const EVENT_TYPES = {
  pfmp: { label: 'PFMP — période de stage', court: 'PFMP', color: '#e0822e', range: true },
  ccf: { label: 'CCF — évaluation certificative', court: 'CCF', color: '#cf2f26', range: false },
  conseil: { label: 'Conseil de classe', court: 'Conseil', color: '#4b56d6', range: false },
  bacblanc: { label: 'Bac blanc / examen blanc', court: 'Bac blanc', color: '#8a36cf', range: false },
  sortie: { label: 'Sortie pédagogique', court: 'Sortie', color: '#138a52', range: false },
  autre: { label: 'Autre événement', court: 'Autre', color: '#5e6b85', range: false },
};

// Filières coordonnées.
export const FILIERES = {
  PSR: { label: 'CAP PSR', color: '#7c8cff' },
  MELEC: { label: 'Bac pro MELEC', color: '#2bb6a3' },
};

export const DISPOSITIFS = {
  ulis: { label: 'ULIS', color: '#9a7cff' },
  pial: { label: 'PIAL', color: '#4cc3f5' },
  dafi: { label: 'DAFI', color: '#3ecf8e' },
  none: { label: '—', color: '#6f7c92' },
};

export const creneauById = (id) => CRENEAUX.find((c) => c.id === id);
export const jourById = (id) => JOURS.find((j) => j.id === id);
export const heuresCreneaux = (ids) => ids.reduce((s, id) => s + (creneauById(id)?.h || 0), 0);
