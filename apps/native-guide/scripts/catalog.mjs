// Generate one typed Zig test per shipped template inside an isolated SDK host.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { workspaceArgs, workspaceSlots, workspaceChoiceFields, workspaceModelFields, workspaceActionFields } from "./catalog-workspaces.mjs";
const kit = fileURLToPath(new URL("../../../", import.meta.url)),
  host = process.argv[2];
if (!host) throw Error("Pass an isolated, scaffolded Zig host directory.");
const dir = resolve(host, "src/yogurt-catalog-test");
mkdirSync(dir, { recursive: true });
const catalog = JSON.parse(readFileSync(kit + "/catalog/components.json"));
const blocks = JSON.parse(readFileSync(kit + "/catalog/blocks.json"));
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
  text: { label: "A clear view of the work ahead." },
  heading: { label: "Your workspace" },
  button: { label: "Save view" },
  "icon-button": { label: "Add a view" },
  checkbox: { label: "Include archived views" },
  switch: { label: "Show dates" },
  toggle: { label: "Show details" },
  link: { label: "View record details" },
  tabs: { label: "Project details" },
  "segmented-control": { label: "View mode" },
  "radio-group": { label: "Update frequency" },
  "selection-list": { label: "Included updates" },
  accordion: { label: "About this view" },
  "disclosure-row": { label: "View details" },
  card: { title: "Weekly review", detail: "Three records are ready to review." },
  dialog: { title: "Edit view" },
  drawer: { title: "Edit view" },
  sheet: { title: "Edit view" },
  popover: { label: "About this view" },
  tooltip: { label: "Add a saved view" },
  toast: { label: "View saved." },
  progress: { label: "Reviewed records" },
  slider: { label: "Review progress" },
  chart: { label: "Reviews this week", source: "Completed reviews" },
  "bar-chart": { label: "Reviews this week", source: "Completed reviews" },
  "data-table": { label: "Weekly reviews" },
  "scroll-area": { label: "Recent notes", height: "124" },
  resizable: { label: "Resize project list", summary: "Projects", height: "136" },
  form: { label: "Save a view" },
  field: { label: "View name" },
  label: { label: "View name" },
  "help-text": { label: "Use a name your team will recognize." },
  "field-error": { label: "Give this view a name." },
  stepper: { label: "Release stages" },
  table: { label: "Weekly readings" },
  "empty-result": { title: "No records found" },
  result: { title: "Could not load records" },
  "record-facts": { title: "Weekly review" },
  "numeric-spinner": { label: "Records to review" },
  "search-field": { label: "Search records" },
  "text-field": { label: "View name" },
  textarea: { label: "Notes" },
  "input-group": { label: "View name" },
  "input-otp": { label: "Verification code", value: "{value}" },
  badge: { label: "Draft" },
  status: { label: "Saved" },
  notice: { title: "View updated", detail: "Your team can use the new view." },
};
const viewNameInput = '<text-field label="View name" text="{value}" on-input="edit"/>';
const reviewRows = [
  ["Day", "Work", "Status"],
  ["Monday", "Review", "Ready"],
  ["Tuesday", "Planning", "In progress"],
  ["Wednesday", "Notes", "Done"],
].map(row => "<table-row>" + row.map((value, index) =>
  '<table-cell width="' + [128, 144, 144][index] + '">' + value + '</table-cell>',
).join("") + "</table-row>").join("");
const slots = {
  "action-menu": '<menu-item on-press="dismiss">Close menu</menu-item>',
  tooltip: '<button on-press="activate">Review details</button>',
  tabs: '<toggle-button selected="{gallery_first_selected}" on-toggle="gallery_select_option:{gallery_first_id}">Overview</toggle-button><toggle-button selected="{gallery_second_selected}" on-toggle="gallery_select_option:{gallery_second_id}">Activity</toggle-button>',
  "segmented-control": '<segmented-control selected="{gallery_first_selected}" on-press="gallery_select_option:{gallery_first_id}">Overview</segmented-control><segmented-control selected="{gallery_second_selected}" on-press="gallery_select_option:{gallery_second_id}">Activity</segmented-control>',
  "radio-group": '<radio checked="{gallery_first_selected}" on-toggle="gallery_select_option:{gallery_first_id}">Daily</radio><radio checked="{gallery_second_selected}" on-toggle="gallery_select_option:{gallery_second_id}">Weekly</radio>',
  "data-table": reviewRows,
  table: reviewRows,
  "selection-list": '<checkbox checked="{gallery_first_checked}" on-toggle="gallery_toggle_option:{gallery_first_id}">Weekly digest</checkbox><checkbox checked="{gallery_second_checked}" on-toggle="gallery_toggle_option:{gallery_second_id}">Product updates</checkbox>',
  accordion: '<text>This view includes notes saved in the last seven days.</text>',
  "disclosure-row": '<text>Three records are ready to review.</text>',
  card: '<text>Updated today</text>',
  dialog: '<text>Change the name and details for this view.</text>',
  drawer: '<text>Change the name and details for this view.</text>',
  sheet: '<text>Change the name and details for this view.</text>',
  popover: '<text>This view includes notes saved in the last seven days.</text>',
  "empty-result": '<text>Try a different search or create a new view.</text>',
  result: '<text>Your saved view is still here.</text>',
  "record-facts": '<text>Last updated today</text>',
  chart: '<text>Records reviewed across the week</text>',
  "bar-chart": '<text>Records reviewed across the week</text>',
  "list-header": '<text>Recently updated</text>',
  "list-footer": '<text>All records are up to date</text>',
  "bottom-info": '<text>Changes are saved locally.</text>',
  "bottom-action": '<button variant="secondary" on-press="activate">Save view</button>',
  "button-group": '<button variant="secondary" on-press="activate">Cancel</button><button on-press="activate">Save view</button>',
  "filter-bar": '<button variant="secondary" on-press="activate">All records</button>',
  list: '<list-item on-press="activate">Weekly review</list-item><list-item on-press="activate">Planning notes</list-item><list-item on-press="activate">Project updates</list-item>',
  "navigation-list": '<list-item on-press="activate">Records</list-item><list-item on-press="activate">Facts</list-item>',
  "grid-list": '<text>Weekly review</text><text>Planning notes</text><text>Project updates</text>',
  "hover-card": '<text>Three records are ready to review.</text>',
  bubble: '<text>The review is ready when you are.</text>',
  post: '<text>Shared the latest project notes.</text>',
  transcript: '<text>Review the notes and summarize the decisions.</text>',
  field: viewNameInput,
  form: '<column gap="8">' + viewNameInput + '<button on-press="activate">Save view</button></column>',
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
  'const sidebar_sample = [_]Choice{ .{ .id=1, .title="Overview", .selected=true }, .{ .id=2, .title="Reviews" } };',
  `const Model = struct { gallery_first_id: u32 = 1, gallery_second_id: u32 = 2, gallery_first_selected: bool = true, gallery_second_selected: bool = false, gallery_first_checked: bool = true, gallery_second_checked: bool = false, enabled: bool = true, is_open: bool = true, unavailable: bool = false, at_first: bool = true, at_last: bool = false, amount: f32 = 0.3, picture: u32 = 1, samples: [3]f32 = .{1, 3, 2}, rtl: bool = false, all_checked: bool = false, stage: usize = 1, fraction: f32 = 0.4, key_columns: usize = 3, first_label: []const u8 = "Team", last_label: []const u8 = "Record", first_value: []const u8 = "415", last_value: []const u8 = "0182", month_label: []const u8 = "November 2026", choices: []const Choice = &sample, days: []const Choice = &sample, events: []const Choice = &sample, notifications: []const Choice = &sample, keys: []const Choice = &sample, menus: []const Choice = &sample, value: []const u8 = "Weekly", has_results: bool = true, facts: []const Choice = &sample, pending: bool = false, title: []const u8 = "Review", consequence: []const u8 = "Move to archive", action_label: []const u8 = "Archive", as_of: []const u8 = "Nov 20", source: []const u8 = "Example", ${workspaceModelFields} };`,
  `const Msg = union(enum) { gallery_select_option: u32, gallery_toggle_option: u32, activate, edit: canvas.TextInputEvent, edit_first: canvas.TextInputEvent, edit_last: canvas.TextInputEvent, clear, open_choices, toggle, navigate, previous_page, next_page, dismiss, confirm_current, lookup_original, jump_to_latest, choose: u32, dismiss_item: u32, open_menu: u32, adjust: f32, copy, decrement, increment, toggle_all, backspace, discard, stop, ${workspaceActionFields} };`,
  "const Ui = canvas.Ui(Msg);",
];
for (const { id, native } of [...catalog, ...blocks]) {
  const source = readFileSync(
    native
      ? kit + "/packages/recipes/" + id + "/view.native"
      : kit + "/packages/native/controls/items/" + id + ".native",
    "utf8",
  );
  writeFileSync(dir + "/" + id + ".native", source);
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
  const specimen = dismissibleLayer
    ? '<button variant="secondary" on-press="open_choices">' + (id === "confirm-dialog" ? "Review change" : "Edit view") + '</button><if test="{is_open}">' + use + "</if>"
    : id === "toast"
      ? '<if test="{is_open}">' + use + '</if><else><button variant="secondary" on-press="open_choices">Save view</button></else>'
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
            '.native", .source = @embedFile("' +
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
