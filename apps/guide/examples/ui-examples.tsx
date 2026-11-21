import { sectionHref } from "../routing";
import { useEffect, useRef, useState } from "react";
import * as Y from "@openboa/yogurt";
import { AgentMotionExample } from "./agent-motion-example";
import { ExtendedExample } from "./extended-examples";

const projects: Y.Option[] = [
  { id: "sourdough", label: "Sourdough" },
  { id: "meatball", label: "Meatball" },
  { id: "yogurt", label: "Yogurt" },
];
const observation = {
  source: "Local sample",
  asOf: "2026-11-20T09:00:00Z",
  timeLabel: "Nov 20, 09:00 UTC",
};
const points = [
  { id: "m", label: "Mon", value: 4 },
  { id: "t", label: "Tue", value: 8 },
  { id: "w", label: "Wed", value: null },
  { id: "h", label: "Thu", value: 6 },
  { id: "f", label: "Fri", value: 10 },
];
const records = [
  { id: "a", title: "Field notes", day: "Today" },
  { id: "b", title: "Release checklist", day: "Thu" },
  { id: "c", title: "Weekly review", day: "Wed" },
];
const titles = Array.from({ length: 8 }, (_, i) => "Review " + (i + 1));
export function Example({
  id,
  variation = false,
}: {
  id: string;
  variation?: boolean;
}) {
  const [value, setValue] = useState("Weekly review"),
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
      Save view
    </Y.Button>
  );
  const status = (
    <span className="sample-response" role="status">
      {note}
    </span>
  );
  const mode = {
    options: projects,
    label: "Project",
    value: choice,
    onValueChange: setChoice,
  };
  const dates = (
    <Y.Switch
      checked={active}
      onCheckedChange={setActive}
      label="Record dates"
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
      caption="Weekly readings"
      columns={[
        { id: "label", label: "Day" },
        {
          id: "value",
          label: "Reviews",
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
          <Y.Text>Weekly review</Y.Text>
          <Y.Text variant="help">Shared with your team</Y.Text>
          <Y.Text variant="meta">Updated Friday</Y.Text>
        </Y.Stack>
      );
    case "heading":
      return (
        <Y.Stack gap={4}>
          <Y.Heading>Saved views</Y.Heading>
          <Y.Text variant="help">Three views in Sourdough.</Y.Text>
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
        <Y.Stack>
          <Y.ButtonGroup label="View actions">
            {primary}
            {variation && (
              <>
                <Y.Button
                  emphasis="soft"
                  shape="pill"
                  onClick={() => setNote("Draft kept.")}
                >
                  Keep draft
                </Y.Button>
                <Y.Button
                  emphasis="quiet"
                  onClick={() => setNote("Changes discarded.")}
                >
                  Discard
                </Y.Button>
              </>
            )}
          </Y.ButtonGroup>
          {variation && <Y.Stack gap={8}>
            <Y.Inline gap={8}>
              <Y.Button size="compact" emphasis="soft" onClick={() => setNote("Compact action selected.")}>Compact</Y.Button>
              <Y.Button size="regular" emphasis="soft" onClick={() => setNote("Regular action selected.")}>Regular</Y.Button>
              <Y.Button size="comfortable" emphasis="soft" onClick={() => setNote("Comfortable action selected.")}>Comfortable</Y.Button>
            </Y.Inline>
            <Y.Inline gap={8}>
              <Y.Button size="spacious" shape="pill" onClick={() => setNote("Spacious action selected.")}>Spacious</Y.Button>
              <Y.Button size="touch" emphasis="soft" onClick={() => setNote("Touch action selected.")}>Touch</Y.Button>
            </Y.Inline>
          </Y.Stack>}
          {status}
        </Y.Stack>
      );
    case "button-group":
      return (
        <Y.Stack>
          <Y.ButtonGroup label="Review actions">
            {primary}
            <Y.Button
              emphasis="quiet"
              onClick={() => setNote("Changes discarded.")}
            >
              Discard
            </Y.Button>
          </Y.ButtonGroup>
          {status}
        </Y.Stack>
      );
    case "bottom-action":
      return (
        <Y.Stack>
          <Y.BottomAction>
            {variation && (
              <Y.Button
                emphasis="soft"
                onClick={() => setNote("Review postponed.")}
              >
                Later
              </Y.Button>
            )}
            {primary}
          </Y.BottomAction>
          {status}
        </Y.Stack>
      );
    case "icon-button":
      return (
        <Y.Inline>
          <Y.IconButton
            label="Add a view"
            icon="plus"
            emphasis={variation ? "soft" : "quiet"}
            onClick={() => setCount((n) => n + 1)}
          />
          <Y.Text variant="help">
            {count} {count === 1 ? "view" : "views"}
          </Y.Text>
        </Y.Inline>
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
                controlSize={size} options={projects} value={choice} onChange={(e) => setChoice(e.target.value)} />
            ))}
            <Y.Select label="Multiple choice" multiple size={3} options={projects} />
          </Y.Stack>
        );
      }
      return (
        <Y.Select
          label="Project"
          options={projects}
          value={choice}
          onChange={(e) => setChoice(e.target.value)}
        />
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
        <Y.Checkbox
          label="Include archived views"
          checked={active}
          onCheckedChange={(v) => setActive(v === true)}
        />
      );
    case "radio-group":
      return <Y.RadioGroup {...mode} />;
    case "switch":
      return (
        <Y.Stack gap={4}>
          {dates}
          <Y.Text variant="meta">
            {active ? "Friday, November 20" : "Dates hidden"}
          </Y.Text>
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
        <Y.Tabs
          label="Project details"
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
      );
    case "segmented-control":
      return <Y.SegmentedControl {...mode} />;
    case "pagination":
      return <Y.Pagination page={count} pages={5} onPageChange={setCount} />;
    case "disclosure-row":
      return (
        <Y.Disclosure label="Review details">
          <Y.Text variant="help">Saved on Friday in Sourdough.</Y.Text>
        </Y.Disclosure>
      );
    case "action-menu":
      return (
        <Y.Stack>
          <Y.ActionMenu
            label="View actions"
            items={[
              { id: "rename", label: "Rename view" },
              { id: "duplicate", label: "Duplicate view" },
              { id: "archive", label: "Archive view", disabled: variation },
            ]}
            onSelect={(id) =>
              setNote(
                {
                  rename: "Renaming view.",
                  duplicate: "View duplicated.",
                  archive: "View archived.",
                }[id] ?? "",
              )
            }
          />
          {status}
        </Y.Stack>
      );
    case "popover":
      return (
        <Y.Popover label="About this view">
          <Y.Text>
            This view includes notes saved in the last seven days.
          </Y.Text>
        </Y.Popover>
      );
    case "dialog":
    case "drawer":
    case "sheet": {
      const Panel =
        id === "drawer" ? Y.Drawer : id === "dialog" ? Y.Dialog : Y.Sheet;
      return (
        <>
          <Y.Button emphasis="soft" onClick={() => setOpen(true)}>
            Edit view
          </Y.Button>
          <Panel open={open} onOpenChange={setOpen} title="Edit view">
            <Y.TextField
              label="View name"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <Y.Button
              onClick={() => {
                setOpen(false);
                setNote("View updated.");
              }}
            >
              Done
            </Y.Button>
          </Panel>
          {status}
        </>
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
      return (
        <Y.Inline>
          <Y.Badge tone="neutral">Draft</Y.Badge>
          {variation && (
            <>
              <Y.Badge tone="success">Saved</Y.Badge>
              <Y.Badge tone="accent">Shared</Y.Badge>
            </>
          )}
        </Y.Inline>
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
        <Y.Stack>
          <Y.Progress label="Reviewed records" value={count} max={5} />
          <Y.Button
            emphasis="soft"
            onClick={() => setCount((n) => (n >= 5 ? 0 : n + 1))}
          >
            {count >= 5 ? "Reset" : "Review next record"}
          </Y.Button>
        </Y.Stack>
      );
    case "toast":
      return open ? (
        <Y.Toast message="View saved." onDismiss={() => setOpen(false)} />
      ) : (
        <Y.Button emphasis="soft" onClick={() => setOpen(true)}>
          Save view
        </Y.Button>
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
      return sampleTable;
    case "table":
      return (
        <Y.Table caption="Weekly readings">
          <thead>
            <tr>
              <th scope="col">Day</th>
              <th scope="col" data-numeric>
                Reviews
              </th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.id}>
                <th scope="row">{p.label}</th>
                <td data-numeric>{p.value ?? "No reading"}</td>
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
    case "legend":
      return <Y.Legend label="Completed reviews (records)" />;
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
    case "gaze":
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
    case "activity":
      return (
        <Y.Inline>
          <Y.Activity agent="Kai" state={active ? "ready" : "working"} />
          <Y.Button
            emphasis="quiet"
            size="compact"
            onClick={() => setActive(!active)}
          >
            {active ? "Start review" : "Finish"}
          </Y.Button>
        </Y.Inline>
      );
    case "transcript":
    case "reading-anchor":
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
