import { semainesAB, occupationsAB, resumeSemaine, totauxJours, libelleTotal } from './vues-planning.js?v=2026-09-26b';
import { couleurAesh, libelleService } from './presences.js?v=2026-09-26c';
/* ═══════════════════════════════════════════════════════════════════
   Référents de pôle AESH — exports PDF, Excel et JSON
   ═══════════════════════════════════════════════════════════════════ */
import { PDF, lignes, coupe, xlsx, colonne } from './fichiers.js?v=2026-09-24i';
import * as K from './calculs.js?v=2026-09-26b';
import { POLES, pole, couleurMatiere } from './donnees.js?v=2026-09-24b';

const H0 = 8 * 60, H1 = 21 * 60;
const GRIS = '#6b7280', LIGNE = '#e3e8ef', ENCRE = '#111827';
const nomPole = id => (pole(id) || { nom: id }).nom;
const titreSemaine = (C, lundi) => {
  const p = C.parite(lundi), v = K.ajoute(lundi, 4);
  return `${p ? `Semaine ${p} · ` : ''}du ${K.dateLongue(lundi)} au ${K.dateLongue(v)} ${v.slice(0, 4)}`;
};
const maintenant = () => { const d = new Date(); return `${K.z2(d.getDate())}/${K.z2(d.getMonth() + 1)}/${d.getFullYear()} à ${d.getHours()} h ${K.z2(d.getMinutes())}`; };

/* ─────────────── PDF ─────────────── */
function entete(pdf, couleur, titre, sous) {
  pdf.rect(28, 24, pdf.W - 56, 62, { fill: couleur, r: 12 });
  pdf.text(48, 52, titre, { size: 20, bold: true, color: '#ffffff', max: pdf.W - 120 });
  pdf.text(48, 72, sous, { size: 11, color: '#ffffff', max: pdf.W - 120 });
}
function pied(pdf, n, total) {
  pdf.line(28, pdf.H - 26, pdf.W - 28, pdf.H - 26, { color: LIGNE });
  pdf.text(28, pdf.H - 13, 'coordination-pédagogie · Référents de pôle AESH', { size: 8, color: GRIS });
  pdf.text(pdf.W - 28, pdf.H - 13, `Édité le ${maintenant()} · ${n}/${total}`, { size: 8, color: GRIS, align: 'right' });
}
function puces(pdf, y, liste) {
  let x = 28;
  liste.forEach(([lib, val, coul]) => {
    const t = `${lib} ${val}`, larg = Math.min(230, 26 + t.length * 5.4);
    pdf.rect(x, y, larg, 22, { fill: coul ? coul[1] : '#f1f4f8', r: 11 });
    pdf.text(x + 10, y + 15, lib, { size: 8.5, color: coul ? coul[0] : GRIS });
    pdf.text(x + larg - 10, y + 15, val, { size: 9.5, bold: true, color: coul ? coul[0] : ENCRE, align: 'right' });
    x += larg + 8;
  });
}
/* Grille lundi → vendredi, 8 h → 18 h. blocs : [{j, debut, fin, fond, trait, l1, l2, l3, hachure}] */
function grille(pdf, top, C, lundi, blocs, cadre = {}) {
  /* 25/09/2026 : la plage horaire et le bas de la grille sont réglables, pour que la
     semaine type tienne sur une page sans écraser le pied de document. */
  const h0 = cadre.h0 ?? H0, h1 = cadre.h1 ?? H1;
  const x0 = cadre.x ?? 28, droite = cadre.droite ?? pdf.W - 28, xt = x0 + 34, bas = cadre.bas ?? (pdf.H - 40), hPx = (bas - top - 22) / ((h1 - h0) / 60), lc = (droite - xt) / 5, y0 = top + 22;
  const sem = C.semaine(lundi);
  sem.jours.forEach((jr, j) => {
    const x = xt + j * lc;
    pdf.rect(x + 2, top, lc - 4, 18, { fill: jr.off ? '#eceff3' : '#f4f6f9', r: 6 });
    pdf.text(x + lc / 2, top + 12.5, `${K.JOURS[j]} ${K.jjmm(jr.date)}`, { size: 9, bold: true, color: ENCRE, align: 'center' });
    if (jr.off) { pdf.rect(x + 2, y0, lc - 4, bas - y0, { fill: '#f3f4f6', r: 6 }); pdf.text(x + lc / 2, (y0 + bas) / 2, coupe(jr.off, lc - 14, 9), { size: 9, color: GRIS, align: 'center' }); }
  });
  /* 25/09/2026 : l'établissement place tous ses cours sur l'heure ou la demie.
     Une graduation de 30 min place chaque bloc au pixel : aucun n'a besoin d'écrire son horaire. */
  for (let m = h0; m <= h1; m += 30) {
    const y = y0 + (m - h0) / 60 * hPx, pleine = m % 60 === 0;
    pdf.line(xt, y, droite, y, { color: pleine ? LIGNE : '#f2f4f8' });
    if (pleine) pdf.text(x0, y + 3, K.hFr(K.hDe(m)), { size: 8, color: GRIS });
  }
  /* 25/09/2026 : sous chaque colonne, ce que pèse la journée — comme au crayon sur les fiches. */
  if (cadre.totaux) {
    pdf.text(x0, bas + 15, 'Total', { size: 7.5, color: GRIS });
    sem.jours.forEach((jr, j) => {
      const x = xt + j * lc;
      pdf.rect(x + 2, bas + 4, lc - 4, 15, { fill: '#f1f4f8', r: 6 });
      pdf.text(x + lc / 2, bas + 15, cadre.totaux[j] || '—', { size: 8.5, bold: true, color: jr.off ? GRIS : ENCRE, align: 'center' });
    });
  }
  blocs.forEach(b => {
    if (sem.jours[b.j] && sem.jours[b.j].off) return;
    const a = Math.max(h0, K.min(b.debut)), z = Math.min(h1, K.min(b.fin)); if (z <= a) return;
    const x = xt + b.j * lc + (b.col || 0) * ((lc - 6) / (b.cols || 1)) + 3, w = (lc - 6) / (b.cols || 1) - 2, y = y0 + (a - h0) / 60 * hPx + 1, h = (z - a) / 60 * hPx - 2;
    pdf.rect(x, y, w, h, { fill: b.fond, r: 5, stroke: b.hachure ? '#b42318' : (b.pointille ? (b.trait || '#94a3b8') : null), dash: !!b.hachure || !!b.pointille, lw: 0.8 });
    if (b.trait) pdf.rect(x, y, 3.2, h, { fill: b.trait, r: 1.5 });
    const tx = x + 7, tw = w - 11; let ty = y + 11;
    if (h < 14) { pdf.text(tx, y + h - 3.5, b.l1, { size: 7, bold: true, color: b.encre || ENCRE, max: tw }); return; }
    lignes(b.l1, tw, 8.5, true, h > 40 ? 2 : 1).forEach(l => { pdf.text(tx, ty, l, { size: 8.5, bold: true, color: b.encre || ENCRE }); ty += 10; });
    if (b.l2 && ty + 2 < y + h) { pdf.text(tx, ty, b.l2, { size: 7.5, color: b.encre || ENCRE, max: tw }); ty += 9; }
    if (b.l3 && ty + 2 < y + h) pdf.text(tx, ty, b.l3, { size: 7, color: GRIS, max: tw });
  });
}
/* Côte à côte : les blocs qui se chevauchent partagent la colonne. */
function colonnes(blocs) {
  [0, 1, 2, 3, 4].forEach(j => {
    const l = blocs.filter(b => b.j === j).sort((a, b) => K.min(a.debut) - K.min(b.debut));
    const groupes = []; l.forEach(b => { const g = groupes.find(g => g.some(x => K.chevauche(x.debut, x.fin, b.debut, b.fin))); if (g) g.push(b); else groupes.push([b]); });
    groupes.forEach(g => { const cols = []; g.forEach(b => { let c = cols.findIndex(col => col.every(x => !K.chevauche(x.debut, x.fin, b.debut, b.fin))); if (c < 0) { cols.push([]); c = cols.length - 1; } cols[c].push(b); b.col = c; }); g.forEach(b => { b.cols = cols.length; }); });
  });
  return blocs;
}
/* 25/09/2026 — Semaine type : les blocs viennent d'une liste déjà fusionnée (A, B ou les deux).
   Un bloc d'une seule semaine porte sa lettre et un fond plus pâle, pour se distinguer d'un
   créneau qui revient chaque semaine. */
