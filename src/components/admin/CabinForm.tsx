"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Check,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  Link as LinkIcon,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { SafeImage } from "@/components/ui/SafeImage";
import { AmenityIcon } from "@/components/cabins/AmenityIcon";
import { cabinSchema, type CabinInput } from "@/lib/validations";
import { slugify, cn } from "@/lib/utils";
import {
  ACCEPTED_TYPES,
  processImageFiles,
  uploadErrorMessage,
  type ProcessedImage,
} from "@/lib/image-upload";
import type { Amenity } from "@/data/cabins";

type AmenityOption = { key: string; name: string };

type Props = {
  id?: string;
  amenities: AmenityOption[];
  initial?: Partial<CabinInput>;
};

const emptyValues: CabinInput = {
  title: "",
  slug: "",
  location: "",
  shortDescription: "",
  description: "",
  bedrooms: 1,
  bathrooms: 1,
  maxGuests: 2,
  pricePerNight: 200,
  cleaningFee: 30,
  lakeView: false,
  isActive: true,
  highlights: [],
  amenityKeys: [],
  images: [],
};

export function CabinForm({ id, amenities, initial }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const form = useForm<CabinInput>({
    resolver: zodResolver(cabinSchema),
    defaultValues: { ...emptyValues, ...initial },
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = form;

  const images = useFieldArray({ control, name: "images" });
  const highlights = useFieldArray({
    control,
    name: "highlights" as never,
  });

  const amenityKeys = watch("amenityKeys") ?? [];
  const titleValue = watch("title");

  function toggleAmenity(key: string) {
    const current = getValues("amenityKeys") ?? [];
    if (current.includes(key)) {
      setValue(
        "amenityKeys",
        current.filter((k) => k !== key),
        { shouldDirty: true }
      );
    } else {
      setValue("amenityKeys", [...current, key], { shouldDirty: true });
    }
  }

  function autoSlug() {
    setValue("slug", slugify(titleValue || ""), { shouldDirty: true });
  }

  function onSubmit(values: CabinInput) {
    setServerError(null);
    setSuccess(false);

    const payload = {
      ...values,
      slug: values.slug || slugify(values.title),
    };

    startTransition(async () => {
      const url = id ? `/api/admin/cabins/${id}` : "/api/admin/cabins";
      const method = id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setServerError(data?.error ?? "No pudimos guardar los cambios.");
        return;
      }

      setSuccess(true);
      router.push("/admin/cabins");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
      noValidate
    >
      {/* ─────────────── Basic info ─────────────── */}
      <Section title="Información básica">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Título"
            htmlFor="cf-title"
            className="sm:col-span-2"
            error={errors.title?.message}
          >
            <Input
              id="cf-title"
              placeholder="Arrayán Lake Cabin"
              {...register("title")}
              onBlur={(e) => {
                if (!getValues("slug")) autoSlug();
                register("title").onBlur(e);
              }}
            />
          </Field>

          <Field
            label="Slug"
            htmlFor="cf-slug"
            hint="Identificador en la URL. Solo minúsculas, números y guiones."
            error={errors.slug?.message}
          >
            <div className="flex gap-2">
              <Input id="cf-slug" placeholder="arrayan-lake-cabin" {...register("slug")} />
              <Button type="button" variant="ghost" size="sm" onClick={autoSlug}>
                Generar
              </Button>
            </div>
          </Field>

          <Field label="Ubicación" htmlFor="cf-location" error={errors.location?.message}>
            <Input
              id="cf-location"
              placeholder="Villa La Angostura, Patagonia"
              {...register("location")}
            />
          </Field>

          <Field
            label="Descripción corta"
            htmlFor="cf-short"
            hint="Aparece como subtítulo en las cards. Máx. 180 caracteres."
            className="sm:col-span-2"
            error={errors.shortDescription?.message}
          >
            <Input
              id="cf-short"
              maxLength={180}
              placeholder="Cabaña frente al lago con muelle privado y chimenea de leña."
              {...register("shortDescription")}
            />
          </Field>

          <Field
            label="Descripción larga"
            htmlFor="cf-desc"
            className="sm:col-span-2"
            error={errors.description?.message}
          >
            <textarea
              id="cf-desc"
              rows={6}
              placeholder="Despertá con el sonido del lago…"
              className="flex w-full rounded-xl border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm focus:border-[color:var(--color-primary)] focus:bg-white focus:outline-none"
              {...register("description")}
            />
          </Field>
        </div>
      </Section>

      {/* ─────────────── Capacity & pricing ─────────────── */}
      <Section title="Capacidad y precio">
        <div className="grid gap-5 sm:grid-cols-3">
          <NumField
            label="Habitaciones"
            id="cf-bed"
            register={register("bedrooms")}
            error={errors.bedrooms?.message}
          />
          <NumField
            label="Baños"
            id="cf-bath"
            register={register("bathrooms")}
            error={errors.bathrooms?.message}
          />
          <NumField
            label="Máx. huéspedes"
            id="cf-guests"
            register={register("maxGuests")}
            error={errors.maxGuests?.message}
          />
          <NumField
            label="Precio por noche (USD)"
            id="cf-price"
            register={register("pricePerNight")}
            error={errors.pricePerNight?.message}
          />
          <NumField
            label="Limpieza (USD)"
            id="cf-clean"
            register={register("cleaningFee")}
            error={errors.cleaningFee?.message}
          />
        </div>
      </Section>

      {/* ─────────────── Images ─────────────── */}
      <Section
        title="Galería de imágenes"
        description="Arrastrá fotos desde tu compu o pegalas, y reordená con las flechas. La primera es la imagen principal."
      >
        <ImageDropzone
          onFiles={(processed) => {
            processed.forEach((p) => images.append(p));
          }}
        />

        {images.fields.length > 0 && (
          <ul className="space-y-3">
            {images.fields.map((field, idx) => (
              <li
                key={field.id}
                className="flex items-center gap-3 rounded-2xl border border-[color:var(--color-border)] bg-white/60 p-3"
              >
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-[color:var(--color-surface-muted)]">
                  <Controller
                    control={control}
                    name={`images.${idx}.url`}
                    render={({ field: f }) =>
                      f.value ? (
                        <SafeImage
                          src={f.value}
                          alt={getValues(`images.${idx}.alt`) ?? ""}
                          fill
                          sizes="96px"
                          className="object-cover"
                          unoptimized={f.value.startsWith("data:")}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[color:var(--color-text-muted)]">
                          <ImageIcon size={18} strokeWidth={1.5} />
                        </div>
                      )
                    }
                  />
                  {idx === 0 && (
                    <span className="absolute left-1 top-1 rounded-full bg-[color:var(--color-primary)] px-2 py-0.5 text-[10px] font-medium text-white">
                      Principal
                    </span>
                  )}
                </div>

                <div className="grid flex-1 gap-2 sm:grid-cols-[2fr_1fr]">
                  <ImageUrlField control={control} index={idx} />
                  <Input
                    placeholder="Texto alternativo (alt)"
                    {...register(`images.${idx}.alt`)}
                  />
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <IconBtn
                    aria-label="Subir"
                    disabled={idx === 0}
                    onClick={() => images.swap(idx, idx - 1)}
                  >
                    <ChevronUp size={16} />
                  </IconBtn>
                  <IconBtn
                    aria-label="Bajar"
                    disabled={idx === images.fields.length - 1}
                    onClick={() => images.swap(idx, idx + 1)}
                  >
                    <ChevronDown size={16} />
                  </IconBtn>
                  <IconBtn
                    aria-label="Quitar"
                    onClick={() => images.remove(idx)}
                    danger
                  >
                    <Trash2 size={16} />
                  </IconBtn>
                </div>
              </li>
            ))}
          </ul>
        )}

        <details className="rounded-2xl border border-[color:var(--color-border)] bg-white/40 px-4 py-3 text-sm">
          <summary className="cursor-pointer text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]">
            <LinkIcon size={12} strokeWidth={1.5} className="inline-block align-middle mr-1.5" />
            ¿Preferís pegar una URL?
          </summary>
          <div className="mt-3 flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => images.append({ url: "", alt: "" })}
            >
              <Plus size={14} strokeWidth={1.75} />
              Agregar campo de URL
            </Button>
            <span className="text-xs text-[color:var(--color-text-muted)]">
              Pegá https://… o una ruta local como /images/foto.jpg
            </span>
          </div>
        </details>

        {errors.images?.message && (
          <p className="text-xs text-[color:var(--color-error)]">
            {errors.images.message as string}
          </p>
        )}
      </Section>

      {/* ─────────────── Amenities ─────────────── */}
      <Section
        title="Amenities"
        description="Marcá los servicios que ofrece la cabaña. Esto alimenta los filtros del catálogo público."
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {amenities.map((a) => {
            const active = amenityKeys.includes(a.key);
            return (
              <button
                key={a.key}
                type="button"
                onClick={() => toggleAmenity(a.key)}
                className={cn(
                  "flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-left text-sm transition-all",
                  active
                    ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)]"
                    : "border-[color:var(--color-border)] bg-white/60 text-[color:var(--color-text-primary)] hover:border-[color:var(--color-text-primary)]"
                )}
                aria-pressed={active}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    active
                      ? "bg-white/15"
                      : "bg-[color:var(--color-surface-muted)]"
                  )}
                >
                  <AmenityIcon amenity={a.key as Amenity} size={14} />
                </span>
                {a.name}
              </button>
            );
          })}
        </div>
      </Section>

      {/* ─────────────── Highlights ─────────────── */}
      <Section
        title="Destacados"
        description="Bullets que aparecen en la página de detalle. Tres o cuatro son suficientes."
      >
        {highlights.fields.length > 0 && (
          <ul className="space-y-2">
            {highlights.fields.map((field, idx) => (
              <li key={field.id} className="flex items-center gap-2">
                <Input
                  placeholder="Muelle privado sobre el lago"
                  {...register(`highlights.${idx}` as const)}
                />
                <IconBtn
                  aria-label="Quitar"
                  onClick={() => highlights.remove(idx)}
                  danger
                >
                  <Trash2 size={16} />
                </IconBtn>
              </li>
            ))}
          </ul>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => highlights.append("" as never)}
        >
          <Plus size={14} strokeWidth={1.75} />
          Agregar destacado
        </Button>
      </Section>

      {/* ─────────────── Visibility ─────────────── */}
      <Section title="Visibilidad">
        <div className="space-y-3">
          <ToggleField
            label="Vista al lago"
            description="Aparece como filtro y badge."
            control={control}
            name="lakeView"
          />
          <ToggleField
            label="Cabaña publicada"
            description="Si está desactivada, no se muestra en el catálogo público."
            control={control}
            name="isActive"
          />
        </div>
      </Section>

      {/* ─────────────── Feedback ─────────────── */}
      {serverError && (
        <div className="flex items-start gap-2 rounded-xl border border-[color:var(--color-error)]/20 bg-[color:var(--color-error)]/8 p-3 text-sm text-[color:var(--color-error)]">
          <AlertCircle size={16} className="mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 rounded-xl border border-[color:var(--color-success)]/20 bg-[color:var(--color-success)]/10 p-3 text-sm text-[color:var(--color-success)]">
          <Check size={16} className="mt-0.5" />
          <span>Cambios guardados.</span>
        </div>
      )}

      <div className="surface-paper sticky bottom-4 flex items-center justify-between gap-3 p-4">
        <p className="text-xs text-[color:var(--color-text-secondary)]">
          {id ? "Editando cabaña" : "Nueva cabaña"} ·{" "}
          {Object.keys(errors).length > 0 ? (
            <span className="text-[color:var(--color-error)]">
              {Object.keys(errors).length} {Object.keys(errors).length === 1 ? "campo con error" : "campos con error"}
            </span>
          ) : (
            <span>Listo para guardar</span>
          )}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={() => router.push("/admin/cabins")}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={pending}>
            {pending ? "Guardando…" : id ? "Guardar cambios" : "Crear cabaña"}
          </Button>
        </div>
      </div>
    </form>
  );
}

