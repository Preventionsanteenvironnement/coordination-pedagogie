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
| `donnees.js` | Pôles, codes de départ, équipes de départ (sigles), pensées |
| `exports.js`, `fichiers.js` | PDF et Excel (.xlsx) fabriqués dans le navigateur, sans bibliothèque ; sauvegarde JSON |
| `edt-lycee.json` | Emplois du temps des 19 classes (captures PRONOTE du 16/09/2026, vérifiées case par case), sans nom |

## Données (Firestore `coordination_referents_aesh`)
`pole_<ID>` (code) · `aesh_<id>` (sigle, contrat, heures par pôle, services, réunion d’équipe) · `place_<id>` (AESH sur un cours, du… au…) ·
`abs_<id>` (absence, formation) · `reunion_<date>` (réunion institutionnelle) · `msg_<id>` (message) · `hist_<id>` (copie figée de chaque écriture).
Aucun prénom en ligne. Rien ne se supprime : un retrait est un statut ou une date de fin.
Les besoins sont lus dans `coordination_estimation_aesh` (page `demandes-aesh/?filiere=…`).

## Si PRONOTE change
Remplacer les captures, refaire `edt-lycee.json` (chantier `work/referents-aesh-v1/edt/`), garder les identifiants des cours existants.
