-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL, -- References users from user-service
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- Check constraints for notification types
ALTER TABLE notifications ADD CONSTRAINT chk_notifications_type 
    CHECK (type IN ('order_created', 'order_updated', 'payment_processed', 'system', 'promotion'));

-- Insert sample notifications (assuming user_ids 1, 2, 3 exist from user-service)
INSERT INTO notifications (user_id, type, title, message, data, is_read) VALUES
(1, 'order_created', 'Order Confirmed', 'Your order #1 has been confirmed and is being processed.', 
 '{"order_id": 1, "total_amount": 89.97, "items_count": 3}', false),

(1, 'order_updated', 'Order Shipped', 'Your order #1 has been shipped and is on its way!', 
 '{"order_id": 1, "old_status": "processing", "new_status": "shipped"}', false),

(2, 'order_created', 'Order Confirmed', 'Your order #2 has been confirmed and is being processed.', 
 '{"order_id": 2, "total_amount": 45.98, "items_count": 2}', true),

(2, 'payment_processed', 'Payment Successful', 'Payment of $45.98 for order #2 was processed successfully.', 
 '{"order_id": 2, "payment_status": "completed", "amount": 45.98}', false),

(3, 'system', 'Welcome to Bookstore!', 'Thank you for joining our bookstore. Explore our vast collection of books.', 
 '{"welcome": true}', false),

(1, 'promotion', 'Special Offer', '20% off on all programming books this week!', 
 '{"discount": 20, "category": "programming"}', true)
ON CONFLICT DO NOTHING;
