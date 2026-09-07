/* ===== Soutien au parcours · 2de GATL · données v3 ===== */
const SLOTS = ["2026-09-09","2026-09-16","2026-09-23","2026-09-30","2026-10-07","2026-10-14",
  "2026-11-04","2026-11-18","2026-11-25","2026-12-02","2026-12-09","2026-12-16"];
const HOLI = [["2026-10-21","Vacances de la Toussaint"],["2026-10-28","Vacances de la Toussaint"],["2026-11-11","Férié — Armistice"]];
const GROUPS = { g1:"2de GATL1", g2:"2de GATL2", both:"Les deux groupes" };
const STATUS = { todo:"À venir", done:"Fait", cont:"À poursuivre", redo:"À revoir" };
const LIEUX = ["Salle habituelle","CDI","Salle informatique","Salle polyvalente","Extérieur","Hors établissement"];

/* Thème → sous-thèmes. Chaque sous-thème : t = titre (affiché dans le calendrier),
   o = objectif proposé, a = activité proposée, acts = fiches de la bibliothèque, res = liens proposés. */
const O = (u,t)=>({t,url:u});
const THEMES = {
 vie:{t:"Vie de classe",c:"#e0a800",subs:[
  {t:"Accueil · rentrée",o:"Prendre ses repères, identifier les adultes ressources, favoriser l'intégration",a:"Tour de rentrée, jeu de connaissance, présentation du lycée",acts:["ambiance","trouve","eclair","lien"]},
  {t:"Ambiance de classe",o:"Exprimer son ressenti, identifier ce qui fonctionne ou pose problème",a:"Météo du groupe, baromètre de classe, échange collectif",acts:["reglette","ambiance"]},
  {t:"Élections des délégués",o:"Comprendre le rôle du délégué, préparer sa candidature, participer à une élection",a:"Fiche rôle du délégué, professions de foi, vote",acts:["delegues"],res:[O("https://www.education.gouv.fr/les-delegues-des-eleves-7573","Le rôle des délégués (education.gouv.fr)")]},
  {t:"Rôle du délégué",o:"Identifier ses missions et ses responsabilités",a:"Étude de situations, quiz, préparation des délégués"},
  {t:"Conseil de classe",o:"Comprendre son fonctionnement, préparer la parole des élèves",a:"Questionnaire de classe, synthèse, préparation des délégués"},
  {t:"Bilan de période",o:"Faire le point, identifier réussites et difficultés",a:"Auto-bilan individuel puis collectif",acts:["cocotte","reussite"]},
  {t:"Objectifs de période",o:"Se fixer des objectifs réalistes",a:"Fiche objectifs, engagement personnel",acts:["pret","marelle"]},
  {t:"Règles de vie",o:"Comprendre et construire les règles collectives",a:"Charte de classe, situations-problèmes",acts:["matrice"]},
  {t:"Cohésion",o:"Développer l'entraide et le sentiment d'appartenance",a:"Défis collectifs, jeux coopératifs",acts:["ordre","spirale","solidarite","lien"]},
  {t:"Problème de classe",o:"Identifier un problème et chercher collectivement des solutions",a:"Débat régulé, recherche de solutions",acts:["cesse","poa"]}]},
 cps:{t:"CPS · connaissance de soi",c:"#2d63d8",subs:[
  {t:"Se connaître",o:"Identifier ses caractéristiques, ses goûts, ses centres d'intérêt",a:"Portrait chinois, blason, questionnaire de Proust",acts:["portrait","blason","proust","bullet","triangles"]},
  {t:"Mes qualités · mes forces",o:"Identifier et valoriser ses points forts",a:"Carte des forces, qualités données par les pairs",acts:["forces","spirale"]},
  {t:"Mes réussites",o:"Prendre conscience de ses réussites et des compétences mobilisées",a:"Carnet des réussites, portrait d'une réussite",acts:["carnet","reussite"]},
  {t:"Mes valeurs",o:"Identifier ce qui est important pour soi",a:"Tri de cartes-valeurs",acts:["valeurs","gratval"]},
  {t:"Mes besoins",o:"Identifier ses besoins pour apprendre et se sentir bien",a:"Roue des besoins",acts:["besoins"]},
  {t:"Confiance en soi",o:"Développer une perception positive de ses capacités",a:"Défis, expression orale, valorisation des réussites",acts:["expression","carnet"]},
  {t:"Émotions",o:"Identifier et exprimer ses émotions",a:"Réglette des émotions, météo émotionnelle",acts:["reglette","poa"]},
  {t:"Stress",o:"Identifier les manifestations du stress, découvrir des stratégies",a:"Baromètre du stress, respiration, relaxation",acts:["barometre","pauses","relax"]},
  {t:"Communication",o:"Communiquer de manière claire et adaptée",a:"Jeux de rôle, message clair",acts:["jdrcom","feedback"]},
  {t:"Écoute · empathie",o:"Développer l'écoute et comprendre le point de vue d'autrui",a:"Écoute active, reformulation",acts:["empathie"]},
  {t:"Affirmation de soi",o:"S'exprimer et savoir dire non de manière adaptée",a:"Jeux de rôle"},
  {t:"Conflits",o:"Chercher une solution constructive à un désaccord",a:"Situations-problèmes, médiation",acts:["jdrconflit","cesse"]},
  {t:"Coopération",o:"Travailler efficacement avec les autres",a:"Défi collectif, jeux coopératifs",acts:["ordre","plateau","solidarite"]},
  {t:"Motivation",o:"Identifier ce qui motive ou freine",a:"Marelle de la motivation, réflexion sur la motivation scolaire",acts:["marelle","motiv"]},
  {t:"Prise de décision",o:"Comparer des possibilités avant de choisir",a:"Dilemmes, matrice de décision"},
  {t:"Se fixer un objectif",o:"Définir un objectif réaliste et les étapes pour l'atteindre",a:"Outil PRÊT, plan d'action",acts:["pret","perspectives","dixans"]}]},
 ori:{t:"Orientation & projet",c:"#d9621f",subs:[
  {t:"Mon parcours",o:"Comprendre son parcours et donner du sens à son orientation",a:"Frise de parcours, questionnaire"},
  {t:"Mon projet",o:"Identifier ses envies et commencer à construire un projet",a:"Fiche projet",acts:["cv","dixans"]},
  {t:"Centres d'intérêt",o:"Identifier ses domaines d'intérêt",a:"Questionnaire, Avenir(s)",acts:["introspection","tests"],res:[O("https://avenirs.onisep.fr","Avenir(s) — Onisep")]},
  {t:"Découverte de la famille GATL",o:"Comprendre la famille de métiers et ses trois spécialités",a:"Recherche guidée, tableau des 3 spécialités",acts:["famille"]},
  {t:"Découverte AGOrA",o:"Découvrir les activités, compétences et débouchés d'AGOrA",a:"Fiche métier, vidéo, quiz",res:[O("https://www.onisep.fr","Onisep")]},
  {t:"Découverte Logistique",o:"Découvrir la spécialité et ses métiers",a:"Recherche, témoignage",res:[O("https://www.onisep.fr","Onisep")]},
  {t:"Découverte Transport",o:"Découvrir la spécialité et ses métiers",a:"Recherche, témoignage",res:[O("https://www.onisep.fr","Onisep")]},
  {t:"Choix de spécialité",o:"Comparer les spécialités et argumenter son choix",a:"Tableau comparatif, entretien"},
  {t:"Découverte des métiers",o:"Élargir sa connaissance des métiers",a:"Onisep, fiches métiers",acts:["metier"]},
  {t:"Rencontre d'un métier",o:"Découvrir un métier à travers un professionnel",a:"Interview, préparation de questions",acts:["pro"]},
  {t:"Poursuites d'études · BTS",o:"Identifier les possibilités après le bac",a:"Exploration Onisep",res:[O("https://www.onisep.fr","Onisep")]},
  {t:"Mobilité",o:"Identifier les possibilités et les freins liés à la mobilité",a:"Carte, recherche transports / logement"},
  {t:"Représentations des métiers",o:"Questionner ses représentations et stéréotypes",a:"Débat, vrai / faux"},
  {t:"Avenir(s)",o:"Utiliser les outils Onisep pour construire son parcours",a:"Activité numérique en salle info",acts:["avenirs"],res:[O("https://avenirs.onisep.fr","Avenir(s) — Onisep")]}]},
 pfmp:{t:"PFMP & monde professionnel",c:"#6b4fd8",subs:[
  {t:"Comprendre la PFMP",o:"Identifier les objectifs et les attentes d'une PFMP",a:"Quiz, échange",acts:["pfmp-prep"]},
  {t:"Rechercher une entreprise",o:"Organiser efficacement sa recherche",a:"Liste d'entreprises, plan de recherche"},
  {t:"CV",o:"Présenter ses expériences et ses compétences",a:"Création ou amélioration du CV"},
  {t:"Lettre · mail de demande",o:"Rédiger une demande professionnelle adaptée",a:"Atelier rédaction"},
  {t:"Téléphoner à une entreprise",o:"Se présenter et formuler clairement sa demande",a:"Simulation téléphonique"},
  {t:"Se présenter · pitch",o:"Présenter son profil et sa recherche en une minute",a:"Pitch 1 minute"},
  {t:"Entretien",o:"Se préparer à un entretien",a:"Jeux de rôle"},
  {t:"Attitudes et codes professionnels",o:"Identifier les comportements attendus en entreprise",a:"Situations professionnelles, études de cas"},
  {t:"Droits et devoirs en PFMP",o:"Connaître les principales règles applicables",a:"Quiz, cas pratiques"},
  {t:"Premier jour en entreprise",o:"Anticiper son arrivée et savoir quoi faire",a:"Simulation"},
  {t:"Difficulté en PFMP",o:"Savoir réagir et identifier les personnes ressources",a:"Cas pratiques"},
  {t:"Bilan PFMP · compétences acquises",o:"Analyser son expérience et la traduire en compétences",a:"Retour d'expérience, fiche compétences"},
  {t:"Découverte de l'entreprise",o:"Comprendre l'organisation et les fonctions d'une entreprise",a:"Organigramme, enquête",acts:["visite"]}]},
 meth:{t:"Méthodes & réussite",c:"#1a9aa3",subs:[
  {t:"Organisation · agenda",o:"Organiser son travail et anticiper les échéances",a:"Planning personnel, atelier agenda",acts:["orga"]},
  {t:"Matériel",o:"Développer son autonomie dans la gestion du matériel",a:"Checklist"},
  {t:"Attitudes et habitudes de travail",o:"Identifier ses postures de travail, ses atouts et ses obstacles",a:"Auto-évaluation « quelles sont mes postures ? » à l'oral puis à l'écrit",acts:["postures"]},
  {t:"Apprendre à apprendre",o:"Identifier des stratégies efficaces",a:"Comparaison de méthodes"},
  {t:"Mémorisation",o:"Tester différentes techniques de mémorisation",a:"Quiz, flashcards"},
  {t:"Attention · concentration",o:"Identifier les conditions favorables à sa concentration",a:"Auto-évaluation, pauses attentionnelles",acts:["pauses"]},
  {t:"Comprendre une consigne",o:"Repérer ce qui est demandé",a:"Exercices courts"},
  {t:"Prise de notes",o:"Sélectionner les informations essentielles",a:"Exercice guidé"},
  {t:"Demander de l'aide",o:"Identifier quand, comment et à qui demander de l'aide",a:"Situations-problèmes"},
  {t:"Travail en groupe",o:"Organiser efficacement une tâche collective",a:"Défi de groupe"},
  {t:"Bilan scolaire",o:"Identifier réussites et points à améliorer",a:"Auto-évaluation"},
  {t:"Tests de positionnement",o:"Identifier ses acquis et ses besoins en français et en maths",a:"Exploitation individualisée",acts:["positionnement"]}]},
 com:{t:"Communication & expression",c:"#0f7f5f",subs:[
  {t:"Prendre la parole",o:"S'exprimer devant un groupe",a:"Présentation courte, virelangues, lecture à voix haute",acts:["expression"]},
  {t:"Se présenter",o:"Construire une présentation claire de soi",a:"Pitch"},
  {t:"Argumenter",o:"Exprimer et justifier une opinion",a:"Mini-débat"},
  {t:"Écouter",o:"Développer l'écoute active",a:"Reformulation",acts:["empathie"]},
  {t:"Communication professionnelle",o:"Adapter son langage au contexte professionnel",a:"Jeux de rôle, téléphone, mail"},
  {t:"Verbal · non verbal",o:"Identifier l'effet de la voix, du regard et de la posture",a:"Exercices filmés"},
  {t:"Débat",o:"Respecter la parole et argumenter",a:"Débat réglé"}]},
 cit:{t:"Citoyenneté & engagement",c:"#b23a5a",subs:[
  {t:"Démocratie au lycée · CVL",o:"Comprendre les formes de représentation des élèves et les possibilités d'engagement",a:"Quiz, recherche, présentation du CVL"},
  {t:"Droits et devoirs",o:"Identifier ses droits et ses responsabilités",a:"Situations-problèmes"},
  {t:"Engagement · solidarité",o:"Découvrir des formes d'engagement, développer l'entraide",a:"Recherche, témoignage, projet collectif",acts:["solidarite","gratitude"]},
  {t:"Égalité · discriminations",o:"Identifier et questionner les discriminations",a:"Débat, situations"},
  {t:"Harcèlement",o:"Identifier les situations et savoir vers qui se tourner",a:"Cas pratiques",res:[O("https://www.education.gouv.fr/non-au-harcelement","Non au harcèlement — 3018")]},
  {t:"Laïcité",o:"Comprendre les principes applicables au lycée",a:"Situations"}]},
 num:{t:"Numérique & IA",c:"#5b6b8c",subs:[
  {t:"Intelligence artificielle",o:"Utiliser l'IA de manière pertinente et responsable",a:"Comparaison de réponses IA"},
  {t:"Formuler une demande (prompt)",o:"Apprendre à formuler une demande précise",a:"Atelier pratique"},
  {t:"Vérifier une information · fake news",o:"Développer son esprit critique, repérer les indices de fiabilité",a:"Comparaison de sources, vrai / faux"},
  {t:"Identité numérique · réseaux",o:"Comprendre les traces laissées en ligne, réfléchir à ses usages",a:"Étude de cas, débat"},
  {t:"Outils professionnels",o:"Découvrir des outils numériques utilisés au travail",a:"Atelier"}]},
 auto:{t:"Autonomie & vie quotidienne",c:"#8a7a2a",subs:[
  {t:"Se déplacer",o:"Savoir organiser un déplacement",a:"Recherche d'itinéraire"},
  {t:"Budget",o:"Comprendre et gérer un budget simple",a:"Situation pratique"},
  {t:"Démarches · documents",o:"Identifier les démarches utiles et comprendre des documents courants",a:"Recherche guidée, atelier"},
  {t:"Prendre un rendez-vous",o:"Savoir contacter un organisme",a:"Simulation"},
  {t:"Personnes ressources",o:"Savoir vers qui se tourner selon la difficulté",a:"Carte des ressources du lycée et du quartier"}]},
 actu:{t:"Actualité & ouverture culturelle",c:"#a35d9c",subs:[
  {t:"Débat d'actualité",o:"S'informer, se forger une opinion, l'exprimer",a:"Revue de presse, débat réglé"},
  {t:"Découverte culturelle",o:"Découvrir une œuvre, un lieu, un événement",a:"Présentation, sortie, exposition"},
  {t:"Sujet choisi par les élèves",o:"Objectif à définir avec la classe",a:"Au choix des élèves"}]},
 proj:{t:"Projet · activité collective",c:"#3d9a3d",subs:[
  {t:"Projet de classe",o:"Concevoir un projet, répartir les rôles, planifier les étapes",a:"Atelier de conception"},
  {t:"Événement · exposition",o:"Préparer une manifestation et la valoriser",a:"Répartition des tâches, préparation"},
  {t:"Action solidaire",o:"Prendre des initiatives, travailler en équipe",a:"Projet collectif"},
  {t:"Concours",o:"Produire une réalisation, la présenter",a:"Travail en équipe"},
  {t:"Bilan du projet",o:"Faire le bilan, présenter le projet",a:"Retour d'expérience",acts:["cocotte"]}]},
 sortie:{t:"Sortie · visite",c:"#2f8f6f",subs:[
  {t:"Préparation de la sortie",o:"Savoir ce qu'on va voir, préparer ses questions",a:"Recherche, questions à poser"},
  {t:"Visite d'entreprise",o:"Découvrir un environnement professionnel et des métiers",a:"Visite guidée, observation",acts:["visite"]},
  {t:"Visite d'une administration",o:"Découvrir une organisation et ses fonctions",a:"Visite, rencontre"},
  {t:"Établissement de formation · JPO",o:"Découvrir une formation",a:"Visite, journée portes ouvertes"},
  {t:"Salon · forum des métiers",o:"Rencontrer des professionnels, recueillir des informations",a:"Parcours de stands, questions préparées"},
  {t:"Visite culturelle · musée",o:"Développer son ouverture culturelle",a:"Visite, exposition"},
  {t:"Exploitation de la sortie",o:"Mettre en mots ce qu'on a compris, élargir ses représentations",a:"Retour d'expérience, restitution",acts:["cocotte"]}]},
 inter:{t:"Intervenant · partenaire",c:"#c94a7a",subs:[
  {t:"PsyEN",o:"Connaître la ressource, préparer son orientation",a:"Présentation, quiz Onisep, prise de rendez-vous",acts:["psyen"]},
  {t:"Bureau des entreprises",o:"Préparer la recherche de PFMP",a:"Présentation, échanges",acts:["mlds"]},
  {t:"Professionnel · entreprise",o:"Découvrir un métier, poser des questions",a:"Rencontre, interview",acts:["pro"]},
  {t:"Ancien élève",o:"Découvrir un parcours après le bac",a:"Témoignage, échanges"},
  {t:"Étudiant · établissement supérieur",o:"Découvrir une formation",a:"Témoignage, échanges"},
  {t:"Association",o:"Travailler une problématique avec un partenaire",a:"Atelier"},
  {t:"Mission locale · insertion",o:"Connaître une ressource",a:"Présentation"},
  {t:"Prévention · santé",o:"Travailler une problématique de santé ou de prévention",a:"Atelier, échanges"},
  {t:"Police · justice · citoyenneté",o:"Travailler une problématique citoyenne",a:"Intervention, échanges"},
  {t:"Partenaire culturel",o:"Découvrir une pratique ou une œuvre",a:"Atelier"}]},
 autre:{t:"Autre",c:"#7d8697",subs:[]}
};

