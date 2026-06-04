/* =====================================================================
   DONNÉES DU PORTAIL — Coordination & Pédagogie
   ---------------------------------------------------------------------
   👉 POUR AJOUTER DU CONTENU, vous ne touchez QUE ce fichier.
   Chaque thématique = un objet dans le tableau THEMATIQUES.
   Chaque ressource = un objet dans la liste "items".

   Modèle d'un item :
   {
     titre: "Nom affiché",
     desc:  "Petite description (1 phrase).",
     lien:  "https://...  ou  fichiers/mon-document.pdf",
     type:  "PDF" | "Lien" | "Word" | "Page" | "Vidéo" | "Image",
     badge: "Nouveau"   // facultatif, petit badge en coin
   }

   ⚠️ RGPD : ne jamais mettre le nom du lycée ni le nom d'élèves.
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
    items: [
      {
        titre: "Projet d'établissement 2026-2030",
        desc: "Le document cadre de l'établissement.",
        lien: "https://github.com/Preventionsanteenvironnement/projetdetablissement",
        type: "Lien",
      },
      {
        titre: "Règlement PFMP",
        desc: "Cadre et règles des périodes de formation en milieu professionnel.",
        lien: "#",
        type: "PDF",
        badge: "À venir",
      },
    ],
  },
  {
    id: "pedagogie",
    nom: "Pédagogie",
    couleur: "#5a8a3c",
    items: [
      {
        titre: "Étude de situation (modèle)",
        desc: "Trame anonymisée — sans nom d'élève ni d'établissement.",
        lien: "#",
        type: "Word",
        badge: "À venir",
      },
    ],
  },
  {
    id: "references",
    nom: "Référentiels & textes officiels",
    couleur: "#9a5ba5",
    items: [
      {
        titre: "Référentiel PSE",
        desc: "Le référentiel officiel de Prévention Santé Environnement.",
        lien: "#",
        type: "PDF",
        badge: "À venir",
      },
    ],
  },
  {
    id: "ressources",
    nom: "Compétences psychosociales",
    couleur: "#c97a2b",
    items: [
      {
        titre: "Compétences psychosociales (CPS)",
        desc: "Site de ressources sur les CPS.",
        lien: "https://github.com/Preventionsanteenvironnement/cps",
        type: "Lien",
      },
    ],
  },
];
