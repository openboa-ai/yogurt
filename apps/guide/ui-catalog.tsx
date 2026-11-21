import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { createRoot } from "react-dom/client";
import {
  Yogurt,
  ProjectMark,
  Button,
  IconButton,
  Icon,
  Heading,
  SegmentedControl,
  SearchField,
  Link,
  type Material,
} from "@openboa/yogurt";
import catalog from "../../catalog/components.json";
import motion from "../../catalog/motion.json";
import blocks from "../../catalog/blocks.json";
import { BlockExample } from "./examples/block-examples";
import { BrandTokens } from "./brand-tokens";
import { Example } from "./examples/ui-examples";
import { AgentWorkspaceExample } from "./examples/agent-workspace-examples";
import { ProjectWorkspaceExample } from "./examples/project-workspace-examples";
import { OperationsExample } from "./examples/operations-examples";
import { WorkspaceExample } from "./examples/workspace-examples";
import { AgentProfileExample } from "./examples/agent-profile-example";
import { RunInspectorExample } from "./examples/run-inspector-example";
import { SidebarExample } from "./examples/sidebar-example";
import { guideHref, locationId, navigateSection, sectionHref } from "./routing";
const scopedExamples = {
  "agent-row": AgentWorkspaceExample,
  "runtime-panel": AgentWorkspaceExample,
  "agent-workspace": AgentWorkspaceExample,
  "resource-row": ProjectWorkspaceExample,
  "thread-row": ProjectWorkspaceExample,
  "project-workspace": ProjectWorkspaceExample,
  "work-event": OperationsExample,
  "routine-row": OperationsExample,
  "operations-library": OperationsExample,
  "attention-inbox": OperationsExample,
  "composer": WorkspaceExample,
  "voice-control": WorkspaceExample,
  "artifact-library": WorkspaceExample,
  "project-access": WorkspaceExample,
  "agent-profile": AgentProfileExample,
  "run-inspector": RunInspectorExample,
  "sidebar-layout": SidebarExample,
  "agent-sidebar": SidebarExample,
  "project-sidebar": SidebarExample,
};
const entries = [
  ...catalog,
  ...blocks.map((block) => ({ ...block, family: "Blocks", module: "blocks" })),
];
function foldName(name: string) {
  return name.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();
}
function compactName(name: string) {
  return name.replace(/[\s_\p{Dash_Punctuation}]+/gu, "");
}
const compactPreviews = new Set([
  "button", "icon-button", "button-group", "toggle", "toggle-group", "pagination",
  "badge", "status", "spinner", "project-mark", "avatar", "tooltip", "link", "kbd",
]);
const widePreviews = new Set([
  "table", "data-table", "chart", "bar-chart", "grid-list", "resizable", "sidebar",
  "sidebar-layout", "agent-sidebar", "project-sidebar", "agent-avatar", "transcript", "navbar", "navigation-menu", "menubar",
]);
function previewLayout(entry: {id: string; family: string}) {
  if (compactPreviews.has(entry.id)) return "compact";
  if (entry.family === "Blocks" || entry.family === "Workspaces" || widePreviews.has(entry.id)) return "wide";
  return "field";
}
const searchIndex = entries.map((entry) => {
  const names = [
    entry.name,
    entry.family,
    entry.id,
  ].map(foldName);
  return { entry, text: names.join(" "), aliases: names.map(compactName) };
});
const families = [...new Set(entries.map((e) => e.family))];
const materials = [
  { id: "neutral", label: "Neutral" },
  { id: "paper", label: "Paper" },
  { id: "mist", label: "Mist" },
];
const variants = new Set([
  "stepper",
  "gradient",
  "elevation",
  "button",
  "card",
  "bottom-action",
  "icon-button",
  "stack",
  "inline",
  "grid",
  "text-field",
  "input-group",
  "textarea",
  "search-field",
  "select",
  "checkbox",
  "slider",
  "filter-bar",
  "switch",
  "list",
  "list-row",
  "action-menu",
  "empty-result",
  "badge",
  "status",
  "notice",
  "skeleton",
  "agent-avatar",
  "gaze",
  "field",
  "help-text",
]);
function keyFromHash() {
  return locationId("components") ||
    document.getElementById("yogurt-ui-library")?.dataset.initialComponent || "button";
}
// The embedded guide can run local form examples while its frame blocks navigation.
function submitPreviewForm(event: MouseEvent<HTMLDivElement>) {
  if (event.defaultPrevented || !(event.target instanceof Element)) return;
  const submitter = event.target.closest("button, input");
  if (
    !(submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement) ||
    (submitter.type !== "submit" && submitter.type !== "image") ||
    submitter.matches(":disabled")
  ) return;
  const form = submitter.form;
  if (!form || !event.currentTarget.contains(form)) return;
  event.preventDefault();
  if (!form.noValidate && !submitter.formNoValidate && !form.reportValidity()) return;
  form.dispatchEvent(new SubmitEvent("submit", { bubbles: true, cancelable: true, submitter }));
}
function Catalog({ inlinePreview }: { inlinePreview: boolean }) {
  const [id, select] = useState(keyFromHash),
    [search, setSearch] = useState(""),
    [expanded, expand] = useState<string[]>(["Actions"]),
    [menu, setMenu] = useState(false),
    [dark, setDark] = useState(
      () => matchMedia("(prefers-color-scheme:dark)").matches,
    ),
    [material, setMaterial] = useState<Material>("neutral"),
    [compare, setCompare] = useState(false),
    [showCode, setShowCode] = useState(false);
  const navigation = useRef<HTMLElement>(null);
  const entry = entries.find((e) => e.id === id) ?? entries[0];
  const guidance = "guidance" in entry ? entry.guidance : undefined;
  const missing = id !== "brand" && !entries.some((item) => item.id === id);
  const ScopedExample = scopedExamples[id as keyof typeof scopedExamples];
  useEffect(() => {
    const listener = () => {
      const next = keyFromHash();
      if (next === "yg-inspect") return;
      select(next);
      setMenu(false);
      setShowCode(false);
    };
    addEventListener("hashchange", listener);
    addEventListener("popstate", listener);
    return () => { removeEventListener("hashchange", listener); removeEventListener("popstate", listener); };
  }, []);
  useEffect(() => {
    expand((all) =>
      all.includes(entry.family) ? all : [...all, entry.family],
    );
  }, [entry.family]);
  useEffect(() => {
    const sidebar = navigation.current;
    const active = sidebar?.querySelector("a[aria-current=page]");
    if (!sidebar?.clientHeight || !active || search) return;
    const available = sidebar.getBoundingClientRect();
    const row = active.getBoundingClientRect();
    if (row.top < available.top) sidebar.scrollTop += row.top - available.top;
    if (row.bottom > available.bottom) sidebar.scrollTop += row.bottom - available.bottom;
  }, [id, expanded, menu, search]);
  const matches = useMemo(() => {
    const term = foldName(search.trim());
    const compact = compactName(term);
    return searchIndex
      .filter(({ text, aliases }) =>
        text.includes(term) ||
        (compact.length > 0 && aliases.some((alias) => alias.includes(compact))),
      )
      .map(({ entry }) => entry);
  }, [search]);
  function go(next: string) {
    select(next);
    setMenu(false);
    setShowCode(false);
    navigateSection("components", next);
  }
  const appearance = dark ? "dark" : "light";
  const tokenLabel =
    id === "button"
      ? "14 / 20 type · 36 px high · 8 px corners"
      : entry.family === "Forms"
        ? "14 / 20 type · 44 px touch"
        : "Rethink Sans · Yogurt palette";
  return (
    <Yogurt appearance={appearance} className="catalog">
      <a className="skip" href="#yg-inspect">
        Skip to component
      </a>
      <header className="catalog-header">
        <div className="catalog-identity">
          <ProjectMark project="openboa" label="OpenBoa" size={30} />
          <span>Yogurt</span>
        </div>
        <nav className="catalog-top" aria-label="Yogurt guide">
          <Button emphasis="quiet" size="compact"
            aria-current={id !== "brand" ? "page" : undefined}
            onClick={() => go("button")}
          >
            Components
          </Button>
          <Button emphasis="quiet" size="compact"
            aria-current={id === "brand" ? "page" : undefined}
            onClick={() => go("brand")}
          >
            Brand &amp; tokens
          </Button>
          <Link href={sectionHref("motion")}>Motion</Link>
          <Link href={guideHref("workflows")}>Workflows</Link>
        </nav>
        <div className="header-actions">
          <IconButton
            className="menu-toggle"
            label={menu ? "Close navigation" : "Browse components"}
            icon={menu ? "close" : "menu"}
            onClick={() => setMenu(!menu)}
            aria-expanded={menu}
          />
          <IconButton
            label={dark ? "Use light appearance" : "Use dark appearance"}
            icon={dark ? "sun" : "moon"}
            onClick={() => setDark(!dark)}
          />
        </div>
      </header>
      <div className="catalog-body">
        <aside ref={navigation} data-open={menu} aria-label="Components">
          <div className="catalog-search">
            <SearchField label="Find a component" placeholder="Find a component"
              value={search} onValueChange={setSearch} />
          </div>
          <nav aria-label="Component index">
            {families.map((f) => {
              const rows = matches.filter((e) => e.family === f);
              if (!rows.length) return null;
              const open = !!search || expanded.includes(f);
              return (
                <div className="nav-family" key={f}>
                  <Button emphasis="quiet" size="compact"
                    type="button"
                    aria-expanded={open}
                    onClick={() =>
                      expand((a) =>
                        a.includes(f) ? a.filter((v) => v !== f) : [...a, f],
                      )
                    }
                  >
                    <span>{f}</span>
                    <Icon name={open ? "down" : "next"} />
                  </Button>
                  {open &&
                    rows.map((e) => (
                      <Link
                        key={e.id}
                        href={sectionHref("components", e.id)}
                        aria-current={e.id === id ? "page" : undefined}
                        onClick={(ev) => {
                          if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
                          ev.preventDefault();
                          go(e.id);
                        }}
                      >
                        {e.name}
                      </Link>
                    ))}
                </div>
              );
            })}
            {!matches.length && (
              <p className="yg-help">No matching components.</p>
            )}
          </nav>
        </aside>
        <main id="yg-inspect" tabIndex={-1}>
          {missing ? (
            <section className="catalog-intro">
              <h1>Component not found</h1>
              <p>Choose a component from the index.</p>
              <Link href={sectionHref("components", "button")} onClick={event => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault(); go("button");
              }}>Browse components</Link>
            </section>
          ) : id === "brand" ? (
            <BrandTokens />
          ) : (
            <>
              <div className="catalog-intro">
                <p className="catalog-family">{entry.family}</p>
                <h1>{entry.name}</h1>
                <p>{entry.description}</p>
              </div>
              <div className="preview-tools">
                <span>Preview</span>
                <SegmentedControl
                  label="Neutral palette"
                  options={materials}
                  value={material}
                  onValueChange={(v) => setMaterial(v as Material)}
                />
              </div>
              <Yogurt
                appearance={appearance}
                material={material}
                className="specimen"
                data-component={id}
                data-layout={previewLayout(entry)}
                key={id}
              >
                <div className="specimen-inner" onClick={inlinePreview ? submitPreviewForm : undefined}>
                  {ScopedExample ? (
                    <ScopedExample id={id} />
                  ) : entry.family === "Blocks" ? (
                    <BlockExample id={id} />
                  ) : (
                    <Example id={id} />
                  )}
                </div>
              </Yogurt>
              <div className="preview-caption">
                <span>{tokenLabel}</span>
                <Button emphasis="quiet" size="compact"
                  type="button"
                  onClick={() => setCompare(!compare)}
                  aria-expanded={compare}
                >
                  {compare ? "Hide surfaces" : "Compare surfaces"}
                </Button>
              </div>
              {compare && (
                <div className="surface-comparison">
                  {materials.map((m) => (
                    <Yogurt
                      key={m.id}
                      material={m.id as Material}
                      appearance={appearance}
                    >
                      <span className="yg-meta">{m.label}</span>
                      <div className="sample-material">
                        <span>Saved view</span>
                        <Button
                          emphasis="soft"
                          size="compact"
                          onClick={() => setMaterial(m.id as Material)}
                        >
                          Apply
                        </Button>
                      </div>
                    </Yogurt>
                  ))}
                </div>
              )}
              {variants.has(id) && (
                <section className="variation">
                  <Heading>Variations</Heading>
                  <Yogurt
                    appearance={appearance}
                    material={material}
                    className="specimen variant-body"
                    data-variant-component={id}
                    data-layout={previewLayout(entry)}
                    key={id}
                  >
                    <div className="specimen-inner"><Example id={id} variation /></div>
                  </Yogurt>
                </section>
              )}
              {guidance && (
                <section className="catalog-guidance">
                  <Heading>When to use</Heading>
                  <p>{guidance.useWhen}</p>
                  <p className="yg-help">{guidance.avoid}</p>
                  {guidance.combineWith.length > 0 && <>
                    <h3>Works with</h3>
                    <div className="catalog-guidance-links">
                      {guidance.combineWith.map(companion => {
                        const component = catalog.find(item => item.id === companion);
                        return <Link key={companion} href={sectionHref("components", companion)}
                          onClick={event => {
                            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                            event.preventDefault(); go(companion);
                          }}>{component?.name ?? companion}</Link>;
                      })}
                    </div>
                  </>}
                  <h3>Check</h3>
                  <p className="yg-help">{guidance.verify.join(" · ")}</p>
                </section>
              )}
              {id === "button" && (
                <section className="related-actions">
                  <Heading>Related actions</Heading>
                  <p className="yg-help">Use a dedicated action when the interaction has its own state.</p>
                  <div>
                    <Link href={sectionHref("motion", "copy-button")}>Copy</Link>
                    <Link href={sectionHref("motion", "cart-button")}>Quantity</Link>
                    <Link href={sectionHref("motion", "hold-button")}>Hold to confirm</Link>
                    <Link href={sectionHref("motion", "slide-confirm")}>Slide to confirm</Link>
                    <Link href={sectionHref("motion", "loading-to-success")}>Loading result</Link>
                  </div>
                </section>
              )}
              <section className="install-code">
                <Button emphasis="quiet" size="compact"
                  aria-expanded={showCode}
                  onClick={() => setShowCode(!showCode)}
                >
                  Use in a project
                  <Icon name={showCode ? "down" : "next"} />
                </Button>
                {showCode && (
                  <div>
                    <p className="yg-help">
                      From a project with the pinned Yogurt package installed.
                    </p>
                    {motion.filter((item) => item.id === id).map((item) => (
                      <p className="yg-help" key={item.id}>
                        <strong>{item.role}</strong> · {item.treatment}
                      </p>
                    ))}
                    <code>
                      {entry.family === "Blocks"
                        ? "yogurt add " + id + " --target web"
                        : "import { " +
                          entry.name +
                          ' } from "@openboa/yogurt/' +
                          entry.id +
                          '";'}
                    </code>
                    <code>{"yogurt add " + entry.id + " --target native"}</code>
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </Yogurt>
  );
}
const host = document.getElementById("yogurt-ui-library");
if (host) {
  const inlinePreview = window !== window.top && host.hasAttribute("data-initial-component");
  createRoot(host).render(<Catalog inlinePreview={inlinePreview} />);
}
