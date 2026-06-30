from app import db
from werkzeug.security import generate_password_hash, check_password_hash


class Student(db.Model):
    __tablename__ = "students"

    student_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())
    is_verified = db.Column(db.Boolean, nullable=False, default=False)
    verification_token = db.Column(db.String(100), nullable=True)
    verification_expiry = db.Column(db.DateTime, nullable=True)
    school_name = db.Column(db.String(200), nullable=True)
    al_stream = db.Column(db.String(50), nullable=True)
    grade_level = db.Column(db.String(50), nullable=True)
    rating = db.Column(db.Float, default=0.0)

    @property
    def name(self):
        parts = []
        if self.first_name:
            parts.append(self.first_name)
        if self.last_name:
            parts.append(self.last_name)
        return " ".join(parts) if parts else ""

    @name.setter
    def name(self, value):
        if not value:
            self.first_name = ""
            self.last_name = ""
            return
        parts = value.split(" ", 1)
        self.first_name = parts[0]
        self.last_name = parts[1] if len(parts) > 1 else ""

    enrollments = db.relationship('Enrollment', backref='student', lazy=True, cascade='all, delete-orphan')
    quiz_results = db.relationship('QuizResult', backref='student', lazy=True, cascade='all, delete-orphan')
    study_plans = db.relationship('StudyPlanner', backref='student', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        try:
            return check_password_hash(self.password, password)
        except Exception:
            return self.password == password

    def to_dict(self):
        return {
            "student_id": self.student_id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "school_name": self.school_name,
            "al_stream": self.al_stream,
            "grade_level": self.grade_level,
            "rating": self.rating,
            "is_verified": self.is_verified,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f"<Student {self.first_name} {self.last_name} ({self.email})>"


class PendingStudent(db.Model):
    __tablename__ = "pending_students"

    pending_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())
    verification_token = db.Column(db.String(100), nullable=False)
    verification_expiry = db.Column(db.DateTime, nullable=False)
    school_name = db.Column(db.String(200), nullable=True)
    al_stream = db.Column(db.String(50), nullable=True)
    grade_level = db.Column(db.String(50), nullable=True)

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def __repr__(self):
        return f"<PendingStudent {self.first_name} {self.last_name} ({self.email})>"
