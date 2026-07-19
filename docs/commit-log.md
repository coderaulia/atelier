# Commit Log

## 2026-07-12 — Tool marketing + registry sync

Branch `feat/complete-tool-marketing-registry`. Synced public marketing, tool pages, and dashboard registry consumers after PDF Organize/Split/Watermark, Image Compress/Resize/Background, and CSV bulk generation shipped.

- `feat(seo): add marketing metadata for all tools` — added `toolPages.ts` metadata (features/FAQs) for pdf-organize, pdf-split, pdf-watermark, image-compress, image-resize, image-bg; documented CSV bulk generation on document-generator; derived `allStaticRoutes` from `toolPages` so prerender covers all 14 tools.
- `feat(landing): drive tool grid from registry` — landing tool grid, counts, and footer links now derive from `TOOLS`; Document Generator kept as hero card with CSV bulk copy.
- `feat(app): group tools and sync support options` — dashboard quick access groups tools by category with a recent-tool section and registry badges; manual `toolTips` cover all 14 tools with CSV bulk steps; bug report tool select is registry-driven.
- Verified: `npm run typecheck`, `npm run build`, `npm run prerender` (16 pages); public tool routes checked via preview server.
- Out of scope (recommend follow-up): stale tool counts/lists in `src/locales/**` legal/common copy require product/legal review.

## 2026-07-09 — Onboarding + pricing fixes

- Removed unimplemented "14-day Pro trial" copy from landing and register (no trial logic existed).
- Unified Pro price to canonical IDR 99,000 / $9 across checkout, pricing page, landing, dashboard upsell (checkout previously hardcoded IDR 140,000).
- Added IDR/USD currency toggle to pricing page.
- UpgradeModal now links to `/pricing` instead of `/register?plan=pro` (fired for already-authenticated users).
- Added email-verification banner and first-run welcome card to dashboard.
- Gated Google/GitHub OAuth buttons behind `VITE_ENABLE_OAUTH` (default off) so unconfigured providers don't render dead buttons.
- Pro-intent registration now redirects to checkout.

## 2026-05-29

- Added internal admin dashboard routes and UI.
- Added D1 role/status/pro expiration/last login fields.
- Added transactions and error_log tables.
- Added Workers admin middleware and admin API routes.
- Added tool error logging endpoint.
- Updated project docs to match current repo state.

## 2026-05-29 — Account management

- Added `/account` user-facing settings page.
- Added Profile, Subscription, Usage, Security tabs.
- Added auth endpoints for profile, password, sessions, soft-delete.
- Added billing endpoints for cancel/reactivate/transactions/receipt.
- Added `/receipt/:transaction_id` route.
- Added account management D1 migration.

## 2026-05-30 — CV Builder Overhaul

### Phase 1: Guided Start & Step Editor
- `4282f84` — Added guided CV wizard (role/experience/industry pre-structuring)
- `d39cf4d` — Fixed admin TypeScript build errors
- `a18bf3c` — Added section-by-section step editor with progress tracking

### Phase 2: Enhanced Import
- `726b2fa` — Added DOCX import (mammoth), multi-page PDF text extraction + OCR fallback, smart CV parser

### Phase 3: ATS Checker
- `b25e1eb` — Added ATS scoring (0-100), content linting (weak verbs, buzzwords), JD keyword matching

### Phase 4: AI Suggestions
- `cd2cdf7` — Added Pro-gated AI suggestions (Groq/Llama 3.3) for bullet rewrites and summary generation

### Phase 5: Regional Mode
- `613fb13` — Added Indonesia vs International toggle (photo, DOB, marital status, religion fields)

### Phase 6: Content Library
- `69955b5` — Added ~60 curated phrases by role/seniority/industry with copy-to-clipboard

### Phase 7: Cover Letter Generator
- `dd948a2` — Added Pro-gated cover letter generator with AI generation from CV data

### Phase 8: DOCX Export
- `9c2411c` — Added DOCX export via docx library (structured Word documents)

### Maintenance: Image tool fixes
- `eb11d92` — Fixed blob URL memory leak in 4 image tools via shared JobThumb component; guarded usage increment against failed runs; pinned dev port 5199

### Runtime Social Templates — Phase 1: Backend Foundation
- Migration `010_social_templates.sql` — data-driven template store (html/css/fields JSON, status, versioning, pro gate, audit columns)
- `lib/template-sanitize.ts` — Workers-safe HTML/CSS sanitizer + token extractor (write layer of dual-layer XSS defense; client DOMPurify is authoritative). Verified against 26 XSS payloads.
- `routes/admin/social-templates.ts` — admin CRUD + publish/disable + HTML import (token detection), public published-only feed
- Wired into admin aggregator and public routes
