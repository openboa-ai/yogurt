import { useState } from "react";
import {
  Button, Card, Heading, Inline, Link, PageHeader, Select, Stack,
} from "@openboa/yogurt";
import { FormRecipe } from "../examples/templates/recipe-forms";
import { MetricRecipe, RecordRecipe } from "../examples/templates/recipe-data";
import { FoundationRecipe, StateRecipe } from "../examples/templates/recipe-states";
import { recipeFamilies, type Recipe } from "../examples/templates/recipes";

const path = (family: string) => "/templates/" + family;

export function TemplateIndex() {
  return <main className="guide-templates">
    <Stack gap={24}>
      <PageHeader title="Templates" detail="Try reusable Yogurt compositions and see the components behind each one." />
      <div className="template-index-grid">
        {recipeFamilies.map(family => <Card key={family.id} title={family.title} density="compact"
          description={family.recipes.slice(0, 3).map(recipe => recipe.title).join(" · ")}>
          <Link href={path(family.id)} aria-label={"Browse " + family.title}>Browse examples</Link>
        </Card>)}
      </div>
      <Inline className="template-studies-links">
        <Link href="/templates/compose">Composition editor</Link>
        <Link href="/templates/type">Typography</Link>
        <Link href="/templates/chart">Chart studies</Link>
      </Inline>
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
  const componentIds = [...new Set(["card", ...recipe.components, ...(family.id === "metrics" && !recipe.components.includes("progress") ? ["segmented-control"] : [])])];

  return <main className="guide-templates">
    <Stack gap={24}>
      <PageHeader title={family.title} action={<Link href="/templates">All templates</Link>} />
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
