import blocks from "../../../catalog/blocks.json";
import { BlockExample } from "../examples/block-examples";
import { useState } from "react";
import {
  Button, Heading, Inline, Link, PageHeader, SidebarContent, SidebarGroup, SidebarItem, SidebarLayout,
  SidebarTrigger, Stack, Text,
} from "@openboa/yogurt";
import { AccountPreview } from "../examples/templates/account";
import { dashboard, galleryGroups, studies } from "../examples/templates/catalog";
import { DashboardPreview } from "../examples/templates/dashboard";
import { NavigationPreview } from "../examples/templates/navigation";
import { ComposeStudy, ChartStudy, TypeStudy } from "../examples/templates/studies";
import { recipeFamilies } from "../examples/templates/recipes";
import { TemplateFamily, PatternGallery } from "./template-directory";
import "./templates.css";

const paths = (id: string) => "/patterns/" + id;
const groups = galleryGroups.flatMap(group => group.items);
const fullWidthBlocks = new Set([
  "agent-workspace", "project-workspace", "agent-sidebar", "project-sidebar",
]);

const related = {
  compose: ["card", "button-group", "switch", "record-facts"],
  type: ["heading", "stack", "text"],
  chart: ["chart", "segmented-control"],
  dashboard: ["sidebar-layout", "card", "chart", "data-table", "search-field"],
  account: ["text-field", "button", "notice", "surface"],
  navigation: ["sidebar-layout", "card"],
  variants: {
    dropdown: ["action-menu"],
    popover: ["popover"],
    dialog: ["dialog"],
    calendar: ["calendar"],
    dual: ["record-facts"],
  } as Record<string, string[]>,
};

export default function Templates({ id = "", appearance }: { id?: string; appearance: "light" | "dark" }) {
  const [reset, setReset] = useState(0);
  if (!id) return <PatternGallery />;
  const block = blocks.find(item => item.id === id);
  if (block) return <main className="guide-templates">
    <Stack gap={24}>
      <PageHeader title={block.name} detail={block.description} action={<Link className="guide-chip-link" href="/patterns">All patterns</Link>} />
      <div className="template-preview">
        <Inline className="template-preview-heading">
          <Heading level={2}>Live preview</Heading>
          <Button emphasis="quiet" size="compact" onClick={() => setReset(value => value + 1)}>Reset preview</Button>
        </Inline>
        <div
          className="template-stage"
          data-layout={fullWidthBlocks.has(id) ? "full" : "centered"}
          data-pattern-stage={id}
          key={id + ":" + reset}
        >
          <BlockExample id={id} />
        </div>
      </div>
      <Stack gap={8}>
        <Heading level={2}>When to use it</Heading>
        <Text>{block.guidance}</Text>
      </Stack>
      <Stack gap={8}>
        <Heading level={2}>Components used</Heading>
        <Inline className="template-component-links">
          {block.components.map(component => <Link key={component} className="guide-chip-link" href={"/components/" + component}>{component}</Link>)}
        </Inline>
        {["agent-workspace", "agent-sidebar", "conversation-panel", "agent-profile"].includes(id) &&
          <Link href="/examples">See it in Sourdough Studio</Link>}
      </Stack>
    </Stack>
  </main>;
  const family = recipeFamilies.find(group => group.id === id || group.recipes.some(recipe => recipe.id === id));
  if (family) return <TemplateFamily family={family} initialId={id} appearance={appearance} />;
  const entry = groups.find(item => item.id === id);
  if (!entry) return <main className="guide-templates">
    <PageHeader title="Pattern not found" action={<Link href="/patterns">Browse patterns</Link>} />
  </main>;
  const account = id.startsWith("signin-") || id.startsWith("signup-");
  const group = galleryGroups.find(group => group.items.some(item => item.id === id))!;
  const components = id === dashboard.id ? related.dashboard : account ? related.account
    : id === "compose" || id === "type" || id === "chart" ? related[id] : [...related.navigation, ...(related.variants[id] ?? [])];

  return <main className="guide-templates">
    <SidebarLayout label="Pattern directory" variant="flat" width="13rem" compactAt={810}
      navigation={<SidebarContent label="Pattern directory">
        <SidebarGroup label="Patterns">
          <SidebarItem label="All patterns" href="/patterns" />
          {studies.map(item => <SidebarItem key={item.id} label={item.title} active={item.id === id} href={paths(item.id)} />)}
        </SidebarGroup>
      </SidebarContent>}>
      <Stack gap={24} className="template-detail">
        <PageHeader title={entry.title} detail={entry.detail} eyebrow={group.label} />
        <div className="template-preview">
          <Inline className="template-preview-heading">
            <Inline><SidebarTrigger label="Browse patterns" /><Heading level={2}>Live preview</Heading></Inline>
            <Button emphasis="quiet" size="compact" onClick={() => setReset(value => value + 1)}>Reset preview</Button>
          </Inline>
          <div className="template-stage" key={id + ":" + reset}>
            {id === "compose" ? <ComposeStudy key={appearance} guideAppearance={appearance} />
              : id === "type" ? <TypeStudy />
              : id === "chart" ? <ChartStudy />
              : id === dashboard.id ? <DashboardPreview />
              : account ? <AccountPreview id={id} /> : <NavigationPreview id={id} />}
          </div>
        </div>
        <Stack gap={8}>
          <Heading level={2}>Components used</Heading>
          <Inline className="template-component-links">
            {components.map(item => <Link key={item} className="guide-chip-link" href={"/components/" + item}>{item}</Link>)}
          </Inline>
          {studies.some(item => item.id === id) && <Text variant="help">Use these building blocks in the full workspace example. <Link href="/examples/sourdough">Open Sourdough</Link></Text>}
        </Stack>
      </Stack>
    </SidebarLayout>
  </main>;
}
