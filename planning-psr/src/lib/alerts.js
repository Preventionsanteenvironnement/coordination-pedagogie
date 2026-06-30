// Moteur d'alertes — détecte automatiquement les incohérences de coordination.
// C'est la valeur ajoutée vs Excel : tout est vérifié en continu.
import { byId, bilanAesh, conflitsAesh, couvertureSeance } from './selectors.js';
import { DISCIPLINES, creneauById, jourById } from '../data/constants.js';

const sevRank = { danger: 0, warn: 1, info: 2 };

export function computeAlerts(state) {
  const out = [];

  // 1) AESH en sur-volume ou sous-volume par rapport à la cible
  state.aesh.forEach((a) => {
    const b = bilanAesh(state, a.id);
    if (b.cible > 0 && b.ecart > 0.01) {
      out.push({
        sev: 'danger', cat: 'Volume',
        title: `${a.nom} dépasse son volume`,
        desc: `${b.total} h positionnées pour une cible de ${b.cible} h (+${round(b.ecart)} h).`,
        ref: { type: 'aesh', id: a.id },
      });
    } else if (b.cible > 0 && b.ecart < -0.01) {
      out.push({
        sev: 'warn', cat: 'Volume',
        title: `${a.nom} sous son volume`,
        desc: `${b.total} h positionnées sur ${b.cible} h cible (${round(b.ecart)} h à placer).`,
        ref: { type: 'aesh', id: a.id },
      });
    }
  });

  // 2) Conflits d'emploi du temps (AESH sur 2 séances en même temps)
  state.aesh.forEach((a) => {
    conflitsAesh(state, a.id).forEach(([x, y]) => {
      out.push({
        sev: 'danger', cat: 'Conflit',
        title: `${a.nom} : chevauchement`,
        desc: `${jourById(x.jour)?.label} ${creneauById(x.creneau)?.debut} — ${DISCIPLINES[x.disc]?.court} et ${DISCIPLINES[y.disc]?.court} en simultané.`,
        ref: { type: 'aesh', id: a.id },
      });
    });
  });

  // 3) Besoins AESH non couverts (sans données élèves nominatives)
  state.seances.forEach((se) => {
    const classe = byId(state.classes, se.classe);
    if (!classe || classe.dispositif === 'none') return;
    if (creneauById(se.creneau)?.soiree) return; // soirée traitée à part
    const cov = couvertureSeance(state, se);
    if (cov.attendu > 0 && cov.manquants > 0) {
      out.push({
        sev: cov.positionnes === 0 ? 'warn' : 'info',
        cat: 'Couverture',
        title: `${classe.nom} : besoin AESH à couvrir`,
        desc: `${jourById(se.jour)?.label} ${creneauById(se.creneau)?.debut} — ${DISCIPLINES[se.disc]?.label}${se.semaine !== 'AB' ? ` (sem. ${se.semaine})` : ''} : ${cov.positionnes}/${cov.attendu} AESH positionné(s).`,
        ref: { type: 'seance', id: se.id, classe: se.classe },
      });
    }
  });

  return out.sort((p, q) => sevRank[p.sev] - sevRank[q.sev]);
}

export function alertsSummary(state) {
  const all = computeAlerts(state);
  return {
    total: all.length,
    danger: all.filter((a) => a.sev === 'danger').length,
    warn: all.filter((a) => a.sev === 'warn').length,
    info: all.filter((a) => a.sev === 'info').length,
    all,
  };
}

function round(n) { return Math.round(n * 10) / 10; }
