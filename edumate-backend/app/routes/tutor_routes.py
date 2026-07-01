from flask import Blueprint, request, jsonify
from sqlalchemy import text
from werkzeug.security import generate_password_hash, check_password_hash
from ..models import Tutor, Course, CourseMaterial, Quiz, QuizQuestion, QuizOwner
from ..utils.password_utils import validate_password
from .. import db


tutor_bp = Blueprint("tutor", __name__)


def _as_int(value, default=None):
    try:
        if value is None or value == "":
            return default
        return int(value)
    except (TypeError, ValueError):
        return default


def _build_question(question_data, order_index):
    question_text = (question_data.get("question_text") or question_data.get("question") or "").strip()
    if not question_text:
        raise ValueError(f"Question {order_index + 1} text is required")

    raw_options = question_data.get("options")
    if raw_options is None:
        raw_options = [
            question_data.get("option_a", ""),
            question_data.get("option_b", ""),
            question_data.get("option_c", ""),
            question_data.get("option_d", ""),
        ]

    options = [(option or "").strip() for option in raw_options]
    while len(options) < 4:
        options.append("")

    correct_answer = (question_data.get("correct_answer") or question_data.get("correctAnswer") or "").strip()
    if correct_answer.lower() in {"a", "b", "c", "d"}:
        correct_answer = correct_answer.lower()
    else:
        normalized_options = [option.lower() for option in options]
        normalized_answer = correct_answer.lower()
        if normalized_answer in normalized_options:
            correct_answer = "abcd"[normalized_options.index(normalized_answer)]
        elif normalized_answer in {"1", "2", "3", "4"}:
            correct_answer = "abcd"[int(normalized_answer) - 1]
        else:
            correct_answer = "a"

    return QuizQuestion(
        question_text=question_text,
        option1=options[0] or None,
        option2=options[1] or None,
        option3=options[2] or None,
        option4=options[3] or None,
        correct_answer=correct_answer or None,
    )


@tutor_bp.route("/profile/<int:tutor_id>", methods=["GET"])
def get_profile(tutor_id):
    tutor = Tutor.query.get(tutor_id)
    if not tutor:
        return jsonify({"success": False, "message": "Tutor not found"}), 404
    return jsonify({"success": True, "tutor": tutor.to_dict()}), 200


@tutor_bp.route("/profile/<int:tutor_id>", methods=["PUT"])
def update_profile(tutor_id):
    tutor = Tutor.query.get(tutor_id)
    if not tutor:
        return jsonify({"success": False, "message": "Tutor not found"}), 404

    data = request.get_json() or {}

    if "full_name" in data:
        parts = data["full_name"].strip().split(None, 1)
        tutor.first_name = parts[0] if parts else ""
        tutor.last_name = parts[1] if len(parts) > 1 else ""
    if "qualification" in data:
        tutor.specialization = data["qualification"]
    if "specialization" in data:
        tutor.specialization = data["specialization"]
    if "phone" in data:
        tutor.phone = data["phone"]
    if "teaching_area" in data:
        tutor.teaching_area = data["teaching_area"]
    if "about" in data:
        tutor.about = data["about"]
    if "avatar_url" in data:
        tutor.avatar_url = data["avatar_url"]
    if "cover_url" in data:
        tutor.cover_url = data["cover_url"]

    db.session.commit()
    return jsonify({"success": True, "message": "Profile updated successfully", "tutor": tutor.to_dict()}), 200


@tutor_bp.route("/change-password/<int:tutor_id>", methods=["POST"])
def change_password(tutor_id):
    tutor = Tutor.query.get(tutor_id)
    if not tutor:
        return jsonify({"success": False, "message": "Tutor not found"}), 404

    data = request.get_json() or {}
    old_password = data.get("old_password", "")
    new_password = data.get("new_password", "")

    if not check_password_hash(tutor.password, old_password) and tutor.password != old_password:
        return jsonify({"success": False, "message": "Old password is incorrect"}), 401

    is_valid, message = validate_password(new_password)
    if not is_valid:
        return jsonify({"success": False, "message": message}), 400

    tutor.password = generate_password_hash(new_password)
    db.session.commit()
    return jsonify({"success": True, "message": "Password changed successfully"}), 200


