from flask import Blueprint, request, jsonify
from .. import db
from ..models.student_model import Student, PendingStudent
from ..models.enrollment_model import Enrollment
import jwt
import os
import secrets
import string
import smtplib
import ssl
from datetime import datetime, timedelta
import traceback
from dotenv import load_dotenv

load_dotenv()
student_bp = Blueprint("student", __name__)

SECRET_KEY = os.getenv("SECRET_KEY", "change-me")


def generate_token(student_id):
    payload = {
        'student_id': student_id,
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')


def send_verification_email(recipient_email, token):
    smtp_host = os.getenv('SMTP_HOST')
    smtp_port = int(os.getenv('SMTP_PORT', '587'))
    smtp_user = os.getenv('SMTP_USER')
    smtp_password = (os.getenv('SMTP_PASSWORD') or '').replace(' ', '')
    email_from = os.getenv('EMAIL_FROM', smtp_user)
    app_name = os.getenv('APP_NAME', 'EduMate')

    if not all([smtp_host, smtp_user, smtp_password, email_from]):
        print('SMTP not configured. Skipping email.')
        return False

    subject = f'{app_name} Email Verification'
    body = (
        f'Hello,\n\n'
        f'Your {app_name} verification code is: {token}\n\n'
        f'Enter this code to activate your account.\n\n'
        f'Thank you,\n{app_name} Team'
    )
    message = f"Subject: {subject}\nTo: {recipient_email}\nFrom: {app_name} <{email_from}>\n\n{body}"

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls(context=context)
            server.login(smtp_user, smtp_password)
            server.sendmail(email_from, recipient_email, message)
        return True
    except Exception as exc:
        print(f'ERROR sending verification email: {exc}')
        return False


def send_reset_email(recipient_email, token):
    smtp_host = os.getenv('SMTP_HOST')
    smtp_port = int(os.getenv('SMTP_PORT', '587'))
    smtp_user = os.getenv('SMTP_USER')
    smtp_password = (os.getenv('SMTP_PASSWORD') or '').replace(' ', '')
    email_from = os.getenv('EMAIL_FROM', smtp_user)
    app_name = os.getenv('APP_NAME', 'EduMate')

    if not all([smtp_host, smtp_user, smtp_password, email_from]):
        print('SMTP not configured for password resets.')
        return False

    subject = f'{app_name} Password Reset Request'
    body = (
        f'Hello,\n\nYour {app_name} password reset code is: {token}\n\n'
        f'Thank you,\n{app_name} Team'
    )
    message = f"Subject: {subject}\nTo: {recipient_email}\nFrom: {app_name} <{email_from}>\n\n{body}"

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls(context=context)
            server.login(smtp_user, smtp_password)
            server.sendmail(email_from, recipient_email, message)
        return True
    except Exception as exc:
        print(f'ERROR sending reset email: {exc}')
        return False


def generate_numeric_code(length=6):
    return ''.join(secrets.choice(string.digits) for _ in range(length))


@student_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}

    for field, label in [
        ("firstName", "First name"), ("lastName", "Last name"),
        ("email", "Email"), ("password", "Password"),
        ("schoolName", "School name"), ("gradeLevel", "Grade level"),
        ("alStream", "AL stream")
    ]:
        if not data.get(field):
            return jsonify({"success": False, "message": f"{label} is required"}), 400

    if Student.query.filter_by(email=data['email']).first():
        return jsonify({"success": False, "message": "Email already registered"}), 409

    existing_pending = PendingStudent.query.filter_by(email=data['email']).first()
    if existing_pending:
        db.session.delete(existing_pending)
        db.session.commit()

    try:
        verification_token = generate_numeric_code(6)
        expiry = datetime.utcnow() + timedelta(hours=24)

        pending = PendingStudent(
            first_name=data['firstName'],
            last_name=data['lastName'],
            email=data['email'],
            school_name=data['schoolName'],
            grade_level=data['gradeLevel'],
            al_stream=data['alStream'],
            verification_token=verification_token,
            verification_expiry=expiry
        )
        pending.set_password(data['password'])
        db.session.add(pending)
        db.session.commit()

        email_sent = send_verification_email(pending.email, verification_token)
        debug_token = None if email_sent else verification_token

        return jsonify({
            "success": True,
            "message": "Registration successful. Verification code sent.",
            "email": pending.email,
            "debugToken": debug_token
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"ERROR in registration: {e}")
        print(traceback.format_exc())
        return jsonify({"success": False, "message": f"Registration failed: {str(e)}"}), 500


@student_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    if not data.get("email"):
        return jsonify({"success": False, "message": "Email is required"}), 400
    if not data.get("password"):
        return jsonify({"success": False, "message": "Password is required"}), 400

    student = Student.query.filter_by(email=data['email']).first()
    if not student:
        return jsonify({"success": False, "message": "Invalid email or password"}), 401

    if not student.check_password(data['password']):
        return jsonify({"success": False, "message": "Invalid email or password"}), 401

    if not student.is_verified:
        return jsonify({"success": False, "message": "Email not verified. Please verify before logging in."}), 403

    token = generate_token(student.student_id)

    return jsonify({
        "success": True,
        "message": "Login successful",
        "token": token,
        "student": {
            "student_id": student.student_id,
            "first_name": student.first_name,
            "last_name": student.last_name,
            "email": student.email,
            "school_name": student.school_name,
            "grade_level": student.grade_level,
            "al_stream": student.al_stream,
            "rating": student.rating
        }
    }), 200


@student_bp.route("/verify-email", methods=["POST"])
def verify_email():
    data = request.get_json() or {}

    if not data.get("email"):
        return jsonify({"success": False, "message": "Email is required"}), 400
    if not data.get("code"):
        return jsonify({"success": False, "message": "Verification code is required"}), 400

    pending = PendingStudent.query.filter_by(email=data["email"]).first()
    if not pending:
        return jsonify({"success": False, "message": "Pending registration not found. Please register first."}), 404

    if not pending.verification_token or pending.verification_token != data["code"]:
        return jsonify({"success": False, "message": "Invalid verification code."}), 400

    if pending.verification_expiry and pending.verification_expiry < datetime.utcnow():
        return jsonify({"success": False, "message": "Verification code expired. Please resend."}), 400

    try:
        student = Student(
            first_name=pending.first_name,
            last_name=pending.last_name,
            email=pending.email,
            school_name=pending.school_name,
            grade_level=pending.grade_level,
            al_stream=pending.al_stream
        )
        student.password = pending.password
        student.is_verified = True
        db.session.add(student)
        db.session.delete(pending)
        db.session.commit()
        return jsonify({"success": True, "message": "Email verified. Your account is now active."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Verification failed: {str(e)}"}), 500


@student_bp.route("/resend-verification", methods=["POST"])
def resend_verification():
    data = request.get_json() or {}
    if not data.get("email"):
        return jsonify({"success": False, "message": "Email is required"}), 400

    pending = PendingStudent.query.filter_by(email=data["email"]).first()
    if not pending:
        return jsonify({"success": False, "message": "Pending registration not found."}), 404

    pending.verification_token = generate_numeric_code(6)
    pending.verification_expiry = datetime.utcnow() + timedelta(hours=24)

    try:
        db.session.commit()
        email_sent = send_verification_email(pending.email, pending.verification_token)
        debug_token = None if email_sent else pending.verification_token
        return jsonify({"success": True, "message": "Verification code resent.", "debugToken": debug_token}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Could not resend: {str(e)}"}), 500


@student_bp.route("/profile/<int:student_id>", methods=["GET"])
def get_profile(student_id):
    student = Student.query.get(student_id)
    if not student:
        return jsonify({"success": False, "message": "Student not found"}), 404

    enrolled_courses = Enrollment.query.filter_by(student_id=student_id).count()

    return jsonify({
        "success": True,
        "student": {
            "student_id": student.student_id,
            "first_name": student.first_name,
            "last_name": student.last_name,
            "email": student.email,
            "school_name": student.school_name,
            "grade_level": student.grade_level,
            "al_stream": student.al_stream,
            "rating": student.rating,
            "enrolled_courses": enrolled_courses
        }
    }), 200


@student_bp.route("/profile/<int:student_id>", methods=["PUT"])
def update_profile(student_id):
    student = Student.query.get(student_id)
    if not student:
        return jsonify({"success": False, "message": "Student not found"}), 404

    data = request.get_json() or {}
    try:
        for field in ['first_name', 'last_name', 'school_name', 'grade_level', 'al_stream']:
            if field in data:
                setattr(student, field, data[field])
        if 'email' in data:
            existing = Student.query.filter_by(email=data['email']).first()
            if existing and existing.student_id != student_id:
                return jsonify({"success": False, "message": "Email already in use"}), 409
            student.email = data['email']
        db.session.commit()
        return jsonify({"success": True, "message": "Profile updated", "student": student.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Update failed: {str(e)}"}), 500


@student_bp.route("/change-password/<int:student_id>", methods=["POST"])
def change_password(student_id):
    student = Student.query.get(student_id)
    if not student:
        return jsonify({"success": False, "message": "Student not found"}), 404

    data = request.get_json() or {}
    if not data.get("old_password"):
        return jsonify({"success": False, "message": "Old password is required"}), 400
    if not data.get("new_password"):
        return jsonify({"success": False, "message": "New password is required"}), 400

    if not student.check_password(data['old_password']):
        return jsonify({"success": False, "message": "Old password is incorrect"}), 401

    try:
        student.set_password(data['new_password'])
        db.session.commit()
        return jsonify({"success": True, "message": "Password changed successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Password change failed: {str(e)}"}), 500


@student_bp.route("/my-courses/<int:student_id>", methods=["GET"])
def get_my_courses(student_id):
    student = Student.query.get(student_id)
    if not student:
        return jsonify({"success": False, "message": "Student not found"}), 404

    try:
        enrollments = Enrollment.query.filter_by(student_id=student_id).all()
        courses = [e.course.to_dict() for e in enrollments if e.course]
        return jsonify({"success": True, "courses": courses, "total": len(courses)}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error retrieving courses: {str(e)}"}), 500


@student_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    if not email:
        return jsonify({"success": False, "message": "Email is required"}), 400

    student = Student.query.filter_by(email=email).first()
    if not student:
        return jsonify({"success": True, "message": "If this email is registered, a reset code has been sent."}), 200

    try:
        reset_code = generate_numeric_code(6)
        student.verification_token = reset_code
        student.verification_expiry = datetime.utcnow() + timedelta(hours=1)
        db.session.commit()
        email_sent = send_reset_email(student.email, reset_code)
        debug_token = None if email_sent else reset_code
        return jsonify({"success": True, "message": "Reset code sent.", "debugToken": debug_token}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Failed to generate reset code: {str(e)}"}), 500


@student_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    code = data.get("code", "")
    new_password = data.get("new_password", "")

    if not email:
        return jsonify({"success": False, "message": "Email is required"}), 400
    if not code:
        return jsonify({"success": False, "message": "Verification code is required"}), 400
    if not new_password:
        return jsonify({"success": False, "message": "New password is required"}), 400

    student = Student.query.filter_by(email=email).first()
    if not student:
        return jsonify({"success": False, "message": "Student record not found."}), 404

    if not student.verification_token or student.verification_token != code.strip():
        return jsonify({"success": False, "message": "Invalid reset code."}), 400

    if student.verification_expiry and student.verification_expiry < datetime.utcnow():
        return jsonify({"success": False, "message": "Reset code expired. Please request a new one."}), 400

    try:
        student.set_password(new_password)
        student.verification_token = None
        student.verification_expiry = None
        db.session.commit()
        return jsonify({"success": True, "message": "Password reset successfully."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Reset failed: {str(e)}"}), 500
