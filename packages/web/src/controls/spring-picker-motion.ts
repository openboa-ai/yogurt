import { advanceSprings, snap, spring } from "../foundation/spring-motion.js";

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

type Row = {
  element: HTMLElement;
  path: SVGPathElement | null;
  amount: ReturnType<typeof spring>;
  check: ReturnType<typeof spring>;
  due: number;
};

export function animateSpringPicker(root: HTMLElement) {
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const height = spring(0, 300, 23);
  const chevron = spring(0, 300, 18), alpha = spring(0, 400, 34);
  const press = spring(1, 500, 18), roll = spring(1, 340, 26);
  const top = spring(6, 620, 36), bottom = spring(50, 620, 36), highlightAlpha = spring(0, 400, 32);
  const springs = [height, chevron, alpha, press, roll, top, bottom, highlightAlpha];
  let menu: HTMLElement | null = null;
  let marker: HTMLElement | null = null;
  let rows: Row[] = [], runningSprings = springs;
  let active = -1, maxHeight = 0;
  let open = false, now = 0, frame = 0, value = root.dataset.value;

  function paint() {
    const fraction = maxHeight > 0 ? height.position / maxHeight : 0;
    root.style.setProperty("--yg-picker-chevron-now", `${chevron.position * 180}deg`);
    root.style.setProperty("--yg-picker-press-now", String(press.position));
    root.style.setProperty("--yg-picker-roll-in", String(roll.position));
    if (!menu) return;
    menu.style.setProperty("--yg-picker-open", String(clamp(fraction, 0, 1.06)));
    menu.style.setProperty("--yg-picker-opacity", String(clamp(alpha.position)));
    rows.forEach(({element, path, amount, check}) => {
      element.style.setProperty("--yg-picker-row", String(amount.position));
      if (path) path.style.strokeDashoffset = `${22 * (1 - clamp(check.position))}px`;
    });
    if (!marker) return;
    const y = clamp(Math.min(top.position, bottom.position - 16), 6, Math.max(6, maxHeight - 22));
    const end = clamp(bottom.position, y + 16, Math.max(y + 16, maxHeight - 6));
    marker.style.setProperty("--yg-spring-active-y", `${y}px`);
    marker.style.setProperty("--yg-spring-active-height", `${end - y}px`);
    marker.style.setProperty("--yg-spring-opacity", String(clamp(highlightAlpha.position)));
  }

  function tick(timestamp: number) {
    frame = 0;
    const elapsed = now ? (timestamp - now) / 1000 : 0;
    now = timestamp;
    let waiting = false;
    rows.forEach(row => {
      if (row.due === Infinity) return;
      if (timestamp < row.due) waiting = true;
      else {
        row.amount.target = Number(open);
        row.due = Infinity;
      }
    });
    const moving = advanceSprings(runningSprings, elapsed);
    paint();
    if (waiting || moving) frame = requestAnimationFrame(tick);
    else now = 0;
  }

  function play() {
    if (preference.matches || frame) return;
    now = performance.now();
    frame = requestAnimationFrame(tick);
  }

  function highlight(index: number, immediately: boolean) {
    const row = rows[index]?.element;
    if (!row || (index === active && !immediately)) return;
    const y = row.offsetTop, end = y + row.offsetHeight;
    if (immediately || active < 0) {
      snap(top, y); snap(bottom, end);
    } else {
      const leading = index > active ? bottom : top;
      const trailing = index > active ? top : bottom;
      leading.stiffness = 620; leading.damping = 36;
      trailing.stiffness = 200; trailing.damping = 20;
      top.target = y; bottom.target = end;
    }
    active = index;
    highlightAlpha.target = 1;
    marker?.setAttribute("data-ready", "");
  }

  function update() {
    const list = root.querySelector<HTMLElement>(".yg-spring-menu");
    const next = root.dataset.open === "true";
    let selected = -1;
    if (list !== menu) {
      if (menu) size.unobserve(menu);
      menu = list;
      if (menu) size.observe(menu);
      marker = list?.querySelector<HTMLElement>(".yg-spring-highlight") ?? null;
      active = -1;
    }
    if (list) {
      const elements = Array.from(list.querySelectorAll<HTMLElement>(".yg-spring-option"));
      const oldRows = new Map(rows.map(row => [row.element, row]));
      selected = elements.findIndex(row => row.hasAttribute("data-selected"));
      rows = elements.map((element, index) => {
        const existing = oldRows.get(element);
        const checked = Number(index === selected);
        const row = existing ?? {element, path: element.querySelector<SVGPathElement>(".yg-spring-check path"),
          amount: spring(open && !next ? 1 : 0, 300, 24),
          check: spring(checked, 260, 26), due: next ? performance.now() + 50 + index * 45 : Infinity};
        row.check.target = checked;
        return row;
      });
      maxHeight = list.offsetHeight;
    } else {
      rows = [];
    }
    runningSprings = [...springs, ...rows.flatMap(row => [row.amount, row.check])];

    if (value !== root.dataset.value) {
      value = root.dataset.value;
      snap(roll, 0);
      roll.target = 1;
    }
    if (next !== open) {
      open = next;
      const time = performance.now();
      rows.forEach((row, index) => {
        row.due = time + (open ? 50 + index * 45 : (rows.length - 1 - index) * 20);
      });
      if (open) highlight(Math.max(0, selected), true);
      else { active = -1; highlightAlpha.target = 0; }
    }

    const shown = open && !!list;
    height.target = shown ? maxHeight : 0;
    alpha.target = chevron.target = Number(shown);
    if (shown) {
      const hovered = rows.findIndex(row => row.element.hasAttribute("data-highlighted"));
      highlight(hovered >= 0 ? hovered : active >= 0 ? active : Math.max(0, selected), active < 0);
    }
    if (preference.matches) {
      cancelAnimationFrame(frame);
      frame = now = 0;
      springs.forEach(s => snap(s, s.target));
      rows.forEach(row => { snap(row.amount, Number(open)); snap(row.check, row.check.target); });
    }
    paint();
    play();
  }

  const changes = new MutationObserver(update);
  const size = new ResizeObserver(update);
  changes.observe(root, {subtree: true, childList: true, attributes: true,
    attributeFilter: ["data-open", "data-value", "data-side", "data-selected", "data-highlighted"]});
  preference.addEventListener("change", update);
  update();

  return {
    press(scale: number) {
      if (preference.matches) return;
      press.position = scale;
      paint();
      play();
    },
    dispose() {
      changes.disconnect();
      size.disconnect();
      preference.removeEventListener("change", update);
      cancelAnimationFrame(frame);
    },
  };
}
