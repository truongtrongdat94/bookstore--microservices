# Profile Integration - Complete Backend API Testing Script
# Tests: Change Password, Address CRUD, Get Orders, Authentication & Authorization

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Profile Integration Backend API Tests" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$API_GATEWAY = "http://localhost:3000"
$TEST_USER_EMAIL = "test@example.com"
$TEST_USER_PASSWORD = "password123"
$NEW_PASSWORD = "newpassword123"

# Test Results Tracking
$testResults = @()

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = @{},
        [string]$Body = $null,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-WebRequest @params -UseBasicParsing
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host "✓ PASSED: $Name (Status: $($response.StatusCode))" -ForegroundColor Green
            $script:testResults += @{Name=$Name; Status="PASSED"; Response=$response.Content}
            return $response
        } else {
            Write-Host "✗ FAILED: $Name (Expected: $ExpectedStatus, Got: $($response.StatusCode))" -ForegroundColor Red
            $script:testResults += @{Name=$Name; Status="FAILED"; Reason="Unexpected status code"}
            return $null
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "✓ PASSED: $Name (Status: $statusCode)" -ForegroundColor Green
            $script:testResults += @{Name=$Name; Status="PASSED"; Response="Expected error"}
            return $null
        } else {
            Write-Host "✗ FAILED: $Name - $($_.Exception.Message)" -ForegroundColor Red
            $script:testResults += @{Name=$Name; Status="FAILED"; Reason=$_.Exception.Message}
            return $null
        }
    }
    
    Write-Host ""
}

# Step 1: Register and Login to get token
Write-Host "`n=== Step 1: Authentication ===" -ForegroundColor Cyan

# Try to register first (might fail if user exists, that's ok)
$registerBody = @{
    email = $TEST_USER_EMAIL
    password = $TEST_USER_PASSWORD
    full_name = "Test User"
} | ConvertTo-Json

Write-Host "Attempting to register test user (may fail if exists)..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri "$API_GATEWAY/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json" -UseBasicParsing | Out-Null
    Write-Host "User registered successfully" -ForegroundColor Green
    
    # If registration succeeded, we need to verify email with OTP
    # For testing, we'll skip this and try to login anyway
    Start-Sleep -Seconds 2
} catch {
    Write-Host "Registration skipped (user may already exist)" -ForegroundColor Yellow
}

# Now login
$loginBody = @{
    email = $TEST_USER_EMAIL
    password = $TEST_USER_PASSWORD
} | ConvertTo-Json

$loginResponse = Test-Endpoint `
    -Name "Login to get JWT token" `
    -Method "POST" `
    -Url "$API_GATEWAY/api/auth/login" `
    -Body $loginBody

if (-not $loginResponse) {
    Write-Host "Cannot proceed without authentication token." -ForegroundColor Red
    Write-Host "Please ensure a verified user exists with email: $TEST_USER_EMAIL and password: $TEST_USER_PASSWORD" -ForegroundColor Yellow
    exit 1
}

$loginData = $loginResponse.Content | ConvertFrom-Json
$token = $loginData.data.token
$authHeaders = @{
    "Authorization" = "Bearer $token"
}

Write-Host "Token obtained: $($token.Substring(0, 20))..." -ForegroundColor Green
Write-Host ""

# Step 2: Test Change Password Endpoint
Write-Host "`n=== Step 2: Change Password Tests ===" -ForegroundColor Cyan

# Test 2.1: Change password with correct old password
$changePasswordBody = @{
    oldPassword = $TEST_USER_PASSWORD
    newPassword = $NEW_PASSWORD
} | ConvertTo-Json

Test-Endpoint `
    -Name "Change password with correct old password" `
    -Method "POST" `
    -Url "$API_GATEWAY/api/users/change-password" `
    -Headers $authHeaders `
    -Body $changePasswordBody

# Test 2.2: Change password back (for future tests)
Start-Sleep -Seconds 1
$changeBackBody = @{
    oldPassword = $NEW_PASSWORD
    newPassword = $TEST_USER_PASSWORD
} | ConvertTo-Json

Test-Endpoint `
    -Name "Change password back to original" `
    -Method "POST" `
    -Url "$API_GATEWAY/api/users/change-password" `
    -Headers $authHeaders `
    -Body $changeBackBody

