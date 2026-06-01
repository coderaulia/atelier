# Monitoring & Alerting Setup Guide

**Status:** Not configured (manual setup required)  
**Priority:** High — needed for production launch

---

## Overview

Production monitoring tracks errors, performance, and payment failures so you can respond before users report issues.

---

## 1. Cloudflare Workers Analytics (Built-in)

**What it tracks:**
- Request volume
- Error rates (5xx responses)
- P50/P95/P99 latency
- CPU time per request

**Setup:**
1. Go to Cloudflare Dashboard → Workers & Pages → `vanaila-studio-api`
2. Click **Metrics** tab
3. Enable **Real-time logs** (optional, costs extra)

**Alerts:**
- Set up email alerts for error rate > 5% (Cloudflare Dashboard → Notifications)
- Alert on P99 latency > 2000ms

---

## 2. Frontend Error Tracking (Sentry Recommended)

**Why:** Catch client-side errors (PDF parsing failures, WASM crashes, etc.)

### Option A: Sentry (Recommended)

**Setup:**
```bash
npm install @sentry/react
```

**Add to `src/main.tsx`:**
```typescript
import * as Sentry from '@sentry/react'

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: 'YOUR_SENTRY_DSN',
    environment: 'production',
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: 0.1, // 10% of transactions
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event) {
      // Filter out low-value errors
      if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
        return null
      }
      return event
    },
  })
}
```

**Wrap App in ErrorBoundary:**
```typescript
// Already exists in src/components/ErrorBoundary.tsx
// Just ensure it's wrapping <App /> in main.tsx
```

**Cost:** Free tier: 5,000 errors/month  
**Alerts:** Configure in Sentry dashboard for error spikes

### Option B: Cloudflare Browser Insights

**Setup:**
1. Cloudflare Dashboard → Speed → Browser Insights
2. Add beacon script to `index.html`

**Pros:** Free, no code changes  
**Cons:** Less detailed than Sentry

---

## 3. Backend Error Logging (Already Implemented)

**Current setup:**
- Errors logged to D1 `error_log` table via `POST /api/log-error`
- Admin dashboard shows recent errors at `/admin/errors`

**Missing:**
- ❌ Real-time alerts (currently requires manual dashboard check)
- ❌ Error aggregation/deduplication

**Improvement: Add Sentry to Workers**

```bash
cd api
npm install toucan-js
```

**Update `api/src/index.ts`:**
```typescript
import { Toucan } from 'toucan-js'

app.use('*', async (c, next) => {
  const sentry = new Toucan({
    dsn: c.env.SENTRY_DSN,
    context: c.executionCtx,
    request: c.req.raw,
    environment: c.env.ENVIRONMENT || 'production',
  })
  c.set('sentry', sentry)
  
  try {
    await next()
  } catch (err) {
    sentry.captureException(err)
    throw err
  }
})
```

**Add to `api/wrangler.toml`:**
```toml
[vars]
ENVIRONMENT = "production"

# Set via: wrangler secret put SENTRY_DSN
```

---

## 4. Payment Failure Alerts (Critical)

**Current state:** Payment failures logged to `transactions` table with `status='failed'`

**Missing:** No real-time alerts when payments fail

### Setup Email Alerts

**Option A: Cloudflare Cron + Resend**

Add to `api/src/index.ts` scheduled handler:

```typescript
async function handleScheduled(env: Bindings) {
  // ... existing cron logic ...
  
  // Check for recent payment failures
  const now = Math.floor(Date.now() / 1000)
  const oneHourAgo = now - 3600
  
  const recentFailures = await env.DB
    .prepare('SELECT COUNT(*) as count FROM transactions WHERE status = ? AND created_at > ?')
    .bind('failed', oneHourAgo)
    .first<{ count: number }>()
  
  if (recentFailures && recentFailures.count > 5) {
    // Alert admin
    await sendEmail({
      to: 'admin@vanaila.com',
      subject: '⚠️ High payment failure rate',
      html: `${recentFailures.count} payments failed in the last hour. Check /admin/transactions.`,
    }, env.RESEND_API_KEY)
  }
}
```

**Option B: Sentry Custom Event**

```typescript
// In billing webhook handler
if (event.transaction_status === 'deny' || event.transaction_status === 'expire') {
  c.get('sentry')?.captureMessage('Payment failed', {
    level: 'warning',
    extra: {
      user_id: userId,
      order_id: event.order_id,
      amount: event.gross_amount,
    },
  })
}
```

---

## 5. Database Connection Monitoring

**Current:** No health checks beyond `/health` endpoint

**Add to `api/src/index.ts`:**

```typescript
app.get('/health', async (c) => {
  try {
    // Test DB connection
    const result = await c.env.DB.prepare('SELECT 1').first()
    if (!result) throw new Error('DB query returned null')
    
    return c.json({ 
      ok: true, 
      ts: Date.now(),
      db: 'connected',
    })
  } catch (err) {
    return c.json({ 
      ok: false, 
      ts: Date.now(),
      db: 'error',
      error: err instanceof Error ? err.message : 'Unknown',
    }, 503)
  }
})
```

**External monitoring:**
- Use UptimeRobot (free) or Better Uptime to ping `/health` every 5 minutes
- Alert if response is not 200 or `ok: false`

---

## 6. API Latency Tracking

**Current:** Cloudflare Workers Analytics tracks P99 latency

**Improvement: Add custom timing for slow endpoints**

```typescript
app.use('*', async (c, next) => {
  const start = Date.now()
  await next()
  const duration = Date.now() - start
  
  if (duration > 2000) {
    // Log slow requests
    console.warn(`Slow request: ${c.req.method} ${c.req.path} took ${duration}ms`)
    c.get('sentry')?.captureMessage('Slow API request', {
      level: 'warning',
      extra: { path: c.req.path, duration },
    })
  }
})
```

---

## Recommended Launch Setup (Minimal)

**Must-have before launch:**
1. ✅ Cloudflare Workers Analytics (already enabled)
2. ✅ Frontend error logging to backend (already implemented)
3. ❌ **Payment failure email alerts** (add to cron)
4. ❌ **UptimeRobot health check** (5 min setup)

**Nice-to-have (add within first week):**
5. Sentry for frontend (better error context)
6. Sentry for backend (real-time alerts)
7. Slow query logging

---

## Cost Estimate

| Service | Tier | Cost |
|---|---|---|
| Cloudflare Workers Analytics | Included | $0 |
| Sentry (frontend + backend) | Developer | $26/month |
| UptimeRobot | Free | $0 |
| **Total** | | **$26/month** |

---

## Alert Checklist

- [ ] Error rate > 5% in last hour
- [ ] Payment failures > 5 in last hour
- [ ] API health check fails (2 consecutive checks)
- [ ] P99 latency > 2000ms
- [ ] Database connection errors
- [ ] WASM/PDF parsing crashes (frontend)

---

## Next Steps

1. **Immediate (pre-launch):**
   - Add payment failure email alert to cron
   - Set up UptimeRobot health check

2. **Week 1:**
   - Add Sentry to frontend
   - Add Sentry to backend
   - Configure alert thresholds

3. **Week 2:**
   - Review first week of error logs
   - Tune alert thresholds to reduce noise
   - Add custom dashboards for key metrics
