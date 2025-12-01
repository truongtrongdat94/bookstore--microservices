-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    item_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL, -- References books from book-service
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_book_id ON order_items(book_id);

-- Insert sample order items (referencing the sample orders and books)
INSERT INTO order_items (order_id, book_id, quantity, price) VALUES
-- Order 1 (user 1): Clean Code + JavaScript book + Dune
(1, 1, 1, 29.99), -- Clean Code
(1, 2, 1, 24.99), -- JavaScript: The Good Parts  
(1, 5, 2, 15.99), -- Dune (2 copies)

-- Order 2 (user 2): React book + The Martian
(2, 8, 1, 39.99), -- React in Action
(2, 6, 1, 14.99), -- The Martian

-- Order 3 (user 3): The Pragmatic Programmer
(3, 4, 1, 32.99)  -- The Pragmatic Programmer
ON CONFLICT DO NOTHING;
