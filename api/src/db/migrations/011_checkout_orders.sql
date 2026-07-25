-- Bind payment callbacks to checkout data created by the authenticated server.
CREATE TABLE IF NOT EXISTS checkout_orders (
  order_id       TEXT PRIMARY KEY,
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purchase_type  TEXT NOT NULL CHECK (purchase_type IN ('subscription', 'pack')),
  product_id     TEXT NOT NULL,
  amount         INTEGER NOT NULL CHECK (amount > 0),
  currency       TEXT NOT NULL DEFAULT 'IDR',
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'processed', 'failed')),
  created_at     INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at     INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_checkout_orders_user_date ON checkout_orders(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_checkout_orders_status ON checkout_orders(status, updated_at);
