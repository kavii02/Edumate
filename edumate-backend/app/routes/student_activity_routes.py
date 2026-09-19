from datetime import datetime

from flask import Blueprint, jsonify, request

from .. import db
from ..models.lesson_feedback_model import LessonFeedback
from ..utils.student_auth import require_student
from ..services.notification_service import create_notification
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
        text("""
            SELECT 1 FROM enrollments
            WHERE student_id = :student_id AND course_id = :course_id
            UNION
            SELECT 1 FROM attendance
            WHERE student_id = :student_id AND course_id = :course_id
            LIMIT 1
        """),
        {"student_id": authenticated_student_id, "course_id": course_id},
    ).first():
        return jsonify({"success": False, "message": "Student is not connected to this course"}), 403

    lesson_id = data.get("lesson_id")
    feedback = LessonFeedback(
        student_id=authenticated_student_id,
        course_id=course_id,
        lesson_id=lesson_id,
        feedback_level=feedback_level,
    )
    db.session.add(feedback)
    db.session.flush()
    if feedback_level in {"Confused", "Partially Understood"}:
        student = db.session.execute(text("""
            SELECT s.first_name, s.last_name, c.course_title, c.tutor_id
            FROM students s
            JOIN courses c ON c.course_id = :course_id
            WHERE s.student_id = :student_id
        """), {"student_id": authenticated_student_id, "course_id": course_id}).mappings().first()
        if student and student["tutor_id"]:
            create_notification(
                tutor_id=student["tutor_id"],
                recipient_role="tutor",
                sender_id=authenticated_student_id,
                sender_role="student",
                title=("Student Needs Support" if feedback_level == "Confused" else "Student Feedback Received"),
                message=(
                    f"{student['first_name']} {student['last_name']} marked a lesson in "
                    f"{student['course_title']} as {feedback_level}."
                ),
                notification_type="Lesson",
                related_entity_id=feedback.feedback_id,
                related_entity_type="lesson_feedback",
                dedupe_key=f"lesson-feedback:{feedback.feedback_id}",
            )
    db.session.commit()
    return jsonify({"success": True, "feedback": feedback.to_dict()}), 201


@student_activity_bp.route("/notifications", methods=["GET"])
@require_student
def get_notifications(authenticated_student_id):
    rows = db.session.execute(text("""
         SELECT notification_id, student_id, tutor_id, sender_id, sender_role,
             title, message, notification_type, related_entity_id,
             related_entity_type, status, created_at
        FROM notifications
        WHERE student_id = :student_id AND recipient_role = 'student'
        ORDER BY created_at DESC, notification_id DESC
    """), {"student_id": authenticated_student_id}).mappings().all()
    return jsonify({"success": True, "notifications": [
        {
            "id": row["notification_id"],
            "title": row["title"] or "Notification",
            "text": row["message"],
            "message": row["message"],
            "sender_id": row["sender_id"],
            "sender_role": row["sender_role"],
            "notification_type": row["notification_type"] or "General",
            "related_entity_id": row["related_entity_id"],
            "related_entity_type": row["related_entity_type"],
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
        WHERE notification_id = :notification_id AND student_id = :student_id AND recipient_role = 'student'
    """), {"notification_id": notification_id, "student_id": authenticated_student_id})
    db.session.commit()
    if result.rowcount == 0:
        return jsonify({"success": False, "message": "Notification not found"}), 404
    return jsonify({"success": True}), 200


@student_activity_bp.route("/notifications/read-all", methods=["POST", "PATCH"])
@require_student
def mark_all_notifications_read(authenticated_student_id):
    db.session.execute(text("""
        UPDATE notifications SET status = 'Read'
        WHERE student_id = :student_id AND recipient_role = 'student' AND status <> 'Read'
    """), {"student_id": authenticated_student_id})
    db.session.commit()
    return jsonify({"success": True}), 200


@student_activity_bp.route("/notifications/<int:notification_id>", methods=["DELETE"])
@require_student
def delete_notification(notification_id, authenticated_student_id):
    result = db.session.execute(text("""
        DELETE FROM notifications
        WHERE notification_id = :notification_id AND student_id = :student_id AND recipient_role = 'student'
    """), {"notification_id": notification_id, "student_id": authenticated_student_id})
    db.session.commit()
    if result.rowcount == 0:
        return jsonify({"success": False, "message": "Notification not found"}), 404
    return jsonify({"success": True}), 200


@student_activity_bp.route("/notifications", methods=["DELETE"])
@require_student
def clear_notifications(authenticated_student_id):
    db.session.execute(text("DELETE FROM notifications WHERE student_id = :student_id AND recipient_role = 'student'"), {"student_id": authenticated_student_id})
    db.session.commit()
    return jsonify({"success": True}), 200