function blocsDepuis(ctx, occ) {
  return colonnes(occ.filter(o => o.type !== 'vacances').map(o => {
    const une = o.sem && o.sem !== 'AB';
    let b;
    if (o.type === 'cours') {
      const p = pole(o.pole) || { color: '#475569', clair: '#eef1f4' };
      b = { j: o.j, debut: o.debut, fin: o.fin, fond: o.absent ? '#fdecea' : p.clair,
        trait: o.absent ? '#b42318' : p.couleur, hachure: o.absent,
        l1: o.cours.lib || o.cours.mat,
        l2: `${o.cours.cls.map(n => (ctx.edt.classes[n] || {}).court || n).join(' · ')}`,
        l3: (K.min(o.debut) % 30 || K.min(o.fin) % 30) ? K.hFr(o.debut) + '–' + K.hFr(o.fin) : '' };
    } else if (o.type === 'absence') {
      b = { j: o.j, debut: o.debut, fin: o.fin, fond: '#fff4f2', trait: '#b42318', l1: o.label, l2: '', encre: '#8a1c12' };
    } else {
      b = { j: o.j, debut: o.debut, fin: o.fin, fond: '#eef1f4', trait: '#64748b',
        l1: libelleService(o.label), l2: '', l3: (K.min(o.debut) % 30 || K.min(o.fin) % 30) ? K.hFr(o.debut) + '–' + K.hFr(o.fin) : '' };
    }
    if (une) {
      b.l1 = o.sem + ' · ' + b.l1;                       /* le titre reste lisible */
      b.pointille = true;
    }
    return b;
  }));
}

