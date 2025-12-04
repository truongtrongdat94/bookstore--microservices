# End-to-End Authors Feature Test Script
# This script verifies all aspects of the Authors feature functionality

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Authors Feature E2E Verification Tests" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3002"
$testsPassed = 0
$testsFailed = 0
$testResults = @()

function Test-Endpoint {
    param(
        [string]$TestName,
        [string]$Url,
        [int]$ExpectedStatus = 200,
        [scriptblock]$ValidationScript = $null
    )
    
    Write-Host "Testing: $TestName" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -UseBasicParsing -ErrorAction Stop
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            $content = $response.Content | ConvertFrom-Json
            
            if ($ValidationScript) {
                $validationResult = & $ValidationScript $content
                if ($validationResult) {
                    Write-Host "  ✓ PASSED" -ForegroundColor Green
                    $script:testsPassed++
                    $script:testResults += [PSCustomObject]@{
                        Test = $TestName
                        Status = "PASSED"
                        Details = "Status: $($response.StatusCode)"
                    }
                    return $true
                } else {
                    Write-Host "  ✗ FAILED - Validation failed" -ForegroundColor Red
                    $script:testsFailed++
                    $script:testResults += [PSCustomObject]@{
                        Test = $TestName
                        Status = "FAILED"
                        Details = "Validation failed"
                    }
                    return $false
                }
            } else {
                Write-Host "  ✓ PASSED" -ForegroundColor Green
                $script:testsPassed++
                $script:testResults += [PSCustomObject]@{
                    Test = $TestName
                    Status = "PASSED"
                    Details = "Status: $($response.StatusCode)"
                }
                return $true
            }
        } else {
            Write-Host "  ✗ FAILED - Expected status $ExpectedStatus, got $($response.StatusCode)" -ForegroundColor Red
            $script:testsFailed++
            $script:testResults += [PSCustomObject]@{
                Test = $TestName
                Status = "FAILED"
                Details = "Expected status $ExpectedStatus, got $($response.StatusCode)"
            }
            return $false
        }
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq $ExpectedStatus) {
            Write-Host "  ✓ PASSED - Got expected error status $ExpectedStatus" -ForegroundColor Green
            $script:testsPassed++
            $script:testResults += [PSCustomObject]@{
                Test = $TestName
                Status = "PASSED"
                Details = "Expected error status: $ExpectedStatus"
            }
            return $true
        } else {
            Write-Host "  ✗ FAILED - $($_.Exception.Message)" -ForegroundColor Red
            $script:testsFailed++
            $script:testResults += [PSCustomObject]@{
                Test = $TestName
                Status = "FAILED"
                Details = $_.Exception.Message
            }
            return $false
        }
    }
    
    Write-Host ""
}

# Test 1: Verify GET /authors returns all authors
Write-Host "`n1. Testing GET /authors - List all authors" -ForegroundColor Cyan
$authorsResponse = Test-Endpoint `
    -TestName "GET /authors returns success" `
    -Url "$baseUrl/authors" `
    -ValidationScript {
        param($content)
        return ($content.success -eq $true -and $content.data -is [Array] -and $content.data.Count -gt 0)
    }

# Store authors for later tests
$authors = $null
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/authors" -Method GET -UseBasicParsing
    $authors = ($response.Content | ConvertFrom-Json).data
    Write-Host "  Found $($authors.Count) authors in database" -ForegroundColor Gray
} catch {
    Write-Host "  Could not fetch authors list" -ForegroundColor Red
}

# Test 2: Verify author data structure
if ($authors -and $authors.Count -gt 0) {
    Write-Host "`n2. Testing author data structure" -ForegroundColor Cyan
    $firstAuthor = $authors[0]
    
    $requiredFields = @('author_id', 'name', 'nationality', 'book_count')
    $hasAllFields = $true
    
    foreach ($field in $requiredFields) {
        if (-not $firstAuthor.PSObject.Properties.Name.Contains($field)) {
            Write-Host "  ✗ Missing field: $field" -ForegroundColor Red
            $hasAllFields = $false
            $script:testsFailed++
        }
    }
    
    if ($hasAllFields) {
        Write-Host "  ✓ PASSED - All required fields present" -ForegroundColor Green
        $script:testsPassed++
        $script:testResults += [PSCustomObject]@{
            Test = "Author data structure validation"
            Status = "PASSED"
            Details = "All required fields present"
        }
    } else {
        $script:testResults += [PSCustomObject]@{
            Test = "Author data structure validation"
            Status = "FAILED"
            Details = "Missing required fields"
        }
    }
}

