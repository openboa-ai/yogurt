import { Inline, Link, PageHeader, Stack } from "@openboa/yogurt";
import { StudioWorkspace } from "../examples/studio/workspace";
import { SourdoughPreview } from "../examples/templates/sourdough";
import "./templates.css";
import "./studio.css";

export default function Examples({ id, appearance }: { id?: string; appearance: "light" | "dark" }) {
  if (!id) return <main className="guide-templates studio-page">
    <Stack gap={24}>
      <PageHeader title="Sourdough Studio" detail="Review work with a team of agents in a sample research workspace."
        action={<Link href="/examples/sourdough">Focused research example</Link>} />
      <StudioWorkspace appearance={appearance} />
    </Stack>
  </main>;

  if (id !== "sourdough") return <main className="guide-templates">
    <PageHeader title="Example not found" action={<Link href="/examples">Browse examples</Link>} />
  </main>;
  return <main className="guide-templates">
    <Stack gap={24}>
      <PageHeader title="Sourdough workspace" detail="Work with the research team, review observations and check the source of an agent’s findings." />
      <div className="template-stage"><SourdoughPreview /></div>
      <Inline>
        <Link href="/templates/compose">Explore the smaller compositions</Link>
        <Link href="/components/agent-workspace">Inspect AgentWorkspace</Link>
        <Link href="/components/composer">Inspect Composer</Link>
      </Inline>
    </Stack>
  </main>;
}
