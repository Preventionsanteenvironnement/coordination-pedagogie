/* ============================================================================
   Guide PFMP didactique — base de données (sources vérifiées + contenus)
   100% LOCAL · RGPD : aucun nom d'élève, d'enseignant ni d'établissement.
   Les SOURCES (texte intégral + référence + date + lien) sont reprises de
   Légifrance / documents officiels, déjà vérifiées.
============================================================================ */
const SOURCES = {
  /* ---- Niveau LÉGISLATIF : Code de l'éducation (partie L) ---------------- */
  "L124-1": {
    type: "loi", ref: "Code de l'éducation, art. L124-1",
    origine: "Création LOI n°2014-788 du 10 juillet 2014 — en vigueur depuis le 12 juillet 2014",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000029233449",
    texte: `Les enseignements scolaires et universitaires peuvent comporter, respectivement, des périodes de formation en milieu professionnel ou des stages. Les périodes de formation en milieu professionnel sont obligatoires dans les conditions prévues à l'article L. 331-4 du présent code.

Les périodes de formation en milieu professionnel et les stages ne relevant ni du 2° de l'article L. 4153-1 du code du travail, ni de la formation professionnelle tout au long de la vie, définie à la sixième partie du même code, font l'objet d'une convention entre le stagiaire, l'organisme d'accueil et l'établissement d'enseignement, dont les mentions obligatoires sont déterminées par décret.

Les périodes de formation en milieu professionnel et les stages correspondent à des périodes temporaires de mise en situation en milieu professionnel au cours desquelles l'élève ou l'étudiant acquiert des compétences professionnelles et met en œuvre les acquis de sa formation en vue d'obtenir un diplôme ou une certification et de favoriser son insertion professionnelle. Le stagiaire se voit confier une ou des missions conformes au projet pédagogique défini par son établissement d'enseignement et approuvées par l'organisme d'accueil.

L'enseignant référent prévu à l'article L. 124-2 du présent code est tenu de s'assurer auprès du tuteur mentionné à l'article L. 124-9, à plusieurs reprises durant le stage ou la période de formation en milieu professionnel, de son bon déroulement et de proposer à l'organisme d'accueil, le cas échéant, une redéfinition d'une ou des missions pouvant être accomplies.`
  },
  "L124-2": {
    type: "loi", ref: "Code de l'éducation, art. L124-2",
    origine: "Création LOI n°2014-788 du 10 juillet 2014 — en vigueur depuis le 12 juillet 2014",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000029233451",
    texte: `L'établissement d'enseignement est chargé :

1° D'appuyer et d'accompagner les élèves ou les étudiants dans leur recherche de périodes de formation en milieu professionnel ou de stages correspondant à leur cursus et à leurs aspirations et de favoriser un égal accès des élèves et des étudiants, respectivement, aux périodes de formation en milieu professionnel et aux stages ;

2° De définir dans la convention, en lien avec l'organisme d'accueil et le stagiaire, les compétences à acquérir ou à développer au cours de la période de formation en milieu professionnel ou du stage et la manière dont ce temps s'inscrit dans le cursus de formation ;

3° De désigner un enseignant référent au sein des équipes pédagogiques de l'établissement, qui s'assure du bon déroulement de la période de formation en milieu professionnel ou du stage et du respect des stipulations de la convention mentionnée à l'article L. 124-1. Le nombre de stagiaires suivis simultanément par un même enseignant référent et les modalités de ce suivi pédagogique et administratif constant sont définis par le conseil d'administration de l'établissement, dans la limite d'un plafond fixé par décret ;

4° D'encourager la mobilité internationale des stagiaires, notamment dans le cadre des programmes de l'Union européenne.`
  },
  "L124-3": {
    type: "loi", ref: "Code de l'éducation, art. L124-3",
    origine: "Modifié par LOI n°2020-1674 du 24 décembre 2020 — en vigueur depuis le 27 décembre 2020",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042815051",
    texte: `Les périodes de formation en milieu professionnel et les stages sont intégrés à un cursus pédagogique scolaire ou universitaire, selon des modalités déterminées par décret. Un volume pédagogique minimal de formation en établissement ou selon les modalités d'enseignement à distance proposées par l'établissement ainsi que les modalités d'encadrement de la période de formation en milieu professionnel ou du stage par l'établissement d'enseignement et l'organisme d'accueil sont fixés par ce décret et précisés dans la convention de stage.`
  },
  "L124-4": {
    type: "loi", ref: "Code de l'éducation, art. L124-4",
    origine: "Création LOI n°2014-788 du 10 juillet 2014 — en vigueur depuis le 12 juillet 2014",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000029233865",
    texte: `Tout élève ou étudiant ayant achevé sa période de formation en milieu professionnel ou son stage transmet aux services de son établissement d'enseignement chargés de l'accompagner dans son projet d'études et d'insertion professionnelle un document dans lequel il évalue la qualité de l'accueil dont il a bénéficié au sein de l'organisme. Ce document n'est pas pris en compte dans son évaluation ou dans l'obtention de son diplôme.`
  },
  "L124-5": {
    type: "loi", ref: "Code de l'éducation, art. L124-5",
    origine: "LOI n°2014-788 du 10 juillet 2014 — en vigueur depuis le 12 juillet 2014",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000029234973",
    texte: `La durée du ou des stages ou périodes de formation en milieu professionnel effectués par un même stagiaire dans un même organisme d'accueil ne peut excéder six mois par année d'enseignement.`
  },
  "L124-6": {
    type: "loi", ref: "Code de l'éducation, art. L124-6",
    origine: "Création LOI n°2014-788 du 10 juillet 2014 — en vigueur depuis le 1er septembre 2015",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000029234400",
    texte: `Lorsque la durée du stage ou de la période de formation en milieu professionnel au sein d'un même organisme d'accueil est supérieure à deux mois consécutifs ou, au cours d'une même année scolaire ou universitaire, à deux mois consécutifs ou non, le ou les stages ou la ou les périodes de formation en milieu professionnel font l'objet d'une gratification versée mensuellement dont le montant est fixé par convention de branche ou par accord professionnel étendu ou, à défaut, par décret, à un niveau minimal de 15 % du plafond horaire de la sécurité sociale défini en application de l'article L. 241-3 du code de la sécurité sociale. Cette gratification n'a pas le caractère d'un salaire au sens de l'article L. 3221-3 du code du travail.

[…] La gratification mentionnée au premier alinéa est due au stagiaire à compter du premier jour du premier mois de la période de stage ou de formation en milieu professionnel. Son montant minimal forfaitaire n'est pas fonction du nombre de jours ouvrés dans le mois.`
  },
  "L124-7": {
    type: "loi", ref: "Code de l'éducation, art. L124-7",
    origine: "Création LOI n°2014-788 du 10 juillet 2014 — en vigueur depuis le 12 juillet 2014",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000029234119",
    texte: `Aucune convention de stage ne peut être conclue pour exécuter une tâche régulière correspondant à un poste de travail permanent, pour faire face à un accroissement temporaire de l'activité de l'organisme d'accueil, pour occuper un emploi saisonnier ou pour remplacer un salarié ou un agent en cas d'absence ou de suspension de son contrat de travail.`
  },
  "L124-8": {
    type: "loi", ref: "Code de l'éducation, art. L124-8",
    origine: "LOI n°2014-788 du 10 juillet 2014 — en vigueur depuis le 12 juillet 2014",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000029234121",
    texte: `Le nombre de stagiaires dont la convention de stage est en cours sur une même semaine civile dans l'organisme d'accueil ne peut pas être supérieur à un nombre fixé par décret en Conseil d'Etat. Ce nombre tient compte des effectifs de l'organisme d'accueil. […]

Par dérogation au premier alinéa du présent article, l'autorité académique fixe […] le nombre de stagiaires qui peuvent être accueillis dans un même organisme d'accueil pendant une même semaine civile au titre de la période de formation en milieu professionnel prévue par le règlement du diplôme qu'ils préparent.`
  },
  "L124-9": {
    type: "loi", ref: "Code de l'éducation, art. L124-9",
    origine: "Création LOI n°2014-788 du 10 juillet 2014 — en vigueur depuis le 12 juillet 2014",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000029234123",
    texte: `L'organisme d'accueil désigne un tuteur chargé de l'accueil et de l'accompagnement du stagiaire. Le tuteur est garant du respect des stipulations pédagogiques de la convention prévues au 2° de l'article L. 124-2.

Un accord d'entreprise peut préciser les tâches confiées au tuteur, ainsi que les conditions de l'éventuelle valorisation de cette fonction.`
  },
  "L124-13": {
    type: "loi", ref: "Code de l'éducation, art. L124-13",
    origine: "LOI n°2014-788 du 10 juillet 2014 — en vigueur depuis le 12 juillet 2014",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000029234215",
    texte: `En cas de grossesse, de paternité ou d'adoption, le stagiaire bénéficie de congés et d'autorisations d'absence d'une durée équivalente à celles prévues pour les salariés aux articles L. 1225-16 à L. 1225-28, L. 1225-35, L. 1225-37 et L. 1225-46 du code du travail.

Pour les stages et les périodes de formation en milieu professionnel dont la durée est supérieure à deux mois et dans la limite de la durée maximale prévue à l'article L. 124-5 du présent code, la convention de stage doit prévoir la possibilité de congés et d'autorisations d'absence au bénéfice du stagiaire au cours de la période de formation en milieu professionnel ou du stage.

Le stagiaire a accès au restaurant d'entreprise ou aux titres-restaurant prévus à l'article L. 3262-1 du code du travail, dans les mêmes conditions que les salariés de l'organisme d'accueil. Il bénéficie également de la prise en charge des frais de transport prévue à l'article L. 3261-2 du même code.`
  },
  "L124-14": {
    type: "loi", ref: "Code de l'éducation, art. L124-14",
    origine: "LOI n°2014-788 du 10 juillet 2014 — en vigueur depuis le 12 juillet 2014",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000029234217",
    texte: `La présence du stagiaire dans l'organisme d'accueil suit les règles applicables aux salariés de l'organisme pour ce qui a trait :

1° Aux durées maximales quotidienne et hebdomadaire de présence ;

2° A la présence de nuit ;

3° Au repos quotidien, au repos hebdomadaire et aux jours fériés.

Pour l'application du présent article, l'organisme d'accueil établit, selon tous moyens, un décompte des durées de présence du stagiaire.

Il est interdit de confier au stagiaire des tâches dangereuses pour sa santé ou sa sécurité.`
  },
  "L124-15": {
    type: "loi", ref: "Code de l'éducation, art. L124-15",
    origine: "LOI n°2014-788 du 10 juillet 2014 — en vigueur depuis le 12 juillet 2014",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000029234219",
    texte: `Lorsque le stagiaire interrompt sa période de formation en milieu professionnel ou son stage pour un motif lié à la maladie, à un accident, à la grossesse, à la paternité, à l'adoption ou, en accord avec l'établissement, en cas de non-respect des stipulations pédagogiques de la convention ou en cas de rupture de la convention à l'initiative de l'organisme d'accueil, l'autorité académique ou l'établissement d'enseignement supérieur valide la période de formation en milieu professionnel ou le stage, même s'il n'a pas atteint la durée prévue dans le cursus, ou propose au stagiaire une modalité alternative de validation de sa formation. En cas d'accord des parties à la convention, un report de la fin de la période de formation en milieu professionnel ou du stage, en tout ou partie, est également possible.`
  },
  "L124-16": {
    type: "loi", ref: "Code de l'éducation, art. L124-16",
    origine: "LOI n°2014-788 du 10 juillet 2014 — en vigueur depuis le 12 juillet 2014",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000029234235",
    texte: `Les stagiaires accèdent aux activités sociales et culturelles mentionnées à l'article L. 2323-83 du code du travail dans les mêmes conditions que les salariés.`
  },
  "L124-17": {
    type: "loi", ref: "Code de l'éducation, art. L124-17",
    origine: "LOI n°2014-788 du 10 juillet 2014 — en vigueur depuis le 12 juillet 2014",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000029234262",
    texte: `La méconnaissance des articles L. 124-8, L. 124-14 et de la première phrase du premier alinéa de l'article L. 124-9 est constatée par les agents de contrôle de l'inspection du travail mentionnés aux articles L. 8112-1 et L. 8112-5 du code du travail.

Les manquements sont passibles d'une amende administrative prononcée par l'autorité administrative.

Le montant de l'amende est d'au plus 2 000 € par stagiaire concerné par le manquement et d'au plus 4 000 € en cas de réitération dans un délai d'un an à compter du jour de la notification de la première amende. […]`
  },
  /* ---- Niveau RÉGLEMENTAIRE : Code de l'éducation (partie D) ------------- */
  "D124-8": {
    type: "reglement", ref: "Code de l'éducation, art. D124-8",
    origine: "Création DÉCRET n°2014-1420 du 27 novembre 2014 — en vigueur depuis le 1er décembre 2014",
    url: "https://www.legifrance.gouv.fr/codes/id/LEGISCTA000029814078",
    texte: `La gratification de stage définie à l'article L. 124-6 est due au stagiaire sans préjudice du remboursement des frais engagés par celui-ci […].

La gratification prévue à l'article L. 124-6 est due pour chaque heure de présence du stagiaire dans l'organisme d'accueil, à compter du premier jour du premier mois de la période de formation en milieu professionnel ou du stage. Elle est versée mensuellement. […]

Tout organisme d'accueil peut prévoir de verser une gratification lorsque la durée de la période de formation en milieu professionnel ou du stage est inférieure à la durée définie à l'article L. 124-6.`
  },
  "D124-9": {
    type: "reglement", ref: "Code de l'éducation, art. D124-9",
    origine: "Création DÉCRET n°2014-1420 du 27 novembre 2014 — en vigueur depuis le 1er décembre 2014",
    url: "https://www.legifrance.gouv.fr/codes/id/LEGISCTA000029814078",
    texte: `Une attestation de stage est délivrée par l'organisme d'accueil à tout élève ou étudiant. Cette attestation mentionne la durée effective totale du stage et le montant total de la gratification versée au stagiaire, le cas échéant.`
  },
  /* ---- Textes spécifiques à la voie professionnelle --------------------- */
  "arrete-2018": {
    type: "reglement", ref: "Arrêté du 21 novembre 2018 (modifié)",
    origine: "Arrêté relatif à l'organisation et aux enseignements dispensés dans les formations sous statut scolaire préparant au baccalauréat professionnel (et arrêté équivalent pour le CAP). Durée des PFMP fixée par le référentiel de chaque spécialité.",
    url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000037665781",
    texte: `La durée totale des PFMP est inscrite dans l'arrêté de création de chaque spécialité de diplôme ; sa répartition dans le cycle relève de l'établissement (sauf pour le CAP, dont l'arrêté prévoit une répartition par année).

Nombre de séquences selon la durée totale (rappel de la circulaire n°2016-053) :
• 12 semaines → 3 séquences maximum ;
• de 13 à 18 semaines → 4 séquences ;
• de 19 à 22 semaines → 6 séquences.

⚠ Il n'existe donc PAS de durée unique « 22 semaines pour tous les bacs pro » : la durée exacte dépend du référentiel de la spécialité.`
  },
  "decret-allocation-2023": {
    type: "reglement", ref: "Décret n°2023-765 du 11 août 2023",
    origine: "Décret relatif au versement d'une allocation en faveur des lycéens de la voie professionnelle dans le cadre de la valorisation des PFMP (+ arrêté du 11 août 2023 fixant les montants).",
    url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000047954696",
    texte: `Les élèves de la voie professionnelle sous statut scolaire bénéficient, au titre des PFMP réalisées, d'une allocation versée par l'État, calculée sur le nombre de jours de PFMP effectivement réalisés et un forfait journalier par niveau de formation. Cette allocation est propre à la voie professionnelle scolaire et se distingue de la « gratification » de stage de l'article L. 124-6. Le versement n'a pas d'impact sur le revenu imposable ni sur les allocations perçues par les familles.`
  },
  "fiche-allocation": {
    type: "reglement", ref: "Allocation PFMP — montants officiels (déc. 2025)",
    origine: "Fiche ministérielle « Allocation des PFMP pour les lycéens professionnels — Montant de l'allocation ». Application du décret et de l'arrêté du 11 août 2023.",
    url: "https://www.education.gouv.fr/l-allocation-pour-les-lyceens-professionnels-engages-dans-des-periodes-de-formation-en-milieu-378266",
    texte: `Le montant est fonction du nombre de jours de PFMP effectivement réalisés × un forfait journalier par niveau.

ÉDUCATION NATIONALE — Baccalauréat professionnel :
• 2de pro : 10 €/jour — plafond annuel 300 € (6 sem.)
• 1re pro : 15 €/jour — plafond annuel 600 € (8 sem.)
• Terminale pro : 20 €/jour — plafond 2025-2026 : 1000 € (10 sem.) [800 € en 2023-24, 1200 € en 2024-25]

ÉDUCATION NATIONALE — CAP (14 sem. sur le cycle) :
• 1re année : 10 €/jour — plafond annuel 350 € (7 sem.)
• 2e année : 15 €/jour — plafond annuel 525 € (7 sem.)
• CAP en 1 an : 15 €/jour — 525 €

AGRICULTURE — CAP agricole (CAPa) :
• 1re année : 10 €/jour — 450 € (9 sem.) · 2e année : 15 €/jour — 675 € (9 sem.)
AGRICULTURE — Bac pro agricole :
• 2de : 10 €/jour — 300 € (6 sem.) · 1re : 15 €/jour — 900 € (12 sem.) · Terminale : 20 €/jour — 800 € (8 sem.)

L'allocation est versée par l'État via le circuit établissement / ASP, sur la base des jours réellement effectués (attestation / validation des périodes).`
  },
  "convention-type": {
    type: "convention", ref: "Convention-type de PFMP (modèle national)",
    origine: "Modèle de convention annexé à la circulaire n°2016-053 du 29 mars 2016 (signée par l'établissement, l'organisme d'accueil et le stagiaire ou son représentant légal).",
    url: "https://www.education.gouv.fr/bo/16/Hebdo13/MENE1608407C.htm",
    texte: `Art. 4 — Statut et obligations de l'élève : « L'élève demeure, durant la période de formation en milieu professionnel, sous statut scolaire. Il reste sous la responsabilité du chef d'établissement scolaire. […] L'élève est soumis aux règles générales en vigueur dans l'entreprise, notamment en matière de sécurité, d'horaires et de discipline […]. »

Art. 16 — Suspension et résiliation : « Le chef d'établissement et le représentant de l'entreprise d'accueil se tiendront mutuellement informés des difficultés qui pourraient être rencontrées […]. Le cas échéant, ils prendront, d'un commun accord et en liaison avec l'équipe pédagogique, les dispositions propres à résoudre les problèmes d'absentéisme ou de manquement à la discipline. Au besoin, ils étudieront ensemble les modalités de suspension ou de résiliation […]. »

Art. 12 — Couverture des accidents du travail : « […] l'obligation de déclaration d'accident incombe à l'entreprise d'accueil. Celle-ci adressera à la CPAM compétente, une lettre recommandée avec accusé de réception, dans les 48 heures suivant l'accident […]. L'entreprise fait parvenir, sans délai, une copie de la déclaration au chef d'établissement. » (art. L. 412-8 et R. 412-4 du code de la sécurité sociale)`
  },
  "fiche-allocation-circuit": {
    type: "reglement", ref: "Allocation PFMP — circuit & acteurs (fiche officielle, oct. 2025)",
    origine: "Fiche ministérielle « Allocation des PFMP — Étapes et rôle des différents acteurs ». Application du décret et de l'arrêté du 11 août 2023.",
    url: "https://www.education.gouv.fr/l-allocation-pour-les-lyceens-professionnels-engages-dans-des-periodes-de-formation-en-milieu-378266",
    texte: `Quatre acteurs : le lycéen, le chef/directeur d'établissement (ordonnateur), l'entreprise d'accueil, et l'Agence de services de paiement (ASP, payeur).

Circuit (via l'application ApLyPro) : le chef d'établissement valide la décision d'attribution annuelle (rend l'élève éligible), puis, après chaque PFMP, l'entreprise remet une attestation de fin de stage indiquant le nombre de jours réellement effectués ; ce nombre est saisi dans ApLyPro ; le chef d'établissement valide l'« état liquidatif » (valeur de service fait), transmis à l'ASP qui paie.

« Seules les PFMP qui font l'objet d'une convention de stage tripartite ouvrent le droit à percevoir une allocation. »

Absence : « en cas d'absence d'un élève durant sa PFMP, quel que soit le motif, le ou les jours manqués sont récupérés » par report/prolongement, nouvelle PFMP (nouvelle convention), ou à titre exceptionnel report sur l'année suivante. L'état liquidatif doit être émis dans les deux mois suivant la fin de la PFMP.`
  },
  "convention-horaires": {
    type: "convention", ref: "Convention-type, art. 6 à 8 (durée et horaires de travail)",
    origine: "Annexe « Convention type » de la circulaire n°2016-053 du 29 mars 2016. Les horaires journaliers de l'élève figurent dans l'annexe pédagogique de la convention.",
    url: "https://www.education.gouv.fr/bo/16/Hebdo13/MENE1608407C.htm",
    texte: `Art. 6 — Durée du travail : « tous les élèves sont soumis à la durée hebdomadaire légale ou conventionnelle si celle-ci est inférieure à la durée légale. »

Art. 7 — Élèves majeurs : « […] la moyenne des durées de travail hebdomadaires […] ne pourra excéder les limites indiquées ci-dessus. En ce qui concerne le travail de nuit, seul l'élève majeur nommément désigné par le chef d'établissement scolaire peut être incorporé à une équipe de nuit. »

Art. 8 — Élèves mineurs : « La durée de travail de l'élève mineur ne peut excéder 8 heures par jour et 35 heures par semaine. Le repos hebdomadaire de l'élève mineur doit être d'une durée minimale de deux jours consécutifs. La période minimale de repos hebdomadaire doit comprendre le dimanche, sauf en cas de dérogation légale. Pour chaque période de vingt-quatre heures, la période minimale de repos quotidien est fixée à quatorze heures consécutives pour l'élève mineur de moins de seize ans et à douze heures consécutives pour l'élève mineur de seize à dix-huit ans. Au-delà de quatre heures et demie de travail quotidien, l'élève mineur doit bénéficier d'une pause d'au moins trente minutes consécutives. Le travail de nuit est interdit : à l'élève mineur de seize à dix-huit ans entre vingt-deux heures le soir et six heures le matin ; à l'élève de moins de seize ans entre vingt heures et six heures. Ces dispositions ne peuvent pas faire l'objet d'une dérogation. »`
  },
  "circulaire-2016": {
    type: "reglement", ref: "Circulaire n°2016-053 du 29 mars 2016",
    origine: "« Organisation et accompagnement des périodes de formation en milieu professionnel » (BO n°13 du 31 mars 2016, NOR MENE1608407C). Cadre pédagogique des PFMP sous statut scolaire (niveaux V et IV).",
    url: "https://www.education.gouv.fr/bo/16/Hebdo13/MENE1608407C.htm",
    texte: `Rôle du tuteur : « Le tuteur ou la tutrice instaure avec l'enseignant(e) référent(e) le dialogue nécessaire au suivi de l'élève et lui signale les difficultés susceptibles de mettre en échec le bon déroulement de la période : retards, absences, attitudes passives, comportements inappropriés. »

Suivi par l'établissement : « [les enseignants mettent] en place, tout au long de la période, un suivi individualisé impliquant de veiller aux échanges d'informations entre l'organisme d'accueil et l'établissement […]. Ce suivi pédagogique est réalisé par l'enseignant(e) référent(e) de l'élève désigné(e) pour chaque période de formation en entreprise. »

Responsabilité générale : « Le/la chef(fe) d'établissement est responsable de l'organisation générale (recherche de lieux de formation, désignation des enseignants référents, conventionnement, etc.). […] Le conseil d'administration détermine les modalités de suivi pédagogique assuré par les enseignant(e)s référent(e)s. »`
  },
  "D124-3": {
    type: "reglement", ref: "Code de l'éducation, art. D124-3",
    origine: "Décret n°2014-1420 du 27 novembre 2014 — plafond du nombre d'élèves suivis par un enseignant référent.",
    url: "https://www.legifrance.gouv.fr/codes/id/LEGISCTA000029814078",
    texte: `Un(e) enseignant(e) référent(e) ne peut pas être chargé(e) du suivi de plus de 16 élèves simultanément pour une même période de formation en milieu professionnel. (rappelé par la circulaire n°2016-053 du 29 mars 2016, en vertu de l'article D. 124-3 du code de l'éducation)`
  },
  "decret-92-1189": {
    type: "reglement", ref: "Décret n°92-1189 du 6 novembre 1992 (statut des PLP)",
    origine: "Statut particulier des professeurs de lycée professionnel — base de la répartition de la charge d'encadrement des élèves en PFMP. Cité par la circulaire n°2016-053.",
    url: "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000006080299",
    texte: `« Pendant les périodes en entreprise des élèves d'une division, chaque professeur de lycée professionnel enseignant dans cette division participe à l'encadrement pédagogique de ces élèves. La charge de cet encadrement est répartie entre les enseignants en tenant compte, notamment, du nombre d'heures hebdomadaires d'enseignement qu'il dispense dans cette division. »

« L'encadrement pédagogique d'un élève est comptabilisé dans le service du professeur pour deux heures par semaine, dans la limite de trois semaines par séquence de stage. » Si le nombre d'élèves suivis conduit un professeur à dépasser ses obligations de service, il bénéficie du paiement d'heures supplémentaires effectives.`
  }
};

