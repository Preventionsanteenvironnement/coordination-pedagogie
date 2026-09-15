/* ═══════════════════════════════════════════════════════════════════
   Estimation des besoins en AESH — pôle PSR / MELEC (page enseignants)
   Chargé par demandes-aesh/index.html (écran « estimation »).

   Lit   : coordination_estimation_aesh / cadre_<année>  (emplois du temps, effectifs, volumes)
           et toutes les déclarations de l'année (en direct, pour le compteur d'heures).
   Écrit : coordination_estimation_aesh / declaration_<id>  (la sienne, mise à jour sur place).

   Aucun nom : l'enseignant choisit sa ou ses matières, clique ses cours, indique un NOMBRE d'AESH.
   Agrégation identique à l'Atelier (estimation-aesh-coordo.js) : besoin d'un créneau = MAXIMUM déclaré.
   Contrat : work/estimation-aesh-v1/CONTRAT.md
   ═══════════════════════════════════════════════════════════════════ */
const COL = 'coordination_estimation_aesh';
const K_LOCAL = 'estimation-aesh-v1';
const JOURS = ['lun', 'mar', 'mer', 'jeu', 'ven'];
const JOURS_L = { lun: 'Lundi', mar: 'Mardi', mer: 'Mercredi', jeu: 'Jeudi', ven: 'Vendredi' };
const RE_HEURE = /^([01]\d|2[0-3]):[0-5]\d$/;
const AIDES = [
  { id: 'lecture-ecriture', label: 'Lecture, écriture' }, { id: 'consignes', label: 'Compréhension des consignes' },
  { id: 'attention', label: 'Attention, concentration' }, { id: 'manipulation', label: 'Manipulation, TP' },
  { id: 'deplacements', label: 'Déplacements' }, { id: 'comportement', label: 'Comportement' }
];
const COULEURS = ['#0f6e56', '#5048b0', '#a4431f', '#1d5fa3', '#9b2f5e', '#3d6b12', '#8a5a0b', '#0e7490', '#6b21a8', '#57534e', '#b45309', '#155e75'];
const MAX_NB = 6;
const z2 = n => String(n).padStart(2, '0');
const min = h => { const [a, b] = String(h).split(':').map(Number); return a * 60 + b; };
const hFr = h => RE_HEURE.test(h || '') ? `${parseInt(h, 10)}h${h.slice(3) === '00' ? '' : h.slice(3)}` : '';
const fmtH = x => { const v = Math.round(x * 10) / 10; return (Number.isInteger(v) ? v : String(v).replace('.', ',')) + ' h'; };

/* ═════════ agrégation (même règle que l'Atelier) ═════════ */
export function dureeHeures(cr) { return Math.max(0, (min(cr.fin) - min(cr.debut)) / 60) * (cr.parite ? 0.5 : 1); }
function disciplinesLigne(cr, declarees) {
  const d = (cr.disciplines || []).filter(x => (declarees || []).includes(x));
  return d.length ? d : (cr.disciplines || []).slice(0, 1);
}
/* Renvoie, pour chaque créneau déclaré, le besoin (max), le nombre de déclarations et les disciplines ;
   puis les heures par pôle et par discipline, et les disciplines déjà déclarées. */
export function agreger(cadre, declarations, options = {}) {
  const { exclure = null, brouillon = null } = options;
  const slots = new Map(), declarees = new Set();
  const classeDe = nom => cadre.classes.find(c => c.nom === nom);
  const ajoute = (l, discs) => {
    const c = classeDe(l.classe); if (!c) return;
    const cr = c.creneaux.find(x => x.cle === l.cle); if (!cr) return;
    const nb = Number.isInteger(l.nb) && l.nb >= 0 && l.nb <= MAX_NB ? l.nb : null; if (nb == null) return;
    const dl = disciplinesLigne(cr, discs); dl.forEach(x => declarees.add(c.pole + '|' + x));
    const k = l.classe + '|' + l.cle, s = slots.get(k) || { classe: c, cr, nb: 0, n: 0, disc: [] };
    s.n++; if (nb > s.nb || !s.disc.length) { if (nb >= s.nb) { s.nb = nb; s.disc = dl; } }
    slots.set(k, s);
  };
  (declarations || []).forEach(d => { if (!d || d.id === exclure || d.statut === 'retiree') return; (d.lignes || []).forEach(l => ajoute(l, d.disciplines || [])); });
  if (brouillon) (brouillon.lignes || []).forEach(l => ajoute(l, brouillon.disciplines || []));
  const poles = {};
  slots.forEach(s => {
    const p = poles[s.classe.pole] || (poles[s.classe.pole] = { heures: 0, parDiscipline: {} });
    const h = s.nb * dureeHeures(s.cr); p.heures += h;
    const d = s.disc[0] || 'autre'; p.parDiscipline[d] = (p.parDiscipline[d] || 0) + h;
  });
  return { slots, poles, declarees };
}

/* ═════════ normalisation du cadre publié ═════════ */
function normaliserCadre(d) {
  if (!d || !Array.isArray(d.classes)) return null;
  const disciplines = (Array.isArray(d.disciplines) ? d.disciplines : []).filter(x => x && typeof x.id === 'string').map(x => ({ id: x.id, label: String(x.label || x.id) }));
  const classes = d.classes.filter(c => c && typeof c.nom === 'string').map(c => ({
    nom: c.nom, label: String(c.label || c.nom), court: String(c.court || c.nom), pole: String(c.pole || ''),
    effectif: Number.isInteger(c.effectif) ? c.effectif : null,
    creneaux: (Array.isArray(c.creneaux) ? c.creneaux : []).filter(x => x && JOURS.includes(x.jour) && RE_HEURE.test(x.debut) && RE_HEURE.test(x.fin) && typeof x.matiere === 'string')
      .map(x => ({ cle: String(x.cle || [x.jour, x.debut, x.fin, x.matiere, x.parite || ''].join('|')), jour: x.jour, debut: x.debut, fin: x.fin,
        matiere: x.matiere, parite: ['A', 'B'].includes(x.parite) ? x.parite : '', disciplines: Array.isArray(x.disciplines) ? x.disciplines.filter(y => typeof y === 'string') : [] }))
      .sort((a, b) => JOURS.indexOf(a.jour) - JOURS.indexOf(b.jour) || a.debut.localeCompare(b.debut))
  }));
  if (!classes.length) return null;
  const v = d.volumes && typeof d.volumes === 'object' ? d.volumes : {};
  return { annee: d.annee, majLe: d.majLe || '', disciplines, classes,
    volumes: { PSR: Number.isFinite(v.PSR) ? v.PSR : null, MELEC: Number.isFinite(v.MELEC) ? v.MELEC : null } };
}

