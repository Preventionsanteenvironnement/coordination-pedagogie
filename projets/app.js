/* ============================================================================
   Atelier projet — moteur. Module Firestore (devoirs-pse / coordination_projets).
   Construction collaborative, temps réel, RGPD (initiales + rôle). Zéro émoji.
============================================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, doc, addDoc, getDocs, onSnapshot, updateDoc, deleteDoc,
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

/* ---------- Icônes ---------- */
const ICONS = {
  back:`<path d="m14 6-6 6 6 6"/>`, chev:`<path d="m9 6 6 6-6 6"/>`, down:`<path d="m6 9 6 6 6-6"/>`,
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
  star:`<path d="m12 4 2.3 4.7 5.2.8-3.8 3.6.9 5.1-4.6-2.4-4.6 2.4.9-5.1L4.5 9.5l5.2-.8z"/>`,
  info:`<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r=".8" fill="currentColor" stroke="none"/>`,
  trash:`<path d="M5 7h14M9 7V5h6v2M6 7l1 13h10l1-13"/>`,
  x:`<path d="m6 6 12 12M18 6 6 18"/>`,
  folder:`<path d="M3.5 7.5a2 2 0 0 1 2-2H9l2 2h7.5a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>`,
  check:`<path d="M5 12.5 10 17.5 19.5 7"/>`,
};
const ic = n => ICONS[n] ? `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>` : "";

/* ---------- Étapes (méthodologie) ---------- */
const ETAPES = [
  { id:"constats", nom:"Constats", icon:"eye",
    q:"Qu'est-ce qu'on observe concrètement ?",
    def:"On part du réel : ce qu'on voit, sans interpréter ni juger. Un constat est observable et vérifiable.",
    aide:"Décrire un comportement précis dans une situation précise.",
    ok:"Certains élèves quittent le cours quand ils ne comprennent pas la consigne.", non:"Les élèves sont immatures, ingérables." },
  { id:"diagnostic", nom:"Diagnostic", icon:"stethoscope",
    q:"Qu'est-ce que ces constats révèlent comme besoin réel ?",
    def:"Le constat décrit ; le diagnostic comprend. On cherche les mécanismes derrière ce qu'on observe.",
    aide:"Relisez les constats ci-dessus et demandez : « de quoi est-ce le signe ? »." },
  { id:"problematique", nom:"Problématique", icon:"help",
    q:"Quel problème précis allons-nous traiter ?",
    def:"La question centrale du projet. Ni trop large (« aider les élèves »), ni une solution déguisée (« créer une permanence »).",
    aide:"Formulez une vraie question. Marquez d'un ★ celle que l'équipe retient." },
  { id:"finalite", nom:"Finalité", icon:"compass",
    q:"Pourquoi fait-on ce projet ? Le cap.",
    def:"Le sens large, la direction. Elle n'est pas mesurable — c'est l'horizon, pas l'objectif précis.",
    aide:"Ex. « Favoriser l'accrochage scolaire et social des élèves »." },
  { id:"obj_general", nom:"Objectif général", icon:"target",
    q:"Qu'est-ce que le dispositif doit permettre à l'élève de faire ?",
    def:"La capacité visée — concrète, contrairement à la finalité. Ce que l'élève saura faire.",
    aide:"Ex. « Identifier une difficulté, repérer une ressource et préparer une action »." },
  { id:"obj_op", nom:"Objectifs opérationnels", icon:"checklist",
    q:"Qu'est-ce qu'on travaille concrètement et qu'on pourra vérifier ?",
    def:"On rend l'objectif général observable, en plusieurs objectifs vérifiables.",
    aide:"Verbes d'action : identifier, repérer, formuler, préparer, réaliser. À éviter : comprendre, améliorer, favoriser." },
  { id:"actions", nom:"Actions", icon:"bolt",
    q:"Quelles actions concrètes répondent aux objectifs ?",
    def:"Ce qu'on met réellement en place. Chaque action doit servir un objectif opérationnel.",
    aide:"Ex. fiche « je prépare ma demande », carte des ressources, fiche retour après absence…" },
  { id:"moyens", nom:"Moyens", icon:"tool",
    q:"De quels moyens a-t-on besoin ?",
    def:"Les ressources nécessaires : humaines, matérielles, partenaires.",
    aide:"Salle, adulte référent, fiches, ENT/Pronote, liens CPE/PP/DDFPT/infirmière/PsyEN…" },
  { id:"miseoeuvre", nom:"Mise en œuvre", icon:"calendar",
    q:"Où, quand, combien de temps ?",
    def:"Le concret de terrain : sans calendrier ni lieu, un projet reste une intention.",
    aide:"Lieu · créneau · période de l'année · durée · fréquence · échéances et bilans d'étape." },
  { id:"cadre", nom:"Cadre", icon:"shield",
    q:"Quelles sont les limites du dispositif ?",
    def:"Ce que le dispositif ne fait pas. Le cadre protège le projet des dérives.",
    aide:"Ex. pas de sanction, pas de suivi psy, pas de remplacement du CPE, sortie obligatoire avec une action…" },
  { id:"indicateurs", nom:"Indicateurs", icon:"chart",
    q:"À quoi verra-t-on que ça marche ?",
    def:"Les signes observables ou mesurables du suivi. Peu, mais utiles.",
    aide:"Ex. nombre de passages, ressources identifiées, demandes préparées, actions de sortie." },
  { id:"evaluation", nom:"Évaluation", icon:"clipboard",
    q:"Comment évalue-t-on ?",
    def:"Trois niveaux : l'activité (a-t-elle eu lieu ?), les résultats immédiats, les effets. Prévue dès le départ.",
    aide:"Bilans par période, analyse des usages, ajustements." },
  { id:"vigilance", nom:"Points de vigilance", icon:"alert",
    q:"Quels risques anticiper ?",
    def:"Les pièges à éviter pour que le projet ne dévie pas de son intention.",
    aide:"Ex. confusion avec la vie scolaire, sanction déguisée, espace refuge, attentes trop larges." },
];
const ROLES = ["Prof", "Prof PSE", "Prof principal", "Enseignant pro", "CPE", "DDFPT", "Infirmier·ère", "PsyEN", "AESH / Coordo ULIS", "Direction", "Documentaliste", "Autre"];
const PALETTE = ["#534ab7","#0f6e56","#993c1d","#185fa5","#9a5f0a","#993556","#3c6e3c","#5a6b8c"];
const colorFor = s => PALETTE[[...String(s||"?")].reduce((a,c)=>a+c.charCodeAt(0),0) % PALETTE.length];

