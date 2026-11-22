import { lazy, startTransition, Suspense, useEffect, useLayoutEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { IconButton, Link, Navbar, PageHeader, ProjectMark, Text, Yogurt } from "@openboa/yogurt";
import "../../../design/styles/brand.css";
import "../../../design/styles/ui.css";
import "./shell.css";
import { guidePages, canonicalGuideUrl, matchGuidePath } from "../guide-routes.mjs";
import motionCatalog from "../../../catalog/motion-components.json";

const motionDestinations = new Map(motionCatalog.components.flatMap(component =>
  component.examples.map(example => [example, component.id] as const)));
for (const [example, component] of Object.entries({
  "otp": "input-otp", "toggle-switch": "switch", "smooth-tabs": "tabs",
  "segmented-control": "segmented-control", "sidebar-collapse": "sidebar-layout",
  "plan-switch": "motion-plan-switch", "focus-mode": "motion-focus-picker",
})) motionDestinations.set(example, component);

function hostedUrl(url: URL) {
  const canonical = canonicalGuideUrl(url);
  if (!canonical) return null;
  const next = new URL(canonical, url.origin);
  const page = matchGuidePath(next.pathname);
  if (page?.id === "workflows") return "/playbook";
  if (page?.id === "motion-comparison") return "/components";
  if (page?.id === "motion") {
    const example = next.pathname.split("/")[2] || next.hash.slice(1);
    const id = motionDestinations.get(example);
    return id ? "/components/" + id : example ? canonical : "/components";
  }
  return canonical;
}

const BrandPage = lazy(() => import("./brand"));
const SystemGuide = lazy(() => import("./guides/system"));
const DesignSources = lazy(() => import("./guides/library"));
const AdoptionGuide = lazy(() => import("./guides/adoption"));
const Playbook = lazy(() => import("./guides/playbook"));
const EmojiGallery = lazy(() => import("./guides/emoji"));
const Catalog = lazy(() => import("./components"));
const Templates = lazy(() => import("./templates"));
const Examples = lazy(() => import("./examples"));
const AgentFamily = lazy(() => import("./agents"));
const destinations = guidePages.filter(page => !page.parent && !page.retired)
  .map(page => ({ id: page.id, label: page.title, href: page.path }));
type Appearance = "light" | "dark";

function currentUrl() {
  return hostedUrl(new URL(location.href)) ?? (location.pathname + location.search + location.hash);
}

const startingUrl = currentUrl();
if (startingUrl !== location.pathname + location.search + location.hash) {
  history.replaceState(history.state, "", startingUrl);
}

function loadAppearance(): Appearance {
  try {
    const saved = localStorage.getItem("yogurt-guide-appearance");
    if (saved === "light" || saved === "dark") return saved;
  } catch { /* A private session can still use the system appearance. */ }
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function alignPage(url: URL, focusHeading: boolean) {
  const main = document.getElementById("guide-content");
  let target: HTMLElement | null = null;
  if (url.hash.length > 1) {
    try { target = document.getElementById(decodeURIComponent(url.hash.slice(1))); }
    catch { /* Ignore an invalid fragment. */ }
  }
  if (target) {
    if (target === main) target.focus({ preventScroll: true });
    target.scrollIntoView();
    return;
  }
  if (!focusHeading) return;
  const heading = main?.querySelector<HTMLElement>("h1");
  if (heading) {
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  } else main?.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

function GuideContent({ id, appearance, href }: { id: string; appearance: Appearance; href: string }) {
  const [initialUrl] = useState(href);
  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => alignPage(new URL(initialUrl, location.origin), initialUrl !== startingUrl));
    return () => cancelAnimationFrame(frame);
  }, [initialUrl]);

  switch (id) {
    case "brand": return <BrandPage />;
    case "system": return <SystemGuide />;
    case "library": return <DesignSources />;
    case "adoption": return <AdoptionGuide />;
    case "playbook": return <Playbook />;
    case "emoji": return <EmojiGallery />;
    case "components": return <Catalog guideAppearance={appearance} />;
    case "templates": return <Templates id={new URL(href, location.origin).pathname.split("/")[2]} appearance={appearance} />;
    case "examples": return <Examples id={new URL(href, location.origin).pathname.split("/")[2]} appearance={appearance} />;
    case "motion": return <main><PageHeader title="Pattern not found" action={<Link href="/components">Browse components</Link>} /></main>;
    case "agents": return <div className="guide-agents"><AgentFamily /></div>;
    default: return <main><PageHeader title="Guide page not found" action={<Link href="/">Go to Yogurt</Link>} /></main>;
  }
}

