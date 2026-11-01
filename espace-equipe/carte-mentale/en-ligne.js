/* en-ligne.js — la carte mentale de l'Atelier PSE, partagée en direct par Firebase.
 * [EN LIGNE 01/11/2026] Demande de Brahim : travailler à deux en même temps sur la même carte (lui dans l'Atelier,
 * son collègue en ligne), enregistrement automatique.
 * • Pose window.StorageService avant de charger l'éditeur (cartes-mentales.js, copie de celui de l'Atelier).
 * • Firestore : coordination_cartes/{id} = { carte (JSON texte), titre, version, maj, par }.
 *   La carte est rangée en texte : pas de limite de profondeur, une seule écriture par enregistrement.
 * • Deux personnes écrivent en même temps : fusion à trois voies sujet par sujet (fusionnerCarte),
 *   dans une transaction : personne n'efface le travail de l'autre.
 * • RGPD : initiales seulement, jamais de nom d'élève.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, onSnapshot, runTransaction, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const M = window.PSE_CARTES_MENTALES;
const PARAMS = new URLSearchParams(location.search);
const ELEVES = PARAMS.get('role') === 'projection';
const CARTE_ID = (PARAMS.get('carte') || 'cdo-cap-psr-2026-2027').replace(/[^\w-]/g, '').slice(0, 80);
const COL = 'coordination_cartes';
const CLE_IDENT = 'coordination-carte-ident';

function chargerEditeur() {
  const s = document.createElement('script');
  s.src = 'cartes-mentales.js';
  document.body.appendChild(s);
}

if (ELEVES) {
  // Écran des élèves : il ne lit rien, il dessine ce que la fenêtre du professeur lui envoie.
  chargerEditeur();
} else {
  demarrer();
}

/* ---------- Fusion à trois voies ---------- */
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const trois = (b, l, r) => (eq(l, b) ? r : l);   // un champ : ce qui a changé ici l'emporte, sinon ce qui vient d'ailleurs

/* Une feuille → { id : { p: parent, d: données sans enfants, k: ids des enfants } }. Les sujets libres ont pour parent « #libres ». */
function aplatir(f) {
  const out = {};
  function aller(n, p) {
    const d = Object.assign({}, n); delete d.enfants;
    out[n.id] = { p, d, k: (n.enfants || []).map(e => e.id) };
    (n.enfants || []).forEach(e => aller(e, n.id));
  }
  if (f.racine) aller(f.racine, '#racine');
  out['#libres'] = { p: null, d: null, k: (f.libres || []).map(x => x.id) };
  (f.libres || []).forEach(x => aller(x, '#libres'));
  return out;
}

/* Ordre des enfants : celui du côté qui l'a changé ; s'il a changé des deux côtés, celui d'ailleurs, et les ajouts d'ici à leur place. */
function ordreFusionne(kb, kl, kr) {
  kb = kb || []; kl = kl || []; kr = kr || [];
  if (eq(kl, kb)) return kr.slice();
  if (eq(kr, kb)) return kl.slice();
  const out = kr.slice();
  kl.forEach((id, i) => {
    if (out.includes(id)) return;
    const avant = i > 0 ? out.indexOf(kl[i - 1]) : -1;
    out.splice(avant + 1, 0, id);
  });
  return out;
}

