-- 012_create_user_blocks.sql
-- User block history table for tracking user blocking/unblocking
-- Requirements: 10.1, 10.2, 10.3

CREATE TABLE IF NOT EXISTS user_blocks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    blocked_by INTEGER NOT NULL,
    reason TEXT NOT NULL,
    blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unblocked_at TIMESTAMP,
    unblocked_by INTEGER,
    
    -- Foreign keys
    CONSTRAINT fk_user_blocks_user
        FOREIGN KEY (user_id) 
        REFERENCES users(user_id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_user_blocks_blocked_by
        FOREIGN KEY (blocked_by) 
        REFERENCES users(user_id)
        ON DELETE RESTRICT,
    
    CONSTRAINT fk_user_blocks_unblocked_by
        FOREIGN KEY (unblocked_by) 
        REFERENCES users(user_id)
        ON DELETE SET NULL
);

-- Create indexes for efficient querying
CREATE INDEX idx_user_blocks_user_id ON user_blocks(user_id);
CREATE INDEX idx_user_blocks_blocked_by ON user_blocks(blocked_by);
CREATE INDEX idx_user_blocks_blocked_at ON user_blocks(blocked_at DESC);
CREATE INDEX idx_user_blocks_active ON user_blocks(user_id) WHERE unblocked_at IS NULL;

-- Add comment for documentation
COMMENT ON TABLE user_blocks IS 'Tracks user blocking and unblocking history';
COMMENT ON COLUMN user_blocks.reason IS 'Reason for blocking the user';
COMMENT ON COLUMN user_blocks.unblocked_at IS 'NULL if user is still blocked';

-- Add status column to users table if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'status'
    ) THEN
        ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active';
        ALTER TABLE users ADD CONSTRAINT chk_users_status 
            CHECK (status IN ('active', 'blocked', 'pending'));
        CREATE INDEX idx_users_status ON users(status);
    END IF;
END $$;
