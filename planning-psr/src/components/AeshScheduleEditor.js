// Éditeur du planning d'UN intervenant — on coche/décoche les cours qu'il accompagne,
// sur tous les jours et toutes les classes, avec détection de conflit en direct.
import { html } from '@ui';
import { Icon } from './icons.js';
import { JOURS, CRENEAUX, DISCIPLINES } from '../data/constants.js';
import { byId, bilanAesh, estAffecte, aeshOccupeAt, couvertureSeance } from '../lib/selectors.js';
import { semaineLabel, semaineColor } from '../lib/week.js';
import { addAffectation, removeAffectation } from '../store.js';
import { fmt, toast } from './shared.js';

function SeanceToggle({ state, aesh, seance }) {
  const disc = DISCIPLINES[seance.disc] || DISCIPLINES.autre;
  const classe = byId(state.classes, seance.classe);
  const assigned = estAffecte(state, aesh.id, seance.id);
  const conflits = assigned ? [] : aeshOccupeAt(state, aesh.id, seance.jour, seance.creneau, seance.semaine, seance.id);
  const conflit = conflits.length > 0;
  const sem = state.config.semaine;
  const cov = couvertureSeance(state, seance);

  const click = () => {
    if (assigned) {
      removeAffectation(aesh.id, seance.id);
      toast(`Retiré de ${disc.court}`, 'warn', { label: 'Annuler', fn: () => addAffectation(aesh.id, seance.id) });
    } else if (conflit) {
      const c = conflits[0]; const cd = DISCIPLINES[c.disc];
      toast(`Conflit : déjà sur ${cd ? cd.court : 'un cours'} à ce créneau`, 'warn');
    } else {
      addAffectation(aesh.id, seance.id);
    }
  };

  return html`
    <button class=${'sch-cell ' + (assigned ? 'on' : conflit ? 'conflit' : 'off')}
      style=${assigned ? `--disc:${aesh.color}` : `--disc:${disc.color}`}
      title=${conflit ? 'Conflit d\'horaire' : (assigned ? 'Cliquer pour retirer' : 'Cliquer pour affecter')}
      onClick=${click}>
      <span class="sch-cell-top">
        <b>${disc.court}</b>
        ${seance.semaine !== 'AB' ? html`<span class="sch-sem" style=${`color:${semaineColor(sem, seance.semaine)}`}>${semaineLabel(sem, seance.semaine)}</span>` : null}
      </span>
      <span class="sch-cell-sub">${classe ? classe.nom : ''}${seance.salle ? ' · ' + seance.salle : ''}</span>
      ${cov.attendu > 0 ? html`<span class=${'sch-need ' + cov.statut}>${cov.label} AESH</span>` : null}
      <span class="sch-mark">${assigned ? Icon.check({ size: 13 }) : conflit ? Icon.alert({ size: 12 }) : Icon.plus({ size: 13 })}</span>
    </button>`;
}

export function AeshScheduleEditor({ state, aeshId, onClose }) {
  const aesh = byId(state.aesh, aeshId);
  if (!aesh) return null;
  const b = bilanAesh(state, aeshId);
  const reste = b.cible - b.total;

  return html`
    <div class="overlay" onClick=${onClose}>
      <div class="modal modal-wide" onClick=${(e) => e.stopPropagation()}>
        <div class="modal-head">
          <div class="row gap-2">
            <span class="aesh-pill" style=${`background:${aesh.color};font-size:13px`}>${aesh.code || aesh.initiales}</span>
            <div>
              <h2>Composer le planning</h2>
              <div class="muted" style="font-size:12px">Cochez les cours accompagnés — les conflits sont signalés</div>
            </div>
          </div>
          <div class="row gap-2">
            <span class=${'badge ' + (Math.abs(reste) < 0.01 ? 'ok' : reste > 0 ? 'warn' : 'danger')}>
              ${fmt(b.total)} / ${fmt(b.cible)} h ${reste > 0.01 ? `· ${fmt(reste)} à placer` : reste < -0.01 ? `· +${fmt(-reste)}` : ''}
            </span>
            <button class="btn icon ghost" onClick=${onClose}>${Icon.x({ size: 18 })}</button>
          </div>
        </div>
        <div class="modal-body" style="padding:14px">
          <div class="sch-grid">
            <div class="sch-corner"></div>
            ${JOURS.map((j) => html`<div class="sch-day">${j.court}</div>`)}
            ${CRENEAUX.filter((c) => !c.pause).map((c) => html`
              <div class="sch-time">${c.debut}<br/>${c.fin}</div>
              ${JOURS.map((j) => {
                const seances = state.seances.filter((s) => s.jour === j.id && s.creneau === c.id);
                return html`<div class="sch-slot">
                  ${seances.length
                    ? seances.map((s) => html`<${SeanceToggle} state=${state} aesh=${aesh} seance=${s} />`)
                    : html`<span class="sch-empty"></span>`}
                </div>`;
              })}`)}
          </div>
        </div>
        <div class="modal-foot">
          <span class="muted" style="margin-right:auto;font-size:12px">${Icon.sparkle({ size: 13 })} Vert = accompagné · gris = libre · rouge = conflit d'horaire</span>
          <button class="btn primary" onClick=${onClose}>${Icon.check({ size: 15 })} Terminé</button>
        </div>
      </div>
    </div>`;
}
