/* ═══════════════════════════════════════════════════════════════════════════
   Informatique — tableau de bord de l'enseignant informatique (10/11/2026).
   Vues : tableau de bord · une salle (plan + fiches des postes) · nouvelle salle ·
   catalogue (équipements, pannes, équipements de salle) · QR codes · paramètres.
   Tout est en temps réel (onSnapshot) et modifiable à tout moment.
   ═══════════════════════════════════════════════════════════════════════════ */
import { base, COL_PARC, COL_SALLE, RE_SALLE, MAX_POSTES, MAX_SALLES, CATALOGUE_DEFAUT, TYPES_POSTE, ICONES, catSalle,
         $, $$, esc, nettoie, maintenant, aleatoire, avecDelai, dateCourte, duree, icone, posteVierge, nomPoste, libPanne,
         ouverts, etatPoste, LIB_ETAT, modifierDoc, modifierSalle, libStatut, suiviPoste } from './commun.js?v=20261110c';

const { FS, db, erreurFS } = await base('info-referent');
/* Pour l'instant, SANS CODE (décision de Brahim, 10/11/2026) : un espace unique, ouvert directement.
   Un code d'accès pourra être ajouté plus tard : l'écran « ecranAcces » est conservé pour cela. */
const ESPACE_PAR_DEFAUT = 'cpinfo2026';
const K_SECOURS = 'info-referent-secours', K_HUMEUR = 'info-referent-humeur';
const K_CODE = 'info-referent-code', K_VUE = 'info-referent-vue', K_PER = 'info-referent-periode';
const S = { code: '', parc: null, salles: {}, vue: 'tdb', periode: '30', depuis: '', selection: null, tiroir: null, codeNouveau: '', erreur: '' };
const ecoutes = {}; let ecouteParc = null;
try { S.code = localStorage.getItem(K_CODE) || ''; S.vue = localStorage.getItem(K_VUE) || 'tdb'; S.periode = localStorage.getItem(K_PER) || '30'; } catch (_) { }
const garder = (k, v) => { try { localStorage.setItem(k, v); } catch (_) { } };

const parcId = c => 'parc_' + c;
const codeLisible = c => c.slice(0, 5) + '-' + c.slice(5);
const urlSalle = id => new URL('./?s=' + id, location.href).href;
const listeSalles = () => (S.parc?.salles || []).filter(x => RE_SALLE.test(x.id));
const sallesChargees = () => listeSalles().map(x => S.salles[x.id] ? { ...S.salles[x.id], id: x.id } : null).filter(Boolean);
const cat = () => { const c = S.parc?.cat || CATALOGUE_DEFAUT(); return { ...c, statuts: c.statuts || CATALOGUE_DEFAUT().statuts, voir: c.voir !== false }; };
const catPourSalle = (s, catalogue = cat()) => { const c = catSalle({ ...catalogue, statuts: catalogue.statuts || CATALOGUE_DEFAUT().statuts }); return { ...c, salle: c.salle.filter(x => (s.eqSalle || []).includes(x.k)) }; };
const COUL = { ok: 'var(--ok)', pb: 'var(--pb)', panne: 'var(--non)', hs: 'var(--hs)' };
const ICO_ETAT = { ok: 'ok', pb: 'outil', panne: 'power', hs: 'materiel' };
const NOMS_ICONES = { ecran: 'Écran', clavier: 'Clavier', souris: 'Souris', casque: 'Casque', webcam: 'Webcam', uc: 'Unité centrale', portable: 'Portable',
  imprimante: 'Imprimante', videoproj: 'Projecteur', tbi: 'Tableau', enceinte: 'Enceinte', internet: 'Internet', power: 'Marche', session: 'Cadenas',
  lent: 'Chrono', ok: 'Coche', outil: 'Outil', logiciel: 'Fenêtre', son: 'Son', cable: 'Câble', autre: 'Autre', salle: 'Salle', materiel: 'Matériel' };
const typeLib = k => (TYPES_POSTE.find(t => t[0] === k) || [, ''])[1];

/* ═════════ Accès ═════════ */
function ecranAcces(){
  $('#racine').innerHTML = `<div class="acces"><div class="boite">
    <div class="marque" style="color:var(--ink);padding:0"><span class="logo">${icone('ecran')}</span><div><b>Parc informatique</b><small style="color:var(--muted)">Espace de l’enseignant informatique</small></div></div>
    <h1>Bonjour</h1><p>Entrez votre code pour ouvrir le tableau de bord.</p>
    <form id="f-code" autocomplete="off">
      <label class="sr" for="code">Code de l’espace</label>
      <input id="code" placeholder="xxxxx-xxxxx" maxlength="14" autocapitalize="off" spellcheck="false" required>
      <p class="err" id="code-err" style="min-height:1.4em;margin:8px 0">${esc(S.erreur)}</p>
      <button class="btn" style="width:100%;padding:14px">Ouvrir le tableau de bord</button>
    </form>
    <div style="border-top:1px solid var(--line);margin-top:22px;padding-top:18px">
      <p style="margin:0 0 10px">Première fois ? Créez votre espace : un code vous sera donné.</p>
      <button class="btn ghost" id="creer" style="width:100%">Créer mon espace</button>
    </div></div></div>`;
  $('#f-code').onsubmit = e => { e.preventDefault(); const c = $('#code').value.toLowerCase().replace(/[^a-z0-9]/g, ''); if (!/^[a-z0-9]{10}$/.test(c)) { $('#code-err').textContent = 'Le code compte 10 lettres ou chiffres.'; return; } entrer(c); };
  $('#creer').onclick = async () => {
    const c = aleatoire(10);
    try { await avecDelai(FS.setDoc(FS.doc(db, COL_PARC, parcId(c)), { id: parcId(c), type: 'parc', nom: 'Parc informatique', salles: [], cat: CATALOGUE_DEFAUT(), majLe: maintenant(), version: 1 })); S.codeNouveau = c; S.vue = 'nouvelle'; entrer(c); }
    catch (_) { toast('Création impossible : vérifiez la connexion.'); }
  };
  $('#code').focus();
}
function entrer(c){
  if (erreurFS) return toast('Pas de connexion au serveur.');
  S.code = c; S.erreur = '';
  ecouteParc?.();
  ecouteParc = FS.onSnapshot(FS.doc(db, COL_PARC, parcId(c)), snap => {
    if (!snap.exists()) {
      if (c === ESPACE_PAR_DEFAUT && !S.creation) { S.creation = true; FS.setDoc(FS.doc(db, COL_PARC, parcId(c)), { id: parcId(c), type: 'parc', nom: 'Parc informatique', salles: [], cat: CATALOGUE_DEFAUT(), majLe: maintenant(), version: 1 }).catch(() => toast('Création impossible : vérifiez la connexion.')); return; }
      S.erreur = 'Ce code n’est pas reconnu.'; return sortir(false);
    }
    garder(K_CODE, c);
    S.parc = snap.data(); brancherSalles();
    /* Une salle retirée (ici ou sur un autre appareil) : retour au tableau de bord. */
    if (S.vue.startsWith('salle:') && !listeSalles().some(x => 'salle:' + x.id === S.vue)) { S.vue = 'tdb'; fermerTiroir(true); }
    rendre();
  }, () => { S.erreur = 'Lecture impossible : vérifiez la connexion.'; sortir(false); });
}
function sortir(oublier = true){
  ecouteParc?.(); ecouteParc = null; Object.values(ecoutes).forEach(f => f()); for (const k in ecoutes) delete ecoutes[k];
  S.parc = null; S.salles = {}; S.code = ''; fermerTiroir(true);
  if (oublier) { try { localStorage.removeItem(K_CODE); } catch (_) { } }
  ecranAcces();
}
let attente = null;
function brancherSalles(){
  const ids = new Set(listeSalles().map(x => x.id));
  for (const id of Object.keys(ecoutes)) if (!ids.has(id)) { ecoutes[id](); delete ecoutes[id]; delete S.salles[id]; }
  for (const id of ids) if (!ecoutes[id]) ecoutes[id] = FS.onSnapshot(FS.doc(db, COL_SALLE, id), snap => {
    if (!snap.exists()) return;
    S.salles[id] = snap.data();
    clearTimeout(attente); attente = setTimeout(rendreDoux, 40);
  });
}
const modifierParc = modif => modifierDoc(COL_PARC, parcId(S.code), modif);

/* Rafraîchit sans casser une saisie en cours. */
function rendreDoux(){
  const a = document.activeElement;
  const saisie = a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && a.type !== 'checkbox';
  if (saisie && (a.closest('.tiroir') || a.closest('form'))) { if (S.tiroir && a.closest('.tiroir')) return; if (a.closest('form')) return; }
  rendre(true);
}

/* ═════════ Rendu général ═════════ */
function rendre(doux = false){
  if (!S.parc) return;
  const ss = sallesChargees();
  const pannesSalle = s => ouverts(s).length;
  const vues = { tdb: vueTdb, nouvelle: vueNouvelle, catalogue: vueCatalogue, qr: vueQR, param: vueParam };
  const corps = S.vue.startsWith('salle:') ? vueSalle(S.vue.slice(6)) : (vues[S.vue] || vueTdb)();
  const scroll = scrollY;
  $('#racine').innerHTML = `<div class="app">
    <nav class="cote" aria-label="Navigation">
      <div class="marque"><span class="logo">${icone('ecran')}</span><div><b>${esc(S.parc.nom || 'Parc informatique')}</b><small>Gestion des ordinateurs</small></div></div>
      ${nav('tdb', 'Tableau de bord', 'materiel', ss.reduce((n, s) => n + pannesSalle(s), 0))}
      <div class="nav-titre">Salles</div>
      ${listeSalles().map(x => { const s = S.salles[x.id]; return nav('salle:' + x.id, s?.nom || x.nom, 'salle', s ? pannesSalle(s) : null); }).join('')}
      ${nav('nouvelle', 'Nouvelle salle', 'outil')}
      <div class="nav-titre">Configuration</div>
      ${nav('catalogue', 'Équipements & pannes', 'clavier')}
      ${nav('param', 'Sauvegarde', 'session')}
    </nav>
    <main class="contenu" id="contenu" tabindex="-1">
      ${S.codeNouveau ? `<div class="carte" style="margin-bottom:18px;box-shadow:inset 0 0 0 2px var(--bleu),var(--sh)">
        <h2>Votre code — notez-le<small></small></h2>
        <p style="margin:0 0 12px;color:var(--ink-2)">Il ouvre ce tableau de bord sur tout appareil. Ne le donnez pas aux collègues : eux scannent seulement le QR code de la salle.</p>
        <div class="puces"><span class="code">${codeLisible(S.code)}</span><button class="btn petit" id="code-ok">C’est noté</button></div></div>` : ''}
      ${corps}
    </main></div>`;
  if (doux) scrollTo(0, scroll);
  if (listeSalles().length) copieSecours();
  $$('[data-vue]').forEach(b => b.onclick = () => aller(b.dataset.vue));
  $('#code-ok')?.addEventListener('click', () => { S.codeNouveau = ''; rendre(); });
  brancher();
  if (S.tiroir) rendreTiroir();
}
function nav(v, lib, ic, pastille){
  return `<button class="nav" data-vue="${v}" ${S.vue === v ? 'aria-current="page"' : ''}>${icone(ic)}<span>${esc(lib)}</span>${pastille != null ? `<span class="pastille ${pastille ? '' : 'zero'}" aria-label="${pastille} problème(s) en cours">${pastille}</span>` : ''}</button>`;
}
function aller(v){ S.vue = v; S.selection = null; garder(K_VUE, v); fermerTiroir(true); rendre(); scrollTo(0, 0); $('#contenu')?.focus({ preventScroll: true }); }

