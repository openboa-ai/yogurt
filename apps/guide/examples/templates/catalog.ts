export const dashboard = { id: "release-dashboard", title: "Release dashboard", detail: "Review delivery metrics and find a release." };

export const navigation = [
  { id: "grouped", title: "Grouped directory", detail: "Scan destinations grouped by project area." },
  { id: "collapsible", title: "Collapsible groups", detail: "Open only the part of the directory you need." },
  { id: "nested", title: "Visible submenus", detail: "Keep a small set of child destinations visible under its parent." },
  { id: "floating", title: "Floating directory", detail: "Give the directory its own surface within the workspace." },
  { id: "expandable", title: "Expandable submenus", detail: "Expand a group and reveal a second level of destinations." },
  { id: "dropdown", title: "Dropdown submenus", detail: "Find secondary destinations through a compact anchored menu." },
  { id: "icon-rail", title: "Icon rail", detail: "Collapse the directory to named icon actions." },
  { id: "secondary", title: "Inset with secondary navigation", detail: "Keep support and workspace settings below primary destinations." },
  { id: "nested-panes", title: "Nested navigation panes", detail: "Choose a project, then browse its documents in a second pane." },
  { id: "popover", title: "Popover directory", detail: "Reveal a short directory next to its trigger." },
  { id: "files", title: "File tree", detail: "Open folders and select a file without leaving the workspace." },
  { id: "calendar", title: "Calendar directory", detail: "Choose a day before inspecting its scheduled work." },
  { id: "dialog", title: "Dialog directory", detail: "Choose a destination in a temporary workspace picker." },
  { id: "trailing", title: "Trailing inspector", detail: "Place the supporting directory at the end of the task pane." },
  { id: "dual", title: "Two-sided workspace", detail: "Keep destinations on the leading edge and details on the trailing edge." },
  { id: "sticky", title: "Persistent workspace header", detail: "Keep navigation and workspace actions within reach while scrolling." },
] as const;

export const accountLayouts = [
  { id: "centered", title: "Centered", detail: "A focused form with one reading edge." },
  { id: "split", title: "Split with artwork", detail: "Use a separate visual panel alongside the form." },
  { id: "muted", title: "Muted canvas", detail: "Place a form card on a quiet surrounding surface." },
  { id: "framed", title: "Framed with artwork", detail: "Pair the form and visual inside one bounded surface." },
  { id: "email", title: "Email only", detail: "Start with an email address and explain the next step." },
] as const;

export const templateGroups = [
  { label: "Overview", items: [dashboard] },
  { label: "Navigation", items: navigation },
  ...[["Sign in", "signin"], ["Create account", "signup"]].map(([label, prefix]) => ({
    label,
    items: accountLayouts.map(layout => ({
      ...layout, id: prefix + "-" + layout.id, title: label + " · " + layout.title,
    })),
  })),
];

export const studies = [
  { id: "compose", title: "Compose a screen", detail: "Choose a real task, tune supported presentation options and copy the resulting recipe." },
  { id: "type", title: "Typography", detail: "Compare hierarchy and reading rhythm on documentation, records and conversation." },
  { id: "chart", title: "Charts", detail: "Compare time series, category bars and gaps in observed data." },
] as const;

export const galleryGroups = [...templateGroups, { label: "Studies", items: studies }];
