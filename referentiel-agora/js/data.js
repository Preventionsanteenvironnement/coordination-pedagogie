/* =====================================================================
   RÉFÉRENTIEL BAC PRO AGOrA — SOCLE DE DONNÉES
   Source : Arrêté du 18 février 2020 (version en vigueur, consolidée),
   fiche RNCP40705, et textes de la réforme de la voie professionnelle.
   Le contenu réglementaire est reproduit fidèlement.
   ===================================================================== */

const REF = {};

/* ---------------------------------------------------------------------
   1. IDENTITÉ DU DIPLÔME
--------------------------------------------------------------------- */
REF.diplome = {
  intitule: "Baccalauréat professionnel — Assistance à la gestion des organisations et de leurs activités",
  sigle: "AGOrA",
  niveau: "Niveau 4 (cadre national des certifications professionnelles)",
  nsf: "324 — Secrétariat, bureautique",
  rncp: "RNCP40705",
  rncpAnterieur: "RNCP34606 (remplacée)",
  validite: "Enregistrement valable jusqu'au 31/08/2028",
  secteur: "Services administratifs et financiers — tous secteurs d'activité",
  duree: "3 ans (seconde, première, terminale professionnelles)",
  premiereSession: "2023",
  baseLegale: "Arrêté du 18 février 2020 (NOR : MENE2005098A), modifié",
  mission: "Apporter un appui à un dirigeant de petite structure, à un ou plusieurs cadres ou à une équipe dans une plus grande structure, en assurant des missions d'interface, de coordination et d'organisation dans le domaine administratif."
};

