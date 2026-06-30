from flask import Blueprint, jsonify, request

from ..models import Quiz


quiz_bp = Blueprint("quiz_public", __name__)


def _serialize_public_quiz(quiz):
    return {
        "quiz_id": quiz.quiz_id,
        "course_id": quiz.course_id,
        "title": quiz.title,
        "description": quiz.description,
        "difficulty_level": quiz.difficulty_level,
        "total_questions": quiz.total_questions,
        "duration_minutes": quiz.duration_minutes,
        "passing_score": quiz.passing_score,
        "is_published": quiz.is_published,
        "questions": [
            {
                **question.to_dict(),
                "correct_answer": None,
            }
            for question in sorted(quiz.tutor_questions, key=lambda item: item.order)
        ],
    }


@quiz_bp.route("", methods=["GET"])
@quiz_bp.route("/", methods=["GET"])
def get_published_quizzes():
    """List quizzes that are available to students."""
    course_id = request.args.get("course_id", type=int)

    query = Quiz.query.filter_by(status="Active")

    if course_id:
        query = query.filter_by(course_id=course_id)

    quizzes = query.order_by(Quiz.quiz_id.desc()).all()

    return jsonify({
        "success": True,
        "quizzes": [_serialize_public_quiz(quiz) for quiz in quizzes],
    }), 200


@quiz_bp.route("/<int:quiz_id>", methods=["GET"])
def get_published_quiz(quiz_id):
    """Get a single published quiz for student viewing."""
    quiz = Quiz.query.get(quiz_id)

    if not quiz or not quiz.is_published:
        return jsonify({"success": False, "message": "Quiz not found"}), 404

    return jsonify({
        "success": True,
        "quiz": _serialize_public_quiz(quiz),
    }), 200