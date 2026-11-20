import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import {
  ActionMenu, Button, Command, Icon, IconButton, InputOTP,
  ProjectMark, SegmentedControl, SidebarItem, SidebarLayout, Stepper, Switch, Tabs, Text, Yogurt,
} from "@openboa/yogurt";
import {
  ActivityIsland, CheckboxList, CommandButton, CopyButton, DetentDial, ExpandCard, FanCards, FileDrop,
  FocusPicker, GhostSuggestion, HoldButton, LetterLimit, LoadingSuccessButton, MentionPicker,
  MorphTooltipBar, PasswordStrength, PlanSwitch, PromptBox, RangeSlider, SlideConfirm,
  SpringDropdown, StatCard, StorageMeter, StreamingReply, TaskList, ThinkingIndicator,
} from "@openboa/yogurt/motion-patterns";
import { extraCards, ReviewerProfile } from "./examples/motion-extra-cards";
import { extraControls } from "./examples/motion-extra-controls";
import { extraGestures } from "./examples/motion-extra-gestures";
import { extraUtilities } from "./examples/motion-extra-utilities";
import { SpringInputExample } from "./examples/spring-field";
import { NotificationStackExample } from "./examples/notification-stack";

const pages = [
  {id: "overview", label: "Overview"},
  {id: "notes", label: "Notes"},
  {id: "files", label: "Files"},
];
const commands = [
  {id: "overview", label: "Overview", hint: "Workspace home and recent updates", shortcut: "O", icon: "menu"},
  {id: "notes", label: "Review notes", hint: "Open the release brief", shortcut: "R", icon: "copy"},
  {id: "files", label: "Source files", hint: "Browse recent attachments", shortcut: "F", icon: "next"},
  {id: "records", label: "Find a record", hint: "Find an entry in the workspace", shortcut: "E", icon: "search"},
  {id: "history", label: "Project history", hint: "See the latest revisions", shortcut: "H", icon: "clock"},
  {id: "settings", label: "Workspace settings", hint: "Manage locally displayed settings", shortcut: "S", icon: "menu"},
] as const;
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
const workStatuses = [
  {id: "queued", label: "Queued", marker: "neutral"},
  {id: "active", label: "In progress", marker: "in-progress"},
  {id: "review", label: "In review", marker: "review"},
  {id: "complete", label: "Complete", marker: "done"},
] as const;

function StorageExample() {
  const [used, setUsed] = useState(64);
  const [cleanup, setCleanup] = useState<"idle" | "pending" | "success">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  function freeSpace() {
    if (used <= 34 || cleanup === "pending") return;
    setCleanup("pending");
    timer.current = setTimeout(() => {
      setUsed(value => Math.max(34, value - 12));
      setCleanup("success");
      timer.current = setTimeout(() => setCleanup("idle"), 1600);
    }, 900);
  }
  return <div className="motion-sample-stack">
    <StorageMeter label="Workspace storage" used={used} capacity={100} unit="GB" categories={[
      {id: "files", label: "Source files", amount: used - 34, detail: <><span>Review attachments</span>
        <LoadingSuccessButton label="Free up space" pendingLabel="Freeing space" successLabel="Space freed"
          errorLabel="Try again" state={cleanup} onAction={freeSpace} /></>},
      {id: "exports", label: "Exports", amount: 22, detail: <span>Saved review exports</span>},
      {id: "notes", label: "Workspace notes", amount: 12, detail: <span>Notes and decision history</span>},
    ]} />
    <div className="motion-sample-actions">
      <Button size="compact" emphasis="soft" onClick={() => setUsed(value => Math.min(100, value + 12))}>Add files</Button>
      <Button size="compact" emphasis="quiet" onClick={() => {
        clearTimeout(timer.current); setCleanup("idle"); setUsed(64);
      }}>Reset</Button>
    </div>
  </div>;
}

