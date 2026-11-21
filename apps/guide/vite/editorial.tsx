import { useLayoutEffect, useMemo } from "react";
import { ButtonGroup, Heading, Link, PageHeader, ProjectMark } from "@openboa/yogurt";
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
      {id === "brand" ? <PageHeader className="guide-home-intro" featured title="Yogurt"
        leading={<ProjectMark project="yogurt" label="" size={56} />}
        subtitle="ships with live cultures"
        detail="Yogurt is OpenBoa’s design system and UI SDK, with shared design tokens, artwork, product language, and components for web and native apps."
        action={<ButtonGroup label="Explore Yogurt">
          <Link href="/system" emphasis="soft" size="touch">Explore the design system</Link>
          <Link href="/components" emphasis="filled" size="touch">Browse components</Link>
        </ButtonGroup>} /> : <PageHeader className="guide-editorial-intro" title={content.title} detail={content.description}
        action={id === "library" ? <ButtonGroup label="Explore design sources">
          <Link href="/agents" emphasis="soft" size="touch">Explore agent motion</Link>
          <Link href="/emoji" emphasis="filled" size="touch">Browse emoji</Link>
        </ButtonGroup> : id === "adoption" ? <Link href="/playbook" emphasis="filled" size="touch">Open the product playbook</Link> : undefined} />}
      {id === "system" && <section className="guide-composition" id="screen-composition">
        <Heading>Screen composition</Heading>
        <p>Use PageHeader for the screen’s title and context. Align the title, body and actions to one reading edge. Keep 6 px between title and detail, 8 px between neighboring actions, 16 px between header content and its actions, and 24 px between sections.</p>
        <p>In an action group, put alternatives first and the single filled action last. Keep that order when actions wrap. Use links to open destinations and buttons to change state. Standalone browsing screens can use quiet links alone.</p>
        <Link href="/components/top">Inspect the PageHeader component</Link>
        <Link href="/docs/design-system-rules.md">Read the Web and Native composition rules</Link>
      </section>}
      <div className="guide-editorial-copy" dangerouslySetInnerHTML={content.body} />
    </main>
  </div>;
}
