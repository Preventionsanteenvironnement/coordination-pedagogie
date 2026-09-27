export function horsPresence(o,K){return !o.cours&&(['reunion','institution'].includes(o.type)||/^r[ée]union/i.test(o.label||'')||(o.type==='service'&&!K.avecEleves({nom:o.label})));}
export function resumeExterne(K,cx,a,lundis){
 const result=new Map();
 for(const [sem,lundi] of lundis){
  for(const o of K.occupations(cx,a.id,lundi)){
   if(o.type!=='service'||!K.horsClasse({nom:o.label,horsClasse:o.horsClasse}))continue;
   const h=o.absent?0:Math.max(0,K.duree(o.debut,o.fin)-(o.partiel||0));if(!h)continue;
   const key=o.label; if(!result.has(key))result.set(key,{nom:key,eleves:K.avecEleves({nom:key}),heures:{}});
   const r=result.get(key);r.heures[sem]=(r.heures[sem]||0)+h;
  }
 }
 return [...result.values()];
}
