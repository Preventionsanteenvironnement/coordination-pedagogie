/* ═══════════════════════════════════════════════════════════════════
   Estimation des besoins en AESH — pôle PSR / MELEC (page enseignants) · v2 « période »
   Chargé par demandes-aesh/index.html (écran « estimation »).

   Lit   : coordination_estimation_aesh / cadre_<année>  (période, semaines A/B, vacances et jours fériés,
           PFMP par classe, emplois du temps, effectifs, volumes) et toutes les déclarations de l'année.
   Écrit : coordination_estimation_aesh / declaration_<id>  (la sienne, mise à jour sur place).

   Pour chaque cours : nombre d'AESH (0 à 6), période (fin de période, raccourcis vacances, ou dates),
   semaines (A, B ou les deux), horaire ajustable, aides et précision facultatives. Aucun nom.
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

const CSS = `
.est{--est-r:16px}
.est-tete{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px 20px;align-items:flex-end}
.est-tete h1{font-size:clamp(1.5rem,3.2vw,2.1rem);letter-spacing:-.02em;font-weight:760}
.est-tete p{color:var(--muted);margin-top:6px;max-width:62ch}
.est-rgpd{display:flex;gap:10px;align-items:flex-start;background:var(--card);border:1px solid var(--line-2);border-left:4px solid var(--accent);border-radius:12px;padding:12px 14px;margin-top:16px;font-size:1rem}
.est-rgpd b{color:var(--ink)}
.est-periode{margin-top:14px;border-radius:14px;padding:14px 16px;background:var(--accent-l);border:1px solid var(--accent);color:var(--ink)}
.est-periode b{font-weight:760}
.est-bloc{background:var(--card);border:1px solid var(--line-2);border-radius:var(--est-r);padding:18px;box-shadow:var(--sh);margin-top:16px}
.est-bloc h2{font-size:1.15rem;font-weight:720;letter-spacing:-.01em}
.est-sous{color:var(--muted);font-size:1rem;margin-top:4px}
.est-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.est-chip{min-height:44px;padding:8px 16px;border-radius:999px;border:1.5px solid var(--line);background:var(--card);font-weight:650;color:var(--ink-2)}
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
.est-total{color:var(--muted);margin-top:2px}
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
.est-info{display:flex;flex-wrap:wrap;gap:6px 16px;margin:12px 0 10px;color:var(--muted);font-size:1rem;align-items:center}
.est-info b{color:var(--ink)}
.est-pfmp{display:inline-block;background:var(--warn-bg);color:var(--warn-ink);border:1px solid var(--warn-line);border-radius:999px;padding:1px 10px}
.est-vues{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 4px}
.est-vue{min-height:44px;padding:6px 14px;border-radius:12px;border:1.5px solid var(--line);background:var(--card);font-weight:650}
.est-vue[aria-pressed="true"]{background:var(--ink);border-color:var(--ink);color:var(--card)}
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
.est-cal{display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));margin-top:8px}
.est-mois{border:1px solid var(--line-2);border-radius:14px;padding:10px 12px;background:var(--card)}
.est-mois h3{font-size:1rem;text-transform:capitalize;margin-bottom:6px}
.est-sem{display:flex;justify-content:space-between;gap:8px;border-radius:8px;padding:6px 8px;margin-top:4px;background:var(--card-2)}
.est-sem.vac{background:transparent;border:1px dashed var(--line);color:var(--muted)}
.est-sem.pfmp{background:var(--warn-bg);color:var(--warn-ink)}
.est-sem small{font-size:1rem}
.est-rec ul{list-style:none;margin:10px 0 0;padding:0}
.est-rec li{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line-2)}
.est-rec li .q{min-width:0}
.est-rec li .q small{display:block;color:var(--muted);font-size:1rem}
.est-nbpill{display:inline-block;min-width:2.2em;text-align:center;padding:1px 8px;border-radius:999px;font-weight:760;border:1.5px solid}
.est-tot{display:flex;flex-direction:column;gap:4px;margin-top:10px;font-weight:650}
.est-ov{position:fixed;inset:0;z-index:60;background:rgba(15,23,42,.45);display:flex;align-items:flex-end;justify-content:center;padding:0}
@media(min-width:680px){.est-ov{align-items:center;padding:20px}}
.est-feuille{background:var(--card);color:var(--ink);width:100%;max-width:560px;max-height:92vh;overflow:auto;border-radius:20px 20px 0 0;padding:20px 20px calc(20px + env(safe-area-inset-bottom,0px));box-shadow:0 -10px 40px rgba(0,0,0,.25)}
@media(min-width:680px){.est-feuille{border-radius:20px}}
.est-feuille h2{font-size:1.2rem}
.est-q{margin-top:14px;font-weight:650}
.est-nb{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px;margin:10px 0 4px}
.est-nb button{aspect-ratio:1;min-height:44px;border-radius:14px;border:1.5px solid var(--line);background:var(--card);font-size:1.2rem;font-weight:760;font-variant-numeric:tabular-nums}
.est-nb button:hover{border-color:var(--accent)}
.est-nb button[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}
.est-ligne{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:8px}
.est-ligne input,.est-ligne select{min-height:44px;width:auto}
.est-calc{margin-top:14px;border-radius:12px;padding:10px 12px;background:var(--card-2);border:1px solid var(--line-2)}
.est-calc b{color:var(--ink)}
.est-champ{display:flex;flex-direction:column;gap:6px;margin-top:14px}
.est-champ label{font-weight:650}
.est-champ small{color:var(--warn-ink);font-size:1rem}
.est-ok{background:var(--ok-bg);border:1.5px solid var(--ok-line);color:var(--ok-ink);border-radius:var(--est-r);padding:18px}
.est-code{font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:1.2rem;font-weight:760;letter-spacing:.08em;background:var(--card);color:var(--ink);border:1.5px dashed var(--ok-line);border-radius:10px;padding:4px 10px;display:inline-block}
.est-groupes{display:flex;flex-wrap:wrap;gap:10px 22px;margin-top:18px}
.est-groupe{display:flex;flex-direction:column;gap:6px;min-width:0;max-width:100%}
.est-groupe>span{font-size:1rem;font-weight:720;color:var(--muted)}
.est-groupe .est-onglets{margin-top:0}
.est-mode{display:flex;gap:6px;flex-wrap:wrap;margin-top:14px}
.est-bonjour{margin-top:14px;border-radius:14px;padding:14px 16px;background:var(--ok-bg);border:1px solid var(--ok-line);color:var(--ok-ink)}
.est-bonjour p+p{margin-top:8px}
.est-valid{position:sticky;bottom:0;z-index:20;margin-top:16px;display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;justify-content:space-between;padding:12px 16px calc(12px + env(safe-area-inset-bottom,0px));border-radius:14px;background:var(--card);border:1.5px solid var(--line-2);box-shadow:0 -10px 26px -14px rgba(15,23,42,.45)}
.est-valid.sale{border-color:var(--warn-line);background:var(--warn-bg);color:var(--warn-ink)}
.est-valid.ok{border-color:var(--ok-line);background:var(--ok-bg);color:var(--ok-ink)}
.est-valid .btn{min-height:48px}
@media(max-width:520px){.est-valid .btn{width:100%}}
.est-lecture{margin-top:10px;color:var(--muted)}
`;

export function creerEstimation(ctx) {
  const { FS, db, esc, annee, annonce, retourAccueil, pousser: pousserNav, remplacer: remplacerNav } = ctx;
  const S = {
    etat: 'chargement', cadre: null, decls: [], unsub: null, ecoute: false,
    etape: 'matieres', mode: 'estimer', mats: new Set(), classe: null, vue: 'A', lignes: new Map(), commentaire: '',
    sel: null, f: null, conf: null, histo: [], navFeuille: false, ignorerPop: 0, flash: '', bonjour: false, periodeDebut: null, nouvellePeriode: '',
    docId: null, version: 0, creeLe: null, envoyeLe: null, envoyeSig: null, envoi: '', message: '', hote: null, focus: null, retrouvee: false, retire: false
  };
  if (!document.getElementById('est-styles')) { const st = document.createElement('style'); st.id = 'est-styles'; st.textContent = CSS; document.head.appendChild(st); }

  /* ── ce qui a été validé (envoyé) : signature, pour savoir s'il reste des modifications à valider ── */
  const signature = () => JSON.stringify({ m: [...S.mats].sort(), c: String(S.commentaire || ''),
    l: [...S.lignes.values()].map(l => [l.classe, l.cle, l.nb, l.du || '', l.au || '', l.semaines || 'toutes', l.hDebut || '', l.hFin || '', [...(l.aides || [])].sort().join(','), l.note || ''])
      .sort((a, b) => (a[0] + '|' + a[1]).localeCompare(b[0] + '|' + b[1])) });
  const sale = () => (S.lignes.size > 0 || !!S.docId) && signature() !== S.envoyeSig;

  /* ── stockage local ── */
  const lsLit = () => { try { const v = JSON.parse(localStorage.getItem(K_LOCAL) || 'null'); return v && v.annee === annee ? v : null; } catch (e) { return null; } };
  const lsEcrit = () => {
    try {
      localStorage.setItem(K_LOCAL, JSON.stringify({ annee, periodeDebut: S.periodeDebut, docId: S.docId, version: S.version, creeLe: S.creeLe, envoyeLe: S.envoyeLe, envoyeSig: S.envoyeSig,
        nonEnvoye: sale(), mats: [...S.mats], lignes: [...S.lignes.values()], commentaire: S.commentaire }));
    } catch (e) { }
  };
  (function restaurer() {
    const v = lsLit(); if (!v) return;
    S.docId = v.docId || null; S.version = v.version || 0; S.creeLe = v.creeLe || null; S.envoyeLe = v.envoyeLe || null; S.periodeDebut = v.periodeDebut || null;
    S.mats = new Set(Array.isArray(v.mats) ? v.mats : []); S.commentaire = String(v.commentaire || '');
    (Array.isArray(v.lignes) ? v.lignes : []).forEach(l => { if (l && l.classe && l.cle) S.lignes.set(l.classe + '|' + l.cle, l); });
    /* Saisie enregistrée avant cette version : si elle avait été envoyée, on la considère validée. */
    S.envoyeSig = typeof v.envoyeSig === 'string' ? v.envoyeSig : (v.envoyeLe && v.docId ? signature() : null);
    S.bonjour = !!(S.docId && S.envoyeLe);
  })();
  /* Quitter la page avec des modifications non validées : le navigateur demande confirmation. */
  window.addEventListener('beforeunload', ev => { if (S.lignes.size && sale()) { ev.preventDefault(); ev.returnValue = ''; } });
  const pousser = () => { try { pousserNav && pousserNav({ etape: S.etape, mode: S.mode, sel: S.sel || null }); } catch (e) { } };
  const fermerFeuille = () => {
    S.sel = null; S.f = null;
    if (S.navFeuille) { S.navFeuille = false; S.ignorerPop++; try { history.back(); } catch (e) { S.ignorerPop--; } }
  };
  const dateHeureLongue = iso => { const d = new Date(iso); if (isNaN(d)) return ''; return `le ${dateLongue(`${d.getFullYear()}-${z2(d.getMonth() + 1)}-${z2(d.getDate())}`)} à ${d.getHours()} h ${z2(d.getMinutes())}`; };

  /* ── données ── */
  function ecouter() {
    if (S.ecoute) return; S.ecoute = true;
    try {
      S.unsub = FS.onSnapshot(FS.query(FS.collection(db, COL), FS.where('annee', '==', annee)), snap => {
        const decls = []; let cadre = null;
        snap.forEach(d => { const x = d.data() || {}, id = x.id || d.id; if (x.type === 'cadre' && id === 'cadre_' + annee) cadre = x; else if (x.type === 'declaration') decls.push({ ...x, id }); });
        const c = normaliserCadre(cadre);
        S.decls = c ? decls.filter(d => dansPeriode(d, c)) : decls;
        S.cadre = c; S.etat = c ? 'ok' : 'absent';
        if (c) verifierPeriode(c);
        if (c && !S.classe) S.classe = c.classes[0].nom;
        if (c && !c.avecParite && S.vue !== 'cal') S.vue = 'A';
        if (c && S.mats.size && S.etape === 'matieres' && S.retrouvee) { S.etape = 'edt'; try { remplacerNav && remplacerNav({ etape: 'edt', mode: S.mode, sel: null }); } catch (e) { } }
        S.retrouvee = false;
        dessiner(true);
      }, err => { S.ecoute = false; S.unsub = null; S.etat = /permission|insufficient/i.test(String(err && (err.code || err.message))) ? 'refus' : 'horsligne'; dessiner(); });
    } catch (e) { S.ecoute = false; S.etat = 'horsligne'; }
  }

  /* Nouvelle période publiée : l'estimation de la période précédente reste enregistrée en ligne ;
     on en commence une nouvelle (nouveau document), en gardant les matières. */
  function verifierPeriode(c) {
    if (!S.periodeDebut) {
      const ancienne = S.docId && !dansPeriode({ creeLe: S.creeLe || S.envoyeLe }, c);
      if (!ancienne) { S.periodeDebut = c.periode.debut; lsEcrit(); return; }
    } else if (S.periodeDebut === c.periode.debut) return;
    S.nouvellePeriode = c.periode.label;
    S.docId = null; S.version = 0; S.creeLe = null; S.envoyeLe = null; S.envoyeSig = null;
    S.lignes = new Map(); S.commentaire = ''; S.histo = []; S.bonjour = false; S.retrouvee = false;
    S.periodeDebut = c.periode.debut; if (S.etape === 'envoye') S.etape = 'matieres';
    lsEcrit();
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
  const libellePeriode = l => {
    const c = cadre(), r = c.raccourcis.find(x => (!l.du || l.du === c.periode.debut) && l.au === x.fin);
    if (!l.au || (l.au === c.periode.fin && (!l.du || l.du === c.periode.debut))) return `toute la période (jusqu’au ${dFr(c.periode.fin)})`;
    if (r) return `${r.label.charAt(0).toLowerCase()}${r.label.slice(1)}`;
    return `du ${dFr(l.du || c.periode.debut)} au ${dFr(l.au)}`;
  };
  const libelleSemaines = (cr, l) => cr.parite ? `semaine ${cr.parite} seulement` : (l && ['A', 'B'].includes(l.semaines) ? `semaine ${l.semaines} seulement` : (cadre().avecParite ? 'semaines A et B' : 'chaque semaine'));

  /* ── rendu ── */
  function dessiner(depuisDonnees) {
    const h = S.hote; if (!h || !h.isConnected) return;
    const actif = document.activeElement, idActif = actif && h.contains(actif) ? actif.id : null;
    const y = window.scrollY;
    let html = `<div class="est">`;
    html += `<div class="est-tete"><div><h1 id="titre-ecran" tabindex="-1">Estimation des besoins d’accompagnement</h1>
      <p>Pôle PSR / MELEC · ${esc(annee)} · pour chacun de vos cours, indiquez combien d’AESH seraient nécessaires. Tout reste modifiable.</p></div>
      <button type="button" class="btn petit" data-e="accueil">← Accueil</button></div>
      <p class="est-rgpd" role="note"><span aria-hidden="true">🔒</span><span><b>RGPD : aucun nom.</b> Ni nom ni prénom d’élève, aucune information de santé : uniquement un nombre d’AESH par cours. En cas de besoin, vous pouvez ajouter un commentaire, lui aussi sans nom.</span></p>`;
    if (S.etat === 'ok') {
      const c = cadre();
      html += `<p class="est-periode"><b>Estimation « ${esc(c.periode.label)} » : du ${esc(dateLongue(c.periode.debut))} au ${esc(dateLongue(c.periode.fin))}.</b><br>
        Indiquez vos besoins pour cette période. Les vacances, les jours fériés et les PFMP sont déjà retirés. À la fin de la période, une nouvelle estimation sera ouverte.</p>`;
      if (S.nouvellePeriode) html += `<p class="est-bonjour" role="status"><strong>Nouvelle période : « ${esc(S.nouvellePeriode)} ».</strong> Votre estimation de la période précédente reste enregistrée à la coordination. Indiquez vos besoins pour cette nouvelle période.</p>`;
    }
    if (S.etat !== 'ok') html += blocEtat();
    else if (S.etape === 'envoye') html += blocEnvoye();
    else if (S.etape === 'matieres' || (!S.mats.size && S.mode !== 'voir')) html += blocMatieres();
    else html += blocEdt();
    html += `</div>`;
    if (S.sel && S.f) html += feuilleCreneau();
    if (S.conf) html += feuilleConfirmation();
    h.innerHTML = html;
    lier();
    if (S.focus) { const el = document.getElementById(S.focus); S.focus = null; if (el) el.focus({ preventScroll: !!depuisDonnees }); }
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
    const dispo = disciplinesDispo(), deja = S.docId && S.envoyeLe;
    return `${deja ? `<div class="est-bonjour" role="status"><p>${htmlBonjour()}</p>
        <p style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn primaire petit" data-e="reprendre">Voir ou modifier mon estimation</button>
        <button type="button" class="btn petit" data-e="retirer">Retirer mon estimation</button></p></div>` : ''}
      <section class="est-bloc" aria-labelledby="h-mats"><h2 id="h-mats" tabindex="-1">1. Quelle(s) matière(s) enseignez-vous dans ces classes ?</h2>
      <p class="est-sous">Seuls vos cours seront cliquables ; ceux des collègues restent visibles en pointillés. Vous pouvez en choisir plusieurs.</p>
      <div class="est-chips" role="group" aria-label="Vos matières">${dispo.map(d => `<button type="button" class="est-chip" id="mat-${esc(d.id)}" data-e="mat" data-v="${esc(d.id)}" aria-pressed="${S.mats.has(d.id)}">${esc(d.label)}</button>`).join('')}</div>
      <div class="est-actions"><span class="discret">${S.mats.size ? `${S.mats.size} matière${S.mats.size > 1 ? 's' : ''} choisie${S.mats.size > 1 ? 's' : ''}` : 'Choisissez au moins une matière.'}</span>
        <span class="droite"><button type="button" class="btn primaire" id="est-continuer" data-e="continuer" ${S.mats.size ? '' : 'disabled'}>Continuer →</button></span></div></section>
      <section class="est-bloc" aria-labelledby="h-consulter"><h2 id="h-consulter">Consulter les estimations des classes</h2>
      <p class="est-sous">Sans rien modifier : les besoins déjà estimés par l’équipe, cours par cours, pour le CAP PSR (1re et 2e année) et le Bac Pro MELEC (2de, 1re, Tle).</p>
      <p style="margin-top:10px"><button type="button" class="btn" id="est-consulter" data-e="consulter">Voir les estimations des classes →</button></p></section>
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
    const lecture = S.mode === 'voir' || !S.mats.size;
    let h = S.mats.size ? `<div class="est-bloc" style="padding:12px 16px"><div class="est-bar">
      <span class="est-mats">Vos matières : <b>${[...S.mats].map(disciplineLabel).map(esc).join(', ')}</b> · <button type="button" class="lien" data-e="changer">changer</button></span>
      <span style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn petit" data-e="annuler-action" ${S.histo.length ? '' : 'disabled'}>↶ Annuler la dernière action</button></span></div></div>`
      : `<div class="est-bloc" style="padding:12px 16px"><div class="est-bar"><span class="est-mats"><b>Consultation des estimations</b> · rien n’est modifiable ici</span>
      <button type="button" class="btn primaire petit" data-e="changer">Choisir mes matières pour estimer →</button></div></div>`;
    if (S.bonjour && S.docId && S.envoyeLe && !sale()) h += `<div class="est-bonjour" role="status"><p>${htmlBonjour()}</p></div>`;
    h += `<div class="est-jauges">${['PSR', 'MELEC'].map(p => jauge(p, autres, tous, p === cl.pole)).join('')}</div>`;
    const nMiens = k => k.creneaux.filter(mien).length;
    h += `<div class="est-groupes">${GROUPES.map(([pole, titre]) => { const ks = c.classes.filter(k => k.pole === pole); if (!ks.length) return '';
      return `<div class="est-groupe"><span>${esc(titre)}</span><div class="est-onglets" role="tablist" aria-label="Classes de ${esc(titre)}">${ks.map(k => `<button type="button" role="tab" class="est-onglet" id="cl-${esc(k.nom)}" data-e="classe" data-v="${esc(k.nom)}" aria-selected="${k.nom === cl.nom}">
      <b>${esc(k.court)}</b><span>${k.effectif != null ? `${k.effectif} élèves` : esc(titre)}${S.mats.size ? ` · ${nMiens(k) ? `${nMiens(k)} cours pour vous` : 'aucun cours pour vous'}` : ''}</span></button>`).join('')}</div></div>`; }).join('')}</div>`;
    if (S.mats.size) h += `<div class="est-mode" role="group" aria-label="Affichage"><button type="button" class="est-vue" id="mode-estimer" data-e="mode" data-v="estimer" aria-pressed="${!lecture}">Estimer mes cours</button>
      <button type="button" class="est-vue" id="mode-voir" data-e="mode" data-v="voir" aria-pressed="${lecture}">Voir les estimations de la classe</button></div>`;
    const pf = (cl.pfmp || []).filter(p => p.fin >= c.periode.debut && p.debut <= c.periode.fin);
    const miens = nMiens(cl), estimes = cl.creneaux.filter(cr => tous.slots.has(cl.nom + '|' + cr.cle)).length;
    h += `<div class="est-info"><span>${esc(cl.label)}</span><span>Effectif : <b>${cl.effectif != null ? `${cl.effectif} élèves` : '—'}</b></span>
      ${pf.length ? pf.map(p => `<span class="est-pfmp">PFMP du ${esc(dFr(p.debut))} au ${esc(dFr(p.fin))} : pas de cours</span>`).join('') : '<span><b>Pas de PFMP pendant la période</b></span>'}
      <span>${lecture ? `<b>${estimes}</b> cours sur ${cl.creneaux.length} déjà estimé${estimes > 1 ? 's' : ''}` : miens ? `<b>${miens}</b> cours pour vous dans cette classe` : 'Aucun cours de vos matières dans cette classe'}</span></div>`;
    const vues = (c.avecParite ? [['A', 'Semaine A'], ['B', 'Semaine B']] : [['A', 'Semaine type']]).concat([['cal', 'Calendrier de la période']]);
    h += `<div class="est-vues" role="group" aria-label="Vue">${vues.map(([k, t]) => `<button type="button" class="est-vue" id="vue-${k}" data-e="vue" data-v="${k}" aria-pressed="${S.vue === k}">${t}</button>`).join('')}</div>`;
    if (S.vue === 'cal') h += calendrier(cl);
    else {
      const crs = cl.creneaux.filter(cr => !c.avecParite || !cr.parite || cr.parite === S.vue);
      h += grille(cl, crs, autres, tous, lecture) + liste(cl, crs, autres, tous, lecture);
      h += `<div class="est-leg2">${lecture ? '' : '<span><i style="background:var(--info-bg);border-color:var(--info-line)"></i>votre cours, à renseigner</span>'}<span><i style="background:var(--card-2);border-color:var(--ink-2)"></i>0 AESH</span>
        <span><i style="background:var(--ok-bg);border-color:var(--ok-line)"></i>1</span><span><i style="background:var(--warn-bg);border-color:var(--warn-line)"></i>2</span><span><i style="background:var(--err-bg);border-color:var(--err-line)"></i>3 ou plus</span>
        <span><i style="border-style:dashed;border-color:var(--line)"></i>${lecture ? 'pas encore estimé' : 'cours d’un collègue'}</span></div>
        ${lecture ? '<p class="est-lecture">Le nombre affiché est le plus grand besoin estimé sur le cours, toutes estimations confondues. Aucun nom, aucun commentaire n’est montré.</p>' : ''}
        ${c.avecParite ? `<p class="est-sous">Semaine ${S.vue} : un cours qui n’a lieu qu’une semaine sur deux n’apparaît que dans sa semaine.</p>` : ''}`;
    }
    if (S.mats.size && !lecture) h += recap(autres, tous);
    if (S.mats.size) h += barreValidation();
    return h;
  }
  function htmlBonjour() {
    const m = [...S.mats].map(disciplineLabel);
    return `<strong>Bonjour.</strong> Votre estimation${m.length ? ` (${esc(m.join(', '))})` : ''} est enregistrée. Dernière modification ${esc(dateHeureLongue(S.envoyeLe))}. Vous pouvez la modifier à tout moment.`;
  }
  /* Barre toujours visible en bas : rappelle de valider, ou confirme que tout est enregistré. */
  function barreValidation() {
    const n = S.lignes.size, maj = S.docId && S.envoyeLe;
    if (sale() && n) return `<div class="est-valid sale" role="status" id="est-barre"><span><b>${n} cours renseigné${n > 1 ? 's' : ''} · ${maj ? 'modifications pas encore validées' : 'estimation pas encore validée'}</b>
      ${S.flash ? `<br>${esc(S.flash)}` : '<br>Pensez à valider pour transmettre votre estimation à la coordination.'}</span>
      <button type="button" class="btn primaire" id="est-valider-barre" data-e="envoyer" ${S.envoi === 'encours' ? 'disabled' : ''}>Valider mon estimation</button></div>`;
    if (maj && !sale()) return `<div class="est-valid ok" role="status" id="est-barre"><span><b>✓ Estimation enregistrée</b> · dernière modification ${esc(dateHeureLongue(S.envoyeLe))}<br>Vous pouvez la modifier à tout moment.</span></div>`;
    if (sale() && !n && maj) return `<div class="est-valid sale" role="status" id="est-barre"><span><b>Aucun cours dans votre estimation.</b><br>Pour ne plus être compté, utilisez « Retirer mon estimation ».</span></div>`;
    return '';
  }
  function jauge(pole, autres, tous, actifPole) {
    const c = cadre(), vol = c.volumes[pole], nbS = tous.nbSemaines;
    const a = autres.poles[pole] || { heures: 0, moyenne: 0, parDiscipline: {} }, t = tous.poles[pole] || { heures: 0, moyenne: 0, parDiscipline: {} };
    const moi = Math.max(0, t.moyenne - a.moyenne), max = Math.max(vol || 0, t.moyenne, 1) * 1.15;
    const segs = Object.entries(a.parDiscipline).map(([d, x]) => [d, x / nbS]).filter(([, x]) => x > 0).sort((x, y) => y[1] - x[1]);
    const polesDisc = new Set(); c.classes.filter(k => k.pole === pole).forEach(k => k.creneaux.forEach(cr => cr.disciplines.forEach(d => polesDisc.add(d))));
    const manquent = [...polesDisc].filter(d => !tous.declarees.has(pole + '|' + d)).map(disciplineLabel);
    return `<section class="est-jauge ${actifPole ? 'actif' : ''}" aria-label="Moyens humains estimés, pôle ${pole}">
      <div class="est-jh"><span class="t">Pôle ${pole} · moyens humains estimés (heures d’AESH par semaine)</span>
      <span class="v ${vol != null && t.moyenne > vol ? 'depasse' : ''}">${fmtH(t.moyenne)} <small>/ ${vol != null ? fmtH(vol) + ' disponibles' : 'volume non publié'}</small></span></div>
      <p class="est-total">En moyenne sur la période · ${esc(fmtH(t.heures))} sur ${nbS} semaine${nbS > 1 ? 's' : ''} de cours${vol != null ? ` (${esc(fmtH(vol * nbS))} disponibles)` : ''}</p>
      <div class="est-piste" role="img" aria-label="${esc(fmtH(t.moyenne))} par semaine estimées${vol != null ? ` sur ${esc(fmtH(vol))} disponibles` : ''}">
        ${segs.map(([d, x]) => `<div class="est-seg" style="width:${x / max * 100}%;background:${couleurDisc(d)}" title="${esc(disciplineLabel(d))} : ${esc(fmtH(x))} par semaine"></div>`).join('')}
        ${moi > 0 ? `<div class="est-seg est-moi" style="width:${moi / max * 100}%" title="Votre estimation : ${esc(fmtH(moi))} par semaine"></div>` : ''}
        ${vol != null ? `<div class="est-cap" style="left:${vol / max * 100}%"></div>` : ''}</div>
      <div class="est-leg">${segs.slice(0, 6).map(([d, x]) => `<span><i style="background:${couleurDisc(d)}"></i>${esc(disciplineLabel(d))} ${esc(fmtH(x))}</span>`).join('')}
        ${moi > 0 ? `<span><i class="est-moi"></i>vous ${esc(fmtH(moi))}</span>` : ''}${!segs.length && !moi ? '<span>Aucune estimation pour l’instant</span>' : ''}</div>
      ${manquent.length ? `<p class="est-manque">Pas encore estimé : ${manquent.slice(0, 7).map(esc).join(', ')}${manquent.length > 7 ? '…' : ''}</p>` : ''}
    </section>`;
  }
  function etatCreneau(cl, cr, autres) {
    const l = S.lignes.get(cl.nom + '|' + cr.cle), s = autres.slots.get(cl.nom + '|' + cr.cle);
    return { l, s, nb: l ? l.nb : null };
  }
  /* Mode consultation : couleur = plus grand besoin estimé sur le cours (toutes estimations), rien de cliquable. */
  function etatLecture(cl, cr, tous) {
    const s = tous.slots.get(cl.nom + '|' + cr.cle);
    return { s, nb: s ? s.nb : null, cls: s ? nbClasse(s.nb) : 'off',
      txt: s ? `${s.nb} AESH estimé${s.nb > 1 ? 's' : ''}` : 'pas encore estimé', det: s ? `${s.n} estimation${s.n > 1 ? 's' : ''}` : '' };
  }
  function grille(cl, crs, autres, tous, lecture) {
    const h0 = Math.max(7, Math.min(8, ...crs.map(x => Math.floor(min(x.debut) / 60)))), h1 = Math.min(19, Math.max(13, ...crs.map(x => Math.ceil(min(x.fin) / 60))));
    const PX = 44, H = (h1 - h0) * PX;
    let g = `<div class="est-gh"></div>` + JOURS.map(j => `<div class="est-gh">${JOURS_L[j].slice(0, 3)}</div>`).join('');
    g += `<div class="est-heures" style="height:${H}px">${Array.from({ length: h1 - h0 + 1 }, (_, k) => `<span style="top:${k * PX}px">${h0 + k}h</span>`).join('')}</div>`;
    JOURS.forEach(j => {
      g += `<div class="est-col" style="height:${H}px">${Array.from({ length: h1 - h0 - 1 }, (_, k) => `<div class="est-hr" style="top:${(k + 1) * PX}px"></div>`).join('')}`;
      crs.filter(x => x.jour === j).forEach(cr => {
        const top = (min(cr.debut) / 60 - h0) * PX, ht = Math.max(22, (min(cr.fin) - min(cr.debut)) / 60 * PX - 3);
        if (lecture) {
          const e = etatLecture(cl, cr, tous);
          g += `<div class="est-cr lu ${e.cls}" role="img" style="top:${top}px;height:${ht}px" aria-label="${esc(`${JOURS_L[cr.jour]} ${hFr(cr.debut)}–${hFr(cr.fin)}, ${cr.matiere}${cr.parite ? ', semaine ' + cr.parite : ''}, ${e.txt}`)}">
            <b>${esc(cr.matiere)}</b>${esc(hFr(cr.debut))}–${esc(hFr(cr.fin))}${cr.parite ? ` · sem. ${esc(cr.parite)}` : ''}
            ${e.s ? `<span class="est-pastille">${esc(e.txt)}</span><span class="est-coll">${esc(e.det)}</span>` : ''}</div>`;
          return;
        }
        const m = mien(cr), { nb, s } = etatCreneau(cl, cr, autres);
        g += `<button type="button" class="est-cr ${m ? nbClasse(nb) : 'off'}" ${m ? `id="cr-${esc(cl.nom)}-${esc(slug(cr.cle))}" data-e="creneau" data-v="${esc(cr.cle)}"` : 'disabled tabindex="-1"'} style="top:${top}px;height:${ht}px"
          aria-label="${esc(`${JOURS_L[cr.jour]} ${hFr(cr.debut)}–${hFr(cr.fin)}, ${cr.matiere}${cr.parite ? ', semaine ' + cr.parite : ''}${m ? (nb != null ? `, ${nb} AESH indiqué${nb > 1 ? 's' : ''}` : ', à renseigner') : ', cours d’un collègue'}`)}">
          <b>${esc(cr.matiere)}</b>${esc(hFr(cr.debut))}–${esc(hFr(cr.fin))}${cr.parite ? ` · sem. ${esc(cr.parite)}` : ''}
          ${m && nb != null ? `<span class="est-pastille">${nb} AESH</span>` : ''}${m && s && s.n ? `<span class="est-coll">collègues : ${s.nb}</span>` : ''}</button>`;
      });
      g += `</div>`;
    });
    return `<div class="est-grille" aria-label="Emploi du temps de la classe">${g}</div>`;
  }
  function liste(cl, crs, autres, tous, lecture) {
    let h = `<div class="est-liste">`;
    JOURS.forEach(j => {
      const cj = crs.filter(x => x.jour === j); if (!cj.length) return;
      h += `<div class="est-jour">${JOURS_L[j]}</div>`;
      cj.forEach(cr => {
        if (lecture) {
          const e = etatLecture(cl, cr, tous);
          h += `<div class="est-carte lu ${e.cls}"><b>${esc(hFr(cr.debut))}–${esc(hFr(cr.fin))} · ${esc(cr.matiere)}</b>${cr.parite ? ` · semaine ${esc(cr.parite)}` : ''}<br>
            <span>${esc(e.txt)}${e.det ? ` · ${esc(e.det)}` : ''}</span></div>`;
          return;
        }
        const m = mien(cr), { nb, s } = etatCreneau(cl, cr, autres);
        h += `<button type="button" class="est-carte ${m ? nbClasse(nb) : 'off'}" ${m ? `id="cc-${esc(cl.nom)}-${esc(slug(cr.cle))}" data-e="creneau" data-v="${esc(cr.cle)}"` : 'disabled tabindex="-1"'}>
          <b>${esc(hFr(cr.debut))}–${esc(hFr(cr.fin))} · ${esc(cr.matiere)}</b>${cr.parite ? ` · semaine ${esc(cr.parite)}` : ''}<br>
          <span>${m ? (nb != null ? `${nb} AESH indiqué${nb > 1 ? 's' : ''}` : 'Touchez pour indiquer un besoin') : 'Cours d’un collègue'}${m && s && s.n ? ` · collègues : ${s.nb}` : ''}</span></button>`;
      });
    });
    return h + `</div>`;
  }
  function calendrier(cl) {
    const c = cadre(), mois = new Map();
    c.semaines.forEach(s => {
      const jours = JOURS.map((j, i) => ({ j, d: ajoute(s.lundi, i) })).filter(x => x.d >= c.periode.debut && x.d <= c.periode.fin);
      if (!jours.length) return;
      const k = s.lundi.slice(0, 7); if (!mois.has(k)) mois.set(k, []);
      const feries = jours.filter(x => s.feries && s.feries[x.j]), toutFerie = feries.length === jours.length;
      const pf = (cl.pfmp || []).some(p => jours.some(x => x.d >= p.debut && x.d <= p.fin));
      const lib = toutFerie ? esc(s.feries[feries[0].j]) : pf ? 'PFMP : pas de cours' : `${c.avecParite && s.parite ? 'semaine ' + s.parite : 'semaine de cours'}${feries.length ? ` · férié : ${feries.map(x => dFr(x.d)).join(', ')}` : ''}`;
      mois.get(k).push(`<div class="est-sem ${toutFerie ? 'vac' : pf ? 'pfmp' : ''}"><small>semaine du ${esc(dFr(s.lundi))}</small><small>${lib}</small></div>`);
    });
    return `<div class="est-cal">${[...mois.entries()].map(([k, l]) => `<div class="est-mois"><h3>${esc(MOIS[Number(k.slice(5, 7)) - 1])} ${esc(k.slice(0, 4))}</h3>${l.join('')}</div>`).join('')}</div>
      <p class="est-sous">Revenez sur « Semaine A » ou « Semaine B » pour cliquer vos cours.</p>`;
  }
  function recap(autres, tous) {
    const c = cadre(), l = [...S.lignes.values()].map(x => ({ x, cl: classeDe(x.classe), cr: (classeDe(x.classe) || { creneaux: [] }).creneaux.find(y => y.cle === x.cle) })).filter(o => o.cl && o.cr)
      .sort((a, b) => c.classes.indexOf(a.cl) - c.classes.indexOf(b.cl) || JOURS.indexOf(a.cr.jour) - JOURS.indexOf(b.cr.jour) || a.cr.debut.localeCompare(b.cr.debut));
    const heures = l.reduce((s, o) => s + heuresLigne(c, o.cl, o.cr, o.x), 0);
    const ajout = ['PSR', 'MELEC'].reduce((s, p) => s + Math.max(0, ((tous.poles[p] || {}).heures || 0) - ((autres.poles[p] || {}).heures || 0)), 0);
    const couleur = n => n === 0 ? 'var(--ink-2)' : n === 1 ? 'var(--ok-line)' : n === 2 ? 'var(--warn-line)' : 'var(--err-line)';
    return `<section class="est-bloc est-rec" aria-labelledby="h-rec"><div class="est-bar"><h2 id="h-rec">2. Mon estimation (${l.length} cours)</h2>
      ${l.length ? `<button type="button" class="btn petit" data-e="tout-effacer">Tout recommencer</button>` : ''}</div>
      ${l.length ? `<ul>${l.map(o => { const hl = horaireLigne(o.cr, o.x), n = semainesLigne(c, o.cl, o.cr, o.x).length;
        return `<li><span class="q"><b>${esc(o.cl.court)}</b> · ${esc(JOURS_L[o.cr.jour])} ${esc(hFr(hl.debut))}–${esc(hFr(hl.fin))} · ${esc(o.cr.matiere)}
          <small>${esc(libellePeriode(o.x))} · ${esc(libelleSemaines(o.cr, o.x))} · ${n} semaine${n > 1 ? 's' : ''} de cours${o.x.aides && o.x.aides.length ? ' · ' + esc(o.x.aides.map(a => (AIDES.find(z => z.id === a) || { label: a }).label).join(', ')) : ''}${o.x.note ? ` · « ${esc(o.x.note)} »` : ''}</small></span>
          <span style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><span class="est-nbpill" style="border-color:${couleur(o.x.nb)}">${o.x.nb} AESH</span><span class="discret">${esc(fmtH(heuresLigne(c, o.cl, o.cr, o.x)))}</span>
          <button type="button" class="btn petit" data-e="modifier" data-v="${esc(o.x.classe + '|' + o.x.cle)}">Modifier</button>
          <button type="button" class="btn petit" data-e="supprimer" data-v="${esc(o.x.classe + '|' + o.x.cle)}">Supprimer</button></span></li>`; }).join('')}</ul>
        <p class="est-tot"><span>Total de vos cours : ${esc(fmtH(heures))} d’AESH sur la période, soit ${esc(fmtH(heures / tous.nbSemaines))} par semaine en moyenne</span>
          ${Math.abs(heures - ajout) > 0.01 ? `<span class="discret" style="font-weight:500">dont ${esc(fmtH(ajout))} en plus de ce que les collègues ont déjà estimé sur les mêmes cours (le compteur retient le plus grand besoin par cours)</span>` : ''}</p>` : `<p class="est-sous" style="margin-top:8px">Cliquez sur un de vos cours dans l’emploi du temps pour commencer.</p>`}
      <div class="est-champ"><label for="est-commentaire">Commentaire pour la coordination <span class="discret">(facultatif)</span></label>
        <small>Sans nom ni prénom d’élève.</small>
        <textarea id="est-commentaire" maxlength="600" data-e-input="commentaire" rows="3" placeholder="Ex. : besoin surtout pendant les TP, groupe à effectif chargé…">${esc(S.commentaire)}</textarea></div>
      <div class="est-actions">${S.docId && S.envoyeLe ? `<button type="button" class="btn petit" data-e="retirer">Retirer mon estimation</button>` : '<span></span>'}
        <span class="droite"><button type="button" class="btn primaire" id="est-envoyer" data-e="envoyer" ${l.length && S.envoi !== 'encours' ? '' : 'disabled'}>Valider mon estimation</button></span></div>
      ${S.envoi === 'encours' ? `<p class="message info" role="status">Envoi en cours…</p>` : ''}
      ${S.envoi && S.envoi !== 'encours' ? `<div class="message warn" role="alert"><p>${esc(S.envoi)}</p><p>Votre saisie reste gardée sur cet appareil.</p></div>` : ''}
    </section>`;
  }
  /* S.f = brouillon de la fenêtre : { nb, per (id raccourci | 'dates'), du, au, semaines, hDebut, hFin, aides:Set, note } */
  function feuilleCreneau() {
    const c = cadre(), [nom, ...r] = S.sel.split('|'), cle = r.join('|'), cl = classeDe(nom), cr = cl && cl.creneaux.find(x => x.cle === cle);
    if (!cr) { S.sel = null; return ''; }
    const f = S.f, existe = S.lignes.has(S.sel), ligne = ligneDeFeuille(cl, cr);
    const n = semainesLigne(c, cl, cr, ligne).length, hl = horaireLigne(cr, ligne), dur = (min(hl.fin) - min(hl.debut)) / 60, tot = (f.nb || 0) * dur * n;
    const pas = [];
    for (let m = min(cr.debut); m <= min(cr.fin); m += 15) pas.push(hDe(m));
    if (pas[pas.length - 1] !== cr.fin) pas.push(cr.fin);
    return `<div class="est-ov" data-e="fond"><div class="est-feuille" role="dialog" aria-modal="true" aria-labelledby="f-titre">
      <h2 id="f-titre" tabindex="-1">${esc(JOURS_L[cr.jour])} ${esc(hFr(cr.debut))}–${esc(hFr(cr.fin))} · ${esc(cr.matiere)}</h2>
      <p class="est-sous">${esc(cl.label)}${cl.effectif != null ? ` · ${cl.effectif} élèves` : ''}${cr.parite ? ` · semaine ${esc(cr.parite)} seulement` : ''}</p>
      <p class="est-q">Moyens humains : nombre d’AESH estimé</p>
      <div class="est-nb" role="group" aria-label="Nombre d’AESH">${Array.from({ length: MAX_NB + 1 }, (_, v) => `<button type="button" id="nb-${v}" data-e="nb" data-v="${v}" aria-pressed="${f.nb === v}">${v}</button>`).join('')}</div>
      <p class="est-q">Sur quelle période ?</p>
      <div class="est-chips" style="margin-top:8px" role="group" aria-label="Période">${c.raccourcis.map(x => `<button type="button" class="est-chip" id="per-${esc(slug(x.id))}" data-e="per" data-v="${esc(x.id)}" aria-pressed="${f.per === x.id}">${esc(x.label)} (${esc(dFr(x.fin))})</button>`).join('')}
        <button type="button" class="est-chip" id="per-dates" data-e="per" data-v="dates" aria-pressed="${f.per === 'dates'}">Dates précises</button></div>
      ${f.per === 'dates' ? `<div class="est-ligne"><label for="f-du">du</label><input type="date" id="f-du" data-e-input="du" value="${esc(f.du)}" min="${esc(c.periode.debut)}" max="${esc(c.periode.fin)}">
        <label for="f-au">au</label><input type="date" id="f-au" data-e-input="au" value="${esc(f.au)}" min="${esc(c.periode.debut)}" max="${esc(c.periode.fin)}"></div>` : ''}
      ${!cr.parite && c.avecParite ? `<p class="est-q">Quelles semaines ?</p><div class="est-chips" style="margin-top:8px" role="group" aria-label="Semaines">${[['toutes', 'Semaines A et B'], ['A', 'Semaine A seulement'], ['B', 'Semaine B seulement']].map(([k, t]) => `<button type="button" class="est-chip" id="sem-${k}" data-e="semaines" data-v="${k}" aria-pressed="${f.semaines === k}">${t}</button>`).join('')}</div>` : ''}
      <p class="est-q">Horaire du besoin <span class="discret" style="font-weight:400">(modifiable, dans le cours)</span></p>
      <div class="est-ligne"><label for="f-hd">de</label><select id="f-hd" data-e-input="hDebut">${pas.slice(0, -1).map(x => `<option value="${x}" ${x === f.hDebut ? 'selected' : ''}>${hFr(x)}</option>`).join('')}</select>
        <label for="f-hf">à</label><select id="f-hf" data-e-input="hFin">${pas.slice(1).map(x => `<option value="${x}" ${x === f.hFin ? 'selected' : ''}>${hFr(x)}</option>`).join('')}</select></div>
      <p class="est-q">Pour quoi, surtout ? <span class="discret" style="font-weight:400">(facultatif)</span></p>
      <div class="est-chips" style="margin-top:8px">${AIDES.map(a => `<button type="button" class="est-chip" data-e="aide" data-v="${a.id}" aria-pressed="${f.aides.has(a.id)}">${esc(a.label)}</button>`).join('')}</div>
      <div class="est-champ"><label for="est-note">Commentaire sur ce cours <span class="discret">(facultatif)</span></label><small>Sans nom ni prénom d’élève.</small>
        <input type="text" id="est-note" maxlength="120" data-e-input="note" value="${esc(f.note)}" placeholder="Ex. : surtout pendant les exercices écrits"></div>
      <div class="est-calc" aria-live="polite">${f.nb == null ? 'Choisissez un nombre d’AESH.' : `<b>${f.nb} AESH × ${esc(fmtH(dur))} × ${n} semaine${n > 1 ? 's' : ''} de cours = ${esc(fmtH(tot))} sur la période</b><br>soit ${esc(fmtH(tot / Math.max(1, semainesDeCours(c))))} par semaine en moyenne · vacances, jours fériés et PFMP retirés`}
        ${f.per === 'dates' && (!f.du || !f.au || f.au < f.du) ? '<br><span style="color:var(--err-ink)">Indiquez une date de début et une date de fin dans l’ordre.</span>' : ''}</div>
      <div class="est-actions">${existe ? `<button type="button" class="btn petit" data-e="supprimer" data-v="${esc(S.sel)}">Retirer ce cours</button>` : '<span></span>'}
        <span class="droite"><button type="button" class="btn" data-e="fermer">Annuler</button><button type="button" class="btn primaire" id="f-valider" data-e="valider" ${f.nb == null || (f.per === 'dates' && (!f.du || !f.au || f.au < f.du)) ? 'disabled' : ''}>Valider</button></span></div>
    </div></div>`;
  }
  function ligneDeFeuille(cl, cr) {
    const c = cadre(), f = S.f, rac = c.raccourcis.find(x => x.id === f.per);
    const du = f.per === 'dates' ? f.du : c.periode.debut, au = f.per === 'dates' ? f.au : (rac ? rac.fin : c.periode.fin);
    return { classe: cl.nom, cle: cr.cle, nb: f.nb, du, au, semaines: cr.parite || !c.avecParite ? 'toutes' : f.semaines,
      hDebut: f.hDebut, hFin: f.hFin, aides: [...f.aides], note: String(f.note || '').trim().slice(0, 120) };
  }
  function feuilleConfirmation() {
    return `<div class="est-ov"><div class="est-feuille" role="alertdialog" aria-modal="true" aria-labelledby="c-titre" aria-describedby="c-texte">
      <h2 id="c-titre" tabindex="-1">Êtes-vous sûr ?</h2><p id="c-texte" style="margin-top:10px">${esc(S.conf.texte)}</p>
      <div class="est-actions"><span></span><span class="droite"><button type="button" class="btn" id="c-non" data-e="conf-non">${esc(S.conf.non || 'Annuler')}</button>
      <button type="button" class="btn primaire" id="c-oui" data-e="conf-oui">${esc(S.conf.bouton)}</button></span></div></div></div>`;
  }
  function blocEnvoye() {
    const code = S.docId ? S.docId.replace(/^declaration_/, '') : '';
    return `<div class="est-ok" style="margin-top:16px" role="status"><h2 tabindex="-1" id="titre-envoye">✓ ${S.retire ? 'Estimation retirée' : 'Merci pour votre contribution'}</h2>
      <p style="margin-top:8px">${S.retire ? 'Vos besoins ne sont plus comptés. Vous pouvez en indiquer de nouveaux à tout moment.'
        : 'Votre estimation est enregistrée et transmise à la coordination. Elle permettra d’organiser l’accompagnement humain au plus près des besoins des élèves. Vous pouvez la consulter et la modifier à tout moment.'}</p>
      ${S.envoyeLe ? `<p style="margin-top:8px">Dernière modification ${esc(dateHeureLongue(S.envoyeLe))}.</p>` : ''}
      ${code && !S.retire ? `<p style="margin-top:10px">Code de reprise, pour la retrouver sur un autre appareil : <span class="est-code">${esc(code)}</span></p>` : ''}
      <p style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn primaire petit" data-e="reprendre">${S.retire ? 'Indiquer de nouveaux besoins' : 'Modifier mon estimation'}</button>
      <button type="button" class="btn petit" data-e="consulter">Voir les estimations des classes</button>
      <button type="button" class="btn petit" data-e="accueil">Retour à l’accueil</button></p></div>`;
  }
  const slug = s => String(s).replace(/[^A-Za-z0-9]+/g, '-');
  const dateCourte = iso => { const d = new Date(iso); return isNaN(d) ? '' : `le ${d.getDate()}/${z2(d.getMonth() + 1)} à ${z2(d.getHours())}h${z2(d.getMinutes())}`; };

  /* ── actions ── */
  function confirmer(texte, bouton, faire, opts) { S.conf = { texte, bouton, faire, ...(opts || {}) }; S.bonjour = false; S.focus = 'c-oui'; dessiner(); }
  function ouvrirCreneau(k) {
    const c = cadre(), [nom, ...r] = k.split('|'), cl = classeDe(nom), cr = cl && cl.creneaux.find(x => x.cle === r.join('|')); if (!cr) return;
    const l = S.lignes.get(k), hl = horaireLigne(cr, l);
    let per = c.raccourcis[c.raccourcis.length - 1].id;
    if (l && (l.du || l.au)) {
      const rac = c.raccourcis.find(x => x.fin === l.au && (!l.du || l.du === c.periode.debut));
      per = rac ? rac.id : (l.au === c.periode.fin && (!l.du || l.du === c.periode.debut) ? per : 'dates');
    }
    S.sel = k;
    S.f = { nb: l ? l.nb : null, per, du: l && l.du ? l.du : c.periode.debut, au: l && l.au ? l.au : c.periode.fin,
      semaines: l && ['A', 'B'].includes(l.semaines) ? l.semaines : 'toutes', hDebut: hl.debut, hFin: hl.fin, aides: new Set(l ? l.aides || [] : []), note: l ? l.note || '' : '' };
    if (!S.navFeuille) { S.navFeuille = true; pousser(); }   /* « précédent » du navigateur ferme la fenêtre */
    S.focus = S.f.nb != null ? 'nb-' + S.f.nb : 'f-titre'; dessiner();
  }
  async function envoyer(retirer) {
    const c = cadre(); if (!c) return;
    const lignes = retirer ? [] : [...S.lignes.values()].map(l => {
      const cl = classeDe(l.classe), cr = cl && cl.creneaux.find(x => x.cle === l.cle); if (!cr) return null;
      const hl = horaireLigne(cr, l);
      return { classe: l.classe, cle: cr.cle, jour: cr.jour, debut: cr.debut, fin: cr.fin, matiere: cr.matiere, parite: cr.parite,
        nb: l.nb, du: RE_DATE.test(l.du || '') ? l.du : c.periode.debut, au: RE_DATE.test(l.au || '') ? l.au : c.periode.fin,
        semaines: ['A', 'B'].includes(l.semaines) ? l.semaines : 'toutes', hDebut: hl.debut, hFin: hl.fin,
        aides: (l.aides || []).filter(a => AIDES.some(z => z.id === a)), note: String(l.note || '').slice(0, 120) };
    }).filter(Boolean);
    if (!S.docId) S.docId = 'declaration_' + Date.now().toString(36) + [...crypto.getRandomValues(new Uint8Array(6))].map(x => 'abcdefghijklmnopqrstuvwxyz0123456789'[x % 36]).join('');
    const maintenant = new Date().toISOString();
    const doc = { id: S.docId, type: 'declaration', annee, periode: { debut: c.periode.debut, fin: c.periode.fin, label: String(c.periode.label || '').slice(0, 40) },
      disciplines: [...S.mats].slice(0, 12), statut: retirer ? 'retiree' : 'active', version: (S.version || 0) + 1,
      lignes, commentaire: String(S.commentaire || '').slice(0, 600), creeLe: S.creeLe || maintenant, majLe: maintenant, source: 'estimation-aesh' };
    S.envoi = 'encours'; dessiner();
    try {
      await Promise.race([FS.setDoc(FS.doc(db, COL, doc.id), doc), new Promise((_, rej) => setTimeout(() => rej(new Error('délai dépassé')), 15000))]);
      /* Historique : copie figée de cette version (jamais modifiée). Un échec n'empêche pas l'enregistrement. */
      try { const aid = 'archive_' + doc.id.replace(/^declaration_/, '') + '_v' + doc.version; Promise.resolve(FS.setDoc(FS.doc(db, COL, aid), { ...doc, id: aid, type: 'archive', declaration: doc.id })).catch(() => { }); } catch (e) { }
      S.periodeDebut = c.periode.debut; S.nouvellePeriode = '';
      S.version = doc.version; S.creeLe = doc.creeLe; S.envoyeLe = maintenant; S.envoi = ''; S.retire = !!retirer; S.flash = ''; S.bonjour = false;
      if (retirer) { S.lignes = new Map(); S.histo = []; }
      S.envoyeSig = signature();
      lsEcrit(); S.etape = 'envoye'; S.focus = 'titre-envoye'; pousser(); dessiner();
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
      if (cadre() && !dansPeriode(d, cadre())) { S.message = `Ce code correspond à une estimation d’une autre période${d.periode && d.periode.label ? ` (« ${d.periode.label} »)` : ''}. Elle reste enregistrée à la coordination ; pour la période en cours, faites une nouvelle estimation.`; dessiner(); return; }
      if (cadre()) { S.periodeDebut = cadre().periode.debut; S.nouvellePeriode = ''; }
      S.docId = d.id; S.version = d.version || 0; S.creeLe = d.creeLe || null; S.envoyeLe = d.majLe || null; S.message = '';
      S.mats = new Set(Array.isArray(d.disciplines) ? d.disciplines : []); S.commentaire = String(d.commentaire || '');
      S.lignes = new Map(); (d.lignes || []).forEach(l => { if (l && l.classe && l.cle) S.lignes.set(l.classe + '|' + l.cle, { classe: l.classe, cle: l.cle, nb: l.nb, du: l.du, au: l.au, semaines: l.semaines, hDebut: l.hDebut, hFin: l.hFin, aides: l.aides || [], note: l.note || '' }); });
      S.histo = []; S.envoyeSig = signature(); S.bonjour = true; S.mode = 'estimer'; lsEcrit(); S.etape = 'edt'; S.focus = 'titre-ecran'; pousser(); dessiner(); annonce && annonce('Estimation retrouvée.');
    } catch (e) { S.message = 'Recherche impossible pour le moment (connexion).'; dessiner(); }
  }
  function lier() {
    const h = S.hote;
    h.onclick = ev => {
      const b = ev.target.closest('[data-e]'); if (!b || b.disabled) return;
      const a = b.dataset.e, v = b.dataset.v;
      if (a === 'fond') { if (ev.target === b) { fermerFeuille(); dessiner(); } return; }
      if (a === 'accueil') {
        if (S.lignes.size && sale()) {
          confirmer('Votre estimation n’est pas encore validée : la coordination ne la voit pas. Voulez-vous la valider maintenant ?', 'Valider maintenant',
            () => envoyer(false), { non: 'Quitter sans valider', faireNon: () => { retourAccueil && retourAccueil(); } });
          return;
        }
        retourAccueil && retourAccueil(); return;
      }
      if (a === 'consulter') { S.mode = 'voir'; S.etape = 'edt'; S.retire = false; S.focus = 'titre-ecran'; pousser(); dessiner(); window.scrollTo(0, 0); return; }
      if (a === 'mode') { S.mode = v; S.focus = b.id; dessiner(); return; }
      if (a === 'reessayer') { S.etat = 'chargement'; S.ecoute = false; if (S.unsub) try { S.unsub(); } catch (e) { } S.unsub = null; ecouter(); dessiner(); return; }
      if (a === 'mat') { S.mats.has(v) ? S.mats.delete(v) : S.mats.add(v); lsEcrit(); S.focus = b.id; dessiner(); return; }
      if (a === 'continuer') { if (!S.mats.size) return; S.etape = 'edt'; S.mode = 'estimer'; const k = cadre().classes.find(x => x.creneaux.some(mien)); if (k) S.classe = k.nom; S.focus = 'titre-ecran'; pousser(); dessiner(); return; }
      if (a === 'changer') { S.etape = 'matieres'; S.mode = 'estimer'; S.focus = 'h-mats'; pousser(); dessiner(); return; }
      if (a === 'reprendre') { S.etape = S.mats.size ? 'edt' : 'matieres'; S.mode = 'estimer'; S.retire = false; S.focus = 'titre-ecran'; pousser(); dessiner(); return; }
      if (a === 'code') { retrouverParCode((h.querySelector('#est-code') || {}).value); return; }
      if (a === 'classe') { S.classe = v; S.focus = b.id; dessiner(); return; }
      if (a === 'vue') { S.vue = v; S.focus = b.id; dessiner(); return; }
      if (a === 'creneau') { ouvrirCreneau(S.classe + '|' + v); return; }
      if (a === 'modifier') { const [nom] = v.split('|'); S.classe = nom; const cl = classeDe(nom), cr = cl && cl.creneaux.find(x => x.cle === v.slice(nom.length + 1)); if (cr && cr.parite && cadre().avecParite) S.vue = cr.parite; ouvrirCreneau(v); return; }
      if (a === 'nb') { S.f.nb = Number(v); S.focus = b.id; dessiner(); return; }
      if (a === 'per') { S.f.per = v; S.focus = b.id; dessiner(); return; }
      if (a === 'semaines') { S.f.semaines = v; S.focus = b.id; dessiner(); return; }
      if (a === 'aide') { S.f.aides.has(v) ? S.f.aides.delete(v) : S.f.aides.add(v); b.setAttribute('aria-pressed', S.f.aides.has(v)); return; }
      if (a === 'fermer') { fermerFeuille(); dessiner(); return; }
      if (a === 'valider') {
        const k = S.sel, [nom, ...r] = k.split('|'), cle = r.join('|'), cl = classeDe(nom), cr = cl.creneaux.find(x => x.cle === cle);
        const ligne = ligneDeFeuille(cl, cr), c = cadre(), hl = horaireLigne(cr, ligne), n = semainesLigne(c, cl, cr, ligne).length, tot = heuresLigne(c, cl, cr, ligne);
        fermerFeuille();
        confirmer(`${ligne.nb} AESH le ${JOURS_L[cr.jour].toLowerCase()} ${hFr(hl.debut)}–${hFr(hl.fin)}, ${cr.matiere}, ${cl.court}, ${libellePeriode(ligne)}, ${libelleSemaines(cr, ligne)} : ${n} semaine${n > 1 ? 's' : ''} de cours, soit ${fmtH(tot)} sur la période.`, 'Confirmer',
          () => { memoriser(); S.lignes.set(k, ligne); lsEcrit(); S.flash = `✓ ${cl.court}, ${JOURS_L[cr.jour].toLowerCase()} ${hFr(hl.debut)} : ajouté à votre estimation. Pensez à valider.`; annonce && annonce('Besoin ajouté à votre estimation. Pensez à valider.'); });
        return;
      }
      if (a === 'supprimer') { const k = v; fermerFeuille(); confirmer('Retirer ce cours de votre estimation ?', 'Retirer', () => { memoriser(); S.lignes.delete(k); lsEcrit(); S.flash = 'Cours retiré de votre estimation. Pensez à valider.'; annonce && annonce('Cours retiré. Pensez à valider.'); }); return; }
      if (a === 'tout-effacer') { confirmer('Effacer tous les cours indiqués et recommencer ?', 'Tout effacer', () => { memoriser(); S.lignes = new Map(); lsEcrit(); S.flash = ''; }); return; }
      if (a === 'annuler-action') { const p = S.histo.pop(); if (p) { const o = JSON.parse(p); S.lignes = new Map(o.lignes); S.commentaire = o.commentaire; lsEcrit(); S.flash = 'Dernière action annulée.'; annonce && annonce('Dernière action annulée.'); } dessiner(); return; }
      if (a === 'envoyer') { const n = S.lignes.size; if (!n) return; confirmer(`Valider votre estimation (${n} cours) et la transmettre à la coordination ?`, 'Valider', () => envoyer(false)); return; }
      if (a === 'retirer') { confirmer('Retirer votre estimation ? Vos besoins ne seront plus comptés.', 'Retirer mon estimation', () => envoyer(true)); return; }
      if (a === 'conf-non') { const f = S.conf && S.conf.faireNon; S.conf = null; dessiner(); if (f) f(); return; }
      if (a === 'conf-oui') { const f = S.conf.faire; S.conf = null; dessiner(); f(); dessiner(); return; }
    };
    h.oninput = ev => {
      const t = ev.target, k = t.dataset && t.dataset.eInput; if (!k) return;
      if (k === 'commentaire') { S.commentaire = t.value; lsEcrit(); const bar = S.hote.querySelector('#est-barre'); if (bar && !bar.classList.contains('sale') && sale()) { S.focus = t.id; dessiner(); } return; }
      if (!S.f) return;
      if (k === 'note') S.f.note = t.value;
    };
    h.onchange = ev => {
      const t = ev.target, k = t.dataset && t.dataset.eInput; if (!k || !S.f) return;
      if (k === 'du' || k === 'au') { S.f[k] = t.value; S.focus = t.id; dessiner(); }
      if (k === 'hDebut' || k === 'hFin') {
        S.f[k] = t.value;
        if (min(S.f.hFin) <= min(S.f.hDebut)) { if (k === 'hDebut') S.f.hFin = hDe(Math.min(min(S.f.hDebut) + 15, 23 * 60)); else S.f.hDebut = hDe(Math.max(min(S.f.hFin) - 15, 0)); }
        S.focus = t.id; dessiner();
      }
    };
    h.onkeydown = ev => { if (ev.key === 'Escape' && (S.sel || S.conf)) { if (S.sel) fermerFeuille(); S.conf = null; dessiner(); } };
  }

  return {
    monter(hote) {
      S.hote = hote; S.conf = null; S.sel = null; S.f = null; S.navFeuille = false;
      /* L'enseignant revient sur l'estimation (nouvelle visite ou même visite) : emploi du temps et « Bonjour ». */
      if (S.docId && S.mats.size) { S.retrouvee = true; if (S.cadre) { S.etape = 'edt'; S.mode = 'estimer'; try { remplacerNav && remplacerNav({ etape: 'edt', mode: 'estimer', sel: null }); } catch (e) { } } }
      else if (S.etape === 'envoye') S.etape = 'matieres';
      S.retire = false; S.bonjour = !!(S.docId && S.envoyeLe && !sale());
      ecouter(); dessiner();
    },
    fermer() { S.hote = null; },
    /* Navigation « précédent / suivant » du navigateur (appelée par la page). */
    consommerPop() { if (S.ignorerPop > 0) { S.ignorerPop--; return true; } return false; },
    restaurerNav(e) {
      S.conf = null; S.sel = null; S.f = null; S.navFeuille = false;
      const etape = e && ['matieres', 'edt', 'envoye'].includes(e.etape) ? e.etape : 'matieres';
      S.etape = etape === 'envoye' && !S.envoyeLe ? 'edt' : etape;
      S.mode = e && e.mode === 'voir' ? 'voir' : 'estimer';
      S.focus = 'titre-ecran'; dessiner();
    },
    _etat: () => S, _agreger: agreger
  };
}
