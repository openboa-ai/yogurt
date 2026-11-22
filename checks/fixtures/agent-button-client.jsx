"use client";

import React, { useRef, useState } from "react";
import { Accordion, ActionMenu, Button, Checkbox, Dialog, InputGroup, InputOTP, NumericSpinner, Popover, Progress, RadioGroup, Rating, SearchField, SegmentedControl, SplitTextField, Switch, Tabs, Textarea, TextField, Toggle, ToggleGroup, Tooltip, Yogurt } from "@openboa/yogurt";
import { createYogurtAgent } from "@openboa/yogurt/agent";
import { Button as CopiedButton } from "../src/components/ui/button";

if (typeof window !== "undefined" && !window.yogurtFixtureAgent) {
  window.yogurtFixtureCreateAgent = createYogurtAgent;
  window.yogurtFixtureAgent = createYogurtAgent({
    allow: step => (step.label === "Agent action" && step.action === "press") ||
      (step.label === "Copied action" && step.action === "press") ||
      (step.label === "Agent checkbox" && step.action === "setChecked") ||
      (step.label === "Agent switch" && step.action === "setChecked") ||
      (step.label === "Agent title" && step.action === "setValue") ||
      (step.label === "Agent limited title" && step.action === "setValue") ||
      (step.label === "Agent limited notes" && step.action === "setValue") ||
      (step.label === "Agent search" && step.action === "setValue") ||
      (step.label === "Agent notes" && step.action === "setValue") ||
      (step.label === "Agent segment" && step.action === "setValue") ||
      (step.label === "Agent tabs" && step.action === "setValue") ||
      (step.label === "Agent radio" && step.action === "setValue") ||
      (step.label === "Agent rating" && step.action === "setValue") ||
      (step.label === "Agent toggle" && step.action === "setPressed") ||
      (step.label === "Agent filters" && step.action === "setValue") ||
      (step.label === "Fixture dialog" && step.action === "setOpen") ||
      (step.label === "Agent popover" && step.action === "setOpen") ||
      (step.label === "Agent accordion" && step.action === "setValue") ||
      (step.label === "Agent menu" && step.action === "setOpen") ||
      (step.label === "Menu second" && step.action === "press") ||
      (step.label === "Agent hint" && step.action === "setOpen") ||
      (step.label === "Agent code" && step.action === "setValue") ||
      (step.label === "Increase Agent quantity" && step.action === "press") ||
      (step.label === "Agent team" && step.action === "setValue") ||
      (step.label === "Agent path" && step.action === "setValue") ||
      (step.label === "Selection group" && step.action === "setValue"),
  });
}

