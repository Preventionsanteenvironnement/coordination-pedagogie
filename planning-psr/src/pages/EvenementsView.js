// Page Périodes & événements — frise annuelle (PFMP en barres) + événements datés.
// Vue d'ensemble de l'année par classe, avec ajout/édition.
import { html, useState } from '@ui';
import { Icon } from '../components/icons.js';
import { EvenementModal } from '../components/EvenementModal.js';
import { fmt, toast } from '../components/shared.js';
import { EVENT_TYPES, FILIERES } from '../data/constants.js';
import { byId } from '../lib/selectors.js';
import { parseISO, fmtDate } from '../lib/week.js';
import { monthName } from '../lib/calendar.js';
import { pickICS, icsToEvenements } from '../lib/ics.js';
import { addEvenementsBulk } from '../store.js';

export function EvenementsView({ state }) {
  const [draft, setDraft] = useState(null);
  const cal = state.config.calendrier || {};
  const start = parseISO(cal.prerentree || '2026-08-31');
  const end = parseISO(cal.finAnnee || '2027-07-03');
  const span = (end - start) || 1;
  const pct = (d) => Math.max(0, Math.min(100, ((parseISO(d) - start) / span) * 100));

  // Mois pour les repères.
  const mois = [];
  { const d = new Date(start.getFullYear(), start.getMonth(), 1);
    while (d <= end) { mois.push(new Date(d)); d.setMonth(d.getMonth() + 1); } }

  const vacances = cal.vacances || [];
  const evens = state.evenements || [];
  const ranges = evens.filter((e) => EVENT_TYPES[e.type]?.range);
  const points = evens.filter((e) => !EVENT_TYPES[e.type]?.range)
    .sort((a, b) => a.debut.localeCompare(b.debut));

  const bands = (faint) => vacances.map((v) => html`
    <div class=${'tl-vac' + (faint ? ' faint' : '')}
      style=${`left:${pct(v.debut)}%;width:${pct(v.reprise) - pct(v.debut)}%`}
      title=${`Vacances ${v.nom}`}></div>`);

  const filieres = [...new Set(state.classes.map((c) => c.filiere || 'Autres'))];

  return html`
    <div class="page-header">
      <div class="spread wrap gap-4">
        <div>
          <h1 class="page-title">Périodes & événements</h1>
          <div class="page-desc">PFMP, CCF, conseils… sur l'année ${state.annee} · dates prévisionnelles, à ajuster</div>
        </div>
        <div class="row gap-2">
          <button class="btn" onClick=${() => pickICS()
            .then((txt) => { const evs = icsToEvenements(txt); const n = addEvenementsBulk(evs); toast(n ? `${n} événement(s) importé(s)` : 'Rien de nouveau à importer'); })
            .catch((e) => toast('Import échoué : ' + e.message, 'warn'))}>
            ${Icon.upload({ size: 15 })} Importer .ics</button>
          <button class="btn primary" onClick=${() => setDraft({})}>${Icon.plus({ size: 15 })} Ajouter</button>
        </div>
      </div>
    </div>

    <!-- FRISE -->
    <div class="card" style="overflow:hidden">
      <div class="tl">
        <div class="tl-row tl-monthrow">
          <div class="tl-label"></div>
          <div class="tl-track">
            ${bands(false)}
            ${mois.map((m) => html`<span class="tl-month" style=${`left:${pct(new Date(m.getFullYear(), m.getMonth(), 1))}%`}>${monthName(m.getMonth()).slice(0, 4)}.</span>`)}
          </div>
        </div>

        ${filieres.map((f) => html`
          <div class="tl-filiere">${FILIERES[f]?.label || f}</div>
          ${state.classes.filter((c) => (c.filiere || 'Autres') === f).map((c) => html`
            <div class="tl-row">
              <div class="tl-label"><span class="dot" style=${`background:${c.color}`}></span> ${c.nom}</div>
              <div class="tl-track">
                ${bands(true)}
                ${ranges.filter((e) => e.classe === c.id).map((e) => {
                  const t = EVENT_TYPES[e.type];
                  return html`<div class="tl-bar" style=${`left:${pct(e.debut)}%;width:${Math.max(1.2, pct(e.fin) - pct(e.debut))}%;background:${t.color}`}
                    title=${`${e.titre || t.court} · ${fmtDate(e.debut)} → ${fmtDate(e.fin)}`}
                    onClick=${() => setDraft(e)}>${e.titre || t.court}</div>`;
                })}
                ${points.filter((e) => e.classe === c.id).map((e) => {
                  const t = EVENT_TYPES[e.type];
                  return html`<span class="tl-pt" style=${`left:${pct(e.debut)}%;background:${t.color}`}
                    title=${`${e.titre || t.court} · ${fmtDate(e.debut)}`} onClick=${() => setDraft(e)}></span>`;
                })}
              </div>
            </div>`)}
        `)}
      </div>

      <div class="row wrap gap-4" style="margin-top:16px;font-size:12px;color:var(--text-3)">
        ${Object.entries(EVENT_TYPES).map(([k, v]) => html`<span class="row gap-2"><span class="dot" style=${`background:${v.color}`}></span> ${v.court}</span>`)}
        <span class="row gap-2"><span class="tl-vac-key"></span> Vacances</span>
      </div>
    </div>

    <!-- LISTE DES ÉVÉNEMENTS DATÉS -->
    <div class="card" style="margin-top:20px">
      <h2 style="margin-bottom:14px">${Icon.calendar({ size: 16 })} Événements ponctuels</h2>
      ${points.length === 0
        ? html`<div class="empty">Aucun événement daté. Cliquez « Ajouter ».</div>`
        : html`<table class="tbl">
            <thead><tr><th>Date</th><th>Type</th><th>Classe</th><th>Intitulé</th><th></th></tr></thead>
            <tbody>
              ${points.map((e) => {
                const t = EVENT_TYPES[e.type]; const c = byId(state.classes, e.classe);
                return html`<tr style="cursor:pointer" onClick=${() => setDraft(e)}>
                  <td class="mono dim">${fmtDate(e.debut)}</td>
                  <td><span class="badge" style=${`color:${t.color};background:${t.color}1f`}>${t.court}</span></td>
                  <td>${c ? c.nom : e.classe}</td>
                  <td>${e.titre || '—'} ${e.previsionnel ? html`<span class="badge" style="margin-left:6px">prévis.</span>` : null}</td>
                  <td style="text-align:right">${Icon.edit({ size: 14 })}</td>
                </tr>`;
              })}
            </tbody>
          </table>`}
    </div>

    <div class="row gap-2" style="margin-top:14px;font-size:12px;color:var(--text-3)">
      ${Icon.sparkle({ size: 14 })} Dates prévisionnelles reprojetées depuis 2025-2026. À confirmer avec l'export Pronote 2026-2027 (importateur .ics à venir).
    </div>

    ${draft ? html`<${EvenementModal} state=${state} draft=${draft} onClose=${() => setDraft(null)} />` : null}`;
}
