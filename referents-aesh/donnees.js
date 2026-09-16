/* ═══════════════════════════════════════════════════════════════════
   Référents de pôle AESH — données de départ
   Aucun prénom en ligne : chaque AESH est un sigle court, modifiable.
   Les équipes de départ ne sont qu'un point de départ : les référents
   complètent contrat et heures, et ajoutent les nouvelles arrivées.
   ═══════════════════════════════════════════════════════════════════ */
export const COLLECTION = 'coordination_referents_aesh';
export const COL_ESTIMATION = 'coordination_estimation_aesh';

export const POLES = [
  { id: 'PSR_MELEC', slug: 'psr-melec', nom: 'PSR · MELEC', sous: 'CAP PSR · Bac Pro MELEC', couleur: '#0f766e', clair: '#e3f4f0', filieres: ['PSR', 'MELEC'], codeDepart: '0909', coordination: true },
  { id: 'AGORA', slug: 'agora', nom: 'AGOrA', sous: '2de GATL · 1re et Tle AGOrA', couleur: '#6d4bd1', clair: '#efeafd', filieres: ['AGORA'], codeDepart: '2741' },
  { id: 'CAPA', slug: 'capa', nom: 'CAPa', sous: 'Horticulture · Jardinier paysagiste', couleur: '#3f7d20', clair: '#e8f3e0', filieres: ['CAPA'], codeDepart: '5186' },
  { id: 'MDA', slug: 'mda', nom: 'Métiers d’Art', sous: 'Cannage-paillage · Vannerie', couleur: '#b4530b', clair: '#fbeee0', filieres: ['MDA'], codeDepart: '3862' }
];
export const pole = id => POLES.find(p => p.id === id) || null;

/* Équipes du 16/09/2026 (tableau transmis par la coordination). Contrat et heures : à compléter par les référents. */
const A = (id, sigle, equipes) => ({ id, type: 'aesh', sigle, equipes, contrat: null, heures: {}, cantine: 0, internat: 0, service: 0, serviceLib: '', reunion: null, actif: true });
export const EQUIPES_DEPART = [
  A('aesh_d01', 'ANT', { PSR_MELEC: 1 }), A('aesh_d02', 'TI', { PSR_MELEC: 1 }), A('aesh_d03', 'F', { PSR_MELEC: 1 }),
  A('aesh_d04', 'ST', { PSR_MELEC: 1 }), A('aesh_d05', 'CÉ', { PSR_MELEC: 0.5, MDA: 0.5 }), A('aesh_d06', 'N', { PSR_MELEC: 1 }),
  A('aesh_d07', 'R', { AGORA: 1 }), A('aesh_d08', 'GL', { AGORA: 1 }), A('aesh_d09', 'SA', { AGORA: 1 }),
  A('aesh_d10', 'CA', { AGORA: 1 }), A('aesh_d11', 'CH·A', { AGORA: 1 }),
  A('aesh_d12', 'B', { CAPA: 1 }), A('aesh_d13', 'M', { CAPA: 1 }), A('aesh_d14', 'CL', { CAPA: 1 }),
  A('aesh_d15', 'CH·C', { CAPA: 1 }), A('aesh_d16', 'D', { CAPA: 1 }),
  A('aesh_d17', 'ANN', { MDA: 1 }), A('aesh_d18', 'SI', { MDA: 1 }), A('aesh_d19', 'L', { MDA: 1 }),
  A('aesh_d20', 'TH', { MDA: 1 }), A('aesh_d21', 'GT', { MDA: 1 })
];