# Test 3: Verify GET /authors/:id for multiple authors
if ($authors -and $authors.Count -gt 0) {
    Write-Host "`n3. Testing GET /authors/:id - Get author details" -ForegroundColor Cyan
    
    $testCount = [Math]::Min(3, $authors.Count)
    for ($i = 0; $i -lt $testCount; $i++) {
        $authorId = $authors[$i].author_id
        $authorName = $authors[$i].name
        
        Test-Endpoint `
            -TestName "GET /authors/$authorId ($authorName)" `
            -Url "$baseUrl/authors/$authorId" `
            -ValidationScript {
                param($content)
                $author = $content.data
                return ($content.success -eq $true -and 
                        $author.author_id -eq $authorId -and
                        $author.name -and
                        $author.bio -and
                        $null -ne $author.book_count)
            }
    }
}

# Test 4: Verify author details include bio and quote
if ($authors -and $authors.Count -gt 0) {
    Write-Host "`n4. Testing author biographical information" -ForegroundColor Cyan
    
    $authorId = $authors[0].author_id
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/authors/$authorId" -Method GET -UseBasicParsing
        $author = ($response.Content | ConvertFrom-Json).data
        
        $hasBio = $author.bio -and $author.bio.Length -gt 0
        $hasQuote = $author.quote -and $author.quote.Length -gt 0
        
        if ($hasBio -and $hasQuote) {
            Write-Host "  ✓ PASSED - Author has bio and quote" -ForegroundColor Green
            Write-Host "    Bio length: $($author.bio.Length) characters" -ForegroundColor Gray
            Write-Host "    Quote: $($author.quote.Substring(0, [Math]::Min(50, $author.quote.Length)))..." -ForegroundColor Gray
            $script:testsPassed++
            $script:testResults += [PSCustomObject]@{
                Test = "Author biographical information"
                Status = "PASSED"
                Details = "Bio and quote present"
            }
        } else {
            Write-Host "  ✗ FAILED - Missing bio or quote" -ForegroundColor Red
            $script:testsFailed++
            $script:testResults += [PSCustomObject]@{
                Test = "Author biographical information"
                Status = "FAILED"
                Details = "Missing bio or quote"
            }
        }
    } catch {
        Write-Host "  ✗ FAILED - Could not fetch author details" -ForegroundColor Red
        $script:testsFailed++
    }
}

