import { useEffect, useId, useRef, useState } from "react";
import { Icon, InputGroup } from "@openboa/yogurt";

export function SpringInputExample() {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<"idle" | "invalid" | "flying" | "done">("idle");
  useEffect(() => () => clearTimeout(timeout.current), []);

  function submit() {
    if (result === "flying" || result === "done") return;
    if (value.trim().length < 2) {
      setResult("invalid");
      input.current?.focus();
      return;
    }
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) setResult("done");
    else {
      setResult("flying");
      timeout.current = setTimeout(() => setResult("done"), 250 + Array.from(value).length * 16);
    }
    input.current?.blur();
  }

  return <form className="motion-spring-field" data-result={result} onSubmit={event => { event.preventDefault(); submit(); }}>
    <InputGroup id={id} ref={input} label="Name this workspace" motion="spring"
      containerClassName="motion-spring-field-control" value={value}
      aria-invalid={result === "invalid" || undefined}
      aria-describedby={result === "invalid" ? `${id}-feedback` : undefined}
      readOnly={result === "flying" || result === "done"}
      onChange={event => { setValue(event.currentTarget.value); setResult("idle"); }}
      trailing={<button type={result === "done" ? "button" : "submit"} aria-label={result === "done" ? "Rename workspace" : "Use name"}
        onClick={result === "done" ? () => { setValue(""); setResult("idle"); input.current?.focus(); } : undefined}>
        <Icon name={result === "done" ? "check" : "arrow"} />
      </button>} />
    <span id={`${id}-feedback`} role="status">
      {result === "invalid" ? "Enter at least two characters." : result === "done" ? "Workspace named" : ""}
    </span>
  </form>;
}
