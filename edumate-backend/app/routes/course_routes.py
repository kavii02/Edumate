from flask import Blueprint, request, jsonify
from .. import db
from ..models.course_model import Course
from ..student.models.enrollment_model import Enrollment
from ..student.models.student_model import Student

course_bp = Blueprint("course", __name__)


@course_bp.route("/all", methods=["GET"])
def get_all_courses():
    try:
        courses = Course.query.all()
        return jsonify({"success": True, "courses": [c.to_dict() for c in courses], "total": len(courses)}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error retrieving courses: {str(e)}"}), 500


@course_bp.route("/<int:course_id>", methods=["GET"])
def get_course(course_id):
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"success": False, "message": "Course not found"}), 404
    return jsonify({"success": True, "course": course.to_dict()}), 200


@course_bp.route("/enroll", methods=["POST"])
def enroll_course():
    data = request.get_json() or {}
    if not data.get("student_id"):
        return jsonify({"success": False, "message": "Student ID is required"}), 400
    if not data.get("course_id"):
        return jsonify({"success": False, "message": "Course ID is required"}), 400

    if not Student.query.get(data['student_id']):
        return jsonify({"success": False, "message": "Student not found"}), 404
    if not Course.query.get(data['course_id']):
        return jsonify({"success": False, "message": "Course not found"}), 404

    existing = Enrollment.query.filter_by(
        student_id=data['student_id'], course_id=data['course_id']
    ).first()
    if existing:
        return jsonify({"success": False, "message": "Already enrolled"}), 409

    try:
        enrollment = Enrollment(student_id=data['student_id'], course_id=data['course_id'])
        db.session.add(enrollment)
        db.session.commit()
        return jsonify({"success": True, "message": "Enrolled successfully", "enrollment_id": enrollment.enrollment_id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Enrollment failed: {str(e)}"}), 500


@course_bp.route("/check-enrollment", methods=["POST"])
def check_enrollment():
    data = request.get_json() or {}
    if not data.get("student_id") or not data.get("course_id"):
        return jsonify({"success": False, "message": "Student ID and Course ID are required"}), 400
    enrollment = Enrollment.query.filter_by(
        student_id=data['student_id'], course_id=data['course_id']
    ).first()
    return jsonify({"success": True, "is_enrolled": enrollment is not None}), 200


@course_bp.route("/unenroll", methods=["POST"])
def unenroll_course():
    data = request.get_json() or {}
    if not data.get("student_id") or not data.get("course_id"):
        return jsonify({"success": False, "message": "Student ID and Course ID are required"}), 400

    enrollment = Enrollment.query.filter_by(
        student_id=data['student_id'], course_id=data['course_id']
    ).first()
    if not enrollment:
        return jsonify({"success": False, "message": "Not enrolled in this course"}), 404

    try:
        db.session.delete(enrollment)
        db.session.commit()
        return jsonify({"success": True, "message": "Unenrolled successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Unenrollment failed: {str(e)}"}), 500


@course_bp.route("/<int:course_id>/materials", methods=["GET"])
def get_course_materials(course_id):
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"success": False, "message": "Course not found"}), 404
    return jsonify({
        "success": True,
        "course_id": course_id,
        "materials": [
            {"material_id": 1, "title": "Introduction to the Course", "type": "pdf", "url": "/materials/intro.pdf"},
            {"material_id": 2, "title": "Core Concepts Video", "type": "video", "url": "/materials/core.mp4"}
        ]
    }), 200


@course_bp.route("/<int:course_id>/students", methods=["GET"])
def get_course_students(course_id):
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"success": False, "message": "Course not found"}), 404
    try:
        enrollments = Enrollment.query.filter_by(course_id=course_id).all()
        students = [{
            "student_id": e.student.student_id,
            "name": e.student.name,
            "email": e.student.email,
            "enrolled_at": e.enrolled_at.isoformat() if e.enrolled_at else None
        } for e in enrollments]
        return jsonify({"success": True, "students": students, "total": len(students)}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error retrieving students: {str(e)}"}), 500
