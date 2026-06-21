/* ============================================================================
   Guide PFMP — refonte 2026. 100% local. Contenu officiel inchangé (data.js).
   Identité « institution + terrain » : bleu encre + ambre. Icônes SVG, sans emoji.
============================================================================ */
const TYPE_LABEL = { loi: "Loi", reglement: "Réglementaire", convention: "Convention / établissement" };

/* ---------- Icônes SVG (pro, sans emoji) ---------- */
const I = {
  back:'<path d="m15 6-6 6 6 6"/>',
  chevR:'<path d="m9 6 6 6-6 6"/>',
  chevL:'<path d="m15 6-6 6 6 6"/>',
  arrowR:'<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
  x:'<path d="M6 6 18 18"/><path d="M18 6 6 18"/>',
  ext:'<path d="M14 5h5v5"/><path d="M19 5l-7 7"/><path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  home:'<path d="M4 11 12 4l8 7"/><path d="M6 9.5V20h12V9.5"/>',
  grid:'<rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.6"/>',
  cards:'<rect x="3" y="7" width="13" height="13" rx="2.2"/><path d="M7.5 7V5.4A2 2 0 0 1 9.5 3.4H19a2 2 0 0 1 2 2V15"/>',
  target:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1.1"/>',
  life:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.6"/><path d="m5.6 5.6 3.4 3.4"/><path d="m15 15 3.4 3.4"/><path d="m18.4 5.6-3.4 3.4"/><path d="m9 15-3.4 3.4"/>',
  book:'<path d="M5 4.6A1.6 1.6 0 0 1 6.6 3H18v15H6.6A1.6 1.6 0 0 0 5 19.6z"/><path d="M5 19.6A1.6 1.6 0 0 1 6.6 18H18v3H6.6A1.6 1.6 0 0 1 5 19.6z"/>',
  bookopen:'<path d="M12 6c-1.6-1.1-4.2-1.7-6-1.7V18c1.8 0 4.4.6 6 1.7"/><path d="M12 6c1.6-1.1 4.2-1.7 6-1.7V18c-1.8 0-4.4.6-6 1.7"/><path d="M12 6v13.7"/>',
  usercheck:'<circle cx="9" cy="8" r="3.2"/><path d="M3.6 19c0-3 2.5-5.2 5.4-5.2 1 0 1.9.2 2.7.6"/><path d="m14.5 16.5 1.8 1.8 3.4-3.6"/>',
  clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 1.9"/>',
  euro:'<path d="M16.7 7.4a5.6 5.6 0 1 0-.4 9.4"/><path d="M5 11h7.2"/><path d="M5 13.6h6.2"/>',
  file:'<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M9.5 12.5h6"/><path d="M9.5 16h6"/>',
  paperclip:'<path d="M19 11.4 12 18.4a4 4 0 0 1-5.7-5.6l7.6-7.6a2.7 2.7 0 0 1 3.8 3.8l-7.2 7.2a1.3 1.3 0 0 1-1.9-1.9l6.5-6.5"/>',
  caloff:'<rect x="4" y="5.2" width="16" height="14.8" rx="2.2"/><path d="M4 9.4h16"/><path d="M8 3v3.2M16 3v3.2"/><path d="m10 13 4 4M14 13l-4 4"/>',
  shield:'<path d="M12 3 5 6v5c0 4.3 2.9 7.5 7 9 4.1-1.5 7-4.7 7-9V6z"/><path d="m9.2 12 2 2 3.6-3.9"/>',
  scale:'<path d="M12 4v16"/><path d="M7 7h10"/><path d="M7 7 4.4 13a2.6 2.6 0 0 0 5.2 0z"/><path d="m17 7 2.6 6a2.6 2.6 0 0 1-5.2 0z"/><path d="M8 20h8"/>',
  building:'<path d="M5 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16"/><path d="M16 9h2a2 2 0 0 1 2 2v10"/><path d="M3.5 21h17"/><path d="M8.5 7h3.5M8.5 11h3.5M8.5 15h3.5"/>',
  badge:'<rect x="4" y="4" width="16" height="16" rx="2.6"/><circle cx="12" cy="10" r="2.4"/><path d="M8 16.6c.6-1.7 2.1-2.5 4-2.5s3.4.8 4 2.5"/>',
  aid:'<rect x="3.5" y="6.4" width="17" height="12" rx="2.4"/><path d="M12 9.4v6M9 12.4h6"/><path d="M9 6.4V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5v.9"/>',
  route:'<circle cx="6" cy="18" r="2.3"/><circle cx="18" cy="6" r="2.3"/><path d="M8.3 18H14a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h5.7"/>',
  hash:'<path d="M9.2 4 7.4 20M16.6 4l-1.8 16M5 9h14M4.4 15h14"/>',
  users:'<circle cx="9" cy="9" r="3"/><path d="M3.6 19c0-3 2.5-5.2 5.4-5.2s5.4 2.2 5.4 5.2"/><path d="M16.2 6.2a3 3 0 0 1 0 5.6"/><path d="M17.6 13.9c2.1.5 3.7 2.4 3.7 4.6"/>',
  clipboard:'<rect x="5" y="5" width="14" height="16" rx="2.2"/><path d="M9 5V4a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 4v1"/><path d="M9 11h6M9 14.6h4"/>',
  eye:'<path d="M2.6 12S6 5.6 12 5.6 21.4 12 21.4 12 18 18.4 12 18.4 2.6 12 2.6 12"/><circle cx="12" cy="12" r="3"/>',
  flag:'<path d="M6 21V4"/><path d="M6 5h11l-2 3 2 3H6"/>',
  check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.7h.01"/>',
  doc:'<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/>'
};
function ic(n) { return `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n] || ""}</svg>`; }

