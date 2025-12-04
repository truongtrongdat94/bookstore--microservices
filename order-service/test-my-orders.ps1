# Test the new getMyOrders endpoint
Write-Host "Testing GET /orders/my-orders endpoint..." -ForegroundColor Cyan

$headers = @{
    "x-user-id" = "1"
    "x-user-email" = "test@example.com"
    "x-user-role" = "user"
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3003/orders/my-orders?page=1&limit=10" -Headers $headers -Method GET
    $content = $response.Content | ConvertFrom-Json
    
    Write-Host "`nResponse Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "`nResponse Body:" -ForegroundColor Yellow
    $content | ConvertTo-Json -Depth 10
    
    # Verify response structure
    if ($content.success -eq $true) {
        Write-Host "`n✓ Success field is true" -ForegroundColor Green
        
        if ($content.data.orders) {
            Write-Host "✓ Orders array exists" -ForegroundColor Green
            Write-Host "  - Found $($content.data.orders.Count) orders" -ForegroundColor Cyan
            
            if ($content.data.orders.Count -gt 0) {
                $firstOrder = $content.data.orders[0]
                Write-Host "`nFirst Order Details:" -ForegroundColor Yellow
                Write-Host "  - Order ID: $($firstOrder.order_id)" -ForegroundColor Cyan
                Write-Host "  - Order Number: $($firstOrder.order_number)" -ForegroundColor Cyan
                Write-Host "  - Total Amount: $($firstOrder.total_amount)" -ForegroundColor Cyan
                Write-Host "  - Status: $($firstOrder.status)" -ForegroundColor Cyan
                Write-Host "  - Payment Status: $($firstOrder.payment_status)" -ForegroundColor Cyan
                Write-Host "  - Items Count: $($firstOrder.items.Count)" -ForegroundColor Cyan
                
                if ($firstOrder.items -and $firstOrder.items.Count -gt 0) {
                    Write-Host "`n  Items:" -ForegroundColor Yellow
                    foreach ($item in $firstOrder.items) {
                        Write-Host "    - Book ID: $($item.book_id), Title: $($item.title), Qty: $($item.quantity), Price: $($item.price)" -ForegroundColor Cyan
                    }
                }
            }
        }
        
        if ($content.data.pagination) {
            Write-Host "`n✓ Pagination exists" -ForegroundColor Green
            Write-Host "  - Page: $($content.data.pagination.page)" -ForegroundColor Cyan
            Write-Host "  - Limit: $($content.data.pagination.limit)" -ForegroundColor Cyan
            Write-Host "  - Total: $($content.data.pagination.total)" -ForegroundColor Cyan
            Write-Host "  - Total Pages: $($content.data.pagination.totalPages)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "`n✗ Success field is false" -ForegroundColor Red
    }
    
} catch {
    Write-Host "`nError: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}
