# I05 · Recognize the right artwork at message size

Status: DRAFT, revision 1. Decision owner: OpenBoa design-system owner with the artwork and agents maintainer. Source: [product intent, revision 1](../../../intent.md). [Paired specification](spec.md) · [Recognize the same company across surfaces](../../../journeys/J1/README.md).

## Need

Someone adding a project to a release note needs its food mark. Someone labeling a command needs a functional icon. A person writing a message needs a recognizable emoji.

## Success and counterexample

**Success.** At 16, 24 and 32 px a reader distinguishes the yogurt cup, scored loaf and peppered meatball. A search by name or full Unicode sequence returns the matching original drawing and accessible name.

**Convincing failure.** The meatball grows a stick, a background-colored patch poses as the notch, or a general emoji silently drops a skin modifier when exported.

## Limits

The original project masters, single contour notch and accepted face finishes are selected. The art owner curates additional drawings. The functional icon owner specifies semantics and accessible labels.

[emoji.json](../../../../design/assets/projects/emoji.json) · [README.md](../../../../design/assets/emoji/README.md) · [catalog.json](../../../../design/assets/emoji/catalog.json) · [Project emoji](https://yogurt-theta.vercel.app/library.html#emoji) · [search.svg](../../../../design/assets/icons/search.svg)
