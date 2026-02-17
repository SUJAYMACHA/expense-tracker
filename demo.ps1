$baseUrl = "http://localhost:3000/api"

Write-Host "`n" -NoNewline
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "    EXPENSE TRACKER API - LIVE DEMO" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Register new user
Write-Host "[STEP 1] Register New User" -ForegroundColor Yellow
Write-Host "POST /api/auth/register" -ForegroundColor Gray
$registerData = @{
    email = "demo@example.com"
    password = "demo123456"
} | ConvertTo-Json

try {
    $regResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -ContentType "application/json" -Body $registerData
    Write-Host "SUCCESS: User registered" -ForegroundColor Green
    Write-Host "  Email: demo@example.com" -ForegroundColor White
    Write-Host "  Token: $($regResponse.data.token.Substring(0,30))..." -ForegroundColor White
    $token = $regResponse.data.token
} catch {
    # User might already exist, so login instead
    Write-Host "User exists, logging in..." -ForegroundColor Gray
    $loginData = @{
        email = "demo@example.com"
        password = "demo123456"
    } | ConvertTo-Json
    $regResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body $loginData
    Write-Host "SUCCESS: Logged in" -ForegroundColor Green
    $token = $regResponse.data.token
}

$headers = @{ "Authorization" = "Bearer $token" }
Start-Sleep -Milliseconds 800
Write-Host ""

# Get user profile
Write-Host "[STEP 2] Get User Profile (Protected Route)" -ForegroundColor Yellow
Write-Host "GET /api/user/me" -ForegroundColor Gray
$profile = Invoke-RestMethod -Uri "$baseUrl/user/me" -Headers $headers
Write-Host "SUCCESS: Profile retrieved" -ForegroundColor Green
Write-Host "  User ID: $($profile.data.user.id)" -ForegroundColor White
Write-Host "  Email: $($profile.data.user.email)" -ForegroundColor White
Start-Sleep -Milliseconds 800
Write-Host ""

# Create expenses
Write-Host "[STEP 3] Create Multiple Expenses" -ForegroundColor Yellow
Write-Host "POST /api/expenses (x5)" -ForegroundColor Gray

$expenses = @(
    @{ amount = 45.50; category = "food"; description = "Dinner at Italian restaurant" },
    @{ amount = 15.00; category = "transport"; description = "Uber to office" },
    @{ amount = 120.00; category = "utilities"; description = "Monthly internet bill" },
    @{ amount = 89.99; category = "entertainment"; description = "Movie tickets and snacks" },
    @{ amount = 200.00; category = "shopping"; description = "New running shoes" }
)

$createdIds = @()
foreach ($exp in $expenses) {
    $expData = $exp | ConvertTo-Json
    $created = Invoke-RestMethod -Uri "$baseUrl/expenses" -Method POST -Headers $headers -ContentType "application/json" -Body $expData
    $createdIds += $created.data.expense._id
    Write-Host "  Created: $($exp.description) - `$$($exp.amount)" -ForegroundColor White
    Start-Sleep -Milliseconds 300
}
Write-Host "SUCCESS: 5 expenses created" -ForegroundColor Green
Start-Sleep -Milliseconds 800
Write-Host ""

# List all expenses
Write-Host "[STEP 4] List All Expenses (Paginated)" -ForegroundColor Yellow
Write-Host "GET /api/expenses?page=1&limit=10" -ForegroundColor Gray
$allExpenses = Invoke-RestMethod -Uri "$baseUrl/expenses?page=1&limit=10" -Headers $headers
Write-Host "SUCCESS: Retrieved expenses" -ForegroundColor Green
Write-Host "  Total: $($allExpenses.data.pagination.total)" -ForegroundColor White
Write-Host "  Page: $($allExpenses.data.pagination.page) of $($allExpenses.data.pagination.pages)" -ForegroundColor White
Write-Host ""
Write-Host "  Expenses:" -ForegroundColor White
foreach ($exp in $allExpenses.data.expenses) {
    Write-Host "    - $($exp.description): `$$($exp.amount) [$($exp.category)]" -ForegroundColor Gray
}
Start-Sleep -Milliseconds 1000
Write-Host ""

# Filter by category
Write-Host "[STEP 5] Filter by Category" -ForegroundColor Yellow
Write-Host "GET /api/expenses?category=food" -ForegroundColor Gray
$foodExpenses = Invoke-RestMethod -Uri "$baseUrl/expenses?category=food" -Headers $headers
Write-Host "SUCCESS: Found $($foodExpenses.data.expenses.Count) food expense(s)" -ForegroundColor Green
foreach ($exp in $foodExpenses.data.expenses) {
    Write-Host "  - $($exp.description): `$$($exp.amount)" -ForegroundColor White
}
Start-Sleep -Milliseconds 800
Write-Host ""

