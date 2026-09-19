from functools import wraps

import jwt
from flask import current_app, jsonify, request


def current_tutor_id():
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None
    try:
        payload = jwt.decode(header.split(" ", 1)[1], current_app.config["SECRET_KEY"], algorithms=["HS256"])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None
    if payload.get("role") != "tutor" or payload.get("tutor_id") is None:
        return None
    return int(payload["tutor_id"])


def require_tutor(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        tutor_id = current_tutor_id()
        if tutor_id is None:
            return jsonify({"success": False, "message": "Tutor authentication required"}), 401
        kwargs["authenticated_tutor_id"] = tutor_id
        return view(*args, **kwargs)
    return wrapped