from .. import db

class Skill(db.Model):
    __tablename__ = "skills"

    skill_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer)

    skill_name = db.Column(db.String(100))
    category = db.Column(db.String(150))
    skill_level = db.Column(db.String(50))
    description = db.Column(db.String(150))

    def to_dict(self):

        student_name = "Unknown"

        from app.student.models.student_model import Student

        student = Student.query.get(self.student_id)

        if student:
            student_name = f"{student.first_name} {student.last_name}"

        return {
            "id": self.skill_id,
            "student_id": self.student_id,
            "student_name": student_name,
            "skill": self.skill_name,
            "name": self.skill_name,
            "category": self.category,
            "level": self.skill_level,
            "description": self.description,
            "desc": self.description
        }