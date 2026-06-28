// Page Paramètres — la base « modifiable chaque année » :
// AESH & volumes, classes, enseignants, et la sauvegarde (export/import/reset).
import { html, useState } from '@ui';
import { Icon } from '../components/icons.js';
import { Avatar, fmt, toast } from '../components/shared.js';
import { upsertAesh, upsertClasse, resetToSeed, updateSemaine } from '../store.js';
import { bilanAesh } from '../lib/selectors.js';
import { exportJSON, triggerImport } from '../lib/io.js';
import { weekStatus, rangeLabel, semaineLabel, fmtDate } from '../lib/week.js';

function AeshEditor({ state }) {
  return html`
    <div class="card">
      <div class="spread" style="margin-bottom:14px">
        <h2>${Icon.users({size:16})} AESH & volumes horaires</h2>
      </div>
      <div class="muted" style="font-size:12px;margin-bottom:12px">
        Le <b style="color:var(--text-2)">sigle</b> est ce qui s'affiche dans la grille (RGPD) — mettez la lettre ou l'abréviation de votre choix.
      </div>
      <table class="tbl">
        <thead><tr><th>Intervenant</th><th>Sigle</th><th>Volume cible</th><th>Positionné</th><th>Couleur</th></tr></thead>
        <tbody>
          ${state.aesh.map((a) => {
            const b = bilanAesh(state, a.id);
            return html`<tr>
              <td><div class="row"><span class="aesh-pill" style=${`background:${a.color}`}>${a.code || a.initiales}</span> ${a.nom}</div></td>
              <td><input class="input" style="width:70px" value=${a.code || ''} maxlength="4"
                  onInput=${(e) => upsertAesh({ ...a, code: e.target.value })} /></td>
              <td>
                <input class="input" style="width:84px" type="number" step="0.5" value=${a.volumeCible}
                  onChange=${(e) => { upsertAesh({ ...a, volumeCible: parseFloat(e.target.value) || 0 }); toast('Volume mis à jour'); }} />
                <span class="muted"> h</span>
              </td>
              <td><span class=${'badge ' + (Math.abs(b.ecart) < 0.01 ? 'ok' : b.ecart > 0 ? 'danger' : 'warn')}>${fmt(b.total)} h</span></td>
              <td><input type="color" value=${a.color} style="width:34px;height:28px;border:none;background:none;cursor:pointer"
                  onChange=${(e) => upsertAesh({ ...a, color: e.target.value })} /></td>
            </tr>`;
          })}
        </tbody>
      </table>
    </div>`;
}

function ClasseEditor({ state }) {
  return html`
    <div class="card">
      <h2 style="margin-bottom:14px">${Icon.grid({size:16})} Classes</h2>
      <table class="tbl">
        <thead><tr><th>Classe</th><th>Niveau</th><th>Effectif</th><th>Élèves notifiés</th></tr></thead>
        <tbody>
          ${state.classes.map((c) => html`<tr>
            <td><div class="row"><span class="dot" style=${`background:${c.color}`}></span> ${c.nom}</div></td>
            <td class="muted">${c.niveau}</td>
            <td><input class="input" style="width:64px" type="number" value=${c.effectif}
              onChange=${(e) => upsertClasse({ ...c, effectif: parseInt(e.target.value) || 0 })} /> <span class="muted">élèves</span></td>
            <td><input class="input" style="width:64px" type="number" min="0" value=${c.notifies || 0}
              onChange=${(e) => upsertClasse({ ...c, notifies: parseInt(e.target.value) || 0 })} /> <span class="muted">notif.</span></td>
          </tr>`)}
        </tbody>
      </table>
      <div class="muted" style="font-size:12px;margin-top:10px">
        « Notifiés » = élèves avec notification d'accompagnement. Servira au calcul du besoin d'AESH par classe (à venir).
      </div>
    </div>`;
}

function badgeSemaine(state) {
  const sem = state.config.semaine;
  const info = weekStatus(state.config);
  if (info.status === 'ecole') return `Cette semaine : ${semaineLabel(sem, info.parity)} · ${rangeLabel()}`;
  if (info.status === 'vacances') return `En ce moment : Vacances · ${info.nom}`;
  if (info.status === 'avant') return 'Avant la rentrée';
  return 'Année terminée';
}

function CalendrierCard({ state }) {
  const cal = state.config.calendrier || {};
  return html`
    <div class="card">
      <div class="spread" style="margin-bottom:6px">
        <h2>${Icon.calendar({ size: 16 })} Calendrier ${state.annee}</h2>
        <span class="badge">Académie de Lyon · zone A</span>
      </div>
      <div class="muted" style="font-size:12.5px;margin-bottom:14px">
        L'alternance A/B saute automatiquement ces périodes de vacances.
        Rentrée des élèves : <b style="color:var(--text-2)">${fmtDate(cal.rentree)}</b>.
      </div>
      <div class="grid grid-2" style="gap:18px;align-items:start">
        <div>
          <div class="card-eyebrow" style="margin-bottom:8px">Vacances</div>
          <table class="tbl"><tbody>
            ${(cal.vacances || []).map((v) => html`<tr>
              <td style="font-weight:600">${v.nom}</td>
              <td style="text-align:right" class="dim">${fmtDate(v.debut)} → ${fmtDate(v.reprise)}</td>
            </tr>`)}
          </tbody></table>
        </div>
        <div>
          <div class="card-eyebrow" style="margin-bottom:8px">Jours fériés en semaine</div>
          <table class="tbl"><tbody>
            ${(cal.feries || []).map((f) => html`<tr>
              <td style="font-weight:600">${f.nom}</td>
              <td style="text-align:right" class="dim">${fmtDate(f.date)}</td>
            </tr>`)}
          </tbody></table>
        </div>
      </div>
    </div>`;
}