/* ---------------------------------------------------------------------
   2. PÔLES D'ACTIVITÉS = BLOCS DE COMPÉTENCES = UNITÉS
   Architecture en miroir. Chaque pôle porte sa couleur de thème.
--------------------------------------------------------------------- */
REF.poles = [
  {
    id: "p1",
    num: 1,
    couleur: "ocean",
    titre: "Gestion des relations avec les clients, les usagers et les adhérents",
    bloc: "Bloc de compétences 1 — Gérer des relations avec les clients, les usagers et les adhérents",
    blocRncp: "RNCP40705BC01",
    unite: "U31",
    epreuve: "E31",
    coef: 4,
    evaluation: "CCF (voie scolaire publique / apprentissage habilité) ou ponctuel oral et pratique de 45 min",
    presentation: "Le titulaire du baccalauréat professionnel AGOrA veille au bon déroulement des échanges avec les clients, les usagers et les adhérents de l'organisation dans le cadre de la mise à disposition de biens et de services, marchands ou non marchands. Souvent positionné comme le premier interlocuteur de l'entreprise ou du service, il s'inscrit dans la démarche commerciale de l'organisation par les activités d'accueil, de prise en charge et de suivi des demandes. Au-delà du contact, il assure le traitement des opérations administratives et de gestion de ces demandes et participe au suivi de l'activité ainsi qu'à la mise à jour du système d'information en lien avec la relation « client ». Par l'ensemble de ces activités, il contribue à l'image de l'organisation.",
    conditionsMobilisation: "Le titulaire est en contact direct avec le « client » de l'organisation pour l'accueillir, prendre en charge sa demande, ouvrir un dossier nominatif. Le terme générique de « client » recouvre la notion de prospect, d'usager (service public), d'adhérent ou de bénéficiaire de prestations (association, mutuelle). Il assure les différentes étapes du processus administratif lié à la relation « client » : instruction de dossier, devis, commandes, livraisons, facturations, encaissements, traitement des réclamations et des litiges. Son rôle d'interface en fait un acteur important dans la circulation et l'actualisation de l'information, dans le système interne comme à destination de l'externe (site et réseaux sociaux).",
    activites: [
      {
        code: "1.1",
        titre: "Préparation et prise en charge de la relation avec le client, l'usager ou l'adhérent",
        taches: [
          "Accueil et renseignement",
          "Prise en charge de la demande",
          "Préparation et suivi d'évènements liés à la promotion de l'organisation",
          "Assistance et suivi des opérations de prospection"
        ],
        competences: [
          "Identifier les caractéristiques de la demande",
          "Apporter une réponse adaptée à la demande",
          "Produire, dans un environnement numérique, des supports de communication adaptés",
          "Assurer le suivi administratif des opérations de promotion et de prospection"
        ],
        indicateurs: [
          "Expression française, écrite et orale, adaptée aux relations administratives",
          "Respect de la charte d'accueil (langage adapté à l'interlocuteur, empathie, etc.)",
          "Fiabilité de l'information recueillie",
          "Efficacité de la prise de notes",
          "Respect des règles de sécurité et de confidentialité",
          "Pertinence de la réponse apportée à la demande",
          "Efficacité de la gestion des flux de courriers / courriels",
          "Qualité des supports produits à partir de la suite bureautique"
        ]
      },
      {
        code: "1.2",
        titre: "Traitement des opérations administratives et de gestion liées aux relations avec le client, l'usager ou l'adhérent",
        taches: [
          "Suivi des devis, commandes, contrats, conventions",
          "Traitement de la livraison et de la facturation",
          "Traitement des encaissements",
          "Traitement des réclamations et des litiges"
        ],
        competences: [
          "Appliquer les procédures internes de traitement des relations « clients »",
          "Produire les documents liés au traitement des relations « clients » dans un environnement numérique",
          "Assurer le suivi des enregistrements des factures de vente et des encaissements à l'aide d'un progiciel dédié ou d'un PGI",
          "Assurer le suivi des relances clients"
        ],
        indicateurs: [
          "Respect des procédures et des normes",
          "Respect des délais impartis",
          "Fiabilité et conformité des documents produits à partir d'un progiciel de gestion intégré (PGI)",
          "Sécurisation des encaissements",
          "Conformité des enregistrements",
          "Pertinence de la réponse apportée à une réclamation",
          "Qualité de la rédaction des écrits commerciaux"
        ]
      },
      {
        code: "1.3",
        titre: "Actualisation du système d'information en lien avec le client, l'usager ou l'adhérent",
        taches: [
          "Mise à jour des dossiers",
          "Mise à jour de tableaux de bord « commerciaux »",
          "Suivi et actualisation des données sur les réseaux sociaux",
          "Mise à jour des données du site internet de l'organisation"
        ],
        competences: [
          "Mettre à jour l'information",
          "Rendre compte des anomalies repérées lors de l'actualisation du système d'information",
          "Identifier et appliquer les moyens de protection et de sécurisation adaptés aux données enregistrées ou extraites",
          "Assurer la visibilité numérique de l'organisation (au travers des réseaux sociaux, du site internet, de blogs)"
        ],
        indicateurs: [
          "Fiabilité des mises à jour effectuées",
          "Pertinence des anomalies signalées",
          "Respect des dispositions éthiques et réglementaires en matière de conservation de données",
          "Adéquation des données publiées aux attentes des tiers"
        ]
      }
    ],
    moyens: {
      donnees: [
        "Données de la demande client, usager ou adhérent",
        "Données administratives, commerciales et comptables de l'organisation",
        "Organigramme, annuaire(s) interne(s) et externe(s)",
        "Chartes, procédures, instructions internes sur la gestion de la relation client",
        "Réglementation sur la protection des données (RGPD)"
      ],
      equipements: [
        "Équipement informatique multimédia connecté aux réseaux (internet, intranet, extranet)",
        "Matériel de téléphonie et équipements associés",
        "Imprimante multifonctions, scanner",
        "Suite bureautique (traitement de texte, tableur grapheur, base de données, dessin, PréAO)",
        "Logiciel de Publication assistée par ordinateur (PAO)",
        "Logiciels ou applications professionnels",
        "Progiciel de gestion intégré (PGI)",
        "Logiciels de documentation, de Gestion électronique des documents (GED)",
        "Outils ou services de communication numérique et collaboratifs",
        "Gestionnaires d'agenda, de planning, de projet"
      ]
    },
    liaisons: {
      internes: "Relation permanente avec le responsable ou le dirigeant, le chef de service, le responsable administratif, et les collaborateurs des services achats, commercial, vente, comptable, contentieux et tout autre service.",
      externes: [
        "Les clients, usagers ou adhérents (patients, assurés, passagers, abonnés, résidents, administrés, etc.)",
        "Les prospects, transporteurs, prestataires de services",
        "Les entreprises de recouvrement de créances et d'affacturage"
      ]
    },
    resultats: [
      "Les opérations de prospection sont traitées selon les objectifs et les procédures fixés par l'organisation.",
      "Les demandes des clients, usagers, adhérents sont prises en charge et traitées dans le respect des règles, des délais et des procédures de l'organisation et des contraintes.",
      "Le suivi des relations clients, usagers, adhérents est assuré en conformité avec les attentes de ces derniers et la politique de l'organisation."
    ]
  },

  {
    id: "p2",
    num: 2,
    couleur: "emeraude",
    titre: "Organisation et suivi de l'activité de production (de biens ou de services)",
    bloc: "Bloc de compétences 2 — Organiser et suivre l'activité de production (de biens ou de services)",
    blocRncp: "RNCP40705BC02",
    unite: "U2",
    epreuve: "E2",
    coef: 4,
    evaluation: "Ponctuel écrit de 3 h 30 (étude de cas) ou CCF (deux situations d'évaluation d'égale importance)",
    presentation: "Le titulaire du baccalauréat professionnel AGOrA exerce une activité support à celle de production de biens ou de services, marchands ou non marchands. Il assure la partie administrative des relations avec les fournisseurs et les autres partenaires, communs ou spécifiques au secteur. Il est associé au suivi financier de l'activité ainsi qu'à la gestion opérationnelle des espaces de travail. Il prend en compte la dématérialisation de son environnement de travail, tant dans ses relations avec les fournisseurs que dans la gestion des ressources.",
    conditionsMobilisation: "Le titulaire assure le suivi des activités administratives et de gestion en amont de la production (approvisionnement, autorisation préalable, etc.) en prenant en compte les contraintes réglementaires et organisationnelles. En aval, il assure un suivi régulier des opérations de trésorerie et prépare les éléments de la déclaration de TVA. Il facilite le bon déroulement des activités par la mise à disposition et le maintien en bon état des ressources physiques et numériques, assure la logistique des réunions et contribue à une diffusion efficace de l'information. Ces compétences s'actualisent dans un environnement numérique intégrant la digitalisation des processus, avec une dimension de communication interne vis-à-vis des supérieurs et des personnels.",
    activites: [
      {
        code: "2.1",
        titre: "Suivi administratif de l'activité de production",
        taches: [
          "Suivi des approvisionnements et des stocks",
          "Tenue des dossiers fournisseurs, sous-traitants et prestataires de service",
          "Suivi des formalités administratives avec les partenaires spécifiques au secteur d'activité",
          "Suivi de la coordination d'activités relevant d'un service ou d'un projet"
        ],
        competences: [
          "Appliquer les procédures internes de gestion des approvisionnements et des stocks",
          "Assurer le suivi des enregistrements des factures d'achats à l'aide d'un progiciel dédié ou d'un PGI",
          "Actualiser les bases de données internes nécessaires à l'activité de production",
          "Prendre en compte les contraintes réglementaires liées à l'activité de production de l'organisation",
          "Mettre à disposition des plannings d'activité actualisés"
        ],
        indicateurs: [
          "Expression française, écrite et orale, adaptée aux relations administratives",
          "Respect des procédures et des normes",
          "Conformité des enregistrements",
          "Pertinence et exactitude de l'information saisie dans le support adapté",
          "Cohérence et fiabilité du planning",
          "Respect des délais impartis"
        ]
      },
      {
        code: "2.2",
        titre: "Suivi financier de l'activité de production",
        taches: [
          "Suivi des décaissements",
          "Suivi de la trésorerie et des relations avec les organismes et partenaires financiers",
          "Préparation de la déclaration de TVA"
        ],
        competences: [
          "Établir un état de rapprochement",
          "Appliquer les procédures en vigueur en matière de règlement des fournisseurs, sous-traitants et prestataires",
          "Assurer le suivi des enregistrements des mouvements de trésorerie à l'aide d'un progiciel dédié ou d'un PGI",
          "Déterminer les éléments nécessaires à l'élaboration de la déclaration de TVA",
          "Établir un état périodique de trésorerie",
          "Rendre compte de l'équilibre financier et de la situation économique de l'organisation"
        ],
        indicateurs: [
          "Exactitude de l'état de rapprochement",
          "Respect des procédures et des normes",
          "Conformité des enregistrements",
          "Sécurisation des décaissements",
          "Pertinence et exactitude des éléments retenus pour la déclaration de TVA",
          "Exactitude de la situation de trésorerie",
          "Pertinence de l'appréciation de la situation économique et financière de l'organisation"
        ]
      },
      {
        code: "2.3",
        titre: "Gestion opérationnelle des espaces (physiques et virtuels) de travail",
        taches: [
          "Suivi des contrats de maintenance, abonnements, licences informatiques",
          "Gestion des petites fournitures et consommables",
          "Mise à disposition des ressources physiques partagées (entrées-sorties de matériels, clés, etc.)",
          "Organisation des réunions en présentiel ou à distance",
          "Gestion des espaces internes de partage de l'information (affichage, notes internes, espaces collaboratifs, etc.)"
        ],
        competences: [
          "Prendre en charge les activités support nécessaires au bon fonctionnement de l'organisation",
          "Actualiser et diffuser l'information interne sur le support adéquat"
        ],
        indicateurs: [
          "Efficacité de l'organisation mise en place",
          "Prise en compte des aléas techniques et organisationnels",
          "Respect des dispositions éthiques et réglementaires en matière de conservation et de diffusion de données",
          "Adéquation des données diffusées par rapport aux attentes des acteurs internes de l'organisation"
        ]
      }
    ],
    moyens: {
      donnees: [
        "Données administratives et comptables de l'organisation",
        "Informations émanant des établissements financiers",
        "Organigramme, annuaire(s) interne(s) et externe(s)",
        "Documentations juridique, comptable et fiscale",
        "Contraintes réglementaires, chartes, procédures, instructions internes",
        "Agendas personnel(s) et de groupe(s)",
        "Cahiers de maintenance, notices techniques, contrats de prestataires",
        "Budgets alloués aux petites fournitures, consommables et petits équipements de bureau"
      ],
      equipements: [
        "Équipement informatique multimédia connecté aux réseaux",
        "Imprimante multifonctions",
        "Suite bureautique (traitement de texte, tableur grapheur, base de données, dessin, PréAO)",
        "Logiciels ou applications professionnels",
        "Progiciel de gestion intégré (PGI)",
        "Logiciels de documentation, de Gestion électronique des documents (GED)",
        "Outils ou services de communication numérique",
        "Gestionnaires d'agenda, de planning et de projet"
      ]
    },
    liaisons: {
      internes: "Relation permanente avec le responsable ou dirigeant, le chef de service, le responsable administratif, les collaborateurs des services approvisionnements / production et, éventuellement, comptable, informatique, contentieux, contrôle qualité.",
      externes: [
        "Les fournisseurs et prestataires de services",
        "Les administrations, collectivités territoriales et partenaires spécifiques au secteur d'activité",
        "Les établissements bancaires et autres établissements financiers"
      ]
    },
    resultats: [
      "Le suivi administratif des approvisionnements est assuré de manière fiable, dans le respect des délais et des règles fixées notamment par les services techniques.",
      "Le suivi administratif des relations avec les fournisseurs et autres partenaires est assuré en conformité avec les procédures et la politique de l'organisation.",
      "Les éléments nécessaires au traitement des obligations fiscales sont réunis, dans la limite des responsabilités octroyées, avec exactitude et dans les délais.",
      "Le suivi de trésorerie est effectué de façon régulière et fiable.",
      "La programmation et l'organisation des activités répondent aux besoins et prennent en compte les contraintes et disponibilités des services.",
      "Les ressources matérielles et immatérielles nécessaires au bon fonctionnement sont mises à disposition dans les délais impartis."
    ]
  },

  {
    id: "p3",
    num: 3,
    couleur: "ambre",
    titre: "Administration du personnel",
    bloc: "Bloc de compétences 3 — Administrer le personnel",
    blocRncp: "RNCP40705BC03",
    unite: "U32",
    epreuve: "E32",
    coef: 3,
    evaluation: "CCF (voie scolaire publique / apprentissage habilité) ou ponctuel oral de 30 min",
    presentation: "Le titulaire du baccalauréat professionnel AGOrA apporte un soutien opérationnel à son supérieur hiérarchique ou au service des ressources humaines en matière d'administration du personnel. Ses missions consistent à suivre au quotidien les opérations courantes relatives au personnel, en conformité avec la législation et dans le respect des délais et consignes, en particulier celles relatives à la gestion de la paie et aux relations sociales. L'exercice de ces activités s'organise dans le respect de la confidentialité, des exigences de loyauté et d'éthique professionnelles liées au poste.",
    conditionsMobilisation: "Le titulaire assure un lien entre les personnels et le responsable en charge de la direction administrative du personnel. Il contribue aux opérations de recrutement et à l'intégration, assure la gestion des contrats de travail et l'organisation des visites médicales, le suivi des dossiers du personnel et des documents liés à la paie, à la formation et à la gestion de carrière. Il exerce dans un environnement technologique, économique et juridique exigeant une attention aux évolutions (réformes législatives, politique interne) et à la transformation numérique. En raison de sa connaissance d'informations confidentielles, il fait preuve de discrétion, de sens du contact et d'écoute.",
    activites: [
      {
        code: "3.1",
        titre: "Suivi de la carrière du personnel",
        taches: [
          "Suivi administratif du recrutement, de l'intégration et du départ des personnels",
          "Tenue des dossiers des personnels",
          "Préparation et suivi des actions de formation professionnelle"
        ],
        competences: [
          "Appliquer les procédures internes en matière d'entrée et de sortie du personnel",
          "Actualiser les bases d'information relatives au personnel",
          "Organiser des actions de formation"
        ],
        indicateurs: [
          "Expression française, écrite et orale, adaptée aux relations administratives",
          "Respect des procédures et des normes",
          "Respect de la législation sociale, des accords collectifs et conventions collectives de travail",
          "Respect des règles de sécurité et de confidentialité en matière de consultation et de conservation des données",
          "Rigueur de l'actualisation des bases de données",
          "Fiabilité des documents administratifs produits"
        ]
      },
      {
        code: "3.2",
        titre: "Suivi organisationnel et financier de l'activité du personnel",
        taches: [
          "Suivi des temps de travail des personnels",
          "Préparation et suivi des déplacements des personnels",
          "Préparation et suivi de la paie et des déclarations sociales"
        ],
        competences: [
          "Planifier les temps de présence et de congés des personnels en fonction des contraintes de l'organisation",
          "Organiser les déplacements des personnels",
          "Contrôler les états de frais",
          "Déterminer les éléments nécessaires à l'établissement du bulletin de paie",
          "Assurer le suivi des enregistrements liés à la paie à l'aide d'un progiciel dédié ou d'un PGI"
        ],
        indicateurs: [
          "Cohérence des plannings",
          "Optimisation en temps et en valeur des déplacements des personnels",
          "Pertinence de l'analyse des écarts budgétaires",
          "Efficacité dans l'utilisation d'un tableur",
          "Réactivité dans la transmission et le traitement de l'information au personnel concerné",
          "Exactitude des éléments retenus pour la préparation des bulletins de paie",
          "Conformité des enregistrements",
          "Détection et signalement des anomalies"
        ]
      },
      {
        code: "3.3",
        titre: "Participation à l'activité sociale de l'organisation",
        taches: [
          "Communication des informations sociales à destination des personnels",
          "Participation à la mise en place d'actions sociales et culturelles",
          "Mise à jour de tableaux de bord sociaux"
        ],
        competences: [
          "Actualiser et diffuser l'information sociale auprès des personnels",
          "Mettre en œuvre et suivre le résultat des actions sociales et culturelles",
          "Utiliser des fonctions simples de mise en pages d'un document pour répondre à un objectif de diffusion",
          "Rédiger des écrits professionnels en lien avec l'activité sociale de l'organisation"
        ],
        indicateurs: [
          "Pertinence et qualité des supports de communication à partir de la suite bureautique et d'un logiciel de PAO",
          "Adéquation des données diffusées aux attentes des acteurs concernés",
          "Fiabilité des mises à jour effectuées",
          "Pertinence et efficacité des actions support de la cohésion sociale",
          "Adaptation du message aux objectifs de communication et aux supports retenus"
        ]
      }
    ],
    moyens: {
      donnees: [
        "Réglementation sociale en vigueur (contrat de travail, formation, recrutement, licenciement, élections professionnelles, temps de travail, rémunération, égalité professionnelle, etc.)",
        "Réglementation générale sur la protection des données (RGPD)",
        "Accords collectifs, conventions collectives de travail",
        "Modes opératoires, tutoriels, procédures internes (chartes, règlement intérieur, procédures de recrutement et d'intégration, livret d'accueil, etc.)",
        "Documentations juridique, comptable et fiscale",
        "Organigramme, annuaire(s) interne(s) et externe(s)",
        "Agendas personnel(s) et de groupe(s)",
        "Tableau de bord social, bilan social"
      ],
      equipements: [
        "Équipement informatique multimédia connecté aux réseaux",
        "Imprimante multifonctions, scanner",
        "Matériel de téléphonie et équipements associés",
        "Suite bureautique (traitement de texte, tableur grapheur, base de données, dessin, PréAO)",
        "Logiciel de Publication assistée par ordinateur (PAO)",
        "Logiciels ou applications professionnels",
        "Progiciel de gestion intégré (PGI)",
        "Logiciels de documentation, de Gestion électronique des documents (GED)",
        "Outils ou services de communication numérique et collaboratifs",
        "Gestionnaires d'agenda, de planning, des temps de travail"
      ]
    },
    liaisons: {
      internes: "Relation permanente avec le responsable ou le dirigeant, le chef de service, les instances représentatives du personnel, le responsable administratif et les collaborateurs des autres services.",
      externes: [
        "Les organismes sociaux et de prévoyance",
        "Les administrations",
        "Les acteurs du marché de l'emploi et de la formation"
      ]
    },
    resultats: [
      "Les informations destinées au personnel sont fiables, transmises dans les délais, dans le respect des procédures et des règles de confidentialité.",
      "Les dossiers des personnels sont mis à jour et les formalités administratives réalisées conformément à la législation sociale et à la réglementation en vigueur.",
      "Les temps de présence et d'absence sont décomptés, les déplacements organisés et contrôlés, les plannings de présence tenus à jour.",
      "Les actions de formation sont planifiées et suivies.",
      "La paie et les déclarations sociales sont réalisées et comptabilisées dans les délais de rigueur.",
      "Les bulletins de paie sont transmis aux salariés, archivés et sécurisés.",
      "Les tableaux de bord sociaux sont actualisés et mis en forme en vue d'être présentés."
    ]
  }
];

