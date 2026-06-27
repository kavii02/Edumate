from .. import db


class StudyPlanner(db.Model):
    __tablename__ = "study_planners"

    planner_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.student_id'), nullable=False)
    task_name = db.Column(db.String(255), nullable=False)
    task_type = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=True)
    scheduled_date = db.Column(db.Date, nullable=False)
    is_completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=db.func.now())
    completed_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "planner_id": self.planner_id,
            "student_id": self.student_id,
            "task_name": self.task_name,
            "task_type": self.task_type,
            "description": self.description,
            "scheduled_date": self.scheduled_date.isoformat() if self.scheduled_date else None,
            "is_completed": self.is_completed,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }

    def __repr__(self):
        return f"<StudyPlanner {self.task_name}>"
