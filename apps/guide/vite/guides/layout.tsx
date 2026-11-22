import type { ReactNode } from "react";
import { Grid, Heading, NavigationList, PageHeader, Stack } from "@openboa/yogurt";
import "./layout.css";

export function GuidePage({ title, detail, chapters, action, children, id }: {
  title: string;
  detail: string;
  chapters?: readonly (readonly [string, string])[];
  action?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return <main className="guide-editorial" id={id}>
    <Stack gap={48}>
      <PageHeader title={title} detail={detail} action={action} />
      {chapters && <NavigationList label={title + " sections"} current="" orientation="horizontal"
        items={chapters.map(([id, label]) => ({ id, label, href: "#" + id }))} />}
      {children}
    </Stack>
  </main>;
}

export function GuideSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return <section id={id} aria-labelledby={id + "-title"}>
    <Stack gap={16}>
      <Heading id={id + "-title"}>{title}</Heading>
      {children}
    </Stack>
  </section>;
}

export function GuideGrid({ children }: { children: ReactNode }) {
  return <Grid className="guide-grid" gap={16}>{children}</Grid>;
}
