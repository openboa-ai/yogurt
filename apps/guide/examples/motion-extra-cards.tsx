import { useState, useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { Button, Checkbox } from "@openboa/yogurt";

type Example = { id: string; title: string; body: ReactNode };
const notes = ["Check that every reviewer has the release brief.", "Resolve open notes on the migration.", "Send the final checklist to the release lead."];
function Deck() {
  const [index, setIndex] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const start = useRef<{ x: number; y: number } | null>(null);
  const advance = (direction: number) => { setIndex(i => (i + direction + notes.length) % notes.length); setOffset({ x: 0, y: 0 }); };
  return <div className="extra-deck"><div className="extra-deck-stage" aria-label="Review notes">
    {[2, 1, 0].map(depth => <article key={depth} className="extra-deck-sheet" data-depth={depth} style={depth === 0 ? { '--drag-x': `${offset.x}px`, '--drag-y': `${offset.y}px`, '--drag-rotate': `${offset.x * .065}deg` } as CSSProperties : undefined}
      onPointerDown={depth === 0 ? e => { start.current = { x: e.clientX, y: e.clientY }; e.currentTarget.setPointerCapture(e.pointerId); } : undefined}
      onPointerMove={depth === 0 ? e => { if (start.current) setOffset({ x: e.clientX - start.current.x, y: (e.clientY - start.current.y) * .6 }); } : undefined}
      onPointerUp={depth === 0 ? () => { if (Math.abs(offset.x) > 110) advance(offset.x > 0 ? 1 : -1); else setOffset({ x: 0, y: 0 }); start.current = null; } : undefined}
      onPointerCancel={() => { start.current = null; setOffset({ x: 0, y: 0 }); }}>
      <div className="extra-deck-preview"><i/><i/><div><i/><i/><i/></div></div><div className="extra-deck-body"><small>NOTE {(index + depth) % notes.length + 1} / {notes.length}</small><p>{notes[(index + depth) % notes.length]}</p></div>
      {depth === 0 && <span className="extra-deck-stamp" style={{ opacity: Math.min(Math.abs(offset.x) / 110, 1) }}>{offset.x > 0 ? "Next" : "Previous"}</span>}
    </article>)}
  </div><div className="extra-actions"><Button size="compact" emphasis="soft" onClick={() => advance(-1)}>Previous</Button><Button size="compact" emphasis="soft" onClick={() => advance(1)}>Next</Button></div></div>;
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
  const [marked, setMarked] = useState(false);
  return <div className="extra-text"><p>Reviewers need <span className="extra-marker" data-marked={marked}>access to the source file</span>.</p><Button size="compact" emphasis="soft" onClick={() => setMarked(!marked)} aria-pressed={marked}>{marked ? "Remove highlight" : "Highlight phrase"}</Button></div>;
}
function ReadAlong() {
  const words = "Open the draft and check its revision before sending the review.".split(" ");
  const [word, setWord] = useState(0);
  return <div className="extra-reading"><p aria-label={words.join(" ")}>{words.map((text, i) => <span key={i}><button type="button" aria-label={`Read from ${text}`} aria-pressed={i === word} data-past={i < word} onClick={() => setWord(i)}>{text}</button>{" "}</span>)}</p><div className="extra-actions"><Button size="compact" emphasis="soft" disabled={word === 0} onClick={() => setWord(word - 1)}>Previous word</Button><Button size="compact" emphasis="soft" disabled={word === words.length - 1} onClick={() => setWord(word + 1)}>Next word</Button></div><small>Word {word + 1} of {words.length}</small></div>;
}
const readingPages = ["Read the rollout plan.", "Check the monitoring checklist.", "Confirm the handoff owner."];

function Pages() {
  const [page, setPage] = useState(0);
  const [dragPosition, setDragPosition] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ id: number; start: number; width: number } | null>(null);
  const last = page === readingPages.length - 1;

  function reset() {
    drag.current = null;
    setDragPosition(0);
    setDragging(false);
  }

  function turn(direction: number) {
    reset();
    setPage(current => Math.max(0, Math.min(readingPages.length - 1, current + direction)));
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
        if (last || !event.isPrimary || event.button !== 0 || drag.current) return;
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
        if (travel(event) >= .35) turn(1);
        else reset();
      }}
      onPointerCancel={event => { if (drag.current?.id === event.pointerId) reset(); }}
      onLostPointerCapture={event => { if (drag.current?.id === event.pointerId) reset(); }}
      onKeyDown={event => { if (event.key === "Escape") reset(); }}>
      {!last && <div className="extra-page extra-page-under" aria-hidden="true"><small>PAGE {page + 2}</small><p>{readingPages[page + 1]}</p></div>}
      <div className="extra-page extra-page-current" key={page} aria-live="polite" data-can-turn={!last || undefined}><small>PAGE {page + 1}</small><p>{readingPages[page]}</p></div>
    </div>
    <div className="extra-actions">
      <Button size="compact" emphasis="soft" disabled={page === 0} onClick={() => turn(-1)}>Back</Button>
      <Button size="compact" emphasis="soft" disabled={last} onClick={() => turn(1)}>Turn page</Button>
    </div>
  </div>;
}
function RevealNote() {
  const [open, setOpen] = useState(false);
  return <div className="extra-note"><small>HANDOFF NOTE</small><p>{open ? "The next review is ready for a second reader." : "Open the note for the review status."}</p><Button size="compact" emphasis="soft" onClick={() => setOpen(!open)}>{open ? "Fold note" : "Open note"}</Button></div>;
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
