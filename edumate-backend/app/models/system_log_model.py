from datetime import datetime
from .. import db


class SystemLog(db.Model):
    __tablename__ = 'system_logs'

    log_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    level = db.Column(db.String(50), nullable=False, default='INFO')  # INFO, WARNING, ERROR, CRITICAL
    user_email = db.Column(db.String(255), nullable=True)  # The user performing the action
    user_name = db.Column(db.String(255), nullable=True)  # Full name of the user
    user_role = db.Column(db.String(50), nullable=True)  # Admin, Student, Tutor, System
    action = db.Column(db.String(255), nullable=False)  # Description of the action
    module = db.Column(db.String(100), nullable=True)  # Which module (Auth, Course, Skill, etc.)
    ip_address = db.Column(db.String(45), nullable=True)
    additional_data = db.Column(db.JSON, nullable=True)  # Extra details in JSON format
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return f'<SystemLog {self.log_id}: {self.level} - {self.action}>'

    def to_dict(self):
        return {
            'id': self.log_id,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'level': self.level,
            'user_email': self.user_email,
            'user_name': self.user_name,
            'user_role': self.user_role,
            'action': self.action,
            'module': self.module,
            'ip_address': self.ip_address,
            'additional_data': self.additional_data,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
