# Compose a project sidebar

Use [SidebarLayout](../components.html#sidebar-layout) for the shared shell and choose what goes inside it. A team can use the same shell for agent navigation, project views or a right-side inspector.

| Part | What the product supplies |
| --- | --- |
| Layout and trigger | A label, panel edge, width and optional controlled collapse. Set `collapse` to `rail`, `hide` or `none`. |
| Header | A workspace mark, switcher, search field or primary action. Supply `compact` for the header shown in the icon rail. |
| Content and groups | A scrollable navigation region, optional group titles and independent actions. |
| Items and submenus | Links or selections, active state, icons, counts, any secondary action and nested destinations. |
| Footer | Account controls, project context or settings. Supply its own compact presentation when needed. |

```tsx
import {
  SidebarLayout, SidebarHeader, SidebarContent, SidebarGroup,
  SidebarSubmenu, SidebarItem, SidebarFooter, SidebarTrigger,
} from "@openboa/yogurt/sidebar-layout";

<SidebarLayout
  label="Team workspace navigation"
  navigation={
    <>
      <SidebarHeader>Team workspace</SidebarHeader>
      <SidebarContent label="Project views">
        <SidebarGroup label="Workspace">
          <SidebarItem label="Overview" href="/work" active={view === "overview"} />
          <SidebarSubmenu label="Reviews" defaultOpen={view === "release"} containsCurrent={view === "release"}>
            <SidebarItem label="Release" href="/work/release" active={view === "release"} />
          </SidebarSubmenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>Team workspace</SidebarFooter>
    </>
  }
>
  <SidebarTrigger showLabel />
  <ProjectView />
</SidebarLayout>
```

On a narrow layout, the trigger opens a modal drawer. Escape, the backdrop and the close action return focus to the trigger. A route or view selection closes the overlay. Control the desktop state with `collapsed` and `onCollapsedChange` when a host saves that preference. Set `edge="end"` for an inspector. The shell measures its own width, so it also works inside a split view.

[AgentSidebar](../components.html#agent-sidebar) supplies a searchable roster with identities and unread labels. [ProjectSidebar](../components.html#project-sidebar) supplies nested views, a search field and optional actions. The [ProjectWorkspace](../components.html#project-workspace) uses the same layout with its own project picker.

```sh
npx yogurt add sidebar-layout --target web
npx yogurt add agent-sidebar --target web
npx yogurt add project-sidebar --target native
```

For Zig and Vercel Native, `sidebar-layout.native` exports a row shell and separate panel, drawer, group, list and destination templates. Each accepts markup children at its slot. Arrange the panel before or after the main view in a row, or put the same navigation in the drawer template when the host opens an overlay. The host owns resize and visibility decisions, authorized destinations, and the typed `select_sidebar_item: u32` and `close_sidebar` messages. The two recipes provide typed search and add actions.

The agent and project compositions are optional editable presets. A project can choose other parts, place them in any of the same slots, and keep its own navigation model. Promote a composition when independent projects show the same behavior and recovery needs. [Compose screens](../DESIGN.md#compose-screens)

The original `Sidebar({ label, links, current })` remains available for a simple collapsible list. [Installation](using-yogurt.md)
