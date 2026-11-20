"use client";
import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  ConfirmDialog,
  Count,
  ListHeader,
  Receipt,
  Result,
  SegmentedControl,
  Skeleton,
  Stack,
  Text,
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
  return (
    <Stack gap={12} className="yg-attention-inbox">
      <ListHeader
        title="Attention"
        action={!loading && <Count label="items" value={visible.length} />}
      />
      <SegmentedControl
        label="Filter attention"
        value={filter}
        onValueChange={setFilter}
        options={filters}
      />
      {loading ? (
        <Skeleton label="Loading attention items" />
      ) : visible.length > 0 ? (
        <ul className="yg-operations-list" aria-label="Attention items">
          {visible.map((item) => {
            const current = receiptFor(item);
            const canReview =
              item.review &&
              onReview &&
              current?.state !== "pending" &&
              current?.state !== "confirmed";
            return (
              <li className="yg-attention-card" key={item.id}>
                <WorkEvent event={item} />
                {current && <Receipt record={current} />}
                {(item.unread || item.attention || canReview) && (
                  <div className="yg-operations-line">
                    {item.unread && <Badge tone="brand">Unread</Badge>}
                    {item.attention && <Text variant="help">Needs attention</Text>}
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
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <Result
          title={
            filter === "all"
              ? "You're all caught up"
              : filter === "unread"
                ? "No unread items"
                : "Nothing needs attention"
          }
          action={
            filter !== "all" && (
              <Button emphasis="soft" onClick={() => setFilter("all")}>
                Show all
              </Button>
            )
          }
        />
      )}
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
  );
}
