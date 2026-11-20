"use client";
import { useId, useLayoutEffect, useRef, type ComponentProps, type ReactNode } from "react";
import { SegmentedControl as SDKSegment } from "@openai/apps-sdk-ui/components/SegmentedControl";
import { Button } from "./actions.js";
import { type Choices } from "./forms.js";
import { cx, Icon, type IconName } from "../foundation/foundation.js";

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

function SelectionMarker({ selector }: { selector: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const marker = ref.current;
    const group = marker?.parentElement;
    if (!marker || !group) return;

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
      const canSlide = allowSlide && previous && previous.button !== button && previous.y === y;
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
  }, [selector]);

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
      onChange={(v) => {
        if (v) onValueChange(v);
      }}
      pill={false}
    >
      <SelectionMarker selector=':scope > button[data-state="on"]' />
      {options.map((o) => (
        <SDKSegment.Option key={o.id} value={o.id} disabled={o.disabled}>
          {o.label}
        </SDKSegment.Option>
      ))}
    </SDKSegment>
  );
}
export function Tabs({
  label,
  items,
  value,
  onValueChange,
}: {
  label: string;
  items: { id: string; label: string; panel: ReactNode; icon?: IconName; disabled?: boolean }[];
  value: string;
  onValueChange: (id: string) => void;
}) {
  const uid = useId();
  const refs = useRef(new Map<string, HTMLButtonElement>());
  const enabled = items.filter((o) => !o.disabled);
  const selected = enabled.some((i) => i.id === value) ? value : enabled[0]?.id;
  return (
    <div className="yg-tabs">
      <div role="tablist" aria-label={label}>
        <SelectionMarker selector=':scope > button[aria-selected="true"]' />
        {items.map((o) => (
          <button
            key={o.id}
            type="button"
            role="tab"
            id={uid + "-t-" + o.id}
            aria-controls={uid + "-p-" + o.id}
            aria-selected={selected === o.id}
            tabIndex={selected === o.id ? 0 : -1}
            disabled={o.disabled}
            ref={(el) => {
              if (el) refs.current.set(o.id, el);
              else refs.current.delete(o.id);
            }}
            onClick={() => onValueChange(o.id)}
            onKeyDown={(e) => {
              const index = enabled.findIndex((item) => item.id === o.id);
              const next = (
                {
                  ArrowRight: (index + 1) % enabled.length,
                  ArrowLeft: (index + enabled.length - 1) % enabled.length,
                  Home: 0,
                  End: enabled.length - 1,
                } as Record<string, number | undefined>
              )[e.key];
              if (next !== undefined) {
                e.preventDefault();
                refs.current.get(enabled[next].id)?.focus();
                onValueChange(enabled[next].id);
              }
            }}
          >
            {o.icon ? <><Icon name={o.icon} /><span className="yg-tab-label">{o.label}</span></> : o.label}
          </button>
        ))}
      </div>
      {items.map((o) => (
        <div
          key={o.id}
          role="tabpanel"
          tabIndex={0}
          id={uid + "-p-" + o.id}
          aria-labelledby={uid + "-t-" + o.id}
          hidden={selected !== o.id}
        >
          {o.panel}
        </div>
      ))}
    </div>
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
        {page} of {pages}
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
