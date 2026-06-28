from datetime import datetime
from random import randint

from flask import Blueprint, request, jsonify
from sqlalchemy import text
from werkzeug.security import check_password_hash

from .. import db
from ..models import Admin, AdminVerificationCode
from ..services.email_service import send_verification_email


auth_bp = Blueprint("auth", __name__)


# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────

def generate_verification_code(length=6):
    return "".join(str(randint(0, 9)) for _ in range(length))


def detect_device(user_agent_string):
    ua = (user_agent_string or "").lower()
    if "iphone" in ua or "ipad" in ua:
        return "iPhone/iPad"
    if "android" in ua:
        return "Android Phone"
    if "windows" in ua:
        return "Windows PC"
    if "macintosh" in ua or "mac os" in ua:
        return "MacBook"
    if "linux" in ua:
        return "Linux PC"
    return "Unknown Device"


def log_login(email, role, status):
    ip = request.headers.get("X-Forwarded-For", request.remote_addr) or "Unknown"
    device = detect_device(request.headers.get("User-Agent", ""))

    db.session.execute(text("""
        INSERT INTO login_logs (user_email, role, login_time, device, ip_address, status)
        VALUES (:email, :role, :now, :device, :ip, :status)
    """), {
        "email": email,
        "role": role,
        "now": datetime.now(),
        "device": device,
        "ip": ip,
        "status": status
    })
    db.session.commit()


def cleanup_old_codes():
    expired_codes = AdminVerificationCode.query.filter(
        AdminVerificationCode.expires_at < datetime.utcnow(),
        AdminVerificationCode.used == False
    ).all()

    for code in expired_codes:
        db.session.delete(code)

    db.session.commit()


# ─────────────────────────────────────────────
# Admin Auth
# ─────────────────────────────────────────────

@auth_bp.route("/login", methods=["POST"])
def admin_login():
    data = request.get_json() or {}

    username = data.get("username", "").strip().lower()
    password = data.get("password", "")
    role     = data.get("role", "").strip().lower()

    if not username:
        return jsonify({"success": False, "message": "Username is required"}), 400
    if not password:
        return jsonify({"success": False, "message": "Password is required"}), 400
    if role != "admin":
        return jsonify({"success": False, "message": "Invalid role selected"}), 401

    admin = Admin.query.filter_by(email=username).first()

    if not admin or not check_password_hash(admin.password, password):
        log_login(username, "Admin", "Failed")
        return jsonify({"success": False, "message": "Invalid username or password"}), 401

    cleanup_old_codes()

    AdminVerificationCode.query.filter_by(
        admin_id=admin.admin_id,
        used=False
    ).update({"used": True})

    verification_code = generate_verification_code()

    new_code = AdminVerificationCode(
        admin_id=admin.admin_id,
        code=verification_code,
        expires_in_minutes=10
    )

    db.session.add(new_code)
    db.session.commit()

    try:
        send_verification_email(admin.email, verification_code)
    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Login details are correct, but email sending failed.",
            "error": str(e)
        }), 500

    return jsonify({
        "success": True,
        "message": "Verification code sent to your email.",
        "admin": {
            "id": admin.admin_id,
            "name": admin.full_name,
            "email": admin.email
        }
    }), 200


@auth_bp.route("/verify-code", methods=["POST"])
def verify_code():
    data = request.get_json() or {}

    email = data.get("email", "").strip().lower()
    code  = data.get("code", "").strip()

    if not email:
        return jsonify({"success": False, "message": "Email is required."}), 400
    if not code:
        return jsonify({"success": False, "message": "Verification code is required."}), 400

    admin = Admin.query.filter_by(email=email).first()
    if not admin:
        return jsonify({"success": False, "message": "Invalid admin email."}), 401

    verification_record = AdminVerificationCode.query.filter_by(
        admin_id=admin.admin_id,
        code=code,
        used=False
    ).order_by(AdminVerificationCode.created_at.desc()).first()

    if not verification_record:
        return jsonify({
            "success": False,
            "message": "Invalid verification code or code already used."
        }), 401

    if verification_record.is_expired():
        verification_record.used = True
        db.session.commit()
        return jsonify({"success": False, "message": "Verification code expired."}), 401

    verification_record.used = True
    db.session.commit()

    log_login(email, "Admin", "Success")

    return jsonify({
        "success": True,
        "message": "Verification successful.",
        "admin": {
            "id": admin.admin_id,
            "name": admin.full_name,
            "email": admin.email
        }
    }), 200


@auth_bp.route("/resend-code", methods=["POST"])
def resend_code():
    data = request.get_json() or {}

    email = data.get("email", "").strip().lower()
    if not email:
        return jsonify({"success": False, "message": "Email is required."}), 400

    admin = Admin.query.filter_by(email=email).first()
    if not admin:
        return jsonify({"success": False, "message": "Invalid admin email."}), 401

    cleanup_old_codes()

    AdminVerificationCode.query.filter_by(
        admin_id=admin.admin_id,
        used=False
    ).update({"used": True})

    verification_code = generate_verification_code()

    new_code = AdminVerificationCode(
        admin_id=admin.admin_id,
        code=verification_code,
        expires_in_minutes=10
    )

    db.session.add(new_code)
    db.session.commit()

    try:
        send_verification_email(admin.email, verification_code)
    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Code generated, but email sending failed.",
            "error": str(e)
        }), 500

    return jsonify({
        "success": True,
        "message": "New verification code sent to your email."
    }), 200


# ─────────────────────────────────────────────
# Student Auth
# ─────────────────────────────────────────────

@auth_bp.route("/student-login", methods=["POST"])
def student_login():
    data = request.get_json() or {}

    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password are required."}), 400

    student = db.session.execute(text("""
        SELECT student_id, first_name, last_name, email, password
        FROM students
        WHERE LOWER(email) = :email
    """), {"email": email}).fetchone()

    if not student or student.password != password:
        log_login(email, "Student", "Failed")
        return jsonify({"success": False, "message": "Invalid email or password."}), 401

    log_login(student.email, "Student", "Success")

    return jsonify({
        "success": True,
        "message": "Login successful.",
        "student": {
            "id": student.student_id,
            "name": f"{student.first_name} {student.last_name}",
            "email": student.email
        }
    }), 200


# ─────────────────────────────────────────────
# Tutor Auth
# ─────────────────────────────────────────────

@auth_bp.route("/tutor-login", methods=["POST"])
def tutor_login():
    data = request.get_json() or {}

    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password are required."}), 400

    tutor = db.session.execute(text("""
        SELECT tutor_id, first_name, last_name, email, password
        FROM tutors
        WHERE LOWER(email) = :email
    """), {"email": email}).fetchone()

    if not tutor:
        log_login(email, "Tutor", "Failed")
        return jsonify({"success": False, "message": "Invalid email or password."}), 401

    if not check_password_hash(tutor.password, password):
        log_login(email, "Tutor", "Failed")
        return jsonify({"success": False, "message": "Invalid email or password."}), 401

    log_login(tutor.email, "Tutor", "Success")

    return jsonify({
        "success": True,
        "message": "Login successful.",
        "tutor": {
            "id": tutor.tutor_id,
            "name": f"{tutor.first_name} {tutor.last_name}",
            "email": tutor.email
        }
    }), 200