function MentionExample() {
  const [value, setValue] = useState("");
  return <MentionPicker label="Write a note" people={people} value={value} onChange={setValue} />;
}

function ChoiceExample({ kind }: {kind: "plan" | "focus" | "select" | "dial"}) {
  const [value, setValue] = useState({plan: "team", focus: "all", select: "active", dial: "overview"}[kind]);
  if (kind === "plan") return <PlanSwitch options={plans} value={value} onChange={setValue} />;
  if (kind === "focus") return <FocusPicker options={focusOptions} value={value} onChange={setValue} />;
  if (kind === "select") return <SpringDropdown label="Work status" options={workStatuses} value={value} onChange={setValue} />;
  return <DetentDial options={pages} value={value} onChange={setValue} />;
}

const inbox = [
  { name: "Review requested", detail: "Release brief", icon: "check", priority: true },
  { name: "Weekly digest", detail: "Project activity", icon: "info", priority: false },
  { name: "Planning reminder", detail: "Tomorrow at 10", icon: "clock", priority: false },
] as const;

function FocusModeExample() {
  const [focus, setFocus] = useState(false);
  const [phase, setPhase] = useState<"spread" | "stack" | "tucked">("spread");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  function change(next: boolean) {
    clearTimeout(timer.current);
    setFocus(next);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase(next ? "tucked" : "spread");
      return;
    }
    setPhase("stack");
    timer.current = setTimeout(() => setPhase(next ? "tucked" : "spread"), next ? 240 : 260);
  }
  return <div className="motion-context-panel motion-focus" data-focused={focus} data-phase={phase}>
    <ul className="motion-focus-inbox">
      {inbox.map(item => <li key={item.name} data-deferred={focus && !item.priority || undefined}>
        <span className="motion-context-icon"><Icon name={item.icon} /></span>
        <span><strong>{item.name}</strong><span>{item.detail}</span></span>

      </li>)}
    </ul>
    <div className="motion-focus-bar">
      <span className="motion-focus-symbol"><Icon name="moon" /></span>
      <Text role="status" className="motion-focus-summary">{focus ? "Priority only" : "All updates"}</Text>
      <span className="motion-focus-count" aria-hidden="true" key={phase === "tucked" ? "held" : "visible"}>
        {phase === "tucked" ? 1 : inbox.length}
      </span>
      <Switch label="Focus mode" checked={focus} onCheckedChange={change} />
    </div>
  </div>;
}

const billingOptions = [{id: "monthly", label: "Monthly"}, {id: "yearly", label: "Yearly"}];
function PriceDigits({ annual }: {annual: boolean}) {
  return <strong className="motion-billing-reels" aria-label={annual ? "20" : "24"}>
    {Array.from(annual ? "20" : "24", (digit,index) =>
      <span className="motion-billing-digit" key={index} aria-hidden="true"
        style={{"--yg-plan-digit": Number(digit), "--yg-plan-wait": `${index * 45}ms`} as CSSProperties}>
        <span>{Array.from("0123456789", n => <span key={n}>{n}</span>)}</span>
      </span>)}
  </strong>;
}
function BillingExample() {
  const [cadence, setCadence] = useState("monthly");
  const annual = cadence === "yearly";
  const [reviewed, setReviewed] = useState<"idle" | "pending" | "success">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return <div className="motion-context-panel motion-billing">
    <SegmentedControl label="Billing period" options={billingOptions} value={cadence} onValueChange={(value) => {
      setCadence(value);
      clearTimeout(timer.current);
      setReviewed("idle");
    }} />
    <div className="motion-billing-detail">
      <header><strong>Workspace Plus</strong>{annual && <span className="motion-billing-save">Save 17%</span>}</header>
      <div className="motion-billing-price" role="status">
        <div><span className="motion-billing-currency">$</span><PriceDigits annual={annual} /><Text variant="help">per month</Text></div>
        <Text variant="help" className="motion-billing-line" key={cadence}>{annual ? "$240 billed yearly" : "$24 billed monthly"}</Text>
      </div>
      <ul className="motion-plan-benefits">
        <li><Icon name="check" /> Shared projects and reviews</li>
        <li><Icon name="check" /> Extended activity history</li>
      </ul>
      <div className="motion-billing-extra" data-annual={annual || undefined}>
        <div inert={!annual}><Icon name="check" /> Two months included</div>
      </div>
    </div>
    <LoadingSuccessButton fluid label="Review plan" pendingLabel="Reviewing plan" successLabel="Plan reviewed"
      errorLabel="Try again" presentation="morphing" state={reviewed} onAction={() => {
        if (reviewed !== "idle") return;
        setReviewed("pending");
        timer.current = setTimeout(() => { setReviewed("success"); }, 1200);
      }} />
  </div>;
}

