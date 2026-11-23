# Checks and review

Run `npm run check:ui` after building. [Agent evaluations](evals/README.md) cover the plugin workflows with their own fixtures and grading rules.

Run `npm run build` followed by `bash checks/web-agent-consumers.sh` to pack the current SDK and test its opt-in Web bridge and supported controls in isolated Vite and Next.js consumers. The fixture uses synthetic values and has no external effects. It checks policy refusal, component discovery, controlled updates, native form behavior, a button wrapper installed by the Yogurt CLI and resolved Web import statements against installed exports. It does not exercise a separate shadcn CLI, a model, a native app or a production service.

## Installed consumer journeys

Pin the same candidate SDK in two separate Node consumers. One can use the package archive and the other an exact Git commit. Install their declared React peers. Run `node checks/installed-guidance.mjs <installed-sdk> <version>` from a clean setup to verify the packaged links, pattern lookup and failure cases.

Run `node checks/web-consumer-journeys.mjs <decision-consumer> <record-consumer> <output-dir>` using Chrome or the configured `YOGURT_BROWSER_CHANNEL`. The runner bundles the [plugin's decision example](../plugins/yogurt/references/examples/review-decision.web.tsx) and the record fixture against the installed dependencies. It blocks network requests and exercises both flows at desktop light and compact dark sizes. The output includes screen captures, consumer pins and observable effects. Compare the states in the [consumer journey contract](../docs/engineering/adoption/U19D-guide-and-evaluate-skills/journeys.md).
