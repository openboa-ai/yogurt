import { useState } from "react";
import { createRoot } from "react-dom/client";
import { AgentAvatar, Button, Heading, Stack, Text, Yogurt, agentPresenceLabels } from "@openboa/yogurt";
import { AgentMotionExample } from "./examples/agent-motion-example";

const comparisonStates = ["thinking", "working", "waiting"] as const;

function MotionReview() {
  const [replay, setReplay] = useState(0);
  return (
    <Yogurt className="motion-review" appearance="auto">
      <section aria-labelledby="motion-presence-heading">
        <Stack gap={16}>
          <Heading id="motion-presence-heading">Agent presence</Heading>
          <AgentMotionExample both />
          <section className="agent-motion-comparison" aria-label="Compare at 24 px">
            <div className="agent-motion-comparison-heading">
              <Text>Compare at 24 px</Text>
              <Button size="compact" emphasis="soft" onClick={() => setReplay(value => value + 1)}>
                Replay comparison
              </Button>
            </div>
            <div className="agent-motion-comparison-row" key={replay}>
              {comparisonStates.map(state => (
                <div className="agent-motion-comparison-sample" key={state}>
                  <AgentAvatar agent="Kai" size={24} state={state} label="" />
                  <Text variant="help">{agentPresenceLabels[state]}</Text>
                </div>
              ))}
            </div>
          </section>
        </Stack>
      </section>
    </Yogurt>
  );
}
const host = document.getElementById("yogurt-motion-review");
if (host) createRoot(host).render(<MotionReview />);