/* ---------------------------------------------------------------------
   3. SAVOIRS ASSOCIÉS (3 familles par pôle) + indications complémentaires
--------------------------------------------------------------------- */
REF.savoirs = {
  p1: [
    {
      famille: "Savoirs de gestion",
      themes: [
        "La relation « client » dans les organisations",
        "Les actions de promotion et de prospection",
        "La chaîne des documents liés aux ventes",
        "Les ventes et les encaissements",
        "Le suivi de la relation « client »",
        "Les tableaux de bord « commerciaux »"
      ],
      indications: "La relation « client » prend en compte les finalités, la culture et les valeurs de l'organisation, la démarche qualité et l'évaluation de la satisfaction. Les actions de promotion et de prospection conduisent à l'exploitation de bases de données « clients » et à l'envoi en nombre (publipostage, courriel). La chaîne des documents liés aux ventes s'étend du devis à la facture d'avoir ; la facturation fait apparaître les réductions commerciales et financières, les frais accessoires (emballages exclus) et les taxes obligatoires (seule l'option de la TVA sur les débits est retenue pour les prestataires de service). Pour les associations et mutuelles, on distingue les adhésions de la vente de biens ou services. Le suivi des ventes et des encaissements nécessite de maîtriser la notion d'engagement comptable et la logique de la partie double. Le suivi de la relation « client » comprend la planification des rendez-vous, commandes et livraisons, les relations avec les partenaires (sous-traitants, transporteurs, logistique), les moyens et conditions de paiement (hors effets de commerce), le lettrage des comptes de tiers, le suivi des réclamations, litiges et impayés. Les tableaux de bord reposent sur la notion d'indicateurs d'activité (en volume et en valeur) et leur représentation graphique."
    },
    {
      famille: "Savoirs juridiques et économiques",
      sousTitre: "En lien avec le programme d'économie-droit du baccalauréat professionnel",
      themes: [
        "Les mentions obligatoires des documents liés aux ventes ou aux contributions volontaires",
        "La contractualisation de la relation « client »",
        "Le cadre juridique lié aux réseaux sociaux numériques et au site Web"
      ],
      indications: "La contractualisation de la relation « client » couvre les notions de contrat de vente, de prestation de service, de sous-traitance et d'adhésion à une organisation associative ou mutualiste, ainsi que la responsabilité et les obligations contractuelles qui en découlent. Le cadre juridique lié aux réseaux sociaux numériques et au site internet comprend la loi Informatique et Libertés, la protection des données personnelles et le RGPD, le droit d'auteur et le droit à l'image."
    },
    {
      famille: "Savoirs liés à la communication et au numérique",
      themes: [
        "L'écoute active",
        "La communication « client »",
        "La gestion de l'information",
        "Les réseaux sociaux numériques",
        "Le site internet"
      ],
      indications: "L'écoute active s'appuie sur les notions de demande et de besoin, les techniques de questionnement et de reformulation, la communication verbale et non verbale. La communication « client » aborde la prise de notes, la présentation et la rédaction d'une lettre commerciale, les spécificités des messages propres à chaque canal (face à face, téléphone, courriel, SMS, etc.) et de chaque support imprimé (plaquette/flyer, courrier publicitaire, newsletter, affiche, etc.). La gestion de l'information intègre la recherche et la mesure de la qualité de l'information (méthodes, enjeux, critères de fiabilité, pertinence), la mise à disposition et la sécurisation (GED et EDI, contrôles d'accès, charte de bonne conduite) et les modes de classement et d'archivage (codification, arborescence, protocole de nommage). Les réseaux sociaux numériques sont abordés au travers des outils de discussion (forums, messagerie instantanée), de publication (blog, wiki), des réseaux professionnels et du partage de vidéos et photos. Pour le site internet : notions de base (protocole http, url, lien hypertexte, nom de domaine), structuration et mentions obligatoires, référencement et génération de contenu."
    }
  ],
  p2: [
    {
      famille: "Savoirs de gestion",
      themes: [
        "L'approvisionnement et la gestion des stocks",
        "Les fournisseurs et les règlements",
        "La chaîne des documents liés aux achats",
        "Les achats",
        "Les décaissements",
        "Les outils de planification des tâches",
        "La taxe sur la valeur ajoutée",
        "La trésorerie",
        "Les notions d'amortissement et de provision",
        "Le bilan et le compte de résultat",
        "Le maintien fonctionnel des espaces de travail hors production"
      ],
      indications: "L'approvisionnement concerne les achats de biens et services nécessaires à l'activité productive. La gestion des stocks (matières premières, marchandises, produits finis) aborde les notions de coûts (achat, production, revient), d'inventaire (physique et en valeur) et d'indicateurs de suivi (fiche de stock, stock minimum). La chaîne des documents liés aux achats s'étend de la demande de devis à la facture d'avoir. Les fournisseurs et règlements comprennent la recherche de fournisseurs, les modes de règlement (hors effets de commerce), les échéanciers, le lettrage et la justification des soldes. Le suivi des achats et des décaissements nécessite la notion d'engagement comptable, la logique de la partie double et les fondements de la classification du plan comptable. La trésorerie intègre encaissements (y compris subventions) et décaissements, contrôle de caisse, situations périodiques et rapprochements bancaires. L'analyse de l'équilibre financier requiert d'avoir saisi les notions d'amortissement, de provision, de charges décaissées et non décaissées ; elle est menée à partir du rapprochement des grandes masses du bilan, du compte de résultat et de la situation de trésorerie. Le maintien fonctionnel des espaces comprend l'ergonomie, la signalétique et la sécurité des locaux."
    },
    {
      famille: "Savoirs juridiques et économiques",
      sousTitre: "En lien avec le programme d'économie-droit du baccalauréat professionnel",
      themes: [
        "Le cadre économique et réglementaire de l'activité productive de l'organisation"
      ],
      indications: "Le cadre réglementaire comprend le droit des contrats (parties, objet, droits et obligations, information du vendeur, responsabilité contractuelle) et la protection des données personnelles (e-commerce, traitement et utilisation des données collectées). Le cadre économique comprend les choix de l'entreprise en matière de production, les performances et objectifs (économiques, sociaux et environnementaux), l'influence du numérique sur la production, les choix de consommation (développement durable et e-commerce) et leur influence sur la production."
    },
    {
      famille: "Savoirs liés à la communication et au numérique",
      themes: [
        "La communication avec les fournisseurs et les autres partenaires",
        "La gestion de l'information",
        "Les outils au service du travail collaboratif"
      ],
      indications: "Aux codes, normes, usages et lexiques professionnels de la communication orale et écrite s'ajoutent ceux liés aux spécificités des secteurs d'activité ; les techniques de prise de notes en font partie. La gestion de l'information comprend la recherche et la mesure de la qualité de l'information, la mise à disposition et la sécurisation (GED et EDI, contrôles d'accès, charte de bonne conduite, Nétiquette et RGPD, certificat et signature électronique), les modes de classement, d'archivage et de sauvegarde (compression, indexation, codification, arborescence, nommage). Les outils au service du travail collaboratif mobilisés sont l'espace de partage, l'agenda partagé, la messagerie, la réunion en ligne, la visio-conférence, l'espace de travail collaboratif."
    }
  ],
  p3: [
    {
      famille: "Savoirs de gestion",
      themes: [
        "Le fonctionnement de l'organisation",
        "La gestion des agendas",
        "Les budgets",
        "Le bulletin de paie",
        "La gestion administrative de la formation",
        "Les tableaux de bord sociaux"
      ],
      indications: "Le fonctionnement de l'organisation intègre ses finalités, sa culture et ses valeurs, les chartes et la structuration (organigramme et modes de coordination). La gestion des budgets suppose la compréhension de leurs modalités de construction et l'analyse des écarts entre prévisionnel et réalisé ; dans ce bloc, elle concerne en particulier la formation, les déplacements, les actions sociales et culturelles. Le bulletin de paie est appréhendé dans ses grandes composantes. La gestion administrative de la formation inclut l'organisation logistique et le suivi de tout type de formation (présentiel et/ou à distance). Les tableaux de bord sociaux intègrent la notion d'indicateurs et leur représentation graphique."
    },
    {
      famille: "Savoirs juridiques et économiques",
      sousTitre: "En lien avec le programme d'économie-droit du baccalauréat professionnel",
      themes: [
        "Règles élémentaires de sécurité informatique, de sauvegarde et de protection des données numériques (RGPD) des personnels",
        "La législation sociale",
        "Les accords collectifs et conventions collectives de travail"
      ],
      indications: "L'utilisation professionnelle du numérique nécessite la connaissance des droits et obligations des salariés (sécurité, confidentialité des données, droit des personnes, responsabilité des acteurs traitant les données). La législation sociale couvre le recrutement (ajustement ressources/besoins, modes de recrutement y compris e-recrutement, principe de non-discrimination), le suivi de carrière (statuts, contrats de travail, rémunération, durée et temps de travail, rupture du contrat, égalité professionnelle), la formation professionnelle (objectifs et modalités, formation continue) et la réglementation relative à la santé, la sécurité et les conditions de travail. La relation collective au travail comprend la négociation collective et la représentation des salariés (élections professionnelles, institutions représentatives du personnel)."
    },
    {
      famille: "Savoirs liés à la communication et au numérique",
      themes: [
        "Les normes et usages internes de présentation des documents de communication (personnels et instances représentatives)",
        "Les règles légales de communication envers les personnels et les instances représentatives",
        "Les outils ou services de communication numérique",
        "Le système d'information ressources humaines (SIRH)"
      ],
      indications: "Ces savoirs intègrent, dans le respect des chartes, des normes de qualité et des lois, la réalisation d'annonces de recrutement, d'intégration et de départ, l'actualisation de fiches de postes, la rédaction de convocations à des entretiens, l'information sociale légale, la rédaction de notes d'information et de service. Ils nécessitent l'utilisation d'outils numériques pour communiquer (outils de discussion, réseaux sociaux internes, partage de vidéos et photos) et la maîtrise de fonctions simples de mise en pages et de mise en forme. Le SIRH aborde les moyens numériques de collecter, stocker, traiter, organiser et diffuser les données ressources humaines dans des environnements numériques sécurisés."
    }
  ]
};

