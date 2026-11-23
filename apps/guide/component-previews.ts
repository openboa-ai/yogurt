import motionCatalog from "../../catalog/motion-components.json";

const variants: Readonly<Record<string, Readonly<Record<string, string | null>>>> = {
  "input-otp": { otp: null },
  tabs: { "tab-pill": null, "smooth-tabs": null, "bottom-bar": null },
  "segmented-control": { "segmented-control": null },
  switch: { "toggle-switch": null },
  "sidebar-layout": { "sidebar-collapse": null },
  command: { "command-palette": null, "command-button": null },
  "action-menu": { "dynamic-menu": null },
  "text-field": { "spring-input": null },
  stepper: { "step-progress": null, "agent-steps": null },
  "toast-stack": { notifications: null },
  "radio-group": { "focus-options": "FocusPicker", "plan-options": "PlanSwitch" },
  select: { "spring-dropdown": null },
  slider: { "range-slider": "RangeSlider", "elastic-slider": "RangeSlider" },
  tooltip: { "tooltip-detail": "MorphTooltip" },
};

export const componentPreviews = Object.fromEntries(
  Object.entries(variants).map(([component, previews]) => [component, Object.keys(previews)]),
);

export function previewExport(component: string, preview: string) {
  return variants[component]?.[preview];
}

const owners = new Map(Object.entries(componentPreviews)
  .flatMap(([component, previews]) => previews.map(preview => [preview, component] as const)));

export const componentAliases = new Map(motionCatalog.components.flatMap(({ id, examples }) => {
  const preview = examples.find(example => owners.has(example));
  const component = preview && owners.get(preview);
  return component && preview ? [[id, { component, preview }] as const] : [];
}));

export const motionDestinations = new Map(motionCatalog.components.flatMap(({ id, examples }) =>
  examples.map(example => [example, id] as const)));
for (const [example, id] of owners) motionDestinations.set(example, id);

export const legacyMotionPreviews: Readonly<Record<string, string>> = {
  "focus-mode": "focus-options",
  "plan-switch": "plan-options",
};
