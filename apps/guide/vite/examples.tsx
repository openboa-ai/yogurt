import { Heading, Inline, Link, PageHeader, Stack } from "@openboa/yogurt";
import { StudioWorkspace } from "../examples/studio/workspace";
import { SourdoughPreview } from "../examples/templates/sourdough";
import "./templates.css";
import "./studio.css";

export default function Examples({ id, appearance }: { id?: string; appearance: "light" | "dark" }) {
  if (!id) return <main className="guide-templates studio-page">
    <Inline className="studio-page-heading" gap={12}>
      <Heading level={1}>Sourdough Studio</Heading>
      <Link href="/examples/sourdough">Research review</Link>
    </Inline>
    <StudioWorkspace appearance={appearance} />
  </main>;

  if (id !== "sourdough") return <main className="guide-templates">
    <PageHeader title="Example not found" action={<Link href="/examples">Browse examples</Link>} />
  </main>;
  return <main className="guide-templates">
    <Stack gap={24}>
      <PageHeader title="Sourdough workspace" detail="Work with the research team, review observations and check the source of an agent’s findings." />
      <div className="template-stage"><SourdoughPreview /></div>
      <Inline>
        <Link href="/patterns">Browse recommended patterns</Link>
        <Link href="/patterns/agent-workspace">Inspect AgentWorkspace</Link>
        <Link href="/components/composer">Inspect Composer</Link>
      </Inline>
    </Stack>
  </main>;
}
