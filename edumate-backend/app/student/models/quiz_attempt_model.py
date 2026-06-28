from app import db


class QuizAttempt(db.Model):
    __tablename__ = "quiz_attempts"

    attempt_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.student_id'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.quiz_id'), nullable=False)
    score = db.Column(db.Float, nullable=False)
    attempt_date = db.Column(db.DateTime, default=db.func.now())

    student = db.relationship('Student', backref='quiz_attempts', lazy=True)
    quiz = db.relationship('Quiz', backref='attempts', lazy=True)

    def to_dict(self):
        return {
            "attempt_id": self.attempt_id,
            "student_id": self.student_id,
            "quiz_id": self.quiz_id,
            "score": self.score,
            "attempt_date": self.attempt_date.isoformat() if self.attempt_date else None,
            "quiz_title": self.quiz.title if self.quiz else None,
            "course_id": self.quiz.course_id if self.quiz else None
        }

    def __repr__(self):
        return f"<QuizAttempt student_id={self.student_id} quiz_id={self.quiz_id} score={self.score}>"
