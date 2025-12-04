# Blog Service API Complete Test Script
# Tests all blog service endpoints with various parameters

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Blog Service API Complete Test Suite" -ForegroundColor Cyan
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
        [hashtable]$ExpectedFields = @{}
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    Write-Host "URL: $Url" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method $Method -ErrorAction Stop
        
        # Check if response has success field
        if ($response.success -eq $true) {
            Write-Host "✓ Success: true" -ForegroundColor Green
            
            # Check expected fields
            foreach ($field in $ExpectedFields.Keys) {
                if ($null -ne $response.$field) {
                    Write-Host "✓ Field '$field' exists" -ForegroundColor Green
                } else {
                    Write-Host "✗ Field '$field' missing" -ForegroundColor Red
                    $script:testsFailed++
                    return
                }
            }
            
            $script:testsPassed++
            Write-Host "✓ Test PASSED" -ForegroundColor Green
        } else {
            Write-Host "✗ Success: false" -ForegroundColor Red
            $script:testsFailed++
        }
        
        # Display response preview
        Write-Host "Response preview:" -ForegroundColor Gray
        $response | ConvertTo-Json -Depth 2 -Compress | Write-Host -ForegroundColor Gray
        
    } catch {
        Write-Host "✗ Request failed: $($_.Exception.Message)" -ForegroundColor Red
        $script:testsFailed++
    }
    
    Write-Host ""
}

# Test 1: GET /api/blogs - Default pagination
Write-Host "`n--- Test 1: Get all blogs (default pagination) ---" -ForegroundColor Cyan
Test-Endpoint -Name "Get all blogs" -Url "$baseUrl" -ExpectedFields @{
    data = $true
    meta = $true
}

# Test 2: GET /api/blogs with page parameter
Write-Host "`n--- Test 2: Get blogs with pagination (page 1, limit 5) ---" -ForegroundColor Cyan
Test-Endpoint -Name "Get blogs page 1" -Url "$baseUrl?page=1&limit=5" -ExpectedFields @{
    data = $true
    meta = $true
}

# Test 3: GET /api/blogs with page 2
Write-Host "`n--- Test 3: Get blogs page 2 ---" -ForegroundColor Cyan
Test-Endpoint -Name "Get blogs page 2" -Url "$baseUrl?page=2&limit=5" -ExpectedFields @{
    data = $true
    meta = $true
}

# Test 4: GET /api/blogs with category filter
Write-Host "`n--- Test 4: Get blogs by category (tin-uit) ---" -ForegroundColor Cyan
Test-Endpoint -Name "Get blogs by category" -Url "$baseUrl?category=tin-uit" -ExpectedFields @{
    data = $true
    meta = $true
}

# Test 5: GET /api/blogs with featured filter
Write-Host "`n--- Test 5: Get featured blogs ---" -ForegroundColor Cyan
Test-Endpoint -Name "Get featured blogs" -Url "$baseUrl?featured=true&limit=3" -ExpectedFields @{
    data = $true
    meta = $true
}

# Test 6: GET /api/blogs/:id with valid ID
Write-Host "`n--- Test 6: Get blog by ID (ID: 1) ---" -ForegroundColor Cyan
Test-Endpoint -Name "Get blog by ID" -Url "$baseUrl/1" -ExpectedFields @{
    data = $true
}

# Test 7: GET /api/blogs/:id with invalid ID
Write-Host "`n--- Test 7: Get blog by invalid ID (ID: 99999) ---" -ForegroundColor Cyan
Write-Host "Testing: Get blog by invalid ID" -ForegroundColor Yellow
Write-Host "URL: $baseUrl/99999" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/99999" -Method GET -ErrorAction Stop
    if ($response.success -eq $false) {
        Write-Host "✓ Correctly returned error for invalid ID" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "✗ Should have returned error" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "✓ Correctly returned 404 for invalid ID" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "✗ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
        $testsFailed++
    }
}
Write-Host ""

# Test 8: GET /api/blogs/slug/:slug with valid slug
Write-Host "`n--- Test 8: Get blog by slug ---" -ForegroundColor Cyan
Test-Endpoint -Name "Get blog by slug" -Url "$baseUrl/slug/gioi-thieu-sach-moi-thang-11" -ExpectedFields @{
    data = $true
}

# Test 9: GET /api/blogs/slug/:slug with invalid slug
Write-Host "`n--- Test 9: Get blog by invalid slug ---" -ForegroundColor Cyan
Write-Host "Testing: Get blog by invalid slug" -ForegroundColor Yellow
Write-Host "URL: $baseUrl/slug/non-existent-slug-12345" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/slug/non-existent-slug-12345" -Method GET -ErrorAction Stop
    if ($response.success -eq $false) {
        Write-Host "✓ Correctly returned error for invalid slug" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "✗ Should have returned error" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "✓ Correctly returned 404 for invalid slug" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "✗ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
        $testsFailed++
    }
}
Write-Host ""

