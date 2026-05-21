# FEATURE_ROADMAP — Major update

Este documento captura las **4 fases pequeñas** del major update.
Reglas: no big-bang, no breaking changes, verificar tsc/build después de
cada fase, tocar sólo lo necesario.

---

## Fase 1 — Auditoría + docs (en curso)

**Salida**: `docs/ARCHITECTURE.md`, `docs/MODULES.md`, `docs/FEATURE_ROADMAP.md`.

Sin cambios de código. Tres decisiones de diseño quedaron resueltas con el
usuario:

1. **Flujo de pago** → agregar `APPROVED` al enum `ReservationStatus`. State
   machine: `PENDING → APPROVED → CONFIRMED`. Cancel desde APPROVED si el
   pago no se procesa.
2. **Favorites** → mínimo viable User ↔ Cabin (modelo `Favorite` con
   unique(userId, cabinId)). Sin listas compartibles por ahora.
3. **Seasonal theme** → automático por fecha (`currentSeason(d)`). CSS
   variables por temporada en `globals.css`. Sin admin UI.

---

## Fase 2 — Scaffolds de módulos nuevos

**Objetivo**: dejar el árbol listo para que Fases 3 y posteriores tengan
dónde aterrizar. **Cero lógica nueva**. Sólo archivos vacíos o con tipos
mínimos.

Archivos a crear:

```
src/modules/favorites/
  schemas.ts          # toggleFavoriteSchema (cabinId)
  repo.ts             # placeholder: stubs comentados
  service.ts          # placeholder

src/modules/seasonal-theme/
  config.ts           # SEASONS const + paleta por temporada (sin tocar globals.css aún)
  helpers.ts          # currentSeason(date), seasonLabel(season)

src/modules/demo-tools/
  config.ts           # DEMO_EMAILS, demoEnabled()  ← mover desde demo-login route
  service.ts          # placeholder para futuras herramientas

src/modules/city-guide/
  data.ts             # cities[] + experiences[] como constantes tipadas
  schemas.ts          # CitySchema, ExperienceSchema (validación de la data estática)
  repo.ts             # getCityBySlug, listCities, listExperiencesByCity (read-only sobre data)

src/modules/admin/
  policies.ts         # requireAdminFromSession, optional helpers
```

Notas:

- `demo-tools/config.ts` **no** mueve el route handler todavía. Sólo
  centraliza la whitelist y el flag. La route sigue funcionando.
- `city-guide` arranca con `data.ts` puro porque hoy no hay UI/CMS que lo
  consuma. Si Fase 5+ pide CRUD se promueve a Prisma.
- `favorites` se deja stub (sin DB push) hasta Fase 4+ porque su modelo
  requiere `prisma db push`. Otra opción es hacer DB push en Fase 4 cuando
  ya lo haga el flujo de pago.

Salida: `tsc --noEmit` + `npm run build` verdes. Cero archivos modificados
fuera de `src/modules/{favorites,seasonal-theme,demo-tools,city-guide,admin}/`.

---

## Fase 3 — Fixes visuales

### 3.1 Hero blur/gradiente

**Archivos**: `src/components/sections/Hero.tsx` (sin tocar `globals.css`).

Problema: el gradiente bottom (`h-32 bg-gradient-to-b from-transparent to-bg`)
desde "Hero" baja sobre el `SearchBar` y le mete una neblina cálida que hace
ver los inputs `<input type="date">` deslavados. Además el doble overlay
oscuro (`from-black/35 via-black/15 to-bg` + `from-black/30 via-transparent
to-black/20`) recalca el efecto.

Cambio mínimo:

- Reducir la franja inferior de `h-32` a `h-12` o eliminarla.
- Bajar el gradiente lateral de `black/30 … black/20` a `black/15 … black/10`.

No tocar las animaciones `hero-fade-up`. No tocar `surface-paper` ni
`surface-glass` (eso afecta a otros components).

### 3.2 About — sección "Más que cabañas"

**Archivos**: `src/app/about/page.tsx` (solo el bloque 127-213).

Problema: la columna izquierda está `lg:sticky lg:top-32` y el grid es
`lg:grid-cols-[1fr_1.4fr]`. Cuando se scrollea, queda mucho aire por debajo
del texto sticky porque las 4 cards (2 cols × 2 rows con aspect 4/5) son más
altas que el bloque sticky.

