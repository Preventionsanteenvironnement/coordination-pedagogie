/* modele-cdo.js — contenu de départ de la carte « Projet chef-d'œuvre CAP PSR » (Espace équipe pédagogique).
 * [EN LIGNE 01/11/2026] Demande de Brahim : une carte à nourrir à deux (PSE + enseignement professionnel),
 * avec d'avance les mercredis de 14 h à 17 h, les vacances et les PFMP de la classe (1re année CAP PSR, 2026-2027).
 * Sources des dates : calendrier scolaire de l'académie de Lyon (zone A) et calendrier des PFMP 2026-2027 (CA du 23/04/2026),
 * repris de l'Atelier PSE. Ne sert qu'une fois : quand la carte n'existe pas encore dans Firebase.
 * Format : arbre lu par PSE_CARTES_MENTALES.depuisArbre (t, enfants, note, marqueurs, couleur, forme, plie).
 */
(function () {
  'use strict';
  var GRIS = '#e5e7eb', AMBRE = '#fde68a', ROSE = '#fecaca';
  var MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

  function mercredi(iso, pistes) {
    var d = new Date(iso + 'T12:00:00');
    if (d.getDay() !== 3) throw Error('modele-cdo.js : ' + iso + ' n’est pas un mercredi.');
    var n = { t: 'Mer. ' + d.getDate() + (d.getDate() === 1 ? 'er' : '') + ' ' + MOIS[d.getMonth()], note: '14 h – 17 h', enfants: [] };
    (pistes || []).forEach(function (p) { n.enfants.push({ t: p, marqueurs: ['s-info'] }); });
    return n;
  }
  function pause(t, couleur, note) { var n = { t: t, couleur: couleur, forme: 'arrondi' }; if (note) n.note = note; return n; }
  function question(t, enfants) { return { t: t, marqueurs: ['s-quest'], enfants: enfants || [] }; }

  var calendrier = {
    t: '📅 Calendrier — mercredis 14 h – 17 h',
    note: 'Emploi du temps : 14 h – 15 h, l’enseignant de spécialité seul ; 15 h – 17 h, co-enseignement avec la PSE.\nLes séances, vacances et PFMP sont posées d’avance ; à chacun d’ajouter sous une date ce qu’on y fait.',
    enfants: [
      { t: 'Séance 1 · 14 oct. : repérer un danger', marqueurs: ['s-ok'], note: 'Faite. Le tableau des dangers et des dommages reste à terminer le 4 novembre.' },
      { t: 'Novembre', enfants: [
        mercredi('2026-11-04', ['Piste : finir le tableau dangers / dommages']),
        pause('11 nov. · férié, pas de séance', ROSE),
        mercredi('2026-11-18', ['Piste : les dangers de la cuisine']),
        mercredi('2026-11-25', ['Piste : du danger au dommage'])
      ] },
      { t: 'Décembre', enfants: [
        mercredi('2026-12-02', ['Piste : la situation dangereuse']),
        mercredi('2026-12-09'),
        mercredi('2026-12-16'),
        pause('Vacances de Noël · du 19 déc. au 3 janv.', GRIS, 'Reprise le lundi 4 janvier.')
      ] },
      { t: 'Janvier', plie: true, enfants: [
        mercredi('2027-01-06'),
        mercredi('2027-01-13'),
        mercredi('2027-01-20'),
        pause('PFMP · du 25 janv. au 14 févr.', AMBRE, 'Stage : pas de séance les 27 janvier, 3 et 10 février.')
      ] },
      { t: 'Février', plie: true, enfants: [
        pause('PFMP jusqu’au 14 févr.', AMBRE),
        pause('Vacances d’hiver · du 13 au 28 févr.', GRIS, 'Reprise le lundi 1er mars.')
      ] },
      { t: 'Mars', plie: true, enfants: [
        mercredi('2027-03-03'), mercredi('2027-03-10'), mercredi('2027-03-17'), mercredi('2027-03-24'), mercredi('2027-03-31')
      ] },
      { t: 'Avril', plie: true, enfants: [
        mercredi('2027-04-07'),
        pause('Vacances de printemps · du 10 au 25 avr.', GRIS, 'Reprise le lundi 26 avril.'),
        mercredi('2027-04-28')
      ] },
      { t: 'Mai', plie: true, enfants: [
        mercredi('2027-05-05'),
        pause('Pont de l’Ascension · du 6 au 9 mai', GRIS, 'Le mercredi 5 mai a bien lieu. Reprise le lundi 10 mai.'),
        mercredi('2027-05-12'), mercredi('2027-05-19'), mercredi('2027-05-26')
      ] },
      { t: 'Juin', plie: true, enfants: [
        mercredi('2027-06-02'),
        pause('PFMP · du 7 au 27 juin', AMBRE, 'Stage : pas de séance les 9, 16 et 23 juin.'),
        mercredi('2027-06-30', ['Dernière séance ? L’année finit le samedi 3 juillet.'])
      ] }
    ]
  };

  var arbre = {
    t: 'Projet chef-d’œuvre CAP PSR\nIllustrer les risques en cuisine et leur prévention',
    note: 'Titre provisoire, à trouver ensemble.\nCarte partagée PSE + enseignement professionnel : chacun ajoute, déplace, corrige. Tout s’enregistre seul.\nJamais de nom d’élève dans la carte.',
    enfants: [
      { t: '🎯 L’intention', enfants: [
        { t: 'Illustrer des risques du métier, en cuisine et au service' },
        { t: '… et les mesures de prévention' },
        { t: 'Pour les élèves des années suivantes' },
        { t: 'Lien PSE ↔ enseignement professionnel' },
        question('Le titre du projet ?')
      ] },
      { t: '🖼 Le support — à inventer', enfants: [
        question('Quelle forme ?', [{ t: 'BD dessinée' }, { t: 'Photos mises en scène' }, { t: 'Affiche ou planche illustrée' }, { t: 'Maquette' }, { t: 'Illustration numérique' }, { t: 'Courte vidéo' }]),
        question('Où ira-t-il ?', [{ t: 'Affiché en cuisine' }, { t: 'Livret d’accueil des nouveaux élèves' }, { t: 'Projeté en classe' }, { t: 'Site ou ENT du lycée' }]),
        question('Comment le fabriquer ?', [{ t: 'Dessin, photo ou logiciel' }, { t: 'Matériel : tablettes, salle informatique' }, { t: 'Impression : format A3 ?' }])
      ] },
      { t: '⚠️ Les risques — à choisir', note: 'On ne les fera pas tous.', enfants: [
        { t: 'Électrique : cordon abîmé, prise mouillée' },
        { t: 'Manutention : sac de farine, bacs, cartons' },
        { t: 'Chute de plain-pied : sol mouillé ou gras' },
        { t: 'Coupure : couteau, trancheuse' },
        { t: 'Brûlure : four, friteuse, plaques' },
        { t: 'Produits chimiques : entretien, dégraissant' },
        question('Combien en retenir ? Un par équipe ?')
      ] },
      { t: '🛡 Ce qu’on apprend en PSE', enfants: [
        { t: 'Le processus d’apparition du dommage', enfants: [
          { t: 'Opérateur' }, { t: 'Danger' }, { t: 'Situation dangereuse' }, { t: 'Événement déclencheur' }, { t: 'Dommage' }
        ] },
        { t: 'Les mesures de prévention', enfants: [
          { t: 'Supprimer ou réduire le danger' }, { t: 'Protection collective' }, { t: 'Protection individuelle' }, { t: 'Information, formation, consignes' }
        ] }
      ] },
      { t: '👥 Les élèves et l’organisation', enfants: [
        question('Combien d’équipes ?'),
        { t: 'Rôles possibles', enfants: [{ t: 'Scénariste' }, { t: 'Dessinateur ou photographe' }, { t: 'Acteurs' }, { t: 'Responsable sécurité' }, { t: 'Monteur' }] },
        { t: 'Carnet de bord chaque mercredi' },
        { t: 'Sécurité : scènes simulées, rien d’allumé' },
        { t: 'Droit à l’image, si photos' },
        { t: 'Évaluation : part personnelle, oral en fin de 2e année' }
      ] },
      calendrier,
      { t: '✅ Déjà en place', enfants: [
        { t: 'Séance 1 (14 oct.) : repérer un danger en cuisine' },
        { t: 'Cours visuel « Du danger au dommage » (Atelier PSE)' },
        { t: 'Séances 1 à 23 rédigées en brouillon : pistes à revoir ensemble' }
      ] },
      { t: '🤝 À décider ensemble', enfants: [
        question('Le support'), question('Le titre'), question('Les risques retenus'),
        question('Qui fait quoi : 14 h – 15 h et 15 h – 17 h'), question('Outil et impression'),
        question('Où et devant qui présenter'), question('La 2e année')
      ] }
    ]
  };

  window.CARTE_MODELES = window.CARTE_MODELES || {};
  window.CARTE_MODELES['cdo-cap-psr-2026-2027'] = { titre: 'Projet chef-d’œuvre CAP PSR — carte du projet', structure: 'carte', theme: 'classique', arbre: arbre };
})();
