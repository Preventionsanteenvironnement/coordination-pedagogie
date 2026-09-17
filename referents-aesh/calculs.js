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
const nombreOk = (v, max = 45) => { const n = Number(v); return v === null || v === undefined || v === '' ? null : Number.isFinite(n) && n >= 0 && n <= max ? n : null; };
/* Une fiche AESH venue du réseau est vérifiée champ par champ : un document abîmé ne fait pas tomber l'écran. */
export function normaliserAesh(d, polesAutorises, cat) {
  const ok = q => !polesAutorises || polesAutorises.includes(q);
  const equipes = {}, heures = {};
  Object.entries(d.equipes && typeof d.equipes === 'object' ? d.equipes : {}).forEach(([q, v]) => { if (ok(q)) equipes[q] = Number.isFinite(+v) ? +v : 1; });
  Object.entries(d.heures && typeof d.heures === 'object' ? d.heures : {}).forEach(([q, v]) => { if (ok(q) && nombreOk(v) != null) heures[q] = nombreOk(v); });
  const r = d.reunion && typeof d.reunion === 'object' && Number.isInteger(+d.reunion.jour) && +d.reunion.jour >= 0 && +d.reunion.jour <= 4 && RE_HEURE.test(d.reunion.debut || '') && RE_HEURE.test(d.reunion.fin || '') ? { jour: +d.reunion.jour, debut: d.reunion.debut, fin: d.reunion.fin } : null;
  const out = { ...d, sigle: String(d.sigle || '?').slice(0, 6), equipes, heures, contrat: nombreOk(d.contrat), reunion: r, actif: d.actif !== false,
    services: Array.isArray(d.services) ? d.services.filter(x => x && typeof x === 'object' && nombreOk(x.h) > 0).map(x => ({ nom: String(x.nom || 'Service').slice(0, 40), h: nombreOk(x.h),
      jours: Array.isArray(x.jours) ? [...new Set(x.jours.map(Number).filter(j => Number.isInteger(j) && j >= 0 && j <= 4))].sort() : [] })) : undefined,
    jours: Array.isArray(d.jours) ? d.jours.map(Number).filter(j => Number.isInteger(j) && j >= 0 && j <= 4) : undefined };
  if (out.services === undefined) delete out.services; if (out.jours === undefined) delete out.jours;
  ['cantine', 'internat', 'service'].forEach(k => { if (k in out) out[k] = nombreOk(out[k]) || 0; });
  if (d.filieres !== undefined) out.filieres = normaliserFilieres(d.filieres, cat);
  if (d.dispos !== undefined) out.dispos = disposDe({ dispos: d.dispos });
  if (d.auteurs && typeof d.auteurs === 'object') { const au = {}; ['contrat', 'presence', 'reunion'].forEach(k => { if (ok(d.auteurs[k])) au[k] = d.auteurs[k]; }); out.auteurs = au; }
  if (d.finContrat !== undefined) out.finContrat = RE_DATE.test(d.finContrat || '') ? d.finContrat : '';
  if (d.presence !== undefined) out.presence = nombreOk(d.presence);
  if (d.reunionH !== undefined) out.reunionH = nombreOk(d.reunionH, 20);
  if (d.rattachement !== undefined) out.rattachement = ok(d.rattachement) ? d.rattachement : undefined;
  if (out.rattachement === undefined) delete out.rattachement;
  return out;
}

/* ─── filières d'intervention (17/09/2026, demande de Brahim) ───
   PSR et MELEC sont deux filières d'un même pôle ; un AESH peut intervenir dans plusieurs filières,
   et dans chacune soit partout (« tous les niveaux »), soit dans certaines classes seulement.
       a.filieres = { MELEC: { classes: ['B1MELEC','BTMELEC'] ou null }, VAN: { classes: null } }
       a.rattachement = pôle de l'équipe qui le gère (réunion d'équipe).
   Le volume d'heures reste porté par le pôle (a.heures), comme avant : la page Besoins, les exports
   et la vue de l'Atelier le lisent. Les filières disent OÙ il intervient, pas combien d'heures.
   « cat » est le catalogue des filières : [{ id, pole, classes: [...] }]. */
