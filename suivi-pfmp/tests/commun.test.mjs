import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fauxModulaire, fauxCompat, creerBase } from './faux-firestore.mjs';

await import(new URL('../pfmp-commun.js', import.meta.url));
const P = globalThis.PFMP_COMMUN;
const attendre = () => new Promise(r => setTimeout(r, 5));

/* 1. Les 21 étapes de l'Atelier gardent leur identifiant. */
const ATELIER = ['search', 'pre_given', 'pre_return', 'pronote', 'convention', 'pedagogy', 'family', 'company', 'bde', 'head', 'copies',
  'accommodation', 'arrival', 'installed', 'evaluation_sent', 'visit', 'assessment', 'attestation', 'attestation_bde', 'appreciation', 'evaluation_pro'];
ATELIER.forEach(id => assert.ok(P.PAR_ID[id], 'étape Atelier absente : ' + id));
assert.equal(new Set(P.ETAPES.map(e => e.id)).size, P.ETAPES.length, 'identifiants en double');
assert.equal(P.ETAPES.length, 44);
assert.deepEqual(P.ETAPES.filter(e => e.ph === 2).map(e => e.id), ['neg_visit', 'neg_company', 'neg_family', 'neg_pro', 'neg_return', 'neg_signed']);
assert.ok(P.PAR_ID.pre_visa && !P.ETAPES.includes(P.PAR_ID.pre_visa), 'pre_visa retirée mais reconnue');
assert.deepEqual(P.ETAPES.filter(e => e.flag).map(e => e.id), ['search', 'conv_return', 'attestation', 'student_eval']);
P.ETAPES.filter(e => e.ah).forEach(e => assert.ok(e.local, 'aide humaine en ligne : ' + e.id));
console.log('Étapes : 44 (fiche de négociation en phase 3), les 21 de l’Atelier conservées, aide humaine jamais en ligne.');

/* 2. Dernier jour de cours et échéances, sur les vraies vacances 2026-2027. */
const VAC = [{ d: '2026-10-17', f: '2026-11-02' }, { d: '2026-12-19', f: '2027-01-04' }, { d: '2027-02-13', f: '2027-03-01' },
  { d: '2027-04-10', f: '2027-04-26' }, { d: '2027-05-05', f: '2027-05-10' }, { d: '2027-07-03', f: '2027-08-31' }];
const FER = [{ d: '2026-11-11' }, { d: '2027-05-17' }];
assert.equal(P.dernierJourDeCours('2027-01-04', VAC, FER), '2026-12-18');
assert.equal(P.dernierJourDeCours('2027-05-31', VAC, FER), '2027-05-28');
const p1 = { debut: '2027-01-04', fin: '2027-01-17', dernierJour: '2026-12-18' };
const p2 = { debut: '2027-05-31', fin: '2027-06-27', dernierJour: '2027-05-28' };
assert.equal(P.echeance(P.PAR_ID.copies, p1).date, '2026-12-18');
assert.equal(P.echeance(P.PAR_ID.search, p1).date, '2026-11-13');
assert.equal(P.echeance(P.PAR_ID.neg_signed, p1).date, '2026-11-18');
assert.equal(P.echeance(P.PAR_ID.conv_return, p1).date, '2026-12-07');
assert.equal(P.echeance(P.PAR_ID.arrival, p1).date, '2026-12-18', 'PFMP 1 : appel avant les vacances');
assert.equal(P.echeance(P.PAR_ID.arrival, p2).date, '2027-05-24');
assert.equal(P.echeance(P.PAR_ID.installed, p1).date, '2027-01-05');
assert.equal(P.echeance(P.PAR_ID.assessment, p1).date, '2027-01-14');
assert.equal(P.echeance(P.PAR_ID.midpoint, p1).date, '2027-01-10');
assert.equal(P.echeance(P.PAR_ID.search, p1).proposee, true);
assert.equal(P.echeance(P.PAR_ID.copies, p1).proposee, false);
console.log('Échéances : dernier jour 18/12 et 28/05, appel au tuteur avant Noël.');

