import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const vocabulary = JSON.parse(readFileSync(new URL("../../design/content/terms.json", import.meta.url), "utf8")).terms.filter((t) =>
  /^(action|state)\./.test(t.id),
);
const words = Object.fromEntries(vocabulary.map((t) => [t.id, t.term]));
mkdirSync("packages/web/src/foundation", { recursive: true });
writeFileSync(
  "packages/web/src/foundation/words.ts",
  "// Generated from design/content/terms.json.\nexport const words = " +
    JSON.stringify(words, null, 2) +
    " as const;\n",
);
writeFileSync(
  "packages/native/controls/words.zig",
  "// Generated from design/content/terms.json.\n" +
    vocabulary
      .map(
        (t) =>
          "pub const " +
          t.id.replace(/[.-]/g, "_") +
          " = " +
          JSON.stringify(t.term) +
          ";",
      )
      .join("\n") +
    "\n",
);
