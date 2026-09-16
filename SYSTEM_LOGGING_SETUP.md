# System Logging Implementation Guide

## Overview
A comprehensive system logging feature has been implemented to track all important system events including:
- User login events (success and failures)
- Course submissions, approvals, and rejections
- Skill barter requests
- User account deletions
- Password changes
- User reports

## Database Setup

### 1. Create the system_logs table
Run the SQL script provided in `database_setup/create_system_logs_table.sql`:

```sql
CREATE TABLE IF NOT EXISTS `system_logs` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `level` varchar(50) NOT NULL DEFAULT 'INFO',
  `user_email` varchar(255) DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `user_role` varchar(50) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `module` varchar(100) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `additional_data` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `idx_timestamp` (`timestamp`),
  KEY `idx_level` (`level`),
  KEY `idx_user_email` (`user_email`),
  KEY `idx_module` (`module`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Backend Changes

### New Files Created:
1. **`app/models/system_log_model.py`** - SystemLog SQLAlchemy model
2. **`app/services/logging_service.py`** - Logging service with helper functions

### Updated Files:

#### 1. `app/models/__init__.py`
- Added import for SystemLog model

#### 2. `app/routes/auth_routes.py`
- Imported logging service functions
- Updated `log_login()` function to log to both login_logs and system_logs tables
- Now captures user names and role information for better tracking
- Logs login attempts for Admin, Student, and Tutor roles

#### 3. `app/routes/admin_routes.py`
- Added logging for course approval/rejection
- Added logging for user deletion (both students and tutors)
- Updated endpoints:
  - `/api/admin/courses/<course_id>/approve` - Logs course approval
  - `/api/admin/courses/<course_id>/reject` - Logs course rejection
  - `/api/admin/users/student/<student_id>` - Logs student deletion
  - `/api/admin/users/tutor/<tutor_id>` - Logs tutor deletion
  - `/api/admin/system-logs` - Enhanced to return detailed system logs

#### 4. `app/routes/skill_request_routes.py`
- Updated `/api/skillrequests/send` endpoint
- Logs skill barter requests with student and skill information

## Frontend Changes

### Updated: `src/AdminManagement/AdminDashboard.jsx`
- Enhanced System Alerts (Logs) section with:
  - Timestamp formatting (displays in local timezone)
  - Color-coded log levels (INFO, WARNING, ERROR, CRITICAL)
  - User name display
  - User role badge
  - Module badge (Auth, Course, SkillBarter, etc.)
  - Full action description
  - Better visual hierarchy and styling

## API Endpoints

### System Logs Endpoint
**GET** `/api/admin/system-logs`

Returns an array of system log entries with the following structure:
```json
{
  "id": 1,
  "timestamp": "2026-07-03T12:34:56",
  "level": "INFO",
  "user": "john.doe@example.com",
  "user_name": "John Doe",
  "user_role": "Admin",
  "action": "Admin logged in to the system",
  "module": "Auth",
  "ip": "192.168.1.100"
}
```

## Logging Functions Available

### In `app/services/logging_service.py`:

1. **`log_system_event()`** - Generic logging function
2. **`log_login()`** - Logs user login attempts
3. **`log_multiple_failed_logins()`** - Logs multiple failed login attempts
4. **`log_course_submission()`** - Logs tutor course submissions
5. **`log_course_approval()`** - Logs course approval by admin
6. **`log_course_rejection()`** - Logs course rejection by admin
7. **`log_skill_request()`** - Logs skill barter requests
8. **`log_user_report()`** - Logs user reports
9. **`log_user_deletion()`** - Logs user account deletions
10. **`log_password_change()`** - Logs password changes

## Current Logging Coverage

### Login Events
- ✅ Admin login (success/failure)
- ✅ Student login (success/failure)
- ✅ Tutor login (success/failure)

### Course Events
- ✅ Course approval by admin
- ✅ Course rejection by admin

### User Management
- ✅ Student deletion by admin
- ✅ Tutor deletion by admin

### Skill Barter
- ✅ Skill request sent by student

## Displaying Logs in Admin Dashboard

The admin dashboard now displays:
1. Latest system logs in the "System Alerts (Logs)" section
2. Color-coded log levels for quick identification
3. User information (name and role)
4. Module classification for filtering
5. Detailed action descriptions

## Future Enhancements

Additional logging can be added for:
- Profile updates
- File uploads/downloads
- Attendance marking
- Quiz submissions
- Course material access

To add new logging events, use the logging service functions:

```python
from ..services.logging_service import log_system_event

log_system_event(
    action="Description of the action",
    level="INFO",  # or WARNING, ERROR, CRITICAL
    user_email="user@example.com",
    user_name="User Full Name",
    user_role="Student",  # or Admin, Tutor
    module="ModuleName",
    additional_data={'key': 'value'}
)
```

## Testing

1. **Admin Dashboard**: Navigate to the System Alerts section to see logs
2. **Login Logs**: Perform logins with different roles to verify logging
3. **Course Management**: Approve/reject courses to verify course logging
4. **User Management**: Delete users to verify deletion logging
5. **Skill Requests**: Send skill requests to verify request logging

## Notes

- All timestamps are stored in UTC and converted to local timezone on the frontend
- Log levels help identify the severity of events (INFO for normal operations, WARNING for important changes, ERROR for failures)
- IP addresses are captured automatically from requests
- Additional data is stored as JSON for flexible logging of context-specific information
- Database indexes are created on frequently queried columns for performance
