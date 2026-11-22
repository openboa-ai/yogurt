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
  if [ -n "$value" ] || [ "$action" = set_text ]; then
    "$cli" automate widget-action main-canvas "$id" "$action" "$value"
  else
    "$cli" automate widget-action main-canvas "$id" "$action"
  fi
}

snapshot_after() {
  "$cli" automate assert --timeout-ms 5000 "$1" >/dev/null 2>&1 &&
    "$cli" automate snapshot > "$output/$prefix-interaction.txt"
}

check_interaction() {
  local before="$output/$prefix.txt" after="$output/$prefix-interaction.txt"
  case "$id" in
    dialog|drawer|sheet)
      click_named button 'Edit view' "$before" &&
        snapshot_after 'role=dialog name="Edit view"' &&
        "$cli" automate screenshot main-canvas >/dev/null &&
        cp "$automation/screenshot-main-canvas.png" "$output/$prefix-open.png" &&
        cp "$after" "$output/$prefix-open.txt" &&
        action_named textbox 'View name' set_text 'Team review' "$after" &&
        snapshot_after 'text="Team review"' &&
        click_named button Done "$after" &&
        "$cli" automate assert --timeout-ms 5000 --absent 'role=dialog name="Edit view"' &&
        snapshot_after 'View updated[.]' || return 1
      if [ "$id" = drawer ]; then
        click_named button 'Edit view' "$after" &&
          snapshot_after 'role=group name="Drawer handle".*actions=\[drag\]' || return 1
        local handle_id
        handle_id="$(sed -nE 's/^.*widget @w1\/main-canvas#([0-9]+) role=group name="Drawer handle".*$/\1/p' "$after")"
        # Automation targets the settled accessibility frame while pointer
        # hit testing follows the drawer's actual translated handle.
        sleep 0.3
        "$cli" automate widget-drag main-canvas "$handle_id" 0.5 0.5 0.5 1.25 &&
          snapshot_after 'role=dialog name="Edit view"' &&
          sleep 0.26 &&
          "$cli" automate widget-drag main-canvas "$handle_id" 0.5 0.5 0.5 3.5 &&
          "$cli" automate assert --timeout-ms 5000 --absent 'role=dialog name="Edit view"' &&
          snapshot_after 'role=text name="Closed"' || return 1
      fi
      ;;
    card)
      click_named button 'Pin view' "$before" &&
        snapshot_after 'role=button name="Unpin view"' &&
        click_named button 'Unpin view' "$after" &&
        snapshot_after 'role=button name="Pin view"' || return 1
      ;;
    segmented-control)
      rg -q 'name="Sourdough".*state=\[[^]]*selected' "$before" &&
        click_named tab Meatball "$before" &&
        snapshot_after 'name="Meatball".*state=\[[^]]*selected' &&
        click_named tab Yogurt "$after" &&
        snapshot_after 'name="Yogurt".*state=\[[^]]*selected' || return 1
      ;;
    tabs)
      click_named tab Activity "$before" &&
        snapshot_after 'role=text name="Recent activity"' &&
        rg -q 'role=tab name="Activity".*state=\[[^]]*selected' "$after" &&
        click_named tab Overview "$after" &&
        snapshot_after 'role=text name="Project overview"' || return 1
      ;;
    radio-group)
      click_named radio Weekly "$before" &&
        snapshot_after 'role=text name="Weekly selected"' &&
        rg -q 'role=radio name="Weekly".*value=1' "$after" &&
        click_named radio Daily "$after" &&
        snapshot_after 'role=text name="Daily selected"' || return 1
      ;;
    popover)
      ! rg -q 'role=dialog name="About this view"' "$before" &&
        click_named button 'About this view' "$before" &&
        snapshot_after 'role=dialog name="About this view"' &&
        "$cli" automate widget-key main-canvas escape &&
        "$cli" automate assert --timeout-ms 5000 --absent 'role=dialog name="About this view"' &&
        snapshot_after 'role=button name="About this view"' || return 1
      ;;
    toast)
      click_named button 'Save view' "$before" &&
        snapshot_after 'role=text name="View saved[.]"' &&
        click_named button 'Dismiss notification' "$after" &&
        snapshot_after 'role=button name="Save view"' &&
        ! rg -q 'role=text name="View saved[.]"' "$after" || return 1
      ;;
    sidebar-layout)
      click_named button 'Show project navigation' "$before" &&
        snapshot_after 'role=dialog name="Projects"' &&
        click_named button 'Close navigation' "$after" &&
        "$cli" automate assert --timeout-ms 5000 --absent 'role=dialog name="Projects"' &&
        snapshot_after 'role=button name="Show project navigation"' || return 1
      ;;
    select)
      click_named button 'Weekly review' "$before" &&
        snapshot_after 'role=menuitem name="Meatball"' &&
        click_named menuitem Meatball "$after" &&
        snapshot_after 'state updated' &&
        ! rg -q 'role=menuitem name="Meatball"' "$after" || return 1
      ;;
    decision-review)
      click_named button Archive "$before" &&
        snapshot_after 'role=dialog name="Review"' &&
        click_named button Cancel "$after" &&
        "$cli" automate assert --timeout-ms 5000 --absent 'role=dialog name="Review"' &&
        snapshot_after 'role=button name="Archive"' &&
        click_named button Archive "$after" &&
        snapshot_after 'role=dialog name="Review"' &&
        action_named button Archive press '' "$after" &&
        snapshot_after 'Choice confirmed in this example[.]' &&
        ! rg -q 'role=dialog name="Review"' "$after" || return 1
      ;;
    input-otp)
      action_named textbox 'Verification code' focus '' "$before" &&
        snapshot_after 'role=textbox name="Verification code".*focused=true' &&
        "$cli" automate screenshot main-canvas >/dev/null &&
        cp "$automation/screenshot-main-canvas.png" "$output/$prefix-focused.png" &&
        action_named textbox 'Verification code' set_text '12-34567' "$after" &&
        snapshot_after 'text="123456"' || return 1
      ;;
    action-menu)
      click_named button 'View actions' "$before" &&
        snapshot_after 'role=menu name="View actions"' &&
        "$cli" automate screenshot main-canvas >/dev/null &&
        cp "$automation/screenshot-main-canvas.png" "$output/$prefix-open.png" &&
        click_named menuitem 'Duplicate view' "$after" &&
        snapshot_after 'View duplicated[.]' || return 1
      ;;
    progress)
      rg -q 'role=progressbar name="Reviewed records".*value=0\.2' "$before" &&
        click_named button 'Review next record' "$before" &&
        snapshot_after 'role=progressbar name="Reviewed records".*value=0\.4' || return 1
      ;;
    chart)
      rg -q 'name="View readings"' "$before" &&
        ! rg -q 'name="No reading"' "$before" &&
        action_named group 'View readings' toggle '' "$before" &&
        snapshot_after 'name="No reading"' || return 1
      ;;
    rating)
      click_named radio '4 of 5' "$before" &&
        snapshot_after 'role=radio name="4 of 5".*value=1' || return 1
      ;;
    composer)
      action_named textbox 'Message Kai' set_text 'Check the release notes' "$before" &&
        snapshot_after 'text="Check the release notes"' &&
        click_named button Send "$after" &&
        snapshot_after 'role=text name="Draft sent"' &&
        ! rg -q 'name="Launch brief[.]pdf"|text="Check the release notes"' "$after" || return 1
      ;;
    agent-row)
      rg -q 'role=text name="Waiting for you"' "$before" &&
        rg -q 'role=text name="9:41 AM"' "$before" &&
        click_named listitem Kai "$before" &&
        snapshot_after 'role=listitem name="Kai".*state=\[[^]]*selected' &&
        rg -q 'role=text name="Kai selected"' "$after" || return 1
      ;;
    project-sidebar)
      rg -q 'role=image name="Project mark"' "$before" &&
        rg -q 'role=listitem name="Reviews".*bounds=\([^)]*x38\).*state=\[[^]]*selected' "$before" &&
        click_named listitem 'Run history' "$before" &&
        snapshot_after 'role=listitem name="Run history".*state=\[[^]]*selected' &&
        click_named listitem Delivery "$after" &&
        snapshot_after 'Project views collapsed' &&
        ! rg -q 'role=listitem name="Run history"' "$after" &&
        rg -q 'role=listitem name="Sources"' "$after" || return 1
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
      if [ "$id" = switch ]; then role=switch; label='Record dates'; fi
      rg -q "role=$role name=\"$label\".*value=1" "$before" &&
        click_named "$role" "$label" "$before" && snapshot_after 'setting changed' &&
        rg -q "role=$role name=\"$label\".*value=0" "$after" || return 1
      ;;
    accordion|disclosure-row)
      local label='About this view' detail='This view includes notes saved in the last seven days.'
      if [ "$id" = disclosure-row ]; then label='Review details'; detail='Saved on Friday in Sourdough.'; fi
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
      ! rg -Fq 'role=text name="Three records are ready to review."' "$before" &&
        click_named button 'Weekly review' "$before" &&
        snapshot_after 'Three records are ready to review' &&
        click_named button 'Weekly review' "$after" &&
        "$cli" automate assert --timeout-ms 5000 --absent 'Three records are ready to review' &&
        "$cli" automate snapshot > "$after" || return 1
      ;;
    slider)
      rg -q 'role=slider name="Preview volume".*value=0\.3([[:space:]]|$)' "$before" &&
        action_named slider 'Preview volume' increment '' "$before" && snapshot_after 'value changed' &&
        rg -q 'role=slider name="Preview volume".*value=' "$after" &&
        ! rg -q 'role=slider name="Preview volume".*value=0\.3([[:space:]]|$)' "$after" || return 1
      ;;
    calendar)
      rg -q 'role=text name="November 2026"' "$before" &&
        click_named button Next "$before" && snapshot_after 'Sample page changed' &&
        rg -q 'role=text name="December 2026"' "$after" &&
        rg -q 'role=button name="31"' "$after" &&
        click_named button Previous "$after" && snapshot_after 'Sample page changed' &&
        rg -q 'role=text name="November 2026"' "$after" &&
        ! rg -q 'role=button name="31"' "$after" &&
        click_named button '12' "$after" && snapshot_after 'Nov 12, 2026' || return 1
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
    field|label|help-text|field-error)
      action_named textbox 'View name' set_text 'Native review' "$before" &&
        snapshot_after 'role=textbox name="View name".*text="Native review"' || return 1
      if [ "$id" = field-error ]; then
        rg -q 'role=text name="Give this view a name."' "$before" &&
          ! rg -q 'role=text name="Give this view a name."' "$after" || return 1
      fi
      ;;
    scroll-area)
      local scroll_id
      scroll_id="$(sed -nE 's/^.*widget @w1\/main-canvas#([0-9]+) role=group name="Recent notes".*$/\1/p' "$before" | head -n1)"
      test -n "$scroll_id" &&
        rg -q 'role=group name="Recent notes".*x124\)' "$before" &&
        "$cli" automate widget-wheel main-canvas "$scroll_id" 570 &&
        snapshot_after 'role=text name="Archive"' || return 1
      ;;
    resizable)
      local divider_x='s/.*role=separator name="Split divider" bounds=\(([-0-9.]+),[^ ]+ [^x]+x[1-9][0-9.]*\).*/\1/p'
      local initial final
      initial="$(sed -nE "$divider_x" "$before")"
      test -n "$initial" &&
        action_named separator 'Split divider' increment '' "$before" &&
        snapshot_after 'role=separator name="Split divider"' || return 1
      final="$(sed -nE "$divider_x" "$after")"
      [ -n "$final" ] && [ "$initial" != "$final" ] || return 1
      ;;
    form)
      action_named textbox 'View name' set_text '' "$before" &&
        snapshot_after 'role=textbox name="View name"' &&
        click_named button 'Save view' "$after" &&
        snapshot_after 'Enter a view name' &&
        action_named textbox 'View name' set_text 'Native review' "$after" &&
        snapshot_after 'role=textbox name="View name".*text="Native review"' &&
        click_named button 'Save view' "$after" &&
        snapshot_after 'Sample view saved' || return 1
      ;;
    stepper)
      local stage_edge='s/.*role=text name="(Prepare|Review)" bounds=\(([-0-9.]+),.*/\1 \2/p'
      rg -q 'role=text name="Current"' "$before" &&
        click_named button 'Next stage' "$before" &&
        snapshot_after 'role=text name="Current"' &&
        [ "$(rg 'role=text name="Current"' "$before")" != "$(rg 'role=text name="Current"' "$after")" ] &&
        [ "$(sed -nE "$stage_edge" "$before")" = "$(sed -nE "$stage_edge" "$after")" ] || return 1
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

