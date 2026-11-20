"use client";
import { words } from "../foundation/words.js";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
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
export function ActionMenu({
  label,
  items,
  onSelect,
}: {
  label: string;
  items: Option[];
  onSelect: (id: string) => void;
}) {
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
  useEffect(() => {
    if (open) {
      const node =
        area.current?.querySelector<HTMLElement>(
          '[role="menuitem"][tabindex="0"]',
        ) ?? area.current?.querySelector<HTMLElement>('[role="menu"]');
      node?.focus();
    }
  }, [open, current?.id]);
  return (
    <div
      ref={area}
      className="yg-anchor"
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
        <Icon name="down" />
      </Button>
      {open && (
        <div
          id={menu}
          role="menu"
          aria-label={label}
          tabIndex={-1}
          className="yg-anchored-panel"
          onKeyDown={(e) => {
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
          {items.map((o) => (
            <button
              type="button"
              role="menuitem"
              key={o.id}
              aria-disabled={!!o.disabled}
              tabIndex={current?.id === o.id ? 0 : -1}
              onClick={() => {
                if (o.disabled) return;
                close(true);
                onSelect(o.id);
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
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
      {open && (
        <div
          ref={content}
          id={id}
          className="yg-anchored-panel yg-popover"
          role="region"
          aria-label={label}
          tabIndex={-1}
        >
          {children}
        </div>
      )}
    </div>
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
    <dialog
      ref={ref}
      aria-labelledby={id}
      aria-describedby={description ? id + "-desc" : undefined}
      className={
        "yg-dialog" + (drawer ? " yg-drawer" : sheet ? " yg-sheet" : "")
      }
      onCancel={(e) => {
        e.preventDefault();
        onOpenChange(false);
      }}
      onClick={(e) => {
        if (e.target === ref.current) {
          const r = ref.current!.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onOpenChange(false);
        }
      }}
    >
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
    </dialog>
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
  return (
    <span
      className="yg-tip-anchor"
      onPointerEnter={() => setVisible(true)}
      onPointerLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      onKeyDown={(e) => {
        if (e.key === "Escape") setVisible(false);
      }}
    >
      {children({ "aria-describedby": id })}
      <span role="tooltip" id={id} hidden={!visible} className="yg-tip">
        {label}
      </span>
    </span>
  );
}
