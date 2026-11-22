// Generate one typed Zig test per shipped template inside an isolated SDK host.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { workspaceArgs, workspaceSlots, workspaceChoiceFields, workspaceModelFields, workspaceActionFields } from "../../../catalog/specimens/native-workspaces.mjs";
const kit = fileURLToPath(new URL("../../../", import.meta.url)),
  host = process.argv[2];
if (!host) throw Error("Pass an isolated, scaffolded Zig host directory.");
const dir = resolve(host, "src/yogurt-catalog-test");
mkdirSync(dir, { recursive: true });
const catalog = JSON.parse(readFileSync(kit + "/catalog/components.json"));
const blocks = JSON.parse(readFileSync(kit + "/catalog/blocks.json"));
const samples = JSON.parse(readFileSync(kit + "/catalog/specimens/components.json"));
const args = {
  label: "Weekly review",
  title: "Review",
  value: "Weekly view",
  checked: "{enabled}",
  expanded: "{enabled}",
  detail: "Three records",
  summary: "Page one",
  amount: "{amount}",
  as_of: "09:00",
  source: "Sample",
  consequence: "Archive this view",
  choice: "Archive view",
  original_id: "review-42",
  image_id: "{picture}",
  speaker: "Kai",
  content: "Ready to review",
  width: "240",
  height: "135",
  language: "zig",
  ...workspaceArgs,
};
// Example copy is scoped to each specimen; shared bindings remain controlled by the host.
const examples = {
  text: { label: samples.text.body },
  heading: { label: samples.heading.title },
  button: samples.button,
  "project-sidebar": { custom_navigation: "true" },
  "icon-button": { label: "Add a view" },
  "runtime-panel": { summary: "{runtime_status}" },
  composer: { label: samples.composer.label, value: "{value}", attachment_detail: samples.composer.detail },
  "agent-row": {
    label: samples["agent-row"].name,
    detail: samples["agent-row"].displayState,
    summary: samples["agent-row"].preview,
    time: samples["agent-row"].time,
    selected: "{gallery_agent_row_selected}",
  },
  checkbox: samples.checkbox,
  switch: samples.switch,
  toggle: { label: "Show details" },
  link: { label: "View record details" },
  tabs: { label: "Project details" },
  "segmented-control": samples["segmented-control"],
  "radio-group": { label: "Update frequency" },
  "selection-list": { label: "Included updates" },
  accordion: { label: "About this view" },
  "disclosure-row": samples["disclosure-row"],
  "action-menu": samples.menu,
  card: samples.card,
  dialog: samples.dialog,
  drawer: { title: samples.dialog.title, footer: "false" },
  sheet: { title: samples.dialog.title, footer: "false" },
  popover: samples.popover,
  tooltip: { label: "Add a saved view" },
  toast: { label: "View saved." },
  progress: { label: samples.progress.label, amount: "{gallery_progress_fraction}", detail: "{gallery_progress_label}" },
  slider: { label: samples.slider.label, detail: "{gallery_slider_label}" },
  chart: { label: "Reviews this week", source: "Local sample · Nov 20, 09:00 UTC", legend: "Completed reviews (records)", default_series: "false" },
  "bar-chart": { label: samples["bar-chart"].title, source: samples["bar-chart"].source + " · " + samples["bar-chart"].timeLabel, default_series: "false" },
  "data-table": { label: samples.readings.label },
  "scroll-area": { label: "Recent notes", height: "124" },
  resizable: { label: "Resize project list", summary: "Projects", height: "136" },
  form: { label: "Save a view" },
  field: { label: "View name" },
  label: { label: "View name" },
  "help-text": { label: "Use a name your team will recognize." },
  "field-error": { label: "Give this view a name." },
  stepper: { label: "Release stages" },
  table: { label: samples.readings.label },
  "empty-result": { title: "No records found" },
  result: { title: "Could not load records" },
  "record-facts": { title: "Weekly review" },
  "numeric-spinner": { label: "Records to review" },
  "search-field": { label: "Search records" },
  "text-field": { label: "View name" },
  textarea: { label: "Notes" },
  "input-group": { label: "View name" },
  badge: { label: "Draft" },
  status: { label: "Saved" },
  notice: { title: "View updated", detail: "Your team can use the new view." },
};
const viewNameInput = '<text-field label="' + samples.dialog.label + '" text="{value}" on-input="edit"/>';
const editView = '<column gap="12"><column gap="6"><text size="sm">' + samples.dialog.label + '</text>' +
  viewNameInput + '</column><button variant="primary" on-press="activate">' + samples.dialog.submit + '</button></column>';
