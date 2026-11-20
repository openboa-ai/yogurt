(() => {
  const { groups, items } = window.yogurtEmojiCatalog;
  const el = id => document.getElementById("emoji-" + id);
  const search = el("search"), group = el("group"), grid = el("grid");
  const faceColor = el("color");
  const url = new URLSearchParams(location.search);
  const pages = el("prev").parentElement;
  const pageSize = 48;
  const featured = [
    "1f60a", "26f4-fe0f", "1f992", "1f3b7", "1f525", "1f3a8", "1f52d", "1f433",
    "1f1f0-1f1f7", "1f44d", "1f4ee", "1f6a3", "1f309", "1f9d1-200d-1f9bd", "1f308", "1f680",
    "1f9a9", "1f3af", "1f3a0", "1fa81", "1f9f5", "1f30b", "1f46e", "1f9ed",
    "1f6f6", "1f3d5-fe0f", "1f6b2", "1f52c", "1f98e", "1f9e9", "1f4fc", "26f2",
    "262f-fe0f", "1f3bd", "1f9f3", "1f414", "1f9a5", "1f9ec", "1f574-fe0f", "1f3b9",
    "1f1e7-1f1f7", "2649", "1f22f", "1f3a7", "1f920", "1fa97", "1f4f7", "1f407"
  ];
  const rank = new Map(featured.map((id, index) => [id, index]));
  const ordered = [...items].sort((a, b) => (rank.get(a.id) ?? Infinity) - (rank.get(b.id) ?? Infinity));
  const glyph = id => String.fromCodePoint(...id.split("-").map(part => parseInt(part, 16)));
  const normalize = value => value.toLowerCase().replaceAll("\uFE0F", "").trim();
  const synonyms = {"1f680":"launch ship space", "1f60a":"happy smile", "1f914":"hmm consider", "1f4a1":"idea", "1f44d":"yes like approve", "1f44e":"no dislike", "1f602":"lol laugh", "1f388":"party celebrate", "1f331":"grow plant"};
  const searchable = new Map(items.map(item => [item.id, normalize([item.name, item.group, item.subgroup, item.id, glyph(item.id), synonyms[item.id] || ""].join(" "))]));
  let results = [], page = 0, selected, renderVersion = 0;
  for (const name of groups) group.add(new Option(name, name));
  faceColor.value = url.get("color") === "peach" ? "peach" : "yellow";

  const hasPeach = item => item?.variants?.includes("peach");
  function assetPath(id, format, supportsPeach) {
    const variant = supportsPeach && faceColor.value === "peach" ? "variants/peach/" : "";
    return `assets/emoji/${variant}${format}/${id}.${format}`;
  }

  function updateDetailArtwork(item) {
    const svg = assetPath(item.id, "svg", hasPeach(item));
    for (const image of el("proofs").querySelectorAll("img")) image.src = svg;
    el("svg").href = svg;
    el("png").href = assetPath(item.id, "png", hasPeach(item));
  }

  function showDetail(item) {
    selected = item;
    renderVersion++;
    el("detail").hidden = !item;
    el("feedback").textContent = "";
    el("fallback").hidden = true;
    el("color-field").hidden = !hasPeach(item);
    if (!item) return;
    updateDetailArtwork(item);
    el("name").textContent = item.name;
    el("meta").textContent = item.repertoire.includes("preview") ? item.group + " · Unicode 18 preview" : item.group;
    el("code").textContent = item.id.split("-").map(code => "U+" + code.toUpperCase().padStart(4, "0")).join(" ");
    for (const button of grid.children) {
      const active = button.dataset.id === item.id;
      button.setAttribute("aria-pressed", String(active));
      button.tabIndex = active ? 0 : -1;
    }
  }

  function draw(preferred) {
    const slice = results.slice(page * pageSize, (page + 1) * pageSize);
    const buttons = slice.map(item => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "emoji-tile";
      button.dataset.id = item.id;
      button.title = item.name;
      button.setAttribute("aria-label", item.name);
      const image = document.createElement("img");
      const supportsPeach = hasPeach(item);
      button.toggleAttribute("data-peach", supportsPeach);
      image.src = assetPath(item.id, "svg", supportsPeach);
      image.alt = "";
      image.width = image.height = 32;
      button.append(image);
      return button;
    });
    grid.replaceChildren(...buttons);
    el("count").textContent = results.length.toLocaleString("en") + " emoji";
    el("empty").hidden = results.length > 0;
    el("reset").hidden = !search.value && !group.value;
    pages.hidden = results.length <= pageSize;
    el("page").textContent = (page + 1) + " of " + Math.ceil(results.length / pageSize);
    el("prev").disabled = page === 0;
    el("next").disabled = (page + 1) * pageSize >= results.length;
    showDetail(slice.find(item => item.id === preferred) || slice[0]);
  }

  function filter() {
    const q = normalize(search.value).replace(/u\+0*([\da-f]+)/g, "$1");
    const words = q.split(/\s+/).filter(Boolean);
    results = ordered.filter(item => (!group.value || item.group === group.value) &&
      words.every(word => searchable.get(item.id).includes(word)));
    page = 0;
    draw(selected?.id);
  }

  grid.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (button) showDetail(results.find(item => item.id === button.dataset.id));
  });
  grid.addEventListener("keydown", event => {
    const button = event.target.closest("button");
    if (!button) return;
    const buttons = [...grid.children];
    const columns = getComputedStyle(grid).gridTemplateColumns.split(" ").length;
    const index = buttons.indexOf(button);
    const next = { ArrowLeft:index-1, ArrowRight:index+1, ArrowUp:index-columns, ArrowDown:index+columns, Home:0, End:buttons.length-1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const target = buttons[Math.max(0, Math.min(next, buttons.length - 1))];
    target.focus(); target.click();
  });
  search.addEventListener("input", filter);
  group.addEventListener("change", filter);
  el("reset").addEventListener("click", () => { search.value = group.value = ""; filter(); search.focus(); });
  el("prev").addEventListener("click", () => { page--; draw(); });
  el("next").addEventListener("click", () => { page++; draw(); });
  el("dark").addEventListener("change", event => el("proofs").toggleAttribute("data-ink", event.target.checked));
  faceColor.addEventListener("change", () => {
    if (selected) updateDetailArtwork(selected);
    for (const tile of grid.querySelectorAll("[data-peach]")) {
      tile.querySelector("img").src = assetPath(tile.dataset.id, "svg", true);
    }
  });
  el("copy").addEventListener("click", async () => {
    const value = glyph(selected.id), version = renderVersion;
    try {
      await navigator.clipboard.writeText(value);
      if (version === renderVersion) el("feedback").textContent = "Character copied.";
    } catch {
      if (version !== renderVersion) return;
      const field = el("fallback"); field.hidden = false; field.value = value; field.focus(); field.select();
      el("feedback").textContent = "The character is selected for copying.";
    }
  });
  filter();
  const entry = url.get("emoji");
  const position = entry ? results.findIndex(item => item.id === entry) : -1;
  if (position >= 0) { page = Math.floor(position / pageSize); draw(entry); }
})();
