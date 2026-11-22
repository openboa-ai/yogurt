"use client";
"use client";
import "./shared/chunk-5ZXHC2QO.js";

// packages/web/src/agent.ts
import { createAgent } from "@ui-sdk/react/agent";
function createYogurtAgent(options) {
  if (typeof options?.allow !== "function") {
    throw new TypeError("A host action policy is required to create a Yogurt agent.");
  }
  if (typeof window === "undefined") {
    throw new Error("A Yogurt agent must be created in the browser.");
  }
  return createAgent({ allow: options.allow, timeout: options.timeout });
}
export {
  createYogurtAgent
};
