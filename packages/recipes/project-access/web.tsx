"use client";

import { useState } from "react";
import {
  ActionMenu,
  Avatar,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  FieldError,
  FormRow,
  Inline,
  List,
  ListRow,
  Select,
  Stack,
  Status,
  TextField,
} from "@openboa/yogurt";

export type ProjectRole = "view" | "edit";
type Member = { id: string; name: string; detail?: string; role: ProjectRole | "owner" };
const roles = [{ id: "view", label: "Can view" }, { id: "edit", label: "Can edit" }];

export function ProjectAccess({
  project, revision, members, onInvite, onChangeRole, onRemove,
  pending = false, error,
}: {
  project: { id: string; name: string };
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
  const [copiedId, setCopiedId] = useState<string>();
  const member = review?.revision === revision ? members.find((item) => item.id === review.id && item.role !== "owner") : undefined;

  function copyMemberId(id: string) {
    setCopiedId(id);
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(id).catch(() => {});
    }
  }

  return (
    <Card
      title={`${project.name} access`}
      description="Invite collaborators and manage project permissions."
      headerAction={
        <Badge tone="neutral" dot={false}>
          {members.length} {members.length === 1 ? "member" : "members"}
        </Badge>
      }
    >
      <Stack gap={14}>
        {onInvite && (
          <form
            aria-label="Invite to project"
            onSubmit={(event) => {
              event.preventDefault();
              if (!pending && email.trim()) {
                onInvite(project.id, email.trim(), role, revision);
                setEmail("");
              }
            }}
          >
            <FormRow className="yg-access-invite" align="end">
              <TextField
                label="Email"
                type="email"
                placeholder="name@openboa.ai"
                autoComplete="email"
                required
                disabled={pending}
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
              />
              <Select
                label="Role"
                className="yg-access-role-select"
                value={role}
                disabled={pending}
                options={roles}
                onValueChange={(next) => setRole(next as ProjectRole)}
              />
              <Button
                type="submit"
                emphasis="filled"
                tone="brand"
                pending={pending}
                pendingLabel="Inviting"
                disabled={!email.trim()}
              >
                Invite
              </Button>
            </FormRow>
          </form>
        )}
        {error && <FieldError role="alert">{error}</FieldError>}
        <List label="People with access" divided className="yg-access-list">
          {members.map((item) => (
            <ListRow
              key={item.id}
              leading={<Avatar label={item.name} size={28} />}
              title={item.name}
              inlineMeta={item.role === "owner" ? <Badge tone="neutral" variant="soft">Owner</Badge> : undefined}
              description={item.detail}
              value={
                item.role === "owner"
                  ? "Full control"
                  : !onChangeRole
                    ? roles.find((entry) => entry.id === item.role)?.label
                    : undefined
              }
              actions={
                item.role === "owner" ? undefined : (
                  <Inline gap={6} wrap={false} className="yg-access-member-controls">
                    {onChangeRole && (
                      <Select
                        label={"Access for " + item.name}
                        hiddenLabel
                        size="compact"
                        className="yg-access-role-select"
                        value={item.role}
                        options={roles}
                        disabled={pending}
                        onValueChange={(next) =>
                          onChangeRole(project.id, item.id, next as ProjectRole, revision)
                        }
                      />
                    )}
                    <ActionMenu
                      label={"Actions for " + item.name}
                      triggerVariant="more"
                      triggerSize="compact"
                      onSelect={(actionId) => {
                        if (actionId === "copy-id") copyMemberId(item.id);
                        else if (actionId === "remove") setReview({ id: item.id, revision });
                      }}
                      items={[
                        { id: "copy-id", label: "Copy member ID" },
                        ...(onRemove
                          ? [{ id: "remove", label: "Remove", tone: "danger" as const, separatorBefore: true }]
                          : []),
                      ]}
                    />
                  </Inline>
                )
              }
            />
          ))}
        </List>
        {copiedId && <Status tone="success">Copied member ID: {copiedId}</Status>}
        {member && onRemove && (
          <ConfirmDialog
            open
            pending={pending}
            onOpenChange={(open) => {
              if (!open) setReview(undefined);
            }}
            decision={{
              id: member.id,
              revision,
              title: "Remove " + member.name + "?",
              consequence: "They will lose access to this project.",
              confirmLabel: "Remove access",
              available: !pending,
              destructive: true,
            }}
            onConfirm={() => {
              if (pending) return;
              onRemove(project.id, member.id, revision);
              setReview(undefined);
            }}
          />
        )}
      </Stack>
    </Card>
  );
}
