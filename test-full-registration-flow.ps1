# Test toàn bộ flow: Register -> Verify -> Login
Write-Host "=== TEST FULL REGISTRATION FLOW ===" -ForegroundColor Cyan
Write-Host ""

# Generate random email
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$testEmail = "test$timestamp@gmail.com"
$testUsername = "user$timestamp"
$testPassword = "Test123456"

Write-Host "📧 Test Email: $testEmail" -ForegroundColor Yellow
Write-Host "👤 Username: $testUsername" -ForegroundColor Yellow
Write-Host "🔑 Password: $testPassword" -ForegroundColor Yellow
Write-Host ""

# Step 1: Register
Write-Host "1️⃣ Đăng ký tài khoản..." -ForegroundColor Cyan
$registerBody = @{
    email = $testEmail
    username = $testUsername
    password = $testPassword
    fullName = "Test User"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerBody `
        -ErrorAction Stop
    
    Write-Host "✅ Đăng ký thành công!" -ForegroundColor Green
    Write-Host "   Message: $($registerResponse.message)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "❌ Đăng ký thất bại!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Get OTP from database
Write-Host "2️⃣ Lấy mã OTP từ database..." -ForegroundColor Cyan
$otpQuery = "SELECT otp_code FROM otp_codes WHERE email = '$testEmail' AND purpose = 'register' AND is_used = FALSE ORDER BY created_at DESC LIMIT 1;"
$otpCode = docker exec bookstore-microservices-user-db-1 psql -U postgres -d users_db -t -c $otpQuery | ForEach-Object { $_.Trim() }

if ([string]::IsNullOrWhiteSpace($otpCode)) {
    Write-Host "❌ Không tìm thấy OTP!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ OTP Code: $otpCode" -ForegroundColor Green
Write-Host ""

# Step 3: Verify email
Write-Host "3️⃣ Xác thực email với OTP..." -ForegroundColor Cyan
$verifyBody = @{
    email = $testEmail
    otp = $otpCode
} | ConvertTo-Json

try {
    $verifyResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/verify-email" `
        -Method POST `
        -ContentType "application/json" `
        -Body $verifyBody `
        -ErrorAction Stop
    
    Write-Host "✅ Xác thực thành công!" -ForegroundColor Green
    Write-Host "   User ID: $($verifyResponse.user.id)" -ForegroundColor White
    Write-Host "   Token nhận được: $($verifyResponse.token.substring(0, 30))..." -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "❌ Xác thực thất bại!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 4: Login
Write-Host "4️⃣ Đăng nhập với tài khoản đã verify..." -ForegroundColor Cyan
$loginBody = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -ErrorAction Stop
    
    Write-Host "✅ ĐĂNG NHẬP THÀNH CÔNG!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Thông tin user:" -ForegroundColor Cyan
    Write-Host "   User ID: $($loginResponse.user.user_id)" -ForegroundColor White
    Write-Host "   Username: $($loginResponse.user.username)" -ForegroundColor White
    Write-Host "   Email: $($loginResponse.user.email)" -ForegroundColor White
    Write-Host "   Email Verified: $($loginResponse.user.is_email_verified)" -ForegroundColor White
    Write-Host ""
    Write-Host "🎫 Token: $($loginResponse.token.substring(0, 50))..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🎉 TOÀN BỘ FLOW HOẠT ĐỘNG HOÀN HẢO!" -ForegroundColor Green
    
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "❌ ĐĂNG NHẬP THẤT BẠI!" -ForegroundColor Red
    Write-Host "   Error: $($errorResponse.message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠️ Vẫn còn lỗi trong flow!" -ForegroundColor Yellow
    exit 1
}