function blocsAesh(ctx, aeshId, lundi) {
  return colonnes(K.occupations(ctx, aeshId, lundi).filter(o => o.type !== 'vacances').map(o => {
    if (o.type === 'cours') {
      const p = pole(o.pole) || { color: '#475569', clair: '#eef1f4' };
      return { j: o.j, debut: o.debut, fin: o.fin, fond: o.absent ? '#fdecea' : p.clair, trait: o.absent ? '#b42318' : p.couleur, hachure: o.absent,
        l1: o.cours.lib || o.cours.mat, l2: `${o.cours.cls.map(n => (ctx.edt.classes[n] || {}).court || n).join(' · ')}${o.absent ? ' · à couvrir' : ''}`, l3: (o.cours.salle || []).join(' · ') };
    }
    if (o.type === 'absence') return { j: o.j, debut: o.debut, fin: o.fin, fond: '#fff4f2', trait: '#b42318', l1: o.label, l2: o.absence && o.absence.note ? o.absence.note : '', encre: '#8a1c1c' };
    return { j: o.j, debut: o.debut, fin: o.fin, fond: o.type === 'institution' ? '#e6e9ef' : '#eef1f4', trait: '#64748b', l1: libelleService(o.label), l2: '' };
  }));
}

function numeroter(pdf) { const n = pdf.pages.length; pdf.pages.forEach((ops, i) => { pdf.ops = ops; pied(pdf, i + 1, n); }); return pdf.blob(); }
export function pdfAesh(ctx, ids, lundi) { const pdf = new PDF(); aeshDans(pdf, ctx, ids, lundi); return numeroter(pdf); }
export function pdfEquipe(ctx, poleIds, ids, lundi) { const pdf = new PDF(); poleIds.forEach(p => syntheseDans(pdf, ctx, p, lundi)); aeshDans(pdf, ctx, ids, lundi); return numeroter(pdf); }
function aeshDans(pdf, ctx, ids, lundi) {
  ids.forEach((id, i) => {
    const b = K.bilan(ctx, id, lundi); if (!b) return;
    const a = b.a, polesA = Object.keys(a.equipes || {}), p = pole(polesA[0]) || POLES[0];
    pdf.page();
    entete(pdf, p.couleur, `Emploi du temps · ${a.sigle}`, `${polesA.map(nomPole).join(' + ')} · ${titreSemaine(ctx.C, lundi)}`);
    const pc = [['Contrat', b.contrat != null ? K.fmtH(b.contrat) : '—']];
    polesA.forEach(q => pc.push([nomPole(q), (a.heures || {})[q] != null && a.heures[q] !== '' ? K.fmtH(a.heures[q]) : '—', [pole(q).couleur, pole(q).clair]]));
    pc.push(['Cette semaine', K.fmtH(b.total)]);
    if (b.reste != null) pc.push(['Reste', K.fmtH(b.reste), b.reste < 0 ? ['#b42318', '#fdecea'] : ['#15803d', '#e8f6ec']]);
    puces(pdf, 96, pc);
    let top = 128;
    if (b.alertes.length) { pdf.text(28, 136, 'Attention : ' + b.alertes.map(x => x.texte).join(' · '), { size: 8.5, bold: true, color: '#b42318', max: pdf.W - 56 }); top = 146; }
    grille(pdf, top, ctx.C, lundi, blocsAesh(ctx, id, lundi));
  });
}

/* Les AESH d'un cours de classe, tels qu'ils sont VRAIMENT là ce jour-là (audit D13) : même calcul que l'écran —
   contrat fini exclu, horaire partiel, absence entière ou partielle, et besoin comparé au moment le moins couvert. */
function aeshDuCours(ctx, nom, c, iso) {
  const I = ctx.I, parAesh = new Map();
  I.places.forEach(x => {
    if (x.coursId !== c.id || !K.placementALieu(ctx, x, iso)) return;
    const a = I.aesh.get(x.aeshId); if (!a || K.contratFini(a, iso)) return;
    const hp = K.horairePlace(x, c);
    if (!parAesh.has(a.id)) parAesh.set(a.id, { a, iv: [] });
    parAesh.get(a.id).iv.push([K.min(hp.debut), K.min(hp.fin)]);
  });
  const txt = [...parAesh.values()].sort((x, y) => String(x.a.sigle).localeCompare(String(y.a.sigle), 'fr')).map(({ a, iv }) => {
    const u = K.unionIntervalles(iv), tout = u.length === 1 && u[0][0] === K.min(c.d) && u[0][1] === K.min(c.f);
    const h = u.reduce((t, [x, y]) => t + y - x, 0), abs = K.absencesDuJour(I, a.id, iso), manque = u.reduce((t, [x, y]) => t + K.recouvrement(abs, x, y), 0);
    const plage = tout ? '' : ' ' + u.map(([x, y]) => `${K.hFr(K.hDe(x))}–${K.hFr(K.hDe(y))}`).join(', ');
    const etat = !manque ? '' : manque >= h ? ' ABSENT, à couvrir' : ` absent ${K.unionIntervalles(abs).map(([x, y]) => `${K.hFr(K.hDe(Math.max(x, K.min(c.d))))}–${K.hFr(K.hDe(Math.min(y, K.min(c.f))))}`).join(', ')}`;
    return `${a.sigle}${plage}${etat}`;
  });
  const bes = K.besoinDuCours(ctx.estimations, nom, c, { iso, parite: ctx.C.semaine(K.lundiDe(iso)).parite });
  const n = bes ? K.presentsMin(ctx, c, iso, bes.plageDebut, bes.plageFin) : 0;
  return {
    l2: [txt.length ? 'AESH : ' + txt.join(', ') : '', bes ? `besoin ${bes.nb}${bes.nb ? (n >= bes.nb ? ' · couvert' : ` · manque ${bes.nb - n}`) : ''}` : ''].filter(Boolean).join(' · '),
    alerte: txt.some(t => /absent/i.test(t)) || (bes && bes.nb > n)
  };
}

