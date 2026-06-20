/* ============================================================================
   Carte mentale collaborative (devoirs-pse / coordination_cartes).
   Idée centrale → branches → sous-branches, canevas pan/zoom, temps réel,
   RGPD (initiales + rôle). Couleur par branche, point auteur.
============================================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, doc, addDoc, getDocs, getDoc, onSnapshot, updateDoc, deleteDoc,
  serverTimestamp, query, orderBy }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = { apiKey:"AIzaSyAWdCMvOiAJln3eT9LIAQD3RWJUD0lQcLI", authDomain:"devoirs-pse.firebaseapp.com", projectId:"devoirs-pse", storageBucket:"devoirs-pse.firebasestorage.app", messagingSenderId:"614730413904", appId:"1:614730413904:web:a5dd478af5de30f6bede55" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const COL = "coordination_cartes";

const ICONS = {
  back:`<path d="m14 6-6 6 6 6"/>`, chev:`<path d="m9 6 6 6-6 6"/>`,
  plus:`<path d="M12 5v14M5 12h14"/>`, minus:`<path d="M5 12h14"/>`,
  send:`<path d="M4 12 20 4l-6 16-2.5-6.5z"/><path d="M11.5 13.5 20 4"/>`,
  user:`<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>`,
  users:`<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 5.2a3.2 3.2 0 0 1 0 6.1"/><path d="M16.5 14.4a5.5 5.5 0 0 1 4 4.6"/>`,
  trash:`<path d="M5 7h14M9 7V5h6v2M6 7l1 13h10l1-13"/>`,
  pencil:`<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>`,
  x:`<path d="m6 6 12 12M18 6 6 18"/>`, check:`<path d="M5 12.5 10 17.5 19.5 7"/>`,
  grid:`<rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.2"/>`,
  folder:`<path d="M3.5 7.5a2 2 0 0 1 2-2H9l2 2h7.5a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>`,
  brain:`<path d="M12 5a3 3 0 0 0-5.5 1.6A2.8 2.8 0 0 0 5 12a2.8 2.8 0 0 0 1.8 4.8A2.8 2.8 0 0 0 12 19m0-14a3 3 0 0 1 5.5 1.6A2.8 2.8 0 0 1 19 12a2.8 2.8 0 0 1-1.8 4.8A2.8 2.8 0 0 1 12 19m0-14v14"/>`,
  compass:`<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.2 5.3-5.3 2.2 2.2-5.3z"/>`,
  shield:`<path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"/>`,
  info:`<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r=".8" fill="currentColor" stroke="none"/>`,
  alert:`<path d="M12 4 2.5 20h19z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.4" r=".6" fill="currentColor" stroke="none"/>`,
  target:`<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>`,
  download:`<path d="M12 4v11M8 11l4 4 4-4"/><path d="M5 19h14"/>`,
  center:`<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>`,
  qr:`<rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1"/><rect x="14" y="3.5" width="6.5" height="6.5" rx="1"/><rect x="3.5" y="14" width="6.5" height="6.5" rx="1"/><path d="M14 14h3M14 14v3M17.5 17.5v.01M20.5 14v3M14 20.5h3.5M20.5 20.5v.01"/>`,
};
const ic = n => ICONS[n] ? `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>` : "";

const ROLES = ["Prof", "Prof PSE", "Prof principal", "Enseignant pro", "CPE", "DDFPT", "Infirmier·ère", "PsyEN", "AESH / Coordo ULIS", "Direction", "Documentaliste", "Autre"];
const PALETTE = ["#534ab7","#0f6e56","#993c1d","#185fa5","#9a5f0a","#993556","#3c6e3c","#5a6b8c"];
const BR_COLORS = ["#1D9E75","#D85A30","#378ADD","#7F77DD","#BA7517","#993556","#3B6D11","#185FA5"];
const colorFor = s => PALETTE[[...String(s||"?")].reduce((a,c)=>a+c.charCodeAt(0),0) % PALETTE.length];

const esc = s => String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const $ = s => document.querySelector(s);
const avatar = (ini,cls="",color="")=>`<span class="ava ${cls}" style="background:${color||colorFor(ini)};color:#fff">${esc((ini||"?").slice(0,3))}</span>`;
const dateFr = () => { try{ return new Date().toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}); }catch(_){ return ""; } };

const DEV = (()=>{ let d=localStorage.getItem("projets_dev"); if(!d){ d=(self.crypto&&crypto.randomUUID)?crypto.randomUUID():"d"+Date.now()+Math.random().toString(36).slice(2); localStorage.setItem("projets_dev",d);} return d; })();
let ident = JSON.parse(localStorage.getItem("projets_ident_v1") || "null");

const params = new URLSearchParams(location.search);
const RO = params.get("ro")==="1";
let cartes=[], carte=null, noeuds=[], view="liste", fbError=false, unsub=null, unsubN=null;
let mine = new Set(JSON.parse(localStorage.getItem("cartes_mine_v1")||"[]"));
const saveMine = ()=>localStorage.setItem("cartes_mine_v1",JSON.stringify([...mine]));
let cam = {x:0,y:0,z:1};

let toastT;
function toast(m,ok){ const t=$("#toast"); t.textContent=m; t.className="toast show"+(ok?" ok":""); clearTimeout(toastT); toastT=setTimeout(()=>t.className="toast",2200); }
const saved = ()=>toast("Enregistré",true);
const isAdmin = ()=> !!(ident && carte && carte.pilote && carte.pilote.ini===ident.initiales);
const canEdit = n => !RO && (mine.has(n.id) || isAdmin());

/* ---------- Rendu ---------- */
function render(){
  const inCarte = carte && view!=="liste";
  $("#backLabel").textContent = view==="liste" ? "Portail" : "Les cartes";
  $("#title").textContent = inCarte ? carte.titre : "Carte mentale";
  $("#subtitle").textContent = inCarte ? (carte.theme||"Réfléchir à plusieurs") : "Réfléchir à plusieurs";
  const ib=$("#identBtn"); if(ident && !RO){ ib.hidden=false; ib.innerHTML=`${ic("user")} ${esc(ident.initiales)}`; } else ib.hidden=true;
  const map = { liste:viewListe, carte:viewCarte };
  $("#view").innerHTML = (map[view]||viewListe)();
  if(view==="carte") setupCanvas();
  if(view!=="carte") window.scrollTo&&window.scrollTo(0,0);
}

