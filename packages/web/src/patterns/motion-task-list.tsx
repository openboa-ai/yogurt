"use client";

import { Icon } from "../foundation/foundation.js";

type TaskState = "queued" | "running" | "done" | "failed";
interface TaskStep {
  id: string;
  label: string;
  state: TaskState;
  detail?: string;
}
export interface TaskListItem extends TaskStep {
  steps?: TaskStep[];
}

const stateName = {
  queued: "Queued",
  running: "Running",
  done: "Done",
  failed: "Failed",
};

function TaskLine({ task }: { task: TaskStep }) {
  const showState = task.state === "failed";
  return <>
    <span className="yg-task-marker" aria-hidden="true">
      {task.state === "done" ?
        <svg viewBox="0 0 24 24" fill="none"><path pathLength="1" d="M5 12.5l4.2 4.2L19 7" /></svg>
        : task.state === "failed" ? <Icon name="close" /> : null}
    </span>
    <span className="yg-task-copy"><strong>{task.label}</strong></span>
    <span className="yg-task-meta">
      {task.detail && !showState && <span className="yg-task-note">{task.detail}</span>}
      <span className={showState ? "yg-task-state" : "yg-task-sr"}>{stateName[task.state]}</span>
    </span>
  </>;
}

export function TaskList({ label, tasks }: {label: string; tasks: TaskListItem[]}) {
  const complete = tasks.filter(task => task.state === "done").length;
  const active = tasks.find(task => task.state === "running")?.id;
  return (
    <section className="yg-task-list" aria-label={label}>
      <header><strong>{label}</strong><span role="status"><span className="yg-task-sr">{complete} of {tasks.length} done</span><span aria-hidden="true">{complete}/{tasks.length}</span></span></header>
      {tasks.length === 0 && <p className="yg-help">No steps yet.</p>}
      <ol>
        {tasks.map(task => (
          <li key={task.id} data-state={task.state} data-active={active === task.id || undefined}>
            {task.steps?.length ? (
              <details open>
                <summary className="yg-task-line"><TaskLine task={task} /></summary>
                <ol className="yg-task-children">
                  {task.steps.map(step => (
                    <li key={step.id} data-state={step.state} className="yg-task-line"><TaskLine task={step} /></li>
                  ))}
                </ol>
              </details>
            ) : <div className="yg-task-line"><TaskLine task={task} /></div>}
          </li>
        ))}
      </ol>
    </section>
  );
}
