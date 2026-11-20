"use client";
import type { CSSProperties, ReactNode } from "react";
import { Badge as SDKBadge } from "@openai/apps-sdk-ui/components/Badge";
import { type Tone, Heading, Icon, Stack } from "../foundation/foundation.js";
import { IconButton } from "./actions.js";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <SDKBadge className="yg-badge" data-tone={tone}>
      {children}
    </SDKBadge>
  );
}
export function Status({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span className="yg-status" data-tone={tone} role="status">
      <span aria-hidden="true" className="yg-status-dot" />
      {children}
    </span>
  );
}
export function Notice({
  title,
  children,
  tone = "brand",
  action,
  urgent = false,
}: {
  title: string;
  children?: ReactNode;
  tone?: Tone;
  action?: ReactNode;
  urgent?: boolean;
}) {
  return (
    <div
      className="yg-notice"
      data-tone={tone}
      role={urgent ? "alert" : "note"}
    >
      <Icon name="info" />
      <div>
        <strong>{title}</strong>
        {children && <div>{children}</div>}
        {action}
      </div>
    </div>
  );
}
export function Skeleton({
  label = "Loading",
  lines = 2,
}: {
  label?: string;
  lines?: number;
}) {
  return (
    <div role="status" aria-label={label} className="yg-skeleton">
      {Array.from({ length: Math.min(8, Math.max(1, lines)) }, (_, i) => (
        <span key={i} aria-hidden="true" />
      ))}
    </div>
  );
}
export function Progress({
  label,
  value,
  max = 100,
}: {
  label: string;
  value?: number;
  max?: number;
}) {
  const limit = Number.isFinite(max) ? Math.max(1, max) : 100;
  const current =
    value !== undefined && Number.isFinite(value)
      ? Math.min(limit, Math.max(0, value))
      : undefined;
  const completion = current === undefined ? undefined : current / limit;
  return (
    <label className="yg-progress">
      <span>
        {label}
        {completion !== undefined && (
          <span className="yg-meta" aria-hidden="true">
            {Math.round(completion * 100)}%
          </span>
        )}
      </span>
      <progress value={current} max={limit} />
      <span
        className="yg-progress-track"
        aria-hidden="true"
        style={{ "--yg-progress-completion": completion } as CSSProperties}
      >
        <span />
      </span>
    </label>
  );
}
export function Toast({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div className="yg-toast">
      <span role="status">{message}</span>
      <IconButton
        label="Dismiss notification"
        icon="close"
        onClick={onDismiss}
      />
    </div>
  );
}
export function Result({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Stack className="yg-result" gap={8}>
      <Heading level={3}>{title}</Heading>
      {children && <div className="yg-help">{children}</div>}
      {action && <div>{action}</div>}
    </Stack>
  );
}
