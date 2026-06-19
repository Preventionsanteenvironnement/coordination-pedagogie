/* ============================================================================
   École inclusive — moteur multi-pages. Refonte 2026. 100% local.
   Icônes : SVG de ligne, inline (aucune dépendance). Zéro émoji.
============================================================================ */
const ICONS = {
  chev: `<path d="m9 6 6 6-6 6"/>`,
  back: `<path d="m14 6-6 6 6 6"/>`,
  home: `<path d="M3 9.5 12 3l9 6.5"/><path d="M5 10v10h14V10"/>`,
  layers: `<path d="m12 4 8 4-8 4-8-4z"/><path d="m4.5 12 7.5 3.7 7.5-3.7"/><path d="m4.5 16 7.5 3.7 7.5-3.7"/>`,
  "book-open": `<path d="M12 6.5C10.5 5 8 4.5 4.5 5v12c3.5-.5 6 0 7.5 1.5"/><path d="M12 6.5C13.5 5 16 4.5 19.5 5v12c-3.5-.5-6 0-7.5 1.5"/>`,
  book: `<path d="M6.5 4H18v16H6.5A1.5 1.5 0 0 1 5 18.5v-13A1.5 1.5 0 0 1 6.5 4z"/><path d="M9 4v16"/>`,
  wand: `<path d="M5 19 15 9"/><path d="m16 3 1 2.2 2.2 1-2.2 1L16 10.4 15 8.2 12.8 7.2 15 6.2z"/>`,
  help: `<circle cx="12" cy="12" r="9"/><path d="M9.6 9.6a2.5 2.5 0 0 1 4 1.9c0 1.6-2 2-2 3.6"/><circle cx="11.7" cy="17.4" r=".7" fill="currentColor" stroke="none"/>`,
  accessible: `<circle cx="12" cy="4.4" r="1.6"/><path d="M5 8.5c2 .9 4.4 1.3 7 1.3s5-.4 7-1.3"/><path d="M12 9.8V15l-2.6 5"/><path d="M12 15l2.7 5"/>`,
  heartbeat: `<path d="M3 12h4l1.5-4 3 9 2.5-6 1.4 3H21"/>`,
  "trending-up": `<path d="M4 16 9 11l3 3 7-7"/><path d="M16 7h4v4"/>`,
  scale: `<path d="M12 4v16"/><path d="M7 20h10"/><path d="M5 7h14"/><path d="M5 7 2.6 12h4.8z"/><path d="M19 7l-2.4 5h4.8z"/>`,
  users: `<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 5.2a3.2 3.2 0 0 1 0 6.1"/><path d="M16.5 14.4a5.5 5.5 0 0 1 4 4.6"/>`,
  refresh: `<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8"/><path d="M20 4v4h-4"/><path d="M20 12a8 8 0 0 1-13.7 5.6L4 16"/><path d="M4 20v-4h4"/>`,
  brain: `<path d="M12 5a4 4 0 0 0-4 4 3.3 3.3 0 0 0-1 6.4V17a2 2 0 0 0 2 2h3"/><path d="M12 5a4 4 0 0 1 4 4 3.3 3.3 0 0 1 1 6.4V17a2 2 0 0 1-2 2h-3"/><path d="M12 5v14"/>`,
  puzzle: `<path d="M9 4.5a1.5 1.5 0 0 1 3 0V6h3.5v3.5H17a1.5 1.5 0 0 1 0 3h-1.5V16H12v-1.5a1.5 1.5 0 0 0-3 0V16H5.5v-3.5H7a1.5 1.5 0 0 0 0-3H5.5V6H9z"/>`,
  bolt: `<path d="M13 3 5 13.5h5.5L10 21l8-10.5h-5.5z"/>`,
  letter: `<path d="M6 18 11 6l5 12"/><path d="M7.6 14h7"/>`,
  pencil: `<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>`,
  number: `<path d="M9 4 7 20"/><path d="M17 4l-2 16"/><path d="M5 9h15"/><path d="M4 15h15"/>`,
  message: `<path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4V6a1 1 0 0 1 1-1z"/>`,
  heart: `<path d="M12 20.5S4.5 16 4.5 10.3A3.6 3.6 0 0 1 12 8a3.6 3.6 0 0 1 7.5 2.3C19.5 16 12 20.5 12 20.5z"/>`,
  user: `<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>`,
  ruler: `<path d="M4 14 14 4l6 6L10 20z"/><path d="M8 8l2 2M11 5l2 2M5 11l2 2"/>`,
  flag: `<path d="M6 21V4"/><path d="M6 5h11l-2 3 2 3H6"/>`,
  handshake: `<path d="M11 7 8 10a2 2 0 0 0 0 3l1 1 4-4"/><path d="M13 9l3 3a2 2 0 0 1-3 3"/><path d="M3 8l4-3 5 2 5-2 4 3"/>`,
  external: `<path d="M14 5h5v5"/><path d="M19 5l-8 8"/><path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>`,
  target: `<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>`,
  gavel: `<path d="M8 11 4 15a1.4 1.4 0 0 0 2 2l4-4"/><path d="M10 9l5-5 4 4-5 5z"/><path d="M13 18h7"/>`,
  id: `<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16a3 3 0 0 1 6 0"/><path d="M15 10h3M15 13.5h3"/>`,
  clock: `<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>`,
  alert: `<path d="M12 4 2.5 20h19z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.4" r=".6" fill="currentColor" stroke="none"/>`,
  "user-check": `<circle cx="9" cy="8" r="3.4"/><path d="M3.5 20a6 6 0 0 1 11 0"/><path d="m15.5 13 1.7 1.7 3.3-3.4"/>`,
  x: `<path d="m6 6 12 12M18 6 6 18"/>`,
};
function ic(name) { const p = ICONS[name]; return p ? `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${p}</svg>` : ""; }

