from datetime import datetime

from .. import db


class LessonFeedback(db.Model):
    __tablename__ = "lesson_feedback"

    feedback_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("students.student_id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.course_id"), nullable=False)
    lesson_id = db.Column(db.Integer, nullable=True)
    feedback_level = db.Column(db.String(30), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "feedback_id": self.feedback_id,
            "student_id": self.student_id,
            "course_id": self.course_id,
            "lesson_id": self.lesson_id,
            "feedback_level": self.feedback_level,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
