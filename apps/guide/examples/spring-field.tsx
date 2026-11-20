import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Icon } from "@openboa/yogurt";
import { playSprings, snap, spring } from "../../../packages/web/src/foundation/spring-motion.js";

type Glyph = {id: number; text: string; delay: number};
type Removed = Glyph & {left: number};

export function SpringInputExample() {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const layer = useRef<HTMLSpanElement>(null);
  const caret = useRef<HTMLSpanElement>(null);
  const nextId = useRef(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [value, setValue] = useState("");
  const [glyphs, setGlyphs] = useState<Glyph[]>([]);
  const [removed, setRemoved] = useState<Removed[]>([]);
  const [selection, setSelection] = useState({start: 0, end: 0, scroll: 0});
  const [focused, setFocused] = useState(false);
  const [composing, setComposing] = useState(false);
  const [result, setResult] = useState<"idle" | "invalid" | "flying" | "done">("idle");
  const [caretMotion] = useState(() => spring(0,700,32));
  const showMirror = !composing && selection.start === selection.end;

  useEffect(() => () => clearTimeout(timeout.current), []);
  useLayoutEffect(() => {
    const stripe = caret.current, text = layer.current;
    if (!stripe || !text) return;
    const rows = text.querySelectorAll<HTMLElement>("[data-glyph]");
    const next = Array.from(value.slice(0, selection.end)).length;
    const last = rows[rows.length - 1];
    caretMotion.target = rows[next]?.offsetLeft ?? (last ? last.offsetLeft + last.offsetWidth : 0);
    if (!focused) snap(caretMotion, caretMotion.target);
    return playSprings([caretMotion], () => {
      const stretch = Math.min(Math.abs(caretMotion.velocity) / 80, 7);
      stripe.style.translate = `${caretMotion.position - (caretMotion.velocity > 0 ? stretch : 0)}px 0`;
      stripe.style.inlineSize = `${2 + stretch}px`;
    });
  }, [caretMotion, focused, selection.end, value]);

  function follow(element: HTMLInputElement) {
    setSelection({start:element.selectionStart ?? 0,end:element.selectionEnd ?? 0,scroll:element.scrollLeft});
  }

  function edit(next: string) {
    const letters = Array.from(next);
    let prefix = 0, suffix = 0;
    while (prefix < letters.length && prefix < glyphs.length && letters[prefix] === glyphs[prefix].text) prefix++;
    while (suffix < letters.length - prefix && suffix < glyphs.length - prefix &&
      letters[letters.length - 1 - suffix] === glyphs[glyphs.length - 1 - suffix].text) suffix++;
    const before = glyphs.slice(0,prefix);
    const after = glyphs.slice(glyphs.length - suffix);
    const added = letters.slice(prefix, letters.length - suffix).map((text,i) => ({
      id:nextId.current++, text, delay:Math.min(i, 30) * 18,
    }));
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const nodes = layer.current?.querySelectorAll<HTMLElement>("[data-glyph]");
      const deleted = glyphs.slice(prefix, glyphs.length - suffix).map((glyph,i) => ({...glyph,left:nodes?.[prefix+i]?.offsetLeft ?? 0}));
      if (deleted.length) setRemoved(items=>[...items,...deleted]);
    }
    setGlyphs([...before,...added,...after]);
    setValue(next);
    setResult("idle");
  }

  function submit() {
    if (result === "flying" || result === "done") return;
    if (value.trim().length < 2) {
      setResult("invalid");
      input.current?.focus();
      return;
    }
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) setResult("done");
    else {
      setResult("flying");
      timeout.current = setTimeout(() => setResult("done"), 250 + glyphs.length * 16);
    }
    input.current?.blur();
  }

  return <form className="motion-spring-field" data-result={result} onSubmit={e=>{e.preventDefault();submit();}}>
    <label htmlFor={id}>Name this workspace</label>
    <div className="motion-spring-field-control">
      <div className="motion-spring-field-edit" data-mirror={showMirror || undefined}>
        <input ref={input} id={id} aria-invalid={result === "invalid" || undefined}
          aria-describedby={result === "invalid" ? `${id}-feedback` : undefined}
          data-mirror={showMirror || undefined} value={value} readOnly={result === "flying" || result === "done"}
          onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
          onCompositionStart={()=>setComposing(true)} onCompositionEnd={e=>{setComposing(false);follow(e.currentTarget);}}
          onChange={e=>{edit(e.currentTarget.value);follow(e.currentTarget);}}
          onSelect={e=>follow(e.currentTarget)} onScroll={e=>follow(e.currentTarget)} />
        <span className="motion-spring-field-window" aria-hidden="true">
          <span className="motion-spring-glyphs" ref={layer} style={{translate:`${-selection.scroll}px 0`}}>
            {glyphs.map((glyph,index)=><span className="motion-spring-glyph" data-glyph="" key={glyph.id}
              style={{"--yg-glyph-delay":`${result === "idle" ? glyph.delay : index*16}ms`} as CSSProperties}>
              {glyph.text}</span>)}
            {removed.map(glyph=><span className="motion-spring-removed" key={glyph.id}
              style={{left:glyph.left}} onAnimationEnd={()=>setRemoved(items=>items.filter(item=>item.id!==glyph.id))}>
              {glyph.text}</span>)}
            <span className="motion-spring-caret" ref={caret} data-visible={focused || undefined} />
          </span>
        </span>
      </div>
      <button type={result === "done" ? "button" : "submit"} aria-label={result === "done" ? "Rename workspace" : "Use name"}
        onClick={result === "done" ? ()=>{edit("");input.current?.focus();} : undefined}><Icon name={result === "done" ? "check" : "arrow"} /></button>
    </div>
    <span id={`${id}-feedback`} role="status">
      {result === "invalid" ? "Enter at least two characters." : result === "done" ? "Workspace named" : ""}
    </span>
  </form>;
}