export default function AgentButtonFixture() {
  const [calls, setCalls] = useState(0);
  const [copiedCalls, setCopiedCalls] = useState(0);
  const [submits, setSubmits] = useState(0);
  const [checked, setChecked] = useState(false);
  const [checkboxChanges, setCheckboxChanges] = useState(0);
  const [switched, setSwitched] = useState(false);
  const [switchChanges, setSwitchChanges] = useState(0);
  const [title, setTitle] = useState("Apollo");
  const [titleChanges, setTitleChanges] = useState(0);
  const [limitedTitle, setLimitedTitle] = useState("one");
  const [limitedTitleChanges, setLimitedTitleChanges] = useState(0);
  const [limitedNotes, setLimitedNotes] = useState("one");
  const [limitedNotesChanges, setLimitedNotesChanges] = useState(0);
  const [legacyTitle, setLegacyTitle] = useState("legacy");
  const [search, setSearch] = useState("Initial");
  const [searchChanges, setSearchChanges] = useState(0);
  const [notes, setNotes] = useState("Original note");
  const [noteChanges, setNoteChanges] = useState(0);
  const [noteSubmits, setNoteSubmits] = useState(0);
  const [segment, setSegment] = useState("one");
  const [deniedSegment, setDeniedSegment] = useState("one");
  const [segmentChanges, setSegmentChanges] = useState(0);
  const [tab, setTab] = useState("one");
  const [deniedTab, setDeniedTab] = useState("one");
  const [tabChanges, setTabChanges] = useState(0);
  const [radio, setRadio] = useState("one");
  const [deniedRadio, setDeniedRadio] = useState("one");
  const [radioChanges, setRadioChanges] = useState(0);
  const [rating, setRating] = useState(2);
  const [ratingChanges, setRatingChanges] = useState(0);
  const [deniedRating, setDeniedRating] = useState(2);
  const [toggled, setToggled] = useState(false);
  const [toggleChanges, setToggleChanges] = useState(0);
  const [filters, setFilters] = useState([]);
  const [deniedFilters, setDeniedFilters] = useState([]);
  const [filterChanges, setFilterChanges] = useState(0);
  const [single, setSingle] = useState([]);
  const [formToggle, setFormToggle] = useState(false);
  const [modal, setModal] = useState(false);
  const [modalChanges, setModalChanges] = useState(0);
  const [nestedModal, setNestedModal] = useState(false);
  const [nestedChanges, setNestedChanges] = useState(0);
  const [menuSelection, setMenuSelection] = useState("");
  const [menuCalls, setMenuCalls] = useState(0);
  const [code, setCode] = useState("");
  const [deniedCode, setDeniedCode] = useState("31");
  const [formCode, setFormCode] = useState("12");
  const [quantity, setQuantity] = useState(1);
  const [quantityCalls, setQuantityCalls] = useState(0);
  const [split, setSplit] = useState({ team: "AB", record: "12" });
  const [splitCalls, setSplitCalls] = useState(0);
  const [splitLast, setSplitLast] = useState("");
  const [path, setPath] = useState("abc");
  const [pathChanges, setPathChanges] = useState(0);
  const [pathAction, setPathAction] = useState(0);
  const [selectionCalls, setSelectionCalls] = useState(0);
  const options = [{id: "one", label: "One"}, {id: "two", label: "Two"}, {id: "disabled", label: "Unavailable", disabled: true}];
  const tabs = options.map(option => ({...option, panel: <input aria-label={`Panel ${option.id}`} defaultValue="Kept" />}));
  const sections = options.map(option => ({ id: option.id, title: option.label, disabled: option.disabled, content: <input aria-label={`Section ${option.id}`} defaultValue="Original" /> }));
  const actionRef = useRef(null);
  const hit = () => setCalls(value => value + 1);
  return (
    <Yogurt>
      <main>
        <Button ref={actionRef} onClick={hit}>Agent action</Button>
        <CopiedButton onClick={() => setCopiedCalls(value => value + 1)}>Copied action</CopiedButton>
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
        <Tabs label="Agent tabs" items={tabs} value={tab} onValueChange={value => { setTab(value); setTabChanges(count => count + 1); }} />
        <Tabs label="Denied tabs" items={tabs} value={deniedTab} onValueChange={setDeniedTab} />
        <Tabs label="Fallback tabs" items={tabs} value="missing" onValueChange={() => {}} />
        <Tabs label="Disabled tabs" items={tabs.map(item => ({...item, disabled: true}))} value="one" onValueChange={() => {}} />
        <RadioGroup label="Agent radio" options={options} value={radio} onValueChange={value => { setRadio(value); setRadioChanges(count => count + 1); }} />
        <Rating label="Agent rating" value={rating} onValueChange={value => { setRating(value); setRatingChanges(count => count + 1); }} />
        <Rating label="Denied rating" value={deniedRating} onValueChange={setDeniedRating} />
        <RadioGroup label="Denied radio" options={options} value={deniedRadio} onValueChange={setDeniedRadio} />
        <RadioGroup label="Disabled radio" options={options} value="one" disabled onValueChange={() => {}} />
        <Toggle pressed={toggled} onPressedChange={value => { setToggled(value); setToggleChanges(count => count + 1); }}>Agent toggle</Toggle>
        <Toggle pressed={false} disabled onPressedChange={() => {}}>Disabled toggle</Toggle>
        <ToggleGroup label="Agent filters" multiple items={options} value={filters} onValueChange={value => { setFilters(value); setFilterChanges(count => count + 1); }} />
        <ToggleGroup label="Denied filters" multiple items={options} value={deniedFilters} onValueChange={setDeniedFilters} />
        <ToggleGroup label="Single filter" items={options} value={single} onValueChange={setSingle} />
        <Popover label="Agent popover"><input aria-label="Popover note" /></Popover>
        <Popover label="Denied popover"><input aria-label="Denied popover note" /></Popover>
        <Accordion label="Agent accordion" items={sections} />
        <Accordion label="Multiple accordion" items={sections} multiple />
        <Accordion label="Denied accordion" items={sections} />
        <ActionMenu label="Agent menu" items={[{id: "one", label: "Menu first"}, {id: "two", label: "Menu second"}, {id: "locked", label: "Menu unavailable", disabled: true}]}
          onSelect={value => { setMenuSelection(value); setMenuCalls(count => count + 1); }} />
        <ActionMenu label="Denied menu" items={[{id: "denied", label: "Denied menu option"}]} onSelect={() => setMenuCalls(count => count + 1)} />
        <Tooltip label="Agent hint">{props => <Button {...props}>Tooltip trigger</Button>}</Tooltip>
        <Tooltip label="Denied hint">{props => <Button {...props}>Denied tooltip trigger</Button>}</Tooltip>
        <InputOTP label="Agent code" value={code} onValueChange={setCode} />
        <InputOTP label="Denied code" value={deniedCode} onValueChange={setDeniedCode} />
        <InputOTP label="Disabled code" value="" disabled onValueChange={() => {}} />
        <NumericSpinner label="Agent quantity" value={quantity} min={0} max={7} step={2}
          onValueChange={next => { setQuantity(next); setQuantityCalls(count => count + 1); }} />
        <NumericSpinner label="Disabled quantity" value={1} disabled onValueChange={() => setQuantityCalls(count => count + 1)} />
        <Progress label="Agent progress" value={2} max={4} />
        <Progress label="Unknown progress" />
        <Progress label="Completed progress" value={120} max={100} />
        <Progress label="Default progress maximum" value={25} max={Number.NaN} />
        <SplitTextField label="Agent reference" parts={[{id:"team",label:"Agent team",value:split.team,maxLength:3}, {id:"record",label:"Agent record",value:split.record,maxLength:4,inputMode:"numeric"}]}
          onValueChange={(id, value) => { setSplit(current => ({ ...current, [id]: value })); setSplitCalls(count => count + 1); setSplitLast(id); }} />
        <TextField label="Agent limited title" value={limitedTitle} maxLength={3}
          onChange={event => { setLimitedTitle(event.currentTarget.value); setLimitedTitleChanges(count => count + 1); }} />
        <Textarea label="Agent limited notes" value={limitedNotes} maxLength={3}
          onChange={event => { setLimitedNotes(event.currentTarget.value); setLimitedNotesChanges(count => count + 1); }} />
        <TextField label="Legacy title" value={legacyTitle} maxLength={3} onChange={event => setLegacyTitle(event.currentTarget.value)} />
        <InputGroup label="Agent path" help="Three characters" value={path} maxLength={3} leading={<span>/projects/</span>}
          onChange={event => { setPath(event.currentTarget.value); setPathChanges(count => count + 1); }}
          trailing={<Button onClick={() => setPathAction(count => count + 1)}>Path action</Button>} />
        <InputGroup label="Denied group" defaultValue="private" />
        <InputGroup label="Secret group" type="password" defaultValue="fixture-secret" />
        <InputGroup label="Numeric group" type="number" defaultValue="42" />
        <InputGroup label="Selection group" defaultValue="selected" onSelect={() => setSelectionCalls(count => count + 1)} />
        <Button onClick={() => setModal(true)}>Open fixture dialog</Button>
        <Dialog title="Fixture dialog" description="Keep the draft." open={modal} onOpenChange={value => { setModal(value); setModalChanges(count => count + 1); }}>
          <input aria-label="Draft" defaultValue="Original draft" />
          <Button onClick={() => setNestedModal(true)}>Open nested dialog</Button>
          <Dialog title="Nested dialog" open={nestedModal} onOpenChange={value => { setNestedModal(value); setNestedChanges(count => count + 1); }}>
            <input aria-label="Nested input" />
          </Dialog>
          <Button onClick={() => setModal(false)}>Done</Button>
        </Dialog>
        <form aria-label="Fixture form" onSubmit={event => { event.preventDefault(); setSubmits(value => value + 1); }}>
          <Checkbox label="Form checkbox" name="notes" value="include" defaultChecked />
          <Switch label="Form switch" name="enabled" value="yes" defaultChecked />
          <TextField label="Form text" name="title" defaultValue="Original" />
          <Textarea label="Form notes" name="description" defaultValue="Original note" />
          <RadioGroup label="Form choice" name="choice" options={options} value={radio} onValueChange={setRadio} />
          <Rating label="Form rating" value={rating} onValueChange={setRating} />
          <Toggle pressed={formToggle} onPressedChange={setFormToggle}>Form toggle</Toggle>
          <InputOTP label="Form code" name="code" value={formCode} onValueChange={setFormCode} />
          <InputGroup label="Form group" name="group" defaultValue="original group" />
          <Button type="submit">Submit form</Button>
          <Button onClick={hit}>Ordinary action</Button>
        </form>
        <output data-testid="calls">{calls}</output>
        <output data-testid="copied-calls">{copiedCalls}</output>
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
        <output data-testid="tab-value">{tab}</output>
        <output data-testid="denied-tab-value">{deniedTab}</output>
        <output data-testid="tab-changes">{tabChanges}</output>
        <output data-testid="radio-value">{radio}</output>
        <output data-testid="denied-radio-value">{deniedRadio}</output>
        <output data-testid="radio-changes">{radioChanges}</output>
        <output data-testid="rating-value">{rating}</output>
        <output data-testid="rating-changes">{ratingChanges}</output>
        <output data-testid="denied-rating-value">{deniedRating}</output>
        <output data-testid="toggle-changes">{toggleChanges}</output>
        <output data-testid="filter-value">{filters.join(",")}</output>
        <output data-testid="denied-filter-value">{deniedFilters.join(",")}</output>
        <output data-testid="filter-changes">{filterChanges}</output>
        <output data-testid="single-value">{single.join(",")}</output>
        <output data-testid="modal-changes">{modalChanges}</output>
        <output data-testid="nested-changes">{nestedChanges}</output>
        <output data-testid="menu-selection">{menuSelection}</output>
        <output data-testid="menu-calls">{menuCalls}</output>
        <output data-testid="quantity-value">{quantity}</output>
        <output data-testid="quantity-calls">{quantityCalls}</output>
        <output data-testid="split-calls">{splitCalls}</output>
        <output data-testid="split-last">{splitLast}</output>
        <output data-testid="path-changes">{pathChanges}</output>
        <output data-testid="limited-title-changes">{limitedTitleChanges}</output>
        <output data-testid="limited-notes-changes">{limitedNotesChanges}</output>
        <output data-testid="path-action">{pathAction}</output>
        <output data-testid="selection-calls">{selectionCalls}</output>
      </main>
    </Yogurt>
  );
}
