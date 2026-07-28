-- Query indexes, aggregate-cache invalidation, and efficient scheduled cleanup.
CREATE INDEX IF NOT EXISTS idx_transactions_status_created ON transactions(status, created_at);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_plan_created ON users(plan, created_at);
CREATE INDEX IF NOT EXISTS idx_users_plan_expiry ON users(plan, pro_expires_at);
CREATE INDEX IF NOT EXISTS idx_users_subscription_listing ON users(plan, cancel_at_period_end, deleted_at, pro_expires_at);
CREATE INDEX IF NOT EXISTS idx_usage_log_date_tool ON usage_log(date, tool_id);
CREATE INDEX IF NOT EXISTS idx_credit_packs_available_by_type ON credit_packs(user_id, pack_type, purchased_at) WHERE credits_used < credits_total;
CREATE INDEX IF NOT EXISTS idx_sessions_user_last_used ON sessions(user_id, last_used DESC);
CREATE INDEX IF NOT EXISTS idx_bug_reports_tool ON bug_reports(tool_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status_priority_created ON bug_reports(status, priority DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bug_reports_severity_priority_created ON bug_reports(severity, priority DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bug_reports_tool_priority_created ON bug_reports(tool_id, priority DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bug_comments_report_created ON bug_report_comments(bug_report_id, created_at);
CREATE INDEX IF NOT EXISTS idx_refunds_status_requested ON refunds(status, requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created ON admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action_created ON admin_audit_log(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_templates_status_updated ON social_templates(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_failed_logins_attempted ON failed_logins(attempted_at);
CREATE INDEX IF NOT EXISTS idx_rate_limit_window ON rate_limit(window_start);
CREATE INDEX IF NOT EXISTS idx_anonymous_usage_created ON anonymous_usage(created_at);

-- Aggregate reads are cached briefly; clear them as soon as source data changes.
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
