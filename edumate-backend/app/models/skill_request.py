from .. import db
from datetime import datetime


class SkillRequest(db.Model):
    __tablename__ = "skill_requests"

    request_id = db.Column(db.Integer, primary_key=True)

    requester_student_id = db.Column(db.Integer, nullable=False)

    provider_student_id = db.Column(db.Integer, nullable=False)

    skill_id = db.Column(db.Integer, nullable=False)

    status = db.Column(
        db.Enum("Pending", "Accepted", "Rejected"),
        default="Pending"
    )

    request_date = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    def to_dict(self):
        return {
            "request_id": self.request_id,
            "requester_student_id": self.requester_student_id,
            "provider_student_id": self.provider_student_id,
            "skill_id": self.skill_id,
            "status": self.status,
            "request_date": self.request_date
        }