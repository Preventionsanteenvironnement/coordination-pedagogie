# Ce que je traite en CAPa — comparer nos cours

Deux pages, dans `capa/` :

| Page | Pour qui | Ce qu'elle fait |
|---|---|---|
| `index.html` | les collègues | la liste des séances à cocher : je le fais · je le fais autrement · je ne le fais pas |
| `synthese.html` | tout le monde | qui traite quoi, et où les cours se recoupent |

Aucun code d'accès : chacun donne son nom (un prénom suffit) et, s'il veut, son établissement.
Aucun nom d'élève n'apparaît nulle part.

## À quoi ça sert

Plusieurs collègues donnent les mêmes cours en CAPa. Plutôt que de comparer de mémoire,
chacun parcourt la même liste — celle des cours réellement construits — et dit ce qu'il
traite. La synthèse montre ensuite les séances traitées par tout le monde : ce sont
celles dont il faut parler.

La réponse la plus utile est **« je le fais autrement »** : le champ de précision qui
l'accompagne est ce qui permet de décider quoi garder.

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
(aujourd'hui : **31 cours · 70 séances · 322 notions**). Il ne touche jamais la
bibliothèque, qu'il lit seulement.

**Ne jamais retoucher `donnees-capa.json` à la main** : la prochaine régénération
effacerait la correction. C'est le cours, dans l'Atelier, qu'il faut corriger.

Les réponses déjà données sont rangées sous la clé `code_du_cours/numéro_de_séance`.
Elles survivent à une régénération tant que le code du cours et le numéro de la séance
ne changent pas. Si un cours change de code, ou si une séance est renumérotée, les
réponses de cette séance deviennent orphelines et disparaissent de la synthèse.

### Où se rangent les notions

Un cours porte ses notions par blocs. Quand il y a autant de blocs que de séances, chaque
séance affiche les siennes. Quand il y en a moins — les notions couvrent alors plusieurs
séances à la fois — elles remontent au niveau du cours, sous « Les notions de ce cours »,
plutôt que d'être rattachées à une séance au hasard.

## Firestore

Collection : **`coordination_capa_cours`**, projet `devoirs-pse` (le même que les autres
espaces `coordination_*`).

Un document par collègue :

```text
reponse_<id>   { type:'reponse', source:'capa-cours', annee:'2026-2027',
                 nom, etablissement, termine, maj,
                 reponses: { 'SESG_revenus/1': { r:'oui'|'autrement'|'non', c:'…' } } }
```

`<id>` est tiré au hasard dans le navigateur du collègue et conservé sur son appareil :
c'est ce qui lui permet de fermer la page et de revenir compléter sa réponse.

### Règle à publier

Tant que cette règle n'est pas publiée dans la console Firebase, **rien ne s'enregistre** :
la page le dit au collègue et lui propose de télécharger sa réponse.

```text
match /coordination_capa_cours/{docId} {
  allow read: if true;
  allow create, update: if docId.matches('reponse_[A-Za-z0-9]+')
                        && request.resource.data.type == 'reponse'
                        && request.resource.data.nom is string
                        && request.resource.data.nom.size() > 0
                        && request.resource.data.nom.size() < 80;
  allow delete: if true;
}
```

## Ce que la page fait quand le serveur ne répond pas

Le collègue peut répondre quand même : tout est gardé dans son navigateur. La barre du bas
affiche alors « Enregistré sur cet appareil seulement », et l'écran de fin propose
**Télécharger ma réponse** — un fichier JSON à envoyer par courriel.

## Supprimer une réponse

La synthèse est ouverte à tous, mais on n'y supprime rien. Pour retirer une réponse
fantaisiste, ouvrir :

```text
synthese.html?gestion=1
```

Un lien « supprimer » apparaît alors derrière chaque nom. L'adresse n'est écrite nulle part
sur le site : ce n'est pas une protection, c'est une précaution contre le clic malheureux.

## Ce qu'il faut savoir

- ⚠ Sans code d'accès, toute personne qui a l'adresse peut répondre, et voir les réponses
  des autres. Le contenu est sans enjeu — des cases sur des cours — mais une réponse
  fantaisiste reste possible : elle se supprime par `?gestion=1`.
- Les pages sont en `noindex` : elles ne remontent pas dans les moteurs de recherche.
- Pas de mode sombre, comme le reste du portail.
- Le bouton **Imprimer la liste** ouvre toutes les notions et sort la liste complète avec
  des cases vides, pour une réunion ou un collègue qui préfère le papier.
