import { lazy, Suspense } from "react";
import { Text } from "@openboa/yogurt";
import "../ui-catalog.css";
import { Catalog } from "../ui-catalog";

const Preview = lazy(() => import("./motion-patterns"));

function MotionPreview({ id }: { id: string }) {
  return <Suspense fallback={<Text role="status">Loading preview…</Text>}><Preview id={id} /></Suspense>;
}

export default function Components({ guideAppearance }: { guideAppearance: "light" | "dark" }) {
  return <Catalog guideAppearance={guideAppearance} motionPreview={MotionPreview} />;
}