function WritingExample({ kind }: {kind: "limit" | "ghost" | "password"}) {
  const [value, setValue] = useState(kind === "ghost" ? "Review" : "");
  if (kind === "limit") return <LetterLimit label="Short bio" placeholder="Tell the workspace about yourself…" value={value} onChange={setValue} limit={48} onSubmit={() => setValue("")} />;
  if (kind === "password") return <PasswordStrength value={value} onChange={setValue} />;
  return <GhostSuggestion value={value} suggestion="Review the workspace notes" onChange={setValue} />;
}

function FilesExample() {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  useEffect(() => () => clearInterval(timer.current), []);
  function prepare(next: File[]) {
    clearInterval(timer.current);
    setFiles(next);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(1);
      return;
    }
    setProgress(0);
    const start = performance.now();
    timer.current = setInterval(() => {
      const fraction = Math.min(1, (performance.now() - start) / 2100);
      const paced = fraction < .35 ? fraction * 1.4 :
        fraction < .6 ? .49 + (fraction - .35) * .4 : .59 + (fraction - .6) * 1.025;
      setProgress(fraction === 1 ? 1 : Math.min(.99, paced));
      if (fraction === 1) clearInterval(timer.current);
    }, 30);
  }
  return <div className="motion-sample-stack">
    <FileDrop label="Attach files" onFiles={prepare} progress={progress} multiple accept=".txt,.png,application/pdf" />
    {files.length > 0 && <Text variant="help" role="status">{files.map(file => file.name).join(", ")}</Text>}
  </div>;
}

