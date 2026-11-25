"use client";
import type { CSSProperties, ReactNode } from "react";
import { Progress as SDKProgress } from "@ui-sdk/react/progress";
import { cx, type Tone, Heading, Icon, Stack } from "../foundation/foundation.js";
import { IconButton } from "./actions.js";

export function Badge({
  children,
  tone = "neutral",
  variant = "soft",
  dot,
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  variant?: "soft" | "outline";
  dot?: boolean;
  className?: string;
}) {
  const isNumeric = typeof children === "number" || (typeof children === "string" && /^\d+$/.test(children.trim()));
  const showDot = dot ?? !isNumeric;
  return (
    <span
      className={cx("yg-badge", className)}
      data-tone={tone}
      data-variant={variant}
      data-dot={showDot ? "true" : undefined}
    >
      {showDot && <span className="yg-badge-dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
export function Status({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Exclude<Tone, "accent">;
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
  tone = "neutral",
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
  presentation = "bar",
  segments = 16,
  valueLabel,
}: {
  label: string;
  value?: number;
  max?: number;
  presentation?: "bar" | "segmented";
  segments?: number;
  valueLabel?: string;
}) {
  const limit = Number.isFinite(max) ? Math.max(1, max) : 100;
  const current =
    value !== undefined && Number.isFinite(value)
      ? Math.min(limit, Math.max(0, value))
      : undefined;
  const completion = current === undefined ? undefined : current / limit;
  const count = Math.min(32, Math.max(4, Math.round(segments)));
  const filled =
    completion === undefined ? 0 : Math.min(count, Math.max(0, Math.round(completion * count)));
  return (
    <label className="yg-progress" data-presentation={presentation}>
      <span>
        {label}
        {(valueLabel !== undefined || completion !== undefined) && (
          <span className="yg-meta" aria-hidden="true">
            {valueLabel ?? `${Math.round((completion ?? 0) * 100)}%`}
          </span>
        )}
      </span>
      <SDKProgress value={current ?? null} max={limit}
        render={(props) => <progress {...props} value={current} max={limit} />} />
      {presentation === "segmented" ? (
        <span
          className="yg-progress-segments"
          aria-hidden="true"
          style={{ "--yg-progress-segments": count } as CSSProperties}
        >
          {Array.from({ length: count }, (_, i) => {
            const state =
              filled === 0
                ? "empty"
                : i < filled - 1
                  ? "filled"
                  : i === filled - 1
                    ? filled === count
                      ? "filled"
                      : "active"
                    : "empty";
            return <span key={i} className="yg-progress-segment" data-state={state} />;
          })}
        </span>
      ) : (
        <span
          className="yg-progress-track"
          aria-hidden="true"
          style={{ "--yg-progress-completion": completion } as CSSProperties}
        >
          <span />
        </span>
      )}
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