/* --- 3 sources complémentaires --- */
Object.assign(SOURCES, {
  "D124-6": {
    type: "reglement", ref: "Code de l'éducation, art. D124-6",
    origine: "Décret n°2014-1420 du 27 novembre 2014 — décompte de la durée de présence.",
    url: "https://www.legifrance.gouv.fr/codes/id/LEGISCTA000029814078",
    texte: `« Chaque période au moins égale à sept heures de présence, consécutives ou non, est considérée comme équivalente à un jour et chaque période au moins égale à vingt-deux jours de présence, consécutifs ou non, est considérée comme équivalente à un mois. »`
  },
  "conv-accident": {
    type: "loi", ref: "Code de la sécurité sociale, art. L412-8 et R412-4",
    origine: "Accidents du travail des élèves et étudiants. La déclaration incombe à l'entreprise d'accueil (rappelé par la convention-type, art. 13).",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033712591",
    texte: `En application de l'article L. 412-8 du code de la sécurité sociale, l'élève bénéficie de la législation sur les accidents du travail. L'obligation de déclaration d'accident incombe à l'entreprise d'accueil, qui adresse à la CPAM compétente une lettre recommandée avec accusé de réception dans les 48 heures suivant l'accident, et fait parvenir sans délai une copie de la déclaration au chef d'établissement (art. R412-4).`
  },
  "CT-L3162-1": {
    type: "loi", ref: "Code du travail, art. L3162-1",
    origine: "Durée du travail des jeunes travailleurs de moins de 18 ans.",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037385958",
    texte: `« Les jeunes travailleurs ne peuvent être employés à un travail effectif excédant huit heures par jour et trente-cinq heures par semaine. »\n(Des dérogations limitées sont possibles, par décret ou sur autorisation de l'inspection du travail.)\nCette durée maximale (8 h/jour, 35 h/sem) s'applique à TOUS les moins de 18 ans, sans distinction d'âge.`
  },
  "CT-L3162-3": {
    type: "loi", ref: "Code du travail, art. L3162-3",
    origine: "Pause des jeunes travailleurs de moins de 18 ans.",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006902788",
    texte: `« Aucune période de travail effectif ininterrompue ne peut excéder une durée maximale de quatre heures et demie. Lorsque le temps de travail quotidien est supérieur à quatre heures et demie, les jeunes travailleurs bénéficient d'un temps de pause d'au moins trente minutes consécutives. »`
  },
  "CT-L3163": {
    type: "loi", ref: "Code du travail, art. L3163-1 et L3163-2",
    origine: "Travail de nuit des jeunes travailleurs de moins de 18 ans.",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006902789",
    texte: `Art. L3163-1 — Est considéré comme travail de nuit : 1° Pour les jeunes de seize à dix-huit ans, tout travail entre vingt-deux heures et six heures ; 2° Pour les jeunes de moins de seize ans, tout travail entre vingt heures et six heures.\n\nArt. L3163-2 — « Le travail de nuit est interdit pour les jeunes travailleurs. » (dérogations très limitées, par l'inspection du travail, pour certains secteurs définis par décret.)`
  },
  "CT-L3164": {
    type: "loi", ref: "Code du travail, art. L3164-1 et L3164-2",
    origine: "Repos quotidien et hebdomadaire des jeunes travailleurs de moins de 18 ans.",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006902793",
    texte: `Art. L3164-1 — « La durée minimale du repos quotidien ne peut être inférieure à douze heures consécutives. Cette durée minimale est portée à quatorze heures consécutives s'ils sont âgés de moins de seize ans. »\n\nArt. L3164-2 — Les jeunes travailleurs bénéficient de deux jours de repos consécutifs par semaine.`
  },
  "decret-2013-915": {
    type: "reglement", ref: "Décret n°2013-915 du 11 octobre 2013",
    origine: "Travaux interdits et réglementés pour les jeunes de moins de 18 ans (dérogations possibles pour la formation professionnelle).",
    url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000028067788",
    texte: `Le décret actualise la liste des travaux interdits aux jeunes de moins de 18 ans et précise les dérogations possibles, notamment pour les besoins de la formation professionnelle, sous conditions (déclaration de l'entreprise à l'inspection du travail, encadrement).`
  }
});

