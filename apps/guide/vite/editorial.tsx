import { useLayoutEffect, useMemo } from "react";
import { Heading, Inline, Link, ProjectMark, Stack, Text } from "@openboa/yogurt";
import brand from "../pages/index.html?raw";
import system from "../pages/system.html?raw";
import library from "../pages/library.html?raw";
import adoption from "../pages/adoption.html?raw";
import playbook from "../pages/playbook.html?raw";
import emoji from "../pages/emoji.html?raw";
import specimenCss from "../../../design/styles/specimen.css?inline";
import guideCss from "../../../design/styles/guide.css?inline";
import systemCss from "../../../design/styles/system.css?inline";
import libraryCss from "../../../design/styles/library.css?inline";
import playbookCss from "../../../design/styles/playbook.css?inline";
import menuCss from "../../../design/styles/action-menu.css?inline";
import emojiCss from "../../../design/styles/emoji.css?inline";
import "../runtime/system.js";
import "../runtime/eyes.js";
import "../runtime/action-menu.js";
import "../runtime/playbook-data.js";
import "../runtime/playbook.js";
import "../runtime/emoji-gallery.js";
import { canonicalGuideUrl } from "../guide-routes.mjs";

const documents = { brand, system, library, adoption, playbook, emoji };
const pageStyles = { system: systemCss, library: libraryCss, playbook: menuCss + playbookCss, emoji: emojiCss };

type EditorialId = keyof typeof documents;
type LegacyRuntime = Window & {
  mountYogurtSystem: () => void;
  mountYogurtEyes: () => void;
  mountYogurtPlaybook: () => () => void;
  mountYogurtEmojiGallery: () => void;
  yogurtEmojiCatalog?: unknown;
};

function resolveContent(id: EditorialId) {
  const doc = new DOMParser().parseFromString(documents[id], "text/html");
  const main = doc.querySelector("main")!;
  const base = new URL("/", location.href);
  for (const element of main.querySelectorAll<HTMLElement>("[href], [src]")) {
    for (const attribute of ["href", "src"]) {
      const value = element.getAttribute(attribute);
      if (!value || value.startsWith("#")) continue;
      const target = new URL(value, base);
      if (target.origin !== base.origin) continue;
      element.setAttribute(attribute, canonicalGuideUrl(target) ?? (target.pathname + target.search + target.hash));
    }
  }

  let title = "";
  let description = "";
  const opening = main.firstElementChild;
  if (id === "brand") {
    const signatureHeading = opening?.querySelector("h1");
    const signature = signatureHeading?.querySelector("img");
    if (signature && signatureHeading) signatureHeading.replaceWith(signature);
    opening?.classList.add("guide-company-story");
  } else {
    const heading = opening?.querySelector("h1");
    const paragraph = opening?.querySelector("p");
    title = heading?.textContent ?? "";
    description = paragraph?.textContent ?? "";
    heading?.remove();
    paragraph?.remove();
    if (!opening?.textContent?.trim()) opening?.remove();
  }
  return { body: { __html: main.innerHTML }, className: main.className, mainId: main.id, title, description };
}

export function EditorialPage({ id }: { id: EditorialId }) {
  const content = useMemo(() => resolveContent(id), [id]);
  useLayoutEffect(() => {
    const runtime = window as LegacyRuntime;
    let active = true;
    if (id === "system") runtime.mountYogurtSystem();
    if (id === "library") runtime.mountYogurtEyes();
    if (id === "playbook") return runtime.mountYogurtPlaybook();
    if (id === "emoji") {
      if (runtime.yogurtEmojiCatalog) runtime.mountYogurtEmojiGallery();
      else void import("../../../design/assets/emoji/catalog-data.js").then(() => {
        if (active) runtime.mountYogurtEmojiGallery();
      });
    }
    return () => { active = false; };
  }, [id]);

  return <div className="guide-editorial">
    <style>{specimenCss + guideCss + (pageStyles[id as keyof typeof pageStyles] ?? "")}</style>
    <main className={content.className} id={content.mainId || undefined}>
      {id === "brand" ? <section className="guide-home-intro" aria-labelledby="guide-title">
        <Stack gap={24}>
          <Stack gap={12}>
            <Inline gap={12} className="guide-home-title">
              <ProjectMark project="yogurt" label="" size={56} />
              <Heading level={1} id="guide-title" tabIndex={-1}>Yogurt</Heading>
            </Inline>
            <Text className="guide-home-tagline">ships with live cultures</Text>
            <Text className="guide-home-description">Yogurt is OpenBoa’s design system and UI SDK, with shared design tokens, artwork, product language, and components for web and native apps.</Text>
          </Stack>
          <Inline gap={8} className="guide-home-actions">
            <Link className="guide-cta" href="/components">Browse components</Link>
            <Link className="guide-cta guide-cta-secondary" href="/system">Explore the design system</Link>
          </Inline>
        </Stack>
      </section> : <section className="guide-editorial-intro">
        <Heading level={1} tabIndex={-1}>{content.title}</Heading>
        <Text className="guide-editorial-description">{content.description}</Text>
        {id === "library" && <Inline gap={16}>
          <Link href="/emoji">Browse emoji</Link>
          <Link href="/agents">Explore agent motion</Link>
        </Inline>}
        {id === "adoption" && <Link href="/playbook">Open the product playbook</Link>}
      </section>}
      <div className="guide-editorial-copy" dangerouslySetInnerHTML={content.body} />
    </main>
  </div>;
}
