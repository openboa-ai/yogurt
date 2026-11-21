type Section = "components" | "motion";

function offline() {
  return typeof location !== "undefined" && location.protocol === "file:";
}

export function sectionHref(section: Section, id?: string) {
  if (offline()) {
    const file = section === "components" ? "components.html" : "motion-patterns.html";
    const current = location.pathname.split("/").pop() === file;
    return (current && id ? "" : file) + (id ? "#" + encodeURIComponent(id) : "");
  }
  return "/" + section + (id ? "/" + encodeURIComponent(id) : "");
}

export function guideHref(section: "workflows" | "agents" | "motion-comparison") {
  return offline() ? section + ".html" : "/" + section;
}

export function locationId(section: Section) {
  const path = location.pathname.match(new RegExp("^/" + section + "(?:/([^/]+))?/?$"));
  try {
    return decodeURIComponent(path?.[1] || location.hash.slice(1) || "");
  } catch {
    return "";
  }
}

export function navigateSection(section: Section, id: string) {
  if (offline()) {
    location.hash = id;
  } else {
    const next = sectionHref(section, id);
    if (location.pathname !== next) history.pushState(null, "", next);
  }
}