/* Progression proposée par la collègue (1re période) — disponible dans la bibliothèque, pas préposée. */
const B = (theme,sub,o,a,extra={})=>({theme,sub,objectif:o,activite:a,res:[],...extra});
const TRAME = {
 "2026-09-09":{mode:"separe",g2:{lieu:"Salle habituelle",statut:"todo",proposition:true,blocks:[B("vie","Accueil · rentrée","Faire le point sur la rentrée : comment ça se passe, à qui demander de l'aide","Point d'ambiance + météo des émotions",{act:"ambiance"})]}},
 "2026-09-16":{mode:"both",both:{lieu:"Salle habituelle",statut:"todo",proposition:true,blocks:[B("cps","Se connaître","Se dire à soi-même","Bullet journal",{act:"bullet"})]}},
 "2026-09-23":{mode:"both",both:{lieu:"Salle habituelle",statut:"todo",proposition:true,blocks:[B("cps","Se connaître","Se présenter, se dire aux autres","Le blason de la conscience de soi",{act:"blason"})]}},
 "2026-09-30":{mode:"both",both:{lieu:"Salle habituelle",statut:"todo",proposition:true,blocks:[B("vie","Élections des délégués","S'informer sur le rôle du délégué et choisir ses délégués","Fiche rôle, candidatures, vote (AA_VDC)",{act:"delegues"})]}},
 "2026-10-07":{mode:"both",both:{lieu:"Salle informatique",statut:"todo",proposition:true,blocks:[B("ori","Centres d'intérêt","Mettre en lien connaissance de soi et ambitions : quelles sont mes compétences ?","Introspection sur Avenir(s) / Réso Avenirs",{act:"introspection"})]}},
 "2026-10-14":{mode:"both",both:{lieu:"Salle habituelle",statut:"todo",proposition:true,blocks:[B("meth","Attitudes et habitudes de travail","Identifier ses atouts et ses obstacles (1/2) : quelles sont mes postures ?","Auto-évaluation postures et réussite, oral puis écrit",{act:"postures"})]}},
 "2026-11-04":{mode:"both",both:{lieu:"Salle habituelle",statut:"todo",proposition:true,blocks:[B("vie","Règles de vie","Encourager les comportements positifs","Matrice collective : Respect · Responsabilité · Engagement",{act:"matrice"})]}},
 "2026-11-18":{mode:"both",both:{lieu:"Salle informatique",statut:"todo",proposition:true,blocks:[B("ori","Centres d'intérêt","Identifier ses atouts (2/2)","Tests de personnalité, styles d'apprentissage — quiz Onisep avec la PsyEN",{act:"tests"})]}},
 "2026-11-25":{mode:"both",both:{lieu:"Salle habituelle",statut:"todo",proposition:true,blocks:[B("cps","Confiance en soi","Renforcer l'estime de soi","Exercices d'expression : virelangues, chanter, lire à voix haute ; carnet des réussites",{act:"expression"})]}},
 "2026-12-02":{mode:"both",both:{lieu:"Salle habituelle",statut:"todo",proposition:true,blocks:[B("cps","Émotions","Apprendre à maîtriser ses émotions","Techniques de relaxation, Pause-Observe-Agis",{act:"relax"})]}},
 "2026-12-09":{mode:"both",both:{lieu:"Salle habituelle",statut:"todo",proposition:true,blocks:[B("cps","Communication","Améliorer ses relations","Jeux de rôle sur la communication interpersonnelle",{act:"jdrcom"})]}},
 "2026-12-16":{mode:"both",both:{lieu:"Salle habituelle",statut:"todo",proposition:true,blocks:[B("cps","Coopération","Collaborer efficacement","Cohésion d'équipe : jeux d'ordre",{act:"ordre"}),B("vie","Bilan de période","Faire le bilan du semestre","Cocotte du retour d'expérience",{act:"cocotte"})]}}
};