const CSS = `
.est{--est-r:16px}
.est-tete{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px 20px;align-items:flex-end}
.est-tete h1{font-size:clamp(1.5rem,3.2vw,2.1rem);letter-spacing:-.02em;font-weight:760}
.est-tete p{color:var(--muted);margin-top:6px;max-width:62ch}
.est-rgpd{display:flex;gap:10px;align-items:flex-start;background:var(--card);border:1px solid var(--line-2);border-left:4px solid var(--accent);border-radius:12px;padding:12px 14px;margin-top:16px;font-size:1rem}
.est-rgpd b{color:var(--ink)}
.est-bloc{background:var(--card);border:1px solid var(--line-2);border-radius:var(--est-r);padding:18px;box-shadow:var(--sh);margin-top:16px}
.est-bloc h2{font-size:1.15rem;font-weight:720;letter-spacing:-.01em}
.est-sous{color:var(--muted);font-size:1rem;margin-top:4px}
.est-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.est-chip{min-height:44px;padding:8px 16px;border-radius:999px;border:1.5px solid var(--line);background:var(--card);font-weight:650;color:var(--ink-2);transition:background .15s,border-color .15s}
.est-chip:hover{border-color:var(--accent)}
.est-chip[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}
.est-chip[aria-pressed="true"]::before{content:"✓ "}
.est-actions{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;margin-top:18px}
.est-actions .droite{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap}
.est-bar{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;justify-content:space-between}
.est-mats{color:var(--muted)}
.est-mats b{color:var(--ink)}
.est-jauges{display:grid;gap:12px;grid-template-columns:1fr;margin-top:16px}
@media(min-width:860px){.est-jauges{grid-template-columns:1fr 1fr}}
.est-jauge{background:var(--card);border:1px solid var(--line-2);border-radius:var(--est-r);padding:14px 16px;box-shadow:var(--sh)}
.est-jauge.actif{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent),var(--sh)}
.est-jh{display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap}
.est-jh .t{font-weight:720}
.est-jh .v{font-size:1.5rem;font-weight:760;font-variant-numeric:tabular-nums;letter-spacing:-.01em}
.est-jh .v.depasse{color:var(--err-ink)}
.est-jh .v small{font-size:1rem;font-weight:600;color:var(--muted)}
.est-piste{position:relative;height:18px;border-radius:9px;background:var(--card-2);border:1px solid var(--line-2);overflow:hidden;display:flex;margin:10px 0 6px}
.est-seg{height:100%;transition:width .45s ease}
.est-moi{background:repeating-linear-gradient(135deg,#1d5fa3,#1d5fa3 5px,#5b9be0 5px,#5b9be0 10px)}
.est-cap{position:absolute;top:-2px;bottom:-2px;width:0;border-left:2.5px dashed var(--ink)}
.est-leg{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:1rem;color:var(--muted)}
.est-leg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}
.est-manque{margin-top:6px;font-size:1rem;color:var(--warn-ink)}
.est-onglets{display:flex;gap:8px;overflow-x:auto;padding:2px 0 4px;margin-top:18px;scrollbar-width:thin}
.est-onglet{flex:none;min-height:48px;padding:6px 14px;border-radius:12px;border:1.5px solid var(--line);background:var(--card);text-align:left;line-height:1.2}
.est-onglet b{display:block;font-weight:720}
.est-onglet span{font-size:1rem;color:var(--muted)}
.est-onglet[aria-selected="true"]{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}
.est-onglet[aria-selected="true"] span{color:inherit;opacity:.9}
.est-info{display:flex;flex-wrap:wrap;gap:6px 16px;margin:12px 0 10px;color:var(--muted);font-size:1rem}
.est-info b{color:var(--ink)}
.est-grille{display:none;grid-template-columns:44px repeat(5,minmax(0,1fr));border:1px solid var(--line-2);border-radius:var(--est-r);overflow:hidden;background:var(--card)}
@media(min-width:780px){.est-grille{display:grid}.est-liste{display:none}}
.est-gh{font-size:.8rem;font-weight:700;color:var(--muted);text-align:center;padding:8px 2px;border-bottom:1px solid var(--line-2);text-transform:uppercase;letter-spacing:.04em}
.est-col{position:relative;border-left:1px solid var(--line-2)}
.est-hr{position:absolute;left:0;right:0;border-top:1px dashed var(--line-2)}
.est-heures{position:relative}.est-heures span{position:absolute;right:6px;font-size:.72rem;color:var(--muted);transform:translateY(-8px)}
.est-cr{position:absolute;left:3px;right:3px;border-radius:9px;padding:4px 6px;font-size:.74rem;line-height:1.22;text-align:left;overflow:hidden;border:1.5px solid transparent}
.est-cr b{font-weight:700;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.est-cr.off,.est-carte.off{background:transparent;border:1.5px dashed var(--line);color:var(--muted);cursor:default}
.est-cr.mien,.est-carte.mien{background:var(--info-bg);border-color:var(--info-line);color:var(--info-ink)}
.est-cr.mien:hover,.est-carte.mien:hover{box-shadow:0 0 0 2px var(--info-line)}
.est-cr.n0,.est-carte.n0{background:var(--card-2);border-color:var(--ink-2);color:var(--ink)}
.est-cr.n1,.est-carte.n1{background:var(--ok-bg);border-color:var(--ok-line);color:var(--ok-ink)}
.est-cr.n2,.est-carte.n2{background:var(--warn-bg);border-color:var(--warn-line);color:var(--warn-ink)}
.est-cr.n3,.est-carte.n3{background:var(--err-bg);border-color:var(--err-line);color:var(--err-ink)}
.est-pastille{display:inline-block;margin-top:2px;padding:0 6px;border-radius:999px;background:rgba(255,255,255,.7);color:#0f172a;font-weight:750;font-size:.7rem}
.est-coll{display:block;opacity:.85;font-size:.68rem}
.est-jour{margin:16px 0 6px;font-size:1rem;font-weight:760;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)}
.est-carte{display:block;width:100%;text-align:left;border-radius:12px;padding:10px 12px;margin-bottom:8px;font-size:1rem}
.est-leg2{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:10px;font-size:1rem;color:var(--muted)}
.est-leg2 i{display:inline-block;width:12px;height:12px;border-radius:4px;margin-right:5px;vertical-align:-2px;border:1.5px solid}
.est-rec ul{list-style:none;margin:10px 0 0;padding:0}
.est-rec li{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line-2)}
.est-rec li .q{min-width:0}
.est-rec li .q small{display:block;color:var(--muted)}
.est-nbpill{display:inline-block;min-width:2.2em;text-align:center;padding:1px 8px;border-radius:999px;font-weight:760;border:1.5px solid}
.est-tot{display:flex;flex-wrap:wrap;gap:6px 18px;margin-top:10px;font-weight:650}
.est-ov{position:fixed;inset:0;z-index:60;background:rgba(15,23,42,.45);display:flex;align-items:flex-end;justify-content:center;padding:0}
@media(min-width:680px){.est-ov{align-items:center;padding:20px}}
.est-feuille{background:var(--card);color:var(--ink);width:100%;max-width:520px;max-height:92vh;overflow:auto;border-radius:20px 20px 0 0;padding:20px 20px calc(20px + env(safe-area-inset-bottom,0px));box-shadow:0 -10px 40px rgba(0,0,0,.25)}
@media(min-width:680px){.est-feuille{border-radius:20px}}
.est-feuille h2{font-size:1.2rem}
.est-nb{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px;margin:14px 0 8px}
.est-nb button{aspect-ratio:1;min-height:44px;border-radius:14px;border:1.5px solid var(--line);background:var(--card);font-size:1.2rem;font-weight:760;font-variant-numeric:tabular-nums}
.est-nb button:hover{border-color:var(--accent)}
.est-nb button[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}
.est-calc{min-height:1.5em;color:var(--muted)}
.est-calc b{color:var(--ink)}
.est-champ{display:flex;flex-direction:column;gap:6px;margin-top:14px}
.est-champ label{font-weight:650}
.est-champ small{color:var(--warn-ink);font-size:1rem}
.est-ok{background:var(--ok-bg);border:1.5px solid var(--ok-line);color:var(--ok-ink);border-radius:var(--est-r);padding:18px}
.est-code{font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:1.2rem;font-weight:760;letter-spacing:.08em;background:var(--card);color:var(--ink);border:1.5px dashed var(--ok-line);border-radius:10px;padding:4px 10px;display:inline-block}
`;