const segmentPositions = ["first", "second", "third"];
const segments = samples["segmented-control"].options.map(({ label }, index) =>
  `<segmented-control selected="{gallery_${segmentPositions[index]}_selected}" on-press="gallery_select_option:{gallery_${segmentPositions[index]}_id}">${label}</segmented-control>`,
).join("");
const reviewRows = [
  [samples.readings.day, samples.readings.reviews],
  ...samples.readings.points.map(({ label, value }) => [label, value ?? samples.readings.missing]),
].map(row => "<table-row>" + row.map((value, index) =>
  '<table-cell width="' + [160, 200][index] + '">' + value + '</table-cell>',
).join("") + "</table-row>").join("");
const projectIcons = samples["segmented-control"].options.map(({ id, label }) =>
  `<row gap="8" cross="center"><image label="${label}" image="{${id === "yogurt" ? "project" : id}_picture}" width="32" height="32"/><text>${label}</text></row>`,
).join("");
const workspaceIntroduction = '<column gap="8"><image label="Sourdough" image="{sourdough_picture}" width="32" height="32"/>' +
  '<text size="heading">Weekly review</text><text size="sm" foreground="text_muted">A saved view in Sourdough.</text></column>';
const bars = samples["bar-chart"];
const netValues = bars.points.flatMap(({ value }) => value === null ? [] : [value]);
const lowest = Math.min(0, ...netValues);
const highest = Math.max(0, ...netValues);
const range = highest - lowest || 1;
const netRows = bars.points.map(({ label, value }) => {
  const length = Math.abs(value ?? 0);
  const start = Math.min(0, value ?? 0) - lowest;
  const remainder = range - length - start;
  const fill = length === 0 ? "" : `<row grow="${length}" background="accent" radius="sm"/>`;
  return `<row gap="12" cross="center">
    <text size="sm" width="48">${label}</text>
    <row height="8" grow="1" background="surface_subtle" radius="sm">
      <row grow="${start}"/>${fill}<row grow="${remainder}"/>
    </row>
    <text size="sm" foreground="text_muted" width="92">${value === null ? samples.readings.missing : value + " " + bars.unit}</text>
  </row>`;
}).join("");
const observed = samples.readings.points.map(({ value }) => value === null ? "std.math.nan(f32)" : value);
const dates = samples.readings.points.map(({ label }, i, points) => JSON.stringify(i === 0 || i === points.length - 1 ? label : ""));
const projectSidebar = samples["project-sidebar"];
const projectDestinations = projectSidebar.sections.flatMap(({ items }, group) =>
  items.map((item) => ({ ...item, secondary: group !== 0 })),
).map(({ title, unread, secondary }, index) =>
  `.{ .id = ${index + 1}, .title = ${JSON.stringify(title)}, .selected = ${title === "Reviews"}, .is_event = ${secondary}, .detail = ${JSON.stringify(unread ? String(unread) : "")} }`,
);
function sidebarGroup(index) {
  const group = projectSidebar.sections[index];
  const flag = index === 0 ? "sidebar_group_open" : "gallery_sidebar_resources_open";
  const toggle = index === 0 ? "toggle_sidebar_group" : "toggle_sidebar_resources";
  const destination = '<use template="yg-sidebar-destination" label="{item.title}" item_id="{item.id}" selected="{item.selected}">' +
    '<row cross="center" gap="4"><text grow="1">{item.title}</text><text size="sm" foreground="text_muted">{item.detail}</text></row></use>';
  return `<column gap="4"><if test="{${flag}}"><list-item icon="chevron-up" height="38" on-press="${toggle}">${group.title}</list-item></if>
    <else><list-item icon="chevron-down" height="38" on-press="${toggle}">${group.title}</list-item></else>
    <if test="{${flag}}"><row><spacer width="20"/><list grow="1" gap="2">
      <for each="sidebar_destinations" key="id" as="item"><if test="{item.is_event}">${index === 1 ? destination : ""}</if>
      <else>${index === 0 ? destination : ""}</else></for>
    </list></row></if></column>`;
}
const projectNavigation = `<row cross="center"><text grow="1" size="sm" foreground="text_muted">Workspace</text>
  <button variant="ghost" size="icon" icon="plus" label="Add project view" on-press="add_sidebar_item"/></row>
  ${sidebarGroup(0)}${sidebarGroup(1)}
  <text size="sm" foreground="text_muted">${projectSidebar.footer}</text>`;
