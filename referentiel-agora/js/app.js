/* =====================================================================
   RÉFÉRENTIEL AGOrA — APPLICATION (routeur + vues)
   Hors-ligne, sans dépendance. Fonctionne par simple ouverture du fichier.
   ===================================================================== */
(function () {
  "use strict";
  var R = window.REF;
  var POLE_COLOR = { p1: "ocean", p2: "emeraude", p3: "ambre" };
  var POLE_HEX = { p1: "#0ea5e9", p2: "#10b981", p3: "#f59e0b" };

  /* ----------------------- Icônes (SVG inline) ----------------------- */
  var I = {
    home: '<path d="M3 11l9-8 9 8M5 10v10h14V10"/>',
    layers: '<path d="M12 2l9 5-9 5-9-5 9-5zM3 12l9 5 9-5M3 17l9 5 9-5"/>',
    grid: '<path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h12v17H6a2 2 0 0 0-2 2zM18 3v16"/>',
    clipboard: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/>',
    map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/>',
    scroll: '<path d="M5 4h11v13a3 3 0 0 0 3 3H8a3 3 0 0 1-3-3zM16 4a3 3 0 0 1 3 3v2h-3"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>',
    chevron: '<path d="M6 9l6 6 6-6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/>',
    spark: '<path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4zM18 14l.9 2.3L21 17l-2.1.7L18 20l-.9-2.3L15 17l2.1-.7z"/>',
    doc: '<path d="M6 2h8l4 4v16H6zM14 2v4h4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    print: '<path d="M6 9V3h12v6M6 18H4v-7h16v7h-2M8 14h8v7H8z"/>',
    save: '<path d="M5 3h12l4 4v14H5zM8 3v6h7M8 21v-6h8v6"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"/>',
    link: '<path d="M9 15l6-6M10 6l1-1a4 4 0 0 1 6 6l-1 1M14 18l-1 1a4 4 0 0 1-6-6l1-1"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M21 20a6 6 0 0 0-3.5-5.5"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15 9l-2 5-4 1 2-5z"/>',
    cap: '<path d="M22 9L12 5 2 9l10 4 10-4zM6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/>'
  };
  function svg(path, cls) {
    return '<svg class="' + (cls || "ic") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>';
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  /* ----------------------- Navigation ----------------------- */
  var NAV = [
    { group: "Vue d'ensemble", items: [
      { route: "#/", label: "Accueil", icon: "home" },
      { route: "#/architecture", label: "Architecture du diplôme", icon: "layers" },
      { route: "#/matrice", label: "Matrice de cohérence", icon: "grid" }
    ]},
    { group: "Référentiel des compétences", items: [
      { route: "#/pole/p1", label: "Pôle 1 · Relations clients", icon: "target", dot: "p1" },
      { route: "#/pole/p2", label: "Pôle 2 · Production", icon: "target", dot: "p2" },
      { route: "#/pole/p3", label: "Pôle 3 · Personnel", icon: "target", dot: "p3" },
      { route: "#/savoirs", label: "Savoirs associés", icon: "book" }
    ]},
    { group: "Évaluation & parcours", items: [
      { route: "#/epreuves", label: "Épreuves & unités", icon: "clipboard" },
      { route: "#/pfmp", label: "PFMP", icon: "briefcase" },
      { route: "#/metier", label: "Métier & contexte", icon: "compass" }
    ]},
    { group: "Outils de l'enseignant", items: [
      { route: "#/progression", label: "Progression 2de→Tle", icon: "map" },
      { route: "#/sequence", label: "Constructeur de séquence", icon: "spark" },
      { route: "#/textes", label: "Textes & mises à jour", icon: "scroll" }
    ]}
  ];

  function renderNav() {
    var html = '<div class="brand"><div class="logo">AG</div><div><div class="b-title">AGOrA</div><div class="b-sub">Référentiel de l\'enseignant</div></div></div>';
    NAV.forEach(function (g) {
      html += '<div class="nav-group">' + g.group + '</div>';
      g.items.forEach(function (it) {
        html += '<a class="nav-link" data-route="' + it.route + '" href="' + it.route + '">' +
          svg(I[it.icon], "ic") + '<span>' + it.label + '</span>' +
          (it.dot ? '<span class="dot ' + it.dot + '"></span>' : '') + '</a>';
      });
    });
    html += '<div class="sidebar-foot">Bac pro AGOrA · ' + R.diplome.rncp + '<br>Sources : arrêté du 18/02/2020 consolidé, RNCP, réforme de la voie pro.</div>';
    document.getElementById("sidebar").innerHTML = html;
  }
  function setActiveNav(route) {
    var base = "#/" + (route.split("/")[1] || "");
    document.querySelectorAll(".nav-link").forEach(function (a) {
      var r = a.getAttribute("data-route");
      a.classList.toggle("active", r === route || (r !== "#/" && route.indexOf(r) === 0));
    });
  }

  /* ----------------------- Helpers de rendu ----------------------- */
  function head(crumbs, kicker, title, lead) {
    var bc = crumbs.map(function (c, i) {
      return (c.route ? '<a href="' + c.route + '">' + c.t + '</a>' : '<span>' + c.t + '</span>') + (i < crumbs.length - 1 ? svg('<path d="M9 6l6 6-6 6"/>', "ic") + '' : '');
    }).join(' ');
    return '<div class="page-head">' +
      '<div class="breadcrumb">' + bc + '</div>' +
      (kicker ? '<span class="kicker">' + svg(I.spark, "ic") + kicker + '</span>' : '') +
      '<h1>' + title + '</h1>' +
      (lead ? '<p class="lead">' + lead + '</p>' : '') + '</div>';
  }
  function poleBadges(p) {
    return '<span class="badge u">' + svg(I.book, "ic") + 'Unité ' + p.unite + '</span> ' +
      '<span class="badge e">' + svg(I.clipboard, "ic") + 'Épreuve ' + p.epreuve + '</span> ' +
      '<span class="badge coef">Coef. ' + p.coef + '</span>';
  }

  /* ===================================================================
     VUE — ACCUEIL
     =================================================================== */
  function viewHome() {
    setTheme(null);
    var totals = countTotals();
    var h = '';
    h += '<section class="hero">' +
      '<span class="kicker" style="background:rgba(255,255,255,.12);color:#dfe5ff">' + svg(I.cap, "ic") + 'Baccalauréat professionnel · Niveau 4</span>' +
      '<h1>Assistance à la gestion des organisations et de leurs activités</h1>' +
      '<p>Le référentiel AGOrA réorganisé en instrument de travail : explorez les compétences par de multiples entrées, reliez chaque activité professionnelle à son évaluation, et construisez vos séquences sur une base réglementaire fiable et à jour.</p>' +
      '<div class="hero-stats">' +
        stat(3, "Pôles d'activités") + stat(3, "Blocs · unités pro.") +
        stat(totals.comp, "Compétences") + stat(totals.ind, "Indicateurs") +
        stat("22", "Semaines de PFMP") +
      '</div></section>';

    // Accès rapide
    h += '<div class="section-title"><h2>Par où commencer</h2><span class="line"></span></div>';
    h += '<div class="grid cols-3">' +
      tile("layers", "Comprendre l'architecture", "Pôles → blocs → unités → épreuves, en un schéma.", "#/architecture") +
      tile("spark", "Construire une séquence", "Sélectionnez une activité, obtenez compétences, indicateurs et objectifs.", "#/sequence") +
      tile("grid", "Matrice de cohérence", "Le lien activité ↔ compétence ↔ unité ↔ épreuve.", "#/matrice") +
    '</div>';

    // Les 3 pôles
    h += '<div class="section"><div class="section-title"><h2>Les trois pôles d\'activités</h2><span class="line"></span></div>';
    h += '<p class="section-lead">Chaque pôle d\'activités correspond à un bloc de compétences et à une unité certificative. C\'est l\'ossature du diplôme : tout enseignement professionnel s\'y rattache.</p>';
    h += '<div class="grid cols-3">';
    R.poles.forEach(function (p) {
      var nc = p.activites.length, ncomp = p.activites.reduce(function (a, x) { return a + x.competences.length; }, 0);
      h += '<a class="pole-card" data-c="' + p.couleur + '" href="#/pole/' + p.id + '">' +
        '<div class="top"><div class="pnum">Pôle ' + p.num + '</div><div class="ptitle">' + esc(p.titre) + '</div></div>' +
        '<div class="body">' +
          '<div class="meta-row">' + poleBadges(p) + '</div>' +
          '<div class="mini">' +
            '<div><b>' + nc + '</b><span>activités</span></div>' +
            '<div><b>' + ncomp + '</b><span>compétences</span></div>' +
            '<div><b>' + p.coef + '</b><span>coefficient</span></div>' +
          '</div>' +
        '</div></a>';
    });
    h += '</div></div>';

    // Outils
    h += '<div class="section"><div class="section-title"><h2>Ressources pour préparer vos cours</h2><span class="line"></span></div>';
    h += '<div class="grid cols-4">' +
      tile("book", "Savoirs associés", "Gestion, juridique-éco, communication-numérique.", "#/savoirs") +
      tile("clipboard", "Épreuves & unités", "Modalités, coefficients, CCF et ponctuel.", "#/epreuves") +
      tile("briefcase", "PFMP", "Objectifs, organisation, lien avec les épreuves.", "#/pfmp") +
      tile("map", "Progression 2de→Tle", "Repères de progressivité sur trois ans.", "#/progression") +
    '</div></div>';

    h += '<div class="callout neutral" style="margin-top:30px">' + svg(I.info, "ci") +
      '<p><strong>Mise à jour.</strong> Diplôme enregistré sous <strong>' + R.diplome.rncp + '</strong> (remplace RNCP34606, validité jusqu\'au 31/08/2028). Règlement d\'examen modifié par l\'arrêté du 16 décembre 2024 (session 2026). Réforme de la voie professionnelle prise en compte. <a href="#/textes" style="color:var(--brand);font-weight:700">Voir les textes ›</a></p></div>';
    return h;
  }
  function stat(n, l) { return '<div class="hstat"><div class="n">' + n + '</div><div class="l">' + l + '</div></div>'; }
  function tile(icon, t, d, route) {
    return '<a class="card hover tile" href="' + route + '"><div class="ti">' + svg(I[icon], "ic") + '</div><div><div class="tt">' + t + '</div><div class="td">' + d + '</div></div></a>';
  }
  function countTotals() {
    var comp = 0, ind = 0;
    R.poles.forEach(function (p) { p.activites.forEach(function (a) { comp += a.competences.length; ind += a.indicateurs.length; }); });
    return { comp: comp, ind: ind };
  }

  /* ===================================================================
     VUE — ARCHITECTURE (schéma SVG)
     =================================================================== */
  function viewArchitecture() {
    setTheme(null);
    var h = head([{ t: "Accueil", route: "#/" }, { t: "Architecture" }], "Vue d'ensemble", "Architecture du diplôme",
      "Le bac pro AGOrA est bâti sur une correspondance stricte : à chaque pôle d'activités professionnelles répond un bloc de compétences, une unité et une épreuve. Comprendre ce miroir, c'est savoir où mène chaque enseignement.");

    h += '<div class="card" style="padding:14px">' + archSVG() + '</div>';

    h += '<div class="section"><div class="section-title"><h2>Lecture du schéma</h2><span class="line"></span></div>';
    h += '<div class="grid cols-3">';
    R.poles.forEach(function (p) {
      h += '<div class="card hover" style="border-top:4px solid ' + POLE_HEX[p.id] + '">' +
        '<span class="badge p' + p.num + '">Pôle ' + p.num + '</span>' +
        '<h3 style="margin-top:10px">' + esc(p.titre) + '</h3>' +
        '<div class="meta-row" style="display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 12px">' + poleBadges(p) + '</div>' +
        '<p style="font-size:13.5px">' + esc(p.evaluation) + '</p>' +
        '<a class="btn ghost sm" href="#/pole/' + p.id + '">Ouvrir le pôle ' + svg(I.arrow, "ic") + '</a>' +
      '</div>';
    });
    h += '</div></div>';

    h += '<div class="section"><div class="section-title"><h2>L\'épreuve E3 et les unités générales</h2><span class="line"></span></div>';
    h += '<div class="callout">' + svg(I.info, "ci") + '<p>' + esc(R.epreuves.remarqueE3) + '</p></div>';
    h += '<p class="section-lead">Au-delà des unités professionnelles (U2, U31, U32), le diplôme comporte des unités d\'enseignement général (français, mathématiques, langues vivantes, histoire-géographie-EMC, arts appliqués, EPS, économie-droit, PSE) et des unités facultatives.</p>';
    h += '<div class="def-wrap card">';
    R.epreuves.unitesTableau.forEach(function (u) {
      h += '<dl class="def"><dt>' + u.u + '</dt><dd>' + esc(u.lib) + '</dd></dl>';
    });
    h += '</div></div>';
    return h;
  }

  function archSVG() {
    // Schéma à 4 colonnes : Pôles -> Blocs -> Unités -> Épreuves
    var rows = [
      { p: "Pôle 1", pc: "#0ea5e9", b: "Bloc 1 · Gérer les relations clients", u: "U31", e: "E31 · coef 4", t: "Oral & pratique 45 min / CCF" },
      { p: "Pôle 2", pc: "#10b981", b: "Bloc 2 · Organiser & suivre la production", u: "U2", e: "E2 · coef 4", t: "Écrit 3 h 30 / CCF" },
      { p: "Pôle 3", pc: "#f59e0b", b: "Bloc 3 · Administrer le personnel", u: "U32", e: "E32 · coef 3", t: "Oral 30 min / CCF" }
    ];
    var W = 980, rh = 104, top = 56, pad = 20;
    var H = top + rows.length * rh + 10;
    var colX = [30, 250, 520, 700];
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="min-width:680px" font-family="Inter, sans-serif">';
    // headers
    var heads = [["ACTIVITÉS", 30], ["COMPÉTENCES", 250], ["UNITÉ", 520], ["ÉPREUVE", 700]];
    heads.forEach(function (hd) {
      s += '<text x="' + (hd[1] + 6) + '" y="30" font-size="12" font-weight="800" fill="#6b7793" letter-spacing="1.5">' + hd[0] + '</text>';
    });
    rows.forEach(function (r, i) {
      var y = top + i * rh;
      var cy = y + 36;
      // connecting lines
      s += '<path d="M' + (colX[0] + 200) + ' ' + cy + ' H' + colX[1] + '" stroke="' + r.pc + '" stroke-width="2" opacity=".5"/>';
      s += '<path d="M' + (colX[1] + 250) + ' ' + cy + ' H' + colX[2] + '" stroke="' + r.pc + '" stroke-width="2" opacity=".5"/>';
      s += '<path d="M' + (colX[2] + 150) + ' ' + cy + ' H' + colX[3] + '" stroke="' + r.pc + '" stroke-width="2" opacity=".5"/>';
      // pole box
      s += box(colX[0], y, 200, 72, r.pc, "#fff", r.p, null, true);
      // bloc box
      s += box(colX[1], y, 250, 72, "#fff", r.pc, r.b, null, false, r.pc);
      // unit pill
      s += '<rect x="' + colX[2] + '" y="' + (y + 16) + '" width="150" height="40" rx="11" fill="#eef2ff" stroke="#c7d2fe"/>' +
        '<text x="' + (colX[2] + 75) + '" y="' + (y + 41) + '" text-anchor="middle" font-size="16" font-weight="800" fill="#3730a3">' + r.u + '</text>';
      // épreuve box
      s += '<rect x="' + colX[3] + '" y="' + (y + 8) + '" width="250" height="58" rx="12" fill="' + r.pc + '" opacity=".12"/>' +
        '<rect x="' + colX[3] + '" y="' + (y + 8) + '" width="250" height="58" rx="12" fill="none" stroke="' + r.pc + '"/>' +
        '<text x="' + (colX[3] + 16) + '" y="' + (y + 32) + '" font-size="14" font-weight="800" fill="' + darken(r.pc) + '">' + r.e + '</text>' +
        '<text x="' + (colX[3] + 16) + '" y="' + (y + 50) + '" font-size="11" fill="#64708f">' + esc(r.t) + '</text>';
    });
    s += '</svg>';
    return s;
  }
  function box(x, y, w, h, fill, stroke, t1, t2, white, txtColor) {
    var tc = txtColor || (white ? "#fff" : "#141b2e");
    var o = '<rect x="' + x + '" y="' + (y + 6) + '" width="' + w + '" height="' + (h - 4) + '" rx="13" fill="' + fill + '"' + (white ? '' : ' stroke="' + stroke + '"') + '/>';
    // wrap text into up to 2 lines
    var words = t1.split(" "), lines = [], cur = "";
    var max = white ? 16 : 26;
    words.forEach(function (wd) { if ((cur + " " + wd).trim().length > max) { lines.push(cur.trim()); cur = wd; } else cur += " " + wd; });
    if (cur.trim()) lines.push(cur.trim());
    var startY = y + 6 + (h - 4) / 2 - (lines.length - 1) * 9 + 4;
    lines.forEach(function (ln, idx) {
      o += '<text x="' + (x + w / 2) + '" y="' + (startY + idx * 18) + '" text-anchor="middle" font-size="' + (white ? 15 : 13) + '" font-weight="' + (white ? 800 : 700) + '" fill="' + tc + '">' + ln + '</text>';
    });
    return o;
  }
  function darken(hex) {
    var map = { "#0ea5e9": "#0b3a66", "#10b981": "#064e3b", "#f59e0b": "#7c3a06" };
    return map[hex] || "#141b2e";
  }

  /* ===================================================================
     VUE — PÔLE
     =================================================================== */
  function viewPole(id) {
    var p = R.poles.find(function (x) { return x.id === id; });
    if (!p) return viewHome();
    setTheme(p.couleur);
    var h = head(
      [{ t: "Accueil", route: "#/" }, { t: "Pôles", route: "#/architecture" }, { t: "Pôle " + p.num }],
      "Pôle " + p.num + " · Bloc " + p.num, p.titre, null);

    h += '<div class="flex wrap" style="gap:8px;margin:-8px 0 18px">' + poleBadges(p) +
      '<span class="badge accent">' + p.blocRncp + '</span>' +
      '<span class="badge">' + svg(I.clipboard, "ic") + esc(p.evaluation) + '</span></div>';

    h += '<div class="card" style="border-left:4px solid var(--accent)"><p style="margin:0;color:var(--ink-2)">' + esc(p.presentation) + '</p></div>';

    // Conditions de mobilisation
    h += '<div class="callout" style="margin-top:18px">' + svg(I.info, "ci") + '<p><strong>Conditions d\'exercice et de mobilisation.</strong> ' + esc(p.conditionsMobilisation) + '</p></div>';

    // Schéma compétences -> indicateurs (flux du pôle)
    h += '<div class="section"><div class="section-title"><h2>Activités, compétences et indicateurs</h2><span class="line"></span></div>';
    h += '<p class="section-lead">Déroulez chaque activité professionnelle pour visualiser, en vis-à-vis, les <strong>compétences visées</strong> (objectifs terminaux) et les <strong>indicateurs d\'évaluation</strong> (critères de réussite réglementaires). C\'est la matière première de vos fiches de séquence.</p>';

    p.activites.forEach(function (a, i) {
      h += '<div class="acc' + (i === 0 ? ' open' : '') + '" data-acc>' +
        '<div class="acc-head" data-acc-head>' +
          '<span class="acc-code">' + a.code + '</span>' +
          '<span class="acc-title">' + esc(a.titre) + '</span>' +
          svg(I.chevron, "acc-chev") +
        '</div>' +
        '<div class="acc-body">' +
          '<div class="task-chips">' + a.taches.map(function (t) { return '<span class="tc">' + esc(t) + '</span>'; }).join("") + '</div>' +
          '<div class="cols3">' +
            '<div class="col-block"><h4>' + svg(I.target, "ic") + 'Compétences visées</h4><ul class="chk-list comp-list">' +
              a.competences.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join("") + '</ul></div>' +
            '<div class="col-block"><h4>' + svg(I.check, "ic") + 'Indicateurs d\'évaluation</h4><ul class="chk-list ind-list">' +
              a.indicateurs.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join("") + '</ul></div>' +
          '</div>' +
          '<div class="btn-row" style="margin-top:16px"><a class="btn ghost sm" href="#/sequence?pole=' + p.id + '&act=' + encodeURIComponent(a.code) + '">' + svg(I.spark, "ic") + 'Bâtir une séquence sur cette activité</a></div>' +
        '</div></div>';
    });
    h += '</div>';

    // Savoirs associés du pôle
    h += '<div class="section"><div class="section-title"><h2>Savoirs associés mobilisés</h2><span class="line"></span></div>';
    h += '<div class="grid cols-3">';
    (R.savoirs[p.id] || []).forEach(function (s) {
      h += '<div class="card hover"><h4 style="color:var(--accent-2);font-size:14px;text-transform:uppercase;letter-spacing:.04em">' + esc(s.famille) + '</h4>' +
        (s.sousTitre ? '<p class="muted" style="font-size:12px;margin:-4px 0 8px">' + esc(s.sousTitre) + '</p>' : '') +
        '<ul class="chk-list">' + s.themes.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join("") + '</ul></div>';
    });
    h += '</div><div class="btn-row" style="margin-top:14px"><a class="btn ghost sm" href="#/savoirs">' + svg(I.book, "ic") + 'Voir le détail des savoirs et indications complémentaires</a></div></div>';

    // Conditions matérielles + liaisons + résultats
    h += '<div class="section"><div class="grid cols-2">';
    h += '<div class="card"><h3>' + svg(I.briefcase, "ic") + ' Moyens et ressources</h3>' +
      '<h4 style="font-size:12.5px;text-transform:uppercase;color:var(--ink-3);margin-top:12px">Données et informations</h4><ul class="chk-list">' +
      p.moyens.donnees.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join("") + '</ul>' +
      '<h4 style="font-size:12.5px;text-transform:uppercase;color:var(--ink-3);margin-top:14px">Équipements et logiciels</h4><ul class="chk-list">' +
      p.moyens.equipements.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join("") + '</ul></div>';
    h += '<div><div class="card" style="margin-bottom:18px"><h3>' + svg(I.users, "ic") + ' Liaisons fonctionnelles</h3>' +
      '<p style="font-size:13.5px"><strong>Relations internes —</strong> ' + esc(p.liaisons.internes) + '</p>' +
      '<p style="font-size:13.5px;margin-bottom:0"><strong>Relations externes —</strong></p><ul class="chk-list">' +
      p.liaisons.externes.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join("") + '</ul></div>' +
      '<div class="card"><h3>' + svg(I.flag, "ic") + ' Résultats attendus</h3><ul class="chk-list">' +
      p.resultats.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join("") + '</ul></div></div>';
    h += '</div></div>';

    // Navigation pôles
    h += poleNavFooter(p);
    return h;
  }
  function poleNavFooter(p) {
    var others = R.poles.filter(function (x) { return x.id !== p.id; });
    var h = '<div class="section"><div class="grid cols-2">';
    others.forEach(function (o) {
      h += '<a class="card hover" href="#/pole/' + o.id + '" style="border-left:4px solid ' + POLE_HEX[o.id] + '"><small>Pôle ' + o.num + '</small><div style="font-weight:700;margin-top:4px">' + esc(o.titre) + '</div></a>';
    });
    h += '</div></div>';
    return h;
  }

  /* ===================================================================
     VUE — SAVOIRS ASSOCIÉS
     =================================================================== */
  function viewSavoirs() {
    setTheme(null);
    var h = head([{ t: "Accueil", route: "#/" }, { t: "Savoirs associés" }], "Référentiel", "Savoirs associés",
      "Les savoirs associés sont organisés en trois familles transversales — savoirs de gestion, savoirs juridiques et économiques, savoirs liés à la communication et au numérique — déclinées dans chacun des trois pôles. Les indications complémentaires précisent le niveau d\'exigence attendu.");

    R.poles.forEach(function (p) {
      h += '<div class="section"><div class="section-title"><span class="badge p' + p.num + '">Pôle ' + p.num + '</span><h2 style="font-size:18px">' + esc(p.titre) + '</h2><span class="line"></span></div>';
      (R.savoirs[p.id] || []).forEach(function (s) {
        h += '<div class="card" style="margin-bottom:16px;border-left:4px solid ' + POLE_HEX[p.id] + '">' +
          '<h3 style="font-size:16px">' + esc(s.famille) + '</h3>' +
          (s.sousTitre ? '<p class="muted" style="font-size:12.5px;margin:-6px 0 10px">' + esc(s.sousTitre) + '</p>' : '') +
          '<div class="task-chips" style="margin-bottom:12px">' + s.themes.map(function (t) { return '<span class="tc">' + esc(t) + '</span>'; }).join("") + '</div>' +
          '<p style="font-size:13.5px;margin:0;color:var(--ink-2)"><strong>Indications complémentaires — </strong>' + esc(s.indications) + '</p></div>';
      });
      h += '</div>';
    });
    return h;
  }

  /* ===================================================================
     VUE — MATRICE
     =================================================================== */
  function viewMatrice() {
    setTheme(null);
    var h = head([{ t: "Accueil", route: "#/" }, { t: "Matrice de cohérence" }], "Vue d'ensemble", "Matrice activités ↔ compétences ↔ unités ↔ épreuves",
      "La colonne vertébrale du diplôme : chaque sous-activité professionnelle, les compétences qui s\'y rattachent, et l\'unité / l\'épreuve qui les certifie. Cliquez sur un pôle pour l\'explorer en détail.");

    h += '<div class="table-wrap"><table class="matrix"><thead><tr>' +
      '<th>Pôle / Activité</th><th>Compétences associées</th><th>Unité</th><th>Épreuve</th></tr></thead><tbody>';
    R.poles.forEach(function (p) {
      p.activites.forEach(function (a, idx) {
        h += '<tr>' +
          '<td class="pcell"><span class="swatch" style="background:' + POLE_HEX[p.id] + '"></span>' +
            (idx === 0 ? '<a href="#/pole/' + p.id + '" style="color:' + darken(POLE_HEX[p.id]) + '">Pôle ' + p.num + '</a> · ' : '') +
            '<strong>' + a.code + '</strong> ' + esc(a.titre) + '</td>' +
          '<td><ul style="margin:0;padding-left:16px">' + a.competences.map(function (c) { return '<li style="margin-bottom:3px">' + esc(c) + '</li>'; }).join("") + '</ul></td>' +
          '<td><span class="badge u">' + p.unite + '</span></td>' +
          '<td><span class="badge e">' + p.epreuve + '</span><br><small>coef ' + p.coef + '</small></td>' +
        '</tr>';
      });
    });
    h += '</tbody></table></div>';

    h += '<div class="callout neutral" style="margin-top:20px">' + svg(I.link, "ci") + '<p>Lecture : une <strong>sous-activité</strong> (ex. 1.2) regroupe des <strong>tâches</strong> ; à ces tâches répondent des <strong>compétences</strong> évaluées via des <strong>indicateurs</strong> ; l\'ensemble du pôle est certifié par <strong>une unité</strong> et <strong>une épreuve</strong>. Aucune compétence n\'existe « hors-sol » : elle prend toujours sens dans une activité professionnelle.</p></div>';
    return h;
  }

  /* ===================================================================
     VUE — ÉPREUVES
     =================================================================== */
  function viewEpreuves() {
    setTheme(null);
    var h = head([{ t: "Accueil", route: "#/" }, { t: "Épreuves & unités" }], "Évaluation", "Épreuves et unités certificatives",
      "Le référentiel d\'évaluation précise, pour chaque unité professionnelle, la forme de l\'épreuve, ses finalités, ses critères et ses modalités (contrôle en cours de formation ou ponctuel). Les indicateurs d\'évaluation des blocs constituent la base des grilles.");

    // Poids des coefficients (diagramme)
    h += '<div class="section-title"><h2>Poids des épreuves professionnelles</h2><span class="line"></span></div>';
    h += '<div class="card">' + coefDiagram() + '</div>';

    // Détail des épreuves professionnelles
    h += '<div class="section"><div class="section-title"><h2>Épreuves professionnelles</h2><span class="line"></span></div>';
    R.epreuves.professionnelles.forEach(function (e) {
      var accent = e.pole ? POLE_HEX[e.pole] : "#4f46e5";
      h += '<div class="card" style="margin-bottom:18px;border-top:4px solid ' + accent + '">' +
        '<div class="flex between wrap" style="gap:10px">' +
          '<div><span class="badge e">' + e.code + '</span> <span class="badge u">' + e.unite + '</span> <span class="badge coef">Coefficient ' + e.coef + '</span></div>' +
          '<span class="badge">' + esc(e.forme) + '</span>' +
        '</div>' +
        '<h3 style="margin-top:12px">' + esc(e.intitule) + '</h3>' +
        '<dl class="def"><dt>Finalités</dt><dd>' + esc(e.finalites) + '</dd></dl>' +
        '<dl class="def"><dt>Critères d\'évaluation</dt><dd>' + esc(e.criteres) + '</dd></dl>';
      e.modalites.forEach(function (m) {
        h += '<dl class="def"><dt>' + esc(m.sous) + '</dt><dd>' + esc(m.texte) + '</dd></dl>';
      });
      if (e.pole) h += '<div class="btn-row" style="margin-top:12px"><a class="btn ghost sm" href="#/pole/' + e.pole + '">Voir le pôle et ses indicateurs ' + svg(I.arrow, "ic") + '</a></div>';
      h += '</div>';
    });
    h += '<div class="callout">' + svg(I.info, "ci") + '<p>' + esc(R.epreuves.remarqueE3) + '</p></div></div>';

    // Épreuves générales
    h += '<div class="section"><div class="section-title"><h2>Épreuves d\'enseignement général</h2><span class="line"></span></div>';
    h += '<div class="table-wrap"><table class="matrix"><thead><tr><th>Épreuve</th><th>Unité</th><th>Intitulé</th><th>Coef.</th><th>Forme</th></tr></thead><tbody>';
    R.epreuves.generales.forEach(function (e) {
      h += '<tr><td class="pcell">' + e.code + '</td><td><span class="badge u">' + e.unite + '</span></td><td>' + esc(e.intitule) + '</td><td>' + e.coef + '</td><td><small>' + esc(e.forme) + '</small></td></tr>';
    });
    h += '</tbody></table></div>';
    h += '<div class="callout warn" style="margin-top:16px">' + svg(I.info, "ci") + '<p><strong>Épreuves facultatives — </strong>' + esc(R.epreuves.facultatives) + '</p></div>';
    h += '<div class="callout neutral">' + svg(I.info, "ci") + '<p>' + esc(R.epreuves.noteReforme) + '</p></div></div>';
    return h;
  }
  function coefDiagram() {
    var data = [
      { l: "E31 · Relations clients (U31)", c: 4, col: "#0ea5e9" },
      { l: "E2 · Organisation & production (U2)", c: 4, col: "#10b981" },
      { l: "E32 · Administration du personnel (U32)", c: 3, col: "#f59e0b" },
      { l: "E33 · Prévention-santé-environnement (U33)", c: 1, col: "#7c3aed" }
    ];
    var max = 4;
    var h = '';
    data.forEach(function (d) {
      var w = Math.round((d.c / max) * 100);
      h += '<div class="coefbar"><div class="lab">' + esc(d.l) + '</div>' +
        '<div class="track"><div class="fill" style="width:' + w + '%;background:linear-gradient(90deg,' + d.col + ',' + darken(d.col) + ')">coef ' + d.c + '</div></div></div>';
    });
    h += '<p class="muted" style="font-size:12.5px;margin:12px 0 0">L\'épreuve E3 « Pratiques professionnelles d\'assistance à la gestion des organisations » totalise un coefficient 8 (E31 + E32 + E33). Avec l\'épreuve E2 (coef. 4), le cœur professionnel pèse fortement dans la certification.</p>';
    return h;
  }

  /* ===================================================================
     VUE — PFMP
     =================================================================== */
  function viewPFMP() {
    setTheme(null);
    var h = head([{ t: "Accueil", route: "#/" }, { t: "PFMP" }], "Parcours", "Périodes de formation en milieu professionnel",
      "Les PFMP sont des moments privilégiés d\'acquisition de compétences en situation réelle. Elles alimentent directement les dossiers professionnels supports des épreuves E31 et E32.");

    h += '<div class="grid cols-3" style="margin-bottom:20px">' +
      miniStat("22", "semaines (voie scolaire)", "ocean") +
      miniStat("16", "semaines (cycle en 2 ans)", "emeraude") +
      miniStat("10", "semaines (positionnement)", "ambre") + '</div>';

    h += '<div class="callout neutral">' + svg(I.info, "ci") + '<p>' + esc(R.pfmp.dureeArrete) + '</p></div>';
    h += '<div class="callout warn">' + svg(I.info, "ci") + '<p><strong>Réforme — </strong>' + esc(R.pfmp.noteReforme) + '</p></div>';

    h += card2("Objectifs des PFMP", "flag", R.pfmp.objectifs);
    h += '<div class="section"><div class="grid cols-2">' +
      cardList("Engagement pédagogique des partenaires", "users", R.pfmp.engagement) +
      cardList("Organisation et suivi", "clipboard", R.pfmp.organisation) +
    '</div></div>';
    h += '<div class="section"><div class="grid cols-2">' +
      cardList("Positionnement et cas particuliers", "compass", R.pfmp.positionnement) +
      '<div class="card" style="border-left:4px solid var(--brand)"><h3>' + svg(I.link, "ic") + ' Lien avec les épreuves</h3><p style="font-size:14px;margin-bottom:0">' + esc(R.pfmp.lienEpreuves) + '</p></div>' +
    '</div></div>';
    return h;
  }
  function miniStat(n, l, c) {
    return '<div class="card" style="text-align:center;border-top:4px solid var(--' + c + ')"><div style="font-size:34px;font-weight:800;color:var(--' + c + ')">' + n + '</div><div class="muted" style="font-size:13px">' + l + '</div></div>';
  }
  function card2(title, icon, arr) {
    return '<div class="section"><div class="card"><h3>' + svg(I[icon], "ic") + ' ' + title + '</h3><ul class="chk-list">' + arr.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ul></div></div>';
  }
  function cardList(title, icon, arr) {
    return '<div class="card"><h3>' + svg(I[icon], "ic") + ' ' + title + '</h3><ul class="chk-list">' + arr.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ul></div>';
  }

  /* ===================================================================
     VUE — MÉTIER & CONTEXTE
     =================================================================== */
  function viewMetier() {
    setTheme(null);
    var m = R.metier;
    var h = head([{ t: "Accueil", route: "#/" }, { t: "Métier & contexte" }], "Référentiel des activités professionnelles", "Le métier et son contexte",
      "Comprendre l\'emploi visé, ses contextes d\'exercice et ses exigences, c\'est donner du sens aux situations professionnelles que vous construirez en classe.");

    h += '<div class="card" style="border-left:4px solid var(--brand)"><h3>Mission globale</h3><p style="margin-bottom:0">' + esc(m.missionGlobale) + '</p></div>';

    h += '<div class="section"><div class="grid cols-2">';
    m.dimensions.forEach(function (d) {
      h += '<div class="card"><h3>' + esc(d.titre) + '</h3><p style="margin-bottom:0;font-size:14px">' + esc(d.texte) + '</p></div>';
    });
    h += '</div></div>';

    h += card2("Une professionnalité à trois facettes", "spark", m.professionnalite);

    h += '<div class="section"><div class="grid cols-2">' +
      '<div class="card"><h3>' + svg(I.briefcase, "ic") + ' Emplois concernés</h3>' +
        '<div class="task-chips">' + m.emplois.map(function (e) { return '<span class="tc">' + esc(e) + '</span>'; }).join("") + '</div>' +
        '<h4 style="font-size:12.5px;text-transform:uppercase;color:var(--ink-3);margin-top:14px">Selon les contextes et secteurs</h4>' +
        '<div class="task-chips">' + m.emploisSpecifiques.map(function (e) { return '<span class="tc">' + esc(e) + '</span>'; }).join("") + '</div>' +
        '<h4 style="font-size:12.5px;text-transform:uppercase;color:var(--ink-3);margin-top:14px">Codes ROME</h4><ul class="chk-list">' + m.rome.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join("") + '</ul></div>' +
      '<div class="card"><h3>' + svg(I.map, "ic") + ' Types d\'organisations & place</h3><p style="font-size:14px">' + esc(m.organisations) + '</p><p style="font-size:14px;margin-bottom:0">' + esc(m.placeOrganisation) + '</p></div>' +
    '</div></div>';

    h += '<div class="section"><div class="section-title"><h2>Conditions générales d\'exercice</h2><span class="line"></span></div><div class="grid cols-2">';
    m.conditions.forEach(function (c) {
      h += '<div class="card"><h3 style="font-size:16px">' + esc(c.titre) + '</h3><p style="font-size:13.5px;margin-bottom:0">' + esc(c.texte) + '</p></div>';
    });
    h += '</div></div>';

    h += '<div class="callout">' + svg(I.arrow, "ci") + '<p><strong>Évolutions de l\'emploi — </strong>' + esc(m.evolutions) + '</p></div>';
    return h;
  }

  /* ===================================================================
     VUE — PROGRESSION
     =================================================================== */
  function viewProgression() {
    setTheme(null);
    var ped = R.pedagogie;
    var h = head([{ t: "Accueil", route: "#/" }, { t: "Progression 2de→Tle" }], "Outil de l'enseignant", "Repères de progressivité sur trois ans",
      "Une proposition d\'organisation des apprentissages, du général au complexe, dans une logique spiralaire — pour situer chaque activité dans le cycle de formation.");

    h += '<div class="callout warn">' + svg(I.info, "ci") + '<p>' + esc(ped.avertissement) + '</p></div>';

    h += '<div class="section"><div class="timeline">';
    ped.progression.forEach(function (a) {
      var domin = a.dominantes.map(function (d) {
        var p = R.poles.find(function (x) { return x.id === d; });
        return '<span class="badge p' + p.num + '" style="margin-right:6px">Pôle ' + p.num + '</span>';
      }).join("");
      h += '<div class="tl-item" data-c="' + POLE_COLOR[a.dominantes[0]] + '">' +
        '<div class="tl-year">' + esc(a.annee) + '</div>' +
        '<div class="tl-visee">' + esc(a.visee) + '</div>' +
        '<div style="margin-bottom:10px">' + domin + '</div>' +
        '<div class="card"><ul class="chk-list">' + a.reperes.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join("") + '</ul></div>' +
      '</div>';
    });
    h += '</div></div>';

    // Chaîne d'ingénierie
    h += '<div class="section"><div class="section-title"><h2>De la compétence à l\'objectif opérationnel</h2><span class="line"></span></div>';
    h += '<p class="section-lead">La logique descendante qui relie le référentiel à votre fiche de séance. Chaque maillon découle du précédent : c\'est ce qui garantit la cohérence didactique et la conformité à l\'évaluation certificative.</p>';
    h += '<div class="chain">';
    ped.ingenierie.chaine.forEach(function (s, i) {
      h += '<div class="chain-step"><div class="num">' + (i + 1) + '</div><div><h4>' + esc(s.etape) + '</h4><p>' + esc(s.desc) + '</p></div></div>';
      if (i < ped.ingenierie.chaine.length - 1) h += '<div class="chain-arrow">' + svg('<path d="M12 5v14M6 13l6 6 6-6"/>', "ic") + '</div>';
    });
    h += '</div></div>';

    // Trames fiches
    h += '<div class="section"><div class="grid cols-2">' +
      '<div class="card"><h3>' + svg(I.doc, "ic") + ' Trame — fiche de séquence</h3><ul class="list-clean">' +
        ped.ingenierie.fiches.sequence.map(function (x) { return '<li><span class="li-ic">' + svg(I.check, "ic") + '</span>' + esc(x) + '</li>'; }).join("") + '</ul></div>' +
      '<div class="card"><h3>' + svg(I.doc, "ic") + ' Trame — fiche de séance</h3><ul class="list-clean">' +
        ped.ingenierie.fiches.seance.map(function (x) { return '<li><span class="li-ic">' + svg(I.check, "ic") + '</span>' + esc(x) + '</li>'; }).join("") + '</ul></div>' +
    '</div>';
    h += '<div class="btn-row" style="margin-top:18px"><a class="btn primary" href="#/sequence">' + svg(I.spark, "ic") + 'Ouvrir le constructeur de séquence</a></div></div>';
    return h;
  }

  /* ===================================================================
     VUE — CONSTRUCTEUR DE SÉQUENCE
     =================================================================== */
  var BUILD = { type: "sequence", pole: "p1", act: null, comps: [], outils: [], meta: {} };
  function viewSequence(params) {
    setTheme(null);
    if (params.pole && R.poles.find(function (x) { return x.id === params.pole; })) BUILD.pole = params.pole;
    if (params.act) { BUILD.act = decodeURIComponent(params.act); }
    var h = head([{ t: "Accueil", route: "#/" }, { t: "Constructeur de fiche" }], "Outil de l'enseignant", "Constructeur de fiche de séquence et de séance",
      "Choisissez un pôle, une activité professionnelle et les compétences à travailler. L\'outil mobilise le référentiel pour générer les indicateurs (critères de réussite), les savoirs associés et des objectifs opérationnels mesurables (« l\'élève est capable de… »). Complétez le cadre, puis imprimez ou exportez en PDF.");

    h += '<div class="builder">' +
      '<div class="builder-panel no-print" id="builderPanel"></div>' +
      '<div id="fichePreview"></div>' +
    '</div>';
    setTimeout(function () { renderBuilderPanel(); renderFiche(); }, 0);
    return h;
  }

  function fInput(label, id, val, ph) {
    return '<div class="field"><label>' + label + '</label><input id="' + id + '" type="text" placeholder="' + esc(ph || "") + '" value="' + esc(val || "") + '"></div>';
  }
  function fTextarea(label, id, val, ph) {
    return '<div class="field"><label>' + label + '</label><textarea id="' + id + '" placeholder="' + esc(ph || "") + '">' + esc(val || "") + '</textarea></div>';
  }
  function fSelect(label, id, opts) {
    return '<div class="field"><label>' + label + '</label><select id="' + id + '">' +
      opts.map(function (o) { return '<option value="' + esc(o.v) + '"' + (o.sel ? ' selected' : '') + '>' + esc(o.t) + '</option>'; }).join("") + '</select></div>';
  }

  function renderBuilderPanel() {
    var p = R.poles.find(function (x) { return x.id === BUILD.pole; });
    var el = document.getElementById("builderPanel");
    if (!el) return;
    var act = p.activites.find(function (a) { return a.code === BUILD.act; }) || p.activites[0];
    BUILD.act = act.code;
    var m = BUILD.meta;
    var isSeq = BUILD.type !== "seance";
    var html = '<div class="card">';

    // Type de fiche
    html += '<div class="seg">' +
      '<button data-type="sequence" class="' + (isSeq ? "on" : "") + '">' + svg(I.layers, "ic") + 'Séquence</button>' +
      '<button data-type="seance" class="' + (!isSeq ? "on" : "") + '">' + svg(I.doc, "ic") + 'Séance</button></div>';

    html += fSelect("Pôle d'activités", "selPole", R.poles.map(function (x) { return { v: x.id, t: "Pôle " + x.num + " — " + x.titre, sel: x.id === BUILD.pole }; }));
    html += fSelect("Activité professionnelle support", "selAct", p.activites.map(function (a) { return { v: a.code, t: a.code + " — " + a.titre, sel: a.code === BUILD.act }; }));

    var compLabel = isSeq ? "Compétences à travailler" : "Compétence(s) ciblée(s)";
    html += '<div class="field"><label>' + compLabel + '</label><div class="comp-pick" id="compPick">' +
      act.competences.map(function (c, i) {
        var checked = BUILD.comps.indexOf(c) >= 0;
        return '<label><input type="checkbox" value="' + i + '"' + (checked ? ' checked' : '') + '><span>' + esc(c) + '</span></label>';
      }).join("") + '</div><small>' + (isSeq ? "1 à 2 compétences par séquence suffisent généralement." : "Sélectionnez la compétence centrale de la séance.") + '</small></div>';

    html += fInput("Titre de la " + (isSeq ? "séquence" : "séance"), "mTitre", m.titre, isSeq ? "Ex. Accueillir et traiter la demande d'un usager" : "Ex. Répondre à une demande d'information par courriel");
    html += fSelect("Niveau / classe", "mNiveau", ["", "Seconde professionnelle", "Première professionnelle", "Terminale professionnelle"].map(function (n) { return { v: n, t: n || "—", sel: m.niveau === n }; }));

    if (isSeq) {
      html += fInput("Place dans la progression — nombre de séances", "mNbSeances", m.nbSeances, "Ex. 5 séances");
      html += fInput("Durée estimée", "mDuree", m.duree, "Ex. 5 × 2 h");
      html += fTextarea("Contexte professionnel / scénario", "mContexte", m.contexte, "Organisation (association, mairie, PME, structure médico-sociale…) et cadre de la mission.");
      html += fTextarea("Problématique professionnelle", "mProblematique", m.problematique, "Ex. Comment traiter une demande d'usager dans le respect des procédures et de la confidentialité ?");
      html += fTextarea("Situation professionnelle de départ", "mSituation", m.situation, "Ex. un courriel d'usager, un appel, une réclamation, une facture à suivre…");
      html += fTextarea("Productions attendues des élèves", "mProductions", m.productions, "Ex. courriel professionnel, compte rendu, tableau de suivi, planning, fiche usager…");
    } else {
      html += fInput("Place dans la séquence", "mPlace", m.place, "Ex. Séance 2 sur 5");
      html += fInput("Durée de la séance", "mDuree", m.duree, "Ex. 2 h");
      html += fTextarea("Situation déclenchante", "mSituation", m.situation, "Ex. un courriel d'usager demandant une information.");
      html += fTextarea("Objectif opérationnel (vide = proposition automatique)", "mObjectif", m.objectif, "À la fin de la séance, l'élève est capable de…");
      html += fTextarea("Supports", "mSupports", m.supports, "Ex. courriel reçu, fiche procédure, organigramme, charte d'accueil, modèle, grille d'évaluation.");
      html += fTextarea("Déroulement (une phase par ligne)", "mDeroulement", m.deroulement, "Découverte de la situation · Identification de la demande · Recherche des informations · Réalisation · Relecture avec la grille");
      html += fTextarea("Différenciation", "mDifferenciation", m.differenciation, "Ex. modèle à compléter, banque de formules, aide lexicale, binômes, version numérique accessible.");
      html += fTextarea("Trace écrite", "mTrace", m.trace, "Les règles à retenir (synthèse de la séance).");
      html += fTextarea("Modalités d'évaluation", "mEvaluation", m.evaluation, "Grille : réponse adaptée, respect des procédures, clarté, orthographe, présentation, confidentialité.");
    }

    // Outils numériques (proposés depuis le référentiel — moyens du pôle)
    html += '<div class="field"><label>Outils numériques mobilisés</label><div class="chk-grid" id="outilsPick">' +
      p.moyens.equipements.map(function (e, i) {
        var ck = BUILD.outils.indexOf(e) >= 0;
        return '<label><input type="checkbox" value="' + i + '"' + (ck ? ' checked' : '') + '><span>' + esc(e) + '</span></label>';
      }).join("") + '</div></div>';

    html += '<div class="btn-row"><button class="btn primary" id="btnPrint">' + svg(I.print, "ic") + 'Imprimer / PDF</button>' +
      '<button class="btn ghost" id="btnSave">' + svg(I.save, "ic") + 'Enregistrer</button></div>';
    html += '<div class="btn-row" style="margin-top:10px"><button class="btn ghost sm" id="btnReset">' + svg(I.trash, "ic") + 'Réinitialiser</button></div>';
    html += '</div>';

    var saved = loadSaved();
    if (saved.length) {
      html += '<div class="card" style="margin-top:16px"><h4 style="font-size:13px;text-transform:uppercase;color:var(--ink-3)">Fiches enregistrées</h4><ul class="list-clean">' +
        saved.map(function (s, i) {
          var tag = (s.type === "seance" ? "Séance" : "Séquence");
          return '<li style="justify-content:space-between"><span style="cursor:pointer;flex:1" data-load="' + i + '">' + svg(I.doc, "li-ic") + '<span><strong style="font-weight:600">' + esc(s.meta.titre || (s.poleId.toUpperCase() + " · " + s.act)) + '</strong><br><small class="muted">' + tag + ' · Pôle ' + s.poleId.slice(1) + '</small></span></span><span style="cursor:pointer;color:#b91c1c" data-del="' + i + '">' + svg(I.trash, "ic") + '</span></li>';
        }).join("") + '</ul></div>';
    }
    el.innerHTML = html;
    bindBuilder();
  }

  function bindBuilder() {
    var panel = document.getElementById("builderPanel");
    if (!panel) return;
    panel.querySelectorAll("[data-type]").forEach(function (b) {
      b.onclick = function () { BUILD.type = this.getAttribute("data-type"); renderBuilderPanel(); renderFiche(); };
    });
    var selPole = document.getElementById("selPole");
    var selAct = document.getElementById("selAct");
    if (selPole) selPole.onchange = function () { BUILD.pole = this.value; BUILD.act = null; BUILD.comps = []; BUILD.outils = []; renderBuilderPanel(); renderFiche(); };
    if (selAct) selAct.onchange = function () { BUILD.act = this.value; BUILD.comps = []; renderBuilderPanel(); renderFiche(); };
    var pick = document.getElementById("compPick");
    if (pick) {
      var p = R.poles.find(function (x) { return x.id === BUILD.pole; });
      var act = p.activites.find(function (a) { return a.code === BUILD.act; });
      pick.querySelectorAll("input").forEach(function (inp) {
        inp.onchange = function () {
          BUILD.comps = [];
          pick.querySelectorAll("input:checked").forEach(function (c) { BUILD.comps.push(act.competences[+c.value]); });
          renderFiche();
        };
      });
    }
    var opick = document.getElementById("outilsPick");
    if (opick) {
      var pp = R.poles.find(function (x) { return x.id === BUILD.pole; });
      opick.querySelectorAll("input").forEach(function (inp) {
        inp.onchange = function () {
          BUILD.outils = [];
          opick.querySelectorAll("input:checked").forEach(function (c) { BUILD.outils.push(pp.moyens.equipements[+c.value]); });
          renderFiche();
        };
      });
    }
    // champs meta (liaison générique id "m…" -> clé)
    panel.querySelectorAll('[id^="m"]').forEach(function (e) {
      var key = e.id.slice(1); key = key.charAt(0).toLowerCase() + key.slice(1);
      e.oninput = e.onchange = function () { BUILD.meta[key] = e.value; renderFiche(); };
    });
    var bp = document.getElementById("btnPrint"); if (bp) bp.onclick = function () { window.print(); };
    var bs = document.getElementById("btnSave"); if (bs) bs.onclick = saveCurrent;
    var br = document.getElementById("btnReset"); if (br) br.onclick = function () { BUILD.comps = []; BUILD.outils = []; BUILD.meta = {}; renderBuilderPanel(); renderFiche(); };
    document.querySelectorAll("[data-load]").forEach(function (e) { e.onclick = function () { loadOne(+this.getAttribute("data-load")); }; });
    document.querySelectorAll("[data-del]").forEach(function (e) { e.onclick = function () { delOne(+this.getAttribute("data-del")); }; });
  }

  var COLVARS = { ocean: "ocean", emeraude: "emeraude", ambre: "ambre" };
  function accentStyle(col) {
    return "--accent:var(--" + col + ");--accent-2:var(--" + col + "-2);--accent-soft:var(--" + col + "-soft);--accent-ink:var(--" + col + "-ink)";
  }
  function renderFiche() {
    var el = document.getElementById("fichePreview");
    if (!el) return;
    var p = R.poles.find(function (x) { return x.id === BUILD.pole; });
    var act = p.activites.find(function (a) { return a.code === BUILD.act; }) || p.activites[0];
    var m = BUILD.meta;
    var isSeq = BUILD.type !== "seance";

    if (!BUILD.comps.length) {
      el.innerHTML = '<div class="fiche"><div class="fiche-empty">' + svg(I.spark, "big") +
        '<h3>Votre fiche apparaîtra ici</h3><p class="muted">Choisissez le type de fiche, un pôle, une activité, puis cochez ' + (isSeq ? 'une ou plusieurs compétences' : 'la compétence ciblée') + ' : indicateurs, savoirs et objectifs mesurables se génèrent automatiquement.</p></div></div>';
      return;
    }
    var indicateurs = act.indicateurs;
    var savoirs = R.savoirs[p.id] || [];

    var fm = 'Pôle ' + p.num + ' · Activité ' + act.code + ' · Unité ' + p.unite + ' / Épreuve ' + p.epreuve + ' (coef. ' + p.coef + ')';
    if (m.niveau) fm += ' · ' + esc(m.niveau);
    if (isSeq && m.nbSeances) fm += ' · ' + esc(m.nbSeances);
    if (!isSeq && m.place) fm += ' · ' + esc(m.place);
    if (m.duree) fm += ' · ' + esc(m.duree);

    var h = '<div class="fiche" data-theme="' + p.couleur + '" style="' + accentStyle(p.couleur) + '">';
    h += '<div class="fiche-head" style="background:linear-gradient(120deg,var(--' + p.couleur + '),var(--' + p.couleur + '-2))">' +
      '<div class="ft">Fiche de ' + (isSeq ? 'séquence' : 'séance') + ' · Bac pro AGOrA</div>' +
      '<h2>' + esc(m.titre || ((isSeq ? "Séquence — " : "Séance — ") + act.titre)) + '</h2>' +
      '<div class="fm">' + fm + '</div></div><div class="fiche-body">';

    var support = ficheRow("Pôle et activité professionnelle support", '<ul><li><strong>Pôle ' + p.num + '</strong> — ' + esc(p.titre) + '</li><li><strong>Activité ' + act.code + '</strong> — ' + esc(act.titre) + '</li><li class="muted">Tâches : ' + act.taches.map(esc).join(" · ") + '</li></ul>');

    if (isSeq) {
      h += support;
      if (m.contexte) h += ficheRow("Contexte professionnel / scénario", para(m.contexte));
      if (m.problematique) h += ficheRow("Problématique professionnelle", para(m.problematique));
      if (m.situation) h += ficheRow("Situation professionnelle de départ", para(m.situation));
      h += ficheRow("Compétences visées (objectifs terminaux)", ul(BUILD.comps));
      h += ficheRow("Objectifs opérationnels mesurables", BUILD.comps.map(function (c) { return objCard(buildObjectif(c, act, null, false)); }).join(""));
      if (m.productions) h += ficheRow("Productions attendues des élèves", para(m.productions));
      if (BUILD.outils.length) h += ficheRow("Outils numériques mobilisés", chips(BUILD.outils));
      h += ficheRow("Savoirs associés à mobiliser", savoirsBlock(savoirs));
      h += ficheRow("Critères de réussite — indicateurs d'évaluation (référentiel)", ul(indicateurs));
      h += ficheRow("Évaluation certificative de rattachement", evalRattach(p));
    } else {
      if (m.place) h += ficheRow("Place dans la séquence", para(m.place));
      var objSeance = m.objectif && m.objectif.trim() ? m.objectif.trim() : buildObjectif(BUILD.comps[0], act, m.situation, true).titre;
      h += ficheRow("Objectif opérationnel", objCard({ titre: objSeance, critere: indicateurs[0] ? "Critère de réussite mesurable : " + indicateurs[0].toLowerCase() + "." : "" }));
      h += ficheRow("Compétence(s) ciblée(s)", ul(BUILD.comps));
      h += support;
      if (m.situation) h += ficheRow("Situation déclenchante", para(m.situation));
      if (m.supports) h += ficheRow("Supports", para(m.supports));
      if (m.deroulement && m.deroulement.trim()) {
        var phases = m.deroulement.split(/\r?\n/).map(function (s) { return s.replace(/^[-•·\s]+/, "").trim(); }).filter(Boolean);
        h += ficheRow("Déroulement", ol(phases));
      }
      if (BUILD.outils.length) h += ficheRow("Outils numériques mobilisés", chips(BUILD.outils));
      h += ficheRow("Savoirs associés à mobiliser", savoirsBlock(savoirs));
      h += ficheRow("Critères de réussite — indicateurs (référentiel)", ul(indicateurs));
      if (m.differenciation) h += ficheRow("Différenciation", para(m.differenciation));
      if (m.trace) h += ficheRow("Trace écrite", para(m.trace));
      if (m.evaluation) h += ficheRow("Modalités d'évaluation", para(m.evaluation));
      h += ficheRow("Rattachement certificatif", evalRattach(p));
    }

    h += '</div></div>';
    h += '<p class="muted no-print" style="font-size:12px;margin-top:12px">Document généré à partir du référentiel AGOrA. Les compétences, indicateurs et savoirs sont issus du référentiel ; objectifs et cadre sont à adapter à votre contexte.</p>';
    el.innerHTML = h;
  }
  function ficheRow(label, content) {
    return '<div class="fiche-row"><div class="rlabel">' + label + '</div>' + content + '</div>';
  }
  function para(t) { return '<p style="margin:0;font-size:14px;color:var(--ink-2);white-space:pre-line">' + esc(t) + '</p>'; }
  function ul(arr) { return '<ul>' + arr.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ul>'; }
  function ol(arr) { return '<ol style="margin:0;padding-left:18px">' + arr.map(function (x) { return '<li style="font-size:14px;color:var(--ink-2);margin-bottom:5px">' + esc(x) + '</li>'; }).join("") + '</ol>'; }
  function chips(arr) { return '<div class="task-chips">' + arr.map(function (x) { return '<span class="tc">' + esc(x) + '</span>'; }).join("") + '</div>'; }
  function objCard(o) { return '<div class="obj-card"><div class="oc-h">' + esc(o.titre) + '</div>' + (o.critere ? '<div class="oc-c">' + esc(o.critere) + '</div>' : '') + '</div>'; }
  function savoirsBlock(savoirs) { return savoirs.map(function (s) { return '<div style="margin-bottom:8px"><strong style="font-size:13px;color:var(--accent-2)">' + esc(s.famille) + '</strong><div class="muted" style="font-size:13px">' + s.themes.map(esc).join(" · ") + '</div></div>'; }).join(""); }
  function evalRattach(p) { return '<ul><li>Bloc de compétences ' + p.num + ' — ' + esc(p.bloc.replace(/^Bloc de compétences \d+ — /, "")) + '</li><li>Épreuve <strong>' + p.epreuve + '</strong> (' + esc(p.evaluation) + ')</li><li class="muted">Les travaux réalisés peuvent alimenter le dossier professionnel et les comptes rendus de PFMP.</li></ul>'; }
  function deElide(word) {
    // « de » → « d' » devant voyelle ou h muet (élision)
    return /^[aàâäeéèêëiîïoôöuùûüyhAÀÂEÉÈÊIÎOÔUYH]/.test(word) ? "d'" + word : "de " + word;
  }
  function buildObjectif(comp, act, situation, isSeance) {
    var verbe = comp.charAt(0).toLowerCase() + comp.slice(1);
    var titre;
    if (isSeance) {
      titre = "À l'issue de la séance, l'élève est capable " + deElide(verbe);
      if (situation && situation.trim()) {
        var sit = situation.trim().charAt(0).toLowerCase() + situation.trim().slice(1);
        titre += ", à partir " + deElide(sit);
      }
      titre += ".";
    } else {
      titre = "À partir d'une situation professionnelle relevant de l'activité " + act.code + ", l'élève est capable " + deElide(verbe) + ".";
    }
    var critere = act.indicateurs[0] ? ("Critère de réussite mesurable : " + act.indicateurs[0].toLowerCase() + ".") : "";
    return { titre: titre, critere: critere };
  }

  /* localStorage */
  var SKEY = "agora_sequences_v1";
  function loadSaved() { try { return JSON.parse(localStorage.getItem(SKEY) || "[]"); } catch (e) { return []; } }
  function saveCurrent() {
    if (!BUILD.comps.length) { alert("Cochez au moins une compétence avant d'enregistrer."); return; }
    var arr = loadSaved();
    arr.unshift({ type: BUILD.type, poleId: BUILD.pole, act: BUILD.act, comps: BUILD.comps.slice(), outils: BUILD.outils.slice(), meta: Object.assign({}, BUILD.meta) });
    if (arr.length > 40) arr = arr.slice(0, 40);
    localStorage.setItem(SKEY, JSON.stringify(arr));
    renderBuilderPanel();
    flash("Fiche enregistrée.");
  }
  function loadOne(i) {
    var arr = loadSaved(); var s = arr[i]; if (!s) return;
    BUILD.type = s.type || "sequence"; BUILD.pole = s.poleId; BUILD.act = s.act;
    BUILD.comps = s.comps.slice(); BUILD.outils = s.outils ? s.outils.slice() : []; BUILD.meta = Object.assign({}, s.meta);
    renderBuilderPanel(); renderFiche();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function delOne(i) {
    var arr = loadSaved(); arr.splice(i, 1); localStorage.setItem(SKEY, JSON.stringify(arr)); renderBuilderPanel();
  }
  function flash(msg) {
    var d = document.createElement("div");
    d.textContent = msg;
    d.style.cssText = "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#141b2e;color:#fff;padding:12px 20px;border-radius:12px;font-size:14px;font-weight:600;z-index:200;box-shadow:0 12px 30px rgba(0,0,0,.3)";
    document.body.appendChild(d);
    setTimeout(function () { d.style.transition = "opacity .4s"; d.style.opacity = "0"; setTimeout(function () { d.remove(); }, 400); }, 1600);
  }

  /* ===================================================================
     VUE — TEXTES
     =================================================================== */
  function viewTextes() {
    setTheme(null);
    var h = head([{ t: "Accueil", route: "#/" }, { t: "Textes & mises à jour" }], "Cadre réglementaire", "Textes de référence & mises à jour",
      "Le socle juridique du diplôme et son actualisation. Les éléments marqués « à jour » signalent les évolutions récentes à connaître.");

    h += '<div class="card">';
    R.textes.forEach(function (t) {
      h += '<div class="texte-item"><div class="texte-date">' + esc(t.date) + '</div><div><h4>' + esc(t.titre) + (t.maj ? '<span class="tag-maj">à jour</span>' : '') + '</h4>' +
        (t.nor ? '<small class="muted">' + esc(t.nor) + '</small>' : '') +
        '<p style="font-size:13.5px;margin:6px 0 0">' + esc(t.role) + '</p></div></div>';
    });
    h += '</div>';

    h += '<div class="section"><div class="section-title"><h2>Du bac pro Gestion-Administration à AGOrA</h2><span class="line"></span></div>';
    h += '<div class="grid cols-2" style="margin-bottom:14px">' +
      '<div class="card" style="border-left:4px solid #94a3b8"><small>Ancien diplôme</small><h3 style="font-size:16px">' + esc(R.correspondance.ancien) + '</h3></div>' +
      '<div class="card" style="border-left:4px solid var(--brand)"><small>Diplôme actuel</small><h3 style="font-size:16px">' + esc(R.correspondance.nouveau) + '</h3></div>' +
    '</div>';
    h += '<div class="table-wrap"><table class="matrix"><thead><tr><th>Bac pro Gestion-Administration</th><th>Bac pro AGOrA</th></tr></thead><tbody>' +
      R.correspondance.lignes.map(function (l) { return '<tr><td>' + esc(l.ga) + '</td><td>' + esc(l.agora) + '</td></tr>'; }).join("") + '</tbody></table></div></div>';

    h += '<div class="section"><div class="section-title"><h2>Organisation de la formation</h2><span class="line"></span></div>';
    h += '<div class="grid cols-2">' +
      '<div class="card"><h3>' + svg(I.cap, "ic") + ' Accès & parcours</h3><p style="font-size:14px">' + esc(R.formation.acces) + '</p><p style="font-size:13.5px;margin-bottom:0" class="muted"><strong>Seconde famille de métiers :</strong> ' + esc(R.formation.famille) + '</p></div>' +
      '<div class="card"><h3>' + svg(I.map, "ic") + ' Terminale & réforme</h3><p style="font-size:14px;margin-bottom:0">' + esc(R.formation.terminaleReforme) + '</p></div>' +
    '</div>';
    h += '<div class="grid cols-2" style="margin-top:18px">' +
      '<div class="card"><h3>' + svg(I.book, "ic") + ' Enseignements</h3>' +
        '<h4 style="font-size:12.5px;text-transform:uppercase;color:var(--ink-3)">Généraux</h4><div class="task-chips">' + R.formation.enseignements.generaux.map(function (e) { return '<span class="tc">' + esc(e) + '</span>'; }).join("") + '</div>' +
        '<h4 style="font-size:12.5px;text-transform:uppercase;color:var(--ink-3);margin-top:12px">Professionnels</h4><ul class="chk-list">' + R.formation.enseignements.professionnels.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join("") + '</ul>' +
        '<p class="muted" style="font-size:13px;margin-top:10px">' + esc(R.formation.enseignements.coIntervention) + ' ' + esc(R.formation.enseignements.chefDoeuvre) + '</p></div>' +
      '<div class="card"><h3>' + svg(I.arrow, "ic") + ' Poursuites d\'études</h3><p style="font-size:14px;margin-bottom:0">' + esc(R.formation.poursuites) + '</p></div>' +
    '</div></div>';
    return h;
  }

  /* ===================================================================
     RECHERCHE
     =================================================================== */
  var SEARCH_INDEX = null;
  function setupSearch() {
    SEARCH_INDEX = R.buildSearchIndex();
    var input = document.getElementById("search");
    var box = document.getElementById("searchResults");
    function run() {
      var q = input.value.trim().toLowerCase();
      if (q.length < 2) { box.classList.remove("show"); return; }
      var terms = q.split(/\s+/);
      var res = SEARCH_INDEX.filter(function (it) {
        var hay = (it.label + " " + it.text).toLowerCase();
        return terms.every(function (t) { return hay.indexOf(t) >= 0; });
      }).slice(0, 24);
      if (!res.length) { box.innerHTML = '<div class="sr-empty">Aucun résultat pour « ' + esc(q) + ' »</div>'; box.classList.add("show"); return; }
      box.innerHTML = res.map(function (r) {
        return '<div class="sr-item" data-route="' + r.route + '"><span class="sr-tag">' + r.type + '</span><span class="sr-label">' + esc(r.label) + '</span></div>';
      }).join("");
      box.classList.add("show");
      box.querySelectorAll(".sr-item").forEach(function (e) {
        e.onclick = function () { input.value = ""; box.classList.remove("show"); location.hash = e.getAttribute("data-route"); };
      });
    }
    input.addEventListener("input", run);
    input.addEventListener("focus", run);
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".search-wrap")) box.classList.remove("show");
    });
  }

  /* ===================================================================
     THEME
     =================================================================== */
  function setTheme(c) { document.body.setAttribute("data-theme", c || ""); if (!c) document.body.removeAttribute("data-theme"); }
  function setThemeVars(c) { /* géré par data-theme sur la fiche */ }

  /* ===================================================================
     ROUTEUR
     =================================================================== */
  function parseHash() {
    var raw = location.hash || "#/";
    var qIdx = raw.indexOf("?");
    var path = qIdx >= 0 ? raw.slice(0, qIdx) : raw;
    var params = {};
    if (qIdx >= 0) raw.slice(qIdx + 1).split("&").forEach(function (kv) { var a = kv.split("="); params[a[0]] = a[1]; });
    return { path: path, params: params };
  }
  function router() {
    var r = parseHash();
    var path = r.path;
    var parts = path.replace(/^#\//, "").split("/");
    var view = parts[0] || "";
    var html;
    switch (view) {
      case "": html = viewHome(); break;
      case "architecture": html = viewArchitecture(); break;
      case "matrice": html = viewMatrice(); break;
      case "pole": html = viewPole(parts[1]); break;
      case "savoirs": html = viewSavoirs(); break;
      case "epreuves": html = viewEpreuves(); break;
      case "pfmp": html = viewPFMP(); break;
      case "metier": html = viewMetier(); break;
      case "progression": html = viewProgression(); break;
      case "sequence": html = viewSequence(r.params); break;
      case "textes": html = viewTextes(); break;
      default: html = viewHome();
    }
    var content = document.getElementById("content");
    content.innerHTML = html;
    setActiveNav(path);
    bindAccordions();
    document.body.classList.remove("nav-open");
    if (view !== "sequence") window.scrollTo({ top: 0, behavior: "auto" });
    document.getElementById("content").focus({ preventScroll: true });
  }

  function bindAccordions() {
    document.querySelectorAll("[data-acc-head]").forEach(function (head) {
      head.onclick = function () { head.closest("[data-acc]").classList.toggle("open"); };
    });
  }

  /* ===================================================================
     INIT
     =================================================================== */
  function init() {
    renderNav();
    setupSearch();
    window.addEventListener("hashchange", router);
    document.getElementById("menuBtn").onclick = function () { document.body.classList.toggle("nav-open"); };
    document.getElementById("navScrim").onclick = function () { document.body.classList.remove("nav-open"); };
    router();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
