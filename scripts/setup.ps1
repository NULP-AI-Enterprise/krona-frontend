Write-Host "=== Krona Frontend Setup ===" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$FrontendDir = Split-Path -Parent $ScriptDir
Set-Location $FrontendDir

Write-Host "[1/2] Building and starting frontend container..." -ForegroundColor Yellow
docker-compose up -d --build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: docker-compose failed. Make sure Docker Desktop is running." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[2/2] Waiting for dev server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "=== Frontend setup complete! ===" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173"