/* ---------------------------------------------------------------------
   4. RÉFÉRENTIEL DES ACTIVITÉS PROFESSIONNELLES — MÉTIER & CONTEXTE
--------------------------------------------------------------------- */
REF.metier = {
  missionGlobale: "Les métiers de l'assistance à la gestion consistent à apporter un appui à un dirigeant de petite structure, à un ou plusieurs cadres ou à une équipe dans une plus grande structure, en assurant des missions d'interface, de coordination et d'organisation dans le domaine administratif. Ils s'exercent dans tous les secteurs d'activité et au sein de tout type d'organisations, dans un contexte de mutations profondes des activités de services (restructurations, nouvelles formes d'organisation du travail, dématérialisation, transformation numérique, automatisation des processus).",
  dimensions: [
    { titre: "Dimension transversale", texte: "La composante administrative existe naturellement dans chaque fonction, processus ou projet, dans tout type d'organisation et tous les secteurs (y compris industriels), et l'on assiste à une forte mutualisation des fonctions administratives." },
    { titre: "Dimension spécifique", texte: "La gestion administrative intègre les particularités économiques, juridiques et réglementaires des contextes d'exercice et des secteurs : médico-social, santé, bâtiment, immobilier, associations, économie sociale et solidaire, mutuelles, services publics, agriculture, etc." }
  ],
  professionnalite: [
    "Une certaine polyvalence : les interventions sur les processus de gestion (commerciaux, productifs, du personnel, numériques) mobilisent un large spectre de connaissances techniques, juridiques et économiques à articuler et combiner.",
    "Une réelle professionnalité relationnelle pour assurer le rôle d'interface et de coordination entre acteurs internes et externes.",
    "Une forme de spécialisation portant moins sur une expertise technique que sur l'appropriation des contextes d'exercice et des secteurs — pouvant prendre la forme, en formation, d'une coloration sectorielle ou fonctionnelle."
  ],
  emplois: [
    "Assistant de gestion", "Gestionnaire administratif", "Agent de gestion administrative",
    "Employé administratif", "Agent administratif", "Secrétaire administratif",
    "Technicien des services administratifs", "Adjoint administratif"
  ],
  emploisSpecifiques: [
    "Secrétaire-assistant juridique", "Secrétaire-assistant médical", "Assistant de gestion locative en immobilier",
    "Agent administratif logistique transport", "Employé de gestion de copropriété", "Assistant digital",
    "Assistant ressources humaines", "Secrétaire de mairie", "Assistant comptable"
  ],
  rome: ["D1401 — Assistanat commercial", "M1501 — Assistanat en ressources humaines", "M1607 — Secrétariat", "M1203 — Comptabilité"],
  organisations: "Entreprises, collectivités territoriales, administrations publiques, associations, fondations, hôpitaux, entreprises artisanales, mutuelles, etc. — de petite, moyenne ou grande taille. Soit une forte polyvalence (petites structures : rôle central auprès du responsable), soit une spécialisation (grandes structures : service administratif spécifique — clients, fournisseurs, logistique, RH, communication, informatique).",
  placeOrganisation: "Dans les petites structures, le titulaire exerce directement sous l'autorité du responsable (chef d'entreprise, gérant, artisan, profession libérale, président d'association, maire…) et joue un rôle d'interface interne et externe. Dans les structures plus importantes, il est placé sous l'autorité d'un cadre intermédiaire ou d'un responsable fonctionnel et son rôle de support est privilégié. Dans tous les cas, il est placé au cœur d'un réseau relationnel large.",
  conditions: [
    { titre: "Espace de travail", texte: "Poste de travail avec équipement de bureau complet (mobilier, téléphone, équipement informatique, dispositif de transmission et de reproduction de l'information). La mission peut s'exercer en espaces ouverts (open space) ou individualisés, et une partie des activités peut être exercée en distanciel (télétravail)." },
    { titre: "Autonomie et responsabilité", texte: "L'autonomie est attachée à la nature du poste : travail dans le cadre de consignes, de procédures prédéfinies et de marges d'autonomie fixées par les supérieurs. Il rend compte régulièrement, dispose d'une marge d'initiative et d'anticipation, formule des propositions d'amélioration (organisation, traitement de l'information), fait preuve d'analyse critique et alerte sur les anomalies. Son pouvoir décisionnel est limité aux aspects opérationnels délégués. Les activités s'exercent dans le respect de la confidentialité et du RGPD." },
    { titre: "Maîtrise des technologies", texte: "Échanges permanents avec supérieurs, collègues et partenaires : mobilisation des outils de communication à distance, des technologies de production et de gestion des documents, de recherche et de mise à jour d'informations. Les activités sont inscrites au cœur du système d'information (PGI, espaces collaboratifs, interface d'administration de sites). Il peut conseiller les membres du service sur l'usage des outils numériques." },
    { titre: "Compétences langagières et rédactionnelles", texte: "Vecteur de l'image de l'organisation, le titulaire doit communiquer dans un contexte social et professionnel : s'exprimer à l'écrit et à l'oral avec clarté et rigueur, développer un discours construit, raisonné et argumenté. La maîtrise de l'orthographe, de la grammaire et de la syntaxe est impérative, avec adoption des codes et lexiques adaptés en langue française et éventuellement étrangère." },
    { titre: "Compétences comportementales", texte: "Du fait de sa multivalence, il hiérarchise les dossiers et fixe des priorités, gère le stress lié aux aléas, s'organise et s'adapte aux changements en conservant la maîtrise de soi, fait preuve d'écoute active. En relation avec les partenaires, il peut avoir un rôle de représentation (amabilité, conscience professionnelle, diplomatie, discrétion, présentation adaptée) et utilise les codes sociaux du contexte professionnel." }
  ],
  evolutions: "Dans les petites structures, le titulaire peut devenir un adjoint du responsable, prenant en charge des activités déléguées de plus en plus larges ; son rôle d'interface relationnelle est un gage de progression. Dans les structures plus importantes, il peut évoluer vers des postes exigeant plus de spécialisation et de technicité, la formation continue contribuant à en faire un expert de son domaine."
};

