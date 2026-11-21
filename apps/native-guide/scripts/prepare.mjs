// Prepare the Native gallery inside an already-created disposable SDK host.
import { readFileSync, writeFileSync, copyFileSync, existsSync, unlinkSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const kit = fileURLToPath(new URL("../../../", import.meta.url));
const argument = process.argv[2];
if (!argument) throw Error("Pass an isolated, scaffolded Native host directory.");
const host = resolve(argument);
if (host === resolve(kit) || !existsSync(join(host, "src")) || !existsSync(join(host, "app.json")))
  throw Error("The target must be an isolated, scaffolded Native host.");
if (!existsSync(join(host, ".yogurt-guide-host")) || readFileSync(join(host, ".yogurt-guide-host"), "utf8").trim() !== "yogurt-native-guide")
  throw Error("Expected an explicitly marked, disposable Native guide scaffold.");
const install = spawnSync(process.execPath, [join(kit, "bin/yogurt.mjs"), "add", "button", "--target", "native", "--dir", host], { stdio: "inherit" });
if (install.status !== 0) throw Error("Native theme and font installation failed.");
const result = spawnSync(process.execPath, [join(kit, "apps/native-guide/scripts/catalog.mjs"), host], { stdio: "inherit" });
if (result.status !== 0) throw Error("Native catalog fixture generation failed.");
const gallery = join(kit, "apps/native-guide");
copyFileSync(join(gallery, "app.json"), join(host, "app.json"));
copyFileSync(join(gallery, "src/main.zig"), join(host, "src/main.zig"));
copyFileSync(join(kit, "packages/native/controls/precision-inputs.zig"), join(host, "src/yogurt/precision-inputs.zig"));
copyFileSync(join(gallery, "src/agent-preview.zig"), join(host, "src/agent-preview.zig"));
mkdirSync(join(host, "src/yogurt/models"), { recursive: true });
for (const name of ["agent-vector.zig", "avatar-pose-data.zig", "agent-family-data.zig"]) {
  copyFileSync(join(kit, "packages/native/controls/models", name), join(host, "src/yogurt/models", name));
}
copyFileSync(join(gallery, "src/navigation.zig"), join(host, "src/navigation.zig"));
copyFileSync(join(gallery, "src/workspace-fixtures.zig"), join(host, "src/workspace-fixtures.zig"));
copyFileSync(join(gallery, "src/gallery-tests.zig"), join(host, "src/gallery-tests.zig"));
copyFileSync(join(gallery, "src/gallery-tests.zig"), join(host, "src/tests.zig"));
for (const project of ["yogurt", "sourdough", "meatball"]) {
  copyFileSync(join(kit, `design/assets/projects/${project}.png`), join(host, `src/yogurt-guide-${project}.png`));
}
copyFileSync(join(kit, "packages/native/controls/art/openboa.png"), join(host, "src/yogurt-guide-openboa.png"));
if (existsSync(join(host, "src/app.native"))) unlinkSync(join(host, "src/app.native"));
const components = JSON.parse(readFileSync(join(kit, "catalog/components.json"), "utf8"));
const blocks = JSON.parse(readFileSync(join(kit, "catalog/blocks.json"), "utf8"));
const catalog = [...components, ...blocks.map((block) => ({ ...block, family: "Blocks" }))];
if (new Set(catalog.map((entry) => entry.id)).size !== catalog.length) throw Error("Duplicate component or block ID.");
const markFile = join(host, "src/yogurt-catalog-test/project-mark-test.native");
const mark = readFileSync(markFile, "utf8");
if (!mark.includes('image_id="{picture}"')) throw Error("Missing project mark image binding.");
writeFileSync(markFile, `<import src="project-mark.native"/>
<column cross="center"><row gap="16" main="center" cross="center">
  <column cross="center" gap="8"><use template="yg-project-mark" label="Yogurt" image_id="{project_picture}"/><text>Yogurt</text><if test="{project_missing}"><text>Unavailable</text></if></column>
  <column cross="center" gap="8"><use template="yg-project-mark" label="Sourdough" image_id="{sourdough_picture}"/><text>Sourdough</text><if test="{sourdough_missing}"><text>Unavailable</text></if></column>
  <column cross="center" gap="8"><use template="yg-project-mark" label="Meatball" image_id="{meatball_picture}"/><text>Meatball</text><if test="{meatball_missing}"><text>Unavailable</text></if></column>
</row></column>\n`);
for (const id of ["icon", "avatar"]) {
  const file = join(host, "src/yogurt-catalog-test", `${id}-test.native`);
  const source = readFileSync(file, "utf8");
  if (!source.includes("<column>")) throw Error(`Missing specimen container in ${id}.`);
  writeFileSync(file, source.replace("<column>", '<column cross="center">'));
}
for (const id of ["agent-avatar", "gaze"]) {
  const file = join(host, "src/yogurt-catalog-test", `${id}-test.native`);
  const source = readFileSync(file, "utf8");
  if (!source.includes('<column>') || !source.includes('label="Weekly review"') || !source.includes('image_id="{picture}"')) throw Error(`Missing agent specimen binding in ${id}.`);
  writeFileSync(file, source.replace('<column>', '<column cross="center">').replace('label="Weekly review"', 'label="{agent_label}"').replace('image_id="{picture}"', 'image_id="{picture}" size="72"'));
}
{
  const file = join(host, "src/yogurt-catalog-test/agent-row-test.native");
  const source = readFileSync(file, "utf8");
  if (!source.includes('label="Weekly review"')) throw Error("Missing agent row label.");
  writeFileSync(file, source.replace('label="Weekly review"', 'label="Kai"'));
}
for (const id of ["text-field", "textarea", "search-field", "input-group", "combobox"]) {
  const file = join(host, "src/yogurt-catalog-test", `${id}-test.native`);
  const source = readFileSync(file, "utf8");
  if (!source.includes('value="Weekly view"')) throw Error(`Missing editable value in ${id}.`);
  writeFileSync(file, source.replace('value="Weekly view"', 'value="{value}"'));
}
const specimenRoot = (id, value) => {
  const file = join(host, "src/yogurt-catalog-test", `${id}-test.native`);
  const source = readFileSync(file, "utf8");
  if (!source.includes('value="Weekly view"')) throw Error(`Missing fixture value in ${id}.`);
  writeFileSync(file, source.replace('value="Weekly view"', `value="{${value}}"`));
};
specimenRoot("numeric-spinner", "gallery_count_text");
specimenRoot("carousel", "gallery_page_text");
specimenRoot("date-picker", "gallery_date_value");
const paginationFile = join(host, "src/yogurt-catalog-test/pagination-test.native");
const pagination = readFileSync(paginationFile, "utf8");
if (!pagination.includes('summary="Page one"')) throw Error("Missing pagination summary.");
writeFileSync(paginationFile, pagination.replace('summary="Page one"', 'summary="{gallery_page_text}"'));
const carouselFile = join(host, "src/yogurt-catalog-test/carousel-test.native");
const carousel = readFileSync(carouselFile, "utf8");
if (!carousel.includes("<text>Details</text>")) throw Error("Missing carousel fixture slot.");
writeFileSync(carouselFile, carousel.replace("<text>Details</text>", '<column><if test="{gallery_page_one}"><text>First sample</text></if><if test="{gallery_page_two}"><text>Second sample</text></if></column>'));
writeFileSync(join(host, "src/yogurt-catalog-test/select-test.native"), '<import src="select.native"/>\n<column><use template="yg-select-picker" label="Weekly review" value="{value}" expanded="{gallery_picker_open}"><column><for each="choices" key="id" as="item"><menu-item on-press="choose:{item.id}">{item.title}</menu-item></for></column></use></column>\n');
const prior = readFileSync(join(host, "src/yogurt-catalog-test/all.zig"), "utf8").split("\n");
const findLine = (prefix) => {
  const matches = prior.filter((line) => line.startsWith(prefix));
  if (matches.length !== 1) throw Error(`Expected one ${prefix} declaration in the generated catalog.`);
  return matches[0];
};
const model = findLine("const Model = struct {").replace("days: []const Choice = &sample", "days: []const Choice = &november_days").replace("const Model = struct {", "pub const Model = struct { gallery_days: [31]Choice = december_days, gallery_choices: [2]Choice = sample, gallery_date_value: []const u8 = \"Choose a date\", project_picture: u32 = 0, sourdough_picture: u32 = 0, meatball_picture: u32 = 0, project_missing: bool = true, sourdough_missing: bool = true, meatball_missing: bool = true, gallery_selected: u32 = 0, gallery_list_open: bool = true, gallery_dark: bool = false, gallery_status: []const u8 = \"Ready\", gallery_picker_open: bool = false, gallery_count: u8 = 0, gallery_count_text: []const u8 = \"0\", gallery_page: u8 = 0, gallery_page_text: []const u8 = \"1 of 2\", gallery_page_one: bool = true, gallery_page_two: bool = false, gallery_detail_title: []const u8 = \"\", gallery_detail_body: []const u8 = \"\", gallery_workspace_query: canvas.TextBuffer(128) = .{}, gallery_picker_query: canvas.TextBuffer(128) = .{}, gallery_profile_name: canvas.TextBuffer(128) = canvas.TextBuffer(128).init(\"Kai\"), gallery_profile_instructions: canvas.TextBuffer(1024) = canvas.TextBuffer(1024).init(\"Review the release notes.\"), gallery_notification_mask: [2]bool = .{ true, true }, gallery_notification_rows: [2]Choice = sample, gallery_sidebar_query: canvas.TextBuffer(128) = .{}, gallery_sidebar_filtered: [3]Choice = .{ sample[0], sample[1], .{ .id = 3, .title = \"New sample view\" } }, gallery_sidebar_added: bool = false, gallery_sidebar_new_selected: bool = false, gallery_composer_mask: [2]bool = .{ true, true }, gallery_composer_visible: [2]Choice = sample, gallery_tool_selected: bool = false, gallery_editor: canvas.TextBuffer(1024) = canvas.TextBuffer(1024).init(\"Weekly\"), gallery_first_editor: canvas.TextBuffer(1024) = canvas.TextBuffer(1024).init(\"415\"), gallery_last_editor: canvas.TextBuffer(1024) = canvas.TextBuffer(1024).init(\"0182\"),");
const brandModel = model.replace("project_image: u32 = 1", "project_image: u32 = 0")
  .replace("sidebar_destinations: []const Choice = &sample", "sidebar_destinations: []const Choice = &sidebar_sample")
  .replace("pub const Model = struct {", "pub const Model = struct { agent_playback: ?agent_vector.Playback = null, agent_sol_playback: ?agent_vector.Playback = null, agent_kind: agent_vector.Agent = .kai, agent_label: []const u8 = \"Kai\", agent_pending: ?agent_vector.State = null, agent_reduced_motion: bool = false, agent_next_ms: u64 = 0, agent_sol_next_ms: u64 = 0, agent_kai_picture: u32 = 0, agent_sol_picture: u32 = 0, agent_kai_error: bool = false, agent_sol_error: bool = false, agent_error: bool = false, gallery_agent_choices: [2]Choice = .{ .{ .id = 1, .title = \"Kai\", .selected = true, .detail = \"Ready\", .summary = \"Ready\", .image_id = 0 }, .{ .id = 2, .title = \"Sol\", .detail = \"Working\", .summary = \"Working\", .image_id = 0 } }, code_editor: canvas.TextBuffer(6) = .{}, rating_score: u32 = 3, brand_picture: u32 = 0, gallery_sidebar_choices: [2]Choice = sidebar_sample,");
const msg = findLine("const Msg = union(enum) {").replace("const Msg = union(enum) {", "pub const Msg = union(enum) { agent_tick: u64, agent_set_state: u8, agent_set_kind: u8, agent_reduce_motion: bool, gallery_select: u32, gallery_previous, gallery_next, gallery_list, gallery_appearance, gallery_close_detail,");
const zigString = (value) => JSON.stringify(value);
const lines = [
  'const std = @import("std");',
  'const canvas = @import("native_sdk").canvas;',
  'const agent_vector = @import("yogurt/models/agent-vector.zig");',
  findLine("const Choice = struct {"), findLine("const sample = "), findLine("const sidebar_sample = "),
  ...[30, 31].map((count, index) => `pub const ${index ? 'december_days' : 'november_days'} = [_]Choice{ ${Array.from({ length: count }, (_, i) => `.{ .id = ${i + 1}, .title = \"${i + 1}\" }`).join(', ')} };`), brandModel, msg,
  ...[30, 31].map((count, index) => `pub const ${index ? 'december_labels' : 'november_labels'} = [_][]const u8{ ${Array.from({ length: count }, (_, i) => `\"${index ? 'Dec' : 'Nov'} ${i + 1}, 2026\"`).join(', ')} };`),
  "pub const Ui = canvas.Ui(Msg);",
  `pub const names = [_][]const u8{ ${catalog.map((entry) => zigString(entry.name)).join(", ")} };`,
  `pub const ids = [_][]const u8{ ${catalog.map((entry) => zigString(entry.id)).join(", ")} };`,
  `pub const component_ids = [_][]const u8{ ${components.map((entry) => zigString(entry.id)).join(", ")} };`,
  `pub const block_ids = [_][]const u8{ ${blocks.map((entry) => zigString(entry.id)).join(", ")} };`,
  `pub const families = [_][]const u8{ ${catalog.map((entry) => zigString(entry.family)).join(", ")} };`,
  `pub const descriptions = [_][]const u8{ ${catalog.map((entry) => zigString(entry.description)).join(", ")} };`,
];
for (const [index, entry] of catalog.entries()) {
  if (!/^[a-z0-9-]+$/.test(entry.id)) throw Error(`Invalid catalog ID: ${entry.id}`);
  lines.push(`const sources_${index} = [_]canvas.ui_markup.SourceFile{`);
  for (const name of [...new Set([`${entry.id}-test.native`, `${entry.id}.native`, ...(entry.native ?? []).map((id) => `${id}.native`)])]) {
    const embedded = `yogurt-catalog-test/${name}`;
    if (!existsSync(join(host, "src", embedded))) throw Error(`Missing specimen source: ${embedded}`);
    lines.push(`    .{ .path = ${zigString(name)}, .source = @embedFile(${zigString(embedded)}) },`);
  }
  lines.push("};", `const View_${index} = canvas.CompiledMarkupImports(Model, Msg, ${zigString(entry.id + "-test.native")}, &sources_${index});`);
}
lines.push("pub fn specimen(ui: *Ui, model: *const Model) Ui.Node {", "    return switch (model.gallery_selected) {");
for (const [index] of catalog.entries()) lines.push(`        ${index} => View_${index}.build(ui, model),`);
lines.push("        else => ui.text(.{}, \"Unknown component\"),", "    };", "}", "");
writeFileSync(join(host, "src/gallery-generated.zig"), lines.join("\n"));
console.log(`Prepared ${catalog.length} Native gallery specimens in ${host}.`);
