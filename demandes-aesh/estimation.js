/* ═══════════════════════════════════════════════════════════════════
   Estimation des besoins d’accompagnement — pôle PSR / MELEC (page enseignants) · v6 « par l’emploi du temps »
   Chargé par demandes-aesh/index.html (écran « estimation »).

   Lit   : coordination_estimation_aesh / cadre_<année>  (période, semaines A/B, vacances et jours fériés,
           PFMP par classe, emplois du temps, effectifs, volumes) et les documents « cours » de la période.
   Écrit : coordination_estimation_aesh / cours_<début de période>_<classe>_<empreinte du cours>  (un par cours,
           partagé par l'équipe, enregistré tout de suite) + archive_…_v<n> (copie figée de chaque enregistrement).

   Parcours : filière → classe → emploi du temps de la classe → cours → nombre d'AESH (0 à 6),
   jusqu'à quelle date, semaines A/B, horaire ajustable. Aucun nom.
   Heures = nombre × durée × semaines de cours réelles (vacances, jours fériés et PFMP retirés).
   Agrégation identique à l'Atelier : pour un cours et une semaine donnés, on retient le plus grand besoin.
   Contrat : work/estimation-aesh-v1/CONTRAT.md
   ═══════════════════════════════════════════════════════════════════ */
const COL = 'coordination_estimation_aesh';
const K_LOCAL = 'estimation-aesh-v1';
const JOURS = ['lun', 'mar', 'mer', 'jeu', 'ven'];
const JOURS_L = { lun: 'Lundi', mar: 'Mardi', mer: 'Mercredi', jeu: 'Jeudi', ven: 'Vendredi' };
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const RE_HEURE = /^([01]\d|2[0-3]):[0-5]\d$/;
const RE_DATE = /^\d{4}-\d{2}-\d{2}$/;
const AIDES = [
  { id: 'lecture-ecriture', label: 'Lecture, écriture' }, { id: 'consignes', label: 'Compréhension des consignes' },
  { id: 'attention', label: 'Attention, concentration' }, { id: 'manipulation', label: 'Manipulation, TP' },
  { id: 'deplacements', label: 'Déplacements' }, { id: 'comportement', label: 'Comportement' }
];
const COULEURS = ['#0f6e56', '#5048b0', '#a4431f', '#1d5fa3', '#9b2f5e', '#3d6b12', '#8a5a0b', '#0e7490', '#6b21a8', '#57534e', '#b45309', '#155e75'];
const MAX_NB = 6;
/* Libellés imposés côté page, même si le cadre a été publié avec un ancien libellé (15/09/2026). */
const LIBELLES_DISC = { maths: 'Mathématiques, sciences, physique-chimie' };
const GROUPES = [['PSR', 'CAP PSR'], ['MELEC', 'Bac Pro MELEC']];
const z2 = n => String(n).padStart(2, '0');
const min = h => { const [a, b] = String(h).split(':').map(Number); return a * 60 + b; };
const hDe = m => `${z2(Math.floor(m / 60))}:${z2(m % 60)}`;
const hFr = h => RE_HEURE.test(h || '') ? `${parseInt(h, 10)}h${h.slice(3) === '00' ? '' : h.slice(3)}` : '';
const fmtH = x => { const v = Math.round(x * 10) / 10; return (Number.isInteger(v) ? v : String(v).replace('.', ',')) + ' h'; };
const dFr = iso => RE_DATE.test(iso || '') ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : '';
const ajoute = (iso, n) => { const [y, m, d] = iso.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10); };
const dateLongue = iso => { if (!RE_DATE.test(iso || '')) return ''; const [y, m, d] = iso.split('-').map(Number); const j = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][new Date(Date.UTC(y, m - 1, d)).getUTCDay()]; return `${j} ${d} ${MOIS[m - 1]} ${y}`; };

/* ═════════ calculs partagés (mêmes règles que l'Atelier) ═════════ */
/* Horaire réellement demandé : celui de la ligne s'il est valide et contenu dans le cours, sinon celui du cours. */
export function horaireLigne(cr, l) {
  const a = l && RE_HEURE.test(l.hDebut || '') ? l.hDebut : cr.debut, b = l && RE_HEURE.test(l.hFin || '') ? l.hFin : cr.fin;
  if (min(a) < min(cr.debut) || min(b) > min(cr.fin) || min(b) <= min(a)) return { debut: cr.debut, fin: cr.fin };
  return { debut: a, fin: b };
}
/* Semaines de la période où la ligne s'applique réellement (lundis). */
export function semainesLigne(cadre, classe, cr, l) {
  const P = cadre.periode, du = l && RE_DATE.test(l.du || '') ? l.du : P.debut, au = l && RE_DATE.test(l.au || '') ? l.au : P.fin;
  const choix = l && ['A', 'B'].includes(l.semaines) ? l.semaines : 'toutes', i = JOURS.indexOf(cr.jour);
  return cadre.semaines.filter(s => {
    const d = ajoute(s.lundi, i);
    if (d < P.debut || d > P.fin || d < du || d > au) return false;
    if (s.feries && s.feries[cr.jour]) return false;
    if ((classe.pfmp || []).some(p => d >= p.debut && d <= p.fin)) return false;
    if (cr.parite) return s.parite === cr.parite;
    if (choix !== 'toutes') return s.parite === choix;
    return true;
  }).map(s => s.lundi);
}
export const semainesDeCours = cadre => cadre.semaines.filter(s => JOURS.some(j => { const d = ajoute(s.lundi, JOURS.indexOf(j)); return d >= cadre.periode.debut && d <= cadre.periode.fin && !(s.feries && s.feries[j]); })).length;
function disciplinesLigne(cr, declarees) {
  const d = (cr.disciplines || []).filter(x => (declarees || []).includes(x));
  return d.length ? d : (cr.disciplines || []).slice(0, 1);
}
/* Une déclaration appartient-elle à la période du cadre ? Avec le champ « periode » : même début.
   Sans (estimations enregistrées avant le 15/09/2026) : créée entre 60 jours avant le début et la fin de la période. */
