# Restart All Services Script
# This script helps restart services to load new code

Write-Host "=== Restarting Services ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  This script will help you restart services" -ForegroundColor Yellow
Write-Host "   You need to manually stop (Ctrl+C) and restart each service" -ForegroundColor Yellow
Write-Host ""

Write-Host "Services to restart:" -ForegroundColor White
Write-Host "  1. API Gateway (port 3000)" -ForegroundColor Gray
Write-Host "  2. User Service (port 3001)" -ForegroundColor Gray
Write-Host "  3. Frontend (port 5173)" -ForegroundColor Gray
Write-Host ""

Write-Host "Commands to run in separate terminals:" -ForegroundColor Cyan
Write-Host ""

Write-Host "Terminal 1 - API Gateway:" -ForegroundColor Green
Write-Host "  cd bookstore-microservices/api-gateway" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""

Write-Host "Terminal 2 - User Service:" -ForegroundColor Green
Write-Host "  cd bookstore-microservices/user-service" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""

Write-Host "Terminal 3 - Frontend:" -ForegroundColor Green
Write-Host "  cd bookstore-microservices/frontend_service" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""

Write-Host "After restarting, test with:" -ForegroundColor Cyan
Write-Host "  cd bookstore-microservices" -ForegroundColor White
Write-Host "  .\debug-oauth.ps1" -ForegroundColor White
Write-Host ""

# Ask if user wants to open terminals
$response = Read-Host "Do you want to open new PowerShell windows for each service? (y/n)"

if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host ""
    Write-Host "Opening terminals..." -ForegroundColor Green
    
    # API Gateway
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\exported-assets\bookstore-microservices\api-gateway'; Write-Host 'Starting API Gateway...' -ForegroundColor Cyan; npm run dev"
    
    Start-Sleep -Seconds 2
    
    # User Service
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\exported-assets\bookstore-microservices\user-service'; Write-Host 'Starting User Service...' -ForegroundColor Cyan; npm run dev"
    
    Start-Sleep -Seconds 2
    
    # Frontend
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\exported-assets\bookstore-microservices\frontend_service'; Write-Host 'Starting Frontend...' -ForegroundColor Cyan; npm run dev"
    
    Write-Host ""
    Write-Host "✓ Opened 3 new terminal windows" -ForegroundColor Green
    Write-Host "  Wait for all services to start (about 10-20 seconds)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Then run: .\debug-oauth.ps1" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "Please manually restart services in separate terminals" -ForegroundColor Yellow
}

