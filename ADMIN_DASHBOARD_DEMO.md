# Admin Dashboard Demonstration Guide

## Quick Start

### Option 1: Using PowerShell Script (Recommended)
```powershell
cd c:\Users\Dell\Desktop\Edumate
.\demo_admin_dashboard.ps1
```

### Option 2: Using Batch Script
```cmd
cd c:\Users\Dell\Desktop\Edumate
demo_admin_dashboard.bat
```

### Option 3: Manual Startup

**Terminal 1 - Backend:**
```powershell
cd c:\Users\Dell\Desktop\Edumate\edumate-backend
.\venv\Scripts\python.exe run.py
```

**Terminal 2 - Frontend:**
```powershell
cd c:\Users\Dell\Desktop\Edumate\edumate-frontend
npm run dev
```

Then open browser to: `http://localhost:5173`

---

## Admin Login

1. **Select Role:** Click "Admin" on the role selection screen
2. **Enter Credentials:**
   - Username: `admin@example.com` (or configured admin email)
   - Password: Your admin password
3. **Verify Code:** Check email for verification code and enter it
4. **Access Dashboard:** You'll be redirected to the admin dashboard

---

## Dashboard Features to Demonstrate

### 1. Dashboard Tab (Home)
- **System Alerts (Logs):** Shows latest login logs with:
  - Login Time
  - User Email
  - Role (Admin/Student/Tutor)
  - Device
  - IP Address
  - Status (Success/Failed)

- **Summary Cards:** Displays:
  - Total Users (Students + Tutors)
  - Pending Skill Requests
  - Pending User Reports
  - Total Courses
  - Active Tutors

### 2. User Management
- View all students and tutors
- Search users by name or email
- Delete users
- View detailed user information

### 3. Course Approval
- View pending courses from tutors
- Review course details
- Approve or reject courses
- View all approved/rejected courses

### 4. User Reports
- View user complaints and reports
- See report details (reason, content, timestamp)
- Mark reports as resolved
- Delete reports

### 5. System Monitoring
- View login statistics:
  - Successful logins today
  - Failed logins in last 24 hours
  - New courses this month
  - Total users
- Review recent login logs
- View user activities

### 6. System Logs
- View all system events
- Filter by log level (INFO, WARNING, ERROR, CRITICAL)
- Filter by module (Auth, Course, SkillBarter, etc.)
- Search logs
- View detailed event information

### 7. Account Settings
- Update admin profile information
- Change admin password
- View account details

---

## Sample Data for Testing

### Admin Credentials
- Email: `admin@gmail.com`
- Password: `admin123` (or configured password)

### Student Test Login
- Email: `nethmi@gmail.com`
- Password: `student123`

### Tutor Test Login
- Email: `kasun.tutor@gmail.com`
- Password: `tutor123`

---

## Key Actions to Test

### Generate Log Entries
1. **Login Logs:**
   - Log in as Admin, Student, and Tutor
   - Try failed login attempts
   - Check dashboard for login logs

2. **Course Events:**
   - Tutor submits a course for approval
   - Admin approves/rejects course
   - System logs capture these actions

3. **Skill Barter Requests:**
   - Student sends skill request
   - Logs appear in System Logs

4. **User Deletions:**
   - Delete a student or tutor from User Management
   - Check System Logs for deletion event

---

## API Endpoints Reference

### Login Logs
```
GET http://localhost:5000/api/admin/login-logs
```
Returns login history with timestamps, IPs, devices, and status.

### System Logs
```
GET http://localhost:5000/api/admin/system-logs
```
Returns all system events with user info, actions, and modules.

### Dashboard Summary
```
GET http://localhost:5000/api/admin/dashboard-summary
```
Returns counts of users, courses, and pending items.

### Monitoring Stats
```
GET http://localhost:5000/api/admin/monitoring-stats
```
Returns login statistics and activity metrics.

---

## Troubleshooting

### Backend Won't Start
- **Issue:** ModuleNotFoundError
- **Solution:** Activate virtual environment properly
  ```powershell
  .\venv\Scripts\python.exe run.py
  ```

### Frontend Won't Start
- **Issue:** npm ERR! not ok
- **Solution:** Install dependencies
  ```powershell
  npm install
  ```

### Port Already in Use
- **Issue:** Backend (5000) or Frontend (5173) port already in use
- **Solution:** Kill existing processes
  ```powershell
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```

### Database Connection Error
- **Issue:** Can't connect to MySQL
- **Solution:** Ensure MySQL is running and .env file has correct credentials

### Can't Find Admin Email
- **Issue:** Admin credentials not working
- **Solution:** Check database for admin user or create new admin
  ```bash
  cd edumate-backend
  python create_admin.py
  ```

---

## Performance Tips

1. **Browser Console:** Open DevTools (F12) to check for errors
2. **Network Tab:** Monitor API calls to backend
3. **Clear Cache:** If seeing stale data, clear browser cache
4. **Check Terminal Output:** Backend logs show SQL queries and errors

---

## System Alerts Example Log

The dashboard shows logs like:
```
Login Time: 2026-07-03 15:30:45
User Email: admin@gmail.com
Role: Admin
Device: Windows PC
IP Address: 192.168.1.100
Status: Success
```

Or for system events:
```
Timestamp: 2026-07-03 15:31:20
Level: INFO
User: kasun.tutor@gmail.com
Role: Tutor
Module: Course
Action: Tutor submitted a new ICT course for approval
```

---

## Next Steps

After demonstrating the admin dashboard:

1. **Test Student Portal:** Log in as student to test skill barter system
2. **Test Tutor Panel:** Log in as tutor to submit courses
3. **Monitor Real Activities:** Watch system logs update in real-time
4. **Test Filters:** Use search and filters in System Logs tab
5. **Review Reports:** Check user reports and take actions

---

## Notes

- All system events are logged to the database
- Login logs and system logs are separate but both visible in dashboard
- Log levels help identify importance: INFO < WARNING < ERROR < CRITICAL
- IP addresses and device info are automatically captured
- Timestamps are stored in UTC and converted to local time in UI
