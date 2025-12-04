# Manual Testing Script for OTP Registration Fix
# Task 8: Manual testing and verification

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "OTP Registration Manual Testing Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$API_BASE = "http://localhost:3000/api"
$TEST_EMAIL = "test_$(Get-Random -Minimum 1000 -Maximum 9999)@example.com"
$TEST_USERNAME = "testuser_$(Get-Random -Minimum 1000 -Maximum 9999)"
$TEST_PASSWORD = "Test123456!"
$TEST_FULLNAME = "Test User"

Write-Host "Test Configuration:" -ForegroundColor Yellow
Write-Host "  Email: $TEST_EMAIL" -ForegroundColor White
Write-Host "  Username: $TEST_USERNAME" -ForegroundColor White
Write-Host "  Password: $TEST_PASSWORD" -ForegroundColor White
Write-Host ""

# Function to make HTTP requests
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body = $null,
        [string]$Description
    )
    
    Write-Host "[$Method] $Endpoint" -ForegroundColor Cyan
    Write-Host "Description: $Description" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = "$API_BASE$Endpoint"
            Method = $Method
            ContentType = "application/json"
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
            Write-Host "Request Body:" -ForegroundColor Gray
            Write-Host ($Body | ConvertTo-Json) -ForegroundColor DarkGray
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "✓ Success" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor Gray
        Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor White
        Write-Host ""
        return @{ Success = $true; Data = $response }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorBody = $_.ErrorDetails.Message
        Write-Host "✗ Failed (HTTP $statusCode)" -ForegroundColor Red
        Write-Host "Error: $errorBody" -ForegroundColor Red
        Write-Host ""
        return @{ Success = $false; StatusCode = $statusCode; Error = $errorBody }
    }
}

# Function to check database
function Test-DatabaseRecord {
    param(
        [string]$Table,
        [string]$Email,
        [string]$Description
    )
    
    Write-Host "Checking database: $Table" -ForegroundColor Cyan
    Write-Host "Description: $Description" -ForegroundColor Gray
    
    try {
        $query = switch ($Table) {
            "users" { "SELECT user_id, email, username, is_email_verified, created_at FROM users WHERE email = '$Email';" }
            "otp_codes" { "SELECT otp_id, email, purpose, expires_at, is_used, created_at FROM otp_codes WHERE email = '$Email' ORDER BY created_at DESC LIMIT 1;" }
        }
        
        $env:PGPASSWORD = "postgres"
        $result = psql -h localhost -p 5431 -U postgres -d bookstore_users -t -c $query 2>&1
        
        if ($LASTEXITCODE -eq 0 -and $result -and $result.Trim() -ne "") {
            Write-Host "✓ Record found" -ForegroundColor Green
            Write-Host $result -ForegroundColor White
            Write-Host ""
            return $true
        } else {
            Write-Host "✗ No record found" -ForegroundColor Yellow
            Write-Host ""
            return $false
        }
    }
    catch {
        Write-Host "✗ Database check failed: $_" -ForegroundColor Red
        Write-Host ""
        return $false
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Task 8.1: Test Successful Registration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Register new user
Write-Host "Step 1: Register new user" -ForegroundColor Yellow
Write-Host "Expected: 201 Created, email sent successfully" -ForegroundColor Gray
$registerResult = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/register" -Body @{
    email = $TEST_EMAIL
    username = $TEST_USERNAME
    password = $TEST_PASSWORD
    full_name = $TEST_FULLNAME
} -Description "Register new user with email verification"

if (-not $registerResult.Success) {
    Write-Host "❌ Registration failed! Cannot continue." -ForegroundColor Red
    exit 1
}

Write-Host "✓ Registration API call successful" -ForegroundColor Green
Write-Host ""

# Step 2: Verify user created in database
Write-Host "Step 2: Verify user created in database" -ForegroundColor Yellow
Write-Host "Expected: User record exists with is_email_verified = false" -ForegroundColor Gray
$userExists = Test-DatabaseRecord -Table "users" -Email $TEST_EMAIL -Description "Check if user was created"

if (-not $userExists) {
    Write-Host "❌ User not found in database!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ User record verified in database" -ForegroundColor Green
Write-Host ""

# Step 3: Verify OTP created in database
Write-Host "Step 3: Verify OTP created in database" -ForegroundColor Yellow
Write-Host "Expected: OTP record exists with purpose = 'register'" -ForegroundColor Gray
$otpExists = Test-DatabaseRecord -Table "otp_codes" -Email $TEST_EMAIL -Description "Check if OTP was stored"

if (-not $otpExists) {
    Write-Host "❌ OTP not found in database!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ OTP record verified in database" -ForegroundColor Green
Write-Host ""

# Step 4: Check Mailtrap inbox
Write-Host "Step 4: Manual verification required" -ForegroundColor Yellow
Write-Host "Please check Mailtrap inbox:" -ForegroundColor White
Write-Host "  URL: https://mailtrap.io/inboxes" -ForegroundColor Cyan
Write-Host "  Login with credentials from .env file" -ForegroundColor Gray
Write-Host "  Expected: Email with OTP code sent to $TEST_EMAIL" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key after verifying email in Mailtrap..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "Task 8.1: COMPLETED" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "  ✓ User registered successfully" -ForegroundColor Green
Write-Host "  ✓ User record created in database" -ForegroundColor Green
Write-Host "  ✓ OTP record created in database" -ForegroundColor Green
Write-Host "  ✓ Email sent (verify manually in Mailtrap)" -ForegroundColor Green
Write-Host ""

# Save test data for next tests
$testData = @{
    email = $TEST_EMAIL
    username = $TEST_USERNAME
    password = $TEST_PASSWORD
}
$testData | ConvertTo-Json | Out-File -FilePath "test-data.json" -Encoding UTF8
Write-Host "Test data saved to test-data.json for subsequent tests" -ForegroundColor Gray
Write-Host ""
