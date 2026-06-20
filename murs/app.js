/* ============================================================================
   Mur d'idées — brainstorming d'équipe (devoirs-pse / coordination_murs).
   Temps réel, RGPD (initiales + rôle). Plusieurs murs, votes, pilote, bilan.
============================================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, doc, addDoc, getDocs, getDoc, onSnapshot, updateDoc, deleteDoc,
  serverTimestamp, query, orderBy, arrayUnion, arrayRemove }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = { apiKey:"AIzaSyAWdCMvOiAJln3eT9LIAQD3RWJUD0lQcLI", authDomain:"devoirs-pse.firebaseapp.com", projectId:"devoirs-pse", storageBucket:"devoirs-pse.firebasestorage.app", messagingSenderId:"614730413904", appId:"1:614730413904:web:a5dd478af5de30f6bede55" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const COL = "coordination_murs";

const ICONS = {
  back:`<path d="m14 6-6 6 6 6"/>`, chev:`<path d="m9 6 6 6-6 6"/>`,
  plus:`<path d="M12 5v14M5 12h14"/>`,
  send:`<path d="M4 12 20 4l-6 16-2.5-6.5z"/><path d="M11.5 13.5 20 4"/>`,
  user:`<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>`,
  users:`<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 5.2a3.2 3.2 0 0 1 0 6.1"/><path d="M16.5 14.4a5.5 5.5 0 0 1 4 4.6"/>`,
  trash:`<path d="M5 7h14M9 7V5h6v2M6 7l1 13h10l1-13"/>`,
  pencil:`<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>`,
  x:`<path d="m6 6 12 12M18 6 6 18"/>`,
  check:`<path d="M5 12.5 10 17.5 19.5 7"/>`,
  heart:`<path d="M12 20s-7-4.4-7-9.3A3.7 3.7 0 0 1 12 7a3.7 3.7 0 0 1 7 3.7C19 15.6 12 20 12 20z"/>`,
  bulb:`<path d="M9.5 17.5h5"/><path d="M10 21h4"/><path d="M8 14a5 5 0 1 1 8 0c-.8.9-1.2 1.6-1.3 2.5h-5.4c-.1-.9-.5-1.6-1.3-2.5z"/>`,
  grid:`<rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.2"/>`,
  folder:`<path d="M3.5 7.5a2 2 0 0 1 2-2H9l2 2h7.5a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>`,
  file:`<path d="M13.5 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7.5z"/><path d="M13.5 3v4.5H18"/>`,
  printer:`<path d="M7 9V4h10v5"/><rect x="5" y="9" width="14" height="7" rx="1.5"/><path d="M7 14h10v6H7z"/>`,
  word:`<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9l1.5 6 1.5-4 1.5 4L15 9"/>`,
  compass:`<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.2 5.3-5.3 2.2 2.2-5.3z"/>`,
  info:`<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r=".8" fill="currentColor" stroke="none"/>`,
  shield:`<path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"/>`,
  lock:`<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>`,
  unlock:`<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 7.8-1.4"/>`,
  alert:`<path d="M12 4 2.5 20h19z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.4" r=".6" fill="currentColor" stroke="none"/>`,
  wand:`<path d="M5 19 15 9"/><path d="m16 3 1 2.2 2.2 1-2.2 1L16 10.4 15 8.2 12.8 7.2 15 6.2z"/>`,
  sort:`<path d="M7 4v16M7 20l-3-3M7 20l3-3M14 7h6M14 12h4M14 17h2"/>`,
};
const ic = n => ICONS[n] ? `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>` : "";

const ROLES = ["Prof", "Prof PSE", "Prof principal", "Enseignant pro", "CPE", "DDFPT", "Infirmier·ère", "PsyEN", "AESH / Coordo ULIS", "Direction", "Documentaliste", "Autre"];
const PALETTE = ["#534ab7","#0f6e56","#993c1d","#185fa5","#9a5f0a","#993556","#3c6e3c","#5a6b8c"];
const colorFor = s => PALETTE[[...String(s||"?")].reduce((a,c)=>a+c.charCodeAt(0),0) % PALETTE.length];
const MODELES = ["", "Idées de projets pour l'année", "Améliorer la vie de classe", "Lutter contre le décrochage", "Café des parents / lien familles", "Bien-être & climat scolaire"];

const esc = s => String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const $ = s => document.querySelector(s);
const avatar = (ini,cls="",color="")=>`<span class="ava ${cls}" style="background:${color||colorFor(ini)};color:#fff">${esc((ini||"?").slice(0,3))}</span>`;
const dateFr = () => { try{ return new Date().toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}); }catch(_){ return ""; } };

const DEV = (()=>{ let d=localStorage.getItem("projets_dev"); if(!d){ d=(self.crypto&&crypto.randomUUID)?crypto.randomUUID():"d"+Date.now()+Math.random().toString(36).slice(2); localStorage.setItem("projets_dev",d);} return d; })();
let ident = JSON.parse(localStorage.getItem("projets_ident_v1") || "null");

const params = new URLSearchParams(location.search);
const RO = params.get("ro")==="1";
let murs=[], mur=null, idees=[], view="liste", fbError=false, unsub=null, unsubI=null;
let mine = new Set(JSON.parse(localStorage.getItem("murs_mine_v1")||"[]"));
const saveMine = ()=>localStorage.setItem("murs_mine_v1",JSON.stringify([...mine]));

let toastT;
function toast(m,ok){ const t=$("#toast"); t.textContent=m; t.className="toast show"+(ok?" ok":""); clearTimeout(toastT); toastT=setTimeout(()=>t.className="toast",2200); }
const saved = ()=>toast("Enregistré",true);

/* ---------- Tri & helpers ---------- */
const voteCount = i => Array.isArray(i.votes)?i.votes.length:0;
const iVoted = i => Array.isArray(i.votes)&&i.votes.includes(DEV);
const sortIdees = arr => arr.slice().sort((a,b)=> voteCount(b)-voteCount(a) || (a._t)-(b._t));
const POSTITS=[{bg:"#CECBF6",tx:"#26215C",av:"#534AB7"},{bg:"#9FE1CB",tx:"#04342C",av:"#0F6E56"},{bg:"#FAC775",tx:"#412402",av:"#854F0B"},{bg:"#F5C4B3",tx:"#4A1B0C",av:"#993C1D"},{bg:"#B5D4F4",tx:"#042C53",av:"#185FA5"},{bg:"#F4C0D1",tx:"#4B1528",av:"#993556"},{bg:"#C0DD97",tx:"#173404",av:"#3B6D11"},{bg:"#F7C1C1",tx:"#501313",av:"#A32D2D"}];
const hashStr = s => { let h=0; for(const c of String(s||"")) h=(h*31+c.charCodeAt(0))>>>0; return h; };
let wallMode = localStorage.getItem("murs_wallmode")||"postit";
let anonMode = false;
const seen = new Set();

