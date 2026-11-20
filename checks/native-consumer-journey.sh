#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 3 ] || [ "$#" -gt 4 ]; then
  echo "Usage: bash checks/native-consumer-journey.sh <native-cli> <built-fixture-dir> <output-dir> [decision|record]" >&2
  exit 2
fi
scene="${4:-decision}"
case "$scene" in
  decision|record) ;;
  *) echo "Unknown Native fixture: $scene" >&2; exit 2 ;;
esac

cli="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
mkdir -p "$3"
captures="$(cd "$3" && pwd)"
cd "$2"
automation=.zig-cache/native-sdk-automation
test ! -e "$automation/snapshot.txt"
./zig-out/bin/yogurt-"$scene"-fixture >"$captures/native-$scene.log" 2>&1 &
pid=$!
trap 'kill "$pid" 2>/dev/null || true; wait "$pid" 2>/dev/null || true' EXIT

assert_visible() {
  "$cli" automate assert --timeout-ms 5000 "$@"
}

click() {
  local id
  id="$("$cli" automate snapshot | sed -nE "s/^.*widget @w1\/main-canvas#([0-9]+) role=button name=\"$1\".*$/\1/p" | tail -n 1)"
  test -n "$id"
  "$cli" automate widget-click main-canvas "$id"
}

capture() {
  "$cli" automate snapshot >"$captures/$1.txt"
  "$cli" automate screenshot main-canvas
  cp "$automation/screenshot-main-canvas.png" "$captures/$1.png"
}

assert_visible 'ready=true' 'gpu_nonblank=true'
if [ "$scene" = "record" ]; then
  assert_visible 'name="Room 4 readings"' 'Monitoring log · 13:00 UTC'
  assert_visible --absent 'name="10:00"' 'name="No reading"'
  click 'View readings'
  assert_visible 'name="09:00"' 'name="0"' 'name="10:00"' 'name="No reading"' 'name="11:00"' 'name="0.16"'
  capture expanded
  click 'Withdraw fixture access'
  assert_visible 'name="Record unavailable"'
  assert_visible --absent 'Room 4 readings' 'Monitoring log' 'name="0"' 'name="No reading"' 'name="0.16"' 'name="View readings"'
  capture revoked
  echo "Native partial record and access withdrawal passed."
  exit 0
fi

click 'Review Brief A'
assert_visible 'name="Brief A"' 'name="Revision 7"'
click 'Return for revision'
assert_visible 'role=button name="Cancel"'
click 'Cancel'
assert_visible --absent 'role=button name="Cancel"'
assert_visible 'name="Recorded commands: 0"' 'Review progress · 1 of 2'

click 'Back to briefs'
click 'Review Brief B'
assert_visible 'name="Brief B"' 'name="Revision 9"'
click 'Return for revision'
assert_visible 'role=button name="Cancel"'
capture confirmation
click 'Return for revision'
assert_visible 'name="Confirmation unavailable"' 'name="R-14"' 'name="Recorded commands: 1"'
assert_visible --absent 'name="Confirmed"'

click 'Back to briefs'
click 'Review Brief A'
assert_visible --absent 'name="R-14"'
click 'Back to briefs'
click 'Review Brief B'
assert_visible 'name="Confirmation unavailable"' 'name="R-14"'
click 'Check original request'
assert_visible 'name="Confirmation unavailable"' 'Review progress · 1 of 2'
capture unknown
click 'Check original request'
assert_visible 'name="Confirmed"' 'name="R-14"' 'name="Revision 10"' 'Review progress · 2 of 2' 'name="Recorded commands: 1"'
capture confirmed
echo "Native decision and receipt recovery passed."
