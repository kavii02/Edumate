from app import db


class QuizResult(db.Model):
    __tablename__ = "quiz_results"

    result_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.student_id'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.quiz_id'), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    total_questions = db.Column(db.Integer, nullable=False, default=0)
    percentage = db.Column(db.Float, nullable=False, default=0.0)
    feedback = db.Column(db.Text, nullable=True)
    attempted_at = db.Column(db.DateTime, default=db.func.now())

    def to_dict(self):
        return {
            "result_id": self.result_id,
            "student_id": self.student_id,
            "quiz_id": self.quiz_id,
            "quizId": str(self.quiz_id),
            "quiz_title": self.quiz.title if self.quiz else None,
            "quizTitle": self.quiz.title if self.quiz else None,
            "course_id": self.quiz.course_id if self.quiz else None,
            "courseId": str(self.quiz.course_id) if self.quiz else None,
            "score": self.score,
            "total_questions": self.total_questions,
            "totalCount": self.total_questions,
            "correctCount": self.score,
            "percentage": self.percentage,
            "feedback": self.feedback,
            "attempted_at": self.attempted_at.isoformat() if self.attempted_at else None,
            "date": self.attempted_at.strftime("%Y-%m-%d") if self.attempted_at else None,
            "pointsAwarded": self.score * 50
        }

    def __repr__(self):
        return f"<QuizResult student_id={self.student_id} quiz_id={self.quiz_id} score={self.score}>"
