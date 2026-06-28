// Page Tableau de bord — vue d'ensemble : KPI, alertes, état des AESH et classes.
import { html } from '@ui';
import { Icon } from '../components/icons.js';
import { Avatar, HourMeter, fmt } from '../components/shared.js';
import { totauxGeneraux, bilanAesh, heuresClasse } from '../lib/selectors.js';
import { alertsSummary } from '../lib/alerts.js';
import { navigate } from '../router.js';

function Stat({ icon, value, label, foot, tone }) {
  return html`
    <div class="card stat">
      <div class="row" style="justify-content:space-between">
        <div class="stat-ico" style=${tone ? `background:${tone}22;color:${tone}` : ''}>${icon}</div>
      </div>
      <div class="stat-value">${value}</div>
      <div class="stat-label">${label}</div>
      ${foot ? html`<div class="stat-foot">${foot}</div>` : null}
    </div>`;
}

export function Dashboard({ state }) {
  const t = totauxGeneraux(state);
  const alerts = alertsSummary(state);
  const tauxCouverture = t.totalCible > 0 ? Math.round((t.totalServiceH / t.totalCible) * 100) : 0;

  return html`
    <div class="page-header">
      <h1 class="page-title">Tableau de bord</h1>
      <div class="page-desc">Coordination CAP PSR · année ${state.annee} · vue d'ensemble en temps réel</div>
    </div>

    <div class="grid grid-4" style="margin-bottom:24px">
      <${Stat} icon=${Icon.users({size:20})} value=${state.aesh.length} label="AESH coordonnés"
        foot=${`${state.enseignants.length} enseignants · ${state.classes.length} classes`} tone="#7c8cff" />
      <${Stat} icon=${Icon.clock({size:20})} value=${fmt(t.totalServiceH) + ' h'} label="Service hebdo positionné"
        foot=${`dont ${fmt(t.totalAffecteH)} h en classe · ${fmt(t.totalHorsH)} h hors-classe`} tone="#3ecf8e" />
      <${Stat} icon=${Icon.check({size:20})} value=${tauxCouverture + ' %'} label="Couverture du volume cible"
        foot=${`${fmt(t.totalServiceH)} / ${fmt(t.totalCible)} h contractuelles`} tone="#4cc3f5" />
      <${Stat} icon=${Icon.alert({size:20})} value=${alerts.total} label="Alertes à traiter"
        foot=${`${alerts.danger} bloquantes · ${alerts.warn} à surveiller`}
        tone=${alerts.danger ? '#f76d6d' : alerts.warn ? '#f5b14c' : '#3ecf8e'} />
    </div>

    <div class="grid" style="grid-template-columns:1.3fr 1fr;align-items:start">
      <!-- Colonne gauche : alertes -->
      <div class="card">
        <div class="spread" style="margin-bottom:16px">
          <h2>${Icon.alert({size:16})} Alertes de coordination</h2>
          <span class="badge ${alerts.danger ? 'danger' : alerts.warn ? 'warn' : 'ok'}">${alerts.total}</span>
        </div>
        ${alerts.all.length === 0
          ? html`<div class="empty"><div class="empty-ico">✓</div>Aucune incohérence détectée.</div>`
          : html`<div class="col gap-2">
              ${alerts.all.slice(0, 8).map((al) => html`
                <div class=${'alert ' + al.sev}>
                  <span class="alert-ico">${Icon.alert({size:16})}</span>
                  <div class="grow">
                    <div class="alert-title">${al.title}</div>
                    <div class="alert-desc">${al.desc}</div>
                  </div>
                  <span class="badge">${al.cat}</span>
                </div>`)}
              ${alerts.all.length > 8 ? html`<div class="muted center" style="font-size:12px;padding-top:6px">+ ${alerts.all.length - 8} autres…</div>` : null}
            </div>`}
      </div>

      <!-- Colonne droite : AESH + classes -->
      <div class="col gap-4">
        <div class="card">
          <h2 style="margin-bottom:14px">${Icon.users({size:16})} Charge des AESH</h2>
          <div class="col gap-4">
            ${state.aesh.map((a) => {
              const b = bilanAesh(state, a.id);
              return html`
                <div class="row" style="cursor:pointer" onClick=${() => navigate(`/aesh/${a.id}`)}>
                  <${Avatar} initiales=${a.initiales} color=${a.color} size=${30} />
                  <div class="grow">
                    <${HourMeter} value=${b.total} target=${b.cible} label=${a.nom} />
                  </div>
                </div>`;
            })}
          </div>
        </div>

        <div class="card">
          <h2 style="margin-bottom:14px">${Icon.grid({size:16})} Classes</h2>
          <div class="col gap-2">
            ${state.classes.map((c) => html`
              <div class="row spread" style="cursor:pointer;padding:6px 0" onClick=${() => navigate(`/classe/${c.id}`)}>
                <div class="row">
                  <span class="dot" style=${`background:${c.color}`}></span>
                  <div>
                    <div style="font-weight:650">${c.nom}</div>
                    <div class="muted" style="font-size:11px">${c.niveau} · ${c.effectif} élèves</div>
                  </div>
                </div>
                <span class="badge accent">${fmt(heuresClasse(state, c.id))} h AESH</span>
              </div>`)}
          </div>
        </div>
      </div>
    </div>`;
}
