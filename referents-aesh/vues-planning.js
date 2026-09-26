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

/* ─── Semaine type : A et B dans une seule grille (25/09/2026) ───
   Un AESH veut un seul document : où il travaille, en A comme en B. On calcule les deux
   semaines, puis on rapproche les occupations identiques — même jour, même horaire, même
   activité. Ce qui revient les deux semaines porte « AB » ; le reste porte « A » ou « B ».
   Deux activités différentes au même créneau restent deux blocs : la grille les place
   côte à côte toute seule, comme elle le fait déjà pour deux cours qui se chevauchent. */
const cleOccupation = o => [o.type, o.j, o.debut, o.fin,
  o.cours ? o.cours.id : (o.label || ''), o.detail || ''].join('|');

export function occupationsAB(K, cx, aeshId, lundiA, lundiB) {
  const garde = l => l.filter(o => !['repos', 'vacances'].includes(o.type));
  const a = garde(K.occupations(cx, aeshId, lundiA));
  const b = garde(K.occupations(cx, aeshId, lundiB));
  const restants = new Map(b.map(o => [cleOccupation(o), o]));
  const out = [];
  a.forEach(o => {
    const k = cleOccupation(o);
    if (restants.has(k)) { restants.delete(k); out.push({ ...o, sem: 'AB' }); }
    else out.push({ ...o, sem: 'A' });
  });
  restants.forEach(o => out.push({ ...o, sem: 'B' }));
  return out.sort((x, y) => x.j - y.j || K.min(x.debut) - K.min(y.debut)
    || (x.sem === y.sem ? 0 : x.sem === 'AB' ? -1 : y.sem === 'AB' ? 1 : x.sem < y.sem ? -1 : 1));
}

/* Ce que la personne fait dans la semaine, tous types confondus, pour le pied du document. */
export function resumeSemaine(K, occ) {
  const par = new Map();
  occ.forEach(o => {
    const nom = o.type === 'cours' ? 'Accompagnement en cours'
      : o.type === 'reunion' ? 'Réunion'
      : o.type === 'service' ? (o.label || 'Service')
      : o.type === 'absence' ? (o.label || 'Absence') : (o.label || o.type);
    const h = (K.min(o.fin) - K.min(o.debut)) / 60, coef = o.sem === 'AB' ? 1 : 0.5;
    par.set(nom, (par.get(nom) || 0) + h * coef);
  });
  return [...par.entries()].filter(([, h]) => h > 0).sort((x, y) => y[1] - x[1]);
}

/* ─── Total d'heures par jour (25/09/2026) ───
   Les fiches papier des référents portent, sous chaque colonne, ce que pèse la journée ;
   leur somme est le contrat. Avec l'alternance, une journée peut peser deux choses
   différentes : on donne alors les deux, semaine A puis semaine B. */
export function totauxJours(K, occ) {
  return K.JOURS.map((_, j) => {
    let a = 0, b = 0;
    occ.filter(o => o.j === j).forEach(o => {
      const h = (K.min(o.fin) - K.min(o.debut)) / 60;
      if (o.sem !== 'B') a += h;
      if (o.sem !== 'A') b += h;
    });
    return { a, b };
  });
}
export const libelleTotal = (K, t) => !t.a && !t.b ? '' : t.a === t.b ? K.fmtH(t.a) : `${K.fmtH(t.a)} / ${K.fmtH(t.b)}`;

/* ─── Élèves notifiés d'une classe (26/09/2026) ───
   Ce que la grille a le droit de montrer : des nombres. Le détail — code, dates,
   aménagements d'épreuve — reste dans l'onglet « Élèves », jamais sur un bloc de cours. */
export function comptesEleves(liste) {
  const out = { total: 0, notifies: 0, ai: 0, am: 0, ulis: 0, heures: 0 };
  (Array.isArray(liste) ? liste : []).forEach(e => {
    if (!e || !e.code) return;
    out.total++;
    if (e.notif && e.notif !== 'non') out.notifies++;
    if (e.aide === 'individualisee') out.ai++;
    if (e.aide === 'mutualisee') out.am++;
    if (e.ulis) out.ulis++;
    const h = Number(String(e.heures == null ? '' : e.heures).replace(',', '.').replace(/[^0-9.]/g, ''));
    if (Number.isFinite(h)) out.heures += h;
  });
  return out;
}
export function libelleEleves(c) {
  if (!c || !c.notifies) return '';
  /* Court, parce qu'un bloc d'une heure n'a pas la place d'écrire « 6 notifiés dont
     2 individualisée » : la phrase était coupée au moment de devenir utile. */
  const p = [];
  if (c.ai) p.push(c.ai + ' AI');
  if (c.am) p.push(c.am + ' AM');
  if (c.ulis) p.push(c.ulis + ' ULIS');
  return c.notifies + ' él.' + (p.length ? ' · ' + p.join(' · ') : '');
}
