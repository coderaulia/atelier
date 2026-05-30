-- Migration: Add rate limiting, failed login tracking, and admin audit log tables
-- Run: wrangler d1 execute DB --local --file=./src/db/migrations/002_security_tables.sql

-- Rate limiting table (H1)
CREATE TABLE IF NOT EXISTS rate_limit (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  key         TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_rate_limit_key_window ON rate_limit(key, window_start);

-- Failed login attempts table (H2)
CREATE TABLE IF NOT EXISTS failed_logins (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT NOT NULL,
  ip_address  TEXT NOT NULL,
  attempted_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_failed_logins_email_time ON failed_logins(email, attempted_at);
CREATE INDEX IF NOT EXISTS idx_failed_logins_ip_time ON failed_logins(ip_address, attempted_at);

-- Admin audit log table (H3)
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action      TEXT NOT NULL,
  target_user_id TEXT,
  changes     TEXT,
  ip_address  TEXT,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin ON admin_audit_log(admin_id, created_at);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target ON admin_audit_log(target_user_id, created_at);
