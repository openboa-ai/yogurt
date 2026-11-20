(() => {
  const mounted = new WeakMap();
  function mount(root) {
    if (mounted.has(root)) return mounted.get(root);
    const trigger = root.querySelector("[data-menu-trigger]");
    const menu = root.querySelector('[role="menu"]');
    const doc = root.ownerDocument;
    if (!trigger || !menu || !menu.id || trigger.getAttribute("aria-controls") !== menu.id) {
      throw new Error("A menu trigger must name its menu with aria-controls.");
    }
    const controller = new AbortController();
    const options = { signal: controller.signal };
    const items = () => [...menu.querySelectorAll('[role="menuitem"]:not([disabled]):not([aria-disabled="true"])')];
    let prefix = "";
    let lastKeyAt = 0;
    function open(last = false) {
      const entries = items();
      if (!entries.length) return;
      menu.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      entries[last ? entries.length - 1 : 0].focus();
    }
    function close(restore = false) {
      if (menu.hidden) return;
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      prefix = "";
      if (restore) trigger.focus();
    }
    trigger.addEventListener("click", () => menu.hidden ? open() : close(true), options);
    trigger.addEventListener("keydown", event => {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      event.preventDefault();
      open(event.key === "ArrowUp");
    }, options);
    menu.addEventListener("keydown", event => {
      if (event.key === "Tab") { close(true); return; }
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        close(true);
        return;
      }
      const list = items();
      if (!list.length) return;
      const current = list.indexOf(doc.activeElement);
      const targets = {
        ArrowDown: (current + 1) % list.length,
        ArrowUp: (current - 1 + list.length) % list.length,
        Home: 0,
        End: list.length - 1
      };
      if (Object.hasOwn(targets, event.key)) {
        event.preventDefault();
        list[targets[event.key]].focus();
      } else if (event.key.length === 1 && event.key.trim() && !event.altKey && !event.ctrlKey && !event.metaKey) {
        const now = Date.now();
        const key = event.key.toLocaleLowerCase();
        prefix = now - lastKeyAt > 600 || prefix === key ? key : prefix + key;
        lastKeyAt = now;
        const ordered = [...list.slice(current + 1), ...list.slice(0, current + 1)];
        const match = ordered.find(item => item.textContent.trim().toLocaleLowerCase().startsWith(prefix));
        if (match) { event.preventDefault(); match.focus(); }
      }
    }, options);
    menu.addEventListener("click", event => {
      const item = event.target.closest('[role="menuitem"]');
      if (!items().includes(item)) return;
      close(true);
      root.dispatchEvent(new CustomEvent("yogurt-menu-select", { bubbles: true, detail: item.dataset.value }));
    }, options);
    doc.addEventListener("pointerdown", event => { if (!root.contains(event.target)) close(); }, options);
    doc.addEventListener("focusin", event => { if (!root.contains(event.target)) close(); }, options);
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    const dispose = () => { close(menu.contains(doc.activeElement)); controller.abort(); mounted.delete(root); };
    mounted.set(root, dispose);
    return dispose;
  }
  window.yogurtActionMenu = { mount };
})();
