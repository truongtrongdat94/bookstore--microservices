-- 008_migrate_existing_users.sql
-- Migrate existing users to new auth system

-- Mark all existing users as email verified (backward compatibility)
UPDATE users 
SET is_email_verified = TRUE,
    auth_provider = 'email'
WHERE password_hash IS NOT NULL
  AND is_email_verified = FALSE;

-- Create user_auth_providers records for existing email users
INSERT INTO user_auth_providers (user_id, provider_name, provider_email, is_primary)
SELECT 
    user_id, 
    'email' as provider_name,
    email as provider_email,
    TRUE as is_primary
FROM users
WHERE password_hash IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM user_auth_providers 
    WHERE user_auth_providers.user_id = users.user_id 
      AND user_auth_providers.provider_name = 'email'
  );

-- Verification query to check migration
SELECT 
    'Total Users' as metric,
    COUNT(*)::text as value
FROM users
UNION ALL
SELECT 
    'Verified Users',
    COUNT(*)::text
FROM users
WHERE is_email_verified = TRUE
UNION ALL
SELECT 
    'Email Auth Providers',
    COUNT(*)::text
FROM user_auth_providers
WHERE provider_name = 'email';
