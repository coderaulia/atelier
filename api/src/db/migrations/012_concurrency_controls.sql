-- Optimistic locking, idempotency, and durable payment-claim ownership.
ALTER TABLE users ADD COLUMN version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE checkout_orders ADD COLUMN idempotency_key TEXT;
ALTER TABLE checkout_orders ADD COLUMN snap_token TEXT;
ALTER TABLE checkout_orders ADD COLUMN processing_token TEXT;
ALTER TABLE credit_usage ADD COLUMN idempotency_key TEXT;
ALTER TABLE bug_reports ADD COLUMN version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE bug_reports ADD COLUMN idempotency_key TEXT;
ALTER TABLE announcements ADD COLUMN version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE system_config ADD COLUMN version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE feature_flags ADD COLUMN version INTEGER NOT NULL DEFAULT 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_checkout_orders_user_idempotency
  ON checkout_orders(user_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_checkout_orders_active_purchase
  ON checkout_orders(user_id, purchase_type, product_id) WHERE status IN ('pending', 'processing');
CREATE UNIQUE INDEX IF NOT EXISTS idx_checkout_orders_active_subscription
  ON checkout_orders(user_id) WHERE purchase_type = 'subscription' AND status IN ('pending', 'processing');
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_midtrans_order_unique
  ON transactions(midtrans_order_id) WHERE midtrans_order_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_usage_user_idempotency
  ON credit_usage(user_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_bug_reports_user_idempotency
  ON bug_reports(user_id, idempotency_key) WHERE idempotency_key IS NOT NULL;

-- The ledger insert and credit debit are one SQLite statement. A duplicate
-- idempotency key aborts before it can spend another credit.
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