function fusionnerFeuille(fb, fl, fr) {
  const out = {};
  new Set([...Object.keys(fl), ...Object.keys(fr)]).forEach(k => {
    if (k === 'racine' || k === 'libres' || k === 'liaisons') return;
    out[k] = fb ? trois(fb[k], fl[k], fr[k]) : (k in fl ? fl[k] : fr[k]);
    if (out[k] === undefined) delete out[k];
  });
  const B = fb ? aplatir(fb) : {}, L = aplatir(fl), R = aplatir(fr);
  const garde = {};   // id → { p, d }
  new Set([...Object.keys(L), ...Object.keys(R)]).forEach(id => {
    if (id === '#libres') return;
    const b = B[id], l = L[id], r = R[id];
    if (b && (!l || !r)) return;   // supprimé d'un côté : supprimé
    if (!b) { const x = l || r; garde[id] = { p: x.p, d: x.d }; return; }
    garde[id] = { p: trois(b.p, l.p, r.p), d: trois(b.d, l.d, r.d) };
  });
  const racineId = (fl.racine || fr.racine).id;
  if (!garde[racineId]) garde[racineId] = { p: '#racine', d: (L[racineId] || R[racineId]).d };
  garde[racineId].p = '#racine';
  // Parent disparu : on remonte vers le plus proche ancêtre encore là (rien d'ajouté ne se perd).
  function ancetreVivant(id) {
    let p = garde[id].p, garde2 = 0;
    while (p && p !== '#racine' && p !== '#libres' && !garde[p] && garde2++ < 200) p = (B[p] || L[p] || R[p] || {}).p;
    return p && (p === '#libres' || garde[p]) ? p : racineId;
  }
  Object.keys(garde).forEach(id => { if (id !== racineId) garde[id].p = ancetreVivant(id); });
  // Déplacements croisés qui feraient une boucle : le sujet reprend le parent d'ailleurs.
  Object.keys(garde).forEach(id => {
    const vus = new Set([id]); let p = garde[id].p, n = 0;
    while (p && garde[p] && n++ < 500) {
      if (vus.has(p)) { garde[id].p = (R[id] && garde[R[id].p]) ? R[id].p : racineId; break; }
      vus.add(p); p = garde[p].p;
    }
  });
  const enfantsDe = {};
  Object.keys(garde).forEach(id => { if (id !== racineId) (enfantsDe[garde[id].p] = enfantsDe[garde[id].p] || []).push(id); });
  function ordonne(pid) {
    const vrais = enfantsDe[pid] || [];
    const ordre = ordreFusionne(B[pid] && B[pid].k, L[pid] && L[pid].k, R[pid] && R[pid].k).filter(id => vrais.includes(id));
    vrais.forEach(id => { if (!ordre.includes(id)) ordre.push(id); });
    return ordre;
  }
  function batir(id) { const n = Object.assign({}, garde[id].d); n.id = id; n.enfants = ordonne(id).map(batir); return n; }
  out.racine = batir(racineId);
  out.libres = ordonne('#libres').map(batir);
  // Liaisons : par identifiant, comme les sujets ; on retire celles dont un bout a disparu.
  const lb = {}, ll = {}, lr = {};
  ((fb && fb.liaisons) || []).forEach(x => { lb[x.id] = x; });
  (fl.liaisons || []).forEach(x => { ll[x.id] = x; });
  (fr.liaisons || []).forEach(x => { lr[x.id] = x; });
  out.liaisons = [];
  new Set([...Object.keys(ll), ...Object.keys(lr)]).forEach(id => {
    const b = lb[id], l = ll[id], r = lr[id];
    if (b && (!l || !r)) return;
    const x = b ? trois(b, l, r) : (l || r);
    if (garde[x.de] && garde[x.vers]) out.liaisons.push(x);
  });
  return out;
}

function fusionnerCarte(b, l, r) {
  const out = {};
  new Set([...Object.keys(l), ...Object.keys(r)]).forEach(k => {
    if (k === 'feuilles') return;
    out[k] = trois(b[k], l[k], r[k]);
    if (out[k] === undefined) delete out[k];
  });
  const fb = {}, fl = {}, fr = {};
  (b.feuilles || []).forEach(f => { fb[f.id] = f; });
  l.feuilles.forEach(f => { fl[f.id] = f; });
  r.feuilles.forEach(f => { fr[f.id] = f; });
  const ordre = ordreFusionne((b.feuilles || []).map(f => f.id), l.feuilles.map(f => f.id), r.feuilles.map(f => f.id));
  out.feuilles = [];
  ordre.forEach(id => {
    const fB = fb[id], fL = fl[id], fR = fr[id];
    if (fB && (!fL || !fR)) return;
    out.feuilles.push(fL && fR ? fusionnerFeuille(fB, fL, fR) : (fL || fR));
  });
  if (!out.feuilles.length) out.feuilles = (r.feuilles.length ? r : l).feuilles;
  // Les encadrés et résumés suivent les enfants présents (même réparation qu'à la lecture dans l'Atelier).
  return M.normaliser({ version: 1, cartes: [out], dossiers: [], corbeille: [] }).cartes[0];
}
window.__fusionnerCarte = fusionnerCarte;   // pour les essais

