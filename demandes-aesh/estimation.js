/* ═══════════════════════════════════════════════════════════════════
   Estimation des besoins d’accompagnement — pôle PSR / MELEC (page enseignants) · v7 « par l’emploi du temps » (anneau, couleurs, validation par classe)
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
/* 17/09/2026 : trois filières de plus. Leurs emplois du temps viennent des captures PRONOTE vérifiées
   (referents-aesh/edt-lycee.json) ; période, semaines A/B et vacances viennent du cadre publié par l'Atelier.
   Heures AESH de ces pôles : somme des heures déclarées par les référents (coordination_referents_aesh). */
const COL_REFERENTS = 'coordination_referents_aesh';
const POLES_LYCEE = { AGORA: 'AGORA', CAPA: 'CAPA', MDA: 'MDA' };
const PAR_LIEN = { 'psr-melec': ['PSR', 'MELEC'], psr: ['PSR'], melec: ['MELEC'], agora: ['AGORA'], capa: ['CAPA'], mda: ['MDA'] };
const JOURS_EDT = ['lun', 'mar', 'mer', 'jeu', 'ven'];
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
function normaliserCadre(d, edt, volumesRef) {
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
  /* Salle : lue dans les emplois du temps PRONOTE (même jour, mêmes heures, même semaine). */
  if (edt && edt.classes && edt.cours) classes.forEach(c => { const k = edt.classes[c.nom]; if (!k) return; c.creneaux.forEach(cr => {
    const x = k.cours.map(id => edt.cours[id]).find(y => y && JOURS_EDT[y.j] === cr.jour && y.d === cr.debut && y.f === cr.fin && (!cr.parite || y.sem === 'S' + cr.parite || y.sem === 'TOUTES'));
    if (x && x.salle && x.salle.length) cr.salle = x.salle.join(' · '); }); });
  if (edt && edt.classes && edt.cours && pe) {
    Object.keys(POLES_LYCEE).forEach(pole => (edt.poles && edt.poles[pole] || []).forEach(nom => {
      const k = edt.classes[nom]; if (!k || classes.some(c => c.nom === nom)) return;
      const creneaux = (k.cours || []).map(id => edt.cours[id]).filter(x => x && JOURS_EDT[x.j] && RE_HEURE.test(x.d) && RE_HEURE.test(x.f))
        .filter(x => x.sem !== 'S2' || pe.fin >= (edt.s2Debut || '9999')).filter(x => x.sem !== 'S1' || pe.debut <= (edt.s1Fin || '0000'))
        .map(x => { const parite = x.sem === 'SA' ? 'A' : x.sem === 'SB' ? 'B' : '', matiere = String(x.lib || x.mat);
          return { cle: [JOURS_EDT[x.j], x.d, x.f, matiere, parite].join('|'), jour: JOURS_EDT[x.j], debut: x.d, fin: x.f, matiere, parite, disciplines: [], salle: (x.salle || []).join(' · ') }; })
        .sort((a, b) => JOURS.indexOf(a.jour) - JOURS.indexOf(b.jour) || a.debut.localeCompare(b.debut));
      classes.push({ nom, label: k.court || nom, court: k.court || nom, pole, effectif: null,
        pfmp: (k.pfmp || []).filter(p => RE_DATE.test(p.debut || '') && RE_DATE.test(p.fin || '')).map(p => ({ debut: p.debut, fin: p.fin })), creneaux });
    }));
  }
  if (!classes.length) return null;
  const raccourcis = (Array.isArray(d.raccourcis) ? d.raccourcis : []).filter(r => r && RE_DATE.test(r.fin || '') && r.fin >= periode.debut && r.fin <= periode.fin)
    .map(r => ({ id: String(r.id || r.fin), label: String(r.label || ''), fin: r.fin }));
  if (!raccourcis.some(r => r.fin === periode.fin)) raccourcis.push({ id: 'periode', label: `Jusqu’à la fin de la période`, fin: periode.fin });
  raccourcis.sort((a, b) => a.fin.localeCompare(b.fin));
  const v = d.volumes && typeof d.volumes === 'object' ? d.volumes : {};
  const avecParite = semaines.some(s => s.parite);
  return { annee: d.annee, majLe: d.majLe || '', disciplines, classes, periode, semaines, raccourcis, avecParite,
    volumes: { PSR: Number.isFinite(v.PSR) ? v.PSR : null, MELEC: Number.isFinite(v.MELEC) ? v.MELEC : null,
      ...Object.fromEntries(Object.keys(POLES_LYCEE).map(p => [p, volumesRef && volumesRef[p] > 0 ? volumesRef[p] : null])) } };
}

/* ═════════ v6 « par l'emploi du temps des élèves » (15/09/2026) ═════════
   Filière → classe → emploi du temps de la classe → le cours touché → nombre d'AESH → Enregistrer.
   On estime le COURS tel qu'il est écrit dans l'emploi du temps, pas l'enseignant : un document par cours
   et par période (cours_<début>_<classe>_<empreinte>), partagé par toute l'équipe, enregistré tout de suite.
   Chaque enregistrement laisse une copie figée (archive_…_v<n>). Aucun nom. */
/* ═════════ v7 « par l'emploi du temps des élèves » (15/09/2026, maquette validée) ═════════
   Filière → classe (anneau des moyens humains) → emploi du temps coloré par matière → cours → « Combien d'AESH ? »
   → Enregistrer (tout de suite, partagé) → Valider la classe (vérification des semaines A/B) → J'ai terminé.
   Un document par cours et par période (cours_<début>_<classe>_<empreinte>) + archive_…_v<n>. Aucun nom. */
