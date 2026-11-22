import { useState, type KeyboardEvent } from "react";
import {
  Asset, Button, ButtonGroup, Card, Checkbox, CopyButton, Grid, Heading, Inline,
  Link, Pagination, Result, SearchField, Select, Stack, Surface, Text,
} from "@openboa/yogurt";
import catalog from "../../../../design/assets/emoji/catalog.json";
import { GuidePage } from "./layout";

const pageSize = 48;
const featured = ["1f60a", "26f4-fe0f", "1f992", "1f3b7", "1f525", "1f3a8", "1f52d", "1f433", "1f1f0-1f1f7", "1f44d", "1f4ee", "1f6a3"];
const synonyms: Record<string, string> = {
  "1f680": "launch ship space", "1f60a": "happy smile", "1f914": "hmm consider", "1f4a1": "idea",
  "1f44d": "yes like approve", "1f44e": "no dislike", "1f602": "lol laugh", "1f388": "party celebrate", "1f331": "grow plant",
};
const ranks = new Map(featured.map((id, index) => [id, index]));
const glyph = (id: string) => String.fromCodePoint(...id.split("-").map(code => parseInt(code, 16)));
const normalize = (text: string) => text.toLowerCase().replaceAll("\uFE0F", "").trim();
const ordered = [...catalog.items].sort((a, b) => (ranks.get(a.id) ?? Infinity) - (ranks.get(b.id) ?? Infinity))
  .map(item => ({ ...item, search: normalize([item.name, item.group, item.subgroup, item.id, glyph(item.id), synonyms[item.id]].join(" ")) }));
type Emoji = typeof ordered[number];
const groupOptions = [{id: "", label: "All groups"}, ...catalog.groups.map(id => ({id, label: id}))];

function artwork(item: Emoji, format: "svg" | "png", color: string) {
  const variant = color === "peach" && item.variants?.includes("peach") ? "variants/peach/" : "";
  return "/assets/emoji/" + variant + format + "/" + item.id + "." + format;
}
function handleGridKeys(event: KeyboardEvent<HTMLDivElement>) {
  const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
  if (!keys.includes(event.key)) return;
  const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
  const index = buttons.indexOf(event.target as HTMLButtonElement);
  if (index < 0) return;
  const columns = getComputedStyle(event.currentTarget).gridTemplateColumns.split(" ").length;
  const next = [index - 1, index + 1, index - columns, index + columns, 0, buttons.length - 1][keys.indexOf(event.key)];
  event.preventDefault();
  const button = buttons[Math.max(0, Math.min(next, buttons.length - 1))];
  button.focus();
  button.click();
}
function EmojiDetail({ item, color, onColorChange, ink, onInkChange }: {
  item: Emoji; color: string; onColorChange: (value: string) => void; ink: boolean; onInkChange: (value: boolean) => void;
}) {
  const svg = artwork(item, "svg", color);
  return <Card title="Selected emoji">
    <Stack gap={16}>
      <Surface className="guide-proof" data-ink={ink || undefined}>
        <Stack gap={12}>
          <img src={svg} width="100" height="100" alt="" />
          <Inline>{[16, 24, 32].map(size => <img key={size} src={svg} width={size} height={size} alt={size + " pixels"} />)}</Inline>
        </Stack>
      </Surface>
      <Stack gap={4}>
        <Heading id="emoji-name" level={4}>{item.name}</Heading>
        <Text variant="help">{item.group}{item.repertoire.includes("preview") && " · Unicode 18 preview"}</Text>
        <Text>{item.id.split("-").map(code => "U+" + code.toUpperCase().padStart(4, "0")).join(" ")}</Text>
      </Stack>
      <Checkbox label="Ink surface" checked={ink} onCheckedChange={value => onInkChange(value === true)} />
      {item.variants?.includes("peach") && <Select label="Face color" value={color}
        options={[{id: "yellow", label: "Bright yellow"}, {id: "peach", label: "Soft peach"}]}
        onChange={event => onColorChange(event.currentTarget.value)} />}
      <ButtonGroup label="Emoji files">
        <Link href={svg} download emphasis="soft">SVG</Link>
        <Link href={artwork(item, "png", color)} download emphasis="soft">128 px PNG</Link>
        <CopyButton value={glyph(item.id)} />
      </ButtonGroup>
    </Stack>
  </Card>;
}

export default function EmojiGallery() {
  const params = new URLSearchParams(location.search);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("");
  const [color, setColor] = useState(params.get("color") === "peach" ? "peach" : "yellow");
  const [ink, setInk] = useState(false);
  const [selected, setSelected] = useState(params.get("emoji"));
  const [page, setPage] = useState(() => 1 + Math.floor(Math.max(0, ordered.findIndex(item => item.id === selected)) / pageSize));
  const words = normalize(query).replace(/u\+0*([\da-f]+)/g, "$1").split(/\s+/).filter(Boolean);
  const results = !words.length && !group ? ordered : ordered.filter(item =>
    (!group || item.group === group) && words.every(word => item.search.includes(word)));
  const visible = results.slice((page - 1) * pageSize, page * pageSize);
  const active = visible.find(item => item.id === selected) ?? visible[0];
  function clear() {
    setGroup("");
    setQuery("");
    setPage(1);
    document.getElementById("emoji-search")?.focus();
  }
  return <GuidePage title="Emoji" id="emoji-gallery" detail="Find a reaction, a gesture or an object. Original OpenBoa artwork in editable SVG and transparent PNG.">
    <Stack gap={24}>
      <Grid gap={16} className="guide-pairs">
        <SearchField id="emoji-search" label="Find an emoji" placeholder="Name, emoji or code point" value={query}
          onValueChange={value => { setQuery(value); setPage(1); }} />
        <Select id="emoji-group" label="Group" options={groupOptions} value={group}
          onChange={event => { setGroup(event.currentTarget.value); setPage(1); }} />
      </Grid>
      <Grid gap={24} className="guide-emoji-layout">
        <Stack gap={12}>
          <Inline gap={12}><Text role="status">{results.length.toLocaleString("en")} emoji</Text>
            {(query || group) && <Button emphasis="quiet" onClick={clear}>Clear filters</Button>}
          </Inline>
          {visible.length ? <Grid gap={4} id="emoji-grid" className="guide-emoji-tiles"
            role="group" aria-label="Choose an emoji" onKeyDown={handleGridKeys}>
            {visible.map(item => <Button key={item.id} emphasis="quiet" size="touch" title={item.name}
              aria-pressed={item.id === active.id} tabIndex={item.id === active.id ? 0 : -1}
              aria-label={item.name} onClick={() => setSelected(item.id)}>
              <Asset size={28}><img src={artwork(item, "svg", color)} width="28" height="28" alt="" /></Asset>
            </Button>)}
          </Grid> : <Result title="No matching emoji.">Try another name, group or code point.</Result>}
          {results.length > pageSize && <Pagination page={page} pages={Math.ceil(results.length / pageSize)} onPageChange={setPage} label="Result pages" />}
        </Stack>
        {active && <EmojiDetail item={active} color={color} onColorChange={setColor} ink={ink} onInkChange={setInk} />}
      </Grid>
      <Text variant="help">Copy character uses the recipient’s system emoji. Download the original artwork to keep the OpenBoa drawing.</Text>
      <Inline gap={16}><Link href="/assets/emoji/README.md">Artwork and file guide</Link>
        <Link href="/assets/emoji/catalog.json" download>Catalog JSON</Link><Link href="/library#emoji">Project emoji</Link></Inline>
    </Stack>
  </GuidePage>;
}
