/* ============================================================================
   Chef-d'œuvre CAP — dossier de pilotage collaboratif sur DEUX ANS.
   (devoirs-pse / coordination_chefdoeuvre)
   • 1 dossier = 1 promotion qui vit 2 ans ; l'équipe change, le dossier reste.
   • Timeline 2 ans (périodes Sept→Juin) au centre + passage de témoin (A1→A2).
   • Co-disciplines colorées, acteurs, jury, jalons, évaluation/oral — modulable.
   • Cadre réglementaire intégré (arrêté 28-11-2019, Vademecum, 165 h, oral 10 min).
   • RGPD : initiales + rôle, groupes anonymes, jamais de nom d'élève. Temps réel.
============================================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, doc, addDoc, getDocs, getDoc, onSnapshot, updateDoc, deleteDoc,
  serverTimestamp, query, orderBy }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = { apiKey:"AIzaSyAWdCMvOiAJln3eT9LIAQD3RWJUD0lQcLI", authDomain:"devoirs-pse.firebaseapp.com", projectId:"devoirs-pse", storageBucket:"devoirs-pse.firebasestorage.app", messagingSenderId:"614730413904", appId:"1:614730413904:web:a5dd478af5de30f6bede55" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const COL = "coordination_chefdoeuvre";

const ICONS = {
  back:`<path d="m14 6-6 6 6 6"/>`, chev:`<path d="m9 6 6 6-6 6"/>`, chevd:`<path d="m6 9 6 6 6-6"/>`,
  plus:`<path d="M12 5v14M5 12h14"/>`, minus:`<path d="M5 12h14"/>`,
  send:`<path d="M4 12 20 4l-6 16-2.5-6.5z"/><path d="M11.5 13.5 20 4"/>`,
  user:`<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>`,
  users:`<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 5.2a3.2 3.2 0 0 1 0 6.1"/><path d="M16.5 14.4a5.5 5.5 0 0 1 4 4.6"/>`,
  trash:`<path d="M5 7h14M9 7V5h6v2M6 7l1 13h10l1-13"/>`,
  pencil:`<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>`,
  x:`<path d="m6 6 12 12M18 6 6 18"/>`, check:`<path d="M5 12.5 10 17.5 19.5 7"/>`,
  grid:`<rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.2"/>`,
  shield:`<path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"/>`,
  info:`<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r=".8" fill="currentColor" stroke="none"/>`,
  alert:`<path d="M12 4 2.5 20h19z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.4" r=".6" fill="currentColor" stroke="none"/>`,
  target:`<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>`,
  download:`<path d="M12 4v11M8 11l4 4 4-4"/><path d="M5 19h14"/>`,
  upload:`<path d="M12 20V9M8 13l4-4 4 4"/><path d="M5 5h14"/>`,
  copy:`<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M5.5 15.5H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8.5a2 2 0 0 1 2 2v.5"/>`,
  book:`<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H18v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M6.5 18H18v3H6.5A1.5 1.5 0 0 1 5 19.5"/>`,
  cap:`<path d="M12 5 2.5 9 12 13l9.5-4z"/><path d="M6 11v4c0 1 2.7 2.2 6 2.2s6-1.2 6-2.2v-4"/><path d="M21.5 9v5"/>`,
  layers:`<path d="m12 3 8.5 4.5L12 12 3.5 7.5z"/><path d="m4 12 8 4.3 8-4.3"/><path d="m4 16.3 8 4.3 8-4.3"/>`,
  flag:`<path d="M6 21V4M6 4h11l-2 3.5L17 11H6"/>`,
  route:`<circle cx="6" cy="18" r="2.4"/><circle cx="18" cy="6" r="2.4"/><path d="M8.4 18H14a3.5 3.5 0 0 0 0-7H10a3.5 3.5 0 0 1 0-7h5.6"/>`,
  award:`<circle cx="12" cy="9" r="5"/><path d="m9 13.5-1.5 6.5 4.5-2.5 4.5 2.5L15 13.5"/>`,
  calendar:`<rect x="4" y="5.5" width="16" height="15" rx="2"/><path d="M4 9.5h16M8 3.5v4M16 3.5v4"/>`,
  clock:`<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>`,
  hourglass:`<path d="M6 3h12M6 21h12M7 3c0 5 10 6 10 9S7 16 7 21M17 3c0 5-10 6-10 9"/>`,
  handoff:`<path d="M3 9h13l-3.2-3.2M3 9l3.2 3.2"/><path d="M21 15H8l3.2 3.2M21 15l-3.2-3.2"/>`,
  compass:`<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.2 5.3-5.3 2.2 2.2-5.3z"/>`,
  spark:`<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>`,
  list:`<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1" fill="currentColor" stroke="none"/>`,
  doc:`<path d="M13.5 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7.5z"/><path d="M13.5 3v4.5H18M9 12h6M9 15.5h6"/>`,
  mic:`<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"/>`,
};
const ic = n => ICONS[n] ? `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>` : "";

const ROLES = ["Prof", "Prof PSE", "Prof principal", "Enseignant pro", "CPE", "DDFPT", "Infirmier·ère", "PsyEN", "AESH / Coordo ULIS", "Direction", "Documentaliste", "Autre"];
const PALETTE = ["#534ab7","#0f6e56","#993c1d","#185fa5","#9a5f0a","#993556","#3c6e3c","#5a6b8c"];
const DISC_COLORS = ["#2f6cd6","#1a9e78","#d8642f","#7f57c9","#9a6b16","#c0392b","#0e8a8a","#5a6b8c","#b0397e","#3c7a2e"];
const colorFor = s => PALETTE[[...String(s||"?")].reduce((a,c)=>a+c.charCodeAt(0),0) % PALETTE.length];

const esc = s => String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const $ = s => document.querySelector(s);
const avatar = (ini,cls="",color="")=>`<span class="ava ${cls}" style="background:${color||colorFor(ini)};color:#fff">${esc((ini||"?").slice(0,3))}</span>`;
const dateFr = (d) => { try{ return (d?new Date(d):new Date()).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}); }catch(_){ return ""; } };
const uid = () => (self.crypto&&crypto.randomUUID)?crypto.randomUUID():"id"+Date.now()+Math.random().toString(36).slice(2);
const num = (v)=>{ const n=parseInt(v,10); return isNaN(n)?0:n; };

const PHASES = {
  brouillon:{lab:"Brouillon", c:"#8b94a3", an:1},
  a1:{lab:"Année 1 en cours", c:"#2f6cd6", an:1},
  a2:{lab:"Année 2 — à clôturer", c:"#9a6b16", an:2},
  termine:{lab:"Terminé", c:"#1a9e78", an:2},
  archive:{lab:"Archivé", c:"#8b94a3", an:2},
};
const PHASE_ORDER = ["brouillon","a1","a2","termine","archive"];
const PERIODES = ["Sept – Oct","Nov – Déc","Janv – Févr","Mars – Avr","Mai – Juin"];
const ASTAT = { prevu:{lab:"Prévu",c:"#8b94a3"}, encours:{lab:"En cours",c:"#2f6cd6"}, fait:{lab:"Réalisé",c:"#1a9e78"} };

const JALONS_DEF = [
  {nom:"Lancement du projet", annee:1, periode:0},
  {nom:"Choix et validation du sujet", annee:1, periode:1},
  {nom:"Premières réalisations", annee:1, periode:2},
  {nom:"Bilan intermédiaire (fin année 1)", annee:1, periode:4},
  {nom:"Reprise et approfondissement", annee:2, periode:0},
  {nom:"Finalisation de la réalisation", annee:2, periode:3},
  {nom:"Oral blanc", annee:2, periode:3},
  {nom:"Oral final", annee:2, periode:4},
];
const CRIT_DEF = [
  "Clarté et précision de la démarche : objectifs, étapes, acteurs, part individuelle",
  "Hiérarchisation des informations pour introduire le sujet",
  "Clarté de la présentation et pertinence des termes employés",
  "Respect des consignes sur le contenu de la présentation",
  "Réflexivité sur les difficultés rencontrées et la façon de les dépasser",
  "Réflexivité sur les points forts et les points faibles de la réalisation",
  "Qualité de l'argumentation",
  "Pertinence du chef-d'œuvre au regard de la filière métier",
];
const Q_DEF = [
  "Présente ta démarche : objectifs, étapes, et ta part dans le projet.",
  "Quelles difficultés as-tu rencontrées ? Comment les as-tu dépassées ?",
  "Quels sont les points forts et les limites de ta réalisation ?",
  "En quoi ce projet est-il utile pour ton métier ?",
  "Que changerais-tu ou améliorerais-tu si tu recommençais ?",
];
const CADRE = [
  `<b>Définition (CAP).</b> Le chef-d'œuvre est la réalisation qui marque l'achèvement de la formation : une production <i>matérielle ou immatérielle</i>, issue d'une <i>démarche de projet pluridisciplinaire</i> mobilisant des compétences professionnelles et générales. Il peut être individuel ou collectif. <span class="cref">Arrêté du 28 nov. 2019 · Vademecum, nov. 2021</span>`,
  `<b>Sur deux ans.</b> Le chef-d'œuvre se construit sur les deux années du cycle (1re puis 2e année de CAP). Volume indicatif : <b>87 h</b> en année 1 + <b>78 h</b> en année 2 = <b>165 h</b> (dotation professeur = le double). <span class="cref">Vademecum « La réalisation du chef-d'œuvre »</span>`,
  `<b>Pluridisciplinaire & collaboratif.</b> La réalisation fait appel à l'enseignement professionnel et à une ou plusieurs disciplines générales (≠ co-intervention). Elle est portée par un travail d'équipe et, souvent, des partenaires.`,
  `<b>Évaluation.</b> Ce qu'on évalue, c'est la <b>démarche</b> du candidat — pas le livrable. En CCF : <b>50 % livret</b> (sur les 2 ans) + <b>50 % oral</b> terminal. Oral <b>10 min</b> (5 min de présentation + 5 min de questions), support de 5 pages recto maximum. Note affectée du <b>coefficient 1</b>. <span class="cref">Arrêté du 28 nov. 2019</span>`,
];

const DEV = (()=>{ let d=localStorage.getItem("projets_dev"); if(!d){ d=uid(); localStorage.setItem("projets_dev",d);} return d; })();
let ident = JSON.parse(localStorage.getItem("projets_ident_v1") || "null");

const params = new URLSearchParams(location.search);
const RO = params.get("ro")==="1";
let dossiers=[], dossier=null, els=[], view="liste", fbError=false, unsub=null, unsubE=null;
let openSecs = new Set(["timeline"]);

let toastT;
function toast(m,ok){ const t=$("#toast"); t.textContent=m; t.className="toast show"+(ok?" ok":""); clearTimeout(toastT); toastT=setTimeout(()=>t.className="toast",2200); }
const saved = ()=>toast("Enregistré",true);
const isAdmin = ()=> !!(ident && dossier && dossier.pilote && dossier.pilote.ini===ident.initiales);
const canEdit = ()=> !RO && !!ident;

/* helpers données */
const byType = t => els.filter(e=>e.type===t);
const discs = ()=> byType("discipline");
const discColor = id => { const d=discs().find(x=>x.id===id); return d?d.color:"#8b94a3"; };
const discName = id => { const d=discs().find(x=>x.id===id); return d?d.nom:""; };
const jalons = ()=> byType("jalon").slice().sort((a,b)=>(a.annee-b.annee)||(a.periode-b.periode)||((a.ordre||0)-(b.ordre||0)));
const actionsOf = (yr,p)=> byType("action").filter(a=>a.annee===yr&&a.periode===p).sort((a,b)=>(a._t||0)-(b._t||0));
const cohorte = ()=> dossier&&dossier.anneeDebut ? `${dossier.anneeDebut}–${dossier.anneeDebut+2}` : "";
const anScolaire = (yr)=> dossier&&dossier.anneeDebut ? `${dossier.anneeDebut+(yr-1)}–${dossier.anneeDebut+yr}` : (yr===1?"Année 1":"Année 2");

