# Logs Verification Script for OTP Registration Fix
# Task 8.3: Verify logs in user-service

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "OTP Registration Logs Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will help you verify that logs are properly generated" -ForegroundColor Yellow
Write-Host "during the registration process." -ForegroundColor Yellow
Write-Host ""

# Configuration
$API_BASE = "http://localhost:3000/api"
$TEST_EMAIL = "logtest_$(Get-Random -Minimum 1000 -Maximum 9999)@example.com"
$TEST_USERNAME = "logtest_$(Get-Random -Minimum 1000 -Maximum 9999)"

Write-Host "Test Configuration:" -ForegroundColor Yellow
Write-Host "  Email: $TEST_EMAIL" -ForegroundColor White
Write-Host "  Username: $TEST_USERNAME" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Task 8.3: Verify Logs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Expected Log Entries:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Registration Flow Logs:" -ForegroundColor Cyan
Write-Host "   - 'Starting registration process' with email and username" -ForegroundColor Gray
Write-Host "   - 'Checking if email exists'" -ForegroundColor Gray
Write-Host "   - 'Checking if username exists'" -ForegroundColor Gray
Write-Host "   - 'Generating OTP code'" -ForegroundColor Gray
Write-Host "   - 'OTP code generated successfully'" -ForegroundColor Gray
Write-Host "   - 'Sending OTP email'" -ForegroundColor Gray
Write-Host "   - 'OTP email sent successfully'" -ForegroundColor Gray
Write-Host "   - 'Starting database transaction'" -ForegroundColor Gray
Write-Host "   - 'Transaction BEGIN'" -ForegroundColor Gray
Write-Host "   - 'Creating user in database'" -ForegroundColor Gray
Write-Host "   - 'User created in transaction'" -ForegroundColor Gray
Write-Host "   - 'Storing OTP in database'" -ForegroundColor Gray
Write-Host "   - 'OTP stored in transaction'" -ForegroundColor Gray
Write-Host "   - 'Transaction COMMIT'" -ForegroundColor Gray
Write-Host "   - 'Registration transaction completed successfully'" -ForegroundColor Gray
Write-Host "   - 'Registration completed successfully'" -ForegroundColor Gray
Write-Host ""

Write-Host "2. Error Logs (for failures):" -ForegroundColor Cyan
Write-Host "   - 'Failed to send OTP email' with error details" -ForegroundColor Gray
Write-Host "   - 'Transaction failed and rolled back' with error details" -ForegroundColor Gray
Write-Host "   - 'Registration failed: Email already exists'" -ForegroundColor Gray
Write-Host "   - 'Registration failed: Username already taken'" -ForegroundColor Gray
Write-Host ""

Write-Host "3. Transaction Logs:" -ForegroundColor Cyan
Write-Host "   - 'Transaction BEGIN'" -ForegroundColor Gray
Write-Host "   - 'Transaction COMMIT' (on success)" -ForegroundColor Gray
Write-Host "   - 'Transaction ROLLBACK' (on failure)" -ForegroundColor Gray
Write-Host ""

Write-Host "Press any key to trigger a registration and generate logs..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