/* ==========================================================================
   SECTIONS : deux parties — "pfmp" (cadre réglementaire) et "convention".
   Chaque thème contient des notions ; chaque notion cite une ou des sources.
========================================================================== */
const SECTIONS = {
  pfmp: {
    label: "PFMP — Cadre réglementaire", icone: "📚",
    intro: "Ce que disent les textes officiels sur les périodes de formation en milieu professionnel.",
    themes: [
      { titre: "Définition & obligation", icone: "🎯", notions: [
        { t: "La PFMP est une période temporaire de mise en situation professionnelle où l'élève acquiert des compétences et met en œuvre sa formation, en vue du diplôme.", s: ["L124-1"] },
        { t: "Les PFMP sont obligatoires dans les formations professionnelles sous statut scolaire : elles font partie intégrante du diplôme.", s: ["L124-1", "circulaire-2016"] },
        { t: "Elles font l'objet d'une convention entre l'élève (ou son représentant légal si mineur), l'organisme d'accueil et l'établissement.", s: ["L124-1"] },
        { t: "L'élève n'est pas un salarié : la PFMP ne peut pas servir à occuper un poste permanent, remplacer un salarié absent, ni faire face à un surcroît d'activité.", s: ["L124-7"] }
      ]},
      { titre: "Référent, tuteur & suivi", icone: "🧑‍🏫", notions: [
        { t: "L'établissement désigne un enseignant référent pour chaque élève : c'est lui qui assure le suivi pédagogique individuel.", s: ["L124-2", "L124-1"] },
        { t: "Le référent s'assure, à plusieurs reprises pendant la période, auprès du tuteur, du bon déroulement de la PFMP.", s: ["L124-1"] },
        { t: "L'organisme d'accueil désigne un tuteur, chargé de l'accueil et de l'accompagnement, garant des stipulations pédagogiques.", s: ["L124-9"] },
        { t: "Un même enseignant référent ne peut pas suivre plus de 16 élèves simultanément pour une même période.", s: ["D124-3"] },
        { t: "La charge d'encadrement se répartit entre les enseignants de la division, notamment selon le nombre d'heures qu'ils y enseignent.", s: ["decret-92-1189", "L124-2"] }
      ]},
      { titre: "Durée & volume horaire", icone: "📅", notions: [
        { t: "Dans un même organisme, la durée des PFMP ne peut excéder 6 mois par année d'enseignement.", s: ["L124-5"] },
        { t: "La durée totale des PFMP est fixée par le référentiel de chaque spécialité (arrêté du 21 nov. 2018) : il n'y a pas de durée unique pour tous les bacs pro.", s: ["arrete-2018"] },
        { t: "Nombre de séquences selon la durée totale : 12 sem → 3 séquences ; 13 à 18 → 4 ; 19 à 22 → 6.", s: ["arrete-2018", "circulaire-2016"] },
        { t: "Décompte : un jour = au moins 7 h de présence ; un mois = au moins 22 jours de présence.", s: ["D124-6"] }
      ]},
      { titre: "Argent : allocation & gratification", icone: "💶", notions: [
        { t: "Les lycéens professionnels perçoivent une allocation de l'État pour les jours de PFMP réellement effectués (≠ gratification d'entreprise).", s: ["decret-allocation-2023", "fiche-allocation"] },
        { t: "Forfait journalier (Éducation nationale) : 2nde 10 € · 1re 15 € · Terminale 20 € ; CAP 1re année 10 € · 2e année 15 €.", s: ["fiche-allocation"] },
        { t: "L'allocation est versée via l'établissement (application ApLyPro) et l'ASP, sur la base de l'attestation de fin de stage ; l'état liquidatif est émis dans les 2 mois.", s: ["fiche-allocation-circuit"] },
        { t: "La gratification (versée par l'entreprise) n'est obligatoire qu'au-delà de 2 mois (> 44 jours) dans un même organisme — rare en lycée pro.", s: ["L124-6", "D124-8"] }
      ]},
      { titre: "Horaires & âge", icone: "🕐", notions: [
        { t: "La présence de l'élève suit les règles des salariés : durées maximales, travail de nuit, repos, jours fériés ; les tâches dangereuses sont interdites.", s: ["L124-14"] },
        { t: "Durée maximale (tous les moins de 18 ans, SANS distinction d'âge) : 8 heures par jour et 35 heures par semaine.", s: ["CT-L3162-1"] },
        { t: "Pause : au-delà de 4 h 30 de travail, au moins 30 minutes consécutives ; aucune période ininterrompue ne peut dépasser 4 h 30.", s: ["CT-L3162-3"] },
        { t: "Repos quotidien (distinction selon l'âge) : 14 heures consécutives pour les moins de 16 ans, 12 heures pour les 16-18 ans.", s: ["CT-L3164"] },
        { t: "Repos hebdomadaire : 2 jours consécutifs.", s: ["CT-L3164"] },
        { t: "Travail de nuit interdit (distinction selon l'âge) : moins de 16 ans → entre 20 h et 6 h ; 16-18 ans → entre 22 h et 6 h.", s: ["CT-L3163"] },
        { t: "Élève majeur : les protections propres aux mineurs ne s'appliquent pas ; il suit les règles générales du temps de travail.", s: ["L124-14"] },
        { t: "Le nombre de stagiaires accueillis simultanément dans un organisme est encadré ; l'autorité académique le fixe pour les PFMP.", s: ["L124-8"] }
      ]},
      { titre: "Documents", icone: "📄", notions: [
        { t: "Une convention tripartite est obligatoire : aucun départ en PFMP sans convention signée par toutes les parties.", s: ["L124-1", "circulaire-2016"] },
        { t: "À la fin, l'organisme délivre une attestation de stage (durée effective totale + gratification éventuelle).", s: ["D124-9"] },
        { t: "L'élève remet à l'établissement une évaluation de la qualité de l'accueil (sans effet sur son diplôme).", s: ["L124-4"] }
      ]},
      { titre: "Absence, interruption & rupture", icone: "⛔", notions: [
        { t: "En cas d'interruption (maladie, accident, grossesse/paternité/adoption, non-respect des stipulations, rupture par l'entreprise), l'établissement valide la PFMP ou propose une validation alternative ; un report est possible.", s: ["L124-15"] },
        { t: "Absence : quel que soit le motif, les jours manqués sont récupérés (report/prolongement, nouvelle PFMP, ou exceptionnellement l'année suivante).", s: ["fiche-allocation-circuit"] },
        { t: "Le tuteur signale à l'établissement les retards, absences, attitudes passives ou comportements inappropriés.", s: ["circulaire-2016"] }
      ]},
      { titre: "Sécurité & travaux des mineurs", icone: "⚠️", notions: [
        { t: "Tâches dangereuses interdites ; un mineur d'au moins 15 ans peut être affecté à des travaux réglementés après déclaration de dérogation de l'entreprise à l'inspection du travail.", s: ["L124-14", "circulaire-2016", "decret-2013-915"] },
        { t: "Les travaux interdits et réglementés pour les moins de 18 ans (et les dérogations) sont fixés par décret.", s: ["decret-2013-915"] }
      ]},
      { titre: "Sanctions & contrôle", icone: "⚖️", notions: [
        { t: "Le non-respect de certaines règles (nombre de stagiaires, conditions de présence, désignation du tuteur) est constaté par l'inspection du travail et passible d'une amende administrative (jusqu'à 2 000 € par stagiaire, 4 000 € en cas de réitération).", s: ["L124-17", "L124-8", "L124-14", "L124-9"] }
      ]}
    ]
  },
  convention: {
    label: "La Convention de stage", icone: "📄",
    intro: "La convention signée dans l'établissement, rendue explicite article par article.",
    themes: [
      { titre: "Cadre & parties", icone: "🧾", notions: [
        { t: "La convention est signée par l'organisme d'accueil, le chef d'établissement, l'élève (ou son représentant légal si mineur), l'enseignant référent et le tuteur ; elle est ensuite adressée à la famille.", s: ["convention-type", "circulaire-2016"] },
        { t: "Elle vise le Code de l'éducation (art. L124-1 à 20 et D124-1 à 9) et le code du travail (travail des mineurs).", s: ["L124-1"] },
        { t: "Décompte de la durée : un jour = au moins 7 h de présence ; un mois = au moins 22 jours.", s: ["D124-6"] }
      ]},
      { titre: "Statut de l'élève (art. 4)", icone: "🎓", notions: [
        { t: "L'élève reste sous statut scolaire, sous la responsabilité du chef d'établissement ; il n'entre pas dans l'effectif de l'entreprise et ne peut pas voter aux élections professionnelles.", s: ["convention-type"] },
        { t: "Il est soumis aux règles internes (sécurité, horaires, discipline) et au secret professionnel.", s: ["convention-type"] }
      ]},
      { titre: "Argent (art. 5-6)", icone: "💶", notions: [
        { t: "Art. 5 — Allocation de l'État : versée au lycéen pour les jours effectués, attestés par l'attestation de stage.", s: ["decret-allocation-2023", "fiche-allocation"] },
        { t: "Art. 6 — Gratification : pas de rémunération ; une gratification n'est due qu'au-delà de 2 mois dans un même organisme.", s: ["L124-6"] }
      ]},
      { titre: "Horaires (art. 7-9)", icone: "🕐", notions: [
        { t: "Art. 7 — Tous les élèves sont soumis à la durée hebdomadaire légale (ou conventionnelle si inférieure).", s: ["convention-horaires"] },
        { t: "Art. 8 — Élève majeur : travail de nuit seulement si nommément désigné par le chef d'établissement.", s: ["convention-horaires"] },
        { t: "Art. 9 — Élève mineur : 8 h/jour, 35 h/sem, pause, repos, nuit interdite — non dérogeable.", s: ["convention-horaires"] }
      ]},
      { titre: "Sécurité (art. 10-12)", icone: "⚠️", notions: [
        { t: "Art. 10 — Accès au restaurant/titres-restaurant et prise en charge des transports comme les salariés.", s: ["L124-13"] },
        { t: "Art. 11 — Travaux réglementés des mineurs : possibles dès 15 ans après déclaration de dérogation de l'entreprise ; usage sous contrôle permanent du tuteur.", s: ["decret-2013-915", "circulaire-2016"] },
        { t: "Art. 12 — Sécurité électrique : habilitation par le chef d'entreprise après une formation préalable en établissement (concerne notamment l'électrotechnique).", s: ["circulaire-2016"] }
      ]},
      { titre: "Accident (art. 13)", icone: "🚑", notions: [
        { t: "L'élève bénéficie de la législation accidents du travail. L'entreprise déclare à la CPAM (LRAR) sous 48 h et adresse une copie au chef d'établissement.", s: ["conv-accident"] }
      ]},
      { titre: "Absences & congés (art. 14)", icone: "📌", notions: [
        { t: "Congés et autorisations d'absence (grossesse, paternité, adoption) équivalents à ceux des salariés ; pour les périodes > 2 mois, la convention le prévoit.", s: ["L124-13"] }
      ]},
      { titre: "Suivi & rupture (art. 15-19)", icone: "🔄", notions: [
        { t: "Art. 15 — Assurances : l'entreprise garantit sa responsabilité civile ; le chef d'établissement assure la RC de l'élève.", s: ["convention-type"] },
        { t: "Art. 16 — Encadrement & suivi : les conditions (référent + tuteur) figurent dans l'annexe pédagogique.", s: ["convention-type", "L124-1"] },
        { t: "Art. 17 — Suspension/résiliation : établissement et entreprise se concertent (absentéisme, discipline).", s: ["convention-type"] },
        { t: "Art. 18 — Validation en cas d'interruption : validation alternative ou report possible.", s: ["L124-15"] },
        { t: "Art. 19 — Attestation de stage délivrée par l'organisme à la fin.", s: ["D124-9"] }
      ]},
      { titre: "Annexes", icone: "📎", notions: [
        { t: "Annexe pédagogique : horaires de l'élève, objectifs, modalités de suivi (présence vérifiée dans les 2 premiers jours, visite de fin), signalement des absences (entreprise + vie scolaire), évaluation.", s: ["convention-type", "circulaire-2016"] },
        { t: "Annexe financière : avantages éventuels (restauration, transport), gratification (souvent 0), assurances.", s: ["convention-type"] }
      ]}
    ]
  }
};

