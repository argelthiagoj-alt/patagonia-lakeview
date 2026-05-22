"use client";

import { useState, useTransition } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { SafeImage } from "@/components/ui/SafeImage";
import { AmenityIcon } from "@/components/cabins/AmenityIcon";
import {
  cabinSchema,
  FEATURE_KEYS,
  FEATURE_LABELS,
  HOTEL_ONLY_FEATURES,
  type CabinInput,
} from "@/modules/cabins/schemas";
import { slugify, cn } from "@/lib/utils";
import type { Amenity } from "@/data/cabins";
import { ImageDropzone } from "@/components/admin/cabin-form/ImageDropzone";
import { ImageUrlField } from "@/components/admin/cabin-form/ImageUrlField";
import { RoomImagesSubForm } from "@/components/admin/cabin-form/RoomImagesSubForm";
import {
  IconBtn,
  NumField,
  Section,
  ToggleField,
} from "@/components/admin/cabin-form/primitives";

type AmenityOption = { key: string; name: string };

type Props = {
  id?: string;
  amenities: AmenityOption[];
  initial?: Partial<CabinInput>;
};

const emptyFeatures = {
  hasTv: false,
  hasWifi: false,
  hasHeating: false,
  hasAirConditioning: false,
  hasPhoneSignal: false,
  hasRestaurant: false,
  hasElevator: false,
  has24hReception: false,
  hasRoomService: false,
  hasBreakfast: false,
  hasSpa: false,
  hasGym: false,
  hasPool: false,
  hasParking: false,
  hasAccessibility: false,
};

