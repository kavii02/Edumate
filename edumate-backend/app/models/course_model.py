from .. import db


class Course(db.Model):
    __tablename__ = "courses"

    course_id = db.Column(db.Integer, primary_key=True)
    course_title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    tutor_id = db.Column(db.Integer, db.ForeignKey('tutors.tutor_id'), nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.now())
    status = db.Column(db.String(20), nullable=True, default='Pending')
    submitted_at = db.Column(db.DateTime, nullable=True)

    tutor = db.relationship('Tutor', back_populates='courses')
    enrollments = db.relationship('Enrollment', backref='course', lazy=True, cascade='all, delete-orphan')
    quizzes = db.relationship('Quiz', backref='course', lazy=True, cascade='all, delete-orphan')

    @property
    def title(self):
        return self.course_title

    @title.setter
    def title(self, value):
        self.course_title = value

    @property
    def course_name(self):
        return self.course_title

    @course_name.setter
    def course_name(self, value):
        self.course_title = value

    @property
    def lesson_count(self):
        return len(self.materials) if self.materials else 0

    @property
    def thumbnail(self):
        return None

    @thumbnail.setter
    def thumbnail(self, value):
        return None

    @property
    def instructor(self):
        return self.tutor.full_name if self.tutor else "Unknown Tutor"

    def to_dict(self):
        return {
            "course_id": self.course_id,
            "tutor_id": self.tutor_id,
            "title": self.course_title,
            "course_title": self.course_title,
            "course_name": self.course_title,
            "description": self.description,
            "instructor": self.instructor,
            "status": self.status,
            "lesson_count": self.lesson_count,
            "image_url": None,
            "thumbnail": None,
            "category": "General",
            "level": "Beginner",
            "student_count": len(self.enrollments) if self.enrollments else 0,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "submitted_at": self.submitted_at.isoformat() if self.submitted_at else None
        }

    def __repr__(self):
        return f"<Course {self.title}>"
