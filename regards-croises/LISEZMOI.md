# Regards croisés — conseils de classe et de mi-semestre

Page pour les collègues d'une classe : en deux minutes, ils partagent ce qu'ils observent
(vie de classe, besoins de chaque élève, ce qui aide, mesure à proposer, signal de décrochage),
pour que le professeur principal présente au conseil un regard collectif.

Les choix suivent le *Protocole des conseils de mi-semestre* de la cité scolaire (2026) :
point sur la vie de classe ; besoins de chaque élève et mesures d'accompagnement ;
prévention du décrochage. **Les résultats scolaires ne sont pas demandés.**

## Le lien

La page ne s'ouvre que par le lien envoyé par le professeur principal :

```
https://preventionsanteenvironnement.github.io/coordination-pedagogie/regards-croises/#d=<base64url(JSON)>
```

Le JSON contient la classe, la date du conseil, la date limite (`fin`), le PP et la liste
`[code de suivi, prénom + initiale, dispositifs connus]`. **Tout est après le `#`** :
le navigateur n'envoie jamais cette partie au serveur. Les prénoms s'affichent sur l'appareil
du collègue et ne sont ni envoyés ni enregistrés.

Le lien se fabrique sur l'ordinateur du PP, à partir de la table locale des codes de suivi
de l'Atelier (`Observation & besoins/codes-suivi.json`). Jamais à la main.

## Firestore

Collection dédiée : **`coordination_regards_croises`** (projet `coordination-pedagogie`).
Un document par conseil + élève (ou `VIE`) + appareil du collègue :

```js
{ id:"rc_B2GATL2-2026-11-20_6T2EJ_k3j9x2m1qa", source:"regards-croises",
  type:"eleve" | "vie", annee:"2026-2027", conseil:"B2GATL2-2026-11-20", classe:"B2GATL2",
  code:"6T2EJ" | "",                  // code de suivi, jamais un nom
  auteur:"k3j9x2m1qa",                // identifiant aléatoire de l'appareil
  matiere:"PSE", rien:false,
  choix:{ appuis:[…], besoins:[…], aide:[…], mesures:[…], alerte:[…], plus:[…] },
  climat:{ climat_travail:"bien"|"correct"|"a_travailler", cohesion, respect, participation },
  pistes:[…], commentaire:"…", creeLe:"<ISO>", majLe:"<ISO>" }
```

Garde-fou : un texte libre (commentaire, « Autre ») qui contient un prénom ou un nom de la
classe est refusé avant l'envoi. Un collègue qui revient sur la page retrouve ses réponses
(brouillon local) et les corrige : même identifiant, rien ne s'ajoute en double.

Règles publiées le 14/11/2026 :

```
match /coordination_regards_croises/{docId} {
  allow read: if true;
  allow create, update: if docId.matches('rc_[A-Z0-9]{2,12}-[0-9]{4}-[0-9]{2}-[0-9]{2}_([A-Z0-9]{4,6}|VIE)_[a-z0-9]{8,16}')
                        && request.resource.data.id == docId
                        && request.resource.data.source == 'regards-croises'
                        && request.resource.data.type in ['eleve','vie']
                        && … (tailles et types de chaque champ)
                        && (resource == null || resource.data.auteur == request.resource.data.auteur)
                        && request.resource.data.keys().hasOnly([...]);
  allow delete: if false;
}
```

## Côté Atelier PSE

L'espace Professeur principal lit cette collection par conseil, remet les noms en local
(table des codes de suivi), regroupe par élève et prépare la synthèse du conseil.

## RGPD

Aucun nom en ligne : l'élève est un code de suivi, le collègue un identifiant aléatoire et sa
matière. Le code de suivi n'est pas le code de connexion mapse.fr. La page est en `noindex`.
Pour tester : `window.__FIRESTORE_SHIM__` (faux Firestore) et une classe fictive, jamais les
vraies données.
