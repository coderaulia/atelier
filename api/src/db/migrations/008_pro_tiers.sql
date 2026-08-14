-- Recurring Pro tiers (starter/pro/business) — 'plan' stays the binary
-- free/pro entitlement gate; 'pro_tier' only decides price + daily limit.
ALTER TABLE users ADD COLUMN pro_tier TEXT CHECK (pro_tier IN ('starter', 'pro', 'business'));

CREATE INDEX IF NOT EXISTS idx_users_pro_tier ON users(pro_tier) WHERE pro_tier IS NOT NULL;
