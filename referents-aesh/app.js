/* ═══════════════════════════════════════════════════════════════════
   Référents de pôle AESH — application (coordination-pedagogie/referents-aesh/)
   Humeur + pensée → code du pôle → Accueil · Mes AESH · Emploi du temps ·
   Vue d'ensemble · Besoins · Messages · Exporter.
   Firestore : coordination_referents_aesh (pole_, aesh_, place_, abs_, reunion_, msg_, hist_)
               coordination_estimation_aesh (lecture : cadre et cours estimés par les enseignants)
   Rien ne s'efface : un retrait est un statut ou une date de fin, et chaque écriture laisse une copie hist_.
   ═══════════════════════════════════════════════════════════════════ */
import * as K from './calculs.js?v=2026-09-17a';
import { POLES, pole, EQUIPES_DEPART, COLLECTION, COL_ESTIMATION, couleurMatiere, HUMEURS, PENSEES } from './donnees.js?v=2026-09-17a';
import * as AV from './avatars.js?v=2026-09-17a';

const DELAI = 15000;
const K_SESSION = 'referents-aesh-session-v1', K_HUMEUR = 'referents-aesh-humeur', K_CACHE = 'referents-aesh-cache-v1', K_LU = 'referents-aesh-messages-lus',
  K_FOND = 'referents-aesh-fond', K_SIGN = 'referents-aesh-signature', K_PENSEES = 'referents-aesh-pensees';
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const lsLit = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v ?? d; } catch (e) { return d; } };
const lsEcrit = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
const alea = () => { const a = 'abcdefghijklmnopqrstuvwxyz0123456789', r = crypto.getRandomValues(new Uint8Array(10)); return [...r].map(x => a[x % 36]).join(''); };
const avecDelai = p => { let t; return Promise.race([p, new Promise((_, rej) => { t = setTimeout(() => rej(Object.assign(new Error('delai'), { code: 'delai' })), DELAI); })]).finally(() => clearTimeout(t)); };
const typeErreur = e => { const t = `${(e && e.code) || ''} ${(e && e.message) || ''}`; return /permission|insufficient/i.test(t) ? 'refus' : /delai/.test(t) ? 'delai' : 'horsligne'; };
const messageErreur = e => ({ refus: 'Non enregistré : espace pas encore ouvert par la coordination.', delai: 'Pas de réponse du serveur. Vérifiez dans un instant.', horsligne: 'Non enregistré : pas de connexion. Réessayez.' })[typeErreur(e)];
const anneeScolaire = (d = new Date()) => { const y = d.getFullYear(); return d.getMonth() >= 7 ? `${y}-${y + 1}` : `${y - 1}-${y}`; };
const nomPole = id => (pole(id) || { nom: id }).nom;
const heureFr = iso => { const d = new Date(iso); if (isNaN(d)) return ''; const auj = K.isoLocal(), j = K.isoLocal(d); return `${j === auj ? 'aujourd’hui' : K.dateCourte(j)} · ${d.getHours()} h ${K.z2(d.getMinutes())}`; };
const nombre = v => v === null || v === undefined || v === '' || !Number.isFinite(+v) ? null : +v;
const hOu = v => nombre(v) == null ? '—' : K.fmtH(v);
const CRENEAUX_H = []; for (let m = 7 * 60 + 30; m <= 18 * 60; m += 30) CRENEAUX_H.push(K.hDe(m));

