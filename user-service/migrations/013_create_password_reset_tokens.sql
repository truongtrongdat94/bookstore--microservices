-- 013_create_password_reset_tokens.sql
-- Password reset tokens table for admin-initiated password resets
-- Requirements: 11.1, 11.2, 11.3

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    initiated_by INTEGER NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_password_reset_tokens_user
        FOREIGN KEY (user_id) 
        REFERENCES users(user_id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_password_reset_tokens_initiated_by
        FOREIGN KEY (initiated_by) 
        REFERENCES users(user_id)
        ON DELETE RESTRICT
);

-- Create indexes for efficient querying
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX idx_password_reset_tokens_initiated_by ON password_reset_tokens(initiated_by);

-- Index for finding valid (unused, not expired) tokens
CREATE INDEX idx_password_reset_tokens_valid ON password_reset_tokens(token) 
    WHERE used_at IS NULL AND expires_at > CURRENT_TIMESTAMP;

-- Add comment for documentation
COMMENT ON TABLE password_reset_tokens IS 'Stores password reset tokens initiated by admins';
COMMENT ON COLUMN password_reset_tokens.token IS 'Secure random token sent to user email';
COMMENT ON COLUMN password_reset_tokens.initiated_by IS 'Admin user who initiated the password reset';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Token expires 24 hours after creation';
COMMENT ON COLUMN password_reset_tokens.used_at IS 'Timestamp when token was used, NULL if not used';

-- Function to clean up expired tokens (can be called by a cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_password_reset_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM password_reset_tokens 
    WHERE expires_at < CURRENT_TIMESTAMP - INTERVAL '7 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_password_reset_tokens() IS 
    'Removes password reset tokens that expired more than 7 days ago';
