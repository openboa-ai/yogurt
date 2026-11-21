#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 3 ]; then
  echo "Usage: bash checks/native-gallery-journey.sh <native-cli> <built-guide-host-dir> <output-dir>" >&2
  exit 2
fi
cli="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
fixture="$(cd "$2" && pwd)"
mkdir -p "$3"
output="$(cd "$3" && pwd)"
workspace="$(cd "$(dirname "$0")/.." && pwd)"
automation="$fixture/.zig-cache/native-sdk-automation"
test -x "$cli"
test -x "$fixture/zig-out/bin/yogurt-native-guide"
test "$(cat "$fixture/.yogurt-guide-host")" = yogurt-native-guide
test ! -e "$automation/snapshot.txt"
test ! -e "$output/results.tsv"

# Compare the installed host inventory with this checkout before traversing it.
node - "$workspace/catalog/components.json" "$workspace/catalog/blocks.json" "$fixture/src/gallery-generated.zig" "$output/inventory.tsv" <<'NODE'
const fs = require('node:fs');
const [componentsPath, blocksPath, generatedPath, output] = process.argv.slice(2);
const components = JSON.parse(fs.readFileSync(componentsPath, 'utf8'));
const blocks = JSON.parse(fs.readFileSync(blocksPath, 'utf8'));
const catalog = [...components, ...blocks];
const generated = fs.readFileSync(generatedPath, 'utf8');
function values(key) {
  const match = generated.match(new RegExp(`pub const ${key} = \\[_\\]\\[\\]const u8\\{ ([^\\n]*) \\};`));
  if (!match) throw Error(`Missing generated ${key}`);
  return JSON.parse(`[${match[1]}]`);
}
const ids = values('ids'), names = values('names');
if (components.length !== 125 || blocks.length !== 14 ||
    new Set(catalog.map(item => item.id)).size !== catalog.length ||
    ids.length !== catalog.length || names.length !== catalog.length ||
    catalog.some((item, i) => typeof item.id !== 'string' || typeof item.name !== 'string' ||
      item.id !== ids[i] || item.name !== names[i] || /[\t\r\n"]/.test(item.id + item.name))) {
  throw Error('Fixture and checkout inventories do not match exactly.');
}
fs.writeFileSync(output, catalog.map(item => `${item.id}\t${item.name}`).join('\n') + '\n', { flag: 'wx' });
NODE
total="$(wc -l < "$output/inventory.tsv" | tr -d '[:space:]')"

cd "$fixture"
./zig-out/bin/yogurt-native-guide >"$output/native-guide.log" 2>&1 &
pid=$!
trap 'kill "$pid" 2>/dev/null || true; wait "$pid" 2>/dev/null || true' EXIT
printf 'index\tid\tname\trender\tinteraction\n' > "$output/results.tsv"

click_named() {
  local role="$1" name="$2" snapshot="$3" id
  id="$(sed -nE "s/^.*widget @w1\/main-canvas#([0-9]+) role=${role} name=\"${name}\".*$/\1/p" "$snapshot" | head -n 1)"
  test -n "$id"
  "$cli" automate widget-click main-canvas "$id"
}

action_named() {
  local role="$1" name="$2" action="$3" value="$4" snapshot="$5" id
  id="$(sed -nE "s/^.*widget @w1\/main-canvas#([0-9]+) role=${role} name=\"${name}\".*$/\1/p" "$snapshot" | tail -n 1)"
  test -n "$id"
  if [ -n "$value" ]; then
    "$cli" automate widget-action main-canvas "$id" "$action" "$value"
  else
    "$cli" automate widget-action main-canvas "$id" "$action"
  fi
}

click_last_named() {
  local role="$1" name="$2" snapshot="$3" id
  id="$(sed -nE "s/^.*widget @w1\/main-canvas#([0-9]+) role=${role} name=\"${name}\".*$/\1/p" "$snapshot" | tail -n 1)"
  test -n "$id"
  "$cli" automate widget-click main-canvas "$id"
}

snapshot_after() {
  "$cli" automate assert --timeout-ms 5000 "$1" >/dev/null 2>&1 &&
    "$cli" automate snapshot > "$output/$prefix-interaction.txt"
}

check_interaction() {
  local before="$output/$prefix.txt" after="$output/$prefix-interaction.txt"
  case "$id" in
    project-mark)
      # Accessible image nodes and missing-resource indicators do not prove pixel rendering.
      rg -q 'role=image name="Yogurt"' "$before" &&
        rg -q 'role=image name="Sourdough"' "$before" &&
        rg -q 'role=image name="Meatball"' "$before" &&
        ! rg -q 'role=text name="Unavailable"' "$before" &&
        cp "$before" "$after" || return 1
      ;;
    project-sidebar)
      rg -q 'role=image name="Project mark"' "$before" &&
        rg -q 'role=listitem name="Overview".*state=\[[^]]*selected' "$before" &&
        rg -q 'role=listitem name="Reviews"' "$before" &&
        click_named listitem Reviews "$before" && snapshot_after 'Reviews selected' &&
        rg -q 'role=listitem name="Reviews".*state=\[[^]]*selected' "$after" &&
        click_named listitem 'Project views' "$after" && snapshot_after 'Project views collapsed' &&
        ! rg -q 'role=listitem name="Reviews"' "$after" || return 1
      ;;
    text-field|textarea|input-group|search-field)
      local label='View name'
      [ "$id" != textarea ] || label=Notes
      [ "$id" != search-field ] || label='Search records'
      action_named textbox "$label" set_text 'Yogurt test' "$before" &&
        snapshot_after 'text changed' &&
        rg -q "role=textbox name=\"$label\".*text=\"Yogurt test\"" "$after" || return 1
      if [ "$id" = search-field ]; then
        click_named button 'Clear search' "$after" && snapshot_after 'text cleared' &&
          rg -q "role=textbox name=\"$label\"" "$after" &&
          ! rg "role=textbox name=\"$label\"" "$after" | rg -q ' text="[^"]' || return 1
      fi
      ;;
    split-text-field)
      action_named textbox Team set_text '123' "$before" && snapshot_after 'text changed' &&
        rg -q 'role=textbox name="Team".*text="123"' "$after" &&
        rg -q 'role=textbox name="Record".*text="0182"' "$after" &&
        action_named textbox Record set_text '456' "$after" && snapshot_after 'text changed' &&
        rg -q 'role=textbox name="Team".*text="123"' "$after" &&
        rg -q 'role=textbox name="Record".*text="456"' "$after" || return 1
      ;;
    checkbox|toggle|switch)
      local role=button label='Show details'
      if [ "$id" = checkbox ]; then role=checkbox; label='Include archived views'; fi
      if [ "$id" = switch ]; then role=switch; label='Show dates'; fi
      rg -q "role=$role name=\"$label\".*value=1" "$before" &&
        click_named "$role" "$label" "$before" && snapshot_after 'setting changed' &&
        rg -q "role=$role name=\"$label\".*value=0" "$after" || return 1
      ;;
    accordion|disclosure-row)
      local label='About this view' detail='This view includes notes saved in the last seven days.'
      if [ "$id" = disclosure-row ]; then label='View details'; detail='Three records are ready to review.'; fi
      rg -Fq "role=text name=\"$detail\"" "$before" &&
        action_named group "$label" toggle '' "$before" && snapshot_after 'setting changed' &&
        ! rg -Fq "role=text name=\"$detail\"" "$after" || return 1
      ;;
    sidebar)
      rg -q 'role=listitem name="Yogurt"' "$before" &&
        click_named button 'Weekly review' "$before" && snapshot_after 'setting changed' &&
        ! rg -q 'role=listitem name="Yogurt"' "$after" || return 1
      ;;
    tooltip)
      ! rg -q 'role=tooltip name="Add a saved view"|Action received locally; no external effect|This action is not implemented in this guide' "$before" &&
        action_named button 'Change appearance' focus '' "$before" &&
        "$cli" automate widget-key main-canvas tab &&
        "$cli" automate widget-key main-canvas tab &&
        "$cli" automate assert --timeout-ms 5000 'role=tooltip name="Add a saved view"' >/dev/null 2>&1 &&
        "$cli" automate snapshot > "$output/$prefix-tooltip-open.txt" &&
        rg -q 'role=button name="Review details".*focused=true' "$output/$prefix-tooltip-open.txt" &&
        ! rg -q 'Action received locally; no external effect|This action is not implemented in this guide' "$output/$prefix-tooltip-open.txt" &&
        "$cli" automate screenshot main-canvas >/dev/null &&
        cp "$automation/screenshot-main-canvas.png" "$output/$prefix-tooltip-open.png" &&
        "$cli" automate widget-key main-canvas escape &&
        "$cli" automate snapshot > "$after" &&
        ! rg -q 'role=tooltip name="Add a saved view"|Action received locally; no external effect|This action is not implemented in this guide' "$after" &&
        rg -q 'role=button name="Review details".*focused=true' "$after" || return 1
      ;;
    hover-card)
      rg -Fq 'role=text name="Three records are ready to review."' "$before" &&
        click_named button 'Weekly review' "$before" && snapshot_after 'setting changed' &&
        ! rg -Fq 'role=text name="Three records are ready to review."' "$after" || return 1
      ;;
    slider)
      rg -q 'role=slider name="Review progress".*value=0\.3([[:space:]]|$)' "$before" &&
        action_named slider 'Review progress' increment '' "$before" && snapshot_after 'value changed' &&
        rg -q 'role=slider name="Review progress".*value=' "$after" &&
        ! rg -q 'role=slider name="Review progress".*value=0\.3([[:space:]]|$)' "$after" || return 1
      ;;
    calendar)
      rg -q 'role=text name="November 2026"' "$before" &&
        click_named button Next "$before" && snapshot_after 'Sample page changed' &&
        rg -q 'role=text name="December 2026"' "$after" &&
        rg -q 'role=button name="31"' "$after" &&
        click_named button Previous "$after" && snapshot_after 'Sample page changed' &&
        rg -q 'role=text name="November 2026"' "$after" &&
        ! rg -q 'role=button name="31"' "$after" || return 1
      ;;
    numeric-spinner)
      rg -q 'role=text name="0"' "$before" &&
        click_named button Increase "$before" && snapshot_after 'quantity changed' &&
        rg -q 'role=text name="1"' "$after" &&
        click_named button Increase "$after" && snapshot_after 'quantity changed' &&
        rg -q 'role=text name="2"' "$after" &&
        rg -q 'role=button name="Increase".*enabled=false' "$after" &&
        click_named button Decrease "$after" && snapshot_after 'quantity changed' &&
        rg -q 'role=text name="1"' "$after" || return 1
      ;;
    pagination|carousel)
      local next=Next previous=Previous
      if [ "$id" = carousel ]; then next='Next slide'; previous='Previous slide'; fi
      rg -q 'role=text name="1 of 2"' "$before" &&
        click_named button "$next" "$before" && snapshot_after 'Sample page changed' &&
        rg -q 'role=text name="2 of 2"' "$after" &&
        rg -q "role=button name=\"$next\".*enabled=false" "$after" || return 1
      if [ "$id" = carousel ]; then rg -q 'role=text name="Second sample"' "$after" || return 1; fi
      click_named button "$previous" "$after" && snapshot_after 'Sample page changed' &&
        rg -q 'role=text name="1 of 2"' "$after" || return 1
      ;;
    icon-button|list-row)
      local role=button label='Add a view'
      if [ "$id" = list-row ]; then role=listitem; label='Weekly review'; fi
      click_named "$role" "$label" "$before" &&
        snapshot_after 'Action received locally; no external effect' || return 1
      ;;
    *) return 1 ;;
  esac
  ! rg -Fq 'This action is not implemented in this guide' "$after"
}

