# Suivre mes élèves en PFMP

Espace de l'enseignant référent (portail › PFMP › « Suivre mes élèves en PFMP »).
Créé le 6 octobre 2026.

## Les trois portes d'un même suivi

| Qui | Où | Accès |
|---|---|---|
| Élève | mapse.fr › Mon espace › carnet PFMP › **Mon stage PFMP** (`PSE/pfmp-agora/mon-stage.js`) | son code mapse |
| Enseignant référent | ce dossier (`suivi-pfmp/`) | code à 6 chiffres |
| Professeur principal | Atelier PSE › Professeur principal › PFMP (`EDITEUR/pfmp.js`, `pfmp-en-ligne.js`) | bouton « Synchroniser avec le portail » |

Le tuteur n'a aucun accès. Il reçoit seulement le lien de l'outil « Visite de stage » (`rdv-pfmp`) pour choisir un créneau.

## Le socle commun

`pfmp-commun.js` contient la liste des étapes, les droits de chacun, les échéances et l'accès à Firestore.
Il existe en **trois copies identiques** : ici (l'original), `PSE/pfmp-agora/` et l'Atelier `EDITEUR/`.
On le modifie ici, puis on recopie le fichier dans les deux autres dépôts. `tests/commun.test.mjs` vérifie que les copies sont identiques.

## Données (projet Firestore « coordination-pedagogie »)

- `coordination_pfmp_suivi/{année}_{code}_p{n}` : une fiche par élève et par période. Elle contient les étapes (état, auteur, date, motif), les pistes, le type de structure trouvé et la visite.
  - `…/messages` : le fil élève · référent · PP.
  - `…/journal` : une ligne par geste.
- `coordination_pfmp_referents/{année}_{code6}` : la liste des fiches suivies par un référent.
- Le rendez-vous de visite reste dans `coordination_rdv`. La fiche garde son numéro (`visite.rdv`), et la page du référent reporte la date confirmée pour que l'élève la voie.

Ce qui ne part jamais en ligne : aucun nom, aucune entreprise nommée, aucun lieu, aucune étape « aide humaine ». Les étapes marquées `local` restent dans l'Atelier.

Règles : `~/Documents/REGLES_coordination-pedagogie_2026-10-06.rules`. Une fiche se lit avec `get` seulement, aucune liste n'est possible. Rien ne se supprime. Chaque écriture augmente la version de 1.

## Tests

```bash
node tests/commun.test.mjs
```

`tests/banc.html` ouvre la page sur une base en mémoire avec des codes fictifs. Il faut la servir en http, car elle utilise des modules.
