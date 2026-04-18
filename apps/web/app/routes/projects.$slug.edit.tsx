import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  redirect,
  useFetcher,
  useLoaderData,
  useLocation,
  useRevalidator,
} from "react-router";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";

import type { Route } from "./+types/projects.$slug.edit";
import type {
  ProjectDetail,
  ProjectInvitationWithDetails,
  ProjectMemberWithUser,
} from "@1elat/shared";
import { getAuthUser, type AuthUser } from "~/lib/auth";
import { useT } from "~/lib/i18n";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
import { RichTextEditor } from "~/components/projects/rich-text-editor";
import { LogoUploader } from "~/components/projects/logo-uploader";
import { GalleryUploader } from "~/components/projects/gallery-uploader";
import {
  TagsSection,
  type TagsValue,
} from "~/components/projects/tags-section";
import { TeamSection } from "~/components/projects/team-section";
import { PreviewSection } from "~/components/projects/preview-section";
import { PROJECT_GALLERY_MAX_COUNT } from "@1elat/shared";
import { cn } from "~/lib/utils";

const DESCRIPTION_MIN_CHARS = 120;

function htmlToText(html: string): number {
  // Strip tags client-side; equivalent to editor.getText().length but
  // works on the parent state without holding an editor reference.
  if (!html) return 0;
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim().length;
}

type PricingModel = "free" | "freemium" | "paid" | "open_source";

interface LookupItem {
  id: string;
  slug: string;
  nameEn: string;
  nameTr: string;
  icon: string | null;
}

interface Lookups {
  categories: LookupItem[];
  types: LookupItem[];
  stages: LookupItem[];
}

interface EditLoaderData {
  apiUrl: string;
  user: AuthUser;
  project: ProjectDetail;
  members: ProjectMemberWithUser[];
  invitations: ProjectInvitationWithDetails[];
  lookups: Lookups;
}

interface ApiEnvelope<T> {
  data: T | null;
  error: { message: string; missingFields?: string[] } | null;
}

async function safeFetchJson<T>(
  url: string,
  cookie: string,
): Promise<T[]> {
  try {
    const res = await fetch(url, { headers: { cookie } });
    if (!res.ok) return [];
    const json = (await res.json()) as ApiEnvelope<T[]>;
    return json.data ?? [];
  } catch {
    return [];
  }
}

export async function loader({
  request,
  params,
  context,
}: Route.LoaderArgs): Promise<EditLoaderData> {
  const apiUrl =
    context.cloudflare?.env?.API_URL ?? "http://127.0.0.1:8787";
  const user = await getAuthUser(request, apiUrl);
  if (!user) {
    throw redirect("/auth/login");
  }
  const slug = params.slug;
  if (!slug) {
    throw redirect("/projects");
  }
  const cookie = request.headers.get("cookie") ?? "";
  const base = `${apiUrl}/p/${encodeURIComponent(user.username)}/${encodeURIComponent(slug)}`;

  // Parallel fetch: project detail (required) + members + invitations (best-effort).
  // allSettled ensures one endpoint failing doesn't block the page.
  const [projectRes, membersResult, invitationsResult, lookupsResult] = await Promise.allSettled([
    fetch(base, { headers: { cookie } }),
    safeFetchJson<ProjectMemberWithUser>(`${base}/members`, cookie),
    safeFetchJson<ProjectInvitationWithDetails>(`${base}/invitations`, cookie),
    (async (): Promise<Lookups> => {
      try {
        const r = await fetch(`${apiUrl}/lookups`, { headers: { cookie } });
        if (!r.ok) return { categories: [], types: [], stages: [] };
        const j = (await r.json()) as ApiEnvelope<Lookups>;
        return j.data ?? { categories: [], types: [], stages: [] };
      } catch {
        return { categories: [], types: [], stages: [] };
      }
    })(),
  ]);

  if (projectRes.status !== "fulfilled") {
    throw new Response("Load failed", { status: 500 });
  }
  const res = projectRes.value;
  if (res.status === 404) {
    throw redirect("/projects");
  }
  if (!res.ok) {
    throw new Response("Load failed", { status: res.status });
  }
  const json = (await res.json()) as ApiEnvelope<ProjectDetail>;
  if (!json.data) {
    throw redirect("/projects");
  }

  const members =
    membersResult.status === "fulfilled" ? membersResult.value : [];
  const invitations =
    invitationsResult.status === "fulfilled" ? invitationsResult.value : [];

  const lookups: Lookups =
    lookupsResult.status === "fulfilled"
      ? lookupsResult.value
      : { categories: [], types: [], stages: [] };

  return { apiUrl, user, project: json.data, members, invitations, lookups };
}

