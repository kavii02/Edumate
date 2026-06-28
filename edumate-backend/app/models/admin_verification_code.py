from datetime import datetime, timedelta
from app import db


class AdminVerificationCode(db.Model):
    __tablename__ = "admin_verification_codes"

    id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey("admins.admin_id"), nullable=False)
    code = db.Column(db.String(10), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False, nullable=False)

    admin = db.relationship("Admin", backref="verification_codes")

    def __init__(self, admin_id, code, expires_in_minutes=10):
        self.admin_id = admin_id
        self.code = code
        self.expires_at = datetime.utcnow() + timedelta(minutes=expires_in_minutes)
        self.used = False

    def is_expired(self):
        return datetime.utcnow() > self.expires_at

    def to_dict(self):
        return {
            "id": self.id,
            "admin_id": self.admin_id,
            "code": self.code,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "used": self.used,
        }