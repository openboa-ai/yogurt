"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { Attachment } from "./editorial.js";
import { ActionMenu } from "../controls/layers.js";
import { Button } from "../controls/actions.js";
import { PromptAction, PromptEditor } from "./prompt-shared.js";
import { MentionOptions, useMention } from "./mention-controller.js";

export interface DraftAttachment {
  id: string;
  name: string;
  detail?: string;
  progress?: number;
}

export interface ComposerTool {
  id: string;
  label: string;
  disabled?: boolean;
}

export function Composer({
  value,
  onValueChange,
  onSend,
  attachments = [],
  onRemoveAttachment,
  onAddAttachment,
  tools = [],
  onTool,
  pending = false,
  onStop,
  label = "Message",
  toolLabel = "Tools",
  error,
  companion,
  mentionPeople,
}: {
  value: string;
  onValueChange: (value: string) => void;
  onSend: (message: { text: string; attachmentIds: string[] }) => void;
  attachments?: readonly DraftAttachment[];
  onRemoveAttachment?: (id: string) => void;
  onAddAttachment?: () => void;
  tools?: readonly ComposerTool[];
  onTool?: (id: string) => void;
  pending?: boolean;
  onStop?: () => void;
  label?: string;
  toolLabel?: string;
  error?: string;
  companion?: ReactNode;
  mentionPeople?: readonly { id: string; label: string }[];
}) {
  const id = useId();
  const mention = useMention({ people: mentionPeople, value, onChange: onValueChange, collapsedOnly: true });
  const composingRef = useRef(false);
  const [composing, setComposing] = useState(false);
  const text = value.trim();
  const ready = !pending && !composing && (text.length > 0 || attachments.length > 0)
    && attachments.every((item) => item.progress == null || item.progress >= 100);
  return (
    <form className="yg-composer yg-prompt-shared" aria-label={label + " composer"} aria-busy={pending || undefined}
      onSubmit={(event) => {
        event.preventDefault();
        if (ready && !composingRef.current) onSend({ text, attachmentIds: attachments.map((item) => item.id) });
      }}>
      {attachments.length > 0 && (
        <ul className="yg-composer-sources" aria-label="Attachments">
          {attachments.map((item) => (
            <li key={item.id}>
              <Attachment name={item.name} detail={item.detail} progress={item.progress}
                onRemove={onRemoveAttachment && (() => onRemoveAttachment(item.id))} />
            </li>
          ))}
        </ul>
      )}
      <PromptEditor presentation="composer" id={id} aria-label={label} aria-describedby={error ? id + "-error" : undefined}
        placeholder={label} rows={2} value={value}
        {...(mentionPeople === undefined ? {
          onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => onValueChange(event.currentTarget.value),
        } : mention.editorProps)}
        onCompositionStart={event => {
          composingRef.current = true;
          setComposing(true);
          mention.editorProps.onCompositionStart?.(event);
        }}
        onCompositionEnd={event => {
          composingRef.current = false;
          setComposing(false);
          mention.editorProps.onCompositionEnd?.(event);
        }}
        inputRef={mentionPeople === undefined ? undefined : mention.input}
        after={mentionPeople === undefined ? undefined : <MentionOptions mention={mention} />} />
      {error && <span className="yg-field-error" id={id + "-error"} role="alert">{error}</span>}
      <div className="yg-composer-footer">
        <div className="yg-composer-tools">
          {onAddAttachment && (
            <Button emphasis="quiet" onClick={onAddAttachment} disabled={pending}>Attach</Button>
          )}
          {!pending && onTool && tools.length > 0 && (
            <ActionMenu label={toolLabel} items={[...tools]} onSelect={onTool} />
          )}
        </div>
        <div className="yg-composer-tools">
          {companion}
          <PromptAction presentation="composer" busy={pending} ready={ready} onStop={onStop}
            renderComposer={(button, stopping) => stopping
              ? <Button key="stop" ref={button} className="yg-shared-action" emphasis="soft" onClick={onStop}>Stop</Button>
              : <Button key="send" ref={button} className="yg-shared-action" type="submit" disabled={!ready} pending={pending} pendingLabel="Sending">Send</Button>} />
        </div>
      </div>
    </form>
  );
}

export type VoiceState = "idle" | "recording" | "review" | "unavailable";

export function VoiceControl({
  state,
  duration,
  preview,
  onStart,
  onStop,
  onSend,
  onDiscard,
}: {
  state: VoiceState;
  duration?: string;
  preview?: ReactNode;
  onStart?: () => void;
  onStop?: () => void;
  onSend?: () => void;
  onDiscard?: () => void;
}) {
  const labels: Record<VoiceState, string> = {
    idle: "Ready to record",
    recording: "Recording",
    review: "Review voice note",
    unavailable: "Voice unavailable",
  };
  return (
    <section className="yg-voice" aria-label="Voice note" data-state={state}>
      <span className="yg-voice-state" role="status">{labels[state]}</span>
      {duration && <span className="yg-meta" aria-label={"Duration " + duration}>{duration}</span>}
      {state === "review" && preview}
      {state === "idle" && onStart && <Button emphasis="soft" onClick={onStart}>Record</Button>}
      {state === "recording" && onStop && <Button emphasis="soft" onClick={onStop}>Stop recording</Button>}
      {state === "review" && onSend && <Button onClick={onSend}>Send voice note</Button>}
      {state !== "idle" && state !== "unavailable" && onDiscard &&
        <Button emphasis="quiet" onClick={onDiscard}>Discard voice note</Button>}
    </section>
  );
}
