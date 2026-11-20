"use client";
import {
  Icon,
  Inline,
  __commonJS,
  __toESM,
  cx
} from "./chunk-3EP3O3HY.js";

// node_modules/lodash.debounce/index.js
var require_lodash = __commonJS({
  "node_modules/lodash.debounce/index.js"(exports, module) {
    var FUNC_ERROR_TEXT = "Expected a function";
    var NAN = 0 / 0;
    var symbolTag = "[object Symbol]";
    var reTrim = /^\s+|\s+$/g;
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
    var reIsBinary = /^0b[01]+$/i;
    var reIsOctal = /^0o[0-7]+$/i;
    var freeParseInt = parseInt;
    var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    var objectProto = Object.prototype;
    var objectToString = objectProto.toString;
    var nativeMax = Math.max;
    var nativeMin = Math.min;
    var now = function() {
      return root.Date.now();
    };
    function debounce2(func, wait, options) {
      var lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
      if (typeof func != "function") {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      wait = toNumber(wait) || 0;
      if (isObject(options)) {
        leading = !!options.leading;
        maxing = "maxWait" in options;
        maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
        trailing = "trailing" in options ? !!options.trailing : trailing;
      }
      function invokeFunc(time) {
        var args = lastArgs, thisArg = lastThis;
        lastArgs = lastThis = void 0;
        lastInvokeTime = time;
        result = func.apply(thisArg, args);
        return result;
      }
      function leadingEdge(time) {
        lastInvokeTime = time;
        timerId = setTimeout(timerExpired, wait);
        return leading ? invokeFunc(time) : result;
      }
      function remainingWait(time) {
        var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, result2 = wait - timeSinceLastCall;
        return maxing ? nativeMin(result2, maxWait - timeSinceLastInvoke) : result2;
      }
      function shouldInvoke(time) {
        var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
        return lastCallTime === void 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
      }
      function timerExpired() {
        var time = now();
        if (shouldInvoke(time)) {
          return trailingEdge(time);
        }
        timerId = setTimeout(timerExpired, remainingWait(time));
      }
      function trailingEdge(time) {
        timerId = void 0;
        if (trailing && lastArgs) {
          return invokeFunc(time);
        }
        lastArgs = lastThis = void 0;
        return result;
      }
      function cancel() {
        if (timerId !== void 0) {
          clearTimeout(timerId);
        }
        lastInvokeTime = 0;
        lastArgs = lastCallTime = lastThis = timerId = void 0;
      }
      function flush() {
        return timerId === void 0 ? result : trailingEdge(now());
      }
      function debounced() {
        var time = now(), isInvoking = shouldInvoke(time);
        lastArgs = arguments;
        lastThis = this;
        lastCallTime = time;
        if (isInvoking) {
          if (timerId === void 0) {
            return leadingEdge(lastCallTime);
          }
          if (maxing) {
            timerId = setTimeout(timerExpired, wait);
            return invokeFunc(lastCallTime);
          }
        }
        if (timerId === void 0) {
          timerId = setTimeout(timerExpired, wait);
        }
        return result;
      }
      debounced.cancel = cancel;
      debounced.flush = flush;
      return debounced;
    }
    function isObject(value) {
      var type = typeof value;
      return !!value && (type == "object" || type == "function");
    }
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    function isSymbol(value) {
      return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
    }
    function toNumber(value) {
      if (typeof value == "number") {
        return value;
      }
      if (isSymbol(value)) {
        return NAN;
      }
      if (isObject(value)) {
        var other = typeof value.valueOf == "function" ? value.valueOf() : value;
        value = isObject(other) ? other + "" : other;
      }
      if (typeof value != "string") {
        return value === 0 ? value : +value;
      }
      value = value.replace(reTrim, "");
      var isBinary = reIsBinary.test(value);
      return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
    }
    module.exports = debounce2;
  }
});

// node_modules/@openai/apps-sdk-ui/dist/es/components/Button/Button.js
import { jsx as _jsx6, jsxs as _jsxs3 } from "react/jsx-runtime";

// node_modules/clsx/dist/clsx.mjs
function r(e) {
  var t, f, n = "";
  if ("string" == typeof e || "number" == typeof e) n += e;
  else if ("object" == typeof e) if (Array.isArray(e)) {
    var o2 = e.length;
    for (t = 0; t < o2; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
  } else for (f in e) e[f] && (n && (n += " "), n += f);
  return n;
}
function clsx() {
  for (var e, t, f = 0, n = "", o2 = arguments.length; f < o2; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
  return n;
}
var clsx_default = clsx;

// node_modules/@openai/apps-sdk-ui/dist/es/components/Button/Button.js
import { useCallback as useCallback4 } from "react";

// node_modules/@openai/apps-sdk-ui/dist/es/lib/helpers.js
import {} from "react";

// node_modules/@openai/apps-sdk-ui/dist/es/lib/environment.js
var META_ENV = typeof import.meta !== "undefined" ? import.meta.env : void 0;
var NODE_ENV = typeof process !== "undefined" && "development" ? "development" : "production";
var isDev = NODE_ENV === "development" || !!META_ENV?.DEV;
var isJSDomLike = typeof navigator !== "undefined" && /(jsdom|happy-dom)/i.test(navigator.userAgent) || typeof globalThis.happyDOM === "object";
var isTest = NODE_ENV === "test" || META_ENV?.MODE === "test" || isJSDomLike;
var hasWindow = typeof window !== "undefined";
var hasDocument = typeof document !== "undefined";
var canUseDOM = hasWindow && hasDocument;

// node_modules/@openai/apps-sdk-ui/dist/es/lib/helpers.js
var handlePressableMouseEnter = (evt) => {
  const target = evt.currentTarget;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  const elementWidth = target.offsetWidth;
  let scale = 0.985;
  if (elementWidth <= 80) {
    scale = 0.96;
  } else if (elementWidth <= 150) {
    scale = 0.97;
  } else if (elementWidth <= 220) {
    scale = 0.98;
  } else if (elementWidth > 600) {
    scale = 0.995;
  }
  target.style.setProperty("--scale", scale.toString());
};
var waitForAnimationFrame = (cb, options) => {
  const runAfterTick = () => {
    const id = setTimeout(cb);
    return () => {
      clearTimeout(id);
    };
  };
  if (!canUseDOM || typeof window.requestAnimationFrame !== "function") {
    return runAfterTick();
  }
  const visibilityHidden = hasDocument && document.visibilityState === "hidden";
  if (visibilityHidden) {
    return runAfterTick();
  }
  let frames = options?.frames ?? 2;
  let animationFrame = window.requestAnimationFrame(function recurse() {
    frames -= 1;
    if (frames === 0) {
      cb();
    } else {
      animationFrame = window.requestAnimationFrame(recurse);
    }
  });
  return () => {
    if (typeof window.cancelAnimationFrame === "function") {
      window.cancelAnimationFrame(animationFrame);
    }
  };
};
var toCssVariables = (variables) => {
  const formattedVariables = Object.keys(variables).reduce((acc, variable) => {
    const value = variables[variable];
    if (value || value === 0) {
      const prefix = variable.startsWith("--") ? "" : "--";
      const formattedValue = typeof value === "number" ? `${value}px` : value;
      acc[`${prefix}${variable}`] = formattedValue;
    }
    return acc;
  }, {});
  return formattedVariables;
};

// node_modules/@openai/apps-sdk-ui/dist/es/lib/renderHelpers.js
import { jsx as _jsx } from "react/jsx-runtime";
import { Children, cloneElement, isValidElement } from "react";
var flattenTextNodes = (children) => {
  const nodes = Children.toArray(children);
  const result = [];
  let buffer = "";
  const flush = () => {
    if (buffer !== "") {
      result.push(buffer);
      buffer = "";
    }
  };
  for (const node of nodes) {
    if (node == null || typeof node === "boolean") {
      continue;
    }
    if (typeof node === "string" || typeof node === "number") {
      buffer += String(node);
      continue;
    }
    flush();
    result.push(node);
  }
  flush();
  return result;
};
var wrapTextNodeSiblings = (children) => {
  const flattenedChildren = flattenTextNodes(children);
  const childrenCount = Children.count(flattenedChildren);
  return Children.map(flattenedChildren, (child) => {
    if (typeof child === "string" && !!child.trim()) {
      if (childrenCount <= 1) {
        return child;
      }
      return _jsx("span", { children: child });
    }
    if (isValidElement(child)) {
      const element = child;
      const { children: innerChildren, ...restProps } = element.props;
      if (innerChildren != null) {
        return cloneElement(element, restProps, wrapTextNodeSiblings(innerChildren));
      }
      return element;
    }
    return child;
  });
};

// node_modules/@openai/apps-sdk-ui/dist/es/components/AppsSDKUIProvider/internal.js
import { useContext } from "react";

// node_modules/@openai/apps-sdk-ui/dist/es/components/AppsSDKUIProvider/AppsSDKUIContext.js
import { createContext } from "react";
var AppsSDKUIContext = createContext(null);

// node_modules/@openai/apps-sdk-ui/dist/es/components/Indicator/CircularProgress.js
import { jsx as _jsx2, jsxs as _jsxs } from "react/jsx-runtime";
import { useState as useState3 } from "react";

// node_modules/@openai/apps-sdk-ui/dist/es/hooks/useSimulatedProgress.js
import { useState as useState2 } from "react";

// node_modules/usehooks-ts/dist/index.js
var import_lodash = __toESM(require_lodash(), 1);
import { useState, useCallback, useLayoutEffect, useEffect, useRef, useMemo } from "react";
var useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
function useIsMounted() {
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  return useCallback(() => isMounted.current, []);
}
var initialSize = {
  width: void 0,
  height: void 0
};
function useResizeObserver(options) {
  const { ref, box = "content-box" } = options;
  const [{ width, height }, setSize] = useState(initialSize);
  const isMounted = useIsMounted();
  const previousSize = useRef({ ...initialSize });
  const onResize = useRef(void 0);
  onResize.current = options.onResize;
  useEffect(() => {
    if (!ref.current)
      return;
    if (typeof window === "undefined" || !("ResizeObserver" in window))
      return;
    const observer = new ResizeObserver(([entry]) => {
      const boxProp = box === "border-box" ? "borderBoxSize" : box === "device-pixel-content-box" ? "devicePixelContentBoxSize" : "contentBoxSize";
      const newWidth = extractSize(entry, boxProp, "inlineSize");
      const newHeight = extractSize(entry, boxProp, "blockSize");
      const hasChanged = previousSize.current.width !== newWidth || previousSize.current.height !== newHeight;
      if (hasChanged) {
        const newSize = { width: newWidth, height: newHeight };
        previousSize.current.width = newWidth;
        previousSize.current.height = newHeight;
        if (onResize.current) {
          onResize.current(newSize);
        } else {
          if (isMounted()) {
            setSize(newSize);
          }
        }
      }
    });
    observer.observe(ref.current, { box });
    return () => {
      observer.disconnect();
    };
  }, [box, ref, isMounted]);
  return { width, height };
}
function extractSize(entry, box, sizeType) {
  if (!entry[box]) {
    if (box === "contentBoxSize") {
      return entry.contentRect[sizeType === "inlineSize" ? "width" : "height"];
    }
    return void 0;
  }
  return Array.isArray(entry[box]) ? entry[box][0][sizeType] : (
    // @ts-ignore Support Firefox's non-standard behavior
    entry[box][sizeType]
  );
}
function useTimeout(callback, delay) {
  const savedCallback = useRef(callback);
  useIsomorphicLayoutEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  useEffect(() => {
    if (!delay && delay !== 0) {
      return;
    }
    const id = setTimeout(() => {
      savedCallback.current();
    }, delay);
    return () => {
      clearTimeout(id);
    };
  }, [delay]);
}

// node_modules/@openai/apps-sdk-ui/dist/es/components/Indicator/LoadingDots.js
import { jsx as _jsx3, jsxs as _jsxs2 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Indicator/LoadingIndicator.js
import { jsx as _jsx4 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Indicator/LoadingIndicator.module.css
var LoadingIndicator_default = { "LoadingIndicator": "yg-sdk-LoadingIndicator-LoadingIndicator" };

// node_modules/@openai/apps-sdk-ui/dist/es/components/Indicator/LoadingIndicator.js
var LoadingIndicator = ({ className, size, strokeWidth, style, ...restProps }) => {
  return _jsx4("div", { ...restProps, className: clsx_default(LoadingIndicator_default.LoadingIndicator, className), style: style || toCssVariables({
    "indicator-size": size,
    "indicator-stroke": strokeWidth
  }) });
};

// node_modules/@openai/apps-sdk-ui/dist/es/components/Transition/TransitionGroup.js
import { jsx as _jsx5, Fragment as _Fragment } from "react/jsx-runtime";
import React2, { Children as Children3, useCallback as useCallback3, useEffect as useEffect2, useLayoutEffect as useLayoutEffect2, useReducer, useRef as useRef3, useState as useState4 } from "react";

// node_modules/react-merge-refs/dist/index.mjs
function o(f) {
  return (r2) => {
    f.forEach((n) => {
      typeof n == "function" ? n(r2) : n != null && (n.current = r2);
    });
  };
}

// node_modules/@openai/apps-sdk-ui/dist/es/components/Transition/getDisableAnimations.js
var getDisableAnimations_default = () => isTest;

// node_modules/@openai/apps-sdk-ui/dist/es/components/Transition/shared.js
import React, { Children as Children2, useCallback as useCallback2, useRef as useRef2 } from "react";
var ChildrenWithKeys = (children, shouldThrow = false, componentName = "TransitionGroup") => {
  const validChildren = [];
  Children2.forEach(children, (child) => {
    if (child && typeof child === "object" && "key" in child && !!child.key) {
      validChildren.push(child);
    } else if (shouldThrow) {
      throw new Error(`Child elements of <${componentName} /> must include a \`key\``);
    }
  });
  return validChildren;
};
var noop = () => {
};
var useChildCallback = (cb) => {
  const ref = useRef2(cb);
  ref.current = cb;
  return useCallback2((element) => ref.current(element), []);
};
function computeNextRenderChildren(propChildrenArray, currentRenderChildren, createDefaultRenderChildProps, insertMethod) {
  const propChildKeyMap = propChildrenArray.reduce((acc, child) => ({ ...acc, [child.key]: 1 }), {});
  const currentRenderChildKeyMap = currentRenderChildren.reduce((acc, child) => ({ ...acc, [child.component.key]: 1 }), {});
  const newRenderChildren = propChildrenArray.filter((propChild) => !currentRenderChildKeyMap[propChild.key]).map(createDefaultRenderChildProps);
  const updatedCurrentChildren = currentRenderChildren.map((childProps) => ({
    ...childProps,
    component: propChildrenArray.find(({ key }) => key === childProps.component.key) || childProps.component,
    shouldRender: !!propChildKeyMap[childProps.component.key]
  }));
  return insertMethod === "append" ? updatedCurrentChildren.concat(newRenderChildren) : newRenderChildren.concat(updatedCurrentChildren);
}
function assertSingleChildWhenRef(componentName, ref, childrenCount) {
  if ((isTest || isDev) && ref && childrenCount > 1) {
    throw new Error(`Cannot use forwardRef with multiple children in <${componentName} />`);
  }
}

// node_modules/@openai/apps-sdk-ui/dist/es/components/Transition/TransitionGroup.module.css
var TransitionGroup_default = { "TransitionGroupChild": "yg-sdk-TransitionGroup-TransitionGroupChild" };

// node_modules/@openai/apps-sdk-ui/dist/es/components/Transition/transitionReducer.js
var RESTING_TRANSITION_STATE = {
  enter: false,
  enterActive: false,
  exit: false,
  exitActive: false,
  interrupted: false
};
var getInitialTransitionState = (preventMountTransition) => ({
  ...RESTING_TRANSITION_STATE,
  enter: !preventMountTransition
});
var transitionReducer = (state, action) => {
  switch (action.type) {
    case "enter-before":
      return {
        enter: true,
        enterActive: false,
        exit: false,
        exitActive: false,
        interrupted: state.interrupted || state.exit
      };
    case "enter-active":
      return {
        enter: true,
        enterActive: true,
        exit: false,
        exitActive: false,
        interrupted: false
      };
    case "exit-before":
      return {
        enter: false,
        enterActive: false,
        exit: true,
        exitActive: false,
        interrupted: state.interrupted || state.enter
      };
    case "exit-active":
      return {
        enter: false,
        enterActive: false,
        exit: true,
        exitActive: true,
        interrupted: false
      };
    case "done":
    default:
      return RESTING_TRANSITION_STATE;
  }
};

// node_modules/@openai/apps-sdk-ui/dist/es/components/Transition/TransitionGroup.js
var TransitionGroupChildInner = ({ ref: forwardedRef, as: TagName, children, className, transitionId, style, preventMountTransition, shouldRender, enterDuration, exitDuration, removeChild, onEnter, onEnterActive, onEnterComplete, onExit, onExitActive, onExitComplete }) => {
  const [state, dispatch] = useReducer(transitionReducer, getInitialTransitionState(preventMountTransition || false));
  const preventedMountTransition = useRef3(false);
  const elementRef = useRef3(null);
  const enterDurationRef = useRef3(enterDuration);
  enterDurationRef.current = enterDuration;
  const exitDurationRef = useRef3(exitDuration);
  exitDurationRef.current = exitDuration;
  const lastCallbackRef = useRef3(null);
  const triggerCallback = useCallback3((callbackType) => {
    const element = elementRef.current;
    if (!element || callbackType === lastCallbackRef.current) {
      return;
    }
    lastCallbackRef.current = callbackType;
    switch (callbackType) {
      case "enter":
        onEnter(element);
        break;
      case "enter-active":
        onEnterActive(element);
        break;
      case "enter-complete":
        onEnterComplete(element);
        break;
      case "exit":
        onExit(element);
        break;
      case "exit-active":
        onExitActive(element);
        break;
      case "exit-complete":
        onExitComplete(element);
        break;
      default:
        callbackType;
        break;
    }
  }, [onEnter, onEnterActive, onEnterComplete, onExit, onExitActive, onExitComplete]);
  React2.useLayoutEffect(() => {
    if (!shouldRender) {
      let exitTimeout;
      dispatch({ type: "exit-before" });
      triggerCallback("exit");
      const cancelAnimationFrame2 = waitForAnimationFrame(() => {
        dispatch({ type: "exit-active" });
        triggerCallback("exit-active");
        exitTimeout = window.setTimeout(() => {
          triggerCallback("exit-complete");
          removeChild();
        }, exitDurationRef.current);
      });
      return () => {
        cancelAnimationFrame2();
        if (exitTimeout !== void 0)
          clearTimeout(exitTimeout);
      };
    }
    if (preventMountTransition && !preventedMountTransition.current) {
      preventedMountTransition.current = true;
      return;
    }
    let enterTimeout;
    dispatch({ type: "enter-before" });
    triggerCallback("enter");
    const cancelAnimationFrame = waitForAnimationFrame(() => {
      dispatch({ type: "enter-active" });
      triggerCallback("enter-active");
      enterTimeout = window.setTimeout(() => {
        dispatch({ type: "done" });
        triggerCallback("enter-complete");
      }, enterDurationRef.current);
    });
    return () => {
      cancelAnimationFrame();
      if (enterTimeout !== void 0)
        clearTimeout(enterTimeout);
    };
  }, [
    shouldRender,
    // This value is immutable after <TransitionGroup> is created, and does not change on re-renders.
    preventMountTransition,
    removeChild,
    triggerCallback
  ]);
  useEffect2(() => {
    return () => {
      preventedMountTransition.current = false;
    };
  }, []);
  return _jsx5(TagName, { ref: o([elementRef, forwardedRef]), className: clsx_default(className, TransitionGroup_default.TransitionGroupChild), "data-transition-id": transitionId, style, "data-entering": state.enter ? "" : void 0, "data-entering-active": state.enterActive ? "" : void 0, "data-exiting": state.exit ? "" : void 0, "data-exiting-active": state.exitActive ? "" : void 0, "data-interrupted": state.interrupted ? "" : void 0, children });
};
var TransitionGroupChild = (props) => {
  const { enterMountDelay, preventMountTransition } = props;
  const mountDelay = !preventMountTransition && enterMountDelay != null ? enterMountDelay : null;
  const [mounted, setMounted] = useState4(mountDelay == null);
  useTimeout(() => setMounted(true), mounted ? null : mountDelay);
  return mounted ? _jsx5(TransitionGroupChildInner, { ...props }) : null;
};
var TransitionGroup = (props) => {
  const { ref: forwardedRef, as: TagName = "span", children, className, transitionId, style, enterDuration = 0, exitDuration = 0, preventInitialTransition = true, enterMountDelay, insertMethod = "append", disableAnimations = getDisableAnimations_default() } = props;
  const onEnter = useChildCallback(props.onEnter ?? noop);
  const onEnterActive = useChildCallback(props.onEnterActive ?? noop);
  const onEnterComplete = useChildCallback(props.onEnterComplete ?? noop);
  const onExit = useChildCallback(props.onExit ?? noop);
  const onExitActive = useChildCallback(props.onExitActive ?? noop);
  const onExitComplete = useChildCallback(props.onExitComplete ?? noop);
  Children3.forEach(children, (child) => {
    if (child && !child.key) {
      throw new Error("Child elements of <TransitionGroup /> must include a `key`");
    }
  });
  const createDefaultRenderChildProps = useCallback3((child) => ({
    component: child,
    shouldRender: true,
    removeChild: () => {
      setRenderChildren((currentRenderChildren) => currentRenderChildren.filter((c) => child.key !== c.component.key));
    },
    onEnter,
    onEnterActive,
    onEnterComplete,
    onExit,
    onExitActive,
    onExitComplete
  }), [onEnter, onEnterActive, onEnterComplete, onExit, onExitActive, onExitComplete]);
  const [renderChildren, setRenderChildren] = useState4(() => {
    return ChildrenWithKeys(children).map((child) => ({
      ...createDefaultRenderChildProps(child),
      // Lock this value to whatever the value was on initial render of the TransitionGroup.
      // It doesn't make sense to change this once it is mounted.
      preventMountTransition: preventInitialTransition
    }));
  });
  useLayoutEffect2(() => {
    setRenderChildren((currentRenderChildren) => {
      const propChildrenArray = ChildrenWithKeys(children);
      return computeNextRenderChildren(propChildrenArray, currentRenderChildren, createDefaultRenderChildProps, insertMethod);
    });
  }, [children, insertMethod, createDefaultRenderChildProps]);
  assertSingleChildWhenRef("TransitionGroup", forwardedRef, Children3.count(children));
  if (disableAnimations) {
    return _jsx5(_Fragment, { children: Children3.map(children, (child) => _jsx5(
      TagName,
      {
        // @ts-expect-error -- TS is not happy about this forwardedRef, but it's fine.
        ref: forwardedRef,
        className,
        style,
        "data-transition-id": transitionId,
        children: child
      }
    )) });
  }
  return _jsx5(_Fragment, { children: renderChildren.map(({ component, ...restProps }) => _jsx5(TransitionGroupChild, { ...restProps, as: TagName, className, transitionId, enterDuration, exitDuration, enterMountDelay, style, ref: forwardedRef, children: component }, component.key)) });
};

// node_modules/@openai/apps-sdk-ui/dist/es/components/Button/Button.module.css
var Button_default = { "Button": "yg-sdk-Button-Button", "ButtonInner": "yg-sdk-Button-ButtonInner", "ButtonLoader": "yg-sdk-Button-ButtonLoader", "Kbd": "yg-sdk-Button-Kbd" };

// node_modules/@openai/apps-sdk-ui/dist/es/components/Button/Button.js
var Button = (props) => {
  const {
    type = "button",
    color = "primary",
    variant = "solid",
    pill = true,
    uniform = false,
    size = "md",
    iconSize,
    gutterSize,
    loading,
    selected,
    block,
    opticallyAlign,
    children,
    className,
    onClick,
    disabled,
    disabledTone,
    // Defaults to `loading` state
    inert = loading,
    ...restProps
  } = props;
  const isInert = disabled || inert;
  const handleClick = useCallback4((e) => {
    if (disabled) {
      return;
    }
    onClick?.(e);
  }, [onClick, disabled]);
  return _jsxs3("button", {
    type,
    className: clsx_default(Button_default.Button, className),
    "data-color": color,
    "data-variant": variant,
    "data-pill": pill ? "" : void 0,
    "data-uniform": uniform ? "" : void 0,
    "data-size": size,
    "data-gutter-size": gutterSize,
    "data-icon-size": iconSize,
    "data-loading": loading ? "" : void 0,
    "data-selected": selected ? "" : void 0,
    "data-block": block ? "" : void 0,
    "data-optically-align": opticallyAlign,
    onPointerEnter: handlePressableMouseEnter,
    // Non-visual, accessible disablement
    // NOTE: Do not use literal `inert` because that is incorrect semantically
    disabled: isInert,
    "aria-disabled": isInert,
    tabIndex: isInert ? -1 : void 0,
    "data-disabled": disabled ? "" : void 0,
    "data-disabled-tone": disabled ? disabledTone : void 0,
    onClick: handleClick,
    ...restProps,
    children: [_jsx6(TransitionGroup, { className: Button_default.ButtonLoader, enterDuration: 250, exitDuration: 150, children: loading && _jsx6(LoadingIndicator, {}, "loader") }), _jsx6("span", { className: Button_default.ButtonInner, children: wrapTextNodeSiblings(children) })]
  });
};

// node_modules/@openai/apps-sdk-ui/dist/es/components/Button/CopyButton.js
import { jsx as _jsx756, jsxs as _jsxs230 } from "react/jsx-runtime";
import { useEffect as useEffect4, useRef as useRef6, useState as useState6 } from "react";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/AddMember.js
import { jsx as _jsx7 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/AddSources.js
import { jsx as _jsx8 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Agent.js
import { jsx as _jsx9, jsxs as _jsxs4 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/AgentMode.js
import { jsx as _jsx10, jsxs as _jsxs5 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/AllGizmos.js
import { jsx as _jsx11 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/AllProductsExplore.js
import { jsx as _jsx12, jsxs as _jsxs6 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Analytics.js
import { jsx as _jsx13 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/AnalyzeData.js
import { jsx as _jsx14, jsxs as _jsxs7 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ApiKey.js
import { jsx as _jsx15, jsxs as _jsxs8 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ApiKeyAdmin.js
import { jsx as _jsx16 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ApiKeys.js
import { jsx as _jsx17, jsxs as _jsxs9 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ApiKeyServiceAccount.js
import { jsx as _jsx18, jsxs as _jsxs10 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Archive.js
import { jsx as _jsx19 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Array.js
import { jsx as _jsx20 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ArrowBottomLeftSm.js
import { jsx as _jsx21 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ArrowBottomRightSm.js
import { jsx as _jsx22 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ArrowCurved.js
import { jsx as _jsx23 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ArrowCurvedLeft.js
import { jsx as _jsx24 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ArrowCurvedRight.js
import { jsx as _jsx25 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ArrowCurvedRightXs.js
import { jsx as _jsx26 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ArrowCurvedRightXs24px.js
import { jsx as _jsx27 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ArrowDown.js
import { jsx as _jsx28 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ArrowDownLg.js
import { jsx as _jsx29 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ArrowDownSm.js
import { jsx as _jsx30 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ArrowLeft.js
import { jsx as _jsx31 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ArrowLeftLg.js
import { jsx as _jsx32 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ArrowLeftSm.js
import { jsx as _jsx33 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ArrowRight.js
import { jsx as _jsx34 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ArrowRightLg.js
import { jsx as _jsx35 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ArrowRightSm.js
import { jsx as _jsx36 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ArrowRotateCcw.js
import { jsx as _jsx37 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ArrowRotateCw.js
import { jsx as _jsx38 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ArrowTopLeftSm.js
import { jsx as _jsx39 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ArrowTopRightSm.js
import { jsx as _jsx40 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ArrowUp.js
import { jsx as _jsx41 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ArrowUpLg.js
import { jsx as _jsx42 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ArrowUpRight.js
import { jsx as _jsx43 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ArrowUpSm.js
import { jsx as _jsx44 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/AspectRatio11.js
import { jsx as _jsx45 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/AspectRatio169.js
import { jsx as _jsx46 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/AspectRatio34.js
import { jsx as _jsx47 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/AspectRatio43.js
import { jsx as _jsx48 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/AspectRatio916.js
import { jsx as _jsx49 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Assistant.js
import { jsx as _jsx50, jsxs as _jsxs11 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Astronout.js
import { jsx as _jsx51, jsxs as _jsxs12 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Atom.js
import { jsx as _jsx52 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/AtSign.js
import { jsx as _jsx53 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Autocomplete.js
import { jsx as _jsx54, jsxs as _jsxs13 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/AutoPairApps.js
import { jsx as _jsx55 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/AutoSuggestedEdits.js
import { jsx as _jsx56, jsxs as _jsxs14 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/AvatarFilledProfile.js
import { jsx as _jsx57 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/AvatarProfile.js
import { jsx as _jsx58 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Back10s.js
import { jsx as _jsx59, jsxs as _jsxs15 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Back15s.js
import { jsx as _jsx60, jsxs as _jsxs16 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/BackgroundConversation.js
import { jsx as _jsx61 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/BackLarge.js
import { jsx as _jsx62 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/BackSmall.js
import { jsx as _jsx63 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/BackToApp.js
import { jsx as _jsx64, jsxs as _jsxs17 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/BalancingScale.js
import { jsx as _jsx65 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/BarChart.js
import { jsx as _jsx66 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/BarChartFilled.js
import { jsx as _jsx67, jsxs as _jsxs18 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Batch.js
import { jsx as _jsx68, jsxs as _jsxs19 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Batches.js
import { jsx as _jsx69, jsxs as _jsxs20 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Bell.js
import { jsx as _jsx70 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/BellFilled.js
import { jsx as _jsx71, jsxs as _jsxs21 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Beta.js
import { jsx as _jsx72 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Bills.js
import { jsx as _jsx73 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Blend.js
import { jsx as _jsx74, jsxs as _jsxs22 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/BlendingCurveSharp.js
import { jsx as _jsx75, jsxs as _jsxs23 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/BlendingCurveSmooth.js
import { jsx as _jsx76, jsxs as _jsxs24 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/BlendingCurveSubtle.js
import { jsx as _jsx77, jsxs as _jsxs25 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Bolt.js
import { jsx as _jsx78 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Book.js
import { jsx as _jsx79 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/BookBookmark.js
import { jsx as _jsx80 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/BookClock.js
import { jsx as _jsx81 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/BookClosed.js
import { jsx as _jsx82 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/BookOpen.js
import { jsx as _jsx83, jsxs as _jsxs26 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/BookWrench.js
import { jsx as _jsx84, jsxs as _jsxs27 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Boolean.js
import { jsx as _jsx85 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Brain.js
import { jsx as _jsx86 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Branch.js
import { jsx as _jsx87 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/BranchAlt.js
import { jsx as _jsx88 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Bug.js
import { jsx as _jsx89, jsxs as _jsxs28 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/BuilderProfileCard.js
import { jsx as _jsx90, jsxs as _jsxs29 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/BuildingWorkspace.js
import { jsx as _jsx91 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Business.js
import { jsx as _jsx92, jsxs as _jsxs30 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/BusinessFilled.js
import { jsx as _jsx93 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Cabinet.js
import { jsx as _jsx94 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Calendar.js
import { jsx as _jsx95 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/CalendarAlt.js
import { jsx as _jsx96 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/CalendarToday.js
import { jsx as _jsx97 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Camera.js
import { jsx as _jsx98 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/CameraFilledPhoto.js
import { jsx as _jsx99 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/CameraPhoto.js
import { jsx as _jsx100 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/CaptionCcOff.js
import { jsx as _jsx101 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/CaptionCcOn.js
import { jsx as _jsx102 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/CaptionOff.js
import { jsx as _jsx103 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/CaptionOn.js
import { jsx as _jsx104 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Card.js
import { jsx as _jsx105 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/CaretDown.js
import { jsx as _jsx106, jsxs as _jsxs31 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/CaretLeft.js
import { jsx as _jsx107, jsxs as _jsxs32 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/CaretRight.js
import { jsx as _jsx108, jsxs as _jsxs33 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/CaretUp.js
import { jsx as _jsx109, jsxs as _jsxs34 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Category.js
import { jsx as _jsx110 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Certificate.js
import { jsx as _jsx111, jsxs as _jsxs35 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Chart.js
import { jsx as _jsx112 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ChartXAxis.js
import { jsx as _jsx113 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ChartYAxis.js
import { jsx as _jsx114 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Chat.js
import { jsx as _jsx115 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ChatCompose.js
import { jsx as _jsx116 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ChatDashedCheckedTemp.js
import { jsx as _jsx117 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ChatDashedTemp.js
import { jsx as _jsx118 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Chats.js
import { jsx as _jsx119 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ChatTemporary.js
import { jsx as _jsx120 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ChatTripleDots.js
import { jsx as _jsx121, jsxs as _jsxs36 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Check.js
import { jsx as _jsx122 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/CheckCircle.js
import { jsx as _jsx123 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/CheckCircleDashed.js
import { jsx as _jsx124 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/CheckCircleFilled.js
import { jsx as _jsx125 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/CheckLg.js
import { jsx as _jsx126 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/CheckMd.js
import { jsx as _jsx127 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ChevronDown.js
import { jsx as _jsx128 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ChevronDownLg.js
import { jsx as _jsx129 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ChevronDownMd.js
import { jsx as _jsx130 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ChevronDownUp.js
import { jsx as _jsx131, jsxs as _jsxs37 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ChevronDownVector.js
import { jsx as _jsx132 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ChevronLeft.js
import { jsx as _jsx133 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ChevronLeftLg.js
import { jsx as _jsx134 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ChevronLeftMd.js
import { jsx as _jsx135 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ChevronRight.js
import { jsx as _jsx136 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ChevronRightAlt.js
import { jsx as _jsx137 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ChevronRightLg.js
import { jsx as _jsx138 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ChevronRightMd.js
import { jsx as _jsx139 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ChevronSmallDown.js
import { jsx as _jsx140 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ChevronSmallLeft.js
import { jsx as _jsx141 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ChevronSmallRight.js
import { jsx as _jsx142 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ChevronSmallUp.js
import { jsx as _jsx143 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ChevronUp.js
import { jsx as _jsx144 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ChevronUpDown.js
import { jsx as _jsx145 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ChevronUpLg.js
import { jsx as _jsx146 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ChevronUpMd.js
import { jsx as _jsx147 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Circle.js
import { jsx as _jsx148 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/CircleDashed.js
import { jsx as _jsx149 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/CircleQuestion.js
import { jsx as _jsx150, jsxs as _jsxs38 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ClappingBoardClosed.js
import { jsx as _jsx151 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ClappingBoardOpen.js
import { jsx as _jsx152 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Cleanup.js
import { jsx as _jsx153 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Clear.js
import { jsx as _jsx154 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Click.js
import { jsx as _jsx155 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Clip.js
import { jsx as _jsx156 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Clipboard.js
import { jsx as _jsx157 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ClipboardCopy.js
import { jsx as _jsx158 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Clock.js
import { jsx as _jsx159 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Clock10s.js
import { jsx as _jsx160 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Clock15s.js
import { jsx as _jsx161 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Clock20s.js
import { jsx as _jsx162 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Clock5s.js
import { jsx as _jsx163 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ClockOff.js
import { jsx as _jsx164 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/CloseBold.js
import { jsx as _jsx165 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Code.js
import { jsx as _jsx166 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/CodeSquareSlash.js
import { jsx as _jsx167 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Collapse.js
import { jsx as _jsx168 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/CollapseLarge.js
import { jsx as _jsx169 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/CollapseLeft.js
import { jsx as _jsx170 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/CollapseLg.js
import { jsx as _jsx171 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/CollapseRight.js
import { jsx as _jsx172 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/CollapseSm.js
import { jsx as _jsx173, jsxs as _jsxs39 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/CollapseSmall.js
import { jsx as _jsx174 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ColorTheme.js
import { jsx as _jsx175, jsxs as _jsxs40 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Comment.js
import { jsx as _jsx176 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Commit.js
import { jsx as _jsx177 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Compare.js
import { jsx as _jsx178, jsxs as _jsxs41 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/CompareArrows.js
import { jsx as _jsx179, jsxs as _jsxs42 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Compass.js
import { jsx as _jsx180 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Complete.js
import { jsx as _jsx181 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ComposeCanvasEditStar.js
import { jsx as _jsx182, jsxs as _jsxs43 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ComposeDashedTemporary.js
import { jsx as _jsx183 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ComposeEditSquare.js
import { jsx as _jsx184 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Confetti.js
import { jsx as _jsx185 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ConfettiParty.js
import { jsx as _jsx186, jsxs as _jsxs44 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Connect.js
import { jsx as _jsx187 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ConnectApps.js
import { jsx as _jsx188, jsxs as _jsxs45 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ConnectedDynamicGpt.js
import { jsx as _jsx189 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ConnectorsConnectedApps.js
import { jsx as _jsx190 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Copy.js
import { jsx as _jsx191 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/CreditCard.js
import { jsx as _jsx192 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Credits.js
import { jsx as _jsx193 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Cube.js
import { jsx as _jsx194 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Cursor.js
import { jsx as _jsx195 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Customize.js
import { jsx as _jsx196 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/DarkMode.js
import { jsx as _jsx197 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/DataControls.js
import { jsx as _jsx198, jsxs as _jsxs46 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/DeepSearchTelescope.js
import { jsx as _jsx199 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Delete.js
import { jsx as _jsx200 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/DeleteAccount.js
import { jsx as _jsx201 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Desktop.js
import { jsx as _jsx202 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/DiningEvents.js
import { jsx as _jsx203 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/DisabledCursor.js
import { jsx as _jsx204 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Dock.js
import { jsx as _jsx205, jsxs as _jsxs47 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Document.js
import { jsx as _jsx206, jsxs as _jsxs48 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Documentation.js
import { jsx as _jsx207 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/DollarCircle.js
import { jsx as _jsx208, jsxs as _jsxs49 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Dot.js
import { jsx as _jsx209 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/DotsHorizontal.js
import { jsx as _jsx210 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/DotsHorizontalCircle.js
import { jsx as _jsx211, jsxs as _jsxs50 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/DotsHorizontalMoreMenu.js
import { jsx as _jsx212 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/DotsVertical.js
import { jsx as _jsx213 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/DotsVerticalCircle.js
import { jsx as _jsx214, jsxs as _jsxs51 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/DotsVerticalMoreMenu.js
import { jsx as _jsx215 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/DoubleChevronLeft.js
import { jsx as _jsx216 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/DoubleChevronRight.js
import { jsx as _jsx217 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Download.js
import { jsx as _jsx218 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/DownloadCircle.js
import { jsx as _jsx219, jsxs as _jsxs52 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/DownloadGifWatermark.js
import { jsx as _jsx220, jsxs as _jsxs53 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/DownloadSimple.js
import { jsx as _jsx221, jsxs as _jsxs54 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/DownloadVideo.js
import { jsx as _jsx222, jsxs as _jsxs55 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/DownloadVideoWatermark.js
import { jsx as _jsx223, jsxs as _jsxs56 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Dropdown.js
import { jsx as _jsx224 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/DropdownVector.js
import { jsx as _jsx225 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Dumbbell.js
import { jsx as _jsx226 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/EarthTravelWorld.js
import { jsx as _jsx227 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Edit.js
import { jsx as _jsx228 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/EditAlt.js
import { jsx as _jsx229 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/EditDalleImage.js
import { jsx as _jsx230, jsxs as _jsxs57 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/EditPencil.js
import { jsx as _jsx231 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/EditStar.js
import { jsx as _jsx232, jsxs as _jsxs58 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/EditXs.js
import { jsx as _jsx233 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Education.js
import { jsx as _jsx234 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Email.js
import { jsx as _jsx235 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/EmojiAdd.js
import { jsx as _jsx236, jsxs as _jsxs59 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/EmojiLists.js
import { jsx as _jsx237, jsxs as _jsxs60 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/EmojiRemove.js
import { jsx as _jsx238, jsxs as _jsxs61 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/EmojiSections.js
import { jsx as _jsx239, jsxs as _jsxs62 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/EmojiWords.js
import { jsx as _jsx240, jsxs as _jsxs63 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/EmptyCircle.js
import { jsx as _jsx241 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/EmptyCircleFilled.js
import { jsx as _jsx242 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/EnterLogin.js
import { jsx as _jsx243 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Enum.js
import { jsx as _jsx244, jsxs as _jsxs64 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Equal.js
import { jsx as _jsx245 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Error.js
import { jsx as _jsx246, jsxs as _jsxs65 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ExclamationMarkCircle.js
import { jsx as _jsx247, jsxs as _jsxs66 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ExitLogout.js
import { jsx as _jsx248 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Expand.js
import { jsx as _jsx249 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ExpandLarge.js
import { jsx as _jsx250 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ExpandLg.js
import { jsx as _jsx251 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ExpandMd.js
import { jsx as _jsx252 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ExpandSm.js
import { jsx as _jsx253 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ExpandSmall.js
import { jsx as _jsx254 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Explore.js
import { jsx as _jsx255 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ExploreSora.js
import { jsx as _jsx256, jsxs as _jsxs67 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ExternalLink.js
import { jsx as _jsx257 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Eye.js
import { jsx as _jsx258 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/EyeClosed.js
import { jsx as _jsx259 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/EyeOff.js
import { jsx as _jsx260, jsxs as _jsxs68 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/FeaturedWreath.js
import { jsx as _jsx261, jsxs as _jsxs69 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/File.js
import { jsx as _jsx262 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/File3d.js
import { jsx as _jsx263 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/FileAudio.js
import { jsx as _jsx264 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/FileBlank.js
import { jsx as _jsx265 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/FileCode.js
import { jsx as _jsx266 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/FileDocument.js
import { jsx as _jsx267 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/FileImage.js
import { jsx as _jsx268 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/FilePresentation.js
import { jsx as _jsx269 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/FileSpreadsheet.js
import { jsx as _jsx270 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/FileSpreedsheet.js
import { jsx as _jsx271 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/FileUpload.js
import { jsx as _jsx272 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/FileVideo.js
import { jsx as _jsx273 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/FileZip.js
import { jsx as _jsx274 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Filter.js
import { jsx as _jsx275 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/FineTuning.js
import { jsx as _jsx276 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/FistBump.js
import { jsx as _jsx277 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Flag.js
import { jsx as _jsx278 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Flash.js
import { jsx as _jsx279 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Flask.js
import { jsx as _jsx280 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/FlaskFilled.js
import { jsx as _jsx281 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Folder.js
import { jsx as _jsx282 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/FolderDocumentsFinder.js
import { jsx as _jsx283 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/FolderOpen.js
import { jsx as _jsx284 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/FolderPlus.js
import { jsx as _jsx285, jsxs as _jsxs70 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/FolderPlusAdd.js
import { jsx as _jsx286, jsxs as _jsxs71 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Folders.js
import { jsx as _jsx287 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/FolderShared.js
import { jsx as _jsx288, jsxs as _jsxs72 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/FolderSharedOpen.js
import { jsx as _jsx289, jsxs as _jsxs73 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/FolderStuffed.js
import { jsx as _jsx290 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/FolderUnshare.js
import { jsx as _jsx291, jsxs as _jsxs74 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Followup.js
import { jsx as _jsx292 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Forum.js
import { jsx as _jsx293 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Forward.js
import { jsx as _jsx294 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Forward10s.js
import { jsx as _jsx295, jsxs as _jsxs75 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Forward15s.js
import { jsx as _jsx296, jsxs as _jsxs76 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Frozen.js
import { jsx as _jsx297 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Function.js
import { jsx as _jsx298, jsxs as _jsxs77 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Functions.js
import { jsx as _jsx299 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/GenerateSuggestedEdits.js
import { jsx as _jsx300, jsxs as _jsxs78 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Glasses.js
import { jsx as _jsx301 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Globe.js
import { jsx as _jsx302 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/GlobeAltRealTimeSearch.js
import { jsx as _jsx303 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/GlobeFilled.js
import { jsx as _jsx304, jsxs as _jsxs79 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/GlobeOffRealTimeSearch.js
import { jsx as _jsx305 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/GlobeRealTimeSearch.js
import { jsx as _jsx306 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/GlobeSpin.js
import { jsx as _jsx307 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Go.js
import { jsx as _jsx308, jsxs as _jsxs80 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/GoFilled.js
import { jsx as _jsx309 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Graduate.js
import { jsx as _jsx310 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/GraduationCap.js
import { jsx as _jsx311 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Grid.js
import { jsx as _jsx312 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/GridAlt.js
import { jsx as _jsx313 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Group.js
import { jsx as _jsx314 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/GroupFilled.js
import { jsx as _jsx315, jsxs as _jsxs81 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Groups.js
import { jsx as _jsx316 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Hamburger.js
import { jsx as _jsx317 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/HandBack.js
import { jsx as _jsx318 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/HandFront.js
import { jsx as _jsx319 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/HandPeace.js
import { jsx as _jsx320 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/HandRaised.js
import { jsx as _jsx321 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/HandRaisedHey.js
import { jsx as _jsx322 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/HandWavingBye.js
import { jsx as _jsx323 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/HapticFeedback.js
import { jsx as _jsx324, jsxs as _jsxs82 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Headphones.js
import { jsx as _jsx325 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Health.js
import { jsx as _jsx326 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Heart.js
import { jsx as _jsx327 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/HeartFilled.js
import { jsx as _jsx328 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/HeartFilledXs.js
import { jsx as _jsx329 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/HeartXs.js
import { jsx as _jsx330 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Help.js
import { jsx as _jsx331 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/History.js
import { jsx as _jsx332 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/HistoryOff.js
import { jsx as _jsx333, jsxs as _jsxs83 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/HistoryOn.js
import { jsx as _jsx334 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Home.js
import { jsx as _jsx335 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/HomeAlt.js
import { jsx as _jsx336 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Identity.js
import { jsx as _jsx337 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/IdentityMeSecure.js
import { jsx as _jsx338 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ImageCaption.js
import { jsx as _jsx339, jsxs as _jsxs84 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Images.js
import { jsx as _jsx340, jsxs as _jsxs85 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ImageSquare.js
import { jsx as _jsx341 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ImageSquarePictureLibrary.js
import { jsx as _jsx342 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ImageToText.js
import { jsx as _jsx343, jsxs as _jsxs86 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ImageWide.js
import { jsx as _jsx344 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ImageWideFilled.js
import { jsx as _jsx345 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ImageWidePictureLibrary.js
import { jsx as _jsx346 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Info.js
import { jsx as _jsx347, jsxs as _jsxs87 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/InfoCircle.js
import { jsx as _jsx348, jsxs as _jsxs88 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Inpaint.js
import { jsx as _jsx349 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/InpaintRespond.js
import { jsx as _jsx350, jsxs as _jsxs89 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Inspiration.js
import { jsx as _jsx351 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/InspirationFilled.js
import { jsx as _jsx352 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Interactiv.js
import { jsx as _jsx353, jsxs as _jsxs90 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/InternalKnowledge.js
import { jsx as _jsx354, jsxs as _jsxs91 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/InternalKnowledgeOptimizedForCircle.js
import { jsx as _jsx355, jsxs as _jsxs92 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Invoice.js
import { jsx as _jsx356 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Io.js
import { jsx as _jsx357 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/JumpToCaption.js
import { jsx as _jsx358, jsxs as _jsxs93 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Kettlebell.js
import { jsx as _jsx359 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Key.js
import { jsx as _jsx360, jsxs as _jsxs94 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Keyboard.js
import { jsx as _jsx361 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/KeyboardShortcut.js
import { jsx as _jsx362, jsxs as _jsxs95 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Lab.js
import { jsx as _jsx363 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Language.js
import { jsx as _jsx364 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Latency.js
import { jsx as _jsx365 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Lifesaver.js
import { jsx as _jsx366 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Lightbulb.js
import { jsx as _jsx367 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Lightbulb20.js
import { jsx as _jsx368 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Lightbulb22.js
import { jsx as _jsx369 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Lightbulb22Filled.js
import { jsx as _jsx370 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/LightbulbGlow.js
import { jsx as _jsx371, jsxs as _jsxs96 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/LightMode.js
import { jsx as _jsx372 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Link.js
import { jsx as _jsx373 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/LinkDisabledBold.js
import { jsx as _jsx374, jsxs as _jsxs97 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/LinkExternalWebsite.js
import { jsx as _jsx375 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/LocalServices.js
import { jsx as _jsx376 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Lock.js
import { jsx as _jsx377 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/LockKeyHole.js
import { jsx as _jsx378, jsxs as _jsxs98 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Logout.js
import { jsx as _jsx379 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Loop.js
import { jsx as _jsx380, jsxs as _jsxs99 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/LoopLong.js
import { jsx as _jsx381 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/LoopNormal.js
import { jsx as _jsx382 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/LoopShort.js
import { jsx as _jsx383 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/LoopXs.js
import { jsx as _jsx384, jsxs as _jsxs100 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Lotus.js
import { jsx as _jsx385 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Love.js
import { jsx as _jsx386 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/MagnifyingGlassSearch.js
import { jsx as _jsx387 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/MagnifyingGlassSmSearch.js
import { jsx as _jsx388 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Mail.js
import { jsx as _jsx389 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ManageHistory.js
import { jsx as _jsx390, jsxs as _jsxs101 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/MapPin.js
import { jsx as _jsx391, jsxs as _jsxs102 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Maps.js
import { jsx as _jsx392 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/MapsAddress.js
import { jsx as _jsx393 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/MapsDirections.js
import { jsx as _jsx394 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/MarkerCode.js
import { jsx as _jsx395, jsxs as _jsxs103 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/MarkerData.js
import { jsx as _jsx396, jsxs as _jsxs104 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/MarkerMultiple.js
import { jsx as _jsx397, jsxs as _jsxs105 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/MarkerQuote.js
import { jsx as _jsx398, jsxs as _jsxs106 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Mcp.js
import { jsx as _jsx399, jsxs as _jsxs107 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Members.js
import { jsx as _jsx400 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/MembersFilled.js
import { jsx as _jsx401, jsxs as _jsxs108 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/MemoryFilledSm.js
import { jsx as _jsx402, jsxs as _jsxs109 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/MemoryOffRemember.js
import { jsx as _jsx403 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/MemoryOnRemember.js
import { jsx as _jsx404 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/MemoryWriteSm.js
import { jsx as _jsx405, jsxs as _jsxs110 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Menu.js
import { jsx as _jsx406 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Menubar.js
import { jsx as _jsx407 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/MenuInverted.js
import { jsx as _jsx408 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/MenuSidebar.js
import { jsx as _jsx409 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Messaging.js
import { jsx as _jsx410 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Mic.js
import { jsx as _jsx411, jsxs as _jsxs111 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/MicFilled.js
import { jsx as _jsx412, jsxs as _jsxs112 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/MicFilledOff.js
import { jsx as _jsx413, jsxs as _jsxs113 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/MicLgDictate.js
import { jsx as _jsx414, jsxs as _jsxs114 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/MicOff.js
import { jsx as _jsx415 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/MinimizeDown.js
import { jsx as _jsx416 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/MinimizeLeft.js
import { jsx as _jsx417 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/MinimizeRight.js
import { jsx as _jsx418 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/MinimizeTop.js
import { jsx as _jsx419 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Minus.js
import { jsx as _jsx420 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/MinusCircle.js
import { jsx as _jsx421, jsxs as _jsxs115 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/MinusCircleFilled.js
import { jsx as _jsx422 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Mobile.js
import { jsx as _jsx423 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Moon.js
import { jsx as _jsx424 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/MoonSunSystem.js
import { jsx as _jsx425 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/MoreCircleMenuDots.js
import { jsx as _jsx426, jsxs as _jsxs116 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Music.js
import { jsx as _jsx427 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/MyGptProfileMe.js
import { jsx as _jsx428 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Name.js
import { jsx as _jsx429 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/NewsPaper.js
import { jsx as _jsx430 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Nodes.js
import { jsx as _jsx431 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Notebook.js
import { jsx as _jsx432 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/NotebookCheck.js
import { jsx as _jsx433 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/NotebookNarrow.js
import { jsx as _jsx434 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/NotebookPencil.js
import { jsx as _jsx435, jsxs as _jsxs117 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Notepad.js
import { jsx as _jsx436 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/NotificationBell.js
import { jsx as _jsx437 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/NotificationOffBell.js
import { jsx as _jsx438 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/NoTraining.js
import { jsx as _jsx439, jsxs as _jsxs118 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Number.js
import { jsx as _jsx440, jsxs as _jsxs119 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ObjectIcon.js
import { jsx as _jsx441 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/On.js
import { jsx as _jsx442 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/OpenaiLogoBold.js
import { jsx as _jsx443, jsxs as _jsxs120 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/OpenaiLogoBoldBoundingBox.js
import { jsx as _jsx444 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/OpenaiLogoRegular.js
import { jsx as _jsx445, jsxs as _jsxs121 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/OpenaiLogoRegularBoundingBox.js
import { jsx as _jsx446 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/OpenaiLogoWebappVariable480.js
import { jsx as _jsx447 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/OpenLeft.js
import { jsx as _jsx448 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/OpenRight.js
import { jsx as _jsx449 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Operator.js
import { jsx as _jsx450 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Order.js
import { jsx as _jsx451, jsxs as _jsxs122 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PageBlank.js
import { jsx as _jsx452 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Paid.js
import { jsx as _jsx453 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Paperclip.js
import { jsx as _jsx454 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PaperclipAttach.js
import { jsx as _jsx455 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ParentControl.js
import { jsx as _jsx456 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PastedText.js
import { jsx as _jsx457 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Pause.js
import { jsx as _jsx458, jsxs as _jsxs123 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PauseCircle.js
import { jsx as _jsx459 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PauseCircleFilled.js
import { jsx as _jsx460 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PauseOutline.js
import { jsx as _jsx461, jsxs as _jsxs124 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PauseSm.js
import { jsx as _jsx462, jsxs as _jsxs125 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Paw.js
import { jsx as _jsx463, jsxs as _jsxs126 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Pencil.js
import { jsx as _jsx464 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PencilSparkle.js
import { jsx as _jsx465, jsxs as _jsxs127 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PencilSquare.js
import { jsx as _jsx466 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Pens.js
import { jsx as _jsx467 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Phone.js
import { jsx as _jsx468 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PhoneMissed.js
import { jsx as _jsx469 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PhoneRing.js
import { jsx as _jsx470 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PhoneWaves.js
import { jsx as _jsx471 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PictureInPicture.js
import { jsx as _jsx472 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Pin.js
import { jsx as _jsx473 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PinFilled.js
import { jsx as _jsx474 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PinWindow.js
import { jsx as _jsx475, jsxs as _jsxs128 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Plane.js
import { jsx as _jsx476 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PlantDesk.js
import { jsx as _jsx477 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Play.js
import { jsx as _jsx478, jsxs as _jsxs129 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PlayCircle.js
import { jsx as _jsx479 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PlayCircleFilled.js
import { jsx as _jsx480 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Playground.js
import { jsx as _jsx481 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PlayOutline.js
import { jsx as _jsx482, jsxs as _jsxs130 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PlaySm.js
import { jsx as _jsx483 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PlayTriangle.js
import { jsx as _jsx484 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Plugin.js
import { jsx as _jsx485 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PluginPuzzle.js
import { jsx as _jsx486 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Plus.js
import { jsx as _jsx487 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Plus14px.js
import { jsx as _jsx488 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PlusCircle.js
import { jsx as _jsx489, jsxs as _jsxs131 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PlusCircleAdd.js
import { jsx as _jsx490 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PlusCircleFilled.js
import { jsx as _jsx491 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PlusComposer.js
import { jsx as _jsx492 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PlusFilled.js
import { jsx as _jsx493 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PlusLg.js
import { jsx as _jsx494 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PlusLg18pxAdd.js
import { jsx as _jsx495 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PlusSm12px.js
import { jsx as _jsx496 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PlusSquareAdd.js
import { jsx as _jsx497 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PopOutWindow.js
import { jsx as _jsx498 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PresetDefault.js
import { jsx as _jsx499 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PresetSelected.js
import { jsx as _jsx500 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PrivacyIntern.js
import { jsx as _jsx501 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ProDiamond.js
import { jsx as _jsx502, jsxs as _jsxs132 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ProductTag.js
import { jsx as _jsx503 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ProFilledDiamond.js
import { jsx as _jsx504 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PullRequestClosed.js
import { jsx as _jsx505 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PullRequestDraft.js
import { jsx as _jsx506, jsxs as _jsxs133 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PullRequestMerged.js
import { jsx as _jsx507 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/PullRequestOpen.js
import { jsx as _jsx508, jsxs as _jsxs134 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Pulse.js
import { jsx as _jsx509, jsxs as _jsxs135 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Question.js
import { jsx as _jsx510, jsxs as _jsxs136 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/QuestionMark.js
import { jsx as _jsx511, jsxs as _jsxs137 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/QuestionMarkCircle.js
import { jsx as _jsx512, jsxs as _jsxs138 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/QuickStart.js
import { jsx as _jsx513, jsxs as _jsxs139 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Quote.js
import { jsx as _jsx514, jsxs as _jsxs140 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/QuoteReplyFilledQuoteXs.js
import { jsx as _jsx515, jsxs as _jsxs141 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/RadioSelected.js
import { jsx as _jsx516 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ReadingLevel.js
import { jsx as _jsx517 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Record.js
import { jsx as _jsx518, jsxs as _jsxs142 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Regenerate.js
import { jsx as _jsx519 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/RegenerateOff.js
import { jsx as _jsx520, jsxs as _jsxs143 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/RegenerateStar.js
import { jsx as _jsx521, jsxs as _jsxs144 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Reload.js
import { jsx as _jsx522 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/RemixMild.js
import { jsx as _jsx523 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/RemixMildXs.js
import { jsx as _jsx524 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/RemixStrong.js
import { jsx as _jsx525 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/RemixSubtle.js
import { jsx as _jsx526 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/RemoveForeverPermanently.js
import { jsx as _jsx527 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/RemoveRedEye.js
import { jsx as _jsx528, jsxs as _jsxs145 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Reply.js
import { jsx as _jsx529 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Report.js
import { jsx as _jsx530 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Resend.js
import { jsx as _jsx531 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ResetChat.js
import { jsx as _jsx532 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Resolution1080p.js
import { jsx as _jsx533 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Resolution360p.js
import { jsx as _jsx534 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Resolution480p.js
import { jsx as _jsx535 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Resolution720p.js
import { jsx as _jsx536 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/RestoreUntrash.js
import { jsx as _jsx537 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Rewind.js
import { jsx as _jsx538 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Robot.js
import { jsx as _jsx539, jsxs as _jsxs146 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/RobotHead.js
import { jsx as _jsx540, jsxs as _jsxs147 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/RobotHeadSad.js
import { jsx as _jsx541, jsxs as _jsxs148 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SavedFilledXs.js
import { jsx as _jsx542 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SavedXs.js
import { jsx as _jsx543 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Scales.js
import { jsx as _jsx544 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Scissor.js
import { jsx as _jsx545 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ScissorXs.js
import { jsx as _jsx546 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ScreenPosition.js
import { jsx as _jsx547, jsxs as _jsxs149 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Search.js
import { jsx as _jsx548 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SearchConnector.js
import { jsx as _jsx549, jsxs as _jsxs150 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SearchFeed.js
import { jsx as _jsx550 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SearchXs.js
import { jsx as _jsx551 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SelectText.js
import { jsx as _jsx552, jsxs as _jsxs151 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Settings.js
import { jsx as _jsx553, jsxs as _jsxs152 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SettingsCircle.js
import { jsx as _jsx554, jsxs as _jsxs153 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SettingsCog.js
import { jsx as _jsx555, jsxs as _jsxs154 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SettingsSlider.js
import { jsx as _jsx556 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SettingsWrench.js
import { jsx as _jsx557 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Share.js
import { jsx as _jsx558 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ShareChat.js
import { jsx as _jsx559 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ShareScreen.js
import { jsx as _jsx560 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ShareScreenFilled.js
import { jsx as _jsx561 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ShareScreenOff.js
import { jsx as _jsx562 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ShareScreenOffFilled.js
import { jsx as _jsx563 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ShieldCheck.js
import { jsx as _jsx564, jsxs as _jsxs155 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ShieldKey.js
import { jsx as _jsx565 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ShieldLock.js
import { jsx as _jsx566, jsxs as _jsxs156 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ShieldPerson.js
import { jsx as _jsx567 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ShoppingBag.js
import { jsx as _jsx568 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Shortcuts.js
import { jsx as _jsx569, jsxs as _jsxs157 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Shuffle.js
import { jsx as _jsx570 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Sidebar.js
import { jsx as _jsx571 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SidebarCollapseLeft.js
import { jsx as _jsx572, jsxs as _jsxs158 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SidebarCollapseRight.js
import { jsx as _jsx573 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SidebarFloatingLeft.js
import { jsx as _jsx574 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SidebarFloatingOpenLeft.js
import { jsx as _jsx575, jsxs as _jsxs159 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SidebarFloatingOpenRight.js
import { jsx as _jsx576, jsxs as _jsxs160 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SidebarFloatingRight.js
import { jsx as _jsx577 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SidebarLeft.js
import { jsx as _jsx578 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SidebarMenuMobile.js
import { jsx as _jsx579 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SidebarMenuMobileBadgeCutout.js
import { jsx as _jsx580, jsxs as _jsxs161 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SidebarOpenLeft.js
import { jsx as _jsx581 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SidebarOpenLeftAlt.js
import { jsx as _jsx582, jsxs as _jsxs162 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SidebarOpenRight.js
import { jsx as _jsx583 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SidebarOpenRightAlt.js
import { jsx as _jsx584, jsxs as _jsxs163 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SidebarRight.js
import { jsx as _jsx585 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SimpleRelax.js
import { jsx as _jsx586 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SimpleSad.js
import { jsx as _jsx587 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SimpleSmile.js
import { jsx as _jsx588 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Skip.js
import { jsx as _jsx589 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Sleep.js
import { jsx as _jsx590, jsxs as _jsxs164 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Snorkle.js
import { jsx as _jsx591 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Snowflake.js
import { jsx as _jsx592 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SoraBasicPopcorn.js
import { jsx as _jsx593 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SoraProDirector.js
import { jsx as _jsx594 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SoundOffSimpleMute.js
import { jsx as _jsx595 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SoundOffSpeaker.js
import { jsx as _jsx596 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SoundOnReadOutLoudSpeaker.js
import { jsx as _jsx597 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Sparkle.js
import { jsx as _jsx598 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SparkleDouble.js
import { jsx as _jsx599 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SparkleFilledPlus.js
import { jsx as _jsx600 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SparklePlus.js
import { jsx as _jsx601 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Sparkles.js
import { jsx as _jsx602, jsxs as _jsxs165 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SparklesFilled.js
import { jsx as _jsx603, jsxs as _jsxs166 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Speak.js
import { jsx as _jsx604 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SpeechToText.js
import { jsx as _jsx605 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Speed.js
import { jsx as _jsx606, jsxs as _jsxs167 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SpeedometerLatencySpeed.js
import { jsx as _jsx607, jsxs as _jsxs168 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Spelling.js
import { jsx as _jsx608 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Spin.js
import { jsx as _jsx609 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SquareCheckboxUnchecked.js
import { jsx as _jsx610 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SquareCheckCheckboxChecked.js
import { jsx as _jsx611 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SquareCheckFilledCheckboxCheckedFilled.js
import { jsx as _jsx612 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SquareCode.js
import { jsx as _jsx613 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SquareFilledTableLegend.js
import { jsx as _jsx614 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SquareImage.js
import { jsx as _jsx615 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SquarePlus.js
import { jsx as _jsx616, jsxs as _jsxs169 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SquarePlusAlt.js
import { jsx as _jsx617, jsxs as _jsxs170 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SquareTableLegend.js
import { jsx as _jsx618 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SquareText.js
import { jsx as _jsx619, jsxs as _jsxs171 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Stack.js
import { jsx as _jsx620 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Star.js
import { jsx as _jsx621 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/StarFilled.js
import { jsx as _jsx622 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/StartStrokeMd.js
import { jsx as _jsx623 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Status.js
import { jsx as _jsx624, jsxs as _jsxs172 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Stethoscope.js
import { jsx as _jsx625 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/StickyNote.js
import { jsx as _jsx626 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Stop.js
import { jsx as _jsx627 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/StopCircle.js
import { jsx as _jsx628 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/StopCircleFilled.js
import { jsx as _jsx629 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/StopOutline.js
import { jsx as _jsx630, jsxs as _jsxs173 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/StopSm.js
import { jsx as _jsx631 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/StopStrokeMd.js
import { jsx as _jsx632 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Stopwatch.js
import { jsx as _jsx633, jsxs as _jsxs174 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Storage.js
import { jsx as _jsx634 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Storyboard.js
import { jsx as _jsx635 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/String.js
import { jsx as _jsx636, jsxs as _jsxs175 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Studio.js
import { jsx as _jsx637 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Stuff.js
import { jsx as _jsx638, jsxs as _jsxs176 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/StuffTools.js
import { jsx as _jsx639, jsxs as _jsxs177 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SubscriptionPlan.js
import { jsx as _jsx640, jsxs as _jsxs178 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SuggestEdit.js
import { jsx as _jsx641, jsxs as _jsxs179 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Suitcase.js
import { jsx as _jsx642, jsxs as _jsxs180 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SuitcaseFilledWorkBusiness.js
import { jsx as _jsx643 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SuitcaseWorkBusiness.js
import { jsx as _jsx644 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Sun.js
import { jsx as _jsx645 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/SystemMode.js
import { jsx as _jsx646 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/TableCellFilled.js
import { jsx as _jsx647, jsxs as _jsxs181 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/TableCellsFilled.js
import { jsx as _jsx648, jsxs as _jsxs182 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/TableColumnFilled.js
import { jsx as _jsx649, jsxs as _jsxs183 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/TableFilled.js
import { jsx as _jsx650, jsxs as _jsxs184 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/TableRowFilled.js
import { jsx as _jsx651, jsxs as _jsxs185 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Tag.js
import { jsx as _jsx652 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Tap.js
import { jsx as _jsx653 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Tasks.js
import { jsx as _jsx654, jsxs as _jsxs186 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/TBoneRaw.js
import { jsx as _jsx655 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Telescope.js
import { jsx as _jsx656, jsxs as _jsxs187 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Terminal.js
import { jsx as _jsx657 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/TerminalLg.js
import { jsx as _jsx658 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Terms.js
import { jsx as _jsx659 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Text.js
import { jsx as _jsx660 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/TextLonger.js
import { jsx as _jsx661, jsxs as _jsxs188 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/TextPrompt.js
import { jsx as _jsx662, jsxs as _jsxs189 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/TextShorter.js
import { jsx as _jsx663, jsxs as _jsxs190 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/TextShorterConcise.js
import { jsx as _jsx664 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/TextToSpeech.js
import { jsx as _jsx665 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ThumbDown.js
import { jsx as _jsx666 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ThumbDownFilled.js
import { jsx as _jsx667, jsxs as _jsxs191 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ThumbMixed.js
import { jsx as _jsx668 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ThumbnailLarge.js
import { jsx as _jsx669, jsxs as _jsxs192 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ThumbnailMedium.js
import { jsx as _jsx670, jsxs as _jsxs193 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ThumbnailSmall.js
import { jsx as _jsx671, jsxs as _jsxs194 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Thumbs.js
import { jsx as _jsx672 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ThumbUp.js
import { jsx as _jsx673 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ThumbUpFilled.js
import { jsx as _jsx674, jsxs as _jsxs195 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Timer.js
import { jsx as _jsx675 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Tools.js
import { jsx as _jsx676 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/ToolsSkills.js
import { jsx as _jsx677 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Translate.js
import { jsx as _jsx678 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Trash.js
import { jsx as _jsx679 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/TrashRemove.js
import { jsx as _jsx680, jsxs as _jsxs196 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Trending.js
import { jsx as _jsx681 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/TriangleExclamationErrorWarning.js
import { jsx as _jsx682 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/TriangleExclamationFilledErrorWarning.js
import { jsx as _jsx683 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/TrophyTop.js
import { jsx as _jsx684 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/TuningFork.js
import { jsx as _jsx685, jsxs as _jsxs197 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Unarchive.js
import { jsx as _jsx686 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Undo.js
import { jsx as _jsx687 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Unlink.js
import { jsx as _jsx688, jsxs as _jsxs198 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Unpin.js
import { jsx as _jsx689 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Upgrade.js
import { jsx as _jsx690 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/UpgradePlan.js
import { jsx as _jsx691, jsxs as _jsxs199 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/UploadDocuments.js
import { jsx as _jsx692 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Upscale.js
import { jsx as _jsx693, jsxs as _jsxs200 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/UpscaleXs.js
import { jsx as _jsx694, jsxs as _jsxs201 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Usage.js
import { jsx as _jsx695 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/User.js
import { jsx as _jsx696 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/UserAdd.js
import { jsx as _jsx697 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/UserGpts.js
import { jsx as _jsx698, jsxs as _jsxs202 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/UserHeart.js
import { jsx as _jsx699 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/UserLock.js
import { jsx as _jsx700, jsxs as _jsxs203 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Users.js
import { jsx as _jsx701 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/UserVoice.js
import { jsx as _jsx702 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Variation2v2.js
import { jsx as _jsx703, jsxs as _jsxs204 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/VariationV21.js
import { jsx as _jsx704, jsxs as _jsxs205 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/VariationV31.js
import { jsx as _jsx705, jsxs as _jsxs206 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/VariationV32.js
import { jsx as _jsx706, jsxs as _jsxs207 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/VariationV33.js
import { jsx as _jsx707, jsxs as _jsxs208 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/VariationV41.js
import { jsx as _jsx708, jsxs as _jsxs209 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/VariationV42.js
import { jsx as _jsx709, jsxs as _jsxs210 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/VariationV43.js
import { jsx as _jsx710, jsxs as _jsxs211 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/VariationV44.js
import { jsx as _jsx711, jsxs as _jsxs212 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/VersionsV1.js
import { jsx as _jsx712, jsxs as _jsxs213 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Video.js
import { jsx as _jsx713 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/VideoCaption.js
import { jsx as _jsx714, jsxs as _jsxs214 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/VideoFilled.js
import { jsx as _jsx715, jsxs as _jsxs215 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/VideoFilledOff.js
import { jsx as _jsx716, jsxs as _jsxs216 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/VideoGrid.js
import { jsx as _jsx717 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/VideoList.js
import { jsx as _jsx718 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Videos.js
import { jsx as _jsx719, jsxs as _jsxs217 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/VideoToText.js
import { jsx as _jsx720, jsxs as _jsxs218 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Voice.js
import { jsx as _jsx721 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Voice4Bars.js
import { jsx as _jsx722 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Voice5BarsSoundwave.js
import { jsx as _jsx723 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/VoiceBold.js
import { jsx as _jsx724, jsxs as _jsxs219 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/VoiceInputAreaMobileFilledVoiceXs.js
import { jsx as _jsx725, jsxs as _jsxs220 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/VoiceLight.js
import { jsx as _jsx726 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Warning.js
import { jsx as _jsx727, jsxs as _jsxs221 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/WarningFilledWrapCenteredForCircle.js
import { jsx as _jsx728 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/WarningWrapCenteredForCircle.js
import { jsx as _jsx729, jsxs as _jsxs222 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Wave.js
import { jsx as _jsx730 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/WebsiteNetwork.js
import { jsx as _jsx731 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Whisk.js
import { jsx as _jsx732, jsxs as _jsxs223 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/WhisperAutoSubmit.js
import { jsx as _jsx733, jsxs as _jsxs224 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Widget.js
import { jsx as _jsx734, jsxs as _jsxs225 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/WidgetAdd.js
import { jsx as _jsx735, jsxs as _jsxs226 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Workspace.js
import { jsx as _jsx736 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/WorkWithApps.js
import { jsx as _jsx737 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Wreath.js
import { jsx as _jsx738 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/WriteAlt.js
import { jsx as _jsx739 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/WriteAlt2.js
import { jsx as _jsx740, jsxs as _jsxs227 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/Writing.js
import { jsx as _jsx741 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/X.js
import { jsx as _jsx742 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/XCircle.js
import { jsx as _jsx743, jsxs as _jsxs228 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/XCircleCrossedClose.js
import { jsx as _jsx744, jsxs as _jsxs229 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/XCircleFilled.js
import { jsx as _jsx745 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/XCircleFilledCrossedClose.js
import { jsx as _jsx746 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/XCrossed.js
import { jsx as _jsx747 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/XSquareCrossed.js
import { jsx as _jsx748 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/XSquareFilledCrossed.js
import { jsx as _jsx749 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/XXs.js
import { jsx as _jsx750 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Icon/svg/XXsCrossed.js
import { jsx as _jsx751 } from "react/jsx-runtime";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Transition/Animate.js
import { jsx as _jsx752 } from "react/jsx-runtime";
import {} from "react";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Transition/AnimateLayout.js
import { jsx as _jsx753 } from "react/jsx-runtime";
import { useRef as useRef4 } from "react";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Transition/AnimateLayoutGroup.js
import { jsx as _jsx754 } from "react/jsx-runtime";
import {} from "react";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Transition/SlotTransitionGroup.js
import { jsx as _jsx755, Fragment as _Fragment2 } from "react/jsx-runtime";
import React3, { Children as Children4, useCallback as useCallback5, useEffect as useEffect3, useLayoutEffect as useLayoutEffect3, useReducer as useReducer2, useRef as useRef5, useState as useState5 } from "react";

// packages/web/src/controls/actions.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var variants = { filled: "solid", soft: "soft", quiet: "ghost" };
var sizes = {
  compact: "sm",
  regular: "lg",
  comfortable: "lg",
  spacious: "2xl",
  touch: "2xl"
};
function Button2({
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
    Button,
    {
      ...props,
      type,
      color: tone === "danger" ? "danger" : "primary",
      variant: variants[emphasis],
      pill: false,
      size: sizes[size],
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
      children: /* @__PURE__ */ jsxs("span", { className: "yg-button-label", children: [
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
      ] })
    }
  );
}
function IconButton({
  label,
  icon,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Button2,
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
  clsx_default,
  handlePressableMouseEnter,
  waitForAnimationFrame,
  toCssVariables,
  wrapTextNodeSiblings,
  useResizeObserver,
  o,
  Button2 as Button,
  IconButton,
  ButtonGroup,
  BottomAction
};
