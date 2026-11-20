# Issue report contract

Run `node ../../bin/report-issue.mjs <project-root>` from the skill folder and pass a JSON report over stdin. Use `mode: "draft"` for review or `mode: "file"` when the request authorizes a delegated write. The following is a synthetic report.

```json
{
  "mode": "draft",
  "owner": "sdk",
  "title": "Dialog does not restore focus on Escape",
  "pin": "0.1.0-local.16",
  "renderer": "web",
  "publicId": "confirm-dialog",
  "symptom": "focus moves to the document body after Escape",
  "reproduction": "Open the dialog with its keyboard-focused trigger, then press Escape.",
  "expected": "Focus returns to the trigger.",
  "observed": "Focus moves to the document body after Escape.",
  "impact": "Keyboard navigation loses its place.",
  "acceptance": "Pressing Escape closes the dialog and makes the original trigger active."
}
```

Use `owner: "product"` for product behavior and `owner: "undetermined"` when attribution is open. The host resolves the declared project route and verifies its own delegation. The project and the skill do not manage credentials or grants. Use the OS account's trusted host policy. When a result is pending, use the same report for reconciliation. Report the broker's confirmed URL only when one is observed.