const answer = "The brief is ready to review. I found two decisions to confirm before publishing the next revision.";
const replyWords = answer.match(/\S+\s*/g) ?? [];
function ConversationExample({ kind }: {kind: "stream" | "prompt" | "thinking"}) {
  const [value, setValue] = useState("");
  const [reply, setReply] = useState("");
  const [active, setActive] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  function stop() {
    clearTimeout(timer.current);
    setActive(false);
  }
  function run() {
    clearTimeout(timer.current);
    if (kind === "prompt") setValue("");
    setReply("");
    setActive(true);
    let next = 0;
    const word = () => {
      const chunk = replyWords[next++];
      setReply(previous => previous + chunk);
      if (next === replyWords.length) stop();
      else timer.current = setTimeout(word, 70);
    };
    timer.current = setTimeout(word, kind === "stream" ? 2100 : 600);
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
  return <div className="motion-sample-stack" data-command-example={kind}>
    {kind === "button" && <CommandButton label="Run command" items={pages} onSelect={setSelection} />}
    {kind === "palette" && <Command label="Open command palette" presentation="inline" triggerText="Search" items={[...commands]} onSelect={setSelection} />}
    {kind === "menu" && <ActionMenu label="View actions" presentation="expanding"
      items={pages.map(page => ({...page, disabled: page.id === selection}))} onSelect={setSelection} />}
    <Text variant="help" role="status">{selection ? `Opened ${(kind === "palette" ? commands : pages).find(page => page.id === selection)?.label}` : ""}</Text>
  </div>;
}

function StepExample({ agent }: {agent: boolean}) {
  const [index, setIndex] = useState(0);
  return <div className="motion-sample-stack">
    <Stepper label={agent ? "Agent steps" : "Step progress"} steps={steps} current={steps[index].id} variant={agent ? "list" : "progress"} />
    <div className="motion-sample-actions">
      <Button size="compact" emphasis="quiet" disabled={index === 0} onClick={() => setIndex(value => value - 1)}>Back</Button>
      <Button size="compact" emphasis="soft" onClick={() => setIndex(value => (value + 1) % steps.length)}>
        {index === steps.length - 1 ? "Start over" : "Next step"}
      </Button>
    </div>
  </div>;
}

const reviewDetails = ["2 files", "1 draft", "1 reviewer"];

function TaskListExample() {
  const [active, setActive] = useState(1);
  const [failed, setFailed] = useState(false);
  return <div className="motion-sample-stack">
    <TaskList label="Review the brief" tasks={steps.map((step, index) => ({
      ...step,
      detail: reviewDetails[index],
      state: index < active ? "done" : index === active ? (failed ? "failed" : "running") : "queued",
      steps: index === 0 ? [
        {id: "notes", label: "Open the source notes", state: active > 0 ? "done" : "running"},
        {id: "references", label: "Verify the revision", state: active > 0 ? "done" : "queued"},
      ] : undefined,
    }))} />
    <details className="motion-example-controls">
      <summary>Example controls</summary>
      <div className="motion-sample-actions">
        <Button emphasis="soft" disabled={active >= steps.length} onClick={() => {
          if (failed) setFailed(false);
          else setActive(index => index + 1);
        }}>{failed ? "Retry step" : "Complete step"}</Button>
        <Button size="compact" emphasis="quiet" disabled={failed || active >= steps.length} onClick={() => setFailed(true)}>Mark failed</Button>
        <Button size="compact" emphasis="quiet" onClick={() => { setActive(0); setFailed(false); }}>Restart</Button>
      </div>
    </details>
  </div>;
}

const periods = [
  {id: "day", label: "Day"}, {id: "week", label: "Week"},
  {id: "month", label: "Month"}, {id: "year", label: "Year"},
];
function SegmentsExample() {
  const [period, setPeriod] = useState("week");
  return <div className="motion-segmented">
    <SegmentedControl label="Reporting period" options={periods} value={period} onValueChange={setPeriod} />
    <div className="motion-segment-caption" role="status">
      <span key={period}>Showing this <strong>{period}</strong></span>
    </div>
  </div>;
}

const workspaceTabs = [
  {id: "overview", label: "Overview"}, {id: "projects", label: "Projects"},
  {id: "team", label: "Team"}, {id: "settings", label: "Settings"},
];
const sectionSummaries: Record<string, {title: string; detail: string}> = {
  overview: {title: "Workspace overview", detail: "2 updates to review"},
  notes: {title: "Review notes", detail: "1 draft ready for feedback"},
  files: {title: "Source files", detail: "3 attachments in this workspace"},
};
function TabsExample({ smooth }: {smooth?: boolean}) {
  const [value, setValue] = useState("overview");
  return <div className={smooth ? "motion-smooth-tabs" : "motion-pill-tabs"}>
    <Tabs label={smooth ? "Sections" : "Workspace tabs"} value={value} onValueChange={setValue}
      presentation="pill"
      items={(smooth ? pages : workspaceTabs).map(page => ({
        ...page, panel: smooth ? <div className="motion-tab-panel-copy">
          <strong>{sectionSummaries[page.id].title}</strong>
          <Text variant="help">{sectionSummaries[page.id].detail}</Text>
        </div> : null,
      }))} />
  </div>;
}

const destinations = [
  {id: "home", label: "Home", icon: "home"},
  {id: "search", label: "Search", icon: "search"},
  {id: "saved", label: "Saved", icon: "bookmark"},
  {id: "profile", label: "Profile", icon: "person"},
] as const;
function BottomBarExample() {
  const [value, setValue] = useState("home");
  return <div className="motion-bottom-bar">
    <Tabs label="Destination" value={value} onValueChange={setValue} presentation="dock"
      items={destinations.map(item => ({...item, panel: null}))} />
  </div>;
}

const preferences = [
  {label: "Wi-Fi", help: "Home network", enabled: true},
  {label: "Bluetooth", help: "2 devices", enabled: true},
  {label: "Airplane mode", help: "Off", enabled: false},
  {label: "Low power", help: "Saves battery", enabled: false},
];
function SwitchesExample() {
  return <div className="motion-switches">
    {preferences.map(option => <Switch key={option.label} label={option.label}
      help={option.help} defaultChecked={option.enabled} />)}
  </div>;
}

function SidebarExample() {
  const [collapsed, setCollapsed] = useState(false);
  const [destination, setDestination] = useState("Overview");
  return <div className="motion-sample-sidebar">
    <SidebarLayout label="Workspace navigation" width="min(212px, 56%)" compactAt={0}
      collapsed={collapsed} onCollapsedChange={setCollapsed}
      navigation={<div className="motion-sample-nav">
        <ProjectMark project="openboa" size={26} />
        <SidebarItem label="Overview" icon={<Icon name="home" />} active={destination === "Overview"} onSelect={() => setDestination("Overview")} />
        <SidebarItem label="Search" icon={<Icon name="search" />} active={destination === "Search"} onSelect={() => setDestination("Search")} />
        <SidebarItem label="Saved" icon={<Icon name="bookmark" />} active={destination === "Saved"} onSelect={() => setDestination("Saved")} />
      </div>}>
      <div className="motion-sidebar-content">
        <Button size="compact" emphasis="soft" aria-expanded={!collapsed} onClick={() => setCollapsed(value => !value)}>{collapsed ? "Expand" : "Collapse"}</Button>
        <Text variant="help">{destination}</Text>
      </div>
    </SidebarLayout>
  </div>;
}

const handoffTasks = [
  {id: "brief", label: "Collect the release notes"},
  {id: "states", label: "Check the empty states"},
  {id: "compact", label: "Review the compact layout"},
  {id: "handoff", label: "Share the review build"},
];
const recordSeries = [.16,.19,.27,.24,.38,.35,.43,.55,.49,.68,.63,.78];

function FeedbackExample({ kind }: {kind: "otp" | "save" | "hold" | "slide" | "stat" | "checks"}) {
  const [count, setCount] = useState(0);
  const [value, setValue] = useState("");
  const [chosen, setChosen] = useState<string[]>([]);
  const [save, setSave] = useState<"idle" | "pending" | "success">("idle");
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timeout.current), []);
  const confirm = () => setCount(value => value + 1);

  if (kind === "stat") return <div className="motion-sample-stack">
    <StatCard label="Records reviewed" detail="This week" value={24 + count}
      series={count === 0 ? recordSeries : recordSeries.map((point,index) =>
        Math.min(.98, point + .025 * (1 + (index + count) % 7)))} />
    <Button emphasis="soft" size="compact" onClick={confirm}>Review a record</Button>
  </div>;
  if (kind === "checks") return <CheckboxList options={handoffTasks} value={chosen} onChange={setChosen} />;
  if (kind === "otp") return <InputOTP label="Verification code" length={6} value={value}
    verified={value.length === 6} onValueChange={next => {
      clearTimeout(timeout.current);
      setValue(next);
      if (next.length === 6) timeout.current = setTimeout(() => setValue(""), 2750);
    }} />;
  if (kind === "save") return <LoadingSuccessButton label="Save changes" pendingLabel="Saving" successLabel="Saved"
    errorLabel="Try again" state={save} presentation="morphing" onAction={() => {
      if (save !== "idle") return;
      setSave("pending");
      timeout.current = setTimeout(() => {
        setSave("success");
        timeout.current = setTimeout(() => setSave("idle"), 2000);
      }, 1600);
    }} />;
  return <div className="motion-sample-stack">
    {kind === "hold" ? <HoldButton label="Hold to approve" onConfirm={confirm} /> : <SlideConfirm label="Slide to approve" onConfirm={confirm} />}
    <Text variant="help" role="status">{count ? `Approved ${count} time${count === 1 ? "" : "s"}.` : ""}</Text>
  </div>;
}

