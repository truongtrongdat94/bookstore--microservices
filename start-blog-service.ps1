# Start Blog Service and Dependencies
Write-Host "Starting blog service and dependencies..." -ForegroundColor Cyan

# Start MySQL, Redis, and Blog Service
docker compose -f docker-compose.dev.yml up -d mysql redis blog-service

Write-Host ""
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "Checking service status..." -ForegroundColor Cyan
docker compose -f docker-compose.dev.yml ps blog-service mysql redis

Write-Host ""
Write-Host "Blog service logs:" -ForegroundColor Cyan
docker compose -f docker-compose.dev.yml logs blog-service --tail 20

Write-Host ""
Write-Host "✓ Services started. You can now run: .\test-blog-api.ps1" -ForegroundColor Green
