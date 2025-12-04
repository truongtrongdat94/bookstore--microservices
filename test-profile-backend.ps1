# Test Profile Page Backend APIs
# This script tests all backend endpoints for the profile page integration

Write-Host "=== Profile Page Backend API Tests ===" -ForegroundColor Cyan
Write-Host ""

# Configuration
$API_GATEWAY = "http://localhost:3000"
$TEST_USER_EMAIL = "test@example.com"
$TEST_USER_PASSWORD = "password123"

# Step 1: Login to get token
Write-Host "1. Logging in to get authentication token..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "$API_GATEWAY/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body (@{
        email = $TEST_USER_EMAIL
        password = $TEST_USER_PASSWORD
    } | ConvertTo-Json) `
    -ErrorAction Stop

$TOKEN = $loginResponse.data.token
Write-Host "✓ Login successful. Token obtained." -ForegroundColor Green
Write-Host ""

# Headers with authentication
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

# Step 2: Test Get Addresses
Write-Host "2. Testing GET /api/users/addresses..." -ForegroundColor Yellow
try {
    $addressesResponse = Invoke-RestMethod -Uri "$API_GATEWAY/api/users/addresses" `
        -Method GET `
        -Headers $headers
    
    Write-Host "✓ Get addresses successful" -ForegroundColor Green
    Write-Host "  Found $($addressesResponse.data.addresses.Count) addresses" -ForegroundColor Gray
    $addressesResponse.data.addresses | ForEach-Object {
        Write-Host "  - $($_.name): $($_.address), $($_.ward), $($_.district), $($_.province)" -ForegroundColor Gray
        if ($_.is_default) {
            Write-Host "    [DEFAULT]" -ForegroundColor Cyan
        }
    }
} catch {
    Write-Host "✗ Get addresses failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Step 3: Test Create Address
Write-Host "3. Testing POST /api/users/addresses (Create)..." -ForegroundColor Yellow
try {
    $newAddress = @{
        name = "Nguyễn Văn Test"
        phone = "0987654321"
        company = "Test Company"
        address = "123 Đường Test"
        country = "Vietnam"
        province = "Hà Nội"
        district = "Quận Ba Đình"
        ward = "Phường Điện Biên"
        zip_code = "100000"
        is_default = $false
    }
    
    $createResponse = Invoke-RestMethod -Uri "$API_GATEWAY/api/users/addresses" `
        -Method POST `
        -Headers $headers `
        -Body ($newAddress | ConvertTo-Json)
    
    $createdAddressId = $createResponse.data.address.address_id
    Write-Host "✓ Create address successful" -ForegroundColor Green
    Write-Host "  Address ID: $createdAddressId" -ForegroundColor Gray
    Write-Host "  Name: $($createResponse.data.address.name)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Create address failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Step 4: Test Update Address
