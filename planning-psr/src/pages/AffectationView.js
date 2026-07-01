// Page Affectation — le poste de travail principal :
// la grille d'une classe + la palette d'AESH à glisser sur les créneaux.
import { html, useState } from '@ui';
import { Icon } from '../components/icons.js';
import { ScheduleGrid } from '../components/ScheduleGrid.js';
import { WeekControl } from '../components/WeekControl.js';
import { AeshPalette } from '../components/AeshPalette.js';
import { SlotInspector } from '../components/SlotInspector.js';
import { fmt } from '../components/shared.js';
import { byId, couvertureClasse } from '../lib/selectors.js';
import { alertsSummary } from '../lib/alerts.js';

export function AffectationView({ state }) {
  const [classeId, setClasseId] = useState(state.classes[0] && state.classes[0].id);
  const [activeAesh, setActiveAesh] = useState(null);
  const [inspectId, setInspectId] = useState(null);
  const { weekMode, weekPriority } = state.config.ui;
  const classe = byId(state.classes, classeId);
  const alerts = alertsSummary(state);
  const couverture = classe ? couvertureClasse(state, classe.id) : null;
  const inspectSeance = inspectId ? byId(state.seances, inspectId) : null;

  return html`
    <div class="page-header">
      <div>
        <h1 class="page-title">Affectation des AESH</h1>
        <div class="page-desc">Couvrez les besoins par créneau, sans données élèves nominatives · les volumes se recalculent en direct</div>
      </div>
      <div style="margin-top:16px"><${WeekControl} state=${state} /></div>
    </div>

    <div class="row gap-2 wrap" style="margin-bottom:16px">
      ${state.classes.map((c) => html`
        <button class=${'btn ' + (c.id === classeId ? 'primary' : '')} onClick=${() => setClasseId(c.id)}>
          <span class="dot" style=${`background:${c.id === classeId ? '#fff' : c.color}`}></span>
          ${c.nom} <span style="opacity:.7">· ${couvertureClasse(state, c.id).percent}% couverts</span>
        </button>`)}
    </div>

    <div class="grid affect-grid">
      <div class="col gap-4">
        ${classe && couverture ? html`
          <div class="card pad-sm coverage-panel">
            <div>
              <div class="card-eyebrow">Besoins ${classe.nom}</div>
              <h2>${couverture.percent}% couverts</h2>
            </div>
            <div class="row gap-2 wrap">
              <span class="badge ok">${couverture.coveredSlots} complets</span>
              <span class="badge info">${couverture.partialSlots} partiels</span>
              <span class=${'badge ' + (couverture.missingSlots ? 'warn' : 'ok')}>${couverture.missingSlots} non couverts</span>
              <span class="badge accent">${fmt(couverture.coveredHours)} / ${fmt(couverture.expectedHours)} h attendues</span>
            </div>
          </div>` : null}
        <div class="hint-inline muted">${Icon.pin({ size: 13 })} Cliquez un créneau pour ouvrir son panneau (besoin, AESH, type d'accompagnement, remarque).</div>
        <${ScheduleGrid} state=${state} classeId=${classeId} mode=${weekMode} priority=${weekPriority} editable=${true} onSlotClick=${(se) => setInspectId(se.id)} />
        ${alerts.danger > 0 ? html`
          <div class="alert danger">
            <span class="alert-ico">${Icon.alert({size:16})}</span>
            <div><div class="alert-title">${alerts.danger} alerte(s) bloquante(s)</div>
            <div class="alert-desc">Volume dépassé ou chevauchement — voir le tableau de bord.</div></div>
          </div>` : null}
      </div>
      <${AeshPalette} state=${state} activeId=${activeAesh} onSelect=${setActiveAesh} />
    </div>
    ${inspectSeance ? html`<${SlotInspector} state=${state} seance=${inspectSeance} onClose=${() => setInspectId(null)} />` : null}`;
}
