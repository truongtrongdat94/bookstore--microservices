# PowerShell script to run Auth Refactor migrations

Write-Host "=== Running Auth Refactor Migrations ===" -ForegroundColor Cyan

# Database connection details
$DB_HOST = "localhost"
$DB_PORT = "5431"  # user-db port
$DB_NAME = "users_db"
$DB_USER = "postgres"
$DB_PASSWORD = "dev_password"

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $DB_PASSWORD

# Migration files in order
$migrations = @(
    "005_add_auth_fields.sql",
    "006_create_otp_codes.sql",
    "007_create_user_auth_providers.sql",
    "008_migrate_existing_users.sql"
)

$success = $true

foreach ($migration in $migrations) {
    Write-Host "`n=== Running $migration ===" -ForegroundColor Yellow
    
    $result = docker exec -i bookstore-microservices-user-db-1 psql -U $DB_USER -d $DB_NAME -f "/docker-entrypoint-initdb.d/$migration" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ $migration completed successfully" -ForegroundColor Green
        Write-Host $result
    } else {
        Write-Host "✗ $migration failed!" -ForegroundColor Red
        Write-Host $result
        $success = $false
        break
    }
}

if ($success) {
    Write-Host "`n=== All migrations completed successfully! ===" -ForegroundColor Green
    
    # Verify the changes
    Write-Host "`n=== Verification ===" -ForegroundColor Cyan
    
    Write-Host "`n1. Checking users table structure:" -ForegroundColor Yellow
    docker exec -i bookstore-microservices-user-db-1 psql -U $DB_USER -d $DB_NAME -c "\d users"
    
    Write-Host "`n2. Checking otp_codes table:" -ForegroundColor Yellow
    docker exec -i bookstore-microservices-user-db-1 psql -U $DB_USER -d $DB_NAME -c "\d otp_codes"
    
    Write-Host "`n3. Checking user_auth_providers table:" -ForegroundColor Yellow
    docker exec -i bookstore-microservices-user-db-1 psql -U $DB_USER -d $DB_NAME -c "\d user_auth_providers"
    
    Write-Host "`n4. Migration statistics:" -ForegroundColor Yellow
    docker exec -i bookstore-microservices-user-db-1 psql -U $DB_USER -d $DB_NAME -c "SELECT 'Total Users' as metric, COUNT(*)::text as value FROM users UNION ALL SELECT 'Verified Users', COUNT(*)::text FROM users WHERE is_email_verified = TRUE UNION ALL SELECT 'Email Auth Providers', COUNT(*)::text FROM user_auth_providers WHERE provider_name = 'email';"
    
} else {
    Write-Host "`n=== Migration failed! ===" -ForegroundColor Red
}

# Clear password from environment
Remove-Item Env:\PGPASSWORD

Write-Host "`nPress any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
