"use client";
import { words } from "../foundation/words.js";
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Dialog as SDKDialog, DialogContent } from "@ui-sdk/react/dialog";
import { Popover as SDKPopover, PopoverContent } from "@ui-sdk/react/popover";
import { Button as SDKButton } from "@ui-sdk/react/button";
import { Icon, type Option } from "../foundation/foundation.js";
import { Button, IconButton } from "./actions.js";

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

/** Keep an inline layer within its viewport and any clipping scroll containers. */
function useAnchoredPlacement(ref: React.RefObject<HTMLDivElement | null>, open: boolean) {
  useLayoutEffect(() => {
    const anchor = ref.current;
    const panel = anchor?.querySelector<HTMLElement>(".yg-anchored-panel");
    const view = anchor?.ownerDocument.defaultView;
    if (!open || !anchor || !panel || !view) return;
    const apply = (property: string, value: string) => {
      if (panel.style.getPropertyValue(property) !== value) panel.style.setProperty(property, value);
    };
    const place = () => {
      const viewport = view.visualViewport;
      let left = viewport?.offsetLeft ?? 0, top = viewport?.offsetTop ?? 0;
      let right = left + (viewport?.width ?? view.innerWidth), bottom = top + (viewport?.height ?? view.innerHeight);
      for (let parent = anchor.parentElement; parent && parent !== anchor.ownerDocument.documentElement; parent = parent.parentElement) {
        const style = view.getComputedStyle(parent);
        const clipX = /^(auto|scroll|hidden|clip)$/.test(style.overflowX);
        const clipY = /^(auto|scroll|hidden|clip)$/.test(style.overflowY);
        if (!clipX && !clipY) continue;
        const box = parent.getBoundingClientRect();
        const x = box.left + parent.clientLeft, y = box.top + parent.clientTop;
        if (clipX) { left = Math.max(left, x); right = Math.min(right, x + parent.clientWidth); }
        if (clipY) { top = Math.max(top, y); bottom = Math.min(bottom, y + parent.clientHeight); }
      }
      const anchorBox = anchor.getBoundingClientRect();
      const safeWidth = Math.max(0, right - left - 16);
      apply("max-inline-size", `min(19rem, 85vw, ${safeWidth}px)`);
      apply("min-inline-size", `min(11rem, 80vw, ${safeWidth}px)`);
      const gap = parseFloat(view.getComputedStyle(panel).getPropertyValue("--yg-offset-layer")) || 6;
      const below = Math.max(0, bottom - 8 - anchorBox.bottom - gap);
      const above = Math.max(0, anchorBox.top - gap - top - 8);
      apply("max-block-size", `${Math.max(above, below)}px`);
      apply("overflow-y", "auto");
      const width = panel.offsetWidth, height = panel.offsetHeight;
      const rtl = view.getComputedStyle(anchor).direction === "rtl";
      const preferred = rtl ? anchorBox.right - width : anchorBox.left;
      const targetLeft = Math.min(Math.max(preferred, left + 8), Math.max(left + 8, right - 8 - width));
      const showAbove = below < height && above > below;
      const targetTop = showAbove ? anchorBox.top - gap - height : anchorBox.bottom + gap;
      apply("inset-inline-start", "auto");
      apply("inset-inline-end", "auto");
      apply("left", `${targetLeft - anchorBox.left}px`);
      apply("bottom", "auto");
      apply("top", `${targetTop - anchorBox.top}px`);
      panel.dataset.side = showAbove ? "above" : "below";
    };
    place();
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(place);
    observer?.observe(anchor);
    observer?.observe(panel);
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
  }, [ref, open]);
}
export function ActionMenu({
  label,
  items,
  onSelect,
  triggerText = label,
  presentation = "anchored",
}: {
  label: string;
  items: Option[];
  onSelect: (id: string) => void;
  triggerText?: string;
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
  useAnchoredPlacement(area, open && !expanding);
  function show(last = false) {
    setActive((last ? enabled.at(-1) : enabled[0])?.id);
    setOpen(true);
  }
  function close(restore = false) {
    setOpen(false);
    if (restore) trigger.current?.focus();
  }
  useOutside(area, () => close(), open);
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
  useAnchoredPlacement(outer, open);
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
      let left = viewport?.offsetLeft ?? 0;
      let top = viewport?.offsetTop ?? 0;
      const width = viewport?.width ?? view.innerWidth;
      let right = left + width;
      let bottom = top + (viewport?.height ?? view.innerHeight);
      for (let parent = host.parentElement; parent && parent !== host.ownerDocument.documentElement; parent = parent.parentElement) {
        const style = view.getComputedStyle(parent);
        const clipsX = /^(auto|scroll|hidden|clip)$/.test(style.overflowX);
        const clipsY = /^(auto|scroll|hidden|clip)$/.test(style.overflowY);
        if (!clipsX && !clipsY) continue;
        const box = parent.getBoundingClientRect();
        const x = box.left + parent.clientLeft;
        const y = box.top + parent.clientTop;
        if (clipsX) { left = Math.max(left, x); right = Math.min(right, x + parent.clientWidth); }
        if (clipsY) { top = Math.max(top, y); bottom = Math.min(bottom, y + parent.clientHeight); }
      }
      const available = `${Math.max(1, right - left - 16)}px`;
      if (tip.style.getPropertyValue("--yg-tip-available") !== available) tip.style.setProperty("--yg-tip-available", available);
      const center = (bounds.left + bounds.right) / 2;
      const half = tip.offsetWidth / 2;
      const safeCenter = Math.max(left + 8 + half, Math.min(center, right - 8 - half));
      tip.style.setProperty("--yg-tip-shift", `${safeCenter - center}px`);
      const above = bounds.top - top - 12;
      const below = bottom - bounds.bottom - 12;
      tip.dataset.side = above >= tip.offsetHeight || above >= below ? "above" : "below";
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
