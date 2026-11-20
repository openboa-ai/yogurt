(() => {
  const byId = id => document.getElementById(id);
  const style = getComputedStyle(document.documentElement);
  const prop = key => style.getPropertyValue("--boa-" + key).trim();
  const hue = byId("hue");
  const swatches = byId("swatches");
  const feedback = byId("copy-status");
  const fallback = byId("copy-fallback");
  const steps = prop("palette-steps").split(/\s+/);
  let selected;

  function selectSwatch(button) {
    selected?.setAttribute("aria-pressed", "false");
    selected = button;
    selected.setAttribute("aria-pressed", "true");
    byId("color-name").textContent = hue.value + "." + selected.value;
    byId("color-hex").textContent = selected.dataset.hex;
    feedback.textContent = "";
    fallback.hidden = true;
  }

  function showFamily(preferredStep = "500") {
    selected = null;
    const buttons = [];
    for (const step of steps) {
      const token = "color-" + hue.value + "-" + step;
      const hex = prop(token);
      if (!hex) continue;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "swatch";
      button.value = step;
      button.dataset.hex = hex;
      button.textContent = step;
      button.setAttribute("aria-label", hue.value + " " + step + ", " + hex);
      button.setAttribute("aria-pressed", "false");
      button.style.setProperty("--swatch", "var(--boa-" + token + ")");
      buttons.push(button);
    }
    swatches.replaceChildren(...buttons);
    selectSwatch(buttons.find(button => button.value === preferredStep) || buttons[0]);
  }

  for (const name of prop("palette-hues").split(/\s+/)) {
    hue.add(new Option(name.replaceAll("-", " "), name));
  }
  hue.value = "slate";
  showFamily("750");
  hue.addEventListener("change", () => showFamily());
  swatches.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (button) selectSwatch(button);
  });
  byId("copy-token").addEventListener("click", async () => {
    const choice = selected;
    const key = "var(--boa-color-" + hue.value + "-" + selected.value + ")";
    fallback.value = key;
    try {
      await navigator.clipboard.writeText(key);
      if (selected === choice) feedback.textContent = "Copied " + key + ".";
    } catch {
      if (selected !== choice) return;
      fallback.hidden = false;
      fallback.focus();
      fallback.select();
      feedback.textContent = "The CSS token is selected for copying.";
    }
  });

  const spaces = byId("spaces");
  for (const step of prop("spacing-steps").split(/\s+/)) {
    const sample = document.createElement("li");
    sample.style.setProperty("--sample-width", "var(--boa-space-" + step + ")");
    sample.textContent = step;
    spaces.append(sample);
  }
  const search = byId("agent-search");
  const status = byId("agent-status");
  const clear = byId("clear");
  const rows = [...byId("agent-list").children];
  function filter() {
    const query = search.value.trim().toLowerCase();
    let count = 0;
    for (const row of rows) {
      const match = (row.dataset.name + " " + row.dataset.id).toLowerCase().includes(query);
      row.hidden = !match || (status.value !== "all" && status.value !== row.dataset.state);
      if (!row.hidden) count++;
    }
    byId("empty").hidden = count > 0;
    byId("agent-count").textContent = count + (count === 1 ? " agent" : " agents");
    clear.disabled = !search.value && status.value === "all";
  }
  search.addEventListener("input", filter);
  status.addEventListener("change", filter);
  clear.addEventListener("click", () => {
    search.value = "";
    status.value = "all";
    filter();
    search.focus();
  });
  byId("dark-surface").addEventListener("change", event => {
    byId("roster").dataset.appearance = event.target.checked ? "dark" : "light";
  });
})();
