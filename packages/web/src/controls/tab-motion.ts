import { advanceSprings, snap, spring } from "../foundation/spring-motion.js";

export function animateTabMarker(marker: HTMLElement, group: HTMLElement, profile: "pill" | "dock") {
  const dock = profile === "dock";
  const left = spring(0, dock ? 340 : 620, dock ? 28 : 40);
  const edge = spring(0, dock ? 340 : 170, dock ? 28 : 19);
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  const tabs = new Map<HTMLButtonElement, {
    label: HTMLElement; w: ReturnType<typeof spring>; scale: ReturnType<typeof spring>; full: number;
  }>();
  let active: HTMLButtonElement | null = null;
  let frame = 0, last = 0, y = 0;
  let motion = [left, edge];

  function measure() {
    if (!active) return;
    left.target = active.offsetLeft;
    edge.target = (dock ? 0 : active.offsetLeft) + active.offsetWidth;
    y = active.offsetTop;
    marker.style.setProperty("--yg-selection-height", `${active.offsetHeight}px`);
    marker.style.setProperty("--yg-selection-y", `${y}px`);
  }
  function paintLabels() {
    tabs.forEach(({label, w, scale, full}, button) => {
      const fraction = Math.min(1, Math.max(0, w.position / Math.max(1, full)));
      label.style.setProperty("--yg-dock-label-width", `${Math.max(0, w.position)}px`);
      label.style.setProperty("--yg-dock-label-inset", `${8 * fraction}px`);
      label.style.setProperty("--yg-dock-label-opacity", String(Math.min(1, Math.max(0, fraction * 1.4 - .4))));
      button.style.setProperty("--yg-dock-icon-scale", String(scale.position));
    });
  }
  function paintMarker() {
    marker.style.setProperty("--yg-selection-x", `${left.position}px`);
    const width = dock ? edge.position : edge.position - left.position;
    marker.style.setProperty("--yg-selection-width", `${Math.max(0, width)}px`);
  }
  function tick(now: number) {
    const elapsed = (now - last) / 1000;
    last = now;
    let other = false;
    if (dock) {
      other = advanceSprings(motion, elapsed);
      paintLabels();
      measure();
    }
    const moving = advanceSprings([left, edge], elapsed);
    paintMarker();
    frame = moving || other ? requestAnimationFrame(tick) : 0;
  }
  function refresh() {
    const next = group.querySelector<HTMLButtonElement>(':scope > button[aria-selected="true"]');
    if (!next || !next.offsetWidth) {
      active = null;
      marker.removeAttribute("data-ready");
      return;
    }
    const last = active;
    const changed = next !== last;
    if (dock) {
      tabs.forEach((_, button) => { if (!group.contains(button)) tabs.delete(button); });
      group.querySelectorAll<HTMLButtonElement>(":scope > button").forEach(button => {
        const label = button.querySelector<HTMLElement>(".yg-tab-label");
        const copy = label?.firstElementChild;
        if (!label || !copy) return;
        const tab = tabs.get(button) ?? {label, w:spring(0,300,26), scale:spring(1,520,14), full:0};
        tab.full = copy.getBoundingClientRect().width + 8;
        tab.w.target = button === next ? tab.full : 0;
        if (!last || media.matches) snap(tab.w, tab.w.target);
        if (changed && button === next && !media.matches) {
          tab.scale.position = .72;
          tab.scale.velocity = 6;
        }
        if (media.matches) snap(tab.scale, 1);
        tabs.set(button, tab);
      });
      motion = [...tabs.values()].flatMap(tab => [tab.w, tab.scale]);
      paintLabels();
    }
    const previousRow = y;
    const direction = next.offsetLeft >= left.target;
    active = next;
    measure();
    if (!dock && changed) {
      const lead = direction ? edge : left, trail = direction ? left : edge;
      lead.stiffness = 620; lead.damping = 40;
      trail.stiffness = 170; trail.damping = 19;
    }
    if (media.matches || !last || previousRow !== y) {
      snap(left,left.target); snap(edge,edge.target);
      paintMarker();
    }
    marker.setAttribute("data-ready","");
    marker.toggleAttribute("data-direct-motion", dock);
    if (media.matches) {
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
  refresh();
  return () => {
    cancelAnimationFrame(frame);
    mutations.disconnect(); size.disconnect(); media.removeEventListener("change",refresh);
    marker.removeAttribute("data-direct-motion");
  };
}
