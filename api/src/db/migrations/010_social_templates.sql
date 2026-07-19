-- Runtime Social Templates
-- Admin-authored, data-driven templates for the social generator.
-- Stored as sanitized HTML + CSS + field metadata (JSON); rendered client-side
-- through DOMPurify (authoritative boundary) into the existing export pipeline.

CREATE TABLE IF NOT EXISTS social_templates (
  id           TEXT PRIMARY KEY,               -- slug, e.g. custom-promo-01
  name         TEXT NOT NULL,
  kind         TEXT NOT NULL DEFAULT 'Single', -- Single | Carousel | CTA | News | Photo | Pricing | Social Proof
  category     TEXT,                           -- grouping label in the picker
  width        INTEGER NOT NULL DEFAULT 1080,
  height       INTEGER NOT NULL DEFAULT 1080,
  fields_json  TEXT NOT NULL DEFAULT '[]',     -- JSON array of { key, label, type, placeholder?, hint?, options? }
  html         TEXT NOT NULL DEFAULT '',        -- sanitized body markup with {{token}} placeholders
  css          TEXT NOT NULL DEFAULT '',        -- sanitized/scoped stylesheet
  slides_json  TEXT,                            -- optional: carousel spec (ordered html blocks / repeat)
  html_source  TEXT,                            -- raw author input, kept only for round-trip editing (never rendered)
  css_source   TEXT,
  status       TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'disabled')),
  is_pro       INTEGER NOT NULL DEFAULT 0 CHECK(is_pro IN (0, 1)),
  version      INTEGER NOT NULL DEFAULT 1,
  created_by   TEXT NOT NULL,
  updated_by   TEXT,
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_social_templates_status ON social_templates(status);
CREATE INDEX IF NOT EXISTS idx_social_templates_kind ON social_templates(kind);
