import { useState, type ReactNode } from "react";
import * as Y from "@openboa/yogurt";

function InvitePeople() {
  const [email, setEmail] = useState("");
  const [invites, setInvites] = useState<string[]>([]);
  return <form className="motion-extra" onSubmit={e => { e.preventDefault(); const next = email.trim(); if (next && !invites.includes(next)) setInvites([...invites, next]); setEmail(""); }}>
    <Y.TextField label="Email address" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" />
    <Y.Button type="submit">Add person</Y.Button>{invites.length > 0 && <div className="motion-extra-chips">{invites.map(name => <button type="button" key={name} onClick={() => setInvites(invites.filter(item => item !== name))} aria-label={`Remove ${name}`}>{name} ×</button>)}</div>}
    <small>People added here are a local preview.</small>
  </form>;
}
function TagInput() {
  const [text, setText] = useState(""); const [tags, setTags] = useState(["Ideas", "Research"]);
  return <form className="motion-extra" onSubmit={e => { e.preventDefault(); const next = text.trim(); if (next && !tags.includes(next)) setTags([...tags, next]); setText(""); }}>
    <Y.TextField label="Add a tag" value={text} onChange={e => setText(e.target.value)} placeholder="Type a tag" /><Y.Button type="submit" emphasis="soft">Add tag</Y.Button>
    <div className="motion-extra-chips">{tags.map(tag => <button key={tag} type="button" onClick={() => setTags(tags.filter(t => t !== tag))} aria-label={`Remove ${tag}`}>{tag} ×</button>)}</div>
  </form>;
}
function Stepper() {
  const [value, setValue] = useState(3);
  return <div className="motion-extra"><Y.NumericSpinner label="Guests" min={0} max={12} value={value} onValueChange={setValue} /><small>Choose up to 12 guests.</small></div>;
}
function WheelPicker() {
  const options = ["Morning", "Midday", "Afternoon", "Evening"]; const [index, setIndex] = useState(0);
  return <div className="motion-extra-wheel" role="group" aria-label="Preferred time"><Y.Button emphasis="quiet" aria-label="Previous time" onClick={() => setIndex((index + options.length - 1) % options.length)}>↑</Y.Button><output aria-live="polite">{options[index]}</output><Y.Button emphasis="quiet" aria-label="Next time" onClick={() => setIndex((index + 1) % options.length)}>↓</Y.Button></div>;
}
function Scrubber() {
  const [position, setPosition] = useState(36);
  return <div className="motion-extra"><Y.Slider label="Preview position" value={position} onValueChange={setPosition} unit="%" /><div className="motion-extra-track" aria-hidden="true"><span style={{ width: `${position}%` }} /></div></div>;
}
function UndoAction() {
  const [saved, setSaved] = useState(true);
  return <div className="motion-extra"><strong>{saved ? "Saved to reading list" : "Removed from reading list"}</strong><Y.Button emphasis="soft" onClick={() => setSaved(!saved)}>{saved ? "Remove" : "Undo removal"}</Y.Button><span role="status">{saved ? "Available for later" : "You can undo this change"}</span></div>;
}
function Refresh() {
  const [count, setCount] = useState(0);
  return <div className="motion-extra"><div className="motion-extra-refresh" key={count} aria-hidden="true">↻</div><strong>Activity is up to date</strong><span role="status">{count ? `Refreshed ${count} ${count === 1 ? "time" : "times"} in this preview` : "Ready to refresh"}</span><Y.Button emphasis="soft" onClick={() => setCount(count + 1)}>Refresh activity</Y.Button></div>;
}
function Toolbar() {
  const [selected, setSelected] = useState<string[]>([]);
  return <div className="motion-extra"><span>Formatting</span><div role="toolbar" aria-label="Formatting" className="motion-extra-toolbar">{["Bold", "Italic", "Underline"].map(item => <button key={item} type="button" aria-pressed={selected.includes(item)} onClick={() => setSelected(selected.includes(item) ? selected.filter(v => v !== item) : [...selected, item])}>{item}</button>)}</div><span role="status">{selected.length ? selected.join(", ") : "No formatting selected"}</span></div>;
}
function Rating() {
  const [value, setValue] = useState(0);
  return <div className="motion-extra"><span id="motion-rating-label">How was your experience?</span><div role="group" aria-labelledby="motion-rating-label" className="motion-extra-rating">{[1, 2, 3, 4, 5].map(n => <button key={n} type="button" aria-label={`${n} out of 5`} aria-pressed={value === n} onClick={() => setValue(n)}>{n <= value ? "★" : "☆"}</button>)}</div><span role="status">{value ? `${value} out of 5` : "Choose a rating"}</span></div>;
}
export const extraControls: { id: string; title: string; body: ReactNode }[] = [
  { id: "invite-people", title: "Invite people", body: <InvitePeople /> },
  { id: "tag-input", title: "Tag input", body: <TagInput /> },
  { id: "number-stepper", title: "Number stepper", body: <Stepper /> },
  { id: "wheel-picker", title: "Wheel picker", body: <WheelPicker /> },
  { id: "scrubber", title: "Scrubber", body: <Scrubber /> },
  { id: "undo-action", title: "Undo action", body: <UndoAction /> },
  { id: "refresh-activity", title: "Refresh activity", body: <Refresh /> },
  { id: "formatting-toolbar", title: "Formatting toolbar", body: <Toolbar /> },
  { id: "rating", title: "Rating", body: <Rating /> },
];
