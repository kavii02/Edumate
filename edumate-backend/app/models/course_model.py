from .. import db


class Tutor(db.Model):
    __tablename__ = "tutors"

    tutor_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=True)
    last_name = db.Column(db.String(50), nullable=True)
    email = db.Column(db.String(100), unique=True, nullable=True)
    password = db.Column(db.String(255), nullable=True)
    specialization = db.Column(db.String(100), nullable=True)

    @property
    def name(self):
        parts = []
        if self.first_name:
            parts.append(self.first_name)
        if self.last_name:
            parts.append(self.last_name)
        return " ".join(parts) if parts else "Unknown Tutor"


class Course(db.Model):
    __tablename__ = "courses"

    course_id = db.Column(db.Integer, primary_key=True)
    course_title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    tutor_id = db.Column(db.Integer, db.ForeignKey('tutors.tutor_id'), nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.now())
    status = db.Column(db.String(20), nullable=True, default='Pending')
    submitted_at = db.Column(db.DateTime, nullable=True)

    tutor = db.relationship('Tutor', backref=db.backref('courses_rel', lazy=True))
    enrollments = db.relationship('Enrollment', backref='course', lazy=True, cascade='all, delete-orphan')
    quizzes = db.relationship('Quiz', backref='course', lazy=True, cascade='all, delete-orphan')

    @property
    def title(self):
        return self.course_title

    @title.setter
    def title(self, value):
        self.course_title = value

    @property
    def instructor(self):
        return self.tutor.name if self.tutor else "Unknown Tutor"

    def to_dict(self):
        return {
            "course_id": self.course_id,
            "title": self.title,
            "course_title": self.course_title,
            "description": self.description,
            "instructor": self.instructor,
            "tutor_id": self.tutor_id,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "submitted_at": self.submitted_at.isoformat() if self.submitted_at else None
        }

    def __repr__(self):
        return f"<Course {self.title}>"
