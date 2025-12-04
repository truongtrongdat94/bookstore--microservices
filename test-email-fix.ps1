# Test Email Service After Fix
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Testing Email Service Fix" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Restart user-service to apply new env vars
Write-Host "Step 1: Restarting user-service..." -ForegroundColor Yellow
docker-compose restart user-service
Start-Sleep -Seconds 5

# Step 2: Check logs for email configuration
Write-Host "`nStep 2: Checking email configuration in logs..." -ForegroundColor Yellow
docker logs bookstore-microservices-user-service-1 --tail 20 | Select-String -Pattern "email|smtp|mailtrap" -CaseSensitive:$false

# Step 3: Test registration with a new email
Write-Host "`nStep 3: Testing registration with OTP..." -ForegroundColor Yellow
$testEmail = "test-$(Get-Date -Format 'HHmmss')@example.com"
Write-Host "Using test email: $testEmail" -ForegroundColor Gray

$registerData = @{
    email = $testEmail
    username = "testuser$(Get-Date -Format 'HHmmss')"
    password = "Test123!"
    firstName = "Test"
    lastName = "User"
    phoneNumber = "0123456789"
} | ConvertTo-Json

Write-Host "`nSending registration request..." -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerData `
        -ErrorAction Stop
    
    Write-Host "✅ Registration successful!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Gray
    $response | ConvertTo-Json -Depth 3
    
    Write-Host "`n✅ Email OTP should be sent successfully!" -ForegroundColor Green
    Write-Host "Check Mailtrap inbox: https://mailtrap.io/inboxes" -ForegroundColor Cyan
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
    
    Write-Host "❌ Registration failed with status: $statusCode" -ForegroundColor Red
    Write-Host "Error:" -ForegroundColor Red
    $errorBody | ConvertTo-Json -Depth 3
}

# Step 4: Check recent logs for email sending
Write-Host "`nStep 4: Checking recent logs for email activity..." -ForegroundColor Yellow
docker logs bookstore-microservices-user-service-1 --tail 30 | Select-String -Pattern "OTP|email|smtp" -CaseSensitive:$false

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "Test Complete" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
