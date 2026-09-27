import assert from 'node:assert/strict';
import * as K from '../calculs.js';
/* Les cas réels du 26/09/2026, ceux qui affichaient « X h de trop » à tort. */
/* 27/09/2026 — La réunion est écrite, elle n'est plus devinée : une fiche sans réunion ne
   compte plus une heure fantôme. Antoine a bien la sienne, elle figure donc dans sa fiche. */
const ant = { id: 'aesh_d00', contrat: 39, presence: 26, equipes: { PSR_MELEC: 1 }, heures: { PSR_MELEC: 26 },
  filieres: { PSR: { h: 14 } }, services: [{ nom: 'PIAL', h: 12 }],
  reunion: { jour: 0, debut: '13:00', fin: '14:00' } };
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

/* ─── 27/09/2026 — Une réunion due dont le jour n'est pas décidé ───
   Le créneau du lundi 13 h–14 h reste celui de l'équipe PSR-MELEC et s'applique tout seul.
   Mais il ne s'impose plus à qui ne peut pas y être : Nathalie accompagne l'ULIS à cette
   heure-là. Sa fiche porte alors { aFixer: true } — l'heure est due, donc comptée, mais
   rien ne se dessine dans son emploi du temps et l'écran l'écrit en rouge. */
const nathalie = { id: 'aesh_d06', contrat: 29, presence: 28, equipes: { PSR_MELEC: 1 }, heures: { PSR_MELEC: 28 } };
assert.equal(K.heuresReunion(nathalie), 1, 'sans mention contraire, le créneau de l’équipe s’applique');
assert.deepEqual(K.reunionDe(nathalie), { jour: 0, debut: '13:00', fin: '14:00' });

const due = { ...nathalie, reunion: { aFixer: true, pole: 'PSR_MELEC' } };
assert.equal(K.heuresReunion(due), 1, 'l’heure reste due, donc comptée');
assert.equal(K.reunionDe(due), null, 'mais rien ne se dessine : le jour n’est pas décidé');
assert.equal(K.reunionsNonFixees(due).length, 1, 'et elle est signalée comme non fixée');
assert.equal(K.reunionsNonFixees(due)[0].pole, 'PSR_MELEC');

/* Deux pôles : une réunion posée, une à fixer. Le total dit deux heures, et l'écran dit
   laquelle manque. C'est le cas de Cécile, à cheval sur PSR-MELEC et Métiers d'Art. */
const cecile = { id: 'aesh_d05', contrat: 25.5, equipes: { PSR_MELEC: 0.48, MDA: 0.52 },
  heures: { PSR_MELEC: 12, MDA: 13 },
  reunion: { jour: 3, debut: '13:00', fin: '14:00', pole: 'MDA' },
  reunionsSupplementaires: [{ aFixer: true, pole: 'PSR_MELEC' }] };
assert.equal(K.heuresReunion(cecile), 2, 'une posée + une due');
assert.equal(K.reunionsNonFixees(cecile).length, 1);
assert.equal(K.reunionsNonFixees(cecile)[0].pole, 'PSR_MELEC', 'c’est celle du PSR qui manque');
console.log('Réunions : le créneau de l’équipe s’applique seul, une fiche peut le refuser, l’heure due reste comptée et signalée.');
