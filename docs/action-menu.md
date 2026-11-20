# Action menu

Use a menu for related secondary commands on the current item. A select fits a persistent choice such as a filter. Give a primary or consequential action its own visible entry. The playbook uses a menu to navigate to the selected pattern’s component choices and review checks. [Try the menu](https://yogurt-theta.vercel.app/playbook.html#usage)

## Use the plain web control

Load the existing components stylesheet and the menu stylesheet, followed by the classic script. Mount the menu after its markup exists. Keep trigger and list in the same root and give every list a unique ID. The menu dispatches a `yogurt-menu-select` event with the selected item’s `data-value`. The caller owns any resulting action. The returned function removes listeners when a host unmounts the component.

```html
<link rel="stylesheet" href="styles/components.css">
<link rel="stylesheet" href="styles/action-menu.css">
<div class="boa-surface">
  <div class="yg-menu" id="record-actions">
    <button class="boa-button" type="button" data-kind="secondary"
      data-menu-trigger aria-haspopup="menu"
      aria-controls="record-options" aria-expanded="false">Record options</button>
    <div id="record-options" role="menu" aria-label="Record options" hidden>
      <button type="button" role="menuitem" tabindex="-1" data-value="details">Show details</button>
    </div>
  </div>
</div>
<script src="apps/guide/runtime/action-menu.js"></script>
<script>
  const menu = document.getElementById("record-actions");
  const unmount = window.yogurtActionMenu.mount(menu);
  menu.addEventListener("yogurt-menu-select", event => {
    if (event.detail === "details") document.getElementById("detail").open = true;
  });
</script>
<details id="detail"><summary>Record details</summary>Revision 42</details>
```

## States, keys and evidence

The pressed trigger changes contrast. Opening focuses the first enabled item, or the last when opened with Arrow Up. Up, Down, Home and End move focus. Typing a prefix finds an item. Escape returns focus to the trigger. Tab exits the menu in document order. An outside click dismisses it. Choosing an item restores trigger focus before dispatch so the caller can direct focus to a new destination.

The local example uses a 140 ms entrance with a four-pixel travel. With reduced motion it opens immediately. Dismissal is immediate in both modes. The menu has a visible focus indicator and supports a 44 px item on coarse pointers. Native behavior and timing need a native implementation and a separate platform check. [Web behavior](../apps/guide/runtime/action-menu.js) · [Styles](../styles/action-menu.css) · [WAI-ARIA menu button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/)

[Watch the recorded web interaction](../examples/project-use/menu-rehearsal.webm) · [Compare the motion frames](../examples/project-use/menu-frames.png)
