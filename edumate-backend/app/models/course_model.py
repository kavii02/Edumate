from .. import db


class Tutor(db.Model):
    __tablename__ = "tutors"

    tutor_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=True)
    last_name = db.Column(db.String(50), nullable=True)
    email = db.Column(db.String(100), unique=True, nullable=True)
    password = db.Column(db.String(255), nullable=True)
    specialization = db.Column(db.String(100), nullable=True)
    avatar_url = db.Column(db.String(500), nullable=True)
    cover_url = db.Column(db.String(500), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    teaching_area = db.Column(db.String(200), nullable=True)
    about = db.Column(db.Text, nullable=True)

    courses = db.relationship("Course", back_populates="tutor", cascade="all, delete-orphan")
    availability = db.relationship("Availability", back_populates="tutor", cascade="all, delete-orphan")

    @property
    def name(self):
        parts = []
        if self.first_name:
            parts.append(self.first_name)
        if self.last_name:
            parts.append(self.last_name)
        return " ".join(parts) if parts else "Unknown Tutor"

    @property
    def full_name(self):
        return self.name

    def to_dict(self):
        return {
            "tutor_id": self.tutor_id,
            "full_name": self.full_name,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "qualification": self.specialization,
            "specialization": self.specialization,
            "avatar_url": self.avatar_url,
            "cover_url": self.cover_url,
            "phone": self.phone,
            "teaching_area": self.teaching_area,
            "about": self.about,
        }


class Availability(db.Model):
    __tablename__ = "availabilities"

    availability_id = db.Column(db.Integer, primary_key=True)
    tutor_id = db.Column(db.Integer, db.ForeignKey("tutors.tutor_id"), nullable=False)
    day_of_week = db.Column(db.String(20), nullable=False)
    start_time = db.Column(db.String(10), nullable=False)
    end_time = db.Column(db.String(10), nullable=False)

    tutor = db.relationship("Tutor", back_populates="availability")

    def to_dict(self):
        return {
            "availability_id": self.availability_id,
            "tutor_id": self.tutor_id,
            "day_of_week": self.day_of_week,
            "start_time": self.start_time,
            "end_time": self.end_time,
        }


class Course(db.Model):
    __tablename__ = "courses"

    course_id = db.Column(db.Integer, primary_key=True)
    course_title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    tutor_id = db.Column(db.Integer, db.ForeignKey('tutors.tutor_id'), nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.now())
    status = db.Column(db.String(20), nullable=True, default='Pending')
    submitted_at = db.Column(db.DateTime, nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    category = db.Column(db.String(50), nullable=True, default='General')
    level = db.Column(db.String(50), nullable=True, default='Beginner')

    tutor = db.relationship('Tutor', back_populates='courses')
    materials = db.relationship('CourseMaterial', back_populates='course', cascade='all, delete-orphan')
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
            "image_url": self.image_url,
            "category": self.category,
            "level": self.level,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "submitted_at": self.submitted_at.isoformat() if self.submitted_at else None,
        }

    def __repr__(self):
        return f"<Course {self.title}>"
