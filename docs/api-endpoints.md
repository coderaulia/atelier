# API Endpoints

Base local URL: `http://localhost:8787`

## Health

- `GET /health` → `{ ok, ts }`

## Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

Auth responses include user role/status when present.

## Usage

- `GET /usage/:toolId`
- `POST /usage/:toolId`
- `GET /usage/me` — last 30 days usage for current user

Free authenticated limit: 3/day for metered tools. Pro: 100/day. Some tools (pdf-merge, pdf-compress, image-converter) are unmetered.

## Anonymous Usage

- `GET /anon-usage/:toolId`
- `POST /anon-usage/:toolId`

Anonymous IP-based limit: 1/day per tool.

## Admin

All `/admin/*` routes require `Authorization: Bearer <token>` and `role = admin`.

### Core Admin Routes
- `GET /admin/stats`
- `GET /admin/users?page=1&limit=50&search=&plan=`
- `GET /admin/users/:id`
- `PATCH /admin/users/:id`
- `GET /admin/transactions?page=1&limit=50&sort=created_at|amount&direction=asc|desc`
- `GET /admin/errors`

### Admin Subroutes
- `GET /admin/analytics/*` — usage analytics, geo data, tool metrics
- `GET /admin/audit-logs` — audit log viewer
- `GET /admin/bug-reports`, `GET /admin/bug-reports/:id`, `PATCH /admin/bug-reports/:id` — bug report management
- `GET /admin/content/announcements`, `POST /admin/content/announcements`, etc. — content management
- `GET /admin/refunds`, `POST /admin/refunds/:id/approve`, `POST /admin/refunds/:id/reject` — refund management
- `GET /admin/subscriptions`, `POST /admin/subscriptions/:id/cancel`, etc. — subscription management
- `GET /admin/system/config`, `GET /admin/system/features`, `GET /admin/system/health` — system management
- `POST /admin/cron/run` — trigger scheduled cleanup (for testing)

## Error logging

- `POST /api/log-error`

Payload:

```json
{
  "tool_id": "ocr",
  "error_type": "worker_failed",
  "user_agent": "optional",
  "plan": "free"
}
```

Do not send PII, file names, file content, or source documents.

## Account management

- `PATCH /auth/profile` — update `{ name }`
- `POST /auth/change-password` — update password after verifying current password
- `GET /auth/sessions` — list active sessions
- `DELETE /auth/sessions/all` — sign out all other devices
- `DELETE /auth/account` — soft delete account with `deleted_at`

## Billing

- `GET /billing/status`
- `POST /billing/cancel`
- `POST /billing/reactivate`
- `POST /billing/webhook` — Midtrans webhook (signature validated)
- `GET /billing/transactions`
- `GET /billing/receipt/:id`

## Bug Reports

- `POST /bug-reports` — submit bug report
- `GET /bug-reports` — list user's bug reports (authenticated)

## Content (Public)

- `GET /content/announcements` — public announcements
- `GET /content/email-templates/:type/preview` — preview email templates

## CV AI (Pro-gated)

- `POST /api/cv/ai`

Requires `Authorization: Bearer <token>` and `plan === 'pro'`.

Payload:

```json
{
  "action": "rewrite_bullet" | "generate_summary" | "improve_tone" | "tailor_cv" | "cover_letter",
  "text": "optional text to rewrite",
  "context": "optional context (CV data, job description, etc.)"
}
```

Response:

```json
{
  "result": "AI-generated text"
}
```

Backend uses Groq API with Llama 3.3 70B model. Free users receive 403 error.