/* ────────────────── Helpers ────────────────── */

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-paper space-y-5 p-6 md:p-8">
      <header className="space-y-1.5">
        <h2 className="text-lg font-medium tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-[color:var(--color-text-secondary)]">
            {description}
          </p>
        )}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function NumField({
  label,
  id,
  register,
  error,
}: {
  label: string;
  id: string;
  register: ReturnType<ReturnType<typeof useForm<CabinInput>>["register"]>;
  error?: string;
}) {
  return (
    <Field label={label} htmlFor={id} error={error}>
      <Input id={id} type="number" min={0} {...register} />
    </Field>
  );
}

function ToggleField({
  label,
  description,
  control,
  name,
}: {
  label: string;
  description?: string;
  control: ReturnType<typeof useForm<CabinInput>>["control"];
  name: "lakeView" | "isActive";
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <label className="flex items-start gap-3">
          <span
            role="switch"
            aria-checked={field.value}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                field.onChange(!field.value);
              }
            }}
            onClick={() => field.onChange(!field.value)}
            className={cn(
              "relative mt-0.5 inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border transition",
              field.value
                ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)]"
                : "border-[color:var(--color-border)] bg-white"
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white shadow transition",
                field.value ? "translate-x-5" : "translate-x-1"
              )}
            />
          </span>
          <span className="flex flex-col gap-0.5 text-sm">
            <span className="font-medium text-[color:var(--color-text-primary)]">
              {label}
            </span>
            {description && (
              <span className="text-xs text-[color:var(--color-text-secondary)]">
                {description}
              </span>
            )}
          </span>
        </label>
      )}
    />
  );
}

