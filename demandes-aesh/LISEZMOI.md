# Demandes AESH — pôle PSR / MELEC

Page en ligne destinée aux enseignants du pôle. Elle permet de demander des AESH pour une date précise (test de positionnement, CCF, évaluation, sortie, autre) ou de déclarer les besoins réguliers de ses cours de l'année. La coordination répond depuis l'Atelier (onglet « Aide humaine »).

- Destination prévue : `coordination-pedagogie/demandes-aesh/`.
- Version actuelle : **staging**. Rien n'est publié, rien n'est écrit dans Firebase.
- Contrat de référence : `work/aide-humaine-v1/CONTRAT.md`, §1 et §3.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | La page. Elle est autonome : CSS et JS en ligne (module ES), sans framework ni police externe. |
| `shim-firestore.js` | Faux Firestore en mémoire, avec des données **100 % fictives**. Il sert uniquement aux tests. |
| `banc.html` | Banc de test : exploration manuelle avec options et tests automatiques. |
| `LISEZMOI.md` | Ce document. |

**En production, seul `index.html` est utile.** `shim-firestore.js` et `banc.html` n'ont pas besoin d'être déployés.

## Parcours

1. **Accueil**. On y trouve le titre, la mention RGPD et 6 cartes : les 5 natures ponctuelles et « Mes cours de l'année (besoins réguliers) ». On y trouve aussi l'accès à « Demandes du pôle », les envois en attente (avec « Réessayer ») et une éventuelle saisie en cours à reprendre.
2. **Demande ponctuelle**, en 6 étapes :
   1. **Nature et matière.** La liste des matières réunit celles du référentiel, plus « Autre » en saisie libre.
   2. **Classes.** On peut en choisir une ou plusieurs.
   3. **Créneaux.** Pour chaque classe, un ou plusieurs créneaux : date, début, fin, salle et nombre d'AESH.
   4. **Élèves.** Les codes sont affichés avec les badges « Notifié » et PPS/PAP. L'enseignant coche « concerné ». Les 6 besoins d'examen sont alors précochés d'après `besoins_<année>` et restent modifiables. Tant que « concerné » n'est pas coché, les besoins connus apparaissent seulement comme indice.
   5. **Emploi du temps du pôle.** Il montre, du lundi au vendredi et en direct, toutes les demandes ponctuelles de l'année, avec la navigation d'une semaine à l'autre. La semaine affichée par défaut est celle de la première date saisie.
      - Les créneaux de l'enseignant portent un cadre plein et la mention « Votre créneau ».
      - Les demandes qui les chevauchent portent un cadre en pointillés et la mention « ⚠ Chevauche votre créneau… ».
      - Un résumé liste tous les chevauchements, toutes semaines confondues.
   6. **Récapitulatif.** Les créneaux sont présentés comme un emploi du temps. On y trouve aussi les élèves et leurs besoins, puis un commentaire accompagné de l'avertissement « aucun nom ». Le bouton Envoyer mène à une confirmation.
3. **Mes cours de l'année**, en 4 étapes :
   1. **Matière.**
   2. **Classe.** Seules les classes où la matière figure à l'emploi du temps publié sont proposées.
   3. **Grille des créneaux hebdomadaires du référentiel.** Chaque créneau affiche « AESH placés : n ». On y indique :
      - le besoin (0, 1, 2 ou « 3 ou + ») ;
      - les élèves (codes et badges) ;
      - les aides, sous forme de puces ;
      - une précision.

      Un bouton recopie les élèves d'un créneau sur les autres. Si une déclaration existe déjà pour ce couple (classe, matière), le formulaire est prérempli avec la **plus récente** (`creeLe`).
   4. **Envoi.** On renseigne « à partir du » et un commentaire. Un tableau compare le besoin aux AESH placés. Le bouton Envoyer mène à une confirmation.
4. **Demandes du pôle**. Cette liste en lecture seule, mise à jour en direct, montre toutes les demandes et déclarations de l'année.
   - Chaque élément affiche un statut, avec une icône et un texte, et la réponse de la coordination.
   - On peut filtrer par type, par classe et par statut.
   - Pour une déclaration régulière, la liste indique si elle est « en vigueur » ou « remplacée ».

## Données

Collection Firestore : **`coordination_demandes_aesh`**, projet `devoirs-pse`. La configuration est la même que dans `edt-aesh/index.html`, et l'application est nommée `demandes-aesh`.

