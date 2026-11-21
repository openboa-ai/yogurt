import { useState } from "react";
import {
  ActionMenu, Button, Calendar, Card, Dialog, Heading, Icon, Inline, Popover,
  ProjectMark, RecordFacts, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader,
  SidebarItem, SidebarLayout, SidebarSubmenu, SidebarTrigger, Stack, Status, Text,
} from "@openboa/yogurt";

const destinations = [
  { id: "overview", label: "Overview", icon: "home", detail: "See work in progress and the next release." },
  { id: "brief", label: "Release brief", icon: "copy", detail: "Review the scope and decisions for the next release." },
  { id: "notes", label: "Review notes", icon: "menu", detail: "Read feedback collected during the release review." },
  { id: "archive", label: "Archive", icon: "bookmark", detail: "Find completed work and past decisions." },
  { id: "settings", label: "Settings", icon: "person", detail: "Manage preferences for this workspace." },
] as const;

export function NavigationPreview({ id }: { id: string }) {
  const [current, setCurrent] = useState<string>("overview");
  const [date, setDate] = useState("2026-11-21");
  const [picker, setPicker] = useState(false);
  const [task, setTask] = useState("brief");
  const [project, setProject] = useState("Studio");
  const selected = destinations.find(item => item.id === current) ?? destinations[0];
  const documents = project === "Studio" ? destinations.slice(1, 3) : destinations.slice(2, 4);
  const choose = (value: string) => { setCurrent(value); setPicker(false); };

  function rows(items: readonly (typeof destinations)[number][]) {
    return items.map(item => <SidebarItem key={item.id} label={item.label} active={item.id === current}
      onSelect={() => choose(item.id)} icon={<Icon name={item.icon} />} />);
  }

  function directory() {
    if (id === "calendar") return <Stack gap={16}>
      <Calendar label="Scheduled work" value={date} onValueChange={setDate} />
      <Text variant="help">Selected {date}</Text>
      {rows(destinations.slice(0, 2))}
    </Stack>;
    if (id === "nested-panes") return <SidebarGroup label="Projects">
      {["Studio", "Operations"].map(name => <SidebarItem key={name} label={name} active={project === name}
        onSelect={() => { setProject(name); setTask(name === "Studio" ? "brief" : "notes"); }} />)}
    </SidebarGroup>;
    if (id === "dropdown") return <>
      {rows(destinations.slice(0, 1))}
      <ActionMenu label="Release documents" items={destinations.slice(1, 3)} onSelect={choose} />
      {rows(destinations.slice(3))}
    </>;
    if (id === "collapsible") return <>
      <SidebarSubmenu label="Workspace" defaultOpen>{rows(destinations.slice(0, 3))}</SidebarSubmenu>
      <SidebarSubmenu label="Administration">{rows(destinations.slice(3))}</SidebarSubmenu>
    </>;
    if (id === "files") return <>
      <SidebarSubmenu label="Project files" defaultOpen>
        <SidebarSubmenu label="Release 2.4" defaultOpen>{rows(destinations.slice(1, 3))}</SidebarSubmenu>
        <SidebarSubmenu label="Past releases">{rows(destinations.slice(3, 4))}</SidebarSubmenu>
      </SidebarSubmenu>
    </>;
    if (id === "nested") return <>
      {rows(destinations.slice(0, 1))}
      <SidebarGroup label="Release documents">{rows(destinations.slice(1, 3))}</SidebarGroup>
      {rows(destinations.slice(3))}
    </>;
    if (id === "floating" || id === "expandable") return <>
      {rows(destinations.slice(0, 1))}
      <SidebarSubmenu label="Release documents" defaultOpen={id === "floating"}
        containsCurrent={current === "brief" || current === "notes"}>{rows(destinations.slice(1, 3))}</SidebarSubmenu>
      {rows(destinations.slice(3))}
    </>;
    return <>
      <SidebarGroup label="Workspace">{rows(destinations.slice(0, 3))}</SidebarGroup>
      {id !== "secondary" && <SidebarGroup label="Administration">{rows(destinations.slice(3))}</SidebarGroup>}
    </>;
  }

  const identity = <Inline><ProjectMark project="yogurt" label="" size={26} /><Text>Fieldwork</Text></Inline>;
  const nav = <>
    <SidebarHeader compact={<ProjectMark project="yogurt" label="Fieldwork" size={26} />}>{identity}</SidebarHeader>
    <SidebarContent label="Workspace destinations">{directory()}</SidebarContent>
    {id === "secondary" && <SidebarFooter compact={rows(destinations.slice(4))}>
      <SidebarGroup label="Support">{rows(destinations.slice(3))}</SidebarGroup>
    </SidebarFooter>}
  </>;
  const detail = id === "nested-panes" ? destinations.find(item => item.id === task) ?? selected : selected;
  const content = <Stack gap={24} className="template-workspace">
    <Inline className={id === "sticky" ? "template-sticky" : undefined}>
      {id !== "dialog" && id !== "popover" && id !== "dual" && id !== "nested-panes" && <SidebarTrigger />}
      <Heading>{detail.label}</Heading>
      {id === "dialog" && <Button emphasis="soft" onClick={() => setPicker(true)}>Find a destination</Button>}
      {id === "popover" && <Popover label="Workspace directory">
        <SidebarContent label="Workspace destinations">{rows(destinations)}</SidebarContent>
      </Popover>}
    </Inline>
    <Text>{detail.detail}</Text>
    {id === "calendar" && <Status>Schedule for {date}</Status>}
    {id === "nested-panes" && <Status>{project} workspace</Status>}
    <Card title="Release 2.4" description="Product operations">
      <Stack gap={12}><Status>In review</Status><Text>Share the brief after the remaining feedback is resolved.</Text></Stack>
    </Card>
    {id === "sticky" && ["Earlier this week", "Decisions", "Release history", "Follow-up"].map(title =>
      <Card key={title} title={title}><Text>Keep this context within the selected workspace.</Text></Card>)}
  </Stack>;

  if (id === "popover" || id === "dialog") return <div className="template-navigation">
    {content}
    {id === "dialog" && <Dialog title="Find a destination" open={picker} onOpenChange={setPicker}>
      <SidebarContent label="Workspace destinations">{rows(destinations)}</SidebarContent>
    </Dialog>}
  </div>;

  return <div className="template-navigation" data-layout={id}>
    <SidebarLayout label="Workspace" navigation={nav} edge={id === "trailing" ? "end" : "start"}
      width={id === "calendar" ? "18rem" : "13rem"} compactAt={630}
      variant={id === "floating" || id === "secondary" ? "inset" : "flat"}
      collapse={id === "icon-rail" ? "rail" : "hide"}>
      {id === "nested-panes" ? <Stack gap={8}>
        <Inline><SidebarTrigger label="Toggle projects" /></Inline>
        <SidebarLayout label="Project documents" width="11rem" compactAt={490} variant="flat" collapse="hide"
          navigation={<SidebarContent label={project + " documents"}>
            {documents.map(item => <SidebarItem key={item.id} label={item.label} active={task === item.id} onSelect={() => setTask(item.id)} />)}
          </SidebarContent>}>
          <Stack gap={8}>
            <Inline><SidebarTrigger label="Toggle documents" /></Inline>
            {content}
          </Stack>
        </SidebarLayout>
      </Stack> : id === "dual" ? <Stack><Inline><SidebarTrigger label="Toggle workspace directory" /></Inline><SidebarLayout label="Release inspector" edge="end" width="13rem"
        navigation={<SidebarContent label="Release details"><RecordFacts title={detail.label} facts={[
          { id: "owner", label: "Owner", value: "Studio" }, { id: "state", label: "State", value: "In review" },
        ]} source="Release register" asOf="2026-11-21T12:00:00Z" /></SidebarContent>}>
        <Stack gap={8}><Inline><SidebarTrigger label="Toggle release inspector" /></Inline>{content}</Stack>
      </SidebarLayout></Stack> : content}
    </SidebarLayout>
  </div>;
}
