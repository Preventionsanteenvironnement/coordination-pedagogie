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

Le code actuel du référent PSR-MELEC ouvre également l'interface Antoine, même
si son accès personnel est désactivé ou pas encore configuré. Il est relu dans
le document du pôle, jamais codé en dur. La session ouverte avec ce code expire
lorsque ce code change ; le code personnel Antoine reste indépendant. Cette
entrée conserve la présentation Antoine et ses restrictions applicatives PSR/MELEC.
Aucun ajout aux règles n'est nécessaire pour cette entrée supplémentaire.


## Présences, services et centralisation — 23 septembre 2026, lot local suivant

Ce lot remplace les descriptions antérieures du périmètre Antoine et du placement :
- PSR, AGOrA, CAPa et Métiers d’art modifiables par Antoine ; MELEC reste consultable.
  Boutons de pôle, mêmes documents que les référents, aucun duplicata de planning.
- Cours inchangé ; bandes de présence colorées par identifiant AESH, repères de 30 minutes.
  Chaque personne peut avoir un ou plusieurs passages, ou couvrir tout le cours.
- Début de période explicite, A/B/AB et fin par défaut à l’année (bornée par le contrat).
  Un retrait/remplacement conserve les fragments passés et les périodes hors sélection.
- Compteurs de la semaine et comparaison de semaines A/B datées. Un chevauchement est
  signalé mais ne double pas les minutes du total global. Les besoins ont un détail par tranche.
- DP — Demi-pension, Internat, DAFI et PIAL : ajout de créneaux avec jour, heures, A/B et dates.
  Champs optionnels dans services[] : horaires[] et calendrierDepuis. Le forfait antérieur
  n’est plus ajouté à partir de calendrierDepuis. Avant cette date il reste préservé.
  Le volume h dans la fiche reste une prévision contractuelle, distincte du réalisé planifié.
- Réunion PSR automatique 13–14 le lundi pour les quatre identifiants de l’équipe initiale.
  Réunion institutionnelle datée : remplace celle d’équipe la même semaine ; vacances,
  absences et fin de contrat prises en compte. Autres équipes : leur réunion renseignée.
- Placements, absences et réunions partagent la vérification transactionnelle des fiches.
  Un ancien client non actualisé ne participe pas à cette protection : recharger les appareils.
- Export Antoine : classes et AESH, deux semaines réelles A/B, couleurs, demi-heures,
  services jusqu’à 21 h. Classe : colonnes cours et présences séparées pour garder le cours entier.
  L’Excel est un export ; modifier le fichier sur ordinateur ne synchronise pas le site.
- Aucun import automatique des Excel personnels d’Antoine, aucune création de vrai code,
  aucune écriture de données en ligne effectués pendant ce lot.

Pas de nouvelle règle Firestore nécessaire pour ce lot : services est déjà une liste
admise et revisionPlanning était prévu dans les règles complètes précédentes.
Le déploiement effectif du site et de l’application installée reste distinct du code local.

Tests locaux : planning.test.mjs, presences.test.mjs, acces-simple.test.mjs ; navigateur
fictif (deux passages, compteur B=1h/A=0h, DP=0,5h, navigation métiers d’art) ; Excel
fictif relu et rendu ; passerelle testée sur des objets fictifs, jamais le store réel.


### 23/09/2026 — Besoins modifiables depuis les pastilles des référents
Chaque référent peut ouvrir une pastille de sa grille et saisir un nombre de 0 à 6,
y compris pour un cours non encore estimé. Antoine consulte le résultat. La fiche
est la même que dans demandes-aesh : même cadre normalisé, même clé, même document
coordination_estimation_aesh/cours_… ; aucun compteur parallèle. Une valeur zéro
est une réponse explicite. Le nombre change ; horaires, semaines et fin de période
existants sont conservés et affichés. Un cours absent/ambigu dans le cadre ne crée
pas de nouvelle fiche devinée. Les enseignants peuvent ensuite modifier la réponse.
Transactions des deux interfaces : une fiche changée depuis l’ouverture provoque
un avertissement, sans écraser la réponse concurrente. Historique du référent
atomique avec son écriture. Recharger les deux pages après publication pour que
les anciens clients utilisent aussi cette protection.
Pas de nouvelle règle nécessaire d’après le fichier complet fourni par Brahim :
champs cours et archives déjà autorisés. Pas de lecture de la console déployée,
pas de test sur les données réelles, pas d’écriture Firestore distante.
Tests : besoins (identité partagée, zéro, conflit, maintien des paramètres,
quatre pôles, cours commun), 17 scénarios planning, 11 présences, accès simple,
syntaxe et diff. Navigateur fictif : pastille vide → 2 → 0, réouverture détaillée,
aucune erreur console. Simulation locale, pas de validation réseau Firebase réelle.
Modifications : demandes-aesh/estimation.js et index.html ; referents-aesh/app.js,
index.html, nouveau besoins.js et tests/besoins.test.mjs ; LISEZMOI.md.
Miroir cockpit-site source actualisé par script officiel avec sauvegarde préalable.
L’app Electron installée reste inchangée. Pas de commit, push ou déploiement.


