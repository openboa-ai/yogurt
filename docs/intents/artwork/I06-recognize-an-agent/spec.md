# I06 design · Recognize an agent before it moves

Parent: [originating intent, revision 1](intent.md). Review: NOT ACCEPTED. Design revision 1. [Recognize the same company across surfaces](../../../journeys/J1/README.md).

## Requirements

- **I06-U06A.** Keep the 15 distinct rounded silhouettes, Kai’s pinched upper notch and Sol’s shallow lower notch. Each permitted position has a hand-fitted path. Merge visually redundant options before counting them.
- **I06-U06B.** Use the two eyes as one subtle gesture tied to an observed state. Keep the outline, notch and resting identity fixed. Reduced motion conveys the same activity through text and a stable face.

**Constraint.** Fifteen rounded silhouettes form the current set. Three or four sides are a design vocabulary, with only the fitted subset allowed on each silhouette. The art owner approves distinguishable fills and the product owns assignment and activity.

**Design alternative to rule out.** A mathematical combination is counted though its notch clips an eye or disappears at roster size. Random placement makes a returning agent look new. Idle animation suggests work has started.

## Changes and joins

| Change and contract | Proposed writer boundary | Consumer | Independent observer |
| --- | --- | --- | --- |
| [U06A · Assign a stable, visually fitted agent identity](../../../engineering/artwork/U06A-fit-agent-identities/spec.md) | `assets/agents/silhouettes.json` | Rosters and agent detail surfaces | An art reviewer using the actual roster and a registry reader resolving saved assignments |
| [U06B · Express activity with the eyes](../../../engineering/artwork/U06B-express-agent-state/spec.md) | `assets/agents/eye-motion.json` | Agent rows, detail views and conversation attribution | A motion reviewer viewing the same named agent at roster and detail sizes |

The change specifications identify their individual predecessors. The scene below checks their joined behavior.

## Integrated acceptance

Compare the current 45 fitted pairs at actual roster size. The illustrative 45 × 23 yields 1,035 candidates. Count a candidate as usable only after it passes the visual and identity checks.

**End scene.** The same assigned identity retains its outline, fitted notch, fill and name across renders. Kai and Sol retain their original gestures. A working state remains legible with motion reduced.

**Current sources and open decisions.** [silhouettes.json](../../../../assets/agents/silhouettes.json) · [kai.svg](../../../../assets/agents/kai.svg) · [sol.svg](../../../../assets/agents/sol.svg) · [eye-motion.json](../../../../assets/agents/eye-motion.json) · [Agent motion](../../../../library.html#motion) · [Delivery status and owner decisions](../../../status.md)
