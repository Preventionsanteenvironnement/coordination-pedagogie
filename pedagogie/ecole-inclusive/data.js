/* ============================================================================
   École inclusive — guide de formation (refonte 2026). 100% local.
   Synthèses ORIGINALES (aucun extrait d'ouvrage recopié). Chaque notion
   renvoie à une source officielle. RGPD : aucun nom d'élève.
   Modèle :
     SOURCES      → références officielles (tiroir au clic sur un §).
     DISPOSITIFS  → les 4 plans, en fiches structurées + comparateur.
     PARCOURS     → "Comprendre" et "Adapter" (thèmes + notions).
     SITUATIONS   → "Que faire si…" (cas concrets).
     GLOSSAIRE    → sigles & définitions.
============================================================================ */
const GUIDE = {
  titre: "École inclusive",
  sousTitre: "Guide de formation — comprendre et adapter",
  maj: "À jour 2024-2026",
};

const SOURCES = {
  "loi-2005": { type: "loi", ref: "Loi n°2005-102 du 11 février 2005", origine: "Égalité des droits et des chances des personnes handicapées : droit à la scolarisation, compensation, création des MDPH.", url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000809647" },
  "loi-2013": { type: "loi", ref: "Loi du 8 juillet 2013 (refondation de l'École)", origine: "Inscrit le principe de l'école inclusive dans le code de l'éducation.", url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000027677984" },
  "loi-2019": { type: "loi", ref: "Loi du 26 juillet 2019 (École de la confiance)", origine: "Service public de l'école inclusive ; a créé les PIAL (en cours de remplacement par les pôles d'appui à la scolarité).", url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000038829065" },
  "loi-2024-475": { type: "loi", ref: "Loi n°2024-475 du 27 mai 2024", origine: "Acte II de l'école inclusive : AESH pris en charge par l'État sur la pause méridienne ; cadre des pôles d'appui à la scolarité.", url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000049599271" },
  "code-L111-1": { type: "loi", ref: "Code de l'éducation, art. L111-1", origine: "Le service public de l'éducation veille à l'inclusion scolaire de tous les enfants.", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042103051" },
  "code-L351-1": { type: "loi", ref: "Code de l'éducation, art. L351-1", origine: "Modalités de scolarisation des élèves en situation de handicap (milieu ordinaire, dispositifs).", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042102998" },
  "code-D351-5": { type: "reglement", ref: "Code de l'éducation, art. D351-5 et suivants", origine: "Parcours de formation des élèves handicapés : PPS, équipe pluridisciplinaire, équipe de suivi de la scolarisation (ESS), enseignant référent.", url: "https://www.legifrance.gouv.fr/codes/id/LEGISCTA000018381041/" },
  "eduscol-inclusive": { type: "reglement", ref: "Éduscol — École inclusive", origine: "Ressources officielles : scolarisation des élèves à besoins éducatifs particuliers, dispositifs.", url: "https://eduscol.education.gouv.fr/1224/ecole-inclusive" },
  "eduscol-plans": { type: "reglement", ref: "Éduscol — Répondre aux BEP (PPS, PAP, PAI, PPRE)", origine: "Présentation officielle des quatre plans et de leurs différences.", url: "https://eduscol.education.gouv.fr/1198/repondre-aux-besoins-educatifs-particuliers-des-eleves" },
  "circ-pas-2025": { type: "reglement", ref: "Déploiement des pôles d'appui à la scolarité (BO, rentrée 2025)", origine: "Circulaire + cahier des charges 2025 des PAS : missions, réponses de premier niveau, organisation, déploiement.", url: "https://www.education.gouv.fr/bo/2025/Hebdo33/MENE2520651C" },
  "circ-pas-2024": { type: "reglement", ref: "Pôles d'appui à la scolarité préfigurateurs (BO 2024)", origine: "Lancement des PAS dans 4 départements préfigurateurs (Aisne, Côte-d'Or, Eure-et-Loir, Var) à la rentrée 2024.", url: "https://www.education.gouv.fr/bo/2024/Hebdo27/MENE2416076C" },
  "lpi": { type: "reglement", ref: "Éduscol — Livret de parcours inclusif (LPI)", origine: "Outil numérique regroupant les aménagements et le parcours de l'élève (PAP, PPS, réponses de premier niveau du PAS).", url: "https://eduscol.education.gouv.fr/3157/livret-de-parcours-inclusif-lpi" },
  "ash-aesh": { type: "reglement", ref: "Éduscol — AESH", origine: "Accompagnants des élèves en situation de handicap : aide humaine notifiée, organisée via les pôles d'appui à la scolarité.", url: "https://eduscol.education.gouv.fr/2065/aesh-et-pial" },
  "cap-ecole": { type: "reglement", ref: "Cap École inclusive (Réseau Canopé)", origine: "Plateforme officielle de ressources et de fiches d'adaptation par besoin/trouble, pour les enseignants.", url: "https://www.reseau-canope.fr/cap-ecole-inclusive/accueil.html" },
  "guide-mpa": { type: "reglement", ref: "Guide de bonnes pratiques — Matériel pédagogique adapté (Éduscol, 2025)", origine: "Recommandations officielles sur le matériel pédagogique adapté (MPA).", url: "https://eduscol.education.gouv.fr/1224/ecole-inclusive" },
  "dsm5": { type: "ouvrage", ref: "DSM-5 (APA)", origine: "Manuel diagnostique et statistique des troubles mentaux. Référence des critères des troubles du neurodéveloppement. Le diagnostic relève des professionnels de santé, jamais de l'enseignant.", url: "" },
  "ife-differenciation": { type: "ouvrage", ref: "Différenciation pédagogique (Cnesco-Ifé)", origine: "Dossier de synthèse de la conférence de consensus sur la différenciation pédagogique.", url: "https://www.cnesco.fr/fr/differenciation-pedagogique/" },
  "corbion": { type: "ouvrage", ref: "L'école inclusive (S. Corbion)", origine: "Ouvrage de référence sur les enjeux et limites de l'école inclusive.", url: "" },
  "troubles-app": { type: "ouvrage", ref: "Les troubles d'apprentissage — comprendre", origine: "Ouvrage de synthèse sur les troubles des apprentissages (dys, TDAH…).", url: "" },
  "enseigner-ue": { type: "ouvrage", ref: "Enseigner en unité d'enseignement", origine: "Ouvrage de référence sur l'enseignement adapté (médico-social, UE).", url: "" },
};

/* --------------------------------------------------------------------
   LES 4 DISPOSITIFS — fiches structurées
-------------------------------------------------------------------- */
const DISPOSITIFS = [
  {
    code: "PPS", cle: "pps", nom: "Projet personnalisé de scolarisation", icon: "accessible",
    c: "#6b4bd6", motif: "Handicap reconnu (MDPH)",
    faits: { pour: "Élève en situation de handicap", decide: "La CDAPH (MDPH)", redige: "Équipe pluridisciplinaire (MDPH)", mdph: "Oui", duree: "Suit l'élève, revu en ESS" },
    resume: "Le document de référence d'un élève reconnu en situation de handicap : il définit le parcours et les aides nécessaires.",
    blocs: [
      { h: "Ce que le PPS peut ouvrir", items: ["Aide humaine (AESH individuelle ou mutualisée)", "Matériel pédagogique adapté", "Orientation (ULIS, dispositif médico-social)", "Aménagements d'examens", "Transport adapté"] },
      { h: "Modalités de scolarisation", items: ["Classe ordinaire (avec aides)", "Classe ordinaire + dispositif ULIS", "Unité d'enseignement en médico-social", "Scolarisation partagée"] },
    ],
    process: [
      { t: "Saisine", d: "La famille saisit la MDPH." },
      { t: "Évaluation", d: "L'équipe pluridisciplinaire analyse les besoins (avec le GEVA-Sco)." },
      { t: "Décision", d: "La CDAPH décide et notifie les droits." },
      { t: "Suivi", d: "L'ESS, animée par l'enseignant référent, ajuste au moins une fois par an." },
    ],
    enseignant: "Tu ne « mets » pas un PPS : tu contribues à l'évaluation des besoins, puis tu appliques les aménagements notifiés. Les aides peuvent être renforcées, maintenues ou allégées.",
    confond: { code: "PAP", txt: "Le PPS passe par la MDPH et ouvre des droits (AESH, ULIS, matériel financé). Le PAP, non." },
    s: ["code-L351-1", "code-D351-5", "loi-2005", "ash-aesh"],
  },
  {
    code: "PAP", cle: "pap", nom: "Plan d'accompagnement personnalisé", icon: "book",
    c: "#2f6cd6", motif: "Trouble des apprentissages (sans MDPH)",
    faits: { pour: "Trouble des apprentissages (dys, TDAH…)", decide: "Équipe pédagogique / famille", redige: "Avis du médecin scolaire", mdph: "Non", duree: "Suit l'élève, réajusté" },
    resume: "Pour les élèves dont les difficultés scolaires durables résultent d'un trouble des apprentissages, sans reconnaissance MDPH. Plus simple et rapide que le PPS.",
    blocs: [
      { h: "Ce qu'il permet", items: ["Aménagements et adaptations pédagogiques", "Supports et consignes adaptés", "Temps majoré, allègement de l'écrit", "Outils numériques personnels"] },
      { h: "Ce qu'il NE permet PAS", bad: true, items: ["Pas d'AESH", "Pas de matériel financé par la MDPH", "Pas d'orientation ULIS", "→ Si les besoins dépassent le pédagogique : MDPH (PPS)"] },
    ],
    process: [
      { t: "Constat", d: "Le trouble des apprentissages est repéré (équipe ou famille)." },
      { t: "Avis médical", d: "Le médecin scolaire constate le trouble et donne un avis." },
      { t: "Accord", d: "La famille donne son accord ; le PAP est rédigé." },
      { t: "Suivi", d: "Les aménagements sont consignés au LPI et réajustés." },
    ],
    enseignant: "Applique les aménagements pédagogiques au quotidien et en évaluation. Si l'élève a besoin d'un ordinateur financé ou d'une AESH, cela bascule vers une demande MDPH (PPS).",
    confond: { code: "PPS", txt: "Le PAP = aménagements pédagogiques seuls. Le PPS = droits notifiés par la MDPH." },
    s: ["eduscol-plans", "cap-ecole", "lpi"],
  },
  {
    code: "PAI", cle: "pai", nom: "Projet d'accueil individualisé", icon: "heartbeat",
    c: "#d2603a", motif: "Maladie ou trouble de santé",
    faits: { pour: "Élève malade (asthme, diabète, allergie, épilepsie…)", decide: "La famille (demande)", redige: "Le médecin scolaire", mdph: "Non", duree: "Selon la situation de santé" },
    resume: "Organise la scolarité d'un élève atteint d'une maladie ou d'un trouble de santé : soins, traitements, régimes et conduites d'urgence.",
    blocs: [
      { h: "Contenu du PAI", items: ["Régimes et aménagements", "Traitements à prendre", "Protocole d'urgence (conduite, trousse, qui appeler)", "Aménagements (sorties, EPS, restauration)"] },
    ],
    urgence: [
      { t: "Reconnaître", d: "les signes décrits dans le PAI" },
      { t: "Appliquer", d: "la conduite à tenir — trousse d'urgence" },
      { t: "Alerter", d: "les secours et les personnes indiquées" },
      { t: "Rester", d: "auprès de l'élève, avec discrétion" },
    ],
    process: [
      { t: "Demande", d: "La famille demande le PAI." },
      { t: "Rédaction", d: "Le médecin scolaire le rédige à partir des prescriptions du médecin traitant." },
      { t: "Signature", d: "Les parties signent (famille, établissement, médecin)." },
    ],
    enseignant: "Connais le protocole d'urgence, sache où est la trousse, agis vite et reste discret. Exemples : allergie sévère → auto-injecteur, repas adaptés ; diabète → glycémie/collation autorisées, conduite en cas d'hypoglycémie.",
    confond: { code: "PAP", txt: "Le PAI relève de la santé ; le PAP relève des apprentissages." },
    s: ["eduscol-plans"],
  },
  {
    code: "PPRE", cle: "ppre", nom: "Programme personnalisé de réussite éducative", icon: "trending-up",
    c: "#1a9e78", motif: "Difficulté scolaire passagère",
    faits: { pour: "Difficulté scolaire (pas un trouble, pas une maladie)", decide: "L'équipe pédagogique", redige: "L'équipe pédagogique", mdph: "Non", duree: "Court, objectifs limités dans le temps" },
    resume: "Un outil pédagogique interne pour une difficulté scolaire, sans condition médicale ni MDPH. Mise en place rapide, objectifs précis.",
    blocs: [
      { h: "Contenu du PPRE", items: ["Objectifs ciblés", "Actions de soutien et étayage", "Échéances", "Point régulier avec l'élève et la famille"] },
    ],
    process: [
      { t: "Repérage", d: "L'équipe identifie une difficulté scolaire." },
      { t: "Objectifs", d: "On fixe des objectifs précis et limités dans le temps." },
      { t: "Soutien", d: "Actions ciblées, étayage." },
      { t: "Bilan", d: "On évalue les progrès et on ajuste (ex. bilan à 6 semaines)." },
    ],
    enseignant: "Exemple : décrochage récent en maths → objectifs ciblés, aide ciblée, bilan à 6 semaines. Si la difficulté persiste et semble durable, envisager un bilan (trouble → PAP).",
    confond: { code: "PAP", txt: "Le PPRE traite une difficulté passagère (pédagogique). Le PAP traite un trouble durable, sur avis médical." },
    s: ["eduscol-plans", "ife-differenciation"],
  },
];

/* --------------------------------------------------------------------
   TROUBLES — fiches structurées (ce que c'est · signes · adaptations)
-------------------------------------------------------------------- */
const TROUBLES = [
  {
    code: "TSA", nom: "Trouble du spectre de l'autisme", cle: "tsa", icon: "puzzle", c: "#6b4bd6",
    cestquoi: "Différences durables dans la communication et l'interaction sociale, intérêts restreints et comportements répétitifs. Des particularités sensorielles sont fréquentes (bruit, lumière, toucher).",
    signes: ["Difficulté à décoder l'implicite et le second degré", "Besoin de routines, réactions fortes aux changements", "Sensibilité au bruit, à la lumière", "Intérêts intenses et spécifiques", "Fatigue sociale"],
    adaptations: ["Routines stables et emploi du temps visuel", "Annoncer les changements à l'avance", "Consignes explicites et littérales", "Réduire les stimulations sensorielles", "Prévoir un espace / temps calme"],
    appui: ["S'appuyer sur les points forts (mémoire, logique, intérêts)", "Expliciter les règles sociales implicites", "En lycée pro : anticiper les PFMP (cadre, tuteur informé)"],
    plan: "Souvent un PPS (aménagements, parfois AESH), selon les besoins évalués par la MDPH.",
    s: ["dsm5", "cap-ecole", "enseigner-ue"],
  },
  {
    code: "TDAH", nom: "Déficit de l'attention / hyperactivité", cle: "tdah", icon: "bolt", c: "#d2603a",
    cestquoi: "Difficultés d'attention soutenue, d'inhibition (impulsivité) et parfois agitation motrice. La mémoire de travail et l'organisation sont fragiles.",
    signes: ["Se disperse, « rêve »", "Oublie ou perd le matériel", "Commence sans lire la consigne", "A du mal à rester en place", "Variabilité d'un jour à l'autre"],
    adaptations: ["Tâches courtes et fractionnées", "Une consigne à la fois", "Repères visuels du temps (time-timer)", "Placement au calme, mouvement encadré autorisé", "Routines et rappels"],
    appui: ["Valoriser les réussites (estime de soi fragile)", "Donner un rôle", "Aider à s'organiser (check-lists, agenda)", "Éviter les remarques répétées sur le comportement"],
    plan: "PAP (sur avis du médecin scolaire) ; PPS si une AESH ou du matériel financé sont nécessaires.",
    s: ["dsm5", "troubles-app", "cap-ecole", "corbion"],
  },
  {
    code: "Dyslexie", nom: "Dyslexie / dysorthographie", cle: "dyslexie", icon: "letter", c: "#2f6cd6",
    cestquoi: "Trouble spécifique de la lecture (dyslexie) et/ou de l'orthographe (dysorthographie) : la lecture reste coûteuse et lente malgré l'entraînement.",
    signes: ["Lecture lente et fatigante", "Confusions de sons / de lettres", "Orthographe instable", "Difficulté à lire ET comprendre en même temps"],
    adaptations: ["Lire les consignes à voix haute", "Police lisible, texte aéré", "Temps majoré", "Ne pas sanctionner l'orthographe hors objectif", "Supports audio / lecture vocale"],
    appui: ["Délester la double tâche : fournir le cours (photocopie / numérique)", "Évaluer à l'oral si l'écrit n'est pas l'objectif"],
    plan: "PAP (sur avis du médecin scolaire) ; PPS si matériel financé nécessaire.",
    s: ["troubles-app", "dsm5", "cap-ecole", "guide-mpa"],
  },
  {
    code: "Dyspraxie", nom: "Dyspraxie / dysgraphie", cle: "dyspraxie", icon: "pencil", c: "#1a9e78",
    cestquoi: "Trouble développemental de la coordination : le geste volontaire est coûteux et peu automatisé. La dysgraphie touche spécifiquement l'écriture manuscrite.",
    signes: ["Écriture lente, fatigante, peu lisible", "Difficulté à se repérer sur la page", "Mal à l'aise avec règle / compas", "Difficulté à organiser l'espace (géométrie, tableaux)"],
    adaptations: ["Privilégier le numérique (clavier)", "Documents pré-tracés, cours photocopié", "Alléger la copie", "Accepter une présentation imparfaite", "Temps majoré"],
    appui: ["Évaluer le fond, pas la forme graphique", "Outils numériques adaptés (traitement de texte, géométrie dynamique)"],
    plan: "PAP (sur avis du médecin scolaire) ; PPS si un ordinateur financé est nécessaire.",
    s: ["troubles-app", "dsm5", "cap-ecole", "guide-mpa"],
  },
  {
    code: "Dyscalculie", nom: "Dyscalculie", cle: "dyscalculie", icon: "number", c: "#b8852a",
    cestquoi: "Trouble spécifique des apprentissages en mathématiques : difficultés durables avec le sens du nombre, les faits numériques et le calcul.",
    signes: ["Difficulté à mémoriser les tables", "Mal à poser les opérations", "Difficulté à estimer des quantités", "Se repère mal dans les nombres et les unités"],
    adaptations: ["Autoriser tables et calculatrice (si le calcul n'est pas l'objectif)", "Supports concrets et visuels", "Étapes explicites", "Réduire le nombre d'items"],
    appui: ["Valoriser le raisonnement plutôt que la vitesse de calcul"],
    plan: "PAP (sur avis du médecin scolaire).",
    s: ["troubles-app", "dsm5", "cap-ecole"],
  },
  {
    code: "Dysphasie", nom: "Trouble du langage oral (TDL)", cle: "dysphasie", icon: "message", c: "#c2566f",
    cestquoi: "Trouble développemental du langage oral (dysphasie) : la compréhension et/ou l'expression orale sont durablement altérées.",
    signes: ["Phrases courtes ou mal construites", "Manque du mot", "Difficulté à suivre des consignes orales longues", "Difficulté à raconter, à comprendre l'implicite"],
    adaptations: ["Consignes courtes + appui visuel", "Reformuler, laisser le temps de répondre", "Ne pas finir les phrases à sa place", "Vérifier la compréhension", "Écrit / pictogrammes en soutien"],
    appui: ["S'appuyer sur le canal visuel et l'écrit"],
    plan: "PAP (sur avis du médecin scolaire) ; PPS selon les besoins.",
    s: ["troubles-app", "dsm5", "cap-ecole"],
  },
  {
    code: "TDI", nom: "Développement intellectuel & troubles psychiques", cle: "tdi", icon: "heart", c: "#5a6b8c",
    cestquoi: "Le TDI associe des limitations du fonctionnement intellectuel ET du comportement adaptatif. À distinguer des troubles psychiques (anxiété, phobie scolaire, troubles de l'humeur, du comportement).",
    signes: ["TDI : apprentissages plus lents, abstraction difficile, besoin de concret", "Troubles psychiques : anxiété, évitement, variations de l'humeur", "Sensibilité au cadre et aux relations"],
    adaptations: ["Objectifs réalistes et fonctionnels", "Tâches très découpées, concret et manipulation", "Répétition et valorisation", "Cadre régulier et prévisible (protecteur)", "Stratégies de retour au calme ; désamorcer sans rapport de force"],
    appui: ["Relier au quotidien et à l'autonomie", "Travailler avec la vie scolaire et les partenaires de santé"],
    plan: "Souvent un PPS (TDI reconnu MDPH) ; pour les troubles psychiques, PAI ou PPS selon la situation.",
    s: ["dsm5", "enseigner-ue", "cap-ecole", "corbion"],
  },
  {
    code: "Sensoriel", nom: "Déficiences sensorielles & motrices", cle: "sensoriel", icon: "accessible", c: "#0e8a8a",
    cestquoi: "L'accès à l'information (audition, vision) ou au geste (motricité) est limité. L'accessibilité et le matériel adapté compensent.",
    signes: ["Auditive : suit mal les consignes orales, fatigue d'écoute", "Visuelle : difficulté à voir le tableau, les supports", "Motrice : geste, déplacement ou poste de travail contraints"],
    adaptations: ["Auditive : privilégier le visuel, parler face à l'élève, écrire les consignes, réduire le bruit (système HF si notifié)", "Visuelle : agrandissements, contrastes, braille ou numérique adapté, verbaliser le tableau", "Motrice : accessibilité des locaux et du poste, adapter gestes et matériel, aide humaine, temps majoré"],
    appui: ["Le matériel adapté (MPA) est souvent notifié — l'anticiper", "Soigner le placement dans la classe"],
    plan: "PPS (déficience reconnue MDPH) : aides humaines et matérielles notifiées.",
    s: ["cap-ecole", "guide-mpa"],
  },
];

/* --------------------------------------------------------------------
   PARCOURS — Comprendre & Adapter (thèmes + notions)
-------------------------------------------------------------------- */
const PARCOURS = [
  {
    id: "comprendre", nom: "Comprendre", icon: "book-open",
    intro: "Le cadre, les acteurs, l'actualité des dispositifs, et des repères pour comprendre les troubles.",
    themes: [
      { titre: "Le cadre & les principes", icon: "scale", notions: [
        { t: "École inclusive : tout enfant est scolarisé, en priorité en milieu ordinaire ; c'est à l'École de s'adapter à l'élève (accessibilité), et non l'inverse.", s: ["code-L111-1", "loi-2013"] },
        { t: "Deux logiques complémentaires : l'ACCESSIBILITÉ (rendre l'environnement et les supports utilisables par tous, sans démarche individuelle) et la COMPENSATION (aides individuelles notifiées : AESH, matériel, aménagements).", s: ["loi-2005", "eduscol-inclusive"] },
        { t: "La loi de 2005 pose le droit à la scolarisation et la compensation du handicap ; elle crée les MDPH. La loi de 2019 installe le « service public de l'école inclusive » ; la loi de 2024 (acte II) crée les pôles d'appui à la scolarité et l'AESH sur la pause méridienne.", s: ["loi-2005", "loi-2019", "loi-2024-475"] },
        { t: "Besoins éducatifs particuliers (BEP) : notion large qui dépasse le handicap (troubles des apprentissages, allophonie, précocité/HPI, maladie, difficulté scolaire, élèves du voyage…).", s: ["eduscol-inclusive"] },
        { t: "Trois niveaux à distinguer : la difficulté scolaire (passagère, pédagogique) ≠ le trouble (durable, neurodéveloppemental) ≠ le handicap (reconnu par la MDPH). Le plan d'accompagnement dépend de ce niveau.", s: ["eduscol-plans", "troubles-app"] },
        { t: "Rôle de l'enseignant : observer et décrire les besoins, adapter, tracer, alerter, dialoguer avec la famille — JAMAIS poser un diagnostic (réservé aux professionnels de santé).", s: ["dsm5"] },
      ] },
      { titre: "Acteurs & dispositifs", icon: "users", notions: [
        { t: "MDPH / CDAPH : évaluent les besoins liés au handicap et notifient les droits (AESH, ULIS, matériel, aménagements d'examens).", s: ["loi-2005"] },
        { t: "Enseignant référent (handicap) : suit les élèves avec PPS, fait le lien école-famille-MDPH et anime l'ESS. À ne pas confondre avec le référent PFMP.", s: ["code-D351-5"] },
        { t: "ULIS : unité localisée pour l'inclusion scolaire — un DISPOSITIF (pas une classe à part), coordonné par un enseignant spécialisé, avec inclusion en classe ordinaire.", s: ["eduscol-inclusive"] },
        { t: "SEGPA / EREA : pour les élèves en grande difficulté scolaire durable (SEGPA) ou en situation de handicap nécessitant un internat adapté (EREA).", s: ["eduscol-inclusive"] },
        { t: "Médecin & infirmier·ère de l'Éducation nationale : avis pour le PAP, rédaction du PAI ; psychologue de l'Éducation nationale (PsyEN) : évaluation, orientation, soutien.", s: ["eduscol-plans"] },
        { t: "RASED (1er degré) : réseau d'aides spécialisées. Partenaires médico-sociaux : SESSAD (accompagnement sur le lieu de vie/école), IME, ITEP selon les situations.", s: ["eduscol-inclusive", "enseigner-ue"] },
      ] },
      { titre: "PAS, LPI & AESH (actualité)", icon: "refresh", notions: [
        { t: "Les pôles d'appui à la scolarité (PAS) remplacent progressivement les PIAL : interlocuteur de proximité pour familles et enseignants, plus réactif et mieux doté.", s: ["circ-pas-2025", "loi-2024-475"] },
        { t: "Composition : équipe associant des personnels de l'Éducation nationale et un professionnel du secteur médico-social, pilotée par un coordonnateur.", s: ["circ-pas-2025"] },
        { t: "Réponses de premier niveau (SANS reconnaissance de handicap ni notification CDAPH obligatoire) : aménagements pédagogiques (consignés au LPI), matériel pédagogique adapté, première aide humaine.", s: ["circ-pas-2025", "guide-mpa"] },
        { t: "Le PAS accompagne aussi les familles dans la démarche MDPH et met en œuvre l'aide humaine (AESH) notifiée.", s: ["circ-pas-2025", "ash-aesh"] },
        { t: "Où en est-on ? 4 départements préfigurateurs en 2024 ; ~500 PAS et 5 nouveaux départements généralisés à la rentrée 2025 ; objectif de généralisation. Le PIAL coexiste pendant la transition.", s: ["circ-pas-2024", "circ-pas-2025"] },
        { t: "AESH : aide humaine notifiée par la MDPH (individuelle ou mutualisée) ; depuis la loi du 27 mai 2024, l'État la prend aussi en charge sur la pause méridienne.", s: ["loi-2024-475", "ash-aesh"] },
        { t: "LPI (livret de parcours inclusif) : outil numérique qui centralise les aménagements (PAP, PPS, réponses du PAS) et suit l'élève d'une année et d'un établissement à l'autre.", s: ["lpi"] },
      ] },
      { titre: "Comprendre les troubles (repères)", icon: "brain", notions: [
        { t: "Troubles du neurodéveloppement (TND) : apparaissent tôt, durables, liés au fonctionnement du cerveau — pas à un manque de travail ni d'intelligence. Souvent plusieurs troubles associés.", s: ["dsm5", "troubles-app"] },
        { t: "Posture clé : on ne « voit » pas un trouble, on observe des manifestations (lenteur, fatigue, erreurs typiques, évitement). On décrit des BESOINS, on n'étiquette pas.", s: ["cap-ecole", "troubles-app"] },
        { t: "Le diagnostic est posé par des professionnels de santé (médecin, neuropsychologue, orthophoniste…). L'école adapte sans attendre le diagnostic ; le PAS peut aider.", s: ["dsm5", "circ-pas-2025"] },
      ] },
    ],
  },
  {
    id: "adapter", nom: "Adapter", icon: "wand",
    intro: "Raisonner par besoins, différencier, construire un cours accessible, aménager supports et évaluations, soigner la posture.",
    themes: [
      { titre: "Le public & ses besoins", icon: "user", notions: [
        { t: "Raisonner par BESOINS plutôt que par étiquette : attention, mémoire de travail, langage, lecture, écriture, repérage espace/temps, fatigabilité, gestion émotionnelle, sensorialité.", s: ["eduscol-inclusive", "ife-differenciation"] },
        { t: "Fatigabilité & charge cognitive : l'effort de compensation fatigue vite. Alléger la charge (une tâche à la fois, consignes courtes) améliore l'accès aux apprentissages.", s: ["troubles-app"] },
        { t: "Éviter la double tâche : ne pas cumuler deux efforts coûteux (lire ET comprendre, copier ET écouter). Délester l'un pour permettre l'autre.", s: ["troubles-app"] },
        { t: "Estime de soi : les troubles durables fragilisent l'estime de soi (échecs répétés). Valoriser les réussites et expliciter les progrès est un levier majeur.", s: ["corbion"] },
      ] },
      { titre: "Pédagogie adaptée", icon: "book-open", notions: [
        { t: "Différenciation pédagogique : varier contenus, supports, démarches et rythmes pour un MÊME objectif. Ce n'est pas « faire moins », mais « faire autrement ».", s: ["ife-differenciation"] },
        { t: "Conception universelle des apprentissages (CUA) : prévoir dès la préparation des supports accessibles à tous (clarté, plusieurs entrées). Ce qui aide les élèves à besoins particuliers aide souvent toute la classe.", s: ["ife-differenciation"] },
        { t: "Enseignement explicite : annoncer l'objectif, modéliser (« je montre »), guider (« on fait ensemble »), rendre autonome (« tu fais »), vérifier souvent la compréhension.", s: ["ife-differenciation"] },
        { t: "Étayage : aides temporaires (modèles, amorces, exemples, reformulation) retirées progressivement à mesure de la réussite.", s: ["ife-differenciation"] },
        { t: "Cadre rassurant : routines stables, consignes prévisibles, repères visuels du temps et des étapes — particulièrement aidant pour TSA et TDAH.", s: ["dsm5", "troubles-app"] },
      ] },
      { titre: "Construire un cours adapté", icon: "wand", notions: [
        { t: "1) Cibler l'essentiel : un objectif clair par séance ; distinguer le non-négociable de l'accessoire.", s: ["ife-differenciation"] },
        { t: "2) Accessibilité dès la conception : support lisible (police sans empattement, taille ≥ 14, aéré), une consigne à la fois, un exemple fait.", s: ["ife-differenciation", "troubles-app"] },
        { t: "3) Plusieurs entrées : le même contenu à l'oral, à l'écrit et en visuel (schéma, carte mentale) pour ne pas dépendre d'un seul canal.", s: ["ife-differenciation"] },
        { t: "4) Délester ce qui n'est pas l'objectif : cours à trous, photocopie, dictée à l'adulte/numérique, calculatrice/tables si l'objectif n'est pas le calcul.", s: ["troubles-app"] },
        { t: "5) Rythmer & sécuriser : étapes visibles, time-timer, pauses, vérifications régulières, droit à l'erreur, valorisation.", s: ["ife-differenciation"] },
        { t: "6) Étayer une même tâche à 3 niveaux (autonome / avec aide / fortement guidé) plutôt que des exercices différents : même objectif, chemins différents.", s: ["ife-differenciation"] },
        { t: "7) Évaluer autrement : critères explicites, valoriser le progrès, aménager (temps, oral, supports) sans baisser l'exigence de l'objectif.", s: ["ife-differenciation", "eduscol-plans"] },
      ] },
      { titre: "Supports & aménagements", icon: "ruler", notions: [
        { t: "Lisibilité : police sans empattement (Arial, Verdana, OpenDyslexic), taille ≥ 14, interligne aéré, peu de texte par page, surligner l'essentiel.", s: ["troubles-app", "cap-ecole"] },
        { t: "Consignes : courtes, une idée à la fois, numérotées ; reformuler et faire reformuler ; donner un exemple fait.", s: ["ife-differenciation"] },
        { t: "Outils : cartes mentales, time-timer, listes à cocher, supports numériques (lecture vocale, dictée, traitement de texte), matériel pédagogique adapté (MPA).", s: ["guide-mpa", "cap-ecole"] },
        { t: "Délester l'écrit : textes à trous, cours photocopié, prise de notes allégée, temps majoré ; pour la dyspraxie, privilégier l'oral et le numérique.", s: ["troubles-app"] },
      ] },
      { titre: "Évaluer & examens", icon: "flag", notions: [
        { t: "Principe : aménager les conditions, pas l'exigence de l'objectif. Critères explicites, valorisation du progrès.", s: ["ife-differenciation", "eduscol-plans"] },
        { t: "Aménagements d'examens (CCF, examens) : temps majoré (souvent 1/3 temps), secrétaire/assistant, matériel adapté, sujets adaptés, salle particulière — notifiés via le PPS/PAP et l'autorité académique.", s: ["code-L351-1", "eduscol-plans"] },
        { t: "À anticiper : la demande d'aménagements d'examens se fait en amont (dossier auprès de l'autorité académique, avis médical). Appliquer les mêmes aménagements en cours et en CCF quand c'est possible.", s: ["eduscol-plans"] },
      ] },
      { titre: "Posture & relation", icon: "handshake", notions: [
        { t: "Climat : prévisibilité, bienveillance exigeante, droit à l'erreur. Un cadre clair sécurise et libère l'attention.", s: ["corbion", "cap-ecole"] },
        { t: "Gérer un comportement difficile : ne pas entrer dans le rapport de force, baisser la tension, rappeler la règle calmement, proposer une issue, revenir à froid sur l'incident.", s: ["cap-ecole"] },
        { t: "Avec la famille : partenariat, langage simple, valoriser ce qui marche ; avec l'AESH : préciser les rôles (l'AESH accompagne, l'enseignant enseigne).", s: ["ash-aesh", "corbion"] },
        { t: "Travailler en équipe : référent, PsyEN, médecin scolaire, PAS, partenaires de santé — l'inclusion est collective, pas l'affaire d'un seul enseignant.", s: ["circ-pas-2025", "eduscol-inclusive"] },
      ] },
      { titre: "Pour aller plus loin", icon: "external", notions: [
        { t: "Officiel — Éduscol « École inclusive », page des 4 plans, circulaires PAS (2024-2025), LPI, Cap École inclusive (Canopé).", s: ["eduscol-inclusive", "eduscol-plans", "circ-pas-2025", "lpi", "cap-ecole"] },
        { t: "Lois — 2005, 2013, 2019, 2024 (acte II).", s: ["loi-2005", "loi-2013", "loi-2019", "loi-2024-475"] },
        { t: "Troubles & pédagogie — DSM-5 (usage médical), troubles des apprentissages, différenciation (Cnesco-Ifé), L'école inclusive (Corbion), Enseigner en unité d'enseignement.", s: ["dsm5", "troubles-app", "ife-differenciation", "corbion", "enseigner-ue"] },
      ] },
    ],
  },
];

/* --------------------------------------------------------------------
   SITUATIONS — « Que faire si… »
-------------------------------------------------------------------- */
const SITUATIONS = [
  { cas: "Un élève n'arrive pas à copier le cours au tableau", etapes: ["Penser dyspraxie/dysgraphie ou lenteur : délester l'écrit.", "Cours photocopié / à trous, autoriser le numérique.", "Éviter la double tâche (copier + écouter).", "Si durable : famille → médecin scolaire (PAP) ; appui du PAS pour le matériel."], s: ["troubles-app", "eduscol-plans", "circ-pas-2025"] },
  { cas: "Un élève très agité, impulsif, perd ses affaires", etapes: ["Penser TDAH (à confirmer par un professionnel de santé).", "Cadre clair, consignes courtes, tâches fractionnées, repères du temps.", "Valoriser les réussites ; place au calme ; aide à s'organiser.", "Famille → médecin scolaire (PAP/PPS) ; appui du PAS."], s: ["dsm5", "eduscol-plans", "circ-pas-2025"] },
  { cas: "Un élève autiste supporte mal les changements et le bruit", etapes: ["Routines stables, emploi du temps visuel, annoncer les changements.", "Réduire les stimulations ; espace calme.", "Consignes explicites et littérales.", "S'appuyer sur le PPS / l'AESH et l'enseignant référent."], s: ["dsm5", "cap-ecole"] },
  { cas: "Un élève a une notification MDPH d'aménagements d'examen", etapes: ["Vérifier le PPS et la notification (temps majoré, matériel, secrétaire…).", "Anticiper l'organisation avec l'établissement et l'autorité académique.", "Appliquer les mêmes aménagements en CCF et en cours quand c'est possible."], s: ["code-L351-1", "eduscol-plans"] },
  { cas: "Un élève malade doit prendre un traitement / risque d'allergie", etapes: ["Mettre en place un PAI avec le médecin scolaire.", "Connaître le protocole d'urgence et la trousse.", "Informer l'équipe concernée (discrétion)."], s: ["eduscol-plans"] },
  { cas: "Je soupçonne un trouble mais rien n'est posé", etapes: ["Ne pas attendre : adaptations pédagogiques immédiates (lisibilité, consignes, étayage).", "Saisir le pôle d'appui à la scolarité (réponses de premier niveau).", "Orienter la famille vers un bilan ; tracer les observations."], s: ["circ-pas-2025"] },
  { cas: "L'élève aurait besoin d'un ordinateur / logiciel adapté", etapes: ["Décrire le besoin d'accessibilité (écrit, lecture…).", "Matériel pédagogique adapté : réponse possible de premier niveau via le PAS, ou notification MDPH.", "Consigner au LPI."], s: ["circ-pas-2025", "lpi", "guide-mpa"] },
  { cas: "La famille refuse la démarche MDPH", etapes: ["Continuer à adapter au plan pédagogique (PAP possible, PPRE, réponses du PAS).", "Le PAS peut accompagner la famille vers la MDPH, sans l'imposer.", "Maintenir le dialogue et tracer les adaptations."], s: ["circ-pas-2025", "eduscol-plans"] },
  { cas: "Un élève en crise / refus, montée de tension", etapes: ["Baisser la tension : ton calme, ne pas entrer dans le rapport de force.", "Rappeler la règle simplement, proposer une issue (espace de retour au calme).", "Revenir à froid sur l'incident ; informer la vie scolaire / le référent.", "Sur la durée : travailler le cadre et le lien (PAI/PPS selon la situation)."], s: ["cap-ecole", "corbion"] },
  { cas: "Comment travailler avec l'AESH ?", etapes: ["Clarifier les rôles : l'AESH accompagne, l'enseignant enseigne.", "Préciser les temps et tâches d'aide les plus utiles.", "Viser l'autonomie de l'élève (l'AESH s'efface progressivement).", "Échanger régulièrement et s'appuyer sur le PAS."], s: ["ash-aesh", "circ-pas-2025"] },
];

/* --------------------------------------------------------------------
   GLOSSAIRE
-------------------------------------------------------------------- */
const GLOSSAIRE = [
  ["BEP / EBEP", "Besoins éducatifs particuliers — élèves à besoins éducatifs particuliers."],
  ["MDPH", "Maison départementale des personnes handicapées — évalue les besoins liés au handicap."],
  ["CDAPH", "Commission des droits et de l'autonomie des personnes handicapées — notifie les droits."],
  ["PPS", "Projet personnalisé de scolarisation — pour un élève handicapé (via MDPH)."],
  ["PAP", "Plan d'accompagnement personnalisé — pour un trouble des apprentissages (sans MDPH)."],
  ["PAI", "Projet d'accueil individualisé — pour une maladie / des soins."],
  ["PPRE", "Programme personnalisé de réussite éducative — pour une difficulté scolaire."],
  ["PAS", "Pôle d'appui à la scolarité — remplace progressivement le PIAL (depuis 2024)."],
  ["PIAL", "Pôle inclusif d'accompagnement localisé — ancien dispositif, en cours de remplacement."],
  ["LPI", "Livret de parcours inclusif — outil numérique des aménagements de l'élève."],
  ["ESS", "Équipe de suivi de la scolarisation — suit le PPS, animée par l'enseignant référent."],
  ["GEVA-Sco", "Guide d'évaluation des besoins de scolarisation (école ↔ MDPH)."],
  ["ULIS", "Unité localisée pour l'inclusion scolaire — dispositif d'inclusion."],
  ["AESH", "Accompagnant d'élève en situation de handicap — aide humaine notifiée."],
  ["MPA", "Matériel pédagogique adapté (ordinateur, logiciels, matériel spécifique…)."],
  ["RASED", "Réseau d'aides spécialisées aux élèves en difficulté (1er degré)."],
  ["SESSAD", "Service d'éducation spéciale et de soins à domicile (accompagnement médico-social)."],
  ["IME / ITEP", "Établissements médico-sociaux (déficience intellectuelle / difficultés psychologiques)."],
  ["UE", "Unité d'enseignement — enseignement en établissement/service médico-social."],
  ["PsyEN", "Psychologue de l'Éducation nationale."],
  ["SEGPA", "Section d'enseignement général et professionnel adapté."],
  ["EREA", "Établissement régional d'enseignement adapté."],
  ["TND", "Troubles du neurodéveloppement (TSA, TDAH, dys, TDI…)."],
  ["TSA", "Trouble du spectre de l'autisme."],
  ["TDAH", "Trouble déficit de l'attention avec ou sans hyperactivité."],
  ["DYS", "Troubles spécifiques des apprentissages (dyslexie, dyspraxie, dyscalculie…)."],
  ["TDL", "Trouble développemental du langage (dysphasie)."],
  ["TDC", "Trouble développemental de la coordination (dyspraxie)."],
  ["TDI", "Trouble du développement intellectuel."],
  ["CUA", "Conception universelle des apprentissages — accessibilité pour tous dès la conception."],
  ["DSM-5", "Manuel diagnostique des troubles mentaux (critères ; usage médical)."],
];

window.GUIDE = GUIDE;
window.SOURCES = SOURCES;
window.DISPOSITIFS = DISPOSITIFS;
window.TROUBLES = TROUBLES;
window.PARCOURS = PARCOURS;
window.SITUATIONS = SITUATIONS;
window.GLOSSAIRE = GLOSSAIRE;
