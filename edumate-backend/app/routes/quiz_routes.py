import os
from datetime import datetime
from flask import Blueprint, jsonify, request, current_app
from werkzeug.utils import secure_filename

from .. import db
from ..models import Quiz, Question, CourseMaterial, QuizOwner
from ..services.pdf_service import extract_text_from_pdf
from ..services.ai_quiz_service import generate_quiz_with_ai

quiz_bp = Blueprint("quiz_public", __name__)
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '../../uploads')


def _serialize_public_quiz(quiz):
    questions = Question.query.filter_by(
        quiz_id=quiz.quiz_id
    ).order_by(
        Question.question_id.asc()
    ).all()

    return {
        "quiz_id": quiz.quiz_id,
        "course_id": quiz.course_id,
        "quiz_title": quiz.quiz_title,
        "difficulty_level": quiz.difficulty_level,
        "duration_minutes": quiz.duration_minutes,
        "status": quiz.status,
        "questions": [
            {
                "question_id": question.question_id,
                "quiz_id": question.quiz_id,
                "question_text": question.question_text,
                "option_a": question.option_a,
                "option_b": question.option_b,
                "option_c": question.option_c,
                "option_d": question.option_d,
                "correct_answer": None,
            }
            for question in questions
        ],
    }


def _get_pdf_full_path(material):
    """
    Change material.file_path if your course material table uses another field name.
    Example: material.file_url, material.file_name, material.material_path
    """

    if not hasattr(material, "file_path") or not material.file_path:
        raise ValueError("PDF file path not found in course material.")

    file_path = material.file_path

    if os.path.isabs(file_path):
        return file_path

    file_path = file_path.lstrip("/\\")

    return os.path.abspath(
        os.path.join(current_app.root_path, "..", file_path)
    )


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

    if not quiz or quiz.status != "Active":
        return jsonify({
            "success": False,
            "message": "Quiz not found"
        }), 404

    return jsonify({
        "success": True,
        "quiz": _serialize_public_quiz(quiz),
    }), 200


@quiz_bp.route("/generate-from-pdf", methods=["POST"])
def generate_quiz_from_pdf():
    """
    On-the-fly PDF parsing and AI quiz generation.
    Returns generated questions directly to tutor for review.
    """
    try:
        if "file" not in request.files:
            return jsonify({"success": False, "message": "No PDF file provided"}), 400
            
        file = request.files["file"]
        if file.filename == "":
            return jsonify({"success": False, "message": "No file selected"}), 400
            
        # pyrefly: ignore [missing-attribute]
        if not file.filename.lower().endswith(".pdf"):
            return jsonify({"success": False, "message": "Only PDF files are allowed"}), 400
            
        # Ensure uploads directory exists
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        # pyrefly: ignore [bad-argument-type]
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_")
        filename = timestamp + filename
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        file.save(filepath)
        
        # Extract text
        lesson_text = extract_text_from_pdf(filepath)
        
        # Clean up file immediately
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
        except Exception:
            pass
            
        if not lesson_text or len(lesson_text.strip()) < 100:
            return jsonify({
                "success": False,
                "message": "Not enough readable text found in the PDF. Please upload a PDF with selectable text."
            }), 400
            
        number_of_questions = int(request.form.get("number_of_questions", 10))
        difficulty = request.form.get("difficulty", "Medium")
        
        generated = generate_quiz_with_ai(
            lesson_text=lesson_text,
            number_of_questions=number_of_questions,
            difficulty=difficulty
        )
        
        return jsonify({
            "success": True,
            "title": generated.get("title", "AI Generated Quiz"),
            "questions": generated.get("questions", [])
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@quiz_bp.route("/generate-from-material/<int:material_id>", methods=["POST"])
def generate_quiz_from_material(material_id):
    """
    Generate quiz automatically from an uploaded course PDF.
    The generated quiz is saved as Draft first.
    """

    try:
        data = request.get_json(silent=True) or {}

        number_of_questions = int(data.get("number_of_questions", 10))
        difficulty = data.get("difficulty", "Medium")
        duration_minutes = int(data.get("duration_minutes", 10))

        material = CourseMaterial.query.get(material_id)

        if not material:
            return jsonify({
                "success": False,
                "message": "Course material not found."
            }), 404

        pdf_path = _get_pdf_full_path(material)

        if not os.path.exists(pdf_path):
            return jsonify({
                "success": False,
                "message": "Uploaded PDF file not found on server.",
                "path_checked": pdf_path
            }), 404

        lesson_text = extract_text_from_pdf(pdf_path)

        if not lesson_text or len(lesson_text.strip()) < 100:
            return jsonify({
                "success": False,
                "message": "Not enough readable text found in the PDF."
            }), 400

        generated_quiz = generate_quiz_with_ai(
            lesson_text=lesson_text,
            number_of_questions=number_of_questions,
            difficulty=difficulty
        )

        questions = generated_quiz.get("questions", [])

        if not questions:
            return jsonify({
                "success": False,
                "message": "AI did not generate any questions."
            }), 400

        quiz = Quiz(
            course_id=material.course_id,
            quiz_title=generated_quiz.get("title", "AI Generated Quiz"),
            difficulty_level=difficulty,
            duration_minutes=duration_minutes,
            status="Draft"
        )

        db.session.add(quiz)
        db.session.flush()

        tutor_id = material.uploaded_by or (material.course.tutor_id if material.course else None)
        if tutor_id:
            db.session.add(QuizOwner(quiz_id=quiz.quiz_id, tutor_id=tutor_id))

        for q in questions:
            question = Question(
                quiz_id=quiz.quiz_id,
                question_text=q.get("question_text"),
                option_a=q.get("option_a"),
                option_b=q.get("option_b"),
                option_c=q.get("option_c"),
                option_d=q.get("option_d"),
                correct_answer=q.get("correct_answer")
            )

            db.session.add(question)

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "AI quiz generated successfully. Please review before activating.",
            "quiz_id": quiz.quiz_id,
            "status": quiz.status,
            "quiz": _serialize_public_quiz(quiz)
        }), 201

    except Exception as e:
        db.session.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500