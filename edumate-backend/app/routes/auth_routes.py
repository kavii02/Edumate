from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from ..models import Admin

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def admin_login():

    data = request.get_json()

    username = data.get("username", "").strip()
    password = data.get("password", "")
    role = data.get("role", "").strip().lower()

    # Empty field validation
    if not username:
        return jsonify({
            "success": False,
            "message": "Username is required"
        }), 400

    if not password:
        return jsonify({
            "success": False,
            "message": "Password is required"
        }), 400

    # Only admin login
    if role != "admin":
        return jsonify({
            "success": False,
            "message": "Invalid role selected"
        }), 401

    admin = Admin.query.filter_by(email=username).first()

    if not admin:
        return jsonify({
            "success": False,
            "message": "Invalid username or password"
        }), 401

    # ✅ FIXED LINE (IMPORTANT)
    if not check_password_hash(admin.password, password):
        return jsonify({
            "success": False,
            "message": "Invalid username or password"
        }), 401

    return jsonify({
        "success": True,
        "message": "Login successful",
        "admin": {
            "id": admin.admin_id,
            "name": admin.full_name,
            "email": admin.email
        }
    }), 200