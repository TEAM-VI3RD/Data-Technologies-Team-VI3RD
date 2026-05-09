-- Add password_hash to users table for authentication.
-- Temporary DEFAULT '' allows the ALTER to run even if rows exist,
-- then the default is dropped so future inserts must always supply a hash.
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE users ALTER COLUMN password_hash DROP DEFAULT;
