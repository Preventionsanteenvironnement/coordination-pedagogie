// Modale d'édition d'une séance (cours) : matière, enseignant(s), salle, semaine.
// Sert à créer un nouveau cours ou à modifier/supprimer un cours existant.
import { html, useState } from '@ui';
import { Icon } from './icons.js';
import { DISCIPLINES, JOURS, creneauById, jourById } from '../data/constants.js';
import { upsertSeance, removeSeance } from '../store.js';
import { toast } from './shared.js';

let _newId = 0;
const makeId = () => `se-${Date.now().toString(36)}-${_newId++}`;

export function SeanceModal({ state, draft, onClose }) {
  const isNew = !draft.id;
  const [disc, setDisc] = useState(draft.disc || 'pole1');
  const [profs, setProfs] = useState(draft.profs ? [...draft.profs] : []);
  const [salle, setSalle] = useState(draft.salle || '');
  const [semaine, setSemaine] = useState(draft.semaine || 'AB');
  const [besoinAesh, setBesoinAesh] = useState(Number.isFinite(Number(draft.besoinAesh)) ? Number(draft.besoinAesh) : 1);
  const sem = state.config.semaine;

  const cr = creneauById(draft.creneau);
  const toggleProf = (id) => setProfs((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const save = () => {
    const seance = {
      id: draft.id || makeId(),
      classe: draft.classe, jour: draft.jour, creneau: draft.creneau,
      disc, profs, salle: salle.trim(), semaine, besoinAesh,
    };
    upsertSeance(seance);
    toast(isNew ? 'Cours ajouté' : 'Cours modifié');
    onClose();
  };

  const del = () => { removeSeance(draft.id); toast('Cours supprimé', 'warn'); onClose(); };

  // Enseignants suggérés en premier (ceux qui enseignent cette discipline).
  const ens = [...state.enseignants].sort((a, b) => {
    const aw = (a.disc || []).includes(disc) ? 0 : 1;
    const bw = (b.disc || []).includes(disc) ? 0 : 1;
    return aw - bw;
  });

  return html`
    <div class="overlay" onClick=${onClose}>
      <div class="modal" onClick=${(e) => e.stopPropagation()}>
        <div class="modal-head">
          <div>
            <h2>${isNew ? 'Ajouter un cours' : 'Modifier le cours'}</h2>
            <div class="muted" style="font-size:12px;margin-top:2px">
              ${jourById(draft.jour)?.label} · ${cr?.debut}–${cr?.fin}
            </div>
          </div>
          <button class="btn icon ghost" onClick=${onClose}>${Icon.x({ size: 18 })}</button>
        </div>

        <div class="modal-body">
          <div class="field">
            <label>Matière</label>
            <select class="select" value=${disc} onChange=${(e) => setDisc(e.target.value)}>
              ${Object.entries(DISCIPLINES).map(([k, v]) => html`<option value=${k} selected=${k === disc}>${v.label}</option>`)}
            </select>
          </div>

          <div class="field">
            <label>Enseignant(s) — usage interne, non affiché dans la grille</label>
            <div class="row wrap gap-2">
              ${ens.map((e) => html`
                <button class=${'pick ' + (profs.includes(e.id) ? 'on' : '')}
                  onClick=${() => toggleProf(e.id)}>
                  ${profs.includes(e.id) ? Icon.check({ size: 13 }) : null} ${e.nom}
                </button>`)}
            </div>
          </div>

          <div class="grid grid-2" style="gap:16px">
            <div class="field">
              <label>Salle</label>
              <input class="input" value=${salle} placeholder="ex. 008"
                onInput=${(e) => setSalle(e.target.value)} />
            </div>
            <div class="field">
              <label>Semaine</label>
              <div class="seg">
                <button class=${semaine === 'AB' ? 'active both' : ''} onClick=${() => setSemaine('AB')}>A + B</button>
                <button class=${semaine === 'A' ? 'active a' : ''} onClick=${() => setSemaine('A')}>${sem.labelA}</button>
                <button class=${semaine === 'B' ? 'active b' : ''} onClick=${() => setSemaine('B')}>${sem.labelB}</button>
              </div>
            </div>
          </div>

          <div class="field">
            <label>Besoin AESH attendu</label>
            <div class="seg">
              ${[0, 1, 2].map((n) => html`
                <button class=${besoinAesh === n ? 'active both' : ''} onClick=${() => setBesoinAesh(n)}>
                  ${n === 0 ? 'Aucun' : `${n} AESH`}
                </button>`)}
            </div>
            <div class="muted" style="font-size:12px">
              Donnée anonyme : on indique le volume d'accompagnement attendu sur le créneau, sans nom d'élève.
            </div>
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
