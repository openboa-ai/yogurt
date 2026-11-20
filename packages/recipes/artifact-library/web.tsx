"use client";

import { useState, type ReactNode } from "react";
import { Button, EmptyResult, Heading, Inline, ResourceRow, SearchField, Select, Stack, type ResourceKind } from "@openboa/yogurt";

export interface LibraryArtifact {
  id: string;
  name: string;
  kind: ResourceKind;
  detail?: string;
  pinned?: boolean;
  preview?: ReactNode;
}

const categories = [
  { id: "all", label: "All types" },
  { id: "page", label: "Pages" },
  { id: "file", label: "Files" },
  { id: "media", label: "Media" },
  { id: "output", label: "Saved results" },
  { id: "link", label: "Links" },
  { id: "app", label: "Apps" },
  { id: "pinned", label: "Pinned" },
];

export function ArtifactLibrary({
  artifacts, selectedId, onOpen, onPinChange, onAdd, title = "Library",
}: {
  artifacts: readonly LibraryArtifact[];
  selectedId?: string;
  onOpen: (id: string) => void;
  onPinChange?: (id: string, pinned: boolean) => void;
  onAdd?: () => void;
  title?: string;
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const term = query.trim().toLowerCase();
  const visible = artifacts.filter((item) => (
    (type === "all" || type === item.kind || (type === "media" && item.kind === "image") || (type === "pinned" && item.pinned))
    && (item.name + " " + (item.detail ?? "")).toLowerCase().includes(term)
  ));
  const selected = visible.find((item) => item.id === selectedId);
  function reset() {
    setQuery("");
    setType("all");
  }
  return (
    <Stack gap={16} className="yg-artifact-library">
      <Inline className="yg-workspace-bar">
        <Heading>{title}</Heading>
        {onAdd && <Button onClick={onAdd}>Add source</Button>}
      </Inline>
      <div className="yg-artifact-filter">
        <SearchField label="Search library" value={query} onValueChange={setQuery} />
        <Select label="Type" value={type} options={categories}
          onChange={(event) => setType(event.currentTarget.value)} />
      </div>
      {visible.length === 0 ? (
        term ? <EmptyResult query={query} onClear={reset} /> :
        !artifacts.length ? <EmptyResult empty="No artifacts yet" /> :
        <Stack><p role="status">No matching artifacts.</p><Button emphasis="soft" onClick={reset}>Show all types</Button></Stack>
      ) : (
        <div className="yg-artifact-layout" data-preview={!!selected || undefined}>
          <ul className="yg-artifact-list" aria-label={title}>
            {visible.map((item) => (
              <ResourceRow key={item.id} resource={{ ...item, title: item.name }}
                selected={selected?.id === item.id} onOpen={onOpen} onPinChange={onPinChange} />
            ))}
          </ul>
          {selected && (
            <section className="yg-artifact-preview" aria-label={selected.name + " preview"}>
              <Heading level={3}>{selected.name}</Heading>
              {selected.preview ?? <p className="yg-help">{selected.detail ?? "Preview unavailable."}</p>}
            </section>
          )}
        </div>
      )}
    </Stack>
  );
}