check_animated() {
  local before="$output/$prefix.txt" after="$output/$prefix-interaction.txt" state
  if [ "$id" = agent-avatar ] || [ "$id" = gaze ]; then
    for state in Thinking Working Waiting Blocked Finished Ready; do
      click_named button "$state" "$before" &&
        "$cli" automate screenshot main-canvas >/dev/null &&
        cp "$automation/screenshot-main-canvas.png" "$output/$prefix-$state.png" || return 1
    done
    click_named button Sol "$before" && snapshot_after 'role=image name="Sol"' &&
      click_named button Kai "$after" && snapshot_after 'role=image name="Kai"' || return 1
  else
    "$cli" automate snapshot > "$after" || return 1
  fi
  sleep 0.25
  ! rg -q 'Animation unavailable|AutomationCommandFailed' "$after" &&
    "$cli" automate screenshot main-canvas >/dev/null &&
    ! cmp -s "$automation/screenshot-main-canvas.png" "$output/$prefix.png"
}

scroll_preview() {
  local snapshot="$1" delta="$2" id
  id="$(sed -nE 's/^.*widget @w1\/main-canvas#([0-9]+) role=group name="Component preview".*$/\1/p' "$snapshot" | head -n 1)"
  test -n "$id"
  "$cli" automate widget-wheel main-canvas "$id" "$delta"
}