/* =====================  RENDU  ===================== */
function render(){
  const inD = dossier && view!=="liste";
  $("#backLabel").textContent = view==="liste" ? "Portail" : (view==="presentation" ? "Le dossier" : "Les chefs-d'œuvre");
  $("#title").textContent = inD ? dossier.titre : "Chef-d'œuvre CAP";
  $("#subtitle").textContent = inD ? (dossier.specialite||cohorte()||"Projet sur deux ans") : "Projet sur deux ans";
  const ib=$("#identBtn"); if(ident && !RO){ ib.hidden=false; ib.innerHTML=`${ic("user")} ${esc(ident.initiales)}`; } else ib.hidden=true;
  const map = { liste:viewListe, dossier:viewDossier, presentation:viewPresentation };
  $("#view").innerHTML = (map[view]||viewListe)();
  if(view!=="dossier") window.scrollTo&&window.scrollTo(0,0);
}

/* ---------- Liste ---------- */
function phaseBadge(k){ const p=PHASES[k]||PHASES.brouillon; return `<span class="stbadge" style="--c:${p.c}">${p.lab}</span>`; }
function viewListe(){
  const idCard = RO ? "" : (ident
    ? `<div class="card ident-card"><span class="ident-ava" style="background:${ident.color||colorFor(ident.initiales)};color:#fff">${esc(ident.initiales.slice(0,3))}</span><div class="ic-tx"><strong>${esc(ident.initiales)}</strong><small>${esc(ident.role)}</small></div><button class="btn-mini" data-ident>Modifier</button></div>`
    : `<button class="card ident-card" data-ident style="width:100%;cursor:pointer"><span class="ident-ava">${ic("user")}</span><div class="ic-tx" style="text-align:left"><strong>Qui êtes-vous ?</strong><small>Initiales + rôle (RGPD : pas de nom)</small></div><span class="btn-mini">Définir</span></button>`);
  const banner = fbError ? `<div class="banner">${ic("alert")}<span><b>Activation Firestore requise.</b> Publiez les règles de <code>coordination_chefdoeuvre</code>.</span></div>` : "";
  const groups = [["a1","Année 1 — en cours"],["a2","Année 2 — à clôturer"],["brouillon","Brouillons"],["termine","Terminés"],["archive","Archivés"]];
  let listHtml = "";
  groups.forEach(([k,lab])=>{
    const arr = dossiers.filter(d=>(d.phase||"brouillon")===k);
    if(!arr.length) return;
    listHtml += `<div class="sec-title">${ic(k==="a1"?"spark":k==="a2"?"hourglass":k==="termine"?"award":"grid")} ${lab} <span class="sc-n">${arr.length}</span></div><div class="proj-list">${arr.map(cardHtml).join("")}</div>`;
  });
  if(!dossiers.length) listHtml = `<div class="empty">Aucun chef-d'œuvre pour l'instant.${RO?"":" Créez le premier ci-dessous."}</div>`;
  return `${banner}
    <div class="hero hero-cdo"><span class="hero-ic">${ic("cap")}</span><h1>Chef-d'œuvre CAP</h1><p>Un dossier par promotion, vivant sur <b>deux ans</b>. L'équipe de 1re année construit et transmet ; l'équipe de 2e année continue et clôture. Timeline, disciplines, jalons et oral — dans le cadre officiel.</p></div>
    ${idCard?`<div class="sec-title">${ic("user")} Votre identité</div>${idCard}`:""}
    ${listHtml}
    ${RO?"":`<div class="liste-acts"><button class="new-proj" data-new>${ic("plus")} Nouveau chef-d'œuvre</button><button class="lnk" data-import>${ic("upload")} Importer (JSON)</button></div>`}`;
}
function cardHtml(d){
  const p=PHASES[d.phase||"brouillon"]||PHASES.brouillon;
  const jt=d._jtot||0, jf=d._jfait||0; const pct=jt?Math.round(jf/jt*100):0;
  const co = d.anneeDebut?`${d.anneeDebut}–${d.anneeDebut+2}`:"";
  return `<button class="proj-card cdo-card" data-open="${esc(d.id)}" style="--rc:${p.c}">
    <div class="pc-ring" style="--p:${pct}"><span>${jf}/${jt||"—"}</span></div>
    <div class="pc-body">
      <div class="pc-top"><h3>${esc(d.titre)}</h3></div>
      <p class="pc-sum">${d.specialite?esc(d.specialite):`<span class="muted">Chef-d'œuvre CAP.</span>`}</p>
      <div class="proj-meta">${phaseBadge(d.phase||"brouillon")}${co?`<span class="pc-m">${ic("calendar")} ${co}</span>`:""}${d.nbEleves?`<span class="pc-m">${ic("users")} ${d.nbEleves} élèves</span>`:""}${d.pilote?`<span class="pc-m">${ic("compass")} ${esc(d.pilote.ini)}</span>`:""}</div>
    </div>
    <span class="pc-go">${ic("chev")}</span>
  </button>`;
}

/* ---------- Dossier ---------- */
function secBlock(id, icon, title, sub, body, accent){
  const open = openSecs.has(id);
  return `<section class="sec ${open?"open":""}" data-secwrap="${id}" style="--ac:${accent||"var(--accent)"}">
    <button class="sec-h" data-sec="${esc(id)}"><span class="sec-hi">${ic(icon)}</span><span class="sec-ht"><span class="sec-htitle">${title}</span>${sub?`<span class="sec-hsub">${sub}</span>`:""}</span><span class="sec-chev">${ic("chevd")}</span></button>
    <div class="sec-b">${body}</div>
  </section>`;
}
function fieldRow(field,label,icon){
  const meta=FIELDS[field]; const v=dossier[field];
  const has = v!=null && String(v).trim()!=="";
  return `<button class="frow ${has?"":"empty"}" ${RO?"":`data-field="${field}"`} ${RO?'tabindex="-1"':""}><span class="frow-ic">${ic(icon||"doc")}</span><span class="frow-tx"><span class="frow-l">${label||meta.l}</span><span class="frow-v">${has?esc(v):(RO?"—":"À renseigner…")}</span></span>${RO?"":`<span class="frow-edit">${ic("pencil")}</span>`}</button>`;
}
function chipsList(type, addLabel){
  const arr=byType(type);
  const meta=ELS[type];
  const items = arr.map(e=>{
    const col = type==="discipline" ? e.color : "var(--accent)";
    return `<span class="chip" style="${type==="discipline"?`--cc:${col};`:""}" ${RO?"":`data-eledit="${esc(e.id)}" data-eltype="${type}"`}>${type==="discipline"?`<span class="chip-dot" style="background:${col}"></span>`:""}${esc(e.nom||e.texte)}${e.fonction?`<small> · ${esc(e.fonction)}</small>`:""}${RO?"":`<span class="chip-x" data-eldel="${esc(e.id)}">${ic("x")}</span>`}</span>`;
  }).join("");
  return `<div class="chips">${items||`<span class="chips-empty">${RO?"—":"Rien pour l'instant."}</span>`}${RO?"":`<button class="chip-add" data-eladd="${type}">${ic("plus")} ${addLabel}</button>`}</div>`;
}
function listLines(type, addLabel, icon){
  const arr=byType(type);
  const items=arr.map(e=>`<li class="lline"><span class="lline-ic">${ic(icon||"check")}</span><span class="lline-tx">${esc(e.texte||e.nom)}</span>${RO?"":`<span class="lline-acts"><button class="ix" data-eledit="${esc(e.id)}" data-eltype="${type}">${ic("pencil")}</button><button class="ix" data-eldel="${esc(e.id)}">${ic("trash")}</button></span>`}</li>`).join("");
  return `<ul class="llist">${items||`<li class="lline empty">${RO?"—":"Rien pour l'instant."}</li>`}</ul>${RO?"":`<button class="add-line" data-eladd="${type}">${ic("plus")} ${addLabel}</button>`}`;
}

function dashHero(){
  const p=PHASES[dossier.phase||"brouillon"]||PHASES.brouillon;
  const jl=jalons(), jf=jl.filter(j=>j.fait).length;
  const next=jl.find(j=>!j.fait);
  const acts=byType("action"); const af=acts.filter(a=>a.statut==="fait").length;
  const ds=discs();
  const pct=jl.length?Math.round(jf/jl.length*100):0;
  const phaseSel = RO?"":`<button class="dh-phasebtn" data-phasebtn>${ic("chevd")} Changer le stade</button>`;
  return `<div class="dash">
    <div class="dash-top">
      <div class="dash-id">
        <div class="eyebrow">${dossier.specialite?esc(dossier.specialite):"Chef-d'œuvre CAP"}</div>
        <h2 class="dash-titre">${esc(dossier.titre)}</h2>
        <div class="dash-tags">
          <span class="dh-tag" style="--c:${p.c}">${ic("flag")} ${p.lab}</span>
          ${cohorte()?`<span class="dh-tag soft">${ic("calendar")} Promotion ${cohorte()}</span>`:""}
          ${dossier.classe?`<span class="dh-tag soft">${ic("cap")} ${esc(dossier.classe)}</span>`:""}
          ${dossier.nbEleves?`<span class="dh-tag soft">${ic("users")} ${dossier.nbEleves} élèves</span>`:""}
        </div>
      </div>
      <div class="dash-ring" style="--p:${pct}"><div class="dr-in"><b>${jf}/${jl.length}</b><small>jalons</small></div></div>
    </div>
    <div class="dash-stats">
      <div class="dstat"><span class="ds-n">${af}/${acts.length}</span><span class="ds-l">actions réalisées</span></div>
      <div class="dstat"><span class="ds-n">${ds.length}</span><span class="ds-l">disciplines</span></div>
      <div class="dstat"><span class="ds-n">${anScolaire(1)}</span><span class="ds-l">→ ${anScolaire(2)}</span></div>
    </div>
    ${next?`<div class="dash-next">${ic("route")} <span>Prochaine étape : <b>${esc(next.nom)}</b> · ${anScolaire(next.annee)} · ${PERIODES[next.periode]}</span></div>`:`<div class="dash-next done">${ic("check")} <span>Tous les jalons sont atteints.</span></div>`}
    ${pilRow()}
    ${phaseSel}
  </div>`;
}
function pilRow(){
  const pil=dossier.pilote;
  return `<div class="ovh-pilote">${pil?`<span class="opx-lab">${ic("compass")} Pilote</span><span class="opx">${avatar(pil.ini,"sm",pil.color)}<b>${esc(pil.ini)}</b> · ${esc(pil.role)}</span>${RO?"":`<button class="lnk-mini" data-pilote>${ident&&pil.ini===ident.initiales?"Me retirer":"Reprendre"}</button>`}`:`<span class="opx-lab">${ic("compass")} Pilote</span><span class="opx-none">à définir</span>${RO?"":`<button class="btn-mini" data-pilote-take>${ic("user")} Se proposer</button>`}`}</div>`;
}

function timelineBlock(){
  let html="";
  [1,2].forEach(yr=>{
    const cur = (PHASES[dossier.phase||"brouillon"]||{}).an===yr;
    html += `<div class="tl-year ${cur?"cur":""}">
      <div class="tl-yhead"><span class="tl-ybadge">Année ${yr}</span><span class="tl-yscol">${anScolaire(yr)}</span>${cur?`<span class="tl-ynow">${ic("spark")} en cours</span>`:""}</div>
      <div class="tl-track">`;
    PERIODES.forEach((plab,pi)=>{
      const js=jalons().filter(j=>j.annee===yr&&j.periode===pi);
      const as=actionsOf(yr,pi);
      const isOral = yr===2 && plab.includes("Mai");
      html += `<div class="tl-period">
        <div class="cdo-rail"><span class="cdo-node ${js.some(j=>j.fait)?"done":""}"></span></div>
        <div class="tl-pbody">
          <div class="tl-plab">${esc(plab)}${isOral?`<span class="tl-oral">${ic("mic")} Oral fixe</span>`:""}</div>
          ${js.map(j=>jalonChip(j)).join("")}
          ${as.map(a=>actionCard(a)).join("")}
          ${RO?"":`<button class="tl-add" data-addaction="${yr}_${pi}">${ic("plus")} Action / objectif</button>`}
        </div>
      </div>`;
    });
    html += `</div></div>`;
    if(yr===1) html += handoffBand();
  });
  return `<div class="timeline">${html}</div>`;
}
function jalonChip(j){
  return `<div class="jchip ${j.fait?"done":""}" ${RO?"":`data-jalon="${esc(j.id)}"`}>
    <button class="jcheck" ${RO?"disabled":`data-jtoggle="${esc(j.id)}"`} aria-label="Atteint">${j.fait?ic("check"):""}</button>
    <span class="jchip-tx"><span class="jchip-n">${ic("flag")} ${esc(j.nom)}</span>${j.date?`<span class="jchip-d">${esc(j.date)}</span>`:""}${j.note?`<span class="jchip-note">${esc(j.note)}</span>`:""}</span>
  </div>`;
}
function actionCard(a){
  const col = a.discId?discColor(a.discId):"#8b94a3";
  const st = ASTAT[a.statut||"prevu"];
  const dn = a.discId?discName(a.discId):"";
  return `<div class="acard" style="--c:${col}" ${RO?"":`data-actedit="${esc(a.id)}"`}>
    <div class="acard-top"><span class="acard-st" style="--sc:${st.c}">${st.lab}</span>${dn?`<span class="acard-disc">${esc(dn)}</span>`:""}</div>
    <div class="acard-t">${esc(a.titre)}</div>
    ${a.detail?`<div class="acard-d">${esc(a.detail)}</div>`:""}
    <div class="acard-by">${a.ini?avatar(a.ini,"xs",a.color):""}</div>
  </div>`;
}
function handoffBand(){
  const ready=dossier.transmissionPrete;
  const filled=["t_bilan","t_reste","t_reprise"].some(f=>dossier[f]&&String(dossier[f]).trim());
  return `<div class="handoff ${ready?"ready":""}">
    <div class="handoff-ic">${ic("handoff")}</div>
    <div class="handoff-tx">
      <strong>Passage de témoin · année 1 → année 2</strong>
      <span>${ready?"Transmission prête : l'équipe de 2e année peut reprendre.":(filled?"En cours de rédaction par l'équipe de 1re année.":"À remplir en fin d'année 1 pour que l'équipe suivante poursuive.")}</span>
    </div>
    <button class="handoff-go" data-sec="transmission">${ic("chevd")} Ouvrir</button>
  </div>`;
}

function viewDossier(){
  const d=dossier;
  // Cadre officiel
  const cadreBody = `<div class="cadre">${CADRE.map(c=>`<div class="cadre-i">${ic("shield")}<div>${c}</div></div>`).join("")}</div>`;
  // Cadre pédagogique
  const pedaBody = `<div class="frows">
    ${fieldRow("resume","Résumé du chef-d'œuvre","doc")}
    ${fieldRow("finalite","Finalité professionnelle","target")}
    ${fieldRow("problematique","Problématique / intention","spark")}
    ${fieldRow("production","Production finale attendue","award")}
  </div>
  <div class="subh">${ic("layers")} Disciplines qui coexistent <span class="subh-hint">(couleurs reprises dans la timeline)</span></div>
  ${chipsList("discipline","Discipline")}
  <div class="subh">${ic("target")} Compétences professionnelles</div>${listLines("comp_pro","Ajouter une compétence pro","target")}
  <div class="subh">${ic("users")} Compétences transversales</div>${listLines("comp_trans","Ajouter une compétence transversale","users")}
  <div class="subh">${ic("book")} Liens avec le référentiel & contraintes (hygiène, sécurité, DD…)</div>${listLines("referentiel","Ajouter un lien / une contrainte","book")}`;
  // Suivi horaire (souple)
  const horBody = `<div class="hint-card">${ic("clock")} <div>Cadre indicatif : <b>87 h</b> en année 1 + <b>78 h</b> en année 2 = <b>165 h</b> sur le cycle (dotation professeur = le double). On raisonne en <b>groupes d'heures</b>, pas heure par heure.</div></div>
    <div class="frows">${fieldRow("heures1","Volume & rythme — année 1","clock")}${fieldRow("heures2","Volume & rythme — année 2","clock")}</div>`;
  // Transmission
  const transBody = `<div class="hint-card gold">${ic("handoff")} <div>Le <b>passage de témoin</b> : l'équipe de 1re année consigne ici ce qui a été fait et ce qui reste, pour que l'équipe de 2e année reprenne sans repartir de zéro.</div></div>
    <div class="frows">
      ${fieldRow("t_bilan","Année 1 — ce qui a été fait (bilan)","award")}
      ${fieldRow("t_decisions","Décisions prises","check")}
      ${fieldRow("t_reste","Ce qui reste à faire en année 2","route")}
      ${fieldRow("t_vigilance","Points de vigilance","alert")}
      ${fieldRow("t_reprise","Consignes de reprise (rentrée année 2)","flag")}
    </div>
    <div class="subh">${ic("book")} Ressources utilisées / à transmettre</div>${listLines("ressource","Ajouter une ressource","book")}
    ${RO?"":`<button class="btn ${d.transmissionPrete?"":"primary"} wfull" data-transready>${ic(d.transmissionPrete?"x":"check")} ${d.transmissionPrete?"Transmission marquée prête — annuler":"Marquer la transmission comme prête"}</button>`}`;
  // Acteurs & jury
  const actBody = `<div class="subh">${ic("user")} Enseignants référents <span class="subh-hint">(noms facultatifs — « Référent 1 » suffit)</span></div>${chipsList("acteur","Référent")}
    <div class="subh">${ic("users")} Partenaires</div>${chipsList("partenaire","Partenaire")}
    <div class="subh">${ic("mic")} Jury de l'oral</div>${chipsList("jury","Membre du jury")}`;
  // Évaluation & oral
  const evalBody = `<div class="hint-card">${ic("mic")} <div><b>Oral terminal (année 2)</b> — 10 min : 5 min de présentation + 5 min de questions. Support facultatif de 5 pages recto max. On évalue la <b>démarche</b>, pas le livrable. <span class="cref">Arrêté du 28 nov. 2019</span></div></div>
    <div class="frows">${fieldRow("prepaOral","Préparation de l'oral","mic")}${fieldRow("support","Support de présentation (5 p. max)","doc")}${fieldRow("oralDate","Date de l'oral final","calendar")}</div>
    <div class="subh">${ic("check")} Critères d'évaluation <span class="subh-hint">(pré-remplis d'après la grille officielle — modifiables)</span></div>${listLines("critere","Ajouter un critère","check")}
    <div class="subh">${ic("info")} Questions possibles du jury</div>${listLines("question","Ajouter une question","info")}
    <div class="subh">${ic("award")} Bilan par groupe <span class="subh-hint">(anonyme : Groupe A, Équipe 1… jamais de nom d'élève)</span></div>${listLines("bilan","Ajouter un bilan de groupe","users")}`;

  return `${dashHero()}
    ${secBlock("cadre","shield","Le cadre officiel","Repères réglementaires — chef-d'œuvre CAP",cadreBody,"#0e7c66")}
    ${secBlock("peda","layers","Cadre pédagogique","Résumé, finalité, disciplines, compétences",pedaBody,"#2f6cd6")}
    ${secBlock("timeline","calendar","Timeline sur deux ans","Périodes, actions, jalons — la vue d'ensemble",timelineBlock(),"#7f57c9")}
    ${secBlock("transmission","handoff","Passage de témoin","Année 1 → année 2 — la mémoire de l'équipe",transBody,"#9a6b16")}
    ${secBlock("hor","clock","Volume horaire","Cadre 165 h, en groupes d'heures",horBody,"#0e7c66")}
    ${secBlock("acteurs","users","Acteurs & jury","Référents, partenaires, jury de l'oral",actBody,"#185fa5")}
    ${secBlock("eval","mic","Évaluation & oral","Cadre, critères, questions, bilan",evalBody,"#c0392b")}
    <div class="ov-foot">
      <button class="lnk" id="presBtn">${ic("award")} Vue de présentation</button>
      ${RO?"":`<button class="lnk" id="exportBtn">${ic("download")} Exporter (JSON)</button>
      <button class="lnk" id="dupBtn">${ic("copy")} Dupliquer comme modèle</button>
      <button class="lnk danger" id="delDossier">${ic("trash")} Supprimer</button>`}
    </div>`;
}

