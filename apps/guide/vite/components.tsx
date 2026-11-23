import { lazy, Suspense } from "react";
import { Text } from "@openboa/yogurt";
import "../ui-catalog.css";
import { Catalog } from "../ui-catalog";

const Preview = lazy(() => import("./motion-patterns"));

function MotionPreview({ id }: { id: string }) {
  return <Suspense fallback={<Text role="status">Loading preview…</Text>}><Preview id={id} /></Suspense>;
}

export default function Components({ guideAppearance, url }: { guideAppearance: "light" | "dark"; url: URL }) {
  const path = url.pathname.split("/")[2] ?? "button";
  let id = path;
  try { id = decodeURIComponent(path); } catch { /* An invalid path shows the component not found page. */ }
  return <Catalog guideAppearance={guideAppearance} motionPreview={MotionPreview}
    route={{ id, preview: url.searchParams.get("preview") }} />;
}
