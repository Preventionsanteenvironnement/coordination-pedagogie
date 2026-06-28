// Grille emploi du temps — vue classe et vue intervenant.
// Modes Semaine : 'AB' (fusion), 'A', 'B', 'compare' (côte à côte), + focus.
// Si editSeances : ajout/édition/déplacement des cours directement dans la grille.
import { html } from '@ui';
import { JOURS, CRENEAUX, DISCIPLINES } from '../data/constants.js';
import { aeshDeSeance, byId } from '../lib/selectors.js';
import { semaineLabel, semaineColor } from '../lib/week.js';
import { addAffectation, removeAffectation, moveSeance } from '../store.js';
import { toast } from './shared.js';
import { Icon } from './icons.js';

function AeshPill({ aesh, seanceId, editable }) {
  const code = aesh.code || aesh.initiales || '?';
  return html`
    <span class="aesh-pill" style=${`background:${aesh.color}`}
      title=${editable ? 'Cliquer pour retirer' : `AESH ${code}`}
      onClick=${(e) => {
        if (!editable) return;
        e.stopPropagation();
        removeAffectation(aesh.id, seanceId);
        toast(`AESH ${code} retiré de ce créneau`, 'warn');
      }}>
      ${code}
      ${editable ? html`<span class="x">×</span>` : null}
    </span>`;
}

function Seance({ state, seance, editable, highlightAesh, faded, mini, editSeances, onEditSeance }) {
  const disc = DISCIPLINES[seance.disc] || DISCIPLINES.autre;
  const sem = state.config.semaine;
  const aeshList = aeshDeSeance(state, seance.id);

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dropzone');
    const sid = e.dataTransfer.getData('seanceId');
    if (sid) { if (sid !== seance.id) moveSeance(sid, seance.jour, seance.creneau); return; }
    if (!editable) return;
    const aeshId = e.dataTransfer.getData('aeshId');
    if (!aeshId) return;
    if (aeshList.some((a) => a.id === aeshId)) { toast('Déjà positionné ici', 'warn'); return; }
    addAffectation(aeshId, seance.id);
    const a = byId(state.aesh, aeshId);
    toast(`AESH ${a ? (a.code || a.initiales) : ''} positionné sur ${disc.court}`, 'ok');
  };

  return html`
    <div class=${'seance' + (faded ? ' faded' : '') + (mini ? ' mini' : '') + (editSeances ? ' editable' : '')}
      style=${`--disc:${disc.color};--disc-soft:${disc.soft}`}
      draggable=${editSeances}
      onDragStart=${editSeances ? (e) => { e.dataTransfer.setData('seanceId', seance.id); e.dataTransfer.effectAllowed = 'move'; } : null}
      onDragOver=${(e) => { e.preventDefault(); e.currentTarget.classList.add('dropzone'); }}
      onDragLeave=${(e) => e.currentTarget.classList.remove('dropzone')}
      onDrop=${onDrop}
      onClick=${editSeances && onEditSeance ? () => onEditSeance(seance) : null}>
      ${seance.semaine !== 'AB' && !mini
        ? html`<span class="sem-tag" style=${`background:${hexFade(semaineColor(sem, seance.semaine))};color:${semaineColor(sem, seance.semaine)}`}>${semaineLabel(sem, seance.semaine)}</span>` : null}
      <div class="seance-title">${disc.court}${editSeances ? html`<span class="seance-edit">${Icon.edit({ size: 12 })}</span>` : null}</div>
      ${seance.salle ? html`<div class="seance-meta"><span class="seance-room">${/^\d/.test(seance.salle) ? 'Salle ' : ''}${seance.salle}</span></div>` : null}
      ${aeshList.length
        ? html`<div class="seance-aesh">
            ${aeshList.map((a) => html`<${AeshPill} aesh=${a} seanceId=${seance.id}
                editable=${editable && (!highlightAesh || highlightAesh === a.id)} />`)}
          </div>`
        : null}
    </div>`;
}