/* --------- FLASHCARDS (recto question / verso réponse + source) --------- */
const FLASHCARDS = {
  pfmp: [
    { q: "Combien d'élèves un référent peut-il suivre au maximum, sur une même période ?", r: "16 élèves simultanément.", s: ["D124-3"] },
    { q: "La PFMP peut-elle dépasser 6 mois ?", r: "Non, pas dans un même organisme, par année d'enseignement.", s: ["L124-5"] },
    { q: "Tous les bacs pro ont-ils la même durée de PFMP ?", r: "Non : la durée dépend du référentiel de la spécialité (arrêté 2018).", s: ["arrete-2018"] },
    { q: "Allocation : combien par jour en terminale bac pro (EN) ?", r: "20 € / jour.", s: ["fiche-allocation"] },
    { q: "Qui désigne le tuteur ?", r: "L'organisme d'accueil.", s: ["L124-9"] },
    { q: "Qui assure le suivi pédagogique de l'élève ?", r: "L'enseignant référent.", s: ["L124-1", "L124-2"] },
    { q: "Travail de nuit d'un mineur de 16-18 ans : quelles heures sont interdites ?", r: "De 22 h à 6 h — sans dérogation.", s: ["convention-horaires"] },
    { q: "Un jour de PFMP, c'est combien d'heures de présence ?", r: "Au moins 7 heures.", s: ["D124-6"] },
    { q: "Qui délivre l'attestation de stage ?", r: "L'organisme d'accueil, à la fin.", s: ["D124-9"] },
    { q: "Peut-on faire remplacer un salarié absent par un stagiaire ?", r: "Non, c'est interdit.", s: ["L124-7"] }
  ],
  convention: [
    { q: "Sous quel statut est l'élève pendant la PFMP ?", r: "Statut scolaire, sous la responsabilité du chef d'établissement.", s: ["convention-type"] },
    { q: "Qui déclare un accident du travail ?", r: "L'entreprise : CPAM sous 48 h + copie au chef d'établissement.", s: ["conv-accident"] },
    { q: "Qui signe la convention pour un élève mineur ?", r: "Son représentant légal.", s: ["convention-type"] },
    { q: "L'élève peut-il commencer sans convention signée ?", r: "Non, jamais.", s: ["L124-1", "circulaire-2016"] },
    { q: "Allocation ou gratification : qui verse quoi ?", r: "L'allocation vient de l'État ; la gratification (rare) viendrait de l'entreprise.", s: ["decret-allocation-2023", "L124-6"] },
    { q: "Travail de nuit d'un majeur en PFMP ?", r: "Possible seulement s'il est nommément désigné par le chef d'établissement.", s: ["convention-horaires"] }
  ]
};

