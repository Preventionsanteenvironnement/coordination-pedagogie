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

## Contrat, présence élève, réunion, filières (17/09/2026)
- Trois nombres **saisis à la main**, jamais déduits : **Contrat** (total dû par semaine),
  **Présence élève** (heures en classe) et **Réunion** (heures par semaine, 1 h par défaut, libre),
  avec le jour et l’heure de la réunion juste en dessous.
  Chaque mot a une pastille **?** qui l’explique en une phrase.
- Si **présence élève + réunion + services ≠ contrat**, la fiche le **signale** — elle ne corrige rien toute seule.
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


## Travaux locaux du 23 septembre 2026 — NON PUBLIÉS

Le planning distingue maintenant `place.semaines` (A/B/AB) de `cours.sem`.
Les anciens documents restent lus. Les modifications/retraits bornés scindent les
placements : passé, suite et autre parité sont conservés. Les renforts possèdent
`renfortPfmp`, limité aux créneaux réellement libérés par la classe source.
`enregistrement.js` vérifie les versions lues et sérialise les nouveaux placements
via `aesh.revisionPlanning`, dans la même transaction que l'historique.

La vue `../planning-equipe/` réutilise la même application. Décision finale de Brahim :
un code classique à quatre chiffres, comme les référents, sans compte Firebase Auth,
serveur de codes, e-mail ni changement de forfait. Les essais antérieurs de serveur
restent dans le dossier de travail hors site et ne sont pas utilisés.

Le réglage `pole_PSR_MELEC.accesPlanning = {actif, code}` est géré dans le menu
« Changer mon code », section « Accès Antoine ». Son absence désactive l'accès.
Le code Antoine doit être distinct des codes des pôles. Le rôle de cette interface
reste fixé : C1PSR/C2PSR modifiables, les trois classes MELEC consultables. Un changement
de code ou une désactivation invalide la session lors de la réception du document.
Il s'agit du même contrôle applicatif que les référents actuels, PAS d'une autorisation
serveur : les données et codes de pôle restent lisibles selon les règles existantes.
Ne pas annoncer une isolation sécurisée des droits PSR/MELEC.

### Livraison encore nécessaire
- Publier l'ajout optionnel `accesPlanning` aux règles du seul document de pôle PSR-MELEC.
  Fichier complet préparé dans outputs/FIRESTORE-COMPLET-CODE-SIMPLE.txt de la tâche.
- Publier le site après validation du lot ; le code Antoine sera choisi par Brahim
  dans son interface. Aucun vrai code créé pendant les tests.
- Finir et tester la réception Electron et sa copie locale de site avant installation.
- La protection de concurrence exige des clients à jour. Les ajouts d'absence/réunion
  par des clients qui ignorent ce protocole ne sont pas encore couverts.
- CCF et bacs blancs hors périmètre.

Tests : `node referents-aesh/tests/planning.test.mjs` (16 scénarios) et
`node referents-aesh/tests/acces-simple.test.mjs` ; données fictives uniquement.
Navigateur local : connexion quatre chiffres, PSR modifiable, MELEC consultable,
panneau de gestion depuis le référent et désactivation enregistrée en simulation.
Règles publiées précédemment confirmées par copie utilisateur identique (856 lignes).
Le nouvel ajout `accesPlanning` n'est pas encore publié.