/* ---------- Liste des cartes ---------- */
function viewListe(){
  const idCard = RO ? "" : (ident
    ? `<div class="card ident-card"><span class="ident-ava" style="background:${ident.color||colorFor(ident.initiales)};color:#fff">${esc(ident.initiales.slice(0,3))}</span><div class="ic-tx"><strong>${esc(ident.initiales)}</strong><small>${esc(ident.role)}</small></div><button class="btn-mini" data-ident>Modifier</button></div>`
    : `<button class="card ident-card" data-ident style="width:100%;cursor:pointer"><span class="ident-ava">${ic("user")}</span><div class="ic-tx" style="text-align:left"><strong>Qui êtes-vous ?</strong><small>Initiales + rôle (RGPD : pas de nom)</small></div><span class="btn-mini">Définir</span></button>`);
  const banner = fbError ? `<div class="banner">${ic("alert")}<span><b>Activation Firestore requise.</b> Publiez les règles de <code>coordination_cartes</code>.</span></div>` : "";
  const list = cartes.length ? `<div class="proj-list">${cartes.map(m=>`<button class="proj-card" data-open="${esc(m.id)}" style="--rc:#7F77DD"><div class="pc-ring nodash"><span>${ic("brain")}</span></div><div class="pc-body"><div class="pc-top"><h3>${esc(m.titre)}</h3></div><p class="pc-sum">${m.theme?esc(m.theme):`<span class="muted">Carte mentale d'équipe.</span>`}</p><div class="proj-meta">${m.pilote?`<span class="pc-m">${ic("compass")} ${esc(m.pilote.ini)}</span>`:""}<span class="pc-m">${ic("brain")} ${m._noeuds||0} nœud${(m._noeuds||0)>1?"s":""}</span></div></div><span class="pc-go">${ic("chev")}</span></button>`).join("")}</div>`
    : `<div class="empty">Aucune carte pour l'instant.${RO?"":" Créez la première ci-dessous."}</div>`;
  return `${banner}<div class="hero"><h1>Carte mentale</h1><p>Construisez une carte mentale à plusieurs : une idée centrale, des branches, des sous-branches — en temps réel, chacun sa couleur.</p></div>${idCard?`<div class="sec-title">${ic("user")} Votre identité</div>${idCard}`:""}<div class="sec-title">${ic("grid")} Les cartes</div>${list}${RO?"":`<button class="new-proj" data-new style="margin-top:12px">${ic("plus")} Nouvelle carte</button>`}`;
}