const SECMETA = {
  pfmp: { label: "Cadre réglementaire", short: "Cadre", ic: "scale" },
  convention: { label: "Convention d'établissement", short: "Convention", ic: "building" }
};
const TABS = [["accueil", "home", "Accueil"], ["themes", "grid", "Repères"], ["flash", "cards", "Cartes"], ["quiz", "target", "S'entraîner"], ["scenarios", "life", "Aide"]];
const TITLES = { accueil: "Guide PFMP", themes: "", theme: "", flash: "Cartes", quiz: "S'entraîner", scenarios: "Que faire quand…", glossaire: "Glossaire" };
const SEARCHABLE = ["accueil", "themes", "scenarios", "glossaire"];

const PARCOURS = [
  { t: "Avant", ic: "clipboard", d: "Préparer le lieu, signer la convention, sécuriser le cas du mineur.", cta: "La convention", axis: "convention" },
  { t: "Pendant", ic: "eye", d: "Suivre l'élève : visite, présence, gérer un imprévu.", cta: "Que faire quand…", go: "scenarios" },
  { t: "Après", ic: "flag", d: "Clôturer : évaluation, attestation, retour en classe.", cta: "Le cadre", axis: "pfmp" }
];
const AXES = [
  { axis: "pfmp", ic: "scale", t: "Cadre réglementaire", d: "La loi : Code de l'éducation, code du travail, circulaires.", cls: "loi" },
  { axis: "convention", ic: "building", t: "Convention d'établissement", d: "La convention-type, expliquée article par article.", cls: "conv" }
];
const TOOLS = [
  { go: "scenarios", ic: "life", t: "Que faire quand…", d: "Les situations concrètes, pas à pas." },
  { chiffres: 1, ic: "hash", t: "Chiffres clés", d: "Les repères à retenir." },
  { go: "flash", ic: "cards", t: "Cartes", d: "Réviser en un geste." },
  { go: "quiz", ic: "target", t: "S'entraîner", d: "Se tester, tranquillement." },
  { go: "glossaire", ic: "book", t: "Glossaire", d: "Tous les sigles, clairs." }
];
const METRICS = [
  { n: "16", l: "élèves max par référent" },
  { n: "6 mois", l: "durée max dans un même organisme" },
  { n: "7 h", l: "de présence = 1 jour" },
  { n: "44 j", l: "seuil de gratification obligatoire" },
  { n: "48 h", l: "pour déclarer un accident" },
  { n: "10·15·20 €", l: "allocation / jour : 2de · 1re · Tle" }
];

let section = "pfmp";
let page = "accueil";
let themeIdx = 0;
let query = "";
let fcIdx = 0, fcFlip = false;
let quizIdx = 0, quizScore = 0, quizSel = null;

