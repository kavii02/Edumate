from datetime import datetime
from flask import request
from .. import db
from ..models.system_log_model import SystemLog


def get_user_ip():
    """Get the user's IP address from the request"""
    return request.headers.get("X-Forwarded-For", request.remote_addr) or "Unknown"


def log_system_event(
    action,
    level='INFO',
    user_email=None,
    user_name=None,
    user_role=None,
    module=None,
    ip_address=None,
    additional_data=None
):
    """
    Log a system event to the database
    
    Args:
        action: Description of the action performed
        level: Log level (INFO, WARNING, ERROR, CRITICAL)
        user_email: Email of the user performing the action
        user_name: Full name of the user
        user_role: Role of the user (Admin, Student, Tutor, System)
        module: Module/section where the action occurred
        ip_address: IP address of the user
        additional_data: Additional data as a dictionary
    """
    try:
        log_entry = SystemLog(
            timestamp=datetime.utcnow(),
            level=level,
            user_email=user_email,
            user_name=user_name,
            user_role=user_role,
            action=action,
            module=module,
            ip_address=ip_address or get_user_ip(),
            additional_data=additional_data
        )
        db.session.add(log_entry)
        db.session.commit()
        return log_entry
    except Exception as e:
        db.session.rollback()
        print(f"Error logging system event: {str(e)}")
        return None


def log_login(user_email, user_name, user_role, status, ip_address=None):
    """Log a login event"""
    action = f"{user_role} logged {'in' if status == 'Success' else 'in (failed)'} to the system"
    level = 'INFO' if status == 'Success' else 'WARNING'
    
    return log_system_event(
        action=action,
        level=level,
        user_email=user_email,
        user_name=user_name,
        user_role=user_role,
        module='Auth',
        ip_address=ip_address or get_user_ip(),
        additional_data={'login_status': status}
    )


def log_multiple_failed_logins(user_email, attempt_count, ip_address=None):
    """Log multiple failed login attempts"""
    action = f"Multiple failed login attempts detected for {user_email} ({attempt_count} attempts)"
    
    return log_system_event(
        action=action,
        level='WARNING',
        user_email=user_email,
        user_role='System',
        module='Auth',
        ip_address=ip_address or get_user_ip(),
        additional_data={'attempt_count': attempt_count}
    )


def log_course_submission(tutor_email, tutor_name, course_title):
    """Log when a tutor submits a new course"""
    action = f"Tutor submitted a new {course_title} course for approval"
    
    return log_system_event(
        action=action,
        level='INFO',
        user_email=tutor_email,
        user_name=tutor_name,
        user_role='Tutor',
        module='Course',
        additional_data={'course_title': course_title}
    )


def log_course_approval(course_title, admin_email, admin_name):
    """Log when an admin approves a course"""
    action = f"Course '{course_title}' was approved by admin"
    
    return log_system_event(
        action=action,
        level='INFO',
        user_email=admin_email,
        user_name=admin_name,
        user_role='Admin',
        module='Course',
        additional_data={'course_title': course_title}
    )


def log_course_rejection(course_title, admin_email, admin_name, reason=None):
    """Log when an admin rejects a course"""
    action = f"Course '{course_title}' was rejected by admin"
    
    return log_system_event(
        action=action,
        level='WARNING',
        user_email=admin_email,
        user_name=admin_name,
        user_role='Admin',
        module='Course',
        additional_data={'course_title': course_title, 'reason': reason}
    )


def log_skill_request(student_email, student_name, skill_requested):
    """Log when a student sends a skill barter request"""
    action = f"Student sent a skill barter request for '{skill_requested}'"
    
    return log_system_event(
        action=action,
        level='INFO',
        user_email=student_email,
        user_name=student_name,
        user_role='Student',
        module='SkillBarter',
        additional_data={'skill_requested': skill_requested}
    )


def log_user_report(reporter_email, reporter_name, reported_user_name, reason):
    """Log when a user is reported"""
    action = f"User report submitted against {reported_user_name}. Reason: {reason}"
    
    return log_system_event(
        action=action,
        level='WARNING',
        user_email=reporter_email,
        user_name=reporter_name,
        user_role='Student',
        module='Reports',
        additional_data={'reported_user': reported_user_name, 'reason': reason}
    )


def log_user_deletion(deleted_user_email, deleted_user_name, deleted_user_role, admin_email, admin_name):
    """Log when a user is deleted by admin"""
    action = f"Admin deleted {deleted_user_role} account: {deleted_user_name}"
    
    return log_system_event(
        action=action,
        level='INFO',
        user_email=admin_email,
        user_name=admin_name,
        user_role='Admin',
        module='UserManagement',
        additional_data={'deleted_user': deleted_user_name, 'deleted_role': deleted_user_role}
    )


def log_password_change(user_email, user_name, user_role):
    """Log when a user changes their password"""
    action = f"{user_role} changed their password"
    
    return log_system_event(
        action=action,
        level='INFO',
        user_email=user_email,
        user_name=user_name,
        user_role=user_role,
        module='Security'
    )
