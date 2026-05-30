# Performance & Security Overhaul

## FE Speed
1. Remove global CSS imports from main.tsx → module CSS already self-imported
2. Lazy import JSZip in ImageConverterTool (currently sync import)
3. Lazy import marked/dompurify/html-to-image in documents/utils.tsx
4. Code-split landing.css + tool-landing.css (only import in pages that need them)
5. Add manualChunks + build optimizations in vite config

## FE Security (localStorage manipulation)
6. useToolLimit: Remove localStorage usage tracking for authed users (server is source of truth)
7. Documents module: Add integrity check on localStorage reads
8. SidebarGroup: Clear/untrustworthy — just UI state, low risk

## BE DDoS + Race Conditions  
9. Global rate-limit middleware (IP-based, 100 req/min first layer)
10. Atomic UPSERT for usage counter (fix race condition in usage.ts POST)
11. Webhook idempotency (dedup via order_id + transaction_status)
12. Add rate limiting to all unprotected routes (admin, usage, billing, bug-reports)
13. Body size limits on all POST routes
14. Add cleanup mechanism for rate_limit table
