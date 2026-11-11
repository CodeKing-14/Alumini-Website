-- =============================================================================
-- Migration: Support Google OAuth in SRIT Alumni Website (MySQL)
-- Database: alumni_db
-- =============================================================================
-- This migration updates the `users` table to support Google OAuth 2.0 authentication:
-- 1. Makes `password_hash` nullable so OAuth users without passwords can be stored.
-- 2. Adds `google_id` (Google Subject ID `sub`) to identify returning OAuth users.
-- 3. Adds `auth_provider` to track whether an account is 'local' or 'google'.
-- =============================================================================

USE alumni_db;

-- 1. Make password_hash NULLABLE (so Google sign-in accounts don't require passwords)
ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(255) NULL;

-- 2. Add google_id column for storing Google OAuth Subject ID
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) NULL;

-- 3. Add auth_provider column ('local' for email/password, 'google' for OAuth)
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) NOT NULL DEFAULT 'local';

-- 4. Create an index on google_id for fast lookup during OAuth callbacks
SET @dbname = DATABASE();
SET @tablename = "users";
SET @indexname = "idx_users_google_id";
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
        WHERE table_schema = @dbname
          AND table_name = @tablename
          AND index_name = @indexname
    ) > 0,
    "SELECT 'Index already exists' AS status;",
    "CREATE UNIQUE INDEX idx_users_google_id ON users (google_id);"
));
PREPARE createIndexStmt FROM @preparedStatement;
EXECUTE createIndexStmt;
DEALLOCATE PREPARE createIndexStmt;

-- 5. Create index on auth_provider
SET @indexname = "idx_users_auth_provider";
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
        WHERE table_schema = @dbname
          AND table_name = @tablename
          AND index_name = @indexname
    ) > 0,
    "SELECT 'Index already exists' AS status;",
    "CREATE INDEX idx_users_auth_provider ON users (auth_provider);"
));
PREPARE createIndexStmt FROM @preparedStatement;
EXECUTE createIndexStmt;
DEALLOCATE PREPARE createIndexStmt;

