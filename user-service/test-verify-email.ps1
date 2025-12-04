# Test Email Verification Endpoint
# This script tests the POST /auth/verify-email endpoint

$baseUrl = "http://localhost:3001/api/auth"

Write-Host "=== Testing Email Verification Endpoint ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Verify email with valid OTP
Write-Host "Test 1: Verify email with valid OTP" -ForegroundColor Yellow
Write-Host "Note: You need to register first and get the OTP from your email" -ForegroundColor Gray
Write-Host ""

$email = Read-Host "Enter email address"
$otpCode = Read-Host "Enter 6-digit OTP code"

$verifyBody = @{
    email = $email
    otp_code = $otpCode
} | ConvertTo-Json

Write-Host "Sending request to: $baseUrl/verify-email" -ForegroundColor Gray
Write-Host "Body: $verifyBody" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/verify-email" -Method Post -Body $verifyBody -ContentType "application/json"
    Write-Host "✓ Success!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
    Write-Host ""
    Write-Host "Token received: $($response.data.token.Substring(0, 20))..." -ForegroundColor Green
} catch {
    Write-Host "✗ Failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details:" -ForegroundColor Red
        $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 10
    }
}

Write-Host ""
Write-Host "=== Test 2: Invalid OTP ===" -ForegroundColor Yellow
$invalidBody = @{
    email = $email
    otp_code = "000000"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/verify-email" -Method Post -Body $invalidBody -ContentType "application/json"
    Write-Host "✗ Should have failed!" -ForegroundColor Red
} catch {
    Write-Host "✓ Correctly rejected invalid OTP" -ForegroundColor Green
    if ($_.ErrorDetails.Message) {
        $error = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "Error message: $($error.error.message)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=== Test 3: Missing fields ===" -ForegroundColor Yellow
$missingBody = @{
    email = $email
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/verify-email" -Method Post -Body $missingBody -ContentType "application/json"
    Write-Host "✗ Should have failed!" -ForegroundColor Red
} catch {
    Write-Host "✓ Correctly rejected missing OTP code" -ForegroundColor Green
    if ($_.ErrorDetails.Message) {
        $error = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "Error message: $($error.error.message)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=== Test 4: Invalid email format ===" -ForegroundColor Yellow
$invalidEmailBody = @{
    email = "not-an-email"
    otp_code = "123456"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/verify-email" -Method Post -Body $invalidEmailBody -ContentType "application/json"
    Write-Host "✗ Should have failed!" -ForegroundColor Red
} catch {
    Write-Host "✓ Correctly rejected invalid email format" -ForegroundColor Green
    if ($_.ErrorDetails.Message) {
        $error = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "Error message: $($error.error.message)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=== All Tests Complete ===" -ForegroundColor Cyan