export function normaliserFilieres(d, cat) {
  const out = {};
  Object.entries(d && typeof d === 'object' ? d : {}).forEach(([id, v]) => {
    const f = cat ? cat.find(x => x.id === id) : null;
    if ((cat && !f) || !v || typeof v !== 'object') return;
    let cl = Array.isArray(v.classes) ? v.classes.filter(n => typeof n === 'string' && (!f || f.classes.includes(n))) : null;
    if (cl && (!cl.length || (f && cl.length === f.classes.length))) cl = null;   /* toutes les classes = tous les niveaux */
    out[id] = { classes: cl, h: nombreOk(v.h) };
  });
  return out;
}
export const filieresDe = a => a && a.filieres && typeof a.filieres === 'object' && Object.keys(a.filieres).length ? a.filieres : null;
/* Pôles où l'AESH intervient, déduits de ses filières. Le pôle de rattachement en fait toujours partie. */
export function polesDesFilieres(a, cat, rattachement) {
  const fl = filieresDe(a) || {}, equipes = {};
  Object.keys(fl).forEach(id => { const f = cat.find(x => x.id === id); if (f) equipes[f.pole] = 1; });
  if (rattachement) equipes[rattachement] = 1;
  return equipes;
}
/* Heures d'un pôle, calculées à partir de ses filières. null si aucune filière de ce pôle n'a d'heures :
   dans ce cas, le total déjà saisi pour le pôle reste en place (on ne perd rien d'une fiche d'avant). */
export function heuresDuPole(a, cat, pid) {
  const fl = filieresDe(a) || {}; let somme = null;
  Object.entries(fl).forEach(([id, v]) => {
    const f = cat.find(x => x.id === id); if (!f || f.pole !== pid) return;
    const brut = v && v.h; if (brut === null || brut === undefined || brut === '') return;   /* pas saisi ≠ zéro */
    const h = Number(brut); if (Number.isFinite(h)) somme = Math.round(((somme || 0) + h) * 100) / 100;
  });
  return somme;
}
/* Les filières déclarées dans un pôle donné. */
export const filieresDuPoleDe = (a, cat, pid) => Object.keys(filieresDe(a) || {}).map(id => cat.find(x => x.id === id)).filter(f => f && f.pole === pid);
/* Cet AESH est-il prévu pour cette classe ? Une fiche sans filières déclarées ne dit rien (connu: false). */
export function prevuPourClasse(a, cat, classe) {
  const f = cat.find(x => x.classes.includes(classe)), fl = filieresDe(a);
  if (!f || !fl) return { connu: false, prevu: false, filiere: f || null, classes: null };
  const v = fl[f.id];
  if (!v) return { connu: true, prevu: false, filiere: f, classes: null, filiereAbsente: true };
  const cl = Array.isArray(v.classes) && v.classes.length ? v.classes : null;
  return { connu: true, prevu: !cl || cl.includes(classe), filiere: f, classes: cl, filiereAbsente: false };
}
/* Heures de réunion par semaine : saisies par le référent (1 h tant qu'il n'a rien changé). */
export const heuresReunion = a => Number.isFinite(+(a || {}).reunionH) ? +a.reunionH : 1;
/* Fin de contrat d'un AESH : après cette date, il n'est plus là. Vide = toute l'année. */
export const finContratDe = a => a && RE_DATE.test(a.finContrat || '') ? a.finContrat : '';
export const contratFini = (a, iso) => { const f = finContratDe(a); return !!f && f < iso; };
/* Présence élève : les heures en classe. Saisie par le référent ; pour une fiche d'avant, on la déduit du contrat. */
export function presenceEleve(a) {
  if (Number.isFinite(+a.presence) && a.presence !== null && a.presence !== '') return +a.presence;
  const c = Number.isFinite(+a.contrat) && a.contrat !== null && a.contrat !== '' ? +a.contrat : null;
  return c == null ? null : Math.round((c - totalServices(a) - heuresReunion(a)) * 100) / 100;
}
/* Contrat = présence élève + réunion + services ? Sinon, on le signale (on ne corrige rien tout seul). */
export function ecartContrat(a) {
  const c = Number.isFinite(+a.contrat) && a.contrat !== null && a.contrat !== '' ? +a.contrat : null;
  const p = presenceEleve(a);
  if (c == null || p == null) return null;
  const services = totalServices(a), reunion = heuresReunion(a);
  const somme = Math.round((p + reunion + services) * 100) / 100;
  return { contrat: c, presence: p, reunion, services, somme, ecart: Math.round((somme - c) * 100) / 100 };
}

