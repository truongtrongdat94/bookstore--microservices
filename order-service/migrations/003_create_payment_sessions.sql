-- Create payment_sessions table for VietQR payment integration
-- Requirements: 1.2, 1.5

CREATE TABLE IF NOT EXISTS payment_sessions (
    session_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    qr_code TEXT NOT NULL,
    qr_data_url TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    transfer_content VARCHAR(25) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    confirmed_by INTEGER,
    confirmed_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_payment_session_status CHECK (status IN ('active', 'expired', 'completed', 'cancelled'))
);

-- Create indexes for efficient queries
CREATE INDEX idx_payment_sessions_order_id ON payment_sessions(order_id);
CREATE INDEX idx_payment_sessions_status ON payment_sessions(status);
CREATE INDEX idx_payment_sessions_expires_at ON payment_sessions(expires_at);

-- Composite index for expiry job queries (active sessions that have expired)
CREATE INDEX idx_payment_sessions_status_expires ON payment_sessions(status, expires_at) 
    WHERE status = 'active';

COMMENT ON TABLE payment_sessions IS 'Stores VietQR payment session data with 15-minute expiry';
COMMENT ON COLUMN payment_sessions.transfer_content IS 'Unique transfer content for bank transfer identification (e.g., DH000123)';
COMMENT ON COLUMN payment_sessions.expires_at IS 'Session expiry time, typically 15 minutes from creation';
