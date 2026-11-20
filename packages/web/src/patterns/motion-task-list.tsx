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
  return <>
    <span className="yg-task-marker" aria-hidden="true">
      {task.state === "done" ?
        <svg viewBox="0 0 24 24" fill="none"><path pathLength="1" d="M5 12.5l4.2 4.2L19 7" /></svg>
        : task.state === "failed" ? <Icon name="close" /> : <span />}
    </span>
    <span className="yg-task-copy">
      <strong>{task.label}</strong>
      {task.detail && <span className="yg-help">{task.detail}</span>}
    </span>
    <span className="yg-task-state">{stateName[task.state]}</span>
  </>;
}

export function TaskList({ label, tasks }: {label: string; tasks: TaskListItem[]}) {
  const complete = tasks.filter(task => task.state === "done").length;
  const active = tasks.find(task => task.state === "running")?.id;
  return (
    <section className="yg-task-list" aria-label={label}>
      <header><strong>{label}</strong><span role="status">{complete} of {tasks.length} done</span></header>
      {tasks.length > 0 ? (
        <div className="yg-task-progress" aria-hidden="true">
          {tasks.map(task => <span key={task.id} data-state={task.state} />)}
        </div>
      ) : <p className="yg-help">No steps yet.</p>}
      <ol>
        {tasks.map(task => (
          <li key={task.id} data-state={task.state} data-active={active === task.id || undefined}>
            {task.steps?.length ? (
              <details>
                <summary className="yg-task-line"><TaskLine task={task} /><Icon name="down" /></summary>
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