const TYPE_LABEL = { loi: "Loi", reglement: "Texte officiel", ouvrage: "Ouvrage / ressource" };
const TABS = [
  ["accueil", "home", "Accueil"],
  ["dispositifs", "layers", "Dispositifs"],
  ["comprendre", "book-open", "Comprendre"],
  ["adapter", "wand", "Adapter"],
  ["situations", "help", "Situations"],
  ["glossaire", "book", "Glossaire"],
];

let page = "accueil";
let dispIdx = 0, parcoursIdx = 0, themeIdx = 0;
let query = "", searchOn = false;

const $ = s => document.querySelector(s);
const esc = v => String(v ?? "").replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
function hl(t) {
  if (!query) return esc(t);
  const q = norm(query); if (!q) return esc(t);
  const s = esc(t), ns = norm(s); let out = "", i = 0;
  while (i < s.length) { if (ns.startsWith(q, i)) { out += `<mark>${s.substr(i, q.length)}</mark>`; i += q.length; } else { out += s[i]; i++; } }
  return out;
}
function srcChips(ids) {
  return `<div class="src-chips">${(ids || []).map(id => {
    const s = window.SOURCES[id]; if (!s) return "";
    return `<button class="src-chip" data-src="${esc(id)}">${esc(s.ref)}</button>`;
  }).join("")}</div>`;
}

/* ---------------- Shell ---------------- */
function render() {
  const D = window.DISPOSITIFS, P = window.PARCOURS;
  const titles = {
    accueil: "École inclusive", dispositifs: "Les 4 dispositifs",
    dispositif: D[dispIdx] ? D[dispIdx].code : "Dispositif",
    parcours: P[parcoursIdx] ? P[parcoursIdx].nom : "", theme: "",
    situations: "Que faire si…", glossaire: "Glossaire", search: "Recherche",
  };
  if (page === "theme") titles.theme = P[parcoursIdx].themes[themeIdx].titre;
  $("#title").textContent = query ? "Recherche" : (titles[page] || "École inclusive");
  $("#backLabel").textContent = page === "accueil" ? "Portail" : "Retour";

  const act = query ? "" : ({ dispositif: "dispositifs", theme: (parcoursIdx === 0 ? "comprendre" : "adapter"),
    parcours: (parcoursIdx === 0 ? "comprendre" : "adapter") })[page] || page;
  $("#tabs").innerHTML = TABS.map(([id, icon, lb]) =>
    `<button class="tab ${act === id ? "active" : ""}" data-tab="${id}">${ic(icon)}${lb}</button>`).join("");

  let html;
  if (query) html = viewSearch();
  else html = ({ accueil: viewAccueil, dispositifs: viewDispositifs, dispositif: viewDispositif,
    parcours: viewParcours, theme: viewTheme, situations: viewSituations, glossaire: viewGlossaire }[page] || viewAccueil)();
  $("#view").innerHTML = html;
  window.scrollTo && window.scrollTo(0, 0);
}

