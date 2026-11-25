import blocks from "../../../catalog/blocks.json";
import { useState } from "react";
import {
  Badge, Button, Card, Heading, Icon, Inline, Link, PageHeader, Select, Stack, Text,
} from "@openboa/yogurt";
import { FormRecipe } from "../examples/templates/recipe-forms";
import { MetricRecipe, RecordRecipe } from "../examples/templates/recipe-data";
import { FoundationRecipe, StateRecipe } from "../examples/templates/recipe-states";
import { dashboard, studies } from "../examples/templates/catalog";
import { recipeFamilies, type Recipe } from "../examples/templates/recipes";

const fullWidthPatterns = new Set([
  "agent-workspace", "project-workspace", "agent-sidebar", "project-sidebar",
]);

const recommendedGroups = [
  {
    id: "workspace",
    title: "Workspace",
    detail: "Multi-pane shells, navigation sidebars, settings and project access controls.",
    patterns: [
      "agent-workspace", "project-workspace", "agent-sidebar", "project-sidebar", "project-settings", "project-access",
    ],
  },
  {
    id: "records",
    title: "Records and decisions",
    detail: "Searchable collections, revision-bound approvals, operational libraries and run diagnostics.",
    patterns: [
      "collection-browser", "decision-review", "operations-library", "artifact-library", "run-inspector",
    ],
  },
  {
    id: "collaboration",
    title: "Collaboration",
    detail: "Ongoing agent conversations, attention queues and editable agent profiles.",
    patterns: [
      "conversation-panel", "attention-inbox", "agent-profile",
    ],
  },
];

export function PatternGallery() {
  return <main className="guide-templates template-gallery">
    <Stack gap={36}>
      <PageHeader title="Patterns" detail="Recommended component combinations for recurring OpenBoa product tasks." />
      {recommendedGroups.map(group => <section key={group.id} className="template-gallery-section" aria-labelledby={"patterns-" + group.id}>
        <Stack gap={6} className="template-gallery-heading">
          <Inline justify="between" align="center" gap={12}>
            <Heading level={2} id={"patterns-" + group.id}>{group.title}</Heading>
            <Badge tone="neutral">{group.patterns.length} patterns</Badge>
          </Inline>
          <Text variant="help">{group.detail}</Text>
        </Stack>
        <div className="template-gallery-board">
          {group.patterns.map(id => {
            const block = blocks.find(item => item.id === id)!;
            const title = id.split("-").map(word => word[0].toUpperCase() + word.slice(1)).join(" ");
            const scopeLabel = fullWidthPatterns.has(id) ? "Workspace" : "Focused panel";
            const visibleComponents = block.components.slice(0, 4);
            const extraCount = block.components.length - visibleComponents.length;
            return <article key={id} className="guide-pattern-item" data-pattern={id}>
              <Card
                variant="raised"
                className="guide-pattern-card"
                title={title}
                description={block.description}
                headerAction={<Badge tone="neutral" variant="soft">{scopeLabel}</Badge>}
                action={
                  <Inline justify="between" align="center" gap={8} className="guide-pattern-footer">
                    <Text variant="meta">{block.components.length} components</Text>
                    <Link className="guide-pattern-trigger" href={"/patterns/" + id} aria-label={"Open " + title}>
                      Open preview
                      <Icon name="next" />
                    </Link>
                  </Inline>
                }
              >
                <Text variant="meta" className="guide-pattern-summary">
                  {visibleComponents.join(" · ")}{extraCount > 0 ? ` · +${extraCount}` : ""}
                </Text>
              </Card>
            </article>;
          })}
        </div>
      </section>)}
      <section aria-labelledby="pattern-practice" className="template-gallery-section">
        <Stack gap={12}>
          <Stack gap={4}>
            <Heading level={2} id="pattern-practice">Build a screen</Heading>
            <Text variant="help">Focused studies and interactive screen foundations.</Text>
          </Stack>
          <Inline className="template-component-links">
            {[...recipeFamilies.map(family => ({ id: family.id, title: family.title })), ...studies, dashboard].map(item =>
              <Link key={item.id} className="guide-chip-link" href={"/patterns/" + item.id}>{item.title}</Link>)}
          </Inline>
        </Stack>
      </section>
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
  const componentIds = [...new Set(["card", ...recipe.components, ...(family.id === "metrics" && recipe.components.includes("chart") ? ["segmented-control"] : [])])];

  return <main className="guide-templates">
    <Stack gap={24}>
      <PageHeader title={family.title} action={<Link className="guide-chip-link" href="/patterns">All patterns</Link>} />
      <div className="template-family-controls">
        <Select label="Example" value={recipe.id} options={family.recipes.map(item => ({ id: item.id, label: item.title }))}
          onValueChange={setSelected} />
        <Button emphasis="quiet" size="compact" onClick={() => setReset(value => value + 1)}>Reset preview</Button>
      </div>
      <div className="template-stage template-recipe-preview" data-layout="centered" data-family={family.id} key={recipe.id + ":" + reset}>
        <Card title={recipe.title} description={recipe.detail}>
          <Preview family={family.id} recipe={recipe} appearance={appearance} />
        </Card>
      </div>
      <Stack gap={8}>
        <Heading level={2}>Components used</Heading>
        <Inline className="template-component-links">
          {componentIds.map(id => <Link key={id} className="guide-chip-link" href={"/components/" + id}>{id}</Link>)}
        </Inline>
      </Stack>
    </Stack>
  </main>;
}
