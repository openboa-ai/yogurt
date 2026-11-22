import { existsSync, linkSync, lstatSync, mkdirSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";

export function installFiles(project, files) {
  const planned = Array.from(files, ([path, source]) => ({ dest: resolve(project, path), source }));
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
  return pending.length;
}
