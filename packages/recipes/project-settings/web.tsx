"use client";
import { useId } from "react";
import {
  Button,
  ButtonGroup,
  Card,
  FieldError,
  FieldGroup,
  Select,
  Stack,
  Switch,
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
  const formId = useId();
  const dirty = draft.digest !== saved.digest || draft.notify !== saved.notify;
  return (
    <Card
      title="Project settings"
      description="Control how and when project updates are delivered."
      action={
        <ButtonGroup label="Settings actions" justify="end">
          <Button
            emphasis="quiet"
            disabled={!dirty || pending}
            onClick={() => onChange(saved)}
          >
            Discard
          </Button>
          <Button
            type="submit"
            form={formId}
            emphasis="filled"
            tone="brand"
            disabled={!dirty}
            pending={pending}
            pendingLabel="Saving"
          >
            Save changes
          </Button>
        </ButtonGroup>
      }
    >
      <form
        id={formId}
        aria-label="Project settings"
        onSubmit={(e) => {
          e.preventDefault();
          if (dirty && !pending) onSave(draft);
        }}
      >
        <Stack gap={12}>
          <FieldGroup legend="Notifications">
            <div className="yg-settings-grid">
              <Switch
                label="Send a digest"
                help="Deliver a summary of project activity and review items."
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
                onValueChange={(next) =>
                  onChange({
                    ...draft,
                    digest: next as Preferences["digest"],
                  })
                }
              />
            </div>
          </FieldGroup>
          {error && <FieldError role="alert">{error}</FieldError>}
        </Stack>
      </form>
    </Card>
  );
}
