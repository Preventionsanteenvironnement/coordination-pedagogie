/* 26/09/2026 — La restauration peut retirer des documents. Elle est donc testée à part :
   ce qui entre dans un périmètre, ce qui change vraiment, et ce qui ne doit jamais être touché. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = path.resolve(import.meta.dirname, '..');
const src = fs.readFileSync(path.join(root, 'sauvegarde.js'), 'utf8');
const S = await import('data:text/javascript;base64,' + Buffer.from(src).toString('base64'));

const OPTS = { perimetre: 'pole', pole: 'PSR_MELEC', classesDuPole: ['C1PSR', 'C2PSR'],
  aeshDuPole: ['aesh_d01'], mode: 'completer' };

/* Périmètre « mon pôle » : mes classes, mes AESH, et rien d'autre. */
assert.equal(S.dansPerimetre({ type: 'eleves', classe: 'C1PSR' }, OPTS), true);
assert.equal(S.dansPerimetre({ type: 'eleves', classe: 'C1CAN' }, OPTS), false);
assert.equal(S.dansPerimetre({ type: 'place', classes: ['C2PSR'] }, OPTS), true);
assert.equal(S.dansPerimetre({ type: 'place', classes: ['C1VAN'] }, OPTS), false);
assert.equal(S.dansPerimetre({ type: 'aesh', equipes: { PSR_MELEC: 1 } }, OPTS), true);
assert.equal(S.dansPerimetre({ type: 'aesh', equipes: { MDA: 1 } }, OPTS), false);
assert.equal(S.dansPerimetre({ type: 'absence', aeshId: 'aesh_d01' }, OPTS), true);
assert.equal(S.dansPerimetre({ type: 'absence', aeshId: 'aesh_zzz' }, OPTS), false);
assert.equal(S.dansPerimetre({ type: 'pole', id: 'pole_PSR_MELEC' }, OPTS), true);
assert.equal(S.dansPerimetre({ type: 'pole', id: 'pole_MDA' }, OPTS), false);
/* Ce qui est commun aux quatre pôles n'est JAMAIS restauré depuis un périmètre restreint :
   la période, les messages, les réunions institutionnelles. */
for (const t of ['periode', 'message', 'reunion'])
  assert.equal(S.dansPerimetre({ type: t, id: t + '_1' }, OPTS), false, t + ' ne doit pas entrer');
/* « Tout » prend tout, y compris ce qui est commun. */
for (const t of ['periode', 'message', 'reunion', 'aesh', 'eleves'])
  assert.equal(S.dansPerimetre({ type: t }, { ...OPTS, perimetre: 'tout' }), true);
/* Une classe : seulement elle. */
const C = { ...OPTS, perimetre: 'classe', classe: 'C1PSR' };
assert.equal(S.dansPerimetre({ type: 'eleves', classe: 'C1PSR' }, C), true);
assert.equal(S.dansPerimetre({ type: 'eleves', classe: 'C2PSR' }, C), false);

/* Ce qui change vraiment : version, date et auteur ne comptent pas. */
const a = { id: 'x', type: 'place', classes: ['C1PSR'], debut: '09:00', version: 3, majLe: 'hier', par: 'X' };
assert.equal(S.memeDoc(a, { ...a, version: 9, majLe: 'aujourd’hui', par: 'Y' }), true);
assert.equal(S.memeDoc(a, { ...a, debut: '10:00' }), false);
assert.equal(S.memeDoc(a, null), false);

const ici = new Map([
  ['p1', { id: 'p1', type: 'place', classes: ['C1PSR'], debut: '09:00', statut: 'active', version: 1 }],
  ['p2', { id: 'p2', type: 'place', classes: ['C1PSR'], debut: '10:00', statut: 'active', version: 1 }],
  ['p9', { id: 'p9', type: 'place', classes: ['C1VAN'], debut: '08:00', statut: 'active', version: 1 }],
]);
const paquet = { format: S.FORMAT, documents: [
  { id: 'p1', type: 'place', classes: ['C1PSR'], debut: '09:00', statut: 'active', version: 7 },  // inchangé
  { id: 'p3', type: 'place', classes: ['C1PSR'], debut: '11:00', statut: 'active' },              // ajouté
]};
const r1 = S.analyser(paquet, ici, OPTS);
assert.equal(r1.inchanges.length, 1);
assert.equal(r1.ajoutes.length, 1);
assert.equal(r1.modifies.length, 0);
assert.equal(r1.enTrop.length, 0, 'en mode « compléter », on ne retire rien');

const r2 = S.analyser(paquet, ici, { ...OPTS, mode: 'identique' });
assert.deepEqual(r2.enTrop.map(d => d.id), ['p2'], 'p2 est en trop ; p9 est hors périmètre et ne bouge pas');

/* Un document déjà retiré ne se retire pas deux fois. */
const ici2 = new Map([['p2', { id: 'p2', type: 'place', classes: ['C1PSR'], statut: 'retire' }]]);
assert.equal(S.analyser(paquet, ici2, { ...OPTS, mode: 'identique' }).enTrop.length, 0);
/* Une fiche AESH ou une classe d'élèves n'est jamais « en trop » : on ne les retire pas. */
const ici3 = new Map([['aesh_d01', { id: 'aesh_d01', type: 'aesh', equipes: { PSR_MELEC: 1 } }],
                      ['eleves_C1PSR_2026-2027', { id: 'eleves_C1PSR_2026-2027', type: 'eleves', classe: 'C1PSR' }]]);
assert.equal(S.analyser({ format: S.FORMAT, documents: [] }, ici3, { ...OPTS, mode: 'identique' }).enTrop.length, 0);

/* Un fichier étranger ou d'une autre année est refusé. */
assert.throws(() => S.verifierPaquet({ format: 'autre', documents: [] }, '2026-2027'));
assert.throws(() => S.verifierPaquet({ format: S.FORMAT, documents: [], annee: '2025-2026' }, '2026-2027'));
assert.doesNotThrow(() => S.verifierPaquet({ format: S.FORMAT, documents: [], annee: '2026-2027' }, '2026-2027'));
console.log('Sauvegarde : perimetres, comparaison, retraits et refus de fichier verifies.');
