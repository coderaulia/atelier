-- Migration 014: Documents Persistence Table
CREATE TABLE IF NOT EXISTS documents (
  id             TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id        TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doc_type       TEXT    NOT NULL,
  ref_no         TEXT,
  title          TEXT,
  client_name    TEXT,
  doc_date       TEXT,
  total_amount   REAL    DEFAULT 0,
  currency       TEXT    DEFAULT 'USD',
  status         TEXT    NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'final')),
  data_json      TEXT    NOT NULL,
  variant        TEXT    DEFAULT 'classic',
  created_at     INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at     INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_documents_user_type ON documents(user_id, doc_type);
CREATE INDEX IF NOT EXISTS idx_documents_user_created ON documents(user_id, created_at DESC);
