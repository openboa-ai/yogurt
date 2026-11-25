import { useState } from "react";
import {
  ProjectSettings,
  type Preferences,
} from "../../../packages/recipes/project-settings/web";
import { CollectionBrowser } from "../../../packages/recipes/collection-browser/web";
import { DecisionReview } from "../../../packages/recipes/decision-review/web";
import {
  ConversationPanel,
  type ThreadMessage,
} from "../../../packages/recipes/conversation-panel/web";
import { Stack, Status, Text } from "@openboa/yogurt";
import { scopedExamples } from "./scoped-examples";
const initial: Preferences = { notify: true, digest: "weekly" };
const records = [
  { id: "release", title: "Release review", detail: "Sourdough" },
  { id: "intake", title: "Project intake", detail: "Meatball" },
  { id: "archive", title: "October notes", detail: "Yogurt", archived: true },
];
export function BlockExample({ id }: { id: string }) {
  const ScopedExample = scopedExamples[id];
  return ScopedExample ? <ScopedExample id={id} /> : <RecipeExample key={id} id={id} />;
}

function RecipeExample({ id }: { id: string }) {
  const [draft, setDraft] = useState(initial),
    [saved, setSaved] = useState(initial),
    [status, setStatus] = useState(""),
    [input, setInput] = useState("");
  const [messages, setMessages] = useState<ThreadMessage[]>([
    { id: "first", speaker: "Kai", body: "The draft is ready for review.", time: "09:40", variant: "received" },
    { id: "second", speaker: "You", body: "Verified the summary metrics — ready to share.", time: "09:42", variant: "sent" },
  ]);
  if (id === "project-settings")
    return (
      <Stack>
        <ProjectSettings
          draft={draft}
          saved={saved}
          onChange={(v) => {
            setDraft(v);
            setStatus("");
          }}
          onSave={(v) => {
            setSaved(v);
            setStatus("Settings saved");
          }}
        />
        {status && <Status>{status}</Status>}
      </Stack>
    );
  if (id === "collection-browser")
    return (
      <Stack>
        <CollectionBrowser
          title="Project views"
          records={records}
          onOpen={(key) =>
            setStatus(records.find((r) => r.id === key)?.title + " opened")
          }
        />
        {status && <Status>{status}</Status>}
      </Stack>
    );
  if (id === "decision-review")
    return (
      <DecisionReview
        title="Weekly review"
        facts={[
          { id: "project", label: "Project", value: "Sourdough" },
          { id: "owner", label: "Owner", value: "Sam Park" },
        ]}
        observation={{
          source: "Local sample",
          asOf: "2026-11-20",
          timeLabel: "Nov 20",
        }}
        decision={{
          id: "review",
          revision: "3",
          title: "Archive this review?",
          consequence: "It will move to archived views.",
          confirmLabel: "Archive review",
          available: !status,
        }}
        result={status}
        onConfirm={() => setStatus("Review archived")}
      />
    );
  if (id !== "conversation-panel") return <Text role="status">Preview unavailable.</Text>;
  return (
    <ConversationPanel
      messages={messages}
      revision={messages.length}
      draft={input}
      onDraftChange={setInput}
      onSend={(body) => {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), speaker: "You", body },
        ]);
        setInput("");
      }}
    />
  );
}