### 24/09/2026 — Planning multipage épuré (travail local)
Pages Planning / Équipe / Réglages pour référents et Antoine. Téléphone : un jour
à la fois, cinq boutons ; ordinateur : semaine entière. Équipe : sigle et total /
contrat, sans doublon A/B ni reste. Réglages séparés : période, PFMP, services, Excel.
Réunions et services datés inclus à leur horaire dans la grille (jusqu’à la fin du
dernier service, y compris internat 21 h), détails au toucher, source occupations
commune aux calculs. Besoins : matière/date, trois chiffres, détail horaire seulement
si couverture varie ; retrait des explications répétées. Nombre modifiable depuis
la pastille avec deuxième clic de confirmation ; bouton vers le placement guidé.
Aucune importation des affectations Excel, aucune modification des données réelles.
Tests : syntaxe/diff, 17 planning + 11 présences + besoins partagés. Navigateur
fictif 390×844 : navigation, besoin confirmé, accès placement, Équipe compacte,
DP 12h30–13h dans la grille et détails ; pas d’erreur console. Pas de test Firestore
réel. Pas de nouvelles règles. Source miroir Electron actualisée, application
installée inchangée. Aucun commit, push ni déploiement. .DS_Store conservé.


### 24/09/2026 — Semaine, filtre AESH, cercles et réunions communes
Demandes validées par Brahim, y compris MELEC lundi 13–14 (« pareil »).
Téléphone : cinq jours visibles par défaut, zoom navigateur conservé, bouton Jour,
rappel semaine collant. Roue seule accessible (aria-label Réglages), suppression
onglet Équipe. Filtre AESH : occupations de toutes ses classes, réunions et services,
total/contrat ; cours ouvrables selon droits existants, MELEC Antoine toujours lecture.
Cercles non interactifs : inconnu ?, zéro barré gris, vide rouge, partiel orange,
plein vert. Analyse aux bornes réelles des placements/absences (pas seulement 30 min).
Le cours ouvre une fenêtre épurée avec cercle + ratio, demande séparée du placement.
Modification de la demande par le référent avec confirmation, document enseignants
inchangé. Sigles seuls dans les bandes sur téléphone ; découpes conservées.
Services : DP, internat, DAFI, PIAL conservés ; Autre avec intitulé ajouté. Alertes
calculées avec le moteur partagé. Encart Réunions distinct avec page séparée.
Réunion d’équipe 13–14 lundi pour PSR et MELEC (affiliations des fiches et anciens
IDs PSR). Institutionnelle : lundi daté, durée 1 h, défaut 08h30–09h30, une par semaine,
prévisualisation conflits, transaction sur base d’ouverture et verrous AESH.
Elle remplace l’équipe cette semaine sans double comptage, annulation rétablit
l’équipe. Institutionnelle conserve sa portée existante établissement/tous AESH ;
création par référents, consultation Antoine, pas de droit nouveau silencieux.
Même application, mêmes documents Firestore référents/Antoine ; aucun fichier Excel
importé, aucune écriture réelle distante. Pas de nouvelles règles nécessaires.
Tests : 17 planning, 11 présences, besoins, accès simple, passerelle fictive,
nouveaux tests indicateurs/réunions (partiel 15 min, MELEC, remplacement, retour).
Navigateur fictif 390×844 : semaine/jour, filtre, clic cours filtré, placement,
besoin 0/2 avec cercle, institution 08h30 remplaçant 13h avec total 1 h ; zéro erreur
console. Syntaxe et diff vérifiés. Vérification Firebase réelle non effectuée.
Sources modifiées : app.js, calculs.js, index.html, LISEZMOI.md et nouveau test
indicateurs-reunions.test.mjs. Miroir source Electron régénéré par script officiel,
app installée inchangée. Aucun commit/push/déploiement. .DS_Store conservé.


