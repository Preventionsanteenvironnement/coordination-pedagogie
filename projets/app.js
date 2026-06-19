/* ============================================================================
   Atelier projet — moteur (devoirs-pse / coordination_projets). Temps réel,
   RGPD (initiales + rôle). Vue d'ensemble par phases, garde-fous méthodo,
   synthèse auto, export Word, verrouillage d'étape, commentaires, lecture seule.
============================================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, doc, addDoc, getDocs, getDoc, onSnapshot, updateDoc, deleteDoc,
  serverTimestamp, query, orderBy }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAWdCMvOiAJln3eT9LIAQD3RWJUD0lQcLI",
  authDomain: "devoirs-pse.firebaseapp.com",
  projectId: "devoirs-pse",
  storageBucket: "devoirs-pse.firebasestorage.app",
  messagingSenderId: "614730413904",
  appId: "1:614730413904:web:a5dd478af5de30f6bede55"
};
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
};
const ic = n => ICONS[n] ? `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>` : "";

const ETAPES = [
  { id:"constats", nom:"Constats", icon:"eye", q:"Qu'est-ce qu'on observe concrètement ?",
    def:"On part du réel : ce qu'on voit, sans interpréter ni juger. Un constat est observable et vérifiable.",
    aide:"Décrire un comportement précis dans une situation précise.",
    ok:"Certains élèves quittent le cours quand ils ne comprennent pas la consigne.", non:"Les élèves sont immatures, ingérables." },
  { id:"diagnostic", nom:"Diagnostic", icon:"stethoscope", q:"Qu'est-ce que ces constats révèlent comme besoin réel ?",
    def:"Le constat décrit ; le diagnostic comprend. On cherche les mécanismes derrière ce qu'on observe.",
    aide:"Relisez les constats ci-dessus et demandez : « de quoi est-ce le signe ? »." },
  { id:"problematique", nom:"Problématique", icon:"help", q:"Quel problème précis allons-nous traiter ?",
    def:"La question centrale du projet. Ni trop large (« aider les élèves »), ni une solution déguisée (« créer une permanence »).",
    aide:"Formulez une vraie question. Marquez d'un ★ celle que l'équipe retient." },
  { id:"finalite", nom:"Finalité", icon:"compass", q:"Pourquoi fait-on ce projet ? Le cap.",
    def:"Le sens large, la direction. Elle n'est pas mesurable — c'est l'horizon, pas l'objectif précis.",
    aide:"Ex. « Favoriser l'accrochage scolaire et social des élèves »." },
  { id:"obj_general", nom:"Objectif général", icon:"target", q:"Qu'est-ce que le dispositif doit permettre à l'élève de faire ?",
    def:"La capacité visée — concrète, contrairement à la finalité. Ce que l'élève saura faire.",
    aide:"Ex. « Identifier une difficulté, repérer une ressource et préparer une action »." },
  { id:"obj_op", nom:"Objectifs opérationnels", icon:"checklist", q:"Qu'est-ce qu'on travaille concrètement et qu'on pourra vérifier ?",
    def:"On rend l'objectif général observable, en plusieurs objectifs vérifiables.",
    aide:"Verbes d'action : identifier, repérer, formuler, préparer, réaliser. À éviter : comprendre, améliorer, favoriser." },
  { id:"actions", nom:"Actions", icon:"bolt", q:"Quelles actions concrètes répondent aux objectifs ?",
    def:"Ce qu'on met réellement en place. Chaque action doit servir un objectif opérationnel.",
    aide:"Ex. fiche « je prépare ma demande », carte des ressources, fiche retour après absence…" },
  { id:"moyens", nom:"Moyens", icon:"tool", q:"De quels moyens a-t-on besoin ?",
    def:"Les ressources nécessaires : humaines, matérielles, partenaires.",
    aide:"Salle, adulte référent, fiches, ENT/Pronote, liens CPE/PP/DDFPT/infirmière/PsyEN…" },
  { id:"miseoeuvre", nom:"Mise en œuvre", icon:"calendar", q:"Où, quand, combien de temps ?",
    def:"Le concret de terrain : sans calendrier ni lieu, un projet reste une intention.",
    aide:"Lieu · créneau · période de l'année · durée · fréquence · échéances et bilans d'étape." },
  { id:"cadre", nom:"Cadre", icon:"shield", q:"Quelles sont les limites du dispositif ?",
    def:"Ce que le dispositif ne fait pas. Le cadre protège le projet des dérives.",
    aide:"Ex. pas de sanction, pas de suivi psy, pas de remplacement du CPE, sortie obligatoire avec une action…" },
  { id:"indicateurs", nom:"Indicateurs", icon:"chart", q:"À quoi verra-t-on que ça marche ?",
    def:"Les signes observables ou mesurables du suivi. Peu, mais utiles.",
    aide:"Ex. nombre de passages, ressources identifiées, demandes préparées, actions de sortie." },
  { id:"evaluation", nom:"Évaluation", icon:"clipboard", q:"Comment évalue-t-on ?",
    def:"Trois niveaux : l'activité, les résultats immédiats, les effets. Prévue dès le départ.",
    aide:"Bilans par période, analyse des usages, ajustements." },
  { id:"vigilance", nom:"Points de vigilance", icon:"alert", q:"Quels risques anticiper ?",
    def:"Les pièges à éviter pour que le projet ne dévie pas de son intention.",
    aide:"Ex. confusion avec la vie scolaire, sanction déguisée, espace refuge, attentes trop larges." },
];
const ETM = Object.fromEntries(ETAPES.map(e=>[e.id,e]));
const PHASES = [
  { nom:"Comprendre", c:"#2f6cd6", etapes:["constats","diagnostic","problematique"] },
  { nom:"Viser", c:"#0f8a76", etapes:["finalite","obj_general","obj_op"] },
  { nom:"Agir", c:"#d2603a", etapes:["actions","moyens","miseoeuvre"] },
  { nom:"Cadrer & évaluer", c:"#6b4bd6", etapes:["cadre","indicateurs","evaluation","vigilance"] },
];
const STATUTS = { brouillon:{l:"Brouillon",c:"#8b94a3"}, construction:{l:"En construction",c:"#2f6cd6"}, valide:{l:"Validé",c:"#0f8a76"}, archive:{l:"Archivé",c:"#9a6b16"} };
const ROLES = ["Prof", "Prof PSE", "Prof principal", "Enseignant pro", "CPE", "DDFPT", "Infirmier·ère", "PsyEN", "AESH / Coordo ULIS", "Direction", "Documentaliste", "Autre"];
const MODELES = [
  { t:"Projet vierge", titre:"", ctx:"" },
  { t:"Permanence ressource", titre:"Permanence Ressource Accroche", ctx:"Lycée pro (CAP / Bac pro). Espace libre, non disciplinaire, pour aider l'élève à clarifier une difficulté, repérer une ressource et préparer une action." },
  { t:"Action prévention / CPS", titre:"Action prévention — CPS", ctx:"Public lycée pro. Renforcer des compétences psychosociales dans des situations concrètes du quotidien scolaire." },
  { t:"Projet d'établissement", titre:"Axe du projet d'établissement", ctx:"Contribution d'équipe à un axe du projet d'établissement : état des lieux, priorités, actions." },
];
const PALETTE = ["#534ab7","#0f6e56","#993c1d","#185fa5","#9a5f0a","#993556","#3c6e3c","#5a6b8c"];
const colorFor = s => PALETTE[[...String(s||"?")].reduce((a,c)=>a+c.charCodeAt(0),0) % PALETTE.length];

/* ---------- État ---------- */
const params = new URLSearchParams(location.search);
const RO = params.get("ro")==="1";
let ident = JSON.parse(localStorage.getItem("projets_ident_v1") || "null");
let mine = new Set(JSON.parse(localStorage.getItem("projets_mine_v1") || "[]"));
let view = "liste";
let projets = [];
let projet = null;
let contribs = [];
let etapeIdx = 0;
let unsub = null, unsubP = null;
let fbError = false;

