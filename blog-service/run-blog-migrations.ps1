# PowerShell script to run blog service migrations
# This script executes all blog database migrations in order

Write-Host "Starting blog service migrations..." -ForegroundColor Green

# Database connection details
$DB_HOST = "localhost"
$DB_PORT = "3307"
$DB_USER = "bookstore_user"
$DB_PASSWORD = "bookstore_password"
$DB_NAME = "bookstore_db"

# Migration files in order
$migrations = @(
    "001_create_blog_categories.sql",
    "002_create_blogs.sql",
    "003_seed_blog_data.sql"
)

# Run each migration
foreach ($migration in $migrations) {
    $migrationPath = "migrations/$migration"
    
    Write-Host "`nRunning migration: $migration" -ForegroundColor Cyan
    
    # Execute the migration using mysql command
    Get-Content $migrationPath | docker exec -i bookstore-mysql mysql -u$DB_USER -p$DB_PASSWORD $DB_NAME
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Migration $migration completed successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Migration $migration failed" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n✓ All blog migrations completed successfully!" -ForegroundColor Green
Write-Host "`nVerifying tables..." -ForegroundColor Cyan

# Verify tables were created
$verifyQuery = @"
USE bookstore_db;
SHOW TABLES LIKE 'blog%';
SELECT COUNT(*) as category_count FROM blog_categories;
SELECT COUNT(*) as blog_count FROM blogs;
"@

$verifyQuery | docker exec -i bookstore-mysql mysql -u$DB_USER -p$DB_PASSWORD

Write-Host "`nMigration verification complete!" -ForegroundColor Green