"$cli" automate assert --timeout-ms 5000 'ready=true' 'gpu_nonblank=true'
"$cli" automate snapshot > "$output/list.txt"
if [ "${YOGURT_NATIVE_DARK:-0}" = 1 ]; then
  click_named button 'Change appearance' "$output/list.txt"
  "$cli" automate snapshot > "$output/list.txt"
fi
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
    agent-avatar|gaze|skeleton|spinner)
      if check_animated; then
        interaction=PASS
      else
        interaction=FAILED
        failed=1
      fi
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
    dialog|drawer|sheet|card|segmented-control|input-otp|action-menu|progress|chart|rating|agent-row|composer|project-sidebar|switch|text-field|textarea|input-group|search-field|split-text-field|checkbox|toggle|accordion|disclosure-row|sidebar|tooltip|hover-card|slider|calendar|numeric-spinner|pagination|carousel|field|label|help-text|field-error|scroll-area|resizable|form|stepper|icon-button|list-row|tabs|radio-group|popover|toast|sidebar-layout|select|decision-review)
      if [ "$render" = PRESENTED_UNVERIFIED ] && check_interaction; then
        interaction=PASS
      else
        interaction=FAILED
        failed=1
      fi
      ;;
    *)
      if observed="$(node "$workspace/checks/native-gallery-contracts.mjs" "$id" "$cli" "$output/$prefix.txt" "$output/$prefix-interaction.txt")"; then
        interaction="$observed"
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
  if [ "$interaction" != PASS ] && [ "$interaction" != PRESENTATION ] && [ "$interaction" != FAILED ]; then incomplete=1; fi
  printf '%s\t%s\t%s\t%s\t%s\n' "$index" "$id" "$name" "$render" "$interaction" >> "$output/results.tsv"
  if [ "$index" -lt "$total" ]; then
    "$cli" automate snapshot > "$output/current.txt"
    if rg -q 'role=dialog .*actions=\[.*dismiss|role=menu ' "$output/current.txt"; then
      "$cli" automate widget-key main-canvas escape
      "$cli" automate snapshot > "$output/current.txt"
    fi
    scroll_preview "$output/current.txt" 2000
    "$cli" automate snapshot > "$output/current.txt"
    if ! action_named button Next press '' "$output/current.txt"; then
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
echo "Traversal finished; each specimen passed its interaction or presentation contract."
