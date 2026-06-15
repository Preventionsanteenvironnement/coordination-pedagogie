/* ============================================================================
   École inclusive — guide de formation approfondi (à jour 2024-2026).
   100% local. Synthèses ORIGINALES (aucun extrait de livre ni du DSM recopié).
   Chaque notion renvoie à une source officielle ou de référence.
   RGPD : aucun nom d'élève.
============================================================================ */
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
  "enseigner-ue": { type: "ouvrage", ref: "Enseigner en unité d'enseignement", origine: "Ouvrage de référence sur l'enseignement adapté (médico-social, UE).", url: "" }
};

const SECTIONS = { pfmp: { label: "École inclusive", icone: "🏫",
  intro: "Guide de formation : comprendre les élèves à besoins éducatifs particuliers et adapter sa pédagogie — à jour 2024-2026.",
  themes: [
  /* ---------------- CADRE & DISPOSITIFS ---------------- */
  { titre: "Le cadre & les principes", icone: "🏛️", notions: [
    { t: "École inclusive : tout enfant est scolarisé, en priorité en milieu ordinaire ; c'est à l'École de s'adapter à l'élève (accessibilité), et non l'inverse.", s: ["code-L111-1", "loi-2013"] },
    { t: "Deux logiques complémentaires : l'ACCESSIBILITÉ (rendre l'environnement et les supports utilisables par tous, sans démarche individuelle) et la COMPENSATION (aides individuelles notifiées : AESH, matériel, aménagements).", s: ["loi-2005", "eduscol-inclusive"] },
    { t: "La loi de 2005 pose le droit à la scolarisation et la compensation du handicap ; elle crée les MDPH. La loi de 2019 installe le « service public de l'école inclusive » ; la loi de 2024 (acte II) crée les pôles d'appui à la scolarité et l'AESH sur la pause méridienne.", s: ["loi-2005", "loi-2019", "loi-2024-475"] },
    { t: "Besoins éducatifs particuliers (BEP) : notion large qui dépasse le handicap (troubles des apprentissages, allophonie, précocité/HPI, maladie, difficulté scolaire, élèves du voyage…).", s: ["eduscol-inclusive"] },
    { t: "Trois niveaux à distinguer : la difficulté scolaire (passagère, pédagogique) ≠ le trouble (durable, neurodéveloppemental) ≠ le handicap (reconnu par la MDPH). Le plan d'accompagnement dépend de ce niveau.", s: ["eduscol-plans", "troubles-app"] },
    { t: "Rôle de l'enseignant : observer et décrire les besoins, adapter, tracer, alerter, dialoguer avec la famille — JAMAIS poser un diagnostic (réservé aux professionnels de santé).", s: ["dsm5"] }
  ]},
  { titre: "Les 4 plans — vue d'ensemble", icone: "🧩", notions: [
    { t: "PPS — handicap reconnu par la MDPH : ouvre des droits (AESH, matériel adapté, ULIS, aménagements d'examens).", s: ["code-L351-1", "eduscol-plans"] },
    { t: "PAP — trouble des apprentissages durable (dys, TDAH…), SANS MDPH : aménagements pédagogiques, sur avis du médecin scolaire.", s: ["eduscol-plans"] },
    { t: "PAI — maladie / trouble de santé : organise soins, traitements, régimes et conduites d'urgence. Coordonné par le médecin scolaire.", s: ["eduscol-plans"] },
    { t: "PPRE — difficulté scolaire : outil pédagogique interne, sans condition médicale ni MDPH.", s: ["eduscol-plans"] },
    { t: "Repère : MDPH/handicap → PPS · trouble → PAP · maladie → PAI · difficulté → PPRE. Les aménagements sont consignés dans le LPI.", s: ["eduscol-plans", "lpi"] }
  ]},
  { titre: "Le PPS en profondeur", icone: "📘", notions: [
    { t: "Le PPS (projet personnalisé de scolarisation) est le document de référence d'un élève reconnu en situation de handicap. Il définit le parcours et les aides nécessaires.", s: ["code-L351-1", "code-D351-5"] },
    { t: "Qui décide ? La famille saisit la MDPH ; l'équipe pluridisciplinaire d'évaluation analyse les besoins (à l'aide du GEVA-Sco) ; la CDAPH décide et notifie. L'enseignant ne « met pas » un PPS : il contribue à l'évaluation des besoins.", s: ["loi-2005", "code-D351-5"] },
    { t: "Ce que le PPS peut ouvrir : aide humaine (AESH, individuelle ou mutualisée), matériel pédagogique adapté, orientation (ULIS, dispositif médico-social), transport adapté, aménagements et adaptations pédagogiques, aménagements d'examens.", s: ["code-L351-1", "eduscol-plans"] },
    { t: "Le suivi : l'équipe de suivi de la scolarisation (ESS), animée par l'enseignant référent, se réunit au moins une fois par an avec la famille pour faire le bilan et ajuster le PPS.", s: ["code-D351-5", "eduscol-inclusive"] },
    { t: "Modalités de scolarisation possibles : classe ordinaire (avec aides), classe ordinaire + dispositif ULIS, unité d'enseignement en établissement médico-social, ou scolarisation partagée.", s: ["code-L351-1", "enseigner-ue"] },
    { t: "Durée & révision : le PPS suit l'élève sur la durée ; il est réexaminé régulièrement (changement de cycle, évolution des besoins) lors de l'ESS. Les aides peuvent être renforcées, maintenues ou allégées.", s: ["code-D351-5"] },
    { t: "Situations : « PPS avec AESH mutualisée » → l'aide est partagée entre plusieurs élèves, sur les temps les plus utiles ; « PPS avec orientation ULIS » → inclusion en classe ordinaire + temps adaptés ; « PPS + aménagements d'examens » → à anticiper via l'autorité académique.", s: ["eduscol-plans", "ash-aesh"] }
  ]},
  { titre: "Le PAP en profondeur", icone: "📗", notions: [
    { t: "Le PAP (plan d'accompagnement personnalisé) est destiné aux élèves dont les difficultés scolaires durables résultent d'un trouble des apprentissages (dys, TDAH…), SANS reconnaissance MDPH.", s: ["eduscol-plans"] },
    { t: "Qui décide ? Il est proposé par le conseil des maîtres / l'équipe pédagogique ou la famille, et nécessite l'avis du médecin scolaire (qui constate le trouble). La famille donne son accord.", s: ["eduscol-plans"] },
    { t: "Ce qu'il permet : des aménagements et adaptations PÉDAGOGIQUES (supports, consignes, temps majoré, allègement de l'écrit, outils numériques personnels).", s: ["eduscol-plans", "cap-ecole"] },
    { t: "Ce qu'il NE permet pas : pas d'AESH ni de matériel financé par la MDPH, pas d'orientation ULIS — cela relève du PPS. Si les besoins dépassent le pédagogique, on s'oriente vers la MDPH.", s: ["eduscol-plans"] },
    { t: "Atout : plus simple et rapide que le PPS (pas de dossier MDPH). Il suit l'élève et se réajuste ; les aménagements sont consignés dans le LPI.", s: ["lpi", "eduscol-plans"] },
    { t: "Situations : « dyslexie confirmée » → PAP avec police lisible, temps majoré, lecture des consignes ; « TDAH » → PAP avec cadre, tâches fractionnées ; « besoin d'un ordinateur financé » → cela bascule vers une demande MDPH (PPS).", s: ["eduscol-plans", "cap-ecole"] }
  ]},
  { titre: "Le PAI en profondeur", icone: "📙", notions: [
    { t: "Le PAI (projet d'accueil individualisé) organise la scolarité d'un élève atteint d'une maladie ou d'un trouble de santé (asthme, diabète, allergie alimentaire, épilepsie, drépanocytose…).", s: ["eduscol-plans"] },
    { t: "Qui décide ? Demande de la famille ; rédigé par/avec le médecin scolaire à partir des prescriptions du médecin qui suit l'élève ; signé par les parties (famille, établissement, médecin).", s: ["eduscol-plans"] },
    { t: "Contenu : régimes/aménagements, traitements à prendre, protocole d'urgence (conduite à tenir, trousse, qui appeler), aménagements éventuels (sorties, EPS, restauration).", s: ["eduscol-plans"] },
    { t: "Pour l'enseignant : connaître le protocole d'urgence, savoir où est la trousse, agir vite, rester discret. Ne pas confondre PAI (santé) et PAP (apprentissages).", s: ["eduscol-plans"] },
    { t: "Situation : « allergie alimentaire sévère » → PAI avec protocole, trousse (auto-injecteur), repas adaptés ou panier ; « diabète » → autorisation de glycémie/collation, conduite en cas d'hypoglycémie.", s: ["eduscol-plans"] }
  ]},
  { titre: "Le PPRE en profondeur", icone: "📒", notions: [
    { t: "Le PPRE (programme personnalisé de réussite éducative) cible une difficulté scolaire (pas un trouble, pas une maladie). C'est un outil PÉDAGOGIQUE INTERNE.", s: ["eduscol-plans"] },
    { t: "Qui décide ? L'équipe pédagogique, sans condition médicale ni MDPH. Mise en place rapide, avec des objectifs précis et limités dans le temps.", s: ["eduscol-plans"] },
    { t: "Contenu : objectifs ciblés, actions de soutien, étayage, échéances, point régulier avec l'élève et la famille. On évalue les progrès et on ajuste.", s: ["eduscol-plans", "ife-differenciation"] },
    { t: "Situation : « décrochage récent en maths » → PPRE avec objectifs ciblés, aide ciblée, bilan à 6 semaines ; si la difficulté persiste et semble durable, envisager un bilan (trouble → PAP).", s: ["eduscol-plans"] }
  ]},
  { titre: "PAS, LPI & AESH (actualité)", icone: "🆕", notions: [
    { t: "Les pôles d'appui à la scolarité (PAS) remplacent progressivement les PIAL : interlocuteur de proximité pour familles et enseignants, plus réactif et mieux doté.", s: ["circ-pas-2025", "loi-2024-475"] },
    { t: "Composition : équipe associant des personnels de l'Éducation nationale et un professionnel du secteur médico-social, pilotée par un coordonnateur.", s: ["circ-pas-2025"] },
    { t: "Réponses de premier niveau (SANS reconnaissance de handicap ni notification CDAPH obligatoire) : aménagements pédagogiques (consignés au LPI), matériel pédagogique adapté, première aide humaine.", s: ["circ-pas-2025", "guide-mpa"] },
    { t: "Le PAS accompagne aussi les familles dans la démarche MDPH et met en œuvre l'aide humaine (AESH) notifiée.", s: ["circ-pas-2025", "ash-aesh"] },
    { t: "Où en est-on ? 4 départements préfigurateurs en 2024 ; ~500 PAS et 5 nouveaux départements généralisés à la rentrée 2025 ; objectif de généralisation. Le PIAL coexiste pendant la transition.", s: ["circ-pas-2024", "circ-pas-2025"] },
    { t: "AESH : aide humaine notifiée par la MDPH (individuelle ou mutualisée) ; depuis la loi du 27 mai 2024, l'État la prend aussi en charge sur la pause méridienne.", s: ["loi-2024-475", "ash-aesh"] },
    { t: "LPI (livret de parcours inclusif) : outil numérique qui centralise les aménagements (PAP, PPS, réponses du PAS) et suit l'élève d'une année et d'un établissement à l'autre.", s: ["lpi"] }
  ]},
  { titre: "Acteurs & dispositifs", icone: "👥", notions: [
    { t: "MDPH / CDAPH : évaluent les besoins liés au handicap et notifient les droits (AESH, ULIS, matériel, aménagements d'examens).", s: ["loi-2005"] },
    { t: "Enseignant référent (handicap) : suit les élèves avec PPS, fait le lien école-famille-MDPH et anime l'ESS. À ne pas confondre avec le référent PFMP.", s: ["code-D351-5"] },
    { t: "ULIS : unité localisée pour l'inclusion scolaire — un DISPOSITIF (pas une classe à part), coordonné par un enseignant spécialisé, avec inclusion en classe ordinaire.", s: ["eduscol-inclusive"] },
    { t: "SEGPA / EREA : pour les élèves en grande difficulté scolaire durable (SEGPA) ou en situation de handicap nécessitant un internat adapté (EREA).", s: ["eduscol-inclusive"] },
    { t: "Médecin & infirmier·ère de l'Éducation nationale : avis pour le PAP, rédaction du PAI ; psychologue de l'Éducation nationale (PsyEN) : évaluation, orientation, soutien.", s: ["eduscol-plans"] },
    { t: "RASED (1er degré) : réseau d'aides spécialisées. Partenaires médico-sociaux : SESSAD (accompagnement sur le lieu de vie/école), IME, ITEP selon les situations.", s: ["eduscol-inclusive", "enseigner-ue"] }
  ]},
  /* ---------------- COMPRENDRE LES TROUBLES ---------------- */
  { titre: "Comprendre les troubles (repères)", icone: "🧠", notions: [
    { t: "Troubles du neurodéveloppement (TND) : apparaissent tôt, durables, liés au fonctionnement du cerveau — pas à un manque de travail ni d'intelligence. Souvent plusieurs troubles associés.", s: ["dsm5", "troubles-app"] },
    { t: "Posture clé : on ne « voit » pas un trouble, on observe des manifestations (lenteur, fatigue, erreurs typiques, évitement). On décrit des BESOINS, on n'étiquette pas.", s: ["cap-ecole", "troubles-app"] },
    { t: "Le diagnostic est posé par des professionnels de santé (médecin, neuropsychologue, orthophoniste…). L'école adapte sans attendre le diagnostic ; le PAS peut aider.", s: ["dsm5", "circ-pas-2025"] }
  ]},
  { titre: "Fiche — TSA (autisme)", icone: "🧩", notions: [
    { t: "Ce que c'est : trouble du spectre de l'autisme — différences durables dans la communication et l'interaction sociale ET intérêts restreints / comportements répétitifs ; particularités sensorielles fréquentes (bruit, lumière, toucher).", s: ["dsm5"] },
    { t: "En classe, on peut observer : difficulté à décoder l'implicite et le second degré, besoin de routines, réactions fortes aux changements ou au bruit, intérêts intenses, fatigue sociale.", s: ["cap-ecole", "troubles-app"] },
    { t: "Adaptations : routines stables et emploi du temps visuel, annoncer les changements à l'avance, consignes explicites et littérales, réduire les stimulations, prévoir un espace/temps calme.", s: ["cap-ecole"] },
    { t: "S'appuyer sur les points forts (mémoire, logique, intérêts) ; valoriser ; expliciter les règles sociales implicites. En lycée pro : anticiper les PFMP (cadre, tuteur informé).", s: ["cap-ecole", "enseigner-ue"] }
  ]},
  { titre: "Fiche — TDAH", icone: "⚡", notions: [
    { t: "Ce que c'est : trouble déficit de l'attention, avec ou sans hyperactivité — difficultés d'attention soutenue, d'inhibition (impulsivité) et parfois agitation motrice ; mémoire de travail et organisation fragiles.", s: ["dsm5", "troubles-app"] },
    { t: "En classe : se disperse, oublie/perd le matériel, commence sans lire la consigne, a du mal à rester en place, « rêve », variabilité d'un jour à l'autre.", s: ["troubles-app", "cap-ecole"] },
    { t: "Adaptations : tâches courtes et fractionnées, une consigne à la fois, repères visuels du temps (time-timer), placement au calme, autoriser le mouvement encadré, routines et rappels.", s: ["cap-ecole"] },
    { t: "Valoriser les réussites (l'estime de soi est souvent fragile), donner un rôle, aider à s'organiser (check-lists, agenda) ; éviter les remarches répétées sur le comportement.", s: ["cap-ecole", "corbion"] }
  ]},
  { titre: "Fiche — Dyslexie / dysorthographie", icone: "🔤", notions: [
    { t: "Ce que c'est : trouble spécifique de la lecture (dyslexie) et/ou de l'orthographe (dysorthographie) — la lecture reste coûteuse et lente malgré l'entraînement.", s: ["troubles-app", "dsm5"] },
    { t: "En classe : lecture lente/fatigante, confusions de sons/lettres, orthographe instable, difficulté à lire ET comprendre en même temps.", s: ["troubles-app"] },
    { t: "Adaptations : lire les consignes à voix haute, police lisible et texte aéré, temps majoré, ne pas sanctionner l'orthographe quand ce n'est pas l'objectif, supports audio / lecture vocale.", s: ["cap-ecole", "guide-mpa"] },
    { t: "Délester la double tâche : fournir le cours (photocopie / numérique), évaluer les connaissances à l'oral si l'écrit n'est pas l'objectif.", s: ["troubles-app"] }
  ]},
  { titre: "Fiche — Dyspraxie / dysgraphie", icone: "✍️", notions: [
    { t: "Ce que c'est : trouble développemental de la coordination (dyspraxie) — le geste volontaire est coûteux et peu automatisé ; la dysgraphie touche spécifiquement l'écriture manuscrite.", s: ["troubles-app", "dsm5"] },
    { t: "En classe : écriture lente, fatigante, peu lisible ; difficulté à se repérer sur la page, à utiliser règle/compas, à organiser l'espace (géométrie, tableaux).", s: ["troubles-app"] },
    { t: "Adaptations : privilégier le numérique (clavier), fournir documents pré-tracés et cours photocopié, alléger la copie, accepter une présentation imparfaite, temps majoré.", s: ["cap-ecole", "guide-mpa"] },
    { t: "Évaluer le fond, pas la forme graphique ; outils numériques adaptés (traitement de texte, géométrie dynamique).", s: ["guide-mpa"] }
  ]},
  { titre: "Fiche — Dyscalculie", icone: "🔢", notions: [
    { t: "Ce que c'est : trouble spécifique des apprentissages en mathématiques — difficultés durables avec le sens du nombre, les faits numériques et le calcul.", s: ["troubles-app", "dsm5"] },
    { t: "En classe : difficulté à mémoriser les tables, à poser les opérations, à estimer des quantités, à se repérer dans les nombres et les unités.", s: ["troubles-app"] },
    { t: "Adaptations : autoriser tables et calculatrice (si l'objectif n'est pas le calcul), supports concrets/visuels, étapes explicites, réduire le nombre d'items, valoriser le raisonnement.", s: ["cap-ecole"] }
  ]},
  { titre: "Fiche — Langage oral (dysphasie)", icone: "💬", notions: [
    { t: "Ce que c'est : trouble développemental du langage oral (TDL / dysphasie) — la compréhension et/ou l'expression orale sont durablement altérées.", s: ["troubles-app", "dsm5"] },
    { t: "En classe : phrases courtes ou mal construites, manque du mot, difficulté à suivre des consignes orales longues, à raconter, à comprendre l'implicite.", s: ["troubles-app"] },
    { t: "Adaptations : consignes courtes + appui visuel, reformuler, laisser le temps de répondre, ne pas finir les phrases à la place, vérifier la compréhension, écrit/pictogrammes en soutien.", s: ["cap-ecole"] }
  ]},
  { titre: "Fiche — TDI & troubles psychiques", icone: "🧷", notions: [
    { t: "TDI (trouble du développement intellectuel) : limitations du fonctionnement intellectuel ET du comportement adaptatif. On vise un potentiel à étayer, par petites étapes concrètes et répétées.", s: ["dsm5", "enseigner-ue"] },
    { t: "Adaptations TDI : objectifs réalistes et fonctionnels, tâches très découpées, beaucoup de concret et de manipulation, répétition, valorisation, lien avec le quotidien et l'autonomie.", s: ["enseigner-ue", "cap-ecole"] },
    { t: "Troubles psychiques / du comportement : anxiété, phobie scolaire, troubles de l'humeur, TOP/TC… La régularité du cadre, la relation de confiance et la prévisibilité sont protectrices.", s: ["cap-ecole", "corbion"] },
    { t: "Posture : sécuriser, désamorcer (ne pas entrer dans le rapport de force), nommer les émotions, prévoir des stratégies de retour au calme ; travailler en lien avec la vie scolaire et les partenaires de santé.", s: ["cap-ecole"] }
  ]},
  { titre: "Fiche — Déficiences sensorielles & motrices", icone: "🦽", notions: [
    { t: "Déficience auditive : privilégier le visuel, parler face à l'élève, écrire les consignes, réduire le bruit ; matériel adapté (système HF) selon notification.", s: ["cap-ecole", "guide-mpa"] },
    { t: "Déficience visuelle : agrandissements, contrastes, supports en braille ou numériques adaptés, placement, verbaliser ce qui est écrit au tableau.", s: ["cap-ecole", "guide-mpa"] },
    { t: "Déficience motrice : accessibilité des locaux et du poste de travail, adaptation des gestes et du matériel, aide humaine si besoin, temps majoré.", s: ["cap-ecole"] }
  ]},
  /* ---------------- PÉDAGOGIE & SUPPORTS ---------------- */
  { titre: "Le public & ses besoins", icone: "🧒", notions: [
    { t: "Raisonner par BESOINS plutôt que par étiquette : attention, mémoire de travail, langage, lecture, écriture, repérage espace/temps, fatigabilité, gestion émotionnelle, sensorialité.", s: ["eduscol-inclusive", "ife-differenciation"] },
    { t: "Fatigabilité & charge cognitive : l'effort de compensation fatigue vite. Alléger la charge (une tâche à la fois, consignes courtes) améliore l'accès aux apprentissages.", s: ["troubles-app"] },
    { t: "Éviter la double tâche : ne pas cumuler deux efforts coûteux (lire ET comprendre, copier ET écouter). Délester l'un pour permettre l'autre.", s: ["troubles-app"] },
    { t: "Estime de soi : les troubles durables fragilisent l'estime de soi (échecs répétés). Valoriser les réussites et expliciter les progrès est un levier majeur.", s: ["corbion"] }
  ]},
  { titre: "Pédagogie adaptée", icone: "🎒", notions: [
    { t: "Différenciation pédagogique : varier contenus, supports, démarches et rythmes pour un MÊME objectif. Ce n'est pas « faire moins », mais « faire autrement ».", s: ["ife-differenciation"] },
    { t: "Conception universelle des apprentissages (CUA) : prévoir dès la préparation des supports accessibles à tous (clarté, plusieurs entrées). Ce qui aide les élèves à besoins particuliers aide souvent toute la classe.", s: ["ife-differenciation"] },
    { t: "Enseignement explicite : annoncer l'objectif, modéliser (« je montre »), guider (« on fait ensemble »), rendre autonome (« tu fais »), vérifier souvent la compréhension.", s: ["ife-differenciation"] },
    { t: "Étayage : aides temporaires (modèles, amorces, exemples, reformulation) retirées progressivement à mesure de la réussite.", s: ["ife-differenciation"] },
    { t: "Cadre rassurant : routines stables, consignes prévisibles, repères visuels du temps et des étapes — particulièrement aidant pour TSA et TDAH.", s: ["dsm5", "troubles-app"] }
  ]},
  { titre: "Construire un cours adapté", icone: "🛠️", notions: [
    { t: "1) Cibler l'essentiel : un objectif clair par séance ; distinguer le non-négociable de l'accessoire.", s: ["ife-differenciation"] },
    { t: "2) Accessibilité dès la conception : support lisible (police sans empattement, taille ≥ 14, aéré), une consigne à la fois, un exemple fait.", s: ["ife-differenciation", "troubles-app"] },
    { t: "3) Plusieurs entrées : le même contenu à l'oral, à l'écrit et en visuel (schéma, carte mentale) pour ne pas dépendre d'un seul canal.", s: ["ife-differenciation"] },
    { t: "4) Délester ce qui n'est pas l'objectif : cours à trous, photocopie, dictée à l'adulte/numérique, calculatrice/tables si l'objectif n'est pas le calcul.", s: ["troubles-app"] },
    { t: "5) Rythmer & sécuriser : étapes visibles, time-timer, pauses, vérifications régulières, droit à l'erreur, valorisation.", s: ["ife-differenciation"] },
    { t: "6) Étayer une même tâche à 3 niveaux (autonome / avec aide / fortement guidé) plutôt que des exercices différents : même objectif, chemins différents.", s: ["ife-differenciation"] },
    { t: "7) Évaluer autrement : critères explicites, valoriser le progrès, aménager (temps, oral, supports) sans baisser l'exigence de l'objectif.", s: ["ife-differenciation", "eduscol-plans"] }
  ]},
  { titre: "Supports & aménagements", icone: "📐", notions: [
    { t: "Lisibilité : police sans empattement (Arial, Verdana, OpenDyslexic), taille ≥ 14, interligne aéré, peu de texte par page, surligner l'essentiel.", s: ["troubles-app", "cap-ecole"] },
    { t: "Consignes : courtes, une idée à la fois, numérotées ; reformuler et faire reformuler ; donner un exemple fait.", s: ["ife-differenciation"] },
    { t: "Outils : cartes mentales, time-timer, listes à cocher, supports numériques (lecture vocale, dictée, traitement de texte), matériel pédagogique adapté (MPA).", s: ["guide-mpa", "cap-ecole"] },
    { t: "Délester l'écrit : textes à trous, cours photocopié, prise de notes allégée, temps majoré ; pour la dyspraxie, privilégier l'oral et le numérique.", s: ["troubles-app"] }
  ]},
  { titre: "Évaluer & examens", icone: "🏁", notions: [
    { t: "Principe : aménager les conditions, pas l'exigence de l'objectif. Critères explicites, valorisation du progrès.", s: ["ife-differenciation", "eduscol-plans"] },
    { t: "Aménagements d'examens (CCF, examens) : temps majoré (souvent 1/3 temps), secrétaire/assistant, matériel adapté, sujets adaptés, salle particulière — notifiés via le PPS/PAP et l'autorité académique.", s: ["code-L351-1", "eduscol-plans"] },
    { t: "À anticiper : la demande d'aménagements d'examens se fait en amont (dossier auprès de l'autorité académique, avis médical). Appliquer les mêmes aménagements en cours et en CCF quand c'est possible.", s: ["eduscol-plans"] }
  ]},
  { titre: "Posture & relation", icone: "🤝", notions: [
    { t: "Climat : prévisibilité, bienveillance exigeante, droit à l'erreur. Un cadre clair sécurise et libère l'attention.", s: ["corbion", "cap-ecole"] },
    { t: "Gérer un comportement difficile : ne pas entrer dans le rapport de force, baisser la tension, rappeler la règle calmement, proposer une issue, revenir à froid sur l'incident.", s: ["cap-ecole"] },
    { t: "Avec la famille : partenariat, langage simple, valoriser ce qui marche ; avec l'AESH : préciser les rôles (l'AESH accompagne, l'enseignant enseigne).", s: ["ash-aesh", "corbion"] },
    { t: "Travailler en équipe : référent, PsyEN, médecin scolaire, PAS, partenaires de santé — l'inclusion est collective, pas l'affaire d'un seul enseignant.", s: ["circ-pas-2025", "eduscol-inclusive"] }
  ]},
  { titre: "Pour aller plus loin", icone: "📚", notions: [
    { t: "Officiel — Éduscol « École inclusive », page des 4 plans, circulaires PAS (2024-2025), LPI, Cap École inclusive (Canopé).", s: ["eduscol-inclusive", "eduscol-plans", "circ-pas-2025", "lpi", "cap-ecole"] },
    { t: "Lois — 2005, 2013, 2019, 2024 (acte II).", s: ["loi-2005", "loi-2013", "loi-2019", "loi-2024-475"] },
    { t: "Troubles & pédagogie — DSM-5 (usage médical), troubles des apprentissages, différenciation (Cnesco-Ifé), L'école inclusive (Corbion), Enseigner en unité d'enseignement.", s: ["dsm5", "troubles-app", "ife-differenciation", "corbion", "enseigner-ue"] }
  ]}
] } };

