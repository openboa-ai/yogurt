import { useEffect, useRef, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { Heading, Icon, Text, Yogurt } from "../../packages/web/src/foundation/foundation.js";
import { Button } from "../../packages/web/src/controls/actions.js";
import { Select } from "../../packages/web/src/controls/forms.js";
import { SegmentedControl } from "../../packages/web/src/controls/navigation.js";
import { Carousel } from "../../packages/web/src/controls/advanced.js";
import { CarouselMotionReview } from "../../packages/web/src/controls/motion-review-context.js";

const options = [
  {id: "overview", label: "Overview"},
  {id: "activity", label: "Activity"},
  {id: "files", label: "Files"},
];

const summaries = { overview: "12 open items", activity: "4 recent updates", files: "8 shared files" };

const workspaces = [
  {id: "studio", label: "Studio"},
  {id: "workshop", label: "Workshop"},
  {id: "library", label: "Library"},
];

const slides = [
  {id: "brief", label: "Brief", title: "Review the brief", detail: "12 notes", surface: "paper"},
  {id: "draft", label: "Draft", title: "Open the draft", detail: "4 updates", surface: "mist"},
  {id: "review", label: "Review", title: "Read the feedback", detail: "3 comments", surface: "neutral"},
].map(({id, label, title, detail, surface}) => ({
  id, label,
  content: (
    <div className="motion-slide-card" data-surface={surface}>
      <Heading level={3}>{title}</Heading>
      <Text variant="help">{detail}</Text>
    </div>
  ),
}));

function Compare({ id, title, instruction, action, children }: {
  id: string;
  title: string;
  instruction: string;
  action?: ReactNode;
  children: (candidate: boolean) => ReactNode;
}) {
  return (
    <section className="motion-scene" aria-labelledby={id}>
      <div className="motion-scene-heading">
        <div>
          <Heading id={id} level={2}>{title}</Heading>
          <Text variant="help">{instruction}</Text>
        </div>
        {action}
      </div>
      <div className="motion-pair">
        {[false, true].map(candidate => (
          <div className="motion-example" key={String(candidate)} data-motion-candidate={candidate || undefined}
            aria-label={candidate ? "Candidate" : "Current"} role="group">
            <span className="motion-variant">{candidate ? "Candidate" : "Current"}</span>
            {children(candidate)}
          </div>
        ))}
      </div>
    </section>
  );
}

function SaveExample({ candidate }: { candidate: boolean }) {
  const [outcome, setOutcome] = useState("success");
  const [state, setState] = useState("idle");
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timeout.current), []);

  function save() {
    setState("pending");
    timeout.current = setTimeout(() => setState(outcome), 650);
  }

  return (
    <div className="motion-control-stack">
      <Select label="Simulated result" value={outcome} onChange={event => setOutcome(event.currentTarget.value)}
        options={[{id: "success", label: "Success"}, {id: "failure", label: "Failure"}]} />
      <div className="motion-save-row">
        <Button className={candidate ? "motion-press" : undefined} pending={state === "pending"} onClick={save}
          aria-label="Save changes" data-result={state}>
          {candidate && (state === "success" || state === "failure") ? (
            <span className="motion-button-result" key={state}>
              <Icon name={state === "success" ? "check" : "close"} />
              {state === "success" ? "Saved" : "Try again"}
            </span>
          ) : "Save changes"}
        </Button>
        <span role="status" data-result={state} className={candidate ? "motion-visually-hidden" : "motion-result"}>
          {state === "pending" ? "Saving…" : state === "success" ? "Changes saved" :
            state === "failure" ? "Couldn’t save" : ""}
        </span>
      </div>
    </div>
  );
}

function SegmentExample({ replay }: { replay: number }) {
  const [value, setValue] = useState(options[0].id);
  useEffect(() => {
    if (!replay) return;
    setValue("overview");
    const first = setTimeout(() => setValue("files"), 240);
    const second = setTimeout(() => setValue("activity"), 300);
    return () => { clearTimeout(first); clearTimeout(second); };
  }, [replay]);

  return (
    <div className="motion-control-stack">
      <SegmentedControl label="Workspace view" options={options} value={value} onValueChange={setValue} />
      <div data-segment-result={value} className="motion-segment-panel">
        <Text key={value} variant="help">{summaries[value as keyof typeof summaries]}</Text>
      </div>
    </div>
  );
}

function WorkspacePicker() {
  const [side, setSide] = useState("below");

  function measure(select: HTMLSelectElement) {
    const field = select.getBoundingClientRect();
    const row = select.offsetHeight;
    const required = row * workspaces.length + 16;
    setSide(window.innerHeight - field.bottom < required && field.top >= required ? "above" : "below");
  }

  return (
    <div data-picker-side={side}>
      <Select label="Workspace" options={workspaces} defaultValue="studio"
        onPointerDown={event => measure(event.currentTarget)}
        onKeyDown={event => measure(event.currentTarget)} />
    </div>
  );
}

type Appearance = "light" | "dark" | "auto";
function MotionComparison() {
  const [appearance, setAppearance] = useState<Appearance>("auto");
  const [replay, setReplay] = useState(0);

  return (
    <Yogurt className="motion-comparison-theme" appearance={appearance}>
      <main className="motion-comparison">
        <header className="motion-heading">
          <div>
            <a className="motion-home" href="index.html">Yogurt</a>
            <Heading level={1}>Component motion</Heading>
            <Text>Try the same interaction in both versions.</Text>
          </div>
          <SegmentedControl label="Appearance" value={appearance} onValueChange={value => setAppearance(value as Appearance)}
            options={[{id: "auto", label: "System"}, {id: "light", label: "Light"}, {id: "dark", label: "Dark"}]} />
        </header>
        <Compare id="button" title="Button" instruction="Press and release. Choose a failure result to check recovery.">
          {candidate => <SaveExample candidate={candidate} />}
        </Compare>
        <Compare id="select" title="Select" instruction="Open the list, dismiss with Escape, then reopen and choose a workspace.">
          {() => <WorkspacePicker />}
        </Compare>
        <Compare id="segmented-control" title="Segmented control"
          instruction="Switch views quickly, or replay the same sequence in both."
          action={<Button emphasis="soft" size="compact" onClick={() => setReplay(count => count + 1)}>Replay selection</Button>}>
          {() => <SegmentExample replay={replay} />}
        </Compare>
        <Compare id="carousel" title="Carousel" instruction="Drag horizontally, change direction, then release. The arrows work with a keyboard.">
          {candidate => (
            <CarouselMotionReview.Provider value={candidate}>
              <Carousel label="Review steps" items={slides} />
            </CarouselMotionReview.Provider>
          )}
        </Compare>
      </main>
    </Yogurt>
  );
}

const host = document.getElementById("yogurt-motion-comparison");
if (host) createRoot(host).render(<MotionComparison />);