/* ---------------------------------------------------------------------
   5. UNITÉS & ÉPREUVES (référentiel d'évaluation)
--------------------------------------------------------------------- */
REF.epreuves = {
  professionnelles: [
    {
      code: "E2", unite: "U2", coef: 4, pole: "p2",
      intitule: "Étude de situations professionnelles liées à l'organisation et au suivi de l'activité de production",
      bloc: "Bloc de compétences 2",
      forme: "Ponctuel écrit 3 h 30 — ou CCF",
      finalites: "Évaluer l'aptitude du candidat à analyser une ou plusieurs situations professionnelles d'organisation ou de suivi de l'activité de production (entreprise, mutuelle, association ou organisation publique) et à proposer des solutions pour répondre à une ou plusieurs problématiques en lien avec les situations présentées. L'épreuve porte sur les compétences et savoirs associés du bloc 2.",
      criteres: "L'évaluation (ponctuelle ou CCF) se fonde sur les indicateurs d'évaluation du référentiel de compétences, bloc 2.",
      modalites: [
        { sous: "Contrôle en cours de formation (CCF)", texte: "Deux situations d'évaluation d'égale importance, chacune sous forme d'étude de cas portant sur une ou plusieurs situations professionnelles liées à l'organisation et au suivi de l'activité de production, donnant lieu à une production écrite. Les deux situations doivent permettre d'évaluer des compétences de chacun des trois sous-blocs : suivi administratif, suivi financier, gestion opérationnelle des espaces de travail." },
        { sous: "Évaluation finale ponctuelle (écrit 3 h 30)", texte: "Étude de cas conçue à partir d'un contexte professionnel mettant en œuvre une ou plusieurs situations caractéristiques liées à l'assistance à la gestion de l'activité de production. Elle s'appuie sur des documents destinés à situer le contexte et nécessaires à la résolution d'une problématique et/ou au traitement des questions." }
      ]
    },
    {
      code: "E31", unite: "U31", coef: 4, pole: "p1",
      intitule: "Gestion des relations avec les clients, les usagers et les adhérents",
      bloc: "Bloc de compétences 1",
      forme: "CCF — ou ponctuel oral et pratique 45 min",
      finalites: "Évaluer les acquis d'apprentissage liés au bloc de compétences 1. L'épreuve porte sur les compétences et savoirs associés de ce bloc, mobilisés dans le cadre de mises en pratique professionnelle.",
      criteres: "L'évaluation (ponctuelle ou CCF) se fonde sur les indicateurs d'évaluation du référentiel de compétences, bloc 1.",
      modalites: [
        { sous: "Contrôle en cours de formation (CCF)", texte: "Une situation d'évaluation conduite à partir du dossier professionnel du candidat. Ce dossier comprend obligatoirement un état récapitulatif des travaux professionnels significatifs des compétences du pôle 1 (préparation et prise en charge de la relation ; traitement des opérations administratives et de gestion ; actualisation du système d'information) et les comptes rendus d'évaluation des PFMP complétés par les tuteurs. Commission de deux professeurs ou formateurs en charge des enseignements professionnels AGOrA." },
        { sous: "Évaluation finale ponctuelle (oral et pratique 45 min)", texte: "Appui sur un dossier (état récapitulatif + documents produits + justificatifs d'expérience et d'heures de formation). Le candidat dispose d'environ 15 minutes pour prendre en main l'environnement numérique. L'épreuve se déroule en deux temps : (1) présentation par le candidat des compétences acquises lors d'un ou plusieurs travaux professionnels (20 min max) ; (2) réalisation, dans l'environnement numérique, de tâches correspondant à une ou plusieurs activités emblématiques du pôle 1 (25 min max), les interrogateurs restant en position d'observateurs. Le dossier professionnel ne fait l'objet d'aucune notation spécifique ; en cas de non-production du dossier, la note zéro est attribuée." }
      ]
    },
    {
      code: "E32", unite: "U32", coef: 3, pole: "p3",
      intitule: "Administration du personnel",
      bloc: "Bloc de compétences 3",
      forme: "CCF — ou ponctuel oral 30 min",
      finalites: "Évaluer les acquis d'apprentissage liés au bloc de compétences 3. L'épreuve porte sur les compétences et savoirs associés de ce bloc.",
      criteres: "L'évaluation (ponctuelle ou CCF) se fonde sur les indicateurs d'évaluation du référentiel de compétences, bloc 3.",
      modalites: [
        { sous: "Contrôle en cours de formation (CCF)", texte: "Une situation d'évaluation conduite à partir du dossier professionnel du candidat (état récapitulatif des travaux significatifs du pôle 3 : suivi de la carrière ; suivi organisationnel et financier ; participation à l'activité sociale + comptes rendus d'évaluation des PFMP). Commission composée d'un professeur ou formateur en charge des enseignements professionnels AGOrA et d'un professionnel en lien avec l'administration du personnel (ou, à défaut, d'un autre professeur ou formateur)." },
        { sous: "Évaluation finale ponctuelle (oral 30 min)", texte: "Appui sur un dossier (état récapitulatif + documents + justificatifs). Deux temps : (1) le candidat expose, sans interruption, les compétences acquises liées à un travail professionnel choisi par la commission (5 min max) ; (2) entretien (25 min max) évaluant le degré d'acquisition des compétences du bloc 3 en se fondant prioritairement sur les travaux décrits. Les trois dimensions du pôle 3 doivent être abordées. Le dossier ne fait l'objet d'aucune notation spécifique." }
      ]
    },
    {
      code: "E33", unite: "U33", coef: 1, pole: null,
      intitule: "Prévention-santé-environnement (PSE)",
      bloc: "Bloc Prévention-santé-environnement",
      forme: "Ponctuel écrit 2 h — ou CCF",
      finalites: "Sous-épreuve de l'épreuve E3 « Pratiques professionnelles d'assistance à la gestion des organisations », évaluée selon la réglementation PSE en vigueur.",
      criteres: "Selon le programme et les modalités d'évaluation de la PSE au baccalauréat professionnel.",
      modalites: [
        { sous: "Référence", texte: "Définition fixée par la réglementation PSE en vigueur du baccalauréat professionnel." }
      ]
    }
  ],
  remarqueE3: "L'épreuve E3 « Pratiques professionnelles d'assistance à la gestion des organisations » (coef. 8) regroupe trois sous-épreuves : E31 (U31, coef. 4), E32 (U32, coef. 3) et E33 — PSE (U33, coef. 1).",
  generales: [
    { code: "E11", unite: "U11", intitule: "Économie-droit", coef: 1, forme: "Ponctuel écrit 2 h 30 / CCF" },
    { code: "E12", unite: "U12", intitule: "Mathématiques", coef: 1, forme: "CCF / Ponctuel écrit 1 h" },
    { code: "E41", unite: "U41", intitule: "Langue vivante A", coef: 2, forme: "CCF / Ponctuel oral 20 min" },
    { code: "E42", unite: "U42", intitule: "Langue vivante B", coef: 2, forme: "CCF / Ponctuel oral 20 min" },
    { code: "E51", unite: "U51", intitule: "Français", coef: 2.5, forme: "Ponctuel écrit 2 h 30 / CCF" },
    { code: "E52", unite: "U52", intitule: "Histoire-géographie et enseignement moral et civique", coef: 2.5, forme: "Ponctuel écrit 2 h / CCF" },
    { code: "E6", unite: "U6", intitule: "Arts appliqués et cultures artistiques", coef: 1, forme: "CCF / Ponctuel écrit 1 h 30" },
    { code: "E7", unite: "U7", intitule: "Éducation physique et sportive", coef: 1, forme: "CCF / Ponctuel pratique" }
  ],
  facultatives: "Le candidat peut choisir jusqu'à deux unités facultatives parmi : langues vivantes, mobilité (unité facultative de mobilité — attestation MobilitéPro), éducation physique et sportive. Seuls les points excédant 10 sont pris en compte. La langue vivante facultative est obligatoirement différente de celle choisie au titre de l'épreuve obligatoire.",
  noteReforme: "Les intitulés, coefficients, modalités et durées des épreuves d'enseignement général sont susceptibles d'évolution à la suite des nouveaux programmes (arrêtés du 3 avril 2019) et des textes de la réforme. Le règlement d'examen a été modifié par l'arrêté du 16 décembre 2024, applicable à compter de la session 2026.",
  unitesTableau: [
    { u: "U11", lib: "Économie-droit" },
    { u: "U12", lib: "Mathématiques" },
    { u: "U2", lib: "Étude de situations professionnelles liées à l'organisation et au suivi de l'activité de production" },
    { u: "U31", lib: "Gestion des relations avec les clients, les usagers et les adhérents" },
    { u: "U32", lib: "Administration du personnel" },
    { u: "U33", lib: "Prévention-santé-environnement (PSE)" },
    { u: "U41", lib: "Langue vivante A" },
    { u: "U42", lib: "Langue vivante B" },
    { u: "U51", lib: "Français" },
    { u: "U52", lib: "Histoire-géographie et enseignement moral et civique" },
    { u: "U6", lib: "Arts appliqués et cultures artistiques" },
    { u: "U7", lib: "Éducation physique et sportive" },
    { u: "UF1 / UF2", lib: "Unités facultatives" }
  ]
};

