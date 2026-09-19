from flask import Blueprint, jsonify, request
from sqlalchemy import text
from werkzeug.security import check_password_hash, generate_password_hash
from .. import db
from ..services.logging_service import (
    log_course_approval, 
    log_course_rejection,
    log_user_deletion
)
from ..utils.admin_auth import require_admin, require_super_admin
from ..models.admin import Admin

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/dashboard-summary", methods=["GET"])
@require_admin
def dashboard_summary(authenticated_admin_id):
    total_students = db.session.execute(text("SELECT COUNT(*) FROM students")).scalar()
    total_tutors = db.session.execute(text("SELECT COUNT(*) FROM tutors")).scalar()
    total_courses = db.session.execute(text("SELECT COUNT(*) FROM courses")).scalar()
    pending_skill_requests = db.session.execute(
        text("SELECT COUNT(*) FROM skill_requests WHERE status = 'Pending'")
    ).scalar()
    pending_reports = db.session.execute(
        text("SELECT COUNT(*) FROM user_reports WHERE status = 'Pending'")
    ).scalar()

    return jsonify({
        "total_students": total_students,
        "total_tutors": total_tutors,
        "total_courses": total_courses,
        "pending_skill_requests": pending_skill_requests,
        "pending_reports": pending_reports
    }), 200


@admin_bp.route("/users", methods=["GET"])
@require_admin
def get_users(authenticated_admin_id):
    students = db.session.execute(text("""
        SELECT 
            student_id AS id,
            CONCAT(first_name, ' ', last_name) AS name,
            email,
            'Student' AS role,
            'Active' AS status,
            school_name,
            al_stream,
            grade_level,
            rating
        FROM students
    """)).mappings().all()

    tutors = db.session.execute(text("""
        SELECT
            tutor_id AS id,
            CONCAT(first_name, ' ', last_name) AS name,
            email,
            'Tutor' AS role,
            'Active' AS status,
            NULL AS school_name,
            NULL AS al_stream,
            NULL AS grade_level,
            NULL AS rating,
            specialization
        FROM tutors
    """)).mappings().all()

    users = [dict(user) for user in students] + [dict(user) for user in tutors]
    return jsonify(users), 200


@admin_bp.route("/users/student/<int:student_id>", methods=["DELETE"])
@require_super_admin
def delete_student(student_id, authenticated_admin_id, authenticated_admin):
    try:
        # Get student details before deletion
        student = db.session.execute(
            text("SELECT email, first_name, last_name FROM students WHERE student_id = :student_id"),
            {"student_id": student_id}
        ).fetchone()
        
        if not student:
            return jsonify({"message": "Student not found"}), 404
        
        # Delete the student
        db.session.execute(
            text("DELETE FROM students WHERE student_id = :student_id"),
            {"student_id": student_id}
        )
        db.session.commit()
        
        # Get admin info
        admin = db.session.execute(text("SELECT email, full_name FROM admins WHERE admin_id = :id"), {"id": authenticated_admin_id}).fetchone()
        admin_email = admin.email
        admin_name = admin.full_name
        student_name = f"{student.first_name} {student.last_name}"
        
        # Log the deletion
        log_user_deletion(student.email, student_name, 'Student', admin_email, admin_name)
        
        return jsonify({"message": "Student deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error deleting student: {str(e)}"}), 500


@admin_bp.route("/users/tutor/<int:tutor_id>", methods=["DELETE"])
@require_super_admin
def delete_tutor(tutor_id, authenticated_admin_id, authenticated_admin):
    try:
        # Get tutor details before deletion
        tutor = db.session.execute(
            text("SELECT email, first_name, last_name FROM tutors WHERE tutor_id = :tutor_id"),
            {"tutor_id": tutor_id}
        ).fetchone()
        
        if not tutor:
            return jsonify({"message": "Tutor not found"}), 404
        
        # Delete the tutor
        db.session.execute(
            text("DELETE FROM tutors WHERE tutor_id = :tutor_id"),
            {"tutor_id": tutor_id}
        )
        db.session.commit()
        
        # Get admin info
        admin = db.session.execute(text("SELECT email, full_name FROM admins WHERE admin_id = :id"), {"id": authenticated_admin_id}).fetchone()
        admin_email = admin.email
        admin_name = admin.full_name
        tutor_name = f"{tutor.first_name} {tutor.last_name}"
        
        # Log the deletion
        log_user_deletion(tutor.email, tutor_name, 'Tutor', admin_email, admin_name)
        
        return jsonify({"message": "Tutor deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error deleting tutor: {str(e)}"}), 500