/* ---------- Présentation ---------- */
function viewPresentation(){
  const d=dossier; const jl=jalons();
  const sec=(t,h)=> h?`<div class="pr-sec"><h3>${t}</h3>${h}</div>`:"";
  const txt=(f)=> d[f]&&String(d[f]).trim()?`<p>${esc(d[f])}</p>`:"";
  const lines=(type)=>{ const a=byType(type); return a.length?`<ul>${a.map(e=>`<li>${esc(e.texte||e.nom)}</li>`).join("")}</ul>`:""; };
  const discChips = discs().map(e=>`<span class="pr-chip" style="--cc:${e.color}"><span class="chip-dot" style="background:${e.color}"></span>${esc(e.nom)}</span>`).join("");
  const tl = [1,2].map(yr=>`<div class="pr-year"><h4>Année ${yr} · ${anScolaire(yr)}</h4>${PERIODES.map((pl,pi)=>{
    const js=jl.filter(j=>j.annee===yr&&j.periode===pi), as=actionsOf(yr,pi);
    if(!js.length&&!as.length) return "";
    return `<div class="pr-per"><div class="pr-perlab">${esc(pl)}</div><div class="pr-peritems">${js.map(j=>`<span class="pr-jal ${j.fait?"done":""}">${ic("flag")} ${esc(j.nom)}</span>`).join("")}${as.map(a=>`<span class="pr-act" style="--c:${a.discId?discColor(a.discId):"#8b94a3"}">${esc(a.titre)}</span>`).join("")}</div></div>`;
  }).join("")}</div>`).join("");
  const transmission = ["t_bilan","t_decisions","t_reste","t_vigilance","t_reprise"].some(f=>d[f]&&String(d[f]).trim())
    ? `<div class="pr-trans">${["t_bilan|Bilan année 1","t_decisions|Décisions","t_reste|Reste à faire (année 2)","t_vigilance|Vigilance","t_reprise|Consignes de reprise"].map(s=>{const[f,l]=s.split("|");return d[f]&&String(d[f]).trim()?`<div class="pr-tr"><b>${l}</b><p>${esc(d[f])}</p></div>`:"";}).join("")}</div>` : "";
  const p=PHASES[d.phase||"brouillon"]||PHASES.brouillon;
  return `<div class="pres-wrap">
    <button class="lnk back-dossier" data-backdossier>${ic("back")} Retour au dossier</button>
    <article class="pres" id="presDoc">
      <header class="pr-head" style="--c:${p.c}">
        <div class="pr-eyebrow">${ic("cap")} Chef-d'œuvre CAP · ${esc(d.specialite||"")}</div>
        <h1>${esc(d.titre)}</h1>
        <div class="pr-meta">${cohorte()?`Promotion ${cohorte()}`:""}${d.classe?` · ${esc(d.classe)}`:""}${d.nbEleves?` · ${d.nbEleves} élèves`:""} · ${p.lab}</div>
        ${txt("resume")}
      </header>
      ${discChips?`<div class="pr-sec"><h3>Disciplines</h3><div class="pr-chips">${discChips}</div></div>`:""}
      ${sec("Finalité & intention", txt("finalite")+txt("problematique")+txt("production"))}
      ${sec("Compétences visées", lines("comp_pro")+lines("comp_trans"))}
      ${sec("Déroulé sur deux ans", `<div class="pr-tl">${tl}</div>`)}
      ${sec("Passage de témoin · année 1 → année 2", transmission)}
      ${sec("Évaluation & oral", (d.prepaOral?`<p>${esc(d.prepaOral)}</p>`:"")+lines("critere"))}
      <footer class="pr-foot">${ic("shield")} Document d'équipe — RGPD : aucun nom d'élève. Généré le ${dateFr()}.</footer>
    </article>
    <div class="pres-acts">${RO?"":`<button class="btn primary" id="printPres">${ic("download")} Imprimer / PDF</button><button class="btn" id="sharePres">${ic("send")} Partager (lecture seule)</button>`}</div>
  </div>`;
}

