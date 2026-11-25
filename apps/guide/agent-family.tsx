import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AgentAvatar, agentPresenceLabels, Button, ButtonGroup, getAgentFamily, Grid,
  Heading, Inline, PageHeader, Select, Stack, Text, Yogurt, type AgentColor, type AgentVariant,
} from "@openboa/yogurt";
import motion from "../../design/assets/agents/avatar-motion.json";

const { colors: agentColors, shapes: agentShapes, variants: agentVariants } = getAgentFamily();

type Presence = keyof typeof agentPresenceLabels;
type Shape = keyof typeof agentShapes;
const shapes = Object.keys(agentShapes) as Shape[];
const states = Object.keys(agentPresenceLabels) as Presence[];
const variants = Object.keys(agentVariants) as AgentVariant[];
const byShape = Object.fromEntries(shapes.map(shape => [shape, variants.filter(id => agentVariants[id].shape === shape)])) as Record<Shape, AgentVariant[]>;

export function AgentFamily() {
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
      <PageHeader title="Agent family" detail="Explore the shapes and play through each agent state." />
      <Grid className="family-controls" gap={12}>
        <Select label="Agent state" value={state}
          options={states.map(id => ({ id, label: agentPresenceLabels[id] }))}
          onValueChange={next => selectState(next as Presence)} />
        <Select label="Color" value={color ?? ""}
          options={[{ id: "", label: "Original colors" }, ...Object.keys(agentColors).map(id => ({ id, label: id }))]}
          onValueChange={next => setColor(next === "" ? undefined : next as AgentColor)} />
        <ButtonGroup label="Agent playback">
          <Button emphasis="soft" onClick={() => setReplay(value => value + 1)}>Replay state</Button>
          <Button onClick={playSequence}>{playing ? "Stop sequence" : "Play sequence"}</Button>
        </ButtonGroup>
      </Grid>
      <section aria-label="Detail preview" className="family-detail">
        <Inline><Heading>{agentShapes[shape].name}</Heading><Text variant="meta">96 px</Text></Inline>
        <Inline className="family-detail-pair" gap={16} key={replay}>
          {byShape[shape].map(id => (
            <Stack key={id} data-detail-variant={id}>
              <AgentAvatar agent={id} color={color} size={96} state={state} label="" />
              <Text>{agentVariants[id].notch}</Text>
            </Stack>
          ))}
        </Inline>
      </section>
      <section aria-label="Roster preview">
        <Inline><Heading>Roster</Heading><Text variant="meta">24 px</Text></Inline>
        <Grid className="family-roster" gap={8}>
          {shapes.map(id => (
            <Button key={id} emphasis={id === shape ? "soft" : "quiet"} aria-pressed={id === shape} onClick={() => setShape(id)}>
              <Text>{agentShapes[id].name}</Text>
              <span className="family-notch-row" key={replay}>
                {byShape[id].map(variant => (
                  <span key={variant} data-roster-variant={variant}>
                    <AgentAvatar agent={variant} color={color} state={state} size={24} label="" />
                  </span>
                ))}
              </span>
            </Button>
          ))}
        </Grid>
      </section>
    </main>
  );
}

const host = document.getElementById("yogurt-agent-family");
if (host) createRoot(host).render(<Yogurt><AgentFamily /></Yogurt>);