export function indexer(docs, depart, polesAutorises, cat) {
  const aesh = new Map(), places = [], absences = [], messages = [], reunions = [], poles = new Map();
  (depart || []).forEach(a => aesh.set(a.id, { ...a, depart: true }));
  (docs || []).forEach(d => {
    if (!d || !d.type) return;
    if (d.type === 'aesh') { if (typeof d.id !== 'string') return; aesh.set(d.id, normaliserAesh({ ...(aesh.get(d.id) || {}), ...d, depart: false }, polesAutorises, cat)); }
    else if (d.type === 'place' && d.statut === 'active' && typeof d.aeshId === 'string' && typeof d.coursId === 'string' && RE_DATE.test(d.du || '') && RE_DATE.test(d.au || '') && d.au >= d.du && Number.isInteger(+d.jour)) places.push({ ...d, jour: +d.jour });
    else if (d.type === 'absence' && d.statut === 'active' && typeof d.aeshId === 'string' && RE_DATE.test(d.du || '') && RE_DATE.test(d.au || '') && d.au >= d.du) absences.push(d.journee === false && !(RE_HEURE.test(d.debut || '') && RE_HEURE.test(d.fin || '')) ? { ...d, journee: true } : d);
    else if (d.type === 'message') messages.push(d);
    else if (d.type === 'reunion' && d.statut === 'active' && RE_DATE.test(d.date || '') && RE_HEURE.test(d.debut || '') && RE_HEURE.test(d.fin || '')) reunions.push(d);
    else if (d.type === 'pole') poles.set(d.pole, d);
  });
  messages.sort((a, b) => String(a.creeLe || '').localeCompare(String(b.creeLe || '')));
  return { aesh, places, absences, messages, reunions, poles };
}
export const aeshActifs = (I, pole) => [...I.aesh.values()].filter(a => a.actif !== false && (!pole || (a.equipes && a.equipes[pole] != null)))
  .sort((a, b) => String(a.sigle).localeCompare(String(b.sigle), 'fr'));

export const absentLe = (I, aeshId, iso, debut, fin) => I.absences.find(x => x.aeshId === aeshId && iso >= x.du && iso <= x.au
  && (x.journee !== false || !debut || chevauche(x.debut, x.fin, debut, fin))) || null;

