import { useState, type ReactNode } from "react";
import { Button, Checkbox } from "@openboa/yogurt";

type Example = { id: string; title: string; body: ReactNode };
const notes = ["Check that every reviewer has the release brief.", "Resolve open notes on the migration.", "Send the final checklist to the release lead."];
function Deck() {
  const [index, setIndex] = useState(0);
  return <div className="extra-deck"><div className="extra-deck-sheet"><small>NOTE {index + 1} / {notes.length}</small><p>{notes[index]}</p></div><div className="extra-actions"><Button size="compact" emphasis="soft" onClick={() => setIndex((index + notes.length - 1) % notes.length)}>Previous</Button><Button size="compact" emphasis="soft" onClick={() => setIndex((index + 1) % notes.length)}>Next</Button></div></div>;
}
function Ticket() {
  const [tilt, setTilt] = useState(false);
  return <button className="extra-ticket" data-tilt={tilt} onClick={() => setTilt(!tilt)} aria-pressed={tilt}><small>DESIGN REVIEW</small><strong>Workspace access</strong><span>{tilt ? "Thursday · 10:00" : "Turn ticket"} ↗</span></button>;
}
function BoardingPass() {
  const [open, setOpen] = useState(false);
  return <div className="extra-pass"><div><small>YOUR ROUTE</small><strong>Oslo → Bergen</strong><span>Saturday · 09:30</span></div><Button size="compact" emphasis="soft" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? "Hide details" : "Show details"}</Button>{open && <p>Platform 2 · Coach 4 · Seat 18A</p>}</div>;
}
function Marker() {
  const [marked, setMarked] = useState(false);
  return <div className="extra-text"><p>Reviewers need <span className="extra-marker" data-marked={marked}>access to the source file</span>.</p><Button size="compact" emphasis="soft" onClick={() => setMarked(!marked)} aria-pressed={marked}>{marked ? "Remove highlight" : "Highlight phrase"}</Button></div>;
}
function ReadAlong() {
  const lines = ["Open the draft and check its revision.", "Record any unresolved decision.", "Send the review to the project owner."];
  const [line, setLine] = useState(0);
  return <div className="extra-reading"><ol>{lines.map((text, i) => <li key={text} data-current={i === line}>{text}</li>)}</ol><div className="extra-actions"><Button size="compact" emphasis="soft" disabled={line === 0} onClick={() => setLine(line - 1)}>Previous line</Button><Button size="compact" emphasis="soft" disabled={line === lines.length - 1} onClick={() => setLine(line + 1)}>Next line</Button></div><small>Line {line + 1} of {lines.length}</small></div>;
}
function Pages() {
  const pages = ["Read the rollout plan.", "Check the monitoring checklist.", "Confirm the handoff owner."];
  const [page, setPage] = useState(0);
  return <div className="extra-pages"><div className="extra-page" key={page}><small>PAGE {page + 1}</small><p>{pages[page]}</p></div><div className="extra-actions"><Button size="compact" emphasis="soft" disabled={page === 0} onClick={() => setPage(page - 1)}>Back</Button><Button size="compact" emphasis="soft" disabled={page === pages.length - 1} onClick={() => setPage(page + 1)}>Turn page</Button></div></div>;
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
