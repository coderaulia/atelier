# Manual Test Plan

Covers flows that require a browser, payment gateway, or physical hardware.
Run after passing `npm run test:flows` (API layer already verified).

---

## 1. Anonymous → tool → daily limit → signup prompt

**Setup:** Open fresh incognito window (or clear cookies/localStorage).

1. Navigate to any tool page, e.g. `/cv-builder`
2. Use the tool once — should succeed (no auth required)
3. Attempt a second use today from same browser — expect **signup/login modal** to appear (or a banner saying "Sign up to continue")
4. Confirm modal has "Sign Up" and "Log In" CTA links

**Pass condition:** Prompt is visible, user is not silently blocked.

---

## 2. Register → receive + click verification email → login

**Setup:** Real email address (use Mailinator or your own inbox).

1. Register new account via `/register`
2. Check inbox for "Verify your email" message from Atelier (sent via Brevo)
3. Click the verification link — should redirect to `/account?verified=1`
4. Log in with the same credentials
5. Confirm `/auth/me` or `/account` shows `email_verified: 1`

**Pass condition:** Email arrives, link works, account shows verified.

---

## 3. Free user → hit limit → upgrade modal → Midtrans sandbox pay → plan flips

**Setup:** Midtrans sandbox credentials (`MIDTRANS_CLIENT_KEY_SANDBOX`, `MIDTRANS_SERVER_KEY_SANDBOX`).

1. Log in as free user
2. Use `cv-builder` 3× (daily free limit)
3. Attempt 4th use — expect **upgrade modal**
4. Click upgrade, select Pro plan — Midtrans Snap popup should appear
5. Pay with sandbox card: `4811 1111 1111 1114` / any future date / CVV `123`
6. After payment:
   - `GET /billing/status` should return `plan: "pro"`
   - Midtrans webhook should have fired (check API logs)
7. Attempt cv-builder again — should work without modal

**Pass condition:** Plan becomes "pro" after sandbox payment.

---

## 4. Pro user → AI rewrite + cover letter; free user gets 403

Already covered by `npm run test:flows` (API-level).

Browser check:
1. As pro user, open CV builder → click "AI Rewrite" on a bullet
2. Confirm rewritten text appears
3. Click "Generate Cover Letter" → confirm letter populates

**Pass condition:** AI actions return text, no error toast.

---

## 5. CV builder: wizard → import messy PDF → ATS score → export PDF + DOCX

1. Open `/cv-builder` (or `/app/cv-builder`)
2. Click "Import from PDF" — upload a real, multi-column, graphic-heavy CV PDF
3. Confirm fields are parsed (some may be partial — acceptable for noisy PDFs)
4. Fill in missing fields, preview CV
5. Click "ATS Score" — confirm score appears (0-100 with breakdown)
6. Click "Export PDF" — download PDF, open in viewer, confirm layout correct
7. Click "Export DOCX" — download .docx, open in Word/LibreOffice, confirm readable

**Pass condition:** Both exports open without errors, contain expected content.

---

## 6. Account navigation, autofill isolation, and usage history

1. Log in and open `/app/account`.
2. Confirm the full app sidebar remains visible.
3. Open the Security tab.
4. Confirm the Tools search field remains empty and contains no saved email.
5. Confirm the Current password field is empty and contains no saved password.
6. Enter a password manually and verify only the intended field changes.
7. Open Usage and confirm the last 30 days of activity loads.
8. Use a metered tool and an unmetered tool, then reload Usage.
9. Confirm both activities appear; the unmetered row shows `unlimited` and does not consume the daily quota.
10. If the API is unavailable, confirm Usage shows an error rather than incorrectly reporting `No usage yet`.

**Pass condition:** Security autofill does not affect sidebar navigation or fields, and usage history reports recorded activity accurately.

## 7. Cancel subscription → keeps Pro until expiry → cron downgrades after grace

API layer partially verified; full lifecycle check:

1. As pro user: `POST /billing/cancel` → confirm `cancel_at_period_end: true`
2. Check `/billing/status` — plan still `pro`, expiry date intact
3. Simulate payment failure webhook (use test script with `MIDTRANS_SERVER_KEY`):
   ```
   POST /billing/webhook { transaction_status: "expire", ... }
   ```
4. Check `/billing/status` — plan still `pro`, `grace_until` set 3 days ahead
5. Run admin cron: `POST /admin/cron/run` (requires admin JWT)
6. Before grace_until: plan remains `pro`
7. Manually backdate `grace_until` to past via admin panel, re-run cron
8. Check `/billing/status` — plan now `free`

**Pass condition:** Pro access preserved during grace, downgraded after cron with expired grace.

---

## 8. Real mid-range Android: OCR, AVIF convert, 20-page PDF merge (Phase 12 memory guards)

**Device:** Mid-range Android (e.g. Redmi Note 11, 4–6 GB RAM).
**Browser:** Chrome mobile, latest.

### OCR (Image Text Extractor)
1. Open `/ocr` on device
2. Photograph a printed document in decent light
3. Tap "Extract Text" — confirm Tesseract.js runs and returns text
4. **Memory guard check:** Open DevTools remote debug → Memory tab; confirm heap stays under 512 MB

### AVIF Conversion
1. Open `/image-converter` on device
2. Upload a 4–5 MB JPEG
3. Select output format: AVIF
4. Convert — confirm download completes, file opens in gallery
5. **Guard check:** No browser crash, no freeze > 5 seconds

### 20-page PDF Merge
1. Open `/pdf-merge` on device
2. Upload 20 single-page PDFs (or a 20-page PDF split)
3. Merge — confirm output PDF is downloadable
4. **Guard check:** Memory warning banner should NOT appear; if page memory exceeds guard threshold, a graceful "reduce file count" message should appear rather than a crash

**Pass condition:** All three complete without browser crash or unresponsive tab.

---

## 9. Prerendered tool page with JS disabled — real HTML present (SEO)

**Method A — curl:**
```bash
curl -s https://studio.vanaila.com/pdf-to-image | grep -c '<h1>'
# Should return 1+
curl -s https://studio.vanaila.com/pdf-to-image | grep 'meta name="description"'
# Should return populated content
```

**Method B — Browser (JS disabled):**
1. Chrome → DevTools → Settings → Debugger → "Disable JavaScript"
2. Navigate to `/pdf-to-image`, `/cv-builder`, `/ocr`
3. Confirm page renders tool description, h1 heading, feature list — no blank/spinner page

**Method C — Lighthouse:**
```bash
npx lighthouse https://studio.vanaila.com/pdf-to-image --only-categories=seo --output=json | jq '.categories.seo.score'
# Expect >= 0.9
```

**Pass condition:** `<h1>`, meta description, and meaningful body text all present without JS.

---

## Environment Prerequisites

| Test | Env var needed |
|---|---|
| Midtrans payment (3, 6) | `MIDTRANS_CLIENT_KEY_SANDBOX`, `MIDTRANS_SERVER_KEY` |
| Webhook flow (6) | `MIDTRANS_SERVER_KEY` |
| Admin cron (6) | `ADMIN_EMAIL`, `ADMIN_PASSWORD` |
| AI rewrite (4) | `GROQ_API_KEY` + pro plan |
| Email verification (2) | `BREVO_API_KEY` + real inbox |
| Prerender SEO (8) | Production deploy (`npm run prerender`) |
