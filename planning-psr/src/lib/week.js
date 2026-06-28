// Logique Semaine A / B — alternance qui SAUTE les vacances (convention courante :
// on ne compte que les semaines de classe). Détecte aussi vacances / hors-année.
// Le navigateur a accès à la vraie date.

// Parse une date 'YYYY-MM-DD' en date locale (évite les décalages de fuseau).
export function parseISO(s) {
  if (s instanceof Date) return s;
  const [y, m, d] = String(s).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

// Lundi (00:00) de la semaine contenant `d`.
export function mondayOf(d) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // 0 = lundi
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

// La semaine commençant au lundi M est-elle une semaine de vacances ?
// debut = samedi (fin des cours la veille), reprise = lundi matin.
export function vacancesDe(config, M) {
  const list = config?.calendrier?.vacances || [];
  for (const v of list) {
    if (M > parseISO(v.debut) && M < parseISO(v.reprise)) return v;
  }
  return null;
}

// Statut de la semaine contenant `date` :
//  { status:'ecole', parity:'A'|'B' } | { status:'vacances', nom } |
//  { status:'avant' } | { status:'apres' }
export function weekStatus(config, date = new Date()) {
  const sem = config.semaine;
  const M = mondayOf(date);
  const anchor = mondayOf(parseISO(sem.anchorMonday));
  const cal = config.calendrier || {};

  if (M < anchor) return { status: 'avant' };
  if (cal.finAnnee && M >= mondayOf(parseISO(cal.finAnnee))) {
    const v = vacancesDe(config, M);
    return v ? { status: 'vacances', nom: v.nom } : { status: 'apres' };
  }
  const vac = vacancesDe(config, M);
  if (vac) return { status: 'vacances', nom: vac.nom };

  // Compte les semaines de classe (hors vacances) depuis l'ancrage.
  let idx = 0;
  const cur = new Date(anchor);
  while (cur < M) {
    cur.setDate(cur.getDate() + 7);
    if (!vacancesDe(config, cur)) idx++;
  }
  const anchorParity = sem.anchorParity || 'A';
  const parity = (idx % 2 === 0) ? anchorParity : (anchorParity === 'A' ? 'B' : 'A');
  return { status: 'ecole', parity };
}

// Parité simple (compat) — 'A' par défaut hors semaine de classe.
export function weekParity(config, date = new Date()) {
  const s = weekStatus(config, date);
  return s.status === 'ecole' ? s.parity : 'A';
}

const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

export function fmtDate(d) {
  const x = parseISO(d);
  return `${x.getDate()} ${MOIS[x.getMonth()]}`;
}

// « 22 juin – 26 juin » (lundi → vendredi de la semaine de `date`).
export function rangeLabel(date = new Date()) {
  const m = mondayOf(date);
  const f = new Date(m); f.setDate(m.getDate() + 4);
  return `${m.getDate()} ${MOIS[m.getMonth()]} – ${f.getDate()} ${MOIS[f.getMonth()]}`;
}

export function semaineLabel(semaine, parity) {
  if (!semaine) return parity;
  return parity === 'A' ? (semaine.labelA || 'A') : (semaine.labelB || 'B');
}

export function semaineColor(semaine, parity) {
  if (parity === 'A') return semaine?.colorA || 'var(--sem-a)';
  return semaine?.colorB || 'var(--sem-b)';
}
