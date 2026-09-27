import assert from 'node:assert/strict';
import { COULEURS_FIXES, couleurAesh, encreAesh, encreSur } from '../presences.js';
/* Les couleurs des tableaux d'Antoine, à l'identique. */
assert.equal(couleurAesh('aesh_d01'), '#a3c1e3');  // Antoine
assert.equal(couleurAesh('aesh_d02'), '#ebb38b');  // Timothée
assert.equal(couleurAesh('aesh_d03'), '#c9c9c9');  // Fiona
assert.equal(couleurAesh('aesh_d04'), '#f8da78');  // Stella
/* Elles ne dépendent plus du rang de création : deux fiches différentes gardent la leur. */
assert.notEqual(couleurAesh('aesh_d01'), couleurAesh('aesh_d02'));
/* Ailleurs, la couleur reste calculée, stable pour un même identifiant. */
assert.equal(couleurAesh('aesh_d09'), couleurAesh('aesh_d09'));
assert.match(couleurAesh('aesh_d09'), /^#[0-9a-f]{6}$/);
/* Sur un fond clair on écrit sombre, sur un fond sombre on écrit blanc. */
for (const id of ['aesh_d01', 'aesh_d02', 'aesh_d03', 'aesh_d04']) assert.equal(encreAesh(id), '#12202a', id);
assert.equal(encreAesh('aesh_d05'), '#ffffff');
assert.equal(encreSur('#ffffff'), '#12202a');
assert.equal(encreSur('#000000'), '#ffffff');
/* Une couleur absente ou mal formée ne casse rien. */
assert.equal(encreSur(''), '#ffffff');
assert.equal(encreSur(undefined), '#ffffff');
/* 27/09 — Même palette pour les quatre pôles, et deux AESH n'ont jamais la même couleur :
   la couleur calculée en donnait quatre paires, dont AC et GB en Métiers d'Art. */
const ids = Object.keys(COULEURS_FIXES), teintes = Object.values(COULEURS_FIXES);
assert.equal(new Set(teintes).size, teintes.length, 'deux AESH partagent une couleur');
assert.ok(ids.length >= 22, 'la table doit couvrir les AESH des quatre pôles');
/* La table fait foi : la couleur ne dépend plus du rang de création de la fiche. */
for (const id of ids) assert.equal(couleurAesh(id), COULEURS_FIXES[id], id);
/* Chaque couleur reste lisible, en noir ou en blanc, jamais autre chose. */
for (const id of ids) assert.ok(['#12202a', '#ffffff'].includes(encreAesh(id)), id);
console.log('couleurs des AESH : ok');
