"use client";
import { useId, useRef, useState } from "react";
import { MentionOptions, useMention } from "./mention-controller.js";

export function MentionPicker({ label, people, value, onChange }: {
  label: string;
  people: { id: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  const mention = useMention({ people, value, onChange });
  return <div className="yg-mention">
    <label className="yg-label" htmlFor={mention.id}>{label}</label>
    <div className="yg-mention-surface">
      <textarea id={mention.id} ref={mention.input} value={value} rows={2} placeholder="Write a comment"
        aria-describedby={`${mention.id}-hint`} {...mention.editorProps} />
      <span className="yg-mention-hint" id={`${mention.id}-hint`}>Type @ to mention</span>
      <MentionOptions mention={mention} />
    </div>
  </div>;
}

function acceptsFile(file: File, accept?: string) {
  const rules = accept?.split(",").map(rule => rule.trim().toLowerCase()).filter(Boolean) ?? [];
  if (!rules.length) return true;
  const name = file.name.toLowerCase(), type = file.type.toLowerCase();
  return rules.some(rule => rule.startsWith(".") ? name.endsWith(rule) : rule.endsWith("/*") ? type.startsWith(rule.slice(0, -1)) : type === rule);
}

export function FileDrop({ label, onFiles, accept, multiple = false, progress }: {
  label: string;
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  /** Caller-reported work on the selected files, as a fraction from zero to one. */
  progress?: number;
}) {
  const id = useId();
  const depth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("");
  const [accepted, setAccepted] = useState(false);
  const percent = accepted && progress !== undefined && Number.isFinite(progress)
    ? Math.round(Math.min(1, Math.max(0, progress)) * 100) : null;
  const processing = percent !== null && percent < 100;
  const complete = accepted && !processing;
  function receive(files: File[]) {
    if (!files.length) return;
    const allowed = files.filter(file => acceptsFile(file, accept));
    const selected = multiple ? allowed : allowed.slice(0, 1);
    const rejected = files.length - selected.length;
    setAccepted(selected.length > 0);
    setMessage(rejected ? `${rejected} ${rejected === 1 ? "file was" : "files were"} not added${accept ? ` (accepted: ${accept})` : ""}.` : `${selected.length} ${selected.length === 1 ? "file" : "files"} selected.`);
    if (selected.length) onFiles(selected);
  }
  const formats = accept?.split(",").map(rule => rule.trim()).filter(Boolean)
    .map(rule => rule.endsWith("/*") ? rule.split("/")[0] + " files" :
      (rule.split("/").at(-1) ?? rule).replace(/^\./, "").toUpperCase()).join(", ");
  return <div className="yg-file-drop-wrap">
    <span className="yg-label" id={`${id}-label`}>{label}</span>
    <label htmlFor={id} className="yg-file-drop" data-dragging={dragging || undefined}
      data-processing={processing || undefined} data-accepted={complete || undefined}
      onDragEnter={event => { event.preventDefault(); depth.current++; setDragging(true); }}
      onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; }}
      onDragLeave={event => { event.preventDefault(); depth.current = Math.max(0, depth.current - 1); if (!depth.current) setDragging(false); }}
      onDrop={event => { event.preventDefault(); depth.current = 0; setDragging(false); receive(Array.from(event.dataTransfer.files)); }}>
      <span className="yg-file-drop-core">
        <svg className="yg-file-drop-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 16V4m-4 4 4-4 4 4M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
        </svg>
        <svg className="yg-file-drop-check" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m5 12.5 4.5 4.5L19 7.5" pathLength="24" />
        </svg>
        {percent !== null && <span className="yg-file-drop-progress" data-complete={!processing || undefined}
          role="progressbar" aria-label="Preparing selected files" aria-valuemin={0} aria-valuemax={100}
          aria-valuenow={percent} aria-hidden={!processing || undefined}>
          <svg viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="33" pathLength="100" style={{strokeDashoffset: 100 - percent}} /></svg>
          <span>{percent}%</span>
        </span>}
      </span>
      <div className="yg-file-drop-copy">
        <strong key={processing ? "processing" : complete ? "complete" : "idle"}>{processing ? "Preparing files" : complete ? "Files selected" : "Drop files here"}</strong>
        <span id={`${id}-formats`}>{formats || "Choose a file from your device"}</span>
      </div>
      <input id={id} type="file" aria-labelledby={`${id}-label`} aria-describedby={`${id}-formats`} accept={accept} multiple={multiple} onChange={event => { receive(Array.from(event.currentTarget.files ?? [])); event.currentTarget.value = ""; }} />
    </label>
    <span className="yg-file-drop-status" role="status">{message}</span>
  </div>;
}
