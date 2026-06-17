/* Le professeur principal — rôle, missions, textes officiels. Synthèse sourcée. */
const SITE = {
  titre: "Le professeur principal",
  lead: {
    strong: "Le professeur principal (PP)",
    span: "Enseignant de la classe désigné par le chef d'établissement, il coordonne le suivi des élèves et accompagne leur orientation. Synthèse d'après les textes officiels (circulaire n°2018-108). Touche un thème, puis le § pour la source."
  }
};

const SOURCES = {
  "circ-2018-108": { ref: "Circulaire n°2018-108 du 10 octobre 2018", origine: "« Rôle du professeur principal dans les collèges et les lycées » (BOEN n°37 du 11 oct. 2018, NOR MENE1823888C). C'est le texte central du rôle de PP ; il abroge la circulaire de 1993.", url: "https://www.education.gouv.fr/bo/18/Hebdo37/MENE1823888C.htm" },
  "code-r42110": { ref: "Code de l'éducation — art. R.421-10", origine: "Les professeurs principaux sont désignés par le chef d'établissement, avec l'accord des intéressés.", url: "https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006071191/" },
  "code-r42149": { ref: "Code de l'éducation — art. R.421-49", origine: "Missions des équipes pédagogiques : concertation, suivi et évaluation des élèves, aide au travail personnel, conseil pour la scolarité et l'orientation, relations avec les familles.", url: "https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006071191/" },
  "circ-2016-053": { ref: "Circulaire n°2016-053 du 29 mars 2016", origine: "Organisation et accompagnement des périodes de formation en milieu professionnel (PFMP). Cadre de la coordination pédagogique des PFMP.", url: "https://www.education.gouv.fr/bo/16/Hebdo13/MENE1602766C.htm" },
  "decret-2018-120": { ref: "Décret n°2018-120 du 20 février 2018", origine: "Renforce le rôle du conseil de classe pour l'orientation vers l'enseignement supérieur ; justifie la nomination de deux professeurs principaux en terminale.", url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000036631977" },
  "parcours-avenir": { ref: "Parcours Avenir — art. L.331-7 du Code de l'éducation", origine: "Parcours individuel d'information, d'orientation et de découverte du monde économique et professionnel, de la 6e à la terminale.", url: "https://eduscol.education.gouv.fr/713/le-parcours-avenir" },
  "isoe": { ref: "Décret n°93-55 du 15 janvier 1993 (modifié)", origine: "Indemnité de suivi et d'orientation des élèves (ISOE) ; sa part modulable rémunère la fonction de professeur principal.", url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000178065/" },
  "guide-pp": { ref: "Guide des professeurs principaux — « Accompagner à l'orientation »", origine: "Guide pratique ONISEP / Avenir(s) (2025) : posture, démarche, outils pour accompagner l'orientation.", url: "https://avenirs.onisep.fr" },
  "plateforme-avenirs": { ref: "Plateforme Avenir(s) (ONISEP)", origine: "Socle de l'éducation à l'orientation (5e → terminale et adultes) : portfolio élève, tableau de bord, banque de plus de 700 activités.", url: "https://avenirs.onisep.fr" }
};

const SECTIONS = [
  { titre: "En 1 minute", icone: "⏱️", notions: [
    { t: "Le professeur principal (PP) est un enseignant de la classe, désigné par le chef d'établissement avec son accord. Il coordonne le suivi des élèves et accompagne leur orientation — sous la responsabilité du chef d'établissement.", s: ["circ-2018-108", "code-r42110"] },
    { t: "Deux grandes missions : (1) coordonner le suivi, l'évaluation et l'accompagnement des élèves ; (2) accompagner l'orientation.", s: ["circ-2018-108"] },
    { t: "Il fait le lien entre tous ceux qui suivent l'élève (professeurs, CPE, personnels sociaux et de santé, psychologue de l'Éducation nationale, direction) et il est l'interlocuteur privilégié des familles.", s: ["circ-2018-108"] },
    { t: "Toutes les classes sont concernées, de la 6e à la terminale, et tous les types d'enseignement.", s: ["circ-2018-108"] }
  ]},
  { titre: "Désignation & cadre", icone: "📋", notions: [
    { t: "Désigné par le chef d'établissement, avec l'accord de l'intéressé, selon ses qualités pédagogiques, ses aptitudes à l'organisation, au travail en équipe et au dialogue.", s: ["circ-2018-108", "code-r42110"] },
    { t: "Pour qu'il joue efficacement son rôle, le chef d'établissement le réunit, avec les autres PP, à intervalles réguliers.", s: ["circ-2018-108"] },
    { t: "Cadre légal : les équipes pédagogiques (art. R.421-49) assurent le suivi, l'évaluation et l'aide au travail personnel, et conseillent les élèves pour leur scolarité et leur orientation ; le PP en est le coordonnateur pour sa classe.", s: ["code-r42149", "circ-2018-108"] },
    { t: "Le texte de référence est la circulaire n°2018-108 du 10 octobre 2018 (elle abroge la circulaire de 1993).", s: ["circ-2018-108"] }
  ]},
  { titre: "Coordonner & suivre", icone: "📊", notions: [
    { t: "Sans intervenir sur les champs disciplinaires des autres professeurs, le PP fait le lien, pour sa classe, entre tous les personnels qui suivent l'élève.", s: ["circ-2018-108"] },
    { t: "Conseils de classe : il expose les résultats des élèves et présente une synthèse des conseils formulés par l'équipe pour leur parcours.", s: ["circ-2018-108"] },
    { t: "Une synthèse du suivi est régulièrement transmise à l'élève et à ses représentants légaux (objectifs et modalités pédagogiques).", s: ["circ-2018-108"] },
    { t: "Au collège, le suivi est consigné dans le livret scolaire unique (LSU) ; le PP veille à sa bonne appropriation par l'élève et la famille.", s: ["circ-2018-108"] },
    { t: "En seconde, il exploite avec l'équipe les tests de positionnement et suit la composition des groupes d'accompagnement personnalisé.", s: ["circ-2018-108"] }
  ]},
  { titre: "Lycée pro : général ↔ pro & PFMP", icone: "🏭", notions: [
    { t: "En lycée professionnel, en liaison avec le DDFPT et l'ensemble de l'équipe, le PP assure la coordination pédagogique entre enseignement général et enseignement professionnel pour sa classe.", s: ["circ-2018-108"] },
    { t: "Il veille à la coordination pédagogique des PFMP : au sein de l'équipe, il participe à leur préparation, à leur suivi et à leur évaluation.", s: ["circ-2018-108", "circ-2016-053"] },
    { t: "En terminale de lycée pro, il accompagne l'élève vers l'insertion professionnelle immédiate ou la poursuite d'études (formalisation des compétences et motivations, avec le psychologue de l'Éducation nationale).", s: ["circ-2018-108"] }
  ]},
  { titre: "Élèves à besoins particuliers", icone: "🧩", notions: [
    { t: "Le PP assure, pour sa classe, le suivi de l'accompagnement des élèves à besoins éducatifs particuliers mis en place par les équipes, en associant l'élève et ses représentants légaux.", s: ["circ-2018-108"] },
    { t: "Il participe à l'élaboration des projets PAP, PAI, PPS dans le cadre des réunions des équipes éducatives.", s: ["circ-2018-108"] },
    { t: "Il peut coordonner un programme personnalisé de réussite éducative (PPRE) lorsque l'élève risque de ne pas atteindre le niveau attendu.", s: ["circ-2018-108"] }
  ]},
  { titre: "Vie de classe & établissement", icone: "🏫", notions: [
    { t: "Il est attentif à l'accueil de tous les élèves et favorise la communication ; il peut organiser et animer les heures de vie de classe, voire gérer des conflits (avec le CPE et la direction).", s: ["circ-2018-108"] },
    { t: "Il participe à l'organisation des élections des délégués et rappelle le rôle du conseil de classe et des délégués.", s: ["circ-2018-108"] },
    { t: "Au moins un PP par niveau participe au conseil pédagogique ; les PP préparent ses réunions en recueillant les besoins et projets des équipes.", s: ["circ-2018-108"] },
    { t: "Il crée un lien privilégié entre l'établissement et les représentants légaux de l'élève.", s: ["circ-2018-108"] }
  ]},
  { titre: "L'orientation", icone: "🧭", notions: [
    { t: "Le PP a une responsabilité spécifique dans l'information et la préparation progressive des choix d'orientation, dans le cadre du parcours Avenir, de la 6e à la terminale.", s: ["circ-2018-108", "parcours-avenir"] },
    { t: "Il coordonne, pour chaque élève, l'information et la préparation du choix d'orientation, en lien avec le psychologue de l'Éducation nationale.", s: ["circ-2018-108"] },
    { t: "Il conduit des entretiens personnalisés d'orientation (dès la 3e), inscrits tôt dans l'année et à tout moment selon les besoins.", s: ["circ-2018-108"] },
    { t: "Il explicite aux élèves et aux familles les procédures d'orientation, d'affectation et d'admission (dont Parcoursup) et les accompagne toute l'année.", s: ["circ-2018-108"] },
    { t: "En terminale, deux professeurs principaux sont nommés : ils coordonnent la préparation du conseil de classe, accompagnent les vœux et rédigent les avis (fiches Avenir).", s: ["circ-2018-108", "decret-2018-120"] }
  ]},
  { titre: "Posture : accompagner sans imposer", icone: "🤝", notions: [
    { t: "Accompagner, c'est écouter l'élève et sa famille, dialoguer, et introduire le champ des contraintes — pas imposer un choix.", s: ["guide-pp"] },
    { t: "Éviter les postures directives : le jugement, l'interrogatoire, l'interprétation.", s: ["guide-pp"] },
    { t: "« Faire un pas de côté » : transmettre des connaissances sur les métiers, proposer stages et visites, pour que l'élève prenne conscience de ses envies, de ses talents et des efforts nécessaires.", s: ["guide-pp"] }
  ]},
  { titre: "Outils pour l'orientation", icone: "🧰", notions: [
    { t: "Plateforme Avenir(s) (ONISEP) : socle de l'éducation à l'orientation (5e → terminale), portfolio de l'élève, tableau de bord de suivi, banque de plus de 700 activités.", s: ["plateforme-avenirs", "guide-pp"] },
    { t: "Référentiels des compétences à s'orienter (collège et lycée) : trois axes — connaissance de soi, connaissance des métiers et du monde professionnel, connaissance des formations.", s: ["guide-pp"] },
    { t: "ONISEP : « Mon orientation en ligne » (MOEL) et AllOnisep (la ligne directe des enseignants), guides et ressources.", s: ["guide-pp"] },
    { t: "Se former : parcours M@gistère dédiés, webinaires, plan Avenir.", s: ["guide-pp"] }
  ]},
  { titre: "Ce qu'il fait / ne fait pas", icone: "⚖️", notions: [
    { t: "IL FAIT : coordonner le suivi, faire le lien équipe ↔ famille, préparer et synthétiser pour le conseil de classe, accompagner l'orientation, conduire les entretiens, expliciter les procédures, coordonner les PFMP en lycée pro.", s: ["circ-2018-108"] },
    { t: "IL NE FAIT PAS : intervenir sur les champs disciplinaires des autres professeurs ; décider seul de l'orientation (c'est le chef d'établissement qui décide, après le conseil de classe) ; se substituer au psychologue de l'Éducation nationale, au CPE ou à la direction.", s: ["circ-2018-108"] },
    { t: "Il agit toujours « sous la responsabilité du chef d'établissement ».", s: ["circ-2018-108"] }
  ]},
  { titre: "Reconnaissance financière", icone: "💶", notions: [
    { t: "La fonction est rémunérée par la part modulable de l'indemnité de suivi et d'orientation des élèves (ISOE).", s: ["circ-2018-108", "isoe"] },
    { t: "Une seule part modulable par division — sauf en terminale (lycée général, technologique et professionnel) et dans les établissements classés sensibles, où deux professeurs par division la perçoivent.", s: ["circ-2018-108"] }
  ]},
  { titre: "Toutes les sources", icone: "📚", notions: [
    { t: "Texte central — Circulaire n°2018-108 du 10 octobre 2018 (rôle du professeur principal).", s: ["circ-2018-108"] },
    { t: "PFMP — Circulaire n°2016-053 du 29 mars 2016.", s: ["circ-2016-053"] },
    { t: "Orientation en terminale — Décret n°2018-120 du 20 février 2018.", s: ["decret-2018-120"] },
    { t: "Parcours Avenir — article L.331-7 du Code de l'éducation.", s: ["parcours-avenir"] },
    { t: "Désignation & équipes pédagogiques — Code de l'éducation, art. R.421-10 et R.421-49.", s: ["code-r42110", "code-r42149"] },
    { t: "Rémunération (ISOE) — Décret n°93-55 du 15 janvier 1993.", s: ["isoe"] },
    { t: "Guide pratique — Guide des professeurs principaux « Accompagner à l'orientation » (ONISEP / Avenir(s), 2025).", s: ["guide-pp"] }
  ]}
];
if (typeof window !== "undefined") { window.SITE = SITE; window.SOURCES = SOURCES; window.SECTIONS = SECTIONS; }
