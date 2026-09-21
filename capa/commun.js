/* ═══════════════════════════════════════════════════════════════════
   Ce que je traite en CAPa — le calcul commun
   ---------------------------------------------------------------
   Partagé par prof.html (réservé) et programme.html (public).

   LA RÈGLE, une seule :
   dès qu'un collègue de la filière coche « je le traite », la séance
   lui revient et sort de mon programme. Tout le reste me revient —
   « je ne le traite pas » et les séances laissées sans réponse.

   Le calcul est fait FILIÈRE PAR FILIÈRE : une séance couverte en
   jardinier paysagiste ne l'est pas forcément en horticulture, et les
   élèves d'horticulture ne doivent pas la perdre pour autant.
   ═══════════════════════════════════════════════════════════════════ */

const firebaseConfig = {
  apiKey:"AIzaSyAWdCMvOiAJln3eT9LIAQD3RWJUD0lQcLI", authDomain:"devoirs-pse.firebaseapp.com",
  projectId:"devoirs-pse", storageBucket:"devoirs-pse.firebasestorage.app",
  messagingSenderId:"614730413904", appId:"1:614730413904:web:a5dd478af5de30f6bede55"
};
export const COL = 'coordination_capa_cours';
export const DELAI_MS = 15000;

export const FILIERES = {
  jp:   { sigle:'JP',   nom:'Jardinier paysagiste' },
  hort: { sigle:'Hort', nom:'Horticulture' },
};
export const nomFiliere = f => (FILIERES[f] && FILIERES[f].nom) || '';

/* Pourquoi une séance sort de mon programme. */
export const MOTIFS = {
  amoi:      { texte:'Je la traite',            cls:'m-amoi' },
  aeux:      { texte:'Traitée par un collègue', cls:'m-aeux' },
};

export const esc = v => String(v ?? '').replace(/[&<>"']/g,
  c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function avecDelai(promesse, ms = DELAI_MS){
  let t;
  return Promise.race([
    promesse,
    new Promise((_, rej) => { t = setTimeout(() => { const e = new Error('Délai dépassé.'); e.code = 'delai'; rej(e); }, ms); })
  ]).finally(() => clearTimeout(t));
}
export const estRefus = e => `${(e && e.code) || ''} ${(e && e.message) || ''}`.includes('permission');

export function dateCourte(iso){
  const d = new Date(iso || '');
  return isNaN(d) ? '' : d.toLocaleDateString('fr-FR', { day:'numeric', month:'long' });
}

/* ─── lecture ─────────────────────────────────────────────────────── */

export async function lireTout(nomApp){
  const donnees = await (await fetch('donnees-capa.json', { cache:'no-cache' })).json();
  let FS = null, db = null, gens = [], erreur = null;
  try {
    FS = window.__FIRESTORE_SHIM__ || await import('https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js');
    let app = null;
    if (!window.__FIRESTORE_SHIM__){
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js');
      app = initializeApp(firebaseConfig, nomApp);
    }
    db = FS.getFirestore(app);
    const snap = await avecDelai(FS.getDocs(FS.query(FS.collection(db, COL), FS.where('type', '==', 'reponse'))));
    snap.forEach(doc => { const v = doc.data(); if (v && v.nom) gens.push({ ...v, id: doc.id }); });
    gens.sort((a, b) => String(a.nom).localeCompare(String(b.nom), 'fr'));
  } catch(e){
    erreur = estRefus(e) ? 'regles' : 'reseau';
  }
  return { donnees, gens, erreur, FS, db };
}

/* ─── le calcul ───────────────────────────────────────────────────── */

const cle = (cours, seance) => `${cours.code}/${seance.num}`;

/* Le programme d'une filière : pour chaque cours, les séances qui me restent. */
export function programmeFiliere(donnees, gens, filiere){
  const dedans = gens.filter(g => g.filiere === filiere);
  const modules = donnees.modules.map(m => {
    const cours = m.cours.map(c => {
      const seances = c.seances.map(s => {
        const preneurs = dedans.filter(g => g.reponses && g.reponses[cle(c, s)] && g.reponses[cle(c, s)].r === 'oui');
        return { ...s, amoi: preneurs.length === 0, preneurs };
      });
      const gardees = seances.filter(s => s.amoi);
      return { ...c, seances, gardees, nbGardees: gardees.length };
    }).filter(c => c.seances.length);
    return {
      ...m, cours,
      nbGardees: cours.reduce((n, c) => n + c.nbGardees, 0),
      nbTotal:   cours.reduce((n, c) => n + c.seances.length, 0),
    };
  });
  return {
    filiere,
    nom: nomFiliere(filiere),
    repondants: dedans,
    modules,
    nbGardees: modules.reduce((n, m) => n + m.nbGardees, 0),
    nbTotal:   modules.reduce((n, m) => n + m.nbTotal, 0),
  };
}

export const programmes = (donnees, gens) =>
  Object.keys(FILIERES).map(f => programmeFiliere(donnees, gens, f));

/* ─── le courriel ─────────────────────────────────────────────────── */

export function texteMail(progs, lien){
  const L = [];
  const total = progs.reduce((n, p) => n + p.repondants.length, 0);
  L.push('Bonjour,');
  L.push('');
  L.push(total
    ? 'Merci d’avoir pris le temps de répondre. Vos réponses m’ont permis de faire le tri dans mon programme.'
    : 'Voici ce que je traiterai avec les élèves.');
  L.push('');
  progs.forEach(p => {
    const pris = p.nbTotal - p.nbGardees;
    L.push(`${p.nom.toUpperCase()} — ${p.nbGardees} séances sur ${p.nbTotal}`);
    p.modules.filter(m => m.nbGardees).forEach(m => L.push(`  ${m.nom} : ${m.nbGardees} séances`));
    if (pris) L.push(`  (${pris} séances vous reviennent, je ne les traiterai pas.)`);
    L.push('');
  });
  L.push('Le détail, séance par séance :');
  L.push(lien);
  L.push('');
  L.push('Si quelque chose ne correspond pas à ce que vous faites, dites-le moi.');
  L.push('');
  L.push('Bien cordialement,');
  return L.join('\n');
}
