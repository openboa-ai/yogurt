import { easing, rosterMax, tracks, transitionMs, type EyeMark, type MotionClip, type Transform } from "./avatar-pose-data.js";
import type { agentPresenceLabels } from "./agent-motion-data.js";
import type { AgentMotionFit } from "./agent-family-data.js";

type State = keyof typeof agentPresenceLabels;
type Agent = keyof typeof tracks;

const neutral: Transform = [0, 0, 0, 1, 1];
const parts = ["body", "left-eye", "right-eye"] as const;

const marks = ["round", "cross", "smile"] as const;

function showMark(mark: EyeMark) {
  return {
    "--yg-mark-round": mark === "round" ? "1" : "0",
    "--yg-mark-cross": mark === "cross" ? "1" : "0",
    "--yg-mark-smile": mark === "smile" ? "1" : "0",
  };
}

function markFrames(clip: MotionClip, previous: EyeMark) {
  const keys = [{ ...showMark(previous), offset: 0, easing: "steps(1, end)" }];
  if (previous !== "round") keys.push({
    ...showMark("round"), offset: transitionMs / clip.duration, easing: "steps(1, end)",
  });
  if (clip.mark !== "round") keys.push({
    ...showMark(clip.mark), offset: clip.markAt / clip.duration, easing: "steps(1, end)",
  });
  keys.push({ ...showMark(clip.mark), offset: 1, easing: "linear" });
  return keys;
}

function cssTransform([x, y, angle, width, height]: Transform) {
  return `translate(${x}px, ${y}px) rotate(${angle}deg) scale(${width}, ${height})`;
}

function shownTransform(node: SVGElement): Transform {
  const value = getComputedStyle(node).transform;
  if (value === "none") return neutral;
  const transform = new DOMMatrixReadOnly(value);
  const width = Math.hypot(transform.a, transform.b);
  if (!width) return [transform.e, transform.f, 0, 0, 0];
  const height = (transform.a * transform.d - transform.b * transform.c) / width;
  return [transform.e, transform.f, Math.atan2(transform.b, transform.a) * (180 / Math.PI), width, height];
}

function entryTarget(clip: MotionClip, part: number): Transform {
  const frames = clip.frames;
  const right = frames.findIndex(([ms]) => ms >= transitionMs);
  const [end, final] = frames[right];
  const [start, initial] = frames[right - 1];
  const progress = (transitionMs - start) / (end - start);
  const eased = progress * progress * (3 - 2 * progress);
  const a = initial[part];
  const b = final[part];
  return [
    a[0] + (b[0] - a[0]) * eased,
    a[1] + (b[1] - a[1]) * eased,
    a[2] + (b[2] - a[2]) * eased,
    a[3] + (b[3] - a[3]) * eased,
    a[4] + (b[4] - a[4]) * eased,
  ];
}

export function bindAvatarPlayback(root: SVGSVGElement, agent: Agent, size: number, fit?: AgentMotionFit) {
  const body = root.querySelector<SVGGElement>(".yg-avatar-body");
  const face = root.querySelector<SVGGElement>(".yg-eyes");
  const [left, right] = root.querySelectorAll<SVGGElement>(".yg-eye");
  if (!body || !face || !left || !right) return;
  const eyeGroup = face;
  const nodes = [body, left, right] as const;
  const profile = tracks[agent][size <= rosterMax ? "roster" : "detail"];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const doc = root.ownerDocument;
  let onScreen = typeof IntersectionObserver === "undefined";
  let requested: State = "ready";
  let enabled = false;
  let shown: State | undefined;
  let held = false;
  let running: Animation[] = [];
  let stillState: State | undefined;

  function fitTransform(transform: Transform, part: number): Transform {
    if (!fit) return transform;
    const [x, y, angle, width, height] = transform;
    const [slide, lift, tilt, gazeX, gazeY] = fit;
    return part === 0
      ? [x * slide, y * lift, angle * tilt, width, height]
      : [x * gazeX, y * gazeY, angle, width, height];
  }

  function showStill(state?: State) {
    if (stillState === state) return;
    const clip: MotionClip | undefined = state ? profile[state] : undefined;
    nodes.forEach((node, index) => {
      if (clip) node.style.transform = cssTransform(fitTransform(clip.frames[clip.still][1][index], index));
      else node.style.removeProperty("transform");
    });
    for (const [name, value] of Object.entries(showMark(clip?.mark ?? "round"))) {
      if (clip) eyeGroup.style.setProperty(name, value);
      else eyeGroup.style.removeProperty(name);
    }
    stillState = state;
  }

  function clear() {
    for (const animation of running) animation.cancel();
    running = [];
    shown = undefined;
    held = false;
  }

  function refresh() {
    if (!enabled || root.closest(".yg-message")) {
      clear();
      showStill();
      return;
    }
    if (reduced.matches || typeof body?.animate !== "function") {
      clear();
      showStill(requested);
      return;
    }
    showStill();
    if (!onScreen || doc.hidden) {
      for (const animation of running)
        if (animation.playState === "running" || animation.pending) animation.pause();
      held = running.length > 0;
      return;
    }
    if (shown === requested) {
      if (held) for (const animation of running)
        if (animation.playState === "paused") animation.play();
      held = false;
      return;
    }

    const previous = running.length ? nodes.map(shownTransform) : null;
    const visible = getComputedStyle(eyeGroup);
    const previousMark = marks.find(mark => visible.getPropertyValue("--yg-mark-" + mark).trim() === "1") ?? "round";
    clear();
    const clip: MotionClip = profile[requested];
    const start = doc.timeline.currentTime;
    const synchronize = (animation: Animation, id: string) => {
      animation.id = id;
      if (start !== null) animation.startTime = start;
      running.push(animation);
    };
    nodes.forEach((node, index) => {
      const keyframes = clip.frames.map(([time, pose]) => ({
        offset: time / clip.duration,
        transform: cssTransform(fitTransform(pose[index], index)),
        easing,
      }));
      synchronize(node.animate(keyframes, {
        duration: clip.duration, iterations: clip.loop ? Infinity : 1, fill: "both",
      }), "yg-avatar-" + parts[index]);
      if (previous) synchronize(node.animate([
        { transform: cssTransform(previous[index]), easing },
        { transform: cssTransform(fitTransform(entryTarget(clip, index), index)) },
      ], { duration: transitionMs }), "yg-avatar-entry");
    });
    if (clip.mark !== "round" || previousMark !== "round") {
      synchronize(eyeGroup.animate(markFrames(clip, previousMark), {
        duration: clip.duration, fill: "both",
      }), "yg-avatar-mark");
    }
    shown = requested;
  }

  const observer = typeof IntersectionObserver === "undefined" ? undefined :
    new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; refresh(); });
  observer?.observe(root);
  reduced.addEventListener("change", refresh);
  doc.addEventListener("visibilitychange", refresh);

  return {
    update(state: State, animated: boolean) {
      requested = state;
      enabled = animated;
      refresh();
    },
    dispose() {
      observer?.disconnect();
      reduced.removeEventListener("change", refresh);
      doc.removeEventListener("visibilitychange", refresh);
      clear();
      showStill();
    },
  };
}
