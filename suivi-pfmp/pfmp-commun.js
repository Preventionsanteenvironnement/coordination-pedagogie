/* ═══════════════════════════════════════════════════════════════════════════
   PFMP — LE SOCLE COMMUN  (pfmp-commun.js)
   Un seul fichier, trois copies identiques :
     coordination-pedagogie/suivi-pfmp/pfmp-commun.js   ← l'original
     PSE/pfmp-agora/pfmp-commun.js                       (mapse.fr, l'élève)
     Atelier : EDITEUR/pfmp-commun.js                    (le professeur principal)
   Un test vérifie que les trois copies sont identiques octet pour octet.

   Ce fichier ne dessine rien et ne charge aucun Firebase : il décrit les étapes,
   qui a le droit de faire quoi, les échéances, et la façon d'écrire dans
   Firestore (on lui passe les fonctions du SDK de la page).

   Base : projet Firestore « coordination-pedagogie ». Jamais « devoirs-pse ».
   Aucun nom en ligne : un élève est un code, un référent est un sigle.
   L'aide humaine ne part jamais en ligne : ses étapes sont « locales » (Atelier).
   ═══════════════════════════════════════════════════════════════════════════ */
(function (racine) {
  'use strict';

  const VERSION = '2026-10-09b';
  const COL_SUIVI = 'coordination_pfmp_suivi';
  const COL_REFERENTS = 'coordination_pfmp_referents';
  const ROLES = ['eleve', 'referent', 'pp'];

  /* 09/10/2026 : les grandes étapes de la chronologie validée (Projet_PFMP_connecte…, 35 étapes).
     Le référent est désigné en premier ; le dossier se clôt après le bilan. */
  const PHASES = ['Mon enseignant référent', 'Recherche et proposition de stage', 'Fiche de négociation', 'Pré-convention', 'Convention',
    'Départ', 'En stage', 'Bilan', 'Clôture du dossier'];
  /* Les intervenants du milieu : ils n'ont pas de compte ; leur étape est cochée par l'élève ou par le référent. */
  const ACTEURS = { pp: 'Professeur principal', pro: 'Enseignant professionnel', ent: 'Entreprise · tuteur', bde: 'Bureau des entreprises',
    chef: 'Cheffe d’établissement', ddf: 'DDF', int: 'Intendance' };

  /* Une étape :
     id     identifiant stable (les 21 de l'Atelier gardent le leur)
     ph     phase (indice dans PHASES)
     t      intitulé pour les adultes ; te : intitulé pour l'élève
     ty     tache · declare · remise · info · journal
     by     qui fait la tâche (tache, info)            from/to : qui remet, qui reçoit (remise)
     verif  un adulte confirme : « conforme » ou « à corriger » (declare, remise)
     local  reste dans l'Atelier, ne part jamais en ligne
     opt    seulement si besoin (ne compte pas dans l'avancement)
     flag   drapeau planté quand l'étape est validée
     doc / ou   le document et où le trouver ; src : la source (P procédure, C check-list)
     due    échéance : [base, jours, proposée]  base = dernier · debut · fin · arrivee · milieu
     voit   ce que l'élève lit quand une tâche d'adulte est faite
     lu     information pour le référent : son geste se nomme « Lu » (la proposition de stage)
     act    l'intervenant qui agit vraiment (ACTEURS) ; coche : qui coche à sa place (« eleve » ou « referent »)
     aide   les consignes « Comment faire » du référent ; src : la source (chronologie validée, procédure, check-list) */
  const ETAPES = [
    { id: "referent", ph: 0, t: "Enseignant référent désigné par le professeur principal", te: "Mon enseignant référent", ty: "tache", by: ["pp"], src: "P §1" },
    { id: "ddf_list", ph: 0, t: "Liste des référents et annexe pédagogique transmises au DDF", ty: "tache", by: ["pp"], local: true, doc: "Annexe pédagogique commune", src: "P mémento 1" },
    { id: "pack", ph: 0, t: "Dossier du référent préparé", ty: "tache", by: ["pp"], local: true },
    { id: "sent", ph: 0, t: "Le référent est informé (code de l’élève, PFMP)", ty: "remise", from: "pp", to: "referent", src: "Chronologie · procédure §1 et §2", aide: ["Le professeur principal vous a transmis par mail le code de l’élève et son nom.", "Vous l’accompagnez de la recherche d’entreprise au bilan de fin de stage."] },
    { id: "accommodation", ph: 0, t: "Besoin d’accompagnement examiné en équipe", ty: "tache", by: ["pp"], local: true, opt: true, ah: true, src: "Protocole AH étape 1", due: ["dernier", -42, true] },

    { id: "pistes", ph: 1, t: "Pistes d’entreprises", te: "Mes pistes d’entreprises", ty: "journal", src: "P §2" },
    { id: "search", ph: 1, t: "Proposition de stage", te: "J’ai une proposition de stage", ty: "declare", verif: true, lu: true, src: "Chronologie n° 1 · procédure §2 et §5", due: ["dernier", -35, true], aide: ["Prendre connaissance de l’entreprise proposée.", "Aider l’élève à trouver une autre entreprise si celle-ci ne convient pas à sa formation ou à son projet.", "Élève en situation de handicap : informer le responsable du pôle AESH, avec l’accord des responsables légaux."] },
    { id: "ah_pole", ph: 1, t: "Pôle AESH informé · accord des responsables · entreprise informée", ty: "tache", by: ["referent", "pp"], local: true, opt: true, ah: true, src: "P §2 et §5", due: ["dernier", -28, true] },

    { id: "neg_ask", ph: 2, t: "Fiche de négociation demandée à l’enseignant professionnel", te: "Demander ma fiche de négociation", ty: "declare", src: "Chronologie n° 2", voit: "Recours possible : le professeur principal, si l’enseignant professionnel est absent." },
    { id: "neg_given", ph: 2, t: "Fiche de négociation remise par l’enseignant professionnel", te: "J’ai ma fiche de négociation", ty: "declare", act: "pro", coche: "eleve", doc: "Fiche de négociation", ou: "Base documentaire de l’enseignant professionnel", src: "Chronologie n° 2" },
    { id: "neg_visit", ph: 2, t: "Fiche de négociation apportée à l’entreprise", te: "Apporter la fiche à l’entreprise", ty: "declare", doc: "Fiche de négociation", src: "Chronologie n° 3" },
    { id: "neg_company", ph: 2, t: "Activités possibles cochées · cachet et signature de l’entreprise", te: "L’entreprise l’a remplie, signée et tamponnée", ty: "declare", act: "ent", coche: "eleve", src: "Chronologie n° 4" },
    { id: "neg_family", ph: 2, t: "Fiche signée par l’élève majeur ou le responsable légal", te: "Signer ma fiche (ou mon responsable légal)", ty: "declare", src: "Chronologie n° 5" },
    { id: "neg_to_pro", ph: 2, t: "Fiche remise à l’enseignant professionnel", te: "Remettre ma fiche à mon enseignant professionnel", ty: "declare", src: "Chronologie n° 6", due: ["dernier", -33, true] },
    { id: "neg_pro", ph: 2, t: "Activités contrôlées · fiche validée et signée par l’enseignant professionnel", ty: "tache", by: ["referent"], act: "pro", coche: "referent", src: "Chronologie n° 6", due: ["dernier", -32, true], voit: "Votre enseignant professionnel a validé votre fiche." },
    { id: "neg_return", ph: 2, t: "Fiche signée transmise au référent par l’enseignant professionnel", ty: "tache", by: ["referent"], act: "pro", coche: "referent", src: "Chronologie n° 7", due: ["dernier", -31, true] },
    { id: "neg_signed", ph: 2, t: "Fiche vérifiée, signée et gardée · lieu de PFMP validé", ty: "tache", by: ["referent"], flag: "Drapeau 1", src: "Chronologie n° 8 · procédure §2", due: ["dernier", -30, true], voit: "Stage validé par votre enseignant référent.", aide: ["Vérifier les signatures : cachet et signature de l’entreprise, élève ou responsable légal, enseignant professionnel.", "Vérifier que l’entreprise peut accueillir l’élève dans des conditions de travail adaptées et sécurisées ; conseiller si besoin.", "Signer, puis garder la fiche dans le dossier : elle servira au suivi et à l’évaluation."] },

    { id: "pre_given", ph: 3, t: "Pré-convention remise en main propre", te: "J’ai ma pré-convention", ty: "remise", from: "referent", to: "eleve", doc: "Pré-convention", ou: "Pronote › Communication › Casier numérique › « PFMP - Mini stage »", src: "Chronologie n° 9 · procédure §2", due: ["dernier", -26, true], aide: ["La trouver dans Pronote › Communication › Casier numérique › « PFMP - Mini stage ».", "L’imprimer et la remettre en main propre à l’élève."] },
    { id: "pre_filled", ph: 3, t: "Pré-convention renseignée, signée et tamponnée par l’entreprise", te: "L’entreprise l’a remplie, signée et tamponnée", ty: "declare", act: "ent", coche: "eleve", src: "Chronologie n° 10" },
    { id: "pre_return", ph: 3, t: "Pré-convention rapportée · complète et exploitable", te: "Rapporter ma pré-convention", ty: "remise", from: "eleve", to: "referent", verif: true, doc: "Pré-convention", src: "Chronologie n° 11 et 12", due: ["dernier", -21, true], aide: ["Vérifier qu’elle est complète et exploitable : l’élève voit qu’elle est acceptée."] },

    { id: "pronote", ph: 4, t: "Convention générée dans le client Pronote", ty: "tache", by: ["referent"], ou: "Pronote › Stages › Stagiaires", src: "Chronologie n° 13 · check-list", due: ["dernier", -18, true], voit: "Convention en préparation.", aide: ["Pronote › Stages › Stagiaires : saisir les informations de la pré-convention.", "Éditer la convention (« R26CSRP-LP convention de stage PFMP »)."] },
    { id: "convention", ph: 4, t: "Attestation de stage éditée avec la convention · gardée de côté", ty: "tache", by: ["referent"], doc: "Convention (modèle « R26CSRP-LP convention de stage PFMP »)", ou: "Pronote › fiche de stage › publipostage", src: "Check-list", due: ["dernier", -18, true], aide: ["L’attestation (« R26CSRP-LP attestation de stage PFMP ») s’imprime avec la convention : la garder jusqu’à la signature complète."] },
    { id: "pedagogy", ph: 4, t: "Annexe pédagogique jointe", ty: "tache", by: ["referent"], doc: "Annexe pédagogique", src: "P §3", due: ["dernier", -18, true] },
    { id: "ah_docs", ph: 4, t: "Annexe handicap remplie · PIAL sollicité si besoin (étape 2bis)", ty: "tache", by: ["pp", "referent"], local: true, opt: true, ah: true, doc: "Annexe handicap · Demande AH étape 2bis", ou: "Pronote › Casier numérique", src: "Protocole AH 2 et 2bis", due: ["dernier", -14, true] },
    { id: "conv_given", ph: 4, t: "Convention remise à l’élève", te: "J’ai ma convention", ty: "remise", from: "referent", to: "eleve", src: "Chronologie n° 14 · procédure §3", due: ["dernier", -18, true], aide: ["Joindre l’annexe pédagogique de la filière.", "Si besoin : annexe handicap et demande d’aide humaine (étape 2 bis), avec l’accord des responsables légaux."] },
    { id: "company", ph: 4, t: "Convention signée par l’entreprise ou le tuteur · cachet", te: "La faire signer par l’entreprise", ty: "declare", act: "ent", coche: "eleve", src: "Chronologie n° 15" },
    { id: "family", ph: 4, t: "Convention signée par l’élève majeur ou le responsable légal", te: "La signer (ou mon responsable légal)", ty: "declare", src: "Chronologie n° 16" },
    { id: "conv_return", ph: 4, t: "Convention rapportée · contrôlée et signée par le référent", te: "Rapporter ma convention signée", ty: "remise", from: "eleve", to: "referent", verif: true, flag: "Drapeau 2", src: "Chronologie n° 17 et 18 · check-list", due: ["dernier", -11, true], aide: ["Vérifier : informations, signature de l’élève majeur ou du responsable légal, du responsable de l’entreprise ou du tuteur, cachet.", "Signer en qualité d’enseignant référent."] },
    { id: "bde", ph: 4, t: "Dossier complet transmis au bureau des entreprises", ty: "tache", by: ["referent"], src: "Chronologie n° 19", due: ["dernier", -10, true], voit: "Convention en signature au lycée.", aide: ["Convention, annexe pédagogique, et annexe handicap si besoin."] },
    { id: "bde_ok", ph: 4, t: "Dossier contrôlé par le bureau des entreprises · transmis au DDF", ty: "tache", by: ["referent"], act: "bde", coche: "referent", src: "Chronologie n° 20", due: ["dernier", -8, true] },
    { id: "head", ph: 4, t: "Convention signée par la cheffe d’établissement", ty: "tache", by: ["referent"], act: "chef", coche: "referent", src: "Chronologie n° 21" },
    { id: "ddf_copies", ph: 4, t: "Deux exemplaires signés déposés dans le casier du référent", ty: "tache", by: ["referent"], act: "ddf", coche: "referent", src: "Chronologie n° 22", due: ["dernier", -4, true] },
    { id: "copies", ph: 4, t: "Exemplaires distribués : famille et entreprise", te: "J’ai l’exemplaire signé pour ma famille", ty: "remise", from: "referent", to: "eleve", src: "Chronologie n° 23 · check-list", due: ["dernier", 0, false], aide: ["Un exemplaire à la famille : il peut être remis à l’élève.", "Un exemplaire à l’entreprise : par l’élève ou par mail."] },
    { id: "intendance", ph: 4, t: "Intendance prévenue (demi-pensionnaire, dates décalées, retour au repas)", ty: "tache", by: ["referent"], opt: true, act: "int", coche: "referent", src: "Procédure §5", due: ["dernier", 0, false], aide: ["Dates de stage différentes de celles prévues.", "Élève qui revient déjeuner au lycée pendant son stage."] },

    { id: "arrival", ph: 5, t: "Tuteur appelé la semaine d’avant : arrivée confirmée", ty: "tache", by: ["referent"], src: "Chronologie n° 24 · check-list", due: ["arrivee", 0, false], voit: "Arrivée confirmée avec le tuteur.", aide: ["Confirmer l’arrivée de l’élève à la date prévue (téléphone ou mail).", "Noter l’échange dans Pronote : « Créer un suivi »."] },

    { id: "here", ph: 6, t: "Arrivée de l’élève", te: "Je suis arrivé dans mon entreprise", ty: "declare", due: ["debut", 0, false] },
    { id: "installed", ph: 6, t: "Arrivée et installation vérifiées (deux premiers jours)", ty: "tache", by: ["referent"], ou: "Pronote › Créer un suivi", src: "Chronologie n° 25 · procédure §4", due: ["debut", 1, false], aide: ["Arrivée, installation, activités, conditions d’accueil, difficultés éventuelles.", "Noter dans Pronote : « Créer un suivi »."] },
    { id: "evaluation_sent", ph: 6, t: "Compte rendu d’évaluation envoyé au tuteur", ty: "tache", by: ["referent"], doc: "Compte rendu d’évaluation", ou: "Pronote › Casier numérique", src: "Chronologie n° 26 · check-list", due: ["debut", 1, false], aide: ["Depuis le casier numérique, pour que le tuteur en prenne connaissance avant le bilan."] },
    { id: "midpoint", ph: 6, t: "Point d’étape · suivi du milieu de stage", te: "Comment se passe mon stage ?", ty: "declare", verif: true, ou: "Pronote › Créer un suivi", src: "Chronologie n° 27", due: ["milieu", 0, false], aide: ["Contact ou visite : déroulement, activités prévues (fiche de négociation), difficultés.", "Noter dans Pronote : « Créer un suivi »."] },
    { id: "visit", ph: 6, t: "Rendez-vous du bilan fixé avec le tuteur", te: "Visite de l’enseignant référent", ty: "info", by: ["referent"], ou: "Visite de stage (RDV PFMP)", src: "Chronologie n° 28" },
    { id: "att_sent", ph: 6, t: "Attestation envoyée au tuteur (mail avant le bilan, ou à la visite)", ty: "tache", by: ["referent"], src: "Chronologie n° 29", due: ["fin", -4, false] },
    { id: "assessment", ph: 6, t: "Bilan avec le tuteur · compte rendu d’évaluation récupéré", ty: "tache", by: ["referent"], doc: "Livret de formation · grille de notation", src: "Chronologie n° 30", due: ["fin", -3, false], aide: ["Faire le bilan avec le tuteur ; récupérer le compte rendu d’évaluation lorsqu’il est finalisé.", "Le bilan peut avoir lieu avant la fin du stage : il est indépendant de l’attestation."] },
    { id: "attest_in", ph: 6, t: "Attestation finalisée par l’entreprise le dernier jour", te: "J’ai mon attestation", ty: "declare", act: "ent", coche: "eleve", src: "Chronologie n° 31", due: ["fin", -3, false] },

    { id: "attestation", ph: 7, t: "Attestation rapportée au référent", te: "Rapporter mon attestation", ty: "remise", from: "eleve", to: "referent", flag: "Drapeau 3", src: "Chronologie n° 32", due: ["fin", 5, true] },
    { id: "attestation_bde", ph: 7, t: "Attestation transmise pour l’allocation PFMP", ty: "tache", by: ["referent"], src: "Chronologie n° 33 · check-list", due: ["fin", 5, true], aide: ["Contrôler l’attestation, puis la transmettre au bureau des entreprises pour l’allocation PFMP."] },
    { id: "evaluation_pro", ph: 7, t: "Compte rendu d’évaluation remis à l’enseignant professionnel", ty: "tache", by: ["referent"], src: "Chronologie n° 34 · check-list", due: ["fin", 12, true], aide: ["Le professeur de spécialité est l’enseignant professionnel de l’élève."] },
    { id: "student_eval", ph: 7, t: "Bilan du stage avec l’élève · évaluation de la PFMP", te: "Faire le bilan avec mon référent", ty: "declare", verif: true, flag: "Arrivée", src: "Procédure §4 · mémento 10", due: ["fin", 12, true], aide: ["Faire compléter l’évaluation de la PFMP par l’élève lors du bilan final."] },
    { id: "ah_bilan", ph: 7, t: "Bilan de l’accompagnement : renforcer, maintenir, réduire", ty: "tache", by: ["pp"], local: true, opt: true, ah: true, src: "Protocole AH étape 3", due: ["fin", 12, true] },

    { id: "appreciation", ph: 8, t: "Clôture dans Pronote : appréciation du tuteur · traçabilité", ty: "tache", by: ["referent"], ou: "Pronote › suivi du stage", src: "Chronologie n° 35 · check-list", due: ["fin", 12, true], aide: ["Saisir l’appréciation générale du tuteur.", "Vérifier que les appels, mails, visites et suivis sont notés."] },
    { id: "archive", ph: 8, t: "Archivage : papier au bureau du DDF, numérique dans Pronote", ty: "tache", by: ["referent"], src: "Procédure §1 · mémento 9", aide: ["Version papier : au bureau du DDF.", "Version numérique : enregistrée dans Pronote."] },
    { id: "dossier", ph: 8, t: "Dossier de l’élève rangé", ty: "tache", by: ["referent"], src: "Chronologie · check-list", due: ["fin", 14, true], aide: ["Fiche de négociation signée.", "Échanges notés dans Pronote.", "Compte rendu d’évaluation remis à l’enseignant professionnel."] }
  ];
  /* Étapes retirées : plus affichées, mais encore reconnues pour que les fiches déjà en ligne restent valides. */
  const RETIREES = [
    { id: 'pre_visa', ph: 3, t: 'Pré-convention visée par le professeur de spécialité', ty: 'declare', retiree: true }
  ];
  /* 09/10/2026 : les documents que l'élève garde. Il peut dire à tout moment « Je l'ai déjà » (même avant son tour)
     ou « Je l'ai perdu » : le référent et le PP sont prévenus, et l'un d'eux le « remet à nouveau ». */
  const GARDE = { neg_given: 'Fiche de négociation', pre_given: 'Pré-convention', conv_given: 'Convention', copies: 'Exemplaire signé de la convention', attest_in: 'Attestation de stage' };
  ETAPES.forEach(e => { if (GARDE[e.id]) e.garde = GARDE[e.id]; });
  const PAR_ID = Object.fromEntries(ETAPES.concat(RETIREES).map(e => [e.id, e]));
  const EN_LIGNE = ETAPES.filter(e => !e.local);

  /* ── Dates ─────────────────────────────────────────────────────────────── */
  const RE_DATE = /^\d{4}-\d{2}-\d{2}$/;
  function jour(s) { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d); }
  function iso(t) { return new Date(t).toISOString().slice(0, 10); }
  function plus(s, n) { return iso(jour(s) + n * 864e5); }
  function ecartJours(a, b) { return Math.round((jour(b) - jour(a)) / 864e5); }

  /* Calendrier scolaire (zone A, Lyon) : vacances du premier jour inclus au jour de rentrée exclu, jours fériés.
     Repris de l'Atelier (Progression annuelle) le 08/10/2026. Il sert quand la page n'a pas d'autre calendrier :
     l'élève et le référent calculent ainsi les mêmes dates que le professeur principal. */
  const CALENDRIER = {
    '2026-2027': {
      vacances: [{ d: '2026-10-17', f: '2026-11-02' }, { d: '2026-12-19', f: '2027-01-04' }, { d: '2027-02-13', f: '2027-03-01' },
        { d: '2027-04-10', f: '2027-04-26' }, { d: '2027-05-05', f: '2027-05-10' }, { d: '2027-07-03', f: '2027-08-31' }],
      feries: ['2026-11-01', '2026-11-11', '2026-12-25', '2027-01-01', '2027-03-29', '2027-05-01', '2027-05-06', '2027-05-08', '2027-05-17']
    }
  };
  function calendrierDe(s) {
    if (!s || !RE_DATE.test(s)) return { vacances: [], feries: [] };
    const [y, m] = s.split('-').map(Number), an = m >= 8 ? y + '-' + (y + 1) : (y - 1) + '-' + y;
    return CALENDRIER[an] || { vacances: [], feries: [] };
  }
  function estJourDeClasse(s, vacances, feries) {
    const fer = new Set((feries || []).map(f => f.d || f));
    const w = new Date(jour(s)).getUTCDay();
    return !(w === 0 || w === 6 || fer.has(s) || (vacances || []).some(v => v.d === v.f ? s === v.d : (s >= v.d && s < v.f)));
  }

  /* Dernier jour de cours avant le départ : un jour de semaine, hors vacances
     (du premier jour inclus au jour de rentrée exclu) et hors jours fériés. */
  function dernierJourDeCours(debut, vacances, feries) {
    if (vacances == null) { const c = calendrierDe(debut); vacances = c.vacances; feries = c.feries; }
    let s = plus(debut, -1);
    for (let i = 0; i < 60; i++, s = plus(s, -1)) if (estJourDeClasse(s, vacances, feries)) return s;
    return plus(debut, -3);
  }

  function echeance(etape, per) {
    if (!etape || !etape.due || !per) return null;
    const [base, n, prop] = etape.due;
    let d = null;
    if (base === 'dernier') d = per.dernierJour;
    else if (base === 'debut') d = per.debut;
    else if (base === 'fin') d = per.fin;
    else if (base === 'arrivee') { const a = plus(per.debut, -7); d = per.dernierJour && per.dernierJour < a ? per.dernierJour : a; }
    else if (base === 'milieu') d = plus(per.debut, Math.floor(ecartJours(per.debut, per.fin) / 2));
    if (!d || !RE_DATE.test(d)) return null;
    let date = plus(d, n || 0);
    /* Une échéance comptée depuis le dernier jour de cours ou la fin du stage ne tombe jamais pendant les vacances,
       un week-end ou un jour férié : elle avance au dernier jour de classe précédent. */
    if (base === 'dernier' || base === 'fin') {
      const c = calendrierDe(date);
      for (let i = 0; i < 40 && !estJourDeClasse(date, c.vacances, c.feries); i++) date = plus(date, -1);
    }
    return { date, proposee: !!prop };
  }

  /* ── États et droits ───────────────────────────────────────────────────── */
  const FINI = new Set(['valide', 'fait']);
  function entree(suivi, id) { return (suivi && suivi.etapes && suivi.etapes[id]) || { e: '' }; }
  function estFaite(suivi, id) { return FINI.has(entree(suivi, id).e); }
  const adulte = r => r === 'referent' || r === 'pp';

  /* Ce que tel rôle peut faire sur telle étape, dans l'état où elle est. */
  const EN_MAIN = e => ['fait', 'valide', 'declare'].includes(e);
  function actions(etape, en, role) {
    const e = (en && en.e) || '';
    /* Un document perdu : l'élève peut l'avoir retrouvé ; le référent ou le PP le remet à nouveau. */
    if (etape && etape.garde && e === 'perdu') return role === 'eleve' ? ['retrouver'] : ['redonner'];
    const out = actionsBase(etape, e, role);
    if (etape && etape.garde && role === 'eleve' && EN_MAIN(e)) out.push('perdre');
    return out;
  }
  function actionsBase(etape, e, role) {
    const out = [];
    if (!etape || etape.ty === 'journal') return out;
    if (etape.local && role === 'eleve') return out;
    if (etape.ty === 'tache' || etape.ty === 'info') {
      const peut = etape.by.includes(role) || (role === 'pp' && etape.by.includes('referent'));
      if (!peut) return out;
      if (e === 'fait') out.push('annuler'); else out.push('faire');
      return out;
    }
    if (etape.ty === 'declare') {
      if (role === 'eleve') {
        if (e === '' || e === 'corriger') out.push('declarer');
        else if (e === 'declare' || (e === 'fait' && !etape.verif)) out.push('annuler');
      } else if (etape.verif) {
        if (e === 'declare') out.push('valider', 'corriger');
        else if (e === '' || e === 'corriger') out.push('valider');
        else if (e === 'valide') out.push('annuler');
      } else if (e === 'fait') out.push('annuler');
      return out;
    }
    if (etape.ty === 'remise') {
      const donne = role === etape.from || (role === 'pp' && etape.from === 'referent');
      const recoit = role === etape.to || (role === 'pp' && etape.to === 'referent' && etape.from !== 'pp');
      if (donne && (e === '' || e === 'corriger')) out.push('remettre');
      if (donne && e === 'remis') out.push('annuler');
      if (recoit && e !== 'valide') { out.push('recevoir'); if (etape.verif && e === 'remis') out.push('corriger'); }
      if (recoit && e === 'valide') out.push('annuler');
      return out;
    }
    return out;
  }

  const LIBELLES = {
    eleve: { declarer: 'C’est fait', remettre: 'Je l’ai remis', recevoir: 'Je l’ai reçu', annuler: 'Annuler', perdre: 'Je l’ai perdu', retrouver: 'Je l’ai retrouvé' },
    adulte: { faire: 'Fait', valider: 'Conforme', corriger: 'À corriger', remettre: 'Remis', recevoir: 'Reçu', annuler: 'Annuler', declarer: 'Fait', redonner: 'Remis à nouveau' }
  };
  function libelleAction(a, role, etape) {
    if (etape && etape.ty === 'remise' && a === 'recevoir' && etape.verif && role !== 'eleve') return 'Reçu · conforme';
    return (role === 'eleve' ? LIBELLES.eleve : LIBELLES.adulte)[a] || a;
  }

  /* Applique une action. Renvoie la nouvelle entrée et la ligne de journal.
     Lève une erreur en français si l'action n'est pas permise. */
  function appliquer(suivi, id, action, role, opts) {
    const etape = PAR_ID[id];
    if (!etape) throw new Error('Étape inconnue.');
    if (!ROLES.includes(role)) throw new Error('Rôle inconnu.');
    const en = entree(suivi, id);
    if (!actions(etape, en, role).includes(action)) throw new Error('Cette action n’est pas possible à cette étape.');
    const le = (opts && opts.le) || new Date().toISOString();
    let e;
    if (action === 'declarer') e = etape.verif ? 'declare' : 'fait';
    else if (action === 'remettre') e = 'remis';
    else if (action === 'recevoir' || action === 'valider') e = 'valide';
    else if (action === 'faire') e = 'fait';
    else if (action === 'corriger') e = 'corriger';
    else if (action === 'perdre') e = 'perdu';
    /* Retrouvé : le document est de nouveau en main. Remis à nouveau : l'élève n'a plus qu'à dire « Je l'ai ». */
    else if (action === 'retrouver') e = etape.ty === 'remise' ? 'valide' : 'fait';
    else if (action === 'redonner') e = etape.ty === 'remise' ? 'remis' : 'fait';
    else e = '';
    const nouvelle = { e, par: role, le };
    if (action === 'corriger') {
      const motif = String((opts && opts.motif) || '').trim();
      if (!motif) throw new Error('Indiquez ce qu’il faut corriger.');
      nouvelle.motif = motif.slice(0, 300);
    }
    if (opts && opts.v != null && action !== 'annuler') nouvelle.v = String(opts.v).slice(0, 120);
    const journal = { etape: id, e, par: role, le };
    if (nouvelle.motif) journal.motif = nouvelle.motif;
    return { entree: nouvelle, journal };
  }

  /* À vérifier par un adulte : l'élève a déclaré ou remis, il faut répondre. */
  function aVerifier(suivi) {
    return EN_LIGNE.filter(et => {
      const e = entree(suivi, et.id).e;
      if (et.garde && e === 'perdu') return true;
      if (et.ty === 'declare' && et.verif) return e === 'declare';
      if (et.ty === 'remise' && et.to === 'referent') return e === 'remis';
      return false;
    });
  }

  /* Ce que tel rôle a à faire maintenant (étapes non faites où il peut agir). */
  function aFaire(suivi, role) {
    return ETAPES.filter(et => {
      if (et.ty === 'journal' || et.opt) return false;
      if (role === 'eleve' && et.local) return false;
      if (estFaite(suivi, et.id)) return false;
      const a = actions(et, entree(suivi, et.id), role);
      return a.some(x => x !== 'annuler');
    });
  }

  function avancement(suivi, avecLocal) {
    const liste = ETAPES.filter(e => e.ty !== 'journal' && !e.opt && (avecLocal || !e.local));
    const faits = liste.filter(e => estFaite(suivi, e.id)).length;
    return { faits, total: liste.length, pct: liste.length ? Math.round(faits / liste.length * 100) : 0 };
  }
  function drapeaux(suivi) { return ETAPES.filter(e => e.flag).map(e => ({ id: e.id, label: e.flag, ok: estFaite(suivi, e.id) })); }
  function phaseCourante(suivi) {
    for (let p = 0; p < PHASES.length; p++) {
      if (ETAPES.some(e => e.ph === p && !e.local && !e.opt && e.ty !== 'journal' && !estFaite(suivi, e.id))) return p;
    }
    return PHASES.length - 1;
  }
  function enRetard(suivi, aujourdhui) {
    return EN_LIGNE.filter(et => {
      if (et.opt || et.ty === 'journal' || estFaite(suivi, et.id)) return false;
      const ec = echeance(et, suivi);
      return ec && ec.date < aujourdhui;
    });
  }

  /* Année scolaire : de septembre à août (« 2026-2027 »). */
  function anneeScolaire(d) {
    d = d || new Date();
    const y = d.getFullYear();
    return d.getMonth() >= 7 ? y + '-' + (y + 1) : (y - 1) + '-' + y;
  }
  /* Filière pour ranger un rendez-vous de visite (outil RDV PFMP). */
  function filiereDe(classe) {
    const c = String(classe || '').toUpperCase();
    if (/GATL|AGO/.test(c)) return 'AGOrA';
    if (/MELEC/.test(c)) return 'MELEC';
    if (/PSR/.test(c)) return 'CAP PSR';
    return '';
  }

  /* ── Identifiants et contrôles (le miroir des règles Firestore) ───────── */
  const RE_ANNEE = /^20\d{2}-20\d{2}$/;
  const RE_CODE = /^[A-Z0-9]{4,6}$/;
  const RE_REF = /^\d{6}$/;
  const RE_SUIVI = /^20\d{2}-20\d{2}_[A-Z0-9]{4,6}_p[1-4]$/;
  function suiviId(annee, code, n) {
    code = String(code || '').trim().toUpperCase();
    if (!RE_ANNEE.test(annee) || !RE_CODE.test(code) || !(n >= 1 && n <= 4)) throw new Error('Identifiant de suivi invalide.');
    return annee + '_' + code + '_p' + n;
  }
  function referentId(annee, code) {
    if (!RE_ANNEE.test(annee) || !RE_REF.test(String(code))) throw new Error('Code référent invalide.');
    return annee + '_' + code;
  }
  function nouveauCodeReferent(dejaPris, aleatoire) {
    const pris = new Set(dejaPris || []);
    const hasard = aleatoire || (() => Math.random());
    for (let i = 0; i < 1000; i++) {
      const c = String(100000 + Math.floor(hasard() * 900000));
      if (!pris.has(c)) return c;
    }
    throw new Error('Impossible de créer un code.');
  }
  function sigleDe(nom) {
    const mots = String(nom || '').trim().split(/[\s-]+/).filter(Boolean);
    if (!mots.length) return '';
    return mots.slice(0, 3).map(m => m[0].toUpperCase() + '.').join(' ');
  }

  const CHAMPS_SUIVI = ['id', 'type', 'annee', 'code', 'classe', 'periode', 'libelle', 'debut', 'fin', 'dernierJour',
    'refSigle', 'etapes', 'pistes', 'trouve', 'visite', 'creeLe', 'majLe', 'majPar', 'version'];
  const MAX_PISTES = 40, MAX_MSG = 1000;

  function nettoyerPiste(p) {
    const t = (x, n) => String(x == null ? '' : x).trim().slice(0, n);
    const reponses = ['attente', 'entretien', 'refus', 'accord'];
    const moyens = ['appel', 'mail', 'visite', 'courrier', 'autre'];
    const o = { id: t(p.id, 20) || ('p' + Math.random().toString(36).slice(2, 9)), structure: t(p.structure, 80), secteur: t(p.secteur, 80),
      moyen: moyens.includes(p.moyen) ? p.moyen : 'autre', date: RE_DATE.test(p.date || '') ? p.date : '', reponse: reponses.includes(p.reponse) ? p.reponse : 'attente' };
    if (!o.structure) throw new Error('Indiquez le type de structure.');
    return o;
  }

  function verifierSuivi(d) {
    const err = [];
    if (!d || typeof d !== 'object') return ['document vide'];
    Object.keys(d).forEach(k => { if (!CHAMPS_SUIVI.includes(k)) err.push('champ interdit : ' + k); });
    if (!RE_SUIVI.test(d.id || '')) err.push('id');
    if (d.type !== 'suivi') err.push('type');
    if (!RE_CODE.test(d.code || '')) err.push('code');
    if (!(Number.isInteger(d.version) && d.version >= 1)) err.push('version');
    ['debut', 'fin', 'dernierJour'].forEach(k => { if (d[k] != null && !RE_DATE.test(d[k])) err.push(k); });
    if (d.etapes) Object.keys(d.etapes).forEach(k => { const et = PAR_ID[k]; if (!et || et.local) err.push('étape interdite en ligne : ' + k); });
    if (d.pistes && (!Array.isArray(d.pistes) || d.pistes.length > MAX_PISTES)) err.push('pistes');
    return err;
  }

  /* ── Accès Firestore ───────────────────────────────────────────────────
     On reçoit les fonctions du SDK de la page :
       modulaire : { doc, collection, runTransaction, setDoc, onSnapshot }  + db
       compat    : l'objet firestore() de Firebase 8/compat
     Les deux exposent la même interface ci-dessous. */
  function depotModulaire(F, db) {
    const ref = chemin => F.doc(db, ...chemin.split('/'));
    return {
      ecouter(chemin, cb, err) { return F.onSnapshot(ref(chemin), s => cb(s.exists() ? s.data() : null), err || (() => {})); },
      ecouterCollection(chemin, cb, err) { return F.onSnapshot(F.collection(db, ...chemin.split('/')), s => cb(s.docs.map(d => Object.assign({ __id: d.id }, d.data()))), err || (() => {})); },
      transaction(chemin, fn) {
        return F.runTransaction(db, async t => {
          const s = await t.get(ref(chemin));
          const res = fn(s.exists() ? s.data() : null);
          if (!res) return null;
          t.set(ref(chemin), res.data);
          (res.ajouts || []).forEach(a => t.set(F.doc(F.collection(db, ...a.collection.split('/'))), a.data));
          return res.data;
        });
      },
      ajouter(cheminCollection, data) { return F.setDoc(F.doc(F.collection(db, ...cheminCollection.split('/'))), data); }
    };
  }
  function depotCompat(fs) {
    const ref = chemin => fs.doc(chemin);
    return {
      ecouter(chemin, cb, err) { return ref(chemin).onSnapshot(s => cb(s.exists ? s.data() : null), err || (() => {})); },
      ecouterCollection(chemin, cb, err) { return fs.collection(chemin).onSnapshot(s => cb(s.docs.map(d => Object.assign({ __id: d.id }, d.data()))), err || (() => {})); },
      transaction(chemin, fn) {
        return fs.runTransaction(async t => {
          const s = await t.get(ref(chemin));
          const res = fn(s.exists ? s.data() : null);
          if (!res) return null;
          t.set(ref(chemin), res.data);
          (res.ajouts || []).forEach(a => t.set(fs.collection(a.collection).doc(), a.data));
          return res.data;
        });
      },
      ajouter(cheminCollection, data) { return fs.collection(cheminCollection).doc().set(data); }
    };
  }

  /* Opérations métier, communes aux trois espaces. */
  function service(depot) {
    const chSuivi = id => COL_SUIVI + '/' + id;
    function majCommune(data, par, le) { data.majLe = le; data.majPar = par; data.version = (data.version || 0) + 1; return data; }
    return {
      ecouterSuivi: (id, cb, err) => depot.ecouter(chSuivi(id), cb, err),
      ecouterReferent: (id, cb, err) => depot.ecouter(COL_REFERENTS + '/' + id, cb, err),
      ecouterMessages: (id, cb, err) => depot.ecouterCollection(chSuivi(id) + '/messages', l => cb(l.sort((a, b) => String(a.le).localeCompare(String(b.le)))), err),
      ecouterJournal: (id, cb, err) => depot.ecouterCollection(chSuivi(id) + '/journal', l => cb(l.sort((a, b) => String(a.le).localeCompare(String(b.le)))), err),

      /* Une action sur une étape (élève, référent ou PP). */
      agir(id, etapeId, action, role, opts) {
        return depot.transaction(chSuivi(id), cur => {
          if (!cur) throw new Error('Ce suivi n’existe pas encore.');
          const { entree: en, journal } = appliquer(cur, etapeId, action, role, opts);
          const data = JSON.parse(JSON.stringify(cur));
          data.etapes = data.etapes || {};
          data.etapes[etapeId] = en;
          if (etapeId === 'visit' && action === 'faire' && opts && opts.v) data.visite = Object.assign({}, data.visite || {}, { le: String(opts.v), statut: 'confirme' });
          if (etapeId === 'visit' && action === 'annuler' && data.visite) data.visite = Object.assign({}, data.visite, { le: '', statut: 'annule' });
          return { data: majCommune(data, role, journal.le), ajouts: [{ collection: chSuivi(id) + '/journal', data: journal }] };
        });
      },

      /* Pistes de l'élève : ajout, mise à jour de la réponse. */
      majPistes(id, fn, role) {
        return depot.transaction(chSuivi(id), cur => {
          if (!cur) throw new Error('Ce suivi n’existe pas encore.');
          const data = JSON.parse(JSON.stringify(cur));
          const pistes = fn((data.pistes || []).slice()).map(nettoyerPiste);
          if (pistes.length > MAX_PISTES) throw new Error('Trop de pistes (40 au plus).');
          data.pistes = pistes;
          return { data: majCommune(data, role || 'eleve', new Date().toISOString()) };
        });
      },

      /* « J'ai trouvé » : type de structure et secteur, jamais de nom ni de lieu. */
      declarerTrouve(id, trouve) {
        return depot.transaction(chSuivi(id), cur => {
          if (!cur) throw new Error('Ce suivi n’existe pas encore.');
          const { entree: en, journal } = appliquer(cur, 'search', 'declarer', 'eleve');
          const data = JSON.parse(JSON.stringify(cur));
          data.etapes = data.etapes || {};
          data.etapes.search = en;
          data.trouve = { structure: String(trouve.structure || '').trim().slice(0, 80), secteur: String(trouve.secteur || '').trim().slice(0, 80) };
          if (!data.trouve.structure) throw new Error('Indiquez le type de structure.');
          return { data: majCommune(data, 'eleve', journal.le), ajouts: [{ collection: chSuivi(id) + '/journal', data: journal }] };
        });
      },

      /* Visite : rattacher un rendez-vous, ou noter son état. Référent seulement. */
      majVisite(id, visite, role) {
        return depot.transaction(chSuivi(id), cur => {
          if (!cur) throw new Error('Ce suivi n’existe pas encore.');
          const data = JSON.parse(JSON.stringify(cur));
          const v = Object.assign({}, data.visite || {}, visite);
          data.visite = { rdv: String(v.rdv || '').slice(0, 40), statut: String(v.statut || '').slice(0, 20), type: String(v.type || '').slice(0, 40), le: String(v.le || '').slice(0, 60) };
          return { data: majCommune(data, role || 'referent', new Date().toISOString()) };
        });
      },

      envoyerMessage(id, de, sigle, texte) {
        const t = String(texte || '').trim();
        if (!t) return Promise.reject(new Error('Message vide.'));
        if (!ROLES.includes(de)) return Promise.reject(new Error('Rôle inconnu.'));
        return depot.ajouter(chSuivi(id) + '/messages', { de, sigle: String(sigle || '').slice(0, 12), texte: t.slice(0, MAX_MSG), le: new Date().toISOString() });
      },

      /* Atelier : créer ou mettre à jour une fiche sans toucher aux étapes saisies en ligne. */
      async publierSuivi(base) {
        const id = suiviId(base.annee, base.code, base.periode);
        return depot.transaction(chSuivi(id), cur => {
          const le = new Date().toISOString();
          const commun = { classe: String(base.classe || '').slice(0, 20), libelle: String(base.libelle || '').slice(0, 60), debut: base.debut, fin: base.fin,
            dernierJour: base.dernierJour, refSigle: String(base.refSigle || '').slice(0, 12) };
          let data;
          if (!cur) data = Object.assign({ id, type: 'suivi', annee: base.annee, code: String(base.code).toUpperCase(), periode: base.periode, etapes: {}, pistes: [], creeLe: le }, commun, { version: 0 });
          else data = Object.assign(JSON.parse(JSON.stringify(cur)), commun);
          (base.etapesPP || []).forEach(([eid, en]) => {
            const et = PAR_ID[eid]; if (!et || et.local) return;
            const enLigne = (data.etapes || {})[eid];
            if (!enLigne || String(enLigne.le || '') < String(en.le || '')) { data.etapes = data.etapes || {}; data.etapes[eid] = en; }
          });
          const pb = verifierSuivi(majCommune(data, 'pp', le));
          if (pb.length) throw new Error('Fiche refusée : ' + pb.join(', '));
          return { data };
        });
      },
      async publierReferent(annee, code, sigle, suivis) {
        const id = referentId(annee, code);
        return depot.transaction(COL_REFERENTS + '/' + id, cur => ({
          data: { id, type: 'referent', annee, code: String(code), sigle: String(sigle || '').slice(0, 12), suivis: suivis.slice(0, 40),
            majLe: new Date().toISOString(), version: ((cur && cur.version) || 0) + 1 }
        }));
      }
    };
  }

  const API = { VERSION, GARDE, ACTEURS, CALENDRIER, calendrierDe, estJourDeClasse, COL_SUIVI, COL_REFERENTS, ROLES, PHASES, ETAPES, PAR_ID, EN_LIGNE,
    plus, ecartJours, dernierJourDeCours, echeance, entree, estFaite, actions, libelleAction, appliquer,
    aVerifier, aFaire, avancement, drapeaux, phaseCourante, enRetard,
    anneeScolaire, filiereDe, suiviId, referentId, nouveauCodeReferent, sigleDe, nettoyerPiste, verifierSuivi, CHAMPS_SUIVI,
    depotModulaire, depotCompat, service };
  racine.PFMP_COMMUN = API;
})(typeof globalThis !== 'undefined' ? globalThis : window);
