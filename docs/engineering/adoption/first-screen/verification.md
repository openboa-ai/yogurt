# First-screen verification

The same brief supplied no component names. Build a view to find a record by name or ID, open its detail and return to the same query and selection. Preserve the unmatched query and offer a way to clear it.

| Check | Observation |
| --- | --- |
| Installed guides and contracts | Packed the SDK and checked all relative links in the consumer README, design entry, usage guide and both composition guides. The Vite guide build included the adoption documents and registry links. Installed lookup led to the task map for an unrecognized ID. Native typed OTP resolved to `codeView`. |
| Consumer README setup | Confirmed that the SDK includes the README and consumer guide, that the README links to the copyable project section, and that the installation examples parse as shell commands. |
| Vite in Chrome | An independent consumer installed the archive, passed `yogurt check` and built with Vite. At 900 and 360 px it found a record by name and ID, opened the detail, restored the query, selection and row focus, and recovered from an unmatched search with focus on the field. Tested keyboard and pointer activation. |
| Native on macOS | A new app used Native SDK 0.11.1 and Zig 0.16.0 with its own framework dependency. The installed Yogurt controls passed `yogurt check`. The standard CLI built and packaged the app. In the package, typing, opening, returning and clearing matched the task. The runtime snapshot showed the restored row selected and focused, then the search field focused after clearing. The app rendered after resizing to 380 points. |
| Model evaluation | The new `compose-first-screen` case prepared both installed targets. The fixture isolation probe observed an outside canary readable and prevented the model call. No model result or token comparison was recorded. |

Use `node --test checks/design-sources.mjs checks/evals/grade.test.mjs` for the source and evaluator assertions. After packing, run `node checks/resolve-native-guidance.mjs <archive>` for exact Native bindings and pin integrity. The [evaluation runner](../../../../checks/evals/README.md) describes how to run the first-screen selection case on a qualifying host.
