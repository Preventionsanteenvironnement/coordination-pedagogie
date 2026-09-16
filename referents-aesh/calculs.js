/* ═══════════════════════════════════════════════════════════════════
   Référents de pôle AESH — calculs (sans affichage, testables seuls)
   Semaines A/B, vacances, PFMP, heures des AESH, conflits, disponibilités.
   Toutes les dates sont des chaînes « AAAA-MM-JJ », calculées en UTC.
   ═══════════════════════════════════════════════════════════════════ */
export const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
export const JOURS_C = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
export const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
export const MOIS_C = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
export const RE_DATE = /^\d{4}-\d{2}-\d{2}$/;
export const RE_HEURE = /^([01]\d|2[0-3]):[0-5]\d$/;

export const z2 = n => String(n).padStart(2, '0');
export const min = h => { const [a, b] = String(h).split(':').map(Number); return a * 60 + b; };
export const hDe = m => `${z2(Math.floor(m / 60))}:${z2(m % 60)}`;
export const hFr = h => RE_HEURE.test(h || '') ? `${parseInt(h, 10)}h${h.slice(3) === '00' ? '' : h.slice(3)}` : '';
export const fmtH = x => { const v = Math.round((Number(x) || 0) * 100) / 100; const s = Number.isInteger(v) ? String(v) : String(Math.round(v * 10) / 10).replace('.', ','); return s + ' h'; };
const dUTC = iso => { const [y, m, d] = iso.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
export const ajoute = (iso, n) => { const d = dUTC(iso); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
export const jourSemaine = iso => (dUTC(iso).getUTCDay() + 6) % 7;          // lundi = 0
export const lundiDe = iso => ajoute(iso, -Math.min(jourSemaine(iso), 6));
export const isoLocal = (d = new Date()) => `${d.getFullYear()}-${z2(d.getMonth() + 1)}-${z2(d.getDate())}`;
export const jjmm = iso => RE_DATE.test(iso || '') ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : '';
export const dateCourte = iso => { if (!RE_DATE.test(iso || '')) return ''; const d = dUTC(iso); return `${d.getUTCDate()} ${MOIS_C[d.getUTCMonth()]}`; };
export const dateLongue = iso => { if (!RE_DATE.test(iso || '')) return ''; const d = dUTC(iso); return `${JOURS[jourSemaine(iso)] ? JOURS[jourSemaine(iso)].toLowerCase() : ['samedi', 'dimanche'][jourSemaine(iso) - 5]} ${d.getUTCDate()} ${MOIS[d.getUTCMonth()]}`; };
export const chevauche = (a1, b1, a2, b2) => min(a1) < min(b2) && min(a2) < min(b1);
export const duree = (d, f) => Math.max(0, (min(f) - min(d)) / 60);

/* ─────────────── calendrier ─────────────── */
/* cal = { semaine1:'2026-08-31' (semaine A), vacances:[{debut, fin (inclus), label}], s1Fin, s2Debut } */
export function creerCalendrier(cal) {
  const vac = (cal.vacances || []).filter(v => RE_DATE.test(v.debut) && RE_DATE.test(v.fin));
  const off = iso => { const v = vac.find(x => iso >= x.debut && iso <= x.fin); return v ? v.label : ''; };
  const cache = new Map();
  /* Parité : la semaine 1 est A ; on alterne, en sautant les semaines entièrement en vacances. */
  function parite(lundi) {
    if (cache.has(lundi)) return cache.get(lundi);
    const s1 = lundiDe(cal.semaine1);
    let p = '';
    if (lundi >= s1) {
      let n = 0, l = s1, res = '';
      while (l <= lundi) {
        const toute = [0, 1, 2, 3, 4].every(i => off(ajoute(l, i)));
        if (!toute) { res = n % 2 === 0 ? 'A' : 'B'; n++; } else res = '';
        if (l === lundi) break;
        l = ajoute(l, 7);
      }
      p = res;
    }
    cache.set(lundi, p);
    return p;
  }
  const semaine = lundi => {
    const jours = [0, 1, 2, 3, 4].map(i => { const d = ajoute(lundi, i); return { date: d, off: off(d) }; });
    return { lundi, parite: parite(lundi), jours, toute: jours.every(j => j.off) };
  };
  /* Le cours a-t-il lieu cette semaine-là (parité, semestre) ? */
  const coursSemaine = (cours, lundi) => {
    const p = parite(lundi);
    if (cours.sem === 'SA') return p === 'A';
    if (cours.sem === 'SB') return p === 'B';
    if (cours.sem === 'S1') return !cal.s1Fin || lundi <= cal.s1Fin;
    if (cours.sem === 'S2') return !cal.s2Debut || ajoute(lundi, 4) >= cal.s2Debut;
    return true;
  };
  return { parite, semaine, off, coursSemaine, vacances: vac, cal };
}

/* PFMP : une classe en stage ce jour-là. pfmp = [{debut, fin}] (bornes incluses). */
export const enPfmp = (classe, iso) => (classe && classe.pfmp || []).some(p => iso >= p.debut && iso <= p.fin);

/* Le cours a-t-il lieu à cette date ? (férié, parité, semestre, PFMP de TOUTES ses classes) */
export function coursALieu(C, edt, cours, iso) {
  if (C.off(iso)) return false;
  if (!C.coursSemaine(cours, lundiDe(iso))) return false;
  const cls = (cours.cls || []).map(n => edt.classes[n]).filter(Boolean);
  if (cls.length && cls.every(k => enPfmp(k, iso))) return false;
  return true;
}

/* ─────────────── données normalisées ─────────────── */
/* docs : liste brute de documents Firestore de la collection. Retourne l'état exploitable. */
export function indexer(docs, depart) {
  const aesh = new Map(), places = [], absences = [], messages = [], reunions = [], poles = new Map();
  (depart || []).forEach(a => aesh.set(a.id, { ...a, depart: true }));
  (docs || []).forEach(d => {
    if (!d || !d.type) return;
    if (d.type === 'aesh') aesh.set(d.id, { ...(aesh.get(d.id) || {}), ...d, depart: false });
    else if (d.type === 'place' && d.statut === 'active') places.push(d);
    else if (d.type === 'absence' && d.statut === 'active') absences.push(d);
    else if (d.type === 'message') messages.push(d);
    else if (d.type === 'reunion' && d.statut === 'active') reunions.push(d);
    else if (d.type === 'pole') poles.set(d.pole, d);
  });
  messages.sort((a, b) => String(a.creeLe || '').localeCompare(String(b.creeLe || '')));
  return { aesh, places, absences, messages, reunions, poles };
}
export const aeshActifs = (I, pole) => [...I.aesh.values()].filter(a => a.actif !== false && (!pole || (a.equipes && a.equipes[pole] != null)))
  .sort((a, b) => String(a.sigle).localeCompare(String(b.sigle), 'fr'));

export const absentLe = (I, aeshId, iso, debut, fin) => I.absences.find(x => x.aeshId === aeshId && iso >= x.du && iso <= x.au
  && (x.journee !== false || !debut || chevauche(x.debut, x.fin, debut, fin))) || null;

/* ─────────────── occupations d'une semaine ─────────────── */
/* Toutes les occupations d'un AESH sur une semaine réelle : cours, réunion d'équipe, réunions institutionnelles, absences. */
export function occupations(ctx, aeshId, lundi) {
  const { C, edt, I } = ctx, a = I.aesh.get(aeshId), out = [];
  const sem = C.semaine(lundi);
  sem.jours.forEach((jr, j) => {
    const iso = jr.date;
    if (jr.off) { out.push({ j, date: iso, type: 'vacances', debut: '08:00', fin: '18:00', label: jr.off }); return; }
    const abs = absentLe(ctx.I, aeshId, iso);
    const vus = new Set();
    I.places.forEach(p => {
      if (p.aeshId !== aeshId || p.jour !== j || iso < p.du || iso > p.au) return;
      const c = edt.cours[p.coursId]; if (!c || vus.has(p.coursId)) return;
      if (!coursALieu(C, edt, c, iso)) return;
      vus.add(p.coursId);
      const ab = absentLe(I, aeshId, iso, c.d, c.f);
      out.push({ j, date: iso, type: 'cours', debut: c.d, fin: c.f, cours: c, place: p, pole: p.pole, absent: !!ab, absence: ab });
    });
    if (a && a.reunion && RE_HEURE.test(a.reunion.debut || '') && a.reunion.jour === j && !abs)
      out.push({ j, date: iso, type: 'reunion', debut: a.reunion.debut, fin: a.reunion.fin, label: 'Réunion d’équipe' });
    I.reunions.forEach(r => { if (r.date === iso) out.push({ j, date: iso, type: 'institution', debut: r.debut, fin: r.fin, label: r.libelle || 'Réunion institutionnelle' }); });
    I.absences.forEach(x => { if (x.aeshId === aeshId && iso >= x.du && iso <= x.au) out.push({ j, date: iso, type: 'absence', debut: x.journee === false ? x.debut : '08:00', fin: x.journee === false ? x.fin : '18:00', label: MOTIFS[x.motif] || 'Absence', absence: x }); });
  });
  return out.sort((x, y) => x.j - y.j || min(x.debut) - min(y.debut));
}
export const MOTIFS = { conge: 'Congé', formation: 'Formation', arret: 'Arrêt', autre: 'Absence' };

/* Répartition d'un AESH entre les pôles (indépendante de la semaine) : contrat − heures déclarées par pôle − services − réunion. */
export function repartition(a, nomPole) {
  const contrat = Number.isFinite(+a.contrat) && a.contrat !== null && a.contrat !== '' ? +a.contrat : null;
  const parPole = {}; Object.keys(a.equipes || {}).forEach(p => { const h = +((a.heures || {})[p]); if (Number.isFinite(h)) parPole[p] = h; });
  const services = (+a.cantine || 0) + (+a.internat || 0) + (+a.service || 0), reunion = 1;
  const declare = Object.values(parPole).reduce((s, v) => s + v, 0), somme = declare + services + reunion;
  const solde = contrat == null ? null : contrat - somme;
  const nom = p => nomPole ? nomPole(p) : p;
  const parts = Object.entries(parPole).map(([p, h]) => `${nom(p)} ${fmtH(h)}`);
  if (services) parts.push(`services ${fmtH(services)}`); parts.push('réunion 1 h');
  const texte = contrat == null ? 'contrat à compléter' : solde < -1e-9 ? `${parts.join(' + ')} = ${fmtH(somme)}, pour un contrat de ${fmtH(contrat)} : ${fmtH(-solde)} de trop` : solde > 1e-9 ? `${fmtH(solde)} disponibles sur un contrat de ${fmtH(contrat)}` : `contrat de ${fmtH(contrat)} entièrement réparti`;
  return { contrat, parPole, services, reunion, declare, somme, solde, texte, poles: Object.keys(parPole).filter(p => parPole[p] > 0) };
}

/* Bilan d'un AESH pour une semaine réelle. */
export function bilan(ctx, aeshId, lundi) {
  const { I, C } = ctx, a = I.aesh.get(aeshId); if (!a) return null;
  const occ = occupations(ctx, aeshId, lundi), sem = C.semaine(lundi);
  const joursTravail = sem.jours.filter(j => !j.off).length;
  const parPole = {}; let cours = 0, coursCouvrir = 0;
  occ.forEach(o => {
    if (o.type !== 'cours') return;
    const h = duree(o.debut, o.fin);
    if (o.absent) { coursCouvrir++; return; }
    cours += h; parPole[o.pole] = (parPole[o.pole] || 0) + h;
  });
  const ratio = joursTravail / 5;
  const services = ((+a.cantine || 0) + (+a.internat || 0) + (+a.service || 0)) * ratio;
  /* Une heure de réunion par semaine de cours : la réunion institutionnelle la remplace cette semaine-là. */
  const reunion = joursTravail ? 1 : 0;
  const total = cours + services + reunion;
  const contrat = Number.isFinite(+a.contrat) && a.contrat !== null && a.contrat !== '' ? +a.contrat : null;
  const prevuPoles = a.heures || {};
  const alertes = [];
  if (contrat != null && total > contrat + 1e-9) alertes.push({ type: 'contrat', texte: `${fmtH(total)} pour un contrat de ${fmtH(contrat)}` });
  const rep = repartition(a, ctx.nomPole);
  if (rep.solde != null && rep.solde < -1e-9) alertes.push({ type: 'repartition', texte: rep.texte, poles: rep.poles, solde: rep.solde });
  Object.keys(parPole).forEach(p => { const pr = +prevuPoles[p]; if (Number.isFinite(pr) && parPole[p] > pr + 1e-9) alertes.push({ type: 'pole', pole: p, texte: `${fmtH(parPole[p])} placées pour ${fmtH(pr)} prévues` }); });
  conflits(occ, ctx.nomPole).forEach(c => alertes.push({ type: 'conflit', texte: c.texte, j: c.j, poles: c.poles, cours: c.cours }));
  if (coursCouvrir) alertes.push({ type: 'couvrir', texte: `${coursCouvrir} cours à couvrir (absence)` });
  return { a, occ, cours, services, reunion, total, contrat, reste: contrat == null ? null : contrat - total, parPole, alertes, joursTravail, rep };
}

/* Chevauchements dans une liste d'occupations (même jour). */
export function conflits(occ, nomPole) {
  const res = [], act = occ.filter(o => ['cours', 'reunion', 'institution'].includes(o.type) && !o.absent);
  for (let i = 0; i < act.length; i++) for (let k = i + 1; k < act.length; k++) {
    const x = act[i], y = act[k];
    if (x.j !== y.j || !chevauche(x.debut, x.fin, y.debut, y.fin)) continue;
    if (x.type === 'institution' || y.type === 'institution') {
      /* La réunion institutionnelle remplace la réunion d'équipe : pas de conflit entre elles. */
      if (x.type === 'reunion' || y.type === 'reunion') continue;
    }
    const cl = o => o.cours.cls.map(n => n.replace(/^(C[12]|B[12T])/, '$1 ')).join('/');
    const nom = o => o.type === 'cours' ? `${o.cours.lib || o.cours.mat} (${cl(o)})${nomPole ? ' par ' + nomPole(o.pole) : ''}` : o.label;
    res.push({ j: x.j, texte: `${JOURS[x.j]} ${hFr(x.debut)} : ${nom(x)} et ${nom(y)} en même temps`, poles: [x, y].filter(o => o.type === 'cours').map(o => o.pole), cours: [x, y].filter(o => o.type === 'cours').map(o => ({ id: o.cours.id, cls: o.cours.cls, pole: o.pole })) });
  }
  return res;
}

/* ─────────────── choisir un AESH pour un cours ─────────────── */
/* Semaines d'enseignement entre du et au (lundis). */
export function lundisEntre(C, du, au) {
  const out = []; let l = lundiDe(du);
  for (let n = 0; l <= au && n < 60; n++, l = ajoute(l, 7)) if (!C.semaine(l).toute) out.push(l);
  return out;
}
/* État d'un AESH pour un cours sur une période : libre, pris, absent, reunion, trop. */
export function disponibilite(ctx, aeshId, coursId, du, au, pole) {
  const { C, edt, I } = ctx, c = edt.cours[coursId], a = I.aesh.get(aeshId);
  if (!c || !a) return { etat: 'pris', texte: '—' };
  const deja = I.places.some(p => p.aeshId === aeshId && p.coursId === coursId && p.au >= du && p.du <= au);
  let premierPris = null, premierAbs = null, premiereReu = null, nbSem = 0;
  for (const l of lundisEntre(C, du, au)) {
    const iso = ajoute(l, c.j); if (iso < du || iso > au || !coursALieu(C, edt, c, iso)) continue;
    nbSem++;
    const ab = absentLe(I, aeshId, iso, c.d, c.f);
    if (ab && !premierAbs) premierAbs = { iso, ab };
    const autre = I.places.find(p => p.aeshId === aeshId && p.coursId !== coursId && p.jour === c.j && iso >= p.du && iso <= p.au
      && edt.cours[p.coursId] && chevauche(edt.cours[p.coursId].d, edt.cours[p.coursId].f, c.d, c.f) && coursALieu(C, edt, edt.cours[p.coursId], iso));
    if (autre && !premierPris) premierPris = { iso, p: autre };
    if (a.reunion && a.reunion.jour === c.j && RE_HEURE.test(a.reunion.debut || '') && chevauche(a.reunion.debut, a.reunion.fin, c.d, c.f) && !premiereReu) premiereReu = { iso };
    const inst = I.reunions.find(r => r.date === iso && chevauche(r.debut, r.fin, c.d, c.f));
    if (inst && !premiereReu) premiereReu = { iso, inst };
  }
  if (premierPris) {
    const oc = edt.cours[premierPris.p.coursId];
    const lieu = premierPris.p.pole !== pole ? (ctx.nomPole ? ctx.nomPole(premierPris.p.pole) : premierPris.p.pole) : (oc.cls || []).map(n => n.replace(/^(C[12]|B[12T])/, '$1 ')).join(' / ');
    return { etat: 'pris', texte: `pris · ${lieu}`, detail: `${dateCourte(premierPris.iso)} : ${oc.lib || oc.mat}`, deja };
  }
  if (premierAbs && premierAbs.iso <= du && premierAbs.ab.au >= au) return { etat: 'absent', texte: MOTIFS[premierAbs.ab.motif] || 'absent', deja };
  if (premiereReu) return { etat: 'reunion', texte: premiereReu.inst ? 'réunion instit.' : 'réunion', detail: dateCourte(premiereReu.iso), deja };
  if (!deja) {
    const l = lundiDe(du > isoAujourdhui(ctx) ? du : isoAujourdhui(ctx));
    const b = bilan(ctx, aeshId, C.semaine(l).toute ? lundisEntre(C, l, au)[0] || l : l);
    const h = duree(c.d, c.f), prevu = +((a.heures || {})[pole]);
    if (b && b.contrat != null && b.total + h > b.contrat + 1e-9) return { etat: 'trop', texte: 'plus d’heures', deja };
    if (b && Number.isFinite(prevu) && (b.parPole[pole] || 0) + h > prevu + 1e-9) return { etat: 'trop', texte: 'heures du pôle atteintes', deja };
    if (premierAbs) return { etat: 'libre', texte: `libre · absent le ${jjmm(premierAbs.iso)}`, deja };
  }
  return { etat: 'libre', texte: deja ? 'placé' : 'libre', deja };
}
const isoAujourdhui = ctx => ctx.aujourdhui || isoLocal();

/* ─────────────── besoins estimés ─────────────── */
/* Associe une estimation (document « cours » de coordination_estimation_aesh) à un cours de l'emploi du temps. */
const JOURS_EST = ['lun', 'mar', 'mer', 'jeu', 'ven'];
export function besoinDuCours(estimations, classe, cours) {
  const par = cours.sem === 'SA' ? 'A' : cours.sem === 'SB' ? 'B' : '';
  const l = (estimations || []).filter(e => e.classe === classe && e.statut === 'active' && JOURS_EST.indexOf(e.jour) === cours.j
    && RE_HEURE.test(e.debut || '') && chevauche(e.debut, e.fin, cours.d, cours.f) && (!e.parite || !par || e.parite === par));
  if (!l.length) return null;
  const exact = l.filter(e => e.debut === cours.d && e.fin === cours.f);
  const src = exact.length ? exact : l;
  return src.reduce((m, e) => (!m || e.nb > m.nb ? e : m), null);
}

/* ─────────────── sigles ─────────────── */
export const normSigle = s => String(s || '').normalize('NFC').replace(/[^A-Za-zÀ-ÖØ-öø-ÿ·.\- ]/g, '').replace(/\s+/g, ' ').trim().toUpperCase().slice(0, 6);
export const cleSigle = s => normSigle(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[·.\- ]/g, '');

/* ─────────────── disponibilités ─────────────── */
const PLAGES = [['matin', '08:30', '12:30'], ['après-midi', '14:00', '18:00']];
/* Demi-journées libres d'un AESH sur une semaine réelle (aucune occupation qui les chevauche). */
export function plagesLibres(ctx, aeshId, lundi) {
  const occ = occupations(ctx, aeshId, lundi), sem = ctx.C.semaine(lundi), out = [];
  sem.jours.forEach((jr, j) => {
    if (jr.off) return;
    PLAGES.forEach(([lib, d, f]) => { if (!occ.some(o => o.j === j && o.type !== 'vacances' && chevauche(o.debut, o.fin, d, f))) out.push({ j, plage: lib, debut: d, fin: f, texte: `${JOURS_C[j]} ${lib}` }); });
  });
  return out;
}
/* AESH des autres pôles qui ont des heures disponibles : solde de répartition > 0, ou pôle « complet » et heures placées < heures déclarées. */
export function disponiblesAilleurs(ctx, pole, lundi, poleComplet) {
  return aeshActifs(ctx.I).filter(a => !(a.equipes || {})[pole]).map(a => {
    const rep = repartition(a, ctx.nomPole), b = bilan(ctx, a.id, lundi), poles = Object.keys(a.equipes || {});
    const complets = poles.map(p => ({ p, complet: poleComplet ? poleComplet(p) : null }));
    const nonPlace = poles.reduce((s, p) => s + Math.max(0, (rep.parPole[p] || 0) - (b.parPole[p] || 0)), 0);
    const fiable = complets.length > 0 && complets.every(x => x.complet);
    const dispo = (rep.solde != null && rep.solde > 1e-9 ? rep.solde : 0) + (fiable ? nonPlace : 0);
    return { a, rep, b, dispo, soldeRep: rep.solde, nonPlace, fiable, complets, libres: plagesLibres(ctx, a.id, lundi) };
  }).filter(x => x.dispo > 1e-9).sort((x, y) => y.dispo - x.dispo);
}