const FLASHCARDS = { pfmp: [
  { q: "Élève reconnu handicapé (MDPH) → quel plan ?", r: "Le PPS.", s: ["eduscol-plans"] },
  { q: "Trouble dys sans MDPH → quel plan ?", r: "Le PAP, sur avis du médecin scolaire.", s: ["eduscol-plans"] },
  { q: "Maladie / soins → quel plan ?", r: "Le PAI.", s: ["eduscol-plans"] },
  { q: "Difficulté scolaire → quel plan ?", r: "Le PPRE (interne, pédagogique).", s: ["eduscol-plans"] },
  { q: "Qui décide d'un PPS ?", r: "La CDAPH (MDPH), après évaluation ; l'ESS (référent) en assure le suivi.", s: ["code-D351-5"] },
  { q: "Le PAP peut-il donner une AESH ?", r: "Non : AESH, MPA financé et ULIS relèvent du PPS (MDPH).", s: ["eduscol-plans"] },
  { q: "Qu'est-ce qui remplace le PIAL ?", r: "Le pôle d'appui à la scolarité (PAS), depuis 2024.", s: ["circ-pas-2025"] },
  { q: "Le PAS peut-il agir sans notification MDPH ?", r: "Oui : réponses de premier niveau (aménagements, MPA, 1re aide humaine).", s: ["circ-pas-2025"] },
  { q: "Où sont consignés les aménagements ?", r: "Dans le LPI (livret de parcours inclusif).", s: ["lpi"] },
  { q: "Nouveauté loi du 27 mai 2024 (AESH) ?", r: "Prise en charge par l'État sur la pause méridienne.", s: ["loi-2024-475"] },
  { q: "TSA — un réflexe d'adaptation ?", r: "Routines, emploi du temps visuel, consignes explicites, anticiper les changements.", s: ["cap-ecole"] },
  { q: "TDAH — un réflexe d'adaptation ?", r: "Tâches courtes/fractionnées, repères du temps, place au calme, valoriser.", s: ["cap-ecole"] },
  { q: "Dyslexie — un réflexe ?", r: "Lire les consignes, police lisible, temps majoré, ne pas sanctionner l'orthographe hors objectif.", s: ["cap-ecole"] },
  { q: "Dyspraxie/dysgraphie — un réflexe ?", r: "Numérique, documents pré-tracés, alléger la copie, évaluer le fond.", s: ["cap-ecole"] },
  { q: "ULIS, c'est une classe à part ?", r: "Non : un dispositif d'inclusion.", s: ["eduscol-inclusive"] },
  { q: "L'enseignant pose-t-il le diagnostic ?", r: "Non : il observe, adapte et alerte ; le diagnostic est médical.", s: ["dsm5"] },
  { q: "Différencier, c'est faire moins ?", r: "Non : faire autrement pour le MÊME objectif.", s: ["ife-differenciation"] },
  { q: "Aménagements d'examens — comment ?", r: "Anticipés via le PPS/PAP et l'autorité académique (temps majoré, matériel…).", s: ["eduscol-plans"] }
] };

