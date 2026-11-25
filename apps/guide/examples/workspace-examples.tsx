import samples from "../../../catalog/specimens/components.json";
import { useState } from "react";
import {
  Composer, VoiceControl, Stack, Status,
  type DraftAttachment, type VoiceState,
  Text,
} from "@openboa/yogurt";
import { ArtifactLibrary, type LibraryArtifact } from "../../../packages/recipes/artifact-library/web";
import { ProjectAccess, type ProjectRole } from "../../../packages/recipes/project-access/web";

const sources: LibraryArtifact[] = [
  { id: "summary", name: "November review", kind: "page", detail: "Today", pinned: true,
    preview: <Text>Review the draft and send the open questions to the project owner.</Text> },
  { id: "brief", name: "Launch brief.pdf", kind: "file", detail: "PDF · 1.2 MB",
    preview: <Text>Executive summary and launch criteria for Q4 release sign-off.</Text> },
  { id: "research", name: "Interview notes", kind: "link", detail: "Yesterday",
    preview: <Text>Synthesized operator feedback from five studio walkthrough sessions.</Text> },
  { id: "library", name: "Support workspace", kind: "app", detail: "Synced",
    preview: <Text>Connected support queue surfacing customer-reported issues.</Text> },
];

export function WorkspaceExample({ id }: { id: string }) {
  const [voice, setVoice] = useState<VoiceState>("idle");
  const [draft, setDraft] = useState("");
  const [files, setFiles] = useState<DraftAttachment[]>([
    { id: "brief", name: samples.composer.attachment, detail: samples.composer.detail },
  ]);
  const [result, setResult] = useState("");
  const [tool, setTool] = useState("Tools");
  const [selected, setSelected] = useState<string | undefined>("summary");
  const [artifacts, setArtifacts] = useState(sources);
  const [revision, setRevision] = useState(1);
  const [members, setMembers] = useState<{ id: string; name: string; detail?: string; role: "owner" | ProjectRole }[]>([
    { id: "maya", name: "Maya Chen", detail: "maya@openboa.ai", role: "owner" },
    { id: "jules", name: "Jules Reed", detail: "jules@openboa.ai", role: "edit" },
    { id: "devon", name: "Devon Park", detail: "devon@openboa.ai", role: "view" },
  ]);
  if (id === "voice-control") return (
    <Stack gap={12}>
      <VoiceControl state={voice} duration={voice === "review" ? "0:12" : undefined}
        preview={<span className="yg-help">Launch review memo</span>}
        onStart={() => setVoice("recording")}
        onStop={() => setVoice("review")}
        onDiscard={() => setVoice("idle")}
        onSend={() => { setVoice("idle"); setResult("Voice note added to this preview."); }} />
      {result && <Status>{result}</Status>}
    </Stack>
  );
  if (id === "composer") return (
    <Stack gap={12}>
      <Composer label={samples.composer.label} value={draft} onValueChange={setDraft}
        mentionPeople={[{id: "maya", label: "Maya Chen"}, {id: "jules", label: "Jules Reed"}]}
        attachments={files} onRemoveAttachment={(id) => setFiles((all) => all.filter((item) => item.id !== id))}
        onAddAttachment={() => setFiles((all) => all.some((item) => item.id === "notes") ? all : [...all, {id: "notes", name: samples.composer.additionalAttachment, detail: samples.composer.detail}])}
        toolLabel={tool} tools={[{id:"search",label:"Search sources"},{id:"research",label:"Research mode"}]}
        onTool={(id) => setTool(id === "search" ? "Search sources" : "Research mode")}
        onSend={({text,attachmentIds}) => {
          setResult(text ? "Draft sent: " + text : "Attached sources sent: " + attachmentIds.length);
          setDraft("");
          setFiles([]);
        }} />
      <Text variant="help">{samples.composer.hint}</Text>
      {result && <Status>{result}</Status>}
    </Stack>
  );
  if (id === "artifact-library") return (
    <ArtifactLibrary
      artifacts={artifacts}
      selectedId={selected}
      onOpen={setSelected}
      onAdd={() => {
        const nextId = "note-" + (artifacts.length + 1);
        setArtifacts((all) => [
          ...all,
          { id: nextId, name: "Release note draft", kind: "page", detail: "Just now", preview: <Text>Draft release summary added to the project library.</Text> },
        ]);
        setSelected(nextId);
      }}
      onPinChange={(id, pinned) => setArtifacts((all) => all.map((item) => item.id === id ? {...item,pinned} : item))}
    />
  );
  return (
    <Stack gap={12}>
      <ProjectAccess project={{ id: "launch", name: "Launch review" }} revision={String(revision)} members={members}
        onInvite={(projectId, email, role) => {
          if (projectId !== "launch") return;
          if (members.some((item) => item.id === email)) return setResult("This person already has access.");
          setMembers((all) => [...all, { id: email, name: email.split("@")[0] || email, detail: email, role }]);
          setRevision((value) => value + 1);
          setResult("Invite added to this preview.");
        }}
        onChangeRole={(projectId, id, role) => {
          if (projectId !== "launch") return;
          setMembers((all) => all.map((item) => item.id === id ? { ...item, role } : item));
          setRevision((value) => value + 1);
          setResult("Access updated.");
        }}
        onRemove={(projectId, id) => {
          if (projectId !== "launch") return;
          setMembers((all) => all.filter((item) => item.id !== id));
          setRevision((value) => value + 1);
          setResult("Access removed.");
        }} />
      {result && <Status>{result}</Status>}
    </Stack>
  );
}
