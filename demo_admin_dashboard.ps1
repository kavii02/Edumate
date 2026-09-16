# EduMate Admin Dashboard Demonstration Script
# This script starts both the backend and frontend servers for admin dashboard testing

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EduMate Admin Dashboard Demo Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Define project paths
$projectRoot = "c:\Users\Dell\Desktop\Edumate"
$backendPath = "$projectRoot\edumate-backend"
$frontendPath = "$projectRoot\edumate-frontend"

# Check if paths exist
if (-not (Test-Path $backendPath)) {
    Write-Host "ERROR: Backend path not found: $backendPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendPath)) {
    Write-Host "ERROR: Frontend path not found: $frontendPath" -ForegroundColor Red
    exit 1
}

Write-Host "Project paths verified ✓" -ForegroundColor Green
Write-Host ""

# Start Backend Server
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Write-Host "Location: $backendPath" -ForegroundColor Gray

Set-Location $backendPath

# Check if virtual environment exists
if (-not (Test-Path ".\venv")) {
    Write-Host "Virtual environment not found. Please create it first." -ForegroundColor Red
    exit 1
}

# Start backend in a new terminal
$backendScript = {
    Set-Location "c:\Users\Dell\Desktop\Edumate\edumate-backend"
    .\venv\Scripts\python.exe run.py
}

Start-Process -FilePath "pwsh.exe" -ArgumentList "-NoExit", "-Command", $backendScript -WindowStyle Normal

Write-Host "Backend server starting in new terminal..." -ForegroundColor Green
Write-Host "Backend URL: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""

# Wait for backend to start
Start-Sleep -Seconds 3

# Start Frontend Dev Server
Write-Host "Starting Frontend Dev Server..." -ForegroundColor Yellow
Write-Host "Location: $frontendPath" -ForegroundColor Gray

Set-Location $frontendPath

# Start frontend in a new terminal
$frontendScript = {
    Set-Location "c:\Users\Dell\Desktop\Edumate\edumate-frontend"
    npm run dev
}

Start-Process -FilePath "pwsh.exe" -ArgumentList "-NoExit", "-Command", $frontendScript -WindowStyle Normal

Write-Host "Frontend server starting in new terminal..." -ForegroundColor Green
Write-Host "Frontend URL: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Servers Starting..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Waiting for servers to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Open browser to admin login
Write-Host "Opening Admin Dashboard in browser..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Demo Ready!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Admin Dashboard URLs:" -ForegroundColor Cyan
Write-Host "  Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:   http://localhost:5000" -ForegroundColor White
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Select 'Admin' role on the login screen" -ForegroundColor White
Write-Host "  2. Enter admin credentials and verify email code" -ForegroundColor White
Write-Host "  3. Access the Dashboard tab to view system alerts and logs" -ForegroundColor White
Write-Host ""

Write-Host "Features to Test:" -ForegroundColor Cyan
Write-Host "  • Dashboard - View system alerts and login logs" -ForegroundColor White
Write-Host "  • User Management - View, search, and delete users" -ForegroundColor White
Write-Host "  • Course Approval - Approve/reject courses from tutors" -ForegroundColor White
Write-Host "  • User Reports - View and resolve user reports" -ForegroundColor White
Write-Host "  • System Monitoring - View login stats and activities" -ForegroundColor White
Write-Host "  • System Logs - View all system events with filters" -ForegroundColor White
Write-Host "  • Account Settings - Update admin profile and password" -ForegroundColor White
Write-Host ""

Write-Host "Press Ctrl+C in either terminal to stop the servers" -ForegroundColor Gray