type SectionKey =
  | "basic"
  | "description"
  | "media"
  | "links"
  | "tags"
  | "team"
  | "settings"
  | "preview";

const SECTION_ORDER: SectionKey[] = [
  "basic",
  "description",
  "media",
  "links",
  "tags",
  "team",
  "settings",
  "preview",
];

const PLACEHOLDER_PHASES: Partial<Record<SectionKey, string>> = {};

type PublishableField =
  | "name"
  | "tagline"
  | "description"
  | "categoryId"
  | "typeId"
  | "stageId"
  | "links"
  | "images";

const FIELD_TO_SECTION: Record<PublishableField, SectionKey> = {
  name: "basic",
  tagline: "basic",
  description: "description",
  categoryId: "tags",
  typeId: "tags",
  stageId: "tags",
  links: "links",
  images: "media",
};

interface FormState {
  name: string;
  tagline: string;
  slug: string;
  description: string;
  launchStory: string;
  websiteUrl: string;
  repoUrl: string;
  demoUrl: string;
  categoryId: string;
  typeId: string;
  stageId: string;
  pricingModel: PricingModel | "";
  isOpenSource: boolean;
  isPublic: boolean;
  isSeekingInvestment: boolean;
  isSeekingTeammates: boolean;
}

function projectToFormState(project: ProjectDetail): FormState {
  return {
    name: project.name ?? "",
    tagline: project.tagline ?? "",
    slug: project.slug ?? "",
    description: project.description ?? "",
    launchStory: project.launchStory ?? "",
    websiteUrl: project.websiteUrl ?? "",
    repoUrl: project.repoUrl ?? "",
    demoUrl: project.demoUrl ?? "",
    categoryId: project.categoryId ?? "",
    typeId: project.typeId ?? "",
    stageId: project.stageId ?? "",
    pricingModel: (project.pricingModel ?? "") as PricingModel | "",
    isOpenSource: Boolean(project.isOpenSource),
    isPublic: Boolean(project.isPublic),
    isSeekingInvestment: Boolean(project.isSeekingInvestment),
    isSeekingTeammates: Boolean(project.isSeekingTeammates),
  };
}

