/* Sauvegarde et restauration de l'espace Référents (26/09/2026).
   Fonctions pures : elles décident QUOI écrire, jamais elles n'écrivent.
   C'est la partie qui peut retirer des documents — elle est donc testée à part. */

export const FORMAT = 'referents-aesh-sauvegarde';

/* Deux documents disent la même chose ? On ignore ce qui change à chaque écriture. */
export function memeDoc(a, b) {
  if (!a || !b) return false;
  const net = x => {
    const o = { ...x };
    delete o.version; delete o.majLe; delete o.par;
    return JSON.stringify(o, Object.keys(o).sort());
  };
  return net(a) === net(b);
}

/* Un document entre-t-il dans le périmètre choisi ?
   « tout » prend tout. « pole » et « classe » ne touchent QUE ce qui s'y rattache :
   la période, les messages et les réunions institutionnelles sont communs aux quatre
   pôles, donc jamais restaurés depuis un périmètre restreint — on ne défait pas le
   travail d'un autre référent en restaurant le sien. */
export function dansPerimetre(d, { perimetre, pole, classe, classesDuPole, aeshDuPole }) {
  if (!d || !d.type) return false;
  if (perimetre === 'tout') return true;
  const classes = perimetre === 'classe' ? [classe] : (classesDuPole || []);
  switch (d.type) {
    case 'eleves': case 'epreuve': return classes.includes(d.classe);
    case 'place': return (d.classes || []).some(n => classes.includes(n));
    case 'aesh': return perimetre === 'pole' && !!(d.equipes || {})[pole];
    case 'absence': return perimetre === 'pole' && (aeshDuPole || []).includes(d.aeshId);
    case 'pole': return perimetre === 'pole' && d.id === 'pole_' + pole;
    default: return false;
  }
}

/* Ce qui va changer, avant d'écrire quoi que ce soit.
   « identique » ne retire que des documents qui portent un statut : un placement, une
   absence, une épreuve. Jamais une fiche AESH ni une classe d'élèves — les retirer
   n'aurait pas de sens et les règles l'interdisent de toute façon. */
export function analyser(paquet, ici, opts) {
  const entrants = (paquet && paquet.documents || []).filter(d => d && d.id && d.type !== 'hist' && dansPerimetre(d, opts));
  const ajoutes = [], modifies = [], inchanges = [];
  entrants.forEach(d => {
    const a = ici.get(d.id);
    if (!a) ajoutes.push(d);
    else if (memeDoc(a, d)) inchanges.push(d);
    else modifies.push(d);
  });
  const cles = new Set(entrants.map(d => d.id));
  const enTrop = opts.mode === 'identique'
    ? [...ici.values()].filter(d => d && d.id && !cles.has(d.id) && d.statut !== 'retire'
        && ['place', 'absence', 'epreuve'].includes(d.type) && dansPerimetre(d, opts))
    : [];
  return { ajoutes, modifies, inchanges, enTrop };
}

export function verifierPaquet(paquet, annee) {
  if (!paquet || paquet.format !== FORMAT || !Array.isArray(paquet.documents))
    throw new Error('Ce fichier n’est pas une sauvegarde de cet espace.');
  if (paquet.annee && annee && paquet.annee !== annee)
    throw new Error(`Sauvegarde de l’année ${paquet.annee}, pas de ${annee}.`);
  return paquet;
}
