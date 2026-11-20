import { readFile, writeFile } from "node:fs/promises";

const directory = new URL("../../design/assets/projects/", import.meta.url);
const source = JSON.parse(await readFile(new URL("emoji.json", directory), "utf8"));
const { color } = JSON.parse(await readFile(new URL(source.palette, directory), "utf8"));

for (const project of source.projects) {
  const layers = project.layers.map(layer => {
    const [hue, step] = layer.color.split(".");
    const fill = color[hue]?.[step];
    if (!fill) throw new Error("Unknown palette token " + layer.color);
    return '  <path id="' + layer.name + '" data-token="' + layer.color + '" fill="' + fill + '" d="' + layer.path + '"/>';
  });
  const title = '  <title id="title">' + project.name + '</title>';
  const description = '  <desc id="description">' + project.description + '</desc>';
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + source.viewBox + '" role="img" aria-labelledby="title description">';
  const cut = '<defs><clipPath id="contour"><path clip-rule="evenodd" d="M0 0H64V64H0Z ' + project.notch.cutout + '"/></clipPath></defs>';
  const offset = project.opticalOffsetY ? ' transform="translate(0 ' + project.opticalOffsetY + ')"' : "";
  const artwork = ['  ' + cut, '  <g clip-path="url(#contour)"' + offset + '>', ...layers, '  </g>'];
  await writeFile(new URL(project.name + ".svg", directory), [svg, title, description, ...artwork, "</svg>", ""].join("\n"));
}
