-- Content Management: Announcements and Email Template Overrides
-- Supports in-app announcements with targeting and scheduling, plus email template customization

CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK(type IN ('info', 'warning', 'success', 'error')) DEFAULT 'info',
  target TEXT CHECK(target IN ('all', 'free', 'pro')) DEFAULT 'all',
  is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
  start_at INTEGER,
  end_at INTEGER,
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active, start_at, end_at);
CREATE INDEX IF NOT EXISTS idx_announcements_target ON announcements(target);

CREATE TABLE IF NOT EXISTS email_template_overrides (
  template_key TEXT PRIMARY KEY,
  subject TEXT,
  html_body TEXT,
  updated_by TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id)
);
