import { useState } from "react";
import {
  Card, Chart, DataTable, EmptyResult, Grid, Heading, Inline, ProjectMark,
  SearchField, SegmentedControl, SidebarContent, SidebarGroup, SidebarHeader, SidebarItem,
  SidebarLayout, SidebarTrigger, Stack, Status, Text,
} from "@openboa/yogurt";

const releases = [
  { id: "2.4", name: "Workspace 2.4", owner: "Studio", state: "In review", tasks: 12 },
  { id: "2.3", name: "Workspace 2.3", owner: "Operations", state: "Published", tasks: 28 },
  { id: "2.2", name: "Workspace 2.2", owner: "Studio", state: "Published", tasks: 24 },
  { id: "2.1", name: "Workspace 2.1", owner: "Studio", state: "Published", tasks: 21 },
];
const columns = [
  { id: "name", label: "Release", sortValue: (row: { id: string }) => row.id },
  { id: "owner", label: "Owner" },
  { id: "state", label: "State" },
  { id: "tasks", label: "Tasks", numeric: true, sortValue: (row: { id: string }) => releases.find(item => item.id === row.id)?.tasks },
];

export function DashboardPreview() {
  const [section, setSection] = useState("overview");
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("week");
  const items = [{ id: "overview", label: "Overview" }, { id: "releases", label: "Release register" }];
  const matches = releases.filter(release => (release.name + " " + release.owner).toLowerCase().includes(query.trim().toLowerCase()));
  return <div className="template-navigation">
    <SidebarLayout label="Release dashboard" variant="flat" compactAt={690} width="12rem"
      navigation={<>
        <SidebarHeader compact={<ProjectMark project="yogurt" label="Fieldwork" size={26} />}>
          <Inline><ProjectMark project="yogurt" label="" size={26} /><Text>Fieldwork</Text></Inline>
        </SidebarHeader>
        <SidebarContent label="Release navigation"><SidebarGroup label="Workspace">
          {items.map(item => <SidebarItem key={item.id} label={item.label} active={section === item.id} onSelect={() => setSection(item.id)} />)}
        </SidebarGroup></SidebarContent>
      </>}>
      <Stack gap={24} className="template-workspace">
        <Inline><SidebarTrigger /><Heading>{items.find(item => item.id === section)?.label}</Heading></Inline>
        {section === "overview" && <>
          <Grid gap={12}>
            <Card title="Published"><strong className="template-metric">12</strong><Text variant="help"> releases this quarter</Text></Card>
            <Card title="In review"><strong className="template-metric">4</strong><Text variant="help"> awaiting a decision</Text></Card>
            <Card title="Open tasks"><strong className="template-metric">28</strong><Text variant="help"> across the workspace</Text></Card>
          </Grid>
          <Stack gap={12}>
            <SegmentedControl label="Chart period" options={[{ id: "week", label: "This week" }, { id: "month", label: "This month" }]}
              value={period} onValueChange={setPeriod} />
            <Chart title="Work completed" series="Completed" unit="tasks" source="Sample release register"
              asOf="2026-11-21T12:00:00Z" points={(period === "week" ? [3, 8, 6, 12] : [9, 18, 24, 28]).map((value, index) =>
                ({ id: String(index), label: period === "week" ? ["Mon", "Tue", "Wed", "Thu"][index] : "Week " + (index + 1), value }))} />
          </Stack>
        </>}
        <Stack gap={12}>
          <SearchField label="Find a release" value={query} onValueChange={setQuery} />
          {matches.length ? <DataTable caption="Release register" columns={columns} rows={matches.map(release => ({
            id: release.id, cells: { name: release.name, owner: release.owner, state: <Status>{release.state}</Status>, tasks: release.tasks },
          }))} /> : <EmptyResult query={query} onClear={() => setQuery("")} />}
        </Stack>
      </Stack>
    </SidebarLayout>
  </div>;
}
