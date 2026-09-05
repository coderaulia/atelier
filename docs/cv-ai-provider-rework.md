# CV AI Provider Rework Plan

## Goal
Reduce CV AI operating cost without changing the client contract or exposing provider credentials. The browser continues calling `POST /api/cv/ai`; the Worker owns provider selection, prompts, limits, and secrets.

## Current implementation
- `api/src/routes/cv-ai.ts` uses an OpenAI-compatible `/chat/completions` request.
- Groq remains the default when `GROQ_API_KEY` is present.
- Provider configuration is Worker-side:
  - `AI_PROVIDER` — label for logs (for example `groq` or `vikey`)
  - `AI_BASE_URL` — provider base URL ending at `/v1`
  - `AI_API_KEY` — secret for the selected provider
  - `AI_MODEL` — provider model name
- Vikey.ai compatibility is ready with `AI_BASE_URL=https://api.vikey.ai/v1`; select a supported inexpensive model in `AI_MODEL`.

## Phased rework

### Phase 1 — Provider seam (implemented)
- Keep one normalized request/response contract.
- Move endpoint, key, and model to Cloudflare Worker configuration.
- Preserve Groq fallback for existing deployments.
- Never send keys or provider configuration to the frontend.

### Phase 2 — Cost controls
- Add per-action model policy: lightweight model for rewrite/tone, stronger model only for tailoring and cover letters.
- Enforce input length and output token ceilings by action.
- Add a per-user daily AI request budget independent of PDF/tool usage.
- Return clear 429 responses when the AI budget is exhausted.

### Phase 3 — Reliability and quality
- Add provider timeout, retry only for transient 429/5xx responses, and no retry for validation failures.
- Add a provider response adapter that validates the expected text result before returning it.
- Maintain a small fixed evaluation set for bullet rewrites, summaries, tailoring, and cover letters before changing model/provider defaults.

### Phase 4 — Operations
- Record provider, model, action, latency, status, and token usage where available; never record CV text or personal data.
- Add admin-only runtime configuration only if operators need changes without redeploying. Until then, Wrangler vars/secrets are safer and simpler.
- Document rollback: unset `AI_*` values to return to the existing Groq secret fallback.

## Cloudflare configuration example

```bash
wrangler secret put AI_API_KEY
wrangler secret put GROQ_API_KEY # keep as rollback fallback until migration is proven
wrangler deploy
```

Set non-secret values in `api/wrangler.toml` or with the appropriate environment configuration:

```toml
AI_PROVIDER = "vikey"
AI_BASE_URL = "https://api.vikey.ai/v1"
AI_MODEL = "qwen2.5-72b-instruct"
```

Verify the selected Vikey model and pricing in the Vikey account before production use. Do not commit API keys.

## Non-goals
- No direct provider calls from the browser.
- No automatic provider switching based solely on price without quality and failure tests.
- No persistence of CV contents for AI analytics.
