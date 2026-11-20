"use client";

import { useState } from "react";
import { Stack, Status } from "@openboa/yogurt";
import { AgentProfile, type AgentProfileDraft } from "../../../packages/recipes/agent-profile/web";

const initialProfile: AgentProfileDraft = {
  name: "Kai",
  appearance: "Kai",
  scopeId: "agent",
  instructions: "Draft release notes from reviewed changes and flag decisions that need me.",
};

const scopes = [
  { id: "agent", label: "This agent" },
  { id: "project", label: "Release workspace" },
];

export function AgentProfileExample() {
  const [saved, setSaved] = useState(initialProfile);
  const [draft, setDraft] = useState(initialProfile);
  const [message, setMessage] = useState("");

  return (
    <Stack gap={12}>
      <AgentProfile
        agentId="release-agent"
        draft={draft}
        saved={saved}
        scopes={scopes}
        onChange={(next) => {
          setDraft(next);
          setMessage("");
        }}
        onSave={(_agentId, next) => {
          setSaved(next);
          setDraft(next);
          setMessage("Profile saved");
        }}
      />
      {message && <Status tone="success">{message}</Status>}
    </Stack>
  );
}
