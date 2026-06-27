from flask import Blueprint, request, jsonify
from sqlalchemy import text
from .. import db
from ..models.skill_message import SkillMessage

skill_message_bp = Blueprint("skillmessages", __name__)


@skill_message_bp.route("/send", methods=["POST"])
def send_message():
    data = request.get_json()

    msg = SkillMessage(
        request_id=data["request_id"],
        sender_id=data["sender_id"],
        receiver_id=data["receiver_id"],
        message=data["message"]
    )

    db.session.add(msg)
    db.session.commit()

    return jsonify({
        "message_id": msg.message_id,
        "request_id": msg.request_id,
        "sender_id": msg.sender_id,
        "receiver_id": msg.receiver_id,
        "message": msg.message,
        "sent_at": str(msg.sent_at)
    }), 201


@skill_message_bp.route("/<int:request_id>", methods=["GET"])
def get_messages(request_id):
    rows = db.session.execute(text("""
        SELECT
            sm.message_id,
            sm.request_id,
            sm.sender_id,
            sm.receiver_id,
            sm.message,
            sm.sent_at,
            CONCAT(s.first_name, ' ', s.last_name) AS sender_name
        FROM skill_messages sm
        JOIN students s ON sm.sender_id = s.student_id
        WHERE sm.request_id = :rid
        ORDER BY sm.sent_at ASC
    """), {"rid": request_id}).fetchall()

    return jsonify([{
        "message_id": r.message_id,
        "request_id": r.request_id,
        "sender_id": r.sender_id,
        "receiver_id": r.receiver_id,
        "message": r.message,
        "sent_at": str(r.sent_at),
        "sender_name": r.sender_name
    } for r in rows]), 200
