import { useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { Button } from "@openboa/yogurt";
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
  return <div className="extra-gesture"><details className="extra-disclosure"><summary>Text formatting</summary><div className="extra-toolbar"><Button type="button" size="compact" emphasis="soft" aria-pressed={bold} onClick={() => setBold(!bold)}>Bold</Button><Button type="button" size="compact" emphasis="soft" aria-pressed={italic} onClick={() => setItalic(!italic)}>Italic</Button></div></details><p className="extra-format-sample" style={{fontWeight: bold ? 700 : 400, fontStyle: italic ? "italic" : "normal"}}>A little room for ideas.</p></div>;
}
function Rating() {
  const [value, setValue] = useState(0);
  const [hovered, setHovered] = useState(0);
  const root = useRef<HTMLFieldSetElement>(null);
  const [roller] = useState(() => spring(0,260,22));
  const [stars] = useState(() => Array.from({length:5}, () => ({
    fill: spring(0,300,24), press: spring(1,520,13),
  })));
  const shown = hovered || value;
  useLayoutEffect(() => {
    const node = root.current;
    if (!node) return;
    const glyphs = Array.from(node.querySelectorAll<SVGSVGElement>("svg"));
    const springs = [roller,...stars.flatMap(star=>[star.fill,star.press])];
    roller.target = shown;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stop: (()=>void) | undefined;
    function render() {
      node?.style.setProperty("--yg-rating-shown",String(roller.position));
      stars.forEach((star,index)=>{
        const alpha = Math.min(1,Math.max(0,star.fill.position));
        glyphs[index]?.style.setProperty("--yg-star-fill",`${alpha*100}%`);
        glyphs[index]?.style.setProperty("--yg-star-scale",String(star.press.position));
      });
    }
    const timers = stars.map((star,i) => {
      const on = i < shown;
      function light() {
        if (on && star.fill.target !== 1 && !reduced) {
          star.press.position=.7;
          star.press.velocity=7;
        }
        star.fill.target=Number(on);
      }
      if (!on || reduced || i === 0) { light(); return undefined; }
      return setTimeout(()=>{
        light();
        stop?.();
        stop=playSprings(springs,render);
      },i*50);
    });
    stop = playSprings(springs,render);
    return ()=>{timers.forEach(clearTimeout);stop?.();};
  },[roller,shown,stars]);
  return <fieldset ref={root} className="extra-rating"><legend>Rate this view</legend>
    <div onPointerLeave={()=>setHovered(0)}>
      {[1,2,3,4,5].map(n => <label key={n} onPointerEnter={event=>{if (event.pointerType==="mouse")setHovered(n);}}>
        <input type="radio" name="extra-rating" value={n} checked={value === n} onChange={() => setValue(n)} />
        <svg viewBox="0 0 24 24" aria-hidden="true" data-filled={n <= shown || undefined}>
          <path d="m12 3 2.8 5.8 6.4.9-4.6 4.5 1.1 6.4-5.7-3-5.7 3 1.1-6.4-4.6-4.5 6.4-.9z" />
        </svg>
        <span className="extra-sr">{n} of 5</span>
      </label>)}
    </div>
    <p className="extra-rating-roll" aria-label={value ? `${value} of 5 selected` : "Choose a rating"}>
      <span aria-hidden="true">{["Choose a rating", ...[1,2,3,4,5].map(n=>`${n} of 5 selected`)]
        .map(text=><span key={text}>{text}</span>)}</span>
    </p>
    <Button size="compact" emphasis="quiet" onClick={() => {setHovered(0);setValue(0);}}>Clear</Button>
  </fieldset>;
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
  return <div className="extra-gesture"><label htmlFor="extra-date">Choose a date</label><input id="extra-date" type="date" value={date} onChange={e => setDate(e.target.value)}/><p role="status" className="extra-date-result"><span key={date}>{date ? `Selected: ${date}` : "No date selected"}</span></p><Button size="compact" emphasis="quiet" onClick={() => setDate("")}>Clear</Button></div>;
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
