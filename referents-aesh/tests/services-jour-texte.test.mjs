/* 28/09/2026 — Le jour d'un créneau de service peut arriver en TEXTE des imports.
   Ce test existe parce qu'une fiche imprimée est partie sans sa demi-pension :
   19 créneaux sur 23 étaient jetés en silence par normaliserAesh. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const src = readFileSync(new URL('../calculs.js', import.meta.url), 'utf8');
const K = await import('data:text/javascript;base64,' + Buffer.from(src).toString('base64'));

const creneau = (jour) => ({ jour, debut: '12:30', fin: '13:00', du: '2026-09-01', au: '2027-07-02', semaines: 'AB' });
const fiche = (horaires) => ({
  id: 'aesh_t1', type: 'aesh', annee: '2026-2027', sigle: 'TT', version: 1, majLe: '',
  equipes: { PSR_MELEC: true }, heures: {}, jours: [0, 1, 2, 3, 4],
  services: [{ nom: 'Cantine', h: 1.5, jours: [0, 2, 3], horaires }]
});
const horairesDe = (a) => (K.servicesDe(a)[0] || {}).horaires || [];

test('un jour écrit en texte est accepté, pas jeté', () => {
  K.remettreCompteurRejets();
  const a = K.normaliserAesh(fiche([creneau('0'), creneau('2'), creneau('3')]), ['PSR_MELEC'], null);
  assert.equal(horairesDe(a).length, 3, 'les trois créneaux doivent survivre');
  assert.deepEqual(horairesDe(a).map(h => h.jour), [0, 2, 3], 'et être rangés en nombres');
  assert.equal(K.REJETS.services, 0, 'aucun rejet à signaler');
});

test('un jour vraiment invalide est refusé ET signalé', () => {
  K.remettreCompteurRejets();
  const a = K.normaliserAesh(fiche([creneau('0'), creneau('samedi'), creneau(9)]), ['PSR_MELEC'], null);
  assert.equal(horairesDe(a).length, 1, 'seul le créneau valide reste');
  assert.equal(K.REJETS.services, 2, 'les deux rejets sont comptés');
  assert.equal(K.REJETS.details[0].sigle, 'TT', 'et on sait de qui il s’agit');
});

test('le compteur repart à zéro à chaque indexation', () => {
  K.remettreCompteurRejets();
  K.normaliserAesh(fiche([creneau('lundi')]), ['PSR_MELEC'], null);
  assert.equal(K.REJETS.services, 1);
  K.indexer([], [], ['PSR_MELEC'], null);
  assert.equal(K.REJETS.services, 0, 'une nouvelle lecture ne garde pas les rejets de la précédente');
});

test('serviceALieu accepte les deux écritures du jour', () => {
  const ctx = { C: { off: () => '', parite: () => 'A' } };
  const a = { jours: [0, 1, 2, 3, 4] };
  const lundi = '2026-09-28'; // un lundi
  assert.equal(K.serviceALieu(ctx, a, {}, creneau(0), lundi), true, 'jour en nombre');
  assert.equal(K.serviceALieu(ctx, a, {}, creneau('0'), lundi), true, 'jour en texte');
  assert.equal(K.serviceALieu(ctx, a, {}, creneau(1), lundi), false, 'un autre jour ne passe pas');
});

/* 28/09/2026 — Le pôle de la réunion, sur la fiche individuelle.
   CÉ a deux réunions : Métiers d'Art le jeudi, MELEC le lundi. « Réunion d'équipe »
   tout court ne permettait pas de les distinguer à l'impression. */
test('le pôle de la réunion : certain, ou rien', () => {
  const r = { jour: 3, debut: '13:00', fin: '14:00' };
  assert.equal(K.poleReunion({ equipes: { MDA: true }, reunion: r }), 'MDA',
    'un seul pôle : la réponse est certaine');
  assert.equal(K.poleReunion({ equipes: { MDA: true, PSR_MELEC: true }, rattachement: 'PSR_MELEC', reunion: r }), '',
    'deux pôles sans précision : on ne devine pas, même avec un rattachement');
  assert.equal(K.poleReunion({ equipes: { MDA: true, PSR_MELEC: true }, rattachement: 'PSR_MELEC', reunion: { ...r, pole: 'MDA' } }), 'MDA',
    'le pôle écrit sur la réunion l’emporte sur le rattachement');
  assert.equal(K.poleReunion({ equipes: {}, reunion: r }), '', 'aucune équipe : rien');
  assert.equal(K.poleReunion(null), '', 'pas de fiche : rien');
});