const slots = {
  "project-sidebar": projectNavigation,
  yogurt: workspaceIntroduction,
  surface: workspaceIntroduction,
  stack: projectIcons,
  inline: projectIcons,
  grid: projectIcons,
  "action-menu": samples.menu.items.map(({ label }, index) =>
    `<menu-item height="36" on-press="gallery_menu:{gallery_${segmentPositions[index]}_id}">${label}</menu-item>`,
  ).join(""),
  tooltip: '<button on-press="activate">Review details</button>',
  tabs: [
    '<segmented-control selected="{gallery_first_selected}" on-press="gallery_select_option:{gallery_first_id}">Overview</segmented-control>',
    '<segmented-control selected="{gallery_second_selected}" on-press="gallery_select_option:{gallery_second_id}">Activity</segmented-control>',
  ].join(""),
  "segmented-control": segments,
  "radio-group": '<radio checked="{gallery_first_selected}" on-toggle="gallery_select_option:{gallery_first_id}">Daily</radio><radio checked="{gallery_second_selected}" on-toggle="gallery_select_option:{gallery_second_id}">Weekly</radio>',
  "data-table": reviewRows,
  table: reviewRows,
  "selection-list": '<checkbox checked="{gallery_first_checked}" on-toggle="gallery_toggle_option:{gallery_first_id}">Weekly digest</checkbox><checkbox checked="{gallery_second_checked}" on-toggle="gallery_toggle_option:{gallery_second_id}">Product updates</checkbox>',
  accordion: '<text>This view includes notes saved in the last seven days.</text>',
  "disclosure-row": `<text size="sm" foreground="text_muted">${samples["disclosure-row"].body}</text>`,
  card: '<column gap="12"><text wrap="true">' + samples.card.body + '</text>' +
    '<row main="start"><if test="{enabled}"><button variant="secondary" on-press="toggle">' + samples.card.pin + '</button></if>' +
    '<else><button variant="secondary" on-press="toggle">' + samples.card.unpin + '</button></else></row></column>',
  dialog: editView,
  drawer: editView,
  sheet: editView,
  popover: "<text>" + samples.popover.body + "</text>",
  "empty-result": '<text>Try a different search or create a new view.</text>',
  result: '<text>Your saved view is still here.</text>',
  "record-facts": '<text>Last updated today</text>',
  chart: '<chart label="Reviews this week" height="224" y-min="0" grid-lines="3" y-labels="true" x-labels="{gallery_chart_dates}" stroke-width="2">' +
    '<series kind="line" values="{gallery_chart_values}" color="accent" label="Completed reviews"/>' +
    '</chart><text size="sm" foreground="text_muted">' + examples.chart.source + '</text>' +
    '<accordion text="View readings" selected="{gallery_chart_open}" on-toggle="gallery_toggle_chart">' +
      '<table label="Completed reviews">' + reviewRows + '</table></accordion>',
  "bar-chart": `<column gap="8">${netRows}</column><text size="sm" foreground="text_muted">${examples["bar-chart"].source}</text>`,
  "list-header": '<text>Recently updated</text>',
  "list-footer": '<text>All records are up to date</text>',
  "bottom-info": '<text>Changes are saved locally.</text>',
  "bottom-action": '<button variant="secondary" on-press="activate">Save view</button>',
  "button-group": '<button variant="secondary" on-press="activate">Cancel</button><button on-press="activate">Save view</button>',
  "filter-bar": '<button variant="secondary" on-press="activate">All records</button>',
  list: samples.records.map(({ title, day }) =>
    `<list-item label="${title}" on-press="activate"><row cross="center" gap="8"><text grow="1">${title}</text><text size="sm" foreground="text_muted">${day}</text></row></list-item>`,
  ).join(""),
  "navigation-list": '<list-item on-press="activate">Records</list-item><list-item on-press="activate">Facts</list-item>',
  "grid-list": '<text>Weekly review</text><text>Planning notes</text><text>Project updates</text>',
  "hover-card": '<text>Three records are ready to review.</text>',
  bubble: '<text>The review is ready when you are.</text>',
  post: '<text>Shared the latest project notes.</text>',
  transcript: '<text>Review the notes and summarize the decisions.</text>',
  field: viewNameInput,
  form: '<column gap="8">' + viewNameInput + '<button variant="primary" on-press="activate">Save view</button></column>',
  "scroll-area": '<column gap="12" padding="8">' + [
    "Weekly review", "Planning notes", "Project updates", "Draft decisions",
    "Quality observations", "Access review", "Release notes", "Archive",
  ].map(note => "<text>" + note + "</text>").join("") + "</column>",
  combobox: '<list-item on-press="choose:{gallery_first_id}">Yogurt</list-item><list-item on-press="choose:{gallery_second_id}">Meatball</list-item>',
  resizable: "<text>Weekly review</text>",
  questionnaire: '<radio checked="true" on-toggle="toggle">Sourdough</radio>',
  breadcrumb: '<button variant="ghost" on-press="navigate">Library</button><button variant="ghost" on-press="navigate">Records</button><text>Weekly review</text>',
  ...workspaceSlots,
};
const tests = [
  'const std = @import("std");',
  'const canvas = @import("native_sdk").canvas;',
  `const Choice = struct { id: u32, title: []const u8, selected: bool = false, disabled: bool = false, detail: []const u8 = "Ready", ${workspaceChoiceFields} };`,
  'const sample = [_]Choice{ .{ .id=1, .title="Yogurt", .selected=true }, .{ .id=2, .title="Meatball" } };',
  `const project_destinations = [_]Choice{ ${projectDestinations.join(", ")} };`,
  'const sidebar_sample = [_]Choice{ .{ .id=1, .title="Overview", .selected=true }, .{ .id=2, .title="Reviews" } };',
  `const Model = struct { gallery_first_id: u32 = 1, gallery_second_id: u32 = 2, gallery_third_id: u32 = 3, gallery_third_selected: bool = false, gallery_progress_fraction: f32 = 0.2, gallery_progress_full: bool = false, gallery_agent_row_selected: bool = false, gallery_chart_open: bool = false, gallery_sidebar_resources_open: bool = true, gallery_sidebar_active: []const u8 = "Reviews", gallery_project_destinations: [project_destinations.len]Choice = project_destinations, gallery_sidebar_visible: bool = true, gallery_progress_label: []const u8 = "20%", gallery_chart_values: [${observed.length}]f32 = .{${observed.join(", ")}}, gallery_chart_dates: [${dates.length}][]const u8 = .{${dates.join(", ")}}, gallery_slider_label: []const u8 = "${samples.slider.value}${samples.slider.unit}", project_picture: u32 = 1, sourdough_picture: u32 = 2, meatball_picture: u32 = 3, gallery_first_selected: bool = true, gallery_second_selected: bool = false, gallery_first_checked: bool = true, gallery_second_checked: bool = false, enabled: bool = true, is_open: bool = true, unavailable: bool = false, at_first: bool = true, at_last: bool = false, amount: f32 = 0.3, picture: u32 = 1, samples: [3]f32 = .{1, 3, 2}, rtl: bool = false, all_checked: bool = false, stage: usize = 1, fraction: f32 = 0.4, key_columns: usize = 3, first_label: []const u8 = "Team", last_label: []const u8 = "Record", first_value: []const u8 = "415", last_value: []const u8 = "0182", month_label: []const u8 = "November 2026", choices: []const Choice = &sample, days: []const Choice = &sample, events: []const Choice = &sample, notifications: []const Choice = &sample, keys: []const Choice = &sample, menus: []const Choice = &sample, value: []const u8 = "Weekly", has_results: bool = true, facts: []const Choice = &sample, pending: bool = false, title: []const u8 = "Review", consequence: []const u8 = "Move to archive", action_label: []const u8 = "Archive", as_of: []const u8 = "Nov 20", source: []const u8 = "Example", ${workspaceModelFields} };`,
  `const Msg = union(enum) { gallery_select_option: u32, gallery_toggle_option: u32, gallery_menu: u32, gallery_toggle_chart, toggle_sidebar_resources, toggle_project_sidebar, advance_progress, activate, edit: canvas.TextInputEvent, edit_first: canvas.TextInputEvent, edit_last: canvas.TextInputEvent, clear, open_choices, toggle, navigate, previous_page, next_page, dismiss, confirm_current, lookup_original, jump_to_latest, choose: u32, dismiss_item: u32, open_menu: u32, adjust: f32, copy, decrement, increment, toggle_all, backspace, discard, stop, ${workspaceActionFields} };`,
  "const Ui = canvas.Ui(Msg);",
];
for (const { id, native, nativeMarkup } of [...catalog, ...blocks]) {
  if (nativeMarkup === false) continue;
  const source = readFileSync(resolve(host, "src/yogurt/items", id + ".native"), "utf8");
  const keys = (source.match(/args="([^"]*)"/)?.[1] ?? "")
    .split(" ")
    // Optional arguments are supplied by the template's own defaults.
    .map((argument) => argument.split("="))
    .filter(([key, fallback]) => key && (fallback === undefined || examples[id]?.[key] !== undefined))
    .map(([key]) => key);
  const attributes = keys
    .map((k) => {
      const value = examples[id]?.[k] ?? args[k];
      if (!value) throw Error("Missing example arg " + k);
      return k + '="' + value + '"';
    })
    .join(" ");
  const use =
    '<use template="yg-' +
    id +
    '" ' +
    attributes +
    (source.split("</template>")[0].includes("<slot/>")
      ? ">" + (slots[id] ?? "<text>Details</text>") + "</use>"
      : "/>");
  const dismissibleLayer = ["dialog", "drawer", "sheet", "confirm-dialog"].includes(id);
  const specimen = id === "text"
    ? `<column gap="4">${use}<text size="sm" foreground="text_muted">${samples.text.help}</text><text size="sm" foreground="text_muted">${samples.text.meta}</text></column>`
    : id === "tabs"
      ? `<column gap="12">${use}<if test="{gallery_first_selected}"><text>Project overview</text></if>
         <else><text>Recent activity</text></else></column>`
    : id === "keypad"
      ? `<column gap="12"><text>{value}</text>${use}</column>`
    : id === "attachment"
      ? `<if test="{enabled}">${use}</if><else><text>Attachment removed</text></else>`
    : id === "composer"
      ? `<column gap="12">${use}<text size="sm" foreground="text_muted">${samples.composer.hint}</text></column>`
    : id === "project-sidebar"
      ? `<row gap="16"><if test="{gallery_sidebar_visible}"><column width="256">${use}</column></if>
        <column grow="1" background="background" radius="lg" padding="16" gap="16">
          <row cross="center" gap="8"><button size="icon" variant="ghost" icon="menu" label="Toggle sidebar" on-press="toggle_project_sidebar"/>
          <text>Workspace</text><icon name="chevron-right" width="12" height="12"/><text>{gallery_sidebar_active}</text></row>
          <column gap="4"><text size="heading">{gallery_sidebar_active}</text><text size="sm" foreground="text_muted">Review the latest work in {gallery_sidebar_active}.</text></column>
        </column></row>`
      : id === "heading"
      ? `<column gap="4">${use}<text size="sm" foreground="text_muted">${samples.heading.help}</text></column>`
      : id === "progress"
        ? `<column gap="12">${use}<row main="start"><if test="{gallery_progress_full}"><button variant="secondary" on-press="advance_progress">${samples.progress.reset}</button></if><else><button variant="secondary" on-press="advance_progress">${samples.progress.next}</button></else></row></column>`
        : id === "divider"
          ? '<column gap="8"><text>Current review</text>' + use + '<text size="sm" foreground="text_muted">Archived on Friday</text></column>'
          : id === "icon"
            ? '<row gap="16">' + use + '<icon name="check" width="16" height="16"/><icon name="chevron-down" width="16" height="16"/><icon name="arrow-right" width="16" height="16"/><icon name="clock" width="16" height="16"/></row>'
            : dismissibleLayer
    ? '<row main="start"><button variant="secondary" on-press="open_choices">' + (id === "confirm-dialog" ? "Review change" : samples.dialog.title) + '</button></row><if test="{is_open}">' + use + "</if>"
    : id === "toast"
      ? '<if test="{is_open}">' + use + '</if><else><button variant="secondary" on-press="open_choices">Save view</button></else>'
      : id === "switch"
        ? '<column gap="4">' + use + '<if test="{enabled}"><text size="sm" foreground="text_muted">' + samples.switch.on + '</text></if>' +
          '<else><text size="sm" foreground="text_muted">' + samples.switch.off + '</text></else></column>'
      : id === "stepper"
        ? '<column gap="12">' + use + '<button variant="secondary" on-press="activate">Next stage</button></column>'
        : id === "label"
          ? '<column gap="6">' + use + viewNameInput + '</column>'
          : id === "help-text"
            ? '<column gap="6"><text size="sm">View name</text>' + viewNameInput + use + '</column>'
            : id === "field-error"
              ? '<column gap="6"><text size="sm">View name</text>' + viewNameInput + '<if test="{enabled}">' + use + '</if></column>'
              : use;
  const example =
    '<import src="' + id + '.native"/>\n<column>' + specimen + "</column>\n";
  writeFileSync(dir + "/" + id + "-test.native", example);
  tests.push(
    'test "' + id + ' builds from its installed template" {',
    '    const root = "' + id + '-test.native";',
    "    const sources = [_]canvas.ui_markup.SourceFile{ .{ .path = root, .source = @embedFile(root) }, " +
      [id, ...(native ?? [])]
        .map(
          (name) =>
            '.{ .path = "' +
            name +
            '.native", .source = @embedFile("../yogurt/items/' +
            name +
            '.native") }',
        )
        .join(", ") +
      " };",
    "    const compiled = canvas.CompiledMarkupImports(Model, Msg, root, &sources);",
    "    var arena = std.heap.ArenaAllocator.init(std.testing.allocator);",
    "    defer arena.deinit();",
    "    var ui = Ui.init(arena.allocator());",
    "    const tree = try ui.finalize(compiled.build(&ui, &Model{}));",
    "    try std.testing.expect(tree.root.children.len > 0);",
    "}",
  );
}
writeFileSync(dir + "/all.zig", tests.join("\n") + "\n");
console.log(
  "Import " +
    relative(resolve(host, "src"), dir) +
    "/all.zig in the fixture test block.",
);
