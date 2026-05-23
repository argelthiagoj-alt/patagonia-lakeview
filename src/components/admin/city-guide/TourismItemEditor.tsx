"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, AlertCircle, Trash2, Star } from "lucide-react"; // eslint-disable-line
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { MultiImageUploader } from "@/components/admin/MultiImageUploader";
import { slugify } from "@/lib/utils";
import {
  TOURISM_TYPES,
  TOURISM_TYPE_LABELS,
  type TourismTypeKey,
} from "@/modules/city-guide/schemas";

type Taxonomy = { id: string; slug: string; name: string };

type Mode =
  | { kind: "create"; type: TourismTypeKey }
  | { kind: "edit"; itemId: string };

/**
 * Editor unificado de TourismItem. Crece dinámicamente según `type`:
 *   - TRAIL → longitud / elevación / dificultad / duración / temporada.
 *   - RESTAURANT → especialidad / horarios / precio / rating / contacto.
 *   - SKI_RENTAL → equipos / horarios / contacto / rating.
 *   - ADVENTURE → tipo / duración / dificultad / temporada / encuentro.
 *   - KEY_PLACE → categoría editable / horarios / teléfono / web.
 *   - STORE → tipo de tienda editable / horarios / rating / contacto.
 *
 * Imágenes vía `MultiImageUploader` (drag-drop / picker / reorder /
 * marcar principal). La primera del array siempre es la "main image"
 * tanto en backend como en UI.
 *
 * Sólo SUPER_ADMIN puede invocarlo (lo controla el endpoint server-side).
 */
