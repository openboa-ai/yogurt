"use client";
import { words } from "../foundation/words.js";
import type { ReactNode } from "react";
import { SearchField, Checkbox } from "../controls/forms.js";
import { Result } from "../controls/feedback.js";
import { Button } from "../controls/actions.js";
import { cx, type ControlSize, type Option } from "../foundation/foundation.js";

export function Count({ value, label }: { value: number; label: string }) {
  return (
    <span className="yg-count" aria-label={value + " " + label}>
      {value}
    </span>
  );
}
export function FilterBar({
  label = "Search records",
  placeholder,
  query,
  onQueryChange,
  size = "regular",
  hiddenLabel = false,
  children,
}: {
  label?: string;
  placeholder?: string;
  query: string;
  onQueryChange: (s: string) => void;
  size?: ControlSize;
  hiddenLabel?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="yg-filter" role="search" aria-label={label}>
      <SearchField
        label={label}
        placeholder={placeholder ?? (hiddenLabel ? label : undefined)}
        hiddenLabel={hiddenLabel}
        size={size}
        value={query}
        onValueChange={onQueryChange}
      />
      {children}
    </div>
  );
}
export function List({
  label,
  divided = false,
  className,
  children,
}: {
  label: string;
  divided?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <ul
      aria-label={label}
      className={cx("yg-list", className)}
      data-divided={divided || undefined}
    >
      {children}
    </ul>
  );
}
export function ListRow({
  title,
  inlineMeta,
  description,
  leading,
  value,
  actions,
  trailing,
  separator = false,
  href,
  onActivate,
  current,
  className,
}: {
  title: string;
  inlineMeta?: ReactNode;
  description?: string;
  leading?: ReactNode;
  value?: ReactNode;
  actions?: ReactNode;
  trailing?: ReactNode;
  separator?: boolean;
  href?: string;
  onActivate?: () => void;
  current?: boolean;
  className?: string;
}) {
  const hasSiblingEnd = Boolean(value || actions);
  const labelSlot = (
    <span className="yg-row-label">
      <span className="yg-row-title-line">
        <span className="yg-row-title">{title}</span>
        {inlineMeta && <span className="yg-row-inline-meta">{inlineMeta}</span>}
      </span>
      {description && <span className="yg-help">{description}</span>}
    </span>
  );
  const mainContents = (
    <>
      {leading && <span className="yg-leading">{leading}</span>}
      {labelSlot}
      {!hasSiblingEnd && trailing && <span className="yg-trailing">{trailing}</span>}
    </>
  );
  const endSlots = (hasSiblingEnd || (trailing && hasSiblingEnd)) ? (
    <span className="yg-row-end">
      {value && <span className="yg-row-value">{value}</span>}
      {trailing && <span className="yg-trailing">{trailing}</span>}
      {actions && <span className="yg-row-actions">{actions}</span>}
    </span>
  ) : null;

  if ((href || onActivate) && hasSiblingEnd) {
    return (
      <li className={cx("yg-list-item", className)} data-separator={separator || undefined}>
        <div className="yg-row yg-row-split" data-current={current || undefined}>
          {href ? (
            <a className="yg-row-trigger" href={href} aria-current={current || undefined}>
              {mainContents}
            </a>
          ) : (
            <button
              type="button"
              className="yg-row-trigger"
              onClick={onActivate}
              aria-current={current || undefined}
            >
              {mainContents}
            </button>
          )}
          {endSlots}
        </div>
      </li>
    );
  }

  return (
    <li className={cx("yg-list-item", className)} data-separator={separator || undefined}>
      {href ? (
        <a className="yg-row" href={href} aria-current={current || undefined}>
          {mainContents}
        </a>
      ) : onActivate ? (
        <button
          type="button"
          className="yg-row"
          onClick={onActivate}
          aria-current={current || undefined}
        >
          {mainContents}
        </button>
      ) : (
        <div className="yg-row" data-current={current || undefined}>
          {mainContents}
          {endSlots}
        </div>
      )}
    </li>
  );
}
export function SelectionList({
  label,
  options,
  selected,
  onValueChange,
  selectAllLabel,
}: {
  label: string;
  options: Option[];
  selected: string[];
  onValueChange: (ids: string[]) => void;
  selectAllLabel?: string;
}) {
  const enabled = options.filter((o) => !o.disabled);
  const chosen = enabled.filter((o) => selected.includes(o.id));
  const all = enabled.length > 0 && chosen.length === enabled.length;
  const masterState: boolean | "indeterminate" = all
    ? true
    : chosen.length > 0
      ? "indeterminate"
      : false;
  return (
    <fieldset className="yg-fieldset yg-selection-list">
      <legend className="yg-label">{label}</legend>
      {selectAllLabel && (
        <div className="yg-selection-list-all">
          <Checkbox
            label={selectAllLabel}
            disabled={!enabled.length}
            checked={masterState}
            onCheckedChange={() => {
              const keys = new Set(selected);
              for (const option of enabled) {
                if (all) keys.delete(option.id);
                else keys.add(option.id);
              }
              onValueChange([...keys]);
            }}
          />
        </div>
      )}
      {options.map((o) => (
        <Checkbox
          key={o.id}
          label={o.label}
          disabled={o.disabled}
          checked={selected.includes(o.id)}
          onCheckedChange={(v) =>
            onValueChange(
              v === true
                ? [...new Set([...selected, o.id])]
                : selected.filter((id) => id !== o.id),
            )
          }
        />
      ))}
    </fieldset>
  );
}
export function EmptyResult({
  query,
  onClear,
  empty = words["state.empty"],
}: {
  query?: string;
  onClear?: () => void;
  empty?: string;
}) {
  return query ? (
    <Result
      title={words["state.no-matches"]}
      action={
        onClear && (
          <Button emphasis="soft" onClick={onClear}>
            {words["action.clear-search"]}
          </Button>
        )
      }
    >
      No records match “{query}”.
    </Result>
  ) : (
    <Result title={empty}>New records will appear here.</Result>
  );
}
