(() => {
  const root = document.getElementById("openboa-signature-choice");
  const table = root.querySelector(".s-options");
  const confirm = root.querySelector("[data-confirm]");
  const message = root.querySelector('[role="status"]');
  const codes = Object.keys(signatureOptions);
  const widest = Math.max(signatureReference.width, ...Object.values(signatureOptions).map(option => option.width));
  let active;

  function asset(code) {
    return code === "current" ? "620.svg" : code + ".svg";
  }
  function equalCap(image, width, display = false) {
    const fraction = (width / widest * 100).toFixed(4) + "%";
    image.style.width = display ? "min(" + fraction + ", " + (width * .98).toFixed(2) + "px)" : fraction;
  }
  function ratio(option) { return option.ratio.toFixed(2) + "×"; }

  for (const code of codes) {
    const option = signatureOptions[code];
    const button = document.createElement("button");
    button.className = "s-pick";
    button.type = "button";
    button.dataset.pick = code;
    button.setAttribute("aria-label", "B2 wordmark weight " + code);
    button.setAttribute("aria-pressed", "false");
    const label = document.createElement("span");
    label.textContent = code;
    const thumb = document.createElement("span");
    thumb.className = "s-thumb";
    const image = document.createElement("img");
    image.src = asset(code);
    image.alt = "";
    equalCap(image, option.width);
    thumb.append(image);
    const header = image.cloneNode();
    header.removeAttribute("style");
    header.className = "s-small";
    header.width = 160;
    button.append(label, thumb, header);
    table.append(button);
  }
  const current = root.querySelector("[data-current]");
  current.src = asset("current");
  equalCap(current, signatureReference.width, true);
  function show(code) {
    active = Object.hasOwn(signatureOptions, code) ? String(code) : "760";
    const option = signatureOptions[active];
    for (const button of table.querySelectorAll("button")) button.setAttribute("aria-pressed", String(button.dataset.pick === active));
    const large = root.querySelector("[data-large]");
    large.src = asset(active);
    equalCap(large, option.width, true);
    large.alt = "OpenBoa B2 with a " + active + " wordmark";
    root.querySelector("[data-header]").src = asset(active);
    root.querySelector("[data-code]").textContent = active;
    root.querySelector("[data-metrics]").textContent = "B2 · " + ratio(option) + " cap height";
    root.querySelector("[data-weights]").textContent = "Headline " + option.headline + " · Body " + option.body + " · UI " + option.label;
    root.style.setProperty("--study-head", option.headline);
    root.style.setProperty("--study-body", option.body);
    root.style.setProperty("--study-ui", option.label);
    confirm.textContent = "Copy weight " + active;
    message.textContent = "";
  }
  function preview(code) {
    show(code);
    location.hash = active;
  }
  table.addEventListener("click", event => {
    const button = event.target.closest("[data-pick]");
    if (button) preview(button.dataset.pick);
  });
  table.addEventListener("keydown", event => {
    const offset = {ArrowLeft:-1, ArrowRight:1, ArrowUp:-1, ArrowDown:1}[event.key];
    const origin = event.target.closest("[data-pick]");
    if (!offset || !origin) return;
    event.preventDefault();
    const next = codes[(codes.indexOf(origin.dataset.pick) + offset + codes.length) % codes.length];
    table.querySelector('[data-pick="' + next + '"]').focus();
    preview(next);
  });
  show(location.hash.slice(1));
  window.addEventListener("hashchange", () => show(location.hash.slice(1)));
  confirm.addEventListener("click", async () => {
    const choice = active;
    try {
      await navigator.clipboard.writeText(choice);
      message.textContent = "Copied " + choice + ".";
    } catch { message.textContent = "Wordmark weight " + choice + "."; }
  });
})();