function RangeExample({ elastic }: {elastic?: boolean}) {
  const [value, setValue] = useState(elastic ? 40 : 190);
  const [end, setEnd] = useState(760);
  if (elastic) return <div className="motion-elastic-range">
    <RangeSlider label="Intensity" presentation="elastic" step={5} value={value} onChange={setValue} />
  </div>;
  return <RangeSlider label="Price" detail="per night" value={value} onChange={setValue}
    end={end} onEndChange={setEnd} max={1000} step={10} minThumbGap={34} formatValue={price => `$${price}`} />;
}

const tooltipTools = [
  {id: "storage", label: "Storage details", detail: "Workspace storage", icon: "bookmark"},
  {id: "review", label: "Review notes", detail: "Open the review notes", icon: "copy"},
  {id: "history", label: "Activity history", detail: "See recent activity", icon: "clock"},
  {id: "people", label: "Workspace members", detail: "Show members", icon: "person"},
  {id: "help", label: "Help", detail: "Read workspace help", icon: "info"},
] as const;
function TooltipExample() {
  const [value, setValue] = useState("storage");
  return <MorphTooltipBar label="Workspace tools" tools={tooltipTools} value={value} onChange={setValue} />;
}

type Demo = {id: string; title: string; body: ReactNode; detail?: string; wide?: boolean};
const demos: {title: string; id: string; items: Demo[]}[] = [
  {title: "Inputs and choices", id: "inputs", items: [
    {id: "mention-picker", detail: "Type @ in the review note to mention a teammate.", title: "Mention picker", body: <MentionExample />},
    {id: "focus-mode", detail: "Keep priority updates visible while the rest of the inbox goes quiet.", title: "Focus mode", body: <FocusModeExample />},
    {id: "plan-switch", detail: "Compare a monthly and yearly subscription for the same workspace.", title: "Plan switch", body: <BillingExample />},
    {id: "letter-limit", title: "Letter limit", body: <WritingExample kind="limit" />},
    {id: "file-drop", detail: "Add source files to a review by dropping them here or opening the file picker.", title: "File drop", body: <FilesExample />},
    {id: "range-slider", title: "Range slider", body: <RangeExample />},
    {id: "password-strength", title: "Password strength", body: <WritingExample kind="password" />},
    {id: "checkbox-list", title: "Checkbox list", body: <FeedbackExample kind="checks" />},
    {id: "detent-dial", title: "Detent dial", body: <ChoiceExample kind="dial" />},
    {id: "otp", title: "OTP", body: <FeedbackExample kind="otp" />},
    {id: "toggle-switch", title: "Toggle switch", body: <SwitchesExample />},
    {id: "spring-input", title: "Spring input", body: <SpringInputExample />},
    {id: "elastic-slider", title: "Elastic slider", body: <RangeExample elastic />},
  ]},
  {title: "Navigation and layers", id: "navigation", items: [
    {id: "morph-tooltip", title: "Morph tooltip", body: <TooltipExample />},
    {id: "spring-dropdown", title: "Spring dropdown", body: <ChoiceExample kind="select" />},
    {id: "command-button", title: "Command button", body: <CommandExample kind="button" />},
    {id: "command-palette", detail: "Search destinations in the workspace. Use the arrow keys and Enter to open one.", title: "Command palette", body: <CommandExample kind="palette" />},
    {id: "dynamic-menu", title: "Dynamic menu", body: <CommandExample kind="menu" />},
    {id: "tab-pill", title: "Tab pill", body: <TabsExample />},
    {id: "smooth-tabs", title: "Smooth tabs", body: <TabsExample smooth />},
    {id: "segmented-control", title: "Segmented control", body: <SegmentsExample />},
    {id: "bottom-bar", title: "Bottom bar", body: <BottomBarExample />},
    {id: "sidebar-collapse", detail: "Keep workspace destinations available in a compact rail.", wide: true, title: "Sidebar collapse", body: <SidebarExample />},
  ]},
  {title: "Conversation and activity", id: "conversation", items: [
    {id: "task-list", detail: "Follow a review from draft to handoff. Open a completed step to see its checklist, or retry a failed step.", title: "Task list", body: <TaskListExample />},
    {id: "prompt-box", detail: "Write a request for the review assistant and follow its response.", title: "Prompt box", body: <ConversationExample kind="prompt" />},
    {id: "ghost-suggestion", title: "Ghost suggestion", body: <WritingExample kind="ghost" />},
    {id: "streaming-reply", title: "Streaming reply", body: <ConversationExample kind="stream" />},
    {id: "thinking", title: "Thinking indicator", body: <ConversationExample kind="thinking" />},
    {id: "agent-steps", title: "Agent steps", body: <StepExample agent />},
    {id: "activity-island", title: "Expandable activity", body: <ActivityIsland compact label="Activity" summary="2 updates"><Text>Draft ready · Review requested</Text></ActivityIsland>},
  ]},
  {title: "Data and feedback", id: "feedback", items: [
    {id: "storage-meter", detail: "Track the storage used by a workspace and see what changes as it fills up.", title: "Storage meter", body: <StorageExample />},
    {id: "expand-card", title: "Expand card", body: <ExpandCard title="Review the brief"><Text>See the source, changes and next action.</Text></ExpandCard>},
    {id: "fan-cards", title: "Fan cards", body: <FanCards items={steps} />},
    {id: "stat-card", title: "Stat card", body: <FeedbackExample kind="stat" />},
    {id: "profile-card", title: "Profile card", body: <ReviewerProfile />},
    {id: "loading-to-success", title: "Loading to success", body: <FeedbackExample kind="save" />},
    {id: "copy-button", title: "Copy button", body: <div className="motion-sample-stack"><code>review-014</code><CopyButton value="review-014" /></div>},
    {id: "notifications", title: "Notifications", body: <NotificationStackExample />},
    {id: "step-progress", title: "Step progress", body: <StepExample agent={false} />},
    {id: "hold-button", title: "Hold button", body: <FeedbackExample kind="hold" />},
    {id: "slide-confirm", title: "Slide to confirm", body: <FeedbackExample kind="slide" />},
  ]},
  {title: "Editing controls", id: "more-controls", items: [
    {id: "focus-options", title: "Focus options", body: <ChoiceExample kind="focus" />},
    {id: "plan-options", title: "Plan options", body: <ChoiceExample kind="plan" />},
    ...extraControls,
  ]},
  {title: "Manipulation", id: "gestures", items: extraGestures},
  {title: "Content and documents", id: "more-cards", items: extraCards},
  {title: "Utilities", id: "utilities", items: extraUtilities},
];

