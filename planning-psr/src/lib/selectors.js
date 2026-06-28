// Sélecteurs — calculs dérivés de l'état (heures, couverture, conflits).
// Aucune mutation ici : uniquement de la lecture.
import { creneauById, heuresCreneaux } from '../data/constants.js';

export const byId = (list, id) => list.find((x) => x.id === id);

// Heures réalisées par un AESH dans les classes (somme des durées de séances affectées).
export function heuresAeshClasse(state, aeshId) {
  return state.affectations
    .filter((a) => a.aesh === aeshId)
    .reduce((sum, a) => {
      const se = byId(state.seances, a.seance);
      return sum + (se ? (creneauById(se.creneau)?.h || 0) : 0);
    }, 0);
}

export function heuresAeshHorsClasse(state, aeshId) {
  const aesh = byId(state.aesh, aeshId);
  return (aesh?.horsClasse || []).reduce((s, x) => s + (x.h || 0), 0);
}

// Bilan complet d'un AESH : réalisé, cible, écart, répartition par classe.
export function bilanAesh(state, aeshId) {
  const aesh = byId(state.aesh, aeshId);
  const classeH = heuresAeshClasse(state, aeshId);
  const horsH = heuresAeshHorsClasse(state, aeshId);
  const total = classeH + horsH;
  const cible = aesh?.volumeCible || 0;
  const parClasse = {};
  state.affectations.filter((a) => a.aesh === aeshId).forEach((a) => {
    const se = byId(state.seances, a.seance);
    if (!se) return;
    parClasse[se.classe] = (parClasse[se.classe] || 0) + (creneauById(se.creneau)?.h || 0);
  });
  return { aesh, classeH, horsH, total, cible, ecart: total - cible, parClasse };
}

// Heures d'accompagnement positionnées sur une classe (toutes AESH confondues).
export function heuresClasse(state, classeId) {
  const seanceIds = new Set(state.seances.filter((s) => s.classe === classeId).map((s) => s.id));
  return state.affectations
    .filter((a) => seanceIds.has(a.seance))
    .reduce((sum, a) => {
      const se = byId(state.seances, a.seance);
      return sum + (creneauById(se.creneau)?.h || 0);
    }, 0);
}

// AESH affectés à une séance donnée.
export function aeshDeSeance(state, seanceId) {
  const ids = state.affectations.filter((a) => a.seance === seanceId).map((a) => a.aesh);
  return ids.map((id) => byId(state.aesh, id)).filter(Boolean);
}

// Récupère la (ou les) séance(s) d'une classe sur un créneau, filtrées par semaine affichée.
// vue : 'AB' montre tout ; 'A' montre AB + A ; 'B' montre AB + B.
export function seancesCellule(state, classeId, jour, creneauId, vue) {
  return state.seances.filter((s) => {
    if (s.classe !== classeId || s.jour !== jour || s.creneau !== creneauId) return false;
    if (vue === 'AB') return true;
    if (vue === 'A') return s.semaine === 'AB' || s.semaine === 'A';
    if (vue === 'B') return s.semaine === 'AB' || s.semaine === 'B';
    return true;
  });
}

// Toutes les séances où intervient un AESH (pour sa grille perso).
export function seancesAesh(state, aeshId) {
  const seanceIds = new Set(state.affectations.filter((a) => a.aesh === aeshId).map((a) => a.seance));
  return state.seances.filter((s) => seanceIds.has(s.id));
}

// Conflit : un AESH affecté à 2 séances simultanées (même jour+créneau, semaines compatibles).
export function conflitsAesh(state, aeshId) {
  const seances = seancesAesh(state, aeshId);
  const conflicts = [];
  for (let i = 0; i < seances.length; i++) {
    for (let j = i + 1; j < seances.length; j++) {
      const x = seances[i], y = seances[j];
      if (x.jour === y.jour && x.creneau === y.creneau) {
        const sameWeek = x.semaine === 'AB' || y.semaine === 'AB' || x.semaine === y.semaine;
        if (sameWeek) conflicts.push([x, y]);
      }
    }
  }
  return conflicts;
}

// Heures d'un AESH sur une semaine de parité donnée ('A' ou 'B') :
// les séances communes (AB) + celles de la semaine considérée.
export function heuresAeshParite(state, aeshId, parity) {
  return state.affectations
    .filter((a) => a.aesh === aeshId)
    .reduce((s, a) => {
      const se = byId(state.seances, a.seance);
      if (!se) return s;
      if (se.semaine === 'AB' || se.semaine === parity) return s + (creneauById(se.creneau)?.h || 0);
      return s;
    }, 0);
}

// Liste à plat des séances d'un AESH, triées (jour puis créneau) — pour la vue Liste.
export function listeAesh(state, aeshId) {
  const ids = new Set(state.affectations.filter((a) => a.aesh === aeshId).map((a) => a.seance));
  const ordreJour = { lun: 0, mar: 1, mer: 2, jeu: 3, ven: 4, sam: 5 };
  return state.seances
    .filter((s) => ids.has(s.id))
    .sort((a, b) => (ordreJour[a.jour] - ordreJour[b.jour]) || a.creneau.localeCompare(b.creneau));
}

// L'AESH est-il déjà occupé sur ce créneau (jour+créneau, semaine compatible) ?
// Renvoie la/les séance(s) en conflit (hors la séance testée).
export function aeshOccupeAt(state, aeshId, jour, creneau, semaine, exceptSeanceId) {
  const seanceIds = new Set(state.affectations.filter((a) => a.aesh === aeshId).map((a) => a.seance));
  return state.seances.filter((s) =>
    seanceIds.has(s.id) && s.id !== exceptSeanceId &&
    s.jour === jour && s.creneau === creneau &&
    (s.semaine === 'AB' || semaine === 'AB' || s.semaine === semaine));
}

export function estAffecte(state, aeshId, seanceId) {
  return state.affectations.some((a) => a.aesh === aeshId && a.seance === seanceId);
}

export function totauxGeneraux(state) {
  const totalAffecteH = state.aesh.reduce((s, a) => s + heuresAeshClasse(state, a.id), 0);
  const totalHorsH = state.aesh.reduce((s, a) => s + heuresAeshHorsClasse(state, a.id), 0);
  const totalCible = state.aesh.reduce((s, a) => s + (a.volumeCible || 0), 0);
  return { totalAffecteH, totalHorsH, totalServiceH: totalAffecteH + totalHorsH, totalCible };
}