@admin_bp.route("/courses", methods=["GET"])
@require_admin
def get_courses(authenticated_admin_id):
    courses = db.session.execute(text("""
        SELECT
            c.course_id AS id,
            c.course_title AS course,
            c.description,
            c.status,
            c.created_at,
            c.submitted_at,
            CONCAT(t.first_name, ' ', t.last_name) AS tutor
        FROM courses c
        LEFT JOIN tutors t ON c.tutor_id = t.tutor_id
        ORDER BY c.created_at DESC
    """)).mappings().all()

    return jsonify([dict(course) for course in courses]), 200


@admin_bp.route("/courses/pending", methods=["GET"])
@require_admin
def get_pending_courses(authenticated_admin_id):
    courses = db.session.execute(text("""
        SELECT
            c.course_id AS id,
            c.course_title AS course,
            c.description,
            c.status,
            c.created_at,
            c.submitted_at,
            CONCAT(t.first_name, ' ', t.last_name) AS tutor
        FROM courses c
        LEFT JOIN tutors t ON c.tutor_id = t.tutor_id
        WHERE c.status = 'Pending'
        ORDER BY c.created_at DESC
    """)).mappings().all()

    return jsonify([dict(course) for course in courses]), 200


@admin_bp.route("/materials", methods=["GET"])
@require_admin
def get_materials(authenticated_admin_id):
    materials = db.session.execute(text("""
         SELECT cm.material_id AS id, cm.title, cm.material_type, cm.file_path,
             cm.uploaded_at, c.course_id, c.course_title AS course,
             CONCAT(t.first_name, ' ', t.last_name) AS tutor,
             'Uploaded material' AS source
        FROM course_materials cm
        LEFT JOIN courses c ON cm.course_id = c.course_id
        LEFT JOIN tutors t ON c.tutor_id = t.tutor_id
         UNION ALL
         SELECT l.lesson_id AS id, l.lesson_title AS title, 'Lesson' AS material_type,
             l.lesson_file AS file_path, l.created_at AS uploaded_at,
             c.course_id, c.course_title AS course,
             CONCAT(t.first_name, ' ', t.last_name) AS tutor,
             'Lesson content' AS source
         FROM lessons l
         LEFT JOIN courses c ON l.course_id = c.course_id
         LEFT JOIN tutors t ON c.tutor_id = t.tutor_id
         ORDER BY uploaded_at DESC, id DESC
    """)).mappings().all()
    return jsonify([dict(material) for material in materials]), 200


@admin_bp.route("/materials/<int:material_id>", methods=["DELETE"])
@require_super_admin
def delete_material(material_id, authenticated_admin_id, authenticated_admin):
    material = db.session.execute(
        text("SELECT material_id FROM course_materials WHERE material_id = :id"),
        {"id": material_id},
    ).first()
    if not material:
        return jsonify({"message": "Material not found"}), 404
    db.session.execute(
        text("DELETE FROM course_materials WHERE material_id = :id"),
        {"id": material_id},
    )
    db.session.commit()
    return jsonify({"message": "Material deleted successfully"}), 200


@admin_bp.route("/courses/<int:course_id>/approve", methods=["PUT"])
@require_super_admin
def approve_course(course_id, authenticated_admin_id, authenticated_admin):
    try:
        # Get course details
        course = db.session.execute(
            text("SELECT c.course_title, c.tutor_id, c.status FROM courses c WHERE c.course_id = :course_id"),
            {"course_id": course_id}
        ).fetchone()
        
        if not course:
            return jsonify({"message": "Course not found"}), 404
        if course.status != "Pending":
            return jsonify({"message": "Only pending courses can be approved"}), 409
        
        # Update course status
        result = db.session.execute(
            text("UPDATE courses SET status = 'Approved' WHERE course_id = :course_id AND status = 'Pending'"),
            {"course_id": course_id}
        )
        if result.rowcount == 0:
            db.session.rollback()
            return jsonify({"message": "Only pending courses can be approved"}), 409
        db.session.commit()
        
        # Get admin info from request (you can get this from session or header)
        admin = db.session.execute(text("SELECT email, full_name FROM admins WHERE admin_id = :id"), {"id": authenticated_admin_id}).fetchone()
        admin_email = admin.email
        admin_name = admin.full_name
        
        # Log the approval
        log_course_approval(course.course_title, admin_email, admin_name)
        
        return jsonify({"message": "Course approved successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error approving course: {str(e)}"}), 500


