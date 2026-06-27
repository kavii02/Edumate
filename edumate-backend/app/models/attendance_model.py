from .. import db


class AttendanceRecord(db.Model):
    __tablename__ = "attendance_records"

    attendance_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.student_id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.course_id'), nullable=False)
    session_name = db.Column(db.String(200), nullable=True)
    session_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default='present')  # present, late, absent
    marked_by = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.now())

    student = db.relationship('Student', backref=db.backref('attendance_records', lazy=True))
    course = db.relationship('Course', backref=db.backref('attendance_records', lazy=True))

    def to_dict(self):
        return {
            "attendance_id": self.attendance_id,
            "student_id": self.student_id,
            "course_id": self.course_id,
            "session_name": self.session_name,
            "session_date": self.session_date.isoformat() if self.session_date else None,
            "status": self.status,
            "marked_by": self.marked_by,
            "course_title": self.course.title if self.course else None
        }

    def __repr__(self):
        return f"<AttendanceRecord student={self.student_id} course={self.course_id} date={self.session_date}>"
