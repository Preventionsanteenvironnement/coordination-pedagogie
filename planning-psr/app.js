// ============================================================
// app.js — FICHIER GÉNÉRÉ automatiquement par build.py.
// Ne pas éditer à la main : modifier src/ puis relancer build.py.
// ============================================================
(function () {
"use strict";
const { h, render, Fragment } = preact;
const { useState, useEffect, useMemo, useRef, useCallback, useReducer } = preactHooks;
const html = htm.bind(h);

// ───── data/constants.js ─────
// Constantes structurelles : jours, créneaux horaires, disciplines, dispositifs.
// Tout ce qui définit le « cadre » de la grille et qui change rarement.

const JOURS = [
  { id: 'lun', label: 'Lundi', court: 'Lun' },
  { id: 'mar', label: 'Mardi', court: 'Mar' },
  { id: 'mer', label: 'Mercredi', court: 'Mer' },
  { id: 'jeu', label: 'Jeudi', court: 'Jeu' },
  { id: 'ven', label: 'Vendredi', court: 'Ven' },
  { id: 'sam', label: 'Samedi', court: 'Sam' },
];

// Créneaux horaires. `h` = durée en heures (sert au calcul des volumes).
// `pause` = ligne non travaillée (pause méridienne).
const CRENEAUX = [
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

const SEMAINES = [
  { id: 'AB', label: 'A + B', court: 'A+B', desc: 'Toutes les semaines' },
  { id: 'A', label: 'Semaine A', court: 'A' },
  { id: 'B', label: 'Semaine B', court: 'B' },
];

// Disciplines avec leur couleur (teinte + variante douce pour le fond).
const DISCIPLINES = {
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
const EVENT_TYPES = {
  pfmp: { label: 'PFMP — période de stage', court: 'PFMP', color: '#e0822e', range: true },
  ccf: { label: 'CCF — évaluation certificative', court: 'CCF', color: '#cf2f26', range: false },
  conseil: { label: 'Conseil de classe', court: 'Conseil', color: '#4b56d6', range: false },
  bacblanc: { label: 'Bac blanc / examen blanc', court: 'Bac blanc', color: '#8a36cf', range: false },
  sortie: { label: 'Sortie pédagogique', court: 'Sortie', color: '#138a52', range: false },
  autre: { label: 'Autre événement', court: 'Autre', color: '#5e6b85', range: false },
};

// Filières coordonnées.
const FILIERES = {
  PSR: { label: 'CAP PSR', color: '#7c8cff' },
  MELEC: { label: 'Bac pro MELEC', color: '#2bb6a3' },
};

const DISPOSITIFS = {
  ulis: { label: 'ULIS', color: '#9a7cff' },
  pial: { label: 'PIAL', color: '#4cc3f5' },
  dafi: { label: 'DAFI', color: '#3ecf8e' },
  none: { label: '—', color: '#6f7c92' },
};

// Type d'accompagnement d'un AESH sur un créneau (couche vivante).
// Aucune donnée nominative : on décrit la nature de l'accompagnement, pas l'élève.
const TYPES_ACCOMPAGNEMENT = {
  mutualise:   { label: 'Mutualisé', court: 'Mut.', color: '#5b8def' },
  individuel:  { label: 'Individuel (anonymisé)', court: 'Indiv.', color: '#9a7cff' },
  repas:       { label: 'Repas', court: 'Repas', color: '#e0a44c' },
  atelier:     { label: 'Atelier', court: 'Atelier', color: '#7fa86a' },
  deplacement: { label: 'Déplacement', court: 'Dépl.', color: '#4cb0c3' },
};
const TYPE_ACCOMP_DEFAUT = 'mutualise';

const creneauById = (id) => CRENEAUX.find((c) => c.id === id);
const jourById = (id) => JOURS.find((j) => j.id === id);
const heuresCreneaux = (ids) => ids.reduce((s, id) => s + (creneauById(id)?.h || 0), 0);


// ───── data/seed.js ─────
// ============================================================
// DONNÉES DE DÉPART — reconstituées depuis les documents fournis :
//   • EDT classe C1 PSR (PDF officiel, Semaine A / B)
//   • Tableau de coordination (C1/C2 PSR + 4 AESH)
// C'est la « base » : l'utilisateur la modifie ensuite dans l'app.
// Les volumes des AESH sont CALCULÉS en direct à partir des affectations
// ci-dessous + des activités hors-classe.
// ============================================================

const ANNEE = '2026-2027';

// — Enseignants —
// RGPD : pas de noms en clair dans les données publiées — initiales seulement.
// (Le coordinateur peut renommer en local ; ces noms ne sont jamais poussés en ligne.)
const ENSEIGNANTS = [
  { id: 'ens1', nom: 'DE', initiales: 'DE', disc: ['pole1', 'scAppli', 'coMaths'] },
  { id: 'ens2', nom: 'SC', initiales: 'SC', disc: ['maths', 'coMaths', 'ap'] },
  { id: 'ens3', nom: 'BL', initiales: 'BL', disc: ['pole2', 'chefOeuvre', 'coFr'] },
  { id: 'ens4', nom: 'ME', initiales: 'ME', disc: ['pse', 'chefOeuvre'] },
  { id: 'ens5', nom: 'WA', initiales: 'WA', disc: ['francais', 'coFr', 'ap'] },
  { id: 'ens6', nom: 'PA', initiales: 'PA', disc: ['anglais'] },
  { id: 'ens7', nom: 'LO', initiales: 'LO', disc: ['arts', 'atelier'] },
  { id: 'ens8', nom: 'GU', initiales: 'GU', disc: ['eps'] },
  { id: 'ens9', nom: 'HA', initiales: 'HA', disc: ['eps'] },
  { id: 'ens10', nom: 'GI', initiales: 'GI', disc: ['eps'] },
  { id: 'ens11', nom: 'GR', initiales: 'GR', disc: ['atelier'] },
];

// — AESH — couleur = identité visuelle ; volumeCible = volume contractuel hebdo.
// horsClasse = heures hors classes PSR (PIAL, coordination, internat, autres dispositifs).
// `code` = sigle affiché dans la grille (RGPD : pas de prénom en clair côté planning).
// `nom`/`prenom` restent en usage interne (gestion), modifiables, et le sigle l'est aussi.
const AESH = [
  {
    id: 'aesh1', nom: 'AESH A', prenom: 'A', initiales: 'A', code: 'A',
    color: '#5b8def', volumeCible: 39,
    horsClasse: [ { label: 'PIAL', h: 10 }, { label: 'Coordination', h: 1 } ],
  },
  {
    id: 'aesh2', nom: 'AESH T', prenom: 'T', initiales: 'T', code: 'T',
    color: '#3ecf8e', volumeCible: 30,
    horsClasse: [ { label: '2VAN', h: 1 }, { label: 'DP', h: 1 }, { label: 'Coordination', h: 1 } ],
  },
  {
    id: 'aesh3', nom: 'AESH F', prenom: 'F', initiales: 'F', code: 'F',
    color: '#f5b14c', volumeCible: 26,
    horsClasse: [ { label: '2VAN', h: 8 }, { label: '1CAN', h: 1 }, { label: 'DP', h: 2 }, { label: 'Coordination', h: 2 } ],
  },
  {
    id: 'aesh4', nom: 'AESH S', prenom: 'S', initiales: 'S', code: 'S',
    color: '#c98cff', volumeCible: 26,
    horsClasse: [ { label: 'C1 HORT', h: 4 }, { label: 'C2 HORT', h: 7 }, { label: 'DAFI', h: 2 }, { label: 'Coordination', h: 1 } ],
  },
];

// — Classes — périmètre PSR (CAP) + MELEC (Bac pro). effectif type PSR = 8.
// Les classes MELEC n'ont pas encore d'EDT (à remplir via l'éditeur à la rentrée).
const CLASSES = [
  { id: 'c1psr', nom: 'C1 PSR', filiere: 'PSR', niveau: 'CAP 1ʳᵉ année', effectif: 8, notifies: 0, color: '#7c8cff', dispositif: 'ulis' },
  { id: 'c2psr', nom: 'C2 PSR', filiere: 'PSR', niveau: 'CAP 2ᵉ année', effectif: 8, notifies: 0, color: '#9a7cff', dispositif: 'ulis' },
  { id: 'b1melec', nom: '2ⁿᵈᵉ MELEC', filiere: 'MELEC', niveau: 'Bac pro 2ⁿᵈᵉ', effectif: 12, notifies: 0, color: '#2bb6a3', dispositif: 'ulis' },
  { id: 'b2melec', nom: '1ʳᵉ MELEC', filiere: 'MELEC', niveau: 'Bac pro 1ʳᵉ', effectif: 12, notifies: 0, color: '#2b9fb6', dispositif: 'ulis' },
  { id: 'btmelec', nom: 'Term MELEC', filiere: 'MELEC', niveau: 'Bac pro Terminale', effectif: 12, notifies: 0, color: '#2b87b6', dispositif: 'ulis' },
];

// — Événements de l'année (PFMP, conseils…) —
// Dates PRÉVISIONNELLES : reprojetées depuis un agenda Pronote 2025-2026
// sur 2026-2027 (≈ +1 an). À confirmer/ajuster avec l'export Pronote 2026-2027,
// ou via l'importateur .ics (à venir).
let _eid = 0;
const ev = (type, classe, debut, fin, titre, prev = true) =>
  ({ id: `ev${++_eid}`, type, classe, debut, fin: fin || debut, titre: titre || '', previsionnel: prev });

const EVENEMENTS = [
  // PFMP — PSR (CAP : 2 périodes ~3 semaines)
  ev('pfmp', 'c1psr', '2027-01-11', '2027-02-01', 'PFMP 1'),
  ev('pfmp', 'c1psr', '2027-05-31', '2027-06-21', 'PFMP 2'),
  ev('pfmp', 'c2psr', '2026-11-23', '2026-12-21', 'PFMP 1'),
  ev('pfmp', 'c2psr', '2027-05-03', '2027-05-31', 'PFMP 2'),
  // PFMP — MELEC (Bac pro : réparties sur les 3 ans)
  ev('pfmp', 'b1melec', '2027-01-11', '2027-02-08', 'PFMP 1'),
  ev('pfmp', 'b1melec', '2027-05-31', '2027-06-28', 'PFMP 2'),
  ev('pfmp', 'b2melec', '2027-05-17', '2027-06-28', 'PFMP'),
  ev('pfmp', 'btmelec', '2026-11-09', '2026-12-21', 'PFMP'),
  // Conseils de classe — 1er trimestre (mi-janvier)
  ev('conseil', 'c1psr', '2027-01-18', '2027-01-18', 'Conseil T1'),
  ev('conseil', 'c2psr', '2027-01-18', '2027-01-18', 'Conseil T1'),
  ev('conseil', 'b1melec', '2027-01-21', '2027-01-21', 'Conseil T1'),
  ev('conseil', 'b2melec', '2027-01-21', '2027-01-21', 'Conseil T1'),
  ev('conseil', 'btmelec', '2027-01-25', '2027-01-25', 'Conseil T1'),
];

// — Séances (cours) —
// Format compact : s(classe, jour, creneau, discipline, [enseignants], salle, semaine?)
// semaine : 'AB' (toutes), 'A' (semaine A), 'B' (semaine B). Défaut 'AB'.
let _sid = 0;
const s = (classe, jour, creneau, disc, profs, salle, semaine = 'AB') => ({
  id: `se${++_sid}`, classe, jour, creneau, disc, profs, salle, semaine,
});

const SEANCES = [
  // ───────────── C1 PSR (d'après l'EDT officiel PDF) ─────────────
  // Lundi
  s('c1psr', 'lun', 'p2', 'coMaths', ['ens1', 'ens2'], '008'),
  s('c1psr', 'lun', 'p3', 'coMaths', ['ens1', 'ens2'], '008', 'A'),
  s('c1psr', 'lun', 'p3', 'pse', ['ens4'], '205', 'B'),
  s('c1psr', 'lun', 'p4', 'pole1', ['ens1'], '008'),           // Réception
  s('c1psr', 'lun', 'p6', 'chefOeuvre', ['ens3', 'ens4'], '010'),
  s('c1psr', 'lun', 'p7', 'chefOeuvre', ['ens3', 'ens4'], '010'),
  // Mardi
  s('c1psr', 'mar', 'p1', 'pole1', ['ens1'], '008'),           // TP Production
  s('c1psr', 'mar', 'p2', 'pole1', ['ens1'], '008'),
  s('c1psr', 'mar', 'p3', 'pole1', ['ens1'], '008'),
  s('c1psr', 'mar', 'p6', 'scAppli', ['ens1'], '008'),
  s('c1psr', 'mar', 'p7', 'scAppli', ['ens1'], '008'),
  s('c1psr', 'mar', 'p8', 'arts', ['ens7'], '016'),
  s('c1psr', 'mar', 'p9', 'arts', ['ens7'], '016'),
  // Mercredi
  s('c1psr', 'mer', 'p1', 'francais', ['ens5'], '118'),
  s('c1psr', 'mer', 'p2', 'coFr', ['ens3', 'ens5'], '010'),
  s('c1psr', 'mer', 'p4', 'anglais', ['ens6'], '008'),
  s('c1psr', 'mer', 'p6', 'maths', ['ens2'], '201', 'A'),
  s('c1psr', 'mer', 'p6', 'ap', ['ens2'], '114', 'B'),
  s('c1psr', 'mer', 'p7', 'anglais', ['ens6'], '119B'),
  // Jeudi
  s('c1psr', 'jeu', 'p1', 'francais', ['ens5'], '118'),
  s('c1psr', 'jeu', 'p2', 'maths', ['ens2'], '201'),
  s('c1psr', 'jeu', 'p3', 'pole2', ['ens3'], '010'),            // Service TP
  s('c1psr', 'jeu', 'p6', 'pole2', ['ens3'], '010'),
  // Vendredi
  s('c1psr', 'ven', 'p1', 'eps', ['ens8', 'ens9'], 'Gymnase'),
  s('c1psr', 'ven', 'p2', 'eps', ['ens8', 'ens9'], 'Gymnase'),
  s('c1psr', 'ven', 'p4', 'pse', ['ens4'], '205'),

  // ───────────── C2 PSR (d'après le tableau Excel) ─────────────
  // Lundi
  s('c2psr', 'lun', 'p2', 'pse', ['ens4'], '205'),
  s('c2psr', 'lun', 'p3', 'francais', ['ens5'], '118'),
  s('c2psr', 'lun', 'p4', 'maths', ['ens2'], '124', 'A'),
  s('c2psr', 'lun', 'p4', 'ap', ['ens2'], '124', 'B'),
  s('c2psr', 'lun', 'p6', 'eps', ['ens10'], 'Gymnase'),
  s('c2psr', 'lun', 'p7', 'anglais', ['ens6'], '118'),
  s('c2psr', 'lun', 'p8', 'francais', ['ens5'], '118'),
  // Mardi
  s('c2psr', 'mar', 'p1', 'coFr', ['ens3', 'ens5'], '010'),
  s('c2psr', 'mar', 'p2', 'pole2', ['ens3'], '010'),            // Service
  // Mercredi
  s('c2psr', 'mer', 'p1', 'coMaths', ['ens2'], '010'),
  s('c2psr', 'mer', 'p3', 'anglais', ['ens6'], '008'),
  s('c2psr', 'mer', 'p7', 'arts', ['ens7'], '016'),
  // Jeudi
  s('c2psr', 'jeu', 'p1', 'pole1', ['ens1'], '008'),           // Production
  s('c2psr', 'jeu', 'p6', 'scAppli', ['ens1'], '008'),
  // Vendredi
  s('c2psr', 'ven', 'p1', 'maths', ['ens2'], '124'),
  s('c2psr', 'ven', 'p2', 'chefOeuvre', ['ens3'], '008'),
  s('c2psr', 'ven', 'p6', 'eps', ['ens10'], 'Gymnase'),
];

// — Affectations AESH (présence sur les séances) —
// Format : a(aesh, séanceId)  — on relie un AESH à une séance précise.
const a = (aesh, seance) => ({ id: `af-${aesh}-${seance}`, aesh, seance });

// Helper : récupère l'id d'une séance par (classe, jour, creneau, semaine)
const sidOf = (classe, jour, creneau, semaine = 'AB') => {
  const found = SEANCES.find(
    (x) => x.classe === classe && x.jour === jour && x.creneau === creneau && x.semaine === semaine
  );
  return found ? found.id : null;
};

const aff = (aesh, classe, jour, creneau, semaine = 'AB') => {
  const sid = sidOf(classe, jour, creneau, semaine);
  return sid ? a(aesh, sid) : null;
};

const AFFECTATIONS = [
  // — AESH T : porte l'essentiel de C1 PSR —
  aff('aesh2', 'c1psr', 'lun', 'p2'),
  aff('aesh2', 'c1psr', 'lun', 'p3', 'A'),
  aff('aesh2', 'c1psr', 'lun', 'p4'),
  aff('aesh2', 'c1psr', 'mar', 'p1'),
  aff('aesh2', 'c1psr', 'mar', 'p2'),
  aff('aesh2', 'c1psr', 'mar', 'p3'),
  aff('aesh2', 'c1psr', 'mar', 'p6'),
  aff('aesh2', 'c1psr', 'mar', 'p7'),
  aff('aesh2', 'c1psr', 'mer', 'p1'),
  aff('aesh2', 'c1psr', 'mer', 'p2'),
  aff('aesh2', 'c1psr', 'mer', 'p4'),
  aff('aesh2', 'c1psr', 'jeu', 'p1'),
  aff('aesh2', 'c1psr', 'jeu', 'p2'),
  aff('aesh2', 'c1psr', 'jeu', 'p3'),
  aff('aesh2', 'c1psr', 'jeu', 'p6'),
  aff('aesh2', 'c1psr', 'ven', 'p1'),
  aff('aesh2', 'c1psr', 'ven', 'p2'),
  aff('aesh2', 'c1psr', 'ven', 'p4'),

  // — AESH F : appui ponctuel C1 + C2 —
  aff('aesh3', 'c1psr', 'lun', 'p6'),       // Chef d'œuvre
  aff('aesh3', 'c1psr', 'jeu', 'p2'),       // Maths
  aff('aesh3', 'c1psr', 'mer', 'p7'),       // Anglais
  aff('aesh3', 'c1psr', 'jeu', 'p6'),       // Service
  aff('aesh3', 'c2psr', 'lun', 'p7'),
  aff('aesh3', 'c2psr', 'mer', 'p3'),

  // — AESH A : surtout C2, présence minime en C1 —
  aff('aesh1', 'c1psr', 'lun', 'p7'),
  aff('aesh1', 'c2psr', 'lun', 'p2'),
  aff('aesh1', 'c2psr', 'lun', 'p3'),
  aff('aesh1', 'c2psr', 'lun', 'p4', 'A'),
  aff('aesh1', 'c2psr', 'mar', 'p1'),
  aff('aesh1', 'c2psr', 'mar', 'p2'),
  aff('aesh1', 'c2psr', 'mer', 'p1'),
  aff('aesh1', 'c2psr', 'mer', 'p3'),
  aff('aesh1', 'c2psr', 'jeu', 'p1'),
  aff('aesh1', 'c2psr', 'jeu', 'p6'),
  aff('aesh1', 'c2psr', 'ven', 'p1'),
  aff('aesh1', 'c2psr', 'ven', 'p2'),

  // — AESH S : appui C1 + C2 —
  aff('aesh4', 'c1psr', 'lun', 'p2'),
  aff('aesh4', 'c1psr', 'lun', 'p4'),
  aff('aesh4', 'c2psr', 'lun', 'p6'),
  aff('aesh4', 'c2psr', 'ven', 'p6'),
].filter(Boolean);

// Configuration par défaut (Semaine A/B + calendrier + préférences d'affichage).
// anchorMonday : lundi de référence dont on connaît la parité (anchorParity).
// Année 2026-2027 (académie de Lyon, zone A). Prérentrée lundi 31 août 2026 = Semaine A.
function defaultConfig() {
  return {
    semaine: {
      anchorMonday: '2026-08-31',
      anchorParity: 'A',
      labelA: 'A',
      labelB: 'B',
      colorA: '#0b72b8',
      colorB: '#8a36cf',
      suivreSemaineCourante: true,
    },
    calendrier: {
      rentree: '2026-09-01',
      prerentree: '2026-08-31',
      finAnnee: '2027-07-03',
      // Vacances : debut = samedi (fin des cours la veille au soir), reprise = lundi matin.
      vacances: [
        { nom: 'Toussaint', debut: '2026-10-17', reprise: '2026-11-02' },
        { nom: 'Noël', debut: '2026-12-19', reprise: '2027-01-04' },
        { nom: "Hiver", debut: '2027-02-13', reprise: '2027-03-01' },
        { nom: 'Printemps', debut: '2027-04-10', reprise: '2027-04-26' },
        { nom: 'Été', debut: '2027-07-03', reprise: '2027-08-30' },
      ],
      // Jours fériés tombant un jour de classe (retirent une journée).
      feries: [
        { nom: 'Armistice 1918', date: '2026-11-11' },
        { nom: 'Lundi de Pâques', date: '2027-03-29' },
        { nom: 'Ascension', date: '2027-05-06' },
        { nom: "Pont de l'Ascension", date: '2027-05-07' },
        { nom: 'Lundi de Pentecôte', date: '2027-05-17' },
      ],
    },
    ui: { weekMode: 'AB', weekPriority: null },
  };
}

// État initial complet de l'application.
function seedState() {
  return {
    annee: ANNEE,
    config: defaultConfig(),
    enseignants: ENSEIGNANTS.map((e) => ({ ...e })),
    aesh: AESH.map((x) => ({ ...x, horsClasse: x.horsClasse.map((h) => ({ ...h })) })),
    classes: CLASSES.map((c) => ({ ...c })),
    seances: SEANCES.map((x) => ({ ...x })),
    affectations: AFFECTATIONS.map((x) => ({ ...x })),
    evenements: EVENEMENTS.map((x) => ({ ...x })),
  };
}


// ───── store.js ─────
// ============================================================
// STORE — état global, persistance navigateur, abonnement réactif.
// Pattern simple : un état immuable + un bus d'événements.
// ============================================================


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

function getState() { return state; }

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() { listeners.forEach((fn) => fn(state)); }

// Applique une mutation immuable. `recordUndo` empile l'état précédent.
function update(mutator, { recordUndo = true } = {}) {
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

function canUndo() { return history.length > 0; }

function undo() {
  if (!history.length) return;
  state = JSON.parse(history.pop());
  persist();
  emit();
}

function resetToSeed() {
  history.push(JSON.stringify(state));
  state = seedState();
  persist();
  emit();
}

function replaceState(next) {
  history.push(JSON.stringify(state));
  state = next;
  persist();
  emit();
}

// ─── Mutations métier ───

function setWeekView({ mode, priority }) {
  update((d) => {
    if (mode !== undefined) d.config.ui.weekMode = mode;
    if (priority !== undefined) d.config.ui.weekPriority = priority;
  }, { recordUndo: false });
}

function updateSemaine(patch) {
  update((d) => { d.config.semaine = { ...d.config.semaine, ...patch }; });
}

function addAffectation(aeshId, seanceId, type = 'mutualise') {
  update((d) => {
    const exists = d.affectations.some((a) => a.aesh === aeshId && a.seance === seanceId);
    if (!exists) d.affectations.push({ id: `af-${aeshId}-${seanceId}-${d.affectations.length}`, aesh: aeshId, seance: seanceId, type });
  });
}

// Change le type d'accompagnement d'un AESH sur un créneau (mutualisé, individuel…).
function setAffectationType(aeshId, seanceId, type) {
  update((d) => {
    const a = d.affectations.find((x) => x.aesh === aeshId && x.seance === seanceId);
    if (a) a.type = type;
  });
}

// Enregistre une remarque courte sur un créneau (couche vivante, non nominative).
function setSeanceRemarque(seanceId, remarque) {
  update((d) => {
    const s = d.seances.find((x) => x.id === seanceId);
    if (s) s.remarque = remarque;
  });
}

// Change le besoin d'AESH attendu sur un créneau (0 à 4).
function setBesoinAesh(seanceId, n) {
  update((d) => {
    const s = d.seances.find((x) => x.id === seanceId);
    if (s) s.besoinAesh = Math.max(0, Math.min(4, n));
  });
}

function removeAffectation(aeshId, seanceId) {
  update((d) => {
    d.affectations = d.affectations.filter((a) => !(a.aesh === aeshId && a.seance === seanceId));
  });
}

function moveAffectation(aeshId, fromSeanceId, toSeanceId) {
  update((d) => {
    d.affectations = d.affectations.filter((a) => !(a.aesh === aeshId && a.seance === fromSeanceId));
    if (!d.affectations.some((a) => a.aesh === aeshId && a.seance === toSeanceId))
      d.affectations.push({ id: `af-${aeshId}-${toSeanceId}-${d.affectations.length}`, aesh: aeshId, seance: toSeanceId });
  });
}

function upsertAesh(aesh) {
  update((d) => {
    const i = d.aesh.findIndex((x) => x.id === aesh.id);
    if (i >= 0) d.aesh[i] = aesh; else d.aesh.push(aesh);
  });
}

function upsertClasse(classe) {
  update((d) => {
    const i = d.classes.findIndex((x) => x.id === classe.id);
    if (i >= 0) d.classes[i] = classe; else d.classes.push(classe);
  });
}

function upsertSeance(seance) {
  update((d) => {
    const i = d.seances.findIndex((x) => x.id === seance.id);
    if (i >= 0) d.seances[i] = seance; else d.seances.push(seance);
  });
}

function removeSeance(seanceId) {
  update((d) => {
    d.seances = d.seances.filter((x) => x.id !== seanceId);
    d.affectations = d.affectations.filter((a) => a.seance !== seanceId);
  });
}

function moveSeance(seanceId, jour, creneau) {
  update((d) => {
    const s = d.seances.find((x) => x.id === seanceId);
    if (s) { s.jour = jour; s.creneau = creneau; }
  });
}

function upsertEvenement(e) {
  update((d) => {
    if (!Array.isArray(d.evenements)) d.evenements = [];
    const i = d.evenements.findIndex((x) => x.id === e.id);
    if (i >= 0) d.evenements[i] = e; else d.evenements.push(e);
  });
}

function removeEvenement(id) {
  update((d) => { d.evenements = (d.evenements || []).filter((x) => x.id !== id); });
}

// Ajout en masse (import .ics) avec dédoublonnage par type+classe+date.
function addEvenementsBulk(list) {
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


// ───── lib/selectors.js ─────
// Sélecteurs — calculs dérivés de l'état (heures, couverture, conflits).
// Aucune mutation ici : uniquement de la lecture.


const byId = (list, id) => list.find((x) => x.id === id);

// Heures réalisées par un AESH dans les classes (somme des durées de séances affectées).
function heuresAeshClasse(state, aeshId) {
  return state.affectations
    .filter((a) => a.aesh === aeshId)
    .reduce((sum, a) => {
      const se = byId(state.seances, a.seance);
      return sum + (se ? (creneauById(se.creneau)?.h || 0) : 0);
    }, 0);
}

function heuresAeshHorsClasse(state, aeshId) {
  const aesh = byId(state.aesh, aeshId);
  return (aesh?.horsClasse || []).reduce((s, x) => s + (x.h || 0), 0);
}

// Bilan complet d'un AESH : réalisé, cible, écart, répartition par classe.
function bilanAesh(state, aeshId) {
  const aesh = byId(state.aesh, aeshId);
  const classeH = heuresAeshClasse(state, aeshId);
  const horsH = heuresAeshHorsClasse(state, aeshId);
  const total = classeH + horsH;
  const cible = aesh?.volumeCible || 0;
  const parClasse = {};
  state.affectations.filter((a) => a.aesh === aeshId).forEach((a) => {
    const se = byId(state.seances, a.seance);
    if (!se) return;
    parClasse[se.classe] = (parClasse[se.classe] || 0) + (creneauById(se.creneau)?.h || 0);
  });
  return { aesh, classeH, horsH, total, cible, ecart: total - cible, parClasse };
}

// Heures d'accompagnement positionnées sur une classe (toutes AESH confondues).
function heuresClasse(state, classeId) {
  const seanceIds = new Set(state.seances.filter((s) => s.classe === classeId).map((s) => s.id));
  return state.affectations
    .filter((a) => seanceIds.has(a.seance))
    .reduce((sum, a) => {
      const se = byId(state.seances, a.seance);
      return sum + (creneauById(se.creneau)?.h || 0);
    }, 0);
}

function besoinAeshSeance(state, seance) {
  const raw = Number(seance.besoinAesh);
  if (Number.isFinite(raw)) return Math.max(0, Math.min(4, raw));
  const classe = byId(state.classes, seance.classe);
  return classe && classe.dispositif !== 'none' ? 1 : 0;
}

// AESH affectés à une séance donnée.
function aeshDeSeance(state, seanceId) {
  const ids = state.affectations.filter((a) => a.seance === seanceId).map((a) => a.aesh);
  return ids.map((id) => byId(state.aesh, id)).filter(Boolean);
}

function couvertureSeance(state, seance) {
  const attendu = besoinAeshSeance(state, seance);
  const positionnes = aeshDeSeance(state, seance.id).length;
  const manquants = Math.max(0, attendu - positionnes);
  const statut = attendu <= 0
    ? 'none'
    : positionnes >= attendu
      ? 'covered'
      : positionnes > 0
        ? 'partial'
        : 'missing';
  return { attendu, positionnes, manquants, statut, label: `${positionnes}/${attendu}` };
}

function couvertureClasse(state, classeId) {
  const seances = state.seances.filter((s) => s.classe === classeId);
  return couvertureListe(state, seances);
}

function couvertureBesoins(state) {
  return couvertureListe(state, state.seances);
}

function couvertureListe(state, seances) {
  const total = {
    expectedSlots: 0,
    coveredSlots: 0,
    partialSlots: 0,
    missingSlots: 0,
    expectedHours: 0,
    coveredHours: 0,
  };
  seances.forEach((se) => {
    const cov = couvertureSeance(state, se);
    if (cov.attendu <= 0) return;
    const h = creneauById(se.creneau)?.h || 0;
    total.expectedSlots += 1;
    total.expectedHours += h * cov.attendu;
    total.coveredHours += h * Math.min(cov.positionnes, cov.attendu);
    if (cov.statut === 'covered') total.coveredSlots += 1;
    else if (cov.statut === 'partial') total.partialSlots += 1;
    else total.missingSlots += 1;
  });
  total.percent = total.expectedHours > 0 ? Math.round((total.coveredHours / total.expectedHours) * 100) : 100;
  return total;
}

// Récupère la (ou les) séance(s) d'une classe sur un créneau, filtrées par semaine affichée.
// vue : 'AB' montre tout ; 'A' montre AB + A ; 'B' montre AB + B.
function seancesCellule(state, classeId, jour, creneauId, vue) {
  return state.seances.filter((s) => {
    if (s.classe !== classeId || s.jour !== jour || s.creneau !== creneauId) return false;
    if (vue === 'AB') return true;
    if (vue === 'A') return s.semaine === 'AB' || s.semaine === 'A';
    if (vue === 'B') return s.semaine === 'AB' || s.semaine === 'B';
    return true;
  });
}

// Toutes les séances où intervient un AESH (pour sa grille perso).
function seancesAesh(state, aeshId) {
  const seanceIds = new Set(state.affectations.filter((a) => a.aesh === aeshId).map((a) => a.seance));
  return state.seances.filter((s) => seanceIds.has(s.id));
}

// Conflit : un AESH affecté à 2 séances simultanées (même jour+créneau, semaines compatibles).
function conflitsAesh(state, aeshId) {
  const seances = seancesAesh(state, aeshId);
  const conflicts = [];
  for (let i = 0; i < seances.length; i++) {
    for (let j = i + 1; j < seances.length; j++) {
      const x = seances[i], y = seances[j];
      if (x.jour === y.jour && x.creneau === y.creneau) {
        const sameWeek = x.semaine === 'AB' || y.semaine === 'AB' || x.semaine === y.semaine;
        if (sameWeek) conflicts.push([x, y]);
      }
    }
  }
  return conflicts;
}

// Heures d'un AESH sur une semaine de parité donnée ('A' ou 'B') :
// les séances communes (AB) + celles de la semaine considérée.
function heuresAeshParite(state, aeshId, parity) {
  return state.affectations
    .filter((a) => a.aesh === aeshId)
    .reduce((s, a) => {
      const se = byId(state.seances, a.seance);
      if (!se) return s;
      if (se.semaine === 'AB' || se.semaine === parity) return s + (creneauById(se.creneau)?.h || 0);
      return s;
    }, 0);
}

// Liste à plat des séances d'un AESH, triées (jour puis créneau) — pour la vue Liste.
function listeAesh(state, aeshId) {
  const ids = new Set(state.affectations.filter((a) => a.aesh === aeshId).map((a) => a.seance));
  const ordreJour = { lun: 0, mar: 1, mer: 2, jeu: 3, ven: 4, sam: 5 };
  return state.seances
    .filter((s) => ids.has(s.id))
    .sort((a, b) => (ordreJour[a.jour] - ordreJour[b.jour]) || a.creneau.localeCompare(b.creneau));
}

// L'AESH est-il déjà occupé sur ce créneau (jour+créneau, semaine compatible) ?
// Renvoie la/les séance(s) en conflit (hors la séance testée).
function aeshOccupeAt(state, aeshId, jour, creneau, semaine, exceptSeanceId) {
  const seanceIds = new Set(state.affectations.filter((a) => a.aesh === aeshId).map((a) => a.seance));
  return state.seances.filter((s) =>
    seanceIds.has(s.id) && s.id !== exceptSeanceId &&
    s.jour === jour && s.creneau === creneau &&
    (s.semaine === 'AB' || semaine === 'AB' || s.semaine === semaine));
}

function estAffecte(state, aeshId, seanceId) {
  return state.affectations.some((a) => a.aesh === aeshId && a.seance === seanceId);
}

function totauxGeneraux(state) {
  const totalAffecteH = state.aesh.reduce((s, a) => s + heuresAeshClasse(state, a.id), 0);
  const totalHorsH = state.aesh.reduce((s, a) => s + heuresAeshHorsClasse(state, a.id), 0);
  const totalCible = state.aesh.reduce((s, a) => s + (a.volumeCible || 0), 0);
  return { totalAffecteH, totalHorsH, totalServiceH: totalAffecteH + totalHorsH, totalCible };
}


// ───── lib/alerts.js ─────
// Moteur d'alertes — détecte automatiquement les incohérences de coordination.
// C'est la valeur ajoutée vs Excel : tout est vérifié en continu.



const sevRank = { danger: 0, warn: 1, info: 2 };

function computeAlerts(state) {
  const out = [];

  // 1) AESH en sur-volume ou sous-volume par rapport à la cible
  state.aesh.forEach((a) => {
    const b = bilanAesh(state, a.id);
    if (b.cible > 0 && b.ecart > 0.01) {
      out.push({
        sev: 'danger', cat: 'Volume',
        title: `${a.nom} dépasse son volume`,
        desc: `${b.total} h positionnées pour une cible de ${b.cible} h (+${round(b.ecart)} h).`,
        ref: { type: 'aesh', id: a.id },
      });
    } else if (b.cible > 0 && b.ecart < -0.01) {
      out.push({
        sev: 'warn', cat: 'Volume',
        title: `${a.nom} sous son volume`,
        desc: `${b.total} h positionnées sur ${b.cible} h cible (${round(b.ecart)} h à placer).`,
        ref: { type: 'aesh', id: a.id },
      });
    }
  });

  // 2) Conflits d'emploi du temps (AESH sur 2 séances en même temps)
  state.aesh.forEach((a) => {
    conflitsAesh(state, a.id).forEach(([x, y]) => {
      out.push({
        sev: 'danger', cat: 'Conflit',
        title: `${a.nom} : chevauchement`,
        desc: `${jourById(x.jour)?.label} ${creneauById(x.creneau)?.debut} — ${DISCIPLINES[x.disc]?.court} et ${DISCIPLINES[y.disc]?.court} en simultané.`,
        ref: { type: 'aesh', id: a.id },
      });
    });
  });

  // 3) Besoins AESH non couverts (sans données élèves nominatives)
  state.seances.forEach((se) => {
    const classe = byId(state.classes, se.classe);
    if (!classe || classe.dispositif === 'none') return;
    if (creneauById(se.creneau)?.soiree) return; // soirée traitée à part
    const cov = couvertureSeance(state, se);
    if (cov.attendu > 0 && cov.manquants > 0) {
      out.push({
        sev: cov.positionnes === 0 ? 'warn' : 'info',
        cat: 'Couverture',
        title: `${classe.nom} : besoin AESH à couvrir`,
        desc: `${jourById(se.jour)?.label} ${creneauById(se.creneau)?.debut} — ${DISCIPLINES[se.disc]?.label}${se.semaine !== 'AB' ? ` (sem. ${se.semaine})` : ''} : ${cov.positionnes}/${cov.attendu} AESH positionné(s).`,
        ref: { type: 'seance', id: se.id, classe: se.classe },
      });
    }
  });

  return out.sort((p, q) => sevRank[p.sev] - sevRank[q.sev]);
}

function alertsSummary(state) {
  const all = computeAlerts(state);
  return {
    total: all.length,
    danger: all.filter((a) => a.sev === 'danger').length,
    warn: all.filter((a) => a.sev === 'warn').length,
    info: all.filter((a) => a.sev === 'info').length,
    all,
  };
}

function round(n) { return Math.round(n * 10) / 10; }


// ───── lib/week.js ─────
// Logique Semaine A / B — alternance qui SAUTE les vacances (convention courante :
// on ne compte que les semaines de classe). Détecte aussi vacances / hors-année.
// Le navigateur a accès à la vraie date.

// Parse une date 'YYYY-MM-DD' en date locale (évite les décalages de fuseau).
function parseISO(s) {
  if (s instanceof Date) return s;
  const [y, m, d] = String(s).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

// Lundi (00:00) de la semaine contenant `d`.
function mondayOf(d) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // 0 = lundi
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

// La semaine commençant au lundi M est-elle une semaine de vacances ?
// debut = samedi (fin des cours la veille), reprise = lundi matin.
function vacancesDe(config, M) {
  const list = config?.calendrier?.vacances || [];
  for (const v of list) {
    if (M > parseISO(v.debut) && M < parseISO(v.reprise)) return v;
  }
  return null;
}

// Statut de la semaine contenant `date` :
//  { status:'ecole', parity:'A'|'B' } | { status:'vacances', nom } |
//  { status:'avant' } | { status:'apres' }
function weekStatus(config, date = new Date()) {
  const sem = config.semaine;
  const M = mondayOf(date);
  const anchor = mondayOf(parseISO(sem.anchorMonday));
  const cal = config.calendrier || {};

  if (M < anchor) return { status: 'avant' };
  if (cal.finAnnee && M >= mondayOf(parseISO(cal.finAnnee))) {
    const v = vacancesDe(config, M);
    return v ? { status: 'vacances', nom: v.nom } : { status: 'apres' };
  }
  const vac = vacancesDe(config, M);
  if (vac) return { status: 'vacances', nom: vac.nom };

  // Compte les semaines de classe (hors vacances) depuis l'ancrage.
  let idx = 0;
  const cur = new Date(anchor);
  while (cur < M) {
    cur.setDate(cur.getDate() + 7);
    if (!vacancesDe(config, cur)) idx++;
  }
  const anchorParity = sem.anchorParity || 'A';
  const parity = (idx % 2 === 0) ? anchorParity : (anchorParity === 'A' ? 'B' : 'A');
  return { status: 'ecole', parity };
}

// Parité simple (compat) — 'A' par défaut hors semaine de classe.
function weekParity(config, date = new Date()) {
  const s = weekStatus(config, date);
  return s.status === 'ecole' ? s.parity : 'A';
}

const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

function fmtDate(d) {
  const x = parseISO(d);
  return `${x.getDate()} ${MOIS[x.getMonth()]}`;
}

// « 22 juin – 26 juin » (lundi → vendredi de la semaine de `date`).
function rangeLabel(date = new Date()) {
  const m = mondayOf(date);
  const f = new Date(m); f.setDate(m.getDate() + 4);
  return `${m.getDate()} ${MOIS[m.getMonth()]} – ${f.getDate()} ${MOIS[f.getMonth()]}`;
}

function semaineLabel(semaine, parity) {
  if (!semaine) return parity;
  return parity === 'A' ? (semaine.labelA || 'A') : (semaine.labelB || 'B');
}

function semaineColor(semaine, parity) {
  if (parity === 'A') return semaine?.colorA || 'var(--sem-a)';
  return semaine?.colorB || 'var(--sem-b)';
}


// ───── lib/calendar.js ─────
// Génère la liste des semaines de l'année scolaire (avec leur statut A/B/Vacances),
// pour les vues Mois et Année de la consultation.


const MOIS_LONG = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const monthName = (i) => MOIS_LONG[i];

// Toutes les semaines (lundis) de la prérentrée à la fin de l'année.
function eachSchoolWeek(config) {
  const cal = config.calendrier || {};
  const start = mondayOf(parseISO(cal.prerentree || config.semaine.anchorMonday));
  const end = mondayOf(parseISO(cal.finAnnee || '2027-07-03'));
  const weeks = [];
  const cur = new Date(start);
  let guard = 0;
  while (cur <= end && guard < 80) {
    weeks.push({ monday: new Date(cur), ...weekStatus(config, cur) });
    cur.setDate(cur.getDate() + 7);
    guard++;
  }
  return weeks;
}

// Regroupe les semaines par mois (clé 'YYYY-MM') pour la vue Année.
function weeksByMonth(config) {
  const out = [];
  let curKey = null, bucket = null;
  for (const w of eachSchoolWeek(config)) {
    const key = `${w.monday.getFullYear()}-${w.monday.getMonth()}`;
    if (key !== curKey) {
      curKey = key;
      bucket = { year: w.monday.getFullYear(), month: w.monday.getMonth(), weeks: [] };
      out.push(bucket);
    }
    bucket.weeks.push(w);
  }
  return out;
}


// ───── lib/ics.js ─────
// Importateur .ics (Pronote / Index-Éducation) → événements de l'année.
// On ne garde que ce qui concerne les classes du périmètre (PSR + MELEC).


// Déplie les lignes (RFC 5545 : continuation = ligne commençant par espace/tab).
function parseICS(text) {
  const lines = String(text).split(/\r?\n/);
  const unf = [];
  for (const l of lines) {
    if (/^[ \t]/.test(l) && unf.length) unf[unf.length - 1] += l.slice(1);
    else unf.push(l);
  }
  const events = [];
  let cur = null;
  for (const l of unf) {
    if (l === 'BEGIN:VEVENT') cur = {};
    else if (l === 'END:VEVENT') { if (cur) events.push(cur); cur = null; }
    else if (cur) {
      const i = l.indexOf(':');
      if (i > 0) cur[l.slice(0, i).split(';')[0]] = l.slice(i + 1);
    }
  }
  return events;
}

function icsDate(v) {
  if (!v) return null;
  const m = v.match(/(\d{4})(\d{2})(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

// Tokens de classe utilisés par Pronote → ids de l'app.
const CLASS_MAP = { C1PSR: 'c1psr', C2PSR: 'c2psr', B1MELEC: 'b1melec', B2MELEC: 'b2melec', BTMELEC: 'btmelec' };
function matchClasse(summary) {
  const s = summary.replace(/\s/g, '').toUpperCase();
  for (const k in CLASS_MAP) if (s.includes(k)) return CLASS_MAP[k];
  return null;
}
function pfmpLabel(sum) {
  const m = sum.toUpperCase().match(/PFMP\s*([12Y]?)/);
  return m ? `PFMP${m[1] && m[1] !== 'Y' ? ' ' + m[1] : ''}` : 'PFMP';
}

// Convertit le texte .ics en liste d'événements (type/classe/dates/titre).
function icsToEvenements(text) {
  const out = [];
  for (const e of parseICS(text)) {
    const cat = e.CATEGORIES || '';
    const sum = (e.SUMMARY || '').replace(/\\,/g, ',').replace(/\\/g, '');
    const classe = matchClasse(sum);
    if (!classe) continue; // hors périmètre PSR/MELEC
    const debut = icsDate(e.DTSTART);
    const fin = icsDate(e.DTEND) || debut;
    if (!debut) continue;
    if (cat === 'Sessions de stage') out.push({ type: 'pfmp', classe, debut, fin, titre: pfmpLabel(sum) });
    else if (cat === 'Conseils de classe') out.push({ type: 'conseil', classe, debut, fin: debut, titre: 'Conseil' });
    else if (/BAC BLANC/i.test(cat)) out.push({ type: 'bacblanc', classe, debut, fin: debut, titre: 'Bac blanc' });
    else if (/Visites entreprise|Sortie/i.test(cat)) out.push({ type: 'sortie', classe, debut, fin: debut, titre: sum.slice(0, 40) });
  }
  // tri par date
  return out.sort((a, b) => a.debut.localeCompare(b.debut));
}

// Ouvre un sélecteur de fichier .ics et renvoie le texte.
function pickICS() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ics,text/calendar';
    input.onchange = () => {
      const f = input.files && input.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Lecture impossible'));
      reader.readAsText(f);
    };
    input.click();
  });
}


// ───── lib/firebase.js ─────
// Couche Firebase (messagerie AESH ↔ coordinateur).
// Utilise le SDK "compat" chargé en <script> classique dans index.html (global `firebase`).
// Projet : devoirs-pse · collection dédiée coordination_* (jamais les données élèves).
//
// ⚠️ À REMPLIR avant déploiement (les « codes » : apiKey, appId, messagingSenderId).
// Tant que la config n'est pas remplie, la messagerie s'affiche en mode « à configurer ».

const FIREBASE_CONFIG = {
  apiKey: 'A_REMPLIR',
  authDomain: 'devoirs-pse.firebaseapp.com',
  projectId: 'devoirs-pse',
  storageBucket: 'devoirs-pse.appspot.com',
  messagingSenderId: 'A_REMPLIR',
  appId: 'A_REMPLIR',
};

const COLLECTION = 'coordination_planning_messages';

function fbConfigured() {
  return FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.apiKey !== 'A_REMPLIR';
}
function fbAvailable() {
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

function sendMessage({ from, classe, text }) {
  const d = db();
  if (!d) return Promise.reject(new Error('Messagerie non configurée'));
  return d.collection(COLLECTION).add({
    from: (from || '?').slice(0, 12), classe: classe || '', text: String(text).slice(0, 1000),
    ts: Date.now(), lu: false,
  });
}

function subscribeMessages(cb) {
  const d = db();
  if (!d) { cb(null); return () => {}; } // null = non disponible
  try {
    return d.collection(COLLECTION).orderBy('ts', 'desc').limit(200)
      .onSnapshot((snap) => cb(snap.docs.map((x) => ({ id: x.id, ...x.data() }))));
  } catch (e) { console.warn(e); cb(null); return () => {}; }
}

function markRead(id) {
  const d = db();
  if (d) d.collection(COLLECTION).doc(id).update({ lu: true }).catch(() => {});
}

function deleteMessage(id) {
  const d = db();
  if (d) d.collection(COLLECTION).doc(id).delete().catch(() => {});
}


// ───── lib/io.js ─────
// Import / export — la « sauvegarde annuelle » sous forme de fichier JSON.


function exportJSON() {
  const state = getState();
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const annee = (state.annee || 'annee').replace(/\W+/g, '-');
  a.href = url;
  a.download = `coordination-psr-${annee}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importJSONFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || !Array.isArray(data.aesh) || !Array.isArray(data.seances))
          throw new Error('Fichier non reconnu (structure invalide).');
        replaceState(data);
        resolve(data);
      } catch (e) { reject(e); }
    };
    reader.onerror = () => reject(new Error('Lecture du fichier impossible.'));
    reader.readAsText(file);
  });
}

function triggerImport() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = () => {
      const f = input.files && input.files[0];
      if (f) importJSONFile(f).then(resolve).catch(reject);
    };
    input.click();
  });
}


// ───── components/shared.js ─────
// Petits composants réutilisables : jauge d'heures, avatar, puce AESH, toasts.


function Avatar({ avatar, initiales, color, size = 22 }) {
  const isEmoji = avatar && /\p{Extended_Pictographic}/u.test(avatar);
  return html`<span class="chip-avatar" style=${`background:${isEmoji ? 'transparent' : color};width:${size}px;height:${size}px;font-size:${size * (isEmoji ? 0.7 : 0.42)}px`}>${avatar || initiales}</span>`;
}

// Jeu d'avatars proposés (emoji neutres) + « aucun ».
const AVATARS = ['', '🦊', '🐼', '🦉', '🐺', '🦁', '🐯', '🐧', '🦅', '🌟', '🎯', '🧩', '📘', '🎓'];

// Jauge : réalisé / cible, couleur selon l'écart.
function HourMeter({ value, target, label, sub }) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  let cls = 'ok';
  if (target > 0) {
    if (value > target + 0.01) cls = 'danger';
    else if (value < target - 0.01) cls = 'warn';
  }
  return html`
    <div class="meter">
      <div class="meter-head">
        <span class="dim">${label}</span>
        <span class="meter-val">${fmt(value)} ${target ? html`<span class="muted">/ ${fmt(target)} h</span>` : 'h'}</span>
      </div>
      <div class="meter-bar"><div class=${'meter-fill ' + cls} style=${`width:${pct}%`}></div></div>
      ${sub ? html`<div class="muted" style="font-size:11px">${sub}</div>` : null}
    </div>`;
}

function fmt(n) {
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1).replace('.', ',');
}

// — Système de toasts global —
// action (optionnel) = { label, fn } : affiche un bouton (ex. « Annuler »).
let toastHandler = null;
function registerToast(fn) { toastHandler = fn; }
function toast(msg, kind = 'ok', action = null) { if (toastHandler) toastHandler(msg, kind, action); }


// ───── components/icons.js ─────
// Jeu d'icônes SVG inline (trait, héritage de la couleur courante).


const ico = (path, vb = '0 0 24 24') => (props = {}) => html`
  <svg class=${'ico ' + (props.class || '')} width=${props.size || 18} height=${props.size || 18}
       viewBox=${vb} fill="none" stroke="currentColor" stroke-width=${props.w || 1.8}
       stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;

const Icon = {
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


// ───── components/WeekControl.js ─────
// Contrôle Semaine A/B — switch animé + focus/transparence + semaine en cours.
// Lit/écrit l'état via le store ; réutilisé sur Classe et Affectation.





function WeekControl({ state, compact = false }) {
  const sem = state.config.semaine;
  const { weekMode, weekPriority } = state.config.ui;

  const modes = [
    { id: 'AB', label: 'A + B', ico: Icon.stack },
    { id: 'A', label: semaineLabel(sem, 'A'), ico: null, dot: semaineColor(sem, 'A') },
    { id: 'B', label: semaineLabel(sem, 'B'), ico: null, dot: semaineColor(sem, 'B') },
    { id: 'compare', label: 'Côte à côte', ico: Icon.columns },
  ];
  const idx = Math.max(0, modes.findIndex((m) => m.id === weekMode));
  const showFocus = weekMode === 'AB' || weekMode === 'compare';

  // Statut réel de la semaine en cours (tient compte des vacances / calendrier).
  const info = weekStatus(state.config);
  const enEcole = info.status === 'ecole';
  const curColor = enEcole ? semaineColor(sem, info.parity) : '#6e7a92';
  const chipTop = enEcole ? 'Cette semaine'
    : info.status === 'vacances' ? 'En ce moment'
    : info.status === 'avant' ? 'À venir' : 'Année terminée';
  const chipMain = enEcole ? `Semaine ${semaineLabel(sem, info.parity)}`
    : info.status === 'vacances' ? `Vacances · ${info.nom}`
    : info.status === 'avant' ? 'Avant la rentrée' : 'Après les cours';

  // Cycle de focus : aucun → A → B → aucun.
  const cycleFocus = () => {
    const next = weekPriority === null ? 'A' : weekPriority === 'A' ? 'B' : null;
    setWeekView({ priority: next });
  };

  return html`
    <div class=${'weekctl ' + (compact ? 'compact' : '')}>
      <!-- Semaine en cours (auto, calendrier) -->
      <button class=${'weekctl-now' + (enEcole ? '' : ' off')} style=${`--cw:${curColor}`}
        title=${enEcole ? 'Mettre la semaine en cours en avant' : 'Période hors cours'}
        onClick=${() => enEcole ? setWeekView({ mode: 'AB', priority: info.parity }) : setWeekView({ mode: 'AB' })}>
        <span class="weekctl-pulse"></span>
        <span class="weekctl-now-txt">
          <span class="muted">${chipTop}</span>
          <b>${chipMain}</b>
        </span>
        <span class="weekctl-range">${rangeLabel()}</span>
      </button>

      <!-- Switch de modes (slider animé) -->
      <div class="weekctl-modes" style=${`--idx:${idx};--n:${modes.length}`}>
        <span class=${'weekctl-slider m-' + weekMode}></span>
        ${modes.map((m) => html`
          <button class=${'weekctl-mode ' + (weekMode === m.id ? 'active' : '')}
            onClick=${() => setWeekView({ mode: m.id })}>
            ${m.dot ? html`<span class="dot" style=${`background:${m.dot}`}></span>` : (m.ico ? m.ico({ size: 15 }) : null)}
            <span class="weekctl-mode-lbl">${m.label}</span>
          </button>`)}
      </div>

      <!-- Focus / transparence -->
      ${showFocus ? html`
        <button class=${'weekctl-focus ' + (weekPriority ? 'on' : '')}
          style=${weekPriority ? `--fc:${semaineColor(sem, weekPriority)}` : ''}
          title="Mettre une semaine en avant (l'autre s'estompe)"
          onClick=${cycleFocus}>
          ${Icon.swap({ size: 15 })}
          <span>${weekPriority ? `Focus ${semaineLabel(sem, weekPriority)}` : 'Égal'}</span>
        </button>` : null}
    </div>`;
}


// ───── components/ScheduleGrid.js ─────
// Grille emploi du temps — vue classe et vue intervenant.
// Modes Semaine : 'AB' (fusion), 'A', 'B', 'compare' (côte à côte), + focus.
// Si editSeances : ajout/édition/déplacement des cours directement dans la grille.








function AeshPill({ aesh, seanceId, editable }) {
  const code = aesh.code || aesh.initiales || '?';
  const retirer = (e) => {
    e.stopPropagation();
    removeAffectation(aesh.id, seanceId);
    toast(`AESH ${code} retiré`, 'warn', { label: 'Annuler', fn: () => addAffectation(aesh.id, seanceId) });
  };
  return html`
    <span class="aesh-pill" style=${`background:${aesh.color}`} title=${`AESH ${code}`}>
      ${code}
      ${editable ? html`<button class="x" title="Retirer ce créneau" onClick=${retirer}>×</button>` : null}
    </span>`;
}

function Seance({ state, seance, editable, highlightAesh, faded, mini, editSeances, onEditSeance, onSlotClick }) {
  const disc = DISCIPLINES[seance.disc] || DISCIPLINES.autre;
  const sem = state.config.semaine;
  const aeshList = aeshDeSeance(state, seance.id);
  const cov = couvertureSeance(state, seance);
  const showCoverage = cov.attendu > 0 && !mini;

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dropzone');
    const sid = e.dataTransfer.getData('seanceId');
    if (sid) { if (sid !== seance.id) moveSeance(sid, seance.jour, seance.creneau); return; }
    if (!editable) return;
    const aeshId = e.dataTransfer.getData('aeshId');
    if (!aeshId) return;
    if (aeshList.some((a) => a.id === aeshId)) { toast('Déjà positionné ici', 'warn'); return; }
    addAffectation(aeshId, seance.id);
    const a = byId(state.aesh, aeshId);
    toast(`AESH ${a ? (a.code || a.initiales) : ''} positionné sur ${disc.court}`, 'ok');
  };

  return html`
    <div class=${'seance coverage-' + cov.statut + (faded ? ' faded' : '') + (mini ? ' mini' : '') + (editSeances ? ' editable' : '') + (onSlotClick ? ' clickable' : '')}
      style=${`--disc:${disc.color};--disc-soft:${disc.soft}`}
      draggable=${editSeances}
      onDragStart=${editSeances ? (e) => { e.dataTransfer.setData('seanceId', seance.id); e.dataTransfer.effectAllowed = 'move'; } : null}
      onDragOver=${(e) => { e.preventDefault(); e.currentTarget.classList.add('dropzone'); }}
      onDragLeave=${(e) => e.currentTarget.classList.remove('dropzone')}
      onDrop=${onDrop}
      onClick=${onSlotClick ? () => onSlotClick(seance) : (editSeances && onEditSeance ? () => onEditSeance(seance) : null)}>
      <div class="seance-head">
        <div class="seance-title">${disc.court}${editSeances ? html`<span class="seance-edit">${Icon.edit({ size: 12 })}</span>` : null}</div>
        <div class="seance-tags">
          ${seance.semaine !== 'AB' && !mini
            ? html`<span class="sem-tag" style=${`background:${hexFade(semaineColor(sem, seance.semaine))};color:${semaineColor(sem, seance.semaine)}`}>${semaineLabel(sem, seance.semaine)}</span>` : null}
          ${showCoverage ? html`
            <span class=${'coverage-badge ' + cov.statut} title=${`${cov.positionnes}/${cov.attendu} AESH positionné(s)`}>
              ${cov.label}
            </span>` : null}
        </div>
      </div>
      ${seance.salle ? html`<div class="seance-meta"><span class="seance-room">${/^\d/.test(seance.salle) ? 'Salle ' : ''}${seance.salle}</span></div>` : null}
      ${showCoverage && cov.statut !== 'covered' ? html`
        <div class="seance-need">${cov.attendu} AESH attendu${cov.attendu > 1 ? 's' : ''}</div>` : null}
      ${aeshList.length
        ? html`<div class="seance-aesh">
            ${aeshList.map((a) => html`<${AeshPill} aesh=${a} seanceId=${seance.id}
                editable=${editable && (!highlightAesh || highlightAesh === a.id)} />`)}
          </div>`
        : null}
      ${seance.remarque && !mini ? html`<div class="seance-note" title=${seance.remarque}>${Icon.pin({ size: 11 })} ${seance.remarque}</div>` : null}
    </div>`;
}

function CellContent({ state, seances, mode, priority, editable, highlightAesh, editSeances, onEditSeance, onSlotClick, onAddCell, jour, creneau }) {
  const sem = state.config.semaine;

  if (!seances.length) {
    if (editSeances && onAddCell) {
      return html`<button class="cell-add" title="Ajouter un cours" onClick=${() => onAddCell(jour, creneau)}>${Icon.plus({ size: 16 })}</button>`;
    }
    return html`<div class="cell-empty-hint">·</div>`;
  }

  const props = { state, editable, highlightAesh, editSeances, onEditSeance, onSlotClick };

  if (mode === 'compare') {
    const common = seances.filter((s) => s.semaine === 'AB');
    const aS = seances.filter((s) => s.semaine === 'A');
    const bS = seances.filter((s) => s.semaine === 'B');
    return html`
      ${common.map((se) => html`<${Seance} ...${props} seance=${se} />`)}
      ${(aS.length || bS.length) ? html`
        <div class="cmp">
          ${['A', 'B'].map((wk) => {
            const list = wk === 'A' ? aS : bS;
            return html`<div class="cmp-col">
              <div class="cmp-head" style=${`color:${semaineColor(sem, wk)};border-color:${semaineColor(sem, wk)}`}>${semaineLabel(sem, wk)}</div>
              ${list.length
                ? list.map((se) => html`<${Seance} ...${props} seance=${se} mini=${true} />`)
                : html`<div class="cmp-empty">—</div>`}
            </div>`;
          })}
        </div>` : null}`;
  }

  return seances.map((se) => {
    const faded = mode === 'AB' && priority && se.semaine !== 'AB' && se.semaine !== priority;
    return html`<${Seance} ...${props} seance=${se} faded=${faded} />`;
  });
}

function visibleSeances(state, list, jour, creneauId, mode) {
  const want = mode === 'A' ? 'A' : mode === 'B' ? 'B' : 'AB';
  return list.filter((s) => {
    if (s.jour !== jour || s.creneau !== creneauId) return false;
    if (want === 'AB') return true;
    return s.semaine === 'AB' || s.semaine === want;
  });
}

function ScheduleGrid({ state, classeId, aeshId, mode = 'AB', priority = null, editable = true, editSeances = false, onAddCell, onEditSeance, onSlotClick }) {
  let pool;
  if (classeId) pool = state.seances.filter((s) => s.classe === classeId);
  else if (aeshId) {
    const ids = new Set(state.affectations.filter((a) => a.aesh === aeshId).map((a) => a.seance));
    pool = state.seances.filter((s) => ids.has(s.id));
  } else pool = [];

  // Déplacement d'un cours déposé sur une partie vide de la cellule.
  const cellDrop = (jour, creneau) => (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dropzone');
    const sid = e.dataTransfer.getData('seanceId');
    if (sid) moveSeance(sid, jour, creneau);
  };

  return html`
    <div class="edt-scroll">
    <div class=${'edt mode-' + mode}>
      <div class="edt-corner"></div>
      ${JOURS.map((j) => html`<div class="edt-day">${j.label}</div>`)}
      ${CRENEAUX.map((c) => {
        if (c.pause) {
          return html`
            <div class="edt-time pause">pause</div>
            ${JOURS.map(() => html`<div class="edt-cell pause-row"></div>`)}`;
        }
        return html`
          <div class="edt-time">${c.debut}<br/>${c.fin}</div>
          ${JOURS.map((j) => {
            const seances = visibleSeances(state, pool, j.id, c.id, mode);
            return html`<div class="edt-cell"
              onDragOver=${editSeances ? (e) => { e.preventDefault(); e.currentTarget.classList.add('dropzone'); } : null}
              onDragLeave=${editSeances ? (e) => e.currentTarget.classList.remove('dropzone') : null}
              onDrop=${editSeances ? cellDrop(j.id, c.id) : null}>
              <${CellContent} state=${state} seances=${seances} mode=${mode} priority=${priority}
                editable=${editable} highlightAesh=${aeshId}
                editSeances=${editSeances} onEditSeance=${onEditSeance} onSlotClick=${onSlotClick} onAddCell=${onAddCell}
                jour=${j.id} creneau=${c.id} />
            </div>`;
          })}`;
      })}
    </div>
    </div>`;
}

function hexFade(c) {
  if (typeof c === 'string' && c[0] === '#' && c.length === 7) {
    const r = parseInt(c.slice(1, 3), 16), g = parseInt(c.slice(3, 5), 16), b = parseInt(c.slice(5, 7), 16);
    return `rgba(${r},${g},${b},0.16)`;
  }
  return 'var(--surface-3)';
}


// ───── components/SeanceModal.js ─────
// Modale d'édition d'une séance (cours) : matière, enseignant(s), salle, semaine.
// Sert à créer un nouveau cours ou à modifier/supprimer un cours existant.






let _newId = 0;
const makeId = () => `se-${Date.now().toString(36)}-${_newId++}`;

function SeanceModal({ state, draft, onClose }) {
  const isNew = !draft.id;
  const [disc, setDisc] = useState(draft.disc || 'pole1');
  const [profs, setProfs] = useState(draft.profs ? [...draft.profs] : []);
  const [salle, setSalle] = useState(draft.salle || '');
  const [semaine, setSemaine] = useState(draft.semaine || 'AB');
  const [besoinAesh, setBesoinAesh] = useState(Number.isFinite(Number(draft.besoinAesh)) ? Number(draft.besoinAesh) : 1);
  const sem = state.config.semaine;

  const cr = creneauById(draft.creneau);
  const toggleProf = (id) => setProfs((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const save = () => {
    const seance = {
      id: draft.id || makeId(),
      classe: draft.classe, jour: draft.jour, creneau: draft.creneau,
      disc, profs, salle: salle.trim(), semaine, besoinAesh,
    };
    upsertSeance(seance);
    toast(isNew ? 'Cours ajouté' : 'Cours modifié');
    onClose();
  };

  const del = () => { removeSeance(draft.id); toast('Cours supprimé', 'warn'); onClose(); };

  // Enseignants suggérés en premier (ceux qui enseignent cette discipline).
  const ens = [...state.enseignants].sort((a, b) => {
    const aw = (a.disc || []).includes(disc) ? 0 : 1;
    const bw = (b.disc || []).includes(disc) ? 0 : 1;
    return aw - bw;
  });

  return html`
    <div class="overlay" onClick=${onClose}>
      <div class="modal" onClick=${(e) => e.stopPropagation()}>
        <div class="modal-head">
          <div>
            <h2>${isNew ? 'Ajouter un cours' : 'Modifier le cours'}</h2>
            <div class="muted" style="font-size:12px;margin-top:2px">
              ${jourById(draft.jour)?.label} · ${cr?.debut}–${cr?.fin}
            </div>
          </div>
          <button class="btn icon ghost" onClick=${onClose}>${Icon.x({ size: 18 })}</button>
        </div>

        <div class="modal-body">
          <div class="field">
            <label>Matière</label>
            <select class="select" value=${disc} onChange=${(e) => setDisc(e.target.value)}>
              ${Object.entries(DISCIPLINES).map(([k, v]) => html`<option value=${k} selected=${k === disc}>${v.label}</option>`)}
            </select>
          </div>

          <div class="field">
            <label>Enseignant(s) — usage interne, non affiché dans la grille</label>
            <div class="row wrap gap-2">
              ${ens.map((e) => html`
                <button class=${'pick ' + (profs.includes(e.id) ? 'on' : '')}
                  onClick=${() => toggleProf(e.id)}>
                  ${profs.includes(e.id) ? Icon.check({ size: 13 }) : null} ${e.nom}
                </button>`)}
            </div>
          </div>

          <div class="grid grid-2" style="gap:16px">
            <div class="field">
              <label>Salle</label>
              <input class="input" value=${salle} placeholder="ex. 008"
                onInput=${(e) => setSalle(e.target.value)} />
            </div>
            <div class="field">
              <label>Semaine</label>
              <div class="seg">
                <button class=${semaine === 'AB' ? 'active both' : ''} onClick=${() => setSemaine('AB')}>A + B</button>
                <button class=${semaine === 'A' ? 'active a' : ''} onClick=${() => setSemaine('A')}>${sem.labelA}</button>
                <button class=${semaine === 'B' ? 'active b' : ''} onClick=${() => setSemaine('B')}>${sem.labelB}</button>
              </div>
            </div>
          </div>

          <div class="field">
            <label>Besoin AESH attendu</label>
            <div class="seg">
              ${[0, 1, 2].map((n) => html`
                <button class=${besoinAesh === n ? 'active both' : ''} onClick=${() => setBesoinAesh(n)}>
                  ${n === 0 ? 'Aucun' : `${n} AESH`}
                </button>`)}
            </div>
            <div class="muted" style="font-size:12px">
              Donnée anonyme : on indique le volume d'accompagnement attendu sur le créneau, sans nom d'élève.
            </div>
          </div>
        </div>

        <div class="modal-foot">
          ${!isNew ? html`<button class="btn danger" style="margin-right:auto" onClick=${del}>${Icon.trash({ size: 15 })} Supprimer</button>` : null}
          <button class="btn ghost" onClick=${onClose}>Annuler</button>
          <button class="btn primary" onClick=${save}>${Icon.check({ size: 15 })} ${isNew ? 'Ajouter' : 'Enregistrer'}</button>
        </div>
      </div>
    </div>`;
}


// ───── components/EvenementModal.js ─────
// Modale d'édition d'un événement de l'année : PFMP, CCF, conseil, bac blanc…






let _n = 0;
const makeEvId = () => `ev-${Date.now().toString(36)}-${_n++}`;

function EvenementModal({ state, draft, onClose }) {
  const isNew = !draft.id;
  const [type, setType] = useState(draft.type || 'pfmp');
  const [classe, setClasse] = useState(draft.classe || (state.classes[0] && state.classes[0].id));
  const [titre, setTitre] = useState(draft.titre || '');
  const [debut, setDebut] = useState(draft.debut || '');
  const [fin, setFin] = useState(draft.fin || draft.debut || '');
  const [hDebut, setHDebut] = useState(draft.heureDebut || '');
  const [hFin, setHFin] = useState(draft.heureFin || '');
  const isRange = EVENT_TYPES[type]?.range;

  const save = () => {
    if (!debut) { toast('Indiquez une date', 'warn'); return; }
    upsertEvenement({
      id: draft.id || makeEvId(), type, classe,
      titre: titre.trim(), debut, fin: isRange ? (fin || debut) : debut,
      heureDebut: hDebut || '', heureFin: hFin || '',
      previsionnel: draft.previsionnel || false,
    });
    toast(isNew ? 'Événement ajouté' : 'Événement modifié');
    onClose();
  };
  const del = () => { removeEvenement(draft.id); toast('Événement supprimé', 'warn'); onClose(); };

  return html`
    <div class="overlay" onClick=${onClose}>
      <div class="modal" onClick=${(e) => e.stopPropagation()}>
        <div class="modal-head">
          <h2>${isNew ? 'Ajouter un événement' : 'Modifier l\'événement'}</h2>
          <button class="btn icon ghost" onClick=${onClose}>${Icon.x({ size: 18 })}</button>
        </div>
        <div class="modal-body">
          <div class="field">
            <label>Type</label>
            <div class="row wrap gap-2">
              ${Object.entries(EVENT_TYPES).map(([k, v]) => html`
                <button class=${'pick ' + (type === k ? 'on' : '')} onClick=${() => setType(k)}>
                  <span class="dot" style=${`background:${v.color}`}></span> ${v.court}
                </button>`)}
            </div>
          </div>
          <div class="grid grid-2" style="gap:16px">
            <div class="field">
              <label>Classe</label>
              <select class="select" value=${classe} onChange=${(e) => setClasse(e.target.value)}>
                ${state.classes.map((c) => html`<option value=${c.id} selected=${c.id === classe}>${c.nom}</option>`)}
              </select>
            </div>
            <div class="field">
              <label>Intitulé (optionnel)</label>
              <input class="input" value=${titre} placeholder=${EVENT_TYPES[type]?.court}
                onInput=${(e) => setTitre(e.target.value)} />
            </div>
          </div>
          <div class="grid grid-2" style="gap:16px">
            <div class="field">
              <label>${isRange ? 'Début' : 'Date'}</label>
              <input class="input" type="date" value=${debut} onInput=${(e) => setDebut(e.target.value)} />
            </div>
            ${isRange ? html`<div class="field">
              <label>Fin</label>
              <input class="input" type="date" value=${fin} onInput=${(e) => setFin(e.target.value)} />
            </div>` : null}
          </div>
          <div class="field">
            <label>Créneau horaire (optionnel · par demi-heure)</label>
            <div class="row gap-2">
              <input class="input" type="time" step="1800" value=${hDebut} onInput=${(e) => setHDebut(e.target.value)} style="width:120px" />
              <span class="muted">→</span>
              <input class="input" type="time" step="1800" value=${hFin} onInput=${(e) => setHFin(e.target.value)} style="width:120px" />
              ${(hDebut || hFin) ? html`<button class="btn sm ghost" onClick=${() => { setHDebut(''); setHFin(''); }}>Effacer</button>` : null}
            </div>
            <div class="muted" style="font-size:11.5px">Ex. 08:00→09:00, 08:30→09:00, 08:30→09:30… s'affiche sur l'événement.</div>
          </div>
        </div>
        <div class="modal-foot">
          ${!isNew ? html`<button class="btn danger" style="margin-right:auto" onClick=${del}>${Icon.trash({ size: 15 })} Supprimer</button>` : null}
          <button class="btn ghost" onClick=${onClose}>Annuler</button>
          <button class="btn primary" onClick=${save}>${Icon.check({ size: 15 })} ${isNew ? 'Ajouter' : 'Enregistrer'}</button>
        </div>
      </div>
    </div>`;
}


// ───── components/AeshPalette.js ─────
// Palette d'AESH déplaçables — barre latérale de la page Affectation.
// Chaque puce affiche le volume d'heures restant, et se glisse sur une séance.




function AeshPalette({ state, activeId, onSelect }) {
  return html`
    <div class="card pad-sm palette">
      <div class="spread">
        <span class="card-eyebrow">Intervenants AESH</span>
        <span class="badge">${state.aesh.length}</span>
      </div>
      <div class="palette-aesh">
        ${state.aesh.map((a) => {
          const b = bilanAesh(state, a.id);
          const reste = b.cible - b.total;
          let etat = 'ok';
          if (reste < -0.01) etat = 'danger'; else if (reste > 0.01) etat = 'warn';
          return html`
            <div class=${'card pad-sm ' + (activeId === a.id ? 'active-aesh' : '')}
              style=${`cursor:grab;border-color:${activeId === a.id ? a.color : 'var(--border)'};padding:11px`}
              draggable=${true}
              onDragStart=${(e) => { e.dataTransfer.setData('aeshId', a.id); e.dataTransfer.effectAllowed = 'copy'; }}
              onClick=${() => onSelect && onSelect(a.id)}>
              <div class="row" style="margin-bottom:8px">
                <${Avatar} initiales=${a.initiales} color=${a.color} size=${28} />
                <div class="grow">
                  <div style="font-weight:650;font-size:13px">${a.nom}</div>
                  <div class="muted" style="font-size:11px">cible ${fmt(a.volumeCible)} h / semaine</div>
                </div>
                <span class=${'badge ' + etat}>
                  ${reste > 0.01 ? `${fmt(reste)} h à placer` : reste < -0.01 ? `+${fmt(-reste)} h` : 'complet'}
                </span>
              </div>
              <${HourMeter} value=${b.total} target=${b.cible} label="Service total" />
            </div>`;
        })}
      </div>
      <div class="muted" style="font-size:11px;padding:4px 2px">
        Glissez une carte sur un créneau de la grille pour positionner l'AESH.
      </div>
    </div>`;
}


// ───── components/AeshScheduleEditor.js ─────
// Éditeur du planning d'UN intervenant — on coche/décoche les cours qu'il accompagne,
// sur tous les jours et toutes les classes, avec détection de conflit en direct.








function SeanceToggle({ state, aesh, seance }) {
  const disc = DISCIPLINES[seance.disc] || DISCIPLINES.autre;
  const classe = byId(state.classes, seance.classe);
  const assigned = estAffecte(state, aesh.id, seance.id);
  const conflits = assigned ? [] : aeshOccupeAt(state, aesh.id, seance.jour, seance.creneau, seance.semaine, seance.id);
  const conflit = conflits.length > 0;
  const sem = state.config.semaine;
  const cov = couvertureSeance(state, seance);

  const click = () => {
    if (assigned) {
      removeAffectation(aesh.id, seance.id);
      toast(`Retiré de ${disc.court}`, 'warn', { label: 'Annuler', fn: () => addAffectation(aesh.id, seance.id) });
    } else if (conflit) {
      const c = conflits[0]; const cd = DISCIPLINES[c.disc];
      toast(`Conflit : déjà sur ${cd ? cd.court : 'un cours'} à ce créneau`, 'warn');
    } else {
      addAffectation(aesh.id, seance.id);
    }
  };

  return html`
    <button class=${'sch-cell ' + (assigned ? 'on' : conflit ? 'conflit' : 'off')}
      style=${assigned ? `--disc:${aesh.color}` : `--disc:${disc.color}`}
      title=${conflit ? 'Conflit d\'horaire' : (assigned ? 'Cliquer pour retirer' : 'Cliquer pour affecter')}
      onClick=${click}>
      <span class="sch-cell-top">
        <b>${disc.court}</b>
        ${seance.semaine !== 'AB' ? html`<span class="sch-sem" style=${`color:${semaineColor(sem, seance.semaine)}`}>${semaineLabel(sem, seance.semaine)}</span>` : null}
      </span>
      <span class="sch-cell-sub">${classe ? classe.nom : ''}${seance.salle ? ' · ' + seance.salle : ''}</span>
      ${cov.attendu > 0 ? html`<span class=${'sch-need ' + cov.statut}>${cov.label} AESH</span>` : null}
      <span class="sch-mark">${assigned ? Icon.check({ size: 13 }) : conflit ? Icon.alert({ size: 12 }) : Icon.plus({ size: 13 })}</span>
    </button>`;
}

function AeshScheduleEditor({ state, aeshId, onClose }) {
  const aesh = byId(state.aesh, aeshId);
  if (!aesh) return null;
  const b = bilanAesh(state, aeshId);
  const reste = b.cible - b.total;

  return html`
    <div class="overlay" onClick=${onClose}>
      <div class="modal modal-wide" onClick=${(e) => e.stopPropagation()}>
        <div class="modal-head">
          <div class="row gap-2">
            <span class="aesh-pill" style=${`background:${aesh.color};font-size:13px`}>${aesh.code || aesh.initiales}</span>
            <div>
              <h2>Composer le planning</h2>
              <div class="muted" style="font-size:12px">Cochez les cours accompagnés — les conflits sont signalés</div>
            </div>
          </div>
          <div class="row gap-2">
            <span class=${'badge ' + (Math.abs(reste) < 0.01 ? 'ok' : reste > 0 ? 'warn' : 'danger')}>
              ${fmt(b.total)} / ${fmt(b.cible)} h ${reste > 0.01 ? `· ${fmt(reste)} à placer` : reste < -0.01 ? `· +${fmt(-reste)}` : ''}
            </span>
            <button class="btn icon ghost" onClick=${onClose}>${Icon.x({ size: 18 })}</button>
          </div>
        </div>
        <div class="modal-body" style="padding:14px">
          <div class="sch-grid">
            <div class="sch-corner"></div>
            ${JOURS.map((j) => html`<div class="sch-day">${j.court}</div>`)}
            ${CRENEAUX.filter((c) => !c.pause).map((c) => html`
              <div class="sch-time">${c.debut}<br/>${c.fin}</div>
              ${JOURS.map((j) => {
                const seances = state.seances.filter((s) => s.jour === j.id && s.creneau === c.id);
                return html`<div class="sch-slot">
                  ${seances.length
                    ? seances.map((s) => html`<${SeanceToggle} state=${state} aesh=${aesh} seance=${s} />`)
                    : html`<span class="sch-empty"></span>`}
                </div>`;
              })}`)}
          </div>
        </div>
        <div class="modal-foot">
          <span class="muted" style="margin-right:auto;font-size:12px">${Icon.sparkle({ size: 13 })} Vert = accompagné · gris = libre · rouge = conflit d'horaire</span>
          <button class="btn primary" onClick=${onClose}>${Icon.check({ size: 15 })} Terminé</button>
        </div>
      </div>
    </div>`;
}


// ───── components/SlotInspector.js ─────
// Panneau de créneau — cockpit coordinateur.
// On clique un créneau de la grille ; ce panneau latéral s'ouvre pour piloter
// l'accompagnement AESH DE CE CRÉNEAU : besoin attendu, AESH positionnés +
// type d'accompagnement, ajout (avec conflit/heures restantes), couverture, remarque.
// Étape 1 : reste sur le modèle hebdomadaire (pas encore d'exception datée).








function SlotInspector({ state, seance, onClose }) {
  const disc = DISCIPLINES[seance.disc] || DISCIPLINES.autre;
  const cr = creneauById(seance.creneau);
  const classe = byId(state.classes, seance.classe);
  const sem = state.config.semaine;
  const cov = couvertureSeance(state, seance);

  // AESH déjà positionnés sur ce créneau, avec leur type d'accompagnement.
  const affectes = state.affectations
    .filter((a) => a.seance === seance.id)
    .map((a) => ({ aff: a, aesh: byId(state.aesh, a.aesh) }))
    .filter((x) => x.aesh);
  const affectedIds = new Set(affectes.map((x) => x.aesh.id));

  // AESH disponibles à ajouter, triés par heures restantes (les plus disponibles en premier).
  const disponibles = state.aesh
    .filter((a) => !affectedIds.has(a.id))
    .map((a) => {
      const b = bilanAesh(state, a.id);
      const conflit = aeshOccupeAt(state, a.id, seance.jour, seance.creneau, seance.semaine, seance.id);
      return { aesh: a, reste: b.cible - b.total, conflit };
    })
    .sort((x, y) => y.reste - x.reste);

  const [remarque, setRemarque] = useState(seance.remarque || '');
  // On lit la valeur du champ au moment du blur (évite toute valeur périmée).
  const saveRemarque = (e) => { const v = (e.target.value || '').trim(); if ((seance.remarque || '') !== v) setSeanceRemarque(seance.id, v); };

  const covClass = cov.statut === 'covered' ? 'ok' : cov.statut === 'partial' ? 'info' : cov.statut === 'missing' ? 'warn' : '';
  const covLabel = cov.attendu <= 0 ? 'Aucun besoin'
    : cov.statut === 'covered' ? 'Couvert'
    : cov.statut === 'partial' ? `Partiel · ${cov.manquants} manquant${cov.manquants > 1 ? 's' : ''}`
    : 'Non couvert';

  const ajouter = (a) => {
    addAffectation(a.id, seance.id, TYPE_ACCOMP_DEFAUT);
    toast(`AESH ${a.code || a.initiales} positionné`, 'ok', { label: 'Annuler', fn: () => removeAffectation(a.id, seance.id) });
  };
  const retirer = (a) => {
    removeAffectation(a.id, seance.id);
    toast(`AESH ${a.code || a.initiales} retiré`, 'warn', { label: 'Annuler', fn: () => addAffectation(a.id, seance.id) });
  };

  return html`
    <div class="drawer-scrim" onClick=${onClose}></div>
    <aside class="drawer" onClick=${(e) => e.stopPropagation()}>
      <div class="drawer-head">
        <div class="row gap-2" style="align-items:center;min-width:0">
          <span class="drawer-disc" style=${`background:${disc.color}`}></span>
          <div style="min-width:0">
            <h2 style="font-size:16px;margin:0">${disc.label}</h2>
            <div class="muted" style="font-size:12px">
              ${classe ? classe.nom + ' · ' : ''}${jourById(seance.jour)?.label} · ${cr?.debut}–${cr?.fin}${seance.salle ? ' · salle ' + seance.salle : ''}${seance.semaine !== 'AB' ? ' · sem. ' + semaineLabel(sem, seance.semaine) : ''}
            </div>
          </div>
        </div>
        <button class="btn icon ghost" onClick=${onClose}>${Icon.x({ size: 18 })}</button>
      </div>

      <div class="drawer-body">
        <div class="field">
          <label>Besoin en AESH sur ce créneau</label>
          <div class="seg">
            ${[0, 1, 2, 3, 4].map((n) => html`
              <button class=${cov.attendu === n ? 'active both' : ''} onClick=${() => setBesoinAesh(seance.id, n)}>
                ${n === 0 ? 'Aucun' : n}
              </button>`)}
          </div>
          <div class="row gap-2" style="margin-top:8px;align-items:center">
            <span class=${'badge ' + covClass}>${covLabel}</span>
            <span class="muted" style="font-size:12px">${cov.positionnes}/${cov.attendu} positionné(s)</span>
          </div>
        </div>

        <div class="field">
          <label>AESH positionnés · type d'accompagnement</label>
          ${affectes.length ? html`
            <div class="col gap-2">
              ${affectes.map(({ aff, aesh }) => html`
                <div class="slot-aesh">
                  <span class="aesh-pill" style=${`background:${aesh.color}`}>${aesh.code || aesh.initiales}</span>
                  <select class="select slot-type" value=${aff.type || TYPE_ACCOMP_DEFAUT}
                    onChange=${(e) => setAffectationType(aesh.id, seance.id, e.target.value)}>
                    ${Object.entries(TYPES_ACCOMPAGNEMENT).map(([k, v]) => html`
                      <option value=${k} selected=${k === (aff.type || TYPE_ACCOMP_DEFAUT)}>${v.label}</option>`)}
                  </select>
                  <button class="btn icon ghost" title="Retirer ce créneau" onClick=${() => retirer(aesh)}>${Icon.x({ size: 15 })}</button>
                </div>`)}
            </div>` : html`<div class="muted" style="font-size:12.5px">Aucun AESH positionné pour l'instant.</div>`}
        </div>

        <div class="field">
          <label>Ajouter un AESH</label>
          <div class="col gap-2">
            ${disponibles.map(({ aesh, reste, conflit }) => html`
              <button class=${'slot-add' + (conflit.length ? ' has-conflit' : '')} onClick=${() => ajouter(aesh)}>
                <span class="aesh-pill" style=${`background:${aesh.color}`}>${aesh.code || aesh.initiales}</span>
                <span class="slot-add-info">
                  ${conflit.length
                    ? html`<span class="conflit"><span class="ic">${Icon.alert({ size: 13 })}</span> déjà occupé ce créneau</span>`
                    : html`<span class="muted">${fmt(Math.max(0, reste))} h restantes${reste < -0.01 ? ' · dépassé' : ''}</span>`}
                </span>
                <span class="plus">${Icon.plus({ size: 15 })}</span>
              </button>`)}
            ${!disponibles.length ? html`<div class="muted" style="font-size:12.5px">Tous les AESH sont déjà positionnés ici.</div>` : null}
          </div>
        </div>

        <div class="field">
          <label>Remarque (facultatif)</label>
          <textarea class="input" rows="2" placeholder="ex. accompagnement renforcé ce jour, matériel spécifique…"
            value=${remarque} onInput=${(e) => setRemarque(e.target.value)} onBlur=${saveRemarque}></textarea>
        </div>
      </div>
    </aside>`;
}


// ───── pages/Dashboard.js ─────
// Page Tableau de bord — vue d'ensemble : KPI, alertes, état des AESH et classes.







function Stat({ icon, value, label, foot, tone }) {
  return html`
    <div class="card stat">
      <div class="row" style="justify-content:space-between">
        <div class="stat-ico" style=${tone ? `background:${tone}22;color:${tone}` : ''}>${icon}</div>
      </div>
      <div class="stat-value">${value}</div>
      <div class="stat-label">${label}</div>
      ${foot ? html`<div class="stat-foot">${foot}</div>` : null}
    </div>`;
}

function Dashboard({ state }) {
  const t = totauxGeneraux(state);
  const alerts = alertsSummary(state);
  const cov = couvertureBesoins(state);

  return html`
    <div class="page-header">
      <h1 class="page-title">Tableau de bord</h1>
      <div class="page-desc">Coordination PSR & MELEC · année ${state.annee} · besoins, couverture et volumes en temps réel</div>
    </div>

    <div class="grid grid-4" style="margin-bottom:24px">
      <${Stat} icon=${Icon.users({size:20})} value=${state.aesh.length} label="AESH coordonnés"
        foot=${`${state.enseignants.length} enseignants · ${state.classes.length} classes`} tone="#7c8cff" />
      <${Stat} icon=${Icon.clock({size:20})} value=${fmt(t.totalServiceH) + ' h'} label="Service hebdo positionné"
        foot=${`dont ${fmt(t.totalAffecteH)} h en classe · ${fmt(t.totalHorsH)} h hors-classe`} tone="#3ecf8e" />
      <${Stat} icon=${Icon.check({size:20})} value=${cov.percent + ' %'} label="Besoins couverts"
        foot=${`${cov.coveredSlots}/${cov.expectedSlots} créneaux · ${fmt(cov.coveredHours)} / ${fmt(cov.expectedHours)} h attendues`} tone=${cov.missingSlots ? '#b5670a' : '#138a52'} />
      <${Stat} icon=${Icon.alert({size:20})} value=${alerts.total} label="Alertes à traiter"
        foot=${`${alerts.danger} bloquantes · ${alerts.warn} à surveiller`}
        tone=${alerts.danger ? '#f76d6d' : alerts.warn ? '#f5b14c' : '#3ecf8e'} />
    </div>

    <div class="grid" style="grid-template-columns:1.3fr 1fr;align-items:start">
      <!-- Colonne gauche : alertes -->
      <div class="card">
        <div class="spread" style="margin-bottom:16px">
          <h2>${Icon.alert({size:16})} Alertes de coordination</h2>
          <span class="badge ${alerts.danger ? 'danger' : alerts.warn ? 'warn' : 'ok'}">${alerts.total}</span>
        </div>
        ${alerts.all.length === 0
          ? html`<div class="empty"><div class="empty-ico">✓</div>Aucune incohérence détectée.</div>`
          : html`<div class="col gap-2">
              ${alerts.all.slice(0, 8).map((al) => html`
                <div class=${'alert ' + al.sev}>
                  <span class="alert-ico">${Icon.alert({size:16})}</span>
                  <div class="grow">
                    <div class="alert-title">${al.title}</div>
                    <div class="alert-desc">${al.desc}</div>
                  </div>
                  <span class="badge">${al.cat}</span>
                </div>`)}
              ${alerts.all.length > 8 ? html`<div class="muted center" style="font-size:12px;padding-top:6px">+ ${alerts.all.length - 8} autres…</div>` : null}
            </div>`}
      </div>

      <!-- Colonne droite : AESH + classes -->
      <div class="col gap-4">
        <div class="card">
          <h2 style="margin-bottom:14px">${Icon.users({size:16})} Charge des AESH</h2>
          <div class="col gap-4">
            ${state.aesh.map((a) => {
              const b = bilanAesh(state, a.id);
              return html`
                <div class="row" style="cursor:pointer" onClick=${() => navigate(`/aesh/${a.id}`)}>
                  <${Avatar} initiales=${a.initiales} color=${a.color} size=${30} />
                  <div class="grow">
                    <${HourMeter} value=${b.total} target=${b.cible} label=${a.nom} />
                  </div>
                </div>`;
            })}
          </div>
        </div>

        <div class="card">
          <h2 style="margin-bottom:14px">${Icon.grid({size:16})} Classes</h2>
          <div class="col gap-2">
            ${state.classes.map((c) => {
              const cc = couvertureClasse(state, c.id);
              return html`
              <div class="row spread" style="cursor:pointer;padding:6px 0" onClick=${() => navigate(`/classe/${c.id}`)}>
                <div class="row">
                  <span class="dot" style=${`background:${c.color}`}></span>
                  <div>
                    <div style="font-weight:650">${c.nom}</div>
                    <div class="muted" style="font-size:11px">${c.niveau} · ${c.effectif} élèves</div>
                  </div>
                </div>
                <span class=${'badge ' + (cc.missingSlots ? 'warn' : 'ok')}>${cc.percent}% besoins</span>
                <span class="badge accent">${fmt(heuresClasse(state, c.id))} h AESH</span>
              </div>`;
            })}
          </div>
        </div>
      </div>
    </div>`;
}


// ───── pages/ClasseView.js ─────
// Page Classe — emploi du temps d'une classe, éditeur de cours, Semaine A/B.










function ClasseView({ state, params, readOnly = false }) {
  const classeId = params.id || (state.classes[0] && state.classes[0].id);
  const classe = byId(state.classes, classeId);
  const { weekMode, weekPriority } = state.config.ui;
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(null); // séance en cours d'édition (modale)
  const canEdit = !readOnly && editMode;

  if (!classe) return html`<div class="empty">Classe introuvable.</div>`;
  const couverture = couvertureClasse(state, classeId);

  const openAdd = (jour, creneau) => setDraft({ classe: classeId, jour, creneau, disc: 'pole1', profs: [], salle: '', semaine: 'AB' });
  const openEdit = (seance) => setDraft(seance);

  // Disciplines réellement présentes (pour la légende).
  const discPresentes = [...new Set(state.seances.filter((s) => s.classe === classeId).map((s) => s.disc))];

  return html`
    <div class="page-header">
      <div class="spread wrap gap-4">
        <div class="row gap-4 wrap">
          <div class="seg">
            ${state.classes.map((c) => html`
              <button class=${c.id === classeId ? 'active both' : ''} onClick=${() => navigate(`/classe/${c.id}`)}>${c.nom}</button>`)}
          </div>
          <div>
            <h1 class="page-title">${classe.nom}</h1>
            <div class="page-desc">${classe.niveau} · ${classe.effectif} élèves · ${fmt(heuresClasse(state, classeId))} h positionnées · ${couverture.percent}% des besoins couverts</div>
          </div>
        </div>
        <div class="row gap-2 wrap">
          <span class=${'badge ' + (couverture.missingSlots ? 'warn' : 'ok')}>${couverture.coveredSlots}/${couverture.expectedSlots} créneaux couverts</span>
          <span class="badge accent">${fmt(couverture.coveredHours)} / ${fmt(couverture.expectedHours)} h attendues</span>
        </div>
      </div>
      <div class="spread wrap gap-4" style="margin-top:16px">
        <${WeekControl} state=${state} />
        ${readOnly ? null : html`
          <button class=${'btn ' + (editMode ? 'primary' : '')} onClick=${() => setEditMode((v) => !v)}>
            ${editMode ? Icon.check({ size: 15 }) : Icon.edit({ size: 15 })}
            ${editMode ? 'Terminer l\'édition' : 'Modifier les cours'}
          </button>`}
      </div>
    </div>

    ${canEdit ? html`
      <div class="alert info" style="margin-bottom:14px">
        <span class="alert-ico">${Icon.edit({ size: 16 })}</span>
        <div><div class="alert-title">Mode édition des cours</div>
        <div class="alert-desc">Cliquez une case vide pour ajouter un cours · cliquez un cours pour le modifier · glissez-le pour le déplacer.</div></div>
      </div>` : null}

    <${ScheduleGrid} state=${state} classeId=${classeId} mode=${weekMode} priority=${weekPriority}
      editable=${!readOnly} editSeances=${canEdit}
      onAddCell=${readOnly ? null : openAdd} onEditSeance=${readOnly ? null : openEdit} />

    ${!readOnly && draft ? html`<${SeanceModal} state=${state} draft=${draft} onClose=${() => setDraft(null)} />` : null}

    <div class="card pad-sm" style="margin-top:20px">
      <div class="row wrap gap-4">
        <span class="card-eyebrow">Disciplines</span>
        ${discPresentes.map((d) => {
          const disc = DISCIPLINES[d] || DISCIPLINES.autre;
          return html`<span class="row gap-2" style="font-size:12px">
            <span class="dot" style=${`background:${disc.color}`}></span>${disc.label}</span>`;
        })}
      </div>
    </div>

    ${readOnly ? null : html`
      <div class="row gap-4" style="margin-top:16px;font-size:12px;color:var(--text-3)">
        ${Icon.sparkle({ size: 14 })} Astuce : allez dans <b style="color:var(--text-2)">&nbsp;Affectation&nbsp;</b> pour glisser les AESH sur les créneaux. Ici, cliquez sur une pastille AESH pour la retirer.
      </div>`}`;
}


// ───── pages/IntervenantView.js ─────
// Page Intervenant — planning personnel d'un AESH + détail de son volume horaire.









function IntervenantView({ state, params }) {
  const aeshId = params.id || (state.aesh[0] && state.aesh[0].id);
  const aesh = byId(state.aesh, aeshId);
  const [editing, setEditing] = useState(false);
  if (!aesh) return html`<div class="empty">Intervenant introuvable.</div>`;

  const b = bilanAesh(state, aeshId);
  const reste = b.cible - b.total;
  const { weekMode, weekPriority } = state.config.ui;

  return html`
    <div class="page-header">
      <div class="spread wrap gap-4">
        <div class="row gap-4 wrap">
          <div class="seg">
            ${state.aesh.map((a) => html`
              <button class=${a.id === aeshId ? 'active both' : ''} onClick=${() => navigate(`/aesh/${a.id}`)}>${a.code || a.initiales}</button>`)}
          </div>
          <div class="row">
            <${Avatar} avatar=${aesh.avatar} initiales=${aesh.initiales} color=${aesh.color} size=${34} />
            <div>
              <h1 class="page-title">${aesh.nom}</h1>
              <div class="page-desc">Volume contractuel ${fmt(aesh.volumeCible)} h / semaine</div>
            </div>
          </div>
        </div>
        <button class="btn primary" onClick=${() => setEditing(true)}>${Icon.edit({ size: 15 })} Composer le planning</button>
      </div>
    </div>

    ${editing ? html`<${AeshScheduleEditor} state=${state} aeshId=${aeshId} onClose=${() => setEditing(false)} />` : null}

    <div style="margin-bottom:16px"><${WeekControl} state=${state} /></div>

    <div class="grid" style="grid-template-columns:1fr 300px;align-items:start">
      <${ScheduleGrid} state=${state} aeshId=${aeshId} mode=${weekMode} priority=${weekPriority} editable=${true} />

      <div class="col gap-4">
        <div class="card">
          <span class="card-eyebrow">Bilan du service</span>
          <div style="margin:14px 0">
            <${HourMeter} value=${b.total} target=${b.cible} label="Total positionné"
              sub=${reste > 0.01 ? `${fmt(reste)} h restantes à placer` : reste < -0.01 ? `dépassement de ${fmt(-reste)} h` : 'volume complet'} />
          </div>
          <table class="tbl">
            <tbody>
              ${Object.entries(b.parClasse).map(([cid, h]) => {
                const c = byId(state.classes, cid);
                return html`<tr><td>${c ? c.nom : cid}</td><td style="text-align:right;font-weight:650">${fmt(h)} h</td></tr>`;
              })}
              ${(aesh.horsClasse || []).map((x) => html`
                <tr><td class="muted">${x.label}<span class="badge" style="margin-left:6px">hors PSR</span></td>
                  <td style="text-align:right" class="muted">${fmt(x.h)} h</td></tr>`)}
              <tr style="border-top:2px solid var(--border)">
                <td style="font-weight:700">Total</td>
                <td style="text-align:right;font-weight:700">${fmt(b.total)} h</td></tr>
            </tbody>
          </table>
        </div>

        <div class="card pad-sm">
          <div class="row gap-2" style="font-size:12px;color:var(--text-3)">
            ${Icon.pin({size:14})} Planning stable de début d'année. Modifiable à tout moment (absence, CCF, épreuve) depuis la page <b style="color:var(--text-2)">&nbsp;Affectation</b>.
          </div>
        </div>
      </div>
    </div>`;
}


// ───── pages/AffectationView.js ─────
// Page Affectation — le poste de travail principal :
// la grille d'une classe + la palette d'AESH à glisser sur les créneaux.










function AffectationView({ state }) {
  const [classeId, setClasseId] = useState(state.classes[0] && state.classes[0].id);
  const [activeAesh, setActiveAesh] = useState(null);
  const [inspectId, setInspectId] = useState(null);
  const { weekMode, weekPriority } = state.config.ui;
  const classe = byId(state.classes, classeId);
  const alerts = alertsSummary(state);
  const couverture = classe ? couvertureClasse(state, classe.id) : null;
  const inspectSeance = inspectId ? byId(state.seances, inspectId) : null;

  return html`
    <div class="page-header">
      <div>
        <h1 class="page-title">Affectation des AESH</h1>
        <div class="page-desc">Couvrez les besoins par créneau, sans données élèves nominatives · les volumes se recalculent en direct</div>
      </div>
      <div style="margin-top:16px"><${WeekControl} state=${state} /></div>
    </div>

    <div class="row gap-2 wrap" style="margin-bottom:16px">
      ${state.classes.map((c) => html`
        <button class=${'btn ' + (c.id === classeId ? 'primary' : '')} onClick=${() => setClasseId(c.id)}>
          <span class="dot" style=${`background:${c.id === classeId ? '#fff' : c.color}`}></span>
          ${c.nom} <span style="opacity:.7">· ${couvertureClasse(state, c.id).percent}% couverts</span>
        </button>`)}
    </div>

    <div class="grid affect-grid">
      <div class="col gap-4">
        ${classe && couverture ? html`
          <div class="card pad-sm coverage-panel">
            <div>
              <div class="card-eyebrow">Besoins ${classe.nom}</div>
              <h2>${couverture.percent}% couverts</h2>
            </div>
            <div class="row gap-2 wrap">
              <span class="badge ok">${couverture.coveredSlots} complets</span>
              <span class="badge info">${couverture.partialSlots} partiels</span>
              <span class=${'badge ' + (couverture.missingSlots ? 'warn' : 'ok')}>${couverture.missingSlots} non couverts</span>
              <span class="badge accent">${fmt(couverture.coveredHours)} / ${fmt(couverture.expectedHours)} h attendues</span>
            </div>
          </div>` : null}
        <div class="hint-inline muted">${Icon.pin({ size: 13 })} Cliquez un créneau pour ouvrir son panneau (besoin, AESH, type d'accompagnement, remarque).</div>
        <${ScheduleGrid} state=${state} classeId=${classeId} mode=${weekMode} priority=${weekPriority} editable=${true} onSlotClick=${(se) => setInspectId(se.id)} />
        ${alerts.danger > 0 ? html`
          <div class="alert danger">
            <span class="alert-ico">${Icon.alert({size:16})}</span>
            <div><div class="alert-title">${alerts.danger} alerte(s) bloquante(s)</div>
            <div class="alert-desc">Volume dépassé ou chevauchement — voir le tableau de bord.</div></div>
          </div>` : null}
      </div>
      <${AeshPalette} state=${state} activeId=${activeAesh} onSelect=${setActiveAesh} />
    </div>
    ${inspectSeance ? html`<${SlotInspector} state=${state} seance=${inspectSeance} onClose=${() => setInspectId(null)} />` : null}`;
}


// ───── pages/ConsultationView.js ─────
// Page Consultation — vue lecture seule, pensée pour l'AESH : son emploi du temps
// en Semaine / Mois / Année / Liste, imprimable. Aucune édition possible ici.











const VUES = [
  { id: 'semaine', label: 'Semaine', ico: Icon.calendar },
  { id: 'mois', label: 'Mois', ico: Icon.grid },
  { id: 'annee', label: 'Année', ico: Icon.layers },
  { id: 'liste', label: 'Liste', ico: Icon.stack },
];

function weekVisual(state, w) {
  const sem = state.config.semaine;
  if (w.status === 'ecole') return { color: semaineColor(sem, w.parity), label: semaineLabel(sem, w.parity), vac: false };
  if (w.status === 'vacances') return { color: '#9aa5b8', label: 'Vac.', vac: true, nom: w.nom };
  return { color: '#c2ccdd', label: '—', vac: true };
}

function ConsultationView({ state, params }) {
  const aeshId = params.id || (state.aesh[0] && state.aesh[0].id);
  const aesh = byId(state.aesh, aeshId);
  const [vue, setVue] = useState('semaine');
  const mois = weeksByMonth(state.config);
  const [moisIdx, setMoisIdx] = useState(Math.max(0, mois.findIndex((m) => m.weeks.filter((w) => w.status === 'ecole').length >= 2)));
  const { weekMode, weekPriority } = state.config.ui;

  if (!aesh) return html`<div class="empty">Intervenant introuvable.</div>`;
  const b = bilanAesh(state, aeshId);

  return html`
    <div class="consult">
      <div class="page-header no-print">
        <div class="spread wrap gap-4">
          <div>
            <h1 class="page-title">Mon emploi du temps</h1>
            <div class="page-desc">Vue lecture seule · claire, imprimable et mise à jour par la coordination</div>
          </div>
          <button class="btn" onClick=${() => window.print()}>${Icon.download({ size: 15 })} Imprimer</button>
        </div>

        <div class="spread wrap gap-4" style="margin-top:16px">
          <div class="seg">
            ${state.aesh.map((a) => html`
              <button class=${a.id === aeshId ? 'active both' : ''} onClick=${() => navigate(`/consultation/${a.id}`)}>
                <span class="dot" style=${`background:${a.color}`}></span> ${a.code || a.initiales}
              </button>`)}
          </div>
          <div class="seg">
            ${VUES.map((v) => html`
              <button class=${vue === v.id ? 'active both' : ''} onClick=${() => setVue(v.id)}>${v.label}</button>`)}
          </div>
        </div>
      </div>

      <!-- Bandeau imprimable identifiant la personne (par sigle, RGPD) + total -->
      <div class="consult-id card pad-sm">
        <div class="row gap-4">
          <span class="consult-sigle" style=${`background:${aesh.color}`}>${aesh.code || aesh.initiales}</span>
          <div>
            <div style="font-weight:750;font-size:16px">Intervenant ${aesh.code || aesh.initiales}</div>
            <div class="muted" style="font-size:12.5px">Sections PSR & MELEC · ${state.annee}</div>
          </div>
          <div class="grow"></div>
          <div class="center">
            <div class="stat-value" style="font-size:22px">${fmt(b.total)} h</div>
            <div class="muted" style="font-size:11px">service hebdo</div>
          </div>
          <div class="center">
            <div style="font-weight:700">${fmt(heuresAeshParite(state, aeshId, 'A'))} h / ${fmt(heuresAeshParite(state, aeshId, 'B'))} h</div>
            <div class="muted" style="font-size:11px">sem. ${semaineLabel(state.config.semaine, 'A')} / ${semaineLabel(state.config.semaine, 'B')}</div>
          </div>
        </div>
      </div>

      ${vue === 'semaine' ? html`
        <div class="no-print" style="margin:16px 0"><${WeekControl} state=${state} /></div>
        <${ScheduleGrid} state=${state} aeshId=${aeshId} mode=${weekMode} priority=${weekPriority} editable=${false} />
      ` : null}

      ${vue === 'liste' ? html`<${ListeVue} state=${state} aeshId=${aeshId} />` : null}
      ${vue === 'annee' ? html`<${AnneeVue} state=${state} mois=${mois} />` : null}
      ${vue === 'mois' ? html`<${MoisVue} state=${state} aeshId=${aeshId} mois=${mois} idx=${moisIdx} setIdx=${setMoisIdx} />` : null}
    </div>`;
}

function ListeVue({ state, aeshId }) {
  const sem = state.config.semaine;
  const liste = listeAesh(state, aeshId);
  if (!liste.length) return html`<div class="empty">Aucune séance positionnée.</div>`;
  return html`
    <div class="card" style="margin-top:16px">
      <table class="tbl">
        <thead><tr><th>Jour</th><th>Horaire</th><th>Matière</th><th>Accompagnement</th><th>Salle</th><th>Semaine</th></tr></thead>
        <tbody>
          ${liste.map((s) => {
            const d = DISCIPLINES[s.disc] || DISCIPLINES.autre;
            const cr = creneauById(s.creneau);
            const aff = state.affectations.find((a) => a.aesh === aeshId && a.seance === s.id);
            const t = TYPES_ACCOMPAGNEMENT[aff && aff.type] || TYPES_ACCOMPAGNEMENT.mutualise;
            return html`<tr>
              <td style="font-weight:650">${jourById(s.jour)?.label}</td>
              <td class="mono dim">${cr?.debut}–${cr?.fin}</td>
              <td>
                <span class="row gap-2"><span class="dot" style=${`background:${d.color}`}></span> ${d.label}</span>
                ${s.remarque ? html`<div class="muted" style="font-size:11.5px;margin-top:2px">${Icon.pin({ size: 11 })} ${s.remarque}</div>` : null}
              </td>
              <td><span class="badge" style=${`color:${t.color};background:${t.color}1e`}>${t.label}</span></td>
              <td class="dim">${s.salle || '—'}</td>
              <td>${s.semaine === 'AB' ? html`<span class="badge">toutes</span>`
                : html`<span class="badge" style=${`color:${semaineColor(sem, s.semaine)};background:${semaineColor(sem, s.semaine)}22`}>${semaineLabel(sem, s.semaine)}</span>`}</td>
            </tr>`;
          })}
        </tbody>
      </table>
    </div>`;
}

function AnneeVue({ state, mois }) {
  return html`
    <div class="card" style="margin-top:16px">
      <div class="annee-grid">
        ${mois.map((m) => html`
          <div class="annee-mois">
            <div class="annee-mois-lbl">${monthName(m.month)} ${String(m.year).slice(2)}</div>
            <div class="annee-weeks">
              ${m.weeks.map((w) => {
                const v = weekVisual(state, w);
                return html`<span class=${'annee-wk' + (v.vac ? ' vac' : '')}
                  style=${`--wc:${v.color}`} title=${`${fmtDate(w.monday)} — ${v.vac ? (v.nom || 'vacances') : 'Semaine ' + v.label}`}>${v.label}</span>`;
              })}
            </div>
          </div>`)}
      </div>
      <div class="row wrap gap-4" style="margin-top:16px;font-size:12px;color:var(--text-3)">
        <span class="row gap-2"><span class="annee-wk" style=${`--wc:${semaineColor(state.config.semaine,'A')}`}>${semaineLabel(state.config.semaine,'A')}</span> Semaine ${semaineLabel(state.config.semaine,'A')}</span>
        <span class="row gap-2"><span class="annee-wk" style=${`--wc:${semaineColor(state.config.semaine,'B')}`}>${semaineLabel(state.config.semaine,'B')}</span> Semaine ${semaineLabel(state.config.semaine,'B')}</span>
        <span class="row gap-2"><span class="annee-wk vac" style="--wc:#9aa5b8">Vac.</span> Vacances</span>
      </div>
    </div>`;
}

function MoisVue({ state, aeshId, mois, idx, setIdx }) {
  const m = mois[idx];
  if (!m) return html`<div class="empty">—</div>`;
  return html`
    <div class="card" style="margin-top:16px">
      <div class="spread" style="margin-bottom:16px">
        <button class="btn ghost" disabled=${idx <= 0} onClick=${() => setIdx(idx - 1)}>‹ Préc.</button>
        <h2>${monthName(m.month)} ${m.year}</h2>
        <button class="btn ghost" disabled=${idx >= mois.length - 1} onClick=${() => setIdx(idx + 1)}>Suiv. ›</button>
      </div>
      <div class="mois-weeks">
        ${m.weeks.map((w) => {
          const v = weekVisual(state, w);
          const h = w.status === 'ecole' ? heuresAeshParite(state, aeshId, w.parity) : 0;
          return html`<div class=${'mois-wk' + (v.vac ? ' vac' : '')} style=${`--wc:${v.color}`}>
            <div class="mois-wk-head">
              <span class="mois-wk-badge">${v.label}</span>
              <span class="muted" style="font-size:11px">${fmtDate(w.monday)}</span>
            </div>
            <div class="mois-wk-body">
              ${w.status === 'ecole' ? html`<b>${fmt(h)} h</b> <span class="muted">d'accompagnement</span>`
                : html`<span class="muted">${v.nom || 'Vacances'}</span>`}
            </div>
          </div>`;
        })}
      </div>
    </div>`;
}


// ───── pages/EvenementsView.js ─────
// Page Périodes & événements — frise annuelle (PFMP en barres) + événements datés.
// Vue d'ensemble de l'année par classe, avec ajout/édition.











function EvenementsView({ state }) {
  const [draft, setDraft] = useState(null);
  const cal = state.config.calendrier || {};
  const start = parseISO(cal.prerentree || '2026-08-31');
  const end = parseISO(cal.finAnnee || '2027-07-03');
  const span = (end - start) || 1;
  const pct = (d) => Math.max(0, Math.min(100, ((parseISO(d) - start) / span) * 100));

  // Mois pour les repères.
  const mois = [];
  { const d = new Date(start.getFullYear(), start.getMonth(), 1);
    while (d <= end) { mois.push(new Date(d)); d.setMonth(d.getMonth() + 1); } }

  const vacances = cal.vacances || [];
  const evens = state.evenements || [];
  const ranges = evens.filter((e) => EVENT_TYPES[e.type]?.range);
  const points = evens.filter((e) => !EVENT_TYPES[e.type]?.range)
    .sort((a, b) => a.debut.localeCompare(b.debut));

  const bands = (faint) => vacances.map((v) => html`
    <div class=${'tl-vac' + (faint ? ' faint' : '')}
      style=${`left:${pct(v.debut)}%;width:${pct(v.reprise) - pct(v.debut)}%`}
      title=${`Vacances ${v.nom}`}></div>`);

  const filieres = [...new Set(state.classes.map((c) => c.filiere || 'Autres'))];

  return html`
    <div class="page-header">
      <div class="spread wrap gap-4">
        <div>
          <h1 class="page-title">Périodes & événements</h1>
          <div class="page-desc">PFMP, CCF, conseils… sur l'année ${state.annee} · dates prévisionnelles, à ajuster</div>
        </div>
        <div class="row gap-2">
          <button class="btn" onClick=${() => pickICS()
            .then((txt) => { const evs = icsToEvenements(txt); const n = addEvenementsBulk(evs); toast(n ? `${n} événement(s) importé(s)` : 'Rien de nouveau à importer'); })
            .catch((e) => toast('Import échoué : ' + e.message, 'warn'))}>
            ${Icon.upload({ size: 15 })} Importer .ics</button>
          <button class="btn primary" onClick=${() => setDraft({})}>${Icon.plus({ size: 15 })} Ajouter</button>
        </div>
      </div>
    </div>

    <!-- FRISE -->
    <div class="card" style="overflow:hidden">
      <div class="tl">
        <div class="tl-row tl-monthrow">
          <div class="tl-label"></div>
          <div class="tl-track">
            ${bands(false)}
            ${mois.map((m) => html`<span class="tl-month" style=${`left:${pct(new Date(m.getFullYear(), m.getMonth(), 1))}%`}>${monthName(m.getMonth()).slice(0, 4)}.</span>`)}
          </div>
        </div>

        ${filieres.map((f) => html`
          <div class="tl-filiere">${FILIERES[f]?.label || f}</div>
          ${state.classes.filter((c) => (c.filiere || 'Autres') === f).map((c) => html`
            <div class="tl-row">
              <div class="tl-label"><span class="dot" style=${`background:${c.color}`}></span> ${c.nom}</div>
              <div class="tl-track">
                ${bands(true)}
                ${ranges.filter((e) => e.classe === c.id).map((e) => {
                  const t = EVENT_TYPES[e.type];
                  return html`<div class="tl-bar" style=${`left:${pct(e.debut)}%;width:${Math.max(1.2, pct(e.fin) - pct(e.debut))}%;background:${t.color}`}
                    title=${`${e.titre || t.court} · ${fmtDate(e.debut)} → ${fmtDate(e.fin)}`}
                    onClick=${() => setDraft(e)}>${e.titre || t.court}</div>`;
                })}
                ${points.filter((e) => e.classe === c.id).map((e) => {
                  const t = EVENT_TYPES[e.type];
                  return html`<span class="tl-pt" style=${`left:${pct(e.debut)}%;background:${t.color}`}
                    title=${`${e.titre || t.court} · ${fmtDate(e.debut)}`} onClick=${() => setDraft(e)}></span>`;
                })}
              </div>
            </div>`)}
        `)}
      </div>

      <div class="row wrap gap-4" style="margin-top:16px;font-size:12px;color:var(--text-3)">
        ${Object.entries(EVENT_TYPES).map(([k, v]) => html`<span class="row gap-2"><span class="dot" style=${`background:${v.color}`}></span> ${v.court}</span>`)}
        <span class="row gap-2"><span class="tl-vac-key"></span> Vacances</span>
      </div>
    </div>

    <!-- LISTE DES ÉVÉNEMENTS DATÉS -->
    <div class="card" style="margin-top:20px">
      <h2 style="margin-bottom:14px">${Icon.calendar({ size: 16 })} Événements ponctuels</h2>
      ${points.length === 0
        ? html`<div class="empty">Aucun événement daté. Cliquez « Ajouter ».</div>`
        : html`<table class="tbl">
            <thead><tr><th>Date</th><th>Type</th><th>Classe</th><th>Intitulé</th><th></th></tr></thead>
            <tbody>
              ${points.map((e) => {
                const t = EVENT_TYPES[e.type]; const c = byId(state.classes, e.classe);
                return html`<tr style="cursor:pointer" onClick=${() => setDraft(e)}>
                  <td class="mono dim">${fmtDate(e.debut)}${e.heureDebut ? html` <span class="badge" style="font-size:10.5px">${e.heureDebut}${e.heureFin ? '–' + e.heureFin : ''}</span>` : null}</td>
                  <td><span class="badge" style=${`color:${t.color};background:${t.color}1f`}>${t.court}</span></td>
                  <td>${c ? c.nom : e.classe}</td>
                  <td>${e.titre || '—'} ${e.previsionnel ? html`<span class="badge" style="margin-left:6px">prévis.</span>` : null}</td>
                  <td style="text-align:right">${Icon.edit({ size: 14 })}</td>
                </tr>`;
              })}
            </tbody>
          </table>`}
    </div>

    <div class="row gap-2" style="margin-top:14px;font-size:12px;color:var(--text-3)">
      ${Icon.sparkle({ size: 14 })} Dates prévisionnelles reprojetées depuis 2025-2026. À confirmer avec l'export Pronote 2026-2027 (importateur .ics à venir).
    </div>

    ${draft ? html`<${EvenementModal} state=${state} draft=${draft} onClose=${() => setDraft(null)} />` : null}`;
}


// ───── pages/MessagesView.js ─────
// Page Messages (espace coordination) — réception des messages des AESH (temps réel).




function quand(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const j = String(d.getDate()).padStart(2, '0'), m = String(d.getMonth() + 1).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0'), mi = String(d.getMinutes()).padStart(2, '0');
  return `${j}/${m} ${h}:${mi}`;
}

function MessagesView() {
  const [msgs, setMsgs] = useState(undefined); // undefined = en attente, null = indispo
  useEffect(() => subscribeMessages((list) => setMsgs(list)), []);

  const dispo = fbAvailable();
  const nonLus = Array.isArray(msgs) ? msgs.filter((m) => !m.lu).length : 0;

  return html`
    <div class="page-header">
      <div class="spread">
        <div>
          <h1 class="page-title">Messages des intervenants</h1>
          <div class="page-desc">Reçus en temps réel depuis l'espace AESH</div>
        </div>
        ${nonLus ? html`<span class="badge danger">${nonLus} non lu(s)</span>` : null}
      </div>
    </div>

    ${!dispo ? html`
      <div class="alert warn">
        <span class="alert-ico">${Icon.alert({ size: 16 })}</span>
        <div><div class="alert-title">Messagerie ${fbConfigured() ? 'indisponible' : 'à configurer'}</div>
        <div class="alert-desc">${fbConfigured()
          ? 'Connexion au service impossible pour le moment.'
          : 'À activer à la mise en ligne : renseigner la config Firebase dans src/lib/firebase.js (projet devoirs-pse, collection coordination_planning_messages).'}</div></div>
      </div>`
    : msgs === undefined ? html`<div class="empty">Chargement…</div>`
    : !msgs || msgs.length === 0 ? html`<div class="empty"><div class="empty-ico">${Icon.inbox({ size: 28 })}</div>Aucun message pour l'instant.</div>`
    : html`<div class="col gap-2">
        ${msgs.map((m) => html`
          <div class=${'card pad-sm ' + (m.lu ? '' : 'msg-unread')} style=${m.lu ? '' : 'border-left:3px solid var(--accent)'}>
            <div class="spread" style="margin-bottom:6px">
              <div class="row gap-2">
                <span class="aesh-pill" style="background:var(--accent)">${m.from || '?'}</span>
                <span class="muted" style="font-size:12px">${quand(m.ts)}</span>
                ${m.lu ? null : html`<span class="badge accent">nouveau</span>`}
              </div>
              <div class="row gap-2">
                ${m.lu ? null : html`<button class="btn sm ghost" onClick=${() => markRead(m.id)}>${Icon.check({ size: 13 })} Lu</button>`}
                <button class="btn sm ghost danger" onClick=${() => deleteMessage(m.id)}>${Icon.trash({ size: 13 })}</button>
              </div>
            </div>
            <div style="font-size:14px;white-space:pre-wrap">${m.text}</div>
          </div>`)}
      </div>`}`;
}


// ───── pages/ContactView.js ─────
// Page Contact (espace intervenant) — l'AESH envoie un message au coordinateur.





function ContactView({ state }) {
  const [from, setFrom] = useState(state.aesh[0] ? (state.aesh[0].code || state.aesh[0].initiales) : '');
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);
  const dispo = fbAvailable();

  const envoyer = () => {
    if (!text.trim()) { toast('Écrivez un message', 'warn'); return; }
    sendMessage({ from, text })
      .then(() => { setSent(true); setText(''); toast('Message envoyé'); })
      .catch((e) => toast(e.message, 'warn'));
  };

  return html`
    <div class="page-header">
      <h1 class="page-title">Message au coordinateur</h1>
      <div class="page-desc">Une question, un imprévu, un besoin ? Écrivez ici.</div>
    </div>

    ${!dispo ? html`
      <div class="alert warn" style="margin-bottom:16px">
        <span class="alert-ico">${Icon.alert({ size: 16 })}</span>
        <div><div class="alert-title">Messagerie ${fbConfigured() ? 'indisponible' : 'à configurer'}</div>
        <div class="alert-desc">${fbConfigured()
          ? 'Connexion au service impossible pour le moment.'
          : 'La connexion Firebase sera activée à la mise en ligne (codes à renseigner).'}</div></div>
      </div>` : null}

    <div class="card" style="max-width:620px">
      <div class="col gap-4">
        <div class="field">
          <label>Votre sigle</label>
          <select class="select" value=${from} onChange=${(e) => setFrom(e.target.value)} style="max-width:200px">
            ${state.aesh.map((a) => html`<option value=${a.code || a.initiales} selected=${(a.code || a.initiales) === from}>${a.code || a.initiales}</option>`)}
          </select>
        </div>
        <div class="field">
          <label>Votre message</label>
          <textarea class="input" rows="5" placeholder="Bonjour, …" value=${text}
            onInput=${(e) => setText(e.target.value)} style="resize:vertical;font-family:inherit"></textarea>
        </div>
        <div class="row" style="justify-content:flex-end">
          <button class="btn primary" disabled=${!dispo} onClick=${envoyer}>${Icon.send({ size: 15 })} Envoyer</button>
        </div>
        ${sent ? html`<div class="badge ok">${Icon.check({ size: 13 })} Message transmis au coordinateur</div>` : null}
      </div>
    </div>`;
}


// ───── pages/ParametresView.js ─────
// Page Paramètres — la base « modifiable chaque année » :
// AESH & volumes, classes, enseignants, et la sauvegarde (export/import/reset).








function AeshEditor({ state }) {
  return html`
    <div class="card">
      <div class="spread" style="margin-bottom:14px">
        <h2>${Icon.users({size:16})} AESH & volumes horaires</h2>
      </div>
      <div class="muted" style="font-size:12px;margin-bottom:12px">
        Le <b style="color:var(--text-2)">sigle</b> est ce qui s'affiche dans la grille (RGPD) — mettez la lettre ou l'abréviation de votre choix.
      </div>
      <table class="tbl">
        <thead><tr><th>Intervenant</th><th>Sigle</th><th>Avatar</th><th>Volume cible</th><th>Positionné</th><th>Couleur</th></tr></thead>
        <tbody>
          ${state.aesh.map((a) => {
            const b = bilanAesh(state, a.id);
            return html`<tr>
              <td><div class="row"><${Avatar} avatar=${a.avatar} initiales=${a.code || a.initiales} color=${a.color} size=${26} /> ${a.nom}</div></td>
              <td><input class="input" style="width:70px" value=${a.code || ''} maxlength="4"
                  onInput=${(e) => upsertAesh({ ...a, code: e.target.value })} /></td>
              <td><select class="select" style="font-size:18px;padding:4px 8px" value=${a.avatar || ''}
                  onChange=${(e) => upsertAesh({ ...a, avatar: e.target.value })}>
                  ${AVATARS.map((av) => html`<option value=${av} selected=${(a.avatar || '') === av}>${av || '— lettre —'}</option>`)}
                </select></td>
              <td>
                <input class="input" style="width:84px" type="number" step="0.5" value=${a.volumeCible}
                  onChange=${(e) => { upsertAesh({ ...a, volumeCible: parseFloat(e.target.value) || 0 }); toast('Volume mis à jour'); }} />
                <span class="muted"> h</span>
              </td>
              <td><span class=${'badge ' + (Math.abs(b.ecart) < 0.01 ? 'ok' : b.ecart > 0 ? 'danger' : 'warn')}>${fmt(b.total)} h</span></td>
              <td><input type="color" value=${a.color} style="width:34px;height:28px;border:none;background:none;cursor:pointer"
                  onChange=${(e) => upsertAesh({ ...a, color: e.target.value })} /></td>
            </tr>`;
          })}
        </tbody>
      </table>
    </div>`;
}

function ClasseEditor({ state }) {
  return html`
    <div class="card">
      <h2 style="margin-bottom:14px">${Icon.grid({size:16})} Classes</h2>
      <table class="tbl">
        <thead><tr><th>Classe</th><th>Niveau</th><th>Effectif</th><th>Élèves notifiés</th></tr></thead>
        <tbody>
          ${state.classes.map((c) => html`<tr>
            <td><div class="row"><span class="dot" style=${`background:${c.color}`}></span> ${c.nom}</div></td>
            <td class="muted">${c.niveau}</td>
            <td><input class="input" style="width:64px" type="number" value=${c.effectif}
              onChange=${(e) => upsertClasse({ ...c, effectif: parseInt(e.target.value) || 0 })} /> <span class="muted">élèves</span></td>
            <td><input class="input" style="width:64px" type="number" min="0" value=${c.notifies || 0}
              onChange=${(e) => upsertClasse({ ...c, notifies: parseInt(e.target.value) || 0 })} /> <span class="muted">notif.</span></td>
          </tr>`)}
        </tbody>
      </table>
      <div class="muted" style="font-size:12px;margin-top:10px">
        « Notifiés » = élèves avec notification d'accompagnement. Servira au calcul du besoin d'AESH par classe (à venir).
      </div>
    </div>`;
}

function badgeSemaine(state) {
  const sem = state.config.semaine;
  const info = weekStatus(state.config);
  if (info.status === 'ecole') return `Cette semaine : ${semaineLabel(sem, info.parity)} · ${rangeLabel()}`;
  if (info.status === 'vacances') return `En ce moment : Vacances · ${info.nom}`;
  if (info.status === 'avant') return 'Avant la rentrée';
  return 'Année terminée';
}

function CalendrierCard({ state }) {
  const cal = state.config.calendrier || {};
  return html`
    <div class="card">
      <div class="spread" style="margin-bottom:6px">
        <h2>${Icon.calendar({ size: 16 })} Calendrier ${state.annee}</h2>
        <span class="badge">Académie de Lyon · zone A</span>
      </div>
      <div class="muted" style="font-size:12.5px;margin-bottom:14px">
        L'alternance A/B saute automatiquement ces périodes de vacances.
        Rentrée des élèves : <b style="color:var(--text-2)">${fmtDate(cal.rentree)}</b>.
      </div>
      <div class="grid grid-2" style="gap:18px;align-items:start">
        <div>
          <div class="card-eyebrow" style="margin-bottom:8px">Vacances</div>
          <table class="tbl"><tbody>
            ${(cal.vacances || []).map((v) => html`<tr>
              <td style="font-weight:600">${v.nom}</td>
              <td style="text-align:right" class="dim">${fmtDate(v.debut)} → ${fmtDate(v.reprise)}</td>
            </tr>`)}
          </tbody></table>
        </div>
        <div>
          <div class="card-eyebrow" style="margin-bottom:8px">Jours fériés en semaine</div>
          <table class="tbl"><tbody>
            ${(cal.feries || []).map((f) => html`<tr>
              <td style="font-weight:600">${f.nom}</td>
              <td style="text-align:right" class="dim">${fmtDate(f.date)}</td>
            </tr>`)}
          </tbody></table>
        </div>
      </div>
    </div>`;
}

function SemaineEditor({ state }) {
  const sem = state.config.semaine;
  return html`
    <div class="card">
      <div class="spread" style="margin-bottom:6px">
        <h2>${Icon.calendarCheck({ size: 16 })} Semaine A / B</h2>
        <span class="badge accent">${badgeSemaine(state)}</span>
      </div>
      <div class="muted" style="font-size:12.5px;margin-bottom:16px">
        Indiquez un lundi de référence et sa semaine : l'application déduira automatiquement
        si l'on est en A ou B chaque semaine de l'année.
      </div>
      <div class="grid grid-2" style="gap:16px">
        <div class="field">
          <label>Lundi de référence</label>
          <input class="input" type="date" value=${sem.anchorMonday}
            onChange=${(e) => { updateSemaine({ anchorMonday: e.target.value }); toast('Ancrage mis à jour'); }} />
        </div>
        <div class="field">
          <label>Ce lundi-là, on est en</label>
          <div class="seg">
            <button class=${sem.anchorParity === 'A' ? 'active a' : ''} onClick=${() => updateSemaine({ anchorParity: 'A' })}>Semaine ${sem.labelA}</button>
            <button class=${sem.anchorParity === 'B' ? 'active b' : ''} onClick=${() => updateSemaine({ anchorParity: 'B' })}>Semaine ${sem.labelB}</button>
          </div>
        </div>
        <div class="field">
          <label>Nom de la semaine A</label>
          <div class="row gap-2">
            <input class="input grow" value=${sem.labelA} onChange=${(e) => updateSemaine({ labelA: e.target.value || 'A' })} />
            <input type="color" value=${sem.colorA} style="width:38px;height:34px;border:none;background:none;cursor:pointer"
              onChange=${(e) => updateSemaine({ colorA: e.target.value })} />
          </div>
        </div>
        <div class="field">
          <label>Nom de la semaine B</label>
          <div class="row gap-2">
            <input class="input grow" value=${sem.labelB} onChange=${(e) => updateSemaine({ labelB: e.target.value || 'B' })} />
            <input type="color" value=${sem.colorB} style="width:38px;height:34px;border:none;background:none;cursor:pointer"
              onChange=${(e) => updateSemaine({ colorB: e.target.value })} />
          </div>
        </div>
      </div>
    </div>`;
}

function ParametresView({ state }) {
  const [confirmReset, setConfirmReset] = useState(false);

  return html`
    <div class="page-header">
      <h1 class="page-title">Paramètres & sauvegarde</h1>
      <div class="page-desc">La base de l'année ${state.annee} · ajustez-la, exportez-la, réutilisez-la l'an prochain</div>
    </div>

    <div class="col gap-4">
      <div class="card">
        <h2 style="margin-bottom:6px">${Icon.download({size:16})} Sauvegarde annuelle</h2>
        <div class="muted" style="font-size:12px;margin-bottom:14px">
          Vos données sont enregistrées automatiquement dans ce navigateur. Exportez un fichier pour archiver l'année ou la transférer.
        </div>
        <div class="row gap-2 wrap">
          <button class="btn primary" onClick=${() => { exportJSON(); toast('Sauvegarde exportée'); }}>
            ${Icon.download({size:16})} Exporter (.json)</button>
          <button class="btn" onClick=${() => triggerImport().then(() => toast('Données importées')).catch((e) => toast('Import échoué : ' + e.message, 'warn'))}>
            ${Icon.upload({size:16})} Importer</button>
          ${confirmReset
            ? html`<span class="row gap-2">
                <button class="btn danger" onClick=${() => { resetToSeed(); setConfirmReset(false); toast('Base réinitialisée'); }}>Confirmer la réinitialisation</button>
                <button class="btn ghost" onClick=${() => setConfirmReset(false)}>Annuler</button>
              </span>`
            : html`<button class="btn ghost danger" onClick=${() => setConfirmReset(true)}>${Icon.trash({size:16})} Réinitialiser</button>`}
        </div>
      </div>

      <${SemaineEditor} state=${state} />
      <${CalendrierCard} state=${state} />
      <${AeshEditor} state=${state} />
      <${ClasseEditor} state=${state} />

      <div class="card pad-sm">
        <div class="row gap-2" style="font-size:12px;color:var(--text-3)">
          ${Icon.layers({size:14})} Prochaines couches prévues : gestion des élèves suivis, duplication d'année, ajout/édition des séances directement dans la grille, vue « semaine type » imprimable.
        </div>
      </div>
    </div>`;
}


// ───── router.js ─────
// Routeur minimal basé sur le hash (#/...) — pas de serveur requis.
const subs = new Set();

function currentRoute() {
  const hash = location.hash.replace(/^#/, '') || '/';
  const parts = hash.split('/').filter(Boolean);
  return { path: '/' + parts.join('/'), parts };
}

function navigate(to) {
  if (location.hash.replace(/^#/, '') === to) return;
  location.hash = to;
}

function onRouteChange(fn) {
  subs.add(fn);
  return () => subs.delete(fn);
}

window.addEventListener('hashchange', () => subs.forEach((fn) => fn(currentRoute())));

// Résout la route en { name, params }.
function resolve() {
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


// ───── main.js ─────
// Point d'entrée — monte l'application, gère la coquille (sidebar + topbar),
// le routage et les toasts. Re-rendu sur chaque changement d'état ou de route.

















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
            <a class="btn ghost" href="../" title="Revenir au portail" style="text-decoration:none">‹ Portail</a>
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


})();