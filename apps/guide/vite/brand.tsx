import {
  ButtonGroup, Disclosure, Grid, Heading, Inline, Link, NavigationList,
  ProjectMark, Stack, Surface, Text,
} from "@openboa/yogurt";
import tokens from "../../../design/tokens/brand.json";
import { GuideSection } from "./guides/layout";
import "./brand.css";

const chapters = [
  ["family", "Names"], ["voice", "Voice"], ["logo", "Logo"],
  ["type", "Type and color"], ["files", "Files"],
].map(([id, label]) => ({ id, label, href: "#" + id }));

const names = [
  { project: "meatball", slogan: "keep the ball rolling", detail: "A familiar invitation to keep work moving already has the word “ball” in it." },
  { project: "sourdough", slogan: "put the dough to work", detail: "Dough is something a baker works with and an everyday word for money." },
  { project: "yogurt", slogan: "ships with live cultures", detail: "A spoonful of yogurt carries its culture into the next batch. This kit carries OpenBoa’s words, type and shapes into the next product." },
] as const;

const signature = "/assets/logo/openboa-lockup.svg";
const artwork = [
  { title: "Horizontal signature", href: signature, width: 150, height: 30, detail: "Introduce OpenBoa on a company page, a cover or a presentation." },
  { title: "Upright 9", href: "/assets/logo/upright-9.svg", width: 48, height: 48, detail: "Use the company symbol in a compact position." },
  { title: "Wordmark", href: "/assets/logo/openboa-wordmark.svg", width: 120, height: 27, detail: "Use the outlined name alone for a company credit." },
];

const resources = [
  { label: "Logo artwork", links: artwork.map(item => ({ label: item.title, href: item.href })) },
  { label: "Web fonts", links: [
    { label: "Upright WOFF2", href: "/assets/fonts/rethink-sans/rethink-sans.woff2" },
    { label: "Italic WOFF2", href: "/assets/fonts/rethink-sans/rethink-sans-italic.woff2" },
  ] },
  { label: "App fonts", links: [
    { label: "Upright TTF", href: "/assets/fonts/rethink-sans/rethink-sans.ttf" },
    { label: "Italic TTF", href: "/assets/fonts/rethink-sans/rethink-sans-italic.ttf" },
  ] },
  { label: "Design tokens and styles", links: [
    { label: "Token JSON", href: "/tokens/brand.json" },
    { label: "CSS variables", href: "/styles/tokens.css" },
    { label: "Font stylesheet", href: "/styles/brand.css" },
    { label: "Component stylesheet", href: "/styles/components.css" },
  ] },
];