@admin_bp.route("/courses/<int:course_id>/reject", methods=["PUT"])
@require_super_admin
def reject_course(course_id, authenticated_admin_id, authenticated_admin):
    try:
        data = request.get_json() or {}
        reason = data.get('reason', '')
        
        # Get course details
        course = db.session.execute(
            text("SELECT c.course_title, c.status FROM courses c WHERE c.course_id = :course_id"),
            {"course_id": course_id}
        ).fetchone()
        
        if not course:
            return jsonify({"message": "Course not found"}), 404
        if course.status != "Pending":
            return jsonify({"message": "Only pending courses can be rejected"}), 409
        
        # Update course status
        db.session.execute(
            text("UPDATE courses SET status = 'Rejected' WHERE course_id = :course_id AND status = 'Pending'"),
            {"course_id": course_id}
        )
        db.session.commit()
        
        # Get admin info from request
        admin = db.session.execute(text("SELECT email, full_name FROM admins WHERE admin_id = :id"), {"id": authenticated_admin_id}).fetchone()
        admin_email = admin.email
        admin_name = admin.full_name
        
        # Log the rejection
        log_course_rejection(course.course_title, admin_email, admin_name, reason)
        
        return jsonify({"message": "Course rejected successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error rejecting course: {str(e)}"}), 500


@admin_bp.route("/login-logs", methods=["GET"])
@require_admin
def get_login_logs(authenticated_admin_id):
    logs = db.session.execute(text("""
        SELECT
            log_id AS id,
            user_email,
            role,
            login_time,
            device,
            ip_address,
            status
        FROM login_logs
        ORDER BY login_time DESC
    """)).mappings().all()

    return jsonify([dict(log) for log in logs]), 200


@admin_bp.route("/system-logs", methods=["GET"])
@require_admin
def get_system_logs(authenticated_admin_id):
    from ..models.system_log_model import SystemLog
    
    logs = SystemLog.query.order_by(SystemLog.created_at.desc()).all()
    
    return jsonify([{
        'id': log.log_id,
        'timestamp': log.created_at.isoformat() if log.created_at else None,
        'level': log.level,
        'user': log.user_email,
        'user_name': log.user_name,
        'user_role': log.user_role,
        'action': log.action,
        'module': log.module,
        'ip': log.ip_address
    } for log in logs]), 200


@admin_bp.route("/user-reports", methods=["GET"])
@require_admin
def get_user_reports(authenticated_admin_id):
    reports = db.session.execute(text("""
        SELECT
            r.report_id AS id,
            r.reason,
            r.content,
            r.content_type,
            r.status,
            r.report_date,
            CONCAT(rb.first_name, ' ', rb.last_name) AS reported_by_name,
            CONCAT(ru.first_name, ' ', ru.last_name) AS reported_user_name
        FROM user_reports r
        LEFT JOIN students rb ON r.reported_by = rb.student_id
        LEFT JOIN students ru ON r.reported_user = ru.student_id
        ORDER BY r.report_date DESC
    """)).mappings().all()

    return jsonify([dict(report) for report in reports]), 200


@admin_bp.route("/user-reports/<int:report_id>/resolve", methods=["PUT"])
@require_super_admin
def resolve_report(report_id, authenticated_admin_id, authenticated_admin):
    if not db.session.execute(text("SELECT 1 FROM user_reports WHERE report_id = :id"), {"id": report_id}).first():
        return jsonify({"message": "Report not found"}), 404
    db.session.execute(
        text("UPDATE user_reports SET status = 'Resolved' WHERE report_id = :report_id"),
        {"report_id": report_id}
    )
    db.session.commit()
    return jsonify({"message": "Report marked as resolved"}), 200


@admin_bp.route("/user-reports/<int:report_id>", methods=["DELETE"])
@require_super_admin
def delete_report(report_id, authenticated_admin_id, authenticated_admin):
    if not db.session.execute(text("SELECT 1 FROM user_reports WHERE report_id = :id"), {"id": report_id}).first():
        return jsonify({"message": "Report not found"}), 404
    db.session.execute(
        text("DELETE FROM user_reports WHERE report_id = :report_id"),
        {"report_id": report_id}
    )
    db.session.commit()
    return jsonify({"message": "Report deleted successfully"}), 200


@admin_bp.route("/monitoring-stats", methods=["GET"])
@require_admin
def get_monitoring_stats(authenticated_admin_id):
    active_today = db.session.execute(text("""
        SELECT COUNT(*) FROM login_logs
        WHERE DATE(login_time) = CURDATE() AND status = 'Success'
    """)).scalar()

    new_courses_month = db.session.execute(text("""
        SELECT COUNT(*) FROM courses
        WHERE MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())
    """)).scalar()

    failed_logins_24h = db.session.execute(text("""
        SELECT COUNT(*) FROM login_logs
        WHERE status = 'Failed'
          AND login_time >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    """)).scalar()

    total_students = db.session.execute(
        text("SELECT COUNT(*) FROM students")
    ).scalar()

    total_tutors = db.session.execute(
        text("SELECT COUNT(*) FROM tutors")
    ).scalar()

    return jsonify({
        "active_today": active_today,
        "new_courses_month": new_courses_month,
        "failed_logins_24h": failed_logins_24h,
        "total_users": total_students + total_tutors
    }), 200


