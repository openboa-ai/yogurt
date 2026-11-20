#!/usr/bin/env node
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  lstatSync,
  rmSync,
  linkSync,
  unlinkSync,
} from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkProject } from "./check-project.mjs";
import { randomUUID } from "node:crypto";
const kit = fileURLToPath(new URL("../", import.meta.url)),
  args = process.argv.slice(2),
  catalog = JSON.parse(readFileSync(join(kit, "catalog/components.json")));
const blocks = JSON.parse(readFileSync(join(kit, "catalog/blocks.json")));
const usage =
  "yogurt check [--dir project] | yogurt list | yogurt add <component-or-block> --target web|native [--dir project]";
function run() {
  if (args[0] === "check") {
    const at = args.indexOf("--dir");
    console.log(checkProject(resolve(at < 0 ? "." : args[at + 1]), kit));
    return;
  }
  if (args[0] === "list") {
    for (const item of [...catalog, ...blocks])
      console.log(item.id + "  " + item.description);
    return;
  }
  const block = blocks.find((e) => e.id === args[1]);
  const item = block ?? catalog.find((e) => e.id === args[1]);
  if (args[0] !== "add" || !item) throw Error(usage);
  const flag = (name) => {
    const i = args.indexOf(name);
    return i < 0 ? undefined : args[i + 1];
  };
  const target = flag("--target") ?? "web",
    project = resolve(flag("--dir") ?? ".");
  if (!["web", "native"].includes(target)) throw Error(usage);
  const planned = [];
  const add = (dest, source) =>
    planned.push({ dest: resolve(project, dest), source });
  if (target === "web") {
    const entry = JSON.parse(
      readFileSync(join(kit, "registry/" + item.id + ".json")),
    );
    add(
      "src/components/" + (block ? "blocks/" : "ui/") + item.id + ".tsx",
      Buffer.from(entry.files[0].content),
    );
  } else {
    for (const file of [
      "theme.zig",
      "tokens.zig",
      "words.zig",
      "rethink-sans-medium.ttf",
      ...(block ? block.native : [item.id]).map(
        (id) => "items/" + id + ".native",
      ),
    ]) {
      add(
        "src/yogurt/" + file,
        readFileSync(join(kit, "packages/native/controls/" + file)),
      );
    }
    const file = "items/" + item.id + ".native";
    const binding = (path) =>
      '.{ .path = "yogurt/' +
      path +
      '", .source = @embedFile("' +
      path +
      '") }';
    const fileType = '@import("native_sdk").canvas.ui_markup.SourceFile';
    let entry =
      "pub const file = " +
      fileType +
      '{ .path = "yogurt/' +
      file +
      '", .source = @embedFile("' +
      file +
      '") };\n';
    if (block) {
      add(
        "src/yogurt/" + file,
        readFileSync(join(kit, "packages", "recipes", item.id, "view.native")),
      );
      const imports = block.native.map((id) =>
        binding("items/" + id + ".native"),
      );
      entry +=
        "pub const sources = [_]" +
        fileType +
        "{ file, " +
        imports.join(", ") +
        " };\n";
    }
    add("src/yogurt/" + item.id + ".zig", Buffer.from(entry));
    add(
      "src/yogurt/rethink-sans.ttf",
      readFileSync(join(kit, "design/assets/fonts/rethink-sans/rethink-sans.ttf")),
    );
    add(
      "src/yogurt/OFL.txt",
      readFileSync(join(kit, "design/assets/fonts/rethink-sans/OFL.txt")),
    );
  }
  const artEntries = ["project-mark", "agent-avatar", "gaze", "agent-row", "project-workspace", "agent-profile", "agent-sidebar", "project-sidebar"];
  if (target === "native" && [item.id, ...(block?.native ?? [])].some((id) => artEntries.includes(id))) {
    for (const file of [
      "art.zig",
      ...[
        "openboa",
        "sourdough",
        "meatball",
        "yogurt",
        "kai_ready",
        "kai_working",
        "sol_ready",
        "sol_working",
      ].map((n) => "art/" + n + ".png"),
    ]) {
      add(
        "src/yogurt/" + file,
        readFileSync(join(kit, "packages/native/controls/" + file)),
      );
    }
  }
  const motionEntries = ["agent-avatar", "gaze", "agent-row", "agent-workspace", "agent-sidebar"];
  if (target === "native" && [item.id, ...(block?.native ?? [])].some((id) => motionEntries.includes(id))) {
    for (const name of ["agent-vector.zig", "avatar-pose-data.zig", "agent-family-data.zig", "agent-motion.zig", "agent-motion-data.zig", "agent-motion.bin"]) {
      const file = "models/" + name;
      add(
        "src/yogurt/" + file,
        readFileSync(join(kit, "packages/native/controls/" + file)),
      );
    }
  }
  if (
    target === "native" &&
    ["calendar", "date-picker", "keypad"].includes(item.id)
  ) {
    const helper = item.id === "keypad" ? "keypad.zig" : "calendar.zig";
    add(
      "src/yogurt/models/" + helper,
      readFileSync(join(kit, "packages/native/controls/" + helper)),
    );
  }
  if (target === "native" && item.id === "gradient") {
    add(
      "src/yogurt/gradient-pixels.zig",
      readFileSync(join(kit, "packages/native/controls/gradient-pixels.zig")),
    );
  }
  const pending = [];
  for (const entry of planned) {
    if (!existsSync(entry.dest)) {
      pending.push(entry);
      continue;
    }
    if (
      lstatSync(entry.dest).isSymbolicLink() ||
      !readFileSync(entry.dest).equals(entry.source)
    )
      throw Error(
        "Existing edit at " +
          entry.dest +
          ". Keep it and compare the pinned package source.",
      );
  }
  const created = [];
  try {
    for (const entry of pending) {
      mkdirSync(dirname(entry.dest), { recursive: true });
      const temp = entry.dest + "." + randomUUID() + ".tmp";
      writeFileSync(temp, entry.source, { flag: "wx" });
      try {
        linkSync(temp, entry.dest);
        created.push(entry);
      } finally {
        unlinkSync(temp);
      }
    }
  } catch (err) {
    for (const entry of created) {
      if (
        existsSync(entry.dest) &&
        readFileSync(entry.dest).equals(entry.source)
      )
        rmSync(entry.dest);
    }
    throw err;
  }
  console.log(
    (pending.length ? "Added " : "Already installed ") +
      item.name +
      " (" +
      target +
      ").",
  );
  if (target === "native")
    console.log('<import src="yogurt/items/' + item.id + '.native"/>');
}
try {
  run();
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
}
