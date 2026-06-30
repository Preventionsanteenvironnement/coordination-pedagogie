// Page Consultation — vue lecture seule, pensée pour l'AESH : son emploi du temps
// en Semaine / Mois / Année / Liste, imprimable. Aucune édition possible ici.
import { html, useState } from '@ui';
import { Icon } from '../components/icons.js';
import { ScheduleGrid } from '../components/ScheduleGrid.js';
import { WeekControl } from '../components/WeekControl.js';
import { fmt } from '../components/shared.js';
import { DISCIPLINES, JOURS, creneauById, jourById } from '../data/constants.js';
import { byId, bilanAesh, heuresAeshParite, listeAesh } from '../lib/selectors.js';
import { weeksByMonth, monthName } from '../lib/calendar.js';
import { semaineLabel, semaineColor, fmtDate } from '../lib/week.js';
import { navigate } from '../router.js';

const VUES = [
  { id: 'semaine', label: 'Semaine', ico: Icon.calendar },
  { id: 'mois', label: 'Mois', ico: Icon.grid },
  { id: 'annee', label: 'Année', ico: Icon.layers },
  { id: 'liste', label: 'Liste', ico: Icon.stack },
];

function weekVisual(state, w) {
  const sem = state.config.semaine;
  if (w.status === 'ecole') return { color: semaineColor(sem, w.parity), label: semaineLabel(sem, w.parity), vac: false };
  if (w.status === 'vacances') return { color: '#9aa5b8', label: 'Vac.', vac: true, nom: w.nom };
  return { color: '#c2ccdd', label: '—', vac: true };
}

export function ConsultationView({ state, params }) {
  const aeshId = params.id || (state.aesh[0] && state.aesh[0].id);
  const aesh = byId(state.aesh, aeshId);
  const [vue, setVue] = useState('semaine');
  const mois = weeksByMonth(state.config);
  const [moisIdx, setMoisIdx] = useState(Math.max(0, mois.findIndex((m) => m.weeks.filter((w) => w.status === 'ecole').length >= 2)));
  const { weekMode, weekPriority } = state.config.ui;

  if (!aesh) return html`<div class="empty">Intervenant introuvable.</div>`;
  const b = bilanAesh(state, aeshId);

  return html`
    <div class="consult">
      <div class="page-header no-print">
        <div class="spread wrap gap-4">
          <div>
            <h1 class="page-title">Mon emploi du temps</h1>
            <div class="page-desc">Vue lecture seule · claire, imprimable et mise à jour par la coordination</div>
          </div>
          <button class="btn" onClick=${() => window.print()}>${Icon.download({ size: 15 })} Imprimer</button>
        </div>

        <div class="spread wrap gap-4" style="margin-top:16px">
          <div class="seg">
            ${state.aesh.map((a) => html`
              <button class=${a.id === aeshId ? 'active both' : ''} onClick=${() => navigate(`/consultation/${a.id}`)}>
                <span class="dot" style=${`background:${a.color}`}></span> ${a.code || a.initiales}
              </button>`)}
          </div>
          <div class="seg">
            ${VUES.map((v) => html`
              <button class=${vue === v.id ? 'active both' : ''} onClick=${() => setVue(v.id)}>${v.label}</button>`)}
          </div>
        </div>
      </div>

      <!-- Bandeau imprimable identifiant la personne (par sigle, RGPD) + total -->
      <div class="consult-id card pad-sm">
        <div class="row gap-4">
          <span class="consult-sigle" style=${`background:${aesh.color}`}>${aesh.code || aesh.initiales}</span>
          <div>
            <div style="font-weight:750;font-size:16px">Intervenant ${aesh.code || aesh.initiales}</div>
            <div class="muted" style="font-size:12.5px">Sections PSR & MELEC · ${state.annee}</div>
          </div>
          <div class="grow"></div>
          <div class="center">
            <div class="stat-value" style="font-size:22px">${fmt(b.total)} h</div>
            <div class="muted" style="font-size:11px">service hebdo</div>
          </div>
          <div class="center">
            <div style="font-weight:700">${fmt(heuresAeshParite(state, aeshId, 'A'))} h / ${fmt(heuresAeshParite(state, aeshId, 'B'))} h</div>
            <div class="muted" style="font-size:11px">sem. ${semaineLabel(state.config.semaine, 'A')} / ${semaineLabel(state.config.semaine, 'B')}</div>
          </div>
        </div>
      </div>

      ${vue === 'semaine' ? html`
        <div class="no-print" style="margin:16px 0"><${WeekControl} state=${state} /></div>
        <${ScheduleGrid} state=${state} aeshId=${aeshId} mode=${weekMode} priority=${weekPriority} editable=${false} />
      ` : null}

      ${vue === 'liste' ? html`<${ListeVue} state=${state} aeshId=${aeshId} />` : null}
      ${vue === 'annee' ? html`<${AnneeVue} state=${state} mois=${mois} />` : null}
      ${vue === 'mois' ? html`<${MoisVue} state=${state} aeshId=${aeshId} mois=${mois} idx=${moisIdx} setIdx=${setMoisIdx} />` : null}
    </div>`;
}

