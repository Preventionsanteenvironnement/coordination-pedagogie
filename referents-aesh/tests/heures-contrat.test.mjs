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

/* ─── 27/09/2026 — Les défauts trouvés par l'audit, tenus par des tests ───
   Les trois premiers passaient AVANT parce qu'ils interrogeaient une fiche brute.
   Une fiche arrive toujours par indexer() : c'est ce chemin-là qu'il faut éprouver. */
const idx = fiches => K.indexer(fiches, [], ['PSR_MELEC', 'MDA'], null).aesh;

/* 1. la réunion « à fixer » survivait mal : la normalisation la jetait, et le créneau
      automatique de l'équipe revenait par-dessus. Nathalie voyait une réunion qu'elle ne
      peut pas faire, à l'heure où elle accompagne l'ULIS. */
{
  const a = idx([{ type: 'aesh', id: 'aesh_d06', sigle: 'NA', equipes: { PSR_MELEC: 1 },
    heures: {}, reunion: { aFixer: true, pole: 'PSR_MELEC', heures: 1 } }]).get('aesh_d06');
  assert.equal(K.reunionDe(a), null, 'rien ne se dessine : le jour n’est pas décidé');
  assert.equal(K.heuresReunion(a), 1, 'mais l’heure est due, donc comptée');
  assert.equal(K.reunionsNonFixees(a)[0].pole, 'PSR_MELEC', 'et elle est signalée');
}

/* 2. le créneau de l'équipe PSR écrasait le vrai jour d'une personne à cheval sur deux
      pôles : Cécile se réunit le jeudi avec les Métiers d'Art. */
{
  const a = idx([{ type: 'aesh', id: 'aesh_d05', sigle: 'CÉ', equipes: { PSR_MELEC: 0.48, MDA: 0.52 },
    heures: {}, reunion: { jour: 3, debut: '13:00', fin: '14:00', pole: 'MDA' },
    reunionsSupplementaires: [{ aFixer: true, pole: 'PSR_MELEC' }] }]).get('aesh_d05');
  assert.deepEqual(K.reunionDe(a), { jour: 3, debut: '13:00', fin: '14:00', pole: 'MDA' });
  assert.equal(K.heuresReunion(a), 2, 'une posée + une due');
}

/* 3. les équipes de départ doublonnaient les vraies fiches : après le renommage des sigles,
      les fantômes portaient les mêmes lettres que des personnes réelles. */
{
  const depart = [{ id: 'aesh_d99', type: 'aesh', sigle: 'SA', equipes: { AGORA: 1 }, heures: {} }];
  const vide = K.indexer([], depart, ['AGORA'], null).aesh;
  assert.equal(vide.size, 1, 'un pôle sans aucune fiche garde son équipe de départ');
  const plein = K.indexer([{ type: 'aesh', id: 'aesh_x', sigle: 'RA', equipes: { AGORA: 1 }, heures: {} }], depart, ['AGORA'], null).aesh;
  assert.equal(plein.size, 1, 'dès qu’une fiche existe pour ce pôle, plus de fantôme');
  assert.equal([...plein.values()][0].sigle, 'RA');
}

/* 4. une fiche portant À LA FOIS aFixer et des horaires était comptée deux fois. */
{
  const a = idx([{ type: 'aesh', id: 'aesh_z', sigle: 'ZZ', equipes: { MDA: 1 }, heures: {},
    reunion: { aFixer: true, jour: 1, debut: '13:00', fin: '14:00' } }]).get('aesh_z');
  assert.equal(K.heuresReunion(a), 1, 'des horaires écrits l’emportent : une seule heure');
}
console.log('Audit du 27/09 : réunion à fixer, deux pôles, fantômes et double comptage vérifiés APRÈS normalisation.');
