from flask import Blueprint, jsonify, request
from sqlalchemy import text
from werkzeug.security import check_password_hash, generate_password_hash
from .. import db

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/dashboard-summary", methods=["GET"])
def dashboard_summary():
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
def get_users():
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
            NULL AS specialization
        FROM tutors
    """)).mappings().all()

    users = [dict(user) for user in students] + [dict(user) for user in tutors]
    return jsonify(users), 200


@admin_bp.route("/users/student/<int:student_id>", methods=["DELETE"])
def delete_student(student_id):
    db.session.execute(
        text("DELETE FROM students WHERE student_id = :student_id"),
        {"student_id": student_id}
    )
    db.session.commit()
    return jsonify({"message": "Student deleted successfully"}), 200


@admin_bp.route("/users/tutor/<int:tutor_id>", methods=["DELETE"])
def delete_tutor(tutor_id):
    db.session.execute(
        text("DELETE FROM tutors WHERE tutor_id = :tutor_id"),
        {"tutor_id": tutor_id}
    )
    db.session.commit()
    return jsonify({"message": "Tutor deleted successfully"}), 200


@admin_bp.route("/courses", methods=["GET"])
def get_courses():
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
def get_pending_courses():
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


@admin_bp.route("/courses/<int:course_id>/approve", methods=["PUT"])
def approve_course(course_id):
    db.session.execute(
        text("UPDATE courses SET status = 'Approved' WHERE course_id = :course_id"),
        {"course_id": course_id}
    )
    db.session.commit()
    return jsonify({"message": "Course approved successfully"}), 200


@admin_bp.route("/courses/<int:course_id>/reject", methods=["PUT"])
def reject_course(course_id):
    db.session.execute(
        text("UPDATE courses SET status = 'Rejected' WHERE course_id = :course_id"),
        {"course_id": course_id}
    )
    db.session.commit()
    return jsonify({"message": "Course rejected successfully"}), 200


@admin_bp.route("/login-logs", methods=["GET"])
def get_login_logs():
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
def get_system_logs():
    logs = db.session.execute(text("""
        SELECT
            log_id AS id,
            created_at AS timestamp,
            level,
            user_email AS user,
            action,
            module,
            ip_address AS ip
        FROM system_logs
        ORDER BY created_at DESC
    """)).mappings().all()

    return jsonify([dict(log) for log in logs]), 200


@admin_bp.route("/user-reports", methods=["GET"])
def get_user_reports():
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
def resolve_report(report_id):
    db.session.execute(
        text("UPDATE user_reports SET status = 'Resolved' WHERE report_id = :report_id"),
        {"report_id": report_id}
    )
    db.session.commit()
    return jsonify({"message": "Report marked as resolved"}), 200


@admin_bp.route("/user-reports/<int:report_id>", methods=["DELETE"])
def delete_report(report_id):
    db.session.execute(
        text("DELETE FROM user_reports WHERE report_id = :report_id"),
        {"report_id": report_id}
    )
    db.session.commit()
    return jsonify({"message": "Report deleted successfully"}), 200


@admin_bp.route("/monitoring-stats", methods=["GET"])
def get_monitoring_stats():
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
def get_admin_profile():
    email = request.args.get("email", "").strip().lower()
    if not email:
        return jsonify({"error": "Email is required"}), 400

    row = db.session.execute(text("""
        SELECT admin_id, full_name, email FROM admins WHERE LOWER(email) = :email
    """), {"email": email}).fetchone()

    if not row:
        return jsonify({"error": "Admin not found"}), 404

    return jsonify({
        "admin_id": row.admin_id,
        "full_name": row.full_name,
        "email": row.email
    }), 200


@admin_bp.route("/profile", methods=["PUT"])
def update_admin_profile():
    data = request.get_json() or {}
    email     = data.get("email", "").strip().lower()
    full_name = data.get("full_name", "").strip()

    if not email or not full_name:
        return jsonify({"error": "Email and full name are required"}), 400

    db.session.execute(text("""
        UPDATE admins SET full_name = :name WHERE LOWER(email) = :email
    """), {"name": full_name, "email": email})
    db.session.commit()

    return jsonify({"message": "Profile updated successfully"}), 200


@admin_bp.route("/change-password", methods=["PUT"])
def change_admin_password():
    data             = request.get_json() or {}
    email            = data.get("email", "").strip().lower()
    current_password = data.get("current_password", "")
    new_password     = data.get("new_password", "")

    if not all([email, current_password, new_password]):
        return jsonify({"error": "All fields are required"}), 400

    from ..models import Admin
    admin = Admin.query.filter_by(email=email).first()
    if not admin:
        return jsonify({"error": "Admin not found"}), 404

    if not check_password_hash(admin.password, current_password):
        return jsonify({"error": "Current password is incorrect"}), 401

    admin.password = generate_password_hash(new_password)
    db.session.commit()

    return jsonify({"message": "Password changed successfully"}), 200