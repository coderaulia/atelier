# Commit Log

## 2026-05-29

- Added internal admin dashboard routes and UI.
- Added D1 role/status/pro expiration/last login fields.
- Added transactions and error_log tables.
- Added Workers admin middleware and admin API routes.
- Added tool error logging endpoint.
- Updated project docs to match current repo state.

## 2026-05-29 — Account management

- Added `/account` user-facing settings page.
- Added Profile, Subscription, Usage, Security tabs.
- Added auth endpoints for profile, password, sessions, soft-delete.
- Added billing endpoints for cancel/reactivate/transactions/receipt.
- Added `/receipt/:transaction_id` route.
- Added account management D1 migration.
