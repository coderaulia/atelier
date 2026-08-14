# Atelier by Vanaila — Agent Instructions

## Project

Freemium browser-based toolkit with 8 professional tools: documents, social content, CV builder, PDF tools (convert/merge/compress), image converter, and OCR. Frontend on Cloudflare Pages, backend on Cloudflare Workers.

## Stack

- Frontend: Vite + React 19 + React Router v7 + Tailwind CSS 4
- Backend: Cloudflare Workers + Hono + Zod
- Database: Cloudflare D1 (SQLite)
- Email: Brevo (bilingual EN/ID templates)
- Payments: Midtrans (recurring subscriptions)
- AI: Groq API (`llama-3.3-70b-versatile`) for Pro-gated CV suggestions
- Client-side processing: pdf.js, Tesseract.js, Canvas API, JSZip, pdf-lib, mammoth, docx, @jsquash/webp, @jsquash/avif

## File Structure

src/
  App.tsx                         # Main routes (public, app, admin, manual)
  main.tsx                        # Entry point with BrowserRouter
  pages/
    Landing.tsx                   # Marketing landing page
    Manual.tsx                    # Public user manual / help center
    Login.tsx                     # Auth login
    Register.tsx                  # Auth register
    Pricing.tsx                   # Pricing + credit packs
    Account.tsx                   # User account + billing state
    Receipt.tsx                   # Payment receipt page
    ToolLanding.tsx               # Legacy per-tool landing wrapper
    toolPages.ts                  # Tool page registry
    app/
      Dashboard.tsx               # Authenticated dashboard
    legal/
      PrivacyPolicy.tsx
      TermsOfService.tsx
      RefundPolicy.tsx
    Admin/
      AdminLayout.tsx             # Admin sidebar + auth guard
      Overview.tsx                # Stats and KPIs
      Users.tsx                   # User list + search + actions
      UserDetail.tsx              # User detail + transactions + usage
      Transactions.tsx            # Payment records table
      Subscriptions.tsx           # Subscription management
      Refunds.tsx                 # Manual refund review
      BugReports.tsx              # Bug report queue
      BugReportDetail.tsx         # Bug report detail view
      Revenue.tsx                 # Revenue metrics
      AnalyticsDashboard.tsx      # Usage analytics
      SystemConfig.tsx            # Runtime config
      FeatureFlags.tsx            # Feature toggles
      HealthMonitor.tsx           # System health
      Announcements.tsx           # System announcements
      EmailTemplates.tsx          # Email template management
      AuditLogs.tsx               # Audit log viewer
      Errors.tsx                  # Error log viewer
  modules/
    documents/                    # Document generator (ported Atelier)
    social/                       # Social content generator
    cv/                           # CV/Resume builder
      types.ts                    # Data types, regional configs, templates
      CVTool.tsx                  # Main CV builder shell with sidebar/center/preview
      CVEditor.tsx                # Full-form editor with regional fields
      CVStepEditor.tsx            # Step-by-step section editor with progress
      CVWizard.tsx                # Guided start (role / experience / industry)
      CVImportModal.tsx           # Upload modal (PDF/DOCX parsing)
      cvParser.ts                 # Text, DOCX, PDF parsing logic
      CVATSPanel.tsx              # ATS score + linting + JD keywords
      AIButton.tsx                # Reusable Pro-gated AI rewrite button
      useCVAI.ts                  # AI hook wrapping generateCVAI API
      CVRegionalToggle.tsx        # International vs Indonesia mode
      CVContentLibrary.tsx        # Phrase library browser modal
      cvContentLibrary.ts         # ~60 curated phrases by role/seniority
      CoverLetterEditor.tsx       # Cover letter generator modal
      coverLetterTypes.ts         # Cover letter data types
      cvDocxExport.ts             # DOCX document export via docx library
      templates/                  # 6 PDF templates (Classic, Modern, Minimal, ATS, Executive, Creative)
      cv.css                      # All CV builder styles
    pdf-to-image/                 # PDF→Image converter
    pdf-merge/                    # PDF merger
    pdf-compress/                 # PDF compressor
    image-converter/              # Image format converter
    ocr/                          # OCR tool (Tesseract.js)
  components/
    ErrorBoundary.tsx
    ToolSkeleton.tsx
    UpgradeModal.tsx
    UsageBadge.tsx
  wrappers/
    AppShell.tsx                  # Authenticated /app shell
    MarketingWrapper.tsx          # Public tool page wrapper
  hooks/
    useAuth.ts
    useToolLimit.ts               # Usage gate hook
    usePlan.ts
  lib/
    api.ts                        # Typed fetch wrapper (auth, usage, admin)
    tools.tsx                     # Single source of truth for tool routes
    i18n.ts                       # EN/ID localization bootstrap
    midtrans.ts