/* ---------- Disposition automatique ---------- */
const CX=500, CY=345, CW=170, DX=190, ROW=58;
function kidsOf(pid){ return noeuds.filter(n=>(n.parent||null)===(pid||null)).sort((a,b)=>(a._t||0)-(b._t||0)); }
function layout(){
  noeuds.forEach(n=>{ n._w=Math.min(214,Math.max(98,(n.texte||"").length*7.8+52)); });
  const branches=kidsOf(null);
  const right=[], left=[]; branches.forEach((b,i)=>{ (i%2===0?right:left).push(b); });
  function measure(n){ const ks=kidsOf(n.id); if(!ks.length){ n._h=ROW; return ROW; } let h=0; ks.forEach(k=>h+=measure(k)); n._h=Math.max(ROW,h); return n._h; }
  function placeSide(arr,dir){ let total=0; arr.forEach(b=>total+=measure(b)); let y=CY-total/2; function place(n,depth,top){ n._side=dir; n._depth=depth; n._x=CX+dir*(DX*depth); n._y=top+n._h/2; let cy=top; kidsOf(n.id).forEach(k=>{ place(k,depth+1,cy); cy+=k._h; }); } arr.forEach(b=>{ place(b,1,y); y+=b._h; }); }
  placeSide(right,1); placeSide(left,-1);
}
function branchColorOf(n){ let cur=n; while(cur && cur.parent){ const p=noeuds.find(x=>x.id===cur.parent); if(!p) break; cur=p; } const branches=kidsOf(null); const idx=branches.findIndex(x=>x.id===(cur?cur.id:"")); return BR_COLORS[(idx<0?0:idx)%BR_COLORS.length]; }

