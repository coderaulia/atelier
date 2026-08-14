-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_resets (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash     TEXT    NOT NULL UNIQUE,
  expires_at     INTEGER NOT NULL,
  used           INTEGER NOT NULL DEFAULT 0 CHECK (used IN (0, 1)),
  created_at     INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Email verification tokens
CREATE TABLE IF NOT EXISTS email_verifications (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash     TEXT    NOT NULL UNIQUE,
  expires_at     INTEGER NOT NULL,
  used           INTEGER NOT NULL DEFAULT 0 CHECK (used IN (0, 1)),
  created_at     INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Add email verification status to users
ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0 CHECK (email_verified IN (0, 1));

-- Add billing lifecycle fields to users
ALTER TABLE users ADD COLUMN cancel_at_period_end INTEGER NOT NULL DEFAULT 0 CHECK (cancel_at_period_end IN (0, 1));
ALTER TABLE users ADD COLUMN grace_until INTEGER;
ALTER TABLE users ADD COLUMN midtrans_token_id TEXT;

-- Indexes for token lookups
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires ON password_resets(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token_hash);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires ON email_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_users_grace_until ON users(grace_until);
