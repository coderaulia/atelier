# Flow Test Scripts

Zero-dependency live API checks for main Atelier flows.

## Start API

From `api/`:

```bash
npm run dev
```

Default Wrangler URL: `http://localhost:8787`.

## Run main flow tests

From project root:

```bash
npm run test:flows
```

Custom target or credentials:

```bash
API_BASE_URL=http://localhost:8787 \
TEST_EMAIL=qa@example.com \
TEST_PASSWORD='Password123!' \
npm run test:flows
```

## Optional admin checks

Admin flow runs only when credentials exist:

```bash
ADMIN_EMAIL=admin@example.com \
ADMIN_PASSWORD='Password123!' \
npm run test:flows
```

## Optional billing webhook check

Webhook signature test runs only when local env matches API env:

```bash
MIDTRANS_SERVER_KEY='same-key-used-by-api' npm run test:flows
```

## Covered flows

- Health endpoint
- Register, login, `/auth/me`
- Profile update
- Sessions list
- Missing/invalid token rejection
- Usage limit check and daily cap enforcement
- Usage history
- Bug report validation and submit
- Billing status, transactions, cancel guard
- Error logging
- Optional admin stats/users/notifications
- Optional Midtrans webhook signature
- Logout/session invalidation

## Notes

- Tests create real users in target database.
- Use local D1/wrangler for safe repeat runs.
- Script avoids destructive account deletion.
- Email verification token cannot be asserted without DB/email access.
