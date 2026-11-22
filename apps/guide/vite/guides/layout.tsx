import type { ReactNode } from "react";
import { Grid, Heading, Inline, NavigationList, PageHeader, Stack } from "@openboa/yogurt";
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
    <Grid className="guide-editorial-layout" data-chapters={!!chapters} gap={32}>
      <PageHeader className="guide-editorial-intro" title={title} detail={detail} action={action && <Inline>{action}</Inline>} />
      {chapters && <aside className="guide-editorial-rail">
        <Stack gap={8}>
          <Heading level={2}>On this page</Heading>
          <NavigationList label={title + " sections"} current="" items={chapters.map(([id, label]) => ({ id, label, href: "#" + id }))} />
        </Stack>
      </aside>}
      <Stack className="guide-editorial-sections" gap={64}>{children}</Stack>
    </Grid>
  </main>;
}

export function GuideSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return <section className="guide-section" id={id} aria-labelledby={id + "-title"}>
    <Stack gap={16}>
      <Heading id={id + "-title"}>{title}</Heading>
      {children}
    </Stack>
  </section>;
}

export function GuideGrid({ children, split = false }: { children: ReactNode; split?: boolean }) {
  return <Grid className={split ? "guide-grid guide-split" : "guide-grid"} gap={16}>{children}</Grid>;
}
