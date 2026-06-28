// Génère la liste des semaines de l'année scolaire (avec leur statut A/B/Vacances),
// pour les vues Mois et Année de la consultation.
import { mondayOf, weekStatus, parseISO } from './week.js';

const MOIS_LONG = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
export const monthName = (i) => MOIS_LONG[i];

// Toutes les semaines (lundis) de la prérentrée à la fin de l'année.
export function eachSchoolWeek(config) {
  const cal = config.calendrier || {};
  const start = mondayOf(parseISO(cal.prerentree || config.semaine.anchorMonday));
  const end = mondayOf(parseISO(cal.finAnnee || '2027-07-03'));
  const weeks = [];
  const cur = new Date(start);
  let guard = 0;
  while (cur <= end && guard < 80) {
    weeks.push({ monday: new Date(cur), ...weekStatus(config, cur) });
    cur.setDate(cur.getDate() + 7);
    guard++;
  }
  return weeks;
}

// Regroupe les semaines par mois (clé 'YYYY-MM') pour la vue Année.
export function weeksByMonth(config) {
  const out = [];
  let curKey = null, bucket = null;
  for (const w of eachSchoolWeek(config)) {
    const key = `${w.monday.getFullYear()}-${w.monday.getMonth()}`;
    if (key !== curKey) {
      curKey = key;
      bucket = { year: w.monday.getFullYear(), month: w.monday.getMonth(), weeks: [] };
      out.push(bucket);
    }
    bucket.weeks.push(w);
  }
  return out;
}
