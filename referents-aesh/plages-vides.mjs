const minute=s=>{const [h,m]=s.split(':').map(Number);return h*60+m;};
// Visible empty time only: all courses, poles and services contribute to coverage.
// In A+B a time is empty only if neither week has an activity.
export function plagesVides(occupations, nonTravaille, jour, debut=480, fin=1080){
 const actifs=occupations.filter(o=>o.j===jour&& !['repos','vacances'].includes(o.type));
 const off=nonTravaille.filter(o=>o.j===jour);
 const bornes=[debut,fin];
 for(const o of [...actifs,...off])for(const t of [minute(o.debut),minute(o.fin)])if(t>debut&&t<fin)bornes.push(t);
 const points=[...new Set(bornes)].sort((a,b)=>a-b),out=[];
 for(let i=0;i<points.length-1;i++){
  const d=points[i],f=points[i+1];if(actifs.some(o=>minute(o.debut)<f&&minute(o.fin)>d))continue;
  const fermes=off.filter(o=>minute(o.debut)<=d&&minute(o.fin)>=f);
  const sems=new Set(fermes.flatMap(o=>o.sem==='A'||o.sem==='B'?[o.sem]:['A','B']));
  const etat=sems.size===2?'off':'vide';
  const last=out.at(-1);if(last&&last.fin===d&&last.etat===etat)last.fin=f;else out.push({debut:d,fin:f,etat});
 }
 return out;
}
export function fondPlages(occ,off,jour,px){return plagesVides(occ,off,jour).map(p=>`<div class="plage-hachuree ${p.etat==='off'?'non-travaillee':''}" aria-hidden="true" style="top:${(p.debut-480)*px}px;height:${(p.fin-p.debut)*px}px"></div>`).join('');}
export const legendePlages='<div class="legende-plages"><span><i></i>Sans affectation</span><span><i class="non-travaillee"></i>Non travaillé / fermeture</span></div>';
