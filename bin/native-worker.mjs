import { spawn } from "node:child_process";

// Wait for the owner to record this PID before starting Native. If the
// owner is killed before that handoff, the IPC channel closes without a build.
let child;
process.once("disconnect", () => {
  if (child) child.kill("SIGTERM");
});
process.once("message", () => {
  child = spawn("native", process.argv.slice(2), { stdio: "inherit" });
  for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
    process.on(signal, () => child.kill(signal));
  }
  child.on("error", error => {
    console.error(error.message);
    process.exitCode = 1;
    if (process.connected) process.disconnect();
  });
  child.on("close", code => {
    process.exitCode = code ?? 1;
    if (process.connected) process.disconnect();
  });
});
