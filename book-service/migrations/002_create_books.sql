-- Create books table
CREATE TABLE IF NOT EXISTS books (
    book_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(17) UNIQUE,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    category_id INTEGER NOT NULL REFERENCES categories(category_id),
    description TEXT,
    cover_image VARCHAR(500),
    published_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_category ON books(category_id);
CREATE INDEX idx_books_price ON books(price);
CREATE INDEX idx_books_created_at ON books(created_at DESC);
CREATE INDEX idx_books_isbn ON books(isbn) WHERE isbn IS NOT NULL;

-- Full-text search index
CREATE INDEX idx_books_search ON books USING gin(to_tsvector('english', title || ' ' || author));

-- Insert sample books
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('Clean Code', 'Robert C. Martin', '9780132350884', 29.99, 50, 
 (SELECT category_id FROM categories WHERE name = 'Programming'),
 'A Handbook of Agile Software Craftsmanship', '2008-08-11'),

('JavaScript: The Good Parts', 'Douglas Crockford', '9780596517748', 24.99, 30,
 (SELECT category_id FROM categories WHERE name = 'Web Development'),
 'Unearthing the Excellence in JavaScript', '2008-05-08'),

('Design Patterns', 'Gang of Four', '9780201633610', 35.99, 25,
 (SELECT category_id FROM categories WHERE name = 'Programming'),
 'Elements of Reusable Object-Oriented Software', '1994-10-31'),

('The Pragmatic Programmer', 'Andrew Hunt', '9780201616224', 32.99, 40,
 (SELECT category_id FROM categories WHERE name = 'Programming'),
 'Your Journey To Mastery', '1999-10-30'),

('Dune', 'Frank Herbert', '9780441172719', 15.99, 100,
 (SELECT category_id FROM categories WHERE name = 'Sci-Fi'),
 'Science fiction masterpiece about desert planet Arrakis', '1965-08-01'),

('The Martian', 'Andy Weir', '9780553418026', 14.99, 75,
 (SELECT category_id FROM categories WHERE name = 'Sci-Fi'),
 'A gripping tale of survival on Mars', '2011-09-27'),

('The Girl with the Dragon Tattoo', 'Stieg Larsson', '9780307454546', 12.99, 60,
 (SELECT category_id FROM categories WHERE name = 'Mystery'),
 'Crime thriller from Sweden', '2005-08-01'),

('React in Action', 'Mark Tielens Thomas', '9781617293856', 39.99, 35,
 (SELECT category_id FROM categories WHERE name = 'Web Development'),
 'Building modern web applications with React', '2018-05-01'),

('Database System Concepts', 'Abraham Silberschatz', '9780078022159', 299.99, 15,
 (SELECT category_id FROM categories WHERE name = 'Database'),
 'Comprehensive guide to database systems', '2019-02-01'),

('Effective TypeScript', 'Dan Vanderkam', '9781492053743', 34.99, 45,
 (SELECT category_id FROM categories WHERE name = 'Programming'),
 '62 Specific Ways to Improve Your TypeScript', '2019-10-01')
ON CONFLICT (isbn) DO NOTHING;
