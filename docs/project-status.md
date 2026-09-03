# Project Status

## Current state

Vanaila Studio is a Vite + React 19 frontend with a Cloudflare Workers API built on Hono. Frontend and backend are launch-oriented with dual public/app routing, admin operations, Midtrans billing, Groq-powered Pro CV AI, anonymous/authenticated usage controls, and documented API/manual test coverage.

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

- Document Generator, including direct client-side PDF and PNG export, per-category history tabs, editor maximize/shrink toggle, CSV bulk generation, and ZIP export
- Social Generator, including word-boundary dynamic font scaling (single-word overflow prevention), markdown bold and linebreaks on textarea inputs, editorial/vertical carousels, and quick formatting toolbar
- CV Builder
- PDF to Image
- PDF Merge
- PDF Compress
- PDF Organize
- PDF Split
- PDF Watermark
- Image Converter
- Image Compress
- Image Resize & Crop
- Image Background & Metadata
- OCR

Tool discovery and support surfaces now stay aligned with `src/lib/tools.tsx`: landing cards and footer links use registry data, dashboard quick access groups tools by category, manual guides cover all tools, and bug reports use registry-backed tool options. Public marketing metadata and static prerender routes cover all 14 tools.

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
- Public content: announcements and email-template preview endpoints
- Bug reports
- Error logging
- CV AI: Pro-gated rewrite, summary, tone, tailoring, cover letter

## Database

D1 schema includes:

- `users`
- `sessions`
- `usage_log`
- `anonymous_usage`
- `transactions`
- `error_log`
- password reset and email verification tables
- rate-limit, failed-login, and security tables
- admin dashboard/support tables
- announcements, email templates, audit logs, and content-management tables
- credit pack and credit usage tables are present for future public checkout work

## Deployment readiness

Build checks passing:

- Frontend typecheck: pass (`npm run typecheck`, 2026-07-18)
- Frontend production build: pass (`npm run build`, 2026-07-18)
- Frontend prerender: pass (`npm run prerender`, 16 pages, 2026-07-12)
- Backend typecheck: pass

Deployment prerequisites still requiring operator action:

- Replace `api/wrangler.toml` D1 `database_id` with real Cloudflare D1 ID
- Configure production secrets via `wrangler secret put`
- Apply production D1 schema/migrations
- Seed production admin user
- Run manual browser/payment/device test plan on staging

## In progress

- **Social template sizing & dynamic scaling** — restored bold editorial proportions across templates 1–34 in `src/modules/social/social-templates.tsx`, calibrated dynamic scaling curves for 5, 10, and 15+ characters, and improved image capture targeting in `src/modules/documents/utils.tsx`.
- **Social markdown formatting** — inline markdown parsing and formatting toolbar in `SocialEditor.tsx` and `renderSocialMd.tsx`.
- **Document history enhancements** — category filter tabs, per-type count badges, and category-aware document filtering in `DocumentHistory.tsx` and `useDocumentStore.ts`.
- **Runtime social templates** (feat/runtime-social-templates) — admin-authored, data-driven templates for the social generator, addable without a redeploy. All core phases complete:
  - Phase 1 — `social_templates` table (migration `010`), Workers-safe sanitizer (26-case XSS suite), admin CRUD + import API, public published-only feed.
  - Phase 2 — `RuntimeTemplate.tsx` render boundary (token/brand/`{{#each}}` resolution, HTML-escaped values, DOMPurify, scoped CSS), merged into the social registry; export parity with built-ins.
  - Phase 3 — admin list + split editor with live preview (`/admin/content/social-templates`).
  - Phase 4/5 — HTML file upload (extracts `<style>`, sanitizes, detects tokens), 3 clone-able starter presets incl. a `{{#each}}` carousel list, Pro gating via `is_pro`.
  - See `docs/plan-runtime-social-templates.md`. Remaining: optional CodeMirror editor upgrade; remote D1 migration on deploy.

## Known limitations for launch

- R2 cloud save is not part of the launch surface and has been removed from user-facing copy.
- One-time credit pack checkout is disabled for launch; credit tables remain for future implementation.
- Admin charts use lightweight CSS bars instead of Recharts.