const $ = s => document.querySelector(s);
const esc = v => String(v ?? "").replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
function hl(t) {
  if (!query) return esc(t);
  const q = norm(query); const s = esc(t); const ns = norm(t); let out = "", i = 0;
  while (i < s.length) {
    if (q && ns.slice(i).startsWith(q)) { out += `<mark>${s.substr(i, query.length)}</mark>`; i += query.length; }
    else { out += s[i]; i++; }
  }
  return out;
}
function srcChips(ids) {
  return `<span class="src-chips">${(ids || []).map(id => {
    const s = window.SOURCES[id]; if (!s) return "";
    return `<button class="src-chip ${s.type}" data-src="${esc(id)}">${esc(s.ref)}</button>`;
  }).join("")}</span>`;
}
function icoTheme(t) {
  const s = norm(t);
  if (/referent|tuteur/.test(s)) return "usercheck";
  if (/definition|obligation/.test(s)) return "bookopen";
  if (/duree|volume/.test(s)) return "clock";
  if (/argent|allocation|gratification/.test(s)) return "euro";
  if (/document/.test(s)) return "file";
  if (/annexe/.test(s)) return "paperclip";
  if (/securite|travaux/.test(s)) return "shield";
  if (/accident/.test(s)) return "aid";
  if (/sanction|controle/.test(s)) return "scale";
  if (/statut/.test(s)) return "badge";
  if (/chiffre/.test(s)) return "hash";
  if (/acteur|repere/.test(s)) return "users";
  if (/suivi/.test(s)) return "route";
  if (/absence|interruption|conge|rupture/.test(s)) return "caloff";
  if (/horaire|age/.test(s)) return "clock";
  if (/cadre|partie|responsab/.test(s)) return "scale";
  return "bookopen";
}
/* ---------------------------------------------------------------- render */
const MAP = { accueil: viewAccueil, themes: viewThemes, theme: viewTheme, flash: viewFlash, quiz: viewQuiz, scenarios: viewScenarios, glossaire: viewGlossaire };
function render() {
  const onTop = page === "accueil";
  const back = $("#hdrBack");
  back.innerHTML = `${ic("back")}<span>${onTop ? "Portail" : "Retour"}</span>`;
  $("#hdrTitle").textContent = page === "theme" ? window.SECTIONS[section].themes[themeIdx].titre
    : page === "themes" ? SECMETA[section].label : (TITLES[page] || "Guide PFMP");
  $("#secPill").style.display = "none";
  document.body.dataset.sec = section;
  document.body.dataset.page = page;
  const showSearch = SEARCHABLE.includes(page);
  $("#searchWrap").style.display = showSearch ? "block" : "none";
  $("#tabbar").innerHTML = TABS.map(([id, icn, lb]) =>
    `<button class="tab ${page === id || (id === "themes" && page === "theme") ? "active" : ""}" data-tab="${id}"><span class="tab-ic">${ic(icn)}</span>${lb}</button>`).join("");
  $("#view").innerHTML = MAP[page]();
  window.scrollTo && window.scrollTo(0, 0);
}

