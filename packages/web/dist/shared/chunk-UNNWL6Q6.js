"use client";
import {
  words
} from "./chunk-5GJUJT3P.js";
import {
  Button,
  IconButton
} from "./chunk-A323HUK4.js";
import {
  Icon
} from "./chunk-RUS3W4HJ.js";

// packages/web/src/controls/layers.tsx
import { useEffect, useId, useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
function Disclosure({
  label,
  children,
  initiallyOpen = false
}) {
  const [open, setOpen] = useState(initiallyOpen);
  return /* @__PURE__ */ jsxs(
    "details",
    {
      className: "yg-disclosure",
      open,
      onToggle: (e) => setOpen(e.currentTarget.open),
      children: [
        /* @__PURE__ */ jsxs("summary", { children: [
          label,
          /* @__PURE__ */ jsx(Icon, { name: "down" })
        ] }),
        /* @__PURE__ */ jsx("div", { children })
      ]
    }
  );
}
function useOutside(ref, close, open) {
  useEffect(() => {
    if (!open) return;
    const outside = (e) => {
      if (e.target instanceof Node && !ref.current?.contains(e.target)) close();
    };
    document.addEventListener("pointerdown", outside, true);
    return () => document.removeEventListener("pointerdown", outside, true);
  }, [ref, close, open]);
}
function ActionMenu({
  label,
  items,
  onSelect
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState();
  const area = useRef(null);
  const trigger = useRef(null);
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
      const node = area.current?.querySelector(
        '[role="menuitem"][tabindex="0"]'
      ) ?? area.current?.querySelector('[role="menu"]');
      node?.focus();
    }
  }, [open, current?.id]);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: area,
      className: "yg-anchor",
      onBlur: (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) close();
      },
      children: [
        /* @__PURE__ */ jsxs(
          Button,
          {
            ref: trigger,
            emphasis: "soft",
            "aria-haspopup": "menu",
            "aria-expanded": open,
            "aria-controls": open ? menu : void 0,
            onClick: () => open ? close() : show(),
            onKeyDown: (e) => {
              if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                show(e.key === "ArrowUp");
              }
            },
            children: [
              label,
              /* @__PURE__ */ jsx(Icon, { name: "down" })
            ]
          }
        ),
        open && /* @__PURE__ */ jsx(
          "div",
          {
            id: menu,
            role: "menu",
            "aria-label": label,
            tabIndex: -1,
            className: "yg-anchored-panel",
            onKeyDown: (e) => {
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
              const move = {
                ArrowDown: (index + 1) % enabled.length,
                ArrowUp: (index - 1 + enabled.length) % enabled.length,
                Home: 0,
                End: enabled.length - 1
              }[e.key];
              if (move !== void 0) {
                e.preventDefault();
                setActive(enabled[move].id);
              } else if (e.key.length === 1) {
                const ordered = [
                  ...enabled.slice(index + 1),
                  ...enabled.slice(0, index + 1)
                ];
                const match = ordered.find(
                  (o) => o.label.toLowerCase().startsWith(e.key.toLowerCase())
                );
                if (match) setActive(match.id);
              }
            },
            children: items.map((o) => /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                role: "menuitem",
                "aria-disabled": !!o.disabled,
                tabIndex: current?.id === o.id ? 0 : -1,
                onClick: () => {
                  if (o.disabled) return;
                  close(true);
                  onSelect(o.id);
                },
                children: o.label
              },
              o.id
            ))
          }
        )
      ]
    }
  );
}
function Popover({
  label,
  children
}) {
  const [open, setOpen] = useState(false);
  const outer = useRef(null);
  const trigger = useRef(null);
  const content = useRef(null);
  const id = useId();
  useOutside(outer, () => setOpen(false), open);
  useEffect(() => {
    if (open) content.current?.focus();
  }, [open]);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: outer,
      className: "yg-anchor",
      onBlur: (e) => {
        if (!e.currentTarget.contains(e.relatedTarget))
          setOpen(false);
      },
      onKeyDown: (e) => {
        if (open && e.key === "Escape") {
          e.stopPropagation();
          setOpen(false);
          trigger.current?.focus();
        }
      },
      children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            ref: trigger,
            emphasis: "soft",
            "aria-expanded": open,
            "aria-controls": open ? id : void 0,
            onClick: () => setOpen(!open),
            children: label
          }
        ),
        open && /* @__PURE__ */ jsx(
          "div",
          {
            ref: content,
            id,
            className: "yg-anchored-panel yg-popover",
            role: "region",
            "aria-label": label,
            tabIndex: -1,
            children
          }
        )
      ]
    }
  );
}
function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  sheet,
  drawer
}) {
  const ref = useRef(null);
  const drag = useRef(null);
  const id = useId();
  const fallback = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;
    fallback.current = dialog.ownerDocument.activeElement;
    dialog.showModal();
    return () => {
      drag.current = null;
      dialog.removeAttribute("data-dragging");
      dialog.style.removeProperty("--yg-drag-distance");
      if (dialog.open) dialog.close();
      if (fallback.current?.isConnected) fallback.current.focus();
    };
  }, [open]);
  return /* @__PURE__ */ jsxs(
    "dialog",
    {
      ref,
      "aria-labelledby": id,
      "aria-describedby": description ? id + "-desc" : void 0,
      className: "yg-dialog" + (drawer ? " yg-drawer" : sheet ? " yg-sheet" : ""),
      onCancel: (e) => {
        e.preventDefault();
        onOpenChange(false);
      },
      onClick: (e) => {
        if (e.target === ref.current) {
          const r = ref.current.getBoundingClientRect();
          if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)
            onOpenChange(false);
        }
      },
      children: [
        drawer && /* @__PURE__ */ jsx(
          "div",
          {
            className: "yg-drawer-grip",
            "aria-hidden": "true",
            onPointerDown: (event) => {
              if (!event.isPrimary || event.button !== 0) return;
              event.currentTarget.setPointerCapture(event.pointerId);
              drag.current = { id: event.pointerId, origin: event.clientY };
              ref.current?.setAttribute("data-dragging", "");
            },
            onPointerMove: (event) => {
              const start = drag.current;
              if (start?.id !== event.pointerId) return;
              ref.current?.style.setProperty(
                "--yg-drag-distance",
                Math.max(0, event.clientY - start.origin) + "px"
              );
            },
            onPointerUp: (event) => {
              const start = drag.current;
              if (start?.id !== event.pointerId) return;
              if (event.clientY - start.origin >= 64) onOpenChange(false);
              event.currentTarget.releasePointerCapture(event.pointerId);
            },
            onLostPointerCapture: () => {
              drag.current = null;
              ref.current?.removeAttribute("data-dragging");
              ref.current?.style.removeProperty("--yg-drag-distance");
            }
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "yg-modal-header", children: [
          /* @__PURE__ */ jsx("h2", { id, className: "yg-heading", children: title }),
          /* @__PURE__ */ jsx(
            IconButton,
            {
              icon: "close",
              label: words["action.close"],
              onClick: () => onOpenChange(false)
            }
          )
        ] }),
        description && /* @__PURE__ */ jsx("p", { id: id + "-desc", className: "yg-help", children: description }),
        children
      ]
    }
  );
}
function Dialog(props) {
  return /* @__PURE__ */ jsx(Modal, { ...props });
}
function Sheet(props) {
  return /* @__PURE__ */ jsx(Modal, { ...props, sheet: true });
}
function Drawer(props) {
  return /* @__PURE__ */ jsx(Modal, { ...props, drawer: true });
}
function Tooltip({
  label,
  children
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return /* @__PURE__ */ jsxs(
    "span",
    {
      className: "yg-tip-anchor",
      onPointerEnter: () => setVisible(true),
      onPointerLeave: () => setVisible(false),
      onFocus: () => setVisible(true),
      onBlur: () => setVisible(false),
      onKeyDown: (e) => {
        if (e.key === "Escape") setVisible(false);
      },
      children: [
        children({ "aria-describedby": id }),
        /* @__PURE__ */ jsx("span", { role: "tooltip", id, hidden: !visible, className: "yg-tip", children: label })
      ]
    }
  );
}

export {
  Disclosure,
  ActionMenu,
  Popover,
  Dialog,
  Sheet,
  Drawer,
  Tooltip
};
