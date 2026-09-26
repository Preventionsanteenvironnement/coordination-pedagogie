/* Vérification guidée : aucune proposition n'est un placement avant confirmation.
   Les brouillons vivent dans Firestore, jamais dans les fichiers publics du site. */
import * as K from './calculs.js?v=2026-09-26b';
import { POLES, FILIERES } from './donnees.js?v=2026-09-24b';

export const PERSONNES = ['aesh_d01','aesh_d02','aesh_d03','aesh_d04'];
const SERVICES = ['Cantine','Internat','PIAL','DAFI'];
const clone = x => JSON.parse(JSON.stringify(x));
const esc = x => String(x ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function lireBrouillon(d) {
  const x=JSON.parse(d.contenu);
  if(!PERSONNES.includes(d.aeshId) || !Array.isArray(x.lignes) || x.lignes.length>150) throw Error('Propositions non reconnues.');
  return x;
}
export function verifierLigne(r,edt) {
  if(!['A','B'].includes(r.semaine) || !Number.isInteger(r.jour) || r.jour<0 || r.jour>4 || !K.RE_HEURE.test(r.debut) || !K.RE_HEURE.test(r.fin) || r.debut>=r.fin) throw Error('Vérifiez le jour, la semaine et les heures.');
  if(r.cible.startsWith('service:')) {
    if(!SERVICES.includes(r.cible.slice(8))) throw Error('Service non reconnu.');
  } else {
    const c=edt.cours[r.cible];
    if(!c || c.j!==r.jour || !c.cls.some(n=>['C1PSR','C2PSR','C1VAN','C2VAN'].includes(n))) throw Error('Choisissez le cours correspondant.');
    if((c.sem==='SA' && r.semaine!=='A') || (c.sem==='SB' && r.semaine!=='B')) throw Error('Ce cours appartient à l’autre semaine.');
    if(r.debut<c.d || r.fin>c.f) throw Error('La présence doit rester dans les horaires du cours. Ajoutez un autre passage si nécessaire.');
  }
}

/* Prépare un remplacement borné, avec les mêmes calculs que le planning normal.
   Les réunions, contrats, absences et autres pôles restent intacts. */
export function preparerValidation({draft,base,ctx,nouvelId}) {
  const x=lireBrouillon(draft),a=base.get(draft.aeshId);
  if(!a || a.type!=='aesh') throw Error('Le référent doit enregistrer la fiche AESH avant la validation.');
  if(!K.RE_DATE.test(x.du)||!K.RE_DATE.test(x.au)||x.du>x.au) throw Error('Vérifiez la période.');
  if(x.du<K.isoLocal()) throw Error('Choisissez une date de début à partir d’aujourd’hui pour préserver le passé.');
  if(!Array.from({length:10},(_,i)=>i).every(i=>x.valides?.includes(i)) || x.internat==null || x.dpConfirmee!==true) throw Error('Vérifiez les deux semaines, la demi-pension et l’internat avant de confirmer.');
  const au=K.finContratDe(a) && K.finContratDe(a)<x.au ? K.finContratDe(a):x.au;
  if(au<x.du) throw Error('Le contrat est terminé sur cette période.');
  const rows=x.lignes; rows.forEach(r=>verifierLigne(r,ctx.edt));
  if(x.internat===false && rows.some(r=>r.cible==='service:Internat')) throw Error('Vous avez indiqué aucun internat : retirez les créneaux Internat ou choisissez Oui.');
  if(x.internat===true && !rows.some(r=>r.cible==='service:Internat')) throw Error('Ajoutez les jours et horaires d’internat.');
  const lot=[],retire=[];
  const cibles=new Set(rows.filter(r=>!r.cible.startsWith('service:')).map(r=>r.cible));
  for(const p of ctx.I.places) {
    if(p.aeshId!==a.id || p.renfortPfmp) continue;
    const c=ctx.edt.cours[p.coursId];
    if(c?.cls.some(n=>['C1PSR','C2PSR'].includes(n)) || cibles.has(p.coursId)) {
      const m=K.modifierPeriode(p,x.du,au,'AB',null,()=> 'place_'+nouvelId());
      if(m.length){lot.push(...m);retire.push(p);}
    }
  }
  for(const r of rows.filter(r=>!r.cible.startsWith('service:'))) {
    const c=ctx.edt.cours[r.cible];
    const p={id:'place_'+nouvelId(),type:'place',aeshId:a.id,pole:ctx.edt.classes[c.cls[0]].pole,coursId:c.id,classes:c.cls,jour:c.j,debut:r.debut,fin:r.fin,sem:c.sem,semaines:r.semaine,matiere:c.lib,du:x.du,au,statut:'active'};
    if(!K.datesPlacement(ctx,p).length) throw Error(`${K.JOURS[r.jour]} ${r.debut} · semaine ${r.semaine} : aucune date de cours dans la période.`);
    lot.push(p);
  }
  const fiche=clone(a);
  fiche.services=clone(K.servicesDe(a));
  for(const nom of SERVICES) {
    const nouveaux=rows.filter(r=>r.cible==='service:'+nom);
    let s=fiche.services.find(s=>s.nom===nom);
    // Les forfaits antérieurs restent applicables avant le début du calendrier.
    if(!s && !nouveaux.length) continue;
    if(!s){s={nom,h:0,jours:[]};fiche.services.push(s);}
    const conserves=[];
    for(const h of s.horaires||[]) {
      if(h.au<x.du || h.du>au) conserves.push(h);
      else {if(h.du<x.du) conserves.push({...h,au:K.ajoute(x.du,-1)});if(h.au>au) conserves.push({...h,du:K.ajoute(au,1)});}
    }
    s.horaires=[...conserves,...nouveaux.map(r=>({jour:r.jour,debut:r.debut,fin:r.fin,du:x.du,au,semaines:r.semaine}))];
    s.calendrierDepuis=s.calendrierDepuis && s.calendrierDepuis<x.du?s.calendrierDepuis:x.du;
  }
  lot.push(fiche);
  const sim=new Map(base);lot.forEach(d=>sim.set(d.id,d));
  const cx={...ctx,I:K.indexer([...sim.values()],[],POLES.map(p=>p.id),FILIERES)},avert=new Set(),bilans=[];
  for(const l of K.lundisEntre(ctx.C,x.du,au)) {
    const b=K.bilan(cx,a.id,l);if(!b)continue;
    for(const al of b.alertes) {
      if(al.type==='conflit') throw Error(`Conflit la semaine du ${K.dateCourte(l)} : ${al.texte}. Corrigez les créneaux.`);
      if(['contrat','pole'].includes(al.type)) avert.add(al.texte);
    }
    const sem=ctx.C.parite(l);
    if(!bilans.some(b=>b.sem===sem) && b.joursTravail>0) bilans.push({sem,lundi:l,total:b.total});
  }
  lot.push({...draft,statut:'valide',contenu:JSON.stringify({...x,au})});
  return {lot,retire,au,avert:[...avert],bilans};
}

export function ouvrirVerification({draft,base,ctx,enregistrer,ferme,nouvelId}) {
  let d=clone(draft),x=lireBrouillon(d),attendu=new Map(base),etape=-1,pret=null,occupe=false,termine=false;
  const dialog=document.createElement('dialog');dialog.setAttribute('aria-label','Vérifier les semaines A et B');dialog.className='verification-guide';document.body.append(dialog);
  const sig=ctx.I.aesh.get(d.aeshId)?.sigle || d.aeshId;
  const erreur=e=>{dialog.querySelector('[role="alert"]').textContent=e.code==='conflit'?'Le planning a changé pendant la vérification. Fermez puis rouvrez ce parcours ; vos journées déjà enregistrées restent conservées.':e.message || 'Enregistrement non confirmé. Vérifiez la connexion.';};
  const sauver=async()=>{
    d={...d,contenu:JSON.stringify(x),statut:'brouillon'};
    const res=await enregistrer([d],attendu);d=res.find(r=>r.id===d.id);attendu.set(d.id,clone(d));
  };
  function lireEcran(){
    if(etape===-1){x.du=dialog.querySelector('[name="du"]').value;x.au=dialog.querySelector('[name="au"]').value;}
    if(etape>=0 && etape<10){
      const sem=etape<5?'A':'B',jour=etape%5;
      x.lignes=x.lignes.filter(r=>r.semaine!==sem||r.jour!==jour).concat([...dialog.querySelectorAll('[data-ligne]')].map(el=>({
        semaine:sem,jour,cible:el.querySelector('[name="cible"]').value,debut:el.querySelector('[name="debut"]').value,fin:el.querySelector('[name="fin"]').value,
        source:el.dataset.source || '',note:''
      })));
    }
    if(etape===10){x.internat=dialog.querySelector('[name="internat"]:checked')?.value; x.internat=x.internat==='oui'?true:x.internat==='non'?false:null;x.dpConfirmee=dialog.querySelector('[name="dp"]').checked;}
  }
  function rendre(){
    const sem=etape<5?'A':'B',jour=etape%5;
    let html='';
    if(etape===-1)html=`<h2>Vérifier les semaines A et B</h2><p>Les propositions de l’Excel sont à contrôler. Corrigez si nécessaire. Le planning partagé changera après la confirmation finale.</p>${(x.notes||[]).map(n=>`<p>${esc(n)}</p>`).join('')}<label>À partir du <input name="du" type="date" min="${K.isoLocal()}" value="${esc(x.du)}"></label><label>Jusqu’au <input name="au" type="date" value="${esc(x.au)}"></label><p>Les réunions sont conservées.</p>`;
    else if(etape<10){
      const cours=Object.values(ctx.edt.cours).filter(c=>c.j===jour && c.cls.some(n=>['C1PSR','C2PSR','C1VAN','C2VAN'].includes(n)) && !(c.sem==='SA'&&sem==='B') && !(c.sem==='SB'&&sem==='A')).sort((a,b)=>a.d.localeCompare(b.d));
      const options=[...cours.map(c=>[c.id,`${c.cls.join('/')} · ${c.d}–${c.f} · ${c.lib}`]),...SERVICES.map(s=>['service:'+s,s==='Cantine'?'DP — Demi-pension':s])];
      html=`<h2>Semaine ${sem} · ${K.JOURS[jour]}</h2><p>Vérifiez les cours et les heures de présence.</p>`+x.lignes.filter(r=>r.semaine===sem&&r.jour===jour).sort((a,b)=>a.debut.localeCompare(b.debut)).map((r,i)=>`<fieldset data-ligne data-source="${esc(r.source)}"><legend>Passage ${i+1}</legend>${r.source?`<small>Excel : ${esc(r.source)}</small>`:''}<p data-resume><b>${esc(options.find(([v])=>v===r.cible)?.[1] || 'Cours à choisir')}</b></p><label>Cours ou service <select name="cible"><option value="">Choisir le cours</option>${options.map(([v,l])=>`<option value="${v}" ${v===r.cible?'selected':''}>${esc(l)}</option>`).join('')}</select></label><div class="ligne"><label>De <input name="debut" type="time" value="${esc(r.debut)}"></label><label>À <input name="fin" type="time" value="${esc(r.fin)}"></label></div><button type="button" data-guide="retirer">Retirer ce passage</button></fieldset>`).join('')+`<button type="button" data-guide="ajouter">+ Ajouter un passage</button>`;
    }else if(etape===10){
      const dp=x.lignes.filter(r=>r.cible==='service:Cantine');
      html=`<h2>Demi-pension et internat</h2><h3>DP — Demi-pension</h3>${dp.length?dp.map(r=>`<p>Semaine ${r.semaine} · ${K.JOURS[r.jour]} ${r.debut}–${r.fin}</p>`).join(''):'<p>Aucun créneau de demi-pension.</p>'}<label><input name="dp" type="checkbox" ${x.dpConfirmee?'checked':''}> Je confirme la demi-pension (ou son absence).</label><h3>Y a-t-il de l’internat ?</h3><label><input name="internat" type="radio" value="oui" ${x.internat===true?'checked':''}> Oui, j’ai ajouté ses horaires dans les journées</label><label><input name="internat" type="radio" value="non" ${x.internat===false?'checked':''}> Non</label><p>Pour corriger, revenez à la journée concernée.</p>`;
    }else{
      html=`<h2>Confirmer le planning de ${esc(sig)}</h2><p>Du ${K.dateCourte(x.du)} au ${K.dateCourte(pret.au)}.</p><p>Les placements PSR de cette personne sur cette période seront remplacés par les passages ci-dessous. DP, internat, PIAL et DAFI seront mis à jour. Les réunions et les autres personnes restent inchangées.</p>${pret.avert.map(a=>`<p role="status" style="color:#9a3412">${esc(a)}</p>`).join('')}${pret.bilans.map(b=>`<p><b>Semaine ${b.sem} du ${K.dateCourte(b.lundi)} : ${K.fmtH(b.total)}</b></p>`).join('')}<details><summary>Voir tous les passages A et B</summary>${['A','B'].map(s=>`<h3>Semaine ${s}</h3>`+x.lignes.filter(r=>r.semaine===s).sort((a,b)=>a.jour-b.jour||a.debut.localeCompare(b.debut)).map(r=>`<p>${K.JOURS[r.jour]} ${r.debut}–${r.fin} · ${esc(ctx.edt.cours[r.cible]?.lib || r.cible.replace('service:',''))}</p>`).join('')).join('')}</details><p>Cette validation sera visible par les référents et dans l’espace d’Antoine.</p>`;
    }
    dialog.innerHTML=`<header class="ligne"><b>${esc(sig)} · Vérification ${Math.max(0,etape+1)}/12</b><button data-guide="fermer" aria-label="Enregistrer et fermer">✕</button></header>${html}<p role="alert" style="color:#b91c1c"></p><footer class="ligne">${etape>=0?'<button data-guide="precedent">Précédent</button>':''}<button class="btn principal" data-guide="suivant">${etape===11?'Confirmer et mettre à jour':etape===-1?'Commencer':etape<10?'Cette journée est correcte →':'Vérifier le récapitulatif'}</button></footer>`;
    dialog.scrollTop=0;
  }
  dialog.addEventListener('click',async ev=>{
    const b=ev.target.closest('[data-guide]');if(!b||occupe)return;
    const action=b.dataset.guide;
    if(action==='fermer' && termine){dialog.close();return;}
    try{
      lireEcran();
      if(action==='fermer'){occupe=true;b.disabled=true;await sauver();dialog.close();return;}
      if(action==='retirer'){b.closest('[data-ligne]').remove();lireEcran();x.valides=(x.valides||[]).filter(i=>i!==etape);rendre();return;}
      if(action==='ajouter'){x.lignes.push({jour:etape%5,semaine:etape<5?'A':'B',debut:'09:00',fin:'10:00',cible:''});x.valides=(x.valides||[]).filter(i=>i!==etape);rendre();return;}
      occupe=true;b.disabled=true;
      if(action==='precedent'){await sauver();etape--;rendre();return;}
      if(etape===-1 && (!K.RE_DATE.test(x.du)||!K.RE_DATE.test(x.au)||x.du>x.au||x.du<K.isoLocal())) throw Error('Vérifiez la période : le passé sera conservé.');
      if(etape>=0 && etape<10){x.lignes.filter(r=>r.semaine===(etape<5?'A':'B')&&r.jour===etape%5).forEach(r=>verifierLigne(r,ctx.edt));x.valides=[...new Set([...(x.valides||[]),etape])];}
      if(etape===11){await enregistrer(pret.lot,attendu);termine=true;dialog.innerHTML='<h2>Planning validé</h2><p>Les semaines A et B sont enregistrées dans le planning partagé.</p><button data-guide="fermer">Terminer</button>';return;}
      await sauver();
      if(etape===10)pret=preparerValidation({draft:d,base:attendu,ctx,nouvelId});
      if(etape===-1 && x.valides?.length){etape=Array.from({length:10},(_,i)=>i).find(i=>!x.valides.includes(i)) ?? 10;}else etape++;rendre();
    }catch(e){erreur(e);}finally{occupe=false;if(b.isConnected)b.disabled=false;}
  });
  dialog.addEventListener('change',ev=>{if(etape>=0&&etape<10)x.valides=(x.valides||[]).filter(i=>i!==etape);if(ev.target.name==='cible'){const p=ev.target.closest('[data-ligne]').querySelector('[data-resume]');p.textContent=ev.target.selectedOptions[0]?.textContent || 'Cours à choisir';}});
  dialog.addEventListener('cancel',e=>{e.preventDefault();if(!occupe)dialog.querySelector('[data-guide=fermer]')?.click();});
  dialog.addEventListener('close',()=>{dialog.remove();ferme();});
  rendre();dialog.showModal();
}
