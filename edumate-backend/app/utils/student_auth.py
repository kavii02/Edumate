import os
from functools import wraps

import jwt
from flask import jsonify, request


SECRET_KEY = os.getenv("SECRET_KEY", "change-me")


def current_student_id():
    """Return the authenticated student's ID from the existing Bearer token."""
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None

    try:
        payload = jwt.decode(header.split(" ", 1)[1], SECRET_KEY, algorithms=["HS256"])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None

    student_id = payload.get("student_id")
    return int(student_id) if student_id is not None else None


def require_student(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        student_id = current_student_id()
        if student_id is None:
            return jsonify({"success": False, "message": "Student authentication required"}), 401
        kwargs["authenticated_student_id"] = student_id
        return view(*args, **kwargs)

    return wrapped
