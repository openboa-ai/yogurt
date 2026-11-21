import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Button, Icon, IconButton, ProjectMark, RecordFacts, Select, SidebarContent,
  SidebarGroup, SidebarItem, SidebarLayout, SidebarTrigger, Status, Yogurt,
} from "@openboa/yogurt";
import { PromptBox, StreamingReply, TaskList } from "@openboa/yogurt/motion-patterns";
import { CollectionBrowser } from "../../packages/recipes/collection-browser/web";
import { DecisionReview } from "../../packages/recipes/decision-review/web";
import { sectionHref } from "./routing";

const flows = [
  { id: "records", label: "Find a record", icon: "search", components: [["sidebar", "Sidebar"], ["search-field", "Search field"], ["select", "Select"], ["list-row", "List row"], ["collection-browser", "Collection browser"]] },
  { id: "request", label: "Write a request", icon: "next", components: [["button", "Button"], ["composer", "Composer"], ["motion-patterns.html#prompt-box", "Prompt box"], ["motion-patterns.html#task-list", "Task list"]] },
  { id: "decision", label: "Review a decision", icon: "check", components: [["record-facts", "Record facts"], ["confirm-dialog", "Confirm dialog"], ["decision-review", "Decision review"]] },
] as const;

const records = [
  { id: "release", title: "Release review", detail: "Handoff · Updated Nov 20", owner: "Kai", revision: "7" },
  { id: "intake", title: "Project intake", detail: "Planning · Updated Nov 18", owner: "Sol", revision: "3" },
  { id: "archive", title: "October notes", detail: "Archive · Updated Oct 31", owner: "Morgan", revision: "2", archived: true },
];
const observation = { source: "Workspace records", asOf: "2026-11-20", timeLabel: "Nov 20" };

function RecordsWorkflow() {
  const [id, setId] = useState(records[0].id);
  const [order, setOrder] = useState("updated");
  const [showDetail, setShowDetail] = useState(false);
  const detail = useRef<HTMLElement>(null);
  const list = useRef<HTMLElement>(null);
  const record = records.find((item) => item.id === id) ?? records[0];
  const visibleRecords = order === "title" ? [...records].sort((a, b) => a.title.localeCompare(b.title)) : records;
  useEffect(() => {
    if (showDetail) detail.current?.focus();
  }, [showDetail, id]);

  return <div className="workflow-records" data-show-detail={showDetail}>
    <section ref={list} tabIndex={-1} className="workflow-record-list" aria-label="Record list">
      <div className="workflow-sort">
        <Select label="Sort records" value={order} onChange={(event) => setOrder(event.target.value)} options={[
          {id: "updated", label: "Last updated"}, {id: "title", label: "Title"},
        ]} />
      </div>
      <CollectionBrowser title="Workspace records" records={visibleRecords} onOpen={(key) => {
        setId(key);
        setShowDetail(true);
      }} selectedId={id} />
    </section>
    <section ref={detail} tabIndex={-1} className="workflow-record-detail" aria-label="Record details">
      <Button className="workflow-back" size="compact" emphasis="quiet" onClick={() => {
        setShowDetail(false);
        requestAnimationFrame(() => list.current?.querySelector("input")?.focus());
      }}>Back to records</Button>
      <span className="workflow-kicker">Selected record</span>
      <RecordFacts title={record.title} {...observation} facts={[
        { id: "owner", label: "Owner", value: record.owner },
        { id: "revision", label: "Revision", value: record.revision },
        { id: "update", label: "Last update", value: record.detail },
      ]} />
    </section>
  </div>;
}

const reply = "I reviewed the release brief and found two items that need an owner before handoff.";
function RequestWorkflow() {
  const [draft, setDraft] = useState("");
  const [request, setRequest] = useState("");
  const [state, setState] = useState<"ready" | "running" | "done" | "stopped" | "failed">("ready");
  const [length, setLength] = useState(0);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (state !== "running") return;
    const timer = window.setTimeout(() => {
      if (attempt === 1 && /\bmissing\b/i.test(request)) {
        setState("failed");
        return;
      }
      if (length >= reply.length) setState("done");
      else setLength(Math.min(reply.length, length + 10));
    }, 115);
    return () => window.clearTimeout(timer);
  }, [state, length, attempt, request]);

  function start(value: string, retry = false) {
    if (!value.trim() || state === "running") return;
    setRequest(value.trim());
    setDraft("");
    setLength(0);
    setAttempt(retry ? 2 : 1);
    setState("running");
  }

  return <section className="workflow-conversation">
    <div className="workflow-thread">
      {request ? <p className="workflow-request">{request}</p>
        : <div className="workflow-empty"><h2>What needs a second look?</h2>
          <p>Ask for a review, a summary, or the next step in a handoff.</p>
          <Button size="compact" emphasis="soft" onClick={() => setDraft("Review the release brief for handoff.")}>Review the release brief</Button></div>}
      {request && state !== "stopped" && <TaskList label="Review the release brief" tasks={[
        { id: "read", label: "Read the brief", detail: "Revision 7", state: "done" },
        { id: "review", label: "Check the handoff", state: state === "done" ? "done" : state === "failed" ? "failed" : "running" },
      ]} />}
      {length > 0 && <StreamingReply value={reply.slice(0, length)} active={state === "running"} />}
      {state === "failed" && <div className="workflow-recovery"><Status tone="danger">Could not load the supporting notes.</Status>
        <Button emphasis="soft" size="compact" onClick={() => start(request, true)}>Retry</Button></div>}
      {state === "stopped" && <Status>Request stopped.</Status>}
    </div>
    <PromptBox value={draft} onChange={setDraft} onSubmit={() => start(draft)} busy={state === "running"} onCancel={() => setState("stopped")} />
  </section>;
}

