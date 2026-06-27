from flask import Blueprint, request, jsonify
from sqlalchemy import func
from werkzeug.security import check_password_hash, generate_password_hash
from ..models import Admin, Tutor
from .. import db

auth_bp = Blueprint("auth", __name__)


def _verify_tutor_password(tutor, password):
    stored = tutor.password or ""

    if stored and check_password_hash(stored, password):
        return True

    if stored == password:
        tutor.password = generate_password_hash(password)
        db.session.commit()
        return True

    return False


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    username = (data.get("username") or data.get("email") or "").strip()
    password = data.get("password", "")
    role = data.get("role", "").strip().lower()

    if not username:
        return jsonify({"success": False, "message": "Username is required"}), 400

    if not password:
        return jsonify({"success": False, "message": "Password is required"}), 400

    if role == "admin":
        admin = Admin.query.filter(func.lower(Admin.email) == username.lower()).first()

        if not admin or not check_password_hash(admin.password, password):
            return jsonify({
                "success": False,
                "message": "Invalid username or password",
            }), 401

        return jsonify({
            "success": True,
            "message": "Login successful",
            "admin": {
                "id": admin.admin_id,
                "name": admin.full_name,
                "email": admin.email,
            },
        }), 200

    if role == "tutor":
        email = username.lower()
        tutor = Tutor.query.filter(func.lower(Tutor.email) == email).first()

        if not tutor or not _verify_tutor_password(tutor, password):
            return jsonify({
                "success": False,
                "message": "Invalid email or password",
            }), 401

        return jsonify({
            "success": True,
            "message": "Login successful",
            "tutor": {
                "tutor_id": tutor.tutor_id,
                "first_name": tutor.first_name,
                "last_name": tutor.last_name,
                "full_name": tutor.full_name,
                "email": tutor.email,
            },
        }), 200

    return jsonify({"success": False, "message": "Invalid role selected"}), 401