export function dansPeriode(d, cadre) {
  const P = cadre.periode;
  if (d && d.periode && RE_DATE.test(d.periode.debut || '')) return d.periode.debut === P.debut;
  const cree = String((d && (d.creeLe || d.majLe)) || '').slice(0, 10);
  return RE_DATE.test(cree) && cree >= ajoute(P.debut, -60) && cree <= P.fin;
}
/* Heures d'une ligne seule, sur la période. */
export function heuresLigne(cadre, classe, cr, l) {
  const h = horaireLigne(cr, l);
  return (Number(l.nb) || 0) * (min(h.fin) - min(h.debut)) / 60 * semainesLigne(cadre, classe, cr, l).length;
}
/* Agrégation : pour chaque cours et chaque semaine, le plus grand besoin (nombre × durée) parmi les lignes actives. */
export function agreger(cadre, declarations, options = {}) {
  const { exclure = null, brouillon = null } = options;
  const slots = new Map(), declarees = new Set();
  const classeDe = nom => cadre.classes.find(c => c.nom === nom);
  const ajouteLigne = (l, discs) => {
    const c = classeDe(l.classe); if (!c) return;
    const cr = c.creneaux.find(x => x.cle === l.cle); if (!cr) return;
    const nb = Number.isInteger(l.nb) && l.nb >= 0 && l.nb <= MAX_NB ? l.nb : null; if (nb == null) return;
    const dl = disciplinesLigne(cr, discs); dl.forEach(x => declarees.add(c.pole + '|' + x));
    const k = l.classe + '|' + l.cle, s = slots.get(k) || { classe: c, cr, nb: 0, n: 0, lignes: [] };
    const h = horaireLigne(cr, l);
    s.n++; s.nb = Math.max(s.nb, nb);
    s.lignes.push({ nb, disc: dl, sem: new Set(semainesLigne(cadre, c, cr, l)), duree: (min(h.fin) - min(h.debut)) / 60 });
    slots.set(k, s);
  };
  (declarations || []).forEach(d => { if (!d || d.id === exclure || d.statut === 'retiree') return; (d.lignes || []).forEach(l => ajouteLigne(l, d.disciplines || [])); });
  if (brouillon) (brouillon.lignes || []).forEach(l => ajouteLigne(l, brouillon.disciplines || []));
  const poles = {}, nbSem = Math.max(1, semainesDeCours(cadre));
  slots.forEach(s => {
    const p = poles[s.classe.pole] || (poles[s.classe.pole] = { heures: 0, moyenne: 0, parDiscipline: {} });
    let total = 0;
    cadre.semaines.forEach(w => {
      let best = null;
      s.lignes.forEach(x => { if (x.sem.has(w.lundi) && (!best || x.nb * x.duree > best.nb * best.duree)) best = x; });
      if (best) { const h = best.nb * best.duree; total += h; const d = best.disc[0] || 'autre'; p.parDiscipline[d] = (p.parDiscipline[d] || 0) + h; }
    });
    s.heures = total; p.heures += total;
  });
  Object.values(poles).forEach(p => { p.moyenne = p.heures / nbSem; });
  return { slots, poles, declarees, nbSemaines: nbSem };
}

/* ═════════ normalisation du cadre publié ═════════ */
function normaliserCadre(d) {
  if (!d || !Array.isArray(d.classes)) return null;
  const disciplines = (Array.isArray(d.disciplines) ? d.disciplines : []).filter(x => x && typeof x.id === 'string').map(x => ({ id: x.id, label: LIBELLES_DISC[x.id] || String(x.label || x.id) }));
  const pe = d.periode && RE_DATE.test(d.periode.debut || '') && RE_DATE.test(d.periode.fin || '') ? d.periode : null;
  let semaines = (Array.isArray(d.semaines) ? d.semaines : []).filter(s => s && RE_DATE.test(s.lundi || ''))
    .map(s => ({ lundi: s.lundi, parite: ['A', 'B'].includes(s.parite) ? s.parite : '', feries: s.feries && typeof s.feries === 'object' ? s.feries : {} }));
  const periode = pe ? { debut: pe.debut, fin: pe.fin, label: String(pe.label || 'Période') }
    : { debut: d.semaineRef || '2000-01-03', fin: ajoute(d.semaineRef || '2000-01-03', 4), label: 'Semaine type' };
  if (!semaines.length) semaines = [{ lundi: periode.debut, parite: '', feries: {} }];
  const classes = d.classes.filter(c => c && typeof c.nom === 'string').map(c => ({
    nom: c.nom, label: String(c.label || c.nom), court: String(c.court || c.nom), pole: String(c.pole || ''),
    effectif: Number.isInteger(c.effectif) ? c.effectif : null,
    pfmp: (Array.isArray(c.pfmp) ? c.pfmp : []).filter(p => p && RE_DATE.test(p.debut || '') && RE_DATE.test(p.fin || '')).map(p => ({ debut: p.debut, fin: p.fin })),
    creneaux: (Array.isArray(c.creneaux) ? c.creneaux : []).filter(x => x && JOURS.includes(x.jour) && RE_HEURE.test(x.debut) && RE_HEURE.test(x.fin) && typeof x.matiere === 'string')
      .map(x => ({ cle: String(x.cle || [x.jour, x.debut, x.fin, x.matiere, x.parite || ''].join('|')), jour: x.jour, debut: x.debut, fin: x.fin,
        matiere: x.matiere, parite: ['A', 'B'].includes(x.parite) ? x.parite : '', disciplines: Array.isArray(x.disciplines) ? x.disciplines.filter(y => typeof y === 'string') : [] }))
      .sort((a, b) => JOURS.indexOf(a.jour) - JOURS.indexOf(b.jour) || a.debut.localeCompare(b.debut))
  }));
  if (!classes.length) return null;
  const raccourcis = (Array.isArray(d.raccourcis) ? d.raccourcis : []).filter(r => r && RE_DATE.test(r.fin || '') && r.fin >= periode.debut && r.fin <= periode.fin)
    .map(r => ({ id: String(r.id || r.fin), label: String(r.label || ''), fin: r.fin }));
  if (!raccourcis.some(r => r.fin === periode.fin)) raccourcis.push({ id: 'periode', label: `Jusqu’à la fin de la période`, fin: periode.fin });
  raccourcis.sort((a, b) => a.fin.localeCompare(b.fin));
  const v = d.volumes && typeof d.volumes === 'object' ? d.volumes : {};
  const avecParite = semaines.some(s => s.parite);
  return { annee: d.annee, majLe: d.majLe || '', disciplines, classes, periode, semaines, raccourcis, avecParite,
    volumes: { PSR: Number.isFinite(v.PSR) ? v.PSR : null, MELEC: Number.isFinite(v.MELEC) ? v.MELEC : null } };
}

