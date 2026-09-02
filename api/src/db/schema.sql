-- Atelier by Vanaila Studio — Canonical D1 Database Schema
-- Consolidates base schema + migrations 001-013.

-- Users and Auth
CREATE TABLE IF NOT EXISTS users (
  id                   TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email                TEXT    NOT NULL UNIQUE,
  password_hash        TEXT    NOT NULL,
  plan                 TEXT    NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  pro_tier             TEXT    CHECK (pro_tier IN ('starter', 'pro', 'business')),
  role                 TEXT    NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status               TEXT    NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'banned')),
  email_verified       INTEGER NOT NULL DEFAULT 0 CHECK (email_verified IN (0, 1)),
  name                 TEXT,
  global_metadata      TEXT,
  pro_expires_at       INTEGER,
  cancel_at_period_end INTEGER NOT NULL DEFAULT 0 CHECK (cancel_at_period_end IN (0, 1)),
  grace_until          INTEGER,
  midtrans_token_id    TEXT,
  deleted_at           INTEGER,
  last_login           INTEGER,
  version              INTEGER NOT NULL DEFAULT 1,
  created_at           INTEGER NOT NULL DEFAULT (unixepoch())
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

-- Better Auth core tables for D1/SQLite
CREATE TABLE IF NOT EXISTS user (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  emailVerified INTEGER NOT NULL DEFAULT 0,
  name          TEXT,
  image         TEXT,
  createdAt     INTEGER NOT NULL,
  updatedAt     INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS session (
  id        TEXT PRIMARY KEY,
  userId    TEXT NOT NULL,
  expiresAt INTEGER NOT NULL,
  token     TEXT NOT NULL UNIQUE,
  ipAddress TEXT,
  userAgent TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS account (
  id           TEXT PRIMARY KEY,
  userId       TEXT NOT NULL,
  accountId    TEXT NOT NULL,
  providerId   TEXT NOT NULL,
  accessToken  TEXT,
  refreshToken TEXT,
  idToken      TEXT,
  expiresAt    INTEGER,
  password     TEXT,
  scope        TEXT,
  tokenType    TEXT,
  createdAt    INTEGER NOT NULL,
  updatedAt    INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS verification (
  id         TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value      TEXT NOT NULL,
  expiresAt  INTEGER NOT NULL,
  createdAt  INTEGER NOT NULL,
  updatedAt  INTEGER
);

-- Usage & Limits
CREATE TABLE IF NOT EXISTS usage_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tool_id     TEXT    NOT NULL,
  date        TEXT    NOT NULL,
  count       INTEGER NOT NULL DEFAULT 1,
  limit_hits  INTEGER NOT NULL DEFAULT 0,
  UNIQUE (user_id, tool_id, date)
);

CREATE TABLE IF NOT EXISTS anonymous_usage (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ip_address  TEXT NOT NULL,
  tool_id     TEXT NOT NULL,
  date        TEXT NOT NULL,
  count       INTEGER NOT NULL DEFAULT 1,
  fingerprint TEXT,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (ip_address, tool_id, date)
);

-- Billing & Transactions
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

CREATE TABLE IF NOT EXISTS checkout_orders (
  order_id         TEXT PRIMARY KEY,
  user_id          TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purchase_type    TEXT NOT NULL CHECK (purchase_type IN ('subscription', 'pack')),
  product_id       TEXT NOT NULL,
  amount           INTEGER NOT NULL CHECK (amount > 0),
  currency         TEXT NOT NULL DEFAULT 'IDR',
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'processed', 'failed')),
  idempotency_key  TEXT,
  snap_token       TEXT,
  processing_token TEXT,
  created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at       INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS refunds (
  id             TEXT PRIMARY KEY,
  transaction_id TEXT NOT NULL,
  user_id        TEXT NOT NULL,
  amount         INTEGER NOT NULL,
  currency       TEXT DEFAULT 'IDR',
  reason         TEXT NOT NULL,
  status         TEXT CHECK(status IN ('pending', 'approved', 'rejected', 'completed')) DEFAULT 'pending',
  usage_count    INTEGER DEFAULT 0,
  requested_at   INTEGER NOT NULL,
  processed_at   INTEGER,
  processed_by   TEXT,
  notes          TEXT,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (processed_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS subscription_events (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  event_type TEXT NOT NULL,
  plan       TEXT NOT NULL,
  metadata   TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Credit Packs
CREATE TABLE IF NOT EXISTS credit_packs (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pack_type     TEXT NOT NULL CHECK (pack_type IN ('cv-10', 'social-50', 'growth-60')),
  credits_total INTEGER NOT NULL,
  credits_used  INTEGER NOT NULL DEFAULT 0,
  purchased_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  expires_at    INTEGER
);

CREATE TABLE IF NOT EXISTS credit_usage (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pack_id         INTEGER REFERENCES credit_packs(id) ON DELETE SET NULL,
  tool_id         TEXT NOT NULL,
  credits_spent   INTEGER NOT NULL DEFAULT 1,
  idempotency_key TEXT,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS cloud_storage (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  storage_key   TEXT NOT NULL,
  data_json     TEXT NOT NULL,
  size_bytes    INTEGER NOT NULL,
  last_accessed INTEGER NOT NULL DEFAULT (unixepoch()),
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (user_id, storage_key)
);

-- Security & Audit
CREATE TABLE IF NOT EXISTS rate_limit (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  key          TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS failed_logins (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  email        TEXT NOT NULL,
  ip_address   TEXT NOT NULL,
  attempted_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action         TEXT NOT NULL,
  target_user_id TEXT,
  changes        TEXT,
  ip_address     TEXT,
  created_at     INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS error_log (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  tool_id    TEXT NOT NULL,
  error_type TEXT NOT NULL,
  user_agent TEXT,
  plan       TEXT CHECK (plan IN ('free', 'pro')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Bug Reports
CREATE TABLE IF NOT EXISTS bug_reports (
  id               TEXT PRIMARY KEY,
  user_id          TEXT REFERENCES users(id),
  email            TEXT NOT NULL,
  subject          TEXT NOT NULL,
  description      TEXT NOT NULL,
  tool_id          TEXT,
  severity         TEXT CHECK(severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  status           TEXT CHECK(status IN ('new', 'in_progress', 'resolved', 'closed', 'wont_fix')) DEFAULT 'new',
  priority         INTEGER DEFAULT 0,
  assigned_to      TEXT REFERENCES users(id),
  user_agent       TEXT,
  browser_info     TEXT,
  screenshot_url   TEXT,
  source           TEXT CHECK(source IN ('app', 'email')) DEFAULT 'app',
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL,
  resolved_at      INTEGER,
  resolved_by      TEXT REFERENCES users(id),
  resolution_notes TEXT,
  version          INTEGER NOT NULL DEFAULT 1,
  idempotency_key  TEXT
);

CREATE TABLE IF NOT EXISTS bug_report_comments (
  id            TEXT PRIMARY KEY,
  bug_report_id TEXT NOT NULL REFERENCES bug_reports(id) ON DELETE CASCADE,
  user_id       TEXT NOT NULL REFERENCES users(id),
  comment       TEXT NOT NULL,
  is_internal   INTEGER DEFAULT 0 CHECK(is_internal IN (0, 1)),
  created_at    INTEGER NOT NULL
);

-- Admin & System
CREATE TABLE IF NOT EXISTS admin_notifications (
  id         TEXT PRIMARY KEY,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  severity   TEXT CHECK(severity IN ('info', 'warning', 'critical')) DEFAULT 'info',
  link       TEXT,
  is_read    INTEGER DEFAULT 0 CHECK(is_read IN (0, 1)),
  created_at INTEGER NOT NULL,
  read_at    INTEGER
);

CREATE TABLE IF NOT EXISTS system_config (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  type        TEXT CHECK(type IN ('string', 'number', 'boolean', 'json')) DEFAULT 'string',
  description TEXT,
  version     INTEGER NOT NULL DEFAULT 1,
  updated_at  INTEGER NOT NULL,
  updated_by  TEXT,
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS feature_flags (
  key                TEXT PRIMARY KEY,
  enabled            INTEGER DEFAULT 0 CHECK(enabled IN (0, 1)),
  description        TEXT,
  rollout_percentage INTEGER DEFAULT 100,
  user_whitelist     TEXT,
  version            INTEGER NOT NULL DEFAULT 1,
  created_at         INTEGER NOT NULL,
  updated_at         INTEGER NOT NULL,
  updated_by         TEXT,
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS health_metrics (
  id          TEXT PRIMARY KEY,
  metric_type TEXT NOT NULL,
  value       REAL NOT NULL,
  timestamp   INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS user_geo_daily (
  user_id      TEXT NOT NULL,
  date         TEXT NOT NULL,
  country_code TEXT NOT NULL DEFAULT 'XX',
  last_seen    INTEGER NOT NULL,
  PRIMARY KEY (user_id, date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS analytics_cache (
  metric_key   TEXT PRIMARY KEY,
  metric_value TEXT NOT NULL,
  computed_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL,
  session_date  TEXT NOT NULL,
  last_activity INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Content Management
CREATE TABLE IF NOT EXISTS announcements (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  type       TEXT CHECK(type IN ('info', 'warning', 'success', 'error')) DEFAULT 'info',
  target     TEXT CHECK(target IN ('all', 'free', 'pro')) DEFAULT 'all',
  is_active  INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
  start_at   INTEGER,
  end_at     INTEGER,
  version    INTEGER NOT NULL DEFAULT 1,
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS email_template_overrides (
  template_key TEXT PRIMARY KEY,
  subject      TEXT,
  html_body    TEXT,
  updated_by   TEXT NOT NULL,
  updated_at   INTEGER NOT NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS social_templates (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  kind        TEXT NOT NULL DEFAULT 'Single',
  category    TEXT,
  width       INTEGER NOT NULL DEFAULT 1080,
  height      INTEGER NOT NULL DEFAULT 1080,
  fields_json TEXT NOT NULL DEFAULT '[]',
  html        TEXT NOT NULL DEFAULT '',
  css         TEXT NOT NULL DEFAULT '',
  slides_json TEXT,
  html_source TEXT,
  css_source  TEXT,
  status      TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'disabled')),
  is_pro      INTEGER NOT NULL DEFAULT 0 CHECK(is_pro IN (0, 1)),
  version     INTEGER NOT NULL DEFAULT 1,
  created_by  TEXT NOT NULL,
  updated_by  TEXT,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_users_grace_until ON users(grace_until);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_plan_created ON users(plan, created_at);
CREATE INDEX IF NOT EXISTS idx_users_plan_expiry ON users(plan, pro_expires_at);
CREATE INDEX IF NOT EXISTS idx_users_pro_tier ON users(pro_tier) WHERE pro_tier IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_subscription_listing ON users(plan, cancel_at_period_end, deleted_at, pro_expires_at);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_last_used ON sessions(last_used);
CREATE INDEX IF NOT EXISTS idx_sessions_user_last_used ON sessions(user_id, last_used DESC);

CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires ON password_resets(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token_hash);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires ON email_verifications(expires_at);

CREATE INDEX IF NOT EXISTS idx_session_userId ON session(userId);
CREATE INDEX IF NOT EXISTS idx_session_token ON session(token);
CREATE INDEX IF NOT EXISTS idx_account_userId ON account(userId);
CREATE INDEX IF NOT EXISTS idx_verification_identifier ON verification(identifier);

CREATE INDEX IF NOT EXISTS idx_usage_log_user_date ON usage_log(user_id, date);
CREATE INDEX IF NOT EXISTS idx_usage_log_tool_date ON usage_log(tool_id, date);
CREATE INDEX IF NOT EXISTS idx_usage_log_date_tool ON usage_log(date, tool_id);

CREATE INDEX IF NOT EXISTS idx_anon_usage_ip_date ON anonymous_usage(ip_address, date);
CREATE INDEX IF NOT EXISTS idx_anon_usage_cleanup ON anonymous_usage(date);
CREATE INDEX IF NOT EXISTS idx_anonymous_usage_created ON anonymous_usage(created_at);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_status_created ON transactions(status, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_midtrans_order_unique ON transactions(midtrans_order_id) WHERE midtrans_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_checkout_orders_user_date ON checkout_orders(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_checkout_orders_status ON checkout_orders(status, updated_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_checkout_orders_user_idempotency ON checkout_orders(user_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_checkout_orders_active_purchase ON checkout_orders(user_id, purchase_type, product_id) WHERE status IN ('pending', 'processing');
CREATE UNIQUE INDEX IF NOT EXISTS idx_checkout_orders_active_subscription ON checkout_orders(user_id) WHERE purchase_type = 'subscription' AND status IN ('pending', 'processing');

CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
CREATE INDEX IF NOT EXISTS idx_refunds_user ON refunds(user_id);
CREATE INDEX IF NOT EXISTS idx_refunds_transaction ON refunds(transaction_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status_requested ON refunds(status, requested_at DESC);

CREATE INDEX IF NOT EXISTS idx_sub_events_user ON subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_sub_events_type ON subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_sub_events_created ON subscription_events(created_at);

CREATE INDEX IF NOT EXISTS idx_credit_packs_user ON credit_packs(user_id, credits_used);
CREATE INDEX IF NOT EXISTS idx_credit_packs_available_by_type ON credit_packs(user_id, pack_type, purchased_at) WHERE credits_used < credits_total;
CREATE INDEX IF NOT EXISTS idx_credit_usage_user_date ON credit_usage(user_id, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_usage_user_idempotency ON credit_usage(user_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cloud_storage_user ON cloud_storage(user_id, last_accessed);

CREATE INDEX IF NOT EXISTS idx_rate_limit_key_window ON rate_limit(key, window_start);
CREATE INDEX IF NOT EXISTS idx_rate_limit_window ON rate_limit(window_start);

CREATE INDEX IF NOT EXISTS idx_failed_logins_email_time ON failed_logins(email, attempted_at);
CREATE INDEX IF NOT EXISTS idx_failed_logins_ip_time ON failed_logins(ip_address, attempted_at);
CREATE INDEX IF NOT EXISTS idx_failed_logins_attempted ON failed_logins(attempted_at);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin ON admin_audit_log(admin_id, created_at);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target ON admin_audit_log(target_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created ON admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action_created ON admin_audit_log(action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_error_log_created_at ON error_log(created_at);

CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_severity ON bug_reports(severity);
CREATE INDEX IF NOT EXISTS idx_bug_reports_user_id ON bug_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON bug_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_bug_reports_assigned_to ON bug_reports(assigned_to);
CREATE INDEX IF NOT EXISTS idx_bug_reports_tool ON bug_reports(tool_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status_priority_created ON bug_reports(status, priority DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bug_reports_severity_priority_created ON bug_reports(severity, priority DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bug_reports_tool_priority_created ON bug_reports(tool_id, priority DESC, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bug_reports_user_idempotency ON bug_reports(user_id, idempotency_key) WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_bug_comments_report ON bug_report_comments(bug_report_id);
CREATE INDEX IF NOT EXISTS idx_bug_comments_created ON bug_report_comments(created_at);
CREATE INDEX IF NOT EXISTS idx_bug_comments_report_created ON bug_report_comments(bug_report_id, created_at);

CREATE INDEX IF NOT EXISTS idx_admin_notif_unread ON admin_notifications(is_read, created_at);
CREATE INDEX IF NOT EXISTS idx_admin_notif_type ON admin_notifications(type);

CREATE INDEX IF NOT EXISTS idx_health_metrics_type ON health_metrics(metric_type, timestamp);

CREATE INDEX IF NOT EXISTS idx_user_geo_daily_country ON user_geo_daily(country_code, date);
CREATE INDEX IF NOT EXISTS idx_user_geo_daily_date ON user_geo_daily(date);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_sessions_unique ON user_sessions(user_id, session_date);
CREATE INDEX IF NOT EXISTS idx_user_sessions_date ON user_sessions(session_date);

CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active, start_at, end_at);
CREATE INDEX IF NOT EXISTS idx_announcements_target ON announcements(target);

CREATE INDEX IF NOT EXISTS idx_social_templates_status ON social_templates(status);
CREATE INDEX IF NOT EXISTS idx_social_templates_kind ON social_templates(kind);
CREATE INDEX IF NOT EXISTS idx_social_templates_status_updated ON social_templates(status, updated_at DESC);

-- Triggers
CREATE TRIGGER IF NOT EXISTS credit_usage_debit
BEFORE INSERT ON credit_usage
FOR EACH ROW
BEGIN
  UPDATE credit_packs
  SET credits_used = credits_used + NEW.credits_spent
  WHERE id = NEW.pack_id
    AND user_id = NEW.user_id
    AND credits_used + NEW.credits_spent <= credits_total;
  SELECT CASE WHEN changes() = 0 THEN RAISE(ABORT, 'credit pack exhausted') END;
END;

CREATE TRIGGER IF NOT EXISTS invalidate_analytics_users_insert AFTER INSERT ON users BEGIN DELETE FROM analytics_cache; END;
CREATE TRIGGER IF NOT EXISTS invalidate_analytics_users_update AFTER UPDATE ON users BEGIN DELETE FROM analytics_cache; END;
CREATE TRIGGER IF NOT EXISTS invalidate_analytics_users_delete AFTER DELETE ON users BEGIN DELETE FROM analytics_cache; END;
CREATE TRIGGER IF NOT EXISTS invalidate_analytics_transactions_insert AFTER INSERT ON transactions BEGIN DELETE FROM analytics_cache; END;
CREATE TRIGGER IF NOT EXISTS invalidate_analytics_transactions_update AFTER UPDATE ON transactions BEGIN DELETE FROM analytics_cache; END;
CREATE TRIGGER IF NOT EXISTS invalidate_analytics_transactions_delete AFTER DELETE ON transactions BEGIN DELETE FROM analytics_cache; END;
CREATE TRIGGER IF NOT EXISTS invalidate_analytics_usage_insert AFTER INSERT ON usage_log BEGIN DELETE FROM analytics_cache; END;
CREATE TRIGGER IF NOT EXISTS invalidate_analytics_usage_update AFTER UPDATE ON usage_log BEGIN DELETE FROM analytics_cache; END;
CREATE TRIGGER IF NOT EXISTS invalidate_analytics_usage_delete AFTER DELETE ON usage_log BEGIN DELETE FROM analytics_cache; END;
CREATE TRIGGER IF NOT EXISTS invalidate_analytics_geo_insert AFTER INSERT ON user_geo_daily BEGIN DELETE FROM analytics_cache; END;
CREATE TRIGGER IF NOT EXISTS invalidate_analytics_geo_update AFTER UPDATE ON user_geo_daily BEGIN DELETE FROM analytics_cache; END;
CREATE TRIGGER IF NOT EXISTS invalidate_analytics_geo_delete AFTER DELETE ON user_geo_daily BEGIN DELETE FROM analytics_cache; END;

-- Seeds
INSERT OR IGNORE INTO system_config (key, value, type, description, updated_at) VALUES
  ('maintenance_mode', 'false', 'boolean', 'Disable user-facing app access during maintenance', unixepoch()),
  ('free_daily_limit', '5', 'number', 'Default daily usage limit for free users', unixepoch()),
  ('pro_daily_limit', 'null', 'string', 'Daily usage limit for Pro users; null means unlimited', unixepoch()),
  ('support_email', 'support@vanailadigital.com', 'string', 'Support contact email displayed to users', unixepoch()),
  ('refund_usage_threshold', '5', 'number', 'Manual refund warning threshold by total tool uses', unixepoch()),
  ('critical_bug_notify', 'true', 'boolean', 'Notify admins for critical bug reports', unixepoch());

INSERT OR IGNORE INTO feature_flags (key, enabled, description, rollout_percentage, created_at, updated_at) VALUES
  ('document_generator', 1, 'Enable Document Generator tool', 100, unixepoch(), unixepoch()),
  ('social_generator', 1, 'Enable Social Generator tool', 100, unixepoch(), unixepoch()),
  ('cv_builder', 1, 'Enable CV Builder tool', 100, unixepoch(), unixepoch()),
  ('pdf_tools', 1, 'Enable PDF tool category', 100, unixepoch(), unixepoch()),
  ('image_converter', 1, 'Enable Image Converter tool', 100, unixepoch(), unixepoch()),
  ('ocr', 1, 'Enable OCR tool', 100, unixepoch(), unixepoch()),
  ('admin_notifications', 1, 'Enable admin notification center', 100, unixepoch(), unixepoch());

-- Migration 014: Documents Table
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

