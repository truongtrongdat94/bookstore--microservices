# Test login sau khi verify email
Write-Host "=== TEST LOGIN SAU KHI VERIFY EMAIL ===" -ForegroundColor Cyan
Write-Host ""

$email = "hookeyem2@gmail.com"
$password = "Test123456"

Write-Host "📧 Email: $email" -ForegroundColor Yellow
Write-Host "🔑 Password: $password" -ForegroundColor Yellow
Write-Host ""

Write-Host "🔐 Đang đăng nhập..." -ForegroundColor Cyan

$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -ErrorAction Stop
    
    Write-Host "✅ ĐĂNG NHẬP THÀNH CÔNG!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Thông tin user:" -ForegroundColor Cyan
    Write-Host "   User ID: $($response.user.user_id)" -ForegroundColor White
    Write-Host "   Username: $($response.user.username)" -ForegroundColor White
    Write-Host "   Email: $($response.user.email)" -ForegroundColor White
    Write-Host "   Full Name: $($response.user.full_name)" -ForegroundColor White
    Write-Host ""
    Write-Host "🎫 Token: $($response.token.substring(0, 50))..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "✅ Fix thành công! User đã verify có thể đăng nhập!" -ForegroundColor Green
    
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "❌ ĐĂNG NHẬP THẤT BẠI!" -ForegroundColor Red
    Write-Host "   Error: $($errorResponse.message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠️ Vẫn còn lỗi! Cần kiểm tra thêm." -ForegroundColor Yellow
}
