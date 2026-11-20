"""Export the OpenBoa SVG collection and offline indexes from the local original artwork."""
import argparse
import copy
import csv
import json
import os
from pathlib import Path
import tempfile
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]
KIT = ROOT / "assets" / "emoji"
SOURCE = KIT / "source"
NS = "http://www.w3.org/2000/svg"
ET.register_namespace("", NS)


def paint_original(symbol, palette):
    root = ET.Element(f"{{{NS}}}svg", {"viewBox": symbol.attrib["viewBox"]})
    root.extend(copy.deepcopy(list(symbol)))
    for node in root.iter():
        for channel in ("fill", "stroke"):
            name = node.get("data-" + channel)
            if name:
                family, step = name.rsplit(".", 1)
                node.set(channel, palette[family][step])
            elif node.get(channel) not in (None, "none"):
                raise ValueError(f"Unbound {channel} in {symbol.get('id')}")
    return root


def write_if_changed(path, content):
    if path.is_file() and path.read_bytes() == content:
        return
    with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as temp:
        temp.write(content)
        temporary = Path(temp.name)
    try:
        temporary.chmod(0o644)
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def export():
    palette = json.loads((ROOT / "tokens" / "brand.json").read_text())["color"]
    symbols = list(ET.parse(SOURCE / "originals.svg").iter(f"{{{NS}}}symbol"))
    originals = {}
    for symbol in symbols:
        prefix, divider, key = symbol.attrib["id"].partition("-")
        if not divider or prefix not in {"e", "u"}:
            raise ValueError(f"Invalid original symbol ID {symbol.attrib['id']}")
        originals[key] = symbol
    with (SOURCE / "sequences.tsv").open(encoding="utf-8") as source:
        sequences = list(csv.DictReader(source, delimiter="\t"))
    keys = {row["id"] for row in sequences}
    if len(originals) != len(symbols) or len(keys) != len(sequences) or keys != originals.keys():
        raise ValueError("The original sheet must contain exactly one master for each Unicode sequence.")

    drawings = {}
    peach_drawings = {}
    catalog = []
    for item in sequences:
        key = item["id"]
        root = paint_original(originals[key], palette)
        root.set("role", "img")
        root.set("aria-label", item["name"])
        title = ET.Element(f"{{{NS}}}title")
        title.text = item["name"]
        root.insert(0, title)
        drawings[key] = ET.tostring(root, encoding="utf-8") + b"\n"
        entry = {**item, "origin": "OpenBoa"}
        face_parts = [node for node in root.iter() if node.get("data-face-base") == "true"]
        if face_parts:
            for node in face_parts:
                if node.get("data-fill") != "yellow.250":
                    raise ValueError(f"Expected the approved yellow face in {key}")
                node.set("data-fill", "orange.200")
                node.set("fill", palette["orange"]["200"])
            peach_drawings[key] = ET.tostring(root, encoding="utf-8") + b"\n"
            entry["variants"] = ["peach"]
        catalog.append(entry)

    variants = KIT / "variants" / "peach" / "svg"
    for directory, artwork in ((KIT / "svg", drawings), (variants, peach_drawings)):
        directory.mkdir(parents=True, exist_ok=True)
        for key, data in artwork.items():
            write_if_changed(directory / (key + ".svg"), data)
        for previous in directory.glob("*.svg"):
            if previous.stem not in artwork:
                previous.unlink()

    collection = {
        "unicode": "17.0", "preview": "18.0",
        "groups": list(dict.fromkeys(row["group"] for row in catalog)), "items": catalog,
    }
    raw = json.dumps(collection, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    write_if_changed(KIT / "catalog.json", raw + b"\n")
    # The classic script lets the full catalog run directly from file://.
    write_if_changed(KIT / "catalog-data.js", b"window.yogurtEmojiCatalog = " + raw + b";\n")
    print(f"{len(drawings)} original SVGs and {len(peach_drawings)} soft-peach expressions.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    # Original callers may still supply the source archive used by previous editions.
    parser.add_argument("legacy_archive", nargs="?", help=argparse.SUPPRESS)
    parser.parse_args()
    export()
