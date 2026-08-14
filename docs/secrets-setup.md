# Environment and Secrets Setup

Use **Cloudflare Worker secrets** for sensitive values. Do **not** put API keys, JWT secrets, passwords, or payment keys in Git, `wrangler.toml`, `.env`, or frontend code.

## Production Worker secrets

Run from the API directory:

```bash
cd api

# Required — strong random string (at least 32 chars)
openssl rand -base64 32
wrangler secret put JWT_SECRET

# Required — email delivery via Brevo (get from https://app.brevo.com/settings/keys/api)
wrangler secret put BREVO_API_KEY

# Required — payment webhook verification (get from Midtrans dashboard)
wrangler secret put MIDTRANS_SERVER_KEY

# Required only if CV AI features are enabled (get from https://console.groq.com/keys)
wrangler secret put GROQ_API_KEY
```

`wrangler secret put` prompts for the value. Paste the secret, press Enter. It will not be printed back.

## Brevo email setup

The Worker sends transactional email through Brevo's v3 API. The sender is currently fixed as `Vanaila Studio <studio@vanaila.com>` in `api/src/lib/email.ts`.

1. In [Brevo Senders & IP](https://app.brevo.com/senders/list), add `studio@vanaila.com` as a sender, or authenticate the full `vanaila.com` domain.
2. Add the DKIM and other authentication DNS records shown by Brevo to the `vanaila.com` DNS zone. Use the exact names and values Brevo provides, then wait until Brevo reports the sender/domain as authenticated.
3. Open [Brevo API keys](https://app.brevo.com/settings/keys/api) and create a v3 API key for the production Worker.
4. Set the production Worker secret from the API directory:

   ```bash
   cd api
   rtk npx wrangler secret put BREVO_API_KEY
   ```

5. Validate the key without sending email:

   ```bash
   curl --silent --output /dev/null --write-out "%{http_code}\n" \
     --header "api-key: $BREVO_API_KEY" \
     https://api.brevo.com/v3/account
   ```

   HTTP `200` means the key is valid. HTTP `401` means the key is missing or invalid.

Sender verification must finish before registration, password reset, or billing emails can deliver. If sender address changes, update `api/src/lib/email.ts` and verify the new sender/domain in Brevo first.

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

Then fill values in `api/.dev.vars`. Use a separate Brevo v3 API key for local development when possible, so it can be revoked without affecting production:

```dotenv
ENVIRONMENT=development
JWT_SECRET=replace-with-local-random-secret
BREVO_API_KEY=replace-with-brevo-key-or-test-value
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
| `BREVO_API_KEY` | ✅ | Brevo dashboard | Email verification, billing |
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
