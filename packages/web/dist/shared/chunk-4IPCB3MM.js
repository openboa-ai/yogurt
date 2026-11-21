"use client";
import {
  Icon,
  Inline,
  cx
} from "./chunk-GW3HPY4O.js";

// packages/web/src/controls/actions.tsx
import { Button as SDKButton } from "@ui-sdk/react/button";
import { jsx, jsxs } from "react/jsx-runtime";
function Button({
  emphasis = "filled",
  tone = "neutral",
  size = "regular",
  shape = "rounded",
  pending = false,
  pendingLabel,
  children,
  type = "button",
  className,
  onClick,
  ...props
}) {
  const blocked = pending || props["aria-disabled"] === true || props["aria-disabled"] === "true";
  const hasPendingLabel = Boolean(pendingLabel);
  return /* @__PURE__ */ jsx(
    SDKButton,
    {
      ...props,
      type,
      className: cx("yg-button", className),
      "data-emphasis": emphasis,
      "data-tone": tone,
      "data-control-size": size,
      "data-shape": shape,
      "aria-disabled": blocked || props.disabled || void 0,
      "aria-busy": pending || void 0,
      onClick: (event) => {
        if (blocked) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      },
      children: /* @__PURE__ */ jsx("span", { className: "yg-button-inner", children: /* @__PURE__ */ jsxs("span", { className: "yg-button-label", children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            className: "yg-button-content",
            "aria-hidden": pending && hasPendingLabel ? true : void 0,
            children
          }
        ),
        (hasPendingLabel || pending) && /* @__PURE__ */ jsxs(
          "span",
          {
            className: "yg-button-pending",
            "data-has-label": hasPendingLabel || void 0,
            "aria-hidden": !pending || !hasPendingLabel ? true : void 0,
            children: [
              /* @__PURE__ */ jsx("span", { className: "yg-spinner", "aria-hidden": "true" }),
              pendingLabel
            ]
          }
        )
      ] }) })
    }
  );
}
function IconButton({
  label,
  icon,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Button,
    {
      emphasis: "quiet",
      ...props,
      "aria-label": label,
      className: cx("yg-icon-button", props.className),
      children: /* @__PURE__ */ jsx(Icon, { name: icon })
    }
  );
}
function ButtonGroup({
  label,
  children
}) {
  return /* @__PURE__ */ jsx(Inline, { role: "group", "aria-label": label, children });
}
function BottomAction({
  children,
  label = "Actions",
  fixed = false
}) {
  return /* @__PURE__ */ jsx("div", { className: "yg-bottom-action", "data-fixed": fixed || void 0, role: "group", "aria-label": label, children });
}

export {
  Button,
  IconButton,
  ButtonGroup,
  BottomAction
};
