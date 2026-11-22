import { readFileSync } from "node:fs";
import { join } from "node:path";
import { dimension } from "./dimension.mjs";

export function nativeTemplates(root, brand, geometry, components, blocks) {
  const outputs = new Map();
  function compile(source, destination) {
    const template = readFileSync(join(root, source), "utf8");
    const literalSpacing = template.matchAll(/\s(?:gap|padding|anchor-offset)="(-?(?:\d+(?:\.\d*)?|\.\d+))"/g);
    if (Array.from(literalSpacing).some(match => Number(match[1]) !== 0)) {
      throw Error(`Bind the layout spacing in ${source} to a design token.`);
    }
    const markup = template.replace(/@\{([a-z][a-z0-9.-]*)\}/g, (_, name) => dimension(brand, geometry, name));
    if (markup.includes("@{")) throw Error(`Invalid design token reference in ${source}.`);
    outputs.set(destination, markup);
  }
  for (const { id, nativeMarkup } of components) {
    if (nativeMarkup === false) continue;
    compile(`packages/native/src/templates/${id}.native.in`, `packages/native/controls/items/${id}.native`);
  }
  for (const { id } of blocks) {
    const view = `packages/recipes/${id}/view.native`;
    compile(view + ".in", view);
  }
  return outputs;
}
