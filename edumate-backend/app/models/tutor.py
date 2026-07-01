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
    avatar_url = db.Column(db.String(500), nullable=True)
    cover_url = db.Column(db.String(500), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    teaching_area = db.Column(db.String(200), nullable=True)
    about = db.Column(db.Text, nullable=True)

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
            "avatar_url": self.avatar_url,
            "cover_url": self.cover_url,
            "phone": self.phone,
            "teaching_area": self.teaching_area,
            "about": self.about,
        }

    def to_dict_public(self):
        return self.to_dict()


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
