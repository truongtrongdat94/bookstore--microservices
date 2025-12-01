-- Migration: Add registration_data column to otp_codes table
-- This allows storing temporary registration data before user verification

ALTER TABLE otp_codes 
ADD COLUMN registration_data JSONB;

-- Add comment
COMMENT ON COLUMN otp_codes.registration_data IS 'Temporary storage for registration data (username, password_hash, full_name) before email verification';