function Guide() {
  const [href, setHref] = useState(startingUrl);
  const [appearance, setAppearance] = useState(loadAppearance);
  const [menu, setMenu] = useState(false);
  const url = new URL(href, location.origin);
  const page = matchGuidePath(url.pathname);
  const id = page?.id ?? "missing";

  useEffect(() => {
    function followLocation() {
      startTransition(() => setHref(currentUrl()));
      setMenu(false);
    }
    function followLink(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) return;
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement) || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;
      const target = new URL(link.href);
      if (target.origin !== location.origin) return;
      const canonical = hostedUrl(target);
      if (!canonical) return;

      event.preventDefault();
      const previous = new URL(location.href);
      const next = new URL(canonical, location.origin);
      if (canonical !== currentUrl()) {
        history.pushState(null, "", canonical);
        window.dispatchEvent(new PopStateEvent("popstate"));
        if (previous.hash !== next.hash) {
          window.dispatchEvent(new HashChangeEvent("hashchange", { oldURL: previous.href, newURL: next.href }));
        }
      }
      setMenu(false);
      if (matchGuidePath(previous.pathname)?.id === matchGuidePath(next.pathname)?.id && previous.search === next.search) {
        requestAnimationFrame(() => alignPage(next, !next.hash));
      }
    }
    window.addEventListener("popstate", followLocation);
    window.addEventListener("hashchange", followLocation);
    document.addEventListener("click", followLink);
    return () => {
      document.removeEventListener("click", followLink);
      window.removeEventListener("hashchange", followLocation);
      window.removeEventListener("popstate", followLocation);
    };
  }, []);

  useEffect(() => {
    document.title = id === "brand" ? "Yogurt · OpenBoa design system" : (page?.title ?? "Page not found") + " · Yogurt";
  }, [id, page?.title]);

  function toggleAppearance() {
    const next = appearance === "dark" ? "light" : "dark";
    setAppearance(next);
    try { localStorage.setItem("yogurt-guide-appearance", next); }
    catch { /* The current session retains the selection. */ }
  }

  const active = page?.parent ?? id;
  return <Yogurt appearance={appearance} className="guide-shell">
    <Link className="guide-skip" href="#guide-content">Skip to content</Link>
    <Navbar variant="sections" className="guide-masthead" label="Yogurt guide"
      destinations={destinations} current={active} currentKind={active === id ? "page" : "location"}
      expanded={menu} onExpandedChange={setMenu}
      identity={<Link href="/" className="guide-identity" aria-label="Yogurt home">
        <ProjectMark project="yogurt" label="" size={30} />Yogurt
      </Link>}
      action={<IconButton icon={appearance === "dark" ? "sun" : "moon"}
        label={appearance === "dark" ? "Use light appearance" : "Use dark appearance"} onClick={toggleAppearance} />}
    />
    <div id="guide-content" className="guide-content" tabIndex={-1}>
      <Suspense fallback={<Text className="guide-loading" role="status">Loading guide…</Text>}>
        <GuideContent key={(id === "templates" || id === "examples" ? url.pathname : id) + url.search} id={id} appearance={appearance} href={href} />
      </Suspense>
    </div>
  </Yogurt>;
}

createRoot(document.getElementById("yogurt-guide")!).render(<Guide />);