/* ---------- Identité (initiales seulement) ---------- */
function lireIdent() { try { return JSON.parse(localStorage.getItem(CLE_IDENT) || 'null'); } catch (e) { return null; } }
function demanderIdent() {
  return new Promise(resolve => {
    const deja = lireIdent();
    if (deja && deja.ini && deja.couleur) return resolve(deja);
    const couleurs = ['#2563eb', '#ea580c', '#059669', '#9333ea', '#db2777', '#0891b2', '#ca8a04', '#dc2626'];
    const v = document.createElement('div');
    v.className = 'en-ligne-voile';
    v.innerHTML = `<form class="en-ligne-boite">
      <h2>Carte du projet, en équipe</h2>
      <p>Cette carte s’enregistre toute seule et se met à jour en direct chez chacun.</p>
      <label>Vos initiales<input name="ini" maxlength="4" autocomplete="off" required placeholder="ex. BM"></label>
      <div class="en-ligne-couleurs"><span>Votre couleur (repère sur ce que vous écrivez)</span><div>${couleurs.map((c, i) => `<label style="--c:${c}"><input type="radio" name="couleur" value="${c}"${(deja && deja.couleur ? deja.couleur === c : i === 0) ? ' checked' : ''}><i></i></label>`).join('')}</div></div>
      <label>Votre rôle<select name="role"><option>PSE</option><option>Enseignement professionnel</option><option>Autre enseignant</option><option>Autre</option></select></label>
      <p class="en-ligne-rgpd">Jamais de nom d’élève dans la carte.</p>
      <button class="primaire">Entrer</button></form>`;
    document.body.appendChild(v);
    const f = v.querySelector('form');
    if (deja && deja.ini) { f.ini.value = deja.ini; if (deja.role) f.role.value = deja.role; }
    f.ini.focus();
    f.addEventListener('submit', ev => {
      ev.preventDefault();
      const id = { ini: f.ini.value.trim().toUpperCase().replace(/[^A-ZÀ-Ÿ.-]/g, '').slice(0, 4) || '?', role: f.role.value, couleur: f.couleur.value };
      try { localStorage.setItem(CLE_IDENT, JSON.stringify(id)); } catch (e) {}
      v.remove(); resolve(id);
    });
  });
}

/* ---------- Démarrage et synchronisation ---------- */
function etat(t, classe) {
  const e = document.getElementById('etat-sauve');
  if (e) { e.textContent = t; e.className = classe || ''; }
}
function heure(ts) {
  const d = ts && ts.toDate ? ts.toDate() : null;
  return d ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
}

