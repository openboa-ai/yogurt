import { generateTokens } from "../tokens/generate.mjs";

generateTokens({ target: "ui" });
await import("./words.mjs");
