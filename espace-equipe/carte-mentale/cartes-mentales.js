/* cartes-mentales.js — écran de l'espace « Cartes mentales » (liste des cartes + éditeur).
 * [CARTES MENTALES 13/10/2026] Le modèle est dans cartes-mentales-core.js (window.PSE_CARTES_MENTALES).
 * [EN LIGNE 01/11/2026] Copie de l'éditeur de l'Atelier PSE pour Coordination & Pédagogie (demande de Brahim) :
 * le stockage est window.StorageService posé par en-ligne.js (Firebase, en direct). Retouches repérées [EN LIGNE].
 * Dessin en SVG : disposer() calcule la place de chaque sujet, rendre() ne redessine que ce qui a changé.
 */
(function () {
  'use strict';
  var M = window.PSE_CARTES_MENTALES;
  var NS = 'http://www.w3.org/2000/svg';
  var POLICES = {
    systeme: ['Standard', '-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif'],
    arrondie: ['Arrondie', 'ui-rounded,"SF Pro Rounded","Arial Rounded MT Bold",system-ui,sans-serif'],
    lisible: ['Très lisible', 'Verdana,"Trebuchet MS",system-ui,sans-serif'],
    serif: ['Livre', '"New York",ui-serif,Georgia,"Times New Roman",serif'],
    manuscrite: ['Manuscrite', '"Bradley Hand","Marker Felt","Comic Sans MS",cursive'],
    machine: ['Machine', 'ui-monospace,Menlo,"Courier New",monospace']
  };
  var POLICE = POLICES.systeme[1];   // police de la feuille en cours de dessin (posée par disposer)
  function $(id) { return document.getElementById(id); }
  function echap(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function arr(v) { return Math.round(v * 10) / 10; }

  /* ---------- Thèmes ---------- */
  var THEMES = {
    classique: { nom: 'Classique', fond: '#ffffff', racine: ['#1f2937', '#ffffff'], palette: ['#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#ec4899'], texte: '#1f2937', libre: ['#e5e7eb', '#1f2937'], liaison: '#64748b' },
    pastel: { nom: 'Pastel', fond: '#fbfaf7', racine: ['#334155', '#ffffff'], palette: ['#f6a6a0', '#f7cf8f', '#a8dbb6', '#9dd6ea', '#b7baf3', '#eaaad3'], texte: '#334155', libre: ['#ece8df', '#334155'], liaison: '#94a3b8' },
    ocean: { nom: 'Océan', fond: '#f1f6fb', racine: ['#0c4a6e', '#ffffff'], palette: ['#0369a1', '#0891b2', '#0d9488', '#2563eb', '#4f46e5', '#0e7490'], texte: '#0f2a43', libre: ['#dbe7f3', '#0f2a43'], liaison: '#5b7fa3' },
    parchemin: { nom: 'Parchemin', fond: '#fbf7ef', racine: ['#1b2a4e', '#fbf7ef'], palette: ['#b8860b', '#2e7d7a', '#a65a4a', '#5b6a85', '#7c6f2a', '#8b5e83'], texte: '#1b2a4e', libre: ['#efe4ce', '#1b2a4e'], liaison: '#8a7a5a' },
    nuit: { nom: 'Nuit', fond: '#0f172a', racine: ['#f8fafc', '#0f172a'], palette: ['#f87171', '#fbbf24', '#34d399', '#22d3ee', '#818cf8', '#f472b6'], texte: '#e2e8f0', libre: ['#1e293b', '#e2e8f0'], liaison: '#94a3b8' },
    encre: { nom: 'Encre', fond: '#ffffff', racine: ['#111827', '#ffffff'], palette: ['#111827', '#374151', '#4b5563', '#1f2937', '#52525b', '#3f3f46'], texte: '#111827', libre: ['#f3f4f6', '#111827'], liaison: '#6b7280' }
  };
  var COULEURS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#64748b', '#1f2937', '#fde68a', '#bbf7d0', '#bfdbfe', '#fecaca', '#e9d5ff', '#ffffff'];
  var FORMES = [['arrondi', 'Arrondi'], ['pilule', 'Pilule'], ['rectangle', 'Rectangle'], ['contour', 'Contour'], ['souligne', 'Souligné'], ['aucun', 'Sans cadre']];

  /* ---------- État ---------- */
  var donnees = M.vide(), carte = null, feuille = null;
  var sel = new Set(), principal = null, selLiaison = null, selCadre = null;   // selCadre : { id, porteur } d'un encadré
  var vue = { x: 0, y: 0, z: 1 };
  var pile = [], refaire = [];
  var boites = new Map(), elems = new Map(), elLiens = new Map();
  var edition = null, mode = null, panneau = null, clePanneau = '', presse = null, pres = null;
  /* Écran des élèves : la même page ouverte avec ?role=projection (elle part sur le vidéoprojecteur, voir
     estFenetreEleves dans Electron/main.js). Elle ne lit rien dans le store : elle dessine ce que la fenêtre
     du professeur lui envoie sur le canal « atelier-carte-mentale-<session> ». */
  var PARAMS = new URLSearchParams(location.search), ELEVES = PARAMS.get('role') === 'projection', SESSION = PARAMS.get('session') || '';
  var diffusion = null;   // côté professeur : { session, bus, fen, vus:Set, trous, mode (carte | gros | diapo), grain (branche | sujet), focus, suivre, noir, veille }
  var filtre = { texte: '', dossier: null };   // dossier : null = toutes les cartes, identifiant, ou « corbeille »
  var replies = {};   // dossiers repliés dans l'arbre de gauche
  var svg = $('svg'), monde = $('monde'), scene = $('scene'), saisie = $('saisie');
  var cLiens = $('c-liens'), cLiaisons = $('c-liaisons'), cNoeuds = $('c-noeuds'), cDessus = $('c-dessus'), cCadres = $('c-cadres');

  /* ---------- Stockage ---------- */
  /* Dans l'Atelier : StorageService (fichier store/cartes-mentales.json). Page ouverte seule : localStorage. */
  var S = window.StorageService || { get: function (k) { return localStorage.getItem(k); }, set: function (k, v) { localStorage.setItem(k, v); } };
  var connus = new Set();   // identifiants (cartes, dossiers) vus à la dernière lecture ou écriture
  function noter(d) { connus = new Set(); d.cartes.forEach(function (c) { connus.add(c.id); }); d.dossiers.forEach(function (o) { connus.add(o.id); }); d.corbeille.forEach(function (x) { connus.add(x.carte.id); }); }
  function lire() {
    var d; try { d = M.normaliser(JSON.parse(S.get(M.CLE) || 'null')); } catch (e) { d = M.vide(); }
    if (d._migre) { delete d._migre; try { S.set(M.CLE, JSON.stringify(d)); } catch (e) {} }   // l'ancien rangement est converti une seule fois
    noter(d); return d;
  }
  /* Ce qui a été ajouté ailleurs depuis la dernière lecture (une carte déposée par l'IA pendant qu'une carte est
     ouverte ici) est repris avant d'écrire : enregistrer ne doit jamais l'effacer. */
  function reprendreAjouts() {
    var frais; try { frais = M.normaliser(JSON.parse(S.get(M.CLE) || 'null')); } catch (e) { return; }
    if (frais._migre) return;
    frais.dossiers.forEach(function (o) { if (!connus.has(o.id)) donnees.dossiers.push(o); });
    frais.cartes.forEach(function (c) { if (!connus.has(c.id)) donnees.cartes.push(c); });
    frais.corbeille.forEach(function (x) { if (!connus.has(x.carte.id)) donnees.corbeille.push(x); });
  }
  var tSauve = null;
  function ecrire() {
    clearTimeout(tSauve); tSauve = null;
    try { reprendreAjouts(); S.set(M.CLE, JSON.stringify(donnees)); if (S.flush) S.flush(); noter(donnees); etat('Enregistré'); }
    catch (e) { etat('Enregistrement impossible : ' + (e && e.message || e)); }
  }
  function sauver() {
    if (carte) carte.maj = M.maintenant();
    etat('Enregistrement…');
    clearTimeout(tSauve); tSauve = setTimeout(ecrire, 350);
  }
  function etat(t) { var e = $('etat-sauve'); if (e) e.textContent = t; }
  window.addEventListener('pagehide', function () { if (tSauve) ecrire(); });

  /* ---------- Mesure du texte ---------- */
  var ctx = document.createElement('canvas').getContext('2d');
  var cacheCoupe = new Map();
  function police(s) { return (s.italique ? 'italic ' : '') + s.poids + ' ' + s.fs + 'px ' + POLICE; }
  function largeurTexte(t, font) { ctx.font = font; return ctx.measureText(t).width; }
  function couper(texte, font, max) {
    var cle = font + '|' + max + '|' + texte, c = cacheCoupe.get(cle);
    if (c) return c;
    ctx.font = font;
    var lignes = [], large = 0;
    String(texte).split('\n').forEach(function (par) {
      var mots = par.split(' '), cour = '';
      mots.forEach(function (mot) {
        var essai = cour ? cour + ' ' + mot : mot;
        if (ctx.measureText(essai).width <= max || !cour) {
          cour = essai;
          while (ctx.measureText(cour).width > max && cour.length > 1) {   // mot plus long que la ligne
            var k = cour.length - 1;
            while (k > 1 && ctx.measureText(cour.slice(0, k)).width > max) k -= 1;
            lignes.push(cour.slice(0, k)); cour = cour.slice(k);
          }
        } else { lignes.push(cour); cour = mot; }
      });
      lignes.push(cour);
    });
    lignes.forEach(function (l) { large = Math.max(large, ctx.measureText(l).width); });
    c = { lignes: lignes, largeur: Math.ceil(large) };
    if (cacheCoupe.size > 6000) cacheCoupe.clear();
    cacheCoupe.set(cle, c);
    return c;
  }
  function contraste(hex) {
    var m = String(hex || '').replace('#', '');
    if (m.length === 3) m = m.replace(/(.)/g, '$1$1');
    var r = parseInt(m.slice(0, 2), 16), g = parseInt(m.slice(2, 4), 16), b = parseInt(m.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62 ? '#172033' : '#ffffff';
  }

  /* [ENCADRÉS 15/10/2026] Couleur mêlée au fond du thème (k = part du fond) : fond d'encadré, case de résumé. */
  function teinte(hex, k, fond) {
    function rgb(h) { var m = String(h || '#ffffff').replace('#', ''); if (m.length === 3) m = m.replace(/(.)/g, '$1$1'); return [0, 2, 4].map(function (i) { return parseInt(m.slice(i, i + 2), 16) || 0; }); }
    var a = rgb(hex), b = rgb(fond);
    return '#' + a.map(function (v, i) { return ('0' + Math.round(v * (1 - k) + b[i] * k).toString(16)).slice(-2); }).join('');
  }

  /* ---------- Style et mesure d'un sujet ---------- */
  function styleDe(n, prof, libre, couleur, T, structure) {
    var s;
    if (prof === 0) s = { fs: 22, poids: 700, padX: 24, padY: 16, forme: 'arrondi', fond: T.racine[0], texte: T.racine[1] };
    else if (prof === 1 && libre) s = { fs: 15, poids: 600, padX: 14, padY: 8, forme: 'arrondi', fond: T.libre[0], texte: T.libre[1] };
    else if (prof === 1) s = { fs: 16, poids: 650, padX: 15, padY: 9, forme: 'arrondi', fond: couleur, texte: contraste(couleur) };
    else s = { fs: 14, poids: 450, padX: 5, padY: 5, forme: structure === 'organigramme' ? 'contour' : 'souligne', fond: null, texte: T.texte };
    s.trait = couleur;
    var st = n.style || {};
    if (st.taille) s.fs = st.taille;
    if (st.gras === true) s.poids = 700; else if (st.gras === false) s.poids = 450;
    if (st.italique) s.italique = true;
    if (st.forme) s.forme = st.forme;
    if (st.fond) { s.fond = st.fond; s.texte = contraste(st.fond); if (!st.forme && s.forme === 'souligne') s.forme = 'arrondi'; }
    if (st.texte) s.texte = st.texte;
    if (s.forme === 'souligne' || s.forme === 'aucun') { s.fond = null; if (!st.texte && prof > 0) s.texte = T.texte; }
    if (s.forme === 'contour') { s.fond = null; if (!st.texte) s.texte = T.texte; }
    if (s.forme !== 'souligne' && s.forme !== 'aucun' && s.padX < 11) { s.padX = 11; s.padY = 6; }
    return s;
  }
  function mesurer(n, prof, libre, couleur, T, structure) {
    var s = styleDe(n, prof, libre, couleur, T, structure);
    var c = couper(n.t || ' ', police(s), prof === 0 ? 340 : 300);
    var lh = Math.round(s.fs * 1.34);
    var mw = (n.marqueurs || []).length * 20; if (mw) mw += 4;
    var ic = (n.note ? 17 : 0) + (n.lien ? 17 : 0); if (ic) ic += 3;
    var iw = 0, ih = 0;
    if (n.image && n.image.w) {
      var k = Math.min(1, 240 / n.image.w, 190 / n.image.h) * (n.image.echelle || 1);
      iw = Math.round(n.image.w * k); ih = Math.round(n.image.h * k);
    }
    var puces = (n.etiquettes || []).map(function (e) { return { t: e, w: Math.ceil(largeurTexte(e, '600 11px ' + POLICE)) + 14 }; });
    var lw = puces.reduce(function (a, p) { return a + p.w + 4; }, 0); if (lw) lw -= 4;
    var interieur = Math.max(mw + c.largeur + ic, iw, lw);
    return {
      n: n, s: s, T: T, lignes: c.lignes, lh: lh, tw: c.largeur, mw: mw, ic: ic, iw: iw, ih: ih, puces: puces, lw: lw,
      w: Math.ceil(interieur + 2 * s.padX), h: Math.ceil(2 * s.padY + c.lignes.length * lh + (ih ? ih + 6 : 0) + (lw ? 23 : 0)),
      prof: prof, libre: libre, couleur: couleur, dir: 1, x: 0, y: 0
    };
  }
  function souligne(b) { return b.s.forme === 'souligne'; }
  function attrPolice() { return 'font-family="' + POLICE.replace(/"/g, "'") + '"'; }

  /* ---------- Disposition ---------- */
  /* Rend la carte des boîtes d'une feuille (id → boîte). profMax : au-delà, les branches sont traitées comme repliées (vignettes). */
  function disposer(f, profMax, visibles) {
    var T = THEMES[f.theme] || THEMES.classique, st = f.structure || 'carte', B = new Map();
    POLICE = (POLICES[f.police] || POLICES.systeme)[1];
    function montres(n) { return visibles ? n.enfants.filter(function (e) { return visibles.has(e.id); }) : n.enfants; }   // enfants montrés
    function ouvert(n, prof) { return !n.plie && montres(n).length && !(profMax && prof >= profMax); }
    function prep(n, parent, prof, libre, couleur) {
      var b = mesurer(n, prof, libre, couleur, T, st);
      b.parent = parent; B.set(n.id, b);
      if (ouvert(n, prof)) montres(n).forEach(function (e) {
        var i = n.enfants.indexOf(e);
        prep(e, n, prof + 1, libre, prof === 0 && !libre ? T.palette[i % T.palette.length] : couleur);
      });
      b.ouvert = !!ouvert(n, prof);
      b.plages = [];
      if (b.ouvert) plagesDe(n, prof, libre);
    }
    /* [ENCADRÉS 15/10/2026] Encadrés et résumés du sujet n : seulement si tous les sujets couverts sont dessinés. */
    function plagesDe(n, prof, libre) {
      var b = B.get(n.id);
      M.reparerPlages(n);
      function couverts(p) {
        var r = M.plage(n, p); if (!r) return null;
        var ids = n.enfants.slice(r[0], r[1] + 1).map(function (e) { return e.id; });
        return ids.every(function (id) { return B.has(id); }) ? ids : null;
      }
      (n.encadres || []).forEach(function (p) {
        var ids = couverts(p); if (!ids) return;
        b.plages.push({ type: 'cadre', p: p, kids: ids, couleur: p.couleur || B.get(ids[0]).couleur });
      });
      (n.resumes || []).forEach(function (r) {
        var ids = couverts(r); if (!ids || (visibles && !visibles.has(r.sujet.id))) return;
        var coul = r.couleur || B.get(ids[0]).couleur;
        var faux = Object.assign({}, r.sujet, { style: Object.assign({ fond: teinte(coul, 0.68, T.fond), forme: 'arrondi', gras: true }, r.sujet.style || {}) });
        var rb = mesurer(faux, Math.max(2, prof + 1), libre, coul, T, st);
        rb.n = r.sujet; rb.parent = null; rb.resume = r; rb.porteur = n; rb.ouvert = false; rb.plages = [];
        B.set(r.sujet.id, rb);
        b.plages.push({ type: 'resume', p: r, kids: ids, couleur: coul });
      });
    }
    var PADC = 10, TITREC = 9;   // marge d'un encadré, place de son titre
    /* Place à laisser avant / après chaque sujet de « liste » pour les encadrés et les résumés de n. */
    function marges(n, liste, horiz) {
      var b = B.get(n.id), av = liste.map(function () { return 0; }), ap = av.slice(), ev = horiz ? 18 : ecartV(b), total = 0;
      (b.plages || []).forEach(function (q) {
        var ks = q.kids.map(function (id) { for (var k = 0; k < liste.length; k += 1) if (liste[k].id === id) return k; return -1; });
        if (ks.indexOf(-1) >= 0) return;
        var i = Math.min.apply(null, ks), j = Math.max.apply(null, ks);
        if (q.type === 'cadre') { av[i] += PADC + (q.p.t ? TITREC + 8 : 0); ap[j] += PADC; return; }   // + 8 : l'étiquette du titre déborde au-dessus du cadre
        var H = ev * (j - i), rb = B.get(q.p.sujet.id), R = (horiz ? rb.w : rb.h) + 8;
        for (var k = i; k <= j; k += 1) H += horiz ? B.get(liste[k].id).sw : B.get(liste[k].id).sh;
        if (R > H) { av[i] += (R - H) / 2; ap[j] += (R - H) / 2; }
      });
      av.forEach(function (v, k) { total += v + ap[k]; });
      return { av: av, ap: ap, total: total };
    }
    function ecartV(b) { return b.prof === 0 ? 26 : 9; }
    function hauteur(n) {
      var b = B.get(n.id);
      if (!b.ouvert) { b.sh = b.h; return b.sh; }
      var t = 0, l = montres(n); l.forEach(function (e) { t += hauteur(e); });
      b.sh = Math.max(b.h, t + marges(n, l).total + ecartV(b) * (l.length - 1));
      return b.sh;
    }
    function enfantsH(n, liste, dir) {
      var b = B.get(n.id), ev = ecartV(b), eh = b.prof === 0 ? 66 : 42, total = 0, m = marges(n, liste);
      liste.forEach(function (c) { total += B.get(c.id).sh; });
      total += ev * (liste.length - 1) + m.total;
      var y = b.y + (souligne(b) ? b.h : b.h / 2) - total / 2;
      liste.forEach(function (c, k) {
        var cb = B.get(c.id);
        y += m.av[k];
        cb.dir = dir;
        cb.x = dir > 0 ? b.x + b.w + eh : b.x - eh - cb.w;
        cb.y = y + cb.sh / 2 - (souligne(cb) ? cb.h : cb.h / 2);
        y += cb.sh + ev + m.ap[k];
        if (cb.ouvert) enfantsH(c, montres(c), dir);
      });
    }
    function largeur(n) {
      var b = B.get(n.id);
      if (!b.ouvert) { b.sw = b.w; return b.sw; }
      var t = 0, l = montres(n); l.forEach(function (e) { t += largeur(e); });
      b.sw = Math.max(b.w, t + marges(n, l, true).total + 18 * (l.length - 1));
      return b.sw;
    }
    function enfantsBas(n) {
      var b = B.get(n.id), total = 0, l = montres(n), m = marges(n, l, true);
      l.forEach(function (c) { total += B.get(c.id).sw; });
      total += 18 * (l.length - 1) + m.total;
      var x = b.x + b.w / 2 - total / 2;
      l.forEach(function (c, k) {
        var cb = B.get(c.id);
        x += m.av[k];
        cb.dir = 0; cb.x = x + cb.sw / 2 - cb.w / 2; cb.y = b.y + b.h + 52;
        x += cb.sw + 18 + m.ap[k];
        if (cb.ouvert) enfantsBas(c);
      });
    }

    var r = f.racine;
    prep(r, null, 0, false, T.racine[0]);
    var rb = B.get(r.id);
    rb.x = -rb.w / 2; rb.y = -rb.h / 2; rb.dir = 1;
    if (st === 'organigramme') { largeur(r); if (rb.ouvert) enfantsBas(r); }
    else {
      hauteur(r);
      if (rb.ouvert) {
        if (st === 'droite') enfantsH(r, montres(r), 1);
        else if (st === 'gauche') enfantsH(r, montres(r), -1);
        else {   // carte : à droite de haut en bas, puis à gauche de bas en haut (sens horaire)
          var total = 0, acc = 0, droite = [], gauche = [];
          montres(r).forEach(function (c) { total += B.get(c.id).sh; });
          montres(r).forEach(function (c) {
            if (!droite.length || acc < total / 2 - 1) { droite.push(c); acc += B.get(c.id).sh; } else gauche.push(c);
          });
          rb.plages.forEach(function (q) {   // un encadré ou un résumé reste d'un seul côté
            while (gauche.length && q.kids.indexOf(gauche[0].id) >= 0 && droite.some(function (c) { return q.kids.indexOf(c.id) >= 0; })) droite.push(gauche.shift());
          });
          enfantsH(r, droite, 1);
          enfantsH(r, gauche.slice().reverse(), -1);
        }
      }
    }
    (f.libres || []).forEach(function (l) {
      if (visibles && !visibles.has(l.id)) return;
      prep(l, null, 1, true, T.liaison);
      var lb = B.get(l.id);
      lb.x = l.x || 0; lb.y = l.y || 0; lb.dir = 1;
      hauteur(l);
      if (lb.ouvert) enfantsH(l, montres(l), 1);
    });
    B.decor = [];
    etendue(r); (f.libres || []).forEach(function (l) { if (B.has(l.id)) etendue(l); });
    return B;
    /* Rectangle couvert par n et sa descendance ; pose au passage les encadrés et les résumés (B.decor). */
    function etendue(n) {
      var b = B.get(n.id), e = { x1: b.x, y1: b.y, x2: b.x + b.w, y2: b.y + b.h }, ext = {};
      function unir(a, o) { a.x1 = Math.min(a.x1, o.x1); a.y1 = Math.min(a.y1, o.y1); a.x2 = Math.max(a.x2, o.x2); a.y2 = Math.max(a.y2, o.y2); return a; }
      if (b.ouvert) montres(n).forEach(function (c) { if (B.has(c.id)) unir(e, ext[c.id] = etendue(c)); });
      var cadres = [];
      b.plages.forEach(function (q) {
        if (q.type !== 'cadre') return;
        var u = null; q.kids.forEach(function (id) { if (ext[id]) u = u ? unir(u, ext[id]) : Object.assign({}, ext[id]); });
        if (!u) return;
        var c = { x1: u.x1 - PADC, y1: u.y1 - PADC - (q.p.t ? TITREC : 0), x2: u.x2 + PADC, y2: u.y2 + PADC };
        cadres.push({ q: q, r: c }); unir(e, c);
        B.decor.push({ type: 'cadre', id: q.p.id, porteur: n.id, kids: q.kids, couleur: q.couleur, t: q.p.t || '', x: c.x1, y: c.y1, w: c.x2 - c.x1, h: c.y2 - c.y1 });
      });
      b.plages.forEach(function (q) {
        if (q.type !== 'resume') return;
        var u = null; q.kids.forEach(function (id) { if (ext[id]) u = u ? unir(u, ext[id]) : Object.assign({}, ext[id]); });
        if (!u) return;
        cadres.forEach(function (c) { if (c.q.kids.some(function (id) { return q.kids.indexOf(id) >= 0; })) unir(u, c.r); });
        var rb = B.get(q.p.sujet.id), dir = B.get(q.kids[0]).dir, d = { type: 'accolade', id: q.p.id, porteur: n.id, sujet: q.p.sujet.id, kids: q.kids, couleur: q.couleur, dir: dir };
        if (dir === 0) {   // organigramme : l'accolade sous les sujets, le résumé dessous
          d.a = u.x1; d.b = u.x2; d.pos = u.y2 + 8;
          rb.x = (u.x1 + u.x2) / 2 - rb.w / 2; rb.y = d.pos + 20;
        } else {
          d.a = u.y1; d.b = u.y2; d.pos = dir > 0 ? u.x2 + 8 : u.x1 - 8;
          rb.x = dir > 0 ? d.pos + 20 : d.pos - 20 - rb.w; rb.y = (u.y1 + u.y2) / 2 - rb.h / 2;
        }
        rb.dir = dir || 1;
        B.decor.push(d);
        unir(e, { x1: rb.x, y1: rb.y, x2: rb.x + rb.w, y2: rb.y + rb.h });
      });
      return e;
    }
  }
  /* Dessin des encadrés et des accolades (sous les sujets). cache(d) : estompé (écran des élèves). */
  function dessinerDecor(B, T, cache) {
    var h = '', l = B.decor || [];
    // Les encadrés d'abord, du plus extérieur au plus intérieur (posés de l'intérieur vers l'extérieur), puis les accolades par-dessus.
    l = l.filter(function (d) { return d.type === 'cadre'; }).reverse().concat(l.filter(function (d) { return d.type !== 'cadre'; }));
    l.forEach(function (d) {
      var c = d.couleur || T.liaison, choisi = selCadre && selCadre.id === d.id, cl = cache && cache(d) ? ' hors-eleves' : '';
      if (d.type === 'cadre') {
        h += '<g class="cadre' + cl + '" data-cadre="' + d.id + '" data-porteur="' + d.porteur + '">';
        h += '<rect x="' + arr(d.x) + '" y="' + arr(d.y) + '" width="' + arr(d.w) + '" height="' + arr(d.h) + '" rx="10" fill="' + teinte(c, 0.9, T.fond) + '" stroke="' + (choisi ? '#4f46e5' : c) + '" stroke-width="' + (choisi ? 2.6 : 1.5) + '" pointer-events="none"/>';
        h += '<rect class="prise" x="' + arr(d.x) + '" y="' + arr(d.y) + '" width="' + arr(d.w) + '" height="' + arr(d.h) + '" rx="10" fill="none" stroke="transparent" stroke-width="12"/>';
        if (d.t) {
          var tw = Math.ceil(largeurTexte(d.t, '600 11px ' + POLICE)) + 14;
          h += '<rect class="prise" x="' + arr(d.x + 8) + '" y="' + arr(d.y - 8) + '" width="' + tw + '" height="16" rx="5" fill="' + (choisi ? '#4f46e5' : c) + '"/>';
          h += '<text x="' + arr(d.x + 8 + tw / 2) + '" y="' + arr(d.y) + '" text-anchor="middle" dominant-baseline="central" ' + attrPolice() + ' font-size="11" font-weight="600" fill="' + contraste(choisi ? '#4f46e5' : c) + '" pointer-events="none">' + echap(d.t) + '</text>';
        }
        h += '</g>';
      } else {
        var a = d.a, b = d.b, p = d.pos, s = d.dir < 0 ? -1 : 1, m = (a + b) / 2, k = Math.min(8, (b - a) / 4), path;
        if (d.dir === 0) path = 'M' + arr(a) + ' ' + arr(p) + 'Q' + arr(a) + ' ' + arr(p + 6) + ' ' + arr(a + k) + ' ' + arr(p + 6) + 'L' + arr(m - 6) + ' ' + arr(p + 6) + 'Q' + arr(m) + ' ' + arr(p + 6) + ' ' + arr(m) + ' ' + arr(p + 12) + 'Q' + arr(m) + ' ' + arr(p + 6) + ' ' + arr(m + 6) + ' ' + arr(p + 6) + 'L' + arr(b - k) + ' ' + arr(p + 6) + 'Q' + arr(b) + ' ' + arr(p + 6) + ' ' + arr(b) + ' ' + arr(p);
        else path = 'M' + arr(p) + ' ' + arr(a) + 'Q' + arr(p + 6 * s) + ' ' + arr(a) + ' ' + arr(p + 6 * s) + ' ' + arr(a + k) + 'L' + arr(p + 6 * s) + ' ' + arr(m - 6) + 'Q' + arr(p + 6 * s) + ' ' + arr(m) + ' ' + arr(p + 12 * s) + ' ' + arr(m) + 'Q' + arr(p + 6 * s) + ' ' + arr(m) + ' ' + arr(p + 6 * s) + ' ' + arr(m + 6) + 'L' + arr(p + 6 * s) + ' ' + arr(b - k) + 'Q' + arr(p + 6 * s) + ' ' + arr(b) + ' ' + arr(p) + ' ' + arr(b);
        h += '<g class="accolade' + cl + '" data-sujet="' + d.sujet + '"><path d="' + path + '" fill="none" stroke="' + c + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>';
        h += '<path class="prise" d="' + path + '" fill="none" stroke="transparent" stroke-width="12"/></g>';
      }
    });
    return h;
  }
  function bornesDe(B, ids) {
    var x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    ids.forEach(function (id) { var b = B.get(id); if (!b) return; x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y); x2 = Math.max(x2, b.x + b.w); y2 = Math.max(y2, b.y + b.h); });
    return isFinite(x1) ? { x: x1, y: y1, w: x2 - x1, h: y2 - y1 } : null;
  }
  function bornes(B) {
    var x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    B.forEach(function (b) { x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y); x2 = Math.max(x2, b.x + b.w); y2 = Math.max(y2, b.y + b.h); });
    if (!isFinite(x1)) return { x: 0, y: 0, w: 10, h: 10 };
    return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
  }

  /* ---------- Marqueurs ---------- */
  var MARQUEURS = [
    ['Priorité', ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7']],
    ['Avancement', ['t0', 't25', 't50', 't75', 't100']],
    ['Drapeaux', ['d1', 'd2', 'd3', 'd4', 'd5', 'd6']],
    ['Étoiles', ['e1', 'e2', 'e3', 'e4', 'e5', 'e6']],
    ['Symboles', ['s-ok', 's-non', 's-att', 's-quest', 's-info', 's-plus', 's-moins']],
    ['Humeur', ['h1', 'h2', 'h3']]
  ];
  var TEINTES = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#6366f1', '#a855f7'];
  function glyphe(code) {
    var k = code.charAt(0), v = code.slice(1), c;
    function rond(col, txt) { return '<circle cx="9" cy="9" r="8.2" fill="' + col + '"/><text x="9" y="9.4" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="800" fill="#fff" ' + attrPolice() + '>' + txt + '</text>'; }
    if (k === 'p') return rond(TEINTES[+v - 1], v);
    if (k === 't') {
      var p = +v;
      if (p === 100) return '<circle cx="9" cy="9" r="8.2" fill="#22c55e"/><path d="M5 9.4l2.7 2.7L13 6.6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
      var a = p / 100 * 2 * Math.PI, x = 9 + 6.2 * Math.sin(a), y = 9 - 6.2 * Math.cos(a);
      return '<circle cx="9" cy="9" r="7.5" fill="#fff" stroke="#22c55e" stroke-width="1.6"/>' + (p ? '<path d="M9 9V2.8A6.2 6.2 0 ' + (p > 50 ? 1 : 0) + ' 1 ' + arr(x) + ' ' + arr(y) + 'z" fill="#22c55e"/>' : '');
    }
    if (k === 'd') { c = TEINTES[[0, 1, 2, 3, 4, 5][+v - 1]]; return '<path d="M4 2v14" stroke="#64748b" stroke-width="1.8" stroke-linecap="round"/><path d="M4.6 3h9.2l-2.4 3.4 2.4 3.4H4.6z" fill="' + c + '"/>'; }
    if (k === 'e') { c = TEINTES[+v - 1]; return '<path d="M9 1.6l2.2 4.7 5.1.6-3.8 3.5 1 5-4.5-2.5-4.5 2.5 1-5L1.7 6.9l5.1-.6z" fill="' + c + '"/>'; }
    if (k === 'h') {
      var b = v === '1' ? 'M5.6 10.6q3.4 3.4 6.8 0' : v === '2' ? 'M6 11.6h6' : 'M5.6 12.6q3.4-3.4 6.8 0';
      return '<circle cx="9" cy="9" r="8.2" fill="#facc15"/><circle cx="6.3" cy="7" r="1.1" fill="#422006"/><circle cx="11.7" cy="7" r="1.1" fill="#422006"/><path d="' + b + '" fill="none" stroke="#422006" stroke-width="1.4" stroke-linecap="round"/>';
    }
    if (code === 's-ok') return '<circle cx="9" cy="9" r="8.2" fill="#16a34a"/><path d="M5 9.4l2.7 2.7L13 6.6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    if (code === 's-non') return '<circle cx="9" cy="9" r="8.2" fill="#dc2626"/><path d="M6 6l6 6M12 6l-6 6" stroke="#fff" stroke-width="2" stroke-linecap="round"/>';
    if (code === 's-att') return '<path d="M9 1.8l7.6 13.6H1.4z" fill="#f59e0b"/><path d="M9 6.6v4.2" stroke="#fff" stroke-width="1.9" stroke-linecap="round"/><circle cx="9" cy="13" r="1.05" fill="#fff"/>';
    if (code === 's-quest') return rond('#2563eb', '?');
    if (code === 's-info') return rond('#0891b2', 'i');
    if (code === 's-plus') return rond('#16a34a', '+');
    if (code === 's-moins') return rond('#dc2626', '−');
    return '';
  }

  /* ---------- Dessin d'un sujet ---------- */
  function dessiner(b, opt) {
    opt = opt || {};
    var n = b.n, s = b.s, T = b.T, h = '', w = b.w, ht = b.h;
    var rx = b.prof === 0 ? 16 : b.prof === 1 ? 11 : 8;
    if (s.forme === 'pilule') rx = ht / 2; else if (s.forme === 'rectangle') rx = 3;
    if (s.forme === 'souligne') h += '<rect width="' + w + '" height="' + ht + '" fill="transparent"/><path d="M0 ' + ht + 'H' + w + '" stroke="' + s.trait + '" stroke-width="2" stroke-linecap="round"/>';
    else if (s.forme === 'aucun') h += '<rect width="' + w + '" height="' + ht + '" fill="transparent"/>';
    else if (s.forme === 'contour') h += '<rect width="' + w + '" height="' + ht + '" rx="' + rx + '" fill="' + T.fond + '" stroke="' + s.trait + '" stroke-width="1.8"/>';
    else h += '<rect width="' + w + '" height="' + ht + '" rx="' + rx + '" fill="' + s.fond + '"/>';
    var y = s.padY;
    if (b.ih) {
      h += '<image href="' + n.image.data + '" x="' + arr((w - b.iw) / 2) + '" y="' + y + '" width="' + b.iw + '" height="' + b.ih + '" preserveAspectRatio="xMidYMid meet"/>';
      y += b.ih + 6;
    }
    var x = s.padX;
    (n.marqueurs || []).forEach(function (m, i) {
      h += '<g transform="translate(' + (x + i * 20) + ',' + arr(y + b.lh / 2 - 9) + ')">' + glyphe(m) + '</g>';
    });
    x += b.mw;
    var trou = opt.trous && b.prof >= opt.trous;   // carte à compléter : le texte est remplacé par une ligne à remplir
    if (trou && !souligne(b)) h += '<path d="M' + x + ' ' + arr(y + b.lignes.length * b.lh - 3) + 'H' + arr(x + Math.max(b.tw, 40)) + '" stroke="' + s.texte + '" stroke-opacity=".55" stroke-width="1.2" stroke-dasharray="2 3"/>';
    if (!trou) h += '<text ' + attrPolice() + ' font-size="' + s.fs + '" font-weight="' + s.poids + '"' + (s.italique ? ' font-style="italic"' : '') + ' fill="' + s.texte + '">';
    b.lignes.forEach(function (l, i) {
      if (!trou) h += '<tspan x="' + x + '" y="' + arr(y + b.lh * (i + 0.5)) + '" dominant-baseline="central">' + (echap(l) || ' ') + '</tspan>';
    });
    if (!trou) h += '</text>';
    var xi = x + b.tw + 5, yi = arr(y + b.lh / 2 - 7);
    if (n.note) {
      h += '<g data-act="note" transform="translate(' + xi + ',' + yi + ')" style="cursor:pointer"><title>' + echap(n.note) + '</title><rect width="14" height="14" fill="transparent"/><path d="M2 3.5h10M2 7h10M2 10.5h6" stroke="' + s.texte + '" stroke-opacity=".6" stroke-width="1.5" stroke-linecap="round" fill="none"/></g>';
      xi += 17;
    }
    if (n.lien) h += '<g data-act="lien" transform="translate(' + xi + ',' + yi + ')" style="cursor:pointer"><title>' + echap(n.lien) + '</title><rect width="14" height="14" fill="transparent"/><path d="M5.5 3.2H3v7.8h7.8V8.5M8 3h3v3M11 3L6.4 7.6" stroke="' + s.texte + '" stroke-opacity=".6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>';
    y += b.lignes.length * b.lh;
    if (b.lw && !trou) {
      var xp = s.padX;
      b.puces.forEach(function (p) {
        h += '<rect x="' + xp + '" y="' + (y + 4) + '" width="' + p.w + '" height="17" rx="8.5" fill="' + s.texte + '" fill-opacity=".13"/><text x="' + arr(xp + p.w / 2) + '" y="' + (y + 12.8) + '" text-anchor="middle" dominant-baseline="central" ' + attrPolice() + ' font-size="11" font-weight="600" fill="' + s.texte + '">' + echap(p.t) + '</text>';
        xp += p.w + 4;
      });
    }
    if (opt.choisi) h += '<rect x="-4" y="-4" width="' + (w + 8) + '" height="' + (ht + 8) + '" rx="' + (Math.min(rx, 16) + 4) + '" fill="none" stroke="#4f46e5" stroke-width="2.2"/>';
    // Bouton replier / déplier (pas sur le sujet central)
    if (n.enfants.length && b.prof > 0 || (n.enfants.length && b.libre)) {
      var px = b.dir === 0 ? w / 2 : b.dir > 0 ? w + 11 : -11, py = b.dir === 0 ? ht + 11 : souligne(b) ? ht : ht / 2;
      if (!(opt.fixe && !n.plie)) {
        h += '<g class="pli' + (n.plie ? ' ferme' : '') + '" transform="translate(' + arr(px) + ',' + arr(py) + ')"' + (n.plie || opt.fixe ? '' : ' opacity="' + (opt.choisi ? 1 : 0) + '"') + '><circle r="7.6" fill="' + T.fond + '" stroke="' + s.trait + '" stroke-width="1.5"/>' +
          (n.plie ? '<text text-anchor="middle" dominant-baseline="central" y=".5" ' + attrPolice() + ' font-size="9.5" font-weight="700" fill="' + T.texte + '">' + Math.min(99, compterSous(n)) + '</text>'
            : '<path d="M-3.4 0h6.8" stroke="' + T.texte + '" stroke-width="1.5" stroke-linecap="round"/>') + '</g>';
      }
    }
    return h;
  }
  function compterSous(n) { var k = 0; (function a(x) { x.enfants.forEach(function (e) { k += 1; a(e); }); })(n); return k; }

  function cheminLien(pb, cb) {
    if (cb.dir === 0) {
      var x1 = pb.x + pb.w / 2, y1 = pb.y + pb.h, x2 = cb.x + cb.w / 2, y2 = cb.y, ym = y1 + (y2 - y1) / 2;
      var r = Math.min(8, Math.abs(x2 - x1) / 2), sg = x2 > x1 ? 1 : -1;
      return 'M' + arr(x1) + ' ' + arr(y1) + 'L' + arr(x1) + ' ' + arr(ym - r) + 'Q' + arr(x1) + ' ' + arr(ym) + ' ' + arr(x1 + sg * r) + ' ' + arr(ym) + 'L' + arr(x2 - sg * r) + ' ' + arr(ym) + 'Q' + arr(x2) + ' ' + arr(ym) + ' ' + arr(x2) + ' ' + arr(ym + r) + 'L' + arr(x2) + ' ' + arr(y2);
    }
    var d = cb.dir;
    var xa = d > 0 ? pb.x + pb.w : pb.x, ya = souligne(pb) ? pb.y + pb.h : pb.y + pb.h / 2;
    var xb = d > 0 ? cb.x : cb.x + cb.w, yb = souligne(cb) ? cb.y + cb.h : cb.y + cb.h / 2;
    var mx = xa + (xb - xa) * 0.5;
    return 'M' + arr(xa) + ' ' + arr(ya) + 'C' + arr(mx) + ' ' + arr(ya) + ' ' + arr(mx) + ' ' + arr(yb) + ' ' + arr(xb) + ' ' + arr(yb);
  }
  function geoLiaison(a, b) {
    function bord(bx, vers) {
      var cx = bx.x + bx.w / 2, cy = bx.y + bx.h / 2, dx = vers.x - cx, dy = vers.y - cy;
      if (!dx && !dy) return { x: cx, y: cy };
      var k = Math.min((bx.w / 2 + 5) / Math.abs(dx || 1e-9), (bx.h / 2 + 5) / Math.abs(dy || 1e-9));
      return { x: cx + dx * k, y: cy + dy * k };
    }
    var ca = { x: a.x + a.w / 2, y: a.y + a.h / 2 }, cb = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
    var dx = cb.x - ca.x, dy = cb.y - ca.y, L = Math.hypot(dx, dy) || 1;
    var c = { x: (ca.x + cb.x) / 2 - dy / L * L * 0.18, y: (ca.y + cb.y) / 2 + dx / L * L * 0.18 };
    var p1 = bord(a, c), p2 = bord(b, c);
    return { d: 'M' + arr(p1.x) + ' ' + arr(p1.y) + 'Q' + arr(c.x) + ' ' + arr(c.y) + ' ' + arr(p2.x) + ' ' + arr(p2.y), mx: (p1.x + 2 * c.x + p2.x) / 4, my: (p1.y + 2 * c.y + p2.y) / 4 };
  }
  function dessinerLiaison(l, B, T, choisie) {
    var a = B.get(l.de), b = B.get(l.vers);
    if (!a || !b) return '';
    var g = geoLiaison(a, b), col = choisie ? '#4f46e5' : T.liaison, h = '';
    h += '<path d="' + g.d + '" fill="none" stroke="' + col + '" stroke-width="' + (choisie ? 2.4 : 1.8) + '" stroke-dasharray="6 5" stroke-linecap="round" marker-end="url(#fleche)"/>';
    h += '<path class="liaison" data-l="' + l.id + '" d="' + g.d + '" fill="none" stroke="transparent" stroke-width="16" style="cursor:pointer"/>';
    if (l.t) {
      var tw = Math.ceil(largeurTexte(l.t, '600 12px ' + POLICE)) + 12;
      h += '<g class="liaison" data-l="' + l.id + '" style="cursor:pointer"><rect x="' + arr(g.mx - tw / 2) + '" y="' + arr(g.my - 10) + '" width="' + tw + '" height="20" rx="6" fill="' + T.fond + '"/><text x="' + arr(g.mx) + '" y="' + arr(g.my) + '" text-anchor="middle" dominant-baseline="central" ' + attrPolice() + ' font-size="12" font-weight="600" fill="' + col + '">' + echap(l.t) + '</text></g>';
    }
    return h;
  }

  /* Dessin complet et autonome d'une feuille (vignettes, image, impression). */
  function svgAutonome(f, opt) {
    opt = opt || {};
    var B = disposer(f, opt.profMax), T = THEMES[f.theme] || THEMES.classique, bo = bornes(B), m = opt.marge == null ? 40 : opt.marge;
    var vb = [Math.floor(bo.x - m), Math.floor(bo.y - m), Math.ceil(bo.w + 2 * m), Math.ceil(bo.h + 2 * m)];
    var h = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb.join(' ') + '"' + (opt.taille ? ' width="' + vb[2] + '" height="' + vb[3] + '"' : '') + '>';
    h += '<defs><marker id="fleche" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="' + T.liaison + '"/></marker></defs>';
    h += '<rect x="' + vb[0] + '" y="' + vb[1] + '" width="' + vb[2] + '" height="' + vb[3] + '" fill="' + T.fond + '"/>';
    var avant = selCadre; selCadre = null; h += dessinerDecor(B, T); selCadre = avant;
    B.forEach(function (b) {
      if (!b.parent) return;
      var pb = B.get(b.parent.id);
      h += '<path d="' + cheminLien(pb, b) + '" fill="none" stroke="' + b.couleur + '" stroke-width="' + (pb.prof === 0 ? 2.8 : 2) + '" stroke-linecap="round"/>';
    });
    (f.liaisons || []).forEach(function (l) { h += dessinerLiaison(l, B, T, false); });
    B.forEach(function (b) { h += '<g transform="translate(' + arr(b.x) + ',' + arr(b.y) + ')">' + dessiner(b, { fixe: true, trous: opt.trous }) + '</g>'; });
    return { svg: h + '</svg>', w: vb[2], h: vb[3] };
  }

  /* ---------- Rendu de l'éditeur ---------- */
  function signature(b) {
    var n = b.n, s = b.s;
    return [n.t, b.w, b.h, b.dir, s.fond, s.texte, s.forme, s.fs, s.poids, !!s.italique, s.trait, (n.marqueurs || []).join(), (n.etiquettes || []).join('¦'),
      n.note || '', n.lien || '', !!n.plie, n.enfants.length, n.plie ? compterSous(n) : 0, sel.has(n.id), n.image ? n.image.data.length + ':' + (n.image.echelle || 1) : 0, feuille.theme, feuille.police || '', pres && pres.trous || 0].join('|');
  }
  function rendre(opt) {
    opt = opt || {};
    if (!feuille) return;
    boites = disposer(feuille, 0, pres ? pres.etapes[pres.i] : null);
    var T = THEMES[feuille.theme] || THEMES.classique;
    $('fond').setAttribute('fill', T.fond);
    if (opt.sansAnim) svg.classList.add('sansanim');
    boites.forEach(function (b, id) {
      var e = elems.get(id);
      if (!e) {
        var g = document.createElementNS(NS, 'g');
        g.setAttribute('class', 'noeud' + (opt.sansAnim ? '' : ' neuf'));
        g.setAttribute('data-id', id);
        cNoeuds.appendChild(g);
        e = { g: g, sig: null }; elems.set(id, e);
      }
      var sig = signature(b);
      if (e.sig !== sig) { e.g.innerHTML = dessiner(b, { choisi: sel.has(id), trous: pres && pres.trous }); e.sig = sig; }
      e.g.style.transform = 'translate(' + arr(b.x) + 'px,' + arr(b.y) + 'px)';
      var el = elLiens.get(id);
      if (b.parent) {
        if (!el) { el = document.createElementNS(NS, 'path'); el.setAttribute('class', 'lien'); el.setAttribute('fill', 'none'); el.setAttribute('stroke-linecap', 'round'); cLiens.appendChild(el); elLiens.set(id, el); }
        var pb = boites.get(b.parent.id);
        el.style.d = 'path("' + cheminLien(pb, b) + '")';
        el.setAttribute('d', cheminLien(pb, b));
        el.setAttribute('stroke', b.couleur);
        el.setAttribute('stroke-width', pb.prof === 0 ? 2.8 : 2);
      } else if (el) { el.remove(); elLiens.delete(id); }
    });
    var vusEleves = diffusion ? visiblesEleves() : null;
    if (diffusion && diffusion.suivre && principal && vusEleves.has(principal)) diffusion.focus = principal;
    boites.forEach(function (b, id) {
      var cache = !!vusEleves && !vusEleves.has(id), el2 = elLiens.get(id);
      elems.get(id).g.classList.toggle('hors-eleves', cache);
      elems.get(id).g.classList.toggle('en-avant', !!diffusion && diffusion.focus === id && diffusion.mode !== 'carte');
      if (el2) el2.classList.toggle('hors-eleves', cache);
    });
    if (diffusion) planifierPublication();
    elems.forEach(function (e, id) { if (!boites.has(id)) { e.g.remove(); elems.delete(id); } });
    elLiens.forEach(function (el, id) { if (!boites.has(id)) { el.remove(); elLiens.delete(id); } });
    var hl = '';
    feuille.liaisons.forEach(function (l) { hl += dessinerLiaison(l, boites, T, selLiaison === l.id); });
    cLiaisons.innerHTML = hl;
    cCadres.innerHTML = dessinerDecor(boites, T, vusEleves ? function (d) { return d.type === 'cadre' ? d.kids.some(function (id) { return !vusEleves.has(id); }) : !vusEleves.has(d.sujet); } : null);
    appliquerVue();
    if (opt.sansAnim) { void svg.getBoundingClientRect(); svg.classList.remove('sansanim'); }
    majBarre(); majFeuilles();
    if (opt.panneau !== false) majPanneau();
  }
  function toutEffacer() {
    cNoeuds.innerHTML = ''; cLiens.innerHTML = ''; cLiaisons.innerHTML = ''; cDessus.innerHTML = ''; cCadres.innerHTML = '';
    elems.clear(); elLiens.clear();
  }
  function appliquerVue() {
    monde.setAttribute('transform', 'translate(' + arr(vue.x) + ',' + arr(vue.y) + ') scale(' + vue.z + ')');
    $('zoom-val').textContent = Math.round(vue.z * 100) + ' %';
  }
  function ajuster(anime, ids, zmax) {
    var bo = (ids && bornesDe(boites, ids)) || bornes(boites), W = scene.clientWidth, H = scene.clientHeight, max = zmax || (pres ? 1.7 : 1), m = pres ? 150 : 110;
    var z = Math.max(0.12, Math.min(max, (W - m) / bo.w, (H - m) / bo.h));
    var x = W / 2 - (bo.x + bo.w / 2) * z, y = H / 2 - (bo.y + bo.h / 2) * z;
    if (anime === true) return glisserVue(x, y, z);
    vue.z = z; vue.x = x; vue.y = y; appliquerVue();
  }
  var animVue = null;
  function glisserVue(x, y, z) {
    cancelAnimationFrame(animVue);
    var d = { x: vue.x, y: vue.y, z: vue.z }, t0 = performance.now();
    (function pas(t) {
      var k = Math.min(1, (t - t0) / (pres ? 420 : 200)); k = 1 - Math.pow(1 - k, 3);
      vue.x = d.x + (x - d.x) * k; vue.y = d.y + (y - d.y) * k; vue.z = d.z + ((z || d.z) - d.z) * k;
      appliquerVue();
      if (k < 1) animVue = requestAnimationFrame(pas);
    })(t0);
  }
  function zoomer(facteur, cx, cy) {
    var z = Math.max(0.1, Math.min(3, vue.z * facteur));
    if (cx == null) { cx = scene.clientWidth / 2; cy = scene.clientHeight / 2; }
    vue.x = cx - (cx - vue.x) * z / vue.z; vue.y = cy - (cy - vue.y) * z / vue.z; vue.z = z;
    appliquerVue(); placerSaisie();
  }
  function garderVisible(id) {
    var b = boites.get(id); if (!b) return;
    var W = scene.clientWidth, H = scene.clientHeight, m = 60;
    var x1 = vue.x + b.x * vue.z, y1 = vue.y + b.y * vue.z, x2 = x1 + b.w * vue.z, y2 = y1 + b.h * vue.z, dx = 0, dy = 0;
    if (x1 < m) dx = m - x1; else if (x2 > W - m) dx = W - m - x2;
    if (y1 < m) dy = m - y1; else if (y2 > H - m) dy = H - m - y2;
    if (dx || dy) glisserVue(vue.x + dx, vue.y + dy);
  }
  function versMonde(ev) {
    var r = scene.getBoundingClientRect();
    return { x: (ev.clientX - r.left - vue.x) / vue.z, y: (ev.clientY - r.top - vue.y) / vue.z };
  }

  /* ---------- Projection : la carte se dévoile branche par branche ---------- */
  function projeter() {
    finEdition(true); fermerMenu(); choisir(null); mode = null; majMode();
    var vus = [feuille.racine.id], etapes = [vus.slice()];
    feuille.racine.enfants.forEach(function (p) {
      vus.push(p.id); etapes.push(vus.slice());
      if (p.enfants.length && !p.plie) {
        (function tous(n) { n.enfants.forEach(function (e) { vus.push(e.id); tous(e); }); })(p);
        etapes.push(vus.slice());
      }
    });
    if (feuille.libres.length) {
      feuille.libres.forEach(function (l) { (function tous(n) { vus.push(n.id); n.enfants.forEach(tous); })(l); });
      etapes.push(vus.slice());
    }
    pres = { etapes: etapes.map(function (a) { return new Set(a); }), i: 0 };
    document.body.classList.add('presente');
    try { var pf = document.documentElement.requestFullscreen(); if (pf && pf.catch) pf.catch(function () {}); } catch (e) {}
    toutEffacer(); rendre({ sansAnim: true }); ajuster(); majPres();
    setTimeout(function () { if (pres) ajuster(true); }, 350);   // le plein écran change la taille de la scène
  }
  function avancer(delta) {
    if (!pres) return;
    var i = Math.max(0, Math.min(pres.etapes.length - 1, delta === 'fin' ? pres.etapes.length - 1 : pres.i + delta));
    if (i === pres.i) return;
    pres.i = i; rendre(); ajuster(true); majPres();
  }
  function quitterProjection() {
    if (!pres) return;
    pres = null; document.body.classList.remove('presente');
    try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {}
    choisir(feuille.racine.id); toutEffacer(); rendre({ sansAnim: true });
    setTimeout(function () { ajuster(); }, 120);
  }
  function majPres() {
    $('pres-info').innerHTML = pres ? '<button data-p="-1" title="Précédent">←</button><span>' + (pres.i + 1) + ' / ' + pres.etapes.length + '</span><button data-p="1" title="Suivant">→</button><button data-p="fin" title="Tout afficher">Tout</button><button data-p="x" title="Quitter">Quitter</button>' : '';
  }
  $('pres-info').addEventListener('click', function (ev) {
    var b = ev.target.closest('button'); if (!b) return;
    ev.stopPropagation();
    var v = b.dataset.p;
    if (v === 'x') quitterProjection(); else avancer(v === 'fin' ? 'fin' : +v);
  });
  document.addEventListener('fullscreenchange', function () { if (pres && !document.fullscreenElement) quitterProjection(); else if (pres) setTimeout(function () { if (pres) ajuster(true); }, 200); });

  /* ---------- Écran des élèves, piloté depuis la fenêtre du professeur ---------- */
  function descendants(n, dans) { n.enfants.forEach(function (e) { dans.add(e.id); descendants(e, dans); }); (n.resumes || []).forEach(function (r) { dans.add(r.sujet.id); }); return dans; }   // résumés compris
  /* Ce que voient les élèves : le centre, plus les sujets de « vus » dont toute la lignée est montrée. */
  function visiblesEleves() {
    var v = new Set([feuille.racine.id]), d = diffusion;
    (function voir(n) { n.enfants.forEach(function (e) { if (d.vus.has(e.id)) { v.add(e.id); voir(e); } }); })(feuille.racine);
    feuille.libres.forEach(function (l) { if (d.vus.has(l.id)) { v.add(l.id); (function voir(n) { n.enfants.forEach(function (e) { if (d.vus.has(e.id)) { v.add(e.id); voir(e); } }); })(l); } });
    M.parcourir(feuille, function (n) {   // un résumé : quand il est montré et que tous les sujets qu'il couvre le sont
      (n.resumes || []).forEach(function (r) {
        var pl = M.plage(n, r);
        if (pl && d.vus.has(r.sujet.id) && n.enfants.slice(pl[0], pl[1] + 1).every(function (e) { return v.has(e.id); })) v.add(r.sujet.id);
      });
    });
    return v;
  }
  /* Les étapes de « Suivant ». Par branche : la branche, puis tous ses détails. Sujet par sujet : un sujet à la fois. */
  function groupesEleves() {
    var g = [], d = diffusion;
    feuille.racine.enfants.forEach(function (b) {
      if (d.grain === 'sujet') (function dfs(n) { g.push({ tete: n.id, ids: [n.id] }); n.enfants.forEach(dfs); (n.resumes || []).forEach(function (r) { g.push({ tete: r.sujet.id, ids: [r.sujet.id] }); }); })(b);
      else {
        g.push({ tete: b.id, ids: [b.id] });
        var ds = Array.from(descendants(b, new Set()));
        if (ds.length) g.push({ tete: b.id, ids: ds });
      }
    });
    (feuille.racine.resumes || []).forEach(function (r) { g.push({ tete: r.sujet.id, ids: [r.sujet.id] }); });   // résumés des branches principales, à la fin
    feuille.libres.forEach(function (l) { g.push({ tete: l.id, ids: [l.id].concat(Array.from(descendants(l, new Set()))) }); });
    return g;
  }
  function groupeFait(g) { return g.ids.every(function (id) { return diffusion.vus.has(id); }); }
  function cacherEleves(n) { diffusion.vus.delete(n.id); descendants(n, new Set()).forEach(function (id) { diffusion.vus.delete(id); }); }
  function pasEleves(sens) {
    if (!diffusion) return;
    var d = diffusion, l = groupesEleves(), g = null, k;
    if (sens > 0) {
      g = l.find(function (x) { return !groupeFait(x); }); if (!g) return;
      g.ids.forEach(function (id) { d.vus.add(id); });
      var it = info(g.tete); while (it && it.parent && it.parent !== feuille.racine) { d.vus.add(it.parent.id); it = info(it.parent.id); }   // la lignée devient visible
      d.focus = g.tete;
    } else {
      for (k = l.length - 1; k >= 0 && !g; k -= 1) if (l[k].ids.some(function (id) { return d.vus.has(id); })) g = l[k];
      if (!g) return;
      g.ids.forEach(function (id) { var x = info(id); if (x) cacherEleves(x.sujet); });
      var avant = null; for (k = l.indexOf(g) - 1; k >= 0 && !avant; k -= 1) if (groupeFait(l[k])) avant = l[k];
      d.focus = avant ? avant.tete : feuille.racine.id;
    }
    rendre();
  }
  function toutEleves(oui) {
    if (!diffusion) return;
    diffusion.vus.clear();
    if (oui) { descendants(feuille.racine, diffusion.vus); feuille.libres.forEach(function (l) { diffusion.vus.add(l.id); descendants(l, diffusion.vus); }); }
    diffusion.focus = feuille.racine.id;
    rendre();
  }
  var tPublie = null;
  function planifierPublication() { if (tPublie) return; tPublie = setTimeout(function () { tPublie = null; publierEleves(); }, 30); }
  function publierEleves() {
    if (!diffusion || !feuille) return;
    var d = diffusion, vis = visiblesEleves();
    if (!d.focus || !vis.has(d.focus)) d.focus = feuille.racine.id;
    try { d.bus.postMessage({ type: 'etat', titre: carte.titre, feuille: JSON.parse(JSON.stringify(feuille)), visibles: Array.from(vis), trous: d.trous || 0, mode: d.mode, focus: d.focus, noir: !!d.noir }); } catch (e) {}
  }
  function diffuser() {
    if (diffusion) { ouvrirPanneau('eleves'); try { diffusion.fen && diffusion.fen.focus(); } catch (e) {} return; }
    finEdition(true); fermerMenu();
    var session = M.uid('e'), bus;
    try { bus = new BroadcastChannel('atelier-carte-mentale-' + session); } catch (e) { return; }
    diffusion = { session: session, bus: bus, fen: null, vus: new Set(), trous: 0, mode: 'carte', grain: 'branche', focus: feuille.racine.id, suivre: false, noir: false };
    bus.onmessage = function (ev) { if ((ev.data || {}).type === 'pret') publierEleves(); };
    diffusion.fen = window.open((window.CARTE_EN_LIGNE ? location.pathname : 'cartes-mentales.html') + '?role=projection&session=' + session, 'carte-eleves-' + session, 'width=1280,height=800');
    diffusion.veille = setInterval(function () { if (diffusion && diffusion.fen && diffusion.fen.closed) arreterDiffusion(true); }, 1000);
    ouvrirPanneau('eleves'); rendre();
  }
  function arreterDiffusion(dejaFermee) {
    if (!diffusion) return;
    var d = diffusion; diffusion = null;
    clearInterval(d.veille);
    try { d.bus.postMessage({ type: 'fin' }); } catch (e) {}
    try { if (!dejaFermee && d.fen) d.fen.close(); } catch (e) {}
    try { d.bus.close(); } catch (e) {}
    if (panneau === 'eleves') panneau = null;
    clePanneau = ''; if (feuille) rendre(); majBarre();
  }
  window.addEventListener('pagehide', function () { if (diffusion) arreterDiffusion(); });
  function panneauEleves() {
    var d = diffusion, l = groupesEleves(), faites = l.filter(groupeFait).length, T = THEMES[feuille.theme] || THEMES.classique;
    function choix(nom, v, label) { return '<button data-e="' + nom + '" data-v="' + v + '"' + (String(d[nom]) === String(v) ? ' class="actif"' : '') + '>' + label + '</button>'; }
    var h = '<div class="tb-tete"><b>Écran des élèves</b><span>' + faites + ' / ' + l.length + '</span></div>';
    h += '<section><div class="tb-pas"><button data-e="prec"' + (faites ? '' : ' disabled') + '>← Précédent</button><button class="fort" data-e="suiv"' + (faites < l.length ? '' : ' disabled') + '>Suivant →</button></div>';
    h += '<div class="tb-pas"><button data-e="rien">Centre seul</button><button data-e="tout">Tout montrer</button></div></section>';
    h += '<section><h3>Vue</h3><div class="tb-trois">' + choix('mode', 'carte', 'Carte') + choix('mode', 'gros', 'Gros plan') + choix('mode', 'diapo', 'Diapositive') + '</div>';
    h += '<div class="tb-pas" style="margin-top:8px">' + choix('grain', 'branche', 'Par branche') + choix('grain', 'sujet', 'Sujet par sujet') + '</div>';
    h += '<div class="tb-pas" style="margin-top:8px"><button data-e="suivre"' + (d.suivre ? ' class="actif"' : '') + '>Suivre ma sélection</button><button data-e="noir"' + (d.noir ? ' class="actif noir"' : '') + '>Écran noir</button></div></section>';
    var fo = info(d.focus);
    if (fo && fo.sujet.note) h += '<section><h3>Ma note</h3><div class="tb-note">' + echap(fo.sujet.note) + '</div></section>';
    h += '<section><h3>Branches</h3><div class="tb-branches">';
    feuille.racine.enfants.forEach(function (b, i) {
      var vue = d.vus.has(b.id), ds = Array.from(descendants(b, new Set())), det = vue && ds.length && ds.every(function (id) { return d.vus.has(id); });
      var col = (b.style && b.style.fond) || T.palette[i % T.palette.length];
      h += '<div class="tb-branche' + (vue ? ' vue' : '') + (d.focus === b.id ? ' encours' : '') + '"><button class="tb-oeil" data-e="branche" data-id="' + b.id + '" title="' + (vue ? 'Cacher' : 'Montrer') + '"><i style="background:' + col + '"></i><span>' + echap(String(b.t).replace(/\n/g, ' ')) + '</span></button>' +
        (ds.length ? '<button class="tb-det' + (det ? ' actif' : '') + '" data-e="details" data-id="' + b.id + '" title="Détails de la branche">' + ds.length + '</button>' : '') +
        '<button class="tb-cible" data-e="focus" data-id="' + b.id + '" title="Mettre en avant sur l’écran des élèves">◎</button></div>';
    });
    h += '</div></section>';
    h += '<section><h3>Texte</h3><div class="rangee">' + choix('trous', 0, 'Complet') + choix('trous', 2, 'Sous-sujets vides') + choix('trous', 1, 'Tout vide') + '</div></section>';
    h += '<section><button class="tb-fin" data-e="fin">Fermer l’écran des élèves</button></section>';
    return h;
  }

  /* ---------- Historique ---------- */
  function historiser() {
    pile.push(JSON.stringify(carte));
    if (pile.length > 150) pile.shift();
    refaire = [];
  }
  function restaurer(json) {
    var c = JSON.parse(json), i = donnees.cartes.findIndex(function (x) { return x.id === carte.id; });
    donnees.cartes[i] = c; carte = c;
    feuille = c.feuilles.find(function (f) { return f.id === feuille.id; }) || c.feuilles[0];
    sel.forEach(function (id) { if (!M.trouver(feuille, id)) sel.delete(id); });
    if (principal && !sel.has(principal)) principal = sel.values().next().value || null;
    selLiaison = null;
    rendre(); sauver();
  }
  function annuler() { if (!pile.length) return; refaire.push(JSON.stringify(carte)); restaurer(pile.pop()); }
  function retablir() { if (!refaire.length) return; pile.push(JSON.stringify(carte)); restaurer(refaire.pop()); }
  /* [EN LIGNE] Une nouvelle version de la carte arrive de Firebase (écrite par l'autre personne, ou fusionnée).
     Refusée (false) pendant une saisie ou un geste en cours : en-ligne.js la représente un peu plus tard. */
  function recevoirDistante(c) {
    var i = donnees.cartes.findIndex(function (x) { return x.id === c.id; });
    if (i < 0) { donnees.cartes.push(c); noter(donnees); return true; }
    if (!carte || carte.id !== c.id) { donnees.cartes[i] = c; noter(donnees); return true; }
    if (edition || appui || tSauve || document.activeElement === $('titre-carte') || (document.activeElement && $('panneau').contains(document.activeElement) && /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName))) return false;
    donnees.cartes[i] = c; carte = c; noter(donnees);
    feuille = (feuille && c.feuilles.find(function (f) { return f.id === feuille.id; })) || c.feuilles[0];
    sel.forEach(function (id) { if (!M.trouver(feuille, id)) sel.delete(id); });
    if (principal && !sel.has(principal)) principal = sel.values().next().value || null;
    if (selLiaison && !feuille.liaisons.some(function (l) { return l.id === selLiaison; })) selLiaison = null;
    rendre({ panneau: false }); majPanneau();
    return true;
  }
  if (window.CARTE_EN_LIGNE) window.CARTE_EN_LIGNE.recevoir = recevoirDistante;

  /* ---------- Sélection ---------- */
  function choisir(id, ajouter) {
    selLiaison = null; selCadre = null;
    if (!ajouter) sel.clear();
    if (id) {
      if (ajouter && sel.has(id)) { sel.delete(id); principal = sel.size ? Array.from(sel).pop() : null; }
      else { sel.add(id); principal = id; }
    } else if (!ajouter) principal = null;
  }
  function info(id) { return id ? M.trouver(feuille, id) : null; }
  function racinesChoisies() {   // sujets choisis dont aucun ancêtre n'est choisi
    var out = [];
    sel.forEach(function (id) {
      var i = info(id); if (!i) return;
      var couvert = false;
      sel.forEach(function (autre) { if (autre !== id) { var a = info(autre); if (a && M.contient(a.sujet, id)) couvert = true; } });
      if (!couvert) out.push(i);
    });
    return out;
  }

  /* ---------- Commandes ---------- */
  function ajouterEnfant() {
    var i = info(principal) || info(feuille.racine.id);
    if (i.resume) return;   // le sujet d'un résumé n'a pas de sous-sujets
    historiser();
    var n = M.sujet(i.prof === 0 && !i.libre ? 'Sujet principal' : 'Sous-sujet');
    i.sujet.enfants.push(n); i.sujet.plie = false;
    choisir(n.id); rendre(); garderVisible(n.id); sauver(); editer(n.id);
  }
  function ajouterFrere(avant) {
    var i = info(principal);
    if (i && i.resume) return;
    if (!i || (!i.parent && !i.libre)) return ajouterEnfant();
    historiser();
    var n;
    if (!i.parent) {   // sujet libre : un nouveau sujet libre en dessous
      var b = boites.get(i.sujet.id);
      n = M.sujet('Sujet libre'); n.x = i.sujet.x; n.y = (i.sujet.y || 0) + (b ? b.sh || b.h : 40) + 24;
      feuille.libres.push(n);
    } else {
      n = M.sujet(i.prof === 1 && !i.libre ? 'Sujet principal' : 'Sous-sujet');
      var k = i.parent.enfants.indexOf(i.sujet);
      i.parent.enfants.splice(avant ? k : k + 1, 0, n);
    }
    choisir(n.id); rendre(); garderVisible(n.id); sauver(); editer(n.id);
  }
  function ajouterLibre(pt) {
    historiser();
    var n = M.sujet('Sujet libre'); n.x = Math.round(pt.x - 40); n.y = Math.round(pt.y - 16);
    feuille.libres.push(n);
    choisir(n.id); rendre(); sauver(); editer(n.id);
  }
  function retirer(i) {
    if (i.resume) { i.porteur.resumes = (i.porteur.resumes || []).filter(function (r) { return r !== i.resume; }); M.reparerPlages(i.porteur); return; }
    if (i.parent) { M.avantRetrait(i.parent, i.sujet); i.parent.enfants.splice(i.parent.enfants.indexOf(i.sujet), 1); M.reparerPlages(i.parent); }
    else { var k = feuille.libres.indexOf(i.sujet); if (k >= 0) feuille.libres.splice(k, 1); }
  }
  function supprimer() {
    if (selCadre) {
      var ic = info(selCadre.porteur);
      if (ic) { historiser(); ic.sujet.encadres = (ic.sujet.encadres || []).filter(function (e) { return e.id !== selCadre.id; }); M.reparerPlages(ic.sujet); }
      selCadre = null; rendre(); sauver(); return;
    }
    if (selLiaison) {
      historiser();
      feuille.liaisons = feuille.liaisons.filter(function (l) { return l.id !== selLiaison; });
      selLiaison = null; rendre(); sauver(); return;
    }
    var rs = racinesChoisies().filter(function (i) { return i.sujet !== feuille.racine; });
    if (!rs.length) return;
    historiser();
    var suivant = null;
    rs.forEach(function (i) {
      if (i.resume) suivant = i.porteur.id;
      else if (i.parent) {
        var k = i.parent.enfants.indexOf(i.sujet);
        suivant = (i.parent.enfants[k + 1] || i.parent.enfants[k - 1] || i.parent).id;
      } else suivant = feuille.racine.id;
      retirer(i);
    });
    var restants = new Set(); M.parcourir(feuille, function (n) { restants.add(n.id); });
    feuille.liaisons = feuille.liaisons.filter(function (l) { return restants.has(l.de) && restants.has(l.vers); });
    choisir(restants.has(suivant) ? suivant : feuille.racine.id);
    rendre(); sauver();
  }
  function plier() {
    var cibles = Array.from(sel).map(info).filter(function (i) { return i && i.sujet.enfants.length && (i.parent || i.libre); });
    if (!cibles.length) return;
    historiser();
    var ouvrir = cibles.every(function (i) { return i.sujet.plie; });
    cibles.forEach(function (i) { i.sujet.plie = !ouvrir; });
    rendre(); sauver();
  }
  function copier(couper) {
    var rs = racinesChoisies(); if (!rs.length) return;
    presse = rs.map(function (i) { return JSON.stringify(i.sujet); });
    try { navigator.clipboard.writeText(rs.map(function (i) { return M.versPlan(i.sujet); }).join('')); } catch (e) {}
    if (couper) supprimer();
  }
  function coller() {
    if (!presse || !presse.length) return;
    var i = info(principal) || info(feuille.racine.id);
    if (i.resume) i = info(i.porteur.id);
    historiser();
    var dernier = null;
    presse.forEach(function (j) { dernier = M.cloner(JSON.parse(j)); i.sujet.enfants.push(dernier); });
    i.sujet.plie = false;
    choisir(dernier.id); rendre(); garderVisible(dernier.id); sauver();
  }
  function dupliquer() {
    var rs = racinesChoisies().filter(function (i) { return i.parent; }); if (!rs.length) return;
    historiser();
    var dernier = null;
    rs.forEach(function (i) { dernier = M.cloner(i.sujet); i.parent.enfants.splice(i.parent.enfants.indexOf(i.sujet) + 1, 0, dernier); });
    choisir(dernier.id); rendre(); sauver();
  }
  function deplacerRang(delta) {
    var i = info(principal); if (!i || !i.parent) return;
    var l = i.parent.enfants, k = l.indexOf(i.sujet), j = k + delta;
    if (j < 0 || j >= l.length) return;
    historiser(); l.splice(k, 1); l.splice(j, 0, i.sujet); rendre(); garderVisible(i.sujet.id); sauver();
  }
  function modifier(fn) {   // applique fn à chaque sujet choisi
    var cibles = Array.from(sel).map(info).filter(Boolean); if (!cibles.length) return;
    historiser(); cibles.forEach(function (i) { fn(i.sujet); }); rendre(); sauver();
  }
  function styler(champ, valeur) {
    modifier(function (n) {
      n.style = n.style || {};
      if (valeur == null) delete n.style[champ]; else n.style[champ] = valeur;
      if (!Object.keys(n.style).length) delete n.style;
    });
  }
  function basculerMarqueur(code) {
    var groupe = code.charAt(0);
    modifier(function (n) {
      var l = n.marqueurs || [], avait = l.indexOf(code) >= 0;
      l = l.filter(function (m) { return m.charAt(0) !== groupe; });
      if (!avait) l.push(code);
      if (l.length) n.marqueurs = l; else delete n.marqueurs;
    });
  }
  function creerLiaison(de, vers) {
    if (!de || !vers || de === vers) return;
    historiser();
    var l = { id: M.uid('l'), de: de, vers: vers, t: '' };
    feuille.liaisons.push(l);
    sel.clear(); principal = null; selLiaison = l.id;
    rendre(); sauver();
  }
  /* [ENCADRÉS 15/10/2026] Sujets choisis qui ont le même parent que le sujet principal → [parent, premier, dernier]. */
  function plageChoisie() {
    var ip = info(principal); if (!ip || !ip.parent || ip.resume) return null;
    var l = ip.parent.enfants, ks = [];
    sel.forEach(function (id) { var i = info(id); if (i && i.parent === ip.parent) ks.push(l.indexOf(i.sujet)); });
    return { porteur: ip.parent, de: l[Math.min.apply(null, ks)].id, a: l[Math.max.apply(null, ks)].id };
  }
  function encadrer() {
    var pl = plageChoisie(); if (!pl) return;
    historiser();
    var e = { id: M.uid('p'), de: pl.de, a: pl.a };
    (pl.porteur.encadres = pl.porteur.encadres || []).push(e);
    sel.clear(); principal = null; selLiaison = null; selCadre = { id: e.id, porteur: pl.porteur.id };
    rendre(); sauver();
    editerCadre();
  }
  function resumer() {
    var pl = plageChoisie(); if (!pl) return;
    historiser();
    var r = { id: M.uid('p'), de: pl.de, a: pl.a, sujet: M.sujet('Résumé') };
    (pl.porteur.resumes = pl.porteur.resumes || []).push(r);
    choisir(r.sujet.id); rendre(); garderVisible(r.sujet.id); sauver(); editer(r.sujet.id);
  }
  function cadreChoisi() {
    var ic = selCadre && info(selCadre.porteur);
    return ic ? (ic.sujet.encadres || []).find(function (e) { return e.id === selCadre.id; }) || null : null;
  }
  function editerCadre() {
    var e = cadreChoisi(); if (!e) return;
    demander({ titre: 'Titre de l’encadré', aide: 'Laisser vide pour un encadré sans titre.', valeur: e.t || '' }).then(function (v) {
      if (v == null) return;
      var t = v.trim().slice(0, 60), e2 = cadreChoisi() || e;
      if ((e2.t || '') === t) return;
      historiser(); if (t) e2.t = t; else delete e2.t; rendre(); sauver();
    });
  }
  function menuCadre(x, y) {
    var e = cadreChoisi(); if (!e) return;
    function couleur(c) { return function () { var e2 = cadreChoisi(); if (!e2) return; historiser(); if (c) e2.couleur = c; else delete e2.couleur; rendre(); sauver(); }; }
    var noms = ['Rouge', 'Orange', 'Jaune', 'Vert', 'Turquoise', 'Indigo', 'Violet'];
    ouvrirMenu(x, y, [{ label: e.t ? 'Modifier le titre' : 'Ajouter un titre', fn: editerCadre }].concat(e.t ? [{ label: 'Retirer le titre', fn: function () { var e2 = cadreChoisi(); if (e2) { historiser(); delete e2.t; rendre(); sauver(); } } }] : [])
      .concat(['-', { label: 'Couleur de la branche', fn: couleur(null) }], TEINTES.map(function (c, k) { return { label: noms[k], fn: couleur(c) }; }),
        ['-', { label: 'Retirer l’encadré', kbd: '⌫', danger: true, fn: supprimer }]));
  }
  function modeLiaison() {
    if (sel.size === 2) { var ids = Array.from(sel); return creerLiaison(ids[0], ids[1]); }
    if (!principal) return;
    mode = mode === 'liaison' ? null : 'liaison';
    majMode(); majBarre();
  }
  function majMode() {
    var a = $('aide-mode');
    a.classList.toggle('cache', mode !== 'liaison');
    if (mode === 'liaison') a.textContent = 'Cliquer le sujet à relier';
  }

  /* ---------- Saisie du texte ---------- */
  function editer(id, vider) {
    finEdition(true);
    var b = boites.get(id); if (!b) return;
    edition = { type: 'sujet', id: id };
    var s = b.s;
    saisie.style.font = police(s);
    saisie.style.lineHeight = b.lh + 'px';
    saisie.style.color = s.texte;
    saisie.style.background = s.fond || b.T.fond;
    saisie.style.padding = s.padY + 'px ' + s.padX + 'px ' + s.padY + 'px ' + (s.padX + b.mw) + 'px';
    saisie.style.minWidth = b.w + 'px';
    saisie.style.maxWidth = ((b.prof === 0 ? 340 : 300) + 2 * s.padX + b.mw + 4) + 'px';
    saisie.style.textAlign = 'left';
    saisie.textContent = vider ? '' : b.n.t;
    saisie.classList.remove('cache');
    placerSaisie();
    saisie.focus();
    if (!vider) document.getSelection().selectAllChildren(saisie);
  }
  function editerLiaison(id) {
    finEdition(true);
    var l = feuille.liaisons.find(function (x) { return x.id === id; }); if (!l) return;
    edition = { type: 'liaison', id: id };
    saisie.style.font = '600 12px ' + POLICE; saisie.style.lineHeight = '18px';
    saisie.style.color = '#172033'; saisie.style.background = '#fff'; saisie.style.padding = '3px 8px';
    saisie.style.minWidth = '70px'; saisie.style.maxWidth = '260px'; saisie.style.textAlign = 'center';
    saisie.textContent = l.t || '';
    saisie.classList.remove('cache');
    placerSaisie(); saisie.focus(); document.getSelection().selectAllChildren(saisie);
  }
  function placerSaisie() {
    if (!edition) return;
    var x, y;
    if (edition.type === 'sujet') {
      var b = boites.get(edition.id); if (!b) return;
      x = b.x; y = b.y + (b.ih ? b.ih + 6 : 0);
    } else {
      var l = feuille.liaisons.find(function (q) { return q.id === edition.id; });
      var a = l && boites.get(l.de), c = l && boites.get(l.vers); if (!a || !c) return;
      var g = geoLiaison(a, c); x = g.mx - 40; y = g.my - 12;
    }
    saisie.style.left = (vue.x + x * vue.z) + 'px';
    saisie.style.top = (vue.y + y * vue.z) + 'px';
    saisie.style.transform = 'scale(' + vue.z + ')';
  }
  function finEdition(valider) {
    if (!edition) return;
    var e = edition; edition = null;
    saisie.blur();   // tout de suite : un « blur » tardif fermerait la saisie suivante
    saisie.classList.add('cache');
    if (valider) {
      var t = saisie.innerText.replace(/ /g, ' ').replace(/\n+$/, '');
      if (e.type === 'sujet') {
        var i = info(e.id);
        if (i && i.sujet.t !== t) { historiser(); i.sujet.t = t; sauver(); }
      } else {
        var l = feuille.liaisons.find(function (x) { return x.id === e.id; });
        if (l && (l.t || '') !== t.trim()) { historiser(); l.t = t.trim(); sauver(); }
      }
    }
    rendre();
  }
  saisie.addEventListener('keydown', function (ev) {
    ev.stopPropagation();
    if (ev.key === 'Enter' && ev.shiftKey) { ev.preventDefault(); document.execCommand('insertLineBreak'); }
    else if (ev.key === 'Enter') { ev.preventDefault(); finEdition(true); }
    else if (ev.key === 'Escape') { ev.preventDefault(); finEdition(false); }
    else if (ev.key === 'Tab') { ev.preventDefault(); var etait = edition && edition.type === 'sujet'; finEdition(true); if (etait) ajouterEnfant(); }
  });
  saisie.addEventListener('paste', function (ev) {
    ev.preventDefault();
    document.execCommand('insertText', false, (ev.clipboardData || window.clipboardData).getData('text/plain'));
  });
  saisie.addEventListener('blur', function () { finEdition(true); });

  /* ---------- Souris ---------- */
  var appui = null;
  svg.addEventListener('pointerdown', function (ev) {
    if (ev.button === 2 || ELEVES) return;
    if (pres) { avancer(1); return; }
    fermerMenu();
    var cible = ev.target;
    var pli = cible.closest && cible.closest('.pli');
    var act = cible.closest && cible.closest('[data-act]');
    var gn = cible.closest && cible.closest('.noeud');
    var gl = cible.closest && cible.closest('.liaison');
    var gc = cible.closest && cible.closest('.cadre'), ga = cible.closest && cible.closest('.accolade');
    if (!gn && ga) { finEdition(true); choisir(ga.getAttribute('data-sujet')); rendre(); return; }
    if (!gn && gc) { finEdition(true); choisir(null); selCadre = { id: gc.getAttribute('data-cadre'), porteur: gc.getAttribute('data-porteur') }; rendre(); return; }
    if (pli && gn) {
      ev.preventDefault(); finEdition(true);
      var ip = info(gn.getAttribute('data-id'));
      historiser(); ip.sujet.plie = !ip.sujet.plie; choisir(ip.sujet.id); rendre(); sauver(); return;
    }
    if (gn) {
      var id = gn.getAttribute('data-id');
      if (edition) finEdition(true);
      if (mode === 'liaison') { mode = null; majMode(); creerLiaison(principal, id); return; }
      var multi = ev.shiftKey || ev.metaKey || ev.ctrlKey;
      var dejaChoisi = sel.has(id);
      if (multi) choisir(id, true); else if (!dejaChoisi) choisir(id);
      rendre();
      if (act) {
        if (act.getAttribute('data-act') === 'note') ouvrirPanneau('note');
        else { var il = info(id); if (il && il.sujet.lien) ouvrirLien(il.sujet.lien); }
        return;
      }
      appui = { type: 'noeud', id: id, x: ev.clientX, y: ev.clientY, traine: false, multi: multi, dejaChoisi: dejaChoisi };
      return;
    }
    if (gl) { finEdition(true); sel.clear(); principal = null; selLiaison = gl.getAttribute('data-l'); rendre(); return; }
    finEdition(true);
    appui = { type: 'fond', x: ev.clientX, y: ev.clientY, vx: vue.x, vy: vue.y, bouge: false };
  });
  window.addEventListener('pointermove', function (ev) {
    if (!appui) return;
    var dx = ev.clientX - appui.x, dy = ev.clientY - appui.y;
    if (appui.type === 'fond') {
      if (!appui.bouge && Math.hypot(dx, dy) < 4) return;
      appui.bouge = true; scene.classList.add('main');
      vue.x = appui.vx + dx; vue.y = appui.vy + dy; appliquerVue();
      return;
    }
    if (!appui.traine) {
      if (Math.hypot(dx, dy) < 6 || appui.id === feuille.racine.id) return;
      appui.traine = true;
      appui.sujets = racinesChoisies().filter(function (i) { return i.sujet !== feuille.racine && !i.resume; });
      if (!appui.sujets.length) { appui = null; return; }
      appui.sujets.forEach(function (i) { var e = elems.get(i.sujet.id); if (e) e.g.classList.add('traine'); });
      var f = $('fantome');
      f.textContent = appui.sujets.length > 1 ? appui.sujets.length + ' sujets' : (appui.sujets[0].sujet.t || 'Sujet');
      f.classList.remove('cache');
    }
    var fa = $('fantome'); fa.style.left = (ev.clientX + 14) + 'px'; fa.style.top = (ev.clientY + 12) + 'px';
    appui.depot = chercherDepot(ev);
    dessinerDepot(appui.depot);
  });
  window.addEventListener('pointerup', function (ev) {
    if (!appui) return;
    var a = appui; appui = null;
    scene.classList.remove('main');
    if (a.type === 'fond') {
      if (!a.bouge && (sel.size || selLiaison || selCadre || mode)) { choisir(null); mode = null; majMode(); rendre(); }
      return;
    }
    if (!a.traine) {
      if (!a.multi && a.dejaChoisi && sel.size > 1) { choisir(a.id); rendre(); }
      return;
    }
    $('fantome').classList.add('cache'); cDessus.innerHTML = '';
    a.sujets.forEach(function (i) { var e = elems.get(i.sujet.id); if (e) e.g.classList.remove('traine'); });
    deposer(a, ev);
  });
  function chercherDepot(ev) {
    var el = document.elementFromPoint(ev.clientX, ev.clientY);
    var gn = el && el.closest && el.closest('.noeud');
    if (!gn) return null;
    var id = gn.getAttribute('data-id'), b = boites.get(id), i = info(id);
    if (!b || !i || i.resume) return null;
    if (appui.sujets.some(function (s) { return M.contient(s.sujet, id); })) return null;
    var p = versMonde(ev), zone = 'enfant';
    if (i.parent) {
      var r = b.dir === 0 ? (p.x - b.x) / b.w : (p.y - b.y) / b.h;
      if (r < 0.28) zone = 'avant'; else if (r > 0.72) zone = 'apres';
    }
    return { id: id, zone: zone };
  }
  function dessinerDepot(d) {
    if (!d) { cDessus.innerHTML = ''; return; }
    var b = boites.get(d.id), h;
    if (d.zone === 'enfant') h = '<rect x="' + (b.x - 5) + '" y="' + (b.y - 5) + '" width="' + (b.w + 10) + '" height="' + (b.h + 10) + '" rx="12" fill="#4f46e5" fill-opacity=".10" stroke="#4f46e5" stroke-width="2" stroke-dasharray="5 4"/>';
    else if (b.dir === 0) { var x = d.zone === 'avant' ? b.x - 9 : b.x + b.w + 9; h = '<path d="M' + x + ' ' + b.y + 'V' + (b.y + b.h) + '" stroke="#4f46e5" stroke-width="3.5" stroke-linecap="round"/>'; }
    else { var y = d.zone === 'avant' ? b.y - 5 : b.y + b.h + 5; h = '<path d="M' + b.x + ' ' + y + 'H' + (b.x + b.w) + '" stroke="#4f46e5" stroke-width="3.5" stroke-linecap="round"/>'; }
    cDessus.innerHTML = h;
  }
  function deposer(a, ev) {
    var d = a.depot, p = versMonde(ev);
    if (!d) {
      // Lâché dans le vide : un sujet libre se déplace, un sujet ordinaire devient libre.
      historiser();
      var dx = (ev.clientX - a.x) / vue.z, dy = (ev.clientY - a.y) / vue.z;
      a.sujets.forEach(function (i, k) {
        if (!i.parent) { i.sujet.x = Math.round((i.sujet.x || 0) + dx); i.sujet.y = Math.round((i.sujet.y || 0) + dy); }
        else { retirer(i); i.sujet.x = Math.round(p.x - 30); i.sujet.y = Math.round(p.y - 14 + k * 46); feuille.libres.push(i.sujet); }
      });
      rendre(); sauver(); return;
    }
    var cible = info(d.id); if (!cible) return;
    historiser();
    var zone = d.zone, cb = boites.get(d.id);
    // À gauche d'une carte en étoile, l'ordre à l'écran est l'inverse de l'ordre de la liste.
    if (feuille.structure === 'carte' && cible.parent === feuille.racine && cb && cb.dir < 0) zone = zone === 'avant' ? 'apres' : zone === 'apres' ? 'avant' : zone;
    a.sujets.forEach(function (i) { retirer(i); delete i.sujet.x; delete i.sujet.y; });
    if (zone === 'enfant' || !cible.parent) {
      a.sujets.forEach(function (i) { cible.sujet.enfants.push(i.sujet); });
      cible.sujet.plie = false;
    } else {
      var l = cible.parent.enfants, k = l.indexOf(cible.sujet) + (zone === 'apres' ? 1 : 0);
      a.sujets.forEach(function (i, n) { l.splice(k + n, 0, i.sujet); });
    }
    rendre(); sauver();
  }
  svg.addEventListener('dblclick', function (ev) {
    if (pres) return;
    var gn = ev.target.closest('.noeud'), gl = ev.target.closest('.liaison');
    if (ev.target.closest('.pli') || ev.target.closest('[data-act]')) return;
    if (!gn && ev.target.closest('.cadre')) return editerCadre();
    if (!gn && ev.target.closest('.accolade')) return;
    if (gn) editer(gn.getAttribute('data-id'));
    else if (gl) editerLiaison(gl.getAttribute('data-l'));
    else ajouterLibre(versMonde(ev));
  });
  scene.addEventListener('wheel', function (ev) {
    ev.preventDefault();
    if (ELEVES) return;
    var r = scene.getBoundingClientRect();
    if (ev.ctrlKey || ev.metaKey) zoomer(Math.exp(-ev.deltaY * 0.012), ev.clientX - r.left, ev.clientY - r.top);
    else { vue.x -= ev.deltaX; vue.y -= ev.deltaY; appliquerVue(); placerSaisie(); }
  }, { passive: false });
  svg.addEventListener('contextmenu', function (ev) {
    ev.preventDefault();
    if (pres) return;
    var gn = ev.target.closest('.noeud'), gl = ev.target.closest('.liaison');
    var gc = !gn && ev.target.closest('.cadre'), ga = !gn && ev.target.closest('.accolade');
    if (gc) { choisir(null); selCadre = { id: gc.getAttribute('data-cadre'), porteur: gc.getAttribute('data-porteur') }; rendre(); return menuCadre(ev.clientX, ev.clientY); }
    if (ga) { gn = null; choisir(ga.getAttribute('data-sujet')); rendre(); return menuResume(ev.clientX, ev.clientY); }
    if (gl) { sel.clear(); principal = null; selLiaison = gl.getAttribute('data-l'); rendre(); return ouvrirMenu(ev.clientX, ev.clientY, [{ label: 'Modifier le texte', fn: function () { editerLiaison(selLiaison); } }, { label: 'Supprimer la liaison', danger: true, fn: supprimer }]); }
    if (!gn) { var pt = versMonde(ev); return ouvrirMenu(ev.clientX, ev.clientY, [{ label: 'Sujet libre ici', fn: function () { ajouterLibre(pt); } }, { label: 'Tout voir', kbd: '⌘0', fn: ajuster }, '-', { label: 'Coller', kbd: '⌘V', fn: coller }]); }
    var id = gn.getAttribute('data-id');
    if (!sel.has(id)) { choisir(id); rendre(); }
    var i = info(id);
    if (i.resume) return menuResume(ev.clientX, ev.clientY);
    var pl = i.parent ? [{ label: 'Encadrer', kbd: '⇧⌘B', fn: encadrer }, { label: 'Résumer (accolade)', kbd: '⇧⌘A', fn: resumer }] : [];
    ouvrirMenu(ev.clientX, ev.clientY, [
      { label: 'Sous-sujet', kbd: 'Tab', fn: ajouterEnfant },
      { label: 'Sujet après', kbd: 'Entrée', fn: function () { ajouterFrere(false); } },
      { label: 'Sujet avant', kbd: '⇧Entrée', fn: function () { ajouterFrere(true); } },
      '-',
      { label: i.sujet.plie ? 'Déplier' : 'Replier', kbd: '⌘/', fn: plier },
      { label: 'Liaison vers…', kbd: '⌘L', fn: modeLiaison },
      { label: 'Note, lien, étiquettes', fn: function () { ouvrirPanneau('note'); } },
      { label: 'Style', fn: function () { ouvrirPanneau('style'); } },
      '-'].concat(pl.length ? pl.concat(['-']) : [], [
      { label: 'Copier', kbd: '⌘C', fn: function () { copier(false); } },
      { label: 'Couper', kbd: '⌘X', fn: function () { copier(true); } },
      { label: 'Coller', kbd: '⌘V', fn: coller },
      { label: 'Dupliquer', kbd: '⌘D', fn: dupliquer },
      '-',
      { label: 'Supprimer', kbd: '⌫', danger: true, fn: supprimer }
    ]));
  });
  function menuResume(x, y) {
    ouvrirMenu(x, y, [
      { label: 'Modifier le texte', kbd: 'Espace', fn: function () { if (principal) editer(principal); } },
      { label: 'Note, lien, étiquettes', fn: function () { ouvrirPanneau('note'); } },
      { label: 'Style', fn: function () { ouvrirPanneau('style'); } },
      '-',
      { label: 'Retirer le résumé', kbd: '⌫', danger: true, fn: supprimer }
    ]);
  }

  /* ---------- Clavier ---------- */
  function voisin(dir) {
    var b = boites.get(principal);
    if (!b) return feuille.racine.id;
    if (b.resume) return b.porteur.id;
    var n = b.n, org = feuille.structure === 'organigramme';
    function enfantDe(cote) {
      if (!n.enfants.length) return null;
      if (n.plie) { historiser(); n.plie = false; boites = disposer(feuille); }
      var l = n.enfants.filter(function (e) { var eb = boites.get(e.id); return eb && (cote == null || eb.dir === cote); });
      l.sort(function (p, q) { return boites.get(p.id).y - boites.get(q.id).y; });
      return l.length ? l[Math.floor((l.length - 1) / 2)].id : null;
    }
    function geo(vx, vy) {
      var cx = b.x + b.w / 2, cy = b.y + b.h / 2, mieux = null, score = Infinity;
      boites.forEach(function (o, id) {
        if (id === n.id) return;
        var dx = o.x + o.w / 2 - cx, dy = o.y + o.h / 2 - cy, a = dx * vx + dy * vy, t = Math.abs(dx * vy) + Math.abs(dy * vx);
        if (a <= 2) return;
        var s = a + t * 2.6;
        if (s < score) { score = s; mieux = id; }
      });
      return mieux;
    }
    function frere(delta) {
      if (!b.parent) return null;
      var l = b.parent.enfants.filter(function (e) { var eb = boites.get(e.id); return eb && eb.dir === b.dir; });
      l.sort(function (p, q) { var P = boites.get(p.id), Q = boites.get(q.id); return org ? P.x - Q.x : P.y - Q.y; });
      var k = l.indexOf(n) + delta;
      return l[k] ? l[k].id : null;
    }
    if (org) {
      if (dir === 'bas') return enfantDe(null) || geo(0, 1);
      if (dir === 'haut') return b.parent ? b.parent.id : geo(0, -1);
      return frere(dir === 'gauche' ? -1 : 1) || geo(dir === 'gauche' ? -1 : 1, 0);
    }
    var racine = !b.parent && !b.libre;
    if (dir === 'droite') return racine ? (enfantDe(1) || geo(1, 0)) : b.dir > 0 ? enfantDe(null) : (b.parent ? b.parent.id : null);
    if (dir === 'gauche') return racine ? (enfantDe(-1) || geo(-1, 0)) : b.dir < 0 ? enfantDe(null) : (b.parent ? b.parent.id : null);
    return frere(dir === 'haut' ? -1 : 1) || geo(0, dir === 'haut' ? -1 : 1);
  }
  document.addEventListener('keydown', function (ev) {
    if (ELEVES || $('editeur').classList.contains('cache') || edition || !$('voile').classList.contains('cache')) return;
    var t = ev.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    var cmd = ev.metaKey || ev.ctrlKey, k = ev.key;
    function fait() { ev.preventDefault(); }
    if (pres) {
      if (k === 'Escape') { fait(); return quitterProjection(); }
      if (k === 'ArrowRight' || k === 'ArrowDown' || k === ' ' || k === 'Enter' || k === 'PageDown') { fait(); return avancer(1); }
      if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp' || k === 'Backspace') { fait(); return avancer(-1); }
      if (k.toLowerCase() === 't') { fait(); return avancer('fin'); }
      if (k === 'Home') { fait(); pres.i = 1; return avancer(-1); }
      return;
    }
    if (k === 'Escape') { fermerMenu(); mode = null; majMode(); majBarre(); return; }
    if (cmd && k.toLowerCase() === 'z') { fait(); return ev.shiftKey ? retablir() : annuler(); }
    if (cmd && k.toLowerCase() === 'y') { fait(); return retablir(); }
    if (cmd && (k === '=' || k === '+')) { fait(); return zoomer(1.2); }
    if (cmd && k === '-') { fait(); return zoomer(1 / 1.2); }
    if (cmd && k === '0') { fait(); return ajuster(); }
    if (cmd && k.toLowerCase() === 'c') { fait(); return copier(false); }
    if (cmd && k.toLowerCase() === 'x') { fait(); return copier(true); }
    if (cmd && k.toLowerCase() === 'v') { if (presse) { fait(); coller(); } return; }
    if (cmd && k.toLowerCase() === 'd') { fait(); return dupliquer(); }
    if (cmd && k.toLowerCase() === 'l') { fait(); return modeLiaison(); }
    if (cmd && k === '/') { fait(); return plier(); }
    if (cmd && ev.shiftKey && k.toLowerCase() === 'b') { fait(); return encadrer(); }
    if (cmd && ev.shiftKey && k.toLowerCase() === 'a') { fait(); return resumer(); }
    if (cmd && k.toLowerCase() === 'b') { fait(); var ib = info(principal); return ib && styler('gras', boites.get(principal).s.poids >= 650 ? false : true); }
    if (cmd && k.toLowerCase() === 'i') { fait(); var ii = info(principal); return ii && styler('italique', ii.sujet.style && ii.sujet.style.italique ? null : true); }
    if (cmd) return;
    if (ev.altKey && (k === 'ArrowUp' || k === 'ArrowDown')) { fait(); return deplacerRang(k === 'ArrowUp' ? -1 : 1); }
    if (ev.altKey && diffusion && (k === 'ArrowRight' || k === 'ArrowLeft')) { fait(); return pasEleves(k === 'ArrowRight' ? 1 : -1); }
    if (k === 'Tab') { fait(); return ajouterEnfant(); }
    if (k === 'Enter') { fait(); return ajouterFrere(ev.shiftKey); }
    if (k === 'Backspace' || k === 'Delete') { fait(); return supprimer(); }
    if (k === 'F2' || k === ' ') { fait(); if (principal) editer(principal); else if (selLiaison) editerLiaison(selLiaison); else if (selCadre) editerCadre(); return; }
    var fl = { ArrowUp: 'haut', ArrowDown: 'bas', ArrowLeft: 'gauche', ArrowRight: 'droite' }[k];
    if (fl) {
      fait();
      var v = principal ? voisin(fl) : feuille.racine.id;
      if (v) { choisir(v); rendre(); garderVisible(v); }
      return;
    }
    if (k.length === 1 && principal && !ev.altKey) editer(principal, true);   // on tape directement : le texte est remplacé
  });
  document.addEventListener('paste', function (ev) {
    if (ELEVES || $('editeur').classList.contains('cache') || edition) return;
    var t = ev.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    var cd = ev.clipboardData; if (!cd) return;
    var img = Array.prototype.find.call(cd.items || [], function (it) { return it.kind === 'file' && /^image\//.test(it.type); });
    if (img && principal) { ev.preventDefault(); return poserImage(img.getAsFile()); }
    var texte = cd.getData('text/plain');
    if (!texte || presse) return;
    ev.preventDefault();
    var i = info(principal) || info(feuille.racine.id), lignes = texte.split('\n').filter(function (l) { return l.trim(); });
    if (i.resume) i = info(i.porteur.id);
    historiser();
    var ajout;
    if (lignes.length > 1) { var r = M.depuisPlan('x\n' + lignes.map(function (l) { return '  ' + l; }).join('\n')); r.enfants.forEach(function (e) { i.sujet.enfants.push(e); ajout = e; }); }
    else { ajout = M.sujet(texte.trim()); i.sujet.enfants.push(ajout); }
    i.sujet.plie = false; choisir(ajout.id); rendre(); garderVisible(ajout.id); sauver();
  });

  /* ---------- Images ---------- */
  function poserImage(fichier) {
    if (!fichier || !principal) return;
    var lecteur = new FileReader();
    lecteur.onload = function () {
      var im = new Image();
      im.onload = function () {
        var k = Math.min(1, 900 / Math.max(im.width, im.height)), c = document.createElement('canvas');
        c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        var data = c.toDataURL('image/webp', 0.88);
        modifier(function (n) { n.image = { data: data, w: c.width, h: c.height }; });
        clePanneau = ''; majPanneau();
      };
      im.src = lecteur.result;
    };
    lecteur.readAsDataURL(fichier);
  }
  $('fichier-image').addEventListener('change', function () { poserImage(this.files[0]); this.value = ''; });
  function ouvrirLien(u) {
    if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) u = 'https://' + u;
    if (/^(https?|mailto|file):/i.test(u)) window.open(u, '_blank', 'noopener');
  }

  /* ---------- Barre d'outils ---------- */
  var ICONES = {
    retour: '<path d="M15 5l-7 7 7 7"/>',
    sujet: '<rect x="3" y="8" width="18" height="8" rx="3"/>',
    sous: '<rect x="2.5" y="4" width="9" height="6" rx="2"/><rect x="12.5" y="14" width="9" height="6" rx="2"/><path d="M7 10v4q0 3 3 3h2.5"/>',
    libre: '<rect x="4" y="7" width="16" height="10" rx="3" stroke-dasharray="3 2.5"/>',
    liaison: '<path d="M4 17q8-14 15-7"/><path d="M15.5 8.5l3.8 1.3-1.6 3.6"/>',
    encadrer: '<rect x="3" y="5" width="18" height="15" rx="3"/><rect x="5.5" y="3" width="7" height="4" rx="1.5"/><path d="M8 11h8M8 15h6"/>',
    resumer: '<path d="M4 6h5M4 12h5M4 18h5"/><path d="M12 4q2 0 2 2v4q0 2 2 2-2 0-2 2v4q0 2-2 2"/><path d="M18 12h3"/>',
    note: '<path d="M6 3h9l4 4v14H6z"/><path d="M9 11h7M9 15h7M9 7h3"/>',
    marqueur: '<path d="M6 21V4"/><path d="M6 5h12l-3 4 3 4H6"/>',
    image: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.6"/><path d="M4 17l5-4 4 3 3-2 4 3"/>',
    annuler: '<path d="M9 7L4 12l5 5"/><path d="M4 12h10a6 6 0 010 12"/>',
    retablir: '<path d="M15 7l5 5-5 5"/><path d="M20 12H10a6 6 0 000 12"/>',
    style: '<circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="10" r="1.2"/><circle cx="12" cy="7.5" r="1.2"/><circle cx="15.5" cy="10" r="1.2"/><path d="M12 21a3 3 0 010-6h2.5"/>',
    plan: '<path d="M4 6h3M10 6h10M7 12h3M13 12h7M7 18h3M13 18h7"/>',
    exporter: '<path d="M12 4v11M7.5 8.5L12 4l4.5 4.5"/><path d="M5 15v4h14v-4"/>',
    projeter: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4M8 20h8"/><path d="M10.5 7.8v4.4l3.8-2.2z"/>',
    aide: '<rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M7 10h1M11 10h1M15 10h1M7 14h10"/>'
  };
  function bouton(id, label, titre) {
    return '<button id="b-' + id + '" title="' + echap(titre || label) + '"><svg viewBox="0 0 24 24">' + ICONES[id] + '</svg>' + label + '</button>';
  }
  function construireBarre() {
    $('barre').innerHTML = bouton('retour', window.CARTE_EN_LIGNE ? 'Retour' : 'Cartes', window.CARTE_EN_LIGNE ? 'Retour à l’espace du projet' : 'Retour à la liste des cartes') + '<input id="titre-carte" spellcheck="false">' + '<span class="sep"></span>' +
      bouton('sujet', 'Sujet', 'Sujet après (Entrée)') + bouton('sous', 'Sous-sujet', 'Sous-sujet (Tab)') + bouton('libre', 'Sujet libre', 'Sujet libre (double-clic sur le fond)') + bouton('liaison', 'Liaison', 'Relier deux sujets (⌘L)') +
      bouton('encadrer', 'Encadré', 'Encadrer les sujets choisis (⇧⌘B)') + bouton('resumer', 'Résumé', 'Accolade de résumé sur les sujets choisis (⇧⌘A)') +
      '<span class="sep"></span>' + bouton('note', 'Note', 'Note, lien, étiquettes, image') + bouton('marqueur', 'Marqueur') + bouton('image', 'Image') +
      '<span class="sep"></span>' + bouton('annuler', 'Annuler', 'Annuler (⌘Z)') + bouton('retablir', 'Rétablir', 'Rétablir (⇧⌘Z)') +
      '<span class="pousse"></span><span id="etat-sauve"></span>' +
      bouton('projeter', 'Projeter', 'Ouvrir l’écran des élèves et le piloter d’ici') + bouton('plan', 'Plan', 'Copier ou coller le plan') + bouton('exporter', 'Exporter', 'Image ou PDF') + bouton('aide', 'Raccourcis') + bouton('style', 'Style', 'Structure, thème, style');
    $('b-retour').onclick = function () { if (window.CARTE_EN_LIGNE) location.href = window.CARTE_EN_LIGNE.retour; else location.hash = ''; };   // [EN LIGNE]
    $('b-sujet').onclick = function () { ajouterFrere(false); };
    $('b-sous').onclick = ajouterEnfant;
    $('b-libre').onclick = function () { ajouterLibre({ x: (scene.clientWidth / 2 - vue.x) / vue.z, y: (scene.clientHeight - 90 - vue.y) / vue.z }); };
    $('b-liaison').onclick = modeLiaison;
    $('b-encadrer').onclick = encadrer; $('b-resumer').onclick = resumer;
    $('b-note').onclick = function () { ouvrirPanneau('note', true); };
    $('b-marqueur').onclick = function () { ouvrirPanneau('marqueurs', true); };
    $('b-image').onclick = function () { if (principal) $('fichier-image').click(); };
    $('b-annuler').onclick = annuler; $('b-retablir').onclick = retablir;
    $('b-style').onclick = function () { ouvrirPanneau('style', true); };
    $('b-plan').onclick = function (ev) {
      var r = ev.currentTarget.getBoundingClientRect();
      ouvrirMenu(r.left, r.bottom + 4, [{ label: 'Copier le plan de la feuille', fn: copierPlan }, { label: 'Remplacer la feuille par un plan…', fn: collerPlanFeuille }]);
    };
    $('b-exporter').onclick = function (ev) {
      var r = ev.currentTarget.getBoundingClientRect();
      ouvrirMenu(r.right - 300, r.bottom + 4, [{ label: 'Image PNG', fn: exporterPNG }, { label: 'Imprimer ou PDF', fn: function () { imprimer(); } }, '-',
        { label: 'Carte à compléter (sous-sujets vides)', fn: function () { imprimer({ trous: 2 }); } },
        { label: 'Carte à compléter (tout vide sauf le centre)', fn: function () { imprimer({ trous: 1 }); } },
        { label: 'Version allégée (deux niveaux)', fn: function () { imprimer({ profMax: 2 }); } }]);
    };
    $('b-aide').onclick = montrerRaccourcis;
    $('b-projeter').onclick = diffuser;
    var ti = $('titre-carte');
    ti.addEventListener('change', function () { var v = ti.value.trim() || 'Carte sans titre'; if (v !== carte.titre) { historiser(); carte.titre = v; sauver(); } ti.value = carte.titre; });
    ti.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') ti.blur(); });
  }
  function majBarre() {
    if (!$('b-annuler')) return;
    var ti = $('titre-carte'); if (document.activeElement !== ti) ti.value = carte.titre;
    $('b-annuler').disabled = !pile.length; $('b-retablir').disabled = !refaire.length;
    ['sujet', 'sous', 'note', 'marqueur', 'image'].forEach(function (b) { $('b-' + b).disabled = !principal && b !== 'sous'; });
    $('b-liaison').disabled = !principal;
    var ip = info(principal), plOk = !!(ip && ip.parent && !ip.resume);
    $('b-encadrer').disabled = !plOk; $('b-resumer').disabled = !plOk;
    $('b-liaison').classList.toggle('actif', mode === 'liaison');
    $('b-style').classList.toggle('actif', panneau === 'style');
    $('b-projeter').classList.toggle('actif', !!diffusion);
    $('b-note').classList.toggle('actif', panneau === 'note');
    $('b-marqueur').classList.toggle('actif', panneau === 'marqueurs');
  }

  /* ---------- Panneau latéral ---------- */
  function ouvrirPanneau(nom, bascule) {
    panneau = bascule && panneau === nom ? null : nom;
    clePanneau = ''; majPanneau(); majBarre();
    if (principal) setTimeout(function () { garderVisible(principal); }, 0);
  }
  function miniStructure(v) {
    var c = '#98a1b3', r = '<rect x="20" y="11" width="14" height="8" rx="2.5" fill="#4f46e5"/>';
    if (v === 'carte') return r + '<path d="M34 15h6M40 9v12M40 9h8M40 21h8M20 15h-6M14 9v12M14 9H6M14 21H6" stroke="' + c + '" stroke-width="1.6" fill="none"/>';
    if (v === 'droite') return '<rect x="4" y="11" width="14" height="8" rx="2.5" fill="#4f46e5"/><path d="M18 15h8M26 6v18M26 6h10M26 15h10M26 24h10" stroke="' + c + '" stroke-width="1.6" fill="none"/>';
    if (v === 'gauche') return '<rect x="36" y="11" width="14" height="8" rx="2.5" fill="#4f46e5"/><path d="M36 15h-8M28 6v18M28 6H18M28 15H18M28 24H18" stroke="' + c + '" stroke-width="1.6" fill="none"/>';
    return '<rect x="20" y="3" width="14" height="8" rx="2.5" fill="#4f46e5"/><path d="M27 11v6M10 17h34M10 17v6M27 17v6M44 17v6" stroke="' + c + '" stroke-width="1.6" fill="none"/>';
  }
  function majPanneau() {
    var p = $('panneau');
    p.classList.toggle('cache', !panneau);
    if (!panneau) { clePanneau = ''; return; }
    var cle = [panneau, principal, feuille.id, sel.size, feuille.structure, feuille.theme, feuille.police].join('|');
    var i = info(principal), n = i && i.sujet, b = principal && boites.get(principal);
    if (panneau === 'eleves') {
      if (!diffusion) { panneau = null; p.classList.add('cache'); clePanneau = ''; return; }
      clePanneau = ''; p.innerHTML = panneauEleves(); return;
    }
    if (cle === clePanneau && panneau === 'note') return;   // ne pas reconstruire pendant qu'on écrit
    clePanneau = cle;
    var h = '<div class="onglets"><button data-o="style"' + (panneau === 'style' ? ' class="actif"' : '') + '>Style</button><button data-o="note"' + (panneau === 'note' ? ' class="actif"' : '') + '>Contenu</button><button data-o="marqueurs"' + (panneau === 'marqueurs' ? ' class="actif"' : '') + '>Marqueurs</button></div>';
    if (panneau === 'style') {
      h += '<section><h3>Structure</h3><div class="choix">' + M.STRUCTURES.map(function (s) { return '<button data-structure="' + s.v + '"' + (feuille.structure === s.v ? ' class="actif"' : '') + '><svg viewBox="0 0 54 30">' + miniStructure(s.v) + '</svg>' + s.label + '</button>'; }).join('') + '</div></section>';
      h += '<section><h3>Thème</h3><div class="themes">' + Object.keys(THEMES).map(function (k) { var T = THEMES[k]; return '<button data-theme="' + k + '" title="' + T.nom + '" style="background:' + T.fond + '"' + (feuille.theme === k ? ' class="actif"' : '') + '><i style="background:' + T.racine[0] + '"></i>' + T.palette.slice(0, 4).map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') + '</button>'; }).join('') + '</div></section>';
      h += '<section><h3>Police</h3><div class="rangee">' + Object.keys(POLICES).map(function (k) { return '<button data-police="' + k + '" style="font-family:' + echap(POLICES[k][1]) + '"' + ((feuille.police || 'systeme') === k ? ' class="actif"' : '') + '>' + POLICES[k][0] + '</button>'; }).join('') + '</div></section>';
      if (n) {
        var st = n.style || {};
        h += '<section><h3>Forme</h3><div class="rangee">' + FORMES.map(function (f) { return '<button data-forme="' + f[0] + '"' + (b.s.forme === f[0] ? ' class="actif"' : '') + '>' + f[1] + '</button>'; }).join('') + '</div></section>';
        h += '<section><h3>Couleur du sujet</h3><div class="couleurs"><button class="aucune' + (!st.fond ? ' actif' : '') + '" data-fond="" title="Couleur du thème"></button>' + COULEURS.map(function (c) { return '<button data-fond="' + c + '" style="background:' + c + '"' + (st.fond === c ? ' class="actif"' : '') + '></button>'; }).join('') + '</div></section>';
        h += '<section><h3>Texte</h3><div class="rangee" style="margin-bottom:10px"><button data-txt="gras"' + (b.s.poids >= 650 ? ' class="actif"' : '') + '><b>G</b></button><button data-txt="italique"' + (st.italique ? ' class="actif"' : '') + '><i>I</i></button><button data-txt="moins">A−</button><button data-txt="plus">A+</button></div>' +
          '<div class="couleurs"><button class="aucune' + (!st.texte ? ' actif' : '') + '" data-coultexte="" title="Couleur automatique"></button>' + COULEURS.slice(0, 12).concat(['#ffffff']).map(function (c) { return '<button data-coultexte="' + c + '" style="background:' + c + '"' + (st.texte === c ? ' class="actif"' : '') + '></button>'; }).join('') + '</div></section>';
        h += '<section><button class="lien-action" data-reinit="1">Revenir au style du thème</button></section>';
      } else h += '<section class="rien">Choisir un sujet pour régler sa forme, sa couleur et son texte.</section>';
    } else if (!n) h += '<section class="rien">Choisir un sujet.</section>';
    else if (panneau === 'note') {
      h += '<section><h3>Note</h3><textarea id="p-note" placeholder="Texte de la note">' + echap(n.note || '') + '</textarea></section>';
      h += '<section><h3>Lien</h3><input type="text" id="p-lien" placeholder="https://…" value="' + echap(n.lien || '') + '"></section>';
      h += '<section><h3>Étiquettes</h3><div class="puces">' + (n.etiquettes || []).map(function (e, k) { return '<span>' + echap(e) + '<button data-oter="' + k + '">×</button></span>'; }).join('') + '</div><input type="text" id="p-etiquette" placeholder="Ajouter puis Entrée"></section>';
      h += '<section><h3>Image</h3>' + (n.image ? '<div class="rangee"><button data-img="moins">−</button><button data-img="plus">+</button><button data-img="oter">Retirer</button></div>' : '<button class="lien-action" data-img="choisir">Choisir une image</button><div class="rien" style="margin-top:6px">ou la coller avec ⌘V</div>') + '</section>';
    } else {
      MARQUEURS.forEach(function (g) {
        h += '<section><h3>' + g[0] + '</h3><div class="marqueurs">' + g[1].map(function (c) { return '<button data-marqueur="' + c + '"' + ((n.marqueurs || []).indexOf(c) >= 0 ? ' class="actif"' : '') + '><svg viewBox="0 0 18 18">' + glyphe(c) + '</svg></button>'; }).join('') + '</div></section>';
      });
    }
    p.innerHTML = h;
    var zn = $('p-note'), zl = $('p-lien'), ze = $('p-etiquette');
    function enDirect(champ, valeur) {   // écrit sans reconstruire le panneau (le curseur reste en place)
      var c = info(principal); if (!c) return;
      if (!enDirect.fait) { historiser(); enDirect.fait = true; }
      if (valeur) c.sujet[champ] = valeur; else delete c.sujet[champ];
      rendre({ panneau: false }); sauver();
    }
    enDirect.fait = false;
    if (zn) zn.addEventListener('input', function () { enDirect('note', zn.value); });
    if (zl) zl.addEventListener('input', function () { enDirect('lien', zl.value.trim()); });
    if (ze) ze.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Enter' || !ze.value.trim()) return;
      var v = ze.value.trim();
      modifier(function (x) { x.etiquettes = (x.etiquettes || []).concat([v]); });
      clePanneau = ''; majPanneau(); $('p-etiquette').focus();
    });
  }
  $('panneau').addEventListener('click', function (ev) {
    var t = ev.target.closest('button'); if (!t) return;
    var d = t.dataset;
    if (d.e && diffusion) {
      var D = diffusion, cible = d.id && info(d.id);
      if (d.e === 'suiv') return pasEleves(1);
      if (d.e === 'prec') return pasEleves(-1);
      if (d.e === 'tout') return toutEleves(true);
      if (d.e === 'rien') return toutEleves(false);
      if (d.e === 'fin') return arreterDiffusion();
      if (d.e === 'branche' && cible) { if (D.vus.has(d.id)) { cacherEleves(cible.sujet); D.focus = feuille.racine.id; } else { D.vus.add(d.id); D.focus = d.id; } }
      else if (d.e === 'details' && cible) {
        var ds = Array.from(descendants(cible.sujet, new Set())), tous = D.vus.has(d.id) && ds.every(function (id) { return D.vus.has(id); });
        if (tous) ds.forEach(function (id) { D.vus.delete(id); }); else { D.vus.add(d.id); ds.forEach(function (id) { D.vus.add(id); }); }
        D.focus = d.id;
      }
      else if (d.e === 'focus' && cible) { D.vus.add(d.id); D.focus = d.id; }
      else if (d.e === 'trous') D.trous = +d.v;
      else if (d.e === 'mode') D.mode = d.v;
      else if (d.e === 'grain') D.grain = d.v;
      else if (d.e === 'suivre') D.suivre = !D.suivre;
      else if (d.e === 'noir') D.noir = !D.noir;
      return rendre();
    }
    if (d.o) return ouvrirPanneau(d.o);
    if (d.structure) { historiser(); feuille.structure = d.structure; rendre(); sauver(); return setTimeout(ajuster, 0); }
    if (d.theme) { historiser(); feuille.theme = d.theme; rendre(); sauver(); return; }
    if (d.police) { historiser(); feuille.police = d.police; cacheCoupe.clear(); rendre(); sauver(); return; }
    if (d.forme) return styler('forme', d.forme);
    if ('fond' in d) return styler('fond', d.fond || null);
    if ('coultexte' in d) return styler('texte', d.coultexte || null);
    if (d.txt) {
      var b = boites.get(principal), i = info(principal); if (!b) return;
      if (d.txt === 'gras') return styler('gras', b.s.poids >= 650 ? false : true);
      if (d.txt === 'italique') return styler('italique', i.sujet.style && i.sujet.style.italique ? null : true);
      return styler('taille', Math.max(10, Math.min(48, b.s.fs + (d.txt === 'plus' ? 2 : -2))));
    }
    if (d.reinit) return modifier(function (n) { delete n.style; });
    if (d.marqueur) return basculerMarqueur(d.marqueur);
    if (d.oter != null) { modifier(function (n) { n.etiquettes.splice(+d.oter, 1); if (!n.etiquettes.length) delete n.etiquettes; }); clePanneau = ''; return majPanneau(); }
    if (d.img === 'choisir') return $('fichier-image').click();
    if (d.img === 'oter') { modifier(function (n) { delete n.image; }); clePanneau = ''; return majPanneau(); }
    if (d.img) return modifier(function (n) { if (n.image) n.image.echelle = Math.max(0.3, Math.min(2.4, (n.image.echelle || 1) * (d.img === 'plus' ? 1.2 : 1 / 1.2))); });
  });

  /* ---------- Feuilles ---------- */
  function majFeuilles() {
    var h = carte.feuilles.map(function (f) { return '<button data-f="' + f.id + '"' + (f === feuille ? ' class="actif"' : '') + '>' + echap(f.titre) + '</button>'; }).join('');
    h += '<button class="ajout" data-f="+" title="Nouvelle feuille">+</button><span class="compte">' + M.compter(feuille) + ' sujets</span>';
    $('feuilles').innerHTML = h;
  }
  function allerFeuille(f) {
    finEdition(true);
    feuille = f; sel.clear(); principal = f.racine.id; sel.add(principal); selLiaison = null;
    if (diffusion) { diffusion.vus.clear(); diffusion.focus = f.racine.id; }
    toutEffacer(); rendre({ sansAnim: true }); ajuster();
  }
  $('feuilles').addEventListener('click', function (ev) {
    var t = ev.target.closest('button'); if (!t) return;
    if (t.dataset.f === '+') {
      historiser();
      var f = M.feuille('Feuille ' + (carte.feuilles.length + 1), 'Sujet central');
      f.theme = feuille.theme; carte.feuilles.push(f); sauver(); return allerFeuille(f);
    }
    var f2 = carte.feuilles.find(function (x) { return x.id === t.dataset.f; });
    if (f2 && f2 !== feuille) allerFeuille(f2);
  });
  function menuFeuille(ev) {
    var t = ev.target.closest('button[data-f]'); if (!t || t.dataset.f === '+') return;
    ev.preventDefault();
    var f = carte.feuilles.find(function (x) { return x.id === t.dataset.f; });
    ouvrirMenu(ev.clientX, ev.clientY - 120, [
      { label: 'Renommer', fn: function () { demander({ titre: 'Nom de la feuille', valeur: f.titre }).then(function (v) { if (v && v.trim()) { historiser(); f.titre = v.trim(); majFeuilles(); sauver(); } }); } },
      { label: 'Dupliquer', fn: function () { historiser(); var c = JSON.parse(JSON.stringify(f)); c.id = M.uid('f'); c.titre = f.titre + ' (copie)'; var corr = {}; M.parcourir(c, function (n) { var a = n.id; n.id = M.uid('s'); corr[a] = n.id; }); c.liaisons.forEach(function (l) { l.id = M.uid('l'); l.de = corr[l.de]; l.vers = corr[l.vers]; }); carte.feuilles.splice(carte.feuilles.indexOf(f) + 1, 0, c); sauver(); allerFeuille(c); } },
      { label: 'Supprimer', danger: true, fn: function () { if (carte.feuilles.length < 2) return; confirmer('Supprimer la feuille « ' + f.titre + ' » ?').then(function (oui) { if (!oui) return; historiser(); carte.feuilles.splice(carte.feuilles.indexOf(f), 1); sauver(); allerFeuille(carte.feuilles[0]); }); } }
    ]);
  }
  $('feuilles').addEventListener('contextmenu', menuFeuille);
  $('feuilles').addEventListener('dblclick', menuFeuille);

  /* ---------- Plan, export ---------- */
  function copierPlan() {
    var t = M.versPlan(feuille.racine);
    demander({ titre: 'Plan de la feuille', valeur: t, multi: true, ok: 'Copier' }).then(function (v) { if (v != null) { try { navigator.clipboard.writeText(v); } catch (e) {} } });
  }
  function collerPlanFeuille() {
    demander({ titre: 'Remplacer la feuille par ce plan', valeur: '', multi: true, ok: 'Remplacer', aide: 'Une ligne par sujet. Deux espaces au début d’une ligne = un niveau de plus. Les titres Markdown (#, ##) et les puces (-) sont reconnus.' }).then(function (v) {
      var r = v && M.depuisPlan(v); if (!r) return;
      historiser(); feuille.racine = r; feuille.liaisons = []; sauver(); allerFeuille(feuille);
    });
  }
  function exporterPNG() {
    var s = svgAutonome(feuille, { taille: true, marge: 50 }), k = Math.min(3, Math.max(1, 6000 / Math.max(s.w, s.h)), 2.5);
    var url = URL.createObjectURL(new Blob([s.svg], { type: 'image/svg+xml;charset=utf-8' })), im = new Image();
    im.onload = function () {
      var c = document.createElement('canvas'); c.width = Math.round(s.w * k); c.height = Math.round(s.h * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob(function (b) {
        var a = document.createElement('a'); a.href = URL.createObjectURL(b);
        a.download = (carte.titre + (carte.feuilles.length > 1 ? ' - ' + feuille.titre : '')).replace(/[\\/:*?"<>|]/g, ' ') + '.png';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
      }, 'image/png');
    };
    im.src = url;
  }
  function imprimer(opt) {
    opt = opt || {}; opt.marge = 30;
    $('impression').innerHTML = svgAutonome(feuille, opt).svg;
    setTimeout(function () { window.print(); }, 60);
  }
  function montrerRaccourcis() {
    var l = [['Sous-sujet', 'Tab'], ['Sujet après / avant', 'Entrée · ⇧ Entrée'], ['Modifier le texte', 'Espace, F2 ou taper directement'], ['Retour à la ligne dans un sujet', '⇧ Entrée'], ['Se déplacer', '← ↑ → ↓'], ['Monter / descendre le sujet', '⌥ ↑ · ⌥ ↓'], ['Replier / déplier', '⌘ /'], ['Supprimer', '⌫'], ['Copier, couper, coller, dupliquer', '⌘C · ⌘X · ⌘V · ⌘D'], ['Liaison entre deux sujets', '⌘ L'], ['Encadrer les sujets choisis', '⇧ ⌘ B'], ['Résumé (accolade) des sujets choisis', '⇧ ⌘ A'], ['Gras / italique', '⌘B · ⌘I'], ['Annuler / rétablir', '⌘Z · ⇧⌘Z'], ['Zoom', '⌘ + · ⌘ − · pincer'], ['Tout voir', '⌘ 0'], ['Sujet libre', 'double-clic sur le fond'], ['Écran des élèves : étape suivante / précédente', '⌥ → · ⌥ ←'], ['Choisir plusieurs sujets', '⇧ clic']];
    modale('<h2>Raccourcis</h2><table>' + l.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join('') + '</table><div class="pied"><button class="primaire" data-ok="1">Fermer</button></div>');
  }

  /* ---------- Menus et fenêtres ---------- */
  var menuOuvert = null;
  function fermerMenu() { if (menuOuvert) { menuOuvert.remove(); menuOuvert = null; } }
  function ouvrirMenu(x, y, items) {
    fermerMenu();
    var m = document.createElement('div'); m.className = 'menu';
    items.forEach(function (it) {
      if (it === '-') { m.appendChild(document.createElement('hr')); return; }
      var b = document.createElement('button');
      if (it.danger) b.className = 'danger';
      b.innerHTML = '<span>' + echap(it.label) + '</span>' + (it.kbd ? '<kbd>' + it.kbd + '</kbd>' : '');
      b.onclick = function () { fermerMenu(); it.fn(); };
      m.appendChild(b);
    });
    document.body.appendChild(m);
    var r = m.getBoundingClientRect();
    m.style.left = Math.max(8, Math.min(x, innerWidth - r.width - 8)) + 'px';
    m.style.top = Math.max(8, Math.min(y, innerHeight - r.height - 8)) + 'px';
    menuOuvert = m;
  }
  document.addEventListener('pointerdown', function (ev) { if (menuOuvert && !menuOuvert.contains(ev.target)) fermerMenu(); }, true);
  var voile = document.createElement('div'); voile.id = 'voile'; voile.className = 'cache'; document.body.appendChild(voile);
  var finModale = null;
  function modale(html, classe) {
    voile.innerHTML = '<div class="boite' + (classe ? ' ' + classe : '') + '">' + html + '</div>'; voile.classList.remove('cache');
    return new Promise(function (res) { finModale = function (v) { voile.classList.add('cache'); voile.innerHTML = ''; finModale = null; res(v); }; });
  }
  voile.addEventListener('pointerdown', function (ev) { if (ev.target === voile && finModale) finModale(null); });
  voile.addEventListener('click', function (ev) {
    var b = ev.target.closest('button'); if (!b || !finModale) return;
    if (b.dataset.ok) { var z = voile.querySelector('input,textarea'); finModale(z ? z.value : true); }
    else if (b.dataset.non) finModale(null);
  });
  voile.addEventListener('keydown', function (ev) {
    if (!finModale) return;
    if (ev.key === 'Escape') finModale(null);
    else if (ev.key === 'Enter' && ev.target.tagName === 'INPUT') finModale(ev.target.value);
  });
  function demander(o) {
    var champ = o.multi ? '<textarea>' + echap(o.valeur || '') + '</textarea>' : '<input type="text" value="' + echap(o.valeur || '') + '">';
    var p = modale('<h2>' + echap(o.titre) + '</h2>' + (o.aide ? '<p style="margin:-4px 0 10px;color:var(--doux);font-size:13px">' + echap(o.aide) + '</p>' : '') + champ + '<div class="pied"><button class="secondaire" data-non="1">Annuler</button><button class="primaire" data-ok="1">' + (o.ok || 'Valider') + '</button></div>');
    var z = voile.querySelector('input,textarea'); z.focus(); if (!o.multi) z.select();
    return p.then(function (v) { return typeof v === 'string' ? v : null; });
  }
  function confirmer(texte) {
    return modale('<h2>' + echap(texte) + '</h2><div class="pied"><button class="secondaire" data-non="1">Annuler</button><button class="primaire" data-ok="1" style="background:var(--danger)">Supprimer</button></div>').then(function (v) { return v === true; });
  }

  /* ---------- Modèles ---------- */
  var MODELES = [
    { g: 'Pour commencer', nom: 'Carte vierge', structure: 'carte', theme: 'classique', plan: 'Sujet central\n  Sujet principal 1\n  Sujet principal 2\n  Sujet principal 3' },
    { g: 'Pour commencer', nom: 'Remue-méninges', structure: 'carte', theme: 'pastel', plan: 'Notre question\n  Idées\n    Idée 1\n    Idée 2\n  Ce que l’on sait déjà\n  Ce que l’on veut savoir\n  Exemples\n  Mots-clés\n  À retenir' },
    { g: 'Cours', nom: 'Module de PSE', structure: 'carte', theme: 'classique', plan: 'Titre du module\n  Situation de départ\n    Qui ?\n    Quel problème ?\n  Je mobilise mes connaissances\n    Notion 1\n    Notion 2\n    Notion 3\n  Les conséquences\n    Sur la santé\n    Sur la vie sociale et professionnelle\n  Les solutions\n    Individuelles\n    Collectives\n  Le vocabulaire\n    Mot 1\n    Mot 2' },
    { g: 'Cours', nom: 'Fiche de révision', structure: 'droite', theme: 'ocean', plan: 'Titre du chapitre\n  L’essentiel\n    Idée 1\n    Idée 2\n    Idée 3\n  Les définitions\n    Mot : définition\n  Les chiffres à connaître\n  Un exemple\n  Ce qui tombe à l’évaluation' },
    { g: 'Cours', nom: 'Plan d’une séance', structure: 'droite', theme: 'pastel', plan: 'Séance\n  Objectif\n  Accroche (5 min)\n  Activité 1\n    Document\n    Consigne\n  Activité 2\n    Document\n    Consigne\n  Trace écrite\n  Bilan de la séance' },
    { g: 'Cours', nom: 'Compte rendu d’un document', structure: 'droite', theme: 'encre', plan: 'Titre du document\n  Source\n    Auteur\n    Date\n  Idée principale\n  Informations relevées\n    Information 1\n    Information 2\n  Chiffres\n  Ce que j’en retiens' },
    { g: 'Prévention', nom: 'Démarche de prévention', structure: 'droite', theme: 'classique', plan: 'Situation de travail\n  Danger\n  Situation dangereuse\n  Événement déclencheur\n  Dommage\n  Mesures de prévention\n    Supprimer ou réduire le risque\n    Protection collective\n    Protection individuelle\n    Formation et information' },
    { g: 'Prévention', nom: 'Analyse ITaMaMi', structure: 'carte', theme: 'ocean', plan: 'Situation de travail\n  Individu\n    Âge, formation, expérience\n    État de santé, fatigue\n  Tâche\n    Ce qui est demandé\n    Gestes, postures, rythme\n  Matériel\n    Outils, machines\n    Produits\n  Milieu\n    Lieu, espace\n    Bruit, lumière, température\n    Organisation, collègues' },
    { g: 'Prévention', nom: 'Les 5 M (causes d’un problème)', structure: 'carte', theme: 'parchemin', plan: 'Problème constaté\n  Main-d’œuvre\n  Matériel\n  Matière\n  Méthode\n  Milieu' },
    { g: 'Prévention', nom: 'Un risque du métier', structure: 'carte', theme: 'classique', plan: 'Le risque\n  Où ? Quand ?\n  Effets sur la santé\n    Immédiats\n    À long terme\n  La réglementation\n  Prévenir\n    À la source\n    Collectivement\n    Individuellement\n  En cas d’accident\n    Protéger\n    Alerter\n    Secourir' },
    { g: 'Élèves', nom: 'Portrait d’un élève', structure: 'carte', theme: 'pastel', plan: 'Prénom de l’élève\n  Points d’appui\n    Ce qu’il réussit\n    Ce qu’il aime\n  Besoins\n    En classe\n    Pendant les évaluations\n  Aménagements\n    Temps\n    Supports\n    Aide humaine\n  Objectifs\n    Ce trimestre\n    Cette année\n  Personnes ressources' },
    { g: 'Élèves', nom: 'Mon projet d’orientation', structure: 'carte', theme: 'ocean', plan: 'Mon projet\n  Ce que j’aime faire\n  Mes qualités\n  Les métiers qui m’intéressent\n    Métier 1\n    Métier 2\n  Les formations possibles\n  Mes stages\n    Ce que j’ai appris\n  Mes prochaines démarches' },
    { g: 'Élèves', nom: 'Bilan de stage (PFMP)', structure: 'droite', theme: 'classique', plan: 'Ma période en entreprise\n  L’entreprise\n    Activité\n    Mon tuteur\n  Les tâches réalisées\n  Ce que j’ai appris\n  Mes réussites\n  Mes difficultés\n  La sécurité dans l’entreprise\n  Ce que je veux améliorer' },
    { g: 'Organisation', nom: 'QQOQCP', structure: 'carte', theme: 'classique', plan: 'Le sujet\n  Qui ?\n  Quoi ?\n  Où ?\n  Quand ?\n  Comment ?\n  Pourquoi ?' },
    { g: 'Organisation', nom: 'Projet', structure: 'droite', theme: 'ocean', plan: 'Nom du projet\n  Objectif\n  Les étapes\n    Étape 1\n    Étape 2\n    Étape 3\n  Qui fait quoi ?\n  Le matériel\n  Le calendrier\n  Le résultat attendu' },
    { g: 'Organisation', nom: 'Réunion', structure: 'droite', theme: 'encre', plan: 'Réunion du …\n  Présents\n  Ordre du jour\n    Point 1\n    Point 2\n  Décisions\n  Actions à mener\n    Qui ? Pour quand ?\n  Prochaine réunion' },
    { g: 'Organisation', nom: 'Forces et faiblesses', structure: 'carte', theme: 'pastel', plan: 'Le sujet étudié\n  Forces\n  Faiblesses\n  Possibilités\n  Risques' },
    { g: 'Organisation', nom: 'Organigramme', structure: 'organigramme', theme: 'ocean', plan: 'Direction\n  Service 1\n    Personne\n    Personne\n  Service 2\n    Personne\n    Personne\n  Service 3\n    Personne' }
  ];
  function feuilleDuModele(m) {
    var f = M.feuille('Feuille 1');
    f.racine = M.depuisPlan(m.plan); f.structure = m.structure; f.theme = m.theme;
    return f;
  }
  function choisirModele() {
    var h = '<h2>Nouvelle carte</h2><div class="modeles">', groupe = '';
    MODELES.forEach(function (m, i) {
      if (m.g !== groupe) { groupe = m.g; h += '<h3>' + echap(groupe) + '</h3>'; }
      var T = THEMES[m.theme];
      h += '<button class="modele" data-modele="' + i + '"><span class="ap" style="background:' + T.fond + '">' + svgAutonome(feuilleDuModele(m), { marge: 24 }).svg + '</span><b>' + echap(m.nom) + '</b></button>';
    });
    h += '</div><div class="pied"><button class="secondaire" data-non="1">Annuler</button></div>';
    var p = modale(h, 'large');
    voile.querySelector('.modeles').addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-modele]'); if (b && finModale) finModale('m' + b.dataset.modele);
    });
    p.then(function (v) {
      if (typeof v !== 'string' || v.charAt(0) !== 'm') return;
      var m = MODELES[+v.slice(1)], c = M.carte(m.nom === 'Carte vierge' ? 'Carte sans titre' : m.nom);
      c.feuilles = [feuilleDuModele(m)];
      c.dossierId = dossierCourant();
      donnees.cartes.push(c); ecrire();
      location.hash = 'c=' + c.id;
    });
  }

  /* ---------- Bibliothèque : dossiers, cartes, corbeille ---------- */
  function dateCourte(iso) { var d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }); }
  function dossierCourant() { return filtre.dossier && filtre.dossier !== 'corbeille' ? filtre.dossier : ''; }
  function dossierDe(id) { return donnees.dossiers.find(function (o) { return o.id === id; }) || null; }
  function enfantsDossier(parent) {
    return donnees.dossiers.filter(function (o) { return (o.parent || null) === (parent || null); })
      .sort(function (a, b) { return a.nom.localeCompare(b.nom, 'fr', { numeric: true }); });
  }
  /* Première ouverture : trois dossiers de départ, et un sous-dossier par classe dans « Élèves ». */
  function dossiersDeDepart() {
    if (donnees.dossiersPoses) return;
    donnees.dossiersPoses = true;
    var eleves = M.dossierParChemin(donnees, 'Élèves', true);
    M.dossierParChemin(donnees, 'Cours', true); M.dossierParChemin(donnees, 'Réunions', true);
    try {
      var classes = JSON.parse(S.get('pse-classes-v1') || '[]');
      (Array.isArray(classes) ? classes : []).forEach(function (c) { if (c && c.nom && eleves) M.dossierParChemin(donnees, 'Élèves / ' + String(c.nom).replace(/[\/›>]/g, ' '), true); });
    } catch (e) {}
    ecrire();
  }
  function compteDossier(id) {
    var dans = M.sousDossiers(donnees, id), n = 0;
    donnees.cartes.forEach(function (c) { if (dans[c.dossierId]) n += 1; });
    return n;
  }
  function majArbre() {
    var h = '<button class="ar-ligne' + (!filtre.dossier ? ' actif' : '') + '" data-d=""><span class="ar-ico">▦</span><span class="ar-nom">Toutes les cartes</span><span class="ar-n">' + donnees.cartes.length + '</span></button>';
    (function niveau(parent, prof) {
      enfantsDossier(parent).forEach(function (o) {
        var fils = enfantsDossier(o.id).length, plie = !!replies[o.id];
        h += '<div class="ar-ligne' + (filtre.dossier === o.id ? ' actif' : '') + '" data-d="' + o.id + '" draggable="true" style="padding-left:' + (10 + prof * 16) + 'px">' +
          '<button class="ar-pli' + (fils ? '' : ' vide') + '" data-pli="' + o.id + '">' + (fils ? (plie ? '▸' : '▾') : '') + '</button>' +
          '<span class="ar-nom">' + echap(o.nom) + '</span><span class="ar-n">' + (compteDossier(o.id) || '') + '</span><button class="ar-plus" data-dmenu="' + o.id + '" title="Actions">⋯</button></div>';
        if (fils && !plie) niveau(o.id, prof + 1);
      });
    })(null, 0);
    h += '<button class="ar-ajout" data-nouveau-dossier="1">+ Dossier</button>';
    h += '<button class="ar-ligne ar-corbeille' + (filtre.dossier === 'corbeille' ? ' actif' : '') + '" data-d="corbeille"><span class="ar-ico">⌫</span><span class="ar-nom">Corbeille</span><span class="ar-n">' + (donnees.corbeille.length || '') + '</span></button>';
    $('arbre').innerHTML = h;
  }
  function vignette(c, corbeille) {
    var f = c.feuilles[0], n = 0; c.feuilles.forEach(function (x) { n += M.compter(x); });
    var T = THEMES[f.theme] || THEMES.classique, chemin = M.cheminDe(donnees, c.dossierId);
    return '<div class="vignette' + (corbeille ? ' jetee' : '') + '" data-c="' + c.id + '"' + (corbeille ? '' : ' draggable="true"') + '><div class="apercu" style="background:' + T.fond + '">' + svgAutonome(f, { marge: 26, profMax: n > 160 ? 2 : 0 }).svg + '</div><div class="bas"><div class="nom">' + echap(c.titre) + '</div><div class="info">' + n + ' sujets' + (c.feuilles.length > 1 ? ' · ' + c.feuilles.length + ' feuilles' : '') + ' · ' + dateCourte(c.maj) + (chemin && c.dossierId !== filtre.dossier && !corbeille ? ' · ' + echap(chemin) : '') + '</div></div><button class="plus" data-menu="' + c.id + '" title="Actions">⋯</button></div>';
  }
  function majListe() {
    if (filtre.dossier && filtre.dossier !== 'corbeille' && !dossierDe(filtre.dossier)) filtre.dossier = null;
    majArbre();
    var corbeille = filtre.dossier === 'corbeille', q = filtre.texte.toLowerCase(), h = '';
    $('fil').innerHTML = corbeille ? '<b>Corbeille</b>' + (donnees.corbeille.length ? '<button class="lien-action" data-vider="1">Vider la corbeille</button>' : '')
      : '<b>' + (filtre.dossier ? echap(M.cheminDe(donnees, filtre.dossier)) : 'Toutes les cartes') + '</b>';
    var liste;
    if (corbeille) liste = donnees.corbeille.map(function (x) { return x.carte; });
    else {
      var dans = filtre.dossier ? M.sousDossiers(donnees, filtre.dossier) : null;
      liste = donnees.cartes.filter(function (c) { return !dans || dans[c.dossierId]; });
    }
    liste = liste.filter(function (c) {
      if (!q) return true;
      if (c.titre.toLowerCase().indexOf(q) >= 0) return true;
      return c.feuilles.some(function (f) { var ok = false; M.parcourir(f, function (n) { if (!ok && String(n.t).toLowerCase().indexOf(q) >= 0) ok = true; }); return ok; });
    }).sort(function (a, b) { return String(b.maj).localeCompare(String(a.maj)); });
    if (!corbeille && !filtre.texte) h += '<button class="vignette nouvelle" data-nouvelle="1"><span>+</span>Nouvelle carte</button>';
    liste.forEach(function (c) { h += vignette(c, corbeille); });
    $('grille').innerHTML = h;
    var v = $('vide');
    v.textContent = corbeille ? 'La corbeille est vide.' : 'Aucune carte ne correspond.';
    v.classList.toggle('cache', !!liste.length || (!corbeille && !filtre.texte));
  }
  function creerCarte(titre, racinePlan) {
    var c = M.carte(titre);
    if (racinePlan) { c.feuilles[0].racine = racinePlan; c.titre = racinePlan.t || c.titre; }
    c.dossierId = dossierCourant();
    donnees.cartes.push(c); ecrire();
    location.hash = 'c=' + c.id;
  }
  function jeter(c) {
    var k = donnees.cartes.indexOf(c); if (k < 0) return;
    donnees.cartes.splice(k, 1); donnees.corbeille.unshift({ carte: c, le: M.maintenant() });
    ecrire(); majListe();
  }
  function restaurerCarte(c) {
    var k = donnees.corbeille.findIndex(function (x) { return x.carte === c; }); if (k < 0) return;
    donnees.corbeille.splice(k, 1);
    if (c.dossierId && !dossierDe(c.dossierId)) c.dossierId = '';
    donnees.cartes.push(c); ecrire(); majListe();
  }
  function ranger(c, dossierId) { c.dossierId = dossierId || ''; ecrire(); majListe(); }
  /* Un dossier ne peut pas entrer dans lui-même ni dans un de ses sous-dossiers. */
  function deplacerDossier(o, parent) {
    if (parent && M.sousDossiers(donnees, o.id)[parent]) return;
    o.parent = parent || null; ecrire(); majListe();
  }
  function supprimerDossier(o) {
    // Jamais de carte perdue : le contenu remonte d'un niveau.
    donnees.cartes.forEach(function (c) { if (c.dossierId === o.id) c.dossierId = o.parent || ''; });
    donnees.corbeille.forEach(function (x) { if (x.carte.dossierId === o.id) x.carte.dossierId = o.parent || ''; });
    donnees.dossiers.forEach(function (x) { if (x.parent === o.id) x.parent = o.parent || null; });
    donnees.dossiers.splice(donnees.dossiers.indexOf(o), 1);
    if (filtre.dossier === o.id) filtre.dossier = o.parent || null;
    ecrire(); majListe();
  }
  function nouveauDossier(parent) {
    demander({ titre: parent ? 'Nouveau sous-dossier de « ' + dossierDe(parent).nom + ' »' : 'Nouveau dossier', valeur: '' }).then(function (v) {
      var nom = v && v.trim().replace(/[\/›>]/g, ' ').slice(0, 60); if (!nom) return;
      var o = { id: M.uid('d'), nom: nom, parent: parent || null };
      donnees.dossiers.push(o); if (parent) delete replies[parent];
      filtre.dossier = o.id; ecrire(); majListe();
    });
  }
  /* Fenêtre « Ranger dans… » : l'arbre des dossiers, un clic range. */
  function choisirDossier(titre, exclu) {
    var h = '<h2>' + echap(titre) + '</h2><div class="choix-dossier"><button data-choix="">Aucun dossier</button>';
    var interdits = exclu ? M.sousDossiers(donnees, exclu) : {};
    (function niveau(parent, prof) {
      enfantsDossier(parent).forEach(function (o) {
        if (interdits[o.id]) return;
        h += '<button data-choix="' + o.id + '" style="padding-left:' + (12 + prof * 18) + 'px">' + echap(o.nom) + '</button>';
        niveau(o.id, prof + 1);
      });
    })(null, 0);
    h += '</div><div class="pied"><button class="secondaire" data-non="1">Annuler</button></div>';
    var p = modale(h);
    voile.querySelector('.choix-dossier').addEventListener('click', function (ev) { var b = ev.target.closest('[data-choix]'); if (b && finModale) finModale('d:' + b.dataset.choix); });
    return p.then(function (v) { return typeof v === 'string' && v.slice(0, 2) === 'd:' ? { id: v.slice(2) } : null; });
  }
  function dupliquerCarte(c) {
    var d = JSON.parse(JSON.stringify(c)); d.id = M.uid('c'); d.titre = c.titre + ' (copie)'; d.cree = d.maj = M.maintenant();
    d.feuilles.forEach(function (f) { f.id = M.uid('f'); var corr = {}; M.parcourir(f, function (n) { var a = n.id; n.id = M.uid('s'); corr[a] = n.id; }); f.liaisons.forEach(function (l) { l.id = M.uid('l'); l.de = corr[l.de]; l.vers = corr[l.vers]; }); });
    donnees.cartes.push(d); ecrire(); majListe();
  }
  $('nouvelle').onclick = choisirModele;
  $('importer-plan').onclick = function () {
    demander({ titre: 'Nouvelle carte à partir d’un plan', valeur: '', multi: true, ok: 'Créer la carte', aide: 'La première ligne est le sujet central. Deux espaces au début d’une ligne = un niveau de plus. Les titres Markdown (#, ##) et les puces (-) sont reconnus.' }).then(function (v) {
      var r = v && M.depuisPlan(v); if (r) creerCarte(null, r);
    });
  };
  $('recherche').addEventListener('input', function () { filtre.texte = this.value.trim(); majListe(); });
  $('fil').addEventListener('click', function (ev) {
    if (!ev.target.closest('[data-vider]')) return;
    confirmer('Vider la corbeille ? Les ' + donnees.corbeille.length + ' cartes seront supprimées définitivement.').then(function (oui) { if (oui) { donnees.corbeille = []; ecrire(); majListe(); } });
  });
  $('arbre').addEventListener('click', function (ev) {
    var pli = ev.target.closest('[data-pli]'), dm = ev.target.closest('[data-dmenu]');
    if (pli && !pli.classList.contains('vide')) { ev.stopPropagation(); if (replies[pli.dataset.pli]) delete replies[pli.dataset.pli]; else replies[pli.dataset.pli] = 1; return majArbre(); }
    if (dm) { ev.stopPropagation(); var r = dm.getBoundingClientRect(); return menuDossier(dossierDe(dm.dataset.dmenu), r.left, r.bottom + 4); }
    if (ev.target.closest('[data-nouveau-dossier]')) return nouveauDossier(dossierCourant());
    var l = ev.target.closest('[data-d]');
    if (l) { filtre.dossier = l.dataset.d || null; majListe(); }
  });
  $('arbre').addEventListener('contextmenu', function (ev) {
    var l = ev.target.closest('[data-d]'); if (!l || !dossierDe(l.dataset.d)) return;
    ev.preventDefault(); menuDossier(dossierDe(l.dataset.d), ev.clientX, ev.clientY);
  });
  function menuDossier(o, x, y) {
    if (!o) return;
    ouvrirMenu(x, y, [
      { label: 'Nouveau sous-dossier', fn: function () { nouveauDossier(o.id); } },
      { label: 'Renommer', fn: function () { demander({ titre: 'Nom du dossier', valeur: o.nom }).then(function (v) { var nom = v && v.trim().replace(/[\/›>]/g, ' ').slice(0, 60); if (nom) { o.nom = nom; ecrire(); majListe(); } }); } },
      { label: 'Déplacer dans…', fn: function () { choisirDossier('Déplacer « ' + o.nom + ' » dans…', o.id).then(function (v) { if (v) deplacerDossier(o, v.id); }); } },
      '-',
      { label: 'Supprimer le dossier', danger: true, fn: function () {
        var n = compteDossier(o.id);
        if (!n && !enfantsDossier(o.id).length) return supprimerDossier(o);
        confirmer('Supprimer le dossier « ' + o.nom + ' » ? Son contenu remonte d’un niveau, aucune carte n’est supprimée.').then(function (oui) { if (oui) supprimerDossier(o); });
      } }
    ]);
  }
  /* Glisser une carte ou un dossier sur un dossier de l'arbre. */
  var glisse = null;
  document.addEventListener('dragstart', function (ev) {
    var v = ev.target.closest && ev.target.closest('.vignette[data-c]'), l = ev.target.closest && ev.target.closest('.ar-ligne[data-d]');
    if (v && $('grille').contains(v)) glisse = { carte: v.dataset.c };
    else if (l && dossierDe(l.dataset.d)) glisse = { dossier: l.dataset.d };
    else return;
    try { ev.dataTransfer.setData('text/plain', 'carte'); ev.dataTransfer.effectAllowed = 'move'; } catch (e) {}
  });
  document.addEventListener('dragend', function () { glisse = null; $('arbre').querySelectorAll('.cible').forEach(function (x) { x.classList.remove('cible'); }); });
  function cibleDepot(ev) {
    var l = ev.target.closest && ev.target.closest('.ar-ligne[data-d]');
    if (!glisse || !l || l.dataset.d === 'corbeille' && glisse.dossier) return null;
    if (glisse.dossier && l.dataset.d && M.sousDossiers(donnees, glisse.dossier)[l.dataset.d]) return null;
    return l;
  }
  $('arbre').addEventListener('dragover', function (ev) {
    var l = cibleDepot(ev);
    $('arbre').querySelectorAll('.cible').forEach(function (x) { if (x !== l) x.classList.remove('cible'); });
    if (!l) return;
    ev.preventDefault(); l.classList.add('cible');
  });
  $('arbre').addEventListener('drop', function (ev) {
    var l = cibleDepot(ev), g = glisse; glisse = null;
    if (!l || !g) return;
    ev.preventDefault();
    if (g.carte) {
      var c = donnees.cartes.find(function (x) { return x.id === g.carte; }); if (!c) return;
      if (l.dataset.d === 'corbeille') jeter(c); else ranger(c, l.dataset.d);
    } else deplacerDossier(dossierDe(g.dossier), l.dataset.d || null);
  });
  $('grille').addEventListener('click', function (ev) {
    var corbeille = filtre.dossier === 'corbeille';
    var mb = ev.target.closest('[data-menu]');
    if (mb) {
      ev.stopPropagation();
      var r = mb.getBoundingClientRect(), c;
      if (corbeille) {
        c = donnees.corbeille.map(function (x) { return x.carte; }).find(function (x) { return x.id === mb.dataset.menu; });
        return ouvrirMenu(r.left - 170, r.bottom + 4, [
          { label: 'Restaurer', fn: function () { restaurerCarte(c); } },
          { label: 'Supprimer définitivement', danger: true, fn: function () { confirmer('Supprimer définitivement « ' + c.titre + ' » ?').then(function (oui) { if (!oui) return; donnees.corbeille = donnees.corbeille.filter(function (x) { return x.carte !== c; }); ecrire(); majListe(); }); } }
        ]);
      }
      c = donnees.cartes.find(function (x) { return x.id === mb.dataset.menu; });
      return ouvrirMenu(r.left - 150, r.bottom + 4, [
        { label: 'Renommer', fn: function () { demander({ titre: 'Nom de la carte', valeur: c.titre }).then(function (v) { if (v && v.trim()) { c.titre = v.trim(); c.maj = M.maintenant(); ecrire(); majListe(); } }); } },
        { label: 'Ranger dans…', fn: function () { choisirDossier('Ranger « ' + c.titre + ' » dans…').then(function (v) { if (v) ranger(c, v.id); }); } },
        { label: 'Dupliquer', fn: function () { dupliquerCarte(c); } },
        '-',
        { label: 'Mettre à la corbeille', danger: true, fn: function () { jeter(c); } }
      ]);
    }
    if (ev.target.closest('[data-nouvelle]')) return choisirModele();
    var v = ev.target.closest('[data-c]');
    if (v && !corbeille) location.hash = 'c=' + v.dataset.c;
  });
  $('retour-atelier').onclick = function () { location.href = window.CARTE_EN_LIGNE ? window.CARTE_EN_LIGNE.retour : 'accueil.html'; };   // [EN LIGNE]

  /* ---------- Navigation liste ↔ éditeur (les flèches du navigateur fonctionnent) ---------- */
  function ouvrirCarte(c) {
    carte = c; pile = []; refaire = []; mode = null; panneau = null; clePanneau = '';
    $('liste').classList.add('cache'); $('editeur').classList.remove('cache');
    if (!$('b-annuler')) construireBarre();
    document.title = c.titre + ' · Cartes mentales';
    majMode(); majPanneau();
    allerFeuille(c.feuilles[0]);
    etat('');
  }
  function montrerListe() {
    finEdition(true); if (tSauve) ecrire();
    if (diffusion) arreterDiffusion();
    carte = null; feuille = null; fermerMenu();
    $('editeur').classList.add('cache'); $('liste').classList.remove('cache');
    document.title = 'Cartes mentales';
    donnees = lire(); dossiersDeDepart(); majListe();
  }
  function suivreAdresse() {
    var m = location.hash.match(/^#c=(.+)$/), c = m && donnees.cartes.find(function (x) { return x.id === decodeURIComponent(m[1]); });
    if (!c && window.CARTE_EN_LIGNE) c = donnees.cartes[0];   // [EN LIGNE] une seule carte : on la rouvre toujours
    if (c) ouvrirCarte(c); else montrerListe();
  }
  if (!ELEVES) window.addEventListener('hashchange', suivreAdresse);
  if (!ELEVES) window.addEventListener('focus', function () { if (!carte && voile.classList.contains('cache')) { donnees = lire(); majListe(); } });   // la liste suit ce qui a été déposé ailleurs
  window.addEventListener('resize', function () { if (pres && pres.eleves) cadrerEleves(false); else if (pres) ajuster(); else if (feuille) placerSaisie(); });
  $('zoom-moins').onclick = function () { zoomer(1 / 1.2); };
  $('zoom-plus').onclick = function () { zoomer(1.2); };
  $('zoom-val').onclick = function () { zoomer(1 / vue.z); };
  $('zoom-ajuster').onclick = ajuster;

  /* Écran des élèves : où regarde la caméra, ce qui est mis en lumière, la diapositive, l'écran noir. */
  var diapoAvant = { id: null, enfants: new Set() };
  function cadrerEleves(anime) {
    var mode = pres.mode || 'carte', it = pres.focus && boites.has(pres.focus) ? M.trouver(feuille, pres.focus) : null;
    $('noir').classList.toggle('cache', !pres.noir);
    var lumiere = null, cible = null;
    if (mode === 'gros' && it && it.sujet !== feuille.racine) {
      lumiere = new Set([it.sujet.id]);
      (function voir(n) { n.enfants.forEach(function (e) { if (boites.has(e.id)) { lumiere.add(e.id); voir(e); } }); })(it.sujet);
      cible = lumiere;
      if (lumiere.size === 1 && it.parent) {   // un sujet seul : on garde ses voisins dans le cadre, lui seul en lumière
        cible = new Set([it.parent.id]);
        (function voir(n) { n.enfants.forEach(function (e) { if (boites.has(e.id)) { cible.add(e.id); voir(e); } }); })(it.parent);
      }
    }
    elems.forEach(function (e, id) { e.g.classList.toggle('ombre', !!lumiere && !lumiere.has(id)); });
    elLiens.forEach(function (el, id) { el.classList.toggle('ombre', !!lumiere && !lumiere.has(id)); });
    if (mode === 'diapo') { dessinerDiapo(it || M.trouver(feuille, feuille.racine.id)); $('diapo').classList.remove('cache'); }
    else { $('diapo').classList.add('cache'); diapoAvant = { id: null, enfants: new Set() }; }
    if (cible) ajuster(anime, cible, 2.3); else ajuster(anime);
  }
  function dessinerDiapo(it) {
    var n = it.sujet, b = boites.get(n.id), T = THEMES[feuille.theme] || THEMES.classique, racine = n === feuille.racine;
    var couleur = racine ? T.racine[0] : (b ? b.couleur : T.palette[0]), trous = pres.trous || 0, prof = it.prof;
    var chemin = [], x = it; while (x && x.parent) { chemin.unshift(String(x.parent.t).replace(/\n/g, ' ')); x = M.trouver(feuille, x.parent.id); }
    var enfants = n.enfants.filter(function (e) { return boites.has(e.id); }), memeDiapo = diapoAvant.id === n.id;
    function texte(t, p) { return trous && p >= trous ? '<span class="d-trou"></span>' : echap(t).replace(/\n/g, '<br>'); }
    var h = '<div class="d-carte' + (memeDiapo ? '' : ' entre') + '" style="--c:' + couleur + ';background:' + T.fond + ';color:' + T.texte + ';font-family:' + echap(POLICE) + '">';
    h += '<div class="d-bande"></div><div class="d-corps' + (n.image ? ' avec-image' : '') + '"><div class="d-texte">';
    h += '<div class="d-fil">' + echap(chemin.join('  ›  ')) + '</div>';
    h += '<h1>' + (n.marqueurs || []).map(function (m) { return '<svg viewBox="0 0 18 18">' + glyphe(m) + '</svg>'; }).join('') + texte(n.t, prof) + '</h1>';
    h += '<ul class="' + (enfants.length > 6 ? 'deux' : '') + '">';
    enfants.forEach(function (e, k) {
      var eb = boites.get(e.id), neuf = !memeDiapo || !diapoAvant.enfants.has(e.id);
      var petits = e.enfants.filter(function (q) { return boites.has(q.id); });
      h += '<li class="' + (neuf ? 'neuf' : '') + '" style="animation-delay:' + (memeDiapo ? 0 : 120 + k * 90) + 'ms"><i style="background:' + (racine && eb ? eb.couleur : couleur) + '"></i><div>' +
        (e.marqueurs || []).map(function (m) { return '<svg viewBox="0 0 18 18">' + glyphe(m) + '</svg>'; }).join('') + texte(e.t, prof + 1) +
        (e.image ? '<img src="' + e.image.data + '" alt="">' : '') +
        (petits.length ? '<small>' + petits.map(function (q) { return texte(q.t, prof + 2); }).join('  ·  ') + '</small>' : '') + '</div></li>';
    });
    h += '</ul></div>' + (n.image ? '<div class="d-image"><img src="' + n.image.data + '" alt=""></div>' : '') + '</div></div>';
    $('diapo').innerHTML = h;
    diapoAvant = { id: n.id, enfants: new Set(enfants.map(function (e) { return e.id; })) };
  }
  function demarrerEleves() {
    document.body.classList.add('presente', 'eleves');
    $('liste').classList.add('cache'); $('editeur').classList.remove('cache');
    var bus;
    try { bus = new BroadcastChannel('atelier-carte-mentale-' + SESSION); } catch (e) { return; }
    bus.onmessage = function (ev) {
      var m = ev.data || {};
      if (m.type === 'fin') { try { window.close(); } catch (e) {} return; }
      if (m.type !== 'etat' || !m.feuille) return;
      var neuf = !feuille || feuille.id !== m.feuille.id || feuille.theme !== m.feuille.theme || feuille.structure !== m.feuille.structure || (feuille.police || '') !== (m.feuille.police || '');
      feuille = m.feuille; carte = { id: 'eleves', titre: m.titre || '', feuilles: [feuille] };
      pres = { etapes: [new Set(m.visibles || [])], i: 0, trous: m.trous || 0, eleves: true, mode: m.mode || 'carte', focus: m.focus || null, noir: !!m.noir };
      document.title = m.titre || 'Carte mentale';
      if (neuf) { toutEffacer(); rendre({ sansAnim: true, panneau: false }); cadrerEleves(false); }
      else { rendre({ panneau: false }); cadrerEleves(true); }
    };
    bus.postMessage({ type: 'pret' });
  }
  if (ELEVES) demarrerEleves();
  else { donnees = lire(); suivreAdresse(); }
})();
