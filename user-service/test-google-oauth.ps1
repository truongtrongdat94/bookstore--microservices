# Test Google OAuth Implementation
# This script tests the Google OAuth endpoints

$BASE_URL = "http://localhost:3001"

Write-Host "=== Google OAuth Implementation Test ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if Google OAuth initiation endpoint exists
Write-Host "Test 1: Check Google OAuth initiation endpoint" -ForegroundColor Yellow
Write-Host "GET $BASE_URL/auth/google" -ForegroundColor Gray
Write-Host "Note: This should redirect to Google's OAuth consent screen" -ForegroundColor Gray
Write-Host "You can test this by opening the URL in a browser" -ForegroundColor Gray
Write-Host ""

# Test 2: Check if callback endpoint is registered
Write-Host "Test 2: Verify callback endpoint configuration" -ForegroundColor Yellow
Write-Host "Callback URL: $BASE_URL/auth/google/callback" -ForegroundColor Gray
Write-Host "This endpoint will be called by Google after user authorization" -ForegroundColor Gray
Write-Host ""

# Test 3: Check environment variables
Write-Host "Test 3: Check environment variables" -ForegroundColor Yellow
$envFile = ".env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile
    $hasGoogleClientId = $envContent | Select-String "GOOGLE_CLIENT_ID"
    $hasGoogleClientSecret = $envContent | Select-String "GOOGLE_CLIENT_SECRET"
    $hasGoogleCallback = $envContent | Select-String "GOOGLE_CALLBACK_URL"
    $hasFrontendUrl = $envContent | Select-String "FRONTEND_URL"
    
    if ($hasGoogleClientId) {
        Write-Host "✓ GOOGLE_CLIENT_ID is configured" -ForegroundColor Green
    } else {
        Write-Host "✗ GOOGLE_CLIENT_ID is missing" -ForegroundColor Red
    }
    
    if ($hasGoogleClientSecret) {
        Write-Host "✓ GOOGLE_CLIENT_SECRET is configured" -ForegroundColor Green
    } else {
        Write-Host "✗ GOOGLE_CLIENT_SECRET is missing" -ForegroundColor Red
    }
    
    if ($hasGoogleCallback) {
        Write-Host "✓ GOOGLE_CALLBACK_URL is configured" -ForegroundColor Green
    } else {
        Write-Host "✗ GOOGLE_CALLBACK_URL is missing" -ForegroundColor Red
    }
    
    if ($hasFrontendUrl) {
        Write-Host "✓ FRONTEND_URL is configured" -ForegroundColor Green
    } else {
        Write-Host "✗ FRONTEND_URL is missing" -ForegroundColor Red
    }
} else {
    Write-Host "✗ .env file not found" -ForegroundColor Red
}
Write-Host ""

# Test 4: Check if packages are installed
Write-Host "Test 4: Check if required packages are installed" -ForegroundColor Yellow
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$dependencies = $packageJson.dependencies

if ($dependencies.passport) {
    Write-Host "✓ passport is installed (version: $($dependencies.passport))" -ForegroundColor Green
} else {
    Write-Host "✗ passport is not installed" -ForegroundColor Red
}

if ($dependencies.'passport-google-oauth20') {
    Write-Host "✓ passport-google-oauth20 is installed (version: $($dependencies.'passport-google-oauth20'))" -ForegroundColor Green
} else {
    Write-Host "✗ passport-google-oauth20 is not installed" -ForegroundColor Red
}
Write-Host ""

# Test 5: Check if files exist
Write-Host "Test 5: Check if implementation files exist" -ForegroundColor Yellow
$files = @(
    "src/config/passport.ts",
    "src/services/oauthService.ts",
    "src/controllers/oauthController.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✓ $file exists" -ForegroundColor Green
    } else {
        Write-Host "✗ $file is missing" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "=== Setup Instructions ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "To complete the Google OAuth setup:" -ForegroundColor White
Write-Host "1. Go to Google Cloud Console: https://console.cloud.google.com/" -ForegroundColor Gray
Write-Host "2. Create a new project or select an existing one" -ForegroundColor Gray
Write-Host "3. Enable Google+ API" -ForegroundColor Gray
Write-Host "4. Go to 'Credentials' and create OAuth 2.0 Client ID" -ForegroundColor Gray
Write-Host "5. Add authorized redirect URI: http://localhost:3001/auth/google/callback" -ForegroundColor Gray
Write-Host "6. Copy Client ID and Client Secret to .env file" -ForegroundColor Gray
Write-Host "7. Update GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env" -ForegroundColor Gray
Write-Host ""
Write-Host "To test the OAuth flow:" -ForegroundColor White
Write-Host "1. Start the user service: npm run dev" -ForegroundColor Gray
Write-Host "2. Open browser and navigate to: http://localhost:3001/auth/google" -ForegroundColor Gray
Write-Host "3. Complete Google sign-in" -ForegroundColor Gray
Write-Host "4. You should be redirected to frontend with a JWT token" -ForegroundColor Gray
Write-Host ""
