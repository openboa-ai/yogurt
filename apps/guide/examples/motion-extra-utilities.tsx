import { useState, type ReactNode } from "react";
import { Button } from "@openboa/yogurt";
import { CartButton } from "@openboa/yogurt/motion-patterns";

function Player() {
  const tracks = ["Quiet morning", "Open windows", "After the rain"];
  const [track, setTrack] = useState(0), [playing, setPlaying] = useState(false);
  return <div className="utility-demo utility-player"><span className="utility-record" data-playing={playing || undefined} aria-hidden="true">♪</span><div><small>LOCAL PLAYER PREVIEW</small><strong>{tracks[track]}</strong><span role="status">{playing ? "Playing preview" : "Paused"}</span></div><div className="utility-row"><Button size="compact" emphasis="quiet" aria-label="Previous track" onClick={() => setTrack((track + 2) % 3)}>◀◀</Button><Button size="compact" onClick={() => setPlaying(!playing)}>{playing ? "Pause" : "Play"}</Button><Button size="compact" emphasis="quiet" aria-label="Next track" onClick={() => setTrack((track + 1) % 3)}>▶▶</Button></div></div>;
}
function Approval() {
  const [state, setState] = useState<"pending" | "approved" | "declined">("pending");
  return <div className="utility-demo utility-panel"><small>TOOL REQUEST</small><strong>Read project notes</strong><span>Allow this preview to use the selected notes?</span>{state === "pending" ? <div className="utility-row"><Button size="compact" emphasis="soft" onClick={() => setState("declined")}>Decline</Button><Button size="compact" onClick={() => setState("approved")}>Allow once</Button></div> : <><span role="status">{state === "approved" ? "Allowed in preview" : "Declined in preview"}</span><Button size="compact" emphasis="quiet" onClick={() => setState("pending")}>Reset</Button></>}</div>;
}
const groceries = [
  { id: "yogurt", name: "Greek yogurt", detail: "500 g", price: 420, icon: "M9 3h6m-5 0v4l-3 4v9h10v-9l-3-4V3M7 13h10", tone: "brand" },
  { id: "blueberries", name: "Blueberries", detail: "125 g", price: 350, icon: "M12 3v6m0-6c4 0 6 3 6 5M11 6C7 8 5 10 5 13m13 0c0 5-6 5-6 0s6-5 6 0zm-6 4c0 5-7 5-7 0s7-5 7 0z", tone: "accent" },
  { id: "granola", name: "Maple granola", detail: "300 g", price: 560, icon: "M4 16c0-6 5-10 11-10l4 4c-2 5-6 8-12 8l-3-2zm5-7 4 7m2-10 1 7", tone: "warning" },
];
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function Cart() {
  const [cart, setCart] = useState<Record<string, number>>({ blueberries: 2 });
  const [confirmed, setConfirmed] = useState(false);
  const subtotal = groceries.reduce((total, item) => total + item.price * (cart[item.id] ?? 0), 0);
  const count = Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  return (
    <section className="utility-cart" aria-label="Cart">
      <ul>
        {groceries.map(item => (
          <li key={item.id}>
            <span className="utility-cart-tile" data-tone={item.tone} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
            </span>
            <div className="utility-cart-product">
              <strong>{item.name}</strong>
              <span>{currency.format(item.price / 100)} · {item.detail}</span>
            </div>
            <CartButton label={item.name} quantity={cart[item.id] ?? 0} max={9}
              onQuantityChange={quantity => {
                setConfirmed(false);
                setCart(current => ({ ...current, [item.id]: quantity }));
              }} />
          </li>
        ))}
      </ul>
      <div className="utility-cart-total">
        <div><span>{count ? `Subtotal · ${count} ${count === 1 ? "item" : "items"}` : "Your cart is empty"}</span>
          <strong data-cart-subtotal>{currency.format(subtotal / 100)}</strong></div>
        <Button disabled={!count || confirmed} onClick={() => setConfirmed(true)}>
          {confirmed ? "Cart reviewed" : "Review cart"}
        </Button>
      </div>
    </section>
  );
}