/* ═════════ Période ═════════ */
function debutPeriode(){
  const auj = new Date(); auj.setHours(0, 0, 0, 0);
  if (S.periode === '7') return new Date(auj - 6 * 864e5);
  if (S.periode === '30') return new Date(auj - 29 * 864e5);
  if (S.periode === 'annee') { const a = auj.getMonth() >= 8 ? auj.getFullYear() : auj.getFullYear() - 1; return new Date(a, 8, 1); }
  const d = new Date((S.depuis || '') + 'T00:00:00'); return isNaN(d) ? new Date(auj - 29 * 864e5) : d;
}
const isoJour = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function puce(v, lib){ return `<button class="puce" data-per="${v}" aria-pressed="${S.periode === v}">${lib}</button>`; }
const filtrePeriode = () => `<div class="puces" role="group" aria-label="Période">${puce('7', '7 jours')}${puce('30', '30 jours')}${puce('annee', 'Année scolaire')}
  <span class="puce" aria-pressed="${S.periode === 'date'}" style="display:inline-flex;gap:6px;align-items:center"><label for="depuis">Depuis le</label><input type="date" id="depuis" value="${esc(S.periode === 'date' ? S.depuis : isoJour(debutPeriode()))}" max="${isoJour(new Date())}"></span></div>`;

/* Statistiques d'un ensemble de salles sur la période. */
function stats(ss){
  const t0 = debutPeriode().getTime();
  let total = 0, ok = 0, hs = 0, enCours = 0, repetees = 0, repares = 0, delais = [];
  const touches = new Set(), parType = {}, parPoste = {}, parJour = {};
  ss.forEach(s => {
    (s.postes || []).forEach(p => { total++; const e = etatPoste(s, p); if (e === 'ok') ok++; if (e === 'hs') hs++; });
    (s.sig || []).forEach(x => {
      if (x.etat === 'ouvert') { enCours++; if (x.d.length > 1) repetees++; }
      const dates = (x.d || []).filter(d => new Date(d).getTime() >= t0);
      if (dates.length) {
        if (x.p !== 0) touches.add(s.id + '|' + x.p); /* la salle elle-même n'est pas un ordinateur */
        const lp = libPanne(s, x.t); const k = x.t.startsWith('eq:') ? lp.court : lp.lib;
        (parType[k] ||= { n: 0, ic: lp.ic }).n += dates.length;
        const kp = s.id + '|' + x.p; (parPoste[kp] ||= { s, p: x.p, n: 0 }).n += dates.length;
        dates.forEach(d => { const j = isoJour(new Date(d)); parJour[j] = (parJour[j] || 0) + 1; });
      }
      if (x.etat === 'repare' && new Date(x.rep).getTime() >= t0) { repares++; delais.push(new Date(x.rep) - new Date(x.d[0])); }
    });
  });
  const actifs = total - hs;
  return { total, ok, hs, actifs, enCours, repetees, repares, touches: touches.size, delai: delais.length ? delais.reduce((a, b) => a + b, 0) / delais.length : null, parType, parPoste, parJour, signalements: Object.values(parJour).reduce((a, b) => a + b, 0) };
}

/* ═════════ Graphiques ═════════ */
function anneau(part, total, coul = 'var(--ok)'){
  const r = 26, c = 2 * Math.PI * r, f = total ? part / total : 0;
  return `<svg class="anneau" viewBox="0 0 62 62" aria-hidden="true"><circle cx="31" cy="31" r="${r}" fill="none" stroke="var(--hs-l)" stroke-width="7"/>
    <circle cx="31" cy="31" r="${r}" fill="none" stroke="${coul}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${(c * f).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 31 31)"/>
    <text x="31" y="35.5" text-anchor="middle" font-size="13" font-weight="800" fill="var(--ink)">${total ? Math.round(f * 100) : 0}%</text></svg>`;
}
function histogramme(parJour){
  const debut = debutPeriode(), auj = new Date(); auj.setHours(0, 0, 0, 0);
  const jours = Math.round((auj - debut) / 864e5) + 1, parSemaine = jours > 62;
  const seaux = [];
  for (let t = debut.getTime(); t <= auj.getTime(); t += (parSemaine ? 7 : 1) * 864e5) {
    let n = 0; const d0 = new Date(t);
    for (let i = 0; i < (parSemaine ? 7 : 1); i++) n += parJour[isoJour(new Date(t + i * 864e5))] || 0;
    seaux.push({ d: d0, n });
  }
  const max = Math.max(1, ...seaux.map(x => x.n)), W = 720, H = 190, bas = 22, haut = 12, l = W / seaux.length, lb = Math.max(2, Math.min(28, l - 3));
  const pas = Math.ceil(seaux.length / 8);
  const grad = [0, Math.ceil(max / 2), max].filter((v, i, a) => a.indexOf(v) === i);
  return `<div class="histo-zone" id="histo"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Signalements ${parSemaine ? 'par semaine' : 'par jour'} sur la période">
    ${grad.map(v => { const y = H - bas - (H - bas - haut) * v / max; return `<line x1="0" x2="${W}" y1="${y}" y2="${y}" stroke="var(--line)" stroke-width="1"/>`; }).join('')}
    ${seaux.map((x, i) => { const h = (H - bas - haut) * x.n / max, xx = i * l + (l - lb) / 2;
      return `<g data-bulle="${esc(`${parSemaine ? 'Semaine du ' : ''}${x.d.toLocaleDateString('fr-FR', { weekday: parSemaine ? undefined : 'short', day: 'numeric', month: 'short' })} : ${x.n} signalement${x.n > 1 ? 's' : ''}`)}">
        <rect x="${i * l}" y="0" width="${l}" height="${H - bas}" fill="transparent"/>
        ${x.n ? `<rect x="${xx}" y="${H - bas - h}" width="${lb}" height="${h}" rx="${Math.min(4, lb / 2)}" fill="var(--bleu)"/>` : `<rect x="${xx}" y="${H - bas - 2}" width="${lb}" height="2" rx="1" fill="var(--line-2)"/>`}
        ${i % pas === 0 ? `<text x="${i * l + l / 2}" y="${H - 6}" text-anchor="middle" font-size="11" fill="var(--muted)">${x.d.getDate()}/${x.d.getMonth() + 1}</text>` : ''}</g>`; }).join('')}
  </svg><div class="bulle" id="bulle" hidden></div></div>`;
}
function barres(objet, vide){
  const l = Object.entries(objet).sort((a, b) => b[1].n - a[1].n).slice(0, 7);
  if (!l.length) return `<p class="vide">${vide}</p>`;
  const max = l[0][1].n;
  return `<div class="barres">${l.map(([k, v]) => `<div class="barre"><span class="l">${icone(v.ic)}<span title="${esc(k)}">${esc(k)}</span></span><span class="t"><i style="width:${(100 * v.n / max).toFixed(1)}%"></i></span><b>${v.n}</b></div>`).join('')}</div>`;
}

/* ═════════ Tableau de bord ═════════ */
/* Accueil : date du jour, salutation, humeur (gardée sur cet appareil seulement), résumé en une phrase. */
const HUMEURS = [['top', '😄', 'Au top', 'Super ! Belle journée à vous.'], ['bien', '🙂', 'Bien', 'Parfait, bonne journée !'], ['moyen', '😐', 'Moyen', 'On y va tranquillement, un poste à la fois.'],
  ['bof', '😕', 'Bof', 'Courage : commencez par ce qui est signalé plusieurs fois.'], ['epuise', '😫', 'Épuisé', 'Prenez soin de vous : rien ne presse qui ne puisse attendre.']];