function IconBtn({
  children,
  onClick,
  disabled,
  danger,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border transition disabled:opacity-30",
        danger
          ? "border-[color:var(--color-border)] text-[color:var(--color-error)] hover:border-[color:var(--color-error)] hover:bg-[color:var(--color-error)]/8"
          : "border-[color:var(--color-border)] text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-text-primary)] hover:text-[color:var(--color-text-primary)]"
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function ImageDropzone({
  onFiles,
}: {
  onFiles: (images: ProcessedImage[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [issues, setIssues] = useState<string[]>([]);

  async function handleFiles(files: FileList | File[] | null) {
    if (!files || (files as FileList).length === 0) return;
    setIssues([]);
    setProcessing(true);
    try {
      const { images, errors } = await processImageFiles(files);
      if (images.length > 0) onFiles(images);
      if (errors.length > 0) {
        setIssues(
          Array.from(new Set(errors.map((e) => uploadErrorMessage(e))))
        );
      }
    } finally {
      setProcessing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!dragging) setDragging(true);
        }}
        onDragLeave={(e) => {
          // only flip off when leaving the actual element, not its children
          if (e.currentTarget === e.target) setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors cursor-pointer",
          dragging
            ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/5"
            : "border-[color:var(--color-border)] bg-white/40 hover:border-[color:var(--color-text-primary)] hover:bg-white/60"
        )}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-secondary)]">
          {processing ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
          ) : (
            <Upload size={20} strokeWidth={1.5} />
          )}
        </span>
        <div className="space-y-1">
          <p className="text-sm font-medium text-[color:var(--color-text-primary)]">
            {processing
              ? "Procesando imágenes…"
              : dragging
              ? "Soltá las imágenes acá"
              : "Arrastrá imágenes o hacé click para elegir"}
          </p>
          <p className="text-xs text-[color:var(--color-text-secondary)]">
            JPG, PNG, WebP o AVIF · hasta 8 MB · se redimensionan a 1600px
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {issues.length > 0 && (
        <ul className="space-y-1 text-xs text-[color:var(--color-error)]">
          {issues.map((m, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <AlertCircle size={12} className="mt-0.5" />
              {m}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * URL input that auto-collapses when the value is a data: URL
 * (i.e. an image uploaded from disk) so the textarea-of-base64 doesn't
 * clutter the form. Falls back to a regular text input for remote URLs.
 */
function ImageUrlField({
  control,
  index,
}: {
  control: ReturnType<typeof useForm<CabinInput>>["control"];
  index: number;
}) {
  return (
    <Controller
      control={control}
      name={`images.${index}.url`}
      render={({ field }) => {
        const isData = field.value?.startsWith("data:");
        if (isData) {
          const sizeKb = Math.round((field.value.length * 0.75) / 1024);
          return (
            <div className="flex h-11 items-center justify-between gap-2 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-3 text-sm">
              <span className="inline-flex items-center gap-1.5 text-[color:var(--color-text-secondary)]">
                <Upload size={12} strokeWidth={1.75} />
                Subida desde el dispositivo · ~{sizeKb} KB
              </span>
              <button
                type="button"
                onClick={() => field.onChange("")}
                className="text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-error)]"
              >
                Quitar
              </button>
            </div>
          );
        }
        return (
          <Input
            placeholder="https://…/foto.jpg"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        );
      }}
    />
  );
}