export function TourismItemEditor({
  cityId,
  citySlug,
  mode,
  storeTypes,
  keyPlaceCategories,
  onClose,
}: {
  cityId: string;
  citySlug: string;
  mode: Mode;
  storeTypes: Taxonomy[];
  keyPlaceCategories: Taxonomy[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(mode.kind === "edit");

  const [form, setForm] = useState<FormState>(() => emptyForm(mode));

  // Hidratar si es edición — GET al endpoint y precargar todo.
  useEffect(() => {
    if (mode.kind !== "edit") return;
    let alive = true;
    (async () => {
      try {
        const res = await fetch(
          `/api/admin/city-guide/places/${mode.itemId}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error("fetch failed");
        const data = (await res.json()) as { item: ServerItem };
        if (!alive) return;
        setForm(serverToForm(data.item));
      } catch {
        if (alive) setError("No pudimos cargar el lugar.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [mode]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.title.trim() || !form.description.trim()) {
      setError("Nombre y descripción son obligatorios.");
      return;
    }
    const payload = formToPayload(form);
    startTransition(async () => {
      try {
        const url =
          mode.kind === "create"
            ? `/api/admin/city-guide/cities/${cityId}/places`
            : `/api/admin/city-guide/places/${mode.itemId}`;
        const method = mode.kind === "create" ? "POST" : "PUT";
        const res = await fetch(url, {
          method,
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          setError(d?.error ?? "No pudimos guardar el lugar.");
          return;
        }
        onClose();
        router.refresh();
      } catch {
        setError("Sin conexión.");
      }
    });
  }

  function remove() {
    if (mode.kind !== "edit") return;
    if (!confirm("¿Eliminar este lugar?")) return;
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/admin/city-guide/places/${mode.itemId}`,
          { method: "DELETE" }
        );
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          setError(d?.error ?? "No pudimos eliminar.");
          return;
        }
        onClose();
        router.refresh();
      } catch {
        setError("Sin conexión.");
      }
    });
  }

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 backdrop-blur-sm sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={submit}
        className="surface-paper max-h-[92vh] w-full max-w-3xl space-y-5 overflow-y-auto p-6"
      >
        <header className="flex items-center justify-between">
          <div>
            <p className="text-eyebrow">
              {mode.kind === "create" ? "Nuevo lugar" : "Editar lugar"}
            </p>
            <h3 className="mt-0.5 text-lg font-medium tracking-tight">
              {form.title || TOURISM_TYPE_LABELS[form.type]}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)]"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </header>

        {loading ? (
          <p className="text-sm text-[color:var(--color-text-secondary)]">
            Cargando…
          </p>
        ) : (
          <>
            {/* ──── Comunes ──── */}
            <SectionTitle>Datos generales</SectionTitle>

            <Field label="Categoría" htmlFor="ti-type">
              <select
                id="ti-type"
                value={form.type}
                onChange={(e) =>
                  set("type", e.target.value as TourismTypeKey)
                }
                className="flex h-11 w-full rounded-xl border border-[color:var(--color-border)] bg-white/60 px-3 text-sm focus:border-[color:var(--color-primary)] focus:bg-white focus:outline-none"
              >
                {TOURISM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TOURISM_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre" htmlFor="ti-name">
                <Input
                  id="ti-name"
                  value={form.title}
                  onChange={(e) => {
                    const v = e.target.value;
                    set("title", v);
                    if (!form.slug) set("slug", slugify(v));
                  }}
                  required
                />
              </Field>
              <Field label="Slug" htmlFor="ti-slug">
                <Input
                  id="ti-slug"
                  value={form.slug}
                  onChange={(e) => set("slug", e.target.value)}
                  required={mode.kind === "create"}
                />
              </Field>
              <Field
                label="Descripción"
                htmlFor="ti-desc"
                className="sm:col-span-2"
              >
                <textarea
                  id="ti-desc"
                  rows={3}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  required
                  className="flex w-full rounded-xl border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm focus:border-[color:var(--color-primary)] focus:bg-white focus:outline-none"
                />
              </Field>
              <Field
                label="Ubicación (nombre)"
                htmlFor="ti-loc"
              >
                <Input
                  id="ti-loc"
                  value={form.locationName}
                  onChange={(e) => set("locationName", e.target.value)}
                  placeholder="ej. Cerro Catedral"
                />
              </Field>
              <Field label="Dirección" htmlFor="ti-addr">
                <Input
                  id="ti-addr"
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                />
              </Field>
            </div>

            {/* ──── Imágenes ──── */}
            <SectionTitle>Imágenes</SectionTitle>
            <MultiImageUploader
              value={form.images}
              onChange={(next) => set("images", next)}
              max={15}
              hint="Arrastrá fotos o hacé click — la primera es la principal"
            />

            {/* ──── Bloque dinámico por categoría ──── */}
            <SectionTitle>Detalles de {TOURISM_TYPE_LABELS[form.type]}</SectionTitle>
            <TypeSpecificFields
              form={form}
              set={set}
              storeTypes={storeTypes}
              keyPlaceCategories={keyPlaceCategories}
            />

            {/* ──── Contactos (la mayoría comparte) ──── */}
            <SectionTitle>Contacto</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Teléfono / WhatsApp" htmlFor="ti-phone">
                <Input
                  id="ti-phone"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </Field>
              <Field label="Web" htmlFor="ti-web">
                <Input
                  id="ti-web"
                  value={form.website}
                  onChange={(e) => set("website", e.target.value)}
                  placeholder="https://…"
                />
              </Field>
              <Field label="Instagram" htmlFor="ti-ig">
                <Input
                  id="ti-ig"
                  value={form.instagram}
                  onChange={(e) => set("instagram", e.target.value)}
                  placeholder="@usuario"
                />
              </Field>
              <Field label="Contacto libre" htmlFor="ti-contact">
                <Input
                  id="ti-contact"
                  value={form.contact}
                  onChange={(e) => set("contact", e.target.value)}
                  placeholder="email u otro"
                />
              </Field>
            </div>

            {/* ──── Estado editorial ──── */}
            <SectionTitle>Estado</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => set("featured", e.target.checked)}
                  className="h-4 w-4 accent-[color:var(--color-accent)]"
                />
                <Star size={14} strokeWidth={1.5} className="text-[color:var(--color-accent)]" />
                <span>Destacado (aparece en el carrusel superior)</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => set("isPublished", e.target.checked)}
                  className="h-4 w-4 accent-[color:var(--color-primary)]"
                />
                <span>Publicado en /destinos/{citySlug}</span>
              </label>
            </div>
          </>
        )}

        {error && (
          <p className="inline-flex items-center gap-1.5 text-xs text-[color:var(--color-error)]">
            <AlertCircle size={12} strokeWidth={1.75} /> {error}
          </p>
        )}

        <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-[color:var(--color-border)] pt-4">
          {mode.kind === "edit" && (
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={remove}
              disabled={pending || loading}
              className="!text-[color:var(--color-error)] mr-auto"
            >
              <Trash2 size={14} strokeWidth={1.75} />
              Eliminar
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onClose}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={pending || loading}
          >
            {pending ? "Guardando…" : "Guardar"}
          </Button>
        </footer>
      </form>
    </div>
  );
}