/* --------- SCÉNARIOS « Que faire si… » (les pièges) --------- */
const SCENARIOS = [
  { cas: "L'élève ne vient pas en stage et ne donne aucune nouvelle", etapes: [
      "L'élève reste sous statut scolaire : l'établissement gère l'absence comme une absence scolaire (vie scolaire, contact famille).",
      "Le tuteur/entreprise signale l'absence ; l'établissement et l'entreprise se tiennent informés.",
      "Si la situation perdure : étudier ensemble suspension/résiliation, ou validation alternative / report.",
      "Les jours non effectués ne comptent pas pour l'allocation ; un rattrapage peut être organisé."
    ], s: ["convention-type", "circulaire-2016", "L124-15", "fiche-allocation-circuit"] },
  { cas: "L'élève est absent mais l'employeur n'a pas prévenu l'établissement", etapes: [
      "Le tuteur DOIT signaler les absences/retards à l'établissement : c'est prévu (annexe pédagogique / circulaire).",
      "L'élève doit aussi prévenir l'entreprise ET la vie scolaire, avec justificatif écrit.",
      "À défaut, le référent relance le tuteur ; tracer les échanges."
    ], s: ["circulaire-2016", "convention-type"] },
  { cas: "La convention n'a pas été signée avant le départ", etapes: [
      "Pas de départ en PFMP sans convention signée par toutes les parties.",
      "Régulariser les signatures (ordre conseillé : organisme, tuteur, élève, représentant légal, référent, chef d'établissement en dernier)."
    ], s: ["L124-1", "circulaire-2016"] },
  { cas: "Quel volume horaire / quelle durée pour un bac pro ?", etapes: [
      "Il n'y a pas de durée unique : elle est fixée par le référentiel de la spécialité (arrêté 2018).",
      "Repère : 12 sem → 3 séquences ; 13-18 → 4 ; 19-22 → 6. Vérifier le référentiel."
    ], s: ["arrete-2018", "circulaire-2016", "L124-5"] },
  { cas: "L'entreprise veut arrêter la PFMP", etapes: [
      "Établissement et entreprise se concertent.",
      "L'établissement valide la PFMP ou propose une validation alternative ; un report est possible (avenant)."
    ], s: ["convention-type", "L124-15"] },
  { cas: "Accident pendant le stage ou le trajet", etapes: [
      "L'entreprise déclare à la CPAM (LRAR) sous 48 h.",
      "Elle adresse une copie au chef d'établissement sans délai."
    ], s: ["conv-accident"] },
  { cas: "Les horaires proposés ne respectent pas l'âge de l'élève", etapes: [
      "Ne pas signer en l'état.",
      "Pour un mineur : 8 h/jour, 35 h/sem, pause, repos, nuit interdite (non dérogeable)."
    ], s: ["convention-horaires"] },
  { cas: "L'élève n'a pas de lieu de stage", etapes: [
      "L'équipe (référent, PP) et le bureau des entreprises / pôle de stages aident à trouver un lieu.",
      "Pas de départ tant que la convention n'est pas signée."
    ], s: ["circulaire-2016", "L124-1"] },
  { cas: "Des jours ont été manqués : impact sur l'allocation ?", etapes: [
      "L'allocation ne couvre que les jours réellement effectués et attestés.",
      "Un rattrapage peut être organisé pour compléter la durée attendue."
    ], s: ["fiche-allocation-circuit"] }
];

