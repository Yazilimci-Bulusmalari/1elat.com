import { useState } from "react";
import { useRouteLoaderData } from "react-router";
import {
  User,
  Link2,
  KeyRound,
  Bell,
  Trash2,
  Upload,
  ImagePlus,
  X,
  AlertTriangle,
  ArrowRight,
  Globe,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Separator } from "~/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";
import { useT } from "~/lib/i18n";
import type { loader as authLoader } from "./_auth";
import type { AuthUser } from "~/lib/auth";

type SettingsTab = "account" | "linked" | "password" | "notifications" | "delete";

interface TabItem {
  id: SettingsTab;
  label: string;
  icon: typeof User;
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function GitHubIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function AccountTab({ user, apiUrl, t }: { user: AuthUser; apiUrl: string; t: ReturnType<typeof useT> }): React.ReactElement {
  const s = t.settings.account;
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    bio: user.bio ?? "",
    location: user.location ?? "",
    website: user.website ?? "",
    githubUrl: user.githubUrl ?? "",
    linkedinUrl: user.linkedinUrl ?? "",
    twitterUrl: user.twitterUrl ?? "",
  });

  function handleChange(field: string, value: string): void {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch(`${apiUrl}/users/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">{s.title}</h2>
        <p className="text-sm text-muted-foreground">{s.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <Label className="text-sm font-medium">{s.profilePhoto}</Label>
          <div className="mt-3 flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.username} />
              ) : null}
              <AvatarFallback className="text-lg">
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" className="gap-1.5">
                <Upload className="h-3.5 w-3.5" />
                {s.uploadPhoto}
              </Button>
              <Button type="button" variant="outline" size="sm" className="gap-1.5">
                <ImagePlus className="h-3.5 w-3.5" />
                {s.choosePhoto}
              </Button>
              {user.avatarUrl ? (
                <Button type="button" variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive">
                  <X className="h-3.5 w-3.5" />
                  {s.removePhoto}
                </Button>
              ) : null}
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{s.maxSize}</p>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">{s.fullName}</Label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="fullName"
                value={form.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                placeholder={s.firstNamePlaceholder}
              />
              <Input
                value={form.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                placeholder={s.lastNamePlaceholder}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">{s.username}</Label>
            <Input
              id="username"
              value={form.username}
              onChange={(e) => handleChange("username", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {s.usernameHint}{form.username}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{s.email}</Label>
            <Input
              id="email"
              value={user.email}
              disabled
              className="bg-muted/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">{s.bio}</Label>
            <Textarea
              id="bio"
              value={form.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              placeholder={s.bioPlaceholder}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{s.location}</Label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder={s.locationPlaceholder}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <Label className="text-sm font-medium">{s.socialLinks}</Label>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted/50">
                <Globe className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                value={form.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder={s.websitePlaceholder}
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted/50">
                <GitHubIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                value={form.githubUrl}
                onChange={(e) => handleChange("githubUrl", e.target.value)}
                placeholder="https://github.com/username"
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted/50">
                <LinkedInIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                value={form.linkedinUrl}
                onChange={(e) => handleChange("linkedinUrl", e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted/50">
                <TwitterIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                value={form.twitterUrl}
                onChange={(e) => handleChange("twitterUrl", e.target.value)}
                placeholder="https://x.com/username"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? s.saving : saved ? s.saved : s.save}
          </Button>
        </div>
      </form>
    </div>
  );
}

function LinkedAccountsTab({ user, t }: { user: AuthUser; t: ReturnType<typeof useT> }): React.ReactElement {
  const s = t.settings.linkedAccounts;
  const hasGithub = !!user.githubId;
  const hasGoogle = !!user.googleId;
  const bothLinked = hasGithub && hasGoogle;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">{s.title}</h2>
        <p className="text-sm text-muted-foreground">{s.description}</p>
      </div>

      {bothLinked ? (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <div>
            <p className="text-sm text-amber-700 dark:text-amber-400">{s.passwordWarning}</p>
            <button
              type="button"
              className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:underline dark:text-amber-400"
            >
              {s.setPassword} <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <GitHubIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">{s.github}</p>
              {hasGithub ? (
                <p className="text-xs text-muted-foreground">{user.email}</p>
              ) : null}
            </div>
          </div>
          {hasGithub ? (
            <Button variant="outline" size="sm">{s.remove}</Button>
          ) : (
            <Button variant="outline" size="sm">{s.connect}</Button>
          )}
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <GoogleIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">{s.google}</p>
              {hasGoogle ? (
                <p className="text-xs text-muted-foreground">{user.email}</p>
              ) : null}
            </div>
          </div>
          {hasGoogle ? (
            <Button variant="outline" size="sm">{s.remove}</Button>
          ) : (
            <Button variant="outline" size="sm">{s.connect}</Button>
          )}
        </div>
      </div>
    </div>
  );
}

function PasswordTab({ t }: { t: ReturnType<typeof useT> }): React.ReactElement {
  const s = t.settings.password;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">{s.title}</h2>
        <p className="text-sm text-muted-foreground">{s.description}</p>
      </div>

      <form className="max-w-md space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">{s.currentPassword}</Label>
          <Input id="currentPassword" type="password" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">{s.newPassword}</Label>
          <Input id="newPassword" type="password" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{s.confirmPassword}</Label>
          <Input id="confirmPassword" type="password" />
        </div>
        <Button type="submit">{s.update}</Button>
      </form>
    </div>
  );
}

function NotificationsTab({ t }: { t: ReturnType<typeof useT> }): React.ReactElement {
  const s = t.settings.notifications;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">{s.title}</h2>
        <p className="text-sm text-muted-foreground">{s.description}</p>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="text-sm font-medium">{s.marketing}</p>
            <p className="text-xs text-muted-foreground">{s.marketingDescription}</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="text-sm font-medium">{s.updates}</p>
            <p className="text-xs text-muted-foreground">{s.updatesDescription}</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="text-sm font-medium">{s.security}</p>
            <p className="text-xs text-muted-foreground">{s.securityDescription}</p>
          </div>
          <Switch defaultChecked />
        </div>
      </div>
    </div>
  );
}

function DeleteAccountTab({ user, t }: { user: AuthUser; t: ReturnType<typeof useT> }): React.ReactElement {
  const s = t.settings.deleteAccount;
  const [confirmEmail, setConfirmEmail] = useState("");

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-destructive">{s.title}</h2>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
        <p className="text-sm text-destructive">{s.warning}</p>
      </div>

      <form className="max-w-md space-y-4">
        <div className="space-y-2">
          <Label htmlFor="confirmEmail">{s.confirmLabel}</Label>
          <Input
            id="confirmEmail"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            placeholder={user.email}
          />
        </div>
        <Button
          type="submit"
          variant="destructive"
          disabled={confirmEmail !== user.email}
        >
          {s.button}
        </Button>
      </form>
    </div>
  );
}

export default function SettingsPage(): React.ReactElement {
  const data = useRouteLoaderData<typeof authLoader>("routes/_auth");
  if (!data) throw new Error("Missing auth layout data");

  const { user, apiUrl } = data;
  const t = useT();
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  const tabs: TabItem[] = [
    { id: "account", label: t.settings.tabs.account, icon: User },
    { id: "linked", label: t.settings.tabs.linkedAccounts, icon: Link2 },
    { id: "password", label: t.settings.tabs.password, icon: KeyRound },
    { id: "notifications", label: t.settings.tabs.notifications, icon: Bell },
    { id: "delete", label: t.settings.tabs.deleteAccount, icon: Trash2 },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">{t.settings.title}</h1>

      <div className="flex flex-col gap-8 md:flex-row">
        <nav className="flex shrink-0 flex-row gap-1 overflow-x-auto md:w-52 md:flex-col">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                tab.id === "delete" && activeTab === tab.id && "text-destructive",
              )}
            >
              <tab.icon className="h-4 w-4 shrink-0" />
              {tab.label}
            </button>
          ))}
        </nav>

        <Separator orientation="vertical" className="hidden h-auto self-stretch md:block" />

        <div className="min-w-0 flex-1">
          {activeTab === "account" && <AccountTab user={user} apiUrl={apiUrl} t={t} />}
          {activeTab === "linked" && <LinkedAccountsTab user={user} t={t} />}
          {activeTab === "password" && <PasswordTab t={t} />}
          {activeTab === "notifications" && <NotificationsTab t={t} />}
          {activeTab === "delete" && <DeleteAccountTab user={user} t={t} />}
        </div>
      </div>
    </div>
  );
}