/* ─────────────── Form state + helpers ─────────────── */

type FormState = {
  type: TourismTypeKey;
  title: string;
  slug: string;
  description: string;
  images: { url: string; alt?: string | null }[];
  locationName: string;
  address: string;
  featured: boolean;
  isPublished: boolean;
  phone: string;
  website: string;
  instagram: string;
  contact: string;
  openingHours: string;
  rating: string;
  // TRAIL / ADVENTURE
  lengthKm: string;
  elevation: string;
  difficulty: string;
  duration: string;
  idealSeason: string;
  // RESTAURANT
  specialty: string;
  priceRange: string;
  // SKI_RENTAL
  equipmentTypes: string; // CSV en el form
  // ADVENTURE
  experienceType: string;
  meetingPoint: string;
  // Taxonomías
  storeTypeId: string;
  keyPlaceCategoryId: string;
};

type ServerItem = {
  type: TourismTypeKey;
  title: string;
  slug: string;
  description: string;
  images: { url: string; alt: string | null }[];
  mainImage: string | null;
  locationName: string | null;
  address: string | null;
  featured: boolean;
  isPublished: boolean;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  contact: string | null;
  openingHours: string | null;
  rating: number | null;
  lengthKm: number | null;
  elevation: number | null;
  difficulty: string | null;
  duration: string | null;
  idealSeason: string | null;
  specialty: string | null;
  priceRange: string | null;
  equipmentTypes: string[];
  experienceType: string | null;
  meetingPoint: string | null;
  storeTypeId: string | null;
  keyPlaceCategoryId: string | null;
};

function emptyForm(mode: Mode): FormState {
  const type: TourismTypeKey =
    mode.kind === "create" ? mode.type : "TRAIL";
  return {
    type,
    title: "",
    slug: "",
    description: "",
    images: [],
    locationName: "",
    address: "",
    featured: false,
    isPublished: true,
    phone: "",
    website: "",
    instagram: "",
    contact: "",
    openingHours: "",
    rating: "",
    lengthKm: "",
    elevation: "",
    difficulty: "",
    duration: "",
    idealSeason: "",
    specialty: "",
    priceRange: "",
    equipmentTypes: "",
    experienceType: "",
    meetingPoint: "",
    storeTypeId: "",
    keyPlaceCategoryId: "",
  };
}

function serverToForm(item: ServerItem): FormState {
  return {
    type: item.type,
    title: item.title,
    slug: item.slug,
    description: item.description,
    images: item.images,
    locationName: item.locationName ?? "",
    address: item.address ?? "",
    featured: item.featured,
    isPublished: item.isPublished,
    phone: item.phone ?? "",
    website: item.website ?? "",
    instagram: item.instagram ?? "",
    contact: item.contact ?? "",
    openingHours: item.openingHours ?? "",
    rating: item.rating != null ? String(item.rating) : "",
    lengthKm: item.lengthKm != null ? String(item.lengthKm) : "",
    elevation: item.elevation != null ? String(item.elevation) : "",
    difficulty: item.difficulty ?? "",
    duration: item.duration ?? "",
    idealSeason: item.idealSeason ?? "",
    specialty: item.specialty ?? "",
    priceRange: item.priceRange ?? "",
    equipmentTypes: item.equipmentTypes.join(", "),
    experienceType: item.experienceType ?? "",
    meetingPoint: item.meetingPoint ?? "",
    storeTypeId: item.storeTypeId ?? "",
    keyPlaceCategoryId: item.keyPlaceCategoryId ?? "",
  };
}

