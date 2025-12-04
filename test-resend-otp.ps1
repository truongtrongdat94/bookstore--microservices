# Test Resend OTP Functionality
# This script tests the resend OTP feature

Write-Host "=== Testing Resend OTP ===" -ForegroundColor Cyan
Write-Host ""

$USER_SERVICE_URL = "http://localhost:3001"
$TEST_EMAIL = Read-Host "Enter the email address that needs OTP resend"

Write-Host ""
Write-Host "Requesting new OTP for: $TEST_EMAIL" -ForegroundColor Yellow
Write-Host ""

$resendBody = @{
    email = $TEST_EMAIL
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$USER_SERVICE_URL/auth/resend-otp" `
        -Method POST `
        -ContentType "application/json" `
        -Body $resendBody
    
    Write-Host "✓ OTP resent successfully!" -ForegroundColor Green
    Write-Host "  Message: $($response.data.message)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "⚠ CHECK YOUR EMAIL for the new OTP code!" -ForegroundColor Yellow
    Write-Host ""
    
} catch {
    Write-Host "✗ Failed to resend OTP!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "  Details: $($errorDetails.error.message)" -ForegroundColor Red
        
        # Check if it's rate limit error
        if ($errorDetails.error.code -eq "RATE_LIMIT_EXCEEDED") {
            Write-Host ""
            Write-Host "⚠ Rate limit exceeded. You can only request 3 OTPs per 5 minutes." -ForegroundColor Yellow
            Write-Host "  Please wait a few minutes before trying again." -ForegroundColor Yellow
        }
    }
    
    exit 1
}