/* ═════════ v6 « par l'emploi du temps des élèves » (15/09/2026, validée par Brahim) ═════════
   Filière → classe → emploi du temps de la classe → le cours touché → nombre d'AESH → Enregistrer.
   On estime le COURS tel qu'il est écrit dans l'emploi du temps, pas l'enseignant : un document par cours
   et par période (cours_<début>_<classe>_<empreinte>), partagé par toute l'équipe, enregistré tout de suite.
   Chaque enregistrement laisse une copie figée (archive_…_v<n>). Aucun nom. */
const CSS = `
.e6{max-width:760px;margin:0 auto;font-size:16px}
.e6-barre{display:flex;align-items:center;gap:10px;min-height:52px;margin:4px 0 6px}
.e6-retour{flex:none;width:44px;height:44px;border-radius:50%;border:1px solid var(--line-2);background:var(--card);font-size:20px;line-height:1;cursor:pointer;color:var(--ink)}
.e6-barre .t{font-weight:700;color:var(--muted)}
.e6 h1{font-size:clamp(1.6rem,4.5vw,2.1rem);letter-spacing:-.02em;line-height:1.15;margin:6px 0 14px}
.e6-per{display:inline-block;background:var(--accent-l);color:var(--accent-d);font-weight:650;border-radius:999px;padding:4px 12px}
.e6-gros{display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:var(--card);border:1.5px solid var(--line-2);border-radius:18px;padding:18px 20px;margin-bottom:12px;font:inherit;color:inherit;cursor:pointer;box-shadow:var(--sh)}
.e6-gros:hover{border-color:var(--accent)}
.e6-gros .x{flex:1;min-width:0}.e6-gros b{display:block;font-size:1.25rem}.e6-gros span.s{color:var(--muted)}
.e6-gros .fl{color:var(--accent);font-size:1.5rem}
.e6-compteur{background:var(--card);border:1px solid var(--line-2);border-radius:16px;padding:14px 16px;margin:0 0 18px}
.e6-compteur .l{display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap}
.e6-compteur b{font-size:1.25rem}
.e6-piste{height:10px;border-radius:5px;background:var(--card-2);margin-top:10px;overflow:hidden}.e6-piste i{display:block;height:100%;background:var(--accent);border-radius:5px;transition:width .4s}
.e6-piste i.trop{background:var(--err-line)}
.e6-bonjour{background:var(--ok-bg);border:1px solid var(--ok-line);color:var(--ok-ink);border-radius:14px;padding:12px 14px;margin-bottom:16px}
.e6-onglets{display:flex;background:var(--card-2);border-radius:14px;padding:4px;margin:4px 0 8px}
.e6-onglets button{flex:1;min-height:44px;border:0;background:transparent;border-radius:11px;font:inherit;font-weight:650;color:var(--ink-2);cursor:pointer}
.e6-onglets button[aria-pressed="true"]{background:var(--card);color:var(--ink);box-shadow:0 1px 3px rgba(0,0,0,.12)}
.e6-info{color:var(--muted);margin:6px 0 0}
.e6-jour{font-weight:750;letter-spacing:.04em;text-transform:uppercase;color:var(--muted);margin:20px 0 8px}
.e6-cours{display:flex;align-items:center;gap:12px;width:100%;text-align:left;border-radius:14px;padding:12px 14px;margin-bottom:8px;border:1.5px solid var(--info-line);background:var(--info-bg);color:var(--ink);font:inherit;cursor:pointer}
.e6-cours .h{flex:none;min-width:6.2em;font-weight:650;font-variant-numeric:tabular-nums}
.e6-cours .m{flex:1;min-width:0}.e6-cours .m b{display:block;font-weight:650}
.e6-cours .m small{display:block;color:var(--muted);font-size:1rem}
.e6-cours .p{flex:none;border-radius:999px;background:var(--card);font-weight:800;padding:4px 10px;color:var(--info-ink)}
.e6-cours.n0{background:var(--card-2);border-color:var(--ink-2)}.e6-cours.n1{background:var(--ok-bg);border-color:var(--ok-line)}
.e6-cours.n2{background:var(--warn-bg);border-color:var(--warn-line)}.e6-cours.n3{background:var(--err-bg);border-color:var(--err-line)}
.e6-cours.n0 .p,.e6-cours.n1 .p,.e6-cours.n2 .p,.e6-cours.n3 .p{color:var(--ink)}
.e6-bas{position:sticky;bottom:0;z-index:15;margin-top:18px;padding:12px 16px calc(12px + env(safe-area-inset-bottom,0px));background:var(--card);border:1px solid var(--line-2);border-radius:16px;display:flex;justify-content:space-between;align-items:center;gap:8px 14px;flex-wrap:wrap;box-shadow:0 -10px 24px -16px rgba(15,23,42,.4)}
.e6-ok{color:var(--ok-ink);font-weight:650}
.e6-ov{position:fixed;inset:0;z-index:60;background:rgba(15,23,42,.45);display:flex;align-items:flex-end;justify-content:center}
@media(min-width:680px){.e6-ov{align-items:center;padding:20px}}
.e6-feuille{background:var(--card);color:var(--ink);width:100%;max-width:440px;max-height:92vh;overflow:auto;border-radius:22px 22px 0 0;padding:12px 20px calc(20px + env(safe-area-inset-bottom,0px));box-shadow:0 -10px 40px rgba(0,0,0,.25)}
@media(min-width:680px){.e6-feuille{border-radius:22px}}
.e6-poignee{width:40px;height:5px;border-radius:3px;background:var(--line);margin:0 auto 12px}
.e6-feuille h2{font-size:1.3rem;margin:0}
.e6-nbs{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px;margin:16px 0 14px}
.e6-nbs button{aspect-ratio:1;min-height:44px;border-radius:14px;border:1.5px solid var(--line);background:var(--card);font:inherit;font-size:1.25rem;font-weight:800;cursor:pointer;color:var(--ink)}
.e6-nbs button[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}
.e6-ligne{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;padding:12px 0;border-top:1px solid var(--line-2)}
.e6-ligne .lib{color:var(--muted)}.e6-ligne .val{font-weight:650;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.e6-mod{border:0;background:none;color:var(--accent-d);font:inherit;font-weight:650;text-decoration:underline;cursor:pointer;padding:0 4px;min-height:32px}
.e6-ab{display:flex;gap:8px}.e6-ab button{width:54px;min-height:44px;border-radius:12px;border:1.5px solid var(--line);background:var(--card);font:inherit;font-weight:750;cursor:pointer;color:var(--ink)}
.e6-ab button[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}.e6-ab button:disabled{opacity:.55;cursor:default}
.e6-ligne input,.e6-ligne select{font:inherit;min-height:44px;padding:6px 8px;border:1.5px solid var(--line);border-radius:10px;background:var(--card);color:var(--ink)}
.e6-actions{display:flex;gap:10px;margin-top:16px}
.e6-btn{flex:2;min-height:52px;border-radius:14px;border:0;background:var(--accent);color:var(--on-accent);font:inherit;font-weight:750;font-size:1.05rem;cursor:pointer}
.e6-btn:disabled{opacity:.4;cursor:default}
.e6-btn.sec{flex:1;background:var(--card);color:var(--ink-2);border:1.5px solid var(--line)}
.e6-toast{position:fixed;left:50%;bottom:96px;transform:translateX(-50%);z-index:70;background:#10232a;color:#fff;border-radius:999px;padding:10px 18px;font-weight:650;max-width:92vw}
.e6-toast.err{background:#8a1c1c}
`;
const COURT = { C1PSR: 'CAP 1 PSR', C2PSR: 'CAP 2 PSR', B2MELEC: '2de MELEC', B1MELEC: '1re MELEC', BTMELEC: 'Tle MELEC' };
const FILIERES = [['PSR', 'CAP PSR', '1re et 2e année'], ['MELEC', 'Bac Pro MELEC', '2de, 1re et Terminale']];
const K_APPAREIL = 'estimation-aesh-v6';
const empreinte = s => { let h = 5381; for (const ch of String(s)) h = (Math.imul(h, 33) ^ ch.codePointAt(0)) >>> 0; return h.toString(36).padStart(4, '0'); };
/* Identifiant du document d'un cours pour une période. */
export const idCours = (periodeDebut, classe, cle) => `cours_${periodeDebut}_${classe}_${empreinte(cle)}`;
export const idArchiveCours = (id, version) => `archive_${String(id).replace(/[^A-Za-z0-9]/g, '').toLowerCase()}_v${version}`;
/* Les documents « cours » vus comme des déclarations d'une ligne : même agrégation que l'Atelier. */
export function declarationsDeCours(docs) {
  return (docs || []).filter(d => d && d.type === 'cours').map(d => ({
    id: d.id, type: 'declaration', statut: d.statut === 'active' ? 'active' : 'retiree', periode: d.periode, creeLe: d.majLe, majLe: d.majLe, version: d.version,
    disciplines: [], lignes: [{ classe: d.classe, cle: d.cle, jour: d.jour, debut: d.debut, fin: d.fin, matiere: d.matiere, parite: d.parite, nb: d.nb,
      du: d.periode && d.periode.debut, au: d.au, semaines: d.semaines, hDebut: d.hDebut, hFin: d.hFin, aides: [], note: '' }]
  }));
}

