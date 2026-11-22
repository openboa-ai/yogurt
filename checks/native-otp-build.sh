#!/usr/bin/env bash
set -euo pipefail
kit="$(cd "$(dirname "$0")/.." && pwd)"
unset NATIVE_SDK_PATH
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
native init consumer --template zig-core
cp "$kit/checks/fixtures/native-otp/main.zig" consumer/src/main.zig
yogurt() { node sdk/bin/yogurt.mjs "$@"; }
yogurt add input-otp --target native --dir consumer
yogurt add input-otp --target native --dir consumer
test ! -e consumer/src/yogurt/items/input-otp.native
test ! -e consumer/src/yogurt/input-otp.zig

cd consumer
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

# Exercise the default project directory with flags immediately after the verb.
node ../sdk/bin/yogurt.mjs native dev -Dautomation=true >"$scratch/dev.log" 2>&1 &
pid=$!
if ! native automate assert --timeout-ms 120000 'gpu_nonblank=true'; then
  cat "$scratch/dev.log"
  exit 1
fi
otp_scenario
kill "$pid"
wait "$pid" || true
pid=
rm -rf .zig-cache/native-sdk-automation

# Release builds must leave the development binary untouched.
mkdir -p zig-out/bin
if [[ ! -f zig-out/bin/consumer ]]; then printf 'Existing development output\n' >zig-out/bin/consumer; fi
cp zig-out/bin/consumer "$scratch/dev-binary"
node ../sdk/bin/yogurt.mjs native package --signing none
managed=(zig-out/yogurt-releases/*/consumer.app/Contents/MacOS/consumer)
test -x "${managed[0]}"
cmp zig-out/bin/consumer "$scratch/dev-binary"

# The SDK-generated app-owned build must receive the same patched framework.
native eject .
cp build.zig.zon "$scratch/original.zon"
node ../sdk/bin/yogurt.mjs native package -Dautomation=true --signing none --output "$scratch/release"
cmp build.zig.zon "$scratch/original.zon"
test -x "$scratch/release/Contents/MacOS/consumer"
cmp zig-out/bin/consumer "$scratch/dev-binary"
"$scratch/release/Contents/MacOS/consumer" >"$scratch/consumer.log" 2>&1 &
pid=$!
otp_scenario