async function demarrer() {
  window.CARTE_EN_LIGNE = { id: CARTE_ID, retour: PARAMS.get('retour') || '../../', recevoir: null };
  const attente = document.getElementById('en-ligne-attente');
  const ident = await demanderIdent();
  window.CARTE_EN_LIGNE.auteur = ident.ini;
  window.CARTE_EN_LIGNE.couleur = ident.couleur;

  const app = initializeApp({ apiKey: "AIzaSyBj_GXG8ln3GAxNXxiJkT2HPSWIHJpc1lA", authDomain: "coordination-pedagogie.firebaseapp.com", projectId: "coordination-pedagogie", storageBucket: "coordination-pedagogie.firebasestorage.app", messagingSenderId: "526058585010", appId: "1:526058585010:web:ba4dd6d9c8281ba5bf02ab" });
  const db = getFirestore(app);
  const ref = doc(db, COL, CARTE_ID);

  let cache = null;          // ce que l'éditeur lit : { version, cartes:[carte], dossiers, corbeille }
  let base = null;           // texte de la carte dont l'éditeur est parti (dernière version commune)
  let envoye = null;         // texte de la dernière carte écrite par cette fenêtre
  let aEnvoyer = null, enCours = false, distantEnAttente = null, relance = null;
  let derniere = { par: '', maj: null };

  const majCache = c => { cache = { version: 1, cartes: [c], dossiers: [], corbeille: [] }; };

  window.StorageService = {
    get(k) { return k === M.CLE ? JSON.stringify(cache) : localStorage.getItem(k); },
    set(k, v) {
      if (k !== M.CLE) { try { localStorage.setItem(k, v); } catch (e) {} return; }
      const d = JSON.parse(v), c = d.cartes.find(x => x.id === CARTE_ID);
      if (!c) return;
      majCache(c);
      aEnvoyer = JSON.stringify(c);
      pousser();
    }
  };

  function appliquer(texte) {   // montre une version dans l'éditeur, si celui-ci n'est pas au milieu d'un geste
    if (!window.CARTE_EN_LIGNE.recevoir || aEnvoyer || enCours) return false;
    const ok = window.CARTE_EN_LIGNE.recevoir(JSON.parse(texte));
    if (ok) { base = texte; majCache(JSON.parse(texte)); distantEnAttente = null; }
    return ok;
  }
  function reessayer() {
    clearTimeout(relance);
    if (!distantEnAttente) return;
    if (!appliquer(distantEnAttente)) relance = setTimeout(reessayer, 400);
  }
  function dire() {
    const qui = derniere.par && derniere.par !== ident.ini ? ' · dernière modif. ' + derniere.par + (heure(derniere.maj) ? ' à ' + heure(derniere.maj) : '') : '';
    etat('✓ Enregistré en ligne' + qui, 'ok');
  }

  async function pousser() {
    if (enCours) return;
    enCours = true;
    while (aEnvoyer) {
      const local = aEnvoyer; aEnvoyer = null;
      if (local === base) continue;
      etat('Enregistrement…');
      try {
        if (local.length > 900000) throw Object.assign(new Error('trop lourde'), { lourde: true });
        const res = await runTransaction(db, async tx => {
          const snap = await tx.get(ref);
          const d = snap.exists() ? snap.data() : null;
          const distant = d && d.carte;
          let texte = local;
          if (distant && distant !== base && distant !== local) texte = JSON.stringify(fusionnerCarte(JSON.parse(base || distant), JSON.parse(local), JSON.parse(distant)));
          if (texte.length > 900000) throw Object.assign(new Error('trop lourde'), { lourde: true });
          const version = ((d && d.version) || 0) + 1;
          tx.set(ref, { carte: texte, titre: JSON.parse(texte).titre || '', version, maj: serverTimestamp(), par: ident.ini, role: ident.role });
          return { texte, fusion: texte !== local };
        });
        envoye = res.texte;
        // L'éditeur part toujours de ce qu'il a envoyé ; s'il y a eu fusion, il recevra la version fusionnée dès qu'il est libre.
        base = local;
        distantEnAttente = res.fusion ? res.texte : null;
        derniere = { par: ident.ini, maj: null };
        dire();
      } catch (e) {
        if (e.lourde) { etat('Carte trop lourde pour être enregistrée en ligne (images ?) : retirez une image.', 'erreur'); aEnvoyer = null; break; }
        aEnvoyer = aEnvoyer || local;
        etat(navigator.onLine ? 'Enregistrement impossible : nouvel essai…' : 'Hors connexion : la carte s’enregistrera au retour du réseau.', 'erreur');
        console.warn('[carte en ligne]', e);
        enCours = false;
        setTimeout(pousser, 3000);
        return;
      }
    }
    enCours = false;
    reessayer();
  }
  window.addEventListener('online', () => pousser());
  window.addEventListener('beforeunload', ev => { if (aEnvoyer || enCours) { ev.preventDefault(); ev.returnValue = ''; } });

  /* Première ouverture : la carte n'existe pas encore → on la crée (modèle du projet, ou carte vide), une seule fois. */
  async function creer() {
    const modele = (window.CARTE_MODELES || {})[CARTE_ID];
    const c = M.carte(modele ? modele.titre : 'Carte de l’équipe');
    c.id = CARTE_ID;
    if (modele) {
      const f = c.feuilles[0];
      f.racine = M.depuisArbre(modele.arbre);
      f.structure = modele.structure || 'carte';
      f.theme = modele.theme || 'classique';
    }
    const texte = JSON.stringify(c);
    await runTransaction(db, async tx => {
      const snap = await tx.get(ref);
      if (snap.exists()) return;   // quelqu'un l'a créée entre-temps
      tx.set(ref, { carte: texte, titre: c.titre, version: 1, maj: serverTimestamp(), par: ident.ini, role: ident.role, cree: serverTimestamp() });
    });
  }

  let demarre = false;
  onSnapshot(ref, async snap => {
    if (snap.metadata.hasPendingWrites) return;   // notre propre écriture, pas encore confirmée
    if (!snap.exists()) {
      if (snap.metadata.fromCache) return;
      if (demarre) {   // effacée pendant qu'elle est ouverte ici : on la réécrit telle qu'on la voit, jamais vide
        base = null; aEnvoyer = JSON.stringify(cache.cartes[0]); pousser();
        return;
      }
      try { await creer(); } catch (e) { if (attente) attente.textContent = 'Impossible de créer la carte en ligne : ' + (e.message || e); console.error(e); }
      return;
    }
    const d = snap.data();
    derniere = { par: d.par || '', maj: d.maj || null };
    if (!demarre) {
      demarre = true;
      base = d.carte; envoye = d.carte;
      majCache(JSON.parse(d.carte));
      if (attente) attente.remove();
      location.replace('#c=' + encodeURIComponent(CARTE_ID));
      chargerEditeur();
      setTimeout(dire, 300);
      return;
    }
    if (d.carte === envoye || d.carte === base) { dire(); return; }   // déjà connu ici
    // Une autre personne a écrit : si quelque chose part d'ici, la transaction fusionnera ; sinon on montre tout de suite.
    if (aEnvoyer || enCours) return;
    distantEnAttente = d.carte;
    reessayer();
    dire();
  }, err => {
    console.error('[carte en ligne]', err);
    if (attente) attente.textContent = 'Connexion à la carte impossible : ' + (err.code === 'permission-denied' ? 'accès refusé par Firebase.' : (err.message || err));
    else etat('Connexion perdue : ' + (err.message || err), 'erreur');
  });
}