export function pdfClasses(ctx, noms, lundi) {
  const pdf = new PDF();
  noms.forEach((nom, i) => {
    const k = ctx.edt.classes[nom], p = pole(k.pole);
    pdf.page();
    entete(pdf, p.couleur, `${k.court}`, `${p.nom} · ${titreSemaine(ctx.C, lundi)}`);
    const blocs = [];
    k.cours.map(id => ctx.edt.cours[id]).forEach(c => {
      const iso = K.ajoute(lundi, c.j); if (!K.coursALieu(ctx.C, ctx.edt, c, iso)) return;
      const [coul, clair] = couleurMatiere(c.mat), ae = aeshDuCours(ctx, nom, c, iso);
      blocs.push({ j: c.j, debut: c.d, fin: c.f, fond: clair, trait: ae.alerte ? '#b42318' : coul, l1: c.lib || c.mat, l2: ae.l2, l3: (c.salle || []).join(' · ') });
    });
    const enP = (k.pfmp || []).find(x => x.debut <= K.ajoute(lundi, 4) && x.fin >= lundi);
    if (enP) pdf.text(28, 112, `PFMP du ${K.jjmm(enP.debut)} au ${K.jjmm(enP.fin)}`, { size: 10, bold: true, color: '#b45309' });
    grille(pdf, 124, ctx.C, lundi, colonnes(blocs));
  });
  return numeroter(pdf);
}

function syntheseDans(pdf, ctx, poleId, lundi) {
  const p = pole(poleId), liste = K.aeshActifs(ctx.I, poleId);
  pdf.page();
  entete(pdf, p.couleur, `Équipe AESH · ${p.nom}`, titreSemaine(ctx.C, lundi));
  const cols = [['AESH', 70], ['Contrat', 70], ['Dans le pôle', 90], ['Autres pôles', 150], ['Services', 80], ['Cette semaine', 90], ['Reste', 70], ['Alertes', 165]];
  let y = 104, x = 28;
  pdf.rect(28, y, pdf.W - 56, 22, { fill: '#f1f4f8', r: 6 });
  cols.forEach(([t, w]) => { pdf.text(x + 8, y + 14.5, t, { size: 9, bold: true, color: GRIS }); x += w; });
  y += 26;
  liste.forEach((a, i) => {
    if (y > pdf.H - 60) { pdf.page(); y = 40; }
    const b = K.bilan(ctx, a.id, lundi), autres = Object.keys(a.equipes || {}).filter(q => q !== poleId);
    if (i % 2) pdf.rect(28, y - 2, pdf.W - 56, 22, { fill: '#fafbfc', r: 4 });
    const val = [a.sigle, b.contrat != null ? K.fmtH(b.contrat) : '—', (a.heures || {})[poleId] != null ? K.fmtH(a.heures[poleId]) : '—',
      autres.map(q => `${nomPole(q)} ${(a.heures || {})[q] != null ? K.fmtH(a.heures[q]) : '—'}`).join(' · ') || '—', K.fmtH(K.totalServices(a)),
      K.fmtH(b.total), b.reste != null ? K.fmtH(b.reste) : '—', b.alertes.map(x => x.texte).join(' · ') || '—'];
    x = 28;
    cols.forEach(([, w], k) => { pdf.text(x + 8, y + 13, val[k], { size: k === 0 ? 10 : 9, bold: k === 0, color: k === 7 && b.alertes.length ? '#b42318' : ENCRE, max: w - 12 }); x += w; });
    y += 22;
  });
}

