from flask import Blueprint, request, jsonify
from sqlalchemy import text, func
from werkzeug.security import generate_password_hash, check_password_hash
from ..models import Tutor, Course, CourseMaterial, Quiz, QuizQuestion, QuizOwner
from ..models.attendance_model import AttendanceRecord
from ..models.student_model import Student
from ..models.enrollment_model import Enrollment
from ..models.quiz_result_model import QuizResult
from ..utils.password_utils import validate_password
from .. import db
from datetime import datetime


tutor_bp = Blueprint("tutor", __name__)


# ─────────────────────────────────────────────────────────────────
#  Helper utilities
# ─────────────────────────────────────────────────────────────────

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


# ─────────────────────────────────────────────────────────────────
#  PROFILE
# ─────────────────────────────────────────────────────────────────

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
    if "first_name" in data:
        tutor.first_name = data["first_name"]
    if "last_name" in data:
        tutor.last_name = data["last_name"]
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


# ─────────────────────────────────────────────────────────────────
#  DASHBOARD  –  real aggregated stats
# ─────────────────────────────────────────────────────────────────

@tutor_bp.route("/dashboard/<int:tutor_id>", methods=["GET"])
def get_dashboard(tutor_id):
    tutor = Tutor.query.get(tutor_id)
    if not tutor:
        return jsonify({"success": False, "message": "Tutor not found"}), 404

    # Count courses for this tutor
    total_courses = db.session.execute(
        text("SELECT COUNT(*) FROM courses WHERE tutor_id = :tid"),
        {"tid": tutor_id}
    ).scalar() or 0

    # Count distinct students in this tutor's courses via attendance table
    # (enrollments table is empty; attendance reflects actual student-course participation)
    total_students = db.session.execute(
        text("""
            SELECT COUNT(DISTINCT a.student_id)
            FROM attendance a
            INNER JOIN courses c ON c.course_id = a.course_id
            WHERE c.tutor_id = :tid
        """),
        {"tid": tutor_id}
    ).scalar() or 0

    # Count quizzes for this tutor's courses (quiz_owners is empty, use quizzes→courses)
    total_quizzes = db.session.execute(
        text("""
            SELECT COUNT(*)
            FROM quizzes q
            INNER JOIN courses c ON c.course_id = q.course_id
            WHERE c.tutor_id = :tid
        """),
        {"tid": tutor_id}
    ).scalar() or 0

    # Count course materials across this tutor's courses
    total_materials = db.session.execute(
        text("""
            SELECT COUNT(*)
            FROM course_materials m
            INNER JOIN courses c ON c.course_id = m.course_id
            WHERE c.tutor_id = :tid
        """),
        {"tid": tutor_id}
    ).scalar() or 0

    # Count quiz results via quizzes→courses (quiz_owners is empty)
    total_attempts = db.session.execute(
        text("""
            SELECT COUNT(*)
            FROM quiz_results qr
            INNER JOIN quizzes q ON q.quiz_id = qr.quiz_id
            INNER JOIN courses c ON c.course_id = q.course_id
            WHERE c.tutor_id = :tid
        """),
        {"tid": tutor_id}
    ).scalar() or 0

    # Average quiz score via quizzes→courses (quiz_owners is empty)
    avg_score = db.session.execute(
        text("""
            SELECT ROUND(AVG(qr.percentage), 1)
            FROM quiz_results qr
            INNER JOIN quizzes q ON q.quiz_id = qr.quiz_id
            INNER JOIN courses c ON c.course_id = q.course_id
            WHERE c.tutor_id = :tid
        """),
        {"tid": tutor_id}
    ).scalar()

    return jsonify({
        "success": True,
        "dashboard": {
            "total_courses": total_courses,
            "total_students": total_students,
            "total_quizzes": total_quizzes,
            "total_assignments": total_materials,
            "total_materials": total_materials,
            "total_attempts": total_attempts,
            "avg_quiz_score": float(avg_score) if avg_score else 0.0,
            "unread_queries": 0,
        },
    }), 200


# ─────────────────────────────────────────────────────────────────
#  COURSES  –  routes used by the tutor frontend
# ─────────────────────────────────────────────────────────────────

@tutor_bp.route("/courses-list/<int:tutor_id>", methods=["GET"])
def get_tutor_courses(tutor_id):
    """Return all courses for a given tutor with enrolment count."""
    try:
        courses = Course.query.filter_by(tutor_id=tutor_id).order_by(Course.created_at.desc()).all()
        result = []
        for c in courses:
            d = c.to_dict()
            # Count students via attendance (enrollments is empty)
            d["enrollment_count"] = db.session.execute(
                text("SELECT COUNT(DISTINCT student_id) FROM attendance WHERE course_id = :cid"),
                {"cid": c.course_id}
            ).scalar() or 0
            d["quiz_count"] = Quiz.query.filter_by(course_id=c.course_id).count()
            result.append(d)
        return jsonify({"success": True, "courses": result, "total": len(result)}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@tutor_bp.route("/course/<int:course_id>", methods=["GET"])
def get_single_course(course_id):
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"success": False, "message": "Course not found"}), 404
    d = course.to_dict()
    # Count students via attendance (enrollments is empty)
    d["enrollment_count"] = db.session.execute(
        text("SELECT COUNT(DISTINCT student_id) FROM attendance WHERE course_id = :cid"),
        {"cid": course_id}
    ).scalar() or 0
    d["quiz_count"] = Quiz.query.filter_by(course_id=course_id).count()
    return jsonify({"success": True, "course": d}), 200


