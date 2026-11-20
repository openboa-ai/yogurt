import { useEffect, useLayoutEffect, useState, useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { Button, Checkbox } from "@openboa/yogurt";
import { ProfileCard } from "@openboa/yogurt/motion-patterns";
import { advanceSprings, playSprings, snap, spring } from "../../../packages/web/src/foundation/spring-motion.js";

type Example = { id: string; title: string; body: ReactNode };
const notes = [{ title: "Review kit", value: "12 items", detail: "Workspace collection · 24 pages", tags: ["Planning", "Team"] }, { title: "Handoff", value: "8 items", detail: "Project collection · 12 pages", tags: ["Notes", "Review"] }, { title: "Launch", value: "16 items", detail: "Release collection · 18 pages", tags: ["Planning", "Ready"] }];
function Deck() {
  const [index, setIndex] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [flight, setFlight] = useState<{index: number; x: number; y: number; end: number; spin: number; vx: number; vy: number} | null>(null);
  const start = useRef<{id: number; x: number; y: number; lastX: number; lastY: number; time: number; vx: number; vy: number; spin: number} | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  useLayoutEffect(() => {
    const card = stage.current?.querySelector<HTMLElement>("[data-flight]");
    if (!flight || !card) return;
    const horizontal = spring(flight.x, 70, 17), vertical = spring(flight.y, 70, 17);
    horizontal.velocity = Math.sign(flight.end) * Math.max(Math.abs(flight.vx), 1500);
    horizontal.target = flight.end;
    vertical.target = flight.y + Math.max(-120, Math.min(120, flight.vy * .2));
    const axes = [horizontal, vertical];
    const start = performance.now();
    let last = start;
    function paint() {
      card?.style.setProperty("--flight-x", `${horizontal.position}px`);
      card?.style.setProperty("--flight-y", `${vertical.position}px`);
      card?.style.setProperty("--flight-spin", `${horizontal.position * .065 * (flight?.spin ?? 1)}deg`);
    }
    function simulate(now: number) {
      advanceSprings(axes, (now - last) / 1000);
      last = now;
      paint();
      if (now - start >= 420) setFlight(null);
      else frame = requestAnimationFrame(simulate);
    }
    paint();
    let frame = requestAnimationFrame(simulate);
    return () => cancelAnimationFrame(frame);
  }, [flight]);
  function release() { start.current = null; setDragging(false); setOffset({x: 0, y: 0}); }
  function advance(direction: number, x = 0, y = 0, spin = 1, vx = 0, vy = 0) {
    if (flight) return;
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFlight({index, x, y, end: direction * Math.max(innerWidth / 2 + 360, Math.abs(x) + 420), spin, vx, vy});
    }
    setIndex(i => (i + direction + notes.length) % notes.length);
    release();
  }
  return <div className="extra-deck"><div ref={stage} className="extra-deck-stage" aria-label="Review notes">
    {notes.map((note, item) => {
      const depth = (item - index + notes.length) % notes.length;
      const leaving = flight?.index === item ? flight : null;
      const interactive = depth === 0 && !flight;
      const {x, y} = leaving ?? (depth === 0 ? offset : {x: 0, y: 0});
      const spin = leaving?.spin ?? start.current?.spin ?? 1;
      return <article key={note.title} className="extra-deck-sheet" data-depth={depth}
        data-flight={Boolean(leaving) || undefined} data-dragging={interactive && dragging || undefined}
        aria-hidden={depth !== 0 || undefined}
        style={{
          "--deck-depth": Math.max(0, depth - Math.min(Math.abs(offset.x) / 176, 1)),
          "--drag-x": `${x}px`, "--drag-y": `${y}px`, "--drag-rotate": `${x * .065 * spin}deg`,
        } as CSSProperties}
        onPointerDown={e => {
          if (!interactive || !e.isPrimary || e.button !== 0 || start.current) return;
          const r = e.currentTarget.getBoundingClientRect();
          start.current = {id: e.pointerId, x: e.clientX, y: e.clientY, lastX: e.clientX, lastY: e.clientY,
            time: performance.now(), vx: 0, vy: 0, spin: e.clientY < r.top + r.height / 2 ? 1 : -1};
          setDragging(true);
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={e => {
          const gesture = start.current;
          if (gesture?.id !== e.pointerId) return;
          const now = performance.now();
          const rate = 500 / Math.max(1, now - gesture.time);
          gesture.vx = gesture.vx * .5 + (e.clientX - gesture.lastX) * rate;
          gesture.vy = gesture.vy * .5 + (e.clientY - gesture.lastY) * rate;
          gesture.lastX = e.clientX; gesture.lastY = e.clientY;
          gesture.time = now;
          setOffset({x: e.clientX - gesture.x, y: (e.clientY - gesture.y) * .6});
        }}
        onPointerUp={e => {
          const gesture = start.current;
          if (gesture?.id !== e.pointerId) return;
          const x = e.clientX - gesture.x, y = (e.clientY - gesture.y) * .6;
          const fast = performance.now() - gesture.time < 90 && Math.abs(gesture.vx) > 700;
          if (Math.abs(x) > 110 || (fast && Math.sign(x || gesture.vx) === Math.sign(gesture.vx))) {
            advance(Math.sign(x || gesture.vx), x, y, gesture.spin, gesture.vx, gesture.vy);
          } else release();
        }}
        onLostPointerCapture={e => { if (start.current?.id === e.pointerId) release(); }}
        onPointerCancel={release}>
        <div className="extra-deck-preview"><span className="extra-deck-landscape"/></div>
        <div className="extra-deck-body"><div className="extra-deck-title"><strong>{note.title}</strong><b>{note.value}</b></div>
          <small>{note.detail}</small><div className="extra-deck-tags">{note.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div>
        {(depth === 0 || leaving) && <span className="extra-deck-stamp" aria-hidden="true"
          style={{opacity: Math.min(Math.abs(x) / 110, 1)}}>{x > 0 ? "Next" : "Previous"}</span>}
      </article>;
    })}
  </div><div className="extra-actions"><Button size="compact" emphasis="soft" aria-disabled={!!flight} onClick={() => advance(-1)}>Previous</Button><Button size="compact" emphasis="soft" aria-disabled={!!flight} onClick={() => advance(1)}>Next</Button></div></div>;
}
function Ticket() {
  const [flipped, setFlipped] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  return <div className="extra-ticket-stage" onPointerMove={e => { const r = e.currentTarget.getBoundingClientRect(); setTilt({ x: ((e.clientX - r.left) / r.width * 2 - 1) * 14, y: ((e.clientY - r.top) / r.height * 2 - 1) * -14 }); }} onPointerLeave={() => setTilt({ x: 0, y: 0 })}>
    <button className="extra-ticket" data-flipped={flipped} style={{ '--tilt-x': `${tilt.y}deg`, '--tilt-y': `${tilt.x}deg`, '--layer-x': `${tilt.x}px`, '--layer-y': `${-tilt.y}px` } as CSSProperties} onClick={() => setFlipped(!flipped)} aria-pressed={flipped} aria-label={flipped ? "Show ticket front" : "Show ticket details"}>
      <span className="extra-ticket-side extra-ticket-front"><span className="extra-ticket-art"/><span className="extra-ticket-copy"><strong>Review<br/>session</strong><span>THURSDAY <b>10:00</b></span></span></span>
      <span className="extra-ticket-side extra-ticket-back"><span className="extra-ticket-code" aria-hidden="true"/><span className="extra-ticket-seat"><span>ROOM<b>02</b></span><span>SEAT<b>18A</b></span><span>GROUP<b>4</b></span></span><small>Turn to return</small></span>
    </button></div>;
}
function BoardingPass() {
  const [changed, setChanged] = useState(false);
  return <div className="extra-pass"><div className="extra-pass-main"><div className="extra-pass-head"><strong>◉ &nbsp;Northbound <small>NB 214</small></strong><span>{changed ? "Gate change" : "On time"}</span></div><div className="extra-pass-route"><div><b>OSL</b><small>Oslo · 09:30</small></div><span aria-hidden="true">- - - ✈ - - -</span><div><b>BGO</b><small>10:25 · Bergen</small></div></div><div className="extra-pass-fields"><div><small>Gate</small><strong key={String(changed)}>{changed ? "B31" : "B12"}</strong>{changed && <del>B12</del>}</div><div><small>Boards</small><strong>09:00</strong></div><div><small>Seat</small><strong>18A</strong></div><div><small>Group</small><strong>2</strong></div></div><small>{changed ? "Gate moved to B31" : "Doors close before departure"}</small></div><div className="extra-pass-tear"/><div className="extra-pass-footer"><span className="extra-pass-barcode" aria-hidden="true"/><span><small>Passenger</small><strong>Alex Kim</strong><small>Saturday</small></span></div><Button size="compact" emphasis="soft" onClick={() => setChanged(!changed)}>{changed ? "Reset gate" : "Simulate gate change"}</Button></div>;
}
function Marker() {
  const [round, setRound] = useState(0);
  return <div className="extra-marker-demo" key={round}><h2>Thoughtful work starts with <span className="extra-ink extra-ink-highlight">clearer notes</span>.</h2><p>Keep decisions <span className="extra-ink extra-ink-underline">close to the work</span>, find context in <span className="extra-ink extra-ink-circle">a moment</span>, and share a <span className="extra-ink extra-ink-box">single place</span> with your team. Leave <span className="extra-ink extra-ink-strike">scattered updates</span> behind.</p><Button size="compact" emphasis="quiet" onClick={() => setRound(round + 1)}>↻ &nbsp;Replay</Button></div>;
}
const words = "Open the draft and check its revision before sending the review.".split(" ");
function ReadAlong() {
  const [word, setWord] = useState(0);
  const text = useRef<HTMLParagraphElement>(null);
  const marker = useRef<HTMLSpanElement>(null);
  const [edges] = useState(() => ({left: spring(0, 520, 40), right: spring(0, 520, 40), top: spring(0, 600, 48)}));
  useLayoutEffect(() => {
    const reader = text.current, pill = marker.current;
    if (!reader || !pill) return;
    const {left, right, top} = edges;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const movingEdges = [left, right, top];
    let frame = 0, last = performance.now();
    function paint() {
      if (!pill) return;
      pill.style.setProperty("--reading-left", `${left.position}px`);
      pill.style.setProperty("--reading-right", `${right.position}px`);
      pill.style.setProperty("--reading-top", `${top.position}px`);
    }
    function tick(time: number) {
      const moving = advanceSprings(movingEdges, (time - last) / 1000);
      last = time;
      paint();
      frame = moving ? requestAnimationFrame(tick) : 0;
    }
    function position(animate: boolean) {
      if (!reader || !pill) return;
      const active = reader.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
      if (!active) return;
      const {offsetLeft: x, offsetTop: y, offsetWidth: width, offsetHeight: height} = active;
      if (left.target === x && top.target === y && right.target === x + width && pill.offsetHeight === height &&
        !preference.matches) return;
      cancelAnimationFrame(frame);
      const forward = x >= left.target;
      const major = forward ? right : left, minor = forward ? left : right;
      major.stiffness = 520; major.damping = 40;
      minor.stiffness = 210; minor.damping = 26;
      const motion = animate && !preference.matches;
      if (!motion || !pill.hasAttribute("data-ready") || Math.abs(y - top.target) > 2) {
        snap(left, x); snap(right, motion ? x : x + width); snap(top, y);
      }
      left.target = x; right.target = x + width; top.target = y;
      pill.style.blockSize = `${height}px`;
      pill.setAttribute("data-ready", "");
      paint();
      last = performance.now();
      if (motion) frame = requestAnimationFrame(tick);
    }
    position(true);
    const observer = new ResizeObserver(() => position(false));
    observer.observe(reader);
    const change = () => position(false);
    preference.addEventListener("change", change);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", change);
      cancelAnimationFrame(frame);
    };
  }, [edges, word]);
  return <div className="extra-reading"><p ref={text} aria-label={words.join(" ")}>
    <span ref={marker} className="extra-reading-marker" aria-hidden="true" />
    {words.map((value, i) => <span key={i}><button type="button" aria-label={`Read from ${value}`}
      aria-pressed={i === word} data-past={i < word} onClick={() => setWord(i)}>{value}</button>{" "}</span>)}</p>
    <div className="extra-actions"><Button size="compact" emphasis="soft" disabled={word === 0} onClick={() => setWord(word - 1)}>Previous word</Button><Button size="compact" emphasis="soft" disabled={word === words.length - 1} onClick={() => setWord(word + 1)}>Next word</Button></div><small>Word {word + 1} of {words.length}</small></div>;
}
const readingPages = ["Read the rollout plan.", "Check the monitoring checklist.", "Confirm the handoff owner."];

function Pages() {
  const [page, setPage] = useState(0);
  const [dragPosition, setDragPosition] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [turning, setTurning] = useState<{page: number; direction: number; progress: number} | null>(null);
  const drag = useRef<{ id: number; start: number; width: number } | null>(null);
  const last = page === readingPages.length - 1;
  useEffect(() => {
    if (!turning) return;
    const deadline = setTimeout(() => setTurning(null), 675);
    return () => clearTimeout(deadline);
  }, [turning]);

  function reset() {
    drag.current = null;
    setDragPosition(0);
    setDragging(false);
  }

  function turn(direction: number, progress = 0) {
    const next = Math.max(0, Math.min(readingPages.length - 1, page + direction));
    if (next === page) return;
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) setTurning({page, direction, progress});
    reset();
    setPage(next);
  }

  function travel(event: PointerEvent<HTMLDivElement>) {
    const gesture = drag.current;
    return gesture?.id === event.pointerId
      ? Math.min(1, Math.max(0, (gesture.start - event.clientX) / gesture.width))
      : 0;
  }

  return <div className="extra-pages">
    <div className="extra-page-stack" data-dragging={dragging || undefined}
      style={{ "--page-travel": dragPosition } as CSSProperties}
      onPointerDown={event => {
        if (last || turning || !event.isPrimary || event.button !== 0 || drag.current) return;
        const {right, width} = event.currentTarget.getBoundingClientRect();
        if (right - event.clientX > width * .27) return;
        drag.current = { id: event.pointerId, start: event.clientX, width };
        setDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={event => {
        if (drag.current?.id === event.pointerId) setDragPosition(travel(event));
      }}
      onPointerUp={event => {
        if (drag.current?.id !== event.pointerId) return;
        if (travel(event) >= .35) turn(1, travel(event));
        else reset();
      }}
      onPointerCancel={event => { if (drag.current?.id === event.pointerId) reset(); }}
      onLostPointerCapture={event => { if (drag.current?.id === event.pointerId) reset(); }}
      onKeyDown={event => { if (event.key === "Escape") reset(); }}>
      {!last && <div className="extra-page extra-page-under" aria-hidden="true"><small>PAGE {page + 2}</small><p>{readingPages[page + 1]}</p></div>}
      <div className="extra-page extra-page-current" key={page} aria-live="polite" data-can-turn={!last || undefined}><small>PAGE {page + 1}</small><p>{readingPages[page]}</p></div>
      {turning && <div key={`turn-${turning.page}`} className="extra-page extra-page-turning" aria-hidden="true"
        style={{"--turn-from": `${-108 * turning.progress}deg`, "--turn-to": `${turning.direction * -170}deg`} as CSSProperties}
        onAnimationEnd={() => setTurning(null)}>
        <small>PAGE {turning.page + 1}</small><p>{readingPages[turning.page]}</p>
      </div>}
    </div>
    <div className="extra-actions">
      <Button size="compact" emphasis="soft" disabled={page === 0} onClick={() => turn(-1)}>Back</Button>
      <Button size="compact" emphasis="soft" disabled={last} onClick={() => turn(1)}>Turn page</Button>
    </div>
  </div>;
}
function RevealNote() {
  const [open, setOpen] = useState(false);
  return <div className="extra-note" data-open={open}>
    <small>HANDOFF NOTE</small>
    <div className="extra-note-fold"><div><p id="extra-note-result" inert={!open}>The next review is ready for a second reader.</p></div></div>
    <Button size="compact" emphasis="soft" aria-expanded={open} aria-controls="extra-note-result"
      onClick={() => setOpen(!open)}>{open ? "Fold note" : "Open note"}</Button>
  </div>;
}
function WordChoice() {
  const words = ["queued", "in review", "ready"];
  const [index, setIndex] = useState(0);
  return <div className="extra-text"><p>Release status is <strong className="extra-word" key={index}>{words[index]}</strong>.</p><Button size="compact" emphasis="soft" onClick={() => setIndex((index + 1) % words.length)}>Next status</Button></div>;
}
function ChecklistCard() {
  const [done, setDone] = useState(false);
  return <div className="extra-check-card" data-done={done}><Checkbox label="Verify the release note" checked={done} onCheckedChange={checked => setDone(checked === true)} /></div>;
}
export const extraCards: Example[] = [
  { id: "swipe-deck", title: "Card deck", body: <Deck /> },
  { id: "parallax-ticket", title: "Turning ticket", body: <Ticket /> },
  { id: "boarding-pass", title: "Travel pass", body: <BoardingPass /> },
  { id: "marker-text", title: "Marker text", body: <Marker /> },
  { id: "read-along", title: "Read along", body: <ReadAlong /> },
  { id: "page-flip", title: "Page turn", body: <Pages /> },
  { id: "folded-note", title: "Folded note", body: <RevealNote /> },
  { id: "word-choice", title: "Changing word", body: <WordChoice /> },
  { id: "checklist-card", title: "Checklist card", body: <ChecklistCard /> },
];

export function ReviewerProfile() {
  const [following, setFollowing] = useState(false);
  const [message, setMessage] = useState(false);
  const [motion] = useState(() => ({
    follow: spring(0, 300, 22),
    pop: spring(1, 520, 14),
    ones: spring(9, 260, 22),
    tens: spring(8, 260, 22),
  }));
  const area = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const node = area.current;
    if (!node) return;
    motion.follow.target = following ? 1 : 0;
    motion.ones.target = following ? 10 : 9;
    if (following) motion.pop.velocity = 4;
    let stop = playSprings(Object.values(motion), paint);
    const carry = setTimeout(() => {
      motion.tens.target = following ? 9 : 8;
      stop();
      stop = playSprings(Object.values(motion), paint);
    }, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 60);
    function paint() {
      const p = Math.max(0, Math.min(1, motion.follow.position));
      node?.style.setProperty("--profile-open", String(p));
      node?.style.setProperty("--profile-ones", String(motion.ones.position));
      node?.style.setProperty("--profile-tens", String(motion.tens.position));
      const avatar = node?.closest(".yg-profile-card")?.querySelector<HTMLElement>(".yg-profile-avatar");
      if (avatar) avatar.style.scale = String(motion.pop.position);
    }
    return () => {clearTimeout(carry); stop();};
  }, [following, motion]);
  const digits = (place: "tens" | "ones") =>
    <span className="motion-profile-reel" aria-hidden="true">
      <span style={{translate: `0 calc(var(--profile-${place}) * -1.2em)`}}>
        {Array.from({length: 11}, (_, digit) => <span key={digit}>{digit % 10}</span>)}
      </span>
    </span>;
  return <ProfileCard name="Kai" initials="K" detail="Workspace reviewer" actions={
    <div className="motion-profile-content" ref={area}>
      <p>Reviews new drafts and flags decisions.</p>
      <div className="motion-profile-count">
        <strong aria-label={following ? "12,490 followers" : "12,489 followers"}>
          <span aria-hidden="true">12,4</span>{digits("tens")}{digits("ones")}
        </strong> Followers
      </div>
      <div className="motion-profile-actions">
        <button type="button" aria-pressed={following} aria-label={following ? "Following Kai" : "Follow Kai"}
          onClick={() => {setFollowing(value => !value); setMessage(false);}}>
          <i aria-hidden="true" />
          <span aria-hidden="true">Follow</span><span aria-hidden="true">Following</span>
        </button>
        <button type="button" inert={!following} aria-hidden={!following} onClick={() => setMessage(true)}>Message</button>
      </div>
      {message && <small role="status">A message draft is ready for Kai.</small>}
    </div>
  } />;
}
