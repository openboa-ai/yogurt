import { useState, type ReactNode } from "react";
import { Button } from "@openboa/yogurt";

function Exposure() {
  const [value, setValue] = useState(0);
  return <div className="extra-gesture"><label htmlFor="extra-exposure">Exposure <output>{value > 0 ? "+" : ""}{value.toFixed(1)} EV</output></label><input id="extra-exposure" type="range" min="-2" max="2" step="0.1" value={value} onChange={e => setValue(Number(e.target.value))}/><div className="extra-exposure-preview" style={{filter: `brightness(${Math.pow(2, value / 2)})`}} aria-hidden="true"/><Button size="compact" emphasis="quiet" onClick={() => setValue(0)}>Reset</Button></div>;
}
function Toolbar() {
  const [bold, setBold] = useState(false), [italic, setItalic] = useState(false);
  return <div className="extra-gesture"><details className="extra-disclosure"><summary>Text formatting</summary><div className="extra-toolbar"><Button type="button" size="compact" emphasis="soft" aria-pressed={bold} onClick={() => setBold(!bold)}>Bold</Button><Button type="button" size="compact" emphasis="soft" aria-pressed={italic} onClick={() => setItalic(!italic)}>Italic</Button></div></details><p style={{fontWeight: bold ? 700 : 400, fontStyle: italic ? "italic" : "normal"}}>A little room for ideas.</p></div>;
}
function Rating() {
  const [value, setValue] = useState(0);
  return <fieldset className="extra-rating"><legend>Rate this view</legend><div>{[1,2,3,4,5].map(n => <label key={n}><input type="radio" name="extra-rating" value={n} checked={value === n} onChange={() => setValue(n)} /><span aria-hidden="true" data-filled={n <= value || undefined}>{n <= value ? "★" : "☆"}</span><span className="extra-sr">{n} of 5</span></label>)}</div><p>{value ? `${value} of 5 selected` : "Choose a rating"}</p><Button size="compact" emphasis="quiet" onClick={() => setValue(0)}>Clear</Button></fieldset>;
}
function Quantity() {
  const [value, setValue] = useState(1);
  return <div className="extra-gesture"><span>Copies</span><div className="extra-counter"><Button type="button" emphasis="soft" aria-label="Remove one copy" disabled={value <= 1} onClick={() => setValue(value - 1)}>−</Button><output aria-live="polite">{value}</output><Button type="button" emphasis="soft" aria-label="Add one copy" disabled={value >= 10} onClick={() => setValue(value + 1)}>+</Button></div></div>;
}
function Pages() {
  const [page, setPage] = useState(1);
  return <div className="extra-gesture"><div className="extra-gesture-page"><span>Note {page} of 3</span><p>{["Collect the first thoughts.", "Make room for review.", "Share the next step."][page - 1]}</p></div><div className="extra-toolbar"><Button size="compact" emphasis="soft" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button><Button size="compact" emphasis="soft" disabled={page === 3} onClick={() => setPage(page + 1)}>Next</Button></div></div>;
}
function Zoom() {
  const [zoom, setZoom] = useState(100);
  return <div className="extra-gesture"><div className="extra-zoom-frame"><div style={{transform: `scale(${zoom / 100})`}}>Aa</div></div><label htmlFor="extra-zoom">Preview scale <output>{zoom}%</output></label><input id="extra-zoom" type="range" min="70" max="130" step="10" value={zoom} onChange={e => setZoom(Number(e.target.value))}/><Button size="compact" emphasis="quiet" onClick={() => setZoom(100)}>Reset</Button></div>;
}
function MaskedField() {
  const [visible, setVisible] = useState(false);
  return <div className="extra-gesture"><span>Example card</span><div className="extra-card"><small>LOCAL EXAMPLE</small><strong>{visible ? "4242 4242 4242 1234" : "•••• •••• •••• 1234"}</strong><span>Valid through 12 / 30</span></div><Button size="compact" emphasis="soft" onClick={() => setVisible(!visible)}>{visible ? "Hide number" : "Show number"}</Button></div>;
}
function Schedule() {
  const [date, setDate] = useState("2026-11-20");
  return <div className="extra-gesture"><label htmlFor="extra-date">Choose a date</label><input id="extra-date" type="date" value={date} onChange={e => setDate(e.target.value)}/><p role="status">{date ? `Selected: ${date}` : "No date selected"}</p><Button size="compact" emphasis="quiet" onClick={() => setDate("")}>Clear</Button></div>;
}
export const extraGestures: {id:string; title:string; body:ReactNode}[] = [
  {id:"exposure",title:"Exposure adjustment",body:<Exposure/>},
  {id:"disclosure-toolbar",title:"Disclosure toolbar",body:<Toolbar/>},
  {id:"star-rating",title:"Star rating",body:<Rating/>},
  {id:"quantity-stepper",title:"Quantity stepper",body:<Quantity/>},
  {id:"note-pagination",title:"Note pagination",body:<Pages/>},
  {id:"preview-scale",title:"Preview scale",body:<Zoom/>},
  {id:"masked-example",title:"Masked card",body:<MaskedField/>},
  {id:"date-choice",title:"Date choice",body:<Schedule/>},
];
