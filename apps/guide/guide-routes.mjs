export const guidePages = [
  { id: "brand", path: "/", legacy: "index.html", title: "Brand" },
  { id: "system", path: "/system", legacy: "system.html", title: "Design system" },
  { id: "components", path: "/components", legacy: "components.html", title: "Components", detail: true },
  { id: "templates", path: "/templates", legacy: "templates.html", title: "Templates", detail: true },
  { id: "examples", path: "/examples", legacy: "examples.html", title: "Examples", detail: ["sourdough"] },
  { id: "motion", path: "/motion", legacy: "motion-patterns.html", title: "Motion", detail: true, retired: true },
  { id: "workflows", path: "/workflows", legacy: "workflows.html", title: "Workflows", retired: true },
  { id: "library", path: "/library", legacy: "library.html", title: "Design sources" },
  { id: "adoption", path: "/adoption", legacy: "adoption.html", title: "Project use" },
  { id: "playbook", path: "/playbook", legacy: "playbook.html", title: "Product playbook", parent: "adoption" },
  { id: "agents", path: "/agents", legacy: "agents.html", title: "Agent family", parent: "library" },
  { id: "emoji", path: "/emoji", legacy: "emoji.html", title: "Emoji", parent: "library" },
  { id: "motion-comparison", path: "/motion-comparison", legacy: "motion-comparison.html", title: "Compare motion", retired: true },
];

export const guideAliases = {
  "/docs/index.html": "/adoption",
  "/examples/basic-controls/index.html": "/system#controls",
  "/examples/signature/index.html": "/#wordmark-study",
  "/patterns/task-states.html": "/components/motion-task-list",
};

export function matchGuidePath(pathname) {
  const path = pathname.replace(/\/$/, "") || "/";
  return guidePages.find(page =>
    path === page.path || path === "/" + page.legacy ||
    (page.detail && path.startsWith(page.path + "/") && path.split("/").length === 3 &&
      (page.detail === true || page.detail.includes(path.split("/")[2])))
  );
}

export function canonicalGuideUrl(url) {
  if (Object.hasOwn(guideAliases, url.pathname)) {
    const alias = new URL(guideAliases[url.pathname], url.origin);
    return alias.pathname + url.search + (alias.hash || url.hash);
  }
  const page = matchGuidePath(url.pathname);
  if (!page) return null;
  const legacy = url.pathname === "/" + page.legacy;
  const { pathname, search, hash } = url;
  if (legacy && page.detail && hash.length > 1 && hash !== "#yg-inspect") {
    return page.path + "/" + hash.slice(1) + search;
  }
  return (legacy ? page.path : pathname.replace(/\/$/, "") || "/") + search + hash;
}
