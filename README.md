# Patagonia Lakeview

Plataforma full-stack de reservas de cabañas boutique inspirada en la Patagonia.

Stack: **Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v4 · Prisma · PostgreSQL · Zod · React Hook Form · Framer Motion · React Three Fiber**

> Demo de portfolio. Diseño cálido, lógica de reservas con detección de overlap, auth propia con cookies httpOnly, dashboard de usuario y panel admin.

---

## Requisitos

- Node.js **20+**
- PostgreSQL (local, Supabase, Neon, Railway, etc.)
- npm 10+ / pnpm / bun (los ejemplos usan npm)

## Setup rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# editar DATABASE_URL y AUTH_SECRET

# 3. Crear el schema en la DB y sembrar datos
npx prisma db push
npm run db:seed

# 4. Arrancar en desarrollo
npm run dev
```

Abrí http://localhost:3000

### Cuentas demo

| Rol   | Email                              | Password    |
| ----- | ---------------------------------- | ----------- |
| Admin | `admin@patagonialakeview.com`      | `admin1234` |
| User  | `guest@patagonialakeview.com`      | `guest1234` |

---

## Imágenes

Todas las imágenes del proyecto se administran desde **un único archivo**:

```
src/lib/images.ts
```

Por defecto el proyecto usa URLs remotas de Unsplash como placeholders. Para
reemplazarlas con assets locales:

1. Guardá tus imágenes en `public/images/...`
2. En `src/lib/images.ts`, cambiá las URLs por sus rutas locales:
   ```ts
   heroPrimary: {
     url: "/images/hero-lago.jpg",
     alt: "Cabaña frente al lago al atardecer"
   }
   ```
3. Listo: los componentes ya consumen el registro centralizado y no necesitan
   ningún cambio adicional.

Los dominios remotos permitidos están en `next.config.ts`. Si agregás un nuevo
dominio remoto, sumalo a `remotePatterns`.

Si una imagen remota falla, el componente `SafeImage` cae a un fallback
elegante en lugar de romper el layout.

---

## Estructura del proyecto

```
src/
├─ app/                       # App Router (rutas, layouts, API)
│  ├─ (público) / cabins, about, contact, availability, login, register
│  ├─ dashboard/              # Área protegida del usuario
│  ├─ admin/                  # Panel administrativo
│  └─ api/                    # Route handlers (auth, reservations, admin)
├─ components/
│  ├─ ui/                     # Button, Card, Input, Badge, SafeImage, Skeleton…
│  ├─ layout/                 # Header, Footer, DashboardShell, Logo
│  ├─ sections/               # Hero, FeaturedCabins, Experience, FAQ…
│  ├─ cabins/                 # CabinCard, CabinGallery, CabinAmenities…
│  ├─ booking/                # BookingForm, SearchBar, ReservationCard
│  ├─ admin/                  # CabinForm, AdminReservationRow
│  ├─ auth/                   # AuthForm, LogoutButton
│  └─ three/                  # AtmosphereParticles
├─ data/
│  └─ cabins.ts               # Mock data (también consumida por el seed)
├─ lib/
│  ├─ prisma.ts               # Cliente Prisma singleton
│  ├─ auth.ts                 # Sesiones, cookies, hash de password
│  ├─ booking.ts              # Cálculo de precio + overlap
│  ├─ validations.ts          # Schemas Zod
│  ├─ images.ts               # Registro centralizado de imágenes
│  ├─ utils.ts                # cn(), formatCurrency, fechas
│  └─ db/cabins.ts            # Helpers que leen de DB (con fallback a mock)
└─ prisma/
   ├─ schema.prisma
   └─ seed.ts
```

---

## Modelo de dominio

- **User** (`USER` / `ADMIN`) con sesiones por cookie httpOnly
- **Cabin** con imágenes, amenities, highlights y reservas
- **Reservation** con estado `PENDING | CONFIRMED | CANCELLED | COMPLETED`
- **Review** por cabaña y usuario

La lógica de overlap evita reservas superpuestas:

```ts
existing.checkIn < newCheckOut AND existing.checkOut > newCheckIn
```

Implementada en `src/lib/booking.ts`. El endpoint POST `/api/reservations` la
aplica antes de crear cualquier reserva.

---

## Scripts

| Script             | Descripción                                |
| ------------------ | ------------------------------------------ |
| `npm run dev`      | Levanta Next.js en modo desarrollo         |
| `npm run build`    | Build de producción                        |
| `npm run start`    | Sirve el build en producción               |
| `npm run lint`     | Linter de Next.js                          |
| `npm run db:push`  | Aplica el schema de Prisma a la DB         |
| `npm run db:seed`  | Pobla la DB con cabañas, amenities y demo  |
| `npm run db:studio`| Abre Prisma Studio                         |

---

## Deploy

Pensado para Vercel + Supabase/Neon:

1. Conectá el repo a Vercel.
2. Configurá las env vars (`DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`).
3. En el build, Prisma se genera automáticamente (`postinstall`).
4. Después del primer deploy, ejecutá `prisma db push` y `db:seed`
   contra la DB de producción (o usá `prisma migrate deploy`).

---

## Decisiones de diseño

- **Tokens en CSS, no en JS**: paleta y motion definidos en `globals.css` con
  Tailwind v4. Más performante, más fácil de auditar visualmente.
- **DB con fallback a mock**: las páginas públicas funcionan incluso sin DB,
  cayendo a `src/data/cabins.ts`. Útil para previews y onboarding.
- **Imágenes centralizadas**: nada se hardcodea por la app.
- **Three.js no invasivo**: solo partículas atmosféricas en el hero, con
  detección de WebGL + `prefers-reduced-motion`. Si falla, no rompe nada.
- **Auth propia simple**: sesiones en DB + cookies httpOnly. Sin proveedor
  externo para mantener el demo cerrado y portable.

Más detalle en [`CASE_STUDY.md`](./CASE_STUDY.md).