if (typeof window !== "undefined") {
  window.SOURCES = SOURCES; window.SECTIONS = SECTIONS; window.FLASHCARDS = FLASHCARDS; window.SCENARIOS = SCENARIOS;
}

/* ===================== ENRICHISSEMENT ===================== */
// Nouveaux thèmes (cadre PFMP)
SECTIONS.pfmp.themes.push(
  { titre: "Chiffres clés", icone: "🔢", notions: [
    { t: "16 — nombre maximum d'élèves suivis par un même référent, pour une même période.", s: ["D124-3"] },
    { t: "6 mois — durée maximale des PFMP dans un même organisme, par année d'enseignement.", s: ["L124-5"] },
    { t: "7 heures de présence = 1 jour ; 22 jours = 1 mois (pour le décompte).", s: ["D124-6"] },
    { t: "2 mois (plus de 44 jours) — seuil au-delà duquel une gratification d'entreprise devient obligatoire.", s: ["L124-6"] },
    { t: "48 heures — délai de déclaration d'un accident à la CPAM par l'entreprise.", s: ["conv-accident"] },
    { t: "10 € / 15 € / 20 € — allocation par jour : 2nde / 1re / terminale bac pro (Éducation nationale).", s: ["fiche-allocation"] },
    { t: "2 premiers jours — le référent vérifie la présence de l'élève dans l'entreprise.", s: ["circulaire-2016"] }
  ]},
  { titre: "Acteurs & repères", icone: "🧭", notions: [
    { t: "L'établissement appuie la recherche de lieu, favorise un égal accès aux PFMP et encourage la mobilité internationale.", s: ["L124-2"] },
    { t: "Une semaine de préparation à la première PFMP est prévue pour les entrants en 2nde professionnelle et en CAP.", s: ["circulaire-2016"] },
    { t: "Pas d'évaluation certificative en 2nde professionnelle ni en 1re année de CAP.", s: ["circulaire-2016"] },
    { t: "Les pôles de stages / bureaux des entreprises aident à trouver des lieux, sans remplacer les enseignants.", s: ["circulaire-2016"] },
    { t: "Les PFMP peuvent être organisées à l'étranger.", s: ["circulaire-2016"] }
  ]}
);
// Notions ajoutées à des thèmes existants
SECTIONS.pfmp.themes[0].notions.push(
  { t: "Une visite préalable peut être organisée avant la PFMP pour préparer l'intégration de l'élève.", s: ["circulaire-2016"] }
);
SECTIONS.convention.themes[0].notions.push(
  { t: "La convention comprend des dispositions générales + une annexe pédagogique et une annexe financière, signées avec elle.", s: ["convention-type"] }
);

