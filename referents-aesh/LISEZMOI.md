# Référents de pôle AESH

Espace en ligne des référents AESH des quatre pôles du lycée : PSR · MELEC, AGOrA, CAPa, Métiers d’Art.
Tuile « Référents de pôle » dans l’Espace AESH du portail.

## Parcours
Humeur et pensée du jour → code du pôle (4 chiffres) → Accueil · Mes AESH · Emploi du temps · Vue d’ensemble · Besoins · Messages · Exporter.
Les flèches Précédent / Suivant du navigateur fonctionnent partout ; chaque validation passe par « Vous confirmez ? ».

## Fichiers
| Fichier | Rôle |
|---|---|
| `index.html` | Page, styles, chargement de Firebase |
| `app.js` | Écrans et actions |
| `calculs.js` | Semaines A/B, vacances, PFMP, heures, conflits, disponibilités (sans affichage) |
| `donnees.js` | Pôles, filières, codes de départ, équipes de départ (sigles), pensées |
| `exports.js`, `fichiers.js` | PDF et Excel (.xlsx) fabriqués dans le navigateur, sans bibliothèque ; sauvegarde JSON |
| `edt-lycee.json` | Emplois du temps des 19 classes (captures PRONOTE du 16/09/2026, vérifiées case par case), sans nom |

## Données (Firestore `coordination_referents_aesh`)
`pole_<ID>` (code) · `aesh_<id>` (sigle, contrat, heures par pôle, filières, services, réunion d’équipe) · `place_<id>` (AESH sur un cours, du… au…) ·
`abs_<id>` (absence, formation) · `reunion_<date>` (réunion institutionnelle) · `msg_<id>` (message) · `hist_<id>` (copie figée de chaque écriture).
Aucun prénom en ligne. Rien ne se supprime : un retrait est un statut ou une date de fin.
Les besoins sont lus dans `coordination_estimation_aesh` (page `demandes-aesh/?filiere=…`).

## Si PRONOTE change
Remplacer les captures, refaire `edt-lycee.json` (chantier `work/referents-aesh-v1/edt/`), garder les identifiants des cours existants.

## Contrat, présence élève, filières (17/09/2026)
- **Contrat** : le total d’heures dues par semaine, réunion et services compris. **Présence élève** : ce qui reste
  pour les cours (contrat − services − 1 h de réunion) ; elle se calcule, on ne la saisit jamais.
  Chaque mot a une pastille **?** qui l’explique en une phrase.
- **« Intervient en »** (champ `filieres` de la fiche) : les 7 filières du lycée — PSR, MELEC, AGOrA, Jardinier
  paysagiste, Horticulture, Cannage-paillage, Vannerie — rangées par pôle. Une filière cochée vaut tous ses
  niveaux ; on déplie pour n’en garder que certaines classes (`filieres.MELEC.classes = ['B1MELEC','BTMELEC']`,
  `null` = tous les niveaux). Le pôle du référent est coché par défaut. `rattachement` est l’équipe qui gère l’AESH.
- Le **volume d’heures reste par pôle** (`heures`), comme avant : la page Besoins, les exports et l’Atelier le lisent.
- Une fiche d’avant ce jour est lue comme « toutes les filières de ses pôles » : rien n’est deviné.

## Placer un AESH : rien n’est interdit
On peut toujours choisir un AESH, même pris ailleurs, en réunion, au bout de ses heures ou pas prévu pour la classe.
Tout ce qui coince est réuni dans « Vous confirmez ? » : dépassement du contrat, heures du pôle atteintes, jour non
travaillé, classe pas prévue (elle sera ajoutée à sa fiche), déjà pris à cette heure — avec la case
« Le retirer de l’autre cours » qui le déplace pour la période, puis le rend à son cours habituel.
