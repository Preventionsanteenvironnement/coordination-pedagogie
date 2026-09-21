#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fabrique capa/donnees-capa.json a partir de la bibliotheque CAPa de l'Atelier.

Source lue (jamais modifiee) :
    ~/Documents/Éditeur PSE/Bibliothèques/capa_bibliotheque.json

A relancer apres chaque modification d'un cours CAPa :
    python3 capa/generer-donnees.py

Les reponses deja donnees par les collegues sont conservees : elles sont
rangees sous la cle "module/cours/seance", qui ne change pas tant que le
code du cours et le numero de la seance ne changent pas.
"""

import json, os, datetime, unicodedata

BIBLIO = os.path.expanduser("~/Documents/Éditeur PSE/Bibliothèques/capa_bibliotheque.json")
SORTIE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "donnees-capa.json")

# Nom lisible de chaque module, et ordre d'affichage.
MODULES = [
    ("SESG", "SESG — Consommateur averti et budget",
     "Module MG1 · capacité CG1.2 · CCF2 (écrit)"),
    ("ESC", "ESC — Identité sociale et culturelle",
     "Module MG1 · capacité CG1.1 · CCF1 (oral)"),
    ("BIO", "Biologie — Le corps et la santé au travail",
     "Module MG1 · capacité CG1.3 · CCF4 (oral)"),
    ("MP1 · Insertion", "MP1 — Insertion dans le monde du travail",
     "Module professionnel · CCF6 (dossier)"),
]


def texte(v):
    return (v or "").strip()


def lire_cours(entree):
    """Retourne les seances d'un cours, chacune avec ses notions."""
    blocs = entree.get("cours", {}).get("blocks", [])
    seances, en_attente, objectif_general = [], [], ""
    for b in blocs:
        t = b.get("type")
        d = b.get("data", {}) or {}
        if t == "entete":
            objectif_general = texte(d.get("objectif_general"))
        elif t == "seance":
            seances.append({
                "num": texte(d.get("numero")) or str(len(seances) + 1),
                "titre": texte(d.get("titre")),
                "objectif": texte(d.get("objectif")),
                "notions": [],
            })
        elif t == "notions":
            items = [
                {"n": texte(i.get("notion")), "d": texte(i.get("definition"))}
                for i in (d.get("items") or []) if texte(i.get("notion"))
            ]
            if seances:
                seances[-1]["notions"].extend(items)
            else:
                en_attente.extend(items)
    return seances, en_attente, objectif_general


def repartir(seances, restantes):
    """
    Un bloc de notions se rattache a la derniere seance rencontree.
    Quand un cours a moins de blocs que de seances, les notions couvrent en
    realite plusieurs seances : on les remonte alors au niveau du cours,
    pour ne pas les afficher sous une seule seance au hasard.
    """
    vides = [s for s in seances if not s["notions"]]
    if vides and len(seances) > 1:
        communes = list(restantes)
        for s in seances:
            communes.extend(s["notions"])
            s["notions"] = []
        return communes
    return list(restantes)


def main():
    biblio = json.load(open(BIBLIO, encoding="utf-8"))
    par_module = {code: [] for code, _, _ in MODULES}
    inconnus = []

    for entree in biblio:
        mod = texte(entree.get("module"))
        seances, en_attente, objectif_general = lire_cours(entree)
        notions_cours = repartir(seances, en_attente)
        cours = {
            "code": texte(entree.get("code")),
            "titre": texte(entree.get("titre")),
            "objectif": objectif_general,
            "capacite": texte(entree.get("capacite")),
            "ccf": texte(entree.get("ccf")),
            "notions_cours": notions_cours,
            "seances": seances,
        }
        if mod in par_module:
            par_module[mod].append(cours)
        else:
            inconnus.append((mod, cours))

    if inconnus:
        raise SystemExit(
            "Module inconnu dans la bibliotheque : "
            + ", ".join(sorted({m for m, _ in inconnus}))
            + "\nAjouter ce module dans la liste MODULES de ce script."
        )

    modules = [
        {"code": code, "nom": nom, "cadre": cadre, "cours": par_module[code]}
        for code, nom, cadre in MODULES if par_module[code]
    ]

    nb_seances = sum(len(c["seances"]) for m in modules for c in m["cours"])
    nb_notions = sum(
        len(c["notions_cours"]) + sum(len(s["notions"]) for s in c["seances"])
        for m in modules for c in m["cours"]
    )

    sortie = {
        "genere_le": datetime.date.today().isoformat(),
        "source": "capa_bibliotheque.json",
        "totaux": {
            "cours": sum(len(m["cours"]) for m in modules),
            "seances": nb_seances,
            "notions": nb_notions,
        },
        "modules": modules,
    }

    with open(SORTIE, "w", encoding="utf-8") as f:
        json.dump(sortie, f, ensure_ascii=False, indent=1)

    print("Ecrit :", SORTIE)
    print("  {cours} cours · {seances} seances · {notions} notions".format(**sortie["totaux"]))
    for m in modules:
        print("   - {:16} {:2} cours · {:2} seances".format(
            m["code"], len(m["cours"]), sum(len(c["seances"]) for c in m["cours"])))


if __name__ == "__main__":
    main()