export async function demarrer({ FS, db, erreur }) {
  const S = {
    annee: anneeScolaire(), edt: null, C: null, docs: new Map(), etat: 'chargement', est: [], cadreEst: null, estEtat: 'chargement',
    session: lsLit(K_SESSION, null), vu: null, route: { e: 'humeur', p: {} }, lundi: null, feuille: null, menu: false, toast: null,
    code: '', codeMsg: '', codeErr: false, form: null, exp: { quoi: 'pole', ids: [], format: 'pdf' }, msgBrouillon: '', ignorePop: 0, n: 0, flash: null, envoi: false
  };
  const racine = document.getElementById('app');
  document.documentElement.dataset.fond = lsLit(K_FOND, 'clair');

  /* ─────────── données ─────────── */
  try { S.edt = await (await fetch('./edt-lycee.json?v=2026-09-17a')).json(); }
  catch (e) { racine.innerHTML = '<p style="padding:30px;text-align:center">Les emplois du temps n’ont pas pu se charger. Vérifiez la connexion puis rechargez la page.</p>'; return; }
  S.C = K.creerCalendrier(S.edt);
  S.lundi = semaineParDefaut();
  const cache = lsLit(K_CACHE, null);
  if (cache && cache.annee === S.annee && Array.isArray(cache.docs)) cache.docs.forEach(d => d && d.id && S.docs.set(d.id, d));
  let I = null, versionI = -1, versionDocs = 0;
  const idx = () => { if (versionI !== versionDocs) { I = K.indexer([...S.docs.values()], EQUIPES_DEPART); versionI = versionDocs; } return I; };
  const ctx = () => ({ C: S.C, edt: S.edt, I: idx(), estimations: S.est, nomPole, aujourdhui: K.isoLocal(), annee: S.annee });

  function semaineParDefaut() {
    const auj = K.isoLocal(), js = K.jourSemaine(auj);
    return js >= 5 ? K.ajoute(K.lundiDe(auj), 7) : K.lundiDe(auj);
  }
  function ecouter() {
    if (erreur || !FS) { S.etat = 'horsligne'; return; }
    try {
      FS.onSnapshot(FS.query(FS.collection(db, COLLECTION), FS.where('annee', '==', S.annee)), snap => {
        const m = new Map(); snap.forEach(d => { const x = d.data() || {}; if (x.type !== 'hist') m.set(x.id || d.id, { ...x, id: x.id || d.id }); });
        S.docs = m; versionDocs++; S.etat = 'ok';
        lsEcrit(K_CACHE, { annee: S.annee, docs: [...m.values()] });
        verifierSession(); rendre({ donnees: true });
      }, err => { S.etat = typeErreur(err) === 'refus' ? 'refus' : 'horsligne'; rendre({ donnees: true }); });
    } catch (e) { S.etat = 'horsligne'; }
  }
  let estEcoute = false;
  function ecouterEstimations() {
    if (estEcoute || erreur || !FS) return; estEcoute = true;
    try {
      FS.onSnapshot(FS.query(FS.collection(db, COL_ESTIMATION), FS.where('annee', '==', S.annee)), snap => {
        let cadre = null; const l = [];
        snap.forEach(d => { const x = d.data() || {}; if (x.type === 'cadre' && (x.id || d.id) === 'cadre_' + S.annee) cadre = x; else if (x.type === 'cours' && x.statut === 'active') l.push({ ...x, id: x.id || d.id }); });
        S.cadreEst = cadre && cadre.periode ? cadre.periode : null;
        S.est = S.cadreEst ? l.filter(x => !x.periode || x.periode.debut === S.cadreEst.debut) : l;
        S.estEtat = 'ok'; rendre({ donnees: true });
      }, () => { S.estEtat = 'horsligne'; rendre({ donnees: true }); });
    } catch (e) { S.estEtat = 'horsligne'; }
  }
  const codeDe = id => { const d = S.docs.get('pole_' + id); return d && /^\d{4}$/.test(d.code || '') ? d.code : pole(id).codeDepart; };
  function verifierSession() {
    if (!S.session || S.etat !== 'ok') return;
    if (codeDe(S.session.pole) !== S.session.code) {
      S.session = null; lsEcrit(K_SESSION, null);
      if (!['humeur', 'code'].includes(S.route.e)) { S.route = { e: 'code', p: {} }; S.codeMsg = 'Le code du pôle a changé. Tapez le nouveau code.'; history.replaceState({ e: 'code', p: {}, n: S.n }, ''); }
    }
  }
  const P = () => pole(S.vu || (S.session && S.session.pole)) || POLES[0];
  /* « Mon emploi du temps est complet jusqu'au … » : porté par le document du pôle. Périmé une fois la date passée. */
  const poleComplet = pid => { const d = S.docs.get('pole_' + pid), c = d && d.complet; return c && K.RE_DATE.test(c.jusquau || '') && c.jusquau >= K.isoLocal() ? c : null; };
  const avatarDe = pid => { const d = S.docs.get('pole_' + pid); return d && d.avatar ? AV.normaliser(d.avatar) : null; };
  const humeurDe = pid => { const d = S.docs.get('pole_' + pid), h = d && d.humeur; return h && h.jour === K.isoLocal() && AV.EXPRESSIONS[h.i] ? AV.EXPRESSIONS[h.i] : null; };
  /* Petit avatar (ou pastille du pôle tant qu'il n'est pas choisi). */
  const avatarHtml = (pid, taille, o = {}) => { const a = avatarDe(pid), q = pole(pid) || POLES[0]; return a ? AV.svgAvatar(a, { humeur: o.humeur === undefined ? humeurDe(pid) : o.humeur, taille, label: `référent ${q.nom}`, classe: o.classe }) : `<span class="sigle" style="--pole:${q.couleur};width:${taille}px;height:${taille}px;font-size:${Math.max(9, taille * .3)}px" aria-label="référent ${esc(q.nom)}">${esc(q.nom.replace(/[^A-Z]/g, '').slice(0, 3) || q.nom.slice(0, 2))}</span>`; };
  /* Le document du pôle regroupe code, « complet », avatar et humeur : on écrit toujours l'ensemble. */
  const ecrirePole = (pid, patch) => { const d = S.docs.get('pole_' + pid) || {}; const doc = { id: 'pole_' + pid, type: 'pole', pole: pid, code: codeDe(pid), complet: d.complet || null, avatar: d.avatar || null, humeur: d.humeur || null, ...(d.creeLe ? { creeLe: d.creeLe } : {}), ...patch }; return ecrire(doc); };
  const etatPole = pid => { const c = poleComplet(pid); return c ? `complet jusqu’au ${K.jjmm(c.jusquau)}` : 'saisie en cours'; };
  /* Une alerte lisible, avec l'explication et le bouton pour écrire à l'autre référent. */
  function carteAlerte(a, x, i, prefix) {
    const autres = [...new Set((x.poles || []).filter(q => q !== P().id))];
    const cours = (x.cours || []).find(c => c.pole === P().id) || (x.cours || [])[0];
    const cls = cours && cours.cls ? cours.cls.find(n => classesDu(P().id).includes(n)) : null;
    return `<div class="alerte ${x.type === 'couvrir' ? 'warn' : ''}" id="${prefix}-${i}" style="display:grid;grid-template-columns:auto minmax(0,1fr);gap:6px 12px;align-items:start">
      <button type="button" class="sigle" style="width:38px;height:38px;font-size:.82rem;border:0;cursor:pointer" data-a="fiche" data-v="${esc(a.id)}" aria-label="Fiche de ${esc(a.sigle)}">${esc(a.sigle)}</button>
      <span><b>${esc(a.sigle)}</b> · ${esc(x.texte)}
        <span class="ligne" style="margin-top:6px;gap:6px">${cours && cls ? `<button type="button" class="btn petit" data-a="edt-cours" data-v="${esc(cls)}|${esc(cours.id)}">Voir le cours</button>` : ''}
        ${autres.map(q => `<button type="button" class="btn petit" data-a="ecrire-a" data-v="${esc(q)}" data-sujet="${esc(a.sigle)}|${esc(x.texte)}">✉️ Écrire au référent ${esc(nomPole(q))}</button>`).join('')}</span></span></div>`;
  }
  function carteDisponibles(titre) {
    const p = P(), l = K.disponiblesAilleurs(ctx(), p.id, S.lundi, poleComplet);
    if (!l.length) return '';
    return `<div class="carte pad" style="display:grid;gap:10px"><div><h2>${esc(titre || 'Disponibles ailleurs')}</h2><span class="muted" style="font-size:.9rem">AESH des autres pôles qui ont encore des heures. Placez-les sur vos cours : ça compte dans ${esc(p.nom)}, et leur référent le voit.</span></div>
      ${l.slice(0, 6).map(x => { const pa = pole(Object.keys(x.a.equipes || {})[0]) || p;
        return `<button type="button" class="aesh" id="dispo-${esc(x.a.id)}" data-a="fiche" data-v="${esc(x.a.id)}"><span class="sigle" style="--pole:${pa.couleur}">${esc(x.a.sigle)}</span>
          <span class="det"><b>${K.fmtH(x.dispo)} disponibles</b><span class="leg">${x.complets.map(c => `<span><em style="background:${(pole(c.p) || p).couleur}"></em>${esc(nomPole(c.p))} · ${c.complet ? 'complet' : 'saisie en cours'}</span>`).join('')}</span>
            ${x.libres.length ? `<span class="muted" style="font-size:.85rem">Libre : ${esc(x.libres.slice(0, 6).map(y => y.texte).join(' · '))}${x.libres.length > 6 ? ' …' : ''}</span>` : '<span class="muted" style="font-size:.85rem">Aucune demi-journée libre cette semaine</span>'}</span>
          <span class="droite">${x.soldeRep > 1e-9 ? `<span class="puce ok">${K.fmtH(x.soldeRep)} non réparties</span>` : ''}${x.fiable && x.nonPlace > 1e-9 ? `<span class="puce ok">${K.fmtH(x.nonPlace)} non placées</span>` : ''}${!x.fiable && x.nonPlace > 1e-9 ? `<span class="puce warn" title="Le référent n’a pas encore déclaré son emploi du temps complet">${K.fmtH(x.nonPlace)} non placées · à confirmer</span>` : ''}</span></button>`; }).join('')}</div>`;
  }
  function carteComplet() {
    const p = P(), c = poleComplet(p.id);
    return `<div class="carte pad" style="display:grid;gap:8px"><div class="ligne ecarte"><div><h2>Mon emploi du temps</h2><span class="muted" style="font-size:.9rem">${c ? `Déclaré complet jusqu’au ${esc(K.dateCourte(c.jusquau))}. Les autres référents peuvent compter sur les heures libres de vos AESH.` : 'Quand vos AESH sont tous placés, dites-le : les autres référents sauront que les heures libres sont fiables.'}</span></div>
      ${c ? `<button type="button" class="btn" id="complet-non" data-a="complet-non">Reprendre la saisie</button>` : `<button type="button" class="btn pri" id="complet-oui" data-a="complet">✓ Mon emploi du temps est complet</button>`}</div></div>`;
  }
  const classesDu = pid => S.edt.poles[pid] || [];

  /* ─────────── écritures ─────────── */
  async function ecrire(doc) {
    const prec = S.docs.get(doc.id), maintenant = new Date().toISOString();
    const d = { ...doc, annee: S.annee, version: ((prec && prec.version) || 0) + 1, majLe: maintenant, par: S.session ? S.session.pole : '' };
    delete d.depart;
    if (!d.creeLe) d.creeLe = (prec && prec.creeLe) || maintenant;
    await avecDelai(FS.setDoc(FS.doc(db, COLLECTION, d.id), d));
    S.docs.set(d.id, d); versionDocs++;
    const hid = 'hist_' + alea();
    Promise.resolve().then(() => FS.setDoc(FS.doc(db, COLLECTION, hid), { id: hid, type: 'hist', annee: S.annee, de: d.id, typeDe: d.type, version: d.version, majLe: maintenant, par: d.par, contenu: JSON.stringify(d).slice(0, 20000) })).catch(() => { });
    return d;
  }
  async function ecrireTout(docs) { for (const d of docs) await ecrire(d); }

  /* ─────────── navigation (flèches du navigateur) ─────────── */
  function aller(e, p = {}, o = {}) {
    S.route = { e, p }; S.menu = false;
    if (S.feuille) { S.feuille = null; history.replaceState({ e, p, n: S.n }, ''); }
    else if (o.remplacer) history.replaceState({ e, p, n: S.n }, '');
    else { S.n++; history.pushState({ e, p, n: S.n }, ''); }
    rendre({ haut: true });
  }
  function retour() { if (S.n > 0 && history.state && history.state.n > 0) history.back(); else aller('accueil', {}, { remplacer: true }); }
  function ouvrir(f) { S.feuille = f; S.menu = false; history.pushState({ ...S.route, n: S.n, f: 1 }, ''); rendre({ focus: 'f-titre' }); }
  function fermer() { if (!S.feuille) return; S.feuille = null; S.ignorePop++; history.back(); rendre(); }
  window.addEventListener('popstate', ev => {
    if (S.ignorePop > 0) { S.ignorePop--; if (S.apresPop) { const f = S.apresPop; S.apresPop = null; f(); } return; }
    const st = ev.state;
    if (S.feuille && !(st && st.f)) { if (S.envoi) { history.pushState({ ...S.route, n: S.n, f: 1 }, ''); return; } S.feuille = null; rendre(); return; }
    S.feuille = null; S.menu = false;
    if (!st || !st.e) { S.route = { e: S.session ? 'accueil' : 'code', p: {} }; S.n = 0; rendre({ haut: true }); return; }
    S.n = st.n || 0;
    S.route = { e: st.e, p: st.p || {} };
    if (!S.session && !['humeur', 'code'].includes(st.e)) S.route = { e: 'code', p: {} };
    rendre({ haut: true });
  });

  /* ─────────── rendu ─────────── */
  let toastT = null;
  function toast(t, err) { S.toast = { t, err }; rendre(); clearTimeout(toastT); toastT = setTimeout(() => { S.toast = null; rendre(); }, err ? 4200 : 1800); annonce(t); }
  function annonce(t) { const a = document.getElementById('annonce'); if (a) { a.textContent = ''; setTimeout(() => { a.textContent = t; }, 30); } }
  function rendre(o = {}) {
    const actif = document.activeElement, idActif = actif && racine.contains(actif) ? actif.id : null, y = window.scrollY;
    let sel = null; try { if (actif && typeof actif.selectionStart === 'number') sel = [actif.selectionStart, actif.selectionEnd]; } catch (e) { }
    document.documentElement.style.setProperty('--pole', P().couleur);
    const e = S.route.e;
    let html;
    if (e === 'humeur') html = ecranHumeur();
    else if (e === 'code' || !S.session) html = ecranCode();
    else html = `${entete()}<main class="corps" id="contenu" ${S.feuille ? 'inert' : ''}>${bandeauEtat()}${(ECRANS[e] || ECRANS.accueil)()}</main>`;
    if (S.feuille) html += feuille();
    if (S.toast) html += `<div class="toast ${S.toast.err ? 'err' : ''}" role="status">${esc(S.toast.t)}</div>`;
    racine.innerHTML = html;
    document.title = `${TITRES[e] || 'Référents de pôle'} — Référents de pôle AESH`;
    const f = o.focus && document.getElementById(o.focus);
    if (f) { f.focus({ preventScroll: !o.haut }); if (sel && f.id === idActif) try { f.setSelectionRange(sel[0], sel[1]); } catch (x) { } }
    else if (idActif) { const el = document.getElementById(idActif); if (el) { el.focus({ preventScroll: true }); if (sel) try { el.setSelectionRange(sel[0], sel[1]); } catch (x) { } } }
    if (o.haut) window.scrollTo(0, 0); else if (o.donnees || !o.focus) window.scrollTo(0, y);
    apresRendu();
  }
  const TITRES = { humeur: 'Bonjour', code: 'Code', accueil: 'Accueil', aesh: 'Mes AESH', fiche: 'AESH', absence: 'Absences et formations', reunions: 'Réunions institutionnelles', edt: 'Emploi du temps', ensemble: 'Vue d’ensemble', besoins: 'Besoins', messages: 'Messages', exporter: 'Exporter', moncode: 'Mon code', avatar: 'Mon avatar' };
  function apresRendu() {
    if (S.route.e === 'messages') { const f = document.getElementById('fil-fin'); if (f && !apresRendu.vu) { f.scrollIntoView({ block: 'end' }); apresRendu.vu = true; } marquerLus(); }
    else apresRendu.vu = false;
  }

  function bandeauEtat() {
    if (S.etat === 'refus') return `<div class="bandeau warn" role="alert">Espace en cours d’ouverture par la coordination : consultation possible, enregistrement pas encore autorisé.</div>`;
    if (S.etat === 'horsligne') return `<div class="bandeau warn" role="alert">Pas de connexion au serveur : les données affichées sont celles de la dernière visite.</div>`;
    return '';
  }
  function entete() {
    const e = S.route.e, nonLus = messagesNonLus();
    const ong = [['accueil', 'Accueil'], ['aesh', 'Mes AESH'], ['edt', 'Emploi du temps'], ['ensemble', 'Vue d’ensemble'], ['besoins', 'Besoins'], ['messages', 'Messages'], ['exporter', 'Exporter']];
    const actif = { fiche: 'aesh', absence: 'aesh', reunions: 'aesh', moncode: 'accueil' }[e] || e;
    const coord = S.session && pole(S.session.pole).coordination;
    return `<header class="tete"><div class="tete-in">
      ${e !== 'accueil' ? `<button type="button" class="rond" id="t-retour" data-a="retour" aria-label="Retour" title="Retour">←</button>` : ''}
      <div class="marque"><b>Référents de pôle</b><button type="button" class="chip-pole chip-av" id="t-avatar" data-a="menu" title="${esc(P().sous)}" aria-label="Menu du pôle ${esc(P().nom)}">${avatarHtml(P().id, 28, { classe: 'tete-av' })}${esc(P().nom)}</button></div>
      <button type="button" class="rond rel" id="t-messages" data-a="aller" data-v="messages" aria-label="Messages${nonLus ? `, ${nonLus} nouveau${nonLus > 1 ? 'x' : ''}` : ''}" title="Messages">💬${nonLus ? `<span class="badge">${nonLus}</span>` : ''}</button>
      ${e !== 'accueil' ? `<button type="button" class="rond" id="t-accueil" data-a="aller" data-v="accueil" aria-label="Accueil" title="Accueil">⌂</button>` : ''}
      <button type="button" class="rond" id="t-menu" data-a="menu" aria-label="Menu" aria-expanded="${S.menu}" title="Menu">⋯</button>
    </div>
    <nav class="onglets" aria-label="Sections">${ong.map(([k, l]) => `<button type="button" id="o-${k}" data-a="aller" data-v="${k}" ${actif === k ? 'aria-current="page"' : ''}>${l}</button>`).join('')}</nav>
    ${S.menu ? `<div class="menu" role="menu">
      ${S.vu && S.vu !== S.session.pole ? '' : `<button type="button" role="menuitem" id="m-avatar" data-a="aller" data-v="avatar">🙂 ${avatarDe(S.session.pole) ? 'Changer mon avatar' : 'Choisir mon avatar'}</button>`}
      <button type="button" role="menuitem" id="m-code" data-a="aller" data-v="moncode">🔑 Changer mon code</button>
      <button type="button" role="menuitem" id="m-lien" data-a="partager">✉️ Envoyer le lien à mes collègues</button>
      <button type="button" role="menuitem" id="m-fond" data-a="fond">${document.documentElement.dataset.fond === 'blanc' ? '◐ Fond clair' : '○ Fond blanc'}</button>
      ${coord ? `<hr><div style="padding:6px 12px 2px;font-size:.8rem;color:var(--muted);font-weight:700">Voir un pôle</div>${POLES.map(p => `<button type="button" role="menuitem" id="m-vu-${p.id}" data-a="vu" data-v="${p.id}"><span class="chip-pole" style="--pole:${p.couleur}"><i></i>${esc(p.nom)}</span>${P().id === p.id ? ' ✓' : ''}</button>`).join('')}` : ''}
      <hr><button type="button" role="menuitem" id="m-sortir" data-a="sortir">↩︎ Se déconnecter</button></div>` : ''}
    </header>`;
  }

  /* ─────────── entrée : humeur, pensée, code ─────────── */
  function penseeDuJour() {
    const m = lsLit(K_PENSEES, { jour: '', i: -1, vues: [] }), auj = K.isoLocal();
    if (m.jour === auj && PENSEES[m.i]) return PENSEES[m.i];
    let vues = Array.isArray(m.vues) ? m.vues : [], libres = PENSEES.map((_, i) => i).filter(i => !vues.includes(i));
    if (!libres.length) { vues = []; libres = PENSEES.map((_, i) => i); }
    const i = libres[Math.floor(Math.random() * libres.length)]; vues.push(i);
    lsEcrit(K_PENSEES, { jour: auj, i, vues }); return PENSEES[i];
  }
  function ecranHumeur() {
    const [t, a] = penseeDuJour(), h = S.humeur;
    return `<main class="entree">
      <div><h1 id="titre" tabindex="-1">Bonjour</h1><p class="sous">Comment vous sentez-vous aujourd’hui ?</p></div>
      <div class="emos" role="group" aria-label="Comment vous sentez-vous ?">${HUMEURS.map(([e, l], i) => `<button type="button" id="h-${i}" data-a="humeur" data-v="${i}" aria-pressed="${h === i}" aria-label="${l}"><span class="e" aria-hidden="true">${e}</span><span class="l">${l}</span></button>`).join('')}</div>
      <p class="mot-humeur" role="status">${h != null ? esc(HUMEURS[h][2]) : ''}</p>
      <figure class="pensee" style="margin:0"><blockquote>« ${esc(t.replace(/'/g, '’'))} »</blockquote><p>${esc(a)}</p></figure>
      <div style="display:grid;gap:12px;justify-items:center"><button type="button" class="btn" id="h-entrer" data-a="entrer">${h != null ? 'Entrer' : 'Passer'} ›</button></div>
    </main>`;
  }
  function ecranCode() {
    return `<main class="entree">
      <div><h1 id="titre" tabindex="-1">Référents de pôle</h1><p class="sous">Code du pôle</p></div>
      <div class="plots ${S.codeErr ? 'err' : ''}" aria-hidden="true">${[0, 1, 2, 3].map(i => `<span class="plot ${i < S.code.length ? 'on' : ''}">${i < S.code.length ? '•' : ''}</span>`).join('')}</div>
      <p class="msg-code" role="status" id="code-msg">${esc(S.codeMsg)}</p>
      <label class="sr" for="code-saisie">Code à quatre chiffres</label>
      <input id="code-saisie" class="sr" inputmode="numeric" autocomplete="one-time-code" maxlength="4" value="${esc(S.code)}">
      <div class="pave" role="group" aria-label="Pavé numérique">${['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map(k => k ? `<button type="button" id="k-${k === '⌫' ? 'eff' : k}" data-a="touche" data-v="${k}" class="${k === '⌫' ? 'fn' : ''}" aria-label="${k === '⌫' ? 'Effacer' : k}">${k}</button>` : '<span></span>').join('')}</div>
      <button type="button" class="lien" data-a="aller-humeur" id="c-humeur">‹ Retour</button>
    </main>`;
  }
  function tapeCode(k) {
    S.codeErr = false; S.codeMsg = '';
    if (k === '⌫') S.code = S.code.slice(0, -1); else if (/^\d$/.test(k) && S.code.length < 4) S.code += k;
    if (S.code.length === 4) {
      if (S.etat === 'chargement') { S.codeMsg = 'Vérification…'; rendre(); setTimeout(() => { if (S.code.length === 4) tapeCode(''); }, 600); return; }
      const p = POLES.find(x => codeDe(x.id) === S.code);
      if (p) {
        S.session = { pole: p.id, code: S.code }; lsEcrit(K_SESSION, S.session); S.code = ''; S.vu = null;
        ecouterEstimations(); publierHumeur();
        if (!avatarDe(p.id) && S.etat === 'ok') { S.form = null; aller('avatar', { premiere: 1 }, { remplacer: true }); } else aller('accueil', {}, { remplacer: true }); return;
      }
      S.codeErr = true; S.codeMsg = 'Code inconnu'; S.code = '';
    }
    rendre({ focus: 'code-saisie' });
  }

  /* ─────────── semaines ─────────── */
  function selecteurSemaine(id = 'sem') {
    const s = S.C.semaine(S.lundi), v = K.ajoute(S.lundi, 4);
    const lib = s.toute ? (s.jours[0].off || 'Vacances') : `${K.dateCourte(S.lundi)} – ${K.dateCourte(v)}`;
    return `<div class="semaine" role="group" aria-label="Semaine affichée">
      <button type="button" id="${id}-prec" data-a="semaine" data-v="-7" aria-label="Semaine précédente" title="Semaine précédente">‹</button>
      <span><span class="ab ${s.parite ? '' : 'vac'}" title="${s.parite ? 'Semaine ' + s.parite : 'Pas de cours'}">${s.parite || '·'}</span>${esc(lib)}</span>
      <button type="button" id="${id}-suiv" data-a="semaine" data-v="7" aria-label="Semaine suivante" title="Semaine suivante">›</button>
      ${S.lundi !== semaineParDefaut() ? `<button type="button" id="${id}-auj" data-a="semaine" data-v="0" aria-label="Cette semaine" title="Cette semaine" style="width:auto;padding:0 10px;border-radius:999px;font-size:.85rem;font-weight:700">Auj.</button>` : ''}
    </div>`;
  }

  /* ─────────── outils de calcul pour l'affichage ─────────── */
  function bilans(pid) { const c = ctx(); return K.aeshActifs(c.I, pid).map(a => ({ a, b: K.bilan(c, a.id, S.lundi) })); }
  function placesCours(coursId, iso) {
    const I = idx(); return I.places.filter(p => p.coursId === coursId && iso >= p.du && iso <= p.au);
  }
  function jaugeAesh(a) {
    const contrat = nombre(a.contrat), parts = [];
    Object.keys(a.equipes || {}).forEach(q => { const h = nombre((a.heures || {})[q]); if (h) parts.push([`${nomPole(q)} ${K.fmtH(h)}`, h, pole(q).couleur]); });
    const serv = (+a.cantine || 0) + (+a.internat || 0) + (+a.service || 0);
    if (serv) parts.push([`services ${K.fmtH(serv)}`, serv, '#94a3b8']);
    parts.push(['réunion 1 h', 1, '#cbd5e1']);
    const tot = Math.max(contrat || 0, parts.reduce((s, p) => s + p[1], 0)) || 1;
    return `<div class="jauge" aria-hidden="true">${parts.map(p => `<i style="width:${p[1] / tot * 100}%;background:${p[2]}"></i>`).join('')}</div>
      <div class="leg">${parts.map(p => `<span><em style="background:${p[2]}"></em>${esc(p[0])}</span>`).join('')}</div>`;
  }
  const aCompleter = a => nombre(a.contrat) == null || nombre((a.heures || {})[P().id]) == null;

  /* ═══════════════════ ÉCRANS ═══════════════════ */
  const ECRANS = {
    accueil() {
      const p = P(), bs = bilans(p.id), alertes = [];
      bs.forEach(({ a, b }) => (b.alertes || []).forEach(x => alertes.push({ a, x })));
      const prevu = bs.reduce((s, { a }) => s + (nombre((a.heures || {})[p.id]) || 0), 0), place = bs.reduce((s, { b }) => s + (b.parPole[p.id] || 0), 0);
      const incomplets = bs.filter(({ a }) => aCompleter(a)).length;
      const nb = besoinsResume(p.id), nonLus = messagesNonLus();
      const d = new Date(), auj = `${K.JOURS[(d.getDay() + 6) % 7] || ['Samedi', 'Dimanche'][d.getDay() === 6 ? 0 : 1]} ${d.getDate()} ${K.MOIS[d.getMonth()]}`;
      return `<div class="salut"><div><h1 id="titre" tabindex="-1">Bonjour</h1><p class="sous">${esc(auj)} · pôle ${esc(p.nom)}</p></div>${selecteurSemaine()}</div>
      ${alertes.length ? `<div class="alertes">${alertes.slice(0, 5).map(({ a, x }, i) => carteAlerte(a, x, i, 'al')).join('')}${alertes.length > 5 ? `<button type="button" class="lien" id="al-plus" data-a="aller" data-v="aesh">+ ${alertes.length - 5} autre${alertes.length - 5 > 1 ? 's' : ''}</button>` : ''}</div>` : ''}
      <div class="tuiles">
        <button type="button" class="tuile" id="tu-aesh" data-a="aller" data-v="aesh"><span class="ic">👥</span><span><b>Mes AESH</b><br><small>${bs.length} AESH · ${K.fmtH(prevu)} dans le pôle${incomplets ? ` · <span style="color:var(--warn);font-weight:700">${incomplets} à compléter</span>` : ''}</small></span></button>
        <button type="button" class="tuile forte" id="tu-edt" data-a="aller" data-v="edt"><span class="ic">🗓️</span><span><b>Emploi du temps</b><br><small>${prevu ? `${K.fmtH(place)} placées sur ${K.fmtH(prevu)} cette semaine` : `${K.fmtH(place)} placées · heures du pôle à compléter`}</small></span><div class="barre-p"><i style="width:${prevu ? Math.min(100, place / prevu * 100) : 0}%"></i></div></button>
        <button type="button" class="tuile" id="tu-ens" data-a="aller" data-v="ensemble"><span class="ic">🧭</span><span><b>Vue d’ensemble</b><br><small>Qui est où, jour par jour</small></span></button>
        <button type="button" class="tuile" id="tu-bes" data-a="aller" data-v="besoins"><span class="ic">📋</span><span><b>Besoins</b><br><small>${nb.estimes} cours estimés par les enseignants${nb.manque ? ` · <span style="color:var(--warn);font-weight:700">${nb.manque} à couvrir</span>` : ''}</small></span></button>
        <button type="button" class="tuile" id="tu-msg" data-a="aller" data-v="messages"><span class="ic">💬</span><span><b>Messages</b><br><small>${nonLus ? `<span style="color:var(--err);font-weight:700">${nonLus} nouveau${nonLus > 1 ? 'x' : ''}</span>` : 'Entre référents'}</small></span></button>
        <button type="button" class="tuile" id="tu-exp" data-a="aller" data-v="exporter"><span class="ic">⬇️</span><span><b>Exporter</b><br><small>PDF · Excel</small></span></button>
      </div>
      ${carteReferents()}
      ${carteComplet()}
      ${carteDisponibles()}
      <div class="ligne"><button type="button" class="btn" id="acc-partager" data-a="partager">✉️ Envoyer le lien des besoins à mes collègues</button></div>`;
    },

    aesh() {
      const p = P(), bs = bilans(p.id);
      return `<div class="salut"><div><h1 id="titre" tabindex="-1">Mes AESH</h1><p class="sous">${esc(p.nom)} · heures par semaine</p></div>${selecteurSemaine()}</div>
      <div class="liste">${bs.map(({ a, b }) => {
        const hp = nombre((a.heures || {})[p.id]), pl = b.parPole[p.id] || 0;
        return `<button type="button" class="aesh" id="a-${esc(a.id)}" data-a="fiche" data-v="${esc(a.id)}">
          <span class="sigle">${esc(a.sigle)}</span>
          <span class="det"><b>${nombre(a.contrat) != null ? `Contrat ${K.fmtH(a.contrat)}` : 'Contrat à compléter'}${Object.keys(a.equipes || {}).length > 1 ? ` · partagé ${Object.keys(a.equipes).map(nomPole).join(' + ')}` : ''}</b>${jaugeAesh(a)}</span>
          <span class="droite"><span class="heures" title="Placées dans l’emploi du temps cette semaine / prévues dans le pôle">${K.fmtH(pl)} <small>/ ${hOu(hp)}</small></span>
            ${b.reste != null ? `<span class="puce ${b.reste < 0 ? 'err' : 'ok'}" title="Contrat moins tout ce qui est placé, services et réunion">reste ${K.fmtH(b.reste)}</span>` : ''}
            ${aCompleter(a) ? '<span class="puce warn">à compléter</span>' : ''}
            ${b.alertes.filter(x => x.type !== 'repartition' || true).slice(0, 2).map(x => `<span class="puce ${x.type === 'couvrir' ? 'warn' : 'err'}" title="${esc(x.texte)}">${x.type === 'conflit' ? 'conflit' : x.type === 'couvrir' ? 'à couvrir' : x.type === 'pole' ? 'pôle dépassé' : x.type === 'repartition' ? `${K.fmtH(-x.solde)} de trop` : 'dépassement'}</span>`).join('')}</span>
        </button>`;
      }).join('') || `<div class="etat-vide"><b>Aucun AESH dans ce pôle</b>Ajoutez le premier.</div>`}</div>
      <div class="ligne"><button type="button" class="btn pri" id="aesh-ajouter" data-a="fiche" data-v="nouveau">＋ Ajouter un AESH</button>
        <button type="button" class="btn" id="aesh-absence" data-a="aller" data-v="absence">Absence ou formation</button>
        <button type="button" class="btn" id="aesh-reunions" data-a="aller" data-v="reunions">Réunions institutionnelles</button></div>`;
    },

    fiche() { return ecranFiche(); },
    absence() { return ecranAbsence(); },
    reunions() { return ecranReunions(); },
    edt() { return ecranEdt(); },
    ensemble() { return ecranEnsemble(); },
    besoins() { return ecranBesoins(); },
    messages() { return ecranMessages(); },
    exporter() { return ecranExporter(); },
    moncode() { return ecranMonCode(); },
    avatar() { return ecranAvatar(); }
  };

  /* ─────────── fiche AESH ─────────── */
  function initForm(id) {
    const I = idx(), p = P();
    if (id === 'nouveau') return { id: 'nouveau', recherche: '', choisi: null, a: { id: '', type: 'aesh', sigle: '', equipes: { [p.id]: 1 }, contrat: null, heures: { [p.id]: null }, cantine: 0, internat: 0, service: 0, serviceLib: '', reunion: null, actif: true }, orig: null };
    const a = I.aesh.get(id); if (!a) return null;
    const copie = JSON.parse(JSON.stringify(a)); delete copie.depart;
    return { id, a: copie, orig: JSON.parse(JSON.stringify(copie)) };
  }
  function formFiche() {
    const id = S.route.p.id;
    if (!S.form || S.form.kind !== 'fiche' || S.form.cle !== id) { const f = initForm(id); if (!f) return null; S.form = { ...f, kind: 'fiche', cle: id }; }
    return S.form;
  }
  const CHAMPS = [['contrat', 'Contrat', 'heures par semaine'], ['cantine', 'Cantine', 'heures par semaine'], ['internat', 'Internat', 'heures par semaine'], ['service', 'Autre service', 'heures par semaine']];
  function changements(f) {
    const a = f.a, o = f.orig || {}, p = P().id, l = [];
    const v = x => nombre(x) == null ? '—' : K.fmtH(x);
    if ((o.sigle || '') !== a.sigle) l.push(['Sigle', o.sigle || '—', a.sigle]);
    if (nombre(o.contrat) !== nombre(a.contrat)) l.push(['Contrat', v(o.contrat), v(a.contrat)]);
    if (nombre((o.heures || {})[p]) !== nombre((a.heures || {})[p]) || !(o.equipes || {})[p]) l.push([`Dans ${nomPole(p)}`, (o.equipes || {})[p] ? v((o.heures || {})[p]) : 'pas dans le pôle', v(a.heures[p])]);
    ['cantine', 'internat', 'service'].forEach(k => { if ((nombre(o[k]) || 0) !== (nombre(a[k]) || 0)) l.push([k === 'service' ? 'Autre service' : k[0].toUpperCase() + k.slice(1), v(o[k] || 0), v(a[k] || 0)]); });
    if ((o.serviceLib || '') !== (a.serviceLib || '')) l.push(['Service', o.serviceLib || '—', a.serviceLib || '—']);
    const r = x => x && K.RE_HEURE.test(x.debut || '') ? `${K.JOURS[x.jour]} ${K.hFr(x.debut)}–${K.hFr(x.fin)}` : '—';
    if (r(o.reunion) !== r(a.reunion)) l.push(['Réunion d’équipe', r(o.reunion), r(a.reunion)]);
    return l;
  }
  function ecranFiche() {
    const f = formFiche(), p = P();
    if (!f) return `<div class="etat-vide"><b>AESH introuvable</b><button type="button" class="btn" data-a="aller" data-v="aesh" id="f-retour-liste">Mes AESH</button></div>`;
    const a = f.a, nouveau = f.id === 'nouveau', I = idx();
    if (nouveau && !f.choisi) return ecranNouvelAesh(f);
    const autres = Object.keys(a.equipes || {}).filter(q => q !== p.id);
    const ch = changements(f), modifie = ch.length > 0;
    const pas = (cle, val, pasV = 0.5, sous) => `<span class="pas"><button type="button" id="pm-${cle}" data-a="pas" data-v="${cle}" data-d="-${pasV}" aria-label="Moins">−</button><input id="pv-${cle}" data-i="nb" data-v="${cle}" inputmode="decimal" value="${nombre(val) == null ? '' : String(val).replace('.', ',')}" placeholder="—" aria-label="${esc(sous || cle)}"><button type="button" id="pp-${cle}" data-a="pas" data-v="${cle}" data-d="${pasV}" aria-label="Plus">+</button></span>`;
    const estModif = test => test ? 'modif' : '';
    const o = f.orig || {};
    const b = !nouveau ? K.bilan(ctx(), a.id, S.lundi) : null;
    const absences = I.absences.filter(x => x.aeshId === a.id && x.au >= K.isoLocal()).sort((x, y) => x.du.localeCompare(y.du));
    const suggestions = !nouveau ? ouIntervenir(a.id).slice(0, 5) : [];
    const reu = a.reunion || {};
    return `<div class="fiche">
      <div class="ligne"><span class="sigle grand">${esc(a.sigle || '?')}</span><div style="flex:1;min-width:0"><h1 id="titre" tabindex="-1">${esc(a.sigle || 'Nouvel AESH')}</h1>
        <p class="sous">${[p.nom, ...autres.map(nomPole)].map(esc).join(' + ')}</p></div>${!nouveau ? selecteurSemaine() : ''}</div>
      ${b ? `<div class="stats"><div class="carte stat"><b>${K.fmtH(b.total)}</b><small>cette semaine</small></div><div class="carte stat"><b style="color:${b.reste == null ? 'inherit' : b.reste < 0 ? 'var(--err)' : 'var(--ok)'}">${b.reste == null ? '—' : K.fmtH(b.reste)}</b><small>reste sur le contrat</small></div><div class="carte stat"><b>${K.fmtH(b.parPole[p.id] || 0)}</b><small>placées dans ${esc(p.nom)}</small></div></div>
        <div class="carte pad" style="display:grid;gap:6px"><div class="ligne ecarte"><h2>Répartition du contrat</h2><span class="puce ${b.rep.solde == null ? '' : b.rep.solde < -1e-9 ? 'err' : b.rep.solde > 1e-9 ? 'ok' : 'ok'}">${b.rep.solde == null ? 'contrat ?' : b.rep.solde < -1e-9 ? `${K.fmtH(-b.rep.solde)} de trop` : b.rep.solde > 1e-9 ? `${K.fmtH(b.rep.solde)} disponibles` : 'tout réparti'}</span></div>
          <span class="muted" style="font-size:.92rem">${esc(b.rep.texte)}</span>${jaugeAesh(a)}
          ${Object.keys(a.equipes || {}).length > 1 ? `<span class="muted" style="font-size:.85rem">Fiche partagée : chaque référent règle les heures de son pôle, les deux voient le même solde.</span>` : ''}</div>
        ${b.alertes.length ? `<div class="alertes">${b.alertes.map((x, i) => carteAlerte(a, x, i, 'fa')).join('')}</div>` : ''}` : ''}
      <div class="champs">
        <div class="champ ${estModif((o.sigle || '') !== a.sigle)}"><span class="lib"><b>Sigle</b><small>initiales, jamais le prénom</small></span><input type="text" id="f-sigle" data-i="sigle" value="${esc(a.sigle)}" maxlength="6" style="width:110px;font-weight:800;text-transform:uppercase;text-align:center"></div>
        <div class="champ ${estModif(nombre(o.contrat) !== nombre(a.contrat))}"><span class="lib"><b>Contrat</b><small>heures par semaine</small></span>${pas('contrat', a.contrat, 0.5, 'Contrat')}</div>
        <div class="champ ${estModif(nombre((o.heures || {})[p.id]) !== nombre(a.heures[p.id]))}"><span class="lib"><b>Dans ${esc(p.nom)}</b><small>heures par semaine dans mon pôle</small></span>${pas('pole', a.heures[p.id], 0.5, 'Heures dans le pôle')}</div>
        ${autres.map(q => `<div class="champ"><span class="lib"><b>Dans ${esc(nomPole(q))}</b><small>réglé par le référent de ce pôle</small></span><span class="verrou" title="Seul le référent de ce pôle peut modifier">🔒 ${hOu((a.heures || {})[q])}</span></div>`).join('')}
        ${CHAMPS.slice(1).map(([k, l, s]) => `<div class="champ ${estModif((nombre(o[k]) || 0) !== (nombre(a[k]) || 0))}"><span class="lib"><b>${l}</b><small>${s}</small></span>${pas(k, a[k] || 0, 0.5, l)}</div>`).join('')}
        ${(nombre(a.service) || 0) > 0 ? `<div class="champ"><span class="lib"><b>Quel service ?</b></span><input type="text" id="f-servlib" data-i="serviceLib" value="${esc(a.serviceLib || '')}" maxlength="60" placeholder="ex. vie scolaire"></div>` : ''}
        <div class="champ ${estModif(JSON.stringify(o.reunion || null) !== JSON.stringify(a.reunion || null))}" style="grid-template-columns:1fr"><span class="lib"><b>Réunion d’équipe</b><small>1 h par semaine</small></span>
          <div class="ligne"><div class="choix" role="group" aria-label="Jour de la réunion">${K.JOURS_C.map((j, i) => `<button type="button" id="rj-${i}" data-a="reu-jour" data-v="${i}" aria-pressed="${reu.jour === i && !!reu.debut}">${j}</button>`).join('')}</div>
          <label class="sr" for="f-reu-h">Heure</label><select id="f-reu-h" data-i="reu-h" ${reu.debut ? '' : 'disabled'}>${reu.debut ? '' : '<option value="">heure</option>'}${CRENEAUX_H.slice(0, -2).map(h => `<option value="${h}" ${reu.debut === h ? 'selected' : ''}>${K.hFr(h)} – ${K.hFr(K.hDe(K.min(h) + 60))}</option>`).join('')}</select>
          ${reu.debut ? `<button type="button" class="lien" id="f-reu-non" data-a="reu-aucune">aucune</button>` : ''}</div></div>
      </div>
      ${!nouveau ? `<div class="carte pad" style="display:grid;gap:10px"><div class="ligne ecarte"><h2>Absences et formations</h2><button type="button" class="btn petit" id="f-abs" data-a="aller" data-v="absence" data-id="${esc(a.id)}">＋ Poser</button></div>
        ${absences.length ? absences.map(x => `<div class="ligne ecarte"><span><span class="puce err">${esc(K.MOTIFS[x.motif] || 'Absence')}</span> ${x.du === x.au ? esc(K.dateLongue(x.du)) : `du ${esc(K.dateCourte(x.du))} au ${esc(K.dateCourte(x.au))}`}${x.journee === false ? ` · ${K.hFr(x.debut)}–${K.hFr(x.fin)}` : ''}</span></div>`).join('') : '<span class="muted">Aucune à venir.</span>'}</div>` : ''}
      ${suggestions.length ? `<div class="carte pad" style="display:grid;gap:8px"><h2>Où intervenir</h2><span class="muted" style="font-size:.9rem">Cours de ${esc(p.nom)} où les enseignants ont estimé un besoin non couvert, et où ${esc(a.sigle)} est libre cette semaine.</span>
        ${suggestions.map((s, i) => `<button type="button" class="alerte warn" id="sg-${i}" data-a="edt-cours" data-v="${esc(s.classe)}|${esc(s.cours.id)}"><b>${esc(K.JOURS[s.cours.j])} ${K.hFr(s.cours.d)}</b><span>${esc(s.cours.lib)} · ${esc(S.edt.classes[s.classe].court)} · besoin ${s.besoin}, placé${s.places > 1 ? 's' : ''} ${s.places} → il manque ${s.besoin - s.places}</span></button>`).join('')}</div>` : ''}
      <div class="barre-bas">
        ${!nouveau ? `<button type="button" class="btn danger" id="f-retirer" data-a="retirer-aesh">Retirer de mon pôle</button>` : ''}
        ${modifie ? `<button type="button" class="btn" id="f-annuler" data-a="annuler-fiche">Annuler</button>` : ''}
        <button type="button" class="btn valider" id="f-enregistrer" data-a="valider-fiche" ${modifie || nouveau ? '' : 'disabled'}>✓ Enregistrer</button>
      </div></div>`;
  }
  function ecranNouvelAesh(f) {
    const I = idx(), p = P(), q = K.cleSigle(f.recherche);
    const existants = [...I.aesh.values()].filter(a => a.actif !== false && !(a.equipes || {})[p.id] && (!q || K.cleSigle(a.sigle).startsWith(q)));
    const pris = q && [...I.aesh.values()].some(a => a.actif !== false && K.cleSigle(a.sigle) === q);
    return `<div class="fiche"><h1 id="titre" tabindex="-1">Ajouter un AESH</h1>
      <div class="champs"><div class="champ" style="grid-template-columns:1fr"><label class="lib" for="n-sigle"><b>Sigle</b><small>initiales, jamais le prénom</small></label>
        <input type="text" id="n-sigle" data-i="recherche" class="gros-champ" maxlength="6" value="${esc(f.recherche)}" autocomplete="off" placeholder="ex. CÉ"></div></div>
      ${existants.length ? `<div style="display:grid;gap:8px"><h2>Déjà dans l’établissement</h2>${existants.map(a => `<button type="button" class="aesh" id="n-ex-${esc(a.id)}" data-a="choisir-existant" data-v="${esc(a.id)}"><span class="sigle" style="--pole:${pole(Object.keys(a.equipes || {})[0]) ? pole(Object.keys(a.equipes)[0]).couleur : 'var(--pole)'}">${esc(a.sigle)}</span><span class="det"><b>${esc(a.sigle)}</b><span class="muted">${Object.keys(a.equipes || {}).map(x => `${nomPole(x)} ${hOu((a.heures || {})[x])}`).join(' · ') || 'sans pôle'}${nombre(a.contrat) != null ? ` · contrat ${K.fmtH(a.contrat)}` : ''}</span></span><span class="droite"><span class="puce pole">l’ajouter à mon pôle ›</span></span></button>`).join('')}</div>` : ''}
      ${q && !pris ? `<button type="button" class="aesh" id="n-nouveau" data-a="choisir-nouveau"><span class="sigle">${esc(K.normSigle(f.recherche))}</span><span class="det"><b>Nouvel AESH ${esc(K.normSigle(f.recherche))}</b><span class="muted">n’existe dans aucun pôle</span></span><span class="droite"><span class="puce ok">créer ›</span></span></button>` : ''}
      ${pris && !existants.some(a => K.cleSigle(a.sigle) === q) ? `<div class="bandeau warn">Ce sigle est déjà dans votre pôle.</div>` : ''}
    </div>`;
  }
  /* Cours du pôle où le besoin estimé dépasse les AESH placés, cette semaine, et où l'AESH est libre. */
  function ouIntervenir(aeshId) {
    const p = P(), c = ctx(), out = [], vus = new Set();
    classesDu(p.id).forEach(nom => S.edt.classes[nom].cours.forEach(id => {
      const cr = S.edt.cours[id], iso = K.ajoute(S.lundi, cr.j); if (vus.has(id) || !K.coursALieu(S.C, S.edt, cr, iso)) return;
      const bes = K.besoinDuCours(S.est, nom, cr); if (!bes || !bes.nb) return;
      const pl = new Set(placesCours(id, iso).map(x => x.aeshId)); if (pl.size >= bes.nb || pl.has(aeshId)) return;
      const d = K.disponibilite(c, aeshId, id, iso, iso, p.id); if (d.etat !== 'libre') return;
      vus.add(id); out.push({ classe: nom, cours: cr, besoin: bes.nb, places: pl.size });
    }));
    return out.sort((x, y) => (y.besoin - y.places) - (x.besoin - x.places) || x.cours.j - y.cours.j);
  }

  /* ─────────── absences ─────────── */
  function formAbsence() {
    if (!S.form || S.form.kind !== 'absence') {
      const auj = K.isoLocal();
      S.form = { kind: 'absence', aeshId: S.route.p.id || '', motif: 'formation', du: auj, au: auj, journee: true, debut: '08:30', fin: '12:30', note: '' };
    }
    return S.form;
  }
  function coursTouches(f) {
    const I = idx(), out = [];
    if (!f.aeshId || !K.RE_DATE.test(f.du) || !K.RE_DATE.test(f.au) || f.au < f.du) return out;
    for (let d = f.du, n = 0; d <= f.au && n < 190; d = K.ajoute(d, 1), n++) {
      const j = K.jourSemaine(d); if (j > 4 || S.C.off(d)) continue;
      const vus = new Set();
      I.places.forEach(p => {
        if (p.aeshId !== f.aeshId || p.jour !== j || d < p.du || d > p.au || vus.has(p.coursId)) return;
        const c = S.edt.cours[p.coursId]; if (!c || !K.coursALieu(S.C, S.edt, c, d)) return;
        if (!f.journee && !K.chevauche(f.debut, f.fin, c.d, c.f)) return;
        vus.add(p.coursId); out.push({ d, c, pole: p.pole });
      });
    }
    return out;
  }
  function ecranAbsence() {
    const f = formAbsence(), p = P(), I = idx(), liste = K.aeshActifs(I, p.id);
    const touches = coursTouches(f), valide = f.aeshId && K.RE_DATE.test(f.du) && K.RE_DATE.test(f.au) && f.au >= f.du && (f.journee || K.min(f.fin) > K.min(f.debut));
    const aVenir = I.absences.filter(x => liste.some(a => a.id === x.aeshId) && x.au >= K.isoLocal()).sort((a, b) => a.du.localeCompare(b.du));
    return `<div class="fiche"><h1 id="titre" tabindex="-1">Absence ou formation</h1>
      <div class="champs">
        <div class="champ" style="grid-template-columns:1fr"><span class="lib"><b>Qui</b></span><div class="choix" role="group" aria-label="AESH">${liste.map(a => `<button type="button" id="ab-a-${esc(a.id)}" data-a="abs-aesh" data-v="${esc(a.id)}" aria-pressed="${f.aeshId === a.id}">${esc(a.sigle)}</button>`).join('')}</div></div>
        <div class="champ" style="grid-template-columns:1fr"><span class="lib"><b>Motif</b></span><div class="choix" role="group" aria-label="Motif">${Object.entries(K.MOTIFS).map(([k, l]) => `<button type="button" id="ab-m-${k}" data-a="abs-motif" data-v="${k}" aria-pressed="${f.motif === k}">${l}</button>`).join('')}</div></div>
        <div class="champ" style="grid-template-columns:1fr"><span class="lib"><b>Dates</b></span><div class="ligne"><label for="ab-du">du</label><input type="date" id="ab-du" data-i="abs-du" value="${esc(f.du)}"><label for="ab-au">au</label><input type="date" id="ab-au" data-i="abs-au" value="${esc(f.au)}" min="${esc(f.du)}"></div></div>
        <div class="champ" style="grid-template-columns:1fr"><span class="lib"><b>Horaires</b></span><div class="ligne"><div class="choix" role="group" aria-label="Journée"><button type="button" id="ab-j1" data-a="abs-journee" data-v="1" aria-pressed="${f.journee}">Journée entière</button><button type="button" id="ab-j0" data-a="abs-journee" data-v="0" aria-pressed="${!f.journee}">Quelques heures</button></div>
          ${f.journee ? '' : `<select id="ab-hd" data-i="abs-debut" aria-label="De">${CRENEAUX_H.map(h => `<option ${h === f.debut ? 'selected' : ''} value="${h}">${K.hFr(h)}</option>`).join('')}</select>–<select id="ab-hf" data-i="abs-fin" aria-label="À">${CRENEAUX_H.map(h => `<option ${h === f.fin ? 'selected' : ''} value="${h}">${K.hFr(h)}</option>`).join('')}</select>`}</div></div>
        <div class="champ" style="grid-template-columns:1fr"><label class="lib" for="ab-note"><b>Précision</b><small>facultatif · sans nom</small></label><input type="text" id="ab-note" data-i="abs-note" maxlength="120" value="${esc(f.note)}"></div>
      </div>
      ${f.aeshId && valide ? `<div class="bandeau ${touches.length ? 'err' : 'info'}">${touches.length ? `${touches.length} accompagnement${touches.length > 1 ? 's' : ''} à couvrir : ${touches.slice(0, 8).map(t => `${K.JOURS_C[K.jourSemaine(t.d)]} ${K.jjmm(t.d)} ${K.hFr(t.c.d)} ${t.c.cls.map(n => S.edt.classes[n].court).join('/')}${t.pole !== p.id ? ` (${nomPole(t.pole)})` : ''}`).map(esc).join(' · ')}${touches.length > 8 ? ' …' : ''}` : 'Aucun cours placé sur ces dates.'}</div>` : ''}
      <div class="barre-bas">${f.id ? `<button type="button" class="btn" id="ab-annuler" data-a="annuler-absence">Annuler la modification</button>` : ''}<button type="button" class="btn valider" id="ab-valider" data-a="valider-absence" ${valide ? '' : 'disabled'}>✓ ${f.id ? 'Enregistrer la modification' : 'Enregistrer l’absence'}</button></div>
      ${aVenir.length ? `<div class="carte pad" style="display:grid;gap:10px"><h2>À venir</h2>${aVenir.map(x => { const a = I.aesh.get(x.aeshId); return `<div class="ligne ecarte"><span><b>${esc(a ? a.sigle : '?')}</b> · <span class="puce err">${esc(K.MOTIFS[x.motif])}</span> ${x.du === x.au ? esc(K.dateLongue(x.du)) : `du ${esc(K.dateCourte(x.du))} au ${esc(K.dateCourte(x.au))}`}${x.journee === false ? ` · ${K.hFr(x.debut)}–${K.hFr(x.fin)}` : ''}${x.note ? ` · <span class="muted">${esc(x.note)}</span>` : ''}</span><span class="ligne" style="gap:6px"><button type="button" class="btn petit" id="ab-mod-${esc(x.id)}" data-a="modifier-absence" data-v="${esc(x.id)}">Modifier</button><button type="button" class="btn petit danger" id="ab-ret-${esc(x.id)}" data-a="retirer-absence" data-v="${esc(x.id)}">Retirer</button></span></div>`; }).join('')}</div>` : ''}
    </div>`;
  }

  /* ─────────── réunions institutionnelles ─────────── */
  function ecranReunions() {
    const I = idx();
    if (!S.form || S.form.kind !== 'reunion') { let d = K.isoLocal(); while (K.jourSemaine(d) !== 0) d = K.ajoute(d, 1); S.form = { kind: 'reunion', date: d, debut: '08:30', fin: '09:30' }; }
    const f = S.form, liste = I.reunions.slice().sort((a, b) => a.date.localeCompare(b.date));
    const valide = K.RE_DATE.test(f.date) && K.min(f.fin) > K.min(f.debut) && !S.C.off(f.date) && K.jourSemaine(f.date) < 5;
    return `<div class="fiche"><h1 id="titre" tabindex="-1">Réunions institutionnelles</h1>
      <p class="sous">Une fois par mois, tous les AESH. Cette semaine-là, elle remplace la réunion d’équipe.</p>
      <div class="champs"><div class="champ" style="grid-template-columns:1fr"><span class="lib"><b>Date</b></span>
        <div class="ligne"><input type="date" id="r-date" data-i="r-date" value="${esc(f.date)}"><select id="r-debut" data-i="r-debut" aria-label="Début">${CRENEAUX_H.map(h => `<option ${h === f.debut ? 'selected' : ''} value="${h}">${K.hFr(h)}</option>`).join('')}</select>–<select id="r-fin" data-i="r-fin" aria-label="Fin">${CRENEAUX_H.map(h => `<option ${h === f.fin ? 'selected' : ''} value="${h}">${K.hFr(h)}</option>`).join('')}</select></div>
        ${K.RE_DATE.test(f.date) ? `<small class="muted">${esc(K.dateLongue(f.date))}${S.C.off(f.date) ? ' · ' + esc(S.C.off(f.date)) : ''}</small>` : ''}</div></div>
      <div class="barre-bas" style="position:static;background:none;padding:0"><button type="button" class="btn valider" id="r-valider" data-a="valider-reunion" ${valide ? '' : 'disabled'}>✓ Ajouter cette date</button></div>
      <div class="carte pad" style="display:grid;gap:10px"><h2>Dates prévues</h2>${liste.length ? liste.map(r => `<div class="ligne ecarte"><span><b>${esc(K.dateLongue(r.date))}</b> · ${K.hFr(r.debut)}–${K.hFr(r.fin)}${r.date < K.isoLocal() ? ' <span class="puce">passée</span>' : ''}</span><button type="button" class="btn petit danger" id="r-ret-${esc(r.id)}" data-a="retirer-reunion" data-v="${esc(r.id)}">Retirer</button></div>`).join('') : '<span class="muted">Aucune date pour l’instant.</span>'}</div>
    </div>`;
  }

  /* ─────────── emploi du temps ─────────── */
  function classeCourante() {
    const l = classesDu(P().id); let c = S.route.p.classe;
    if (!l.includes(c)) c = l.includes(S.derniereClasse) ? S.derniereClasse : l[0];
    S.derniereClasse = c; return c;
  }
  function ecranEdt() {
    const p = P(), nom = classeCourante(), k = S.edt.classes[nom], sem = S.C.semaine(S.lundi), I = idx();
    const pf = (k.pfmp || []).filter(x => x.debut <= K.ajoute(S.lundi, 4) && x.fin >= S.lundi);
    const cours = k.cours.map(id => S.edt.cours[id]).filter(c => S.C.coursSemaine(c, S.lundi));
    const H0 = 8 * 60, H1 = 18 * 60, PX = 1.25;
    const blocHtml = (c, large) => {
      const iso = K.ajoute(S.lundi, c.j), lieu = K.coursALieu(S.C, S.edt, c, iso);
      const pl = placesCours(c.id, iso), aeshs = [...new Map(pl.map(x => [x.aeshId, I.aesh.get(x.aeshId)])).values()].filter(Boolean);
      const bes = K.besoinDuCours(S.est, nom, c), [mc] = couleurMatiere(c.mat);
      const nbPresents = aeshs.filter(a => !K.absentLe(I, a.id, iso, c.d, c.f)).length;
      const pills = aeshs.map(a => `<span class="pill ${K.absentLe(I, a.id, iso, c.d, c.f) ? 'abs' : ''}" title="${K.absentLe(I, a.id, iso, c.d, c.f) ? 'absent : à couvrir' : ''}" style="${(a.equipes || {})[p.id] ? '' : 'border-style:dashed'}">${esc(a.sigle)}</span>`).join('');
      const besHtml = bes ? `<span class="bes ${nbPresents >= bes.nb ? 'ok' : 'manque'}" title="Besoin estimé par les enseignants : ${bes.nb} AESH${bes.eleves != null ? ` · ${bes.eleves} élèves` : ''}">${nbPresents}/${bes.nb}</span>` : '';
      const lib = `${K.JOURS[c.j]} ${K.hFr(c.d)}–${K.hFr(c.f)}, ${c.lib}${c.salle.length ? ', ' + c.salle.join(', ') : ''}${aeshs.length ? ', AESH ' + aeshs.map(a => a.sigle).join(' ') : ', aucun AESH'}`;
      if (large) {
        const top = (K.min(c.d) - H0) * PX, h = (K.min(c.f) - K.min(c.d)) * PX;
        return `<button type="button" class="bloc ${S.flash === c.id ? 'flash' : ''}" id="c-${esc(c.id)}" data-a="placer" data-v="${esc(c.id)}" style="--mc:${mc};top:${top + 1}px;height:${h - 2}px;left:${3 + (c._col || 0) * (100 / (c._cols || 1))}%;width:calc(${100 / (c._cols || 1)}% - 6px)${lieu ? '' : ';opacity:.45'}" aria-label="${esc(lib)}">
          ${besHtml}<b>${esc(c.lib)}</b>${h > 38 ? `<span class="salle">${esc(c.salle.join(' · '))}</span>` : ''}<span class="pills">${pills}</span></button>`;
      }
      return `<button type="button" class="cours-l" id="cl-${esc(c.id)}" data-a="placer" data-v="${esc(c.id)}" style="--mc:${mc}${lieu ? '' : ';opacity:.5'}" aria-label="${esc(lib)}">
        <span class="h">${K.hFr(c.d)}–${K.hFr(c.f)}</span><span class="m"><b>${esc(c.lib)}</b><small>${esc([c.salle.join(' · '), c.cls.length > 1 ? 'avec ' + c.cls.filter(n => n !== nom).map(n => S.edt.classes[n].court).join(', ') : ''].filter(Boolean).join(' · '))}</small></span>
        <span class="pills">${besHtml ? besHtml.replace('class="bes', 'style="position:static" class="bes') : ''}${pills || '<span class="pill" style="opacity:.55">＋</span>'}</span></button>`;
    };
    /* colonnes pour les cours qui se chevauchent (semaine A et B affichées séparément, donc rares) */
    [0, 1, 2, 3, 4].forEach(j => {
      const l = cours.filter(c => c.j === j).sort((a, b) => K.min(a.d) - K.min(b.d)), cols = [];
      l.forEach(c => { let i = cols.findIndex(col => col.every(x => !K.chevauche(x.d, x.f, c.d, c.f))); if (i < 0) { cols.push([]); i = cols.length - 1; } cols[i].push(c); c._col = i; });
      l.forEach(c => { const g = l.filter(x => K.chevauche(x.d, x.f, c.d, c.f)); c._cols = Math.max(1, ...g.map(x => x._col + 1)); });
    });
    let grille = `<div class="defile seul-large"><div class="grille-edt"><div class="g-tete"></div>${sem.jours.map((jr, j) => `<div class="g-tete">${K.JOURS[j]}<small>${K.jjmm(jr.date)}</small></div>`).join('')}
      <div class="g-heures" style="height:${(H1 - H0) * PX}px">${Array.from({ length: 11 }, (_, i) => `<span style="top:${i * 60 * PX}px">${8 + i}h</span>`).join('')}</div>`;
    sem.jours.forEach((jr, j) => {
      grille += `<div class="g-jour" style="height:${(H1 - H0) * PX}px">${Array.from({ length: 10 }, (_, i) => `<div class="g-ligne" style="top:${(i + 1) * 60 * PX}px"></div>`).join('')}
        ${jr.off ? `<div class="g-vac">${esc(jr.off)}</div>` : cours.filter(c => c.j === j).map(c => blocHtml(c, true)).join('')}</div>`;
    });
    grille += `</div></div>`;
    const liste = `<div class="jours-liste seul-etroit">${sem.jours.map((jr, j) => { const l = cours.filter(c => c.j === j).sort((a, b) => K.min(a.d) - K.min(b.d)); return `<section><h2 class="jour-titre">${K.JOURS[j]} ${K.jjmm(jr.date)}</h2>${jr.off ? `<div class="bandeau info">${esc(jr.off)}</div>` : l.map(c => blocHtml(c, false)).join('') || '<span class="muted">Pas de cours</span>'}</section>`; }).join('')}</div>`;
    return `<div class="salut"><div><h1 id="titre" tabindex="-1">Emploi du temps</h1><p class="sous">${esc(k.court)} · ${sem.parite ? 'semaine ' + sem.parite : 'pas de cours'}</p></div>${selecteurSemaine()}</div>
      <div class="classes" role="group" aria-label="Classe">${classesDu(p.id).map(n => `<button type="button" id="cls-${n}" data-a="classe" data-v="${n}" aria-pressed="${n === nom}">${esc(S.edt.classes[n].court)}</button>`).join('')}</div>
      ${pf.length ? `<div class="bandeau warn">PFMP ${pf.map(x => `du ${K.dateCourte(x.debut)} au ${K.dateCourte(x.fin)}`).join(' · ')}</div>` : ''}
      <div class="legende"><span><span class="pill">CÉ</span> AESH placé</span><span><span class="bes manque" style="position:static">1/2</span> présents / besoin estimé</span><span><span class="pill abs">L</span> absent : à couvrir</span></div>
      ${grille}${liste}`;
  }

  /* feuille « placer des AESH » */
  function feuillePlacer(f) {
    const p = P(), c = S.edt.cours[f.coursId], nom = f.classe, I = idx(), cx = ctx(), iso = K.ajoute(S.lundi, c.j);
    const au = finPeriode(f), du = S.lundi;
    const bes = K.besoinDuCours(S.est, nom, c);
    const dejaIci = new Set(I.places.filter(x => x.coursId === c.id && x.au >= du).map(x => x.aeshId));
    const candidats = K.aeshActifs(I, p.id), dispo = K.disponiblesAilleurs(cx, p.id, S.lundi, poleComplet), dispoDe = Object.fromEntries(dispo.map(x => [x.a.id, x]));
    const autres = K.aeshActifs(I).filter(a => !(a.equipes || {})[p.id]).sort((x, y) => ((dispoDe[y.id] || {}).dispo || 0) - ((dispoDe[x.id] || {}).dispo || 0));
    const bouton = (a, ailleurs) => {
      const d = K.disponibilite(cx, a.id, c.id, du, au, p.id), on = f.choisis.includes(a.id);
      const cl = d.etat === 'pris' && !dejaIci.has(a.id) ? 'pris' : d.etat === 'trop' ? 'trop' : d.etat === 'reunion' ? 'reunion' : '';
      const b = K.bilan(cx, a.id, S.lundi), x = dispoDe[a.id];
      const ligne3 = ailleurs ? (x ? `${K.fmtH(x.dispo)} dispo · ${x.complets.map(q => nomPole(q.p) + (q.complet ? ' complet' : ' en cours')).join(', ')}` : `${Object.keys(a.equipes || {}).map(nomPole).join(', ')} · rien de disponible`) : (b && b.reste != null ? `reste ${K.fmtH(b.reste)}` : '');
      return `<button type="button" class="${cl}" id="pa-${esc(a.id)}" data-a="choix-aesh" data-v="${esc(a.id)}" aria-pressed="${on}" ${cl === 'pris' ? 'aria-disabled="true"' : ''} title="${esc(d.detail || '')}"><b>${esc(a.sigle)}</b><small>${on ? '✓ choisi' : esc(dejaIci.has(a.id) ? 'placé' : d.texte)}</small>${ligne3 ? `<small>${esc(ligne3)}</small>` : ''}</button>`;
    };
    const avant = [...dejaIci], ajout = f.choisis.filter(x => !dejaIci.has(x)), retrait = avant.filter(x => !f.choisis.includes(x));
    const rac = raccourcis();
    return `<h2 id="f-titre" tabindex="-1">${K.JOURS[c.j]} ${K.hFr(c.d)}–${K.hFr(c.f)}</h2>
      <p class="sous" style="margin-top:-8px">${esc(c.lib)} · ${esc(c.cls.map(n => S.edt.classes[n].court).join(' + '))}${c.salle.length ? ' · ' + esc(c.salle.join(' · ')) : ''}${c.sem === 'SA' ? ' · semaine A' : c.sem === 'SB' ? ' · semaine B' : ''}</p>
      ${bes ? `<div class="bandeau info">Besoin estimé par les enseignants : <b>${bes.nb} AESH</b>${bes.eleves != null ? ` · ${bes.eleves} élèves` : ''}${bes.au ? ` · jusqu’au ${K.jjmm(bes.au)}` : ''}</div>` : ''}
      <div><b>Qui accompagne ?</b></div>
      <div class="choix-aesh" role="group" aria-label="AESH du pôle">${candidats.map(bouton).join('')}</div>
      ${autres.length ? (f.autres ? `<div><b>Autres pôles</b> <span class="muted" style="font-weight:500;font-size:.9rem">· triés par heures disponibles</span></div><div class="choix-aesh" role="group" aria-label="AESH des autres pôles">${autres.map(a => bouton(a, true)).join('')}</div>` : `<button type="button" class="lien" id="pa-autres" data-a="autres-aesh">＋ AESH d’un autre pôle${dispo.length ? ` (${dispo.length} avec des heures disponibles)` : ''}</button>`) : ''}
      <div style="display:grid;gap:8px"><b>À partir du ${esc(K.dateCourte(du))}, jusqu’à</b><div class="choix" role="group" aria-label="Période">${rac.map(r => `<button type="button" id="per-${r.id}" data-a="periode" data-v="${r.id}" aria-pressed="${f.periode === r.id}">${esc(r.label)} <span class="muted">(${K.jjmm(r.fin)})</span></button>`).join('')}
        <button type="button" id="per-date" data-a="periode" data-v="date" aria-pressed="${f.periode === 'date'}">Une date</button></div>
        ${f.periode === 'date' ? `<input type="date" id="per-au" data-i="per-au" value="${esc(f.au || '')}" min="${esc(du)}">` : ''}</div>
      <div class="actions"><button type="button" class="btn" id="pl-fermer" data-a="fermer">Fermer</button>
        <button type="button" class="btn valider" id="pl-valider" data-a="valider-placer" ${(ajout.length || retrait.length) && K.RE_DATE.test(au) && au >= du ? '' : 'disabled'}>✓ Enregistrer</button></div>`;
  }
  function raccourcis() {
    const l = S.lundi, out = [{ id: 'semaine', label: 'Cette semaine', fin: K.ajoute(l, 4) }];
    const avant = debut => { let f = K.ajoute(debut, -1); while (K.jourSemaine(f) > 4 || S.C.off(f)) f = K.ajoute(f, -1); return f; };
    S.C.vacances.filter(v => /^Vacances/.test(v.label) && !/été/.test(v.label) && v.debut > l).slice(0, 2)
      .forEach(v => out.push({ id: 'v-' + v.debut, label: `Jusqu’aux ${v.label.charAt(0).toLowerCase()}${v.label.slice(1)}`, fin: avant(v.debut) }));
    const ete = S.C.vacances.find(v => /été/.test(v.label));
    out.push({ id: 'annee', label: 'Toute l’année', fin: ete ? avant(ete.debut) : '2027-07-02' });
    return out;
  }
  const finPeriode = f => f.periode === 'date' ? (f.au || '') : ((raccourcis().find(r => r.id === f.periode) || {}).fin || '');

  /* ─────────── vue d'ensemble ─────────── */
  function ecranEnsemble() {
    const p = P(), I = idx(), cx = ctx(), tous = !!S.route.p.tous;
    const liste = tous ? K.aeshActifs(I) : K.aeshActifs(I, p.id), sem = S.C.semaine(S.lundi);
    let g = `<div class="t"></div>${sem.jours.map((jr, j) => `<div class="t">${K.JOURS[j]} <span class="muted" style="font-weight:600">${K.jjmm(jr.date)}</span></div>`).join('')}`;
    liste.forEach(a => {
      const b = K.bilan(cx, a.id, S.lundi), occ = b.occ, pa = pole(Object.keys(a.equipes || {})[0]) || p;
      g += `<button type="button" class="n" id="e-${esc(a.id)}" data-a="fiche" data-v="${esc(a.id)}"><span class="sigle" style="--pole:${pa.couleur}">${esc(a.sigle)}</span><span><b>${K.fmtH(b.total)}</b><small>${b.reste == null ? 'contrat à compléter' : `reste ${K.fmtH(b.reste)}`}</small>${b.alertes.some(x => x.type === 'conflit' || x.type === 'contrat') ? '<small style="color:var(--err);font-weight:700">⚠ alerte</small>' : ''}</span></button>`;
      [0, 1, 2, 3, 4].forEach(j => {
        const l = occ.filter(o => o.j === j);
        g += `<div class="c">${l.length ? l.map(o => {
          if (o.type === 'vacances') return `<span class="occ vac">${esc(o.label)}</span>`;
          if (o.type === 'cours') { const pc = pole(o.pole) || p; return `<button type="button" class="occ ${o.absent ? 'abs' : ''}" style="--oc:${pc.couleur}" id="eo-${esc(a.id)}-${esc(o.cours.id)}" data-a="edt-cours" data-v="${esc(o.cours.cls.find(n => classesDu(p.id).includes(n)) || o.cours.cls[0])}|${esc(o.cours.id)}" title="${esc(`${K.hFr(o.debut)}–${K.hFr(o.fin)} ${o.cours.lib} · ${nomPole(o.pole)}`)}">${K.hFr(o.debut)} ${esc(o.cours.cls.map(n => n.replace(/^(C[12]|B[12T])/, '$1 ')).join('/'))}</button>`; }
          if (o.type === 'absence') return `<span class="occ absence">${esc(o.label)}</span>`;
          return `<span class="occ gris">${K.hFr(o.debut)} ${esc(o.type === 'institution' ? 'réunion instit.' : 'réunion')}</span>`;
        }).join('') : '<span class="libre">libre</span>'}</div>`;
      });
    });
    return `<div class="salut"><div><h1 id="titre" tabindex="-1">Vue d’ensemble</h1><p class="sous">${tous ? 'Tous les pôles' : esc(p.nom)} · ${sem.parite ? 'semaine ' + sem.parite : 'pas de cours'}</p></div>${selecteurSemaine()}</div>
      <div class="ligne ecarte"><div class="choix" role="group" aria-label="Qui"><button type="button" id="ens-pole" data-a="ens-tous" data-v="0" aria-pressed="${!tous}">Mon pôle</button><button type="button" id="ens-tous" data-a="ens-tous" data-v="1" aria-pressed="${tous}">Tous les pôles</button></div>
        <div class="legende">${POLES.map(x => `<span><span class="occ" style="--oc:${x.couleur};display:inline-block;width:auto">${esc(x.nom)}</span></span>`).join('')}</div></div>
      ${liste.length ? `<div class="defile"><div class="ens">${g}</div></div>` : `<div class="etat-vide"><b>Aucun AESH</b></div>`}`;
  }

  /* ─────────── besoins ─────────── */
  function besoinsResume(pid) {
    let estimes = 0, manque = 0; const vus = new Set();
    classesDu(pid).forEach(nom => S.edt.classes[nom].cours.forEach(id => {
      const c = S.edt.cours[id], bes = K.besoinDuCours(S.est, nom, c); if (!bes) return;
      const k = nom + id; if (vus.has(k)) return; vus.add(k); estimes++;
      const iso = K.ajoute(S.lundi, c.j);
      if (bes.nb > 0 && K.coursALieu(S.C, S.edt, c, iso)) { const n = new Set(placesCours(id, iso).filter(x => !K.absentLe(idx(), x.aeshId, iso, c.d, c.f)).map(x => x.aeshId)).size; if (n < bes.nb) manque++; }
    }));
    return { estimes, manque };
  }
  function ecranBesoins() {
    const p = P(), I = idx(), filtre = S.route.p.classe || '';
    let lignes = '', demandees = 0, total = 0, estimes = 0, manque = 0;
    classesDu(p.id).filter(n => !filtre || n === filtre).forEach(nom => {
      const k = S.edt.classes[nom];
      const cours = k.cours.map(id => S.edt.cours[id]).sort((a, b) => a.j - b.j || K.min(a.d) - K.min(b.d));
      lignes += `<tr class="grp"><td colspan="6">${esc(k.court)}</td></tr>`;
      cours.forEach(c => {
        total++;
        const bes = K.besoinDuCours(S.est, nom, c), iso = K.ajoute(S.lundi, c.j), lieu = K.coursALieu(S.C, S.edt, c, iso);
        const pl = [...new Set(placesCours(c.id, iso).map(x => x.aeshId))].map(id => I.aesh.get(id)).filter(Boolean);
        const presents = pl.filter(a => !K.absentLe(I, a.id, iso, c.d, c.f)).length;
        if (bes) { estimes++; if (lieu) demandees += bes.nb * K.duree(c.d, c.f); }
        let etat = '<span class="muted">—</span>';
        if (bes && !lieu) etat = '<span class="puce">pas cette semaine</span>';
        else if (bes && bes.nb === 0) etat = '<span class="puce">pas besoin</span>';
        else if (bes && presents >= bes.nb) etat = '<span class="puce ok">couvert</span>';
        else if (bes) { etat = `<span class="puce warn">manque ${bes.nb - presents}</span>`; manque++; }
        lignes += `<tr id="b-${esc(nom)}-${esc(c.id)}" data-a="edt-cours" data-v="${esc(nom)}|${esc(c.id)}" tabindex="0">
          <td class="num" style="white-space:nowrap"><b>${K.JOURS_C[c.j]}</b> ${K.hFr(c.d)}–${K.hFr(c.f)}${c.sem === 'SA' ? ' <span class="puce">A</span>' : c.sem === 'SB' ? ' <span class="puce">B</span>' : ''}</td>
          <td><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${couleurMatiere(c.mat)[0]};margin-right:6px"></span>${esc(c.lib)}</td>
          <td>${bes ? `<span class="gros-nb">${bes.nb}</span>` : '<span class="muted">—</span>'}</td>
          <td>${bes && bes.eleves != null ? `${bes.eleves}` : '<span class="muted">—</span>'}</td>
          <td>${pl.map(a => `<span class="pill ${K.absentLe(I, a.id, iso, c.d, c.f) ? 'abs' : ''}">${esc(a.sigle)}</span>`).join(' ') || '<span class="muted">—</span>'}</td>
          <td>${etat}</td></tr>`;
      });
    });
    const prevu = K.aeshActifs(I, p.id).reduce((s, a) => s + (nombre((a.heures || {})[p.id]) || 0), 0);
    return `<div class="salut"><div><h1 id="titre" tabindex="-1">Besoins</h1><p class="sous">Estimés par les enseignants${S.cadreEst ? ` · ${esc(S.cadreEst.label || '')} ${K.jjmm(S.cadreEst.debut)} → ${K.jjmm(S.cadreEst.fin)}` : ''}</p></div>${selecteurSemaine()}</div>
      <div class="ligne"><button type="button" class="btn pri" id="bes-partager" data-a="partager">✉️ Envoyer le lien à mes collègues</button></div>
      ${S.estEtat === 'horsligne' ? `<div class="bandeau warn">Les estimations n’ont pas pu être lues.</div>` : ''}
      <div class="stats">
        <div class="carte stat"><b>${estimes}<span class="muted" style="font-size:1rem"> / ${total}</span></b><small>cours estimés</small></div>
        <div class="carte stat"><b>${K.fmtH(demandees)}</b><small>demandées cette semaine</small></div>
        <div class="carte stat"><b>${K.fmtH(prevu)}</b><small>heures AESH du pôle</small></div>
        <div class="carte stat"><b style="color:${manque ? 'var(--warn)' : 'var(--ok)'}">${manque}</b><small>cours à couvrir</small></div>
      </div>
      <div class="classes" role="group" aria-label="Filtrer"><button type="button" id="bf-tout" data-a="bes-classe" data-v="" aria-pressed="${!filtre}">Toutes</button>${classesDu(p.id).map(n => `<button type="button" id="bf-${n}" data-a="bes-classe" data-v="${n}" aria-pressed="${filtre === n}">${esc(S.edt.classes[n].court)}</button>`).join('')}</div>
      <div class="defile"><table class="table" style="min-width:680px"><thead><tr><th>Créneau</th><th>Matière</th><th>Besoin</th><th>Élèves</th><th>Placés</th><th>État</th></tr></thead><tbody>${lignes}</tbody></table></div>
      ${manque ? carteDisponibles('Pour couvrir : disponibles ailleurs') : ''}`;
  }

  /* ─────────── messages ─────────── */
  function messagesNonLus() {
    if (!S.session) return 0;
    const lu = lsLit(K_LU, ''), I = idx();
    return I.messages.filter(m => m.statut === 'active' && m.pole !== S.session.pole && String(m.creeLe || '') > lu).length;
  }
  function marquerLus() { const I = idx(), der = I.messages.reduce((m, x) => String(x.creeLe || '') > m ? String(x.creeLe) : m, ''); if (der && der > lsLit(K_LU, '')) { lsEcrit(K_LU, der); } }
  function ecranMessages() {
    const I = idx(), moi = S.session.pole;
    return `<div class="salut"><div><h1 id="titre" tabindex="-1">Messages</h1><p class="sous">Entre référents · tous les pôles</p></div></div>
      <div class="fil" aria-live="polite">${I.messages.length ? (() => { let jour = ''; return I.messages.map(m => {
        const pm = pole(m.pole) || { nom: '?', couleur: '#64748b' }, mien = m.pole === moi, j = String(m.creeLe || '').slice(0, 10);
        const sep = j !== jour ? (jour = j, `<div class="jour-sep"><span>${esc(j === K.isoLocal() ? 'Aujourd’hui' : K.dateLongue(j))}</span></div>`) : '';
        return `${sep}<div class="bulle ${mien ? 'moi' : ''} ${m.statut !== 'active' ? 'retire' : ''}" style="--oc:${pm.couleur}"><span class="bulle-av">${avatarHtml(m.pole, 36)}</span><div class="bulle-corps"><div class="qui"><b>${esc(pm.nom)}</b><span>${esc(String(new Date(m.creeLe).getHours()))} h ${esc(K.z2(new Date(m.creeLe).getMinutes()))}</span>${mien && m.statut === 'active' ? `<button type="button" class="lien" style="font-size:.8rem" id="msg-ret-${esc(m.id)}" data-a="retirer-message" data-v="${esc(m.id)}">retirer</button>` : ''}</div><p>${m.statut === 'active' ? esc(m.texte) : 'Message retiré'}</p></div></div>`;
      }).join(''); })() : `<div class="etat-vide"><b>Aucun message</b>Écrivez le premier.</div>`}<span id="fil-fin"></span></div>
      <div class="ecrire"><div class="choix" role="group" aria-label="Écrire à" style="width:100%;gap:6px">${POLES.filter(x => x.id !== moi).map(x => `<button type="button" class="petit" id="a-${x.id}" data-a="ecrire-a" data-v="${x.id}" style="min-height:32px;padding:4px 10px;font-size:.85rem;border-color:${x.couleur}40;color:${x.couleur}">@ ${esc(x.nom)}</button>`).join('')}</div><label class="sr" for="msg-txt">Votre message</label><textarea id="msg-txt" data-i="msg" maxlength="1000" placeholder="Votre message (sans nom d’élève)">${esc(S.msgBrouillon)}</textarea>
        <button type="button" class="btn pri" id="msg-envoyer" data-a="envoyer-message" ${S.msgBrouillon.trim() && !S.envoi ? '' : 'disabled'}>${S.envoi ? '…' : 'Envoyer'}</button></div>`;
  }

  /* ─────────── exporter ─────────── */
  function ecranExporter() {
    const p = P(), I = idx(), e = S.exp, liste = K.aeshActifs(I, p.id);
    const choix = (id, v, l) => `<button type="button" id="x-q-${v}" data-a="exp-quoi" data-v="${v}" aria-pressed="${e.quoi === v}">${l}</button>`;
    const pret = e.quoi === 'pole' || e.quoi === 'tous' || e.ids.length;
    return `<div class="salut"><div><h1 id="titre" tabindex="-1">Exporter</h1><p class="sous">${esc(p.nom)}</p></div>${selecteurSemaine()}</div>
      <div class="carte pad" style="display:grid;gap:14px">
        <div style="display:grid;gap:8px"><b>Quoi</b><div class="choix" role="group" aria-label="Quoi">${choix('', 'pole', 'Toute l’équipe du pôle')}${choix('', 'aesh', 'Un ou plusieurs AESH')}${choix('', 'classe', 'Une ou plusieurs classes')}${choix('', 'tous', 'Tous les pôles')}</div></div>
        ${e.quoi === 'aesh' ? `<div class="choix" role="group" aria-label="AESH">${liste.map(a => `<button type="button" id="x-a-${esc(a.id)}" data-a="exp-id" data-v="${esc(a.id)}" aria-pressed="${e.ids.includes(a.id)}">${esc(a.sigle)}</button>`).join('')}</div>` : ''}
        ${e.quoi === 'classe' ? `<div class="choix" role="group" aria-label="Classes">${classesDu(p.id).map(n => `<button type="button" id="x-c-${n}" data-a="exp-id" data-v="${n}" aria-pressed="${e.ids.includes(n)}">${esc(S.edt.classes[n].court)}</button>`).join('')}</div>` : ''}
        <div style="display:grid;gap:8px"><b>Format</b><div class="tuiles" style="grid-template-columns:repeat(auto-fill,minmax(180px,1fr))">
          ${[['pdf', '📄', 'PDF', 'en couleurs, à imprimer'], ['excel', '📊', 'Excel', 'en couleurs, modifiable'], ['json', '💾', 'Sauvegarde', 'toutes les données (JSON)']].map(([k, ic, l, s]) => `<button type="button" class="tuile ${e.format === k ? 'forte' : ''}" style="min-height:110px" id="x-f-${k}" data-a="exp-format" data-v="${k}" aria-pressed="${e.format === k}"><span class="ic">${ic}</span><span><b>${l}</b><br><small>${s}</small></span></button>`).join('')}</div></div>
      </div>
      <div class="barre-bas"><button type="button" class="btn valider" id="x-telecharger" data-a="exporter" ${pret || e.format === 'json' ? '' : 'disabled'}>⬇ Télécharger</button></div>`;
  }
  async function lancerExport() {
    const X = await import('./exports.js?v=2026-09-17a'), F = await import('./fichiers.js?v=2026-09-17a');
    const p = P(), cx = ctx(), e = S.exp, s = S.C.semaine(S.lundi), suffixe = `${S.lundi}${s.parite ? '-sem' + s.parite : ''}`;
    const nomF = t => `${t}-${suffixe}`.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9._-]+/g, '-');
    if (e.format === 'json') { F.telecharger(X.json(cx, [...S.docs.values()]), `referents-aesh-sauvegarde-${K.isoLocal()}.json`); return; }
    let ids = [], classes = [];
    if (e.quoi === 'aesh') ids = e.ids.filter(id => cx.I.aesh.has(id));
    if (e.quoi === 'pole') ids = K.aeshActifs(cx.I, p.id).map(a => a.id);
    if (e.quoi === 'tous') ids = K.aeshActifs(cx.I).map(a => a.id);
    if (e.quoi === 'classe') classes = e.ids.filter(n => S.edt.classes[n]);
    const titre = e.quoi === 'classe' ? classes.join('-') : e.quoi === 'aesh' ? ids.map(id => cx.I.aesh.get(id).sigle).join('-') : e.quoi === 'tous' ? 'tous-les-poles' : p.slug;
    if (e.format === 'pdf') {
      if (e.quoi === 'classe') F.telecharger(X.pdfClasses(cx, classes, S.lundi), nomF(`edt-${titre}`) + '.pdf');
      else if (e.quoi === 'pole' || e.quoi === 'tous') F.telecharger(X.pdfEquipe(cx, e.quoi === 'tous' ? POLES.map(x => x.id) : [p.id], ids, S.lundi), nomF(`aesh-${titre}`) + '.pdf');
      else F.telecharger(X.pdfAesh(cx, ids, S.lundi), nomF(`aesh-${titre}`) + '.pdf');
    } else {
      if (e.quoi === 'classe') F.telecharger(X.excelClasses(cx, classes, S.lundi), nomF(`edt-${titre}`) + '.xlsx');
      else F.telecharger(X.excelAesh(cx, ids, S.lundi, e.quoi === 'pole' || e.quoi === 'tous' ? (e.quoi === 'tous' ? POLES.map(x => x.id) : [p.id]) : null), nomF(`aesh-${titre}`) + '.xlsx');
    }
  }

  /* ─────────── avatar et humeur ─────────── */
  function publierHumeur() {
    if (!S.session || S.humeur == null || S.etat !== 'ok') return;
    const d = S.docs.get('pole_' + S.session.pole), h = d && d.humeur;
    if (h && h.jour === K.isoLocal() && h.i === S.humeur) return;
    ecrirePole(S.session.pole, { humeur: { jour: K.isoLocal(), i: S.humeur } }).catch(() => { });
  }
  function carteReferents() {
    return `<div class="carte pad" style="display:grid;gap:10px"><h2>Les référents</h2><div class="referents">${POLES.map(q => { const c = poleComplet(q.id), h = humeurDe(q.id), moi = S.session && q.id === S.session.pole;
      return `<button type="button" class="ref-tuile" id="ref-${q.id}" data-a="${moi ? 'aller' : 'ecrire-a'}" data-v="${moi ? 'avatar' : q.id}" style="--pole:${q.couleur}" title="${moi ? 'Changer mon avatar' : 'Écrire au référent ' + esc(q.nom)}">${avatarHtml(q.id, 64, { classe: 'ref-av' })}<b>${esc(q.nom)}</b><small>${c ? `complet jusqu’au ${K.jjmm(c.jusquau)}` : 'saisie en cours'}</small>${h ? `<small>${esc(HUMEURS[AV.EXPRESSIONS.indexOf(h)][0])} ${esc(HUMEURS[AV.EXPRESSIONS.indexOf(h)][1].toLowerCase())}</small>` : ''}</button>`; }).join('')}</div></div>`;
  }
  function formAvatar() {
    if (!S.form || S.form.kind !== 'avatar') { const a = avatarDe(S.session.pole); S.form = { kind: 'avatar', a: a ? { ...a } : AV.auHasard('portrait'), orig: a ? JSON.stringify(a) : '', groupe: '' }; }
    return S.form;
  }
  function ecranAvatar() {
    const f = formAvatar(), a = f.a, premiere = !!S.route.p.premiere, p = pole(S.session.pole);
    const opts = a.type === 'mascotte' ? AV.OPTIONS_MASCOTTE : AV.OPTIONS_PORTRAIT;
    const modifie = JSON.stringify(AV.normaliser(a)) !== f.orig;
    const pastille = (k, l, v, type) => {
      const on = type === 'b' ? (!!a[k] === (v === 'oui')) : (a[k] || '') === v;
      if (type === 'c') return `<button type="button" class="pcoul" data-a="av-opt" data-k="${k}" data-v="${esc(v)}" aria-pressed="${on}" aria-label="${v ? esc(v) : 'aucune'}" style="background:${v || 'transparent'}${v ? '' : ';border-style:dashed'}"></button>`;
      return `<button type="button" data-a="av-opt" data-k="${k}" data-v="${esc(v)}" aria-pressed="${on}">${esc(v || 'aucune')}</button>`;
    };
    return `<div class="fiche" style="max-width:860px">
      <div><h1 id="titre" tabindex="-1">${premiere ? 'Bienvenue, référent ' + esc(p.nom) : 'Mon avatar'}</h1><p class="sous">${premiere ? 'Choisissez votre avatar : c’est lui qu’on verra dans les messages et sur l’accueil. Modifiable à tout moment.' : 'Modifiable à tout moment, jamais une photo.'}</p></div>
      <div class="atelier-av">
        <div class="av-grand"><button type="button" class="av-cadre" id="av-apercu" data-a="av-clin" aria-label="Aperçu (clin d’œil)">${AV.svgAvatar(a, { humeur: S.humeur != null ? AV.EXPRESSIONS[S.humeur] : null, taille: 200, id: 'av-svg' })}</button>
          <div class="ligne" style="justify-content:center"><button type="button" class="btn" id="av-hasard" data-a="av-hasard">🎲 Surprends-moi</button></div>
          <div class="choix" role="group" aria-label="Type" style="justify-content:center"><button type="button" id="av-t-portrait" data-a="av-type" data-v="portrait" aria-pressed="${a.type === 'portrait'}">Portrait</button><button type="button" id="av-t-mascotte" data-a="av-type" data-v="mascotte" aria-pressed="${a.type === 'mascotte'}">Mascotte</button></div>
          ${S.humeur != null ? `<span class="muted" style="font-size:.85rem;text-align:center">Expression du jour : ${esc(HUMEURS[S.humeur][1].toLowerCase())}</span>` : ''}</div>
        <div class="av-opts">${opts.map(([k, l, v, type]) => `<div class="av-opt ${f.groupe === k ? 'ouvert' : ''}"><button type="button" class="av-titre" data-a="av-groupe" data-v="${k}" aria-expanded="${f.groupe === k}"><span>${esc(l)}</span><span class="muted">${type === 'c' ? `<i class="pt" style="background:${a[k] || 'transparent'}"></i>` : type === 'b' ? (a[k] ? 'oui' : 'non') : esc(a[k] || 'aucun')}</span></button>
          ${f.groupe === k ? `<div class="av-puces">${v.map(x => pastille(k, l, x, type)).join('')}</div>` : ''}</div>`).join('')}</div>
      </div>
      <div class="barre-bas">${premiere ? '' : `<button type="button" class="btn" id="av-annuler" data-a="av-annuler">Annuler</button>`}<button type="button" class="btn valider" id="av-valider" data-a="av-valider" ${modifie || premiere ? '' : 'disabled'}>✓ C’est moi</button></div></div>`;
  }

  /* ─────────── mon code ─────────── */
  function ecranMonCode() {
    if (!S.form || S.form.kind !== 'code') S.form = { kind: 'code', voir: false, n1: '', n2: '' };
    const f = S.form, p = pole(S.session.pole), actuel = codeDe(p.id);
    const autre = POLES.find(x => x.id !== p.id && codeDe(x.id) === f.n1);
    const ok = /^\d{4}$/.test(f.n1) && f.n1 === f.n2 && f.n1 !== actuel && !autre;
    return `<div class="fiche"><h1 id="titre" tabindex="-1">Mon code</h1><p class="sous">Pôle ${esc(p.nom)}</p>
      <div class="champs">
        <div class="champ"><span class="lib"><b>Code actuel</b></span><span class="ligne"><b class="num" style="font-size:1.3rem;letter-spacing:.2em">${f.voir ? esc(actuel) : '••••'}</b><button type="button" class="lien" id="mc-voir" data-a="code-voir">${f.voir ? 'cacher' : 'afficher'}</button></span></div>
        <div class="champ"><label class="lib" for="mc-n1"><b>Nouveau code</b><small>4 chiffres</small></label><input type="text" id="mc-n1" data-i="n1" inputmode="numeric" maxlength="4" value="${esc(f.n1)}" style="width:120px;text-align:center;font-size:1.3rem;letter-spacing:.2em;font-weight:800"></div>
        <div class="champ"><label class="lib" for="mc-n2"><b>Encore une fois</b></label><input type="text" id="mc-n2" data-i="n2" inputmode="numeric" maxlength="4" value="${esc(f.n2)}" style="width:120px;text-align:center;font-size:1.3rem;letter-spacing:.2em;font-weight:800"></div>
      </div>
      ${autre ? `<div class="bandeau err">Ce code est déjà celui d’un autre pôle.</div>` : f.n2.length === 4 && f.n1 !== f.n2 ? `<div class="bandeau err">Les deux codes ne sont pas identiques.</div>` : ''}
      <div class="barre-bas"><button type="button" class="btn valider" id="mc-valider" data-a="valider-code" ${ok ? '' : 'disabled'}>✓ Changer le code</button></div></div>`;
  }

  /* ─────────── feuilles ─────────── */
  function feuille() {
    const f = S.feuille;
    let h = '', large = false;
    if (f.type === 'placer') { h = feuillePlacer(f); large = true; }
    else if (f.type === 'confirmer') h = feuilleConfirmer(f);
    else if (f.type === 'partager') h = feuillePartager(f);
    return `<div class="voile" data-a="voile"><div class="feuille ${large ? 'large' : ''} ${f.fait ? 'fait' : ''}" role="dialog" aria-modal="true" aria-labelledby="f-titre"><div class="poignee" aria-hidden="true"></div>${h}</div></div>`;
  }
  function feuilleConfirmer(f) {
    if (f.fait) return `<div class="recap"><h2 id="f-titre" tabindex="-1">✓ Enregistré</h2>${f.grand ? `<p class="grand">${esc(f.grand)}</p>` : ''}<p>${esc(f.sous || '')}</p></div>`;
    return `<div class="recap"><h2 id="f-titre" tabindex="-1">${esc(f.titre || 'Vous confirmez ?')}</h2>${f.apercu ? `<div style="display:grid;justify-items:center"><span class="av-cadre" style="width:120px;height:120px">${f.apercu}</span></div>` : ''}${f.grand ? `<p class="grand">${esc(f.grand)}</p>` : ''}${f.sous ? `<p>${esc(f.sous)}</p>` : ''}
      ${f.lignes && f.lignes.length ? `<ul>${f.lignes.map(l => `<li><span>${esc(l[0])}</span><b>${l.length > 2 ? `${esc(l[1])} → ${esc(l[2])}` : esc(l[1])}</b></li>`).join('')}</ul>` : ''}
      ${f.choixPeriode ? `<div class="choix" role="group" aria-label="Jusqu’à" style="justify-content:center;margin-top:8px">${f.choixPeriode.map(r => `<button type="button" id="cp-${r.id}" data-a="choix-periode-c" data-v="${r.id}" aria-pressed="${f.periode === r.id}">${esc(r.label)} <span class="muted">(${K.jjmm(r.fin)})</span></button>`).join('')}</div>` : ''}
      ${f.avert ? `<div class="bandeau ${f.danger ? 'err' : 'warn'}" style="text-align:left">${esc(f.avert)}</div>` : ''}</div>
      <div class="actions"><button type="button" class="btn" id="cf-non" data-a="confirmer-non" ${S.envoi ? 'disabled' : ''}>${f.danger ? 'Annuler' : 'Modifier'}</button>
        <button type="button" class="btn ${f.danger ? 'danger' : 'valider'}" id="cf-oui" data-a="confirmer-oui" ${S.envoi ? 'disabled' : ''}>${S.envoi ? 'Enregistrement…' : esc(f.bouton || 'Confirmer')}</button></div>`;
  }
  function lienFiliere(p) { try { return new URL(`../demandes-aesh/?filiere=${p.slug}`, location.href).href; } catch (e) { return `../demandes-aesh/?filiere=${p.slug}`; } }
  function texteMessage(p, signature) {
    return `Bonjour,\n\nAfin d’organiser au mieux l’accompagnement des élèves de la filière ${p.nom}, merci d’indiquer vos besoins en AESH pour chacun de vos cours, directement sur l’emploi du temps de vos classes :\n\n${lienFiliere(p)}\n\nCela prend quelques minutes, et vos réponses restent modifiables.\n\nMerci pour votre aide,\n${signature}`;
  }
  function feuillePartager(f) {
    const p = P();
    return `<h2 id="f-titre" tabindex="-1">Envoyer le lien à mes collègues</h2>
      <label class="sr" for="pt-sign">Signature</label>
      <div class="ligne"><span class="muted">Signature</span><input type="text" id="pt-sign" data-i="signature" value="${esc(f.signature)}" maxlength="80" style="flex:1"></div>
      <label class="sr" for="pt-texte">Message</label>
      <textarea id="pt-texte" data-i="pt-texte" rows="12" style="width:100%;line-height:1.5">${esc(f.texte)}</textarea>
      <div class="actions">
        <button type="button" class="btn valider" id="pt-copier" data-a="copier">${f.copie ? '✓ Copié' : '📋 Copier le message'}</button>
        <a class="btn" id="pt-mail" href="mailto:?subject=${encodeURIComponent(`Besoins d’accompagnement des élèves · ${p.nom}`)}&body=${encodeURIComponent(f.texte)}">✉️ Ouvrir ma messagerie</a>
      </div>
      <div class="ligne ecarte"><a class="lien" id="pt-voir" href="${esc(lienFiliere(p))}" target="_blank" rel="noopener">Voir la page des collègues ↗</a><button type="button" class="lien" id="pt-fermer" data-a="fermer">Fermer</button></div>`;
  }

  /* ═══════════════════ ACTIONS ═══════════════════ */
  async function confirmerPuis(f, travail) {
    S.feuille ? (S.feuille = { ...f, type: 'confirmer', travail }) : ouvrir({ ...f, type: 'confirmer', travail });
    rendre({ focus: 'cf-oui' });
  }
  async function executerConfirmation() {
    const f = S.feuille; if (!f || !f.travail || S.envoi) return;
    S.envoi = true; rendre();
    try {
      const r = await f.travail();
      S.envoi = false;
      S.feuille = { ...f, fait: true, sous: (r && r.sous) || f.faitSous || f.sous, grand: f.grand };
      rendre({ focus: 'f-titre' }); annonce('Enregistré');
      setTimeout(() => { if (S.feuille && S.feuille.fait) { if (r && r.ensuite) S.apresPop = r.ensuite; fermer(); } }, 1400);
    } catch (e) {
      S.envoi = false; console.error(e); toast(messageErreur(e), true); rendre();
    }
  }

  function validerFiche() {
    const f = S.form, p = P(), a = f.a, I = idx();
    a.sigle = K.normSigle(a.sigle);
    if (!a.sigle) { toast('Le sigle est vide.', true); return; }
    const doublon = [...I.aesh.values()].find(x => x.id !== a.id && x.actif !== false && K.cleSigle(x.sigle) === K.cleSigle(a.sigle));
    if (doublon) { toast(`Le sigle ${a.sigle} est déjà utilisé.`, true); return; }
    const nouveau = f.id === 'nouveau' && !f.existant;
    const ch = changements(f);
    confirmerPuis({ titre: nouveau ? 'Ajouter cet AESH ?' : 'Vous confirmez ?', grand: a.sigle, lignes: ch.map(l => nouveau ? [l[0], l[2]] : l), bouton: nouveau ? 'Ajouter' : 'Confirmer', faitSous: nouveau ? `${a.sigle} est dans ${p.nom}` : '' }, async () => {
      const doc = { ...a };
      if (!doc.id) doc.id = 'aesh_' + alea();
      doc.equipes = { ...(doc.equipes || {}) }; if (doc.equipes[p.id] == null) doc.equipes[p.id] = 1;
      doc.heures = Object.fromEntries(Object.entries(doc.heures || {}).filter(([, v]) => nombre(v) != null).map(([k, v]) => [k, +v]));
      ['contrat', 'cantine', 'internat', 'service'].forEach(k => { doc[k] = nombre(doc[k]); if (k !== 'contrat' && doc[k] == null) doc[k] = 0; });
      doc.serviceLib = String(doc.serviceLib || '').slice(0, 60);
      doc.actif = true;
      const d = await ecrire(doc);
      S.form = null;
      return { ensuite: () => aller('fiche', { id: d.id }, { remplacer: true }) };
    });
  }
  function retirerAesh() {
    const f = S.form, p = P(), a = f.a, I = idx(), l = S.lundi;
    const places = I.places.filter(x => x.aeshId === a.id && x.pole === p.id && x.au >= l);
    confirmerPuis({ titre: `Retirer ${a.sigle} de ${p.nom} ?`, danger: true, bouton: 'Retirer', avert: `${places.length ? `${places.length} placement${places.length > 1 ? 's' : ''} dans le pôle s’arrête${places.length > 1 ? 'nt' : ''} à partir de cette semaine. ` : ''}Rien n’est effacé : tout reste dans l’historique.` }, async () => {
      for (const x of places) await ecrire(x.du >= l ? { ...x, statut: 'retire' } : { ...x, au: K.ajoute(l, -1) });
      const doc = JSON.parse(JSON.stringify(I.aesh.get(a.id))); delete doc.depart;
      delete doc.equipes[p.id]; if (doc.heures) delete doc.heures[p.id];
      if (!Object.keys(doc.equipes).length) doc.actif = false;
      await ecrire(doc); S.form = null;
      return { ensuite: () => aller('aesh', {}, { remplacer: true }) };
    });
  }
  function validerPlacer() {
    const f = S.feuille, p = P(), c = S.edt.cours[f.coursId], I = idx(), du = S.lundi, au = finPeriode(f);
    const dejaIci = [...new Set(I.places.filter(x => x.coursId === c.id && x.au >= du).map(x => x.aeshId))];
    const ajout = f.choisis.filter(x => !dejaIci.includes(x)), retrait = dejaIci.filter(x => !f.choisis.includes(x));
    const sig = id => (I.aesh.get(id) || {}).sigle || '?';
    const lignes = [['Cours', `${K.JOURS[c.j]} ${K.hFr(c.d)}–${K.hFr(c.f)} · ${c.lib}`], ['Classe', c.cls.map(n => S.edt.classes[n].court).join(' + ')]];
    if (ajout.length) lignes.push(['Ajout', ajout.map(sig).join(', ')], ['Période', `du ${K.dateCourte(du)} au ${K.dateCourte(au)}`]);
    if (retrait.length) lignes.push(['Retrait', `${retrait.map(sig).join(', ')} à partir du ${K.dateCourte(du)}`]);
    const garde = { ...f };
    S.feuille = { type: 'confirmer', titre: 'Vous confirmez ?', grand: f.choisis.length ? f.choisis.map(sig).join(' · ') : 'Aucun AESH', lignes, bouton: 'Confirmer', retourPlacer: garde,
      travail: async () => {
        for (const id of ajout) {
          const d = { id: 'place_' + alea(), type: 'place', aeshId: id, pole: p.id, coursId: c.id, classes: c.cls, jour: c.j, debut: c.d, fin: c.f, sem: c.sem, matiere: c.lib, du, au, statut: 'active' };
          await ecrire(d);
        }
        for (const id of retrait) for (const x of I.places.filter(x => x.aeshId === id && x.coursId === c.id && x.au >= du)) await ecrire(x.du >= du ? { ...x, statut: 'retire' } : { ...x, au: K.ajoute(du, -1) });
        S.flash = c.id; setTimeout(() => { S.flash = null; }, 2600);
        return {};
      } };
    rendre({ focus: 'cf-oui' });
  }

  function gererClic(ev) {
    const b = ev.target.closest('[data-a]'); if (!b || b.disabled || b.getAttribute('aria-disabled') === 'true') { if (b && b.getAttribute('aria-disabled') === 'true') toast(b.title || 'Pas disponible sur ce créneau', true); return; }
    const a = b.dataset.a, v = b.dataset.v;
    if (a === 'voile') { if (ev.target === b && !S.envoi && !(S.feuille && S.feuille.type === 'confirmer' && !S.feuille.fait)) fermer(); return; }
    switch (a) {
      case 'humeur': S.humeur = +v; rendre({ focus: b.id }); return;
      case 'entrer': try { sessionStorage.setItem(K_HUMEUR, '1'); } catch (e) { } if (S.session) { ecouterEstimations(); publierHumeur(); aller(!avatarDe(S.session.pole) && S.etat === 'ok' ? 'avatar' : 'accueil', !avatarDe(S.session.pole) ? { premiere: 1 } : {}, { remplacer: true }); } else aller('code'); return;
      case 'aller-humeur': aller('humeur', {}, { remplacer: true }); return;
      case 'touche': tapeCode(v); return;
      case 'retour': retour(); return;
      case 'aller':
        if (['absence', 'reunions', 'moncode', 'avatar'].includes(v)) S.form = null;
        aller(v, b.dataset.id ? { id: b.dataset.id } : {}); return;
      case 'menu': S.menu = !S.menu; rendre(); if (S.menu) AV.clin(document.querySelector('#t-avatar svg')); return;
      case 'fond': { const n = document.documentElement.dataset.fond === 'blanc' ? 'clair' : 'blanc'; document.documentElement.dataset.fond = n; lsEcrit(K_FOND, n); S.menu = false; rendre(); return; }
      case 'vu': S.vu = v === S.session.pole ? null : v; S.menu = false; S.form = null; S.exp.ids = []; rendre(); return;
      case 'sortir': S.session = null; lsEcrit(K_SESSION, null); S.vu = null; S.menu = false; S.route = { e: 'code', p: {} }; history.replaceState({ e: 'code', p: {}, n: 0 }, ''); S.n = 0; rendre({ haut: true }); return;
      case 'semaine': S.lundi = +v === 0 ? semaineParDefaut() : K.ajoute(S.lundi, +v); rendre({ focus: b.id }); return;
      case 'fiche': S.form = null; aller('fiche', { id: v }); return;
      case 'pas': {
        /* Pas de nouveau rendu à chaque appui : des appuis rapides ne doivent jamais se perdre. */
        const f = S.form, k = v, cur = k === 'pole' ? nombre(f.a.heures[P().id]) : nombre(f.a[k]);
        const n = Math.max(0, Math.min(40, Math.round(((cur || 0) + (+b.dataset.d)) * 2) / 2));
        if (k === 'pole') f.a.heures[P().id] = n; else f.a[k] = n;
        const inp = document.getElementById('pv-' + k); if (inp) inp.value = String(n).replace('.', ',');
        const champ = b.closest('.champ'); if (champ) champ.classList.add('modif');
        const en = document.getElementById('f-enregistrer'); if (en) en.disabled = false;
        clearTimeout(gererClic.t); gererClic.t = setTimeout(() => { if (S.route.e === 'fiche' && S.form === f && !S.feuille) rendre({ focus: document.activeElement && document.activeElement.id }); }, 900);
        return;
      }
      case 'reu-jour': { const f = S.form, r = f.a.reunion || {}; f.a.reunion = { jour: +v, debut: r.debut || '13:00', fin: r.fin || '14:00' }; rendre({ focus: b.id }); return; }
      case 'reu-aucune': S.form.a.reunion = null; rendre(); return;
      case 'annuler-fiche': S.form = null; rendre(); return;
      case 'valider-fiche': validerFiche(); return;
      case 'retirer-aesh': retirerAesh(); return;
      case 'choisir-existant': { const I = idx(), x = JSON.parse(JSON.stringify(I.aesh.get(v))); delete x.depart; const p = P(); const orig = JSON.parse(JSON.stringify(x)); x.equipes = { ...(x.equipes || {}), [p.id]: 1 }; x.heures = { ...(x.heures || {}), [p.id]: null }; S.form = { kind: 'fiche', cle: 'nouveau', id: 'nouveau', existant: true, choisi: true, a: x, orig }; rendre({ haut: true, focus: 'pv-pole' }); return; }
      case 'choisir-nouveau': { const f = S.form; f.a.sigle = K.normSigle(f.recherche); f.choisi = true; rendre({ haut: true, focus: 'pv-contrat' }); return; }
      case 'abs-aesh': formAbsence().aeshId = v; rendre({ focus: b.id }); return;
      case 'abs-motif': formAbsence().motif = v; rendre({ focus: b.id }); return;
      case 'abs-journee': formAbsence().journee = v === '1'; rendre({ focus: b.id }); return;
      case 'valider-absence': {
        const f = formAbsence(), I = idx(), t = coursTouches(f), sig = (I.aesh.get(f.aeshId) || {}).sigle;
        confirmerPuis({ titre: f.id ? 'Modifier cette absence ?' : 'Vous confirmez ?', grand: sig, lignes: [['Motif', K.MOTIFS[f.motif]], ['Dates', f.du === f.au ? K.dateLongue(f.du) : `du ${K.dateLongue(f.du)} au ${K.dateLongue(f.au)}`], ['Horaires', f.journee ? 'journée entière' : `${K.hFr(f.debut)}–${K.hFr(f.fin)}`], ['À couvrir', String(t.length)]], bouton: 'Confirmer' }, async () => {
          await ecrire({ id: f.id || ('abs_' + alea()), type: 'absence', aeshId: f.aeshId, motif: f.motif, du: f.du, au: f.au, journee: !!f.journee, debut: f.journee ? '' : f.debut, fin: f.journee ? '' : f.fin, note: String(f.note || '').slice(0, 120), statut: 'active' });
          S.form = null; return {};
        });
        return;
      }
      case 'modifier-absence': { const x = idx().absences.find(y => y.id === v); if (!x) return; S.form = { kind: 'absence', id: x.id, aeshId: x.aeshId, motif: x.motif, du: x.du, au: x.au, journee: x.journee !== false, debut: x.debut || '08:30', fin: x.fin || '12:30', note: x.note || '' }; rendre({ haut: true, focus: 'ab-du' }); return; }
      case 'annuler-absence': S.form = null; rendre({ haut: true }); return;
      case 'retirer-absence': { const x = idx().absences.find(y => y.id === v), a = x && idx().aesh.get(x.aeshId); if (!x) return;
        confirmerPuis({ titre: 'Retirer cette absence ?', grand: a ? a.sigle : '', lignes: [[K.MOTIFS[x.motif], x.du === x.au ? K.dateLongue(x.du) : `du ${K.dateCourte(x.du)} au ${K.dateCourte(x.au)}`]], danger: true, bouton: 'Retirer' }, async () => { await ecrire({ ...x, statut: 'retire' }); return {}; }); return; }
      case 'valider-reunion': { const f = S.form; if (idx().reunions.some(r => r.date === f.date)) { toast('Cette date est déjà prévue.', true); return; }
        confirmerPuis({ titre: 'Ajouter cette réunion ?', grand: K.dateLongue(f.date), sous: `${K.hFr(f.debut)}–${K.hFr(f.fin)} · tous les AESH`, bouton: 'Ajouter' }, async () => { await ecrire({ id: 'reunion_' + f.date, type: 'reunion', date: f.date, debut: f.debut, fin: f.fin, libelle: 'Réunion institutionnelle', statut: 'active' }); S.form = null; return {}; }); return; }
      case 'retirer-reunion': { const r = [...S.docs.values()].find(x => x.id === v); if (!r) return; confirmerPuis({ titre: 'Retirer cette date ?', grand: K.dateLongue(r.date), danger: true, bouton: 'Retirer' }, async () => { await ecrire({ ...r, statut: 'retire' }); return {}; }); return; }
      case 'classe': aller('edt', { classe: v }, { remplacer: true }); return;
      case 'placer': { const c = S.edt.cours[v], nom = classeCourante(), I = idx(), iso = K.ajoute(S.lundi, c.j);
        if (S.C.semaine(S.lundi).toute) return;
        const choisis = [...new Set(I.places.filter(x => x.coursId === v && x.au >= S.lundi).map(x => x.aeshId))];
        ouvrir({ type: 'placer', coursId: v, classe: nom, choisis, periode: 'annee', au: '', autres: choisis.some(id => !((I.aesh.get(id) || {}).equipes || {})[P().id]) });
        void iso; return; }
      case 'choix-aesh': { const f = S.feuille, i = f.choisis.indexOf(v); if (i < 0) f.choisis.push(v); else f.choisis.splice(i, 1); rendre({ focus: b.id }); return; }
      case 'autres-aesh': S.feuille.autres = true; rendre(); return;
      case 'periode': S.feuille.periode = v; if (v === 'date' && !S.feuille.au) S.feuille.au = K.ajoute(S.lundi, 4); rendre({ focus: b.id }); return;
      case 'valider-placer': validerPlacer(); return;
      case 'edt-cours': { const [nom, id] = v.split('|'); const c = S.edt.cours[id]; if (!c) return;
        if (!classesDu(P().id).includes(nom)) { toast('Ce cours est dans un autre pôle.', true); return; }
        if (!S.C.coursSemaine(c, S.lundi)) { S.lundi = K.ajoute(S.lundi, 7); }
        aller('edt', { classe: nom });
        setTimeout(() => { const el = document.getElementById('c-' + id) || document.getElementById('cl-' + id); if (el) { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); el.click(); } }, 60); return; }
      case 'ens-tous': aller('ensemble', +v ? { tous: 1 } : {}, { remplacer: true }); return;
      case 'bes-classe': aller('besoins', v ? { classe: v } : {}, { remplacer: true }); return;
      case 'envoyer-message': {
        const t = S.msgBrouillon.trim().slice(0, 1000); if (!t || S.envoi) return;
        S.envoi = true; rendre();
        ecrire({ id: 'msg_' + alea(), type: 'message', pole: S.session.pole, texte: t, statut: 'active' })
          .then(() => { S.envoi = false; S.msgBrouillon = ''; apresRendu.vu = false; rendre({ focus: 'msg-txt' }); })
          .catch(e => { S.envoi = false; toast(messageErreur(e), true); });
        return;
      }
      case 'retirer-message': { const m = S.docs.get(v); if (!m) return; confirmerPuis({ titre: 'Retirer ce message ?', sous: m.texte.slice(0, 140), danger: true, bouton: 'Retirer' }, async () => { await ecrire({ ...m, statut: 'retire' }); return {}; }); return; }
      case 'exp-quoi': S.exp.quoi = v; S.exp.ids = []; rendre({ focus: b.id }); return;
      case 'exp-id': { const i = S.exp.ids.indexOf(v); if (i < 0) S.exp.ids.push(v); else S.exp.ids.splice(i, 1); rendre({ focus: b.id }); return; }
      case 'exp-format': S.exp.format = v; rendre({ focus: b.id }); return;
      case 'exporter': b.disabled = true; lancerExport().catch(e => { console.error(e); toast('L’export n’a pas pu être fabriqué.', true); }).finally(() => { b.disabled = false; }); return;
      case 'code-voir': S.form.voir = !S.form.voir; rendre({ focus: b.id }); return;
      case 'valider-code': { const f = S.form, p = pole(S.session.pole);
        confirmerPuis({ titre: 'Changer le code ?', grand: f.n1, sous: `Pôle ${p.nom}. Pensez à le noter : l’ancien code ne marchera plus.`, bouton: 'Changer' }, async () => {
          await ecrirePole(p.id, { code: f.n1 });
          S.session = { pole: p.id, code: f.n1 }; lsEcrit(K_SESSION, S.session); S.form = null;
          return { ensuite: () => aller('accueil', {}, { remplacer: true }) };
        }); return; }
      case 'ecrire-a': { const q = pole(v); if (!q) return; const [sig, txt] = String(b.dataset.sujet || '').split('|');
        S.msgBrouillon = sig ? `@ ${q.nom} — au sujet de ${sig} : ${txt}\n\n` : (S.msgBrouillon.startsWith('@') ? S.msgBrouillon : `@ ${q.nom} — ${S.msgBrouillon}`);
        apresRendu.vu = false; if (S.route.e === 'messages') { rendre({ focus: 'msg-txt' }); const t = document.getElementById('msg-txt'); if (t) t.setSelectionRange(t.value.length, t.value.length); } else aller('messages'); setTimeout(() => { const t = document.getElementById('msg-txt'); if (t) { t.focus(); t.setSelectionRange(t.value.length, t.value.length); } }, 80); return; }
      case 'complet': { const p = P(), r = raccourcis().filter(x => x.id !== 'semaine');
        ouvrir({ type: 'confirmer', titre: 'Emploi du temps complet ?', grand: p.nom, sous: 'Les autres référents pourront compter sur les heures libres de vos AESH. Vous pourrez reprendre la saisie à tout moment.', choixPeriode: r, periode: r[0].id, bouton: 'Confirmer',
          travail: async () => { const f = S.feuille, fin = (r.find(x => x.id === f.periode) || r[0]).fin; await ecrirePole(p.id, { complet: { jusquau: fin, le: new Date().toISOString() } }); return {}; } });
        return; }
      case 'complet-non': { const p = P(); confirmerPuis({ titre: 'Reprendre la saisie ?', grand: p.nom, sous: 'Les heures libres de vos AESH seront de nouveau marquées « à confirmer » pour les autres référents.', bouton: 'Reprendre' }, async () => { await ecrirePole(p.id, { complet: null }); return {}; }); return; }
      case 'av-opt': { const f = formAvatar(), k = b.dataset.k, val = b.dataset.v; const type = (f.a.type === 'mascotte' ? AV.OPTIONS_MASCOTTE : AV.OPTIONS_PORTRAIT).find(o => o[0] === k); f.a[k] = type && type[3] === 'b' ? val === 'oui' : val; rendre({ focus: b.id || undefined }); AV.clin(document.getElementById('av-svg')); return; }
      case 'av-groupe': { const f = formAvatar(); f.groupe = f.groupe === v ? '' : v; rendre(); return; }
      case 'av-hasard': { const f = formAvatar(); f.a = AV.auHasard(f.a.type); rendre({ focus: 'av-hasard' }); AV.clin(document.getElementById('av-svg')); return; }
      case 'av-type': { const f = formAvatar(); if (f.a.type !== v) { f.a = AV.auHasard(v); f.groupe = ''; rendre({ focus: b.id }); } return; }
      case 'av-clin': AV.clin(document.getElementById('av-svg')); return;
      case 'av-annuler': S.form = null; aller('accueil', {}, { remplacer: true }); return;
      case 'av-valider': { const f = formAvatar(), a = AV.normaliser(f.a), p = pole(S.session.pole);
        confirmerPuis({ titre: 'C’est vous ?', sous: `Référent ${p.nom}. On vous verra ainsi dans les messages et sur l’accueil.`, apercu: AV.svgAvatar(a, { taille: 120 }), bouton: 'Oui, c’est moi' }, async () => { await ecrirePole(p.id, { avatar: a }); S.form = null; return { ensuite: () => aller('accueil', {}, { remplacer: true }) }; }); return; }
      case 'choix-periode-c': S.feuille.periode = v; rendre({ focus: b.id }); return;
      case 'partager': { const p = P(), sign = lsLit(K_SIGN, '') || `Le référent AESH du pôle ${p.nom}`; ouvrir({ type: 'partager', signature: sign, texte: texteMessage(p, sign), copie: false }); return; }
      case 'copier': { const t = S.feuille.texte; const fin = () => { S.feuille.copie = true; rendre({ focus: 'pt-copier' }); setTimeout(() => { if (S.feuille && S.feuille.copie) { S.feuille.copie = false; rendre({ focus: 'pt-copier' }); } }, 2500); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(fin, () => { const ta = document.getElementById('pt-texte'); ta.select(); try { document.execCommand('copy'); fin(); } catch (e) { toast('Sélectionnez le texte puis copiez-le.', true); } });
        else { const ta = document.getElementById('pt-texte'); ta.select(); try { document.execCommand('copy'); fin(); } catch (e) { toast('Sélectionnez le texte puis copiez-le.', true); } }
        return; }
      case 'fermer': fermer(); return;
      case 'confirmer-non': { const f = S.feuille; if (f.retourPlacer) { S.feuille = f.retourPlacer; rendre({ focus: 'pl-valider' }); } else fermer(); return; }
      case 'confirmer-oui': executerConfirmation(); return;
    }
  }
  function gererSaisie(ev) {
    const t = ev.target, k = t.dataset && t.dataset.i;
    if (t.id === 'code-saisie') { const v = t.value.replace(/\D/g, '').slice(0, 4); S.code = ''; for (const ch of v) { if (S.code.length < 4) { S.code += ch; } } if (S.code.length === 4) tapeCode(''); else rendre({ focus: 'code-saisie' }); return; }
    if (!k) return;
    const f = S.form;
    if (k === 'recherche') { f.recherche = t.value; rendre({ focus: t.id }); return; }
    if (k === 'sigle') { f.a.sigle = t.value; return; }
    if (k === 'serviceLib') { f.a.serviceLib = t.value; return; }
    if (k === 'nb') {
      /* Aucun nouveau rendu ici : la perte du focus (clic sur « Enregistrer ») ne doit pas avaler le clic. */
      const v = t.value.trim().replace(',', '.'); const n = v === '' ? null : Number(v); if (v !== '' && !Number.isFinite(n)) return;
      if (t.dataset.v === 'pole') f.a.heures[P().id] = n; else f.a[t.dataset.v] = n;
      const champ = t.closest('.champ'); if (champ) champ.classList.add('modif');
      const en = document.getElementById('f-enregistrer'); if (en) en.disabled = false;
      return;
    }
    if (k === 'reu-h') { f.a.reunion = { ...(f.a.reunion || { jour: 0 }), debut: t.value, fin: K.hDe(K.min(t.value) + 60) }; rendre({ focus: t.id }); return; }
    if (k === 'abs-du') { f.du = t.value; if (f.au < f.du) f.au = f.du; if (ev.type === 'change') rendre({ focus: t.id }); return; }
    if (k === 'abs-au') { f.au = t.value; if (ev.type === 'change') rendre({ focus: t.id }); return; }
    if (k === 'abs-debut') { f.debut = t.value; rendre({ focus: t.id }); return; }
    if (k === 'abs-fin') { f.fin = t.value; rendre({ focus: t.id }); return; }
    if (k === 'abs-note') { f.note = t.value; return; }
    if (k === 'r-date') { f.date = t.value; if (ev.type === 'change') rendre({ focus: t.id }); return; }
    if (k === 'r-debut') { f.debut = t.value; if (K.min(f.fin) <= K.min(f.debut)) f.fin = K.hDe(K.min(f.debut) + 60); rendre({ focus: t.id }); return; }
    if (k === 'r-fin') { f.fin = t.value; rendre({ focus: t.id }); return; }
    if (k === 'per-au') { S.feuille.au = t.value; if (ev.type === 'change') rendre({ focus: t.id }); return; }
    if (k === 'msg') { const avant = !!S.msgBrouillon.trim(); S.msgBrouillon = t.value; if (avant !== !!t.value.trim()) { const btn = document.getElementById('msg-envoyer'); if (btn) btn.disabled = !t.value.trim() || S.envoi; } return; }
    if (k === 'n1' || k === 'n2') { f[k] = t.value.replace(/\D/g, '').slice(0, 4); rendre({ focus: t.id }); return; }
    if (k === 'signature') { S.feuille.signature = t.value; lsEcrit(K_SIGN, t.value); S.feuille.texte = texteMessage(P(), t.value); const ta = document.getElementById('pt-texte'); if (ta) ta.value = S.feuille.texte; const m = document.getElementById('pt-mail'); if (m) m.href = `mailto:?subject=${encodeURIComponent(`Besoins d’accompagnement des élèves · ${P().nom}`)}&body=${encodeURIComponent(S.feuille.texte)}`; return; }
    if (k === 'pt-texte') { S.feuille.texte = t.value; const m = document.getElementById('pt-mail'); if (m) m.href = `mailto:?subject=${encodeURIComponent(`Besoins d’accompagnement des élèves · ${P().nom}`)}&body=${encodeURIComponent(t.value)}`; return; }
  }
  racine.addEventListener('click', gererClic);
  racine.addEventListener('input', gererSaisie);
  racine.addEventListener('change', gererSaisie);
  racine.addEventListener('keydown', ev => {
    if (ev.key === 'Enter' && ev.target.tagName === 'TR' && ev.target.dataset.a) { ev.target.click(); return; }
    if (ev.key === 'Enter' && ev.target.id === 'msg-txt' && (ev.metaKey || ev.ctrlKey)) { const b = document.getElementById('msg-envoyer'); if (b && !b.disabled) b.click(); return; }
    if (ev.key === 'Escape') { if (S.menu) { S.menu = false; rendre(); } else if (S.feuille && !S.envoi) { if (S.feuille.type === 'confirmer' && S.feuille.retourPlacer) { S.feuille = S.feuille.retourPlacer; rendre(); } else fermer(); } }
  });
  document.addEventListener('keydown', ev => { if ((S.route.e === 'code' || !S.session) && S.route.e !== 'humeur' && /^[0-9]$/.test(ev.key) && !(ev.target && ev.target.id === 'code-saisie')) tapeCode(ev.key); else if ((S.route.e === 'code') && ev.key === 'Backspace' && !(ev.target && ev.target.id === 'code-saisie')) tapeCode('⌫'); });
  document.addEventListener('click', ev => { if (S.menu && !ev.target.closest('.menu') && !ev.target.closest('#t-menu')) { S.menu = false; rendre(); } }, true);

  /* ─────────── départ ─────────── */
  ecouter();
  let humeurVue = false; try { humeurVue = !!sessionStorage.getItem(K_HUMEUR); } catch (e) { }
  const premier = !humeurVue ? 'humeur' : S.session ? 'accueil' : 'code';
  S.route = { e: premier, p: {} };
  history.replaceState({ e: premier, p: {}, n: 0 }, '');
  if (S.session) ecouterEstimations();
  rendre({ haut: true });
  window.__REFERENTS__ = { S, idx, ctx };
}