/* ===== Référentiels (pour l'onglet Repères et les étiquettes en arrière-plan) ===== */
const CPS = {
  cog:{t:"CPS cognitives", g:[
    {code:"C1",t:"Renforcer sa conscience de soi",def:"Savoir qui on est : ce qu'on aime, ce qu'on sait faire, ce qu'on vaut, ce qui compte pour soi — et garder un regard critique sur l'image qu'on a de soi.",
     i:[["C1.1","Accroître sa connaissance de soi","Repérer ses goûts, ses qualités, ses compétences, ses limites."],
        ["C1.2","Penser de façon critique","Ne pas prendre pour argent comptant ce qu'on pense de soi ou ce que les autres en disent."],
        ["C1.3","Connaître ses valeurs, ses besoins et ses buts","Savoir ce qui compte vraiment pour moi et ce dont j'ai besoin pour aller bien."],
        ["C1.4","Prendre des décisions constructives","Choisir en cohérence avec ses valeurs et ses besoins, pas sous la pression."],
        ["C1.5","S'auto-évaluer positivement","Reconnaître ses forces et ses réussites ; être bienveillant avec soi."],
        ["C1.6","Renforcer sa pleine attention à soi","Être présent à ce qu'on ressent ici et maintenant, sans juger."]]},
    {code:"C2",t:"Renforcer sa maîtrise de soi et son accomplissement",def:"Passer de l'intention à l'action : se fixer des buts, tenir face aux impulsions, résoudre les problèmes et demander de l'aide quand il faut.",
     i:[["C2.1","Atteindre ses buts personnels","Formuler un objectif précis et le mettre en œuvre étape par étape."],
        ["C2.2","Gérer ses impulsions","Se retenir de réagir tout de suite ; garder le contrôle."],
        ["C2.3","Résoudre des problèmes de façon créative","Observer, chercher plusieurs solutions, en choisir une, agir."],
        ["C2.4","Savoir demander de l'aide","Repérer à qui s'adresser quand on n'y arrive pas seul."]]}]},
  emo:{t:"CPS émotionnelles", g:[
    {code:"E1",t:"Renforcer sa conscience des émotions",def:"Comprendre à quoi servent les émotions et savoir reconnaître et nommer ce qu'on ressent.",
     i:[["E1.1","Comprendre les émotions","Savoir qu'une émotion informe sur un besoin et pousse à agir."],
        ["E1.2","Identifier ses émotions","Percevoir ce qui se passe en soi et mettre un mot dessus."]]},
    {code:"E2",t:"Réguler ses émotions et son stress",def:"Exprimer ce qu'on ressent sans blesser, retrouver son calme, faire face au stress.",
     i:[["E2.1","Exprimer ses émotions de façon constructive","Dire « je ressens… parce que… j'aurais besoin de… »."],
        ["E2.2","Réguler ses émotions","Accueillir les émotions désagréables et les faire baisser avec des stratégies efficaces."],
        ["E2.3","Gérer son stress","Repérer les signes du stress, agir sur soi et sur la situation."]]}]},
  soc:{t:"CPS sociales", g:[
    {code:"S1",t:"Développer des relations constructives",def:"Communiquer clairement, écouter vraiment, créer du lien et coopérer.",
     i:[["S1.1","Communiquer de façon efficace et positive","Formuler des demandes claires, éviter ce qui abîme la relation."],
        ["S1.2","Communiquer de façon empathique","Écouter, reformuler, se mettre à la place de l'autre."],
        ["S1.3","Développer des liens et des comportements prosociaux","Entrer en relation, aider, coopérer, exprimer de la reconnaissance."]]},
    {code:"S2",t:"Résoudre des difficultés relationnelles",def:"Dire non, tenir sa position sans agressivité, sortir d'un conflit.",
     i:[["S2.1","S'affirmer et résister à la pression sociale","Refuser, exprimer un désaccord, recevoir une critique."],
        ["S2.2","Résoudre les conflits de manière constructive","S'apaiser, comprendre les besoins de chacun, négocier."]]}]}
};
const ORI = {t:"Compétences à s'orienter (Avenir(s))", g:[
  {code:"A",t:"S'informer et se repérer",def:"Trouver l'information sur les formations et les métiers, savoir qui peut aider, et prendre du recul sur les idées reçues.",
   i:[["O1","Chercher et traiter l'information",""],["O2","Connaître les personnes, lieux et ressources qui aident à s'orienter",""],["O3","Explorer les diplômes et les formations",""],["O4","Explorer les métiers et le monde du travail",""],["O5","Interroger et déconstruire les représentations",""]]},
  {code:"B",t:"Se découvrir et cultiver ses ambitions",def:"Se connaître, relier ce qu'on sait de soi à ce qu'on vise, s'autoriser à viser haut, savoir se présenter.",
   i:[["O6","Apprendre à se connaître",""],["O7","Mettre en lien connaissance de soi et ambitions",""],["O8","S'autoriser à rêver",""],["O9","Savoir se présenter et maîtriser son image",""],["O10","Traduire ses expériences en compétences",""]]},
  {code:"C",t:"Se construire et se projeter",def:"Accepter les imprévus, s'appuyer sur un réseau, anticiper les transitions, comprendre les conséquences de ses choix.",
   i:[["O11","Accepter les imprévus et saisir les opportunités",""],["O12","Construire et mobiliser ses réseaux",""],["O13","Gérer et anticiper les transitions",""],["O14","Identifier ses atouts et ses obstacles",""],["O15","Se projeter et comprendre les implications de ses choix",""]]}]};