/* ─────────────── EXCEL ─────────────── */
const PAS = 30;
function feuilleGrille(nom, titre, sous, C, lundi, blocs) {
  const nbL = (H1 - H0) / PAS, lignesX = [], fusions = [];
  const S = { titre: { gras: true, taille: 16, couleur: '#111827' }, sous: { taille: 11, couleur: '#4b5563' }, jour: { gras: true, fond: '#f1f4f8', centre: true, bord: true }, heure: { couleur: '#6b7280', droite: true, haut: true } };
  lignesX.push([{ v: titre, s: S.titre }]); lignesX.push([{ v: sous, s: S.sous }]); lignesX.push([]);
  const sem = C.semaine(lundi);
  lignesX.push([{ v: '' }, ...sem.jours.map((jr, j) => ({ v: `${K.JOURS[j]} ${K.jjmm(jr.date)}`, s: S.jour }))]);
  const base = lignesX.length;
  for (let i = 0; i < nbL; i++) { const m = H0 + i * PAS; lignesX.push([{ v: K.hFr(K.hDe(m)), s: S.heure }, ...[0, 1, 2, 3, 4].map(() => ({ v: '', s: { bord: true } }))]); }
  sem.jours.forEach((jr, j) => {
    if (!jr.off) return;
    const col = colonne(j + 1); fusions.push(`${col}${base + 1}:${col}${base + nbL}`);
    lignesX[base][j + 1] = { v: jr.off, s: { fond: '#eceff3', couleur: '#6b7280', centre: true, bord: true } };
  });
  /* Chaque case occupée pointe vers la PREMIÈRE ligne de son bloc : un cours qui en chevauche un autre s'écrit
     dans cette case visible, jamais dans une case intérieure d'une fusion, que le tableur masquerait (audit D14). */
  const occupe = new Map();
  blocs.sort((a, b) => a.j - b.j || K.min(a.debut) - K.min(b.debut)).forEach(b => {
    if (sem.jours[b.j].off) return;
    const r1 = Math.max(0, Math.floor((K.min(b.debut) - H0) / PAS)), r2 = Math.min(nbL - 1, Math.ceil((K.min(b.fin) - H0) / PAS) - 1); if (r2 < r1) return;
    let hote = null; for (let r = r1; r <= r2 && hote == null; r++) if (occupe.has(b.j + ':' + r)) hote = occupe.get(b.j + ':' + r);
    const texte = [b.l1, b.l2, b.l3].filter(Boolean).join('\n');
    if (hote != null) { const c = lignesX[base + hote][b.j + 1]; c.v = (c.v ? c.v + '\n\n' : '') + `En même temps, ${K.hFr(b.debut)}–${K.hFr(b.fin)} :\n` + texte; return; }
    for (let r = r1; r <= r2; r++) occupe.set(b.j + ':' + r, r1);
    lignesX[base + r1][b.j + 1] = { v: texte, s: { fond: b.fond, couleur: b.encre || '#111827', retour: true, haut: true, bord: true, gras: false } };
    for (let r = r1 + 1; r <= r2; r++) lignesX[base + r][b.j + 1] = { v: '', s: { fond: b.fond, bord: true } };
    if (r2 > r1) fusions.push(`${colonne(b.j + 1)}${base + r1 + 1}:${colonne(b.j + 1)}${base + r2 + 1}`);
  });
  const hauteurs = { 1: 24, 4: 20 }; for (let i = 0; i < nbL; i++) hauteurs[base + i + 1] = 22;
  return { nom, largeurs: [8, 26, 26, 26, 26, 26], lignes: lignesX, fusions, hauteurs, figer: [1, base] };
}
export function excelAesh(ctx, ids, lundi, polesSynthese) {
  const f = [];
  (polesSynthese || []).forEach(p => f.push(feuilleSynthese(ctx, p, lundi)));
  ids.forEach(id => { const a = ctx.I.aesh.get(id); if (!a) return; f.push(feuilleGrille(a.sigle, `Emploi du temps · ${a.sigle}`, `${Object.keys(a.equipes || {}).map(nomPole).join(' + ')} · ${titreSemaine(ctx.C, lundi)}`, ctx.C, lundi, blocsAesh(ctx, id, lundi))); });
  return xlsx(f);
}
export function excelClasses(ctx, noms, lundi) {
  return xlsx(noms.map(nom => {
    const k = ctx.edt.classes[nom], blocs = [];
    k.cours.map(id => ctx.edt.cours[id]).forEach(c => {
      const iso = K.ajoute(lundi, c.j); if (!K.coursALieu(ctx.C, ctx.edt, c, iso)) return;
      const ae = aeshDuCours(ctx, nom, c, iso);
      blocs.push({ j: c.j, debut: c.d, fin: c.f, fond: couleurMatiere(c.mat)[1], encre: ae.alerte ? '#b42318' : undefined, l1: c.lib || c.mat, l2: ae.l2, l3: (c.salle || []).join(' · ') });
    });
    return feuilleGrille(nom, k.court, `${pole(k.pole).nom} · ${titreSemaine(ctx.C, lundi)}`, ctx.C, lundi, blocs);
  }));
}
function feuilleSynthese(ctx, poleId, lundi) {
  const p = pole(poleId), E = { gras: true, fond: p.clair, couleur: p.couleur, bord: true };
  const l = [[{ v: `Équipe AESH · ${p.nom}`, s: { gras: true, taille: 16 } }], [{ v: titreSemaine(ctx.C, lundi), s: { couleur: '#4b5563' } }], [],
    ['AESH', 'Contrat (h)', 'Dans le pôle (h)', 'Autres pôles', 'Services', 'Jours', 'Réunion d’équipe', 'Cette semaine (h)', 'Reste (h)', 'Alertes'].map(v => ({ v, s: E }))];
  K.aeshActifs(ctx.I, poleId).forEach(a => {
    const b = K.bilan(ctx, a.id, lundi), num = v => (v === null || v === undefined || v === '' ? { v: '', s: { bord: true } } : { v: +v, s: { bord: true } });
    l.push([{ v: a.sigle, s: { gras: true, bord: true } }, num(b.contrat), num((a.heures || {})[poleId]),
      { v: Object.keys(a.equipes || {}).filter(q => q !== poleId).map(q => `${nomPole(q)} ${(a.heures || {})[q] ?? '—'} h`).join(' · '), s: { bord: true } },
      { v: K.servicesDe(a).map(x => `${x.nom} ${x.h} h`).join(' · '), s: { bord: true } }, { v: K.joursDe(a).map(j => K.JOURS_C[j]).join(' '), s: { bord: true } }, { v: a.reunion ? `${K.JOURS[a.reunion.jour]} ${K.hFr(a.reunion.debut)}–${K.hFr(a.reunion.fin)}` : '', s: { bord: true } },
      num(Math.round(b.total * 100) / 100), b.reste == null ? { v: '', s: { bord: true } } : { v: Math.round(b.reste * 100) / 100, s: { bord: true, couleur: b.reste < 0 ? '#b42318' : '#15803d', gras: true } },
      { v: b.alertes.map(x => x.texte).join(' · '), s: { bord: true, couleur: '#b42318', retour: true } }]);
  });
  return { nom: `Synthèse ${p.nom}`, largeurs: [10, 11, 14, 30, 26, 18, 20, 16, 10, 50], lignes: l, hauteurs: { 1: 24 }, figer: [1, 4] };
}

