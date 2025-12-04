$body = @{
    username = "testdirect$(Get-Random -Maximum 9999)"
    email = "testdirect$(Get-Random -Maximum 9999)@example.com"
    password = "Test@123"
    full_name = "Test Direct"
} | ConvertTo-Json

Write-Host "Testing User Service DIRECT (port 3001)..." -ForegroundColor Cyan
Write-Host "URL: http://localhost:3001/auth/register" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 10
    
    Write-Host "`nSuccess! Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "`nError occurred!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
