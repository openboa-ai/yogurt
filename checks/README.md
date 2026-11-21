# Checks and review

Run `npm run check:ui` after building. The [native catalog check](native-catalog.mjs) instantiates the same entry inventory with typed Zig inputs. [Agent evaluations](evals/README.md) cover the plugin workflows with their own fixtures and grading rules.

Run `npm run build` followed by `bash checks/web-agent-consumers.sh` to pack the current SDK and test its opt-in Web bridge and supported controls in isolated Vite and Next.js consumers. The fixture uses synthetic values and has no external effects. It checks policy refusal, component discovery, controlled updates, native form behavior and a button wrapper installed by the Yogurt CLI. It does not exercise a separate shadcn CLI, a model, a native app or a production service.

## Installed consumer journeys

Pin the same candidate SDK in two separate Node consumers. One can use the package archive and the other an exact Git commit. Install their declared React peers. Run `node checks/installed-guidance.mjs <installed-sdk> <version>` from a clean setup to verify the packaged links, pattern lookup and failure cases.

Run `node checks/web-consumer-journeys.mjs <decision-consumer> <record-consumer> <output-dir>` using Chrome or the configured `YOGURT_BROWSER_CHANNEL`. The runner bundles the [plugin's decision example](../plugins/yogurt/references/examples/review-decision.web.tsx) and the record fixture against the installed dependencies. It blocks network requests and exercises both flows at desktop light and compact dark sizes. The output includes screen captures, consumer pins and observable effects. Compare the states in the [consumer journey contract](../docs/engineering/adoption/U19D-guide-and-evaluate-skills/journeys.md).

For the Native decision flow on macOS, use Zig 0.16.0 and Native SDK 0.11.1. Create a fresh Zig core scaffold with `native init <app> --template zig-core`. Copy the app manifest and source files from `fixtures/native-decision` into their corresponding locations in the scaffold. Keep its icon and retain the [starter license](../examples/native-ui/LICENSE.native-sdk). From the pinned SDK, use `node bin/yogurt.mjs add <component> --target native --dir <app>` for `confirm-dialog`, `record-facts`, `progress` and `receipt`. Run `native test <app>` and `native build <app> -Doptimize=ReleaseFast -Dautomation=true`. Launch and drive the built fixture with `bash checks/native-consumer-journey.sh <native-cli> <app> <output-dir>`. Use a fresh fixture directory for each automation session.

Pair automated results with normal-speed visual judgment and separately recorded recipient evidence.

Run `node checks/roster-motion-review.mjs <installed-web-consumer> <new-output-dir>` to prepare a 24 px review. Give the reviewer `roster.html`. Retain `reviewer-key.json` for scoring after the review. The check also captures reduced-motion labels and reports whether the avatar tracks stop.

## Plugin and report broker

Run `node --test checks/plugin-feedback.test.mjs` against the simulated issue tracker. It exercises delegation, repository identity, duplicate prevention and response loss without contacting GitHub. Run `node checks/plugin-sdk.mjs <candidate-npm-project> <previous-npm-project> <candidate-archive>` with separate installations to check compatible SDK resolution, rejection and restoration.

Copy the local marketplace manifest and the plugin into the same relative paths in an isolated checkout. Then run `node checks/plugin-catalog.mjs <isolated-checkout>` to have Codex app-server read the packaged catalog.

Run `node checks/plugin-adoption.mjs <candidate-sdk-archive> <legacy-sdk-archive> <previous-plugin-commit> <new-output-dir>` from the committed candidate. This installs the plug-in in two disposable Codex profiles, upgrades and rolls back one profile, verifies the peer and both SDK pins, and saves the installed-cache observations.

[U18A · Review craft and correctness on a real transition](../docs/engineering/quality/U18A-rehearse-a-transition/spec.md) · [U19B · Detect a consumer violation and return it to its owner](../docs/engineering/adoption/U19B-check-consumer-use/spec.md) · [Design portfolio](../docs/README.md)
