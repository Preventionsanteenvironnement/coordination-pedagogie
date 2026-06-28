// Page Classe — emploi du temps d'une classe, éditeur de cours, Semaine A/B.
import { html, useState } from '@ui';
import { Icon } from '../components/icons.js';
import { ScheduleGrid } from '../components/ScheduleGrid.js';
import { WeekControl } from '../components/WeekControl.js';
import { SeanceModal } from '../components/SeanceModal.js';
import { fmt } from '../components/shared.js';
import { DISCIPLINES } from '../data/constants.js';
import { heuresClasse, byId } from '../lib/selectors.js';
import { navigate } from '../router.js';

export function ClasseView({ state, params, readOnly = false }) {
  const classeId = params.id || (state.classes[0] && state.classes[0].id);
  const classe = byId(state.classes, classeId);
  const { weekMode, weekPriority } = state.config.ui;
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(null); // séance en cours d'édition (modale)
  const canEdit = !readOnly && editMode;

  if (!classe) return html`<div class="empty">Classe introuvable.</div>`;

  const openAdd = (jour, creneau) => setDraft({ classe: classeId, jour, creneau, disc: 'pole1', profs: [], salle: '', semaine: 'AB' });
  const openEdit = (seance) => setDraft(seance);

  // Disciplines réellement présentes (pour la légende).
  const discPresentes = [...new Set(state.seances.filter((s) => s.classe === classeId).map((s) => s.disc))];

  return html`
    <div class="page-header">
      <div class="spread wrap gap-4">
        <div class="row gap-4 wrap">
          <div class="seg">
            ${state.classes.map((c) => html`
              <button class=${c.id === classeId ? 'active both' : ''} onClick=${() => navigate(`/classe/${c.id}`)}>${c.nom}</button>`)}
          </div>
          <div>
            <h1 class="page-title">${classe.nom}</h1>
            <div class="page-desc">${classe.niveau} · ${classe.effectif} élèves · ${fmt(heuresClasse(state, classeId))} h d'accompagnement positionnées</div>
          </div>
        </div>
      </div>
      <div class="spread wrap gap-4" style="margin-top:16px">
        <${WeekControl} state=${state} />
        ${readOnly ? null : html`
          <button class=${'btn ' + (editMode ? 'primary' : '')} onClick=${() => setEditMode((v) => !v)}>
            ${editMode ? Icon.check({ size: 15 }) : Icon.edit({ size: 15 })}
            ${editMode ? 'Terminer l\'édition' : 'Modifier les cours'}
          </button>`}
      </div>
    </div>

    ${canEdit ? html`
      <div class="alert info" style="margin-bottom:14px">
        <span class="alert-ico">${Icon.edit({ size: 16 })}</span>
        <div><div class="alert-title">Mode édition des cours</div>
        <div class="alert-desc">Cliquez une case vide pour ajouter un cours · cliquez un cours pour le modifier · glissez-le pour le déplacer.</div></div>
      </div>` : null}

    <${ScheduleGrid} state=${state} classeId=${classeId} mode=${weekMode} priority=${weekPriority}
      editable=${!readOnly} editSeances=${canEdit}
      onAddCell=${readOnly ? null : openAdd} onEditSeance=${readOnly ? null : openEdit} />

    ${!readOnly && draft ? html`<${SeanceModal} state=${state} draft=${draft} onClose=${() => setDraft(null)} />` : null}

    <div class="card pad-sm" style="margin-top:20px">
      <div class="row wrap gap-4">
        <span class="card-eyebrow">Disciplines</span>
        ${discPresentes.map((d) => {
          const disc = DISCIPLINES[d] || DISCIPLINES.autre;
          return html`<span class="row gap-2" style="font-size:12px">
            <span class="dot" style=${`background:${disc.color}`}></span>${disc.label}</span>`;
        })}
      </div>
    </div>

    ${readOnly ? null : html`
      <div class="row gap-4" style="margin-top:16px;font-size:12px;color:var(--text-3)">
        ${Icon.sparkle({ size: 14 })} Astuce : allez dans <b style="color:var(--text-2)">&nbsp;Affectation&nbsp;</b> pour glisser les AESH sur les créneaux. Ici, cliquez sur une pastille AESH pour la retirer.
      </div>`}`;
}
