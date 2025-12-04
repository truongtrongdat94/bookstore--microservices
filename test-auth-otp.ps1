# Test Authentication with OTP
# This script tests the email registration with OTP verification flow

Write-Host "=== Testing Email Registration with OTP ===" -ForegroundColor Cyan
Write-Host ""

# Configuration
$USER_SERVICE_URL = "http://localhost:3001"
$TEST_EMAIL = Read-Host "Enter your test email address (will receive OTP)"
$TEST_USERNAME = "testuser_$(Get-Random -Maximum 9999)"
$TEST_PASSWORD = "Test@123456"
$TEST_FULLNAME = "Test User"

Write-Host ""
Write-Host "Test Configuration:" -ForegroundColor Yellow
Write-Host "  Email: $TEST_EMAIL"
Write-Host "  Username: $TEST_USERNAME"
Write-Host "  Password: $TEST_PASSWORD"
Write-Host ""

# Step 1: Register
Write-Host "Step 1: Registering user..." -ForegroundColor Green
$registerBody = @{
    username = $TEST_USERNAME
    email = $TEST_EMAIL
    password = $TEST_PASSWORD
    full_name = $TEST_FULLNAME
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$USER_SERVICE_URL/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerBody
    
    Write-Host "✓ Registration successful!" -ForegroundColor Green
    Write-Host "  Message: $($registerResponse.data.message)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "⚠ CHECK YOUR EMAIL for the OTP code!" -ForegroundColor Yellow
    Write-Host ""
} catch {
    Write-Host "✗ Registration failed!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "  Details: $($errorDetails.error.message)" -ForegroundColor Red
    }
    
    exit 1
}

# Step 2: Wait for user to get OTP
Write-Host "Waiting for OTP code..." -ForegroundColor Cyan
$OTP_CODE = Read-Host "Enter the 6-digit OTP code from your email"

if ($OTP_CODE.Length -ne 6) {
    Write-Host "✗ Invalid OTP code length. Must be 6 digits." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Verify OTP
Write-Host "Step 2: Verifying OTP..." -ForegroundColor Green
$verifyBody = @{
    email = $TEST_EMAIL
    otp_code = $OTP_CODE
} | ConvertTo-Json

try {
    $verifyResponse = Invoke-RestMethod -Uri "$USER_SERVICE_URL/auth/verify-email" `
        -Method POST `
        -ContentType "application/json" `
        -Body $verifyBody
    
    Write-Host "✓ Email verified successfully!" -ForegroundColor Green
    Write-Host "  Token: $($verifyResponse.data.token.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host "  User ID: $($verifyResponse.data.user.id)" -ForegroundColor Gray
    Write-Host "  Username: $($verifyResponse.data.user.username)" -ForegroundColor Gray
    Write-Host ""
    
    # Save token for further testing
    $TOKEN = $verifyResponse.data.token
    
} catch {
    Write-Host "✗ OTP verification failed!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "  Details: $($errorDetails.error.message)" -ForegroundColor Red
    }
    
    exit 1
}

# Step 4: Test Login
Write-Host "Step 3: Testing login with verified account..." -ForegroundColor Green
$loginBody = @{
    email = $TEST_EMAIL
    password = $TEST_PASSWORD
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$USER_SERVICE_URL/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody
    
    Write-Host "✓ Login successful!" -ForegroundColor Green
    Write-Host "  Token: $($loginResponse.data.token.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host "✗ Login failed!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Summary
Write-Host "=== Test Summary ===" -ForegroundColor Cyan
Write-Host "✓ Registration: Success" -ForegroundColor Green
Write-Host "✓ OTP Verification: Success" -ForegroundColor Green
Write-Host "✓ Login: Success" -ForegroundColor Green
Write-Host ""
Write-Host "All tests passed! 🎉" -ForegroundColor Green
Write-Host ""
Write-Host "Test account created:" -ForegroundColor Yellow
Write-Host "  Email: $TEST_EMAIL"
Write-Host "  Username: $TEST_USERNAME"
Write-Host "  Password: $TEST_PASSWORD"

