/* ============================================================================
   École inclusive — guide de formation (cadre, dispositifs, troubles, public,
   pédagogie, supports). 100% local. Résumés ORIGINAUX (aucun extrait de livre
   ni du DSM recopié) ; chaque notion renvoie à une source de référence.
   RGPD : aucun nom d'élève.
============================================================================ */
const SOURCES = {
  "loi-2005": { type: "loi", ref: "Loi n°2005-102 du 11 février 2005", origine: "Égalité des droits et des chances, participation et citoyenneté des personnes handicapées. Pose le droit à la scolarisation et la compensation du handicap (création des MDPH).", url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000809647" },
  "loi-2013": { type: "loi", ref: "Loi du 8 juillet 2013 (refondation de l'École)", origine: "Inscrit le principe de l'école inclusive dans le code de l'éducation.", url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000027677984" },
  "loi-2019": { type: "loi", ref: "Loi du 26 juillet 2019 (École de la confiance)", origine: "Crée le service public de l'école inclusive et les PIAL (pôles inclusifs d'accompagnement localisés).", url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000038829065" },
  "code-L111-1": { type: "loi", ref: "Code de l'éducation, art. L111-1", origine: "Le service public de l'éducation veille à l'inclusion scolaire de tous les enfants, sans distinction.", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042103051" },
  "code-L351-1": { type: "loi", ref: "Code de l'éducation, art. L351-1", origine: "Modalités de scolarisation des élèves en situation de handicap (milieu ordinaire, dispositifs adaptés).", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042102998" },
  "eduscol-inclusive": { type: "reglement", ref: "Éduscol — École inclusive", origine: "Ressources officielles du ministère sur la scolarisation des élèves à besoins éducatifs particuliers et les dispositifs (PPS, PAP, PAI, PPRE).", url: "https://eduscol.education.gouv.fr/1224/ecole-inclusive" },
  "eduscol-plans": { type: "reglement", ref: "Éduscol — Les plans (PPS, PAP, PAI, PPRE)", origine: "Présentation officielle des quatre plans d'accompagnement et de leurs différences.", url: "https://eduscol.education.gouv.fr/1198/repondre-aux-besoins-educatifs-particuliers-des-eleves" },
  "dsm5": { type: "ouvrage", ref: "DSM-5 (APA)", origine: "Manuel diagnostique et statistique des troubles mentaux (American Psychiatric Association). Référence pour les critères des troubles du neurodéveloppement. Le diagnostic relève des professionnels de santé, pas de l'enseignant.", url: "" },
  "ife-differenciation": { type: "ouvrage", ref: "Différenciation pédagogique (Cnesco-Ifé)", origine: "Dossier de synthèse de la conférence de consensus sur la différenciation pédagogique.", url: "https://www.cnesco.fr/fr/differenciation-pedagogique/" },
  "corbion": { type: "ouvrage", ref: "L'école inclusive (S. Corbion)", origine: "Ouvrage de référence sur les enjeux et limites de l'école inclusive.", url: "" },
  "troubles-app": { type: "ouvrage", ref: "Les troubles d'apprentissage — comprendre", origine: "Ouvrage de synthèse sur les troubles des apprentissages (dys, TDAH…).", url: "" },
  "ash-aesh": { type: "reglement", ref: "Éduscol — AESH & PIAL", origine: "Accompagnants des élèves en situation de handicap ; organisation via les pôles inclusifs (PIAL).", url: "https://eduscol.education.gouv.fr/2065/aesh-et-pial" }
};

const SECTIONS = { pfmp: { label: "École inclusive", icone: "🏫",
  intro: "Comprendre les élèves à besoins éducatifs particuliers et adapter sa pédagogie.",
  themes: [
  { titre: "Le cadre & les principes", icone: "🏛️", notions: [
    { t: "L'école inclusive : tout enfant est scolarisé, en priorité en milieu ordinaire ; c'est à l'école de s'adapter à l'élève (accessibilité), pas l'inverse.", s: ["code-L111-1", "loi-2013"] },
    { t: "La loi de 2005 pose le droit à la scolarisation et la compensation du handicap ; elle crée les MDPH (maisons départementales des personnes handicapées).", s: ["loi-2005"] },
    { t: "La loi de 2019 crée le « service public de l'école inclusive » et les PIAL (organisation locale des AESH).", s: ["loi-2019", "ash-aesh"] },
    { t: "Besoins éducatifs particuliers (BEP) : notion large qui dépasse le handicap (troubles des apprentissages, allophonie, précocité, maladie, difficulté scolaire…). Tous n'ont pas besoin de la MDPH.", s: ["eduscol-inclusive"] },
    { t: "Distinction clé : difficulté scolaire (passagère, pédagogique) ≠ trouble (durable, qui nécessite des adaptations spécifiques) ≠ handicap (reconnu par la MDPH).", s: ["eduscol-inclusive", "troubles-app"] }
  ]},
  { titre: "Les 4 plans (PPS, PAP, PAI, PPRE)", icone: "🧩", notions: [
    { t: "PPS — Projet personnalisé de scolarisation : pour un élève reconnu handicapé. Décidé par la MDPH/CDAPH ; ouvre droit aux aides (AESH, matériel, ULIS, aménagements d'examens).", s: ["code-L351-1", "eduscol-plans"] },
    { t: "PAP — Plan d'accompagnement personnalisé : pour un élève avec un trouble des apprentissages (dys, TDAH…), SANS passer par la MDPH. Aménagements pédagogiques, sur avis du médecin scolaire.", s: ["eduscol-plans"] },
    { t: "PAI — Projet d'accueil individualisé : pour un élève avec une maladie (asthme, diabète, allergie, épilepsie…). Organise les soins, traitements et conduites à tenir. Coordonné par le médecin scolaire.", s: ["eduscol-plans"] },
    { t: "PPRE — Programme personnalisé de réussite éducative : pour une difficulté scolaire. Outil interne, pédagogique, sans condition médicale.", s: ["eduscol-plans"] },
    { t: "Repère : MDPH → PPS (handicap) ; trouble des apprentissages → PAP ; maladie → PAI ; difficulté scolaire → PPRE.", s: ["eduscol-plans"] }
  ]},
  { titre: "Les acteurs & dispositifs", icone: "👥", notions: [
    { t: "MDPH / CDAPH : évaluent les besoins et notifient les droits (AESH, orientation ULIS, matériel pédagogique adapté, aménagements d'examens).", s: ["loi-2005"] },
    { t: "Enseignant référent (handicap) : suit le parcours des élèves avec PPS et anime l'équipe de suivi de la scolarisation (ESS). À ne pas confondre avec le référent PFMP.", s: ["code-L351-1", "eduscol-inclusive"] },
    { t: "AESH : accompagnant d'élève en situation de handicap ; aide humaine notifiée par la MDPH, organisée localement via le PIAL.", s: ["ash-aesh"] },
    { t: "ULIS : unité localisée pour l'inclusion scolaire — dispositif (pas une classe à part) permettant des temps adaptés tout en suivant la scolarité en classe ordinaire ; coordonné par un coordonnateur ULIS.", s: ["eduscol-inclusive"] },
    { t: "SEGPA / EREA : structures pour les élèves en grande difficulté scolaire durable (SEGPA) ou en situation de handicap nécessitant un internat éducatif et adapté (EREA).", s: ["eduscol-inclusive"] },
    { t: "GEVA-Sco : guide d'évaluation des besoins de l'élève, support commun entre l'école et la MDPH.", s: ["eduscol-inclusive"] }
  ]},
  { titre: "Comprendre les troubles (TND)", icone: "🧠", notions: [
    { t: "Troubles du neurodéveloppement (TND) : apparaissent tôt, durables, liés au fonctionnement du cerveau — pas à un manque de travail ou d'intelligence. Le diagnostic relève des professionnels de santé.", s: ["dsm5", "troubles-app"] },
    { t: "TSA — trouble du spectre de l'autisme : différences durables dans la communication/interaction sociale ET intérêts restreints / comportements répétitifs ; sensibilités sensorielles fréquentes. Spectre = grande variété de profils.", s: ["dsm5"] },
    { t: "TDAH — trouble déficit de l'attention avec ou sans hyperactivité : difficultés d'attention, d'inhibition (impulsivité) et parfois agitation motrice ; impact sur l'organisation et la mémoire de travail.", s: ["dsm5", "troubles-app"] },
    { t: "Troubles « dys » : dyslexie (lecture), dysorthographie (orthographe), dyscalculie (nombres/calcul), dysphasie (langage oral), dyspraxie/TDC (coordination, geste, écriture), dysgraphie (écriture). Souvent associés entre eux.", s: ["troubles-app"] },
    { t: "TDI — trouble du développement intellectuel : limitations du fonctionnement intellectuel ET du comportement adaptatif. On parle de potentiel à étayer, pas d'incapacité.", s: ["dsm5"] },
    { t: "Troubles psychiques, déficiences sensorielles (auditive, visuelle) et motrices : besoins spécifiques d'accessibilité (matériel, communication, environnement).", s: ["eduscol-inclusive"] }
  ]},
  { titre: "Le public & ses besoins", icone: "🧒", notions: [
    { t: "Raisonner par BESOINS plutôt que par étiquette : attention, mémoire de travail, langage, lecture, écriture, repérage dans l'espace/temps, fatigabilité, gestion émotionnelle, sensorialité.", s: ["eduscol-inclusive", "ife-differenciation"] },
    { t: "Fatigabilité & charge cognitive : beaucoup d'élèves se fatiguent vite (effort de compensation). Alléger la charge (une tâche à la fois, consignes courtes) améliore l'accès aux apprentissages.", s: ["troubles-app"] },
    { t: "Estime de soi : les troubles durables fragilisent l'estime de soi (échecs répétés). Valoriser les réussites et expliciter les progrès est un levier essentiel.", s: ["corbion"] },
    { t: "Double tâche : éviter de cumuler deux efforts coûteux (ex. lire ET comprendre, copier ET écouter). Délester l'un pour permettre l'autre.", s: ["troubles-app"] }
  ]},
  { titre: "Pédagogie adaptée", icone: "🎒", notions: [
    { t: "Différenciation pédagogique : varier les contenus, supports, démarches et rythmes pour un même objectif. Ce n'est pas « faire moins », mais « faire autrement » pour viser le même apprentissage.", s: ["ife-differenciation"] },
    { t: "Accessibilité pédagogique (conception universelle) : prévoir dès la préparation des supports accessibles à tous (clarté, plusieurs entrées). Ce qui aide les élèves à besoins particuliers aide souvent toute la classe.", s: ["ife-differenciation"] },
    { t: "Enseignement explicite : annoncer l'objectif, modéliser (« je montre »), guider, puis rendre autonome ; vérifier la compréhension régulièrement.", s: ["ife-differenciation"] },
    { t: "Étayage : aides temporaires (modèles, amorces, exemples, reformulation) qu'on retire progressivement à mesure que l'élève réussit.", s: ["ife-differenciation"] },
    { t: "Cadre rassurant : routines stables, consignes prévisibles, repères visuels du temps et des étapes — particulièrement aidant pour les TSA et les TDAH.", s: ["dsm5", "troubles-app"] }
  ]},
  { titre: "Supports & aménagements", icone: "🛠️", notions: [
    { t: "Lisibilité : police sans empattement (Arial, Verdana, OpenDyslexic), taille ≥ 14, interligne aéré, peu de texte par page, surligner l'essentiel, éviter le bleu/rouge difficilement lisible.", s: ["troubles-app", "ife-differenciation"] },
    { t: "Consignes : courtes, une idée à la fois, numérotées ; reformuler et faire reformuler ; donner un exemple fait.", s: ["ife-differenciation"] },
    { t: "Outils : cartes mentales, time-timer, tableaux/listes à cocher, supports numériques (lecture vocale, dictée, traitement de texte), calculatrice/tables autorisées selon le plan.", s: ["eduscol-inclusive"] },
    { t: "Délester l'écrit : textes à trous, photocopie du cours, prise de notes allégée, temps majoré ; pour la dyspraxie, privilégier l'oral et le numérique.", s: ["troubles-app"] },
    { t: "Aménagements d'examens (CCF, examens) : temps majoré (souvent 1/3 temps), secrétaire/assistant, matériel adapté, sujets adaptés — notifiés via le PPS/PAP et l'autorité académique.", s: ["code-L351-1", "eduscol-plans"] }
  ]},
  { titre: "Pour aller plus loin", icone: "📚", notions: [
    { t: "Cadre & dispositifs — Éduscol « École inclusive » et la page sur les 4 plans.", s: ["eduscol-inclusive", "eduscol-plans"] },
    { t: "Lois fondatrices — 2005 (droits & MDPH), 2013 (refondation), 2019 (service public de l'école inclusive).", s: ["loi-2005", "loi-2013", "loi-2019"] },
    { t: "Troubles — DSM-5 (critères, réservé aux professionnels de santé) et les ouvrages sur les troubles des apprentissages.", s: ["dsm5", "troubles-app"] },
    { t: "Pédagogie — la différenciation pédagogique (Cnesco-Ifé) et « L'école inclusive » (S. Corbion).", s: ["ife-differenciation", "corbion"] }
  ]}
] } };

const FLASHCARDS = { pfmp: [
  { q: "Quel plan pour un élève reconnu handicapé (MDPH) ?", r: "Le PPS (projet personnalisé de scolarisation).", s: ["eduscol-plans"] },
  { q: "Quel plan pour un trouble dys, sans MDPH ?", r: "Le PAP (plan d'accompagnement personnalisé), sur avis du médecin scolaire.", s: ["eduscol-plans"] },
  { q: "Quel plan pour une maladie (asthme, diabète, allergie) ?", r: "Le PAI (projet d'accueil individualisé).", s: ["eduscol-plans"] },
  { q: "Quel plan pour une difficulté scolaire, sans aspect médical ?", r: "Le PPRE (programme personnalisé de réussite éducative).", s: ["eduscol-plans"] },
  { q: "Que signifie ULIS ?", r: "Unité localisée pour l'inclusion scolaire — un dispositif, pas une classe à part.", s: ["eduscol-inclusive"] },
  { q: "Qui notifie une aide humaine (AESH) ?", r: "La MDPH / CDAPH ; elle est organisée localement via le PIAL.", s: ["ash-aesh"] },
  { q: "TSA, c'est quoi en deux mots ?", r: "Trouble du spectre de l'autisme : communication/interaction + intérêts restreints/répétitifs, souvent avec particularités sensorielles.", s: ["dsm5"] },
  { q: "La différenciation, c'est « faire moins » ?", r: "Non : faire AUTREMENT pour viser le MÊME objectif.", s: ["ife-differenciation"] },
  { q: "Un principe de support pour les dys ?", r: "Police lisible, consignes courtes, délester l'écrit, éviter la double tâche.", s: ["troubles-app"] },
  { q: "L'enseignant pose-t-il le diagnostic d'un trouble ?", r: "Non : le diagnostic relève des professionnels de santé. L'enseignant observe, adapte et alerte.", s: ["dsm5"] }
] };

const QUIZ = { pfmp: [
  { q: "Un élève reconnu handicapé par la MDPH relève du…", o: ["PAP", "PPS", "PPRE"], c: 1, s: ["eduscol-plans"] },
  { q: "Un élève diabétique (organisation des soins) relève du…", o: ["PAI", "PPS", "PAP"], c: 0, s: ["eduscol-plans"] },
  { q: "Un élève dyslexique sans dossier MDPH relève du…", o: ["PPS", "PAP", "PAI"], c: 1, s: ["eduscol-plans"] },
  { q: "ULIS est…", o: ["une classe séparée", "un dispositif d'inclusion"], c: 1, s: ["eduscol-inclusive"] },
  { q: "La loi qui crée le service public de l'école inclusive et les PIAL, c'est…", o: ["2005", "2013", "2019"], c: 2, s: ["loi-2019"] },
  { q: "Différencier, c'est…", o: ["baisser les exigences", "varier les chemins vers le même objectif"], c: 1, s: ["ife-differenciation"] },
  { q: "Le diagnostic d'un trouble est posé par…", o: ["l'enseignant", "les professionnels de santé"], c: 1, s: ["dsm5"] }
] };

const SCENARIOS = [
  { cas: "Un élève n'arrive pas à copier le cours au tableau", etapes: ["Penser dyspraxie/dysgraphie ou lenteur : délester l'écrit.", "Fournir le cours photocopié / à trous, autoriser le numérique.", "Éviter la double tâche (copier + écouter).", "Si durable, en parler à la famille et au médecin scolaire (PAP)."], s: ["troubles-app", "eduscol-plans"] },
  { cas: "Un élève très agité, ne tient pas en place, perd ses affaires", etapes: ["Penser TDAH (à confirmer par un professionnel de santé).", "Cadre clair, consignes courtes, tâches fractionnées, repères visuels du temps.", "Valoriser les réussites ; placer l'élève au calme.", "Échanger avec la famille → médecin scolaire (PAP/PPS selon les cas)."], s: ["dsm5", "eduscol-plans"] },
  { cas: "Un élève avec autisme supporte mal les changements et le bruit", etapes: ["Routines stables, emploi du temps visuel, annoncer les changements.", "Réduire les stimulations sensorielles ; prévoir un espace calme.", "Consignes explicites et littérales.", "S'appuyer sur le PPS / l'AESH et l'enseignant référent."], s: ["dsm5", "eduscol-inclusive"] },
  { cas: "Un élève a une notification MDPH d'aménagements d'examen", etapes: ["Vérifier le PPS et la notification (temps majoré, matériel, secrétaire…).", "Anticiper l'organisation avec l'établissement et l'autorité académique.", "Appliquer les mêmes aménagements en CCF et en cours quand c'est possible."], s: ["code-L351-1", "eduscol-plans"] },
  { cas: "Un élève malade doit prendre un traitement / a un risque (allergie)", etapes: ["Mettre en place un PAI avec le médecin scolaire.", "Connaître la conduite à tenir et la trousse d'urgence.", "Informer l'équipe concernée (discrétion)."], s: ["eduscol-plans"] }
];

const GLOSSAIRE = [
  ["BEP / EBEP", "Besoins éducatifs particuliers — élèves à besoins éducatifs particuliers."],
  ["MDPH", "Maison départementale des personnes handicapées — évalue les besoins liés au handicap."],
  ["CDAPH", "Commission des droits et de l'autonomie des personnes handicapées — notifie les droits."],
  ["PPS", "Projet personnalisé de scolarisation — pour un élève handicapé (via MDPH)."],
  ["PAP", "Plan d'accompagnement personnalisé — pour un trouble des apprentissages (sans MDPH)."],
  ["PAI", "Projet d'accueil individualisé — pour une maladie / des soins."],
  ["PPRE", "Programme personnalisé de réussite éducative — pour une difficulté scolaire."],
  ["ESS", "Équipe de suivi de la scolarisation — suit le PPS, animée par l'enseignant référent."],
  ["GEVA-Sco", "Guide d'évaluation des besoins de scolarisation (école ↔ MDPH)."],
  ["ULIS", "Unité localisée pour l'inclusion scolaire — dispositif d'inclusion."],
  ["AESH", "Accompagnant d'élève en situation de handicap — aide humaine notifiée."],
  ["PIAL", "Pôle inclusif d'accompagnement localisé — organise les AESH."],
  ["SEGPA", "Section d'enseignement général et professionnel adapté."],
  ["EREA", "Établissement régional d'enseignement adapté."],
  ["TND", "Troubles du neurodéveloppement (TSA, TDAH, dys, TDI…)."],
  ["TSA", "Trouble du spectre de l'autisme."],
  ["TDAH", "Trouble déficit de l'attention avec ou sans hyperactivité."],
  ["DYS", "Troubles spécifiques des apprentissages (dyslexie, dyspraxie, dyscalculie…)."],
  ["TDI", "Trouble du développement intellectuel."],
  ["TDC", "Trouble développemental de la coordination (dyspraxie)."],
  ["CUA", "Conception universelle des apprentissages — accessibilité pour tous dès la conception."],
  ["DSM-5", "Manuel diagnostique des troubles mentaux (référence des critères ; usage médical)."]
];

if (typeof window !== "undefined") {
  window.SOURCES = SOURCES; window.SECTIONS = SECTIONS; window.FLASHCARDS = FLASHCARDS;
  window.QUIZ = QUIZ; window.SCENARIOS = SCENARIOS; window.GLOSSAIRE = GLOSSAIRE;
}
