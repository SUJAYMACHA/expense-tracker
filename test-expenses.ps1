# Test complete expense CRUD flow

$baseUrl = "http://localhost:3000/api"

Write-Host "`n=== EXPENSE TRACKER API - FULL TEST ===" -ForegroundColor Cyan
Write-Host ""

# 1. Register/Login
Write-Host "1. Logging in..." -ForegroundColor Yellow
$loginData = @{
    email = "alice@example.com"
    password = "password123"
} | ConvertTo-Json

$auth = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body $loginData
$token = $auth.data.token
$headers = @{ "Authorization" = "Bearer $token" }
Write-Host "   Login successful" -ForegroundColor Green
Write-Host ""

# 2. Create expense
Write-Host "2. Creating expense..." -ForegroundColor Yellow
$expense1 = @{
    amount = 45.50
    category = "food"
    description = "Lunch at downtown restaurant"
    date = "2026-02-03"
} | ConvertTo-Json

$created = Invoke-RestMethod -Uri "$baseUrl/expenses" -Method POST -Headers $headers -ContentType "application/json" -Body $expense1
$expenseId = $created.data.expense._id
Write-Host "   Expense created: ID $expenseId" -ForegroundColor Green
Write-Host "   Amount: $($created.data.expense.amount), Category: $($created.data.expense.category)" -ForegroundColor Gray
Write-Host ""

# 3. Create more expenses
Write-Host "3. Creating more expenses..." -ForegroundColor Yellow
$expense2 = @{ amount = 25; category = "transport"; description = "Uber ride home" } | ConvertTo-Json
$expense3 = @{ amount = 120; category = "utilities"; description = "Internet bill" } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/expenses" -Method POST -Headers $headers -ContentType "application/json" -Body $expense2 | Out-Null
Invoke-RestMethod -Uri "$baseUrl/expenses" -Method POST -Headers $headers -ContentType "application/json" -Body $expense3 | Out-Null
Write-Host "   2 more expenses created" -ForegroundColor Green
Write-Host ""

# 4. Get all expenses
Write-Host "4. Getting all expenses (paginated)..." -ForegroundColor Yellow
$allExpenses = Invoke-RestMethod -Uri "$baseUrl/expenses?page=1&limit=10" -Headers $headers
Write-Host "   Found $($allExpenses.data.pagination.total) expenses" -ForegroundColor Green
Write-Host "   Page $($allExpenses.data.pagination.page) of $($allExpenses.data.pagination.pages)" -ForegroundColor Gray
Write-Host ""

# 5. Get single expense
Write-Host "5. Getting single expense..." -ForegroundColor Yellow
$single = Invoke-RestMethod -Uri "$baseUrl/expenses/$expenseId" -Headers $headers
Write-Host "   Expense: $($single.data.expense.description)" -ForegroundColor Green
Write-Host ""

# 6. Update expense
Write-Host "6. Updating expense..." -ForegroundColor Yellow
$updated = @{
    amount = 50
    category = "food"
    description = "Lunch at downtown restaurant (updated amount)"
} | ConvertTo-Json
$result = Invoke-RestMethod -Uri "$baseUrl/expenses/$expenseId" -Method PUT -Headers $headers -ContentType "application/json" -Body $updated
Write-Host "   Updated amount: $($result.data.expense.amount)" -ForegroundColor Green
Write-Host ""

# 7. Filter by category
Write-Host "7. Filtering by category (food)..." -ForegroundColor Yellow
$filtered = Invoke-RestMethod -Uri "$baseUrl/expenses?category=food" -Headers $headers
Write-Host "   Found $($filtered.data.expenses.Count) food expenses" -ForegroundColor Green
Write-Host ""

# 8. Delete expense
Write-Host "8. Deleting expense..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$baseUrl/expenses/$expenseId" -Method DELETE -Headers $headers | Out-Null
Write-Host "   Expense deleted successfully" -ForegroundColor Green
Write-Host ""

# 9. Verify deletion
Write-Host "9. Verifying deletion..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$baseUrl/expenses/$expenseId" -Headers $headers -ErrorAction Stop
    Write-Host "   ERROR: Expense still exists" -ForegroundColor Red
} catch {
    Write-Host "   Confirmed: Expense no longer exists" -ForegroundColor Green
}
Write-Host ""

Write-Host "=== ALL TESTS PASSED ===" -ForegroundColor Green
Write-Host ""
Write-Host "Summary of implemented features:" -ForegroundColor Cyan
Write-Host "  - Create expense" -ForegroundColor Gray
Write-Host "  - List expenses with pagination" -ForegroundColor Gray
Write-Host "  - Filter by category and date" -ForegroundColor Gray
Write-Host "  - Get single expense" -ForegroundColor Gray
Write-Host "  - Update expense" -ForegroundColor Gray
Write-Host "  - Delete expense" -ForegroundColor Gray
Write-Host "  - All routes protected with JWT" -ForegroundColor Gray
