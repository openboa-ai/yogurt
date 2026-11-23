import { useEffect, useId, useMemo, useRef, useState, type ComponentType, type MouseEvent } from "react";
import {
  Yogurt,
  PageHeader,
  ProjectMark,
  Button,
  CodeBlock,
  IconButton,
  Icon,
  Heading,
  Inline,
  Stack,
  Text,
  SegmentedControl,
  SearchField,
  SidebarContent,
  SidebarItem,
  SidebarSubmenu,
  Link,
  type Material,
} from "@openboa/yogurt";
import catalog from "../../catalog/components.json";
import specimenLayout from "../../catalog/specimens/layout.json";
import motion from "../../catalog/motion.json";
import motionCatalog from "../../catalog/motion-components.json";
import blocks from "../../catalog/blocks.json";
import { BlockExample } from "./examples/block-examples";
import { BrandTokens } from "./brand-tokens";
import { Example } from "./examples/ui-examples";
import { scopedExamples } from "./examples/scoped-examples";
import { componentAliases, componentPreviews, previewExport } from "./component-previews";
import { guideHref, locationId, navigateSection, sectionHref } from "./routing";
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
const compactPreviews = new Set(specimenLayout.compact);
const widePreviews = new Set(specimenLayout.wide);
const wideFamilies = new Set(specimenLayout.wideFamilies);
function previewLayout(entry: {id: string; family: string}) {
  if (compactPreviews.has(entry.id)) return "compact";
  if (wideFamilies.has(entry.family) || widePreviews.has(entry.id)) return "wide";
  return "field";
}
const previewName = (id: string) => id[0].toUpperCase() + id.slice(1).replaceAll("-", " ");
const motionFamily: Record<string, string> = {
  "motion-cart-button": "Actions", "motion-copy-button": "Actions", "motion-hold-button": "Actions",
  "motion-slide-confirm": "Actions", "motion-loading-success-button": "Actions",
  "motion-mention-picker": "Forms", "motion-file-drop": "Forms", "motion-focus-picker": "Forms",
  "motion-plan-switch": "Forms", "motion-letter-limit": "Forms", "motion-spring-dropdown": "Forms",
  "motion-range-slider": "Forms", "motion-checkbox-list": "Forms", "motion-detent-dial": "Forms",
  "motion-password-strength": "Forms", "motion-ghost-suggestion": "Forms",
  "motion-morph-tooltip": "Layers", "motion-command-button": "Layers",
  "motion-morph-tooltip-bar": "Layers",
  "motion-storage-meter": "Data", "motion-stat-card": "Data",
  "motion-prompt-box": "Workspaces", "motion-streaming-reply": "Identity & conversation",
  "motion-expand-card": "Foundations", "motion-fan-cards": "Foundations",
  "motion-profile-card": "Identity & conversation", "motion-task-list": "Collections",
};
const motionEntries = motionCatalog.components.filter(component => component.examples.length).map(component => ({
  ...component,
  family: motionFamily[component.id] ?? "Feedback",
  description: component.guidance.useWhen,
  guidance: { ...component.guidance, combineWith: [] as string[] },
}));
const offlineEntries = [...entries, ...motionEntries];
const hostedEntries = [...catalog, ...motionEntries.filter(entry => !componentAliases.has(entry.id))];
const searchIndex = offlineEntries.map((entry) => {
  const names = [
    entry.name,
    entry.family,
    entry.id,
    ...(componentPreviews[entry.id] ?? []),
  ].map(foldName);
  return { entry, text: names.join(" "), aliases: names.map(compactName) };
});
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
export function Catalog({ inlinePreview = false, guideAppearance, motionPreview: MotionPreview, route }: {
  inlinePreview?: boolean;
  guideAppearance?: "light" | "dark";
  motionPreview?: ComponentType<{ id: string }>;
  route?: { id: string; preview: string | null };
}) {
  const [standaloneId, select] = useState(keyFromHash),
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
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const lastRevealed = useRef<string>(null);
  const navigationId = useId();
  const id = route?.id ?? standaloneId;
  const availableEntries = guideAppearance ? hostedEntries : MotionPreview ? offlineEntries : entries;
  const families = [...new Set(availableEntries.map(item => item.family))];
  const entry = availableEntries.find(item => item.id === id) ?? availableEntries[0];
  const motionEntry = "examples" in entry ? entry : undefined;
  const previewChoices = guideAppearance ? componentPreviews[id] : undefined;
  const previewId = route?.preview;
  const activePreview = previewId && previewChoices?.includes(previewId) ? previewId : undefined;
  const guidance = "guidance" in entry && typeof entry.guidance === "object" ? entry.guidance : undefined;
  const missing = id !== "brand" && !availableEntries.some((item) => item.id === id);
  const ScopedExample = scopedExamples[id];
  const hosted = Boolean(route);
  useEffect(() => {
    if (hosted) return;
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
  }, [hosted]);
  useEffect(() => {
    setMenu(false);
    setShowCode(false);
  }, [id]);
  useEffect(() => {
    expand((all) =>
      all.includes(entry.family) ? all : [...all, entry.family],
    );
  }, [entry.family]);
  useEffect(() => {
    const list = navigation.current?.querySelector("nav");
    if (!list?.clientHeight || search) {
      lastRevealed.current = null;
      return;
    }
    const active = list.querySelector("a[aria-current=page]");
    if (!active || active.closest("[inert]") || lastRevealed.current === id) return;
    lastRevealed.current = id;
    const available = list.getBoundingClientRect();
    const row = active.getBoundingClientRect();
    if (row.top < available.top) list.scrollTop += row.top - available.top;
    if (row.bottom > available.bottom) list.scrollTop += row.bottom - available.bottom;
  }, [id, expanded, menu, search]);
  useEffect(() => {
    if (menu && hosted) navigation.current?.querySelector("input")?.focus({ preventScroll: true });
  }, [menu, hosted]);
  const matches = useMemo(() => {
    const term = foldName(search.trim());
    const compact = compactName(term);
    return searchIndex
      .filter(({ entry }) => availableEntries.includes(entry))
      .filter(({ text, aliases }) =>
        text.includes(term) ||
        (compact.length > 0 && aliases.some((alias) => alias.includes(compact))),
      )
      .map(({ entry }) => entry);
  }, [search, availableEntries]);
  function go(next: string) {
    select(next);
    setMenu(false);
    setShowCode(false);
    navigateSection("components", next);
  }
  const appearance = guideAppearance ?? (dark ? "dark" : "light");
  const tokenLabel = {
    button: "Regular action · 36 px high · 8 px corners",
    "motion-spring-dropdown": "Featured picker · 52 px high · 16 px corners",
  }[id];
  return (
    <Yogurt appearance={appearance} className="catalog" data-hosted={hosted || undefined}>
      <Link className="skip" href="#yg-inspect">
        Skip to component
      </Link>
      {!guideAppearance && <header className="catalog-header">
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
          <Link href={guideHref("workflows")}>Workflows</Link>
        </nav>
        <div className="header-actions">
          <IconButton
            className="menu-toggle"
            label={menu ? "Close navigation" : "Browse components"}
            icon={menu ? "close" : "menu"}
            onClick={() => setMenu(open => !open)}
            aria-expanded={menu} aria-controls={navigationId}
          />
          <IconButton
            label={dark ? "Use light appearance" : "Use dark appearance"}
            icon={dark ? "sun" : "moon"}
            onClick={() => setDark(!dark)}
          />
        </div>
      </header>}
      {guideAppearance && <div className="guide-catalog-tools">
        <Button ref={menuTrigger} emphasis="quiet" onClick={() => setMenu(open => !open)}
          aria-expanded={menu} aria-controls={navigationId}>
          <Icon name={menu ? "close" : "menu"} />Browse components
        </Button>
      </div>}
      <div className="catalog-body">
        <aside ref={navigation} id={navigationId} data-open={menu} aria-label="Components" onKeyDown={event => {
          if (event.key !== "Escape" || !menu || !hosted) return;
          setMenu(false);
          menuTrigger.current?.focus({ preventScroll: true });
        }}>
          <div className="catalog-search">
            <SearchField label="Find a component" placeholder="Find a component"
              value={search} onValueChange={setSearch} />
          </div>
          <SidebarContent label="Component index">
            {families.map(family => {
              const rows = matches.filter(item => item.family === family);
              if (!rows.length) return null;
              return <SidebarSubmenu key={family} label={family}
                containsCurrent={rows.some(item => item.id === id)}
                open={!!search || expanded.includes(family)}
                onOpenChange={open => expand(previous => open
                  ? [...new Set([...previous, family])]
                  : previous.filter(item => item !== family))}>
                {rows.map(item => <SidebarItem key={item.id} label={item.name} active={item.id === id}
                  href={sectionHref("components", item.id)} onSelect={() => setMenu(false)} />)}
              </SidebarSubmenu>;
            })}
            {!matches.length && <Text variant="help">No matching components.</Text>}
          </SidebarContent>
        </aside>
        <main id="yg-inspect" tabIndex={-1}>
          {missing ? (
            <PageHeader className="catalog-intro" title="Component not found" detail="Choose a component from the index."
              action={<Link href={sectionHref("components", "button")} onClick={event => {
                if (hosted || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault(); go("button");
              }}>Browse components</Link>} />
          ) : id === "brand" ? (
            <BrandTokens />
          ) : (
            <>
              <PageHeader className="catalog-intro" title={entry.name} detail={entry.description} eyebrow={entry.family} />
              <Inline className="preview-tools">
                <Heading level={2}>Preview</Heading>
                <SegmentedControl
                  label="Neutral palette"
                  options={materials}
                  value={material}
                  onValueChange={(v) => setMaterial(v as Material)}
                />
              </Inline>
              {previewChoices && <Inline className="preview-caption">
                <Link href={sectionHref("components", id)} aria-current={!activePreview ? "page" : undefined}>Default</Link>
                {previewChoices.map(key => <Link key={key} href={sectionHref("components", id) + "?preview=" + key}
                  aria-current={activePreview === key ? "page" : undefined}>{previewName(key)}</Link>)}
              </Inline>}
              <Yogurt
                appearance={appearance}
                material={material}
                className="specimen"
                data-component={id}
                data-layout={previewLayout(entry)}
                key={id + (activePreview ?? "")}
              >
                <div className="specimen-inner" onClick={inlinePreview ? submitPreviewForm : undefined}>
                  {MotionPreview && activePreview ? (
                    <MotionPreview id={activePreview} />
                  ) : entry.family === "Blocks" ? (
                    <BlockExample id={id} />
                  ) : ScopedExample ? (
                    <ScopedExample id={id} />
                  ) : MotionPreview && motionEntry ? (
                    <MotionPreview id={motionEntry.examples[0]} />
                  ) : (
                    <Example id={id} />
                  )}
                </div>
              </Yogurt>
              <Inline className="preview-caption preview-surface-controls">
                {tokenLabel && <Text variant="meta">{tokenLabel}</Text>}
                <Button emphasis="quiet" size="compact"
                  type="button"
                  onClick={() => setCompare(!compare)}
                  aria-expanded={compare}
                >
                  {compare ? "Hide surfaces" : "Compare surfaces"}
                </Button>
              </Inline>
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
                  <Stack gap={12}>
                  <Heading>When to use</Heading>
                  <Text>{guidance.useWhen}</Text>
                  <Text variant="help">{guidance.avoid}</Text>
                  {guidance.combineWith.length > 0 && <>
                    <Heading level={3}>Works with</Heading>
                    <Inline className="catalog-guidance-links" gap={12}>
                      {guidance.combineWith.map(companion => {
                        const component = catalog.find(item => item.id === companion);
                        return <Link key={companion} href={sectionHref("components", companion)}
                          onClick={event => {
                            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                            event.preventDefault(); go(companion);
                          }}>{component?.name ?? companion}</Link>;
                      })}
                    </Inline>
                  </>}
                  <Heading level={3}>Check</Heading>
                  <Text variant="help">{guidance.verify.join(" · ")}</Text>
                  </Stack>
                </section>
              )}
              {id === "button" && (
                <section className="related-actions">
                  <Heading>Related actions</Heading>
                  <Text variant="help">Use a dedicated action when the interaction has its own state.</Text>
                  <div>
                    {[
                      ["copy-button", "Copy"],
                      ["cart-button", "Quantity"],
                      ["hold-button", "Hold to confirm"],
                      ["slide-confirm", "Slide to confirm"],
                      ["loading-to-success", "Loading result"],
                    ].map(([example, label]) => {
                      const component = motionEntries.find(item => item.examples.includes(example));
                      const href = sectionHref("components", component?.id);
                      return <Link key={example} href={href}>{label}</Link>;
                    })}
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
                {showCode && <Stack gap={12}>
                  <Text variant="help">From a project with the pinned Yogurt package installed.</Text>
                  <CodeBlock language={entry.family === "Blocks" ? "Shell" : "TypeScript"} code={
                    motionEntry ? `import { ${motionEntry.name} } from "@openboa/yogurt/${motionEntry.id}";`
                      : entry.family === "Blocks" ? "yogurt add " + id + " --target web"
                        : `import { ${(activePreview && previewExport(id, activePreview)) || entry.name} } from "@openboa/yogurt/${entry.id}";`
                  } />
                  {motion.filter(item => item.id === id).map(item => <Text variant="help" key={item.id}>
                    <strong>{item.role}</strong> · {item.treatment}
                  </Text>)}
                </Stack>}
              </section>
            </>
          )}
        </main>
      </div>
    </Yogurt>
  );
}
