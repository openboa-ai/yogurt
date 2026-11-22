"use client";
import { words } from "../foundation/words.js";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { marks, agents } from "./art-data.js";
import { agentColors, agentShapes, agentVariants, type AgentColor, type AgentVariant } from "./agent-family-data.js";
import { eyeMarks } from "./avatar-pose-data.js";
import { bindAvatarPlayback } from "./avatar-playback.js";
import { agentPresenceLabels, loopingGazes } from "./agent-motion-data.js";
import { Heading, Inline, type Size } from "../foundation/foundation.js";
export type Project = keyof typeof marks;
export function getAgentFamily() {
  return { colors: agentColors, shapes: agentShapes, variants: agentVariants };
}
export type { AgentColor, AgentVariant };
export function ProjectMark({
  project,
  label,
  size = 32,
}: {
  project: Project;
  label?: string;
  size?: number;
}) {
  return (
    <img
      width={size}
      height={size}
      className="yg-mark"
      src={marks[project]}
      alt={label ?? project}
      draggable={false}
    />
  );
}
export type GazeState = keyof typeof agentPresenceLabels;
export function Gaze({
  state = "ready",
  animated = true,
  x = 51,
  y = 50,
}: {
  state?: GazeState;
  animated?: boolean;
  x?: number;
  y?: number;
}) {
  const eyes = useRef<SVGGElement>(null);
  useEffect(() => {
    const element = eyes.current;
    const avatar = element?.ownerSVGElement;
    const loops = loopingGazes.some((gaze) => gaze === state);
    if (!animated || !loops || !element || !avatar || !globalThis.IntersectionObserver) {
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      element.toggleAttribute("data-offscreen", !entry.isIntersecting);
    });
    observer.observe(avatar);
    return () => {
      observer.disconnect();
      element.removeAttribute("data-offscreen");
    };
  }, [animated, state]);
  return (
    <g
      ref={eyes}
      className="yg-eyes"
      data-gaze={state}
      data-static={!animated || undefined}
      fill="var(--boa-color-gray-green-950)"
    >
      <circle className="yg-eye" cx={x - 13} cy={y} r="2.45" />
      <circle className="yg-eye" cx={x + 13} cy={y} r="2.45" />
    </g>
  );
}
export function AgentAvatar({
  agent,
  state = "ready",
  animated = true,
  size = 48,
  label,
  color,
}: {
  agent: keyof typeof agents | AgentVariant;
  state?: GazeState;
  animated?: boolean;
  size?: number;
  label?: string;
  color?: AgentColor;
}) {
  const variant = agent === "Kai" || agent === "Sol" ? undefined : agentVariants[agent];
  const shape = variant ? agentShapes[variant.shape] : undefined;
  const art = variant && shape ? {
    path: variant.path,
    fill: agentColors[shape.color],
    x: shape.center[0],
    y: shape.center[1],
  } : agents[agent as keyof typeof agents];
  const profile = shape?.motion ?? (agent === "Sol" ? "sol" : "kai");
  const fit = shape?.fit;
  const root = useRef<SVGSVGElement>(null);
  const playback = useRef<ReturnType<typeof bindAvatarPlayback>>(undefined);
  useLayoutEffect(() => {
    if (!root.current) return;
    const binding = bindAvatarPlayback(root.current, profile, size, fit);
    playback.current = binding;
    return () => { binding?.dispose(); playback.current = undefined; };
  }, [agent, profile, size, fit]);
  useLayoutEffect(() => { playback.current?.update(state, animated); }, [agent, size, state, animated]);
  return (
    <svg
      width={size}
      height={size}
      viewBox="-8 -5 116 116"
      role={label === "" ? undefined : "img"}
      aria-hidden={label === "" || undefined}
      aria-label={label === "" ? undefined : label ?? (shape?.name ?? agent) + " · " + agentPresenceLabels[state]}
      className="yg-agent-avatar"
      ref={root}
    >
      <g className="yg-avatar-body">
        <path d={art.path} fill={color ? agentColors[color] : art.fill} />
        <g className="yg-eyes" data-gaze={state} data-static fill="var(--boa-color-gray-green-950)">
          {[-13, 13].map(offset => (
            <g key={offset} transform={`translate(${art.x + offset} ${art.y})`}>
              <g className="yg-eye">
                <circle className="yg-eye-round" r="2.45" />
                <path className="yg-eye-cross" d={eyeMarks.cross} transform="scale(2.45)" />
                <path className="yg-eye-smile" d={eyeMarks.smile} transform="scale(2.45)" />
              </g>
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}
export function Activity({
  state,
  agent,
}: {
  state: "ready" | "working" | "interrupted" | "done";
  agent: string;
}) {
  return (
    <span role="status" className="yg-activity">
      {state === "working" && (
        <span aria-hidden="true" className="yg-status-dot" />
      )}
      {agent}{" "}
      {
        {
          ready: "is ready.",
          working: "is working.",
          interrupted: "was interrupted.",
          done: "finished.",
        }[state]
      }
    </span>
  );
}
export function Message({
  speaker,
  children,
  avatar,
  time,
  dateTime,
  variant,
  actions,
}: {
  speaker: string;
  children: ReactNode;
  avatar?: ReactNode;
  time?: string;
  dateTime?: string;
  variant?: "sent" | "received";
  actions?: ReactNode;
}) {
  return (
    <article className="yg-message" data-variant={variant}>
      <Inline gap={8}>
        {avatar}
        <strong>{speaker}</strong>
        {time && (
          <time className="yg-meta" dateTime={dateTime}>
            {time}
          </time>
        )}
      </Inline>
      <div className="yg-message-body">{variant ? <div className="yg-message-content">{children}</div> : children}
        {actions && <div className="yg-message-actions">{actions}</div>}
      </div>
    </article>
  );
}
export function ReadingAnchor({
  onClick,
  children = words["action.jump-latest"],
}: {
  onClick: () => void;
  children?: ReactNode;
}) {
  return (
    <button type="button" className="yg-reading-anchor" onClick={onClick}>
      {children}
    </button>
  );
}
export function Transcript({
  label,
  children,
  revision,
  readingAnchor = "always",
}: {
  label: string;
  children: ReactNode;
  revision: string | number;
  readingAnchor?: "always" | "when-away";
}) {
  const box = useRef<HTMLDivElement>(null);
  const follow = useRef(true);
  const [away, setAway] = useState(false);
  function trackScroll(el: HTMLDivElement) {
    follow.current = el.scrollHeight - el.clientHeight - el.scrollTop < 8;
    if (readingAnchor === "when-away") setAway(!follow.current);
  }
  function latest() {
    const el = box.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
      follow.current = true;
      setAway(false);
    }
  }
  useLayoutEffect(() => {
    if (follow.current) latest();
  }, [revision]);
  return (
    <div className="yg-transcript">
      <div
        ref={box}
        className="yg-scroll"
        tabIndex={0}
        role="region"
        aria-label={label}
        onScroll={event => trackScroll(event.currentTarget)}
      >
        {children}
      </div>
      {(readingAnchor === "always" || away) && <ReadingAnchor onClick={() => {
        latest();
        if (readingAnchor === "when-away") box.current?.focus({ preventScroll: true });
      }} />}
    </div>
  );
}