/* =====================  FEUILLES (édition)  ===================== */
function openSheet(html){ $("#overlay").innerHTML=`<div class="sheet">${html}</div>`; $("#overlay").classList.add("show"); }
function closeSheet(){ $("#overlay").classList.remove("show"); $("#overlay").innerHTML=""; }

const FIELDS = {
  resume:{l:"Résumé du chef-d'œuvre",ph:"En une ou deux phrases : de quoi s'agit-il ?",t:"area"},
  finalite:{l:"Finalité professionnelle",ph:"À quoi sert ce projet pour le métier préparé ?",t:"area"},
  problematique:{l:"Problématique / intention",ph:"La question ou l'intention qui guide le projet",t:"area"},
  production:{l:"Production finale attendue",ph:"Ce qui sera concrètement réalisé (matériel ou immatériel)",t:"area"},
  heures1:{l:"Volume & rythme — année 1",ph:"Cadre : ~87 h. En groupes d'heures : ex. ~10 h en novembre, atelier sur 2 semaines…",t:"area"},
  heures2:{l:"Volume & rythme — année 2",ph:"Cadre : ~78 h. En groupes d'heures…",t:"area"},
  t_bilan:{l:"Année 1 — ce qui a été fait (bilan)",ph:"Le bilan de l'année 1 à transmettre à l'équipe suivante…",t:"area"},
  t_decisions:{l:"Décisions prises",ph:"Les choix de l'équipe : sujet, organisation, partenaires…",t:"area"},
  t_reste:{l:"Ce qui reste à faire en année 2",ph:"Ce que l'équipe de 2e année doit poursuivre et clôturer…",t:"area"},
  t_vigilance:{l:"Points de vigilance",ph:"Ce à quoi la prochaine équipe doit faire attention…",t:"area"},
  t_reprise:{l:"Consignes de reprise (année 2)",ph:"Par où commencer à la rentrée de l'année 2…",t:"area"},
  prepaOral:{l:"Préparation de l'oral",ph:"Comment préparer l'élève (10 min : 5 présentation + 5 questions)…",t:"area"},
  support:{l:"Support de présentation (5 pages recto max)",ph:"Notes sur le support : plan, visuels, photos du projet…",t:"area"},
  oralDate:{l:"Date de l'oral final",ph:"ex. mi-juin 2027",t:"text"},
};
function openField(field){
  const m=FIELDS[field]; if(!m) return;
  const v=dossier[field]||"";
  const input = m.t==="area" ? `<textarea id="fv" rows="5" placeholder="${esc(m.ph)}">${esc(v)}</textarea>` : `<input id="fv" placeholder="${esc(m.ph)}" value="${esc(v)}">`;
  openSheet(`<div class="sheet-head"><h3>${esc(m.l)}</h3><button class="x" data-close>${ic("x")}</button></div><div class="field">${input}</div><div class="actions"><button class="btn primary" id="fsave">${ic("check")} Enregistrer</button></div>`);
  setTimeout(()=>{const el=$("#fv");el&&el.focus();},40);
  $("#fsave").onclick=()=>setDoc({[field]:$("#fv").value.trim()});
}

