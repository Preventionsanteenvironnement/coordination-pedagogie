/* Format partagé site / UBEO. Aucun dossier élève, nom de personnel ou texte libre. */
(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CPBesoins=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const categories=['cours','exam','sortie','pfmp'],natures=['souhait','ponctuel','remplacement','structurel','evenement'],poles=['PSR_MELEC','AGORA','CAPA','MDA',''];
 const matieres=['Cours','Mathématiques','Français','Histoire-géographie','PSE','Espagnol','Anglais','EPS','Sciences','Enseignement professionnel','Arts appliqués','Accompagnement'];
 function date(s){return typeof s==='string'&&/^\d{4}-\d\d-\d\d$/.test(s)&&!isNaN(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;}
 function plus(s,n){return new Date(Date.parse(s+'T12:00:00Z')+n*864e5).toISOString().slice(0,10);}
 function lundi(s){if(!date(s))throw Error('Date incorrecte.');const j=new Date(s+'T12:00:00Z').getUTCDay();return plus(s,-((j+6)%7));}
 function entier(x){return Number.isInteger(x)&&x>=0&&x<=40;}
 function heure(s){return typeof s==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(s);}
 function exact(o,keys){if(!o||typeof o!=='object'||Array.isArray(o)||Object.keys(o).some(k=>!keys.includes(k))||keys.some(k=>!Object.prototype.hasOwnProperty.call(o,k)))throw Error('Champs non autorisés ou incomplets.');}
 function iso(s){return typeof s==='string'&&/^\d{4}-\d\d-\d\dT/.test(s)&&!isNaN(Date.parse(s))&&new Date(s).toISOString()===s;}
 function valider(x){
  exact(x,['version','lundi','sourceMaj','creneaux']);
  if(x.version!==1||!date(x.lundi)||lundi(x.lundi)!==x.lundi||!iso(x.sourceMaj)||!Array.isArray(x.creneaux)||x.creneaux.length>1200)throw Error('Semaine non valide.');
  const ids=new Set();for(const c of x.creneaux){exact(c,['id','date','debut','fin','classes','pole','categorie','matiere','nature','souhaitees','prevues','restantes','ponctuel']);
   if(typeof c.id!=='string'||!/^c[0-9]{1,5}$/.test(c.id)||ids.has(c.id))throw Error('Identifiant de créneau incorrect.');ids.add(c.id);
   if(!date(c.date)||c.date<x.lundi||c.date>plus(x.lundi,6)||!heure(c.debut)||!heure(c.fin)||c.fin<=c.debut)throw Error('Horaire de créneau incorrect.');
   if(!Array.isArray(c.classes)||!c.classes.length||c.classes.length>12||c.classes.some(k=>typeof k!=='string'||!/^[A-Z0-9][A-Z0-9 _+–-]{0,39}$/.test(k)))throw Error('Code de classe incorrect.');
   if(!poles.includes(c.pole)||!categories.includes(c.categorie)||!natures.includes(c.nature)||!matieres.includes(c.matiere)||typeof c.ponctuel!=='boolean'||![c.souhaitees,c.prevues,c.restantes].every(entier)||c.restantes!==Math.max(0,c.souhaitees-c.prevues))throw Error('Besoin incorrect.');
  }
  if(JSON.stringify(x).length>700000)throw Error('Semaine trop volumineuse.');return JSON.parse(JSON.stringify(x));
 }
 function matiere(v){const s=String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  if(/math/.test(s))return 'Mathématiques';if(/franc/.test(s))return 'Français';if(/hist|geo/.test(s))return 'Histoire-géographie';if(/\bpse\b|prevent/.test(s))return 'PSE';if(/espagn/.test(s))return 'Espagnol';if(/angl/.test(s))return 'Anglais';if(/\beps\b|sport|physique.*educ/.test(s))return 'EPS';if(/scien|chim|phys/.test(s))return 'Sciences';if(/art.*appl/.test(s))return 'Arts appliqués';if(/pro|atelier|elect|melec|agora|techni/.test(s))return 'Enseignement professionnel';return 'Cours';}
 return {valider,date,lundi,plus,matiere,categories,matieres,poles};
});
