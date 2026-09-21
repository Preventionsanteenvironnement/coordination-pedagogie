# Ce que je traite en CAPa — comparer nos cours

**Une seule page** : `capa/index.html`.

Le collègue y lit ce que Brahim traite, coche pour lui-même, et voit au même endroit
ce que les autres ont répondu. Il n'y a pas de page de synthèse séparée.

Aucun code d'accès, et rien d'autre à saisir : **le prénom** et **la filière** —
Jardinier paysagiste ou Horticulture. Puis on coche. Tout s'enregistre au fur et à
mesure ; on peut revenir modifier, et les flèches du navigateur fonctionnent partout.
Aucun nom d'élève n'apparaît nulle part.

## À quoi ça sert

Plusieurs collègues donnent les mêmes cours en CAPa. Plutôt que de comparer de mémoire,
chacun parcourt la même liste — celle des cours réellement construits — et dit ce qu'il
traite. Trois réponses :

| Réponse | Ce qu'elle dit |
|---|---|
| **Je le traite** | même contenu que moi : c'est là que sont les doublons |
| **Je ne le traite pas** | il ne le voit pas du tout |
| **Une autre discipline le traite** | chez lui, ce contenu revient à un collègue d'une autre matière (biologie, maths, ESC…) |

Chaque séance affiche alors son verdict : *Tous la traitent* (celles dont il faut parler),
*2 sur 3 la traitent*, ou *Personne d'autre*. Ce verdict ne compte que les **Je le traite** :
une séance renvoyée à une autre discipline n'est pas traitée par le collègue lui-même.

« Une autre discipline le traite » ne rentre pas dans ce classement — une séance peut être
traitée par tous *et* signalée comme relevant d'une autre matière ailleurs. C'est donc un
filtre à part, **Autre discipline**, dans le bandeau du haut.

Le champ de précision, sous chaque séance, sert surtout à dire **quelle** discipline.

### Les deux filières

Les séances sont les mêmes pour JP et pour l'horticulture : la filière sert seulement à
savoir d'où vient la réponse. Le bandeau **Comparer avec** permet de n'afficher que les
réponses d'une filière — les verdicts se recalculent alors sur elle seule.

### Chacun voit les réponses des autres

C'est voulu : la page est unique. En contrepartie, un collègue peut s'aligner sur ce qui
est déjà répondu au lieu de répondre pour lui-même. Si ce devenait un problème, il faudrait
masquer le bloc « Les autres collègues » tant que la séance n'a pas reçu sa propre réponse.

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
réponses de cette séance deviennent orphelines et disparaissent de l'affichage.

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
                 nom, filiere:'jp'|'hort', termine, maj,
                 reponses: { 'SESG_revenus/1': { r:'oui'|'non'|'autre', c:'…' } } }
```

`r` vaut `oui` (je le traite), `non` (je ne le traite pas) ou `autre` (une autre discipline
le traite). `c` est la précision libre.

`<id>` est tiré au hasard dans le navigateur du collègue et conservé sur son appareil :
c'est ce qui lui permet de fermer la page et de revenir compléter sa réponse.

### Règle à publier

Tant que cette règle n'est pas publiée dans la console Firebase, **rien ne s'enregistre et
personne ne voit les réponses des autres** : la page le dit et propose de télécharger la
réponse.

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

Le fichier complet, prêt à coller dans la console Firebase, a été déposé le 21/09 dans
`~/Documents/regles-firestore-2026-09-21.rules`.

## Ce que la page fait quand le serveur ne répond pas

Le collègue peut répondre quand même : tout est gardé dans son navigateur. La barre du bas
affiche alors « Réponses gardées sur cet appareil », et l'écran de fin propose
**Télécharger ma réponse** — un fichier JSON à envoyer par courriel.

## Supprimer une réponse

Pour retirer une réponse fantaisiste, ouvrir :

```text
index.html?gestion=1
```

Un lien « supprimer » apparaît alors derrière chaque nom, dans le bloc « Ont répondu ».
L'adresse n'est écrite nulle part sur le site : ce n'est pas une protection, c'est une
précaution contre le clic malheureux.

## Ce qu'il faut savoir

- ⚠ Sans code d'accès, toute personne qui a l'adresse peut répondre et voir les réponses
  des autres. Le contenu est sans enjeu — des cases sur des cours — mais une réponse
  fantaisiste reste possible : elle se supprime par `?gestion=1`.
- La page est en `noindex` : elle ne remonte pas dans les moteurs de recherche.
- Pas de mode sombre, comme le reste du portail.
- Le bouton **Imprimer la liste** ouvre toutes les notions et sort la liste complète avec
  des cases vides, pour une réunion ou un collègue qui préfère le papier.