export function creerEstimation(ctx) {
  const { FS, db, esc, annee, annonce, retourAccueil, pousser: pousserNav } = ctx;
  const S = { etat: 'chargement', cadre: null, docs: new Map(), ecran: 'filiere', fil: null, classe: null, sem: 'A', sel: null, f: null,
    conf: null, toast: '', toastErr: false, hote: null, focus: null, envoi: false, ignorerPop: 0, navFeuille: false, unsub: null, ecoute: false };
  if (!document.getElementById('e6-styles')) { const st = document.createElement('style'); st.id = 'e6-styles'; st.textContent = CSS; document.head.appendChild(st); }

  /* Mémoire de l'appareil : seulement la dernière modification faite ici (pour le « Bonjour »). */
  const lsLit = () => { try { const v = JSON.parse(localStorage.getItem(K_APPAREIL) || 'null'); return v && v.annee === annee ? v : null; } catch (e) { return null; } };
  const lsEcrit = v => { try { localStorage.setItem(K_APPAREIL, JSON.stringify({ annee, ...v })); } catch (e) { } };

  function ecouter() {
    if (S.ecoute) return; S.ecoute = true;
    try {
      S.unsub = FS.onSnapshot(FS.query(FS.collection(db, COL), FS.where('annee', '==', annee)), snap => {
        let brut = null; const docs = [];
        snap.forEach(d => { const x = d.data() || {}, id = x.id || d.id; if (x.type === 'cadre' && id === 'cadre_' + annee) brut = x; else if (x.type === 'cours') docs.push({ ...x, id }); });
        const c = normaliserCadre(brut);
        S.cadre = c; S.etat = c ? 'ok' : 'absent';
        S.docs = new Map(c ? docs.filter(d => d.periode && d.periode.debut === c.periode.debut).map(d => [d.id, d]) : []);
        dessiner(true);
      }, err => { S.ecoute = false; S.unsub = null; S.etat = /permission|insufficient/i.test(String(err && (err.code || err.message))) ? 'refus' : 'horsligne'; dessiner(); });
    } catch (e) { S.ecoute = false; S.etat = 'horsligne'; }
  }

  const cadre = () => S.cadre;
  const classeDe = nom => cadre() && cadre().classes.find(k => k.nom === nom);
  const courtDe = k => COURT[k.nom] || k.court || k.nom;
  const docDe = (k, cr) => { const d = S.docs.get(idCours(cadre().periode.debut, k.nom, cr.cle)); return d && d.statut === 'active' ? d : null; };
  const semaineVisible = cr => !cadre().avecParite || !cr.parite || cr.parite === S.sem;
  const jjmm = iso => RE_DATE.test(String(iso || '').slice(0, 10)) ? `${String(iso).slice(8, 10)}/${String(iso).slice(5, 7)}` : '';
  const quand = iso => { const d = new Date(iso); return isNaN(d) ? '' : `le ${z2(d.getDate())}/${z2(d.getMonth() + 1)} à ${d.getHours()} h ${z2(d.getMinutes())}`; };
  const moyennePole = pole => { const a = agreger(cadre(), declarationsDeCours([...S.docs.values()])); return (a.poles[pole] || { moyenne: 0 }).moyenne; };
  const pousser = () => { try { pousserNav && pousserNav({ ecran: S.ecran, fil: S.fil, classe: S.classe, sem: S.sem }); } catch (e) { } };
  const aller = (ecran, maj) => { Object.assign(S, maj || {}); S.ecran = ecran; S.focus = 'titre-ecran'; pousser(); dessiner(); window.scrollTo(0, 0); };
  const fermerFeuille = () => {
    S.sel = null; S.f = null;
    if (S.navFeuille) { S.navFeuille = false; S.ignorerPop++; try { history.back(); } catch (e) { S.ignorerPop--; } }
  };
  let toastTimer = null;
  const toast = (t, err) => { S.toast = t; S.toastErr = !!err; dessiner(); clearTimeout(toastTimer); toastTimer = setTimeout(() => { S.toast = ''; dessiner(); }, err ? 4000 : 1800); annonce && annonce(t); };

  function dessiner(depuisDonnees) {
    const h = S.hote; if (!h || !h.isConnected) return;
    const actif = document.activeElement, idActif = actif && h.contains(actif) ? actif.id : null, y = window.scrollY;
    let html = `<div class="e6">`;
    if (S.etat !== 'ok') html += blocEtat();
    else if (S.ecran === 'classe' && S.fil) html += ecranClasses();
    else if (S.ecran === 'edt' && classeDe(S.classe)) html += ecranEdt();
    else { S.ecran = 'filiere'; html += ecranFilieres(); }
    html += `</div>`;
    if (S.sel && S.f) html += feuille();
    if (S.conf) html += confirmation();
    if (S.toast) html += `<div class="e6-toast ${S.toastErr ? 'err' : ''}" role="status">${esc(S.toast)}</div>`;
    h.innerHTML = html;
    lier();
    if (S.focus) { const el = document.getElementById(S.focus); S.focus = null; if (el) el.focus({ preventScroll: !!depuisDonnees }); }
    else if (idActif) { const el = document.getElementById(idActif); if (el) el.focus({ preventScroll: true }); }
    if (depuisDonnees) window.scrollTo(0, y);
  }
  const barre = titre => `<div class="e6-barre"><button type="button" class="e6-retour" id="e6-retour" data-e="retour" aria-label="Retour">←</button><span class="t">${esc(titre || '')}</span></div>`;
  function blocEtat() {
    if (S.etat === 'chargement') return `${barre('')}<p class="message info" role="status">Chargement des emplois du temps…</p>`;
    const t = S.etat === 'absent' ? 'La coordination n’a pas encore publié les emplois du temps de l’estimation.' : S.etat === 'refus' ? 'Espace en cours d’ouverture par la coordination.' : 'Pas de connexion au serveur.';
    return `${barre('')}<div class="message warn" role="alert"><p>${t}</p><p><button type="button" class="btn primaire petit" data-e="reessayer">Réessayer</button></p></div>`;
  }
  function ecranFilieres() {
    const c = cadre();
    return `${barre('Estimation')}<span class="e6-per">${esc(c.periode.label)} · du ${esc(jjmm(c.periode.debut))} au ${esc(jjmm(c.periode.fin))}</span>
      <h1 id="titre-ecran" tabindex="-1">Votre filière</h1>
      ${FILIERES.filter(([p]) => c.classes.some(k => k.pole === p)).map(([p, t, s]) => `<button type="button" class="e6-gros" id="fil-${p}" data-e="fil" data-v="${p}"><span class="x"><b>${t}</b><span class="s">${s}</span></span><span class="fl" aria-hidden="true">›</span></button>`).join('')}`;
  }
  function compteur(pole) {
    const vol = cadre().volumes[pole], m = moyennePole(pole);
    return `<div class="e6-compteur" aria-label="Moyens humains estimés, pôle ${pole}"><div class="l"><span>Pôle ${pole}</span><span><b>${esc(fmtH(m))}</b> <span class="e6-info" style="display:inline">/ ${vol != null ? esc(fmtH(vol)) : '—'} par semaine</span></span></div>
      ${vol ? `<div class="e6-piste"><i class="${m > vol ? 'trop' : ''}" style="width:${Math.min(100, m / vol * 100)}%"></i></div>` : ''}</div>`;
  }
  function ecranClasses() {
    const c = cadre(), fil = FILIERES.find(f => f[0] === S.fil), ks = c.classes.filter(k => k.pole === S.fil), app = lsLit();
    let h = barre(fil ? fil[1] : '');
    if (app && app.derniere && classeDe(app.derniere.classe) && classeDe(app.derniere.classe).pole === S.fil)
      h += `<p class="e6-bonjour" role="status"><strong>Bonjour.</strong> Dernière modification depuis cet appareil : ${esc(courtDe(classeDe(app.derniere.classe)))}, ${esc(quand(app.derniere.maj))}.</p>`;
    h += compteur(S.fil) + `<h1 id="titre-ecran" tabindex="-1">Votre classe</h1>`;
    ks.forEach(k => {
      const n = k.creneaux.filter(cr => docDe(k, cr)).length;
      h += `<button type="button" class="e6-gros" id="cl-${esc(k.nom)}" data-e="classe" data-v="${esc(k.nom)}"><span class="x"><b>${esc(courtDe(k))}</b>
        <span class="s">${k.effectif != null ? `${k.effectif} élèves · ` : ''}${n ? `${n} cours estimé${n > 1 ? 's' : ''}` : 'aucun cours estimé'}</span></span><span class="fl" aria-hidden="true">›</span></button>`;
    });
    return h;
  }
  function ecranEdt() {
    const c = cadre(), k = classeDe(S.classe);
    const pf = (k.pfmp || []).filter(p => p.fin >= c.periode.debut && p.debut <= c.periode.fin);
    let h = barre(`${courtDe(k)}${k.effectif != null ? ` · ${k.effectif} élèves` : ''}`) + `<h1 id="titre-ecran" tabindex="-1">Emploi du temps</h1>`;
    if (c.avecParite) h += `<div class="e6-onglets" role="group" aria-label="Semaine">${['A', 'B'].map(s => `<button type="button" id="sem-${s}" data-e="sem" data-v="${s}" aria-pressed="${S.sem === s}">Semaine ${s}</button>`).join('')}</div>`;
    if (pf.length) h += `<p class="e6-info">${pf.map(p => `PFMP du ${esc(jjmm(p.debut))} au ${esc(jjmm(p.fin))}`).join(' · ')}</p>`;
    JOURS.forEach(j => {
      const cj = k.creneaux.filter(cr => cr.jour === j && semaineVisible(cr)); if (!cj.length) return;
      h += `<h2 class="e6-jour">${JOURS_L[j]}</h2>`;
      cj.forEach(cr => {
        const d = docDe(k, cr), cls = !d ? '' : d.nb === 0 ? 'n0' : d.nb === 1 ? 'n1' : d.nb === 2 ? 'n2' : 'n3';
        const hl = d ? horaireLigne(cr, d) : { debut: cr.debut, fin: cr.fin };
        const sem = d ? (cr.parite ? `sem. ${cr.parite}` : ['A', 'B'].includes(d.semaines) ? `sem. ${d.semaines}` : (c.avecParite ? 'sem. A et B' : '')) : '';
        h += `<button type="button" class="e6-cours ${cls}" id="cr-${esc(slug(cr.cle))}" data-e="cours" data-v="${esc(cr.cle)}"
          aria-label="${esc(`${JOURS_L[cr.jour]} ${hFr(cr.debut)}–${hFr(cr.fin)}, ${cr.matiere}${cr.parite ? ', semaine ' + cr.parite : ''}, ${d ? d.nb + ' AESH' : 'pas encore estimé'}`)}">
          <span class="h">${esc(hFr(cr.debut))}–${esc(hFr(cr.fin))}</span>
          <span class="m"><b>${esc(cr.matiere)}</b>${d ? `<small>${esc([`jusqu’au ${jjmm(d.au)}`, sem, (hl.debut !== cr.debut || hl.fin !== cr.fin) ? `${hFr(hl.debut)}–${hFr(hl.fin)}` : ''].filter(Boolean).join(' · '))}</small>` : ''}</span>
          <span class="p">${d ? `${d.nb} AESH` : '+'}</span></button>`;
      });
    });
    const n = k.creneaux.filter(cr => docDe(k, cr)).length;
    h += `<div class="e6-bas"><span>${n} cours estimé${n > 1 ? 's' : ''} · Pôle ${esc(k.pole)} ${esc(fmtH(moyennePole(k.pole)))}${c.volumes[k.pole] != null ? ` / ${esc(fmtH(c.volumes[k.pole]))}` : ''}</span><span class="e6-ok">✓ Enregistré automatiquement</span></div>`;
    return h;
  }
  function feuille() {
    const c = cadre(), k = classeDe(S.classe), cr = k && k.creneaux.find(x => x.cle === S.sel); if (!cr) { S.sel = null; return ''; }
    const f = S.f, existe = !!docDe(k, cr);
    const pas = []; for (let m = min(cr.debut); m <= min(cr.fin); m += 15) pas.push(hDe(m)); if (pas[pas.length - 1] !== cr.fin) pas.push(cr.fin);
    const peutValider = f.nb != null && (f.A || f.B) && RE_DATE.test(f.au || '');
    return `<div class="e6-ov" data-e="fond"><div class="e6-feuille" role="dialog" aria-modal="true" aria-labelledby="f-titre"><div class="e6-poignee" aria-hidden="true"></div>
      <h2 id="f-titre" tabindex="-1">${esc(JOURS_L[cr.jour])} ${esc(hFr(cr.debut))}–${esc(hFr(cr.fin))}</h2>
      <p class="e6-info">${esc(cr.matiere)} · ${esc(courtDe(k))}${cr.parite ? ` · semaine ${esc(cr.parite)}` : ''}</p>
      <div class="e6-nbs" role="group" aria-label="Nombre d’AESH estimé">${[0, 1, 2, 3, 4, 5, 6].map(v => `<button type="button" id="nb-${v}" data-e="nb" data-v="${v}" aria-pressed="${f.nb === v}">${v}</button>`).join('')}</div>
      <div class="e6-ligne"><span class="lib">Période</span><span class="val">${f.modPer
        ? `<label class="sr" for="f-au">Jusqu’au</label><input type="date" id="f-au" data-i="au" value="${esc(f.au)}" min="${esc(c.periode.debut)}" max="${esc(c.periode.fin)}">`
        : `jusqu’au ${esc(jjmm(f.au))}<button type="button" class="e6-mod" id="mod-per" data-e="mod-per">modifier</button>`}</span></div>
      ${c.avecParite ? `<div class="e6-ligne"><span class="lib">Semaines</span><span class="e6-ab">${['A', 'B'].map(s => `<button type="button" id="ab-${s}" data-e="ab" data-v="${s}" aria-pressed="${!!f[s]}" ${cr.parite ? 'disabled' : ''}>${s}</button>`).join('')}</span></div>` : ''}
      <div class="e6-ligne"><span class="lib">Horaire</span><span class="val">${f.modH
        ? `<label class="sr" for="f-hd">De</label><select id="f-hd" data-i="hDebut">${pas.slice(0, -1).map(x => `<option value="${x}" ${x === f.hDebut ? 'selected' : ''}>${hFr(x)}</option>`).join('')}</select>–<label class="sr" for="f-hf">à</label><select id="f-hf" data-i="hFin">${pas.slice(1).map(x => `<option value="${x}" ${x === f.hFin ? 'selected' : ''}>${hFr(x)}</option>`).join('')}</select>`
        : `${esc(hFr(f.hDebut))}–${esc(hFr(f.hFin))}<button type="button" class="e6-mod" id="mod-h" data-e="mod-h">modifier</button>`}</span></div>
      <div class="e6-actions">${existe ? `<button type="button" class="e6-btn sec" id="f-retirer" data-e="retirer">Retirer</button>` : ''}
        <button type="button" class="e6-btn" id="f-enregistrer" data-e="enregistrer" ${peutValider && !S.envoi ? '' : 'disabled'}>${S.envoi ? 'Enregistrement…' : 'Enregistrer'}</button></div>
    </div></div>`;
  }
  function confirmation() {
    return `<div class="e6-ov"><div class="e6-feuille" role="alertdialog" aria-modal="true" aria-labelledby="c-titre"><h2 id="c-titre" tabindex="-1">Êtes-vous sûr ?</h2>
      <p style="margin-top:10px">${esc(S.conf.texte)}</p>
      <div class="e6-actions"><button type="button" class="e6-btn sec" id="c-non" data-e="conf-non">Annuler</button><button type="button" class="e6-btn" id="c-oui" data-e="conf-oui">${esc(S.conf.bouton)}</button></div></div></div>`;
  }
  function ouvrir(cle) {
    const c = cadre(), k = classeDe(S.classe), cr = k.creneaux.find(x => x.cle === cle); if (!cr) return;
    const d = docDe(k, cr), hl = d ? horaireLigne(cr, d) : { debut: cr.debut, fin: cr.fin };
    S.sel = cle;
    S.f = { nb: d ? d.nb : null, au: d && RE_DATE.test(d.au || '') ? d.au : c.periode.fin, hDebut: hl.debut, hFin: hl.fin, modPer: false, modH: false,
      A: cr.parite ? cr.parite === 'A' : (d ? d.semaines !== 'B' : true), B: cr.parite ? cr.parite === 'B' : (d ? d.semaines !== 'A' : true) };
    if (!S.navFeuille) { S.navFeuille = true; pousser(); }
    S.focus = S.f.nb != null ? 'nb-' + S.f.nb : 'f-titre'; dessiner();
  }
  async function ecrire(k, cr, statut) {
    const c = cadre(), id = idCours(c.periode.debut, k.nom, cr.cle), prec = S.docs.get(id), f = S.f, maintenant = new Date().toISOString();
    const hl = horaireLigne(cr, { hDebut: f.hDebut, hFin: f.hFin });
    const doc = { id, type: 'cours', annee, periode: { debut: c.periode.debut, fin: c.periode.fin, label: String(c.periode.label || '').slice(0, 40) },
      classe: k.nom, cle: cr.cle, jour: cr.jour, debut: cr.debut, fin: cr.fin, matiere: cr.matiere, parite: cr.parite,
      nb: statut === 'retire' ? (prec ? prec.nb : 0) : f.nb, au: RE_DATE.test(f.au || '') && f.au >= c.periode.debut && f.au <= c.periode.fin ? f.au : c.periode.fin,
      semaines: cr.parite || !c.avecParite || (f.A && f.B) ? 'toutes' : (f.A ? 'A' : 'B'), hDebut: hl.debut, hFin: hl.fin,
      statut, version: ((prec && prec.version) || 0) + 1, majLe: maintenant, source: 'estimation-aesh' };
    S.envoi = true; dessiner();
    try {
      await Promise.race([FS.setDoc(FS.doc(db, COL, id), doc), new Promise((_, rej) => setTimeout(() => rej(new Error('délai dépassé')), 15000))]);
      try { const aid = idArchiveCours(id, doc.version); Promise.resolve(FS.setDoc(FS.doc(db, COL, aid), { ...doc, id: aid, type: 'archive', declaration: id, lignes: declarationsDeCours([doc])[0].lignes, commentaire: '' })).catch(() => { }); } catch (e) { }
      S.docs.set(id, doc); S.envoi = false;
      lsEcrit({ derniere: { classe: k.nom, maj: maintenant } });
      fermerFeuille();
      toast(statut === 'retire' ? 'Estimation retirée' : '✓ Enregistré');
    } catch (e) {
      S.envoi = false;
      const t = String((e && (e.code || e.message)) || e);
      toast(/permission|insufficient/i.test(t) ? 'Non enregistré : espace pas encore ouvert par la coordination.' : 'Non enregistré : pas de connexion. Réessayez.', true);
    }
  }
  function lier() {
    const h = S.hote;
    h.onclick = ev => {
      const b = ev.target.closest('[data-e]'); if (!b || b.disabled) return;
      const a = b.dataset.e, v = b.dataset.v;
      if (a === 'fond') { if (ev.target === b && !S.envoi) { fermerFeuille(); dessiner(); } return; }
      if (a === 'retour') { if (S.ecran === 'edt') aller('classe'); else if (S.ecran === 'classe') aller('filiere'); else retourAccueil && retourAccueil(); return; }
      if (a === 'reessayer') { S.etat = 'chargement'; S.ecoute = false; if (S.unsub) try { S.unsub(); } catch (e) { } S.unsub = null; ecouter(); dessiner(); return; }
      if (a === 'fil') return aller('classe', { fil: v });
      if (a === 'classe') return aller('edt', { classe: v, sem: 'A' });
      if (a === 'sem') { S.sem = v; S.focus = b.id; dessiner(); return; }
      if (a === 'cours') return ouvrir(v);
      if (a === 'nb') { S.f.nb = Number(v); S.focus = b.id; dessiner(); return; }
      if (a === 'ab') { S.f[v] = !S.f[v]; S.focus = b.id; dessiner(); return; }
      if (a === 'mod-per') { S.f.modPer = true; S.focus = 'f-au'; dessiner(); return; }
      if (a === 'mod-h') { S.f.modH = true; S.focus = 'f-hd'; dessiner(); return; }
      if (a === 'enregistrer') { const k = classeDe(S.classe), cr = k.creneaux.find(x => x.cle === S.sel); if (cr) ecrire(k, cr, 'active'); return; }
      if (a === 'retirer') { S.conf = { texte: 'Retirer l’estimation de ce cours ?', bouton: 'Retirer' }; S.focus = 'c-oui'; dessiner(); return; }
      if (a === 'conf-non') { S.conf = null; S.focus = 'f-retirer'; dessiner(); return; }
      if (a === 'conf-oui') { S.conf = null; const k = classeDe(S.classe), cr = k.creneaux.find(x => x.cle === S.sel); if (cr) ecrire(k, cr, 'retire'); return; }
    };
    h.onchange = ev => {
      const t = ev.target, k = t.dataset && t.dataset.i; if (!k || !S.f) return;
      S.f[k] = t.value;
      if ((k === 'hDebut' || k === 'hFin') && min(S.f.hFin) <= min(S.f.hDebut)) { if (k === 'hDebut') S.f.hFin = hDe(min(S.f.hDebut) + 15); else S.f.hDebut = hDe(min(S.f.hFin) - 15); }
      S.focus = t.id; dessiner();
    };
    h.onkeydown = ev => { if (ev.key === 'Escape' && (S.sel || S.conf) && !S.envoi) { if (S.conf) S.conf = null; else fermerFeuille(); dessiner(); } };
  }
  const slug = s => String(s).replace(/[^A-Za-z0-9]+/g, '-');

  return {
    monter(hote) { S.hote = hote; S.ecran = 'filiere'; S.sel = null; S.f = null; S.conf = null; S.navFeuille = false; ecouter(); dessiner(); },
    fermer() { S.hote = null; },
    consommerPop() { if (S.ignorerPop > 0) { S.ignorerPop--; return true; } return false; },
    restaurerNav(e) {
      S.conf = null; S.sel = null; S.f = null; S.navFeuille = false;
      S.ecran = e && ['filiere', 'classe', 'edt'].includes(e.ecran) ? e.ecran : 'filiere';
      if (e) { S.fil = e.fil || S.fil; S.classe = e.classe || S.classe; S.sem = e.sem || 'A'; }
      S.focus = 'titre-ecran'; dessiner();
    },
    _etat: () => S
  };
}
