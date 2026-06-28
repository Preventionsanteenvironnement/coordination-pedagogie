// Contrôle Semaine A/B — switch animé + focus/transparence + semaine en cours.
// Lit/écrit l'état via le store ; réutilisé sur Classe et Affectation.
import { html } from '@ui';
import { Icon } from './icons.js';
import { setWeekView } from '../store.js';
import { weekStatus, rangeLabel, semaineLabel, semaineColor } from '../lib/week.js';

export function WeekControl({ state, compact = false }) {
  const sem = state.config.semaine;
  const { weekMode, weekPriority } = state.config.ui;

  const modes = [
    { id: 'AB', label: 'A + B', ico: Icon.stack },
    { id: 'A', label: semaineLabel(sem, 'A'), ico: null, dot: semaineColor(sem, 'A') },
    { id: 'B', label: semaineLabel(sem, 'B'), ico: null, dot: semaineColor(sem, 'B') },
    { id: 'compare', label: 'Côte à côte', ico: Icon.columns },
  ];
  const idx = Math.max(0, modes.findIndex((m) => m.id === weekMode));
  const showFocus = weekMode === 'AB' || weekMode === 'compare';

  // Statut réel de la semaine en cours (tient compte des vacances / calendrier).
  const info = weekStatus(state.config);
  const enEcole = info.status === 'ecole';
  const curColor = enEcole ? semaineColor(sem, info.parity) : '#6e7a92';
  const chipTop = enEcole ? 'Cette semaine'
    : info.status === 'vacances' ? 'En ce moment'
    : info.status === 'avant' ? 'À venir' : 'Année terminée';
  const chipMain = enEcole ? `Semaine ${semaineLabel(sem, info.parity)}`
    : info.status === 'vacances' ? `Vacances · ${info.nom}`
    : info.status === 'avant' ? 'Avant la rentrée' : 'Après les cours';

  // Cycle de focus : aucun → A → B → aucun.
  const cycleFocus = () => {
    const next = weekPriority === null ? 'A' : weekPriority === 'A' ? 'B' : null;
    setWeekView({ priority: next });
  };

  return html`
    <div class=${'weekctl ' + (compact ? 'compact' : '')}>
      <!-- Semaine en cours (auto, calendrier) -->
      <button class=${'weekctl-now' + (enEcole ? '' : ' off')} style=${`--cw:${curColor}`}
        title=${enEcole ? 'Mettre la semaine en cours en avant' : 'Période hors cours'}
        onClick=${() => enEcole ? setWeekView({ mode: 'AB', priority: info.parity }) : setWeekView({ mode: 'AB' })}>
        <span class="weekctl-pulse"></span>
        <span class="weekctl-now-txt">
          <span class="muted">${chipTop}</span>
          <b>${chipMain}</b>
        </span>
        <span class="weekctl-range">${rangeLabel()}</span>
      </button>

      <!-- Switch de modes (slider animé) -->
      <div class="weekctl-modes" style=${`--idx:${idx};--n:${modes.length}`}>
        <span class=${'weekctl-slider m-' + weekMode}></span>
        ${modes.map((m) => html`
          <button class=${'weekctl-mode ' + (weekMode === m.id ? 'active' : '')}
            onClick=${() => setWeekView({ mode: m.id })}>
            ${m.dot ? html`<span class="dot" style=${`background:${m.dot}`}></span>` : (m.ico ? m.ico({ size: 15 }) : null)}
            <span class="weekctl-mode-lbl">${m.label}</span>
          </button>`)}
      </div>

      <!-- Focus / transparence -->
      ${showFocus ? html`
        <button class=${'weekctl-focus ' + (weekPriority ? 'on' : '')}
          style=${weekPriority ? `--fc:${semaineColor(sem, weekPriority)}` : ''}
          title="Mettre une semaine en avant (l'autre s'estompe)"
          onClick=${cycleFocus}>
          ${Icon.swap({ size: 15 })}
          <span>${weekPriority ? `Focus ${semaineLabel(sem, weekPriority)}` : 'Égal'}</span>
        </button>` : null}
    </div>`;
}
