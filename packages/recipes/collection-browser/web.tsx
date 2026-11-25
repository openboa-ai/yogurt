"use client";
import { useState } from "react";
import {
  Card,
  Count,
  EmptyResult,
  FilterBar,
  List,
  ListHeader,
  ListRow,
  Stack,
  Toggle,
} from "@openboa/yogurt";
export interface BrowserRecord {
  id: string;
  title: string;
  detail: string;
  archived?: boolean;
}
export function CollectionBrowser({
  title,
  records,
  onOpen,
  selectedId,
}: {
  title: string;
  records: BrowserRecord[];
  onOpen: (id: string) => void;
  selectedId?: string;
}) {
  const [query, setQuery] = useState(""),
    [archives, setArchives] = useState(false);
  const shown = records.filter(
    (r) =>
      (archives || !r.archived) &&
      (r.id + " " + r.title + " " + r.detail)
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <Card className="yg-collection-browser" density="regular">
      <Stack gap={10}>
        <ListHeader
          title={title}
          action={<Count value={shown.length} label="views" />}
        />
        <FilterBar
          label="Find a view"
          placeholder="Find a view"
          hiddenLabel
          size="compact"
          query={query}
          onQueryChange={setQuery}
        >
          <Toggle pressed={archives} onPressedChange={setArchives}>
            Include archived
          </Toggle>
        </FilterBar>
        {shown.length ? (
          <List label={title} divided>
            {shown.map((r) => (
              <ListRow
                key={r.id}
                title={r.title}
                description={r.detail}
                current={r.id === selectedId}
                onActivate={() => onOpen(r.id)}
              />
            ))}
          </List>
        ) : (
          <EmptyResult
            query={query}
            empty="No views yet"
            onClear={() => setQuery("")}
          />
        )}
      </Stack>
    </Card>
  );
}
