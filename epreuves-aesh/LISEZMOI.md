# Besoin AESH pour une épreuve

Page en ligne pour les enseignants (01/10/2026). Elle reprend la fiche du lycée « Organisation des CCF — informations et demande d'aide humaine » (bureau DDF + coordination PIAL). Elle est rangée dans la rubrique **Espace AESH** du portail (`data.js`).

## Parcours (une seule page)
1. **Matière** : la liste des matières de l'emploi du temps (`../referents-aesh/edt-lycee.json`), ou « Autre » à écrire.
2. **Classe(s)** : les 19 classes, rangées par pôle. Les classes qui ont la matière à l'emploi du temps sont signalées. Pour chaque classe choisie :
   - le diplôme est déduit du nom de la classe (modifiable) ;
   - **des nombres seulement**, lus dans `coordination_referents_aesh / eleves_<CLASSE>_<année>` : élèves suivis, notifiés, notification en cours, PPS, PAP, ULIS, AESH individuelle ou mutualisée, puis les aménagements d'épreuve (⅓ temps, lecteur, scripteur, assistant, ordinateur, sujet agrandi, salle à part, dispense) ;
   - une **proposition** d'AESH : un élève avec lecteur, scripteur ou assistant compte pour une AESH. L'enseignant choisit lui-même le nombre à chaque séance.
3. **Épreuve** : nature (CCF, CCF blanc, bac blanc, évaluation, sortie, autre à écrire), forme (écrit, oral, pratique, autre à écrire), intitulé.
4. **Séances** : autant que nécessaire, pour une ou plusieurs classes.
   - Dès que la date est saisie, le créneau du cours de cette matière ce jour-là est repris : il tient compte des semaines A/B, du semestre et des vacances, grâce à `../referents-aesh/calculs.js`.
   - Durée de l'épreuve. Si des élèves ont un ⅓ temps, la page propose une fin qui l'inclut. Toute heure reste modifiable.
   - Alertes : week-end, vacances ou férié, PFMP de la classe, date passée.
5. **Compléments** : observations, autre demande.

L'enseignant ne coche **aucun** aménagement : ils viennent de la base de la coordination. **Aucun nom** n'apparaît, ni élève, ni enseignant, ni AESH.

## Données
- **Lu** : `coordination_referents_aesh / eleves_<CLASSE>_<année>`, en lecture publique, déjà autorisée par les règles.
- **Écrit** : `coordination_demandes_aesh / epreuve_<id>`, en création seule. Champs : `id, type:'epreuve', annee, matiere, nature, natureAutre, forme, formeAutre, intitule, classes[{classe, diplome, comptes}], seances[{classe, date, debut, fin, duree, tiersTemps, salle, nbAesh, nbPropose}], observations, autreDemande, statut:'nouvelle', reponse, creeLe, majLe, source:'epreuves-aesh'`.
- Si l'envoi échoue (hors ligne, règle pas encore publiée), la demande est gardée sur l'appareil (`localStorage` `epreuves-aesh-brouillon-v1`). Elle est proposée de nouveau à la visite suivante.
- **Lecture côté coordination** : Atelier › Coordination › Tableau AESH › 📝 Épreuves. La lecture se fait sur clic seulement, jamais d'écriture.

## Règle Firestore à ajouter (console, projet coordination-pedagogie)
Dans `match /coordination_demandes_aesh/{docId} { … }`, **ajouter** ce bloc, sans rien retirer :

```
      // Besoin AESH pour une épreuve (coordination-pedagogie/epreuves-aesh/) : des NOMBRES, aucun nom
      allow create: if docId.matches('epreuve_[a-z0-9]{8,24}')
                    && request.resource.data.type == 'epreuve'
                    && request.resource.data.id == docId
                    && request.resource.data.annee is string
                    && request.resource.data.statut == 'nouvelle'
                    && request.resource.data.seances is list
                    && request.resource.data.seances.size() >= 1
                    && request.resource.data.seances.size() <= 40
                    && request.resource.data.classes is list
                    && request.resource.data.classes.size() <= 19
                    && request.resource.data.observations is string
                    && request.resource.data.observations.size() <= 600
                    && request.resource.data.autreDemande is string
                    && request.resource.data.autreDemande.size() <= 600
                    && request.resource.data.keys().hasOnly(['id','type','annee','matiere','nature','natureAutre','forme','formeAutre',
                         'intitule','classes','seances','observations','autreDemande','statut','reponse','creeLe','majLe','source']);
```

