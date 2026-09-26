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


### 24 septembre 2026 — Grille AESH toutes classes
Vérification demandée et autorisée : le filtre AESH lit déjà toutes les affectations de la personne, indépendamment de la classe et du pôle affichés. Ajout du repère « Toutes ses classes » au titre, sans changement des calculs ou des droits. Test fictif dédié : trois niveaux MELEC, CAP 1/2 PSR et CAPa regroupés, alternance A/B et EDT type ; sept fichiers de tests réussis. Pas de contrôle des affectations réelles ni écriture distante. Fichiers : app.js, index.html (cache), tests/ab-type-reunions.test.mjs, LISEZMOI.md. Aucune nouvelle règle Firestore nécessaire. Commit/push laissés à Brahim ; .DS_Store préservé.


### 24 septembre 2026 - A+B cote a cote
Demande autorisee : fais le. app.js et index.html : A/B dans un seul conteneur horizontal, compte separe, toutes les classes de la personne ; largeur de page bornee et position horizontale conservee lors des rendus. Cache app 2026-09-24h. Rendu commun referents/Antoine. Aucune modification des calculs ou regles Firestore.
Tests : sept fichiers automatises reussis. Navigateur local avec donnees fictives, format 390 px : page 390 px, zone 356 px, contenu 2112 px ; A/B sur la meme ligne, defilement clavier effectif. Clic cours B : bonne semaine et date du 21/09. EDT type puis B seule : pas de debordement de page ; aucune erreur console. Telephone physique et production non testes. Source miroir actualisee, application Electron installee inchangee. Aucun commit/push/deploiement ni ecriture distante. .DS_Store preserve.


### 24 septembre 2026 - Exports individuels A/B
Bouton Exporter la grille dans le planning partage de tous les poles et Antoine. Choix personne selectionnee ou equipe du pole ; A seule, B seule, A/B separees ou regroupees ; PDF/Excel. Toutes les occupations de la personne, tous poles/classes, sont reprises. EDT type respecte le mode affiche. PDF groupe : une page A3 paysage par personne ; Excel groupe : un onglet A+B par personne, impression A3 paysage. Modes separes : une page/feuille par semaine et personne. Aucun envoi automatique.
Fichiers : app.js (menu), exports.js (generateurs), fichiers.js (options papier et impression), index.html (cache i), tests/exports-grilles.test.mjs. Aucun changement de droits ni Firestore. Huit fichiers de tests reussis, fixtures uniquement : A/B, multiclasse, plages fractionnees, internat, plusieurs personnes. PDF de test rendu en PNG et examine ; Excel XML et options impression verifies, non ouvert dans Excel. Menu navigateur teste ; generation sans erreur console et lien Excel blob nomme observe. Evenement de telechargement PDF non remonte par le navigateur de test, fichier PDF valide en test direct. Aucun test de donnees reelles. Source miroir actualisee ; Electron installe inchange. Aucun commit/push/deploiement/ecriture distante. .DS_Store conserve.


### 25 septembre 2026 — Semaine type : plage fixe, totaux par jour, bande Soirée
Demande autorisée : « fais-le, et pour tous les référents de pôle ». Suite à l’examen des documents de référence d’Antoine (cinq classeurs `Edt Classes et AESH … sep26.xlsx`, 42 feuilles) et de sept fiches manuscrites Métiers d’Art. Ces fiches portent trois choses que la grille n’avait pas.

1. **Plage fixe 8 h → 18 h.** La grille ne s’arrête plus à la dernière heure travaillée : une journée sans après-midi garde ses créneaux de midi, où se placent la demi-pension et la réunion hebdomadaire de 13 h. Auparavant, le PDF d’un AESH finissant à 12 h 30 coupait la grille à 13 h.
2. **Total d’heures par jour**, en pied de colonne, comme au crayon sur les fiches : leur somme est le contrat. Avec l’alternance, un total en deux nombres se lit semaine A / semaine B. Ce qui se passe après 18 h est compté dans le total de sa journée.
3. **Bande « Soirée »** sous la grille pour ce qui dépasse 18 h (internat, soirées), au lieu d’étirer la journée entière jusqu’à 21 h.

