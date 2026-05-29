CREATE TABLE IF NOT EXISTS users (
  id             TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email          TEXT    NOT NULL UNIQUE,
  password_hash  TEXT    NOT NULL,
  plan           TEXT    NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  role           TEXT    NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status         TEXT    NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'banned')),
  email_verified INTEGER NOT NULL DEFAULT 0 CHECK (email_verified IN (0, 1)),
  name           TEXT,
  pro_expires_at INTEGER,
  cancel_at_period_end INTEGER NOT NULL DEFAULT 0 CHECK (cancel_at_period_end IN (0, 1)),
  grace_until    INTEGER,
  midtrans_token_id TEXT,
  deleted_at     INTEGER,
  last_login     INTEGER,
  created_at     INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS sessions (
  token       TEXT    PRIMARY KEY,
  user_id     TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  INTEGER NOT NULL,
  last_used   INTEGER DEFAULT (unixepoch()),
  user_agent  TEXT
);

CREATE TABLE IF NOT EXISTS password_resets (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash     TEXT    NOT NULL UNIQUE,
  expires_at     INTEGER NOT NULL,
  used           INTEGER NOT NULL DEFAULT 0 CHECK (used IN (0, 1)),
  created_at     INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS email_verifications (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash     TEXT    NOT NULL UNIQUE,
  expires_at     INTEGER NOT NULL,
  used           INTEGER NOT NULL DEFAULT 0 CHECK (used IN (0, 1)),
  created_at     INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS usage_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tool_id     TEXT    NOT NULL,
  date        TEXT    NOT NULL,
  count       INTEGER NOT NULL DEFAULT 1,
  limit_hits  INTEGER NOT NULL DEFAULT 0,
  UNIQUE (user_id, tool_id, date)
);

CREATE TABLE IF NOT EXISTS transactions (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id           TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount            INTEGER NOT NULL DEFAULT 0,
  currency          TEXT NOT NULL DEFAULT 'IDR',
  plan_type         TEXT NOT NULL DEFAULT 'pro',
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('success', 'pending', 'failed')),
  midtrans_order_id TEXT,
  created_at        INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS error_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  tool_id     TEXT NOT NULL,
  error_type  TEXT NOT NULL,
  user_agent  TEXT,
  plan        TEXT CHECK (plan IN ('free', 'pro')),
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_last_used ON sessions(last_used);
CREATE INDEX IF NOT EXISTS idx_usage_log_user_date ON usage_log(user_id, date);
CREATE INDEX IF NOT EXISTS idx_usage_log_tool_date ON usage_log(tool_id, date);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_error_log_created_at ON error_log(created_at);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_users_grace_until ON users(grace_until);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires ON password_resets(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token_hash);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires ON email_verifications(expires_at);
