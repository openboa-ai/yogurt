import { lazy, startTransition, Suspense, useEffect, useLayoutEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Heading, IconButton, Link, ProjectMark, Text, Yogurt } from "@openboa/yogurt";
import "../../../design/styles/components.css";
import "../../../design/styles/ui.css";
import "./shell.css";
import { guidePages, canonicalGuideUrl, matchGuidePath } from "../guide-routes.mjs";

const EditorialPage = lazy(() => import("./editorial").then(module => ({ default: module.EditorialPage })));
const Catalog = lazy(() => import("./components"));
const Gallery = lazy(() => import("./motion-patterns"));
const Workflows = lazy(() => import("./workflows"));
const MotionComparison = lazy(() => import("./motion-comparison"));
const AgentFamily = lazy(() => import("./agents"));
const editorialPages = ["brand", "system", "library", "adoption", "playbook", "emoji"] as const;
type EditorialId = typeof editorialPages[number];
type Appearance = "light" | "dark";

function currentUrl() {
  return canonicalGuideUrl(new URL(location.href)) ?? (location.pathname + location.search + location.hash);
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

  if (editorialPages.includes(id as EditorialId)) return <EditorialPage id={id as EditorialId} />;
  switch (id) {
    case "components": return <Catalog guideAppearance={appearance} />;
    case "motion": return <Gallery guideAppearance={appearance} />;
    case "workflows": return <Workflows guideAppearance={appearance} />;
    case "motion-comparison": return <MotionComparison embedded guideAppearance={appearance} />;
    case "agents": return <div className="guide-agents"><AgentFamily /></div>;
    default: return <main><Heading level={1}>Guide page not found</Heading><Link href="/">Go to Yogurt</Link></main>;
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
      const canonical = canonicalGuideUrl(target);
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
    <header className="guide-masthead" onKeyDown={event => {
      if (event.key === "Escape" && menu) {
        setMenu(false);
        document.getElementById("guide-menu-toggle")?.focus();
      }
    }}>
      <Link href="/" className="guide-identity" aria-label="Yogurt home">
        <ProjectMark project="yogurt" label="" size={30} />Yogurt
      </Link>
      <nav className="guide-navigation" id="guide-navigation" data-open={menu} aria-label="Yogurt guide">
        {guidePages.filter(item => !item.parent).map(item =>
          <Link key={item.id} href={item.path} aria-current={active === item.id ? (id === active ? "page" : "location") : undefined}>
            {item.title}
          </Link>
        )}
      </nav>
      <div className="guide-header-actions">
        <IconButton id="guide-menu-toggle" className="guide-menu-toggle" icon={menu ? "close" : "menu"} label={menu ? "Close menu" : "Open menu"}
          aria-expanded={menu} aria-controls="guide-navigation" onClick={() => setMenu(open => !open)} />
        <IconButton icon={appearance === "dark" ? "sun" : "moon"}
          label={appearance === "dark" ? "Use light appearance" : "Use dark appearance"} onClick={toggleAppearance} />
      </div>
    </header>
    <div id="guide-content" className="guide-content" tabIndex={-1}>
      <Suspense fallback={<Text className="guide-loading" role="status">Loading guide…</Text>}>
        <GuideContent key={id + url.search} id={id} appearance={appearance} href={href} />
      </Suspense>
    </div>
  </Yogurt>;
}

createRoot(document.getElementById("yogurt-guide")!).render(<Guide />);
