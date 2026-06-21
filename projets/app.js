/* ============================================================================
   Atelier projet — moteur (devoirs-pse / coordination_projets). Temps réel,
   RGPD (initiales + rôle). Vue d'ensemble par phases, garde-fous, synthèse,
   export Word, présence, regroupement, matrice, fiches concept (Mager).
   + Type de projet adaptatif, plan d'action, mode rapide/complet, écarter.
============================================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, doc, addDoc, getDocs, getDoc, onSnapshot, updateDoc, setDoc,
  deleteDoc, serverTimestamp, query, orderBy }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = { apiKey:"AIzaSyAWdCMvOiAJln3eT9LIAQD3RWJUD0lQcLI", authDomain:"devoirs-pse.firebaseapp.com", projectId:"devoirs-pse", storageBucket:"devoirs-pse.firebasestorage.app", messagingSenderId:"614730413904", appId:"1:614730413904:web:a5dd478af5de30f6bede55" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const COL = "coordination_projets";

const ICONS = {
  back:`<path d="m14 6-6 6 6 6"/>`, chev:`<path d="m9 6 6 6-6 6"/>`,
  eye:`<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>`,
  stethoscope:`<path d="M6 3v5a4 4 0 0 0 8 0V3"/><path d="M6 3H4M14 3h2"/><path d="M10 16a5 5 0 0 0 5 5 4 4 0 0 0 4-4v-2"/><circle cx="19" cy="13" r="2"/>`,
  help:`<circle cx="12" cy="12" r="9"/><path d="M9.6 9.6a2.5 2.5 0 0 1 4 1.9c0 1.6-2 2-2 3.6"/><circle cx="11.7" cy="17.4" r=".7" fill="currentColor" stroke="none"/>`,
  compass:`<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.2 5.3-5.3 2.2 2.2-5.3z"/>`,
  target:`<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>`,
  checklist:`<path d="M9 5h11M9 12h11M9 19h11"/><path d="m3.5 5 1.2 1.2 2-2.4M3.5 12l1.2 1.2 2-2.4M3.5 19l1.2 1.2 2-2.4"/>`,
  bolt:`<path d="M13 3 5 13.5h5.5L10 21l8-10.5h-5.5z"/>`,
  tool:`<path d="M14.7 6.3a3.6 3.6 0 0 0-4.8 4.6l-5.4 5.4 1.9 1.9 5.4-5.4a3.6 3.6 0 0 0 4.6-4.8l-2.3 2.3-1.9-.4-.4-1.9z"/>`,
  calendar:`<rect x="4" y="5.5" width="16" height="15" rx="2"/><path d="M4 9.5h16M8 3.5v4M16 3.5v4"/>`,
  shield:`<path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"/>`,
  chart:`<path d="M5 20V10M12 20V4M19 20v-7"/>`,
  clipboard:`<rect x="6" y="5" width="12" height="16" rx="2"/><path d="M9 5V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1"/><path d="M9.5 12l1.5 1.5 3.5-3.5"/>`,
  alert:`<path d="M12 4 2.5 20h19z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.4" r=".6" fill="currentColor" stroke="none"/>`,
  user:`<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>`,
  users:`<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 5.2a3.2 3.2 0 0 1 0 6.1"/><path d="M16.5 14.4a5.5 5.5 0 0 1 4 4.6"/>`,
  plus:`<path d="M12 5v14M5 12h14"/>`,
  send:`<path d="M4 12 20 4l-6 16-2.5-6.5z"/><path d="M11.5 13.5 20 4"/>`,
  file:`<path d="M13.5 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7.5z"/><path d="M13.5 3v4.5H18"/>`,
  printer:`<path d="M7 9V4h10v5"/><rect x="5" y="9" width="14" height="7" rx="1.5"/><path d="M7 14h10v6H7z"/>`,
  word:`<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9l1.5 6 1.5-4 1.5 4L15 9"/>`,
  star:`<path d="m12 4 2.3 4.7 5.2.8-3.8 3.6.9 5.1-4.6-2.4-4.6 2.4.9-5.1L4.5 9.5l5.2-.8z"/>`,
  info:`<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r=".8" fill="currentColor" stroke="none"/>`,
  trash:`<path d="M5 7h14M9 7V5h6v2M6 7l1 13h10l1-13"/>`,
  pencil:`<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>`,
  lock:`<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>`,
  unlock:`<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 7.8-1.4"/>`,
  comment:`<path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4V6a1 1 0 0 1 1-1z"/>`,
  x:`<path d="m6 6 12 12M18 6 6 18"/>`,
  folder:`<path d="M3.5 7.5a2 2 0 0 1 2-2H9l2 2h7.5a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>`,
  check:`<path d="M5 12.5 10 17.5 19.5 7"/>`,
  grid:`<rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.2"/>`,
  wand:`<path d="M5 19 15 9"/><path d="m16 3 1 2.2 2.2 1-2.2 1L16 10.4 15 8.2 12.8 7.2 15 6.2z"/>`,
  merge:`<path d="M6 4v6a4 4 0 0 0 4 4h8"/><path d="M18 4v6a4 4 0 0 1-4 4"/><path d="m15 11 3 3-3 3"/>`,
  columns:`<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M10 4v16M16 4v16"/>`,
  link:`<path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/>`,
  table:`<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 10h16M10 10v9"/>`,
  ban:`<circle cx="12" cy="12" r="8.5"/><path d="m6.6 6.6 10.8 10.8"/>`,
  toggle:`<rect x="3" y="7" width="18" height="10" rx="5"/><circle cx="9" cy="12" r="3"/>`,
  sync:`<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8"/><path d="M20 4v4h-4"/><path d="M20 12a8 8 0 0 1-13.7 5.6L4 16"/><path d="M4 20v-4h4"/>`,
  bulb:`<path d="M9.5 17.5h5"/><path d="M10 21h4"/><path d="M8 14a5 5 0 1 1 8 0c-.8.9-1.2 1.6-1.3 2.5h-5.4c-.1-.9-.5-1.6-1.3-2.5z"/>`,
  book:`<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H18v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M6.5 18H18v3H6.5A1.5 1.5 0 0 1 5 19.5"/>`,
  external:`<path d="M14 5h5v5"/><path d="M19 5 11 13"/><path d="M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4"/>`,
  clip:`<path d="M19 11l-7.5 7.5a4 4 0 0 1-5.7-5.7L13 5.6a2.6 2.6 0 0 1 3.7 3.7l-7.1 7.1a1.3 1.3 0 0 1-1.8-1.8l6.6-6.6"/>`,
  clock:`<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>`,
  pin:`<path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>`,
  euro:`<path d="M16.5 8a5 5 0 1 0 0 8"/><path d="M5 10.5h7M5 13.5h6"/>`,
  up:`<path d="m6 15 6-6 6 6"/>`,
  down:`<path d="m6 9 6 6 6-6"/>`,
};
const ic = n => ICONS[n] ? `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>` : "";

const ETAPES = [
  { id:"constats", nom:"Constats", icon:"eye", q:"Qu'est-ce qu'on observe concrètement ?", def:"On part du réel : ce qu'on voit, sans interpréter ni juger. Un constat est observable et vérifiable.", aide:"Décrire un comportement précis dans une situation précise." },
  { id:"diagnostic", nom:"Diagnostic", icon:"stethoscope", q:"Qu'est-ce que ces constats révèlent comme besoin réel ?", def:"Le constat décrit ; le diagnostic comprend. On cherche les mécanismes derrière ce qu'on observe.", aide:"Relisez les constats ci-dessus et demandez : « de quoi est-ce le signe ? »." },
  { id:"problematique", nom:"Problématique", icon:"help", q:"Quel problème précis allons-nous traiter ?", def:"La question centrale du projet. Ni trop large, ni une solution déguisée.", aide:"Formulez une vraie question. Marquez d'un ★ celle que l'équipe retient." },
  { id:"finalite", nom:"Finalité", icon:"compass", q:"Pourquoi fait-on ce projet ? Le cap.", def:"Le sens large, la direction. Non mesurable — c'est l'horizon, pas l'objectif précis.", aide:"Ex. « Développer l'autonomie et la responsabilité »." },
  { id:"obj_general", nom:"Objectif général", icon:"target", q:"Quelle capacité concrète le projet doit-il développer ?", def:"La capacité visée — concrète, contrairement à la finalité. Ce que «PUB» saura faire.", aide:"Formuler « être capable de… »." },
  { id:"obj_op", nom:"Objectifs opérationnels", icon:"checklist", q:"Qu'est-ce qu'on travaille concrètement et qu'on pourra vérifier ?", def:"On rend l'objectif général observable, en plusieurs objectifs vérifiables.", aide:"Verbes d'action : identifier, repérer, formuler, préparer, réaliser. À éviter : comprendre, améliorer, favoriser." },
  { id:"actions", nom:"Actions", icon:"bolt", q:"Quelles actions concrètes répondent aux objectifs ?", def:"Ce qu'on met réellement en place. Chaque action sert un objectif. Pilotez-les dans le plan d'action.", aide:"Reliez chaque action à un objectif (↳ Sert). Qui / quand : onglet Plan d'action." },
  { id:"moyens", nom:"Moyens", icon:"tool", q:"De quels moyens a-t-on besoin ?", def:"Les ressources nécessaires : humaines, matérielles, partenaires.", aide:"Humains, matériel, salle, budget, temps, partenaires." },
  { id:"miseoeuvre", nom:"Mise en œuvre", icon:"calendar", q:"Où, quand, combien de temps ?", def:"Le concret de terrain : sans calendrier ni lieu, un projet reste une intention.", aide:"Lieu · créneau · période · durée · fréquence · échéances." },
  { id:"cadre", nom:"Cadre", icon:"shield", q:"Quelles sont les limites du projet ?", def:"Ce que le projet ne fait pas. Le cadre le protège des dérives.", aide:"Ce qui reste hors champ, ce qui est volontaire, ce qui n'est pas évalué, les règles de sécurité — selon le projet." },
  { id:"indicateurs", nom:"Indicateurs", icon:"chart", q:"À quoi verra-t-on que ça marche ?", def:"Les signes observables ou mesurables du suivi. Peu, mais utiles.", aide:"Reliez chaque indicateur à un objectif (↳ Sert)." },
  { id:"evaluation", nom:"Évaluation", icon:"clipboard", q:"Comment évalue-t-on ?", def:"Trois niveaux : l'activité, les résultats immédiats, les effets. Prévue dès le départ.", aide:"Bilans par période, analyse des usages, ajustements." },
  { id:"vigilance", nom:"Points de vigilance", icon:"alert", q:"Quels risques anticiper ?", def:"Les pièges à éviter pour que le projet ne dévie pas de son intention.", aide:"Ex. projet trop large, participation qui retombe, objectifs flous, moyens sous-estimés." },
];
const ETM = Object.fromEntries(ETAPES.map(e=>[e.id,e]));
const PHASES = [
  { nom:"Comprendre", c:"#2f6cd6", etapes:["constats","diagnostic","problematique"] },
  { nom:"Viser", c:"#0f8a76", etapes:["finalite","obj_general","obj_op"] },
  { nom:"Agir", c:"#d2603a", etapes:["actions","moyens","miseoeuvre"] },
  { nom:"Cadrer & évaluer", c:"#6b4bd6", etapes:["cadre","indicateurs","evaluation","vigilance"] },
];
const RAPIDE = ["constats","diagnostic","obj_op","actions","miseoeuvre","evaluation"];
const STATUTS = { brouillon:{l:"Brouillon",c:"#8b94a3"}, construction:{l:"En construction",c:"#2f6cd6"}, valide:{l:"Validé",c:"#0f8a76"}, archive:{l:"Archivé",c:"#9a6b16"} };
const PST = { todo:{l:"À faire",c:"#8b94a3"}, doing:{l:"En cours",c:"#2f6cd6"}, done:{l:"Fait",c:"#0f8a76"} };
const TYPES = [
  {id:"peda", l:"Pédagogique / élèves", pub:"l'élève"}, {id:"vie", l:"Vie scolaire", pub:"l'élève"},
  {id:"familles", l:"Familles / café des parents", pub:"les familles"},
  {id:"prevention", l:"Prévention", pub:"le public"}, {id:"accomp", l:"Accompagnement", pub:"la personne accompagnée"},
  {id:"evenement", l:"Événement", pub:"le participant"}, {id:"partenariat", l:"Partenariat", pub:"le partenaire"},
  {id:"administratif", l:"Administratif / organisation", pub:"le public concerné"}, {id:"etablissement", l:"Projet d'établissement", pub:"le public concerné"}, {id:"autre", l:"Autre", pub:"le public concerné"},
];
const ROLES = ["Prof", "Prof PSE", "Prof principal", "Enseignant pro", "CPE", "DDFPT", "Infirmier·ère", "PsyEN", "AESH / Coordo ULIS", "Direction", "Documentaliste", "Autre"];
const MODELES = [
  { t:"Projet vierge", titre:"", ctx:"", type:"peda" },
  { t:"Action de prévention", titre:"Action de prévention — ", ctx:"Public concerné, thème (santé, sécurité, conduites à risque…), besoin observé.", type:"prevention" },
  { t:"Projet de classe / sortie", titre:"Projet de classe — ", ctx:"Classe(s) concernée(s), nature du projet (sortie, voyage, production…), intention visée.", type:"peda" },
  { t:"Projet citoyen / vie scolaire", titre:"Projet citoyen — ", ctx:"Public, dimension citoyenne ou de vie scolaire (entraide, médiation, engagement…), besoin.", type:"vie" },
  { t:"Café des parents / familles", titre:"Café des parents — ", ctx:"Familles visées, thème (orientation, écrans, sommeil, scolarité…), besoin observé, format convivial d'échange.", type:"familles" },
  { t:"Dispositif d'accompagnement", titre:"Dispositif d'accompagnement — ", ctx:"Public, type d'accompagnement (accrochage, tutorat, espace ressource…), besoin.", type:"accomp" },
  { t:"Événement / organisation", titre:"", ctx:"Nature de l'événement ou de l'organisation, public visé, objectif.", type:"evenement" },
  { t:"Projet d'établissement", titre:"Axe du projet d'établissement", ctx:"Contribution d'équipe à un axe : état des lieux, priorités, actions.", type:"etablissement" },
];
const PALETTE = ["#534ab7","#0f6e56","#993c1d","#185fa5","#9a5f0a","#993556","#3c6e3c","#5a6b8c"];
const colorFor = s => PALETTE[[...String(s||"?")].reduce((a,c)=>a+c.charCodeAt(0),0) % PALETTE.length];

const VAGUE = { "savoir":"énumérer, lister, nommer", "comprendre":"expliquer, reformuler, interpréter", "connaitre":"citer, définir, identifier", "apprecier":"comparer, classer, évaluer", "maitriser":"réaliser, exécuter, démontrer", "se sensibiliser":"repérer, détecter, analyser", "sensibiliser":"repérer, détecter, analyser", "prendre conscience":"décrire, distinguer, expliquer", "etre conscient":"décrire, signaler, recenser", "ameliorer":"un verbe d'action observable", "favoriser":"un verbe d'action observable", "developper":"un verbe d'action observable", "apprehender":"identifier, analyser, expliquer" };
const CONCEPTS = {
  constats:{ quoi:"Un fait observable et vérifiable d'une situation réelle, énoncé avant toute interprétation.", dist:["Un constat n'est pas un jugement","Le constat décrit un comportement précis ; le jugement qualifie la personne (« immature »). On reste sur le factuel."], ex:"Ex. « Lors des deux dernières séances de TP, plusieurs élèves n'ont pas porté l'équipement de sécurité » — un fait, pas « ils sont négligents »." },
  diagnostic:{ quoi:"L'interprétation des constats : de quoi sont-ils le signe, quels mécanismes sont en jeu.", dist:["Le diagnostic n'est pas le constat","Le constat décrit ; le diagnostic comprend le « pourquoi »."], ex:"Ex. constat : peu de participation à un dispositif. Diagnostic : l'information a mal circulé et l'intérêt n'a pas été perçu — pas « ils ne sont pas motivés »." },
  problematique:{ quoi:"La question centrale, précise et traitable, que le projet prend en charge — et ce qu'il ne traitera pas.", dist:["Une problématique n'est pas une solution","« Comment amener à… ? » est une question ; « organiser une journée prévention » est déjà une réponse."], ex:"Ex. « Comment amener le public à adopter des gestes de prévention au-delà du temps de cours ? »" },
  finalite:{ quoi:"Le sens large, la direction visée. Non mesurable : c'est l'horizon du projet.", dist:["La finalité n'est pas l'objectif général","La finalité donne le cap ; l'objectif dit ce que «PUB» saura faire."], ex:"Ex. « Développer l'autonomie et la responsabilité »." },
  obj_general:{ quoi:"La capacité globale visée chez «PUB» — concrète, formulée de son côté (« être capable de… »).", dist:["L'objectif général n'est pas la finalité","Il se formule côté «PUB», pas côté intention de l'équipe."], ex:"Ex. « Être capable d'organiser et de mener à bien un projet collectif simple »." },
  obj_op:{ quoi:"Un objectif observable et vérifiable. Méthode Mager : dans certaines conditions, «PUB» sera capable d'une performance (verbe d'action), à un niveau donné (critère).", dist:["Un objectif n'est pas une description de cours","Il décrit ce que «PUB» fait avec un verbe observable — pas ce que l'animateur présente."], ex:"Ex. « À partir d'un modèle, «PUB» rédige le programme d'une action en indiquant l'objectif, les étapes et le matériel. »", formule:"[Conditions] + «PUB» sera capable de [Performance] + [Critère]", verbes:[["Connaître","citer, nommer, lister, définir, identifier"],["Comprendre","expliquer, reformuler, illustrer, résumer"],["Appliquer","utiliser, réaliser, exécuter, résoudre, mesurer"],["Analyser","comparer, distinguer, relier, différencier"],["Évaluer","juger, argumenter, justifier, vérifier"],["Créer","concevoir, élaborer, proposer, planifier"]], src:"D'après R. Mager & la taxonomie de Bloom." },
  actions:{ quoi:"Ce qu'on met concrètement en place pour atteindre un objectif.", dist:["Une action n'est pas un objectif","L'objectif est le résultat visé ; l'action est le moyen d'y parvenir."], ex:"Ex. selon le projet : un atelier, une production, une rencontre, une campagne, une sortie…" },
  moyens:{ quoi:"Les ressources mobilisées : humaines, matérielles, partenaires, temps.", dist:["Un moyen n'est pas une action","Le moyen rend l'action possible (une salle, un partenaire) ; l'action est ce qu'on fait."], ex:"Ex. un référent, un partenaire extérieur, une salle, du matériel, un budget, un créneau." },
  miseoeuvre:{ quoi:"Le cadrage opérationnel : où, quand, combien de temps, à quelle fréquence, avec quelles échéances.", dist:["La mise en œuvre n'est pas les moyens","Les moyens : avec quoi. La mise en œuvre : où et quand."], ex:"Ex. 4 séances d'1 h entre janvier et mars, en salle multimédia, avec un bilan à mi-parcours." },
  cadre:{ quoi:"Les limites explicites du projet : ce qu'il ne fait pas.", dist:["Le cadre n'est pas les moyens","Le cadre dit ce qu'on s'interdit, pour protéger l'intention du projet."], ex:"Ex. selon le projet : ce qui reste hors champ, ce qui est volontaire, ce qui n'est pas évalué." },
  indicateurs:{ quoi:"Un signe observable ou mesurable qui renseigne sur l'atteinte d'un objectif.", dist:["Un indicateur n'est pas un objectif","L'objectif est le but ; l'indicateur est la trace qui permet de le suivre."], ex:"Ex. taux de participation, nombre de productions réalisées, retours du public." },
  evaluation:{ quoi:"Apprécier le projet sur trois niveaux : l'activité (a-t-elle eu lieu ?), les résultats immédiats, les effets.", dist:["Évaluer n'est pas juger","On apprécie à partir d'indicateurs et de bilans, pas d'impressions."], ex:"Ex. l'action a-t-elle eu lieu comme prévu ? qu'a-t-on produit ou appris ? quels effets observés ?" },
  vigilance:{ quoi:"Les risques anticipés qui pourraient détourner le projet de son intention.", dist:["La vigilance n'est pas le cadre","Le cadre pose des limites ; la vigilance surveille les dérives possibles."], ex:"Ex. un projet trop ambitieux pour le temps disponible, une participation qui retombe, des objectifs flous." },
};

/* ---------- État ---------- */
const params = new URLSearchParams(location.search);
const RO = params.get("ro")==="1";
const DEV = (()=>{ let d=localStorage.getItem("projets_dev"); if(!d){ d=(self.crypto&&crypto.randomUUID)?crypto.randomUUID():"d"+Date.now()+Math.random().toString(36).slice(2); localStorage.setItem("projets_dev",d);} return d; })();
let ident = JSON.parse(localStorage.getItem("projets_ident_v1") || "null");
let mine = new Set(JSON.parse(localStorage.getItem("projets_mine_v1") || "[]"));
let view = "liste";
let projets = [], projet = null, contribs = [], etapeIdx = 0;
let unsub = null, unsubP = null, unsubPres = null, hb = null, presence = [];
let regroup = false, selected = new Set();
let fbError = false;

