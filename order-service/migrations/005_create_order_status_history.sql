-- 005_create_order_status_history.sql
-- Order status history table for tracking order status changes
-- Requirements: 7.1

CREATE TABLE IF NOT EXISTS order_status_history (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    changed_by INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key to orders table
    CONSTRAINT fk_order_status_history_order
        FOREIGN KEY (order_id) 
        REFERENCES orders(order_id)
        ON DELETE CASCADE,
    
    -- Check constraints for valid status values
    CONSTRAINT chk_order_status_history_from_status 
        CHECK (from_status IS NULL OR from_status IN (
            'pending', 'confirmed', 'processing', 'shipped', 
            'delivered', 'cancelled', 'refunded', 'awaiting_confirmation'
        )),
    
    CONSTRAINT chk_order_status_history_to_status 
        CHECK (to_status IN (
            'pending', 'confirmed', 'processing', 'shipped', 
            'delivered', 'cancelled', 'refunded', 'awaiting_confirmation'
        ))
);

-- Create indexes for efficient querying
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_order_status_history_changed_by ON order_status_history(changed_by);
CREATE INDEX idx_order_status_history_created_at ON order_status_history(created_at DESC);
CREATE INDEX idx_order_status_history_to_status ON order_status_history(to_status);

-- Composite index for order timeline queries
CREATE INDEX idx_order_status_history_order_timeline 
    ON order_status_history(order_id, created_at DESC);

-- Add comment for documentation
COMMENT ON TABLE order_status_history IS 'Tracks all order status changes for audit and tracking';
COMMENT ON COLUMN order_status_history.from_status IS 'Previous status, NULL for initial status';
COMMENT ON COLUMN order_status_history.to_status IS 'New status after the change';
COMMENT ON COLUMN order_status_history.changed_by IS 'User ID who made the change (admin or system)';
COMMENT ON COLUMN order_status_history.reason IS 'Optional reason for the status change';

-- Function to automatically record status changes
CREATE OR REPLACE FUNCTION record_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only record if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO order_status_history (order_id, from_status, to_status, changed_by, reason)
        VALUES (NEW.order_id, OLD.status, NEW.status, COALESCE(NEW.user_id, 0), NULL);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically record status changes
DROP TRIGGER IF EXISTS trg_order_status_change ON orders;
CREATE TRIGGER trg_order_status_change
    AFTER UPDATE OF status ON orders
    FOR EACH ROW
    EXECUTE FUNCTION record_order_status_change();

COMMENT ON FUNCTION record_order_status_change() IS 
    'Automatically records order status changes to history table';
