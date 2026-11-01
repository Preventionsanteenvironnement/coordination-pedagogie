/* cartes-mentales-core.js — espace « Cartes mentales » : le modèle, sans écran.
 * [CARTES MENTALES 13/10/2026] Demande de Brahim : l'équivalent de Xmind dans l'Atelier, que l'IA pourra remplir.
 * Module pur : navigateur (window.PSE_CARTES_MENTALES) et Node (require), comme bulletins-shared.js.
 *
 * Clé du store : pse-cartes-mentales-v1 → store/cartes-mentales.json
 * { version:1, cartes:[ { id, titre, dossierId, cree, maj, feuilles:[ feuille ] } ],
 *   dossiers:[ { id, nom, parent } ], corbeille:[ { carte, le } ] }
 * [BIBLIOTHÈQUE 13/10/2026] Les dossiers forment un arbre (parent = id ou null). Une carte supprimée va à la corbeille.
 * L'ancien champ « dossier » (un nom) est converti en vrai dossier à la lecture.
 * feuille = { id, titre, structure, theme, racine:sujet, libres:[sujet + {x,y}], liaisons:[{id,de,vers,t}] }
 * sujet   = { id, t, enfants:[sujet], plie, note, lien, marqueurs:[code], etiquettes:[texte],
 *             image:{data,w,h}, style:{fond,texte,gras,italique,taille,forme},
 *             encadres:[{id, de, a, t, couleur}], resumes:[{id, de, a, couleur, sujet}] }
 * [ENCADRÉS 15/10/2026] Demande de Brahim (plan validé, aspect choisi : cadre avec titre, accolade colorée) :
 * un encadré ou un résumé appartient au sujet PARENT et couvre ses enfants de « de » à « a » (identifiants
 * d'enfants, le même pour un seul sujet). Le sujet d'un résumé n'a pas d'enfants ; parcourir() le visite.
 * Structures : carte (étoile), droite, gauche, organigramme.
 */