@tutor_bp.route("/dashboard/<int:tutor_id>", methods=["GET"])
def get_dashboard(tutor_id):
    tutor = Tutor.query.get(tutor_id)
    if not tutor:
        return jsonify({"success": False, "message": "Tutor not found"}), 404

    total_courses = db.session.execute(text("SELECT COUNT(*) FROM courses WHERE tutor_id = :tutor_id"), {"tutor_id": tutor_id}).scalar() or 0
    total_students = db.session.execute(text("SELECT COUNT(*) FROM students")).scalar() or 0
    total_quizzes = db.session.execute(text("SELECT COUNT(*) FROM quiz_owners WHERE tutor_id = :tutor_id"), {"tutor_id": tutor_id}).scalar() or 0
    total_assignments = db.session.execute(text("""
        SELECT COUNT(*)
        FROM course_materials m
        INNER JOIN courses c ON c.course_id = m.course_id
        WHERE c.tutor_id = :tutor_id
    """), {"tutor_id": tutor_id}).scalar() or 0

    return jsonify({
        "success": True,
        "dashboard": {
            "total_courses": total_courses,
            "total_students": total_students,
            "total_quizzes": total_quizzes,
            "total_assignments": total_assignments,
            "unread_queries": 0,
        },
    }), 200


@tutor_bp.route("/quizzes/<int:tutor_id>", methods=["GET"])
def get_quizzes(tutor_id):
    quiz_ids = [row[0] for row in db.session.execute(text("SELECT quiz_id FROM quiz_owners WHERE tutor_id = :tutor_id"), {"tutor_id": tutor_id}).all()]
    quizzes = Quiz.query.filter(Quiz.quiz_id.in_(quiz_ids)).all() if quiz_ids else []
    return jsonify({"success": True, "quizzes": [quiz.to_dict() for quiz in quizzes]}), 200


@tutor_bp.route("/quizzes", methods=["POST"])
def create_quiz():
    data = request.get_json() or {}
    tutor_id = _as_int(data.get("tutor_id"))
    course_id = _as_int(data.get("course_id") or data.get("courseId"))
    title = (data.get("title") or data.get("quizTitle") or "").strip()
    duration_minutes = _as_int(data.get("duration_minutes") or data.get("durationMinutes"), 30) or 30
    difficulty_level = (data.get("difficulty_level") or data.get("difficultyLevel") or "Easy").strip().title()
    is_published = bool(data.get("is_published") or data.get("isPublished") or False)
    questions_data = data.get("questions") or []

    if not title:
        return jsonify({"success": False, "message": "Quiz title is required"}), 400
    if not tutor_id:
        return jsonify({"success": False, "message": "Tutor ID is required"}), 400

    tutor = Tutor.query.get(tutor_id)
    if not tutor:
        return jsonify({"success": False, "message": "Tutor not found"}), 404
    if questions_data and not isinstance(questions_data, list):
        return jsonify({"success": False, "message": "Questions must be an array"}), 400

    quiz = Quiz(
        quiz_title=title,
        difficulty_level=difficulty_level if difficulty_level in {"Easy", "Medium", "Hard"} else "Easy",
        duration_minutes=duration_minutes,
        status="Active" if is_published else "Inactive",
    )
    db.session.add(quiz)
    db.session.flush()

    if course_id is not None:
        quiz.course_id = course_id

    db.session.add(QuizOwner(quiz_id=quiz.quiz_id, tutor_id=tutor_id))

    created_questions = []
    for index, question_data in enumerate(questions_data):
        if not isinstance(question_data, dict):
            db.session.rollback()
            return jsonify({"success": False, "message": f"Question {index + 1} must be an object"}), 400
        try:
            question = _build_question(question_data, index)
        except ValueError as exc:
            db.session.rollback()
            return jsonify({"success": False, "message": str(exc)}), 400
        question.quiz_id = quiz.quiz_id
        db.session.add(question)
        created_questions.append(question)

    db.session.commit()
    return jsonify({"success": True, "message": "Quiz created successfully", "quiz": quiz.to_dict()}), 201
