# Test VietQR Checkout Flow
# This script tests the checkout API with VietQR payment

$baseUrl = "http://localhost:3000/api"

Write-Host "=== Testing VietQR Checkout Flow ===" -ForegroundColor Cyan

# Step 1: Login to get token
Write-Host "`n1. Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = "qrtest@example.com"
    password = "Test123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.token
    Write-Host "Login successful! Token received." -ForegroundColor Green
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please make sure you have a test user registered." -ForegroundColor Yellow
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Step 2: Add item to cart
Write-Host "`n2. Adding item to cart..." -ForegroundColor Yellow
$cartBody = @{
    book_id = 1
    quantity = 1
} | ConvertTo-Json

try {
    $cartResponse = Invoke-RestMethod -Uri "$baseUrl/cart/items" -Method POST -Body $cartBody -Headers $headers
    Write-Host "Item added to cart!" -ForegroundColor Green
    Write-Host "Cart items: $($cartResponse.data.items.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "Add to cart failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 3: Get cart to verify
Write-Host "`n3. Getting cart..." -ForegroundColor Yellow
try {
    $getCartResponse = Invoke-RestMethod -Uri "$baseUrl/cart" -Method GET -Headers $headers
    Write-Host "Cart retrieved!" -ForegroundColor Green
    Write-Host "Total items: $($getCartResponse.data.items.Count)" -ForegroundColor Cyan
    Write-Host "Total amount: $($getCartResponse.data.total_amount)" -ForegroundColor Cyan
} catch {
    Write-Host "Get cart failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Checkout with VietQR
Write-Host "`n4. Checking out with VietQR..." -ForegroundColor Yellow
$checkoutBody = @{
    shipping_address = "123 Test Street, District 1, Ho Chi Minh City"
    payment_method = "bank_transfer"
} | ConvertTo-Json

try {
    $checkoutResponse = Invoke-RestMethod -Uri "$baseUrl/orders/checkout" -Method POST -Body $checkoutBody -Headers $headers
    Write-Host "Checkout successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "=== Order Details ===" -ForegroundColor Cyan
    Write-Host "Order ID: $($checkoutResponse.data.order_id)" -ForegroundColor White
    Write-Host "Order Number: $($checkoutResponse.data.order_number)" -ForegroundColor White
    Write-Host "Total Amount: $($checkoutResponse.data.total_amount)" -ForegroundColor White
    Write-Host "Status: $($checkoutResponse.data.status)" -ForegroundColor White
    Write-Host "Payment Status: $($checkoutResponse.data.payment_status)" -ForegroundColor White
    Write-Host ""
    Write-Host "=== Payment Info ===" -ForegroundColor Cyan
    Write-Host "QR Data URL: $($checkoutResponse.data.payment.qr_data_url.Substring(0, 50))..." -ForegroundColor White
    Write-Host "Transfer Content: $($checkoutResponse.data.payment.transfer_content)" -ForegroundColor White
    Write-Host "Bank: $($checkoutResponse.data.payment.bank_info.bank_name)" -ForegroundColor White
    Write-Host "Account: $($checkoutResponse.data.payment.bank_info.account_no)" -ForegroundColor White
    Write-Host "Account Name: $($checkoutResponse.data.payment.bank_info.account_name)" -ForegroundColor White
    Write-Host "Expires At: $($checkoutResponse.data.payment.expires_at)" -ForegroundColor White
    Write-Host "Expires In: $($checkoutResponse.data.payment.expires_in_seconds) seconds" -ForegroundColor White
    Write-Host ""
    Write-Host "=== SUCCESS! VietQR is working! ===" -ForegroundColor Green
} catch {
    Write-Host "Checkout failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Yellow
    }
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
