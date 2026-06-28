// Page Contact (espace intervenant) — l'AESH envoie un message au coordinateur.
import { html, useState } from '@ui';
import { Icon } from '../components/icons.js';
import { toast } from '../components/shared.js';
import { sendMessage, fbAvailable, fbConfigured } from '../lib/firebase.js';

export function ContactView({ state }) {
  const [from, setFrom] = useState(state.aesh[0] ? (state.aesh[0].code || state.aesh[0].initiales) : '');
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);
  const dispo = fbAvailable();

  const envoyer = () => {
    if (!text.trim()) { toast('Écrivez un message', 'warn'); return; }
    sendMessage({ from, text })
      .then(() => { setSent(true); setText(''); toast('Message envoyé'); })
      .catch((e) => toast(e.message, 'warn'));
  };

  return html`
    <div class="page-header">
      <h1 class="page-title">Message au coordinateur</h1>
      <div class="page-desc">Une question, un imprévu, un besoin ? Écrivez ici.</div>
    </div>

    ${!dispo ? html`
      <div class="alert warn" style="margin-bottom:16px">
        <span class="alert-ico">${Icon.alert({ size: 16 })}</span>
        <div><div class="alert-title">Messagerie ${fbConfigured() ? 'indisponible' : 'à configurer'}</div>
        <div class="alert-desc">${fbConfigured()
          ? 'Connexion au service impossible pour le moment.'
          : 'La connexion Firebase sera activée à la mise en ligne (codes à renseigner).'}</div></div>
      </div>` : null}

    <div class="card" style="max-width:620px">
      <div class="col gap-4">
        <div class="field">
          <label>Votre sigle</label>
          <select class="select" value=${from} onChange=${(e) => setFrom(e.target.value)} style="max-width:200px">
            ${state.aesh.map((a) => html`<option value=${a.code || a.initiales} selected=${(a.code || a.initiales) === from}>${a.code || a.initiales}</option>`)}
          </select>
        </div>
        <div class="field">
          <label>Votre message</label>
          <textarea class="input" rows="5" placeholder="Bonjour, …" value=${text}
            onInput=${(e) => setText(e.target.value)} style="resize:vertical;font-family:inherit"></textarea>
        </div>
        <div class="row" style="justify-content:flex-end">
          <button class="btn primary" disabled=${!dispo} onClick=${envoyer}>${Icon.send({ size: 15 })} Envoyer</button>
        </div>
        ${sent ? html`<div class="badge ok">${Icon.check({ size: 13 })} Message transmis au coordinateur</div>` : null}
      </div>
    </div>`;
}