function ListeVue({ state, aeshId }) {
  const sem = state.config.semaine;
  const liste = listeAesh(state, aeshId);
  if (!liste.length) return html`<div class="empty">Aucune séance positionnée.</div>`;
  return html`
    <div class="card" style="margin-top:16px">
      <table class="tbl">
        <thead><tr><th>Jour</th><th>Horaire</th><th>Matière</th><th>Salle</th><th>Semaine</th></tr></thead>
        <tbody>
          ${liste.map((s) => {
            const d = DISCIPLINES[s.disc] || DISCIPLINES.autre;
            const cr = creneauById(s.creneau);
            return html`<tr>
              <td style="font-weight:650">${jourById(s.jour)?.label}</td>
              <td class="mono dim">${cr?.debut}–${cr?.fin}</td>
              <td><span class="row gap-2"><span class="dot" style=${`background:${d.color}`}></span> ${d.label}</span></td>
              <td class="dim">${s.salle || '—'}</td>
              <td>${s.semaine === 'AB' ? html`<span class="badge">toutes</span>`
                : html`<span class="badge" style=${`color:${semaineColor(sem, s.semaine)};background:${semaineColor(sem, s.semaine)}22`}>${semaineLabel(sem, s.semaine)}</span>`}</td>
            </tr>`;
          })}
        </tbody>
      </table>
    </div>`;
}

function AnneeVue({ state, mois }) {
  return html`
    <div class="card" style="margin-top:16px">
      <div class="annee-grid">
        ${mois.map((m) => html`
          <div class="annee-mois">
            <div class="annee-mois-lbl">${monthName(m.month)} ${String(m.year).slice(2)}</div>
            <div class="annee-weeks">
              ${m.weeks.map((w) => {
                const v = weekVisual(state, w);
                return html`<span class=${'annee-wk' + (v.vac ? ' vac' : '')}
                  style=${`--wc:${v.color}`} title=${`${fmtDate(w.monday)} — ${v.vac ? (v.nom || 'vacances') : 'Semaine ' + v.label}`}>${v.label}</span>`;
              })}
            </div>
          </div>`)}
      </div>
      <div class="row wrap gap-4" style="margin-top:16px;font-size:12px;color:var(--text-3)">
        <span class="row gap-2"><span class="annee-wk" style=${`--wc:${semaineColor(state.config.semaine,'A')}`}>${semaineLabel(state.config.semaine,'A')}</span> Semaine ${semaineLabel(state.config.semaine,'A')}</span>
        <span class="row gap-2"><span class="annee-wk" style=${`--wc:${semaineColor(state.config.semaine,'B')}`}>${semaineLabel(state.config.semaine,'B')}</span> Semaine ${semaineLabel(state.config.semaine,'B')}</span>
        <span class="row gap-2"><span class="annee-wk vac" style="--wc:#9aa5b8">Vac.</span> Vacances</span>
      </div>
    </div>`;
}

function MoisVue({ state, aeshId, mois, idx, setIdx }) {
  const m = mois[idx];
  if (!m) return html`<div class="empty">—</div>`;
  return html`
    <div class="card" style="margin-top:16px">
      <div class="spread" style="margin-bottom:16px">
        <button class="btn ghost" disabled=${idx <= 0} onClick=${() => setIdx(idx - 1)}>‹ Préc.</button>
        <h2>${monthName(m.month)} ${m.year}</h2>
        <button class="btn ghost" disabled=${idx >= mois.length - 1} onClick=${() => setIdx(idx + 1)}>Suiv. ›</button>
      </div>
      <div class="mois-weeks">
        ${m.weeks.map((w) => {
          const v = weekVisual(state, w);
          const h = w.status === 'ecole' ? heuresAeshParite(state, aeshId, w.parity) : 0;
          return html`<div class=${'mois-wk' + (v.vac ? ' vac' : '')} style=${`--wc:${v.color}`}>
            <div class="mois-wk-head">
              <span class="mois-wk-badge">${v.label}</span>
              <span class="muted" style="font-size:11px">${fmtDate(w.monday)}</span>
            </div>
            <div class="mois-wk-body">
              ${w.status === 'ecole' ? html`<b>${fmt(h)} h</b> <span class="muted">d'accompagnement</span>`
                : html`<span class="muted">${v.nom || 'Vacances'}</span>`}
            </div>
          </div>`;
        })}
      </div>
    </div>`;
}
