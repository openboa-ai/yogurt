(() => {
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
    text("pb-targets", "Web. " + pattern.support.web.detail + " Native. " + pattern.support.native.detail);
  }
  function choose(sought) {
    state.replaceChildren(...pick().scenes.map(scene => new Option(scene.label, scene.state)));
    if (sought && [...state.options].some(option => option.value === sought)) state.value = sought;
    render();
  }
  project.addEventListener("change", () => choose());
  state.addEventListener("change", render);
  window.yogurtActionMenu.mount(get("pb-menu"));
  get("pb-menu").addEventListener("yogurt-menu-select", event => {
    const details = get(event.detail);
    if (!details || !["parts", "proof"].includes(details.id)) return;
    details.open = true;
    details.querySelector("summary").focus();
  });
  for (const pattern of catalog.patterns) {
    const item = document.createElement("li");
    const ref = document.createElement("a");
    const example = examples.find(entry => entry.scenes.some(scene => scene.pattern === pattern.id));
    const scene = example?.scenes.find(entry => entry.pattern === pattern.id);
    ref.href = scene ? "playbook.html?project=" + example.id + "&state=" + scene.state : pattern.support.web.source || "catalog/patterns.json";
    ref.textContent = pattern.name;
    item.append(ref, ". " + pattern.when);
    get("pb-directory").append(item);
  }
  choose(link.get("state"));
})();