L'année est calculée ainsi : `mois ≥ août ? "AAAA-(AAAA+1)" : "(AAAA-1)-AAAA"`.

**Lus**

| Document | Écrit par | Usage |
|---|---|---|
| `referentiel_<année>` | Atelier | Classes, matières, codes, créneaux hebdomadaires, `aeshPlaces`, natures, besoins, aides. Lu par `getDoc`. |
| `besoins_<année>` | Atelier | Badges « Notifié » et PPS/PAP, et précochage des besoins d'examen. Lu par `getDoc`. |
| Tous les documents `type in ['demande','regulier']` | Page | Emploi du temps du pôle, liste du pôle, préremplissage. Lus par `onSnapshot`. L'année est filtrée côté page, afin de n'utiliser qu'un index simple. |

**Écrits** (création uniquement, par `setDoc`, jamais de mise à jour ni de suppression)

- **`demande_<Date.now() base 36><4 car. [a-z0-9]>`** : clés exactes du contrat §1.3.
  - `lignes` : une ligne par créneau, triées par date puis par heure.
  - Chaque ligne reprend les élèves cochés pour sa classe.
  - `nbAesh` est un entier.
- **`regulier_<…>`** : clés exactes du contrat §1.4.
  - Un élément de `creneaux` par créneau du référentiel pour ce couple (classe, matière), y compris ceux dont le besoin vaut 0.
  - Quand `besoin` vaut 0, `eleves` et `note` sont envoyés vides.
- À la création, toujours : `statut: "nouvelle"`, `reponse: {statut:"", texte:"", aeshConfirmes:null, majLe:""}`, `source: "demandes-aesh"`, `creeLe = majLe` (ISO).

**Contrôles avant envoi**

- Date valide, ni passée, ni un samedi ou un dimanche.
- Heures au format HH:MM, avec un début antérieur à la fin.
- Au moins un créneau par classe, et 40 créneaux au plus par demande.
- `nbAesh` entier, compris entre 0 et 20.
- Salle limitée à 20 caractères, commentaire à 600.
- 60 créneaux au plus pour une déclaration régulière.
- Date « à partir du » valide.

Tous les champs texte sont débarrassés des caractères de contrôle et tronqués.

**Stockage local (`localStorage`)**

- **`demandes-aesh-brouillons-v1`** : envois non aboutis (hors ligne, refus, délai de 15 s), au format exact du document. Le bouton « Réessayer » relit d'abord le document. S'il est déjà arrivé, rien n'est réécrit ; sinon, `setDoc` est relancé. La même opération se déclenche seule au retour du réseau (`online`).
- **`demandes-aesh-cache-v1`** : copie du référentiel et des besoins de l'année. Elle permet d'afficher les classes et les codes hors connexion. Elle ne contient que des codes, aucun nom.

## Messages d'erreur

| Situation | Message |
|---|---|
| Référentiel absent | « La coordination n'a pas encore publié les classes, les codes élèves et les emplois du temps de l'année… ». Les cartes sont désactivées et un bouton « Réessayer » est proposé. |
| `permission-denied` en lecture | « Espace en cours d'ouverture par la coordination… ». Les cartes sont désactivées. |
| `permission-denied` à l'envoi | « Espace en cours d'ouverture par la coordination : l'envoi n'est pas encore autorisé. » Le brouillon est gardé et un bouton « Réessayer » est proposé. |
| Hors ligne, `unavailable` ou délai dépassé | « Pas de connexion au serveur. » Le brouillon est gardé et un bouton « Réessayer » est proposé. |
| Échec du chargement du SDK Firebase | « Pas de connexion au serveur » et bouton « Recharger la page ». |

## Règle Firestore

Brahim publie lui-même cette règle. Voici la version définitive, reprise de `work/aide-humaine-v1/regle-ajout-demandes-aesh.rules` (contrat §1.6) :

