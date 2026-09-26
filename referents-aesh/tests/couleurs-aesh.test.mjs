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
for (const id of Object.keys(COULEURS_FIXES)) assert.equal(encreAesh(id), '#12202a', id);
assert.equal(encreAesh('aesh_d05'), '#ffffff');
assert.equal(encreSur('#ffffff'), '#12202a');
assert.equal(encreSur('#000000'), '#ffffff');
/* Une couleur absente ou mal formée ne casse rien. */
assert.equal(encreSur(''), '#ffffff');
assert.equal(encreSur(undefined), '#ffffff');
console.log('couleurs des AESH : ok');
