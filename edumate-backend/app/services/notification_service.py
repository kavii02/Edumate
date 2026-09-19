from datetime import datetime

from sqlalchemy import text

from .. import db


def create_notification(
    *,
    recipient_role,
    title,
    message,
    notification_type="General",
    student_id=None,
    tutor_id=None,
    sender_id=None,
    sender_role=None,
    related_entity_id=None,
    related_entity_type=None,
    dedupe_key=None,
):
    """Create one durable notification unless the same active event exists."""
    if dedupe_key:
        existing = db.session.execute(text("""
            SELECT notification_id
            FROM notifications
            WHERE dedupe_key = :dedupe_key
            LIMIT 1
        """), {"dedupe_key": dedupe_key}).first()
        if existing:
            return existing.notification_id

    result = db.session.execute(text("""
        INSERT INTO notifications (
            student_id, tutor_id, recipient_role, sender_id, sender_role,
            title, message, notification_type, related_entity_id,
            related_entity_type, dedupe_key, status, created_at
        ) VALUES (
            :student_id, :tutor_id, :recipient_role, :sender_id, :sender_role,
            :title, :message, :notification_type, :related_entity_id,
            :related_entity_type, :dedupe_key, 'Unread', :created_at
        )
    """), {
        "student_id": student_id,
        "tutor_id": tutor_id,
        "recipient_role": recipient_role,
        "sender_id": sender_id,
        "sender_role": sender_role,
        "title": title,
        "message": message,
        "notification_type": notification_type,
        "related_entity_id": related_entity_id,
        "related_entity_type": related_entity_type,
        "dedupe_key": dedupe_key,
        "created_at": datetime.utcnow(),
    })
    return result.lastrowid


def create_student_notifications_for_course(course_id, **notification):
    student_ids = db.session.execute(text("""
        SELECT DISTINCT student_id
        FROM enrollments
        WHERE course_id = :course_id
        UNION
        SELECT DISTINCT student_id
        FROM attendance
        WHERE course_id = :course_id
    """), {"course_id": course_id}).scalars().all()
    for student_id in student_ids:
        recipient_dedupe_key = f"{notification['dedupe_key']}:{student_id}" if notification.get("dedupe_key") else None
        payload = dict(notification)
        payload.setdefault("related_entity_id", course_id)
        payload.setdefault("related_entity_type", "course")
        payload["dedupe_key"] = recipient_dedupe_key
        create_notification(student_id=student_id, recipient_role="student", **payload)
    return student_ids


def create_tutor_notification_for_course(course_id, **notification):
    tutor_id = db.session.execute(text(
        "SELECT tutor_id FROM courses WHERE course_id = :course_id"
    ), {"course_id": course_id}).scalar()
    if tutor_id:
        return create_notification(tutor_id=tutor_id, recipient_role="tutor", **notification)
    return None