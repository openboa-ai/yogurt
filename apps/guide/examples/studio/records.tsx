import { useEffect, useState } from "react";
import * as Y from "@openboa/yogurt";
import { options, type studioFiles } from "./fixtures";

export function Library({ files, target, onRemove }: {
  files: typeof studioFiles;
  target?: { id: string };
  onRemove: (ids: string[]) => void;
}) {
  const [kind, setKind] = useState("All files");
  const [layout, setLayout] = useState("Grid");
  const [owner, setOwner] = useState("All agents");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");
  const [selecting, setSelecting] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [folder, setFolder] = useState(false);
  useEffect(() => { if (target) setSelected(target.id); }, [target]);
  const file = files.find(item => item.id === selected);
  const matches = files.filter(item => (kind === "All files" || item.kind === kind) && (owner === "All agents" || item.owner === owner) && item.name.toLowerCase().includes(query.toLowerCase()));
  const visibleSelection = checked.filter(id => matches.some(item => item.id === id));
  return <Y.Stack gap={16}>
    <Y.Inline className="studio-split">
      <Y.Inline><Y.SearchField label="Find files" value={query} onValueChange={setQuery} />
        <Y.Select label="Owner" value={owner} options={options("All agents", "Kai", "Sol")} onValueChange={setOwner} /></Y.Inline>
      <Y.ButtonGroup label="File actions">
        <Y.Button emphasis="quiet" onClick={() => setFolder(true)}>New folder</Y.Button>
        <Y.Button emphasis="soft" aria-pressed={selecting} onClick={() => { setSelecting(!selecting); setChecked([]); }}>{selecting ? "Done selecting" : "Select files"}</Y.Button>
      </Y.ButtonGroup>
    </Y.Inline>
    {!!folders.length && <Y.Inline>{folders.map(name => <Y.Badge key={name}>{name}</Y.Badge>)}</Y.Inline>}
    <Y.Inline className="studio-split">
      <Y.SegmentedControl label="File type" value={kind} options={options("All files", "Document", "Spreadsheet", "Code")} onValueChange={setKind} />
      <Y.SegmentedControl label="File layout" value={layout} options={options("Grid", "List")} onValueChange={setLayout} />
    </Y.Inline>
    {!!visibleSelection.length && <Y.Notice title={visibleSelection.length + " selected"} action={<Y.Button emphasis="quiet" onClick={() => {
      onRemove(visibleSelection); setChecked([]);
    }}>Remove from sample</Y.Button>} />}
    {matches.length ? (
      <Y.List label="Files" divided={layout === "List"} className={layout === "Grid" ? "studio-file-grid" : undefined}>
        {matches.map(item => (
          <Y.ListRow
            key={item.id}
            title={item.name}
            description={item.kind + " · " + item.owner + " · " + item.size}
            leading={<Y.Icon name="copy" />}
            onActivate={selecting ? undefined : () => setSelected(item.id)}
            trailing={selecting ? (
              <Y.Checkbox
                label={"Select " + item.name}
                checked={checked.includes(item.id)}
                onCheckedChange={value => setChecked(previous => value ? [...previous, item.id] : previous.filter(id => id !== item.id))}
              />
            ) : undefined}
          />
        ))}
      </Y.List>
    ) : <Y.EmptyResult query={query || kind} onClear={() => { setKind("All files"); setOwner("All agents"); setQuery(""); }} />}
    <Y.Dialog title={file?.name ?? "File preview"} open={!!file} onOpenChange={open => { if (!open) setSelected(""); }}>
      {file && <Y.Stack gap={12}><Y.Text variant="help">{file.kind} · {file.owner} · {file.size}</Y.Text>
        <Y.CodeBlock language={file.kind === "Spreadsheet" ? "CSV" : file.kind} code={file.detail} /></Y.Stack>}
    </Y.Dialog>
    <Y.Dialog title="New folder" open={folder} onOpenChange={setFolder}>
      <form onSubmit={event => {
        event.preventDefault();
        const name = String(new FormData(event.currentTarget).get("name") ?? "").trim();
        if (name) { setFolders(previous => [...new Set([...previous, name])]); setFolder(false); }
      }}><Y.Stack gap={12}><Y.TextField label="Folder name" name="name" required /><Y.Button type="submit">Create folder</Y.Button></Y.Stack></form>
    </Y.Dialog>
  </Y.Stack>;
}

