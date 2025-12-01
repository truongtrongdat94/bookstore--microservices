-- 007_create_user_auth_providers.sql
-- Create table for tracking multiple authentication providers per user

CREATE TABLE IF NOT EXISTS user_auth_providers (
    provider_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    provider_name VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255),
    provider_email VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Ensure unique provider per user
    UNIQUE(provider_name, provider_user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_provider ON user_auth_providers(user_id, provider_name);
CREATE INDEX IF NOT EXISTS idx_provider_user_id ON user_auth_providers(provider_name, provider_user_id);

-- Add comments
COMMENT ON TABLE user_auth_providers IS 'Tracks multiple authentication methods for each user';
COMMENT ON COLUMN user_auth_providers.user_id IS 'Reference to users table';
COMMENT ON COLUMN user_auth_providers.provider_name IS 'Auth provider: email, google, facebook';
COMMENT ON COLUMN user_auth_providers.provider_user_id IS 'User ID from the OAuth provider';
COMMENT ON COLUMN user_auth_providers.provider_email IS 'Email from the OAuth provider';
COMMENT ON COLUMN user_auth_providers.is_primary IS 'TRUE if this is the primary auth method';