function formToPayload(form: FormState) {
  const num = (v: string) => (v.trim() === "" ? null : Number(v));
  const str = (v: string) => (v.trim() === "" ? null : v.trim());
  return {
    type: form.type,
    title: form.title.trim(),
    slug: form.slug.trim() || slugify(form.title),
    description: form.description.trim(),
    mainImage: form.images[0]?.url ?? null,
    images: form.images,
    locationName: str(form.locationName),
    address: str(form.address),
    featured: form.featured,
    isPublished: form.isPublished,
    phone: str(form.phone),
    website: str(form.website),
    instagram: str(form.instagram),
    contact: str(form.contact),
    openingHours: str(form.openingHours),
    rating: num(form.rating),
    lengthKm: num(form.lengthKm),
    elevation: num(form.elevation),
    difficulty: str(form.difficulty),
    duration: str(form.duration),
    idealSeason: str(form.idealSeason),
    specialty: str(form.specialty),
    priceRange: str(form.priceRange),
    equipmentTypes: form.equipmentTypes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    experienceType: str(form.experienceType),
    meetingPoint: str(form.meetingPoint),
    storeTypeId: form.storeTypeId || null,
    keyPlaceCategoryId: form.keyPlaceCategoryId || null,
  };
}

/* ─────────────── Sub-bloques por tipo ─────────────── */

