import { readFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { canonicalGuideUrl } from "./guide-routes.mjs";
import { generateTokens } from "../../scripts/tokens/generate.mjs";

const repo = fileURLToPath(new URL("../..", import.meta.url));
const root = resolve(repo, "apps/guide/vite");

function watchTokens() {
  const directory = resolve(repo, "design/tokens");
  return {
    name: "yogurt-shared-tokens",
    apply: "serve",
    configureServer(server) { server.watcher.add(directory); },
    handleHotUpdate({ file }) {
      if (dirname(file) === directory) generateTokens();
    },
  };
}

function guideRoutes() {
  const configure = (server) => server.middlewares.use((request, _response, next) => {
    const url = new URL(request.url || "/", "http://localhost");
    if (canonicalGuideUrl(url)) request.url = "/index.html" + url.search;
    next();
  });
  return {
    name: "yogurt-guide-routes",
    configureServer(server) { configure(server); },
    configurePreviewServer(server) { configure(server); },
  };
}

function anatomy() {
  const prefix = "\0yogurt-anatomy:";
  return {
    name: "yogurt-anatomy",
    enforce: "pre",
    async resolveId(source, importer) {
      if (!source.endsWith(".module.css") || !importer?.includes("/@openai/apps-sdk-ui/")) return;
      const result = await this.resolve(source, importer, { skipSelf: true });
      if (result) return prefix + result.id + ".js";
    },
    load(id) {
      if (!id.startsWith(prefix)) return;
      const path = id.slice(prefix.length, -3);
      const family = basename(path, ".module.css");
      const names = [...new Set([...readFileSync(path, "utf8").matchAll(/\.([A-Za-z_][\w-]*)/g)].map(match => match[1]))];
      return "export default " + JSON.stringify(Object.fromEntries(names.map(name => [name, "yg-sdk-" + family + "-" + name]))) + ";";
    },
  };
}

export default defineConfig({
  root,
  base: "/",
  publicDir: resolve(repo, "site"),
  appType: "mpa",
  plugins: [guideRoutes(), anatomy(), watchTokens()],
  resolve: { alias: [
    { find: /^@openboa\/yogurt\/motion-patterns$/, replacement: resolve(repo, "packages/web/src/patterns/motion-patterns.ts") },
    { find: /^@openboa\/yogurt$/, replacement: resolve(repo, "packages/web/src/index.ts") },
  ] },
  optimizeDeps: {
    exclude: ["@openai/apps-sdk-ui"],
    include: ["react", "react/jsx-runtime", "react-dom", "react-dom/client", "lodash.debounce", "@openai/apps-sdk-ui > react/jsx-runtime"],
  },
  server: { fs: { allow: [repo] } },
  preview: { port: 5273 },
  build: {
    outDir: resolve(repo, ".vite-guide"),
    emptyOutDir: true,
    copyPublicDir: false,
  },
});