## Vérification guidée des propositions Excel — 24/09/2026

L’espace planning et les référents PSR-MELEC partagent le module `verification.js`.
Le référent charge un fichier local au format `verification-psr-v1` depuis les réglages :
quatre brouillons `verification_d01_20262027` à `verification_d04_20262027` sont créés
dans `coordination_referents_aesh`, sans modifier les affectations. Le fichier réel
reste hors du dépôt public. Ne pas importer les noms ou coordonnées des enseignants.

Le parcours propose une journée à la fois, A puis B. Cours, service, heures et
passages restent modifiables. Chaque journée acceptée sauvegarde le brouillon ;
la reprise saute aux journées restant à vérifier. DP et présence/absence d’internat
sont confirmées explicitement. Les réunions ne sont jamais importées ni modifiées.

La confirmation finale est individuelle : remplacement borné des affectations PSR
de l’AESH et des cours hors PSR explicitement sélectionnés, conservation des périodes
antérieures/postérieures, des autres personnes et des renforts PFMP. Services DP,
internat, PIAL et DAFI datés. Le calendrier précis prend le relais des forfaits à
partir de la date choisie, comme dans les réglages ordinaires. Contrat limitant la fin.
Le même moteur calcule A/B, vacances, PFMP, heures et conflits ; les chevauchements
bloquent, les dépassements de volume figurent au récapitulatif.

Enregistrement atomique avec historique, verrou de fiche AESH et contrôle de l’état
d’ouverture : une modification concurrente impose de rouvrir la vérification. Une
validation ne s’applique pas deux fois. Les ajustements ultérieurs passent par la grille.

Règles : ajouter uniquement le type `verification` (contenu JSON ≤ 18000 caractères),
en conservant les règles existantes. Le code personnel reste dans `accesPlanning`,
pas dans les règles ni dans le dépôt. Le contrôle par code reste celui de l’application ;
ces règles ne constituent pas une authentification serveur nominative.

Tests : `node referents-aesh/tests/verification.test.mjs`, plus les tests existants.
Les tests utilisent exclusivement des données fictives.

Test utilisateur du 24/09 : les services datés sans forfait (h=0) sont maintenant
comptés et conservés ; aucune heure forfaitaire n’est ajoutée avant leur début.
Les totaux affichés conservent les centièmes, notamment pour les quarts d’heure.


## 24 septembre 2026 — A/B, EDT type et réunions supplémentaires

Lot autorisé par « vas y ». Référents et Antoine utilisent les mêmes boutons A, B, A+B et EDT type. A+B affiche deux grilles distinctes avec comptes séparés par AESH. EDT type est une consultation de l’organisation habituelle pour les dates de référence affichées : absences, vacances, PFMP, renforts PFMP et réunions institutionnelles masqués ; contrats, alternance et dates de validité conservés. Recliquer revient au planning daté.

Dans la fiche AESH, ajout de réunions supplémentaires (pôle, jour, horaires, A/B, début/fin). Elles comptent dans les heures et restent présentes lorsque l’institutionnelle remplace la réunion principale. Chevauchement ou dépassement : avertissement avant confirmation, sans blocage imposé. Champ partagé `reunionsSupplementaires`, préservé par la passerelle source Electron. Application Electron installée non remplacée.

Validation : sept fichiers de tests automatisés réussis ; navigateur avec données fictives, vue A+B, retour EDT type, bonne semaine à l’ouverture d’un cours, ajout/enregistrement d’une réunion puis présence en grille et décompte. Aucune donnée réelle écrite. Synchronisation multi-utilisateur réelle et règles en production non testées dans ce lot.

Publication restante : commit/push par Brahim, puis remplacement des règles avec le fichier complet `/Users/brahms/Documents/Codex/2026-09-22/va/outputs/FIRESTORE-COMPLET-REUNIONS-SUPPLEMENTAIRES-2026-09-24.txt`. Ce fichier ajoute uniquement le champ optionnel à la validation AESH (liste, 12 maximum). Aucun déploiement ni commit/push effectué par l’agent.