api/
  src/
    index.ts                      # Hono app entry + scheduled cron handler
    types.ts                      # Bindings type
    auth/
      routes.ts                   # Register, login, /me, forgot-password, reset-password, verify-email, logout, delete account, change-password
    routes/
      usage.ts                    # GET/POST usage limits
      anon-usage.ts               # Anonymous usage tracking
      billing.ts                  # GET /status, POST /cancel, POST /webhook, transactions
      bug-reports.ts              # Bug report submission
      admin.ts                    # Admin API aggregator
      admin/
        analytics.ts              # Analytics endpoints
        audit.ts                  # Audit log endpoints
        bug-reports.ts            # Bug report management
        content.ts                # Content management (announcements, email templates)
        refunds.ts                # Refund management
        subscriptions.ts          # Subscription management
        system.ts                 # System config, features, health
      log-error.ts                # POST /api/log-error
      cv-ai.ts                    # POST /api/cv/ai (Pro-gated Groq integration)
    middleware/
      auth.ts                     # JWT + session auth (checks deleted_at)
      admin.ts                    # Admin role gate
    lib/
      config.ts                   # Configuration helpers
      jwt.ts
      password.ts
      tokens.ts                   # Token generation + SHA256 hashing
      email.ts                    # Brevo integration + bilingual templates (EN/ID)
      pricing.ts                  # Pricing configuration
      rate-limit.ts               # Rate limiting logic
      rate-limit-cache.ts         # Rate limit caching
      sanitize.ts                 # Input sanitization
    db/
      schema.sql                  # Full schema
      migrations/
        001_admin_dashboard.sql
        002_account_management.sql
        002_security_tables.sql
        003_anonymous_usage.sql
        003_auth_lifecycle.sql
        003_bug_reports.sql
        004_refunds_and_analytics.sql
        005_system_config.sql
        006_geo_analytics.sql
        007_content_management.sql
        007_credit_packs.sql
  wrangler.toml                   # Includes cron trigger for daily grace/cleanup
```

## Core Patterns

### Usage Gate Hook

Every tool MUST call `useToolLimit(toolId)` before export/generate actions.

```ts
const { canUse, used, limit, increment } = useToolLimit("documents");
// canUse === false → show UpgradeModal, block action
// on successful generate → call increment()
```

### Plan Checks

```ts
const { plan } = usePlan(); // 'free' | 'pro'
// Gate premium templates: if (plan !== 'pro') → show UpgradeModal
```

### API Calls

All backend calls go through `src/lib/api.ts`. Never use raw fetch in components.
Always handle 429 (limit exceeded) and 401 (auth expired) globally.

### Client-Side Processing

All file operations (pdf.js, Tesseract.js, Canvas) run in the browser.
Never upload user files to any server. Show this in UI as a trust signal.

### D1 Migrations

Write migrations to `api/src/db/migrations/NNN_name.sql`.
Apply locally first: `wrangler d1 execute vanaila-studio --local --file=...`
Then remote: `wrangler d1 execute vanaila-studio --file=...`

### Midtrans

Snap.js loaded via CDN in index.html. Never put server key in frontend.
Webhook route validates signature before any plan update.

### Admin Dashboard

- Routes: `/admin`, `/admin/users`, `/admin/users/:id`, `/admin/transactions`, `/admin/subscriptions`, `/admin/refunds`, `/admin/bug-reports`, `/admin/bug-reports/:id`, `/admin/revenue`, `/admin/analytics`, `/admin/system/config`, `/admin/system/features`, `/admin/system/health`, `/admin/content/announcements`, `/admin/content/email-templates`, `/admin/audit-logs`, `/admin/errors`
- Protected by `adminMiddleware` — verifies JWT + `role === 'admin'`
- Set admin: `wrangler d1 execute vanaila-studio --command "UPDATE users SET role='admin' WHERE email='your@email.com';"`
- Error logging: POST `/api/log-error` with `{ tool_id, error_type, user_agent?, plan? }` — no PII, no file data

## Commands

```bash
# Frontend
npm run dev
npm run build

# Backend
cd api && npm run dev
cd api && npm run db:apply