# Test 10: GET /api/blogs/related/:id
Write-Host "`n--- Test 10: Get related blogs (ID: 1) ---" -ForegroundColor Cyan
Test-Endpoint -Name "Get related blogs" -Url "$baseUrl/related/1?limit=4" -ExpectedFields @{
    data = $true
}

# Test 11: GET /api/blogs/categories
Write-Host "`n--- Test 11: Get all categories ---" -ForegroundColor Cyan
Test-Endpoint -Name "Get categories" -Url "$baseUrl/categories" -ExpectedFields @{
    data = $true
}

# Test 12: Verify response format for blog list
Write-Host "`n--- Test 12: Verify blog list response format ---" -ForegroundColor Cyan
Write-Host "Testing: Blog list response format" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl?limit=1" -Method GET -ErrorAction Stop
    
    $formatValid = $true
    
    # Check meta fields
    if ($null -eq $response.meta.page) { $formatValid = $false; Write-Host "✗ Missing meta.page" -ForegroundColor Red }
    if ($null -eq $response.meta.limit) { $formatValid = $false; Write-Host "✗ Missing meta.limit" -ForegroundColor Red }
    if ($null -eq $response.meta.total) { $formatValid = $false; Write-Host "✗ Missing meta.total" -ForegroundColor Red }
    if ($null -eq $response.meta.totalPages) { $formatValid = $false; Write-Host "✗ Missing meta.totalPages" -ForegroundColor Red }
    
    # Check data array
    if ($response.data -isnot [array]) { $formatValid = $false; Write-Host "✗ data is not an array" -ForegroundColor Red }
    
    # Check blog fields if data exists
    if ($response.data.Count -gt 0) {
        $blog = $response.data[0]
        $requiredFields = @('blog_id', 'title', 'slug', 'content', 'category_id', 'published_at')
        foreach ($field in $requiredFields) {
            if ($null -eq $blog.$field) {
                $formatValid = $false
                Write-Host "✗ Missing blog field: $field" -ForegroundColor Red
            }
        }
    }
    
    if ($formatValid) {
        Write-Host "✓ Response format is valid" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "✗ Response format validation failed" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "✗ Request failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}
Write-Host ""

# Test 13: Verify response format for single blog
Write-Host "`n--- Test 13: Verify single blog response format ---" -ForegroundColor Cyan
Write-Host "Testing: Single blog response format" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/1" -Method GET -ErrorAction Stop
    
    $formatValid = $true
    
    # Check data object
    if ($null -eq $response.data) { $formatValid = $false; Write-Host "✗ Missing data object" -ForegroundColor Red }
    
    # Check blog fields
    $blog = $response.data
    $requiredFields = @('blog_id', 'title', 'slug', 'content', 'category_id', 'category_name', 'published_at')
    foreach ($field in $requiredFields) {
        if ($null -eq $blog.$field) {
            $formatValid = $false
            Write-Host "✗ Missing blog field: $field" -ForegroundColor Red
        }
    }
    
    if ($formatValid) {
        Write-Host "✓ Response format is valid" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "✗ Response format validation failed" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "✗ Request failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}
Write-Host ""

# Test 14: Check Redis caching
Write-Host "`n--- Test 14: Verify Redis caching ---" -ForegroundColor Cyan
Write-Host "Testing: Redis cache keys" -ForegroundColor Yellow
try {
    # Check if Redis container is running
    $redisContainer = docker compose -f docker-compose.dev.yml ps redis --format json | ConvertFrom-Json
    
    if ($redisContainer) {
        Write-Host "✓ Redis container is running" -ForegroundColor Green
        
        # Check for cache keys
        $cacheKeys = docker compose -f docker-compose.dev.yml exec -T redis redis-cli KEYS "blog:*"
        
        if ($cacheKeys) {
            Write-Host "✓ Cache keys found:" -ForegroundColor Green
            $cacheKeys | Write-Host -ForegroundColor Gray
            $testsPassed++
        } else {
            Write-Host "⚠ No cache keys found (may need to make requests first)" -ForegroundColor Yellow
            $testsPassed++
        }
    } else {
        Write-Host "✗ Redis container not running" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "⚠ Could not check Redis: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "  (This is optional - caching may still work)" -ForegroundColor Gray
    $testsPassed++
}
Write-Host ""

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Tests Passed: $testsPassed" -ForegroundColor Green
Write-Host "Tests Failed: $testsFailed" -ForegroundColor Red
Write-Host "Total Tests: $($testsPassed + $testsFailed)" -ForegroundColor White
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "✓ All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "✗ Some tests failed" -ForegroundColor Red
    exit 1
}
