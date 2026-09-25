/* 25/09/2026 — Ce que les fiches papier des référents portent et que la grille doit porter aussi :
   une plage horaire qui ne bouge pas (les créneaux de midi restent visibles), un total par jour,
   et la soirée écrite à part plutôt qu'en étirant la journée. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = path.resolve(import.meta.dirname, '..'), memo = new Map();
function uri(file) { if (memo.has(file)) return memo.get(file); let s = fs.readFileSync(path.join(root, file), 'utf8'); s = s.replace(/from '(\.\/[^'?]+)(?:\?[^']*)?'/g, (_, p) => `from '${uri(p.slice(2))}'`); const u = 'data:text/javascript;base64,' + Buffer.from(s).toString('base64'); memo.set(file, u); return u; }
const V = await import(uri('vues-planning.js')), K = await import(uri('calculs.js')), X = await import(uri('exports.js'));

/* Totaux : ce qui revient chaque semaine compte des deux côtés, une lettre ne compte que du sien. */
const occ = [
  { j: 0, debut: '09:00', fin: '11:00', sem: 'AB' },
  { j: 0, debut: '11:00', fin: '12:00', sem: 'A' },
  { j: 1, debut: '18:00', fin: '21:00', sem: 'B' },
];
const t = V.totauxJours(K, occ);
assert.deepEqual(t[0], { a: 3, b: 2 });
assert.deepEqual(t[1], { a: 0, b: 3 });
assert.equal(V.libelleTotal(K, t[0]), '3 h / 2 h');
assert.equal(V.libelleTotal(K, t[1]), '0 h / 3 h');
assert.equal(V.libelleTotal(K, { a: 4, b: 4 }), '4 h');
assert.equal(V.libelleTotal(K, { a: 0, b: 0 }), '');
/* Sans alternance — les autres vues — un seul nombre. */
assert.equal(V.libelleTotal(K, V.totauxJours(K, [{ j: 0, debut: '08:30', fin: '12:30' }])[0]), '4 h');

/* Le document : demi-pension de midi présente, soirée hors grille, totaux en pied. */
const a = { id: 'x', sigle: 'ESSAI', contrat: 26, reunionH: 0, equipes: { MDA: 1 }, services: [
  { nom: 'Internat', h: 0, horaires: [{ jour: 1, debut: '18:00', fin: '21:00', du: '2026-09-01', au: '2027-07-01', semaines: 'AB' }] },
  { nom: 'Cantine', h: 0, horaires: [{ jour: 0, debut: '12:30', fin: '13:00', du: '2026-09-01', au: '2027-07-01', semaines: 'AB' }] }] };
const cours = { c1: { id: 'c1', j: 0, d: '09:30', f: '11:30', sem: 'TOUTES', lib: 'Atelier vannerie', cls: ['C1'], salle: [] } };
const edt = { semaine1: '2026-09-21', vacances: [], cours, classes: { C1: { court: '1CAN', pole: 'MDA', pfmp: [] } } };
const ctx = { C: K.creerCalendrier(edt), edt, I: { aesh: new Map([['x', a]]),
  places: [{ aeshId: 'x', coursId: 'c1', pole: 'MDA', jour: 0, du: '2026-09-01', au: '2027-07-01', semaines: 'AB', statut: 'active' }],
  absences: [], reunions: [] } };
const pdf = Buffer.from(await X.pdfGrillesAesh(ctx, ['x'], '2026-09-28', 'TYPE').arrayBuffer()).toString('latin1');
assert(pdf.includes('Total'), 'le pied de colonne manque');
assert(pdf.includes('Soir'), 'la bande Soirée manque');
assert(pdf.includes('18h'), 'la grille doit descendre jusqu’à 18 h même sans cours l’après-midi');
/* L'Excel porte la même dernière ligne. */
const f = X.feuillesGrillesAesh(ctx, ['x'], '2026-09-28', 'TYPE')[0];
const derniere = f.lignes[f.lignes.length - 1];
assert.equal(derniere[0].v, 'Total');
assert.equal(derniere[1].v, '2,5 h');   // 2 h d'atelier + 30 min de demi-pension
console.log('Semaine type : totaux par jour, plage fixe 8 h–18 h et bande Soirée verifies.');
