import { randomUUID } from "node:crypto";
import { closeSync, fsyncSync, linkSync, lstatSync, mkdirSync, openSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export function requirePrivatePath(path, directory) {
  const stat = lstatSync(path);
  if (!(directory ? stat.isDirectory() : stat.isFile()) || stat.uid !== process.getuid() || (stat.mode & 0o077)) {
    throw Error("The reporting host must keep its policy and ledger private to its OS account.");
  }
}

export function issueLedger(root) {
  mkdirSync(root, { recursive: true, mode: 0o700 });
  requirePrivatePath(root, true);

  function put(file, record, first) {
    const temp = join(root, "." + randomUUID());
    const fd = openSync(temp, "wx", 0o600);
    try {
      try {
        writeFileSync(fd, JSON.stringify(record) + "\n");
        fsyncSync(fd);
      } finally {
        closeSync(fd);
      }
      if (first) linkSync(temp, file);
      else renameSync(temp, file);
      const dir = openSync(root, "r");
      try {
        fsyncSync(dir);
      } finally {
        closeSync(dir);
      }
    } finally {
      try { unlinkSync(temp); } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
  }

  function pathFor(identity, attempt) {
    return join(root, `${identity}.${attempt}.json`);
  }

  return {
    inspect(identity) {
      for (let attempt = 1; ; attempt++) {
        const path = pathFor(identity, attempt);
        try {
          requirePrivatePath(path, false);
          const record = JSON.parse(readFileSync(path, "utf8"));
          if (!["pending", "confirmed", "rejected"].includes(record.status)) throw Error("Invalid issue ledger entry.");
          if (record.status !== "rejected") return { ...record, attempt };
        } catch (error) {
          if (error.code !== "ENOENT") throw error;
          return { status: "available", attempt };
        }
      }
    },
    claim(identity, attempt) {
      try {
        put(pathFor(identity, attempt), { status: "pending" }, true);
        return true;
      } catch (error) {
        if (error.code === "EEXIST") return false;
        throw error;
      }
    },
    finish(identity, attempt, record) {
      put(pathFor(identity, attempt), record, false);
    },
  };
}
