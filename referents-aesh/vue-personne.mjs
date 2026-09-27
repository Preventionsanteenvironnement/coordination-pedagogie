const minutes=s=>{const [h,m]=s.split(':').map(Number);return h*60+m;};
const overlap=(a,b)=>minutes(a.debut)<minutes(b.fin)&&minutes(b.debut)<minutes(a.fin);
// Partition by connected overlaps, so unrelated times retain the whole day width.
export function disposerOccupations(items){
 const sorted=items.map(o=>({...o})).sort((a,b)=>minutes(a.debut)-minutes(b.debut)||minutes(b.fin)-minutes(a.fin));
 const groups=[];let end=-1;
 for(const o of sorted){if(minutes(o.debut)>=end){groups.push([]);end=-1;}groups.at(-1).push(o);end=Math.max(end,minutes(o.fin));}
 for(const group of groups){const columns=[];
  for(const o of group){let col=columns.findIndex(c=>c.every(x=>!overlap(x,o)));if(col<0){col=columns.length;columns.push([]);}columns[col].push(o);o.col=col;}
  for(const o of group){o.cols=columns.length;o.span=1;for(let c=o.col+1;c<columns.length;c++){if(columns[c].some(x=>overlap(x,o)))break;o.span++;}}
 }
 return sorted;
}
function service(o){return String(o.label||o.type||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
export function styleOccupation(o,palette){
 const s=service(o);const [edge,bg]=o.cours?palette(o.cours.mat||o.cours.lib):/reunion|coordination/.test(s)?['#7660ac','#f0ebfa']:/internat/.test(s)?['#4265a5','#eaf0fc']:/cantine|pension|^dp$/.test(s)?['#b77b16','#fff3d9']:['#20847b','#e5f5f0'];
 return `background:${bg};border-left:5px solid ${edge};`;
}
export function iconeOccupation(o,logo,sigle){
 if(o.cours)return '';
 const s=service(o);if(/reunion|coordination/.test(s))return '<svg width="15" height="15" viewBox="0 0 20 20" aria-hidden="true"><circle cx="7" cy="5" r="3" fill="currentColor"/><circle cx="15" cy="7" r="2" fill="currentColor"/><path d="M1 17v-3a6 6 0 0 1 12 0v3zm13 0v-3a8 8 0 0 0-1-4q6-1 6 7z" fill="currentColor"/></svg>';
 return logo(sigle(o.label));
}
