import assert from 'node:assert/strict';
import fs from 'node:fs';
const load = async file => import('data:text/javascript;base64,' + Buffer.from(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8')).toString('base64'));
const K = await load('calculs.js');
const E = await load('enregistrement.js');
let n=0;
function check(name,f){f();n++;console.log('OK',name);}
function setup(sem='TOUTES',semaines='AB') {
 const a={id:'a1',type:'aesh',sigle:'TEST',contrat:25,reunionH:0,equipes:{P:1},heures:{P:25},services:[]};
 const c={id:'c1',j:0,d:'09:00',f:'11:00',sem,cls:['C2'],lib:'Fictif'};
 const p={id:'p1',type:'place',aeshId:a.id,pole:'P',coursId:c.id,jour:0,du:'2026-08-31',au:'2027-07-02',sem,semaines,statut:'active'};
 const edt={semaine1:'2026-08-31',vacances:[],classes:{C2:{pfmp:[],cours:['c1']},C1:{pfmp:[],cours:['c2']}},cours:{c1:c,c2:{...c,id:'c2',cls:['C1'],sem:'TOUTES'}}};
 return {edt,C:K.creerCalendrier(edt),I:{aesh:new Map([[a.id,a]]),places:[p],absences:[],reunions:[]}};
}
const hours=(x,d)=>K.bilan(x,'a1',d).cours;
check('Cours toutes semaines, AESH A uniquement',()=>{const x=setup('TOUTES','A');assert.equal(hours(x,'2026-08-31'),2);assert.equal(hours(x,'2026-09-07'),0);assert.equal(K.presentsMin(x,x.edt.cours.c1,'2026-09-07'),0);});
check('Cours B limite un placement AB',()=>{const x=setup('SB');assert.equal(hours(x,'2026-08-31'),0);assert.equal(hours(x,'2026-09-07'),2);});
check('Ancien document SA reste compatible',()=>{const x=setup('SA');delete x.I.places[0].semaines;assert.equal(hours(x,'2026-09-07'),0);});
check('Pas de faux conflit A/B',()=>{const x=setup('SA','A');assert.equal(K.placementsEnConflit(x,x.I.places[0],{...x.I.places[0],coursId:'c2',semaines:'B'}),false);});
check('Vrai conflit même semaine',()=>{const x=setup();assert.equal(K.placementsEnConflit(x,x.I.places[0],{...x.I.places[0],coursId:'c2'}),true);});
check('Plusieurs classes additionnées, doublon même cours ignoré',()=>{const x=setup();x.edt.cours.c2.d='11:00';x.edt.cours.c2.f='12:00';x.I.places.push({...x.I.places[0],id:'p2',coursId:'c2'},{...x.I.places[0],id:'dup'});assert.equal(hours(x,'2026-08-31'),3);});
check('Modification bornée conserve passé, suite et semaine B',()=>{const x=setup();let id=0;x.I.places=K.modifierPeriode(x.I.places[0],'2026-09-14','2026-09-25','A',{debut:'09:00',fin:'10:00'},()=>`n${++id}`).filter(p=>p.statut==='active');assert.deepEqual(['2026-08-31','2026-09-14','2026-09-21','2026-09-28'].map(d=>hours(x,d)),[2,1,2,2]);});
check('Retrait ponctuel reprend la semaine suivante',()=>{const x=setup();let id=0;x.I.places=K.modifierPeriode(x.I.places[0],'2026-09-07','2026-09-11','AB',null,()=>`n${++id}`).filter(p=>p.statut==='active');assert.deepEqual(['2026-08-31','2026-09-07','2026-09-14'].map(d=>hours(x,d)),[2,0,2]);});
check('Vacances et fin de contrat',()=>{const x=setup();x.C=K.creerCalendrier({...x.edt,vacances:[{debut:'2026-09-07',fin:'2026-09-11',label:'Vacances fictives'}]});assert.equal(hours(x,'2026-09-07'),0);x.I.aesh.get('a1').finContrat='2026-09-10';assert.equal(hours(x,'2026-09-14'),0);});
check('Absence partielle',()=>{const x=setup();x.I.absences.push({aeshId:'a1',du:'2026-08-31',au:'2026-08-31',journee:false,debut:'09:30',fin:'10:00'});assert.equal(hours(x,'2026-08-31'),1.5);});
check('PFMP conserve source et limite renfort à sa parité',()=>{const x=setup('TOUTES','A');x.edt.classes.C2.pfmp=[{debut:'2026-08-31',fin:'2026-09-11'}];x.I.places.push({...x.I.places[0],id:'renfort',coursId:'c2',semaines:'AB',renfortPfmp:'C2',au:'2026-09-11'});assert.equal(hours(x,'2026-08-31'),2);assert.equal(hours(x,'2026-09-07'),0);assert.equal(hours(x,'2026-09-14'),2);assert.equal(x.I.places[0].statut,'active');});
check('PFMP milieu de semaine et fin exacte',()=>{const cls={pfmp:[{debut:'2026-09-09',fin:'2026-09-17'}]};assert.equal(K.bornesRenfort(cls,'2026-09-07','pfmp').du,'2026-09-09');assert.equal(K.bornesRenfort(cls,'2026-09-14','semaine').au,'2026-09-17');});
check('Besoin enseignant conserve le chiffre et la parité',()=>{const x=setup();const e={classe:'C2',statut:'active',jour:'lun',debut:'09:00',fin:'11:00',nb:3,semaines:'A'};assert.equal(K.besoinDuCours([e],'C2',x.edt.cours.c1,{iso:'2026-08-31',parite:'A'}).nb,3);assert.equal(K.besoinDuCours([e],'C2',x.edt.cours.c1,{iso:'2026-09-07',parite:'B'}),null);});
// Firestore fictif uniquement, aucune connexion réseau.
const server=new Map(),FS={doc:(_,col,id)=>col+'/'+id,runTransaction:async(_,fn)=>{const writes=[];const result=await fn({get:async ref=>({exists:()=>server.has(ref),data:()=>structuredClone(server.get(ref))}),set:(ref,d)=>writes.push([ref,d])});writes.forEach(([k,v])=>server.set(k,v));return result;}};
const x=setup(),a=x.I.aesh.get('a1'),p=x.I.places[0];server.set('main/a1',structuredClone(a));let uid=0;
const args={FS,db:{},collection:'main',historique:'hist',docs:[p],base:new Map([['a1',structuredClone(a)]]),annee:'2026-2027',par:'P',nouvelId:()=>String(++uid),maintenant:'2026-09-23T12:00:00Z'};
await E.enregistrerPlanning(args);n++;console.log('OK transaction et historique atomiques');assert.equal(server.get('main/a1').revisionPlanning,1);
const size=server.size;await assert.rejects(E.enregistrerPlanning({...args,docs:[{...p,id:'autre'}]}),e=>e.code==='conflit');assert.equal(server.size,size);n++;console.log('OK deuxième saisie périmée refusée sans écriture');
const beforeMissing = JSON.stringify([...server]);
await assert.rejects(E.enregistrerPlanning({...args,docs:[{...p,id:'nouveau',aeshId:'absent'}],base:new Map()}),e=>e.code==='fiche-aesh-manquante');
assert.equal(JSON.stringify([...server]),beforeMissing);n++;console.log('OK fiche absente : aucun placement ni historique incomplet');
const baseReunion=new Map([['a1',structuredClone(server.get('main/a1'))],['p1',structuredClone(server.get('main/p1'))]]);
await E.enregistrerPlanning({...args,base:baseReunion,docs:[{id:'reunion_test',type:'reunion',date:'2026-09-07',debut:'08:30',fin:'09:30',statut:'active'}]});
await assert.rejects(E.enregistrerPlanning({...args,base:baseReunion,docs:[{...p,id:'apres_reunion'}]}),e=>e.code==='conflit');
n++;console.log('OK réunion ajoutée pendant un placement : saisie périmée refusée');
console.log(`${n} scénarios réussis, données fictives uniquement.`);
