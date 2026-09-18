import os
from datetime import datetime, timedelta
from functools import wraps

import jwt
from flask import jsonify, request


SECRET_KEY = os.getenv("SECRET_KEY", "change-me")


def create_admin_token(admin_id, admin_level=None):
    claims = {
        "admin_id": admin_id,
        "role": "Admin",
        "exp": datetime.utcnow() + timedelta(hours=24),
    }
    if admin_level is not None:
        claims["admin_level"] = admin_level
    return jwt.encode(
        claims,
        SECRET_KEY,
        algorithm="HS256",
    )


def current_admin_id():
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None
    try:
        payload = jwt.decode(header.split(" ", 1)[1], SECRET_KEY, algorithms=["HS256"])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None
    if payload.get("role") != "Admin" or payload.get("admin_id") is None:
        return None
    try:
        return int(payload["admin_id"])
    except (TypeError, ValueError):
        return None


def current_admin():
    from ..models.admin import Admin

    admin_id = current_admin_id()
    return Admin.query.get(admin_id) if admin_id is not None else None


def require_admin(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        admin = current_admin()
        if admin is None:
            return jsonify({"success": False, "message": "Admin authentication required"}), 401
        kwargs["authenticated_admin_id"] = admin.admin_id
        return view(*args, **kwargs)

    return wrapped


def require_super_admin(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        admin = current_admin()
        if admin is None:
            return jsonify({"success": False, "message": "Admin authentication required"}), 401
        if admin.admin_level != 1:
            return jsonify({"success": False, "message": "Super Admin permission required"}), 403
        kwargs["authenticated_admin_id"] = admin.admin_id
        kwargs["authenticated_admin"] = admin
        return view(*args, **kwargs)

    return wrapped
