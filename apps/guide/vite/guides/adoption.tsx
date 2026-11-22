import { ButtonGroup, Card, CodeBlock, Inline, Link, Stack, Text } from "@openboa/yogurt";
import { GuideGrid, GuidePage, GuideSection } from "./layout";

const chapters = [
  ["setup", "Project setup"], ["platforms", "Platforms"], ["brief", "Bring a task"], ["intent", "Intent"],
  ["ownership", "Ownership"], ["checks", "Verification"], ["releases", "Adopt and upgrade"], ["improve", "Improve"],
] as const;
const config = {
  surfaces: {site: {target: "web", root: "apps/site"}, desktop: {target: "native", root: "apps/desktop"}},
  englishCopy: ["content/en"],
  intents: ["docs/intents"],
};

export default function AdoptionGuide() {
  return <GuidePage title="Use yogurt in a project" detail="OpenBoa projects share a vocabulary, a visual identity and familiar ways to interact. Each project owns what its product does and the words that describe its work."
    chapters={chapters} action={<ButtonGroup label="Adopt Yogurt">
      <Link href="#brief" emphasis="soft" size="touch">Compose a screen</Link>
      <Link href="#setup" emphasis="filled" size="touch">Set up a project</Link>
    </ButtonGroup>}>
    <GuideSection id="setup" title="Bind a project once">
      <Text>Put <code>yogurt.config.json</code> at the project root. Name the surfaces to check and where the project keeps English copy and intents.</Text>
      <CodeBlock language="JSON" code={JSON.stringify(config, null, 2)} />
      <Text>Pin Yogurt in the consumer. Keep the web lockfile and Native build inputs consistent with the version the project has reviewed.</Text>
      <Inline gap={16}><Link href="/docs/using-yogurt.md#first-screen">First screen setup</Link><Link href="/docs/using-yogurt.md#set-up-an-agent">Set up the Yogurt plugin</Link></Inline>
    </GuideSection>
    <GuideSection id="platforms" title="Build the client">
      <GuideGrid>
        <Card title="Next.js and Vite"><Text>Install the Web entry and load its shared styles and fonts. Import components from the public package.</Text></Card>
        <Card title="Vercel Native SDK"><Text>Use the supported SDK pin in the app’s dependency manifest. Install the Yogurt components and tokens, then use the app’s standard Native build.</Text></Card>
        <Card title="Embedded web content"><Text>Use the Web entry in a WebView. The app handles native navigation and focus handoff.</Text></Card>
      </GuideGrid>
      <Inline gap={16}><Link href="/docs/using-yogurt.md#web">Web installation</Link><Link href="/docs/using-yogurt.md#zig-and-vercel-native-sdk">Native SDK pin, build and packaging</Link></Inline>
    </GuideSection>
    <GuideSection id="brief" title="Bring a product task">
      <Text>Start with what someone needs to do. Ask the agent to build a screen to find a record, open it and return with the same search. The agent uses the task map to select a composition from your pinned SDK.</Text>
      <Inline gap={16}><Link href="/DESIGN.md#find-the-task">Find a task pattern</Link>
        <Link href="/docs/screen-composition.md#worked-compositions">Worked compositions</Link>
        <Link href="/docs/component-composition.md">Choose components</Link></Inline>
    </GuideSection>
    <GuideSection id="intent" title="Reference it in an intent">
      <Text>Describe the person, the task and what success looks like. Reference the Yogurt components, words and patterns that affect that experience.</Text>
      <Card title="Return to a record">
        <Stack gap={8}>
          <Text>Search by name or ID, open the result and return to the same query and selected record.</Text>
          <Text>The project defines which records are visible and owns the search, selection and detail data.</Text>
          <Text>Verify that a search with no matches keeps the query visible. Clearing it restores the list.</Text>
          <Link href="/docs/screen-composition.md#collections-and-detail">See the collection composition</Link>
        </Stack>
      </Card>
      <Link href="/DESIGN.md">Agent entry</Link>
    </GuideSection>
    <GuideSection id="ownership" title="What travels together">
      <GuideGrid>
        <Card title="Identity and words"><Text>Use the logo masters, project emoji, approved company copy and contextual English terms from one release.</Text></Card>
        <Card title="Design and behavior"><Text>Use shared type, dimensions, palette and component states across web and native renderers.</Text></Card>
        <Card title="Authoring and checks"><Text>Use the same rule IDs and examples for product authoring and CI.</Text></Card>
      </GuideGrid>
      <Inline gap={16}><Link href="/content/terms.json">English terms</Link><Link href="/#files">Artwork and fonts</Link><Link href="/system">Design system</Link></Inline>
    </GuideSection>
    <GuideSection id="checks" title="What a release must prove">
      <Text>Exercise the default, empty and recovered states. Check keyboard access, accessible names, visible focus, contrast and actual screens in both appearances on each supported renderer.</Text>
      <Text>Verify the pinned artifacts, available targets, notices and product vocabulary. Compare responsiveness on the same target and fixture.</Text>
      <Link href="/docs/design-system-rules.md">Design system rules</Link>
    </GuideSection>
    <GuideSection id="releases" title="Adopt and upgrade">
      <Text>Pilot one real task. Record the results by target, turn on checks in the consumer and upgrade the project pin through a reviewed change.</Text>
    </GuideSection>
    <GuideSection id="improve" title="Improve yogurt itself">
      <Text>Bring the screen, the task and a reproducible example. Define the expected behavior, update the shared source and verify it on the affected renderer.</Text>
      <Link href="/docs/repository.md">Repository blueprint</Link>
    </GuideSection>
  </GuidePage>;
}
