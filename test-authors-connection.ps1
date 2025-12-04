# Test Authors Feature Connection
Write-Host "=== Testing Authors Feature Connection ===" -ForegroundColor Cyan

# 1. Test Database
Write-Host "`n1. Testing Database..." -ForegroundColor Yellow
$dbResult = docker exec bookstore-microservices-book-db-1 psql -U postgres -d books_db -t -c "SELECT COUNT(*) FROM authors;"
Write-Host "   Authors in DB: $($dbResult.Trim())" -ForegroundColor Green

# 2. Test Book Service Direct
Write-Host "`n2. Testing Book Service (Direct)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002/authors" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Authors returned: $($data.data.Count)" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: $_" -ForegroundColor Red
}

# 3. Test API Gateway
Write-Host "`n3. Testing API Gateway..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/authors" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Authors returned: $($data.data.Count)" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: $_" -ForegroundColor Red
}

# 4. Test Top Authors Endpoint
Write-Host "`n4. Testing Top Authors by Sales..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/authors/top/sales?limit=6" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Top authors returned: $($data.data.Count)" -ForegroundColor Green
    Write-Host "   Top 3 authors:" -ForegroundColor Cyan
    $data.data | Select-Object -First 3 | ForEach-Object {
        Write-Host "     - $($_.name) ($($_.nationality)) - $($_.book_count) books" -ForegroundColor White
    }
} catch {
    Write-Host "   ERROR: $_" -ForegroundColor Red
}

# 5. Test Frontend Server
Write-Host "`n5. Testing Frontend Server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Frontend is running!" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: Frontend not running on port 5173" -ForegroundColor Red
}

# 6. Check Docker Containers
Write-Host "`n6. Checking Docker Containers..." -ForegroundColor Yellow
$containers = @(
    "bookstore-microservices-book-db-1",
    "bookstore-microservices-book-service-1",
    "bookstore-microservices-api-gateway-1"
)

foreach ($container in $containers) {
    $status = docker ps --filter "name=$container" --format "{{.Status}}"
    if ($status) {
        Write-Host "   $container : $status" -ForegroundColor Green
    } else {
        Write-Host "   $container : NOT RUNNING" -ForegroundColor Red
    }
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Open browser to http://localhost:5173" -ForegroundColor White
Write-Host "2. Navigate to 'Tác giả' page" -ForegroundColor White
Write-Host "3. Check browser console (F12) for any errors" -ForegroundColor White
Write-Host "4. Verify authors are displayed" -ForegroundColor White