function accueil(ss, aTraiter){
  const d = new Date(), h = d.getHours();
  const salut = h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir';
  let hum = null; try { const x = JSON.parse(localStorage.getItem(K_HUMEUR) || 'null'); if (x?.jour === isoJour(d)) hum = x.v; } catch (_) { }
  const rep = aTraiter.filter(a => a.x.d.length > 1).length, nbS = new Set(aTraiter.map(a => a.s.id)).size;
  const resume = !ss.length ? 'Créez votre première salle pour commencer.' : !aTraiter.length ? `Tout fonctionne dans ${ss.length > 1 ? `les ${ss.length} salles` : 'la salle'}. Rien à traiter aujourd’hui.`
    : `${aTraiter.length} problème${aTraiter.length > 1 ? 's' : ''} à traiter dans ${nbS} salle${nbS > 1 ? 's' : ''}${rep ? `, dont ${rep} signalé${rep > 1 ? 's' : ''} plusieurs fois` : ''}.`;
  const choisi = HUMEURS.find(x => x[0] === hum);
  return `<section class="accueil">
    <div class="acc-g"><div class="cal" aria-hidden="true"><div class="m">${d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')}</div><div class="j">${d.getDate()}</div><div class="s">${d.toLocaleDateString('fr-FR', { weekday: 'long' })}</div></div>
      <div><h1>${salut} 👋</h1><p class="date">${esc((t => t.charAt(0).toUpperCase() + t.slice(1))(d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })))}</p><p class="resume">${esc(resume)}</p></div></div>
    <div class="humeur"><p id="q-hum">${choisi ? esc(choisi[3]) : 'Comment vous sentez-vous aujourd’hui ?'}</p>
      <div role="group" aria-labelledby="q-hum">${HUMEURS.map(([k, e, l]) => `<button data-humeur="${k}" aria-pressed="${hum === k}" title="${l}" aria-label="${l}">${e}</button>`).join('')}</div></div>
  </section>`;
}
function vueTdb(){
  const ss = sallesChargees();
  if (!listeSalles().length) return `${accueil([], [])}
    <div class="carte vide"><p>Aucune salle pour l’instant.</p><button class="btn" data-vue="nouvelle">${icone('outil')}Créer une salle</button></div>`;
  const st = stats(ss);
  const aTraiter = ss.flatMap(s => ouverts(s).map(x => ({ s, x }))).sort((a, b) => b.x.d.length - a.x.d.length || String(a.x.d[0]).localeCompare(String(b.x.d[0])));
  const top = Object.values(st.parPoste).sort((a, b) => b.n - a.n).slice(0, 5);
  return `${accueil(ss, aTraiter)}
  <div class="tete"><div><h2 style="margin:0;font-size:1.2rem">Tableau de bord</h2><p>${ss.length} salle${ss.length > 1 ? 's' : ''} · ${st.total} postes · mis à jour en temps réel</p></div>
    <div class="puces">${filtrePeriode()}<button class="btn ghost petit" data-vue="qr">${icone('imprimante')}Affiches QR</button></div></div>
  <div class="kpis">
    <div class="kpi">${anneau(st.ok, st.actifs)}<div><div class="val">${st.ok}<small>/${st.actifs}</small></div><div class="lib">postes disponibles${st.hs ? ` · ${st.hs} hors service` : ''}</div></div></div>
    <div class="kpi"><span class="badge-ic etat-${st.enCours ? 'panne' : 'ok'}">${icone(st.enCours ? 'outil' : 'ok')}</span><div><div class="val">${st.enCours}</div><div class="lib">problème${st.enCours > 1 ? 's' : ''} en cours${st.repetees ? ` · ${st.repetees} signalé${st.repetees > 1 ? 's' : ''} plusieurs fois` : ''}</div></div></div>
    <div class="kpi"><span class="badge-ic etat-pb">${icone('ecran')}</span><div><div class="val">${st.touches}<small>/${st.total}</small></div><div class="lib">ordinateurs touchés · ${st.signalements} signalement${st.signalements > 1 ? 's' : ''}</div></div></div>
    <div class="kpi"><span class="badge-ic etat-ok">${icone('ok')}</span><div><div class="val">${st.repares}</div><div class="lib">réparation${st.repares > 1 ? 's' : ''}${st.delai != null ? ` · en ${duree(st.delai)} en moyenne` : ''}</div></div></div>
  </div>
  <div class="pile">
    <section class="carte"><h2>Signalements sur la période<small>${st.signalements} au total</small></h2>${histogramme(st.parJour)}</section>
    <div class="grille2">
      <section class="carte"><h2>À traiter, salle par salle<small>${aTraiter.length}</small></h2>${aTraiter.length ? ss.filter(s => ouverts(s).length).map(s => { const l = aTraiter.filter(a => a.s.id === s.id); return `
        <div class="groupe"><button class="groupe-t" data-vue="salle:${s.id}">${icone('salle')}<b>${esc(s.nom)}</b><span class="pastille-g">${l.length}</span><span class="voir">Voir la salle ›</span></button>
        <ul class="liste">${l.slice(0, 3).map(({ x }) => lignePanne(s, x, true)).join('')}</ul>${l.length > 3 ? `<button class="btn lien petit" data-vue="salle:${s.id}">+ ${l.length - 3} autre${l.length - 3 > 1 ? 's' : ''} dans cette salle</button>` : ''}</div>`; }).join('') : `<p class="vide">${icone('ok')}<br>Tout fonctionne. Rien à traiter.</p>`}</section>
      <div class="pile">
        <section class="carte"><h2>Par type de problème</h2>${barres(st.parType, 'Aucun signalement sur la période.')}</section>
        <section class="carte"><h2>Postes les plus signalés</h2>${top.length ? `<ul class="liste">${top.map(t => { const p = (t.s.postes || []).find(y => y.n === t.p) || { n: t.p }; return `
          <li><button class="ligne" style="width:100%;border:0;text-align:left" data-poste="${t.s.id}|${t.p}"><span class="pic etat-${etatPoste(t.s, p)}">${icone(t.p === 0 ? 'salle' : 'ecran')}</span><span class="txt"><b>${esc(nomPoste(p))}</b><small>${esc(t.s.nom)}${p.marque ? ' · ' + esc(p.marque) : ''}</small></span><b>${t.n}</b></button></li>`; }).join('')}</ul>` : '<p class="vide">Aucun signalement sur la période.</p>'}</section>
      </div>
    </div>
    <section><div class="tete" style="margin:6px 0 12px;align-items:center"><h2 style="font-size:1rem;margin:0">Les salles</h2>${`<div class="legende" aria-hidden="true"><span><i class="c-ok"></i>Fonctionne</span><span><i class="c-pb"></i>Problème signalé</span><span><i class="c-panne"></i>En panne</span><span><i class="c-hs"></i>Hors service</span></div>`}</div><div class="salles">${ss.map(carteSalle).join('')}</div></section>
  </div>`;
}
function carteSalle(s){
  const ps = s.postes || [], ok = ps.filter(p => etatPoste(s, p) === 'ok').length, act = ps.filter(p => !p.hs).length, o = ouverts(s).length;
  return `<button class="salle-carte" data-vue="salle:${s.id}">
    <div class="h"><div><b>${esc(s.nom)}</b><br><small>${ps.length} postes · ${o ? `${o} problème${o > 1 ? 's' : ''} en cours` : 'tout fonctionne'}</small></div>
      <div class="dispo">${anneau(ok, act, 'var(--ok)')}<small>${ok}/${act} disponibles</small></div></div>
    <div class="mini">${ps.map(p => `<i class="c-${etatPoste(s, p)}" title="${esc(nomPoste(p))} : ${LIB_ETAT[etatPoste(s, p)]}">${p.n}</i>`).join('')}</div>
  </button>`;
}
const badgeSuivi = (s, x) => { const st = libStatut(s, x.suivi); return st ? `<span class="suivi">${icone(st.ic)}${esc(st.lib)}</span>` : ''; };
function lignePanne(s, x, sansSalle){
  const lp = libPanne(s, x.t), p = x.p === 0 ? { n: 0 } : ((s.postes || []).find(y => y.n === x.p) || { n: x.p });
  return `<li class="ligne"><span class="pic ${x.t === 'hs' ? 'etat-panne' : 'etat-pb'}">${icone(lp.ic)}</span>
    <span class="txt"><b>${esc(nomPoste(p))} · ${esc(lp.lib)}${x.d.length > 1 ? `<span class="rep">×${x.d.length}</span>` : ''}</b>
    ${badgeSuivi(s, x)}<small>${sansSalle ? '' : esc(s.nom) + ' · '}${x.d.length > 1 ? `depuis ${esc(dateCourte(x.d[0]))}, dernier ${esc(dateCourte(x.d.at(-1)))}` : esc(dateCourte(x.d[0]))}${x.txt ? ` · « ${esc(x.txt)} »` : ''}</small></span>
    <button class="btn petit ok" data-reparer="${s.id}|${x.id}">${icone('ok')}Réparé</button></li>`;
}

