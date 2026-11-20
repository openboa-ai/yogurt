# I12 · Inspect only what is available about this record

Status: DRAFT, revision 1. Decision owner: OpenBoa design-system owner with the product patterns maintainer. Source: [product intent, revision 1](../../../intent.md). [Paired specification](spec.md) · [Read a partial Sourdough record](../../../journeys/J3/README.md).

## Need

A Board Client reader opens a record with partial coverage. They need its source and age, and should see the correct state if access changes while the detail is open.

## Success and counterexample

**Success.** A stale, authorized record shows its original as-of time and missing fields. Revocation immediately clears its facts from the detail and accessibility tree.

**Convincing failure.** A refreshed shell gives older values a new timestamp, “unknown” becomes zero, or a previous account’s detail remains visible after an access switch.

## Limits

Bind pattern.inspect-record to the product’s authorized projection. The product owns credentials, access, revision and coverage. The pattern reads facts and offers only supported recovery.

[patterns.json](../../../../catalog/patterns.json) · [Product fixtures](../../../../examples/project-use/scenarios.json) · [Product playbook](../../../../playbook.html)
