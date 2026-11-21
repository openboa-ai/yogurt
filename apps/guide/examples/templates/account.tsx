import { useState } from "react";
import { Button, Form, Heading, Inline, Notice, ProjectMark, Stack, Surface, Text, TextField } from "@openboa/yogurt";

export function AccountPreview({ id }: { id: string }) {
  const [mode, layout] = id.split("-");
  const signup = mode === "signup";
  const emailOnly = layout === "email";
  const title = signup ? "Create your account" : "Sign in to Fieldwork";
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [complete, setComplete] = useState(false);
  const emailError = attempted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const nameError = attempted && signup && !emailOnly && !name.trim();
  const passwordError = attempted && !emailOnly && password.length < 8;
  const hasArtwork = layout === "split" || layout === "framed";

  const form = <Stack gap={24} className="template-account-fields">
    <Inline><ProjectMark project="yogurt" label="" size={28} /><Text>Fieldwork</Text></Inline>
    <Stack gap={4}>
      <Heading>{complete ? (emailOnly ? "Check your inbox" : "You’re ready to continue") : title}</Heading>
      <Text variant="help">{emailOnly ? "Use a one-time link to continue." : "Your release notes and review work, all in one place."}</Text>
    </Stack>
    {complete ? <Stack gap={16}>
      <Notice title="Preview complete">{emailOnly ? "An email link would be sent in a connected product." : "A connected product would continue to your workspace."}</Notice>
      <Button emphasis="soft" onClick={() => { setComplete(false); setAttempted(false); }}>Start again</Button>
    </Stack> : <Form label={title} noValidate onSubmit={event => {
      event.preventDefault();
      setAttempted(true);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || (signup && !emailOnly && !name.trim()) || (!emailOnly && password.length < 8)) return;
      setPassword("");
      setComplete(true);
    }}>
      <Stack gap={16}>
        {signup && !emailOnly && <TextField label="Name" autoComplete="name" value={name} onChange={event => setName(event.target.value)} error={nameError ? "Enter your name." : undefined} />}
        <TextField type="email" label="Work email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} error={emailError ? "Enter a valid email address." : undefined} />
        {!emailOnly && <TextField type="password" label="Password" autoComplete={signup ? "new-password" : "current-password"} value={password}
          onChange={event => setPassword(event.target.value)} error={passwordError ? "Enter at least eight characters." : undefined} />}
        <Button type="submit">{emailOnly ? "Continue with email" : signup ? "Create account" : "Sign in"}</Button>
        <Text variant="help">Demo only. Use sample values.</Text>
      </Stack>
    </Form>}
  </Stack>;

  return <div className="template-account" data-layout={layout}>
    <div className="template-account-main">{layout === "muted" || layout === "framed" ? <Surface>{form}</Surface> : form}</div>
    {hasArtwork && <Surface className="template-account-art">
      <Stack gap={16}>
        <ProjectMark project="yogurt" label="" size={128} />
        <Heading>Make room for good work.</Heading>
        <Text>Share what changed, what’s next, and what still needs a decision.</Text>
      </Stack>
    </Surface>}
  </div>;
}
