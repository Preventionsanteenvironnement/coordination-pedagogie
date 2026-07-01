#!/usr/bin/env python3
"""Assembleur sans dépendance : regroupe les modules ES de src/ en un seul
fichier classique app.js, ouvrable directement en file:// (double-clic).

Le code source dans src/ reste la référence (modulaire) pour le développement.
Relancer ce script après chaque modification :  python3 build.py
"""
import re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "src"

# Ordre de concaténation = ordre des dépendances (les données d'abord).
ORDER = [
    "data/constants.js",
    "data/seed.js",
    "store.js",
    "lib/selectors.js",
    "lib/alerts.js",
    "lib/week.js",
    "lib/calendar.js",
    "lib/ics.js",
    "lib/firebase.js",
    "lib/io.js",
    "components/shared.js",
    "components/icons.js",
    "components/WeekControl.js",
    "components/ScheduleGrid.js",
    "components/SeanceModal.js",
    "components/EvenementModal.js",
    "components/AeshPalette.js",
    "components/AeshScheduleEditor.js",
    "components/SlotInspector.js",
    "pages/Dashboard.js",
    "pages/ClasseView.js",
    "pages/IntervenantView.js",
    "pages/AffectationView.js",
    "pages/ConsultationView.js",
    "pages/EvenementsView.js",
    "pages/MessagesView.js",
    "pages/ContactView.js",
    "pages/ParametresView.js",
    "router.js",
    "main.js",
]

IMPORT_RE = re.compile(r"^\s*import\b.*$", re.M)
EXPORT_DEFAULT_RE = re.compile(r"^(\s*)export\s+default\s+", re.M)
EXPORT_RE = re.compile(r"^(\s*)export\s+", re.M)


def strip(code: str) -> str:
    code = IMPORT_RE.sub("", code)
    code = EXPORT_DEFAULT_RE.sub(r"\1", code)
    code = EXPORT_RE.sub(r"\1", code)
    return code


parts = [
    "// ============================================================",
    "// app.js — FICHIER GÉNÉRÉ automatiquement par build.py.",
    "// Ne pas éditer à la main : modifier src/ puis relancer build.py.",
    "// ============================================================",
    "(function () {",
    '"use strict";',
    "const { h, render, Fragment } = preact;",
    "const { useState, useEffect, useMemo, useRef, useCallback, useReducer } = preactHooks;",
    "const html = htm.bind(h);",
    "",
]

for rel in ORDER:
    src = (SRC / rel).read_text(encoding="utf-8")
    parts.append(f"// ───── {rel} ─────")
    parts.append(strip(src))
    parts.append("")

parts.append("})();")

# Garde-fou : les déclarations top-level partagent une même portée dans le bundle.
# On détecte les collisions de noms (const/let/function en début de ligne) entre modules.
DECL_RE = re.compile(r"^(?:export\s+)?(?:const|let|var|function)\s+([\w$]+)", re.M)
seen = {}
collisions = []
for rel in ORDER:
    src = (SRC / rel).read_text(encoding="utf-8")
    for name in DECL_RE.findall(src):
        if name in seen and seen[name] != rel:
            collisions.append(f"  ⚠️  '{name}' déclaré dans {seen[name]} ET {rel}")
        seen.setdefault(name, rel)
if collisions:
    print("COLLISIONS de noms top-level (casseraient le bundle) :")
    print("\n".join(collisions))
    raise SystemExit(1)

out = "\n".join(parts)
(ROOT / "app.js").write_text(out, encoding="utf-8")
print(f"app.js généré : {len(out):,} octets, {len(ORDER)} modules.")