```
match /coordination_demandes_aesh/{docId} {
  allow read: if true;

  // Demande ponctuelle déposée par un enseignant
  allow create: if docId.matches('demande_[A-Za-z0-9]+')
                && request.resource.data.type == 'demande'
                && request.resource.data.id == docId
                && request.resource.data.annee is string
                && request.resource.data.statut == 'nouvelle'
                && request.resource.data.lignes is list
                && request.resource.data.lignes.size() >= 1
                && request.resource.data.lignes.size() <= 40
                && request.resource.data.keys().hasOnly(['id','type','annee','nature','natureAutre',
                     'matiere','commentaire','lignes','statut','reponse','creeLe','majLe','source']);

  // Besoins réguliers déclarés par un enseignant (emploi du temps de l'année)
  allow create: if docId.matches('regulier_[A-Za-z0-9]+')
                && request.resource.data.type == 'regulier'
                && request.resource.data.id == docId
                && request.resource.data.annee is string
                && request.resource.data.statut == 'nouvelle'
                && request.resource.data.creneaux is list
                && request.resource.data.creneaux.size() >= 1
                && request.resource.data.creneaux.size() <= 60
                && request.resource.data.keys().hasOnly(['id','type','annee','matiere','classe',
                     'aPartirDu','commentaire','creneaux','statut','reponse','creeLe','majLe','source']);

  // Référentiel et besoins d'examen publiés par la coordination (Electron)
  allow create, update: if (docId == 'referentiel_' + request.resource.data.annee
                            && request.resource.data.type == 'referentiel')
                        || (docId == 'besoins_' + request.resource.data.annee
                            && request.resource.data.type == 'besoins');

  // Réponse de la coordination à une demande : seuls statut, réponse et date changent
  allow update: if resource.data.type in ['demande','regulier']
                && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['statut','reponse','majLe'])
                && request.resource.data.statut in ['nouvelle','vue','accordee','partielle','refusee','a-revoir'];

  allow delete: if false;
}
```

La page respecte cette règle.

- L'identifiant est composé du préfixe suivi de lettres et de chiffres, sans tiret ni souligné dans la partie aléatoire.
- Le champ `id` est égal à l'identifiant du document.
- `statut` vaut `nouvelle`, et les clés sont exactement celles de la liste.
- Une demande compte 1 à 40 lignes, une déclaration 1 à 60 créneaux.

Le shim applique la même règle à chaque `setDoc` et refuse toute suppression.

## RGPD

- **Aucun nom** dans la page ni dans les envois, qu'il s'agisse d'élèves, d'enseignants ou d'AESH. Les élèves ne sont désignés que par leur code à 5 caractères. La correspondance code → nom est envoyée par mail par le coordinateur et n'est jamais en ligne.
- La mention RGPD du contrat figure à l'accueil et sur la liste du pôle.
- Les champs libres (nature « autre », matière « autre », salle, précision par élève ou par créneau, commentaire) sont accompagnés de l'avertissement « N'écrivez aucun nom ». **Aucun contrôle automatique** du contenu n'est fait, conformément à la précision donnée sur le contrat §3.
- La liste « Demandes du pôle », visible par tous, affiche le **nombre** d'élèves et non leurs codes. Elle n'affiche **ni commentaires ni précisions**, pour limiter l'exposition d'un nom écrit par erreur.
- `aeshPlaces` et `aeshConfirmes` sont des nombres. La page n'affiche jamais de prénom d'AESH.
- ⚠ Les codes identifient sans protéger. La collection est lisible par tout navigateur (`allow read: if true`), comme les autres espaces `coordination_*`. Toute personne qui connaît l'adresse peut donc voir les codes et les besoins d'examen associés, sans les noms.

## Accessibilité

- `lang="fr"` et un lien d'évitement.
- Libellés explicites sur tous les champs, `fieldset` et `legend` pour les groupes.
- Navigation au clavier. Le focus est déplacé sur le titre de l'étape ou sur le résumé des erreurs, et chaque erreur renvoie à son champ.
- `:focus-visible` : contour de 3 px.
- Texte d'au moins 16 px et cibles d'au moins 44 px.
- Contrastes AA vérifiés sur les jetons de couleur, en thème clair comme en thème sombre.
- Les statuts, les chevauchements et « Votre créneau » s'appuient toujours sur un texte et une icône ou une forme de bordure, jamais sur la seule couleur.
- Annonces `aria-live`, `role="alert"` pour les erreurs.
- Mise en page mobile d'abord. Les jours sont empilés sur téléphone, sur 2 colonnes à partir de 700 px et sur 5 colonnes à partir de 1100 px.

## Tester en local

Aucune donnée réelle, aucun accès Firebase : le banc injecte le faux Firestore.

