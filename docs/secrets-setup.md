# Environment and Secrets Setup

Use **Cloudflare Worker secrets** for sensitive values. Do **not** put API keys, JWT secrets, passwords, or payment keys in Git, `wrangler.toml`, `.env`, or frontend code.

## Production Worker secrets

Run from the API directory:

```bash
cd api

# Required — strong random string (at least 32 chars)
openssl rand -base64 32
wrangler secret put JWT_SECRET

# Required — email delivery via Resend (get from https://resend.com)
wrangler secret put RESEND_API_KEY

# Required — payment webhook verification (get from Midtrans dashboard)
wrangler secret put MIDTRANS_SERVER_KEY

# Required only if CV AI features are enabled (get from https://console.groq.com/keys)
wrangler secret put GROQ_API_KEY
```

`wrangler secret put` prompts for the value. Paste the secret, press Enter. It will not be printed back.

## Production non-secret vars

These are not secrets, so keep them in `api/wrangler.toml` under `[vars]` **after replacing values with your real domains**:

```toml
[vars]
ENVIRONMENT = "production"
APP_URL = "https://atelier.vanailadigital.com"
ALLOWED_ORIGINS = "https://atelier.vanailadigital.com"
MIDTRANS_BASE_URL = "https://api.midtrans.com"
```

For Midtrans sandbox, use:

```toml
MIDTRANS_BASE_URL = "https://api.sandbox.midtrans.com"
```

## Frontend env vars (non-secret)

These are public values set in the frontend `.env` file or CI build environment:

```bash
VITE_API_URL=https://api.yourdomain.com
VITE_MIDTRANS_ENV=production
VITE_MIDTRANS_CLIENT_KEY=Mid-client-xxxxxxxxx
```

For sandbox/dev:

```bash
VITE_MIDTRANS_ENV=sandbox
VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxx
```

## Local development secrets

Use Cloudflare's local secrets file. Do not commit it.

Create `api/.dev.vars`:

```bash
cd api
cp .dev.vars.example .dev.vars
```

Then fill values in `api/.dev.vars`:

```dotenv
ENVIRONMENT=development
JWT_SECRET=replace-with-local-random-secret
RESEND_API_KEY=replace-with-resend-key-or-test-value
MIDTRANS_SERVER_KEY=replace-with-midtrans-sandbox-server-key
GROQ_API_KEY=replace-with-groq-key
APP_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173
MIDTRANS_BASE_URL=https://api.sandbox.midtrans.com
```

Generate local JWT secret:

```bash
openssl rand -base64 32
```

## Production Secrets Summary

| Secret | Required | Source | Notes |
|--------|----------|--------|-------|
| `JWT_SECRET` | ✅ | Generate | `openssl rand -base64 32` |
| `RESEND_API_KEY` | ✅ | Resend dashboard | Email verification, billing |
| `MIDTRANS_SERVER_KEY` | ✅ | Midtrans dashboard | Webhook validation |
| `GROQ_API_KEY` | If AI enabled | Groq console | CV AI features |

## Non-secret Vars Summary

| Var | Required | Example |
|-----|----------|---------|
| `ENVIRONMENT` | ✅ | `production` |
| `APP_URL` | ✅ | `https://atelier.vanailadigital.com` |
| `ALLOWED_ORIGINS` | ✅ | `https://atelier.vanailadigital.com` |
| `MIDTRANS_BASE_URL` | ✅ | `https://api.midtrans.com` |

## Safety rules

- Never commit `.dev.vars`.
- Never put secrets in `wrangler.toml` `[vars]`.
- Never expose secrets through `VITE_*` frontend variables.
- Only put public values in frontend env variables.
- Rotate secrets immediately if accidentally committed.
