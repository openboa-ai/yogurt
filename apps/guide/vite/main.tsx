import { lazy, startTransition, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ActionMenu, Button, Dialog, EmptyResult, IconButton, Inline, Link, List, ListRow, Navbar,
  PageHeader, ProjectMark, ScrollArea, SearchField, SegmentedControl, Stack, Text, Yogurt,
} from "@openboa/yogurt";
import "../../../design/styles/brand.css";
import "../../../design/styles/ui.css";
import "./shell.css";
import { guidePages, canonicalGuideUrl, matchGuidePath } from "../guide-routes.mjs";
import { componentAliases, componentPreviews, legacyMotionPreviews, motionDestinations } from "../component-previews";
import blocks from "../../../catalog/blocks.json";
import catalogComponents from "../../../catalog/components.json";
import motionCatalog from "../../../catalog/motion-components.json";

const blockIds = new Set(blocks.map(block => block.id));
type SurfaceMaterial = "neutral" | "paper" | "mist";
const materials = [
  { id: "neutral", label: "Neutral" },
  { id: "paper", label: "Paper" },
  { id: "mist", label: "Mist" },
] as const;

const globalSearchItems = [
  ...catalogComponents.map(item => ({ id: "c:" + item.id, title: item.name, detail: "Component · " + item.group, href: "/components/" + item.id })),
  ...motionCatalog.components.map(item => ({ id: "m:" + item.id, title: item.name, detail: "Motion · " + item.group, href: "/components/" + item.id })),
  ...blocks.map(item => ({ id: "p:" + item.id, title: item.name, detail: "Pattern · " + item.description, href: "/patterns/" + item.id })),
  { id: "g:tokens", title: "Tokens", detail: "Guide · Color, type, spacing and surfaces", href: "/tokens" },
  { id: "g:examples", title: "Sourdough Studio", detail: "Example · Multi-pane AI agent cockpit", href: "/examples" },
];