/* ═════════ Une salle ═════════ */
function vueSalle(id){
  const s = S.salles[id] ? { ...S.salles[id], id } : null;
  if (!s) return `<div class="carte vide">Chargement de la salle…</div>`;
  const ps = s.postes || [], cpt = { ok: 0, pb: 0, panne: 0, hs: 0 };
  ps.forEach(p => cpt[etatPoste(s, p)]++);
  const marques = [...new Set(ps.map(p => p.marque).filter(Boolean))];
  const sel = S.selection;
  const eqSalle = cat().salle.filter(x => (s.eqSalle || []).includes(x.k));
  const ouvSalle = ouverts(s, 0);
  const journal = (s.sig || []).flatMap(x => [...x.d.map(d => ({ d, x, r: false })), ...(x.rep ? [{ d: x.rep, x, r: true }] : [])]).sort((a, b) => String(b.d).localeCompare(String(a.d))).slice(0, 25);
  return `<div class="tete"><div><h1>${esc(s.nom)}</h1><p>${ps.length} postes${marques.length ? ' · ' + esc(marques.join(', ')) : ''}</p></div>
    <div class="puces"><button class="btn ghost petit" data-reglages="${id}">${icone('session')}Réglages de la salle</button><button class="btn ghost petit" data-qr="${id}">${icone('logiciel')}QR code</button>
    <button class="btn ${sel ? '' : 'sec'} petit" id="mode-sel">${icone('ok')}${sel ? 'Terminer la sélection' : 'Sélectionner'}</button></div></div>
  <div class="pile">
    <section class="carte">
      <div class="barre-outils">
        <div class="compteurs">${['ok', 'pb', 'panne', 'hs'].filter(k => k === 'ok' || cpt[k]).map(k => `<span class="compteur etat-${k}">${icone(ICO_ETAT[k])}${compteur(k, cpt[k])}</span>`).join('')}</div>
        ${sel ? `<div class="puces"><b style="font-size:.9rem">${sel.size} sélectionné${sel.size > 1 ? 's' : ''}</b><button class="btn petit sec" id="sel-tout">Tout</button><button class="btn petit" id="sel-modif" ${sel.size ? '' : 'disabled'}>Modifier ensemble</button></div>` : `<span class="legende"><span><i class="c-ok"></i>Fonctionne</span><span><i class="c-pb"></i>Problème</span><span><i class="c-panne"></i>En panne</span><span><i class="c-hs"></i>Hors service</span></span>`}
      </div>
      ${ps.length ? `<div class="plan" style="--max:${Math.max(1, Math.min(12, s.colonnes || 6))}">${ps.map(p => tuile(s, p)).join('')}</div>` : '<p class="vide">Aucun poste. Ouvrez « Réglages de la salle » pour en ajouter.</p>'}
    </section>
    <div class="grille2">
      <section class="carte"><h2>Équipements de la salle<button class="btn petit ghost" data-poste="${id}|0">Détails</button></h2>
        ${eqSalle.length ? `<ul class="liste">${eqSalle.map(e => { const o = ouvSalle.filter(x => x.t === 'salle:' + e.k); return `<li class="ligne"><span class="pic etat-${o.length ? 'pb' : 'ok'}">${icone(e.ic)}</span><span class="txt"><b>${esc(e.lib)}</b><small>${o.length ? `Signalé ${esc(dateCourte(o[0].d.at(-1)))}` : 'Fonctionne'}</small></span>${o.map(x => `<button class="btn petit ok" data-reparer="${id}|${x.id}">${icone('ok')}Réparé</button>`).join('')}</li>`; }).join('')}</ul>` : '<p class="vide">Aucun équipement de salle (vidéoprojecteur, imprimante…). À cocher dans les réglages.</p>'}
      </section>
      <section class="carte"><h2>Journal de la salle<small>${journal.length ? 'les 25 derniers' : ''}</small></h2>
        ${journal.length ? `<ul class="frise">${journal.map(j => { const p = j.x.p === 0 ? { n: 0 } : ((s.postes || []).find(y => y.n === j.x.p) || { n: j.x.p }); return `<li class="${j.r ? 'r' : ''}"><b>${esc(nomPoste(p))}</b> · ${j.r ? `réparé${j.x.repTxt ? ' — ' + esc(j.x.repTxt) : ''}` : esc(libPanne(s, j.x.t).lib)}<small>${esc(dateCourte(j.d))}</small></li>`; }).join('')}</ul>` : '<p class="vide">Rien pour l’instant.</p>'}
      </section>
    </div>
  </div>`;
}
/* « 1 poste fonctionne », « 9 postes fonctionnent », « 5 problèmes signalés »… */
function compteur(k, n){
  const p = n > 1;
  return { ok: `${n} fonctionne${p ? 'nt' : ''}`, pb: `${n} problème${p ? 's' : ''} signalé${p ? 's' : ''}`, panne: `${n} en panne`, hs: `${n} hors service` }[k];
}
function tuile(s, p){
  const e = etatPoste(s, p), o = ouverts(s, p.n), ko = new Set(o.filter(x => x.t.startsWith('eq:')).map(x => x.t.slice(3)));
  const sel = S.selection?.has(p.n);
  const eqs = cat().eq.filter(x => (p.eq || []).includes(x.k));
  return `<button class="pc ${e} ${sel ? 'sel' : ''}" data-pc="${p.n}" aria-label="${esc(nomPoste(p))} : ${LIB_ETAT[e]}${o.length ? `, ${o.length} problème(s)` : ''}" ${S.selection ? `aria-pressed="${!!sel}"` : ''}>
    <span class="n">${p.n}</span>
    <span class="nom">${esc(p.nom || [p.marque, p.modele].filter(Boolean).join(' ') || typeLib(p.type))}</span>
    ${S.selection ? `<span class="coche">${sel ? icone('ok') : ''}</span>` : o.length ? `<span class="alerte">${o.reduce((n, x) => n + x.d.length, 0)}</span>` : ''}
    <span class="et">${icone(ICO_ETAT[e])}<span>${e === 'pb' || (e === 'panne' && o.length > 1) ? esc([...new Set(o.map(x => libPanne(s, x.t).court || libPanne(s, x.t).lib))].join(', ')) : LIB_ETAT[e]}</span></span>
    ${ko.size ? `<span class="eqs">${eqs.filter(x => ko.has(x.k)).map(x => `<span class="ko" title="${esc(x.lib)} : signalé">${icone(x.ic)}</span>`).join('')}</span>` : ''}
    ${(() => { const st = suiviPoste(s, p.n); return st && e !== 'hs' ? `<span class="suivi">${icone(st.ic)}${esc(st.lib)}</span>` : ''; })()}
  </button>`;
}

/* ═════════ Tiroirs : poste, modification groupée, réglages de salle, réparation ═════════ */
function ouvrirTiroir(t){ S.tiroir = t; rendreTiroir(); setTimeout(() => $('.tiroir h2')?.focus(), 30); }
function fermerTiroir(silence){ S.tiroir = null; $('#calque').innerHTML = ''; if (!silence) rendre(true); }
function cadre(titre, sous, corps, pied){
  $('#calque').innerHTML = `<div class="voile" data-fermer></div><aside class="tiroir" role="dialog" aria-modal="true" aria-labelledby="t-titre">
    <div class="th"><div><h2 id="t-titre" tabindex="-1">${titre}</h2>${sous ? `<p>${sous}</p>` : ''}</div><button class="fermer" data-fermer aria-label="Fermer">×</button></div>
    <div class="tc">${corps}</div>${pied ? `<div class="tb">${pied}</div>` : ''}</aside>`;
  $$('#calque [data-fermer]').forEach(b => b.onclick = () => fermerTiroir());
}
function rendreTiroir(){
  const t = S.tiroir; if (!t) return;
  const s = S.salles[t.sid]; if (!s) return fermerTiroir(true);
  if (t.type === 'poste') return tiroirPoste(t, s);
  if (t.type === 'groupe') return tiroirGroupe(t, s);
  if (t.type === 'reglages') return tiroirReglages(t, s);
  if (t.type === 'qr') return tiroirQR(t, s);
  if (t.type === 'rapide') return tiroirReparationRapide(t.sid, t.xid, true);
}