const QUIZ = { pfmp: [
  { q: "Un élève reconnu handicapé relève du…", o: ["PAP", "PPS", "PPRE"], c: 1, s: ["eduscol-plans"] },
  { q: "Qui notifie une AESH ?", o: ["le chef d'établissement", "la MDPH/CDAPH", "le médecin scolaire"], c: 1, s: ["loi-2005"] },
  { q: "Un élève dyslexique sans MDPH relève du…", o: ["PPS", "PAP", "PAI"], c: 1, s: ["eduscol-plans"] },
  { q: "Un élève diabétique relève du…", o: ["PAI", "PPS", "PPRE"], c: 0, s: ["eduscol-plans"] },
  { q: "Le PAP permet-il une AESH ?", o: ["oui", "non (c'est le PPS)"], c: 1, s: ["eduscol-plans"] },
  { q: "Le PIAL est remplacé par…", o: ["l'ULIS", "le pôle d'appui à la scolarité (PAS)"], c: 1, s: ["circ-pas-2025"] },
  { q: "Une réponse de premier niveau du PAS exige une MDPH ?", o: ["oui, toujours", "non, pas nécessairement"], c: 1, s: ["circ-pas-2025"] },
  { q: "Les aménagements sont consignés dans…", o: ["le LPI", "le bulletin"], c: 0, s: ["lpi"] },
  { q: "Loi 2024 : l'AESH est pris en charge aussi…", o: ["en sortie scolaire", "sur la pause méridienne"], c: 1, s: ["loi-2024-475"] },
  { q: "Le suivi du PPS est assuré par…", o: ["le conseil de classe", "l'équipe de suivi de la scolarisation (ESS)"], c: 1, s: ["code-D351-5"] },
  { q: "Pour un TSA, on privilégie…", o: ["l'imprévu pour stimuler", "des routines et des repères visuels"], c: 1, s: ["cap-ecole"] },
  { q: "Différencier, c'est…", o: ["baisser les exigences", "varier les chemins vers le même objectif"], c: 1, s: ["ife-differenciation"] }
] };

