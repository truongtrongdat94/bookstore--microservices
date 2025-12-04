# Test Gmail OTP - Gửi email thật đến user
Write-Host "=== TEST GMAIL OTP - GỬI EMAIL THẬT ===" -ForegroundColor Cyan
Write-Host ""

# Nhập email người nhận
$recipientEmail = Read-Host "Nhập email người nhận (ví dụ: yourfriend@gmail.com)"

if ([string]::IsNullOrWhiteSpace($recipientEmail)) {
    Write-Host "❌ Bạn phải nhập email!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📧 Đang gửi OTP đến: $recipientEmail" -ForegroundColor Yellow
Write-Host ""

# Đăng ký tài khoản mới
$registerBody = @{
    email = $recipientEmail
    password = "Test123456"
    fullName = "Test User"
} | ConvertTo-Json

Write-Host "1️⃣ Đăng ký tài khoản..." -ForegroundColor Cyan
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $registerBody `
    -ErrorAction Stop

Write-Host "✅ Đăng ký thành công!" -ForegroundColor Green
Write-Host "   Message: $($response.message)" -ForegroundColor White
Write-Host ""

Write-Host "📬 Email OTP đã được gửi đến: $recipientEmail" -ForegroundColor Green
Write-Host "   Kiểm tra hộp thư đến (hoặc spam) của bạn!" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Thông tin email:" -ForegroundColor Cyan
Write-Host "   From: Bookstore <23520277@gm.uit.edu.vn>" -ForegroundColor White
Write-Host "   To: $recipientEmail" -ForegroundColor White
Write-Host "   Subject: Xác thực tài khoản Bookstore" -ForegroundColor White
Write-Host ""

# Hướng dẫn verify
Write-Host "🔐 Để xác thực tài khoản, dùng lệnh sau:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/verify-email' ``" -ForegroundColor Yellow
Write-Host "    -Method POST ``" -ForegroundColor Yellow
Write-Host "    -ContentType 'application/json' ``" -ForegroundColor Yellow
Write-Host "    -Body '{`"email`":`"$recipientEmail`",`"otp`":`"NHAP_MA_OTP_TU_EMAIL`"}'" -ForegroundColor Yellow
Write-Host ""