/* ---------------------------------------------------------------------
   6. PFMP — PÉRIODES DE FORMATION EN MILIEU PROFESSIONNEL
--------------------------------------------------------------------- */
REF.pfmp = {
  dureeArrete: "22 semaines réparties en plusieurs périodes sur les trois années du cycle (voie scolaire), conformément à l'arrêté du 18 février 2020 et à l'arrêté du 21 novembre 2018.",
  noteReforme: "Dans le cadre de la réforme de la voie professionnelle, l'organisation des PFMP et de la classe de terminale a évolué (parcours différencié de fin de terminale, allocation de PFMP). La planification précise relève de l'équipe pédagogique sous la responsabilité du chef d'établissement ; il convient de se référer aux textes en vigueur de l'année scolaire concernée.",
  objectifs: [
    "Rencontrer des situations professionnelles réelles, nécessitant une adaptation à l'imprévu.",
    "Découvrir la diversité des pratiques professionnelles d'assistance à la gestion dans les trois pôles d'activité.",
    "S'immerger dans des contextes professionnels variés, plus ou moins complexes et contraints, porteurs de socialisation par le travail.",
    "Prendre conscience des exigences rédactionnelles et relationnelles imposées par le monde professionnel."
  ],
  engagement: [
    "Les organisations d'accueil proposent des situations professionnelles permettant d'acquérir des compétences correspondant au référentiel et au niveau d'exigence du diplôme.",
    "L'élève / stagiaire / apprenti définit et s'approprie, avec l'organisation et l'équipe pédagogique, les objectifs et contenus de ses missions et consolide ses acquis au service de son projet professionnel.",
    "L'équipe pédagogique encadre, conseille, met en cohérence les modalités d'appropriation des compétences et veille au réinvestissement des expériences en formation."
  ],
  organisation: [
    "Convention obligatoire entre l'établissement de formation et l'organisation d'accueil (modèle-type en annexe de la circulaire), avec annexe pédagogique fixant les exigences a minima.",
    "Choix des lieux d'accueil et suivi de l'élève sous la responsabilité de l'équipe pédagogique.",
    "Document de liaison élaboré en établissement, suivant l'élève sur toute la formation : il liste les activités réalisées conformément au RAP et sert de support au tuteur pour apprécier le niveau d'acquisition des compétences.",
    "À l'issue de chaque PFMP, l'attestation de PFMP est renseignée et signée par le tuteur (période, structure, activités, nombre de semaines).",
    "La diversification des lieux relève du choix du candidat selon son projet ; elle n'est pas exigée — c'est la richesse des situations rencontrées qui compte.",
    "Les PFMP à l'étranger sont possibles et encouragées (possibilité de valider l'unité facultative de mobilité)."
  ],
  positionnement: [
    "Candidats positionnés (décision du recteur) : durée minimale de 10 semaines (voie scolaire) ou 8 semaines (formation professionnelle continue).",
    "Cycle en deux ans (élèves venant d'un CAP d'un autre secteur, d'une 2de générale ou technologique, etc.) : durée des PFMP ramenée à 16 semaines."
  ],
  lienEpreuves: "Les comptes rendus d'évaluation de PFMP, complétés par les tuteurs, alimentent obligatoirement le dossier professionnel servant de support aux sous-épreuves E31 (pôle 1) et E32 (pôle 3) en CCF. Les attestations de PFMP conditionnent la recevabilité du candidat."
};

