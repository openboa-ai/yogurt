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
fixture="$kit/checks/fixtures/native-sdk-consumer"
mkdir app-workspace
export YOGURT_KIT="$scratch/sdk"
# Execute the setup in the shipped guide from an empty consumer workspace.
awk '
  /^<!-- native-otp-setup -->$/ { setup = 1; next }
  setup && /^```sh$/ { code = 1; next }
  code && /^```$/ { exit }
  code { print }
' "$YOGURT_KIT/packages/native/README.md" >"$scratch/setup.sh"
test -s "$scratch/setup.sh"
cd app-workspace
source "$scratch/setup.sh"
for file in package.json pnpm-workspace.yaml pnpm-lock.yaml patches/native-sdk-cli-0.11.1.patch; do
  cmp "../$file" "$fixture/$file"
done
cp "$fixture/main.zig" src/main.zig
for component in rating dialog; do
  node "$YOGURT_KIT/bin/yogurt.mjs" add "$component" --target native
done
test ! -e src/yogurt/items/input-otp.native
test ! -e src/yogurt/input-otp.zig

cp build.zig.zon "$scratch/original.zon"
manifest_hash="$(shasum -a 256 "$NATIVE_SDK_PATH/build.zig" "$NATIVE_SDK_PATH/src/primitives/canvas/widgets.zig" "$NATIVE_SDK_PATH/src/primitives/canvas/widget_render_controls.zig")"
otp_scenario() {
  local otp
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
  swift "$kit/checks/fixtures/native-sdk-consumer/focus-pixels.swift" "$scratch"
}

click_widget() {
  local id
  id="$(native automate snapshot | sed -nE "s/.*#([0-9]+) role=$1 name=\"$2\" .*/\1/p")"
  if [[ ! "$id" =~ ^[0-9]+$ ]]; then
    printf 'Expected one %s named "%s"\n' "$1" "$2" >&2
    return 1
  fi
  native automate widget-click main-canvas "$id"
}

rating_scenario() {
  native automate assert --timeout-ms 5000 'name="Rating not saved"' 'name="No rating selected"'
  click_widget radio '3 of 5'
  native automate assert --timeout-ms 5000 'name="Rating: 3 of 5"' 'role=radio name="3 of 5".*value=1'
  click_widget button 'Review rating'
  native automate assert --timeout-ms 5000 'role=dialog name="Save rating[?]"'
  click_widget button Close
  native automate assert --timeout-ms 5000 --absent 'role=dialog name="Save rating[?]"'
  native automate assert --timeout-ms 5000 'name="Rating not saved"' 'name="Rating: 3 of 5"'
  click_widget radio '4 of 5'
  native automate assert --timeout-ms 5000 'name="Rating: 4 of 5"' 'role=radio name="4 of 5".*value=1' 'role=radio name="3 of 5".*value=0'
  click_widget button 'Review rating'
  native automate assert --timeout-ms 5000 'role=dialog name="Save rating[?]"'
  click_widget button 'Save rating'
  native automate assert --timeout-ms 5000 --absent 'role=dialog name="Save rating[?]"' 'name="Rating not saved"'
  native automate assert --timeout-ms 5000 'name="Rating saved once"' 'name="Rating: 4 of 5"'
}

native dev . -Dautomation=true >"$scratch/dev.log" 2>&1 &
pid=$!
if ! native automate assert --timeout-ms 120000 'gpu_nonblank=true'; then
  cat "$scratch/dev.log"
  exit 1
fi
otp_scenario
rating_scenario
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
rating_scenario
cmp build.zig.zon "$scratch/original.zon"
test "$manifest_hash" = "$(shasum -a 256 "$NATIVE_SDK_PATH/build.zig" "$NATIVE_SDK_PATH/src/primitives/canvas/widgets.zig" "$NATIVE_SDK_PATH/src/primitives/canvas/widget_render_controls.zig")"
