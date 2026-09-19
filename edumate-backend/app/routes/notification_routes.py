from flask import Blueprint, jsonify, request
from sqlalchemy import text

from .. import db
from ..services.notification_service import create_notification
from ..utils.tutor_auth import require_tutor


notification_bp = Blueprint("notifications", __name__)


def _tutor_notification_query():
    return text("""
        SELECT n.notification_id, n.title, n.message, n.notification_type,
               n.sender_id, n.related_entity_id, n.related_entity_type,
               n.status, n.created_at, s.first_name, s.last_name,
               c.course_title
        FROM notifications n
        LEFT JOIN students s ON s.student_id = n.sender_id
        LEFT JOIN courses c ON c.course_id = n.related_entity_id AND n.related_entity_type = 'course'
        WHERE n.tutor_id = :tutor_id AND n.recipient_role = 'tutor'
        ORDER BY n.created_at DESC, n.notification_id DESC
    """)


def _serialize(row):
    return {
        "id": row["notification_id"],
        "title": row["title"] or "Notification",
        "message": row["message"],
        "notification_type": row["notification_type"] or "General",
        "sender_id": row["sender_id"],
        "sender_name": " ".join(filter(None, [row["first_name"], row["last_name"]])) or None,
        "course_title": row["course_title"],
        "related_entity_id": row["related_entity_id"],
        "related_entity_type": row["related_entity_type"],
        "unread": row["status"] != "Read",
        "created_at": row["created_at"].isoformat() if row["created_at"] else None,
    }


@notification_bp.route("/tutor", methods=["GET"])
@require_tutor
def get_tutor_notifications(authenticated_tutor_id):
    rows = db.session.execute(_tutor_notification_query(), {"tutor_id": authenticated_tutor_id}).mappings().all()
    return jsonify({"success": True, "notifications": [_serialize(row) for row in rows]}), 200


@notification_bp.route("/tutor/<int:notification_id>/read", methods=["POST", "PATCH"])
@require_tutor
def mark_tutor_notification_read(notification_id, authenticated_tutor_id):
    result = db.session.execute(text("""
        UPDATE notifications SET status = 'Read'
        WHERE notification_id = :notification_id
          AND tutor_id = :tutor_id AND recipient_role = 'tutor'
    """), {"notification_id": notification_id, "tutor_id": authenticated_tutor_id})
    db.session.commit()
    if result.rowcount == 0:
        return jsonify({"success": False, "message": "Notification not found"}), 404
    return jsonify({"success": True}), 200


@notification_bp.route("/tutor/read-all", methods=["POST", "PATCH"])
@require_tutor
def mark_all_tutor_notifications_read(authenticated_tutor_id):
    db.session.execute(text("""
        UPDATE notifications SET status = 'Read'
        WHERE tutor_id = :tutor_id AND recipient_role = 'tutor' AND status <> 'Read'
    """), {"tutor_id": authenticated_tutor_id})
    db.session.commit()
    return jsonify({"success": True}), 200


@notification_bp.route("/tutor/send", methods=["POST"])
@require_tutor
def send_tutor_notification(authenticated_tutor_id):
    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    message = (data.get("message") or data.get("content") or "").strip()
    category = (data.get("category") or "General").strip()
    mode = data.get("recipient_mode") or "course"
    course_id = data.get("course_id")
    student_id = data.get("student_id")
    allowed_categories = {"Announcement", "Quiz", "Lesson", "Material", "Attendance", "Reminder", "General"}
    if not title or not message:
        return jsonify({"success": False, "message": "Title and message are required"}), 400
    if category not in allowed_categories:
        return jsonify({"success": False, "message": "Invalid notification category"}), 400

    owned_courses = db.session.execute(text(
        "SELECT course_id FROM courses WHERE tutor_id = :tutor_id"
    ), {"tutor_id": authenticated_tutor_id}).scalars().all()
    owned = set(owned_courses)
    if mode in {"student", "course"} and (not course_id or int(course_id) not in owned):
        return jsonify({"success": False, "message": "Course is not owned by this tutor"}), 403

    if mode == "student":
        related = db.session.execute(text("""
            SELECT 1 FROM enrollments WHERE student_id = :student_id AND course_id = :course_id
            UNION SELECT 1 FROM attendance WHERE student_id = :student_id AND course_id = :course_id
            LIMIT 1
        """), {"student_id": student_id, "course_id": course_id}).first()
        if not related:
            return jsonify({"success": False, "message": "Student is not related to this course"}), 403
        recipients = [int(student_id)]
    elif mode == "course":
        recipients = db.session.execute(text("""
            SELECT DISTINCT student_id FROM enrollments WHERE course_id = :course_id
            UNION SELECT DISTINCT student_id FROM attendance WHERE course_id = :course_id
        """), {"course_id": course_id}).scalars().all()
    elif mode == "all_courses":
        recipients = set()
        for owned_course_id in owned_courses:
            recipients.update(db.session.execute(text("""
                SELECT DISTINCT student_id FROM enrollments WHERE course_id = :course_id
                UNION SELECT DISTINCT student_id FROM attendance WHERE course_id = :course_id
            """), {"course_id": owned_course_id}).scalars().all())
        recipients = list(recipients)
    else:
        return jsonify({"success": False, "message": "Invalid recipient mode"}), 400

    for recipient_id in recipients:
        create_notification(
            student_id=recipient_id,
            recipient_role="student",
            sender_id=authenticated_tutor_id,
            sender_role="tutor",
            title=title,
            message=message,
            notification_type=category,
            related_entity_id=course_id if mode != "all_courses" else None,
            related_entity_type="course" if course_id else None,
        )
    db.session.commit()
    return jsonify({"success": True, "sent": len(recipients)}), 201