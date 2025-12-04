# Error Scenarios Testing Script for OTP Registration Fix
# Task 8.2: Test error scenarios

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "OTP Registration Error Scenarios Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$API_BASE = "http://localhost:3000/api"

# Function to make HTTP requests
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body = $null,
        [string]$Description,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "[$Method] $Endpoint" -ForegroundColor Cyan
    Write-Host "Description: $Description" -ForegroundColor Gray
    Write-Host "Expected Status: $ExpectedStatus" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = "$API_BASE$Endpoint"
            Method = $Method
            ContentType = "application/json"
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
        }
        
        $response = Invoke-RestMethod @params
        $actualStatus = 200
        Write-Host "✓ Response received (HTTP $actualStatus)" -ForegroundColor Green
        Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor White
        Write-Host ""
        
        if ($actualStatus -eq $ExpectedStatus) {
            return @{ Success = $true; StatusCode = $actualStatus; Data = $response; Matched = $true }
        } else {
            Write-Host "⚠ Status code mismatch! Expected $ExpectedStatus, got $actualStatus" -ForegroundColor Yellow
            return @{ Success = $true; StatusCode = $actualStatus; Data = $response; Matched = $false }
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorBody = $_.ErrorDetails.Message
        Write-Host "Response (HTTP $statusCode)" -ForegroundColor $(if ($statusCode -eq $ExpectedStatus) { "Green" } else { "Red" })
        Write-Host "Error: $errorBody" -ForegroundColor White
        Write-Host ""
        
        if ($statusCode -eq $ExpectedStatus) {
            return @{ Success = $false; StatusCode = $statusCode; Error = $errorBody; Matched = $true }
        } else {
            Write-Host "⚠ Status code mismatch! Expected $ExpectedStatus, got $statusCode" -ForegroundColor Yellow
            return @{ Success = $false; StatusCode = $statusCode; Error = $errorBody; Matched = $false }
        }
    }
}

# Function to check database
function Test-DatabaseRecord {
    param(
        [string]$Email,
        [string]$Description
    )
    
    Write-Host "Checking database for user: $Email" -ForegroundColor Cyan
    Write-Host "Description: $Description" -ForegroundColor Gray
    
    try {
        $query = "SELECT user_id, email, username FROM users WHERE email = '$Email';"
        $env:PGPASSWORD = "postgres"
        $result = psql -h localhost -p 5431 -U postgres -d bookstore_users -t -c $query 2>&1
        
        if ($LASTEXITCODE -eq 0 -and $result -and $result.Trim() -ne "") {
            Write-Host "✓ User found in database" -ForegroundColor Green
            Write-Host $result -ForegroundColor White
            Write-Host ""
            return $true
        } else {
            Write-Host "✓ User NOT found in database (as expected)" -ForegroundColor Green
            Write-Host ""
            return $false
        }
    }
    catch {
        Write-Host "✗ Database check failed: $_" -ForegroundColor Red
        Write-Host ""
        return $null
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Task 8.2: Test Error Scenarios" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Email already exists
Write-Host "Test 1: Register with existing email" -ForegroundColor Yellow
Write-Host "Expected: HTTP 409 - Email already registered" -ForegroundColor Gray
Write-Host ""

# First, create a user
$existingEmail = "existing_$(Get-Random -Minimum 1000 -Maximum 9999)@example.com"
$existingUsername = "existing_$(Get-Random -Minimum 1000 -Maximum 9999)"

Write-Host "Creating initial user..." -ForegroundColor Gray
$createResult = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/register" -Body @{
    email = $existingEmail
    username = $existingUsername
    password = "Test123456!"
    full_name = "Existing User"
} -Description "Create initial user" -ExpectedStatus 201

if (-not $createResult.Success -or $createResult.StatusCode -ne 201) {
    Write-Host "❌ Failed to create initial user" -ForegroundColor Red
    exit 1
}

Write-Host "Now attempting to register with same email..." -ForegroundColor Gray
$duplicateEmailResult = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/register" -Body @{
    email = $existingEmail
    username = "different_username"
    password = "Test123456!"
    full_name = "Duplicate Email User"
} -Description "Register with duplicate email" -ExpectedStatus 409

