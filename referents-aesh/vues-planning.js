import * as K from './calculs.js?v=2026-09-24f';
// Deux semaines scolaires consécutives, A puis B ; les vacances sont sautées.
export function semainesAB(C,lundi) {
  let pivot=lundi;
  for(let n=0;n<54 && !C.parite(pivot);n++) pivot=K.ajoute(pivot,7);
  let a=pivot,b=pivot;
  if(C.parite(pivot)==='B') {
    for(let n=0;n<54;n++){a=K.ajoute(a,-7);if(C.parite(a)==='A')break;}
  }else {
    for(let n=0;n<54;n++){b=K.ajoute(b,7);if(C.parite(b)==='B')break;}
  }
  return {A:a,B:b};
}
// Même période et mêmes contrats ; seules les exceptions ponctuelles sont masquées.
export function contexteType(ctx) {
  const C={...ctx.C,off:()=>'',semaine:l=>({...ctx.C.semaine(l),toute:false,jours:K.JOURS.map((_,j)=>({date:K.ajoute(l,j),off:''}))})};
  return {...ctx,C,edt:{...ctx.edt,classes:Object.fromEntries(Object.entries(ctx.edt.classes).map(([n,c])=>[n,{...c,pfmp:[]}]))},
    I:{...ctx.I,absences:[],reunions:[],places:ctx.I.places.filter(p=>!p.renfortPfmp)}};
}
