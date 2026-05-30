-- Credit pack system for one-time purchases
CREATE TABLE IF NOT EXISTS credit_packs (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pack_type       TEXT NOT NULL CHECK (pack_type IN ('cv-10', 'social-50', 'growth-60')),
  credits_total   INTEGER NOT NULL,
  credits_used    INTEGER NOT NULL DEFAULT 0,
  purchased_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  expires_at      INTEGER -- NULL = never expires
);

CREATE INDEX IF NOT EXISTS idx_credit_packs_user ON credit_packs(user_id, credits_used);

-- Track credit usage per export
CREATE TABLE IF NOT EXISTS credit_usage (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pack_id         INTEGER REFERENCES credit_packs(id) ON DELETE SET NULL,
  tool_id         TEXT NOT NULL,
  credits_spent   INTEGER NOT NULL DEFAULT 1,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_credit_usage_user_date ON credit_usage(user_id, created_at);

-- Cloud storage metadata (small JSON payloads only, no files)
CREATE TABLE IF NOT EXISTS cloud_storage (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  storage_key     TEXT NOT NULL, -- e.g., 'brand_kit', 'cv_settings', 'doc_history'
  data_json       TEXT NOT NULL, -- Max 100KB JSON
  size_bytes      INTEGER NOT NULL,
  last_accessed   INTEGER NOT NULL DEFAULT (unixepoch()),
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (user_id, storage_key)
);

CREATE INDEX IF NOT EXISTS idx_cloud_storage_user ON cloud_storage(user_id, last_accessed);

-- Cleanup: delete cloud storage not accessed in 90 days (run via cron)
-- DELETE FROM cloud_storage WHERE last_accessed < unixepoch() - (90 * 24 * 60 * 60);