const $ = s => document.querySelector(s);
const esc = v => String(v ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
const norm = s => String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
function toast(m,ok){const t=$("#toast");t.textContent=m;t.className="toast show"+(ok?" ok":"");setTimeout(()=>t.classList.remove("show"),2200);}
const saved = ()=>toast("Enregistré",true);
function saveMine(){localStorage.setItem("projets_mine_v1",JSON.stringify([...mine]));}
const avatar = (ini,cls="",color="")=>`<span class="ava ${cls}" style="background:${color||colorFor(ini)}">${esc((ini||"?").slice(0,3))}</span>`;
const active = c=>!c.ecarte;
const sortC = arr => arr.slice().sort((a,b)=>{ const pa=typeof a.pos==="number"?a.pos:Infinity, pb=typeof b.pos==="number"?b.pos:Infinity; if(pa!==pb) return pa-pb; return (b.epingle?1:0)-(a.epingle?1:0) || (a._t)-(b._t); });
const ofEt = id => sortC(contribs.filter(c=>c.etape===id && active(c)));
const ofEtAll = id => sortC(contribs.filter(c=>c.etape===id));
const splitLines = t => String(t==null?"":t).split("\n").map(s=>s.trim()).filter(Boolean);
function keptItems(eid){ const out=[]; ofEt(eid).forEach(c=>{ const lines=splitLines(c.texte); if(lines.length<=1){ if(c.epingle) out.push(c.texte); } else { const lr=Array.isArray(c.lr)?c.lr:[]; lines.forEach((ln,i)=>{ if(lr.includes(i)) out.push(ln); }); } }); return out; }
function allItems(eid){ const out=[]; ofEt(eid).forEach(c=>splitLines(c.texte).forEach(ln=>out.push(ln))); return out; }
const showItems = eid => { const k=keptItems(eid); return k.length?k:allItems(eid); };
const isLocked = id => (projet?.locked||[]).includes(id);
const base = location.origin + location.pathname;
const pub = () => projet?.type==="perso" ? (projet?.typePub||"le public concerné") : ((TYPES.find(t=>t.id===projet?.type)||{}).pub || "l'élève");
const typeLabel = () => projet?.type==="perso" ? (projet?.typeCustom||"Personnalisé") : (TYPES.find(t=>t.id===projet?.type)||{}).l;
const nomEt = e => (e && projet?.etapeNoms && projet.etapeNoms[e.id]) || (e ? e.nom : "");
const T = s => String(s==null?"":s).split("«PUB»").join(pub());
const phaseOf = refId => PHASES.find(p=>p.etapes.includes(refId));
function projTrame(){
  const t=projet?.trame; if(Array.isArray(t)&&t.length) return t;
  const en=projet?.enabled; const ids=(Array.isArray(en)&&en.length)?en:(projet?.mode==="rapide"?RAPIDE:ETAPES.map(e=>e.id));
  return ETAPES.filter(e=>ids.includes(e.id)).map(e=>({ref:e.id}));
}
function STEPS(){
  const noms=projet?.etapeNoms||{};
  return projTrame().map(s=>{
    if(s.ref){ const b=ETM[s.ref]; if(!b) return null; const ph=phaseOf(b.id)||{}; return {id:b.id, ref:b.id, nom:noms[b.id]||b.nom, icon:b.icon, q:b.q, def:b.def, aide:b.aide, c:ph.c||"var(--accent)", phaseNom:ph.nom||"", custom:false}; }
    const ph=s.phase?(PHASES.find(p=>p.nom===s.phase)||{}):{};
    return {id:s.id, ref:null, nom:s.nom||"Étape libre", icon:s.icon||"folder", q:s.q||"Qu'est-ce qu'on note à cette étape ?", def:s.def||"Une étape libre, ajoutée à votre projet.", aide:s.aide||"", c:ph.c||"#64748b", phaseNom:ph.nom||"Sur-mesure", custom:true};
  }).filter(Boolean);
}
const stepAt = i => STEPS()[i];
const stepById = id => STEPS().find(s=>s.id===id);
const labelEt = id => { const s=stepById(id); if(s) return s.nom; const b=ETM[id]; return b?((projet?.etapeNoms&&projet.etapeNoms[id])||b.nom):(id||""); };
const visIdx = () => STEPS().map((_,i)=>i);
const REPERES = [ {k:"periode",l:"Période",ph:"ex. janvier → mars"}, {k:"debut",l:"Début",t:"date"}, {k:"fin",l:"Fin",t:"date"}, {k:"frequence",l:"Fréquence",ph:"ex. 1 fois / semaine"}, {k:"lieu",l:"Lieu",ph:"ex. salle B12"}, {k:"nbBenef",l:"Bénéficiaires",ph:"nombre",t:"number"}, {k:"nbEnc",l:"Encadrants",ph:"nombre",t:"number"} ];
const REP_SUGG = [
  {l:"Période", icon:"calendar", list:["1er trimestre","2e trimestre","3e trimestre","Année scolaire"]},
  {l:"Durée", icon:"clock", list:["Ponctuel (1 séance)","Quelques semaines","Un trimestre","Toute l'année"]},
  {l:"Fréquence", icon:"sync", list:["Ponctuel","Hebdomadaire","Bimensuel","Mensuel"]},
  {l:"Lieu", icon:"pin"},
  {l:"Bénéficiaires", icon:"users"},
  {l:"Encadrants", icon:"user"},
  {l:"Niveau / classe", icon:"checklist", list:["CAP","2nde Bac Pro","1re Bac Pro","Tle Bac Pro","Tous niveaux"]},
  {l:"Budget", icon:"euro"},
  {l:"Financement", icon:"euro", list:["Établissement","Région","Projet spécifique","Partenaire","Fonds social","Aucun"]},
  {l:"Partenaires", icon:"users"},
];
const REP_OLD_ICON = { periode:"calendar", debut:"calendar", fin:"calendar", frequence:"sync", lieu:"pin", nbBenef:"users", nbEnc:"user" };
function curReperes(){
  const r=projet?.reperes;
  if(Array.isArray(r)) return r.map(it=>({...it}));
  if(r && typeof r==="object") return REPERES.filter(f=>r[f.k]).map(f=>({id:f.k, label:f.l, value:String(r[f.k]), icon:REP_OLD_ICON[f.k]||"info"}));
  return [];
}
const RTYPES = [ {id:"lien",l:"Lien web",icon:"link",c:"#2f6cd6"}, {id:"doc",l:"Document partagé",icon:"file",c:"#0f8a76"}, {id:"ref",l:"Texte officiel / référence",icon:"book",c:"#6b4bd6"}, {id:"idee",l:"Exemple / inspiration",icon:"bulb",c:"#c77f1a"}, {id:"contact",l:"Contact / partenaire",icon:"user",c:"#c0392b"} ];
const RTM = Object.fromEntries(RTYPES.map(t=>[t.id,t]));
const curRes = () => Array.isArray(projet?.ressources) ? projet.ressources.slice() : [];

function nudge(etapeId, txt){
  const t = norm(txt).trim(); if(!t) return null;
  if(etapeId==="constats"){ const jug=["immature","ingerable","faineant","paresseux","ne veulent rien","nul ","betes","insupportable","penible"]; if(jug.some(w=>t.includes(w))) return "Cela ressemble à un jugement. Décrivez plutôt un comportement observable."; }
  if(etapeId==="problematique"){ if(/^(creer|mettre en place|installer|ouvrir|monter|faire) (une|un|le|la|des|l')/.test(t)) return "Cela ressemble à une solution, pas à une problématique. Reformulez en question (« Comment… ? »)."; if(!txt.includes("?")) return "Une problématique se formule en question — pensez au « ? »."; }
  if(etapeId==="obj_op"){ for(const v of Object.keys(VAGUE)){ if(t.includes(v)) return `« ${v} » est trop vague pour un objectif — préférez : ${VAGUE[v]}.`; } }
  return null;
}
function synthese(){
  const pick = id => { const its=ofEt(id); return (its.find(c=>c.epingle)||its[0])?.texte; };
  const low = s => s ? s.replace(/\.$/,"").trim().replace(/^[A-ZÀ-Ý]/, m=>m.toLowerCase()) : "";
  const cons = ofEt("constats").slice(0,3).map(c=>low(c.texte));
  const diag=pick("diagnostic"), prob=pick("problematique"), og=pick("obj_general")||pick("finalite");
  const act=ofEt("actions").map(c=>low(c.texte)), ind=ofEt("indicateurs").map(c=>low(c.texte));
  const p=[];
  if(cons.length) p.push(`Nous observons que ${cons.join(" ; ")}.`);
  if(diag) p.push(`Nous comprenons que ${low(diag)}.`);
  if(prob) p.push(`Notre question : ${prob.replace(/\?*$/,"")} ?`);
  if(og) p.push(`Objectif : «PUB» sera capable de ${low(og)}.`);
  if(act.length) p.push(`Nous proposons donc : ${act.join(", ")}.`);
  if(ind.length) p.push(`Nous vérifierons à partir de : ${ind.join(", ")}.`);
  return T(p.join(" "));
}

/* ---------- Présence ---------- */
function onlineNow(){ const cut=Date.now()-45000; return presence.filter(p=>(p.lastSeen||0)>cut); }
function beat(){ if(!ident||RO||!projet) return; const etId=(view==="etape")?(stepAt(etapeIdx)?.id||view):view; setDoc(doc(db,COL,projet.id,"presence",DEV),{initiales:ident.initiales,role:ident.role,color:ident.color||"",etape:etId,lastSeen:Date.now()},{merge:true}).catch(()=>{}); }
function startPresence(id){ if(unsubPres){unsubPres();unsubPres=null;} presence=[]; try{ unsubPres=onSnapshot(collection(db,COL,id,"presence"),snap=>{ presence=snap.docs.map(d=>({id:d.id,...d.data()})); const el=$("#onlineInline"); if(el) el.innerHTML=onlineStrip(); }); }catch(_){} beat(); if(hb)clearInterval(hb); hb=setInterval(beat,20000); }
function stopPresence(){ if(hb){clearInterval(hb);hb=null;} if(unsubPres){unsubPres();unsubPres=null;} if(projet&&ident&&!RO){ deleteDoc(doc(db,COL,projet.id,"presence",DEV)).catch(()=>{}); } presence=[]; }
function onlineStrip(){ const on=onlineNow(); if(!on.length) return ""; return `<div class="online"><span class="muted" style="font-size:12px">${ic("users")} En ligne</span><div class="ava-row">${on.slice(0,8).map(p=>`<span title="${esc(p.role||"")} · ${esc(ETM[p.etape]?.nom||"")}">${avatar(p.initiales,"sm",p.color)}</span>`).join("")}${on.length>8?`<span class="ava sm" style="background:var(--faint)">+${on.length-8}</span>`:""}</div></div>`; }

/* ---------- Render ---------- */
function render(){
  const drafts={}; document.querySelectorAll("[data-keep]").forEach(el=>drafts[el.id]=el.value);
  const focusId = document.activeElement && document.activeElement.dataset && document.activeElement.dataset.keep!==undefined ? document.activeElement.id : null;
  const inProj = projet && view!=="liste";
  $("#backLabel").textContent = view==="liste" ? "Portail" : (view==="overview"?"Projets":"Projet");
  $("#title").textContent = inProj ? projet.titre : "Atelier projet";
  $("#subtitle").textContent = inProj ? ({overview:"Vue d'ensemble",fiche:"Fiche projet",matrice:"Alignement",plan:"Plan d'action",presentation:"Présentation"}[view]||stepAt(etapeIdx)?.nom) : "Construire à plusieurs mains";
  const ib=$("#identBtn"); if(ident && !RO){ ib.hidden=false; ib.innerHTML=`${ic("user")} ${esc(ident.initiales)}`; } else ib.hidden=true;
  const fb=$("#ficheBtn"); fb.hidden = !(inProj && view!=="fiche"); fb.innerHTML=`${ic("file")} Fiche`;
  const showBar = inProj && view!=="overview" && view!=="presentation";
  $("#etapebar").hidden = !showBar; if(showBar) renderEtapeBar();
  const map = { liste:viewListe, overview:viewOverview, etape:viewEtape, fiche:viewFiche, matrice:viewMatrice, plan:viewPlan, presentation:viewPresentation };
  $("#view").innerHTML = (map[view]||viewListe)();
  document.querySelectorAll("[data-keep]").forEach(el=>{ if(drafts[el.id]!==undefined) el.value=drafts[el.id]; });
  if(focusId){ const el=document.getElementById(focusId); if(el){ el.focus(); try{el.selectionStart=el.selectionEnd=el.value.length;}catch(_){} } }
  if(view!=="etape") window.scrollTo&&window.scrollTo(0,0);
}
function renderEtapeBar(){
  const filled = new Set(contribs.filter(active).map(c=>c.etape));
  $("#etapebar").innerHTML = `<button class="estep" data-overview>${ic("grid")}Vue d'ensemble</button>` +
    STEPS().map((e,i)=>`<button class="estep ${view==="etape"&&i===etapeIdx?"active":""}" data-etape="${i}">${ic(e.icon)}${esc(e.nom)}${isLocked(e.id)?ic("lock"):(filled.has(e.id)?'<span class="dot"></span>':"")}</button>`).join("") +
    `<button class="estep ${view==="plan"?"active":""}" data-plan>${ic("table")}Plan d'action</button>` +
    `<button class="estep ${view==="matrice"?"active":""}" data-matrice>${ic("columns")}Alignement</button>` +
    `<button class="estep fiche ${view==="fiche"?"active":""}" data-fiche>${ic("file")}Fiche</button>`;
}

function viewListe(){
  const idCard = RO ? "" : (ident
    ? `<div class="card ident-card"><span class="ident-ava" style="background:${ident.color||colorFor(ident.initiales)};color:#fff">${esc(ident.initiales.slice(0,3))}</span><div class="ic-tx"><strong>${esc(ident.initiales)}</strong><small>${esc(ident.role)}</small></div><button class="btn-mini" data-ident>Modifier</button></div>`
    : `<button class="card ident-card" data-ident style="width:100%;cursor:pointer"><span class="ident-ava">${ic("user")}</span><div class="ic-tx" style="text-align:left"><strong>Qui êtes-vous ?</strong><small>Initiales + rôle (RGPD : pas de nom)</small></div><span class="btn-mini">Définir</span></button>`);
  const banner = fbError ? `<div class="banner">${ic("alert")}<span><b>Activation Firestore requise.</b> Publiez les règles de <code>coordination_projets</code>.</span></div>` : "";
  const list = projets.length ? `<div class="proj-list">${projets.map(p=>{const denom=(Array.isArray(p.trame)&&p.trame.length)?p.trame.length:ETAPES.length;const mat=Math.round((p._etapes/Math.max(denom,1))*100);const st=STATUTS[p.statut]||STATUTS.brouillon;const ty=TYPES.find(t=>t.id===p.type);
    return `<button class="proj-card" data-open="${esc(p.id)}" style="--rc:${st.c}"><div class="pc-ring" style="--p:${mat}"><span>${mat}%</span></div><div class="pc-body"><div class="pc-top"><h3>${esc(p.titre)}</h3><span class="st-tag" style="--sc:${st.c}">${st.l}</span></div><p class="pc-sum">${p.contexte?esc(p.contexte):`<span class="muted">Sans description pour l'instant.</span>`}</p><div class="proj-meta">${ty?`<span class="ty-tag">${esc(ty.l)}</span>`:(p.type==="perso"&&p.typeCustom?`<span class="ty-tag">${esc(p.typeCustom)}</span>`:"")}<span class="pc-m">${ic("grid")} ${denom} étapes</span><span class="pc-m">${ic("users")} ${p._contribs}</span></div></div><span class="pc-go">${ic("chev")}</span></button>`;}).join("")}</div>`
    : `<div class="empty">Aucun projet pour l'instant.${RO?"":" Créez le premier ci-dessous."}</div>`;
  return `${banner}<div class="hero"><h1>Atelier projet</h1><p>Construisez un projet d'équipe à plusieurs mains, étape par étape.</p></div>${idCard?`<div class="sec-title">${ic("user")} Votre identité</div>${idCard}`:""}<div class="sec-title">${ic("folder")} Les projets</div>${list}${RO?"":`<button class="new-proj" data-new style="margin-top:12px">${ic("plus")} Nouveau projet</button><div class="liste-foot"><button class="lnk" id="impJson">${ic("file")} Importer un projet (JSON)</button></div>`}`;
}

function resRowHTML(r){
  const t=RTM[r.type]||RTYPES[0]; const et=ETM[r.etape];
  const titleTxt=esc(r.titre||r.url||"Sans titre");
  const title=r.url?`<a class="res-title" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${titleTxt} ${ic("external")}</a>`:`<span class="res-title plain">${titleTxt}</span>`;
  const todo=r.todo?`<button class="res-todo ${r.done?'done':''}" ${RO?'disabled':`data-res-todo="${r.id}"`}>${r.done?ic("check")+" Fait":"À traiter"}</button>`:"";
  const acts=RO?"":`<button class="res-act" data-res-edit="${r.id}" aria-label="Modifier">${ic("pencil")}</button><button class="res-act" data-res-del="${r.id}" aria-label="Supprimer">${ic("trash")}</button>`;
  return `<div class="res-row ${r.done?'res-done':''}"><span class="res-ico" style="--rc:${t.c}">${ic(t.icon)}</span><div class="res-main">${title}${r.note?`<div class="res-note">${esc(r.note)}</div>`:""}<div class="res-tags">${r.etape?`<span class="res-etape">${esc(labelEt(r.etape))}</span>`:""}${r.initiales?`<span class="res-by">${esc(r.initiales)}</span>`:""}${todo}</div></div><div class="res-side">${acts}</div></div>`;
}
function resCard(){
  const list=curRes();
  const rows=list.length?list.map(resRowHTML).join(""):`<p class="muted" style="font-size:13px;margin:8px 0 0">Liens, documents, références, contacts utiles… déposés par l'équipe.</p>`;
  return `<div class="card res-card"><div class="rep-h">${ic("clip")} <b>Ressources du projet</b>${list.length?`<span class="res-count">${list.length}</span>`:""}${RO?"":`<button class="btn-mini" data-res-add="" style="margin-left:auto">${ic("plus")} Ajouter</button>`}</div><div class="res-list">${rows}</div>${list.length?`<div class="res-rgpd">${ic("shield")} Pas de lien contenant des données nominatives d'élèves — visible par toute l'équipe.</div>`:""}</div>`;
}
function resStrip(etapeId){
  const list=curRes().filter(r=>r.etape===etapeId);
  if(!list.length&&RO) return "";
  return `<div class="res-strip"><div class="res-strip-h">${ic("clip")} Ressources utiles ici${RO?"":`<button class="btn-mini" data-res-add="${etapeId}" style="margin-left:auto">${ic("plus")} Ajouter</button>`}</div>${list.length?`<div class="res-list">${list.map(resRowHTML).join("")}</div>`:`<p class="muted" style="font-size:12.5px;margin:7px 0 0">Aucune ressource liée à cette étape pour l'instant.</p>`}</div>`;
}
function fmtDate(d){ if(!d) return "—"; try{ return new Date(d+"T00:00:00").toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short",year:"numeric"}); }catch(_){ return d; } }
function jalonsCard(){
  const list=(projet.jalons||[]).slice().sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")));
  const items=list.map(j=>`<div class="jal-row"><span class="jal-date">${esc(fmtDate(j.date))}</span><span class="jal-label">${esc(j.label||"")}</span>${RO?"":`<button class="res-act" data-jal-del="${j.id}" aria-label="Supprimer">${ic("trash")}</button>`}</div>`).join("");
  return `<div class="card jal-card"><div class="rep-h">${ic("calendar")} <b>Calendrier du projet</b>${list.length?`<span class="res-count">${list.length}</span>`:""}${RO?"":`<button class="btn-mini" data-jal-add style="margin-left:auto">${ic("plus")} Date</button>`}</div>${list.length?`<div class="jal-list">${items}</div>`:`<p class="muted" style="font-size:13px;margin:8px 0 0">Réunion de lancement, séances, bilan… les dates clés du projet.</p>`}${RO?"":`<a class="jal-poll" href="../reunions/" target="_blank" rel="noopener">${ic("users")} Trouver une date ensemble (sondage) ${ic("external")}</a>`}</div>`;
}
function reperesCard(){
  const items=curReperes().filter(it=>String(it.value||"").trim()!=="");
  const grid=items.map(it=>`<div class="rp-it"><span class="rp-l">${ic(it.icon||"info")} ${esc(it.label)}</span><span class="rp-v">${esc(it.value)}</span></div>`).join("");
  return `<div class="card rep-card"><div class="rep-h">${ic("calendar")} <b>Repères du projet</b>${RO?"":`<button class="btn-mini" data-reperes style="margin-left:auto">${items.length?"Modifier":"Renseigner"}</button>`}</div>${items.length?`<div class="rp-grid">${grid}</div>`:`<p class="muted" style="font-size:13px;margin:8px 0 0">Période, durée, lieu, bénéficiaires, budget, partenaires…</p>`}</div>`;
}
function tlTimeline(){
  const S=STEPS(); const cnt=id=>contribs.filter(c=>c.etape===id&&active(c)).length;
  const firstTodo=S.findIndex(s=>!cnt(s.id));
  const ph={}; S.forEach(s=>{ const k=s.phaseNom||""; (ph[k]=ph[k]||{t:0,d:0}); ph[k].t++; if(cnt(s.id)) ph[k].d++; });
  let lastPhase=null, html="";
  S.forEach((e,i)=>{ const n=cnt(e.id); const done=n>0; const isNext=i===firstTodo; const last=i===S.length-1; const lock=isLocked(e.id);
    const nextDone = !last && cnt(S[i+1].id)>0; const rdy=((projet.pret||{})[e.id]||[]).length;
    if(e.phaseNom!==lastPhase){ const p=ph[e.phaseNom||""]; const pc=Math.round(p.d/Math.max(p.t,1)*100); html+=`<div class="tl-phase" style="--pc:${e.c}"><span class="tlp-n">${esc(e.phaseNom)}</span><span class="tlp-bar"><i style="width:${pc}%"></i></span><span class="tlp-ct">${p.d}/${p.t}</span></div>`; lastPhase=e.phaseNom; }
    html+=`<button class="tl-item ${done?"done":""} ${isNext?"next":""}" style="--pc:${e.c}" data-etape="${i}"><span class="tl-rail"><span class="tl-dot">${done?ic("check"):""}</span>${last?"":`<span class="tl-line ${done&&nextDone?"on":""}"></span>`}</span><span class="tl-body"><span class="tl-ic">${ic(e.icon)}</span><span class="tl-n">${esc(e.nom)}</span>${rdy?`<span class="tl-rdy" title="${rdy} a/ont terminé">${ic("check")} ${rdy}</span>`:""}${lock?`<span class="tl-lock">${ic("lock")}</span>`:n?`<span class="tl-ct">${n}</span>`:isNext?`<span class="tl-next">à faire</span>`:""}</span></button>`; });
  return `<div class="tl">${html}</div>`;
}
function viewOverview(){
  const S=STEPS(); const visSet=new Set(S.map(s=>s.id));
  const done=new Set(contribs.filter(active).map(c=>c.etape).filter(id=>visSet.has(id))).size;
  const pct=Math.round(done/Math.max(S.length,1)*100);
  const st=STATUTS[projet.statut]||STATUTS.brouillon; const ty=TYPES.find(t=>t.id===projet.type);
  const firstTodo=S.findIndex(s=>!contribs.some(c=>c.etape===s.id && active(c)));
  const stRow = RO ? `<span class="st-tag" style="--sc:${st.c}">${st.l}</span>${typeLabel()?`<span class="ty-tag">${esc(typeLabel())}</span>`:""}` :
    `<div class="st-block"><div class="st-lab">Où en est le projet ?</div><div class="st-row">${Object.entries(STATUTS).map(([k,v])=>`<button class="st-pick ${projet.statut===k||(!projet.statut&&k==="brouillon")?"on":""}" style="--sc:${v.c}" data-statut="${k}">${v.l}</button>`).join("")}</div></div>
     <div class="st-block"><div class="st-lab">Type de projet <span class="st-hint">— adapte le vocabulaire, modifiable à tout moment</span></div><div class="st-row">${TYPES.map(t=>`<button class="ty-pick ${projet.type===t.id||(!projet.type&&t.id==="peda")?"on":""}" data-type="${t.id}">${esc(t.l)}</button>`).join("")}<button class="ty-pick ${projet.type==="perso"?"on":""}" data-type-custom>${ic("pencil")} ${projet.type==="perso"&&projet.typeCustom?esc(projet.typeCustom):"Autre type…"}</button></div></div>`;
  const syn=synthese();
  return `<div id="onlineInline">${onlineStrip()}</div>
    <div class="ov-hero"><div class="ovh-top"><div class="ov-ring" style="--p:${pct}"><span>${pct}%</span></div><div class="ovh-tx"><div class="ovh-eyebrow">${ic("folder")} Projet d'équipe</div><h1 class="ov-titre">${esc(projet.titre)}</h1>${projet.contexte?`<div class="ov-ctx">${esc(projet.contexte)}</div>`:""}</div></div><div class="ovh-pilote">${projet.pilote?`<span class="opx-lab">${ic("compass")} Pilote</span><span class="opx">${avatar(projet.pilote.ini,"sm",projet.pilote.color)}<b>${esc(projet.pilote.ini)}</b> · ${esc(projet.pilote.role)}</span>${RO?"":`<button class="lnk-mini" data-pilote>${ident&&projet.pilote.ini===ident.initiales?"Me retirer":"Reprendre"}</button>`}`:`<span class="opx-lab">${ic("compass")} Pilote</span><span class="opx-none">à définir — qui mène ce projet ?</span>${RO?"":`<button class="btn-mini" data-pilote-take>${ic("user")} Se proposer</button>`}`}</div><div class="ovh-tags">${stRow}</div></div>
    ${projet.statut==="valide"?`<button class="ov-valid" data-presentation>${ic("check")}<span><b>Projet validé</b> — voir la présentation</span>${ic("chev")}</button>`:""}
    ${done===0&&!RO?`<div class="ov-welcome">${ic("wand")}<div><b>Bienvenue dans votre projet</b><p>Avancez <b>étape par étape, à plusieurs</b> : chacun ajoute ses idées, la plus juste est « retenue », et la fiche se compose toute seule. Les étapes sont <b>modulables</b> (bouton « modifier » plus bas). Commencez par ${esc(S[0]?S[0].nom:"la première étape")} ci-dessous.</p></div></div>`:""}
    ${firstTodo>=0&&!RO?`<button class="btn primary big" data-etape="${firstTodo}">${ic("bolt")} Continuer : ${esc(S[firstTodo].nom)}</button>`:""}
    <div class="sec-title">${ic("grid")} Le parcours du projet${RO?"":`<button class="btn-mini" data-perso style="margin-left:auto">${ic("sync")} ${S.length} étape(s) · modifier</button>`}</div>
    ${tlTimeline()}
    ${syn?`<div class="sec-title">${ic("wand")} Synthèse automatique</div><div class="card syn-card">${esc(syn)}</div>`:""}
    <div class="sec-title">${ic("clip")} Les outils du projet</div>
    ${reperesCard()}
    ${jalonsCard()}
    ${resCard()}
    <div class="fiche-actions" style="margin-top:16px"><button class="btn accent" data-presentation>${ic("eye")} Présentation</button><button class="btn" data-plan>${ic("table")} Plan d'action</button><button class="btn" data-matrice>${ic("columns")} Alignement</button><button class="btn" data-fiche>${ic("file")} Fiche</button>${RO?"":`<button class="btn" id="share">${ic("send")} Partager (lecture)</button>`}</div>
    <div class="ov-foot">${RO?"":`<button class="lnk" id="expJson">${ic("file")} Sauvegarder ce projet (JSON)</button><button class="lnk danger" id="delProj">${ic("trash")} Supprimer ce projet</button>`}</div>`;
}

function viewEtape(){
  const S=STEPS(); if(!S.length) return viewOverview();
  if(etapeIdx>=S.length) etapeIdx=S.length-1; if(etapeIdx<0) etapeIdx=0;
  const e=S[etapeIdx]; const list=ofEt(e.id); const ecartees=sortC(contribs.filter(c=>c.etape===e.id&&!active(c))); const locked=isLocked(e.id);
  const isLink = e.id==="actions"||e.id==="indicateurs"; const objs=ofEt("obj_op");
  const pc=e.c||"#6a5cff";
  const curPhase=PHASES.findIndex(p=>p.etapes.includes(e.id));
  const journey=`<div class="ev-journey">${PHASES.map((p,i)=>{const st=curPhase<0?"":i<curPhase?"done":i===curPhase?"on":"";return `<div class="ev-ph ${st}" style="--pc:${p.c}"><span class="ev-phb">${st==="done"?ic("check"):i+1}</span><span class="ev-phn">${esc(p.nom)}</span></div>`;}).join("")}</div>`;
  const prevSteps=S.slice(0,etapeIdx); const recap=[];
  prevSteps.forEach(ps=>{ ofEt(ps.id).forEach(c=>{ const ls=splitLines(c.texte); if(ls.length<=1){ if(c.epingle) recap.push({t:c.texte,c:ps.c}); } else { const lr=Array.isArray(c.lr)?c.lr:[]; ls.forEach((ln,idx)=>{ if(lr.includes(idx)) recap.push({t:ln,c:ps.c}); }); } }); });
  const recapBlock = prevSteps.length ? `<div class="ev-recap"><div class="ev-recap-h">${ic("compass")} Ce qui est retenu jusqu'ici</div>${recap.length?`<div class="ev-recap-list">${recap.slice(-6).map(r=>`<div class="ev-rchip" style="--cc:${r.c||"#6a5cff"}"><span class="ev-rck">${ic("check")}</span><span>${esc(r.t)}</span></div>`).join("")}</div>`:`<div class="ev-recap-empty">Rien de retenu aux étapes précédentes — marquez les idées clés d'une ★.</div>`}</div>` : "";
  const card=(c,i)=>{ const coms=c.comments||[]; const sel=selected.has(c.id);
    const lines=splitLines(c.texte); const multi=lines.length>1; const lr=Array.isArray(c.lr)?c.lr:[];
    const votes=Array.isArray(c.votes)?c.votes:[]; const voted=votes.includes(DEV);
    const status=(c.epingle||(multi&&lr.length))?"keep":(c.precise?"prec":"");
    const tag=c.epingle?`<span class="ev-tag k">${ic("star")} Retenu</span>`:(multi&&lr.length?`<span class="ev-tag k">${ic("star")} ${lr.length} retenu${lr.length>1?"s":""}</span>`:(c.precise?`<span class="ev-tag p">${ic("pencil")} À préciser</span>`:`<span class="ev-tag n">Proposé</span>`));
    const linkSel = isLink && !regroup ? `<div class="ev-link">${ic("link")}<select data-link="${esc(c.id)}"><option value="">↳ Sert un objectif…</option>${objs.map(o=>`<option value="${esc(o.id)}" ${c.lien===o.id?"selected":""}>${esc(o.texte.slice(0,40))}</option>`).join("")}</select></div>` : "";
    const txt = multi
      ? `<div class="ev-tx lines">${lines.map((ln,idx)=>`<button class="ev-line ${lr.includes(idx)?"on":""}" ${(RO||regroup)?"disabled":`data-lr="${esc(c.id)}:${idx}"`}>${ic("star")}<span>${esc(ln)}</span></button>`).join("")}</div>`
      : `<div class="ev-tx">${esc(c.texte)}</div>`;
    const acts = RO ? (votes.length?`<span class="ev-rb static">${ic("check")} ${votes.length}</span>`:"") :
      `<button class="ev-rb ${voted?"on":""}" data-vote="${esc(c.id)}">${ic("check")} D'accord${votes.length?` · ${votes.length}`:""}</button>${multi?"":`<button class="ev-rb ${c.epingle?"on keep":""}" data-pin="${esc(c.id)}">${ic("star")} ${c.epingle?"Retenu":"Retenir"}</button>`}<button class="ev-rb ${c.precise?"on prec":""}" data-precise="${esc(c.id)}">${ic("pencil")} ${c.precise?"À préciser":"Préciser"}</button>`;
    const more = RO?"":`<span class="ev-more">${list.length>1?`<button class="ev-mini" data-cup="${esc(c.id)}" ${i===0?"disabled":""} aria-label="Monter">${ic("up")}</button><button class="ev-mini" data-cdown="${esc(c.id)}" ${i===list.length-1?"disabled":""} aria-label="Descendre">${ic("down")}</button>`:""}<button class="ev-mini" data-ecart="${esc(c.id)}" title="Écarter">${ic("ban")}</button>${mine.has(c.id)?`<button class="ev-mini" data-edit="${esc(c.id)}">${ic("pencil")}</button><button class="ev-mini" data-del="${esc(c.id)}">${ic("trash")}</button>`:""}</span>`;
    return `<article class="ev-card ${status} ${regroup?"selectable":""} ${sel?"sel":""}" ${regroup?`data-sel="${esc(c.id)}"`:""}>
      <div class="ev-ctop">${regroup?`<span class="ev-chk ${sel?"on":""}">${sel?ic("check"):""}</span>`:avatar(c.initiales,"",c.color)}<span class="ev-who"><b>${esc(c.role||"—")}</b> · ${esc(c.initiales||"")}${c.editedAt?" · modifié":""}</span>${tag}</div>
      ${txt}${linkSel}
      ${regroup?"":`<div class="ev-react">${acts}${more}</div><details class="ev-coms"><summary>${ic("comment")} Commentaires${coms.length?` · ${coms.length}`:""}</summary><div class="ev-com-list">${coms.map(k=>`<div class="ev-com"><b>${esc(k.role)}</b> · ${esc(k.ini)} : ${esc(k.txt)}</div>`).join("")}</div>${RO?"":`<div class="ev-com-add"><input data-keep id="com_${esc(c.id)}" placeholder="Répondre…"><button class="ev-mini" data-com="${esc(c.id)}">${ic("send")}</button></div>`}</details>`}
    </article>`; };
  const cards=list.length?list.map(card).join(""):`<div class="ev-empty">${ic("bulb")}<div><b>Personne n'a encore contribué.</b>${locked||RO?"":"<span>Lance‑toi — une idée, même imparfaite.</span>"}</div></div>`;
  const ecartBlock = ecartees.length?`<details class="ev-ecart"><summary>${ic("ban")} Écartées · ${ecartees.length}</summary>${ecartees.map(c=>`<div class="ev-ec"><div class="ev-ec-tx">${esc(c.texte)} <span class="ev-by">— ${esc(c.role)}</span>${c.raison?`<div class="ev-ec-r">Raison : ${esc(c.raison)}</div>`:""}</div>${RO?"":`<button class="ev-mini" data-reint="${esc(c.id)}" title="Réintégrer">${ic("check")}</button>`}</div>`).join("")}</details>`:"";
  const regroupBar = (!RO&&!locked&&list.length>1) ? (regroup?`<div class="ev-regroup"><span>${selected.size} sélectionné(s)</span><button class="ev-mini2" data-merge ${selected.size<2?"disabled":""}>${ic("merge")} Fusionner</button><button class="ev-mini2" data-regroup>Annuler</button></div>`:`<button class="ev-mini2 reg" data-regroup>${ic("merge")} Regrouper des idées proches</button>`) : "";
  const addZone=(RO||locked||regroup)?(locked?`<div class="ev-locked">${ic("lock")} Étape verrouillée — contributions figées.</div>`:"") :
    `<div class="ev-compose"><div class="ev-comp-h">${ic("pencil")} À toi de jouer</div><textarea data-keep id="newContrib" rows="2" placeholder="${ident?"Ton idée, même imparfaite…":"Identifie‑toi pour contribuer…"}"></textarea><div class="nudge" id="nudge" hidden></div><div class="ev-comp-foot"><span class="ev-micro">Rien n'est définitif tant que ce n'est pas retenu.</span><button class="ev-add" id="sendContrib">${ic("plus")} Ajouter</button></div></div>`;
  const lockBtn=RO?"":`<button class="ev-lock ${locked?"on":""}" data-lock="${e.id}" aria-label="${locked?"Déverrouiller l'étape":"Verrouiller l'étape"}">${ic(locked?"lock":"unlock")}</button>`;
  const on=(typeof onlineNow==="function")?onlineNow():[]; const presHTML=on.length?`<span class="ev-pres"><span class="ev-pres-dot"></span><span class="ev-pres-avs">${on.slice(0,4).map(p=>avatar(p.initiales,"sm",p.color)).join("")}</span>${on.length} en ligne</span>`:"";
  const v=visIdx(); const pos=v.indexOf(etapeIdx); const pct=Math.round((pos+1)/Math.max(v.length,1)*100);
  const voters=((projet.pret||{})[e.id]||[]); const meReady=voters.some(x=>x.dev===DEV);
  const readyBlock=`<div class="ev-ready"><div class="ev-ready-who">${voters.length?`<span class="ev-ready-avs">${voters.map(x=>avatar(x.ini,"sm",x.color)).join("")}</span><span><b>${voters.length}</b> ${voters.length>1?"ont":"a"} terminé cette étape</span>`:`<span class="muted">Personne n'a encore signalé avoir terminé cette étape.</span>`}</div>${RO?"":`<button class="ev-btn-ready ${meReady?"done":""}" data-ready="${e.id}">${ic("check")} ${meReady?"Terminé — annuler":"J'ai terminé cette étape"}</button>`}</div>`;
  return `${journey}
    <div class="ev-hero" style="--pc:${pc}">
      <div class="ev-hero-top"><span class="ev-eyebrow">${ic(e.icon)} Étape ${etapeIdx+1} sur ${S.length}${e.phaseNom?` · ${esc(e.phaseNom)}`:""}</span><span class="ev-htools">${presHTML}${lockBtn}</span></div>
      <h2 class="ev-title">${esc(e.nom)}</h2>
      <div class="ev-q">${ic("help")}<span>${esc(T(e.q))}</span></div>
      <div class="ev-prog"><span>Avancement</span><span class="ev-bar"><i style="width:${pct}%"></i></span><span>${pct}%</span></div>
    </div>
    <div class="ev-coach"><span class="ev-coach-ic">${ic("bulb")}</span><div class="ev-coach-tx"><b>${esc(T(e.def))}</b>${e.aide?`<p>${esc(T(e.aide))}</p>`:""}</div>${e.custom?"":`<button class="ev-coach-more" data-concept="${e.id}">${ic("help")} La notion</button>`}</div>
    ${recapBlock}
    <div class="ev-grid">
      <div class="ev-main">${addZone}${regroupBar}<div class="ev-cards">${cards}</div>${ecartBlock}</div>
      <aside class="ev-side">${resStrip(e.id)}</aside>
    </div>
    ${readyBlock}
    <div class="ev-pager"><button class="ev-pgr" data-nav="-1">${ic("back")} Précédent</button><button class="ev-pgr next" data-nav="1">Suivant ${ic("chev")}</button></div>`;
}

function viewPlan(){
  const acts=ofEt("actions");
  if(!acts.length) return `<div class="etape-head"><div class="eyebrow">Pilotage</div><h2>Plan d'action</h2></div><div class="empty">Renseignez d'abord des <b>actions</b> (étape Actions) — elles apparaîtront ici avec responsable, échéance et statut.</div>`;
  const cnt={todo:0,doing:0,done:0}; acts.forEach(a=>cnt[a.pst||"todo"]++);
  const rows=acts.map(a=>{const ps=a.pst||"todo";
    return `<tr><td class="pl-act">${esc(a.texte)}</td>
      <td>${RO?esc(a.resp||"—"):`<input class="pl-in" data-pf="resp:${esc(a.id)}" value="${esc(a.resp||"")}" placeholder="initiales / rôle">`}</td>
      <td>${RO?esc(a.ech||"—"):`<input class="pl-in" type="date" data-pf="ech:${esc(a.id)}" value="${esc(a.ech||"")}">`}</td>
      <td>${RO?`<span class="pst-tag" style="--sc:${PST[ps].c}">${PST[ps].l}</span>`:`<select class="pl-st" data-pf="pst:${esc(a.id)}">${Object.entries(PST).map(([k,v])=>`<option value="${k}" ${ps===k?"selected":""}>${v.l}</option>`).join("")}</select>`}</td></tr>`;}).join("");
  return `<div class="etape-head"><div class="eyebrow">Pilotage</div><h2>Plan d'action</h2><div class="et-def">Qui fait quoi, pour quand. Chaque action vient de l'étape « Actions ».</div></div>
    <div class="chips" style="margin-bottom:12px">${Object.entries(PST).map(([k,v])=>`<span class="pst-tag" style="--sc:${v.c}">${v.l} · ${cnt[k]}</span>`).join("")}</div>
    <div class="mx-wrap"><table class="mx pl"><thead><tr><th>Action</th><th>Responsable</th><th>Échéance</th><th>Statut</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function viewMatrice(){
  const objs=ofEt("obj_op"), acts=ofEt("actions"), inds=ofEt("indicateurs");
  if(!objs.length) return `<div class="empty">Renseignez d'abord des <b>objectifs opérationnels</b>, puis reliez-y vos actions et indicateurs (champ « ↳ Sert »).</div>`;
  const rows=objs.map(o=>{ const a=acts.filter(x=>x.lien===o.id), i=inds.filter(x=>x.lien===o.id);
    const warn=(!a.length||!i.length)?`<span class="mx-warn">${ic("alert")} ${!a.length&&!i.length?"sans action ni indicateur":!a.length?"sans action":"sans indicateur"}</span>`:`<span class="mx-ok">${ic("check")} aligné</span>`;
    return `<tr><td class="mx-obj">${esc(o.texte)} ${warn}</td><td>${a.length?a.map(x=>`<div class="mx-it">${esc(x.texte)}</div>`).join(""):'<span class="vide">—</span>'}</td><td>${i.length?i.map(x=>`<div class="mx-it">${esc(x.texte)}</div>`).join(""):'<span class="vide">—</span>'}</td></tr>`;}).join("");
  const orphA=acts.filter(x=>!x.lien||!objs.some(o=>o.id===x.lien)), orphI=inds.filter(x=>!x.lien||!objs.some(o=>o.id===x.lien));
  const orph=(orphA.length||orphI.length)?`<div class="card" style="margin-top:14px"><div class="cc-lab" style="color:var(--warn);margin-bottom:8px">${ic("alert")} Non reliés</div>${orphA.map(x=>`<div class="mx-it">Action : ${esc(x.texte)}</div>`).join("")}${orphI.map(x=>`<div class="mx-it">Indicateur : ${esc(x.texte)}</div>`).join("")}<p class="muted" style="font-size:12.5px;margin-top:8px">Reliez-les à un objectif depuis Actions / Indicateurs (« ↳ Sert »).</p></div>`:"";
  return `<div class="etape-head"><div class="eyebrow">Cohérence du projet</div><h2>Matrice d'alignement</h2><div class="et-def">Chaque objectif opérationnel devrait avoir au moins une action et un indicateur.</div></div><div class="mx-wrap"><table class="mx"><thead><tr><th>Objectif opérationnel</th><th>Actions</th><th>Indicateurs</th></tr></thead><tbody>${rows}</tbody></table></div>${orph}`;
}

function dateFr(){ try{ return new Date().toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}); }catch(_){ return ""; } }
function ficheBodyHTML(){
  const byEt={}; contribs.filter(active).forEach(c=>{(byEt[c.etape]=byEt[c.etape]||[]).push(c);});
  const syn=synthese();
  const conts=[...new Set(contribs.filter(active).map(c=>c.initiales).filter(Boolean))];
  const st=STATUTS[projet.statut]||STATUTS.brouillon; const ty=TYPES.find(t=>t.id===projet.type);
  const acts=ofEt("actions").filter(a=>a.resp||a.ech||a.pst);
  const _rf=curReperes().filter(it=>String(it.value||"").trim()!==""); const _res=curRes();
  const _jal=(projet.jalons||[]).slice().sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")));
  const _S=STEPS();
  const toc=[]; if(syn) toc.push("Résumé"); if(_rf.length) toc.push("Repères"); if(_jal.length) toc.push("Calendrier"); _S.forEach((e,i)=>toc.push((i+1)+". "+e.nom)); if(acts.length) toc.push((_S.length+1)+". Plan d'action"); if(_res.length) toc.push("Ressources & références");
  const cover=`<div class="doc-cover"><div class="dc-brand">Atelier projet — fiche de projet</div><h1 class="dc-title">${esc(projet.titre)}</h1>${projet.contexte?`<p class="dc-ctx">${esc(projet.contexte)}</p>`:""}<div class="dc-tags"><span class="st-tag" style="--sc:${st.c}">${st.l}</span>${typeLabel()?`<span class="ty-tag">${esc(typeLabel())}</span>`:""}</div><div class="dc-meta">${projet.pilote?`Piloté par ${esc(projet.pilote.ini)} (${esc(projet.pilote.role)}) · `:""}${conts.length} contributeur(s) · ${dateFr()}</div></div>`;
  const tocHtml=`<div class="doc-toc"><h2>Sommaire</h2><ol class="toc-list">${toc.map(n=>`<li>${esc(n)}</li>`).join("")}</ol></div>`;
  const resume=syn?`<section class="doc-resume"><h2>Résumé</h2><p>${esc(syn)}</p></section>`:"";
  let num=0;
  const sections=_S.map(e=>{ num++; const items=sortC(byEt[e.id]||[]); let body;
    if(!items.length) body=`<p class="vide">À compléter.</p>`;
    else { const kept=[], rest=[]; items.forEach(c=>{ const lines=splitLines(c.texte);
        if(lines.length<=1){ (c.epingle?kept:rest).push({t:c.texte, r:c.role}); }
        else { const lr=Array.isArray(c.lr)?c.lr:[]; lines.forEach((ln,idx)=>(lr.includes(idx)?kept:rest).push({t:ln, r:c.role})); } });
      body=kept.map(k=>`<div class="retenu">${esc(k.t)}</div>`).join("")+(rest.length?`<ul>${rest.map(x=>`<li>${esc(x.t)} <span class="by">— ${esc(x.r)}</span></li>`).join("")}</ul>`:""); }
    return `<section><h2><span class="sn">${num}.</span> ${esc(e.nom)}</h2>${body}</section>`;}).join("");
  const plan=acts.length?`<section><h2><span class="sn">${++num}.</span> Plan d'action</h2><table class="doc-pl"><tr><th>Action</th><th>Responsable</th><th>Échéance</th><th>Statut</th></tr>${acts.map(a=>`<tr><td>${esc(a.texte)}</td><td>${esc(a.resp||"—")}</td><td>${esc(a.ech||"—")}</td><td>${esc((PST[a.pst||"todo"]).l)}</td></tr>`).join("")}</table></section>`:"";
  const repSec=_rf.length?`<section class="doc-rep"><h2>Repères</h2><table class="doc-pl"><tr><th>Repère</th><th>Valeur</th></tr>${_rf.map(it=>`<tr><td>${esc(it.label)}</td><td>${esc(it.value)}</td></tr>`).join("")}</table></section>`:"";
  const jalSec=_jal.length?`<section class="doc-jal"><h2>Calendrier</h2><table class="doc-pl"><tr><th>Date</th><th>Étape / jalon</th></tr>${_jal.map(j=>`<tr><td>${esc(fmtDate(j.date))}</td><td>${esc(j.label||"")}</td></tr>`).join("")}</table></section>`:"";
  const resAnnex=_res.length?`<section class="doc-res"><h2>Ressources &amp; références</h2><ul class="doc-res-list">${_res.map(r=>{const t=RTM[r.type]||RTYPES[0];return `<li><b>${esc(r.titre||r.url||"Sans titre")}</b> <span class="dr-type">${esc(t.l)}</span>${r.etape?` <span class="dr-et">— ${esc(labelEt(r.etape))}</span>`:""}${r.url?`<br><a href="${esc(r.url)}">${esc(r.url)}</a>`:""}${r.note?`<br><span class="dr-note">${esc(r.note)}</span>`:""}</li>`;}).join("")}</ul></section>`:"";
  return cover+tocHtml+resume+repSec+jalSec+sections+plan+resAnnex;
}
function viewFiche(){ return `<div class="fiche-actions"><button class="btn" data-overview>${ic("back")} Vue d'ensemble</button><button class="btn" id="word">${ic("word")} Word</button><button class="btn primary" id="print">${ic("printer")} Imprimer / PDF</button></div><div class="doc">${ficheBodyHTML()}</div>`; }
function viewPresentation(){
  const st=STATUTS[projet.statut]||STATUTS.brouillon; const valid=projet.statut==="valide"; const S=STEPS();
  const conts=[...new Set(contribs.filter(active).map(c=>c.initiales).filter(Boolean))];
  const periode=(curReperes().find(it=>/p[ée]riode/i.test(it.label))||{}).value||"";
  const reps=curReperes().filter(it=>String(it.value||"").trim());
  const journey=PHASES.map(p=>{ const has=S.some(s=>s.ref&&p.etapes.includes(s.ref)&&ofEt(s.id).length); return `<div class="pres-ph ${has?"on":""}"><div class="pres-ph-dot" style="background:${has?p.c:"var(--line2)"}">${has?ic("check"):""}</div><div class="pres-ph-n">${esc(p.nom)}</div></div>`; }).join("");
  const cards=S.map(s=>{
    if(s.id==="actions"){ const acts=ofEt("actions"); if(!acts.length) return ""; return `<div class="pres-card wide" style="--pc:${s.c}"><div class="pres-lab">${ic(s.icon)} ${esc(s.nom)}</div><table class="pres-plan">${acts.map(a=>`<tr><td>${esc(a.texte)}</td><td class="pp-resp">${a.resp?esc(a.resp):"—"}</td><td>${a.ech?`<span class="pres-when">${esc(a.ech)}</span>`:""}</td></tr>`).join("")}</table></div>`; }
    const items=showItems(s.id); if(!items.length) return "";
    if(s.id==="problematique"||s.id==="finalite"){ return `<div class="pres-card wide quote-card" style="--pc:${s.c}"><div class="pres-lab">${ic(s.icon)} ${esc(s.nom)}</div><p class="pres-quote">${esc(items[0])}</p></div>`; }
    return `<div class="pres-card" style="--pc:${s.c}"><div class="pres-lab">${ic(s.icon)} ${esc(s.nom)}</div><ul class="pres-list">${items.map(t=>`<li>${ic("check")}<span>${esc(t)}</span></li>`).join("")}</ul></div>`;
  }).filter(Boolean).join("");
  const jal=(projet.jalons||[]).slice().sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")));
  const jalCard=jal.length?`<div class="pres-card wide" style="--pc:#2f7d6b"><div class="pres-lab">${ic("calendar")} Calendrier</div><table class="pres-plan">${jal.map(j=>`<tr><td style="width:150px"><span class="pres-when">${esc(fmtDate(j.date))}</span></td><td>${esc(j.label||"")}</td></tr>`).join("")}</table></div>`:"";
  const res=curRes(); const resCard2=res.length?`<div class="pres-card" style="--pc:#6b4bd6"><div class="pres-lab">${ic("clip")} Ressources</div><ul class="pres-list">${res.map(r=>`<li>${ic((RTM[r.type]||{}).icon||"link")}<span>${r.url?`<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.titre||r.url)}</a>`:esc(r.titre||"")}</span></li>`).join("")}</ul></div>`:"";
  const repCard=reps.length?`<div class="pres-card" style="--pc:#3b6ea5"><div class="pres-lab">${ic("calendar")} Repères</div><ul class="pres-list">${reps.map(it=>`<li>${ic(it.icon||"info")}<span><b>${esc(it.label)} :</b> ${esc(it.value)}</span></li>`).join("")}</ul></div>`:"";
  const body=cards+jalCard+repCard+resCard2;
  return `<div class="pres">
    <div class="pres-bar">${RO?`<a class="btn" href="../">${ic("back")} Portail</a>`:`<button class="btn" data-overview>${ic("back")} Vue d'ensemble</button>`}<button class="btn" id="presShare">${ic("send")} Partager</button>${RO?"":`<button class="btn" data-fiche>${ic("file")} Fiche / PDF</button>`}</div>
    <div class="pres-hero ${valid?"valid":""}">
      ${valid?`<span class="pres-badge">${ic("check")} Projet validé</span>`:`<span class="pres-badge draft" style="--sc:${st.c}">${esc(st.l)}</span>`}
      <h1 class="pres-title">${esc(projet.titre)}</h1>
      ${projet.contexte?`<p class="pres-ctx">${esc(projet.contexte)}</p>`:""}
      <div class="pres-meta">${projet.pilote?`<span class="pres-by">${avatar(projet.pilote.ini,"sm",projet.pilote.color)} Piloté par ${esc(projet.pilote.ini)} · ${esc(projet.pilote.role)}</span>`:""}<span class="pres-by">${ic("users")} ${conts.length} contributeur${conts.length>1?"s":""}</span>${periode?`<span class="pres-by">${ic("calendar")} ${esc(periode)}</span>`:""}</div>
    </div>
    <div class="pres-journey">${journey}</div>
    ${body?`<div class="pres-grid">${body}</div>`:`<div class="empty">Pas encore de contenu à présenter — renseignez et retenez vos étapes.</div>`}
    <div class="pres-foot">${ic("shield")} Présentation en lecture seule — aucune donnée nominative d'élève.</div>
  </div>`;
}
function exportWord(){
  const css=`body{font-family:Calibri,Arial,sans-serif;color:#1a1a1a;font-size:11pt;line-height:1.5}
h1{font-size:20pt;color:#26365a}h2{font-size:13pt;color:#2f6cd6;border-bottom:1px solid #cdd6e6;padding-bottom:3px;margin-top:18px}.sn{color:#2f6cd6}
.doc-cover{text-align:center;page-break-after:always;padding-top:120pt}.dc-brand{font-size:10pt;letter-spacing:1pt;color:#2f6cd6}.dc-title{font-size:28pt;margin:14pt 0 6pt}.dc-ctx{color:#555;font-style:italic}.dc-tags span{display:inline-block;background:#eef3fb;color:#26365a;border:1px solid #cdd6e6;padding:2pt 8pt;margin:0 3pt;font-size:9pt}.dc-meta{color:#888;font-size:9pt;margin-top:10pt}
.doc-toc{page-break-after:always}.doc-toc h2{border:none}.doc-resume p{background:#f3f5f9;padding:10px}.doc-ctx{color:#555;font-style:italic}
.retenu{background:#eef3fb;padding:6px 10px;border-left:3px solid #2f6cd6;margin:4px 0}ul{margin:4px 0}li{margin-bottom:3px}.by{color:#888;font-size:9pt}.vide{color:#999;font-style:italic}
table{border-collapse:collapse;width:100%;margin-top:6px;font-size:10pt}th,td{border:1px solid #ccc;padding:4pt 6pt;text-align:left}
.doc-res-list{padding-left:18px}.doc-res-list li{margin-bottom:7pt;font-size:10.5pt}.dr-type{color:#666;font-size:9pt}.dr-et{color:#888;font-size:9pt}.dr-note{color:#555;font-size:9.5pt}`;
  const html=`<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'><head><meta charset='utf-8'><style>${css}</style></head><body>${ficheBodyHTML()}</body></html>`;
  const blob=new Blob(['﻿'+html],{type:'application/msword'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=(projet.titre||'projet').replace(/[^\w -]/g,'')+'.doc'; a.click();
}

/* ---------- Overlay ---------- */
function openSheet(html){ $("#overlay").innerHTML=`<div class="sheet">${html}</div>`; $("#overlay").classList.add("show"); }
function closeSheet(){ $("#overlay").classList.remove("show"); $("#overlay").innerHTML=""; }
function openIdent(){
  let role=ident?ident.role:""; let color=ident&&ident.color||"";
  const drawPrev=()=>{ const av=$("#identPrev"); if(!av) return; const ini=($("#iIni").value.trim().toUpperCase())||"?"; av.style.background=color||colorFor(ini); av.textContent=ini.slice(0,3); };
  openSheet(`<div class="sheet-head"><h3>Votre identité</h3><button class="x" data-close>${ic("x")}</button></div><p class="muted" style="font-size:13.5px;margin:0 0 14px">RGPD : seulement vos <b>initiales</b> et votre <b>rôle</b> — jamais de nom.</p>
    <div class="ident-prev"><span class="ava lg" id="identPrev"></span><span class="muted" style="font-size:12.5px">Voici la pastille qui apparaîtra à côté de vos contributions.</span></div>
    <div class="field"><label for="iIni">Vos initiales</label><input id="iIni" maxlength="4" placeholder="ex. B.D." value="${esc(ident?ident.initiales:"")}" style="text-transform:uppercase;font-weight:700"></div>
    <div class="field"><label>Couleur de votre pastille</label><div class="color-row" id="iColors">${PALETTE.map(c=>`<button type="button" class="color-sw ${color===c?"on":""}" data-color="${c}" style="background:${c}" aria-label="Couleur"></button>`).join("")}<button type="button" class="color-sw auto ${color?"":"on"}" data-color="" aria-label="Automatique">A</button></div></div>
    <div class="field"><label>Votre rôle</label><div class="roles" id="iRoles">${ROLES.map(r=>`<button type="button" class="role-chip ${ident&&ident.role===r?"sel":""}" data-role="${esc(r)}">${esc(r)}</button>`).join("")}</div></div>
    <div class="actions"><button class="btn primary" id="saveIdent">${ic("check")} Enregistrer</button></div>`);
  $("#iRoles").querySelectorAll("[data-role]").forEach(b=>b.onclick=()=>{role=b.dataset.role;$("#iRoles").querySelectorAll(".role-chip").forEach(x=>x.classList.toggle("sel",x===b));});
  $("#iColors").querySelectorAll("[data-color]").forEach(b=>b.onclick=()=>{color=b.dataset.color;$("#iColors").querySelectorAll(".color-sw").forEach(x=>x.classList.toggle("on",x===b));drawPrev();});
  $("#iIni").oninput=drawPrev; drawPrev();
  $("#saveIdent").onclick=()=>{const ini=$("#iIni").value.trim().toUpperCase();if(!ini){toast("Indiquez vos initiales.");return;}if(!role){toast("Choisissez votre rôle.");return;}ident={initiales:ini,role,color};localStorage.setItem("projets_ident_v1",JSON.stringify(ident));closeSheet();render();beat();toast("Identité enregistrée",true);};
}
function exportJSON(){
  if(!projet) return;
  const data={ _format:"atelier-projet", _v:1, exportedAt:dateFr(),
    project:{ titre:projet.titre||"", contexte:projet.contexte||"", type:projet.type||"peda", typeCustom:projet.typeCustom||"", statut:projet.statut||"brouillon", reperes:projet.reperes||{}, ressources:projet.ressources||[], jalons:projet.jalons||[], enabled:projet.enabled||null, etapeNoms:projet.etapeNoms||{}, locked:projet.locked||[] },
    contributions:contribs.map(c=>({ etape:c.etape, texte:c.texte, initiales:c.initiales, role:c.role, epingle:!!c.epingle, comments:c.comments||[], lien:c.lien||"", regroupe:!!c.regroupe, ecarte:!!c.ecarte, raison:c.raison||"", resp:c.resp||"", ech:c.ech||"", pst:c.pst||"todo" })) };
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob);
  a.download="projet-"+String(projet.titre||"sans-titre").replace(/[^a-z0-9]+/gi,"-").toLowerCase().slice(0,40)+".json";
  a.click(); URL.revokeObjectURL(a.href); toast("Sauvegarde JSON téléchargée",true);
}
function importJSON(){
  const inp=document.createElement("input"); inp.type="file"; inp.accept="application/json,.json";
  inp.onchange=async()=>{ const f=inp.files&&inp.files[0]; if(!f) return;
    try{ const data=JSON.parse(await f.text()); const p=data.project||data; if(!p||typeof p!=="object"){toast("Fichier non reconnu.");return;}
      const ref=await addDoc(collection(db,COL),{ titre:(p.titre||"Projet importé")+" (importé)", contexte:p.contexte||"", type:p.type||"peda", typeCustom:p.typeCustom||"", statut:p.statut||"brouillon", reperes:p.reperes||{}, ressources:p.ressources||[], jalons:p.jalons||[], enabled:Array.isArray(p.enabled)?p.enabled:null, etapeNoms:p.etapeNoms||{}, locked:p.locked||[], createdAt:serverTimestamp() });
      for(const c of (data.contributions||[])){ await addDoc(collection(db,COL,ref.id,"contributions"),{ etape:c.etape||"constats", texte:c.texte||"", initiales:c.initiales||"", role:c.role||"", epingle:!!c.epingle, comments:c.comments||[], lien:c.lien||"", regroupe:!!c.regroupe, ecarte:!!c.ecarte, raison:c.raison||"", resp:c.resp||"", ech:c.ech||"", pst:c.pst||"todo", createdAt:serverTimestamp() }); }
      toast("Projet importé",true); openProjet(ref.id);
    }catch(e){ console.error(e); toast("Import impossible (fichier invalide)."); } };
  inp.click();
}
async function delProjet(){
  if(!projet||RO) return;
  if(!confirm(`Supprimer définitivement le projet « ${projet.titre||"sans titre"} » et toutes ses contributions ?\n\nCette action est irréversible. Pensez à « Sauvegarder (JSON) » avant si besoin.`)) return;
  const pid=projet.id;
  try{
    const cs=await getDocs(collection(db,COL,pid,"contributions"));
    for(const d of cs.docs){ await deleteDoc(doc(db,COL,pid,"contributions",d.id)); }
    try{ const ps=await getDocs(collection(db,COL,pid,"presence")); for(const d of ps.docs){ await deleteDoc(doc(db,COL,pid,"presence",d.id)); } }catch(_){}
    await deleteDoc(doc(db,COL,pid));
    stopPresence(); if(unsub){unsub();unsub=null;} if(unsubP){unsubP();unsubP=null;}
    view="liste"; projet=null; contribs=[]; render(); loadListe(); toast("Projet supprimé",true);
  }catch(e){ console.error(e); toast("Suppression impossible."); }
}
function openNew(){
  let m=MODELES[0], type=m.type, typeCustom="";
  let stepsSel=new Set(ETAPES.map(e=>e.id));
  const typeChips=()=>TYPES.map(t=>`<button type="button" class="role-chip ${t.id===type?"sel":""}" data-ty="${t.id}">${esc(t.l)}</button>`).join("")+`<button type="button" class="role-chip ${type==='perso'?'sel':''}" data-ty-custom>${ic("pencil")} ${type==='perso'&&typeCustom?esc(typeCustom):'Autre…'}</button>`;
  const stepChips=()=>ETAPES.map(e=>`<button type="button" class="step-chip ${stepsSel.has(e.id)?'on':''}" data-stp="${e.id}">${stepsSel.has(e.id)?ic("check"):ic(e.icon)} ${esc(e.nom)}</button>`).join("");
  openSheet(`<div class="sheet-head"><h3>Nouveau projet</h3><button class="x" data-close>${ic("x")}</button></div>
    <div class="field"><label>Partir d'un modèle</label><div class="roles" id="mods">${MODELES.map((x,i)=>`<button type="button" class="role-chip ${i===0?"sel":""}" data-mod="${i}">${esc(x.t)}</button>`).join("")}</div></div>
    <div class="field"><label>Type de projet <span class="muted" style="font-weight:400">(adapte le vocabulaire)</span></label><div class="roles" id="tys">${typeChips()}</div></div>
    <div class="field"><label for="pTit">Titre</label><input id="pTit" placeholder="ex. Action de prévention"></div>
    <div class="field"><label for="pCtx">Contexte (optionnel)</label><textarea id="pCtx" placeholder="Le public, le besoin observé…"></textarea></div>
    <label class="rchk"><input type="checkbox" id="pPilote" ${ident?"checked":""} ${ident?"":"disabled"}> <span>Je pilote ce projet ${ident?`<span class="muted">(vous : ${esc(ident.initiales)} · ${esc(ident.role)})</span>`:`<span class="muted">— identifiez-vous d'abord</span>`}</span></label>
    <div class="field" style="margin-top:16px"><label>Les étapes de votre projet <span class="muted" style="font-weight:400">— modulable à tout moment</span></label><div class="st-row" style="margin-bottom:8px"><button type="button" class="btn-mini" id="sAll">Toutes</button><button type="button" class="btn-mini" id="sRap">Essentiel (6)</button></div><div class="step-chips" id="stps">${stepChips()}</div></div>
    <div class="actions"><button class="btn primary" id="createP">${ic("plus")} Créer le projet</button></div>`);
  const reTy=()=>{$("#tys").innerHTML=typeChips();bindTy();};
  const reStp=()=>{$("#stps").innerHTML=stepChips();bindStp();};
  const bindTy=()=>{ $("#tys").querySelectorAll("[data-ty]").forEach(b=>b.onclick=()=>{type=b.dataset.ty;reTy();}); const c=$("#tys").querySelector("[data-ty-custom]"); if(c)c.onclick=()=>{const v=prompt("Nom du type de projet :",typeCustom||"");if(v&&v.trim()){type="perso";typeCustom=v.trim();}reTy();}; };
  const bindStp=()=>{ $("#stps").querySelectorAll("[data-stp]").forEach(b=>b.onclick=()=>{const id=b.dataset.stp;if(stepsSel.has(id)){if(stepsSel.size>1)stepsSel.delete(id);else return toast("Au moins une étape.");}else stepsSel.add(id);reStp();}); };
  $("#mods").querySelectorAll("[data-mod]").forEach(b=>b.onclick=()=>{m=MODELES[+b.dataset.mod];type=m.type;typeCustom="";$("#mods").querySelectorAll(".role-chip").forEach(x=>x.classList.toggle("sel",x===b));$("#pTit").value=m.titre;$("#pCtx").value=m.ctx;reTy();});
  $("#sAll").onclick=()=>{stepsSel=new Set(ETAPES.map(e=>e.id));reStp();};
  $("#sRap").onclick=()=>{stepsSel=new Set(RAPIDE);reStp();};
  bindTy(); bindStp();
  $("#createP").onclick=async()=>{const titre=$("#pTit").value.trim();if(!titre){toast("Donnez un titre.");return;}const trame=ETAPES.filter(e=>stepsSel.has(e.id)).map(e=>({ref:e.id}));const pilote=($("#pPilote")&&$("#pPilote").checked&&ident)?{ini:ident.initiales,role:ident.role,color:ident.color||""}:null;const btn=$("#createP");btn.disabled=true;btn.textContent="Création…";try{const ref=await addDoc(collection(db,COL),{titre,contexte:$("#pCtx").value.trim(),statut:"construction",type,typeCustom:type==="perso"?typeCustom:"",trame,pilote,locked:[],createdAt:serverTimestamp()});closeSheet();await openProjet(ref.id);}catch(e){console.error(e);fbError=true;btn.disabled=false;btn.innerHTML=`${ic("plus")} Créer le projet`;toast("Enregistrement impossible.");}};
}
function openEdit(cid){const c=contribs.find(x=>x.id===cid);if(!c)return;openSheet(`<div class="sheet-head"><h3>Modifier</h3><button class="x" data-close>${ic("x")}</button></div><div class="field"><textarea id="eTxt" rows="4">${esc(c.texte)}</textarea></div><div class="actions"><button class="btn primary" id="saveEdit">${ic("check")} Enregistrer</button></div>`);
  $("#saveEdit").onclick=async()=>{const v=$("#eTxt").value.trim();if(!v){toast("Texte vide.");return;}try{await updateDoc(doc(db,COL,projet.id,"contributions",cid),{texte:v,editedAt:Date.now()});closeSheet();saved();}catch(e){console.error(e);toast("Modification impossible.");}};}
function openConcept(eid){
  const c=CONCEPTS[eid]; if(!c) return; const e=ETM[eid]; const pc=(PHASES.find(p=>p.etapes.includes(eid))||{}).c||"var(--accent)";
  openSheet(`<div class="concept" style="--pc:${pc}"><div class="cc-head"><span class="cc-ic">${ic(e.icon)}</span><div class="cc-h-tx"><div class="cc-eyebrow">La notion</div><h3>${esc(nomEt(e))}</h3></div><button class="x" data-close>${ic("x")}</button></div>
    <div class="cc-block"><div class="cc-lab">Ce que c'est</div><p>${esc(T(c.quoi))}</p></div>
    ${c.dist?`<div class="cc-block cc-dist"><div class="cc-lab">${ic("alert")} À ne pas confondre</div><p><b>${esc(c.dist[0])}.</b> ${esc(T(c.dist[1]))}</p></div>`:""}
    ${c.ex?`<div class="cc-block"><div class="cc-lab">${ic("bolt")} Un exemple</div><p class="cc-ex">${esc(T(c.ex))}</p></div>`:""}
    ${c.formule?`<div class="cc-block cc-formule"><div class="cc-lab">La formule</div><p>${esc(T(c.formule))}</p></div>`:""}
    ${c.verbes?`<div class="cc-block"><div class="cc-lab">${ic("checklist")} Verbes d'action conseillés</div><div class="cc-verbes">${c.verbes.map(([n,v])=>`<div class="cc-vrow"><span class="cc-vn">${esc(n)}</span><span class="cc-vv">${esc(v)}</span></div>`).join("")}</div></div>`:""}
    ${c.src?`<p class="cc-src">${esc(c.src)}</p>`:""}</div>`);
}
function openEcart(cid){ openSheet(`<div class="sheet-head"><h3>Écarter cette contribution</h3><button class="x" data-close>${ic("x")}</button></div><p class="muted" style="font-size:13.5px;margin:0 0 12px">Elle sortira de la fiche, mais restera consultable.</p><div class="field"><label for="eR">Raison (optionnel)</label><input id="eR" placeholder="ex. hors périmètre, redondant…"></div><div class="actions"><button class="btn primary" id="doEcart">${ic("ban")} Écarter</button></div>`);
  $("#doEcart").onclick=async()=>{try{await updateDoc(doc(db,COL,projet.id,"contributions",cid),{ecarte:true,raison:$("#eR").value.trim()});closeSheet();saved();}catch(e){console.error(e);toast("Action impossible.");}};}

function openReperes(){
  let items = curReperes();
  const listFor = label => { const s=REP_SUGG.find(x=>x.l===label); return s&&s.list; };
  const draw=()=>{ const el=$("#repItems"); if(!el) return;
    el.innerHTML = items.length ? items.map((it,i)=>{ const dl=listFor(it.label); return `<div class="rep-edit"><span class="rep-ei">${ic(it.icon||"info")}</span><div class="rep-ef"><label>${esc(it.label)}</label><input data-rv="${i}" value="${esc(it.value||'')}" ${dl?`list="dl_${i}"`:''} placeholder="…">${dl?`<datalist id="dl_${i}">${dl.map(o=>`<option value="${esc(o)}"></option>`).join("")}</datalist>`:''}</div><button class="pr-edit danger" data-rd="${i}" aria-label="Retirer">${ic("trash")}</button></div>`;}).join("") : `<p class="muted" style="font-size:13px">Aucun repère — ajoutez-en ci-dessous.</p>`;
    el.querySelectorAll("[data-rv]").forEach(inp=>inp.oninput=()=>{ items[+inp.dataset.rv].value=inp.value; });
    el.querySelectorAll("[data-rd]").forEach(b=>b.onclick=()=>{ items.splice(+b.dataset.rd,1); draw(); });
    const sg=$("#repSugg"); sg.innerHTML = REP_SUGG.filter(s=>!items.some(it=>it.label===s.l)).map(s=>`<button class="add-chip" data-rs="${esc(s.l)}">${ic(s.icon)} ${esc(s.l)}</button>`).join("")+`<button class="add-chip custom" data-rs-custom>${ic("plus")} Champ libre…</button>`;
    sg.querySelectorAll("[data-rs]").forEach(b=>b.onclick=()=>{ const s=REP_SUGG.find(x=>x.l===b.dataset.rs); items.push({id:"r"+Date.now().toString(36)+items.length, label:s.l, value:"", icon:s.icon}); draw(); });
    const cb=sg.querySelector("[data-rs-custom]"); if(cb) cb.onclick=()=>{ const v=prompt("Nom du repère :",""); if(!v||!v.trim()) return; items.push({id:"r"+Date.now().toString(36)+items.length, label:v.trim(), value:"", icon:"info"}); draw(); };
  };
  openSheet(`<div class="sheet-head"><h3>Repères du projet</h3><button class="x" data-close>${ic("x")}</button></div><p class="muted" style="font-size:13.5px;margin:0 0 12px">Les paramètres concrets — <b>ajoutez, retirez</b> ce qui compte pour ce projet.</p><div class="rep-items" id="repItems"></div><div class="sec-title2">${ic("plus")} Ajouter un repère</div><div class="trame-add" id="repSugg"></div><div class="actions"><button class="btn primary" id="saveRep">${ic("check")} Enregistrer</button></div>`);
  $("#saveRep").onclick=async()=>{ try{ await updateDoc(doc(db,COL,projet.id),{reperes:items.map(it=>({id:it.id||("r"+Math.random().toString(36).slice(2)),label:it.label,value:String(it.value||"").trim(),icon:it.icon||"info"}))}); closeSheet(); saved(); }catch(e){console.error(e);toast("Action impossible.");} };
  draw();
}
function openJalon(){
  openSheet(`<div class="sheet-head"><h3>Ajouter une date</h3><button class="x" data-close>${ic("x")}</button></div><div class="field"><label for="jDate">Date</label><input id="jDate" type="date"></div><div class="field"><label for="jLabel">Intitulé</label><input id="jLabel" type="text" placeholder="ex. Réunion de lancement"></div><div class="actions"><button class="btn primary" id="jSave">${ic("check")} Ajouter</button></div>`);
  $("#jSave").onclick=async()=>{const date=$("#jDate").value;const label=$("#jLabel").value.trim();if(!date&&!label){toast("Indiquez une date et un intitulé.");return;}const arr=(projet.jalons||[]).slice();arr.push({id:"j"+Date.now().toString(36),date,label:label||"(sans intitulé)"});try{await updateDoc(doc(db,COL,projet.id),{jalons:arr});closeSheet();saved();}catch(e){console.error(e);toast("Action impossible.");}};
}
async function delJalon(id){ try{await updateDoc(doc(db,COL,projet.id),{jalons:(projet.jalons||[]).filter(j=>j.id!==id)});saved();}catch(e){console.error(e);toast("Action impossible.");} }
function openPerso(){
  let tr = projTrame().map(s=> s.ref ? {ref:s.ref} : {id:s.id, nom:s.nom, icon:s.icon||"folder", phase:s.phase});
  let noms = Object.assign({}, projet.etapeNoms||{});
  const stdIn = () => new Set(tr.filter(s=>s.ref).map(s=>s.ref));
  const nameOf = s => s.ref ? (noms[s.ref]||ETM[s.ref].nom) : (s.nom||"Étape libre");
  const iconOf = s => s.ref ? ETM[s.ref].icon : (s.icon||"folder");
  const save = async ()=>{ try{ await updateDoc(doc(db,COL,projet.id),{trame:tr, etapeNoms:noms}); }catch(e){console.error(e);toast("Action impossible.");} };
  const draw=()=>{ const el=$("#trameList"); if(!el) return;
    el.innerHTML = tr.map((s,i)=>`<div class="trow"><span class="tr-grip">${i+1}</span><span class="pr-ic" style="--pc:${s.ref?((phaseOf(s.ref)||{}).c||'var(--accent)'):'#64748b'}">${ic(iconOf(s))}</span><span class="tr-n">${esc(nameOf(s))}${s.ref?"":' <span class="tr-libre">libre</span>'}</span><span class="tr-acts"><button class="pr-edit" data-up="${i}" ${i===0?"disabled":""} aria-label="Monter">${ic("back")}</button><button class="pr-edit" data-down="${i}" ${i===tr.length-1?"disabled":""} aria-label="Descendre">${ic("chev")}</button><button class="pr-edit" data-rn2="${i}" aria-label="Renommer">${ic("pencil")}</button><button class="pr-edit danger" data-rm="${i}" ${tr.length<=1?"disabled":""} aria-label="Retirer">${ic("trash")}</button></span></div>`).join("");
    const avail = ETAPES.filter(e=>!stdIn().has(e.id));
    $("#trameAdd").innerHTML = avail.map(e=>`<button class="add-chip" data-add="${e.id}">${ic("plus")} ${esc(e.nom)}</button>`).join("") + `<button class="add-chip custom" data-add-custom>${ic("plus")} Étape libre…</button>`;
    el.querySelectorAll("[data-up]").forEach(b=>b.onclick=()=>{const i=+b.dataset.up;[tr[i-1],tr[i]]=[tr[i],tr[i-1]];save();draw();});
    el.querySelectorAll("[data-down]").forEach(b=>b.onclick=()=>{const i=+b.dataset.down;[tr[i+1],tr[i]]=[tr[i],tr[i+1]];save();draw();});
    el.querySelectorAll("[data-rm]").forEach(b=>b.onclick=()=>{const i=+b.dataset.rm;if(tr.length<=1)return toast("Au moins une étape.");tr.splice(i,1);save();draw();});
    el.querySelectorAll("[data-rn2]").forEach(b=>b.onclick=()=>{const i=+b.dataset.rn2;const s=tr[i];const base=s.ref?ETM[s.ref].nom:"";const v=prompt("Renommer l'étape :",nameOf(s));if(v===null)return;const nv=v.trim();if(s.ref){ if(nv&&nv!==base)noms[s.ref]=nv; else delete noms[s.ref]; } else { s.nom=nv||"Étape libre"; } save();draw();});
    $("#trameAdd").querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>{tr.push({ref:b.dataset.add});save();draw();});
    const ac=$("#trameAdd").querySelector("[data-add-custom]"); if(ac) ac.onclick=()=>{const v=prompt("Nom de l'étape libre :","");if(!v||!v.trim())return;tr.push({id:"c"+Date.now().toString(36)+Math.random().toString(36).slice(2,4),nom:v.trim(),icon:"folder"});save();draw();};
  };
  openSheet(`<div class="sheet-head"><h3>Les étapes du projet</h3><button class="x" data-close>${ic("x")}</button></div>
    <p class="muted" style="font-size:13.5px;margin:0 0 10px">Construisez votre trame : <b>ajoutez, retirez, renommez, réordonnez</b> — et créez des étapes libres si besoin.</p>
    <div class="st-row" style="margin-bottom:12px"><button class="btn-mini" id="pAll">Trame complète (13)</button><button class="btn-mini" id="pRap">Essentiel (6)</button></div>
    <div class="trame-list" id="trameList"></div>
    <div class="sec-title2">${ic("plus")} Ajouter une étape</div>
    <div class="trame-add" id="trameAdd"></div>
    <div class="actions"><button class="btn primary" data-close>${ic("check")} Terminé</button></div>`);
  $("#pAll").onclick=()=>{tr=ETAPES.map(e=>({ref:e.id}));save();draw();};
  $("#pRap").onclick=()=>{tr=RAPIDE.map(id=>({ref:id}));save();draw();};
  draw();
}

async function saveRes(arr){ try{ await updateDoc(doc(db,COL,projet.id),{ressources:arr}); saved(); }catch(e){ console.error(e); toast("Action impossible."); } }
async function addRessource(o){ const arr=curRes(); arr.push({id:"r"+Date.now().toString(36)+Math.random().toString(36).slice(2,5), ...o}); await saveRes(arr); }
async function updRessource(id,o){ await saveRes(curRes().map(r=>r.id===id?{...r,...o}:r)); }
async function delRessource(id){ await saveRes(curRes().filter(r=>r.id!==id)); }
async function toggleResTodo(id){ await saveRes(curRes().map(r=>r.id===id?{...r,done:!r.done}:r)); }
function openRessource(existing, presetEtape){
  const r=existing||{type:"lien", etape:presetEtape||"", todo:false};
  const typeChips=RTYPES.map(t=>`<button type="button" class="rt-pick ${r.type===t.id?'on':''}" data-rtype="${t.id}" style="--rc:${t.c}"><span class="rt-ic">${ic(t.icon)}</span>${esc(t.l)}</button>`).join("");
  const etOpts=`<option value="">— Aucune étape précise —</option>`+STEPS().map(e=>`<option value="${e.id}" ${r.etape===e.id?'selected':''}>${esc(e.nom)}</option>`).join("");
  openSheet(`<div class="sheet-head"><h3>${existing?"Modifier la ressource":"Ajouter une ressource"}</h3><button class="x" data-close>${ic("x")}</button></div>
    <div class="field"><label>Type</label><div class="rt-row">${typeChips}</div></div>
    <div class="field"><label for="rTitre">Titre</label><input id="rTitre" type="text" placeholder="ex. Padlet — recensement des besoins" value="${esc(r.titre||'')}"></div>
    <div class="field"><label for="rUrl">Lien (https://…)</label><input id="rUrl" type="url" inputmode="url" placeholder="https://…" value="${esc(r.url||'')}"></div>
    <div class="field"><label for="rNote">À quoi ça sert ?</label><input id="rNote" type="text" placeholder="ex. Pour recueillir les retours avant le diagnostic" value="${esc(r.note||'')}"></div>
    <div class="field"><label for="rEtape">Rattacher à une étape</label><select id="rEtape">${etOpts}</select></div>
    <label class="rchk"><input type="checkbox" id="rTodo" ${r.todo?'checked':''}> <span>Marquer « à traiter » (pense-bête d'équipe)</span></label>
    <p class="muted" style="font-size:12px;margin:10px 0 0;display:flex;gap:6px;align-items:flex-start">${ic("shield")}<span>Évitez tout lien contenant des données nominatives d'élèves.</span></p>
    <div class="actions"><button class="btn primary" id="rSave">${ic("check")} ${existing?"Enregistrer":"Ajouter"}</button></div>`);
  let type=r.type;
  $("#overlay").querySelectorAll(".rt-pick").forEach(b=>b.onclick=()=>{type=b.dataset.rtype;$("#overlay").querySelectorAll(".rt-pick").forEach(x=>x.classList.toggle("on",x===b));});
  $("#rSave").onclick=async()=>{
    const titre=$("#rTitre").value.trim(); let url=$("#rUrl").value.trim();
    if(url && !/^https?:\/\//i.test(url)) url="https://"+url;
    if(!titre && !url){ toast("Indiquez au moins un titre ou un lien."); return; }
    const obj={type, titre:titre||url, url, note:$("#rNote").value.trim(), etape:$("#rEtape").value, todo:$("#rTodo").checked};
    if(existing){ await updRessource(existing.id, obj); } else { obj.initiales=ident?ident.initiales:""; obj.done=false; await addRessource(obj); }
    closeSheet();
  };
}

/* ---------- Firestore ---------- */
async function loadListe(){
  try{ const snap=await getDocs(collection(db,COL));
    projets=await Promise.all(snap.docs.map(async d=>{let et=0,n=0;try{const cs=await getDocs(collection(db,COL,d.id,"contributions"));const a=cs.docs.filter(x=>!x.data().ecarte);n=a.length;et=new Set(a.map(x=>x.data().etape)).size;}catch(_){}return {id:d.id,...d.data(),_contribs:n,_etapes:et};}));
    projets=projets.filter(p=>!(RO&&p.statut==="archive")); projets.sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)); fbError=false;
  }catch(e){console.error(e);fbError=true;projets=[];}
  if(view==="liste") render();
}
async function openProjet(id){
  if(unsub){unsub();unsub=null;} if(unsubP){unsubP();unsubP=null;} stopPresence();
  projet=projets.find(p=>p.id===id)||null;
  if(!projet){ try{const d=await getDoc(doc(db,COL,id));if(d.exists())projet={id,...d.data()};}catch(_){} }
  if(!projet){toast("Projet introuvable.");view="liste";return loadListe();}
  view="overview"; etapeIdx=0; contribs=[]; regroup=false; selected.clear(); render();
  try{ unsubP=onSnapshot(doc(db,COL,id),d=>{if(d.exists()){projet={id,...d.data()};if(view!=="liste")render();}}); }catch(_){}
  try{ unsub=onSnapshot(query(collection(db,COL,id,"contributions"),orderBy("createdAt","asc")),snap=>{contribs=snap.docs.map(d=>{const x=d.data();return {id:d.id,...x,_t:x.createdAt?.seconds||0};});fbError=false;if(view!=="liste")render();},err=>{console.error(err);fbError=true;render();}); }catch(e){console.error(e);fbError=true;render();}
  startPresence(id);
}
async function addContribution(texte){ if(!ident){openIdent();return;} texte=texte.trim(); if(!texte) return; const sid=stepAt(etapeIdx)?.id; if(!sid) return; if(isLocked(sid)){toast("Étape verrouillée.");return;}
  try{const ref=await addDoc(collection(db,COL,projet.id,"contributions"),{etape:sid,texte,initiales:ident.initiales,role:ident.role,color:ident.color||"",epingle:false,comments:[],createdAt:serverTimestamp()});mine.add(ref.id);saveMine();saved();}catch(e){console.error(e);toast("Envoi impossible.");}}
async function upd(cid,obj){try{await updateDoc(doc(db,COL,projet.id,"contributions",cid),obj);saved();}catch(e){console.error(e);toast("Action impossible.");}}
async function delContribution(cid){try{await deleteDoc(doc(db,COL,projet.id,"contributions",cid));mine.delete(cid);saveMine();saved();}catch(e){console.error(e);toast("Suppression impossible.");}}
async function toggleLine(cid,idx){ const c=contribs.find(x=>x.id===cid); if(!c) return; const cur=Array.isArray(c.lr)?c.lr.slice():[]; const k=cur.indexOf(idx); if(k>=0) cur.splice(k,1); else cur.push(idx); upd(cid,{lr:cur}); }
async function moveContrib(cid,dir){
  const c0=contribs.find(c=>c.id===cid); if(!c0) return;
  const list=ofEt(c0.etape); const idx=list.findIndex(c=>c.id===cid); const j=idx+dir;
  if(idx<0||j<0||j>=list.length) return;
  const arr=list.slice(); const [m]=arr.splice(idx,1); arr.splice(j,0,m);
  try{ await Promise.all(arr.map((c,i)=>updateDoc(doc(db,COL,projet.id,"contributions",c.id),{pos:i}))); saved(); }
  catch(e){ console.error(e); toast("Action impossible."); }
}
async function addComment(cid,txt){if(!ident){openIdent();return;}txt=txt.trim();if(!txt)return;const c=contribs.find(x=>x.id===cid);if(!c)return;const coms=[...(c.comments||[]),{ini:ident.initiales,role:ident.role,txt,t:Date.now()}];upd(cid,{comments:coms});}
async function setProj(obj){try{await updateDoc(doc(db,COL,projet.id),obj);saved();}catch(e){console.error(e);toast("Action impossible.");}}
async function toggleReady(eid){ if(!ident){openIdent();return;} const pret=Object.assign({}, projet.pret||{}); const arr=(pret[eid]||[]).slice(); const k=arr.findIndex(v=>v.dev===DEV); if(k>=0) arr.splice(k,1); else arr.push({dev:DEV,ini:ident.initiales,role:ident.role,color:ident.color||""}); pret[eid]=arr; setProj({pret}); }
async function toggleLock(eid){const cur=projet.locked||[];setProj({locked:cur.includes(eid)?cur.filter(x=>x!==eid):[...cur,eid]});}
async function fusionner(){ if(!ident){openIdent();return;} const sel=contribs.filter(c=>selected.has(c.id)); if(sel.length<2) return;
  const txt=sel.map(c=>c.texte).join("\n• ").replace(/^/,"• "); const ep=sel.some(c=>c.epingle); const coms=sel.flatMap(c=>c.comments||[]);
  try{ await addDoc(collection(db,COL,projet.id,"contributions"),{etape:stepAt(etapeIdx).id,texte:txt,initiales:ident.initiales,role:ident.role,color:ident.color||"",epingle:ep,comments:coms,regroupe:true,createdAt:serverTimestamp()});
    for(const c of sel){ await deleteDoc(doc(db,COL,projet.id,"contributions",c.id)); mine.delete(c.id); } saveMine(); regroup=false; selected.clear(); toast("Regroupées",true); }catch(e){console.error(e);toast("Fusion impossible.");}
}

/* ---------- Navigation ---------- */
document.addEventListener("click", e=>{
  if(e.target.closest("[data-ident]")) return openIdent();
  const nw=e.target.closest("[data-new]");if(nw){if(!ident){toast("Identifiez-vous d'abord.");return openIdent();}return openNew();}
  const op=e.target.closest("[data-open]");if(op) return openProjet(op.dataset.open);
  if(e.target.closest("[data-overview]")){view="overview";return render();}
  if(e.target.closest("[data-matrice]")){view="matrice";return render();}
  if(e.target.closest("[data-plan]")){view="plan";return render();}
  const cc=e.target.closest("[data-concept]");if(cc) return openConcept(cc.dataset.concept);
  if(e.target.closest("[data-reperes]")) return openReperes();
  if(e.target.closest("[data-perso]")) return openPerso();
  if(e.target.closest("[data-jal-add]")) return openJalon();
  const jd=e.target.closest("[data-jal-del]"); if(jd) return delJalon(jd.dataset.jalDel);
  const ra=e.target.closest("[data-res-add]"); if(ra){ if(!ident){toast("Identifiez-vous d'abord.");return openIdent();} return openRessource(null, ra.dataset.resAdd||""); }
  const rEd=e.target.closest("[data-res-edit]"); if(rEd){ const r=curRes().find(x=>x.id===rEd.dataset.resEdit); if(r) openRessource(r); return; }
  const rDl=e.target.closest("[data-res-del]"); if(rDl){ if(confirm("Supprimer cette ressource ?")) delRessource(rDl.dataset.resDel); return; }
  const rTd=e.target.closest("[data-res-todo]"); if(rTd) return toggleResTodo(rTd.dataset.resTodo);
  const sl=e.target.closest("[data-sel]");if(sl){const id=sl.dataset.sel;selected.has(id)?selected.delete(id):selected.add(id);return render();}
  if(e.target.closest("[data-regroup]")){regroup=!regroup;selected.clear();return render();}
  if(e.target.closest("[data-merge]")) return fusionner();
  const nav=e.target.closest("[data-nav]");if(nav){const v=visIdx();const pos=v.indexOf(etapeIdx);etapeIdx=v[(pos+ +nav.dataset.nav+v.length)%v.length];view="etape";render();beat();return;}
  const et=e.target.closest("[data-etape]");if(et){etapeIdx=+et.dataset.etape;view="etape";regroup=false;selected.clear();render();beat();return;}
  if(e.target.closest("[data-fiche]")||e.target.closest("#ficheBtn")){view="fiche";return render();}
  if(e.target.closest("[data-presentation]")){view="presentation";window.scrollTo&&window.scrollTo(0,0);return render();}
  if(e.target.closest("#presShare")){const url=base+"?p="+projet.id+"&ro=1&vue=presentation";navigator.clipboard?.writeText(url).then(()=>toast("Lien présentation copié",true)).catch(()=>toast(url));return;}
  const vt=e.target.closest("[data-vote]");if(vt){const c=contribs.find(x=>x.id===vt.dataset.vote);if(!c)return;const arr=Array.isArray(c.votes)?c.votes.slice():[];const k=arr.indexOf(DEV);if(k>=0)arr.splice(k,1);else arr.push(DEV);return upd(vt.dataset.vote,{votes:arr});}
  const pcz=e.target.closest("[data-precise]");if(pcz){const c=contribs.find(x=>x.id===pcz.dataset.precise);if(!c)return;return upd(pcz.dataset.precise,{precise:!c.precise});}
  const pn=e.target.closest("[data-pin]");if(pn){const c=contribs.find(x=>x.id===pn.dataset.pin);return upd(pn.dataset.pin,{epingle:!c.epingle});}
  const lrb=e.target.closest("[data-lr]");if(lrb){ const p=lrb.dataset.lr.split(":"); return toggleLine(p[0], +p[1]); }
  const rdy=e.target.closest("[data-ready]");if(rdy) return toggleReady(rdy.dataset.ready);
  if(e.target.closest("[data-pilote-take]")){ if(!ident) return openIdent(); return setProj({pilote:{ini:ident.initiales,role:ident.role,color:ident.color||""}}); }
  if(e.target.closest("[data-pilote]")){ if(!ident) return openIdent(); const p=projet.pilote; if(p&&p.ini===ident.initiales) return setProj({pilote:null}); if(confirm("Devenir le pilote de ce projet ?")) return setProj({pilote:{ini:ident.initiales,role:ident.role,color:ident.color||""}}); return; }
  const ea=e.target.closest("[data-ecart]");if(ea) return openEcart(ea.dataset.ecart);
  const cu=e.target.closest("[data-cup]");if(cu) return moveContrib(cu.dataset.cup,-1);
  const cd=e.target.closest("[data-cdown]");if(cd) return moveContrib(cd.dataset.cdown,1);
  const ri=e.target.closest("[data-reint]");if(ri) return upd(ri.dataset.reint,{ecarte:false,raison:""});
  const ed=e.target.closest("[data-edit]");if(ed) return openEdit(ed.dataset.edit);
  const dl=e.target.closest("[data-del]");if(dl){ const c=contribs.find(x=>x.id===dl.dataset.del); if(confirm("Supprimer définitivement cette contribution ?\n\n« "+String(c&&c.texte||"").slice(0,100)+" »\n\nPour la mettre de côté sans la perdre, utilisez plutôt « Écarter » (⊘).")) delContribution(dl.dataset.del); return; }
  const cm=e.target.closest("[data-com]");if(cm){const inp=document.getElementById("com_"+cm.dataset.com);const v=inp?inp.value:"";if(inp)inp.value="";return addComment(cm.dataset.com,v);}
  const stt=e.target.closest("[data-statut]");if(stt) return setProj({statut:stt.dataset.statut});
  if(e.target.closest("[data-type-custom]")){ const lbl=prompt("Nom du type de projet :", projet.typeCustom||""); if(lbl&&lbl.trim()) setProj({type:"perso", typeCustom:lbl.trim()}); return; }
  const ty=e.target.closest("[data-type]");if(ty) return setProj({type:ty.dataset.type});
  const lk=e.target.closest("[data-lock]");if(lk) return toggleLock(lk.dataset.lock);
  if(e.target.closest("#print")) return window.print();
  if(e.target.closest("#word")) return exportWord();
  if(e.target.closest("#expJson")) return exportJSON();
  if(e.target.closest("#impJson")) return importJSON();
  if(e.target.closest("#delProj")) return delProjet();
  if(e.target.closest("#share")){const url=base+"?p="+projet.id+"&ro=1";navigator.clipboard?.writeText(url).then(()=>toast("Lien lecture copié",true)).catch(()=>toast(url));return;}
  if(e.target.closest("[data-close]")||e.target.id==="overlay") return closeSheet();
  if(e.target.closest("#identBtn")) return openIdent();
  if(e.target.closest("#sendContrib")){const t=$("#newContrib");const v=t?t.value:"";if(t)t.value="";const n=$("#nudge");if(n)n.hidden=true;return addContribution(v);}
  if(e.target.closest("#back")){ if(view==="liste"){location.href="../";return;} if(view!=="overview"){view="overview";regroup=false;selected.clear();return render();} stopPresence(); if(unsub){unsub();unsub=null;}if(unsubP){unsubP();unsubP=null;}view="liste";projet=null;contribs=[];render();loadListe();return; }
});
document.addEventListener("change", e=>{ const lk=e.target.closest("[data-link]"); if(lk) return upd(lk.dataset.link,{lien:e.target.value});
  const pf=e.target.closest("[data-pf]"); if(pf){const [f,cid]=pf.dataset.pf.split(":");return upd(cid,{[f]:e.target.value});} });
document.addEventListener("input", e=>{ if(e.target.id==="newContrib"){const t=e.target;t.style.height="auto";t.style.height=Math.min(t.scrollHeight,320)+"px";const n=$("#nudge");if(!n)return;const m=nudge(stepAt(etapeIdx)?.id,e.target.value);if(m){n.innerHTML=`${ic("info")}<span>${esc(m)}</span>`;n.hidden=false;}else n.hidden=true;} });
document.addEventListener("keydown", e=>{ if(e.key==="Escape")closeSheet();
  if(e.key==="Enter"&&!e.shiftKey){ if(e.target.id==="newContrib"){e.preventDefault();const v=e.target.value;e.target.value="";const n=$("#nudge");if(n)n.hidden=true;addContribution(v);} else if(e.target.id&&e.target.id.startsWith("com_")){e.preventDefault();const cid=e.target.id.slice(4);const v=e.target.value;e.target.value="";addComment(cid,v);} } });
window.addEventListener("beforeunload", ()=>{ try{stopPresence();}catch(_){} });

loadListe().then(()=>{const p=params.get("p");if(p)openProjet(p).then(()=>{if(params.get("vue")==="presentation"){view="presentation";render();}});});
render();
