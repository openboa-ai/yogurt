#!/usr/bin/env bash
set -euo pipefail
kit="$(cd "$(dirname "$0")/.." && pwd)"
scratch="$(mktemp -d)"
pid=
cleanup() {
  if [[ -n "$pid" ]]; then kill "$pid" 2>/dev/null || true; wait "$pid" || true; fi
  rm -rf "$scratch"
}
trap cleanup EXIT

archive="$(cd "$kit" && npm pack --ignore-scripts --silent --pack-destination "$scratch")"
cd "$scratch"
mkdir sdk
tar -xzf "$archive" -C sdk --strip-components=1
test ! -e sdk/packages/native/controls/sdk-patches
test ! -e sdk/bin/native-build.mjs
fixture="$kit/checks/fixtures/native-otp"
mkdir app-workspace
cp -R "$fixture/package.json" "$fixture/pnpm-workspace.yaml" "$fixture/pnpm-lock.yaml" "$fixture/patches" app-workspace/
npx --yes pnpm@10.24.0 --dir app-workspace install --frozen-lockfile --ignore-scripts
export NATIVE_SDK_PATH="$scratch/app-workspace/node_modules/@native-sdk/cli"
export PATH="$scratch/app-workspace/node_modules/.bin:$PATH"
native init app-workspace/consumer --template zig-core --framework "$NATIVE_SDK_PATH"
cp "$fixture/main.zig" app-workspace/consumer/src/main.zig
# Keep the consumer on its declared Zig package dependency in both build modes.
(cd app-workspace/consumer && native eject .)
yogurt() { node sdk/bin/yogurt.mjs "$@"; }
yogurt add input-otp --target native --dir app-workspace/consumer
yogurt add input-otp --target native --dir app-workspace/consumer
test ! -e app-workspace/consumer/src/yogurt/items/input-otp.native
test ! -e app-workspace/consumer/src/yogurt/input-otp.zig

cd app-workspace/consumer
cp build.zig.zon "$scratch/original.zon"
manifest_hash="$(shasum -a 256 "$NATIVE_SDK_PATH/build.zig" "$NATIVE_SDK_PATH/src/primitives/canvas/widgets.zig" "$NATIVE_SDK_PATH/src/primitives/canvas/widget_render_controls.zig")"
otp_scenario() {
  native automate assert --timeout-ms 120000 'gpu_nonblank=true' 'role=textbox name="Verification code"'
  otp="$(native automate snapshot | sed -nE 's/.*#([0-9]+) role=textbox name="Verification code".*/\1/p')"
  shot() {
    native automate screenshot main-canvas 1
    cp .zig-cache/native-sdk-automation/screenshot-main-canvas.png "$scratch/$1.png"
  }
  shot idle
  native automate widget-click main-canvas "$otp"
  shot click
  native automate widget-key main-canvas Tab
  native automate assert --timeout-ms 5000 'role=button name="After".*focused=true'
  shot blur
  native automate widget-key main-canvas shift+Tab
  native automate widget-key main-canvas shift+Tab
  native automate assert --timeout-ms 5000 'role=button name="Before".*focused=true'
  native automate widget-key main-canvas Tab
  native automate assert --timeout-ms 5000 'role=textbox name="Verification code".*focused=true'
  shot tab
  swift "$kit/checks/fixtures/native-otp/focus-pixels.swift" "$scratch"
}

native dev . -Dautomation=true >"$scratch/dev.log" 2>&1 &
pid=$!
if ! native automate assert --timeout-ms 120000 'gpu_nonblank=true'; then
  cat "$scratch/dev.log"
  exit 1
fi
otp_scenario
cmp build.zig.zon "$scratch/original.zon"
kill "$pid"
wait "$pid" || true
pid=
rm -rf .zig-cache/native-sdk-automation

native build . -Dautomation=true
native package --target macos --binary zig-out/bin/consumer --signing none --output "$scratch/release"
test -x "$scratch/release/Contents/MacOS/consumer"
cmp zig-out/bin/consumer "$scratch/release/Contents/MacOS/consumer"
"$scratch/release/Contents/MacOS/consumer" >"$scratch/consumer.log" 2>&1 &
pid=$!
otp_scenario
cmp build.zig.zon "$scratch/original.zon"
test "$manifest_hash" = "$(shasum -a 256 "$NATIVE_SDK_PATH/build.zig" "$NATIVE_SDK_PATH/src/primitives/canvas/widgets.zig" "$NATIVE_SDK_PATH/src/primitives/canvas/widget_render_controls.zig")"
