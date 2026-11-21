#!/usr/bin/env bash
set -euo pipefail

repo="$PWD"
fixture="$(mktemp -d "${TMPDIR:-/tmp}/yogurt-agent-consumer.XXXXXXXX")"
vite_port="${YOGURT_VITE_PORT:-6471}"
next_port="${YOGURT_NEXT_PORT:-6472}"
mkdir -p "$fixture/app"
npm pack --pack-destination "$fixture" --silent > "$fixture/pack-name"
archive="$(tail -1 "$fixture/pack-name")"
node checks/resolve-native-guidance.mjs "$fixture/$archive"
cat > "$fixture/package.json" <<'JSON'
{"name":"yogurt-agent-consumer","private":true,"type":"module"}
JSON
npm install --prefix "$fixture" --no-audit --no-fund --save-exact \
  vite@8.3.8 next@16.4.6 react@19.2.0 react-dom@19.2.0 "$fixture/$archive" > "$fixture/install.log" 2>&1 || {
  tail -50 "$fixture/install.log"; exit 1;
}
node "$fixture/node_modules/@openboa/yogurt/bin/yogurt.mjs" add button --target web --dir "$fixture" > "$fixture/registry-install.log" 2>&1
printf '{}\n' > "$fixture/yogurt.config.json"
node "$repo/checks/resolve-web-imports.mjs" "$fixture"
cp checks/fixtures/agent-button-client.jsx "$fixture/app/fixture.jsx"
cat > "$fixture/app/layout.jsx" <<'JS'
import '@openboa/yogurt/styles.css';
export default function Layout({children}) { return <html lang="en"><body>{children}</body></html>; }
JS
cat > "$fixture/app/page.jsx" <<'JS'
import Fixture from './fixture';
export default function Page() { return <Fixture />; }
JS
cat > "$fixture/index.html" <<'HTML'
<html><head><title>Yogurt fixture</title></head><body><div id="app"></div><script type="module" src="/main.jsx"></script></body></html>
HTML
cat > "$fixture/main.jsx" <<'JS'
import React from 'react';
import {createRoot} from 'react-dom/client';
import Fixture from './app/fixture';
import '@openboa/yogurt/styles.css';
createRoot(document.getElementById('app')).render(<Fixture/>);
JS
(cd "$fixture" && ./node_modules/.bin/vite build > vite-build.log 2>&1) || { tail -60 "$fixture/vite-build.log"; exit 1; }
(cd "$fixture" && NEXT_TELEMETRY_DISABLED=1 ./node_modules/.bin/next build > next-build.log 2>&1) || { tail -60 "$fixture/next-build.log"; exit 1; }
(cd "$fixture" && exec ./node_modules/.bin/vite preview --host 127.0.0.1 --port "$vite_port" --strictPort > vite.log 2>&1) & vite_pid=$!
(cd "$fixture" && exec ./node_modules/.bin/next start --hostname 127.0.0.1 --port "$next_port" > next.log 2>&1) & next_pid=$!
trap 'kill "$vite_pid" "$next_pid" 2>/dev/null || true' EXIT
for port in "$vite_port" "$next_port"; do
  ready=0
  if [[ "$port" == "$vite_port" ]]; then target_pid="$vite_pid"; else target_pid="$next_pid"; fi
  for _ in {1..40}; do
    if ! kill -0 "$target_pid" 2>/dev/null; then echo "Consumer on port $port exited. Logs: $fixture" >&2; exit 1; fi
    if curl -fsS "http://127.0.0.1:$port/" > /dev/null 2>&1; then ready=1; break; fi
    sleep 1
  done
  if [[ "$ready" != 1 ]]; then echo "Consumer on port $port did not start. Logs: $fixture" >&2; exit 1; fi
done
node "$repo/checks/web-agent-button.cjs" "http://127.0.0.1:$vite_port" "http://127.0.0.1:$next_port"
printf 'Installed consumer evidence: %s\n' "$fixture"