/* ---- Accueil ---- */
function viewAccueil() {
  if (query) return accueilResults();
  return `
  <section class="hero">
    <span class="hero-glow"></span>
    <span class="hero-eyebrow">${ic("route")} Période de formation en milieu professionnel</span>
    <h2 class="hero-h">Accompagner une PFMP, <em>sereinement</em>.</h2>
    <p class="hero-p">Le cadre officiel, expliqué simplement et au service des équipes. Chaque réponse cite son texte exact — vous n'êtes jamais seul·e devant une question.</p>
  </section>

  <section class="band">
    <div class="band-h"><span class="band-k">${ic("route")}</span><h3>La PFMP en trois temps</h3></div>
    <div class="parcours">
      ${PARCOURS.map((p, i) => `<button class="phase" style="--pn:${i}" ${p.axis ? `data-axis="${p.axis}"` : ""} ${p.go ? `data-go="${p.go}"` : ""}>
        <span class="phase-top"><span class="phase-step">${i + 1}</span><span class="phase-ic">${ic(p.ic)}</span></span>
        <strong>${p.t}</strong><small>${p.d}</small><span class="phase-go">${p.cta} ${ic("arrowR")}</span></button>`).join("")}
    </div>
  </section>

  <section class="band">
    <div class="band-h"><h3>Par où commencer&nbsp;?</h3></div>
    <div class="axes">
      ${AXES.map(a => `<button class="axis ${a.cls}" data-axis="${a.axis}"><span class="axis-ic">${ic(a.ic)}</span><span class="axis-tx"><strong>${a.t}</strong><small>${a.d}</small></span><span class="axis-arr">${ic("arrowR")}</span></button>`).join("")}
    </div>
  </section>

  <section class="band">
    <div class="band-h"><span class="band-k">${ic("hash")}</span><h3>Chiffres clés</h3></div>
    <div class="metrics">${METRICS.map(c => `<button class="metric" data-chiffres><span class="metric-n">${esc(c.n)}</span><span class="metric-l">${esc(c.l)}</span></button>`).join("")}</div>
  </section>

  <section class="band">
    <div class="band-h"><h3>Boîte à outils</h3></div>
    <div class="tools">
      ${TOOLS.map(t => `<button class="tool" ${t.go ? `data-go="${t.go}"` : ""} ${t.chiffres ? "data-chiffres" : ""}><span class="tool-ic">${ic(t.ic)}</span><strong>${t.t}</strong><small>${t.d}</small></button>`).join("")}
    </div>
  </section>

  <p class="foot-note">${ic("info")} Touchez un repère <b>§</b> pour lire le texte officiel exact et son lien.</p>`;
}
function accueilResults() {
  const q = norm(query);
  const notions = [];
  Object.keys(window.SECTIONS).forEach(k => window.SECTIONS[k].themes.forEach(th => th.notions.forEach(n => {
    if (norm(n.t).includes(q)) notions.push(notionCard(n, SECMETA[k].short + " · " + th.titre));
  })));
  const scs = window.SCENARIOS.filter(s => norm(s.cas + " " + s.etapes.join(" ")).includes(q))
    .map(s => `<article class="notion"><span class="notion-theme">${ic("life")} Que faire quand…</span><p>${hl(s.cas)}</p>${srcChips(s.s)}</article>`);
  const gls = window.GLOSSAIRE.filter(([sig, def]) => norm(sig + " " + def).includes(q))
    .map(([sig, def]) => `<article class="gloss"><strong>${hl(sig)}</strong><span>${hl(def)}</span></article>`);
  const total = notions.length + scs.length + gls.length;
  return `<p class="count">${total} résultat${total > 1 ? "s" : ""} pour « ${esc(query)} »</p>
    <div class="notion-list">${notions.join("")}${scs.join("")}</div>
    ${gls.length ? `<div class="gloss-list" style="margin-top:13px">${gls.join("")}</div>` : ""}
    ${total ? "" : `<p class="empty">Rien trouvé. Essayez un autre mot.</p>`}`;
}

/* ---- Repères (thèmes) ---- */
function secTabs() {
  return `<div class="seg">${Object.keys(SECMETA).map(k =>
    `<button class="seg-b ${section === k ? "on" : ""}" data-sec="${k}">${ic(SECMETA[k].ic)}<span>${SECMETA[k].label}</span></button>`).join("")}</div>`;
}
function viewThemes() {
  const sec = window.SECTIONS[section];
  if (query) {
    const q = norm(query); const hits = [];
    sec.themes.forEach(th => th.notions.forEach(n => { if (norm(n.t).includes(q)) hits.push(notionCard(n, th.titre)); }));
    return secTabs() + `<p class="count">${hits.length} résultat${hits.length > 1 ? "s" : ""}</p><div class="notion-list">${hits.join("") || `<p class="empty">Rien trouvé dans cet axe.</p>`}</div>`;
  }
  return secTabs() + `<div class="theme-grid">${sec.themes.map((th, i) =>
    `<button class="theme-card" data-theme="${i}"><span class="tc-ic">${ic(icoTheme(th.titre))}</span><strong>${esc(th.titre)}</strong><small>${th.notions.length} repère${th.notions.length > 1 ? "s" : ""}</small></button>`).join("")}</div>`;
}
function viewTheme() {
  const sec = window.SECTIONS[section]; if (themeIdx >= sec.themes.length) themeIdx = 0;
  const th = sec.themes[themeIdx];
  const prev = (themeIdx - 1 + sec.themes.length) % sec.themes.length;
  const next = (themeIdx + 1) % sec.themes.length;
  return `
    <h2 class="theme-h"><span class="theme-h-ic">${ic(icoTheme(th.titre))}</span>${esc(th.titre)}</h2>
    <div class="notion-list">${th.notions.map(n => notionCard(n)).join("")}</div>
    <div class="pager">
      <button class="pgr" data-theme="${prev}">${ic("chevL")}<span>${esc(sec.themes[prev].titre)}</span></button>
      <button class="pgr" data-theme="${next}"><span>${esc(sec.themes[next].titre)}</span>${ic("chevR")}</button>
    </div>`;
}
function notionCard(n, themeName) {
  return `<article class="notion">${themeName ? `<span class="notion-theme">${esc(themeName)}</span>` : ""}<p>${hl(n.t)}</p>${srcChips(n.s)}</article>`;
}

