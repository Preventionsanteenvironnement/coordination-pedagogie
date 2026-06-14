/* Le DDFPT — rôle, missions, textes officiels. Synthèse sourcée (documents officiels). */
const SOURCES = {
  "circ-2016-137": { ref: "Circulaire n°2016-137 du 11 octobre 2016", origine: "Missions des directeurs délégués aux formations professionnelles et technologiques (BOEN n°37 du 13 oct. 2016). C'est le texte central du métier de DDFPT.", url: "https://www.education.gouv.fr/bo/16/Hebdo37/MENH1613887C.htm" },
  "page-metier": { ref: "Page métier — Ministère de l'Éducation nationale", origine: "Fiche officielle « Directeur·rice délégué·e aux formations professionnelles et technologiques (DDFPT) ».", url: "https://www.education.gouv.fr/directeurdirectrice-deleguee-aux-formations-professionnelles-et-technologiques-ddfpt-416422" },
  "legifrance-circ": { ref: "Circulaire 2016-137 sur Légifrance", origine: "Version référencée sur Légifrance.", url: "https://www.legifrance.gouv.fr/circulaire/id/41407" },
  "circ-bde-2023": { ref: "Circulaire « Bureau des entreprises » du 24 mai 2023", origine: "BOEN n°21 du 25 mai 2023. Le responsable du bureau des entreprises est sous la responsabilité du proviseur et la coordination du DDFPT.", url: "https://www.education.gouv.fr/bo/2023/Hebdo21/MENE2311700C" },
  "eduscol-bde": { ref: "Éduscol — Bureau des entreprises", origine: "« Un bureau des entreprises dans chaque lycée professionnel ».", url: "https://eduscol.education.gouv.fr/5637/un-bureau-des-entreprises-dans-chaque-lycee-professionnel" },
  "decret-91-1259": { ref: "Décret n°91-1259 du 17 décembre 1991", origine: "Crée l'indemnité de responsabilité du DDFPT (ex-chef de travaux).", url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000721596" },
  "arrete-2023-07-13": { ref: "Arrêté du 13 juillet 2023", origine: "Revalorisation des montants de l'indemnité de responsabilité.", url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000047867194" },
  "boen-2026": { ref: "BOEN — fiche de poste DDFPT (rentrée 2026)", origine: "La fiche de poste renvoie toujours aux missions de la circulaire n°2016-137.", url: "https://www.education.gouv.fr/bo/2026/Hebdo2/MENH2531064N" }
};

const SECTIONS = [
  { titre: "Présentation", icone: "🧑‍🏫", notions: [
    { t: "Nom officiel : DDFPT — directeur délégué aux formations professionnelles et technologiques (aussi noté DDF). Ancienne appellation : « chef de travaux ».", s: ["circ-2016-137"] },
    { t: "Statut : un enseignant exerçant une fonction spécifique, placé sous l'autorité directe du chef d'établissement, dont il est le collaborateur direct et le conseiller pour les formations professionnelles et technologiques.", s: ["circ-2016-137"] },
    { t: "Il n'est PAS : chef d'établissement, proviseur adjoint, inspecteur, supérieur hiérarchique général des enseignants, adjoint gestionnaire, ni responsable unique de la sécurité.", s: ["circ-2016-137"] },
    { t: "Où ? Dans les établissements à enseignements professionnels et/ou technologiques : lycée professionnel, lycée polyvalent, LGT avec formations technologiques, EREA, établissements à plateaux techniques.", s: ["page-metier"] }
  ]},
  { titre: "Les 4 grandes missions", icone: "🎯", notions: [
    { t: "1) Organiser les enseignements professionnels et technologiques.", s: ["circ-2016-137"] },
    { t: "2) Coordonner et animer les équipes d'enseignants.", s: ["circ-2016-137"] },
    { t: "3) Conseiller le chef d'établissement.", s: ["circ-2016-137"] },
    { t: "4) Développer les relations avec les partenaires extérieurs.", s: ["circ-2016-137"] }
  ]},
  { titre: "Mission 1 — Organiser", icone: "🛠️", notions: [
    { t: "Cœur de la fonction : moyens humains, horaires et matériels ; plateaux techniques, salles spécialisées, ateliers, laboratoires, équipements et logiciels professionnels, maintenance.", s: ["circ-2016-137"] },
    { t: "Il participe à : l'évaluation des moyens, la répartition des moyens horaires, la proposition de répartition du service des enseignants pro/techno, l'élaboration des emplois du temps, l'organisation des plateaux techniques, le suivi des équipements.", s: ["circ-2016-137"] },
    { t: "Concrètement : il prépare, propose, coordonne, alerte et suit — il ne décide pas seul.", s: ["circ-2016-137"] }
  ]},
  { titre: "Mission 2 — Coordonner les équipes", icone: "👥", notions: [
    { t: "Favorise le travail collectif, les échanges, la cohérence pédagogique, la liaison pro/techno/général, l'accueil des nouveaux enseignants et l'accompagnement des stagiaires/remplaçants.", s: ["circ-2016-137"] },
    { t: "Il est correspondant technique des inspecteurs auprès des enseignants.", s: ["circ-2016-137"] },
    { t: "Il contribue à la mise en œuvre des rénovations de diplômes, réformes, évolutions de référentiels, certifications et situations d'évaluation certificative.", s: ["circ-2016-137"] },
    { t: "CCF & examens : il coordonne les conditions d'organisation (plateaux d'examen, conformité, équipements) sans se substituer aux enseignants évaluateurs ni à l'inspection.", s: ["circ-2016-137"] }
  ]},
  { titre: "Mission 3 — Conseiller le chef", icone: "💡", notions: [
    { t: "Offre de formation : veille sur les métiers, le bassin d'emploi, les évolutions technologiques, l'insertion ; il peut proposer des évolutions de l'offre.", s: ["circ-2016-137"] },
    { t: "Équipements : conseille sur le choix, l'implantation, l'utilisation, la conformité, l'adaptation aux référentiels et la maintenance.", s: ["circ-2016-137"] },
    { t: "Budget : propositions sur les crédits de fonctionnement et d'équipement, les besoins pédagogiques, la taxe d'apprentissage.", s: ["circ-2016-137"] },
    { t: "Sécurité : suit la mise en œuvre des équipements, le maintien en conformité et la prévention des risques professionnels.", s: ["circ-2016-137"] }
  ]},
  { titre: "Mission 4 — Partenaires", icone: "🤝", notions: [
    { t: "Interlocuteur des milieux professionnels : partenariats, relations entreprises, recherche de lieux de PFMP, organisations professionnelles, forums métiers, portes ouvertes, insertion.", s: ["circ-2016-137"] },
    { t: "Relations avec les collectivités territoriales, collecte de la taxe d'apprentissage, projets de réseau, échanges internationaux (pour les formations pro/techno).", s: ["circ-2016-137"] }
  ]},
  { titre: "PFMP & bureau des entreprises", icone: "🏢", notions: [
    { t: "Chaque lycée professionnel dispose d'un bureau des entreprises, placé sous la responsabilité du proviseur et sous la coordination du DDFPT.", s: ["circ-bde-2023", "eduscol-bde"] },
    { t: "Le bureau des entreprises : recense les lieux d'accueil, suit leur qualité, appuie les élèves pour trouver des PFMP, gère conventions et relations tuteurs, suit les visites, l'insertion et les alumni.", s: ["circ-bde-2023"] },
    { t: "À distinguer : le DDFPT pilote/coordonne (pédagogique, technique, organisationnel) ; le bureau des entreprises appuie le lien opérationnel école-entreprise ; le chef d'établissement garde l'autorité décisionnelle.", s: ["circ-bde-2023"] }
  ]},
  { titre: "Sécurité & responsabilité", icone: "⚠️", notions: [
    { t: "Responsabilité fonctionnelle sur la sécurité des équipements pédagogiques : suit la mise en œuvre, le maintien en conformité, la prévention des risques et l'usage sécurisé des plateaux techniques.", s: ["circ-2016-137"] },
    { t: "Il ne porte pas seul la responsabilité juridique : le chef d'établissement garde la responsabilité générale ; l'adjoint gestionnaire le matériel/budget ; les enseignants la sécurité pédagogique en cours ; le DDFPT conseille, coordonne, suit et alerte.", s: ["circ-2016-137"] }
  ]},
  { titre: "Lettre de mission & service", icone: "📜", notions: [
    { t: "Il exerce dans le cadre d'une lettre de mission pluriannuelle (max 3 ans), élaborée et signée conjointement avec le chef d'établissement : priorités, objectifs, responsabilités, domaines d'intervention, marges d'autonomie.", s: ["circ-2016-137"] },
    { t: "Temps de service : organisé sur un maximum de 39 heures hebdomadaires sur l'année. Des heures d'enseignement exceptionnelles sont possibles (avec son accord, compatibles avec ses missions) et incluses dans son service (pas d'HSA/HSE).", s: ["circ-2016-137"] }
  ]},
  { titre: "Recrutement & compétences", icone: "🎓", notions: [
    { t: "Recrutement : être enseignant et justifier d'au moins 5 années d'expérience dans l'enseignement ou la formation ; compétences examinées par une commission académique (autorité du recteur).", s: ["circ-2016-137"] },
    { t: "Compétences attendues : fonctionnement d'un EPLE, formations pro/techno, monde de l'entreprise, référentiels, santé-sécurité au travail, collectivités, comptabilité publique, conduite de projet, animation d'équipe, ingénierie de formation.", s: ["circ-2016-137"] }
  ]},
  { titre: "Rémunération", icone: "💶", notions: [
    { t: "Le DDFPT bénéficie de la part fixe de l'ISOE, d'une NBI de 40 points et d'une indemnité de responsabilité.", s: ["page-metier"] },
    { t: "Indemnité de responsabilité créée par le décret n°91-1259 du 17 décembre 1991.", s: ["decret-91-1259"] },
    { t: "Montants annuels (arrêté du 13 juillet 2023) : > 1 000 élèves → 7 563 € ; 400 à 1 000 → 6 740 € ; < 400 → 5 917 €.", s: ["arrete-2023-07-13"] }
  ]},
  { titre: "Ce qu'il peut / ne peut pas", icone: "⚖️", notions: [
    { t: "PEUT : proposer une organisation pédagogique, coordonner les équipes, organiser les plateaux techniques, suivre les équipements, alerter sur la sécurité, conseiller les achats, participer aux EDT, organiser examens/CCF, développer les relations entreprises, participer à la recherche de PFMP.", s: ["circ-2016-137"] },
    { t: "NE PEUT PAS seul : imposer une décision du chef d'établissement, modifier officiellement un EDT sans validation, décider du budget, sanctionner un enseignant, remplacer l'autorité du proviseur ou l'inspection, porter seul la responsabilité juridique de la sécurité, se substituer à l'adjoint gestionnaire, aux évaluateurs ou au bureau des entreprises.", s: ["circ-2016-137"] },
    { t: "Nature de son autorité : fonctionnelle, technique, pédagogique, organisationnelle et partenariale — PAS une autorité hiérarchique générale sur les enseignants.", s: ["circ-2016-137"] }
  ]},
  { titre: "Toutes les sources", icone: "📚", notions: [
    { t: "Texte central — Circulaire n°2016-137 du 11 octobre 2016 (missions des DDFPT).", s: ["circ-2016-137", "legifrance-circ"] },
    { t: "Page métier officielle du ministère.", s: ["page-metier"] },
    { t: "Bureau des entreprises — circulaire du 24 mai 2023 + Éduscol.", s: ["circ-bde-2023", "eduscol-bde"] },
    { t: "Indemnité — décret n°91-1259 (1991) + arrêté du 13 juillet 2023.", s: ["decret-91-1259", "arrete-2023-07-13"] },
    { t: "Fiche de poste DDFPT — BOEN rentrée 2026.", s: ["boen-2026"] }
  ]}
];
if (typeof window !== "undefined") { window.SOURCES = SOURCES; window.SECTIONS = SECTIONS; }