const patterns = demos.flatMap(section => section.items.map(item => ({ ...item, section })));

function locationPattern() {
  const hash = window.location.hash.slice(1);
  return patterns.find(pattern => pattern.id === hash)?.id ??
    demos.find(section => section.id === hash)?.items[0]?.id ?? "task-list";
}

function Gallery() {
  const [appearance, setAppearance] = useState<"light" | "dark">(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const [selected, setSelected] = useState(locationPattern);
  const [query, setQuery] = useState("");
  const [indexOpen, setIndexOpen] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const term = query.trim().toLowerCase();
  const current = patterns.find(pattern => pattern.id === selected)!;
  const matches = demos.map(section => ({
    ...section,
    items: term ? section.items.filter(item =>
      (section.title + " " + item.title).toLowerCase().includes(term)) : section.items,
  })).filter(section => section.items.length > 0);

  useEffect(() => {
    function followHash() {
      setSelected(locationPattern());
      setQuery("");
    }
    window.addEventListener("hashchange", followHash);
    return () => window.removeEventListener("hashchange", followHash);
  }, []);

  function choose(id: string) {
    if (window.location.hash !== "#" + id) window.history.pushState(null, "", "#" + id);
    setSelected(id);
    setIndexOpen(false);
    setQuery("");
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    });
  }

  function followLink(event: MouseEvent<HTMLAnchorElement>, id: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    choose(id);
  }

  return <Yogurt appearance={appearance} className="motion-patterns-page">
    <main>
      <header className="motion-patterns-header">
        <a className="motion-pattern-brand" href="components.html">
          <ProjectMark project="openboa" size={26} /> Yogurt
        </a>
        <nav aria-label="Yogurt">
          <a href="components.html">Components</a>
          <a href="workflows.html">Workflows</a>
          <a href="motion-patterns.html" aria-current="page">Patterns</a>
          <a href="motion-comparison.html">Compare motion</a>
          <a href="agents.html">Agents</a>
        </nav>
        <IconButton label={appearance === "dark" ? "Use light appearance" : "Use dark appearance"}
          icon={appearance === "dark" ? "sun" : "moon"}
          onClick={() => setAppearance(appearance === "dark" ? "light" : "dark")} />
      </header>
      <div className="motion-pattern-layout">
        <aside className="motion-pattern-index" data-open={indexOpen}>
          <button className="motion-index-toggle" type="button" aria-expanded={indexOpen} aria-controls="pattern-directory"
            onClick={() => setIndexOpen(value => !value)}>
            <Icon name="menu" /> Browse patterns <Icon name="down" />
          </button>
          <div id="pattern-directory" className="motion-index-directory">
            <p className="motion-index-title">Motion patterns</p>
            <label className="motion-pattern-search">
              <Icon name="search" />
              <input type="search" aria-label="Find a pattern" placeholder="Find a pattern" value={query}
                onChange={event => setQuery(event.target.value)}
                onKeyDown={event => {
                  if (event.key === "Enter" && term && matches[0]) choose(matches[0].items[0].id);
                }} />
            </label>
            <nav aria-label="Pattern index">
              {matches.map(section => <details key={section.id} open={!!term || current.section.id === section.id}>
                <summary>{section.title}<Icon name="down" /></summary>
                <ul>
                  {section.items.map(item => <li key={item.id}>
                    <a href={`#${item.id}`} aria-current={selected === item.id ? "location" : undefined}
                      onClick={event => followLink(event, item.id)}>{item.title}</a>
                  </li>)}
                </ul>
              </details>)}
              {!matches.length && <Text role="status">No matching patterns.</Text>}
            </nav>
          </div>
        </aside>
        <div className="motion-pattern-main">
          <header className="motion-pattern-intro">
            <p>{current.section.title}</p>
            <h1 ref={heading} tabIndex={-1}>{current.title}</h1>
            {current.detail && <p className="motion-pattern-detail">{current.detail}</p>}
          </header>
          <article className="motion-pattern-article" key={current.id} id={current.id}
            aria-label={current.title} data-wide={current.wide || undefined}>
            <div className="motion-pattern-stage"><div className="motion-pattern-sample">{current.body}</div></div>
          </article>
        </div>
      </div>
    </main>
  </Yogurt>;
}

const host = document.getElementById("yogurt-motion-patterns");
if (host) createRoot(host).render(<Gallery />);
