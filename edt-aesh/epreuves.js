/* ═══════════════════════════════════════════════════════════════════
   Espace EDT AESH — onglet « Épreuves »
   Calendrier des épreuves (tests de positionnement, bac blanc…) mis en ligne
   par la coordination depuis l'Atelier (RESANA importé). Le référent AESH
   (et le coordinateur) place les AESH ; chacun voit où il est attendu et,
   pour chaque épreuve, les cours en parallèle qui perdent un AESH.
   Données : collection coordination_epreuves_aesh
     campagne_<id>   écrit par l'Atelier (épreuves, équipes par initiales, cours en parallèle)
     placement_<campagne>_<épreuve>   écrit ici (identifiants d'AESH seulement)
   Aucun prénom ni nom en ligne : initiales et couleur de l'équipe.
   ═══════════════════════════════════════════════════════════════════ */
const COL = 'coordination_epreuves_aesh';
const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
const z2 = n => String(n).padStart(2, '0');
const isoLocal = d => d.getFullYear() + '-' + z2(d.getMonth() + 1) + '-' + z2(d.getDate());
const lundiDe = s => { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return isoLocal(d); };
const jourIdx = s => (new Date(s + 'T12:00:00').getDay() + 6) % 7;
const min = h => { const [a, b] = String(h).split(':').map(Number); return a * 60 + b; };
const hFr = h => /^\d{2}:\d{2}$/.test(h || '') ? parseInt(h, 10) + 'h' + (h.slice(3) === '00' ? '' : h.slice(3)) : '';
const dFr = s => /^\d{4}-\d{2}-\d{2}$/.test(s || '') ? s.slice(8, 10) + '/' + s.slice(5, 7) : '';
const couleurOk = c => /^#[0-9a-f]{6}$/i.test(c || '') ? c : '#64748b';
const RECENT = 7 * 864e5;

