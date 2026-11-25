"use client";

import { useId, type ReactNode } from "react";
import { Button } from "../controls/actions.js";
import { Icon, Text, type IconName } from "../foundation/foundation.js";

export type ResourceKind = "file" | "page" | "image" | "media" | "link" | "app" | "output";

export interface WorkspaceResource {
  id: string;
  title: string;
  kind: ResourceKind;
  detail?: string;
  pinned?: boolean;
}

export interface WorkspaceThread {
  id: string;
  title: string;
  preview?: string;
  updatedAt?: { dateTime: string; label: string };
  unread?: boolean;
}

export const resourceLabels: Record<ResourceKind, string> = {
  file: "File",
  page: "Page",
  image: "Image",
  media: "Media",
  link: "Link",
  app: "Connected app",
  output: "Saved output",
};
const resourceIcons: Record<ResourceKind, IconName> = {
  file: "copy",
  page: "copy",
  image: "info",
  media: "info",
  link: "arrow",
  app: "menu",
  output: "check",
};

function RowBody({
  label,
  describedBy,
  selected,
  onOpen,
  children,
}: {
  label: string;
  describedBy?: string;
  selected: boolean;
  onOpen?: () => void;
  children: ReactNode;
}) {
  if (!onOpen) return <div className="yg-workspace-row-body">{children}</div>;
  return (
    <button
      type="button"
      className="yg-workspace-row-body"
      aria-label={label}
      aria-describedby={describedBy}
      aria-current={selected || undefined}
      onClick={onOpen}
    >
      {children}
    </button>
  );
}

export function ResourceRow({
  resource,
  selected = false,
  onOpen,
  onPinChange,
}: {
  resource: WorkspaceResource;
  selected?: boolean;
  onOpen?: (id: string) => void;
  onPinChange?: (id: string, pinned: boolean) => void;
}) {
  const kind = resourceLabels[resource.kind];
  const detailId = useId();
  return (
    <li className="yg-workspace-row yg-resource-row" data-selected={selected}>
      <RowBody
        label={"Open " + resource.title + ", " + kind}
        describedBy={resource.detail ? detailId : undefined}
        selected={selected}
        onOpen={onOpen && (() => onOpen(resource.id))}
      >
        <span className="yg-resource-kind"><Icon name={resourceIcons[resource.kind]} /></span>
        <span className="yg-workspace-row-copy">
          <span className="yg-workspace-row-title">{resource.title}</span>
          <Text variant="help">
            {kind}{resource.detail && <span id={detailId}> · {resource.detail}</span>}
          </Text>
        </span>
      </RowBody>
      {onPinChange && (
        <Button
          size="compact"
          emphasis="quiet"
          aria-label={"Pin " + resource.title}
          aria-pressed={Boolean(resource.pinned)}
          onClick={() => onPinChange(resource.id, !resource.pinned)}
        >
          {resource.pinned && <Icon name="check" />}
          Pin
        </Button>
      )}
    </li>
  );
}

export function ThreadRow({
  thread,
  selected = false,
  onOpen,
}: {
  thread: WorkspaceThread;
  selected?: boolean;
  onOpen?: (id: string) => void;
}) {
  const detailId = useId();
  const timeId = useId();
  const describedBy = [thread.preview && detailId, thread.updatedAt && timeId].filter(Boolean).join(" ");
  return (
    <li className="yg-workspace-row yg-thread-row" data-selected={selected}>
      <RowBody
        label={"Open " + thread.title + (thread.unread ? ", unread" : "")}
        describedBy={describedBy || undefined}
        selected={selected}
        onOpen={onOpen && (() => onOpen(thread.id))}
      >
        <span className="yg-workspace-row-copy">
          <span className="yg-row-title-line">
            <span className="yg-workspace-row-title">{thread.title}</span>
            {thread.unread && <span className="yg-signal-dot" role="img" aria-label="Unread" />}
          </span>
          {thread.preview && <Text id={detailId} variant="help">{thread.preview}</Text>}
        </span>
        {thread.updatedAt && (
          <span className="yg-thread-meta">
            <time id={timeId} dateTime={thread.updatedAt.dateTime}>{thread.updatedAt.label}</time>
          </span>
        )}
      </RowBody>
    </li>
  );
}
