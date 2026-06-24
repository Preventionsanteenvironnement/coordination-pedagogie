/* =====================================================================
   DONNÉES DU PORTAIL — Coordination & Pédagogie
   ---------------------------------------------------------------------
   Navigation par PALIERS : on clique sur une carte pour entrer dedans.
   Une carte est de deux types :

   • UN DOSSIER  → possède une liste "enfants" (on rentre dedans).
       { titre:"...", desc:"...", enfants:[ ... ] }

   • UN DOCUMENT → possède un "lien" (on l'ouvre).
       { titre:"...", desc:"...", lien:"fichiers/x.pdf", type:"PDF", badge:"Nouveau" }

   👉 Pour ajouter du contenu, vous ne touchez QUE ce fichier.
   ⚠️ RGPD : jamais le nom du lycée ni le nom d'élèves.
   ===================================================================== */

const SITE = {
  titre: "Coordination & Pédagogie",
  sousTitre: "",
};

const THEMATIQUES = [
  {
    id: "administratif",
    nom: "Vie d'établissement & administratif",
    couleur: "#3b6ea5",
    icon: "school",
    enfants: [
      {
        titre: "Projet d'établissement",
        desc: "Les documents cadres de l'établissement.",
        enfants: [
          {
            titre: "Projet d'établissement 2026-2030",
            desc: "Présentation complète (axes, indicateurs, mise en œuvre) — téléchargement PDF possible depuis la page.",
            lien: "https://preventionsanteenvironnement.github.io/projetdetablissement/",
            type: "Page",
          },
        ],
      },
      {
        titre: "Le professeur principal — missions, suivi, orientation",
        desc: "Désignation, coordination du suivi des élèves, lien général/pro & PFMP, élèves à besoins particuliers, vie de classe, orientation et posture — par thèmes, appuyés sur les textes officiels.",
        lien: "guides/professeur-principal.html",
        type: "Repères",
        icon: "users",
      },
      {
        titre: "Organiser les élections de délégués",
        desc: "Mener les élections de délégués de classe pas à pas : calendrier, rôles, déroulé du scrutin, modèles et instances — du vote au conseil de classe.",
        lien: "guides/elections-delegues.html",
        type: "Pas à pas",
      },
    ],
  },
  {
    id: "pfmp",
    nom: "PFMP",
    couleur: "#c0392b",
    icon: "briefcase",
    enfants: [
      {
        titre: "Les PFMP — cadre & démarches",
        desc: "Périodes de formation en milieu professionnel : le cadre réglementaire et les démarches, par thèmes (durée, allocation, horaires selon l'âge…), avec repères, flashcards et « que faire si… ».",
        lien: "guides/pfmp.html",
        type: "Cadre",
      },
      {
        titre: "Visite de stage — proposer une date au tuteur",
        desc: "Tu proposes des jours et des plages horaires ; le tuteur choisit le créneau qui l'arrange, sans rien écrire ni créer de compte. Les réponses arrivent dans l'Espace de gestion.",
        lien: "https://preventionsanteenvironnement.github.io/rdv-pfmp/",
        type: "Outil",
        badge: "Nouveau",
      },
    ],
  },
  {
    id: "pedagogie",
    nom: "Pédagogie",
    couleur: "#5a8a3c",
    icon: "book",
    soon: true,
    enfants: [
      {
        titre: "Ressources pédagogiques",
        desc: "Démarches, méthodes et outils pour la classe.",
        lien: "#",
        type: "Dossier",
        badge: "À venir",
      },
    ],
  },
  {
    id: "pratiques-inclusives",
    nom: "Pratiques inclusives",
    couleur: "#6b4bd6",
    icon: "inclusion",
    enfants: [
      {
        titre: "École inclusive — pour l'enseignant",
        desc: "Le guide de l'enseignant : repères, dispositifs, troubles du neurodéveloppement, gestes professionnels et glossaire, pour scolariser tous les élèves.",
        lien: "guides/ecole-inclusive.html",
        type: "Guide",
      },
      {
        titre: "Différenciation pédagogique — faire réussir tous les élèves",
        desc: "Différencier sans s'épuiser : varier les contenus, les démarches et les supports pour que chaque élève progresse. Exemples concrets et outils prêts à l'emploi.",
        lien: "guides/differenciation.html",
        type: "Pratique",
      },
      {
        titre: "Grille d'observation GEVA-Sco (ESS)",
        desc: "Formulaire à remplir par chaque enseignant pour l'équipe de suivi : observation des activités de l'élève (cotation A/B/C/D). Anonyme — matière au lieu du nom, code élève au lieu du nom. Rapide, mobile ; les réponses sont regroupées pour le professeur principal.",
        lien: "gevasco/",
        type: "Outil",
        badge: "Nouveau",
      },
    ],
  },
  {
    id: "pratiques-pro",
    nom: "Pratiques professionnelles",
    couleur: "#0e7c66",
    icon: "compass",
    enfants: [
      {
        titre: "Le référentiel des compétences professionnelles",
        desc: "Le référentiel des compétences professionnelles des métiers du professorat et de l'éducation, en version interactive : compétence par compétence, ce qu'elle recouvre concrètement.",
        lien: "guides/referentiel-competences.html",
        type: "Référentiel",
        icon: "scale",
      },
      {
        titre: "L'art de la parole",
        desc: "La communication orale au service de l'enseignement : voix, posture, écoute, présence et adresse au groupe. Un ouvrage pour travailler sa parole en classe.",
        lien: "guides/art-de-la-parole.html",
        type: "Ouvrage",
        icon: "book",
      },
      {
        titre: "L'art de la réflexivité",
        desc: "Prendre du recul sur sa pratique : analyser ses gestes professionnels, apprendre de l'expérience et nourrir une posture réflexive au quotidien.",
        lien: "guides/reflexivite.html",
        type: "Ouvrage",
        icon: "brain",
      },
      {
        titre: "La réflexivité — étude",
        desc: "Une étude approfondie de la réflexivité : fondements, enjeux et leviers pour la pratique enseignante.",
        lien: "guides/reflexivite-etude.html",
        type: "Étude",
        icon: "bulb",
      },
    ],
  },
  {
    id: "references",
    nom: "Référentiels & textes officiels",
    couleur: "#9a5ba5",
    icon: "scale",
    soon: true,
    enfants: [
      {
        titre: "Référentiels",
        desc: "Référentiels et textes officiels.",
        lien: "#",
        type: "PDF",
        badge: "À venir",
      },
    ],
  },
  {
    id: "cps",
    nom: "Compétences psychosociales",
    couleur: "#c97a2b",
    icon: "heart",
    enfants: [
      {
        titre: "Ressources CPS — référentiel SpF 2025",
        desc: "Le référentiel des compétences psychosociales (Tome 1), compétence par compétence : fiches détaillées, synthèses et modèles pédagogiques. On revient au portail depuis le menu CPS.",
        lien: "cps/",
        type: "Site",
      },
    ],
  },
  {
    id: "projets",
    nom: "Projets d'équipe",
    couleur: "#2f6cd6",
    icon: "target",
    enfants: [
      {
        titre: "Atelier projet — construire à plusieurs",
        desc: "Élaborer un projet d'équipe à plusieurs mains, étape par étape (constat → diagnostic → problématique → objectifs → actions → évaluation). Chacun contribue en temps réel ; la fiche-projet se compose toute seule et s'imprime. Anonyme : initiales + rôle, jamais de nom.",
        lien: "projets/",
        type: "Outil",
        badge: "Nouveau",
      },
      {
        titre: "Mur d'idées — réfléchir à plusieurs",
        desc: "Le brainstorming d'équipe : plusieurs murs (chacun son thème), où chacun dépose ses idées en temps réel et vote pour faire remonter les meilleures. On garde tout, et un bilan se télécharge / se partage. Idéal en amont d'un projet. Anonyme : initiales + rôle.",
        lien: "murs/",
        type: "Outil",
        icon: "bulb",
        badge: "Nouveau",
      },
      {
        titre: "Carte mentale — construire à plusieurs",
        desc: "Une carte mentale collaborative : une idée centrale, des branches et sous-branches qui se disposent toutes seules (façon XMind), en temps réel. Chacun ajoute, modifie le sien, avec sa couleur ; le pilote peut tout corriger. Canevas qu'on déplace et zoome, image téléchargeable. Anonyme : initiales + rôle.",
        lien: "cartes/",
        type: "Outil",
        icon: "brain",
        badge: "Nouveau",
      },
      {
        titre: "Chef-d'œuvre CAP — piloter sur deux ans",
        desc: "Le dossier de pilotage du chef-d'œuvre, sur les deux années du CAP : une timeline par périodes (sept. → juin), des co-disciplines colorées, des jalons, et le passage de témoin de l'équipe de 1re année à celle de 2e année — pour continuer et clôturer sans repartir de zéro. Préparation de l'oral, cadre officiel intégré. Un dossier par promotion, entièrement modulable. Anonyme : initiales + rôle, jamais de nom d'élève.",
        lien: "chef-doeuvre/",
        type: "Outil",
        icon: "cap",
        badge: "Nouveau",
      },
    ],
  },
];

/* =====================================================================
   ESPACE DE GESTION — outils interactifs (on AGIT dedans).
   Séparé des ressources ci-dessus. Réservé à l'équipe pédagogique.
   ===================================================================== */
const OUTILS = [
  {
    titre: "Rendez-vous PFMP — suivi",
    desc: "Le tableau des visites de stage de l'équipe : qui a répondu, quel créneau a été choisi. Accessible depuis n'importe quel appareil.",
    lien: "https://preventionsanteenvironnement.github.io/rdv-pfmp/?suivi",
    type: "Suivi",
    couleur: "#2f7d6b",
    icon: "calendar",
  },
  {
    titre: "Réunions & disponibilités",
    desc: "Proposez des créneaux, l'équipe coche ses dispos, le meilleur moment ressort tout seul.",
    lien: "reunions/",
    type: "Outil",
    couleur: "#2f8f83",
    icon: "clock",
    badge: "Nouveau",
  },
];
