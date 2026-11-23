# Browser and desktop presentation

Yogurt provides React components, shared tokens and artwork. Vite and Next.js render these components in the browser. Desktop apps load their React UI in a WebView through the app's shell.

The shell owns window creation, operating-system capabilities, frontend asset packaging and the origins permitted to use its bridge. The product owns data and action callbacks. Shared UI lives in the React package and is verified by interacting with its public components. Check bundled assets, keyboard focus and representative overlay transitions in the packaged app before claiming support for that host.

[React package](../packages/web/README.md) · [Component reform](engineering/renderers/react-ui/spec.md)