@tutor_bp.route("/course", methods=["POST"])
def create_course():
    data = request.get_json() or {}
    tutor_id = _as_int(data.get("tutor_id"))
    title = (data.get("course_title") or data.get("title") or "").strip()
    description = (data.get("description") or "").strip()
    image_url = (data.get("image_url") or "").strip() or None

    if not title:
        return jsonify({"success": False, "message": "Course title is required"}), 400
    if not tutor_id:
        return jsonify({"success": False, "message": "Tutor ID is required"}), 400
    if not Tutor.query.get(tutor_id):
        return jsonify({"success": False, "message": "Tutor not found"}), 404

    try:
        course = Course(
            course_title=title,
            description=description,
            tutor_id=tutor_id,
            image_url=image_url,
            status="Pending",
            submitted_at=datetime.utcnow(),
        )
        db.session.add(course)
        db.session.commit()
        return jsonify({"success": True, "message": "Course created successfully", "course": course.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500


@tutor_bp.route("/course/<int:course_id>", methods=["PUT"])
def update_course(course_id):
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"success": False, "message": "Course not found"}), 404

    data = request.get_json() or {}
    if "course_title" in data or "title" in data:
        course.course_title = data.get("course_title") or data.get("title") or course.course_title
    if "description" in data:
        course.description = data["description"]
    if "image_url" in data:
        course.image_url = data["image_url"]

    try:
        db.session.commit()
        return jsonify({"success": True, "message": "Course updated", "course": course.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────────
#  DELETE QUIZ
# ─────────────────────────────────────────────────────────────────

@tutor_bp.route("/quiz/<int:quiz_id>", methods=["DELETE"])
def delete_quiz(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"success": False, "message": "Quiz not found"}), 404
    try:
        db.session.delete(quiz)
        db.session.commit()
        return jsonify({"success": True, "message": "Quiz deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────────
#  EDIT QUIZ QUESTION
# ─────────────────────────────────────────────────────────────────

@tutor_bp.route("/question/<int:question_id>", methods=["PUT"])
def update_quiz_question(question_id):
    question = QuizQuestion.query.get(question_id)
    if not question:
        return jsonify({"success": False, "message": "Question not found"}), 404

    data = request.get_json() or {}
    if "question_text" in data or "question" in data:
        question.question_text = (data.get("question_text") or data.get("question") or question.question_text).strip()
    if "option1" in data or ("options" in data and len(data["options"]) > 0):
        opts = data.get("options", [data.get("option1",""), data.get("option2",""), data.get("option3",""), data.get("option4","")])
        question.option1 = opts[0] if len(opts) > 0 else question.option1
        question.option2 = opts[1] if len(opts) > 1 else question.option2
        question.option3 = opts[2] if len(opts) > 2 else question.option3
        question.option4 = opts[3] if len(opts) > 3 else question.option4
    if "correct_answer" in data or "correctAnswer" in data:
        ca = (data.get("correct_answer") or data.get("correctAnswer") or "").strip().lower()
        question.correct_answer = ca if ca in {"a", "b", "c", "d"} else question.correct_answer

    try:
        db.session.commit()
        return jsonify({"success": True, "message": "Question updated", "question": question.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500


@tutor_bp.route("/course/<int:course_id>", methods=["DELETE"])
def delete_course(course_id):
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"success": False, "message": "Course not found"}), 404
    try:
        db.session.delete(course)
        db.session.commit()
        return jsonify({"success": True, "message": "Course deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────────
#  COURSE STUDENTS
# ─────────────────────────────────────────────────────────────────

@tutor_bp.route("/course/<int:course_id>/students", methods=["GET"])
def get_course_students(course_id):
    """All students in a course (via attendance, since enrollments is empty), with their quiz stats."""
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"success": False, "message": "Course not found"}), 404
    try:
        # Find students via attendance (enrollments is empty)
        student_ids = db.session.execute(
            text("SELECT DISTINCT student_id FROM attendance WHERE course_id = :cid"),
            {"cid": course_id}
        ).scalars().all()

        students = []
        for sid in student_ids:
            s = Student.query.get(sid)
            if not s:
                continue
            # quiz results for this student in this course's quizzes
            results = db.session.execute(
                text("""
                    SELECT qr.score, qr.percentage, qr.attempted_at
                    FROM quiz_results qr
                    INNER JOIN quizzes q ON q.quiz_id = qr.quiz_id
                    WHERE q.course_id = :cid AND qr.student_id = :sid
                    ORDER BY qr.attempted_at DESC
                """),
                {"cid": course_id, "sid": sid}
            ).fetchall()

            avg_score = round(sum(r.percentage for r in results) / len(results), 1) if results else None
            latest = results[0] if results else None

            # attendance from `attendance` table (attendance_records is empty)
            att_records = db.session.execute(
                text("""
                    SELECT attendance_id, attendance_date, status
                    FROM attendance
                    WHERE student_id = :sid AND course_id = :cid
                """),
                {"sid": sid, "cid": course_id}
            ).fetchall()
            att_total = len(att_records)
            att_present = sum(1 for a in att_records if a.status == "Present")
            att_pct = round(att_present / att_total * 100, 1) if att_total > 0 else None

            students.append({
                "student_id": s.student_id,
                "name": s.name,
                "email": s.email,
                "enrolled_at": None,
                "quiz_attempts": len(results),
                "avg_quiz_score": avg_score,
                "latest_quiz_score": latest.percentage if latest else None,
                "latest_quiz_at": latest.attempted_at.isoformat() if latest else None,
                "attendance_total": att_total,
                "attendance_present": att_present,
                "attendance_percentage": att_pct,
            })
        return jsonify({"success": True, "students": students, "total": len(students)}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────────
#  QUIZZES
# ─────────────────────────────────────────────────────────────────

@tutor_bp.route("/quizzes/<int:tutor_id>", methods=["GET"])
def get_quizzes(tutor_id):
    # quiz_owners is empty; find quizzes via courses owned by this tutor
    quizzes = db.session.execute(
        text("""
            SELECT q.quiz_id FROM quizzes q
            INNER JOIN courses c ON c.course_id = q.course_id
            WHERE c.tutor_id = :tid
        """),
        {"tid": tutor_id}
    ).scalars().all()
    quiz_list = Quiz.query.filter(Quiz.quiz_id.in_(quizzes)).all() if quizzes else []
    result = []
    for q in quiz_list:
        d = q.to_dict(include_questions=False, hide_answers=False)
        d["question_count"] = len(q.questions)
        d["attempt_count"] = QuizResult.query.filter_by(quiz_id=q.quiz_id).count()
        d["course_title"] = q.course.course_title if q.course else None
        result.append(d)
    return jsonify({"success": True, "quizzes": result}), 200


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
    if not course_id:
        return jsonify({"success": False, "message": "Course ID is required"}), 400

    tutor = Tutor.query.get(tutor_id)
    if not tutor:
        return jsonify({"success": False, "message": "Tutor not found"}), 404
    if not Course.query.get(course_id):
        return jsonify({"success": False, "message": "Course not found"}), 404

    quiz = Quiz(
        quiz_title=title,
        course_id=course_id,
        difficulty_level=difficulty_level if difficulty_level in {"Easy", "Medium", "Hard"} else "Easy",
        duration_minutes=duration_minutes,
        status="Active" if is_published else "Inactive",
    )
    db.session.add(quiz)
    db.session.flush()

    db.session.add(QuizOwner(quiz_id=quiz.quiz_id, tutor_id=tutor_id))

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

    db.session.commit()
    return jsonify({"success": True, "message": "Quiz created successfully", "quiz": quiz.to_dict()}), 201


@tutor_bp.route("/quizzes/<int:quiz_id>/publish", methods=["PUT"])
def publish_quiz(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"success": False, "message": "Quiz not found"}), 404
    quiz.status = "Active"
    db.session.commit()
    return jsonify({"success": True, "message": "Quiz published"}), 200


@tutor_bp.route("/quiz/<int:quiz_id>", methods=["GET"])
def get_quiz_detail(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"success": False, "message": "Quiz not found"}), 404
    d = quiz.to_dict(include_questions=True, hide_answers=False)
    d["attempt_count"] = QuizResult.query.filter_by(quiz_id=quiz_id).count()
    d["course_title"] = quiz.course.course_title if quiz.course else None
    return jsonify({"success": True, "quiz": d}), 200


@tutor_bp.route("/quiz/<int:quiz_id>", methods=["PUT"])
def update_quiz(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"success": False, "message": "Quiz not found"}), 404

    data = request.get_json() or {}
    if "title" in data or "quiz_title" in data:
        quiz.quiz_title = data.get("title") or data.get("quiz_title") or quiz.quiz_title
    if "difficulty_level" in data or "difficultyLevel" in data:
        dl = data.get("difficulty_level") or data.get("difficultyLevel", quiz.difficulty_level)
        quiz.difficulty_level = dl if dl in {"Easy", "Medium", "Hard"} else quiz.difficulty_level
    if "duration_minutes" in data or "durationMinutes" in data:
        quiz.duration_minutes = _as_int(data.get("duration_minutes") or data.get("durationMinutes"), quiz.duration_minutes)
    if "status" in data:
        quiz.status = data["status"] if data["status"] in {"Active", "Inactive"} else quiz.status
    if "is_published" in data or "isPublished" in data:
        published = data.get("is_published") or data.get("isPublished")
        quiz.status = "Active" if published else "Inactive"

    try:
        db.session.commit()
        return jsonify({"success": True, "message": "Quiz updated", "quiz": quiz.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500


@tutor_bp.route("/quiz/<int:quiz_id>/questions", methods=["POST"])
def add_quiz_question(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"success": False, "message": "Quiz not found"}), 404

    data = request.get_json() or {}
    try:
        question = _build_question(data, len(quiz.questions))
        question.quiz_id = quiz_id
        db.session.add(question)
        db.session.commit()
        return jsonify({"success": True, "message": "Question added", "question": question.to_dict()}), 201
    except ValueError as exc:
        return jsonify({"success": False, "message": str(exc)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500


@tutor_bp.route("/question/<int:question_id>", methods=["DELETE"])
def delete_quiz_question(question_id):
    question = QuizQuestion.query.get(question_id)
    if not question:
        return jsonify({"success": False, "message": "Question not found"}), 404
    try:
        db.session.delete(question)
        db.session.commit()
        return jsonify({"success": True, "message": "Question deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500



@tutor_bp.route("/quiz/<int:quiz_id>/results", methods=["GET"])
def get_quiz_results(quiz_id):
    """All student results for a specific quiz."""
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"success": False, "message": "Quiz not found"}), 404
    try:
        results = QuizResult.query.filter_by(quiz_id=quiz_id).order_by(QuizResult.attempted_at.desc()).all()
        data = []
        for r in results:
            student = Student.query.get(r.student_id)
            data.append({
                "result_id": r.result_id,
                "student_id": r.student_id,
                "student_name": student.name if student else "Unknown",
                "student_email": student.email if student else None,
                "score": r.score,
                "total_questions": r.total_questions,
                "percentage": r.percentage,
                "attempted_at": r.attempted_at.isoformat() if r.attempted_at else None,
                "feedback": r.feedback,
            })
        avg = round(sum(r["percentage"] for r in data) / len(data), 1) if data else 0
        return jsonify({
            "success": True,
            "quiz_id": quiz_id,
            "quiz_title": quiz.quiz_title,
            "results": data,
            "total_attempts": len(data),
            "average_score": avg,
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────────
#  STUDENT MONITORING  –  full real data
# ─────────────────────────────────────────────────────────────────

@tutor_bp.route("/students/<int:tutor_id>", methods=["GET"])
def get_all_students_for_tutor(tutor_id):
    """
    All students in any of this tutor's courses (via attendance table, since
    enrollments table is empty but attendance has 700 real records linking
    students to courses). Also uses student_performance for assignment scores
    and quiz_results via quizzes→courses for quiz data.
    """
    import logging
    logger = logging.getLogger(__name__)
    try:
        # Discover students via the attendance table (enrollments is empty)
        # Each unique (student_id, course_id) pair in attendance maps a student to a course
        rows = db.session.execute(
            text("""
                SELECT DISTINCT s.student_id, s.first_name, s.last_name, s.email,
                       s.school_name, s.grade_level, a.course_id, c.course_title
                FROM students s
                INNER JOIN attendance a ON a.student_id = s.student_id
                INNER JOIN courses c ON c.course_id = a.course_id
                WHERE c.tutor_id = :tid
                ORDER BY s.first_name, s.last_name
            """),
            {"tid": tutor_id}
        ).fetchall()

        logger.info(f"[StudentMonitoring] tutor_id={tutor_id}: found {len(rows)} student-course rows")

        # Group by student_id (a student may appear in multiple courses)
        student_map = {}
        for row in rows:
            sid = row.student_id
            if sid not in student_map:
                student_map[sid] = {
                    "student_id": sid,
                    "name": f"{row.first_name} {row.last_name}".strip(),
                    "first_name": row.first_name,
                    "last_name": row.last_name,
                    "email": row.email,
                    "school_name": row.school_name,
                    "grade_level": row.grade_level,
                    "courses": [],
                }
            # Avoid duplicate course entries
            existing_cids = [c["course_id"] for c in student_map[sid]["courses"]]
            if row.course_id not in existing_cids:
                student_map[sid]["courses"].append({
                    "course_id": row.course_id,
                    "course_title": row.course_title,
                })

        students = []
        for sid, sdata in student_map.items():
            # --- Quiz performance: use quizzes→courses chain (quiz_owners is empty) ---
            quiz_rows = db.session.execute(
                text("""
                    SELECT qr.score, qr.total_questions, qr.percentage, qr.attempted_at,
                           q.quiz_title, q.course_id
                    FROM quiz_results qr
                    INNER JOIN quizzes q ON q.quiz_id = qr.quiz_id
                    INNER JOIN courses c ON c.course_id = q.course_id
                    WHERE qr.student_id = :sid AND c.tutor_id = :tid
                    ORDER BY qr.attempted_at DESC
                """),
                {"sid": sid, "tid": tutor_id}
            ).fetchall()

            avg_quiz_score = round(sum(r.percentage for r in quiz_rows) / len(quiz_rows), 1) if quiz_rows else None
            quiz_attempts = len(quiz_rows)
            latest_quiz = {
                "title": quiz_rows[0].quiz_title,
                "score": quiz_rows[0].percentage,
                "date": quiz_rows[0].attempted_at.isoformat() if quiz_rows[0].attempted_at else None,
            } if quiz_rows else None

            # --- Attendance from the `attendance` table (not attendance_records which is empty) ---
            # The `attendance` table stores status as 'Present'/'Absent' (title case)
            att_rows = db.session.execute(
                text("""
                    SELECT a.status
                    FROM attendance a
                    INNER JOIN courses c ON c.course_id = a.course_id
                    WHERE a.student_id = :sid AND c.tutor_id = :tid
                """),
                {"sid": sid, "tid": tutor_id}
            ).fetchall()

            att_total = len(att_rows)
            att_present = sum(1 for r in att_rows if r.status == "Present")
            att_pct = round(att_present / att_total * 100, 1) if att_total > 0 else None

            # --- student_performance for assignment_score (rich pre-computed data) ---
            perf_row = db.session.execute(
                text("""
                    SELECT sp.assignment_score, sp.quiz_score, sp.attendance_percentage, sp.risk_level
                    FROM student_performance sp
                    INNER JOIN courses c ON c.course_id = sp.course_id
                    WHERE sp.student_id = :sid AND c.tutor_id = :tid
                    LIMIT 1
                """),
                {"sid": sid, "tid": tutor_id}
            ).fetchone()

            assignment_score = float(perf_row.assignment_score) if perf_row and perf_row.assignment_score is not None else None
            risk_level = perf_row.risk_level if perf_row and perf_row.risk_level else "Low"

            sdata.update({
                "course_count": len(sdata.get("courses", [])),
                "quiz_attempts": quiz_attempts,
                "avg_quiz_score": avg_quiz_score,
                "latest_quiz": latest_quiz,
                "risk_level": risk_level,
                "quiz_history": [
                    {
                        "quiz_title": r.quiz_title,
                        "score": r.percentage,
                        "date": r.attempted_at.isoformat() if r.attempted_at else None,
                    }
                    for r in quiz_rows[:5]
                ],
                "attendance_total": att_total,
                "attendance_present": att_present,
                "attendance_percentage": att_pct,
                "assignment_score": assignment_score,
                # No understanding feedback table in current schema
                "feedback_understood": 0,
                "feedback_partial": 0,
                "feedback_confused": 0,
                "total_feedback": 0,
            })
            students.append(sdata)

        logger.info(f"[StudentMonitoring] tutor_id={tutor_id}: returning {len(students)} unique students")
        return jsonify({
            "success": True,
            "students": students,
            "total": len(students),
        }), 200
    except Exception as e:
        import traceback
        logging.getLogger(__name__).error(f"[StudentMonitoring] Error: {traceback.format_exc()}")
        return jsonify({"success": False, "message": "Unable to load student monitoring data"}), 500


@tutor_bp.route("/student/<int:student_id>/detail/<int:tutor_id>", methods=["GET"])
def get_student_detail(student_id, tutor_id):
    """Full detail for one student across this tutor's courses."""
    tutor = Tutor.query.get(tutor_id)
    if not tutor:
        return jsonify({"success": False, "message": "Tutor not found"}), 404

    student = Student.query.get(student_id)
    if not student:
        return jsonify({"success": False, "message": "Student not found"}), 404

    # Check via attendance (enrollments is empty; attendance has 700 real records)
    enrolled_with_tutor = db.session.execute(
        text("""
            SELECT 1
            FROM attendance a
            INNER JOIN courses c ON c.course_id = a.course_id
            WHERE a.student_id = :sid AND c.tutor_id = :tid
            LIMIT 1
        """),
        {"sid": student_id, "tid": tutor_id},
    ).first()
    if not enrolled_with_tutor:
        return jsonify({"success": False, "message": "Student is not enrolled in your courses"}), 403

    try:
        # All quiz results via quizzes→courses chain (quiz_owners is empty)
        quiz_rows = db.session.execute(
            text("""
                SELECT qr.result_id, qr.score, qr.total_questions, qr.percentage,
                       qr.attempted_at, qr.feedback, q.quiz_title, q.course_id,
                       c.course_title
                FROM quiz_results qr
                INNER JOIN quizzes q ON q.quiz_id = qr.quiz_id
                INNER JOIN courses c ON c.course_id = q.course_id
                WHERE qr.student_id = :sid AND c.tutor_id = :tid
                ORDER BY qr.attempted_at DESC
            """),
            {"sid": student_id, "tid": tutor_id}
        ).fetchall()

        # Attendance from `attendance` table (attendance_records is empty)
        # attendance.status is 'Present'/'Absent' (title case)
        att_rows = db.session.execute(
            text("""
                SELECT a.attendance_id, a.course_id, a.attendance_date AS session_date,
                       a.status, c.course_title
                FROM attendance a
                INNER JOIN courses c ON c.course_id = a.course_id
                WHERE a.student_id = :sid AND c.tutor_id = :tid
                ORDER BY a.attendance_date DESC
            """),
            {"sid": student_id, "tid": tutor_id}
        ).fetchall()

        att_total = len(att_rows)
        att_present = sum(1 for r in att_rows if r.status == "Present")
        att_pct = round(att_present / att_total * 100, 1) if att_total > 0 else None

        avg_quiz = round(sum(r.percentage for r in quiz_rows) / len(quiz_rows), 1) if quiz_rows else None

        return jsonify({
            "success": True,
            "student": {
                "student_id": student.student_id,
                "name": student.name,
                "email": student.email,
                "school_name": student.school_name,
                "grade_level": student.grade_level,
                "avg_quiz_score": avg_quiz,
                "attendance_percentage": att_pct,
                "attendance_total": att_total,
                "attendance_present": att_present,
            },
            "quiz_results": [
                {
                    "result_id": r.result_id,
                    "quiz_title": r.quiz_title,
                    "course_title": r.course_title,
                    "score": r.score,
                    "total_questions": r.total_questions,
                    "percentage": r.percentage,
                    "feedback": r.feedback,
                    "attempted_at": r.attempted_at.isoformat() if r.attempted_at else None,
                }
                for r in quiz_rows
            ],
            "attendance_records": [
                {
                    "attendance_id": r.attendance_id,
                    "course_title": r.course_title,
                    "session_name": "Class Session",
                    "session_date": r.session_date.isoformat() if r.session_date else None,
                    "status": r.status,
                }
                for r in att_rows
            ],
        }), 200
    except Exception as e:
        import traceback, logging
        logging.getLogger(__name__).error(f"[StudentDetail] Error: {traceback.format_exc()}")
        return jsonify({"success": False, "message": "Unable to load student detail"}), 500


# ─────────────────────────────────────────────────────────────────
#  ATTENDANCE  –  tutor-facing endpoints
# ─────────────────────────────────────────────────────────────────

@tutor_bp.route("/attendance/<int:tutor_id>", methods=["GET"])
def get_tutor_attendance(tutor_id):
    """Summary attendance per course for this tutor (uses `attendance` table)."""
    try:
        courses = Course.query.filter_by(tutor_id=tutor_id).all()
        result = []
        for course in courses:
            # Use `attendance` table (not attendance_records which is empty)
            # status is 'Present'/'Absent' (title case)
            records = db.session.execute(
                text("""
                    SELECT attendance_id, student_id, attendance_date, status
                    FROM attendance
                    WHERE course_id = :cid
                    ORDER BY attendance_date DESC
                """),
                {"cid": course.course_id}
            ).fetchall()

            total = len(records)
            present_count = sum(1 for r in records if r.status == "Present")
            absent_count = total - present_count

            # Group by date
            sessions = {}
            for r in records:
                d = r.attendance_date.isoformat() if r.attendance_date else "Unknown"
                if d not in sessions:
                    sessions[d] = {"date": d, "session_name": f"Session {d}", "present": 0, "absent": 0}
                key = "present" if r.status == "Present" else "absent"
                sessions[d][key] += 1

            result.append({
                "course_id": course.course_id,
                "course_title": course.course_title,
                "total_records": total,
                "present_count": present_count,
                "absent_count": absent_count,
                "attendance_rate": round(present_count / total * 100, 1) if total > 0 else None,
                "sessions": sorted(sessions.values(), key=lambda x: x["date"], reverse=True),
            })

        return jsonify({"success": True, "courses": result}), 200
    except Exception as e:
        import traceback, logging
        logging.getLogger(__name__).error(f"[TutorAttendance] Error: {traceback.format_exc()}")
        return jsonify({"success": False, "message": str(e)}), 500


@tutor_bp.route("/attendance/course/<int:course_id>", methods=["GET"])
def get_course_attendance_detail(course_id):
    """Detailed per-student attendance for a course (uses `attendance` table)."""
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"success": False, "message": "Course not found"}), 404
    try:
        # Find students in this course via attendance (enrollments table is empty)
        student_ids = db.session.execute(
            text("SELECT DISTINCT student_id FROM attendance WHERE course_id = :cid"),
            {"cid": course_id}
        ).scalars().all()

        students = []
        for sid in student_ids:
            s = Student.query.get(sid)
            if not s:
                continue

            # Get attendance records for this student in this course
            records = db.session.execute(
                text("""
                    SELECT attendance_id, attendance_date, status
                    FROM attendance
                    WHERE student_id = :sid AND course_id = :cid
                    ORDER BY attendance_date DESC
                """),
                {"sid": sid, "cid": course_id}
            ).fetchall()

            total = len(records)
            present = sum(1 for r in records if r.status == "Present")
            absent = total - present

            students.append({
                "student_id": s.student_id,
                "name": s.name,
                "email": s.email,
                "total_sessions": total,
                "present": present,
                "absent": absent,
                "attendance_percentage": round(present / total * 100, 1) if total > 0 else None,
                "records": [
                    {
                        "attendance_id": r.attendance_id,
                        "session_name": "Class Session",
                        "session_date": r.attendance_date.isoformat() if r.attendance_date else None,
                        "status": r.status,
                    }
                    for r in records
                ],
            })

        return jsonify({
            "success": True,
            "course_id": course_id,
            "course_title": course.course_title,
            "students": students,
            "total_students": len(students),
        }), 200
    except Exception as e:
        import traceback, logging
        logging.getLogger(__name__).error(f"[CourseAttendance] Error: {traceback.format_exc()}")
        return jsonify({"success": False, "message": str(e)}), 500


@tutor_bp.route("/attendance/mark", methods=["POST"])
def tutor_mark_attendance():
    """Mark or update attendance for a student in a session."""
    data = request.get_json() or {}
    required = ["student_id", "course_id", "session_date", "status"]
    for f in required:
        if not data.get(f):
            return jsonify({"success": False, "message": f"{f} is required"}), 400

    if not Student.query.get(data["student_id"]):
        return jsonify({"success": False, "message": "Student not found"}), 404
    if not Course.query.get(data["course_id"]):
        return jsonify({"success": False, "message": "Course not found"}), 404

    try:
        session_date = datetime.strptime(data["session_date"], "%Y-%m-%d").date()
        existing = AttendanceRecord.query.filter_by(
            student_id=data["student_id"],
            course_id=data["course_id"],
            session_date=session_date,
        ).first()

        if existing:
            existing.status = data["status"]
            existing.session_name = data.get("session_name", existing.session_name)
            existing.marked_by = data.get("marked_by")
        else:
            record = AttendanceRecord(
                student_id=data["student_id"],
                course_id=data["course_id"],
                session_name=data.get("session_name", "Class Session"),
                session_date=session_date,
                status=data["status"],
                marked_by=data.get("marked_by"),
            )
            db.session.add(record)

        db.session.commit()
        return jsonify({"success": True, "message": "Attendance recorded"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────────
#  ANALYTICS  –  topic difficulty & understanding feedback
# ─────────────────────────────────────────────────────────────────

@tutor_bp.route("/analytics/<int:tutor_id>", methods=["GET"])
def get_tutor_analytics(tutor_id):
    """
    Aggregated analytics for the tutor:
    - Quiz performance per course
    - Attendance rate per course
    - Understanding feedback summary
    """
    try:
        courses = Course.query.filter_by(tutor_id=tutor_id).all()
        course_analytics = []

        for course in courses:
            # Quiz performance for this course
            quiz_data = db.session.execute(
                text("""
                    SELECT q.quiz_title, q.quiz_id,
                           COUNT(qr.result_id) AS attempts,
                           ROUND(AVG(qr.percentage), 1) AS avg_score,
                           MIN(qr.percentage) AS min_score,
                           MAX(qr.percentage) AS max_score
                    FROM quizzes q
                    LEFT JOIN quiz_results qr ON qr.quiz_id = q.quiz_id
                    WHERE q.course_id = :cid
                    GROUP BY q.quiz_id, q.quiz_title
                    ORDER BY q.quiz_id
                """),
                {"cid": course.course_id}
            ).fetchall()

            # Attendance from `attendance` table (attendance_records is empty)
            # status is 'Present'/'Absent' (title case)
            att_data = db.session.execute(
                text("""
                    SELECT
                        COUNT(*) AS total,
                        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS present_count
                    FROM attendance
                    WHERE course_id = :cid
                """),
                {"cid": course.course_id}
            ).fetchone()

            att_total = att_data.total or 0
            att_present = att_data.present_count or 0
            att_rate = round(att_present / att_total * 100, 1) if att_total > 0 else None

            # Student count via attendance (enrollments is empty)
            student_count = db.session.execute(
                text("SELECT COUNT(DISTINCT student_id) FROM attendance WHERE course_id = :cid"),
                {"cid": course.course_id}
            ).scalar() or 0

            course_analytics.append({
                "course_id": course.course_id,
                "course_title": course.course_title,
                "enrollment_count": student_count,
                "attendance_rate": att_rate,
                "attendance_total": att_total,
                "quizzes": [
                    {
                        "quiz_id": q.quiz_id,
                        "quiz_title": q.quiz_title,
                        "attempts": q.attempts,
                        "avg_score": float(q.avg_score) if q.avg_score else None,
                        "min_score": float(q.min_score) if q.min_score else None,
                        "max_score": float(q.max_score) if q.max_score else None,
                    }
                    for q in quiz_data
                ],
            })

        # Overall stats: use attendance and quizzes→courses (enrollments & quiz_owners empty)
        total_students_enrolled = db.session.execute(
            text("""
                SELECT COUNT(DISTINCT a.student_id)
                FROM attendance a
                INNER JOIN courses c ON c.course_id = a.course_id
                WHERE c.tutor_id = :tid
            """),
            {"tid": tutor_id}
        ).scalar() or 0

        total_quiz_attempts = db.session.execute(
            text("""
                SELECT COUNT(*)
                FROM quiz_results qr
                INNER JOIN quizzes q ON q.quiz_id = qr.quiz_id
                INNER JOIN courses c ON c.course_id = q.course_id
                WHERE c.tutor_id = :tid
            """),
            {"tid": tutor_id}
        ).scalar() or 0

        overall_avg = db.session.execute(
            text("""
                SELECT ROUND(AVG(qr.percentage), 1)
                FROM quiz_results qr
                INNER JOIN quizzes q ON q.quiz_id = qr.quiz_id
                INNER JOIN courses c ON c.course_id = q.course_id
                WHERE c.tutor_id = :tid
            """),
            {"tid": tutor_id}
        ).scalar()

        return jsonify({
            "success": True,
            "overview": {
                "total_courses": len(courses),
                "total_students": total_students_enrolled,
                "total_quiz_attempts": total_quiz_attempts,
                "overall_avg_score": float(overall_avg) if overall_avg else None,
            },
            "courses": course_analytics,
        }), 200
    except Exception as e:
        import traceback, logging
        logging.getLogger(__name__).error(f"[TutorAnalytics] Error: {traceback.format_exc()}")
        return jsonify({"success": False, "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────────
#  AVAILABILITY
# ─────────────────────────────────────────────────────────────────

@tutor_bp.route("/availability/<int:tutor_id>", methods=["GET"])
def get_availability(tutor_id):
    from ..models.course_model import Availability
    tutor = Tutor.query.get(tutor_id)
    if not tutor:
        return jsonify({"success": False, "message": "Tutor not found"}), 404
    slots = Availability.query.filter_by(tutor_id=tutor_id).order_by(Availability.day_of_week).all()
    return jsonify({"success": True, "availability": [s.to_dict() for s in slots]}), 200


@tutor_bp.route("/availability", methods=["POST"])
def add_availability():
    from ..models.course_model import Availability
    data = request.get_json() or {}
    tutor_id = _as_int(data.get("tutor_id"))
    if not tutor_id:
        return jsonify({"success": False, "message": "tutor_id is required"}), 400
    if not Tutor.query.get(tutor_id):
        return jsonify({"success": False, "message": "Tutor not found"}), 404

    slot = Availability(
        tutor_id=tutor_id,
        day_of_week=data.get("day_of_week", ""),
        start_time=data.get("start_time", ""),
        end_time=data.get("end_time", ""),
    )
    db.session.add(slot)
    db.session.commit()
    return jsonify({"success": True, "message": "Availability added", "slot": slot.to_dict()}), 201


@tutor_bp.route("/availability/<int:availability_id>", methods=["DELETE"])
def delete_availability(availability_id):
    from ..models.course_model import Availability
    slot = Availability.query.get(availability_id)
    if not slot:
        return jsonify({"success": False, "message": "Availability slot not found"}), 404
    db.session.delete(slot)
    db.session.commit()
    return jsonify({"success": True, "message": "Availability deleted"}), 200


# ─────────────────────────────────────────────────────────────────
#  MATERIALS
# ─────────────────────────────────────────────────────────────────

@tutor_bp.route("/course/<int:course_id>/materials", methods=["GET"])
def get_course_materials_tutor(course_id):
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"success": False, "message": "Course not found"}), 404
    materials = CourseMaterial.query.filter_by(course_id=course_id).order_by(CourseMaterial.uploaded_at.desc()).all()
    return jsonify({
        "success": True,
        "materials": [m.to_dict() for m in materials],
        "total": len(materials),
    }), 200


# ─────────────────────────────────────────────────────────────────
#  ANNOUNCEMENTS  –  full CRUD using announcements table
# ─────────────────────────────────────────────────────────────────

@tutor_bp.route("/announcements/<int:tutor_id>", methods=["GET"])
def get_announcements(tutor_id):
    """Get all announcements created by this tutor."""
    try:
        rows = db.session.execute(
            text("""
                SELECT a.announcement_id, a.tutor_id, a.course_id, a.title,
                       a.content, a.created_at, a.updated_at,
                       c.course_title
                FROM announcements a
                LEFT JOIN courses c ON c.course_id = a.course_id
                WHERE a.tutor_id = :tid
                ORDER BY a.created_at DESC
            """),
            {"tid": tutor_id}
        ).fetchall()
        announcements = []
        for r in rows:
            announcements.append({
                "announcement_id": r.announcement_id,
                "tutor_id": r.tutor_id,
                "course_id": r.course_id,
                "title": r.title,
                "content": r.content,
                "course_title": r.course_title,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "updated_at": r.updated_at.isoformat() if r.updated_at else None,
            })
        return jsonify({"success": True, "announcements": announcements, "total": len(announcements)}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@tutor_bp.route("/announcements", methods=["POST"])
def create_announcement():
    """Create a new announcement."""
    data = request.get_json() or {}
    tutor_id = _as_int(data.get("tutor_id"))
    title = (data.get("title") or "").strip()
    content = (data.get("content") or "").strip()
    course_id = _as_int(data.get("course_id"))

    if not tutor_id:
        return jsonify({"success": False, "message": "tutor_id is required"}), 400
    if not title:
        return jsonify({"success": False, "message": "Title is required"}), 400
    if not content:
        return jsonify({"success": False, "message": "Content is required"}), 400
    if not Tutor.query.get(tutor_id):
        return jsonify({"success": False, "message": "Tutor not found"}), 404
    if course_id and not Course.query.get(course_id):
        return jsonify({"success": False, "message": "Course not found"}), 404

    try:
        db.session.execute(
            text("""
                INSERT INTO announcements (tutor_id, course_id, title, content)
                VALUES (:tid, :cid, :title, :content)
            """),
            {"tid": tutor_id, "cid": course_id, "title": title, "content": content}
        )
        db.session.commit()

        # Optionally notify enrolled students
        if course_id:
            enrolled = db.session.execute(
                text("SELECT student_id FROM enrollments WHERE course_id = :cid"),
                {"cid": course_id}
            ).fetchall()
            for row in enrolled:
                db.session.execute(
                    text("""
                        INSERT INTO notifications (student_id, message, status)
                        VALUES (:sid, :msg, 'Unread')
                    """),
                    {"sid": row.student_id,
                     "msg": f"New announcement from your tutor: {title}"}
                )
            db.session.commit()

        return jsonify({"success": True, "message": "Announcement created successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500


@tutor_bp.route("/announcements/<int:announcement_id>", methods=["PUT"])
def update_announcement(announcement_id):
    """Edit an existing announcement."""
    try:
        row = db.session.execute(
            text("SELECT * FROM announcements WHERE announcement_id = :aid"),
            {"aid": announcement_id}
        ).fetchone()
        if not row:
            return jsonify({"success": False, "message": "Announcement not found"}), 404

        data = request.get_json() or {}
        title = (data.get("title") or row.title).strip()
        content = (data.get("content") or row.content).strip()
        course_id = _as_int(data.get("course_id")) if "course_id" in data else row.course_id

        db.session.execute(
            text("""
                UPDATE announcements
                SET title = :title, content = :content, course_id = :cid
                WHERE announcement_id = :aid
            """),
            {"title": title, "content": content, "cid": course_id, "aid": announcement_id}
        )
        db.session.commit()
        return jsonify({"success": True, "message": "Announcement updated"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500


@tutor_bp.route("/announcements/<int:announcement_id>", methods=["DELETE"])
def delete_announcement(announcement_id):
    """Delete an announcement."""
    try:
        result = db.session.execute(
            text("DELETE FROM announcements WHERE announcement_id = :aid"),
            {"aid": announcement_id}
        )
        db.session.commit()
        if result.rowcount == 0:
            return jsonify({"success": False, "message": "Announcement not found"}), 404
        return jsonify({"success": True, "message": "Announcement deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500


@tutor_bp.route("/recent-announcements/<int:tutor_id>", methods=["GET"])
def get_recent_announcements(tutor_id):
    """Get the 5 most recent announcements for dashboard display."""
    try:
        rows = db.session.execute(
            text("""
                SELECT a.announcement_id, a.title, a.content, a.created_at,
                       c.course_title
                FROM announcements a
                LEFT JOIN courses c ON c.course_id = a.course_id
                WHERE a.tutor_id = :tid
                ORDER BY a.created_at DESC
                LIMIT 5
            """),
            {"tid": tutor_id}
        ).fetchall()
        return jsonify({
            "success": True,
            "announcements": [
                {
                    "announcement_id": r.announcement_id,
                    "title": r.title,
                    "content": r.content,
                    "course_title": r.course_title,
                    "created_at": r.created_at.isoformat() if r.created_at else None,
                }
                for r in rows
            ]
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────────
#  TOPIC DIFFICULTY  –  from topic_difficulty table
# ─────────────────────────────────────────────────────────────────

@tutor_bp.route("/topic-difficulty/<int:tutor_id>", methods=["GET"])
def get_topic_difficulty(tutor_id):
    """Return topic difficulty data from the topic_difficulty table."""
    try:
        rows = db.session.execute(
            text("""
                SELECT id, topic_name, difficulty_score, avg_accuracy, last_updated
                FROM topic_difficulty
                ORDER BY difficulty_score DESC
            """)
        ).fetchall()
        topics = [
            {
                "id": r.id,
                "topic_name": r.topic_name,
                "difficulty_score": float(r.difficulty_score) if r.difficulty_score else 0.0,
                "avg_accuracy": float(r.avg_accuracy) if r.avg_accuracy else 0.0,
                "last_updated": r.last_updated.isoformat() if r.last_updated else None,
            }
            for r in rows
        ]
        return jsonify({"success": True, "topics": topics, "total": len(topics)}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────────
#  STUDENT PERFORMANCE SUMMARY  –  from student_performance table
# ─────────────────────────────────────────────────────────────────

@tutor_bp.route("/performance-summary/<int:tutor_id>", methods=["GET"])
def get_performance_summary(tutor_id):
    """
    Return student_performance records for students enrolled in this
    tutor's courses. This is the dataset used for AI risk prediction.
    """
    try:
        rows = db.session.execute(
            text("""
                SELECT sp.performance_id, sp.student_id, sp.course_id,
                       sp.quiz_score, sp.attendance_percentage,
                       sp.assignment_score, sp.risk_level,
                       CONCAT(s.first_name, ' ', s.last_name) AS student_name,
                       s.email, c.course_title
                FROM student_performance sp
                INNER JOIN students s ON s.student_id = sp.student_id
                INNER JOIN courses c ON c.course_id = sp.course_id
                WHERE c.tutor_id = :tid
                ORDER BY sp.risk_level DESC, sp.quiz_score ASC
            """),
            {"tid": tutor_id}
        ).fetchall()

        # Summary counts
        risk_summary = {"Low": 0, "Medium": 0, "High": 0}
        records = []
        for r in rows:
            risk = r.risk_level or "Low"
            if risk in risk_summary:
                risk_summary[risk] += 1
            records.append({
                "performance_id": r.performance_id,
                "student_id": r.student_id,
                "student_name": r.student_name,
                "email": r.email,
                "course_id": r.course_id,
                "course_title": r.course_title,
                "quiz_score": float(r.quiz_score) if r.quiz_score else 0.0,
                "attendance_percentage": float(r.attendance_percentage) if r.attendance_percentage else 0.0,
                "assignment_score": float(r.assignment_score) if r.assignment_score else 0.0,
                "risk_level": risk,
            })

        return jsonify({
            "success": True,
            "records": records,
            "total": len(records),
            "risk_summary": risk_summary,
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────────
#  Utility
# ─────────────────────────────────────────────────────────────────

def _table_exists(table_name):
    try:
        db.session.execute(text(f"SELECT 1 FROM {table_name} LIMIT 1"))
        return True
    except Exception:
        return False