const ELS = {
  discipline:{title:"Discipline",fields:["nom"],color:true},
  comp_pro:{title:"Compétence professionnelle",fields:["texte"]},
  comp_trans:{title:"Compétence transversale",fields:["texte"]},
  referentiel:{title:"Lien référentiel / contrainte",fields:["texte"]},
  acteur:{title:"Enseignant référent",fields:["nom","fonction"],ph:{nom:"ex. Référent 1 (ou initiales)",fonction:"ex. Enseignement pro"}},
  partenaire:{title:"Partenaire",fields:["nom","fonction"],ph:{nom:"ex. Entreprise locale, association",fonction:"ex. accueil / matériel"}},
  jury:{title:"Membre du jury",fields:["nom","fonction"],ph:{nom:"ex. Référent 1",fonction:"ex. Enseignement général"}},
  critere:{title:"Critère d'évaluation",fields:["texte"]},
  question:{title:"Question du jury",fields:["texte"]},
  ressource:{title:"Ressource",fields:["texte"]},
  bilan:{title:"Bilan de groupe (anonyme)",fields:["texte"],ph:{texte:"ex. Groupe A : maîtrise la démarche, à travailler l'argumentation"}},
};
function openEl(type, id){
  if(!ident){ openIdent(); return; }
  const m=ELS[type]; if(!m) return;
  const cur = id ? els.find(e=>e.id===id) : {};
  let color = cur.color || DISC_COLORS[discs().length % DISC_COLORS.length];
  const fieldHtml = m.fields.map(f=>{
    const ph=(m.ph&&m.ph[f])||"";
    const lab = f==="nom"?"Nom / intitulé":f==="fonction"?"Fonction (facultatif)":"Texte";
    return `<div class="field"><label>${lab}</label><input data-f="${f}" placeholder="${esc(ph)}" value="${esc(cur[f]||"")}"></div>`;
  }).join("");
  const colorRow = m.color?`<div class="field"><label>Couleur</label><div class="color-row" id="elColors">${DISC_COLORS.map(c=>`<button type="button" class="color-sw ${color===c?"on":""}" data-c="${c}" style="background:${c}"></button>`).join("")}</div></div>`:"";
  openSheet(`<div class="sheet-head"><h3>${id?"Modifier":""} ${esc(m.title)}</h3><button class="x" data-close>${ic("x")}</button></div>${fieldHtml}${colorRow}<div class="actions">${id?`<button class="btn danger-btn" id="elDel">${ic("trash")}</button>`:""}<button class="btn primary" id="elSave">${ic("check")} ${id?"Enregistrer":"Ajouter"}</button></div>`);
  setTimeout(()=>{const el=$("#overlay input");el&&el.focus();},40);
  if(m.color) $("#elColors").querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{color=b.dataset.c;$("#elColors").querySelectorAll(".color-sw").forEach(x=>x.classList.toggle("on",x===b));});
  $("#elSave").onclick=async()=>{
    const obj={type}; m.fields.forEach(f=>obj[f]=($(`#overlay [data-f="${f}"]`).value||"").trim());
    if(m.color) obj.color=color;
    if(m.fields.includes("nom")&&!obj.nom){ toast("Indiquez un intitulé."); return; }
    if(m.fields.includes("texte")&&!obj.texte){ toast("Écrivez quelque chose."); return; }
    if(id) await updEl(id,obj); else await addEl(obj);
    closeSheet();
  };
  if(id) $("#elDel").onclick=async()=>{ await delEl(id,true); closeSheet(); };
}

