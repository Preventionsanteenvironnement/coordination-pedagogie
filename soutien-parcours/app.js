/* ===== Persistance + helpers communs =====
   Colle ta config Firebase ci-dessous. Tant que apiKey commence par "COLLE",
   l'appli tourne en mode local (localStorage) — pratique pour tester.
   Firestore : 1 document  sap_gatl/2026-P1  { slots:{}, custom:{} }
   Règle :  match /sap_gatl/{doc} { allow read, write: if true; }
*/
const firebaseConfig = {
  apiKey: "AIzaSyAWdCMvOiAJln3eT9LIAQD3RWJUD0lQcLI",
  authDomain: "devoirs-pse.firebaseapp.com",
  projectId: "devoirs-pse",
  storageBucket: "devoirs-pse.appspot.com",
  messagingSenderId: "614730413904",
  appId: "1:614730413904:web:a5dd478af5de30f6bede55"
};
const DOC = ["sap_gatl","2026-P1-v3"];
const LS = "sap_gatl_2026P1_v3";

const state = { slots:{}, custom:{} };   // custom = activités créées par vous
let writer = null;
const listeners = [];
const onChange = fn => listeners.push(fn);
const emit = () => listeners.forEach(f=>f());

function setSync(cls,txt){ const s=document.getElementById("sync"); if(!s) return; s.className="sync "+cls; s.querySelector("span").textContent=txt; }
function toast(m){ let t=document.getElementById("toast"); if(!t){t=document.createElement("div");t.id="toast";t.className="toast";document.body.appendChild(t);} t.textContent=m; t.classList.add("on"); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove("on"),1800); }

/** save("slots.2026-09-16", obj) — met à jour l'état local puis persiste */
async function save(path, value){
  const k=path.split("."); let o=state; for(let i=0;i<k.length-1;i++){ o[k[i]]=o[k[i]]||{}; o=o[k[i]]; }
  if(value===null) delete o[k.at(-1)]; else o[k.at(-1)]=value;
  emit();
  try{ await writer(path,value); }catch(e){ console.error(e); setSync("err","Erreur d'enregistrement"); toast("Pas enregistré — vérifie la connexion"); }
}

async function init(seed){
  if(firebaseConfig.apiKey.startsWith("COLLE")){
    try{ Object.assign(state, JSON.parse(localStorage.getItem(LS))||{}); }catch(e){}
    if(seed && !Object.keys(state.slots).length){ state.slots=JSON.parse(JSON.stringify(seed)); }
    writer = async()=>localStorage.setItem(LS, JSON.stringify(state));
    await writer();
    setSync("local","Mode local — non partagé");
    const n=document.getElementById("note"); if(n){ n.innerHTML='Pour partager avec ta collègue : colle la config Firebase dans <code>app.js</code>.'; }
    emit(); return;
  }
  const {initializeApp}=await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
  const {getFirestore,doc,onSnapshot,setDoc,updateDoc,deleteField}=await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
  const db=getFirestore(initializeApp(firebaseConfig)); const ref=doc(db,...DOC);
  writer=async(path,value)=>{ await updateDoc(ref,{[path]: value===null?deleteField():value, updatedAt:Date.now()}); setSync("ok","Partagé en temps réel"); };
  let first=true;
  onSnapshot(ref, async snap=>{
    if(!snap.exists()){ if(first){ await setDoc(ref,{slots:seed||{},custom:{},updatedAt:Date.now()}); } return; }
    const d=snap.data(); state.slots=d.slots||{}; state.custom=d.custom||{}; first=false;
    setSync("ok","Partagé en temps réel"); emit();
  }, err=>{ console.error(err); setSync("err","Firestore inaccessible — règles ?"); });
}

/* ---- helpers dates ---- */
const fmtLong = d => new Date(d+"T12:00:00").toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
const fmtMonth = d => { const m=new Date(d+"T12:00:00").toLocaleDateString("fr-FR",{month:"long",year:"numeric"}); return m[0].toUpperCase()+m.slice(1); };
const dayOf = d => d.slice(8).replace(/^0/,"");
const today = () => new Date().toISOString().slice(0,10);
const esc = s => String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ---- nav ---- */
function nav(active){
  const pages=[["index.html","Calendrier"],["bibliotheque.html","Bibliothèque"],["reperes.html","Repères"]];
  return `<nav class="nav">${pages.map(([h,t])=>`<a href="${h}" class="${h===active?"on":""}">${t}</a>`).join("")}</nav>`;
}

Object.assign(window,{firebaseConfig,state,onChange,setSync,toast,save,init,fmtLong,fmtMonth,dayOf,today,esc,nav});
