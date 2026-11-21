"use client";
import { useLayoutEffect, useRef, type ComponentProps, type ReactNode } from "react";
import { SegmentedControl as SDKSegment, SegmentedControlItem } from "@ui-sdk/react/segmented-control";
import { Tabs as SDKTabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs";
import { Button } from "./actions.js";
import { type Choices } from "./forms.js";
import { cx, Icon, type IconName } from "../foundation/foundation.js";
import { animateTabMarker } from "./tab-motion.js";

export function Link(props: ComponentProps<"a"> & { href: string }) {
  return <a {...props} className={cx("yg-link", props.className)} />;
}
export interface Destination {
  id: string;
  label: string;
  href: string;
}
export function Breadcrumb({
  items,
  label = "Breadcrumb",
}: {
  items: Destination[];
  label?: string;
}) {
  return (
    <nav aria-label={label} className="yg-breadcrumb">
      <ol>
        {items.map((item, i) => (
          <li key={item.id}>
            {i > 0 && <Icon name="next" />}
            {i === items.length - 1 ? (
              <span aria-current="page">{item.label}</span>
            ) : (
              <Link href={item.href}>{item.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
export function NavigationList({
  items,
  current,
  label,
}: {
  items: Destination[];
  current: string;
  label: string;
}) {
  return (
    <nav aria-label={label} className="yg-nav-list">
      {items.map((o) => (
        <a
          key={o.id}
          href={o.href}
          aria-current={o.id === current ? "page" : undefined}
        >
          {o.label}
        </a>
      ))}
    </nav>
  );
}

function SelectionMarker({ selector, presentation }: { selector: string; presentation?: "pill" | "dock" }) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const marker = ref.current;
    const group = marker?.parentElement;
    if (!marker || !group) return;
    if (presentation) return animateTabMarker(marker, group, presentation);

    let previous: {
      button: HTMLButtonElement;
      x: number;
      y: number;
      width: number;
      height: number;
    } | undefined;
    const measure = (allowSlide: boolean) => {
      const button = group.querySelector<HTMLButtonElement>(selector);
      if (!button?.offsetWidth || !button.offsetHeight) {
        marker.removeAttribute("data-ready");
        marker.removeAttribute("data-slide");
        previous = undefined;
        return;
      }

      const { offsetLeft: x, offsetTop: y, offsetWidth: width, offsetHeight: height } = button;
      if (previous?.button === button && previous.x === x && previous.y === y &&
          previous.width === width && previous.height === height) return;

      // A move on the same row follows selection. Reflow and row changes settle immediately.
      const switched = allowSlide && previous?.button !== button;
      const labelMoving = previous?.button === button && marker.hasAttribute("data-slide") &&
        Boolean(button.querySelector(".yg-tab-label")?.getAnimations().length);
      const canSlide = previous?.y === y && (switched || labelMoving);
      if (canSlide && switched && previous) marker.toggleAttribute("data-forward", x >= previous.x);
      marker.toggleAttribute("data-slide", Boolean(canSlide));
      marker.style.setProperty("--yg-selection-x", `${x}px`);
      marker.style.setProperty("--yg-selection-y", `${y}px`);
      marker.style.setProperty("--yg-selection-width", `${width}px`);
      marker.style.setProperty("--yg-selection-height", `${height}px`);
      marker.setAttribute("data-ready", "");
      previous = { button, x, y, width, height };
    };

    const sizes = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => measure(false));
    const observeSizes = () => {
      if (!sizes) return;
      sizes.disconnect();
      sizes.observe(group);
      group.querySelectorAll(":scope > button").forEach((button) => sizes.observe(button));
    };
    const changes = new MutationObserver((records) => {
      if (records.some((record) => record.type === "childList")) observeSizes();
      measure(true);
    });
    changes.observe(group, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["aria-selected", "data-state", "dir"],
    });
    observeSizes();
    measure(false);

    return () => {
      sizes?.disconnect();
      changes.disconnect();
    };
  }, [presentation, selector]);

  return <span ref={ref} className="yg-selection-marker" aria-hidden="true" />;
}

export function SegmentedControl({
  label,
  options,
  value,
  onValueChange,
  disabled,
}: Choices) {
  return (
    <SDKSegment
      className="yg-segment"
      aria-label={label}
      value={value}
      disabled={disabled}
      loop={false}
      onValueChange={(v) => {
        if (v) onValueChange(v);
      }}
    >
      <SelectionMarker selector=':scope > button[data-state="on"]' />
      {options.map((o) => (
        <SegmentedControlItem key={o.id} value={o.id} disabled={o.disabled}
          render={(props, state) => <button {...props} data-state={state.checked ? "on" : "off"} />}>
          {o.label}
        </SegmentedControlItem>
      ))}
    </SDKSegment>
  );
}
export function Tabs({
  label,
  items,
  value,
  onValueChange,
  presentation = "pill",
}: {
  label: string;
  items: { id: string; label: string; panel: ReactNode; icon?: IconName; disabled?: boolean }[];
  value: string;
  onValueChange: (id: string) => void;
  presentation?: "pill" | "dock";
}) {
  const enabled = items.filter((o) => !o.disabled);
  const selected = enabled.some((i) => i.id === value) ? value : enabled[0]?.id;
  return (
    <SDKTabs className="yg-tabs" data-presentation={presentation} value={selected ?? null}
      onValueChange={(id) => { if (id !== null) onValueChange(id); }}>
      <TabsList aria-label={label} onKeyDownCapture={(event) => {
        const current = (event.target as HTMLElement).closest<HTMLButtonElement>('[role="tab"]');
        if (!current || !event.currentTarget.contains(current) || !enabled.length ||
          event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        const index = enabled.findIndex((item) => item.id === current.dataset.ygTabId);
        if (index < 0) return;
        const step = getComputedStyle(event.currentTarget).direction === "rtl" ? -1 : 1;
        const next = ({ ArrowRight: (index + step + enabled.length) % enabled.length,
          ArrowLeft: (index - step + enabled.length) % enabled.length,
          Home: 0, End: enabled.length - 1 } as Record<string, number | undefined>)[event.key];
        if (next === undefined) return;
        event.preventDefault();
        const id = enabled[next].id;
        [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')]
          .find((tab) => tab.dataset.ygTabId === id)?.focus();
        onValueChange(id);
      }}>
        <SelectionMarker selector=':scope > button[aria-selected="true"]' presentation={presentation} />
        {items.map((o) => (
          <TabsTab key={o.id} value={o.id} disabled={o.disabled} data-yg-tab-id={o.id}
            onClick={() => { if (o.id === selected) onValueChange(o.id); }}
            render={(props, state) => <button {...props} disabled={state.disabled} />}>
            {o.icon ? <><Icon name={o.icon} /><span className="yg-tab-label"><span>{o.label}</span></span></> : o.label}
          </TabsTab>
        ))}
      </TabsList>
      {items.map((o) => (
        <TabsPanel key={o.id} value={o.id} keepMounted tabIndex={0}>
          {o.panel}
        </TabsPanel>
      ))}
    </SDKTabs>
  );
}
export function Pagination({
  page,
  pages,
  onPageChange,
  label = "Pages",
}: {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
  label?: string;
}) {
  if (pages < 1) return null;
  return (
    <nav aria-label={label} className="yg-inline">
      <Button
        emphasis="quiet"
        size="compact"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      <span className="yg-meta" aria-live="polite">
        <span className="yg-pagination-value" key={page}>{page}</span> of {pages}
      </span>
      <Button
        emphasis="quiet"
        size="compact"
        disabled={page >= pages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </nav>
  );
}
