from flask import Blueprint, request, jsonify
from .. import db
from ..models.course_model import Course
from ..models.enrollment_model import Enrollment
from ..models.student_model import Student
from ..models.quiz_model import Quiz
from ..models.course_material_model import CourseMaterial
from datetime import datetime
from ..utils.student_auth import require_student

course_bp = Blueprint("course", __name__)


# ─────────────────────────────────────────────────────────────────
#  GET /api/courses/all  –  all courses (admin / student browse)
# ─────────────────────────────────────────────────────────────────
@course_bp.route("/all", methods=["GET"])
def get_all_courses():
    try:
        courses = Course.query.all()
        return jsonify({"success": True, "courses": [c.to_dict() for c in courses], "total": len(courses)}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error retrieving courses: {str(e)}"}), 500


# ─────────────────────────────────────────────────────────────────
#  GET /api/courses/  –  list courses, optional ?tutor_id=X filter
#  POST /api/courses/  –  create a new course
# ─────────────────────────────────────────────────────────────────
@course_bp.route("/", methods=["GET"])
def list_courses():
    try:
        tutor_id = request.args.get("tutor_id", type=int)
        if tutor_id:
            courses = Course.query.filter_by(tutor_id=tutor_id).order_by(Course.created_at.desc()).all()
        else:
            courses = Course.query.order_by(Course.created_at.desc()).all()

        result = []
        for c in courses:
            d = c.to_dict()
            d["enrollment_count"] = Enrollment.query.filter_by(course_id=c.course_id).count()
            d["quiz_count"] = Quiz.query.filter_by(course_id=c.course_id).count()
            result.append(d)
        return jsonify({"success": True, "courses": result, "total": len(result)}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error retrieving courses: {str(e)}"}), 500


@course_bp.route("/", methods=["POST"])
def create_course():
    data = request.get_json() or {}
    title = (data.get("course_title") or data.get("title") or "").strip()
    tutor_id = data.get("tutor_id")
    description = (data.get("description") or "").strip()
    image_url = data.get("image_url") or None

    if not title:
        return jsonify({"success": False, "message": "Course title is required"}), 400

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
        return jsonify({"success": True, "course": course.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────────
#  GET /api/courses/<id>   –  single course
#  PUT /api/courses/<id>   –  update
#  DELETE /api/courses/<id> – delete
# ─────────────────────────────────────────────────────────────────
@course_bp.route("/<int:course_id>", methods=["GET"])
def get_course(course_id):
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"success": False, "message": "Course not found"}), 404
    d = course.to_dict()
    d["enrollment_count"] = Enrollment.query.filter_by(course_id=course_id).count()
    d["quiz_count"] = Quiz.query.filter_by(course_id=course_id).count()
    return jsonify({"success": True, "course": d}), 200


@course_bp.route("/<int:course_id>", methods=["PUT"])
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
    if "status" in data:
        course.status = data["status"]

    try:
        db.session.commit()
        return jsonify({"success": True, "course": course.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500


@course_bp.route("/<int:course_id>", methods=["DELETE"])
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
#  ENROLLMENT
# ─────────────────────────────────────────────────────────────────
@course_bp.route("/enroll", methods=["POST"])
@require_student
def enroll_course(authenticated_student_id):
    data = request.get_json() or {}
    if not data.get("course_id"):
        return jsonify({"success": False, "message": "Course ID is required"}), 400

    data["student_id"] = authenticated_student_id
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
@require_student
def check_enrollment(authenticated_student_id):
    data = request.get_json() or {}
    if not data.get("course_id"):
        return jsonify({"success": False, "message": "Course ID is required"}), 400
    enrollment = Enrollment.query.filter_by(
        student_id=authenticated_student_id, course_id=data['course_id']
    ).first()
    return jsonify({"success": True, "is_enrolled": enrollment is not None}), 200


@course_bp.route("/unenroll", methods=["POST"])
@require_student
def unenroll_course(authenticated_student_id):
    data = request.get_json() or {}
    if not data.get("course_id"):
        return jsonify({"success": False, "message": "Course ID is required"}), 400

    enrollment = Enrollment.query.filter_by(
        student_id=authenticated_student_id, course_id=data['course_id']
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


# ─────────────────────────────────────────────────────────────────
#  MATERIALS  (under /api/courses/<id>/materials)
# ─────────────────────────────────────────────────────────────────
@course_bp.route("/<int:course_id>/materials", methods=["GET"])
def get_course_materials(course_id):
    if not Course.query.get(course_id):
        return jsonify({"success": False, "message": "Course not found"}), 404
    try:
        materials = CourseMaterial.query.filter_by(course_id=course_id).order_by(CourseMaterial.created_at.asc()).all()
        return jsonify({"success": True, "materials": [m.to_dict() for m in materials], "total": len(materials)}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@course_bp.route("/<int:course_id>/materials", methods=["POST"])
def add_course_material(course_id):
    if not Course.query.get(course_id):
        return jsonify({"success": False, "message": "Course not found"}), 404

    # Support both JSON and form-data
    if request.content_type and "multipart" in request.content_type:
        title = request.form.get("title", "")
        material_type = request.form.get("material_type", "pdf")
        description = request.form.get("description", "")
        url = request.form.get("url", "")
    else:
        data = request.get_json() or {}
        title = data.get("title", "")
        material_type = data.get("material_type") or data.get("type", "pdf")
        description = data.get("description", "")
        url = data.get("url", "")

    if not title:
        return jsonify({"success": False, "message": "title is required"}), 400

    try:
        material = CourseMaterial(
            course_id=course_id,
            title=title,
            material_type=material_type,
            url=url or None,
            description=description or None,
        )
        db.session.add(material)
        db.session.commit()
        return jsonify({"success": True, "material": material.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500


@course_bp.route("/materials/<int:material_id>", methods=["DELETE"])
def delete_course_material(material_id):
    material = CourseMaterial.query.get(material_id)
    if not material:
        return jsonify({"success": False, "message": "Material not found"}), 404
    try:
        db.session.delete(material)
        db.session.commit()
        return jsonify({"success": True, "message": "Material deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────────
#  STUDENTS enrolled in a course
# ─────────────────────────────────────────────────────────────────
@course_bp.route("/<int:course_id>/students", methods=["GET"])
def get_course_students(course_id):
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"success": False, "message": "Course not found"}), 404
    try:
        enrollments = Enrollment.query.filter_by(course_id=course_id).all()
        students = []
        for e in enrollments:
            if e.student:
                students.append({
                    "student_id": e.student.student_id,
                    "name": e.student.name,
                    "email": e.student.email,
                    "enrolled_at": e.enrolled_at.isoformat() if e.enrolled_at else None
                })
        return jsonify({"success": True, "students": students, "total": len(students)}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error retrieving students: {str(e)}"}), 500