/* ---------------------------------------------------------------------
   7. ORGANISATION DE LA FORMATION & RÉFORME DE LA VOIE PROFESSIONNELLE
--------------------------------------------------------------------- */
REF.formation = {
  acces: "Le bac pro AGOrA se prépare en 3 ans après la classe de 3e. Les élèves entrent en classe de 2de professionnelle « Métiers de la gestion administrative, du transport et de la logistique » (famille de métiers) avant de choisir la spécialité. Les apprentis entrent directement dans la spécialité. Les titulaires de certains CAP du même secteur peuvent préparer le diplôme en 2 ans.",
  famille: "Seconde professionnelle « Métiers de la gestion administrative, du transport et de la logistique » (2de famille de métiers commune).",
  enseignements: {
    generaux: ["Français", "Histoire-géographie et EMC", "Mathématiques", "Langue vivante A", "Au choix : économie-droit ou langue vivante B", "Arts appliqués et cultures artistiques", "EPS"],
    professionnels: [
      "Gestion des relations avec les clients, les usagers et les adhérents (pôle 1)",
      "Organisation et suivi de l'activité de production (pôle 2)",
      "Administration du personnel (pôle 3)"
    ],
    coIntervention: "Co-intervention français et mathématiques-sciences avec les enseignements professionnels (en 2de et 1re).",
    chefDoeuvre: "Réalisation du chef-d'œuvre (1re et terminale), dimension pluridisciplinaire au croisement des enseignements professionnels et généraux.",
    parcours: "Heures dédiées à l'accompagnement, aux projets et aux choix de parcours et d'orientation (consolidation, accompagnement personnalisé)."
  },
  terminaleReforme: "En terminale professionnelle, à la suite de la réforme (arrêté du 22 janvier 2024), un parcours différencié de six semaines est proposé en fin d'année (de mi-mai à début juillet), hors évaluations certificatives : un parcours de préparation à l'insertion professionnelle ou un parcours de préparation à la poursuite d'études supérieures. Sur la période de septembre à mai, l'organisation des semaines de cours et des PFMP a été ajustée. Les PFMP réalisées ouvrent droit à une allocation (décret n° 2023-765 du 11 août 2023).",
  poursuites: "Objectif premier : l'insertion professionnelle. Avec un bon dossier ou une mention, une poursuite d'études est envisageable, notamment en BTS : Comptabilité et gestion (CG), Gestion de la PME (GPME), Support à l'action managériale (SAM), Métiers de l'audiovisuel option gestion de production, FCIL secrétariat médical, etc."
};

/* ---------------------------------------------------------------------
   8. TEXTES DE RÉFÉRENCE & MISES À JOUR
--------------------------------------------------------------------- */
REF.textes = [
  { date: "18 février 2020", titre: "Arrêté portant création de la spécialité AGOrA de baccalauréat professionnel et fixant ses modalités de délivrance", nor: "MENE2005098A", role: "Texte fondateur : référentiels d'activités professionnelles (annexe I a), de compétences (annexe I b) et d'évaluation (annexe II), PFMP (annexe III). Toujours en vigueur (version consolidée).", maj: true },
  { date: "21 novembre 2018", titre: "Arrêté relatif à l'organisation et aux enseignements dispensés dans les formations sous statut scolaire préparant au baccalauréat professionnel", nor: "", role: "Volumes horaires de formation et organisation. Économie-droit et langue vivante B retenues ; secteur « services ». Durée de PFMP de référence : 22 semaines." },
  { date: "3 avril 2019", titre: "Arrêtés fixant les nouveaux programmes d'enseignement général du baccalauréat professionnel", nor: "", role: "Nouveaux programmes (économie-droit, mathématiques, français, histoire-géographie-EMC, langues vivantes, arts appliqués, EPS, PSE). Impactent intitulés, coefficients et modalités des épreuves générales." },
  { date: "22 janvier 2024", titre: "Arrêté réorganisant les enseignements sous statut scolaire (réforme de la voie professionnelle)", nor: "", role: "Réorganisation de la terminale professionnelle : parcours différencié de fin d'année (insertion / poursuite d'études), ajustement des semaines de cours et de PFMP.", maj: true },
  { date: "16 décembre 2024", titre: "Arrêté modificatif (art. 14) — règlement d'examen du bac pro AGOrA", nor: "MENE2434254A", role: "Modification de l'annexe II b (règlement d'examen). Entrée en vigueur à compter de la session d'examen 2026.", maj: true },
  { date: "2025", titre: "Fiche RNCP40705 — Assistance à la gestion des organisations et de leurs activités", nor: "", role: "Réenregistrement au Répertoire national des certifications professionnelles. Remplace la fiche RNCP34606. Enregistrement valable jusqu'au 31/08/2028. Structure des blocs professionnels inchangée (BC01 relations clients, BC02 production, BC03 personnel).", maj: true }
];

