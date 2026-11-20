const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

async function renderSet(directory, items) {
  const pngDirectory = path.join(directory, "png");
  await fs.mkdir(pngDirectory, { recursive: true });
  for (let start = 0; start < items.length; start += 8) {
    await Promise.all(items.slice(start, start + 8).map(({ id }) =>
      sharp(path.join(directory, "svg", id + ".svg"), { density: 288 })
        .resize(128, 128)
        .ensureAlpha()
        .png()
        .toFile(path.join(pngDirectory, id + ".png"))
    ));
  }
}

async function render() {
  const directory = path.resolve(__dirname, "../../design/assets/emoji");
  const { items } = JSON.parse(await fs.readFile(path.join(directory, "catalog.json"), "utf8"));
  await renderSet(directory, items);
  const variants = items.filter(item => item.variants?.includes("peach"));
  const variantDirectory = path.join(directory, "variants", "peach");
  await renderSet(variantDirectory, variants);
  const expected = new Set(variants.map(item => item.id + ".png"));
  for (const name of await fs.readdir(path.join(variantDirectory, "png"))) {
    if (name.endsWith(".png") && !expected.has(name)) await fs.unlink(path.join(variantDirectory, "png", name));
  }
  console.log(items.length + " transparent 128 px PNGs and " + variants.length + " peach expressions.");
}
render().catch(error => { console.error(error); process.exitCode = 1; });