const $ = s => document.querySelector(s);
const esc = v => String(v ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
const norm = s => String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2400);}
function saveMine(){localStorage.setItem("projets_mine_v1",JSON.stringify([...mine]));}
const avatar = (ini)=>`<span class="ava" style="background:${colorFor(ini)}">${esc((ini||"?").slice(0,3))}</span>`;
const sortC = arr => arr.slice().sort((a,b)=>(b.epingle?1:0)-(a.epingle?1:0) || (a._t)-(b._t));
const ofEt = id => sortC(contribs.filter(c=>c.etape===id));
const isLocked = id => (projet?.locked||[]).includes(id);
const base = location.origin + location.pathname;

/* ---------- Garde-fous méthodo ---------- */
function nudge(etapeId, txt){
  const t = norm(txt).trim(); if(!t) return null;
  if(etapeId==="constats"){
    const jug=["immature","ingerable","faineant","paresseux","ne veulent rien","nul ","betes","insupportable","penible"];
    if(jug.some(w=>t.includes(w))) return "Cela ressemble à un jugement. Décrivez plutôt un comportement observable.";
  }
  if(etapeId==="problematique"){
    if(/^(creer|mettre en place|installer|ouvrir|monter|faire) (une|un|le|la|des|l')/.test(t)) return "Cela ressemble à une solution, pas à une problématique. Reformulez en question (« Comment… ? »).";
    if(!txt.includes("?")) return "Une problématique se formule en question — pensez au « ? ».";
  }
  if(etapeId==="obj_op"){
    const flou=["comprendre","prendre conscience","ameliorer","favoriser","developper","sensibiliser","apprehender"];
    const hit=flou.find(w=>t.includes(w));
    if(hit) return `« ${hit} » est trop flou pour un objectif opérationnel. Préférez un verbe vérifiable : identifier, repérer, formuler, préparer, réaliser.`;
  }
  return null;
}

/* ---------- Synthèse narrative ---------- */
function synthese(){
  const pick = id => { const its=ofEt(id); return (its.find(c=>c.epingle)||its[0])?.texte; };
  const low = s => s ? s.replace(/\.$/,"").trim().replace(/^[A-ZÀ-Ý]/, m=>m.toLowerCase()) : "";
  const cons = ofEt("constats").slice(0,3).map(c=>low(c.texte));
  const diag=pick("diagnostic"), prob=pick("problematique"), og=pick("obj_general")||pick("finalite");
  const act = ofEt("actions").map(c=>low(c.texte)), ind = ofEt("indicateurs").map(c=>low(c.texte));
  const p=[];
  if(cons.length) p.push(`Nous observons que ${cons.join(" ; ")}.`);
  if(diag) p.push(`Nous comprenons que ${low(diag)}.`);
  if(prob) p.push(`Notre question : ${prob.replace(/\?*$/,"")} ?`);
  if(og) p.push(`Nous voulons permettre à l'élève de ${low(og)}.`);
  if(act.length) p.push(`Nous proposons donc : ${act.join(", ")}.`);
  if(ind.length) p.push(`Nous vérifierons à partir de : ${ind.join(", ")}.`);
  return p.join(" ");
}

/* ---------- Render ---------- */
function render(){
  const drafts={}; document.querySelectorAll("[data-keep]").forEach(el=>drafts[el.id]=el.value);
  const focusId = document.activeElement && document.activeElement.dataset && document.activeElement.dataset.keep!==undefined ? document.activeElement.id : null;
  const inProj = projet && view!=="liste";
  $("#backLabel").textContent = view==="liste" ? "Portail" : (view==="overview"?"Projets":"Projet");
  $("#title").textContent = inProj ? projet.titre : "Atelier projet";
  $("#subtitle").textContent = inProj ? (view==="overview"?"Vue d'ensemble":view==="fiche"?"Fiche projet":ETAPES[etapeIdx]?.nom) : "Construire à plusieurs mains";
  const ib=$("#identBtn");
  if(ident && !RO){ ib.hidden=false; ib.innerHTML=`${ic("user")} ${esc(ident.initiales)}`; } else ib.hidden=true;
  const fb=$("#ficheBtn"); fb.hidden = !(inProj && view!=="fiche"); fb.innerHTML=`${ic("file")} Fiche`;
  const showBar = inProj && view!=="overview";
  $("#etapebar").hidden = !showBar;
  if(showBar) renderEtapeBar();
  const map = { liste:viewListe, overview:viewOverview, etape:viewEtape, fiche:viewFiche };
  $("#view").innerHTML = (map[view]||viewListe)();
  document.querySelectorAll("[data-keep]").forEach(el=>{ if(drafts[el.id]!==undefined) el.value=drafts[el.id]; });
  if(focusId){ const el=document.getElementById(focusId); if(el){ el.focus(); try{el.selectionStart=el.selectionEnd=el.value.length;}catch(_){} } }
  window.scrollTo && view!=="etape" && window.scrollTo(0,0);
}

function renderEtapeBar(){
  const filled = new Set(contribs.map(c=>c.etape));
  $("#etapebar").innerHTML = `<button class="estep" data-overview>${ic("grid")}Vue d'ensemble</button>` +
    ETAPES.map((e,i)=>`<button class="estep ${view==="etape"&&i===etapeIdx?"active":""}" data-etape="${i}">${ic(e.icon)}${esc(e.nom)}${isLocked(e.id)?ic("lock"):(filled.has(e.id)?'<span class="dot"></span>':"")}</button>`).join("") +
    `<button class="estep fiche ${view==="fiche"?"active":""}" data-fiche>${ic("file")}Fiche</button>`;
}

/* ---------- Vue liste ---------- */
function viewListe(){
  const idCard = RO ? "" : (ident
    ? `<div class="card ident-card"><span class="ident-ava">${esc(ident.initiales.slice(0,3))}</span>
        <div class="ic-tx"><strong>${esc(ident.initiales)}</strong><small>${esc(ident.role)}</small></div>
        <button class="btn-mini" data-ident>Modifier</button></div>`
    : `<button class="card ident-card" data-ident style="width:100%;cursor:pointer"><span class="ident-ava">${ic("user")}</span>
        <div class="ic-tx" style="text-align:left"><strong>Qui êtes-vous ?</strong><small>Initiales + rôle (RGPD : pas de nom)</small></div>
        <span class="btn-mini">Définir</span></button>`);
  const banner = fbError ? `<div class="banner">${ic("alert")}<span><b>Activation Firestore requise.</b> Publiez les règles de <code>coordination_projets</code> dans la console Firebase.</span></div>` : "";
  const list = projets.length ? `<div class="proj-list">${projets.map(p=>{
    const mat=Math.round((p._etapes/ETAPES.length)*100); const st=STATUTS[p.statut]||STATUTS.brouillon;
    return `<button class="proj-card" data-open="${esc(p.id)}">
      <div style="display:flex;align-items:center;gap:8px"><h3 style="flex:1">${esc(p.titre)}</h3><span class="st-tag" style="--sc:${st.c}">${st.l}</span></div>
      ${p.contexte?`<p>${esc(p.contexte)}</p>`:""}
      <div class="proj-meta"><span>${ic("users")} ${p._contribs}</span><span class="mbar"><i style="width:${mat}%"></i></span><span>${mat}%</span></div>
    </button>`;}).join("")}</div>`
    : `<div class="empty">Aucun projet pour l'instant.${RO?"":" Créez le premier ci-dessous."}</div>`;
  return `${banner}
    <div class="hero"><h1>Atelier projet</h1><p>Construisez un projet d'équipe à plusieurs mains, étape par étape — du constat à l'évaluation.</p></div>
    ${idCard?`<div class="sec-title">${ic("user")} Votre identité</div>${idCard}`:""}
    <div class="sec-title">${ic("folder")} Les projets</div>${list}
    ${RO?"":`<button class="new-proj" data-new style="margin-top:12px">${ic("plus")} Nouveau projet</button>`}`;
}

/* ---------- Vue d'ensemble (carte par phases) ---------- */
function viewOverview(){
  const total=ETAPES.length, done=new Set(contribs.map(c=>c.etape)).size;
  const pct=Math.round(done/total*100);
  const st=STATUTS[projet.statut]||STATUTS.brouillon;
  const firstTodo = ETAPES.findIndex(e=>!contribs.some(c=>c.etape===e.id));
  const phaseCards = PHASES.map(ph=>{
    const chips = ph.etapes.map(eid=>{
      const e=ETM[eid]; const i=ETAPES.findIndex(x=>x.id===eid);
      const n=contribs.filter(c=>c.etape===eid).length; const lock=isLocked(eid);
      return `<button class="ov-chip ${n?"done":""}" style="--pc:${ph.c}" data-etape="${i}">
        <span class="ov-ic">${n?ic("check"):ic(e.icon)}</span><span class="ov-n">${esc(e.nom)}</span>
        ${lock?`<span class="ov-lock">${ic("lock")}</span>`:n?`<span class="ov-ct">${n}</span>`:""}</button>`;
    }).join("");
    const dn=ph.etapes.filter(eid=>contribs.some(c=>c.etape===eid)).length;
    return `<div class="ov-phase" style="--pc:${ph.c}">
      <div class="ov-ph-h"><span class="ov-ph-nom">${esc(ph.nom)}</span><span class="ov-ph-pct">${dn}/${ph.etapes.length}</span></div>
      <div class="ov-chips">${chips}</div></div>`;
  }).join("");
  const stRow = RO ? `<span class="st-tag" style="--sc:${st.c}">${st.l}</span>` :
    `<div class="st-row">${Object.entries(STATUTS).map(([k,v])=>`<button class="st-pick ${projet.statut===k||(!projet.statut&&k==="brouillon")?"on":""}" style="--sc:${v.c}" data-statut="${k}">${v.l}</button>`).join("")}</div>`;
  const syn=synthese();
  return `
    <div class="ov-head">
      <div class="ov-ring" style="--p:${pct}"><span>${pct}%</span></div>
      <div class="ov-meta"><div class="ov-titre">${esc(projet.titre)}</div>
        ${projet.contexte?`<div class="ov-ctx">${esc(projet.contexte)}</div>`:""}
        <div style="margin-top:9px">${stRow}</div></div>
    </div>
    ${firstTodo>=0&&!RO?`<button class="btn primary big" data-etape="${firstTodo}">${ic("bolt")} Continuer : ${esc(ETAPES[firstTodo].nom)}</button>`:""}
    <div class="sec-title">${ic("grid")} Les 4 phases du projet</div>
    <div class="ov-phases">${phaseCards}</div>
    ${syn?`<div class="sec-title">${ic("wand")} Synthèse automatique</div><div class="card syn-card">${esc(syn)}</div>`:""}
    <div class="fiche-actions" style="margin-top:16px"><button class="btn" data-fiche>${ic("file")} Voir la fiche</button>${RO?"":`<button class="btn" id="share">${ic("send")} Partager (lecture)</button>`}</div>`;
}

/* ---------- Vue étape ---------- */
function viewEtape(){
  const e=ETAPES[etapeIdx]; const list=ofEt(e.id); const locked=isLocked(e.id);
  const exemples=(e.ok||e.non)?`<div class="exemples">
    ${e.ok?`<div class="ex ok">${ic("check")}<span><b>À préférer —</b> ${esc(e.ok)}</span></div>`:""}
    ${e.non?`<div class="ex non">${ic("x")}<span><b>À éviter —</b> ${esc(e.non)}</span></div>`:""}</div>`:"";
  let contexte="";
  if(etapeIdx===0){ if(projet.contexte) contexte=`<details class="context" open><summary>${ic("folder")} Le contexte du projet</summary><div class="ctx-body"><p>${esc(projet.contexte)}</p></div></details>`; }
  else { const prev=ETAPES[etapeIdx-1]; const pl=ofEt(prev.id);
    const body=pl.length?`<ul>${pl.map(c=>`<li>${c.epingle?ic("star"):""}${esc(c.texte)} <span class="by">— ${esc(c.role)}</span></li>`).join("")}</ul>`:`<p class="vide">Rien encore à l'étape « ${esc(prev.nom)} ».</p>`;
    contexte=`<details class="context" open><summary>${ic(prev.icon)} S'appuie sur : ${esc(prev.nom)}</summary><div class="ctx-body">${body}</div></details>`; }
  const cards=list.length?list.map(c=>{
    const coms=c.comments||[];
    return `<article class="contrib ${c.epingle?"top":""}">${avatar(c.initiales)}
      <div class="cb">
        <div class="cmeta">${c.epingle?`<span class="ctop-tag">${ic("star")} retenu</span>`:""}<b style="color:var(--ink);font-weight:600">${esc(c.role||"—")}</b> · ${esc(c.initiales||"")}${c.editedAt?' · modifié':''}</div>
        <div class="ctext">${esc(c.texte)}</div>
        <div class="cact">
          ${RO?"":`<button class="pin ${c.epingle?"on":""}" data-pin="${esc(c.id)}">${ic("star")} ${c.epingle?"Retenu":"Retenir"}</button>`}
          ${(!RO&&mine.has(c.id))?`<button class="cmini" data-edit="${esc(c.id)}">${ic("pencil")}</button><button class="cmini" data-del="${esc(c.id)}">${ic("trash")}</button>`:""}
        </div>
        <details class="comments"><summary>${ic("comment")} Commentaires${coms.length?` (${coms.length})`:""}</summary>
          <div class="com-list">${coms.map(k=>`<div class="com"><b>${esc(k.role)}</b> · ${esc(k.ini)} : ${esc(k.txt)}</div>`).join("")}</div>
          ${RO?"":`<div class="com-add"><input data-keep id="com_${esc(c.id)}" placeholder="Répondre…"><button class="cmini" data-com="${esc(c.id)}">${ic("send")}</button></div>`}
        </details>
      </div></article>`;
  }).join("") : `<div class="empty">Personne n'a encore contribué à cette étape.${locked||RO?"":" Lancez-vous !"}</div>`;
  const lockBtn = RO?"":`<button class="lock-btn ${locked?"on":""}" data-lock="${e.id}">${ic(locked?"lock":"unlock")} ${locked?"Verrouillée":"Verrouiller"}</button>`;
  const addZone = (RO||locked) ? (locked?`<div class="locked-note">${ic("lock")} Étape verrouillée par l'équipe — contributions figées.</div>`:"") :
    `<div class="add-row">${avatar(ident?ident.initiales:"?")}
      <div style="flex:1"><textarea data-keep id="newContrib" rows="1" placeholder="${ident?"Ajouter votre "+e.nom.toLowerCase()+"…":"Identifiez-vous pour contribuer…"}"></textarea>
        <div class="nudge" id="nudge" hidden></div></div>
      <button class="send" id="sendContrib" aria-label="Ajouter">${ic("send")}</button></div>`;
  return `
    <div class="etape-head">
      <div style="display:flex;align-items:center;gap:10px"><span class="et-ic">${ic(e.icon)}</span><div style="flex:1"><div class="eyebrow">Étape ${etapeIdx+1} / ${ETAPES.length}</div><h2>${esc(e.nom)}</h2></div>${lockBtn}</div>
      <div class="et-q">${esc(e.q)}</div>
      <div class="et-def">${esc(e.def)}</div>
      <div class="et-aide">${ic("info")}<span>${esc(e.aide)}</span></div>
      ${exemples}
    </div>
    ${contexte}
    <div class="contribs">${cards}</div>
    ${addZone}
    <div class="pager">
      <button class="pgr" data-etape="${(etapeIdx-1+ETAPES.length)%ETAPES.length}">${ic("back")}<span>${esc(ETAPES[(etapeIdx-1+ETAPES.length)%ETAPES.length].nom)}</span></button>
      <button class="pgr next" data-etape="${(etapeIdx+1)%ETAPES.length}"><span>${esc(ETAPES[(etapeIdx+1)%ETAPES.length].nom)}</span>${ic("chev")}</button>
    </div>`;
}

/* ---------- Fiche ---------- */
function ficheBodyHTML(){
  const byEt={}; contribs.forEach(c=>{(byEt[c.etape]=byEt[c.etape]||[]).push(c);});
  const syn=synthese();
  const sections=ETAPES.map(e=>{
    const items=sortC(byEt[e.id]||[]);
    let body;
    if(!items.length) body=`<p class="vide">À compléter.</p>`;
    else { const ep=items.filter(c=>c.epingle), au=items.filter(c=>!c.epingle);
      body=ep.map(c=>`<div class="retenu">${esc(c.texte)}</div>`).join("")+(au.length?`<ul>${au.map(c=>`<li>${esc(c.texte)} <span class="by">— ${esc(c.role)}</span></li>`).join("")}</ul>`:""); }
    return `<section><h2>${esc(e.nom)}</h2>${body}</section>`;
  }).join("");
  return `<h1>${esc(projet.titre)}</h1>${projet.contexte?`<p class="doc-ctx">${esc(projet.contexte)}</p>`:""}
    ${syn?`<section class="syn-sec"><h2>Synthèse</h2><p>${esc(syn)}</p></section>`:""}${sections}`;
}
function viewFiche(){
  return `<div class="fiche-actions">
      <button class="btn" data-overview>${ic("back")} Vue d'ensemble</button>
      <button class="btn" id="word">${ic("word")} Word</button>
      <button class="btn primary" id="print">${ic("printer")} Imprimer / PDF</button>
    </div><div class="doc">${ficheBodyHTML()}</div>`;
}

/* ---------- Export Word ---------- */
function exportWord(){
  const css=`body{font-family:Calibri,Arial,sans-serif;color:#1a1a1a;font-size:11pt;line-height:1.5}
    h1{font-size:20pt;color:#26365a}h2{font-size:12pt;color:#2f6cd6;border-bottom:1px solid #ccc;padding-bottom:3px;margin-top:18px}
    .doc-ctx{color:#555;font-style:italic}.retenu{background:#eef3fb;padding:6px 10px;border-left:3px solid #2f6cd6;margin:4px 0}
    ul{margin:4px 0}li{margin-bottom:3px}.by{color:#888;font-size:9pt}.vide{color:#999;font-style:italic}.syn-sec p{background:#f3f5f9;padding:10px;border-radius:4px}`;
  const html=`<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'><head><meta charset='utf-8'><style>${css}</style></head><body>${ficheBodyHTML()}</body></html>`;
  const blob=new Blob(['﻿'+html],{type:'application/msword'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=(projet.titre||'projet').replace(/[^\w -]/g,'')+'.doc'; a.click();
}

/* ---------- Overlay ---------- */
function openSheet(html){ $("#overlay").innerHTML=`<div class="sheet">${html}</div>`; $("#overlay").classList.add("show"); }
function closeSheet(){ $("#overlay").classList.remove("show"); $("#overlay").innerHTML=""; }

function openIdent(){
  openSheet(`<div class="sheet-head"><h3>Votre identité</h3><button class="x" data-close>${ic("x")}</button></div>
    <p class="muted" style="font-size:13.5px;margin:0 0 14px">RGPD : seulement vos <b>initiales</b> et votre <b>rôle</b> — jamais de nom.</p>
    <div class="field"><label for="iIni">Vos initiales</label><input id="iIni" maxlength="4" placeholder="ex. B.D." value="${esc(ident?ident.initiales:"")}" style="text-transform:uppercase;font-weight:700"></div>
    <div class="field"><label>Votre rôle</label><div class="roles" id="iRoles">${ROLES.map(r=>`<button type="button" class="role-chip ${ident&&ident.role===r?"sel":""}" data-role="${esc(r)}">${esc(r)}</button>`).join("")}</div></div>
    <div class="actions"><button class="btn primary" id="saveIdent">${ic("check")} Enregistrer</button></div>`);
  let role=ident?ident.role:"";
  $("#iRoles").querySelectorAll("[data-role]").forEach(b=>b.onclick=()=>{role=b.dataset.role;$("#iRoles").querySelectorAll(".role-chip").forEach(x=>x.classList.toggle("sel",x===b));});
  $("#saveIdent").onclick=()=>{const ini=$("#iIni").value.trim().toUpperCase();if(!ini){toast("Indiquez vos initiales.");return;}if(!role){toast("Choisissez votre rôle.");return;}
    ident={initiales:ini,role};localStorage.setItem("projets_ident_v1",JSON.stringify(ident));closeSheet();render();toast("Identité enregistrée");};
}
function openNew(){
  let m=MODELES[0];
  openSheet(`<div class="sheet-head"><h3>Nouveau projet</h3><button class="x" data-close>${ic("x")}</button></div>
    <div class="field"><label>Partir d'un modèle</label><div class="roles" id="mods">${MODELES.map((x,i)=>`<button type="button" class="role-chip ${i===0?"sel":""}" data-mod="${i}">${esc(x.t)}</button>`).join("")}</div></div>
    <div class="field"><label for="pTit">Titre</label><input id="pTit" placeholder="ex. Permanence Ressource Accroche"></div>
    <div class="field"><label for="pCtx">Contexte (optionnel)</label><textarea id="pCtx" placeholder="Le lycée, le public, le besoin observé…"></textarea></div>
    <div class="actions"><button class="btn primary" id="createP">${ic("plus")} Créer le projet</button></div>`);
  const fill=()=>{$("#pTit").value=m.titre;$("#pCtx").value=m.ctx;};
  $("#mods").querySelectorAll("[data-mod]").forEach(b=>b.onclick=()=>{m=MODELES[+b.dataset.mod];$("#mods").querySelectorAll(".role-chip").forEach(x=>x.classList.toggle("sel",x===b));fill();});
  $("#createP").onclick=async()=>{const titre=$("#pTit").value.trim();if(!titre){toast("Donnez un titre.");return;}
    const btn=$("#createP");btn.disabled=true;btn.textContent="Création…";
    try{const ref=await addDoc(collection(db,COL),{titre,contexte:$("#pCtx").value.trim(),statut:"construction",locked:[],createdAt:serverTimestamp()});closeSheet();await openProjet(ref.id);}
    catch(e){console.error(e);fbError=true;btn.disabled=false;btn.innerHTML=`${ic("plus")} Créer le projet`;toast("Enregistrement impossible (règles Firestore).");}};
}
function openEdit(cid){
  const c=contribs.find(x=>x.id===cid); if(!c) return;
  openSheet(`<div class="sheet-head"><h3>Modifier</h3><button class="x" data-close>${ic("x")}</button></div>
    <div class="field"><textarea id="eTxt" rows="4">${esc(c.texte)}</textarea></div>
    <div class="actions"><button class="btn primary" id="saveEdit">${ic("check")} Enregistrer</button></div>`);
  $("#saveEdit").onclick=async()=>{const v=$("#eTxt").value.trim();if(!v){toast("Le texte est vide.");return;}
    try{await updateDoc(doc(db,COL,projet.id,"contributions",cid),{texte:v,editedAt:Date.now()});closeSheet();}catch(e){console.error(e);toast("Modification impossible.");}};
}

/* ---------- Firestore ---------- */
async function loadListe(){
  try{ const snap=await getDocs(collection(db,COL));
    projets=await Promise.all(snap.docs.map(async d=>{let et=0,n=0;try{const cs=await getDocs(collection(db,COL,d.id,"contributions"));n=cs.size;et=new Set(cs.docs.map(x=>x.data().etape)).size;}catch(_){}return {id:d.id,...d.data(),_contribs:n,_etapes:et};}));
    projets=projets.filter(p=>p.statut!=="archive"||!RO);
    projets.sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)); fbError=false;
  }catch(e){console.error(e);fbError=true;projets=[];}
  if(view==="liste") render();
}
async function openProjet(id){
  if(unsub){unsub();unsub=null;} if(unsubP){unsubP();unsubP=null;}
  projet=projets.find(p=>p.id===id)||null;
  if(!projet){ try{const d=await getDoc(doc(db,COL,id));if(d.exists())projet={id,...d.data()};}catch(_){} }
  if(!projet){toast("Projet introuvable.");view="liste";return loadListe();}
  view="overview"; etapeIdx=0; contribs=[]; render();
  try{ unsubP=onSnapshot(doc(db,COL,id),d=>{if(d.exists()){projet={id,...d.data()};if(view!=="liste")render();}}); }catch(_){}
  try{ unsub=onSnapshot(query(collection(db,COL,id,"contributions"),orderBy("createdAt","asc")),snap=>{
    contribs=snap.docs.map(d=>{const x=d.data();return {id:d.id,...x,_t:x.createdAt?.seconds||0};});fbError=false;if(view!=="liste")render();
  },err=>{console.error(err);fbError=true;render();}); }catch(e){console.error(e);fbError=true;render();}
}
async function addContribution(texte){
  if(!ident){openIdent();return;} texte=texte.trim(); if(!texte) return;
  if(isLocked(ETAPES[etapeIdx].id)){toast("Étape verrouillée.");return;}
  try{const ref=await addDoc(collection(db,COL,projet.id,"contributions"),{etape:ETAPES[etapeIdx].id,texte,initiales:ident.initiales,role:ident.role,epingle:false,comments:[],createdAt:serverTimestamp()});mine.add(ref.id);saveMine();}
  catch(e){console.error(e);toast("Envoi impossible (règles Firestore).");}
}
async function togglePin(cid){const c=contribs.find(x=>x.id===cid);if(!c)return;try{await updateDoc(doc(db,COL,projet.id,"contributions",cid),{epingle:!c.epingle});}catch(e){console.error(e);toast("Action impossible.");}}
async function delContribution(cid){try{await deleteDoc(doc(db,COL,projet.id,"contributions",cid));mine.delete(cid);saveMine();}catch(e){console.error(e);toast("Suppression impossible.");}}
async function addComment(cid,txt){if(!ident){openIdent();return;}txt=txt.trim();if(!txt)return;const c=contribs.find(x=>x.id===cid);if(!c)return;
  const coms=[...(c.comments||[]),{ini:ident.initiales,role:ident.role,txt,t:Date.now()}];
  try{await updateDoc(doc(db,COL,projet.id,"contributions",cid),{comments:coms});}catch(e){console.error(e);toast("Commentaire impossible.");}}
async function setStatut(s){try{await updateDoc(doc(db,COL,projet.id),{statut:s});}catch(e){console.error(e);toast("Action impossible.");}}
async function toggleLock(eid){const cur=projet.locked||[];const nx=cur.includes(eid)?cur.filter(x=>x!==eid):[...cur,eid];try{await updateDoc(doc(db,COL,projet.id),{locked:nx});}catch(e){console.error(e);toast("Action impossible.");}}

/* ---------- Navigation ---------- */
document.addEventListener("click", e=>{
  if(e.target.closest("[data-ident]")) return openIdent();
  const nw=e.target.closest("[data-new]");if(nw){if(!ident){toast("Identifiez-vous d'abord.");return openIdent();}return openNew();}
  const op=e.target.closest("[data-open]");if(op) return openProjet(op.dataset.open);
  if(e.target.closest("[data-overview]")){view="overview";return render();}
  const et=e.target.closest("[data-etape]");if(et){etapeIdx=+et.dataset.etape;view="etape";return render();}
  if(e.target.closest("[data-fiche]")||e.target.closest("#ficheBtn")){view="fiche";return render();}
  const pn=e.target.closest("[data-pin]");if(pn) return togglePin(pn.dataset.pin);
  const ed=e.target.closest("[data-edit]");if(ed) return openEdit(ed.dataset.edit);
  const dl=e.target.closest("[data-del]");if(dl) return delContribution(dl.dataset.del);
  const cm=e.target.closest("[data-com]");if(cm){const inp=document.getElementById("com_"+cm.dataset.com);const v=inp?inp.value:"";if(inp)inp.value="";return addComment(cm.dataset.com,v);}
  const stt=e.target.closest("[data-statut]");if(stt) return setStatut(stt.dataset.statut);
  const lk=e.target.closest("[data-lock]");if(lk) return toggleLock(lk.dataset.lock);
  if(e.target.closest("#print")) return window.print();
  if(e.target.closest("#word")) return exportWord();
  if(e.target.closest("#share")){const url=base+"?p="+projet.id+"&ro=1";navigator.clipboard?.writeText(url).then(()=>toast("Lien lecture copié")).catch(()=>toast(url));return;}
  if(e.target.closest("[data-close]")||e.target.id==="overlay") return closeSheet();
  if(e.target.closest("#identBtn")) return openIdent();
  if(e.target.closest("#sendContrib")){const t=$("#newContrib");const v=t?t.value:"";if(t)t.value="";const n=$("#nudge");if(n)n.hidden=true;return addContribution(v);}
  if(e.target.closest("#back")){
    if(view==="liste"){location.href="../";return;}
    if(view==="etape"||view==="fiche"){view="overview";return render();}
    if(unsub){unsub();unsub=null;}if(unsubP){unsubP();unsubP=null;}view="liste";projet=null;contribs=[];render();loadListe();return;
  }
});
document.addEventListener("input", e=>{
  if(e.target.id==="newContrib"){const n=$("#nudge");if(!n)return;const m=nudge(ETAPES[etapeIdx].id,e.target.value);if(m){n.innerHTML=`${ic("info")}<span>${esc(m)}</span>`;n.hidden=false;}else n.hidden=true;}
});
document.addEventListener("keydown", e=>{ if(e.key==="Escape")closeSheet();
  if(e.key==="Enter"&&!e.shiftKey){ if(e.target.id==="newContrib"){e.preventDefault();const v=e.target.value;e.target.value="";const n=$("#nudge");if(n)n.hidden=true;addContribution(v);}
    else if(e.target.dataset&&e.target.id&&e.target.id.startsWith("com_")){e.preventDefault();const cid=e.target.id.slice(4);const v=e.target.value;e.target.value="";addComment(cid,v);} } });

loadListe().then(()=>{const p=params.get("p");if(p)openProjet(p);});
render();