const CSS = `
.e6{max-width:760px;margin:0 auto;font-size:16px}
.e6-barre{display:flex;align-items:center;gap:10px;min-height:52px;margin:4px 0 6px}
.e6-retour{flex:none;width:44px;height:44px;border-radius:50%;border:1px solid var(--line-2);background:var(--card);font-size:20px;line-height:1;cursor:pointer;color:var(--ink)}
.e6-barre .t{font-weight:700;color:var(--muted)}
.e6 h1{font-size:clamp(1.6rem,4.5vw,2.1rem);letter-spacing:-.02em;line-height:1.15;margin:6px 0 14px}
.e6-per{display:inline-block;white-space:nowrap;background:var(--accent-l);color:var(--accent-d);font-weight:650;border-radius:999px;padding:4px 12px}
.e6-gros{display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:var(--card);border:1.5px solid var(--line-2);border-radius:18px;padding:18px 20px;margin-bottom:12px;font:inherit;color:inherit;cursor:pointer;box-shadow:var(--sh)}
.e6-gros:hover{border-color:var(--accent)}
.e6-gros .x{flex:1;min-width:0}.e6-gros b{display:block;font-size:1.25rem}.e6-gros span.s{color:var(--muted)}
.e6-gros .fl{color:var(--accent);font-size:1.5rem}
.e6-okb{display:inline-block;margin-left:6px;background:var(--ok-bg);color:var(--ok-ink);border-radius:999px;padding:1px 10px;font-size:1rem;font-weight:700;vertical-align:middle}
.e6-respire{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;min-height:55vh}
.e6-bulle{width:120px;height:120px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#8fd3c9,var(--accent));animation:e6souffle 4s ease-in-out infinite;margin-bottom:26px;box-shadow:0 0 0 18px rgba(15,94,102,.08)}
@keyframes e6souffle{0%,100%{transform:scale(.72)}50%{transform:scale(1)}}
@media(prefers-reduced-motion:reduce){.e6-bulle{animation:none}}
.e6-respire b{font-size:1.4rem}.e6-respire p{color:var(--muted);margin:6px 0 0}
.e6-moyens{background:var(--card);border:1px solid var(--line-2);border-radius:20px;padding:16px 18px;margin:0 0 18px}
.e6-moyens .haut{display:flex;justify-content:space-between;align-items:baseline;gap:4px 10px;flex-wrap:wrap}
.e6-moyens .corps{display:flex;gap:14px 20px;align-items:center;flex-wrap:wrap;margin-top:12px}
.e6-anneau{position:relative;flex:none;width:156px;height:156px;margin:0 auto}
.e6-anneau svg{display:block;width:100%;height:100%}
.e6-anneau circle{fill:none;stroke-width:11}
.e6-anneau .fond{stroke:var(--line-2)}
.e6-anneau .val{stroke:var(--accent);stroke-linecap:round;transition:stroke-dasharray .7s ease}
.e6-anneau.plus .val{stroke:var(--err-ink)}
.e6-anneau .dedans{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;line-height:1.2}
.e6-anneau .dedans b{font-size:2rem;font-weight:800;letter-spacing:-.02em;color:var(--ink);font-variant-numeric:tabular-nums}
.e6-anneau.plus .dedans b{color:var(--err-ink)}
.e6-anneau .dedans span{font-size:1rem;color:var(--muted);font-variant-numeric:tabular-nums}
.e6-moyens .txt{flex:1;min-width:150px}.e6-moyens .txt .est{font-size:1.1rem}
.e6-mats{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;padding-top:14px;border-top:1px solid var(--line-2)}
.e6-mats span{display:inline-flex;align-items:center;border-radius:999px;padding:5px 12px;font-size:1rem;line-height:1.3}
.e6-mats .fait{background:var(--ok-bg);color:var(--ok-ink);font-weight:650}
.e6-mats .pas{border:1.5px dashed var(--line);color:var(--muted)}
@media(prefers-reduced-motion:reduce){.e6-anneau .val{transition:none}}
.e6-qui{display:inline;font-weight:650;font-size:1rem;background:none;border:0;padding:0}
.e6-qui::after{content:" · ";color:var(--muted);font-weight:400}
.e6-qui.vous{color:var(--accent-d)}
.e6-qui.coll{color:var(--muted);font-style:italic}
.e6-legende .e6-qui::after{content:""}
.e6-cours .p.coll{border-style:dashed}
.e6-legende{display:flex;flex-wrap:wrap;gap:6px 14px;color:var(--muted);margin:4px 0 0}
.e6-onglets{display:flex;background:var(--card-2);border-radius:14px;padding:4px;margin:4px 0 8px}
.e6-onglets button{flex:1;min-height:44px;border:0;background:transparent;border-radius:11px;font:inherit;font-weight:650;color:var(--ink-2);cursor:pointer}
.e6-onglets button[aria-pressed="true"]{background:var(--card);color:var(--ink);box-shadow:0 1px 3px rgba(0,0,0,.12)}
.e6-info{color:var(--muted);margin:6px 0 0}
.e6-jour{font-weight:750;letter-spacing:.04em;text-transform:uppercase;color:var(--muted);margin:20px 0 8px;font-size:1rem}
.e6-cours{position:relative;display:flex;align-items:center;gap:12px;width:100%;text-align:left;border-radius:14px;padding:12px 14px 12px 20px;margin-bottom:8px;border:1px solid var(--line-2);background:linear-gradient(90deg,var(--mt),var(--card) 70%);color:var(--ink);font:inherit;cursor:pointer;overflow:hidden}
.e6-cours::before{content:"";position:absolute;left:0;top:0;bottom:0;width:8px;background:var(--mc)}
.e6-cours .h{flex:none;min-width:6.2em;font-weight:650;font-variant-numeric:tabular-nums}
.e6-cours .m{flex:1;min-width:0}.e6-cours .m b{display:block;font-weight:650}
.e6-cours .m small{display:block;color:var(--muted);font-size:1rem}
.e6-cours .p{flex:none;border-radius:999px;background:var(--card);border:1.5px solid var(--line);font-weight:800;padding:4px 10px;color:var(--accent-d)}
.e6-cours .p.n0{border-color:var(--ink-2);color:var(--ink)}.e6-cours .p.n1{background:var(--ok-bg);border-color:var(--ok-line);color:var(--ok-ink)}
.e6-cours .p.n2{background:var(--warn-bg);border-color:var(--warn-line);color:var(--warn-ink)}.e6-cours .p.n3{background:var(--err-bg);border-color:var(--err-line);color:var(--err-ink)}
.e6-bas{position:sticky;bottom:0;z-index:15;margin-top:18px;padding:10px 0 calc(12px + env(safe-area-inset-bottom,0px));background:linear-gradient(transparent,var(--bg) 30%)}
.e6-ov{position:fixed;inset:0;z-index:60;background:rgba(15,23,42,.45);display:flex;align-items:flex-end;justify-content:center}
@media(min-width:680px){.e6-ov{align-items:center;padding:20px}}
.e6-feuille{background:var(--card);color:var(--ink);width:100%;max-width:440px;max-height:92vh;overflow:auto;border-radius:22px 22px 0 0;padding:12px 20px calc(20px + env(safe-area-inset-bottom,0px));box-shadow:0 -10px 40px rgba(0,0,0,.25)}
@media(min-width:680px){.e6-feuille{border-radius:22px}}
.e6-poignee{width:40px;height:5px;border-radius:3px;background:var(--line);margin:0 auto 12px}
.e6-feuille h2{font-size:1.3rem;margin:0}
.e6-q{font-weight:750;font-size:1.1rem;margin:16px 0 8px}
.e6-nbs{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px;margin:0 0 14px}
.e6-nbs button{aspect-ratio:1;min-height:44px;border-radius:14px;border:1.5px solid var(--line);background:var(--card);font:inherit;font-size:1.25rem;font-weight:800;cursor:pointer;color:var(--ink)}
.e6-nbs button[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}
.e6-ligne{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;padding:12px 0;border-top:1px solid var(--line-2)}
.e6-ligne .lib{color:var(--muted)}.e6-ligne .val{font-weight:650;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.e6-mod{border:0;background:none;color:var(--accent-d);font:inherit;font-weight:650;text-decoration:underline;cursor:pointer;padding:0 4px;min-height:32px}
.e6-ab{display:flex;gap:8px}.e6-ab button{width:54px;min-height:44px;border-radius:12px;border:1.5px solid var(--line);background:var(--card);font:inherit;font-weight:750;cursor:pointer;color:var(--ink)}
.e6-ab button[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}.e6-ab button:disabled{opacity:.55;cursor:default}
.e6-ligne input,.e6-ligne select{font:inherit;min-height:44px;padding:6px 8px;border:1.5px solid var(--line);border-radius:10px;background:var(--card);color:var(--ink)}
.e6-actions{display:flex;gap:10px;margin-top:16px}
.e6-btn{flex:2;width:100%;min-height:54px;border-radius:16px;border:0;background:var(--accent);color:var(--on-accent);font:inherit;font-weight:750;font-size:1.05rem;cursor:pointer}
.e6-btn:disabled{opacity:.4;cursor:default}
.e6-btn.sec{flex:1;background:var(--card);color:var(--accent-d);border:1.5px solid var(--line)}
.e6-recap{list-style:none;margin:12px 0 0;padding:0}.e6-recap li{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line-2)}
.e6-verif{margin-top:12px;padding:12px 14px;border-radius:14px;background:var(--warn-bg);color:var(--warn-ink)}
.e6-verif.ok{background:var(--ok-bg);color:var(--ok-ink)}
.e6-fin{text-align:center;padding-top:30px}
.e6-fin .grand{font-size:64px;line-height:1.1;animation:e6pop .6s ease}
@keyframes e6pop{0%{transform:scale(.4);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
.e6-fin p{font-size:1.1rem;color:var(--ink-2);max-width:32ch;margin:10px auto}
.e6-mot{display:block;width:100%;text-align:left;margin:16px 0 0;padding:12px 2px;min-height:44px;border:0;border-top:1px solid var(--line-2);background:none;font:inherit;font-size:1rem;color:var(--muted);cursor:pointer}
.e6-mot:hover{color:var(--accent-d)}
.e6-feuille textarea{width:100%;font:inherit;font-size:1rem;min-height:120px;padding:10px 12px;margin-top:10px;border:1.5px solid var(--line);border-radius:12px;background:var(--card);color:var(--ink)}
.e6-toast{position:fixed;left:50%;bottom:110px;transform:translateX(-50%);z-index:70;background:#10232a;color:#fff;border-radius:999px;padding:10px 18px;font-weight:650;max-width:92vw}
.e6-toast.err{background:#8a1c1c}
.e6-rc{text-align:center;padding-top:24px}
.e6-rc h2{font-size:1.3rem}
.e6-rc-nb{font-size:2.6rem;font-weight:800;line-height:1.1;margin:14px 0 6px;color:var(--accent-d);font-variant-numeric:tabular-nums}
.e6-rc-m{font-weight:700;font-size:1.15rem;margin:6px 0 4px}
.e6-rc-l{margin:2px 0;color:var(--ink-2)}
.e6-rc .e6-actions{margin-top:22px}
.e6-rc.fait{background:var(--ok-bg);box-shadow:inset 0 0 0 2px var(--ok-line),0 -10px 40px rgba(0,0,0,.25);padding-bottom:calc(30px + env(safe-area-inset-bottom,0px));animation:e6pop .35s ease}
.e6-rc.fait h2,.e6-rc.fait .e6-rc-nb{color:var(--ok-ink)}
.e6-cours.flash{animation:e6flash .7s ease 3}
@keyframes e6flash{0%,100%{box-shadow:0 0 0 0 transparent}50%{box-shadow:0 0 0 4px var(--accent)}}
@media(prefers-reduced-motion:reduce){.e6-rc.fait{animation:none}.e6-cours.flash{animation:none;box-shadow:0 0 0 4px var(--accent)}}
`;
const COURT = { C1PSR: 'CAP 1 PSR', C2PSR: 'CAP 2 PSR', B2MELEC: '2de MELEC', B1MELEC: '1re MELEC', BTMELEC: 'Tle MELEC' };
const FILIERES = [['PSR', 'CAP PSR', '1re et 2e année'], ['MELEC', 'Bac Pro MELEC', '2de, 1re et Terminale'],
  ['AGORA', 'AGOrA', '2de GATL, 1re et Terminale AGOrA'], ['CAPA', 'CAPa', 'Horticulture, jardinier paysagiste'], ['MDA', 'Métiers d’Art', 'Cannage-paillage, vannerie']];
