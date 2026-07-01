from datetime import datetime
from random import randint

from flask import Blueprint, jsonify, request
from sqlalchemy import func, text
from werkzeug.security import check_password_hash, generate_password_hash

from .. import db
from ..models import Admin, AdminVerificationCode, Tutor

try:
    from ..services.email_service import send_verification_email
except Exception:
    send_verification_email = None


auth_bp = Blueprint("auth", __name__)


# -------------------------------------------------
# Helper Functions
# -------------------------------------------------

def _normalize_email(value):
    return (value or "").strip().lower()


def _password_matches(stored_password, provided_password):
    """
    Supports both hashed passwords and old plain-text passwords.
    """
    if not stored_password or not provided_password:
        return False

    try:
        if check_password_hash(stored_password, provided_password):
            return True
    except Exception:
        pass

    return stored_password == provided_password


def _is_hashed_password(stored_password):
    if not stored_password:
        return False

    try:
        check_password_hash(stored_password, "dummy-password")
        return True
    except Exception:
        return False


def _upgrade_password_if_plaintext(model, provided_password):
    """
    If an old password is saved as plain text, convert it to a hashed password.
    """
    try:
        if model.password and not _is_hashed_password(model.password):
            if model.password == provided_password:
                model.password = generate_password_hash(provided_password)
                db.session.commit()
    except Exception:
        db.session.rollback()


def generate_verification_code(length=6):
    return "".join(str(randint(0, 9)) for _ in range(length))


def detect_device(user_agent_string):
    user_agent = (user_agent_string or "").lower()

    if "iphone" in user_agent or "ipad" in user_agent:
        return "iPhone/iPad"
    if "android" in user_agent:
        return "Android Phone"
    if "windows" in user_agent:
        return "Windows PC"
    if "macintosh" in user_agent or "mac os" in user_agent:
        return "MacBook"
    if "linux" in user_agent:
        return "Linux PC"

    return "Unknown Device"


def log_login(email, role, status):
    """
    Save login attempt.
    If login_logs table has an issue, it will not break login.
    """
    try:
        ip = request.headers.get("X-Forwarded-For", request.remote_addr) or "Unknown"
        device = detect_device(request.headers.get("User-Agent", ""))

        db.session.execute(
            text("""
                INSERT INTO login_logs
                    (user_email, role, login_time, device, ip_address, status)
                VALUES
                    (:email, :role, :now, :device, :ip, :status)
            """),
            {
                "email": email,
                "role": role,
                "now": datetime.now(),
                "device": device,
                "ip": ip,
                "status": status,
            }
        )

        db.session.commit()

    except Exception:
        db.session.rollback()


def cleanup_old_codes():
    try:
        expired_codes = AdminVerificationCode.query.filter(
            AdminVerificationCode.expires_at < datetime.utcnow(),
            AdminVerificationCode.used.is_(False),
        ).all()

        for code in expired_codes:
            db.session.delete(code)

        db.session.commit()

    except Exception:
        db.session.rollback()


def _admin_response(admin):
    full_name = getattr(admin, "full_name", None)

    return {
        "id": admin.admin_id,
        "admin_id": admin.admin_id,
        "name": full_name,
        "full_name": full_name,
        "email": admin.email,
    }


def _tutor_response(tutor):
    first_name = getattr(tutor, "first_name", "") or ""
    last_name = getattr(tutor, "last_name", "") or ""
    full_name = getattr(tutor, "full_name", None) or f"{first_name} {last_name}".strip()

    return {
        "id": tutor.tutor_id,
        "tutor_id": tutor.tutor_id,
        "first_name": first_name,
        "last_name": last_name,
        "name": full_name,
        "full_name": full_name,
        "email": tutor.email,
    }


# -------------------------------------------------
# Login Functions
# -------------------------------------------------

def _login_admin(email, password):
    admin = Admin.query.filter(func.lower(Admin.email) == email).first()

    if not admin or not _password_matches(admin.password, password):
        log_login(email, "Admin", "Failed")
        return jsonify({
            "success": False,
            "message": "Invalid username or password",
        }), 401

    _upgrade_password_if_plaintext(admin, password)
    log_login(admin.email, "Admin", "Success")

    return jsonify({
        "success": True,
        "message": "Login successful",
        "admin": _admin_response(admin),
    }), 200


def _login_tutor(email, password):
    tutor = Tutor.query.filter(func.lower(Tutor.email) == email).first()

    if not tutor or not _password_matches(tutor.password, password):
        log_login(email, "Tutor", "Failed")
        return jsonify({
            "success": False,
            "message": "Invalid email or password",
        }), 401

    _upgrade_password_if_plaintext(tutor, password)
    log_login(tutor.email, "Tutor", "Success")

    return jsonify({
        "success": True,
        "message": "Login successful",
        "tutor": _tutor_response(tutor),
    }), 200