// Flashcards supplémentaires
FLASHCARDS.pfmp.push(
  { q: "Combien d'heures de présence valent 1 jour de PFMP ?", r: "7 heures.", s: ["D124-6"] },
  { q: "Sous quel délai l'entreprise déclare-t-elle un accident ?", r: "48 heures (LRAR à la CPAM).", s: ["conv-accident"] },
  { q: "Y a-t-il une évaluation certificative en 2nde pro ?", r: "Non.", s: ["circulaire-2016"] }
);
FLASHCARDS.convention.push(
  { q: "Quels textes la convention vise-t-elle ?", r: "Le Code de l'éducation (L124) et le code du travail (mineurs).", s: ["L124-1"] },
  { q: "Qui assure la responsabilité civile de l'élève ?", r: "Le chef d'établissement.", s: ["convention-type"] }
);

// Scénarios supplémentaires
SCENARIOS.push(
  { cas: "L'élève est mineur : que vérifier avant de signer ?", etapes: [
      "Faire signer le représentant légal.",
      "Vérifier les horaires / nuit / repos selon l'âge.",
      "Vérifier les travaux réglementés (dérogation de l'entreprise)."
    ], s: ["convention-horaires", "decret-2013-915"] },
  { cas: "Combien d'élèves puis-je suivre comme référent ?", etapes: [
      "16 maximum pour une même période.",
      "La charge se répartit entre enseignants selon leurs heures dans la division."
    ], s: ["D124-3", "decret-92-1189"] }
);

/* --------- QUIZ (QCM avec score) --------- */
const QUIZ = {
  pfmp: [
    { q: "Un référent peut suivre au maximum…", o: ["8 élèves", "16 élèves", "25 élèves"], c: 1, s: ["D124-3"] },
    { q: "La durée des PFMP dans un même organisme ne peut excéder…", o: ["3 mois", "6 mois par année", "1 an"], c: 1, s: ["L124-5"] },
    { q: "L'allocation en terminale bac pro (EN) est de…", o: ["10 €/jour", "15 €/jour", "20 €/jour"], c: 2, s: ["fiche-allocation"] },
    { q: "Le travail de nuit d'un mineur de 16-18 ans est interdit…", o: ["de 20 h à 6 h", "de 22 h à 6 h", "il n'est pas interdit"], c: 1, s: ["convention-horaires"] },
    { q: "Qui désigne le tuteur ?", o: ["L'établissement", "L'organisme d'accueil", "Le rectorat"], c: 1, s: ["L124-9"] },
    { q: "Tous les bacs pro ont-ils la même durée de PFMP ?", o: ["Oui, 22 semaines", "Non, selon le référentiel"], c: 1, s: ["arrete-2018"] },
    { q: "1 jour de PFMP = combien d'heures de présence ?", o: ["5 h", "7 h", "8 h"], c: 1, s: ["D124-6"] }
  ],
  convention: [
    { q: "Pendant la PFMP, l'élève est…", o: ["salarié", "sous statut scolaire", "stagiaire indépendant"], c: 1, s: ["convention-type"] },
    { q: "Qui déclare un accident du travail ?", o: ["L'élève", "L'établissement", "L'entreprise"], c: 2, s: ["conv-accident"] },
    { q: "La convention doit être signée par…", o: ["3 parties", "toutes les parties (dont représentant légal si mineur)"], c: 1, s: ["convention-type", "circulaire-2016"] },
    { q: "Une gratification d'entreprise est obligatoire si la durée dépasse…", o: ["1 mois", "2 mois", "elle n'est jamais obligatoire"], c: 1, s: ["L124-6"] }
  ]
};