/* Horaire réel d'un placement : une partie du cours si le référent l'a limité (ex. 1 h sur un bloc de 3 h), sinon tout le cours. */
export function horairePlace(p, c) {
  if (p && RE_HEURE.test(p.debut || '') && RE_HEURE.test(p.fin || '') && min(p.debut) >= min(c.d) && min(p.fin) <= min(c.f) && min(p.fin) > min(p.debut) && (p.debut !== c.d || p.fin !== c.f)) return { debut: p.debut, fin: p.fin, partiel: true };
  return { debut: c.d, fin: c.f, partiel: false };
}
/* ─────────────── occupations d'une semaine ─────────────── */
/* Toutes les occupations d'un AESH sur une semaine réelle : cours, réunion d'équipe, réunions institutionnelles, absences. */
export function occupations(ctx, aeshId, lundi) {
  const { C, edt, I } = ctx, a = I.aesh.get(aeshId), out = [];
  const sem = C.semaine(lundi);
  sem.jours.forEach((jr, j) => {
    const iso = jr.date;
    if (jr.off) { out.push({ j, date: iso, type: 'vacances', debut: '08:00', fin: '18:00', label: jr.off }); return; }
    if (a && !joursDe(a).includes(j) && !I.places.some(p => p.aeshId === aeshId && p.jour === j && iso >= p.du && iso <= p.au))
      { out.push({ j, date: iso, type: 'repos', debut: '08:00', fin: '18:00', label: 'Ne travaille pas' }); return; }
    const vus = new Set();
    I.places.forEach(p => {
      if (p.aeshId !== aeshId || p.jour !== j || iso < p.du || iso > p.au) return;
      const c = edt.cours[p.coursId]; if (!c || vus.has(p.coursId)) return;
      if (!coursALieu(C, edt, c, iso)) return;
      vus.add(p.coursId);
      const hp = horairePlace(p, c), ab = absentLe(I, aeshId, iso, hp.debut, hp.fin);
      /* Absence sur une partie du cours : les heures faites restent comptées, seule la partie manquante est « à couvrir ». */
      let manque = 0;
      if (ab) manque = ab.journee === false ? Math.max(0, (Math.min(min(ab.fin), min(hp.fin)) - Math.max(min(ab.debut), min(hp.debut))) / 60) : duree(hp.debut, hp.fin);
      out.push({ j, date: iso, type: 'cours', debut: hp.debut, fin: hp.fin, horairePartiel: hp.partiel, cours: c, place: p, pole: p.pole, absent: !!ab && manque >= duree(hp.debut, hp.fin) - 1e-9, partiel: !!ab && manque < duree(hp.debut, hp.fin) - 1e-9 ? manque : 0, absence: ab });
    });
    if (a && a.reunion && RE_HEURE.test(a.reunion.debut || '') && a.reunion.jour === j && !institutionCetteSemaine(I, lundi) && !absentLe(I, aeshId, iso, a.reunion.debut, a.reunion.fin))
      out.push({ j, date: iso, type: 'reunion', debut: a.reunion.debut, fin: a.reunion.fin, label: 'Réunion d’équipe' });
    I.reunions.forEach(r => { if (r.date === iso) out.push({ j, date: iso, type: 'institution', debut: r.debut, fin: r.fin, label: r.libelle || 'Réunion institutionnelle' }); });
    I.absences.forEach(x => { if (x.aeshId === aeshId && iso >= x.du && iso <= x.au) out.push({ j, date: iso, type: 'absence', debut: x.journee === false ? x.debut : '08:00', fin: x.journee === false ? x.fin : '18:00', label: MOTIFS[x.motif] || 'Absence', absence: x }); });
  });
  return out.sort((x, y) => x.j - y.j || min(x.debut) - min(y.debut));
}
export const MOTIFS = { conge: 'Congé', formation: 'Formation', arret: 'Arrêt', autre: 'Absence' };
/* Une réunion institutionnelle cette semaine-là remplace la réunion d'équipe de chacun. */
export const institutionCetteSemaine = (I, lundi) => I.reunions.some(r => lundiDe(r.date) === lundi);

/* Services d'un AESH : liste {nom, h}. Les anciennes fiches (cantine / internat / service) sont lues telles quelles. */
export function servicesDe(a) {
  const jours = x => Array.isArray(x.jours) ? [...new Set(x.jours.map(Number).filter(j => Number.isInteger(j) && j >= 0 && j <= 4))].sort() : [];
  if (Array.isArray(a.services)) return a.services.filter(x => x && Number.isFinite(+x.h) && +x.h > 0).map(x => ({ nom: String(x.nom || 'Service'), h: +x.h, jours: jours(x) }));
  return [['Cantine', a.cantine], ['Internat', a.internat], [a.serviceLib || 'Autre service', a.service]].filter(([, h]) => +h > 0).map(([nom, h]) => ({ nom, h: +h, jours: [] }));
}
/* Cet AESH assure-t-il ce service ce jour-là ? (les jours sont saisis dans le bandeau sous la grille ou sur sa fiche) */
export const faitService = (a, nom, j) => servicesDe(a).some(x => x.nom === nom && x.jours.includes(j));
/* Qui assure ce service ce jour-là, tous pôles confondus. */
export const auService = (I, nom, j) => [...I.aesh.values()].filter(a => a.actif !== false && faitService(a, nom, j))
  .sort((x, y) => String(x.sigle).localeCompare(String(y.sigle), 'fr'));
export const totalServices = a => servicesDe(a).reduce((s, x) => s + x.h, 0);
/* ─── disponibilités par demi-journée (17/09/2026, demande de Brahim) ───
   a.dispos = { '3M': 'x', '3A': 'x', '2A': 's' }   (jour 0–4 + M/A)
     'x' = indisponible, fixé au contrat : avertissement ROUGE, mais le placement reste possible ;
     's' = souhait de l'AESH : avertissement ORANGE.
   Rien n'interdit : c'est le référent qui tranche. Une fiche d'avant, où des jours étaient décochés,
   se lit « indisponible toute la journée » — sans rien deviner de plus. */
