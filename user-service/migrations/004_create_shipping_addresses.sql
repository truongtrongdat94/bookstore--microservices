-- Migration: Create shipping_addresses table
-- API #6: Shipping Address Management

-- Create shipping_addresses table
CREATE TABLE IF NOT EXISTS shipping_addresses (
  address_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address_line VARCHAR(500) NOT NULL,
  city VARCHAR(100),
  district VARCHAR(100),
  ward VARCHAR(100),
  postal_code VARCHAR(20),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_user_id ON shipping_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_is_default ON shipping_addresses(user_id, is_default);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_shipping_address_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_shipping_address_updated_at
  BEFORE UPDATE ON shipping_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_shipping_address_updated_at();

-- Create trigger to ensure only one default address per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE shipping_addresses 
    SET is_default = false 
    WHERE user_id = NEW.user_id 
      AND address_id != NEW.address_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_default_address
  BEFORE INSERT OR UPDATE ON shipping_addresses
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_address();

-- Comments
COMMENT ON TABLE shipping_addresses IS 'Bảng lưu địa chỉ giao hàng của người dùng';
COMMENT ON COLUMN shipping_addresses.full_name IS 'Họ tên người nhận';
COMMENT ON COLUMN shipping_addresses.phone IS 'Số điện thoại người nhận';
COMMENT ON COLUMN shipping_addresses.address_line IS 'Địa chỉ chi tiết';
COMMENT ON COLUMN shipping_addresses.city IS 'Thành phố/Tỉnh';
COMMENT ON COLUMN shipping_addresses.district IS 'Quận/Huyện';
COMMENT ON COLUMN shipping_addresses.ward IS 'Phường/Xã';
COMMENT ON COLUMN shipping_addresses.is_default IS 'Địa chỉ mặc định';