Les trois s’appliquent aux quatre pôles : le code est commun, rien ne branche sur le pôle. À l’écran, ils valent pour la Semaine type comme pour Détail A et Détail B ; au PDF, pour la semaine type et les grilles détaillées.

Ce qui n’a **pas** changé : le découpage horaire reste celui de PRONOTE, sur l’heure et la demie. Les fiches manuscrites utilisent la grille de terrain (8 h 30 · 9 h 25 · 10 h 35 · 11 h 30 …) avec les récréations réelles ; les deux grilles coexistent dans l’établissement et le choix de suivre PRONOTE est celui de Brahim (« fais pas les récréations »).

Fichiers : `vues-planning.js` (`totauxJours`, `libelleTotal`, source unique écran/PDF/Excel), `app.js` (`grillePersonne` : plage fixe, pied de colonne, bande soirée, hauteur de bloc bornée à 18 h), `exports.js` (`grille` accepte `cadre.totaux` ; `pdfSemaineType` ; `pdfGrillesAesh` ; `feuillesSemaineType`), `index.html` (styles `.g-pied` et `.bande-soiree`, cache app `2026-09-25e`). Versions relevées en cascade : `vues-planning` → `c`, `exports` → `d`, `app` → `e`.

Aucun changement de droits, de collection Firestore ou de données. Aucune règle nouvelle à publier.

Tests : neuf fichiers automatisés réussis, dont le nouveau `tests/semaine-type-totaux.test.mjs` (totaux A/B, plage 8 h–18 h, bande Soirée, ligne de totaux Excel). `tests/acces-simple.test.mjs` affirmait encore qu’Antoine ne pouvait pas écrire sur B2MELEC : mis à jour, l’écriture a été ouverte le 24/09 (bd805e3). Rendu écran vérifié hors ligne par mesure (`getBoundingClientRect`) : les six pieds alignés sur une même ligne, grille fermée à 710 px, bande soirée à 736 px, aucun débordement de page en 1200 px comme en 375 px. PDF de semaine type généré puis rasterisé et examiné, avec et sans alternance : totaux `3,5 h / 2,5 h`, bande « Soirée · Mardi 18h–21h Internat », demi-pension de 12 h 30 visible. Données réelles, application Electron et production non touchées.


### 25 septembre 2026 — Le coordonnateur AESH a les mêmes droits qu'un référent
Demande de Brahim : « Antoine doit avoir accès à tout ». Il avait déjà les 19 classes en lecture
et en écriture depuis le 24/09, mais son accès restait en pratique une consultation augmentée :
il pouvait **placer un AESH sur un cours, et rien d'autre**. Trois verrous s'y opposaient.

1. `ecrireLot` refusait tout document dont le type n'était pas `place` — donc aucune fiche AESH,
   aucune absence, aucune réunion, aucun message, aucune période.
2. Une **liste blanche d'actions** ignorait en silence tout bouton absent de la liste : les
   commandes existaient à l'écran mais ne répondaient pas.
3. Plusieurs gardes `!modePlanning` masquaient la période, les PFMP, les classes libérées,
   la saisie des réunions, les AESH des autres pôles et le rattachement automatique d'une fiche.

`acces-planning.js` renvoie désormais `tousDroits: true`, et `app.js` décide par un seul point,
`accesComplet()`. Ses placements restent bornés par `ecritureClasses` : la vérification par classe
n'a pas bougé. Il ne peut toujours pas modifier le code qui lui ouvre la porte (`antoine-activer`
et `antoine-desactiver` restent réservés au référent PSR·MELEC).

