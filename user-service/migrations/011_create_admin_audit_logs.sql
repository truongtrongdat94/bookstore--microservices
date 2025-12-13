-- 011_create_admin_audit_logs.sql
-- Admin audit log table for tracking admin actions
-- Requirements: 10.3, 11.3

CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key to users table (admin user)
    CONSTRAINT fk_admin_audit_logs_admin
        FOREIGN KEY (admin_id) 
        REFERENCES users(user_id)
        ON DELETE RESTRICT
);

-- Create indexes for efficient querying
CREATE INDEX idx_admin_audit_logs_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX idx_admin_audit_logs_entity_type ON admin_audit_logs(entity_type);
CREATE INDEX idx_admin_audit_logs_entity_id ON admin_audit_logs(entity_id);
CREATE INDEX idx_admin_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX idx_admin_audit_logs_created_at ON admin_audit_logs(created_at DESC);

-- Composite index for common queries
CREATE INDEX idx_admin_audit_logs_entity ON admin_audit_logs(entity_type, entity_id);

-- Add comment for documentation
COMMENT ON TABLE admin_audit_logs IS 'Tracks all admin actions for audit purposes';
COMMENT ON COLUMN admin_audit_logs.action IS 'Action performed: create, update, delete, block, unblock, reset_password, etc.';
COMMENT ON COLUMN admin_audit_logs.entity_type IS 'Type of entity: user, book, order, category, author';
COMMENT ON COLUMN admin_audit_logs.old_value IS 'Previous state of the entity (for updates)';
COMMENT ON COLUMN admin_audit_logs.new_value IS 'New state of the entity (for creates/updates)';