export const DEMIS = [['M', 'matin', '08:30', '12:30'], ['A', 'après-midi', '14:00', '18:00']];
export function disposDe(a) {
  const out = {};
  const d = a && a.dispos && typeof a.dispos === 'object' ? a.dispos : null;
  if (d) {
    Object.entries(d).forEach(([k, v]) => { if (/^[0-4][MA]$/.test(k) && (v === 'x' || v === 's')) out[k] = v; });
    return out;
  }
  if (Array.isArray(a.jours) && a.jours.length) {
    const ok = a.jours.map(Number);
    [0, 1, 2, 3, 4].forEach(j => { if (!ok.includes(j)) DEMIS.forEach(([c]) => { out[j + c] = 'x'; }); });
  }
  return out;
}
export const etatDemi = (a, j, code) => disposDe(a)[j + code] || '';
/* Ce que dit la fiche pour un créneau : rien, un souhait, ou une indisponibilité (la plus forte l'emporte). */
export function contrainteCreneau(a, j, debut, fin) {
  const dp = disposDe(a); let etat = '', plages = [];
  DEMIS.forEach(([code, lib, d, f]) => {
    const e = dp[j + code]; if (!e) return;
    if (!debut || chevauche(d, f, debut, fin)) { plages.push(lib); if (e === 'x' || etat !== 'x') etat = e === 'x' ? 'x' : (etat || 's'); }
  });
  if (!etat) return null;
  const quand = plages.length === 2 ? JOURS[j].toLowerCase() : `${JOURS[j].toLowerCase()} ${plages[0]}`;
  return etat === 'x'
    ? { etat: 'x', texte: `indisponible ${quand} (contrat)` }
    : { etat: 's', texte: `souhaite ne pas travailler ${quand}` };
}
/* Jours de présence (0 = lundi … 4 = vendredi) : ceux où il n'est pas indisponible toute la journée. */
export const joursDe = a => [0, 1, 2, 3, 4].filter(j => { const dp = disposDe(a); return !(dp[j + 'M'] === 'x' && dp[j + 'A'] === 'x'); });

/* Répartition d'un AESH entre les pôles (indépendante de la semaine) : contrat − heures déclarées par pôle − services − réunion. */
export function repartition(a, nomPole) {
  const contrat = Number.isFinite(+a.contrat) && a.contrat !== null && a.contrat !== '' ? +a.contrat : null;
  const parPole = {}; Object.keys(a.equipes || {}).forEach(p => { const h = +((a.heures || {})[p]); if (Number.isFinite(h)) parPole[p] = h; });
  const services = totalServices(a), reunion = heuresReunion(a);
  const declare = Object.values(parPole).reduce((s, v) => s + v, 0), somme = declare + services + reunion;
  const solde = contrat == null ? null : contrat - somme;
  const nom = p => nomPole ? nomPole(p) : p;
  const parts = Object.entries(parPole).map(([p, h]) => `${nom(p)} ${fmtH(h)}`);
  servicesDe(a).forEach(x => parts.push(`${x.nom.toLowerCase()} ${fmtH(x.h)}`)); if (reunion) parts.push(`réunion ${fmtH(reunion)}`);
  const texte = contrat == null ? 'contrat à compléter' : solde < -1e-9 ? `${parts.join(' + ')} = ${fmtH(somme)}, pour un contrat de ${fmtH(contrat)} : ${fmtH(-solde)} de trop` : solde > 1e-9 ? `${fmtH(solde)} disponibles sur un contrat de ${fmtH(contrat)}` : `contrat de ${fmtH(contrat)} entièrement réparti`;
  return { contrat, parPole, services, reunion, declare, somme, solde, texte, poles: Object.keys(parPole).filter(p => parPole[p] > 0) };
}

