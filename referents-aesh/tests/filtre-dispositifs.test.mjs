import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as K from '../calculs.js';
/* Le filtre de la grille de classe, extrait d'app.js avec ses seules dépendances. */
const src = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const deb = src.indexOf('  const cleDisp = nom =>');
const fin = src.indexOf('  };', src.indexOf('  const montrerDisp = o =>')) + 4;
const faire = opts => new Function('optionsGrille', 'horsClasse',
  src.slice(deb, fin) + '; return { cleDisp, montrerDisp };')(opts, K.horsClasse);

/* Par défaut : l'emploi du temps DES ÉLÈVES. Le repas et l'internat oui ; PIAL, DAFI, ESAT non. */
const d = faire({});
for (const n of ['Cantine', 'Internat', 'Périscolaire']) assert.equal(d.montrerDisp({ label: n }), true, n);
for (const n of ['PIAL', 'DAFI', 'ESAT']) assert.equal(d.montrerDisp({ label: n }), false, n);
/* Un dispositif inventé reste visible : rien ne disparaît en silence. */
assert.equal(d.montrerDisp({ label: 'ULIS piscine' }), true);
/* Le choix du référent prime, dans les deux sens, et se retient par dispositif. */
const choisi = faire({ 'disp:DAFI': true, 'disp:Cantine': false });
assert.equal(choisi.montrerDisp({ label: 'DAFI' }), true);
assert.equal(choisi.montrerDisp({ label: 'Cantine' }), false);
/* Cocher le DAFI ne fait pas entrer le PIAL : c'est tout l'objet du filtre. */
assert.equal(choisi.montrerDisp({ label: 'PIAL' }), false);
/* Un service rangé à la main par son référent garde son rangement. */
assert.equal(d.montrerDisp({ label: 'ULIS piscine', horsClasse: true }), false);
assert.equal(d.cleDisp('DAFI'), 'disp:DAFI');
console.log('filtre des dispositifs : ok');