```bash
cd work/aide-humaine-v1/staging/demandes-aesh
python3 -m http.server 8790 --bind 127.0.0.1
# puis ouvrir http://127.0.0.1:8790/banc.html
```

- **« Lancer les tests »** exécute les scénarios automatiques. Un ✓ ou un ✗ s'affiche pour chaque test, suivi d'un bilan.
  - Données fictives conformes.
  - Accueil.
  - Parcours ponctuel complet jusqu'à l'envoi, avec vérification exacte du document écrit.
  - Règle Firestore simulée : envoi valide accepté, clé en trop et autres écarts refusés.
  - Parcours régulier avec préremplissage.
  - Liste du pôle en direct.
  - Bornes des chevauchements.
  - `permission-denied`.
  - Référentiel absent.
  - Hors ligne suivi de « Réessayer ».
  - Accessibilité de base.
- **`banc.html?auto`** lance les tests dès l'ouverture. À la fin, `document.body.dataset.fini` vaut `"1"` et `dataset.echecs` donne le nombre d'échecs, ce qui permet de lancer les tests sans tête.
- **« Ouvrir la page avec ces options »** charge la page dans le cadre avec le faux Firestore. Les options possibles sont : lectures refusées, écritures refusées, envoi hors ligne, référentiel absent, besoins absents.

**Principe technique.** Le banc récupère le texte de `index.html`, crée un cadre `about:blank` de même origine et pose `window.__FIRESTORE_SHIM__` dans ce cadre. Il y écrit ensuite le document avec `document.open/write`. La fenêtre étant conservée, le module de la page trouve le shim et n'importe jamais Firebase. `index.html` reste ainsi strictement identique à la version de production.

⚠ **N'ouvrez pas `index.html` directement** pour tester : sans shim, la page se connecte au vrai projet Firebase et lit la collection réelle.

**Dates de test.** Les demandes fictives tombent 4 semaines après la semaine courante, et l'année est calculée à partir de la date du jour. Si le banc est lancé entre juin et juillet, ces dates peuvent tomber dans l'année scolaire suivante. Les tests restent cohérents entre eux, mais les données affichées changent d'année.

---

## Estimation des besoins en AESH (15/09/2026)

**Nouvelle entrée principale** de la page, écran « Estimation des besoins » (module `estimation.js`, chargé à la demande).

- L'enseignant choisit **sa ou ses matières**. Les emplois du temps des 5 classes du pôle (C1 PSR, C2 PSR, 2de, 1re et Tle MELEC) s'affichent avec l'effectif de chaque classe.
- **Seuls ses cours sont cliquables** ; ceux des collègues restent en pointillés. Pour chaque cours, il choisit **0 à 6 AESH**. En option : le type d'aide et une précision courte, sans nom.
- **Confirmation « Êtes-vous sûr ? »** à chaque ajout, suppression, retrait ou envoi.
- **Retour en arrière** : « Annuler la dernière action », « Modifier », « Supprimer », « Tout recommencer ».
- **Reprise** : la saisie est gardée sur l'appareil. Après l'envoi, un **code de reprise** permet de la retrouver sur un autre appareil. Une estimation peut être **mise à jour** ou **retirée** à tout moment.
- **Compteur par pôle, en direct** : heures d'AESH demandées face au volume disponible (publié par la coordination), avec la couleur de chaque discipline et la part de l'enseignant. Les disciplines « pas encore estimé » sont listées.
- **Règle de calcul** : sur un même cours, on retient le **plus grand** nombre déclaré, pas la somme (co-enseignement). Un cours en semaine A ou B seulement compte pour moitié.
- **Données en ligne** : collection `coordination_estimation_aesh`.
  - `cadre_<année>` : publié depuis l'Atelier.
  - `declaration_<id>` : une par enseignant, mise à jour sur place, jamais supprimée.
  - Aucun nom d'élève, d'enseignant ni d'AESH. Volumes AESH : totaux par pôle seulement.
- **Tests de positionnement** : la carte a été retirée (ils passent par RESANA). « Mes cours de l'année » est remplacé par l'estimation ; les anciennes déclarations restent lisibles dans « Demandes du pôle ».
- **Accessibilité** : texte ≥ 16 px partout, sauf dans les blocs de la grille horaire sur ordinateur. La liste par jour (téléphone) et les libellés ARIA donnent le texte complet.
