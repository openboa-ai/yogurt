import samples from "../../../catalog/specimens/components.json";
import { sectionHref } from "../routing";
import { useEffect, useRef, useState, type ReactNode } from "react";
import * as Y from "@openboa/yogurt";
import { AgentMotionExample } from "./agent-motion-example";
import { ExtendedExample } from "./extended-examples";

export function SpecimenMatrix({ children }: { children: ReactNode }) {
  return <div className="specimen-matrix">{children}</div>;
}

export function MatrixRow({
  label,
  stack = false,
  children,
}: {
  label: string;
  stack?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="specimen-matrix-row">
      <Y.Text variant="meta" className="specimen-matrix-label">{label}</Y.Text>
      <div className="specimen-matrix-cells" data-stack={stack || undefined}>
        {children}
      </div>
    </div>
  );
}

const projects: Y.Option[] = samples["segmented-control"].options;
const observation = {
  source: "Local sample",
  asOf: "2026-11-20T09:00:00Z",
  timeLabel: "Nov 20, 09:00 UTC",
};
const points = samples.readings.points;
const records = samples.records;
const titles = Array.from({ length: 8 }, (_, i) => "Review " + (i + 1));
export function Example({
  id,
  variation = false,
}: {
  id: string;
  variation?: boolean;
}) {
  const [value, setValue] = useState(samples.dialog.value),
    [choice, setChoice] = useState("sourdough"),
    [active, setActive] = useState(true),
    [open, setOpen] = useState(false),
    [query, setQuery] = useState(""),
    [selected, setSelected] = useState<string[]>(["sourdough"]),
    [count, setCount] = useState(1),
    [pending, setPending] = useState(false),
    [note, setNote] = useState(""),
    [confirmed, setConfirmed] = useState(false);
  const lock = useRef(false),
    timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined),
    field = useRef<HTMLInputElement>(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  function save() {
    if (lock.current) return;
    lock.current = true;
    setPending(true);
    setNote("");
    timer.current = setTimeout(() => {
      lock.current = false;
      setPending(false);
      setNote("View saved.");
    }, 480);
  }
  const primary = (
    <Y.Button pending={pending} onClick={save}>
      {samples.button.label}
    </Y.Button>
  );
  const status = (
    <span className="sample-response" role="status">
      {note}
    </span>
  );
  const mode = {
    options: projects,
    label: samples["segmented-control"].label,
    value: choice,
    onValueChange: setChoice,
  };
  const dates = (
    <Y.Switch
      checked={active}
      onCheckedChange={setActive}
      label={samples.switch.label}
      help={variation ? "Show the last change in each row." : undefined}
    />
  );
  const mark = (p: Y.Project = "sourdough") => (
    <Y.ProjectMark project={p} size={32} />
  );
  const list = (
    <Y.List label="Saved views">
      {records
        .filter((r) => r.title.toLowerCase().includes(query.toLowerCase()))
        .map((r) => (
          <Y.ListRow
            key={r.id}
            title={r.title}
            leading={variation ? mark() : undefined}
            description={variation ? "Sourdough" : undefined}
            trailing={active ? r.day : undefined}
            onActivate={() => setNote("Opened " + r.title + ".")}
          />
        ))}
    </Y.List>
  );
  const facts = [
    { id: "views", label: "Saved views", value: 12 },
    { id: "coverage", label: "Coverage", value: 5, unit: "days" },
  ];
  const sampleTable = (
    <Y.DataTable
      caption={samples.readings.label}
      columns={[
        { id: "label", label: samples.readings.day },
        {
          id: "value",
          label: samples.readings.reviews,
          numeric: true,
          sortValue: (row) =>
            typeof row.cells.value === "number" ? row.cells.value : null,
        },
      ]}
      rows={points.map((p) => ({
        id: p.id,
        cells: { label: p.label, value: p.value },
      }))}
    />
  );
  switch (id) {
    case "yogurt":
    case "surface":
      return (
        <Y.Surface>
          <Y.Stack>
            {mark()}
            <Y.Heading>Weekly review</Y.Heading>
            <Y.Text variant="help">A saved view in Sourdough.</Y.Text>
          </Y.Stack>
        </Y.Surface>
      );
    case "text":
      return (
        <Y.Stack gap={4}>
          <Y.Text>{samples.text.body}</Y.Text>
          <Y.Text variant="help">{samples.text.help}</Y.Text>
          <Y.Text variant="meta">{samples.text.meta}</Y.Text>
        </Y.Stack>
      );
    case "heading":
      return (
        <Y.Stack gap={4}>
          <Y.Heading>{samples.heading.title}</Y.Heading>
          <Y.Text variant="help">{samples.heading.help}</Y.Text>
        </Y.Stack>
      );
    case "icon":
      return (
        <Y.Inline gap={16}>
          {(["search", "check", "down", "arrow", "clock"] as const).map((n) => (
            <Y.Icon key={n} name={n} label={n} />
          ))}
        </Y.Inline>
      );
    case "stack":
    case "inline":
    case "grid": {
      const Layout =
        id === "stack" ? Y.Stack : id === "inline" ? Y.Inline : Y.Grid;
      return (
        <Layout gap={variation ? 16 : 8}>
          {projects.map((p) => (
            <Y.Inline key={p.id}>
              {mark(p.id as Y.Project)}
              {p.label}
            </Y.Inline>
          ))}
        </Layout>
      );
    }
    case "divider":
      return (
        <div>
          <Y.Text>Current review</Y.Text>
          <Y.Divider />
          <Y.Text variant="help">Archived on Friday</Y.Text>
        </div>
      );
    case "scroll-area":
      return (
        <Y.ScrollArea className="sample-scroll" label="Past reviews">
          <Y.Stack>
            {titles.map((t) => (
              <Y.Text key={t}>{t}</Y.Text>
            ))}
          </Y.Stack>
        </Y.ScrollArea>
      );
    case "button":
      return (
        <Y.Stack gap={variation ? 16 : 10}>
          {variation ? (
            <>
              <Y.Stack gap={8}>
                <Y.Text variant="help">Emphasis</Y.Text>
                <Y.ButtonGroup label="Button emphasis">
                  {primary}
                  <Y.Button emphasis="soft" onClick={() => setNote("Draft kept.")}>Keep as draft</Y.Button>
                  <Y.Button emphasis="quiet" onClick={() => setNote("Changes discarded.")}>Discard</Y.Button>
                </Y.ButtonGroup>
              </Y.Stack>
              <Y.Stack gap={8}>
                <Y.Text variant="help">Size</Y.Text>
                <Y.ButtonGroup label="Button sizes">
                  {(["compact", "regular", "comfortable", "spacious", "touch"] as const).map(size => {
                    const label = size[0].toUpperCase() + size.slice(1);
                    return <Y.Button key={size} size={size} emphasis="soft"
                      onClick={() => setNote(label + " action selected.")}>{label}</Y.Button>;
                  })}
                </Y.ButtonGroup>
              </Y.Stack>
              <Y.Stack gap={8}>
                <Y.Text variant="help">Shape</Y.Text>
                <Y.ButtonGroup label="Button shapes">
                  <Y.Button emphasis="soft" onClick={() => setNote("Draft opened.")}>Open draft</Y.Button>
                  <Y.Button emphasis="soft" shape="pill" onClick={() => setNote("Draft kept.")}>Keep draft</Y.Button>
                </Y.ButtonGroup>
              </Y.Stack>
            </>
          ) : (
            <SpecimenMatrix>
              <MatrixRow label="Emphasis">
                <Y.ButtonGroup label="View actions">
                  {primary}
                  <Y.Button emphasis="soft" onClick={() => setNote("Draft kept.")}>Keep draft</Y.Button>
                  <Y.Button emphasis="quiet" onClick={() => setNote("Changes discarded.")}>Discard</Y.Button>
                </Y.ButtonGroup>
              </MatrixRow>
              <MatrixRow label="Tones">
                <Y.Button tone="brand" onClick={() => setNote("Invitation sent.")}>Invite member</Y.Button>
                <Y.Button tone="danger" onClick={() => setNote("Access removed.")}>Remove</Y.Button>
                <Y.Button tone="danger" emphasis="soft" onClick={() => setNote("Session revoked.")}>Revoke</Y.Button>
              </MatrixRow>
              <MatrixRow label="Sizes">
                <Y.Button size="compact" emphasis="soft" onClick={() => setNote("Compact clicked.")}>Compact</Y.Button>
                <Y.Button size="regular" emphasis="soft" onClick={() => setNote("Regular clicked.")}>Regular</Y.Button>
                <Y.Button size="comfortable" emphasis="soft" onClick={() => setNote("Comfortable clicked.")}>Comfortable</Y.Button>
                <Y.Button size="touch" emphasis="soft" onClick={() => setNote("Touch clicked.")}>Touch</Y.Button>
              </MatrixRow>
              <MatrixRow label="States">
                <Y.Button disabled>Disabled</Y.Button>
                <Y.Button emphasis="soft" disabled>Disabled soft</Y.Button>
                <Y.Button emphasis="quiet" disabled>Disabled quiet</Y.Button>
                <Y.Button shape="pill" emphasis="soft" onClick={() => setNote("Pill clicked.")}>Pill</Y.Button>
              </MatrixRow>
            </SpecimenMatrix>
          )}
          {status}
        </Y.Stack>
      );
    case "button-group":
      return (
        <Y.Stack gap={10}>
          <SpecimenMatrix>
            <MatrixRow label="Decision">
              <Y.ButtonGroup label="Review actions">
                <Y.Button emphasis="quiet" onClick={() => setNote("Changes discarded.")}>Discard</Y.Button>
                {primary}
              </Y.ButtonGroup>
            </MatrixRow>
            <MatrixRow label="Brand CTA">
              <Y.ButtonGroup label="Publish actions">
                <Y.Button emphasis="soft" onClick={() => setNote("Draft saved.")}>Save draft</Y.Button>
                <Y.Button tone="brand" onClick={() => setNote("Published.")}>Publish</Y.Button>
              </Y.ButtonGroup>
            </MatrixRow>
          </SpecimenMatrix>
          {status}
        </Y.Stack>
      );
    case "icon-button":
      return (
        <Y.Stack gap={12}>
          {variation ? (
            <Y.Inline>
              <Y.IconButton label="Add a view" icon="plus" emphasis="soft" onClick={() => setCount((n) => n + 1)} />
              <Y.IconButton label="Find a view" icon="search" size="compact" onClick={() => setNote("Search selected.")} />
              <Y.IconButton label="Copy a view" icon="copy" size="comfortable" emphasis="soft" onClick={() => setNote("View copied.")} />
              <Y.IconButton label="Save a view" icon="bookmark" size="touch" emphasis="filled" onClick={() => setNote("View saved.")} />
              <Y.IconButton label="Close views" icon="close" size="spacious" onClick={() => setNote("Views closed.")} />
            </Y.Inline>
          ) : (
            <SpecimenMatrix>
              <MatrixRow label="Emphasis">
                <Y.IconButton label="Add a view" icon="plus" emphasis="soft" onClick={() => setCount((n) => n + 1)} />
                <Y.IconButton label="Bookmark view" icon="bookmark" emphasis="filled" onClick={() => setNote("Bookmarked.")} />
                <Y.IconButton label="More options" icon="more" emphasis="quiet" onClick={() => setNote("More selected.")} />
              </MatrixRow>
              <MatrixRow label="Tones">
                <Y.IconButton label="Share view" icon="send" emphasis="filled" tone="brand" onClick={() => setNote("Shared.")} />
                <Y.IconButton label="Delete view" icon="close" emphasis="soft" tone="danger" onClick={() => setNote("Removed.")} />
              </MatrixRow>
              <MatrixRow label="Sizes">
                <Y.IconButton label="Compact search" icon="search" size="compact" emphasis="soft" onClick={() => setNote("Compact.")} />
                <Y.IconButton label="Regular search" icon="search" size="regular" emphasis="soft" onClick={() => setNote("Regular.")} />
                <Y.IconButton label="Comfortable search" icon="search" size="comfortable" emphasis="soft" onClick={() => setNote("Comfortable.")} />
                <Y.IconButton label="Touch search" icon="search" size="touch" emphasis="soft" onClick={() => setNote("Touch.")} />
              </MatrixRow>
              <MatrixRow label="Disabled">
                <Y.IconButton label="Disabled filled" icon="plus" emphasis="filled" disabled />
                <Y.IconButton label="Disabled soft" icon="plus" emphasis="soft" disabled />
                <Y.IconButton label="Disabled quiet" icon="plus" emphasis="quiet" disabled />
              </MatrixRow>
            </SpecimenMatrix>
          )}
          <Y.Text variant="help" role="status">{note || `${count} ${count === 1 ? "view" : "views"}`}</Y.Text>
        </Y.Stack>
      );
    case "field":
    case "label":
    case "help-text":
    case "field-error":
    case "text-field":
      if (id === "text-field" && variation) {
        return (
          <Y.Stack gap={12}>
            {(["compact", "regular", "comfortable", "spacious", "touch"] as const).map((size) => (
              <Y.TextField key={size} label={size[0].toUpperCase() + size.slice(1)}
                size={size} placeholder="Name your view" />
            ))}
          </Y.Stack>
        );
      }
      if (id === "text-field" && !variation) {
        return (
          <SpecimenMatrix>
            <MatrixRow label="Default" stack>
              <Y.TextField
                ref={field}
                label="View name"
                value={value}
                placeholder="Name your view"
                help="Visible to workspace members."
                error={!value ? "Give this view a name." : undefined}
                onChange={(e) => {
                  setValue(e.target.value);
                  setNote("Edited");
                }}
              />
            </MatrixRow>
            <MatrixRow label="States" stack>
              <Y.TextField
                label="Slug"
                defaultValue="weekly review!"
                error="Use lowercase letters and hyphens only."
              />
              <Y.TextField
                label="Workspace ID"
                value="ws_sourdough_01"
                disabled
                readOnly
              />
            </MatrixRow>
          </SpecimenMatrix>
        );
      }
      return (
        <Y.TextField
          ref={field}
          label="View name"
          value={id === "field-error" && !note ? "" : value}
          placeholder="Name your view"
          help={
            variation || id === "help-text"
              ? "Use a name your team will recognize."
              : undefined
          }
          error={
            !value || (id === "field-error" && !note)
              ? "Give this view a name."
              : undefined
          }
          onChange={(e) => {
            setValue(e.target.value);
            setNote("Edited");
          }}
        />
      );
    case "textarea":
      return (
        <Y.Textarea
          label="Review note"
          rows={variation ? 4 : 2}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          help={
            variation ? "Write a short handoff for the next review." : undefined
          }
        />
      );
    case "search-field":
    case "filter-bar":
      if (id === "search-field" && variation) {
        return (
          <Y.Stack gap={12}>
            {(["compact", "regular", "comfortable", "spacious", "touch"] as const).map((size) => (
              <Y.SearchField key={size} label={size[0].toUpperCase() + size.slice(1)}
                size={size} value={query} onValueChange={setQuery} placeholder="Find a view" />
            ))}
          </Y.Stack>
        );
      }
      return (
        <Y.Stack>
          <Y.FilterBar
            label="Find a view"
            query={query}
            onQueryChange={setQuery}
          >
            {variation && (
              <Y.Count
                label="matching views"
                value={
                  records.filter((r) =>
                    r.title.toLowerCase().includes(query.toLowerCase()),
                  ).length
                }
              />
            )}
          </Y.FilterBar>
          {records.some((r) =>
            r.title.toLowerCase().includes(query.toLowerCase()),
          ) ? (
            list
          ) : (
            <Y.EmptyResult query={query} onClear={() => setQuery("")} />
          )}
          {status}
        </Y.Stack>
      );
    case "select":
      if (variation) {
        return (
          <Y.Stack gap={12}>
            {(["compact", "regular", "comfortable", "spacious", "touch"] as const).map((size) => (
              <Y.Select key={size} label={size[0].toUpperCase() + size.slice(1)}
                controlSize={size} options={projects} value={choice} onValueChange={setChoice} />
            ))}
          </Y.Stack>
        );
      }
      return (
        <SpecimenMatrix>
          <MatrixRow label="Default" stack>
            <Y.Select
              label="Project"
              options={projects}
              value={choice}
              onValueChange={setChoice}
            />
          </MatrixRow>
          <MatrixRow label="States" stack>
            <Y.Select
              label="Role"
              placeholder="Choose a role"
              options={[
                { id: "edit", label: "Can edit" },
                { id: "view", label: "Can view" },
                { id: "owner", label: "Owner", disabled: true },
              ]}
            />
            <Y.Select
              label="Locked project"
              options={projects}
              value="sourdough"
              disabled
            />
          </MatrixRow>
        </SpecimenMatrix>
      );
    case "combobox":
      return (
        <Y.Combobox
          {...mode}
          help="Type a project name or use the arrow keys."
        />
      );
    case "checkbox":
      if (variation) {
        return <Y.Stack gap={8}>
          <form aria-label="Checkbox form"><Y.Checkbox label="Include notes" name="notes" value="include" defaultChecked /></form>
          <Y.Checkbox label="Some records selected" checked="indeterminate" />
          <Y.Checkbox label="Unavailable option" disabled />
        </Y.Stack>;
      }
      return (
        <SpecimenMatrix>
          <MatrixRow label="Interactive">
            <Y.Checkbox
              label={samples.checkbox.label}
              checked={active}
              onCheckedChange={(v) => setActive(v === true)}
            />
          </MatrixRow>
          <MatrixRow label="States">
            <Y.Checkbox label="Unchecked" defaultChecked={false} />
            <Y.Checkbox label="Mixed" checked="indeterminate" />
            <Y.Checkbox label="Disabled on" checked disabled />
            <Y.Checkbox label="Disabled off" disabled />
          </MatrixRow>
        </SpecimenMatrix>
      );
    case "radio-group":
      return (
        <SpecimenMatrix>
          <MatrixRow label="Interactive" stack>
            <Y.RadioGroup {...mode} />
          </MatrixRow>
          <MatrixRow label="Disabled" stack>
            <Y.RadioGroup
              label="Locked workspace"
              options={projects}
              value="sourdough"
              disabled
            />
          </MatrixRow>
        </SpecimenMatrix>
      );
    case "switch":
      if (variation) {
        return (
          <Y.Stack gap={8}>
            {dates}
            <Y.Switch label="Inset presentation" presentation="inset" defaultChecked />
          </Y.Stack>
        );
      }
      return (
        <Y.Stack gap={10}>
          <SpecimenMatrix>
            <MatrixRow label="Interactive" stack>
              {dates}
              <Y.Text variant="meta">
                {active ? samples.switch.on : samples.switch.off}
              </Y.Text>
            </MatrixRow>
            <MatrixRow label="States">
              <Y.Switch label="Default off" defaultChecked={false} />
              <Y.Switch label="Disabled on" checked disabled />
              <Y.Switch label="Disabled off" disabled />
            </MatrixRow>
          </SpecimenMatrix>
        </Y.Stack>
      );
    case "link":
      return <Y.Link href={sectionHref("components", "record-facts")}>View record details</Y.Link>;
    case "breadcrumb":
      return (
        <Y.Breadcrumb
          items={[
            { id: "home", label: "Library", href: sectionHref("components", "button") },
            { id: "records", label: "Records", href: sectionHref("components", "list") },
            { id: "view", label: "Weekly review", href: sectionHref("components", "record-facts") },
          ]}
        />
      );
    case "navigation-list":
      return (
        <Y.NavigationList
          label="Library destinations"
          current="records"
          items={[
            { id: "records", label: "Records", href: sectionHref("components", "list") },
            { id: "facts", label: "Facts", href: sectionHref("components", "record-facts") },
          ]}
        />
      );
    case "tabs":
      return (
        <SpecimenMatrix>
          <MatrixRow label="Underline" stack>
            <Y.Tabs
              label="Project details"
              presentation="underline"
              value={choice}
              onValueChange={setChoice}
              items={projects.map((p) => ({
                ...p,
                panel: (
                  <Y.Inline>
                    {mark(p.id as Y.Project)}
                    {p.label} workspace
                  </Y.Inline>
                ),
              }))}
            />
          </MatrixRow>
          <MatrixRow label="Pill" stack>
            <Y.Tabs
              presentation="pill"
              label="Workspace view"
              value={choice}
              onValueChange={setChoice}
              items={projects.map((p) => ({
                ...p,
                panel: <Y.Text variant="help">Showing {p.label} records.</Y.Text>,
              }))}
            />
          </MatrixRow>
        </SpecimenMatrix>
      );
    case "segmented-control":
      return (
        <SpecimenMatrix>
          <MatrixRow label="Interactive">
            <Y.SegmentedControl {...mode} />
          </MatrixRow>
          <MatrixRow label="Disabled item">
            <Y.SegmentedControl
              label="Density mode"
              value="regular"
              onValueChange={() => {}}
              options={[
                { id: "compact", label: "Compact" },
                { id: "regular", label: "Regular" },
                { id: "archived", label: "Archived", disabled: true },
              ]}
            />
          </MatrixRow>
        </SpecimenMatrix>
      );
    case "pagination":
      return <Y.Pagination page={count} pages={5} onPageChange={setCount} />;
    case "disclosure-row":
      return (
        <Y.Disclosure label={samples["disclosure-row"].label}>
          <Y.Text variant="help">{samples["disclosure-row"].body}</Y.Text>
        </Y.Disclosure>
      );
    case "action-menu":
      return (
        <Y.Stack gap={10}>
          {variation ? (
            <Y.ActionMenu
              label={samples.menu.label}
              items={samples.menu.items.map((item) => ({ ...item, disabled: item.id === "archive" }))}
              onSelect={(id) =>
                setNote({ rename: "Renaming view.", duplicate: "View duplicated.", archive: "View archived." }[id] ?? "")
              }
            />
          ) : (
            <SpecimenMatrix>
              <MatrixRow label="Button">
                <Y.ActionMenu
                  label={samples.menu.label}
                  items={samples.menu.items}
                  onSelect={(id) =>
                    setNote({ rename: "Renaming view.", duplicate: "View duplicated.", archive: "View archived." }[id] ?? "")
                  }
                />
              </MatrixRow>
              <MatrixRow label="Overflow">
                <Y.ActionMenu
                  label="Member row actions"
                  triggerVariant="more"
                  selectionIndicator="leading"
                  items={[
                    { id: "edit", label: "Can edit", checked: true },
                    { id: "view", label: "Can view" },
                    { id: "remove", label: "Remove access", tone: "danger", separatorBefore: true },
                  ]}
                  onSelect={(id) => setNote("Selected " + id + ".")}
                />
              </MatrixRow>
            </SpecimenMatrix>
          )}
          {status}
        </Y.Stack>
      );
    case "popover":
      return (
        <SpecimenMatrix>
          <MatrixRow label="Bottom">
            <Y.Popover label={samples.popover.label}>
              <Y.Text>{samples.popover.body}</Y.Text>
            </Y.Popover>
          </MatrixRow>
          <MatrixRow label="Top">
            <Y.Popover label="Keyboard shortcuts" side="top">
              <Y.Text>Press Escape to dismiss and return focus to the trigger.</Y.Text>
            </Y.Popover>
          </MatrixRow>
        </SpecimenMatrix>
      );
    case "dialog":
    case "sheet": {
      const Panel = id === "dialog" ? Y.Dialog : Y.Sheet;
      return (
        <SpecimenMatrix>
          <MatrixRow label="Interactive">
            <Y.Button emphasis="soft" onClick={() => setOpen(true)}>
              {samples.dialog.title}
            </Y.Button>
            <Panel open={open} onOpenChange={setOpen} title={samples.dialog.title}>
              <Y.TextField
                label={samples.dialog.label}
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              <Y.Button
                onClick={() => {
                  setOpen(false);
                  setNote(samples.dialog.saved);
                }}
              >
                {samples.dialog.submit}
              </Y.Button>
            </Panel>
            {status}
          </MatrixRow>
        </SpecimenMatrix>
      );
    }
    case "tooltip":
      return (
        <Y.Tooltip label="Add a saved view">
          {(props) => (
            <Y.IconButton
              {...props}
              icon="plus"
              label="Add a view"
              onClick={() => setNote("View added.")}
            />
          )}
        </Y.Tooltip>
      );
    case "count":
      return (
        <Y.Inline>
          Saved views <Y.Count label="saved views" value={records.length} />
        </Y.Inline>
      );
    case "list-row":
    case "list":
      return (
        <Y.Stack>
          {list}
          {status}
        </Y.Stack>
      );
    case "selection-list":
      return (
        <Y.Stack>
          <Y.SelectionList
            label="Included projects"
            options={projects}
            selected={selected}
            onValueChange={setSelected}
          />
          <Y.Text variant="help">{selected.length} selected</Y.Text>
        </Y.Stack>
      );
    case "empty-result":
      return confirmed ? (
        list
      ) : (
        <Y.EmptyResult
          query={variation ? "Winter" : undefined}
          onClear={() => setConfirmed(true)}
        />
      );
    case "badge":
      if (variation) {
        return (
          <Y.Inline>
            <Y.Badge tone="neutral" variant="outline">Draft</Y.Badge>
            <Y.Badge tone="success" variant="outline">Saved</Y.Badge>
            <Y.Badge tone="warning" variant="outline">Pending</Y.Badge>
            <Y.Badge tone="danger" variant="outline">Blocked</Y.Badge>
            <Y.Badge tone="accent" variant="outline">Shared</Y.Badge>
          </Y.Inline>
        );
      }
      return (
        <SpecimenMatrix>
          <MatrixRow label="Soft">
            <Y.Badge tone="neutral">Draft</Y.Badge>
            <Y.Badge tone="success">Saved</Y.Badge>
            <Y.Badge tone="warning">Pending</Y.Badge>
            <Y.Badge tone="danger">Blocked</Y.Badge>
            <Y.Badge tone="accent">Shared</Y.Badge>
          </MatrixRow>
          <MatrixRow label="Outline">
            <Y.Badge tone="neutral" variant="outline">Owner</Y.Badge>
            <Y.Badge tone="success" variant="outline">Ready</Y.Badge>
            <Y.Badge tone="warning" variant="outline">Review</Y.Badge>
            <Y.Badge tone="danger" variant="outline">Failed</Y.Badge>
            <Y.Badge tone="accent" variant="outline">Pinned</Y.Badge>
          </MatrixRow>
        </SpecimenMatrix>
      );
    case "status":
      return (
        <Y.Status tone={variation ? "warning" : "success"}>
          {variation ? "Awaiting review" : "Saved"}
        </Y.Status>
      );
    case "notice":
      return (
        <Y.Notice
          tone={variation ? "warning" : "neutral"}
          title={variation ? "Review required" : "View updated"}
        >
          {variation
            ? "Two records need a second look."
            : "Your team can use the new view."}
        </Y.Notice>
      );
    case "skeleton":
      return (
        <Y.Stack>
          {confirmed ? list : <Y.Skeleton lines={variation ? 3 : 2} />}
          <Y.Button emphasis="quiet" onClick={() => setConfirmed(!confirmed)}>
            {confirmed ? "Show loading state" : "Show records"}
          </Y.Button>
        </Y.Stack>
      );
    case "progress":
      return (
        <SpecimenMatrix>
          <MatrixRow label="Interactive" stack>
            <Y.Progress label={samples.progress.label} value={count} max={5} />
            <Y.Button
              emphasis="soft"
              size="compact"
              onClick={() => setCount((n) => (n >= 5 ? 0 : n + 1))}
            >
              {count >= 5 ? samples.progress.reset : samples.progress.next}
            </Y.Button>
          </MatrixRow>
          <MatrixRow label="Complete" stack>
            <Y.Progress label="Synced" value={5} max={5} />
          </MatrixRow>
          <MatrixRow label="Segmented" stack>
            <Y.Progress label="Source checks" value={12} max={16} presentation="segmented" valueLabel="75%" />
          </MatrixRow>
          <MatrixRow label="Pending" stack>
            <Y.Progress label="Preparing export" />
          </MatrixRow>
        </SpecimenMatrix>
      );
    case "toast":
      return (
        <Y.Stack gap={10}>
          <Y.Inline>
            <Y.Button emphasis="soft" onClick={() => setOpen(true)}>
              Save view
            </Y.Button>
          </Y.Inline>
          {open && <Y.Toast message="View saved." onDismiss={() => setOpen(false)} />}
        </Y.Stack>
      );
    case "result":
      return confirmed ? (
        <Y.Status tone="success">Records loaded</Y.Status>
      ) : (
        <Y.Result
          title="Couldn’t load records"
          action={
            <Y.Button emphasis="soft" onClick={() => setConfirmed(true)}>
              Try again
            </Y.Button>
          }
        >
          Your saved view is still here.
        </Y.Result>
      );
    case "record-facts":
      return (
        <Y.RecordFacts title="Weekly review" facts={facts} {...observation} />
      );
    case "data-table":
      return (
        <Y.Stack gap={10}>
          <SpecimenMatrix>
            <MatrixRow label="Sortable" stack>
              {sampleTable}
            </MatrixRow>
            <MatrixRow label="Structured" stack>
              <Y.DataTable
                caption="Project access overview"
                columns={[
                  { id: "member", label: "Member", kind: "identity" },
                  { id: "role", label: "Role", kind: "role" },
                  { id: "edits", label: "Edits", kind: "numeric", numeric: true, sortValue: (row) => typeof row.cells.edits === "number" ? row.cells.edits : null },
                  { id: "actions", label: "Actions", kind: "actions", align: "end" },
                ]}
                rows={[
                  {
                    id: "maya",
                    cells: {
                      member: <Y.Inline gap={8}><Y.Avatar label="Maya Chen" size={28} /><Y.Text>Maya Chen</Y.Text></Y.Inline>,
                      role: <Y.Badge tone="neutral">Owner</Y.Badge>,
                      edits: 14,
                      actions: <Y.Text variant="meta">—</Y.Text>,
                    },
                  },
                  {
                    id: "jules",
                    cells: {
                      member: <Y.Inline gap={8}><Y.Avatar label="Jules Reed" size={28} /><Y.Text>Jules Reed</Y.Text></Y.Inline>,
                      role: <Y.Badge tone="neutral" variant="outline">Can edit</Y.Badge>,
                      edits: 9,
                      actions: (
                        <Y.ActionMenu
                          label="Actions for Jules Reed"
                          triggerVariant="more"
                          triggerSize="compact"
                          items={[
                            { id: "copy", label: "Copy member ID" },
                            { id: "remove", label: "Remove access", tone: "danger", separatorBefore: true },
                          ]}
                          onSelect={(actionId) => setNote(`Selected ${actionId} for Jules Reed.`)}
                        />
                      ),
                    },
                  },
                ]}
              />
            </MatrixRow>
          </SpecimenMatrix>
          {status}
        </Y.Stack>
      );
    case "table":
      return (
        <Y.Table caption={samples.readings.label}>
          <thead>
            <tr>
              <th scope="col">{samples.readings.day}</th>
              <th scope="col" data-numeric>
                {samples.readings.reviews}
              </th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.id}>
                <th scope="row">{p.label}</th>
                <td data-numeric>{p.value ?? samples.readings.missing}</td>
              </tr>
            ))}
          </tbody>
        </Y.Table>
      );
    case "chart":
      return (
        <Y.Chart
          title="Reviews this week"
          series="Completed reviews"
          unit="records"
          points={points}
          {...observation}
        />
      );
    case "confirm-dialog":
      return (
        <Y.Stack>
          <Y.Button
            emphasis="soft"
            disabled={confirmed}
            onClick={() => setOpen(true)}
          >
            Archive view
          </Y.Button>
          <Y.ConfirmDialog
            open={open}
            onOpenChange={setOpen}
            decision={{
              id: "weekly",
              revision: "3",
              title: "Archive Weekly review?",
              consequence:
                "The view moves to your archive. Its records stay available.",
              confirmLabel: "Archive view",
              available: !confirmed,
            }}
            onConfirm={() => {
              setConfirmed(true);
              setNote("View archived.");
            }}
          />
          {status}
        </Y.Stack>
      );
    case "receipt":
      return (
        <Y.Receipt
          record={{
            id: "review-42",
            state: confirmed ? "confirmed" : "unknown",
            description: confirmed
              ? "The view was saved."
              : "The acknowledgement has not arrived.",
          }}
          onLookup={() => setConfirmed(true)}
        />
      );
    case "project-mark":
      return (
        <Y.Inline gap={16}>
          {projects.map((p) => (
            <Y.ProjectMark
              key={p.id}
              project={p.id as Y.Project}
              label={p.label}
              size={40}
            />
          ))}
        </Y.Inline>
      );
    case "agent-avatar":
      return <AgentMotionExample variation={variation} />;
    case "message":
      return (
        <Y.Message
          speaker="Kai"
          time="09:12"
          avatar={<Y.AgentAvatar agent="Kai" size={28} />}
        >
          Three notes are ready for review.
        </Y.Message>
      );
    case "transcript":
      return (
        <Y.Stack>
          <Y.Transcript label="Review thread" revision={count}>
            {Array.from({ length: count }, (_, i) => (
              <Y.Message
                key={i}
                speaker={i % 2 ? "Sol" : "Kai"}
                avatar={
                  <Y.AgentAvatar agent={i % 2 ? "Sol" : "Kai"} size={24} />
                }
              >
                {i % 2
                  ? "I’ve added the release notes."
                  : "The latest review is ready."}
              </Y.Message>
            ))}
          </Y.Transcript>
          <Y.Button emphasis="soft" onClick={() => setCount((n) => n + 1)}>
            Add reply
          </Y.Button>
        </Y.Stack>
      );
    default:
      return <ExtendedExample key={id} id={id} variation={variation} />;
  }
}