function TypeSpecificFields({
  form,
  set,
  storeTypes,
  keyPlaceCategories,
}: {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  storeTypes: Taxonomy[];
  keyPlaceCategories: Taxonomy[];
}) {
  const grid = "grid gap-4 sm:grid-cols-2";

  if (form.type === "TRAIL") {
    return (
      <div className={grid}>
        <Field label="Longitud (km)" htmlFor="ti-len">
          <Input
            id="ti-len"
            type="number"
            step="0.1"
            value={form.lengthKm}
            onChange={(e) => set("lengthKm", e.target.value)}
          />
        </Field>
        <Field label="Elevación (m)" htmlFor="ti-elev">
          <Input
            id="ti-elev"
            type="number"
            value={form.elevation}
            onChange={(e) => set("elevation", e.target.value)}
          />
        </Field>
        <Field label="Dificultad" htmlFor="ti-diff">
          <Input
            id="ti-diff"
            value={form.difficulty}
            onChange={(e) => set("difficulty", e.target.value)}
            placeholder="Fácil / Moderado / Difícil"
          />
        </Field>
        <Field label="Duración" htmlFor="ti-dur">
          <Input
            id="ti-dur"
            value={form.duration}
            onChange={(e) => set("duration", e.target.value)}
            placeholder="Media jornada"
          />
        </Field>
        <Field
          label="Temporada ideal"
          htmlFor="ti-season"
          className="sm:col-span-2"
        >
          <Input
            id="ti-season"
            value={form.idealSeason}
            onChange={(e) => set("idealSeason", e.target.value)}
            placeholder="Primavera y verano"
          />
        </Field>
      </div>
    );
  }

  if (form.type === "RESTAURANT") {
    return (
      <div className={grid}>
        <Field label="Especialidad" htmlFor="ti-spec">
          <Input
            id="ti-spec"
            value={form.specialty}
            onChange={(e) => set("specialty", e.target.value)}
            placeholder="Cordero al disco, fondue, …"
          />
        </Field>
        <Field label="Rango de precio" htmlFor="ti-price">
          <Input
            id="ti-price"
            value={form.priceRange}
            onChange={(e) => set("priceRange", e.target.value)}
            placeholder="$$, $$$, …"
          />
        </Field>
        <Field label="Horarios" htmlFor="ti-hours">
          <Input
            id="ti-hours"
            value={form.openingHours}
            onChange={(e) => set("openingHours", e.target.value)}
          />
        </Field>
        <Field label="Rating (0-5)" htmlFor="ti-rating">
          <Input
            id="ti-rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={form.rating}
            onChange={(e) => set("rating", e.target.value)}
          />
        </Field>
      </div>
    );
  }

  if (form.type === "SKI_RENTAL") {
    return (
      <div className={grid}>
        <Field
          label="Tipos de equipo (separá por coma)"
          htmlFor="ti-eq"
          className="sm:col-span-2"
        >
          <Input
            id="ti-eq"
            value={form.equipmentTypes}
            onChange={(e) => set("equipmentTypes", e.target.value)}
            placeholder="Ski, snowboard, ropa técnica"
          />
        </Field>
        <Field label="Horarios" htmlFor="ti-hours">
          <Input
            id="ti-hours"
            value={form.openingHours}
            onChange={(e) => set("openingHours", e.target.value)}
          />
        </Field>
        <Field label="Rating (0-5)" htmlFor="ti-rating">
          <Input
            id="ti-rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={form.rating}
            onChange={(e) => set("rating", e.target.value)}
          />
        </Field>
      </div>
    );
  }

  if (form.type === "ADVENTURE") {
    return (
      <div className={grid}>
        <Field label="Tipo de experiencia" htmlFor="ti-exp">
          <Input
            id="ti-exp"
            value={form.experienceType}
            onChange={(e) => set("experienceType", e.target.value)}
            placeholder="Kayak, trekking guiado, cabalgata…"
          />
        </Field>
        <Field label="Duración" htmlFor="ti-dur">
          <Input
            id="ti-dur"
            value={form.duration}
            onChange={(e) => set("duration", e.target.value)}
          />
        </Field>
        <Field label="Dificultad" htmlFor="ti-diff">
          <Input
            id="ti-diff"
            value={form.difficulty}
            onChange={(e) => set("difficulty", e.target.value)}
          />
        </Field>
        <Field label="Temporada ideal" htmlFor="ti-season">
          <Input
            id="ti-season"
            value={form.idealSeason}
            onChange={(e) => set("idealSeason", e.target.value)}
          />
        </Field>
        <Field
          label="Punto de encuentro"
          htmlFor="ti-meet"
          className="sm:col-span-2"
        >
          <Input
            id="ti-meet"
            value={form.meetingPoint}
            onChange={(e) => set("meetingPoint", e.target.value)}
            placeholder="ej. Frente al muelle municipal"
          />
        </Field>
      </div>
    );
  }

  if (form.type === "KEY_PLACE") {
    return (
      <div className={grid}>
        <Field
          label="Categoría"
          htmlFor="ti-keycat"
          hint="Editás las categorías desde el panel de taxonomías."
        >
          <select
            id="ti-keycat"
            value={form.keyPlaceCategoryId}
            onChange={(e) => set("keyPlaceCategoryId", e.target.value)}
            className="flex h-11 w-full rounded-xl border border-[color:var(--color-border)] bg-white/60 px-3 text-sm focus:border-[color:var(--color-primary)] focus:bg-white focus:outline-none"
          >
            <option value="">Sin categoría</option>
            {keyPlaceCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Horarios" htmlFor="ti-hours">
          <Input
            id="ti-hours"
            value={form.openingHours}
            onChange={(e) => set("openingHours", e.target.value)}
          />
        </Field>
      </div>
    );
  }

  // STORE
  return (
    <div className={grid}>
      <Field
        label="Tipo de tienda"
        htmlFor="ti-storetype"
        hint="Editás los tipos desde el panel de taxonomías."
      >
        <select
          id="ti-storetype"
          value={form.storeTypeId}
          onChange={(e) => set("storeTypeId", e.target.value)}
          className="flex h-11 w-full rounded-xl border border-[color:var(--color-border)] bg-white/60 px-3 text-sm focus:border-[color:var(--color-primary)] focus:bg-white focus:outline-none"
        >
          <option value="">Sin tipo</option>
          {storeTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Horarios" htmlFor="ti-hours">
        <Input
          id="ti-hours"
          value={form.openingHours}
          onChange={(e) => set("openingHours", e.target.value)}
        />
      </Field>
      <Field label="Rating (0-5)" htmlFor="ti-rating">
        <Input
          id="ti-rating"
          type="number"
          min="0"
          max="5"
          step="0.1"
          value={form.rating}
          onChange={(e) => set("rating", e.target.value)}
        />
      </Field>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="border-t border-[color:var(--color-border)] pt-4 text-[11px] font-medium uppercase tracking-[0.18em] text-[color:var(--color-text-secondary)]">
      {children}
    </h4>
  );
}