/* Tableau de correspondance ancien / nouveau diplôme */
REF.correspondance = {
  ancien: "Bac pro Gestion-Administration (RNCP14695) — dernière session 2022",
  nouveau: "Bac pro AGOrA (RNCP34606 puis RNCP40705) — première session 2023",
  lignes: [
    { ga: "E2 — Gestion administrative des relations avec le personnel (U2)", agora: "Sous-épreuve E32 — Administration du personnel (U32)" },
    { ga: "E31 — Gestion administrative des relations externes (U31)", agora: "E31 — Gestion des relations avec les clients, usagers et adhérents (U31)" },
    { ga: "E32 — Gestion administrative interne (U32)", agora: "E2 — Étude de situations professionnelles liées à l'organisation et au suivi de l'activité de production (U2)" },
    { ga: "E33 — Gestion administrative des projets (U33)", agora: "—" },
    { ga: "E34 — Prévention-santé-environnement (U34)", agora: "E33 — Prévention-santé-environnement (U33)" }
  ]
};

/* ---------------------------------------------------------------------
   9. APPUI PÉDAGOGIQUE — repères de progressivité (proposition non
   réglementaire) et trame d'ingénierie. Le référentiel n'affecte pas
   les compétences à un niveau de classe ; ces repères sont une
   proposition d'organisation laissée à l'autonomie de l'équipe.
--------------------------------------------------------------------- */
REF.pedagogie = {
  avertissement: "Le référentiel est organisé par compétences, non par niveau de classe : il n'assigne pas les activités à la seconde, la première ou la terminale. Les repères ci-dessous constituent une proposition d'organisation pédagogique (logique spiralaire), laissée à l'autonomie de l'équipe, et non une prescription réglementaire.",
  progression: [
    {
      annee: "Seconde professionnelle (famille de métiers)",
      visee: "Découverte des organisations et des fondamentaux administratifs ; postures professionnelles ; premiers gestes sur les outils.",
      dominantes: ["p1"],
      reperes: [
        "Découverte des trois pôles à travers des situations simples et concrètes.",
        "Accueil, prise en charge d'une demande, communication écrite et orale de base (pôle 1, activité 1.1).",
        "Initiation à la suite bureautique, à la recherche et à la qualité de l'information, au RGPD.",
        "Première approche de la chaîne des documents (devis, commande, facture).",
        "Construction des attitudes professionnelles (confidentialité, rigueur, autonomie naissante)."
      ]
    },
    {
      annee: "Première professionnelle",
      visee: "Structuration des compétences sur les trois pôles ; entrée dans la gestion à l'aide d'un PGI ; premières PFMP qualifiantes.",
      dominantes: ["p1", "p2", "p3"],
      reperes: [
        "Traitement des opérations administratives et de gestion (pôle 1, activité 1.2) : facturation, encaissements, relances.",
        "Suivi administratif et financier de la production (pôle 2, activités 2.1 et 2.2) : approvisionnements, stocks, factures d'achats, trésorerie.",
        "Suivi de la carrière et organisation de l'activité du personnel (pôle 3, activités 3.1 et 3.2).",
        "Usage du PGI sur des processus complets ; tableaux de bord et indicateurs.",
        "Co-intervention et chef-d'œuvre ; constitution progressive du dossier professionnel."
      ]
    },
    {
      annee: "Terminale professionnelle",
      visee: "Consolidation, complexification et autonomie ; finalisation des dossiers professionnels ; préparation aux épreuves et au parcours différencié.",
      dominantes: ["p1", "p2", "p3"],
      reperes: [
        "Actualisation du système d'information et visibilité numérique (pôle 1, activité 1.3).",
        "Préparation de la déclaration de TVA, états de trésorerie, appréciation de la situation économique (pôle 2, activité 2.2).",
        "Préparation de la paie, déclarations sociales, participation à l'activité sociale (pôle 3, activités 3.2 et 3.3).",
        "Gestion opérationnelle des espaces de travail (pôle 2, activité 2.3).",
        "Finalisation des états récapitulatifs et entraînement aux épreuves E2 (écrit), E31 (oral et pratique), E32 (oral).",
        "Parcours différencié de fin d'année : insertion professionnelle ou poursuite d'études."
      ]
    }
  ],
  ingenierie: {
    chaine: [
      { etape: "Pôle d'activités", desc: "Le grand domaine professionnel (1, 2 ou 3) qui donne le sens et le contexte global." },
      { etape: "Activité professionnelle", desc: "La situation-support (ex. 1.2 Traitement des opérations administratives et de gestion) autour de laquelle se construit la séquence." },
      { etape: "Compétence(s) visée(s)", desc: "Le verbe d'action évaluable (ex. « Assurer le suivi des relances clients ») : c'est l'objectif terminal de la séquence." },
      { etape: "Objectif opérationnel de séance", desc: "Décliné de la compétence et des indicateurs : ce que l'élève doit être capable de réaliser, dans des conditions et avec un critère de réussite observable." },
      { etape: "Indicateurs d'évaluation", desc: "Les critères réglementaires de réussite : ils fournissent directement les critères de la grille d'évaluation de la séance." },
      { etape: "Savoirs associés", desc: "Les connaissances à mobiliser (gestion / juridiques-éco / communication-numérique) au service de la compétence." }
    ],
    fiches: {
      sequence: ["Pôle et activité professionnelle support", "Compétence(s) visée(s) du référentiel", "Savoirs associés mobilisés", "Objectif général / situation professionnelle (contexte d'organisation)", "Pré-requis", "Place dans la progression (séances)", "Modalités et critères d'évaluation (indicateurs)", "Lien PFMP et épreuve certificative"],
      seance: ["Compétence et activité de rattachement", "Objectif opérationnel (capacité + condition + critère)", "Situation professionnelle déclenchante", "Savoirs associés convoqués", "Déroulement (phases, durées, supports numériques)", "Production attendue de l'élève", "Critères de réussite issus des indicateurs", "Différenciation et trace écrite"]
    }
  }
};

/* ---------------------------------------------------------------------
   10. INDEX DE RECHERCHE — construit dynamiquement à partir du modèle
--------------------------------------------------------------------- */
REF.buildSearchIndex = function () {
  const idx = [];
  REF.poles.forEach(function (p) {
    idx.push({ type: "Pôle", label: "Pôle " + p.num + " — " + p.titre, route: "#/pole/" + p.id, pole: p.id, text: p.titre + " " + p.presentation });
    p.activites.forEach(function (a) {
      idx.push({ type: "Activité", label: a.code + " — " + a.titre, route: "#/pole/" + p.id, pole: p.id, text: a.titre + " " + a.taches.join(" ") });
      a.competences.forEach(function (c) {
        idx.push({ type: "Compétence", label: c, route: "#/pole/" + p.id, pole: p.id, text: c + " " + a.titre });
      });
      a.indicateurs.forEach(function (i) {
        idx.push({ type: "Indicateur", label: i, route: "#/pole/" + p.id, pole: p.id, text: i });
      });
    });
    (REF.savoirs[p.id] || []).forEach(function (s) {
      s.themes.forEach(function (t) {
        idx.push({ type: "Savoir", label: t + " — " + s.famille, route: "#/savoirs", pole: p.id, text: t + " " + s.famille + " " + s.indications });
      });
    });
  });
  REF.epreuves.professionnelles.forEach(function (e) {
    idx.push({ type: "Épreuve", label: e.code + " — " + e.intitule, route: "#/epreuves", pole: e.pole, text: e.intitule + " " + e.finalites });
  });
  return idx;
};

if (typeof window !== "undefined") { window.REF = REF; }
