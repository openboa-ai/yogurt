"use client";

import { useState, type ReactNode } from "react";
import { Button, Card, EmptyResult, FormRow, ResourceRow, SearchField, Select, Stack, Text, type ResourceKind } from "@openboa/yogurt";

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
    <Card
      title={title}
      density="regular"
      className="yg-artifact-library"
      headerAction={
        onAdd && (
          <Button size="compact" emphasis="filled" tone="brand" onClick={onAdd}>
            Add source
          </Button>
        )
      }
    >
      <Stack gap={12}>
        <FormRow className="yg-artifact-filter" align="center">
          <SearchField
            label="Search library"
            placeholder="Search library"
            hiddenLabel
            size="compact"
            value={query}
            onValueChange={setQuery}
          />
          <Select
            label="Type"
            hiddenLabel
            size="compact"
            value={type}
            options={categories}
            onValueChange={setType}
          />
        </FormRow>
        {visible.length === 0 ? (
          term ? <EmptyResult query={query} onClear={reset} /> :
          !artifacts.length ? <EmptyResult empty="No artifacts yet" /> :
          <Stack gap={8}>
            <Text variant="help" role="status">No matching artifacts.</Text>
            <div><Button emphasis="soft" size="compact" onClick={reset}>Show all types</Button></div>
          </Stack>
        ) : (
          <div className="yg-artifact-layout" data-preview={!!selected || undefined}>
            <ul className="yg-artifact-list" aria-label={title}>
              {visible.map((item) => (
                <ResourceRow key={item.id} resource={{ ...item, title: item.name }}
                  selected={selected?.id === item.id} onOpen={onOpen} onPinChange={onPinChange} />
              ))}
            </ul>
            {selected && (
              <Card title={selected.name} className="yg-artifact-preview" variant="raised">
                <div role="region" aria-label={selected.name + " preview"}>
                  {selected.preview ?? <Text variant="help">{selected.detail ?? "Preview unavailable."}</Text>}
                </div>
              </Card>
            )}
          </div>
        )}
      </Stack>
    </Card>
  );
}
