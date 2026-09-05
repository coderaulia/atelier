# Commit Log

## 2026-09-05 — Account navigation and usage history

- Kept account content isolated from the app-shell layout so Security tab controls cannot affect sidebar navigation.
- Made sidebar navigation an explicit block/flex layout with stable overflow behavior.
- Recorded unmetered tool activity in usage history while preserving unlimited limits.
- Displayed usage-history API errors instead of incorrectly reporting an empty history.

## 2026-09-05 — Consolidate frontend CSS deployment

- Disabled Vite CSS code splitting so lazy routes do not preload separate hashed CSS files.
- This avoids blank-page failures when Hostinger briefly serves HTML and lazy bundles from different deployment generations.

## 2026-09-05 — Frontend deployment resilience

- Added a visible initial loading shell and top-level error boundary so failed lazy chunks no longer produce a blank page.
- Set the production Worker URL as the frontend API fallback for Hostinger builds without injected Vite environment variables.

## 2026-09-05 — Marketing navigation and subscription entitlement fixes

- Added shared responsive marketing footer/navigation across public, legal, manual, and authentication pages.
- Added About, Changelog, Roadmap, FAQ, and Contact routes and synchronized public links.
- Enforced Pro expiration during authenticated requests and aligned checkout customer fields with the users schema.
- Centralized the free daily usage limit in the pricing configuration.
- Verified frontend build and API typecheck.

## 2026-09-05 — Documentation stages, production domain, and Wrangler profile

- Updated README and operational docs to reflect the current 18-tool registry, tiered usage, implemented billing/admin/runtime-template stages, and launch boundaries.
- Reconciled production references to `https://studio.vanaila.com`.
- Configured Wrangler profile `atelier` for this repository and updated API package scripts to use it for Worker, D1, and migration commands.
- Updated the default CSRF allowed origin to the production domain.


## 2026-09-03 — Direct PDF Export for Document Generator

- `fix(documents): direct client-side PDF download` — replaced `window.print()` browser dialog with direct client-side PDF export using `pdf-lib` and `html-to-image`. The "Export PDF" button now renders the document at native 100% paper resolution (unscaling parent preview transforms during capture), automatically segments multi-page content into standard A4 or Letter PDF pages, and directly downloads `${filename}.pdf` to the user's downloads folder. Added a loading indicator (`Generating PDF…`) and direct PNG export button.

## 2026-09-03 — Social Media Textarea Wrapper Expansion & Multiline Scaling

- `fix(social): expand textarea wrapper width and calibrate multiline font scaling` — expanded the container wrapper for multiline textarea statements from artificial `maxWidth: 720` down to `maxWidth: 100%` (920px available width) across templates (`T_Stat`, `T_Booking`, `T_LinkBio`, `T_Tips`), keeping Hero stat scaling unchanged while calibrating textarea font scaling so multiline content retains a readable, prominent font size without prematurely shrinking into tiny footnotes.

## 2026-09-03 — Social Media Dynamic Font Scaling & Word Boundary Protection

- `fix(social): prevent mid-word breaking and constrain dynamic font sizes to frame width` — overhauled `getDynamicFontSize` in `src/modules/social/social-templates.tsx` to compute physical width bounds based on the longest single word and frame width. Replaced all occurrences of `wordBreak: "break-word"` with `overflowWrap: "break-word"` and `wordBreak: "normal"` across all 30 social templates, guaranteeing clean line breaks between words (e.g. preventing words like "Badminton" or "CONSULTING" from breaking mid-word across lines).

## 2026-09-03 — Document History Categories, Editor Maximize/Shrink, & Social Markdown

- `feat(documents): strictly per-category history tabs` — redesigned document history panel to organize documents under dedicated category tabs (Agreement, Invoice, Proposal, PRD, Retainer, Receipt, Onboarding, Scope Guard, Handover) with count badges and category financial aggregates.
- `feat(documents): editor maximize and preview shrink toggle` — added one-click toggle button on both editor header and preview toolbar allowing the editor to expand flexibly to full width while preview shrinks to 360px with automatic zoom re-fitting.
- `feat(social): markdown bold and linebreaks for textarea inputs` — added markdown bold (`**bold**`), italics (`*italic*`), and line break parsing for textarea inputs across standard, vertical/TikTok, and runtime social templates while keeping single-line inputs plain.

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