(function (racine) {
  'use strict';
  var CLE = 'pse-cartes-mentales-v1';
  var STRUCTURES = [
    { v: 'carte', label: 'Carte' },
    { v: 'droite', label: 'Logique à droite' },
    { v: 'gauche', label: 'Logique à gauche' },
    { v: 'organigramme', label: 'Organigramme' }
  ];

  var compteur = 0;
  function uid(prefixe) {
    compteur += 1;
    return (prefixe || 's') + Date.now().toString(36) + compteur.toString(36) + Math.floor(Math.random() * 1296).toString(36);
  }
  function maintenant() { return new Date().toISOString(); }

  function sujet(texte, enfants) {
    return { id: uid('s'), t: String(texte == null ? '' : texte), enfants: enfants || [] };
  }
  function feuille(titre, texteRacine) {
    return {
      id: uid('f'), titre: titre || 'Feuille 1', structure: 'carte', theme: 'classique',
      racine: sujet(texteRacine || 'Sujet central', [sujet('Sujet principal 1'), sujet('Sujet principal 2'), sujet('Sujet principal 3')]),
      libres: [], liaisons: []
    };
  }
  function carte(titre) {
    var t = titre || 'Carte sans titre';
    return { id: uid('c'), titre: t, dossierId: '', cree: maintenant(), maj: maintenant(), feuilles: [feuille('Feuille 1', t)] };
  }
  function vide() { return { version: 1, cartes: [], dossiers: [], corbeille: [] }; }
  function simple(t) { return String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); }
  /* « Élèves / C1CAN » (ou « Élèves › C1CAN ») → identifiant du dossier ; créé au besoin si creer est vrai. */
  function dossierParChemin(d, chemin, creer) {
    var parts = String(chemin || '').split(/\s*[\/›>]\s*/).map(function (x) { return x.trim(); }).filter(Boolean), parent = null;
    for (var i = 0; i < parts.length; i += 1) {
      var nom = parts[i].slice(0, 60), trouve = null;
      for (var k = 0; k < d.dossiers.length; k += 1) if ((d.dossiers[k].parent || null) === parent && simple(d.dossiers[k].nom) === simple(nom)) { trouve = d.dossiers[k]; break; }
      if (!trouve) { if (!creer) return ''; trouve = { id: uid('d'), nom: nom, parent: parent }; d.dossiers.push(trouve); }
      parent = trouve.id;
    }
    return parent || '';
  }
  function cheminDe(d, id) {
    var noms = [], garde = 0, x = id && d.dossiers.filter(function (o) { return o.id === id; })[0];
    while (x && garde < 20) { noms.unshift(x.nom); garde += 1; x = x.parent && d.dossiers.filter(function (o) { return o.id === x.parent; })[0]; }
    return noms.join(' › ');
  }
  /* Le dossier et tous ses sous-dossiers (identifiants). */
  function sousDossiers(d, id) {
    var out = {}; out[id] = 1;
    var change = true;
    while (change) { change = false; d.dossiers.forEach(function (o) { if (o.parent && out[o.parent] && !out[o.id]) { out[o.id] = 1; change = true; } }); }
    return out;
  }
  function normaliser(d) {
    if (!d || typeof d !== 'object' || !Array.isArray(d.cartes)) return vide();
    d.version = 1;
    if (!Array.isArray(d.dossiers)) d.dossiers = [];
    if (!Array.isArray(d.corbeille)) d.corbeille = [];
    var connus = {}; d.dossiers.forEach(function (o) { connus[o.id] = 1; });
    d.dossiers.forEach(function (o) { if (o.parent && (!connus[o.parent] || o.parent === o.id)) o.parent = null; });
    d.cartes.forEach(function (c) {
      if (c.dossier && !c.dossierId) { c.dossierId = dossierParChemin(d, c.dossier, true); d._migre = true; }   // ancien rangement par nom : à réécrire une fois
      delete c.dossier;
      if (c.dossierId && !d.dossiers.some(function (o) { return o.id === c.dossierId; })) c.dossierId = '';
      if (!c.dossierId) c.dossierId = '';
      if (!Array.isArray(c.feuilles) || !c.feuilles.length) c.feuilles = [feuille('Feuille 1', c.titre)];
      c.feuilles.forEach(function (f) {
        if (!f.racine) f.racine = sujet(c.titre);
        if (!Array.isArray(f.libres)) f.libres = [];
        if (!Array.isArray(f.liaisons)) f.liaisons = [];
        parcourir(f, function (n) { if (!Array.isArray(n.enfants)) n.enfants = []; if (!n.id) n.id = uid('s'); reparerPlages(n); });
      });
    });
    return d;
  }

  /* Parcourt tous les sujets d'une feuille (racine puis sujets libres). fn(sujet, parent, profondeur, libre). */
  /* fn reçoit en 5e argument { porteur, resume } pour le sujet d'un résumé (son parent vaut alors null). */
  function parcourir(f, fn) {
    function aller(n, parent, prof, libre, res) {
      fn(n, parent, prof, libre, res);
      (n.enfants || []).forEach(function (e) { aller(e, n, prof + 1, libre); });
      (n.resumes || []).forEach(function (r) { if (r && r.sujet) aller(r.sujet, null, prof + 1, libre, { porteur: n, resume: r }); });
    }
    aller(f.racine, null, 0, false);
    (f.libres || []).forEach(function (l) { aller(l, null, 1, true); });
  }
  function trouver(f, id) {
    var r = null;
    parcourir(f, function (n, parent, prof, libre, res) {
      if (n.id === id) r = { sujet: n, parent: parent, prof: prof, libre: libre, resume: res ? res.resume : null, porteur: res ? res.porteur : null };
    });
    return r;
  }
  function compter(f) { var n = 0; parcourir(f, function () { n += 1; }); return n; }
  function contient(ancetre, id) {
    if (ancetre.id === id) return true;
    return (ancetre.enfants || []).some(function (e) { return contient(e, id); }) ||
      (ancetre.resumes || []).some(function (r) { return r.sujet && r.sujet.id === id; });
  }
  /* Indices (dans n.enfants) du premier et du dernier enfant couverts par un encadré ou un résumé, ou null. */
  function plage(n, p) {
    var ids = (n.enfants || []).map(function (e) { return e.id; }), i = ids.indexOf(p.de), j = ids.indexOf(p.a);
    if (i < 0 || j < 0) return null;
    return i <= j ? [i, j] : [j, i];
  }
  /* Un enfant va quitter son parent : les plages qui commencent ou finissent sur lui se resserrent sur ses voisins. */
  function avantRetrait(parent, enfant) {
    var l = parent.enfants || [], k = l.indexOf(enfant);
    if (k < 0) return;
    (parent.encadres || []).concat(parent.resumes || []).forEach(function (p) {
      var r = plage(parent, p); if (!r || r[0] === r[1]) return;
      if (r[0] === k) { p.de = l[k + 1].id; p.a = l[r[1]].id; }
      else if (r[1] === k) { p.de = l[r[0]].id; p.a = l[k - 1].id; }
    });
  }
  /* Encadrés et résumés d'un sujet remis d'aplomb : un bout disparu prend la place de l'autre, une plage
     dont les deux bouts ont disparu est retirée. Appelé à la lecture et avant chaque dessin. */
  function reparerPlages(n) {
    var ids = (n.enfants || []).map(function (e) { return e.id; });
    function tenir(p) {
      if (!p || typeof p !== 'object') return false;
      var i = ids.indexOf(p.de), j = ids.indexOf(p.a);
      if (i < 0 && j < 0) return false;
      if (i < 0) p.de = p.a; if (j < 0) p.a = p.de;
      if (!p.id) p.id = uid('p');
      if (p.couleur && !/^#[0-9a-f]{6}$/i.test(String(p.couleur))) delete p.couleur;
      return true;
    }
    if (n.encadres) {
      n.encadres = Array.isArray(n.encadres) ? n.encadres.filter(tenir) : [];
      n.encadres.forEach(function (e) { if (e.t != null) { e.t = String(e.t).slice(0, 60); if (!e.t.trim()) delete e.t; } });
      if (!n.encadres.length) delete n.encadres;
    }
    if (n.resumes) {
      n.resumes = Array.isArray(n.resumes) ? n.resumes.filter(function (r) { return tenir(r) && r.sujet && typeof r.sujet === 'object'; }) : [];
      n.resumes.forEach(function (r) { r.sujet.enfants = []; if (!r.sujet.id) r.sujet.id = uid('s'); if (r.sujet.t == null) r.sujet.t = 'Résumé'; });
      if (!n.resumes.length) delete n.resumes;
    }
  }
  /* Copie profonde d'un sujet avec de nouveaux identifiants (coller, dupliquer). */
  function cloner(n) {
    var c = JSON.parse(JSON.stringify(n)), neufs = {};
    (function renommer(x) {
      var ancien = x.id; x.id = uid('s'); neufs[ancien] = x.id;
      (x.enfants || []).forEach(renommer);
      (x.resumes || []).forEach(function (r) { r.id = uid('p'); if (r.sujet) renommer(r.sujet); });
      (x.encadres || []).forEach(function (e) { e.id = uid('p'); });
    })(c);
    (function relier(x) {   // les plages suivent les nouveaux identifiants des enfants
      (x.encadres || []).concat(x.resumes || []).forEach(function (p) { p.de = neufs[p.de] || p.de; p.a = neufs[p.a] || p.a; });
      (x.enfants || []).forEach(relier);
    })(c);
    delete c.x; delete c.y;
    return c;
  }

  /* Plan en texte → sujets. Accepte les titres Markdown (#), les puces (-, *, •, 1.) et l'indentation
     (deux espaces ou une tabulation par niveau). La première ligne devient le sujet central. */
  function depuisPlan(texte) {
    var lignes = String(texte || '').replace(/\r/g, '').split('\n').filter(function (l) { return l.trim(); });
    if (!lignes.length) return null;
    var items = lignes.map(function (l) {
      var m = l.match(/^(\s*)(#{1,6})\s+(.*)$/);
      if (m) return { niveau: m[2].length - 1, t: m[3].trim(), titre: true };
      var esp = l.match(/^(\s*)/)[1].replace(/\t/g, '  ').length;
      var t = l.trim().replace(/^([-*•–]|\d+[.)])\s+/, '');
      return { niveau: Math.floor(esp / 2), t: t, puce: true };
    });
    // Les puces placées sous un titre Markdown sont ses enfants.
    var base = 0;
    items.forEach(function (it) { if (it.titre) base = it.niveau + 1; else it.niveau += base; });
    var min = Math.min.apply(null, items.map(function (i) { return i.niveau; }));
    items.forEach(function (i) { i.niveau -= min; });
    var premier = items[0];
    var seulEnTete = items.filter(function (i) { return i.niveau === 0; }).length === 1 && premier.niveau === 0;
    var rac = sujet(seulEnTete ? premier.t : 'Sujet central');
    var pile = [{ niveau: -1, n: rac }];
    (seulEnTete ? items.slice(1) : items).forEach(function (it) {
      var niv = seulEnTete ? it.niveau - 1 : it.niveau;
      if (niv < 0) niv = 0;
      while (pile.length > 1 && pile[pile.length - 1].niveau >= niv) pile.pop();
      var n = sujet(it.t);
      pile[pile.length - 1].n.enfants.push(n);
      pile.push({ niveau: niv, n: n });
    });
    return rac;
  }
  function versPlan(n, niveau) {
    niveau = niveau || 0;
    var t = String(n.t || '').replace(/\n/g, ' ');
    var s = (niveau === 0 ? '# ' + t : new Array(niveau).join('  ') + '- ' + t) + '\n';
    (n.enfants || []).forEach(function (e) { s += versPlan(e, niveau + 1); });
    return s;
  }

  /* Arbre décrit en JSON (outils de l'IA) → sujets propres. Tout champ inconnu ou mal formé est ignoré.
     { t, enfants:[…], note, lien, marqueurs:['p1'], etiquettes:['…'], couleur:'#rrggbb', forme, gras, italique, taille, plie } */
  var MARQUEURS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 't0', 't25', 't50', 't75', 't100', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6',
    'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 's-ok', 's-non', 's-att', 's-quest', 's-info', 's-plus', 's-moins', 'h1', 'h2', 'h3'];
  var FORMES = ['arrondi', 'pilule', 'rectangle', 'contour', 'souligne', 'aucun'];
  var THEMES = ['classique', 'pastel', 'ocean', 'parchemin', 'nuit', 'encre'];
  var POLICES = ['systeme', 'arrondie', 'lisible', 'serif', 'manuscrite', 'machine'];
  function depuisArbre(o, compte) {
    compte = compte || { n: 0 };
    if (typeof o === 'string') o = { t: o };
    if (!o || typeof o !== 'object') throw Error('Sujet invalide dans l’arbre.');
    compte.n += 1;
    if (compte.n > 1500) throw Error('Carte trop grande : 1 500 sujets au plus.');
    var n = sujet(String(o.t == null ? (o.titre || o.texte || '') : o.t).slice(0, 400));
    if (!n.t.trim()) throw Error('Un sujet de l’arbre n’a pas de texte (champ « t »).');
    if (o.note) n.note = String(o.note).slice(0, 4000);
    if (o.lien && /^(https?:|mailto:)/i.test(String(o.lien))) n.lien = String(o.lien).slice(0, 500);
    if (Array.isArray(o.marqueurs)) {
      var vus = {}, m = o.marqueurs.filter(function (c) { var g = String(c).charAt(0); if (MARQUEURS.indexOf(c) < 0 || vus[g]) return false; vus[g] = 1; return true; });
      if (m.length) n.marqueurs = m;
    }
    if (Array.isArray(o.etiquettes)) { var e = o.etiquettes.map(function (x) { return String(x).trim().slice(0, 40); }).filter(Boolean).slice(0, 6); if (e.length) n.etiquettes = e; }
    var st = {};
    if (/^#[0-9a-f]{6}$/i.test(String(o.couleur || ''))) st.fond = String(o.couleur).toLowerCase();
    if (FORMES.indexOf(o.forme) >= 0) st.forme = o.forme;
    if (o.gras === true || o.gras === false) st.gras = o.gras;
    if (o.italique === true) st.italique = true;
    if (+o.taille >= 10 && +o.taille <= 48) st.taille = Math.round(+o.taille);
    if (Object.keys(st).length) n.style = st;
    if (o.plie === true) n.plie = true;
    (Array.isArray(o.enfants) ? o.enfants : []).forEach(function (x) { n.enfants.push(depuisArbre(x, compte)); });
    // [ENCADRÉS 15/10/2026] { de, a } = rangs (à partir de 0) dans « enfants » ; résumé : t (texte) et couleur.
    function bouts(p) {
      var de = Math.round(+p.de), a = p.a == null ? de : Math.round(+p.a), k = n.enfants.length;
      if (!(de >= 0 && de < k && a >= 0 && a < k)) throw Error('Encadré ou résumé hors des enfants de « ' + n.t + ' » (rangs de 0 à ' + (k - 1) + ').');
      if (de > a) { var x = de; de = a; a = x; }
      return { id: uid('p'), de: n.enfants[de].id, a: n.enfants[a].id };
    }
    function teinte(p, q) { if (/^#[0-9a-f]{6}$/i.test(String(p.couleur || ''))) q.couleur = String(p.couleur).toLowerCase(); return q; }
    if (Array.isArray(o.encadres)) o.encadres.slice(0, 12).forEach(function (p) {
      if (!p || typeof p !== 'object') return;
      var q = teinte(p, bouts(p)); if (p.t && String(p.t).trim()) q.t = String(p.t).trim().slice(0, 60);
      (n.encadres = n.encadres || []).push(q);
    });
    if (Array.isArray(o.resumes)) o.resumes.slice(0, 12).forEach(function (p) {
      if (!p || typeof p !== 'object') return;
      var q = teinte(p, bouts(p)), t = String(p.t == null ? 'Résumé' : p.t).trim().slice(0, 400) || 'Résumé';
      compte.n += 1;
      q.sujet = sujet(t);
      (n.resumes = n.resumes || []).push(q);
    });
    return n;
  }
  /* Résumé lisible d'une carte (lecture par l'IA) : le plan de chaque feuille. */
  function resume(c, d) {
    return { id: c.id, titre: c.titre, dossier: d ? cheminDe(d, c.dossierId) : '', maj: c.maj, feuilles: c.feuilles.map(function (f) {
      var extras = [];
      parcourir(f, function (n) {
        function nom(id) { var e = (n.enfants || []).filter(function (x) { return x.id === id; })[0]; return e ? '« ' + String(e.t).replace(/\n/g, ' ') + ' »' : '?'; }
        function bornes(p) { return p.de === p.a ? nom(p.de) : nom(p.de) + ' à ' + nom(p.a); }
        (n.encadres || []).forEach(function (e) { extras.push('Encadré' + (e.t ? ' « ' + e.t + ' »' : '') + ' : ' + bornes(e)); });
        (n.resumes || []).forEach(function (r) { extras.push('Résumé « ' + String(r.sujet.t).replace(/\n/g, ' ') + ' » : ' + bornes(r)); });
      });
      var o = { titre: f.titre, structure: f.structure, theme: f.theme, sujets: compter(f), plan: versPlan(f.racine) };
      if (extras.length) o.encadres_et_resumes = extras;
      return o;
    }) };
  }

  var api = {
    dossierParChemin: dossierParChemin, cheminDe: cheminDe, sousDossiers: sousDossiers, simple: simple,
    MARQUEURS: MARQUEURS, FORMES: FORMES, THEMES: THEMES, POLICES: POLICES, depuisArbre: depuisArbre, resume: resume,
    CLE: CLE, STRUCTURES: STRUCTURES, uid: uid, maintenant: maintenant,
    sujet: sujet, feuille: feuille, carte: carte, vide: vide, normaliser: normaliser,
    parcourir: parcourir, trouver: trouver, compter: compter, contient: contient, cloner: cloner, plage: plage, reparerPlages: reparerPlages, avantRetrait: avantRetrait,
    depuisPlan: depuisPlan, versPlan: versPlan
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.PSE_CARTES_MENTALES = api;
})(typeof window !== 'undefined' ? window : this);
