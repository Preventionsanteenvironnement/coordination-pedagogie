# Observation & besoins des élèves — module AESH

Application mobile destinée à **toutes les AESH de l'établissement** : chacune voit ses classes
et, en premier, les élèves qu'elle accompagne.
Elle récolte au fil de l'année la matière des deux cadres de commentaires de la grille
**GEVA-Sco** — « Obstacles à la réalisation de l'activité » et « Points d'appui » — pour que
la grille officielle soit remplie à partir d'observations réelles, et non de souvenirs.

C'est **la seule application d'observation**. Elle remplace les anciens `observation/` et
`observation-suivi/` (outil d'autonomie de la coordination PSR MELEC, retirés) : les AESH PSR
et MELEC l'ouvrent depuis l'onglet 👁️ de leur emploi du temps (`edt-aesh/`), avec le même code.
Une modification faite ici vaut pour tout le monde.

## Les trois axes

L'outil ne fait pas remplir la grille : il récolte, au fil de l'année, ce qu'elle réclame.

| | Ce qu'on note | À quoi ça sert |
|---|---|---|
| **1. L'activité** | cotation A/B/C/D/SO + obstacles (Cadre 1) + points d'appui (Cadre 2) | la grille MDPH, pages 4 et 5 |
| **2. Le rapport à l'aide** | « J'ai … → il a … → et ensuite … » | **le besoin réel d'aide humaine** : quota, mutualisation |
| **3. Les adaptations** | ce qui est en place, et si ça suffit | pages 2 et 6 : conditions de scolarisation, effet des aménagements |

L'axe 2 n'existe **nulle part** dans le formulaire officiel. Il vient de la grille BEP
(« comportement face à la tâche ») et d'Egron (« utilisation des aides, sollicitations de
l'adulte »). C'est lui qui permet de dire : *13 heures notifiées, mais il repart seul dans
7 cas sur 10 — le besoin est au démarrage, pas en présence continue.*

## Le parcours

**Code AESH → classe → élève → matière**, puis l'observation. Les matières s'affichent
d'elles-mêmes selon la classe et restent en place quand on passe à un autre élève de la
même classe. Tout est modifiable après coup : toucher une ligne du journal la rouvre,
avec un bouton pour supprimer. Une observation appartient à son auteur : on ne modifie
pas celle d'un collègue.

## Les codes d'accès — un seul code par personne

L'application lit **deux listes**, sans aucun nom :

| Qui | Où est le code | Ce qu'elle voit |
|---|---|---|
| AESH PSR et MELEC | `coordination_edt_aesh_intervenants` — **le code de leur emploi du temps** (champ `section` : `PSR` ou `MELEC`) | les classes de leur secteur (`section` de `roster.json`) |
| Coordination | même collection, document `coordo` | toutes les classes |
| Autres AESH | `coordination_besoins_eleves`, documents `type: "intervenant"` | les classes choisies pour elle (`classes`), sinon toutes |

```js
{ id:"intervenant_1234", type:"intervenant", code:"1234", actif:true, annee:"2026-2027",
  classes:["B2GATL2"],            // facultatif : les classes visibles
  eleves:["Q7K2M", "…"],          // facultatif : codes de suivi mis en avant
  majLe:"<ISO>" }
```

- **Élèves mis en avant** : ceux de `eleves` s'ils sont renseignés, sinon les élèves notifiés.
  Les autres restent visibles, grisés, et peuvent toujours être observés.
- Un document `intervenant` avec `actif:false` ferme l'accès, même pour un code de l'emploi du temps.
- Dans l'emploi du temps, le code est déjà mémorisé (`edt-aesh-code`, même site) : l'onglet
  Observation l'utilise sans le redemander. Aucun code ne passe dans l'adresse.
- Les deux listes sont mises en cache : un code connu ouvre l'application sans réseau.
- Les codes PSR/MELEC se gèrent dans **Coordination PSR MELEC** ; les autres, dans l'Atelier,
  onglet « Codes AESH » d'Observation & besoins, qui affiche tout le monde au même endroit.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | L'application (autonome, aucune dépendance hors Firebase et Google Fonts) |
| `roster.json` | Annuaire des classes — **codes de suivi seuls, aucun nom** |
| `matieres.json` | Matières par classe |

`roster.json` est exporté par l'Atelier de cours : Observation & besoins → « Codes de suivi »
→ « Préparer la liste des téléphones » (fichier `roster-telephones.json`). 19 classes, codes
de suivi à 5 caractères, **jamais les codes de connexion mapse.fr**. La table code de suivi ↔
élève reste sur l'ordinateur de la coordination : elle ne va ni en ligne, ni sur GitHub.
Ne jamais saisir les codes à la main.

## La fiche de présentation (4 pages)

Quand une AESH touche un élève qui a une fiche, elle voit d'abord quatre pages courtes —
**L'élève · Sa classe · Ma mission · Repères** —, puis « Commencer l'observation ». La fiche
n'est montrée d'office qu'une fois par séance (bouton « Passer » pour aller droit au cours) ; elle reste ensuite à portée par le bouton
« Sa présentation » de la fiche de l'élève. Elle est gardée sur le téléphone pour le hors-ligne.

```js
{ id:"fiche_Q7K2M", type:"fiche", code:"Q7K2M", annee:"2026-2027",
  etat:"notifie" | "renouvellement" | "en_cours",
  dispositif:"ULIS + aide humaine", aide:"individualisée" | "mutualisée" | "", heures:"12 h",
  coup:[{i:"horloge", t:"Timer"}],                          // 3 pastilles « d'un coup d'œil »
  enClasse:[{i, t, d}], mission:[{i, t, d}],                 // i = icône, t = titre, d = détail
  obstacles:[{i, t}], appuis:[{i, t}], reperes:[{i, t, d}],  // repères = à savoir (sécurité, emploi du temps)
  majLe:"<ISO>" }
```

Les textes sont rédigés et **validés par la coordination sur son ordinateur** avant d'être mis en
ligne : aucun nom (élève, AESH, établissement), aucune histoire familiale, aucun diagnostic sauf
s'il sert en classe (conduite à tenir). Un contrôle automatique refuse l'envoi sinon.
Une fiche n'a ni `eleveCode` ni `classeNom` : elle n'apparaît jamais parmi les observations.

## Les suggestions des AESH

Depuis l'écran des classes et la fiche d'un élève, « 💡 Une idée pour améliorer l'application ».
Un document par suggestion, sans nom : le texte et le code de l'AESH.

```js
{ id:"suggestion_1234_<horodatage>", type:"suggestion", annee:"2026-2027",
  aeshCode:"1234", texte:"…", date:"2026-09-13", creeLe:"<ISO>", source:"observation-besoins" }
```

La coordination les lit dans l'Atelier, onglet « Suggestions » (prénom de l'AESH en local).