function DecisionWorkflow() {
  const [outcome, setOutcome] = useState("");
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return <div className="workflow-decision">
    <section className="workflow-decision-main">
      <span className="workflow-kicker">Release review · Revision 7</span>
      <h2>Return the brief for revision?</h2>
      <p>Returning the brief asks the owner to assign both outstanding items before the handoff resumes.</p>
      <DecisionReview title="Decision details" facts={[
        { id: "owner", label: "Owner", value: "Kai" },
        { id: "scope", label: "Outstanding items", value: "2" },
      ]} observation={observation} decision={{
        id: "release", revision: "7", title: "Return the brief for revision?",
        consequence: "Kai will receive the brief with both open items.",
        confirmLabel: "Return for revision", available: !outcome,
      }} result={outcome} pending={pending} onConfirm={() => {
        if (pending || outcome || timer.current !== undefined) return;
        setPending(true);
        timer.current = window.setTimeout(() => {
          timer.current = undefined;
          setPending(false);
          if (failed) setOutcome("Brief returned to Kai. The handoff is paused.");
          else setFailed(true);
        }, 425);
      }} />
      {failed && !outcome && !pending && <Status tone="danger">Could not return the brief. Try again.</Status>}
    </section>
    <aside className="workflow-evidence" aria-label="Evidence">
      <h3>Open items</h3>
      <ol><li>Assign an owner for release notes.</li><li>Confirm who signs off the handoff.</li></ol>
    </aside>
  </div>;
}

function readFlow() {
  return flows.find(({ id }) => location.hash === "#" + id) ?? flows[0];
}

function Workflows() {
  const [flow, setFlow] = useState(readFlow);
  const [dark, setDark] = useState(() => matchMedia("(prefers-color-scheme: dark)").matches);
  useEffect(() => {
    const onHash = () => setFlow(readFlow());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return <Yogurt appearance={dark ? "dark" : "light"} className="workflow-root">
    <header className="workflow-header">
      <a className="workflow-identity" href={sectionHref("components")}><ProjectMark project="openboa" size={26} />Yogurt</a>
      <nav aria-label="Guide"><a href={sectionHref("components")}>Components</a><a href={sectionHref("motion")}>Motion</a></nav>
      <IconButton icon={dark ? "sun" : "moon"} label={dark ? "Use light appearance" : "Use dark appearance"} onClick={() => setDark(!dark)} />
    </header>
    <main className="workflow-body">
      <SidebarLayout label="Workflows" width="12rem" compactAt={760} variant="flat" navigation={
        <SidebarContent label="Workflows"><SidebarGroup label="Workflows">
          {flows.map((item) => <SidebarItem key={item.id} href={"#" + item.id}
            active={item.id === flow.id} label={item.label} icon={<Icon name={item.icon} />} />)}
        </SidebarGroup></SidebarContent>
      }>
        <div className="workflow-page-title"><SidebarTrigger /><h1>{flow.label}</h1></div>
        <div className="workflow-preview" key={flow.id}>
          {flow.id === "records" ? <RecordsWorkflow /> : flow.id === "request" ? <RequestWorkflow /> : <DecisionWorkflow />}
        </div>
        <nav className="workflow-parts" aria-label="Components used">
          {flow.components.map(([id, label]) => <a key={id} href={id.includes("#") ? sectionHref("motion", id.split("#")[1]) : sectionHref("components", id)}>{label}</a>)}
        </nav>
      </SidebarLayout>
    </main>
  </Yogurt>;
}

const mount = document.querySelector("#yogurt-workflows");
if (mount) createRoot(mount).render(<Workflows />);