# D1
wrangler d1 execute vanaila-studio --local --file=api/src/db/migrations/001_admin_dashboard.sql
```

## Rules

- Commit after each phase milestone
- Update docs/project-status.md and docs/commit-log.md after each commit
- All Zod validation on backend routes — never trust client input
- Free daily limits: authenticated free 3/day (metered), Pro 100/day; anonymous 1/day via backend anon-usage; pdf-merge, pdf-compress, image-converter are unmetered
- Pro gates: premium templates, bulk export, 100/day usage cap
- Watermark applies to free/anonymous metered output where supported; no watermark on Pro
- IDR and USD both supported in Midtrans integration
- Mobile responsive required for all pages and tools
- Lazy-load Tesseract.js WASM — do not bundle at startup
- New user-facing docs belong in `src/pages/Manual.tsx` and route `/manual`
- Add new tools only through `src/lib/tools.tsx`; routes are generated from registry
- CV AI features require Pro plan — gated via `plan === 'pro'` check in cv-ai.ts
- CV content library lives in `cvContentLibrary.ts`; add phrases as arrays by role
- Cover letter uses same `generateCVAI` API with `action: 'cover_letter'`
- DOCX export uses `docx` library; import from `cvDocxExport.ts`
- Regional mode persisted via `useLocalStorage<CVRegionalMode>`
- CV import handles PDF text layer + OCR fallback + DOCX via mammoth

<!-- rtk-instructions v2 -->
# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:
```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)
```bash
rtk cargo build         # Cargo build output
rtk cargo check         # Cargo check output
rtk cargo clippy        # Clippy warnings grouped by file (80%)
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (60-99% savings)
```bash
rtk cargo test          # Cargo test failures only (90%)
rtk go test             # Go test failures only (90%)
rtk jest                # Jest failures only (99.5%)
rtk vitest              # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk pytest              # Python test failures only (90%)
rtk rake test           # Ruby test failures only (90%)
rtk rspec               # RSpec test failures only (60%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)
```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git show            # Compact show (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git fetch           # Compact fetch
rtk git stash           # Compact stash
rtk git worktree        # Compact worktree
```

Note: Git passthrough works for ALL subcommands, even those not explicitly listed.

### GitHub (26-87% savings)
```bash
rtk gh pr view <num>    # Compact PR view (87%)
rtk gh pr checks        # Compact PR checks (79%)
rtk gh run list         # Compact workflow runs (82%)
rtk gh issue list       # Compact issue list (80%)
rtk gh api              # Compact API responses (26%)
```

### JavaScript/TypeScript Tooling (70-90% savings)
```bash
rtk pnpm list           # Compact dependency tree (70%)
rtk pnpm outdated       # Compact outdated packages (80%)
rtk pnpm install        # Compact install output (90%)
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
rtk prisma              # Prisma without ASCII art (88%)
```

### Files & Search (60-75% savings)
```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%)
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)
```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk json <file>         # JSON structure without values
rtk deps                # Dependency overview
rtk env                 # Environment variables compact
rtk summary <cmd>       # Smart summary of command output
rtk diff                # Ultra-compact diffs
```

### Infrastructure (85% savings)
```bash
rtk docker ps           # Compact container list
rtk docker images       # Compact image list
rtk docker logs <c>     # Deduplicated logs
rtk kubectl get         # Compact resource list
rtk kubectl logs        # Deduplicated pod logs
```

### Network (65-70% savings)
```bash
rtk curl <url>          # Compact HTTP responses (70%)
rtk wget <url>          # Compact download output (65%)
```

### Meta Commands
```bash
rtk gain                # View token savings statistics
rtk gain --history      # View command history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk proxy <cmd>         # Run command without filtering (for debugging)
rtk init                # Add RTK instructions to CLAUDE.md
rtk init --global       # Add RTK to ~/.claude/CLAUDE.md
```

## Token Savings Overview

| Category | Commands | Typical Savings |
|----------|----------|-----------------|
| Tests | vitest, playwright, cargo test | 90-99% |
| Build | next, tsc, lint, prettier | 70-87% |
| Git | status, log, diff, add, commit | 59-80% |
| GitHub | gh pr, gh run, gh issue | 26-87% |
| Package Managers | pnpm, npm, npx | 70-90% |
| Files | ls, read, grep, find | 60-75% |
| Infrastructure | docker, kubectl | 85% |
| Network | curl, wget | 65-70% |

Overall average: **60-90% token reduction** on common development operations.
<!-- /rtk-instructions -->