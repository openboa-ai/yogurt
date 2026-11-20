// Paths in the source tree can move independently of links in the guide.
export const siteLayout = [
  ["apps/guide/pages", ""],
  ["apps/guide/generated", ""],
  ["apps/guide/runtime", "apps/guide/runtime"],
  ["design/README.md", "design/README.md"],
  ["design/assets", "assets"],
  ["design/content", "content"],
  ["design/styles", "styles"],
  ["design/tokens", "tokens"],
  ["packages/recipes", "blocks"],
  ["packages/README.md", "packages/README.md"],
  ["packages/native", "packages/native"],
  ["packages/web/README.md", "packages/web/README.md"],
  ["packages/web/src", "packages/web/src"],
  ...["DESIGN.md", "README.md", "catalog", "docs", "examples"].map(path => [path, path]),
];

export function sitePath(path) {
  for (const [source, destination] of siteLayout) {
    if (path === source) return destination;
    if (path.startsWith(source + "/")) {
      const relative = path.slice(source.length + 1);
      return destination ? destination + "/" + relative : relative;
    }
  }
  return path;
}
