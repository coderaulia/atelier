-- Geo analytics support
-- Captures daily user country from Cloudflare CF-IPCountry header during authenticated requests

CREATE TABLE IF NOT EXISTS user_geo_daily (
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  country_code TEXT NOT NULL DEFAULT 'XX',
  last_seen INTEGER NOT NULL,
  PRIMARY KEY (user_id, date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_geo_daily_country ON user_geo_daily(country_code, date);
CREATE INDEX IF NOT EXISTS idx_user_geo_daily_date ON user_geo_daily(date);