const CSS = `
#appli.sans-semaine .nav-sem,#appli.sans-semaine .jours,#appli.sans-semaine #sem-repere{display:none!important}
.ep{padding-bottom:10px}
.ep-carte{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:12px 14px;box-shadow:var(--shadow-s);margin-bottom:12px}
.ep-titre{font-weight:800;font-size:1.02rem;letter-spacing:-.01em}
.ep-sous{color:var(--muted);font-size:.8rem;font-weight:600;margin-top:2px}
.ep-seg{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin-top:10px}
.ep-seg::-webkit-scrollbar{display:none}
.ep-seg button{flex:none;padding:7px 13px;border-radius:999px;border:1.5px solid var(--line);background:var(--card);font-size:.82rem;font-weight:700}
.ep-seg button.on{background:var(--accent);border-color:var(--accent);color:#fff}
.ep-legende{display:flex;flex-wrap:wrap;gap:6px 12px;margin-top:10px;font-size:.74rem;color:var(--ink-2);font-weight:600}
.ep-legende i{display:inline-block;width:11px;height:11px;border-radius:4px;margin-right:5px;vertical-align:-1px}
.ep-attente{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;align-items:center;font-size:.78rem;color:var(--muted);font-weight:600}
.ep-chip{padding:3px 9px;border-radius:999px;font-weight:700;font-size:.76rem}
.st-manque{background:#fde8ea;color:#9f1239;border-color:#f5b8c1}
.st-complet{background:#dcf5e6;color:#166534;border-color:#a7dcbc}
.st-inconnu{background:#fdf0d2;color:#8a5300;border-color:#ecc97d}
.st-retiree{background:repeating-linear-gradient(135deg,#eef1f4,#eef1f4 6px,#e2e7ec 6px,#e2e7ec 12px);color:#55606e;border-color:#d4dae1;text-decoration:line-through}
.st-neutre{background:var(--line-2);color:var(--ink-2);border-color:var(--line)}
@media (prefers-color-scheme:dark){
  .st-manque{background:#3b1219;color:#fda4af;border-color:#6b1f2c}
  .st-complet{background:#0f2e1d;color:#86efac;border-color:#1f5a38}
  .st-inconnu{background:#35270b;color:#fcd34d;border-color:#6b4f12}
  .st-retiree{background:repeating-linear-gradient(135deg,#1b242f,#1b242f 6px,#232e3b 6px,#232e3b 12px);color:#94a3b8;border-color:#334155}
}
.ep-grille{display:grid;grid-template-columns:40px repeat(5,minmax(0,1fr));border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--card)}
.ep-h{font-size:.72rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.03em;padding:7px 2px;text-align:center;border-bottom:1px solid var(--line)}
.ep-col{position:relative;border-left:1px solid var(--line-2)}
.ep-hr{position:absolute;left:0;right:0;border-top:1px dashed var(--line-2)}
.ep-t{position:relative}.ep-t span{position:absolute;right:4px;transform:translateY(-7px);font-size:.68rem;color:var(--muted);font-weight:600}
.ep-ev{position:absolute;left:3px;right:3px;border-radius:9px;padding:4px 6px;font-size:.74rem;line-height:1.25;text-align:left;overflow:hidden;border:1px solid transparent}
.ep-ev b{font-weight:800}
.ep-ev.sel{outline:2.5px solid var(--ink);outline-offset:1px}
.ep-ev.moi,.ep-jc.moi{box-shadow:0 0 0 2.5px var(--accent)}
.ep-ev.passee,.ep-jc.passee{opacity:.6}
.ep-badge{display:inline-block;font-size:.6rem;font-weight:800;text-transform:uppercase;letter-spacing:.04em;padding:0 5px;border-radius:5px;background:var(--ink);color:var(--card);margin-left:4px;text-decoration:none;vertical-align:1px}
.ep-jour{margin:14px 0 6px;font-size:.74rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)}
.ep-jc{display:block;width:100%;text-align:left;border-radius:14px;padding:10px 12px;border:1.5px solid transparent;margin-bottom:8px;font-size:.9rem}
.ep-jc b{font-weight:800}
.ep-panneau{background:var(--card);border:1.5px solid var(--line);border-radius:16px;padding:13px 14px;margin:10px 0 12px;box-shadow:var(--shadow-m)}
.ep-places{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
.ep-siege{width:40px;height:40px;border-radius:50%;border:2px dashed var(--line);display:grid;place-items:center;color:var(--muted);font-weight:800;font-size:.85rem}
.ep-pa{display:inline-grid;place-items:center;min-width:40px;height:40px;padding:0 4px;border-radius:50%;color:#fff;font-weight:800;font-size:.85rem}
.ep-pa.sm{min-width:24px;height:24px;font-size:.62rem;padding:0 3px}
.ep-bilan{margin-top:10px;font-weight:800}
.ep-bilan.manque{color:#be123c}.ep-bilan.ok{color:#15803d}
@media (prefers-color-scheme:dark){.ep-bilan.manque{color:#fda4af}.ep-bilan.ok{color:#86efac}}
.ep-equipe{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:7px;margin-top:10px}
.ep-aesh{display:flex;align-items:center;gap:8px;border:1.5px solid var(--line);border-radius:12px;padding:7px 9px;background:var(--card);text-align:left;font-weight:700;font-size:.86rem;min-height:44px}
.ep-aesh.on{border-color:var(--accent);background:var(--accent-l)}
.ep-aesh:disabled{opacity:.45}
.ep-aesh small{display:block;font-weight:600;color:var(--muted);font-size:.7rem}
.ep-sect{margin-top:14px;font-size:.74rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)}
.ep-par{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px;margin-top:7px}
.ep-cc{border-radius:12px;padding:9px 11px;border:1px solid transparent;font-size:.84rem}
.ep-cc b{font-weight:800}
.ep-rang{display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin-top:6px}
.ep-rang>span:first-child{font-size:.72rem;font-weight:700;opacity:.85;min-width:58px}
.ep-puce{display:inline-flex;align-items:center;gap:4px;font-weight:700}
.ep-puce i{font-style:italic;font-weight:600;opacity:.8;font-size:.72rem}
.ep-ail{display:flex;gap:8px;align-items:center;margin-top:7px;font-size:.84rem}
.ep-note{color:var(--muted);font-size:.74rem;margin-top:8px;line-height:1.45}
.ep-moi{background:var(--accent-l);border:1.5px solid var(--accent-b);border-radius:14px;padding:10px 12px;margin-bottom:12px;font-size:.88rem}
.ep-ens{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:8px}
.ep-ens-pole{grid-column:1/-1;font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-top:4px}
.ep-ens-cl{grid-column:1/-1;font-weight:800;font-size:.92rem;margin-top:2px}
.ep-ens-cell{display:flex;flex-direction:column;gap:6px;min-width:0}
.ep-ens-m{font-size:.7rem;font-weight:700;color:var(--muted)}
.ep-ens-b{display:block;width:100%;text-align:left;border-radius:12px;padding:8px 10px;border:1.5px solid transparent;font-size:.8rem;line-height:1.3}
.ep-ens-b b{font-weight:800}.ep-ens-b.passee{opacity:.6}
.ep-av{border:2px dashed #ecc97d;color:#8a5300;border-radius:12px;padding:8px 10px;font-size:.8rem;font-weight:800;line-height:1.3}
.ep-av span{font-weight:600}
@media (prefers-color-scheme:dark){.ep-av{border-color:#6b4f12;color:#fcd34d}}
.ep-cours{position:absolute;left:3px;right:3px;border-radius:7px;background:var(--line-2);border:1px solid var(--line);color:var(--muted);font-size:.64rem;line-height:1.2;padding:2px 4px;overflow:hidden}
.ep-ev{z-index:1}
.ep-cl{font-size:.74rem;color:var(--muted);margin:-2px 0 8px;line-height:1.45}
`;

