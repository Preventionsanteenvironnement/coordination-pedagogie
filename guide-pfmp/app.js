/* ============================================================================
   Guide PFMP didactique — multi-pages, navigation par onglets. 100% local.
============================================================================ */
const TYPE_LABEL = { loi: "Loi", reglement: "Réglementaire", convention: "Convention / établissement" };
const TABS = [["accueil", "🏠", "Accueil"], ["themes", "📂", "Thèmes"], ["flash", "🃏", "Cartes"], ["quiz", "🧠", "Quiz"], ["scenarios", "🆘", "Aide"]];

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
    if (ns.slice(i).startsWith(q) && q) { out += `<mark>${s.substr(i, query.length)}</mark>`; i += query.length; }
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

const TITLES = { accueil: "Guide PFMP", themes: "Thèmes", theme: "", flash: "Flashcards", quiz: "Quiz", scenarios: "Que faire si…", glossaire: "Glossaire" };
const SEARCHABLE = ["themes", "scenarios", "glossaire"];

function render() {
  const sec = window.SECTIONS[section];
  // header
  const onTop = page === "accueil";
  const backBtn = $("#hdrBack");
  backBtn.style.display = "inline-flex";
  backBtn.textContent = onTop ? "‹ Portail" : "‹ Retour";
  $("#hdrTitle").textContent = page === "theme" ? sec.themes[themeIdx].titre : (TITLES[page] || "Guide PFMP");
  $("#secPill").style.display = "none";
  const showSearch = SEARCHABLE.includes(page);
  $("#searchWrap").style.display = showSearch ? "block" : "none";
  // tabs
  $("#tabbar").innerHTML = TABS.map(([id, ic, lb]) =>
    `<button class="tab ${page === id || (id === "themes" && page === "theme") ? "active" : ""}" data-tab="${id}"><span>${ic}</span>${lb}</button>`).join("");
  // view
  const map = { accueil: viewAccueil, themes: viewThemes, theme: viewTheme, flash: viewFlash, quiz: viewQuiz, scenarios: viewScenarios, glossaire: viewGlossaire };
  $("#view").innerHTML = map[page]();
  window.scrollTo && window.scrollTo(0, 0);
}

/* ---- Accueil ---- */
function viewAccueil() {
  const tiles = [["themes", "📂", "Thèmes", "Notions par thème, avec sources"], ["flash", "🃏", "Flashcards", "Réviser en s'amusant"],
    ["quiz", "🧠", "Quiz", "Teste-toi (QCM + score)"], ["scenarios", "🆘", "Que faire si…", "Les situations-pièges"], ["glossaire", "📖", "Glossaire", "Tous les sigles"]];
  return `
    <div class="home-banner"><span>📚</span><div><strong>PFMP — cadre réglementaire officiel</strong>
      <small>Uniquement la loi (Code de l'éducation, code du travail, circulaires, décrets). La convention de l'établissement est un espace séparé.</small></div></div>
    <p class="hello">Que veux-tu faire ?</p>
    <div class="tile-grid">
      ${tiles.map(([p, ic, t, d]) => `<button class="tile" data-go="${p}"><span>${ic}</span><strong>${t}</strong><small>${d}</small></button>`).join("")}
    </div>
    <p class="foot-note">Chaque réponse cite sa source officielle : touche le <b>§</b> pour lire le texte exact.</p>`;
}

/* ---- Thèmes (liste) + recherche transversale ---- */
function viewThemes() {
  const sec = window.SECTIONS[section];
  if (query) {
    const q = norm(query); const hits = [];
    sec.themes.forEach((th, i) => th.notions.forEach(n => { if (norm(n.t).includes(q)) hits.push({ i, th: th.titre, n }); }));
    return `<p class="count">${hits.length} résultat(s)</p><div class="notion-list">${hits.map(h => notionCard(h.n, h.th)).join("") || `<p class="empty">Rien trouvé.</p>`}</div>`;
  }
  return `<div class="theme-grid">${sec.themes.map((th, i) =>
    `<button class="theme-card" data-theme="${i}"><span>${th.icone}</span><strong>${esc(th.titre)}</strong><small>${th.notions.length} notion(s)</small></button>`).join("")}</div>`;
}
function viewTheme() {
  const sec = window.SECTIONS[section]; if (themeIdx >= sec.themes.length) themeIdx = 0;
  const th = sec.themes[themeIdx];
  return `
    <h2 class="theme-h">${th.icone} ${esc(th.titre)}</h2>
    <div class="notion-list">${th.notions.map(n => notionCard(n)).join("")}</div>
    <div class="pager">
      <button class="pgr" data-theme="${(themeIdx - 1 + sec.themes.length) % sec.themes.length}">← ${esc(sec.themes[(themeIdx - 1 + sec.themes.length) % sec.themes.length].titre)}</button>
      <button class="pgr" data-theme="${(themeIdx + 1) % sec.themes.length}">${esc(sec.themes[(themeIdx + 1) % sec.themes.length].titre)} →</button>
    </div>`;
}
function notionCard(n, themeName) {
  return `<article class="notion">${themeName ? `<span class="notion-theme">${esc(themeName)}</span>` : ""}<p>${hl(n.t)}</p>${srcChips(n.s)}</article>`;
}

