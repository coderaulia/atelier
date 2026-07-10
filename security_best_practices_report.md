# Backend Security Best-Practices Report

Revision reviewed: `47b142276c19af80ed48df0560afa8aeabb8fcd0` (`main`, after `git fetch origin`)

## Executive Summary

The backend has a generally solid baseline: D1 queries are mostly parameterized, admin routes are gated, CORS is allowlisted, production dependencies currently show no `npm audit --omit=dev` findings, password reset tokens are hashed, and billing webhooks verify Midtrans signatures.

The main risk is mixed authentication: normal API routes accept Better Auth cookie sessions, but state-changing routes do not enforce CSRF tokens, Fetch Metadata, or server-side `Origin` checks. Several medium/low findings are hardening items around IP-based rate limiting, bearer token lifecycle, request-size enforcement, and sensitive admin configuration exposure.

## Critical

No critical findings found in the reviewed backend code.

## High

### H1. Cookie-authenticated state-changing routes lack CSRF or server-side origin protection

**Location:** `api/src/middleware/auth.ts:15-20`, `api/src/index.ts:20-32`, affected routes include `api/src/auth/routes.ts:324-507`, `api/src/routes/billing.ts:53-181`, `api/src/routes/usage.ts:210-258`, and `api/src/routes/cv-ai.ts:7-10`

**Evidence:** `authMiddleware` first accepts a Better Auth session from request headers/cookies:

```ts
const auth = createAuth(c.env)
const session = await auth.api.getSession({ headers: c.req.raw.headers })
if (session?.user?.id) {
```

CORS allows credentials for allowlisted origins, but there is no CSRF token check, Fetch Metadata check, or server-side `Origin`/`Referer` validation before mutations:

```ts
credentials: true,
```

Examples of state-changing cookie-authenticated routes include subscription cancellation/reactivation, checkout creation, profile update, account deletion, session deletion, password change, usage/credit consumption, and AI generation.

**Impact:** If a browser sends a valid Better Auth cookie on a cross-site or same-site-subdomain request, an attacker could trigger user actions such as cancelling/reactivating billing, consuming credits, logging out, changing profile data, or requesting emails without reading the response.

**Fix:** Add a central mutation guard before cookie-authenticated `POST`, `PATCH`, `PUT`, and `DELETE` routes. Prefer CSRF tokens for cookie sessions. At minimum, enforce trusted `Origin`/`Referer` plus Fetch Metadata (`Sec-Fetch-Site`) checks, and require a non-simple custom header for JSON mutations. Keep Bearer-token-only routes exempt if they do not use cookies.

**Mitigation:** Confirm Better Auth cookie `SameSite` settings in production. `SameSite=Lax` reduces classic cross-site POST risk, but it is not a full substitute for explicit mutation protection, especially with same-site subdomains and future auth changes.

## Medium

### M1. IP-based rate limits can be bypassed if `X-Forwarded-For` is accepted from untrusted traffic

**Location:** `api/src/lib/rate-limit.ts:74-75`; used globally in `api/src/index.ts:37-44` and auth/admin/billing routes

**Evidence:**

```ts
return c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For')?.split(',')[0]?.trim() ?? 'unknown'
```

**Impact:** If the Worker is ever reached in a context where `CF-Connecting-IP` is missing and client-supplied `X-Forwarded-For` is not stripped, attackers can rotate that header to evade login, password reset, webhook, and global rate limits.

**Fix:** In production, trust only Cloudflare-provided client IP metadata. Treat `X-Forwarded-For` as valid only in explicitly configured local/dev environments or after a trusted proxy has normalized it.

**Mitigation:** Add Cloudflare Rate Limiting/WAF rules for login, password reset, billing webhook, and admin paths so abuse controls do not depend only on app code.

### M2. Long-lived legacy Bearer tokens are still issued to clients

**Location:** `api/src/auth/routes.ts:147-158`; JWT lifetime in `api/src/lib/jwt.ts:3-16`

**Evidence:** Login signs a 30-day JWT and returns it in JSON:

