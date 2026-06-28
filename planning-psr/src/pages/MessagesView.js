// Page Messages (espace coordination) — réception des messages des AESH (temps réel).
import { html, useState, useEffect } from '@ui';
import { Icon } from '../components/icons.js';
import { subscribeMessages, markRead, deleteMessage, fbAvailable, fbConfigured } from '../lib/firebase.js';

function quand(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const j = String(d.getDate()).padStart(2, '0'), m = String(d.getMonth() + 1).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0'), mi = String(d.getMinutes()).padStart(2, '0');
  return `${j}/${m} ${h}:${mi}`;
}

export function MessagesView() {
  const [msgs, setMsgs] = useState(undefined); // undefined = en attente, null = indispo
  useEffect(() => subscribeMessages((list) => setMsgs(list)), []);

  const dispo = fbAvailable();
  const nonLus = Array.isArray(msgs) ? msgs.filter((m) => !m.lu).length : 0;

  return html`
    <div class="page-header">
      <div class="spread">
        <div>
          <h1 class="page-title">Messages des intervenants</h1>
          <div class="page-desc">Reçus en temps réel depuis l'espace AESH</div>
        </div>
        ${nonLus ? html`<span class="badge danger">${nonLus} non lu(s)</span>` : null}
      </div>
    </div>

    ${!dispo ? html`
      <div class="alert warn">
        <span class="alert-ico">${Icon.alert({ size: 16 })}</span>
        <div><div class="alert-title">Messagerie ${fbConfigured() ? 'indisponible' : 'à configurer'}</div>
        <div class="alert-desc">${fbConfigured()
          ? 'Connexion au service impossible pour le moment.'
          : 'À activer à la mise en ligne : renseigner la config Firebase dans src/lib/firebase.js (projet devoirs-pse, collection coordination_planning_messages).'}</div></div>
      </div>`
    : msgs === undefined ? html`<div class="empty">Chargement…</div>`
    : !msgs || msgs.length === 0 ? html`<div class="empty"><div class="empty-ico">${Icon.inbox({ size: 28 })}</div>Aucun message pour l'instant.</div>`
    : html`<div class="col gap-2">
        ${msgs.map((m) => html`
          <div class=${'card pad-sm ' + (m.lu ? '' : 'msg-unread')} style=${m.lu ? '' : 'border-left:3px solid var(--accent)'}>
            <div class="spread" style="margin-bottom:6px">
              <div class="row gap-2">
                <span class="aesh-pill" style="background:var(--accent)">${m.from || '?'}</span>
                <span class="muted" style="font-size:12px">${quand(m.ts)}</span>
                ${m.lu ? null : html`<span class="badge accent">nouveau</span>`}
              </div>
              <div class="row gap-2">
                ${m.lu ? null : html`<button class="btn sm ghost" onClick=${() => markRead(m.id)}>${Icon.check({ size: 13 })} Lu</button>`}
                <button class="btn sm ghost danger" onClick=${() => deleteMessage(m.id)}>${Icon.trash({ size: 13 })}</button>
              </div>
            </div>
            <div style="font-size:14px;white-space:pre-wrap">${m.text}</div>
          </div>`)}
      </div>`}`;
}
