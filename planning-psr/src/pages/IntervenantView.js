// Page Intervenant — planning personnel d'un AESH + détail de son volume horaire.
import { html, useState } from '@ui';
import { Icon } from '../components/icons.js';
import { ScheduleGrid } from '../components/ScheduleGrid.js';
import { WeekControl } from '../components/WeekControl.js';
import { AeshScheduleEditor } from '../components/AeshScheduleEditor.js';
import { Avatar, HourMeter, fmt } from '../components/shared.js';
import { bilanAesh, byId } from '../lib/selectors.js';
import { navigate } from '../router.js';

export function IntervenantView({ state, params }) {
  const aeshId = params.id || (state.aesh[0] && state.aesh[0].id);
  const aesh = byId(state.aesh, aeshId);
  const [editing, setEditing] = useState(false);
  if (!aesh) return html`<div class="empty">Intervenant introuvable.</div>`;

  const b = bilanAesh(state, aeshId);
  const reste = b.cible - b.total;
  const { weekMode, weekPriority } = state.config.ui;

  return html`
    <div class="page-header">
      <div class="spread wrap gap-4">
        <div class="row gap-4 wrap">
          <div class="seg">
            ${state.aesh.map((a) => html`
              <button class=${a.id === aeshId ? 'active both' : ''} onClick=${() => navigate(`/aesh/${a.id}`)}>${a.code || a.initiales}</button>`)}
          </div>
          <div class="row">
            <${Avatar} avatar=${aesh.avatar} initiales=${aesh.initiales} color=${aesh.color} size=${34} />
            <div>
              <h1 class="page-title">${aesh.nom}</h1>
              <div class="page-desc">Volume contractuel ${fmt(aesh.volumeCible)} h / semaine</div>
            </div>
          </div>
        </div>
        <button class="btn primary" onClick=${() => setEditing(true)}>${Icon.edit({ size: 15 })} Composer le planning</button>
      </div>
    </div>

    ${editing ? html`<${AeshScheduleEditor} state=${state} aeshId=${aeshId} onClose=${() => setEditing(false)} />` : null}

    <div style="margin-bottom:16px"><${WeekControl} state=${state} /></div>

    <div class="grid" style="grid-template-columns:1fr 300px;align-items:start">
      <${ScheduleGrid} state=${state} aeshId=${aeshId} mode=${weekMode} priority=${weekPriority} editable=${true} />

      <div class="col gap-4">
        <div class="card">
          <span class="card-eyebrow">Bilan du service</span>
          <div style="margin:14px 0">
            <${HourMeter} value=${b.total} target=${b.cible} label="Total positionné"
              sub=${reste > 0.01 ? `${fmt(reste)} h restantes à placer` : reste < -0.01 ? `dépassement de ${fmt(-reste)} h` : 'volume complet'} />
          </div>
          <table class="tbl">
            <tbody>
              ${Object.entries(b.parClasse).map(([cid, h]) => {
                const c = byId(state.classes, cid);
                return html`<tr><td>${c ? c.nom : cid}</td><td style="text-align:right;font-weight:650">${fmt(h)} h</td></tr>`;
              })}
              ${(aesh.horsClasse || []).map((x) => html`
                <tr><td class="muted">${x.label}<span class="badge" style="margin-left:6px">hors PSR</span></td>
                  <td style="text-align:right" class="muted">${fmt(x.h)} h</td></tr>`)}
              <tr style="border-top:2px solid var(--border)">
                <td style="font-weight:700">Total</td>
                <td style="text-align:right;font-weight:700">${fmt(b.total)} h</td></tr>
            </tbody>
          </table>
        </div>

        <div class="card pad-sm">
          <div class="row gap-2" style="font-size:12px;color:var(--text-3)">
            ${Icon.pin({size:14})} Planning stable de début d'année. Modifiable à tout moment (absence, CCF, épreuve) depuis la page <b style="color:var(--text-2)">&nbsp;Affectation</b>.
          </div>
        </div>
      </div>
    </div>`;
}
