import { readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const repo = fileURLToPath(new URL("../..", import.meta.url));
const root = resolve(repo, "apps/guide/vite");
const pageNames = ["components", "motion-patterns", "motion-comparison", "workflows", "agents"];

function documentRoute(path, live) {
  if (/^\/components(?:\/[^/]+)?\/?$/.test(path) || path === "/components.html")
    return live ? "/_entry-components.html" : "/components.html";
  if (/^\/motion(?:\/[^/]+)?\/?$/.test(path) || path === "/motion-patterns.html")
    return live ? "/_entry-motion-patterns.html" : "/motion-patterns.html";
  for (const name of ["workflows", "agents", "motion-comparison"]) {
    if (path === "/" + name || path === "/" + name + ".html")
      return live ? "/_entry-" + name + ".html" : "/" + name + ".html";
  }
  for (const name of ["system", "library", "adoption", "playbook", "emoji"]) {
    if (path === "/" + name) return "/" + name + ".html";
  }
  return undefined;
}

function guideRoutes() {
  const configure = (server, live) => server.middlewares.use((request, _response, next) => {
    const url = new URL(request.url || "/", "http://localhost");
    const destination = documentRoute(url.pathname, live);
    if (destination) request.url = destination + url.search;
    next();
  });
  return {
    name: "yogurt-guide-routes",
    configureServer(server) { configure(server, true); },
    configurePreviewServer(server) { configure(server, false); },
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
  plugins: [guideRoutes(), anatomy()],
  resolve: { alias: [
    { find: /^@openboa\/yogurt\/motion-patterns$/, replacement: resolve(repo, "packages/web/src/patterns/motion-patterns.ts") },
    { find: /^@openboa\/yogurt$/, replacement: resolve(repo, "packages/web/src/index.ts") },
  ] },
  optimizeDeps: {
    exclude: ["@openai/apps-sdk-ui"],
    include: ["react", "react/jsx-runtime", "react-dom", "react-dom/client", "lodash.debounce", "@openai/apps-sdk-ui > react/jsx-runtime"],
  },
  server: { fs: { allow: [repo] } },
  build: {
    outDir: resolve(repo, ".vite-guide"),
    emptyOutDir: true,
    copyPublicDir: false,
    rolldownOptions: {
      input: Object.fromEntries(pageNames.map(name => [name, resolve(root, "_entry-" + name + ".html")])),
    },
  },
});
