// ============================================================
// DONNÉES DE DÉPART — reconstituées depuis les documents fournis :
//   • EDT classe C1 PSR (PDF officiel, Semaine A / B)
//   • Tableau de coordination (C1/C2 PSR + 4 AESH)
// C'est la « base » : l'utilisateur la modifie ensuite dans l'app.
// Les volumes des AESH sont CALCULÉS en direct à partir des affectations
// ci-dessous + des activités hors-classe.
// ============================================================

export const ANNEE = '2026-2027';

// — Enseignants —
// RGPD : pas de noms en clair dans les données publiées — initiales seulement.
// (Le coordinateur peut renommer en local ; ces noms ne sont jamais poussés en ligne.)
export const ENSEIGNANTS = [
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
export const AESH = [
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
export const CLASSES = [
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

export const EVENEMENTS = [
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

export const SEANCES = [
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

export const AFFECTATIONS = [
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
export function defaultConfig() {
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
export function seedState() {
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
