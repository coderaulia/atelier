# Project Status

## Current state

Vanaila Studio is a Vite + React 19 frontend with a Cloudflare Workers API built on Hono.
The API is running locally on `http://localhost:8787` and `/health` returns OK.

## Frontend

Implemented routes:

- `/` landing page
- `/login`
- `/register`
- `/app` document generator
- `/cv`
- `/pdf-to-image`
- `/image-converter`
- `/ocr`
- `/admin` internal admin overview
- `/admin/users`
- `/admin/users/:id`
- `/admin/transactions`
- `/admin/errors`

## CV Builder

Fully-featured CV/resume builder with 8 major phases implemented:

1. **Guided wizard** — Pre-structures CV based on role/experience/industry
2. **Step-by-step editor** — Section-by-section flow with progress tracking
3. **Smart import** — Parses PDF (text + OCR) and DOCX files into structured fields
4. **ATS checker** — Scores CV 0-100, detects weak verbs, checks formatting, matches JD keywords
5. **AI suggestions** — Pro-gated Groq/Llama 3.3 rewrites for bullets and summary generation
6. **Regional mode** — Toggle International (ATS-safe) vs Indonesia (photo/DOB/marital/religion)
7. **Content library** — ~60 curated phrases by role/seniority/industry with copy-to-clipboard
8. **Cover letter generator** — Pro-gated AI generation from CV data with editable preview
9. **DOCX export** — Structured Word document export via docx library

Export formats: PDF (6 templates) + DOCX

## Backend

Implemented API routes:

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /usage/:toolId`
- `POST /usage/:toolId`
- `GET /admin/stats`
- `GET /admin/users`
- `GET /admin/users/:id`
- `PATCH /admin/users/:id`
- `GET /admin/transactions`
- `GET /admin/errors`
- `POST /api/log-error`
- `POST /api/cv/ai` (Pro-gated Groq integration for CV rewrites and cover letters)

## Database

D1 schema includes:

- `users` with `plan`, `role`, `status`, `pro_expires_at`, `last_login`
- `sessions`
- `usage_log` with `limit_hits`
- `transactions`
- `error_log`

## Admin access

Admin routes require JWT session and `users.role = 'admin'`.

Set local admin account:

```bash
wrangler d1 execute vanaila-studio --local --command "UPDATE users SET role='admin' WHERE email='your@email.com';"
```

## Known gaps

- Midtrans billing endpoints are not implemented yet.
- R2 cloud save is not implemented yet.
- Recharts is not installed; admin charts currently use lightweight CSS bars.

## Account management

User-facing `/account` page is implemented with tabs:

- Profile: email, member since, current plan, editable display name.
- Subscription: free upgrade CTA, pro cancellation/reactivation, transaction history.
- Usage: current user's usage_log last 30 days.
- Security: change password, sessions, sign out other devices, soft-delete account.

Receipt route implemented at `/receipt/:transaction_id` and verifies ownership via API.
