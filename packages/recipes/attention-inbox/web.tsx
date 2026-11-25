"use client";
import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  Count,
  ListHeader,
  Receipt,
  Result,
  Skeleton,
  Stack,
  Tabs,
  WorkEvent,
  type DecisionRef,
  type ReceiptRecord,
  type WorkEventRecord,
} from "@openboa/yogurt";

export interface AttentionItem extends WorkEventRecord {
  unread: boolean;
  attention: boolean;
  review?: {
    revision: string;
    consequence: string;
    confirmLabel: string;
    available: boolean;
  };
}

export interface AttentionReceipt extends ReceiptRecord {
  revision: string;
}

const filters = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "attention", label: "Needs attention" },
];

export function AttentionInbox({
  items,
  loading,
  onMarkRead,
  onReview,
  receipts,
}: {
  items: readonly AttentionItem[];
  loading?: boolean;
  onMarkRead?: (id: string) => void;
  onReview?: (decision: DecisionRef) => void;
  receipts?: Readonly<Record<string, AttentionReceipt | undefined>>;
}) {
  const [filter, setFilter] = useState("all");
  const [preview, setPreview] = useState<DecisionRef | null>(null);
  const visible = items.filter(
    (item) =>
      filter === "all" ||
      (filter === "unread" && item.unread) ||
      (filter === "attention" && item.attention),
  );
  function receiptFor(item: AttentionItem) {
    const receipt = receipts?.[item.id];
    return receipt?.id === item.id && receipt.revision === item.review?.revision
      ? receipt
      : undefined;
  }
  const reviewed = !loading && items.find((item) => item.id === preview?.id);
  const decision =
    reviewed && reviewed.review?.revision === preview?.revision && reviewed.review
      ? {
          ...reviewed.review,
          id: reviewed.id,
          title: reviewed.title,
          available:
            reviewed.review.available &&
            receiptFor(reviewed)?.state !== "pending" &&
            receiptFor(reviewed)?.state !== "confirmed",
        }
      : null;
  const canShowPreview = Boolean(decision && onReview);
  useEffect(() => {
    if (preview && !canShowPreview) setPreview(null);
  }, [canShowPreview, preview]);
  function renderList(tabId: string) {
    const filtered = items.filter(
      (item) =>
        tabId === "all" ||
        (tabId === "unread" && item.unread) ||
        (tabId === "attention" && item.attention),
    );
    if (loading) return <Skeleton label="Loading attention items" />;
    if (filtered.length === 0) {
      return (
        <Result
          title={
            tabId === "all"
              ? "You're all caught up"
              : tabId === "unread"
                ? "No unread items"
                : "Nothing needs attention"
          }
          action={
            tabId !== "all" && (
              <Button emphasis="soft" onClick={() => setFilter("all")}>
                Show all
              </Button>
            )
          }
        />
      );
    }
    return (
      <ul className="yg-operations-list" aria-label="Attention items">
        {filtered.map((item) => {
          const current = receiptFor(item);
          const canReview =
            item.review &&
            onReview &&
            current?.state !== "pending" &&
            current?.state !== "confirmed";
          const inlineStatus = (item.unread || item.attention) ? (
            <>
              {item.attention && <Badge tone="warning">Needs attention</Badge>}
              {item.unread && <span className="yg-signal-dot" role="img" aria-label="Unread" />}
            </>
          ) : undefined;
          const rowActions = (canReview || (item.unread && onMarkRead)) ? (
            <>
              {item.unread && onMarkRead && (
                <Button
                  emphasis="quiet"
                  size="compact"
                  aria-label={`Mark ${item.title} as read`}
                  onClick={() => onMarkRead(item.id)}
                >
                  Mark read
                </Button>
              )}
              {canReview && item.review && (
                <Button
                  emphasis="soft"
                  size="compact"
                  aria-label={`Review ${item.title}`}
                  onClick={() => {
                    if (item.review) setPreview({ id: item.id, revision: item.review.revision });
                  }}
                >
                  Review
                </Button>
              )}
            </>
          ) : undefined;
          return (
            <li className="yg-attention-item" key={item.id}>
              <WorkEvent
                event={item}
                hideStateBadge={item.attention}
                inlineMeta={inlineStatus}
                actions={rowActions}
              />
              {current && <Receipt record={current} />}
            </li>
          );
        })}
      </ul>
    );
  }
  return (
    <Card className="yg-attention-inbox">
      <Stack gap={12}>
        <ListHeader
          title="Attention"
          action={!loading && <Count label="items" value={visible.length} />}
        />
        <Tabs
          label="Filter attention"
          presentation="underline"
          value={filter}
          onValueChange={setFilter}
          items={filters.map((entry) => ({
            id: entry.id,
            label: entry.label,
            panel: renderList(entry.id),
          }))}
        />
        {decision && onReview && (
          <ConfirmDialog
            decision={decision}
            open
            onOpenChange={(open) => {
              if (!open) setPreview(null);
            }}
            onConfirm={onReview}
          />
        )}
      </Stack>
    </Card>
  );
}
