window.mountYogurtPlaybook = function () {
  const {catalog, examples} = window.yogurtPlaybook;
  const get = id => document.getElementById(id);
  const text = (id, value) => { get(id).textContent = value; };
  const project = get("pb-project");
  const state = get("pb-state");
  const pick = () => examples.find(example => example.id === project.value);
  for (const item of examples) project.add(new Option(item.project + " · " + item.task, item.id));
  const link = new URLSearchParams(location.search);
  if (examples.some(example => example.id === link.get("project"))) project.value = link.get("project");

  function render() {
    const example = pick();
    const scene = example.scenes[state.selectedIndex];
    const pattern = catalog.patterns.find(entry => entry.id === scene.pattern);
    const rule = pattern.states.find(entry => entry.id === scene.state);
    text("pb-project-name", example.project);
    get("pb-mark").src = "assets/projects/" + example.id + ".svg";
    text("pb-inputs", example.inputs);
    text("example-title", scene.headline);
    text("pb-body", scene.body);
    text("pb-action", scene.action);
    const facts = scene.facts.map(([name, value]) => {
      const row = document.createElement("div");
      const term = document.createElement("dt");
      const detail = document.createElement("dd");
      term.textContent = name;
      detail.textContent = value;
      row.append(term, detail);
      return row;
    });
    get("pb-facts").replaceChildren(...facts);
    text("pb-ref", pattern.id + " / " + rule.id);
    text("pb-rule", rule.show + " " + rule.action);
    text("pb-test", rule.acceptance);
    text("pb-keyboard", pattern.keyboard);
    const parts = pattern.components.map(id => {
      const part = catalog.components.find(item => item.id === id);
      const row = document.createElement("li");
      const name = document.createElement("strong");
      name.textContent = part.name + ". ";
      row.append(name, part.use, " (" + part.web.replaceAll("-", " ") + ")");
      return row;
    });
    get("pb-parts").replaceChildren(...parts);
    text("pb-targets", pattern.support.web.detail);
  }
  function choose(sought, patternId) {
    state.replaceChildren(...pick().scenes.map(scene => new Option(scene.label, scene.state)));
    const index = pick().scenes.findIndex(scene => scene.state === sought && (!patternId || scene.pattern === patternId));
    if (index >= 0) state.selectedIndex = index;
    render();
  }
  project.addEventListener("change", () => choose());
  state.addEventListener("change", render);
  const dispose = window.yogurtActionMenu.mount(get("pb-menu"));
  get("pb-menu").addEventListener("yogurt-menu-select", event => {
    const details = get(event.detail);
    if (!details || !["parts", "proof"].includes(details.id)) return;
    details.open = true;
    details.querySelector("summary").focus();
  });
  for (const pattern of catalog.patterns) {
    const item = document.createElement("li");
    const heading = document.createElement("strong");
    heading.textContent = pattern.name;
    const description = document.createElement("p");
    description.textContent = pattern.when;
    const list = document.createElement("ul");
    for (const rule of pattern.states) {
      const row = document.createElement("li");
      const example = examples.find(entry => entry.scenes.some(scene => scene.pattern === pattern.id && scene.state === rule.id));
      if (example) {
        const ref = document.createElement("a");
        const query = new URLSearchParams({project: example.id, pattern: pattern.id, state: rule.id});
        ref.href = "playbook.html?" + query;
        ref.textContent = rule.label;
        row.append(ref);
      } else {
        row.textContent = rule.label + " · example unavailable";
      }
      list.append(row);
    }
    item.append(heading, description, list);
    get("pb-directory").append(item);
  }
  choose(link.get("state"), link.get("pattern"));
  return dispose;
};

if (document.currentScript) window.mountYogurtPlaybook();