const K_APPAREIL = 'estimation-aesh-v8';   /* v8 (15/09) : repart à zéro sur les appareils qui ont servi aux tests */
const PALETTE = [['#3b6fd8', '#e8effd'], ['#d0782a', '#fdf0e4'], ['#2f9a6a', '#e6f5ee'], ['#9b4fc4', '#f3eafa'], ['#c9444f', '#fbe9ea'], ['#1f8fa3', '#e4f4f7'], ['#b8931c', '#faf4de'], ['#5d6b76', '#eef1f3'], ['#d14f93', '#fbe8f2'], ['#4f8f2a', '#edf6e6']];
const empreinte = s => { let h = 5381; for (const ch of String(s)) h = (Math.imul(h, 33) ^ ch.codePointAt(0)) >>> 0; return h.toString(36).padStart(4, '0'); };
/* Même matière → même couleur, dans toutes les classes. */
export const familleMatiere = m => String(m || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\b(tp|pole [12]|psr|lv1)\b/g, ' ').split(/[\s,/()-]+/).filter(Boolean).slice(0, 2).join(' ');
const couleurMatiere = m => PALETTE[parseInt(empreinte(familleMatiere(m)), 36) % PALETTE.length];
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
/* Vérification de fin de classe : pour les matières estimées depuis cet appareil, cours propres à une seule semaine pas encore estimés. */
export function coursOublies(classe, estimesIci, estimeDe) {
  const familles = new Set(classe.creneaux.filter(cr => estimesIci(cr)).map(cr => familleMatiere(cr.matiere)));
  return classe.creneaux.filter(cr => cr.parite && familles.has(familleMatiere(cr.matiere)) && !estimeDe(cr));
}