function SemaineEditor({ state }) {
  const sem = state.config.semaine;
  return html`
    <div class="card">
      <div class="spread" style="margin-bottom:6px">
        <h2>${Icon.calendarCheck({ size: 16 })} Semaine A / B</h2>
        <span class="badge accent">${badgeSemaine(state)}</span>
      </div>
      <div class="muted" style="font-size:12.5px;margin-bottom:16px">
        Indiquez un lundi de référence et sa semaine : l'application déduira automatiquement
        si l'on est en A ou B chaque semaine de l'année.
      </div>
      <div class="grid grid-2" style="gap:16px">
        <div class="field">
          <label>Lundi de référence</label>
          <input class="input" type="date" value=${sem.anchorMonday}
            onChange=${(e) => { updateSemaine({ anchorMonday: e.target.value }); toast('Ancrage mis à jour'); }} />
        </div>
        <div class="field">
          <label>Ce lundi-là, on est en</label>
          <div class="seg">
            <button class=${sem.anchorParity === 'A' ? 'active a' : ''} onClick=${() => updateSemaine({ anchorParity: 'A' })}>Semaine ${sem.labelA}</button>
            <button class=${sem.anchorParity === 'B' ? 'active b' : ''} onClick=${() => updateSemaine({ anchorParity: 'B' })}>Semaine ${sem.labelB}</button>
          </div>
        </div>
        <div class="field">
          <label>Nom de la semaine A</label>
          <div class="row gap-2">
            <input class="input grow" value=${sem.labelA} onChange=${(e) => updateSemaine({ labelA: e.target.value || 'A' })} />
            <input type="color" value=${sem.colorA} style="width:38px;height:34px;border:none;background:none;cursor:pointer"
              onChange=${(e) => updateSemaine({ colorA: e.target.value })} />
          </div>
        </div>
        <div class="field">
          <label>Nom de la semaine B</label>
          <div class="row gap-2">
            <input class="input grow" value=${sem.labelB} onChange=${(e) => updateSemaine({ labelB: e.target.value || 'B' })} />
            <input type="color" value=${sem.colorB} style="width:38px;height:34px;border:none;background:none;cursor:pointer"
              onChange=${(e) => updateSemaine({ colorB: e.target.value })} />
          </div>
        </div>
      </div>
    </div>`;
}

export function ParametresView({ state }) {
  const [confirmReset, setConfirmReset] = useState(false);

  return html`
    <div class="page-header">
      <h1 class="page-title">Paramètres & sauvegarde</h1>
      <div class="page-desc">La base de l'année ${state.annee} · ajustez-la, exportez-la, réutilisez-la l'an prochain</div>
    </div>

    <div class="col gap-4">
      <div class="card">
        <h2 style="margin-bottom:6px">${Icon.download({size:16})} Sauvegarde annuelle</h2>
        <div class="muted" style="font-size:12px;margin-bottom:14px">
          Vos données sont enregistrées automatiquement dans ce navigateur. Exportez un fichier pour archiver l'année ou la transférer.
        </div>
        <div class="row gap-2 wrap">
          <button class="btn primary" onClick=${() => { exportJSON(); toast('Sauvegarde exportée'); }}>
            ${Icon.download({size:16})} Exporter (.json)</button>
          <button class="btn" onClick=${() => triggerImport().then(() => toast('Données importées')).catch((e) => toast('Import échoué : ' + e.message, 'warn'))}>
            ${Icon.upload({size:16})} Importer</button>
          ${confirmReset
            ? html`<span class="row gap-2">
                <button class="btn danger" onClick=${() => { resetToSeed(); setConfirmReset(false); toast('Base réinitialisée'); }}>Confirmer la réinitialisation</button>
                <button class="btn ghost" onClick=${() => setConfirmReset(false)}>Annuler</button>
              </span>`
            : html`<button class="btn ghost danger" onClick=${() => setConfirmReset(true)}>${Icon.trash({size:16})} Réinitialiser</button>`}
        </div>
      </div>

      <${SemaineEditor} state=${state} />
      <${CalendrierCard} state=${state} />
      <${AeshEditor} state=${state} />
      <${ClasseEditor} state=${state} />

      <div class="card pad-sm">
        <div class="row gap-2" style="font-size:12px;color:var(--text-3)">
          ${Icon.layers({size:14})} Prochaines couches prévues : gestion des élèves suivis, duplication d'année, ajout/édition des séances directement dans la grille, vue « semaine type » imprimable.
        </div>
      </div>
    </div>`;
}
