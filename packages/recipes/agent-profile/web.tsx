"use client";

import {
  AgentAvatar,
  Button,
  ButtonGroup,
  FieldError,
  Heading,
  Inline,
  Select,
  Stack,
  TextField,
  Textarea,
  type Option,
} from "@openboa/yogurt";

export interface AgentProfileDraft {
  name: string;
  appearance: "Kai" | "Sol";
  scopeId: string;
  instructions: string;
}

export function AgentProfile({
  agentId,
  draft,
  saved,
  scopes,
  onChange,
  onSave,
  pending = false,
  error,
}: {
  agentId: string;
  draft: AgentProfileDraft;
  saved: AgentProfileDraft;
  scopes: Option[];
  onChange: (draft: AgentProfileDraft) => void;
  onSave: (agentId: string, draft: AgentProfileDraft) => void;
  pending?: boolean;
  error?: string;
}) {
  const dirty =
    draft.name !== saved.name ||
    draft.appearance !== saved.appearance ||
    draft.scopeId !== saved.scopeId ||
    draft.instructions !== saved.instructions;
  const scopeAvailable = scopes.some((scope) => scope.id === draft.scopeId && !scope.disabled);
  const canSave = dirty && draft.name.trim() !== "" && scopeAvailable;
  return (
    <form
      aria-label="Agent profile"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSave && !pending) onSave(agentId, { ...draft, name: draft.name.trim() });
      }}
    >
      <Stack gap={16}>
        <Inline gap={12}>
          <span aria-hidden="true"><AgentAvatar agent={draft.appearance} size={44} /></span>
          <Heading>Agent profile</Heading>
        </Inline>
        <TextField
          label="Name"
          value={draft.name}
          disabled={pending}
          required
          onChange={(event) => onChange({ ...draft, name: event.target.value })}
        />
        <Select
          label="Silhouette"
          value={draft.appearance}
          disabled={pending}
          options={[
            { id: "Kai", label: "Kai" },
            { id: "Sol", label: "Sol" },
          ]}
          onChange={(event) => {
            const appearance = event.target.value;
            if (appearance === "Kai" || appearance === "Sol") onChange({ ...draft, appearance });
          }}
        />
        <Select
          label="Memory scope"
          value={scopeAvailable ? draft.scopeId : ""}
          placeholder="Choose an available scope"
          help="Choose where this agent uses its working context."
          required
          options={scopes}
          disabled={pending}
          onChange={(event) => onChange({ ...draft, scopeId: event.target.value })}
        />
        <Textarea
          label="Working instructions"
          value={draft.instructions}
          disabled={pending}
          rows={3}
          onChange={(event) => onChange({ ...draft, instructions: event.target.value })}
        />
        {error && <FieldError role="alert">{error}</FieldError>}
        <ButtonGroup label="Agent profile actions">
          <Button type="submit" disabled={!canSave} pending={pending} pendingLabel="Saving">
            Save profile
          </Button>
          <Button emphasis="quiet" disabled={!dirty || pending} onClick={() => onChange(saved)}>
            Discard
          </Button>
        </ButtonGroup>
      </Stack>
    </form>
  );
}
