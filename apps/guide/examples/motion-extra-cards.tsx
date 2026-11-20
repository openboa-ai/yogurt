import { useState, type ReactNode } from "react";

type Example = { id: string; title: string; body: ReactNode };
const notes = ["A quiet place to begin.", "Make room for the unexpected.", "Keep the useful things close."];
function Deck() {
  const [index, setIndex] = useState(0);
  return <div className="extra-deck"><div className="extra-deck-sheet"><small>NOTE {index + 1} / {notes.length}</small><p>{notes[index]}</p></div><div className="extra-actions"><button onClick={() => setIndex((index + notes.length - 1) % notes.length)}>Previous</button><button onClick={() => setIndex((index + 1) % notes.length)}>Next</button></div></div>;
}
function Ticket() {
  const [tilt, setTilt] = useState(false);
  return <button className="extra-ticket" data-tilt={tilt} onClick={() => setTilt(!tilt)} aria-pressed={tilt}><small>FIELD NOTES · 04</small><strong>A little further</strong><span>{tilt ? "Ticket turned" : "Turn ticket"} ↗</span></button>;
}
function BoardingPass() {
  const [open, setOpen] = useState(false);
  return <div className="extra-pass"><div><small>YOUR ROUTE</small><strong>Here → There</strong><span>Saturday · 09:30</span></div><button onClick={() => setOpen(!open)} aria-expanded={open}>{open ? "Hide details" : "Show details"}</button>{open && <p>Platform 2 · Window seat · Bring a notebook</p>}</div>;
}
function Marker() {
  const [marked, setMarked] = useState(false);
  return <div className="extra-text"><p>Good ideas need <span className="extra-marker" data-marked={marked}>space to grow</span>.</p><button onClick={() => setMarked(!marked)} aria-pressed={marked}>{marked ? "Remove highlight" : "Highlight phrase"}</button></div>;
}
function ReadAlong() {
  const lines = ["Start with a small observation.", "Follow the thread that interests you.", "Leave a note for your future self."];
  const [line, setLine] = useState(0);
  return <div className="extra-reading"><ol>{lines.map((text, i) => <li key={text} data-current={i === line}>{text}</li>)}</ol><div className="extra-actions"><button disabled={line === 0} onClick={() => setLine(line - 1)}>Previous line</button><button disabled={line === lines.length - 1} onClick={() => setLine(line + 1)}>Next line</button></div><small>Line {line + 1} of {lines.length}</small></div>;
}
function Pages() {
  const pages = ["Collect a few observations.", "Find the thread between them.", "Share what you learned."];
  const [page, setPage] = useState(0);
  return <div className="extra-pages"><div className="extra-page" key={page}><small>PAGE {page + 1}</small><p>{pages[page]}</p></div><div className="extra-actions"><button disabled={page === 0} onClick={() => setPage(page - 1)}>Back</button><button disabled={page === pages.length - 1} onClick={() => setPage(page + 1)}>Turn page</button></div></div>;
}
function RevealNote() {
  const [open, setOpen] = useState(false);
  return <div className="extra-note"><small>A NOTE FOR YOU</small><p>{open ? "There is time to try again tomorrow." : "A small reminder is waiting here."}</p><button onClick={() => setOpen(!open)}>{open ? "Fold note" : "Open note"}</button></div>;
}
function WordChoice() {
  const words = ["curious", "patient", "open"];
  const [index, setIndex] = useState(0);
  return <div className="extra-text"><p>Today, stay <strong className="extra-word" key={index}>{words[index]}</strong>.</p><button onClick={() => setIndex((index + 1) % words.length)}>Change word</button></div>;
}
function ChecklistCard() {
  const [done, setDone] = useState(false);
  return <label className="extra-check-card" data-done={done}><input type="checkbox" checked={done} onChange={event => setDone(event.target.checked)} /><span><strong>Take a short break</strong><small>{done ? "Completed" : "A moment away from the screen"}</small></span></label>;
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