Pour que la coordination puisse plus tard répondre à ces demandes (statut, réponse), on remplacera dans la règle `update` existante `['demande','regulier']` par `['demande','regulier','epreuve']`. Ce n'est pas nécessaire pour la première mise en service.

## Tests
Banc Electron hors dépôt, avec données fictives et faux Firestore : 15/15. Il couvre :
- les nombres sans code ;
- la proposition d'AESH ;
- le créneau repris (mardi 8h30–9h30, lundi 17h–18h) ;
- le tiers temps (fin à 9h50) ;
- l'alerte vacances ;
- la fin modifiable ;
- le refus Firestore, avec demande gardée puis renvoyée ;
- un seul document écrit, sans aucun code élève.

## 02/10/2026 — Sorties et autres mobilisations (candidate locale)

Accord utilisateur « ok vas y », après validation du formulaire et des deux réponses AESH.
À la même adresse, les boutons Épreuve / CCF, Sortie, Autre besoin sélectionnent deux parcours indépendants. Le parcours d'épreuves et sa construction de document sont conservés. `sorties.mjs` apporte le parcours simple : matière/prénom, objet, classes regroupées ou séparées, estimation corrigible, enseignants, autres adultes, AESH souhaitées au total, date/horaire complet, lieu/transport et commentaire.

Les regroupements sont ceux de `CHOIX_CLASSES` existant (AGORA/GATL 1+2, Vannerie 1re+2e année, classes individuelles). L'estimation additionne une fois chaque classe et lit les documents anonymes `classe_<CLASSE>_<année>` publiés depuis les fiches Classes–élèves d'Atelier. Aucun dossier nominal local n'est transmis au site. Donnée manquante : à préciser, sans empêcher la saisie. Une correction de participants ne modifie pas l'effectif de la classe ni les besoins individuels.

La demande garde `type:'epreuve'`, `nature:'sortie'` (ou autre) et la collection `coordination_demandes_aesh` du projet réellement configuré `coordination-pedagogie`. Champs de premier niveau inchangés ; métadonnées pratiques ajoutées dans la séance (`mobilisation`, `transport`, `transportAutre`, `enseignants`, `autresAdultes`, `effectifPrevu`) et les comptes du groupe. Un seul créneau couvre toutes les classes pour éviter de demander plusieurs fois les mêmes AESH. Préparation conservée sur l'appareil avec une clé distincte ; répétition après erreur d'envoi reprend le même identifiant.

Réponse AESH : prénom, participation déjà convenue / disponible / non disponible ; commentaire facultatif. Disponibilité sur toute la plage obligatoire dans le libellé. La réponse garde `dispo:'oui'` pour les deux situations positives, avec `participation:'convenue'|'disponible'` et `engagementComplet`. Une réponse positive n'affecte pas automatiquement le planning. Les anciennes épreuves gardent Disponible / Sous réserve / Pas disponible et leur format de réponse.

Tests fictifs isolés : regroupements/déduplication, estimation absente, correction, dates invalides, horaires, échec d'envoi/reprise, envoi unique, maintien des épreuves et anciennes réponses, deux statuts nouveaux, largeur 390 px, absence d'erreurs JS. Aperçus inspectés. Aucun nom d'élève dans les tests, aucune écriture Firestore, aucune règle changée, aucun commit/push/déploiement. Vérification des règles actives et essai d'envoi réel restant à faire après autorisation distincte. Les effectifs en ligne restent ceux du dernier envoi confirmé des fiches ; pas de publication automatique.
