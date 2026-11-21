"use client";
import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { Button as SDKButton } from "@ui-sdk/react/button";
import { cx, Icon, Inline, type ControlSize, type IconName, type Size } from "../foundation/foundation.js";

export type ButtonSize = ControlSize;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  emphasis?: "filled" | "soft" | "quiet";
  tone?: "neutral" | "brand" | "danger";
  size?: ButtonSize;
  shape?: "rounded" | "pill";
  pending?: boolean;
  pendingLabel?: string;
  ref?: Ref<HTMLButtonElement>;
}
export function Button({
  emphasis = "filled",
  tone = "neutral",
  size = "regular",
  shape = "rounded",
  pending = false,
  pendingLabel,
  children,
  type = "button",
  className,
  onClick,
  ...props
}: ButtonProps) {
  const blocked =
    pending ||
    props["aria-disabled"] === true ||
    props["aria-disabled"] === "true";
  const hasPendingLabel = Boolean(pendingLabel);
  return (
    <SDKButton
      {...props}
      type={type}
      className={cx("yg-button", className)}
      data-emphasis={emphasis}
      data-tone={tone}
      data-control-size={size}
      data-shape={shape}
      aria-disabled={blocked || props.disabled || undefined}
      aria-busy={pending || undefined}
      onClick={(event) => {
        if (blocked) {
          event.preventDefault();
          return;
        }
        onClick?.(event as React.MouseEvent<HTMLButtonElement>);
      }}
    >
      <span className="yg-button-inner"><span className="yg-button-label">
        <span
          className="yg-button-content"
          aria-hidden={pending && hasPendingLabel ? true : undefined}
        >
          {children}
        </span>
        {(hasPendingLabel || pending) && (
          <span
            className="yg-button-pending"
            data-has-label={hasPendingLabel || undefined}
            aria-hidden={!pending || !hasPendingLabel ? true : undefined}
          >
            <span className="yg-spinner" aria-hidden="true" />
            {pendingLabel}
          </span>
        )}
      </span></span>
    </SDKButton>
  );
}
export function IconButton({
  label,
  icon,
  ...props
}: Omit<ButtonProps, "children"> & { label: string; icon: IconName }) {
  return (
    <Button
      emphasis="quiet"
      {...props}
      aria-label={label}
      className={cx("yg-icon-button", props.className)}
    >
      <Icon name={icon} />
    </Button>
  );
}
export function ButtonGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Inline role="group" aria-label={label}>
      {children}
    </Inline>
  );
}
export function BottomAction({
  children,
  label = "Actions",
  fixed = false,
}: {
  children: ReactNode;
  label?: string;
  fixed?: boolean;
}) {
  return (
    <div className="yg-bottom-action" data-fixed={fixed || undefined} role="group" aria-label={label}>
      {children}
    </div>
  );
}
