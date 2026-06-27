from datetime import datetime

from app import db

MATERIAL_TYPE_TO_DB = {
    "pdf": "PDF",
    "video": "Video",
    "note": "Note",
    "document": "Note",
}


def normalize_material_type(value):
    if not value:
        return "PDF"
    key = value.strip().lower()
    if key in MATERIAL_TYPE_TO_DB:
        return MATERIAL_TYPE_TO_DB[key]
    if value in ("PDF", "Video", "Note"):
        return value
    return "PDF"


class Tutor(db.Model):
    __tablename__ = "tutors"

    tutor_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=True)
    last_name = db.Column(db.String(50), nullable=True)
    email = db.Column(db.String(100), unique=True, nullable=True)
    password = db.Column(db.String(255), nullable=True)
    specialization = db.Column(db.String(100), nullable=True)

    courses = db.relationship("Course", back_populates="tutor", cascade="all, delete-orphan")
    availability = db.relationship("Availability", back_populates="tutor", cascade="all, delete-orphan")

    @property
    def full_name(self):
        parts = [self.first_name or "", self.last_name or ""]
        return " ".join(part for part in parts if part).strip()

    def to_dict(self):
        return {
            "tutor_id": self.tutor_id,
            "full_name": self.full_name,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "qualification": self.specialization,
            "specialization": self.specialization,
        }

    def to_dict_public(self):
        return self.to_dict()


class Course(db.Model):
    __tablename__ = "courses"

    course_id = db.Column(db.Integer, primary_key=True)
    tutor_id = db.Column(db.Integer, db.ForeignKey("tutors.tutor_id"), nullable=True)
    course_title = db.Column(db.String(150), nullable=True)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    tutor = db.relationship("Tutor", back_populates="courses")
    materials = db.relationship("CourseMaterial", back_populates="course", cascade="all, delete-orphan")

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
        return len(self.materials)

    @property
    def thumbnail(self):
        return None

    @thumbnail.setter
    def thumbnail(self, value):
        return None

    @property
    def status(self):
        return "Active"

    @status.setter
    def status(self, value):
        return None

    def to_dict(self):
        return {
            "course_id": self.course_id,
            "tutor_id": self.tutor_id,
            "title": self.course_title,
            "course_name": self.course_title,
            "description": self.description,
            "image_url": None,
            "thumbnail": None,
            "status": self.status,
            "lesson_count": self.lesson_count,
            "category": "General",
            "level": "Beginner",
            "student_count": 0,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class CourseMaterial(db.Model):
    __tablename__ = "tutor_course_materials"

    material_id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.course_id"), nullable=True)
    material_title = db.Column(db.String(100), nullable=True)
    material_type = db.Column(db.Enum("PDF", "Video", "Note", name="tutor_material_type"), nullable=True)
    file_path = db.Column(db.String(255), nullable=True)

    course = db.relationship("Course", back_populates="materials")

    def to_dict(self):
        material_type = (self.material_type or "PDF").lower()
        return {
            "material_id": self.material_id,
            "course_id": self.course_id,
            "title": self.material_title,
            "material_title": self.material_title,
            "material_type": material_type,
            "file_url": self.file_path,
            "file_path": self.file_path,
            "description": "",
        }


class Quiz(db.Model):
    __tablename__ = "quizzes"

    quiz_id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, nullable=True)
    quiz_title = db.Column(db.String(150), nullable=True)
    difficulty_level = db.Column(db.Enum("Easy", "Medium", "Hard", name="quiz_difficulty_level"), nullable=True)
    duration_minutes = db.Column(db.Integer, default=30)
    status = db.Column(db.Enum("Active", "Inactive", name="quiz_status"), default="Inactive")
    
    questions = db.relationship("Question", back_populates="quiz", cascade="all, delete-orphan")

    @property
    def title(self):
        return self.quiz_title

    @title.setter
    def title(self, value):
        self.quiz_title = value

    @property
    def description(self):
        return ""

    @property
    def total_questions(self):
        return len(self.questions)

    @property
    def passing_score(self):
        return 50

    @property
    def is_published(self):
        return (self.status or "").lower() == "active"

    @is_published.setter
    def is_published(self, value):
        self.status = "Active" if value else "Inactive"

    @property
    def created_at(self):
        return None

    @property
    def updated_at(self):
        return None

    def to_dict(self):
        return {
            "quiz_id": self.quiz_id,
            "course_id": self.course_id,
            "title": self.quiz_title,
            "quiz_title": self.quiz_title,
            "description": "",
            "difficulty_level": self.difficulty_level,
            "total_questions": self.total_questions,
            "duration_minutes": self.duration_minutes,
            "passing_score": self.passing_score,
            "status": self.status,
            "is_published": self.is_published,
            "created_at": None,
        }

class QuizOwner(db.Model):
    __tablename__ = "quiz_owners"

    quiz_id = db.Column(db.Integer, db.ForeignKey("quizzes.quiz_id"), primary_key=True)
    tutor_id = db.Column(db.Integer, db.ForeignKey("tutors.tutor_id"), nullable=False)


class Question(db.Model):
    __tablename__ = "questions"

    question_id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.quiz_id'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    option_a = db.Column(db.String(255), nullable=True)
    option_b = db.Column(db.String(255), nullable=True)
    option_c = db.Column(db.String(255), nullable=True)
    option_d = db.Column(db.String(255), nullable=True)
    correct_answer = db.Column(db.String(1), nullable=True)

    quiz = db.relationship('Quiz', back_populates='questions')

    @property
    def question_type(self):
        return "mcq"

    @property
    def marks(self):
        return 1

    @property
    def order(self):
        return self.question_id or 0

    def to_dict(self):
        return {
            "question_id": self.question_id,
            "quiz_id": self.quiz_id,
            "question_text": self.question_text,
            "option_a": self.option_a,
            "option_b": self.option_b,
            "option_c": self.option_c,
            "option_d": self.option_d,
            "correct_answer": self.correct_answer,
            "question_type": self.question_type,
            "marks": self.marks,
            "order": self.order,
        }


class Availability(db.Model):
    __tablename__ = "availabilities"

    availability_id = db.Column(db.Integer, primary_key=True)
    tutor_id = db.Column(db.Integer, db.ForeignKey('tutors.tutor_id'), nullable=False)
    day_of_week = db.Column(db.String(20), nullable=False)  # 'monday', 'tuesday', etc.
    start_time = db.Column(db.String(10), nullable=False)  # '09:00'
    end_time = db.Column(db.String(10), nullable=False)  # '17:00'
    
    # Relationships
    tutor = db.relationship('Tutor', back_populates='availability')

    def to_dict(self):
        return {
            "availability_id": self.availability_id,
            "tutor_id": self.tutor_id,
            "day_of_week": self.day_of_week,
            "start_time": self.start_time,
            "end_time": self.end_time
        }