/* ---------- Rendu ---------- */
function render(){
  const drafts={}; document.querySelectorAll("[data-keep]").forEach(el=>drafts[el.id]=el.value);
  const focusId = document.activeElement && document.activeElement.dataset && document.activeElement.dataset.keep!==undefined ? document.activeElement.id : null;
  const inMur = mur && view!=="liste";
  $("#backLabel").textContent = view==="liste" ? "Portail" : (view==="bilan"?"Le mur":"Les murs");
  $("#title").textContent = inMur ? mur.titre : "Mur d'idées";
  $("#subtitle").textContent = inMur ? (view==="bilan"?"Bilan":(mur.theme||"Réfléchir à plusieurs")) : "Réfléchir à plusieurs";
  const ib=$("#identBtn"); if(ident && !RO){ ib.hidden=false; ib.innerHTML=`${ic("user")} ${esc(ident.initiales)}`; } else ib.hidden=true;
  const bb=$("#bilanBtn"); bb.hidden = !(inMur && view!=="bilan"); bb.innerHTML=`${ic("file")} Bilan`;
  const map = { liste:viewListe, mur:viewMur, bilan:viewBilan };
  $("#view").innerHTML = (map[view]||viewListe)();
  document.querySelectorAll("[data-keep]").forEach(el=>{ if(drafts[el.id]!==undefined) el.value=drafts[el.id]; });
  if(focusId){ const el=document.getElementById(focusId); if(el){ el.focus(); try{el.selectionStart=el.selectionEnd=el.value.length;}catch(_){} } }
  if(view!=="mur") window.scrollTo&&window.scrollTo(0,0);
}