const SCENARIOS = [
  { cas: "Un élève n'arrive pas à copier le cours au tableau", etapes: ["Penser dyspraxie/dysgraphie ou lenteur : délester l'écrit.", "Cours photocopié / à trous, autoriser le numérique.", "Éviter la double tâche (copier + écouter).", "Si durable : famille → médecin scolaire (PAP) ; appui du PAS pour le matériel."], s: ["troubles-app", "eduscol-plans", "circ-pas-2025"] },
  { cas: "Un élève très agité, impulsif, perd ses affaires", etapes: ["Penser TDAH (à confirmer par un professionnel de santé).", "Cadre clair, consignes courtes, tâches fractionnées, repères du temps.", "Valoriser les réussites ; place au calme ; aide à s'organiser.", "Famille → médecin scolaire (PAP/PPS) ; appui du PAS."], s: ["dsm5", "eduscol-plans", "circ-pas-2025"] },
  { cas: "Un élève autiste supporte mal les changements et le bruit", etapes: ["Routines stables, emploi du temps visuel, annoncer les changements.", "Réduire les stimulations ; espace calme.", "Consignes explicites et littérales.", "S'appuyer sur le PPS / l'AESH et l'enseignant référent."], s: ["dsm5", "cap-ecole"] },
  { cas: "Un élève a une notification MDPH d'aménagements d'examen", etapes: ["Vérifier le PPS et la notification (temps majoré, matériel, secrétaire…).", "Anticiper l'organisation avec l'établissement et l'autorité académique.", "Appliquer les mêmes aménagements en CCF et en cours quand c'est possible."], s: ["code-L351-1", "eduscol-plans"] },
  { cas: "Un élève malade doit prendre un traitement / risque d'allergie", etapes: ["Mettre en place un PAI avec le médecin scolaire.", "Connaître le protocole d'urgence et la trousse.", "Informer l'équipe concernée (discrétion)."], s: ["eduscol-plans"] },
  { cas: "Je soupçonne un trouble mais rien n'est posé", etapes: ["Ne pas attendre : adaptations pédagogiques immédiates (lisibilité, consignes, étayage).", "Saisir le pôle d'appui à la scolarité (réponses de premier niveau).", "Orienter la famille vers un bilan ; tracer les observations."], s: ["circ-pas-2025"] },
  { cas: "L'élève aurait besoin d'un ordinateur / logiciel adapté", etapes: ["Décrire le besoin d'accessibilité (écrit, lecture…).", "Matériel pédagogique adapté : réponse possible de premier niveau via le PAS, ou notification MDPH.", "Consigner au LPI."], s: ["circ-pas-2025", "lpi", "guide-mpa"] },
  { cas: "La famille refuse la démarche MDPH", etapes: ["Continuer à adapter au plan pédagogique (PAP possible, PPRE, réponses du PAS).", "Le PAS peut accompagner la famille vers la MDPH, sans l'imposer.", "Maintenir le dialogue et tracer les adaptations."], s: ["circ-pas-2025", "eduscol-plans"] },
  { cas: "Un élève en crise / refus, montée de tension", etapes: ["Baisser la tension : ton calme, ne pas entrer dans le rapport de force.", "Rappeler la règle simplement, proposer une issue (espace de retour au calme).", "Revenir à froid sur l'incident ; informer la vie scolaire / le référent.", "Sur la durée : travailler le cadre et le lien (PAI/PPS selon la situation)."], s: ["cap-ecole", "corbion"] },
  { cas: "Comment travailler avec l'AESH ?", etapes: ["Clarifier les rôles : l'AESH accompagne, l'enseignant enseigne.", "Préciser les temps et tâches d'aide les plus utiles.", "Viser l'autonomie de l'élève (l'AESH s'efface progressivement).", "Échanger régulièrement et s'appuyer sur le PAS."], s: ["ash-aesh", "circ-pas-2025"] }
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
  ["DSM-5", "Manuel diagnostique des troubles mentaux (critères ; usage médical)."]
];

if (typeof window !== "undefined") {
  window.SOURCES = SOURCES; window.SECTIONS = SECTIONS; window.FLASHCARDS = FLASHCARDS;
  window.QUIZ = QUIZ; window.SCENARIOS = SCENARIOS; window.GLOSSAIRE = GLOSSAIRE;
}
