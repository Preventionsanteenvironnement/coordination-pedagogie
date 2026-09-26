import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as K from '../calculs.js';
/* La fiche est dans app.js, qui a besoin d'un navigateur : on n'extrait que les deux
   fonctions qui composent la présence élève, avec des doublures pour le reste. */
const src = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const corps = src.slice(src.indexOf('    function ligneService(a, o, x, i) {'),
                        src.indexOf('    const o = f.orig || {};'));
const F = new Function('K', 'esc', 'nombre', 'estModif', 'aide', 'aideTexte', 'parQui', 'pas',
  'SERVICES_TYPES', 'libelleService', corps + '; return { champPresence, champHorsPresence };')(
  K, String, v => v == null || v === '' || !Number.isFinite(+v) ? null : +v, () => '', () => '',
  () => '', () => '', (c, v) => `[${v}]`, K.SERVICES_TYPES, n => n);

const a = { presence: 26, services: [{ nom: 'PIAL', h: 12 }, { nom: 'Cantine', h: 1.5 }, { nom: 'DAFI', h: 2 }] };
const p = F.champPresence(a, {}), h = F.champHorsPresence(a, {});
/* Cours et ateliers = ce qui reste de la présence élève, calculé, jamais saisi. */
assert.equal(/Cours et ateliers<\/span><b>([^<]+)/.exec(p)[1], '22,5 h');
/* Le repas et le DAFI sont dedans ; le PIAL est dehors. */
assert.equal((p.match(/data-i="serv-nom"/g) || []).length, 2);
assert.equal((h.match(/data-i="serv-nom"/g) || []).length, 1);
assert.equal(/<b style="font-size:1.05rem">([^<]+)/.exec(h)[1], '12 h');
/* Chaque ligne garde tous ses contrôles : nom, heures, jours, retirer. */
assert.match(p, /data-a="serv-retirer"/);
assert.match(p, /data-a="serv-jour"/);
/* Des dispositifs plus lourds que la présence élève : on le dit, on n'affiche pas un négatif muet. */
assert.match(F.champPresence({ presence: 1, services: [{ nom: 'Cantine', h: 3 }] }, {}), /bandeau warn/);
/* Présence élève vide : aucun calcul inventé. */
assert.match(F.champPresence({ services: [] }, {}), /Cours et ateliers<\/span><b>—/);
console.log('fiche présence élève : ok');