Fichiers : `acces-planning.js`, `app.js`, `index.html` (caches `app` → `2026-09-25g`,
`acces-planning` → `2026-09-25b`), `tests/acces-simple.test.mjs`.
Aucune règle Firestore à changer : elles n'ont jamais distingué le coordonnateur d'un référent,
c'est l'application qui restreignait. Neuf fichiers de tests réussis.


### 26 septembre 2026 — Les AESH dans le même ordre d'un cours à l'autre
Remarque de Brahim : sur un bloc « Stella puis Antoine », sur celui du dessous « Antoine puis
Stella ». L'ordre n'était pas un choix : `placesCours` rend les placements tels qu'ils sont en
base, donc dans l'ordre où ils ont été écrits, et la colonne d'un AESH suivait ce rang. Après
l'import du 25/09, cet ordre était essentiellement celui du hasard.

La liste des AESH d'un cours est désormais triée par sigle, comme partout ailleurs dans
l'application (`calculs.js`, trois endroits). Sur CAP 1 PSR, 11 blocs sur 19 changent d'ordre et
ANT passe systématiquement devant F, N, ST et TI.

Ce qui ne change pas : l'alignement n'est parfait que si deux cours empilés ont la même équipe.
Un cours à ANT + ST au-dessus d'un cours à ST seul laisse ST occuper toute la largeur du second.
Réserver une colonne fixe par personne sur toute la journée donnerait des blocs étroits et vides :
écarté.

Fichiers : `app.js` (une ligne dans `grilleClasse`), `index.html` (cache `2026-09-26a`).
Aucune donnée touchée, aucun calcul d'heures modifié. Neuf fichiers de tests réussis.


### 26 septembre 2026 — Onglet « Élèves » : notifications, aide humaine, aménagements d'épreuve
Demande de Brahim : qu'un AESH voie sur chaque créneau combien d'élèves y sont notifiés, et à
quel titre, pour arbitrer entre deux cours qui réclament chacun un adulte. Puis, formulaire
« Organisation des CCF » du lycée à l'appui, que les aménagements d'épreuve y soient aussi.

**Un onglet, deux vues, une seule liste d'élèves.** Entre « Besoins » et « Messages ». On entre
par classe — les 19, ouvertes à tout référent, comme l'accès planning. Une ligne par **CODE de
suivi à 5 caractères** : aucun nom, aucun prénom ne passe en ligne, et la règle Firestore le
garantit par liste blanche de champs.
- *Aide humaine* : notification (notifiée / en cours / non), aide (individualisée / mutualisée /
  aucune), heures, ULIS, date de fin. C'est ce qui sert à placer les AESH toute l'année.
- *Aménagements d'épreuve* : PAP ou PPS, 1/3 temps, lecteur, scripteur, assistant, ordinateur,
  sujet agrandi — les sept colonnes du formulaire du lycée. Bouton « Tableau pour le CCF » qui
  sort la liste prête à recopier.

**Le support d'épreuve ne se saisit pas ici.** Il vient du profil d'édition de l'Atelier (police,
taille, version allégée ou braille, dispositif) et s'affiche en lecture seule. Le recopier à la
main créerait deux vérités qui divergeraient au premier changement.

**Sur la grille**, une seule marque par bloc : `3 notifiés · 1 ind · 2 mut · 1 ULIS`, à côté du
cercle « besoin de l'enseignant ». Des nombres, rien d'autre — pas de code, pas de date. Une
classe sans personne de notifié n'affiche rien.

**Ce qui n'est pas fait :** le compte est celui de la CLASSE, reporté sur chacun de ses cours.
Un cours en groupe (co-enseignement, atelier) n'a pas forcément tous les élèves notifiés. Le
modèle d'emploi du temps aménagé existe déjà dans l'Atelier (`amenagementTemps.regles[]`) et
permettra d'affiner : ce n'est pas dans ce lot.