# Test 2.3: Change password with incorrect old password
$wrongPasswordBody = @{
    oldPassword = "wrongpassword"
    newPassword = "newpass123"
} | ConvertTo-Json

Test-Endpoint `
    -Name "Change password with incorrect old password (should fail)" `
    -Method "POST" `
    -Url "$API_GATEWAY/api/users/change-password" `
    -Headers $authHeaders `
    -Body $wrongPasswordBody `
    -ExpectedStatus 401

# Test 2.4: Change password without authentication
Test-Endpoint `
    -Name "Change password without auth token (should fail)" `
    -Method "POST" `
    -Url "$API_GATEWAY/api/users/change-password" `
    -Body $changePasswordBody `
    -ExpectedStatus 401

Write-Host ""

# Step 3: Test Address CRUD Endpoints
Write-Host "`n=== Step 3: Address CRUD Tests ===" -ForegroundColor Cyan

# Test 3.1: Get addresses (initially empty or existing)
$getAddressesResponse = Test-Endpoint `
    -Name "Get all addresses" `
    -Method "GET" `
    -Url "$API_GATEWAY/api/users/addresses" `
    -Headers $authHeaders

# Test 3.2: Create new address
$createAddressBody = @{
    name = "Nguyen Van Test"
    phone = "0123456789"
    company = "Test Company"
    address = "123 Test Street"
    country = "Vietnam"
    province = "Ha Noi"
    district = "Quan 1"
    ward = "Phuong 1"
    zip_code = "100000"
    is_default = $true
} | ConvertTo-Json

$createAddressResponse = Test-Endpoint `
    -Name "Create new address" `
    -Method "POST" `
    -Url "$API_GATEWAY/api/users/addresses" `
    -Headers $authHeaders `
    -Body $createAddressBody `
    -ExpectedStatus 201

$addressId = $null
if ($createAddressResponse) {
    $addressData = $createAddressResponse.Content | ConvertFrom-Json
    $addressId = $addressData.data.address.address_id
    Write-Host "Created address ID: $addressId" -ForegroundColor Green
}

# Test 3.3: Create second address (non-default)
$createAddress2Body = @{
    name = "Nguyen Van Test 2"
    phone = "0987654321"
    address = "456 Another Street"
    country = "Vietnam"
    province = "Ho Chi Minh"
    district = "Quan 2"
    ward = "Phuong 2"
    is_default = $false
} | ConvertTo-Json

$createAddress2Response = Test-Endpoint `
    -Name "Create second address (non-default)" `
    -Method "POST" `
    -Url "$API_GATEWAY/api/users/addresses" `
    -Headers $authHeaders `
    -Body $createAddress2Body `
    -ExpectedStatus 201

$addressId2 = $null
if ($createAddress2Response) {
    $address2Data = $createAddress2Response.Content | ConvertFrom-Json
    $addressId2 = $address2Data.data.address.address_id
    Write-Host "Created second address ID: $addressId2" -ForegroundColor Green
}

# Test 3.4: Get addresses again (should have 2)
Test-Endpoint `
    -Name "Get all addresses (should have 2)" `
    -Method "GET" `
    -Url "$API_GATEWAY/api/users/addresses" `
    -Headers $authHeaders