# ─────────────────────────────────────────────
# Admin Account Settings
# ─────────────────────────────────────────────

@admin_bp.route("/profile", methods=["GET"])
@require_admin
def get_admin_profile(authenticated_admin_id):
    row = db.session.execute(text("""
        SELECT admin_id, full_name, email FROM admins WHERE admin_id = :admin_id
    """), {"admin_id": authenticated_admin_id}).fetchone()

    if not row:
        return jsonify({"error": "Admin not found"}), 404

    return jsonify({
        "admin_id": row.admin_id,
        "full_name": row.full_name,
        "email": row.email
    }), 200


@admin_bp.route("/profile", methods=["PUT"])
@require_super_admin
def update_admin_profile(authenticated_admin_id, authenticated_admin):
    data = request.get_json() or {}
    full_name = data.get("full_name", "").strip()

    if not full_name:
        return jsonify({"error": "Full name is required"}), 400

    db.session.execute(text("""
        UPDATE admins SET full_name = :name WHERE admin_id = :admin_id
    """), {"name": full_name, "admin_id": authenticated_admin_id})
    db.session.commit()

    return jsonify({"message": "Profile updated successfully"}), 200


@admin_bp.route("/change-password", methods=["PUT"])
@require_super_admin
def change_admin_password(authenticated_admin_id, authenticated_admin):
    data             = request.get_json() or {}
    current_password = data.get("current_password", "")
    new_password     = data.get("new_password", "")

    if not all([current_password, new_password]):
        return jsonify({"error": "All fields are required"}), 400

    from ..models import Admin
    admin = Admin.query.get(authenticated_admin_id)
    if not admin:
        return jsonify({"error": "Admin not found"}), 404

    if not check_password_hash(admin.password, current_password):
        return jsonify({"error": "Current password is incorrect"}), 401
    if len(new_password) < 8:
        return jsonify({"error": "New password must be at least 8 characters"}), 400

    admin.password = generate_password_hash(new_password)
    db.session.commit()

    return jsonify({"message": "Password changed successfully"}), 200


@admin_bp.route("/admins", methods=["GET"])
@require_super_admin
def list_admins(authenticated_admin_id, authenticated_admin):
    admins = Admin.query.order_by(Admin.admin_id.asc()).all()
    return jsonify({"success": True, "admins": [admin.to_dict() for admin in admins]}), 200


@admin_bp.route("/admins", methods=["POST"])
@require_super_admin
def create_admin(authenticated_admin_id, authenticated_admin):
    data = request.get_json() or {}
    full_name = str(data.get("full_name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = data.get("password", "")
    if not full_name or not email or not password:
        return jsonify({"success": False, "message": "Full name, email, and password are required"}), 400
    if "@" not in email or len(password) < 8:
        return jsonify({"success": False, "message": "Enter a valid email and a password of at least 8 characters"}), 400
    if Admin.query.filter_by(email=email).first():
        return jsonify({"success": False, "message": "An Admin with this email already exists"}), 409
    admin = Admin(full_name=full_name, email=email, password=generate_password_hash(password), admin_level=2)
    db.session.add(admin)
    db.session.commit()
    return jsonify({"success": True, "admin": admin.to_dict()}), 201


@admin_bp.route("/admins/<int:admin_id>/level", methods=["PUT"])
@require_super_admin
def update_admin_level(admin_id, authenticated_admin_id, authenticated_admin):
    if admin_id == authenticated_admin_id:
        return jsonify({"success": False, "message": "You cannot change your own Admin level"}), 400
    admin = Admin.query.get(admin_id)
    if not admin:
        return jsonify({"success": False, "message": "Admin not found"}), 404
    level = (request.get_json() or {}).get("admin_level")
    if level != 2:
        return jsonify({"success": False, "message": "Only Regular Admin level can be assigned"}), 400
    admin.admin_level = level
    db.session.commit()
    return jsonify({"success": True, "admin": admin.to_dict()}), 200


@admin_bp.route("/admins/<int:admin_id>", methods=["DELETE"])
@require_super_admin
def delete_admin(admin_id, authenticated_admin_id, authenticated_admin):
    if admin_id == authenticated_admin_id:
        return jsonify({"success": False, "message": "You cannot delete your own Admin account"}), 400
    admin = Admin.query.get(admin_id)
    if not admin:
        return jsonify({"success": False, "message": "Admin not found"}), 404
    db.session.delete(admin)
    db.session.commit()
    return jsonify({"success": True, "message": "Admin deleted successfully"}), 200