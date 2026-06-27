from .. import db
from datetime import datetime


class SkillRecommendation(db.Model):
    __tablename__ = "skill_recommendations"

    recommendation_id = db.Column(db.Integer, primary_key=True)

    student_id = db.Column(db.Integer)

    recommended_skill = db.Column(db.String(100))

    reason = db.Column(db.Text)

    score = db.Column(db.Float)

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    def to_dict(self):
        return {
            "recommendation_id": self.recommendation_id,
            "student_id": self.student_id,
            "recommended_skill": self.recommended_skill,
            "reason": self.reason,
            "score": self.score,
            "created_at": self.created_at
        }