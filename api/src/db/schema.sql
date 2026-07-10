CREATE TABLE IF NOT EXISTS users (
  id             TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email          TEXT    NOT NULL UNIQUE,
  password_hash  TEXT    NOT NULL,
  plan           TEXT    NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  role           TEXT    NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status         TEXT    NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'banned')),
  email_verified INTEGER NOT NULL DEFAULT 0 CHECK (email_verified IN (0, 1)),
  name           TEXT,
  global_metadata TEXT,
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

CREATE TABLE IF NOT EXISTS rate_limit (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  key           TEXT NOT NULL,
  window_start  INTEGER NOT NULL,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_rate_limit_key_window ON rate_limit(key, window_start);

CREATE TABLE IF NOT EXISTS failed_logins (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL,
  ip_address    TEXT NOT NULL,
  attempted_at  INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_failed_logins_email_time ON failed_logins(email, attempted_at);
CREATE INDEX IF NOT EXISTS idx_failed_logins_ip_time ON failed_logins(ip_address, attempted_at);

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action          TEXT NOT NULL,
  target_user_id  TEXT,
  changes         TEXT,
  ip_address      TEXT,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin ON admin_audit_log(admin_id, created_at);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target ON admin_audit_log(target_user_id, created_at);

-- Bug reports
CREATE TABLE IF NOT EXISTS bug_reports (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  tool_id TEXT,
  severity TEXT CHECK(severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  status TEXT CHECK(status IN ('new', 'in_progress', 'resolved', 'closed', 'wont_fix')) DEFAULT 'new',
  priority INTEGER DEFAULT 0,
  assigned_to TEXT REFERENCES users(id),
  user_agent TEXT,
  browser_info TEXT,
  screenshot_url TEXT,
  source TEXT CHECK(source IN ('app', 'email')) DEFAULT 'app',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  resolved_at INTEGER,
  resolved_by TEXT REFERENCES users(id),
  resolution_notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_severity ON bug_reports(severity);
CREATE INDEX IF NOT EXISTS idx_bug_reports_user_id ON bug_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON bug_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_bug_reports_assigned_to ON bug_reports(assigned_to);

CREATE TABLE IF NOT EXISTS bug_report_comments (
  id TEXT PRIMARY KEY,
  bug_report_id TEXT NOT NULL REFERENCES bug_reports(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  comment TEXT NOT NULL,
  is_internal INTEGER DEFAULT 0 CHECK(is_internal IN (0, 1)),
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_bug_comments_report ON bug_report_comments(bug_report_id);
CREATE INDEX IF NOT EXISTS idx_bug_comments_created ON bug_report_comments(created_at);

CREATE TABLE IF NOT EXISTS admin_notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT CHECK(severity IN ('info', 'warning', 'critical')) DEFAULT 'info',
  link TEXT,
  is_read INTEGER DEFAULT 0 CHECK(is_read IN (0, 1)),
  created_at INTEGER NOT NULL,
  read_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_admin_notif_unread ON admin_notifications(is_read, created_at);
CREATE INDEX IF NOT EXISTS idx_admin_notif_type ON admin_notifications(type);

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
