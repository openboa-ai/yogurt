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
  "sidebar-layout", "agent-avatar", "transcript", "navbar", "navigation-menu", "menubar",
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
  "bottom-action",
  "icon-button",
  "stack",
  "inline",
  "grid",
  "text-field",
  "textarea",
  "search-field",
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
  try {
    const id =
      decodeURIComponent(location.hash.slice(1)) ||
      document.getElementById("yogurt-ui-library")?.dataset.initialComponent;
    return id === "brand"
      ? id
      : (entries.find((e) => e.id === id)?.id ?? "button");
  } catch {
    return "button";
  }
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
  const ScopedExample = scopedExamples[id as keyof typeof scopedExamples];
  useEffect(() => {
    const listener = () => {
      const next = keyFromHash();
      select(next);
      setMenu(false);
      setShowCode(false);
    };
    addEventListener("hashchange", listener);
    return () => removeEventListener("hashchange", listener);
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
    location.hash = next;
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
          <button
            aria-current={id !== "brand" ? "page" : undefined}
            onClick={() => go("button")}
          >
            Components
          </button>
          <button
            aria-current={id === "brand" ? "page" : undefined}
            onClick={() => go("brand")}
          >
            Brand &amp; tokens
          </button>
          <a href="motion-patterns.html">Motion</a>
          <a href="workflows.html">Workflows</a>
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
            <Icon name="search" />
            <input
              aria-label="Find a component"
              placeholder="Find a component"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <IconButton
                label="Clear component search"
                icon="close"
                onClick={() => setSearch("")}
              />
            )}
          </div>
          <nav aria-label="Component index">
            {families.map((f) => {
              const rows = matches.filter((e) => e.family === f);
              if (!rows.length) return null;
              const open = !!search || expanded.includes(f);
              return (
                <div className="nav-family" key={f}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() =>
                      expand((a) =>
                        a.includes(f) ? a.filter((v) => v !== f) : [...a, f],
                      )
                    }
                  >
                    {f}
                    <Icon name={open ? "down" : "next"} />
                  </button>
                  {open &&
                    rows.map((e) => (
                      <a
                        key={e.id}
                        href={"#" + e.id}
                        aria-current={e.id === id ? "page" : undefined}
                        onClick={(ev) => {
                          ev.preventDefault();
                          go(e.id);
                        }}
                      >
                        {e.name}
                      </a>
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
          {id === "brand" ? (
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
                <button
                  type="button"
                  onClick={() => setCompare(!compare)}
                  aria-expanded={compare}
                >
                  {compare ? "Hide surfaces" : "Compare surfaces"}
                </button>
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
                    data-layout={previewLayout(entry)}
                    key={id}
                  >
                    <div className="specimen-inner"><Example id={id} variation /></div>
                  </Yogurt>
                </section>
              )}
              <section className="install-code">
                <button
                  aria-expanded={showCode}
                  onClick={() => setShowCode(!showCode)}
                >
                  Use in a project
                  <Icon name={showCode ? "down" : "next"} />
                </button>
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
