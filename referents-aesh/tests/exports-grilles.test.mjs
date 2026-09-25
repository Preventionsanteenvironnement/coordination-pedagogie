import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..'),memo=new Map();
function uri(file){if(memo.has(file))return memo.get(file);let s=fs.readFileSync(path.join(root,file),'utf8');s=s.replace(/from '(\.\/[^'?]+)(?:\?[^']*)?'/g,(_,p)=>`from '${uri(p.slice(2))}'`);const u='data:text/javascript;base64,'+Buffer.from(s).toString('base64');memo.set(file,u);return u;}
const X=await import(uri('exports.js')),K=await import(uri('calculs.js'));
const a={id:'test',sigle:'TEST',contrat:25,reunionH:0,equipes:{AGORA:1},services:[{nom:'Internat',h:0,horaires:[{jour:1,debut:'18:00',fin:'21:00',du:'2026-09-01',au:'2027-07-01',semaines:'AB'}]}]};
const cours={c1:{id:'c1',j:0,d:'09:00',f:'11:00',sem:'TOUTES',lib:'Sciences appliquees',cls:['C1'],salle:[]},c2:{id:'c2',j:2,d:'10:00',f:'12:00',sem:'TOUTES',lib:'Francais',cls:['C2'],salle:[]}};
const edt={semaine1:'2026-09-21',vacances:[],cours,classes:{C1:{court:'CAP PSR',pole:'PSR_MELEC',pfmp:[]},C2:{court:'1re MELEC',pole:'PSR_MELEC',pfmp:[]}}};
const ctx={C:K.creerCalendrier(edt),edt,I:{aesh:new Map([[a.id,a],['second',{...a,id:'second',sigle:'AUTRE'}]]),places:[{aeshId:a.id,coursId:'c1',pole:'PSR_MELEC',jour:0,debut:'09:30',fin:'10:00',du:'2026-09-01',au:'2027-07-01',semaines:'A',statut:'active'},{aeshId:a.id,coursId:'c2',pole:'PSR_MELEC',jour:2,du:'2026-09-01',au:'2027-07-01',semaines:'B',statut:'active'}],absences:[],reunions:[]}};
assert.deepEqual(X.datesExport(ctx.C,'2026-09-28','AB'),['2026-09-21','2026-09-28']);
for(const [mode,count] of [['A',1],['B',1],['separe',2],['AB',1]]){
 const f=X.feuillesGrillesAesh(ctx,['test'],'2026-09-28',mode);assert.equal(f.length,count);
 const txt=f.flatMap(f=>f.lignes.flatMap(r=>r.map(c=>c?.v||''))).join('\n');
 assert(txt.includes('Internat'));assert(txt.includes('18h–21h'));
 if(mode!=='B'){assert(txt.includes('CAP PSR'));assert(txt.includes('9h30–10h'));}
 if(mode!=='A')assert(txt.includes('1re MELEC'));
 const pdf=Buffer.from(await X.pdfGrillesAesh(ctx,['test'],'2026-09-28',mode).arrayBuffer());
 assert.equal((pdf.toString('latin1').match(/\/Type \/Page\b/g)||[]).length,count);
 if(mode==='AB'){assert.equal(f[0].largeurs.length,13);assert(f[0].fusions.some(x=>x.startsWith('K')));}
 if(process.env.EXPORT_TEST_DIR){fs.writeFileSync(path.join(process.env.EXPORT_TEST_DIR,mode+'.pdf'),pdf);fs.writeFileSync(path.join(process.env.EXPORT_TEST_DIR,mode+'.xlsx'),Buffer.from(await X.excelGrillesAesh(ctx,['test'],'2026-09-28',mode).arrayBuffer()));}
}
assert.equal(X.feuillesGrillesAesh(ctx,['test','second'],'2026-09-28','AB').length,2);
assert.equal(X.feuillesGrillesAesh(ctx,['test','second'],'2026-09-28','separe').length,4);
console.log('Exports : A, B, AB, separes ; toutes classes, horaires fractionnes, internat, fiches individuelles verifies.');