function openAction(slot, id){
  if(!ident){ openIdent(); return; }
  const [yr,pi]=slot.split("_").map(Number);
  const cur = id ? els.find(e=>e.id===id) : {annee:yr,periode:pi,statut:"prevu"};
  const ds=discs();
  openSheet(`<div class="sheet-head"><h3>${id?"Modifier l'action":"Action / objectif"} <small class="sh-sub">Année ${cur.annee} · ${PERIODES[cur.periode]}</small></h3><button class="x" data-close>${ic("x")}</button></div>
    <div class="field"><label>Intitulé</label><input id="aTit" placeholder="ex. Visite d'un restaurant partenaire" value="${esc(cur.titre||"")}"></div>
    <div class="field"><label>Détail (facultatif)</label><textarea id="aDet" rows="2" placeholder="Précisions, objectif visé…">${esc(cur.detail||"")}</textarea></div>
    <div class="field"><label>Discipline</label><div class="seg" id="aDisc">${ds.length?ds.map(d=>`<button type="button" class="seg-btn ${cur.discId===d.id?"on":""}" data-d="${esc(d.id)}" style="--c:${d.color}"><span class="chip-dot" style="background:${d.color}"></span>${esc(d.nom)}</button>`).join(""):`<span class="muted" style="font-size:13px">Ajoutez des disciplines dans « Cadre pédagogique » pour les colorer ici.</span>`}<button type="button" class="seg-btn ${cur.discId?"":"on"}" data-d="">Aucune</button></div></div>
    <div class="field"><label>Statut</label><div class="seg" id="aStat">${Object.entries(ASTAT).map(([k,v])=>`<button type="button" class="seg-btn ${ (cur.statut||"prevu")===k?"on":""}" data-s="${k}" style="--c:${v.c}">${v.lab}</button>`).join("")}</div></div>
    <div class="actions">${id?`<button class="btn danger-btn" id="aDel">${ic("trash")}</button>`:""}<button class="btn primary" id="aSave">${ic("check")} ${id?"Enregistrer":"Ajouter"}</button></div>`);
  let discId=cur.discId||"", statut=cur.statut||"prevu";
  $("#aDisc").querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{discId=b.dataset.d;$("#aDisc").querySelectorAll(".seg-btn").forEach(x=>x.classList.toggle("on",x===b));});
  $("#aStat").querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>{statut=b.dataset.s;$("#aStat").querySelectorAll(".seg-btn").forEach(x=>x.classList.toggle("on",x===b));});
  setTimeout(()=>$("#aTit")&&$("#aTit").focus(),40);
  $("#aSave").onclick=async()=>{ const titre=$("#aTit").value.trim(); if(!titre){toast("Donnez un intitulé.");return;} const obj={type:"action",titre,detail:$("#aDet").value.trim(),annee:cur.annee,periode:cur.periode,discId,statut}; if(id) await updEl(id,obj); else await addEl(obj); closeSheet(); };
  if(id) $("#aDel").onclick=async()=>{ await delEl(id,true); closeSheet(); };
}

function openJalon(id){
  const j=els.find(e=>e.id===id); if(!j) return;
  openSheet(`<div class="sheet-head"><h3>Jalon <small class="sh-sub">Année ${j.annee} · ${PERIODES[j.periode]}</small></h3><button class="x" data-close>${ic("x")}</button></div>
    <div class="field"><label>Intitulé</label><input id="jNom" value="${esc(j.nom)}"></div>
    <div class="field"><label>Date / repère (facultatif)</label><input id="jDate" placeholder="ex. mi-juin" value="${esc(j.date||"")}"></div>
    <div class="field"><label>Note (facultatif)</label><textarea id="jNote" rows="2" placeholder="Précision sur ce jalon…">${esc(j.note||"")}</textarea></div>
    <label class="rchk"><input type="checkbox" id="jFait" ${j.fait?"checked":""}> <span>Jalon atteint</span></label>
    <div class="actions"><button class="btn danger-btn" id="jDel">${ic("trash")}</button><button class="btn primary" id="jSave">${ic("check")} Enregistrer</button></div>`);
  $("#jSave").onclick=async()=>{ await updEl(id,{nom:$("#jNom").value.trim()||j.nom,date:$("#jDate").value.trim(),note:$("#jNote").value.trim(),fait:$("#jFait").checked}); closeSheet(); };
  $("#jDel").onclick=async()=>{ await delEl(id,true); closeSheet(); };
}
function openAddJalon(){
  if(!ident){openIdent();return;}
  openSheet(`<div class="sheet-head"><h3>Nouveau jalon</h3><button class="x" data-close>${ic("x")}</button></div>
    <div class="field"><label>Intitulé</label><input id="jNom" placeholder="ex. Réunion d'équipe"></div>
    <div class="field"><label>Année</label><div class="seg" id="jAn"><button type="button" class="seg-btn on" data-a="1">Année 1</button><button type="button" class="seg-btn" data-a="2">Année 2</button></div></div>
    <div class="field"><label>Période</label><div class="seg wrap" id="jPe">${PERIODES.map((p,i)=>`<button type="button" class="seg-btn ${i===0?"on":""}" data-p="${i}">${esc(p)}</button>`).join("")}</div></div>
    <div class="actions"><button class="btn primary" id="jSave">${ic("plus")} Ajouter</button></div>`);
  let an=1,pe=0;
  $("#jAn").querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>{an=+b.dataset.a;$("#jAn").querySelectorAll(".seg-btn").forEach(x=>x.classList.toggle("on",x===b));});
  $("#jPe").querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>{pe=+b.dataset.p;$("#jPe").querySelectorAll(".seg-btn").forEach(x=>x.classList.toggle("on",x===b));});
  $("#jSave").onclick=async()=>{ const nom=$("#jNom").value.trim(); if(!nom){toast("Donnez un intitulé.");return;} await addEl({type:"jalon",nom,annee:an,periode:pe,fait:false}); closeSheet(); };
}

function openPhase(){
  openSheet(`<div class="sheet-head"><h3>Où en est ce chef-d'œuvre ?</h3><button class="x" data-close>${ic("x")}</button></div>
    <div class="phase-list">${PHASE_ORDER.map(k=>`<button class="phase-opt ${(dossier.phase||"brouillon")===k?"on":""}" data-setphase="${k}"><span class="po-dot" style="background:${PHASES[k].c}"></span><span>${PHASES[k].lab}</span>${(dossier.phase||"brouillon")===k?ic("check"):""}</button>`).join("")}</div>`);
}