# Get single expense
Write-Host "[STEP 6] Get Single Expense Details" -ForegroundColor Yellow
$firstId = $createdIds[0]
Write-Host "GET /api/expenses/$firstId" -ForegroundColor Gray
$single = Invoke-RestMethod -Uri "$baseUrl/expenses/$firstId" -Headers $headers
Write-Host "SUCCESS: Expense details" -ForegroundColor Green
Write-Host "  ID: $($single.data.expense._id)" -ForegroundColor White
Write-Host "  Description: $($single.data.expense.description)" -ForegroundColor White
Write-Host "  Amount: `$$($single.data.expense.amount)" -ForegroundColor White
Write-Host "  Category: $($single.data.expense.category)" -ForegroundColor White
Start-Sleep -Milliseconds 800
Write-Host ""

# Update expense
Write-Host "[STEP 7] Update Expense" -ForegroundColor Yellow
Write-Host "PUT /api/expenses/$firstId" -ForegroundColor Gray
$updateData = @{
    amount = 55.00
    category = "food"
    description = "Dinner at Italian restaurant (with dessert)"
} | ConvertTo-Json
$updated = Invoke-RestMethod -Uri "$baseUrl/expenses/$firstId" -Method PUT -Headers $headers -ContentType "application/json" -Body $updateData
Write-Host "SUCCESS: Expense updated" -ForegroundColor Green
Write-Host "  Old amount: `$45.50" -ForegroundColor White
Write-Host "  New amount: `$$($updated.data.expense.amount)" -ForegroundColor White
Write-Host "  New description: $($updated.data.expense.description)" -ForegroundColor White
Start-Sleep -Milliseconds 800
Write-Host ""

# Calculate total
Write-Host "[STEP 8] Calculate Total Spending" -ForegroundColor Yellow
$allExpenses = Invoke-RestMethod -Uri "$baseUrl/expenses" -Headers $headers
$total = ($allExpenses.data.expenses | Measure-Object -Property amount -Sum).Sum
Write-Host "SUCCESS: Total calculated" -ForegroundColor Green
Write-Host "  Total expenses: $($allExpenses.data.expenses.Count)" -ForegroundColor White
Write-Host "  Total amount: `$$([math]::Round($total, 2))" -ForegroundColor White
Start-Sleep -Milliseconds 800
Write-Host ""

# Delete expense
Write-Host "[STEP 9] Delete Expense" -ForegroundColor Yellow
$deleteId = $createdIds[-1]
Write-Host "DELETE /api/expenses/$deleteId" -ForegroundColor Gray
Invoke-RestMethod -Uri "$baseUrl/expenses/$deleteId" -Method DELETE -Headers $headers | Out-Null
Write-Host "SUCCESS: Expense deleted" -ForegroundColor Green
Start-Sleep -Milliseconds 800
Write-Host ""

# Verify deletion
Write-Host "[STEP 10] Verify Final State" -ForegroundColor Yellow
$finalExpenses = Invoke-RestMethod -Uri "$baseUrl/expenses" -Headers $headers
$finalTotal = ($finalExpenses.data.expenses | Measure-Object -Property amount -Sum).Sum
Write-Host "SUCCESS: Final count" -ForegroundColor Green
Write-Host "  Remaining expenses: $($finalExpenses.data.expenses.Count)" -ForegroundColor White
Write-Host "  New total: `$$([math]::Round($finalTotal, 2))" -ForegroundColor White
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "           DEMO COMPLETED!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Features Demonstrated:" -ForegroundColor Yellow
Write-Host "  [x] User Registration" -ForegroundColor Green
Write-Host "  [x] JWT Authentication" -ForegroundColor Green
Write-Host "  [x] Protected Routes" -ForegroundColor Green
Write-Host "  [x] Create Expenses" -ForegroundColor Green
Write-Host "  [x] List with Pagination" -ForegroundColor Green
Write-Host "  [x] Filter by Category" -ForegroundColor Green
Write-Host "  [x] Get Single Expense" -ForegroundColor Green
Write-Host "  [x] Update Expense" -ForegroundColor Green
Write-Host "  [x] Delete Expense" -ForegroundColor Green
Write-Host "  [x] MongoDB Integration" -ForegroundColor Green
Write-Host ""