### Runtime Social Templates — Phase 2: Client Renderer
- `RuntimeTemplate.tsx` — authoritative client render boundary: resolves {{tokens}} + {{#each}} + {{brand.*}} (values HTML-escaped), DOMPurify sanitize (html+svg profile), CSS scoped to a unique wrapper id; renders into `.social-frame` so existing html-to-image export is inherited unchanged
- `toRegistryTemplate()` synthesizes a `.slides()` so runtime templates plug into AllSocialTemplates transparently
- api.ts: public feed + admin CRUD/import client functions
- DocumentTool: `useAllSocialTemplates()` merges built-ins with published runtime templates (built-ins always work offline)
- Verified: render (tokens+brand resolved, scoped style), registry merge (count 31→32), export parity with built-ins, render-time XSS neutralized (field payload escaped, no exec)

### Runtime Social Templates — Phase 3: Admin Editor
- `Admin/SocialTemplates.tsx` — list page (name/kind/status/pro/version/updated) with publish-toggle, edit, delete; empty state
- `Admin/SocialTemplateEditor.tsx` — split editor: HTML/CSS/Fields JSON tabs + meta (id/name/kind/size/pro), live preview via RuntimeTemplate with sample data + default brand, "Detect fields" (HTML import), sanitizer warnings panel, Save/Publish/Disable
- AdminLayout nav + App routes (`/admin/content/social-templates`, `/new`, `/:id`)
- Verified full UI round-trip: create in editor → live preview → publish → admin list → appears in social generator

### Runtime Social Templates — Phase 4/5: HTML Import + Starters
- Editor: "Upload HTML" file input — extracts <style> into CSS, keeps <body> contents, then sanitizes + auto-detects {{tokens}} into fields
- 3 clone-able starter presets (Kicker+Headline, Big Stat, Carousel-ready List with {{#each}}) via a "Start from…" picker
- Verified: uploaded HTML with <script>+external-img stripped (warnings surfaced), token detection, starter loading, and {{#each items}} rendering 3 rows with {{@index}}/{{this}}

### Runtime Social Templates — Phase 6: Gap fixes
- Multi-slide carousels are now authorable: editor gains a slide strip (Slide 1..N, add/remove) that edits each slide's HTML independently and previews the selected one; saves `slides[]`
- `is_pro` is now enforced: Pro-gated templates show a PRO badge, raise the upgrade modal on click instead of opening the editor, and are blocked at all four export paths as a backstop
- `toRegistryTemplate` now derives picker `category` from the canvas aspect, so 1080x1920 runtime templates group under "TikTok / Threads" instead of "Instagram 1:1"

## 2026-09-03 — Social template sizing & document history

- `fix(social): revert template sizing to bold proportions & calibrate dynamic font scaling`
  - Reverted aggressive shrinkage in `src/modules/social/social-templates.tsx` (templates 1 to 34) back to bold, spacious editorial dimensions.
  - Calibrated `getDynamicFontSize` curve (`Math.pow(scale, 0.85)`): ≤5 characters stay at 100% bold size; 10 and 15+ characters scale smoothly without line clipping.
  - Retained all custom field bindings (`titleItalic`, `projectText`, `prefix`, etc.) and `wordBreak: "break-word"`.
  - Fixed `captureImage` in `src/modules/documents/utils.tsx` to target `.social-frame` directly, avoiding scale/transform distortion on export.
- `feat(documents): add category filter tabs and count badges to document history`
  - Added category filter pills with per-type count badges to DocumentHistory modal.
  - Added `countsByCategory` and `refreshCounts` to `useDocumentStore`.
- `feat(social): add markdown formatting toolbar and inline parser`
  - Added `SocialMarkdownTextarea` with bold/italic toolbar buttons and shortcuts to `SocialEditor.tsx`.
  - Added `renderSocialMd.tsx` inline markdown formatting parser.

