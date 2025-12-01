-- 009_add_user_addresses.sql
-- Migration for Profile Page Integration feature
-- Adds phone column to users table and creates user_addresses table for detailed address management

-- Add phone column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Create user_addresses table with detailed Vietnamese address fields
CREATE TABLE IF NOT EXISTS user_addresses (
  address_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  company VARCHAR(255),
  address TEXT NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'Vietnam',
  province VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  ward VARCHAR(100) NOT NULL,
  zip_code VARCHAR(20),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_default ON user_addresses(user_id, is_default);

-- Create trigger function to ensure only one default address per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = TRUE THEN
    UPDATE user_addresses
    SET is_default = FALSE
    WHERE user_id = NEW.user_id AND address_id != NEW.address_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically manage default addresses
DROP TRIGGER IF EXISTS trigger_ensure_single_default_address ON user_addresses;
CREATE TRIGGER trigger_ensure_single_default_address
BEFORE INSERT OR UPDATE ON user_addresses
FOR EACH ROW
EXECUTE FUNCTION ensure_single_default_address();

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_addresses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_user_addresses_updated_at ON user_addresses;
CREATE TRIGGER trigger_update_user_addresses_updated_at
BEFORE UPDATE ON user_addresses
FOR EACH ROW
EXECUTE FUNCTION update_user_addresses_updated_at();
