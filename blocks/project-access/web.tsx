"use client";

import { useState } from "react";
import { Button, ConfirmDialog, FieldError, Heading, Inline, Select, Stack, TextField } from "@openboa/yogurt";

export type ProjectRole = "view" | "edit";
type Member = { id: string; name: string; detail?: string; role: ProjectRole | "owner" };
const roles = [{ id: "view", label: "Can view" }, { id: "edit", label: "Can edit" }];

export function ProjectAccess({
  project, revision, members, onInvite, onChangeRole, onRemove,
  pending = false, error,
}: {
  project: {id: string; name: string};
  revision: string;
  members: readonly Member[];
  onInvite?: (projectId: string, email: string, role: ProjectRole, revision: string) => void;
  onChangeRole?: (projectId: string, memberId: string, role: ProjectRole, revision: string) => void;
  onRemove?: (projectId: string, memberId: string, revision: string) => void;
  pending?: boolean;
  error?: string;
}) {
  return <AccessForm key={project.id} {...{ project, revision, members, onInvite, onChangeRole, onRemove, pending, error }} />;
}

type AccessProps = Parameters<typeof ProjectAccess>[0];

function AccessForm({ project, revision, members, onInvite, onChangeRole, onRemove, pending, error }: AccessProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ProjectRole>("view");
  const [review, setReview] = useState<{ id: string; revision: string }>();
  const member = review?.revision === revision ? members.find((item) => item.id === review.id && item.role !== "owner") : undefined;
  return (
    <Stack gap={16}>
      <Heading>{project.name} access</Heading>
      {onInvite && (
        <form className="yg-access-invite" aria-label="Invite to project" onSubmit={(event) => {
          event.preventDefault();
          if (!pending && email.trim()) onInvite(project.id, email.trim(), role, revision);
        }}>
          <TextField label="Email address" type="email" autoComplete="email" required
            disabled={pending} value={email} onChange={(event) => setEmail(event.currentTarget.value)} />
          <Select label="Role" value={role} disabled={pending} options={roles}
            onChange={(event) => setRole(event.currentTarget.value as ProjectRole)} />
          <Button type="submit" pending={pending} pendingLabel="Inviting" disabled={!email.trim()}>Invite</Button>
        </form>
      )}
      {error && <FieldError role="alert">{error}</FieldError>}
      <ul className="yg-access-roster" aria-label="People with access">
        {members.map((item) => (
          <li key={item.id}>
            <div>
              <strong>{item.name}</strong>
              {item.detail && <div className="yg-meta">{item.detail}</div>}
            </div>
            {item.role === "owner" ? <span className="yg-meta">Owner</span> : (
              <Inline gap={8}>
                {onChangeRole
                  ? <Select label={"Access for " + item.name} value={item.role} options={roles} disabled={pending}
                    onChange={(event) => onChangeRole(project.id, item.id, event.currentTarget.value as ProjectRole, revision)} />
                  : <span className="yg-meta">{roles.find((entry) => entry.id === item.role)?.label}</span>}
                {onRemove && <Button emphasis="quiet" disabled={pending} onClick={() => setReview({ id: item.id, revision })}>Remove {item.name}</Button>}
              </Inline>
            )}
          </li>
        ))}
      </ul>
      {member && onRemove && (
        <ConfirmDialog open pending={pending} onOpenChange={(open) => { if (!open) setReview(undefined); }}
          decision={{ id: member.id, revision, title: "Remove " + member.name + "?",
            consequence: "They will lose access to this project.", confirmLabel: "Remove access", available: !pending }}
          onConfirm={() => {
            if (pending) return;
            onRemove(project.id, member.id, revision);
            setReview(undefined);
          }} />
      )}
    </Stack>
  );
}
