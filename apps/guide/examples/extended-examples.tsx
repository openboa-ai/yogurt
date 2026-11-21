import samples from "../../../catalog/specimens/components.json";
import { sectionHref } from "../routing";
import { useState } from "react";
import * as Y from "@openboa/yogurt";
const projects = [
  { id: "yogurt", label: "Yogurt" },
  { id: "meatball", label: "Meatball" },
  { id: "sourdough", label: "Sourdough" },
];
const links = [
  { id: "calendar", label: "Calendar", href: sectionHref("components", "calendar") },
  { id: "select", label: "Select", href: sectionHref("components", "select") },
];
const stages = [
  { id: "draft", label: "Draft", detail: "Write the change." },
  { id: "review", label: "Review", detail: "Check the details." },
  { id: "release", label: "Release", detail: "Share with the team." },
];
export function ExtendedExample({
  id,
  variation = false,
}: {
  id: string;
  variation?: boolean;
}) {
  const [text, setText] = useState(""),
    [keys, setKeys] = useState<string[]>(["yogurt"]),
    [number, setNumber] = useState(3),
    [on, setOn] = useState(false);
  const [date, setDate] = useState("2026-11-20"),
    [parts, setParts] = useState(["415", "0182"]),
    [messages, setMessages] = useState([
      { id: "first", message: "View saved" },
    ]);
  const confirm = (value: string) => setText(value),
    note = text ? (
      <p role="status" className="yg-help">
        {text}
      </p>
    ) : null;
  const mark = <Y.ProjectMark project="yogurt" size={36} />;
  switch (id) {
    case "aspect-ratio":
      return (
        <Y.AspectRatio ratio={3}>
          <Y.Gradient>
            <Y.ProjectMark project="yogurt" size={40} />
          </Y.Gradient>
        </Y.AspectRatio>
      );
    case "direction":
      return (
        <Y.Stack>
          <Y.Toggle pressed={on} onPressedChange={setOn}>
            Right to left
          </Y.Toggle>
          <Y.Direction dir={on ? "rtl" : "ltr"}>
            <Y.Breadcrumb items={links} />
          </Y.Direction>
        </Y.Stack>
      );
    case "card":
      if (variation) {
        return (
          <Y.Stack gap={12}>
            {(["compact", "regular", "spacious"] as const).map((density) => (
              <Y.Card key={density} density={density}
                title={density[0].toUpperCase() + density.slice(1)} description="Weekly review">
                {samples.card.body}
              </Y.Card>
            ))}
          </Y.Stack>
        );
      }
      return (
        <Y.Card
          title={samples.card.title}
          description={samples.card.detail}
          action={
            <Y.Button emphasis="soft" onClick={() => setOn(!on)}>
              {on ? samples.card.unpin : samples.card.pin}
            </Y.Button>
          }
        >
          {samples.card.body}
        </Y.Card>
      );
    case "asset":
      return (
        <Y.Inline>
          {["yogurt", "meatball", "sourdough"].map((p) => (
            <Y.Asset key={p} framed size={52}>
              <Y.ProjectMark project={p as Y.Project} size={36} />
            </Y.Asset>
          ))}
        </Y.Inline>
      );
    case "gradient":
      return (
        <Y.Gradient tone={variation ? "accent" : "neutral"}>
          <Y.Inline>
            {mark}
            <Y.Heading>Yogurt</Y.Heading>
          </Y.Inline>
        </Y.Gradient>
      );
    case "elevation":
      return (
        <Y.Elevation level={variation ? "floating" : "raised"}>
          <Y.ListHeader title="Saved views" detail="Three project views" />
        </Y.Elevation>
      );
    case "kbd":
      return (
        <Y.Inline>
          <Y.Text>Find a command</Y.Text>
          <Y.KeyboardShortcut label="Command K" keys={["⌘", "K"]} />
        </Y.Inline>
      );
    case "post":
      return (
        <Y.Post>
          <Y.Heading>Release notes</Y.Heading>
          <p>Project filters now remember the last view you opened.</p>
          <ul>
            <li>Choose a project.</li>
            <li>Save the view for next time.</li>
          </ul>
        </Y.Post>
      );
    case "grid-list":
      return (
        <Y.GridList
          label="Projects"
          items={projects.map((p) => ({
            id: p.id,
            content: (
              <Y.Inline>
                <Y.ProjectMark project={p.id as Y.Project} size={28} />
                {p.label}
              </Y.Inline>
            ),
          }))}
        />
      );
    case "list-header":
      return (
        <Y.Stack>
          <Y.ListHeader
            title="Saved views"
            detail="Available in this project"
            action={
              <Y.Button emphasis="quiet" onClick={() => setOn(!on)}>
                {on ? "Show all" : "Show pinned"}
              </Y.Button>
            }
          />
          <Y.Text>{on ? "Release review" : "Release review · Drafts"}</Y.Text>
        </Y.Stack>
      );
    case "list-footer":
      return (
        <Y.ListFooter
          action={
            <Y.Button
              emphasis="quiet"
              disabled={on}
              onClick={() => setOn(true)}
            >
              Load more
            </Y.Button>
          }
        >
          {on ? "6 of 6 views" : "3 of 6 views"}
        </Y.ListFooter>
      );
    case "top":
      return (
        <Y.PageHeader
          eyebrow="Sourdough"
          title="Project settings"
          detail="Preferences for this workspace."
        />
      );
    case "bottom-info":
      return (
        <Y.BottomInfo label="Visibility">
          Only people with access to this project can open its saved views.
        </Y.BottomInfo>
      );
    case "highlight":
      return (
        <Y.Text>
          The next review is <Y.Highlight>Friday at 10 am</Y.Highlight>.
        </Y.Text>
      );
    case "spinner":
      return (
        <Y.Inline>
          <Y.Spinner label="Loading reviews" />
          <Y.Text>Loading reviews</Y.Text>
        </Y.Inline>
      );
    case "toast-stack":
      return (
        <Y.Stack>
          <Y.Button
            emphasis="soft"
            onClick={() =>
              setMessages((m) => [
                ...m,
                { id: crypto.randomUUID(), message: "View saved" },
              ])
            }
          >
            Save view
          </Y.Button>
          <Y.ToastStack
            items={messages}
            onDismiss={(id) => setMessages((m) => m.filter((x) => x.id !== id))}
          />
        </Y.Stack>
      );
    case "table-row":
      return (
        <Y.Stack>
          <Y.TableRow label="Owner">Sourdough</Y.TableRow>
          <Y.TableRow label="Visibility">Project members</Y.TableRow>
        </Y.Stack>
      );
    case "amount-top":
      return (
        <Y.AmountTop
          label="Storage used"
          value="2.4"
          unit="GB"
          detail="Across three projects"
        />
      );
    case "bar-chart":
      return (
        <Y.BarChart
          title="Net change"
          points={[
            { id: "a", label: "Mon", value: 4 },
            { id: "b", label: "Tue", value: -2 },
            { id: "c", label: "Wed", value: null },
          ]}
          unit="views"
          source="Local sample"
          asOf="2026-11-20"
          timeLabel="Nov 20"
        />
      );
    case "avatar":
      return (
        <Y.Inline>
          <Y.Avatar label="Sam Park" />
          <Y.Text>Sam Park</Y.Text>
        </Y.Inline>
      );
    case "bubble":
      return (
        <Y.Stack>
          <Y.Bubble outgoing>Ready to review?</Y.Bubble>
          <Y.Bubble>The draft is ready.</Y.Bubble>
        </Y.Stack>
      );
    case "attachment":
      return on ? (
        <Y.Button emphasis="quiet" onClick={() => setOn(false)}>
          Restore attachment
        </Y.Button>
      ) : (
        <Y.Stack>
          <Y.Attachment
            name="Release notes.md"
            detail="Markdown · 12 KB"
            onOpen={() => confirm("Three changes are ready for review.")}
            onRemove={() => setOn(true)}
          />
          {note}
        </Y.Stack>
      );
    case "marker":
      return <Y.Marker>Review resumed at 09:12</Y.Marker>;
    case "code-block":
      return (
        <Y.CodeBlock
          language="TypeScript"
          code={'import { Button } from "@openboa/yogurt/button";'}
        />
      );
    case "trace":
      return (
        <Y.Trace
          label="Review activity"
          events={[
            {
              id: "read",
              title: "Read the draft",
              state: "complete",
              detail: "Opened release-notes.md",
            },
            {
              id: "review",
              title: "Review the edits",
              state: "working",
              detail: "Checking three changes",
            },
          ]}
        />
      );
    case "input-group":
      if (variation) return (
        <Y.Stack gap={12}>
          {(["compact", "regular", "comfortable", "spacious", "touch", "featured"] as const).map((size) => (
            <Y.InputGroup key={size} size={size} label={size[0].toUpperCase() + size.slice(1)}
              placeholder="release-notes" leading={<span className="yg-help">/projects/</span>} />
          ))}
        </Y.Stack>
      );
      return (
        <Y.InputGroup
          label="Project path"
          placeholder="release-notes"
          leading={<span className="yg-help">/projects/</span>}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      );
    case "input-otp":
      return (
        <Y.InputOTP
          label="Verification code"
          value={text}
          onValueChange={setText}
          help="Enter the six digits from your email."
        />
      );
    case "split-text-field":
      return (
        <Y.SplitTextField
          label="Reference number"
          parts={parts.map((v, i) => ({
            id: String(i),
            label: i ? "Record" : "Team",
            value: v,
            maxLength: i ? 4 : 3,
            inputMode: "numeric",
          }))}
          onValueChange={(i, v) =>
            setParts((prev) => prev.map((p, j) => (j === Number(i) ? v : p)))
          }
        />
      );
    case "slider":
      return (
        <Y.Slider
          label="Preview volume"
          value={number * 10}
          onValueChange={(v) => setNumber(v / 10)}
          unit="%"
          presentation={variation ? "card" : "inline"}
        />
      );
    case "numeric-spinner":
      return (
        <Y.NumericSpinner
          label="Copies"
          value={number}
          min={1}
          max={8}
          onValueChange={setNumber}
        />
      );
    case "rating":
      return (
        <Y.Rating
          label="How was the review?"
          value={number}
          onValueChange={setNumber}
        />
      );
    case "agreement":
      return (
        <Y.Agreement
          label="Sharing preferences"
          items={[
            { id: "summary", label: "Include the summary" },
            { id: "sources", label: "Include source links" },
          ]}
          selected={keys.filter((k) => k !== "yogurt")}
          onValueChange={setKeys}
        />
      );
    case "keypad":
      return (
        <Y.Stack>
          <Y.Select
            label="Layout"
            options={[
              { id: "number", label: "Numbers" },
              { id: "alphabet", label: "Letters" },
              { id: "private", label: "Private entry" },
            ]}
            value={keys[0] === "yogurt" ? "number" : keys[0]}
            onChange={(e) => {
              setKeys([e.target.value]);
              setText("");
              setOn(false);
            }}
          />
          <Y.Text>
            {on
              ? "Entry accepted"
              : text
                ? "•".repeat(text.length)
                : "Enter a value"}
          </Y.Text>
          <Y.Keypad
            label="Local entry"
            mode={
              keys[0] === "alphabet"
                ? "alphabet"
                : keys[0] === "private"
                  ? "private"
                  : "number"
            }
            onKey={(k) => {
              setOn(false);
              setText((v) => (v + k).slice(0, 12));
            }}
            onDelete={() => setText((v) => v.slice(0, -1))}
            onSubmit={() => {
              if (text) {
                setText("");
                setOn(true);
              }
            }}
          />
        </Y.Stack>
      );
    case "form":
      return (
        <Y.Form
          label="Save a view"
          onSubmit={(e) => {
            e.preventDefault();
            setOn(true);
          }}
        >
          <Y.TextField
            required
            label="View name"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setOn(false);
            }}
          />
          <Y.Button type="submit">Save view</Y.Button>
          {on && <Y.Status>View saved</Y.Status>}
        </Y.Form>
      );
    case "toggle":
      return (
        <Y.Toggle pressed={on} onPressedChange={setOn}>
          Pin view
        </Y.Toggle>
      );
    case "toggle-group":
      return (
        <Y.ToggleGroup
          multiple
          label="Included projects"
          items={projects}
          value={keys}
          onValueChange={setKeys}
        />
      );
    case "accordion":
      return (
        <Y.Accordion
          label="Project details"
          items={[
            {
              id: "access",
              title: "Who can open this view?",
              content: "People with access to Sourdough.",
            },
            {
              id: "archive",
              title: "Where are archived reviews?",
              content: "Open the Archive view in the project.",
            },
          ]}
        />
      );
    case "context-menu":
      return (
        <Y.Stack>
          <Y.ContextMenu
            label="Review actions"
            items={[
              { id: "pin", label: "Pin review" },
              { id: "archive", label: "Archive review", disabled: true },
            ]}
            onSelect={() => confirm("Review pinned")}
          >
            Weekly review
          </Y.ContextMenu>
          {note}
        </Y.Stack>
      );
    case "hover-card":
      return (
        <Y.HoverCard label="Sourdough">
          <Y.ListHeader title="Sourdough" detail="Project workspace" />
        </Y.HoverCard>
      );
    case "command":
      return (
        <Y.Stack>
          <Y.Command
            label="Find a command"
            items={[
              { id: "open", label: "Open review" },
              { id: "save", label: "Save view" },
              { id: "unavailable", label: "Publish", disabled: true },
            ]}
            onSelect={(id) =>
              confirm(id === "open" ? "Review opened" : "View saved")
            }
          />
          {note}
        </Y.Stack>
      );
    case "menubar":
      return (
        <Y.Stack>
          <Y.Menubar
            label="Editor commands"
            menus={[
              {
                id: "file",
                label: "File",
                items: [{ id: "save", label: "Save view" }],
              },
              {
                id: "view",
                label: "View",
                items: [{ id: "details", label: "Show details" }],
              },
            ]}
            onSelect={(id) =>
              confirm(id === "save" ? "View saved" : "Details shown")
            }
          />
          {note}
        </Y.Stack>
      );
    case "navigation-menu":
      return (
        <Y.NavigationMenu
          label="Library"
          groups={[
            { id: "forms", label: "Form controls", links },
            {
              id: "actions",
              label: "Actions",
              links: [{ id: "button", label: "Button", href: sectionHref("components", "button") }],
            },
          ]}
        />
      );
    case "sidebar":
      return <Y.Sidebar label="Library" current="select" links={links} />;
    case "navbar":
      return (
        <Y.Stack gap={24}>
          <Y.Navbar variant="sections" label="Workspace sections"
            identity={<Y.Text>Workspace</Y.Text>}
            destinations={links}
            current="calendar" expanded={on} onExpandedChange={setOn} />
          <Y.Navbar label={on ? "Projects" : "Weekly review"} onBack={() => setOn(!on)} />
        </Y.Stack>
      );
    case "carousel":
      return (
        <Y.Carousel
          label="Projects"
          items={projects.map((p) => ({
            id: p.id,
            label: p.label,
            content: (
              <Y.Inline>
                <Y.ProjectMark project={p.id as Y.Project} />
                <Y.Heading>{p.label}</Y.Heading>
              </Y.Inline>
            ),
          }))}
        />
      );
    case "stepper":
      return (
        <Y.Stack>
          <Y.Stepper
            label="Release stages"
            steps={stages}
            current={stages[number % 3].id}
            variant={variation ? "progress" : "list"}
          />
          <Y.Button emphasis="quiet" onClick={() => setNumber((n) => n + 1)}>
            Next stage
          </Y.Button>
        </Y.Stack>
      );
    case "resizable":
      return (
        <Y.Resizable
          label="Resize project list"
          first="Projects"
          second="Weekly review"
        />
      );
    case "calendar":
      return (
        <Y.Calendar label="Review date" value={date} onValueChange={setDate} />
      );
    case "date-picker":
      return (
        <Y.DatePicker
          label="Review date"
          value={date}
          onValueChange={setDate}
        />
      );
    case "questionnaire":
      return on ? (
        <Y.Stack>
          <Y.Status>Preferences saved</Y.Status>
          <Y.Button emphasis="quiet" onClick={() => setOn(false)}>
            Edit preferences
          </Y.Button>
        </Y.Stack>
      ) : (
        <Y.Questionnaire
          questions={[
            {
              id: "project",
              label: "Which project?",
              kind: "single",
              options: projects,
            },
            {
              id: "updates",
              label: "Include in the digest",
              kind: "multiple",
              optional: true,
              options: [
                { id: "reviews", label: "Reviews" },
                { id: "releases", label: "Releases" },
              ],
            },
            { id: "note", label: "Add a note", kind: "text", optional: true },
          ]}
          onComplete={() => setOn(true)}
        />
      );
    default:
      throw new Error("Missing example for " + id);
  }
}
