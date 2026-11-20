import { useEffect, useRef, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import {
  ActionMenu, BottomAction, Button, Command, Heading, IconButton, InputOTP,
  SegmentedControl, SidebarLayout, Stepper, Switch, Tabs, Text, TextField, ToastStack, Yogurt,
} from "@openboa/yogurt";
import {
  ActivityIsland, CheckboxList, CommandButton, CopyButton, DetentDial, ExpandCard, FanCards, FileDrop,
  FocusPicker, GhostSuggestion, HoldButton, LetterLimit, LoadingSuccessButton, MentionPicker,
  MorphTooltip, PasswordStrength, PlanSwitch, ProfileCard, PromptBox, RangeSlider, SlideConfirm,
  SpringDropdown, StatCard, StorageMeter, StreamingReply, TaskList, ThinkingIndicator,
} from "@openboa/yogurt/motion-patterns";
import { extraCards } from "./examples/motion-extra-cards";
import { extraControls } from "./examples/motion-extra-controls";
import { extraGestures } from "./examples/motion-extra-gestures";
import { extraExpression } from "./examples/motion-extra-expression";
import { extraUtilities } from "./examples/motion-extra-utilities";

const pages = [
  {id: "overview", label: "Overview"},
  {id: "notes", label: "Notes"},
  {id: "files", label: "Files"},
];
const people = [
  {id: "kai", label: "Kai"},
  {id: "sol", label: "Sol"},
  {id: "morgan", label: "Morgan"},
];
const focusOptions = [
  {id: "all", label: "Available", description: "Show all updates."},
  {id: "quiet", label: "Focus", description: "Keep only urgent updates visible."},
  {id: "pause", label: "Away", description: "Pause new alerts in this view."},
];
const plans = [
  {id: "team", label: "Team", price: "$18 / mo", description: "Shared projects and review tools."},
  {id: "studio", label: "Studio", price: "$36 / mo", description: "More storage and team workspaces."},
];
const steps = [
  {id: "read", label: "Read the brief", detail: "Gather the source notes."},
  {id: "draft", label: "Draft the update", detail: "Prepare the next revision."},
  {id: "handoff", label: "Ask for review", detail: "Wait for a person to respond."},
];

function StorageExample() {
  const [used, setUsed] = useState(64);
  return <div className="motion-sample-stack">
    <StorageMeter label="Workspace storage" used={used} capacity={100} unit="GB" />
    <div className="motion-sample-actions">
      <Button size="compact" emphasis="soft" onClick={() => setUsed(value => Math.min(100, value + 12))}>Add files</Button>
      <Button size="compact" emphasis="quiet" onClick={() => setUsed(64)}>Reset</Button>
    </div>
  </div>;
}

function MentionExample() {
  const [value, setValue] = useState("");
  return <MentionPicker label="Write a note" people={people} value={value} onChange={setValue} />;
}

function ChoiceExample({ kind }: {kind: "plan" | "focus" | "select" | "segments" | "dial"}) {
  const [value, setValue] = useState(kind === "plan" ? "team" : kind === "focus" ? "all" : "overview");
  if (kind === "plan") return <PlanSwitch options={plans} value={value} onChange={setValue} />;
  if (kind === "focus") return <FocusPicker options={focusOptions} value={value} onChange={setValue} />;
  if (kind === "select") return <SpringDropdown label="Workspace view" options={pages} value={value} onChange={setValue} />;
  if (kind === "dial") return <DetentDial options={pages} value={value} onChange={setValue} />;
  return <div className="motion-sample-stack">
    <SegmentedControl label="Workspace view" options={pages} value={value} onValueChange={setValue} />
    <Text variant="help">Showing {pages.find(option => option.id === value)?.label.toLowerCase()}</Text>
  </div>;
}

function WritingExample({ kind }: {kind: "limit" | "ghost" | "password"}) {
  const [value, setValue] = useState(kind === "ghost" ? "Review" : "");
  if (kind === "limit") return <LetterLimit label="Short bio" value={value} onChange={setValue} limit={48} />;
  if (kind === "password") return <PasswordStrength value={value} onChange={setValue} />;
  return <GhostSuggestion value={value} suggestion="Review the workspace notes" onChange={setValue} />;
}

function FilesExample() {
  const [files, setFiles] = useState<File[]>([]);
  return <div className="motion-sample-stack">
    <FileDrop label="Attach files" onFiles={setFiles} multiple accept=".txt,.png,application/pdf" />
    {files.length > 0 && <Text variant="help" role="status">{files.map(file => file.name).join(", ")}</Text>}
  </div>;
}

const answer = "The brief is ready to review. I found two decisions to confirm before publishing the next revision.";
function ConversationExample({ kind }: {kind: "stream" | "prompt" | "thinking"}) {
  const [value, setValue] = useState("");
  const [reply, setReply] = useState("");
  const [active, setActive] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  useEffect(() => () => clearInterval(timer.current), []);

  function stop() {
    clearInterval(timer.current);
    setActive(false);
  }
  function run() {
    clearInterval(timer.current);
    setReply("");
    setActive(true);
    let end = 0;
    timer.current = setInterval(() => {
      end = Math.min(end + 5, answer.length);
      setReply(answer.slice(0, end));
      if (end === answer.length) stop();
    }, 55);
  }

  if (kind === "thinking") {
    return <div className="motion-sample-stack">
      <ThinkingIndicator active={active} />
      <Button size="compact" emphasis="soft" onClick={() => setActive(value => !value)}>{active ? "Stop thinking" : "Start thinking"}</Button>
    </div>;
  }
  return <div className="motion-sample-stack">
    {kind === "prompt" ? <PromptBox value={value} onChange={setValue} busy={active} onSubmit={run} onCancel={stop} /> :
      <div className="motion-sample-actions">
        <Button size="compact" emphasis="soft" onClick={run} disabled={active}>Stream a reply</Button>
        <Button size="compact" emphasis="quiet" onClick={stop} disabled={!active}>Stop</Button>
      </div>}
    {(reply || active) && <StreamingReply value={reply} active={active} />}
  </div>;
}

function CommandExample({ kind }: {kind: "button" | "palette" | "menu"}) {
  const [selection, setSelection] = useState("");
  return <div className="motion-sample-stack">
    {kind === "button" && <CommandButton label="Run command" items={pages} onSelect={setSelection} />}
    {kind === "palette" && <Command label="Open command palette" items={pages} onSelect={setSelection} />}
    {kind === "menu" && <ActionMenu label="View actions"
      items={pages.map(page => ({...page, disabled: page.id === selection}))} onSelect={setSelection} />}
    <Text variant="help" role="status">{selection ? `Opened ${pages.find(page => page.id === selection)?.label}` : ""}</Text>
  </div>;
}

function StepExample({ agent }: {agent: boolean}) {
  const [index, setIndex] = useState(0);
  return <div className="motion-sample-stack">
    <Stepper label={agent ? "Agent steps" : "Step progress"} steps={steps} current={steps[index].id} variant={agent ? "list" : "progress"} />
    <Button size="compact" emphasis="soft" onClick={() => setIndex(value => (value + 1) % steps.length)}>Next step</Button>
  </div>;
}

function TaskListExample() {
  const [active, setActive] = useState(1);
  const [failed, setFailed] = useState(false);
  return <div className="motion-sample-stack">
    <TaskList label="Review the brief" tasks={steps.map((step, index) => ({
      ...step,
      state: index < active ? "done" : index === active ? (failed ? "failed" : "running") : "queued",
      steps: index === 0 ? [
        {id: "notes", label: "Open the source notes", state: active > 0 ? "done" : "running"},
        {id: "references", label: "Verify the revision", state: active > 0 ? "done" : "queued"},
      ] : undefined,
    }))} />
    <div className="motion-sample-actions">
      <Button size="compact" emphasis="soft" disabled={active >= steps.length} onClick={() => {
        if (failed) setFailed(false);
        else setActive(index => index + 1);
      }}>{failed ? "Retry step" : "Complete step"}</Button>
      <Button size="compact" emphasis="quiet" disabled={failed || active >= steps.length} onClick={() => setFailed(true)}>Mark failed</Button>
      <Button size="compact" emphasis="quiet" onClick={() => { setActive(0); setFailed(false); }}>Restart</Button>
    </div>
  </div>;
}

function TabsExample({ smooth }: {smooth?: boolean}) {
  const [value, setValue] = useState("overview");
  return <div className={smooth ? "motion-smooth-tabs" : "motion-pill-tabs"}>
    <Tabs label={smooth ? "Sections" : "Workspace tabs"} value={value} onValueChange={setValue}
      items={pages.map(page => ({...page, panel: <Text variant="help">{page.label} is open.</Text>}))} />
  </div>;
}

function SidebarExample() {
  const [collapsed, setCollapsed] = useState(false);
  return <div className="motion-sample-sidebar">
    <SidebarLayout label="Workspace navigation" width="8.5rem" compactAt={320}
      collapsed={collapsed} onCollapsedChange={setCollapsed}
      navigation={<div className="motion-sample-nav">
        <IconButton label="Overview" icon="menu" />
        <IconButton label="Search" icon="search" />
      </div>}>
      <div className="motion-sample-stack">
        <Text>Workspace</Text>
        <Button size="compact" emphasis="soft" onClick={() => setCollapsed(value => !value)}>{collapsed ? "Expand" : "Collapse"}</Button>
      </div>
    </SidebarLayout>
  </div>;
}

function FeedbackExample({ kind }: {kind: "bottom" | "otp" | "switch" | "notifications" | "save" | "hold" | "slide" | "stat" | "checks"}) {
  const [count, setCount] = useState(0);
  const [value, setValue] = useState("");
  const [chosen, setChosen] = useState<string[]>([]);
  const [notices, setNotices] = useState<{id: string; message: string}[]>([]);
  const [save, setSave] = useState<"idle" | "pending" | "success">("idle");
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timeout.current), []);
  const confirm = () => setCount(value => value + 1);

  if (kind === "stat") return <div className="motion-sample-stack">
    <StatCard label="Records reviewed" detail="This week" value={24 + count} />
    <Button emphasis="soft" size="compact" onClick={confirm}>Review a record</Button>
  </div>;
  if (kind === "checks") return <CheckboxList options={pages} value={chosen} onChange={setChosen} />;
  if (kind === "bottom") return <div className="motion-sample-stack">
    <Text variant="help" role="status">{count ? `Saved ${count} time${count === 1 ? "" : "s"}.` : "Review the workspace settings."}</Text>
    <BottomAction>
      <Button size="compact" emphasis="quiet" onClick={() => setCount(0)}>Reset</Button>
      <Button size="compact" onClick={confirm}>Save changes</Button>
    </BottomAction>
  </div>;
  if (kind === "otp") return <InputOTP label="Verification code" length={6} value={value} onValueChange={setValue} />;
  if (kind === "switch") return <Switch label="Send updates" checked={count === 1} onCheckedChange={checked => setCount(Number(checked))} />;
  if (kind === "notifications") return <div className="motion-sample-stack">
    <Button size="compact" emphasis="soft" onClick={() => {
      setNotices(items => [{id: String(count + 1), message: `Update ${count + 1} received.`}, ...items].slice(0, 3));
      confirm();
    }}>Add notification</Button>
    <ToastStack items={notices} onDismiss={id => setNotices(items => items.filter(item => item.id !== id))} />
  </div>;
  if (kind === "save") return <LoadingSuccessButton label="Save changes" pendingLabel="Saving" successLabel="Saved" errorLabel="Try again" state={save}
    onAction={() => { setSave("pending"); timeout.current = setTimeout(() => setSave("success"), 650); }} />;
  return <div className="motion-sample-stack">
    {kind === "hold" ? <HoldButton label="Hold to approve" onConfirm={confirm} /> : <SlideConfirm label="Slide to approve" onConfirm={confirm} />}
    <Text variant="help" role="status">{count ? `Approved ${count} time${count === 1 ? "" : "s"}.` : ""}</Text>
  </div>;
}

