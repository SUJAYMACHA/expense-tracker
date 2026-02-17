$registerData = @{
    email = "alice@example.com"
    password = "password123"
} | ConvertTo-Json

Write-Host "Testing Registration..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -ContentType "application/json" -Body $registerData
Write-Host "✓ User registered!" -ForegroundColor Green
Write-Host "Token: $($response.data.token.Substring(0,20))..." -ForegroundColor Cyan
Write-Host ""

$token = $response.data.token

Write-Host "Testing Login..." -ForegroundColor Yellow
$loginData = @{
    email = "alice@example.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body $loginData
Write-Host "✓ Login successful!" -ForegroundColor Green
Write-Host "Token: $($loginResponse.data.token.Substring(0,20))..." -ForegroundColor Cyan
Write-Host ""

Write-Host "Testing Protected Route..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}
$userInfo = Invoke-RestMethod -Uri "http://localhost:3000/api/user/me" -Method GET -Headers $headers
Write-Host "✓ Protected route accessed!" -ForegroundColor Green
Write-Host "User: $($userInfo.data.user.email)" -ForegroundColor Cyan
Write-Host "User ID: $($userInfo.data.user.id)" -ForegroundColor Cyan
Write-Host ""
Write-Host "ALL AUTH TESTS PASSED!" -ForegroundColor Green
