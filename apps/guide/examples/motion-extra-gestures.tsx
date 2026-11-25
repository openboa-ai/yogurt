import { useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { Button, Calendar, Icon, Popover, RadioGroup } from "@openboa/yogurt";
import { playSprings, spring } from "../../../packages/web/src/foundation/spring-motion.js";

function Exposure() {
  const [value, setValue] = useState(0);
  const [raw, setRaw] = useState(0);
  const ticker = useRef<HTMLSpanElement>(null);
  const positive = useRef<SVGCircleElement>(null), negative = useRef<SVGCircleElement>(null);
  const [offset] = useState(() => spring(0,600,60));
  const drag = useRef<{id:number; x:number; start:number} | null>(null);
  useLayoutEffect(() => {
    const strip = ticker.current;
    if (!strip) return;
    const ticks = Array.from(strip.children) as HTMLElement[];
    offset.target = raw;
    return playSprings([offset], () => {
      strip.style.translate = `${offset.position}px 0`;
      const position = -offset.position / 13;
      const amount = Math.min(1,Math.abs(Math.round(position)/20));
      positive.current?.setAttribute("stroke-dasharray", position > 0 ? `${amount} 1` : "0 1");
      negative.current?.setAttribute("stroke-dasharray", position < 0 ? `${amount} 1` : "0 1");
      ticks.forEach((tick,index) => {
        const distance = Math.abs(index - 20 - position);
        tick.style.opacity = String(distance <= 1 ? 1-.4*distance : Math.max(.3,.6-.15*(distance-1)));
        tick.style.clipPath = `inset(${Math.min(50,distance <= 1 ? 30*distance : 30+20*(distance-1))}% 0 0)`;
        tick.toggleAttribute("data-current", distance < .5);
      });
    });
  }, [offset,raw]);
  function set(n:number) {
    const next = Math.max(-260,Math.min(260,n));
    setRaw(next);
    setValue(Math.round(-next/13)/10);
  }
  function finish(event:PointerEvent<HTMLButtonElement>) {
    if (drag.current?.id !== event.pointerId) return;
    drag.current = null;
    set(Math.round(raw/13)*13);
  }
  return <div className="extra-gesture extra-exposure">
    <label htmlFor="extra-exposure">Exposure <output>{value > 0 ? "+" : ""}{value.toFixed(1)} EV</output></label>
    <div className="extra-exposure-ring" aria-hidden="true">
      <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" />
        <circle ref={positive} cx="50" cy="50" r="48" pathLength="1" strokeDasharray="0 1" />
        <circle ref={negative} cx="50" cy="50" r="48" pathLength="1" strokeDasharray="0 1" />
      </svg>
      <span>{value.toFixed(1)}</span>
    </div>
    <button type="button" id="extra-exposure" className="extra-exposure-ticker" role="slider" aria-label="Exposure"
      aria-valuemin={-2} aria-valuemax={2} aria-valuenow={value} aria-valuetext={`${value.toFixed(1)} EV`}
      onKeyDown={event => {
        const directions: Record<string,number> = {ArrowRight:-1,ArrowUp:-1,ArrowLeft:1,ArrowDown:1};
        if (!(event.key in directions) && event.key !== "Home" && event.key !== "End") return;
        event.preventDefault();
        set(event.key==="Home" ? 260 : event.key==="End" ? -260 : Math.round(raw/13)*13+13*directions[event.key]);
      }}
      onPointerDown={event => {
        if (!event.isPrimary || event.button !== 0) return;
        drag.current = {id:event.pointerId,x:event.clientX,start:raw};
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={event => {
        const hand=drag.current;
        if (hand?.id===event.pointerId) set(hand.start+event.clientX-hand.x);
      }}
      onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={finish}>
      <span ref={ticker} aria-hidden="true">{Array.from({length:41},(_,index)=><i key={index}/>)}</span>
    </button>
    <div className="extra-exposure-preview" style={{"--exposure-light": Math.pow(2, value / 2)} as CSSProperties} aria-hidden="true"/>
    <Button size="compact" emphasis="quiet" onClick={() => set(0)}>Reset</Button>
  </div>;
}
function Toolbar() {
  const [bold, setBold] = useState(false), [italic, setItalic] = useState(false);
  return <div className="extra-gesture"><details className="extra-disclosure">
    <summary><Icon name="next" />Text formatting</summary>
    <div className="extra-toolbar">
      <Button type="button" size="touch" emphasis="soft" aria-pressed={bold} onClick={() => setBold(!bold)}><span className="extra-format-icon" aria-hidden="true">B</span>Bold</Button>
      <Button type="button" size="touch" emphasis="soft" aria-pressed={italic} onClick={() => setItalic(!italic)}><span className="extra-format-icon extra-format-icon-italic" aria-hidden="true">I</span>Italic</Button>
    </div>
  </details><p className="extra-format-sample" style={{fontWeight: bold ? 700 : 400, fontStyle: italic ? "italic" : "normal"}}>A little room for ideas.</p></div>;
}
function Rating() {
  const [value, setValue] = useState("");
  return <div className="extra-gesture">
    <RadioGroup
      label="Rate this view"
      value={value}
      onValueChange={setValue}
      options={[1, 2, 3, 4, 5].map((n) => ({ id: String(n), label: `${n} of 5` }))}
    />
    <Button size="compact" emphasis="quiet" onClick={() => setValue("")}>Clear</Button>
  </div>;
}
function Quantity() {
  const [value, setValue] = useState(1);
  return <div className="extra-gesture"><span>Copies</span><div className="extra-counter"><Button type="button" emphasis="soft" aria-label="Remove one copy" disabled={value <= 1} onClick={() => setValue(value - 1)}>−</Button><output aria-live="polite"><span className="extra-quantity-value" key={value}>{value}</span></output><Button type="button" emphasis="soft" aria-label="Add one copy" disabled={value >= 10} onClick={() => setValue(value + 1)}>+</Button></div></div>;
}
function Pages() {
  const [page, setPage] = useState(1);
  return <div className="extra-gesture"><div className="extra-gesture-page"><div key={page}><span>Note {page} of 3</span><p>{["Collect the first thoughts.", "Make room for review.", "Share the next step."][page - 1]}</p></div></div><div className="extra-toolbar"><Button size="compact" emphasis="soft" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button><Button size="compact" emphasis="soft" disabled={page === 3} onClick={() => setPage(page + 1)}>Next</Button></div></div>;
}
function Zoom() {
  const [zoom, setZoom] = useState(100);
  return <div className="extra-gesture"><div className="extra-zoom-frame"><div style={{transform: `scale(${zoom / 100})`}}>Aa</div></div><label htmlFor="extra-zoom">Preview scale <output>{zoom}%</output></label><input id="extra-zoom" type="range" min="70" max="130" step="10" value={zoom} onChange={e => setZoom(Number(e.target.value))}/><Button size="compact" emphasis="quiet" onClick={() => setZoom(100)}>Reset</Button></div>;
}
function MaskedField() {
  const [visible, setVisible] = useState(false);
  return <div className="extra-gesture"><span>Example card</span><div className="extra-card" data-unmasked={visible}><small>LOCAL EXAMPLE</small><strong key={String(visible)}>{visible ? "4242 4242 4242 1234" : "•••• •••• •••• 1234"}</strong><span>Valid through 12 / 30</span></div><Button size="compact" emphasis="soft" aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? "Hide number" : "Show number"}</Button></div>;
}
function Schedule() {
  const [date, setDate] = useState("2026-11-20");
  const [open, setOpen] = useState(false);
  return <div className="extra-gesture extra-date-choice">
    <Popover
      label="Choose a date"
      open={open}
      onOpenChange={setOpen}
      trigger={<Button emphasis="soft">{date || "Choose a date"}</Button>}
    >
      <Calendar label="Choose a date" value={date || undefined} onValueChange={(next) => { setDate(next); setOpen(false); }} />
    </Popover>
    <p role="status" className="extra-date-result"><span key={date}>{date ? `Selected: ${date}` : "No date selected"}</span></p>
    <Button size="compact" emphasis="quiet" onClick={() => setDate("")}>Clear</Button>
  </div>;
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
