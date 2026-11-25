import { useEffect, useRef, useState } from "react";
import avatarMotion from "../../../design/assets/agents/avatar-motion.json";
import {
  AgentAvatar, Button, Inline, Select, Stack, Text, agentPresenceLabels,
  type AgentPresence,
} from "@openboa/yogurt";

const states = Object.keys(agentPresenceLabels) as AgentPresence[];
const options = states.map((id) => ({ id, label: agentPresenceLabels[id] }));
const sequence = ["thinking", "working", "waiting", "blocked", "done", "ready"] as const;

export function AgentMotionExample({ both = false, variation = false }) {
  const [state, setState] = useState<AgentPresence>("ready");
  const [playing, setPlaying] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function stop() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPlaying(false);
  }

  function play() {
    if (playing) {
      stop();
      setState("ready");
      return;
    }
    setPlaying(true);
    setState(sequence[0]);
    let elapsed = 0;
    timers.current = sequence.map((state, index) => {
      elapsed += avatarMotion.clips[state].duration + 260;
      return setTimeout(() => {
        const next = sequence[index + 1];
        if (next) setState(next);
        else stop();
      }, elapsed);
    });
  }

  return (
    <Stack gap={16}>
      <div className="agent-motion-stage">
        {(both ? ["Kai", "Sol"] as const : [variation ? "Sol" : "Kai"] as const).map((agent) => (
          <div className="agent-motion-sample" key={agent}>
            <AgentAvatar agent={agent} state={state} size={both ? 96 : 72} label="" />
            <Text>{agent}</Text>
          </div>
        ))}
      </div>
      {both && (
        <Inline gap={8} className="agent-motion-roster">
          <Text variant="help">Roster size</Text>
          <AgentAvatar agent="Kai" size={24} state={state} label="Kai" />
          <AgentAvatar agent="Sol" size={24} state={state} label="Sol" />
        </Inline>
      )}
      <Text variant="help" className="agent-motion-status" role="status">{agentPresenceLabels[state]}</Text>
      <div className="agent-motion-tools">
        <Select label="Agent state" options={options} value={state} onValueChange={(next) => {
          stop();
          setState(next as AgentPresence);
        }} />
        <Button emphasis="soft" onClick={play}>{playing ? "Stop sequence" : "Play sequence"}</Button>
      </div>
    </Stack>
  );
}
