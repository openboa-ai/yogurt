"use client";

import { createAgent } from "@ui-sdk/react/agent";

type ProviderOptions = NonNullable<Parameters<typeof createAgent>[0]>;

export interface YogurtAgentOptions {
  allow: NonNullable<ProviderOptions["allow"]>;
  timeout?: number;
}

export function createYogurtAgent(options: YogurtAgentOptions) {
  if (typeof options?.allow !== "function") {
    throw new TypeError("A host action policy is required to create a Yogurt agent.");
  }
  if (typeof window === "undefined") {
    throw new Error("A Yogurt agent must be created in the browser.");
  }
  return createAgent({ allow: options.allow, timeout: options.timeout });
}
