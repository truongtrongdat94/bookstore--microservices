-- Migration: Set admin role for initial admin user
-- Run this manually to create the first admin user

-- Option 1: Update existing user to admin (replace email with your admin email)
-- UPDATE users SET role = 'admin' WHERE email = 'admin@bookstore.com';

-- Option 2: Check current users and their roles
-- SELECT user_id, email, username, role, is_email_verified FROM users;

-- Example: Set first verified user as admin
UPDATE users 
SET role = 'admin' 
WHERE user_id = (
  SELECT user_id 
  FROM users 
  WHERE is_email_verified = true 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- Verify the change
SELECT user_id, email, username, role FROM users WHERE role = 'admin';
