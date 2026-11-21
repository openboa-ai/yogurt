"use client";

import React, { useRef, useState } from "react";
import { Button, Checkbox, SearchField, SegmentedControl, Switch, Textarea, TextField, Yogurt } from "@openboa/yogurt";
import { createYogurtAgent } from "@openboa/yogurt/agent";

if (typeof window !== "undefined" && !window.yogurtFixtureAgent) {
  window.yogurtFixtureCreateAgent = createYogurtAgent;
  window.yogurtFixtureAgent = createYogurtAgent({
    allow: step => (step.label === "Agent action" && step.action === "press") ||
      (step.label === "Agent checkbox" && step.action === "setChecked") ||
      (step.label === "Agent switch" && step.action === "setChecked") ||
      (step.label === "Agent title" && step.action === "setValue") ||
      (step.label === "Agent search" && step.action === "setValue") ||
      (step.label === "Agent notes" && step.action === "setValue") ||
      (step.label === "Agent segment" && step.action === "setValue"),
  });
}

export default function AgentButtonFixture() {
  const [calls, setCalls] = useState(0);
  const [submits, setSubmits] = useState(0);
  const [checked, setChecked] = useState(false);
  const [checkboxChanges, setCheckboxChanges] = useState(0);
  const [switched, setSwitched] = useState(false);
  const [switchChanges, setSwitchChanges] = useState(0);
  const [title, setTitle] = useState("Apollo");
  const [titleChanges, setTitleChanges] = useState(0);
  const [search, setSearch] = useState("Initial");
  const [searchChanges, setSearchChanges] = useState(0);
  const [notes, setNotes] = useState("Original note");
  const [noteChanges, setNoteChanges] = useState(0);
  const [noteSubmits, setNoteSubmits] = useState(0);
  const [segment, setSegment] = useState("one");
  const [deniedSegment, setDeniedSegment] = useState("one");
  const [segmentChanges, setSegmentChanges] = useState(0);
  const options = [{id: "one", label: "One"}, {id: "two", label: "Two"}, {id: "disabled", label: "Unavailable", disabled: true}];
  const actionRef = useRef(null);
  const hit = () => setCalls(value => value + 1);
  return (
    <Yogurt>
      <main>
        <Button ref={actionRef} onClick={hit}>Agent action</Button>
        <Button onClick={() => actionRef.current?.focus()}>Focus action</Button>
        <Button onClick={hit}>Denied action</Button>
        <Button onClick={hit} aria-disabled="true">Unavailable action</Button>
        <Button onClick={hit} pending pendingLabel="Saving" aria-label="Pending action">Pending action</Button>
        <Button onClick={hit} disabled>Disabled action</Button>
        <Checkbox label="Agent checkbox" checked={checked} onCheckedChange={value => {
          setChecked(value === true); setCheckboxChanges(count => count + 1);
        }} />
        <Checkbox label="Denied checkbox" defaultChecked />
        <Checkbox label="Mixed checkbox" checked="indeterminate" />
        <Checkbox label="Disabled checkbox" disabled />
        <Switch label="Agent switch" checked={switched} onCheckedChange={value => {
          setSwitched(value); setSwitchChanges(count => count + 1);
        }} />
        <Switch label="Denied switch" defaultChecked />
        <Switch label="Disabled switch" disabled />
        <TextField label="Agent title" help="Give it a name" value={title} onChange={event => {
          setTitle(event.target.value); setTitleChanges(count => count + 1);
        }} />
        <TextField label="Denied text" defaultValue="Private" />
        <TextField label="Disabled text" disabled />
        <TextField label="Private token" type="password" defaultValue="fixture-only" />
        <div data-agent-hidden><TextField label="Hidden text" defaultValue="fixture-only" /></div>
        <SearchField label="Agent search" value={search} onValueChange={value => {
          setSearch(value); setSearchChanges(count => count + 1);
        }} />
        <Textarea label="Agent notes" value={notes} onChange={event => {
          setNotes(event.target.value); setNoteChanges(count => count + 1);
        }} onSubmit={event => { event.preventDefault(); setNoteSubmits(count => count + 1); }} />
        <Textarea label="Denied notes" defaultValue="Private note" />
        <Textarea label="Disabled notes" disabled />
        <SegmentedControl label="Agent segment" options={options} value={segment} onValueChange={value => {
          setSegment(value); setSegmentChanges(count => count + 1);
        }} />
        <SegmentedControl label="Denied segment" options={options} value={deniedSegment} onValueChange={setDeniedSegment} />
        <form aria-label="Fixture form" onSubmit={event => { event.preventDefault(); setSubmits(value => value + 1); }}>
          <Checkbox label="Form checkbox" name="notes" value="include" defaultChecked />
          <Switch label="Form switch" name="enabled" value="yes" defaultChecked />
          <TextField label="Form text" name="title" defaultValue="Original" />
          <Textarea label="Form notes" name="description" defaultValue="Original note" />
          <Button type="submit">Submit form</Button>
          <Button onClick={hit}>Ordinary action</Button>
        </form>
        <output data-testid="calls">{calls}</output>
        <output data-testid="submits">{submits}</output>
        <output data-testid="checkbox-changes">{checkboxChanges}</output>
        <output data-testid="switch-changes">{switchChanges}</output>
        <output data-testid="title-changes">{titleChanges}</output>
        <output data-testid="search-changes">{searchChanges}</output>
        <output data-testid="note-changes">{noteChanges}</output>
        <output data-testid="note-submits">{noteSubmits}</output>
        <output data-testid="segment-value">{segment}</output>
        <output data-testid="denied-segment-value">{deniedSegment}</output>
        <output data-testid="segment-changes">{segmentChanges}</output>
      </main>
    </Yogurt>
  );
}
