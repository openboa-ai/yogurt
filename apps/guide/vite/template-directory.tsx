import { useState } from "react";
import {
  Button, Card, Heading, Inline, Link, PageHeader, Select, Stack, Surface,
} from "@openboa/yogurt";
import { FormRecipe } from "../examples/templates/recipe-forms";
import { MetricRecipe, RecordRecipe } from "../examples/templates/recipe-data";
import { FoundationRecipe, StateRecipe } from "../examples/templates/recipe-states";
import { getRecipe, recipeBoards, recipeFamilies, type Recipe } from "../examples/templates/recipes";

export function TemplateGallery({ appearance }: { appearance: "light" | "dark" }) {
  return <main className="guide-templates template-gallery">
    <Stack gap={24}>
      <PageHeader title="Templates" />
      {recipeBoards.map(board => <section key={board.id} aria-labelledby={board.id + "-templates"} data-template-board={board.id}>
        <Heading level={2} id={board.id + "-templates"}>{board.title}</Heading>
        <div className="template-gallery-board">
          {board.specimens.map(id => {
            const { family, recipe } = getRecipe(id);
            const preview = <Preview family={family} recipe={recipe} appearance={appearance} inGallery />;
            const titled = recipe.components.some(part => ["bar-chart", "chart", "data-table", "record-facts", "result"].includes(part));
            return <article key={id} id={id} className="template-specimen" data-template-specimen={id} aria-label={recipe.title}>
              {titled
                ? <Surface className="template-specimen-surface">{preview}</Surface>
                : <Card title={recipe.title} density="compact">{preview}</Card>}
            </article>;
          })}
        </div>
      </section>)}
    </Stack>
  </main>;
}

function Preview({ family, recipe, appearance, inGallery = false }: { family: string; recipe: Recipe; appearance: "light" | "dark"; inGallery?: boolean }) {
  if (family === "forms") return <FormRecipe recipe={recipe} />;
  if (family === "records") return <RecordRecipe recipe={recipe} />;
  if (family === "metrics") return <MetricRecipe recipe={recipe} />;
  if (family === "states") return <StateRecipe recipe={recipe} />;
  return <FoundationRecipe recipe={recipe} appearance={appearance} inGallery={inGallery} />;
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
