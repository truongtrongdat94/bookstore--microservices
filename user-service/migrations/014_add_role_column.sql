-- Migration: Add role column to users table
-- This enables admin/user role distinction for Admin Dashboard

-- Add role column with default 'user'
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Create index for role queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add check constraint for valid roles
ALTER TABLE users ADD CONSTRAINT chk_users_role 
  CHECK (role IN ('user', 'admin')) NOT VALID;

-- Validate constraint (non-blocking)
ALTER TABLE users VALIDATE CONSTRAINT chk_users_role;

-- Comment
COMMENT ON COLUMN users.role IS 'User role: user (default) or admin';