/* ---------- Liste des murs ---------- */
function viewListe(){
  const idCard = RO ? "" : (ident
    ? `<div class="card ident-card"><span class="ident-ava" style="background:${ident.color||colorFor(ident.initiales)};color:#fff">${esc(ident.initiales.slice(0,3))}</span><div class="ic-tx"><strong>${esc(ident.initiales)}</strong><small>${esc(ident.role)}</small></div><button class="btn-mini" data-ident>Modifier</button></div>`
    : `<button class="card ident-card" data-ident style="width:100%;cursor:pointer"><span class="ident-ava">${ic("user")}</span><div class="ic-tx" style="text-align:left"><strong>Qui êtes-vous ?</strong><small>Initiales + rôle (RGPD : pas de nom)</small></div><span class="btn-mini">Définir</span></button>`);
  const banner = fbError ? `<div class="banner">${ic("alert")}<span><b>Activation Firestore requise.</b> Publiez les règles de <code>coordination_murs</code>.</span></div>` : "";
  const list = murs.length ? `<div class="proj-list">${murs.map(m=>{const st=STATUTS[m.statut]||STATUTS.ouvert;
    return `<button class="proj-card" data-open="${esc(m.id)}" style="--rc:${st.c}"><div class="pc-ring nodash" style="--p:100"><span>${ic("bulb")}</span></div><div class="pc-body"><div class="pc-top"><h3>${esc(m.titre)}</h3><span class="st-tag" style="--sc:${st.c}">${st.l}</span></div><p class="pc-sum">${m.theme?esc(m.theme):`<span class="muted">Brainstorming d'équipe.</span>`}</p><div class="proj-meta">${m.pilote?`<span class="pc-m">${ic("compass")} ${esc(m.pilote.ini)}</span>`:""}<span class="pc-m">${ic("bulb")} ${m._idees||0} idée${(m._idees||0)>1?"s":""}</span></div></div><span class="pc-go">${ic("chev")}</span></button>`;}).join("")}</div>`
    : `<div class="empty">Aucun mur pour l'instant.${RO?"":" Créez le premier ci-dessous."}</div>`;
  return `${banner}<div class="hero"><h1>Mur d'idées</h1><p>Faites émerger les idées de l'équipe, en temps réel — chacun écrit, on vote, les meilleures remontent.</p></div>${idCard?`<div class="sec-title">${ic("user")} Votre identité</div>${idCard}`:""}<div class="sec-title">${ic("grid")} Les murs</div>${list}${RO?"":`<button class="new-proj" data-new style="margin-top:12px">${ic("plus")} Nouveau mur</button>`}`;
}

const STATUTS = { ouvert:{l:"Ouvert",c:"#0f8a76"}, clos:{l:"Clos",c:"#8b94a3"} };

