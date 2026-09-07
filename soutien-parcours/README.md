# Soutien au parcours — 2de GATL · v3

Dossier à déposer tel quel dans le repo GitHub Pages (ex. `coordination-pedagogie/sap/`).

```
index.html        Calendrier des mercredis (page d'accueil) + fenêtre de programmation
bibliotheque.html Toutes les activités, recherche, « Ajouter au calendrier », « Créer une activité »
reperes.html      SAP en clair, textes officiels, CPS et compétences à s'orienter avec définitions
data.js           Données : mercredis, catégories, référentiels, bibliothèque, trame de départ
app.js            Persistance (Firebase ou local) — c'est ICI qu'on colle la config Firebase
style.css
ressources/       38 PDF (fiches ScholaVie, activités Santé publique France, éduscol, arrêtés, progression de la collègue)
```

## Brancher Firebase
1. `app.js`, bloc `firebaseConfig` : colle la config de ton projet.
2. Règles Firestore : `match /sap_gatl/{doc} { allow read, write: if true; }`
3. C'est tout. Un seul document `sap_gatl/2026-P1` ; synchro temps réel entre vous deux.

Tant que `apiKey` commence par `COLLE`, tout tourne en local (localStorage) pour tester.

## Comment ça marche
- Calendrier : chaque mercredi affiche GATL1 et GATL2 (ou une carte « Les deux groupes »). Une carte = un lieu, un statut, et un ou plusieurs blocs empilés (thème coloré · titre · objectif).
- Clic sur une carte → fiche synthèse : lieu, statut (à venir / fait / à poursuivre / à revoir), blocs avec Modifier / Retirer, « + Ajouter un thème ».
- Ajouter / Modifier → un bloc à la fois : thème (14 tuiles, « Autre » = on écrit le thème) → sur quoi on travaille (menu déroulant + « Autre — je l'écris ») → objectif et activité préremplis mais modifiables → fiches PDF de la bibliothèque pour ce sujet → ressources (liens) → note.
- Passer de « Les deux groupes » à un seul groupe : le contenu suit le groupe choisi, l'autre redevient vide.
- Le calendrier démarre vierge. La progression de la collègue est dans la bibliothèque (section du haut), chaque ligne s'ajoute sur le mercredi choisi.
- Bibliothèque : 13 thèmes, ~115 sujets avec objectif / activité proposés, fiches PDF rattachées, « Ajouter au calendrier ».
