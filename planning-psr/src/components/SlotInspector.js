// Panneau de créneau — cockpit coordinateur.
// On clique un créneau de la grille ; ce panneau latéral s'ouvre pour piloter
// l'accompagnement AESH DE CE CRÉNEAU : besoin attendu, AESH positionnés +
// type d'accompagnement, ajout (avec conflit/heures restantes), couverture, remarque.
// Étape 1 : reste sur le modèle hebdomadaire (pas encore d'exception datée).
import { html, useState } from '@ui';
import { Icon } from './icons.js';
import { DISCIPLINES, TYPES_ACCOMPAGNEMENT, TYPE_ACCOMP_DEFAUT, creneauById, jourById } from '../data/constants.js';
import { byId, couvertureSeance, bilanAesh, aeshOccupeAt } from '../lib/selectors.js';
import { semaineLabel } from '../lib/week.js';
import { addAffectation, removeAffectation, setAffectationType, setSeanceRemarque, setBesoinAesh } from '../store.js';
import { fmt, toast } from './shared.js';

export function SlotInspector({ state, seance, onClose }) {
  const disc = DISCIPLINES[seance.disc] || DISCIPLINES.autre;
  const cr = creneauById(seance.creneau);
  const classe = byId(state.classes, seance.classe);
  const sem = state.config.semaine;
  const cov = couvertureSeance(state, seance);

  // AESH déjà positionnés sur ce créneau, avec leur type d'accompagnement.
  const affectes = state.affectations
    .filter((a) => a.seance === seance.id)
    .map((a) => ({ aff: a, aesh: byId(state.aesh, a.aesh) }))
    .filter((x) => x.aesh);
  const affectedIds = new Set(affectes.map((x) => x.aesh.id));

  // AESH disponibles à ajouter, triés par heures restantes (les plus disponibles en premier).
  const disponibles = state.aesh
    .filter((a) => !affectedIds.has(a.id))
    .map((a) => {
      const b = bilanAesh(state, a.id);
      const conflit = aeshOccupeAt(state, a.id, seance.jour, seance.creneau, seance.semaine, seance.id);
      return { aesh: a, reste: b.cible - b.total, conflit };
    })
    .sort((x, y) => y.reste - x.reste);

  const [remarque, setRemarque] = useState(seance.remarque || '');
  // On lit la valeur du champ au moment du blur (évite toute valeur périmée).
  const saveRemarque = (e) => { const v = (e.target.value || '').trim(); if ((seance.remarque || '') !== v) setSeanceRemarque(seance.id, v); };

  const covClass = cov.statut === 'covered' ? 'ok' : cov.statut === 'partial' ? 'info' : cov.statut === 'missing' ? 'warn' : '';
  const covLabel = cov.attendu <= 0 ? 'Aucun besoin'
    : cov.statut === 'covered' ? 'Couvert'
    : cov.statut === 'partial' ? `Partiel · ${cov.manquants} manquant${cov.manquants > 1 ? 's' : ''}`
    : 'Non couvert';

  const ajouter = (a) => {
    addAffectation(a.id, seance.id, TYPE_ACCOMP_DEFAUT);
    toast(`AESH ${a.code || a.initiales} positionné`, 'ok', { label: 'Annuler', fn: () => removeAffectation(a.id, seance.id) });
  };
  const retirer = (a) => {
    removeAffectation(a.id, seance.id);
    toast(`AESH ${a.code || a.initiales} retiré`, 'warn', { label: 'Annuler', fn: () => addAffectation(a.id, seance.id) });
  };

  return html`
    <div class="drawer-scrim" onClick=${onClose}></div>
    <aside class="drawer" onClick=${(e) => e.stopPropagation()}>
      <div class="drawer-head">
        <div class="row gap-2" style="align-items:center;min-width:0">
          <span class="drawer-disc" style=${`background:${disc.color}`}></span>
          <div style="min-width:0">
            <h2 style="font-size:16px;margin:0">${disc.label}</h2>
            <div class="muted" style="font-size:12px">
              ${classe ? classe.nom + ' · ' : ''}${jourById(seance.jour)?.label} · ${cr?.debut}–${cr?.fin}${seance.salle ? ' · salle ' + seance.salle : ''}${seance.semaine !== 'AB' ? ' · sem. ' + semaineLabel(sem, seance.semaine) : ''}
            </div>
          </div>
        </div>
        <button class="btn icon ghost" onClick=${onClose}>${Icon.x({ size: 18 })}</button>
      </div>

      <div class="drawer-body">
        <div class="field">
          <label>Besoin en AESH sur ce créneau</label>
          <div class="seg">
            ${[0, 1, 2, 3, 4].map((n) => html`
              <button class=${cov.attendu === n ? 'active both' : ''} onClick=${() => setBesoinAesh(seance.id, n)}>
                ${n === 0 ? 'Aucun' : n}
              </button>`)}
          </div>
          <div class="row gap-2" style="margin-top:8px;align-items:center">
            <span class=${'badge ' + covClass}>${covLabel}</span>
            <span class="muted" style="font-size:12px">${cov.positionnes}/${cov.attendu} positionné(s)</span>
          </div>
        </div>

        <div class="field">
          <label>AESH positionnés · type d'accompagnement</label>
          ${affectes.length ? html`
            <div class="col gap-2">
              ${affectes.map(({ aff, aesh }) => html`
                <div class="slot-aesh">
                  <span class="aesh-pill" style=${`background:${aesh.color}`}>${aesh.code || aesh.initiales}</span>
                  <select class="select slot-type" value=${aff.type || TYPE_ACCOMP_DEFAUT}
                    onChange=${(e) => setAffectationType(aesh.id, seance.id, e.target.value)}>
                    ${Object.entries(TYPES_ACCOMPAGNEMENT).map(([k, v]) => html`
                      <option value=${k} selected=${k === (aff.type || TYPE_ACCOMP_DEFAUT)}>${v.label}</option>`)}
                  </select>
                  <button class="btn icon ghost" title="Retirer ce créneau" onClick=${() => retirer(aesh)}>${Icon.x({ size: 15 })}</button>
                </div>`)}
            </div>` : html`<div class="muted" style="font-size:12.5px">Aucun AESH positionné pour l'instant.</div>`}
        </div>

        <div class="field">
          <label>Ajouter un AESH</label>
          <div class="col gap-2">
            ${disponibles.map(({ aesh, reste, conflit }) => html`
              <button class=${'slot-add' + (conflit.length ? ' has-conflit' : '')} onClick=${() => ajouter(aesh)}>
                <span class="aesh-pill" style=${`background:${aesh.color}`}>${aesh.code || aesh.initiales}</span>
                <span class="slot-add-info">
                  ${conflit.length
                    ? html`<span class="conflit"><span class="ic">${Icon.alert({ size: 13 })}</span> déjà occupé ce créneau</span>`
                    : html`<span class="muted">${fmt(Math.max(0, reste))} h restantes${reste < -0.01 ? ' · dépassé' : ''}</span>`}
                </span>
                <span class="plus">${Icon.plus({ size: 15 })}</span>
              </button>`)}
            ${!disponibles.length ? html`<div class="muted" style="font-size:12.5px">Tous les AESH sont déjà positionnés ici.</div>` : null}
          </div>
        </div>

        <div class="field">
          <label>Remarque (facultatif)</label>
          <textarea class="input" rows="2" placeholder="ex. accompagnement renforcé ce jour, matériel spécifique…"
            value=${remarque} onInput=${(e) => setRemarque(e.target.value)} onBlur=${saveRemarque}></textarea>
        </div>
      </div>
    </aside>`;
}