function computeCompletion(project: ProjectDetail, state: FormState): number {
  const checks: boolean[] = [
    state.name.trim().length >= 2,
    state.tagline.trim().length > 0,
    htmlToText(state.description) >= DESCRIPTION_MIN_CHARS,
    Boolean(state.categoryId),
    Boolean(state.typeId),
    Boolean(state.stageId),
    Boolean(
      state.websiteUrl.trim() ||
        state.repoUrl.trim() ||
        state.demoUrl.trim(),
    ),
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

function projectToTagsValue(project: ProjectDetail): TagsValue {
  return {
    categoryId: project.categoryId ?? null,
    typeId: project.typeId ?? null,
    stageId: project.stageId ?? null,
    technologyIds:
      project.technologies?.map((tech) => tech.id) ??
      project.technologyIds ??
      [],
    tags: project.tags ?? [],
  };
}

export default function ProjectEditPage(): ReactNode {
  const { user, project, members, invitations, lookups } =
    useLoaderData<typeof loader>();
  const t = useT();
  const location = useLocation();
  const revalidator = useRevalidator();

  const activeSection: SectionKey = useMemo(() => {
    const hash = location.hash.replace("#", "");
    if (SECTION_ORDER.includes(hash as SectionKey)) {
      return hash as SectionKey;
    }
    return "basic";
  }, [location.hash]);

  const [state, setState] = useState<FormState>(() =>
    projectToFormState(project),
  );
  const [tagsState, setTagsState] = useState<TagsValue>(() =>
    projectToTagsValue(project),
  );
  const initialRef = useRef<FormState>(projectToFormState(project));
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedAt = useRef<number | null>(null);
  const pendingPayload = useRef<Partial<FormState> | null>(null);

  const patchFetcher = useFetcher<ApiEnvelope<ProjectDetail>>();
  const publishFetcher = useFetcher<ApiEnvelope<ProjectDetail>>();

  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);

  useEffect(() => {
    const fresh = projectToFormState(project);
    setState(fresh);
    initialRef.current = fresh;
    setTagsState(projectToTagsValue(project));
  }, [project]);

  useEffect(() => {
    if (patchFetcher.state === "idle" && patchFetcher.data?.data) {
      lastSavedAt.current = Date.now();
    }
  }, [patchFetcher.state, patchFetcher.data]);

  useEffect(() => {
    if (publishFetcher.state === "idle" && publishFetcher.data) {
      if (publishFetcher.data.data) {
        setPublishMessage(t.projectEdit.publish.success);
        setMissingFields([]);
        revalidator.revalidate();
      } else if (publishFetcher.data.error) {
        setPublishMessage(
          publishFetcher.data.error.message || t.projectEdit.publish.failed,
        );
        if (publishFetcher.data.error.missingFields) {
          setMissingFields(publishFetcher.data.error.missingFields);
        }
      }
    }
  }, [publishFetcher.state, publishFetcher.data, revalidator, t]);

  function sendPatch(delta: Partial<FormState>): void {
    const payload: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(delta)) {
      if (value === "" && key !== "name" && key !== "slug") {
        payload[key] = null;
      } else {
        payload[key] = value;
      }
    }
    patchFetcher.submit(JSON.stringify(payload), {
      method: "PATCH",
      action: `/api/projects/${project.slug}`,
      encType: "application/json",
    });
  }

  function scheduleSave(
    next: FormState,
    changedKeys: (keyof FormState)[],
  ): void {
    if (changedKeys.length === 0) return;
    const delta: Partial<FormState> = {};
    for (const key of changedKeys) {
      (delta as Record<string, unknown>)[key as string] = next[key];
    }
    pendingPayload.current = { ...(pendingPayload.current ?? {}), ...delta };
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      const payload = pendingPayload.current;
      pendingPayload.current = null;
      if (payload) sendPatch(payload);
    }, 800);
  }

  function handleChange<K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ): void {
    setState((prev) => {
      const next = { ...prev, [key]: value };
      scheduleSave(next, [key]);
      return next;
    });
  }

  function handleRetry(): void {
    if (pendingPayload.current) {
      const payload = pendingPayload.current;
      pendingPayload.current = null;
      sendPatch(payload);
      return;
    }
    const dirty: Partial<FormState> = {};
    (Object.keys(state) as (keyof FormState)[]).forEach((key) => {
      if (state[key] !== initialRef.current[key]) {
        (dirty as Record<string, unknown>)[key as string] = state[key];
      }
    });
    if (Object.keys(dirty).length > 0) sendPatch(dirty);
  }

  const hasDirty = (Object.keys(state) as (keyof FormState)[]).some(
    (key) => state[key] !== initialRef.current[key],
  );
  const autosaveStatus: "idle" | "saving" | "saved" | "error" = patchFetcher
    .data?.error
    ? "error"
    : patchFetcher.state !== "idle"
      ? "saving"
      : lastSavedAt.current
        ? "saved"
        : hasDirty
          ? "idle"
          : "idle";

  const completion = computeCompletion(project, state);

  // TODO: Detay sayfasi Faz D'de eklenecek; simdilik link 404 donebilir.
  const previewHref = `/p/${user.username}/${project.slug}`;

  const missingSections = new Set<SectionKey>();
  for (const f of missingFields) {
    const section = FIELD_TO_SECTION[f as PublishableField];
    if (section) missingSections.add(section);
  }

  const sectionLabels: Record<SectionKey, string> = {
    basic: t.projectEdit.sections.basic,
    description: t.projectEdit.sections.description,
    media: t.projectEdit.sections.media,
    links: t.projectEdit.sections.links,
    tags: t.projectEdit.sections.tags,
    team: t.projectEdit.sections.team,
    settings: t.projectEdit.sections.settings,
    preview: t.projectEdit.sections.preview,
  };

  return (
    <div className="flex flex-col">
      <EditPageHeader
        status={project.status}
        title={t.projectEdit.title}
        backToProjectsLabel={t.projectEdit.backToProjects}
        previewLabel={t.projectEdit.actions.preview}
        previewHref={previewHref}
        publishLabel={t.projectEdit.actions.publish}
        publishingLabel={t.projectEdit.actions.publishing}
        unpublishLabel={t.projectEdit.actions.unpublish}
        restoreLabel={t.projectEdit.actions.restore}
        autosaveStatus={autosaveStatus}
        autosaveLabels={{
          idle: t.projectEdit.autosave.idle,
          saving: t.projectEdit.autosave.saving,
          saved: t.projectEdit.autosave.saved,
          error: t.projectEdit.autosave.error,
          retry: t.projectEdit.actions.retry,
        }}
        onRetry={handleRetry}
        onPublish={() => {
          setPublishMessage(null);
          setMissingFields([]);
          publishFetcher.submit(null, {
            method: "POST",
            action: `/api/projects/${project.slug}?intent=publish`,
          });
        }}
        onUnpublish={() => {
          publishFetcher.submit(null, {
            method: "POST",
            action: `/api/projects/${project.slug}?intent=unpublish`,
          });
        }}
        onRestore={() => {
          publishFetcher.submit(null, {
            method: "POST",
            action: `/api/projects/${project.slug}?intent=restore`,
          });
        }}
        publishPending={publishFetcher.state !== "idle"}
      />

      {missingFields.length > 0 ? (
        <div className="mx-auto w-full max-w-6xl px-4 pt-4">
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1">
              <p className="font-medium">
                {t.projectEdit.publish.missingFields}
              </p>
              <ul className="mt-1 space-y-0.5 text-xs">
                {(() => {
                  const fieldLabels = t.projectEdit.publish.fieldLabels as Record<string, string>;
                  const bySection = new Map<SectionKey, string[]>();
                  for (const f of missingFields) {
                    const section = FIELD_TO_SECTION[f as PublishableField] ?? "basic";
                    const label = fieldLabels[f] ?? f;
                    const arr = bySection.get(section) ?? [];
                    if (!arr.includes(label)) arr.push(label);
                    bySection.set(section, arr);
                  }
                  return Array.from(bySection.entries()).map(([section, fields]) => (
                    <li key={section}>
                      <span className="font-medium">{sectionLabels[section]}:</span>{" "}
                      {fields.join(", ")}
                    </li>
                  ));
                })()}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      {publishMessage && missingFields.length === 0 ? (
        <div className="mx-auto w-full max-w-6xl px-4 pt-4">
          <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm text-primary">
            <Check className="h-4 w-4" />
            <span>{publishMessage}</span>
          </div>
        </div>
      ) : null}

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <SectionNav
          activeSection={activeSection}
          completion={completion}
          completionLabel={t.projectEdit.progress.label.replace(
            "{percent}",
            String(completion),
          )}
          sectionLabels={sectionLabels}
          missingSections={missingSections}
        />

        <div className="min-w-0">
          {activeSection === "basic" ? (
            <BasicSection
              state={state}
              onChange={handleChange}
              lookups={lookups}
              locale={t.nav.projects === "Projects" ? "en" : "tr"}
              labels={{
                title: sectionLabels.basic,
                name: t.projectEdit.basic.name,
                namePlaceholder: t.projectEdit.basic.namePlaceholder,
                tagline: t.projectEdit.basic.tagline,
                taglinePlaceholder: t.projectEdit.basic.taglinePlaceholder,
                taglineCounter: t.projectEdit.basic.taglineCounter,
                slug: t.projectEdit.basic.slug,
                slugLocked: t.projectEdit.basic.slugLocked,
                category: t.projectEdit.basic.category,
                categoryPlaceholder: t.projectEdit.basic.categoryPlaceholder,
                type: t.projectEdit.basic.type,
                typePlaceholder: t.projectEdit.basic.typePlaceholder,
                stage: t.projectEdit.basic.stage,
                stagePlaceholder: t.projectEdit.basic.stagePlaceholder,
              }}
              slugLocked={project.status === "published"}
            />
          ) : null}
          {activeSection === "links" ? (
            <LinksSection
              state={state}
              onChange={handleChange}
              labels={{
                title: sectionLabels.links,
                website: t.projectEdit.links.website,
                repo: t.projectEdit.links.repo,
                demo: t.projectEdit.links.demo,
              }}
            />
          ) : null}
          {activeSection === "settings" ? (
            <SettingsSection
              state={state}
              onChange={handleChange}
              labels={{
                title: sectionLabels.settings,
                pricingModel: t.projectEdit.settings.pricingModel,
                pricing: t.projectEdit.settings.pricing,
                isOpenSource: t.projectEdit.settings.isOpenSource,
                isPublic: t.projectEdit.settings.isPublic,
                isSeekingInvestment: t.projectEdit.settings.isSeekingInvestment,
                isSeekingTeammates: t.projectEdit.settings.isSeekingTeammates,
              }}
            />
          ) : null}
          {activeSection === "description" ? (
            <DescriptionSection
              description={state.description}
              launchStory={state.launchStory}
              onChangeDescription={(html) => handleChange("description", html)}
              onChangeLaunchStory={(html) => handleChange("launchStory", html)}
              labels={{
                title: t.projectEdit.description.title,
                descriptionLabel: t.projectEdit.description.descriptionLabel,
                descriptionHint: t.projectEdit.description.descriptionHint,
                descriptionMin: t.projectEdit.description.descriptionMin,
                launchStoryLabel: t.projectEdit.description.launchStoryLabel,
                launchStoryHint: t.projectEdit.description.launchStoryHint,
                placeholderDescription:
                  t.projectEdit.description.placeholder.description,
                placeholderLaunchStory:
                  t.projectEdit.description.placeholder.launchStory,
                charCount: t.projectEdit.description.charCount,
              }}
              editorLabels={t.projectEdit.editor}
            />
          ) : null}
          {activeSection === "media" ? (
            <MediaSection
              slug={project.slug}
              logoUrl={project.thumbnailUrl}
              images={project.images}
              labels={{
                title: t.projectEdit.media.title,
                logo: t.projectEdit.media.logo,
                gallery: {
                  ...t.projectEdit.media.gallery,
                  limitReached:
                    t.projectEdit.media.gallery.limitReached.replace(
                      "{max}",
                      String(PROJECT_GALLERY_MAX_COUNT),
                    ),
                },
                errors: t.projectEdit.media.errors,
              }}
            />
          ) : null}
          {activeSection !== "basic" &&
          activeSection !== "links" &&
          activeSection !== "settings" &&
          activeSection !== "description" &&
          activeSection !== "media" ? (
            <PlaceholderSection
              title={sectionLabels[activeSection]}
              message={t.projectEdit.sections.placeholder.replace(
                "{phase}",
                PLACEHOLDER_PHASES[activeSection] ?? "E.4",
              )}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

interface EditPageHeaderProps {
  status: ProjectDetail["status"];
  title: string;
  backToProjectsLabel: string;
  previewLabel: string;
  previewHref: string;
  publishLabel: string;
  publishingLabel: string;
  unpublishLabel: string;
  restoreLabel: string;
  autosaveStatus: "idle" | "saving" | "saved" | "error";
  autosaveLabels: {
    idle: string;
    saving: string;
    saved: string;
    error: string;
    retry: string;
  };
  onRetry: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onRestore: () => void;
  publishPending: boolean;
}

function EditPageHeader({
  status,
  title,
  backToProjectsLabel,
  previewLabel,
  previewHref,
  publishLabel,
  publishingLabel,
  unpublishLabel,
  restoreLabel,
  autosaveStatus,
  autosaveLabels,
  onRetry,
  onPublish,
  onUnpublish,
  onRestore,
  publishPending,
}: EditPageHeaderProps): ReactNode {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3">
        <a
          href="/dashboard/projects"
          className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label={backToProjectsLabel}
          title={backToProjectsLabel}
        >
          <ArrowLeft className="h-4 w-4" />
        </a>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold tracking-tight md:text-lg">
            {title}
          </h1>
          <AutosaveIndicator
            status={autosaveStatus}
            labels={autosaveLabels}
            onRetry={onRetry}
          />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={previewHref}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>{previewLabel}</span>
          </a>
          {status === "draft" ? (
            <Button size="sm" onClick={onPublish} disabled={publishPending}>
              {publishPending ? publishingLabel : publishLabel}
            </Button>
          ) : null}
          {status === "published" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={onUnpublish}
              disabled={publishPending}
            >
              {unpublishLabel}
            </Button>
          ) : null}
          {status === "archived" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={onRestore}
              disabled={publishPending}
            >
              {restoreLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

interface AutosaveIndicatorProps {
  status: "idle" | "saving" | "saved" | "error";
  labels: {
    idle: string;
    saving: string;
    saved: string;
    error: string;
    retry: string;
  };
  onRetry: () => void;
}

function AutosaveIndicator({
  status,
  labels,
  onRetry,
}: AutosaveIndicatorProps): ReactNode {
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      {status === "saving" ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>{labels.saving}</span>
        </>
      ) : null}
      {status === "saved" ? (
        <>
          <Check className="h-3 w-3 text-primary" />
          <span>{labels.saved}</span>
        </>
      ) : null}
      {status === "error" ? (
        <>
          <AlertCircle className="h-3 w-3 text-destructive" />
          <span className="text-destructive">{labels.error}</span>
          <button
            type="button"
            onClick={onRetry}
            className="ml-1 underline hover:no-underline"
          >
            {labels.retry}
          </button>
        </>
      ) : null}
      {status === "idle" ? <span>{labels.idle}</span> : null}
    </div>
  );
}

interface SectionNavProps {
  activeSection: SectionKey;
  completion: number;
  completionLabel: string;
  sectionLabels: Record<SectionKey, string>;
  missingSections: Set<SectionKey>;
}

function SectionNav({
  activeSection,
  completion,
  completionLabel,
  sectionLabels,
  missingSections,
}: SectionNavProps): ReactNode {
  return (
    <nav
      aria-label="Section navigation"
      className="md:sticky md:top-20 md:self-start"
    >
      <div className="mb-3 space-y-1">
        <p className="text-xs font-medium text-muted-foreground">
          {completionLabel}
        </p>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${completion}%` }}
            role="progressbar"
            aria-valuenow={completion}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
      <ul className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
        {SECTION_ORDER.map((key) => (
          <li key={key} className="shrink-0">
            <a
              href={`#${key}`}
              className={cn(
                "flex items-center justify-between gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors md:w-full",
                activeSection === key
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              <span>{sectionLabels[key]}</span>
              {missingSections.has(key) ? (
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full bg-destructive"
                  aria-hidden="true"
                />
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

interface BasicSectionProps {
  state: FormState;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  lookups: Lookups;
  locale: "tr" | "en";
  labels: {
    title: string;
    name: string;
    namePlaceholder: string;
    tagline: string;
    taglinePlaceholder: string;
    taglineCounter: string;
    slug: string;
    slugLocked: string;
    category: string;
    categoryPlaceholder: string;
    type: string;
    typePlaceholder: string;
    stage: string;
    stagePlaceholder: string;
  };
  slugLocked: boolean;
}

function BasicSection({
  state,
  onChange,
  labels,
  slugLocked,
  lookups,
  locale,
}: BasicSectionProps): ReactNode {
  const nameOf = (item: LookupItem): string =>
    locale === "tr" ? item.nameTr : item.nameEn;
  const selectClass =
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";
  return (
    <section id="basic" aria-labelledby="basic-title" className="space-y-6">
      <h2 id="basic-title" className="text-xl font-semibold">
        {labels.title}
      </h2>
      <div className="space-y-2">
        <Label htmlFor="field-name">{labels.name}</Label>
        <Input
          id="field-name"
          value={state.name}
          maxLength={80}
          minLength={2}
          placeholder={labels.namePlaceholder}
          onChange={(e) => onChange("name", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="field-tagline">{labels.tagline}</Label>
          <span className="text-xs text-muted-foreground">
            {labels.taglineCounter.replace(
              "{count}",
              String(state.tagline.length),
            )}
          </span>
        </div>
        <Input
          id="field-tagline"
          value={state.tagline}
          maxLength={80}
          placeholder={labels.taglinePlaceholder}
          onChange={(e) => onChange("tagline", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="field-slug">{labels.slug}</Label>
        <Input
          id="field-slug"
          value={state.slug}
          disabled={slugLocked}
          title={slugLocked ? labels.slugLocked : undefined}
          onChange={(e) => onChange("slug", e.target.value)}
        />
        {slugLocked ? (
          <p className="text-xs text-muted-foreground">{labels.slugLocked}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="field-category">{labels.category}</Label>
        <select
          id="field-category"
          className={selectClass}
          value={state.categoryId}
          onChange={(e) => onChange("categoryId", e.target.value)}
        >
          <option value="">{labels.categoryPlaceholder}</option>
          {lookups.categories.map((item) => (
            <option key={item.id} value={item.id}>
              {nameOf(item)}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="field-type">{labels.type}</Label>
        <select
          id="field-type"
          className={selectClass}
          value={state.typeId}
          onChange={(e) => onChange("typeId", e.target.value)}
        >
          <option value="">{labels.typePlaceholder}</option>
          {lookups.types.map((item) => (
            <option key={item.id} value={item.id}>
              {nameOf(item)}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="field-stage">{labels.stage}</Label>
        <select
          id="field-stage"
          className={selectClass}
          value={state.stageId}
          onChange={(e) => onChange("stageId", e.target.value)}
        >
          <option value="">{labels.stagePlaceholder}</option>
          {lookups.stages.map((item) => (
            <option key={item.id} value={item.id}>
              {nameOf(item)}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}

interface LinksSectionProps {
  state: FormState;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  labels: {
    title: string;
    website: string;
    repo: string;
    demo: string;
  };
}

function LinksSection({
  state,
  onChange,
  labels,
}: LinksSectionProps): ReactNode {
  return (
    <section id="links" aria-labelledby="links-title" className="space-y-6">
      <h2 id="links-title" className="text-xl font-semibold">
        {labels.title}
      </h2>
      <div className="space-y-2">
        <Label htmlFor="field-website">{labels.website}</Label>
        <Input
          id="field-website"
          type="url"
          value={state.websiteUrl}
          onChange={(e) => onChange("websiteUrl", e.target.value)}
          placeholder="https://"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="field-repo">{labels.repo}</Label>
        <Input
          id="field-repo"
          type="url"
          value={state.repoUrl}
          onChange={(e) => onChange("repoUrl", e.target.value)}
          placeholder="https://github.com/..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="field-demo">{labels.demo}</Label>
        <Input
          id="field-demo"
          type="url"
          value={state.demoUrl}
          onChange={(e) => onChange("demoUrl", e.target.value)}
          placeholder="https://"
        />
      </div>
    </section>
  );
}

interface SettingsSectionProps {
  state: FormState;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  labels: {
    title: string;
    pricingModel: string;
    pricing: {
      none: string;
      free: string;
      freemium: string;
      paid: string;
      open_source: string;
    };
    isOpenSource: string;
    isPublic: string;
    isSeekingInvestment: string;
    isSeekingTeammates: string;
  };
}

function SettingsSection({
  state,
  onChange,
  labels,
}: SettingsSectionProps): ReactNode {
  return (
    <section
      id="settings"
      aria-labelledby="settings-title"
      className="space-y-6"
    >
      <h2 id="settings-title" className="text-xl font-semibold">
        {labels.title}
      </h2>
      <div className="space-y-2">
        <Label htmlFor="field-pricing">{labels.pricingModel}</Label>
        <select
          id="field-pricing"
          value={state.pricingModel}
          onChange={(e) =>
            onChange("pricingModel", e.target.value as PricingModel | "")
          }
          className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">{labels.pricing.none}</option>
          <option value="free">{labels.pricing.free}</option>
          <option value="freemium">{labels.pricing.freemium}</option>
          <option value="paid">{labels.pricing.paid}</option>
          <option value="open_source">{labels.pricing.open_source}</option>
        </select>
      </div>

      <ToggleRow
        label={labels.isOpenSource}
        checked={state.isOpenSource}
        onCheckedChange={(v) => onChange("isOpenSource", v)}
      />
      <ToggleRow
        label={labels.isPublic}
        checked={state.isPublic}
        onCheckedChange={(v) => onChange("isPublic", v)}
      />
      <ToggleRow
        label={labels.isSeekingInvestment}
        checked={state.isSeekingInvestment}
        onCheckedChange={(v) => onChange("isSeekingInvestment", v)}
      />
      <ToggleRow
        label={labels.isSeekingTeammates}
        checked={state.isSeekingTeammates}
        onCheckedChange={(v) => onChange("isSeekingTeammates", v)}
      />
    </section>
  );
}

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
}

function ToggleRow({
  label,
  checked,
  onCheckedChange,
}: ToggleRowProps): ReactNode {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
      <span className="text-sm font-medium">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

interface PlaceholderSectionProps {
  title: string;
  message: string;
}

function PlaceholderSection({
  title,
  message,
}: PlaceholderSectionProps): ReactNode {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        {message}
      </div>
    </section>
  );
}

interface DescriptionSectionLabels {
  title: string;
  descriptionLabel: string;
  descriptionHint: string;
  descriptionMin: string;
  launchStoryLabel: string;
  launchStoryHint: string;
  placeholderDescription: string;
  placeholderLaunchStory: string;
  charCount: string;
}

interface DescriptionSectionProps {
  description: string;
  launchStory: string;
  onChangeDescription: (html: string) => void;
  onChangeLaunchStory: (html: string) => void;
  labels: DescriptionSectionLabels;
  editorLabels: {
    bold: string;
    italic: string;
    h2: string;
    h3: string;
    bulletList: string;
    orderedList: string;
    quote: string;
    code: string;
    link: string;
    linkPrompt: string;
    undo: string;
    redo: string;
  };
}

function DescriptionSection({
  description,
  launchStory,
  onChangeDescription,
  onChangeLaunchStory,
  labels,
  editorLabels,
}: DescriptionSectionProps): ReactNode {
  const descChars = htmlToText(description);
  const storyChars = htmlToText(launchStory);
  const descBelowMin = descChars < DESCRIPTION_MIN_CHARS;

  return (
    <section
      id="description"
      aria-labelledby="description-title"
      className="space-y-8"
    >
      <h2 id="description-title" className="text-xl font-semibold">
        {labels.title}
      </h2>

      <div className="space-y-2">
        <Label>{labels.descriptionLabel}</Label>
        <p className="text-xs text-muted-foreground">
          {labels.descriptionHint}
        </p>
        <RichTextEditor
          value={description}
          onChange={onChangeDescription}
          placeholder={labels.placeholderDescription}
          minHeight="220px"
          labels={editorLabels}
          ariaLabel={labels.descriptionLabel}
        />
        <div className="flex items-center justify-between text-xs">
          <span
            className={cn(
              "text-muted-foreground",
              descBelowMin && "text-destructive",
            )}
          >
            {descBelowMin
              ? `${labels.descriptionMin} (${descChars}/${DESCRIPTION_MIN_CHARS})`
              : labels.charCount.replace("{count}", String(descChars))}
          </span>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>{labels.launchStoryLabel}</Label>
        <p className="text-xs text-muted-foreground">{labels.launchStoryHint}</p>
        <RichTextEditor
          value={launchStory}
          onChange={onChangeLaunchStory}
          placeholder={labels.placeholderLaunchStory}
          minHeight="180px"
          labels={editorLabels}
          ariaLabel={labels.launchStoryLabel}
        />
        <div className="text-xs text-muted-foreground">
          {labels.charCount.replace("{count}", String(storyChars))}
        </div>
      </div>
    </section>
  );
}

interface MediaSectionProps {
  slug: string;
  logoUrl: string | null;
  images: ProjectDetail["images"];
  labels: {
    title: string;
    logo: {
      label: string;
      hint: string;
      upload: string;
      replace: string;
      remove: string;
      formatHint: string;
    };
    gallery: {
      label: string;
      hint: string;
      add: string;
      empty: string;
      limitReached: string;
      moveUp: string;
      moveDown: string;
      delete: string;
      uploading: string;
    };
    errors: {
      fileTooLarge: string;
      unsupportedType: string;
      limitExceeded: string;
      uploadFailed: string;
    };
  };
}

function MediaSection({
  slug,
  logoUrl,
  images,
  labels,
}: MediaSectionProps): ReactNode {
  return (
    <section id="media" aria-labelledby="media-title" className="space-y-6">
      <h2 id="media-title" className="text-xl font-semibold">
        {labels.title}
      </h2>

      <LogoUploader
        slug={slug}
        currentLogoUrl={logoUrl}
        labels={{
          ...labels.logo,
          errors: {
            fileTooLarge: labels.errors.fileTooLarge,
            unsupportedType: labels.errors.unsupportedType,
            uploadFailed: labels.errors.uploadFailed,
          },
        }}
      />

      <Separator />

      <GalleryUploader
        slug={slug}
        images={images}
        labels={{
          ...labels.gallery,
          errors: labels.errors,
        }}
      />
    </section>
  );
}
