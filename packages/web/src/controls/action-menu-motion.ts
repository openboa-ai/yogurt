import { advanceSprings, snap, spring } from "../foundation/spring-motion.js";

export function animateActionMenu(root: HTMLElement) {
  const options = root.querySelector<HTMLElement>(".yg-action-menu-options");
  if (!options) return () => {};
  const width = spring(150, 320, 26);
  const height = spring(0, 240, 22);
  const toggle = spring(0, 380, 24);
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const rowByNode = new Map<HTMLElement, {amount: ReturnType<typeof spring>; due: number}>();
  let open = false, frame = 0, previous = 0;
  let available = 0;
  let springs = [width, height, toggle];

  function paint() {
    root.style.setProperty("--yg-action-menu-width", `${width.position}px`);
    root.style.setProperty("--yg-action-menu-height", `${Math.max(0, height.position)}px`);
    root.style.setProperty("--yg-action-menu-toggle", String(Math.max(-.1, Math.min(1.1, toggle.position))));
    rowByNode.forEach(({amount}, row) => row.style.setProperty("--yg-action-menu-row", String(amount.position)));
  }

  function tick(now: number) {
    let waiting = false;
    rowByNode.forEach(row => {
      if (row.due === Infinity) return;
      if (now < row.due) waiting = true;
      else { row.due = Infinity; row.amount.target = Number(open); }
    });
    const moving = advanceSprings(springs, (now - previous) / 1000);
    previous = now;
    paint();
    frame = moving || waiting ? requestAnimationFrame(tick) : 0;
  }

  function sync() {
    if (!options) return;
    const next = root.dataset.open === "true";
    const buttons = Array.from(options.querySelectorAll("button"));
    const time = performance.now();
    rowByNode.forEach((_, node) => { if (!options.contains(node)) rowByNode.delete(node); });
    buttons.forEach((node, index) => {
      const existing = rowByNode.get(node);
      const row = existing ?? {amount: spring(0, 260, 22), due: Infinity};
      if (next !== open || (next && !existing)) {
        row.due = time + (next ? 80 + index * 50 : (buttons.length - 1 - index) * 30);
      }
      rowByNode.set(node, row);
    });
    open = next;
    available = root.parentElement?.clientWidth ?? 300;
    width.target = Math.min(available, open ? 300 : 150);
    height.target = open && buttons.length ? 4 + buttons.length * 48 + 10 : 0;
    toggle.target = Number(open);
    springs = [width, height, toggle, ...Array.from(rowByNode.values(), row => row.amount)];
    if (preference.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
      rowByNode.forEach(row => { row.due = Infinity; snap(row.amount, Number(open)); });
      springs.forEach(state => snap(state, state.target));
      paint();
    } else if (!frame) {
      previous = time;
      frame = requestAnimationFrame(tick);
    }
  }

  const changes = new MutationObserver(sync);
  const size = new ResizeObserver(() => {
    if (root.parentElement?.clientWidth !== available) sync();
  });
  changes.observe(root, {attributes: true, attributeFilter: ["data-open"], childList: true, subtree: true});
  if (root.parentElement) size.observe(root.parentElement);
  preference.addEventListener("change", sync);
  sync();
  return () => {
    changes.disconnect();
    size.disconnect();
    preference.removeEventListener("change", sync);
    cancelAnimationFrame(frame);
  };
}
