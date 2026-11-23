import { readFileSync, writeFileSync } from "node:fs";

const read = (name) => readFileSync(name, "utf8");
const { shapes, eyes } = JSON.parse(read("design/assets/agents/silhouettes.json"));
const { colors, shapes: fits } = JSON.parse(read("design/assets/agents/animation-fits.json"));
const palette = JSON.parse(read("design/tokens/brand.json")).color;

function paletteColor(token) {
  const [family, level] = token.split(".");
  const color = palette[family]?.[level];
  if (!/^#[A-Fa-f0-9]{6}$/.test(color)) throw Error("Unknown agent color " + token);
  return color;
}

function channels(hex) {
  return [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
}

function luminance(hex) {
  return channels(hex)
    .map((channel) => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    })
    .reduce((total, value, index) => total + value * [0.2126, 0.7152, 0.0722][index], 0);
}

const ink = paletteColor(eyes.color);
const colorsByToken = Object.fromEntries(colors.map((id) => [id, paletteColor(id)]));
if (Object.keys(colorsByToken).length !== colors.length ||
    Object.values(colorsByToken).some((color) => (luminance(color) + 0.05) / (luminance(ink) + 0.05) < 4.5)) {
  throw Error("Agent colors require unique tokens and at least 4.5:1 eye contrast");
}

const fitKeys = ["slide", "lift", "tilt", "gazeX", "gazeY"];
const validId = /^[a-z]+(?:-[a-z]+)*$/;
const variants = {};
const groups = {};
for (const shape of shapes) {
  const id = shape.file.replace(/\.svg$/, "");
  if (!validId.test(id) || Object.hasOwn(groups, id)) throw Error("Invalid silhouette ID " + id);
  if (!Object.hasOwn(colorsByToken, shape.color)) throw Error("Missing default color for " + id);
  const values = fits[id] ?? {};
  const fit = fitKeys.map((key) => values[key] ?? 1);
  if (Object.keys(values).some((key) => !fitKeys.includes(key)) ||
      fit.some((value) => !Number.isFinite(value) || value <= 0 || value > 1)) {
    throw Error("Invalid animation fit for " + id);
  }

  const group = { name: shape.name, color: shape.color, center: shape.eyeCenter, motion: id === "sol" ? "sol" : "kai", fit };
  groups[id] = group;
  const master = read("design/assets/agents/" + shape.file);
  for (const notch of shape.positions) {
    const variant = id + "-" + notch;
    if (!["top", "right", "bottom", "left"].includes(notch) || Object.hasOwn(variants, variant)) {
      throw Error("Invalid notch for " + id);
    }
    const path = master.match(new RegExp('<path id="' + notch + '" d="([^"]+)"'))?.[1];
    const commands = path && [...path.matchAll(/([ML])(-?[\d.]+)\s+(-?[\d.]+)|Z/g)];
    if (!commands || commands.map((command) => command[0]).join("") !== path) throw Error("Invalid outline " + variant);
    variants[variant] = { shape: id, notch, path };
  }
}
if (Object.keys(fits).some((id) => !Object.hasOwn(groups, id))) throw Error("Fit requires an existing silhouette");

const js = [
  "// Generated from the agent SVG masters, silhouettes and animation fits.",
  "export type AgentMotionFit = readonly [slide: number, lift: number, tilt: number, gazeX: number, gazeY: number];",
  "export const agentColors = " + JSON.stringify(colorsByToken, null, 2) + " as const;",
  "export const agentShapes = " + JSON.stringify(groups, null, 2) + " as const;",
  "export type AgentColor = keyof typeof agentColors;",
  "export type AgentShape = keyof typeof agentShapes;",
  "export type AgentVariant = " + Object.keys(variants).map(JSON.stringify).join(" | ") + ";",
  'export type AgentNotch = "top" | "right" | "bottom" | "left";',
  "export const agentVariants: Readonly<Record<AgentVariant, { shape: AgentShape; notch: AgentNotch; path: string }>> = " +
    JSON.stringify(variants, null, 2) + ";",
];
writeFileSync("packages/web/src/identity/agent-family-data.ts", js.join("\n") + "\n");
