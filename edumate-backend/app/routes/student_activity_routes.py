from datetime import datetime

from flask import Blueprint, jsonify, request

from .. import db
from ..models.lesson_feedback_model import LessonFeedback
from ..utils.student_auth import require_student
from sqlalchemy import text


student_activity_bp = Blueprint("student_activity", __name__)
FEEDBACK_LEVELS = {"Understood", "Partially Understood", "Confused"}


@student_activity_bp.route("/lesson-feedback", methods=["GET"])
@require_student
def get_lesson_feedback(authenticated_student_id):
    rows = LessonFeedback.query.filter_by(student_id=authenticated_student_id).order_by(LessonFeedback.created_at.desc()).all()
    latest = {}
    for row in rows:
        key = (row.course_id, row.lesson_id)
        latest.setdefault(key, row.to_dict())
    return jsonify({"success": True, "feedback": list(latest.values())}), 200


@student_activity_bp.route("/lesson-feedback", methods=["POST"])
@require_student
def save_lesson_feedback(authenticated_student_id):
    data = request.get_json() or {}
    course_id = data.get("course_id")
    feedback_level = data.get("feedback_level")
    if not course_id or feedback_level not in FEEDBACK_LEVELS:
        return jsonify({"success": False, "message": "course_id and a valid feedback level are required"}), 400

    if not db.session.execute(
        text("SELECT 1 FROM courses WHERE course_id = :course_id"),
        {"course_id": course_id},
    ).first():
        return jsonify({"success": False, "message": "Course not found"}), 404

    lesson_id = data.get("lesson_id")
    feedback = LessonFeedback(
        student_id=authenticated_student_id,
        course_id=course_id,
        lesson_id=lesson_id,
        feedback_level=feedback_level,
    )
    db.session.add(feedback)
    db.session.commit()
    return jsonify({"success": True, "feedback": feedback.to_dict()}), 201


@student_activity_bp.route("/notifications", methods=["GET"])
@require_student
def get_notifications(authenticated_student_id):
    rows = db.session.execute(text("""
        SELECT notification_id, message, status, created_at
        FROM notifications
        WHERE student_id = :student_id
        ORDER BY created_at DESC, notification_id DESC
    """), {"student_id": authenticated_student_id}).mappings().all()
    return jsonify({"success": True, "notifications": [
        {
            "id": row["notification_id"],
            "text": row["message"],
            "unread": row["status"] != "Read",
            "created_at": row["created_at"].isoformat() if row["created_at"] else None,
        }
        for row in rows
    ]}), 200


@student_activity_bp.route("/notifications/<int:notification_id>/read", methods=["POST"])
@require_student
def mark_notification_read(notification_id, authenticated_student_id):
    result = db.session.execute(text("""
        UPDATE notifications
        SET status = 'Read'
        WHERE notification_id = :notification_id AND student_id = :student_id
    """), {"notification_id": notification_id, "student_id": authenticated_student_id})
    db.session.commit()
    if result.rowcount == 0:
        return jsonify({"success": False, "message": "Notification not found"}), 404
    return jsonify({"success": True}), 200


@student_activity_bp.route("/notifications/<int:notification_id>", methods=["DELETE"])
@require_student
def delete_notification(notification_id, authenticated_student_id):
    result = db.session.execute(text("""
        DELETE FROM notifications
        WHERE notification_id = :notification_id AND student_id = :student_id
    """), {"notification_id": notification_id, "student_id": authenticated_student_id})
    db.session.commit()
    if result.rowcount == 0:
        return jsonify({"success": False, "message": "Notification not found"}), 404
    return jsonify({"success": True}), 200


@student_activity_bp.route("/notifications", methods=["DELETE"])
@require_student
def clear_notifications(authenticated_student_id):
    db.session.execute(text("DELETE FROM notifications WHERE student_id = :student_id"), {"student_id": authenticated_student_id})
    db.session.commit()
    return jsonify({"success": True}), 200
