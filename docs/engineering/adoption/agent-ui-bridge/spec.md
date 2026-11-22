# Agent UI bridge: opt-in web entry

## Accepted scope

The owner approved an explicitly configured Web agent connection as part of the component replacement. Provide a distinct client-only package entry for creating a Web bridge around the shared behavior runtime. Existing components never create a bridge or expose a tool by themselves. Native integration and product authorization are separate work.

## Contract

- Export `createYogurtAgent` from `@openboa/yogurt/agent`. It accepts a required host `allow` callback and optional timeout, forwards them to the shared runtime, and returns its supported bridge methods. The published type and runtime must reject an absent or non-function policy.
- Importing the entry causes no bridge creation, tool registration or action. Creation happens only in a browser when the host calls the function. It uses the same peer runtime as installed Yogurt controls and does not silently bundle another copy.
- The bridge delegates component discovery and actions to the provider. It does not grant access to a service, authorize a product operation, automatically register WebMCP tools, or enforce a data scope. The host controls who receives snapshots and how action and confirmation policy is applied. An action policy by itself does not filter snapshots or queries.
- Preserve failed, refused and partially applied results from the provider. A multi-step failure must not be described as a rollback. The caller checks the actual result and confirmed host state before reporting success.

## Evidence

Build and pack the SDK. In isolated Vite and Next.js consumer apps, verify an absent policy fails, an installed supported control is discoverable, allowed actions update the correct host state exactly once, and refused actions leave it unchanged. Check keyboard and normal form behavior independently. The test fixture uses no credentials, service or live data. Verify import alone does not create a bridge. Record native and production evidence separately.
