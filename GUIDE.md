# Guide — ajouter du contenu au portail

Tout se passe dans **un seul fichier : `data.js`**.
Vous ne touchez jamais au design ni aux autres fichiers.

Après chaque modification, dans **GitHub Desktop** :
**Commit** (valider) → **Push** (envoyer) → le site se met à jour en ligne en ~1 minute.

---

## 1. Ajouter un DOCUMENT (PDF, Word, lien…)

Un document = un objet avec un **`lien`**. Collez-le dans la liste `enfants` voulue :

```js
{
  titre: "Règlement PFMP 2026",
  desc:  "Version validée en conseil.",
  lien:  "fichiers/reglement-pfmp-2026.pdf",   // ou  https://...
  type:  "PDF",            // PDF | Word | Lien | Page | Vidéo | Image
  badge: "Nouveau",        // facultatif (petit badge dans le coin)
},
```

> Les fichiers PDF / Word se déposent dans le dossier **`fichiers/`** du dépôt.

---

## 2. Créer un DOSSIER (dans lequel on rentre)

Un dossier = un objet avec une liste **`enfants`** (au lieu d'un `lien`) :

```js
{
  titre: "PFMP — cadre réglementaire",
  desc:  "Tout ce qui concerne les périodes en entreprise.",
  enfants: [
    // ici, autant de documents OU de sous-dossiers que vous voulez
  ],
},
```

On peut imbriquer autant de niveaux que nécessaire :
**Thématique → Dossier → Sous-dossier → Document.**

---

## 3. Ajouter une THÉMATIQUE (carte de la page d'accueil)

Ajoutez un bloc dans le tableau `THEMATIQUES` :

```js
{
  id:      "vie-scolaire",                 // identifiant unique, sans espace
  nom:     "Vie scolaire",
  couleur: "#3b6ea5",                       // couleur de l'accent
  enfants: [],                              // vide = « À compléter »
},
```

---

## Rappel RGPD

⚠️ Cet espace est **public**.
Ne jamais publier : le **nom du lycée**, le **nom d'un élève**, ni toute donnée permettant de les identifier. Anonymisez les études de situation avant de les déposer.
