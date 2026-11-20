import { readFileSync } from "node:fs";
import { basename } from "node:path";

// Keep upstream's interaction implementation. Replace its private CSS modules
// with stable anatomy names. Consumers load Yogurt's scoped stylesheet once.
export const anatomy = {
  name: "yogurt-anatomy",
  setup(b) {
    b.onLoad({ filter: /\.module\.css$/ }, ({ path }) => {
      const family = basename(path, ".module.css");
      const css = readFileSync(path, "utf8");
      const names = [
        ...new Set([...css.matchAll(/\.([A-Za-z_][\w-]*)/g)].map((m) => m[1])),
      ];
      return {
        loader: "js",
        contents:
          "export default " +
          JSON.stringify(
            Object.fromEntries(
              names.map((n) => [n, "yg-sdk-" + family + "-" + n]),
            ),
          ) +
          ";",
      };
    });
  },
};
