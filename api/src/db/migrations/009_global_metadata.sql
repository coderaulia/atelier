-- Add durable user-level metadata for document and social generators.
ALTER TABLE users ADD COLUMN global_metadata TEXT;
