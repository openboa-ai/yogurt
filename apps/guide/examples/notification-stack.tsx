import { useRef, useState } from "react";
import { Button, ToastStack } from "@openboa/yogurt";

type Notice = { id: string; message: string };

export function NotificationStackExample() {
  const [items, setItems] = useState<Notice[]>([]);
  const count = useRef(0);
  function add() {
    const id = ++count.current;
    setItems(current => [{ id: String(id), message: `Update ${id} received.` }, ...current]);
  }
  return <div className="motion-sample-stack motion-notice-example">
    <div className="motion-notice-actions">
      <Button size="compact" emphasis="soft" onClick={add}>Add notification</Button>
    </div>
    <ToastStack label="Recent notifications" presentation="stacked" swipe items={items}
      onDismiss={id => setItems(current => current.filter(notice => notice.id !== id))} />
  </div>;
}
