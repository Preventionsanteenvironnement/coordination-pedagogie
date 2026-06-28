// Page Affectation — le poste de travail principal :
// la grille d'une classe + la palette d'AESH à glisser sur les créneaux.
import { html, useState } from '@ui';
import { Icon } from '../components/icons.js';
import { ScheduleGrid } from '../components/ScheduleGrid.js';
import { WeekControl } from '../components/WeekControl.js';
import { AeshPalette } from '../components/AeshPalette.js';
import { fmt } from '../components/shared.js';
import { heuresClasse, byId } from '../lib/selectors.js';
import { alertsSummary } from '../lib/alerts.js';

export function AffectationView({ state }) {
  const [classeId, setClasseId] = useState(state.classes[0] && state.classes[0].id);
  const [activeAesh, setActiveAesh] = useState(null);
  const { weekMode, weekPriority } = state.config.ui;
  const classe = byId(state.classes, classeId);
  const alerts = alertsSummary(state);

  return html`
    <div class="page-header">
      <div>
        <h1 class="page-title">Affectation des AESH</h1>
        <div class="page-desc">Glissez un intervenant depuis la droite sur un créneau · le volume se recalcule en direct</div>
      </div>
      <div style="margin-top:16px"><${WeekControl} state=${state} /></div>
    </div>

    <div class="row gap-2 wrap" style="margin-bottom:16px">
      ${state.classes.map((c) => html`
        <button class=${'btn ' + (c.id === classeId ? 'primary' : '')} onClick=${() => setClasseId(c.id)}>
          <span class="dot" style=${`background:${c.id === classeId ? '#fff' : c.color}`}></span>
          ${c.nom} <span style="opacity:.7">· ${fmt(heuresClasse(state, c.id))} h</span>
        </button>`)}
    </div>

    <div class="grid" style="grid-template-columns:1fr 320px;align-items:start">
      <div class="col gap-4">
        <${ScheduleGrid} state=${state} classeId=${classeId} mode=${weekMode} priority=${weekPriority} editable=${true} />
        ${alerts.danger > 0 ? html`
          <div class="alert danger">
            <span class="alert-ico">${Icon.alert({size:16})}</span>
            <div><div class="alert-title">${alerts.danger} alerte(s) bloquante(s)</div>
            <div class="alert-desc">Volume dépassé ou chevauchement — voir le tableau de bord.</div></div>
          </div>` : null}
      </div>
      <${AeshPalette} state=${state} activeId=${activeAesh} onSelect=${setActiveAesh} />
    </div>`;
}
