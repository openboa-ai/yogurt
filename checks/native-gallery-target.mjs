import { readFileSync } from 'node:fs';

const snapshot = readFileSync(process.argv[2], 'utf8');
const widgets = [...snapshot.matchAll(
  /widget @w1\/main-canvas#(\d+) role=(\S+) name="([^"]*)" bounds=\(([-\d.]+),([-\d.]+) ([\d.]+)x([\d.]+)\)[^\n]*/g,
)].map(([line, id, role, name, x, y, width, height]) => ({
  line, id, role, name,
  x: Number(x), y: Number(y), width: Number(width), height: Number(height),
}));
const preview = widgets.find(({ name }) => name === 'Component preview');
const actionable = new Set(['button', 'checkbox', 'listitem', 'menuitem', 'radio', 'switch', 'tab', 'textbox']);
const target = preview && widgets.find((widget) => {
  const x = widget.x + widget.width / 2;
  const y = widget.y + widget.height / 2;
  return actionable.has(widget.role) && widget.width > 0 && widget.height > 0 &&
    x >= preview.x && x < preview.x + preview.width &&
    y >= preview.y && y < preview.y + preview.height &&
    widget.line.includes('enabled=true') &&
    !['Previous', 'Next'].includes(widget.name);
});
if (target) process.stdout.write(target.id);
