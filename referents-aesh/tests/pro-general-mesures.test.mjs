/* 27/09/2026 — Ce que la grille dit d'un cours et de ses élèves.
   Trois règles décidées avec Brahim : professionnel ou général, la salle au numéro,
   et une mesure par élève, sans double compte. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estPro, salleNumero, mesureEleve, comptesMesures, carresMesures, MESURES } from '../calculs.js';

test('professionnel : l’atelier, pas la discipline générale', () => {
  /* 27/09/2026 — Les 16 matières professionnelles réelles des 19 classes, après un audit
     qui a trouvé « Réalisation MELEC », « Communication technique » et « Enseignement pro. »
     du mauvais côté. Ce test les tient toutes, pas trois exemples choisis. */
  ['TP production', 'TP service', 'Réception', 'Sciences appliquées production',
   'Chef-d’œuvre', 'Cannage-paillage', 'Vannerie', 'Communication technique',
   'Enseignement pro. (GA)', 'Réalisation MELEC', 'Projet BCP',
   'MP1 Économie d’entreprise', 'MP2 Maintenance équipement', 'MP3 Techniques prof.',
   'MP3/4 Technique pro.', 'MP3/4 Travaux pratiques',
   'Horticulture', 'Atelier cuisine'].forEach(l => assert.equal(estPro(l), true, l));
  /* Et les 20 matières générales, celles-là aussi en entier. */
  ['Français, histoire-géo', 'Anglais', 'Anglais DNL', 'Maths-sciences', 'Mathématiques',
   'EPS', 'Arts appliqués', 'Espagnol', 'Français', 'Histoire-géo, EMC', 'Physique-chimie',
   'Prévention santé environnement', 'Co-enseignement maths', 'Co-enseignement français',
   'Accompagnement perso. maths', 'Accompagnement perso. français', 'Accompagnement personnalisé',
   'Soutien au parcours', 'Éco-gestion', 'Économie-droit'].forEach(l => assert.equal(estPro(l), false, l));
  assert.equal(estPro(''), false);
  assert.equal(estPro(null), false);
});

test('la salle garde son numéro, sans le plateau ni le zéro de tête', () => {
  assert.equal(salleNumero('008_PSR'), 'salle 8');
  assert.equal(salleNumero('010_PSR'), 'salle 10');
  assert.equal(salleNumero('113 INFO'), 'salle 113');
  assert.equal(salleNumero('016A_Arts'), 'salle 16A');
  assert.equal(salleNumero('119A'), 'salle 119A');
  assert.equal(salleNumero(''), '');
  /* une salle sans chiffre garde son nom : mieux vaut « Gymnase » que rien */
  assert.equal(salleNumero('Gymnase'), 'Gymnase');
});

test('un élève porte une mesure et une seule', () => {
  const m = (ulis, aide) => mesureEleve({ code: 'X', ulis, aide });
  assert.equal(m(true, 'individualisee'), 'ULIS + AI');
  assert.equal(m(true, 'mutualisee'), 'ULIS + AM');
  assert.equal(m(true, 'apreciser'), 'ULIS + à préciser');
  assert.equal(m(true, 'aucune'), 'ULIS');
  assert.equal(m(true, ''), 'ULIS');
  assert.equal(m(false, 'individualisee'), 'AI');
  assert.equal(m(false, 'mutualisee'), 'AM');
  assert.equal(m(false, 'apreciser'), 'en attente');
  /* ni ULIS ni aide : l'élève n'est pas notifié, la grille ne le montre pas */
  assert.equal(m(false, 'aucune'), '');
  assert.equal(mesureEleve({ ulis: true }), '', 'sans code, pas d’élève');
});

test('les comptes ne se recouvrent plus : la somme des mesures fait le nombre de notifiés', () => {
  const liste = [
    { code: '99TUW', ulis: true, aide: 'individualisee' },
    { code: 'GXVN7', ulis: true, aide: 'mutualisee' },
    { code: 'QXEQF', ulis: true, aide: 'mutualisee' },
    { code: '8UYC5', ulis: true, aide: 'mutualisee' },
    { code: 'PYEWF', ulis: true, aide: 'mutualisee' },
    { code: '43Y99', ulis: true, aide: 'aucune' },
    { code: 'C8A7N', ulis: false, aide: 'individualisee' },
    { code: 'ZZZZZ', ulis: false, aide: 'aucune' }
  ];
  const c = comptesMesures(liste);
  assert.equal(c.total, 8);
  assert.equal(c.notifies, 7);
  const somme = MESURES.reduce((n, m) => n + c.parMesure[m], 0);
  assert.equal(somme, c.notifies, 'aucun élève compté deux fois');
  assert.deepEqual(carresMesures(c), [['ULIS + AI', 1], ['ULIS + AM', 4], ['ULIS', 1], ['AI', 1]]);
});

test('une liste vide ne casse rien', () => {
  const c = comptesMesures(null);
  assert.equal(c.total, 0);
  assert.equal(c.notifies, 0);
  assert.deepEqual(carresMesures(c), []);
});

/* ─── 27/09/2026 — Deux passages du même AESH dans un cours ───
   Le dessin gardait un seul placement par personne, le dernier rencontré : la grille
   montrait une présence là où le calcul des heures en comptait deux. Ces deux fonctions
   sont la part vérifiable du bloc — le reste est du HTML. */
import { horairePlace, min } from '../calculs.js';

test('deux passages dans le même cours donnent deux barres distinctes', () => {
  const cours = { d: '12:00', f: '15:00', sem: 'TOUTES' };
  const places = [
    { aeshId: 'a1', debut: '12:00', fin: '13:00' },
    { aeshId: 'a1', debut: '14:00', fin: '15:00' }
  ];
  const minutes = min(cours.f) - min(cours.d);
  const barres = places.map(p => {
    const h = horairePlace(p, cours);
    return { top: 100 * (min(h.debut) - min(cours.d)) / minutes, hauteur: 100 * (min(h.fin) - min(h.debut)) / minutes };
  });
  assert.equal(barres.length, 2, 'deux passages, deux barres');
  assert.deepEqual(barres[0], { top: 0, hauteur: 100 / 3 });
  assert.deepEqual(barres[1], { top: 200 / 3, hauteur: 100 / 3 });
  /* et la somme des barres vaut bien les heures comptées : 2 h sur 3 */
  assert.equal(barres.reduce((t, b) => t + b.hauteur, 0), 200 / 3);
});

test('une présence partielle démarre au bon endroit', () => {
  /* le cas réel : un TP de 12 h à 15 h, l'AESH de 13 h à 14 h */
  const cours = { d: '12:00', f: '15:00', sem: 'TOUTES' };
  const h = horairePlace({ debut: '13:00', fin: '14:00' }, cours);
  const minutes = min(cours.f) - min(cours.d);
  assert.equal(100 * (min(h.debut) - min(cours.d)) / minutes, 100 / 3, 'départ au tiers');
  assert.equal(100 * (min(h.fin) - min(h.debut)) / minutes, 100 / 3, 'hauteur d’un tiers');
});
