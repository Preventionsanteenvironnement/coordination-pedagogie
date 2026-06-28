// Petits composants réutilisables : jauge d'heures, avatar, puce AESH, toasts.
import { html } from '@ui';

export function Avatar({ initiales, color, size = 22 }) {
  return html`<span class="chip-avatar" style=${`background:${color};width:${size}px;height:${size}px;font-size:${size*0.42}px`}>${initiales}</span>`;
}

// Jauge : réalisé / cible, couleur selon l'écart.
export function HourMeter({ value, target, label, sub }) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  let cls = 'ok';
  if (target > 0) {
    if (value > target + 0.01) cls = 'danger';
    else if (value < target - 0.01) cls = 'warn';
  }
  return html`
    <div class="meter">
      <div class="meter-head">
        <span class="dim">${label}</span>
        <span class="meter-val">${fmt(value)} ${target ? html`<span class="muted">/ ${fmt(target)} h</span>` : 'h'}</span>
      </div>
      <div class="meter-bar"><div class=${'meter-fill ' + cls} style=${`width:${pct}%`}></div></div>
      ${sub ? html`<div class="muted" style="font-size:11px">${sub}</div>` : null}
    </div>`;
}

export function fmt(n) {
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1).replace('.', ',');
}

// — Système de toasts global —
let toastHandler = null;
export function registerToast(fn) { toastHandler = fn; }
export function toast(msg, kind = 'ok') { if (toastHandler) toastHandler(msg, kind); }
