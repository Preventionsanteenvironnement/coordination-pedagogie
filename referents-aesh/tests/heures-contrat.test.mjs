import assert from 'node:assert/strict';
import * as K from '../calculs.js';
/* Les cas réels du 26/09/2026, ceux qui affichaient « X h de trop » à tort. */
const ant = { id: 'aesh_d00', contrat: 39, presence: 26, equipes: { PSR_MELEC: 1 }, heures: { PSR_MELEC: 26 },
  filieres: { PSR: { h: 14 } }, services: [{ nom: 'PIAL', h: 12 }] };
const fiona = { id: 'aesh_d03', contrat: 26, presence: 25, equipes: { PSR_MELEC: 1 }, heures: { PSR_MELEC: 25 },
  services: [{ nom: 'Cantine', h: 1.5 }] };
const thierry = { id: 'aesh_x', contrat: 26, presence: 25, equipes: { MDA: 1 }, heures: { MDA: 25 }, reunionH: 1,
  services: [{ nom: 'Cantine', h: 2 }, { nom: 'ESAT', h: 8.5 }] };

/* Le PIAL s'ajoute : c'est de l'administratif. 26 + 12 + 1 = 39. */
assert.equal(K.repartition(ant).somme, 39);
assert.equal(K.repartition(ant).solde, 0);
/* La cantine est DANS la présence élève, jamais en plus. 25 + 1 = 26. */
assert.equal(K.repartition(fiona).somme, 26);
assert.equal(K.repartition(fiona).solde, 0);
/* Cantine et ESAT comptent tous deux auprès d'élèves : rien ne s'ajoute. */
assert.equal(K.repartition(thierry).somme, 26);
assert.equal(K.repartition(thierry).eleves, 10.5);
assert.equal(K.repartition(thierry).hors, 0);
/* Tant que la présence élève n'est pas saisie, la somme des filières en tient lieu. */
const sansPresence = { ...fiona }; delete sansPresence.presence;
assert.equal(K.repartition(sansPresence).presence, 25);
assert.equal(K.repartition(sansPresence).presenceSaisie, null);
/* L'écart entre les filières et la présence élève est nommé, plus caché dans un total. */
const fauche = { ...ant, heures: { PSR_MELEC: 30 } };
assert.equal(K.repartition(fauche).ecartFilieres, 4);
assert.equal(K.repartition(ant).ecartFilieres, 0);
/* Un dispositif peut être rangé à la main, et ce choix prime sur la table. */
const range = { ...fiona, services: [{ nom: 'Cantine', h: 1.5, avecEleves: false }] };
assert.equal(K.repartition(range).somme, 27.5);
/* Un écart de filières ne fausse plus le contrat : il se dit à part. */
assert.equal(K.repartition(fauche).solde, 0);
/* Le texte dit d'où vient chaque heure quand le contrat déborde. */
assert.match(K.repartition(ant).texte, /^contrat de 39 h/);
assert.match(K.repartition({ ...ant, contrat: 35 }).texte,
  /présence élève 26 h \+ pial 12 h \+ réunion 1 h = 39 h, pour un contrat de 35 h : 4 h de trop/);
console.log('heures du contrat : ok');
