"use client";
import {
  Button,
  IconButton
} from "./chunk-4IPCB3MM.js";
import {
  Icon,
  cx
} from "./chunk-GW3HPY4O.js";

// packages/web/src/patterns/sidebar.tsx
import {
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState
} from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var SidebarContext = createContext(null);
function SidebarLayout({
  label,
  navigation,
  children,
  edge = "start",
  variant = "inset",
  collapse = "rail",
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  width = "16rem",
  compactAt = 620,
  className,
  style
}) {
  const root = useRef(null);
  const dialog = useRef(null);
  const focusReturn = useRef(null);
  const controls = useId();
  const [compact, setCompact] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const isCollapsed = collapse !== "none" && (collapsed ?? internalCollapsed);
  const rail = !compact && isCollapsed && collapse === "rail";
  const showOverlay = compact && drawer;
  useLayoutEffect(() => {
    const frame = root.current;
    if (!frame) return;
    function update(size) {
      const narrow = size < compactAt;
      setCompact(narrow);
      if (!narrow) setDrawer(false);
    }
    update(frame.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => update(entry.contentRect.width));
    observer.observe(frame);
    return () => observer.disconnect();
  }, [compactAt]);
  useLayoutEffect(() => {
    const layer = dialog.current;
    if (!layer || !showOverlay) return;
    layer.showModal();
    return () => {
      if (layer.open) layer.close();
      const target = focusReturn.current;
      if (target?.isConnected && target.getClientRects().length) target.focus();
      focusReturn.current = null;
    };
  }, [showOverlay]);
  function updateCollapse(value) {
    if (collapse === "none") return;
    if (collapsed === void 0) setInternalCollapsed(value);
    if (value !== isCollapsed) onCollapsedChange?.(value);
  }
  const state = {
    controls,
    expanded: compact ? showOverlay : !isCollapsed,
    canToggle: compact || collapse !== "none",
    rail,
    toggle: (opener) => {
      if (compact) {
        if (!showOverlay) focusReturn.current = opener;
        setDrawer(!showOverlay);
      } else updateCollapse(!isCollapsed);
    },
    openPanel: () => updateCollapse(false),
    dismiss: () => setDrawer(false)
  };
  return /* @__PURE__ */ jsx(SidebarContext.Provider, { value: state, children: /* @__PURE__ */ jsxs(
    "div",
    {
      ref: root,
      className: cx("yg-sidebar-layout", className),
      "data-edge": edge,
      "data-variant": variant,
      "data-compact": compact,
      "data-panel": compact || isCollapsed && collapse === "hide" ? "hidden" : rail ? "rail" : "full",
      style: { ...style, "--yg-sidebar-width": width },
      children: [
        compact ? /* @__PURE__ */ jsxs(
          "dialog",
          {
            ref: dialog,
            id: controls,
            "aria-label": label,
            className: "yg-sidebar-drawer",
            onCancel: (event) => {
              event.preventDefault();
              state.dismiss();
            },
            onClick: (event) => {
              if (event.target !== event.currentTarget) return;
              const bounds = event.currentTarget.getBoundingClientRect();
              if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) state.dismiss();
            },
            children: [
              /* @__PURE__ */ jsx("div", { className: "yg-sidebar-close", children: /* @__PURE__ */ jsx(IconButton, { icon: "close", label: "Close " + label.toLowerCase(), onClick: state.dismiss }) }),
              navigation
            ]
          }
        ) : /* @__PURE__ */ jsx("aside", { id: controls, className: "yg-sidebar-panel", "aria-label": label, children: navigation }),
        /* @__PURE__ */ jsx("div", { className: "yg-sidebar-main", children })
      ]
    }
  ) });
}
function SidebarTrigger({
  label,
  showLabel = false
}) {
  const state = useContext(SidebarContext);
  if (!state) throw Error("Use SidebarTrigger inside SidebarLayout.");
  if (!state.canToggle) return null;
  const title = label ?? (state.expanded ? "Collapse navigation" : "Expand navigation");
  if (showLabel) return /* @__PURE__ */ jsxs(
    Button,
    {
      emphasis: "quiet",
      "aria-controls": state.controls,
      "aria-expanded": state.expanded,
      onClick: (event) => state.toggle(event.currentTarget),
      children: [
        /* @__PURE__ */ jsx(Icon, { name: "menu" }),
        title
      ]
    }
  );
  return /* @__PURE__ */ jsx(
    IconButton,
    {
      icon: "menu",
      label: title,
      "aria-controls": state.controls,
      "aria-expanded": state.expanded,
      onClick: (event) => state.toggle(event.currentTarget)
    }
  );
}
function SidebarHeader({ children, compact }) {
  const state = useContext(SidebarContext);
  return /* @__PURE__ */ jsx("header", { className: "yg-sidebar-header", children: state?.rail ? compact : children });
}
function SidebarContent({ children, label = "Navigation" }) {
  return /* @__PURE__ */ jsx("nav", { className: "yg-sidebar-content", "aria-label": label, children });
}
function SidebarFooter({ children, compact }) {
  const state = useContext(SidebarContext);
  return /* @__PURE__ */ jsx("footer", { className: "yg-sidebar-footer", children: state?.rail ? compact : children });
}
function Label({ children, icon, rail }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    icon != null && /* @__PURE__ */ jsx("span", { className: "yg-sidebar-icon", "aria-hidden": "true", children: icon }),
    rail && icon == null && /* @__PURE__ */ jsx("span", { className: "yg-sidebar-icon", "aria-hidden": "true", children: [...children.trim()][0]?.toUpperCase() ?? "\xB7" }),
    !rail && /* @__PURE__ */ jsx("span", { className: "yg-sidebar-label", children })
  ] });
}
function SidebarItem({
  label,
  href,
  icon,
  active = false,
  disabled = false,
  badge,
  action,
  onSelect
}) {
  const state = useContext(SidebarContext);
  const rail = state?.rail ?? false;
  const attrs = {
    className: "yg-sidebar-item",
    "aria-current": active ? "page" : void 0,
    "aria-label": rail ? label : void 0,
    title: rail ? label : void 0
  };
  const body = /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Label, { icon, rail, children: label }),
    !rail && badge
  ] });
  return /* @__PURE__ */ jsxs("div", { className: "yg-sidebar-item-row", children: [
    href && !disabled ? /* @__PURE__ */ jsx("a", { ...attrs, href, onClick: (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      onSelect?.();
      state?.dismiss();
    }, children: body }) : /* @__PURE__ */ jsx("button", { ...attrs, type: "button", disabled, onClick: () => {
      onSelect?.();
      state?.dismiss();
    }, children: body }),
    !rail && action
  ] });
}
function SidebarGroup({ label, children, action }) {
  const id = useId();
  const rail = useContext(SidebarContext)?.rail;
  return /* @__PURE__ */ jsxs(
    "section",
    {
      className: "yg-sidebar-group",
      "aria-labelledby": label && !rail ? id : void 0,
      "aria-label": rail ? label : void 0,
      children: [
        !rail && (label || action) && /* @__PURE__ */ jsxs("div", { className: "yg-sidebar-group-header", children: [
          label && /* @__PURE__ */ jsx("h3", { id, children: label }),
          action
        ] }),
        children
      ]
    }
  );
}
function SidebarSubmenu({ label, icon, children, defaultOpen = false, containsCurrent = false }) {
  const id = useId();
  const [open, setOpen] = useState(defaultOpen);
  const state = useContext(SidebarContext);
  const rail = state?.rail ?? false;
  const expanded = !rail && open;
  return /* @__PURE__ */ jsxs("div", { className: "yg-sidebar-submenu", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: "yg-sidebar-item",
        "aria-controls": id,
        "data-contains-current": containsCurrent || void 0,
        "aria-expanded": expanded,
        "aria-label": rail ? label : void 0,
        title: rail ? label : void 0,
        onClick: () => {
          if (rail) {
            setOpen(true);
            state?.openPanel();
          } else setOpen(!open);
        },
        children: [
          /* @__PURE__ */ jsx(Label, { icon, rail, children: label }),
          !rail && /* @__PURE__ */ jsx("span", { className: "yg-sidebar-chevron", "aria-hidden": "true", children: /* @__PURE__ */ jsx(Icon, { name: "down" }) })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        id,
        className: "yg-sidebar-submenu-content",
        "data-expanded": expanded,
        "aria-hidden": !expanded,
        inert: !expanded,
        children: /* @__PURE__ */ jsx("div", { children })
      }
    )
  ] });
}

export {
  SidebarLayout,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarItem,
  SidebarGroup,
  SidebarSubmenu
};
