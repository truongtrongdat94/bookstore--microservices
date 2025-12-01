-- Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
    address_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'USA',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_addresses_user_id ON addresses(user_id);

-- Ensure only one default address per user
CREATE UNIQUE INDEX idx_addresses_default ON addresses(user_id, is_default) WHERE is_default = TRUE;