function openIdent(){
  let role=ident?ident.role:""; let color=ident&&ident.color||"";
  const drawPrev=()=>{ const av=$("#identPrev"); if(!av) return; const i=($("#iIni").value.trim().toUpperCase())||"?"; av.style.background=color||colorFor(i); av.textContent=i.slice(0,3); };
  openSheet(`<div class="sheet-head"><h3>Votre identité</h3><button class="x" data-close>${ic("x")}</button></div><p class="muted" style="font-size:13.5px;margin:0 0 14px">RGPD : seulement vos <b>initiales</b> et votre <b>rôle</b> — jamais de nom.</p>
    <div class="ident-prev"><span class="ava lg" id="identPrev"></span><span class="muted" style="font-size:12.5px">Votre pastille (couleur = vous).</span></div>
    <div class="field"><label for="iIni">Vos initiales</label><input id="iIni" maxlength="4" placeholder="ex. B.D." value="${esc(ident?ident.initiales:"")}" style="text-transform:uppercase;font-weight:700"></div>
    <div class="field"><label>Couleur</label><div class="color-row" id="iColors">${PALETTE.map(c=>`<button type="button" class="color-sw ${color===c?"on":""}" data-color="${c}" style="background:${c}"></button>`).join("")}<button type="button" class="color-sw auto ${color?"":"on"}" data-color="">A</button></div></div>
    <div class="field"><label>Votre rôle</label><div class="roles" id="iRoles">${ROLES.map(r=>`<button type="button" class="role-chip ${ident&&ident.role===r?"sel":""}" data-role="${esc(r)}">${esc(r)}</button>`).join("")}</div></div>
    <div class="actions"><button class="btn primary" id="saveIdent">${ic("check")} Enregistrer</button></div>`);
  $("#iRoles").querySelectorAll("[data-role]").forEach(b=>b.onclick=()=>{role=b.dataset.role;$("#iRoles").querySelectorAll(".role-chip").forEach(x=>x.classList.toggle("sel",x===b));});
  $("#iColors").querySelectorAll("[data-color]").forEach(b=>b.onclick=()=>{color=b.dataset.color;$("#iColors").querySelectorAll(".color-sw").forEach(x=>x.classList.toggle("on",x===b));drawPrev();});
  $("#iIni").oninput=drawPrev; drawPrev();
  $("#saveIdent").onclick=()=>{const i=$("#iIni").value.trim().toUpperCase();if(!i){toast("Indiquez vos initiales.");return;}if(!role){toast("Choisissez votre rôle.");return;}ident={initiales:i,role,color};localStorage.setItem("projets_ident_v1",JSON.stringify(ident));closeSheet();render();toast("Identité enregistrée",true);};
}

