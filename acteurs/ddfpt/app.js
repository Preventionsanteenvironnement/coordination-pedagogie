/* DDFPT — multi-pages mobile. Sources cliquables. */
let page = "home";   // home | section index
let idx = 0;
const $ = s => document.querySelector(s);
const esc = v => String(v ?? "").replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");

function srcChips(ids) {
  return `<span class="src-chips">${(ids || []).map(id => {
    const s = window.SOURCES[id]; if (!s) return "";
    return `<button class="src-chip" data-src="${esc(id)}">§ ${esc(s.ref)}</button>`;
  }).join("")}</span>`;
}
function render() {
  const home = page === "home";
  $("#hdrBack").style.display = home ? "none" : "flex";
  $("#hdrTitle").textContent = home ? "Le DDFPT" : window.SECTIONS[idx].titre;
  $("#view").innerHTML = home ? viewHome() : viewSection();
  window.scrollTo && window.scrollTo(0, 0);
}
function viewHome() {
  return `
    <div class="lead"><strong>Directeur délégué aux formations professionnelles et technologiques</strong>
      <span>Rôle, missions et responsabilités — d'après les textes officiels (circulaire n°2016-137 et autres). Touche un thème, puis le § pour la source.</span></div>
    <div class="grid">${window.SECTIONS.map((s, i) =>
      `<button class="card" data-go="${i}"><span>${s.icone}</span><strong>${esc(s.titre)}</strong><small>${s.notions.length} point(s)</small></button>`).join("")}</div>`;
}
function viewSection() {
  const s = window.SECTIONS[idx];
  return `
    <h2 class="sec-h">${s.icone} ${esc(s.titre)}</h2>
    <div class="notion-list">${s.notions.map(n => `<article class="notion"><p>${esc(n.t)}</p>${srcChips(n.s)}</article>`).join("")}</div>
    <div class="pager">
      <button class="pgr" data-go="${(idx - 1 + window.SECTIONS.length) % window.SECTIONS.length}">← ${esc(window.SECTIONS[(idx - 1 + window.SECTIONS.length) % window.SECTIONS.length].titre)}</button>
      <button class="pgr" data-go="${(idx + 1) % window.SECTIONS.length}">${esc(window.SECTIONS[(idx + 1) % window.SECTIONS.length].titre)} →</button>
    </div>`;
}
function openSource(id) {
  const s = window.SOURCES[id]; if (!s) return;
  $("#drawer").innerHTML = `<div class="drawer-head"><h3>${esc(s.ref)}</h3><button class="icon" id="closeDrawer">✕</button></div>
    <p class="drawer-origin">${esc(s.origine)}</p>
    <a class="drawer-link" href="${esc(s.url)}" target="_blank" rel="noopener">Lire le texte officiel →</a>`;
  $("#drawer").classList.add("open"); $("#backdrop").classList.add("show");
  $("#closeDrawer").onclick = closeSource;
}
function closeSource() { $("#drawer").classList.remove("open"); $("#backdrop").classList.remove("show"); }

document.addEventListener("click", e => {
  const sc = e.target.closest("[data-src]"); if (sc) return openSource(sc.dataset.src);
  const g = e.target.closest("[data-go]"); if (g) { idx = +g.dataset.go; page = "section"; return render(); }
  if (e.target.closest("#hdrBack")) { page = "home"; return render(); }
  if (e.target.closest("#backdrop")) return closeSource();
});
document.addEventListener("keydown", e => { if (e.key === "Escape") closeSource(); });
render();