/* ---- Flashcards ---- */
function viewFlash() {
  const cards = window.FLASHCARDS[section] || []; if (!cards.length) return `<p class="empty">—</p>`;
  if (fcIdx >= cards.length) fcIdx = 0; const c = cards[fcIdx];
  return `<div class="flash-wrap">
    <div class="flash-count">Carte ${fcIdx + 1} / ${cards.length}</div>
    <button class="flash-card ${fcFlip ? "flip" : ""}" data-flip>
      <div class="flash-face front"><span class="flash-tag">Question</span><p>${esc(c.q)}</p><span class="flash-hint">Touche pour la réponse</span></div>
      <div class="flash-face back"><span class="flash-tag">Réponse</span><p>${esc(c.r)}</p>${srcChips(c.s)}</div>
    </button>
    <div class="flash-nav">
      <button class="fbtn" data-fc="-1">←</button>
      <button class="fbtn primary" data-flip>Retourner</button>
      <button class="fbtn" data-fc="1">→</button>
    </div></div>`;
}

/* ---- Quiz ---- */
function viewQuiz() {
  const qs = window.QUIZ[section] || [];
  if (quizIdx >= qs.length) {
    const pct = Math.round(quizScore / qs.length * 100);
    return `<div class="quiz-result">
      <div class="quiz-score">${quizScore} / ${qs.length}</div>
      <p>${pct >= 80 ? "Bravo, tu es au point ! 🎉" : pct >= 50 ? "Pas mal — révise les sources 👍" : "À retravailler avec les fiches 💪"}</p>
      <button class="fbtn primary" data-quizrestart>Recommencer</button>
    </div>`;
  }
  const q = qs[quizIdx];
  const opts = q.o.map((o, i) => {
    let cls = "qopt";
    if (quizSel !== null) { if (i === q.c) cls += " good"; else if (i === quizSel) cls += " bad"; else cls += " dim"; }
    return `<button class="${cls}" ${quizSel === null ? `data-qa="${i}"` : "disabled"}>${esc(o)}</button>`;
  }).join("");
  return `<div class="quiz">
    <div class="quiz-top">Question ${quizIdx + 1} / ${qs.length} · score ${quizScore}</div>
    <h2 class="quiz-q">${esc(q.q)}</h2>
    <div class="qopts">${opts}</div>
    ${quizSel !== null ? `<div class="quiz-feed ${quizSel === q.c ? "ok" : "no"}">${quizSel === q.c ? "✅ Correct" : "❌ La bonne réponse est en vert"} ${srcChips(q.s)}</div>
      <button class="fbtn primary" data-qnext>${quizIdx + 1 < qs.length ? "Question suivante →" : "Voir le score"}</button>` : ""}
  </div>`;
}

/* ---- Scénarios ---- */
function viewScenarios() {
  const q = norm(query);
  const list = window.SCENARIOS.filter(s => !query || norm(s.cas + " " + s.etapes.join(" ")).includes(q));
  return `<div class="sos-list">${list.map(s => `<article class="sos"><h3>${hl(s.cas)}</h3>
    <ol>${s.etapes.map(e => `<li>${esc(e)}</li>`).join("")}</ol>${srcChips(s.s)}</article>`).join("") || `<p class="empty">Aucun résultat.</p>`}</div>`;
}

/* ---- Glossaire ---- */
function viewGlossaire() {
  const q = norm(query);
  const list = window.GLOSSAIRE.filter(([sig, def]) => !query || norm(sig + " " + def).includes(q));
  return `<div class="gloss-list">${list.map(([sig, def]) => `<article class="gloss"><strong>${hl(sig)}</strong><span>${hl(def)}</span></article>`).join("") || `<p class="empty">Aucun sigle.</p>`}</div>`;
}

/* ---- Source drawer ---- */
function openSource(id) {
  const s = window.SOURCES[id]; if (!s) return;
  $("#drawer").innerHTML = `<div class="drawer-head"><div><span class="lg ${s.type}">${TYPE_LABEL[s.type]}</span><h3>${esc(s.ref)}</h3></div>
    <button class="icon" id="closeDrawer">✕</button></div>
    <p class="drawer-origin">${esc(s.origine)}</p>
    <div class="drawer-texte">${esc(s.texte).replaceAll("\n", "<br>")}</div>
    <a class="drawer-link" href="${esc(s.url)}" target="_blank" rel="noopener">Voir la source officielle →</a>`;
  $("#drawer").classList.add("open"); $("#backdrop").classList.add("show");
  $("#closeDrawer").onclick = closeSource;
}
function closeSource() { $("#drawer").classList.remove("open"); $("#backdrop").classList.remove("show"); }

/* ---- navigation ---- */
function go(p) { page = p; query = ""; if ($("#search")) $("#search").value = ""; if (p === "quiz") { quizIdx = 0; quizScore = 0; quizSel = null; } render(); }

document.addEventListener("click", e => {
  const sc = e.target.closest("[data-src]"); if (sc) return openSource(sc.dataset.src);
  const sec = e.target.closest("[data-sec]"); if (sec) { section = sec.dataset.sec; themeIdx = 0; fcIdx = 0; fcFlip = false; quizIdx = 0; quizScore = 0; quizSel = null; return render(); }
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
$("#search").addEventListener("input", e => { query = e.target.value; render(); });

render();