scroll_preview() {
  local snapshot="$1" delta="$2" id
  id="$(sed -nE 's/^.*widget @w1\/main-canvas#([0-9]+) role=group name="Component preview".*$/\1/p' "$snapshot" | head -n 1)"
  test -n "$id"
  "$cli" automate widget-wheel main-canvas "$id" "$delta"
}

"$cli" automate assert --timeout-ms 5000 'ready=true' 'gpu_nonblank=true'
"$cli" automate snapshot > "$output/list.txt"
click_named button 'Hide list' "$output/list.txt"
button_index="$(awk -F '\t' '$1 == "button" { print NR - 1; found = 1; exit } END { if (!found) exit 1 }' "$output/inventory.tsv")"
for ((step = 0; step < button_index; step++)); do
  "$cli" automate snapshot > "$output/current.txt"
  scroll_preview "$output/current.txt" 2000
  "$cli" automate snapshot > "$output/current.txt"
  click_named button Previous "$output/current.txt"
done
index=0
failed=0
incomplete=0
while IFS=$'\t' read -r id name; do
  index=$((index + 1))
  prefix="$(printf '%03d' "$index")-$id"
  render=FAILED
  interaction=NOT_TESTED
  "$cli" automate snapshot > "$output/current.txt"
  scroll_preview "$output/current.txt" -2000
  if "$cli" automate assert --timeout-ms 5000 'ready=true' 'gpu_nonblank=true' "role=text name=\"$name\"" >/dev/null 2>&1 &&
     "$cli" automate snapshot > "$output/$prefix.txt" &&
     "$cli" automate screenshot main-canvas >/dev/null &&
     cp "$automation/screenshot-main-canvas.png" "$output/$prefix.png"; then
    # This proves the named page was presented, not that its specimen is usable.
    render=PRESENTED_UNVERIFIED
  else
    printf '%s\t%s\t%s\tFAILED\tNOT_TESTED\n' "$index" "$id" "$name" >> "$output/results.tsv"
    echo "Expected page $name was not presented; traversal stopped to prevent misattribution." >&2
    exit 1
  fi
  case "$id" in
    agent-avatar|gaze)
      interaction=UNSUPPORTED_FIXTURE
      ;;
    button)
      role=button
      expected='Action received locally; no external effect'
      if [ "$render" = PRESENTED_UNVERIFIED ] &&
         click_named "$role" 'Save view' "$output/$prefix.txt" &&
         "$cli" automate assert --timeout-ms 5000 "$expected" >/dev/null 2>&1; then
        interaction=PASS
        "$cli" automate snapshot > "$output/$prefix-interaction.txt"
        if rg -Fq 'This action is not implemented in this guide' "$output/$prefix-interaction.txt"; then
          interaction=UNSUPPORTED_FIXTURE
        fi
      else
        interaction=FAILED
        failed=1
      fi
      ;;
    project-mark|project-sidebar|switch|text-field|textarea|input-group|search-field|split-text-field|checkbox|toggle|accordion|disclosure-row|sidebar|tooltip|hover-card|slider|calendar|numeric-spinner|pagination|carousel|icon-button|list-row)
      if [ "$render" = PRESENTED_UNVERIFIED ] && check_interaction; then
        interaction=PASS
        if [ "$id" = calendar ] || [ "$id" = project-mark ]; then interaction=PARTIAL; fi
      else
        interaction=FAILED
        failed=1
      fi
      ;;
  esac
  if [ "$interaction" = PASS ] || [ "$interaction" = PARTIAL ]; then
    if "$cli" automate screenshot main-canvas >/dev/null &&
       cp "$automation/screenshot-main-canvas.png" "$output/$prefix-interaction.png"; then
      :
    else
      interaction=FAILED
      failed=1
    fi
  fi
  if [ "$interaction" = NOT_TESTED ] || [ "$interaction" = UNSUPPORTED_FIXTURE ] || [ "$interaction" = PARTIAL ]; then incomplete=1; fi
  printf '%s\t%s\t%s\t%s\t%s\n' "$index" "$id" "$name" "$render" "$interaction" >> "$output/results.tsv"
  if [ "$index" -lt "$total" ]; then
    "$cli" automate snapshot > "$output/current.txt"
    scroll_preview "$output/current.txt" 2000
    "$cli" automate snapshot > "$output/current.txt"
    if ! click_last_named button Next "$output/current.txt"; then
      echo "Could not advance after $id; remaining pages were not observed." >&2
      exit 1
    fi
  fi
done < "$output/inventory.tsv"
rm -f "$output/current.txt"
[ "$index" -eq "$total" ] || exit 1
if [ "$failed" -ne 0 ]; then
  echo "One or more rendering or interaction checks failed; see results.tsv." >&2
  exit 1
fi
if [ "$incomplete" -ne 0 ]; then
  echo "Traversal finished with untested or unsupported interactions; see results.tsv." >&2
  exit 2
fi
echo "Traversal finished; PRESENTED_UNVERIFIED is not a visual quality assessment."
