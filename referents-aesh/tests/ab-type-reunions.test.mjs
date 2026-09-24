import assert from 'node:assert/strict';
import fs from 'node:fs';
const uri=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const ku=uri(fs.readFileSync(new URL('../calculs.js',import.meta.url),'utf8'));
const K=await import(ku);
const V=await import(uri(fs.readFileSync(new URL('../vues-planning.js',import.meta.url),'utf8').replace('./calculs.js?v=2026-09-24f',ku)));
const C=K.creerCalendrier({semaine1:'2026-09-21',vacances:[{debut:'2026-10-05',fin:'2026-10-18',label:'Congés'}]});
assert.deepEqual(V.semainesAB(C,'2026-09-28'),{A:'2026-09-21',B:'2026-09-28'});
assert.deepEqual(V.semainesAB(C,'2026-10-05'),{A:'2026-10-19',B:'2026-10-26'});
const a={id:'test',type:'aesh',sigle:'TEST',actif:true,contrat:25,equipes:{PSR_MELEC:1},heures:{},filieres:{PSR:{}},reunionsSupplementaires:[{pole:'MDA',jour:1,debut:'12:00',fin:'13:00',du:'2026-09-01',au:'2026-12-18',semaines:'A'}]};
const c={id:'test_c',lib:'Test',cls:['C1PSR'],j:0,d:'09:00',f:'10:00',sem:'TOUTES'};
const p={id:'p',type:'place',aeshId:a.id,coursId:c.id,jour:0,debut:c.d,fin:c.f,du:'2026-09-01',au:'2026-12-18',semaines:'AB',statut:'active',pole:'PSR_MELEC'};
const edt={classes:{C1PSR:{pole:'PSR_MELEC',pfmp:[{debut:'2026-09-21',fin:'2026-09-25'}]}},cours:{test_c:c}};
const ctx={C,edt,I:{aesh:new Map([[a.id,a]]),places:[p],absences:[],reunions:[]},nomPole:x=>x};
assert.equal(K.reunionsEffectives(ctx,a.id,'2026-09-21').length,2);
assert.equal(K.bilan(ctx,a.id,'2026-09-21').total,2);
assert.equal(K.reunionsEffectives(ctx,a.id,'2026-09-28').length,1);
ctx.I.reunions=[{id:'r',date:'2026-09-21',debut:'08:30',fin:'09:30'}];
let rr=K.reunionsEffectives(ctx,a.id,'2026-09-21');assert.equal(rr.length,2);assert(rr.some(r=>r.type==='institution'));assert(rr.some(r=>r.supplementaire));assert(!rr.some(r=>r.type==='reunion'&&!r.supplementaire));
assert.equal(K.bilan(ctx,a.id,'2026-09-21').total,2);
a.reunionsSupplementaires[0].jour=0;a.reunionsSupplementaires[0].debut='09:00';a.reunionsSupplementaires[0].fin='10:00';
assert(K.bilan(ctx,a.id,'2026-09-21').alertes.some(a=>a.type==='conflit'));
a.reunionsSupplementaires[0].jour=1;a.reunionsSupplementaires[0].debut='12:00';a.reunionsSupplementaires[0].fin='13:00';
const typ=V.contexteType(ctx);assert.equal(typ.I.reunions.length,0);assert.equal(typ.edt.classes.C1PSR.pfmp.length,0);assert.equal(K.bilan(typ,a.id,'2026-09-21').total,3);assert.equal(ctx.edt.classes.C1PSR.pfmp.length,1);
ctx.I.absences=[{aeshId:a.id,du:'2026-09-28',au:'2026-09-28',journee:true}];
assert.equal(K.bilan(ctx,a.id,'2026-09-28').total,0);assert.equal(K.bilan(V.contexteType(ctx),a.id,'2026-09-28').total,2);
a.finContrat='2026-09-20';assert.equal(K.bilan(V.contexteType(ctx),a.id,'2026-09-21').total,0);
console.log('A/B + EDT type : vacances, PFMP, absences, contrat préservé ; deuxième réunion, alternance, institutionnelle et conflit vérifiés.');

// Une personne : trois niveaux MELEC, deux PSR et un autre pôle dans la même liste.
const niveaux=['B1MELEC','B2MELEC','BTMELEC','C1PSR','C2PSR','CAPA'];
const cours=Object.fromEntries(niveaux.map((n,i)=>[n,{id:n,lib:'Cours fictif',cls:[n],j:i%5,d:i===5?'11:00':'09:00',f:i===5?'12:00':'10:00',sem:'TOUTES'}]));
const multi={C,edt:{classes:Object.fromEntries(niveaux.map(n=>[n,{cours:[n],pfmp:[]}])),cours},I:{aesh:new Map([['multi',{id:'multi',sigle:'TEST',contrat:30,reunionH:0,equipes:{PSR_MELEC:1,CAPA:1},services:[]}]]),places:niveaux.map((n,i)=>({id:n,type:'place',aeshId:'multi',pole:i===5?'CAPA':'PSR_MELEC',coursId:n,jour:i%5,du:'2026-09-01',au:'2026-12-18',semaines:i===4?'B':'AB',statut:'active'})),absences:[],reunions:[]}};
for(const [l,n] of [['2026-09-21',5],['2026-09-28',6]]){
 for(const cx of [multi,V.contexteType(multi)]) {
  const o=K.occupations(cx,'multi',l).filter(o=>o.type==='cours');
  assert.equal(o.length,n);assert.equal(K.bilan(cx,'multi',l).cours,n);
  assert(o.some(o=>o.pole==='CAPA'));
  assert.deepEqual(o.map(o=>o.cours.id).sort(),niveaux.filter(c=>n===6||c!=='C2PSR').sort());
 }
}
console.log('Grille AESH multiclasse et multipôle : six classes, A/B et EDT type vérifiés.');