export function creerEstimation(ctx) {
  const { FS, db, esc, annee, annonce, retourAccueil } = ctx;
  const S = {
    etat: 'chargement', erreur: '', cadre: null, decls: [], unsub: null, ecoute: false,
    etape: 'matieres', mats: new Set(), classe: null, lignes: new Map(), commentaire: '',
    sel: null, nb: null, aides: new Set(), note: '', conf: null, histo: [],
    docId: null, version: 0, creeLe: null, envoyeLe: null, envoi: '', message: '', hote: null, focus: null
  };
  if (!document.getElementById('est-styles')) { const st = document.createElement('style'); st.id = 'est-styles'; st.textContent = CSS; document.head.appendChild(st); }

  /* ── stockage local : la saisie en cours et la référence de sa déclaration ── */
  const lsLit = () => { try { const v = JSON.parse(localStorage.getItem(K_LOCAL) || 'null'); return v && v.annee === annee ? v : null; } catch (e) { return null; } };
  const lsEcrit = () => {
    try {
      localStorage.setItem(K_LOCAL, JSON.stringify({ annee, docId: S.docId, version: S.version, creeLe: S.creeLe, envoyeLe: S.envoyeLe,
        mats: [...S.mats], lignes: [...S.lignes.values()], commentaire: S.commentaire }));
    } catch (e) { }
  };
  (function restaurer() {
    const v = lsLit(); if (!v) return;
    S.docId = v.docId || null; S.version = v.version || 0; S.creeLe = v.creeLe || null; S.envoyeLe = v.envoyeLe || null;
    S.mats = new Set(Array.isArray(v.mats) ? v.mats : []); S.commentaire = String(v.commentaire || '');
    (Array.isArray(v.lignes) ? v.lignes : []).forEach(l => { if (l && l.classe && l.cle) S.lignes.set(l.classe + '|' + l.cle, l); });
  })();

  /* ── données ── */
  function ecouter() {
    if (S.ecoute) return; S.ecoute = true;
    try {
      S.unsub = FS.onSnapshot(FS.query(FS.collection(db, COL), FS.where('annee', '==', annee)), snap => {
        const decls = []; let cadre = null;
        snap.forEach(d => { const x = d.data() || {}; if (x.type === 'cadre') cadre = x; else if (x.type === 'declaration') decls.push({ ...x, id: x.id || d.id }); });
        S.decls = decls;
        const c = normaliserCadre(cadre);
        S.cadre = c; S.etat = c ? 'ok' : 'absent';
        if (c && !S.classe) S.classe = c.classes[0].nom;
        if (c && S.mats.size && S.etape === 'matieres' && S.retrouvee) S.etape = 'edt';
        S.retrouvee = false;   // une seule fois : ensuite, « changer » doit pouvoir revenir aux matières
        dessiner(true);
      }, err => { S.ecoute = false; S.unsub = null; S.etat = /permission|insufficient/i.test(String(err && (err.code || err.message))) ? 'refus' : 'horsligne'; dessiner(); });
    } catch (e) { S.ecoute = false; S.etat = 'horsligne'; }
  }

  /* ── outils ── */
  const cadre = () => S.cadre;
  const classeDe = nom => cadre() && cadre().classes.find(c => c.nom === nom);
  const disciplineLabel = id => ((cadre() && cadre().disciplines.find(d => d.id === id)) || { label: id }).label;
  const couleurDisc = id => { const i = cadre() ? cadre().disciplines.findIndex(d => d.id === id) : -1; return COULEURS[(i < 0 ? 11 : i) % COULEURS.length]; };
  const mien = cr => cr.disciplines.some(d => S.mats.has(d));
  const nbClasse = n => n == null ? 'mien' : n === 0 ? 'n0' : n === 1 ? 'n1' : n === 2 ? 'n2' : 'n3';
  const brouillon = () => ({ disciplines: [...S.mats], lignes: [...S.lignes.values()] });
  const memoriser = () => { S.histo.push(JSON.stringify({ lignes: [...S.lignes.entries()], commentaire: S.commentaire })); if (S.histo.length > 40) S.histo.shift(); };
  const disciplinesDispo = () => cadre() ? cadre().disciplines.filter(d => cadre().classes.some(c => c.creneaux.some(cr => cr.disciplines.includes(d.id)))) : [];

  /* ── rendu ── */
  function dessiner(depuisDonnees) {
    const h = S.hote; if (!h || !h.isConnected) return;
    const actif = document.activeElement, idActif = actif && h.contains(actif) ? actif.id : null;
    const y = window.scrollY;
    let html = `<div class="est">`;
    html += `<div class="est-tete"><div><h1 id="titre-ecran" tabindex="-1">Estimation des besoins en AESH</h1>
      <p>Pôle PSR / MELEC · ${esc(annee)} · pour chacun de vos cours, indiquez combien d’AESH seraient nécessaires. Deux minutes suffisent, et tout reste modifiable.</p></div>
      <button type="button" class="btn petit" data-e="accueil">← Accueil</button></div>
      <p class="est-rgpd" role="note"><span aria-hidden="true">🔒</span><span><b>RGPD : aucun nom.</b> Ni nom ni prénom d’élève, aucune information de santé : uniquement un nombre d’AESH par cours. En cas de besoin, vous pouvez ajouter un commentaire, lui aussi sans nom.</span></p>`;
    if (S.etat !== 'ok') html += blocEtat();
    else if (S.etape === 'envoye') html += blocEnvoye();
    else if (S.etape === 'matieres' || !S.mats.size) html += blocMatieres();
    else html += blocEdt();
    html += `</div>`;
    if (S.sel) html += feuilleCreneau();
    if (S.conf) html += feuilleConfirmation();
    h.innerHTML = html;
    lier();
    if (S.focus) { const el = document.getElementById(S.focus); S.focus = null; if (el) { el.focus({ preventScroll: !!depuisDonnees }); } }
    else if (idActif) { const el = document.getElementById(idActif); if (el) el.focus({ preventScroll: true }); }
    if (depuisDonnees) window.scrollTo(0, y);
  }
  function blocEtat() {
    if (S.etat === 'chargement') return `<p class="message info" role="status" style="margin-top:16px">Chargement des emplois du temps…</p>`;
    const t = S.etat === 'absent' ? '<strong>La coordination n’a pas encore publié</strong> les emplois du temps de l’estimation. Revenez un peu plus tard.'
      : S.etat === 'refus' ? '<strong>Espace en cours d’ouverture par la coordination.</strong> Revenez un peu plus tard.'
        : '<strong>Pas de connexion au serveur.</strong> Vérifiez le réseau.';
    return `<div class="message warn" role="alert" style="margin-top:16px"><p>${t}</p><p><button type="button" class="btn primaire petit" data-e="reessayer">Réessayer</button></p></div>`;
  }
  function blocMatieres() {
    const dispo = disciplinesDispo();
    const deja = S.docId && S.envoyeLe;
    return `${deja ? `<div class="message info" style="margin-top:16px"><p><strong>Vous avez déjà envoyé une estimation</strong> (${esc(dateCourte(S.envoyeLe))}). Vous pouvez la reprendre et la modifier.</p>
        <p style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn primaire petit" data-e="reprendre">Modifier mon estimation</button>
        <button type="button" class="btn petit" data-e="retirer">Retirer mon estimation</button></p></div>` : ''}
      <section class="est-bloc" aria-labelledby="h-mats"><h2 id="h-mats">1. Quelle(s) matière(s) enseignez-vous dans ces classes ?</h2>
      <p class="est-sous">Seuls vos cours seront cliquables ; ceux des collègues restent visibles en pointillés. Vous pouvez en choisir plusieurs.</p>
      <div class="est-chips" role="group" aria-label="Vos matières">${dispo.map((d, i) => `<button type="button" class="est-chip" id="mat-${esc(d.id)}" data-e="mat" data-v="${esc(d.id)}" aria-pressed="${S.mats.has(d.id)}">${esc(d.label)}</button>`).join('')}</div>
      <div class="est-actions"><span class="discret">${S.mats.size ? `${S.mats.size} matière${S.mats.size > 1 ? 's' : ''} choisie${S.mats.size > 1 ? 's' : ''}` : 'Choisissez au moins une matière.'}</span>
        <span class="droite"><button type="button" class="btn primaire" id="est-continuer" data-e="continuer" ${S.mats.size ? '' : 'disabled'}>Continuer →</button></span></div></section>
      <section class="est-bloc" aria-labelledby="h-code"><h2 id="h-code">Reprendre sur un autre appareil</h2>
      <p class="est-sous">Après l’envoi, un code de reprise vous est donné. Saisissez-le ici pour retrouver et modifier votre estimation.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><label class="sr" for="est-code">Code de reprise</label>
        <input type="text" id="est-code" autocomplete="off" maxlength="40" placeholder="Code de reprise" style="max-width:260px;text-transform:lowercase">
        <button type="button" class="btn petit" data-e="code">Retrouver</button></div>
      ${S.message ? `<p class="message warn" role="alert" style="margin-top:10px">${esc(S.message)}</p>` : ''}</section>`;
  }
  function blocEdt() {
    const c = cadre(), cl = classeDe(S.classe) || c.classes[0];
    S.classe = cl.nom;
    const autres = agreger(c, S.decls, { exclure: S.docId }), tous = agreger(c, S.decls, { exclure: S.docId, brouillon: brouillon() });
    let h = `<div class="est-bloc" style="padding:12px 16px"><div class="est-bar">
      <span class="est-mats">Vos matières : <b>${[...S.mats].map(disciplineLabel).map(esc).join(', ')}</b> · <button type="button" class="lien" data-e="changer">changer</button></span>
      <span style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn petit" data-e="annuler-action" ${S.histo.length ? '' : 'disabled'} title="Revenir en arrière">↶ Annuler la dernière action</button></span></div></div>`;
    h += `<div class="est-jauges">${['PSR', 'MELEC'].map(p => jauge(p, autres, tous, p === cl.pole)).join('')}</div>`;
    h += `<div class="est-onglets" role="tablist" aria-label="Classes">${c.classes.map(k => `<button type="button" role="tab" class="est-onglet" id="cl-${esc(k.nom)}" data-e="classe" data-v="${esc(k.nom)}" aria-selected="${k.nom === cl.nom}">
      <b>${esc(k.court)}</b><span>${k.effectif != null ? `${k.effectif} élèves` : esc(k.pole)}</span></button>`).join('')}</div>`;
    const miens = cl.creneaux.filter(mien).length;
    h += `<div class="est-info"><span>${esc(cl.label)}</span><span>Effectif : <b>${cl.effectif != null ? `${cl.effectif} élèves` : '—'}</b></span>
      <span>${miens ? `<b>${miens}</b> cours pour vous dans cette classe` : 'Aucun cours de vos matières dans cette classe'}</span></div>`;
    h += grille(cl, autres) + liste(cl, autres);
    h += `<div class="est-leg2"><span><i style="background:var(--info-bg);border-color:var(--info-line)"></i>votre cours, à renseigner</span><span><i style="background:var(--card-2);border-color:var(--ink-2)"></i>0 AESH</span>
      <span><i style="background:var(--ok-bg);border-color:var(--ok-line)"></i>1</span><span><i style="background:var(--warn-bg);border-color:var(--warn-line)"></i>2</span><span><i style="background:var(--err-bg);border-color:var(--err-line)"></i>3 ou plus</span>
      <span><i style="border-style:dashed;border-color:var(--line)"></i>cours d’un collègue</span></div>`;
    h += recap();
    return h;
  }
  function jauge(pole, autres, tous, actifPole) {
    const vol = cadre().volumes[pole], a = autres.poles[pole] || { heures: 0, parDiscipline: {} }, t = tous.poles[pole] || { heures: 0, parDiscipline: {} };
    const moi = Math.max(0, t.heures - a.heures), max = Math.max(vol || 0, t.heures, 1) * 1.15;
    const segs = Object.entries(a.parDiscipline).filter(([, x]) => x > 0).sort((x, y) => y[1] - x[1]);
    const polesDisc = new Set(); cadre().classes.filter(c => c.pole === pole).forEach(c => c.creneaux.forEach(cr => cr.disciplines.forEach(d => polesDisc.add(d))));
    const manquent = [...polesDisc].filter(d => !tous.declarees.has(pole + '|' + d)).map(disciplineLabel);
    return `<section class="est-jauge ${actifPole ? 'actif' : ''}" aria-label="Heures d’AESH, pôle ${pole}">
      <div class="est-jh"><span class="t">Pôle ${pole} · heures d’AESH par semaine</span>
      <span class="v ${vol != null && t.heures > vol ? 'depasse' : ''}">${fmtH(t.heures)} <small>/ ${vol != null ? fmtH(vol) + ' disponibles' : 'volume non publié'}</small></span></div>
      <div class="est-piste" role="img" aria-label="${esc(fmtH(t.heures))} demandées${vol != null ? ` sur ${esc(fmtH(vol))} disponibles` : ''}">
        ${segs.map(([d, x]) => `<div class="est-seg" style="width:${x / max * 100}%;background:${couleurDisc(d)}" title="${esc(disciplineLabel(d))} : ${esc(fmtH(x))}"></div>`).join('')}
        ${moi > 0 ? `<div class="est-seg est-moi" style="width:${moi / max * 100}%" title="Votre estimation : ${esc(fmtH(moi))}"></div>` : ''}
        ${vol != null ? `<div class="est-cap" style="left:${vol / max * 100}%"></div>` : ''}</div>
      <div class="est-leg">${segs.slice(0, 6).map(([d, x]) => `<span><i style="background:${couleurDisc(d)}"></i>${esc(disciplineLabel(d))} ${esc(fmtH(x))}</span>`).join('')}
        ${moi > 0 ? `<span><i class="est-moi"></i>vous ${esc(fmtH(moi))}</span>` : ''}${!segs.length && !moi ? '<span>Aucune estimation pour l’instant</span>' : ''}</div>
      ${manquent.length ? `<p class="est-manque">Pas encore estimé : ${manquent.slice(0, 7).map(esc).join(', ')}${manquent.length > 7 ? '…' : ''}</p>` : ''}
    </section>`;
  }
  function libelleCreneau(cl, cr, autres) {
    const l = S.lignes.get(cl.nom + '|' + cr.cle), s = autres.slots.get(cl.nom + '|' + cr.cle);
    return { l, s, nb: l ? l.nb : null };
  }
  function grille(cl, autres) {
    const crs = cl.creneaux;
    const h0 = Math.max(7, Math.min(8, ...crs.map(x => Math.floor(min(x.debut) / 60)))), h1 = Math.min(19, Math.max(13, ...crs.map(x => Math.ceil(min(x.fin) / 60))));
    const PX = 44, H = (h1 - h0) * PX;
    let g = `<div class="est-gh"></div>` + JOURS.map(j => `<div class="est-gh">${JOURS_L[j].slice(0, 3)}</div>`).join('');
    g += `<div class="est-heures" style="height:${H}px">${Array.from({ length: h1 - h0 + 1 }, (_, k) => `<span style="top:${k * PX}px">${h0 + k}h</span>`).join('')}</div>`;
    JOURS.forEach(j => {
      g += `<div class="est-col" style="height:${H}px">${Array.from({ length: h1 - h0 - 1 }, (_, k) => `<div class="est-hr" style="top:${(k + 1) * PX}px"></div>`).join('')}`;
      crs.filter(x => x.jour === j).forEach(cr => {
        const m = mien(cr), { nb, s } = libelleCreneau(cl, cr, autres);
        const top = (min(cr.debut) / 60 - h0) * PX, ht = Math.max(22, (min(cr.fin) - min(cr.debut)) / 60 * PX - 3);
        const cls = m ? nbClasse(nb) : 'off';
        g += `<button type="button" class="est-cr ${cls}" ${m ? `id="cr-${esc(cl.nom)}-${esc(slug(cr.cle))}" data-e="creneau" data-v="${esc(cr.cle)}"` : 'disabled tabindex="-1"'} style="top:${top}px;height:${ht}px"
          aria-label="${esc(`${JOURS_L[cr.jour]} ${hFr(cr.debut)}–${hFr(cr.fin)}, ${cr.matiere}${cr.parite ? ', semaine ' + cr.parite : ''}${m ? (nb != null ? `, ${nb} AESH indiqué${nb > 1 ? 's' : ''}` : ', à renseigner') : ', cours d’un collègue'}`)}">
          <b>${esc(cr.matiere)}</b>${esc(hFr(cr.debut))}–${esc(hFr(cr.fin))}${cr.parite ? ` · sem. ${esc(cr.parite)}` : ''}
          ${m && nb != null ? `<span class="est-pastille">${nb} AESH</span>` : ''}${m && s && s.n ? `<span class="est-coll">collègues : ${s.nb}</span>` : ''}</button>`;
      });
      g += `</div>`;
    });
    return `<div class="est-grille" aria-label="Emploi du temps de la classe">${g}</div>`;
  }
  function liste(cl, autres) {
    let h = `<div class="est-liste">`;
    JOURS.forEach(j => {
      const crs = cl.creneaux.filter(x => x.jour === j); if (!crs.length) return;
      h += `<div class="est-jour">${JOURS_L[j]}</div>`;
      crs.forEach(cr => {
        const m = mien(cr), { nb, s } = libelleCreneau(cl, cr, autres);
        h += `<button type="button" class="est-carte ${m ? nbClasse(nb) : 'off'}" ${m ? `id="cc-${esc(cl.nom)}-${esc(slug(cr.cle))}" data-e="creneau" data-v="${esc(cr.cle)}"` : 'disabled tabindex="-1"'}>
          <b>${esc(hFr(cr.debut))}–${esc(hFr(cr.fin))} · ${esc(cr.matiere)}</b>${cr.parite ? ` · semaine ${esc(cr.parite)}` : ''}<br>
          <span>${m ? (nb != null ? `${nb} AESH indiqué${nb > 1 ? 's' : ''}` : 'Touchez pour indiquer un besoin') : 'Cours d’un collègue'}${m && s && s.n ? ` · collègues : ${s.nb}` : ''}</span></button>`;
      });
    });
    return h + `</div>`;
  }
  function recap() {
    const c = cadre(), l = [...S.lignes.values()].map(x => ({ x, cl: classeDe(x.classe), cr: (classeDe(x.classe) || { creneaux: [] }).creneaux.find(y => y.cle === x.cle) })).filter(o => o.cl && o.cr)
      .sort((a, b) => c.classes.indexOf(a.cl) - c.classes.indexOf(b.cl) || JOURS.indexOf(a.cr.jour) - JOURS.indexOf(b.cr.jour) || a.cr.debut.localeCompare(b.cr.debut));
    const heures = l.reduce((s, o) => s + o.x.nb * dureeHeures(o.cr), 0);
    /* Ce que la demande ajoute vraiment au pôle : sur un créneau déjà estimé par un collègue, seul l'écart compte. */
    const autresAg = agreger(c, S.decls, { exclure: S.docId }), tousAg = agreger(c, S.decls, { exclure: S.docId, brouillon: brouillon() });
    const ajout = ['PSR', 'MELEC'].reduce((s, p) => s + Math.max(0, ((tousAg.poles[p] || {}).heures || 0) - ((autresAg.poles[p] || {}).heures || 0)), 0);
    const couleur = n => n === 0 ? 'var(--ink-2)' : n === 1 ? 'var(--ok-line)' : n === 2 ? 'var(--warn-line)' : 'var(--err-line)';
    return `<section class="est-bloc est-rec" aria-labelledby="h-rec"><div class="est-bar"><h2 id="h-rec">2. Mon estimation (${l.length} cours)</h2>
      ${l.length ? `<button type="button" class="btn petit" data-e="tout-effacer">Tout recommencer</button>` : ''}</div>
      ${l.length ? `<ul>${l.map(o => `<li><span class="q"><b>${esc(o.cl.court)}</b> · ${esc(JOURS_L[o.cr.jour])} ${esc(hFr(o.cr.debut))}–${esc(hFr(o.cr.fin))} · ${esc(o.cr.matiere)}${o.cr.parite ? ` (sem. ${esc(o.cr.parite)})` : ''}
          <small>${o.x.aides && o.x.aides.length ? esc(o.x.aides.map(a => (AIDES.find(z => z.id === a) || { label: a }).label).join(', ')) : ''}${o.x.note ? ` · « ${esc(o.x.note)} »` : ''}</small></span>
          <span style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><span class="est-nbpill" style="border-color:${couleur(o.x.nb)}">${o.x.nb} AESH</span><span class="discret">${esc(fmtH(o.x.nb * dureeHeures(o.cr)))}</span>
          <button type="button" class="btn petit" data-e="modifier" data-v="${esc(o.x.classe + '|' + o.x.cle)}">Modifier</button>
          <button type="button" class="btn petit" data-e="supprimer" data-v="${esc(o.x.classe + '|' + o.x.cle)}">Supprimer</button></span></li>`).join('')}</ul>
        <p class="est-tot"><span>Total de vos cours : ${esc(fmtH(heures))} d’AESH par semaine</span>
          ${Math.abs(heures - ajout) > 0.01 ? `<span class="discret" style="font-weight:500">dont ${esc(fmtH(ajout))} en plus de ce que les collègues ont déjà estimé sur les mêmes cours (le compteur retient le plus grand nombre par cours)</span>` : ''}</p>` : `<p class="est-sous" style="margin-top:8px">Cliquez sur un de vos cours dans l’emploi du temps pour commencer.</p>`}
      <div class="est-champ"><label for="est-commentaire">Commentaire pour la coordination <span class="discret">(facultatif)</span></label>
        <small>Sans nom ni prénom d’élève.</small>
        <textarea id="est-commentaire" maxlength="600" data-e-input="commentaire" rows="3" placeholder="Ex. : besoin surtout pendant les TP, groupe à effectif chargé…">${esc(S.commentaire)}</textarea></div>
      <div class="est-actions">${S.docId && S.envoyeLe ? `<button type="button" class="btn petit" data-e="retirer">Retirer mon estimation</button>` : '<span></span>'}
        <span class="droite"><button type="button" class="btn primaire" id="est-envoyer" data-e="envoyer" ${l.length && S.envoi !== 'encours' ? '' : 'disabled'}>${S.docId && S.envoyeLe ? 'Mettre à jour mon estimation' : 'Envoyer mon estimation'}</button></span></div>
      ${S.envoi === 'encours' ? `<p class="message info" role="status">Envoi en cours…</p>` : ''}
      ${S.envoi && S.envoi !== 'encours' ? `<div class="message warn" role="alert"><p>${esc(S.envoi)}</p><p>Votre saisie reste gardée sur cet appareil.</p></div>` : ''}
    </section>`;
  }
  function feuilleCreneau() {
    const [nom, ...r] = S.sel.split('|'), cle = r.join('|'), cl = classeDe(nom), cr = cl && cl.creneaux.find(x => x.cle === cle);
    if (!cr) { S.sel = null; return ''; }
    const existe = S.lignes.has(S.sel), dur = dureeHeures(cr);
    return `<div class="est-ov" data-e="fond"><div class="est-feuille" role="dialog" aria-modal="true" aria-labelledby="f-titre">
      <h2 id="f-titre" tabindex="-1">${esc(JOURS_L[cr.jour])} ${esc(hFr(cr.debut))}–${esc(hFr(cr.fin))} · ${esc(cr.matiere)}</h2>
      <p class="est-sous">${esc(cl.label)}${cl.effectif != null ? ` · ${cl.effectif} élèves` : ''}${cr.parite ? ` · semaine ${esc(cr.parite)} seulement` : ''}</p>
      <p style="margin-top:14px;font-weight:650">Combien d’AESH seraient nécessaires sur ce cours ?</p>
      <div class="est-nb" role="group" aria-label="Nombre d’AESH">${Array.from({ length: MAX_NB + 1 }, (_, v) => `<button type="button" id="nb-${v}" data-e="nb" data-v="${v}" aria-pressed="${S.nb === v}">${v}</button>`).join('')}</div>
      <p class="est-calc" aria-live="polite">${S.nb == null ? 'Choisissez un nombre.' : S.nb === 0 ? 'Aucun AESH nécessaire sur ce cours.' : `Soit <b>${esc(fmtH(S.nb * dur))} d’AESH</b> par semaine sur ce cours.`}</p>
      <p style="margin-top:12px;font-weight:650">Pour quoi, surtout ? <span class="discret" style="font-weight:400">(facultatif)</span></p>
      <div class="est-chips" style="margin-top:8px">${AIDES.map(a => `<button type="button" class="est-chip" data-e="aide" data-v="${a.id}" aria-pressed="${S.aides.has(a.id)}">${esc(a.label)}</button>`).join('')}</div>
      <div class="est-champ"><label for="est-note">Précision <span class="discret">(facultatif)</span></label><small>Sans nom ni prénom d’élève.</small>
        <input type="text" id="est-note" maxlength="120" data-e-input="note" value="${esc(S.note)}" placeholder="Ex. : surtout en début de séance"></div>
      <div class="est-actions">${existe ? `<button type="button" class="btn petit" data-e="supprimer" data-v="${esc(S.sel)}">Retirer ce cours</button>` : '<span></span>'}
        <span class="droite"><button type="button" class="btn" data-e="fermer">Annuler</button><button type="button" class="btn primaire" id="f-valider" data-e="valider" ${S.nb == null ? 'disabled' : ''}>Valider</button></span></div>
    </div></div>`;
  }
  function feuilleConfirmation() {
    return `<div class="est-ov"><div class="est-feuille" role="alertdialog" aria-modal="true" aria-labelledby="c-titre" aria-describedby="c-texte">
      <h2 id="c-titre" tabindex="-1">Êtes-vous sûr ?</h2><p id="c-texte" style="margin-top:10px">${esc(S.conf.texte)}</p>
      <div class="est-actions"><span></span><span class="droite"><button type="button" class="btn" data-e="conf-non">Annuler</button>
      <button type="button" class="btn primaire" id="c-oui" data-e="conf-oui">${esc(S.conf.bouton)}</button></span></div></div></div>`;
  }
  function blocEnvoye() {
    const code = S.docId ? S.docId.replace(/^declaration_/, '') : '';
    return `<div class="est-ok" style="margin-top:16px" role="status"><h2 tabindex="-1" id="titre-envoye">✓ ${S.retire ? 'Estimation retirée' : 'Merci, votre estimation est enregistrée'}</h2>
      <p style="margin-top:8px">${S.retire ? 'Vos besoins ne sont plus comptés. Vous pouvez en indiquer de nouveaux à tout moment.' : 'La coordination la voit dès maintenant. Vous pouvez revenir la modifier quand vous voulez, sur cet appareil.'}</p>
      ${code && !S.retire ? `<p style="margin-top:10px">Code de reprise (autre appareil) : <span class="est-code">${esc(code)}</span></p>` : ''}
      <p style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn primaire petit" data-e="reprendre">${S.retire ? 'Indiquer de nouveaux besoins' : 'Modifier mon estimation'}</button>
      <button type="button" class="btn petit" data-e="accueil">Retour à l’accueil</button></p></div>`;
  }
  const slug = s => String(s).replace(/[^A-Za-z0-9]+/g, '-');
  const dateCourte = iso => { const d = new Date(iso); return isNaN(d) ? '' : `le ${d.getDate()}/${z2(d.getMonth() + 1)} à ${z2(d.getHours())}h${z2(d.getMinutes())}`; };

  /* ── actions ── */
  function confirmer(texte, bouton, faire) { S.conf = { texte, bouton, faire }; S.focus = 'c-oui'; dessiner(); }
  function ouvrirCreneau(k) {
    const l = S.lignes.get(k); S.sel = k; S.nb = l ? l.nb : null; S.aides = new Set(l ? l.aides || [] : []); S.note = l ? l.note || '' : '';
    S.focus = S.nb != null ? 'nb-' + S.nb : 'f-titre'; dessiner();
  }
  async function envoyer(retirer) {
    const c = cadre(); if (!c) return;
    const lignes = retirer ? [] : [...S.lignes.values()].map(l => {
      const cl = classeDe(l.classe), cr = cl && cl.creneaux.find(x => x.cle === l.cle); if (!cr) return null;
      return { classe: l.classe, cle: cr.cle, jour: cr.jour, debut: cr.debut, fin: cr.fin, matiere: cr.matiere, parite: cr.parite,
        nb: l.nb, aides: (l.aides || []).filter(a => AIDES.some(z => z.id === a)), note: String(l.note || '').slice(0, 120) };
    }).filter(Boolean);
    if (!S.docId) S.docId = 'declaration_' + Date.now().toString(36) + [...crypto.getRandomValues(new Uint8Array(6))].map(x => 'abcdefghijklmnopqrstuvwxyz0123456789'[x % 36]).join('');
    const maintenant = new Date().toISOString();
    const doc = { id: S.docId, type: 'declaration', annee, disciplines: [...S.mats].slice(0, 12), statut: retirer ? 'retiree' : 'active', version: (S.version || 0) + 1,
      lignes, commentaire: String(S.commentaire || '').slice(0, 600), creeLe: S.creeLe || maintenant, majLe: maintenant, source: 'estimation-aesh' };
    S.envoi = 'encours'; dessiner();
    try {
      await Promise.race([FS.setDoc(FS.doc(db, COL, doc.id), doc), new Promise((_, rej) => setTimeout(() => rej(new Error('délai dépassé')), 15000))]);
      S.version = doc.version; S.creeLe = doc.creeLe; S.envoyeLe = maintenant; S.envoi = ''; S.retire = !!retirer;
      if (retirer) { S.lignes = new Map(); S.histo = []; }
      lsEcrit(); S.etape = 'envoye'; S.focus = 'titre-envoye'; dessiner();
      annonce && annonce(retirer ? 'Estimation retirée.' : 'Estimation envoyée.');
    } catch (e) {
      const t = String((e && (e.code || e.message)) || e);
      S.envoi = /permission|insufficient/i.test(t) ? 'Envoi refusé : l’espace n’est pas encore ouvert par la coordination.' : 'L’envoi n’a pas abouti (connexion). Réessayez dans un instant.';
      lsEcrit(); dessiner();
    }
  }
  async function retrouverParCode(code) {
    const c = String(code || '').trim().toLowerCase().replace(/^declaration_/, '');
    if (!/^[a-z0-9]{8,40}$/.test(c)) { S.message = 'Ce code n’a pas le bon format.'; dessiner(); return; }
    try {
      const snap = await FS.getDoc(FS.doc(db, COL, 'declaration_' + c));
      const d = snap && (typeof snap.exists === 'function' ? snap.exists() : snap.exists) ? snap.data() : null;
      if (!d || d.type !== 'declaration') { S.message = 'Aucune estimation ne correspond à ce code.'; dessiner(); return; }
      S.docId = d.id; S.version = d.version || 0; S.creeLe = d.creeLe || null; S.envoyeLe = d.majLe || null; S.message = '';
      S.mats = new Set(Array.isArray(d.disciplines) ? d.disciplines : []); S.commentaire = String(d.commentaire || '');
      S.lignes = new Map(); (d.lignes || []).forEach(l => { if (l && l.classe && l.cle) S.lignes.set(l.classe + '|' + l.cle, { classe: l.classe, cle: l.cle, nb: l.nb, aides: l.aides || [], note: l.note || '' }); });
      S.histo = []; lsEcrit(); S.etape = 'edt'; S.focus = 'titre-ecran'; dessiner(); annonce && annonce('Estimation retrouvée.');
    } catch (e) { S.message = 'Recherche impossible pour le moment (connexion).'; dessiner(); }
  }
  function lier() {
    const h = S.hote;
    h.onclick = ev => {
      const b = ev.target.closest('[data-e]'); if (!b || b.disabled) return;
      const a = b.dataset.e, v = b.dataset.v;
      if (a === 'fond') { if (ev.target === b) { S.sel = null; dessiner(); } return; }
      if (a === 'accueil') { retourAccueil && retourAccueil(); return; }
      if (a === 'reessayer') { S.etat = 'chargement'; S.ecoute = false; if (S.unsub) try { S.unsub(); } catch (e) { } S.unsub = null; ecouter(); dessiner(); return; }
      if (a === 'mat') { S.mats.has(v) ? S.mats.delete(v) : S.mats.add(v); lsEcrit(); S.focus = b.id; dessiner(); return; }
      if (a === 'continuer') { if (!S.mats.size) return; S.etape = 'edt'; const c = cadre(); const k = c.classes.find(x => x.creneaux.some(mien)); if (k) S.classe = k.nom; S.focus = 'titre-ecran'; dessiner(); return; }
      if (a === 'changer') { S.etape = 'matieres'; S.focus = 'h-mats'; dessiner(); return; }
      if (a === 'reprendre') { S.etape = S.mats.size ? 'edt' : 'matieres'; S.retire = false; S.focus = 'titre-ecran'; dessiner(); return; }
      if (a === 'code') { retrouverParCode((h.querySelector('#est-code') || {}).value); return; }
      if (a === 'classe') { S.classe = v; S.focus = b.id; dessiner(); return; }
      if (a === 'creneau') { ouvrirCreneau(S.classe + '|' + v); return; }
      if (a === 'modifier') { const [nom] = v.split('|'); S.classe = nom; ouvrirCreneau(v); return; }
      if (a === 'nb') { S.nb = Number(v); S.focus = b.id; dessiner(); return; }
      if (a === 'aide') { S.aides.has(v) ? S.aides.delete(v) : S.aides.add(v); b.setAttribute('aria-pressed', S.aides.has(v)); return; }
      if (a === 'fermer') { S.sel = null; dessiner(); return; }
      if (a === 'valider') {
        const k = S.sel, [nom, ...r] = k.split('|'), cle = r.join('|'), cl = classeDe(nom), cr = cl.creneaux.find(x => x.cle === cle), nb = S.nb;
        const ligne = { classe: nom, cle, nb, aides: [...S.aides], note: String(S.note || '').trim().slice(0, 120) };
        S.sel = null;
        confirmer(`${nb} AESH le ${JOURS_L[cr.jour].toLowerCase()} ${hFr(cr.debut)}–${hFr(cr.fin)}, ${cr.matiere}, ${cl.court}${nb ? ` : soit ${fmtH(nb * dureeHeures(cr))} par semaine` : ''}.`, 'Confirmer',
          () => { memoriser(); S.lignes.set(k, ligne); lsEcrit(); annonce && annonce('Besoin enregistré dans votre estimation.'); });
        return;
      }
      if (a === 'supprimer') {
        const k = v; S.sel = null;
        confirmer('Retirer ce cours de votre estimation ?', 'Retirer', () => { memoriser(); S.lignes.delete(k); lsEcrit(); annonce && annonce('Cours retiré.'); });
        return;
      }
      if (a === 'tout-effacer') { confirmer('Effacer tous les cours indiqués et recommencer ?', 'Tout effacer', () => { memoriser(); S.lignes = new Map(); lsEcrit(); }); return; }
      if (a === 'annuler-action') { const p = S.histo.pop(); if (p) { const o = JSON.parse(p); S.lignes = new Map(o.lignes); S.commentaire = o.commentaire; lsEcrit(); annonce && annonce('Dernière action annulée.'); } dessiner(); return; }
      if (a === 'envoyer') {
        const n = S.lignes.size;
        confirmer(`${S.docId && S.envoyeLe ? 'Mettre à jour' : 'Envoyer'} votre estimation (${n} cours) à la coordination ?`, S.docId && S.envoyeLe ? 'Mettre à jour' : 'Envoyer', () => envoyer(false));
        return;
      }
      if (a === 'retirer') { confirmer('Retirer votre estimation ? Vos besoins ne seront plus comptés.', 'Retirer mon estimation', () => envoyer(true)); return; }
      if (a === 'conf-non') { S.conf = null; dessiner(); return; }
      if (a === 'conf-oui') { const f = S.conf.faire; S.conf = null; dessiner(); f(); dessiner(); return; }
    };
    h.oninput = ev => {
      const t = ev.target, k = t.dataset && t.dataset.eInput; if (!k) return;
      if (k === 'note') S.note = t.value;
      if (k === 'commentaire') { S.commentaire = t.value; lsEcrit(); }
    };
    h.onkeydown = ev => { if (ev.key === 'Escape' && (S.sel || S.conf)) { S.sel = null; S.conf = null; dessiner(); } };
  }

  return {
    monter(hote) { S.hote = hote; if (S.docId && S.mats.size) S.retrouvee = true; ecouter(); dessiner(); },
    fermer() { S.hote = null; },
    _etat: () => S, _agreger: agreger
  };
}
