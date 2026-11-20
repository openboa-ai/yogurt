"use client";
import {
  Button,
  ButtonGroup,
  Heading,
  Select,
  Stack,
  Switch,
  FieldError,
} from "@openboa/yogurt";
export type Preferences = { digest: "daily" | "weekly"; notify: boolean };
export function ProjectSettings({
  draft,
  saved,
  pending = false,
  error,
  onChange,
  onSave,
}: {
  draft: Preferences;
  saved: Preferences;
  pending?: boolean;
  error?: string;
  onChange: (draft: Preferences) => void;
  onSave: (draft: Preferences) => void;
}) {
  const dirty = draft.digest !== saved.digest || draft.notify !== saved.notify;
  return (
    <form
      aria-label="Project settings"
      onSubmit={(e) => {
        e.preventDefault();
        if (dirty && !pending) onSave(draft);
      }}
    >
      <Stack gap={16}>
        <Heading>Project settings</Heading>
        <Switch
          label="Send a digest"
          checked={draft.notify}
          disabled={pending}
          onCheckedChange={(notify) => onChange({ ...draft, notify })}
        />
        <Select
          label="Frequency"
          value={draft.digest}
          disabled={pending || !draft.notify}
          options={[
            { id: "daily", label: "Daily" },
            { id: "weekly", label: "Weekly" },
          ]}
          onChange={(e) =>
            onChange({
              ...draft,
              digest: e.target.value as Preferences["digest"],
            })
          }
        />
        {error && <FieldError role="alert">{error}</FieldError>}
        <ButtonGroup label="Settings actions">
          <Button
            type="submit"
            disabled={!dirty}
            pending={pending}
            pendingLabel="Saving"
          >
            Save changes
          </Button>
          <Button
            emphasis="quiet"
            disabled={!dirty || pending}
            onClick={() => onChange(saved)}
          >
            Discard
          </Button>
        </ButtonGroup>
      </Stack>
    </form>
  );
}
