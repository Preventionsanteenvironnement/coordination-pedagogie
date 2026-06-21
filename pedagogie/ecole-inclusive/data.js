/* ============================================================================
   Inclusion — guide de formation (refonte 2026). 100% local.
   Synthèses ORIGINALES appuyées sur des sources officielles (chaque § ouvre
   la référence). Contenu des 4 dispositifs fidèle au document officiel
   « Répondre aux besoins éducatifs particuliers : quel plan pour qui ? » (MEN).
   RGPD : aucun nom d'élève réel.
============================================================================ */
const GUIDE = {
  titre: "Inclusion",
  sousTitre: "Comprendre et accompagner les élèves à besoins éducatifs particuliers",
  maj: "À jour 2024-2026",
};

const SOURCES = {
  "quel-plan": { type: "reglement", ref: "« Quel plan pour qui ? » — Ministère de l'Éducation nationale", origine: "Document officiel présentant les 4 plans (PAI, PPS, PAP, PPRE) : élèves concernés, objectifs, procédure et cas concrets.", url: "https://eduscol.education.gouv.fr/1198/repondre-aux-besoins-educatifs-particuliers-des-eleves" },
  "loi-2005": { type: "loi", ref: "Loi n°2005-102 du 11 février 2005", origine: "Égalité des droits et des chances des personnes handicapées : droit à la scolarisation, compensation, création des MDPH. Définit le handicap (art. 2).", url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000809647" },
  "loi-2013": { type: "loi", ref: "Loi du 8 juillet 2013 (refondation de l'École)", origine: "Inscrit le principe de l'école inclusive dans le code de l'éducation.", url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000027677984" },
  "loi-2019": { type: "loi", ref: "Loi du 26 juillet 2019 (École de la confiance)", origine: "Service public de l'école inclusive ; a créé les PIAL (remplacés par les pôles d'appui à la scolarité).", url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000038829065" },
  "loi-2024-475": { type: "loi", ref: "Loi n°2024-475 du 27 mai 2024", origine: "Acte II de l'école inclusive : AESH pris en charge par l'État sur la pause méridienne ; cadre des pôles d'appui à la scolarité.", url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000049599271" },
  "code-L111-1": { type: "loi", ref: "Code de l'éducation, art. L111-1", origine: "Le service public de l'éducation veille à l'inclusion scolaire de tous les enfants.", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042103051" },
  "code-L112-2": { type: "loi", ref: "Code de l'éducation, art. L112-2", origine: "Évaluation globale des besoins et projet personnalisé de scolarisation (PPS).", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000027682922" },
  "code-L351-1": { type: "loi", ref: "Code de l'éducation, art. L351-1", origine: "Modalités de scolarisation des élèves en situation de handicap (milieu ordinaire, dispositifs).", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042102998" },
  "art-D351-5": { type: "loi", ref: "Code de l'éducation, art. D351-5", origine: "Cadre réglementaire du projet personnalisé de scolarisation (PPS) : évaluation, équipe pluridisciplinaire, ESS, enseignant référent.", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006527286/2013-04-22" },
  "art-D351-9": { type: "loi", ref: "Code de l'éducation, art. D351-9", origine: "Cadre réglementaire du projet d'accueil individualisé (PAI), pour un trouble de santé invalidant.", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006527290/2013-01-04" },
  "art-D311-13": { type: "loi", ref: "Code de l'éducation, art. D311-13 (circ. n°2015-016)", origine: "Cadre réglementaire du plan d'accompagnement personnalisé (PAP).", url: "https://eduscol.education.gouv.fr/1198/repondre-aux-besoins-educatifs-particuliers-des-eleves" },
  "eduscol-inclusive": { type: "reglement", ref: "Éduscol — École inclusive", origine: "Ressources officielles : scolarisation des élèves à besoins éducatifs particuliers, dispositifs.", url: "https://eduscol.education.gouv.fr/1224/ecole-inclusive" },
  "eduscol-plans": { type: "reglement", ref: "Éduscol — Répondre aux BEP (PPS, PAP, PAI, PPRE)", origine: "Présentation officielle des quatre plans et de leurs différences.", url: "https://eduscol.education.gouv.fr/1198/repondre-aux-besoins-educatifs-particuliers-des-eleves" },
  "circ-pas-2025": { type: "reglement", ref: "Déploiement des pôles d'appui à la scolarité (BO, rentrée 2025)", origine: "Circulaire + cahier des charges 2025 des PAS : missions, réponses de premier niveau, organisation, déploiement.", url: "https://www.education.gouv.fr/bo/2025/Hebdo33/MENE2520651C" },
  "circ-pas-2024": { type: "reglement", ref: "Pôles d'appui à la scolarité préfigurateurs (BO 2024)", origine: "Lancement des PAS dans 4 départements préfigurateurs à la rentrée 2024.", url: "https://www.education.gouv.fr/bo/2024/Hebdo27/MENE2416076C" },
  "lpi": { type: "reglement", ref: "Éduscol — Livret de parcours inclusif (LPI)", origine: "Outil numérique regroupant les aménagements et le parcours de l'élève (PAP, PPS, réponses du PAS).", url: "https://eduscol.education.gouv.fr/3157/livret-de-parcours-inclusif-lpi" },
  "lpi-decret": { type: "loi", ref: "Décret n°2021-1246 du 29 septembre 2021 (LPI)", origine: "Traitement de données « Livret de parcours inclusif ».", url: "https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000044125825" },
  "ash-aesh": { type: "reglement", ref: "Éduscol — AESH", origine: "Accompagnants des élèves en situation de handicap : aide humaine notifiée.", url: "https://eduscol.education.gouv.fr/2065/aesh-et-pial" },
  "cap-ecole": { type: "reglement", ref: "Cap École inclusive (Réseau Canopé)", origine: "Plateforme officielle de ressources et de fiches d'adaptation par besoin/trouble.", url: "https://www.reseau-canope.fr/cap-ecole-inclusive/accueil.html" },
  "guide-mpa": { type: "reglement", ref: "Matériel pédagogique adapté (Éduscol)", origine: "Recommandations officielles sur le matériel pédagogique adapté (MPA).", url: "https://eduscol.education.gouv.fr/1224/ecole-inclusive" },
  "has-tnd": { type: "reglement", ref: "HAS — Troubles du neurodéveloppement : repérage et orientation (2020)", origine: "Recommandation de bonne pratique de la Haute Autorité de Santé sur le repérage et l'orientation des enfants à risque de TND.", url: "https://www.has-sante.fr/jcms/p_3161334/fr/troubles-du-neurodeveloppement-reperage-et-orientation-des-enfants-a-risque" },
  "has-tdah": { type: "reglement", ref: "HAS — TDAH : diagnostic et interventions (2024)", origine: "Recommandation de la Haute Autorité de Santé sur le TDAH de l'enfant et de l'adolescent.", url: "https://www.has-sante.fr/jcms/p_3302482/fr/trouble-du-neurodeveloppement/tdah-diagnostic-et-interventions-therapeutiques-aupres-des-enfants-et-adolescents" },
  "dsm5": { type: "ouvrage", ref: "DSM-5-TR (APA) / CIM-11 (OMS)", origine: "Classifications de référence des troubles du neurodéveloppement et de leurs critères.", url: "" },
  "ife-differenciation": { type: "ouvrage", ref: "Différenciation pédagogique (Cnesco-Ifé)", origine: "Synthèse de la conférence de consensus sur la différenciation pédagogique.", url: "https://www.cnesco.fr/fr/differenciation-pedagogique/" },
  "corbion": { type: "ouvrage", ref: "L'école inclusive (S. Corbion)", origine: "Ouvrage de référence sur les enjeux et limites de l'école inclusive.", url: "" },
  "troubles-app": { type: "ouvrage", ref: "Les troubles des apprentissages — ressources", origine: "Ouvrages de synthèse sur les troubles des apprentissages (dys, TDAH…).", url: "" },
  "enseigner-ue": { type: "ouvrage", ref: "Enseigner en unité d'enseignement (B. Egron)", origine: "Ouvrage de référence sur l'enseignement adapté et l'accessibilité pédagogique.", url: "" },
};

/* --------------------------------------------------------------------
   LES 4 DISPOSITIFS — fiches approfondies (procédure, acteurs, cas concret)
-------------------------------------------------------------------- */
const DISPOSITIFS = [
  {
    code: "PPS", cle: "pps", nom: "Projet personnalisé de scolarisation", icon: "accessible",
    c: "#6b4bd6", motif: "Situation de handicap (MDPH)",
    resume: "Le document de référence d'un élève reconnu en situation de handicap : il organise tout son parcours et les aides nécessaires.",
    pourQui: "Tout élève dont la situation répond à la définition du handicap (loi de 2005 : « toute limitation d'activité ou restriction de participation à la vie en société subie en raison d'une altération substantielle, durable ou définitive d'une ou plusieurs fonctions physiques, sensorielles, mentales, cognitives, psychiques, d'un polyhandicap ou d'un trouble de santé invalidant ») et pour lequel la MDPH s'est prononcée.",
    objectifs: "C'est un document écrit national : la feuille de route du parcours de scolarisation. Il assure la cohérence et la qualité des accompagnements et des aides à partir d'une évaluation globale des besoins (art. L112-2). C'est aussi un outil de suivi sur toute la scolarité, révisé au moins à chaque changement de cycle.",
    faits: { pour: "Situation de handicap reconnue", decide: "La CDAPH (MDPH)", redige: "L'équipe pluridisciplinaire d'évaluation (EPE)", mdph: "Oui", duree: "Tout le parcours — suivi annuel en ESS" },
    qui: "La famille saisit la MDPH (avec, si besoin, l'appui de l'enseignant référent).",
    permet: ["Aménagements et adaptations pédagogiques", "Aide humaine (AESH individuelle ou mutualisée)", "Matériel pédagogique adapté financé", "Orientation : ULIS, établissement ou service médico-social (IME, SESSAD…)", "Aménagements d'examens"],
    process: [
      { t: "Saisine", d: "La famille (ou le représentant légal) saisit la MDPH à l'aide du formulaire Cerfa, pour faire part de ses demandes." },
      { t: "Évaluation", d: "L'équipe pluridisciplinaire d'évaluation (EPE) — professionnels de la santé et de l'éducation — évalue les besoins à l'aide du GEVA-Sco (première demande)." },
      { t: "Élaboration", d: "L'EPE élabore le PPS, puis le transmet à la CDAPH." },
      { t: "Décision", d: "La CDAPH prend les décisions (orientation, aide humaine, matériel) et notifie les droits à la famille." },
      { t: "Mise en œuvre & suivi", d: "L'enseignant référent assure le suivi et anime l'équipe de suivi de la scolarisation (ESS), au moins une fois par an." },
    ],
    acteurs: [
      { nom: "L'enseignant référent", role: "Interlocuteur privilégié de la famille. Il intervient après la décision de la CDAPH, réunit et anime les équipes de suivi de la scolarisation (ESS), rédige les comptes rendus (GEVA-Sco) et favorise l'articulation entre tous les intervenants." },
      { nom: "Le GEVA-Sco", role: "Outil normalisé qui recueille les informations nécessaires à l'évaluation des besoins. Deux versions : « première demande » (élève sans PPS, renseigné par l'équipe éducative) et « réexamen » (élève avec PPS, renseigné en ESS)." },
      { nom: "L'ESS", role: "Équipe de suivi de la scolarisation. Elle veille à la continuité et à la cohérence du PPS, se réunit au moins une fois par an et associe la famille, l'enseignant référent et les intervenants." },
    ],
    exemple: { titre: "Sami, 5 ans — porteur de trisomie 21", lignes: [
      "Sami est suivi sur le plan médical et paramédical depuis sa naissance ; son développement et son langage sont plus lents, ses acquisitions plus progressives.",
      "En classe, sa maîtresse adapte les exercices, répète les consignes, utilise des supports visuels et lui accorde plus de temps.",
      "À l'approche du CP, ses parents s'inquiètent. Une équipe éducative est réunie pour préciser la nature des difficultés et les besoins de Sami.",
      "Les parents saisissent la MDPH : l'équipe pluridisciplinaire évalue les besoins et élabore un projet personnalisé de scolarisation (PPS).",
      "Au vu des éléments, la CDAPH valide une orientation en ULIS avec l'accompagnement d'un SESSAD, et notifie la décision aux parents.",
    ] },
    article: { ref: "Code de l'éducation, art. D351-5 et L112-2", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006527286/2013-04-22" },
    confond: { code: "PAP", txt: "Le PPS passe par la MDPH et ouvre des droits (AESH, ULIS, matériel financé). Le PAP, non." },
    s: ["quel-plan", "art-D351-5", "code-L112-2", "loi-2005", "ash-aesh"],
  },
  {
    code: "PAP", cle: "pap", nom: "Plan d'accompagnement personnalisé", icon: "book",
    c: "#2f6cd6", motif: "Trouble des apprentissages (sans MDPH)",
    resume: "Pour un élève dont les difficultés scolaires durables résultent d'un trouble des apprentissages, sans reconnaissance MDPH. Uniquement des aménagements pédagogiques.",
    pourQui: "Tout élève présentant des difficultés scolaires durables en raison d'un trouble des apprentissages (dyslexie, dyspraxie, TDAH…). Le PAP ouvre des aménagements et des adaptations de nature pédagogique, sans passer par la MDPH.",
    objectifs: "Document normalisé (modèle national) qui définit les aménagements et adaptations pédagogiques dont bénéficie l'élève. Il est révisé chaque année pour suivre l'évolution de la scolarité, et organisé de la maternelle au lycée afin d'éviter toute rupture dans les aménagements.",
    faits: { pour: "Trouble des apprentissages durable", decide: "L'équipe pédagogique / la famille", redige: "L'équipe pédagogique (après avis du médecin scolaire)", mdph: "Non", duree: "De la maternelle au lycée — révisé chaque année" },
    qui: "Sur proposition du conseil des maîtres ou du conseil de classe — ou à la demande de la famille.",
    permet: ["Aménagements et adaptations exclusivement pédagogiques", "Utiliser le matériel informatique de l'établissement ou son propre matériel", "Temps majoré, allègement de l'écrit, supports et consignes adaptés"],
    limites: ["Pas d'aide humaine (AESH)", "Pas de matériel financé par la MDPH", "Pas d'orientation en dispositif collectif (ULIS) — ces décisions relèvent de la CDAPH", "Ne déroge pas au droit commun : si les besoins dépassent le pédagogique, on passe par la MDPH (PPS)"],
    process: [
      { t: "Proposition", d: "Le conseil des maîtres ou le conseil de classe propose le PAP ; le directeur ou le chef d'établissement recueille l'accord de la famille (qui peut aussi le demander)." },
      { t: "Constat du trouble", d: "Le médecin scolaire constate le trouble (au vu de son examen et, le cas échéant, de bilans psychologiques et paramédicaux) et rend un avis sur la pertinence du PAP." },
      { t: "Élaboration", d: "L'équipe pédagogique élabore le PAP, en associant les parents et les professionnels concernés." },
      { t: "Mise en œuvre & suivi", d: "Les enseignants appliquent les aménagements au quotidien et en évaluation ; au 2nd degré, le professeur principal coordonne. Le PAP est consigné (LPI) et révisé chaque année." },
    ],
    exemple: { titre: "Paula, 7 ans ½, en CE1 — dyslexie", lignes: [
      "Paula lit très lentement, inverse ou confond des sons, oublie parfois des mots : la lecture la gêne pour comprendre, et la copie est coûteuse.",
      "La maîtresse, accompagnée du médecin scolaire, rencontre les parents : un bilan est réalisé par un professionnel (orthophoniste, psychologue…).",
      "Au vu des bilans, le médecin de l'Éducation nationale constate un trouble des apprentissages et donne un avis favorable à un PAP.",
      "La maîtresse met en place des aménagements (travail ciblé sur la combinatoire, poésie photocopiée, police Arial 18, interligne 1,5, lignes surlignées) et les inscrit dans le PAP avec l'accord des parents.",
      "En fin d'année, un bilan évalue l'utilité des aménagements. En cas de déménagement, le PAP suit Paula dans sa nouvelle école.",
    ] },
    article: { ref: "Code de l'éducation, art. D311-13 (circ. n°2015-016)", url: "https://eduscol.education.gouv.fr/1198/repondre-aux-besoins-educatifs-particuliers-des-eleves" },
    confond: { code: "PPS", txt: "Le PAP = aménagements pédagogiques seuls. Le PPS = droits notifiés par la MDPH. Le PAP remplace l'ancien « PAI dys » et, si une difficulté perdure malgré un PPRE, il remplace le PPRE." },
    s: ["quel-plan", "art-D311-13", "eduscol-plans", "cap-ecole", "lpi"],
  },
  {
    code: "PAI", cle: "pai", nom: "Projet d'accueil individualisé", icon: "heartbeat",
    c: "#d2603a", motif: "Maladie ou trouble de santé",
    resume: "Organise la scolarité d'un élève atteint d'une maladie ou d'un trouble de santé : soins, traitements, régimes et conduites d'urgence.",
    pourQui: "Élèves atteints d'une maladie chronique (asthme, diabète, épilepsie…), d'une allergie ou d'une intolérance alimentaire. Le PAI leur permet de suivre une scolarité normale : bénéficier de leur traitement ou de leur régime, assurer leur sécurité et pallier les inconvénients liés à leur état de santé.",
    objectifs: "Document écrit qui précise, pendant les temps scolaires et périscolaires, les traitements médicaux et/ou les régimes spécifiques liés aux intolérances alimentaires. Il comporte, le cas échéant, les aménagements de la scolarité liés à l'état de santé (ex. contrôle régulier de la glycémie) et peut inclure un protocole d'urgence joint en intégralité.",
    faits: { pour: "Maladie, allergie, intolérance alimentaire", decide: "La famille (demande)", redige: "Le médecin scolaire (ou de PMI)", mdph: "Non", duree: "Suit la scolarité — actualisé au besoin" },
    qui: "Le médecin scolaire, ou le chef d'établissement / directeur d'école — toujours avec la famille.",
    permet: ["Suivre un traitement pendant le temps scolaire", "Mettre en place un régime alimentaire", "Définir un protocole d'urgence (conduite à tenir, trousse, qui appeler)", "Aménager la vie scolaire : EPS, sorties, classes transplantées, mobilier…"],
    limites: ["Réaliser des gestes de soins qui dépassent les compétences de personnels non soignants", "Administrer un traitement autrement que par voie inhalée, orale ou auto-injection", "Se substituer à la responsabilité de la famille"],
    urgence: [
      { t: "Reconnaître", d: "les signes décrits dans le PAI." },
      { t: "Appliquer", d: "la conduite à tenir — la trousse d'urgence." },
      { t: "Alerter", d: "les secours et les personnes indiquées." },
      { t: "Rester", d: "auprès de l'élève, avec discrétion." },
    ],
    process: [
      { t: "Demande", d: "La famille demande le PAI (le directeur ou le chef d'établissement peut aussi le proposer, toujours en accord avec la famille)." },
      { t: "Besoins médicaux", d: "À partir de l'ordonnance du médecin qui suit l'enfant, adressée sous pli cacheté au médecin de l'Éducation nationale (ou de la collectivité)." },
      { t: "Rédaction", d: "Le médecin scolaire (ou de PMI) rédige le PAI et veille au secret professionnel comme à la clarté des consignes pour des non-soignants." },
      { t: "Signature", d: "Le directeur ou le chef d'établissement et la famille signent ; la collectivité territoriale et les personnes participant à l'application signent au besoin." },
      { t: "Suivi", d: "Le PAI est actualisé à la demande de la famille ; chaque année, le nouvel enseignant en est informé." },
    ],
    exemple: { titre: "Félix, 6 ans, en cours préparatoire — allergie à l'arachide", lignes: [
      "Félix est allergique à l'arachide : il ne peut pas manger de cacahuètes ni consommer d'huile d'arachide. Ses parents s'inquiètent pour la cantine et rencontrent la directrice dès la rentrée.",
      "La directrice informe le médecin de l'Éducation nationale, qui rencontre les parents : avec les précisions du médecin qui suit Félix, ils rédigent ensemble le PAI (régime à la cantine, mesures d'urgence, composition et lieu de la trousse).",
      "La directrice réunit les personnes concernées par l'accueil (maîtresse, ATSEM, personnel de cantine, mairie) : chacun prend connaissance du document ; le médecin montre les gestes (auto-injection).",
      "Tous signent. Le PAI et la trousse d'urgence restent accessibles aux personnes susceptibles d'intervenir.",
      "Le PAI suit Félix tout au long de sa scolarité ; chaque année, le nouvel enseignant en est informé.",
    ] },
    article: { ref: "Code de l'éducation, art. D351-9", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006527290/2013-01-04" },
    confond: { code: "PAP", txt: "Le PAI relève de la santé (soins, régime, urgence). Le PAP relève des apprentissages." },
    s: ["quel-plan", "art-D351-9", "eduscol-plans"],
  },
  {
    code: "PPRE", cle: "ppre", nom: "Programme personnalisé de réussite éducative", icon: "trending-up",
    c: "#1a9e78", motif: "Difficulté scolaire passagère",
    resume: "Un outil interne pour une difficulté scolaire, sans condition médicale ni MDPH. Objectifs ciblés, mise en place rapide, durée limitée.",
    pourQui: "Élèves qui risquent de ne pas maîtriser certaines connaissances et compétences attendues à la fin d'un cycle. Sans condition médicale ni MDPH — il peut aussi concerner des élèves intellectuellement précoces en difficulté scolaire.",
    objectifs: "Document qui formalise et coordonne les actions conçues pour répondre aux difficultés de l'élève : de l'accompagnement pédagogique différencié conduit en classe aux aides spécialisées ou complémentaires. Il renforce la cohérence des actions — ce n'est pas en soi un dispositif.",
    faits: { pour: "Difficulté scolaire (ni trouble, ni maladie)", decide: "L'équipe pédagogique", redige: "L'équipe pédagogique", mdph: "Non", duree: "Court — objectifs limités dans le temps" },
    qui: "Le directeur d'école ou le chef d'établissement, à l'initiative des équipes pédagogiques.",
    permet: ["Un bilan précis et personnalisé des besoins de l'élève", "Des objectifs ciblés sur des compétences précises", "Des actions de soutien et d'étayage, prioritairement en classe", "L'apport d'enseignants spécialisés (RASED) ou de professeurs UPE2A", "Un suivi avec échéances et modalités d'évaluation"],
    process: [
      { t: "Repérage & bilan", d: "L'équipe pédagogique établit un bilan précis et personnalisé des besoins de l'élève." },
      { t: "Formalisation", d: "Le document précise les objectifs, les ressources, les types d'actions, les échéances et les modalités d'évaluation." },
      { t: "Concertation", d: "Les actions sont discutées avec les représentants légaux et présentées à l'élève." },
      { t: "Mise en œuvre", d: "Mises en œuvre prioritairement par l'enseignant en classe ordinaire ; au collège et au lycée, le professeur principal coordonne après concertation de l'équipe." },
      { t: "Bilan", d: "On évalue les progrès : s'ils sont consolidés, le PPRE prend fin ; s'ils restent fragiles, il est ajusté ou prolongé." },
    ],
    exemple: { titre: "Zoé, 12 ans, en cinquième — enchaînement des idées", lignes: [
      "Zoé a du mal à enchaîner logiquement les idées (remettre des phrases dans l'ordre, reconstituer une histoire). Sa professeure de français le constate et le partage en équipe.",
      "Le professeur principal rédige un PPRE qui récapitule et organise les actions communes, pour une durée initiale de trois semaines ; la famille en est informée.",
      "Chaque enseignant agit dans sa discipline : verbaliser les choix, formuler à l'oral les tâches à faire, travailler l'organisation d'un texte ; une fiche méthodologique commune est construite avec Zoé.",
      "Au bout de trois semaines, les professeurs constatent une amélioration de l'enchaînement des idées.",
      "Si les progrès sont consolidés, le PPRE prend fin ; s'ils semblent trop fragiles, il est prolongé.",
    ] },
    article: { ref: "Code de l'éducation, art. D311-12", url: "https://eduscol.education.gouv.fr/1198/repondre-aux-besoins-educatifs-particuliers-des-eleves" },
    confond: { code: "PAP", txt: "Le PPRE traite une difficulté passagère (pédagogique, sans avis médical). Le PAP traite un trouble durable, sur avis du médecin scolaire." },
    s: ["quel-plan", "eduscol-plans", "ife-differenciation"],
  },
];

/* --------------------------------------------------------------------
   ORIENTEUR — « Quel dispositif pour mon élève ? » (cases à cocher)
-------------------------------------------------------------------- */
const ORIENTEUR = [
  { groupe: "C'est lié à la santé", cle: "pai", c: "#d2603a", items: [
    "Maladie chronique (asthme, diabète, épilepsie…)",
    "Allergie ou intolérance alimentaire",
    "Traitement à prendre pendant le temps scolaire",
    "Besoin d'un protocole d'urgence",
  ] },
  { groupe: "C'est un trouble des apprentissages", cle: "pap", c: "#2f6cd6", items: [
    "Difficultés durables en lecture, écriture ou calcul",
    "Un trouble « dys » ou un TDAH est repéré ou évoqué",
    "Un bilan existe (orthophoniste, psychologue…)",
    "Il faut des aménagements pédagogiques (temps, supports, outils)",
  ] },
  { groupe: "C'est une situation de handicap", cle: "pps", c: "#6b4bd6", items: [
    "La situation relève d'un handicap (MDPH saisie ou à saisir)",
    "Besoin d'une aide humaine (AESH)",
    "Besoin de matériel pédagogique financé",
    "Besoin d'une orientation (ULIS, médico-social)",
  ] },
  { groupe: "C'est une difficulté scolaire passagère", cle: "ppre", c: "#1a9e78", items: [
    "Difficulté récente, sans trouble ni maladie",
    "Quelques compétences non maîtrisées en fin de cycle",
    "Un soutien ciblé et limité dans le temps suffirait",
  ] },
];

/* --------------------------------------------------------------------
   TND — cadrage scientifique + fiches par trouble
-------------------------------------------------------------------- */
const TND_INTRO = {
  chapo: "Les troubles du neurodéveloppement (TND) regroupent des troubles qui apparaissent tôt dans le développement de l'enfant et touchent durablement certaines fonctions du cerveau : attention, langage, lecture, coordination, interactions sociales… Ils ne s'expliquent ni par un manque de travail ni par un défaut d'intelligence.",
  reperes: [
    { k: "Précoces et durables", v: "Ils débutent dans l'enfance et persistent ; leur expression évolue avec l'âge et le contexte." },
    { k: "Souvent associés", v: "Les TND coexistent fréquemment (par exemple TDAH et trouble « dys »), ce qui module les besoins." },
    { k: "Un retentissement variable", v: "À trouble identique, les besoins diffèrent d'un élève à l'autre : on raisonne par besoins, pas par étiquette." },
    { k: "Un parcours coordonné", v: "Le repérage et l'orientation s'inscrivent dans un parcours qui associe l'école, la famille et les professionnels de santé (recommandations HAS)." },
  ],
  familles: [
    "Trouble du développement intellectuel (TDI)",
    "Troubles de la communication (dont le trouble développemental du langage)",
    "Trouble du spectre de l'autisme (TSA)",
    "Trouble déficit de l'attention / hyperactivité (TDAH)",
    "Troubles spécifiques des apprentissages (dyslexie, dysorthographie, dyscalculie)",
    "Trouble développemental de la coordination (dyspraxie)",
  ],
  s: ["has-tnd", "dsm5", "troubles-app"],
};

const TROUBLES = [
  {
    code: "TSA", nom: "Trouble du spectre de l'autisme", cle: "tsa", icon: "puzzle", c: "#6b4bd6",
    cestquoi: "Trouble du neurodéveloppement caractérisé par des différences durables dans la communication et les interactions sociales, associées à des intérêts restreints et des comportements répétitifs. Des particularités sensorielles (bruit, lumière, toucher) sont fréquentes. L'expression est très variable d'une personne à l'autre — d'où la notion de « spectre ».",
    signes: ["Difficulté à décoder l'implicite et le second degré", "Besoin de routines, réactions fortes aux changements", "Sensibilité au bruit, à la lumière, au contact", "Intérêts intenses et spécifiques", "Fatigue sociale"],
    adaptations: ["Routines stables et emploi du temps visuel", "Annoncer les changements à l'avance", "Consignes explicites et littérales", "Réduire les stimulations sensorielles", "Prévoir un espace / un temps calme"],
    appui: ["S'appuyer sur les points forts (mémoire, logique, intérêts)", "Expliciter les règles sociales implicites", "En lycée pro : anticiper les PFMP (cadre, tuteur informé)"],
    plan: "Souvent un PPS (aménagements, parfois AESH), selon les besoins évalués par la MDPH.",
    s: ["has-tnd", "dsm5", "cap-ecole", "enseigner-ue"],
  },
  {
    code: "TDAH", nom: "Trouble déficit de l'attention / hyperactivité", cle: "tdah", icon: "bolt", c: "#d2603a",
    cestquoi: "Trouble du neurodéveloppement associant, à des degrés variables, un déficit d'attention soutenue, une impulsivité (déficit d'inhibition) et parfois une hyperactivité motrice. La mémoire de travail et les fonctions d'organisation (planification) sont souvent fragiles.",
    signes: ["Se disperse, « rêve », décroche", "Oublie ou perd le matériel", "Commence sans lire la consigne", "A du mal à rester en place", "Variabilité importante d'un jour à l'autre"],
    adaptations: ["Tâches courtes et fractionnées", "Une consigne à la fois", "Repères visuels du temps (time-timer)", "Placement au calme, mouvement encadré autorisé", "Routines et rappels"],
    appui: ["Valoriser les réussites (estime de soi souvent fragile)", "Donner un rôle, une responsabilité", "Aider à s'organiser (check-lists, agenda)", "Limiter les remarques répétées sur le comportement"],
    plan: "PAP (sur avis du médecin scolaire) ; PPS si une AESH ou du matériel financé sont nécessaires.",
    s: ["has-tdah", "dsm5", "troubles-app", "cap-ecole"],
  },
  {
    code: "Dyslexie", nom: "Dyslexie / dysorthographie", cle: "dyslexie", icon: "letter", c: "#185f9e",
    cestquoi: "Trouble spécifique des apprentissages touchant la lecture (dyslexie) et/ou l'orthographe (dysorthographie) : malgré un enseignement adapté et un entraînement régulier, l'identification des mots reste lente et coûteuse.",
    signes: ["Lecture lente et fatigante", "Confusions de sons ou de lettres", "Orthographe instable", "Difficulté à lire ET comprendre en même temps"],
    adaptations: ["Lire les consignes à voix haute", "Police lisible, texte aéré", "Temps majoré", "Ne pas sanctionner l'orthographe hors objectif visé", "Supports audio / lecture vocale"],
    appui: ["Délester la double tâche : fournir le cours (photocopie / numérique)", "Évaluer à l'oral lorsque l'écrit n'est pas l'objectif"],
    plan: "PAP (sur avis du médecin scolaire) ; PPS si du matériel financé est nécessaire.",
    s: ["troubles-app", "dsm5", "cap-ecole", "guide-mpa"],
  },
  {
    code: "Dyspraxie", nom: "Dyspraxie / dysgraphie (TDC)", cle: "dyspraxie", icon: "pencil", c: "#1a9e78",
    cestquoi: "Trouble développemental de la coordination : le geste volontaire est coûteux et peu automatisé. La dysgraphie touche spécifiquement l'écriture manuscrite ; le repérage dans l'espace (page, géométrie, tableaux) est souvent difficile.",
    signes: ["Écriture lente, fatigante, peu lisible", "Difficulté à se repérer sur la page", "Mal à l'aise avec règle, compas", "Difficulté à organiser l'espace (géométrie, tableaux)"],
    adaptations: ["Privilégier le numérique (clavier)", "Documents pré-tracés, cours photocopié", "Alléger la copie", "Accepter une présentation imparfaite", "Temps majoré"],
    appui: ["Évaluer le fond, pas la forme graphique", "Outils numériques adaptés (traitement de texte, géométrie dynamique)"],
    plan: "PAP (sur avis du médecin scolaire) ; PPS si un ordinateur financé est nécessaire.",
    s: ["troubles-app", "dsm5", "cap-ecole", "guide-mpa"],
  },
  {
    code: "Dyscalculie", nom: "Dyscalculie", cle: "dyscalculie", icon: "number", c: "#b8852a",
    cestquoi: "Trouble spécifique des apprentissages en mathématiques : difficultés durables avec le sens du nombre, les faits numériques (tables) et les procédures de calcul, malgré un enseignement adapté.",
    signes: ["Difficulté à mémoriser les tables", "Mal à poser les opérations", "Difficulté à estimer des quantités", "Se repère mal dans les nombres et les unités"],
    adaptations: ["Autoriser tables et calculatrice (si le calcul n'est pas l'objectif)", "Supports concrets et visuels", "Étapes de calcul explicites et visibles", "Réduire le nombre d'items"],
    appui: ["Valoriser le raisonnement plutôt que la vitesse de calcul"],
    plan: "PAP (sur avis du médecin scolaire).",
    s: ["troubles-app", "dsm5", "cap-ecole"],
  },
  {
    code: "TDL", nom: "Trouble développemental du langage (dysphasie)", cle: "dysphasie", icon: "message", c: "#c2566f",
    cestquoi: "Trouble développemental du langage oral : la compréhension et/ou l'expression orale sont durablement altérées, sans cause sensorielle ou intellectuelle qui l'explique. Fait partie des troubles de la communication (TND).",
    signes: ["Phrases courtes ou mal construites", "Manque du mot", "Difficulté à suivre des consignes orales longues", "Difficulté à raconter, à comprendre l'implicite"],
    adaptations: ["Consignes courtes + appui visuel", "Reformuler, laisser le temps de répondre", "Ne pas finir les phrases à sa place", "Vérifier la compréhension", "Écrit / pictogrammes en soutien"],
    appui: ["S'appuyer sur le canal visuel et l'écrit", "Stabiliser le vocabulaire (même mot pour la même notion)"],
    plan: "PAP (sur avis du médecin scolaire) ; PPS selon les besoins.",
    s: ["troubles-app", "dsm5", "cap-ecole"],
  },
  {
    code: "TDI", nom: "Trouble du développement intellectuel", cle: "tdi", icon: "brain", c: "#5a6b8c",
    cestquoi: "Trouble du neurodéveloppement associant des limitations du fonctionnement intellectuel ET du comportement adaptatif (autonomie, vie quotidienne, communication), apparues au cours du développement. L'intensité est variable.",
    signes: ["Apprentissages plus lents", "Abstraction difficile, besoin de concret", "Mémoire de travail fragile", "Généralisation et transfert difficiles"],
    adaptations: ["Objectifs réalistes et fonctionnels", "Tâches très découpées, concret et manipulation", "Répétition et valorisation", "Cadre régulier et prévisible", "Relier au quotidien et à l'autonomie"],
    appui: ["Partir des réussites, montrer, manipuler", "Travailler avec les partenaires de santé et le médico-social"],
    plan: "Souvent un PPS (TDI reconnu par la MDPH) : aides et orientation selon les besoins.",
    s: ["dsm5", "enseigner-ue", "cap-ecole"],
  },
  {
    code: "Psy", nom: "Troubles psychiques (repères)", cle: "psy", icon: "heart", c: "#7a5aa6",
    cestquoi: "Les troubles psychiques (anxiété, phobie scolaire, troubles de l'humeur ou du comportement) ne sont pas des troubles du neurodéveloppement, mais ils retentissent fortement sur la scolarité. La sensibilité au cadre et aux relations y est centrale.",
    signes: ["Anxiété, évitement, blocages", "Variations de l'humeur", "Peur de l'erreur, stress d'évaluation", "Sensibilité aux relations et au climat de classe"],
    adaptations: ["Cadre clair, rassurant et prévisible", "Validation non bloquante, droit à l'essai", "Stratégies de retour au calme", "Désamorcer sans rapport de force", "Feedback non jugeant"],
    appui: ["Travailler avec la vie scolaire et les partenaires de santé", "Maintenir le lien et la place dans le groupe"],
    plan: "Selon la situation : PAI (soins, protocole), PPS, ou appui de la vie scolaire et de la santé scolaire.",
    s: ["dsm5", "corbion", "cap-ecole"],
  },
  {
    code: "Sensoriel", nom: "Déficiences sensorielles & motrices", cle: "sensoriel", icon: "accessible", c: "#0e8a8a",
    cestquoi: "L'accès à l'information (audition, vision) ou au geste (motricité) est limité. Ce ne sont pas des TND, mais l'accessibilité et le matériel adapté compensent et conditionnent la réussite.",
    signes: ["Auditive : suit mal les consignes orales, fatigue d'écoute", "Visuelle : difficulté à voir le tableau, les supports", "Motrice : geste, déplacement ou poste de travail contraints"],
    adaptations: ["Auditive : privilégier le visuel, parler face à l'élève, écrire les consignes, réduire le bruit (système HF si notifié)", "Visuelle : agrandissements, contrastes, braille ou numérique adapté, verbaliser le tableau", "Motrice : accessibilité des locaux et du poste, adapter gestes et matériel, aide humaine, temps majoré"],
    appui: ["Le matériel adapté (MPA) est souvent notifié — l'anticiper", "Soigner le placement dans la classe"],
    plan: "PPS (déficience reconnue par la MDPH) : aides humaines et matérielles notifiées.",
    s: ["cap-ecole", "guide-mpa"],
  },
];

/* --------------------------------------------------------------------
   PARCOURS — Comprendre & Adapter (thèmes + notions)
-------------------------------------------------------------------- */
const PARCOURS = [
  {
    id: "comprendre", nom: "Comprendre", icon: "book-open",
    intro: "Le cadre, les acteurs et l'actualité des dispositifs de l'école inclusive.",
    themes: [
      { titre: "Le cadre & les principes", icon: "scale", notions: [
        { t: "École inclusive : tout enfant est scolarisé, en priorité en milieu ordinaire ; c'est à l'École de s'adapter à l'élève (accessibilité), et non l'inverse.", s: ["code-L111-1", "loi-2013"] },
        { t: "Deux logiques complémentaires : l'ACCESSIBILITÉ (rendre l'environnement et les supports utilisables par tous, sans démarche individuelle) et la COMPENSATION (aides individuelles notifiées : AESH, matériel, aménagements).", s: ["loi-2005", "eduscol-inclusive"] },
        { t: "La loi de 2005 pose le droit à la scolarisation et la compensation du handicap ; elle crée les MDPH. La loi de 2019 installe le « service public de l'école inclusive » ; la loi de 2024 (acte II) crée les pôles d'appui à la scolarité et l'AESH sur la pause méridienne.", s: ["loi-2005", "loi-2019", "loi-2024-475"] },
        { t: "Besoins éducatifs particuliers (BEP) : notion large qui dépasse le handicap (troubles des apprentissages, allophonie, précocité, maladie, difficulté scolaire…).", s: ["eduscol-inclusive"] },
        { t: "Trois niveaux à distinguer : la difficulté scolaire (passagère, pédagogique) ≠ le trouble (durable, neurodéveloppemental) ≠ le handicap (reconnu par la MDPH). Le plan d'accompagnement dépend de ce niveau.", s: ["eduscol-plans", "troubles-app"] },
      ] },
      { titre: "Acteurs & dispositifs", icon: "users", notions: [
        { t: "MDPH / CDAPH : évaluent les besoins liés au handicap et notifient les droits (AESH, ULIS, matériel, aménagements d'examens).", s: ["loi-2005"] },
        { t: "Enseignant référent (handicap) : suit les élèves avec PPS, fait le lien école-famille-MDPH et anime l'ESS. À ne pas confondre avec le référent PFMP.", s: ["art-D351-5"] },
        { t: "ULIS : unité localisée pour l'inclusion scolaire — un DISPOSITIF (pas une classe à part), coordonné par un enseignant spécialisé, avec inclusion en classe ordinaire.", s: ["eduscol-inclusive"] },
        { t: "SEGPA / EREA : pour les élèves en grande difficulté scolaire durable (SEGPA) ou en situation de handicap nécessitant un internat adapté (EREA).", s: ["eduscol-inclusive"] },
        { t: "Médecin & infirmier·ère de l'Éducation nationale : avis pour le PAP, rédaction du PAI ; psychologue de l'Éducation nationale (PsyEN) : évaluation, orientation, soutien.", s: ["eduscol-plans"] },
        { t: "RASED (1er degré) : réseau d'aides spécialisées. Partenaires médico-sociaux : SESSAD (accompagnement sur le lieu de vie/école), IME, ITEP selon les situations.", s: ["eduscol-inclusive", "enseigner-ue"] },
      ] },
      { titre: "PAS, LPI & AESH (actualité)", icon: "refresh", notions: [
        { t: "Les pôles d'appui à la scolarité (PAS) remplacent progressivement les PIAL : interlocuteur de proximité pour familles et enseignants, plus réactif et mieux doté.", s: ["circ-pas-2025", "loi-2024-475"] },
        { t: "Réponses de premier niveau (sans reconnaissance de handicap ni notification CDAPH obligatoire) : aménagements pédagogiques (consignés au LPI), matériel pédagogique adapté, première aide humaine.", s: ["circ-pas-2025", "guide-mpa"] },
        { t: "Où en est-on ? 4 départements préfigurateurs en 2024 ; déploiement élargi à la rentrée 2025 ; objectif de généralisation. Le PIAL coexiste pendant la transition.", s: ["circ-pas-2024", "circ-pas-2025"] },
        { t: "AESH : aide humaine notifiée par la MDPH (individuelle ou mutualisée) ; depuis la loi du 27 mai 2024, l'État la prend aussi en charge sur la pause méridienne.", s: ["loi-2024-475", "ash-aesh"] },
        { t: "LPI (livret de parcours inclusif) : outil numérique qui centralise les aménagements (PAP, PPS, réponses du PAS) et suit l'élève d'une année et d'un établissement à l'autre.", s: ["lpi", "lpi-decret"] },
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
        { t: "Conception universelle des apprentissages (CUA) : prévoir dès la préparation des supports accessibles à tous. Ce qui aide les élèves à besoins particuliers aide souvent toute la classe.", s: ["ife-differenciation"] },
        { t: "Enseignement explicite : annoncer l'objectif, modéliser (« je montre »), guider (« on fait ensemble »), rendre autonome (« tu fais »), vérifier souvent la compréhension.", s: ["ife-differenciation"] },
        { t: "Étayage : aides temporaires (modèles, amorces, exemples, reformulation) retirées progressivement à mesure de la réussite.", s: ["ife-differenciation"] },
      ] },
      { titre: "Construire un cours adapté", icon: "wand", notions: [
        { t: "1) Cibler l'essentiel : un objectif clair par séance ; distinguer le non-négociable de l'accessoire.", s: ["ife-differenciation"] },
        { t: "2) Accessibilité dès la conception : support lisible (police sans empattement, taille ≥ 14, aéré), une consigne à la fois, un exemple fait.", s: ["ife-differenciation", "troubles-app"] },
        { t: "3) Plusieurs entrées : le même contenu à l'oral, à l'écrit et en visuel (schéma, carte mentale) pour ne pas dépendre d'un seul canal.", s: ["ife-differenciation"] },
        { t: "4) Délester ce qui n'est pas l'objectif : cours à trous, photocopie, dictée à l'adulte/numérique, calculatrice/tables si l'objectif n'est pas le calcul.", s: ["troubles-app"] },
        { t: "5) Rythmer & sécuriser : étapes visibles, time-timer, pauses, vérifications régulières, droit à l'erreur, valorisation.", s: ["ife-differenciation"] },
        { t: "6) Étayer une même tâche à 3 niveaux (autonome / avec aide / fortement guidé) plutôt que des exercices différents : même objectif, chemins différents.", s: ["ife-differenciation"] },
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
        { t: "Travailler en équipe : référent, PsyEN, médecin scolaire, partenaires de santé — l'inclusion est collective.", s: ["circ-pas-2025", "eduscol-inclusive"] },
      ] },
    ],
  },
];

/* --------------------------------------------------------------------
   SITUATIONS — cas concrets (sous l'orienteur)
-------------------------------------------------------------------- */
const SITUATIONS = [
  { cas: "Un élève n'arrive pas à copier le cours au tableau", etapes: ["Délester l'écrit : cours photocopié / à trous, autoriser le numérique.", "Éviter la double tâche (copier + écouter).", "Si la difficulté est durable et liée à un trouble : famille → médecin scolaire (PAP)."], s: ["troubles-app", "eduscol-plans"] },
  { cas: "Un élève très agité, impulsif, perd ses affaires", etapes: ["Cadre clair, consignes courtes, tâches fractionnées, repères du temps.", "Valoriser les réussites ; place au calme ; aide à s'organiser.", "Famille → médecin scolaire (PAP) ; PPS si une AESH ou du matériel financé sont nécessaires."], s: ["has-tdah", "eduscol-plans"] },
  { cas: "Un élève supporte mal les changements et le bruit", etapes: ["Routines stables, emploi du temps visuel, annoncer les changements.", "Réduire les stimulations ; prévoir un espace calme.", "Consignes explicites et littérales.", "S'appuyer sur le PPS / l'AESH et l'enseignant référent."], s: ["dsm5", "cap-ecole"] },
  { cas: "Un élève a une notification MDPH d'aménagements d'examen", etapes: ["Vérifier le PPS et la notification (temps majoré, matériel, secrétaire…).", "Anticiper l'organisation avec l'établissement et l'autorité académique.", "Appliquer les mêmes aménagements en CCF et en cours quand c'est possible."], s: ["code-L351-1", "eduscol-plans"] },
  { cas: "Un élève malade doit prendre un traitement / risque d'allergie", etapes: ["Mettre en place un PAI avec le médecin scolaire.", "Connaître le protocole d'urgence et l'emplacement de la trousse.", "Informer l'équipe concernée, avec discrétion."], s: ["art-D351-9", "eduscol-plans"] },
  { cas: "Je repère des difficultés mais aucun bilan n'existe encore", etapes: ["Adapter dès maintenant (lisibilité, consignes, étayage) — sans attendre.", "En parler en équipe ; orienter la famille vers un bilan.", "Tracer les observations ; selon l'évolution, viser un PAP."], s: ["troubles-app", "eduscol-plans"] },
  { cas: "L'élève aurait besoin d'un ordinateur / d'un logiciel adapté", etapes: ["Décrire le besoin d'accessibilité (écrit, lecture…).", "Matériel pédagogique adapté : selon les besoins, via le PAP, ou notification MDPH (PPS).", "Consigner au LPI."], s: ["lpi", "guide-mpa"] },
  { cas: "La famille refuse la démarche MDPH", etapes: ["Continuer à adapter au plan pédagogique (PAP, PPRE).", "Maintenir le dialogue, expliquer l'intérêt pour l'élève.", "Tracer les adaptations mises en place."], s: ["eduscol-plans"] },
  { cas: "Un élève en crise / refus, montée de tension", etapes: ["Baisser la tension : ton calme, ne pas entrer dans le rapport de force.", "Rappeler la règle simplement, proposer une issue (espace de retour au calme).", "Revenir à froid sur l'incident ; informer la vie scolaire / le référent."], s: ["cap-ecole", "corbion"] },
  { cas: "Comment travailler avec l'AESH ?", etapes: ["Clarifier les rôles : l'AESH accompagne, l'enseignant enseigne.", "Préciser les temps et les tâches d'aide les plus utiles.", "Viser l'autonomie de l'élève (l'AESH s'efface progressivement)."], s: ["ash-aesh"] },
];

/* --------------------------------------------------------------------
   RESSOURCES — pour aller plus loin (liens externes)
-------------------------------------------------------------------- */
const RESSOURCES = [
  { t: "Éduscol — École inclusive", d: "Le portail officiel de la scolarisation des élèves à besoins éducatifs particuliers.", url: "https://eduscol.education.gouv.fr/1224/ecole-inclusive" },
  { t: "Répondre aux BEP — les 4 plans", d: "La page officielle qui présente PPS, PAP, PAI et PPRE.", url: "https://eduscol.education.gouv.fr/1198/repondre-aux-besoins-educatifs-particuliers-des-eleves" },
  { t: "Cap École inclusive (Réseau Canopé)", d: "Fiches d'adaptation par besoin et par trouble, pour la classe.", url: "https://www.reseau-canope.fr/cap-ecole-inclusive/accueil.html" },
  { t: "Livret de parcours inclusif (LPI)", d: "L'outil numérique qui centralise les aménagements de l'élève.", url: "https://eduscol.education.gouv.fr/3157/livret-de-parcours-inclusif-lpi" },
  { t: "HAS — Troubles du neurodéveloppement", d: "Recommandations sur le repérage et l'orientation (et le TDAH, 2024).", url: "https://www.has-sante.fr/jcms/p_3161334/fr/troubles-du-neurodeveloppement-reperage-et-orientation-des-enfants-a-risque" },
];

window.GUIDE = GUIDE;
window.SOURCES = SOURCES;
window.DISPOSITIFS = DISPOSITIFS;
window.ORIENTEUR = ORIENTEUR;
window.TND_INTRO = TND_INTRO;
window.TROUBLES = TROUBLES;
window.PARCOURS = PARCOURS;
window.SITUATIONS = SITUATIONS;
window.RESSOURCES = RESSOURCES;
window.GLOSSAIRE = [
  ["BEP / EBEP", "Besoins éducatifs particuliers — élèves à besoins éducatifs particuliers."],
  ["Accessibilité", "Rendre l'environnement, les supports et les situations utilisables par tous, sans démarche individuelle."],
  ["Compensation", "Aides individuelles notifiées pour compenser le handicap (AESH, matériel, aménagements)."],
  ["MDPH", "Maison départementale des personnes handicapées — évalue les besoins liés au handicap."],
  ["CDAPH", "Commission des droits et de l'autonomie des personnes handicapées — notifie les droits."],
  ["EPE", "Équipe pluridisciplinaire d'évaluation (MDPH) — évalue la situation et élabore le PPS."],
  ["Notification", "Décision écrite de la CDAPH qui ouvre des droits (AESH, ULIS, matériel, aménagements)."],
  ["Cerfa", "Formulaire administratif officiel — ici, le dossier de demande à la MDPH."],
  ["PPS", "Projet personnalisé de scolarisation — pour un élève en situation de handicap (via MDPH)."],
  ["PAP", "Plan d'accompagnement personnalisé — pour un trouble des apprentissages (sans MDPH)."],
  ["PAI", "Projet d'accueil individualisé — pour une maladie / des soins."],
  ["PPRE", "Programme personnalisé de réussite éducative — pour une difficulté scolaire."],
  ["PAS", "Pôle d'appui à la scolarité — remplace progressivement le PIAL (depuis 2024)."],
  ["PIAL", "Pôle inclusif d'accompagnement localisé — ancien dispositif, en cours de remplacement."],
  ["LPI", "Livret de parcours inclusif — outil numérique des aménagements de l'élève."],
  ["ESS", "Équipe de suivi de la scolarisation — suit le PPS, animée par l'enseignant référent."],
  ["GEVA-Sco", "Guide d'évaluation des besoins de scolarisation (école ↔ MDPH)."],
  ["Enseignant référent", "Enseignant spécialisé qui suit les PPS, anime l'ESS et fait le lien avec la MDPH."],
  ["ULIS", "Unité localisée pour l'inclusion scolaire — dispositif d'inclusion."],
  ["AESH", "Accompagnant d'élève en situation de handicap — aide humaine notifiée."],
  ["MPA", "Matériel pédagogique adapté (ordinateur, logiciels, matériel spécifique…)."],
  ["RASED", "Réseau d'aides spécialisées aux élèves en difficulté (1er degré)."],
  ["UPE2A", "Unité pédagogique pour élèves allophones arrivants."],
  ["SESSAD", "Service d'éducation spéciale et de soins à domicile (accompagnement médico-social)."],
  ["IME / ITEP", "Établissements médico-sociaux (déficience intellectuelle / difficultés psychologiques)."],
  ["ESMS", "Établissement ou service médico-social."],
  ["PsyEN", "Psychologue de l'Éducation nationale."],
  ["SEGPA", "Section d'enseignement général et professionnel adapté."],
  ["EREA", "Établissement régional d'enseignement adapté."],
  ["Aménagements d'examens", "Conditions adaptées de passation (temps majoré / tiers-temps, secrétaire, matériel, salle…)."],
  ["TND", "Troubles du neurodéveloppement (TSA, TDAH, troubles dys, TDI…)."],
  ["TSA", "Trouble du spectre de l'autisme."],
  ["TDAH", "Trouble déficit de l'attention avec ou sans hyperactivité."],
  ["DYS", "Troubles spécifiques des apprentissages (dyslexie, dysorthographie, dyspraxie, dyscalculie…)."],
  ["TDL", "Trouble développemental du langage (dysphasie)."],
  ["TDC", "Trouble développemental de la coordination (dyspraxie)."],
  ["TDI", "Trouble du développement intellectuel."],
  ["CUA", "Conception universelle des apprentissages — accessibilité pour tous dès la conception."],
  ["FALC", "Facile à lire et à comprendre — règles de rédaction très accessibles."],
  ["DSM-5 / CIM-11", "Classifications de référence des troubles (usage médical)."],
];
