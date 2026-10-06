/* Suivre mes élèves en PFMP — page de l'enseignant référent.
   Écrans (chacun est une entrée d'historique : la flèche « retour » du navigateur marche) :
     #            code d'accès, puis la liste de mes élèves
     #eleve/ID    la fiche d'un élève : à vérifier, à faire, visite, messages, tout le parcours
     #documents   les documents et où les trouver */
const P = globalThis.PFMP_COMMUN;
const RDV_URL = 'https://preventionsanteenvironnement.github.io/rdv-pfmp/';
const CLE_CODE = 'pfmp-referent-code';
const ANNEE = P.anneeScolaire();
const NOM_ROLE = { eleve: 'l’élève', referent: 'le référent', pp: 'le professeur principal' };

let svc = null, depot = null;
let code = '', ref = null, refInconnu = false;
const suivis = new Map(), arrets = new Map();
let msgs = [], arretMsgs = null, msgsPour = '';
const rdvs = new Map(), arretsRdv = new Map(), enCours = new Set();
let motifOuvert = '';
const $app = () => document.getElementById('app');

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const aujourdhui = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const fr = s => s ? new Date(s.length === 10 ? s + 'T12:00:00' : s).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '';
const frLong = s => s ? new Date(s + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : '';
function toast(t) { const el = document.getElementById('toast'); el.textContent = t; el.classList.add('vu'); clearTimeout(toast.m); toast.m = setTimeout(() => el.classList.remove('vu'), 3200); }

export function demarrer({ F, db, erreur }) {
  if (erreur || !F || !db) { $app().innerHTML = '<p class="chargement">Connexion impossible. Vérifiez la connexion puis rechargez la page.</p>'; return; }
  depot = P.depotModulaire(F, db);
  svc = P.service(depot);
  try { code = localStorage.getItem(CLE_CODE) || ''; } catch (e) { code = ''; }
  if (code) brancher(code);
  window.addEventListener('hashchange', rendre);
  $app().addEventListener('click', clic);
  $app().addEventListener('submit', envoi);
  rendre();
}

/* ── Données ──────────────────────────────────────────────────────────── */
function brancher(c) {
  debrancher();
  code = c; ref = null; refInconnu = false;
  arrets.set('ref', svc.ecouterReferent(P.referentId(ANNEE, c), d => {
    if (!d) { refInconnu = true; ref = null; rendre(); return; }
    refInconnu = false; ref = d;
    const voulus = new Set(d.suivis || []);
    [...arrets.keys()].filter(k => k !== 'ref' && !voulus.has(k)).forEach(k => { arrets.get(k)(); arrets.delete(k); suivis.delete(k); });
    voulus.forEach(id => {
      if (arrets.has(id)) return;
      arrets.set(id, svc.ecouterSuivi(id, s => { if (s) suivis.set(id, s); else suivis.delete(id); suivreRdv(id); rendre(); }, () => toast('Lecture impossible pour une fiche.')));
    });
    rendre();
  }, () => { refInconnu = true; rendre(); }));
}
function debrancher() {
  arrets.forEach(f => { try { f(); } catch (e) {} }); arrets.clear(); suivis.clear();
  arretsRdv.forEach(f => { try { f(); } catch (e) {} }); arretsRdv.clear(); rdvs.clear();
  if (arretMsgs) { arretMsgs(); arretMsgs = null; msgsPour = ''; msgs = []; }
}

/* Le rendez-vous de visite vit dans coordination_rdv : on le lit, et dès qu'il est
   confirmé on reporte la date dans la fiche, pour que l'élève la voie. */
function suivreRdv(id) {
  const s = suivis.get(id), rid = s && s.visite && s.visite.rdv;
  if (!rid || arretsRdv.has(rid)) return;
  arretsRdv.set(rid, depot.ecouter('coordination_rdv/' + rid, r => { rdvs.set(rid, r); reporterVisite(id, r); rendre(); }, () => {}));
}
function libelleRdv(c) { return c ? [c.jour, c.d, c.m].filter(Boolean).join(' ') + (c.label ? ' · ' + c.label : '') : ''; }
function reporterVisite(id, r) {
  const s = suivis.get(id);
  if (!s || !r || enCours.has('visite' + id)) return;
  const fait = P.entree(s, 'visit').e === 'fait';
  if (r.statut === 'confirme' && r.confirme) {
    const v = libelleRdv(r.confirme);
    if (fait && s.visite && s.visite.le === v) return;
    enCours.add('visite' + id);
    const suite = fait ? svc.agir(id, 'visit', 'annuler', 'referent').then(() => svc.agir(id, 'visit', 'faire', 'referent', { v })) : svc.agir(id, 'visit', 'faire', 'referent', { v });
    suite.then(() => svc.majVisite(id, { statut: 'confirme', type: r.type || '' }, 'referent')).catch(e => toast(e.message)).finally(() => enCours.delete('visite' + id));
  } else if (s.visite && s.visite.statut !== (r.statut || '') && !(r.statut === 'confirme')) {
    enCours.add('visite' + id);
    svc.majVisite(id, { statut: r.statut || '', type: r.type || '' }, 'referent').catch(() => {}).finally(() => enCours.delete('visite' + id));
  }
}

function ecouterMessagesDe(id) {
  if (msgsPour === id) return;
  if (arretMsgs) arretMsgs();
  msgsPour = id; msgs = [];
  arretMsgs = svc.ecouterMessages(id, l => { msgs = l; if (location.hash === '#eleve/' + id) rendreMessages(); }, () => {});
}

/* ── Écrans ───────────────────────────────────────────────────────────── */
/* Un nouveau relevé arrive pendant qu'on écrit : on garde le texte en cours,
   le curseur et les phases ouvertes. */
function rendre() {
  const garde = {};
  document.querySelectorAll('#app input[id], #app textarea[id]').forEach(el => { garde[el.id] = el.value; });
  const actif = document.activeElement && document.activeElement.id;
  const ouvertes = [...document.querySelectorAll('#app details.phase')].map(d => d.open);
  const y = window.scrollY;
  dessiner();
  Object.entries(garde).forEach(([k, v]) => { const el = document.getElementById(k); if (el && !el.value && v) el.value = v; });
  if (actif) document.getElementById(actif)?.focus({ preventScroll: true });
  const ds = document.querySelectorAll('#app details.phase');
  if (ds.length === ouvertes.length) ds.forEach((d, i) => { d.open = ouvertes[i]; });
  window.scrollTo(0, y);
}
let dernierEcran = '';
function dessiner() {
  const h = location.hash;
  if (h !== dernierEcran) { dernierEcran = h; motifOuvert = ''; requestAnimationFrame(() => window.scrollTo(0, 0)); }
  if (!code || refInconnu) return ecranAcces();
  if (h === '#documents') return ecranDocuments();
  if (h.startsWith('#eleve/')) return ecranFiche(decodeURIComponent(h.slice(7)));
  return ecranListe();
}

function ecranAcces() {
  if (arretMsgs) { arretMsgs(); arretMsgs = null; msgsPour = ''; }
  $app().innerHTML = `<form class="acces" id="form-code" autocomplete="off">
    <div class="ic"><i class="ti ti-briefcase" aria-hidden="true"></i></div>
    <h1>Suivre mes élèves en PFMP</h1>
    <p>Entrez le code à 6 chiffres reçu du professeur principal.</p>
    <label class="sr" for="code">Code référent</label>
    <input id="code" name="code" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" value="${refInconnu ? esc(code) : ''}" required>
    <div class="err" id="err">${refInconnu ? 'Ce code n’est pas reconnu pour ' + esc(ANNEE) + '.' : ''}</div>
    <button class="btn pri" type="submit">Entrer</button>
    <p style="margin:14px 0 0"><a class="retour" href="../"><i class="ti ti-home" aria-hidden="true"></i> Accueil du portail</a></p>
  </form>`;
  setTimeout(() => document.getElementById('code')?.focus(), 0);
}

function enTete(retour) {
  return `<div class="haut">
    ${retour ? `<a class="retour" href="#"><i class="ti ti-chevron-left" aria-hidden="true"></i> Mes élèves</a>` : `<a class="retour" href="../"><i class="ti ti-home" aria-hidden="true"></i> Accueil</a>`}
    <span class="esp"></span>
    <a class="retour" href="#documents"><i class="ti ti-files" aria-hidden="true"></i> Documents</a>
    <span class="puce ref" title="Votre sigle">${esc(ref ? ref.sigle : '')}</span>
    <button class="retour" data-act="changer" type="button"><i class="ti ti-logout" aria-hidden="true"></i> Changer de code</button>
  </div>`;
}

function compteRebours(s) {
  const t = aujourdhui();
  if (!s.debut) return { n: '—', l: 'dates à venir' };
  const a = P.ecartJours(t, s.debut), b = P.ecartJours(t, s.fin);
  if (a > 0) return { n: a, l: a > 1 ? 'jours avant le départ' : 'jour avant le départ' };
  if (b >= 0) return { n: b, l: 'jours avant la fin du stage' };
  return { n: '✓', l: 'stage terminé' };
}
function drapeauxHtml(s) {
  return '<div class="drap" aria-label="Drapeaux">' + P.drapeaux(s).map(d => `<span class="${d.ok ? 'ok' : ''}" title="${esc(d.label)}"><i class="ti ti-${d.label === 'Arrivée' ? 'trophy' : 'flag'}" aria-hidden="true"></i></span>`).join('') + '</div>';
}
/* Phase de travail : la plus avancée où quelque chose a bougé (ou la phase courante). */
function phaseTravail(s) {
  const actives = P.EN_LIGNE.filter(e => P.entree(s, e.id).e).map(e => e.ph);
  return Math.max(P.phaseCourante(s), actives.length ? Math.max(...actives) : 0);
}
function tachesReferent(s) {
  const pc = phaseTravail(s);
  return P.aFaire(s, 'referent').filter(et => (et.ty === 'tache' || et.ty === 'info' || (et.ty === 'remise' && et.from === 'referent')) && et.ph <= pc + 1)
    .sort((a, b) => a.ph - b.ph || String((P.echeance(a, s) || {}).date || '9').localeCompare(String((P.echeance(b, s) || {}).date || '9')));
}

function ecranListe() {
  const ids = (ref && ref.suivis) || [];
  const t = aujourdhui();
  const cartes = ids.map(id => {
    const s = suivis.get(id);
    if (!s) return `<div class="carte-el"><span class="code">${esc(id.split('_')[1] || id)}</span><div class="suite">Chargement…</div></div>`;
    const av = P.avancement(s), verif = P.aVerifier(s).length, retard = P.enRetard(s, t).length, cr = compteRebours(s);
    const prochaine = tachesReferent(s)[0];
    return `<button class="carte-el" data-aller="#eleve/${encodeURIComponent(id)}" type="button">
      <div class="l1"><span class="code">${esc(s.code)}</span><span class="classe">${esc(s.classe)} · ${esc(s.libelle || 'PFMP ' + s.periode)}</span></div>
      <div class="classe">${fr(s.debut)} → ${fr(s.fin)} · ${esc(cr.n)} ${esc(cr.l)}</div>
      ${drapeauxHtml(s)}
      <div class="barre" title="${av.faits} étape${av.faits > 1 ? 's' : ''} sur ${av.total}"><i style="width:${av.pct}%"></i></div>
      <div class="puces">${verif ? `<span class="puce att"><i class="ti ti-eye-check" aria-hidden="true"></i> ${verif} à vérifier</span>` : ''}${retard ? `<span class="puce ret"><i class="ti ti-clock-exclamation" aria-hidden="true"></i> ${retard} en retard</span>` : ''}</div>
      <div class="suite">${prochaine ? 'Ensuite : ' + esc(prochaine.t) : 'Rien à faire pour le moment'}</div>
    </button>`;
  }).join('');
  $app().innerHTML = enTete(false) + `<h1 class="titre">Mes élèves en PFMP</h1>
    <p class="sous">${ids.length} élève${ids.length > 1 ? 's' : ''} · ${esc(ANNEE)} · les noms sont connus du professeur principal, ici chaque élève est un code.</p>
    ${ref ? (ids.length ? `<div class="grille">${cartes}</div>` : '<div class="vide">Aucun élève ne vous est encore confié.</div>') : '<p class="chargement">Chargement…</p>'}`;
}

function etatTexte(et, en) {
  const qui = NOM_ROLE[en.par] || '';
  const quand = en.le ? ' le ' + fr(en.le) : '';
  switch (en.e) {
    case 'fait': return et.id === 'visit' && en.v ? 'Programmée : ' + en.v : 'Fait' + quand + (qui ? ' par ' + qui : '');
    case 'valide': return 'Validé' + quand + (qui ? ' par ' + qui : '');
    case 'declare': return 'Déclaré par l’élève' + quand + ' · à vérifier';
    case 'remis': return 'Remis par ' + (qui || '—') + quand + ' · en attente de réception';
    case 'corriger': return 'À corriger' + (en.motif ? ' : ' + en.motif : '');
    default: return '';
  }
}
function echeanceHtml(et, s) {
  const ec = P.echeance(et, s);
  if (!ec) return '';
  const n = P.ecartJours(aujourdhui(), ec.date);
  const cls = n < 0 ? 'ret' : n <= 7 ? 'att' : 'gris';
  return `<span class="puce ${cls}" title="${ec.proposee ? 'Échéance proposée, à fixer en équipe' : 'Échéance'}"><i class="ti ti-calendar" aria-hidden="true"></i> ${fr(ec.date)}${n < 0 ? ' · en retard' : n === 0 ? ' · aujourd’hui' : ' · J−' + n}${ec.proposee ? ' *' : ''}</span>`;
}
function docHtml(et) {
  return (et.doc ? `<span class="doc"><i class="ti ti-file-text" aria-hidden="true"></i>${esc(et.doc)}</span>` : '') + (et.ou ? `<span class="doc"><i class="ti ti-map-pin" aria-hidden="true"></i>${esc(et.ou)}</span>` : '');
}
function boutons(id, et, en, avecAnnuler) {
  return P.actions(et, en, 'referent').filter(a => avecAnnuler || a !== 'annuler').map(a => {
    if (et.id === 'visit' && a === 'faire') return `<button class="btn mini pri" type="button" data-act="voir-visite">Programmer</button>`;
    const cls = a === 'annuler' ? 'btn mini' : a === 'corriger' ? 'btn mini' : 'btn mini pri';
    return `<button class="${cls}" type="button" data-act="${a}" data-etape="${et.id}" data-suivi="${esc(id)}">${esc(P.libelleAction(a, 'referent', et))}</button>`;
  }).join('');
}
function ligne(id, s, et, opts) {
  const en = P.entree(s, et.id);
  const fini = P.estFaite(s, et.id);
  const cls = fini ? 'fini' : (opts && opts.verif) ? 'verif' : 'tache';
  const ic = fini ? 'check' : et.flag ? 'flag' : et.ty === 'remise' ? 'arrows-exchange' : et.ty === 'declare' ? 'speakerphone' : et.ty === 'info' ? 'calendar-event' : 'checkbox';
  let detail = etatTexte(et, en);
  if (et.id === 'search' && s.trouve && s.trouve.structure) detail = 'Structure : ' + s.trouve.structure + (s.trouve.secteur ? ' · ' + s.trouve.secteur : '') + (detail ? ' — ' + detail : '');
  if (et.id === 'midpoint' && en.v) detail = (en.v === 'difficulte' ? 'L’élève signale une difficulté' : 'L’élève dit que tout va bien') + (detail ? ' — ' + detail : '');
  return `<div class="ligne ${cls}">
    <span class="pic"><i class="ti ti-${ic}" aria-hidden="true"></i></span>
    <div><div class="t">${esc(et.t)}</div>${detail ? `<div class="d">${esc(detail)}</div>` : ''}<div>${fini ? '' : echeanceHtml(et, s)}${docHtml(et)}</div></div>
    <div class="act">${boutons(id, et, en, opts && opts.annuler)}</div>
    ${motifOuvert === id + '|' + et.id ? `<form class="motif" data-motif="${et.id}" data-suivi="${esc(id)}"><label class="sr" for="motif-${et.id}">Ce qu’il faut corriger</label><input id="motif-${et.id}" name="motif" placeholder="Ce qu’il faut corriger" maxlength="300" required><button class="btn mini pri" type="submit">Envoyer à l’élève</button><button class="btn mini" type="button" data-act="fermer-motif">Fermer</button></form>` : ''}
  </div>`;
}

function ecranFiche(id) {
  const s = suivis.get(id);
  if (!s) { $app().innerHTML = enTete(true) + '<p class="chargement">' + (ref && !(ref.suivis || []).includes(id) ? 'Cette fiche ne fait pas partie de vos élèves.' : 'Chargement…') + '</p>'; return; }
  ecouterMessagesDe(id);
  const cr = compteRebours(s), av = P.avancement(s);
  const verif = P.aVerifier(s);
  const taches = tachesReferent(s);
  const pc = phaseTravail(s);
  const pistes = s.pistes || [];
  $app().innerHTML = enTete(true) + `
    <h1 class="titre">${esc(s.code)} <span style="font-weight:500;color:var(--doux);font-size:.6em">${esc(s.classe)} · ${esc(s.libelle || 'PFMP ' + s.periode)}</span></h1>
    <p class="sous">Du ${frLong(s.debut)} au ${frLong(s.fin)} · dernier jour de cours avant le départ : ${frLong(s.dernierJour)}</p>
    <div class="bandeau">
      <div class="compte">${esc(cr.n)}<small>${esc(cr.l)}</small></div>
      ${drapeauxHtml(s)}
      <span class="esp"></span>
      <div style="min-width:160px"><div class="classe" style="font-size:13px;color:var(--doux)">${av.faits} étape${av.faits > 1 ? 's' : ''} sur ${av.total}</div><div class="barre"><i style="width:${av.pct}%"></i></div></div>
    </div>
    <div class="bloc"><h2><i class="ti ti-eye-check" aria-hidden="true"></i> À vérifier avec l’élève ${verif.length ? `<span class="nb">${verif.length}</span>` : ''}</h2>
      ${verif.length ? `<div class="liste">${verif.map(et => ligne(id, s, et, { verif: true })).join('')}</div>` : '<div class="vide">Rien à vérifier pour le moment.</div>'}</div>
    <div class="bloc"><h2><i class="ti ti-checklist" aria-hidden="true"></i> À faire ${taches.length ? `<span class="nb">${taches.length}</span>` : ''}</h2>
      ${taches.length ? `<div class="liste">${taches.map(et => ligne(id, s, et)).join('')}</div>` : '<div class="vide">Rien à faire pour le moment.</div>'}
      <p class="sous" style="font-size:12px;margin-top:6px">* échéance proposée, à fixer en équipe.</p></div>
    <div class="bloc" id="visite"><h2><i class="ti ti-calendar-event" aria-hidden="true"></i> Visite de stage</h2>${visiteHtml(id, s)}</div>
    <div class="bloc"><h2><i class="ti ti-messages" aria-hidden="true"></i> Messages avec l’élève</h2>
      <div class="fil" id="fil"></div>
      <form class="ecrire" data-message="${esc(id)}"><label class="sr" for="texte">Votre message</label><textarea id="texte" name="texte" maxlength="1000" placeholder="Votre message à l’élève" required></textarea><button class="btn pri" type="submit"><i class="ti ti-send" aria-hidden="true"></i> Envoyer</button></form>
      <p class="sous" style="font-size:12px;margin-top:6px">Le professeur principal lit aussi ce fil.</p></div>
    <div class="bloc"><h2><i class="ti ti-route" aria-hidden="true"></i> Tout le parcours</h2>
      ${P.PHASES.map((nom, ph) => {
        const etapes = P.EN_LIGNE.filter(e => e.ph === ph && e.ty !== 'journal');
        const faites = etapes.filter(e => P.estFaite(s, e.id)).length;
        return `<details class="phase" ${ph === pc ? 'open' : ''}><summary><span>${ph + 1}. ${esc(nom)}</span><span class="esp"></span><span class="puce ${faites === etapes.length ? 'ok' : 'gris'}">${faites}/${etapes.length}</span></summary>
          <div class="liste">${ph === 1 ? `<div class="ligne"><span class="pic"><i class="ti ti-list-search" aria-hidden="true"></i></span><div><div class="t">Pistes de l’élève (${pistes.length})</div>${pistes.length ? '<ul class="pistes">' + pistes.map(p => `<li>${esc(p.structure)}${p.secteur ? ' · ' + esc(p.secteur) : ''} — ${esc({ attente: 'en attente', entretien: 'entretien', refus: 'refus', accord: 'accord' }[p.reponse] || '')}${p.date ? ' (' + fr(p.date) + ')' : ''}</li>`).join('') + '</ul>' : '<div class="d">Aucune piste notée pour le moment.</div>'}</div><div></div></div>` : ''}
          ${etapes.map(et => ligne(id, s, et, { annuler: true, verif: P.aVerifier(s).includes(et) })).join('')}</div></details>`;
      }).join('')}
    </div>`;
  rendreMessages();
}

function visiteHtml(id, s) {
  const v = s.visite || {};
  const r = v.rdv ? rdvs.get(v.rdv) : null;
  const lien = RDV_URL + '?pfmp=' + encodeURIComponent(id) + '&filiere=' + encodeURIComponent(P.filiereDe(s.classe));
  if (r && r.statut === 'confirme' && r.confirme) {
    const c = r.confirme;
    return `<div class="visite"><div class="cal">${esc(c.d)}<small>${esc(c.m)}</small></div><div><b>${esc(c.jour)} · ${esc(c.label)}</b><div class="d" style="color:var(--doux);font-size:13px">${esc(r.type || 'Visite')} · confirmée avec le tuteur · l’élève voit cette date</div></div><span class="esp" style="flex:1"></span><a class="btn" href="${RDV_URL}?r=${encodeURIComponent(v.rdv)}&gestion=1" target="_blank" rel="noopener">Ouvrir le rendez-vous</a></div>`;
  }
  if (v.rdv) {
    const att = r && r.choix && r.choix.prefs && r.choix.prefs.length;
    return `<div class="visite"><i class="ti ti-${att ? 'mail-opened' : 'hourglass'}" style="font-size:26px;color:var(--ref)" aria-hidden="true"></i><div><b>${att ? 'Le tuteur a répondu : choisissez le créneau' : 'En attente de la réponse du tuteur'}</b><div style="color:var(--doux);font-size:13px">${r && r.statut === 'annule' ? 'Rendez-vous annulé.' : 'Proposé' + (r && r.type ? ' · ' + esc(r.type) : '')}</div></div><span class="esp" style="flex:1"></span><a class="btn ${att ? 'pri' : ''}" href="${RDV_URL}?r=${encodeURIComponent(v.rdv)}&gestion=1" target="_blank" rel="noopener">${att ? 'Confirmer le créneau' : 'Ouvrir le rendez-vous'}</a>${r && r.statut === 'annule' ? `<a class="btn pri" href="${lien}" target="_blank" rel="noopener">Proposer une nouvelle date</a>` : ''}</div>`;
  }
  return `<div class="visite"><i class="ti ti-calendar-plus" style="font-size:26px;color:var(--ref)" aria-hidden="true"></i><div><b>Aucune visite programmée</b><div style="color:var(--doux);font-size:13px">Vous proposez des créneaux ; le tuteur choisit par un lien, sans compte. L’élève ne voit que la date confirmée.</div></div><span class="esp" style="flex:1"></span><a class="btn pri" href="${lien}" target="_blank" rel="noopener"><i class="ti ti-calendar-plus" aria-hidden="true"></i> Proposer une visite au tuteur</a></div>`;
}

function rendreMessages() {
  const fil = document.getElementById('fil');
  if (!fil) return;
  fil.innerHTML = msgs.length ? msgs.map(m => `<div class="msg ${esc(m.de)}"><small>${m.de === 'eleve' ? 'Élève' : m.de === 'pp' ? 'Professeur principal' : 'Référent'}${m.sigle ? ' ' + esc(m.sigle) : ''} · ${fr(m.le)} ${m.le ? new Date(m.le).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}</small>${esc(m.texte)}</div>`).join('') : '<p class="sous" style="margin:0">Aucun message.</p>';
  fil.scrollTop = fil.scrollHeight;
}

function ecranDocuments() {
  const lignes = P.EN_LIGNE.filter(e => (e.doc || e.ou) && (e.by || []).concat([e.from, e.to]).includes('referent'));
  $app().innerHTML = enTete(true) + `<h1 class="titre">Documents et où les trouver</h1>
    <p class="sous">Dans l’ordre du parcours. Les modèles de l’établissement sont dans Pronote.</p>
    <div class="defile"><table class="docs"><thead><tr><th>Étape</th><th>Document</th><th>Où le trouver</th><th>Source</th></tr></thead><tbody>
    ${lignes.map(e => `<tr><td><b>${esc(e.t)}</b><div style="color:var(--doux);font-size:12px">${esc(P.PHASES[e.ph])}</div></td><td>${esc(e.doc || '—')}</td><td>${esc(e.ou || '—')}</td><td>${esc(e.src || '')}</td></tr>`).join('')}
    </tbody></table></div>
    <p class="sous" style="margin-top:10px;font-size:13px">P : procédure de gestion des PFMP du lycée · C : check-list du professeur référent.</p>`;
}

/* ── Gestes ───────────────────────────────────────────────────────────── */
function clic(ev) {
  const b = ev.target.closest('[data-act],[data-aller]');
  if (!b) return;
  if (b.dataset.aller) { location.hash = b.dataset.aller; return; }
  const a = b.dataset.act;
  if (a === 'changer') { try { localStorage.removeItem(CLE_CODE); } catch (e) {} debrancher(); code = ''; ref = null; refInconnu = false; history.replaceState(null, '', location.pathname); rendre(); return; }
  if (a === 'fermer-motif') { motifOuvert = ''; rendre(); return; }
  if (a === 'voir-visite') { document.getElementById('visite')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
  const id = b.dataset.suivi, et = b.dataset.etape;
  if (a === 'corriger') { motifOuvert = id + '|' + et; rendre(); setTimeout(() => document.getElementById('motif-' + et)?.focus(), 0); return; }
  b.disabled = true;
  svc.agir(id, et, a, 'referent').catch(e => { toast(e.message); b.disabled = false; });
}
function envoi(ev) {
  const f = ev.target;
  if (f.id === 'form-code') {
    ev.preventDefault();
    const c = String(new FormData(f).get('code') || '').trim();
    if (!/^\d{6}$/.test(c)) { document.getElementById('err').textContent = 'Le code compte 6 chiffres.'; return; }
    try { localStorage.setItem(CLE_CODE, c); } catch (e) {}
    brancher(c); location.hash = ''; rendre();
    return;
  }
  if (f.dataset.motif) {
    ev.preventDefault();
    const motif = String(new FormData(f).get('motif') || '').trim();
    const et = f.dataset.motif, id = f.dataset.suivi;
    svc.agir(id, et, 'corriger', 'referent', { motif }).then(() => { motifOuvert = ''; }).catch(e => toast(e.message));
    return;
  }
  if (f.dataset.message) {
    ev.preventDefault();
    const t = f.querySelector('textarea');
    const texte = t.value;
    t.value = '';
    svc.envoyerMessage(f.dataset.message, 'referent', ref ? ref.sigle : '', texte).catch(e => { toast(e.message); const z = document.getElementById('texte'); if (z && !z.value) z.value = texte; });
  }
}
