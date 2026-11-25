"use client";
import { words } from "../foundation/words.js";
import { Fragment, isValidElement, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactElement, type ReactNode } from "react";
import { Dialog as SDKDialog, DialogContent } from "@ui-sdk/react/dialog";
import { Popover as SDKPopover, PopoverClose, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@ui-sdk/react/popover";
import { Menu, MenuCheckboxItem, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@ui-sdk/react/menu";
import { Tooltip as SDKTooltip, TooltipArrow, TooltipContent, TooltipTrigger } from "@ui-sdk/react/tooltip";
import { Button as SDKButton } from "@ui-sdk/react/button";
import { cx, Icon, type Option } from "../foundation/foundation.js";
import { Button, IconButton, type ButtonProps, type ButtonSize } from "./actions.js";

export function Disclosure({
  label,
  children,
  initiallyOpen = false,
}: {
  label: string;
  children: ReactNode;
  initiallyOpen?: boolean;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <details
      className="yg-disclosure"
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary>
        {label}
        <Icon name="down" />
      </summary>
      <div>{children}</div>
    </details>
  );
}
export { Disclosure as DisclosureRow };
function useOutside(
  ref: React.RefObject<HTMLDivElement | null>,
  close: () => void,
  open: boolean,
) {
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      if (e.target instanceof Node && !ref.current?.contains(e.target)) close();
    };
    document.addEventListener("pointerdown", outside, true);
    return () => document.removeEventListener("pointerdown", outside, true);
  }, [ref, close, open]);
}

export interface ActionMenuItem extends Option {
  checked?: boolean;
  tone?: "neutral" | "danger";
  separatorBefore?: boolean;
}

type ActionMenuProps = {
  label: string;
  items: ActionMenuItem[];
  onSelect: (id: string) => void;
  triggerText?: string;
  triggerVariant?: "button" | "more";
  triggerEmphasis?: ButtonProps["emphasis"];
  triggerSize?: ButtonSize;
  selectionIndicator?: "leading" | "none";
  align?: "start" | "center" | "end";
  presentation?: "anchored" | "expanding";
};

export function ActionMenu({ presentation = "anchored", ...props }: ActionMenuProps) {
  if (presentation === "expanding") return <ExpandingActionMenu {...props} />;
  const {
    label,
    items,
    onSelect,
    triggerText = label,
    triggerVariant = "button",
    triggerEmphasis,
    triggerSize = "regular",
    selectionIndicator,
    align,
  } = props;
  const hasLeadingRail =
    selectionIndicator === "leading" ||
    (selectionIndicator !== "none" && items.some((item) => item.checked !== undefined));
  const resolvedAlign = align ?? (triggerVariant === "more" ? "end" : "start");
  return (
    <Menu loop>
      {triggerVariant === "more" ? (
        <MenuTrigger
          aria-label={label}
          render={
            <IconButton
              icon="more"
              label={label}
              emphasis={triggerEmphasis ?? "quiet"}
              size={triggerSize}
              className="yg-menu-more-trigger"
            />
          }
        />
      ) : (
        <MenuTrigger
          aria-label={label}
          render={
            <Button
              emphasis={triggerEmphasis ?? "soft"}
              size={triggerSize}
            />
          }
        >
          {triggerText}
          <Icon name="down" />
        </MenuTrigger>
      )}
      <MenuContent
        className="yg-popup-menu"
        data-selection-rail={hasLeadingRail ? "leading" : undefined}
        aria-label={label}
        align={resolvedAlign}
        sideOffset={6}
        collisionPadding={8}
        render={(contentProps, state) => (
          <div
            {...contentProps}
            aria-hidden={!state.open || undefined}
            inert={!state.open}
          />
        )}
      >
        {items.map((item, index) => {
          const itemContent = (
            <>
              {hasLeadingRail && (
                <span className="yg-menu-check-rail" aria-hidden="true">
                  {item.checked && <Icon name="check" />}
                </span>
              )}
              <span className="yg-menu-item-label">{item.label}</span>
            </>
          );
          return (
            <Fragment key={item.id}>
              {item.separatorBefore && index > 0 && (
                <MenuSeparator className="yg-menu-separator" />
              )}
              {item.checked !== undefined ? (
                <MenuCheckboxItem
                  value={item.id}
                  label={item.label}
                  disabled={item.disabled}
                  checked={item.checked}
                  closeOnSelect
                  data-tone={item.tone === "danger" ? "danger" : undefined}
                  data-checked={item.checked ? "" : undefined}
                  render={<SDKButton type="button" />}
                  onCheckedChange={() => onSelect(item.id)}
                >
                  {itemContent}
                </MenuCheckboxItem>
              ) : (
                <MenuItem
                  value={item.id}
                  label={item.label}
                  disabled={item.disabled}
                  data-tone={item.tone === "danger" ? "danger" : undefined}
                  render={<SDKButton type="button" />}
                  onSelect={() => onSelect(item.id)}
                >
                  {itemContent}
                </MenuItem>
              )}
            </Fragment>
          );
        })}
      </MenuContent>
    </Menu>
  );
}

