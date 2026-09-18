from .. import db


class Enrollment(db.Model):
    __tablename__ = "enrollments"

    enrollment_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.student_id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.course_id'), nullable=False)
    enroll_date = db.Column(db.Date, nullable=True, default=db.func.current_date())

    __table_args__ = (
        db.UniqueConstraint('student_id', 'course_id', name='unique_student_course'),
    )

    @property
    def enrolled_at(self):
        return self.enroll_date

    @enrolled_at.setter
    def enrolled_at(self, value):
        self.enroll_date = value

    def to_dict(self):
        return {
            "enrollment_id": self.enrollment_id,
            "student_id": self.student_id,
            "course_id": self.course_id,
            "enrolled_at": self.enroll_date.isoformat() if self.enroll_date else None,
            "course": self.course.to_dict() if self.course else None
        }

    def __repr__(self):
        return f"<Enrollment student_id={self.student_id} course_id={self.course_id}>"
