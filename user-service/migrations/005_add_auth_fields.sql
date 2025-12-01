-- 005_add_auth_fields.sql
-- Add authentication fields to support multiple auth methods

-- Add new columns for multi-auth support
ALTER TABLE users 
  -- Allow NULL password for OAuth users
  ALTER COLUMN password_hash DROP NOT NULL,
  
  -- Email verification status
  ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE,
  
  -- Primary authentication provider
  ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'email',
  
  -- OAuth provider user ID
  ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255),
  
  -- Profile picture URL from OAuth
  ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON users(auth_provider);
CREATE INDEX IF NOT EXISTS idx_users_provider_id ON users(provider_id);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(is_email_verified);

-- Add comments for documentation
COMMENT ON COLUMN users.is_email_verified IS 'TRUE if email has been verified via OTP or OAuth';
COMMENT ON COLUMN users.auth_provider IS 'Primary authentication method: email, google, facebook';
COMMENT ON COLUMN users.provider_id IS 'User ID from OAuth provider (Google ID, Facebook ID)';
COMMENT ON COLUMN users.avatar_url IS 'Profile picture URL from OAuth provider';