Cambio mínimo:

- Quitar `lg:sticky lg:top-32` (deja al texto fluir con las cards).
- Cambiar el grid a `lg:grid-cols-2 lg:gap-12` para que las dos columnas
  pesen igual.
- En `<ul>` cambiar aspect `[4/5]` → `[5/6]` para que la card sea menos
  alta y el ratio cuelgue mejor.

No tocar el resto del about/page.

---

## Fase 4 — Flujo PENDING → APPROVED → CONFIRMED

**Schema** (`prisma/schema.prisma`):

```prisma
enum ReservationStatus {
  PENDING       // request creado, sin pago, sin aprobar
  APPROVED      // host aprobó; awaiting payment del huésped (NUEVO)
  CONFIRMED     // pagado y confirmado
  REJECTED
  CANCELLED
  COMPLETED
}
```

`Payment` queda opcional al crear (sigue siendo `Reservation.payment? Payment`).
Cambio: el `default(SIMULATED_APPROVED)` cambia a `default(SIMULATED_PENDING)`
para reflejar que el cobro simulado todavía no ocurrió.

> Requiere `npx prisma db push`.

**Módulo `reservations`**:

- `createReservation(input)` deja de exigir `payment`. Sólo crea
  Reservation con `status: PENDING`. No crea Payment. Envía mail
  "Recibimos tu solicitud — esperando aprobación del anfitrión".
- Nueva action `approveReservation(id)` (admin/host).
  `PENDING → APPROVED`. Envía mail "Tu solicitud fue aprobada — ya podés
  pagar" con un link al detalle.
- Nueva action `payReservation(id, paymentInput)` (guest).
  Sólo si `status === APPROVED`. Crea Payment con `SIMULATED_CAPTURED`,
  pasa Reservation a `CONFIRMED`. Envía mail confirmado.
- `cancelReservation(id)`: ahora también soporta cancelar desde APPROVED
  (caso "el pago simulado no se procesó"). Si había Payment, se marca
  `SIMULATED_REFUNDED` (sólo si ya estaba). Si no, se cancela sin payment.
- `rejectReservation(id)`: igual que antes (PENDING → REJECTED).
- Policies nuevas: `canPayReservation(user, reservation)`, `canApprove`,
  `canCancel`.

**Routes**:

- `POST /api/reservations` — sin `payment` en el body. Validar con un
  nuevo `reservationRequestSchema` (todo igual menos payment).
- `POST /api/reservations/[id]/pay` — nuevo. Body = `paymentInputSchema`.
  Sólo guest dueño.
- `POST /api/reservations/[id]` (existente) — ya soporta accion `confirm`/
  `reject`/`cancel`; agregar `approve`.

**UI**:

- `BookingForm` deja de pedir payment al crear. Pasa a un confirm "Solicitar
  reserva". Muestra siguiente paso ("Vas a recibir un email cuando el host
  apruebe").
- `dashboard/reservations/[id]` muestra:
  - Si `PENDING` → "Esperando al anfitrión".
  - Si `APPROVED` → botón "Pagar ahora" → modal/SimulatedPaymentForm.
  - Si `CONFIRMED` → estado actual.
- `admin/reservations` lista filtra por status, agrega botón "Aprobar"
  cuando es PENDING.

**Migración de datos existentes**:

- Reservas existentes en `PENDING` con Payment ya creado: se promueven a
  `CONFIRMED` (payment.status = SIMULATED_CAPTURED) o quedan como
  `APPROVED` esperando "pay". Decisión por confirmar con el usuario. Para
  seed limpia se recomienda `npm run db:seed`.

**Verificación**:

- `tsc --noEmit` + `npm run build`.
- Smoke manual:
  1. crear reservation (sin pagar) → PENDING.
  2. admin aprueba → APPROVED + mail "approved".
  3. user paga → CONFIRMED + mail "confirmed".
  4. (paralelo) crear otra → admin aprueba → admin cancela sin pago →
     CANCELLED.

---

## Después del major update (out of scope ahora)

Estos quedan en backlog y **no se tocan** en este pasaje:

- Split de archivos gigantes (ver `MODULES.md`).
- City guide con CRUD admin / contenido en DB.
- Wishlist compartible.
- Theme override desde admin.
- Notificaciones in-app además del email.
- ESLint custom rules para imports cross-module.