## Revenir en arrière

Le geste « retour » du téléphone ferme d'abord ce qui est ouvert (présentation, feuille), puis
remonte d'un écran ; ✕, « Précédent », « Passer » et Échap font de même. On ne quitte jamais
l'application par erreur au milieu d'une saisie.

## Firestore

Collection dédiée : **`coordination_besoins_eleves`** (projet `devoirs-pse`).
Elle ne se mélange avec aucune autre : ni `psr_observations`, ni `suivi_observations`,
ni `coordination_gevasco`. L'application **lit** aussi `coordination_edt_aesh_intervenants`
(codes de l'emploi du temps), sans jamais y écrire.

Règles publiées (vérifiées le 13/09/2026) :

```
match /coordination_besoins_eleves/{docId} {
  allow read, create, update, delete: if true;
}
match /coordination_edt_aesh_intervenants/{docId} {
  allow read, create, update, delete: if true;
}
```

Si une règle venait à manquer, l'application ne perd rien : les observations sont gardées sur
le téléphone et s'envoient toutes seules dès l'ouverture. Pour vérifier : ouvrir l'application
avec `?diag=1` à la fin de l'adresse.

## Le document écrit

```js
{
  id, annee:"2026-2027", source:"observation-besoins",
  eleveCode:"Q7K2M", classe:"B2 MELEC", classeNom:"B2MELEC",   // code de suivi
  classeLabel:"2de Bac Pro MELEC", section:"MELEC", diplome:"bacpro",
  aeshCode:"1234",                       // code à 4 chiffres, jamais de nom
  date:"2026-09-12", creeLe:"<ISO>",
  type:"activite" | "note" | "progres" | "mission",

  // type "activite" :
  rubrique:"R5", rubriqueTitre:"…", activiteId:"e7", activite:"Suivre des consignes",
  cotation:"A"|"B"|"C"|"D"|"SO",
  obstacles:[…],   // → Cadre 1 de la grille GEVA-Sco
  appuis:[…],      // → Cadre 2 de la grille GEVA-Sco
  jai:"Reformulé", ilA:"Accepté",          // axe 2 : la micro-boucle
  ensuite:"seul"|"moment"|"redem"|"arret"|"nonelo",
  matiere:"", note:"",

  // type "adaptations" : enPlace:[{nom, effet:"aide"|"insuf"|"non"}]  → pages 2 et 6
  // type "mission"     : missions:[…]  → « Missions réalisées par la personne chargée de l'aide humaine »
  // type "progres"     : note          → « Évolutions observées et perspectives »
  // type "note"        : note          → texte libre
}
```

**L'indice d'autonomie** (0-100) se calcule à la lecture, jamais stocké :
la cotation donne la base (A 100, B 74, C 40, D 12) et le « quand on s'éloigne »
l'ajuste (reparti seul +12, un moment +4, a redemandé −6, s'est arrêté −14).
Il sert à **comparer un élève à lui-même dans le temps**, jamais deux élèves entre eux.