/* ---------- Un mur ---------- */
function viewMur(){
  const clos = mur.statut==="clos";
  const list = sortIdees(idees);
  const top = list.length ? voteCount(list[0]) : 0;
  const conts=[...new Set(idees.map(i=>i.initiales).filter(Boolean))];
  const pil = mur.pilote;
  const piloteRow = `<div class="ovh-pilote">${pil?`<span class="opx-lab">${ic("compass")} Pilote</span><span class="opx">${avatar(pil.ini,"sm",pil.color)}<b>${esc(pil.ini)}</b> · ${esc(pil.role)}</span>${RO?"":`<button class="lnk-mini" data-pilote>${ident&&pil.ini===ident.initiales?"Me retirer":"Reprendre"}</button>`}`:`<span class="opx-lab">${ic("compass")} Pilote</span><span class="opx-none">à définir</span>${RO?"":`<button class="btn-mini" data-pilote-take>${ic("user")} Se proposer</button>`}`}</div>`;
  const card = i => { const vc=voteCount(i); const pc=POSTITS[hashStr(i.id)%POSTITS.length]; const rot=(hashStr(i.id+"r")%7)-3; const sz=(14+Math.min(vc,9)*1.3).toFixed(1); const w=158+Math.min(vc,9)*9; const isNew=!seen.has(i.id); seen.add(i.id);
    const who = (i.anon||!i.initiales) ? `<span class="po-anon">${ic("user")} Anonyme</span>` : `<span class="po-who">${avatar(i.initiales,"po-av",i.color||pc.av)}<span class="po-by">${esc(i.role||"")}</span></span>`;
    return `<article class="po ${isNew?"po-new":""} ${vc&&vc===top?"po-top":""}" style="--bg:${pc.bg};--tx:${pc.tx};width:${w}px;font-size:${sz}px;transform:rotate(${rot}deg)">
      <p class="po-tx">${esc(i.texte)}</p>
      <div class="po-ft">${who}<button class="po-vote ${iVoted(i)?"on":""}" ${RO?"disabled":`data-vote="${esc(i.id)}"`}>${ic("heart")} ${vc||""}</button>${(!RO&&mine.has(i.id))?`<span class="po-acts"><button class="po-mini" data-edit="${esc(i.id)}" aria-label="Modifier">${ic("pencil")}</button><button class="po-mini" data-del="${esc(i.id)}" aria-label="Supprimer">${ic("trash")}</button></span>`:""}</div>
    </article>`; };
  const cloud = `<div class="cloud">${list.map(i=>{const vc=voteCount(i);const pc=POSTITS[hashStr(i.id)%POSTITS.length];const sz=(16+Math.min(vc,12)*2.2).toFixed(0);return `<span class="cw ${iVoted(i)?"on":""}" style="color:${pc.av};font-size:${sz}px" ${RO?"":`data-vote="${esc(i.id)}"`} title="${vc} vote(s)">${esc(i.texte)}</span>`;}).join("")}</div>`;
  const wall = !list.length ? `<div class="empty">Aucune idée pour l'instant.${clos||RO?"":" Lancez-vous !"}</div>` : (wallMode==="nuage"?cloud:`<div class="wall">${list.map(card).join("")}</div>`);
  const compose = (RO||clos)?(clos?`<div class="locked-note">${ic("lock")} Mur clos — les idées sont figées.</div>`:"") :
    `<div class="compose mur-compose"><textarea data-keep id="newIdea" rows="2" placeholder="Votre idée, en quelques mots…"></textarea><div class="compose-foot"><label class="anon-chk"><input type="checkbox" id="anonChk" ${anonMode?"checked":""}> <span>Publier en anonyme</span></label><button class="compose-send" id="sendIdea">${ic("plus")} Ajouter au mur</button></div></div>`;
  const lockBtn = RO?"":`<button class="lock-btn ${clos?"on":""}" data-clos>${ic(clos?"lock":"unlock")} ${clos?"Mur clos":"Clore le mur"}</button>`;
  const toggle = `<div class="wall-toggle"><button class="wt ${wallMode==="postit"?"on":""}" data-wallmode="postit">${ic("grid")} Post-it</button><button class="wt ${wallMode==="nuage"?"on":""}" data-wallmode="nuage">${ic("wand")} Nuage de mots</button></div>`;
  return `<div class="mur-head">
      <div class="eh-hero">
        <div class="eh-badge" style="background:#0f8a76">${ic("bulb")}</div>
        <div class="eh-tx"><div class="eyebrow">Mur d'idées${mur.theme?` · ${esc(mur.theme)}`:""}</div><h2>${esc(mur.titre)}</h2><p class="eh-q">${list.length} idée${list.length>1?"s":""} · ${conts.length} participant${conts.length>1?"s":""}</p></div>
        ${lockBtn}
      </div>
      ${piloteRow}
    </div>
    ${compose}
    <div class="wall-bar">${list.length?toggle:`<span></span>`}<button class="btn-mini" data-bilan>${ic("file")} Bilan</button></div>
    ${wall}
    <div class="ov-foot">${RO?"":`<button class="lnk" id="shareMur">${ic("send")} Partager (lecture)</button><button class="lnk danger" id="delMur">${ic("trash")} Supprimer ce mur</button>`}</div>`;
}