function openNew(){
  const yNow = 2025;
  openSheet(`<div class="sheet-head"><h3>Nouveau chef-d'œuvre</h3><button class="x" data-close>${ic("x")}</button></div>
    <div class="field"><label for="nTit">Intitulé du chef-d'œuvre</label><input id="nTit" placeholder="ex. Restaurant éphémère éco-responsable"></div>
    <div class="field"><label for="nSpec">Spécialité / filière</label><input id="nSpec" placeholder="ex. CAP Production et service en restaurations"></div>
    <div class="grid2"><div class="field"><label for="nDeb">Année de début (1re année)</label><input id="nDeb" type="number" inputmode="numeric" placeholder="${yNow}" value="${yNow}"></div><div class="field"><label for="nEl">Nombre d'élèves</label><input id="nEl" type="number" inputmode="numeric" placeholder="ex. 12"></div></div>
    <div class="field"><label for="nCls">Classe / groupe (anonyme)</label><input id="nCls" placeholder="ex. 1re CAP PSR"></div>
    <label class="rchk"><input type="checkbox" id="nPilote" ${ident?"checked":""} ${ident?"":"disabled"}> <span>Je pilote ce chef-d'œuvre ${ident?`<span class="muted">(${esc(ident.initiales)})</span>`:`<span class="muted">— identifiez-vous d'abord</span>`}</span></label>
    <p class="muted" style="font-size:12.5px;margin:12px 0 0">La timeline 2 ans, les jalons officiels, les critères et des questions d'oral seront pré-installés — tout reste modifiable.</p>
    <div class="actions"><button class="btn primary" id="createD">${ic("plus")} Créer le dossier</button></div>`);
  setTimeout(()=>$("#nTit")&&$("#nTit").focus(),40);
  $("#createD").onclick=async()=>{
    const titre=$("#nTit").value.trim(); if(!titre){toast("Donnez un intitulé.");return;}
    const pilote=($("#nPilote")&&$("#nPilote").checked&&ident)?{ini:ident.initiales,role:ident.role,color:ident.color||""}:null;
    const btn=$("#createD"); btn.disabled=true; btn.textContent="Création…";
    try{
      const ref=await addDoc(collection(db,COL),{ titre, specialite:$("#nSpec").value.trim(), anneeDebut:num($("#nDeb").value)||yNow, nbEleves:num($("#nEl").value), classe:$("#nCls").value.trim(), phase:"a1", transmissionPrete:false, pilote, createdAt:serverTimestamp() });
      await seed(ref.id);
      closeSheet(); await openDossier(ref.id);
    }catch(e){ console.error(e); fbError=true; btn.disabled=false; btn.innerHTML=`${ic("plus")} Créer le dossier`; toast("Enregistrement impossible."); }
  };
}
async function seed(did){
  const col=collection(db,COL,did,"elements"); let n=0;
  for(const j of JALONS_DEF){ await addDoc(col,{type:"jalon",nom:j.nom,annee:j.annee,periode:j.periode,fait:false,ordre:n++,official:true}); }
  for(const c of CRIT_DEF){ await addDoc(col,{type:"critere",texte:c}); }
  for(const q of Q_DEF){ await addDoc(col,{type:"question",texte:q}); }
}

/* =====================  FIRESTORE  ===================== */
async function addEl(obj){ if(!dossier) return; try{ const ref=await addDoc(collection(db,COL,dossier.id,"elements"),{...obj,ini:ident?ident.initiales:"",role:ident?ident.role:"",color:obj.color||(ident?ident.color:"")||"",createdAt:serverTimestamp()}); saved(); return ref; }catch(e){console.error(e);toast("Ajout impossible.");} }
async function updEl(id,obj){ try{ await updateDoc(doc(db,COL,dossier.id,"elements",id),{...obj,editedAt:Date.now()}); saved(); }catch(e){console.error(e);toast("Action impossible.");} }
async function delEl(id,sure){ if(!sure && !confirm("Supprimer cet élément ?")) return; try{ await deleteDoc(doc(db,COL,dossier.id,"elements",id)); saved(); }catch(e){console.error(e);toast("Suppression impossible.");} }
async function setDoc(obj){ try{ await updateDoc(doc(db,COL,dossier.id),obj); closeSheet(); saved(); }catch(e){console.error(e);toast("Action impossible.");} }
async function setDocQuiet(obj){ try{ await updateDoc(doc(db,COL,dossier.id),obj); }catch(e){console.error(e);toast("Action impossible.");} }

async function loadListe(){
  try{ const snap=await getDocs(query(collection(db,COL), orderBy("createdAt","desc")));
    dossiers=await Promise.all(snap.docs.map(async dd=>{ const data={id:dd.id,...dd.data()}; try{ const es=await getDocs(collection(db,COL,dd.id,"elements")); let jt=0,jf=0; es.forEach(x=>{const v=x.data(); if(v.type==="jalon"){jt++; if(v.fait)jf++;}}); data._jtot=jt; data._jfait=jf; }catch(_){ data._jtot=0; data._jfait=0; } return data; }));
    fbError=false;
  }catch(e){ console.error(e); fbError=true; dossiers=[]; }
  if(view==="liste") render();
}
async function openDossier(id){
  if(unsub){unsub();} if(unsubE){unsubE();}
  try{ const ref=doc(db,COL,id); const ds=await getDoc(ref); if(!ds.exists()){ toast("Dossier introuvable."); view="liste"; render(); return; }
    dossier={id,...ds.data()}; view="dossier"; render();
    unsub=onSnapshot(ref,s=>{ if(!s.exists())return; dossier={id,...s.data()}; if(view!=="liste") render(); });
    unsubE=onSnapshot(collection(db,COL,id,"elements"),s=>{ els=s.docs.map(d=>{const x={id:d.id,...d.data()}; x._t=x.createdAt&&x.createdAt.seconds?x.createdAt.seconds:Date.now()/1000; return x;}); if(view!=="liste") render(); });
  }catch(e){ console.error(e); fbError=true; toast("Ouverture impossible."); }
}
function backToListe(){ if(unsub){unsub();unsub=null;} if(unsubE){unsubE();unsubE=null;} view="liste"; dossier=null; els=[]; render(); loadListe(); }

async function delDossier(){
  if(!dossier) return;
  if(!confirm(`Supprimer définitivement « ${dossier.titre} » et tout son contenu ?\n\nIrréversible. Pensez à l'exporter (JSON) avant si besoin.`)) return;
  const id=dossier.id;
  try{ const es=await getDocs(collection(db,COL,id,"elements")); for(const d of es.docs){ await deleteDoc(doc(db,COL,id,"elements",d.id)); } await deleteDoc(doc(db,COL,id)); backToListe(); toast("Dossier supprimé",true); }
  catch(e){ console.error(e); toast("Suppression impossible."); }
}
function exportJSON(){
  const data={ _type:"chef-doeuvre-cap", titre:dossier.titre, specialite:dossier.specialite, anneeDebut:dossier.anneeDebut, nbEleves:dossier.nbEleves, classe:dossier.classe, phase:dossier.phase, doc:{}, elements:els.map(({id,_t,createdAt,...r})=>r) };
  ["resume","finalite","problematique","production","heures1","heures2","t_bilan","t_decisions","t_reste","t_vigilance","t_reprise","prepaOral","support","oralDate","transmissionPrete"].forEach(f=>data.doc[f]=dossier[f]||"");
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="chef-doeuvre-"+String(dossier.titre||"cap").replace(/[^a-z0-9]+/gi,"-").toLowerCase().slice(0,40)+".json"; a.click(); URL.revokeObjectURL(a.href); toast("Exporté",true);
}
function importJSON(){
  const inp=document.createElement("input"); inp.type="file"; inp.accept="application/json,.json";
  inp.onchange=()=>{ const f=inp.files[0]; if(!f) return; const r=new FileReader(); r.onload=async()=>{ try{ const data=JSON.parse(r.result); await createFrom(data,false); }catch(e){ console.error(e); toast("Fichier illisible."); } }; r.readAsText(f); };
  inp.click();
}
async function duplicateModel(){
  if(!confirm("Créer une copie « modèle » pour une nouvelle promotion ?\n\nLa structure (timeline, disciplines, compétences, critères, questions, jalons) est conservée. Les traces de la cohorte (réalisations, transmission, bilans, statuts des jalons) sont effacées.")) return;
  const data={ titre:dossier.titre+" — modèle", specialite:dossier.specialite, anneeDebut:(dossier.anneeDebut||2025)+1, nbEleves:0, classe:"", phase:"brouillon",
    doc:{ resume:dossier.resume||"", finalite:dossier.finalite||"", problematique:dossier.problematique||"", production:dossier.production||"" },
    elements: els.filter(e=>["discipline","comp_pro","comp_trans","referentiel","critere","question"].includes(e.type)).map(({id,_t,createdAt,ini,role,...r})=>r)
      .concat(els.filter(e=>e.type==="jalon").map(j=>({type:"jalon",nom:j.nom,annee:j.annee,periode:j.periode,fait:false,ordre:j.ordre||0,official:!!j.official}))) };
  await createFrom(data,true);
}
async function createFrom(data, isModel){
  try{
    const base={ titre:(data.titre||"Chef-d'œuvre")+(isModel?"":""), specialite:data.specialite||"", anneeDebut:data.anneeDebut||2025, nbEleves:data.nbEleves||0, classe:data.classe||"", phase:data.phase||"brouillon", transmissionPrete:false, pilote: ident?{ini:ident.initiales,role:ident.role,color:ident.color||""}:null, createdAt:serverTimestamp() };
    if(data.doc) Object.assign(base,data.doc);
    base.transmissionPrete = !!base.transmissionPrete;
    const ref=await addDoc(collection(db,COL),base);
    const col=collection(db,COL,ref.id,"elements");
    for(const e of (data.elements||[])){ await addDoc(col,{...e,createdAt:serverTimestamp()}); }
    toast(isModel?"Modèle créé":"Importé",true); await openDossier(ref.id);
  }catch(e){ console.error(e); fbError=true; toast("Création impossible."); }
}

/* =====================  CLICS  ===================== */
document.addEventListener("click", e=>{
  if(e.target.closest("[data-close]")||e.target.id==="overlay") return closeSheet();
  if(e.target.closest("[data-ident]")) return openIdent();
  const nw=e.target.closest("[data-new]"); if(nw){ if(!ident){toast("Identifiez-vous d'abord.");return openIdent();} return openNew(); }
  if(e.target.closest("[data-import]")){ if(!ident){toast("Identifiez-vous d'abord.");return openIdent();} return importJSON(); }
  const op=e.target.closest("[data-open]"); if(op) return openDossier(op.dataset.open);
  // sections
  const sc=e.target.closest("[data-sec]"); if(sc){ const id=sc.dataset.sec; if(openSecs.has(id))openSecs.delete(id); else openSecs.add(id); render(); const w=document.querySelector(`[data-secwrap="${id}"]`); if(w&&openSecs.has(id)) w.scrollIntoView({behavior:"smooth",block:"start"}); return; }
  // champs
  const fld=e.target.closest("[data-field]"); if(fld) return openField(fld.dataset.field);
  // éléments listes
  const ea=e.target.closest("[data-eladd]"); if(ea) return openEl(ea.dataset.eladd);
  const ed=e.target.closest("[data-eledit]"); if(ed){ const t=ed.dataset.eltype||(els.find(x=>x.id===ed.dataset.eledit)||{}).type; return openEl(t,ed.dataset.eledit); }
  const ex=e.target.closest("[data-eldel]"); if(ex){ e.stopPropagation(); return delEl(ex.dataset.eldel); }
  // actions timeline
  const aa=e.target.closest("[data-addaction]"); if(aa) return openAction(aa.dataset.addaction);
  const ae=e.target.closest("[data-actedit]"); if(ae){ const a=els.find(x=>x.id===ae.dataset.actedit); if(a) return openAction(a.annee+"_"+a.periode,a.id); return; }
  // jalons
  const jt=e.target.closest("[data-jtoggle]"); if(jt){ e.stopPropagation(); const j=els.find(x=>x.id===jt.dataset.jtoggle); if(j) return updEl(j.id,{fait:!j.fait}); return; }
  const je=e.target.closest("[data-jalon]"); if(je) return openJalon(je.dataset.jalon);
  if(e.target.closest("[data-addjalon]")) return openAddJalon();
  // phase
  if(e.target.closest("[data-phasebtn]")) return openPhase();
  const sp=e.target.closest("[data-setphase]"); if(sp) return setDoc({phase:sp.dataset.setphase});
  // transmission
  if(e.target.closest("[data-transready]")) return setDocQuiet({transmissionPrete:!dossier.transmissionPrete}).then(saved);
  // pilote
  if(e.target.closest("[data-pilote-take]")){ if(!ident) return openIdent(); return setDocQuiet({pilote:{ini:ident.initiales,role:ident.role,color:ident.color||""}}).then(saved); }
  if(e.target.closest("[data-pilote]")){ if(!ident) return openIdent(); const p=dossier.pilote; if(p&&p.ini===ident.initiales) return setDocQuiet({pilote:null}).then(saved); if(confirm("Devenir le pilote de ce dossier ?")) return setDocQuiet({pilote:{ini:ident.initiales,role:ident.role,color:ident.color||""}}).then(saved); return; }
  // pied
  if(e.target.closest("#presBtn")){ view="presentation"; return render(); }
  if(e.target.closest("[data-backdossier]")){ view="dossier"; return render(); }
  if(e.target.closest("#exportBtn")) return exportJSON();
  if(e.target.closest("#dupBtn")) return duplicateModel();
  if(e.target.closest("#delDossier")) return delDossier();
  if(e.target.closest("#printPres")) return window.print();
  if(e.target.closest("#sharePres")||e.target.closest("#shareDossier")){ const base=location.origin+location.pathname; const url=base+"?d="+dossier.id+"&ro=1"; navigator.clipboard?.writeText(url).then(()=>toast("Lien lecture copié",true)).catch(()=>toast(url)); return; }
  if(e.target.closest("#back")){ if(view==="presentation"){ view="dossier"; return render(); } if(view==="liste"){ location.href="../"; return; } return backToListe(); }
});
document.addEventListener("keydown", e=>{ if(e.key==="Escape")closeSheet(); });

loadListe().then(()=>{ const d=params.get("d"); if(d) openDossier(d); });