const champ = (id, lib, val, attrs = '', plein = false) => `<div class="champ ${plein ? 'plein' : ''}"><label for="${id}">${lib}</label><input type="text" id="${id}" value="${esc(val || '')}" ${attrs}></div>`;
function choixType(id, val, avecVide = false){
  return `<div class="champ"><label for="${id}">Type</label><select id="${id}">${avecVide ? '<option value="">— inchangé —</option>' : ''}${TYPES_POSTE.map(([k, l]) => `<option value="${k}" ${val === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>`;
}

function tiroirPoste(t, s){
  if (t.n === 0) return tiroirSalleEq(t, s);
  const p = (s.postes || []).find(x => x.n === t.n); if (!p) return fermerTiroir(true);
  if (!t.brouillon) t.brouillon = structuredClone(p);
  const b = t.brouillon; b.refs ||= {};
  const e = etatPoste(s, p), o = ouverts(s, p.n);
  const hist = (s.sig || []).filter(x => x.p === p.n).sort((a, c) => String(c.d.at(-1)).localeCompare(String(a.d.at(-1)))).slice(0, 20);
  cadre(esc(nomPoste(p)), `${esc(s.nom)} · <span style="color:${COUL[e]};font-weight:700">${LIB_ETAT[e]}</span>`, `
    ${o.length ? `<div><p class="section-t">Problèmes en cours</p><div class="pile" style="gap:10px">${o.map(x => blocReparation(s, x)).join('')}</div></div>` : ''}
    <div><p class="section-t">Identification</p><div class="champs">
      ${champ('p-nom', 'Nom de l’ordinateur', b.nom, 'maxlength="30" placeholder="ex. PC-B12-07"')}
      ${choixType('p-type', b.type)}
      ${champ('p-marque', 'Marque', b.marque, 'maxlength="30" placeholder="ex. Dell, HP, Lenovo" list="l-marques"')}
      ${champ('p-modele', 'Modèle', b.modele, 'maxlength="40" placeholder="ex. OptiPlex 7010"')}
      ${champ('p-inv', 'N° d’inventaire / série', b.inv, 'maxlength="40"')}
      ${champ('p-os', 'Système', b.os, 'maxlength="30" placeholder="ex. Windows 11" list="l-os"')}
      ${champ('p-annee', 'Année de mise en service', b.annee, 'maxlength="4" inputmode="numeric" placeholder="ex. 2023"')}
    </div>${listesSuggestions()}</div>
    <div><p class="section-t">Équipements et références</p>
      <div class="equip" role="group" aria-label="Équipements du poste">${cat().eq.map(x => `<label>${icone(x.ic)}<input type="checkbox" data-eq="${x.k}" ${b.eq.includes(x.k) ? 'checked' : ''}>${esc(x.lib)}</label>`).join('')}</div>
      ${b.eq.length ? `<div class="champs" style="margin-top:12px">${cat().eq.filter(x => b.eq.includes(x.k)).map(x => champ('ref-' + x.k, `Référence ${x.lib.toLowerCase()}`, b.refs[x.k], `maxlength="40" data-ref="${x.k}" placeholder="marque, modèle ou n° de série"`)).join('')}</div>` : ''}
      <p style="margin:10px 0 0;font-size:.82rem;color:var(--muted)">Un équipement manque à la liste ? Ajoutez-le dans « Équipements & pannes ».</p></div>
    <label class="bascule"><span>Hors service<br><small style="color:var(--muted);font-weight:500">Le poste reste visible, grisé, et n’est plus compté comme disponible.</small></span><input type="checkbox" id="p-hs" ${b.hs ? 'checked' : ''}></label>
    <div class="champ plein"><label for="p-note">Note</label><textarea id="p-note" maxlength="200" placeholder="Ex. câble HDMI à changer, poste près de la fenêtre…">${esc(b.note || '')}</textarea></div>
    <div><p class="section-t">Historique du poste</p>${hist.length ? `<ul class="frise">${hist.map(x => `<li class="${x.etat === 'repare' ? 'r' : ''}"><b>${esc(libPanne(s, x.t).lib)}</b>${x.d.length > 1 ? ` · ${x.d.length} fois` : ''}<small>${esc(dateCourte(x.d[0]))}${x.rep ? ` → réparé ${esc(dateCourte(x.rep))}${x.repTxt ? ' : ' + esc(x.repTxt) : ''}` : ' · en cours'}</small></li>`).join('')}</ul>` : '<p class="vide" style="padding:6px">Aucun signalement.</p>'}</div>`,
    `<button class="btn danger petit" id="p-suppr">Supprimer le poste</button><div class="puces"><button class="btn ghost" data-fermer>Annuler</button><button class="btn" id="p-ok">Enregistrer</button></div>`);
  $$('#calque [data-fermer]').forEach(x => x.onclick = () => fermerTiroir());
  const lier = (sel, k) => { const el = $(sel); if (el) el.oninput = el.onchange = () => { b[k] = el.value; }; };
  lier('#p-nom', 'nom'); lier('#p-type', 'type'); lier('#p-marque', 'marque'); lier('#p-modele', 'modele'); lier('#p-inv', 'inv'); lier('#p-os', 'os'); lier('#p-annee', 'annee'); lier('#p-note', 'note');
  $('#p-hs').onchange = () => { b.hs = $('#p-hs').checked; };
  $$('#calque [data-eq]').forEach(c => c.onchange = () => { const k = c.dataset.eq; b.eq = c.checked ? [...new Set([...b.eq, k])] : b.eq.filter(y => y !== k); rendreTiroir(); });
  $$('#calque [data-ref]').forEach(i => i.oninput = () => { b.refs[i.dataset.ref] = i.value; });
  brancherReparations(s);
  $('#p-ok').onclick = async () => {
    const propre = posteNettoye(b);
    try { await modifierSalle(t.sid, d => { d.postes = d.postes.map(x => x.n === p.n ? propre : x); return d; }); toast('Poste enregistré.'); fermerTiroir(); }
    catch (_) { toast('Enregistrement impossible : vérifiez la connexion.'); }
  };
  $('#p-suppr').onclick = async () => {
    if (!confirm(`Supprimer le poste ${p.n} ? Les postes suivants seront renumérotés. L’historique de ce poste sera retiré du suivi.`)) return;
    try {
      await modifierSalle(t.sid, d => {
        d.postes = d.postes.filter(x => x.n !== p.n).map((x, i) => ({ ...x, n: i + 1 }));
        d.sig = (d.sig || []).filter(x => x.p !== p.n).map(x => x.p > p.n ? { ...x, p: x.p - 1 } : x);
        return d;
      });
      toast('Poste supprimé.'); fermerTiroir();
    } catch (_) { toast('Suppression impossible : vérifiez la connexion.'); }
  };
}
function posteNettoye(b){
  const refs = {}; (b.eq || []).forEach(k => { const v = nettoie(b.refs?.[k], 40); if (v) refs[k] = v; });
  return { n: b.n, nom: nettoie(b.nom, 30), type: TYPES_POSTE.some(t => t[0] === b.type) ? b.type : 'fixe', marque: nettoie(b.marque, 30), modele: nettoie(b.modele, 40),
    inv: nettoie(b.inv, 40), os: nettoie(b.os, 30), annee: nettoie(b.annee, 4), eq: (b.eq || []).slice(0, 20), refs, hs: !!b.hs, note: nettoie(b.note, 200) };
}
function listesSuggestions(){
  const ps = sallesChargees().flatMap(s => s.postes || []);
  const l = k => [...new Set(ps.map(p => p[k]).filter(Boolean))];
  return `<datalist id="l-marques">${[...new Set([...l('marque'), 'Dell', 'HP', 'Lenovo', 'Acer', 'Asus', 'Apple', 'Fujitsu'])].map(v => `<option value="${esc(v)}">`).join('')}</datalist>
    <datalist id="l-os">${[...new Set([...l('os'), 'Windows 11', 'Windows 10', 'Ubuntu', 'macOS', 'ChromeOS'])].map(v => `<option value="${esc(v)}">`).join('')}</datalist>`;
}

const ACTIONS_REP = ['Remplacé', 'Rebranché', 'Redémarré', 'Réseau rétabli', 'Mise à jour', 'Envoyé en réparation'];
function blocReparation(s, x){
  const lp = libPanne(s, x.t);
  return `<div class="panne-o" data-bloc="${x.id}"><div class="h"><span class="pic ${x.t === 'hs' ? 'etat-panne' : 'etat-pb'}" style="width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center">${icone(lp.ic)}</span>
    <div class="txt"><b>${esc(lp.lib)}</b>${x.d.length > 1 ? `<span class="rep">×${x.d.length}</span>` : ''}<br><small style="color:var(--muted)">${x.d.map(d => esc(dateCourte(d))).join(' · ')}${x.txt ? ` · « ${esc(x.txt)} »` : ''}</small></div></div>
    <div><p class="section-t" style="margin:2px 0 6px">Suivi</p><div class="actions-rep">${cat().statuts.map(st => `<button class="puce ${x.suivi === st.k ? 'on' : ''}" data-suivi="${s.id}|${x.id}|${st.k}" aria-pressed="${x.suivi === st.k}">${icone(st.ic)}${esc(st.lib)}</button>`).join('')}</div></div>
    <p class="section-t" style="margin:2px 0 -4px">Réparé</p>
    <div class="actions-rep">${ACTIONS_REP.map(a => `<button class="puce" data-act="${x.id}" data-v="${esc(a)}" aria-pressed="false">${esc(a)}</button>`).join('')}</div>
    <div class="puces" style="flex-wrap:nowrap"><label class="sr" for="rt-${x.id}">Ce qui a été fait</label><input id="rt-${x.id}" maxlength="80" placeholder="Ce qui a été fait (facultatif)" style="flex:1;border:1.5px solid var(--line-2);border-radius:10px;padding:8px 10px;min-width:0">
    <button class="btn petit ok" data-valider="${s.id}|${x.id}">${icone('ok')}Réparé</button></div></div>`;
}
async function changerSuivi(sid, xid, k){
  try {
    await modifierSalle(sid, d => { const y = (d.sig || []).find(z => z.id === xid); if (y && y.etat === 'ouvert') { if (y.suivi === k) { delete y.suivi; delete y.suiviLe; } else { y.suivi = k; y.suiviLe = maintenant(); } } return d; });
    toast('Suivi mis à jour.');
  } catch (_) { toast('Enregistrement impossible : vérifiez la connexion.'); }
}
function brancherReparations(){
  $$('#calque [data-suivi]').forEach(b => b.onclick = () => { const [sid, xid, k] = b.dataset.suivi.split('|'); changerSuivi(sid, xid, k); });
  $$('#calque [data-act]').forEach(b => b.onclick = () => { const i = $('#rt-' + b.dataset.act); i.value = b.dataset.v; $$(`#calque [data-act="${b.dataset.act}"]`).forEach(y => y.setAttribute('aria-pressed', y === b)); });
  $$('#calque [data-valider]').forEach(b => b.onclick = () => { const [sid, xid] = b.dataset.valider.split('|'); reparer(sid, xid, $('#rt-' + xid)?.value); });
}
async function reparer(sid, xid, note){
  const n = nettoie(note, 80);
  try {
    await modifierSalle(sid, d => { const y = (d.sig || []).find(z => z.id === xid); if (y && y.etat === 'ouvert') { y.etat = 'repare'; y.rep = maintenant(); if (n) y.repTxt = n; } return d; });
    toast('Réparation enregistrée.');
    if (S.tiroir?.brouillon) { /* garde le brouillon du poste */ }
  } catch (_) { toast('Enregistrement impossible : vérifiez la connexion.'); }
}
function tiroirReparationRapide(sid, xid, redessin){
  const s = S.salles[sid], x = (s?.sig || []).find(y => y.id === xid);
  if (!x || x.etat !== 'ouvert') { if (redessin) fermerTiroir(true); return; }
  const p = x.p === 0 ? { n: 0 } : ((s.postes || []).find(y => y.n === x.p) || { n: x.p });
  S.tiroir = { type: 'rapide', sid, xid };
  cadre(esc(nomPoste(p)), esc(s.nom), `<div class="pile" style="gap:10px">${blocReparation({ ...s, id: sid }, x)}</div>`, '');
  brancherReparations();
  $$('#calque [data-valider]').forEach(b => b.onclick = async () => { await reparer(sid, xid, $('#rt-' + xid)?.value); fermerTiroir(); });
  if (!redessin) setTimeout(() => $('#t-titre')?.focus(), 30);
}

function tiroirSalleEq(t, s){
  const o = ouverts(s, 0);
  cadre('La salle', esc(s.nom), `
    ${o.length ? `<div><p class="section-t">Problèmes en cours</p><div class="pile" style="gap:10px">${o.map(x => blocReparation({ ...s, id: t.sid }, x)).join('')}</div></div>` : '<p class="vide">Aucun problème signalé sur la salle.</p>'}
    <p style="margin:0;color:var(--muted)">Les équipements de la salle se choisissent dans « Réglages de la salle ».</p>`,
    `<span></span><button class="btn" data-reglages="${t.sid}">Réglages de la salle</button>`);
  brancherReparations();
  $('#calque [data-reglages]').onclick = () => ouvrirTiroir({ type: 'reglages', sid: t.sid });
}

function tiroirGroupe(t, s){
  const ns = [...(S.selection || [])].sort((a, b) => a - b);
  t.g ||= { type: '', marque: '', modele: '', os: '', annee: '', hs: '', eq: {} };
  const g = t.g;
  cadre(`Modifier ${ns.length} poste${ns.length > 1 ? 's' : ''}`, `${esc(s.nom)} · postes ${ns.join(', ')}`, `
    <p style="margin:0;color:var(--ink-2)">Seuls les champs remplis sont appliqués. Le reste ne change pas.</p>
    <div class="champs">
      <div class="champ"><label for="g-type">Type</label><select id="g-type"><option value="">— inchangé —</option>${TYPES_POSTE.map(([k, l]) => `<option value="${k}" ${g.type === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      ${champ('g-marque', 'Marque', g.marque, 'maxlength="30" placeholder="— inchangée —" list="l-marques"')}
      ${champ('g-modele', 'Modèle', g.modele, 'maxlength="40" placeholder="— inchangé —"')}
      ${champ('g-os', 'Système', g.os, 'maxlength="30" placeholder="— inchangé —" list="l-os"')}
      ${champ('g-annee', 'Année de mise en service', g.annee, 'maxlength="4" placeholder="— inchangée —"')}
      <div class="champ"><label for="g-hs">Hors service</label><select id="g-hs"><option value="">— inchangé —</option><option value="oui" ${g.hs === 'oui' ? 'selected' : ''}>Oui</option><option value="non" ${g.hs === 'non' ? 'selected' : ''}>Non, en service</option></select></div>
    </div>${listesSuggestions()}
    <div><p class="section-t">Équipements</p><div class="pile" style="gap:6px">${cat().eq.map(x => `<div class="bascule" style="padding:8px 12px"><span style="display:flex;gap:8px;align-items:center">${icone(x.ic)}${esc(x.lib)}</span>
      <select data-geq="${x.k}" aria-label="${esc(x.lib)}" style="border:1.5px solid var(--line-2);border-radius:9px;padding:6px;background:#fff"><option value="">— inchangé —</option><option value="add" ${g.eq[x.k] === 'add' ? 'selected' : ''}>Ajouter</option><option value="del" ${g.eq[x.k] === 'del' ? 'selected' : ''}>Retirer</option></select></div>`).join('')}</div></div>`,
    `<button class="btn ghost" data-fermer>Annuler</button><button class="btn" id="g-ok">Appliquer à ${ns.length} poste${ns.length > 1 ? 's' : ''}</button>`);
  $$('#calque [data-fermer]').forEach(x => x.onclick = () => fermerTiroir());
  ['type', 'marque', 'modele', 'os', 'annee', 'hs'].forEach(k => { const el = $('#g-' + k); el.oninput = el.onchange = () => { g[k] = el.value; }; });
  $$('#calque [data-geq]').forEach(el => el.onchange = () => { g.eq[el.dataset.geq] = el.value; });
  $('#g-ok').onclick = async () => {
    try {
      await modifierSalle(t.sid, d => {
        d.postes = d.postes.map(p => {
          if (!ns.includes(p.n)) return p;
          const q = structuredClone(p);
          if (g.type) q.type = g.type;
          ['marque', 'modele', 'os', 'annee'].forEach(k => { if (nettoie(g[k], 40)) q[k] = nettoie(g[k], k === 'annee' ? 4 : k === 'modele' ? 40 : 30); });
          if (g.hs) q.hs = g.hs === 'oui';
          Object.entries(g.eq).forEach(([k, v]) => { if (v === 'add' && !q.eq.includes(k)) q.eq.push(k); if (v === 'del') { q.eq = q.eq.filter(y => y !== k); if (q.refs) delete q.refs[k]; } });
          return posteNettoye(q);
        });
        return d;
      });
      S.selection = new Set(); toast('Modifications appliquées.'); fermerTiroir();
    } catch (_) { toast('Enregistrement impossible : vérifiez la connexion.'); }
  };
}

function tiroirReglages(t, s){
  t.r ||= { nom: s.nom, colonnes: s.colonnes || 6, nb: (s.postes || []).length, eqSalle: [...(s.eqSalle || [])] };
  const r = t.r;
  cadre('Réglages de la salle', esc(s.nom), `
    <div class="champs">
      ${champ('r-nom', 'Nom de la salle', r.nom, 'maxlength="40"', true)}
      <div class="champ"><label for="r-nb">Nombre de postes</label><input type="number" id="r-nb" min="0" max="${MAX_POSTES}" value="${r.nb}"></div>
      <div class="champ"><label for="r-col">Postes par rangée (plan)</label><input type="number" id="r-col" min="1" max="12" value="${r.colonnes}"></div>
    </div>
    <p style="margin:0;font-size:.85rem;color:var(--muted)">Ajouter des postes reprend la configuration du dernier poste. Réduire le nombre retire les derniers postes.</p>
    <div><p class="section-t">Équipements de la salle</p><div class="equip">${cat().salle.map(x => `<label>${icone(x.ic)}<input type="checkbox" data-es="${x.k}" ${r.eqSalle.includes(x.k) ? 'checked' : ''}>${esc(x.lib)}</label>`).join('')}</div>
      <p style="margin:10px 0 0;font-size:.82rem;color:var(--muted)">Ils apparaissent dans la case « La salle » de la page scannée.</p></div>
    <div><p class="section-t">Autres actions</p><div class="puces"><button class="btn ghost petit" id="r-dup">Dupliquer la salle</button><button class="btn danger petit" id="r-suppr">Retirer la salle</button></div></div>`,
    `<button class="btn ghost" data-fermer>Annuler</button><button class="btn" id="r-ok">Enregistrer</button>`);
  $$('#calque [data-fermer]').forEach(x => x.onclick = () => fermerTiroir());
  $('#r-nom').oninput = () => { r.nom = $('#r-nom').value; };
  $('#r-nb').oninput = () => { r.nb = Math.max(0, Math.min(MAX_POSTES, parseInt($('#r-nb').value, 10) || 0)); };
  $('#r-col').oninput = () => { r.colonnes = Math.max(1, Math.min(12, parseInt($('#r-col').value, 10) || 6)); };
  $$('#calque [data-es]').forEach(c => c.onchange = () => { const k = c.dataset.es; r.eqSalle = c.checked ? [...new Set([...r.eqSalle, k])] : r.eqSalle.filter(y => y !== k); });
  $('#r-ok').onclick = async () => {
    const nom = nettoie(r.nom, 40); if (!nom) return toast('Le nom de la salle est obligatoire.');
    const avant = (s.postes || []).length;
    if (r.nb < avant && !confirm(`Retirer les postes ${r.nb + 1} à ${avant} et leur historique ?`)) return;
    try {
      await modifierSalle(t.sid, d => {
        d.nom = nom; d.colonnes = r.colonnes; d.eqSalle = r.eqSalle;
        const modele = d.postes.at(-1) || posteVierge(0);
        d.postes = d.postes.slice(0, r.nb); while (d.postes.length < r.nb) d.postes.push({ ...posteVierge(d.postes.length + 1, modele), refs: {} });
        d.sig = (d.sig || []).filter(x => x.p <= r.nb);
        d.cat = catPourSalle(d);
        return d;
      });
      if (listeSalles().find(x => x.id === t.sid)?.nom !== nom) await modifierParc(p => { p.salles = p.salles.map(x => x.id === t.sid ? { ...x, nom } : x); return p; });
      toast('Réglages enregistrés.'); fermerTiroir();
    } catch (_) { toast('Enregistrement impossible : vérifiez la connexion.'); }
  };
  $('#r-dup').onclick = async () => {
    try { const id = await creerSalle(nettoie(s.nom + ' (copie)', 40), (s.postes || []).map(p => ({ ...p, hs: false })), s.colonnes, s.eqSalle); fermerTiroir(true); aller('salle:' + id); toast('Salle dupliquée (sans l’historique).'); }
    catch (_) { toast('Duplication impossible : vérifiez la connexion.'); }
  };
  $('#r-suppr').onclick = async () => {
    if (!confirm(`Retirer « ${s.nom} » du tableau de bord ? Son QR code ne sera plus suivi.`)) return;
    try { await modifierParc(p => { p.salles = p.salles.filter(x => x.id !== t.sid); return p; }); fermerTiroir(true); aller('tdb'); toast('Salle retirée.'); }
    catch (_) { toast('Impossible : vérifiez la connexion.'); }
  };
}

/* ═════════ Nouvelle salle ═════════ */
async function creerSalle(nom, postes, colonnes, eqSalle){
  if (listeSalles().length >= MAX_SALLES) throw new Error('trop');
  const id = 'salle_' + aleatoire(12);
  const d = { id, type: 'salle', nom, colonnes: colonnes || 6, postes, eqSalle: eqSalle || [], sig: [], majLe: maintenant(), version: 1 };
  d.cat = catPourSalle(d);
  await avecDelai(FS.setDoc(FS.doc(db, COL_SALLE, id), d));
  await modifierParc(p => { p.salles = [...(p.salles || []), { id, nom }]; return p; });
  return id;
}
function vueNouvelle(){
  const eqDef = ['uc', 'ecran', 'clavier', 'souris'];
  return `<div class="tete"><div><h1>Nouvelle salle</h1><p>Décrivez la salle une fois : vous pourrez tout modifier ensuite, poste par poste.</p></div></div>
  <form class="carte" id="f-nouvelle" autocomplete="off" style="max-width:780px"><div class="pile">
    <div class="champs">
      ${champ('n-nom', 'Nom de la salle', '', 'maxlength="40" placeholder="ex. Salle B12" required', true)}
      <div class="champ"><label for="n-nb">Nombre d’ordinateurs</label><input type="number" id="n-nb" min="1" max="${MAX_POSTES}" value="16" required></div>
      <div class="champ"><label for="n-col">Postes par rangée (plan)</label><input type="number" id="n-col" min="1" max="12" value="6"></div>
    </div>
    <div><p class="section-t">Les ordinateurs (modèle commun)</p><div class="champs">
      ${choixType('n-type', 'fixe')}
      ${champ('n-marque', 'Marque', '', 'maxlength="30" placeholder="ex. Dell" list="l-marques"')}
      ${champ('n-modele', 'Modèle', '', 'maxlength="40" placeholder="ex. OptiPlex 7010"')}
      ${champ('n-os', 'Système', '', 'maxlength="30" placeholder="ex. Windows 11" list="l-os"')}
    </div>${listesSuggestions()}</div>
    <div><p class="section-t">Chaque poste est équipé de</p><div class="equip">${cat().eq.map(x => `<label>${icone(x.ic)}<input type="checkbox" name="n-eq" value="${x.k}" ${eqDef.includes(x.k) ? 'checked' : ''}>${esc(x.lib)}</label>`).join('')}</div></div>
    <div><p class="section-t">Équipements de la salle</p><div class="equip">${cat().salle.map(x => `<label>${icone(x.ic)}<input type="checkbox" name="n-es" value="${x.k}" ${x.k === 'reseau' ? 'checked' : ''}>${esc(x.lib)}</label>`).join('')}</div></div>
    <div class="puces" style="justify-content:flex-end"><button class="btn" id="n-ok">${icone('ok')}Créer la salle</button></div>
  </div></form>`;
}

/* ═════════ Catalogue ═════════ */
function vueCatalogue(){
  const c = S.brouillonCat ||= structuredClone(cat());
  c.statuts ||= CATALOGUE_DEFAUT().statuts;
  const bloc = (cle, titre, aide, avecOn) => `<section class="carte"><h2>${titre}<small>${c[cle].length}</small></h2><p style="margin:-6px 0 12px;color:var(--muted);font-size:.88rem">${aide}</p>
    ${c[cle].map((x, i) => `<div class="cat-l"><span class="ic-ap">${icone(x.ic)}</span>
      <span style="display:flex;gap:8px;min-width:0"><label class="sr" for="c-${cle}-${i}">Libellé</label><input type="text" id="c-${cle}-${i}" data-cl="${cle}|${i}" value="${esc(x.lib)}" maxlength="30">
      <label class="sr" for="ci-${cle}-${i}">Pictogramme</label><select id="ci-${cle}-${i}" data-ci="${cle}|${i}">${ICONES.map(k => `<option value="${k}" ${x.ic === k ? 'selected' : ''}>${NOMS_ICONES[k] || k}</option>`).join('')}</select></span>
      ${avecOn ? `<label class="bascule" style="padding:4px 8px;background:none" title="Proposé aux enseignants"><span class="sr">Proposé aux enseignants</span><input type="checkbox" data-con="${i}" ${x.on ? 'checked' : ''}></label>` : '<span></span>'}
      <button class="suppr" data-csup="${cle}|${i}" aria-label="Supprimer ${esc(x.lib)}">×</button></div>`).join('')}
    <button class="btn sec petit" style="margin-top:12px" data-cadd="${cle}">+ Ajouter</button></section>`;
  return `<div class="tete"><div><h1>Équipements & pannes</h1><p>Ce que vous suivez, et ce que les enseignants peuvent cocher. Valable pour toutes les salles.</p></div>
    <div class="puces"><button class="btn ghost" id="cat-annuler">Annuler</button><button class="btn" id="cat-ok">${icone('ok')}Enregistrer</button></div></div>
  <div class="pile">
    ${bloc('eq', 'Équipements des postes', 'Unité centrale, écran, clavier, souris, casque… Chaque poste peut avoir sa propre référence pour chacun. L’enseignant les voit dans « Il manque ou ne marche pas ».', false)}
    ${bloc('pannes', 'Problèmes proposés', 'Les problèmes généraux d’un poste. Le bouton bleu indique ceux qui sont proposés aux enseignants.', true)}
    ${bloc('salle', 'Équipements de salle', 'Vidéoprojecteur, imprimante… à cocher ensuite dans les réglages de chaque salle.', false)}
    ${bloc('statuts', 'Étapes de suivi', 'Ce que vous indiquez sur une panne avant qu’elle soit réparée : « Pris en compte », « En attente de pièce »… Ajoutez, renommez ou supprimez à volonté.', false)}
    <section class="carte"><h2>Ce que voient les collègues qui scannent</h2>
      <label class="bascule"><span>Montrer l’état des ordinateurs<br><small style="color:var(--muted);font-weight:500">Activé : en scannant, ils voient quels postes fonctionnent aujourd’hui et où en est chaque panne. Désactivé : ils signalent seulement.</small></span><input type="checkbox" id="c-voir" ${c.voir !== false ? 'checked' : ''}></label></section>
  </div>`;
}
async function enregistrerCatalogue(){
  const c = S.brouillonCat;
  for (const cle of ['eq', 'pannes', 'salle', 'statuts']) { c[cle] = c[cle].map(x => ({ ...x, lib: nettoie(x.lib, 30) })).filter(x => x.lib).slice(0, 30); }
  try {
    await modifierParc(p => { p.cat = c; return p; });
    for (const x of listeSalles()) await modifierSalle(x.id, d => { d.cat = catPourSalle(d, c); d.postes = (d.postes || []).map(p => ({ ...p, eq: (p.eq || []).filter(k => c.eq.some(e => e.k === k)) })); d.eqSalle = (d.eqSalle || []).filter(k => c.salle.some(e => e.k === k)); return d; });
    S.brouillonCat = null; toast('Catalogue enregistré dans toutes les salles.'); rendre();
  } catch (_) { toast('Enregistrement impossible : vérifiez la connexion.'); }
}

/* ═════════ QR codes ═════════ */
function tiroirQR(t, s){
  const u = urlSalle(t.sid);
  cadre('QR code de la salle', esc(s.nom), `<div class="qr-c" style="box-shadow:none;padding:0"><div class="qr" style="width:240px;height:240px">${svgQR(u)}</div>
    <p style="margin:0;color:var(--ink-2)">À imprimer et à coller près des ordinateurs. Les collègues scannent, cochent, c’est envoyé.</p><small>${esc(u)}</small></div>`,
    `<button class="btn ghost" id="qr-copier">Copier le lien</button><button class="btn" id="qr-imprimer">${icone('imprimante')}Imprimer l’affiche</button>`);
  $('#qr-imprimer').onclick = () => imprimer(t.sid);
  $('#qr-copier').onclick = async () => { try { await navigator.clipboard.writeText(u); toast('Lien copié.'); } catch (_) { toast('Copie impossible.'); } };
}
function svgQR(texte){
  if (typeof qrcode !== 'function') return '<p class="err">QR code indisponible (connexion).</p>';
  const q = qrcode(0, 'M'); q.addData(texte); q.make();
  return q.createSvgTag({ cellSize: 4, margin: 2, scalable: true, alt: { text: 'QR code de la salle' } });
}
function vueQR(){
  const ls = listeSalles();
  return `<div class="tete"><div><h1>QR codes</h1><p>Un QR code par salle. Imprimez-le et collez-le près des ordinateurs : c’est tout.</p></div>
    ${ls.length ? `<button class="btn" data-imprimer="tout">${icone('imprimante')}Imprimer toutes les affiches</button>` : ''}</div>
  ${ls.length ? `<div class="qr-grille">${ls.map(x => { const nom = S.salles[x.id]?.nom || x.nom, u = urlSalle(x.id); return `<div class="qr-c">
    <b style="font-size:1.1rem">${esc(nom)}</b><div class="qr">${svgQR(u)}</div><small>${esc(u)}</small>
    <div class="puces" style="justify-content:center"><button class="btn petit" data-imprimer="${x.id}">${icone('imprimante')}Imprimer</button><button class="btn petit sec" data-copier="${esc(u)}">Copier le lien</button><a class="btn petit ghost" href="${esc(u)}" target="_blank" rel="noopener">Tester</a></div></div>`; }).join('')}</div>` : '<div class="carte vide">Créez d’abord une salle.</div>'}`;
}
function imprimer(quoi){
  const ls = listeSalles().filter(x => quoi === 'tout' || x.id === quoi);
  $('#impression').innerHTML = ls.map(x => `<div class="affiche"><div class="sur">Salle informatique</div><h1>${esc(S.salles[x.id]?.nom || x.nom)}</h1>
    <div class="qr">${svgQR(urlSalle(x.id))}</div><p>Un ordinateur ne marche pas ?<br>Scannez, cochez, c’est envoyé.</p>
    <p class="petit">Le jour, la salle et l’heure s’affichent tout seuls. Aucun compte, aucun nom.</p></div>`).join('');
  setTimeout(() => window.print(), 50);
}

/* ═════════ Sauvegarde & paramètres ═════════ */
function exportComplet(){
  const salles = {}; listeSalles().forEach(x => { if (S.salles[x.id]) salles[x.id] = S.salles[x.id]; });
  return { format: 'parc-informatique', version: 1, exporteLe: maintenant(), parc: S.parc, salles };
}
/* Copie de secours automatique sur cet appareil, à chaque changement : rien ne se perd. */
let secoursT = null;
function copieSecours(){ clearTimeout(secoursT); secoursT = setTimeout(() => { try { localStorage.setItem(K_SECOURS, JSON.stringify(exportComplet())); } catch (_) { } }, 400); }
function telecharger(nom, contenu, type){
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([contenu], { type })); a.download = nom;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
const jourFichier = () => isoJour(new Date());
function inventaireCSV(){
  const cel = v => { const t = String(v ?? ''); return /[;"\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; };
  const eqLib = k => (cat().eq.find(e => e.k === k) || {}).lib || k;
  const lignes = [['Salle', 'Poste', 'Nom', 'Type', 'Marque', 'Modèle', 'N° inventaire / série', 'Système', 'Année', 'Équipements', 'Références', 'État', 'Problèmes en cours', 'Note']];
  sallesChargees().forEach(s => (s.postes || []).forEach(p => {
    lignes.push([s.nom, p.n, p.nom, typeLib(p.type), p.marque, p.modele, p.inv, p.os, p.annee, (p.eq || []).map(eqLib).join(', '),
      Object.entries(p.refs || {}).map(([k, v]) => `${eqLib(k)} : ${v}`).join(' | '), LIB_ETAT[etatPoste(s, p)],
      ouverts(s, p.n).map(x => libPanne(s, x.t).lib + (x.d.length > 1 ? ` (×${x.d.length})` : '')).join(' | '), p.note]);
  }));
  return '﻿' + lignes.map(l => l.map(cel).join(';')).join('\r\n');
}
async function restaurer(fichier){
  let d;
  try { d = JSON.parse(await fichier.text()); } catch (_) { return toast('Ce fichier n’est pas une sauvegarde lisible.'); }
  if (d?.format !== 'parc-informatique' || !d.parc || typeof d.salles !== 'object') return toast('Ce fichier n’est pas une sauvegarde du parc informatique.');
  const ids = Object.keys(d.salles).filter(id => RE_SALLE.test(id));
  if (!confirm(`Restaurer la sauvegarde du ${dateCourte(d.exporteLe)} ? ${ids.length} salle(s). Les salles de la sauvegarde reprendront exactement leur état d’alors ; les autres ne changent pas.`)) return;
  const champs = ['nom', 'colonnes', 'postes', 'eqSalle', 'cat', 'sig'];
  const vide = k => (k === 'sig' || k === 'postes' || k === 'eqSalle') ? [] : k === 'colonnes' ? 6 : k === 'cat' ? {} : 'Salle';
  try {
    for (const id of ids) {
      const src = d.salles[id], ref = FS.doc(db, COL_SALLE, id);
      const existe = (await FS.getDoc(ref)).exists();
      if (existe) await modifierSalle(id, x => { champs.forEach(k => { if (src[k] !== undefined) x[k] = src[k]; }); return x; });
      else { const n = { id, type: 'salle', majLe: maintenant(), version: 1 }; champs.forEach(k => { n[k] = src[k] ?? vide(k); }); await FS.setDoc(ref, n); }
    }
    await modifierParc(p => {
      p.nom = d.parc.nom || p.nom; p.cat = d.parc.cat || p.cat;
      const garde = (p.salles || []).filter(x => !ids.includes(x.id));
      p.salles = [...(d.parc.salles || []).filter(x => ids.includes(x.id)), ...garde].slice(0, MAX_SALLES);
      return p;
    });
    toast('Sauvegarde restaurée.');
  } catch (_) { toast('Restauration interrompue : vérifiez la connexion, puis recommencez.'); }
}
function vueParam(){
  let secours = null; try { secours = JSON.parse(localStorage.getItem(K_SECOURS) || 'null'); } catch (_) { }
  const nb = sallesChargees().reduce((n, s) => n + (s.postes || []).length, 0);
  return `<div class="tete"><div><h1>Sauvegarde</h1><p>Tout est enregistré en ligne automatiquement, à chaque modification. Ici, vous gardez en plus une copie.</p></div></div>
  <div class="pile" style="max-width:720px">
    <section class="carte"><h2>Télécharger<small>${listeSalles().length} salle(s) · ${nb} postes</small></h2>
      <div class="pile" style="gap:10px">
        <div class="ligne"><span class="pic etat-ok">${icone('logiciel')}</span><span class="txt"><b>Sauvegarde complète (JSON)</b><small>Salles, postes, références, catalogue, signalements et réparations. Permet de tout restaurer.</small></span><button class="btn petit" id="ex-json">Télécharger</button></div>
        <div class="ligne"><span class="pic etat-pb">${icone('clavier')}</span><span class="txt"><b>Inventaire pour tableur (CSV)</b><small>Un poste par ligne, à ouvrir dans Excel ou Numbers.</small></span><button class="btn petit sec" id="ex-csv">Télécharger</button></div>
      </div></section>
    <section class="carte"><h2>Restaurer une sauvegarde</h2>
      <p style="margin:0 0 12px;color:var(--ink-2)">Choisissez un fichier JSON téléchargé ici. Les salles qu’il contient reprennent leur état ; les autres ne changent pas.</p>
      <label class="btn ghost" style="cursor:pointer">${icone('logiciel')}Choisir un fichier…<input type="file" id="im-json" accept="application/json,.json" class="sr"></label></section>
    <section class="carte"><h2>Copie de secours de cet appareil</h2>
      <p style="margin:0 0 12px;color:var(--ink-2)">${secours ? `Mise à jour automatiquement : dernière copie ${esc(dateCourte(secours.exporteLe))}.` : 'Elle se crée automatiquement dès la première salle.'}</p>
      ${secours ? `<button class="btn petit ghost" id="ex-secours">Télécharger la copie de secours</button>` : ''}</section>
    <form class="carte" id="f-param"><h2>Nom de l’espace</h2><div class="puces" style="flex-wrap:nowrap"><label class="sr" for="pa-nom">Nom de l’espace</label><input id="pa-nom" maxlength="40" value="${esc(S.parc.nom || '')}" style="flex:1;border:1.5px solid var(--line-2);border-radius:11px;padding:10px 12px;min-width:0"><button class="btn">Enregistrer</button></div></form>
  </div>`;
}

/* ═════════ Branchements ═════════ */
function brancher(){
  const c = $('#contenu'); if (!c) return;
  c.querySelectorAll('[data-per]').forEach(b => b.onclick = () => { S.periode = b.dataset.per; garder(K_PER, S.periode); rendre(); });
  const dp = $('#depuis'); if (dp) dp.onchange = () => { if (dp.value) { S.periode = 'date'; S.depuis = dp.value; rendre(); } };
  const h = $('#histo'); if (h) {
    const bulle = $('#bulle');
    h.querySelectorAll('[data-bulle]').forEach(g => {
      g.onmouseenter = e => { bulle.hidden = false; bulle.textContent = g.dataset.bulle; };
      g.onmousemove = e => { const r = h.getBoundingClientRect(); bulle.style.left = (e.clientX - r.left) + 'px'; bulle.style.top = (e.clientY - r.top) + 'px'; };
      g.onmouseleave = () => { bulle.hidden = true; };
    });
  }
  c.querySelectorAll('[data-reparer]').forEach(b => b.onclick = () => { const [sid, xid] = b.dataset.reparer.split('|'); tiroirReparationRapide(sid, xid); });
  c.querySelectorAll('[data-poste]').forEach(b => b.onclick = () => { const [sid, n] = b.dataset.poste.split('|'); ouvrirTiroir({ type: 'poste', sid, n: +n }); });
  c.querySelectorAll('[data-reglages]').forEach(b => b.onclick = () => ouvrirTiroir({ type: 'reglages', sid: b.dataset.reglages }));
  c.querySelectorAll('[data-qr]').forEach(b => b.onclick = () => ouvrirTiroir({ type: 'qr', sid: b.dataset.qr }));
  c.querySelectorAll('[data-humeur]').forEach(b => b.onclick = () => { garder(K_HUMEUR, JSON.stringify({ jour: isoJour(new Date()), v: b.dataset.humeur })); rendre(true); });
  c.querySelectorAll('[data-imprimer]').forEach(b => b.onclick = () => imprimer(b.dataset.imprimer));
  c.querySelectorAll('[data-copier]').forEach(b => b.onclick = async () => { try { await navigator.clipboard.writeText(b.dataset.copier); toast('Lien copié.'); } catch (_) { toast('Copie impossible.'); } });
  /* Salle : plan */
  if (S.vue.startsWith('salle:')) {
    const sid = S.vue.slice(6);
    $('#mode-sel')?.addEventListener('click', () => { S.selection = S.selection ? null : new Set(); rendre(true); });
    $('#sel-tout')?.addEventListener('click', () => { const ps = S.salles[sid]?.postes || []; S.selection = S.selection.size === ps.length ? new Set() : new Set(ps.map(p => p.n)); rendre(true); });
    $('#sel-modif')?.addEventListener('click', () => ouvrirTiroir({ type: 'groupe', sid }));
    c.querySelectorAll('[data-pc]').forEach(b => b.onclick = () => {
      const n = +b.dataset.pc;
      if (S.selection) { S.selection.has(n) ? S.selection.delete(n) : S.selection.add(n); rendre(true); $(`[data-pc="${n}"]`)?.focus(); }
      else ouvrirTiroir({ type: 'poste', sid, n });
    });
  }
  /* Nouvelle salle */
  const fn = $('#f-nouvelle');
  if (fn) fn.onsubmit = async e => {
    e.preventDefault();
    const nom = nettoie($('#n-nom').value, 40), nb = Math.max(1, Math.min(MAX_POSTES, parseInt($('#n-nb').value, 10) || 1));
    if (!nom) return;
    const modele = { type: $('#n-type').value, marque: nettoie($('#n-marque').value, 30), modele: nettoie($('#n-modele').value, 40), os: nettoie($('#n-os').value, 30), eq: $$('[name=n-eq]:checked').map(x => x.value) };
    $('#n-ok').disabled = true;
    try { const id = await creerSalle(nom, Array.from({ length: nb }, (_, i) => posteVierge(i + 1, modele)), Math.max(1, Math.min(12, parseInt($('#n-col').value, 10) || 6)), $$('[name=n-es]:checked').map(x => x.value)); toast(`« ${nom} » est créée.`); aller('salle:' + id); }
    catch (_) { $('#n-ok').disabled = false; toast(listeSalles().length >= MAX_SALLES ? `${MAX_SALLES} salles au maximum.` : 'Création impossible : vérifiez la connexion.'); }
  };
  /* Catalogue */
  if (S.vue === 'catalogue') {
    const cb = S.brouillonCat;
    c.querySelectorAll('[data-cl]').forEach(i => i.oninput = () => { const [k, j] = i.dataset.cl.split('|'); cb[k][+j].lib = i.value; });
    c.querySelectorAll('[data-ci]').forEach(i => i.onchange = () => { const [k, j] = i.dataset.ci.split('|'); cb[k][+j].ic = i.value; rendre(true); });
    c.querySelectorAll('[data-con]').forEach(i => i.onchange = () => { cb.pannes[+i.dataset.con].on = i.checked; });
    c.querySelectorAll('[data-csup]').forEach(b => b.onclick = () => { const [k, j] = b.dataset.csup.split('|'); if (confirm(`Supprimer « ${cb[k][+j].lib} » ? Il disparaîtra de tous les postes après l’enregistrement.`)) { cb[k].splice(+j, 1); rendre(true); } });
    c.querySelectorAll('[data-cadd]').forEach(b => b.onclick = () => { const k = b.dataset.cadd; cb[k].push({ k: 'x' + aleatoire(6), lib: '', ic: k === 'salle' ? 'salle' : k === 'statuts' ? 'outil' : 'materiel', ...(k === 'pannes' ? { on: true } : {}) }); rendre(true); const ins = c.querySelectorAll(`[data-cl^="${k}|"]`); setTimeout(() => $$(`[data-cl^="${k}|"]`).at(-1)?.focus(), 0); });
    const cv = $('#c-voir'); if (cv) cv.onchange = () => { cb.voir = cv.checked; };
    $('#cat-ok').onclick = enregistrerCatalogue;
    $('#cat-annuler').onclick = () => { S.brouillonCat = null; rendre(); };
  }
  /* Paramètres */
  const fp = $('#f-param'); if (fp) fp.onsubmit = async e => { e.preventDefault(); const nom = nettoie($('#pa-nom').value, 40) || 'Parc informatique'; try { await modifierParc(p => { p.nom = nom; return p; }); toast('Nom enregistré.'); } catch (_) { toast('Impossible : vérifiez la connexion.'); } };
  $('#sortir')?.addEventListener('click', () => { if (confirm('Se déconnecter de cet appareil ? Il faudra retaper le code.')) sortir(); });
  $('#ex-json')?.addEventListener('click', () => telecharger('parc-informatique-' + jourFichier() + '.json', JSON.stringify(exportComplet(), null, 2), 'application/json'));
  $('#ex-csv')?.addEventListener('click', () => telecharger('inventaire-ordinateurs-' + jourFichier() + '.csv', inventaireCSV(), 'text/csv;charset=utf-8'));
  $('#ex-secours')?.addEventListener('click', () => { try { telecharger('parc-informatique-secours-' + jourFichier() + '.json', JSON.stringify(JSON.parse(localStorage.getItem(K_SECOURS)), null, 2), 'application/json'); } catch (_) { toast('Copie de secours illisible.'); } });
  $('#im-json')?.addEventListener('change', e => { const f = e.target.files?.[0]; if (f) restaurer(f); e.target.value = ''; });
}

let tt = null;
function toast(m){ const t = $('#toast'); t.innerHTML = `<div class="toast">${esc(m)}</div>`; clearTimeout(tt); tt = setTimeout(() => { t.innerHTML = ''; }, 3500); }
document.addEventListener('keydown', e => { if (e.key === 'Escape' && S.tiroir) fermerTiroir(); });

if (erreurFS) $('#racine').innerHTML = '<div class="acces"><div class="boite"><p class="err">Pas de connexion au serveur. Rechargez la page.</p></div></div>';
else entrer(S.code || ESPACE_PAR_DEFAUT);
