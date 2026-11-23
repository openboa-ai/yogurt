# Working on yogurt

Read [the product intent](docs/intent.md), [the visual direction](docs/design-direction.md) and the owning feature pair before changing a shared rule or renderer. Use [the design portfolio](docs/README.md) to find its engineering criterion. The catalog's explicit parent and predecessor fields determine ownership and order.

Use the [shared UI source map](docs/design-system-rules.md#one-source-for-ui) and [contributor workflow](CONTRIBUTING.md#changing-shared-ui) for changes to Yogurt itself, including its guide, Studio, templates and examples. Reproduce the reported state through the installed public entry, edit the owner and record the interaction that proves the fix. On resuming work, replay the recorded path at the named revision.

Before implementation, identify the accepted spec revision, the scoped plan and the target evidence. Develop against the declared public contract and exercise its positive and recovery cases. Keep exact design review, admission, implementation, observed verification and release as distinct records. Add those records when the corresponding event occurs.

Use [DESIGN.md](DESIGN.md) for product work using the kit. Preserve original masters and stable public IDs. Keep all maintained product copy in English, use the shared palette and Rethink Sans, and verify the shared React components in the browser and in the app WebView. Follow the [stack decision](docs/native-stack.md). Each product owns its facts, permissions and adoption. [Current evidence](docs/status.md)

Keep the repository, guide and package focused on Yogurt’s own components, decisions, examples and verification. Keep required dependency notices and integration instructions with the code they support.
