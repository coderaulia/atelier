CREATE TABLE IF NOT EXISTS users (
  id          TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email       TEXT    NOT NULL UNIQUE,
  password_hash TEXT  NOT NULL,
  plan        TEXT    NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS sessions (
  token       TEXT    PRIMARY KEY,
  user_id     TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS usage_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tool_id     TEXT    NOT NULL,
  date        TEXT    NOT NULL,
  count       INTEGER NOT NULL DEFAULT 1,
  UNIQUE (user_id, tool_id, date)
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_log_user_date ON usage_log(user_id, date);
