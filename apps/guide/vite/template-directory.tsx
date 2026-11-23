import blocks from "../../../catalog/blocks.json";
import { useState } from "react";
import {
  Button, Card, Heading, Inline, Link, PageHeader, Select, Stack,
} from "@openboa/yogurt";
import { FormRecipe } from "../examples/templates/recipe-forms";
import { MetricRecipe, RecordRecipe } from "../examples/templates/recipe-data";
import { FoundationRecipe, StateRecipe } from "../examples/templates/recipe-states";
import { recipeFamilies, type Recipe } from "../examples/templates/recipes";

const recommendedGroups = [
  { id: "workspace", title: "Workspace", patterns: [
    "agent-workspace", "project-workspace", "agent-sidebar", "project-sidebar", "project-settings", "project-access",
  ] },
  { id: "records", title: "Records and decisions", patterns: [
    "collection-browser", "decision-review", "operations-library", "artifact-library", "run-inspector",
  ] },
  { id: "collaboration", title: "Collaboration", patterns: [
    "conversation-panel", "attention-inbox", "agent-profile",
  ] },
];

export function PatternGallery() {
  return <main className="guide-templates template-gallery">
    <Stack gap={32}>
      <PageHeader title="Patterns" detail="Recommended component combinations for recurring product tasks." />
      {recommendedGroups.map(group => <section key={group.id} aria-labelledby={"patterns-" + group.id}>
        <Heading level={2} id={"patterns-" + group.id}>{group.title}</Heading>
        <div className="template-gallery-board">
          {group.patterns.map(id => {
            const block = blocks.find(item => item.id === id)!;
            const title = id.split("-").map(word => word[0].toUpperCase() + word.slice(1)).join(" ");
            return <article key={id} className="guide-pattern-item" data-pattern={id}>
              <Card title={title} description={block.description}>
                <Link href={"/patterns/" + id} aria-label={"Open " + title}>Open preview</Link>
              </Card>
            </article>;
          })}
        </div>
      </section>)}
    </Stack>
  </main>;
}

function Preview({ family, recipe, appearance }: { family: string; recipe: Recipe; appearance: "light" | "dark" }) {
  if (family === "forms") return <FormRecipe recipe={recipe} />;
  if (family === "records") return <RecordRecipe recipe={recipe} />;
  if (family === "metrics") return <MetricRecipe recipe={recipe} />;
  if (family === "states") return <StateRecipe recipe={recipe} />;
  return <FoundationRecipe recipe={recipe} appearance={appearance} />;
}

export function TemplateFamily({ family, initialId, appearance }: {
  family: typeof recipeFamilies[number]; initialId?: string; appearance: "light" | "dark";
}) {
  const [selected, setSelected] = useState(initialId === family.id ? family.recipes[0].id : initialId ?? family.recipes[0].id);
  const [reset, setReset] = useState(0);
  const recipe = family.recipes.find(item => item.id === selected) ?? family.recipes[0];
  const componentIds = [...new Set(["card", ...recipe.components, ...(family.id === "metrics" && recipe.components.some(id => id === "chart" || id === "bar-chart") ? ["segmented-control"] : [])])];

  return <main className="guide-templates">
    <Stack gap={24}>
      <PageHeader title={family.title} action={<Link href="/patterns">All patterns</Link>} />
      <div className="template-family-controls">
        <Select label="Example" value={recipe.id} options={family.recipes.map(item => ({ id: item.id, label: item.title }))}
          onChange={event => setSelected(event.target.value)} />
        <Button emphasis="quiet" size="compact" onClick={() => setReset(value => value + 1)}>Reset preview</Button>
      </div>
      <div className="template-stage template-recipe-preview" data-family={family.id} key={recipe.id + ":" + reset}>
        <Card title={recipe.title} description={recipe.detail}>
          <Preview family={family.id} recipe={recipe} appearance={appearance} />
        </Card>
      </div>
      <Stack gap={8}>
        <Heading level={2}>Components used</Heading>
        <Inline className="template-component-links">
          {componentIds.map(id => <Link key={id} href={"/components/" + id}>{id}</Link>)}
        </Inline>
      </Stack>
    </Stack>
  </main>;
}
