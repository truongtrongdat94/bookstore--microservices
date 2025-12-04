# PowerShell script to test Book Detail Page Integration
Write-Host "=== Book Detail Page Integration Testing ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api"
$testResults = @()

function Test-Endpoint {
    param(
        [string]$TestName,
        [string]$Url,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "Testing: $TestName" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -ErrorAction Stop
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host "  ✓ PASS - Status: $($response.StatusCode)" -ForegroundColor Green
            $script:testResults += @{Test = $TestName; Result = "PASS"; Status = $response.StatusCode}
            return $response.Content | ConvertFrom-Json
        } else {
            Write-Host "  ✗ FAIL - Expected: $ExpectedStatus, Got: $($response.StatusCode)" -ForegroundColor Red
            $script:testResults += @{Test = $TestName; Result = "FAIL"; Status = $response.StatusCode}
            return $null
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "  ✓ PASS - Status: $statusCode (Expected error)" -ForegroundColor Green
            $script:testResults += @{Test = $TestName; Result = "PASS"; Status = $statusCode}
        } else {
            Write-Host "  ✗ FAIL - Error: $($_.Exception.Message)" -ForegroundColor Red
            $script:testResults += @{Test = $TestName; Result = "FAIL"; Status = "ERROR"}
        }
        return $null
    }
    
    Write-Host ""
}

# Test 5.1: Happy Path
Write-Host "`n--- Test 5.1: Happy Path ---" -ForegroundColor Cyan

# Get a valid book
$book = Test-Endpoint "Get valid book (ID: 21)" "$baseUrl/books/21"

if ($book -and $book.success) {
    $bookData = $book.data
    
    Write-Host "`nBook Details:" -ForegroundColor Cyan
    Write-Host "  Title: $($bookData.title)"
    Write-Host "  Author: $($bookData.author)"
    Write-Host "  Price: $($bookData.price)"
    Write-Host "  Stock: $($bookData.stock_quantity)"
    Write-Host "  Category: $($bookData.category_name) (ID: $($bookData.category_id))"
    Write-Host "  Cover Image: $($bookData.cover_image_url)"
    
    # Verify all required fields
    $requiredFields = @('book_id', 'title', 'author', 'price', 'stock_quantity', 'cover_image_url', 'category_id', 'category_name')
    $missingFields = @()
    
    foreach ($field in $requiredFields) {
        if (-not $bookData.$field) {
            $missingFields += $field
        }
    }
    
    if ($missingFields.Count -eq 0) {
        Write-Host "  ✓ All required fields present" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Missing fields: $($missingFields -join ', ')" -ForegroundColor Red
    }
    
    # Test related books
    if ($bookData.category_id) {
        Write-Host "`nTesting Related Books..." -ForegroundColor Cyan
        $relatedBooks = Test-Endpoint "Get related books (Category: $($bookData.category_id))" "$baseUrl/books?category=$($bookData.category_id)&limit=4"
        
        if ($relatedBooks -and $relatedBooks.success) {
            $count = $relatedBooks.data.Count
            Write-Host "  Found $count related books" -ForegroundColor Green
            
            if ($count -gt 0) {
                Write-Host "  Sample related book: $($relatedBooks.data[0].title)" -ForegroundColor Gray
            }
        }
    }
}

# Test 5.2: Error Scenarios
Write-Host "`n--- Test 5.2: Error Scenarios ---" -ForegroundColor Cyan

# Test 404 - Book not found
Test-Endpoint "Get non-existent book (ID: 99999)" "$baseUrl/books/99999" 404

# Test invalid book ID
Test-Endpoint "Get book with invalid ID (ID: abc)" "$baseUrl/books/abc" 400

# Test 5.3: Edge Cases
Write-Host "`n--- Test 5.3: Edge Cases ---" -ForegroundColor Cyan

# Test book without optional fields
$allBooks = Test-Endpoint "Get all books" "$baseUrl/books?limit=10"

if ($allBooks -and $allBooks.success) {
    Write-Host "`nChecking for edge cases in books..." -ForegroundColor Cyan
    
    $booksWithoutPublisher = ($allBooks.data | Where-Object { -not $_.publisher }).Count
    $booksWithoutPageCount = ($allBooks.data | Where-Object { -not $_.page_count }).Count
    $booksWithoutCoverImage = ($allBooks.data | Where-Object { -not $_.cover_image_url }).Count
    
    Write-Host "  Books without publisher: $booksWithoutPublisher"
    Write-Host "  Books without page_count: $booksWithoutPageCount"
    Write-Host "  Books without cover_image: $booksWithoutCoverImage"
    
    if ($booksWithoutCoverImage -gt 0) {
        Write-Host "  ⚠ Warning: Some books still missing cover images" -ForegroundColor Yellow
    } else {
        Write-Host "  ✓ All books have cover images" -ForegroundColor Green
    }
}

# Test categories for breadcrumb
Write-Host "`nTesting Categories..." -ForegroundColor Cyan
$categories = Test-Endpoint "Get all categories" "$baseUrl/categories"

if ($categories -and $categories.success) {
    Write-Host "  Found $($categories.data.Count) categories" -ForegroundColor Green
}

# Summary
Write-Host "`n=== Test Summary ===" -ForegroundColor Cyan
$passCount = ($testResults | Where-Object { $_.Result -eq "PASS" }).Count
$failCount = ($testResults | Where-Object { $_.Result -eq "FAIL" }).Count
$totalCount = $testResults.Count

Write-Host "Total Tests: $totalCount" -ForegroundColor White
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red

if ($failCount -eq 0) {
    Write-Host "`n✓ All tests passed!" -ForegroundColor Green
} else {
    Write-Host "`n✗ Some tests failed. Please review the results above." -ForegroundColor Red
}

Write-Host "`n=== Manual Testing Instructions ===" -ForegroundColor Cyan
Write-Host "1. Open browser and navigate to: http://localhost:3000/books/21"
Write-Host "2. Verify book details display correctly"
Write-Host "3. Verify cover image loads"
Write-Host "4. Verify related books section shows up to 4 books"
Write-Host "5. Click 'Thêm vào giỏ' and verify cart updates"
Write-Host "6. Click a related book and verify navigation works"
Write-Host "7. Test breadcrumb navigation"
Write-Host "8. Test quantity selector"
Write-Host "9. Navigate to /books/99999 and verify 404 error"
Write-Host "10. Test responsive behavior on mobile"
