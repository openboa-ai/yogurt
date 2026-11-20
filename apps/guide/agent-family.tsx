import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import motion from "../../assets/agents/avatar-motion.json";
import { AgentAvatar, getAgentFamily, type AgentColor, type AgentVariant } from "../../packages/web/src/identity/identity.js";
import { agentPresenceLabels } from "../../packages/web/src/identity/agent-motion-data.js";

const { colors: agentColors, shapes: agentShapes, variants: agentVariants } = getAgentFamily();

type Presence = keyof typeof agentPresenceLabels;
type Shape = keyof typeof agentShapes;
const shapes = Object.keys(agentShapes) as Shape[];
const states = Object.keys(agentPresenceLabels) as Presence[];
const variants = Object.keys(agentVariants) as AgentVariant[];
const byShape = Object.fromEntries(shapes.map(shape => [shape, variants.filter(id => agentVariants[id].shape === shape)])) as Record<Shape, AgentVariant[]>;

function AgentFamily() {
  const [shape, setShape] = useState<Shape>("kai");
  const [state, setState] = useState<Presence>("ready");
  const [color, setColor] = useState<AgentColor>();
  const [replay, setReplay] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  function selectState(state: Presence) {
    clearTimeout(timer.current);
    setPlaying(false);
    setState(state);
  }

  function playSequence() {
    if (playing) {
      selectState("ready");
      return;
    }
    setPlaying(true);
    setReplay(value => value + 1);
    const sequence: Presence[] = ["thinking", "working", "waiting", "blocked", "done", "ready"];
    function show(index: number) {
      const current = sequence[index];
      if (!current) {
        setPlaying(false);
        return;
      }
      setState(current);
      timer.current = setTimeout(() => show(index + 1), motion.clips[current].duration + 240);
    }
    show(0);
  }

  return (
    <main data-family>
      <h1>Agent family</h1>
      <div className="family-controls">
        <label>Agent state
          <select value={state} onChange={event => selectState(event.currentTarget.value as Presence)}>
            {states.map(id => <option value={id} key={id}>{agentPresenceLabels[id]}</option>)}
          </select>
        </label>
        <label>Color
          <select value={color ?? ""} onChange={event => setColor((event.currentTarget.value || undefined) as AgentColor | undefined)}>
            <option value="">Original colors</option>
            {(Object.keys(agentColors) as AgentColor[]).map(token => <option value={token} key={token}>{token}</option>)}
          </select>
        </label>
        <button type="button" className="family-sequence" onClick={playSequence}>{playing ? "Stop sequence" : "Play sequence"}</button>
        <button type="button" onClick={() => setReplay(value => value + 1)}>Replay state</button>
      </div>
      <section aria-label="Detail preview" className="family-detail">
        <h2>{agentShapes[shape].name} <span>96 px</span></h2>
        <div className="family-detail-pair" key={replay}>
          {byShape[shape].map(id => (
            <div key={id} data-detail-variant={id}>
              <AgentAvatar agent={id} color={color} size={96} state={state} label="" />
              <span>{agentVariants[id].notch}</span>
            </div>
          ))}
        </div>
      </section>
      <section aria-label="Roster preview">
        <h2>Roster <span>24 px</span></h2>
        <div className="family-roster">
          {shapes.map(id => (
            <button key={id} type="button" aria-pressed={id === shape} onClick={() => setShape(id)}>
              <span>{agentShapes[id].name}</span>
              <span className="family-notch-row" key={replay}>
                {byShape[id].map(variant => (
                  <span key={variant} data-roster-variant={variant}>
                    <AgentAvatar agent={variant} color={color} state={state} size={24} label="" />
                  </span>
                ))}
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("yogurt-agent-family")!).render(<AgentFamily />);
