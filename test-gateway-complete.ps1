# Test complete API Gateway flow
Write-Host "`n=== Testing API Gateway Complete Flow ===" -ForegroundColor Cyan

# 1. Register
Write-Host "`n1. Testing REGISTER..." -ForegroundColor Yellow
$registerBody = @{
    username = "gatewaytest$(Get-Random -Maximum 9999)"
    email = "gatewaytest$(Get-Random -Maximum 9999)@example.com"
    password = "Test@123"
    full_name = "Gateway Test User"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerBody `
        -TimeoutSec 10
    
    $registerData = $registerResponse.Content | ConvertFrom-Json
    Write-Host "✅ Register SUCCESS - Status: $($registerResponse.StatusCode)" -ForegroundColor Green
    
    $token = $registerData.data.token
    $userId = $registerData.data.user.id
    $userEmail = $registerData.data.user.email
    
    # 2. Get Books
    Write-Host "`n2. Testing GET BOOKS..." -ForegroundColor Yellow
    $booksResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/books" `
        -Method GET `
        -TimeoutSec 10
    Write-Host "✅ Get Books SUCCESS - Status: $($booksResponse.StatusCode)" -ForegroundColor Green
    
    # 3. Health check
    Write-Host "`n3. Testing HEALTH CHECK..." -ForegroundColor Yellow
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:3000/health" `
        -Method GET `
        -TimeoutSec 10
    Write-Host "✅ Health Check SUCCESS - Status: $($healthResponse.StatusCode)" -ForegroundColor Green
    
    Write-Host "`n=== All Tests PASSED ===" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
