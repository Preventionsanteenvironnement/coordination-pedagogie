// Palette d'AESH déplaçables — barre latérale de la page Affectation.
// Chaque puce affiche le volume d'heures restant, et se glisse sur une séance.
import { html } from '@ui';
import { Avatar, HourMeter, fmt } from './shared.js';
import { bilanAesh } from '../lib/selectors.js';

export function AeshPalette({ state, activeId, onSelect }) {
  return html`
    <div class="card pad-sm palette">
      <div class="spread">
        <span class="card-eyebrow">Intervenants AESH</span>
        <span class="badge">${state.aesh.length}</span>
      </div>
      <div class="palette-aesh">
        ${state.aesh.map((a) => {
          const b = bilanAesh(state, a.id);
          const reste = b.cible - b.total;
          let etat = 'ok';
          if (reste < -0.01) etat = 'danger'; else if (reste > 0.01) etat = 'warn';
          return html`
            <div class=${'card pad-sm ' + (activeId === a.id ? 'active-aesh' : '')}
              style=${`cursor:grab;border-color:${activeId === a.id ? a.color : 'var(--border)'};padding:11px`}
              draggable=${true}
              onDragStart=${(e) => { e.dataTransfer.setData('aeshId', a.id); e.dataTransfer.effectAllowed = 'copy'; }}
              onClick=${() => onSelect && onSelect(a.id)}>
              <div class="row" style="margin-bottom:8px">
                <${Avatar} initiales=${a.initiales} color=${a.color} size=${28} />
                <div class="grow">
                  <div style="font-weight:650;font-size:13px">${a.nom}</div>
                  <div class="muted" style="font-size:11px">cible ${fmt(a.volumeCible)} h / semaine</div>
                </div>
                <span class=${'badge ' + etat}>
                  ${reste > 0.01 ? `${fmt(reste)} h à placer` : reste < -0.01 ? `+${fmt(-reste)} h` : 'complet'}
                </span>
              </div>
              <${HourMeter} value=${b.total} target=${b.cible} label="Service total" />
            </div>`;
        })}
      </div>
      <div class="muted" style="font-size:11px;padding:4px 2px">
        Glissez une carte sur un créneau de la grille pour positionner l'AESH.
      </div>
    </div>`;
}
