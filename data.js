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
    id: "aesh",
    nom: "Espace AESH",
    couleur: "#0f766e",
    icon: "heart",
    enfants: [
      {
        titre: "Comprendre le métier",
        desc: "Les missions, la posture, le cadre.",
        icon: "users",
        enfants: [
          {
            titre: "Les missions de l'AESH",
            desc: "Au fond, accompagner quoi ? Les 3 domaines (circulaire 2017-084), la juste posture, l'équipe autour de l'élève, et tous les textes officiels. Guide multipage, pensé pour le mobile.",
            lien: "guides/aesh-missions.html",
            type: "Guide",
            icon: "users",
            badge: "Nouveau",
          },
        ],
      },
      {
        titre: "Les examens",
        desc: "Le rôle de l'AESH pendant les épreuves aménagées.",
        icon: "scale",
        enfants: [
          {
            titre: "Secrétaire & scripteur",
            desc: "Écrire ou lire pour un candidat en situation de handicap : le cadre légal (L. 112-4, D. 351-27), les règles d'or de la neutralité, le déroulé de l'épreuve, les rôles. Multipage, mobile.",
            lien: "guides/aesh-secretaire-scripteur.html",
            type: "Guide",
            icon: "scale",
            badge: "Nouveau",
          },
        ],
      },
    ],
  },
  {
    id: "pratiques-pro",
    nom: "Ouvrages & réflexions",
    couleur: "#0e7c66",
    icon: "book",
    enfants: [
      {
        titre: "Communication",
        desc: "Soigner sa parole et sa présence.",
        icon: "users",
        enfants: [
          {
            titre: "L'art de la parole",
            desc: "La communication orale au service de l'enseignement : voix, posture, écoute, présence et adresse au groupe.",
            lien: "guides/art-de-la-parole.html",
            type: "Ouvrage",
            icon: "book",
          },
        ],
      },
      {
        titre: "Apprendre & pratique réflexive",
        desc: "Comprendre l'acte d'apprendre, et prendre du recul sur sa pratique.",
        icon: "brain",
        enfants: [
          {
            titre: "Penser l'acte d'apprendre",
            desc: "Ce que veut dire « apprendre » : les ressorts de l'apprentissage, du côté de l'élève.",
            lien: "guides/penser-apprendre.html",
            type: "Étude",
            icon: "brain",
          },
          {
            titre: "La réflexivité",
            desc: "Prendre du recul sur sa pratique : analyser ses gestes professionnels et apprendre de l'expérience.",
            lien: "guides/reflexivite-etude.html",
            type: "Ouvrage",
            icon: "bulb",
          },
        ],
      },
      {
        titre: "Pensée complexe — Edgar Morin",
        desc: "Relier les savoirs et penser la complexité — l'œuvre d'Edgar Morin pour l'éducation.",
        icon: "compass",
        enfants: [
          {
            titre: "Enseigner à vivre (Edgar Morin)",
            desc: "L'éducation selon Edgar Morin : préparer les élèves à affronter la complexité de la vie.",
            lien: "guides/morin-enseigner-vivre.html",
            type: "Étude",
            icon: "book",
          },
          {
            titre: "La pensée complexe (Edgar Morin)",
            desc: "Relier au lieu de séparer : les principes de la pensée complexe.",
            lien: "guides/morin-pensee-complexe.html",
            type: "Étude",
            icon: "brain",
          },
          {
            titre: "La Méthode — guide de lecture (Edgar Morin)",
            desc: "Un fil pour entrer dans « La Méthode », l'œuvre maîtresse de Morin sur la connaissance.",
            lien: "guides/morin-methode.html",
            type: "Étude",
            icon: "book",
          },
        ],
      },
      {
        titre: "École & société",
        desc: "Regards critiques sur l'école et notre époque.",
        icon: "scale",
        enfants: [
          {
            titre: "L'école et la reproduction (Bourdieu)",
            desc: "Comment l'école reproduit les inégalités sociales : l'analyse de Pierre Bourdieu.",
            lien: "guides/bourdieu-ecole.html",
            type: "Étude",
            icon: "scale",
          },
          {
            titre: "Le diagnostic de notre époque (Byung-Chul Han)",
            desc: "Une lecture critique de notre temps — performance, épuisement, attention — avec Byung-Chul Han.",
            lien: "guides/byung-chul-han.html",
            type: "Étude",
            icon: "brain",
          },
        ],
      },
      {
        titre: "Coéducation",
        desc: "Construire l'alliance avec les familles.",
        icon: "heart",
        enfants: [
          {
            titre: "La coéducation",
            desc: "Construire l'alliance école-familles : principes, postures et leviers concrets.",
            lien: "guides/coeducation.html",
            type: "Étude",
            icon: "heart",
          },
        ],
      },
    ],
  },
  {
    id: "references",
    nom: "Référentiels & textes officiels",
    couleur: "#9a5ba5",
    icon: "scale",
    enfants: [
      {
        titre: "Le référentiel des compétences professionnelles",
        desc: "Le référentiel des compétences professionnelles des métiers du professorat et de l'éducation, en version interactive : compétence par compétence, ce qu'elle recouvre concrètement.",
        lien: "guides/referentiel-competences.html",
        type: "Référentiel",
        icon: "scale",
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
        titre: "Atelier projet — la démarche pas à pas",
        desc: "La démarche de projet rigoureuse : on part d'un constat, puis diagnostic → problématique → objectifs → actions → évaluation. Idéal pour un projet à problématiser et justifier (dossier, projet formalisé). Chacun contribue en temps réel ; la fiche se compose et s'imprime. Anonyme : initiales + rôle.",
        lien: "projets/",
        type: "Démarche",
      },
      {
        titre: "Monter un projet — de l'idée à l'action",
        desc: "Un canevas tout simple à remplir ensemble : l'idée, le but, pour qui, les actions, qui fait quoi, les moyens, les intervenants & partenaires, le calendrier, la réussite. Pas de diagnostic — on part d'une idée et on organise. Tout le monde écrit en temps réel ; vue d'ensemble imprimable, import/export. Anonyme : initiales + rôle.",
        lien: "canevas/",
        type: "Canevas",
        icon: "bulb",
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
        titre: "Chef-d'œuvre CAP — piloter sur deux ans",
        desc: "Le dossier de pilotage du chef-d'œuvre, sur les deux années du CAP : une timeline par périodes (sept. → juin), des co-disciplines colorées, des jalons, et le passage de témoin de l'équipe de 1re année à celle de 2e année — pour continuer et clôturer sans repartir de zéro. Préparation de l'oral, cadre officiel intégré. Un dossier par promotion, entièrement modulable. Anonyme : initiales + rôle, jamais de nom d'élève.",
        lien: "chef-doeuvre/",
        type: "Outil",
        icon: "cap",
        badge: "Nouveau",
      },
    ],
  },
  {
    id: "reunions",
    nom: "Réunions & rendez-vous",
    couleur: "#2f7d6b",
    icon: "calendar",
    enfants: [
      {
        titre: "Organiser une réunion",
        desc: "Vous proposez des créneaux, l'équipe coche ses dispos, le meilleur moment ressort tout seul — et vous obtenez un lien à partager. C'est ici qu'on démarre une nouvelle réunion.",
        lien: "reunions/",
        type: "Créer",
        icon: "clock",
        badge: "Nouveau",
      },
      {
        titre: "Réunions — suivi",
        desc: "La vue d'ensemble de toutes les réunions déjà lancées : statut, nombre de réponses et meilleur créneau, en temps réel. C'est ici qu'on suit et qu'on valide.",
        lien: "reunions/?suivi",
        type: "Suivi",
        icon: "calendar",
      },
      {
        titre: "Rendez-vous PFMP — suivi",
        desc: "Le tableau des visites de stage de l'équipe : qui a répondu, quel créneau a été choisi. Accessible depuis n'importe quel appareil.",
        lien: "https://preventionsanteenvironnement.github.io/rdv-pfmp/?suivi",
        type: "Suivi",
        icon: "calendar",
      },
    ],
  },
  {
    id: "consulter",
    nom: "Consulter l'équipe",
    couleur: "#2f5fe0",
    icon: "chart",
    enfants: [
      {
        titre: "Lancer un sondage",
        desc: "Une question, 2 à 6 réponses (ou Oui/Non, ou une note sur 5) : tout le monde clique, les résultats tombent en direct. Mode réunion avec QR code à projeter. C'est ici qu'on lance.",
        lien: "sondages/",
        type: "Créer",
        icon: "target",
        badge: "Nouveau",
      },
      {
        titre: "Sondages — suivi",
        desc: "Tous les sondages de l'équipe d'un coup d'œil : ouvert ou clôturé, nombre de votes, réponse en tête — en temps réel. C'est ici qu'on suit.",
        lien: "sondages/?suivi",
        type: "Suivi",
        icon: "chart",
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
    titre: "Planning AESH — PSR & MELEC",
    desc: "Emplois du temps des sections PSR & MELEC, affectation des AESH (semaine A/B), périodes PFMP et événements. Les intervenants y consultent leur planning ; l'éditeur est réservé au coordinateur.",
    lien: "planning-psr/",
    couleur: "#2bb6a3",
    icon: "calendar",
    badge: "Nouveau",
  },
];
