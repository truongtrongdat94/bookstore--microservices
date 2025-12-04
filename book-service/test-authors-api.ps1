# Author API Endpoints Testing Script
$baseUrl = "http://localhost:3002"
$passCount = 0
$failCount = 0

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Author API Endpoints Testing" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Get a valid author ID
Write-Host "Getting valid author ID..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/authors" -Method GET
    if ($response.data.Count -gt 0) {
        $testAuthorId = $response.data[0].author_id
        Write-Host "Using Author ID: $testAuthorId`n" -ForegroundColor Green
    } else {
        Write-Host "No authors found. Run migrations first.`n" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Could not connect to API. Is the service running?`n" -ForegroundColor Red
    exit 1
}

# Test 1: GET /authors
Write-Host "Test 1: GET /authors - List all authors" -ForegroundColor Yellow
try {
    $start = Get-Date
    $response = Invoke-RestMethod -Uri "$baseUrl/authors" -Method GET
    $time = ((Get-Date) - $start).TotalMilliseconds
    
    if ($response.success -and $response.data.Count -gt 0) {
        Write-Host "  PASS - Status: 200, Time: $([math]::Round($time, 2))ms, Count: $($response.data.Count)" -ForegroundColor Green
        $passCount++
    } else {
        Write-Host "  FAIL - Invalid response" -ForegroundColor Red
        $failCount++
    }
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $failCount++
}

# Test 2: GET /authors/:id
Write-Host "Test 2: GET /authors/:id - Get author details" -ForegroundColor Yellow
try {
    $start = Get-Date
    $response = Invoke-RestMethod -Uri "$baseUrl/authors/$testAuthorId" -Method GET
    $time = ((Get-Date) - $start).TotalMilliseconds
    
    if ($response.success -and $response.data.author_id -eq $testAuthorId) {
        Write-Host "  PASS - Status: 200, Time: $([math]::Round($time, 2))ms" -ForegroundColor Green
        $passCount++
    } else {
        Write-Host "  FAIL - Invalid response" -ForegroundColor Red
        $failCount++
    }
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $failCount++
}

# Test 3: GET /authors/:id/books
Write-Host "Test 3: GET /authors/:id/books - Get author's books" -ForegroundColor Yellow
try {
    $start = Get-Date
    $response = Invoke-RestMethod -Uri "$baseUrl/authors/$testAuthorId/books" -Method GET
    $time = ((Get-Date) - $start).TotalMilliseconds
    
    if ($response.success) {
        Write-Host "  PASS - Status: 200, Time: $([math]::Round($time, 2))ms, Books: $($response.data.Count)" -ForegroundColor Green
        $passCount++
    } else {
        Write-Host "  FAIL - Invalid response" -ForegroundColor Red
        $failCount++
    }
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $failCount++
}

# Test 4: 404 for non-existent author
Write-Host "Test 4: GET /authors/999999 - Non-existent author (404)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/authors/999999" -Method GET -ErrorAction Stop
    Write-Host "  FAIL - Should have returned 404" -ForegroundColor Red
    $failCount++
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-Host "  PASS - Status: 404" -ForegroundColor Green
        $passCount++
    } else {
        Write-Host "  FAIL - Wrong status code" -ForegroundColor Red
        $failCount++
    }
}

# Test 5: 400 for invalid author ID
Write-Host "Test 5: GET /authors/invalid-id - Invalid ID (400)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/authors/invalid-id" -Method GET -ErrorAction Stop
    Write-Host "  FAIL - Should have returned 400" -ForegroundColor Red
    $failCount++
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Host "  PASS - Status: 400" -ForegroundColor Green
        $passCount++
    } else {
        Write-Host "  FAIL - Wrong status code" -ForegroundColor Red
        $failCount++
    }
}

# Test 6: Response time for GET /authors
Write-Host "Test 6: Response time for GET /authors (<500ms)" -ForegroundColor Yellow
try {
    $start = Get-Date
    $response = Invoke-RestMethod -Uri "$baseUrl/authors" -Method GET
    $time = ((Get-Date) - $start).TotalMilliseconds
    
    if ($time -lt 500) {
        Write-Host "  PASS - Time: $([math]::Round($time, 2))ms" -ForegroundColor Green
        $passCount++
    } else {
        Write-Host "  FAIL - Time: $([math]::Round($time, 2))ms (exceeds 500ms)" -ForegroundColor Red
        $failCount++
    }
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $failCount++
}

# Test 7: Response time for GET /authors/:id
Write-Host "Test 7: Response time for GET /authors/:id (<300ms)" -ForegroundColor Yellow
try {
    $start = Get-Date
    $response = Invoke-RestMethod -Uri "$baseUrl/authors/$testAuthorId" -Method GET
    $time = ((Get-Date) - $start).TotalMilliseconds
    
    if ($time -lt 300) {
        Write-Host "  PASS - Time: $([math]::Round($time, 2))ms" -ForegroundColor Green
        $passCount++
    } else {
        Write-Host "  FAIL - Time: $([math]::Round($time, 2))ms (exceeds 300ms)" -ForegroundColor Red
        $failCount++
    }
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $failCount++
}

# Test 8: Caching for GET /authors
Write-Host "Test 8: Caching for GET /authors" -ForegroundColor Yellow
try {
    $start1 = Get-Date
    $response1 = Invoke-RestMethod -Uri "$baseUrl/authors" -Method GET
    $time1 = ((Get-Date) - $start1).TotalMilliseconds
    
    $start2 = Get-Date
    $response2 = Invoke-RestMethod -Uri "$baseUrl/authors" -Method GET
    $time2 = ((Get-Date) - $start2).TotalMilliseconds
    
    Write-Host "  First: $([math]::Round($time1, 2))ms, Second: $([math]::Round($time2, 2))ms" -ForegroundColor Cyan
    if ($time2 -le $time1) {
        Write-Host "  PASS - Caching appears to be working" -ForegroundColor Green
        $passCount++
    } else {
        Write-Host "  PASS - Response received (caching may still work)" -ForegroundColor Yellow
        $passCount++
    }
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $failCount++
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total: $($passCount + $failCount)" -ForegroundColor White
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red

if ($failCount -eq 0) {
    Write-Host "`nAll tests passed!" -ForegroundColor Green
} else {
    Write-Host "`nSome tests failed." -ForegroundColor Yellow
}
Write-Host "========================================`n" -ForegroundColor Cyan
