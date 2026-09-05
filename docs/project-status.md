# Project Status & Development Stages

**Product:** Atelier by Vanaila
**Production:** `https://studio.vanaila.com`
**Repository state:** Feature-complete launch candidate; production configuration and acceptance testing remain.

## Stage 1 — Core product ✅

- Vite + React 19 frontend with public marketing routes and authenticated `/app/*` routes.
- Cloudflare Workers + Hono API.
- Cloudflare D1 schema and migrations through `014_documents.sql`.
- Client-side document, PDF, image, OCR, CV, and social processing.
- Shared tool registry at `src/lib/tools.tsx` generates public and app routes.
- Responsive app shell, marketing wrapper, dashboard, account, legal pages, and manual.

## Stage 2 — Tools ✅

The registry currently defines **19 tools**:

- Document Generator
- Social Generator
- CV Builder
- PDF to Image, Merge, Compress, Organize, Split, Watermark, Markdown, Word, PowerPoint, and Edit PDF
- Image Converter, Compress, Resize & Crop, and Background & Metadata
- OCR

The registry is authoritative. Marketing metadata, dashboard cards, manual tool guidance, bug-report tool choices, and prerender routes should be checked against it whenever a tool changes.

## Stage 3 — CV Builder ✅

Implemented:

1. Guided wizard and step/full editors
2. International/Indonesia regional mode
3. PDF/DOCX import with PDF text extraction and OCR fallback
4. ATS scoring, linting, and job-description keywords
5. Nine templates, including Pro-gated templates
6. Pro-gated Groq AI rewrite, summary, tailoring, tone, and cover-letter actions
7. Content library
8. Cover-letter editor
9. Client-side PDF and DOCX export
10. LocalStorage persistence and preview blob cleanup

## Stage 4 — Accounts, usage, and billing ✅ (code complete)

- Registration, login, Better Auth session fallback, legacy JWT sessions, logout, password reset, email verification, profile, password change, session management, and soft deletion.
- Anonymous usage: one use/day per tool, tracked by the API.
- Authenticated free usage: three uses/day for metered tools.
- Pro tiers: Starter 30/day, Pro 100/day, Business 300/day.
- Unmetered tools are defined in `api/src/routes/usage.ts`; currently PDF Merge, PDF Compress, PDF Organize, Image Converter, Image Compress, Image Resize, PDF Split, PDF Watermark, PDF Markdown, PDF Word, PDF PowerPoint, PDF Edit, and Image Background & Metadata.
- Credit-pack checkout and debit logic exist for CV and Social packs.
- Midtrans checkout, signed webhook processing, subscription cancellation/reactivation, grace periods, receipts, and transactions are implemented.
- Account Usage history covers the last 30 days of successful metered and unmetered activity; usage remains keyed by UTC date and tool.
- Account Security uses explicit password autocomplete semantics, while the sidebar tool search is excluded from password-manager autofill.

The backend is the source of truth for limits and entitlements. Product copy must not describe metered tools as unlimited or credit packs as disabled.

## Stage 5 — Admin and operations ✅ (code complete)

Admin routes and UI cover users, transactions, subscriptions, refunds, bug reports, analytics, geo analytics, errors, audit logs, system config, feature flags, health, announcements, email templates, and runtime social templates.

Runtime social templates are implemented end-to-end:

- D1 storage and migrations
- Worker-safe write sanitization and client render sanitization
- Published-only public feed
- Admin CRUD, import, publish/disable, versioning, and live preview
- Runtime renderer merged with built-in templates
- Multi-slide support, starter presets, and Pro gating

See `docs/plan-runtime-social-templates.md` for the completed phases and remaining optional work.

## Stage 6 — Verification and launch ⏳

Remaining work is operational rather than a planned feature build:

- Confirm the production D1 binding in `api/wrangler.toml` matches the deployed database.
- Wrangler profile `atelier` is configured and bound to this repository; authentication is now active.
- Configure production Worker secrets and non-secret variables; see `docs/secrets-setup.md`.
- Apply the canonical schema to production and verify migrations are compatible.
- Create/verify the production admin account.
- Run API flow tests, browser payment/email tests, mobile processing tests, and SEO checks.
- Configure external uptime/error monitoring if required by the operator.

Frontend build and backend typecheck pass after the latest account and usage-history changes. Production browser verification remains required after Hostinger's GitHub auto-deployment.

## Intentional launch boundaries

- User-facing cloud/R2 document save is not part of the launch surface.
- Files processed by tools remain in the browser; they are not uploaded for conversion/OCR/export.
- CodeMirror, sandboxed iframe rendering, and advanced runtime-template authoring are optional follow-ups, not launch blockers.

## Source-of-truth files

- Routes and tool inventory: `src/App.tsx`, `src/lib/tools.tsx`
- Frontend API contract: `src/lib/api.ts`
- API composition: `api/src/index.ts`
- Auth: `api/src/auth/routes.ts`, `api/src/middleware/auth.ts`
- Usage: `src/hooks/useToolLimit.ts`, `api/src/routes/usage.ts`, `api/src/routes/anon-usage.ts`
- Pricing: `api/src/lib/pricing.ts`, `api/src/routes/billing.ts`
- Database: `api/src/db/schema.sql` and `api/src/db/migrations/`
- Validation: `docs/manual-test-plan.md`, `docs/test-coverage.md`, `docs/launch-readiness.md`