/* ---------- État ---------- */
const params = new URLSearchParams(location.search);
let ident = JSON.parse(localStorage.getItem("projets_ident_v1") || "null");
let mine = new Set(JSON.parse(localStorage.getItem("projets_mine_v1") || "[]"));
let view = "liste";
let projets = [];
let projet = null;
let contribs = [];
let etapeIdx = 0;
let unsub = null;
let fbError = false;

const $ = s => document.querySelector(s);
const esc = v => String(v ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2400);}
function saveMine(){localStorage.setItem("projets_mine_v1",JSON.stringify([...mine]));}
const avatar = (ini)=>`<span class="ava" style="background:${colorFor(ini)}">${esc((ini||"?").slice(0,3))}</span>`;
const sortC = arr => arr.slice().sort((a,b)=>(b.epingle?1:0)-(a.epingle?1:0) || (a._t)-(b._t));
const base = location.origin + location.pathname;

/* ---------- Render ---------- */
function render(){
  const inProj = (view==="projet"||view==="fiche") && projet;
  $("#backLabel").textContent = view==="liste" ? "Portail" : "Projets";
  $("#title").textContent = inProj ? projet.titre : "Atelier projet";
  $("#subtitle").textContent = inProj ? (view==="fiche" ? "Fiche projet" : ETAPES[etapeIdx]?.nom) : "Construire à plusieurs mains";
  const ib=$("#identBtn");
  if(ident){ ib.hidden=false; ib.innerHTML=`${ic("user")} ${esc(ident.initiales)}`; } else { ib.hidden=true; }
  const fb=$("#ficheBtn"); fb.hidden = !(inProj && view!=="fiche"); fb.innerHTML=`${ic("file")} Fiche`;
  $("#etapebar").hidden = !inProj;
  if(inProj) renderEtapeBar();
  $("#view").innerHTML = view==="projet" ? viewEtape() : view==="fiche" ? viewFiche() : viewListe();
  window.scrollTo && window.scrollTo(0,0);
}