```ts
const { token, expiresAt } = await signToken(user.id, c.env.JWT_SECRET)
return c.json({ token, user: { ... } })
```

**Impact:** Any frontend XSS or browser extension compromise can steal a long-lived Bearer token from client-side storage and use it until expiry or session invalidation.

**Fix:** Prefer HttpOnly, Secure, SameSite cookies for primary auth and phase out legacy token issuance. If Bearer tokens must remain, reduce lifetime, add rotation/refresh-token separation, bind sessions more tightly to device metadata, and monitor token reuse anomalies.

**Mitigation:** Keep the current server-side `sessions` table check, because it provides revocation despite stateless JWT signing.

### M3. Request-size protection relies on `Content-Length`

**Location:** `api/src/index.ts:47-54`

**Evidence:**

```ts
const contentLength = Number(c.req.header('Content-Length') ?? '0')
if (contentLength > 1_048_576) {
```

**Impact:** Requests without a trustworthy `Content-Length` header can reach route-level `c.req.json()` parsing. Cloudflare has platform limits, but the app-level 1 MB guard can be bypassed, increasing DoS exposure and memory pressure.

**Fix:** Use body parsing with an actual read limit, or wrap JSON parsing in a helper that reads the stream up to a maximum byte count before parsing. Keep route-level smaller limits where applicable.

**Mitigation:** Enforce request body limits at Cloudflare/WAF for API routes.

### M4. Admin system config API and audit logs can expose sensitive values if secrets are ever stored there

**Location:** `api/src/routes/admin/system.ts:22-47`

**Evidence:** Admin config returns all `key`, `value`, and audit logs include the updated value:

```ts
'SELECT key, value, type, description, updated_at FROM system_config ORDER BY key ASC'
JSON.stringify({ key, value: result.data.value })
```

**Impact:** If operators later add API keys, webhook secrets, or tokens into `system_config`, those values become readable through the admin API and duplicated into audit logs.

**Fix:** Explicitly mark config keys as public/admin-visible versus secret. Never store secrets in D1 config; use Wrangler secrets. Redact values in audit logs by default.

**Mitigation:** Add a schema or allowlist for editable keys and block names matching `secret`, `token`, `password`, `key`, or `credential` unless explicitly approved.

## Low

### L1. Better Auth cross-subdomain cookies are enabled globally

**Location:** `api/src/lib/better-auth.ts:50-53`

**Evidence:**

```ts
advanced: {
  crossSubDomainCookies: {
    enabled: true,
  },
},
```

**Impact:** Cross-subdomain cookies broaden the trust boundary. A compromise or misconfiguration on another same-site subdomain may increase session risk, depending on cookie domain and SameSite attributes.

**Fix:** Disable cross-subdomain cookies unless the product requires auth across multiple trusted subdomains. If required, document the trusted subdomain boundary and ensure every subdomain has equivalent security controls.

### L2. Public health endpoint exposes timestamp and service availability

**Location:** `api/src/index.ts:77`

**Evidence:**

```ts
app.get('/health', (c) => c.json({ ok: true, ts: Date.now() }))
```

**Impact:** Low-risk information disclosure useful for uptime probing and environment fingerprinting.

**Fix:** Keep if required for monitoring, but consider returning only `{ ok: true }` or protecting detailed health under admin-only routes.

### L3. Production observability persists invocation logs

**Location:** `api/wrangler.toml:25-33`

**Evidence:**

```toml
[observability.logs]
enabled = true
persist = true
invocation_logs = true
```

**Impact:** Persisted request/runtime logs can become sensitive if future handlers log user data, third-party error bodies, or operational details.

**Fix:** Keep logs, but add redaction guidance and avoid logging request bodies, tokens, cookies, third-party secrets, or full provider responses.

## Positive Controls Observed

- SQL access generally uses prepared statements and bound values.
- Admin routes use `adminMiddleware`.
- CORS origin is allowlisted rather than wildcarded.
- Midtrans webhook signature is checked with a timing-safe comparison.
- Password reset and email verification tokens are hashed before storage.
- Production dependency audits for both root and `api/` returned zero vulnerabilities with `npm audit --omit=dev`.
