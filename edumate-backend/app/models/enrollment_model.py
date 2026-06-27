from .. import db


class Enrollment(db.Model):
    __tablename__ = "enrollments"

    enrollment_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.student_id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.course_id'), nullable=False)
    enrolled_at = db.Column(db.DateTime, default=db.func.now())

    __table_args__ = (
        db.UniqueConstraint('student_id', 'course_id', name='unique_student_course'),
    )

    def to_dict(self):
        return {
            "enrollment_id": self.enrollment_id,
            "student_id": self.student_id,
            "course_id": self.course_id,
            "enrolled_at": self.enrolled_at.isoformat() if self.enrolled_at else None,
            "course": self.course.to_dict() if self.course else None
        }

    def __repr__(self):
        return f"<Enrollment student_id={self.student_id} course_id={self.course_id}>"