function renderEtapeBar(){
  const filled = new Set(contribs.map(c=>c.etape));
  $("#etapebar").innerHTML = ETAPES.map((e,i)=>
    `<button class="estep ${view==="projet"&&i===etapeIdx?"active":""}" data-etape="${i}">${ic(e.icon)}${esc(e.nom)}${filled.has(e.id)?'<span class="dot"></span>':""}</button>`
  ).join("") + `<button class="estep fiche ${view==="fiche"?"active":""}" data-fiche>${ic("file")}Fiche projet</button>`;
}

/* ---------- Vue liste ---------- */
function viewListe(){
  const idCard = ident
    ? `<div class="card ident-card"><span class="ident-ava">${esc(ident.initiales.slice(0,3))}</span>
        <div class="ic-tx"><strong>${esc(ident.initiales)}</strong><small>${esc(ident.role)}</small></div>
        <button class="btn-mini" data-ident>Modifier</button></div>`
    : `<button class="card ident-card" data-ident style="width:100%;cursor:pointer">
        <span class="ident-ava">${ic("user")}</span>
        <div class="ic-tx" style="text-align:left"><strong>Qui êtes-vous ?</strong><small>Initiales + rôle (RGPD : pas de nom)</small></div>
        <span class="btn-mini">Définir</span></button>`;
  const banner = fbError ? `<div class="banner">${ic("alert")}<span><b>Activation Firestore requise.</b> Publiez les règles de la collection <code>coordination_projets</code> dans la console Firebase pour enregistrer et partager les contributions.</span></div>` : "";
  const list = projets.length ? `<div class="proj-list">${projets.map(p=>{
    const mat = Math.round((p._etapes/ETAPES.length)*100);
    return `<button class="proj-card" data-open="${esc(p.id)}">
      <h3>${esc(p.titre)}</h3>${p.contexte?`<p>${esc(p.contexte)}</p>`:""}
      <div class="proj-meta"><span>${ic("users")} ${p._contribs} contribution(s)</span>
        <span class="mbar"><i style="width:${mat}%"></i></span><span>${mat}%</span></div>
    </button>`;}).join("")}</div>`
    : `<div class="empty">Aucun projet pour l'instant. Créez le premier ci-dessous — l'équipe pourra le construire avec vous.</div>`;
  return `${banner}
    <div class="hero"><h1>Atelier projet</h1><p>Construisez un projet d'équipe à plusieurs mains, étape par étape — du constat à l'évaluation. Chacun contribue, la fiche se compose toute seule.</p></div>
    <div class="sec-title">${ic("user")} Votre identité</div>${idCard}
    <div class="sec-title">${ic("folder")} Les projets</div>
    ${list}
    <button class="new-proj" data-new style="margin-top:12px">${ic("plus")} Nouveau projet</button>`;
}