if ($createdAddressId) {
    Write-Host "4. Testing PUT /api/users/addresses/:id (Update)..." -ForegroundColor Yellow
    try {
        $updateData = @{
            name = "Nguyễn Văn Test Updated"
            phone = "0123456789"
        }
        
        $updateResponse = Invoke-RestMethod -Uri "$API_GATEWAY/api/users/addresses/$createdAddressId" `
            -Method PUT `
            -Headers $headers `
            -Body ($updateData | ConvertTo-Json)
        
        Write-Host "✓ Update address successful" -ForegroundColor Green
        Write-Host "  Updated name: $($updateResponse.data.address.name)" -ForegroundColor Gray
        Write-Host "  Updated phone: $($updateResponse.data.address.phone)" -ForegroundColor Gray
    } catch {
        Write-Host "✗ Update address failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Step 5: Test Set Default Address
if ($createdAddressId) {
    Write-Host "5. Testing PUT /api/users/addresses/:id/default (Set Default)..." -ForegroundColor Yellow
    try {
        $defaultResponse = Invoke-RestMethod -Uri "$API_GATEWAY/api/users/addresses/$createdAddressId/default" `
            -Method PUT `
            -Headers $headers
        
        Write-Host "✓ Set default address successful" -ForegroundColor Green
        Write-Host "  Address $createdAddressId is now default: $($defaultResponse.data.address.is_default)" -ForegroundColor Gray
    } catch {
        Write-Host "✗ Set default address failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Step 6: Test Change Password
Write-Host "6. Testing POST /api/users/change-password..." -ForegroundColor Yellow
try {
    $passwordData = @{
        oldPassword = $TEST_USER_PASSWORD
        newPassword = $TEST_USER_PASSWORD  # Using same password for test
    }
    
    $passwordResponse = Invoke-RestMethod -Uri "$API_GATEWAY/api/users/change-password" `
        -Method POST `
        -Headers $headers `
        -Body ($passwordData | ConvertTo-Json)
    
    Write-Host "✓ Change password successful" -ForegroundColor Green
    Write-Host "  Message: $($passwordResponse.data.message)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Change password failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Step 7: Test Get My Orders
Write-Host "7. Testing GET /api/orders/my-orders..." -ForegroundColor Yellow
try {
    $ordersResponse = Invoke-RestMethod -Uri "$API_GATEWAY/api/orders/my-orders?page=1&limit=10" `
        -Method GET `
        -Headers $headers
    
    Write-Host "✓ Get orders successful" -ForegroundColor Green
    Write-Host "  Total orders: $($ordersResponse.data.pagination.total)" -ForegroundColor Gray
    Write-Host "  Page: $($ordersResponse.data.pagination.page)/$($ordersResponse.data.pagination.totalPages)" -ForegroundColor Gray
    
    if ($ordersResponse.data.orders.Count -gt 0) {
        $ordersResponse.data.orders | Select-Object -First 3 | ForEach-Object {
            Write-Host "  - Order #$($_.order_number): $($_.total_amount) VND - $($_.payment_status)" -ForegroundColor Gray
        }
    } else {
        Write-Host "  No orders found" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Get orders failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Step 8: Test Delete Address
if ($createdAddressId) {
    Write-Host "8. Testing DELETE /api/users/addresses/:id..." -ForegroundColor Yellow
    try {
        $deleteResponse = Invoke-RestMethod -Uri "$API_GATEWAY/api/users/addresses/$createdAddressId" `
            -Method DELETE `
            -Headers $headers
        
        Write-Host "✓ Delete address successful" -ForegroundColor Green
        Write-Host "  Message: $($deleteResponse.data.message)" -ForegroundColor Gray
    } catch {
        Write-Host "✗ Delete address failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Step 9: Test Authentication - Invalid Token
Write-Host "9. Testing authentication with invalid token..." -ForegroundColor Yellow
try {
    $invalidHeaders = @{
        "Authorization" = "Bearer invalid_token_here"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri "$API_GATEWAY/api/users/addresses" `
        -Method GET `
        -Headers $invalidHeaders `
        -ErrorAction Stop
    
    Write-Host "✗ Should have failed with invalid token" -ForegroundColor Red
} catch {
    Write-Host "✓ Correctly rejected invalid token" -ForegroundColor Green
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# Step 10: Test Validation - Invalid Password Change
Write-Host "10. Testing validation with short password..." -ForegroundColor Yellow
try {
    $invalidPasswordData = @{
        oldPassword = $TEST_USER_PASSWORD
        newPassword = "short"  # Less than 8 characters
    }
    
    $response = Invoke-RestMethod -Uri "$API_GATEWAY/api/users/change-password" `
        -Method POST `
        -Headers $headers `
        -Body ($invalidPasswordData | ConvertTo-Json) `
        -ErrorAction Stop
    
    Write-Host "✗ Should have failed validation" -ForegroundColor Red
} catch {
    Write-Host "✓ Correctly rejected short password" -ForegroundColor Green
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

Write-Host "=== Backend API Tests Complete ===" -ForegroundColor Cyan
