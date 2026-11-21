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
import { TemplateFamily, TemplateGallery } from "./template-directory";
import "./templates.css";

const paths = (id: string) => "/templates/" + id;
const groups = galleryGroups.flatMap(group => group.items);
const related = {
  compose: ["card", "button-group", "switch", "record-facts"],
  type: ["post", "heading", "stack", "text"],
  chart: ["chart", "bar-chart", "legend", "segmented-control"],
  dashboard: ["sidebar-layout", "card", "chart", "data-table", "search-field"],
  account: ["form", "text-field", "button", "notice", "surface"],
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
  if (!id) return <TemplateGallery appearance={appearance} />;
  const family = recipeFamilies.find(group => group.id === id || group.recipes.some(recipe => recipe.id === id));
  if (family) return <TemplateFamily family={family} initialId={id} appearance={appearance} />;
  const entry = groups.find(item => item.id === id);
  if (!entry) return <main className="guide-templates">
    <PageHeader title="Template not found" action={<Link href="/templates">Browse templates</Link>} />
  </main>;
  const account = id.startsWith("signin-") || id.startsWith("signup-");
  const group = galleryGroups.find(group => group.items.some(item => item.id === id))!;
  const components = id === dashboard.id ? related.dashboard : account ? related.account
    : id === "compose" || id === "type" || id === "chart" ? related[id] : [...related.navigation, ...(related.variants[id] ?? [])];

  return <main className="guide-templates">
    <SidebarLayout label="Template directory" variant="flat" width="13rem" compactAt={810}
      navigation={<SidebarContent label="Template directory">
        <SidebarGroup label="Templates">
          <SidebarItem label="All templates" href="/templates" />
          {studies.map(item => <SidebarItem key={item.id} label={item.title} active={item.id === id} href={paths(item.id)} />)}
        </SidebarGroup>
      </SidebarContent>}>
      <Stack gap={24} className="template-detail">
        <PageHeader title={entry.title} detail={entry.detail} eyebrow={group.label} />
        <div className="template-preview">
          <Inline className="template-preview-heading">
            <Inline><SidebarTrigger label="Browse templates" /><Heading level={2}>Live preview</Heading></Inline>
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
          <Inline>{components.map(item => <Link key={item} href={"/components/" + item}>{item}</Link>)}</Inline>
          {studies.some(item => item.id === id) && <Text variant="help">Use these building blocks in the full workspace example. <Link href="/examples/sourdough">Open Sourdough</Link></Text>}
        </Stack>
      </Stack>
    </SidebarLayout>
  </main>;
}
