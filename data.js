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
    id: "reunions",
    titre: "Réunions & disponibilités",
    desc: "Proposez des créneaux, l'équipe coche ses dispos, le meilleur moment ressort tout seul.",
    lien: "reunions/",
    type: "Outil",
    couleur: "#2f8f83",
    badge: "Nouveau",
  },
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
        titre: "Convention & procédure expliquées",
        desc: "La convention, la pré-convention, la procédure interne et le handicap, expliquées article par article. Qui fait quoi, checklist avant signature, « que faire si… ».",
        lien: "https://preventionsanteenvironnement.github.io/pfmp-convention-procedure/",
        type: "Outil",
      },
      {
        titre: "Cadre réglementaire des PFMP",
        desc: "Les textes officiels (Code de l'éducation, circulaire, allocation, horaires selon l'âge) avec la source exacte. « Selon ma formation » : CAP / Bac Pro.",
        lien: "https://preventionsanteenvironnement.github.io/cadre-reglementaire-pfmp/",
        type: "Outil",
      },
    ],
  },
  {
    id: "pedagogie",
    nom: "Pédagogie",
    couleur: "#5a8a3c",
    enfants: [],
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
        titre: "Site de ressources CPS",
        desc: "Ressources sur les compétences psychosociales.",
        lien: "https://github.com/Preventionsanteenvironnement/cps",
        type: "Lien",
      },
    ],
  },
];
