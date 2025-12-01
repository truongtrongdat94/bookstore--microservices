-- 006_create_otp_codes.sql
-- Create table for storing OTP codes for email verification

CREATE TABLE IF NOT EXISTS otp_codes (
    otp_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code_hash VARCHAR(255) NOT NULL,
    purpose VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_otp_email_purpose ON otp_codes(email, purpose);
CREATE INDEX IF NOT EXISTS idx_otp_expires_at ON otp_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_is_used ON otp_codes(is_used);

-- Add comments
COMMENT ON TABLE otp_codes IS 'Stores OTP codes for email verification and password reset';
COMMENT ON COLUMN otp_codes.email IS 'Email address to send OTP to';
COMMENT ON COLUMN otp_codes.otp_code_hash IS 'Bcrypt hash of the 6-digit OTP code';
COMMENT ON COLUMN otp_codes.purpose IS 'Purpose of OTP: register, login, reset_password';
COMMENT ON COLUMN otp_codes.expires_at IS 'Expiration timestamp (typically 5 minutes from creation)';
COMMENT ON COLUMN otp_codes.is_used IS 'TRUE if OTP has been used (prevents reuse)';