const LABEL = {};
Object.values(CPS).forEach(f=>f.g.forEach(g=>g.i.forEach(([c,l])=>LABEL[c]=l)));
ORI.g.forEach(g=>g.i.forEach(([c,l])=>LABEL[c]=l));

/* ===== Bibliothèque d'activités =====
   cat = grande ligne ; sub = pour CPS (cog/emo/soc) ; pdf = fichier dans ressources/ ; url = lien externe */
const R = f => "ressources/"+f;
const ACTS = [
 // ---- Vie de classe
 {id:"ambiance",cat:"vie",t:"Point d'ambiance de rentrée",src:"PP",dur:"30 min",p:"Comment se passe cette rentrée ? Tour de table ou météo des émotions, difficultés, à qui demander de l'aide au lycée.",tags:["E1.2","S1.1","C2.4"]},
 {id:"delegues",cat:"vie",t:"Préparer les élections des délégués",src:"AA_VDC",dur:"1 h",p:"Le rôle du délégué, ce qu'on attend de lui, candidatures et professions de foi, puis choisir ses délégués. À faire avant la Toussaint.",tags:["S1.1","C1.4","O2"]},
 {id:"matrice",cat:"vie",t:"Matrice collective : Respect · Responsabilité · Engagement",src:"Collègue (AA_VDC)",dur:"1 h",p:"La classe construit sa charte à partir des trois valeurs : ça veut dire quoi, concrètement, chez nous ?",tags:["S1.3","C1.3"]},
 {id:"trouve",cat:"vie",t:"Trouve quelqu'un qui…",src:"SPF Tome I p.197",dur:"20 min",p:"Grille à faire signer par des camarades. Brise-glace de rentrée.",tags:["S1.3"],pdf:R("spf_trouve_quelquun_qui.pdf")},
 {id:"eclair",cat:"vie",t:"Les rencontres éclair",src:"TEAL / SPF p.201",dur:"20 min",p:"Binômes tournants, questions simples : créer du lien vite.",tags:["S1.3"],pdf:R("spf_rencontres_eclair.pdf")},
 {id:"lien",cat:"vie",t:"Le jeu du lien",src:"ScholaVie",dur:"45 min",p:"Plateau de cases (une qualité, une personne qui m'aide, une erreur qui m'a appris…). On avance au dé et on répond.",tags:["S1.3","C1.1"],pdf:R("scholavie_jeu_du_lien.pdf")},
 {id:"ordre",cat:"vie",t:"Jeux d'ordre (cohésion)",src:"Collègue (AA_VDC)",dur:"15 min",p:"Se ranger sans parler par taille, alphabet, date d'anniversaire… Coopération rapide.",tags:["S1.1","S1.3"]},
 {id:"cocotte",cat:"vie",t:"La cocotte du retour d'expérience",src:"ScholaVie",dur:"15 min",p:"Une chose réussie, une chose utile, ce que je voudrais mieux réussir… Bilan de fin de période.",tags:["C1.5"],pdf:R("scholavie_cocotte_retour_experience.pdf")},
 // ---- Orientation
 {id:"famille",cat:"ori",t:"Découvrir les 3 spécialités de la famille GATL",src:"Vademecum GATL",dur:"1 h",p:"AGORA, Logistique, Organisation de transport de marchandises : activités, PFMP, poursuites d'études. Préparer le choix de fin de seconde.",tags:["O3","O4","O15"],url:"https://www.onisep.fr"},
 {id:"avenirs",cat:"ori",t:"Créer son profil Avenir(s)",src:"Onisep",dur:"1 h · salle info",p:"Prise en main de la plateforme recommandée par éduscol : profil, compétences, exploration des métiers.",tags:["O1","O2","O6"],url:"https://avenirs.onisep.fr"},
 {id:"introspection",cat:"ori",t:"Introspection : se connaître (Avenir(s))",src:"Collègue",dur:"1 h · salle info",p:"Auto-évaluation « quelles sont mes compétences ? » ; relier ce que je sais de moi à mes ambitions.",tags:["O6","O7","C1.1"],url:"https://avenirs.onisep.fr"},
 {id:"metier",cat:"ori",t:"Découvrir un métier",src:"Onisep",dur:"1 h",p:"Fiche métier, vidéo, témoignage : activités, conditions, formation, salaire. Restitution en 2 min.",tags:["O4","O1"],url:"https://www.onisep.fr"},
 {id:"cv",cat:"ori",t:"CV imaginaire",src:"Prodas / SPF p.48",dur:"45 min",p:"Le CV de la personne qu'on aimerait être dans 10 ans : s'autoriser à rêver.",tags:["C1.1","O8","O9"],pdf:R("spf_cv_imaginaire.pdf")},
 {id:"dixans",cat:"ori",t:"Ma vie accomplie dans dix ans",src:"CARE / SPF p.61",dur:"40 min",p:"Visualisation écrite : ma vie dans 10 ans si tout se passe bien.",tags:["C1.3","O8","O15"],pdf:R("spf_ma_vie_dans_dix_ans.pdf")},
 {id:"tests",cat:"ori",t:"Tests de personnalité · styles d'apprentissage",src:"Collègue",dur:"1 h",p:"Quiz Onisep (avec la PsyEN), visuel / auditif / kinesthésique. Identifier ses atouts.",tags:["C1.1","O6","O14"],url:"https://www.onisep.fr"},
 // ---- CPS cognitives
 {id:"blason",cat:"cps",sub:"cog",t:"Le blason de la conscience de soi",src:"ScholaVie",dur:"45–60 min",p:"J'aime / je sais / je suis / j'ai. Chacun dessine son blason puis le présente. Prérequis possible : blason des chevaliers, valeurs, symboles.",tags:["C1.1","C1.5","O9"],pdf:R("scholavie_blason_conscience_de_soi.pdf"),url:"https://scholavie.fr/wp-content/uploads/2026/03/ScholaVie_Le-blason-de-la-conscience-de-soi.pdf"},
 {id:"bullet",cat:"cps",sub:"cog",t:"Bullet journal · journal de bord",src:"Collègue",dur:"20 min + rituel",p:"Se dire à soi-même : carnet personnel (humeur, réussites, objectifs de la semaine). Peut devenir un rituel de 5 min.",tags:["C1.1","C1.6","O6"]},
 {id:"portrait",cat:"cps",sub:"cog",t:"Le portrait chinois",src:"ScholaVie",dur:"30 min",p:"« Si j'étais un film, une musique, un métier… ». En binômes puis en groupe.",tags:["C1.1","S1.3"],pdf:R("scholavie_portrait_chinois.pdf")},
 {id:"proust",cat:"cps",sub:"cog",t:"Le questionnaire de Proust",src:"ScholaVie / SPF p.40",dur:"40 min",p:"20 questions positives : ce qui me donne envie de me lever, ma plus belle réussite, mon objectif de l'année…",tags:["C1.1","C1.2"],pdf:R("scholavie_questionnaire_proust.pdf")},
 {id:"forces",cat:"cps",sub:"cog",t:"Ma fiche des forces",src:"ScholaVie",dur:"40 min",p:"Repérer ses forces personnelles et les illustrer par des exemples vécus.",tags:["C1.5","O10","O14"],pdf:R("scholavie_fiche_des_forces.pdf")},
 {id:"reussite",cat:"cps",sub:"cog",t:"Le portrait d'une réussite",src:"ScholaVie",dur:"30 min",p:"Décrire une situation dont on est fier : ma réussite, mes pensées, mes émotions. Version individuelle ou collective.",tags:["C1.5","O10"],pdf:R("scholavie_portrait_reussite_individuel.pdf"),pdf2:R("scholavie_portrait_reussite_collectif.pdf")},
 {id:"carnet",cat:"cps",sub:"cog",t:"Le carnet des réussites",src:"Collègue",dur:"rituel",p:"Chaque semaine, noter une réussite. Estime de soi dans la durée.",tags:["C1.5","C2.1"]},
 {id:"triangles",cat:"cps",sub:"cog",t:"Trois enfants et quatre triangles",src:"SPF p.43",dur:"30 min",p:"Situation-problème sur l'image de soi : comment on se décrit et comment on est perçu.",tags:["C1.2","C1.1"],pdf:R("spf_trois_enfants_quatre_triangles.pdf")},
 {id:"valeurs",cat:"cps",sub:"cog",t:"Valeurs (tri de cartes)",src:"SPF p.68",dur:"45 min",p:"Trier des cartes-valeurs, en garder 5, expliquer ses choix.",tags:["C1.3","C1.4"],pdf:R("spf_valeurs.pdf")},
 {id:"gratval",cat:"cps",sub:"cog",t:"Mes valeurs par la gratitude",src:"CARE / SPF p.62",dur:"30 min",p:"Partir de ce pour quoi on est reconnaissant pour remonter aux valeurs qui comptent.",tags:["C1.3"],pdf:R("spf_mes_valeurs_par_la_gratitude.pdf")},
 {id:"besoins",cat:"cps",sub:"cog",t:"Roue de la satisfaction des besoins",src:"ScholaVie",dur:"20 min",p:"Noter de 0 à 10 la satisfaction de ses besoins (découverte, repos, appartenance, reconnaissance, liberté…).",tags:["C1.3","E1.1"],pdf:R("scholavie_roue_besoins.pdf")},
 {id:"marelle",cat:"cps",sub:"cog",t:"La marelle de la motivation",src:"ScholaVie",dur:"45 min",p:"Un objectif Précis, Positif, Personnel, Réaliste, Évaluable, Temporel — et le trajet pour y arriver.",tags:["C2.1","C1.3"],pdf:R("scholavie_marelle_motivation.pdf")},
 {id:"pret",cat:"cps",sub:"cog",t:"Outil PRÊT",src:"ScholaVie",dur:"30 min",p:"Les questions à se poser pour se fixer un bon objectif (trimestre, PFMP, examen).",tags:["C2.1","O14"],pdf:R("scholavie_outil_pret.pdf")},
 {id:"motiv",cat:"cps",sub:"cog",t:"Réflexion sur la motivation scolaire",src:"Collègue",dur:"1 h",p:"Pourquoi je suis ici, qu'est-ce qui me fait avancer / me freine ?",tags:["C1.3","C2.1","O15"]},
 {id:"perspectives",cat:"cps",sub:"cog",t:"Mes perspectives pour la nouvelle année",src:"ScholaVie",dur:"30 min",p:"Un objectif que je me fixe, une force à développer, une personne à encourager… Idéal en janvier.",tags:["C2.1","C1.3"],pdf:R("scholavie_perspectives_nouvelle_annee.pdf")},
 {id:"cesse",cat:"cps",sub:"cog",t:"Méthode CESSE",src:"ScholaVie",dur:"30 min",p:"Calmer · Exprimer · Sélectionner une solution · Enclencher. Résoudre un problème (ou un conflit).",tags:["C2.3","S2.2"],pdf:R("scholavie_methode_cesse.pdf")},
 // ---- CPS émotionnelles
 {id:"reglette",cat:"cps",sub:"emo",t:"La réglette des émotions",src:"ScholaVie",dur:"rituel 5 min",p:"Météo des émotions en début et fin de séance. Trois versions : smiley, pouce, chiffre.",tags:["E1.2","E1.1"],pdf:R("scholavie_reglette_emotions_smiley.pdf"),pdf2:R("scholavie_reglette_emotions_chiffre.pdf")},
 {id:"barometre",cat:"cps",sub:"emo",t:"Le baromètre du stress",src:"ScholaVie",dur:"20 min",p:"Évaluer son stress et repérer quand faire une pause avant l'explosion.",tags:["E2.3","E1.2"],pdf:R("scholavie_barometre_stress.pdf")},
 {id:"pauses",cat:"cps",sub:"emo",t:"La roue des pauses attentionnelles",src:"ScholaVie",dur:"15 min",p:"Respiration consciente, scan corporel, observer 3 choses, ne rien faire… Relaxation prête à l'emploi.",tags:["C1.6","E2.3"],pdf:R("scholavie_roue_des_pauses.pdf")},
 {id:"poa",cat:"cps",sub:"emo",t:"Pause · Observe · Agis",src:"ScholaVie",dur:"20 min",p:"Trois étapes pour prendre du recul avant de réagir. À afficher en classe.",tags:["E2.2","C2.2"],pdf:R("scholavie_pause_observe_agis.pdf")},
 {id:"relax",cat:"cps",sub:"emo",t:"Techniques de relaxation",src:"Collègue",dur:"20–30 min",p:"Respiration, relâchement musculaire, endroit ressource.",tags:["E2.3","C1.6"]},
 // ---- CPS sociales
 {id:"jdrcom",cat:"cps",sub:"soc",t:"Jeux de rôle : communication interpersonnelle",src:"Collègue",dur:"1 h",p:"Demander quelque chose à un adulte, accueillir un nouveau, répondre à une remarque.",tags:["S1.1","S1.2"]},
 {id:"jdrconflit",cat:"cps",sub:"soc",t:"Jeux de rôle : gestion des conflits",src:"Collègue",dur:"1 h",p:"Situations de conflit vécues au lycée ou en PFMP.",tags:["S2.2","S2.1"]},
 {id:"empathie",cat:"cps",sub:"soc",t:"L'empathie en action",src:"TEAL / SPF p.183",dur:"40 min",p:"Écoute silencieuse puis reformulation empathique en binômes.",tags:["S1.2"],pdf:R("spf_empathie_en_action.pdf")},
 {id:"plateau",cat:"cps",sub:"soc",t:"Le jeu du plateau",src:"Prodas / SPF p.200",dur:"45 min",p:"Jeu de plateau : questions de connaissance de soi et des autres.",tags:["S1.3","C1.1"],pdf:R("spf_jeu_du_plateau.pdf")},
 {id:"gratitude",cat:"cps",sub:"soc",t:"Ma main de la gratitude",src:"SPF p.203",dur:"20 min",p:"Sur chaque doigt, une personne ou une chose pour laquelle on est reconnaissant.",tags:["S1.3"],pdf:R("spf_main_gratitude.pdf")},
 {id:"solidarite",cat:"cps",sub:"soc",t:"Cultiver la reconnaissance et la solidarité",src:"TEAL / SPF p.202",dur:"30 min",p:"Repérer et nommer les comportements d'entraide dans la classe.",tags:["S1.3"],pdf:R("spf_reconnaissance_solidarite.pdf")},
 {id:"spirale",cat:"cps",sub:"soc",t:"La spirale RESSOURCES",src:"ScholaVie",dur:"30 min",p:"Consignes courtes en spirale : je raconte une réussite, j'offre à un ami une qualité…",tags:["S1.3","C1.5"],pdf:R("scholavie_spirale_ressources.pdf")},
 {id:"expression",cat:"cps",sub:"soc",t:"Exercices d'expression (voix, corps)",src:"Collègue",dur:"1 h",p:"Virelangues, chanter, lire à haute voix, se présenter debout. Estime et confiance.",tags:["C1.5","O9"],url:"https://www.espacefrancais.com/les-virelangues/"},
 {id:"feedback",cat:"cps",sub:"soc",t:"Les 6P d'un feedback constructif",src:"ScholaVie",dur:"outil",p:"Permission · Points forts · Progrès · Points d'amélioration · Plan d'action · Point final.",tags:["S1.1"],pdf:R("scholavie_6p_feedback.pdf")},
 // ---- PFMP
 {id:"pfmp-prep",cat:"pfmp",t:"Préparer sa PFMP",src:"Équipe",dur:"1 h",p:"Attentes du tuteur, tenue, ponctualité, se présenter, questions à poser le premier jour.",tags:["O9","O13"]},
 {id:"pro",cat:"pfmp",t:"Rencontrer un professionnel",src:"Bureau des entreprises",dur:"1 h",p:"Préparer les questions, accueillir, prendre des notes, remercier.",tags:["O4","O12","S1.1"]},
 {id:"visite",cat:"pfmp",t:"Visite d'entreprise",src:"Équipe",dur:"½ journée",p:"Avant : ce qu'on cherche à voir. Après : ce qu'on a compris des métiers.",tags:["O4","O5"]},
 // ---- Méthodologie
 {id:"postures",cat:"meth",t:"Attitudes et habitudes de travail",src:"Collègue",dur:"1 h",p:"Auto-évaluation « quelles sont mes postures ? » (postures et réussite), à l'oral puis à l'écrit.",tags:["O14","C2.1"]},
 {id:"positionnement",cat:"meth",t:"Exploiter les tests de positionnement",src:"éduscol",dur:"30 min",p:"Retour sur les résultats français / maths : forces, points à consolider, où trouver de l'aide.",tags:["O14","C1.5"]},
 {id:"orga",cat:"meth",t:"S'organiser : agenda, cahier, devoirs",src:"Équipe",dur:"45 min",p:"Lire son emploi du temps, tenir son agenda, préparer son sac, planifier la semaine.",tags:["C2.1"]},
 // ---- Intervenant
 {id:"psyen",cat:"inter",t:"Intervention de la PsyEN",src:"Établissement",dur:"1 h",p:"Présentation, prise de rendez-vous, exploitation d'un quiz Onisep.",tags:["O2"]},
 {id:"mlds",cat:"inter",t:"Intervention MLDS / bureau des entreprises",src:"Établissement",dur:"1 h",p:"Qui aide à quoi dans l'établissement.",tags:["O2"]},
];


Object.assign(window,{SLOTS,HOLI,GROUPS,STATUS,LIEUX,THEMES,TRAME,CPS,ORI,LABEL,ACTS});
