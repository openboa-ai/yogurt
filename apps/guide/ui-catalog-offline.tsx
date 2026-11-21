import { createRoot } from "react-dom/client";
import { Catalog } from "./ui-catalog";
import { MotionComponentPreview } from "./motion-patterns";

const host = document.getElementById("yogurt-ui-library");
if (host) {
  const inlinePreview = window !== window.top && host.hasAttribute("data-initial-component");
  createRoot(host).render(<Catalog inlinePreview={inlinePreview} motionPreview={MotionComponentPreview} />);
}
