import { advanceSprings, snap, spring } from "../foundation/spring-motion.js";

export function animateTabMarker(marker: HTMLElement, group: HTMLElement, profile: "underline" | "pill" | "dock") {
  const dock = profile === "dock";
  const left = spring(0, dock ? 340 : 620, dock ? 28 : 40);
  const edge = spring(0, dock ? 340 : 170, dock ? 28 : 19);
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  let active: HTMLButtonElement | null = null;
  let observedTab: HTMLButtonElement | null = null;
  let frame = 0, last = 0, y = 0, disposed = false;

  function measure() {
    if (!active) return;
    left.target = active.offsetLeft;
    edge.target = active.offsetLeft + active.offsetWidth;
    y = active.offsetTop;
    marker.style.setProperty("--yg-selection-height", `${active.offsetHeight}px`);
    marker.style.setProperty("--yg-selection-y", `${y}px`);
  }
  function paintMarker() {
    marker.style.setProperty("--yg-selection-x", `${left.position}px`);
    const width = edge.position - left.position;
    marker.style.setProperty("--yg-selection-width", `${Math.max(0, width)}px`);
  }
  function tick(now: number) {
    const elapsed = (now - last) / 1000;
    last = now;
    const moving = advanceSprings([left, edge], elapsed);
    paintMarker();
    frame = moving ? requestAnimationFrame(tick) : 0;
  }
  function refresh() {
    if (disposed) return;
    const next = group.querySelector<HTMLButtonElement>(':scope > button[aria-selected="true"]');
    if (!next || !next.offsetWidth) {
      active = null;
      if (observedTab) { size.unobserve(observedTab); observedTab = null; }
      marker.removeAttribute("data-ready");
      return;
    }
    const prev = active;
    const changed = next !== prev;
    const previousRow = y;
    const direction = next.offsetLeft >= left.target;
    active = next;
    if (observedTab !== next) {
      if (observedTab) size.unobserve(observedTab);
      size.observe(next);
      observedTab = next;
    }
    measure();
    if (!dock && changed) {
      const lead = direction ? edge : left, trail = direction ? left : edge;
      lead.stiffness = 620; lead.damping = 40;
      trail.stiffness = 170; trail.damping = 19;
    }
    if (media.matches || !prev || !changed || previousRow !== y) {
      snap(left,left.target); snap(edge,edge.target);
      paintMarker();
    }
    marker.setAttribute("data-ready","");
    if (media.matches || !changed) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else if (!frame) {
      lastFrame();
    }
  }
  function lastFrame() { last = performance.now(); frame = requestAnimationFrame(tick); }

  const mutations = new MutationObserver(refresh);
  mutations.observe(group,{childList:true,subtree:true,attributes:true,attributeFilter:["aria-selected","dir"]});
  const size = new ResizeObserver(refresh);
  size.observe(group);
  media.addEventListener("change",refresh);
  group.ownerDocument.fonts?.ready.then(refresh);
  refresh();
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    mutations.disconnect(); size.disconnect(); media.removeEventListener("change",refresh);
  };
}