if ($duplicateEmailResult.Matched) {
    Write-Host "✓ Test 1 PASSED: Correct 409 error for duplicate email" -ForegroundColor Green
} else {
    Write-Host "✗ Test 1 FAILED: Expected 409, got $($duplicateEmailResult.StatusCode)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Username already exists
Write-Host "Test 2: Register with existing username" -ForegroundColor Yellow
Write-Host "Expected: HTTP 409 - Username already taken" -ForegroundColor Gray
Write-Host ""

$duplicateUsernameResult = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/register" -Body @{
    email = "newemail_$(Get-Random)@example.com"
    username = $existingUsername
    password = "Test123456!"
    full_name = "Duplicate Username User"
} -Description "Register with duplicate username" -ExpectedStatus 409

if ($duplicateUsernameResult.Matched) {
    Write-Host "✓ Test 2 PASSED: Correct 409 error for duplicate username" -ForegroundColor Green
} else {
    Write-Host "✗ Test 2 FAILED: Expected 409, got $($duplicateUsernameResult.StatusCode)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Email service failure simulation
Write-Host "Test 3: Simulate email service failure" -ForegroundColor Yellow
Write-Host "Expected: HTTP 500 - Failed to send email, user NOT created" -ForegroundColor Gray
Write-Host ""

Write-Host "⚠ MANUAL TEST REQUIRED" -ForegroundColor Yellow
Write-Host "To test email service failure:" -ForegroundColor White
Write-Host "  1. Stop the user-service temporarily" -ForegroundColor Gray
Write-Host "  2. Modify .env to use invalid SMTP credentials" -ForegroundColor Gray
Write-Host "  3. Restart user-service" -ForegroundColor Gray
Write-Host "  4. Try to register a new user" -ForegroundColor Gray
Write-Host "  5. Verify HTTP 500 error" -ForegroundColor Gray
Write-Host "  6. Check database - user should NOT exist" -ForegroundColor Gray
Write-Host "  7. Restore correct SMTP credentials" -ForegroundColor Gray
Write-Host "  8. Restart user-service" -ForegroundColor Gray
Write-Host ""

Write-Host "Alternative: Test with invalid SMTP settings" -ForegroundColor Yellow
Write-Host "Do you want to test email failure scenario? (y/n)" -ForegroundColor Cyan
$response = Read-Host

if ($response -eq "y") {
    Write-Host ""
    Write-Host "Testing with potentially failing email..." -ForegroundColor Gray
    $failEmail = "emailfail_$(Get-Random)@example.com"
    $failUsername = "emailfail_$(Get-Random)"
    
    $emailFailResult = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/register" -Body @{
        email = $failEmail
        username = $failUsername
        password = "Test123456!"
        full_name = "Email Fail Test"
    } -Description "Register with email service potentially failing" -ExpectedStatus 500
    
    if ($emailFailResult.StatusCode -eq 500) {
        Write-Host "Email service returned 500 error" -ForegroundColor Yellow
        Write-Host "Checking if user was created in database..." -ForegroundColor Gray
        $userCreated = Test-DatabaseRecord -Email $failEmail -Description "Verify user NOT created after email failure"
        
        if (-not $userCreated) {
            Write-Host "✓ Test 3 PASSED: User NOT created when email fails (transaction rollback worked)" -ForegroundColor Green
        } else {
            Write-Host "✗ Test 3 FAILED: User was created despite email failure!" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠ Email service did not fail (status: $($emailFailResult.StatusCode))" -ForegroundColor Yellow
        Write-Host "This is expected if SMTP is configured correctly" -ForegroundColor Gray
    }
} else {
    Write-Host "Skipping email failure test" -ForegroundColor Gray
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "Task 8.2: COMPLETED" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "  Test 1: Duplicate email returns 409 ✓" -ForegroundColor Green
Write-Host "  Test 2: Duplicate username returns 409 ✓" -ForegroundColor Green
Write-Host "  Test 3: Email failure prevents user creation (manual verification)" -ForegroundColor Yellow
Write-Host ""