/* ---------- Vue étape ---------- */
function viewEtape(){
  const e = ETAPES[etapeIdx];
  const list = sortC(contribs.filter(c=>c.etape===e.id));
  const exemples = (e.ok||e.non) ? `<div class="exemples">
    ${e.ok?`<div class="ex ok">${ic("check")}<span><b>À préférer —</b> ${esc(e.ok)}</span></div>`:""}
    ${e.non?`<div class="ex non">${ic("x")}<span><b>À éviter —</b> ${esc(e.non)}</span></div>`:""}</div>` : "";

  // Contexte amont : ce sur quoi cette étape s'appuie
  let contexte = "";
  if(etapeIdx===0){
    if(projet.contexte) contexte = `<details class="context" open><summary>${ic("folder")} Le contexte du projet</summary><div class="ctx-body"><p>${esc(projet.contexte)}</p></div></details>`;
  } else {
    const prev = ETAPES[etapeIdx-1];
    const pl = sortC(contribs.filter(c=>c.etape===prev.id));
    const body = pl.length ? `<ul>${pl.map(c=>`<li>${c.epingle?ic("star"):""}${esc(c.texte)} <span class="by">— ${esc(c.role)}</span></li>`).join("")}</ul>`
      : `<p class="vide">Rien encore à l'étape « ${esc(prev.nom)} ».</p>`;
    contexte = `<details class="context" open><summary>${ic(prev.icon)} S'appuie sur : ${esc(prev.nom)}</summary><div class="ctx-body">${body}</div></details>`;
  }

  const cards = list.length ? list.map(c=>{
    return `<article class="contrib ${c.epingle?"top":""}">
      ${avatar(c.initiales)}
      <div class="cb">
        <div class="cmeta">${c.epingle?`<span class="ctop-tag">${ic("star")} retenu</span>`:""}<b style="color:var(--ink);font-weight:600">${esc(c.role||"—")}</b> · ${esc(c.initiales||"")}</div>
        <div class="ctext">${esc(c.texte)}</div>
        <div class="cact">
          <button class="pin ${c.epingle?"on":""}" data-pin="${esc(c.id)}">${ic("star")} ${c.epingle?"Retenu pour la fiche":"Retenir"}</button>
          ${mine.has(c.id)?`<button class="cdel" data-del="${esc(c.id)}">${ic("trash")} retirer</button>`:""}
        </div>
      </div></article>`;
  }).join("") : `<div class="empty">Personne n'a encore contribué à cette étape. Lancez-vous !</div>`;

  return `
    <div class="etape-head">
      <span class="et-ic">${ic(e.icon)}</span>
      <div class="eyebrow">Étape ${etapeIdx+1} / ${ETAPES.length}</div>
      <h2>${esc(e.nom)}</h2>
      <div class="et-q">${esc(e.q)}</div>
      <div class="et-def">${esc(e.def)}</div>
      <div class="et-aide">${ic("info")}<span>${esc(e.aide)}</span></div>
      ${exemples}
    </div>
    ${contexte}
    <div class="contribs">${cards}</div>
    <div class="add-row">
      ${avatar(ident?ident.initiales:"?")}
      <textarea id="newContrib" rows="1" placeholder="${ident?"Ajouter votre "+e.nom.toLowerCase()+"…":"Identifiez-vous pour contribuer…"}"></textarea>
      <button class="send" id="sendContrib" aria-label="Ajouter">${ic("send")}</button>
    </div>
    <div class="pager">
      <button class="pgr" data-etape="${(etapeIdx-1+ETAPES.length)%ETAPES.length}">${ic("back")}<span>${esc(ETAPES[(etapeIdx-1+ETAPES.length)%ETAPES.length].nom)}</span></button>
      <button class="pgr next" data-etape="${(etapeIdx+1)%ETAPES.length}"><span>${esc(ETAPES[(etapeIdx+1)%ETAPES.length].nom)}</span>${ic("chev")}</button>
    </div>`;
}

/* ---------- Vue fiche ---------- */
function viewFiche(){
  const byEt = {};
  contribs.forEach(c=>{ (byEt[c.etape]=byEt[c.etape]||[]).push(c); });
  const sections = ETAPES.map(e=>{
    const items=sortC(byEt[e.id]||[]);
    let body;
    if(!items.length){ body=`<p class="vide">À compléter.</p>`; }
    else {
      const ep=items.filter(c=>c.epingle), au=items.filter(c=>!c.epingle);
      body = ep.map(c=>`<div class="retenu">${esc(c.texte)}</div>`).join("")
        + (au.length?`<ul>${au.map(c=>`<li>${esc(c.texte)} <span class="by">— ${esc(c.role)}</span></li>`).join("")}</ul>`:"");
    }
    return `<section><h2>${esc(e.nom)}</h2>${body}</section>`;
  }).join("");
  return `
    <div class="fiche-actions">
      <button class="btn" data-etape="0">${ic("back")} Revenir aux étapes</button>
      <button class="btn primary" id="print">${ic("printer")} Imprimer / PDF</button>
    </div>
    <div class="doc">
      <h1>${esc(projet.titre)}</h1>
      ${projet.contexte?`<p class="doc-ctx">${esc(projet.contexte)}</p>`:""}
      ${sections}
    </div>`;
}