function CellContent({ state, seances, mode, priority, editable, highlightAesh, editSeances, onEditSeance, onAddCell, jour, creneau }) {
  const sem = state.config.semaine;

  if (!seances.length) {
    if (editSeances && onAddCell) {
      return html`<button class="cell-add" title="Ajouter un cours" onClick=${() => onAddCell(jour, creneau)}>${Icon.plus({ size: 16 })}</button>`;
    }
    return html`<div class="cell-empty-hint">·</div>`;
  }

  const props = { state, editable, highlightAesh, editSeances, onEditSeance };

  if (mode === 'compare') {
    const common = seances.filter((s) => s.semaine === 'AB');
    const aS = seances.filter((s) => s.semaine === 'A');
    const bS = seances.filter((s) => s.semaine === 'B');
    return html`
      ${common.map((se) => html`<${Seance} ...${props} seance=${se} />`)}
      ${(aS.length || bS.length) ? html`
        <div class="cmp">
          ${['A', 'B'].map((wk) => {
            const list = wk === 'A' ? aS : bS;
            return html`<div class="cmp-col">
              <div class="cmp-head" style=${`color:${semaineColor(sem, wk)};border-color:${semaineColor(sem, wk)}`}>${semaineLabel(sem, wk)}</div>
              ${list.length
                ? list.map((se) => html`<${Seance} ...${props} seance=${se} mini=${true} />`)
                : html`<div class="cmp-empty">—</div>`}
            </div>`;
          })}
        </div>` : null}`;
  }

  return seances.map((se) => {
    const faded = mode === 'AB' && priority && se.semaine !== 'AB' && se.semaine !== priority;
    return html`<${Seance} ...${props} seance=${se} faded=${faded} />`;
  });
}

function visibleSeances(state, list, jour, creneauId, mode) {
  const want = mode === 'A' ? 'A' : mode === 'B' ? 'B' : 'AB';
  return list.filter((s) => {
    if (s.jour !== jour || s.creneau !== creneauId) return false;
    if (want === 'AB') return true;
    return s.semaine === 'AB' || s.semaine === want;
  });
}

export function ScheduleGrid({ state, classeId, aeshId, mode = 'AB', priority = null, editable = true, editSeances = false, onAddCell, onEditSeance }) {
  let pool;
  if (classeId) pool = state.seances.filter((s) => s.classe === classeId);
  else if (aeshId) {
    const ids = new Set(state.affectations.filter((a) => a.aesh === aeshId).map((a) => a.seance));
    pool = state.seances.filter((s) => ids.has(s.id));
  } else pool = [];

  // Déplacement d'un cours déposé sur une partie vide de la cellule.
  const cellDrop = (jour, creneau) => (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dropzone');
    const sid = e.dataTransfer.getData('seanceId');
    if (sid) moveSeance(sid, jour, creneau);
  };

  return html`
    <div class=${'edt mode-' + mode}>
      <div class="edt-corner"></div>
      ${JOURS.map((j) => html`<div class="edt-day">${j.label}</div>`)}
      ${CRENEAUX.map((c) => {
        if (c.pause) {
          return html`
            <div class="edt-time pause">pause</div>
            ${JOURS.map(() => html`<div class="edt-cell pause-row"></div>`)}`;
        }
        return html`
          <div class="edt-time">${c.debut}<br/>${c.fin}</div>
          ${JOURS.map((j) => {
            const seances = visibleSeances(state, pool, j.id, c.id, mode);
            return html`<div class="edt-cell"
              onDragOver=${editSeances ? (e) => { e.preventDefault(); e.currentTarget.classList.add('dropzone'); } : null}
              onDragLeave=${editSeances ? (e) => e.currentTarget.classList.remove('dropzone') : null}
              onDrop=${editSeances ? cellDrop(j.id, c.id) : null}>
              <${CellContent} state=${state} seances=${seances} mode=${mode} priority=${priority}
                editable=${editable} highlightAesh=${aeshId}
                editSeances=${editSeances} onEditSeance=${onEditSeance} onAddCell=${onAddCell}
                jour=${j.id} creneau=${c.id} />
            </div>`;
          })}`;
      })}
    </div>`;
}

function hexFade(c) {
  if (typeof c === 'string' && c[0] === '#' && c.length === 7) {
    const r = parseInt(c.slice(1, 3), 16), g = parseInt(c.slice(3, 5), 16), b = parseInt(c.slice(5, 7), 16);
    return `rgba(${r},${g},${b},0.16)`;
  }
  return 'var(--surface-3)';
}
