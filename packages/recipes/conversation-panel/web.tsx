"use client";
import type { ReactNode } from "react";
import {
  Composer,
  Message,
  Stack,
  Transcript,
} from "@openboa/yogurt";

export interface ThreadMessage {
  id: string;
  speaker: string;
  body: string;
  time?: string;
  dateTime?: string;
  variant?: "sent" | "received";
  avatar?: ReactNode;
  actions?: ReactNode;
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
  return (
    <Stack gap={12} className="yg-conversation-panel">
      <Transcript label="Conversation" revision={revision} readingAnchor="when-away">
        {messages.map((m) => (
          <Message
            key={m.id}
            speaker={m.speaker}
            time={m.time}
            dateTime={m.dateTime}
            variant={m.variant ?? (m.speaker === "You" ? "sent" : "received")}
            avatar={m.avatar}
            actions={m.actions}
          >
            {m.body}
          </Message>
        ))}
      </Transcript>
      <Composer
        label="Message"
        sendTone="neutral"
        value={draft}
        onValueChange={onDraftChange}
        pending={pending}
        onStop={onStop}
        onSend={({ text }) => {
          if (text) onSend(text);
        }}
      />
    </Stack>
  );
}