/* Couleur d'une matière : même règle que la page « Besoins d'accompagnement ». */
const PALETTE = [['#3b6fd8', '#e8effd'], ['#d0782a', '#fdf0e4'], ['#2f9a6a', '#e6f5ee'], ['#9b4fc4', '#f3eafa'], ['#c9444f', '#fbe9ea'], ['#1f8fa3', '#e4f4f7'], ['#b8931c', '#faf4de'], ['#5d6b76', '#eef1f3'], ['#d14f93', '#fbe8f2'], ['#4f8f2a', '#edf6e6']];
const empreinte = s => { let h = 5381; for (const ch of String(s)) h = (Math.imul(h, 33) ^ ch.codePointAt(0)) >>> 0; return h.toString(36).padStart(4, '0'); };
export const familleMatiere = m => String(m || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\b(tp|pole [12]|psr|lv1)\b/g, ' ').split(/[\s,/()-]+/).filter(Boolean).slice(0, 2).join(' ');
export const couleurMatiere = m => PALETTE[parseInt(empreinte(familleMatiere(m)), 36) % PALETTE.length];

export const HUMEURS = [['😄', 'Très bien', 'Belle journée à vous.'], ['🙂', 'Bien', 'Bonne journée.'], ['😐', 'Bof', 'Une chose à la fois.'], ['😕', 'Fatigué', 'Prenez soin de vous.'], ['😣', 'Difficile', 'Courage, l’équipe est là.']];

/* Pensées du jour : le recueil vérifié de l'espace AESH (attributions établies). */
export const PENSEES = [
  ["Mieux vaut une tête bien faite qu'une tête bien pleine.", "Montaigne"],
  ["L'homme ne peut devenir homme que par l'éducation.", "Kant"],
  ["Ne pas railler, ne pas déplorer, ne pas maudire, mais comprendre.", "Spinoza"],
  ["C'est en enseignant que l'on apprend.", "Sénèque"],
  ["Ce n'est pas parce que les choses sont difficiles que nous n'osons pas ; c'est parce que nous n'osons pas qu'elles sont difficiles.", "Sénèque"],
  ["Ce ne sont pas les choses qui troublent les hommes, mais les jugements qu'ils portent sur elles.", "Épictète"],
  ["Ouvrir une école, c'est fermer une prison.", "Victor Hugo"],
  ["L'attention est la forme la plus rare et la plus pure de la générosité.", "Simone Weil"],
  ["L'éducation est le point où se décide si nous aimons assez le monde pour en assumer la responsabilité.", "Hannah Arendt"],
  ["Rien dans la vie n'est à craindre, tout est à comprendre.", "Marie Curie"],
  ["L'éducation n'est pas la préparation à la vie : elle est la vie même.", "John Dewey"],
  ["Ce que l'enfant sait faire aujourd'hui avec de l'aide, il saura le faire seul demain.", "Lev Vygotski"],
  ["Personne n'éduque autrui, personne ne s'éduque seul : les hommes s'éduquent ensemble.", "Paulo Freire"],
  ["Aide-moi à faire seul.", "Maria Montessori"],
  ["On ne fait pas boire un cheval qui n'a pas soif.", "Célestin Freinet"],
  ["L'éducation doit atteindre la tête, le cœur et la main.", "Pestalozzi"],
  ["Il n'y a pas de vent favorable pour celui qui ne sait où il va.", "Sénèque"],
  ["Le temps ne respecte pas ce qui se fait sans lui.", "Paul Claudel"],
  ["L'esprit n'est pas un vase à remplir, mais un feu à allumer.", "Plutarque"],
  ["Enseigner, c'est apprendre deux fois.", "Joseph Joubert"],
  ["La patience est amère, mais son fruit est doux.", "Rousseau"],
  ["Le doute est le commencement de la sagesse.", "Aristote"],
  ["Ce que nous devons apprendre à faire, nous l'apprenons en le faisant.", "Aristote"],
  ["Connais-toi toi-même.", "Socrate"],
  ["Il faut cultiver notre jardin.", "Voltaire"],
  ["Chaque enfant qu'on enseigne est un homme qu'on gagne.", "Victor Hugo"],
  ["La vraie générosité envers l'avenir consiste à tout donner au présent.", "Albert Camus"]
];
