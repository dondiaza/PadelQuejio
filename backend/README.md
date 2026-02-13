# Padel Quejio Backend (separado del frontend)

Este servicio corre como API independiente para separar backend y frontend.

## Ejecutar en local

```bash
npm run api:dev
```

Variables necesarias:

- `DATABASE_URL`
- `BACKEND_PORT` (opcional, por defecto `4000`)
- `BACKEND_HOST` (opcional, por defecto `0.0.0.0`)
- `ADMIN_BOOTSTRAP_SECRET` (obligatoria para endpoint de bootstrap admin)

## Endpoints

- `GET /health`
- `GET /public/courts`
- `GET /public/plans`
- `POST /admin/bootstrap` (requiere header `x-admin-bootstrap-secret`)

## Integración con frontend

En el frontend define:

- `BACKEND_API_URL=https://tu-api.example.com`

Si `BACKEND_API_URL` existe, las páginas públicas de `pistas` y `suscripciones` consultan primero este backend.
