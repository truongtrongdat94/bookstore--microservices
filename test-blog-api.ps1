# Test Blog Service API Endpoints
# Task 9.1: Test blog service API endpoints

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Blog Service API Testing" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api/blogs"
$testsPassed = 0
$testsFailed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    Write-Host "URL: $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            TimeoutSec = 10
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params -UseBasicParsing
        
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ PASSED - Status: $($response.StatusCode)" -ForegroundColor Green
            
            $content = $response.Content | ConvertFrom-Json
            Write-Host "Response preview:" -ForegroundColor Gray
            Write-Host ($content | ConvertTo-Json -Depth 2 | Select-Object -First 500) -ForegroundColor Gray
            
            $script:testsPassed++
            return $content
        } else {
            Write-Host "✗ FAILED - Status: $($response.StatusCode)" -ForegroundColor Red
            $script:testsFailed++
            return $null
        }
    }
    catch {
        Write-Host "✗ FAILED - Error: $($_.Exception.Message)" -ForegroundColor Red
        $script:testsFailed++
        return $null
    }
    
    Write-Host ""
}

# Check if blog service is running
Write-Host "Checking if blog service is accessible..." -ForegroundColor Cyan
try {
    $healthCheck = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "✓ API Gateway is running" -ForegroundColor Green
} catch {
    Write-Host "✗ API Gateway is not accessible at http://localhost:3000" -ForegroundColor Red
    Write-Host "Please start services with: docker compose -f docker-compose.dev.yml up -d" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Test 1: GET /api/blogs (default pagination)
Write-Host "Test 1: Get all blogs with default pagination" -ForegroundColor Cyan
$result = Test-Endpoint -Name "GET /api/blogs" -Url "$baseUrl"

# Test 2: GET /api/blogs with pagination parameters
Write-Host "Test 2: Get blogs with custom pagination (page=1, limit=5)" -ForegroundColor Cyan
$result = Test-Endpoint -Name "GET /api/blogs?page=1&limit=5" -Url "$baseUrl`?page=1&limit=5"

# Test 3: GET /api/blogs with category filter
Write-Host "Test 3: Get blogs filtered by category" -ForegroundColor Cyan
$result = Test-Endpoint -Name "GET /api/blogs?category=Tin UIT" -Url "$baseUrl`?category=Tin%20UIT"

# Test 4: GET /api/blogs with featured filter
Write-Host "Test 4: Get featured blogs only" -ForegroundColor Cyan
$result = Test-Endpoint -Name "GET /api/blogs?featured=true" -Url "$baseUrl`?featured=true"

# Test 5: GET /api/blogs/categories
Write-Host "Test 5: Get all blog categories" -ForegroundColor Cyan
$categories = Test-Endpoint -Name "GET /api/blogs/categories" -Url "$baseUrl/categories"

# Test 6: GET /api/blogs/:id with valid ID
Write-Host "Test 6: Get blog by valid ID" -ForegroundColor Cyan
$result = Test-Endpoint -Name "GET /api/blogs/1" -Url "$baseUrl/1"

# Test 7: GET /api/blogs/:id with invalid ID
Write-Host "Test 7: Get blog by invalid ID (should return 404)" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/99999" -UseBasicParsing -TimeoutSec 10
    Write-Host "✗ FAILED - Should return 404 but got: $($response.StatusCode)" -ForegroundColor Red
    $script:testsFailed++
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-Host "✓ PASSED - Correctly returned 404" -ForegroundColor Green
        $script:testsPassed++
    } else {
        Write-Host "✗ FAILED - Expected 404 but got: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        $script:testsFailed++
    }
}
Write-Host ""

# Test 8: GET /api/blogs/slug/:slug with valid slug
Write-Host "Test 8: Get blog by valid slug" -ForegroundColor Cyan
$result = Test-Endpoint -Name "GET /api/blogs/slug/test-slug" -Url "$baseUrl/slug/test-slug"

# Test 9: GET /api/blogs/related/:id
Write-Host "Test 9: Get related blogs" -ForegroundColor Cyan
$result = Test-Endpoint -Name "GET /api/blogs/related/1" -Url "$baseUrl/related/1"

# Test 10: Verify Vietnamese categories
Write-Host "Test 10: Verify Vietnamese category names" -ForegroundColor Cyan
if ($categories) {
    $expectedCategories = @("Tin UIT", "Review sách của độc giả", "Tin sách trên báo chí", "Biên tập viên giới thiệu", "Đọc giả")
    $foundCategories = @()
    
    foreach ($cat in $categories) {
        if ($expectedCategories -contains $cat) {
            $foundCategories += $cat
        }
    }
    
    Write-Host "Expected categories: $($expectedCategories -join ', ')" -ForegroundColor Gray
    Write-Host "Found categories: $($foundCategories -join ', ')" -ForegroundColor Gray
    
    if ($foundCategories.Count -eq $expectedCategories.Count) {
        Write-Host "✓ PASSED - All Vietnamese categories found" -ForegroundColor Green
        $script:testsPassed++
    } else {
        Write-Host "✗ FAILED - Missing categories: $($expectedCategories | Where-Object { $_ -notin $foundCategories } | Join-String -Separator ', ')" -ForegroundColor Red
        $script:testsFailed++
    }
} else {
    Write-Host "✗ FAILED - Could not retrieve categories" -ForegroundColor Red
    $script:testsFailed++
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Tests Passed: $testsPassed" -ForegroundColor Green
Write-Host "Tests Failed: $testsFailed" -ForegroundColor Red
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "✓ All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "✗ Some tests failed. Please review the output above." -ForegroundColor Red
    exit 1
}
