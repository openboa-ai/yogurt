import { readFileSync } from "node:fs";
import { join } from "node:path";

const artConsumers = ["project-mark", "agent-avatar", "gaze", "agent-row", "project-workspace", "agent-profile", "agent-sidebar", "project-sidebar"];
const agentConsumers = ["agent-avatar", "gaze", "agent-row", "agent-workspace", "agent-sidebar"];
const surfaceConsumers = ["dialog", "drawer", "sheet", "progress", "toast", "popover", "action-menu"];
const fileType = '@import("native_sdk").canvas.ui_markup.SourceFile';

export function nativeEntry(item) {
  if (!item.nativeView) return { entry: item.native ? `packages/recipes/${item.id}/view.native` : `packages/native/controls/items/${item.id}.native` };
  const { module, symbol } = item.nativeView;
  if (!/^(?:[a-z][a-z0-9-]*\/)*[a-z][a-z0-9-]*\.zig$/.test(module) || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(symbol)) {
    throw Error(`Invalid Native entry for ${item.id}.`);
  }
  return {
    entry: `packages/native/controls/${module}`,
    symbol,
    importStatement: `const ${symbol} = @import("yogurt/${module}").${symbol};`,
  };
}

function markupBinding(id) {
  const file = "items/" + id + ".native";
  return `{ .path = "yogurt/${file}", .source = @embedFile("${file}") }`;
}

function zigEntry(item) {
  let entry = `pub const file = ${fileType}${markupBinding(item.id)};\n`;
  if (item.native) {
    const sources = item.native.map(id => "." + markupBinding(id));
    entry += `pub const sources = [_]${fileType}{ file, ${sources.join(", ")} };\n`;
  }
  return Buffer.from(entry);
}

export function nativeFiles(kit, selected, catalog) {
  const files = new Map();
  const controls = join(kit, "packages/native/controls");
  const byId = new Map(catalog.map(item => [item.id, item]));
  const componentIds = new Set(selected.flatMap(item => item.native ?? [item.id]));
  const ids = new Set([...componentIds, ...selected.map(item => item.id)]);
  const uses = group => group.some(id => ids.has(id));
  const copy = (dest, source = join(controls, dest)) => {
    const path = "src/yogurt/" + dest;
    if (!files.has(path)) files.set(path, readFileSync(source));
  };

  for (const path of ["theme.zig", "tokens.zig", "words.zig", "rethink-sans.ttf", "rethink-sans-medium.ttf"]) copy(path);
  copy("OFL.txt", join(kit, "design/assets/fonts/rethink-sans/OFL.txt"));
  for (const id of componentIds) {
    const component = byId.get(id);
    if (!component) throw Error(`Unknown Native component ${id}.`);
    if (component.nativeMarkup !== false) copy("items/" + id + ".native");
    if (component.nativeView) copy(component.nativeView.module, join(kit, nativeEntry(component).entry));
  }
  for (const item of selected) {
    if (item.native) copy("items/" + item.id + ".native", join(kit, "packages/recipes", item.id, "view.native"));
    if (item.nativeMarkup !== false) files.set("src/yogurt/" + item.id + ".zig", zigEntry(item));
  }
  if (uses(artConsumers)) {
    copy("art.zig");
    for (const name of ["openboa", "sourdough", "meatball", "yogurt", "kai_ready", "kai_working", "sol_ready", "sol_working"]) {
      copy("art/" + name + ".png");
    }
  }
  if (uses(agentConsumers)) {
    for (const name of ["agent-vector.zig", "avatar-pose-data.zig", "agent-family-data.zig", "agent-motion.zig", "agent-motion-data.zig", "agent-motion.bin"]) {
      copy("models/" + name);
    }
  }
  if (uses(["calendar", "date-picker"])) copy("models/calendar.zig", join(controls, "calendar.zig"));
  if (ids.has("keypad")) copy("models/keypad.zig", join(controls, "keypad.zig"));
  if (uses(surfaceConsumers)) copy("interface-motion.zig");
  if (ids.has("gradient")) copy("gradient-pixels.zig");
  return files;
}
