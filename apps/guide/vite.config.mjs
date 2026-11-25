import { dirname, resolve } from "node:path";
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

export default defineConfig({
  root,
  base: "/",
  publicDir: resolve(repo, "site"),
  appType: "mpa",
  plugins: [guideRoutes(), watchTokens()],
  resolve: { alias: [
    { find: /^@openboa\/yogurt\/motion-patterns$/, replacement: resolve(repo, "packages/web/src/patterns/motion-patterns.ts") },
    { find: /^@openboa\/yogurt$/, replacement: resolve(repo, "packages/web/src/index.ts") },
  ] },
  optimizeDeps: {
    include: ["react", "react/jsx-runtime", "react-dom", "react-dom/client"],
  },
  server: { fs: { allow: [repo] } },
  preview: { port: 5273 },
  build: {
    outDir: resolve(repo, ".vite-guide"),
    emptyOutDir: true,
    copyPublicDir: false,
  },
});