/* 3. Droits : qui peut faire quoi. */
const A = (id, e, r) => P.actions(P.PAR_ID[id], { e }, r);
assert.deepEqual(A('search', '', 'eleve'), ['declarer']);
assert.deepEqual(A('search', 'declare', 'referent'), ['valider', 'corriger']);
assert.deepEqual(A('search', 'declare', 'eleve'), ['annuler']);
assert.deepEqual(A('search', 'valide', 'eleve'), [], 'l’élève ne retire pas un drapeau');
assert.deepEqual(A('pre_given', '', 'referent'), ['remettre']);
assert.deepEqual(A('pre_given', 'remis', 'eleve'), ['recevoir']);
assert.deepEqual(A('pre_given', '', 'eleve'), ['recevoir'], 'l’élève peut confirmer même si le référent n’a rien coché');
assert.deepEqual(A('pre_return', 'remis', 'referent'), ['recevoir', 'corriger']);
assert.deepEqual(A('pre_return', 'remis', 'pp'), ['recevoir', 'corriger'], 'le PP peut tout ce que fait le référent');
assert.deepEqual(A('pronote', '', 'eleve'), []);
assert.deepEqual(A('pronote', '', 'pp'), ['faire']);
assert.deepEqual(A('ah_docs', '', 'eleve'), []);
assert.deepEqual(A('sent', '', 'pp'), ['remettre']);
assert.deepEqual(A('sent', 'remis', 'referent'), ['recevoir']);
assert.deepEqual(A('here', '', 'eleve'), ['declarer']);
assert.deepEqual(A('here', 'fait', 'eleve'), ['annuler']);
assert.throws(() => P.appliquer({ etapes: {} }, 'pronote', 'faire', 'eleve'), /pas possible/);
assert.throws(() => P.appliquer({ etapes: { search: { e: 'declare' } } }, 'search', 'corriger', 'referent', {}), /corriger/);
console.log('Droits : élève, référent et PP vérifiés étape par étape.');

/* 4. Identifiants. */
assert.equal(P.suiviId('2026-2027', 'k4a7', 1), '2026-2027_K4A7_p1');
assert.throws(() => P.suiviId('2026', 'K4A7', 1));
assert.throws(() => P.referentId('2026-2027', '1234'));
assert.equal(P.referentId('2026-2027', '482193'), '2026-2027_482193');
assert.equal(P.sigleDe('Sylvie Fara'), 'S. F.');
assert.equal(P.sigleDe('MECHERI Brahim'), 'M. B.');
let k = 0; const c = P.nouveauCodeReferent(['100000'], () => (k++ ? 0.5 : 0));
assert.equal(c, '550000', 'un code déjà pris est évité');
console.log('Identifiants : suivi, référent, sigle, codes à 6 chiffres.');

/* 5. Le circuit complet, sur les deux SDK, avec les contrôles des règles. */
async function circuit(svcPP, svcEl, svcRef, base) {
  const id = '2026-2027_Z9T4_p1';
  await svcPP.publierSuivi({ annee: '2026-2027', code: 'z9t4', periode: 1, classe: 'TEST', libelle: 'PFMP 1', ...p1, refSigle: 'T. R.' });
  await svcPP.publierReferent('2026-2027', '900001', 'T. R.', [id]);
  let vu = null; svcRef.ecouterSuivi(id, d => { vu = d; }); await attendre();
  assert.equal(vu.code, 'Z9T4'); assert.equal(vu.version, 1);

  await svcEl.majPistes(id, l => l.concat([{ structure: 'Cabinet comptable', secteur: 'Services', moyen: 'appel', date: '2026-10-07', reponse: 'attente' }]));
  await svcEl.declarerTrouve(id, { structure: 'Mairie (service accueil)', secteur: 'Administration' });
  await attendre();
  assert.equal(vu.etapes.search.e, 'declare');
  assert.deepEqual(P.aVerifier(vu).map(e => e.id), ['search']);
  await svcRef.agir(id, 'search', 'corriger', 'referent', { motif: 'Précise le service' });
  await svcEl.declarerTrouve(id, { structure: 'Mairie (service état civil)', secteur: 'Administration' });
  await svcRef.agir(id, 'search', 'valider', 'referent');
  await svcRef.agir(id, 'pre_given', 'remettre', 'referent');
  await svcEl.agir(id, 'pre_given', 'recevoir', 'eleve');
  await svcEl.agir(id, 'pre_return', 'remettre', 'eleve');
  await svcRef.agir(id, 'pre_return', 'recevoir', 'referent');
  await svcRef.agir(id, 'visit', 'faire', 'referent', { v: '2027-01-14 10:00' });
  await svcEl.envoyerMessage(id, 'eleve', '', 'Bonjour, j’ai trouvé !');
  await svcRef.envoyerMessage(id, 'referent', 'T. R.', 'Bravo, passe me voir mardi.');
  await attendre();
  assert.equal(vu.etapes.search.e, 'valide');
  assert.equal(vu.etapes.pre_return.e, 'valide');
  assert.equal(vu.visite.le, '2027-01-14 10:00');
  assert.equal(vu.pistes.length, 1);
  assert.equal(vu.trouve.structure, 'Mairie (service état civil)');
  assert.ok(vu.version >= 10);
  let msgs = []; svcEl.ecouterMessages(id, l => { msgs = l; }); await attendre();
  assert.deepEqual(msgs.map(m => m.de), ['eleve', 'referent']);
  let journal = []; svcRef.ecouterJournal(id, l => { journal = l; }); await attendre();
  assert.ok(journal.some(j => j.etape === 'search' && j.e === 'corriger' && j.motif));
  await assert.rejects(svcEl.agir(id, 'pronote', 'faire', 'eleve'), /pas possible/);
  await assert.rejects(svcEl.envoyerMessage(id, 'eleve', '', '   '), /vide/);

  /* L'Atelier republie : les dates changent, les étapes saisies en ligne restent. */
  await svcPP.publierSuivi({ annee: '2026-2027', code: 'Z9T4', periode: 1, classe: 'TEST', libelle: 'PFMP 1', ...p1, refSigle: 'T. R.',
    etapesPP: [['search', { e: '', par: 'pp', le: '2020-01-01T00:00:00Z' }], ['referent', { e: 'fait', par: 'pp', le: '2099-01-01T00:00:00Z' }], ['accommodation', { e: 'fait', par: 'pp', le: '2099-01-01T00:00:00Z' }]] });
  await attendre();
  assert.equal(vu.etapes.search.e, 'valide', 'une étape plus récente en ligne n’est pas écrasée');
  assert.equal(vu.etapes.referent.e, 'fait');
  assert.equal(vu.etapes.accommodation, undefined, 'une étape locale ne part pas en ligne');
  assert.deepEqual(P.verifierSuivi(vu), []);
  const tout = [...base.store.keys()];
  assert.ok(tout.every(k => k.startsWith('coordination_pfmp_')), 'rien en dehors des collections PFMP');
  return vu;
}

