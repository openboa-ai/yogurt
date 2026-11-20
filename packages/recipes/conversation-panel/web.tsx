"use client";
import {
  Button,
  ButtonGroup,
  Message,
  Stack,
  Textarea,
  Transcript,
} from "@openboa/yogurt";
export interface ThreadMessage {
  id: string;
  speaker: string;
  body: string;
  time?: string;
  dateTime?: string;
}
export function ConversationPanel({
  messages,
  revision,
  draft,
  onDraftChange,
  onSend,
  pending = false,
  onStop,
}: {
  messages: ThreadMessage[];
  revision: string | number;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: (value: string) => void;
  pending?: boolean;
  onStop?: () => void;
}) {
  const ready = !!draft.trim() && !pending;
  function send() {
    if (ready) onSend(draft.trim());
  }
  return (
    <Stack gap={16}>
      <Transcript label="Conversation" revision={revision}>
        {messages.map((m) => (
          <Message
            key={m.id}
            speaker={m.speaker}
            time={m.time}
            dateTime={m.dateTime}
          >
            {m.body}
          </Message>
        ))}
      </Transcript>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <Stack>
          <Textarea
            label="Message"
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                (e.metaKey || e.ctrlKey) &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                send();
              }
            }}
          />
          <ButtonGroup label="Message actions">
            <Button type="submit" disabled={!ready}>
              Send
            </Button>
            {pending && onStop && (
              <Button emphasis="quiet" onClick={onStop}>
                Stop
              </Button>
            )}
          </ButtonGroup>
        </Stack>
      </form>
    </Stack>
  );
}
