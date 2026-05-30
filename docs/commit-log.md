# Commit Log

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
