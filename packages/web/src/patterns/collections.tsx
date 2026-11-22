"use client";
import { words } from "../foundation/words.js";
import type { ReactNode } from "react";
import { SearchField, Checkbox } from "../controls/forms.js";
import { Result } from "../controls/feedback.js";
import { Button } from "../controls/actions.js";
import { type Option } from "../foundation/foundation.js";

export function Count({ value, label }: { value: number; label: string }) {
  return (
    <span className="yg-count" aria-label={value + " " + label}>
      {value}
    </span>
  );
}
export function FilterBar({
  label = "Search records",
  query,
  onQueryChange,
  children,
}: {
  label?: string;
  query: string;
  onQueryChange: (s: string) => void;
  children?: ReactNode;
}) {
  return (
    <div className="yg-filter" role="search" aria-label={label}>
      <SearchField label={label} value={query} onValueChange={onQueryChange} />
      {children}
    </div>
  );
}
export function List({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <ul aria-label={label} className="yg-list">
      {children}
    </ul>
  );
}
export function ListRow({
  title,
  description,
  leading,
  trailing,
  href,
  onActivate,
  current,
}: {
  title: string;
  description?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  href?: string;
  onActivate?: () => void;
  current?: boolean;
}) {
  const contents = (
    <>
      {leading && <span className="yg-leading">{leading}</span>}
      <span className="yg-row-label">
        {title}
        {description && <span className="yg-help">{description}</span>}
      </span>
      {trailing && <span className="yg-trailing">{trailing}</span>}
    </>
  );
  return (
    <li>
      {href ? (
        <a className="yg-row" href={href} aria-current={current || undefined}>
          {contents}
        </a>
      ) : onActivate ? (
        <button type="button" className="yg-row" onClick={onActivate} aria-current={current || undefined}>
          {contents}
        </button>
      ) : (
        <div className="yg-row">{contents}</div>
      )}
    </li>
  );
}
export function SelectionList({
  label,
  options,
  selected,
  onValueChange,
}: {
  label: string;
  options: Option[];
  selected: string[];
  onValueChange: (ids: string[]) => void;
}) {
  return (
    <fieldset className="yg-fieldset yg-selection-list">
      <legend className="yg-label">{label}</legend>
      {options.map((o) => (
        <Checkbox
          key={o.id}
          label={o.label}
          disabled={o.disabled}
          checked={selected.includes(o.id)}
          onCheckedChange={(v) =>
            onValueChange(
              v
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