/* ---------- Bilan ---------- */
function viewBilan(){
  const list = sortIdees(idees);
  const conts=[...new Set(idees.map(i=>i.initiales).filter(Boolean))];
  const rows = list.map((i,n)=>`<tr><td class="bn">${n+1}</td><td>${esc(i.texte)}</td><td class="bv">${ic("heart")} ${voteCount(i)}</td><td class="bby">${esc(i.role||"")}</td></tr>`).join("");
  const body = list.length ? `<table class="bilan-tbl"><thead><tr><th>#</th><th>Idée</th><th>Votes</th><th>Proposé par</th></tr></thead><tbody>${rows}</tbody></table>` : `<p class="vide">Aucune idée pour l'instant.</p>`;
  return `<div class="fiche-actions"><button class="btn" data-mur>${ic("back")} Le mur</button><button class="btn" id="wordMur">${ic("word")} Word</button><button class="btn primary" id="printMur">${ic("printer")} Imprimer / PDF</button></div>
    <div class="doc"><div class="doc-cover"><div class="dc-brand">Mur d'idées — bilan</div><h1 class="dc-title">${esc(mur.titre)}</h1>${mur.theme?`<p class="dc-ctx">${esc(mur.theme)}</p>`:""}<div class="dc-meta">${mur.pilote?`Piloté par ${esc(mur.pilote.ini)} · `:""}${list.length} idée(s) · ${conts.length} participant(s) · ${dateFr()}</div></div>
    <section><h2>Idées classées par votes</h2>${body}</section></div>`;
}

/* ---------- Firestore ---------- */
async function loadListe(){
  try{
    const snap = await getDocs(query(collection(db,COL), orderBy("createdAt","desc")));
    murs = await Promise.all(snap.docs.map(async d=>{ const data={id:d.id,...d.data()}; try{ const isn=await getDocs(collection(db,COL,d.id,"idees")); data._idees=isn.size; }catch(_){ data._idees=0; } return data; }));
    fbError=false;
  }catch(e){ console.error(e); fbError=true; murs=[]; }
  if(view==="liste") render();
}
async function openMur(id){
  if(unsub){unsub();} if(unsubI){unsubI();} seen.clear();
  try{
    const ref=doc(db,COL,id); const ds=await getDoc(ref);
    if(!ds.exists()){ toast("Mur introuvable."); view="liste"; render(); return; }
    mur={id,...ds.data()}; view="mur"; render();
    unsub=onSnapshot(ref,s=>{ if(!s.exists()){return;} mur={id,...s.data()}; if(view!=="liste") render(); });
    unsubI=onSnapshot(collection(db,COL,id,"idees"),s=>{ idees=s.docs.map(d=>{const x={id:d.id,...d.data()}; x._t=x.createdAt&&x.createdAt.seconds?x.createdAt.seconds:0; return x;}); if(view!=="liste") render(); });
  }catch(e){ console.error(e); fbError=true; toast("Ouverture impossible."); }
}
async function addIdea(txt){ txt=txt.trim(); if(!txt||!mur) return; if(mur.statut==="clos"){toast("Mur clos.");return;}
  if(!anonMode && !ident){ openIdent(); return; }
  const base = anonMode ? {initiales:"",role:"",color:"",anon:true} : {initiales:ident.initiales,role:ident.role,color:ident.color||""};
  try{ const ref=await addDoc(collection(db,COL,mur.id,"idees"),{texte:txt,...base,votes:[],createdAt:serverTimestamp()}); mine.add(ref.id); saveMine(); saved(); }catch(e){console.error(e);toast("Envoi impossible.");}}
