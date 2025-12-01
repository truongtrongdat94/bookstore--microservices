-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    parent_id INTEGER REFERENCES categories(category_id) ON DELETE CASCADE,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_name ON categories(name);

-- Insert sample categories
INSERT INTO categories (name, parent_id, description) VALUES
('Technology', NULL, 'Technology and Computer Science books'),
('Fiction', NULL, 'Fiction and Literature'),
('Business', NULL, 'Business and Economics'),
('Science', NULL, 'Science and Mathematics'),
('Self-Help', NULL, 'Self-improvement and Personal Development'),
('History', NULL, 'History and Biography'),
('Arts', NULL, 'Arts and Design'),
('Education', NULL, 'Educational and Academic')
ON CONFLICT (name) DO NOTHING;

-- Insert subcategories
INSERT INTO categories (name, parent_id, description)
SELECT 'Web Development', category_id, 'Web development and frontend technologies' 
FROM categories WHERE name = 'Technology'
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name, parent_id, description)
SELECT 'Programming', category_id, 'Programming languages and software development' 
FROM categories WHERE name = 'Technology'
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name, parent_id, description)
SELECT 'Database', category_id, 'Database design and management' 
FROM categories WHERE name = 'Technology'
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name, parent_id, description)
SELECT 'Sci-Fi', category_id, 'Science Fiction' 
FROM categories WHERE name = 'Fiction'
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name, parent_id, description)
SELECT 'Mystery', category_id, 'Mystery and Thriller' 
FROM categories WHERE name = 'Fiction'
ON CONFLICT (name) DO NOTHING;
