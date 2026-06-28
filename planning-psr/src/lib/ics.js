// Importateur .ics (Pronote / Index-Éducation) → événements de l'année.
// On ne garde que ce qui concerne les classes du périmètre (PSR + MELEC).
import { parseISO } from './week.js';

// Déplie les lignes (RFC 5545 : continuation = ligne commençant par espace/tab).
export function parseICS(text) {
  const lines = String(text).split(/\r?\n/);
  const unf = [];
  for (const l of lines) {
    if (/^[ \t]/.test(l) && unf.length) unf[unf.length - 1] += l.slice(1);
    else unf.push(l);
  }
  const events = [];
  let cur = null;
  for (const l of unf) {
    if (l === 'BEGIN:VEVENT') cur = {};
    else if (l === 'END:VEVENT') { if (cur) events.push(cur); cur = null; }
    else if (cur) {
      const i = l.indexOf(':');
      if (i > 0) cur[l.slice(0, i).split(';')[0]] = l.slice(i + 1);
    }
  }
  return events;
}

function icsDate(v) {
  if (!v) return null;
  const m = v.match(/(\d{4})(\d{2})(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

// Tokens de classe utilisés par Pronote → ids de l'app.
const CLASS_MAP = { C1PSR: 'c1psr', C2PSR: 'c2psr', B1MELEC: 'b1melec', B2MELEC: 'b2melec', BTMELEC: 'btmelec' };
function matchClasse(summary) {
  const s = summary.replace(/\s/g, '').toUpperCase();
  for (const k in CLASS_MAP) if (s.includes(k)) return CLASS_MAP[k];
  return null;
}
function pfmpLabel(sum) {
  const m = sum.toUpperCase().match(/PFMP\s*([12Y]?)/);
  return m ? `PFMP${m[1] && m[1] !== 'Y' ? ' ' + m[1] : ''}` : 'PFMP';
}

// Convertit le texte .ics en liste d'événements (type/classe/dates/titre).
export function icsToEvenements(text) {
  const out = [];
  for (const e of parseICS(text)) {
    const cat = e.CATEGORIES || '';
    const sum = (e.SUMMARY || '').replace(/\\,/g, ',').replace(/\\/g, '');
    const classe = matchClasse(sum);
    if (!classe) continue; // hors périmètre PSR/MELEC
    const debut = icsDate(e.DTSTART);
    const fin = icsDate(e.DTEND) || debut;
    if (!debut) continue;
    if (cat === 'Sessions de stage') out.push({ type: 'pfmp', classe, debut, fin, titre: pfmpLabel(sum) });
    else if (cat === 'Conseils de classe') out.push({ type: 'conseil', classe, debut, fin: debut, titre: 'Conseil' });
    else if (/BAC BLANC/i.test(cat)) out.push({ type: 'bacblanc', classe, debut, fin: debut, titre: 'Bac blanc' });
    else if (/Visites entreprise|Sortie/i.test(cat)) out.push({ type: 'sortie', classe, debut, fin: debut, titre: sum.slice(0, 40) });
  }
  // tri par date
  return out.sort((a, b) => a.debut.localeCompare(b.debut));
}

// Ouvre un sélecteur de fichier .ics et renvoie le texte.
export function pickICS() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ics,text/calendar';
    input.onchange = () => {
      const f = input.files && input.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Lecture impossible'));
      reader.readAsText(f);
    };
    input.click();
  });
}