export function creerEpreuves(ctx) {
  const { db, fs, moi, estCoordinateur, estReferentPsr, esc, dis } = ctx;
  let campagnes = [], placements = new Map(), abonne = false, etat = 'connexion', erreur = '';
  let campId = null, pole = null, semaine = null, sel = null, host = null;

  if (!document.getElementById('ep-styles')) {
    const st = document.createElement('style'); st.id = 'ep-styles'; st.textContent = CSS; document.head.appendChild(st);
  }
  function abonner() {
    if (abonne) return; abonne = true;
    fs.onSnapshot(fs.collection(db, COL), snap => {
      const c = [], p = new Map();
      snap.docs.forEach(d => {
        const x = d.data() || {};
        if (x.type === 'campagne' && Array.isArray(x.epreuves)) c.push(x);
        else if (x.type === 'placement' && typeof x.campagne === 'string' && typeof x.epreuve === 'string') p.set(x.campagne + '|' + x.epreuve, x);
      });
      campagnes = c.sort((a, b) => String(b.majLe || '').localeCompare(String(a.majLe || '')));
      placements = p; etat = 'ok'; erreur = '';
      dessiner();
    }, e => { etat = 'erreur'; erreur = String((e && (e.code || e.message)) || e); dessiner(); });
  }
  const peutPlacer = () => estCoordinateur() || estReferentPsr();
  const section = () => String((moi() && moi().section) || '').toUpperCase();
  const polesVisibles = () => (peutPlacer() || !['PSR', 'MELEC'].includes(section())) ? ['PSR', 'MELEC'] : [section()];
  const camp = () => campagnes.find(c => c.campagne === campId) || null;
  const placesDe = id => { const p = placements.get(campId + '|' + id); return p && Array.isArray(p.aesh) ? p.aesh : []; };
  const membre = (c, id) => { for (const k of Object.keys(c.equipes || {})) { const m = (c.equipes[k] || []).find(x => x.id === id); if (m) return m; } return null; };
  const pastille = (c, id, petit) => { const m = membre(c, id); return `<span class="ep-pa${petit ? ' sm' : ''}" style="background:${couleurOk(m && m.couleur)}">${esc(m ? m.ini : '?')}</span>`; };
  const etatDe = (e, pl) => e.retireeLe ? 'retiree' : e.demandes == null ? 'inconnu' : pl.length >= e.demandes ? 'complet' : 'manque';
  const badge = (c, e) => e.retireeLe ? '<span class="ep-badge">retirée</span>'
    : (e.modifieLe && Date.now() - Date.parse(e.modifieLe) < RECENT) ? '<span class="ep-badge">modifiée</span>'
    : (e.ajouteLe && c.premiereMiseEnLigne && e.ajouteLe > c.premiereMiseEnLigne && Date.now() - Date.parse(e.ajouteLe) < RECENT) ? '<span class="ep-badge">nouvelle</span>' : '';
  function conflit(c, e, id) {
    return c.epreuves.find(x => x.id !== e.id && !x.retireeLe && x.date === e.date && min(x.debut) < min(e.fin) && min(e.debut) < min(x.fin) && placesDe(x.id).includes(id)) || null;
  }

  function dessiner() {
    if (!host) return;
    if (etat === 'erreur') { host.innerHTML = `<div class="vide-j"><span class="em">🧪</span>${/permission/i.test(erreur) ? 'L’espace des épreuves n’est pas encore ouvert.' : 'Connexion impossible pour le moment.'}</div>`; return; }
    if (etat !== 'ok') { host.innerHTML = '<div class="vide-j"><span class="em">🧪</span>Chargement des épreuves…</div>'; return; }
    if (!campagnes.length) { host.innerHTML = '<div class="vide-j"><span class="em">🧪</span>Aucune épreuve publiée pour l’instant.</div>'; return; }
    if (!camp()) campId = campagnes[0].campagne;
    const c = camp(), pv = polesVisibles();
    if (!pole || !pv.includes(pole)) pole = pv.includes(section()) ? section() : pv[0];
    const auj = isoLocal(new Date()), lun = lundiDe(auj), moiId = moi() && moi().id;
    const liste = c.epreuves.filter(e => e.pole === pole && (!e.retireeLe || placesDe(e.id).length));
    const sems = [...new Set([...(c.semaines || []), ...liste.map(e => lundiDe(e.date))])].sort();
    if (!semaine || !sems.includes(semaine)) semaine = sems.includes(lun) ? lun : (sems.find(s => s >= lun) || sems[sems.length - 1] || null);
    const maj = c.majLe ? new Date(c.majLe) : null;
    let h = `<div class="ep"><div class="ep-carte">
      <div class="ep-titre">${esc(c.label || 'Épreuves')}</div>
      <div class="ep-sous">${maj ? 'Mis à jour le ' + z2(maj.getDate()) + '/' + z2(maj.getMonth() + 1) + ' à ' + z2(maj.getHours()) + 'h' + z2(maj.getMinutes()) : ''}${peutPlacer() ? ' · vous placez les AESH' : ''}</div>
      ${campagnes.length > 1 ? `<div class="ep-seg">${campagnes.map(x => `<button data-ep="camp" data-v="${esc(x.campagne)}" class="${x.campagne === campId ? 'on' : ''}">${esc(x.label)}</button>`).join('')}</div>` : ''}
      ${pv.length > 1 ? `<div class="ep-seg">${pv.map(p => `<button data-ep="pole" data-v="${p}" class="${p === pole ? 'on' : ''}">Pôle ${p}</button>`).join('')}</div>` : ''}
      <div class="ep-legende"><span><i class="st-manque"></i>il manque des AESH</span><span><i class="st-complet"></i>couverte</span><span><i class="st-inconnu"></i>nombre non précisé</span><span><i class="st-retiree"></i>retirée</span></div>
      ${(c.attente || []).some(a => a.pole === pole) ? `<div class="ep-attente">En attente sur RESANA : ${(c.attente || []).filter(a => a.pole === pole).map(a => `<span class="ep-chip st-inconnu">${esc(a.classeLabel)} · ${esc(a.matiere)}</span>`).join('')}</div>` : ''}
    </div>`;
    if (!peutPlacer() && moiId) {
      const miennes = c.epreuves.filter(e => !e.retireeLe && e.date >= auj && placesDe(e.id).includes(moiId));
      if (miennes.length) h += `<div class="ep-moi"><b>Vous êtes placé(e) sur :</b><br>${miennes.map(e => `${esc(JOURS[jourIdx(e.date)])} ${esc(dFr(e.date))} · ${esc(hFr(e.debut))}–${esc(hFr(e.fin))} · ${esc(e.classeLabel)} ${esc(e.matiere)}${e.salle ? ' · ' + esc(e.salle) : ''}`).join('<br>')}</div>`;
    }
    h += ensemble(c, pv, auj);
    if (!semaine) { host.innerHTML = h + `<div class="vide-j"><span class="em">🗓️</span>Aucune épreuve pour le pôle ${esc(pole)}.</div></div>`; lier(); return; }
    h += `<div class="ep-seg" style="margin:0 0 10px">${sems.map(s => `<button data-ep="sem" data-v="${s}" class="${s === semaine ? 'on' : ''}">Semaine du ${esc(dFr(s))}</button>`).join('')}</div>`;
    const sem = liste.filter(e => lundiDe(e.date) === semaine);
    if (sel && !sem.some(e => e.id === sel)) sel = null;
    const large = window.matchMedia('(min-width: 720px)').matches;
    const texteBloc = e => { const pl = placesDe(e.id); return `<b>${esc(e.classeLabel)}</b> ${esc(e.matiere)}${badge(c, e)}<br>${esc(hFr(e.debut))}–${esc(hFr(e.fin))} · ${e.demandes == null ? pl.length + ' AESH' : pl.length + ' / ' + e.demandes + ' AESH'}`; };
    const classes = e => { const pl = placesDe(e.id); return `st-${etatDe(e, pl)}${e.date < auj ? ' passee' : ''}${sel === e.id ? ' sel' : ''}${moiId && pl.includes(moiId) ? ' moi' : ''}`; };
    const edt = c.emploisDuTemps || {};
    const coursSem = (c.classesTest || []).filter(x => x.pole === pole).flatMap(x => edt[x.classe] || []).filter(k => lundiDe(k.date) === semaine);
    if (!sem.length) h += '<div class="ep-note" style="margin:0 0 8px">Aucune épreuve datée cette semaine. En gris : les cours habituels de la classe.</div>';
    if (large) {
      const h0 = Math.max(7, Math.min(8, ...sem.map(e => Math.floor(min(e.debut) / 60)), ...coursSem.map(k => Math.floor(min(k.debut) / 60))));
      const h1 = Math.min(19, Math.max(13, ...sem.map(e => Math.ceil(min(e.fin) / 60)), ...coursSem.map(k => Math.ceil(min(k.fin) / 60))));
      const PX = 46, H = (h1 - h0) * PX;
      let g = '<div class="ep-h"></div>' + JOURS.map((j, i) => { const d = new Date(semaine + 'T12:00:00'); d.setDate(d.getDate() + i); return `<div class="ep-h">${j} ${d.getDate()}</div>`; }).join('');
      g += `<div class="ep-t" style="height:${H}px">${Array.from({ length: h1 - h0 + 1 }, (_, k) => `<span style="top:${k * PX}px">${h0 + k}h</span>`).join('')}</div>`;
      for (let i = 0; i < 5; i++) {
        g += `<div class="ep-col" style="height:${H}px">${Array.from({ length: h1 - h0 - 1 }, (_, k) => `<div class="ep-hr" style="top:${(k + 1) * PX}px"></div>`).join('')}`;
        coursSem.filter(k => jourIdx(k.date) === i).forEach(k => {
          const top = (min(k.debut) / 60 - h0) * PX, ht = Math.max(16, (min(k.fin) - min(k.debut)) / 60 * PX - 2);
          g += `<div class="ep-cours" style="top:${top}px;height:${ht}px">${esc(k.matiere)}<br>${esc(hFr(k.debut))}–${esc(hFr(k.fin))}</div>`;
        });
        sem.filter(e => jourIdx(e.date) === i).forEach(e => {
          const top = (min(e.debut) / 60 - h0) * PX, ht = Math.max(30, (min(e.fin) - min(e.debut)) / 60 * PX - 3);
          g += `<button class="ep-ev ${classes(e)}" data-ep="sel" data-v="${esc(e.id)}" style="top:${top}px;height:${ht}px" aria-pressed="${sel === e.id}">${texteBloc(e)}</button>`;
        });
        g += '</div>';
      }
      h += `<div class="ep-grille">${g}</div>`;
      const ep = sem.find(e => e.id === sel);
      h += ep ? panneau(c, ep) : '<div class="ep-note">Touchez une épreuve pour voir les AESH et les cours en parallèle.</div>';
    } else {
      for (let i = 0; i < 5; i++) {
        const dj = sem.filter(e => jourIdx(e.date) === i).sort((a, b) => a.debut.localeCompare(b.debut));
        const dc = coursSem.filter(k => jourIdx(k.date) === i);
        if (!dj.length && !dc.length) continue;
        const d = new Date(semaine + 'T12:00:00'); d.setDate(d.getDate() + i);
        h += `<div class="ep-jour">${JOURS[i]} ${d.getDate()}/${z2(d.getMonth() + 1)}</div>`;
        dj.forEach(e => { h += `<button class="ep-jc ${classes(e)}" data-ep="sel" data-v="${esc(e.id)}" aria-pressed="${sel === e.id}">${texteBloc(e)}</button>`; if (sel === e.id) h += panneau(c, e); });
        if (dc.length) h += `<div class="ep-cl">Cours habituels : ${dc.map(k => esc(hFr(k.debut)) + ' ' + esc(k.matiere)).join(' · ')}</div>`;
      }
      if (!sel) h += '<div class="ep-note">Touchez une épreuve pour voir les AESH et les cours en parallèle.</div>';
    }
    host.innerHTML = h + '</div>';
    lier();
  }

  /* Vue d'ensemble : pour chaque classe du pôle et chaque matière, l'épreuve datée (en couleur)
     ou une case en pointillés si elle n'est pas encore datée dans RESANA. */
  function ensemble(c, pv, auj) {
    const classes = (c.classesTest || []).filter(x => pv.includes(x.pole));
    if (!classes.length) return '';
    const mats = Array.isArray(c.matieres) && c.matieres.length ? c.matieres : ['Mathématiques', 'Français'];
    let h = '<div class="ep-carte"><div class="ep-titre" style="font-size:.95rem">Vue d’ensemble</div><div class="ep-ens">';
    pv.forEach(p => {
      const cp = classes.filter(x => x.pole === p);
      if (!cp.length) return;
      if (pv.length > 1) h += `<div class="ep-ens-pole">Pôle ${esc(p)}</div>`;
      cp.forEach(x => {
        h += `<div class="ep-ens-cl">${esc(x.classeLabel)}</div>`;
        mats.forEach(m => {
          const l = c.epreuves.filter(e => e.classe === x.classe && e.matiere === m && !e.retireeLe);
          h += `<div class="ep-ens-cell"><div class="ep-ens-m">${esc(m)}</div>`;
          h += l.length ? l.map(e => {
            const pl = placesDe(e.id), mq = e.demandes == null ? null : e.demandes - pl.length;
            return `<button class="ep-ens-b st-${etatDe(e, pl)}${e.date < auj ? ' passee' : ''}" data-ep="ens" data-v="${esc(e.id)}" data-pole="${esc(e.pole)}" data-sem="${esc(lundiDe(e.date))}">
              <b>${esc(JOURS[jourIdx(e.date)])} ${esc(dFr(e.date))} · ${esc(hFr(e.debut))}–${esc(hFr(e.fin))}</b><br>${mq == null ? pl.length + ' AESH' : pl.length + ' / ' + e.demandes + ' AESH' + (mq > 0 ? ' · il en manque ' + mq : ' · couverte')}</button>`;
          }).join('') : '<div class="ep-av">Pas encore daté<br><span>en attente sur RESANA</span></div>';
          h += '</div>';
        });
      });
    });
    return h + '</div></div>';
  }

  function panneau(c, e) {
    const pl = placesDe(e.id), equipe = (c.equipes && c.equipes[e.pole]) || [], placer = peutPlacer() && !e.retireeLe;
    const n = e.demandes == null ? Math.max(pl.length, 1) : Math.max(e.demandes, pl.length);
    const sieges = Array.from({ length: n }, (_, i) => pl[i] ? pastille(c, pl[i]) : `<span class="ep-siege">${i + 1}</span>`).join('');
    const manque = e.demandes == null ? null : e.demandes - pl.length;
    let h = `<div class="ep-panneau">
      <div class="ep-titre">${esc(JOURS[jourIdx(e.date)])} ${esc(dFr(e.date))} · ${esc(hFr(e.debut))}–${esc(hFr(e.fin))}</div>
      <div class="ep-sous">${esc(e.classeLabel)} · ${esc(e.matiere)}${e.salle ? ' · ' + esc(e.salle) : ''}${e.avant && (e.changements || []).includes('horaire') ? ' · avant : ' + esc(hFr(e.avant.debut)) + '–' + esc(hFr(e.avant.fin)) : ''}</div>
      <div class="ep-places">${sieges}</div>`;
    h += e.retireeLe ? `<div class="ep-bilan manque">Épreuve retirée de RESANA : les AESH placés sont libérés.</div>`
      : manque == null ? '<div class="ep-bilan">Nombre d’AESH non précisé dans RESANA.</div>'
      : manque > 0 ? `<div class="ep-bilan manque">Il manque ${manque} AESH</div>`
      : `<div class="ep-bilan ok">Épreuve couverte${manque < 0 ? ' (' + (-manque) + ' de plus que demandé)' : ''}</div>`;
    if (placer || (e.retireeLe && peutPlacer() && pl.length)) {
      h += `<div class="ep-equipe">${equipe.map(m => {
        const on = pl.includes(m.id), cf = conflit(c, e, m.id), plein = e.demandes != null && pl.length >= e.demandes;
        const off = !on && (!!cf || plein || !!e.retireeLe);
        return `<button class="ep-aesh${on ? ' on' : ''}" data-ep="aesh" data-v="${esc(m.id)}" aria-pressed="${on}" ${off ? 'disabled' : ''}>${pastille(c, m.id, true)}<span>${on ? 'placé(e)' : cf ? 'déjà pris(e)' : 'placer'}<small>${cf ? 'en ' + esc(cf.classeLabel) + ' ' + esc(cf.matiere) : on ? 'toucher pour retirer' : ''}</small></span></button>`;
      }).join('')}</div>`;
    }
    const par = e.paralleles || [];
    h += '<div class="ep-sect">En parallèle, pendant l’épreuve</div>';
    if (par.length) {
      h += `<div class="ep-par">${par.map(p => {
        const ret = p.presents.filter(x => pl.includes(x.id)), res = p.presents.filter(x => !pl.includes(x.id));
        const st = !p.presents.length ? 'neutre' : !ret.length ? 'complet' : !res.length ? 'manque' : 'inconnu';
        const t = !p.presents.length ? 'aucun AESH prévu' : !ret.length ? 'aucun AESH retiré' : !res.length ? 'plus aucun AESH' : `${ret.length} retiré${ret.length > 1 ? 's' : ''}, ${res.length} reste${res.length > 1 ? 'nt' : ''}`;
        const puces = l => l.map(x => `<span class="ep-puce">${pastille(c, x.id, true)}${x.s === 'h' ? '<i>supposé</i>' : ''}</span>`).join('') || '—';
        return `<div class="ep-cc st-${st}"><b>${esc(p.classeLabel)} · ${esc(p.matiere)}</b><br>${esc(hFr(p.debut))}–${esc(hFr(p.fin))} · ${t}
          <div class="ep-rang"><span>Retirés</span>${puces(ret)}</div><div class="ep-rang"><span>Restent</span>${puces(res)}</div></div>`;
      }).join('')}</div>`;
    } else h += '<div class="ep-note">Aucun cours des autres classes du pôle à cette heure-là.</div>';
    const ail = (e.ailleurs || []).filter(x => pl.includes(x.id) || x.type === 'absent');
    if (ail.length) h += ail.map(x => `<div class="ep-ail">${pastille(c, x.id, true)}<span>${esc(x.libelle)}</span></div>`).join('');
    h += '<div class="ep-note"><i>supposé</i> : pas encore d’emploi du temps saisi à cette heure-là ; l’AESH est supposé(e) dans les cours du pôle.</div></div>';
    return h;
  }

  async function basculer(id) {
    const c = camp(), e = c && c.epreuves.find(x => x.id === sel);
    if (!c || !e || !peutPlacer()) return;
    const cle = campId + '|' + e.id, avant = placements.get(cle), liste = placesDe(e.id);
    const aesh = liste.includes(id) ? liste.filter(x => x !== id) : liste.concat(id);
    const docId = `placement_${campId}_${e.id}`;
    const data = { id: docId, type: 'placement', annee: String(c.annee || ''), campagne: campId, epreuve: e.id, aesh, majLe: new Date().toISOString(), par: String((moi() && moi().id) || '') };
    placements.set(cle, data); dessiner();
    try { await fs.setDoc(fs.doc(db, COL, docId), data); dis('Enregistré'); }
    catch (err) { if (avant) placements.set(cle, avant); else placements.delete(cle); dessiner(); dis('Non enregistré — vérifiez la connexion'); }
  }

  function lier() {
    host.querySelectorAll('[data-ep]').forEach(b => b.onclick = () => {
      if (b.disabled) return;
      const a = b.dataset.ep, v = b.dataset.v;
      if (a === 'camp') { campId = v; semaine = null; sel = null; dessiner(); }
      else if (a === 'pole') { pole = v; semaine = null; sel = null; dessiner(); }
      else if (a === 'sem') { semaine = v; sel = null; dessiner(); }
      else if (a === 'sel') { sel = sel === v ? null : v; dessiner(); }
      else if (a === 'ens') {
        pole = b.dataset.pole; semaine = b.dataset.sem; sel = v; dessiner();
        const p = host.querySelector('.ep-panneau'); if (p) p.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
      else if (a === 'aesh') basculer(v);
    });
  }
  let largeur = window.matchMedia('(min-width: 720px)').matches;
  window.addEventListener('resize', () => { const l = window.matchMedia('(min-width: 720px)').matches; if (l !== largeur) { largeur = l; dessiner(); } });

  return {
    rendre(h) { host = h; abonner(); dessiner(); },
    _etat: () => ({ campId, pole, semaine, sel, etat, n: campagnes.length, placements: [...placements.keys()] })
  };
}