/* Bilan d'un AESH pour une semaine réelle. */
export function bilan(ctx, aeshId, lundi) {
  const { I, C } = ctx, a = I.aesh.get(aeshId); if (!a) return null;
  const occ = occupations(ctx, aeshId, lundi), sem = C.semaine(lundi);
  const joursTravail = sem.jours.filter((j, i) => !j.off && joursDe(a).includes(i)).length;
  const parPole = {}; let cours = 0, coursCouvrir = 0;
  occ.forEach(o => {
    if (o.type !== 'cours') return;
    const h = duree(o.debut, o.fin);
    if (o.absent) { coursCouvrir++; return; }
    if (o.partiel) coursCouvrir++;
    const fait = h - (o.partiel || 0);
    cours += fait; parPole[o.pole] = (parPole[o.pole] || 0) + fait;
  });
  const ratio = joursTravail / 5;
  const services = totalServices(a) * ratio;
  /* La réunion d'équipe, telle que le référent l'a saisie : la réunion institutionnelle la remplace cette semaine-là. */
  const reunion = joursTravail ? heuresReunion(a) : 0;
  const total = cours + services + reunion;
  const contrat = Number.isFinite(+a.contrat) && a.contrat !== null && a.contrat !== '' ? +a.contrat : null;
  const prevuPoles = a.heures || {};
  const alertes = [];
  if (contrat != null && total > contrat + 1e-9) alertes.push({ type: 'contrat', texte: `${fmtH(total)} pour un contrat de ${fmtH(contrat)}` });
  const rep = repartition(a, ctx.nomPole);
  if (rep.solde != null && rep.solde < -1e-9) alertes.push({ type: 'repartition', texte: rep.texte, poles: rep.poles, solde: rep.solde });
  Object.keys(parPole).forEach(p => { const pr = +prevuPoles[p]; if (Number.isFinite(pr) && parPole[p] > pr + 1e-9) alertes.push({ type: 'pole', pole: p, texte: `${fmtH(parPole[p])} placées pour ${fmtH(pr)} prévues` }); });
  conflits(occ, ctx.nomPole).forEach(c => alertes.push({ type: 'conflit', texte: c.texte, j: c.j, poles: c.poles, cours: c.cours }));
  if (coursCouvrir) alertes.push({ type: 'couvrir', texte: `${coursCouvrir} cours à couvrir (absence${occ.some(o => o.partiel) ? ', en partie' : ''})` });
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
  const contrainte = contrainteCreneau(a, c.j, c.d, c.f);
  const deja = I.places.some(p => p.aeshId === aeshId && p.coursId === coursId && p.au >= du && p.du <= au);
  let premierPris = null, premierAbs = null, premiereReu = null, nbSem = 0, nbAbs = 0, premierTrop = null;
  const h = duree(c.d, c.f), prevu = +((a.heures || {})[pole]);
  for (const l of lundisEntre(C, du, au)) {
    const iso = ajoute(l, c.j); if (iso < du || iso > au || !coursALieu(C, edt, c, iso)) continue;
    nbSem++;
    const ab = absentLe(I, aeshId, iso, c.d, c.f);
    if (ab) { nbAbs++; if (!premierAbs) premierAbs = { iso, ab }; }
    /* I09 : la capacité est vérifiée pour chaque semaine où le cours a lieu, pas seulement la première. */
    if (!deja && !premierTrop) {
      const b = bilan(ctx, aeshId, l);
      if (b && b.contrat != null && b.total + h > b.contrat + 1e-9) premierTrop = { iso, texte: 'plus d’heures', detail: `dépasserait le contrat la semaine du ${dateCourte(l)}` };
      else if (b && Number.isFinite(prevu) && (b.parPole[pole] || 0) + h > prevu + 1e-9) premierTrop = { iso, texte: 'heures du pôle atteintes', detail: `semaine du ${dateCourte(l)}` };
    }
    const autre = I.places.find(p => p.aeshId === aeshId && p.coursId !== coursId && p.jour === c.j && iso >= p.du && iso <= p.au
      && edt.cours[p.coursId] && (hp => chevauche(hp.debut, hp.fin, c.d, c.f))(horairePlace(p, edt.cours[p.coursId])) && coursALieu(C, edt, edt.cours[p.coursId], iso));
    if (autre && !premierPris) premierPris = { iso, p: autre };
    if (a.reunion && a.reunion.jour === c.j && RE_HEURE.test(a.reunion.debut || '') && chevauche(a.reunion.debut, a.reunion.fin, c.d, c.f) && !institutionCetteSemaine(I, l) && !premiereReu) premiereReu = { iso };
    const inst = I.reunions.find(r => r.date === iso && chevauche(r.debut, r.fin, c.d, c.f));
    if (inst && !premiereReu) premiereReu = { iso, inst };
  }
  if (premierPris) {
    const oc = edt.cours[premierPris.p.coursId];
    const lieu = premierPris.p.pole !== pole ? (ctx.nomPole ? ctx.nomPole(premierPris.p.pole) : premierPris.p.pole) : (oc.cls || []).map(n => n.replace(/^(C[12]|B[12T])/, '$1 ')).join(' / ');
    return { etat: 'pris', contrainte, texte: `pris · ${lieu}`, detail: `${dateCourte(premierPris.iso)} : ${oc.lib || oc.mat}`, deja };
  }
  if (nbSem === 0) return { etat: 'aucun', contrainte, texte: 'pas de cours sur cette période', deja };
  if (nbAbs === nbSem) return { etat: 'absent', contrainte, texte: MOTIFS[premierAbs.ab.motif] || 'absent', deja };
  if (premiereReu) return { etat: 'reunion', contrainte, texte: premiereReu.inst ? 'réunion instit.' : 'réunion', detail: dateCourte(premiereReu.iso), deja };
  if (premierTrop) return { etat: 'trop', contrainte, texte: premierTrop.texte, detail: premierTrop.detail, deja };
  if (!deja && premierAbs) return { etat: 'libre', contrainte, texte: `libre · absent ${nbAbs} fois (${jjmm(premierAbs.iso)}…)`, deja };
  return { etat: 'libre', contrainte, texte: contrainte ? contrainte.texte : (deja ? 'placé' : 'libre'), deja };
}

