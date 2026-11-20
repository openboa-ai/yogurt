import { readFileSync, writeFileSync } from "node:fs";
import { dirname, posix, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = name => readFileSync(resolve(root, name), "utf8");
const portfolio = JSON.parse(read("docs/portfolio.json"));
const renderer = process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : "marked";
const { marked } = await import(renderer);
const documents = new Map();
const liveGuide = "https://yogurt-theta.vercel.app/";
const escape = value => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function register(id, file, title) {
  if (documents.has(file)) throw new Error("Duplicate document " + file);
  documents.set(file, {id, file, title});
}

const overview = [
  ["using-yogurt", "using-yogurt.md", "Using Yogurt"],
  ["component-library", "engineering/controls/component-library/spec.md", "Component SDK"],
  ["sdk-evidence", "engineering/controls/component-library/verification.md", "Renderer evidence"],
  ["first-four", "engineering/controls/first-four/README.md", "Four basic controls"],
  ["direction", "design-direction.md", "Visual direction"],
  ["foundation", "component-foundation.md", "Component foundation"],
  ["native-stack", "native-stack.md", "Default application stack"],
  ["families", "components.md", "Component inventory"],
  ["workspace-patterns", "workspace-patterns.md", "Workspace patterns"],
  ["sidebar", "sidebar.md", "Compose a project sidebar"],
  ["design-system-rules", "design-system-rules.md", "Design system rules"],
  ["craft", "component-quality.md", "Motion and craft"],
  ["motion", "motion.md", "Motion"],
  ["purpose", "intent.md", "Product intent"],
  ["product", "spec.md", "Product specification"],
  ["status", "status.md", "Current evidence and open decisions"],
  ["architecture", "repository.md", "Repository and distribution"],
  ["areas", "categories.md", "Design ownership"],
  ["menu", "action-menu.md", "Existing web menu"],
  ["portfolio", "README.md", "Full design portfolio"]
];
for (const [id, file, title] of overview) register(id, "docs/" + file, title);
const study = "docs/engineering/controls/first-four/";
for (const name of ["button", "icon-button", "text-field", "switch"]) {
  for (const kind of ["intent", "spec"]) {
    register(name + "-" + kind, study + name + "/" + kind + ".md", name + " " + kind);
  }
}

for (const intent of portfolio.intents) {
  register(intent.id, intent.path + "/intent.md", intent.title);
  register(intent.id + "-design", intent.path + "/spec.md", intent.title);
}
for (const item of portfolio.leaves) register(item.id, item.spec, item.id);
for (const journey of portfolio.journeys) {
  const heading = read(journey.page).split("\n")[0].replace(/^#\s+/, "");
  register(journey.id, journey.page, heading);
}

const anchor = (id, label) => '<a href="#' + escape(id) + '">' + escape(label) + '</a>';
function sectionLinks(domain) {
  const items = portfolio.intents.filter(item => domain.areas.includes(item.category));
  const entries = items.map(item => {
    const leaves = portfolio.leaves.filter(leaf => leaf.intent === item.id);
    const refs = [anchor(item.id, "Intent"), anchor(item.id + "-design", "Paired spec"), ...leaves.map(leaf => anchor(leaf.id, leaf.id))];
    return '<li><b>' + escape(item.id + ' · ' + item.title) + '</b><div class="refs">' + refs.join(' ') + '</div></li>';
  });
  return '<details><summary>' + escape(domain.title) + '</summary><ul>' + entries.join('') + '</ul></details>';
}

function renderArticle(doc) {
  let html = marked.parse(read(doc.file));
  html = html.replace(/href="([^"]+)"/g, (attribute, href) => {
    if (href.startsWith(liveGuide)) return 'href="../' + href.slice(liveGuide.length) + '"';
    if (/^(?:[a-z][a-z0-9+.-]*:|#)/i.test(href)) return attribute;
    const [file, fragment] = href.split("#");
    const source = posix.normalize(posix.join(posix.dirname(doc.file),file));
    const target = documents.get(source);
    if (target && !fragment) return 'href="#' + target.id + '"';
    return 'href="' + posix.relative('docs', source) + (fragment ? '#' + fragment : '') + '"';
  });
  html = html.replace(/<table>/g, '<div class="wrap" role="region" aria-label="Design specification table" tabindex="0"><table>').replace(/<\/table>/g, '</table></div>');
  const source = posix.relative("docs", doc.file);
  return '<article class="read" tabindex="-1" id="' + doc.id + '"><a class="return" href="#overview">All design records</a>' + html + '<footer><a href="' + escape(source) + '">Canonical Markdown</a></footer></article>';
}

const start = overview.map(([id,,title]) => anchor(id, title)).join('\n');
const groups = portfolio.domains.map(sectionLinks).join('\n');
const journeys = portfolio.journeys.map(j => anchor(j.id, documents.get(j.page).title)).join('\n');
const articles = [...documents.values()].map(renderArticle).join('\n');
const template = readFileSync(new URL("./design-handbook.html.tmpl", import.meta.url), "utf8");
const fields = { START: start, GROUPS: groups, JOURNEYS: journeys, ARTICLES: articles };
const output = template.replace(/\{\{(START|GROUPS|JOURNEYS|ARTICLES)\}\}/g, (_, key) => fields[key]);
writeFileSync(resolve(root, "docs/index.html"), output);
