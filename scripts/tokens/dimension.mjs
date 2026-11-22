export function dimension(brand, geometry, name) {
  const reference = geometry[name] ?? name;
  const value = typeof reference === "number" ? reference :
    reference.split(".").reduce((group, key) => group?.[key], brand);
  if (!Number.isFinite(value)) throw Error(`Unknown design dimension ${name}.`);
  return value;
}
