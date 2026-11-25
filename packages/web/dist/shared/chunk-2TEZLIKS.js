"use client";
import {
  words
} from "./chunk-5GJUJT3P.js";
import {
  Button,
  IconButton
} from "./chunk-BMOTQIAZ.js";
import {
  Icon,
  cx
} from "./chunk-XELXU7JZ.js";

// packages/web/src/controls/layers.tsx
import { Fragment, isValidElement, useEffect, useId, useRef, useState } from "react";
import { Dialog as SDKDialog, DialogContent } from "@ui-sdk/react/dialog";
import { Popover as SDKPopover, PopoverClose, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@ui-sdk/react/popover";
import { Menu, MenuCheckboxItem, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@ui-sdk/react/menu";
import { Tooltip as SDKTooltip, TooltipArrow, TooltipContent, TooltipTrigger } from "@ui-sdk/react/tooltip";
import { Button as SDKButton } from "@ui-sdk/react/button";
import { Fragment as Fragment2, jsx, jsxs } from "react/jsx-runtime";
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
function ActionMenu({ presentation = "anchored", ...props }) {
  if (presentation === "expanding") return /* @__PURE__ */ jsx(ExpandingActionMenu, { ...props });
  const {
    label,
    items,
    onSelect,
    triggerText = label,
    triggerVariant = "button",
    triggerEmphasis,
    triggerSize = "regular",
    selectionIndicator,
    align
  } = props;
  const hasLeadingRail = selectionIndicator === "leading" || selectionIndicator !== "none" && items.some((item) => item.checked !== void 0);
  const resolvedAlign = align ?? (triggerVariant === "more" ? "end" : "start");
  return /* @__PURE__ */ jsxs(Menu, { loop: true, children: [
    triggerVariant === "more" ? /* @__PURE__ */ jsx(
      MenuTrigger,
      {
        "aria-label": label,
        render: /* @__PURE__ */ jsx(
          IconButton,
          {
            icon: "more",
            label,
            emphasis: triggerEmphasis ?? "quiet",
            size: triggerSize,
            className: "yg-menu-more-trigger"
          }
        )
      }
    ) : /* @__PURE__ */ jsxs(
      MenuTrigger,
      {
        "aria-label": label,
        render: /* @__PURE__ */ jsx(
          Button,
          {
            emphasis: triggerEmphasis ?? "soft",
            size: triggerSize
          }
        ),
        children: [
          triggerText,
          /* @__PURE__ */ jsx(Icon, { name: "down" })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      MenuContent,
      {
        className: "yg-popup-menu",
        "data-selection-rail": hasLeadingRail ? "leading" : void 0,
        "aria-label": label,
        align: resolvedAlign,
        sideOffset: 6,
        collisionPadding: 8,
        render: (contentProps, state) => /* @__PURE__ */ jsx(
          "div",
          {
            ...contentProps,
            "aria-hidden": !state.open || void 0,
            inert: !state.open
          }
        ),
        children: items.map((item, index) => {
          const itemContent = /* @__PURE__ */ jsxs(Fragment2, { children: [
            hasLeadingRail && /* @__PURE__ */ jsx("span", { className: "yg-menu-check-rail", "aria-hidden": "true", children: item.checked && /* @__PURE__ */ jsx(Icon, { name: "check" }) }),
            /* @__PURE__ */ jsx("span", { className: "yg-menu-item-label", children: item.label })
          ] });
          return /* @__PURE__ */ jsxs(Fragment, { children: [
            item.separatorBefore && index > 0 && /* @__PURE__ */ jsx(MenuSeparator, { className: "yg-menu-separator" }),
            item.checked !== void 0 ? /* @__PURE__ */ jsx(
              MenuCheckboxItem,
              {
                value: item.id,
                label: item.label,
                disabled: item.disabled,
                checked: item.checked,
                closeOnSelect: true,
                "data-tone": item.tone === "danger" ? "danger" : void 0,
                "data-checked": item.checked ? "" : void 0,
                render: /* @__PURE__ */ jsx(SDKButton, { type: "button" }),
                onCheckedChange: () => onSelect(item.id),
                children: itemContent
              }
            ) : /* @__PURE__ */ jsx(
              MenuItem,
              {
                value: item.id,
                label: item.label,
                disabled: item.disabled,
                "data-tone": item.tone === "danger" ? "danger" : void 0,
                render: /* @__PURE__ */ jsx(SDKButton, { type: "button" }),
                onSelect: () => onSelect(item.id),
                children: itemContent
              }
            )
          ] }, item.id);
        })
      }
    )
  ] });
}
function useMenuRovingKeyDown({
  enabled,
  currentId,
  setActive,
  close,
  trigger
}) {
  return (e) => {
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
  };
}
function ExpandingActionMenu({ label, items, onSelect, triggerText = label }) {
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
  const handleMenuKeyDown = useMenuRovingKeyDown({
    enabled,
    currentId: current?.id,
    setActive,
    close,
    trigger
  });
  useEffect(() => {
    if (open) {
      const node = area.current?.querySelector(
        '[role="menuitem"][tabindex="0"]'
      ) ?? area.current?.querySelector('[role="menu"]');
      node?.focus();
    }
  }, [open, current?.id]);
  const options = items.map((item) => /* @__PURE__ */ jsx(
    SDKButton,
    {
      type: "button",
      role: "menuitem",
      "aria-disabled": !!item.disabled,
      tabIndex: current?.id === item.id ? 0 : -1,
      onClick: () => {
        if (item.disabled) return;
        close(true);
        onSelect(item.id);
      },
      children: item.label
    },
    item.id
  ));
  return /* @__PURE__ */ jsx(SDKPopover, { open, onOpenChange: setOpen, dismissible: false, children: /* @__PURE__ */ jsxs(
    "div",
    {
      ref: area,
      className: "yg-action-menu-expanding",
      "data-open": open,
      onBlur: (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) close();
      },
      children: [
        /* @__PURE__ */ jsxs(
          Button,
          {
            ref: trigger,
            emphasis: "soft",
            "aria-label": label,
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
              triggerText,
              /* @__PURE__ */ jsxs("span", { className: "yg-action-menu-glyph", "aria-hidden": "true", children: [
                /* @__PURE__ */ jsx("i", {}),
                /* @__PURE__ */ jsx("i", {})
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          PopoverContent,
          {
            inline: true,
            keepMounted: true,
            id: menu,
            role: "menu",
            "aria-label": label,
            tabIndex: -1,
            inert: !open,
            className: "yg-action-menu-fold",
            render: (props) => /* @__PURE__ */ jsx(
              "div",
              {
                ...props,
                id: menu,
                role: "menu",
                "aria-label": label,
                tabIndex: -1,
                hidden: false,
                "aria-hidden": !open || void 0,
                inert: !open
              }
            ),
            onKeyDownCapture: handleMenuKeyDown,
            children: /* @__PURE__ */ jsx("div", { className: "yg-action-menu-options", children: options })
          }
        )
      ]
    }
  ) });
}
function Popover({
  label,
  trigger,
  open,
  defaultOpen,
  onOpenChange,
  side = "bottom",
  align = "start",
  sideOffset = 6,
  className,
  children
}) {
  return /* @__PURE__ */ jsxs(
    SDKPopover,
    {
      open,
      defaultOpen,
      onOpenChange: (next) => onOpenChange?.(next),
      children: [
        trigger !== void 0 ? isValidElement(trigger) ? /* @__PURE__ */ jsx(PopoverTrigger, { render: trigger }) : /* @__PURE__ */ jsx(PopoverTrigger, { render: /* @__PURE__ */ jsx(Button, { emphasis: "soft" }), children: trigger }) : /* @__PURE__ */ jsx(PopoverTrigger, { render: /* @__PURE__ */ jsx(Button, { emphasis: "soft" }), children: label }),
        /* @__PURE__ */ jsx(
          PopoverContent,
          {
            side,
            align,
            sideOffset,
            collisionPadding: 8,
            className: cx("yg-popover", className),
            "aria-label": label,
            render: (props) => /* @__PURE__ */ jsx(
              "div",
              {
                ...props,
                role: "dialog",
                "aria-label": label
              }
            ),
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
  return /* @__PURE__ */ jsx(SDKDialog, { open, onOpenChange, children: /* @__PURE__ */ jsxs(DialogContent, { keepMounted: true, inline: true, render: /* @__PURE__ */ jsx(
    "dialog",
    {
      ref,
      "aria-labelledby": id,
      "aria-describedby": description ? id + "-desc" : void 0,
      "aria-hidden": !open || void 0,
      inert: !open,
      className: "yg-dialog" + (drawer ? " yg-drawer" : sheet ? " yg-sheet" : ""),
      onCancel: (e) => {
        e.preventDefault();
        onOpenChange(false);
      }
    }
  ), children: [
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
          const drawer2 = ref.current;
          if (!drawer2) return;
          const threshold = parseFloat(getComputedStyle(drawer2).getPropertyValue("--yg-drawer-dismiss-distance"));
          if (event.clientY - start.origin >= threshold) onOpenChange(false);
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
  ] }) });
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
  delay = 0,
  children
}) {
  const triggerNode = children({});
  return /* @__PURE__ */ jsxs(SDKTooltip, { delay, closeDelay: 0, type: "description", children: [
    isValidElement(triggerNode) ? /* @__PURE__ */ jsx(TooltipTrigger, { render: triggerNode }) : /* @__PURE__ */ jsx(TooltipTrigger, { render: /* @__PURE__ */ jsx("span", {}), children: triggerNode }),
    /* @__PURE__ */ jsx(
      TooltipContent,
      {
        side: "top",
        sideOffset: 6,
        collisionPadding: 8,
        className: "yg-tip",
        "aria-label": label,
        children: label
      }
    )
  ] });
}
function MorphTooltip({ label, detail }) {
  return /* @__PURE__ */ jsx(Tooltip, { label: detail, children: (props) => /* @__PURE__ */ jsxs(Button, { emphasis: "soft", ...props, children: [
    label,
    /* @__PURE__ */ jsx("span", { className: "yg-tooltip-info", "aria-hidden": "true", children: "i" })
  ] }) });
}

export {
  PopoverClose,
  PopoverDescription,
  PopoverTitle,
  TooltipArrow,
  Disclosure,
  ActionMenu,
  Popover,
  Dialog,
  Sheet,
  Drawer,
  Tooltip,
  MorphTooltip
};
