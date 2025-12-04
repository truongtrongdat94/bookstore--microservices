# Deploy script for Windows PowerShell
# Usage: .\deploy.ps1

$BUCKET_NAME = "bookstore-frontend-uit-123"  # Thay bằng bucket name của bạn
$DISTRIBUTION_ID = "E1234567890ABC"          # Thay bằng CloudFront distribution ID

Write-Host "Building frontend..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`nUploading static assets (JS, CSS, images) with long cache..." -ForegroundColor Cyan
aws s3 sync dist/ s3://$BUCKET_NAME `
    --delete `
    --cache-control "public, max-age=31536000, immutable" `
    --exclude "index.html" `
    --exclude "*.json"

Write-Host "`nUploading index.html with no-cache..." -ForegroundColor Cyan
aws s3 cp dist/index.html s3://$BUCKET_NAME/index.html `
    --cache-control "public, max-age=0, must-revalidate"

Write-Host "`nUploading JSON config files with 1-hour cache..." -ForegroundColor Cyan
aws s3 sync dist/ s3://$BUCKET_NAME `
    --exclude "*" `
    --include "*.json" `
    --cache-control "public, max-age=3600"

Write-Host "`nInvalidating CloudFront cache for index.html..." -ForegroundColor Cyan
aws cloudfront create-invalidation `
    --distribution-id $DISTRIBUTION_ID `
    --paths "/index.html"

Write-Host "`nDeploy completed!" -ForegroundColor Green
Write-Host "Frontend URL: https://$DISTRIBUTION_ID.cloudfront.net" -ForegroundColor Yellow
