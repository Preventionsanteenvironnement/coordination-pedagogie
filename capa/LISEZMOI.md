# Ce que je traite en CAPa — comparer nos cours

Des collègues enseignent les mêmes contenus que moi en CAPa. Plutôt que d'en discuter
de mémoire, ils parcourent la liste exacte de mes séances et disent ce qu'ils traitent.
**Ce sont eux qui décident** : ils passent beaucoup plus d'heures avec ces élèves.
À la fin, je sais ce qu'il me reste à faire.

## Trois pages

| Page | Pour qui | Ce qu'elle fait |
|---|---|---|
| `index.html` | les collègues | trois bandeaux à répondre, puis **J'ai terminé** |
| `prof.html` | moi seul | ce qu'il me reste à faire, et le bouton qui prépare le courriel |
| `programme.html` | les collègues, par le lien du courriel | mon programme final, en clair |

`index.html` porte en bas de son accueil un cadre **Réservé au professeur de PSE** qui
mène à `prof.html`. `programme.html` n'est listée nulle part : on y arrive par le lien
que porte le courriel.

Le calcul commun est dans `commun.js`, le style des deux dernières pages dans `capa.css`.

## Comment on répond, et pourquoi c'est rapide

Trois bandeaux, un par module, chacun de sa couleur. Sous le bandeau : l'aperçu des thèmes
qu'il contient, puis trois boutons.

- **Je traite** → les séances du bloc passent toutes à « oui », le bloc se referme.
- **Je ne traite pas** → toutes à « non », le bloc se referme.
- **Je veux voir** → le bloc s'ouvre et l'on coche séance par séance.

Un module entier se règle donc d'un clic quand il ne concerne pas le collègue : c'est ce
qui évite de cocher soixante fois. Un second clic sur le même bouton retire la réponse.

**Rien n'est coché par défaut.** L'état du bloc (tout / rien / en détail) n'est pas
enregistré : il se **déduit** des séances, ce qui évite d'ajouter un champ au document et
de toucher à la règle Firestore.

Deux réponses seulement : **je le traite**, **je ne le traite pas**. La troisième
(« une autre discipline le traite ») a été retirée le 21/09 : elle compliquait sans servir.

## La règle

**Dès qu'un collègue coche « je le traite », la séance lui revient et sort de mon
programme.** Tout le reste me revient : « je ne le traite pas », et les séances laissées
sans réponse.

Le calcul est fait **filière par filière** : une séance couverte en jardinier paysagiste
ne l'est pas en horticulture, et les élèves d'horticulture ne doivent pas la perdre pour
autant. `prof.html` et `programme.html` affichent donc deux programmes distincts.

## Ce que le courriel contient

Le bouton de `prof.html` ouvre le logiciel de messagerie avec un message d'environ
800 caractères : le remerciement, puis pour chaque filière le nombre de séances qui me
restent, le détail par module, le nombre de séances qui leur reviennent — et le lien vers
`programme.html`. `mailto:` ne transporte que du texte brut : ni gras, ni couleurs.

## Le contenu vient de la bibliothèque

La liste n'est pas écrite à la main. Elle est fabriquée depuis la bibliothèque CAPa de
l'Atelier de cours :

```text
~/Documents/Éditeur PSE/Bibliothèques/capa_bibliotheque.json
```

Pour la mettre à jour après avoir modifié un cours :

```bash
python3 capa/generer-donnees.py
```

Le script réécrit `capa/donnees-capa.json` et affiche le décompte
(aujourd'hui : **24 cours · 60 séances · 267 notions**). Il ne touche jamais la
bibliothèque, qu'il lit seulement.

**Ce qui est volontairement écarté**, en tête du script :

- `EXCLUS` — le module **MP1 (CCF6)** en entier : un dossier construit à partir d'un emploi
  observé ne se compare pas séance par séance ;
- `COURS_EXCLUS` — le cours **BIO_synthese_oral** (préparation de l'oral du CCF4), pour la
  même raison.

**Ne jamais retoucher `donnees-capa.json` à la main** : la prochaine régénération
effacerait la correction. C'est le cours, dans l'Atelier, qu'il faut corriger.

Les réponses sont rangées sous la clé `code_du_cours/numéro_de_séance`. Elles survivent à
une régénération tant que le code du cours et le numéro de la séance ne changent pas.

### Où se rangent les notions

Un cours porte ses notions par blocs. Quand il y a autant de blocs que de séances, chaque
séance affiche les siennes. Quand il y en a moins — les notions couvrent alors plusieurs
séances — elles remontent au niveau du cours.

## Firestore

Collection : **`coordination_capa_cours`**, projet `devoirs-pse`.

```text
reponse_<id>   { type:'reponse', source:'capa-cours', annee:'2026-2027',
                 nom, filiere:'jp'|'hort', termine, maj,
                 reponses: { 'SESG_revenus/1': { r:'oui'|'non'|'autre', c:'…' } } }
```

`r` vaut `oui` (je le traite) ou `non` (je ne le traite pas). Seul `oui` retire la séance de
mon programme. La règle Firestore ne contrôle pas cette valeur : une ancienne réponse
portant `autre` serait lue comme « ni oui », donc comme si la séance me revenait.

`<id>` est tiré au hasard dans le navigateur du collègue et conservé sur son appareil :
c'est ce qui lui permet de fermer la page et de revenir modifier sa réponse.

### Règle à publier

Tant que cette règle n'est pas publiée dans la console Firebase, **rien ne s'enregistre**,
et `prof.html` affiche mon programme entier comme si personne n'avait répondu.

```text
match /coordination_capa_cours/{docId} {
  allow read: if true;

  allow create, update: if docId.matches('reponse_[A-Za-z0-9]+')
                        && request.resource.data.id == docId
                        && request.resource.data.type == 'reponse'
                        && request.resource.data.annee is string
                        && request.resource.data.nom is string
                        && request.resource.data.nom.size() > 0
                        && request.resource.data.nom.size() <= 60
                        && request.resource.data.filiere in ['jp','hort']
                        && request.resource.data.reponses is map
                        && request.resource.data.reponses.size() <= 200
                        && request.resource.data.keys().hasOnly(['id','type','source','annee','nom','filiere',
                             'reponses','termine','maj']);

  allow delete: if true;
}
```

Le fichier complet, prêt à coller, a été déposé le 21/09 dans
`~/Documents/regles-firestore-2026-09-21.rules`.

## Ce qu'il faut savoir

- ⚠ **Le numéro de version des fichiers liés.** `prof.html` et `programme.html` chargent
  `capa.css?v=N` et `commun.js?v=N`. Modifier l'un sans changer son numéro ne change rien
  dans les navigateurs : ils servent l'ancien. C'est arrivé deux fois pendant la
  construction.
- ⚠ Sans code d'accès, toute personne qui a l'adresse peut répondre. Une réponse
  fantaisiste se supprime depuis **`prof.html?gestion=1`** : un lien « supprimer » apparaît
  alors derrière chaque nom, dans « Ont répondu ».
- Les pages sont en `noindex`, en clair, sans mode sombre.
- Aucun nom d'élève nulle part. Les collègues donnent leur prénom et leur filière, rien
  d'autre.
