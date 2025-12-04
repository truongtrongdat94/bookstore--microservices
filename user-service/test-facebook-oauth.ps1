# Test Facebook OAuth Implementation
# This script verifies that Facebook OAuth routes are properly configured

Write-Host "=== Testing Facebook OAuth Implementation ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3001"

# Test 1: Check if Facebook OAuth initiation endpoint exists
Write-Host "Test 1: Checking Facebook OAuth initiation endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/facebook" -Method GET -MaximumRedirection 0 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 302) {
        Write-Host "✓ Facebook OAuth initiation endpoint exists and redirects" -ForegroundColor Green
        Write-Host "  Redirect Location: $($response.Headers.Location)" -ForegroundColor Gray
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 302) {
        Write-Host "✓ Facebook OAuth initiation endpoint exists and redirects" -ForegroundColor Green
        $location = $_.Exception.Response.Headers.Location
        Write-Host "  Redirect Location: $location" -ForegroundColor Gray
    } else {
        Write-Host "✗ Failed to access Facebook OAuth endpoint" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 2: Verify environment variables are set
Write-Host "Test 2: Checking Facebook OAuth environment variables..." -ForegroundColor Yellow
$envFile = Get-Content ".env" -Raw
if ($envFile -match "FACEBOOK_APP_ID") {
    Write-Host "✓ FACEBOOK_APP_ID is configured in .env" -ForegroundColor Green
} else {
    Write-Host "✗ FACEBOOK_APP_ID is missing from .env" -ForegroundColor Red
}

if ($envFile -match "FACEBOOK_APP_SECRET") {
    Write-Host "✓ FACEBOOK_APP_SECRET is configured in .env" -ForegroundColor Green
} else {
    Write-Host "✗ FACEBOOK_APP_SECRET is missing from .env" -ForegroundColor Red
}

if ($envFile -match "FACEBOOK_CALLBACK_URL") {
    Write-Host "✓ FACEBOOK_CALLBACK_URL is configured in .env" -ForegroundColor Green
} else {
    Write-Host "✗ FACEBOOK_CALLBACK_URL is missing from .env" -ForegroundColor Red
}

Write-Host ""

# Test 3: Check if passport-facebook is installed
Write-Host "Test 3: Checking passport-facebook package..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" | ConvertFrom-Json
if ($packageJson.dependencies.'passport-facebook') {
    Write-Host "✓ passport-facebook is installed" -ForegroundColor Green
    Write-Host "  Version: $($packageJson.dependencies.'passport-facebook')" -ForegroundColor Gray
} else {
    Write-Host "✗ passport-facebook is not installed" -ForegroundColor Red
}

Write-Host ""

# Test 4: Verify TypeScript types are installed
Write-Host "Test 4: Checking @types/passport-facebook package..." -ForegroundColor Yellow
if ($packageJson.devDependencies.'@types/passport-facebook') {
    Write-Host "✓ @types/passport-facebook is installed" -ForegroundColor Green
    Write-Host "  Version: $($packageJson.devDependencies.'@types/passport-facebook')" -ForegroundColor Gray
} else {
    Write-Host "✗ @types/passport-facebook is not installed" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Facebook OAuth Implementation Test Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Configure Facebook App credentials in .env file" -ForegroundColor White
Write-Host "2. Set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET from Facebook Developer Console" -ForegroundColor White
Write-Host "3. Add http://localhost:3001/auth/facebook/callback to Facebook App's Valid OAuth Redirect URIs" -ForegroundColor White
Write-Host "4. Start the user service and test the OAuth flow in a browser" -ForegroundColor White
Write-Host ""
