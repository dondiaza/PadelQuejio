# Padel Quejio

Base tecnico-funcional para plataforma PRO de reservas de padel:
- Frontend + API en `Next.js + TypeScript + Tailwind`.
- Auth con `NextAuth` (email/password + Google OAuth).
- Datos con `PostgreSQL + Prisma`.
- Reglas criticas: disponibilidad, anti-solape, `pending_payment` expirado, suscripcion manual cash, auditoria.

## Puesta en marcha

1. Instala dependencias:
```bash
npm install
```

2. Configura entorno:
```bash
cp .env.example .env
```

3. Crea esquema en PostgreSQL:
```bash
npm run prisma:push
npm run db:constraints
npm run prisma:seed
```

4. Arranca app:
```bash
npm run dev
```

5. (Opcional recomendado) Arranca worker:
```bash
npm run worker
```

## Endpoints clave implementados

- Publica:
  - `GET /api/public/courts`
  - `GET /api/public/courts/:slug`
  - `GET /api/public/availability`
- Auth:
  - `POST /api/auth/register`
  - `GET|POST /api/auth/[...nextauth]`
- Usuario:
  - `GET/PATCH /api/me`
  - `GET /api/me/reservations`
  - `GET /api/me/reservations/:id`
  - `POST /api/reservations`
  - `POST /api/reservations/:id/cancel`
  - `POST /api/reservations/:id/invite`
  - `GET /api/me/payments`
  - `GET /api/me/invoices`
- Admin:
  - CRUD pistas en `/api/admin/courts`
  - horarios `/api/admin/opening-hours`
  - festivos/excepciones `/api/admin/special-dates`
  - bloqueos `/api/admin/blocks`
  - reservas `/api/admin/reservations` + mover/cancelar/manual
  - suscripcion manual cash:
    - `POST /api/admin/subscriptions/manual-activate`
    - `POST /api/admin/subscriptions/manual-renew`
  - stats `/api/admin/stats`
  - auditoria `/api/admin/audit`
- Jobs internos:
  - `POST /api/internal/jobs/expire-pending-payments`

## Notas tecnicas

- La disponibilidad usa: horarios base + excepciones + bloqueos + reservas ocupadas (`pending_payment`, `confirmed`).
- Expiracion de `pending_payment` implementada por job.
- Anti-solape reforzado:
  - validacion transaccional + advisory lock al crear reserva,
  - exclusion constraint PostgreSQL (`reservations_no_overlap`).
- Regla de precedencia de suscripciones:
  - Stripe activa > manual cash activa.

## Estado actual

Esta entrega deja una base funcional y operable para MVP/P0 con rutas publicas, area usuario, panel admin y APIs principales. Quedan iteraciones de producto para cubrir a fondo P1/P2 (campanas, matchmaking, pago dividido, etc.).
