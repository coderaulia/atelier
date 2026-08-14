-- System Configuration & Feature Flags
-- Supports admin-managed platform settings, rate limits, feature rollout, and maintenance controls

CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  type TEXT CHECK(type IN ('string', 'number', 'boolean', 'json')) DEFAULT 'string',
  description TEXT,
  updated_at INTEGER NOT NULL,
  updated_by TEXT,
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS feature_flags (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN DEFAULT 0,
  description TEXT,
  rollout_percentage INTEGER DEFAULT 100,
  user_whitelist TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  updated_by TEXT,
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS health_metrics (
  id TEXT PRIMARY KEY,
  metric_type TEXT NOT NULL,
  value REAL NOT NULL,
  timestamp INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_health_metrics_type ON health_metrics(metric_type, timestamp);

-- Default system config values
INSERT OR IGNORE INTO system_config (key, value, type, description, updated_at) VALUES
  ('maintenance_mode', 'false', 'boolean', 'Disable user-facing app access during maintenance', unixepoch()),
  ('free_daily_limit', '5', 'number', 'Default daily usage limit for free users', unixepoch()),
  ('pro_daily_limit', 'null', 'string', 'Daily usage limit for Pro users; null means unlimited', unixepoch()),
  ('support_email', 'support@vanailadigital.com', 'string', 'Support contact email displayed to users', unixepoch()),
  ('refund_usage_threshold', '5', 'number', 'Manual refund warning threshold by total tool uses', unixepoch()),
  ('critical_bug_notify', 'true', 'boolean', 'Notify admins for critical bug reports', unixepoch());

-- Default feature flags
INSERT OR IGNORE INTO feature_flags (key, enabled, description, rollout_percentage, created_at, updated_at) VALUES
  ('document_generator', 1, 'Enable Document Generator tool', 100, unixepoch(), unixepoch()),
  ('social_generator', 1, 'Enable Social Generator tool', 100, unixepoch(), unixepoch()),
  ('cv_builder', 1, 'Enable CV Builder tool', 100, unixepoch(), unixepoch()),
  ('pdf_tools', 1, 'Enable PDF tool category', 100, unixepoch(), unixepoch()),
  ('image_converter', 1, 'Enable Image Converter tool', 100, unixepoch(), unixepoch()),
  ('ocr', 1, 'Enable OCR tool', 100, unixepoch(), unixepoch()),
  ('admin_notifications', 1, 'Enable admin notification center', 100, unixepoch(), unixepoch());
