# API Endpoints

Base local URL: `http://localhost:8787`. Routes are mounted by `api/src/index.ts`; authenticated routes require the bearer token returned by legacy auth or a valid Better Auth session where noted.

## Platform middleware

All API requests pass through CORS validation, CSRF protection for mutating requests, global IP rate limiting, a 1 MiB body limit, and security headers. Validation is performed with Zod in route handlers.

## Health

- `GET /health` — returns `{ ok, ts }`.

## Authentication (`/auth` and `/api/auth/*`)

Legacy application routes:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/verify-email?token=...`
- `POST /auth/verify-email`
- `POST /auth/logout`
- `PATCH /auth/profile`
- `POST /auth/change-password`
- `GET /auth/sessions`
- `DELETE /auth/sessions/all`
- `DELETE /auth/account`

Better Auth handlers are exposed at `GET|POST /api/auth/*`. The application middleware accepts Better Auth sessions first and legacy JWT sessions second.

## Usage

- `GET /usage/:toolId`
- `POST /usage/:toolId` — accepts `Idempotency-Key`
- `GET /usage/me` — last 30 days
- `GET /anon-usage/:toolId`
- `POST /anon-usage/:toolId`

Current policy:

- Anonymous users: 1/day per tool.
- Authenticated free users: 3/day for metered tools, watermark where supported.
- Pro tiers: Starter 30/day, Pro 100/day, Business 300/day.
- Unmetered tools are defined by `FREE_TOOLS` in `api/src/routes/usage.ts`.
- CV and Social credit packs are consumed before daily limits.

## Billing (`/billing`)

- `GET /billing/pricing` — public canonical pricing.
- `GET /billing/status`
- `POST /billing/checkout` — subscription tier `starter|pro|business`.
- `POST /billing/checkout-pack` — pack `cv-10|social-50`.
- `POST /billing/cancel`
- `POST /billing/reactivate`
- `GET|POST /billing/transactions`
- `GET /billing/receipt/:id`
- `POST /billing/webhook` — Midtrans signature, amount, currency, ownership, and idempotency checks.

## Documents (`/documents`)

Authenticated CRUD for stored document metadata/data:

- `GET /documents`
- `POST /documents`
- `GET /documents/:id`
- `PUT /documents/:id`
- `DELETE /documents/:id`
- `POST /documents/:id/duplicate`

This API is separate from local browser file processing and does not upload source PDF/image files.

## Bug reports and errors

- `POST /bug-reports`
- `GET /bug-reports`
- `POST /api/log-error`

Error payloads must not contain PII, filenames, file content, or source documents.

## Public content

- `GET /content/announcements`
- `GET /social-templates` — published runtime social templates only.

## CV AI (`/api/cv/ai`)

`POST /api/cv/ai` requires authentication and `plan === 'pro'`.

```json
{
  "action": "rewrite_bullet | generate_summary | improve_tone | tailor_cv | cover_letter",
  "text": "optional text",
  "context": "optional CV or job-description context"
}
```

The Worker calls Groq with Llama 3.3 70B. Free users receive `403`.

## Admin (`/admin`)

All admin routes require authentication and `role = admin`.

- `GET /admin/stats`
- `GET /admin/users`, `GET /admin/users/:id`, `PATCH /admin/users/:id`
- `GET /admin/transactions`
- `GET /admin/errors`
- `GET /admin/analytics/*`
- `GET /admin/audit`, `GET /admin/audit/actions`
- `GET /admin/bug-reports`, `GET /admin/bug-reports/:id`, `PATCH /admin/bug-reports/:id`, `POST /admin/bug-reports/:id/comments`
- `GET /admin/refunds`, `POST /admin/refunds`, `PATCH /admin/refunds/:id`
- `GET /admin/subscriptions`, `GET /admin/subscriptions/summary`, `PATCH /admin/subscriptions/:userId`
- `GET /admin/system/config`, `PATCH /admin/system/config/:key`
- `GET /admin/system/features`, `PATCH /admin/system/features/:key`
- `GET /admin/system/health`
- `GET|POST|PATCH|DELETE /admin/content/announcements...`
- `GET /admin/content/email-templates`, `PUT /admin/content/email-templates/:key`
- `GET|POST|PUT|DELETE /admin/social-templates...`
- `POST /admin/social-templates/:id/publish`
- `POST /admin/social-templates/:id/disable`
- `POST /admin/social-templates/import`
- `GET /admin/notifications`, notification read endpoints
- `POST /admin/cron/run` — test-only scheduled maintenance trigger.