{ const { F, db, base } = fauxModulaire(); const s = P.service(P.depotModulaire(F, db)); await circuit(s, s, s, base); }
{ const base = creerBase(); const m = fauxModulaire(base); const c = fauxCompat(base);
  const sPP = P.service(P.depotModulaire(m.F, m.db)); const sEl = P.service(P.depotCompat(c.fs));
  await circuit(sPP, sEl, sPP, base); }
console.log('Circuit complet : élève (SDK compat de mapse.fr) ↔ référent ↔ PP (SDK modulaire), contrôles des règles respectés.');

/* 6. Les règles refusent ce qui doit l'être. */
{ const { F, db, base } = fauxModulaire(); const s = P.service(P.depotModulaire(F, db));
  await s.publierSuivi({ annee: '2026-2027', code: 'Z9T5', periode: 2, classe: 'TEST', ...p2 });
  assert.throws(() => base.ecrire('coordination_pfmp_suivi/2026-2027_Z9T5_p2', { ...base.store.get('coordination_pfmp_suivi/2026-2027_Z9T5_p2'), nom: 'Dupont' }), /permission/);
  assert.throws(() => base.ecrire('coordination_pfmp_suivi/2026-2027_Z9T5_p2', { ...base.store.get('coordination_pfmp_suivi/2026-2027_Z9T5_p2') }), /version/);
  assert.throws(() => base.ecrire('autre/x', {}), /permission/);
  await assert.rejects(s.publierSuivi({ annee: '2026-2027', code: 'Z9', periode: 1 }), /invalide/);
}
console.log('Règles : champ en trop, version non incrémentée, autre collection et code invalide refusés.');

/* 7. Les trois copies du socle sont identiques. */
const copies = [
  new URL('../pfmp-commun.js', import.meta.url),
  new URL('../../../PSE/pfmp-agora/pfmp-commun.js', import.meta.url),
  new URL('file:///Users/brahms/Developer/atelier-pse/outputs/Atelier-unifie/EDITEUR/pfmp-commun.js')
].filter(u => fs.existsSync(u));
const contenus = copies.map(u => fs.readFileSync(u, 'utf8'));
contenus.forEach((t, i) => assert.equal(t, contenus[0], 'copie différente : ' + copies[i].pathname));
console.log('Socle : ' + copies.length + ' copie(s) identique(s).');

/* 8. Année scolaire et filière. */
assert.equal(P.anneeScolaire(new Date(2026, 9, 6)), '2026-2027');
assert.equal(P.anneeScolaire(new Date(2027, 5, 30)), '2026-2027');
assert.equal(P.anneeScolaire(new Date(2027, 7, 25)), '2027-2028');
assert.equal(P.filiereDe('B2GATL2'), 'AGOrA');
assert.equal(P.filiereDe('B1MELEC'), 'MELEC');
assert.equal(P.filiereDe('C1PSR'), 'CAP PSR');
console.log('Année scolaire et filière : vérifiées.');