/* ---------- Overlay ---------- */
function openSheet(html){ $("#overlay").innerHTML=`<div class="sheet">${html}</div>`; $("#overlay").classList.add("show"); }
function closeSheet(){ $("#overlay").classList.remove("show"); $("#overlay").innerHTML=""; }

function openIdent(){
  openSheet(`
    <div class="sheet-head"><h3>Votre identité</h3><button class="x" data-close>${ic("x")}</button></div>
    <p class="muted" style="font-size:13.5px;margin:0 0 14px">RGPD : on n'enregistre que vos <b>initiales</b> et votre <b>rôle</b> — jamais votre nom ni celui d'un élève.</p>
    <div class="field"><label for="iIni">Vos initiales</label><input id="iIni" maxlength="4" placeholder="ex. B.D." value="${esc(ident?ident.initiales:"")}" style="text-transform:uppercase;font-weight:700"></div>
    <div class="field"><label>Votre rôle</label><div class="roles" id="iRoles">${ROLES.map(r=>`<button type="button" class="role-chip ${ident&&ident.role===r?"sel":""}" data-role="${esc(r)}">${esc(r)}</button>`).join("")}</div></div>
    <div class="actions"><button class="btn primary" id="saveIdent">${ic("check")} Enregistrer</button></div>`);
  let role = ident?ident.role:"";
  $("#iRoles").querySelectorAll("[data-role]").forEach(b=>b.onclick=()=>{role=b.dataset.role;$("#iRoles").querySelectorAll(".role-chip").forEach(x=>x.classList.toggle("sel",x===b));});
  $("#saveIdent").onclick=()=>{ const ini=$("#iIni").value.trim().toUpperCase(); if(!ini){toast("Indiquez vos initiales.");return;} if(!role){toast("Choisissez votre rôle.");return;}
    ident={initiales:ini,role}; localStorage.setItem("projets_ident_v1",JSON.stringify(ident)); closeSheet(); render(); toast("Identité enregistrée"); };
}

function openNew(){
  openSheet(`
    <div class="sheet-head"><h3>Nouveau projet</h3><button class="x" data-close>${ic("x")}</button></div>
    <div class="field"><label for="pTit">Titre du projet</label><input id="pTit" placeholder="ex. Permanence Ressource Accroche"></div>
    <div class="field"><label for="pCtx">Contexte (optionnel)</label><textarea id="pCtx" placeholder="Le lycée, le public CAP/Bac pro, le besoin observé…"></textarea></div>
    <div class="actions"><button class="btn primary" id="createP">${ic("plus")} Créer le projet</button></div>`);
  $("#createP").onclick=async()=>{ const titre=$("#pTit").value.trim(); if(!titre){toast("Donnez un titre.");return;}
    const btn=$("#createP"); btn.disabled=true; btn.textContent="Création…";
    try{ const ref=await addDoc(collection(db,COL),{titre,contexte:$("#pCtx").value.trim(),createdAt:serverTimestamp()});
      closeSheet(); await openProjet(ref.id);
    }catch(e){ console.error(e); fbError=true; btn.disabled=false; btn.innerHTML=`${ic("plus")} Créer le projet`; toast("Enregistrement impossible (règles Firestore)."); }
  };
}

/* ---------- Firestore ---------- */
async function loadListe(){
  try{
    const snap=await getDocs(collection(db,COL));
    projets=await Promise.all(snap.docs.map(async d=>{
      let etapes=0,n=0;
      try{ const cs=await getDocs(collection(db,COL,d.id,"contributions"));
        n=cs.size; etapes=new Set(cs.docs.map(x=>x.data().etape)).size;
      }catch(_){}
      return {id:d.id,...d.data(),_contribs:n,_etapes:etapes};
    }));
    projets.sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    fbError=false;
  }catch(e){ console.error(e); fbError=true; projets=[]; }
  if(view==="liste") render();
}

