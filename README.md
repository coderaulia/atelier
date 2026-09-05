# Atelier by Vanaila

A freemium browser-based toolkit for documents, CVs, PDF/image conversions, OCR, and social media content. Built for freelancers, small teams, and job seekers.

**Production:** [studio.vanaila.com](https://studio.vanaila.com)

Built by **[Vanaila Digital](https://vanaila.com)**.

---

## What it does

Atelier provides 18 professional-grade tools that run entirely in your browser:

### Documents & Content
- **Document Generator** — Agreements, invoices, proposals, PRDs, retainers, receipts, onboarding sheets, and handover documents with 3 style variants each (Classic, Modern, Editorial)
- **Social Generator** — Instagram, TikTok, and Threads content with 31+ templates for quotes, stats, launches, carousels, and more
- **CV Builder** — Full-featured CV/resume builder with ATS optimization, AI-powered rewrites, content library, cover letter generator, regional mode (International/Indonesia), and dual PDF + DOCX export

### PDF Tools
- **PDF to Image** — Convert PDF pages to PNG or JPG
- **PDF Merge** — Combine multiple PDFs into one file
- **PDF Compress** — Reduce PDF file size with adjustable compression levels
- **PDF Organize** — Reorder, rotate, remove, and extract pages
- **PDF Split** — Split PDF into separate pages or ranges
- **PDF Watermark** — Add text or image watermark to PDF
- **PDF to Markdown** — Extract PDF text into editable Markdown
- **PDF to Word** — Convert PDF text into an editable DOCX file
- **PDF to PowerPoint** — Convert PDF pages into a PowerPoint presentation
- **Edit PDF** — Reorder pages and add text or cover overlays

### Image & Text
- **Image Converter** — Convert between PNG, JPG, WebP, and AVIF formats
- **Image Compress** — Reduce image file size
- **Image Resize & Crop** — Resize, crop, and scale images
- **Image Background & Metadata** — Remove background or view and strip metadata
- **OCR** — Extract text from images and PDFs using Tesseract.js

All file processing happens **client-side** — your files never leave your browser.

### CV Builder Features
- **Guided wizard** — Answer 3 questions (role, experience, industry) to get a pre-structured CV
- **Step-by-step editor** — Section-by-section flow with progress tracking (plus full-form toggle)
- **Smart import** — Upload existing CV (PDF/DOCX) to auto-parse into fields
- **ATS checker** — Score your CV (0-100) with section breakdown, weak verb detection, and JD keyword matching
- **AI suggestions** — Pro-gated rewrites for experience bullets, summary generation via Groq (Llama 3.3)
- **Content library** — ~60 curated phrases by role/seniority/industry with click-to-copy
- **Cover letter generator** — Pro-gated AI generation from CV data, editable preview, copy-to-clipboard
- **Regional mode** — Toggle between International (ATS-safe) and Indonesia (photo, DOB, marital, religion)
- **Export** — PDF (6 templates) + DOCX (structured Word document)
- **Free tier:** 3 daily uses for metered tools (CV Builder has 3 PDF exports/day)
- **Pro tier:** Unlimited exports, premium templates, AI features

### Free Tier
- 3 daily uses for metered document/social/CV/OCR/PDF-to-image tools
- PDF Merge, PDF Compress, PDF Organize, PDF Split, PDF Watermark, PDF Markdown, PDF Word, PDF PowerPoint, Edit PDF, Image Converter, Image Compress, Image Resize, and Image Background & Metadata are currently unmetered
- Anonymous users get 1 daily use via backend anonymous usage tracking
- Account → Usage shows the last 30 days of both metered and unmetered tool activity; unmetered activity remains unlimited
- All templates and formats available
- Watermark applies to free/anonymous metered output where supported

### Pro Tier
- Tiered daily limits: Starter 30, Pro 100, Business 300 uses/day
- Premium templates
- Bulk export
- Priority support
- IDR/USD pricing is configured centrally in `api/src/lib/pricing.ts` and checkout is handled by Midtrans

### Technical Highlights
- **Client-side processing** — pdf.js, Tesseract.js, Canvas API, JSZip, pdf-lib, @jsquash/webp, @jsquash/avif
- **Dual routing** — Public marketing pages + authenticated app shell
- **Responsive design** — Mobile-friendly across all tools
- **Usage history** — Successful tool activity is recorded per user, tool, and UTC date for the account history view
- **i18n support** — English and Indonesian (Bahasa Indonesia)
- **Admin dashboard** — User management, analytics, revenue tracking, refund handling
- **Account controls** — Profile, subscription, usage history, security, and support tabs; password-manager-safe search and password fields

---

## Tech Stack

### Frontend
- **Framework:** Vite + React 19 + React Router v7
- **Styling:** Tailwind CSS 4
- **Package Manager:** pnpm
- **Processing:** pdf.js, Tesseract.js, html-to-image, JSZip, pdf-lib, @jsquash
- **DOCX generation:** docx library (structured Word documents)
- **Deployment:** Cloudflare Pages / Hostinger

### Backend
- **Runtime:** Cloudflare Workers
- **Framework:** Hono
- **Database:** Cloudflare D1 (SQLite)
- **Email:** Brevo
- **Payments:** Midtrans (IDR & USD)
- **Validation:** Zod

---

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm (`npm install -g pnpm` or `corepack enable`)
- Cloudflare account (for deployment)
- Wrangler CLI (`pnpm add -g wrangler` or `npm install -g wrangler`)

### Local Development

```bash
# Clone the repository
git clone https://github.com/vanaila-digital/atelier.git
cd atelier

# Install frontend dependencies
pnpm install

# Install backend dependencies
cd api
pnpm install

# Set up local database
pnpm run db:apply

# Configure environment variables
# Create api/.dev.vars with:
# JWT_SECRET=your-secret-key
# BREVO_API_KEY=your-brevo-key
# MIDTRANS_SERVER_KEY=your-midtrans-key
# MIDTRANS_CLIENT_KEY=your-midtrans-client-key

# Start backend (in api/ directory)
pnpm run dev

# Start frontend (in root directory)
cd ..
pnpm run dev
```

Frontend runs on `http://localhost:5173`  
Backend runs on `http://localhost:8787`

### Database Setup

```bash
# Apply schema locally
cd api
pnpm run db:apply

# Apply schema to production
pnpm run db:apply:remote

# Seed admin user
pnpm run seed:admin
```

### Deployment

```bash
# Deploy backend
cd api
wrangler deploy

# Frontend on Hostinger (static Git deployment)
cd ..
pnpm run build   # outputs to dist/

# Hostinger Deployments settings:
#   Framework preset : Vite
#   Build command    : pnpm run build
#   Output directory : dist
#   (no start command — dist/ is served statically by LiteSpeed/Apache)
#
# SPA routing: public/.htaccess is copied into dist/ on every build and
# rewrites all non-file routes to index.html so React Router handles them.
# Do NOT remove it or direct hits/refreshes on /login, /admin, etc. will 404.
# (public/_redirects and server.js are only used on Cloudflare Pages / a Node
# host respectively — inert on Hostinger static hosting.)
```

---

## Project Structure

```
atelier/
├── src/                          # Frontend source
│   ├── App.tsx                   # Main router
│   ├── main.tsx                  # Entry point
│   ├── pages/                    # Page components
│   │   ├── Landing.tsx           # Marketing landing
│   │   ├── Login.tsx, Register.tsx
│   │   ├── Pricing.tsx
│   │   ├── Account.tsx
│   │   ├── app/
│   │   │   └── Dashboard.tsx     # App dashboard
│   │   ├── legal/                # Privacy, Terms, Refund
│   │   └── Admin/                # Admin dashboard pages
│   ├── modules/                  # Tool implementations
│   │   ├── documents/
│   │   ├── social/
│   │   ├── cv/
│   │   ├── pdf-to-image/
│   │   ├── pdf-merge/
│   │   ├── pdf-compress/
│   │   ├── image-converter/
│   │   └── ocr/
│   ├── components/               # Shared components
│   ├── wrappers/
│   │   ├── AppShell.tsx          # Authenticated app wrapper
│   │   └── MarketingWrapper.tsx  # Public page wrapper
│   ├── hooks/                    # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useToolLimit.ts
│   │   └── usePlan.ts
│   ├── lib/
│   │   ├── api.ts                # API client
│   │   ├── tools.tsx             # Tool registry
│   │   └── i18n.ts               # Internationalization
│   └── locales/                  # Translation files
│
├── api/                          # Backend source
│   ├── src/
│   │   ├── index.ts              # Hono app + cron handler
│   │   ├── types.ts              # TypeScript types
│   │   ├── auth/
│   │   │   └── routes.ts         # Auth endpoints
│   │   ├── routes/
│   │   │   ├── usage.ts          # Authenticated usage tracking
│   │   │   ├── anon-usage.ts     # Anonymous usage tracking
│   │   │   ├── billing.ts        # Midtrans integration
│   │   │   ├── bug-reports.ts    # Bug report submission
│   │   │   ├── admin.ts          # Admin API aggregator
│   │   │   ├── admin/            # Admin subroutes
│   │   │   ├── cv-ai.ts          # Pro-gated Groq CV AI
│   │   │   └── log-error.ts      # Error logging
│   │   ├── middleware/
│   │   │   ├── auth.ts           # JWT verification
│   │   │   └── admin.ts          # Admin role check
│   │   ├── lib/
│   │   │   ├── config.ts
│   │   │   ├── email.ts          # Brevo + templates
│   │   │   ├── jwt.ts
│   │   │   ├── password.ts
│   │   │   ├── pricing.ts        # Pricing source of truth
│   │   │   ├── rate-limit.ts
│   │   │   ├── rate-limit-cache.ts
│   │   │   ├── sanitize.ts
│   │   │   └── tokens.ts
│   │   └── db/
│   │       ├── schema.sql        # Full schema
│   │       └── migrations/       # Migration files
│   └── wrangler.toml             # Cloudflare config
│
├── docs/                         # Documentation
├── scripts/                      # Build/utility scripts
└── public/                       # Static assets
```

---

## Core Patterns

### Tool Registry
All tools are defined in `src/lib/tools.tsx` with:
- Tool metadata (name, description, icon, category)
- Public and app paths
- Daily usage limits
- Pro-only flag

Routes are auto-generated from the registry for both public and authenticated contexts.

### Usage Limits
Every tool uses `useToolLimit(toolId)` hook:
```tsx
const { canUse, used, limit, increment, has_watermark, credits_available } = useToolLimit('cv-builder')
// Check canUse before export
// Call increment() after successful generation
// limit === null means unmetered or credit-backed usage
```

### Client-Side Processing
All file operations run in the browser:
- PDF parsing: pdf.js
- OCR: Tesseract.js (lazy-loaded WASM)
- Image conversion: Canvas API, @jsquash/webp, @jsquash/avif
- PDF manipulation: pdf-lib

**Trust signal:** Files never uploaded to servers.

### Authentication Flow
1. Register → Email verification required
2. Login → JWT token returned to frontend and stored by auth helpers
3. Session tracking in `sessions` table
4. Soft deletion: `deleted_at` field, 30-day grace period

### Billing Integration
- Midtrans Snap.js for payment UI
- Webhook validation with signature check
- Subscription states: active, grace_period, cancelled
- Refund requests with usage threshold checks

---

## Admin Dashboard

Access at `/admin` (requires `role='admin'` in database).

**Features:**
- User management (search, view details, modify subscriptions)
- Transaction history
- Subscription management (renewals, cancellations, grace periods)
- Refund request approval (auto-flags high-usage users)
- Bug report tracking
- Revenue analytics and charts
- System configuration
- Feature flags
- Health monitoring
- Error log viewer

**Set admin role:**
```bash
wrangler d1 execute vanaila-studio --local \
  --command "UPDATE users SET role='admin' WHERE email='your@email.com';"
```

---

## Environment Variables

### Backend (.dev.vars for local, Cloudflare dashboard for production)
```
JWT_SECRET=your-secret-key
BREVO_API_KEY=xkeysib-xxxxx
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxx
MIDTRANS_IS_PRODUCTION=false
GROQ_API_KEY=gsk_xxxxx
```

### Frontend (vite.config.ts or .env)
```
VITE_API_URL=http://localhost:8787
```

---

## Commands

```bash
# Frontend
pnpm run dev              # Start dev server
pnpm run build            # Build for production
pnpm run build:ssr        # Build client + SSR bundles
pnpm run prerender        # Build SSR and prerender static HTML routes
pnpm run preview          # Preview production build
pnpm run typecheck        # TypeScript check
pnpm run test:security    # Run security regression tests
pnpm run test:concurrency # Run concurrency regression tests
pnpm run test:performance # Run performance regression tests

# Backend
cd api
pnpm run dev              # Start Wrangler dev server
pnpm run deploy           # Deploy to Cloudflare Workers
pnpm run typecheck        # TypeScript check
pnpm run db:apply         # Apply schema locally
pnpm run db:apply:remote  # Apply schema to production
pnpm run seed:admin       # Seed admin user

# Database migrations
wrangler d1 execute vanaila-studio --local --file=api/src/db/migrations/001_admin_dashboard.sql
wrangler d1 execute vanaila-studio --file=api/src/db/migrations/001_admin_dashboard.sql
```

---

## Contributing

Pull requests are welcome. For significant changes, open an issue first to discuss what you would like to change.

**Guidelines:**
- Maintain client-side processing for all file operations
- Follow existing code patterns (tool registry, usage hooks)
- Update documentation when adding features
- Test both free and Pro tier flows
- Ensure mobile responsiveness

---

## Security

- All passwords hashed with bcrypt
- JWT tokens are returned for legacy bearer sessions; Better Auth also supports cookie sessions
- CORS configured for frontend domain only
- Rate limiting on auth endpoints
- Input validation with Zod on all API routes
- No PII in error logs
- Session tracking for security audits

**Report security issues:** security@vanaila.com

---

## License

MIT — free to use, fork, and modify. Attribution appreciated but not required.

---

## Made by

**[Vanaila Digital](https://vanaila.com)** — a digital agency creating websites and custom tools for creators, small businesses, and enterprises.

**Contact:** hello@vanaila.com
