# Patagonia Lakeview — Arquitectura

Esta nota describe cómo está organizado el código después de la
modularización (Fases 1–5). Es el documento de referencia para cualquier
contribución nueva.

## Objetivos

- **Separar dominios.** Cada feature (auth, reservas, pagos, cabañas,
  reviews, chat, usuarios, email, jobs) vive en su propio módulo.
- **Mantener las route handlers delgadas.** Las rutas (`src/app/api/**/route.ts`)
  solo parsean el body, llaman al service y mapean el resultado a un HTTP
  status. La lógica de negocio nunca vive en una route.
- **Hacer obvio qué es cliente y qué es servidor.** Los módulos que tocan la
  DB declaran `import "server-only"` en la primera línea.
- **Resultados tipados sin try/catch en la ruta.** Los services devuelven
  tagged unions y la ruta hace un `switch` exhaustivo.

## Layout

```
src/
├── app/                       # Next.js App Router (rutas + layouts + páginas)
│   ├── api/**/route.ts        # Route handlers delgados
│   ├── (público)/             # Páginas server-rendered
│   └── (auth/admin/dashboard)
│
├── modules/                   # Bounded contexts (uno por dominio)
│   ├── auth/
│   │   ├── schemas.ts         # Zod, client-safe
│   │   ├── repo.ts            # Prisma (sessions, codes, oauth accounts)
│   │   ├── session.ts         # cookies + getCurrentUser/requireUser/etc.
│   │   └── service.ts         # authenticate, register, password reset...
│   ├── cabins/
│   │   ├── schemas.ts
│   │   ├── beds.ts            # BED_LABELS, summarizeBeds (helper puro)
│   │   ├── filters.ts         # applyCabinFilters, countActiveFilters
│   │   ├── repo.ts            # Prisma + MockCabin view layer
│   │   └── service.ts
│   ├── chat/                  # schemas + repo + service (auth-by-role)
│   ├── email/
│   │   ├── client.ts          # Resend transport (sendEmail, fromAddress…)
│   │   ├── senders.ts         # sendPasswordResetCode, sendReservationConfirmed…
│   │   └── templates/         # Un archivo HTML por plantilla
│   │       ├── _shared.ts     # layout, codeBlock, pill, escapeHtml, colores
│   │       ├── _helpers.ts    # fmtMoney, fmtRange
│   │       ├── password-reset.ts
│   │       ├── verify-email.ts
│   │       ├── reservation-{received,confirmed,rejected}.ts
│   │       └── job-application.ts
│   ├── jobs/                  # Trabajá con nosotros (sólo schemas)
│   ├── payments/
│   │   ├── schemas.ts
│   │   ├── helpers.ts         # detectCardBrand, lastFour, formatCard*…
│   │   ├── labels.ts          # paymentStatusLabel, paymentStatusTone
│   │   └── service.ts         # buildSimulatedPaymentData
│   ├── reservations/
│   │   ├── schemas.ts
│   │   ├── policies.ts        # canViewReservation, canDecideReservation…
│   │   ├── repo.ts
│   │   └── service.ts         # createReservation, transitionReservation…
│   ├── reviews/
│   │   ├── schemas.ts
│   │   ├── policies.ts        # canSubmitReview, canFileAppeal…
│   │   ├── repo.ts            # incluye recomputeCabinAggregate(tx | prisma)
│   │   └── service.ts         # submitReview, removeReview, fileAppeal, resolveAppeal
│   └── users/
│       ├── schemas.ts
│       ├── repo.ts            # owner del table User
│       └── service.ts         # updateProfile, updateRole, banUser, setPlan…
│
├── shared/
│   └── auth-roles.ts          # Helpers de rol PUROS, client-safe
│
└── lib/                       # Cross-cutting: SDKs + utils sin dominio propio
    ├── booking.ts             # computeBookingPrice, hasOverlap
    ├── codes.ts               # generateNumericCode, hashCode, verifyCode
    ├── image-upload.ts        # cliente Vercel Blob
    ├── images.ts              # transformaciones de URL (CDN params)
    ├── oauth.ts               # exchangeGoogleCode, fetchGoogleProfile
    ├── prisma.ts              # singleton de PrismaClient
    ├── rate-limit.ts          # checkRateLimit en memoria
    └── utils.ts               # cn, formatCurrency, toDateInputValue
```

