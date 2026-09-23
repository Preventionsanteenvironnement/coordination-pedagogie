/* Même accès simple à quatre chiffres que les référents.
   Vérification dans l'application, sans Firebase Authentication ni service payant.
   Ce code n'est pas une barrière de sécurité Firestore. */
export function verifierCodePlanning(code, documentPole) {
  const acces = documentPole?.accesPlanning;
  const codeValide = /^\d{4}$/.test(code || '');
  const referent = codeValide && documentPole?.code === code;
  if (!codeValide || (!referent && (acces?.actif !== true || acces.code !== code)))
    throw new Error('Code inconnu ou accès désactivé.');
  return {
    pole:'PSR_MELEC',
    lectureClasses:['C1PSR','C2PSR','B2MELEC','B1MELEC','BTMELEC'],
    ecritureClasses:['C1PSR','C2PSR'],
    // Chaque session reste liée au code qui l’a ouverte.
    sessionValide:doc => referent ? doc?.code === code
      : doc?.accesPlanning?.actif === true && doc.accesPlanning.code === code,
    deconnecter:async()=>{}
  };
}
export async function authentifierPlanning(code, FS, db) {
  if (!/^\d{4}$/.test(code || '')) throw new Error('Tapez les quatre chiffres du code.');
  if (!FS?.getDocFromServer) throw new Error('Connexion indisponible. Réessayez dans un instant.');
  const ref = FS.doc(db,'coordination_referents_aesh','pole_PSR_MELEC');
  let timer;
  try {
    const snap = await Promise.race([FS.getDocFromServer(ref),new Promise((_,rej)=>{
      timer=setTimeout(()=>rej(new Error('Pas de réponse. Vérifiez votre connexion.')),15000);
    })]);
    return verifierCodePlanning(code,snap.exists()?snap.data():null);
  } finally { clearTimeout(timer); }
}