/* ---------------- Accueil ---------------- */
function cmpCard(d, i) {
  const y = norm(d.faits.mdph).startsWith("oui");
  return `<button class="cmp" style="--c:${d.c}" data-disp="${i}">
    <div class="cmp-h"><span class="cmp-ic">${ic(d.icon)}</span><span class="cmp-code">${d.code}</span></div>
    <div class="cmp-motif">${esc(d.motif)}</div>
    <span class="cmp-mdph ${y ? "y" : "n"}">${y ? "MDPH" : "sans MDPH"}</span>
  </button>`;
}
function viewAccueil() {
  const G = window.GUIDE;
  const tiles = [
    ["dispositifs", "layers", "Les 4 dispositifs", "PPS, PAP, PAI, PPRE"],
    ["comprendre", "book-open", "Comprendre", "Cadre, acteurs, troubles"],
    ["adapter", "wand", "Adapter", "Pédagogie & supports"],
    ["situations", "help", "Que faire si…", "Cas concrets"],
    ["glossaire", "book", "Glossaire", "Tous les sigles"],
  ];
  return `
    <div class="hero">
      <span class="h-may">${esc(G.maj)}</span>
      <h1>${esc(G.titre)}</h1>
      <p>${esc(G.sousTitre)}. Comprendre les élèves à besoins éducatifs particuliers et adapter sa pédagogie.</p>
    </div>
    <div class="sec-title">${ic("layers")} Quel dispositif pour quel élève ?</div>
    <div class="compare">${window.DISPOSITIFS.map(cmpCard).join("")}</div>
    <div class="sec-title">${ic("home")} Explorer le guide</div>
    <div class="tiles">${tiles.map(([p, icn, t, d]) =>
      `<button class="tile" data-go="${p}"><span class="t-ic">${ic(icn)}</span><span class="t-tx"><strong>${t}</strong><small>${d}</small></span><span class="t-go">${ic("chev")}</span></button>`).join("")}</div>`;
}

/* ---------------- Dispositifs ---------------- */
function viewDispositifs() {
  return `<p class="count">Les quatre plans d'accompagnement, du handicap à la difficulté passagère.</p>
    <div class="disp-list">${window.DISPOSITIFS.map((d, i) =>
      `<button class="disp-card" style="--c:${d.c}" data-disp="${i}">
        <div class="dc-top"><span class="dc-ic">${ic(d.icon)}</span><span><span class="dc-code">${d.code}</span> · <span class="dc-motif">${esc(d.motif)}</span></span></div>
        <div class="dc-nom">${esc(d.nom)}</div>
        <div class="dc-res">${esc(d.resume)}</div>
      </button>`).join("")}</div>`;
}

function viewDispositif() {
  const d = window.DISPOSITIFS[dispIdx];
  const f = d.faits;
  const facts = [
    ["users", "Pour qui", f.pour, false], ["gavel", "Qui décide", f.decide, false],
    ["pencil", "Qui rédige", f.redige, false], ["id", "MDPH", f.mdph, norm(f.mdph).startsWith("oui")],
    ["clock", "Durée", f.duree, false],
  ];
  const factCards = facts.map(([icn, k, v, y]) =>
    `<div class="fact ${y ? "mdph-y" : ""}"><div class="f-k">${ic(icn)}${k}</div><div class="f-v">${esc(v)}</div></div>`).join("");

  const blocs = (d.blocs || []).map(b =>
    `<section class="card ${b.bad ? "bad" : ""}"><div class="card-h">${ic(b.bad ? "alert" : "target")}${esc(b.h)}</div>
      <ul class="lst ${b.bad ? "bad" : ""}">${b.items.map(x => `<li>${esc(x)}</li>`).join("")}</ul></section>`).join("");

  const urg = d.urgence ? `<section class="urg"><div class="card-h">${ic("alert")}Protocole d'urgence — le réflexe enseignant</div>
    <div class="urg-steps">${d.urgence.map((u, i) =>
      `<div class="urg-step"><span class="u-n">${i + 1}</span><span class="u-tx"><b>${esc(u.t)}</b> ${esc(u.d)}</span></div>`).join("")}</div></section>` : "";

  const proc = (d.process || []).map((s, i) =>
    `<div class="step"><div class="s-rail"><span class="s-dot">${i + 1}</span><span class="s-line"></span></div>
      <div class="s-body"><div class="s-t">${esc(s.t)}</div><div class="s-d">${esc(s.d)}</div></div></div>`).join("");

  return `<div class="fiche">
    <div class="fiche-band" style="--c:${d.c}">
      <span class="fb-ic">${ic(d.icon)}</span>
      <div class="fb-code">${esc(d.code)}</div>
      <div class="fb-nom">${esc(d.nom)}</div>
      <div class="fb-res">${esc(d.resume)}</div>
    </div>
    <div class="facts" style="--c:${d.c}">${factCards}</div>
    ${urg}
    ${blocs ? `<div style="--c:${d.c}; display:flex; flex-direction:column; gap:16px;">${blocs}</div>` : ""}
    <section class="card" style="--c:${d.c}"><div class="card-h">${ic("refresh")}La démarche, étape par étape</div>
      <div class="proc">${proc}</div></section>
    <div class="callout teach"><span class="co-ic">${ic("user-check")}</span><div class="co-tx"><span class="co-h">Pour l'enseignant</span>${esc(d.enseignant)}</div></div>
    <div class="callout warn"><span class="co-ic">${ic("alert")}</span><div class="co-tx"><b>À ne pas confondre avec le ${esc(d.confond.code)} —</b> ${esc(d.confond.txt)}</div></div>
    ${srcChips(d.s)}
  </div>`;
}