Les 32 activités reprennent **mot pour mot** les libellés du formulaire GEVA-Sco
(« Observation des activités de l'élève », pages 4 et 5), en 5 rubriques.

## Les élèves notifiés

Un seul document, coché par la coordination depuis l'Atelier de cours (onglet « Notifications ») :

```js
{ id:"notifications_2026-2027", type:"notifications", annee:"2026-2027",
  codes:{ "Q7K2M": true, "R4T9X": false }, majLe:"…" }
```

Sur le téléphone, dans une classe qui compte au moins un élève mis en avant, ceux-ci passent en premier avec leur étiquette (« notifié », ou « suivi » pour un élève choisi pour l'AESH) ; les autres restent affichés en grisé et peuvent toujours être observés. Une classe sans aucun élève mis en avant s'affiche normalement. Aucun nom : le code et la case, rien d'autre.

## Côté Atelier de cours (Electron)

`EDITEUR/planning-psr/besoins-coordo.js` lit cette collection et reconstitue, pour chaque élève :
la **grille GEVA-Sco pré-remplie** (cotation retenue, Cadre 1, Cadre 2, micro-boucles et notes
citées), le bloc **« besoin réel d'aide humaine »** (indice, évolution, part de fois où l'élève
repart seul, profil par matière), le bloc **« ce qui est déjà en place »**, les missions et les
évolutions. Impression, copie texte prête à coller, export JSON.

**Jamais de classement par AESH.** L'agrégation se fait par élève. Enregistrer ce que
l'AESH a fait produit de la donnée sur sa pratique : si l'équipe se sent évaluée, elle
cessera d'être honnête, et l'outil perdra ce qui fait sa valeur. Les codes y sont résolus en
noms **en local** (table des codes de suivi, fiche de Coordination PSR MELEC pour les AESH) :
aucune donnée nominative ne circule en ligne.

## RGPD

Aucun nom, nulle part en ligne : l'élève est un code de suivi, l'AESH est un code à 4 chiffres.
Le code de suivi n'est pas le code de connexion mapse.fr : aucun endroit en ligne ne relie les deux.
Le code AESH identifie la personne qui observe, pour la coordination — **il ne protège pas l'accès**
(Firebase est lu côté navigateur, sans authentification), exactement comme l'application
d'emploi du temps AESH. La page est en `noindex`.
