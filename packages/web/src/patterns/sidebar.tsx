"use client";

import {
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Button, IconButton } from "../controls/actions.js";
import { cx, Icon, type ControlSize } from "../foundation/foundation.js";

type SidebarState = {
  controls: string;
  expanded: boolean;
  canToggle: boolean;
  rail: boolean;
  toggle: (opener: HTMLButtonElement) => void;
  openPanel: () => void;
  dismiss: () => void;
};

const SidebarContext = createContext<SidebarState | null>(null);

export function SidebarLayout({
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
  style,
}: {
  label: string;
  navigation: ReactNode;
  children: ReactNode;
  edge?: "start" | "end";
  variant?: "inset" | "flat";
  collapse?: "rail" | "hide" | "none";
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  width?: string;
  compactAt?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const focusReturn = useRef<HTMLButtonElement | null>(null);
  const controls = useId();
  const [compact, setCompact] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const isCollapsed = collapse !== "none" && (collapsed ?? internalCollapsed);
  const rail = !compact && isCollapsed && collapse === "rail";
  const showOverlay = compact && drawer;
  const panelHidden = !compact && isCollapsed && collapse === "hide";

  useLayoutEffect(() => {
    const frame = root.current;
    if (!panelHidden || !frame || !panel.current?.contains(frame.ownerDocument.activeElement)) return;
    const trigger = [...frame.querySelectorAll<HTMLButtonElement>("button[aria-controls]")]
      .find(button => button.getAttribute("aria-controls") === controls && !panel.current?.contains(button));
    trigger?.focus();
  }, [controls, panelHidden]);

  useLayoutEffect(() => {
    const frame = root.current;
    if (!frame) return;
    function update(size: number) {
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

  function updateCollapse(value: boolean) {
    if (collapse === "none") return;
    if (collapsed === undefined) setInternalCollapsed(value);
    if (value !== isCollapsed) onCollapsedChange?.(value);
  }

  const state: SidebarState = {
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
    dismiss: () => setDrawer(false),
  };

  return (
    <SidebarContext.Provider value={state}>
      <div ref={root} className={cx("yg-sidebar-layout", className)} data-edge={edge}
        data-variant={variant} data-compact={compact}
        data-panel={compact || (isCollapsed && collapse === "hide") ? "hidden" : rail ? "rail" : "full"}
        style={{ ...style, "--yg-sidebar-width": width } as CSSProperties}>
        {compact ? (
          <dialog ref={dialog} id={controls} aria-label={label} className="yg-sidebar-drawer"
            onCancel={(event) => { event.preventDefault(); state.dismiss(); }}
            onClick={(event) => {
              if (event.target instanceof Element && event.target.closest(".yg-agent-row, [data-sidebar-dismiss]")) {
                state.dismiss();
                return;
              }
              if (event.target !== event.currentTarget) return;
              const bounds = event.currentTarget.getBoundingClientRect();
              if (event.clientX < bounds.left || event.clientX > bounds.right ||
                  event.clientY < bounds.top || event.clientY > bounds.bottom) state.dismiss();
            }}>
            <div className="yg-sidebar-close">
              <IconButton icon="close" label={"Close " + label.toLowerCase()} onClick={state.dismiss} />
            </div>
            {navigation}
          </dialog>
        ) : <aside ref={panel} id={controls} className="yg-sidebar-panel" aria-label={label}
          aria-hidden={panelHidden || undefined} inert={panelHidden || undefined}>{navigation}</aside>}
        <div className="yg-sidebar-main">{children}</div>
      </div>
    </SidebarContext.Provider>
  );
}

export function SidebarTrigger({
  label,
  showLabel = false,
  size = "regular",
}: { label?: string; showLabel?: boolean; size?: ControlSize }) {
  const state = useContext(SidebarContext);
  if (!state) throw Error("Use SidebarTrigger inside SidebarLayout.");
  if (!state.canToggle) return null;
  const title = label ?? (state.expanded ? "Collapse navigation" : "Expand navigation");
  if (showLabel) return (
    <Button emphasis="quiet" size={size} aria-controls={state.controls} aria-expanded={state.expanded}
      onClick={(event) => state.toggle(event.currentTarget)}>
      <Icon name="menu" />{title}
    </Button>
  );
  return (
    <IconButton icon="menu" label={title} size={size}
      aria-controls={state.controls} aria-expanded={state.expanded}
      onClick={(event) => state.toggle(event.currentTarget)} />
  );
}

export function SidebarHeader({ children, compact }: { children: ReactNode; compact?: ReactNode }) {
  const state = useContext(SidebarContext);
  return <header className="yg-sidebar-header">{state?.rail ? compact : children}</header>;
}

export function SidebarContent({ children, label = "Navigation" }: { children: ReactNode; label?: string }) {
  return <nav className="yg-sidebar-content" aria-label={label}>{children}</nav>;
}

export function SidebarFooter({ children, compact }: { children: ReactNode; compact?: ReactNode }) {
  const state = useContext(SidebarContext);
  return <footer className="yg-sidebar-footer">{state?.rail ? compact : children}</footer>;
}

function Label({ children, icon, rail }: { children: string; icon?: ReactNode; rail: boolean }) {
  return (
    <>
      {icon != null && <span className="yg-sidebar-icon" aria-hidden="true">{icon}</span>}
      {rail && icon == null && (
        <span className="yg-sidebar-icon" aria-hidden="true">{[...children.trim()][0]?.toUpperCase() ?? "·"}</span>
      )}
      {!rail && <span className="yg-sidebar-label">{children}</span>}
    </>
  );
}

export function SidebarItem({
  label,
  href,
  icon,
  active = false,
  disabled = false,
  badge,
  description,
  action,
  onSelect,
}: {
  label: string;
  href?: string;
  icon?: ReactNode;
  active?: boolean;
  disabled?: boolean;
  badge?: ReactNode;
  description?: string;
  action?: ReactNode;
  onSelect?: () => void;
}) {
  const state = useContext(SidebarContext);
  const rail = state?.rail ?? false;
  const descriptionId = useId();
  const attrs = {
    className: "yg-sidebar-item",
    "aria-current": active ? "page" as const : undefined,
    "aria-label": rail || description ? label : undefined,
    title: rail ? label : undefined,
    "aria-describedby": !rail && description ? descriptionId : undefined,
  };
  const body = description && !rail
    ? <>{icon && <span className="yg-sidebar-icon" aria-hidden="true">{icon}</span>}
      <span className="yg-sidebar-item-copy">
        <span className="yg-sidebar-label">{label}</span>
        <span className="yg-sidebar-item-description" id={descriptionId}>{description}</span>
      </span>{badge}</>
    : <><Label icon={icon} rail={rail}>{label}</Label>{!rail && badge}</>;
  return (
    <div className="yg-sidebar-item-row">
      {href && !disabled ? (
        <a {...attrs} href={href} onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          onSelect?.();
          state?.dismiss();
        }}>{body}</a>
      ) : (
        <button {...attrs} type="button" disabled={disabled} onClick={() => {
          onSelect?.();
          state?.dismiss();
        }}>{body}</button>
      )}
      {!rail && action && <span className="yg-sidebar-item-action">{action}</span>}
    </div>
  );
}

export function SidebarGroup({ label, children, action }: {
  label?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  const id = useId();
  const rail = useContext(SidebarContext)?.rail;
  return (
    <section className="yg-sidebar-group" aria-labelledby={label && !rail ? id : undefined}
      aria-label={rail ? label : undefined}>
      {!rail && (label || action) && (
        <div className="yg-sidebar-group-header">
          {label && <h3 id={id}>{label}</h3>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function SidebarSubmenu({ label, icon, children, defaultOpen = false, containsCurrent = false, open: controlledOpen, onOpenChange }: {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  containsCurrent?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const id = useId();
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? localOpen;
  function setOpen(next: boolean) {
    if (controlledOpen === undefined) setLocalOpen(next);
    onOpenChange?.(next);
  }
  const state = useContext(SidebarContext);
  const rail = state?.rail ?? false;
  const expanded = !rail && open;
  return (
    <div className="yg-sidebar-submenu">
      <button type="button" className="yg-sidebar-item" aria-controls={id} data-contains-current={containsCurrent || undefined}
        aria-expanded={expanded} aria-label={rail ? label : undefined} title={rail ? label : undefined}
        onClick={() => {
          if (rail) { setOpen(true); state?.openPanel(); }
          else setOpen(!open);
        }}>
        <Label icon={icon} rail={rail}>{label}</Label>
        {!rail && <span className="yg-sidebar-chevron" aria-hidden="true"><Icon name="down" /></span>}
      </button>
      <div id={id} className="yg-sidebar-submenu-content" data-expanded={expanded}
        aria-hidden={!expanded} inert={!expanded}>
        <div>{children}</div>
      </div>
    </div>
  );
}
