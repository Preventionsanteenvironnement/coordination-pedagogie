/* 26/09/2026 — Ce que la grille a le droit de montrer d'un élève : des nombres.
   Le code de suivi, les dates et les aménagements d'épreuve restent dans l'onglet « Élèves ». */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = path.resolve(import.meta.dirname, '..'), memo = new Map();
function uri(file) { if (memo.has(file)) return memo.get(file); let s = fs.readFileSync(path.join(root, file), 'utf8'); s = s.replace(/from '(\.\/[^'?]+)(?:\?[^']*)?'/g, (_, p) => `from '${uri(p.slice(2))}'`); const u = 'data:text/javascript;base64,' + Buffer.from(s).toString('base64'); memo.set(file, u); return u; }
const V = await import(uri('vues-planning.js'));

const classe = [
  { code: 'GXVN7', notif: 'oui', aide: 'mutualisee', heures: '', ulis: true, fin: '31/08/2027' },
  { code: '99TUW', notif: 'encours', aide: 'individualisee', heures: '15 h', ulis: true, fin: '' },
  { code: 'C8A7N', notif: 'encours', aide: 'individualisee', heures: '', ulis: false, fin: '' },
  { code: '43Y99', notif: 'non', aide: 'aucune', heures: '', ulis: true, fin: '' },
];
const c = V.comptesEleves(classe);
assert.equal(c.total, 4);
assert.equal(c.notifies, 3);          // « non » ne compte pas
assert.equal(c.ai, 2);
assert.equal(c.am, 1);
assert.equal(c.ulis, 3);              // un élève ULIS sans aide humaine compte quand même
assert.equal(c.heures, 15);
assert.equal(V.libelleEleves(c), '3 él. · 2 AI · 1 AM · 3 ULIS');

/* Une classe sans personne de notifié n'écrit rien sur les blocs : pas de bruit inutile. */
assert.equal(V.libelleEleves(V.comptesEleves([{ code: 'AAAAA', notif: 'non' }])), '');
assert.equal(V.libelleEleves(V.comptesEleves([])), '');
/* Un seul notifié : le compteur reste court. */
assert.equal(V.libelleEleves(V.comptesEleves([{ code: 'AAAAA', notif: 'oui', aide: 'aucune' }])), '1 él.');
/* Les heures acceptent « 15 h », « 2,5 » ou rien, sans jamais casser le total. */
assert.equal(V.comptesEleves([{ code: 'A', notif: 'oui', heures: '2,5' }, { code: 'B', notif: 'oui', heures: 'à préciser' }]).heures, 2.5);
/* Une entrée sans code est ignorée : un document abîmé ne fausse pas le compte. */
assert.equal(V.comptesEleves([{ notif: 'oui' }, { code: 'A', notif: 'oui' }]).total, 1);

/* Le document de classe ne porte aucun nom : la liste des champs est close. */
const init = JSON.parse(fs.readFileSync(path.join(root, 'tests', 'eleves-exemple.json'), 'utf8'));
for (const e of init) {
  assert.deepEqual(Object.keys(e).sort(),
    ['aide', 'amenagements', 'code', 'doc', 'fin', 'heures', 'notif', 'support', 'ulis']);
  assert.match(e.code, /^[A-HJKMNP-Z2-9]{5}$/);
}
console.log('Élèves notifiés : comptes, libellé de bloc et champs du document verifies.');