/* ---- Cartes (flashcards) ---- */
function viewFlash() {
  const cards = window.FLASHCARDS[section] || []; if (!cards.length) return secTabs() + `<p class="empty">—</p>`;
  if (fcIdx >= cards.length) fcIdx = 0; const c = cards[fcIdx];
  return secTabs() + `<div class="flash-wrap">
    <div class="flash-count">Carte ${fcIdx + 1} / ${cards.length}</div>
    <button class="flash-card ${fcFlip ? "flip" : ""}" data-flip>
      <div class="flash-face front"><span class="flash-tag">Question</span><p>${esc(c.q)}</p><span class="flash-hint">${ic("cards")} Toucher pour la réponse</span></div>
      <div class="flash-face back"><span class="flash-tag">Réponse</span><p>${esc(c.r)}</p>${srcChips(c.s)}</div>
    </button>
    <div class="flash-nav">
      <button class="fbtn" data-fc="-1" aria-label="Carte précédente">${ic("chevL")}</button>
      <button class="fbtn primary" data-flip>${ic("cards")} Retourner</button>
      <button class="fbtn" data-fc="1" aria-label="Carte suivante">${ic("chevR")}</button>
    </div></div>`;
}

/* ---- S'entraîner (quiz) ---- */
function viewQuiz() {
  const qs = window.QUIZ[section] || [];
  if (quizIdx >= qs.length) {
    const pct = Math.round(quizScore / qs.length * 100);
    return secTabs() + `<div class="quiz-result">
      <div class="quiz-ring" style="--p:${pct}"><span>${quizScore}<small>/ ${qs.length}</small></span></div>
      <p>${pct >= 80 ? "Vous maîtrisez le sujet." : pct >= 50 ? "Bonne base — un coup d'œil aux sources et c'est parfait." : "À reprendre tranquillement avec les cartes."}</p>
      <button class="fbtn primary inline" data-quizrestart>${ic("target")} Recommencer</button>
    </div>`;
  }
  const q = qs[quizIdx];
  const opts = q.o.map((o, i) => {
    let cls = "qopt";
    if (quizSel !== null) { if (i === q.c) cls += " good"; else if (i === quizSel) cls += " bad"; else cls += " dim"; }
    return `<button class="${cls}" ${quizSel === null ? `data-qa="${i}"` : "disabled"}><span class="qopt-mk">${quizSel !== null && i === q.c ? ic("check") : ""}</span>${esc(o)}</button>`;
  }).join("");
  return secTabs() + `<div class="quiz">
    <div class="quiz-top"><span>Question ${quizIdx + 1} / ${qs.length}</span><span class="quiz-sc">${ic("target")} ${quizScore}</span></div>
    <div class="quiz-bar"><span style="width:${Math.round(quizIdx / qs.length * 100)}%"></span></div>
    <h2 class="quiz-q">${esc(q.q)}</h2>
    <div class="qopts">${opts}</div>
    ${quizSel !== null ? `<div class="quiz-feed ${quizSel === q.c ? "ok" : "no"}">${quizSel === q.c ? ic("check") + " Bien vu" : ic("info") + " La bonne réponse est surlignée"} ${srcChips(q.s)}</div>
      <button class="fbtn primary inline" data-qnext>${quizIdx + 1 < qs.length ? "Question suivante " + ic("chevR") : "Voir le bilan " + ic("chevR")}</button>` : ""}
  </div>`;
}

/* ---- Que faire quand… (scénarios) ---- */
function viewScenarios() {
  const q = norm(query);
  const list = window.SCENARIOS.filter(s => !query || norm(s.cas + " " + s.etapes.join(" ")).includes(q));
  return `<div class="sos-intro">${ic("life")}<span>Des situations concrètes, et la marche à suivre — pas à pas, sources à l'appui. Rien d'anxiogène : juste le bon réflexe au bon moment.</span></div>
    <div class="sos-list">${list.map(s => `<article class="sos"><h3><span class="sos-ic">${ic("life")}</span>${hl(s.cas)}</h3>
      <ol>${s.etapes.map(e => `<li>${esc(e)}</li>`).join("")}</ol>${srcChips(s.s)}</article>`).join("") || `<p class="empty">Aucun résultat.</p>`}</div>`;
}

