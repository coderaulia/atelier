# Vanaila Studio — Agent Instructions

## Project

Browser-based freemium generator suite. Frontend on Cloudflare Pages, backend on Cloudflare Workers.

## Stack

- Frontend: Vite + React 19 + React Router v7 + Tailwind CSS
- Backend: Cloudflare Workers + Hono + Zod
- Database: Cloudflare D1 (SQLite)
- Storage: Cloudflare R2 (Pro cloud save)
- Email: Resend
- Payments: Midtrans
- Client-side processing: pdf.js, Tesseract.js, Canvas API, JSZip

## File Structure

src/
modules/
documents/ # Document generator (ported Atelier)
social/ # Social content generator
cv/ # CV/Resume builder
pdf-to-image/ # PDF→Image converter
image-converter/
ocr/
pages/
Landing.tsx
Dashboard.tsx
Auth/
components/
UpgradeModal.tsx
UsageBadge.tsx
ToolLayout.tsx
hooks/
useAuth.ts
useToolLimit.ts # Usage gate hook
usePlan.ts
lib/
api.ts # Typed fetch wrapper
midtrans.ts
workers/
src/
index.ts # Hono app entry
routes/
auth.ts
billing.ts
usage.ts
storage.ts
middleware/
auth.ts
rateLimit.ts
db/
schema.sql
migrations/
docs/
project-status.md
tech-stack.md
api-endpoints.md
commit-log.md

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

Write migrations to `workers/migrations/NNN_name.sql`.
Apply locally first: `wrangler d1 execute DB --local --file=...`
Then remote: `wrangler d1 execute DB --file=...`

### Midtrans

Snap.js loaded via CDN in index.html. Never put server key in frontend.
Webhook route validates signature before any plan update.

## Commands

```bash
# Frontend
npm run dev
npm run build

# Backend
wrangler dev
wrangler deploy

# D1
wrangler d1 execute DB --local --file=workers/migrations/001_init.sql
```

## Rules

- Commit after each phase milestone
- Update docs/project-status.md and docs/commit-log.md after each commit
- All Zod validation on backend routes — never trust client input
- Free daily limits: 5/day authenticated, 3/day anonymous (localStorage)
- Pro gates: premium templates, bulk export, cloud save, unlimited daily use
- No watermarks on any plan — ever
- IDR and USD both supported in Midtrans integration
- Mobile responsive required for all pages and tools
- Lazy-load Tesseract.js WASM — do not bundle at startup

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