/* ─────────────── JSON (sauvegarde complète) ─────────────── */
export function json(ctx, docsBruts) {
  const b = new Blob([JSON.stringify({ exporteLe: new Date().toISOString(), annee: ctx.annee, source: 'referents-aesh', documents: docsBruts }, null, 2)], { type: 'application/json' });
  return b;
}

/* Deux semaines réelles, avec les mêmes présences que la grille. Une colonne cours entière
   et une colonne présences découpées par jour : aucune fusion ne cache un relais. */
export function excelPlanning(ctx,noms,ids,lundi) {
  const feuilles=[];
  for(const semaine of Object.values(K.semainesComparaison(ctx.C,lundi)).sort()) {
    const sem=ctx.C.semaine(semaine),suffixe=ctx.C.parite(semaine)||K.jjmm(semaine).replace('/','-');
    for(const nom of noms) {
      const k=ctx.edt.classes[nom],lignesX=[[{v:`${k.court} · ${titreSemaine(ctx.C,semaine)}`,s:{gras:true,taille:15}}],
        [{v:'Heure'},...K.JOURS.flatMap(j=>[{v:j+' · cours',s:{gras:true}},{v:'Présences AESH',s:{gras:true}}])]],fusions=[];
      const cours=k.cours.map(id=>ctx.edt.cours[id]).filter(c=>ctx.C.coursSemaine(c,semaine));
      for(let m=8*60+30;m<21*60;m+=30) {
        const ligne=[{v:K.hFr(K.hDe(m)),s:{bord:true}}];
        for(let j=0;j<5;j++) {
          const iso=K.ajoute(semaine,j),cs=cours.filter(c=>c.j===j && K.min(c.d)<m+30 && K.min(c.f)>m);
          const textes=[],couleurs=[];
          for(const a of ctx.I.aesh.values()) {
            for(const o of K.occupations(ctx,a.id,semaine).filter(o=>o.j===j && !o.absent && K.min(o.debut)<m+30 && K.min(o.fin)>m && ((o.type==='cours' && o.cours.cls.includes(nom)) || (ids.includes(a.id) && ['service','reunion','institution'].includes(o.type))))) {
              textes.push(`${a.sigle} ${K.hFr(o.debut)}–${K.hFr(o.fin)}${o.type==='cours'?'':' · '+libelleService(o.label)}${o.partiel?' · absence partielle':''}`); couleurs.push(couleurAesh(a.id));
            }
          }
          const ferme=sem.jours[j].off || (K.enPfmp(k,iso)?'PFMP':'');
          ligne.push({v:ferme || cs.map(c=>{const b=K.besoinDuCours(ctx.estimations,nom,c,{iso,parite:ctx.C.parite(semaine)});return `${c.lib} (${c.d}–${c.f})${b?' · besoin '+b.nb+' AESH':''}`;}).join(' / '),s:{bord:true,retour:true,fond:ferme?'#eceff3':cs.length?couleurMatiere(cs[0].mat)[1]:'#ffffff'}},
            {v:[...new Set(textes)].join('\n'),s:{bord:true,retour:true,fond:couleurs.length===1?couleurs[0]:'#ffffff',couleur:couleurs.length===1?'#ffffff':'#111827'}});
        }
        lignesX.push(ligne);
      }
      // Les cours gardent un cadre entier ; seules les présences à leur droite sont découpées.
      for(let j=0;j<5;j++) for(let r=2;r<lignesX.length;) {
        let z=r;const col=1+j*2,v=lignesX[r][col].v;
        while(v && z+1<lignesX.length && lignesX[z+1][col].v===v)z++;
        if(z>r){fusions.push(`${colonne(col)}${r+1}:${colonne(col)}${z+1}`);for(let q=r+1;q<=z;q++)lignesX[q][col].v='';}r=z+1;
      }
      feuilles.push({nom:`${nom} ${suffixe}`,lignes:lignesX,fusions,largeurs:[10,...Array(10).fill(24)],hauteurs:Object.fromEntries(lignesX.map((_,i)=>[i+1,i<2?26:34])),figer:[1,2]});
    }
    for(const id of ids) {
      const a=ctx.I.aesh.get(id);if(!a)continue;
      const b=K.bilan(ctx,id,semaine);
      feuilles.push(feuilleGrille(`${a.sigle} ${suffixe}`,`${a.sigle} · ${K.fmtH(b.total)} placées${b.contrat==null?'':' / '+K.fmtH(b.contrat)}`,titreSemaine(ctx.C,semaine),ctx.C,semaine,blocsAesh(ctx,id,semaine)));
    }
  }
  return xlsx(feuilles);
}

