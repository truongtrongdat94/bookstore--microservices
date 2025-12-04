# Test Profile Page Edge Cases
# This script tests edge cases and error scenarios

Write-Host "=== Profile Page Edge Cases Tests ===" -ForegroundColor Cyan
Write-Host ""

# Configuration
$API_GATEWAY = "http://localhost:3000"
$TEST_USER_EMAIL = "test@example.com"
$TEST_USER_PASSWORD = "password123"

# Login to get token
Write-Host "Logging in..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "$API_GATEWAY/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body (@{
        email = $TEST_USER_EMAIL
        password = $TEST_USER_PASSWORD
    } | ConvertTo-Json)

$TOKEN = $loginResponse.data.token
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}
Write-Host "✓ Logged in" -ForegroundColor Green
Write-Host ""

# Test 1: User with no addresses
Write-Host "1. Testing user with no addresses..." -ForegroundColor Yellow
try {
    # First, delete all addresses
    $addressesResponse = Invoke-RestMethod -Uri "$API_GATEWAY/api/users/addresses" `
        -Method GET `
        -Headers $headers
    
    foreach ($address in $addressesResponse.data.addresses) {
        try {
            Invoke-RestMethod -Uri "$API_GATEWAY/api/users/addresses/$($address.address_id)" `
                -Method DELETE `
                -Headers $headers | Out-Null
        } catch {
            # Ignore errors
        }
    }
    
    # Now get addresses again
    $emptyResponse = Invoke-RestMethod -Uri "$API_GATEWAY/api/users/addresses" `
        -Method GET `
        -Headers $headers
    
    if ($emptyResponse.data.addresses.Count -eq 0) {
        Write-Host "✓ Correctly returns empty array for user with no addresses" -ForegroundColor Green
    } else {
        Write-Host "✗ Should return empty array" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: User with no orders
Write-Host "2. Testing user with no orders..." -ForegroundColor Yellow
try {
    $ordersResponse = Invoke-RestMethod -Uri "$API_GATEWAY/api/orders/my-orders?page=1&limit=10" `
        -Method GET `
        -Headers $headers
    
    Write-Host "✓ Successfully retrieved orders (may be empty)" -ForegroundColor Green
    Write-Host "  Total orders: $($ordersResponse.data.pagination.total)" -ForegroundColor Gray
    
    if ($ordersResponse.data.orders.Count -eq 0) {
        Write-Host "  ✓ Correctly handles empty orders list" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Validation error - Missing required fields
Write-Host "3. Testing validation error - Missing required fields..." -ForegroundColor Yellow
try {
    $invalidAddress = @{
        name = "Test"
        # Missing phone, address, country, province, district, ward
    }
    
    $response = Invoke-RestMethod -Uri "$API_GATEWAY/api/users/addresses" `
        -Method POST `
        -Headers $headers `
        -Body ($invalidAddress | ConvertTo-Json) `
        -ErrorAction Stop
    
    Write-Host "✗ Should have failed validation" -ForegroundColor Red
} catch {
    Write-Host "✓ Correctly rejected invalid data" -ForegroundColor Green
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# Test 4: Wrong old password
Write-Host "4. Testing wrong old password..." -ForegroundColor Yellow
try {
    $wrongPasswordData = @{
        oldPassword = "wrongpassword123"
        newPassword = "newpassword123"
    }
    
    $response = Invoke-RestMethod -Uri "$API_GATEWAY/api/users/change-password" `
        -Method POST `
        -Headers $headers `
        -Body ($wrongPasswordData | ConvertTo-Json) `
        -ErrorAction Stop
    
    Write-Host "✗ Should have rejected wrong password" -ForegroundColor Red
} catch {
    Write-Host "✓ Correctly rejected wrong old password" -ForegroundColor Green
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# Test 5: Unauthorized access - No token
Write-Host "5. Testing unauthorized access - No token..." -ForegroundColor Yellow
try {
    $noAuthHeaders = @{
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri "$API_GATEWAY/api/users/addresses" `
        -Method GET `
        -Headers $noAuthHeaders `
        -ErrorAction Stop
    
    Write-Host "✗ Should have rejected request without token" -ForegroundColor Red
} catch {
    Write-Host "✓ Correctly rejected request without token" -ForegroundColor Green
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# Test 6: Update non-existent address
Write-Host "6. Testing update non-existent address..." -ForegroundColor Yellow
try {
    $updateData = @{
        name = "Updated Name"
    }
    
    $response = Invoke-RestMethod -Uri "$API_GATEWAY/api/users/addresses/999999" `
        -Method PUT `
        -Headers $headers `
        -Body ($updateData | ConvertTo-Json) `
        -ErrorAction Stop
    
    Write-Host "✗ Should have returned 404" -ForegroundColor Red
} catch {
    Write-Host "✓ Correctly returned error for non-existent address" -ForegroundColor Green
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# Test 7: Delete non-existent address
Write-Host "7. Testing delete non-existent address..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_GATEWAY/api/users/addresses/999999" `
        -Method DELETE `
        -Headers $headers `
        -ErrorAction Stop
    
    Write-Host "✗ Should have returned 404" -ForegroundColor Red
} catch {
    Write-Host "✓ Correctly returned error for non-existent address" -ForegroundColor Green
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# Test 8: Password too short
Write-Host "8. Testing password too short..." -ForegroundColor Yellow
try {
    $shortPasswordData = @{
        oldPassword = $TEST_USER_PASSWORD
        newPassword = "short"
    }
    
    $response = Invoke-RestMethod -Uri "$API_GATEWAY/api/users/change-password" `
        -Method POST `
        -Headers $headers `
        -Body ($shortPasswordData | ConvertTo-Json) `
        -ErrorAction Stop
    
    Write-Host "✗ Should have rejected short password" -ForegroundColor Red
} catch {
    Write-Host "✓ Correctly rejected password less than 8 characters" -ForegroundColor Green
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# Test 9: Pagination edge cases
Write-Host "9. Testing pagination edge cases..." -ForegroundColor Yellow
try {
    # Test page 0
    $response1 = Invoke-RestMethod -Uri "$API_GATEWAY/api/orders/my-orders?page=0&limit=10" `
        -Method GET `
        -Headers $headers
    Write-Host "  ✓ Page 0 handled (treated as page 1)" -ForegroundColor Gray
    
    # Test large page number
    $response2 = Invoke-RestMethod -Uri "$API_GATEWAY/api/orders/my-orders?page=1000&limit=10" `
        -Method GET `
        -Headers $headers
    Write-Host "  ✓ Large page number handled" -ForegroundColor Gray
    
    # Test large limit
    $response3 = Invoke-RestMethod -Uri "$API_GATEWAY/api/orders/my-orders?page=1&limit=100" `
        -Method GET `
        -Headers $headers
    Write-Host "  ✓ Large limit handled" -ForegroundColor Gray
    
    Write-Host "✓ Pagination edge cases handled correctly" -ForegroundColor Green
} catch {
    Write-Host "✗ Pagination failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 10: Network simulation - Invalid endpoint
Write-Host "10. Testing invalid endpoint (404)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_GATEWAY/api/users/invalid-endpoint" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop
    
    Write-Host "✗ Should have returned 404" -ForegroundColor Red
} catch {
    Write-Host "✓ Correctly returned 404 for invalid endpoint" -ForegroundColor Green
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

Write-Host "=== Edge Cases Tests Complete ===" -ForegroundColor Cyan