/* ─────────────── besoins estimés ─────────────── */
/* Associe une estimation (document « cours » de coordination_estimation_aesh) à un cours de l'emploi du temps. */
const JOURS_EST = ['lun', 'mar', 'mer', 'jeu', 'ven'];
export function besoinDuCours(estimations, classe, cours) {
  const par = cours.sem === 'SA' ? 'A' : cours.sem === 'SB' ? 'B' : '';
  const l = (estimations || []).filter(e => (e.classe === classe || (cours.cls || []).includes(e.classe)) && e.statut === 'active' && JOURS_EST.indexOf(e.jour) === cours.j
    && RE_HEURE.test(e.debut || '') && chevauche(e.debut, e.fin, cours.d, cours.f) && (!e.parite || !par || e.parite === par));
  if (!l.length) return null;
  const exact = l.filter(e => e.debut === cours.d && e.fin === cours.f);
  const src = exact.length ? exact : l;
  /* Un cours = une demande : si plusieurs estimations existent (deux classes réunies), on garde la plus récente. */
  return src.reduce((m, e) => (!m || String(e.majLe || '') > String(m.majLe || '') ? e : m), null);
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
    let dispo = (rep.solde != null ? rep.solde : 0) + (fiable ? nonPlace : 0);
    if (b.reste != null) dispo = Math.min(dispo, b.reste);
    return { a, rep, b, dispo, soldeRep: rep.solde, nonPlace, fiable, complets, libres: plagesLibres(ctx, a.id, lundi) };
  }).filter(x => x.dispo > 1e-9).sort((x, y) => y.dispo - x.dispo);
}

/* ─────────────── PFMP : AESH libérés, et où les redéployer ─────────────── */
/* Demande du référent de pôle, portée par Brahim le 17/09/2026. Pendant la PFMP d'une classe, ses cours n'ont
   pas lieu : les AESH qui y étaient placés sont libres sur ces créneaux. Le référent doit les VOIR, et pouvoir
   les envoyer ailleurs — n'importe quelle classe, n'importe quel pôle — pour la semaine ou toute la PFMP.
   Le moteur savait déjà les libérer (occupations et disponibilite ignorent un cours qui n'a pas lieu) ;
   ces deux fonctions servent l'écran qui les montre et le geste qui les déplace. */

