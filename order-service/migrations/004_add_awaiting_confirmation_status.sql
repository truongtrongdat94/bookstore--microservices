-- Add 'awaiting_confirmation' to payment_status enum
-- Requirements: 3.1

-- Drop existing constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_orders_payment_status;

-- Add new constraint with 'awaiting_confirmation' value
ALTER TABLE orders ADD CONSTRAINT chk_orders_payment_status 
    CHECK (payment_status IN ('pending', 'awaiting_confirmation', 'processing', 'completed', 'failed', 'refunded'));

COMMENT ON COLUMN orders.payment_status IS 'Payment status: pending (initial), awaiting_confirmation (QR generated, waiting for admin confirmation), processing, completed, failed, refunded';
