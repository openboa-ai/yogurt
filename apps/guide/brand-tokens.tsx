import { useState } from "react";
import {
  Heading,
  Text,
  Stack,
  ProjectMark,
  Inline,
  Select,
} from "@openboa/yogurt";
import brand from "../../catalog/brand.json";
import palette from "../../design/tokens/brand.json";
import ui from "../../design/tokens/ui.json";
import language from "../../design/content/terms.json";
export function BrandTokens() {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const index = mode === "light" ? 0 : 1;
  const color = (path: string) => {
    const [family, step] = path.split(".");
    return (palette.color as Record<string, Record<string, string>>)[family][
      step
    ];
  };
  return (
    <div className="brand-reference">
      <header className="catalog-intro">
        <p className="catalog-family">OpenBoa</p>
        <h1>Brand &amp; tokens</h1>
        <p>
          {
            language.terms.find((t) => t.id === "repository.yogurt")
              ?.description
          }
        </p>
      </header>
      <Stack gap={24}>
        <section>
          <Heading>{brand.companyLine}</Heading>
          <Inline gap={16}>
            <ProjectMark project="openboa" size={42} />
            <ProjectMark project="yogurt" />
            <ProjectMark project="sourdough" />
            <ProjectMark project="meatball" />
          </Inline>
          <p>{brand.rules[0].body}</p>
          <Text variant="help">{brand.rules[1].body}</Text>
        </section>
        <section>
          <Heading>Palette roles</Heading>
          <div className="brand-mode">
            <Select
              label="Appearance"
              options={[
                { id: "light", label: "Light" },
                { id: "dark", label: "Dark" },
              ]}
              value={mode}
              onChange={(e) => setMode(e.target.value as typeof mode)}
            />
          </div>
          <div className="brand-role-grid">
            {[
              "canvas",
              "surface",
              "field",
              "text",
              "muted",
              "brand",
              "action",
              "action-soft",
              "danger",
              "success",
              "warning",
              "accent",
            ].map((key) => {
              const path = (ui.roles as Record<string, string[]>)[key][index];
              return (
                <div key={key}>
                  <span style={{ background: color(path) }} />
                  <div>
                    {key}
                    <small>
                      {path} · {color(path)}
                    </small>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <section>
          <Heading>Working rules</Heading>
          <dl>
            {brand.rules.slice(2).map((rule) => (
              <div key={rule.id}>
                <dt>{rule.title}</dt>
                <dd>{rule.body}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section>
          <Heading>Product language</Heading>
          <dl>
            {language.terms
              .filter(
                (t) => t.id.startsWith("action.") || t.id.startsWith("state."),
              )
              .map((t) => (
                <div key={t.id}>
                  <dt>{t.term}</dt>
                  <dd>{t.context}</dd>
                </div>
              ))}
          </dl>
        </section>
      </Stack>
    </div>
  );
}
