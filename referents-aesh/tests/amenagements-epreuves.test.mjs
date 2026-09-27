import assert from 'node:assert/strict';
import fs from 'node:fs';
/* 27/09 — Le portail et l'Atelier doivent nommer la même chose de la même façon :
   sinon on saisit deux fois, et les deux divergent au premier changement. */
const app = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const lire = nom => {
  const m = app.match(new RegExp(nom + String.raw`\s*=\s*\[([\s\S]*?)\];`));
  return [...m[1].matchAll(/\['([^']*)',\s*'([^']*)'\]/g)].map(x => [x[1], x[2]]);
};
const amen = lire('EL_AMEN').map(x => x[0]);
/* Les cinq cases du tableau « Organisation Aide Humaine ». */
for (const c of ['dispense', 'tiers', 'lecteur', 'scripteur', 'assistant', 'isole'])
  assert.ok(amen.includes(c), 'case manquante : ' + c);
/* Le type de sujet est un CHOIX, pas des cases : on n'en a qu'un. */
const sujets = lire('EL_SUJETS').map(x => x[0]);
assert.deepEqual(sujets, ['', 'Ordinaire', 'Agrandi', 'Braille', 'Numérique']);
/* Les mêmes mots que l'Atelier, à la lettre. */
const mpa = lire('EL_MPA').map(x => x[0]);
assert.deepEqual(mpa, ['', 'PC du centre', 'PC du candidat']);
/* L'agrandissement a son champ : « Arial 16 » ne se devine pas depuis une case. */
assert.match(app, /data-i="el-agrandissement"/);
assert.match(app, /'el-agrandissement': \['agrandissement', 40\]/);
/* Les deux nouveaux choix passent par le répartiteur, sinon un clic ne fait rien. */
assert.match(app, /\^el-\(notif\|aide\|doc\|sujet\|mpa\)/);
/* L'export reprend les mêmes colonnes, dans le même ordre. */
assert.match(app, /'Sujet', 'Agrandissement', 'Matériel', 'Support'/);
console.log('aménagements d’épreuves : ok');
