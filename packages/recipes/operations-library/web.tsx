"use client";
import { useState, type ReactNode } from "react";
import {
  Badge,
  Button,
  Count,
  EmptyResult,
  FilterBar,
  ListHeader,
  Result,
  RoutineRow,
  Skeleton,
  Stack,
  Tabs,
  Text,
  type RoutineRecord,
  type Tone,
} from "@openboa/yogurt";

type Category = "routines" | "skills" | "connections";
type CapabilityState = "ready" | "restricted" | "connected" | "disconnected";

export interface CapabilityRecord {
  id: string;
  title: string;
  detail: string;
  state: CapabilityState;
}

const states = {
  ready: { label: "Ready", tone: "success" },
  restricted: { label: "Restricted", tone: "warning" },
  connected: { label: "Connected", tone: "success" },
  disconnected: { label: "Disconnected", tone: "neutral" },
} satisfies Record<CapabilityState, { label: string; tone: Tone }>;

function CapabilityRows({
  group,
  items,
  onInspect,
}: {
  group: "skills" | "connections";
  items: readonly CapabilityRecord[];
  onInspect?: (group: Category, id: string) => void;
}) {
  return (
    <ul className="yg-operations-list" aria-label={group}>
      {items.map((item) => {
        const state = states[item.state];
        return (
          <li className="yg-routine-row" key={item.id}>
            <div className="yg-work-event-content">
              <strong>{item.title}</strong>
              <Text variant="help">{item.detail}</Text>
            </div>
            <div className="yg-operations-actions">
              <Badge tone={state.tone}>{state.label}</Badge>
              {onInspect && (
                <Button
                  emphasis="quiet"
                  size="compact"
                  aria-label={`Inspect ${item.title}`}
                  onClick={() => onInspect(group, item.id)}
                >
                  Details
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function OperationsLibrary({
  routines,
  skills,
  connections,
  loading,
  onInspect,
  onEditRoutine,
  onRunRoutine,
  onAdd,
}: {
  routines: readonly RoutineRecord[];
  skills: readonly CapabilityRecord[];
  connections: readonly CapabilityRecord[];
  loading?: boolean;
  onInspect?: (group: Category, id: string) => void;
  onEditRoutine?: (id: string) => void;
  onRunRoutine?: (id: string) => void;
  onAdd?: (group: Category) => void;
}) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Category>("routines");
  const term = query.trim().toLowerCase();
  const matches = (text: string) => text.toLowerCase().includes(term);
  const visible = {
    routines: routines.filter((r) => matches(`${r.title} ${r.cadence}`)),
    skills: skills.filter((s) => matches(`${s.title} ${s.detail}`)),
    connections: connections.filter((c) => matches(`${c.title} ${c.detail}`)),
  };
  function panel(group: Category, contents: ReactNode) {
    if (loading) return <Skeleton label={`Loading ${group}`} />;
    if (visible[group].length > 0) return contents;
    if (term)
      return <EmptyResult query={query.trim()} onClear={() => setQuery("")} />;
    return (
      <Result
        title={`No ${group} yet`}
        action={
          onAdd && (
            <Button emphasis="soft" onClick={() => onAdd(group)}>
              {group === "routines"
                ? "Add a routine"
                : group === "skills"
                  ? "Add a skill"
                  : "Add a connection"}
            </Button>
          )
        }
      />
    );
  }
  return (
    <Stack gap={12} className="yg-operations-library">
      <ListHeader
        title="Operations"
        action={!loading && <Count label={tab} value={visible[tab].length} />}
      />
      <FilterBar label="Search operations" query={query} onQueryChange={setQuery} />
      <div aria-busy={loading || undefined}>
        <Tabs
          label="Operations type"
          value={tab}
          onValueChange={(id) => setTab(id as Category)}
          items={[
            {
              id: "routines",
              label: "Routines",
              panel: panel(
                "routines",
                <ul className="yg-operations-list" aria-label="Routines">
                  {visible.routines.map((routine) => (
                    <li key={routine.id}>
                      <RoutineRow
                        routine={routine}
                        onInspect={onInspect && ((id) => onInspect("routines", id))}
                        onEdit={onEditRoutine}
                        onRun={onRunRoutine}
                      />
                    </li>
                  ))}
                </ul>,
              ),
            },
            {
              id: "skills",
              label: "Skills",
              panel: panel(
                "skills",
                <CapabilityRows group="skills" items={visible.skills} onInspect={onInspect} />,
              ),
            },
            {
              id: "connections",
              label: "Connections",
              panel: panel(
                "connections",
                <CapabilityRows group="connections" items={visible.connections} onInspect={onInspect} />,
              ),
            },
          ]}
        />
      </div>
    </Stack>
  );
}