/* ---------------- Parcours (Comprendre / Adapter) ---------------- */
function viewParcours() {
  const p = window.PARCOURS[parcoursIdx];
  return `<p class="count">${esc(p.intro)}</p>
    <div class="theme-list">${p.themes.map((t, i) =>
      `<button class="theme-card" data-theme="${i}"><span class="tc-ic">${ic(t.icon)}</span>
        <span><span class="tc-t">${esc(t.titre)}</span><br><span class="tc-n">${t.notions.length} repère(s)</span></span>
        <span class="t-go">${ic("chev")}</span></button>`).join("")}</div>`;
}

function viewTheme() {
  const p = window.PARCOURS[parcoursIdx];
  const t = p.themes[themeIdx];
  const prev = (themeIdx - 1 + p.themes.length) % p.themes.length;
  const next = (themeIdx + 1) % p.themes.length;
  return `
    <div class="theme-head"><span class="th-ic">${ic(t.icon)}</span><h2>${esc(t.titre)}</h2></div>
    <div class="notion-list">${t.notions.map(n => `<article class="notion"><p>${esc(n.t)}</p>${srcChips(n.s)}</article>`).join("")}</div>
    <div class="pager">
      <button class="pgr" data-theme="${prev}">${ic("back")}<span>${esc(p.themes[prev].titre)}</span></button>
      <button class="pgr next" data-theme="${next}"><span>${esc(p.themes[next].titre)}</span>${ic("chev")}</button>
    </div>`;
}

/* ---------------- Situations ---------------- */
function viewSituations() {
  return `<p class="count">Des cas concrets et la conduite à tenir, étape par étape.</p>
    <div class="sit-list">${window.SITUATIONS.map(s =>
      `<article class="sit"><h3>${ic("help")}<span>${esc(s.cas)}</span></h3>
        <ol>${s.etapes.map(e => `<li>${esc(e)}</li>`).join("")}</ol>${srcChips(s.s)}</article>`).join("")}</div>`;
}

/* ---------------- Glossaire ---------------- */
function viewGlossaire() {
  return `<p class="count">${window.GLOSSAIRE.length} sigles & définitions de l'école inclusive.</p>
    <div class="gloss-list">${window.GLOSSAIRE.map(([sig, def]) =>
      `<article class="gloss"><span class="g-sig">${esc(sig)}</span><span class="g-def">${esc(def)}</span></article>`).join("")}</div>`;
}

