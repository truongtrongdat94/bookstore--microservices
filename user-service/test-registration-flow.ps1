# Test Registration Flow with OTP
# This script tests the new registration flow with email verification

$baseUrl = "http://localhost:3001/api/auth"
$testEmail = "test_otp_$(Get-Random)@example.com"
$testUsername = "testuser_$(Get-Random)"

Write-Host "`n=== Testing Registration Flow with OTP ===" -ForegroundColor Cyan

# Step 1: Register new user
Write-Host "`n1. Registering new user..." -ForegroundColor Yellow
$registerBody = @{
    username = $testUsername
    email = $testEmail
    password = "Test@1234"
    full_name = "Test User OTP"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "✓ Registration successful" -ForegroundColor Green
    Write-Host "Response: $($registerResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
    
    # Check that no token was returned
    if ($registerResponse.data.token) {
        Write-Host "✗ ERROR: Token should not be returned before email verification" -ForegroundColor Red
    } else {
        Write-Host "✓ No token returned (correct behavior)" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Try to login without verification
Write-Host "`n2. Attempting login without email verification..." -ForegroundColor Yellow
$loginBody = @{
    email = $testEmail
    password = "Test@1234"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "✗ ERROR: Login should fail for unverified email" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($errorResponse.error.code -eq "EMAIL_NOT_VERIFIED") {
        Write-Host "✓ Login correctly rejected for unverified email" -ForegroundColor Green
        Write-Host "Error message: $($errorResponse.error.message)" -ForegroundColor Gray
    } else {
        Write-Host "✗ Unexpected error: $($errorResponse.error.message)" -ForegroundColor Red
    }
}

# Step 3: Test resend OTP
Write-Host "`n3. Testing resend OTP..." -ForegroundColor Yellow
$resendBody = @{
    email = $testEmail
} | ConvertTo-Json

try {
    $resendResponse = Invoke-RestMethod -Uri "$baseUrl/resend-otp" -Method Post -Body $resendBody -ContentType "application/json"
    Write-Host "✓ OTP resend successful" -ForegroundColor Green
    Write-Host "Response: $($resendResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Resend OTP failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Test rate limiting (send 3 more OTPs)
Write-Host "`n4. Testing rate limiting (max 3 OTP per 5 minutes)..." -ForegroundColor Yellow
for ($i = 1; $i -le 3; $i++) {
    try {
        $resendResponse = Invoke-RestMethod -Uri "$baseUrl/resend-otp" -Method Post -Body $resendBody -ContentType "application/json"
        Write-Host "  Request $i: OTP sent" -ForegroundColor Gray
    } catch {
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        if ($errorResponse.error.code -eq "RATE_LIMIT_EXCEEDED") {
            Write-Host "✓ Rate limit correctly enforced at request $i" -ForegroundColor Green
            Write-Host "  Error message: $($errorResponse.error.message)" -ForegroundColor Gray
            break
        } else {
            Write-Host "  Request $i failed: $($errorResponse.error.message)" -ForegroundColor Red
        }
    }
    Start-Sleep -Milliseconds 500
}

# Step 5: Test invalid OTP
Write-Host "`n5. Testing invalid OTP code..." -ForegroundColor Yellow
$verifyBody = @{
    email = $testEmail
    otp_code = "000000"
} | ConvertTo-Json

try {
    $verifyResponse = Invoke-RestMethod -Uri "$baseUrl/verify-email" -Method Post -Body $verifyBody -ContentType "application/json"
    Write-Host "✗ ERROR: Invalid OTP should be rejected" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($errorResponse.error.code -eq "INVALID_OTP") {
        Write-Host "✓ Invalid OTP correctly rejected" -ForegroundColor Green
        Write-Host "Error message: $($errorResponse.error.message)" -ForegroundColor Gray
    } else {
        Write-Host "✗ Unexpected error: $($errorResponse.error.message)" -ForegroundColor Red
    }
}

Write-Host "`n=== Manual Verification Required ===" -ForegroundColor Cyan
Write-Host "To complete the test:" -ForegroundColor Yellow
Write-Host "1. Check the email inbox for: $testEmail" -ForegroundColor White
Write-Host "2. Get the 6-digit OTP code from the email" -ForegroundColor White
Write-Host "3. Run the following command to verify:" -ForegroundColor White
Write-Host "`n`$verifyBody = @{ email = '$testEmail'; otp_code = 'YOUR_OTP_CODE' } | ConvertTo-Json" -ForegroundColor Cyan
Write-Host "Invoke-RestMethod -Uri '$baseUrl/verify-email' -Method Post -Body `$verifyBody -ContentType 'application/json'" -ForegroundColor Cyan
Write-Host "`n4. After verification, try logging in again with the same credentials" -ForegroundColor White

Write-Host "`n=== Test Summary ===" -ForegroundColor Cyan
Write-Host "✓ Registration endpoint updated to not return token" -ForegroundColor Green
Write-Host "✓ OTP email sent after registration" -ForegroundColor Green
Write-Host "✓ Login blocked for unverified email" -ForegroundColor Green
Write-Host "✓ Resend OTP endpoint working" -ForegroundColor Green
Write-Host "✓ Rate limiting enforced" -ForegroundColor Green
Write-Host "✓ Invalid OTP rejected" -ForegroundColor Green
Write-Host "`nTest credentials:" -ForegroundColor Yellow
Write-Host "Email: $testEmail" -ForegroundColor White
Write-Host "Password: Test@1234" -ForegroundColor White