# Test 5: Verify GET /authors/:id/books returns books
if ($authors -and $authors.Count -gt 0) {
    Write-Host "`n5. Testing GET /authors/:id/books - Get author's books" -ForegroundColor Cyan
    
    # Find an author with books
    $authorWithBooks = $authors | Where-Object { $_.book_count -gt 0 } | Select-Object -First 1
    
    if ($authorWithBooks) {
        $authorId = $authorWithBooks.author_id
        
        Test-Endpoint `
            -TestName "GET /authors/$authorId/books" `
            -Url "$baseUrl/authors/$authorId/books" `
            -ValidationScript {
                param($content)
                return ($content.success -eq $true -and 
                        $content.data -is [Array] -and 
                        $content.data.Count -gt 0)
            }
        
        # Verify book data structure
        try {
            $response = Invoke-WebRequest -Uri "$baseUrl/authors/$authorId/books" -Method GET -UseBasicParsing
            $books = ($response.Content | ConvertFrom-Json).data
            
            if ($books.Count -gt 0) {
                $firstBook = $books[0]
                $bookFields = @('book_id', 'title', 'price')
                $hasAllBookFields = $true
                
                foreach ($field in $bookFields) {
                    if (-not $firstBook.PSObject.Properties.Name.Contains($field)) {
                        $hasAllBookFields = $false
                        break
                    }
                }
                
                if ($hasAllBookFields) {
                    Write-Host "  ✓ Book data structure valid" -ForegroundColor Green
                    Write-Host "    Found $($books.Count) books for author" -ForegroundColor Gray
                    $script:testsPassed++
                    $script:testResults += [PSCustomObject]@{
                        Test = "Book data structure validation"
                        Status = "PASSED"
                        Details = "Found $($books.Count) books"
                    }
                } else {
                    Write-Host "  ✗ Book data structure invalid" -ForegroundColor Red
                    $script:testsFailed++
                    $script:testResults += [PSCustomObject]@{
                        Test = "Book data structure validation"
                        Status = "FAILED"
                        Details = "Missing required book fields"
                    }
                }
            }
        } catch {
            Write-Host "  ✗ Could not validate book data" -ForegroundColor Red
        }
    } else {
        Write-Host "  ⚠ SKIPPED - No authors with books found" -ForegroundColor Yellow
    }
}

# Test 6: Verify book count accuracy
if ($authors -and $authors.Count -gt 0) {
    Write-Host "`n6. Testing book count accuracy" -ForegroundColor Cyan
    
    $authorWithBooks = $authors | Where-Object { $_.book_count -gt 0 } | Select-Object -First 1
    
    if ($authorWithBooks) {
        $authorId = $authorWithBooks.author_id
        $expectedCount = $authorWithBooks.book_count
        
        try {
            $response = Invoke-WebRequest -Uri "$baseUrl/authors/$authorId/books" -Method GET -UseBasicParsing
            $books = ($response.Content | ConvertFrom-Json).data
            $actualCount = $books.Count
            
            if ($actualCount -eq $expectedCount) {
                Write-Host "  ✓ PASSED - Book count matches ($actualCount books)" -ForegroundColor Green
                $script:testsPassed++
                $script:testResults += [PSCustomObject]@{
                    Test = "Book count accuracy"
                    Status = "PASSED"
                    Details = "Expected: $expectedCount, Actual: $actualCount"
                }
            } else {
                Write-Host "  ✗ FAILED - Book count mismatch (Expected: $expectedCount, Actual: $actualCount)" -ForegroundColor Red
                $script:testsFailed++
                $script:testResults += [PSCustomObject]@{
                    Test = "Book count accuracy"
                    Status = "FAILED"
                    Details = "Expected: $expectedCount, Actual: $actualCount"
                }
            }
        } catch {
            Write-Host "  ✗ FAILED - Could not verify book count" -ForegroundColor Red
            $script:testsFailed++
        }
    }
}

# Test 7: Error handling - Invalid author ID (non-numeric)
Write-Host "`n7. Testing error handling - Invalid author ID" -ForegroundColor Cyan
Test-Endpoint `
    -TestName "GET /authors/invalid (non-numeric ID)" `
    -Url "$baseUrl/authors/invalid" `
    -ExpectedStatus 400

# Test 8: Error handling - Non-existent author ID
Write-Host "`n8. Testing error handling - Non-existent author" -ForegroundColor Cyan
Test-Endpoint `
    -TestName "GET /authors/99999 (non-existent ID)" `
    -Url "$baseUrl/authors/99999" `
    -ExpectedStatus 404

# Test 9: Verify response format consistency
Write-Host "`n9. Testing API response format consistency" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/authors" -Method GET -UseBasicParsing
    $content = $response.Content | ConvertFrom-Json
    
    $hasSuccess = $content.PSObject.Properties.Name.Contains('success')
    $hasData = $content.PSObject.Properties.Name.Contains('data')
    
    if ($hasSuccess -and $hasData) {
        Write-Host "  ✓ PASSED - Response format is consistent" -ForegroundColor Green
        $script:testsPassed++
        $script:testResults += [PSCustomObject]@{
            Test = "API response format consistency"
            Status = "PASSED"
            Details = "Contains success and data fields"
        }
    } else {
        Write-Host "  ✗ FAILED - Response format inconsistent" -ForegroundColor Red
        $script:testsFailed++
        $script:testResults += [PSCustomObject]@{
            Test = "API response format consistency"
            Status = "FAILED"
            Details = "Missing required fields"
        }
    }
} catch {
    Write-Host "  ✗ FAILED - Could not verify response format" -ForegroundColor Red
    $script:testsFailed++
}

# Test 10: Performance check
Write-Host "`n10. Testing API response time" -ForegroundColor Cyan
try {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $response = Invoke-WebRequest -Uri "$baseUrl/authors" -Method GET -UseBasicParsing
    $stopwatch.Stop()
    
    $responseTime = $stopwatch.ElapsedMilliseconds
    
    if ($responseTime -lt 500) {
        Write-Host "  ✓ PASSED - Response time: ${responseTime}ms (< 500ms)" -ForegroundColor Green
        $script:testsPassed++
        $script:testResults += [PSCustomObject]@{
            Test = "API response time"
            Status = "PASSED"
            Details = "${responseTime}ms"
        }
    } else {
        Write-Host "  ⚠ WARNING - Response time: ${responseTime}ms (> 500ms)" -ForegroundColor Yellow
        $script:testsPassed++
        $script:testResults += [PSCustomObject]@{
            Test = "API response time"
            Status = "PASSED (SLOW)"
            Details = "${responseTime}ms"
        }
    }
} catch {
    Write-Host "  ✗ FAILED - Could not measure response time" -ForegroundColor Red
    $script:testsFailed++
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total Tests: $($testsPassed + $testsFailed)" -ForegroundColor White
Write-Host "Passed: $testsPassed" -ForegroundColor Green
Write-Host "Failed: $testsFailed" -ForegroundColor Red
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "✓ All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "✗ Some tests failed. See details above." -ForegroundColor Red
    Write-Host "`nFailed Tests:" -ForegroundColor Yellow
    $script:testResults | Where-Object { $_.Status -like "*FAILED*" } | Format-Table -AutoSize
    exit 1
}
