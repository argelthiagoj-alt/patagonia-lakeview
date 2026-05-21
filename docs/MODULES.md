# MODULES — Inventario

Estado vivo del directorio `src/modules/`. Cada feature mapea a un módulo
vertical con `{schemas, repo, service, policies}` cuando aplica.

## Existentes (post-Fase 5)

| Módulo         | Archivos                                                | Estado | Notas                                                              |
|----------------|---------------------------------------------------------|--------|--------------------------------------------------------------------|
| `auth`         | schemas, repo, session, service                         | Estable | Cookies + bcrypt + Google OAuth + email verification.             |
| `users`        | schemas, repo, service                                  | Estable | Dueño de la tabla User. Re-export parcial desde auth/repo.        |
| `cabins`       | schemas, beds, filters, repo, service                   | Estable | repo expone CabinView (mock + DB merged).                         |
| `reservations` | schemas, policies, repo, service                        | Estable | Tagged-union para todas las transiciones. Reescribir en Fase 4.   |
| `payments`     | schemas, helpers, labels, service                       | Estable | buildSimulatedPaymentData; sin DB propia (Payment vive con Reservation). |
| `reviews`      | schemas, policies, repo, service                        | Estable | Incluye recomputeCabinAggregate(tx \| prisma).                    |
| `chat`         | schemas, repo, service                                  | Estable | Per-reservation conversation.                                     |
| `email`        | client, senders, templates/*                             | Estable | Resend + plantillas inline-HTML.                                  |
| `jobs`         | schemas                                                 | Mínimo | Sólo Zod para "Trabajá con nosotros".                             |

## Planificados (Major update)

| Módulo            | Mín. archivos                          | Necesita DB        | Notas                                                                 |
|-------------------|----------------------------------------|--------------------|-----------------------------------------------------------------------|
| `favorites`       | schemas, repo, service                 | Sí (Favorite)      | Many-to-many User↔Cabin. Toggle desde CabinCard. Página /dashboard/favoritos. |
| `seasonal-theme`  | config, helpers                        | No                 | Helper puro: currentSeason(date) → 'summer' \| 'autumn' \| 'winter' \| 'spring'. CSS vars en globals.css. |
| `demo-tools`      | seed, service                          | No                 | Aloja demo-login + helpers para "Resetear demo" (futuro). Sólo activo si NEXT_PUBLIC_DEMO_MODE. |
| `city-guide`      | schemas, repo, service, data           | Probablemente no   | Contenido estático (cities[] + experiences[]) en `data.ts`. Si después se quiere CRUD, se promueve a DB. |
| `admin`           | (a evaluar)                            | No                 | Probable: sólo `policies.ts` con guards comunes. Las rutas /admin/* viven en `app/admin/`. Posible aplazamiento. |

## Lo que **no** es módulo (queda en `src/lib/`)

| Archivo            | Razón                                       |
|--------------------|---------------------------------------------|
| `booking.ts`       | Pricing puro (computeBookingPrice, hasOverlap) — sin dominio único. |
| `codes.ts`         | OTP genérico (compartido auth/users).       |
| `image-upload.ts`  | SDK Vercel Blob.                            |
| `images.ts`        | Helpers de URL/CDN.                         |
| `oauth.ts`         | Google OAuth exchange.                      |
| `prisma.ts`        | Singleton.                                  |
| `rate-limit.ts`    | In-memory rate-limit.                       |
| `utils.ts`         | cn, formatCurrency.                         |

Regla: si un helper empieza a depender de un módulo (booking → reservations
policies, por ejemplo), se mueve dentro del módulo.

## Archivos grandes que merecen futura subdivisión

Detectados durante la auditoría. **No bloquean** el major update; quedan
como tickets de refactor opcional.

| Archivo                                        | LOC  | Posible split                                                    |
|------------------------------------------------|------|------------------------------------------------------------------|
| `components/booking/SimulatedPaymentForm.tsx`  | 582  | extraer `BillingFields` + `CardFields` + `MercadoPagoFields`.    |
| `components/admin/CabinForm.tsx`               | 557  | ya split parcialmente; extraer secciones beds + amenities + images. |
| `components/cabins/CabinFilters.tsx`           | 472  | separar FilterChips + RangeSlider + AppliedFilters bar.          |
| `components/booking/BookingForm.tsx`           | 450  | extraer DateRangePicker + PriceBreakdown.                        |
| `app/about/page.tsx`                           | 398  | secciones a `components/about/{section1,section2,...}.tsx`.     |

Política para esta major update: **no se tocan** salvo que el cambio
requerido afecte la lógica interna. Si toca lógica, se hace el split en la
misma fase para no degradar el archivo.

## Dependencias entre módulos (resumen)

```
reservations.service ─→ payments.service
reservations.service ─→ email.senders
reservations.service ─→ cabins.repo (indirect via repo)
reviews.service ─→ cabins (recomputeCabinAggregate del cabin row)
auth.service ─→ email.senders
auth.repo (re-exporta de) users.repo
users.service ─→ users.repo
chat.service ─→ (sólo chat repo + reservation row de cabin/user)
favorites (futuro) ─→ sólo su repo + cabins.repo para hidratar lista
city-guide (futuro) ─→ sin deps de módulo (contenido)
seasonal-theme (futuro) ─→ sin deps
demo-tools (futuro) ─→ auth.session, users.repo
```

Ciclos prohibidos. Si una nueva feature precisa cerrar un ciclo, levantar
en `shared/` un helper común.