function hostedUrl(url: URL) {
  const canonical = canonicalGuideUrl(url);
  if (!canonical) return null;
  const next = new URL(canonical, url.origin);
  const page = matchGuidePath(next.pathname);
  if (page?.id === "components") {
    const alias = componentAliases.get(next.pathname.split("/")[2]);
    if (alias) {
      const preview = next.searchParams.get("preview");
      if (!preview || !componentPreviews[alias.component]?.includes(preview)) {
        next.searchParams.set("preview", alias.preview);
      }
      return "/components/" + alias.component + next.search + next.hash;
    }
  }
  if (page?.id === "workflows") return "/playbook";
  if (page?.id === "components" && blockIds.has(next.pathname.split("/")[2])) {
    return "/patterns/" + next.pathname.split("/")[2] + next.search + next.hash;
  }
  if (page?.id === "motion-comparison") return "/components";
  if (page?.id === "motion") {
    const legacy = next.pathname.split("/")[2] || next.hash.slice(1);
    const example = legacyMotionPreviews[legacy] ?? legacy;
    const id = motionDestinations.get(example);
    if (!id) return "/components";
    if (id.startsWith("motion-")) return "/components/" + id;
    const search = new URLSearchParams(next.search);
    search.set("preview", example);
    return "/components/" + id + "?" + search;
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
const destinations = guidePages.filter(page => ["system", "components", "templates", "examples"].includes(page.id))
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

const initialAppearance = loadAppearance();
document.documentElement.dataset.appearance = initialAppearance;

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

function GuideContent({ id, appearance, material, onMaterialChange, href }: {
  id: string;
  appearance: Appearance;
  material: SurfaceMaterial;
  onMaterialChange: (next: SurfaceMaterial) => void;
  href: string;
}) {
  const previousHref = useRef(startingUrl);
  useLayoutEffect(() => {
    const next = new URL(href, location.origin);
    const previous = new URL(previousHref.current, location.origin);
    previousHref.current = href;
    const frame = requestAnimationFrame(() => alignPage(next, previous.pathname !== next.pathname));
    return () => cancelAnimationFrame(frame);
  }, [href]);

  const url = new URL(href, location.origin);
  switch (id) {
    case "brand": return <BrandPage />;
    case "system": return <SystemGuide />;
    case "library": return <DesignSources />;
    case "adoption": return <AdoptionGuide />;
    case "playbook": return <Playbook key={url.search} />;
    case "emoji": return <EmojiGallery key={url.search} />;
    case "components": return <Catalog guideAppearance={appearance} guideMaterial={material} onGuideMaterialChange={onMaterialChange} url={url} />;
    case "templates": return <Templates key={url.pathname} id={url.pathname.split("/")[2]} appearance={appearance} />;
    case "examples": return <Examples key={url.pathname} id={url.pathname.split("/")[2]} appearance={appearance} material={material} />;
    case "agents": return <div className="guide-agents"><AgentFamily /></div>;
    default: return <main><PageHeader title="Guide page not found" action={<Link href="/">Go to Yogurt</Link>} /></main>;
  }
}

function Guide() {
  const [href, setHref] = useState(startingUrl);
  const [appearance, setAppearance] = useState(initialAppearance);
  const [material, setMaterial] = useState<SurfaceMaterial>("neutral");
  const [menu, setMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const url = new URL(href, location.origin);
  const page = matchGuidePath(url.pathname);
  const id = page?.id ?? "missing";

  useLayoutEffect(() => {
    document.documentElement.dataset.appearance = appearance;
  }, [appearance]);

  function navigateTo(nextHref: string) {
    if (nextHref !== currentUrl()) {
      history.pushState(null, "", nextHref);
      startTransition(() => setHref(currentUrl()));
    }
    setMenu(false);
    setSearchOpen(false);
    setSearchQuery("");
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") return;
      if (id === "examples") return;
      event.preventDefault();
      setSearchOpen(true);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [id]);

  const searchResults = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return globalSearchItems.slice(0, 14);
    return globalSearchItems.filter(item => (item.title + " " + item.detail).toLowerCase().includes(term)).slice(0, 20);
  }, [searchQuery]);

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
      if (canonical !== currentUrl()) {
        history.pushState(null, "", canonical);
        followLocation();
      } else {
        setMenu(false);
        const next = new URL(canonical, location.origin);
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
  return <Yogurt appearance={appearance} material={material} className="guide-shell">
    <Link className="guide-skip" href="#guide-content">Skip to content</Link>
    <div className="guide-masthead-wrap">
      <Navbar variant="sections" className="guide-masthead" label="Yogurt guide"
        destinations={destinations} current={active} currentKind={active === id ? "page" : "location"}
        expanded={menu} onExpandedChange={setMenu}
        identity={<Link href="/" className="guide-identity" aria-label="Yogurt home">
          <ProjectMark project="yogurt" label="" size={24} />Yogurt
        </Link>}
        action={<Inline gap={6} wrap={false} align="center" className="guide-global-controls">
          <Button emphasis="soft" size="compact" className="guide-kbd-button" aria-label="Search guide" onClick={() => setSearchOpen(true)}>⌘K</Button>
          <span className="guide-material-desktop">
            <SegmentedControl
              label="Surface material"
              value={material}
              onValueChange={next => setMaterial(next as SurfaceMaterial)}
              options={[...materials]}
            />
          </span>
          <span className="guide-material-compact">
            <ActionMenu
              label="Surface material"
              triggerText={materials.find(item => item.id === material)?.label ?? "Neutral"}
              triggerSize="compact"
              items={[...materials]}
              onSelect={next => setMaterial(next as SurfaceMaterial)}
            />
          </span>
          <IconButton size="compact" icon={appearance === "dark" ? "sun" : "moon"}
            label={appearance === "dark" ? "Use light appearance" : "Use dark appearance"} onClick={toggleAppearance} />
        </Inline>}
      />
    </div>
    <div id="guide-content" className="guide-content" tabIndex={-1}>
      <Suspense fallback={<Text className="guide-loading" role="status">Loading guide…</Text>}>
        <GuideContent id={id} appearance={appearance} material={material} onMaterialChange={setMaterial} href={href} />
      </Suspense>
    </div>
    <Dialog title="Search Yogurt" open={searchOpen} onOpenChange={setSearchOpen}>
      <Stack gap={12}>
        <SearchField label="Search components, patterns and guides" placeholder="Search components, patterns, tokens…" hiddenLabel size="compact" value={searchQuery} onValueChange={setSearchQuery} />
        {searchResults.length ? (
          <ScrollArea label="Guide search results" className="guide-search-results">
            <List label="Matching guide pages" divided>
              {searchResults.map(item => (
                <ListRow key={item.id} title={item.title} description={item.detail} onActivate={() => navigateTo(item.href)} />
              ))}
            </List>
          </ScrollArea>
        ) : (
          <EmptyResult query={searchQuery} onClear={() => setSearchQuery("")} />
        )}
      </Stack>
    </Dialog>
  </Yogurt>;
}

createRoot(document.getElementById("yogurt-guide")!).render(<Guide />);