## Convenciones por archivo

### `schemas.ts` — client-safe

- Solo Zod. **Sin** `import "server-only"`.
- Se puede importar desde cualquier client component.
- Cada schema exporta también su tipo inferido (`export type FooInput = z.infer<…>`).

### `repo.ts` — server-only

- Primera línea: `import "server-only";`.
- Funciones thin sobre Prisma. Sin reglas de negocio.
- Las consultas que hay que correr dentro de una transacción aceptan
  `tx: Prisma.TransactionClient | typeof prisma` para poder usarse adentro
  o afuera (ej. `recomputeCabinAggregate` en `reviews/repo.ts`).
- Si un módulo necesita transacciones, exporta su propio helper
  `transactional(fn)` envolviendo `prisma.$transaction`.

### `policies.ts` — server-only, **sin I/O**

- Predicados puros sobre `CurrentUser` y una entidad recibida por parámetro.
- Devuelven `boolean`.
- El service hace el fetch del row y le pasa el resultado a la policy.
  Esto separa "qué puede ver/hacer" de "cómo lo cargo".

### `service.ts` — server-only

- Compone repo + policies + email + side effects.
- Devuelve **tagged unions**:

```ts
export type SubmitReviewResult =
  | { ok: true; review: ReviewRow }
  | { ok: false; reason:
      | "NOT_FOUND"
      | "FORBIDDEN"
      | "NOT_ELIGIBLE"
      | "ALREADY_REVIEWED"
      | "BANNED"
      | "SERVER" };
```

- Nunca tira. Cualquier error inesperado se loguea y se traduce a
  `{ ok: false, reason: "SERVER" }`.
- La ruta hace `switch (result.reason)` y mapea cada caso a un HTTP status.

### Route handlers (`src/app/api/**/route.ts`)

Forma canónica:

```ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/modules/auth/session";
import { reviewSchema } from "@/modules/reviews/schemas";
import { submitReview } from "@/modules/reviews/service";

export async function POST(req: Request) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const result = await submitReview(me, parsed.data);
  if (!result.ok) {
    switch (result.reason) {
      case "NOT_FOUND":        return NextResponse.json({ error: "…" }, { status: 404 });
      case "FORBIDDEN":        return NextResponse.json({ error: "…" }, { status: 403 });
      case "NOT_ELIGIBLE":     return NextResponse.json({ error: "…" }, { status: 400 });
      case "ALREADY_REVIEWED": return NextResponse.json({ error: "…" }, { status: 409 });
      case "BANNED":           return NextResponse.json({ error: "…" }, { status: 403 });
      case "SERVER":           return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }
  return NextResponse.json({ review: result.review }, { status: 201 });
}
```

Lo que **no** debería estar en una route:

- Llamadas a Prisma. Eso es repo.
- Reglas de autorización. Eso son policies.
- `recompute*`, envíos de email, lógica de transición. Eso es service.

## Reglas de import

- `app/` → `modules/<feature>/*` o `shared/*` o `lib/*`.
- `modules/<feature>/*` → `modules/<otra-feature>/*` cuando hace falta cruzar
  dominios desde el service (ej. `reservations/service.ts` llama a
  `payments/service.ts`). Mantener este grafo lo más acíclico posible.
- `modules/<feature>/schemas.ts` **nunca** debe importar de un repo/service.
- `shared/` no debe importar nada de `modules/`, `lib/` o `app/`. Es puro.
- `lib/` no debe importar de `modules/` (es la otra dirección).

## Client vs server

- Todo lo que requiere DB/cookies/secret tiene `import "server-only"` arriba.
- Los schemas y los helpers de `shared/` se pueden importar desde client
  components (forms con React Hook Form + zodResolver).
- Las páginas y layouts del App Router son server components por default;
  los components con estado/handler son client components y traen
  `"use client"` arriba.

