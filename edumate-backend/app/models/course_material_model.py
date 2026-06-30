from .. import db


class CourseMaterial(db.Model):
    __tablename__ = "course_materials"

    material_id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.course_id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    material_type = db.Column(db.String(20), nullable=False, default='pdf')  # pdf, video, doc, link
    url = db.Column(db.String(500), nullable=True)
    file_path = db.Column(db.String(255), nullable=True)
    file_size = db.Column(db.String(50), nullable=True)
    description = db.Column(db.Text, nullable=True)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('tutors.tutor_id'), nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.now())

    course = db.relationship('Course', backref=db.backref('materials', lazy=True))

    @property
    def material_title(self):
        return self.title

    @material_title.setter
    def material_title(self, value):
        self.title = value

    def to_dict(self):
        material_type_lower = (self.material_type or "pdf").lower()
        return {
            "material_id": self.material_id,
            "course_id": self.course_id,
            "title": self.title,
            "material_title": self.title,
            "material_type": material_type_lower,
            "type": material_type_lower,
            "url": self.url or self.file_path,
            "file_url": self.url or self.file_path,
            "file_path": self.file_path or self.url,
            "size": self.file_size,
            "description": self.description,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f"<CourseMaterial {self.title} ({self.material_type})>"
