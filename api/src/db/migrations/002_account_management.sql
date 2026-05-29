-- Account management fields
ALTER TABLE users ADD COLUMN name TEXT;
ALTER TABLE users ADD COLUMN deleted_at INTEGER;

-- Session tracking
ALTER TABLE sessions ADD COLUMN last_used INTEGER DEFAULT (unixepoch());
ALTER TABLE sessions ADD COLUMN user_agent TEXT;

CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_sessions_last_used ON sessions(last_used);