/* ---------------- Recherche transversale ---------------- */
function viewSearch() {
  const q = norm(query);
  const out = [];
  window.DISPOSITIFS.forEach((d, i) => {
    if (norm(d.code + " " + d.nom + " " + d.motif + " " + d.resume).includes(q))
      out.push(`<button class="disp-card" style="--c:${d.c}" data-disp="${i}"><div class="dc-top"><span class="dc-ic">${ic(d.icon)}</span><span class="dc-code">${hl(d.code)}</span></div><div class="dc-nom">${hl(d.nom)}</div><div class="dc-res">${hl(d.resume)}</div></button>`);
  });
  const notions = [];
  window.PARCOURS.forEach((p, pi) => p.themes.forEach((t, ti) => t.notions.forEach(n => {
    if (norm(n.t).includes(q)) notions.push({ pi, ti, t: t.titre, n });
  })));
  const gloss = window.GLOSSAIRE.filter(([sig, def]) => norm(sig + " " + def).includes(q));
  const sits = window.SITUATIONS.filter(s => norm(s.cas + " " + s.etapes.join(" ")).includes(q));

  let h = "";
  if (out.length) h += `<div class="sec-title">${ic("layers")} Dispositifs</div><div class="disp-list">${out.join("")}</div>`;
  if (notions.length) h += `<div class="sec-title">${ic("book-open")} Repères</div><div class="notion-list">${notions.map(x =>
    `<article class="notion" data-goto="${x.pi}:${x.ti}"><p>${hl(x.n.t)}</p><div class="src-chips"><span class="src-chip" style="cursor:default">${esc(x.t)}</span></div></article>`).join("")}</div>`;
  if (sits.length) h += `<div class="sec-title">${ic("help")} Situations</div><div class="sit-list">${sits.map(s =>
    `<article class="sit"><h3>${ic("help")}<span>${hl(s.cas)}</span></h3><ol>${s.etapes.map(e => `<li>${esc(e)}</li>`).join("")}</ol></article>`).join("")}</div>`;
  if (gloss.length) h += `<div class="sec-title">${ic("book")} Glossaire</div><div class="gloss-list">${gloss.map(([sig, def]) =>
    `<article class="gloss"><span class="g-sig">${hl(sig)}</span><span class="g-def">${hl(def)}</span></article>`).join("")}</div>`;
  return h || `<p class="empty">Aucun résultat pour « ${esc(query)} ».</p>`;
}

/* ---------------- Tiroir source ---------------- */
function openSource(id) {
  const s = window.SOURCES[id]; if (!s) return;
  $("#drawer").innerHTML = `<div class="drawer-head"><div><span class="lg ${s.type}">${TYPE_LABEL[s.type] || ""}</span><h3>${esc(s.ref)}</h3></div>
    <button class="x" id="closeDrawer" aria-label="Fermer">${ic("x")}</button></div>
    <p class="drawer-origin">${esc(s.origine)}</p>
    ${s.url ? `<a class="drawer-link" href="${esc(s.url)}" target="_blank" rel="noopener">Voir la source officielle ${ic("external")}</a>` : ""}`;
  $("#drawer").classList.add("open"); $("#backdrop").classList.add("show");
  $("#closeDrawer").onclick = closeDrawer;
}
function closeDrawer() { $("#drawer").classList.remove("open"); $("#backdrop").classList.remove("show"); }

/* ---------------- Navigation ---------------- */
function clearSearch() { query = ""; if ($("#search")) $("#search").value = ""; }
function goTab(id) {
  clearSearch();
  if (id === "comprendre") { page = "parcours"; parcoursIdx = 0; }
  else if (id === "adapter") { page = "parcours"; parcoursIdx = 1; }
  else page = id;
  render();
}

document.addEventListener("click", e => {
  const src = e.target.closest("[data-src]"); if (src) return openSource(src.dataset.src);
  const tab = e.target.closest("[data-tab]"); if (tab) return goTab(tab.dataset.tab);
  const go = e.target.closest("[data-go]"); if (go) return goTab(go.dataset.go);
  const disp = e.target.closest("[data-disp]"); if (disp) { clearSearch(); dispIdx = +disp.dataset.disp; page = "dispositif"; return render(); }
  const th = e.target.closest("[data-theme]"); if (th) { themeIdx = +th.dataset.theme; page = "theme"; return render(); }
  const goto = e.target.closest("[data-goto]"); if (goto) { const [pi, ti] = goto.dataset.goto.split(":").map(Number); clearSearch(); parcoursIdx = pi; themeIdx = ti; page = "theme"; return render(); }
  if (e.target.closest("#backdrop")) return closeDrawer();
  if (e.target.closest("#searchToggle")) {
    searchOn = !searchOn; $("#searchBar").hidden = !searchOn;
    if (searchOn) { setTimeout(() => $("#search").focus(), 30); } else { clearSearch(); render(); }
    return;
  }
  if (e.target.closest("#back")) {
    if (query) { clearSearch(); return render(); }
    if (page === "accueil") { location.href = "../../"; return; }
    const up = { dispositif: "dispositifs", theme: "parcours", parcours: "accueil", dispositifs: "accueil", situations: "accueil", glossaire: "accueil" };
    page = up[page] || "accueil"; return render();
  }
});
document.addEventListener("keydown", e => { if (e.key === "Escape") { closeDrawer(); } });
$("#search").addEventListener("input", e => { query = e.target.value; render(); });

render();