# Test 3.5: Update address
if ($addressId) {
    $updateAddressBody = @{
        name = "Nguyen Van Updated"
        phone = "0111222333"
    } | ConvertTo-Json
    
    Test-Endpoint `
        -Name "Update address" `
        -Method "PUT" `
        -Url "$API_GATEWAY/api/users/addresses/$addressId" `
        -Headers $authHeaders `
        -Body $updateAddressBody
}

# Test 3.6: Set default address
if ($addressId2) {
    Test-Endpoint `
        -Name "Set second address as default" `
        -Method "PUT" `
        -Url "$API_GATEWAY/api/users/addresses/$addressId2/default" `
        -Headers $authHeaders
}

# Test 3.7: Delete address
if ($addressId) {
    Test-Endpoint `
        -Name "Delete first address" `
        -Method "DELETE" `
        -Url "$API_GATEWAY/api/users/addresses/$addressId" `
        -Headers $authHeaders
}

# Test 3.8: Try to update non-existent address
Test-Endpoint `
    -Name "Update non-existent address (should fail)" `
    -Method "PUT" `
    -Url "$API_GATEWAY/api/users/addresses/99999" `
    -Headers $authHeaders `
    -Body $updateAddressBody `
    -ExpectedStatus 404

# Test 3.9: Try to delete without authentication
if ($addressId2) {
    Test-Endpoint `
        -Name "Delete address without auth (should fail)" `
        -Method "DELETE" `
        -Url "$API_GATEWAY/api/users/addresses/$addressId2" `
        -ExpectedStatus 401
}

Write-Host ""

# Step 4: Test Get Orders Endpoint
Write-Host "`n=== Step 4: Get Orders Tests ===" -ForegroundColor Cyan

# Test 4.1: Get orders (page 1)
Test-Endpoint `
    -Name "Get user orders (page 1)" `
    -Method "GET" `
    -Url "$API_GATEWAY/api/orders/my-orders?page=1&limit=10" `
    -Headers $authHeaders

# Test 4.2: Get orders (page 2)
Test-Endpoint `
    -Name "Get user orders (page 2)" `
    -Method "GET" `
    -Url "$API_GATEWAY/api/orders/my-orders?page=2&limit=5" `
    -Headers $authHeaders

# Test 4.3: Get orders without authentication
Test-Endpoint `
    -Name "Get orders without auth (should fail)" `
    -Method "GET" `
    -Url "$API_GATEWAY/api/orders/my-orders" `
    -ExpectedStatus 401

Write-Host ""

# Step 5: Test Authorization
Write-Host "`n=== Step 5: Authorization Tests ===" -ForegroundColor Cyan

# Test 5.1: Invalid token
$invalidHeaders = @{
    "Authorization" = "Bearer invalid.token.here"
}

Test-Endpoint `
    -Name "Access with invalid token (should fail)" `
    -Method "GET" `
    -Url "$API_GATEWAY/api/users/addresses" `
    -Headers $invalidHeaders `
    -ExpectedStatus 401

# Test 5.2: Expired/malformed token
$malformedHeaders = @{
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid"
}

Test-Endpoint `
    -Name "Access with malformed token (should fail)" `
    -Method "GET" `
    -Url "$API_GATEWAY/api/users/addresses" `
    -Headers $malformedHeaders `
    -ExpectedStatus 401

Write-Host ""

# Cleanup: Delete remaining test address
if ($addressId2) {
    Write-Host "`n=== Cleanup ===" -ForegroundColor Cyan
    Test-Endpoint `
        -Name "Delete remaining test address" `
        -Method "DELETE" `
        -Url "$API_GATEWAY/api/users/addresses/$addressId2" `
        -Headers $authHeaders
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$passed = ($testResults | Where-Object { $_.Status -eq "PASSED" }).Count
$failed = ($testResults | Where-Object { $_.Status -eq "FAILED" }).Count
$total = $testResults.Count

Write-Host "Total Tests: $total" -ForegroundColor White
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host ""

if ($failed -gt 0) {
    Write-Host "Failed Tests:" -ForegroundColor Red
    $testResults | Where-Object { $_.Status -eq "FAILED" } | ForEach-Object {
        Write-Host "  - $($_.Name): $($_.Reason)" -ForegroundColor Red
    }
}

Write-Host "`nTest completed!" -ForegroundColor Cyan