function RangeExample({ elastic }: {elastic?: boolean}) {
  const [value, setValue] = useState(40);
  return <div className={elastic ? "motion-elastic-range" : undefined}>
    <RangeSlider label={elastic ? "Intensity" : "Volume"} value={value} onChange={setValue} />
  </div>;
}

function SpringInputExample() {
  const [value, setValue] = useState("");
  return <div className="motion-spring-input">
    <TextField label="Name this workspace" value={value} onChange={event => setValue(event.target.value)} />
  </div>;
}

type Demo = {id: string; title: string; body: ReactNode};
const demos: {title: string; id: string; items: Demo[]}[] = [
  {title: "Inputs and choices", id: "inputs", items: [
    {id: "mention-picker", title: "Mention picker", body: <MentionExample />},
    {id: "focus-mode", title: "Focus mode", body: <ChoiceExample kind="focus" />},
    {id: "plan-switch", title: "Plan switch", body: <ChoiceExample kind="plan" />},
    {id: "letter-limit", title: "Letter limit", body: <WritingExample kind="limit" />},
    {id: "file-drop", title: "File drop", body: <FilesExample />},
    {id: "range-slider", title: "Range slider", body: <RangeExample />},
    {id: "password-strength", title: "Password strength", body: <WritingExample kind="password" />},
    {id: "checkbox-list", title: "Checkbox list", body: <FeedbackExample kind="checks" />},
    {id: "detent-dial", title: "Detent dial", body: <ChoiceExample kind="dial" />},
    {id: "otp", title: "OTP", body: <FeedbackExample kind="otp" />},
    {id: "toggle-switch", title: "Toggle switch", body: <FeedbackExample kind="switch" />},
    {id: "spring-input", title: "Spring input", body: <SpringInputExample />},
    {id: "elastic-slider", title: "Elastic slider", body: <RangeExample elastic />},
  ]},
  {title: "Navigation and layers", id: "navigation", items: [
    {id: "morph-tooltip", title: "Morph tooltip", body: <MorphTooltip label="Storage details" detail="Files in this workspace are visible to its members." />},
    {id: "spring-dropdown", title: "Spring dropdown", body: <ChoiceExample kind="select" />},
    {id: "command-button", title: "Command button", body: <CommandExample kind="button" />},
    {id: "command-palette", title: "Command palette", body: <CommandExample kind="palette" />},
    {id: "dynamic-menu", title: "Dynamic menu", body: <CommandExample kind="menu" />},
    {id: "tab-pill", title: "Tab pill", body: <TabsExample />},
    {id: "smooth-tabs", title: "Smooth tabs", body: <TabsExample smooth />},
    {id: "segmented-control", title: "Segmented control", body: <ChoiceExample kind="segments" />},
    {id: "bottom-bar", title: "Bottom bar", body: <FeedbackExample kind="bottom" />},
    {id: "sidebar-collapse", title: "Sidebar collapse", body: <SidebarExample />},
  ]},
  {title: "Conversation and activity", id: "conversation", items: [
    {id: "task-list", title: "Task list", body: <TaskListExample />},
    {id: "prompt-box", title: "Prompt box", body: <ConversationExample kind="prompt" />},
    {id: "ghost-suggestion", title: "Ghost suggestion", body: <WritingExample kind="ghost" />},
    {id: "streaming-reply", title: "Streaming reply", body: <ConversationExample kind="stream" />},
    {id: "thinking", title: "Thinking indicator", body: <ConversationExample kind="thinking" />},
    {id: "agent-steps", title: "Agent steps", body: <StepExample agent />},
    {id: "activity-island", title: "Expandable activity", body: <ActivityIsland label="Workspace activity" summary="2 updates"><Text>Draft ready · Review requested</Text></ActivityIsland>},
  ]},
  {title: "Cards and outcomes", id: "feedback", items: [
    {id: "storage-meter", title: "Storage meter", body: <StorageExample />},
    {id: "expand-card", title: "Expand card", body: <ExpandCard title="Review the brief"><Text>See the source, changes and next action.</Text></ExpandCard>},
    {id: "fan-cards", title: "Fan cards", body: <FanCards items={steps} />},
    {id: "stat-card", title: "Stat card", body: <FeedbackExample kind="stat" />},
    {id: "profile-card", title: "Profile card", body: <ProfileCard name="Kai" initials="K" detail="Workspace reviewer"><Text>Reviews new drafts and flags decisions.</Text></ProfileCard>},
    {id: "loading-to-success", title: "Loading to success", body: <FeedbackExample kind="save" />},
    {id: "copy-button", title: "Copy button", body: <div className="motion-sample-stack"><code>review-014</code><CopyButton value="review-014" /></div>},
    {id: "notifications", title: "Notifications", body: <FeedbackExample kind="notifications" />},
    {id: "step-progress", title: "Step progress", body: <StepExample agent={false} />},
    {id: "hold-button", title: "Hold button", body: <FeedbackExample kind="hold" />},
    {id: "slide-confirm", title: "Slide to confirm", body: <FeedbackExample kind="slide" />},
  ]},
  {title: "More controls", id: "more-controls", items: extraControls},
  {title: "More interactions", id: "gestures", items: extraGestures},
  {title: "More cards and text", id: "more-cards", items: extraCards},
  {title: "Utilities", id: "utilities", items: extraUtilities},
  {title: "Expressive motion", id: "expressive", items: extraExpression},
];

