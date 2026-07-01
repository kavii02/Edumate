from .. import db


class CourseMaterial(db.Model):
    __tablename__ = "course_materials"

    material_id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.course_id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    material_type = db.Column(db.String(20), nullable=False, default='pdf')  # pdf, video, doc, link
    url = db.Column(db.String(500), nullable=True)
    file_size = db.Column(db.String(50), nullable=True)
    description = db.Column(db.Text, nullable=True)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('tutors.tutor_id'), nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.now())

    course = db.relationship('Course', back_populates='materials')

    def to_dict(self):
        return {
            "material_id": self.material_id,
            "course_id": self.course_id,
            "title": self.title,
            "type": self.material_type,
            "url": self.url,
            "size": self.file_size,
            "description": self.description,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f"<CourseMaterial {self.title} ({self.material_type})>"