## Patrón de resultado vs excepción

| Caso                                  | Estrategia                                  |
|---------------------------------------|---------------------------------------------|
| Validación de input                   | Zod safeParse en la route → 400             |
| Falta de auth / sesión inválida       | `getCurrentUser()` null → 401 en la route   |
| Falla de policy o regla de negocio    | `{ ok: false, reason: "..." }` en service   |
| Error inesperado (red, Prisma, etc.)  | `try/catch` adentro del service → `SERVER`  |
| `requireAdmin` / `requireSuperAdmin`  | Tiran; la route las envuelve en try/catch   |

## Ejemplos representativos

- **Composición service ↔ service**:
  `reservations/service.ts::createReservation` llama a
  `payments/service.ts::buildSimulatedPaymentData` y a
  `email/senders.ts::sendReservationReceivedEmail`.
- **Policy pura**: `reviews/policies.ts::canSubmitReview(user, reservation)`
  evalúa estado + ownership + bans sin tocar Prisma.
- **Recompute reusable**: `reviews/repo.ts::recomputeCabinAggregate(txOrPrisma, cabinId)`
  funciona dentro y fuera de transacción.
- **Re-exports cross-domain**: `auth/repo.ts` re-exporta las funciones que
  necesita del `users/repo.ts` para que el auth/service solo importe de
  `auth/repo`.

## Qué NO modularizamos

- `lib/prisma.ts` (singleton del cliente Prisma).
- `lib/rate-limit.ts`, `lib/codes.ts`, `lib/oauth.ts`,
  `lib/booking.ts`, `lib/image-upload.ts`, `lib/images.ts`,
  `lib/utils.ts`. Son utilidades cross-cutting sin dominio propio.

Si en el futuro alguno de estos pierde su carácter "neutral" (por ejemplo,
`booking.ts` empieza a depender de policies de reservation), conviene moverlo
al módulo correspondiente.

## Módulos planificados (Major update)

Estos módulos están **listados en `docs/MODULES.md`** y se materializan en
las Fases 2–4 del major update (`docs/FEATURE_ROADMAP.md`):

- `favorites/` — User ↔ Cabin saves. Necesita modelo `Favorite` (Prisma).
- `seasonal-theme/` — helper puro currentSeason(date) + CSS vars por temporada.
- `demo-tools/` — centraliza demo whitelist + helpers ("Resetear demo" futuro).
- `city-guide/` — contenido tipado para experiences/cities. Read-only sobre
  `data.ts` para empezar; se promueve a Prisma si llega CRUD.
- `admin/` — sólo si emergen policies/utilidades compartidas. Las rutas
  `app/admin/*` siguen viviendo donde están.

Reglas adicionales que **siempre** aplican al agregar un módulo:

1. Crear el folder vacío + un `schemas.ts` con tipos antes que cualquier
   otra cosa. Subir esa fase con tsc/build verdes.
2. Sólo después introducir `repo.ts` (toca Prisma) y `service.ts`. Cada
   uno en su propio commit/fase si se puede.
3. Las rutas (`app/api/<feature>/route.ts`) son lo último: si ya existe el
   handler legacy, primero se duplica el path nuevo en feature-flag mode,
   se migra UI y luego se borra el viejo.

## Principios para mantener bajo el uso de contexto

- Antes de modificar, listar archivos por tamaño y abrir solo los necesarios.
- No leer un archivo completo si una sección basta — usar `offset` + `limit`.
- Cuando un cambio toca >5 archivos, plantearlo como una **fase** con
  `tsc/build` al final, no como un único mega-commit.
- Para refactors gigantes (>30 archivos), separar **migración** (mover
  código) de **uso** (cambiar imports) en fases distintas.
- Mantener barrels temporales con `@deprecated` durante la ventana de
  migración. Borrar el barrel **sólo** cuando un grep confirme cero
  importadores.

## Tests / verificación

Después de cualquier cambio que toque un módulo:

```
npx tsc --noEmit
npm run build
```

Si se cambia un schema, revisar que tanto la route handler como el client
form que lo usan tipan bien.
