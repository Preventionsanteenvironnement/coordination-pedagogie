/* ============================================================================
   École inclusive — guide de formation (à jour 2024-2026). 100% local.
   Résumés ORIGINAUX (aucun extrait de livre ni du DSM recopié). Chaque notion
   renvoie à une source officielle ou de référence. RGPD : aucun nom d'élève.
============================================================================ */
const SOURCES = {
  "loi-2005": { type: "loi", ref: "Loi n°2005-102 du 11 février 2005", origine: "Égalité des droits et des chances des personnes handicapées : droit à la scolarisation, compensation, création des MDPH.", url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000809647" },
  "loi-2013": { type: "loi", ref: "Loi du 8 juillet 2013 (refondation de l'École)", origine: "Inscrit le principe de l'école inclusive dans le code de l'éducation.", url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000027677984" },
  "loi-2019": { type: "loi", ref: "Loi du 26 juillet 2019 (École de la confiance)", origine: "Service public de l'école inclusive ; a créé les PIAL (en cours de remplacement par les pôles d'appui à la scolarité).", url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000038829065" },
  "loi-2024-475": { type: "loi", ref: "Loi n°2024-475 du 27 mai 2024", origine: "Acte II de l'école inclusive : prise en charge par l'État de l'accompagnement humain (AESH) sur le temps de pause méridienne ; cadre des pôles d'appui à la scolarité.", url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000049599271" },
  "code-L111-1": { type: "loi", ref: "Code de l'éducation, art. L111-1", origine: "Le service public de l'éducation veille à l'inclusion scolaire de tous les enfants.", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042103051" },
  "code-L351-1": { type: "loi", ref: "Code de l'éducation, art. L351-1", origine: "Modalités de scolarisation des élèves en situation de handicap.", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042102998" },
  "eduscol-inclusive": { type: "reglement", ref: "Éduscol — École inclusive", origine: "Ressources officielles : scolarisation des élèves à besoins éducatifs particuliers, dispositifs.", url: "https://eduscol.education.gouv.fr/1224/ecole-inclusive" },
  "eduscol-plans": { type: "reglement", ref: "Éduscol — Répondre aux BEP (PPS, PAP, PAI, PPRE)", origine: "Présentation officielle des quatre plans et de leurs différences.", url: "https://eduscol.education.gouv.fr/1198/repondre-aux-besoins-educatifs-particuliers-des-eleves" },
  "circ-pas-2025": { type: "reglement", ref: "Déploiement des pôles d'appui à la scolarité (BO, rentrée 2025)", origine: "Circulaire + cahier des charges 2025 des PAS : missions, réponses de premier niveau, organisation, déploiement.", url: "https://www.education.gouv.fr/bo/2025/Hebdo33/MENE2520651C" },
  "circ-pas-2024": { type: "reglement", ref: "Pôles d'appui à la scolarité préfigurateurs (BO 2024)", origine: "Lancement des PAS dans 4 départements préfigurateurs (Aisne, Côte-d'Or, Eure-et-Loir, Var) à la rentrée 2024.", url: "https://www.education.gouv.fr/bo/2024/Hebdo27/MENE2416076C" },
  "lpi": { type: "reglement", ref: "Éduscol — Livret de parcours inclusif (LPI)", origine: "Outil numérique qui regroupe les aménagements et le parcours de l'élève (PAP, PPS, réponses de premier niveau du PAS).", url: "https://eduscol.education.gouv.fr/3157/livret-de-parcours-inclusif-lpi" },
  "ash-aesh": { type: "reglement", ref: "Éduscol — AESH", origine: "Accompagnants des élèves en situation de handicap : aide humaine notifiée, désormais organisée via les pôles d'appui à la scolarité.", url: "https://eduscol.education.gouv.fr/2065/aesh-et-pial" },
  "dsm5": { type: "ouvrage", ref: "DSM-5 (APA)", origine: "Manuel diagnostique et statistique des troubles mentaux. Référence des critères des troubles du neurodéveloppement. Le diagnostic relève des professionnels de santé, jamais de l'enseignant.", url: "" },
  "ife-differenciation": { type: "ouvrage", ref: "Différenciation pédagogique (Cnesco-Ifé)", origine: "Dossier de synthèse de la conférence de consensus sur la différenciation pédagogique.", url: "https://www.cnesco.fr/fr/differenciation-pedagogique/" },
  "corbion": { type: "ouvrage", ref: "L'école inclusive (S. Corbion)", origine: "Ouvrage de référence sur les enjeux et limites de l'école inclusive.", url: "" },
  "troubles-app": { type: "ouvrage", ref: "Les troubles d'apprentissage — comprendre", origine: "Ouvrage de synthèse sur les troubles des apprentissages (dys, TDAH…).", url: "" }
};

const SECTIONS = { pfmp: { label: "École inclusive", icone: "🏫",
  intro: "Comprendre les élèves à besoins éducatifs particuliers et adapter sa pédagogie — à jour des textes 2024-2026.",
  themes: [
  { titre: "Le cadre & les principes", icone: "🏛️", notions: [
    { t: "L'école inclusive : tout enfant est scolarisé, en priorité en milieu ordinaire ; c'est à l'École de s'adapter à l'élève (accessibilité), et non l'inverse.", s: ["code-L111-1", "loi-2013"] },
    { t: "La loi de 2005 pose le droit à la scolarisation et la compensation du handicap ; elle crée les MDPH.", s: ["loi-2005"] },
    { t: "La loi de 2019 crée le « service public de l'école inclusive ». La loi du 27 mai 2024 (« acte II ») fait prendre en charge par l'État l'AESH sur la pause méridienne et installe les pôles d'appui à la scolarité.", s: ["loi-2019", "loi-2024-475"] },
    { t: "Besoins éducatifs particuliers (BEP) : notion large qui dépasse le handicap (troubles des apprentissages, allophonie, précocité, maladie, difficulté scolaire…). Tous ne relèvent pas de la MDPH.", s: ["eduscol-inclusive"] },
    { t: "Trois niveaux à distinguer : la difficulté scolaire (passagère, pédagogique) ≠ le trouble (durable, nécessite des adaptations spécifiques) ≠ le handicap (reconnu par la MDPH).", s: ["eduscol-inclusive", "troubles-app"] },
    { t: "L'enseignant n'établit pas de diagnostic : il observe, décrit les besoins, met en place des adaptations et alerte. Le diagnostic relève des professionnels de santé.", s: ["dsm5"] }
  ]},
  { titre: "Les 4 plans (PPS, PAP, PAI, PPRE)", icone: "🧩", notions: [
    { t: "PPS — Projet personnalisé de scolarisation : pour un élève reconnu handicapé. Décidé par la MDPH/CDAPH ; ouvre droit aux aides (AESH, matériel adapté, orientation ULIS, aménagements d'examens).", s: ["code-L351-1", "eduscol-plans"] },
    { t: "PAP — Plan d'accompagnement personnalisé : pour un trouble des apprentissages durable (dys, TDAH…), SANS passer par la MDPH. Aménagements pédagogiques, sur avis du médecin scolaire.", s: ["eduscol-plans"] },
    { t: "PAI — Projet d'accueil individualisé : pour une maladie ou un trouble de santé (asthme, diabète, allergie, épilepsie…). Organise traitements, régimes et conduites à tenir. Coordonné par le médecin scolaire.", s: ["eduscol-plans"] },
    { t: "PPRE — Programme personnalisé de réussite éducative : pour une difficulté scolaire. Outil interne, pédagogique, sans condition médicale ni MDPH.", s: ["eduscol-plans"] },
    { t: "Repère rapide : MDPH/handicap → PPS · trouble des apprentissages → PAP · maladie/soins → PAI · difficulté scolaire → PPRE.", s: ["eduscol-plans"] },
    { t: "Les aménagements (PAP, PPS, réponses du PAS) sont consignés dans le LPI (livret de parcours inclusif), outil numérique qui suit l'élève.", s: ["lpi"] }
  ]},
  { titre: "Quel plan ? — cas concrets", icone: "🎯", notions: [
    { t: "« Mon élève a un bilan orthophonique de dyslexie, pas de dossier MDPH. » → PAP (avis du médecin scolaire) : police lisible, temps majoré, allègement de l'écrit. Démarche : en parler à la famille → médecin scolaire.", s: ["eduscol-plans"] },
    { t: "« Mon élève a une notification MDPH avec AESH. » → PPS : appliquer les aides notifiées, s'appuyer sur l'AESH et l'enseignant référent ; aménagements d'examens via la procédure académique.", s: ["code-L351-1", "eduscol-plans"] },
    { t: "« Mon élève est diabétique / a une allergie sévère. » → PAI : protocole de soins, trousse d'urgence, conduite à tenir connue de l'équipe. Démarche : médecin scolaire + famille.", s: ["eduscol-plans"] },
    { t: "« Mon élève décroche en maths depuis quelques mois, sans trouble identifié. » → PPRE : objectifs ciblés, soutien, étayage, point régulier. Outil interne, rapide à mettre en place.", s: ["eduscol-plans"] },
    { t: "« Je soupçonne un trouble mais rien n'est posé. » → ne pas attendre : adaptations pédagogiques immédiates + saisine du pôle d'appui à la scolarité (réponses de premier niveau) ; orienter la famille vers un bilan.", s: ["circ-pas-2025"] },
    { t: "« L'élève a besoin d'un ordinateur / d'un logiciel adapté. » → matériel pédagogique adapté : réponse possible de premier niveau via le PAS, ou notification MDPH selon les cas.", s: ["circ-pas-2025"] },
    { t: "« La famille refuse d'engager une démarche MDPH. » → on agit quand même au niveau pédagogique (PAP possible, PPRE, réponses du PAS) ; le PAS peut accompagner la famille vers la MDPH, sans l'imposer.", s: ["circ-pas-2025", "eduscol-plans"] }
  ]},
  { titre: "PAS, LPI & AESH (actualité)", icone: "🆕", notions: [
    { t: "Les pôles d'appui à la scolarité (PAS) remplacent progressivement les PIAL : interlocuteur de proximité pour les familles et les enseignants, plus réactif et mieux doté.", s: ["circ-pas-2025", "loi-2024-475"] },
    { t: "Composition : une équipe associant des personnels de l'Éducation nationale et un professionnel du secteur médico-social, pilotée par un coordonnateur.", s: ["circ-pas-2025"] },
    { t: "Réponses de premier niveau (SANS reconnaissance de handicap ni notification CDAPH obligatoire) : aménagements pédagogiques (consignés au LPI), matériel pédagogique adapté, première aide humaine.", s: ["circ-pas-2025"] },
    { t: "Le PAS accompagne aussi les familles pour le dossier MDPH et met en œuvre l'aide humaine (AESH) notifiée par la MDPH.", s: ["circ-pas-2025", "ash-aesh"] },
    { t: "Où en est-on ? 4 départements préfigurateurs en 2024 ; environ 500 PAS déployés et 5 nouveaux départements généralisés à la rentrée 2025 ; objectif de généralisation nationale. Le PIAL coexiste pendant la transition.", s: ["circ-pas-2024", "circ-pas-2025"] },
    { t: "AESH : aide humaine notifiée par la MDPH ; depuis la loi du 27 mai 2024, l'État la prend en charge aussi sur la pause méridienne.", s: ["loi-2024-475", "ash-aesh"] }
  ]},
  { titre: "Acteurs & dispositifs", icone: "👥", notions: [
    { t: "MDPH / CDAPH : évaluent les besoins liés au handicap et notifient les droits (AESH, ULIS, matériel adapté, aménagements d'examens).", s: ["loi-2005"] },
    { t: "Enseignant référent (handicap) : suit les élèves avec PPS et anime l'équipe de suivi de la scolarisation (ESS). À ne pas confondre avec le référent PFMP.", s: ["code-L351-1", "eduscol-inclusive"] },
    { t: "ULIS : unité localisée pour l'inclusion scolaire — un dispositif (pas une classe à part), coordonné par un coordonnateur ULIS, avec inclusion en classe ordinaire.", s: ["eduscol-inclusive"] },
    { t: "SEGPA / EREA : pour les élèves en grande difficulté scolaire durable (SEGPA) ou en situation de handicap nécessitant un internat adapté (EREA).", s: ["eduscol-inclusive"] },
    { t: "GEVA-Sco : guide d'évaluation des besoins, support commun école ↔ MDPH.", s: ["eduscol-inclusive"] }
  ]},
  { titre: "Comprendre les troubles (TND)", icone: "🧠", notions: [
    { t: "Troubles du neurodéveloppement (TND) : apparaissent tôt, durables, liés au fonctionnement du cerveau — pas à un manque de travail ni d'intelligence.", s: ["dsm5", "troubles-app"] },
    { t: "TSA — trouble du spectre de l'autisme : différences durables de communication/interaction sociale ET intérêts restreints / comportements répétitifs ; particularités sensorielles fréquentes. « Spectre » = grande diversité de profils.", s: ["dsm5"] },
    { t: "TDAH — déficit de l'attention avec ou sans hyperactivité : difficultés d'attention, d'inhibition (impulsivité), parfois agitation ; impact sur l'organisation et la mémoire de travail.", s: ["dsm5", "troubles-app"] },
    { t: "Troubles « dys » : dyslexie (lecture), dysorthographie (orthographe), dyscalculie (nombres/calcul), dysphasie (langage oral), dyspraxie/TDC (coordination, geste, écriture), dysgraphie (écriture). Souvent associés.", s: ["troubles-app"] },
    { t: "TDI — trouble du développement intellectuel : limitations du fonctionnement intellectuel ET du comportement adaptatif. On vise un potentiel à étayer.", s: ["dsm5"] },
    { t: "Troubles psychiques, déficiences sensorielles (auditive, visuelle) et motrices : besoins d'accessibilité spécifiques (communication, matériel, environnement).", s: ["eduscol-inclusive"] }
  ]},
  { titre: "Le public & ses besoins", icone: "🧒", notions: [
    { t: "Raisonner par BESOINS plutôt que par étiquette : attention, mémoire de travail, langage, lecture, écriture, repérage espace/temps, fatigabilité, gestion émotionnelle, sensorialité.", s: ["eduscol-inclusive", "ife-differenciation"] },
    { t: "Fatigabilité & charge cognitive : l'effort de compensation fatigue vite. Alléger la charge (une tâche à la fois, consignes courtes) améliore l'accès aux apprentissages.", s: ["troubles-app"] },
    { t: "Éviter la double tâche : ne pas cumuler deux efforts coûteux (lire ET comprendre, copier ET écouter). Délester l'un pour permettre l'autre.", s: ["troubles-app"] },
    { t: "Estime de soi : les troubles durables fragilisent l'estime de soi (échecs répétés). Valoriser les réussites et expliciter les progrès est un levier essentiel.", s: ["corbion"] }
  ]},
  { titre: "Pédagogie adaptée", icone: "🎒", notions: [
    { t: "Différenciation pédagogique : varier contenus, supports, démarches et rythmes pour un MÊME objectif. Ce n'est pas « faire moins », mais « faire autrement ».", s: ["ife-differenciation"] },
    { t: "Conception universelle des apprentissages (CUA) : prévoir dès la préparation des supports accessibles à tous (clarté, plusieurs entrées). Ce qui aide les élèves à besoins particuliers aide souvent toute la classe.", s: ["ife-differenciation"] },
    { t: "Enseignement explicite : annoncer l'objectif, modéliser (« je montre »), guider (« on fait ensemble »), rendre autonome (« tu fais ») ; vérifier souvent la compréhension.", s: ["ife-differenciation"] },
    { t: "Étayage : aides temporaires (modèles, amorces, exemples, reformulation) retirées progressivement à mesure de la réussite.", s: ["ife-differenciation"] },
    { t: "Cadre rassurant : routines stables, consignes prévisibles, repères visuels du temps et des étapes — particulièrement aidant pour TSA et TDAH.", s: ["dsm5", "troubles-app"] }
  ]},
  { titre: "Construire un cours adapté", icone: "🛠️", notions: [
    { t: "1) Cibler l'essentiel : un objectif clair par séance, des attendus explicites, et identifier ce qui est non négociable vs accessoire.", s: ["ife-differenciation"] },
    { t: "2) Prévoir l'accessibilité dès la conception : support lisible (police sans empattement, taille ≥ 14, aéré), une consigne à la fois, un exemple fait.", s: ["ife-differenciation", "troubles-app"] },
    { t: "3) Plusieurs entrées : proposer le même contenu à l'oral, à l'écrit et en visuel (schéma, carte mentale) pour ne pas dépendre d'un seul canal.", s: ["ife-differenciation"] },
    { t: "4) Délester ce qui n'est pas l'objectif : cours à trous, photocopie, dictée à l'adulte/numérique, calculatrice ou tables si l'objectif n'est pas le calcul.", s: ["troubles-app"] },
    { t: "5) Rythmer & sécuriser : étapes visibles, time-timer, pauses, vérifications régulières, droit à l'erreur, valorisation.", s: ["ife-differenciation"] },
    { t: "6) Prévoir 3 niveaux d'étayage pour une même tâche (autonome / avec aide / fortement guidé) plutôt que des exercices différents : même objectif, chemins différents.", s: ["ife-differenciation"] },
    { t: "7) Évaluer autrement : critères explicites, valoriser le progrès, aménager (temps, format oral, supports) sans baisser l'exigence de l'objectif.", s: ["ife-differenciation", "eduscol-plans"] }
  ]},
  { titre: "Supports & aménagements", icone: "📐", notions: [
    { t: "Lisibilité : police sans empattement (Arial, Verdana, OpenDyslexic), taille ≥ 14, interligne aéré, peu de texte par page, surligner l'essentiel.", s: ["troubles-app", "ife-differenciation"] },
    { t: "Consignes : courtes, une idée à la fois, numérotées ; reformuler et faire reformuler ; donner un exemple fait.", s: ["ife-differenciation"] },
    { t: "Outils : cartes mentales, time-timer, listes à cocher, supports numériques (lecture vocale, dictée, traitement de texte), matériel pédagogique adapté (réponse possible du PAS).", s: ["circ-pas-2025", "eduscol-inclusive"] },
    { t: "Délester l'écrit : textes à trous, cours photocopié, prise de notes allégée, temps majoré ; pour la dyspraxie, privilégier l'oral et le numérique.", s: ["troubles-app"] },
    { t: "Aménagements d'examens (CCF, examens) : temps majoré (souvent 1/3 temps), secrétaire/assistant, matériel adapté, sujets adaptés — notifiés via le PPS/PAP et l'autorité académique.", s: ["code-L351-1", "eduscol-plans"] }
  ]},
  { titre: "Pour aller plus loin", icone: "📚", notions: [
    { t: "Cadre & dispositifs — Éduscol « École inclusive » et la page sur les 4 plans.", s: ["eduscol-inclusive", "eduscol-plans"] },
    { t: "Actualité — circulaires de déploiement des pôles d'appui à la scolarité (2024, 2025) et LPI.", s: ["circ-pas-2025", "circ-pas-2024", "lpi"] },
    { t: "Lois — 2005, 2013, 2019, 2024 (acte II).", s: ["loi-2005", "loi-2013", "loi-2019", "loi-2024-475"] },
    { t: "Troubles & pédagogie — DSM-5 (usage médical), troubles des apprentissages, différenciation (Cnesco-Ifé), L'école inclusive (Corbion).", s: ["dsm5", "troubles-app", "ife-differenciation", "corbion"] }
  ]}
] } };

const FLASHCARDS = { pfmp: [
  { q: "Élève reconnu handicapé par la MDPH → quel plan ?", r: "Le PPS (projet personnalisé de scolarisation).", s: ["eduscol-plans"] },
  { q: "Trouble dys, sans MDPH → quel plan ?", r: "Le PAP, sur avis du médecin scolaire.", s: ["eduscol-plans"] },
  { q: "Maladie / soins (diabète, allergie) → quel plan ?", r: "Le PAI (projet d'accueil individualisé).", s: ["eduscol-plans"] },
  { q: "Difficulté scolaire, sans aspect médical → quel plan ?", r: "Le PPRE.", s: ["eduscol-plans"] },
  { q: "Qu'est-ce qui remplace le PIAL ?", r: "Le pôle d'appui à la scolarité (PAS), déployé progressivement depuis 2024.", s: ["circ-pas-2025"] },
  { q: "Le PAS peut-il agir sans notification MDPH ?", r: "Oui : réponses de premier niveau (aménagements, matériel adapté, 1re aide humaine), sans reconnaissance de handicap.", s: ["circ-pas-2025"] },
  { q: "Où sont consignés les aménagements de l'élève ?", r: "Dans le LPI (livret de parcours inclusif).", s: ["lpi"] },
  { q: "Nouveauté de la loi du 27 mai 2024 sur les AESH ?", r: "L'État prend en charge l'AESH sur la pause méridienne.", s: ["loi-2024-475"] },
  { q: "ULIS, c'est une classe à part ?", r: "Non : un dispositif d'inclusion (inclusion en classe ordinaire).", s: ["eduscol-inclusive"] },
  { q: "L'enseignant pose-t-il le diagnostic d'un trouble ?", r: "Non : il observe, adapte et alerte ; le diagnostic relève des professionnels de santé.", s: ["dsm5"] },
  { q: "Différencier, c'est faire moins ?", r: "Non : faire AUTREMENT pour viser le MÊME objectif.", s: ["ife-differenciation"] },
  { q: "Un réflexe pour les dys ?", r: "Police lisible, consignes courtes, délester l'écrit, éviter la double tâche.", s: ["troubles-app"] },
  { q: "TSA en deux mots ?", r: "Communication/interaction + intérêts restreints/répétitifs, souvent avec particularités sensorielles.", s: ["dsm5"] },
  { q: "Que faire si la famille refuse la MDPH ?", r: "Agir au niveau pédagogique (PAP/PPRE, réponses du PAS) ; le PAS peut accompagner sans imposer.", s: ["circ-pas-2025"] }
] };

const QUIZ = { pfmp: [
  { q: "Un élève reconnu handicapé (MDPH) relève du…", o: ["PAP", "PPS", "PPRE"], c: 1, s: ["eduscol-plans"] },
  { q: "Un élève diabétique (organisation des soins) relève du…", o: ["PAI", "PPS", "PAP"], c: 0, s: ["eduscol-plans"] },
  { q: "Un élève dyslexique sans dossier MDPH relève du…", o: ["PPS", "PAP", "PAI"], c: 1, s: ["eduscol-plans"] },
  { q: "Le PIAL est remplacé par…", o: ["l'ULIS", "le pôle d'appui à la scolarité (PAS)", "la MDPH"], c: 1, s: ["circ-pas-2025"] },
  { q: "Une réponse de premier niveau du PAS nécessite-t-elle une notification MDPH ?", o: ["oui, toujours", "non, pas nécessairement"], c: 1, s: ["circ-pas-2025"] },
  { q: "Les aménagements de l'élève sont consignés dans…", o: ["le LPI", "le PV de conseil de classe"], c: 0, s: ["lpi"] },
  { q: "La loi de 2024 prend en charge l'AESH…", o: ["seulement en classe", "aussi sur la pause méridienne"], c: 1, s: ["loi-2024-475"] },
  { q: "Différencier, c'est…", o: ["baisser les exigences", "varier les chemins vers le même objectif"], c: 1, s: ["ife-differenciation"] },
  { q: "Le diagnostic d'un trouble est posé par…", o: ["l'enseignant", "les professionnels de santé"], c: 1, s: ["dsm5"] },
  { q: "ULIS est…", o: ["une classe séparée", "un dispositif d'inclusion"], c: 1, s: ["eduscol-inclusive"] }
] };

const SCENARIOS = [
  { cas: "Un élève n'arrive pas à copier le cours au tableau", etapes: ["Penser dyspraxie/dysgraphie ou lenteur : délester l'écrit.", "Fournir le cours photocopié / à trous, autoriser le numérique.", "Éviter la double tâche (copier + écouter).", "Si durable : famille → médecin scolaire (PAP) ; appui du PAS pour le matériel."], s: ["troubles-app", "eduscol-plans", "circ-pas-2025"] },
  { cas: "Un élève très agité, impulsif, perd ses affaires", etapes: ["Penser TDAH (à confirmer par un professionnel de santé).", "Cadre clair, consignes courtes, tâches fractionnées, repères visuels du temps.", "Valoriser les réussites ; place au calme.", "Famille → médecin scolaire (PAP/PPS selon les cas) ; appui du PAS."], s: ["dsm5", "eduscol-plans", "circ-pas-2025"] },
  { cas: "Un élève autiste supporte mal les changements et le bruit", etapes: ["Routines stables, emploi du temps visuel, annoncer les changements.", "Réduire les stimulations sensorielles ; prévoir un espace calme.", "Consignes explicites et littérales.", "S'appuyer sur le PPS / l'AESH et l'enseignant référent."], s: ["dsm5", "eduscol-inclusive"] },
  { cas: "Un élève a une notification MDPH d'aménagements d'examen", etapes: ["Vérifier le PPS et la notification (temps majoré, matériel, secrétaire…).", "Anticiper l'organisation avec l'établissement et l'autorité académique.", "Appliquer les mêmes aménagements en CCF et en cours quand c'est possible."], s: ["code-L351-1", "eduscol-plans"] },
  { cas: "Un élève malade doit prendre un traitement / risque d'allergie", etapes: ["Mettre en place un PAI avec le médecin scolaire.", "Connaître la conduite à tenir et la trousse d'urgence.", "Informer l'équipe concernée (discrétion)."], s: ["eduscol-plans"] },
  { cas: "Je soupçonne un trouble mais rien n'est posé", etapes: ["Ne pas attendre : adaptations pédagogiques immédiates (lisibilité, consignes, étayage).", "Saisir le pôle d'appui à la scolarité (réponses de premier niveau, sans MDPH).", "Orienter la famille vers un bilan ; tracer les observations."], s: ["circ-pas-2025"] },
  { cas: "L'élève aurait besoin d'un ordinateur / logiciel adapté", etapes: ["Décrire le besoin d'accessibilité (écrit, lecture…).", "Matériel pédagogique adapté : réponse possible de premier niveau via le PAS, ou notification MDPH selon les cas.", "Consigner au LPI."], s: ["circ-pas-2025", "lpi"] },
  { cas: "La famille refuse la démarche MDPH", etapes: ["Continuer à adapter au plan pédagogique (PAP possible, PPRE, réponses du PAS).", "Le PAS peut accompagner la famille vers la MDPH, sans l'imposer.", "Maintenir le dialogue et tracer les adaptations."], s: ["circ-pas-2025", "eduscol-plans"] }
];

const GLOSSAIRE = [
  ["BEP / EBEP", "Besoins éducatifs particuliers — élèves à besoins éducatifs particuliers."],
  ["MDPH", "Maison départementale des personnes handicapées — évalue les besoins liés au handicap."],
  ["CDAPH", "Commission des droits et de l'autonomie des personnes handicapées — notifie les droits."],
  ["PPS", "Projet personnalisé de scolarisation — pour un élève handicapé (via MDPH)."],
  ["PAP", "Plan d'accompagnement personnalisé — pour un trouble des apprentissages (sans MDPH)."],
  ["PAI", "Projet d'accueil individualisé — pour une maladie / des soins."],
  ["PPRE", "Programme personnalisé de réussite éducative — pour une difficulté scolaire."],
  ["PAS", "Pôle d'appui à la scolarité — remplace progressivement le PIAL (depuis 2024)."],
  ["PIAL", "Pôle inclusif d'accompagnement localisé — ancien dispositif, en cours de remplacement par le PAS."],
  ["LPI", "Livret de parcours inclusif — outil numérique regroupant les aménagements de l'élève."],
  ["ESS", "Équipe de suivi de la scolarisation — suit le PPS, animée par l'enseignant référent."],
  ["GEVA-Sco", "Guide d'évaluation des besoins de scolarisation (école ↔ MDPH)."],
  ["ULIS", "Unité localisée pour l'inclusion scolaire — dispositif d'inclusion."],
  ["AESH", "Accompagnant d'élève en situation de handicap — aide humaine notifiée."],
  ["MPA", "Matériel pédagogique adapté (ordinateur, logiciels…)."],
  ["RASED", "Réseau d'aides spécialisées aux élèves en difficulté (1er degré)."],
  ["SEGPA", "Section d'enseignement général et professionnel adapté."],
  ["EREA", "Établissement régional d'enseignement adapté."],
  ["TND", "Troubles du neurodéveloppement (TSA, TDAH, dys, TDI…)."],
  ["TSA", "Trouble du spectre de l'autisme."],
  ["TDAH", "Trouble déficit de l'attention avec ou sans hyperactivité."],
  ["DYS", "Troubles spécifiques des apprentissages (dyslexie, dyspraxie, dyscalculie…)."],
  ["TDI", "Trouble du développement intellectuel."],
  ["CUA", "Conception universelle des apprentissages — accessibilité pour tous dès la conception."],
  ["DSM-5", "Manuel diagnostique des troubles mentaux (référence des critères ; usage médical)."]
];

if (typeof window !== "undefined") {
  window.SOURCES = SOURCES; window.SECTIONS = SECTIONS; window.FLASHCARDS = FLASHCARDS;
  window.QUIZ = QUIZ; window.SCENARIOS = SCENARIOS; window.GLOSSAIRE = GLOSSAIRE;
}
