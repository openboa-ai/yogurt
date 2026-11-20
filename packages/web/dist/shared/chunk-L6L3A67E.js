"use client";
import {
  Button
} from "./chunk-P4D5QO3L.js";
import {
  Icon,
  Text
} from "./chunk-3EP3O3HY.js";

// packages/web/src/patterns/project-workspace.tsx
import { useId } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
var resourceLabels = {
  file: "File",
  page: "Page",
  image: "Image",
  media: "Media",
  link: "Link",
  app: "Connected app",
  output: "Saved output"
};
var resourceIcons = {
  file: "copy",
  page: "copy",
  image: "info",
  media: "info",
  link: "arrow",
  app: "menu",
  output: "check"
};
function RowBody({
  label,
  describedBy,
  selected,
  onOpen,
  children
}) {
  if (!onOpen) return /* @__PURE__ */ jsx("div", { className: "yg-workspace-row-body", children });
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      className: "yg-workspace-row-body",
      "aria-label": label,
      "aria-describedby": describedBy,
      "aria-current": selected || void 0,
      onClick: onOpen,
      children
    }
  );
}
function ResourceRow({
  resource,
  selected = false,
  onOpen,
  onPinChange
}) {
  const kind = resourceLabels[resource.kind];
  const detailId = useId();
  return /* @__PURE__ */ jsxs("li", { className: "yg-workspace-row yg-resource-row", "data-selected": selected, children: [
    /* @__PURE__ */ jsxs(
      RowBody,
      {
        label: "Open " + resource.title + ", " + kind,
        describedBy: resource.detail ? detailId : void 0,
        selected,
        onOpen: onOpen && (() => onOpen(resource.id)),
        children: [
          /* @__PURE__ */ jsx("span", { className: "yg-resource-kind", children: /* @__PURE__ */ jsx(Icon, { name: resourceIcons[resource.kind] }) }),
          /* @__PURE__ */ jsxs("span", { className: "yg-workspace-row-copy", children: [
            /* @__PURE__ */ jsx("span", { className: "yg-workspace-row-title", children: resource.title }),
            /* @__PURE__ */ jsxs(Text, { variant: "help", children: [
              kind,
              resource.detail && /* @__PURE__ */ jsxs("span", { id: detailId, children: [
                " \xB7 ",
                resource.detail
              ] })
            ] })
          ] })
        ]
      }
    ),
    onPinChange && /* @__PURE__ */ jsxs(
      Button,
      {
        size: "compact",
        emphasis: "quiet",
        "aria-label": "Pin " + resource.title,
        "aria-pressed": Boolean(resource.pinned),
        onClick: () => onPinChange(resource.id, !resource.pinned),
        children: [
          resource.pinned && /* @__PURE__ */ jsx(Icon, { name: "check" }),
          "Pin"
        ]
      }
    )
  ] });
}
function ThreadRow({
  thread,
  selected = false,
  onOpen
}) {
  const detailId = useId();
  const timeId = useId();
  const describedBy = [thread.preview && detailId, thread.updatedAt && timeId].filter(Boolean).join(" ");
  return /* @__PURE__ */ jsx("li", { className: "yg-workspace-row yg-thread-row", "data-selected": selected, children: /* @__PURE__ */ jsxs(
    RowBody,
    {
      label: "Open " + thread.title + (thread.unread ? ", unread" : ""),
      describedBy: describedBy || void 0,
      selected,
      onOpen: onOpen && (() => onOpen(thread.id)),
      children: [
        /* @__PURE__ */ jsxs("span", { className: "yg-workspace-row-copy", children: [
          /* @__PURE__ */ jsx("span", { className: "yg-workspace-row-title", children: thread.title }),
          thread.preview && /* @__PURE__ */ jsx(Text, { id: detailId, variant: "help", children: thread.preview })
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "yg-thread-meta", children: [
          thread.updatedAt && /* @__PURE__ */ jsx("time", { id: timeId, dateTime: thread.updatedAt.dateTime, children: thread.updatedAt.label }),
          thread.unread && /* @__PURE__ */ jsx(Text, { variant: "meta", className: "yg-thread-unread", children: "Unread" })
        ] })
      ]
    }
  ) });
}

export {
  resourceLabels,
  ResourceRow,
  ThreadRow
};
