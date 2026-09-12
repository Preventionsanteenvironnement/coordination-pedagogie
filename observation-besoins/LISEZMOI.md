# Observation & besoins des élèves — module AESH

Application mobile destinée à **toutes les AESH de l'établissement**, sur **toutes les classes**.
Elle récolte au fil de l'année la matière des deux cadres de commentaires de la grille
**GEVA-Sco** — « Obstacles à la réalisation de l'activité » et « Points d'appui » — pour que
la grille officielle soit remplie à partir d'observations réelles, et non de souvenirs.

À ne pas confondre avec `observation/` et `observation-suivi/`, qui sont l'outil d'autonomie
de la **coordination PSR MELEC** et restent inchangés.

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

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | L'application (autonome, aucune dépendance hors Firebase et Google Fonts) |
| `roster.json` | Annuaire des classes — **codes élèves seuls, aucun nom** |
| `matieres.json` | Matières par classe — copie de celui de `observation-suivi/` |

`roster.json` est dérivé de `codes_eleves_mapse_2026-2027.json` (Suite PSE) :
19 classes, 140 codes, format 2 lettres + 2 chiffres. Ce sont les mêmes codes que sur les
documents distribués aux élèves. Pour le régénérer après un changement d'effectif, repartir
de ce fichier source — jamais saisir les codes à la main.

## Firestore

Collection dédiée : **`coordination_besoins_eleves`** (projet `devoirs-pse`).
Elle ne se mélange avec aucune autre : ni `psr_observations`, ni `suivi_observations`,
ni `coordination_gevasco`.

⚠️ **Une règle doit être publiée avant que les observations partent en ligne.** Les règles du
projet nomment les collections une par une : tant que celle-ci n'y figure pas, lectures et
écritures sont refusées. L'application le gère sans rien perdre — les observations sont
gardées sur le téléphone et s'envoient toutes seules dès l'ouverture — mais elles n'arrivent
pas dans la Suite PSE.

Console Firebase → projet `devoirs-pse` → Firestore Database → Règles, ajouter :

```
match /coordination_besoins_eleves/{docId} {
  allow read: if true;                       // l'AESH relit le journal de l'élève
  allow create: if true;                     // l'AESH dépose sans compte
  allow update, delete: if request.auth != null;
}
```

Puis **Publier**. Pour vérifier : ouvrir l'application avec `?diag=1` à la fin de l'adresse —
le bandeau d'état disparaît quand l'espace est ouvert.

## Le document écrit

```js
{
  id, annee:"2026-2027", source:"observation-besoins",
  eleveCode:"AV63", classe:"B2 MELEC", classeNom:"B2MELEC",
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

## Côté Suite PSE (Electron)

`EDITEUR/besoins-eleves.html` + `EDITEUR/planning-psr/besoins-coordo.js` lisent cette
collection et reconstituent, pour chaque élève : la **grille GEVA-Sco pré-remplie**
(cotation retenue, Cadre 1, Cadre 2, micro-boucles et notes citées), le bloc **« besoin
réel d'aide humaine »** (indice, évolution, part de fois où l'élève repart seul, profil par
matière), le bloc **« ce qui est déjà en place »**, les missions et les évolutions. Impression,
copie texte prête à coller, export JSON.

**Jamais de classement par AESH.** L'agrégation se fait par élève. Enregistrer ce que
l'AESH a fait produit de la donnée sur sa pratique : si l'équipe se sent évaluée, elle
cessera d'être honnête, et l'outil perdra ce qui fait sa valeur. Les codes y sont résolus en noms **en local** (`studentCodesAPI`) : aucune
donnée nominative ne circule en ligne.

## RGPD

Aucun nom, nulle part en ligne : l'élève est un code, l'AESH est un code à 4 chiffres.
Ce code identifie la personne qui observe, pour la coordination — **il ne protège pas l'accès**
(Firebase est lu côté navigateur, sans authentification), exactement comme l'application
d'emploi du temps AESH. La page est en `noindex`.
