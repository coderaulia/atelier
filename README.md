# Atelier by Vanaila

A freemium browser-based toolkit for documents, CVs, PDF/image conversions, OCR, and social media content. Built for freelancers, small teams, and job seekers.

**Live at:** [app.vanaila.com](https://app.vanaila.com)

Built by **[Vanaila Digital](https://vanaila.com)**.

---

## What it does

Atelier provides 8 professional-grade tools that run entirely in your browser:

### Documents & Content
- **Document Generator** — Agreements, invoices, proposals, PRDs, retainers, receipts, onboarding sheets, and handover documents with 3 style variants each (Classic, Modern, Editorial)
- **Social Generator** — Instagram, TikTok, and Threads content with 31+ templates for quotes, stats, launches, carousels, and more
- **CV Builder** — Full-featured CV/resume builder with ATS optimization, AI-powered rewrites, content library, cover letter generator, regional mode (International/Indonesia), and dual PDF + DOCX export

### PDF Tools
- **PDF to Image** — Convert PDF pages to PNG or JPG
- **PDF Merge** — Combine multiple PDFs into one file
- **PDF Compress** — Reduce PDF file size with adjustable compression levels

### Image & Text
- **Image Converter** — Convert between PNG, JPG, WebP, and AVIF formats
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
- **Free tier:** 5 PDF exports/day
- **Pro tier:** Unlimited exports, premium templates, AI features

### Free Tier
- 3 daily uses for metered document/social/CV/OCR/PDF-to-image tools
- PDF Merge, PDF Compress, and Image Converter are currently unmetered
- Anonymous users get 1 daily use via backend anonymous usage tracking
- All templates and formats available
- Watermark applies to free/anonymous metered output where supported

### Pro Tier
- Unlimited daily usage
- Premium templates
- Bulk export
- Priority support
- IDR 99,000/month or USD $9/month via Midtrans

### Technical Highlights
- **Client-side processing** — pdf.js, Tesseract.js, Canvas API, JSZip
- **Dual routing** — Public marketing pages + authenticated app shell
- **Responsive design** — Mobile-friendly across all tools
- **i18n support** — English and Indonesian (Bahasa Indonesia)
- **Admin dashboard** — User management, analytics, revenue tracking, refund handling

---

## Tech Stack

### Frontend
- **Framework:** Vite + React 19 + React Router v7
- **Styling:** Tailwind CSS 4
- **Processing:** pdf.js, Tesseract.js, html-to-image, JSZip, pdf-lib
- **DOCX generation:** docx library (structured Word documents)
- **Deployment:** Cloudflare Pages

### Backend
- **Runtime:** Cloudflare Workers
- **Framework:** Hono
- **Database:** Cloudflare D1 (SQLite)
- **Email:** Resend
- **Payments:** Midtrans (IDR & USD)
- **Validation:** Zod

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Cloudflare account (for deployment)
- Wrangler CLI (`npm install -g wrangler`)

### Local Development

```bash
# Clone the repository
git clone https://github.com/vanaila-digital/atelier.git
cd atelier

# Install frontend dependencies
npm install

# Install backend dependencies
cd api
npm install

# Set up local database
npm run db:apply

# Configure environment variables
# Create api/.dev.vars with:
# JWT_SECRET=your-secret-key
# RESEND_API_KEY=your-resend-key
# MIDTRANS_SERVER_KEY=your-midtrans-key
# MIDTRANS_CLIENT_KEY=your-midtrans-client-key

# Start backend (in api/ directory)
npm run dev

# Start frontend (in root directory)
npm run dev
```

Frontend runs on `http://localhost:5173`  
Backend runs on `http://localhost:8787`

### Database Setup

```bash
# Apply schema locally
cd api
npm run db:apply

# Apply schema to production
npm run db:apply:remote

# Seed admin user
npm run seed:admin
```

### Deployment

```bash
# Deploy backend
cd api
wrangler deploy

# Frontend on Hostinger Node.js App
cd ..
npm run build
npm start

# Hostinger Git deployment:
# Build command: npm run build
# Start command: npm start
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
│   │   │   ├── email.ts          # Resend + templates
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
RESEND_API_KEY=re_xxxxx
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
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run typecheck        # TypeScript check

# Backend
cd api
npm run dev              # Start Wrangler dev server
npm run deploy           # Deploy to Cloudflare Workers
npm run typecheck        # TypeScript check
npm run db:apply         # Apply schema locally
npm run db:apply:remote  # Apply schema to production
npm run seed:admin       # Seed admin user

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
- JWT tokens with httpOnly cookies
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
