import { spawn } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const checks = [
  "checks/web-library.cjs",
  "checks/web-button-sizes.cjs",
  "checks/web-action-layer-calibration.cjs",
  "checks/web-field-sizes.cjs",
  "checks/web-field-aria.cjs",
  "checks/web-form-feedback-motion.cjs",
  "checks/web-mention-caret.cjs",
  "checks/web-composer-mentions.cjs",
  "checks/web-combobox-form.cjs",
  "checks/web-card-density.cjs",
  "checks/web-profile-disclosure.cjs",
  "checks/web-slider-foundation.cjs",
  "checks/web-checkbox-foundation.cjs",
  "checks/web-list-foundation.cjs",
  "checks/web-collection-long-content.cjs",
  "checks/web-avatar-foundation.cjs",
  "checks/web-pagination-motion.cjs",
  "checks/web-calendar-foundation.cjs",
  "checks/web-tooltip-motion.cjs",
  "checks/web-anchored-layers.cjs",
  "checks/web-composer-foundation.cjs",
  "checks/web-spring-input-foundation.cjs",
  "checks/web-toast-stack-motion.cjs",
  "checks/web-toast-swipe.cjs",
  "checks/web-toast-exit.cjs",
  "checks/web-top-spacing.cjs",
  "checks/web-disclosure-motion.cjs",
  "checks/web-restored-motion.cjs",
  "checks/web-sidebar-motion-feedback.cjs",
  "checks/web-sidebar-hide-motion.cjs",
  "checks/web-chart-foundation.cjs",
  "checks/web-agent-controls-layout.cjs",
  "checks/web-conversation-media-layout.cjs",
  "checks/web-ghost-textarea.cjs",
  "checks/web-records-layout.cjs",
  "checks/web-disclosure-toolbar.cjs",
  "checks/web-guide-composition.cjs",
  "checks/web-navigation-feedback-layout.cjs",
  "checks/web-navigation-long-content.cjs",
  "checks/web-navigation-direction-motion.cjs",
  "checks/web-data-long-content.cjs",
  "checks/web-segmented.cjs",
  "checks/web-select.cjs",
  "checks/web-select-picker-motion.cjs",
  "checks/web-workspaces.cjs",
  "checks/web-sidebars.cjs",
  "checks/web-motion.cjs",
  "checks/web-motion-comparison.cjs",
  "checks/web-motion-patterns.cjs",
  "checks/web-action-menu.cjs",
  "checks/web-otp-motion.cjs",
  "checks/web-slide-confirm-direction.cjs",
  "checks/web-copy-action.cjs",
  "checks/web-motion-gallery-interactions.cjs",
  "checks/web-workflows.cjs",
  "checks/web-0-2-gates.cjs",
  "checks/web-studio-workspace.cjs",
  "checks/web-phase1-core.cjs",
  "checks/web-phase23-verify.cjs",
  "checks/web-surface-rubric-gates.cjs",
];

const filters = process.argv.slice(2);
const selected = filters.length
  ? checks.filter((file) => filters.some((f) => file.includes(f)))
  : checks;

if (selected.length === 0) {
  console.error(`No web checks matched filters: ${filters.join(", ")}`);
  process.exit(1);
}

const defaultConcurrency = Math.max(2, Math.min(4, os.cpus().length));
const concurrency = Math.max(
  1,
  Number.parseInt(process.env.YOGURT_CHECK_CONCURRENCY ?? "", 10) || defaultConcurrency,
);

const startedAt = Date.now();
let nextIndex = 0;
let passed = 0;
const failures = [];

function runOne(file) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [file], {
      cwd: rootDir,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });
    let output = "";
    child.stdout.on("data", (chunk) => {
      output += chunk;
    });
    child.stderr.on("data", (chunk) => {
      output += chunk;
    });
    child.on("close", (code) => {
      resolve({ file, code: code ?? 1, output });
    });
  });
}

async function worker() {
  while (nextIndex < selected.length) {
    const file = selected[nextIndex++];
    const result = await runOne(file);
    if (result.code === 0) {
      passed++;
    } else {
      failures.push(result);
      console.error(`FAIL ${file} (exit ${result.code})\n${result.output.trim()}`);
    }
  }
}

await Promise.all(
  Array.from({ length: Math.min(concurrency, selected.length) }, () => worker()),
);

const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);
if (failures.length > 0) {
  console.error(
    `${passed}/${selected.length} web checks passed, ${failures.length} failed in ${seconds}s (concurrency=${concurrency}).`,
  );
  process.exit(1);
}
console.log(
  `${passed}/${selected.length} web checks passed in ${seconds}s (concurrency=${concurrency}).`,
);
