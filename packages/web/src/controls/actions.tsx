"use client";
import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { Button as SDKButton } from "@openai/apps-sdk-ui/components/Button";
import { cx, Icon, Inline, type IconName, type Size } from "../foundation/foundation.js";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  emphasis?: "filled" | "soft" | "quiet";
  tone?: "neutral" | "brand" | "danger";
  size?: Size;
  pending?: boolean;
  pendingLabel?: string;
  ref?: Ref<HTMLButtonElement>;
}
const variants = { filled: "solid", soft: "soft", quiet: "ghost" } as const;
const sizes = { compact: "sm", regular: "lg", touch: "2xl" } as const;
export function Button({
  emphasis = "filled",
  tone = "neutral",
  size = "regular",
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
      color={tone === "danger" ? "danger" : "primary"}
      variant={variants[emphasis]}
      pill={false}
      size={sizes[size]}
      className={cx("yg-button", className)}
      data-emphasis={emphasis}
      data-tone={tone}
      data-control-size={size}
      aria-disabled={blocked || props.disabled || undefined}
      aria-busy={pending || undefined}
      onClick={(event) => {
        if (blocked) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    >
      <span className="yg-button-label">
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
      </span>
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