Fichiers : `app.js` (onglet, écran, saisie, marque sur les blocs), `vues-planning.js`
(`comptesEleves`, `libelleEleves`), `index.html` (styles, caches `app` → `2026-09-26b`,
`vues-planning` → `2026-09-26a`, `exports` → `2026-09-26a`), `tests/eleves-notifies.test.mjs`,
`tests/eleves-exemple.json`. La liste des codes vient de `observation-besoins/roster.json`,
déjà publié (19 classes, 143 codes) : elle sert de secours tant qu'une classe n'a pas de document.

**Règle Firestore à publier avant tout enregistrement** — sans elle l'écriture est refusée et
l'écran le dit. Texte complet dans `~/Documents/regles-firestore-2026-09-26.rules`.

Tests : dix fichiers automatisés réussis, dont le nouveau (comptes, singulier/pluriel, heures
« 15 h » ou « 2,5 », entrée sans code ignorée, et vérification que le document d'exemple ne
porte que les neuf champs autorisés). L'écran lui-même n'a pas pu être exercé hors ligne :
il demande Firebase et un code de pôle.


### 26 septembre 2026 — Onglet « Épreuves » : CCF et bac blanc posés par-dessus l'emploi du temps
Demande de Brahim. Une épreuve n'est pas un cours : c'est un événement daté que le référent pose
lui-même, et qui vient **par-dessus** la grille, comme une PFMP. Elle porte ce que l'enseignant a
demandé — combien d'AESH — et ce qu'un AESH venu d'ailleurs doit savoir en arrivant.

Onglet « Épreuves » entre Élèves et Messages. Un bouton « ＋ Une épreuve » : nature (CCF, bac
blanc, test de positionnement, examen, autre), classe, date, créneau, discipline, salle, nombre
d'AESH demandés, précision libre. Elle apparaît aussitôt sur l'emploi du temps de la classe, en
surimpression hachurée, avec le nombre d'élèves et le nombre d'AESH. Un clic dessus la rouvre.

**Les besoins des élèves ne se ressaisissent pas.** Ils viennent de l'onglet « Élèves » : la
fiche d'une épreuve compte les élèves concernés, ceux qui sont notifiés, et détaille les
aménagements cochés (1/3 temps, lecteur, scripteur, assistant, ordinateur, sujet agrandi) plus
les supports particuliers. Bouton **« Fiche pour l'AESH »** : une feuille à lire en arrivant,
pour quelqu'un qui ne connaît pas la classe.

Le champ `codes` permettra de ne retenir qu'une partie de la classe (tous les élèves ne passent
pas toujours) ; l'écran ne l'expose pas encore, une épreuve concerne toute la classe par défaut.
La notion de **période** évoquée par Brahim est laissée pour plus tard.

Retirer une épreuve la passe en `statut: 'retire'` : elle disparaît de la grille, rien n'est effacé.

Fichiers : `app.js` (onglet, écran, feuille de saisie, surimpression dans `grilleClasse`, fiche
AESH), `index.html` (styles, cache `2026-09-26c`).
**Règle Firestore `epreuve` à publier** — texte complet dans
`~/Documents/regles-firestore-2026-09-26b.rules`. Dix fichiers de tests réussis.

À noter : une brique « épreuves » existait déjà dans `coordination_epreuves_aesh` (campagne de
positionnement importée de RESANA le 14/09, espace edt-aesh). Brahim a confirmé que cet espace
n'est pas utilisé : on ne s'y branche pas.

