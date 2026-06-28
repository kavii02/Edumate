from flask import Blueprint, request, jsonify
from app import db
from app.models.quiz_model import Quiz, QuizQuestion
from ..models.quiz_result_model import QuizResult
from ..models.quiz_attempt_model import QuizAttempt
from ..models.student_model import Student
from app.models.course_model import Course

quiz_bp = Blueprint("quiz", __name__)


def generate_ai_feedback(percentage):
    if percentage >= 85:
        return "🎉 Excellent Performance! You have mastered this topic. Keep up the great work!"
    elif percentage >= 70:
        return "✅ Good Performance! You understand most concepts. Review weak areas to improve."
    elif percentage >= 50:
        return "📚 Satisfactory Performance. Focus on topics you found confusing."
    return "⚠️ Needs Improvement. Review course materials and practice more questions."


@quiz_bp.route("/all", methods=["GET"])
def get_all_quizzes():
    try:
        quizzes = Quiz.query.all()
        return jsonify({"success": True, "quizzes": [q.to_dict() for q in quizzes], "total": len(quizzes)}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error retrieving quizzes: {str(e)}"}), 500


@quiz_bp.route("/course/<int:course_id>", methods=["GET"])
def get_course_quizzes(course_id):
    if not Course.query.get(course_id):
        return jsonify({"success": False, "message": "Course not found"}), 404
    try:
        quizzes = Quiz.query.filter_by(course_id=course_id).all()
        return jsonify({"success": True, "course_id": course_id, "quizzes": [q.to_dict() for q in quizzes]}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error retrieving quizzes: {str(e)}"}), 500


@quiz_bp.route("/<int:quiz_id>", methods=["GET"])
def get_quiz(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"success": False, "message": "Quiz not found"}), 404
    try:
        questions = QuizQuestion.query.filter_by(quiz_id=quiz_id).all()
        return jsonify({
            "success": True,
            "quiz": quiz.to_dict(hide_answers=True),
            "questions": [q.to_dict_hide_answer() for q in questions]
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error retrieving quiz: {str(e)}"}), 500


@quiz_bp.route("/<int:quiz_id>/answers", methods=["GET"])
def get_quiz_with_answers(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"success": False, "message": "Quiz not found"}), 404
    try:
        questions = QuizQuestion.query.filter_by(quiz_id=quiz_id).all()
        return jsonify({
            "success": True,
            "quiz": quiz.to_dict(include_questions=True),
            "questions": [q.to_dict() for q in questions]
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error retrieving quiz: {str(e)}"}), 500


@quiz_bp.route("/submit", methods=["POST"])
def submit_quiz():
    data = request.get_json() or {}
    if not data.get("student_id"):
        return jsonify({"success": False, "message": "Student ID is required"}), 400
    if not data.get("quiz_id"):
        return jsonify({"success": False, "message": "Quiz ID is required"}), 400
    if not data.get("answers"):
        return jsonify({"success": False, "message": "Answers are required"}), 400

    if not Student.query.get(data['student_id']):
        return jsonify({"success": False, "message": "Student not found"}), 404
    quiz = Quiz.query.get(data['quiz_id'])
    if not quiz:
        return jsonify({"success": False, "message": "Quiz not found"}), 404

    try:
        score = 0
        total_questions = 0
        answers = data['answers']
        questions = QuizQuestion.query.filter_by(quiz_id=data['quiz_id']).all()

        for question in questions:
            qid = str(question.question_id)
            if qid in answers:
                total_questions += 1
                submitted = answers[qid]
                correct = question.correct_answer
                option_map = {
                    'option1': question.option1,
                    'option2': question.option2,
                    'option3': question.option3,
                    'option4': question.option4
                }
                mapped = option_map.get(submitted, submitted)
                if mapped == correct or submitted == correct:
                    score += 1

        percentage = round((score / total_questions * 100), 2) if total_questions > 0 else 0
        feedback = generate_ai_feedback(percentage)

        quiz_result = QuizResult(
            student_id=data['student_id'],
            quiz_id=data['quiz_id'],
            score=score,
            total_questions=total_questions,
            percentage=percentage,
            feedback=feedback
        )
        quiz_attempt = QuizAttempt(
            student_id=data['student_id'],
            quiz_id=data['quiz_id'],
            score=float(score)
        )
        db.session.add(quiz_result)
        db.session.add(quiz_attempt)
        db.session.commit()

        return jsonify({"success": True, "message": "Quiz submitted successfully", "result": quiz_result.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Quiz submission failed: {str(e)}"}), 500


@quiz_bp.route("/history/<int:student_id>", methods=["GET"])
def get_quiz_history(student_id):
    if not Student.query.get(student_id):
        return jsonify({"success": False, "message": "Student not found"}), 404
    try:
        results = QuizResult.query.filter_by(student_id=student_id).order_by(QuizResult.attempted_at.desc()).all()
        return jsonify({"success": True, "student_id": student_id, "results": [r.to_dict() for r in results], "total_attempts": len(results)}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error retrieving history: {str(e)}"}), 500


@quiz_bp.route("/analytics/<int:student_id>", methods=["GET"])
def get_student_analytics(student_id):
    if not Student.query.get(student_id):
        return jsonify({"success": False, "message": "Student not found"}), 404
    try:
        results = QuizResult.query.filter_by(student_id=student_id).all()
        if not results:
            return jsonify({"success": True, "analytics": {"student_id": student_id, "total_quizzes_attempted": 0, "average_percentage": 0.0, "highest_score": 0.0, "lowest_score": 0.0, "total_correct": 0, "total_questions": 0}}), 200

        percentages = [r.percentage for r in results]
        analytics = {
            "student_id": student_id,
            "total_quizzes_attempted": len(results),
            "average_percentage": round(sum(percentages) / len(percentages), 2),
            "highest_score": max(percentages),
            "lowest_score": min(percentages),
            "total_correct": sum(r.score for r in results),
            "total_questions": sum(r.total_questions for r in results)
        }
        return jsonify({"success": True, "analytics": analytics}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error calculating analytics: {str(e)}"}), 500


@quiz_bp.route("/result/<int:result_id>", methods=["GET"])
def get_quiz_result(result_id):
    result = QuizResult.query.get(result_id)
    if not result:
        return jsonify({"success": False, "message": "Result not found"}), 404
    return jsonify({"success": True, "result": result.to_dict()}), 200


@quiz_bp.route("/weak-topics/<int:student_id>", methods=["GET"])
def get_weak_topics(student_id):
    if not Student.query.get(student_id):
        return jsonify({"success": False, "message": "Student not found"}), 404
    try:
        results = QuizResult.query.filter_by(student_id=student_id).all()
        weak_topics = [{"quiz_id": r.quiz_id, "quiz_title": r.quiz.title, "score": r.score, "percentage": r.percentage, "attempted_at": r.attempted_at.isoformat() if r.attempted_at else None} for r in results if r.percentage < 60]
        return jsonify({"success": True, "student_id": student_id, "weak_topics": weak_topics, "total_weak_areas": len(weak_topics)}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error analyzing weak topics: {str(e)}"}), 500


@quiz_bp.route("/class-performance/<int:course_id>", methods=["GET"])
def get_class_performance(course_id):
    if not Course.query.get(course_id):
        return jsonify({"success": False, "message": "Course not found"}), 404
    try:
        quiz_ids = [q.quiz_id for q in Quiz.query.filter_by(course_id=course_id).all()]
        results = QuizResult.query.filter(QuizResult.quiz_id.in_(quiz_ids)).all()
        if not results:
            return jsonify({"success": True, "course_id": course_id, "statistics": {"total_attempts": 0, "average_percentage": 0.0, "highest_performer": None, "lowest_performer": None}}), 200

        percentages = [r.percentage for r in results]
        perfs = {}
        for r in results:
            if r.student_id not in perfs:
                perfs[r.student_id] = {"student_name": r.student.name, "attempts": 0, "total_percentage": 0.0}
            perfs[r.student_id]["attempts"] += 1
            perfs[r.student_id]["total_percentage"] += r.percentage
        for sid in perfs:
            perfs[sid]["average_percentage"] = round(perfs[sid]["total_percentage"] / perfs[sid]["attempts"], 2)

        sorted_students = sorted(perfs.items(), key=lambda x: x[1]["average_percentage"], reverse=True)
        return jsonify({"success": True, "course_id": course_id, "statistics": {"total_attempts": len(results), "average_percentage": round(sum(percentages) / len(percentages), 2), "highest_performer": {"student_id": sorted_students[0][0], "name": sorted_students[0][1]["student_name"], "average_percentage": sorted_students[0][1]["average_percentage"]} if sorted_students else None, "lowest_performer": {"student_id": sorted_students[-1][0], "name": sorted_students[-1][1]["student_name"], "average_percentage": sorted_students[-1][1]["average_percentage"]} if sorted_students else None}}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error calculating performance: {str(e)}"}), 500


@quiz_bp.route("/leaderboard", methods=["GET"])
def get_leaderboard():
    try:
        results = QuizResult.query.all()
        perfs = {}
        for r in results:
            if r.student_id not in perfs:
                perfs[r.student_id] = {
                    "student_id": r.student_id,
                    "name": r.student.name if r.student else f"Student {r.student_id}",
                    "attempts": 0,
                    "total_percentage": 0.0,
                    "total_score": 0
                }
            perfs[r.student_id]["attempts"] += 1
            perfs[r.student_id]["total_percentage"] += r.percentage
            perfs[r.student_id]["total_score"] += r.score

        ranked = []
        for sid, data in perfs.items():
            data["average_percentage"] = round(data["total_percentage"] / data["attempts"], 2)
            data["points"] = data["total_score"] * 50
            ranked.append(data)

        ranked.sort(key=lambda x: x["average_percentage"], reverse=True)
        for i, entry in enumerate(ranked):
            entry["rank"] = i + 1

        return jsonify({"success": True, "leaderboard": ranked, "total": len(ranked)}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error fetching leaderboard: {str(e)}"}), 500
