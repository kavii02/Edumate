@echo off
REM EduMate Admin Dashboard Demonstration Batch Script
REM This script provides instructions to start both servers manually

color 0B
echo.
echo ========================================
echo   EduMate Admin Dashboard Demo
echo ========================================
echo.

REM Check if paths exist
if not exist "c:\Users\Dell\Desktop\Edumate\edumate-backend" (
    echo ERROR: Backend path not found
    pause
    exit /b 1
)

if not exist "c:\Users\Dell\Desktop\Edumate\edumate-frontend" (
    echo ERROR: Frontend path not found
    pause
    exit /b 1
)

echo Project paths verified [OK]
echo.

echo ========================================
echo STEP 1: Start Backend Server
echo ========================================
echo.
echo Opening PowerShell for Backend Server...
start pwsh -NoExit -Command "Set-Location 'c:\Users\Dell\Desktop\Edumate\edumate-backend'; .\venv\Scripts\python.exe run.py"

echo Backend starting... waiting 3 seconds
timeout /t 3 /nobreak

echo.
echo ========================================
echo STEP 2: Start Frontend Dev Server
echo ========================================
echo.
echo Opening PowerShell for Frontend Server...
start pwsh -NoExit -Command "Set-Location 'c:\Users\Dell\Desktop\Edumate\edumate-frontend'; npm run dev"

echo Frontend starting... waiting 5 seconds
timeout /t 5 /nobreak

echo.
echo ========================================
echo SERVERS STARTING
echo ========================================
echo.
echo Backend URL:  http://localhost:5000
echo Frontend URL: http://localhost:5173
echo.

REM Open browser
start http://localhost:5173

echo.
echo Admin Dashboard opening in browser...
echo.
echo ========================================
echo DEMO READY!
echo ========================================
echo.
echo Admin Login Credentials:
echo  - Username: admin@example.com (or your admin email)
echo  - Role: Admin
echo.
echo Features to Test:
echo  1. Dashboard - View system alerts and login logs
echo  2. User Management - Manage students and tutors
echo  3. Course Approval - Approve/reject tutor courses
echo  4. User Reports - Handle user complaints
echo  5. System Monitoring - View login statistics
echo  6. System Logs - View all system events
echo  7. Account Settings - Update admin profile
echo.
echo Press any key to close this window
pause
