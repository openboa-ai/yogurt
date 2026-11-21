import { Inline, Link, PageHeader, Stack } from "@openboa/yogurt";
import { SourdoughPreview } from "../examples/templates/sourdough";
import "./templates.css";

export default function Examples({ id = "sourdough" }: { id?: string }) {
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
