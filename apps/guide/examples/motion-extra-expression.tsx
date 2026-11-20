import { useEffect, useState, type ReactNode } from "react";

function Dock() {
  const [selected, setSelected] = useState("Home");
  return <div className="expression"><div className="expression-dock" aria-label="Choose a destination">{["Home", "Notes", "Explore", "Saved"].map((name, i) => <button key={name} type="button" aria-pressed={selected === name} onClick={() => setSelected(name)}><span aria-hidden="true">{["⌂", "✎", "✦", "◇"][i]}</span><small>{name}</small></button>)}</div><p role="status">{selected} selected</p></div>;
}
function Cord() {
  const [lit, setLit] = useState(false);
  return <div className="expression expression-cord" data-lit={lit}><div className="expression-lamp" aria-hidden="true"/><button type="button" aria-pressed={lit} onClick={() => setLit(!lit)}><span aria-hidden="true"/>Pull to turn {lit ? "off" : "on"}</button><p>{lit ? "Light on" : "Light off"}</p></div>;
}
function Magnetic() {
  const [saved, setSaved] = useState(false);
  return <div className="expression"><p>A little idea worth keeping.</p><button className="expression-magnet" type="button" aria-pressed={saved} onClick={() => setSaved(!saved)}>{saved ? "Saved ✓" : "Save idea +"}</button></div>;
}
function Burst() {
  const [count, setCount] = useState(0);
  return <div className="expression"><div className="expression-burst-wrap"><button className="expression-burst" onClick={() => setCount(count + 1)} aria-label="Send a cheer">✦</button>{count > 0 && <span key={count} className="expression-sparks" aria-hidden="true"><i>✦</i><i>·</i><i>✧</i><i>·</i></span>}</div><p role="status">{count === 0 ? "Send a cheer" : `${count} ${count === 1 ? "cheer" : "cheers"} sent`}</p><button onClick={() => setCount(0)}>Reset</button></div>;
}
function WordRoll() {
  const words = ["curious", "open", "patient"];
  const [index, setIndex] = useState(0);
  return <div className="expression"><p className="expression-type">Stay <span className="expression-word" key={index}>{words[index]}</span>.</p><button onClick={() => setIndex((index + 1) % words.length)}>Next word</button></div>;
}
function WeightWave() {
  const [wave, setWave] = useState(0);
  return <div className="expression"><p className="expression-weight" aria-label="Make space">{[..."Make space"].map((c, i) => <span key={`${wave}-${i}`} style={{animationDelay: `${i * 55}ms`}} aria-hidden="true">{c === " " ? "\u00a0" : c}</span>)}</p><button onClick={() => setWave(wave + 1)}>Make a wave</button></div>;
}
function Typed() {
  const [run, setRun] = useState(0);
  return <div className="expression"><p className="expression-typewriter" key={run}>A fresh thought takes shape.</p><button onClick={() => setRun(run + 1)}>Write again</button></div>;
}
function Scramble() {
  const words = ["WONDER", "NOTICE", "CREATE"];
  const [target, setTarget] = useState(0), [display, setDisplay] = useState(words[0]);
  useEffect(() => {
    const word = words[target];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setDisplay(word); return; }
    let step = 0;
    const timer = window.setInterval(() => {
      step += 1;
      setDisplay([...word].map((letter, i) => i < step ? letter : "·+✳×"[(step + i) % 4]).join(""));
      if (step >= word.length) window.clearInterval(timer);
    }, 70);
    return () => window.clearInterval(timer);
  }, [target]);
  return <div className="expression"><p className="expression-scramble" aria-label={words[target]}>{display}</p><button onClick={() => setTarget((target + 1) % words.length)}>Reveal another word</button></div>;
}
function Lens() {
  const [zoom, setZoom] = useState(100);
  return <div className="expression"><div className="expression-lens"><span style={{transform: `scale(${zoom / 100})`}}>✳</span></div><label>Lens size <input type="range" min="70" max="150" value={zoom} onChange={e => setZoom(Number(e.target.value))}/></label><output>{zoom}%</output></div>;
}
function MorphMenu() {
  const [open, setOpen] = useState(false), [choice, setChoice] = useState("Nothing selected");
  return <div className="expression"><button className="expression-menu-trigger" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "Close ×" : "Explore +"}</button><div className="expression-menu" data-open={open} hidden={!open}>{["Sketch", "Write", "Collect"].map(item => <button key={item} onClick={() => { setChoice(item); setOpen(false); }}>{item}</button>)}</div><p role="status">{choice}</p></div>;
}
function Attention() {
  const [on, setOn] = useState(false);
  return <div className="expression"><button className="expression-attention" data-on={on} aria-pressed={on} onClick={() => setOn(!on)}>{on ? "Attention on" : "Bring attention"}</button><p>{on ? "This action is highlighted." : "Highlight the action when needed."}</p></div>;
}
export const extraExpression: {id: string; title: string; body: ReactNode}[] = [
  {id: "rubber-dock", title: "Elastic dock", body: <Dock />},
  {id: "pull-cord", title: "Pull cord", body: <Cord />},
  {id: "magnetic-press", title: "Magnetic press", body: <Magnetic />},
  {id: "reaction-burst", title: "Reaction burst", body: <Burst />},
  {id: "word-roll", title: "Word roll", body: <WordRoll />},
  {id: "weight-wave", title: "Weight wave", body: <WeightWave />},
  {id: "typewriter", title: "Typewriter", body: <Typed />},
  {id: "scramble-text", title: "Scramble text", body: <Scramble />},
  {id: "responsive-lens", title: "Responsive lens", body: <Lens />},
  {id: "morph-menu", title: "Morph menu", body: <MorphMenu />},
  {id: "attention-ring", title: "Attention ring", body: <Attention />},
];