function Dots() {
  const [page, setPage] = useState(0);
  const notes = ["Gather ideas", "Find a direction", "Make it happen", "Share the result"];
  return <div className="utility-demo utility-panel"><strong>{notes[page]}</strong><span>Step {page + 1} of {notes.length}</span><nav className="utility-dots" aria-label="Preview steps">{notes.map((note, i) => <button type="button" key={note} aria-label={`Step ${i + 1}: ${note}`} aria-current={i === page ? "step" : undefined} onClick={() => setPage(i)} />)}</nav></div>;
}
function Notifications() {
  const [enabled, setEnabled] = useState(false);
  return <div className="utility-demo"><button className="utility-bell" type="button" aria-label="Notifications" aria-pressed={enabled} onClick={() => setEnabled(!enabled)}><span aria-hidden="true">♢</span>{enabled && <i />}</button><strong>{enabled ? "Notifications on" : "Notifications off"}</strong><span role="status">Preview preference only</span></div>;
}
function Connection() {
  const [connected, setConnected] = useState(false);
  return <div className="utility-demo utility-panel"><div className="utility-row"><span className="utility-indicator" data-on={connected || undefined} /><strong>{connected ? "Connected" : "Disconnected"}</strong></div><span>Simulated workspace connection</span><Button size="compact" emphasis="soft" onClick={() => setConnected(!connected)}>{connected ? "Simulate disconnect" : "Simulate connect"}</Button></div>;
}
function Unlock() {
  const [unlocked, setUnlocked] = useState(false);
  return <div className="utility-demo utility-panel"><span className="utility-lock" aria-hidden="true">{unlocked ? "◡" : "⌒"}</span><strong>{unlocked ? "Preview unlocked" : "Preview locked"}</strong><span>No account or system setting changes.</span><Button size="compact" emphasis="soft" onClick={() => setUnlocked(!unlocked)}>{unlocked ? "Simulate lock" : "Simulate unlock"}</Button></div>;
}
function DynamicText() {
  const [name, setName] = useState("");
  return <div className="utility-demo"><label className="utility-label">Name<input value={name} maxLength={32} onChange={event => setName(event.target.value)} placeholder="Add your name" /></label><p className="utility-greeting">Hello, <strong>{name.trim() || "friend"}</strong>.</p><span>Make yourself at home.</span></div>;
}
function Volume() {
  const [volume, setVolume] = useState(60), [muted, setMuted] = useState(false);
  return <div className="utility-demo"><div className="utility-row"><strong>Preview volume</strong><output>{muted ? "Muted" : `${volume}%`}</output></div><input aria-label="Preview volume" type="range" min="0" max="100" value={volume} onChange={event => { setVolume(Number(event.target.value)); setMuted(false); }} /><Button size="compact" emphasis="soft" aria-pressed={muted} onClick={() => setMuted(!muted)}>{muted ? "Unmute" : "Mute"}</Button></div>;
}
export const extraUtilities: { id: string; title: string; body: ReactNode }[] = [
  { id: "music-player", title: "Music player", body: <Player /> },
  { id: "tool-approval", title: "Tool approval", body: <Approval /> },
  { id: "cart-button", title: "Cart button", body: <Cart /> },
  { id: "pagination-dots", title: "Pagination dots", body: <Dots /> },
  { id: "notification-bell", title: "Notification bell", body: <Notifications /> },
  { id: "connection-state", title: "Connection state", body: <Connection /> },
  { id: "unlock-state", title: "Unlock state", body: <Unlock /> },
  { id: "dynamic-text", title: "Dynamic text", body: <DynamicText /> },
  { id: "volume-control", title: "Volume control", body: <Volume /> },
];