/* --------- GLOSSAIRE (sigles) --------- */
const GLOSSAIRE = [
  ["PFMP", "Période de formation en milieu professionnel."],
  ["PP", "Professeur principal."],
  ["DDF / DDFPT", "Directeur délégué aux formations professionnelles et technologiques."],
  ["RBDE", "Responsable du bureau des entreprises."],
  ["ASP", "Agence de services et de paiement — verse l'allocation."],
  ["ApLyPro", "Application de gestion du versement de l'allocation PFMP."],
  ["CDAPH", "Commission des droits et de l'autonomie des personnes handicapées — attribue l'aide humaine."],
  ["AESH", "Accompagnant d'élève en situation de handicap."],
  ["PIAL", "Pôle inclusif d'accompagnement localisé — gère les AESH."],
  ["PPS", "Projet personnalisé de scolarisation."],
  ["CAP", "Certificat d'aptitude professionnelle."],
  ["Bac pro", "Baccalauréat professionnel."],
  ["CPAM", "Caisse primaire d'assurance maladie."],
  ["Référent", "Enseignant chargé du suivi pédagogique de l'élève en PFMP."],
  ["Tuteur", "Personne de l'entreprise qui accueille et accompagne l'élève."],
  ["Convention de stage", "Contrat tripartite (élève, organisme, établissement) encadrant la PFMP."],
  ["Pré-convention", "Document préalable recueillant les informations pour établir la convention."],
  ["Attestation de stage", "Document de fin indiquant les jours réellement effectués."],
  ["Gratification", "Somme éventuelle versée par l'entreprise (au-delà de 2 mois)."],
  ["Allocation PFMP", "Aide de l'État aux lycéens professionnels pour les jours effectués."],
  ["Avenant", "Modification de la convention (report, suspension…)."]
];

if (typeof window !== "undefined") { window.QUIZ = QUIZ; window.GLOSSAIRE = GLOSSAIRE; }

/* ===== REFONTE « 100% OFFICIEL » : sources code du travail + nettoyage ===== */
Object.assign(SOURCES, {
  "CT-L3162-1": { type: "loi", ref: "Code du travail, art. L3162-1", origine: "Durée du travail des jeunes de moins de 18 ans.", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037385958", texte: "« Les jeunes travailleurs ne peuvent être employés à un travail effectif excédant huit heures par jour et trente-cinq heures par semaine. » (Des dérogations limitées sont possibles, par décret ou par l'inspecteur du travail, sans dépasser la durée applicable aux adultes de l'établissement.)" },
  "CT-L3162-3": { type: "loi", ref: "Code du travail, art. L3162-3", origine: "Pause des jeunes travailleurs.", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006902788", texte: "« Aucune période de travail effectif ininterrompue ne peut excéder, pour les jeunes travailleurs, une durée maximale de quatre heures et demie. Lorsque le temps de travail quotidien est supérieur à quatre heures et demie, les jeunes travailleurs bénéficient d'un temps de pause d'au moins trente minutes consécutives. »" },
  "CT-L3163-1": { type: "loi", ref: "Code du travail, art. L3163-1", origine: "Définition du travail de nuit des jeunes.", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006902789", texte: "« Pour l'application du présent chapitre, est considéré comme travail de nuit :\n1° Pour les jeunes travailleurs de plus de seize ans et de moins de dix-huit ans, tout travail entre 22 heures et 6 heures ;\n2° Pour les jeunes travailleurs de moins de seize ans, tout travail entre 20 heures et 6 heures. »" },
  "CT-L3163-2": { type: "loi", ref: "Code du travail, art. L3163-2", origine: "Interdiction du travail de nuit des jeunes.", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006902790", texte: "« Le travail de nuit est interdit pour les jeunes travailleurs. » (Des dérogations très encadrées existent pour certains secteurs ; jamais entre minuit et 4 heures, sauf urgence.)" },
  "CT-L3164-1": { type: "loi", ref: "Code du travail, art. L3164-1", origine: "Repos quotidien des jeunes travailleurs.", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006902793", texte: "La durée minimale du repos quotidien des jeunes travailleurs ne peut être inférieure à douze heures consécutives. Cette durée est portée à quatorze heures consécutives pour les jeunes de moins de seize ans." },
  "CT-L3164-2": { type: "loi", ref: "Code du travail, art. L3164-2", origine: "Repos hebdomadaire des jeunes travailleurs.", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036262892", texte: "Les jeunes travailleurs bénéficient de deux jours de repos consécutifs par semaine." },
  "CSS-accident": { type: "loi", ref: "Code de la sécurité sociale, art. L412-8 et R412-4", origine: "Couverture accidents du travail des élèves en PFMP et modalités de déclaration.", url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006073189/", texte: "L'élève bénéficie de la législation sur les accidents du travail (art. L. 412-8). En cas d'accident, la déclaration incombe à l'organisme d'accueil, qui l'adresse à la CPAM dans les 48 heures (art. R. 412-4) et en informe l'établissement." }
});

// 1) Le guide devient mono-domaine : on retire la convention (espace séparé).
delete SECTIONS.convention; delete FLASHCARDS.convention; delete QUIZ.convention;
SECTIONS.pfmp.label = "PFMP — Cadre réglementaire (officiel)";
SECTIONS.pfmp.intro = "Uniquement le droit officiel : Code de l'éducation, code du travail, circulaires et décrets. (La convention de l'établissement est un espace distinct.)";

// 2) Refonte du thème Horaires/âge → sourcé sur le CODE DU TRAVAIL, précis par âge.
(function () {
  var t = SECTIONS.pfmp.themes.find(function (x) { return x.titre === "Horaires & âge"; });
  if (!t) return;
  t.titre = "Horaires & travail des mineurs"; t.icone = "🕐";
  t.notions = [
    { t: "Durée maximale : 8 heures par jour et 35 heures par semaine — pour TOUS les jeunes de moins de 18 ans. Sur la durée quotidienne, il n'y a pas de distinction selon l'âge.", s: ["CT-L3162-1"] },
    { t: "Pause : aucune période de travail ininterrompue ne peut dépasser 4 h 30 ; au-delà, pause d'au moins 30 minutes consécutives.", s: ["CT-L3162-3"] },
    { t: "Repos quotidien : au moins 12 heures consécutives — porté à 14 heures pour les moins de 16 ans.", s: ["CT-L3164-1"] },
    { t: "Repos hebdomadaire : 2 jours consécutifs.", s: ["CT-L3164-2"] },
    { t: "Travail de nuit interdit pour les jeunes. Est « de nuit » : 22 h-6 h pour les 16-18 ans ; 20 h-6 h pour les moins de 16 ans.", s: ["CT-L3163-2", "CT-L3163-1"] },
    { t: "Pendant la PFMP, la présence de l'élève suit aussi les règles applicables aux salariés (durées, repos, jours fériés) ; tâches dangereuses interdites.", s: ["L124-14"] },
    { t: "Ces règles viennent du code du travail et s'imposent : la convention de l'établissement ne fait que les reprendre — c'est l'occasion de vérifier qu'elle les reprend correctement.", s: ["CT-L3162-1", "CT-L3164-1"] }
  ];
})();

// 3) Re-sourcer le chiffre « 48 h accident » sur le code de la sécurité sociale.
(function () {
  var t = SECTIONS.pfmp.themes.find(function (x) { return x.titre === "Chiffres clés"; });
  if (!t) return;
  t.notions.forEach(function (n) { if (/48 heures/.test(n.t)) n.s = ["CSS-accident"]; });
})();

// 4) Corriger les flashcards/quiz qui citaient la convention → code du travail.
function remap(arr) { (arr || []).forEach(function (c) { c.s = (c.s || []).map(function (id) { return id === "convention-horaires" ? "CT-L3163-1" : id === "conv-accident" ? "CSS-accident" : id; }); }); }
remap(FLASHCARDS.pfmp); remap(QUIZ.pfmp);

/* 5) Remap GLOBAL : aucune source « convention » dans le guide officiel. */
(function () {
  var M = { "convention-horaires": "CT-L3162-1", "conv-accident": "CSS-accident", "convention-type": "circulaire-2016" };
  function fix(s) { return [...new Set((s || []).map(function (id) { return M[id] || id; }))]; }
  SECTIONS.pfmp.themes.forEach(function (t) { t.notions.forEach(function (n) { n.s = fix(n.s); }); });
  (FLASHCARDS.pfmp || []).forEach(function (c) { c.s = fix(c.s); });
  (QUIZ.pfmp || []).forEach(function (q) { q.s = fix(q.s); });
  (window.SCENARIOS || []).forEach(function (sc) { sc.s = fix(sc.s); });
  delete SOURCES["convention-type"]; delete SOURCES["convention-horaires"]; delete SOURCES["conv-accident"];
})();
