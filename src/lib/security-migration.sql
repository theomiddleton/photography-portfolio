/*
  Security improvements for user authentication system:
  1. Add unique constraint on email field
  2. Add indexes for performance and security
  3. Improve column types for better security
*/

-- Ensure email uniqueness (if not already unique)
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS pp_users_email_unique ON pp_users(email);

-- Add indexes for performance on auth queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS pp_users_email_idx ON pp_users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS pp_users_role_idx ON pp_users(role);

-- Add security-related fields for future use
ALTER TABLE pp_users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE pp_users ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP;
ALTER TABLE pp_users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
ALTER TABLE pp_users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP DEFAULT NOW();

-- Ensure role is properly constrained
ALTER TABLE pp_users ADD CONSTRAINT IF NOT EXISTS pp_users_role_check CHECK (role IN ('admin', 'user'));

-- Add some indexes on logs table for security audit queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS pp_logs_scope_idx ON pp_logs(scope);
CREATE INDEX CONCURRENTLY IF NOT EXISTS pp_logs_created_at_idx ON pp_logs(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS pp_logs_scope_created_idx ON pp_logs(scope, created_at);