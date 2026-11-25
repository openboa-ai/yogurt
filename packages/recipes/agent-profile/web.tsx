"use client";

import { useId } from "react";
import {
  AgentAvatar,
  Button,
  ButtonGroup,
  Card,
  FieldError,
  FieldGroup,
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
  const formId = useId();
  const dirty =
    draft.name !== saved.name ||
    draft.appearance !== saved.appearance ||
    draft.scopeId !== saved.scopeId ||
    draft.instructions !== saved.instructions;
  const scopeAvailable = scopes.some((scope) => scope.id === draft.scopeId && !scope.disabled);
  const canSave = dirty && draft.name.trim() !== "" && scopeAvailable;
  return (
    <Card
      title="Agent profile"
      description="Configure agent identity, memory scope, and working instructions."
      headerAction={
        <span aria-hidden="true">
          <AgentAvatar agent={draft.appearance} size={28} />
        </span>
      }
      action={
        <ButtonGroup label="Agent profile actions" justify="end">
          <Button emphasis="quiet" disabled={!dirty || pending} onClick={() => onChange(saved)}>
            Discard
          </Button>
          <Button
            type="submit"
            form={formId}
            emphasis="filled"
            tone="brand"
            disabled={!canSave}
            pending={pending}
            pendingLabel="Saving"
          >
            Save profile
          </Button>
        </ButtonGroup>
      }
    >
      <form
        id={formId}
        aria-label="Agent profile"
        onSubmit={(event) => {
          event.preventDefault();
          if (canSave && !pending) onSave(agentId, { ...draft, name: draft.name.trim() });
        }}
      >
        <Stack gap={12}>
          <FieldGroup legend="Identity">
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
              onValueChange={(appearance) => {
                if (appearance === "Kai" || appearance === "Sol") onChange({ ...draft, appearance });
              }}
            />
          </FieldGroup>
          <FieldGroup legend="Scope & instructions">
            <Select
              label="Memory scope"
              value={scopeAvailable ? draft.scopeId : ""}
              placeholder="Choose an available scope"
              help="Choose where this agent uses its working context."
              required
              options={scopes}
              disabled={pending}
              onValueChange={(scopeId) => onChange({ ...draft, scopeId })}
            />
            <Textarea
              label="Working instructions"
              value={draft.instructions}
              disabled={pending}
              rows={3}
              onChange={(event) => onChange({ ...draft, instructions: event.target.value })}
            />
          </FieldGroup>
          {error && <FieldError role="alert">{error}</FieldError>}
        </Stack>
      </form>
    </Card>
  );
}