function Gallery() {
  const [appearance, setAppearance] = useState<"light" | "dark">(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();
  const visible = demos.map(section => ({
    ...section,
    items: term ? section.items.filter(item =>
      (section.title + " " + item.title).toLowerCase().includes(term)) : section.items,
  })).filter(section => section.items.length > 0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
    return () => cancelAnimationFrame(frame);
  }, []);

  return <Yogurt appearance={appearance} className="motion-patterns-page">
    <main>
      <header className="motion-patterns-header">
        <div>
          <nav aria-label="Yogurt">
            <a href="components.html">Components</a>
            <a href="motion-comparison.html">Current and candidate</a>
            <a href="agents.html">Agents</a>
          </nav>
          <Heading level={1}>Motion patterns</Heading>
          <Text>Try each component in place. Use Tab to explore with a keyboard.</Text>
        </div>
        <IconButton label={appearance === "dark" ? "Use light appearance" : "Use dark appearance"}
          icon={appearance === "dark" ? "sun" : "moon"}
          onClick={() => setAppearance(appearance === "dark" ? "light" : "dark")} />
      </header>
      <div className="motion-pattern-tools">
        <label className="motion-pattern-search">
          <span>Find a pattern</span>
          <input type="search" placeholder="Search patterns" value={query} onChange={event => setQuery(event.target.value)} />
        </label>
        <nav aria-label="Pattern sections" className="motion-section-nav">
          {visible.map(section => <a key={section.id} href={`#${section.id}`}>{section.title}</a>)}
        </nav>
      </div>
      {!visible.length && <Text role="status">No matching patterns.</Text>}
      {visible.map(section => <section key={section.id} id={section.id} aria-labelledby={section.id + "-title"}>
        <Heading id={section.id + "-title"} level={2}>{section.title}</Heading>
        <div className="motion-pattern-grid">
          {section.items.map(item => <article key={item.id} id={item.id} aria-labelledby={item.id + "-title"}>
            <Heading id={item.id + "-title"} level={3}>{item.title}</Heading>
            <div className="motion-pattern-stage">{item.body}</div>
          </article>)}
        </div>
      </section>)}
    </main>
  </Yogurt>;
}

const host = document.getElementById("yogurt-motion-patterns");
if (host) createRoot(host).render(<Gallery />);