async function openProjet(id){
  if(unsub){unsub();unsub=null;}
  projet = projets.find(p=>p.id===id) || null;
  if(!projet){ try{ const s=await getDocs(collection(db,COL)); const d=s.docs.find(x=>x.id===id); if(d) projet={id,...d.data()}; }catch(_){} }
  if(!projet){ toast("Projet introuvable."); view="liste"; return loadListe(); }
  view="projet"; etapeIdx=0; contribs=[]; render();
  try{
    unsub=onSnapshot(query(collection(db,COL,id,"contributions"),orderBy("createdAt","asc")), snap=>{
      contribs=snap.docs.map(d=>{const x=d.data();return {id:d.id,...x,_t:x.createdAt?.seconds||0};});
      fbError=false; if(view!=="liste") render();
    }, err=>{ console.error(err); fbError=true; render(); });
  }catch(e){ console.error(e); fbError=true; render(); }
}

async function addContribution(texte){
  if(!ident){ openIdent(); return; }
  texte=texte.trim(); if(!texte) return;
  try{
    const ref=await addDoc(collection(db,COL,projet.id,"contributions"),
      {etape:ETAPES[etapeIdx].id,texte,initiales:ident.initiales,role:ident.role,epingle:false,createdAt:serverTimestamp()});
    mine.add(ref.id); saveMine();
  }catch(e){ console.error(e); toast("Envoi impossible (règles Firestore)."); }
}

async function togglePin(cid){
  const c=contribs.find(x=>x.id===cid); if(!c) return;
  try{ await updateDoc(doc(db,COL,projet.id,"contributions",cid),{epingle:!c.epingle}); }
  catch(e){ console.error(e); toast("Action impossible (règles Firestore)."); }
}

async function delContribution(cid){
  try{ await deleteDoc(doc(db,COL,projet.id,"contributions",cid)); mine.delete(cid); saveMine(); }
  catch(e){ console.error(e); toast("Suppression impossible."); }
}

/* ---------- Navigation ---------- */
document.addEventListener("click", e=>{
  const ident_=e.target.closest("[data-ident]"); if(ident_) return openIdent();
  const nw=e.target.closest("[data-new]"); if(nw){ if(!ident){ toast("Identifiez-vous d'abord."); return openIdent(); } return openNew(); }
  const op=e.target.closest("[data-open]"); if(op) return openProjet(op.dataset.open);
  const et=e.target.closest("[data-etape]"); if(et){ etapeIdx=+et.dataset.etape; view="projet"; return render(); }
  const fi=e.target.closest("[data-fiche]"); if(fi){ view="fiche"; return render(); }
  const pn=e.target.closest("[data-pin]"); if(pn) return togglePin(pn.dataset.pin);
  const dl=e.target.closest("[data-del]"); if(dl) return delContribution(dl.dataset.del);
  if(e.target.closest("#ficheBtn")){ view="fiche"; return render(); }
  if(e.target.closest("#print")) return window.print();
  if(e.target.closest("[data-close]")||e.target.id==="overlay") return closeSheet();
  if(e.target.closest("#identBtn")) return openIdent();
  if(e.target.closest("#sendContrib")){ const t=$("#newContrib"); const v=t.value; t.value=""; return addContribution(v); }
  if(e.target.closest("#back")){
    if(view==="liste"){ location.href="../"; return; }
    if(view==="fiche"){ view="projet"; return render(); }
    if(unsub){unsub();unsub=null;} view="liste"; projet=null; contribs=[]; render(); loadListe(); return;
  }
});
document.addEventListener("keydown", e=>{ if(e.key==="Escape") closeSheet();
  if(e.key==="Enter"&&!e.shiftKey&&e.target.id==="newContrib"){ e.preventDefault(); const v=e.target.value; e.target.value=""; addContribution(v); } });

/* ---------- Démarrage ---------- */
loadListe().then(()=>{ const p=params.get("p"); if(p) openProjet(p); });
render();
