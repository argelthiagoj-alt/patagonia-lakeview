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

Todas las cuentas comparten la misma contraseña: **`demo1234`**.

| Rol           | Email                                  | Posesión                                      |
| ------------- | -------------------------------------- | --------------------------------------------- |
| SUPER_ADMIN   | `superadmin@patagonialakeview.demo`    | Ve todo · banear · roles · apelaciones        |
| ADMIN · Pro   | `admin1@patagonialakeview.demo`        | Lucía · Arrayán + Ciprés                       |
| ADMIN         | `admin2@patagonialakeview.demo`        | Martín · Cóndor Mountain Refuge                |
| ADMIN         | `admin3@patagonialakeview.demo`        | Sofía · Lenga Superior Cabin                   |
| USER          | `user@patagonialakeview.demo`          | Tomás · perfil + 3 reservas demo               |

En `/login`, con `NODE_ENV !== "production"` o `NEXT_PUBLIC_DEMO_MODE=true`,
aparecen botones de **"Entrar como demo"** que loguean con un click.

### Roles

- **USER**: reserva, chatea con anfitriones, reseña sus estadías
- **ADMIN**: dueño de cabañas; ve y opera **solo lo suyo** (cabañas + reservas + chats + apelaciones de reseñas de sus cabañas)
- **SUPER_ADMIN**: ve y opera todo; asigna roles, banea usuarios, activa plan Pro, resuelve apelaciones, elimina reseñas

### Features clave

- **Pago simulado** con Visa/Mastercard/Mercado Pago + datos de facturación (DNI, teléfono, dirección). Nunca se almacena el número completo de tarjeta ni CVV.
- **Perfil de usuario** (Mis datos): se precarga en el checkout y se ofrece guardarlo después de la primera reserva.
- **Disponibilidad por unidades**: una publicación puede representar varias cabañas iguales (`Cabin.totalUnits`). No se permite overbooking.
- **Tipos de cama** por cabaña + filtros por tipo en el catálogo.
- **Chat por reserva**: usuario ↔ admin dueño de la cabaña (super-admin puede ver todo).
- **Reseñas**: solo después de una estadía completada. Una por reserva. ADMIN puede apelar; SUPER_ADMIN resuelve y/o elimina.
- **Ban** de usuarios desde `/admin/users` (cierra sesiones, bloquea reservar/chatear).
- **Plan Pro** de host: las cabañas de admins Pro aparecen **primero** en el catálogo + badge "Anfitrión Pro".

### Cómo probar cada feature

| Feature | Cómo |
|---|---|
| Demo login | `/login` → uno de los 5 botones |
| Perfil | Login como user → `/dashboard/profile` |
| Checkout simulado realista | Cabaña → reservar → tab Tarjeta o MP, completar billing |
| Disponibilidad por unidades | Reservar varias veces la misma fecha en Ciprés (totalUnits=3) hasta que se bloquee |
| Filtro por camas | `/cabins` → "Filtros" → "Camas" → marcar Queen / King / etc. |
| Chat | Reserva PENDING o CONFIRMED → click en el título de la cabaña en el dashboard → caja de mensajes |
| Reviews | Login como user → `/dashboard/reservations` → entrar a una CONFIRMED past o COMPLETED → "Dejá tu reseña" |
| Apelar reseña | Login como admin dueño de la cabaña → ir a la cabaña → en cada review, botón "Apelar" |
| Resolver apelación | Login como super-admin → `/admin/appeals` → Aprobar/Rechazar |
| Ban | super-admin → `/admin/users` → botón "Banear" en un user (te impide banearte a vos mismo) |
| Pro Host | super-admin → `/admin/users` → toggle "Pro" en un ADMIN → mirá `/cabins`: sus cabañas suben |

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