const initialCustomers = [
  { id: "fieldwork", name: "Fieldwork Studio", email: "team@example.test", status: "Active" },
  { id: "northwind", name: "Northwind Research", email: "ops@northwind.test", status: "Active" },
  { id: "harbor", name: "Harbor Desk", email: "review@harbor.test", status: "Trial" },
  { id: "meridian", name: "Meridian Archive", email: "desk@meridian.test", status: "Active" },
];

export function Customers() {
  const [tab, setTab] = useState("Customers");
  const [customers, setCustomers] = useState(initialCustomers);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState(true);
  const [showEmail, setShowEmail] = useState(true);
  const [payment, setPayment] = useState(false);
  const matching = customers.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
  const current = customers.find(item => item.id === selected);
  function add(name: string, email: string) {
    const id = crypto.randomUUID();
    setCustomers(items => [...items, { id, name, email, status: "Active" }]);
    setSelected(id); setQuery(""); setTab("Customers");
  }
  return <Y.Stack gap={16}>
    <Y.SegmentedControl label="Customer register views" options={options("Customers", "Payments", "Suggestions", "Connectors")} value={tab} onValueChange={setTab} />
    {tab === "Customers" && <>
      <Y.Inline className="studio-split"><Y.SearchField label="Filter customers" value={query} onValueChange={setQuery} />
        <Y.ButtonGroup label="Customer actions"><Y.Button emphasis="quiet" aria-pressed={showEmail} onClick={() => setShowEmail(!showEmail)}>Email column</Y.Button>
        <Y.Button emphasis="filled" tone="brand" onClick={() => setOpen(true)}>New customer</Y.Button></Y.ButtonGroup></Y.Inline>
      <Y.DataTable caption="Customer register" columns={[{ id: "name", label: "Customer", kind: "identity", sortValue: row => row.id },
        ...(showEmail ? [{ id: "email", label: "Email", kind: "text" as const }] : []), { id: "status", label: "Status", kind: "role" }]}
        rows={matching.map(item => ({ id: item.id, cells: { name: <Y.Button emphasis="quiet" size="compact" onClick={() => setSelected(item.id)}>{item.name}</Y.Button>, email: item.email, status: <Y.Status tone="success">{item.status}</Y.Status> } }))} />
      {!matching.length && <Y.EmptyResult query={query} onClear={() => setQuery("")} />}
      {current && <div key={current.id} className="studio-detail"><Y.Card title={current.name}><Y.Stack><Y.Text>{current.email}</Y.Text><Y.Status>{current.status}</Y.Status>
        <Y.Button emphasis="quiet" onClick={() => setSelected("")}>Close customer details</Y.Button></Y.Stack></Y.Card></div>}
    </>}
    {tab === "Payments" && <Y.Card title="November invoice" description="Fieldwork Studio"><Y.Stack gap={8}>
      <Y.Text>$240.00 · Due Nov 28</Y.Text>{payment ? <Y.Status tone="success">Marked paid in this sample.</Y.Status> : <Y.Button onClick={() => setPayment(true)}>Mark paid</Y.Button>}</Y.Stack></Y.Card>}
    {tab === "Suggestions" && (suggestions ? <Y.Card title="Add Field Notes Co." description="Mentioned in the release channel.">
      <Y.ButtonGroup label="Suggestion actions"><Y.Button emphasis="soft" onClick={() => setSuggestions(false)}>Dismiss</Y.Button>
        <Y.Button onClick={() => { setSuggestions(false); add("Field Notes Co.", "studio@example.test"); }}>Add customer</Y.Button></Y.ButtonGroup></Y.Card> : <Y.EmptyResult empty="No suggestions." />)}
    {tab === "Connectors" && <Y.Switch label="Include sample suggestions from conversations" checked={suggestions} onCheckedChange={setSuggestions} />}
    <Y.Dialog title="New customer" open={open} onOpenChange={setOpen}>
      <form onSubmit={event => {
        event.preventDefault(); const fields = new FormData(event.currentTarget);
        const name = String(fields.get("name") ?? "").trim();
        if (name) { add(name, String(fields.get("email") ?? "")); setOpen(false); }
      }}><Y.Stack gap={12}><Y.TextField label="Customer name" name="name" required /><Y.TextField label="Email" name="email" type="email" required />
        <Y.Button type="submit">Save customer</Y.Button></Y.Stack></form>
    </Y.Dialog>
  </Y.Stack>;
}
