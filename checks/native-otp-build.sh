#!/usr/bin/env bash
set -euo pipefail
kit="$(cd "$(dirname "$0")/.." && pwd)"
framework="${NATIVE_SDK_PATH:?Set NATIVE_SDK_PATH to Native SDK 0.11.1}"
scratch="$(mktemp -d)"
trap 'rm -rf "$scratch"' EXIT

archive="$(cd "$kit" && npm pack --ignore-scripts --silent --pack-destination "$scratch")"
cd "$scratch"
mkdir sdk
tar -xzf "$archive" -C sdk --strip-components=1
native init consumer --template zig-core --framework "$framework"
cp "$kit/checks/fixtures/native-otp/main.zig" consumer/src/main.zig
yogurt() { node sdk/bin/yogurt.mjs "$@"; }
yogurt add input-otp --target native --dir consumer
yogurt add input-otp --target native --dir consumer
yogurt native build consumer -Doptimize=Debug
yogurt native package consumer --signing none --output "$scratch/release"
test -x "$scratch/release/Contents/MacOS/consumer"
cmp consumer/zig-out/bin/consumer "$scratch/release/Contents/MacOS/consumer"
