import { useState, type ReactNode, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useT } from "~/lib/i18n";

const nameSchema = z.string().min(2).max(80);

interface NewProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiUrl: string;
}

interface CreateProjectResponse {
  data: { id: string; slug: string } | null;
  error: { message: string } | null;
}

export function NewProjectModal({
  open,
  onOpenChange,
  apiUrl,
}: NewProjectModalProps): ReactNode {
  const t = useT();
  const navigate = useNavigate();
  const [name, setName] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);

    const parsed = nameSchema.safeParse(name.trim());
    if (!parsed.success) {
      setError(t.newProjectModal.error);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/projects`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: parsed.data }),
      });
      const json = (await res.json()) as CreateProjectResponse;
      if (!res.ok || !json.data) {
        setError(json.error?.message ?? t.newProjectModal.error);
        return;
      }
      onOpenChange(false);
      setName("");
      navigate(`/projects/${json.data.slug}/edit`);
    } catch {
      setError(t.newProjectModal.error);
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpenChange(next: boolean): void {
    if (submitting) return;
    if (!next) {
      setError(null);
    }
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent closeAriaLabel={t.newProjectModal.closeAria}>
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>{t.newProjectModal.title}</DialogTitle>
            <DialogDescription>
              {t.newProjectModal.description}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-2">
            <Label htmlFor="new-project-name">
              {t.newProjectModal.nameLabel}
            </Label>
            <Input
              id="new-project-name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t.newProjectModal.namePlaceholder}
              autoFocus
              minLength={2}
              maxLength={80}
              disabled={submitting}
              aria-invalid={error ? true : undefined}
            />
            {error ? (
              <p className="text-xs text-destructive" role="alert">
                {error}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
            >
              {t.newProjectModal.cancel}
            </Button>
            <Button type="submit" disabled={submitting || name.trim().length < 2}>
              {submitting
                ? t.newProjectModal.submitting
                : t.newProjectModal.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
