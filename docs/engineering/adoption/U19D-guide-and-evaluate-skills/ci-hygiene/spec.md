# Preserve text hygiene and full-history scanning during source import

Approved as a follow-up to [the Yogurt adoption plan](../spec.md) for PR #3. The target is the source-import workflow at `f0750d5`.

The workflow currently forces Git to treat every changed path as text before checking line endings. This surfaces irrelevant whitespace findings in binary assets. Change only the runtime diff attributes used by the repository workflow. For changed-line whitespace checks, reset the diff attribute in the trusted checkout metadata so Git classifies content itself. Keep the same whitespace rules, merge base, expected head, and exit status. A repository-provided diff driver or filename extension cannot exempt text.

Before secret scanning, force text diffs in the same trusted metadata as before. Keep both scans, the pinned tool and configuration, redaction, reachable history and working tree coverage unchanged. Keep asset and SDK bytes unchanged. The code owner reviews the updated workflow on the exact PR head. Failed required checks or an outstanding review continue to block the protected squash merge.

## Acceptance

- Reproduce the failure on the original source import. The revised changed-line step accepts the source import using Git's binary detection.
- A text document with a binary filename and a repository hint that disables text diffs still fails for trailing whitespace.
- The revised scanning step restores forced text diffs and passes both original scans with the trusted redacted configuration.
- Actionlint and the required local suites pass. GitHub verifies all three required checks on the updated head before merge.
