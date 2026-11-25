import samples from "../../../catalog/specimens/components.json";
import { sectionHref } from "../routing";
import { useState } from "react";
import * as Y from "@openboa/yogurt";
import { MatrixRow, SpecimenMatrix } from "./ui-examples";

const projects = [
  { id: "yogurt", label: "Yogurt" },
  { id: "meatball", label: "Meatball" },
  { id: "sourdough", label: "Sourdough" },
];
const links = [
  { id: "calendar", label: "Calendar", href: sectionHref("components", "calendar") },
  { id: "select", label: "Select", href: sectionHref("components", "select") },
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
    [on, setOn] = useState(false),
    [date, setDate] = useState("2026-11-20");

  const confirm = (value: string) => setText(value),
    note = text ? (
      <Y.Text role="status" variant="help">
        {text}
      </Y.Text>
    ) : null;

  switch (id) {
    case "card":
      if (variation) {
        return (
          <Y.Stack gap={12}>
            {(["compact", "regular", "spacious"] as const).map((density) => (
              <Y.Card
                key={density}
                density={density}
                title={density[0].toUpperCase() + density.slice(1)}
                description="Weekly review"
              >
                {samples.card.body}
              </Y.Card>
            ))}
          </Y.Stack>
        );
      }
      return (
        <SpecimenMatrix>
          <MatrixRow label="Raised" stack>
            <Y.Card
              variant="raised"
              title={samples.card.title}
              description={samples.card.detail}
              headerAction={<Y.Badge tone="success">Ready</Y.Badge>}
              action={
                <Y.Button emphasis="soft" onClick={() => setOn(!on)}>
                  {on ? samples.card.unpin : samples.card.pin}
                </Y.Button>
              }
            >
              {samples.card.body}
            </Y.Card>
          </MatrixRow>
          <MatrixRow label="Variants" stack>
            <Y.Card variant="outlined" density="compact" title="Outlined" description="Quiet border frame">
              Secondary grouping without lift shadow.
            </Y.Card>
            <Y.Card variant="subtle" density="compact" title="Subtle" description="Recessed surface">
              Low-contrast region inside a raised panel.
            </Y.Card>
          </MatrixRow>
        </SpecimenMatrix>
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
    case "top":
      return (
        <Y.PageHeader
          eyebrow="Sourdough"
          title="Project settings"
          detail="Preferences for this workspace."
        />
      );
    case "spinner":
      return (
        <Y.Inline>
          <Y.Spinner label="Loading reviews" />
          <Y.Text>Loading reviews</Y.Text>
        </Y.Inline>
      );
    case "avatar":
      return (
        <Y.Inline>
          <Y.Avatar label="Sam Park" />
          <Y.Text>Sam Park</Y.Text>
        </Y.Inline>
      );
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
    case "input-otp":
      return (
        <SpecimenMatrix>
          <MatrixRow label="Interactive" stack>
            <Y.InputOTP
              label="Verification code"
              value={text}
              onValueChange={setText}
              help="Enter the six digits from your email."
            />
          </MatrixRow>
          <MatrixRow label="Verified" stack>
            <Y.InputOTP
              label="Confirmed code"
              value="123456"
              verified
              onValueChange={() => {}}
            />
          </MatrixRow>
        </SpecimenMatrix>
      );
    case "slider":
      if (variation) {
        return (
          <Y.Slider
            label={samples.slider.label}
            value={number * 10}
            onValueChange={(v) => setNumber(v / 10)}
            unit={samples.slider.unit}
            presentation="card"
          />
        );
      }
      return (
        <SpecimenMatrix>
          <MatrixRow label="Interactive" stack>
            <Y.Slider
              label={samples.slider.label}
              value={number * 10}
              onValueChange={(v) => setNumber(v / 10)}
              unit={samples.slider.unit}
              presentation="inline"
            />
          </MatrixRow>
          <MatrixRow label="Disabled" stack>
            <Y.Slider
              label="Locked limit"
              value={60}
              unit="%"
              disabled
            />
          </MatrixRow>
        </SpecimenMatrix>
      );
    case "toggle":
      return (
        <SpecimenMatrix>
          <MatrixRow label="Interactive">
            <Y.Toggle pressed={on} onPressedChange={setOn}>
              Pin view
            </Y.Toggle>
            <Y.Toggle defaultPressed>
              Pinned
            </Y.Toggle>
          </MatrixRow>
          <MatrixRow label="Sizes & state">
            <Y.Toggle size="compact">Compact</Y.Toggle>
            <Y.Toggle size="touch">Touch</Y.Toggle>
            <Y.Toggle disabled>Disabled</Y.Toggle>
          </MatrixRow>
        </SpecimenMatrix>
      );
    case "toggle-group":
      return (
        <SpecimenMatrix>
          <MatrixRow label="Multiple">
            <Y.ToggleGroup
              multiple
              label="Included projects"
              items={projects}
              value={keys}
              onValueChange={setKeys}
            />
          </MatrixRow>
          <MatrixRow label="Single">
            <Y.ToggleGroup
              label="Primary view"
              items={[
                { id: "list", label: "List" },
                { id: "table", label: "Table" },
                { id: "board", label: "Board", disabled: true },
              ]}
              value={["list"]}
              onValueChange={() => {}}
            />
          </MatrixRow>
        </SpecimenMatrix>
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
    case "sidebar":
      return <Y.Sidebar label="Library" current="select" links={links} />;
    case "navbar":
      return (
        <Y.Stack gap={24}>
          <Y.Navbar
            variant="sections"
            label="Workspace sections"
            identity={<Y.Text>Workspace</Y.Text>}
            destinations={links}
            current="calendar"
            expanded={on}
            onExpandedChange={setOn}
          />
          <Y.Navbar label={on ? "Projects" : "Weekly review"} onBack={() => setOn(!on)} />
        </Y.Stack>
      );
    case "calendar":
      return (
        <Y.Calendar label="Review date" value={date} onValueChange={setDate} />
      );
    default:
      throw new Error("Missing example for " + id);
  }
}
