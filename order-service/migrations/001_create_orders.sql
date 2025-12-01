-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    order_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL, -- References users from user-service
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    shipping_address TEXT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Check constraints for enum-like values
ALTER TABLE orders ADD CONSTRAINT chk_orders_status 
    CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'));

ALTER TABLE orders ADD CONSTRAINT chk_orders_payment_method 
    CHECK (payment_method IN ('credit_card', 'debit_card', 'paypal', 'bank_transfer'));

ALTER TABLE orders ADD CONSTRAINT chk_orders_payment_status 
    CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded'));

-- Insert sample orders (assuming user_ids 1, 2, 3 exist from user-service)
INSERT INTO orders (user_id, status, total_amount, shipping_address, payment_method, payment_status) VALUES
(1, 'delivered', 89.97, '123 Main St, Anytown, USA 12345', 'credit_card', 'completed'),
(2, 'processing', 45.98, '456 Oak Ave, Springfield, USA 67890', 'paypal', 'completed'),
(3, 'pending', 32.99, '789 Pine Rd, Hometown, USA 54321', 'debit_card', 'pending')
ON CONFLICT DO NOTHING;
