import { useState } from "react";
import * as Y from "@openboa/yogurt";
import { FileDrop } from "@openboa/yogurt/motion-patterns";
import { type Recipe } from "./recipes";

const options = (...labels: string[]) => labels.map(label => ({ id: label, label }));

const forms = {
  feedback: { fields: ["Your feedback"], notes: "Your feedback", action: "Send feedback", success: "Feedback received." },
  issue: { fields: ["Summary", "Steps to reproduce"], notes: "Steps to reproduce", choice: { label: "Severity", values: ["Minor", "Blocking"] }, action: "Submit report", success: "Problem report received." },
  shipping: { fields: ["Recipient", "Street address", "Postal code"], action: "Save address", success: "Shipping address saved." },
  invite: { fields: ["Work email"], choice: { label: "Access", values: ["Member", "Viewer"] }, action: "Send invitation", success: "Invitation prepared." },
  environment: { fields: ["Variable name", "Value"], choice: { label: "Environment", values: ["Preview", "Development"] }, action: "Save variable", success: "Variable saved in this preview." },
  controls: { fields: ["View name"], choice: { label: "Visibility", values: ["Private", "Workspace"] }, action: "Create view", success: "View created." },
} satisfies Record<string, {
  fields: string[]; notes?: string; choice?: { label: string; values: string[] }; action: string; success: string;
}>;

export function SampleForm({ id }: { id: keyof typeof forms }) {
  const [saved, setSaved] = useState(false);
  const form = forms[id];
  return <form onSubmit={event => {
    event.preventDefault();
    event.currentTarget.reset();
    setSaved(true);
  }} onChange={() => setSaved(false)}>
    <Y.Stack gap={16}>
      {form.fields.map(label => "notes" in form && label === form.notes
        ? <Y.Textarea key={label} label={label} required />
        : <Y.TextField key={label} label={label} type={label === "Work email" ? "email" : "text"} required />)}
      {"choice" in form && <Y.Select label={form.choice.label} options={options(...form.choice.values)} defaultValue={form.choice.values[0]} />}
      <Y.Inline>
        <Y.Button type="submit">{form.action}</Y.Button>
        {saved && <Y.Status tone="success">{form.success}</Y.Status>}
      </Y.Inline>
    </Y.Stack>
  </form>;
}

export function FormRecipe({ recipe }: { recipe: Recipe }) {
  const { id } = recipe;
  const [selected, setSelected] = useState("");
  const [date, setDate] = useState("2026-11-21");
  const [value, setValue] = useState(50);
  const [saved, setSaved] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  if (Object.hasOwn(forms, id)) return <SampleForm id={id as keyof typeof forms} />;

  switch (id) {
    case "preferences":
      return <Y.Stack gap={16}>
        <Y.Select label="Appearance" options={options("System", "Light", "Dark")} defaultValue="System" />
        <Y.Select label="Density" options={options("Compact", "Regular", "Spacious")} defaultValue="Regular" />
        <Y.Switch label="Show workspace hints" defaultChecked />
      </Y.Stack>;
    case "notifications":
      return <Y.Stack gap={16}>
        <Y.Switch label="Direct mentions" defaultChecked />
        <Y.Switch label="New workspace releases" />
        <Y.Switch label="Weekly digest" defaultChecked />
      </Y.Stack>;
    case "appointment":
      return <Y.Stack gap={16}>
        <Y.Calendar label="Appointment date" value={date} onValueChange={next => { setDate(next); setSaved(false); }} />
        <Y.Select label="Available time" placeholder="Choose a time" options={options("09:30", "11:00", "14:30")} value={selected} onChange={event => { setSelected(event.target.value); setSaved(false); }} />
        <Y.Inline><Y.Button disabled={!selected || saved} onClick={() => setSaved(true)}>Book appointment</Y.Button>
          {saved && <Y.Status tone="success">Reserved for {date} at {selected}.</Y.Status>}</Y.Inline>
      </Y.Stack>;
    case "files":
      return <Y.Stack gap={12}>
        <FileDrop label="Choose a file" onFiles={setFiles} progress={files.length ? 1 : undefined} />
        {files.map(file => <Y.Text key={file.name} variant="help" role="status">{file.name} ready</Y.Text>)}
      </Y.Stack>;
    case "shade":
      return <Y.Slider label="Shade position" value={value} onValueChange={setValue} unit="%" />;
    case "payout":
    case "transfer":
      return <Y.Stack gap={16}>
        <Y.NumericSpinner label={id === "payout" ? "Minimum payout (USD)" : "Transfer amount (USD)"} value={value} min={5} max={1000} step={5}
          onValueChange={next => { setValue(next); setSaved(false); }} />
        {id === "transfer" && <Y.Select label="Destination" options={options("Operating account", "Reserve account")} defaultValue="Operating account" onChange={() => setSaved(false)} />}
        <Y.Inline><Y.Button disabled={saved} onClick={() => setSaved(true)}>{id === "payout" ? "Save threshold" : "Preview transfer"}</Y.Button>
          {saved && <Y.Status tone="success">{id === "payout" ? "Threshold saved." : "Transfer ready for review."}</Y.Status>}</Y.Inline>
      </Y.Stack>;
    case "receiving":
      return <Y.RadioGroup label="Receiving account" options={options("Operating account", "Reserve account")} value={selected || "Operating account"} onValueChange={setSelected} />;
    case "access":
      return <Y.Stack gap={12}><Y.InputOTP label="Verification code" help="Use sample code 123456." value={selected}
        onValueChange={setSelected} verified={selected === "123456"} error={selected.length === 6 && selected !== "123456" ? "That code does not match." : undefined} />
        {selected === "123456" && <Y.Status tone="success">Sample access verified.</Y.Status>}</Y.Stack>;
  }
}
