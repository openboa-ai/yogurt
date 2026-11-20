import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { Button, Toast } from "@openboa/yogurt";
import { playSprings, snap, spring } from "../../../packages/web/src/foundation/spring-motion.js";

type Notice = {id: number; message: string};
type Sample = {time: number; x: number};

function NotificationCard({ item, depth, expanded, onDismiss }: {
  item: Notice; depth: number; expanded: boolean; onDismiss: () => void;
}) {
  const card = useRef<HTMLDivElement>(null);
  const [motion] = useState(() => spring(0, 520, 2 * Math.sqrt(520)));
  const stop = useRef<(() => void) | undefined>(undefined);
  const active = useRef<{id: number; x: number; y: number; start: number; axis?: "x" | "y"; samples: Sample[]} | null>(null);
  const leaving = useRef(false);
  const exposed = expanded || depth === 0;
  useEffect(() => () => stop.current?.(), []);
  function paint(x: number) {
    const node = card.current;
    if (!node) return;
    node.style.translate = `${x}px 0`;
    node.style.opacity = String(Math.max(.3, 1 - Math.abs(x) / 240));
  }
  function dismiss(direction: number, velocity = 0) {
    if (leaving.current) return;
    leaving.current = true;
    stop.current?.();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onDismiss();
      return;
    }
    const node = card.current;
    const start = globalThis.performance.now();
    const origin = motion.position;
    const speed = Math.max(1400, Math.abs(velocity) * 1000);
    const exit = (node?.offsetWidth ?? 320) + 20;
    let frame = requestAnimationFrame(fly);
    stop.current = () => cancelAnimationFrame(frame);
    function fly(time: number) {
      const elapsed = (time - start) / 1000;
      const distance = speed * elapsed + 2100 * elapsed ** 2;
      const x = origin + direction * distance;
      paint(x);
      if (node) node.style.opacity = String(Math.max(0, 1 - Math.abs(x) / exit));
      if (Math.abs(x) >= exit) onDismiss();
      else frame = requestAnimationFrame(fly);
    }
  }
  function release(event: PointerEvent<HTMLDivElement>) {
    const gesture = active.current;
    if (gesture?.id !== event.pointerId) return;
    active.current = null;
    if (gesture.axis !== "x") return;
    const first = gesture.samples[0], last = gesture.samples.at(-1) ?? first;
    const elapsed = last.time - first.time;
    const velocity = elapsed > 0 && event.timeStamp - last.time <= 80 ? (last.x - first.x) / elapsed : 0;
    const x = motion.position;
    if (event.type === "pointerup" && (Math.abs(x) > 100 || Math.abs(velocity) > .11 && Math.sign(x) === Math.sign(velocity))) {
      dismiss(Math.sign(x), velocity);
      return;
    }
    motion.target = 0;
    motion.velocity = velocity * 1000;
    stop.current = playSprings([motion], () => paint(motion.position));
  }
  return <li className="motion-notice-slot" style={{"--notice-depth": depth} as CSSProperties}
    inert={!exposed} aria-hidden={!exposed}>
    <div ref={card} className="motion-notice-card" onPointerDown={event => {
      if (!exposed || leaving.current || active.current || !event.isPrimary || event.button !== 0
        || (event.target instanceof Element && event.target.closest("button"))) return;
      stop.current?.();
      active.current = {id: event.pointerId, x: event.clientX, y: event.clientY, start: motion.position,
        samples: [{time: event.timeStamp, x: motion.position}]};
    }} onPointerMove={event => {
      const gesture = active.current;
      if (gesture?.id !== event.pointerId) return;
      const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
      if (!gesture.axis && Math.max(Math.abs(dx), Math.abs(dy)) >= 6) {
        gesture.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        if (gesture.axis === "x") event.currentTarget.setPointerCapture(event.pointerId);
      }
      if (gesture.axis !== "x") return;
      snap(motion, gesture.start + dx);
      paint(motion.position);
      gesture.samples.push({time: event.timeStamp, x: motion.position});
      while (gesture.samples.length > 2 && event.timeStamp - gesture.samples[0].time > 80) gesture.samples.shift();
    }} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}
      onPointerLeave={event => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) release(event);
      }}>
      <Toast message={item.message} onDismiss={() => dismiss(1)} />
    </div>
  </li>;
}

export function NotificationStackExample() {
  const [items, setItems] = useState<Notice[]>([]);
  const [expanded, setExpanded] = useState(false);
  const count = useRef(0);
  function add() {
    count.current += 1;
    const id = count.current;
    setItems(current => [{id, message: `Update ${id} received.`}, ...current].slice(0, 3));
  }
  return <div className="motion-sample-stack motion-notice-example">
    <div className="motion-notice-actions">
      <Button size="compact" emphasis="soft" onClick={add}>Add notification</Button>
      {items.length > 1 && <Button size="compact" emphasis="quiet" aria-expanded={expanded}
        onClick={() => setExpanded(value => !value)}>{expanded ? "Show fewer" : "Show all"}</Button>}
    </div>
    {items.length > 0 && <ol className="motion-notice-stack" aria-label="Recent notifications" data-expanded={expanded}
      style={{"--notice-count": items.length} as CSSProperties}>
      {items.map((item, depth) => <NotificationCard key={item.id} item={item} depth={depth} expanded={expanded}
        onDismiss={() => setItems(current => current.filter(notice => notice.id !== item.id))} />)}
    </ol>}
  </div>;
}