// Grilles individuelles : mêmes dates et occupations que la vue A/B.
export function datesExport(C,lundi,mode) {
  const ab=semainesAB(C,lundi);
  return mode==='A'?[ab.A]:mode==='B'?[ab.B]:[ab.A,ab.B];
}
/* 25/09/2026 — Le document que reçoit l'AESH : une page A4 paysage, sa semaine type,
   A et B réunies. En pied, ce qu'il fait dans la semaine et la clé de lecture. */
export function pdfSemaineType(ctx, ids, lundi) {
  const pdf = new PDF(), ab = semainesAB(ctx.C, lundi);
  for (const id of ids) {
    const a = ctx.I.aesh.get(id); if (!a) continue;
    const occ = occupationsAB(K, ctx, id, ab.A, ab.B);
    const bA = K.bilan(ctx, id, ab.A), bB = K.bilan(ctx, id, ab.B);
    const moyenne = (bA.total + bB.total) / 2, deux = occ.some(o => o.sem !== 'AB');
    pdf.page();
    entete(pdf, couleurAesh(id), `Emploi du temps · ${a.sigle}`,
      `${ctx.exportType ? 'Organisation habituelle · ' : ''}Semaines A et B réunies · ${K.fmtH(moyenne)} par semaine en moyenne${bA.contrat == null ? '' : ' · contrat ' + K.fmtH(bA.contrat)}`);
    /* 25/09/2026 : la plage ne bouge plus, 8 h → 18 h. Une journée sans après-midi garde
       ses créneaux de midi, où se placent la demi-pension et la réunion hebdomadaire.
       Ce qui commence après 18 h — internat, soirée — s'écrit sous la grille. */
    const FIN = 18 * 60;
    const soir = occ.filter(o => K.min(o.fin) > FIN).sort((x, y) => x.j - y.j || K.min(x.debut) - K.min(y.debut));
    const totaux = totauxJours(K, occ).map(t => libelleTotal(K, t));
    grille(pdf, 112, ctx.C, ab.A, blocsDepuis(ctx, occ), { x: 28, droite: pdf.W - 28, bas: pdf.H - 128, h1: FIN, totaux });
    let y = pdf.H - 90;
    if (soir.length) {
      pdf.text(28, y, 'Soirée · ' + soir.map(o => `${K.JOURS[o.j]} ${K.hFr(o.debut)}–${K.hFr(o.fin)} ${o.cours ? o.cours.lib : libelleService(o.label)}${o.sem && o.sem !== 'AB' ? ' (sem. ' + o.sem + ')' : ''}`).join('   ·   '),
        { size: 9, bold: true, color: '#334155' });
      y += 14;
    }
    /* La clé de lecture tient sur deux lignes : une seule déborde de la page en paysage. */
    if (deux) {
      pdf.text(28, y, 'Les créneaux en pointillé, précédés de « A · » ou « B · », ne reviennent qu’une semaine sur deux ; les autres sont identiques chaque semaine.', { size: 9, color: '#475569' });
      pdf.text(28, y + 12, 'En pied de colonne, un total donné en deux nombres se lit semaine A / semaine B.', { size: 9, color: '#475569' });
      y += 12;
    } else pdf.text(28, y, 'Toutes les semaines sont identiques : il n’y a pas d’alternance A / B.', { size: 9, color: '#475569' });
    const r = resumeSemaine(K, occ);
    if (r.length) pdf.text(28, y + 14, r.map(([n, h]) => `${n} : ${K.fmtH(h)}`).join('   ·   '), { size: 9, color: '#475569' });
    pdf.text(28, y + 28, `Semaine A : ${K.fmtH(bA.total)}   ·   Semaine B : ${K.fmtH(bB.total)}`, { size: 9, color: '#475569' });
  }
  return numeroter(pdf);
}

