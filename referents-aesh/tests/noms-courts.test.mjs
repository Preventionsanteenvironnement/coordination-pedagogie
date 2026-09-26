import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as K from '../calculs.js';
/* Les noms courts décidés avec Brahim, calés sur les classeurs d'Antoine. */
const attendu = {
  'Prévention santé environnement': 'PSE',
  'Enseignement pro. (GA)': 'Ens. pro',
  'Accompagnement perso. maths': 'AP maths',
  'Accompagnement perso. français': 'AP français',
  'Accompagnement personnalisé': 'AP',
  'Communication technique': 'Com. tech.',
  'Français, histoire-géo': 'Français-HG',
  'Mathématiques': 'Maths',
};
for (const [long, court] of Object.entries(attendu)) assert.equal(K.libCourt(long), court, long);
/* Ce qui n'a pas de nom court garde le sien, entier. */
for (const n of ['Anglais', 'Français', 'EPS', 'Chef-d’œuvre', 'Vannerie', 'Réalisation MELEC', 'TP service'])
  assert.equal(K.libCourt(n), n, n);
/* Un libellé inconnu passe tel quel : rien ne devient vide. */
assert.equal(K.libCourt('Atelier théâtre'), 'Atelier théâtre');
assert.equal(K.libCourt(''), '');
assert.equal(K.libCourt(undefined), undefined);
/* Aucun nom court ne dépasse 16 caractères : au-delà, un bloc d'une heure ne l'affiche pas. */
const cours = JSON.parse(fs.readFileSync(new URL('../edt-lycee.json', import.meta.url), 'utf8')).cours;
const trop = [...new Set(Object.values(cours).map(c => K.libCourt(c.lib)))].filter(x => x && x.length > 17);
assert.deepEqual(trop, [], 'trop longs : ' + trop.join(', '));
console.log('noms courts : ok');
