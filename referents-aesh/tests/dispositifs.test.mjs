import assert from 'node:assert/strict';
import { DISPOSITIFS, SERVICES_TYPES, SIGLES_SERVICE, sigleService, horsClasse } from '../calculs.js';
/* Chaque dispositif a un sigle unique, sigles de réunion compris. */
const sig = SIGLES_SERVICE.map(([s]) => s);
assert.equal(new Set(sig).size, sig.length, 'sigles en double : ' + sig.join(' '));
/* Ce qui doit rester dans la grille d'une classe, et ce qui doit en sortir. */
for (const n of ['Cantine', 'Internat', 'Périscolaire', 'Étude', 'Vie scolaire'])
  assert.equal(horsClasse({ nom: n }), false, n);
for (const n of ['PIAL', 'DAFI', 'ESAT'])
  assert.equal(horsClasse({ nom: n }), true, n);
/* Accents et casse ne changent rien. */
assert.equal(horsClasse({ nom: 'pial' }), true);
assert.equal(horsClasse({ nom: 'Etude' }), false);
/* Un nom inconnu reste visible : rien ne disparaît en silence. */
assert.equal(horsClasse({ nom: 'ULIS piscine' }), false);
/* Le choix du référent prime sur la table. */
assert.equal(horsClasse({ nom: 'ULIS piscine', horsClasse: true }), true);
assert.equal(horsClasse({ nom: 'PIAL', horsClasse: false }), false);
/* « Autre » reste en fin de liste du formulaire. */
assert.equal(SERVICES_TYPES.at(-1), 'Autre');
assert.equal(SERVICES_TYPES.length, DISPOSITIFS.length + 1);
assert.equal(sigleService('ESAT'), 'ES');
console.log('dispositifs : ok');
