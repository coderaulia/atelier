-- Bug Reports System
-- Allows users to submit bug reports via app or email
-- Admins can triage, assign, and resolve reports

CREATE TABLE IF NOT EXISTS bug_reports (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  tool_id TEXT,
  severity TEXT CHECK(severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  status TEXT CHECK(status IN ('new', 'in_progress', 'resolved', 'closed', 'wont_fix')) DEFAULT 'new',
  priority INTEGER DEFAULT 0,
  assigned_to TEXT,
  user_agent TEXT,
  browser_info TEXT,
  screenshot_url TEXT,
  source TEXT CHECK(source IN ('app', 'email')) DEFAULT 'app',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  resolved_at INTEGER,
  resolved_by TEXT,
  resolution_notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (resolved_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_severity ON bug_reports(severity);
CREATE INDEX IF NOT EXISTS idx_bug_reports_user_id ON bug_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON bug_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_bug_reports_assigned_to ON bug_reports(assigned_to);

-- Bug report comments/updates
CREATE TABLE IF NOT EXISTS bug_report_comments (
  id TEXT PRIMARY KEY,
  bug_report_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (bug_report_id) REFERENCES bug_reports(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_bug_comments_report ON bug_report_comments(bug_report_id);
CREATE INDEX IF NOT EXISTS idx_bug_comments_created ON bug_report_comments(created_at);
