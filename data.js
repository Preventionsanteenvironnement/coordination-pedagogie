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
    ],
  },
  {
    id: "pfmp",
    nom: "PFMP",
    couleur: "#c0392b",
    enfants: [
      {
        titre: "Guide PFMP — devenir incollable",
        desc: "Le cadre réglementaire OFFICIEL des PFMP, didactique et mobile : par thèmes (durée, allocation, horaires selon l'âge…), avec flashcards, quiz, glossaire et « que faire si… ». Uniquement la loi (Code de l'éducation, code du travail, circulaires) — chaque réponse cite sa source exacte.",
        lien: "guide-pfmp/",
        type: "Guide",
      },
      {
        titre: "Convention & procédure expliquées",
        desc: "La convention de l'établissement et la procédure interne, expliquées article par article (propre au lycée — peut évoluer).",
        lien: "https://preventionsanteenvironnement.github.io/pfmp-convention-procedure/",
        type: "Outil",
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
    id: "acteurs",
    nom: "Acteurs",
    couleur: "#0e7c66",
    enfants: [
      {
        titre: "Le DDFPT — rôle & missions",
        desc: "Directeur délégué aux formations professionnelles et technologiques : statut, 4 missions, PFMP & bureau des entreprises, sécurité, lettre de mission — d'après la circulaire n°2016-137 et les textes officiels. L'accent est mis sur les missions globales, pas sur l'évaluation de la personne.",
        lien: "acteurs/ddfpt/",
        type: "Guide",
      },
      {
        titre: "Le professeur principal — rôle & missions",
        desc: "Désignation, coordination du suivi des élèves, lien général/pro & PFMP en lycée pro, élèves à besoins particuliers, vie de classe, orientation et posture — par thèmes, avec les textes officiels (circulaire n°2018-108).",
        lien: "acteurs/prof-principal/",
        type: "Guide",
        badge: "Nouveau",
      },
    ],
  },
  {
    id: "pedagogie",
    nom: "Pédagogie",
    couleur: "#5a8a3c",
    enfants: [
      {
        titre: "Inclusion",
        desc: "École inclusive : le cadre et les dispositifs (PPS, PAP, PAI, PPRE), comprendre les troubles, et les outils de suivi (GEVA-Sco).",
        enfants: [
          {
            titre: "École inclusive — guide de formation",
            desc: "Cadre & dispositifs (PPS, PAP, PAI, PPRE, MDPH, ULIS, AESH), comprendre les troubles (TSA, TDAH, dys…), public, pédagogie adaptée et supports. Par thèmes, avec flashcards, quiz et glossaire.",
            lien: "pedagogie/ecole-inclusive/",
            type: "Guide",
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
    ],
  },
  {
    id: "references",
    nom: "Référentiels & textes officiels",
    couleur: "#9a5ba5",
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
    enfants: [
      {
        titre: "Atelier projet — construire à plusieurs",
        desc: "Élaborer un projet d'équipe à plusieurs mains, étape par étape (constat → diagnostic → problématique → objectifs → actions → évaluation). Chacun contribue en temps réel ; la fiche-projet se compose toute seule et s'imprime. Anonyme : initiales + rôle, jamais de nom.",
        lien: "projets/",
        type: "Outil",
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
  },
  {
    titre: "Réunions & disponibilités",
    desc: "Proposez des créneaux, l'équipe coche ses dispos, le meilleur moment ressort tout seul.",
    lien: "reunions/",
    type: "Outil",
    couleur: "#2f8f83",
    badge: "Nouveau",
  },
];