async function voteIdea(id){ const i=idees.find(x=>x.id===id); if(!i) return;
  try{ await updateDoc(doc(db,COL,mur.id,"idees",id),{votes:iVoted(i)?arrayRemove(DEV):arrayUnion(DEV)}); }catch(e){console.error(e);toast("Action impossible.");}}
async function delIdea(id){ if(!confirm("Supprimer cette idée ?")) return; try{ await deleteDoc(doc(db,COL,mur.id,"idees",id)); mine.delete(id); saveMine(); saved(); }catch(e){console.error(e);toast("Suppression impossible.");}}
function openEditIdea(id){ const i=idees.find(x=>x.id===id); if(!i) return;
  openSheet(`<div class="sheet-head"><h3>Modifier l'idée</h3><button class="x" data-close>${ic("x")}</button></div><div class="field"><textarea id="eIdea" rows="3">${esc(i.texte)}</textarea></div><div class="actions"><button class="btn primary" id="eSave">${ic("check")} Enregistrer</button></div>`);
  $("#eSave").onclick=async()=>{const v=$("#eIdea").value.trim();if(!v)return;try{await updateDoc(doc(db,COL,mur.id,"idees",id),{texte:v,editedAt:Date.now()});closeSheet();saved();}catch(e){console.error(e);toast("Action impossible.");}};
}
async function setMur(obj){ try{ await updateDoc(doc(db,COL,mur.id),obj); saved(); }catch(e){console.error(e);toast("Action impossible.");} }
async function delMur(){ if(!mur) return; if(!confirm(`Supprimer définitivement le mur « ${mur.titre} » et toutes ses idées ?\n\nIrréversible.`)) return;
  const id=mur.id;
  try{ const isn=await getDocs(collection(db,COL,id,"idees")); for(const d of isn.docs){ await deleteDoc(doc(db,COL,id,"idees",d.id)); } await deleteDoc(doc(db,COL,id));
    if(unsub){unsub();unsub=null;} if(unsubI){unsubI();unsubI=null;} view="liste"; mur=null; idees=[]; render(); loadListe(); toast("Mur supprimé",true);
  }catch(e){ console.error(e); toast("Suppression impossible."); }
}

/* ---------- Feuilles ---------- */
function openSheet(html){ $("#overlay").innerHTML=`<div class="sheet">${html}</div>`; $("#overlay").classList.add("show"); }
function closeSheet(){ $("#overlay").classList.remove("show"); $("#overlay").innerHTML=""; }

function openIdent(){
  let role=ident?ident.role:""; let color=ident&&ident.color||"";
  const drawPrev=()=>{ const av=$("#identPrev"); if(!av) return; const ini=($("#iIni").value.trim().toUpperCase())||"?"; av.style.background=color||colorFor(ini); av.textContent=ini.slice(0,3); };
  openSheet(`<div class="sheet-head"><h3>Votre identité</h3><button class="x" data-close>${ic("x")}</button></div><p class="muted" style="font-size:13.5px;margin:0 0 14px">RGPD : seulement vos <b>initiales</b> et votre <b>rôle</b> — jamais de nom.</p>
    <div class="ident-prev"><span class="ava lg" id="identPrev"></span><span class="muted" style="font-size:12.5px">La pastille qui apparaîtra sur vos idées.</span></div>
    <div class="field"><label for="iIni">Vos initiales</label><input id="iIni" maxlength="4" placeholder="ex. B.D." value="${esc(ident?ident.initiales:"")}" style="text-transform:uppercase;font-weight:700"></div>
    <div class="field"><label>Couleur de votre pastille</label><div class="color-row" id="iColors">${PALETTE.map(c=>`<button type="button" class="color-sw ${color===c?"on":""}" data-color="${c}" style="background:${c}" aria-label="Couleur"></button>`).join("")}<button type="button" class="color-sw auto ${color?"":"on"}" data-color="" aria-label="Automatique">A</button></div></div>
    <div class="field"><label>Votre rôle</label><div class="roles" id="iRoles">${ROLES.map(r=>`<button type="button" class="role-chip ${ident&&ident.role===r?"sel":""}" data-role="${esc(r)}">${esc(r)}</button>`).join("")}</div></div>
    <div class="actions"><button class="btn primary" id="saveIdent">${ic("check")} Enregistrer</button></div>`);
  $("#iRoles").querySelectorAll("[data-role]").forEach(b=>b.onclick=()=>{role=b.dataset.role;$("#iRoles").querySelectorAll(".role-chip").forEach(x=>x.classList.toggle("sel",x===b));});
  $("#iColors").querySelectorAll("[data-color]").forEach(b=>b.onclick=()=>{color=b.dataset.color;$("#iColors").querySelectorAll(".color-sw").forEach(x=>x.classList.toggle("on",x===b));drawPrev();});
  $("#iIni").oninput=drawPrev; drawPrev();
  $("#saveIdent").onclick=()=>{const ini=$("#iIni").value.trim().toUpperCase();if(!ini){toast("Indiquez vos initiales.");return;}if(!role){toast("Choisissez votre rôle.");return;}ident={initiales:ini,role,color};localStorage.setItem("projets_ident_v1",JSON.stringify(ident));closeSheet();render();toast("Identité enregistrée",true);};
}

