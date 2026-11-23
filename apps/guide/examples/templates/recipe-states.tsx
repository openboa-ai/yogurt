import { useEffect, useRef, useState } from "react";
import * as Y from "@openboa/yogurt";
import { type Recipe } from "./recipes";
import { SampleForm } from "./recipe-forms";
import { NavigationPreview } from "./navigation";
import { ComposeStudy, TypeStudy } from "./studies";
import pairingPreview from "./pairing-preview.svg";

const emptyStates: Record<string, [string, string, string]> = {
  "no-members": ["Your team is empty", "Invite a teammate to share this workspace.", "Invite a teammate"],
  "no-bank": ["No account connected", "Connect an account to receive payments.", "Connect an account"],
  "no-release": ["No releases yet", "Start a draft for the first version in this catalog.", "Start a release"],
  "no-catalog": ["Nothing saved", "Browse the catalog and save a collection for later.", "Browse collections"],
  "not-found": ["This page is unavailable", "The page may have moved or the address may have changed.", "Return to workspace"],
};

export function StateRecipe({ recipe }: { recipe: Recipe }) {
  const { id } = recipe;
  const [active, setActive] = useState(false);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(45);
  const [synced, setSynced] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const empty = emptyStates[id];

  if (empty) return active
    ? id === "no-members" ? <SampleForm id="invite" /> : <Y.Result title="Next step ready" action={<Y.Button emphasis="quiet" onClick={() => setActive(false)}>Back</Y.Button>}>{empty[2]} in the sample workspace.</Y.Result>
    : <Y.Result title={empty[0]} action={<Y.Button onClick={() => setActive(true)}>{empty[2]}</Y.Button>}>{empty[1]}</Y.Result>;

  switch (id) {
    case "workspace":
      return <Y.Stack gap={12}>
        <Y.Text>Studio workspace · 3 open reviews</Y.Text>
        <Y.Inline><Y.Button disabled={active} onClick={() => setActive(true)}>Open workspace</Y.Button>
          {active && <Y.Status tone="success">Workspace opened.</Y.Status>}</Y.Inline>
      </Y.Stack>;
    case "agent":
      return <>
        <Y.Inline><Y.Button disabled={active} onClick={() => setOpen(true)}>Review activation</Y.Button>
          {active && <Y.Status tone="success">Agent active.</Y.Status>}</Y.Inline>
        <Y.ConfirmDialog decision={{ id: "activate", revision: "1", title: "Activate review agent?", consequence: "The sample agent will monitor the preview queue.", available: true, confirmLabel: "Activate agent" }}
          open={open} onOpenChange={setOpen} onConfirm={() => setActive(true)} />
      </>;
    case "alert":
    case "milestone":
      return <Y.Stack gap={12}>
        <Y.Notice tone={id === "alert" ? "warning" : "success"} title={id === "alert" ? "Response time increased" : "First 50 reviews complete"}>
          {id === "alert" ? "The service exceeded 140 ms for five minutes." : "The studio reached its monthly target."}
        </Y.Notice>
        <Y.Inline><Y.Button emphasis="soft" disabled={active} onClick={() => setActive(true)}>{id === "alert" ? "Acknowledge" : "Mark seen"}</Y.Button>
          {active && <Y.Status>Seen.</Y.Status>}</Y.Inline>
      </Y.Stack>;
    case "loading":
      return <Y.Stack gap={12}>
        {active ? <Y.List label="Loaded records"><Y.ListRow title="Release review" description="Updated today" /></Y.List> : <Y.Skeleton label="Loading records" lines={3} />}
        <Y.Inline><Y.Button emphasis="soft" onClick={() => setActive(!active)}>{active ? "Show loading state" : "Show records"}</Y.Button></Y.Inline>
      </Y.Stack>;
    case "loading-card":
      return <Y.Stack gap={12}>
        <Y.Text>Studio workspace</Y.Text>
        {active ? <Y.Spinner label="Loading workspace" /> : synced ? <Y.Status tone="success">Workspace ready.</Y.Status> : <Y.Text variant="help">3 open reviews · Updated today</Y.Text>}
        <Y.Inline><Y.Button emphasis="soft" pending={active} onClick={() => {
          setActive(true);
          timer.current = setTimeout(() => { setActive(false); setSynced(true); }, 900);
        }}>Reload workspace</Y.Button></Y.Inline>
      </Y.Stack>;
    case "syncing":
      return <Y.Stack gap={12}>
        <Y.Progress label={active ? "Syncing changes" : synced ? "Changes synced" : "Ready to sync"} value={active ? undefined : synced ? 100 : 0} />
        <Y.Inline><Y.Button pending={active} onClick={() => {
          setActive(true);
          setSynced(false);
          timer.current = setTimeout(() => { setActive(false); setSynced(true); }, 900);
        }}>Sync now</Y.Button></Y.Inline>
      </Y.Stack>;
    case "connect":
      return <Y.Stack gap={12}>
        <img className="template-pairing-code" src={pairingPreview} width={112} height={112} alt="Sample QR code for pairing a device" />
        <Y.CodeBlock language="Pairing code" code="STUDIO-2468" />
      </Y.Stack>;
    case "entry":
      return <Y.Stack gap={12}><Y.Switch label="Unlock entry" checked={active} onCheckedChange={setActive} />
        <Y.Status tone={active ? "warning" : "success"}>{active ? "Entry unlocked" : "Entry secured"}</Y.Status></Y.Stack>;
    case "appliance":
      return <Y.Stack gap={16}><Y.Switch label="Room lights" defaultChecked />
        <Y.Slider label="Light level" value={position} onValueChange={setPosition} unit="%" /></Y.Stack>;
  }
}

export function FoundationRecipe({ recipe, appearance }: { recipe: Recipe; appearance: "light" | "dark" }) {
  const [action, setAction] = useState("");
  switch (recipe.id) {
    case "appearance":
      return <ComposeStudy guideAppearance={appearance} />;
    case "type-specimen":
      return <TypeStudy />;
    case "controls":
      return <SampleForm id="controls" />;
    case "icons":
      return <Y.Stack gap={12}><Y.Inline>
        <Y.IconButton label="Save view" icon="bookmark" onClick={() => setAction("View saved.")} />
        <Y.IconButton label="Copy reference" icon="copy" onClick={() => { void navigator.clipboard.writeText("Studio review").then(() => setAction("Reference copied."), () => setAction("Copy failed.")); }} />
        <Y.IconButton label="Open details" icon="info" onClick={() => setAction("Studio review · Version 2.4")} />
      </Y.Inline>{action && <Y.Status>{action}</Y.Status>}</Y.Stack>;
    case "shortcuts":
      return <Y.List label="Keyboard shortcuts">
        <Y.ListRow title="Find a command" trailing={<Y.KeyboardShortcut label="Command K" keys={["⌘", "K"]} />} />
        <Y.ListRow title="Find in document" trailing={<Y.KeyboardShortcut label="Command F" keys={["⌘", "F"]} />} />
        <Y.ListRow title="Close the current menu" trailing={<Y.KeyboardShortcut label="Escape" keys={["Esc"]} />} />
      </Y.List>;
    case "directory":
      return <NavigationPreview id="grouped" />;
    case "faq":
      return <Y.Accordion label="Workspace help" items={[
        { id: "invite", title: "Who can invite teammates?", content: "Workspace administrators can invite members and assign their initial role." },
        { id: "private", title: "Who can see my drafts?", content: "Drafts stay private until you share them with the workspace." },
        { id: "undo", title: "Can I change a saved view?", content: "Open the view settings and save your changes." },
      ]} />;
  }
}
