from .. import db
from datetime import datetime


class SkillMessage(db.Model):
    __tablename__ = "skill_messages"

    message_id = db.Column(db.Integer, primary_key=True)

    request_id = db.Column(db.Integer)

    sender_id = db.Column(db.Integer)

    receiver_id = db.Column(db.Integer)

    message = db.Column(db.Text)

    sent_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    def to_dict(self):
        return {
            "message_id": self.message_id,
            "request_id": self.request_id,
            "sender_id": self.sender_id,
            "receiver_id": self.receiver_id,
            "message": self.message,
            "sent_at": self.sent_at
        }