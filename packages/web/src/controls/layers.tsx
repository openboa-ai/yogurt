"use client";
import { words } from "../foundation/words.js";
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Dialog as SDKDialog, DialogContent } from "@ui-sdk/react/dialog";
import { Popover as SDKPopover, PopoverContent } from "@ui-sdk/react/popover";
import { Button as SDKButton } from "@ui-sdk/react/button";
import { Icon, type Option } from "../foundation/foundation.js";
import { Button, IconButton } from "./actions.js";
import { animateActionMenu } from "./action-menu-motion.js";

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
export function ActionMenu({
  label,
  items,
  onSelect,
  presentation = "anchored",
}: {
  label: string;
  items: Option[];
  onSelect: (id: string) => void;
  presentation?: "anchored" | "expanding";
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | undefined>();
  const area = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useId();
  const expanding = presentation === "expanding";
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
  useLayoutEffect(() => {
    if (expanding && area.current) return animateActionMenu(area.current);
  }, [expanding]);
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
      className={expanding ? "yg-action-menu-expanding" : "yg-anchor"}
      data-open={expanding ? open : undefined}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) close();
      }}
    >
      <Button
        ref={trigger}
        emphasis="soft"
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
        {label}
        {expanding ? <span className="yg-action-menu-glyph" aria-hidden="true"><i /><i /></span> : <Icon name="down" />}
      </Button>
      {(open || expanding) && (
        <PopoverContent inline
          keepMounted={expanding}
          id={menu}
          role="menu"
          aria-label={label}
          tabIndex={-1}
          inert={!open}
          className={expanding ? "yg-action-menu-fold" : "yg-anchored-panel"}
          render={(props) => <div {...props} id={menu} role="menu" aria-label={label}
            tabIndex={-1} hidden={false} inert={!open} />}
          onKeyDownCapture={(e) => {
            const index = enabled.findIndex((o) => o.id === current?.id);
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
          }}
        >
          {expanding ? <div className="yg-action-menu-options">{options}</div> : options}
        </PopoverContent>
      )}
    </div>
    </SDKPopover>
  );
}
export function Popover({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const outer = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const id = useId();
  useOutside(outer, () => setOpen(false), open);
  useEffect(() => {
    if (open) content.current?.focus();
  }, [open]);
  return (
    <SDKPopover open={open} onOpenChange={setOpen} dismissible={false}>
    <div
      ref={outer}
      className="yg-anchor"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null))
          setOpen(false);
      }}
      onKeyDown={(e) => {
        if (open && e.key === "Escape") {
          e.stopPropagation();
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <Button
        ref={trigger}
        emphasis="soft"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen(!open)}
      >
        {label}
      </Button>
      <PopoverContent inline ref={content} render={(props) => <div {...props}
        id={id} className="yg-anchored-panel yg-popover" role="region"
        aria-label={label} tabIndex={-1} />}>
        {children}
      </PopoverContent>
    </div>
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
  const fallback = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;
    fallback.current = dialog.ownerDocument.activeElement as HTMLElement;
    dialog.showModal();
    return () => {
      drag.current = null;
      dialog.removeAttribute("data-dragging");
      dialog.style.removeProperty("--yg-drag-distance");
      if (dialog.open) dialog.close();
      if (fallback.current?.isConnected) fallback.current.focus();
    };
  }, [open]);
  return (
    <SDKDialog open={open} onOpenChange={onOpenChange}>
    <DialogContent keepMounted inline render={<dialog ref={ref}
      aria-labelledby={id} aria-describedby={description ? id + "-desc" : undefined}
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
            if (event.clientY - start.origin >= 64) onOpenChange(false);
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
  children,
}: {
  label: string;
  children: (props: { "aria-describedby": string }) => ReactNode;
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const hovered = useRef(false);
  const focused = useRef(false);
  const anchor = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const host = anchor.current;
    const tip = host?.querySelector<HTMLElement>(".yg-tip");
    const view = host?.ownerDocument.defaultView;
    if (!visible || !host || !tip || !view) return;
    const place = () => {
      const bounds = host.getBoundingClientRect();
      const viewport = view.visualViewport;
      const left = viewport?.offsetLeft ?? 0;
      const top = viewport?.offsetTop ?? 0;
      const width = viewport?.width ?? view.innerWidth;
      const center = (bounds.left + bounds.right) / 2;
      const half = tip.offsetWidth / 2;
      const safeCenter = Math.max(left + 8 + half, Math.min(center, left + width - 8 - half));
      tip.style.setProperty("--yg-tip-shift", `${safeCenter - center}px`);
      tip.dataset.side = bounds.top - top < tip.offsetHeight + 16 ? "below" : "above";
    };
    place();
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(place);
    observer?.observe(host);
    observer?.observe(tip);
    view.addEventListener("resize", place);
    view.addEventListener("scroll", place, true);
    view.visualViewport?.addEventListener("resize", place);
    view.visualViewport?.addEventListener("scroll", place);
    return () => {
      observer?.disconnect();
      view.removeEventListener("resize", place);
      view.removeEventListener("scroll", place, true);
      view.visualViewport?.removeEventListener("resize", place);
      view.visualViewport?.removeEventListener("scroll", place);
    };
  }, [visible, label]);
  return (
    <SDKPopover open={visible} onOpenChange={setVisible} dismissible={false}>
    <span
      ref={anchor}
      className="yg-tip-anchor"
      onPointerEnter={() => { hovered.current = true; setVisible(true); }}
      onPointerLeave={() => { hovered.current = false; if (!focused.current) setVisible(false); }}
      onFocus={() => { focused.current = true; setVisible(true); }}
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        focused.current = false;
        if (!hovered.current) setVisible(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") setVisible(false);
      }}
    >
      {children({ "aria-describedby": id })}
      <PopoverContent inline keepMounted initialFocus="none" finalFocus="none"
        render={(props) => <span {...props} role="tooltip" id={id} aria-label={label} hidden={false} aria-hidden={!visible} data-open={visible} tabIndex={undefined} className="yg-tip" />}>
        {label}
      </PopoverContent>
    </span>
    </SDKPopover>
  );
}