function openNew(){
  openSheet(`<div class="sheet-head"><h3>Nouveau mur d'idées</h3><button class="x" data-close>${ic("x")}</button></div>
    <div class="field"><label for="mTit">Titre du mur</label><input id="mTit" placeholder="ex. Idées de projets pour l'année"></div>
    <div class="field"><label for="mTheme">Thème / question (optionnel)</label><input id="mTheme" placeholder="ex. Comment renforcer le lien avec les familles ?"></div>
    <div class="field"><label>Inspiration</label><div class="roles" id="mMods">${MODELES.slice(1).map(t=>`<button type="button" class="role-chip" data-mod="${esc(t)}">${esc(t)}</button>`).join("")}</div></div>
    <label class="rchk"><input type="checkbox" id="mPilote" ${ident?"checked":""} ${ident?"":"disabled"}> <span>Je pilote ce mur ${ident?`<span class="muted">(vous : ${esc(ident.initiales)} · ${esc(ident.role)})</span>`:`<span class="muted">— identifiez-vous d'abord</span>`}</span></label>
    <div class="actions"><button class="btn primary" id="createM">${ic("plus")} Créer le mur</button></div>`);
  $("#mMods").querySelectorAll("[data-mod]").forEach(b=>b.onclick=()=>{$("#mTit").value=b.dataset.mod;});
  $("#createM").onclick=async()=>{const titre=$("#mTit").value.trim();if(!titre){toast("Donnez un titre.");return;}const pilote=($("#mPilote")&&$("#mPilote").checked&&ident)?{ini:ident.initiales,role:ident.role,color:ident.color||""}:null;const btn=$("#createM");btn.disabled=true;btn.textContent="Création…";try{const ref=await addDoc(collection(db,COL),{titre,theme:$("#mTheme").value.trim(),statut:"ouvert",pilote,createdAt:serverTimestamp()});closeSheet();await openMur(ref.id);}catch(e){console.error(e);fbError=true;btn.disabled=false;btn.innerHTML=`${ic("plus")} Créer le mur`;toast("Enregistrement impossible.");}};
}

function exportWord(){
  const list=sortIdees(idees);
  const rows=list.map((i,n)=>`<tr><td>${n+1}</td><td>${esc(i.texte)}</td><td>${voteCount(i)}</td><td>${esc(i.role||"")}</td></tr>`).join("");
  const html=`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><style>body{font-family:Calibri,Arial,sans-serif;color:#1f2733;margin:2cm}h1{font-size:18pt}table{border-collapse:collapse;width:100%;font-size:11pt;margin-top:8pt}th,td{border:1px solid #ccc;padding:5pt 7pt;text-align:left}</style></head><body><h1>${esc(mur.titre)}</h1>${mur.theme?`<p>${esc(mur.theme)}</p>`:""}<p style="color:#666">${mur.pilote?`Piloté par ${esc(mur.pilote.ini)} · `:""}${list.length} idée(s) · ${dateFr()}</p><table><tr><th>#</th><th>Idée</th><th>Votes</th><th>Proposé par</th></tr>${rows}</table></body></html>`;
  const blob=new Blob([html],{type:"application/msword"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="mur-"+String(mur.titre||"idees").replace(/[^a-z0-9]+/gi,"-").toLowerCase().slice(0,40)+".doc"; a.click(); URL.revokeObjectURL(a.href); toast("Word téléchargé",true);
}

/* ---------- Clics ---------- */
document.addEventListener("click", e=>{
  if(e.target.closest("[data-close]")||e.target.id==="overlay") return closeSheet();
  if(e.target.closest("[data-ident]")) return openIdent();
  const nw=e.target.closest("[data-new]"); if(nw){ if(!ident){toast("Identifiez-vous d'abord.");return openIdent();} return openNew(); }
  const op=e.target.closest("[data-open]"); if(op) return openMur(op.dataset.open);
  if(e.target.closest("[data-bilan]")||e.target.closest("#bilanBtn")){ view="bilan"; return render(); }
  if(e.target.closest("[data-mur]")){ view="mur"; return render(); }
  const wm=e.target.closest("[data-wallmode]"); if(wm){ wallMode=wm.dataset.wallmode; localStorage.setItem("murs_wallmode",wallMode); return render(); }
  const v=e.target.closest("[data-vote]"); if(v) return voteIdea(v.dataset.vote);
  const ed=e.target.closest("[data-edit]"); if(ed) return openEditIdea(ed.dataset.edit);
  const dl=e.target.closest("[data-del]"); if(dl) return delIdea(dl.dataset.del);
  if(e.target.closest("[data-clos]")) return setMur({statut:mur.statut==="clos"?"ouvert":"clos"});
  if(e.target.closest("[data-pilote-take]")){ if(!ident) return openIdent(); return setMur({pilote:{ini:ident.initiales,role:ident.role,color:ident.color||""}}); }
  if(e.target.closest("[data-pilote]")){ if(!ident) return openIdent(); const p=mur.pilote; if(p&&p.ini===ident.initiales) return setMur({pilote:null}); if(confirm("Devenir le pilote de ce mur ?")) return setMur({pilote:{ini:ident.initiales,role:ident.role,color:ident.color||""}}); return; }
  if(e.target.closest("#sendIdea")){ const t=$("#newIdea"); const val=t?t.value:""; if(t)t.value=""; return addIdea(val); }
  if(e.target.closest("#delMur")) return delMur();
  if(e.target.closest("#wordMur")) return exportWord();
  if(e.target.closest("#printMur")) return window.print();
  if(e.target.closest("#shareMur")){ const base=location.origin+location.pathname; const url=base+"?m="+mur.id+"&ro=1"; navigator.clipboard?.writeText(url).then(()=>toast("Lien lecture copié",true)).catch(()=>toast(url)); return; }
  if(e.target.closest("#back")){ if(view==="liste"){location.href="../";return;} if(view==="bilan"){view="mur";return render();} if(unsub){unsub();unsub=null;}if(unsubI){unsubI();unsubI=null;} view="liste"; mur=null; idees=[]; render(); loadListe(); return; }
});
document.addEventListener("change", e=>{ if(e.target.id==="anonChk") anonMode=e.target.checked; });
document.addEventListener("keydown", e=>{ if(e.key==="Escape")closeSheet(); if(e.key==="Enter"&&!e.shiftKey&&e.target.id==="newIdea"){e.preventDefault();const v=e.target.value;e.target.value="";addIdea(v);} });
document.addEventListener("input", e=>{ if(e.target.id==="newIdea"){const t=e.target;t.style.height="auto";t.style.height=Math.min(t.scrollHeight,200)+"px";} });

loadListe().then(()=>{ const m=params.get("m"); if(m) openMur(m); });
