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
};
const ic = n => ICONS[n] ? `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>` : "";

const ETAPES = [
  { id:"constats", nom:"Constats", icon:"eye", q:"Qu'est-ce qu'on observe concrètement ?", def:"On part du réel : ce qu'on voit, sans interpréter ni juger. Un constat est observable et vérifiable.", aide:"Décrire un comportement précis dans une situation précise.", ok:"Certains élèves quittent le cours quand ils ne comprennent pas la consigne.", non:"Les élèves sont immatures, ingérables." },
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
const avatar = (ini,cls="")=>`<span class="ava ${cls}" style="background:${colorFor(ini)}">${esc((ini||"?").slice(0,3))}</span>`;
const active = c=>!c.ecarte;
const sortC = arr => arr.slice().sort((a,b)=>(b.epingle?1:0)-(a.epingle?1:0) || (a._t)-(b._t));
const ofEt = id => sortC(contribs.filter(c=>c.etape===id && active(c)));
const ofEtAll = id => sortC(contribs.filter(c=>c.etape===id));
const isLocked = id => (projet?.locked||[]).includes(id);
const base = location.origin + location.pathname;
const pub = () => (TYPES.find(t=>t.id===projet?.type)||{}).pub || "l'élève";
const T = s => String(s==null?"":s).split("«PUB»").join(pub());
const isRapide = () => projet?.mode==="rapide";
const visIdx = () => { const set=new Set(isRapide()?RAPIDE:ETAPES.map(e=>e.id)); return ETAPES.map((e,i)=>i).filter(i=>set.has(ETAPES[i].id)); };

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
function beat(){ if(!ident||RO||!projet) return; const etId=(view==="etape")?ETAPES[etapeIdx].id:view; setDoc(doc(db,COL,projet.id,"presence",DEV),{initiales:ident.initiales,role:ident.role,etape:etId,lastSeen:Date.now()},{merge:true}).catch(()=>{}); }
function startPresence(id){ if(unsubPres){unsubPres();unsubPres=null;} presence=[]; try{ unsubPres=onSnapshot(collection(db,COL,id,"presence"),snap=>{ presence=snap.docs.map(d=>({id:d.id,...d.data()})); const el=$("#onlineInline"); if(el) el.innerHTML=onlineStrip(); }); }catch(_){} beat(); if(hb)clearInterval(hb); hb=setInterval(beat,20000); }
function stopPresence(){ if(hb){clearInterval(hb);hb=null;} if(unsubPres){unsubPres();unsubPres=null;} if(projet&&ident&&!RO){ deleteDoc(doc(db,COL,projet.id,"presence",DEV)).catch(()=>{}); } presence=[]; }
function onlineStrip(){ const on=onlineNow(); if(!on.length) return ""; return `<div class="online"><span class="muted" style="font-size:12px">${ic("users")} En ligne</span><div class="ava-row">${on.slice(0,8).map(p=>`<span title="${esc(p.role||"")} · ${esc(ETM[p.etape]?.nom||"")}">${avatar(p.initiales,"sm")}</span>`).join("")}${on.length>8?`<span class="ava sm" style="background:var(--faint)">+${on.length-8}</span>`:""}</div></div>`; }

/* ---------- Render ---------- */
function render(){
  const drafts={}; document.querySelectorAll("[data-keep]").forEach(el=>drafts[el.id]=el.value);
  const focusId = document.activeElement && document.activeElement.dataset && document.activeElement.dataset.keep!==undefined ? document.activeElement.id : null;
  const inProj = projet && view!=="liste";
  $("#backLabel").textContent = view==="liste" ? "Portail" : (view==="overview"?"Projets":"Projet");
  $("#title").textContent = inProj ? projet.titre : "Atelier projet";
  $("#subtitle").textContent = inProj ? ({overview:"Vue d'ensemble",fiche:"Fiche projet",matrice:"Alignement",plan:"Plan d'action"}[view]||ETAPES[etapeIdx]?.nom) : "Construire à plusieurs mains";
  const ib=$("#identBtn"); if(ident && !RO){ ib.hidden=false; ib.innerHTML=`${ic("user")} ${esc(ident.initiales)}`; } else ib.hidden=true;
  const fb=$("#ficheBtn"); fb.hidden = !(inProj && view!=="fiche"); fb.innerHTML=`${ic("file")} Fiche`;
  const showBar = inProj && view!=="overview";
  $("#etapebar").hidden = !showBar; if(showBar) renderEtapeBar();
  const map = { liste:viewListe, overview:viewOverview, etape:viewEtape, fiche:viewFiche, matrice:viewMatrice, plan:viewPlan };
  $("#view").innerHTML = (map[view]||viewListe)();
  document.querySelectorAll("[data-keep]").forEach(el=>{ if(drafts[el.id]!==undefined) el.value=drafts[el.id]; });
  if(focusId){ const el=document.getElementById(focusId); if(el){ el.focus(); try{el.selectionStart=el.selectionEnd=el.value.length;}catch(_){} } }
  if(view!=="etape") window.scrollTo&&window.scrollTo(0,0);
}
function renderEtapeBar(){
  const filled = new Set(contribs.filter(active).map(c=>c.etape));
  const vis = new Set(visIdx());
  $("#etapebar").innerHTML = `<button class="estep" data-overview>${ic("grid")}Vue d'ensemble</button>` +
    ETAPES.map((e,i)=>vis.has(i)?`<button class="estep ${view==="etape"&&i===etapeIdx?"active":""}" data-etape="${i}">${ic(e.icon)}${esc(e.nom)}${isLocked(e.id)?ic("lock"):(filled.has(e.id)?'<span class="dot"></span>':"")}</button>`:"").join("") +
    `<button class="estep ${view==="plan"?"active":""}" data-plan>${ic("table")}Plan d'action</button>` +
    `<button class="estep ${view==="matrice"?"active":""}" data-matrice>${ic("columns")}Alignement</button>` +
    `<button class="estep fiche ${view==="fiche"?"active":""}" data-fiche>${ic("file")}Fiche</button>`;
}

function viewListe(){
  const idCard = RO ? "" : (ident
    ? `<div class="card ident-card"><span class="ident-ava">${esc(ident.initiales.slice(0,3))}</span><div class="ic-tx"><strong>${esc(ident.initiales)}</strong><small>${esc(ident.role)}</small></div><button class="btn-mini" data-ident>Modifier</button></div>`
    : `<button class="card ident-card" data-ident style="width:100%;cursor:pointer"><span class="ident-ava">${ic("user")}</span><div class="ic-tx" style="text-align:left"><strong>Qui êtes-vous ?</strong><small>Initiales + rôle (RGPD : pas de nom)</small></div><span class="btn-mini">Définir</span></button>`);
  const banner = fbError ? `<div class="banner">${ic("alert")}<span><b>Activation Firestore requise.</b> Publiez les règles de <code>coordination_projets</code>.</span></div>` : "";
  const list = projets.length ? `<div class="proj-list">${projets.map(p=>{const mat=Math.round((p._etapes/ETAPES.length)*100);const st=STATUTS[p.statut]||STATUTS.brouillon;const ty=TYPES.find(t=>t.id===p.type);
    return `<button class="proj-card" data-open="${esc(p.id)}"><div style="display:flex;align-items:center;gap:8px"><h3 style="flex:1">${esc(p.titre)}</h3><span class="st-tag" style="--sc:${st.c}">${st.l}</span></div>${p.contexte?`<p>${esc(p.contexte)}</p>`:""}<div class="proj-meta">${ty?`<span class="ty-tag">${esc(ty.l)}</span>`:""}<span>${ic("users")} ${p._contribs}</span><span class="mbar"><i style="width:${mat}%"></i></span><span>${mat}%</span></div></button>`;}).join("")}</div>`
    : `<div class="empty">Aucun projet pour l'instant.${RO?"":" Créez le premier ci-dessous."}</div>`;
  return `${banner}<div class="hero"><h1>Atelier projet</h1><p>Construisez un projet d'équipe à plusieurs mains, étape par étape.</p></div>${idCard?`<div class="sec-title">${ic("user")} Votre identité</div>${idCard}`:""}<div class="sec-title">${ic("folder")} Les projets</div>${list}${RO?"":`<button class="new-proj" data-new style="margin-top:12px">${ic("plus")} Nouveau projet</button>`}`;
}

function viewOverview(){
  const vis=visIdx(); const visSet=new Set(vis.map(i=>ETAPES[i].id));
  const done=new Set(contribs.filter(active).map(c=>c.etape).filter(id=>visSet.has(id))).size;
  const pct=Math.round(done/vis.length*100);
  const st=STATUTS[projet.statut]||STATUTS.brouillon; const ty=TYPES.find(t=>t.id===projet.type);
  const firstTodo=vis.find(i=>!contribs.some(c=>c.etape===ETAPES[i].id && active(c)));
  const phaseCards=PHASES.map(ph=>{ const eids=ph.etapes.filter(id=>visSet.has(id)); if(!eids.length) return "";
    const chips=eids.map(eid=>{const e=ETM[eid];const i=ETAPES.findIndex(x=>x.id===eid);const n=contribs.filter(c=>c.etape===eid&&active(c)).length;const lock=isLocked(eid);
      return `<button class="ov-chip ${n?"done":""}" style="--pc:${ph.c}" data-etape="${i}"><span class="ov-ic">${n?ic("check"):ic(e.icon)}</span><span class="ov-n">${esc(e.nom)}</span>${lock?`<span class="ov-lock">${ic("lock")}</span>`:n?`<span class="ov-ct">${n}</span>`:""}</button>`;}).join("");
    const dn=eids.filter(eid=>contribs.some(c=>c.etape===eid&&active(c))).length;
    return `<div class="ov-phase" style="--pc:${ph.c}"><div class="ov-ph-h"><span class="ov-ph-nom">${esc(ph.nom)}</span><span class="ov-ph-pct">${dn}/${eids.length}</span></div><div class="ov-chips">${chips}</div></div>`;}).join("");
  const stRow = RO ? `<span class="st-tag" style="--sc:${st.c}">${st.l}</span>${ty?`<span class="ty-tag">${esc(ty.l)}</span>`:""}` :
    `<div class="st-row">${Object.entries(STATUTS).map(([k,v])=>`<button class="st-pick ${projet.statut===k||(!projet.statut&&k==="brouillon")?"on":""}" style="--sc:${v.c}" data-statut="${k}">${v.l}</button>`).join("")}</div>
     <div class="st-row" style="margin-top:7px">${TYPES.map(t=>`<button class="ty-pick ${projet.type===t.id||(!projet.type&&t.id==="peda")?"on":""}" data-type="${t.id}">${esc(t.l)}</button>`).join("")}</div>`;
  const modeRow = RO ? "" : `<button class="mode-btn" data-mode>${ic("toggle")} Mode : <b>${isRapide()?"rapide":"complet"}</b> — ${isRapide()?"6 étapes essentielles":"les 13 étapes"}</button>`;
  const syn=synthese();
  return `<div id="onlineInline">${onlineStrip()}</div>
    <div class="ov-head"><div class="ov-ring" style="--p:${pct}"><span>${pct}%</span></div><div class="ov-meta"><div class="ov-titre">${esc(projet.titre)}</div>${projet.contexte?`<div class="ov-ctx">${esc(projet.contexte)}</div>`:""}<div style="margin-top:9px">${stRow}</div></div></div>
    ${modeRow}
    ${firstTodo!=null&&!RO?`<button class="btn primary big" data-etape="${firstTodo}">${ic("bolt")} Continuer : ${esc(ETAPES[firstTodo].nom)}</button>`:""}
    <div class="sec-title">${ic("grid")} Les phases du projet</div><div class="ov-phases">${phaseCards}</div>
    ${syn?`<div class="sec-title">${ic("wand")} Synthèse automatique</div><div class="card syn-card">${esc(syn)}</div>`:""}
    <div class="fiche-actions" style="margin-top:16px"><button class="btn" data-plan>${ic("table")} Plan d'action</button><button class="btn" data-matrice>${ic("columns")} Alignement</button><button class="btn" data-fiche>${ic("file")} Fiche</button>${RO?"":`<button class="btn" id="share">${ic("send")} Partager (lecture)</button>`}</div>`;
}

function viewEtape(){
  const e=ETAPES[etapeIdx]; const list=ofEt(e.id); const ecartees=sortC(contribs.filter(c=>c.etape===e.id&&!active(c))); const locked=isLocked(e.id);
  const isLink = e.id==="actions"||e.id==="indicateurs"; const objs=ofEt("obj_op");
  const exemples=(e.ok||e.non)?`<div class="exemples">${e.ok?`<div class="ex ok">${ic("check")}<span><b>À préférer —</b> ${esc(e.ok)}</span></div>`:""}${e.non?`<div class="ex non">${ic("x")}<span><b>À éviter —</b> ${esc(e.non)}</span></div>`:""}</div>`:"";
  let contexte="";
  if(etapeIdx===0){ if(projet.contexte) contexte=`<details class="context" open><summary>${ic("folder")} Le contexte du projet</summary><div class="ctx-body"><p>${esc(projet.contexte)}</p></div></details>`; }
  else { const prevI=visIdx().filter(i=>i<etapeIdx).pop(); if(prevI!=null){ const prev=ETAPES[prevI]; const pl=ofEt(prev.id); const body=pl.length?`<ul>${pl.map(c=>`<li>${c.epingle?ic("star"):""}${esc(c.texte)} <span class="by">— ${esc(c.role)}</span></li>`).join("")}</ul>`:`<p class="vide">Rien encore à l'étape « ${esc(prev.nom)} ».</p>`; contexte=`<details class="context" open><summary>${ic(prev.icon)} S'appuie sur : ${esc(prev.nom)}</summary><div class="ctx-body">${body}</div></details>`; } }
  const card=c=>{ const coms=c.comments||[]; const sel=selected.has(c.id);
    const linkSel = isLink && !regroup ? `<div class="link-sel">${ic("link")}<select data-link="${esc(c.id)}"><option value="">↳ Sert un objectif…</option>${objs.map(o=>`<option value="${esc(o.id)}" ${c.lien===o.id?"selected":""}>${esc(o.texte.slice(0,40))}</option>`).join("")}</select></div>` : "";
    return `<article class="contrib ${c.epingle?"top":""} ${regroup?"selectable":""} ${sel?"sel":""}" ${regroup?`data-sel="${esc(c.id)}"`:""}>
      ${regroup?`<span class="chk ${sel?"on":""}">${sel?ic("check"):""}</span>`:avatar(c.initiales)}
      <div class="cb"><div class="cmeta">${c.epingle?`<span class="ctop-tag">${ic("star")} retenu</span>`:""}<b style="color:var(--ink);font-weight:600">${esc(c.role||"—")}</b> · ${esc(c.initiales||"")}${c.editedAt?' · modifié':''}</div>
        <div class="ctext">${esc(c.texte)}</div>${linkSel}
        ${regroup?"":`<div class="cact">${RO?"":`<button class="pin ${c.epingle?"on":""}" data-pin="${esc(c.id)}">${ic("star")} ${c.epingle?"Retenu":"Retenir"}</button><button class="cmini" data-ecart="${esc(c.id)}" title="Écarter">${ic("ban")}</button>`}${(!RO&&mine.has(c.id))?`<button class="cmini" data-edit="${esc(c.id)}">${ic("pencil")}</button><button class="cmini" data-del="${esc(c.id)}">${ic("trash")}</button>`:""}</div>
        <details class="comments"><summary>${ic("comment")} Commentaires${coms.length?` (${coms.length})`:""}</summary><div class="com-list">${coms.map(k=>`<div class="com"><b>${esc(k.role)}</b> · ${esc(k.ini)} : ${esc(k.txt)}</div>`).join("")}</div>${RO?"":`<div class="com-add"><input data-keep id="com_${esc(c.id)}" placeholder="Répondre…"><button class="cmini" data-com="${esc(c.id)}">${ic("send")}</button></div>`}</details>`}
      </div></article>`; };
  const cards=list.length?list.map(card).join(""):`<div class="empty">Personne n'a encore contribué à cette étape.${locked||RO?"":" Lancez-vous !"}</div>`;
  const ecartBlock = ecartees.length?`<details class="ecart-block"><summary>${ic("ban")} Écartées (${ecartees.length})</summary>${ecartees.map(c=>`<div class="ecart"><div class="ec-tx">${esc(c.texte)} <span class="by">— ${esc(c.role)}</span>${c.raison?`<div class="ec-r">Raison : ${esc(c.raison)}</div>`:""}</div>${RO?"":`<button class="cmini" data-reint="${esc(c.id)}" title="Réintégrer">${ic("check")}</button>`}</div>`).join("")}</details>`:"";
  const lockBtn=RO?"":`<button class="lock-btn ${locked?"on":""}" data-lock="${e.id}">${ic(locked?"lock":"unlock")} ${locked?"Verrouillée":"Verrouiller"}</button>`;
  const regroupBar = (!RO&&!locked&&list.length>1) ? (regroup?`<div class="regroup-bar"><span>${selected.size} sélectionné(s)</span><button class="btn-mini" data-merge ${selected.size<2?"disabled":""}>${ic("merge")} Fusionner</button><button class="btn-mini" data-regroup>Annuler</button></div>`:`<button class="btn-mini regroup-toggle" data-regroup>${ic("merge")} Regrouper</button>`) : "";
  const addZone=(RO||locked||regroup)?(locked?`<div class="locked-note">${ic("lock")} Étape verrouillée — contributions figées.</div>`:"") :
    `<div class="add-row top">${avatar(ident?ident.initiales:"?")}<div style="flex:1"><textarea data-keep id="newContrib" rows="1" placeholder="${ident?"Ajouter votre "+e.nom.toLowerCase()+"…":"Identifiez-vous pour contribuer…"}"></textarea><div class="nudge" id="nudge" hidden></div></div><button class="send" id="sendContrib" aria-label="Ajouter">${ic("send")}</button></div>`;
  return `<div class="etape-head" style="--pc:${(PHASES.find(p=>p.etapes.includes(e.id))||{}).c||'var(--accent)'}"><div class="eh-top"><span class="et-ic ph">${ic(e.icon)}</span><div style="flex:1"><div class="eyebrow">Étape ${visIdx().indexOf(etapeIdx)+1} / ${visIdx().length}</div><h2>${esc(e.nom)}</h2></div>${lockBtn}</div>
    <div class="et-q">${esc(T(e.q))}</div><div class="et-def">${esc(T(e.def))}</div>
    <button class="concept-btn" data-concept="${e.id}">${ic("help")} Comprendre la notion</button>
    <div class="et-aide">${ic("info")}<span>${esc(T(e.aide))}</span></div>${exemples}</div>
    ${contexte}${addZone}${regroupBar}<div class="contribs">${cards}</div>${ecartBlock}
    <div class="pager"><button class="pgr" data-nav="-1">${ic("back")}<span>Précédent</span></button><button class="pgr next" data-nav="1"><span>Suivant</span>${ic("chev")}</button></div>`;
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

function ficheBodyHTML(){
  const byEt={}; contribs.filter(active).forEach(c=>{(byEt[c.etape]=byEt[c.etape]||[]).push(c);});
  const syn=synthese();
  const sections=ETAPES.map(e=>{ const items=sortC(byEt[e.id]||[]); let body;
    if(!items.length) body=`<p class="vide">À compléter.</p>`;
    else { const ep=items.filter(c=>c.epingle), au=items.filter(c=>!c.epingle); body=ep.map(c=>`<div class="retenu">${esc(c.texte)}</div>`).join("")+(au.length?`<ul>${au.map(c=>`<li>${esc(c.texte)} <span class="by">— ${esc(c.role)}</span></li>`).join("")}</ul>`:""); }
    return `<section><h2>${esc(e.nom)}</h2>${body}</section>`;}).join("");
  const acts=ofEt("actions").filter(a=>a.resp||a.ech||a.pst);
  const plan=acts.length?`<section><h2>Plan d'action</h2><table border="1" cellpadding="5" style="border-collapse:collapse;width:100%;font-size:13px"><tr><th align="left">Action</th><th align="left">Responsable</th><th align="left">Échéance</th><th align="left">Statut</th></tr>${acts.map(a=>`<tr><td>${esc(a.texte)}</td><td>${esc(a.resp||"—")}</td><td>${esc(a.ech||"—")}</td><td>${esc((PST[a.pst||"todo"]).l)}</td></tr>`).join("")}</table></section>`:"";
  return `<h1>${esc(projet.titre)}</h1>${projet.contexte?`<p class="doc-ctx">${esc(projet.contexte)}</p>`:""}${syn?`<section class="syn-sec"><h2>Synthèse</h2><p>${esc(syn)}</p></section>`:""}${sections}${plan}`;
}
function viewFiche(){ return `<div class="fiche-actions"><button class="btn" data-overview>${ic("back")} Vue d'ensemble</button><button class="btn" id="word">${ic("word")} Word</button><button class="btn primary" id="print">${ic("printer")} Imprimer / PDF</button></div><div class="doc">${ficheBodyHTML()}</div>`; }
function exportWord(){
  const css=`body{font-family:Calibri,Arial,sans-serif;color:#1a1a1a;font-size:11pt;line-height:1.5}h1{font-size:20pt;color:#26365a}h2{font-size:12pt;color:#2f6cd6;border-bottom:1px solid #ccc;padding-bottom:3px;margin-top:18px}.doc-ctx{color:#555;font-style:italic}.retenu{background:#eef3fb;padding:6px 10px;border-left:3px solid #2f6cd6;margin:4px 0}ul{margin:4px 0}li{margin-bottom:3px}.by{color:#888;font-size:9pt}.vide{color:#999;font-style:italic}.syn-sec p{background:#f3f5f9;padding:10px}table{margin-top:6px}`;
  const html=`<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'><head><meta charset='utf-8'><style>${css}</style></head><body>${ficheBodyHTML()}</body></html>`;
  const blob=new Blob(['﻿'+html],{type:'application/msword'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=(projet.titre||'projet').replace(/[^\w -]/g,'')+'.doc'; a.click();
}

/* ---------- Overlay ---------- */
function openSheet(html){ $("#overlay").innerHTML=`<div class="sheet">${html}</div>`; $("#overlay").classList.add("show"); }
function closeSheet(){ $("#overlay").classList.remove("show"); $("#overlay").innerHTML=""; }
function openIdent(){
  openSheet(`<div class="sheet-head"><h3>Votre identité</h3><button class="x" data-close>${ic("x")}</button></div><p class="muted" style="font-size:13.5px;margin:0 0 14px">RGPD : seulement vos <b>initiales</b> et votre <b>rôle</b> — jamais de nom.</p><div class="field"><label for="iIni">Vos initiales</label><input id="iIni" maxlength="4" placeholder="ex. B.D." value="${esc(ident?ident.initiales:"")}" style="text-transform:uppercase;font-weight:700"></div><div class="field"><label>Votre rôle</label><div class="roles" id="iRoles">${ROLES.map(r=>`<button type="button" class="role-chip ${ident&&ident.role===r?"sel":""}" data-role="${esc(r)}">${esc(r)}</button>`).join("")}</div></div><div class="actions"><button class="btn primary" id="saveIdent">${ic("check")} Enregistrer</button></div>`);
  let role=ident?ident.role:""; $("#iRoles").querySelectorAll("[data-role]").forEach(b=>b.onclick=()=>{role=b.dataset.role;$("#iRoles").querySelectorAll(".role-chip").forEach(x=>x.classList.toggle("sel",x===b));});
  $("#saveIdent").onclick=()=>{const ini=$("#iIni").value.trim().toUpperCase();if(!ini){toast("Indiquez vos initiales.");return;}if(!role){toast("Choisissez votre rôle.");return;}ident={initiales:ini,role};localStorage.setItem("projets_ident_v1",JSON.stringify(ident));closeSheet();render();beat();toast("Identité enregistrée",true);};
}
function openNew(){
  let m=MODELES[0], type=m.type;
  openSheet(`<div class="sheet-head"><h3>Nouveau projet</h3><button class="x" data-close>${ic("x")}</button></div><div class="field"><label>Partir d'un modèle</label><div class="roles" id="mods">${MODELES.map((x,i)=>`<button type="button" class="role-chip ${i===0?"sel":""}" data-mod="${i}">${esc(x.t)}</button>`).join("")}</div></div><div class="field"><label>Type de projet <span class="muted" style="font-weight:400">(adapte le vocabulaire)</span></label><div class="roles" id="tys">${TYPES.map(t=>`<button type="button" class="role-chip ${t.id===type?"sel":""}" data-ty="${t.id}">${esc(t.l)}</button>`).join("")}</div></div><div class="field"><label for="pTit">Titre</label><input id="pTit" placeholder="ex. Action de prévention"></div><div class="field"><label for="pCtx">Contexte (optionnel)</label><textarea id="pCtx" placeholder="Le public, le besoin observé…"></textarea></div><div class="actions"><button class="btn primary" id="createP">${ic("plus")} Créer le projet</button></div>`);
  const selTy=()=>$("#tys").querySelectorAll("[data-ty]").forEach(x=>x.classList.toggle("sel",x.dataset.ty===type));
  $("#mods").querySelectorAll("[data-mod]").forEach(b=>b.onclick=()=>{m=MODELES[+b.dataset.mod];type=m.type;$("#mods").querySelectorAll(".role-chip").forEach(x=>x.classList.toggle("sel",x===b));$("#pTit").value=m.titre;$("#pCtx").value=m.ctx;selTy();});
  $("#tys").querySelectorAll("[data-ty]").forEach(b=>b.onclick=()=>{type=b.dataset.ty;selTy();});
  $("#createP").onclick=async()=>{const titre=$("#pTit").value.trim();if(!titre){toast("Donnez un titre.");return;}const btn=$("#createP");btn.disabled=true;btn.textContent="Création…";try{const ref=await addDoc(collection(db,COL),{titre,contexte:$("#pCtx").value.trim(),statut:"construction",type,mode:"complet",locked:[],createdAt:serverTimestamp()});closeSheet();await openProjet(ref.id);}catch(e){console.error(e);fbError=true;btn.disabled=false;btn.innerHTML=`${ic("plus")} Créer le projet`;toast("Enregistrement impossible.");}};
}
function openEdit(cid){const c=contribs.find(x=>x.id===cid);if(!c)return;openSheet(`<div class="sheet-head"><h3>Modifier</h3><button class="x" data-close>${ic("x")}</button></div><div class="field"><textarea id="eTxt" rows="4">${esc(c.texte)}</textarea></div><div class="actions"><button class="btn primary" id="saveEdit">${ic("check")} Enregistrer</button></div>`);
  $("#saveEdit").onclick=async()=>{const v=$("#eTxt").value.trim();if(!v){toast("Texte vide.");return;}try{await updateDoc(doc(db,COL,projet.id,"contributions",cid),{texte:v,editedAt:Date.now()});closeSheet();saved();}catch(e){console.error(e);toast("Modification impossible.");}};}
function openConcept(eid){
  const c=CONCEPTS[eid]; if(!c) return; const e=ETM[eid]; const pc=(PHASES.find(p=>p.etapes.includes(eid))||{}).c||"var(--accent)";
  openSheet(`<div class="concept" style="--pc:${pc}"><div class="cc-head"><span class="cc-ic">${ic(e.icon)}</span><div class="cc-h-tx"><div class="cc-eyebrow">La notion</div><h3>${esc(e.nom)}</h3></div><button class="x" data-close>${ic("x")}</button></div>
    <div class="cc-block"><div class="cc-lab">Ce que c'est</div><p>${esc(T(c.quoi))}</p></div>
    ${c.dist?`<div class="cc-block cc-dist"><div class="cc-lab">${ic("alert")} À ne pas confondre</div><p><b>${esc(c.dist[0])}.</b> ${esc(T(c.dist[1]))}</p></div>`:""}
    ${c.ex?`<div class="cc-block"><div class="cc-lab">${ic("bolt")} Un exemple</div><p class="cc-ex">${esc(T(c.ex))}</p></div>`:""}
    ${c.formule?`<div class="cc-block cc-formule"><div class="cc-lab">La formule</div><p>${esc(T(c.formule))}</p></div>`:""}
    ${c.verbes?`<div class="cc-block"><div class="cc-lab">${ic("checklist")} Verbes d'action conseillés</div><div class="cc-verbes">${c.verbes.map(([n,v])=>`<div class="cc-vrow"><span class="cc-vn">${esc(n)}</span><span class="cc-vv">${esc(v)}</span></div>`).join("")}</div></div>`:""}
    ${c.src?`<p class="cc-src">${esc(c.src)}</p>`:""}</div>`);
}
function openEcart(cid){ openSheet(`<div class="sheet-head"><h3>Écarter cette contribution</h3><button class="x" data-close>${ic("x")}</button></div><p class="muted" style="font-size:13.5px;margin:0 0 12px">Elle sortira de la fiche, mais restera consultable.</p><div class="field"><label for="eR">Raison (optionnel)</label><input id="eR" placeholder="ex. hors périmètre, redondant…"></div><div class="actions"><button class="btn primary" id="doEcart">${ic("ban")} Écarter</button></div>`);
  $("#doEcart").onclick=async()=>{try{await updateDoc(doc(db,COL,projet.id,"contributions",cid),{ecarte:true,raison:$("#eR").value.trim()});closeSheet();saved();}catch(e){console.error(e);toast("Action impossible.");}};}

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
async function addContribution(texte){ if(!ident){openIdent();return;} texte=texte.trim(); if(!texte) return; if(isLocked(ETAPES[etapeIdx].id)){toast("Étape verrouillée.");return;}
  try{const ref=await addDoc(collection(db,COL,projet.id,"contributions"),{etape:ETAPES[etapeIdx].id,texte,initiales:ident.initiales,role:ident.role,epingle:false,comments:[],createdAt:serverTimestamp()});mine.add(ref.id);saveMine();saved();}catch(e){console.error(e);toast("Envoi impossible.");}}
async function upd(cid,obj){try{await updateDoc(doc(db,COL,projet.id,"contributions",cid),obj);saved();}catch(e){console.error(e);toast("Action impossible.");}}
async function delContribution(cid){try{await deleteDoc(doc(db,COL,projet.id,"contributions",cid));mine.delete(cid);saveMine();saved();}catch(e){console.error(e);toast("Suppression impossible.");}}
async function addComment(cid,txt){if(!ident){openIdent();return;}txt=txt.trim();if(!txt)return;const c=contribs.find(x=>x.id===cid);if(!c)return;const coms=[...(c.comments||[]),{ini:ident.initiales,role:ident.role,txt,t:Date.now()}];upd(cid,{comments:coms});}
async function setProj(obj){try{await updateDoc(doc(db,COL,projet.id),obj);saved();}catch(e){console.error(e);toast("Action impossible.");}}
async function toggleLock(eid){const cur=projet.locked||[];setProj({locked:cur.includes(eid)?cur.filter(x=>x!==eid):[...cur,eid]});}
async function fusionner(){ if(!ident){openIdent();return;} const sel=contribs.filter(c=>selected.has(c.id)); if(sel.length<2) return;
  const txt=sel.map(c=>c.texte).join("\n• ").replace(/^/,"• "); const ep=sel.some(c=>c.epingle); const coms=sel.flatMap(c=>c.comments||[]);
  try{ await addDoc(collection(db,COL,projet.id,"contributions"),{etape:ETAPES[etapeIdx].id,texte:txt,initiales:ident.initiales,role:ident.role,epingle:ep,comments:coms,regroupe:true,createdAt:serverTimestamp()});
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
  const sl=e.target.closest("[data-sel]");if(sl){const id=sl.dataset.sel;selected.has(id)?selected.delete(id):selected.add(id);return render();}
  if(e.target.closest("[data-regroup]")){regroup=!regroup;selected.clear();return render();}
  if(e.target.closest("[data-merge]")) return fusionner();
  const nav=e.target.closest("[data-nav]");if(nav){const v=visIdx();const pos=v.indexOf(etapeIdx);etapeIdx=v[(pos+ +nav.dataset.nav+v.length)%v.length];view="etape";render();beat();return;}
  const et=e.target.closest("[data-etape]");if(et){etapeIdx=+et.dataset.etape;view="etape";regroup=false;selected.clear();render();beat();return;}
  if(e.target.closest("[data-fiche]")||e.target.closest("#ficheBtn")){view="fiche";return render();}
  const pn=e.target.closest("[data-pin]");if(pn){const c=contribs.find(x=>x.id===pn.dataset.pin);return upd(pn.dataset.pin,{epingle:!c.epingle});}
  const ea=e.target.closest("[data-ecart]");if(ea) return openEcart(ea.dataset.ecart);
  const ri=e.target.closest("[data-reint]");if(ri) return upd(ri.dataset.reint,{ecarte:false,raison:""});
  const ed=e.target.closest("[data-edit]");if(ed) return openEdit(ed.dataset.edit);
  const dl=e.target.closest("[data-del]");if(dl) return delContribution(dl.dataset.del);
  const cm=e.target.closest("[data-com]");if(cm){const inp=document.getElementById("com_"+cm.dataset.com);const v=inp?inp.value:"";if(inp)inp.value="";return addComment(cm.dataset.com,v);}
  const stt=e.target.closest("[data-statut]");if(stt) return setProj({statut:stt.dataset.statut});
  const ty=e.target.closest("[data-type]");if(ty) return setProj({type:ty.dataset.type});
  if(e.target.closest("[data-mode]")) return setProj({mode:isRapide()?"complet":"rapide"});
  const lk=e.target.closest("[data-lock]");if(lk) return toggleLock(lk.dataset.lock);
  if(e.target.closest("#print")) return window.print();
  if(e.target.closest("#word")) return exportWord();
  if(e.target.closest("#share")){const url=base+"?p="+projet.id+"&ro=1";navigator.clipboard?.writeText(url).then(()=>toast("Lien lecture copié",true)).catch(()=>toast(url));return;}
  if(e.target.closest("[data-close]")||e.target.id==="overlay") return closeSheet();
  if(e.target.closest("#identBtn")) return openIdent();
  if(e.target.closest("#sendContrib")){const t=$("#newContrib");const v=t?t.value:"";if(t)t.value="";const n=$("#nudge");if(n)n.hidden=true;return addContribution(v);}
  if(e.target.closest("#back")){ if(view==="liste"){location.href="../";return;} if(view!=="overview"){view="overview";regroup=false;selected.clear();return render();} stopPresence(); if(unsub){unsub();unsub=null;}if(unsubP){unsubP();unsubP=null;}view="liste";projet=null;contribs=[];render();loadListe();return; }
});
document.addEventListener("change", e=>{ const lk=e.target.closest("[data-link]"); if(lk) return upd(lk.dataset.link,{lien:e.target.value});
  const pf=e.target.closest("[data-pf]"); if(pf){const [f,cid]=pf.dataset.pf.split(":");return upd(cid,{[f]:e.target.value});} });
document.addEventListener("input", e=>{ if(e.target.id==="newContrib"){const n=$("#nudge");if(!n)return;const m=nudge(ETAPES[etapeIdx].id,e.target.value);if(m){n.innerHTML=`${ic("info")}<span>${esc(m)}</span>`;n.hidden=false;}else n.hidden=true;} });
document.addEventListener("keydown", e=>{ if(e.key==="Escape")closeSheet();
  if(e.key==="Enter"&&!e.shiftKey){ if(e.target.id==="newContrib"){e.preventDefault();const v=e.target.value;e.target.value="";const n=$("#nudge");if(n)n.hidden=true;addContribution(v);} else if(e.target.id&&e.target.id.startsWith("com_")){e.preventDefault();const cid=e.target.id.slice(4);const v=e.target.value;e.target.value="";addComment(cid,v);} } });
window.addEventListener("beforeunload", ()=>{ try{stopPresence();}catch(_){} });

loadListe().then(()=>{const p=params.get("p");if(p)openProjet(p);});
render();