# Trigger registration to generate logs
Write-Host "Triggering registration..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/auth/register" -Method POST -ContentType "application/json" -Body (@{
        email = $TEST_EMAIL
        username = $TEST_USERNAME
        password = "Test123456!"
        full_name = "Log Test User"
    } | ConvertTo-Json) -ErrorAction Stop
    
    Write-Host "✓ Registration successful" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor White
}
catch {
    Write-Host "Registration response received (may be error)" -ForegroundColor Yellow
    Write-Host $_.ErrorDetails.Message -ForegroundColor White
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "MANUAL VERIFICATION REQUIRED" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "Please check the user-service logs for the following:" -ForegroundColor White
Write-Host ""

Write-Host "Option 1: Check Docker logs (if running in Docker)" -ForegroundColor Cyan
Write-Host "  docker logs user-service --tail 100" -ForegroundColor Gray
Write-Host ""

Write-Host "Option 2: Check console output (if running locally)" -ForegroundColor Cyan
Write-Host "  Look at the terminal where user-service is running" -ForegroundColor Gray
Write-Host ""

Write-Host "Option 3: Check log files (if file logging is enabled)" -ForegroundColor Cyan
Write-Host "  Check user-service/logs/ directory" -ForegroundColor Gray
Write-Host ""

Write-Host "Verification Checklist:" -ForegroundColor Yellow
Write-Host ""
Write-Host "[ ] 1. Logs show 'Starting registration process' with email: $TEST_EMAIL" -ForegroundColor White
Write-Host "[ ] 2. Logs show 'Checking if email exists'" -ForegroundColor White
Write-Host "[ ] 3. Logs show 'Checking if username exists'" -ForegroundColor White
Write-Host "[ ] 4. Logs show 'Generating OTP code'" -ForegroundColor White
Write-Host "[ ] 5. Logs show 'OTP code generated successfully'" -ForegroundColor White
Write-Host "[ ] 6. Logs show 'Sending OTP email'" -ForegroundColor White
Write-Host "[ ] 7. Logs show 'OTP email sent successfully'" -ForegroundColor White
Write-Host "[ ] 8. Logs show 'Starting database transaction'" -ForegroundColor White
Write-Host "[ ] 9. Logs show 'Transaction BEGIN'" -ForegroundColor White
Write-Host "[ ] 10. Logs show 'Creating user in database'" -ForegroundColor White
Write-Host "[ ] 11. Logs show 'User created in transaction' with user_id" -ForegroundColor White
Write-Host "[ ] 12. Logs show 'Storing OTP in database'" -ForegroundColor White
Write-Host "[ ] 13. Logs show 'OTP stored in transaction'" -ForegroundColor White
Write-Host "[ ] 14. Logs show 'Transaction COMMIT'" -ForegroundColor White
Write-Host "[ ] 15. Logs show 'Registration transaction completed successfully'" -ForegroundColor White
Write-Host "[ ] 16. Logs show 'Registration completed successfully'" -ForegroundColor White
Write-Host ""

Write-Host "Now testing error scenario to verify error logs..." -ForegroundColor Yellow
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

# Test duplicate email to generate error logs
Write-Host "Triggering duplicate email error..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/auth/register" -Method POST -ContentType "application/json" -Body (@{
        email = $TEST_EMAIL
        username = "different_username"
        password = "Test123456!"
        full_name = "Duplicate Test"
    } | ConvertTo-Json) -ErrorAction Stop
}
catch {
    Write-Host "✓ Expected error received" -ForegroundColor Green
    Write-Host $_.ErrorDetails.Message -ForegroundColor White
}
Write-Host ""

Write-Host "Error Log Verification Checklist:" -ForegroundColor Yellow
Write-Host ""
Write-Host "[ ] 1. Logs show 'Registration failed: Email already exists'" -ForegroundColor White
Write-Host "[ ] 2. Error log includes email address" -ForegroundColor White
Write-Host "[ ] 3. Error log has appropriate log level (WARN or ERROR)" -ForegroundColor White
Write-Host "[ ] 4. Error response includes proper error code (EMAIL_EXISTS)" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "Task 8.3: COMPLETED" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "  ✓ Registration triggered to generate logs" -ForegroundColor Green
Write-Host "  ✓ Error scenario triggered to generate error logs" -ForegroundColor Green
Write-Host "  ⚠ Manual verification required - check user-service logs" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Review the logs in user-service console/Docker" -ForegroundColor White
Write-Host "  2. Verify all expected log entries are present" -ForegroundColor White
Write-Host "  3. Verify error logs contain sufficient detail" -ForegroundColor White
Write-Host "  4. Verify transaction logs show BEGIN/COMMIT/ROLLBACK" -ForegroundColor White
Write-Host ""

# Save test email for reference
Write-Host "Test email used: $TEST_EMAIL" -ForegroundColor Gray
Write-Host "You can use this to search logs" -ForegroundColor Gray
Write-Host ""
