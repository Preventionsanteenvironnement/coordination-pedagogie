import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../acces-planning.js',import.meta.url),'utf8');
const {verifierCodePlanning,authentifierPlanning}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const d={accesPlanning:{actif:true,code:'1234'}};
const acces=verifierCodePlanning('1234',d);
assert.deepEqual(acces.ecritureClasses,['C1PSR','C2PSR']);
assert.equal(acces.lectureClasses.includes('B2MELEC'),true);
assert.equal(acces.ecritureClasses.includes('B2MELEC'),false);
for(const [code,doc] of [['0000',d],['123456',d],['123',d],['1234',null],['1234',{accesPlanning:{actif:false,code:'1234'}}]])
 assert.throws(()=>verifierCodePlanning(code,doc));
assert.equal(acces.sessionValide(d),true);
assert.equal(acces.sessionValide({accesPlanning:{actif:true,code:'5678'}}),false);
assert.equal(acces.sessionValide({accesPlanning:{actif:false,code:'1234'}}),false);
let reads=0;
const FS={doc:(_,col,id)=>{assert.equal(col,'coordination_referents_aesh');assert.equal(id,'pole_PSR_MELEC');return id;},getDocFromServer:async()=>{reads++;return {exists:()=>true,data:()=>d};}};
assert.equal((await authentifierPlanning('1234',FS,{})).pole,'PSR_MELEC');assert.equal(reads,1);
await assert.rejects(authentifierPlanning('1234',null,{}));
await assert.rejects(authentifierPlanning('1234',{...FS,getDocFromServer:async()=>{throw new Error('hors ligne');}},{}));
console.log('Accès simple : code, 4 chiffres, PSR/MELEC, désactivation, changement de code et panne réseau vérifiés. Aucune connexion réelle.');

// Code référent fictif : jamais le vrai code dans les tests.
const pole={code:'9876',...d};
const responsable=verifierCodePlanning('9876',pole);
assert.deepEqual(responsable.ecritureClasses,['C1PSR','C2PSR']);
assert.equal(responsable.sessionValide({...pole,accesPlanning:{actif:false,code:'5678'}}),true);
assert.equal(responsable.sessionValide({...pole,code:'8765'}),false);
assert.equal(verifierCodePlanning('9876',{code:'9876'}).pole,'PSR_MELEC');
assert.equal(verifierCodePlanning('9876',{...pole,accesPlanning:{actif:false,code:'1234'}}).pole,'PSR_MELEC');
assert.throws(()=>verifierCodePlanning('9876',{...pole,code:'8765'}));
assert.equal(verifierCodePlanning('1234',pole).sessionValide({...pole,code:'8765'}),true);
assert.equal(verifierCodePlanning('8765',{...pole,code:'8765'}).pole,'PSR_MELEC');
assert.throws(()=>verifierCodePlanning('0000',pole));
console.log('Accès référent supplémentaire : code distinct, rotation, indépendance du code Antoine et refus des mauvais codes vérifiés.');