function useMenuRovingKeyDown({
  enabled,
  currentId,
  setActive,
  close,
  trigger,
}: {
  enabled: ActionMenuItem[];
  currentId: string | undefined;
  setActive: (id: string) => void;
  close: (restore?: boolean) => void;
  trigger: React.RefObject<HTMLButtonElement | null>;
}) {
  return (e: KeyboardEvent<HTMLElement>) => {
    const index = enabled.findIndex((o) => o.id === currentId);
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close(true);
      return;
    }
    if (e.key === "Tab") {
      trigger.current?.focus();
      close();
      return;
    }
    if (!enabled.length) return;
    const move = (
      {
        ArrowDown: (index + 1) % enabled.length,
        ArrowUp: (index - 1 + enabled.length) % enabled.length,
        Home: 0,
        End: enabled.length - 1,
      } as Record<string, number | undefined>
    )[e.key];
    if (move !== undefined) {
      e.preventDefault();
      setActive(enabled[move].id);
    } else if (e.key.length === 1) {
      const ordered = [
        ...enabled.slice(index + 1),
        ...enabled.slice(0, index + 1),
      ];
      const match = ordered.find((o) =>
        o.label.toLowerCase().startsWith(e.key.toLowerCase()),
      );
      if (match) setActive(match.id);
    }
  };
}

function ExpandingActionMenu({ label, items, onSelect, triggerText = label }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | undefined>();
  const area = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useId();
  const enabled = items.filter((i) => !i.disabled);
  const current = enabled.find((i) => i.id === active) ?? enabled[0];
  function show(last = false) {
    setActive((last ? enabled.at(-1) : enabled[0])?.id);
    setOpen(true);
  }
  function close(restore = false) {
    setOpen(false);
    if (restore) trigger.current?.focus();
  }
  useOutside(area, () => close(), open);
  const handleMenuKeyDown = useMenuRovingKeyDown({
    enabled,
    currentId: current?.id,
    setActive,
    close,
    trigger,
  });
  useEffect(() => {
    if (open) {
      const node =
        area.current?.querySelector<HTMLElement>(
          '[role="menuitem"][tabindex="0"]',
        ) ?? area.current?.querySelector<HTMLElement>('[role="menu"]');
      node?.focus();
    }
  }, [open, current?.id]);
  const options = items.map(item => (
    <SDKButton
      type="button"
      role="menuitem"
      key={item.id}
      aria-disabled={!!item.disabled}
      tabIndex={current?.id === item.id ? 0 : -1}
      onClick={() => {
        if (item.disabled) return;
        close(true);
        onSelect(item.id);
      }}
    >
      {item.label}
    </SDKButton>
  ));
  return (
    <SDKPopover open={open} onOpenChange={setOpen} dismissible={false}>
    <div
      ref={area}
      className="yg-action-menu-expanding"
      data-open={open}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) close();
      }}
    >
      <Button
        ref={trigger}
        emphasis="soft"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menu : undefined}
        onClick={() => (open ? close() : show())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            show(e.key === "ArrowUp");
          }
        }}
      >
        {triggerText}
        <span className="yg-action-menu-glyph" aria-hidden="true"><i /><i /></span>
      </Button>
      <PopoverContent inline
        keepMounted
        id={menu}
        role="menu"
        aria-label={label}
        tabIndex={-1}
        inert={!open}
        className="yg-action-menu-fold"
        render={(props) => <div {...props} id={menu} role="menu" aria-label={label}
          tabIndex={-1} hidden={false} aria-hidden={!open || undefined} inert={!open} />}
        onKeyDownCapture={handleMenuKeyDown}
      >
        <div className="yg-action-menu-options">{options}</div>
      </PopoverContent>
    </div>
    </SDKPopover>
  );
}
export { PopoverClose, PopoverDescription, PopoverTitle };
export interface PopoverProps {
  label: string;
  trigger?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
  children: ReactNode;
}

