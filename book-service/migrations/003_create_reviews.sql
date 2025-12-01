-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    review_id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(book_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL, -- References users from user-service
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP,
    UNIQUE(book_id, user_id) -- One review per user per book
);

-- Create indexes
CREATE INDEX idx_reviews_book ON reviews(book_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Insert sample reviews (assuming user_ids 1, 2, 3 exist from user-service)
INSERT INTO reviews (book_id, user_id, rating, comment) VALUES
((SELECT book_id FROM books WHERE title = 'Clean Code'), 1, 5, 'Excellent book for any programmer. Clear explanations and practical examples.'),
((SELECT book_id FROM books WHERE title = 'Clean Code'), 2, 4, 'Good insights on writing maintainable code. Some parts could be more concise.'),

((SELECT book_id FROM books WHERE title = 'JavaScript: The Good Parts'), 1, 4, 'Great overview of JavaScript fundamentals. Helped me understand the language better.'),
((SELECT book_id FROM books WHERE title = 'JavaScript: The Good Parts'), 3, 5, 'Essential reading for JavaScript developers. Crockford is a master.'),

((SELECT book_id FROM books WHERE title = 'Dune'), 2, 5, 'Masterpiece of science fiction. Complex world-building and compelling characters.'),
((SELECT book_id FROM books WHERE title = 'Dune'), 3, 4, 'Great story but can be slow at times. Worth the read for sci-fi fans.'),

((SELECT book_id FROM books WHERE title = 'The Martian'), 1, 5, 'Thrilling and scientifically accurate. Couldn''t put it down!'),
((SELECT book_id FROM books WHERE title = 'The Martian'), 2, 5, 'Perfect blend of science and humor. Highly recommended.'),

((SELECT book_id FROM books WHERE title = 'React in Action'), 3, 4, 'Good practical guide to React. Examples are clear and up-to-date.'),
((SELECT book_id FROM books WHERE title = 'Design Patterns'), 1, 4, 'Classic book on software design. Some patterns are dated but principles remain valid.')
ON CONFLICT (book_id, user_id) DO NOTHING;
