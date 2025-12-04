# Simple registration test
$body = '{"email":"testuser999@gmail.com","username":"testuser999","password":"Test123456","fullName":"Test User"}'

Write-Host "Registering..." -ForegroundColor Cyan
curl.exe -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d $body
Write-Host ""
