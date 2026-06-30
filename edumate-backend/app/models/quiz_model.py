from .. import db


class Quiz(db.Model):
    __tablename__ = "quizzes"

    quiz_id = db.Column(db.Integer, primary_key=True)
    quiz_title = db.Column(db.String(150), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.course_id'), nullable=False)
    difficulty_level = db.Column(db.Enum('Easy', 'Medium', 'Hard'), nullable=True)
    duration_minutes = db.Column(db.Integer, nullable=True)
    status = db.Column(db.Enum('Active', 'Inactive'), nullable=True)

    questions = db.relationship('QuizQuestion', backref='quiz', lazy=True, cascade='all, delete-orphan')
    tutor_questions = db.relationship('Question', back_populates='quiz', lazy=True, cascade='all, delete-orphan')
    results = db.relationship('QuizResult', backref='quiz', lazy=True, cascade='all, delete-orphan')

    @property
    def title(self):
        return self.quiz_title

    @title.setter
    def title(self, value):
        self.quiz_title = value

    @property
    def total_questions(self):
        return len(self.questions) if self.questions else 0

    @property
    def passing_score(self):
        return 50

    @property
    def is_published(self):
        return (self.status or "").lower() == "active"

    @is_published.setter
    def is_published(self, value):
        self.status = "Active" if value else "Inactive"

    def to_dict(self, include_questions=False, hide_answers=True, **kwargs):
        data = {
            "id": str(self.quiz_id),
            "quiz_id": self.quiz_id,
            "title": self.quiz_title,
            "quiz_title": self.quiz_title,
            "course_id": self.course_id,
            "courseId": str(self.course_id),
            "description": "",
            "difficulty_level": self.difficulty_level,
            "total_questions": self.total_questions,
            "duration_minutes": self.duration_minutes,
            "duration": f"{self.duration_minutes} mins" if self.duration_minutes else "10 mins",
            "status": self.status,
            "is_published": self.is_published,
            "passing_score": self.passing_score,
            "created_at": None,
        }
        if include_questions:
            if hide_answers:
                data["questions"] = [q.to_dict_hide_answer() for q in self.questions]
            else:
                data["questions"] = [q.to_dict() for q in self.questions]
        return data

    def __repr__(self):
        return f"<Quiz {self.title}>"


class QuizQuestion(db.Model):
    __tablename__ = "quiz_questions"

    question_id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.quiz_id'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    option1 = db.Column(db.String(255), nullable=False)
    option2 = db.Column(db.String(255), nullable=False)
    option3 = db.Column(db.String(255), nullable=False)
    option4 = db.Column(db.String(255), nullable=False)
    correct_answer = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())

    def to_dict(self):
        return {
            "question_id": self.question_id,
            "quiz_id": self.quiz_id,
            "question_text": self.question_text,
            "option1": self.option1,
            "option2": self.option2,
            "option3": self.option3,
            "option4": self.option4,
            "correct_answer": self.correct_answer
        }

    def to_dict_hide_answer(self):
        return {
            "question_id": self.question_id,
            "quiz_id": self.quiz_id,
            "question_text": self.question_text,
            "option1": self.option1,
            "option2": self.option2,
            "option3": self.option3,
            "option4": self.option4
        }

    def __repr__(self):
        return f"<QuizQuestion {self.question_id}>"


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

    quiz = db.relationship('Quiz', back_populates='tutor_questions')

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


class QuizOwner(db.Model):
    __tablename__ = "quiz_owners"

    quiz_id = db.Column(db.Integer, db.ForeignKey("quizzes.quiz_id"), primary_key=True)
    tutor_id = db.Column(db.Integer, db.ForeignKey("tutors.tutor_id"), nullable=False)
