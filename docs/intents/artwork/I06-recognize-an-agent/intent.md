# I06 · Recognize an agent before it moves

Status: DRAFT, revision 1. Decision owner: OpenBoa design-system owner with the artwork and agents maintainer. Source: [product intent, revision 1](../../../intent.md). [Paired specification](spec.md) · [Recognize the same company across surfaces](../../../journeys/J1/README.md).

## Need

A roster shows many named agents in a small space. A reader should recognize a returning identity even when color cues or animation are unavailable.

## Success and counterexample

**Success.** The same assigned identity retains its outline, fitted notch, fill and name across renders. Kai and Sol retain their original gestures. A working state remains legible with motion reduced.

**Convincing failure.** A mathematical combination is counted though its notch clips an eye or disappears at roster size. Random placement makes a returning agent look new. Idle animation suggests work has started.

## Limits

Fifteen rounded silhouettes form the current set. Three or four sides are a design vocabulary, with only the fitted subset allowed on each silhouette. The art owner approves distinguishable fills and the product owns assignment and activity.

[silhouettes.json](../../../../design/assets/agents/silhouettes.json) · [kai.svg](../../../../design/assets/agents/kai.svg) · [sol.svg](../../../../design/assets/agents/sol.svg) · [eye-motion.json](../../../../design/assets/agents/eye-motion.json) · [Agent motion](https://yogurt-theta.vercel.app/library.html#motion)
