"""Generate Native's static font instances from the shared type roles."""

import json
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parents[2]
MASTER = ROOT / "design/assets/fonts/rethink-sans/rethink-sans.ttf"
NATIVE = ROOT / "packages/native/controls"
brand = json.loads((ROOT / "design/tokens/brand.json").read_text())
weights = brand["type"]["roleWeight"]

for role, filename in {
    "body": "rethink-sans.ttf",
    "ui": "rethink-sans-medium.ttf",
}.items():
    with TTFont(MASTER, recalcTimestamp=False) as font:
        static_font = instantiateVariableFont(font, {"wght": weights[role]}, inplace=True)
        weight = weights[role]
        family = f"Rethink Sans Yogurt {weight}"
        names = {1: family, 2: "Regular", 4: family, 6: f"RethinkSans-Yogurt{weight}", 16: family, 17: "Regular"}
        for record in static_font["name"].names:
            if record.nameID in names:
                record.string = names[record.nameID]
        static_font.save(NATIVE / filename)