/* ---------- Vue carte (canevas) ---------- */
function viewCarte(){
  layout();
  const conts=[...new Set(noeuds.map(n=>n.ini).filter(Boolean))];
  const pil=carte.pilote;
  const piloteRow=`<div class="ovh-pilote">${pil?`<span class="opx-lab">${ic("compass")} Pilote</span><span class="opx">${avatar(pil.ini,"sm",pil.color)}<b>${esc(pil.ini)}</b> · ${esc(pil.role)}</span>${RO?"":`<button class="lnk-mini" data-pilote>${ident&&pil.ini===ident.initiales?"Me retirer":"Reprendre"}</button>`}`:`<span class="opx-lab">${ic("compass")} Pilote</span><span class="opx-none">à définir</span>${RO?"":`<button class="btn-mini" data-pilote-take>${ic("user")} Se proposer</button>`}`}</div>`;
  // connecteurs + nœuds
  let conns="", nodes="";
  noeuds.forEach(n=>{ const c=branchColorOf(n); const dir=n._side; const par=n.parent?noeuds.find(x=>x.id===n.parent):null;
    const px = par ? par._x + dir*(par._w/2) : CX + dir*(CW/2);
    const py = par ? par._y : CY;
    const nx = n._x - dir*(n._w/2); const ny = n._y;
    const k = Math.abs(nx-px)*0.45;
    conns += `<path d="M${px} ${py} C${px+dir*k} ${py} ${nx-dir*k} ${ny} ${nx} ${ny}" fill="none" stroke="${c}" stroke-width="${n._depth===1?2.6:2}" opacity="${n._depth===1?1:.75}"/>`;
    const cls = n._depth===1 ? "mn-branch" : "mn-sub";
    nodes += `<foreignObject x="${n._x-n._w/2}" y="${n._y-19}" width="${n._w}" height="40" data-node="${esc(n.id)}" class="mn-fo">
      <div xmlns="http://www.w3.org/1999/xhtml" class="mnode ${cls}" style="--c:${c}"><span class="mnode-tx">${esc(n.texte)}</span><span class="mnode-au" style="background:${n.color||colorFor(n.ini)}" title="${esc(n.role||'')}">${esc((n.ini||'?').slice(0,2))}</span></div>
    </foreignObject>`;
  });
  const empty = noeuds.length ? "" : `<text x="${CX}" y="${CY+90}" text-anchor="middle" class="mn-hint">${RO?"Carte vide.":"Touchez l'idée centrale pour ajouter une branche."}</text>`;
  const svg = `<svg id="cv" viewBox="0 0 1000 690" preserveAspectRatio="xMidYMid meet">
    <g id="cam" transform="translate(${cam.x},${cam.y}) scale(${cam.z})">
      ${conns}
      <g data-node="__root__" class="mn-fo"><rect x="${CX-CW/2}" y="${CY-32}" width="${CW}" height="64" rx="18" class="mn-center"/><foreignObject x="${CX-CW/2}" y="${CY-32}" width="${CW}" height="64"><div xmlns="http://www.w3.org/1999/xhtml" class="mn-center-tx">${esc(carte.titre)}</div></foreignObject></g>
      ${nodes}
      ${empty}
    </g>
  </svg>`;
  const tools = `<div class="cv-tools"><button class="cv-tbtn" data-zoom="0.85" aria-label="Dézoomer">${ic("minus")}</button><button class="cv-tbtn" data-zoom="1.18" aria-label="Zoomer">${ic("plus")}</button><button class="cv-tbtn" data-recenter aria-label="Recentrer">${ic("center")}</button></div>`;
  const addBranch = RO?"":`<button class="cv-add" data-add="__root__">${ic("plus")} Ajouter une branche</button>`;
  return `<div class="carte-head">
      <div class="eh-hero" style="--pc:#7F77DD"><div class="eh-badge" style="background:#7F77DD">${ic("brain")}</div><div class="eh-tx"><div class="eyebrow">${carte.theme?esc(carte.theme):"Carte mentale"}</div><h2>${esc(carte.titre)}</h2><p class="eh-q">${noeuds.length} nœud${noeuds.length>1?"s":""} · ${conts.length} participant${conts.length>1?"s":""}</p></div></div>
      ${piloteRow}
    </div>
    <div class="canvas-wrap">${svg}${tools}</div>
    <div class="cv-bar">${addBranch}<span class="cv-hint">${RO?"Lecture seule":"Touchez un nœud pour y répondre, le modifier ou le supprimer · glissez pour déplacer"}</span></div>
    <div class="ov-foot">${RO?"":`<button class="lnk" id="dlImg">${ic("download")} Télécharger l'image</button><button class="lnk" id="shareCarte">${ic("send")} Partager (lecture)</button><button class="lnk danger" id="delCarte">${ic("trash")} Supprimer cette carte</button>`}</div>`;
}

/* ---------- Pan / zoom ---------- */
function applyCam(){ const g=document.getElementById("cam"); if(g) g.setAttribute("transform",`translate(${cam.x},${cam.y}) scale(${cam.z})`); }
function setupCanvas(){
  const svg=document.getElementById("cv"); if(!svg) return;
  let dragging=false, moved=false, sx=0, sy=0, ox=0, oy=0, downNode=null;
  const pt = e => { const r=svg.getBoundingClientRect(); const sc=1000/r.width; return { x:(e.clientX-r.left)*sc, y:(e.clientY-r.top)*sc }; };
  svg.addEventListener("pointerdown", e=>{ const fo=e.target.closest("[data-node]"); downNode=fo?fo.getAttribute("data-node"):null; dragging=true; moved=false; const p=pt(e); sx=p.x; sy=p.y; ox=cam.x; oy=cam.y; svg.setPointerCapture(e.pointerId); });
  svg.addEventListener("pointermove", e=>{ if(!dragging) return; const p=pt(e); const dx=p.x-sx, dy=p.y-sy; if(Math.abs(dx)>6||Math.abs(dy)>6) moved=true; cam.x=ox+dx; cam.y=oy+dy; applyCam(); });
  svg.addEventListener("pointerup", e=>{ dragging=false; try{svg.releasePointerCapture(e.pointerId);}catch(_){}; if(!moved && downNode){ openNode(downNode); } downNode=null; });
  svg.addEventListener("wheel", e=>{ e.preventDefault(); const f=e.deltaY<0?1.12:0.9; cam.z=Math.min(2.4,Math.max(0.4,cam.z*f)); applyCam(); }, {passive:false});
}

