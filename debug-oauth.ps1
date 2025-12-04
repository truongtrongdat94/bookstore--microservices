# Debug OAuth Issues
# This script helps diagnose OAuth problems

Write-Host "=== OAuth Debugging Tool ===" -ForegroundColor Cyan
Write-Host ""

# Check if services are running
Write-Host "1. Checking if services are running..." -ForegroundColor Yellow

$services = @(
    @{ Name = "API Gateway"; Port = 3000 },
    @{ Name = "User Service"; Port = 3001 },
    @{ Name = "Frontend"; Port = 5173 }
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($service.Port)/health" -TimeoutSec 2 -ErrorAction Stop
        Write-Host "  ✓ $($service.Name) (port $($service.Port)): Running" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ $($service.Name) (port $($service.Port)): NOT RUNNING" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "2. Testing OAuth endpoints..." -ForegroundColor Yellow

# Test Google OAuth endpoint
Write-Host "  Testing /api/auth/google..." -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/google" `
        -MaximumRedirection 0 `
        -ErrorAction Stop
    Write-Host "    Response: $($response.StatusCode)" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 302) {
        $location = $_.Exception.Response.Headers.Location
        Write-Host "    ✓ Redirect (302) to: $location" -ForegroundColor Green
    } else {
        Write-Host "    ✗ Error: $statusCode - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "3. Checking environment variables..." -ForegroundColor Yellow

# Check user-service .env
$envPath = "bookstore-microservices/user-service/.env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath
    
    $googleClientId = $envContent | Select-String "GOOGLE_CLIENT_ID=" | Select-Object -First 1
    $googleSecret = $envContent | Select-String "GOOGLE_CLIENT_SECRET=" | Select-Object -First 1
    $googleCallback = $envContent | Select-String "GOOGLE_CALLBACK_URL=" | Select-Object -First 1
    
    Write-Host "  Google OAuth Config:" -ForegroundColor Gray
    if ($googleClientId -match "your-google-client-id") {
        Write-Host "    ✗ GOOGLE_CLIENT_ID: Not configured (still placeholder)" -ForegroundColor Red
    } else {
        Write-Host "    ✓ GOOGLE_CLIENT_ID: Configured" -ForegroundColor Green
    }
    
    if ($googleSecret -match "your-google-client-secret") {
        Write-Host "    ✗ GOOGLE_CLIENT_SECRET: Not configured (still placeholder)" -ForegroundColor Red
    } else {
        Write-Host "    ✓ GOOGLE_CLIENT_SECRET: Configured" -ForegroundColor Green
    }
    
    Write-Host "    Callback URL: $googleCallback" -ForegroundColor Gray
    
    Write-Host ""
    
    $gmailUser = $envContent | Select-String "GMAIL_USER=" | Select-Object -First 1
    $gmailPassword = $envContent | Select-String "GMAIL_APP_PASSWORD=" | Select-Object -First 1
    
    Write-Host "  Email Config:" -ForegroundColor Gray
    if ($gmailUser -match "your-email@gmail.com") {
        Write-Host "    ✗ GMAIL_USER: Not configured (still placeholder)" -ForegroundColor Red
    } else {
        Write-Host "    ✓ GMAIL_USER: Configured" -ForegroundColor Green
    }
    
    if ($gmailPassword -match "your-app-password") {
        Write-Host "    ✗ GMAIL_APP_PASSWORD: Not configured (still placeholder)" -ForegroundColor Red
    } else {
        Write-Host "    ✓ GMAIL_APP_PASSWORD: Configured" -ForegroundColor Green
    }
} else {
    Write-Host "  ✗ .env file not found at $envPath" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Common Issues:" -ForegroundColor Yellow
Write-Host "1. OAuth not working:" -ForegroundColor White
Write-Host "   - Need to configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET" -ForegroundColor Gray
Write-Host "   - Get credentials from: https://console.cloud.google.com/" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Email OTP not sending:" -ForegroundColor White
Write-Host "   - Need to configure GMAIL_USER and GMAIL_APP_PASSWORD" -ForegroundColor Gray
Write-Host "   - Get app password from: https://myaccount.google.com/security" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Services not running:" -ForegroundColor White
Write-Host "   - Start API Gateway: cd api-gateway && npm run dev" -ForegroundColor Gray
Write-Host "   - Start User Service: cd user-service && npm run dev" -ForegroundColor Gray
Write-Host "   - Start Frontend: cd frontend_service && npm run dev" -ForegroundColor Gray

