"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { AvatarUpload } from "@/components/admin/AvatarUpload";

type Profile = {
  hostDisplayName: string | null;
  hostBio: string | null;
  hostPhoto: string | null;
  hostCity: string | null;
  hostingSince: Date | string | null;
  hostPhone: string | null;
  hostEmail: string | null;
  hostLink: string | null;
  hostInstagram: string | null;
  hotelLegalName: string | null;
  hotelLogo: string | null;
  hotelDescription: string | null;
  hotelAddress: string | null;
  hotelCity: string | null;
  hotelPhone: string | null;
  hotelEmail: string | null;
  hotelWebsite: string | null;
  hotelInstagram: string | null;
  hotelReceptionHours: string | null;
  hotelGeneralPolicies: string | null;
};

/**
 * Form del perfil de anfitrión/hotel a nivel cuenta. Cubre dos bloques:
 *   - Anfitrión (aparece en cabañas).
 *   - Hotel (aparece en publicaciones HOTEL).
 *
 * Las imágenes (avatar y logo) se suben friendly con `AvatarUpload`. El
 * resto son inputs simples con auto-collapse del bloque hotel si todavía
 * no lo necesitás.
 */
export function HostProfileForm({ initial }: { initial: Profile | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function isoDate(d: Date | string | null | undefined): string {
    if (!d) return "";
    const date = typeof d === "string" ? new Date(d) : d;
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
  }

  const [host, setHost] = useState({
    displayName: initial?.hostDisplayName ?? "",
    bio: initial?.hostBio ?? "",
    photo: initial?.hostPhoto ?? null,
    city: initial?.hostCity ?? "",
    since: isoDate(initial?.hostingSince),
    phone: initial?.hostPhone ?? "",
    email: initial?.hostEmail ?? "",
    link: initial?.hostLink ?? "",
    instagram: initial?.hostInstagram ?? "",
  });

  const [hotel, setHotel] = useState({
    legalName: initial?.hotelLegalName ?? "",
    logo: initial?.hotelLogo ?? null,
    description: initial?.hotelDescription ?? "",
    address: initial?.hotelAddress ?? "",
    city: initial?.hotelCity ?? "",
    phone: initial?.hotelPhone ?? "",
    email: initial?.hotelEmail ?? "",
    website: initial?.hotelWebsite ?? "",
    instagram: initial?.hotelInstagram ?? "",
    receptionHours: initial?.hotelReceptionHours ?? "",
    generalPolicies: initial?.hotelGeneralPolicies ?? "",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/host-profile", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            hostDisplayName: host.displayName || null,
            hostBio: host.bio || null,
            hostPhoto: host.photo,
            hostCity: host.city || null,
            hostingSince: host.since || null,
            hostPhone: host.phone || null,
            hostEmail: host.email || null,
            hostLink: host.link || null,
            hostInstagram: host.instagram || null,
            hotelLegalName: hotel.legalName || null,
            hotelLogo: hotel.logo,
            hotelDescription: hotel.description || null,
            hotelAddress: hotel.address || null,
            hotelCity: hotel.city || null,
            hotelPhone: hotel.phone || null,
            hotelEmail: hotel.email || null,
            hotelWebsite: hotel.website || null,
            hotelInstagram: hotel.instagram || null,
            hotelReceptionHours: hotel.receptionHours || null,
            hotelGeneralPolicies: hotel.generalPolicies || null,
          }),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          setError(d?.error ?? "No pudimos guardar los cambios.");
          return;
        }
        setSuccess(true);
        router.refresh();
      } catch {
        setError("Sin conexión.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <Section title="Anfitrión (cabañas)">
        <AvatarUpload
          value={host.photo}
          onChange={(v) => setHost({ ...host, photo: v })}
          label="Foto de anfitrión"
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nombre visible" htmlFor="hp-name">
            <Input
              id="hp-name"
              value={host.displayName}
              onChange={(e) =>
                setHost({ ...host, displayName: e.target.value })
              }
              placeholder="Lucía Aguilar"
            />
          </Field>
          <Field label="Ciudad / provincia" htmlFor="hp-city">
            <Input
              id="hp-city"
              value={host.city}
              onChange={(e) => setHost({ ...host, city: e.target.value })}
              placeholder="Villa La Angostura"
            />
          </Field>
          <Field label="Anfitrión desde" htmlFor="hp-since">
            <Input
              id="hp-since"
              type="date"
              value={host.since}
              onChange={(e) => setHost({ ...host, since: e.target.value })}
            />
          </Field>
          <Field label="Teléfono (opcional)" htmlFor="hp-phone">
            <Input
              id="hp-phone"
              value={host.phone}
              onChange={(e) => setHost({ ...host, phone: e.target.value })}
              placeholder="+54 9 294 …"
            />
          </Field>
          <Field label="Email (opcional)" htmlFor="hp-email">
            <Input
              id="hp-email"
              type="email"
              value={host.email}
              onChange={(e) => setHost({ ...host, email: e.target.value })}
              placeholder="hola@anfitrion.com"
            />
          </Field>
          <Field label="Instagram (opcional)" htmlFor="hp-instagram">
            <Input
              id="hp-instagram"
              value={host.instagram}
              onChange={(e) =>
                setHost({ ...host, instagram: e.target.value })
              }
              placeholder="@usuario  ·  o pegá la URL completa"
            />
          </Field>
          <Field label="Otro link (opcional)" htmlFor="hp-link">
            <Input
              id="hp-link"
              value={host.link}
              onChange={(e) => setHost({ ...host, link: e.target.value })}
              placeholder="https://…"
            />
          </Field>
          <Field
            label="Bio breve"
            htmlFor="hp-bio"
            className="sm:col-span-2"
          >
            <textarea
              id="hp-bio"
              rows={3}
              value={host.bio}
              onChange={(e) => setHost({ ...host, bio: e.target.value })}
              placeholder="Vivo a 200 m del lago. Recibo huéspedes desde 2020."
              className="flex w-full rounded-xl border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm focus:border-[color:var(--color-primary)] focus:bg-white focus:outline-none"
            />
          </Field>
        </div>
      </Section>

      <Section title="Hotel (publicaciones HOTEL)">
        <AvatarUpload
          value={hotel.logo}
          onChange={(v) => setHotel({ ...hotel, logo: v })}
          label="Logo institucional"
          shape="rounded"
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nombre legal / comercial" htmlFor="hh-name">
            <Input
              id="hh-name"
              value={hotel.legalName}
              onChange={(e) =>
                setHotel({ ...hotel, legalName: e.target.value })
              }
              placeholder="Cordillera Resort & Spa S.A."
            />
          </Field>
          <Field label="Ciudad" htmlFor="hh-city">
            <Input
              id="hh-city"
              value={hotel.city}
              onChange={(e) => setHotel({ ...hotel, city: e.target.value })}
              placeholder="San Carlos de Bariloche"
            />
          </Field>
          <Field
            label="Descripción institucional"
            htmlFor="hh-desc"
            className="sm:col-span-2"
          >
            <textarea
              id="hh-desc"
              rows={3}
              value={hotel.description}
              onChange={(e) =>
                setHotel({ ...hotel, description: e.target.value })
              }
              placeholder="Hotel boutique frente al lago Nahuel Huapi…"
              className="flex w-full rounded-xl border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm focus:border-[color:var(--color-primary)] focus:bg-white focus:outline-none"
            />
          </Field>
          <Field
            label="Dirección"
            htmlFor="hh-address"
            className="sm:col-span-2"
          >
            <Input
              id="hh-address"
              value={hotel.address}
              onChange={(e) =>
                setHotel({ ...hotel, address: e.target.value })
              }
              placeholder="Av. Bustillo km 4.5"
            />
          </Field>
          <Field label="Teléfono" htmlFor="hh-phone">
            <Input
              id="hh-phone"
              value={hotel.phone}
              onChange={(e) =>
                setHotel({ ...hotel, phone: e.target.value })
              }
              placeholder="+54 294 4XX XXXX"
            />
          </Field>
          <Field label="Email" htmlFor="hh-email">
            <Input
              id="hh-email"
              type="email"
              value={hotel.email}
              onChange={(e) =>
                setHotel({ ...hotel, email: e.target.value })
              }
              placeholder="reservas@hotel.com"
            />
          </Field>
          <Field label="Web oficial" htmlFor="hh-web">
            <Input
              id="hh-web"
              value={hotel.website}
              onChange={(e) =>
                setHotel({ ...hotel, website: e.target.value })
              }
              placeholder="https://www.hotel.com"
            />
          </Field>
          <Field label="Instagram (opcional)" htmlFor="hh-instagram">
            <Input
              id="hh-instagram"
              value={hotel.instagram}
              onChange={(e) =>
                setHotel({ ...hotel, instagram: e.target.value })
              }
              placeholder="@hotel  ·  o pegá la URL completa"
            />
          </Field>
          <Field label="Horario de recepción" htmlFor="hh-rec">
            <Input
              id="hh-rec"
              value={hotel.receptionHours}
              onChange={(e) =>
                setHotel({ ...hotel, receptionHours: e.target.value })
              }
              placeholder="Recepción 24h"
            />
          </Field>
          <Field
            label="Políticas generales"
            htmlFor="hh-policies"
            className="sm:col-span-2"
          >
            <textarea
              id="hh-policies"
              rows={4}
              value={hotel.generalPolicies}
              onChange={(e) =>
                setHotel({ ...hotel, generalPolicies: e.target.value })
              }
              placeholder="Cancelaciones, mascotas, niños, política de fumadores…"
              className="flex w-full rounded-xl border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm focus:border-[color:var(--color-primary)] focus:bg-white focus:outline-none"
            />
          </Field>
        </div>
      </Section>

      <div className="flex items-center justify-between gap-3 border-t border-[color:var(--color-border)] pt-6">
        <div className="text-xs">
          {success && (
            <p className="inline-flex items-center gap-1.5 text-[color:var(--color-success)]">
              <Check size={12} strokeWidth={1.75} /> Perfil guardado.
            </p>
          )}
          {error && (
            <p className="inline-flex items-center gap-1.5 text-[color:var(--color-error)]">
              <AlertCircle size={12} strokeWidth={1.75} /> {error}
            </p>
          )}
        </div>
        <Button type="submit" variant="primary" size="md" disabled={pending}>
          <Save size={14} strokeWidth={1.75} />
          {pending ? "Guardando…" : "Guardar perfil"}
        </Button>
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5 rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6">
      <h2 className="text-base font-medium tracking-tight text-[color:var(--color-text-primary)]">
        {title}
      </h2>
      {children}
    </section>
  );
}
