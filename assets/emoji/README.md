# OpenBoa emoji

The collection contains 3,831 OpenBoa drawings across eight non-food groups. Each entry has an editable SVG and a transparent 128 × 128 PNG. The three food-project identities have their own masters. [Browse the collection](https://yogurt-theta.vercel.app/emoji.html) · [Machine-readable catalog](catalog.json) · [Project emoji](../projects/emoji.json)

## Choose a file

Search the gallery by English name, character or code point. Check the drawing at 16, 24 or 32 px on a light or ink surface. Copy the character to send Unicode text. Download its image to carry the OpenBoa drawing into a client.

Use SVG for scalable interfaces and PNG for messaging or other image-only clients. Keep every part of the catalog ID when building a path, including variation selectors, skin modifiers and joiners. Each SVG has its English name in an accessible title. Supply a localized description when the image stands alone and an empty alt attribute when an adjacent label gives the same meaning. [Rocket SVG](svg/1f680.svg) · [Rocket PNG](png/1f680.png)

## Face finishes

The 104 expressions with a face-color control have two finishes. Bright yellow uses `yellow.250` (#FFDC63). Soft peach uses `orange.200` (#FFD0AB). Both versions share the same contour, eyes and mouth. The catalog lists `peach` in the entry’s `variants` array. A Unicode skin modifier describes the person or gesture and is encoded separately in its sequence ID. [Bright yellow](svg/1f60a.svg) · [Soft peach SVG](variants/peach/svg/1f60a.svg) · [Soft peach PNG](variants/peach/png/1f60a.png)

## Draw at the size people use

Start from the feature a reader needs to recognize. A fire engine carries its ladder high above the cab. A guide dog wears a raised harness handle. Its service-dog counterpart wears a fitted vest. For expressions, keep enough space around the hands to show which feature they cover. A shallow notch can follow a natural break in the contour. Give the outline and the signifying detail room before adding texture.

Use the shared numbered palette for every visible fill and stroke. The default flame pairs `orange.500` with `yellow.250`. Each part of an expression or skin-tone sequence carries its own color binding. Use a larger drawing when a flag inscription or an emblem’s smallest detail must be read. [Shared color tokens](../../tokens/brand.json) · [Editable source sheet](source/originals.svg)

## Source and repertoire

The source sheet contains one symbol per catalog ID in the inventory order. Related sequences share drawing conventions for direction, complexion and pose. National and territorial flags follow their identifying patterns. The catalog includes all 3,813 fully qualified non-food sequences in Unicode Emoji 17.0 and 18 additional entries from the Emoji 18 draft captured on April 30, 2026. The `repertoire` field identifies those entries. [Local sequence inventory](source/sequences.tsv)

OpenBoa drew the artwork. The names, groups and sequence data come from Unicode, Inc. under the Unicode License v3. [Unicode 17 data](https://www.unicode.org/Public/17.0.0/emoji/emoji-test.txt) · [Unicode emoji data](https://www.unicode.org/Public/emoji/latest/emoji-test.txt) · [Included Unicode notice](notices/unicode.txt)

## Rebuild from the kit

Edit the symbol in the source sheet. Its `data-fill` and `data-stroke` attributes refer to the shared palette. From the yogurt root run the commands below to export the SVGs, both catalog indexes and all transparent PNGs. The vector exporter uses the Python standard library. The rasterizer uses Node.js with Sharp installed.

```sh
python3 scripts/build-general-emoji.py
node scripts/rasterize-emoji.cjs
```

Open `emoji.html` directly from disk to review the result.
