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

  const VERSION = '2026-10-07';
  const COL_SUIVI = 'coordination_pfmp_suivi';
  const COL_REFERENTS = 'coordination_pfmp_referents';
  const ROLES = ['eleve', 'referent', 'pp'];

  /* 07/10/2026 : la fiche de négociation devient une phase, avant la pré-convention (ordre validé par Brahim). */
  const PHASES = ['Préparer', 'Trouver l’entreprise', 'Fiche de négociation', 'Pré-convention', 'Convention',
    'Avant le départ', 'Pendant le stage', 'Retour'];

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
     voit   ce que l'élève lit quand une tâche d'adulte est faite */
  const ETAPES = [
    { id: 'referent', ph: 0, t: 'Référent attribué à l’élève', te: 'Enseignant référent désigné', ty: 'tache', by: ['pp'], src: 'P §1', voit: 'Enseignant référent désigné.' },
    { id: 'ddf_list', ph: 0, t: 'Liste des référents et annexe pédagogique transmises au DDF', ty: 'tache', by: ['pp'], local: true, doc: 'Annexe pédagogique commune', src: 'P mémento 1' },
    { id: 'pack', ph: 0, t: 'Dossier du référent préparé', ty: 'tache', by: ['pp'], local: true },
    { id: 'sent', ph: 0, t: 'Dossier transmis au référent', ty: 'remise', from: 'pp', to: 'referent' },
    { id: 'accommodation', ph: 0, t: 'Besoin d’accompagnement examiné en équipe', ty: 'tache', by: ['pp'], local: true, opt: true, ah: true, src: 'Protocole AH étape 1', due: ['dernier', -42, true] },

    { id: 'pistes', ph: 1, t: 'Pistes d’entreprises', te: 'Mes pistes d’entreprises', ty: 'journal', src: 'P §2' },
    { id: 'search', ph: 1, t: 'Entreprise trouvée : conditions adaptées et sécurisées', te: 'J’ai trouvé mon entreprise', ty: 'declare', verif: true, flag: 'Drapeau 1', src: 'P §2', due: ['dernier', -35, true] },
    { id: 'ah_pole', ph: 1, t: 'Pôle AESH informé · accord des responsables · entreprise informée', ty: 'tache', by: ['referent', 'pp'], local: true, opt: true, ah: true, src: 'P §2 et §5', due: ['dernier', -28, true] },

    { id: 'neg_visit', ph: 2, t: 'Fiche de négociation présentée à l’entreprise · activités cochées par le tuteur', te: 'Je suis allé à l’entreprise avec ma fiche de négociation', ty: 'declare', doc: 'Fiche de négociation', src: 'Fiche de négociation' },
    { id: 'neg_company', ph: 2, t: 'Fiche de négociation signée et tamponnée par l’entreprise', te: 'L’entreprise a signé et tamponné ma fiche', ty: 'declare', src: 'Fiche de négociation' },
    { id: 'neg_family', ph: 2, t: 'Fiche de négociation signée par l’élève majeur ou le responsable légal', te: 'J’ai signé ma fiche (ou mon responsable légal)', ty: 'declare', src: 'Fiche de négociation' },
    { id: 'neg_pro', ph: 2, t: 'Fiche de négociation validée par l’enseignant professionnel', ty: 'tache', by: ['referent'], src: 'C', due: ['dernier', -32, true], voit: 'Votre enseignant professionnel a validé votre fiche de négociation.' },
    { id: 'neg_return', ph: 2, t: 'Fiche de négociation remise au référent', te: 'J’ai remis ma fiche de négociation à mon référent', ty: 'remise', from: 'eleve', to: 'referent', due: ['dernier', -31, true] },
    { id: 'neg_signed', ph: 2, t: 'Fiche de négociation signée par le référent · gardée au dossier', ty: 'tache', by: ['referent'], src: 'Fiche de négociation', due: ['dernier', -30, true] },

    { id: 'pre_given', ph: 3, t: 'Pré-convention remise à l’élève', te: 'J’ai reçu ma pré-convention', ty: 'remise', from: 'referent', to: 'eleve', doc: 'Pré-convention', ou: 'Pronote › Communication › Casier numérique › « PFMP - Mini stage »', src: 'P mémento 2', due: ['dernier', -26, true] },
    { id: 'pre_filled', ph: 3, t: 'Pré-convention remplie par l’entreprise', te: 'L’entreprise a rempli ma pré-convention', ty: 'declare', src: 'P §3' },
    { id: 'pre_return', ph: 3, t: 'Pré-convention rapportée et entièrement renseignée', te: 'J’ai rapporté ma pré-convention', ty: 'remise', from: 'eleve', to: 'referent', verif: true, doc: 'Pré-convention', src: 'P §3 · C', due: ['dernier', -21, true] },

    { id: 'pronote', ph: 4, t: 'Pré-convention saisie dans le client Pronote', ty: 'tache', by: ['referent'], ou: 'Pronote › Stages › Stagiaires', src: 'P mémento 4 · C', due: ['dernier', -18, true], voit: 'Convention en préparation (saisie dans Pronote).' },
    { id: 'convention', ph: 4, t: 'Convention et attestation éditées · attestation mise de côté jusqu’à la signature complète', ty: 'tache', by: ['referent'], doc: 'Convention (modèle « R26CSRP-LP convention de stage PFMP »)', ou: 'Pronote › fiche de stage › publipostage', src: 'C', due: ['dernier', -18, true] },
    { id: 'pedagogy', ph: 4, t: 'Annexe pédagogique jointe', ty: 'tache', by: ['referent'], doc: 'Annexe pédagogique', src: 'P §3', due: ['dernier', -18, true] },
    { id: 'ah_docs', ph: 4, t: 'Annexe handicap remplie · PIAL sollicité si besoin (étape 2bis)', ty: 'tache', by: ['pp', 'referent'], local: true, opt: true, ah: true, doc: 'Annexe handicap · Demande AH étape 2bis', ou: 'Pronote › Casier numérique', src: 'Protocole AH 2 et 2bis', due: ['dernier', -14, true] },
    { id: 'conv_given', ph: 4, t: 'Convention remise à l’élève pour les signatures', te: 'J’ai reçu ma convention à faire signer', ty: 'remise', from: 'referent', to: 'eleve', due: ['dernier', -18, true] },
    { id: 'company', ph: 4, t: 'Signatures de l’entreprise et du tuteur, cachet', te: 'Signée par l’entreprise et le tuteur, avec le cachet', ty: 'declare', src: 'P (C : entreprise ou tuteur)' },
    { id: 'family', ph: 4, t: 'Signature de l’élève majeur ou du représentant légal', te: 'Signée par moi (ou par mon représentant légal si je suis mineur)', ty: 'declare', src: 'P · C' },
    { id: 'conv_return', ph: 4, t: 'Convention rapportée, conforme, signée par le référent', te: 'J’ai rapporté ma convention signée', ty: 'remise', from: 'eleve', to: 'referent', verif: true, flag: 'Drapeau 2', src: 'P §3 · C', due: ['dernier', -11, true] },
    { id: 'bde', ph: 4, t: 'Convention transmise au bureau des entreprises (+ annexes)', ty: 'tache', by: ['referent'], src: 'P mémento 6 · C', due: ['dernier', -10, true], voit: 'Convention en signature au lycée.' },
    { id: 'head', ph: 4, t: 'Signée par la cheffe d’établissement · exemplaires récupérés au casier', ty: 'tache', by: ['referent'], src: 'P mémento 7' },
    { id: 'copies', ph: 4, t: 'Exemplaires remis à la famille et à l’entreprise (avec l’attestation)', te: 'J’ai remis l’exemplaire de la convention à mes parents', ty: 'remise', from: 'referent', to: 'eleve', src: 'P mémento 8 · C', due: ['dernier', 0, false] },
    { id: 'archive', ph: 4, t: 'Archivage : papier au bureau du DDF, numérique dans Pronote', ty: 'tache', by: ['referent'], src: 'P mémento 9' },
    { id: 'intendance', ph: 4, t: 'Intendance prévenue (demi-pensionnaire, dates décalées, retour au repas)', ty: 'tache', by: ['referent'], opt: true, src: 'P §5', due: ['dernier', 0, false] },

    { id: 'arrival', ph: 5, t: 'Tuteur appelé : arrivée confirmée', ty: 'tache', by: ['referent'], src: 'C', due: ['arrivee', 0, false], voit: 'Arrivée confirmée avec le tuteur.' },
    { id: 'visit', ph: 5, t: 'Visite programmée avec le tuteur', te: 'Visite de l’enseignant référent', ty: 'info', by: ['referent'], ou: 'Visite de stage (RDV PFMP)', src: 'C' },

    { id: 'here', ph: 6, t: 'Arrivée de l’élève', te: 'Je suis arrivé dans mon entreprise', ty: 'declare', due: ['debut', 0, false] },
    { id: 'installed', ph: 6, t: 'Installation et conditions d’accueil vérifiées', ty: 'tache', by: ['referent'], ou: 'Pronote › Créer un suivi', src: 'P §4 · C', due: ['debut', 1, false] },
    { id: 'evaluation_sent', ph: 6, t: 'Compte rendu d’évaluation envoyé au tuteur', ty: 'tache', by: ['referent'], doc: 'Compte rendu d’évaluation', ou: 'Pronote › Casier numérique', src: 'C', due: ['debut', 1, false] },
    { id: 'midpoint', ph: 6, t: 'Point d’étape de l’élève · contact du référent', te: 'Comment se passe mon stage ?', ty: 'declare', verif: true, ou: 'Pronote › Créer un suivi', src: 'P §4', due: ['milieu', 0, false] },
    { id: 'assessment', ph: 6, t: 'Visite-bilan faite, compte rendu d’évaluation récupéré', ty: 'tache', by: ['referent'], doc: 'Livret de formation · grille de notation', src: 'P §4 · C', due: ['fin', -3, false] },

    { id: 'attest_in', ph: 7, t: 'Attestation remise à l’élève par l’entreprise', te: 'L’entreprise m’a remis mon attestation', ty: 'declare', src: 'C', due: ['fin', -3, false] },
    { id: 'attestation', ph: 7, t: 'Attestation rapportée au référent', te: 'J’ai rapporté mon attestation', ty: 'remise', from: 'eleve', to: 'referent', flag: 'Drapeau 3', src: 'P mémento 11 · C', due: ['fin', 5, true] },
    { id: 'attestation_bde', ph: 7, t: 'Attestation transmise au bureau des entreprises (allocation)', ty: 'tache', by: ['referent'], src: 'P mémento 11', due: ['fin', 5, true] },
    { id: 'appreciation', ph: 7, t: 'Appréciation du tuteur saisie dans Pronote', ty: 'tache', by: ['referent'], ou: 'Pronote › suivi du stage', src: 'C', due: ['fin', 12, true] },
    { id: 'evaluation_pro', ph: 7, t: 'Compte rendu remis au professeur de spécialité', ty: 'tache', by: ['referent'], src: 'C', due: ['fin', 12, true] },
    { id: 'student_eval', ph: 7, t: 'Évaluation du stage par l’élève', te: 'J’ai fait le bilan de mon stage (carnet)', ty: 'declare', verif: true, flag: 'Arrivée', src: 'P mémento 10', due: ['fin', 12, true] },
    { id: 'ah_bilan', ph: 7, t: 'Bilan de l’accompagnement : renforcer, maintenir, réduire', ty: 'tache', by: ['pp'], local: true, opt: true, ah: true, src: 'Protocole AH étape 3', due: ['fin', 12, true] }
  ];
  /* Étapes retirées : plus affichées, mais encore reconnues pour que les fiches déjà en ligne restent valides. */
  const RETIREES = [
    { id: 'pre_visa', ph: 3, t: 'Pré-convention visée par le professeur de spécialité', ty: 'declare', retiree: true }
  ];
  const PAR_ID = Object.fromEntries(ETAPES.concat(RETIREES).map(e => [e.id, e]));
  const EN_LIGNE = ETAPES.filter(e => !e.local);

  /* ── Dates ─────────────────────────────────────────────────────────────── */
  const RE_DATE = /^\d{4}-\d{2}-\d{2}$/;
  function jour(s) { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d); }
  function iso(t) { return new Date(t).toISOString().slice(0, 10); }
  function plus(s, n) { return iso(jour(s) + n * 864e5); }
  function ecartJours(a, b) { return Math.round((jour(b) - jour(a)) / 864e5); }

  /* Dernier jour de cours avant le départ : un jour de semaine, hors vacances
     (du premier jour inclus au jour de rentrée exclu) et hors jours fériés. */
  function dernierJourDeCours(debut, vacances, feries) {
    const fer = new Set((feries || []).map(f => f.d || f));
    const enVacances = s => (vacances || []).some(v => v.d === v.f ? s === v.d : (s >= v.d && s < v.f));
    let s = plus(debut, -1);
    for (let i = 0; i < 60; i++, s = plus(s, -1)) {
      const w = new Date(jour(s)).getUTCDay();
      if (w === 0 || w === 6 || fer.has(s) || enVacances(s)) continue;
      return s;
    }
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
    return { date: plus(d, n || 0), proposee: !!prop };
  }

  /* ── États et droits ───────────────────────────────────────────────────── */
  const FINI = new Set(['valide', 'fait']);
  function entree(suivi, id) { return (suivi && suivi.etapes && suivi.etapes[id]) || { e: '' }; }
  function estFaite(suivi, id) { return FINI.has(entree(suivi, id).e); }
  const adulte = r => r === 'referent' || r === 'pp';

  /* Ce que tel rôle peut faire sur telle étape, dans l'état où elle est. */
  function actions(etape, en, role) {
    const e = (en && en.e) || '';
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
    eleve: { declarer: 'C’est fait', remettre: 'Je l’ai remis', recevoir: 'Je l’ai reçu', annuler: 'Annuler' },
    adulte: { faire: 'Fait', valider: 'Conforme', corriger: 'À corriger', remettre: 'Remis', recevoir: 'Reçu', annuler: 'Annuler', declarer: 'Fait' }
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

  const API = { VERSION, COL_SUIVI, COL_REFERENTS, ROLES, PHASES, ETAPES, PAR_ID, EN_LIGNE,
    plus, ecartJours, dernierJourDeCours, echeance, entree, estFaite, actions, libelleAction, appliquer,
    aVerifier, aFaire, avancement, drapeaux, phaseCourante, enRetard,
    anneeScolaire, filiereDe, suiviId, referentId, nouveauCodeReferent, sigleDe, nettoyerPiste, verifierSuivi, CHAMPS_SUIVI,
    depotModulaire, depotCompat, service };
  racine.PFMP_COMMUN = API;
})(typeof globalThis !== 'undefined' ? globalThis : window);
