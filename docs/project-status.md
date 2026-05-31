# Project Status

## Current state

Vanaila Studio is a Vite + React 19 frontend with a Cloudflare Workers API built on Hono. Frontend builds successfully, backend typechecks successfully, and launch-critical API flows are covered by `scripts/test-flows.mjs`.

## Frontend

Implemented routes:

- `/` landing page
- `/pricing`
- `/manual`
- `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`
- `/app/dashboard`
- `/app/*` authenticated tool routes generated from `src/lib/tools.tsx`
- Public tool routes generated from `src/lib/tools.tsx`
- `/app/account`
- `/privacy`, `/terms`, `/refund`
- `/receipt`
- `/admin` and admin subroutes for users, transactions, subscriptions, refunds, bug reports, revenue, analytics, system config, feature flags, health, announcements, email templates, audit logs, and errors

## Tools

Implemented tools:

- Document Generator
- Social Generator
- CV Builder
- PDF to Image
- PDF Merge
- PDF Compress
- Image Converter
- OCR

## CV Builder

Implemented CV/resume builder phases:

1. Guided wizard
2. Step-by-step editor
3. PDF/DOCX import with OCR fallback
4. ATS checker
5. Pro-gated AI suggestions via Groq/Llama 3.3
6. International/Indonesia regional mode
7. Content library
8. Cover letter generator
9. PDF and DOCX export

## Backend

Implemented API areas:

- Health: `GET /health`
- Auth: register, login, `/me`, forgot/reset password, verify email, logout, sessions, profile, change password, soft delete
- Usage: authenticated usage limits and 30-day usage history
- Anonymous usage: anonymous daily limits
- Billing: status, cancel, reactivate, webhook lifecycle, transactions, receipt
- Admin: stats, users, transactions, subscriptions, refunds, analytics, errors, system config, feature flags, health, announcements, email templates, audit logs, cron test trigger
- Bug reports
- Error logging
- CV AI: Pro-gated rewrite, summary, tone, tailoring, cover letter

## Database

D1 schema includes:

- `users`
- `sessions`
- `usage_log`
- `transactions`
- `error_log`
- password reset and email verification tables
- rate-limit and security tables
- admin dashboard/support tables
- credit pack tables are present for future use, but public purchase checkout is disabled for launch

## Deployment readiness

Build checks passing:

- Frontend typecheck: pass
- Frontend production build: pass
- Backend typecheck: pass

Deployment prerequisites still requiring operator action:

- Replace `api/wrangler.toml` D1 `database_id` with real Cloudflare D1 ID
- Configure production secrets via `wrangler secret put`
- Apply production D1 schema/migrations
- Seed production admin user
- Run manual browser/payment/device test plan on staging

## Known limitations for launch

- R2 cloud save is not part of the launch surface and has been removed from user-facing copy.
- One-time credit pack checkout is disabled for launch; credit tables remain for future implementation.
- Admin charts use lightweight CSS bars instead of Recharts.
