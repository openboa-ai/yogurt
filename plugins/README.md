# Agent plugins

[Yogurt](yogurt/README.md) contains the Codex skills for design decisions, implementation, review and feedback. The marketplace entry lives in [the repository's plugin catalog](../.agents/plugins/marketplace.json).

The plugin resolves each project's pinned SDK. Shared components, design rules and patterns live in the installed SDK. The adopting project owns its data and effects. [Plugin checks](../checks/README.md#plugin-and-report-broker) verify installation, SDK compatibility and feedback routing. [Evaluations](../checks/evals/README.md) compare how agents perform with the plugin.