export default function BrandPage() {
  return <main className="guide-brand">
    <Grid className="guide-brand-opening" gap={32}>
      <Stack className="guide-brand-title" gap={12}>
        <Text variant="help">OpenBoa design system</Text>
        <Heading level={1}>Yogurt</Heading>
      </Stack>
      <Stack className="guide-brand-intro" gap={16}>
        <Text className="guide-brand-slogan">ships with <strong>live cultures</strong></Text>
        <Text className="guide-brand-description">Shared design tokens, original artwork, product language, and a UI SDK for browsers and desktop WebViews.</Text>
        <ButtonGroup label="Explore Yogurt">
          <Link href="/tokens" emphasis="soft" size="regular">Explore the design system</Link>
          <Link href="/components" emphasis="filled" tone="brand" size="regular">Browse components</Link>
        </ButtonGroup>
      </Stack>
      <Surface className="guide-brand-artwork" aria-hidden="true">
        <ProjectMark project="yogurt" label="" size={240} />
      </Surface>
    </Grid>
    <Stack gap={36} className="guide-brand-body">
      <NavigationList label="Brand guide sections" items={chapters} current="" orientation="horizontal" />
      <section id="identity" className="guide-company-story" aria-label="OpenBoa company introduction">
        <Grid className="guide-company-layout" gap={32}>
          <img src={signature} alt="OpenBoa" width={184} height={37} />
          <Stack gap={12}>
            <Heading>Every limit has a shelf life.</Heading>
            <Text>A good idea can be a few years early. OpenBoa builds products and businesses around what people can now do with AI.</Text>
          </Stack>
        </Grid>
      </section>
      <GuideSection id="family" title="The OpenBoa family">
        <Text>Write OpenBoa with a capital O and B in company introductions and credits. Lead with the project’s own name when someone is using it. Keep repository names lowercase.</Text>
        <Grid className="guide-brand-cards" gap={24}>
          {names.map(({ project, slogan, detail }) => <article key={project}>
            <Stack gap={8}>
              <ProjectMark project={project} label="" size={32} />
              <Heading level={3}>{project}</Heading>
              <Text>{slogan}</Text>
              <Text variant="help">{detail}</Text>
            </Stack>
          </article>)}
        </Grid>
        <Text>Kai and Sol each have a familiar silhouette. Use the name and silhouette together where someone chooses or returns to an agent.</Text>
        <Inline gap={16}><Link href="/library#emoji">Project emoji</Link><Link href="/agents">Agent family</Link></Inline>
      </GuideSection>
      <GuideSection id="voice" title="Voice">
        <Text>“Shelf life” gives a big claim an ordinary unit of time. The About copy follows it back to the person whose idea arrived early.</Text>
        <Text>A repository description can reward a second reading. Someone looking for a missing agent needs the result and a way forward. The roster says <strong>No matching agents.</strong> The button reads <strong>Clear filters</strong>.</Text>
        <Disclosure label="Plainspoken copy study">
          <Stack gap={12}>
            <Text><strong>Home.</strong> We can build more of what we imagine.</Text>
            <Text><strong>About.</strong> OpenBoa develops products and businesses with AI at their core. We start with what people want to do.</Text>
          </Stack>
        </Disclosure>
        <Link href="/content/terms.json" download>English terms by context</Link>
      </GuideSection>
      <GuideSection id="logo" title="Logo">
        <Text>The small notch on Kai’s top edge repeats nine times around one uneven outline. It gives the company and its agents a family resemblance. The company signs with Upright 9.</Text>
        <Stack gap={24}>
          {artwork.map(item => <Grid key={item.href} className="guide-brand-asset-row" gap={24}>
            <Surface className="guide-brand-art">
              <img src={item.href} width={item.width} height={item.height} alt="" />
            </Surface>
            <Stack gap={8}>
              <Heading level={3}>{item.title}</Heading>
              <Text>{item.detail}</Text>
              <Inline><Link href={item.href} download aria-label={`Download ${item.title.toLowerCase()} SVG`}>Download SVG</Link></Inline>
            </Stack>
          </Grid>)}
        </Stack>
        <Stack id="wordmark-study"><Disclosure label="Signature proportions and placement">
          <Stack gap={12}>
            <Text>Use the horizontal SVG as one piece. In the B2 construction, the flat capital B is 60 units high and the visible symbol is 80. The symbol-to-name gap is 18 units. The symbol’s center sits 3 units below the capital’s center.</Text>
            <Surface className="guide-brand-art"><img src={signature} width={160} height={32} alt="OpenBoa horizontal signature on paper" /></Surface>
            <Text variant="help">The supplied ink-blue and dark-lettered artwork reads on paper. Use a paper surface when placing it on a dark page.</Text>
          </Stack>
        </Disclosure></Stack>
      </GuideSection>
      <GuideSection id="type" title="Type and color">
        <Text>Use Rethink Sans for headings, paragraphs and interface labels. Use weight {tokens.type.roleWeight.heading} for headings, {tokens.type.roleWeight.body} for paragraphs and {tokens.type.roleWeight.ui} for interface labels. The outlined OpenBoa signature uses weight {tokens.type.roleWeight.wordmark}. Use tabular figures for IDs and times.</Text>
        <Text>Upright 9 defines OpenBoa’s primary color, Ink blue (<code>slate.700</code>). Kai’s sage and Sol’s terracotta come from the same numbered palette as the interface.</Text>
        <Inline gap={16}><Link href="/tokens#type">Type scale</Link><Link href="/tokens#color">Shared palette</Link><Link href="/#wordmark-study">Wordmark study</Link></Inline>
      </GuideSection>
      <GuideSection id="files" title="Files">
        <Grid className="guide-brand-cards" gap={24}>
          {resources.map(({ label, links }) => <Stack key={label} gap={8}>
            <Heading level={3}>{label}</Heading>
            {links.map(link => <Link key={link.href} href={link.href} download>{link.label}</Link>)}
          </Stack>)}
        </Grid>
        <Inline gap={16}>
          <Link href="/library">Design sources</Link>
          <Link href="/adoption#intent">Use in an intent</Link>
          <Link href="/assets/fonts/rethink-sans/OFL.txt">Typeface license</Link>
        </Inline>
      </GuideSection>
    </Stack>
  </main>;
}
