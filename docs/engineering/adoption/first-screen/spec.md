# Build a first screen with Yogurt

The owner accepted the first-screen improvements identified against PR #9 at `07aca826`. A person should be able to ask for a product screen without naming a Yogurt control and get a working composition on the installed target. This change follows the existing [adoption specification](../U19D-guide-and-evaluate-skills/spec.md) and [component guidance](../component-usage-guidance/spec.md).

## Requirements

| Requirement | Acceptance |
| --- | --- |
| Discover from the task | In a fresh consumer, resolve the locked SDK, consult a short task map, and resolve the chosen pattern and entries using the existing lookup. An unknown ID points to discovery. A missing or incompatible installation still points to setup and pin diagnostics. |
| Make installation reproducible | The repository, installed SDK and project guide lead from obtaining a compatible pin through installing the plugin, choosing Web or Native and verifying the first screen. Package-relative consumer links resolve after packing. Keep repository-maintainer links in repository documentation. |
| Document setup in the app README | Each adopting app records its SDK source and pin, installation commands for its supported targets, and the matching Codex plugin pin and install commands in its root README. Yogurt's README shows both installations. The consumer guide provides a reusable README example. |
| Teach composition through examples | Maintain decision rules in the installed composition guide. Link to existing settings, collection and conversation recipes. Show hierarchy, actions, narrower layouts, host inputs, relevant states and recovery. Each renderer uses installed public bindings. |
| Observe behavior in a fresh app | Given the same request to search records, open detail and return with the query and selected record preserved, implement the screen in a clean Web consumer and a clean Vercel Native consumer. Exercise initial results, filtering by name or ID, opening and returning, no matches, and recovery. Record renderer, SDK pin, commands and observations. |
| Preserve installed contracts | Retain skill names and public IDs. Keep existing component behavior, agent motion, SDK pins and host-owned data and build responsibilities. The project chooses what it can do. A missing target entry remains an explicit availability gap. |

Run cheap package, resolver and consumer checks before runtime checks. Compare agent behavior on the same plain-language brief when an independent solver is available. Record observed tool use, result, tokens and elapsed time separately from the deterministic renderer evidence. Report any missing observations.

The renderer exercise also checks focus when returning to results and clearing a query. Native SearchField may accept an optional host-controlled autofocus value, with the default unchanged. The consumer checker treats byte-identical installed Zig sources as SDK artifacts and continues checking locally edited files.