export function creerEstimation(ctx) {
  const { FS, db, esc, annee, annonce, retourAccueil, pousser: pousserNav } = ctx;
  const FORCEES = PAR_LIEN[String(ctx.filiere || '')] || null;
  const S = { brut: null, edt: null, volumesRef: null, etat: 'chargement', cadre: null, docs: new Map(), ecran: 'filiere', fil: null, classe: null, sem: 'A', sel: null, f: null,
    recap: null, flash: null, valid: null, mot: null, motEdit: null, toast: '', toastErr: false, hote: null, focus: null, envoi: false, ignorerPop: 0, navFeuille: false, unsub: null, ecoute: false };
  if (!document.getElementById('e6-styles')) { const st = document.createElement('style'); st.id = 'e6-styles'; st.textContent = CSS; document.head.appendChild(st); }

  /* Mémoire de l'appareil, par période : cours enregistrés ici (pour la vérification) et classes validées. */
  const app = () => {
    let v = null; try { v = JSON.parse(localStorage.getItem(K_APPAREIL) || 'null'); } catch (e) { }
    if (!(v && v.annee === annee && cadre() && v.periode === cadre().periode.debut)) v = { annee, periode: cadre() ? cadre().periode.debut : '', miens: [], valides: {} };
    if (!Array.isArray(v.miens)) v.miens = []; if (!v.valides || typeof v.valides !== 'object') v.valides = {}; if (!v.versions || typeof v.versions !== 'object') v.versions = {};
    return v;
  };
  const appEcrit = v => { try { localStorage.setItem(K_APPAREIL, JSON.stringify(v)); } catch (e) { } };

  const recalculer = () => { if (!S.brut) return; S.cadre = normaliserCadre(S.brut, S.edt, S.volumesRef); S.etat = S.cadre ? 'ok' : 'absent'; };
  function chargerLycee() {
    if (S.edtCharge) return; S.edtCharge = true;
    try { fetch('../referents-aesh/edt-lycee.json?v=2026-09-17a').then(r => r.ok ? r.json() : null).then(j => { if (!j) return; S.edt = j; recalculer(); dessiner(true); }).catch(() => { }); } catch (e) { }
    try {
      FS.onSnapshot(FS.query(FS.collection(db, COL_REFERENTS), FS.where('annee', '==', annee)), snap => {
        const v = {}; snap.forEach(d => { const x = d.data() || {}; if (x.type === 'aesh' && x.actif !== false && x.heures) Object.keys(POLES_LYCEE).forEach(p => { const h = Number(x.heures[p]); if (Number.isFinite(h) && h > 0) v[p] = (v[p] || 0) + h; }); });
        S.volumesRef = v; recalculer(); dessiner(true);
      }, () => { });
    } catch (e) { }
  }
  function ecouter() {
    chargerLycee();
    if (S.ecoute) return; S.ecoute = true;
    try {
      S.unsub = FS.onSnapshot(FS.query(FS.collection(db, COL), FS.where('annee', '==', annee)), snap => {
        let brut = null; const docs = [], mots = [];
        snap.forEach(d => { const x = d.data() || {}, id = x.id || d.id; if (x.type === 'cadre' && id === 'cadre_' + annee) brut = x; else if (x.type === 'cours') docs.push({ ...x, id }); else if (x.type === 'mot') mots.push({ id, texte: x.texte, periode: x.periode, majLe: x.majLe }); });
        S.brut = brut;
        const c = normaliserCadre(brut, S.edt, S.volumesRef);
        S.cadre = c; S.etat = c ? 'ok' : 'absent';
        /* Un seul mot est retenu : celui écrit depuis cet appareil. Ceux des collègues ne sont ni gardés ni affichés. */
        const mid = c ? app().motId : '';
        S.mot = mid ? (mots.find(m => m.id === mid && m.periode && m.periode.debut === c.periode.debut) || null) : null;
        S.docs = new Map(c ? docs.filter(d => d.periode && d.periode.debut === c.periode.debut).map(d => [d.id, d]) : []);
        dessiner(true);
      }, err => { S.ecoute = false; S.unsub = null; S.etat = /permission|insufficient/i.test(String(err && (err.code || err.message))) ? 'refus' : 'horsligne'; dessiner(); });
    } catch (e) { S.ecoute = false; S.etat = 'horsligne'; }
  }

  const cadre = () => S.cadre;
  const classeDe = nom => cadre() && cadre().classes.find(k => k.nom === nom);
  const courtDe = k => COURT[k.nom] || k.court || k.nom;
  const idDe = (k, cr) => idCours(cadre().periode.debut, k.nom, cr.cle);
  const docDe = (k, cr) => { const d = S.docs.get(idDe(k, cr)); return d && d.statut === 'active' ? d : null; };
  /* « vous » : cours enregistré depuis cet appareil et que personne n'a modifié depuis (même version). */
  const estMien = (k, cr, a) => { const d = docDe(k, cr); if (!d) return false; const ap = a || app(), id = idDe(k, cr), v = ap.versions[id]; return v != null ? v === d.version : ap.miens.includes(id); };
  const semaineVisible = cr => !cadre().avecParite || !cr.parite || cr.parite === S.sem;
  const jjmm = iso => RE_DATE.test(String(iso || '').slice(0, 10)) ? `${String(iso).slice(8, 10)}/${String(iso).slice(5, 7)}` : '';
  const pousser = () => { try { pousserNav && pousserNav({ ecran: S.ecran, fil: S.fil, classe: S.classe, sem: S.sem }); } catch (e) { } };
  const aller = (ecran, maj) => { Object.assign(S, maj || {}); S.ecran = ecran; S.focus = 'titre-ecran'; pousser(); dessiner(); window.scrollTo(0, 0); };
  const fermerFeuille = () => {
    S.sel = null; S.f = null;
    if (S.navFeuille) { S.navFeuille = false; S.ignorerPop++; try { history.back(); } catch (e) { S.ignorerPop--; } }
  };
  let toastTimer = null;
  const toast = (t, err) => { S.toast = t; S.toastErr = !!err; dessiner(); clearTimeout(toastTimer); toastTimer = setTimeout(() => { S.toast = ''; dessiner(); }, err ? 4000 : 1800); annonce && annonce(t); };
  /* Heures par semaine (moyenne sur la période) estimées pour un pôle, et matières déjà estimées (0 AESH compris). */
  function moyensPole(pole) {
    const c = cadre(), nbS = Math.max(1, semainesDeCours(c)), faites = new Set(); let total = 0;
    c.classes.filter(k => k.pole === pole).forEach(k => k.creneaux.forEach(cr => {
      const d = docDe(k, cr); if (!d) return;
      faites.add(familleMatiere(cr.matiere));
      const h = heuresLigne(c, k, cr, d) / nbS; if (h > 0) total += h;
    }));
    return { total, faites };
  }

  function dessiner(depuisDonnees) {
    const h = S.hote; if (!h || !h.isConnected) return;
    const actif = document.activeElement, idActif = actif && h.contains(actif) ? actif.id : null, y = window.scrollY;
    const modale = !!((S.sel && S.f) || S.valid || S.recap || S.motEdit != null);
    let html = `<div class="e6"${modale ? ' inert' : ''}>`;
    if (S.etat !== 'ok') html += blocEtat();
    else if (S.ecran === 'fin') html += ecranFin();
    else if (S.ecran === 'classe' && S.fil) html += ecranClasses();
    else if (S.ecran === 'edt' && classeDe(S.classe)) html += ecranEdt();
    else if (FORCEES && FORCEES.length === 1 && S.etat === 'ok' && cadre().classes.some(k => k.pole === FORCEES[0])) { S.ecran = 'classe'; S.fil = FORCEES[0]; html += ecranClasses(); }
    else { S.ecran = 'filiere'; html += ecranFilieres(); }
    html += `</div>`;
    if (S.sel && S.f && !S.recap) html += feuille();
    if (S.valid) html += feuilleValidation();
    if (S.recap) html += fenetreRecap();
    if (S.motEdit != null) html += feuilleMot();
    if (S.toast) html += `<div class="e6-toast ${S.toastErr ? 'err' : ''}" role="status">${esc(S.toast)}</div>`;
    h.innerHTML = html;
    lier();
    if (S.focus) { const el = document.getElementById(S.focus); S.focus = null; if (el) el.focus({ preventScroll: !!depuisDonnees }); }
    else if (idActif) { const el = document.getElementById(idActif); if (el) el.focus({ preventScroll: true }); }
    if (depuisDonnees) window.scrollTo(0, y);
  }
  const barre = titre => `<div class="e6-barre"><button type="button" class="e6-retour" id="e6-retour" data-e="retour" aria-label="Retour">←</button><span class="t">${esc(titre || '')}</span></div>`;
  function blocEtat() {
    if (S.etat === 'chargement') return `<div class="e6-respire" role="status"><div class="e6-bulle" aria-hidden="true"></div><b id="titre-ecran" tabindex="-1">Respirez…</b><p>Prenez le temps, les emplois du temps arrivent.</p></div>`;
    const t = S.etat === 'absent' ? 'La coordination n’a pas encore publié les emplois du temps de l’estimation.' : S.etat === 'refus' ? 'Espace en cours d’ouverture par la coordination.' : 'Pas de connexion au serveur.';
    return `${barre('')}<div class="message warn" role="alert"><p>${t}</p><p><button type="button" class="btn primaire petit" data-e="reessayer">Réessayer</button></p></div>`;
  }
  function ecranFilieres() {
    const c = cadre();
    return `${barre('Estimation')}<span class="e6-per">${esc(c.periode.label)} · ${esc(jjmm(c.periode.debut))} → ${esc(jjmm(c.periode.fin))}</span>
      <h1 id="titre-ecran" tabindex="-1">Votre filière</h1>
      ${FILIERES.filter(([p]) => (!FORCEES || FORCEES.includes(p)) && c.classes.some(k => k.pole === p)).map(([p, t, s]) => `<button type="button" class="e6-gros" id="fil-${p}" data-e="fil" data-v="${p}"><span class="x"><b>${t}</b><span class="s">${s}</span></span><span class="fl" aria-hidden="true">›</span></button>`).join('')}`;
  }
  function carteMoyens(pole) {
    const c = cadre(), vol = c.volumes[pole], fil = FILIERES.find(f => f[0] === pole), { total, faites } = moyensPole(pole);
    const pct = vol ? Math.round(total / vol * 100) : null;
    /* Anneau d'une seule couleur, sans heures par matière : on ne peut pas en déduire la réponse d'un collègue. */
    const toutes = new Map();
    c.classes.filter(k => k.pole === pole).forEach(k => k.creneaux.forEach(cr => { const f = familleMatiere(cr.matiere); if (!toutes.has(f)) toutes.set(f, cr.matiere); }));
    const fait = [...toutes.keys()].filter(f => faites.has(f)), reste = [...toutes.keys()].filter(f => !faites.has(f));
    const puces = fait.map(f => `<span class="fait">✓ ${esc(toutes.get(f))}</span>`).join('') + reste.map(f => `<span class="pas">${esc(toutes.get(f))}</span>`).join('');
    const L = 2 * Math.PI * 52, part = vol ? Math.min(1, total / vol) : 0;
    const anneau = vol ? `<div class="e6-anneau${pct > 100 ? ' plus' : ''}" role="img" aria-label="${esc(`${pct} % des heures AESH du pôle : ${fmtH(total)} estimées sur ${fmtH(vol)} par semaine`)}">
        <svg viewBox="0 0 120 120" aria-hidden="true"><circle class="fond" cx="60" cy="60" r="52"/>${part > 0 ? `<circle class="val" cx="60" cy="60" r="52" transform="rotate(-90 60 60)" stroke-dasharray="${(part * L).toFixed(1)} ${L.toFixed(1)}"/>` : ''}</svg>
        <span class="dedans" aria-hidden="true"><b>${pct} %</b><span>${esc(fmtH(total))}</span><span>sur ${esc(fmtH(vol))}</span></span></div>` : '';
    return `<section class="e6-moyens" aria-label="Moyens humains, ${esc(fil ? fil[1] : pole)}">
      <div class="haut"><b>Moyens humains · ${esc(fil ? fil[1] : pole)}</b><span class="e6-info" style="margin:0">Heures AESH du pôle : <b style="color:var(--ink)">${vol != null ? esc(fmtH(vol)) : '—'}</b> / sem. · estimation, variable</span></div>
      <div class="corps">${anneau}
        <div class="txt"><div class="est">Estimation en cours : <b>${esc(fmtH(total))}</b> / sem.</div>
          <div class="e6-info" style="margin:4px 0 0"><b style="color:var(--ink)">${fait.length}</b> matière${fait.length > 1 ? 's' : ''} sur ${toutes.size} déjà estimée${fait.length > 1 ? 's' : ''}</div>
          ${pct > 100 ? `<div class="e6-info" style="margin:4px 0 0;color:var(--err-ink);font-weight:650">Au-delà des heures du pôle</div>` : ''}</div></div>
      <div class="e6-leg e6-mats">${puces}</div></section>`;
  }
  function ecranClasses() {
    const c = cadre(), fil = FILIERES.find(f => f[0] === S.fil), ks = c.classes.filter(k => k.pole === S.fil), a = app();
    let h = barre(fil ? fil[1] : '') + carteMoyens(S.fil) + `<h1 id="titre-ecran" tabindex="-1">Votre classe</h1>`;
    ks.forEach(k => {
      const n = k.creneaux.filter(cr => docDe(k, cr)).length;
      h += `<button type="button" class="e6-gros" id="cl-${esc(k.nom)}" data-e="classe" data-v="${esc(k.nom)}"><span class="x"><b>${esc(courtDe(k))}${a.valides[k.nom] ? '<span class="e6-okb">✓ validée</span>' : ''}</b>
        <span class="s">${k.effectif != null ? `${k.effectif} élèves · ` : ''}${n ? `${n} cours estimé${n > 1 ? 's' : ''}` : 'aucun cours estimé'}</span></span><span class="fl" aria-hidden="true">›</span></button>`;
    });
    h += `<button type="button" class="e6-mot" id="e6-mot" data-e="mot">${S.mot && S.mot.texte ? '✓ Votre mot pour la coordination est enregistré · Modifier' : '✎ Un mot pour la coordination (facultatif)'}</button>`;
    return h + `<div style="margin-top:18px"><button type="button" class="e6-btn sec" id="e6-terminer" data-e="terminer">J’ai terminé</button></div>`;
  }
  function ecranEdt() {
    const c = cadre(), k = classeDe(S.classe);
    const pf = (k.pfmp || []).filter(p => p.fin >= c.periode.debut && p.debut <= c.periode.fin);
    let h = barre(`${courtDe(k)}${k.effectif != null ? ` · ${k.effectif} élèves` : ''}`) + `<h1 id="titre-ecran" tabindex="-1">Emploi du temps</h1>`;
    if (c.avecParite) h += `<div class="e6-onglets" role="group" aria-label="Semaine">${['A', 'B'].map(s => `<button type="button" id="sem-${s}" data-e="sem" data-v="${s}" aria-pressed="${S.sem === s}">Semaine ${s}</button>`).join('')}</div>`;
    if (pf.length) h += `<p class="e6-info">${pf.map(p => `PFMP du ${esc(jjmm(p.debut))} au ${esc(jjmm(p.fin))}`).join(' · ')}</p>`;
    const ap = app();
    h += `<p class="e6-legende"><span><span class="e6-qui vous">vous</span> : estimé par vous</span><span><span class="e6-qui coll">collègue</span> ✓ : par un collègue</span><span>+ : à estimer</span></p>`;
    JOURS.forEach(j => {
      const cj = k.creneaux.filter(cr => cr.jour === j && semaineVisible(cr)); if (!cj.length) return;
      h += `<h2 class="e6-jour">${JOURS_L[j]}</h2>`;
      cj.forEach(cr => {
        /* Le nombre d'AESH demandé par un collègue n'est jamais montré (choix de la coordination, 15/09) : seulement « ✓ ». */
        const d = docDe(k, cr), mien = estMien(k, cr, ap), [mc, mt] = couleurMatiere(cr.matiere);
        const cls = !d ? '' : !mien ? 'coll' : d.nb === 0 ? 'n0' : d.nb === 1 ? 'n1' : d.nb === 2 ? 'n2' : 'n3';
        const hl = d ? horaireLigne(cr, d) : { debut: cr.debut, fin: cr.fin };
        const sem = d ? (cr.parite ? `sem. ${cr.parite}` : ['A', 'B'].includes(d.semaines) ? `sem. ${d.semaines}` : (c.avecParite ? 'sem. A et B' : '')) : '';
        h += `<button type="button" class="e6-cours${S.flash === cr.cle ? ' flash' : ''}" style="--mc:${mc};--mt:${mt}" id="cr-${esc(slug(cr.cle))}" data-e="cours" data-v="${esc(cr.cle)}"
          aria-label="${esc(`${JOURS_L[cr.jour]} ${hFr(cr.debut)}–${hFr(cr.fin)}, ${cr.matiere}${cr.parite ? ', semaine ' + cr.parite : ''}, ${!d ? 'pas encore estimé' : mien ? d.nb + ' AESH' : 'estimé par un collègue'}`)}">
          <span class="h">${esc(hFr(cr.debut))}–${esc(hFr(cr.fin))}</span>
          <span class="m"><b>${esc(cr.matiere)}</b>${cr.salle ? `<small class="e6-salle">${esc(cr.salle)}</small>` : ''}${d ? `<small>${mien ? '<span class="e6-qui vous">vous</span>' : '<span class="e6-qui coll">collègue</span>'}${esc([`jusqu’au ${jjmm(d.au)}`, sem, (hl.debut !== cr.debut || hl.fin !== cr.fin) ? `${hFr(hl.debut)}–${hFr(hl.fin)}` : ''].filter(Boolean).join(' · '))}</small>` : ''}</span>
          <span class="p ${cls}">${!d ? '+' : mien ? `${d.nb} AESH` : '✓'}</span></button>`;
      });
    });
    return h + `<div class="e6-bas"><button type="button" class="e6-btn" id="e6-valider-classe" data-e="valider-classe">Valider ${esc(courtDe(k))}</button></div>`;
  }
  function feuilleValidation() {
    const k = classeDe(S.valid); if (!k) { S.valid = null; return ''; }
    const a = app(), mes = k.creneaux.filter(cr => estMien(k, cr, a));
    const nSem = s => k.creneaux.filter(cr => (!cr.parite || cr.parite === s) && docDe(k, cr)).length;
    const oublis = mes.length ? coursOublies(k, cr => estMien(k, cr, a), cr => docDe(k, cr)) : [];
    return `<div class="e6-ov" data-e="fond-valid"><div class="e6-feuille" role="dialog" aria-modal="true" aria-labelledby="v-titre"><div class="e6-poignee" aria-hidden="true"></div>
      <h2 id="v-titre" tabindex="-1">Valider ${esc(courtDe(k))}</h2>
      <ul class="e6-recap">${cadre().avecParite ? `<li><span>Semaine A</span><b>${nSem('A')} cours</b></li><li><span>Semaine B</span><b>${nSem('B')} cours</b></li>` : `<li><span>Cours estimés</span><b>${nSem('A')}</b></li>`}</ul>
      ${!mes.length ? `<div class="e6-verif" id="v-verif">Aucun cours estimé depuis cet appareil pour cette classe.</div>` : oublis.length ? `<div class="e6-verif" id="v-verif">Pas encore confirmé : ${oublis.map(cr => `<b>${esc(cr.matiere)}</b>, ${esc(JOURS_L[cr.jour].toLowerCase())} ${esc(hFr(cr.debut))} (semaine ${esc(cr.parite)})`).join(' ; ')}.</div>`
        : `<div class="e6-verif ok" id="v-verif">✓ Semaines A et B vérifiées pour les matières que vous avez estimées.</div>`}
      <div class="e6-actions"><button type="button" class="e6-btn sec" id="v-non" data-e="valid-non">${oublis.length ? 'Compléter' : 'Retour'}</button><button type="button" class="e6-btn" id="v-oui" data-e="valid-oui" ${mes.length ? '' : 'disabled'}>Valider</button></div></div></div>`;
  }
  function ecranFin() {
    return `<div class="e6-fin"><div class="grand" aria-hidden="true">🌿</div><h1 id="titre-ecran" tabindex="-1">Merci !</h1>
      <p>Vos estimations sont enregistrées. Grâce à vous, l’accompagnement pourra être organisé au plus près des besoins des élèves.</p>
      <p style="color:var(--muted);font-size:1rem">Vous pouvez revenir les modifier à tout moment.</p>
      <div style="margin-top:26px;max-width:420px;margin-inline:auto"><button type="button" class="e6-btn" id="e6-fin-accueil" data-e="accueil">Revenir à l’accueil</button></div></div>`;
  }
  function feuille() {
    const c = cadre(), k = classeDe(S.classe), cr = k && k.creneaux.find(x => x.cle === S.sel); if (!cr) { S.sel = null; return ''; }
    const f = S.f, existe = !!docDe(k, cr), mien = estMien(k, cr);
    const pas = []; for (let m = min(cr.debut); m <= min(cr.fin); m += 15) pas.push(hDe(m)); if (pas[pas.length - 1] !== cr.fin) pas.push(cr.fin);
    const dateOk = RE_DATE.test(f.au || '') && f.au >= c.periode.debut && f.au <= c.periode.fin, peutValider = f.nb != null && (f.A || f.B) && dateOk;
    return `<div class="e6-ov" data-e="fond"><div class="e6-feuille" role="dialog" aria-modal="true" aria-labelledby="f-titre"><div class="e6-poignee" aria-hidden="true"></div>
      <h2 id="f-titre" tabindex="-1">${esc(JOURS_L[cr.jour])} ${esc(hFr(cr.debut))}–${esc(hFr(cr.fin))}</h2>
      <p class="e6-info">${esc(cr.matiere)} · ${esc(courtDe(k))}${cr.parite ? ` · semaine ${esc(cr.parite)}` : ''}</p>
      ${existe && !mien ? `<p class="e6-info" id="f-coll">Déjà estimé par un collègue. Votre réponse remplacera la sienne.</p>` : ''}
      <p class="e6-q" id="f-q">Combien d’AESH ?</p>
      <div class="e6-nbs" role="group" aria-labelledby="f-q">${[0, 1, 2, 3, 4, 5, 6].map(v => `<button type="button" id="nb-${v}" data-e="nb" data-v="${v}" aria-pressed="${f.nb === v}">${v}</button>`).join('')}</div>
      <div class="e6-ligne"><span class="lib">Élèves dans ce cours <small style="display:block;font-size:.85rem">facultatif</small></span><span class="e6-ab" style="align-items:center"><button type="button" id="el-moins" data-e="eleves" data-v="-1" aria-label="Un élève de moins">−</button><b id="el-val" style="min-width:2.4em;text-align:center;font-size:1.15rem">${f.eleves == null ? '—' : esc(f.eleves)}</b><button type="button" id="el-plus" data-e="eleves" data-v="1" aria-label="Un élève de plus">+</button></span></div>
      <div class="e6-ligne"><span class="lib">Période</span><span class="val">${f.modPer
        ? `<label class="sr" for="f-au">Jusqu’au</label><input type="date" id="f-au" data-i="au" value="${esc(f.au)}" min="${esc(c.periode.debut)}" max="${esc(c.periode.fin)}">`
        : `jusqu’au ${esc(jjmm(f.au))}<button type="button" class="e6-mod" id="mod-per" data-e="mod-per">modifier</button>`}</span></div>
      ${dateOk ? '' : `<p class="e6-info" id="f-date" role="alert" style="color:var(--err-ink)">Date à choisir entre le ${esc(jjmm(c.periode.debut))} et le ${esc(jjmm(c.periode.fin))}.</p>`}
      ${c.avecParite ? `<div class="e6-ligne"><span class="lib">Semaines</span><span class="e6-ab">${['A', 'B'].map(s => `<button type="button" id="ab-${s}" data-e="ab" data-v="${s}" aria-pressed="${!!f[s]}" ${cr.parite ? 'disabled' : ''}>${s}</button>`).join('')}</span></div>` : ''}
      <div class="e6-ligne"><span class="lib">Horaire</span><span class="val">${f.modH
        ? `<label class="sr" for="f-hd">De</label><select id="f-hd" data-i="hDebut">${pas.slice(0, -1).map(x => `<option value="${x}" ${x === f.hDebut ? 'selected' : ''}>${hFr(x)}</option>`).join('')}</select>–<label class="sr" for="f-hf">à</label><select id="f-hf" data-i="hFin">${pas.slice(1).map(x => `<option value="${x}" ${x === f.hFin ? 'selected' : ''}>${hFr(x)}</option>`).join('')}</select>`
        : `${esc(hFr(f.hDebut))}–${esc(hFr(f.hFin))}<button type="button" class="e6-mod" id="mod-h" data-e="mod-h">modifier</button>`}</span></div>
      <div class="e6-actions">${mien ? `<button type="button" class="e6-btn sec" id="f-retirer" data-e="retirer">Retirer</button>` : ''}
        <button type="button" class="e6-btn" id="f-enregistrer" data-e="enregistrer" ${peutValider && !S.envoi ? '' : 'disabled'}>${S.envoi ? 'Enregistrement…' : 'Enregistrer'}</button></div>
    </div></div>`;
  }
  /* Récapitulatif avant d'enregistrer ou de retirer, puis « ✓ Enregistré » (15/09 : éviter la mauvaise matière ou la mauvaise semaine). */
  function recapDe(mode) {
    const c = cadre(), k = classeDe(S.classe), cr = k && k.creneaux.find(x => x.cle === S.sel), f = S.f; if (!cr || !f) return null;
    const hl = horaireLigne(cr, { hDebut: f.hDebut, hFin: f.hFin });
    const sem = !c.avecParite ? '' : cr.parite ? `Semaine ${cr.parite}` : f.A && f.B ? 'Semaines A et B' : f.A ? 'Semaine A seulement' : 'Semaine B seulement';
    return { mode, cle: cr.cle, nb: f.nb, eleves: f.eleves, matiere: cr.matiere, classe: courtDe(k), moment: `${JOURS_L[cr.jour]} ${hFr(hl.debut)}–${hFr(hl.fin)}`, sem, au: RE_DATE.test(f.au || '') ? `Jusqu’au ${jjmm(f.au)}` : '' };
  }
  let recapTimer = null;
  function fermerRecap() {
    clearTimeout(recapTimer); const r = S.recap; S.recap = null;
    if (r && r.mode === 'fait') { S.flash = r.cle; S.focus = 'cr-' + slug(r.cle); setTimeout(() => { if (S.flash === r.cle) S.flash = null; }, 2200); }
    dessiner();
  }
  function fenetreRecap() {
    const r = S.recap, fait = r.mode === 'fait', retirer = r.mode === 'retirer';
    return `<div class="e6-ov" data-e="fond-recap"><div class="e6-feuille e6-rc${fait ? ' fait' : ''}" role="${fait ? 'status' : 'alertdialog'}" aria-modal="${fait ? 'false' : 'true'}" aria-labelledby="r-titre"${fait ? ' data-e="fond-recap"' : ''}>
      <h2 id="r-titre" tabindex="-1">${fait ? '✓ Enregistré' : retirer ? 'Vous retirez l’estimation de :' : 'Vous confirmez ?'}</h2>
      ${retirer ? '' : `<p class="e6-rc-nb">${esc(r.nb)} AESH</p>${r.eleves != null ? `<p class="e6-rc-l">${esc(r.eleves)} élève${r.eleves > 1 ? 's' : ''}</p>` : ''}`}
      <p class="e6-rc-m">${esc(r.matiere)} · ${esc(r.classe)}</p>
      <p class="e6-rc-l">${esc(r.moment)}</p>${r.sem ? `<p class="e6-rc-l">${esc(r.sem)}</p>` : ''}${r.au ? `<p class="e6-rc-l">${esc(r.au)}</p>` : ''}
      ${fait ? '' : `<div class="e6-actions"><button type="button" class="e6-btn sec" id="r-non" data-e="recap-non" ${S.envoi ? 'disabled' : ''}>${retirer ? 'Annuler' : 'Modifier'}</button><button type="button" class="e6-btn" id="r-oui" data-e="recap-oui" ${S.envoi ? 'disabled' : ''}>${S.envoi ? 'Enregistrement…' : retirer ? 'Retirer' : 'Confirmer'}</button></div>`}
    </div></div>`;
  }
  /* Un mot pour la coordination : un par appareil et par période, modifiable. Jamais montré aux collègues. */
  function feuilleMot() {
    return `<div class="e6-ov" data-e="fond-mot"><div class="e6-feuille" role="dialog" aria-modal="true" aria-labelledby="m-titre"><div class="e6-poignee" aria-hidden="true"></div>
      <h2 id="m-titre" tabindex="-1">Un mot pour la coordination</h2>
      <p class="e6-info">Facultatif. Sans nom d’élève. Vos collègues ne le voient pas.</p>
      <label class="sr" for="m-txt">Votre mot</label>
      <textarea id="m-txt" maxlength="600" placeholder="Ce que vous voulez signaler…">${esc(S.motEdit || '')}</textarea>
      <div class="e6-actions"><button type="button" class="e6-btn sec" id="m-non" data-e="mot-non" ${S.envoi ? 'disabled' : ''}>Annuler</button>
        <button type="button" class="e6-btn" id="m-oui" data-e="mot-oui" ${S.envoi ? 'disabled' : ''}>${S.envoi ? 'Enregistrement…' : 'Enregistrer'}</button></div>
    </div></div>`;
  }
  async function ecrireMot() {
    const c = cadre(), a = app();
    if (!a.motId) { a.motId = `mot_${c.periode.debut}_${(Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)).replace(/[^a-z0-9]/g, '').slice(0, 10)}`; appEcrit(a); }
    const doc = { id: a.motId, type: 'mot', annee, periode: { debut: c.periode.debut, fin: c.periode.fin, label: String(c.periode.label || '').slice(0, 40) },
      pole: S.fil || '', texte: String(S.motEdit || '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, 600), majLe: new Date().toISOString(), source: 'estimation-aesh' };
    S.envoi = true; dessiner();
    try {
      await Promise.race([FS.setDoc(FS.doc(db, COL, doc.id), doc), new Promise((_, rej) => setTimeout(() => rej(Object.assign(new Error('délai dépassé'), { code: 'delai' })), 15000))]);
      S.mot = doc; S.envoi = false; S.motEdit = null; S.focus = 'e6-mot';
      toast(doc.texte ? '✓ Mot enregistré' : 'Mot effacé');
    } catch (e) {
      S.envoi = false;
      const t = String((e && (e.code || e.message)) || e);
      toast(t === 'delai' ? 'Pas de réponse du serveur. Vérifiez dans un instant.' : /permission|insufficient/i.test(t) ? 'Non enregistré : espace pas encore ouvert par la coordination.' : 'Non enregistré : pas de connexion. Réessayez.', true);
    }
  }
  function ouvrir(cle) {
    const c = cadre(), k = classeDe(S.classe), cr = k.creneaux.find(x => x.cle === cle); if (!cr) return;
    /* Cours d'un collègue : rien de sa réponse n'est repris (ni nombre, ni période, ni semaines, ni horaire). */
    const d = estMien(k, cr) ? docDe(k, cr) : null, hl = d ? horaireLigne(cr, d) : { debut: cr.debut, fin: cr.fin };
    S.sel = cle;
    S.f = { nb: d ? d.nb : null, eleves: d && Number.isInteger(d.eleves) ? d.eleves : null, au: d && RE_DATE.test(d.au || '') ? d.au : c.periode.fin, hDebut: hl.debut, hFin: hl.fin, modPer: false, modH: false,
      A: cr.parite ? cr.parite === 'A' : (d ? d.semaines !== 'B' : true), B: cr.parite ? cr.parite === 'B' : (d ? d.semaines !== 'A' : true) };
    if (!S.navFeuille) { S.navFeuille = true; pousser(); }
    S.focus = S.f.nb != null ? 'nb-' + S.f.nb : 'f-titre'; dessiner();
  }
  /* Confirmé par le serveur : l'appareil retient la version enregistrée (« vous » tant que personne ne la modifie), puis copie archivée. */
  function enregistreIci(k, id, doc) {
    const a = app();
    if (doc.statut === 'active') { if (!a.miens.includes(id)) a.miens.push(id); a.versions[id] = doc.version; }
    else { a.miens = a.miens.filter(x => x !== id); delete a.versions[id]; }
    delete a.valides[k.nom]; appEcrit(a);
    try { const aid = idArchiveCours(id, doc.version); Promise.resolve(FS.setDoc(FS.doc(db, COL, aid), { ...doc, id: aid, type: 'archive', declaration: id, lignes: declarationsDeCours([doc])[0].lignes, commentaire: '' })).catch(() => { }); } catch (e) { }
  }
  async function ecrire(k, cr, statut) {
    const c = cadre(), id = idDe(k, cr), prec = S.docs.get(id), f = S.f, maintenant = new Date().toISOString(), rc = S.recap;
    const hl = horaireLigne(cr, { hDebut: f.hDebut, hFin: f.hFin });
    const doc = { id, type: 'cours', annee, periode: { debut: c.periode.debut, fin: c.periode.fin, label: String(c.periode.label || '').slice(0, 40) },
      classe: k.nom, cle: cr.cle, jour: cr.jour, debut: cr.debut, fin: cr.fin, matiere: cr.matiere, parite: cr.parite,
      nb: statut === 'retire' ? (prec ? prec.nb : 0) : f.nb, au: RE_DATE.test(f.au || '') && f.au >= c.periode.debut && f.au <= c.periode.fin ? f.au : c.periode.fin,
      semaines: cr.parite || !c.avecParite || (f.A && f.B) ? 'toutes' : (f.A ? 'A' : 'B'), hDebut: hl.debut, hFin: hl.fin,
      statut, version: ((prec && prec.version) || 0) + 1, majLe: maintenant, source: 'estimation-aesh' };
    if (statut !== 'retire' && Number.isInteger(f.eleves) && f.eleves > 0) doc.eleves = f.eleves;
    S.envoi = true; dessiner();
    /* L'écriture peut aboutir après le délai d'attente : elle est alors retenue sur l'appareil quand elle arrive. */
    const envoi = Promise.resolve().then(() => FS.setDoc(FS.doc(db, COL, id), doc)).catch(e => {
      /* Règle Firestore pas encore mise à jour pour « eleves » : on enregistre l'essentiel sans ce champ. */
      if ('eleves' in doc && /permission|insufficient/i.test(String(e && (e.code || e.message)))) { delete doc.eleves; return FS.setDoc(FS.doc(db, COL, id), doc); }
      throw e;
    }).then(() => enregistreIci(k, id, doc));
    envoi.catch(() => { });
    try {
      await Promise.race([envoi, new Promise((_, rej) => setTimeout(() => rej(Object.assign(new Error('délai dépassé'), { code: 'delai' })), 15000))]);
      S.docs.set(id, doc); S.envoi = false;
      fermerFeuille();
      if (statut === 'retire') { S.recap = null; toast('Estimation retirée'); }
      else if (rc) { S.recap = { ...rc, mode: 'fait' }; S.focus = 'r-titre'; dessiner(); annonce && annonce('Enregistré'); clearTimeout(recapTimer); recapTimer = setTimeout(fermerRecap, 2000); }
      else { S.recap = null; toast('✓ Enregistré'); }
    } catch (e) {
      S.envoi = false; S.recap = null;
      const t = String((e && (e.code || e.message)) || e);
      toast(t === 'delai' ? 'Pas de réponse du serveur. Vérifiez dans un instant : le cours se mettra à jour s’il est bien arrivé.'
        : /permission|insufficient/i.test(t) ? 'Non enregistré : espace pas encore ouvert par la coordination.' : 'Non enregistré : pas de connexion. Réessayez.', true);
    }
  }
  function lier() {
    const h = S.hote;
    h.onclick = ev => {
      const b = ev.target.closest('[data-e]'); if (!b || b.disabled) return;
      const a = b.dataset.e, v = b.dataset.v;
      if (a === 'fond-recap') { if (S.recap && S.recap.mode === 'fait') fermerRecap(); else if (S.recap && ev.target === b && !S.envoi) { S.focus = S.recap.mode === 'retirer' ? 'f-retirer' : 'f-enregistrer'; S.recap = null; dessiner(); } return; }
      if (a === 'fond') { if (ev.target === b && !S.envoi) { S.focus = 'cr-' + slug(S.sel); fermerFeuille(); dessiner(); } return; }
      if (a === 'fond-mot') { if (ev.target === b && !S.envoi) { S.motEdit = null; S.focus = 'e6-mot'; dessiner(); } return; }
      if (a === 'fond-valid') { if (ev.target === b) { S.valid = null; dessiner(); } return; }
      if (a === 'retour') { if (S.ecran === 'edt') aller('classe'); else if (S.ecran === 'classe' && !(FORCEES && FORCEES.length === 1)) aller('filiere'); else retourAccueil && retourAccueil(); return; }
      if (a === 'accueil') { retourAccueil && retourAccueil(); return; }
      if (a === 'reessayer') { S.etat = 'chargement'; S.ecoute = false; if (S.unsub) try { S.unsub(); } catch (e) { } S.unsub = null; ecouter(); dessiner(); return; }
      if (a === 'fil') return aller('classe', { fil: v });
      if (a === 'classe') return aller('edt', { classe: v, sem: 'A' });
      if (a === 'terminer') return aller('fin');
      if (a === 'mot') { S.motEdit = (S.mot && S.mot.texte) || ''; S.focus = 'm-txt'; dessiner(); return; }
      if (a === 'mot-non') { S.motEdit = null; S.focus = 'e6-mot'; dessiner(); return; }
      if (a === 'mot-oui') { ecrireMot(); return; }
      if (a === 'sem') { S.sem = v; S.focus = b.id; dessiner(); return; }
      if (a === 'cours') return ouvrir(v);
      if (a === 'nb') { S.f.nb = Number(v); S.focus = b.id; dessiner(); return; }
      if (a === 'eleves') { const n = S.f.eleves == null ? (Number(v) > 0 ? 1 : null) : S.f.eleves + Number(v); S.f.eleves = n == null || n < 1 ? null : Math.min(40, n); S.focus = b.id; dessiner(); return; }
      if (a === 'ab') { S.f[v] = !S.f[v]; S.focus = b.id; dessiner(); return; }
      if (a === 'mod-per') { S.f.modPer = true; S.focus = 'f-au'; dessiner(); return; }
      if (a === 'mod-h') { S.f.modH = true; S.focus = 'f-hd'; dessiner(); return; }
      if (a === 'enregistrer') { S.recap = recapDe('confirmer'); S.focus = 'r-oui'; dessiner(); return; }
      if (a === 'retirer') { S.recap = recapDe('retirer'); S.focus = 'r-oui'; dessiner(); return; }
      if (a === 'recap-non') { const m = S.recap && S.recap.mode; S.recap = null; S.focus = m === 'retirer' ? 'f-retirer' : 'f-enregistrer'; dessiner(); return; }
      if (a === 'recap-oui') { const m = S.recap && S.recap.mode, k = classeDe(S.classe), cr = k && k.creneaux.find(x => x.cle === S.sel); if (cr && (m === 'confirmer' || m === 'retirer')) ecrire(k, cr, m === 'retirer' ? 'retire' : 'active'); return; }
      if (a === 'valider-classe') { S.valid = S.classe; S.focus = 'v-titre'; dessiner(); return; }
      if (a === 'valid-non') { S.valid = null; S.focus = 'e6-valider-classe'; dessiner(); return; }
      if (a === 'valid-oui') { const nom = S.valid, k = classeDe(nom), ap = app(); ap.valides[nom] = true; appEcrit(ap); S.valid = null; aller('classe'); toast(`✓ ${courtDe(k)} validée`); return; }
    };
    h.oninput = ev => { if (ev.target.id === 'm-txt') S.motEdit = ev.target.value; };
    h.onchange = ev => {
      const t = ev.target; if (t.id === 'm-txt') { S.motEdit = t.value; return; }
      const k = t.dataset && t.dataset.i; if (!k || !S.f) return;
      S.f[k] = t.value;
      if ((k === 'hDebut' || k === 'hFin') && min(S.f.hFin) <= min(S.f.hDebut)) { if (k === 'hDebut') S.f.hFin = hDe(min(S.f.hDebut) + 15); else S.f.hDebut = hDe(min(S.f.hFin) - 15); }
      S.focus = t.id; dessiner();
    };
    h.onkeydown = ev => {
      if (ev.key === 'Tab') {
        const fe = [...h.querySelectorAll('.e6-feuille')].pop(); if (!fe) return;
        const el = [...fe.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea')];
        if (!el.length) { ev.preventDefault(); return; }
        const i = el.indexOf(document.activeElement);
        if (ev.shiftKey && i <= 0) { ev.preventDefault(); el[el.length - 1].focus(); }
        else if (!ev.shiftKey && (i === -1 || i === el.length - 1)) { ev.preventDefault(); el[0].focus(); }
        return;
      }
      if (ev.key !== 'Escape' || S.envoi) return;
      if (S.motEdit != null) { S.motEdit = null; S.focus = 'e6-mot'; dessiner(); return; }
      if (S.recap) { if (S.recap.mode === 'fait') fermerRecap(); else { S.focus = S.recap.mode === 'retirer' ? 'f-retirer' : 'f-enregistrer'; S.recap = null; dessiner(); } return; }
      if (S.valid) { S.valid = null; S.focus = 'e6-valider-classe'; dessiner(); return; }
      if (S.sel) { S.focus = 'cr-' + slug(S.sel); fermerFeuille(); dessiner(); }
    };
  }
  const slug = s => String(s).replace(/[^A-Za-z0-9]+/g, '-');

  return {
    monter(hote) { S.hote = hote; S.ecran = 'filiere'; S.sel = null; S.f = null; S.recap = null; S.valid = null; S.motEdit = null; S.navFeuille = false; ecouter(); dessiner(); },
    fermer() { S.hote = null; },
    consommerPop() { if (S.ignorerPop > 0) { S.ignorerPop--; return true; } return false; },
    restaurerNav(e) {
      S.recap = null; S.sel = null; S.f = null; S.valid = null; S.motEdit = null; S.navFeuille = false;
      S.ecran = e && ['filiere', 'classe', 'edt', 'fin'].includes(e.ecran) ? e.ecran : 'filiere';
      if (e) { S.fil = e.fil || S.fil; S.classe = e.classe || S.classe; S.sem = e.sem || 'A'; }
      S.focus = 'titre-ecran'; dessiner();
    },
    _etat: () => S
  };
}
