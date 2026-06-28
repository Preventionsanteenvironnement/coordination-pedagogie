// Modale d'édition d'un événement de l'année : PFMP, CCF, conseil, bac blanc…
import { html, useState } from '@ui';
import { Icon } from './icons.js';
import { EVENT_TYPES } from '../data/constants.js';
import { upsertEvenement, removeEvenement } from '../store.js';
import { toast } from './shared.js';

let _n = 0;
const makeEvId = () => `ev-${Date.now().toString(36)}-${_n++}`;

export function EvenementModal({ state, draft, onClose }) {
  const isNew = !draft.id;
  const [type, setType] = useState(draft.type || 'pfmp');
  const [classe, setClasse] = useState(draft.classe || (state.classes[0] && state.classes[0].id));
  const [titre, setTitre] = useState(draft.titre || '');
  const [debut, setDebut] = useState(draft.debut || '');
  const [fin, setFin] = useState(draft.fin || draft.debut || '');
  const isRange = EVENT_TYPES[type]?.range;

  const save = () => {
    if (!debut) { toast('Indiquez une date', 'warn'); return; }
    upsertEvenement({
      id: draft.id || makeEvId(), type, classe,
      titre: titre.trim(), debut, fin: isRange ? (fin || debut) : debut,
      previsionnel: draft.previsionnel || false,
    });
    toast(isNew ? 'Événement ajouté' : 'Événement modifié');
    onClose();
  };
  const del = () => { removeEvenement(draft.id); toast('Événement supprimé', 'warn'); onClose(); };

  return html`
    <div class="overlay" onClick=${onClose}>
      <div class="modal" onClick=${(e) => e.stopPropagation()}>
        <div class="modal-head">
          <h2>${isNew ? 'Ajouter un événement' : 'Modifier l\'événement'}</h2>
          <button class="btn icon ghost" onClick=${onClose}>${Icon.x({ size: 18 })}</button>
        </div>
        <div class="modal-body">
          <div class="field">
            <label>Type</label>
            <div class="row wrap gap-2">
              ${Object.entries(EVENT_TYPES).map(([k, v]) => html`
                <button class=${'pick ' + (type === k ? 'on' : '')} onClick=${() => setType(k)}>
                  <span class="dot" style=${`background:${v.color}`}></span> ${v.court}
                </button>`)}
            </div>
          </div>
          <div class="grid grid-2" style="gap:16px">
            <div class="field">
              <label>Classe</label>
              <select class="select" value=${classe} onChange=${(e) => setClasse(e.target.value)}>
                ${state.classes.map((c) => html`<option value=${c.id} selected=${c.id === classe}>${c.nom}</option>`)}
              </select>
            </div>
            <div class="field">
              <label>Intitulé (optionnel)</label>
              <input class="input" value=${titre} placeholder=${EVENT_TYPES[type]?.court}
                onInput=${(e) => setTitre(e.target.value)} />
            </div>
          </div>
          <div class="grid grid-2" style="gap:16px">
            <div class="field">
              <label>${isRange ? 'Début' : 'Date'}</label>
              <input class="input" type="date" value=${debut} onInput=${(e) => setDebut(e.target.value)} />
            </div>
            ${isRange ? html`<div class="field">
              <label>Fin</label>
              <input class="input" type="date" value=${fin} onInput=${(e) => setFin(e.target.value)} />
            </div>` : null}
          </div>
        </div>
        <div class="modal-foot">
          ${!isNew ? html`<button class="btn danger" style="margin-right:auto" onClick=${del}>${Icon.trash({ size: 15 })} Supprimer</button>` : null}
          <button class="btn ghost" onClick=${onClose}>Annuler</button>
          <button class="btn primary" onClick=${save}>${Icon.check({ size: 15 })} ${isNew ? 'Ajouter' : 'Enregistrer'}</button>
        </div>
      </div>
    </div>`;
}