/* ---- Glossaire ---- */
function viewGlossaire() {
  const q = norm(query);
  const list = window.GLOSSAIRE.filter(([sig, def]) => !query || norm(sig + " " + def).includes(q));
  return `<div class="gloss-list">${list.map(([sig, def]) => `<article class="gloss"><strong>${hl(sig)}</strong><span>${hl(def)}</span></article>`).join("") || `<p class="empty">Aucun sigle.</p>`}</div>`;
}

/* ---- Tiroir source ---- */
function openSource(id) {
  const s = window.SOURCES[id]; if (!s) return;
  $("#drawer").innerHTML = `<div class="drawer-head"><div><span class="lg ${s.type}">${TYPE_LABEL[s.type]}</span><h3>${esc(s.ref)}</h3></div>
    <button class="icon" id="closeDrawer" aria-label="Fermer">${ic("x")}</button></div>
    <p class="drawer-origin">${esc(s.origine)}</p>
    <div class="drawer-texte">${esc(s.texte).replaceAll("\n", "<br>")}</div>
    <a class="drawer-link" href="${esc(s.url)}" target="_blank" rel="noopener">Voir la source officielle ${ic("ext")}</a>`;
  $("#drawer").classList.add("open"); $("#backdrop").classList.add("show");
  $("#closeDrawer").onclick = closeSource;
}
function closeSource() { $("#drawer").classList.remove("open"); $("#backdrop").classList.remove("show"); }

/* ---- navigation ---- */
function resetSub() { themeIdx = 0; fcIdx = 0; fcFlip = false; quizIdx = 0; quizScore = 0; quizSel = null; }
function go(p) { page = p; query = ""; if ($("#search")) $("#search").value = ""; if (p === "quiz") { quizIdx = 0; quizScore = 0; quizSel = null; } render(); }

if (!window.__pfmpInit) {
  window.__pfmpInit = true;
document.addEventListener("click", e => {
  const sc = e.target.closest("[data-src]"); if (sc) return openSource(sc.dataset.src);
  const ax = e.target.closest("[data-axis]"); if (ax) { section = ax.dataset.axis; resetSub(); return go("themes"); }
  const ch = e.target.closest("[data-chiffres]"); if (ch) { section = "pfmp"; const i = window.SECTIONS.pfmp.themes.findIndex(t => norm(t.titre).includes("chiffres")); themeIdx = i < 0 ? 0 : i; page = "theme"; query = ""; if ($("#search")) $("#search").value = ""; return render(); }
  const se = e.target.closest("[data-sec]"); if (se) { section = se.dataset.sec; resetSub(); return render(); }
  const tab = e.target.closest("[data-tab]"); if (tab) return go(tab.dataset.tab);
  const gob = e.target.closest("[data-go]"); if (gob) return go(gob.dataset.go);
  const th = e.target.closest("[data-theme]"); if (th) { themeIdx = +th.dataset.theme; page = "theme"; return render(); }
  const fl = e.target.closest("[data-flip]"); if (fl) { fcFlip = !fcFlip; return render(); }
  const fc = e.target.closest("[data-fc]"); if (fc) { const n = window.FLASHCARDS[section].length; fcIdx = (fcIdx + +fc.dataset.fc + n) % n; fcFlip = false; return render(); }
  const qa = e.target.closest("[data-qa]"); if (qa) { quizSel = +qa.dataset.qa; if (quizSel === window.QUIZ[section][quizIdx].c) quizScore++; return render(); }
  const qn = e.target.closest("[data-qnext]"); if (qn) { quizIdx++; quizSel = null; return render(); }
  const qr = e.target.closest("[data-quizrestart]"); if (qr) { quizIdx = 0; quizScore = 0; quizSel = null; return render(); }
  if (e.target.closest("#hdrBack")) {
    if (page === "accueil") { location.href = "../"; return; }
    page = (page === "theme") ? "themes" : "accueil"; query = ""; if ($("#search")) $("#search").value = ""; return render();
  }
  if (e.target.closest("#backdrop")) return closeSource();
});
document.addEventListener("keydown", e => { if (e.key === "Escape") closeSource(); });
$("#search").addEventListener("input", e => { query = e.target.value; render(); $("#search").focus(); });
}

render();