def _login_student(email, password):
    try:
        student = db.session.execute(
            text("""
                SELECT student_id, first_name, last_name, email, password
                FROM students
                WHERE LOWER(email) = :email
                LIMIT 1
            """),
            {"email": email}
        ).mappings().first()

    except Exception:
        return jsonify({
            "success": False,
            "message": "Database error while checking student login.",
        }), 500

    if not student or not _password_matches(student["password"], password):
        log_login(email, "Student", "Failed")
        return jsonify({
            "success": False,
            "message": "Invalid email or password",
        }), 401

    try:
        if student["password"] and not _is_hashed_password(student["password"]):
            db.session.execute(
                text("""
                    UPDATE students
                    SET password = :password
                    WHERE student_id = :student_id
                """),
                {
                    "password": generate_password_hash(password),
                    "student_id": student["student_id"],
                }
            )
            db.session.commit()

    except Exception:
        db.session.rollback()

    full_name = f"{student['first_name']} {student['last_name']}".strip()

    log_login(student["email"], "Student", "Success")

    return jsonify({
        "success": True,
        "message": "Login successful",
        "student": {
            "id": student["student_id"],
            "student_id": student["student_id"],
            "name": full_name,
            "full_name": full_name,
            "email": student["email"],
        },
    }), 200


# -------------------------------------------------
# Main Role-Based Login Route
# -------------------------------------------------

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    email = _normalize_email(data.get("email") or data.get("username"))
    password = data.get("password", "")
    role = (data.get("role") or "").strip().lower()

    if not email:
        return jsonify({
            "success": False,
            "message": "Email or username is required",
        }), 400

    if not password:
        return jsonify({
            "success": False,
            "message": "Password is required",
        }), 400

    if role == "admin":
        return _login_admin(email, password)

    if role == "tutor":
        return _login_tutor(email, password)

    if role == "student":
        return _login_student(email, password)

    return jsonify({
        "success": False,
        "message": "Invalid role selected",
    }), 401


# -------------------------------------------------
# Separate Student Login Route
# -------------------------------------------------

@auth_bp.route("/student-login", methods=["POST"])
def student_login():
    data = request.get_json() or {}

    email = _normalize_email(data.get("email") or data.get("username"))
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required.",
        }), 400

    return _login_student(email, password)


# -------------------------------------------------
# Separate Tutor Login Route
# -------------------------------------------------

@auth_bp.route("/tutor-login", methods=["POST"])
def tutor_login():
    data = request.get_json() or {}

    email = _normalize_email(data.get("email") or data.get("username"))
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required.",
        }), 400

    return _login_tutor(email, password)


# -------------------------------------------------
# Admin Verification Code Routes
# -------------------------------------------------

@auth_bp.route("/verify-code", methods=["POST"])
def verify_code():
    data = request.get_json() or {}

    email = _normalize_email(data.get("email"))
    code = (data.get("code") or "").strip()

    if not email:
        return jsonify({
            "success": False,
            "message": "Email is required.",
        }), 400

    if not code:
        return jsonify({
            "success": False,
            "message": "Verification code is required.",
        }), 400

    admin = Admin.query.filter(func.lower(Admin.email) == email).first()

    if not admin:
        return jsonify({
            "success": False,
            "message": "Invalid admin email.",
        }), 401

    verification_record = AdminVerificationCode.query.filter_by(
        admin_id=admin.admin_id,
        code=code,
        used=False,
    ).order_by(AdminVerificationCode.created_at.desc()).first()

    if not verification_record:
        return jsonify({
            "success": False,
            "message": "Invalid verification code or code already used.",
        }), 401

    if verification_record.is_expired():
        verification_record.used = True
        db.session.commit()

        return jsonify({
            "success": False,
            "message": "Verification code expired.",
        }), 401

    verification_record.used = True
    db.session.commit()

    log_login(email, "Admin", "Success")

    return jsonify({
        "success": True,
        "message": "Verification successful.",
        "admin": _admin_response(admin),
    }), 200


@auth_bp.route("/resend-code", methods=["POST"])
def resend_code():
    data = request.get_json() or {}

    email = _normalize_email(data.get("email"))

    if not email:
        return jsonify({
            "success": False,
            "message": "Email is required.",
        }), 400

    admin = Admin.query.filter(func.lower(Admin.email) == email).first()

    if not admin:
        return jsonify({
            "success": False,
            "message": "Invalid admin email.",
        }), 401

    cleanup_old_codes()

    try:
        AdminVerificationCode.query.filter_by(
            admin_id=admin.admin_id,
            used=False,
        ).update({"used": True})

        verification_code = generate_verification_code()

        new_code = AdminVerificationCode(
            admin_id=admin.admin_id,
            code=verification_code,
            expires_in_minutes=10,
        )

        db.session.add(new_code)
        db.session.commit()

    except Exception:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Could not generate verification code.",
        }), 500

    if send_verification_email:
        try:
            send_verification_email(admin.email, verification_code)
        except Exception:
            return jsonify({
                "success": False,
                "message": "Code generated, but email sending failed.",
            }), 500

    return jsonify({
        "success": True,
        "message": "New verification code sent to your email.",
    }), 200