# Coordination PSR — Planning

Application de coordination des emplois du temps des sections **PSR & MELEC** :
classes, AESH, gestion **Semaine A / Semaine B**, affectation des AESH par glisser-déposer,
périodes (PFMP) & événements, et détection automatique des incohérences.

Deux espaces dans un seul outil :
- **Espace intervenant** (public, lecture seule) : ce que voit l'AESH — son emploi du temps et celui de sa classe.
- **Espace coordination** (privé) : l'éditeur complet, déverrouillé par une clé (voir ci-dessous).

> RGPD : aucune donnée personnelle dans les fichiers publiés (établissement retiré, enseignants en initiales, AESH en sigles). Les vrais noms, si besoin, restent en local sur votre appareil.

## Lancer l'application

### Le plus simple : double-clic sur `index.html`

Ouvrez le dossier `planning-psr` et **double-cliquez sur `index.html`**.
L'application s'ouvre directement dans votre navigateur. C'est tout.

> ✅ Fonctionne en `file://` car les scripts sont en mode « classique » (fichier `app.js`).
> Plus d'erreur « Origin null ».

### Variante avec auto-sauvegarde garantie (serveur local)

En `file://`, certains navigateurs limitent l'enregistrement automatique. Pour une
sauvegarde automatique 100 % fiable entre deux sessions, lancez via un petit serveur :
double-cliquez **`Lancer le planning PSR.command`** (à côté des PDF), ou en terminal :

```bash
cd "/Users/brahms/Documents/Coordination PSR melec/planning-psr"
python3 -m http.server 8777   # puis ouvrir http://localhost:8777
```

> Dans tous les cas, le bouton **Exporter (.json)** reste votre sauvegarde de référence.

## Modifier le code

Le code source modulaire est dans `src/` (référence pour le développement).
Après toute modification de `src/`, régénérez le fichier chargé par le navigateur :

```bash
cd "/Users/brahms/Documents/Coordination PSR melec/planning-psr"
python3 build.py     # régénère app.js à partir de src/
```

## Accès coordination (clé)

Par défaut, l'outil s'ouvre en **espace intervenant** (lecture seule). Pour ouvrir l'**éditeur** :
- bouton **« Accès coordination »** (en bas de la barre latérale) → saisir la clé ;
- ou via l'URL : `index.html?admin=LACLÉ`.

L'accès est mémorisé sur l'appareil. Bouton **« Verrouiller l'éditeur »** pour revenir en lecture seule.

> ⚠️ Avant publication : changez la clé `ADMIN_KEY` en haut de `src/main.js` (puis `python3 build.py`).
> C'est un garde-fou d'interface, pas une sécurité serveur (celle-ci viendra des règles Firestore).

## Sauvegarde

- Les données sont **enregistrées automatiquement dans le navigateur** (localStorage).
- Bouton **Exporter** → un fichier `.json` = ta sauvegarde de l'année (à archiver / transférer).
- Bouton **Importer** → recharger une sauvegarde.
- Paramètres → **Réinitialiser** = revenir à la base de départ.

## Structure du dossier

```
index.html              Point d'entrée (+ import map des libs locales)
vendor/                 Preact + htm (embarqués, fonctionnent hors-ligne)
styles/                 Système de design (tokens, base, layout, composants)
src/
  main.js               Coquille (sidebar, topbar, toasts) + montage
  router.js             Routeur par hash (#/…)
  store.js              État global + persistance navigateur + undo
  data/
    constants.js        Jours, créneaux, disciplines, dispositifs
    seed.js             DONNÉES de départ (C1/C2 PSR + 4 AESH) — modifiables
  lib/
    selectors.js        Calculs d'heures, couverture, conflits
    alerts.js           Moteur d'alertes (incohérences)
    io.js               Export / import JSON
  components/           Grille EDT, palette AESH, icônes, jauges
  pages/                Tableau de bord, Classe, Intervenant, Affectation, Paramètres
```

## Mettre en ligne plus tard

Le dossier est 100 % statique : il se publie tel quel sur n'importe quel hébergement
(Netlify, GitHub Pages, un simple serveur web). Rien à compiler.
