import { useMemo, useState, type ReactNode, type KeyboardEvent } from "react";
import { Tag, X, Plus } from "lucide-react";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useLang, useT } from "~/lib/i18n";
import {
  MOCK_CATEGORIES,
  MOCK_PROJECT_TYPES,
  MOCK_PROJECT_STAGES,
  MOCK_TECHNOLOGIES,
} from "~/lib/mock-lookups";

// TODO: Lookup API endpoint hazir olunca mock-lookups kaldirilacak;
// useFetcher ile loader'da /lookups/* cekilecek.

const MAX_TECHNOLOGIES = 20;
const MAX_TAGS = 5;
const MAX_TAG_LENGTH = 30;

export interface TagsValue {
  categoryId: string | null;
  typeId: string | null;
  stageId: string | null;
  technologyIds: string[];
  tags: string[];
}

interface TagsSectionProps {
  value: TagsValue;
  onChange: (patch: Partial<TagsValue>) => void;
}

export function TagsSection({ value, onChange }: TagsSectionProps): ReactNode {
  const t = useT();
  const lang = useLang();

  const techMap = useMemo(
    () => new Map(MOCK_TECHNOLOGIES.map((tech) => [tech.id, tech.name])),
    [],
  );

  const labelOf = (cat: { nameTr: string; nameEn: string }): string =>
    lang === "tr" ? cat.nameTr : cat.nameEn;

  return (
    <section id="tags" aria-labelledby="tags-title" className="space-y-6">
      <h2 id="tags-title" className="text-xl font-semibold">
        {t.projectEdit.tags.title}
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="field-category">{t.projectEdit.tags.category}</Label>
          <SelectField
            id="field-category"
            value={value.categoryId ?? ""}
            onChange={(v) => onChange({ categoryId: v || null })}
            placeholder={t.projectEdit.tags.selectPlaceholder}
            options={MOCK_CATEGORIES.map((c) => ({
              value: c.id,
              label: labelOf(c),
            }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="field-type">{t.projectEdit.tags.type}</Label>
          <SelectField
            id="field-type"
            value={value.typeId ?? ""}
            onChange={(v) => onChange({ typeId: v || null })}
            placeholder={t.projectEdit.tags.selectPlaceholder}
            options={MOCK_PROJECT_TYPES.map((c) => ({
              value: c.id,
              label: labelOf(c),
            }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="field-stage">{t.projectEdit.tags.stage}</Label>
          <SelectField
            id="field-stage"
            value={value.stageId ?? ""}
            onChange={(v) => onChange({ stageId: v || null })}
            placeholder={t.projectEdit.tags.selectPlaceholder}
            options={MOCK_PROJECT_STAGES.map((c) => ({
              value: c.id,
              label: labelOf(c),
            }))}
          />
        </div>
      </div>

      <TechnologiesPicker
        selected={value.technologyIds}
        onChange={(ids) => onChange({ technologyIds: ids })}
        techMap={techMap}
      />

      <CustomTagsInput
        tags={value.tags}
        onChange={(tags) => onChange({ tags })}
      />
    </section>
  );
}

interface SelectFieldProps {
  id: string;
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}

function SelectField({
  id,
  value,
  onChange,
  placeholder,
  options,
}: SelectFieldProps): ReactNode {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

interface TechnologiesPickerProps {
  selected: string[];
  onChange: (next: string[]) => void;
  techMap: Map<string, string>;
}

function TechnologiesPicker({
  selected,
  onChange,
  techMap,
}: TechnologiesPickerProps): ReactNode {
  const t = useT();
  const [pending, setPending] = useState<string>("");

  const available = MOCK_TECHNOLOGIES.filter(
    (tech) => !selected.includes(tech.id),
  );
  const limitReached = selected.length >= MAX_TECHNOLOGIES;

  function handleAdd(): void {
    if (!pending || limitReached) return;
    if (selected.includes(pending)) {
      setPending("");
      return;
    }
    onChange([...selected, pending]);
    setPending("");
  }

  function handleRemove(id: string): void {
    onChange(selected.filter((s) => s !== id));
  }

  return (
    <div className="space-y-2">
      <Label>{t.projectEdit.tags.technologies.label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {selected.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            {t.projectEdit.tags.technologies.empty}
          </p>
        ) : (
          selected.map((id) => (
            <Chip
              key={id}
              label={techMap.get(id) ?? id}
              onRemove={() => handleRemove(id)}
            />
          ))
        )}
      </div>
      <div className="flex gap-2">
        <select
          value={pending}
          onChange={(e) => setPending(e.target.value)}
          disabled={limitReached}
          className="flex h-8 flex-1 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
          aria-label={t.projectEdit.tags.technologies.placeholder}
        >
          <option value="">{t.projectEdit.tags.technologies.placeholder}</option>
          {available.map((tech) => (
            <option key={tech.id} value={tech.id}>
              {tech.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!pending || limitReached}
          title={limitReached ? t.projectEdit.tags.technologies.limit : undefined}
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-3 text-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          {t.projectEdit.tags.technologies.add}
        </button>
      </div>
      {limitReached ? (
        <p className="text-xs text-muted-foreground">
          {t.projectEdit.tags.technologies.limit}
        </p>
      ) : null}
    </div>
  );
}

interface CustomTagsInputProps {
  tags: string[];
  onChange: (next: string[]) => void;
}

function CustomTagsInput({ tags, onChange }: CustomTagsInputProps): ReactNode {
  const t = useT();
  const [draft, setDraft] = useState<string>("");

  function commit(raw: string): void {
    const value = raw.trim().slice(0, MAX_TAG_LENGTH);
    if (!value) return;
    if (tags.includes(value)) {
      setDraft("");
      return;
    }
    if (tags.length >= MAX_TAGS) return;
    onChange([...tags, value]);
    setDraft("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(draft);
    } else if (e.key === "Backspace" && draft === "" && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  function handleRemove(tag: string): void {
    onChange(tags.filter((tt) => tt !== tag));
  }

  const limitReached = tags.length >= MAX_TAGS;

  return (
    <div className="space-y-2">
      <Label htmlFor="field-custom-tags">
        {t.projectEdit.tags.customTags.label}
      </Label>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Chip key={tag} label={tag} onRemove={() => handleRemove(tag)} icon />
        ))}
      </div>
      <Input
        id="field-custom-tags"
        value={draft}
        onChange={(e) => setDraft(e.target.value.slice(0, MAX_TAG_LENGTH))}
        onKeyDown={handleKeyDown}
        placeholder={t.projectEdit.tags.customTags.placeholder}
        disabled={limitReached}
        title={limitReached ? t.projectEdit.tags.customTags.limit : undefined}
        maxLength={MAX_TAG_LENGTH}
      />
      <p className="text-xs text-muted-foreground">
        {limitReached
          ? t.projectEdit.tags.customTags.limit
          : t.projectEdit.tags.customTags.hint}
      </p>
    </div>
  );
}

interface ChipProps {
  label: string;
  onRemove: () => void;
  icon?: boolean;
}

function Chip({ label, onRemove, icon }: ChipProps): ReactNode {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-accent/50 px-2.5 py-0.5 text-xs">
      {icon ? <Tag className="h-3 w-3" /> : null}
      <span>{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-accent"
        aria-label={`${label} kaldir`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
