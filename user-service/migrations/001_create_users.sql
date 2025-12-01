-- 001_create_users.sql

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Insert sample users for testing
INSERT INTO users (username, email, password_hash, full_name) VALUES
('testuser', 'test@example.com', '$2a$10$YKz5F3r7WzC9xVL3zGvPfORJ1aP6RhBFzCxopXKhSFHvpBDz6LH7a', 'Test User'),
-- password: Test@123
('johndoe', 'john@example.com', '$2a$10$YKz5F3r7WzC9xVL3zGvPfORJ1aP6RhBFzCxopXKhSFHvpBDz6LH7a', 'John Doe'),
('janedoe', 'jane@example.com', '$2a$10$YKz5F3r7WzC9xVL3zGvPfORJ1aP6RhBFzCxopXKhSFHvpBDz6LH7a', 'Jane Doe')
ON CONFLICT DO NOTHING;
