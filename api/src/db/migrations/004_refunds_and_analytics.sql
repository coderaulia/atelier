-- Refunds System
-- Track refund requests with approval workflow
-- Track usage count to enforce refund policy (no refund if used 5+ times)

CREATE TABLE IF NOT EXISTS refunds (
  id TEXT PRIMARY KEY,
  transaction_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'IDR',
  reason TEXT NOT NULL,
  status TEXT CHECK(status IN ('pending', 'approved', 'rejected', 'completed')) DEFAULT 'pending',
  usage_count INTEGER DEFAULT 0, -- Total tool uses at time of request
  requested_at INTEGER NOT NULL,
  processed_at INTEGER,
  processed_by TEXT,
  notes TEXT,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (processed_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
CREATE INDEX IF NOT EXISTS idx_refunds_user ON refunds(user_id);
CREATE INDEX IF NOT EXISTS idx_refunds_transaction ON refunds(transaction_id);

-- Subscription events for lifecycle tracking
CREATE TABLE IF NOT EXISTS subscription_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'created', 'renewed', 'cancelled', 'expired', 'grace_period', 'downgraded'
  plan TEXT NOT NULL,
  metadata TEXT, -- JSON
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_sub_events_user ON subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_sub_events_type ON subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_sub_events_created ON subscription_events(created_at);

-- Analytics cache for expensive queries
CREATE TABLE IF NOT EXISTS analytics_cache (
  metric_key TEXT PRIMARY KEY,
  metric_value TEXT NOT NULL, -- JSON
  computed_at INTEGER NOT NULL
);

-- User sessions for tracking active users (optional, for DAU/MAU)
CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_date TEXT NOT NULL, -- YYYY-MM-DD
  last_activity INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_sessions_unique ON user_sessions(user_id, session_date);
CREATE INDEX IF NOT EXISTS idx_user_sessions_date ON user_sessions(session_date);

-- Admin notifications
CREATE TABLE IF NOT EXISTS admin_notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'bug_report', 'refund_request', 'payment_failed', 'system_alert'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT CHECK(severity IN ('info', 'warning', 'critical')) DEFAULT 'info',
  link TEXT, -- URL to relevant admin page
  is_read BOOLEAN DEFAULT 0,
  created_at INTEGER NOT NULL,
  read_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_admin_notif_unread ON admin_notifications(is_read, created_at);
CREATE INDEX IF NOT EXISTS idx_admin_notif_type ON admin_notifications(type);
