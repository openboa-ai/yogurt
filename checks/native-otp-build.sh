#!/usr/bin/env bash
set -euo pipefail
kit="$(cd "$(dirname "$0")/.." && pwd)"
framework="${NATIVE_SDK_PATH:?Set NATIVE_SDK_PATH to Native SDK 0.11.1}"
scratch="$(mktemp -d)"
trap 'rm -rf "$scratch"' EXIT
cd "$scratch"
native init consumer --template zig-core --framework "$framework"
cp "$kit/checks/fixtures/native-otp/main.zig" consumer/src/main.zig
node "$kit/bin/yogurt.mjs" add input-otp --target native --dir consumer
node "$kit/bin/yogurt.mjs" native build consumer -Doptimize=Debug
node "$kit/bin/yogurt.mjs" native package consumer --output "$scratch/release"