**Complément du 26/09** — deux volets dans la fenêtre de placement. En cliquant un cours, on
trouve désormais « Placer les AESH » (ce qui existait) et « Élèves », qui liste **un par un** les
élèves notifiés de la classe : aide individualisée ou mutualisée, ULIS, heures, PAP/PPS, puis ses
aménagements d'épreuve et son support. Rien ne s'y saisit — tout vient de l'onglet « Élèves ».
Un AESH qu'on place peut ainsi savoir avant d'entrer qu'il y a deux lecteurs et un scripteur.
Pour un cours à deux classes, chaque ligne porte sa classe. Volet accessible aussi au
coordonnateur en accès planning (ajouté à sa liste blanche d'actions).

Piège rencontré : la classe CSS `.bes` existait déjà (`position:absolute`) et faisait disparaître
les pastilles d'aménagement dans le coin du bloc. Les classes de ce lot sont préfixées `el-`.


### 26 septembre 2026 — L'enregistrement d'un placement ne fait plus attendre
Brahim : « pourquoi l'enregistrement prend du temps ». Mesuré : pour un placement sur un cours
partagé entre quatre AESH, la transaction relisait **237 documents**, un par un, en attendant
chaque réponse — environ **14 secondes**.

Deux causes cumulées. `enregistrerPlanning` relit tous les placements des AESH concernés pour
détecter une modification concurrente, et le faisait en boucle séquentielle. Et Timothée porte
**189 documents « place »**, dont 166 au statut « retiré » : les doublons neutralisés lors de
l'import du 25/09, qui ne servent plus à rien mais sont relus à chaque fois.

Les relectures partent désormais ensemble (`Promise.all`). Même vérification, même verrou de
transaction, même détection de conflit : seul le temps d'attente change — de l'ordre de la
seconde au lieu de quinze.

Piste laissée de côté : exclure les placements « retiré » des relectures. Ce serait plus rapide
encore, mais c'est la logique de détection de conflit — un placement retiré peut être réactivé
par un autre référent au même moment. Non touché.

Fichiers : `enregistrement.js`, `app.js` (cache `2026-09-26a`), `index.html` (`2026-09-26e`).
Dix fichiers de tests réussis.


### 26 septembre 2026 — Sauvegarde et restauration
Demande de Brahim : « au cas où il y a une panne, la possibilité de tout enregistrer en JSON ».
Entrée « 💾 Sauvegarde et restauration » dans le menu « … », accessible à tout référent.

**Enregistrer** : un seul fichier, tout dedans — fiches AESH, placements, absences, réunions,
messages, période, codes de pôle, PFMP, élèves, épreuves. Une sauvegarde unique plutôt qu'une
par pôle : trois fichiers sur quatre seraient périmés le jour où on en a besoin, et un AESH à
cheval sur deux pôles (Cécile, CD) s'y retrouverait coupé en deux.

**Restaurer** : on choisit le périmètre — *Tout*, *Mon pôle*, *Une classe* — et le mode :
- *Compléter* : on écrit ce que contient le fichier, on laisse le reste tranquille. Ce qu'un
  autre référent a ajouté depuis survit.
- *Remettre à l'identique* : on écrit le fichier **et** on passe en « retiré » ce qui a été
  ajouté depuis, dans le seul périmètre choisi.

Rien ne s'écrit avant que l'écran ait dit ce qui change : *« 3 ajoutés · 12 modifiés ·
128 inchangés · 2 retirés »*, puis « Vous confirmez ? ». Jamais d'écriture à l'aveugle.

Deux garde-fous que la logique impose : la **période, les messages et les réunions
institutionnelles** sont communs aux quatre pôles — ils ne sont donc jamais restaurés depuis un
périmètre restreint, pour ne pas défaire le travail d'un autre référent. Et « remettre à
l'identique » ne retire que des documents qui portent un statut (placement, absence, épreuve) :
jamais une fiche AESH ni une classe d'élèves.

Fichiers : `sauvegarde.js` (logique pure), `app.js`, `index.html` (cache `2026-09-26f`),
`tests/sauvegarde.test.mjs`. Onze fichiers de tests réussis.


### 26 septembre 2026 — A et B dans une seule grille, et un panneau qui respire
Brahim : « quand je donne l'emploi du temps à un enseignant, il a besoin de voir sur une seule
feuille sa semaine A et sa semaine B. Et toi, tu as séparé les deux. »

C'était vrai pour une **classe** : « Semaine type » y alignait deux grilles côte à côte, alors
que pour une personne elles étaient bien fusionnées. Une classe montre désormais **une seule
grille** : tous ses cours, ceux qui n'ont lieu qu'en A ou qu'en B portant leur lettre en coin et
un cadre en pointillé. Deux cours qui alternent au même créneau se placent côte à côte — on voit
d'un coup ce qui se passe à cette heure-là, semaine A comme semaine B.

En A+B, **les colonnes ne portent plus de date** : le même lundi n'existe pas dans les deux
semaines. Le jour suffit, et le repère du haut dit « Semaines A et B ».

**Le panneau s'épure.** Ne restent visibles que *Semaine / Jour* et le filtre AESH. Le reste
passe dans un petit bouton « ⋯ » qui déplie : A et B ensemble · voir la semaine A · voir la
semaine B · élèves notifiés · besoins des enseignants · EDT type · exporter la grille. Le menu
se referme dès qu'on choisit.

A+B est désormais le défaut partout, pour une classe comme pour une personne.

Fichiers : `app.js`, `index.html` (cache `2026-09-26h`). Onze fichiers de tests réussis.


### 26 septembre 2026 — La grille respire : pastilles, salles courtes, sigles de service
Critique du rendu avec Brahim. Ce qu'on lisait lundi 9h30 : « Acc pers mat » et « Co-ens mat ».
Pas des noms de cours, des débris. Trois causes cumulées, trois corrections.

**Les AESH passaient en bandes verticales** occupant la moitié de la largeur du bloc, avec leur
horaire écrit dedans — tronqué en « 30–11 », « h–10h3 ». Ils sont désormais en **pastilles au
pied du bloc** : le cours récupère toute sa largeur. L'horaire disparaît, sauf pour une présence
partielle, qui ne se devine pas.

**Les noms de salle** sortaient de PRONOTE en entier : « SALLE 008_PSR » mangeait une ligne pour
dire « 08 ». `salleCourte()` retire le mot SALLE, le suffixe de filière et un seul zéro de tête —
008 → 08, 010 → 10, 016A → 16A, 119B inchangé. Un atelier garde son nom, abrégé : « At. Vannerie ».

**Les services** s'écrivaient « DP — Demi-pension » dans un bloc de trente minutes. Deux lettres
suffisent (DP, RE, RI, IN, PI, ES, PE), et une **légende sous la grille** rappelle leur sens, une
seule fois, seulement pour ceux qui apparaissent cette semaine-là.

Le cadre horaire porte maintenant une ombre légère : il reste lisible quand on fait glisser la
grille du doigt sur un téléphone — le défilement horizontal était déjà là, il se voit mieux.

Fichiers : `app.js`, `presences.js` (`sigleService`, `SIGLES_SERVICE`), `exports.js` (version),
`index.html` (cache `2026-09-26i`). Onze fichiers de tests réussis.

**Rendu sur téléphone (26/09)** — maquette à 375 px, vraies données CAP 1 PSR. Quatre défauts
trouvés et corrigés, dans cet ordre :
1. `padding-right:48%` réservait encore la place des anciennes bandes verticales : le titre était
   écrasé sur la moitié gauche et « Accompagnement perso. maths » s'affichait « Acc pers mat ».
2. Salle et compteur d'élèves s'affichaient dès 44 et 54 px de haut, ce qui poussait les pastilles
   hors du bloc. Seuils portés à 96 et 116 px : un cours d'une heure montre son titre et ses AESH,
   rien d'autre.
3. Le rond du besoin, passé en haut à gauche, recouvrait la première lettre du titre (« co… » pour
   « Co-enseignement »). Il est revenu en bas, et les pastilles lui laissent 20 px.
4. À trois AESH sur un bloc étroit, les pastilles s'empilaient sur trois lignes et chassaient le
   titre. Elles tiennent désormais sur une seule ligne ; ce qui dépasse est coupé, le détail est
   au clic.

Les colonnes passent de 200 à 260 px sur téléphone — la grille défile de toute façon — et un cours
d'une heure a droit à deux lignes de titre. Le compteur d'élèves se dit court : « 6 él. · 2 AI ·
2 AM · 6 ULIS », l'ancien libellé étant coupé avant d'être utile.

**Deux retouches après essai sur téléphone (26/09)** — le repère « Semaines A et B » était collant
(`position:sticky`) : en défilant il passait par-dessus les cours et masquait ce qu'on cherchait à
lire. Il reste désormais en haut, sans flotter. Et les trois points disent ce qu'ils font :
bouton **« Affichage ⋯ »** au lieu d'un rond muet.

**La lettre A ou B entre dans le titre (26/09)** — six variantes montrées à Brahim sur le même
créneau, à la largeur d'un téléphone : devant le titre, en filigrane, par la barre latérale, par
le cadre, en bas à droite, ou rien. Retenue : **devant le titre**, avec deux couleurs (A en vert
sombre, B en violet) pour distinguer d'un coup d'œil sans avoir à lire.

Le défaut n'était pas la lettre mais sa position : posée en surimpression, elle mangeait le
dernier mot — « Accompagnement perso. » perdait « maths ». Dans le flux du texte, elle n'entre en
conflit avec rien, sur un bloc d'une demi-heure comme de quatre heures. Écartées : le filigrane
(le fond des blocs est trop clair et il brouille le titre), la barre et le cadre (il faut
apprendre le code, et le pointillé dit déjà « ne revient pas toutes les semaines »), le coin bas
droit (il se bat avec les pastilles AESH), et rien du tout (un cours seul en A, sans jumeau en B,
n'aurait plus aucune indication).

Même traitement dans la grille d'un AESH, où la lettre était aussi une pastille posée par-dessus.

**Un dessin devant DP et IN (26/09)** — sept variantes montrées à la taille réelle d'un créneau
de trente minutes : rien, couverts, assiette, bol, deux émojis, ou le logo seul sans lettres.
Retenue : **couverts au trait devant DP**, et un **lit au trait devant IN**.

Au trait plutôt qu'en émoji : le dessin prend la couleur du texte, s'imprime en noir et blanc, et
ne crie pas sur un bloc de trente minutes. Les lettres restent — un remplaçant lit « DP » plus
vite qu'il ne décode un pictogramme ; le dessin sert à repérer, les lettres à lever le doute.

Le lit a été redessiné une fois : en traits fins il disparaissait à 11 px. Il est en formes
pleines — tête de lit, matelas, oreiller, pied — et sa silhouette se lit à cette taille.

Fichiers : `presences.js` (`logoService`), `app.js`, `exports.js` (version), `index.html`
(cache `2026-09-26s`).

**La demi-pension et la réunion reprennent leur place dans la colonne (26/09)** — elles étaient
collées dans une bande étroite à droite du jour, décalées et illisibles. Elles entrent désormais
dans le **même calcul de colonnes que les cours** : quand le créneau est libre — midi, le plus
souvent — elles prennent la largeur ; quand un TP l'occupe, elles se rangent à côté, ce qui était
le comportement souhaité par Brahim pour ce cas.

**Cadre en pointillé** : ce n'est pas une présence en classe avec les élèves. Le sigle, son dessin
et les AESH tiennent sur une seule ligne — un créneau de demi-pension fait trente minutes, il n'y
a pas la place pour deux.

**La réunion d'équipe n'affiche plus les sigles** : elle rassemble tout le pôle, y lister chacun
n'apprend rien. Juste « RE », en pointillé, à son heure. La ligne sous la grille qui les listait
est supprimée — l'information est revenue dans la grille.

Vaut pour les quatre pôles.