const emptyValues: CabinInput = {
  title: "",
  slug: "",
  location: "",
  shortDescription: "",
  description: "",
  propertyType: "CABIN",
  bedrooms: 1,
  bathrooms: 1,
  maxGuests: 2,
  pricePerNight: 200,
  cleaningFee: 30,
  totalUnits: 1,
  lakeView: false,
  isActive: true,
  highlights: [],
  amenityKeys: [],
  latitude: null,
  longitude: null,
  cancellationPolicy: null,
  houseRules: null,
  checkInTime: null,
  checkOutTime: null,
  hostDisplayName: null,
  hostBio: null,
  hostPhoto: null,
  hostCity: null,
  hostingSince: null,
  hostPhone: null,
  hostEmail: null,
  hostLink: null,
  hotelLegalName: null,
  hotelLogo: null,
  hotelDescription: null,
  hotelAddress: null,
  hotelCity: null,
  hotelPhone: null,
  hotelEmail: null,
  hotelWebsite: null,
  hotelReceptionHours: null,
  hotelGeneralPolicies: null,
  features: emptyFeatures,
  images: [],
  beds: [],
  roomTypes: [],
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
  const beds = useFieldArray({ control, name: "beds" });
  const highlights = useFieldArray({
    control,
    name: "highlights" as never,
  });
  const roomTypes = useFieldArray({ control, name: "roomTypes" });

  const propertyType = watch("propertyType");
  const isHotel = propertyType === "HOTEL";

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
          <NumField
            label="Unidades disponibles"
            id="cf-units"
            register={register("totalUnits")}
            error={errors.totalUnits?.message}
          />
        </div>
        <p className="text-xs text-[color:var(--color-text-muted)]">
          Si tu publicación representa varias cabañas iguales, subí el número de
          unidades. La disponibilidad se calcula contando reservas activas
          contra este total.
        </p>
      </Section>

      {/* ─────────────── Tipo de publicación ─────────────── */}
      <Section title="Tipo de publicación">
        <div className="flex flex-wrap gap-2">
          {(["CABIN", "HOTEL"] as const).map((t) => (
            <label
              key={t}
              className={cn(
                "cursor-pointer rounded-full border px-4 py-2 text-xs font-medium transition",
                propertyType === t
                  ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)]"
                  : "border-[color:var(--color-border)] bg-white/60 text-[color:var(--color-text-primary)] hover:border-[color:var(--color-primary)]"
              )}
            >
              <input
                type="radio"
                value={t}
                {...register("propertyType")}
                className="sr-only"
              />
              {t === "CABIN" ? "Cabaña" : "Hotel"}
            </label>
          ))}
        </div>
        <p className="text-xs text-[color:var(--color-text-muted)]">
          {isHotel
            ? "Hotel: definí tipos de habitación con su capacidad, precio e inventario."
            : "Cabaña: una sola unidad reservable (o varias unidades iguales)."}
        </p>
      </Section>

      {/* ─────────────── Geolocalización ─────────────── */}
      <Section title="Ubicación (mapa)">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Latitud" htmlFor="cf-lat">
            <Input
              id="cf-lat"
              type="number"
              step="0.0001"
              placeholder="-40.7308"
              {...register("latitude", { setValueAs: emptyToNull })}
            />
          </Field>
          <Field label="Longitud" htmlFor="cf-lng">
            <Input
              id="cf-lng"
              type="number"
              step="0.0001"
              placeholder="-71.6383"
              {...register("longitude", { setValueAs: emptyToNull })}
            />
          </Field>
        </div>
        <p className="text-xs text-[color:var(--color-text-muted)]">
          Opcional. Si no cargás coordenadas, el detalle muestra un link
          genérico a OpenStreetMap con la ubicación textual.
        </p>
      </Section>

      {/* ─────────────── Reglas / horarios / política ─────────────── */}
      <Section title="Reglas y horarios">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Check-in" htmlFor="cf-cin" hint="Ej: 15:00">
            <Input id="cf-cin" placeholder="15:00" {...register("checkInTime", { setValueAs: emptyToNull })} />
          </Field>
          <Field label="Check-out" htmlFor="cf-cout" hint="Ej: 11:00">
            <Input id="cf-cout" placeholder="11:00" {...register("checkOutTime", { setValueAs: emptyToNull })} />
          </Field>
          <Field
            label="Reglas de la casa"
            htmlFor="cf-rules"
            className="sm:col-span-2"
          >
            <textarea
              id="cf-rules"
              rows={3}
              placeholder="No fumar. Mascotas previa consulta. Música baja después de las 22 h."
              className="flex w-full rounded-xl border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm focus:border-[color:var(--color-primary)] focus:bg-white focus:outline-none"
              {...register("houseRules", { setValueAs: emptyToNull })}
            />
          </Field>
          <Field
            label="Política de cancelación"
            htmlFor="cf-cancel"
            className="sm:col-span-2"
          >
            <textarea
              id="cf-cancel"
              rows={3}
              placeholder="Cancelación gratuita hasta 7 días antes del check-in."
              className="flex w-full rounded-xl border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm focus:border-[color:var(--color-primary)] focus:bg-white focus:outline-none"
              {...register("cancellationPolicy", { setValueAs: emptyToNull })}
            />
          </Field>
        </div>
      </Section>

      {/* ─────────────── Anfitrión (solo CABIN se mostrará en la ficha) ─────────────── */}
      {!isHotel && (
        <Section title="Anfitrión">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nombre del anfitrión" htmlFor="cf-host-name">
              <Input
                id="cf-host-name"
                placeholder="Lucía Aguilar"
                {...register("hostDisplayName", { setValueAs: emptyToNull })}
              />
            </Field>
            <Field label="Ciudad" htmlFor="cf-host-city">
              <Input
                id="cf-host-city"
                placeholder="Villa La Angostura"
                {...register("hostCity", { setValueAs: emptyToNull })}
              />
            </Field>
            <Field
              label="Foto (URL)"
              htmlFor="cf-host-photo"
              className="sm:col-span-2"
            >
              <Input
                id="cf-host-photo"
                placeholder="https://..."
                {...register("hostPhoto", { setValueAs: emptyToNull })}
              />
            </Field>
            <Field
              label="Bio breve"
              htmlFor="cf-host-bio"
              className="sm:col-span-2"
            >
              <textarea
                id="cf-host-bio"
                rows={3}
                className="flex w-full rounded-xl border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm focus:border-[color:var(--color-primary)] focus:bg-white focus:outline-none"
                placeholder="Vivo a 200 m del lago. Recibo huéspedes desde 2020."
                {...register("hostBio", { setValueAs: emptyToNull })}
              />
            </Field>
            <Field label="Anfitrión desde" htmlFor="cf-host-since">
              <Input
                id="cf-host-since"
                type="date"
                {...register("hostingSince", { setValueAs: emptyDateToNull })}
              />
            </Field>
            <Field label="Teléfono (opcional)" htmlFor="cf-host-phone">
              <Input
                id="cf-host-phone"
                placeholder="+54 9 294 …"
                {...register("hostPhone", { setValueAs: emptyToNull })}
              />
            </Field>
            <Field label="Email de contacto (opcional)" htmlFor="cf-host-email">
              <Input
                id="cf-host-email"
                type="email"
                placeholder="hola@anfitrion.com"
                {...register("hostEmail", { setValueAs: emptyToNull })}
              />
            </Field>
            <Field
              label="Link / red social (opcional)"
              htmlFor="cf-host-link"
              className="sm:col-span-2"
            >
              <Input
                id="cf-host-link"
                placeholder="https://instagram.com/…"
                {...register("hostLink", { setValueAs: emptyToNull })}
              />
            </Field>
          </div>
        </Section>
      )}

      {/* ─────────────── Datos del hotel (sólo HOTEL) ─────────────── */}
      {isHotel && (
        <Section title="Datos del hotel">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nombre legal / comercial" htmlFor="cf-hotel-name">
              <Input
                id="cf-hotel-name"
                placeholder="Cordillera Resort & Spa S.A."
                {...register("hotelLegalName", { setValueAs: emptyToNull })}
              />
            </Field>
            <Field label="Ciudad" htmlFor="cf-hotel-city">
              <Input
                id="cf-hotel-city"
                placeholder="San Carlos de Bariloche"
                {...register("hotelCity", { setValueAs: emptyToNull })}
              />
            </Field>
            <Field
              label="Logo (URL)"
              htmlFor="cf-hotel-logo"
              className="sm:col-span-2"
            >
              <Input
                id="cf-hotel-logo"
                placeholder="https://..."
                {...register("hotelLogo", { setValueAs: emptyToNull })}
              />
            </Field>
            <Field
              label="Descripción breve"
              htmlFor="cf-hotel-desc"
              className="sm:col-span-2"
            >
              <textarea
                id="cf-hotel-desc"
                rows={3}
                className="flex w-full rounded-xl border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm focus:border-[color:var(--color-primary)] focus:bg-white focus:outline-none"
                placeholder="Hotel boutique frente al lago Nahuel Huapi…"
                {...register("hotelDescription", { setValueAs: emptyToNull })}
              />
            </Field>
            <Field
              label="Dirección"
              htmlFor="cf-hotel-address"
              className="sm:col-span-2"
            >
              <Input
                id="cf-hotel-address"
                placeholder="Av. Bustillo km 4.5"
                {...register("hotelAddress", { setValueAs: emptyToNull })}
              />
            </Field>
            <Field label="Teléfono" htmlFor="cf-hotel-phone">
              <Input
                id="cf-hotel-phone"
                placeholder="+54 294 4XX XXXX"
                {...register("hotelPhone", { setValueAs: emptyToNull })}
              />
            </Field>
            <Field label="Email de contacto" htmlFor="cf-hotel-email">
              <Input
                id="cf-hotel-email"
                type="email"
                placeholder="reservas@hotel.com"
                {...register("hotelEmail", { setValueAs: emptyToNull })}
              />
            </Field>
            <Field
              label="Web oficial (opcional)"
              htmlFor="cf-hotel-website"
              className="sm:col-span-2"
            >
              <Input
                id="cf-hotel-website"
                placeholder="https://www.hotel.com"
                {...register("hotelWebsite", { setValueAs: emptyToNull })}
              />
            </Field>
            <Field
              label="Horario de recepción"
              htmlFor="cf-hotel-reception"
              className="sm:col-span-2"
            >
              <Input
                id="cf-hotel-reception"
                placeholder="Recepción 24h · Check-in desde 15:00"
                {...register("hotelReceptionHours", { setValueAs: emptyToNull })}
              />
            </Field>
            <Field
              label="Políticas generales"
              htmlFor="cf-hotel-policies"
              className="sm:col-span-2"
            >
              <textarea
                id="cf-hotel-policies"
                rows={4}
                className="flex w-full rounded-xl border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm focus:border-[color:var(--color-primary)] focus:bg-white focus:outline-none"
                placeholder="Cancelaciones, mascotas, niños, política de fumadores…"
                {...register("hotelGeneralPolicies", { setValueAs: emptyToNull })}
              />
            </Field>
          </div>
        </Section>
      )}

      {/* ─────────────── Features ─────────────── */}
      <Section title="Features de la publicación">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_KEYS.filter(
            (k) => isHotel || !HOTEL_ONLY_FEATURES.includes(k)
          ).map((k) => (
            <label
              key={k}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-[color:var(--color-border)] bg-white/60 px-3 py-2 text-sm transition hover:border-[color:var(--color-primary)]"
            >
              <input
                type="checkbox"
                {...register(`features.${k}` as const)}
                className="h-4 w-4 accent-[color:var(--color-primary)]"
              />
              <span>{FEATURE_LABELS[k]}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* ─────────────── Hotel: tipos de habitación ─────────────── */}
      {isHotel && (
        <Section title="Tipos de habitación">
          <p className="text-xs text-[color:var(--color-text-muted)]">
            Cada tipo de habitación tiene su propio inventario, precio y
            capacidad. La disponibilidad pública se calcula por tipo.
          </p>
          <div className="space-y-4">
            {roomTypes.fields.map((f, idx) => (
              <div
                key={f.id}
                className="space-y-3 rounded-2xl border border-[color:var(--color-border)] bg-white/50 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <Field
                    label="Nombre"
                    htmlFor={`rt-name-${idx}`}
                    className="flex-1"
                  >
                    <Input
                      id={`rt-name-${idx}`}
                      placeholder="Suite Lago"
                      {...register(`roomTypes.${idx}.name`)}
                    />
                  </Field>
                  <button
                    type="button"
                    onClick={() => roomTypes.remove(idx)}
                    className="mt-7 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-border)] text-[color:var(--color-error)] hover:bg-[color:var(--color-error)]/8"
                    aria-label="Eliminar tipo de habitación"
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                </div>
                <Field label="Descripción" htmlFor={`rt-desc-${idx}`}>
                  <Input
                    id={`rt-desc-${idx}`}
                    placeholder="Cama king, vista al lago, baño privado."
                    {...register(`roomTypes.${idx}.description`, {
                      setValueAs: emptyToNull,
                    })}
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-3">
                  <NumField
                    label="Precio/noche (USD)"
                    id={`rt-price-${idx}`}
                    register={register(`roomTypes.${idx}.pricePerNight`)}
                  />
                  <NumField
                    label="Máx. huéspedes"
                    id={`rt-guests-${idx}`}
                    register={register(`roomTypes.${idx}.maxGuests`)}
                  />
                  <NumField
                    label="Cantidad disponible"
                    id={`rt-units-${idx}`}
                    register={register(`roomTypes.${idx}.totalUnits`)}
                  />
                </div>
                <RoomImagesSubForm
                  control={control}
                  register={register}
                  index={idx}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                roomTypes.append({
                  name: "",
                  description: null,
                  pricePerNight: 100,
                  maxGuests: 2,
                  totalUnits: 1,
                  amenities: [],
                  beds: [],
                  images: [],
                })
              }
            >
              <Plus size={14} strokeWidth={1.5} />
              Agregar tipo de habitación
            </Button>
          </div>
        </Section>
      )}

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

      {/* ─────────────── Beds ─────────────── */}
      <Section
        title="Camas"
        description="Detallá la configuración de camas por unidad. Los filtros del catálogo público usan esta info."
      >
        {beds.fields.length > 0 && (
          <ul className="space-y-2">
            {beds.fields.map((field, idx) => (
              <li
                key={field.id}
                className="grid grid-cols-[1fr_120px_auto] items-center gap-2"
              >
                <select
                  {...register(`beds.${idx}.type`)}
                  className="h-11 rounded-xl border border-[color:var(--color-border)] bg-white/60 px-4 text-sm focus:border-[color:var(--color-primary)] focus:bg-white focus:outline-none"
                >
                  <option value="TWIN">Individual</option>
                  <option value="DOUBLE">Matrimonial</option>
                  <option value="QUEEN">Queen</option>
                  <option value="KING">King</option>
                  <option value="SOFA_BED">Sofá cama</option>
                  <option value="BUNK">Litera</option>
                </select>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  placeholder="Cantidad"
                  {...register(`beds.${idx}.quantity`, { valueAsNumber: true })}
                />
                <IconBtn aria-label="Quitar" onClick={() => beds.remove(idx)} danger>
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
          onClick={() => beds.append({ type: "DOUBLE", quantity: 1 })}
        >
          <Plus size={14} strokeWidth={1.75} />
          Agregar tipo de cama
        </Button>
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

function emptyToNull(v: unknown) {
  if (v === '' || v === undefined) return null;
  return v;
}

function emptyDateToNull(v: unknown) {
  if (v === '' || v === undefined || v === null) return null;
  return v;
}

