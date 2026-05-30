-- Migration: Add anonymous usage tracking
-- Date: 2026-05-30
-- Purpose: Server-side IP-based usage tracking to prevent localStorage bypass

CREATE TABLE IF NOT EXISTS anonymous_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip_address TEXT NOT NULL,
  tool_id TEXT NOT NULL,
  date TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  fingerprint TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (ip_address, tool_id, date)
);

CREATE INDEX IF NOT EXISTS idx_anon_usage_ip_date ON anonymous_usage(ip_address, date);
CREATE INDEX IF NOT EXISTS idx_anon_usage_cleanup ON anonymous_usage(date);