/* La période de PFMP de la classe qui touche la semaine du lundi donné (la première, s'il y en a plusieurs). */
export function pfmpDeLaSemaine(classe, lundi) {
  const ven = ajoute(lundi, 4);
  return (classe && classe.pfmp || []).find(p => p.debut <= ven && p.fin >= lundi) || null;
}

/* AESH placés sur des cours de la classe qui n'ont pas lieu cette semaine À CAUSE de sa PFMP.
   Un cours commun avec une classe qui n'est pas en stage a toujours lieu : l'AESH y reste pris, il n'est pas libéré. */
export function liberesParPfmp(ctx, nomClasse, lundi) {
  const { C, edt, I } = ctx, k = edt.classes[nomClasse];
  if (!k) return [];
  const sem = C.semaine(lundi), parAesh = new Map();
  sem.jours.forEach((jr, j) => {
    const iso = jr.date;
    if (jr.off || !enPfmp(k, iso)) return;
    I.places.forEach(p => {
      if (p.jour !== j || iso < p.du || iso > p.au) return;
      const c = edt.cours[p.coursId];
      if (!c || !(c.cls || []).includes(nomClasse) || !C.coursSemaine(c, lundi)) return;
      if (coursALieu(C, edt, c, iso)) return;
      const a = I.aesh.get(p.aeshId);
      if (!a || a.actif === false) return;
      const hp = horairePlace(p, c), e = parAesh.get(a.id) || { a, creneaux: [], heures: 0 };
      if (!e.creneaux.some(x => x.j === j && x.cours.id === c.id)) {
        e.creneaux.push({ j, date: iso, debut: hp.debut, fin: hp.fin, cours: c });
        e.heures += duree(hp.debut, hp.fin);
      }
      parAesh.set(a.id, e);
    });
  });
  return [...parAesh.values()]
    .map(e => ({ ...e, creneaux: e.creneaux.sort((x, y) => x.j - y.j || min(x.debut) - min(y.debut)) }))
    .sort((x, y) => String(x.a.sigle).localeCompare(String(y.a.sigle), 'fr'));
}

/* Cet AESH est-il libéré par une PFMP sur ce créneau ? Renvoie la classe en stage, ou ''.
   Sert aux AUTRES référents : pendant le stage d'une classe, son AESH est disponible ailleurs. */
export function liberePfmpCreneau(ctx, aeshId, lundi, j, debut, fin) {
  const { C, edt, I } = ctx, iso = ajoute(lundi, j);
  if (C.off(iso)) return '';
  let libere = '';
  I.places.forEach(p => {
    if (libere || p.aeshId !== aeshId || p.jour !== j || iso < p.du || iso > p.au) return;
    const c = edt.cours[p.coursId]; if (!c || !C.coursSemaine(c, lundi)) return;
    const hp = horairePlace(p, c);
    if (!chevauche(hp.debut, hp.fin, debut, fin)) return;
    if (coursALieu(C, edt, c, iso)) return;                     /* le cours a lieu : il n'est pas libéré */
    const enStage = (c.cls || []).find(n => edt.classes[n] && enPfmp(edt.classes[n], iso));
    if (enStage) libere = enStage;
  });
  return libere;
}

/* Les cours des classes données qui ont lieu au moins une fois entre du et au, avec l'état de l'AESH pour chacun
   (libre, pris, réunion, absent, plus d'heures) — le même verdict que « Qui accompagne ? ». Un cours commun à
   plusieurs classes n'apparaît qu'une fois. */
export function coursPossibles(ctx, aeshId, classes, du, au, pole) {
  const { C, edt } = ctx, vus = new Set(), out = [];
  (classes || []).forEach(nom => {
    const k = edt.classes[nom];
    (k && k.cours || []).forEach(id => {
      const c = edt.cours[id];
      if (!c || vus.has(c.id)) return;
      vus.add(c.id);
      const aLieu = lundisEntre(C, du, au).some(l => { const iso = ajoute(l, c.j); return iso >= du && iso <= au && C.coursSemaine(c, l) && coursALieu(C, edt, c, iso); });
      if (!aLieu) return;
      out.push({ c, classe: nom, d: disponibilite(ctx, aeshId, c.id, du, au, pole) });
    });
  });
  return out.sort((x, y) => x.c.j - y.c.j || min(x.c.d) - min(y.c.d));
}
