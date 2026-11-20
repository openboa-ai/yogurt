// Generate one typed Zig test per shipped template inside an isolated SDK host.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { workspaceArgs, workspaceSlots, workspaceChoiceFields, workspaceModelFields, workspaceActionFields } from "./native-catalog-workspaces.mjs";
const kit = fileURLToPath(new URL("../", import.meta.url)),
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
const slots = {
  "action-menu": '<menu-item on-press="activate">Rename view</menu-item>',
  tabs: '<toggle-button selected="true" on-toggle="toggle">Overview</toggle-button>',
  "segmented-control":
    '<segmented-control selected="true" on-press="activate">Overview</segmented-control>',
  "radio-group": '<radio checked="true" on-toggle="toggle">Daily</radio>',
  "data-table": "<table-row><table-cell>Day</table-cell></table-row>",
  table: "<table-row><table-cell>Day</table-cell></table-row>",
  "selection-list": '<checkbox on-toggle="toggle">Weekly</checkbox>',
  combobox: '<list-item on-press="activate">Yogurt</list-item>',
  resizable: "<text>Review</text>",
  questionnaire: '<radio checked="true" on-toggle="toggle">Sourdough</radio>',
  breadcrumb: '<button variant="ghost" on-press="navigate">Library</button>',
  ...workspaceSlots,
};
const tests = [
  'const std = @import("std");',
  'const canvas = @import("native_sdk").canvas;',
  `const Choice = struct { id: u32, title: []const u8, selected: bool = false, disabled: bool = false, detail: []const u8 = "Ready", ${workspaceChoiceFields} };`,
  'const sample = [_]Choice{ .{ .id=1, .title="Yogurt", .selected=true }, .{ .id=2, .title="Meatball" } };',
  `const Model = struct { enabled: bool = true, is_open: bool = true, unavailable: bool = false, at_first: bool = true, at_last: bool = false, amount: f32 = 0.3, picture: u32 = 1, samples: [3]f32 = .{1, 3, 2}, rtl: bool = false, all_checked: bool = false, stage: usize = 1, fraction: f32 = 0.4, key_columns: usize = 3, first_label: []const u8 = "Team", last_label: []const u8 = "Record", first_value: []const u8 = "415", last_value: []const u8 = "0182", month_label: []const u8 = "November 2026", choices: []const Choice = &sample, days: []const Choice = &sample, events: []const Choice = &sample, notifications: []const Choice = &sample, keys: []const Choice = &sample, menus: []const Choice = &sample, value: []const u8 = "Weekly", has_results: bool = true, facts: []const Choice = &sample, pending: bool = false, title: []const u8 = "Review", consequence: []const u8 = "Move to archive", action_label: []const u8 = "Archive", as_of: []const u8 = "Nov 20", source: []const u8 = "Example", ${workspaceModelFields} };`,
  `const Msg = union(enum) { activate, edit: canvas.TextInputEvent, edit_first: canvas.TextInputEvent, edit_last: canvas.TextInputEvent, clear, open_choices, toggle, navigate, previous_page, next_page, dismiss, confirm_current, lookup_original, jump_to_latest, choose: u32, dismiss_item: u32, open_menu: u32, adjust: f32, copy, decrement, increment, toggle_all, backspace, discard, stop, ${workspaceActionFields} };`,
  "const Ui = canvas.Ui(Msg);",
];
for (const { id, native } of [...catalog, ...blocks]) {
  const source = readFileSync(
    native
      ? kit + "/blocks/" + id + "/view.native"
      : kit + "/packages/native/controls/items/" + id + ".native",
    "utf8",
  );
  writeFileSync(dir + "/" + id + ".native", source);
  const keys = (source.match(/args="([^"]*)"/)?.[1] ?? "")
    .split(" ")
    .filter(Boolean);
  const attributes = keys
    .map((k) => {
      if (!args[k]) throw Error("Missing example arg " + k);
      return k + '="' + args[k] + '"';
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
  const example =
    '<import src="' + id + '.native"/>\n<column>' + use + "</column>\n";
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
