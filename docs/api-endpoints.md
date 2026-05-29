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
