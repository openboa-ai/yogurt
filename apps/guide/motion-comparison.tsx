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
          <div className="motion-example" key={String(candidate)} data-motion-candidate={candidate || undefined} data-motion-baseline={!candidate || undefined}
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
          aria-label={candidate && state === "success" ? "Saved" :
            candidate && state === "failure" ? "Try again" : "Save changes"} data-result={state}>
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

type Appearance = "light" | "dark" | "auto";
export function MotionComparison({ embedded = false, guideAppearance }: { embedded?: boolean; guideAppearance?: "light" | "dark" }) {
  const [appearance, setAppearance] = useState<Appearance>("auto");
  const [replay, setReplay] = useState(0);

  return (
    <Yogurt className="motion-comparison-theme" appearance={appearance === "auto" ? guideAppearance ?? "auto" : appearance}>
      <main className="motion-comparison">
        <header className="motion-heading">
          <div>
            {!embedded && <nav className="motion-links" aria-label="Yogurt">
              <a className="motion-home" href="index.html">Yogurt</a>
              <a className="motion-home" href="components.html">Component library</a>
              <a className="motion-home" href="agents.html">Agent motion</a>
            </nav>}
            <Heading level={1}>Component motion</Heading>
            <Text>Try the same interaction in both versions.</Text>
          </div>
          <SegmentedControl label="Appearance" value={appearance} onValueChange={value => setAppearance(value as Appearance)}
            options={[{id: "auto", label: "System"}, {id: "light", label: "Light"}, {id: "dark", label: "Dark"}]} />
        </header>
        <Compare id="button" title="Button" instruction="Press and release. Choose a failure result to check recovery.">
          {candidate => <SaveExample candidate={candidate} />}
        </Compare>
        <Compare id="select" title="Select" instruction="Open and choose a workspace. Picker motion uses browser support.">
          {() => <Select label="Workspace" options={workspaces} defaultValue="studio" />}
        </Compare>
        <Compare id="segmented-control" title="Segmented control"
          instruction="Switch views quickly, or replay the same sequence in both."
          action={<Button emphasis="soft" size="compact" onClick={() => setReplay(count => count + 1)}>Replay a quick reversal</Button>}>
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
