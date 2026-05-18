# Patagonia Lakeview — Case Study

## Problema

Las plataformas masivas de alojamiento (Airbnb, Booking) son útiles pero
genéricas. Las cabañas boutique de la Patagonia se diluyen entre miles de
listados sin identidad. Quería diseñar una plataforma propia, full-stack, que
trate cada cabaña como una experiencia y no como una fila más en una tabla.

## Objetivo

Una web/app que:

- Comunique la atmósfera del lugar antes de que el usuario lea precios.
- Permita reservar de forma simple y confiable.
- Tenga un panel admin real para operar el negocio.
- Demuestre, en código, el ciclo completo: diseño → frontend → backend → DB → auth → operación.

## Stack

- **Next.js 15** (App Router) — RSC + Server Actions + route handlers.
- **React 19** + **TypeScript** estricto.
- **Tailwind v4** con tokens en CSS (`@theme`) — paleta cálida y consistente.
- **Prisma + PostgreSQL** para el modelo relacional.
- **Zod** para validar entrada en cliente y servidor (mismo schema).
- **React Hook Form-friendly** (el `BookingForm` mantiene la API mínima).
- **Framer Motion** y CSS keyframes para microinteracciones.
- **React Three Fiber** para una capa atmosférica sutil.
- **bcryptjs** + cookies httpOnly para auth propia.

## Arquitectura

```
                 ┌──────────────────┐
   navegador ───▶│  App Router (RSC) │──▶ DB helpers (lib/db/*) ──▶ Prisma ──▶ Postgres
                 │  · pages           │
                 │  · layouts         │
                 │  · loading/error   │
                 └─────┬────────────┘
                       │ fetch (POST/PATCH)
                       ▼
                 ┌──────────────────┐
                 │ API route handlers│──▶ Zod  · auth · booking lib
                 └──────────────────┘
```

- Las páginas que listan/detallan cabañas son **server components** que leen
  vía `lib/db/cabins.ts`. Si la DB no está disponible, el helper cae a mocks
  (`src/data/cabins.ts`) para no romper la experiencia.
- Las mutaciones (crear reserva, login, register, cancel, admin CRUD) usan
  **route handlers** en `/api/*`, todos validados con Zod y con manejo
  uniforme de errores.

## Features implementadas

- Landing premium con hero, búsqueda inline, secciones temáticas, testimonios, FAQ y CTA final.
- Catálogo con filtros (huéspedes, precio máximo, vista al lago) + estado vacío.
- Detalle de cabaña con galería + lightbox, amenities, política y formulario de reserva sticky.
- API de reservas con verificación de overlap, capacidad y precio derivado en servidor.
- Auth propia: register, login, logout, sesiones en DB + cookies httpOnly.
- Dashboard de usuario: resumen, reservas, perfil, cancelación.
- Panel admin: métricas, CRUD de cabañas, gestión de reservas (confirmar / cancelar).
- Componente `AtmosphereParticles` (Three.js) montado solo si WebGL + motion lo permiten.
- Componente `SafeImage` para que cualquier imagen remota falle con gracia.
- Estados de loading global (Skeleton) y página de error global.

## Decisiones de diseño

### Imágenes centralizadas
Toda la app referencia `src/lib/images.ts`. El usuario puede reemplazar URLs
remotas por assets locales sin tocar un solo componente. Crítico para un
demo donde las imágenes son placeholders.

### Tokens en CSS, no en JS
Tailwind v4 me permite declarar la paleta y motion como variables CSS.
Resultado: SSR sin flicker, hover/dark trivial, sin colores duplicados.

### Prisma con fallback
El layer `lib/db/cabins.ts` envuelve cada lectura en `safeDb`. Si la DB no
responde, se usan los mocks. En dev permite trabajar sin levantar Postgres.
En prod, sirve de salvaguarda mientras se completan migraciones.

### Auth simple en lugar de NextAuth
Para este demo, una capa propia con bcrypt + cookies httpOnly + tabla
`Session` cubre el caso de uso, evita un proveedor externo y mantiene la
superficie de código auditable.

### Three.js como atmósfera, no como protagonista
La regla del SKILL.md: si el efecto no mejora la atmósfera o la conversión,
no se incluye. Implementé un único campo de partículas livianas, con
fallback silencioso si WebGL no está disponible o si el usuario tiene
`prefers-reduced-motion`.

## Posibles mejoras

- Migrar las mutaciones a **Server Actions** y eliminar buena parte de los route handlers.
- Imágenes propias optimizadas + AVIF/WebP en `next/image`.
- Calendario visual de disponibilidad (date-range picker), reemplazando los dos `<input type=date>`.
- Pagos con Stripe / Mercado Pago para confirmar la reserva.
- Notificaciones por mail (Resend) al confirmar / cancelar.
- Sistema de reviews con moderación desde admin.
- Internacionalización ES / EN.
- Métricas reales en admin (ocupación por mes, ingresos por cabaña).
- Tests e2e con Playwright para el flujo de reserva.

## Capturas recomendadas para el caso de estudio

- Hero (con y sin partículas activas)
- Catálogo con filtros aplicados
- Detalle de cabaña con formulario sticky
- Confirmación de reserva
- Dashboard de usuario con reservas
- Panel admin: resumen + tabla de reservas
- Estado vacío + estado de error