/* ---------- Actions sur les nœuds ---------- */
function openNode(id){
  if(id==="__root__"){ if(!RO) openAdd("__root__","branche"); return; }
  const n=noeuds.find(x=>x.id===id); if(!n) return;
  const ce=canEdit(n);
  openSheet(`<div class="sheet-head"><h3>Nœud</h3><button class="x" data-close>${ic("x")}</button></div>
    <div class="node-prev" style="--c:${branchColorOf(n)}"><span class="np-tx">${esc(n.texte)}</span><span class="np-by">${n.ini?avatar(n.ini,"sm",n.color)+" "+esc(n.role||""):"—"}</span></div>
    <div class="node-acts">${RO?"":`<button class="btn primary" data-addsub="${esc(n.id)}">${ic("plus")} Sous-idée</button>`}${ce?`<button class="btn" data-edit="${esc(n.id)}">${ic("pencil")} Modifier</button><button class="btn danger-btn" data-del="${esc(n.id)}">${ic("trash")} Supprimer</button>`:`<span class="muted" style="font-size:12.5px">Vous pouvez répondre par une sous-idée. Seul l'auteur ou le pilote modifie ce nœud.</span>`}</div>`);
}
function openAdd(parentId,kind){
  if(!ident){ openIdent(); return; }
  openSheet(`<div class="sheet-head"><h3>${kind==="branche"?"Nouvelle branche":"Nouvelle sous-idée"}</h3><button class="x" data-close>${ic("x")}</button></div><div class="field"><textarea id="ndTxt" rows="2" placeholder="Votre idée, en quelques mots…" autofocus></textarea></div><div class="actions"><button class="btn primary" id="ndSave">${ic("plus")} Ajouter</button></div>`);
  $("#ndSave").onclick=()=>{ const v=$("#ndTxt").value.trim(); if(!v) return; addNode(parentId==="__root__"?null:parentId, v); closeSheet(); };
}
function openEditNode(id){ const n=noeuds.find(x=>x.id===id); if(!n) return;
  openSheet(`<div class="sheet-head"><h3>Modifier le nœud</h3><button class="x" data-close>${ic("x")}</button></div><div class="field"><textarea id="ndTxt" rows="2">${esc(n.texte)}</textarea></div><div class="actions"><button class="btn primary" id="ndSave">${ic("check")} Enregistrer</button></div>`);
  $("#ndSave").onclick=async()=>{ const v=$("#ndTxt").value.trim(); if(!v) return; try{ await updateDoc(doc(db,COL,carte.id,"noeuds",id),{texte:v,editedAt:Date.now()}); closeSheet(); saved(); }catch(e){console.error(e);toast("Action impossible.");} };
}
async function addNode(parentId,texte){ if(!ident){openIdent();return;} if(!carte) return;
  try{ const ref=await addDoc(collection(db,COL,carte.id,"noeuds"),{texte,parent:parentId||null,ini:ident.initiales,role:ident.role,color:ident.color||"",createdAt:serverTimestamp()}); mine.add(ref.id); saveMine(); saved(); }catch(e){console.error(e);toast("Envoi impossible.");}}
async function delNode(id){ const n=noeuds.find(x=>x.id===id); if(!n) return;
  const toDel=[]; (function collect(pid){ toDel.push(pid); kidsOf(pid).forEach(k=>collect(k.id)); })(id);
  if(!confirm(toDel.length>1?`Supprimer ce nœud et ses ${toDel.length-1} sous-nœud(s) ?`:"Supprimer ce nœud ?")) return;
  try{ for(const nid of toDel){ await deleteDoc(doc(db,COL,carte.id,"noeuds",nid)); mine.delete(nid);} saveMine(); saved(); }catch(e){console.error(e);toast("Suppression impossible.");}}
async function setCarte(obj){ try{ await updateDoc(doc(db,COL,carte.id),obj); saved(); }catch(e){console.error(e);toast("Action impossible.");} }
async function delCarte(){ if(!carte) return; if(!confirm(`Supprimer définitivement la carte « ${carte.titre} » et tous ses nœuds ?\n\nIrréversible.`)) return;
  const id=carte.id;
  try{ const ns=await getDocs(collection(db,COL,id,"noeuds")); for(const d of ns.docs){ await deleteDoc(doc(db,COL,id,"noeuds",d.id)); } await deleteDoc(doc(db,COL,id));
    if(unsub){unsub();unsub=null;} if(unsubN){unsubN();unsubN=null;} view="liste"; carte=null; noeuds=[]; render(); loadListe(); toast("Carte supprimée",true);
  }catch(e){ console.error(e); toast("Suppression impossible."); }
}
function downloadImage(){
  const svg=document.getElementById("cv"); if(!svg) return;
  const clone=svg.cloneNode(true); const g=clone.querySelector("#cam"); if(g) g.setAttribute("transform","translate(0,0) scale(1)");
  clone.setAttribute("xmlns","http://www.w3.org/2000/svg"); clone.setAttribute("width","1000"); clone.setAttribute("height","690");
  const css=`<style>.mnode{box-sizing:border-box;height:40px;display:flex;align-items:center;gap:6px;padding:0 12px;border-radius:14px;font:500 13px Inter,sans-serif;background:#fff;border:1.5px solid var(--c);color:#1f2733}.mn-branch{background:color-mix(in srgb,var(--c) 13%,#fff)}.mnode-tx{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mnode-au{width:18px;height:18px;border-radius:50%;color:#fff;font:600 8px Inter;display:flex;align-items:center;justify-content:center;flex:none}.mn-center{fill:#26365a}.mn-center-tx{box-sizing:border-box;height:64px;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 14px;color:#fff;font:600 15px Inter,sans-serif}</style>`;
  const data=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 690" width="1000" height="690"><rect width="1000" height="690" fill="#f3f5f9"/>${css}${clone.innerHTML}</svg>`;
  const blob=new Blob([data],{type:"image/svg+xml"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="carte-"+String(carte.titre||"mentale").replace(/[^a-z0-9]+/gi,"-").toLowerCase().slice(0,40)+".svg"; a.click(); URL.revokeObjectURL(a.href); toast("Image téléchargée",true);
}

/* ---------- Firestore ---------- */
async function loadListe(){
  try{ const snap=await getDocs(query(collection(db,COL), orderBy("createdAt","desc")));
    cartes=await Promise.all(snap.docs.map(async d=>{ const data={id:d.id,...d.data()}; try{ const ns=await getDocs(collection(db,COL,d.id,"noeuds")); data._noeuds=ns.size; }catch(_){ data._noeuds=0; } return data; }));
    fbError=false;
  }catch(e){ console.error(e); fbError=true; cartes=[]; }
  if(view==="liste") render();
}
async function openCarte(id){
  if(unsub){unsub();} if(unsubN){unsubN();} cam={x:0,y:0,z:1};
  try{ const ref=doc(db,COL,id); const ds=await getDoc(ref); if(!ds.exists()){ toast("Carte introuvable."); view="liste"; render(); return; }
    carte={id,...ds.data()}; view="carte"; render();
    unsub=onSnapshot(ref,s=>{ if(!s.exists())return; carte={id,...s.data()}; if(view!=="liste") render(); });
    unsubN=onSnapshot(collection(db,COL,id,"noeuds"),s=>{ noeuds=s.docs.map(d=>{const x={id:d.id,...d.data()}; x._t=x.createdAt&&x.createdAt.seconds?x.createdAt.seconds:Date.now()/1000; return x;}); if(view!=="liste") render(); });
  }catch(e){ console.error(e); fbError=true; toast("Ouverture impossible."); }
}

/* ---------- Feuilles ---------- */
function openSheet(html){ $("#overlay").innerHTML=`<div class="sheet">${html}</div>`; $("#overlay").classList.add("show"); }
function closeSheet(){ $("#overlay").classList.remove("show"); $("#overlay").innerHTML=""; }

function openIdent(){
  let role=ident?ident.role:""; let color=ident&&ident.color||"";
  const drawPrev=()=>{ const av=$("#identPrev"); if(!av) return; const i=($("#iIni").value.trim().toUpperCase())||"?"; av.style.background=color||colorFor(i); av.textContent=i.slice(0,3); };
  openSheet(`<div class="sheet-head"><h3>Votre identité</h3><button class="x" data-close>${ic("x")}</button></div><p class="muted" style="font-size:13.5px;margin:0 0 14px">RGPD : seulement vos <b>initiales</b> et votre <b>rôle</b> — jamais de nom.</p>
    <div class="ident-prev"><span class="ava lg" id="identPrev"></span><span class="muted" style="font-size:12.5px">Votre pastille (couleur = vous sur la carte).</span></div>
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
  openSheet(`<div class="sheet-head"><h3>Nouvelle carte mentale</h3><button class="x" data-close>${ic("x")}</button></div>
    <div class="field"><label for="cTit">Idée centrale (titre)</label><input id="cTit" placeholder="ex. Semaine du bien-être"></div>
    <div class="field"><label for="cTheme">Thème / question (optionnel)</label><input id="cTheme" placeholder="ex. Comment mobiliser toute l'équipe ?"></div>
    <label class="rchk"><input type="checkbox" id="cPilote" ${ident?"checked":""} ${ident?"":"disabled"}> <span>Je pilote cette carte ${ident?`<span class="muted">(vous : ${esc(ident.initiales)})</span>`:`<span class="muted">— identifiez-vous d'abord</span>`}</span></label>
    <div class="actions"><button class="btn primary" id="createC">${ic("plus")} Créer la carte</button></div>`);
  $("#createC").onclick=async()=>{const titre=$("#cTit").value.trim();if(!titre){toast("Donnez une idée centrale.");return;}const pilote=($("#cPilote")&&$("#cPilote").checked&&ident)?{ini:ident.initiales,role:ident.role,color:ident.color||""}:null;const btn=$("#createC");btn.disabled=true;btn.textContent="Création…";try{const ref=await addDoc(collection(db,COL),{titre,theme:$("#cTheme").value.trim(),pilote,createdAt:serverTimestamp()});closeSheet();await openCarte(ref.id);}catch(e){console.error(e);fbError=true;btn.disabled=false;btn.innerHTML=`${ic("plus")} Créer la carte`;toast("Enregistrement impossible.");}};
}

/* ---------- Clics ---------- */
document.addEventListener("click", e=>{
  if(e.target.closest("[data-close]")||e.target.id==="overlay") return closeSheet();
  if(e.target.closest("[data-ident]")) return openIdent();
  const nw=e.target.closest("[data-new]"); if(nw){ if(!ident){toast("Identifiez-vous d'abord.");return openIdent();} return openNew(); }
  const op=e.target.closest("[data-open]"); if(op) return openCarte(op.dataset.open);
  const z=e.target.closest("[data-zoom]"); if(z){ cam.z=Math.min(2.4,Math.max(0.4,cam.z*parseFloat(z.dataset.zoom))); return applyCam(); }
  if(e.target.closest("[data-recenter]")){ cam={x:0,y:0,z:1}; return applyCam(); }
  const ad=e.target.closest("[data-add]"); if(ad) return openAdd(ad.dataset.add,"branche");
  const as=e.target.closest("[data-addsub]"); if(as){ closeSheet(); return openAdd(as.dataset.addsub,"sous"); }
  const ed=e.target.closest("[data-edit]"); if(ed){ closeSheet(); return openEditNode(ed.dataset.edit); }
  const dl=e.target.closest("[data-del]"); if(dl){ closeSheet(); return delNode(dl.dataset.del); }
  if(e.target.closest("[data-pilote-take]")){ if(!ident) return openIdent(); return setCarte({pilote:{ini:ident.initiales,role:ident.role,color:ident.color||""}}); }
  if(e.target.closest("[data-pilote]")){ if(!ident) return openIdent(); const p=carte.pilote; if(p&&p.ini===ident.initiales) return setCarte({pilote:null}); if(confirm("Devenir le pilote de cette carte ?")) return setCarte({pilote:{ini:ident.initiales,role:ident.role,color:ident.color||""}}); return; }
  if(e.target.closest("#dlImg")) return downloadImage();
  if(e.target.closest("#delCarte")) return delCarte();
  if(e.target.closest("#shareCarte")){ const base=location.origin+location.pathname; const url=base+"?c="+carte.id+"&ro=1"; navigator.clipboard?.writeText(url).then(()=>toast("Lien lecture copié",true)).catch(()=>toast(url)); return; }
  if(e.target.closest("#back")){ if(view==="liste"){location.href="../";return;} if(unsub){unsub();unsub=null;}if(unsubN){unsubN();unsubN=null;} view="liste"; carte=null; noeuds=[]; render(); loadListe(); return; }
});
document.addEventListener("keydown", e=>{ if(e.key==="Escape")closeSheet(); });

loadListe().then(()=>{ const c=params.get("c"); if(c) openCarte(c); });