export function pdfGrillesAesh(ctx,ids,lundi,mode='AB') {
  if(mode==='TYPE') return pdfSemaineType(ctx,ids,lundi);
  const pdf=new PDF(),dates=datesExport(ctx.C,lundi,mode),groupe=mode==='AB';
  if(groupe){pdf.W=1190.55;pdf.H=841.89;}
  for(const id of ids){
    const a=ctx.I.aesh.get(id);if(!a)continue;
    for(const lot of groupe?[dates]:dates.map(d=>[d])){
      pdf.page();
      entete(pdf,couleurAesh(id),`Emploi du temps · ${a.sigle}`,`${ctx.exportType?'EDT type · ':''}Toutes ses classes · ${lot.map(d=>'Semaine '+ctx.C.parite(d)).join(' + ')}`);
      lot.forEach((d,i)=>{
        const b=K.bilan(ctx,id,d),x=28+i*(pdf.W/2),droite=groupe?(i?pdf.W-28:pdf.W/2-12):pdf.W-28;
        pdf.text(x,108,`Semaine ${ctx.C.parite(d)} · ${K.jjmm(d)}–${K.jjmm(K.ajoute(d,4))} · ${K.fmtH(b.total)}${b.contrat==null?'':' / '+K.fmtH(b.contrat)}`,{size:12,bold:true});
        const bl=blocsAesh(ctx,id,d);
        grille(pdf,122,ctx.C,d,bl,{x,droite,totaux:totauxJours(K,bl).map(t=>libelleTotal(K,t))});
      });
    }
  }
  return numeroter(pdf);
}
/* 25/09/2026 — La semaine type en Excel : une feuille par personne, A et B réunies. */
export function feuillesSemaineType(ctx, ids, lundi) {
  const ab = semainesAB(ctx.C, lundi), out = [];
  for (const id of ids) {
    const a = ctx.I.aesh.get(id); if (!a) continue;
    const occ = occupationsAB(K, ctx, id, ab.A, ab.B);
    const bA = K.bilan(ctx, id, ab.A), bB = K.bilan(ctx, id, ab.B);
    const blocs = blocsDepuis(ctx, occ).map(b => ({ ...b, l3: b.l3 || '' }));
    const f = feuilleGrille(`${a.sigle} type`,
      `${a.sigle} · Semaine type · ${K.fmtH((bA.total + bB.total) / 2)} par semaine en moyenne`,
      `${ctx.exportType ? 'Organisation habituelle · ' : ''}Semaines A et B réunies · A : ${K.fmtH(bA.total)} · B : ${K.fmtH(bB.total)}`,
      ctx.C, ab.A, blocs);
    f.fusions.push('A1:F1', 'A2:F2');
    f.lignes[1][0].s.retour = true; f.hauteurs[2] = 32;
    for (let r = 5; r <= f.lignes.length; r++) f.hauteurs[r] = 36;
    /* 25/09/2026 : dernière ligne, le total de chaque journée — semaine A / semaine B. */
    f.lignes.push([{ v: 'Total', s: { couleur: '#6b7280', droite: true, gras: true } },
      ...totauxJours(K, occ).map(t => ({ v: libelleTotal(K, t) || '—', s: { gras: true, fond: '#f1f4f8', centre: true, bord: true } }))]);
    f.hauteurs[f.lignes.length] = 24;
    f.unePage = true; f.papier = 9;
    out.push(f);
  }
  return out;
}

export function feuillesGrillesAesh(ctx,ids,lundi,mode='AB') {
  if(mode==='TYPE') return feuillesSemaineType(ctx,ids,lundi);
  const dates=datesExport(ctx.C,lundi,mode),out=[];
  for(const id of ids){
    const a=ctx.I.aesh.get(id);if(!a)continue;
    const fs=dates.map(d=>{
      const b=K.bilan(ctx,id,d);
      const blocs=blocsAesh(ctx,id,d).map(b=>({...b,l3:K.hFr(b.debut)+'–'+K.hFr(b.fin)}));
      const feuille=feuilleGrille(`${a.sigle} ${ctx.C.parite(d)}`,`${a.sigle} · Semaine ${ctx.C.parite(d)} · ${K.fmtH(b.total)}${b.contrat==null?'':' / '+K.fmtH(b.contrat)}`,`${ctx.exportType?'EDT type · ':''}${titreSemaine(ctx.C,d)} · Toutes ses classes`,ctx.C,d,blocs);
      feuille.fusions.push('A1:F1','A2:F2');
      feuille.lignes[1][0].s.retour=true;feuille.hauteurs[2]=32;
      for(let r=5;r<=feuille.lignes.length;r++)feuille.hauteurs[r]=36;
      feuille.unePage=true;
      return feuille;
    });
    if(mode!=='AB'){out.push(...fs);continue;}
    const [aF,bF]=fs;
    const decale=ref=>ref.replace(/[A-Z]+/g,c=>colonne([...c].reduce((n,l)=>n*26+l.charCodeAt(0)-64,0)-1+7));
    out.push({...aF,nom:a.sigle+' A+B',largeurs:[...aF.largeurs,3,...bF.largeurs],
      lignes:aF.lignes.map((r,i)=>[...Array.from({length:6},(_,k)=>r[k]||{}),{},...bF.lignes[i]]),
      fusions:[...aF.fusions,...bF.fusions.map(decale)],papier:8,unePage:true});
  }
  return out;
}
export function excelGrillesAesh(ctx,ids,lundi,mode='AB'){return xlsx(feuillesGrillesAesh(ctx,ids,lundi,mode));}
