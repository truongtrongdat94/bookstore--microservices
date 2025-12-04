# PowerShell script to run Profile Page Integration migration

Write-Host "=== Running Profile Page Integration Migration ===" -ForegroundColor Cyan

# Database connection details
$DB_HOST = "localhost"
$DB_PORT = "5431"  # user-db port
$DB_NAME = "users_db"
$DB_USER = "postgres"
$DB_PASSWORD = "dev_password"

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $DB_PASSWORD

# Migration file
$migration = "009_add_user_addresses.sql"

Write-Host "`n=== Running $migration ===" -ForegroundColor Yellow

$result = docker exec -i bookstore-microservices-user-db-1 psql -U $DB_USER -d $DB_NAME -f "/docker-entrypoint-initdb.d/$migration" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ $migration completed successfully" -ForegroundColor Green
    Write-Host $result
    
    # Verify the changes
    Write-Host "`n=== Verification ===" -ForegroundColor Cyan
    
    Write-Host "`n1. Checking users table structure (phone column):" -ForegroundColor Yellow
    docker exec -i bookstore-microservices-user-db-1 psql -U $DB_USER -d $DB_NAME -c "\d users"
    
    Write-Host "`n2. Checking user_addresses table:" -ForegroundColor Yellow
    docker exec -i bookstore-microservices-user-db-1 psql -U $DB_USER -d $DB_NAME -c "\d user_addresses"
    
    Write-Host "`n3. Checking indexes:" -ForegroundColor Yellow
    docker exec -i bookstore-microservices-user-db-1 psql -U $DB_USER -d $DB_NAME -c "\d+ user_addresses"
    
    Write-Host "`n4. Checking triggers:" -ForegroundColor Yellow
    docker exec -i bookstore-microservices-user-db-1 psql -U $DB_USER -d $DB_NAME -c "SELECT trigger_name, event_manipulation, event_object_table FROM information_schema.triggers WHERE event_object_table = 'user_addresses';"
    
    Write-Host "`n=== Migration completed successfully! ===" -ForegroundColor Green
} else {
    Write-Host "✗ $migration failed!" -ForegroundColor Red
    Write-Host $result
    Write-Host "`n=== Migration failed! ===" -ForegroundColor Red
}

# Clear password from environment
Remove-Item Env:\PGPASSWORD

Write-Host "`nPress any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
