import samples from "../../../catalog/specimens/components.json";
import { useState } from "react";
import {
  Breadcrumb, Button, Heading, Icon, Inline, ProjectMark, SegmentedControl,
  SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarItem,
  SidebarLayout, SidebarSubmenu, SidebarTrigger, Stack, Text,
  type AgentSummary,
} from "@openboa/yogurt";
import { AgentSidebar } from "../../../packages/recipes/agent-sidebar/web";
import { ProjectSidebar } from "../../../packages/recipes/project-sidebar/web";

const agents: AgentSummary[] = [
  {id: "kai", name: "Kai", role: "Release lead", state: "waiting", art: "Kai", pinned: true, unread: true},
  {id: "sol", name: "Sol", role: "Research lead", state: "working", art: "Sol"},
];
const projectSample = samples["project-sidebar"];
const sections = projectSample.sections.map((section) => ({
  ...section,
  icon: <Icon name={section.id === "delivery" ? "check" : "copy"} />,
}));


export function SidebarExample({ id }: { id: string }) {
  const [selected, setSelected] = useState(id === "agent-sidebar" ? "kai" : id === "project-sidebar" ? "reviews" : "overview");
  const [edge, setEdge] = useState<"start" | "end">("start");
  const [collapsed, setCollapsed] = useState(false);
  const [result, setResult] = useState("");

  function select(next: string) {
    setSelected(next);
    setResult("");
  }

  const active = agents.find((agent) => agent.id === selected)?.name ??
    sections.flatMap((section) => section.items).find((item) => item.id === selected)?.title ??
    (selected === "queue" ? "Review queue" : "Overview");
  const navigation = id === "agent-sidebar" ? (
    <AgentSidebar agents={agents} currentId={selected} onSelect={select}
      onNew={() => setResult("Draft conversation opened in this preview.")} />
  ) : id === "project-sidebar" ? (
    <ProjectSidebar title={projectSample.title} mark="meatball" sections={sections} currentId={selected} onSelect={select}
      onAdd={() => setResult("New view opened in this preview.")} footer={<Text variant="meta">{projectSample.footer}</Text>} />
  ) : (
    <>
      <SidebarHeader compact={<ProjectMark project="yogurt" size={24} label="" />}>
        <Inline gap={8}><ProjectMark project="yogurt" size={24} label="" /><Heading level={3}>Yogurt</Heading></Inline>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup label="Workspace">
          <SidebarItem label="Overview" icon={<Icon name="info" />} active={selected === "overview"} onSelect={() => select("overview")} />
          <SidebarSubmenu label="Work" icon={<Icon name="menu" />} defaultOpen>
            <SidebarItem label="Review queue" active={selected === "queue"} onSelect={() => select("queue")} />
          </SidebarSubmenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter><Text variant="meta">Team workspace</Text></SidebarFooter>
    </>
  );

  return (
    <Stack gap={12}>
      {id === "sidebar-layout" && <SegmentedControl label="Sidebar position" value={edge}
        options={[{id:"start",label:"Start"},{id:"end",label:"End"}]}
        onValueChange={(value) => setEdge(value === "end" ? "end" : "start")} />}
      <SidebarLayout label={id === "agent-sidebar" ? "Agents" : "Project navigation"} edge={edge}
        collapsed={collapsed} onCollapsedChange={setCollapsed} navigation={navigation}>
        <Stack gap={16} className="sidebar-sample-main">
          <Inline gap={8}>
            <SidebarTrigger />
            <Breadcrumb items={[
              {id:"workspace",href:"#"+id,label:"Workspace"},
              {id:selected,href:"#"+id,label:active},
            ]} />
          </Inline>
          <Stack gap={4}>
            <Heading>{active}</Heading>
            <Text variant="help">{id === "agent-sidebar" ? "Read the conversation with " + active + "." : "Review the latest work in " + active + "."}</Text>
          </Stack>
          {result && <Text role="status">{result}</Text>}
          {id === "sidebar-layout" && <Button emphasis="quiet" onClick={() => select("overview")}>Return to overview</Button>}
        </Stack>
      </SidebarLayout>
    </Stack>
  );
}
