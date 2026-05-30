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

Free authenticated limit: 5/day. Anonymous frontend localStorage limit: 2/day.

## Admin

All `/admin/*` routes require `Authorization: Bearer <token>` and `role = admin`.

- `GET /admin/stats`
- `GET /admin/users?page=1&limit=50&search=&plan=`
- `GET /admin/users/:id`
- `PATCH /admin/users/:id`
- `GET /admin/transactions?page=1&limit=50&sort=created_at|amount&direction=asc|desc`
- `GET /admin/errors`

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

## Billing/account

- `POST /billing/cancel`
- `POST /billing/reactivate`
- `GET /billing/transactions`
- `GET /billing/receipt/:id`

## User usage

- `GET /usage/me` — last 30 days usage for current user

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