export function Popover({
  label,
  trigger,
  open,
  defaultOpen,
  onOpenChange,
  side = "bottom",
  align = "start",
  sideOffset = 6,
  className,
  children,
}: PopoverProps) {
  return (
    <SDKPopover
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next) => onOpenChange?.(next)}
    >
      {trigger !== undefined ? (
        isValidElement(trigger) ? (
          <PopoverTrigger render={trigger as ReactElement<Record<string, unknown>>} />
        ) : (
          <PopoverTrigger render={<Button emphasis="soft" />}>
            {trigger}
          </PopoverTrigger>
        )
      ) : (
        <PopoverTrigger render={<Button emphasis="soft" />}>
          {label}
        </PopoverTrigger>
      )}
      <PopoverContent
        side={side}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={8}
        className={cx("yg-popover", className)}
        aria-label={label}
        render={(props) => (
          <div
            {...props}
            role="dialog"
            aria-label={label}
          />
        )}
      >
        {children}
      </PopoverContent>
    </SDKPopover>
  );
}
export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  description?: string;
}
function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  sheet,
  drawer,
}: DialogProps & { sheet?: boolean; drawer?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const drag = useRef<{ id: number; origin: number } | null>(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;
    dialog.showModal();
    return () => {
      drag.current = null;
      dialog.removeAttribute("data-dragging");
      dialog.style.removeProperty("--yg-drag-distance");
      if (dialog.open) dialog.close();
    };
  }, [open]);
  return (
    <SDKDialog open={open} onOpenChange={onOpenChange}>
    <DialogContent keepMounted inline render={<dialog ref={ref}
      aria-labelledby={id} aria-describedby={description ? id + "-desc" : undefined}
      aria-hidden={!open || undefined} inert={!open}
      className={"yg-dialog" + (drawer ? " yg-drawer" : sheet ? " yg-sheet" : "")}
      onCancel={(e) => { e.preventDefault(); onOpenChange(false); }} />}>
      {drawer && (
        <div
          className="yg-drawer-grip"
          aria-hidden="true"
          onPointerDown={(event) => {
            if (!event.isPrimary || event.button !== 0) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            drag.current = { id: event.pointerId, origin: event.clientY };
            ref.current?.setAttribute("data-dragging", "");
          }}
          onPointerMove={(event) => {
            const start = drag.current;
            if (start?.id !== event.pointerId) return;
            ref.current?.style.setProperty(
              "--yg-drag-distance",
              Math.max(0, event.clientY - start.origin) + "px",
            );
          }}
          onPointerUp={(event) => {
            const start = drag.current;
            if (start?.id !== event.pointerId) return;
            const drawer = ref.current;
            if (!drawer) return;
            const threshold = parseFloat(getComputedStyle(drawer).getPropertyValue("--yg-drawer-dismiss-distance"));
            if (event.clientY - start.origin >= threshold) onOpenChange(false);
            event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onLostPointerCapture={() => {
            drag.current = null;
            ref.current?.removeAttribute("data-dragging");
            ref.current?.style.removeProperty("--yg-drag-distance");
          }}
        />
      )}
      <div className="yg-modal-header">
        <h2 id={id} className="yg-heading">
          {title}
        </h2>
        <IconButton
          icon="close"
          label={words["action.close"]}
          onClick={() => onOpenChange(false)}
        />
      </div>
      {description && (
        <p id={id + "-desc"} className="yg-help">
          {description}
        </p>
      )}
      {children}
    </DialogContent>
    </SDKDialog>
  );
}
export function Dialog(props: DialogProps) {
  return <Modal {...props} />;
}
export function Sheet(props: DialogProps) {
  return <Modal {...props} sheet />;
}
export function Drawer(props: DialogProps) {
  return <Modal {...props} drawer />;
}
export function Tooltip({
  label,
  delay = 0,
  children,
}: {
  label: string;
  delay?: number;
  children: (props: { "aria-describedby": string }) => ReactNode;
}) {
  const triggerNode = children({} as { "aria-describedby": string });
  return (
    <SDKTooltip delay={delay} closeDelay={0} type="description">
      {isValidElement(triggerNode) ? (
        <TooltipTrigger render={triggerNode as ReactElement<Record<string, unknown>>} />
      ) : (
        <TooltipTrigger render={<span />}>{triggerNode}</TooltipTrigger>
      )}
      <TooltipContent
        side="top"
        sideOffset={6}
        collisionPadding={8}
        className="yg-tip"
        aria-label={label}
      >
        {label}
      </TooltipContent>
    </SDKTooltip>
  );
}
export { TooltipArrow };

export function MorphTooltip({ label, detail }: { label: string; detail: string }) {
  return <Tooltip label={detail}>{props =>
    <Button emphasis="soft" {...props}>{label}<span className="yg-tooltip-info" aria-hidden="true">i</span></Button>
  }</Tooltip>;
}
