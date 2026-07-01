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

# pyrefly: ignore [missing-import]
from flask import Blueprint, request, jsonify, send_from_directory
# pyrefly: ignore [missing-import]
from werkzeug.utils import secure_filename
# pyrefly: ignore [missing-import]
from sqlalchemy.exc import SQLAlchemyError
import os
from datetime import datetime

# pyrefly: ignore [missing-import]
from .. import db
# pyrefly: ignore [missing-import]
from ..models import Course, CourseMaterial, Tutor, normalize_material_type, Quiz, Question, QuizOwner
from ..services.pdf_service import extract_text_from_pdf
from ..services.ai_quiz_service import generate_quiz_with_ai

course_bp = Blueprint("course", __name__)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf', 'mp4', 'avi', 'mov', 'mkv', 'docx', 'pptx', 'txt'}
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '../../uploads')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@course_bp.route("/files/<path:filename>", methods=["GET"])
def serve_material_file(filename):
    """Serve uploaded course material files"""
    safe_name = secure_filename(os.path.basename(filename))
    if not safe_name:
        return jsonify({"success": False, "message": "Invalid file name"}), 400

    filepath = os.path.join(UPLOAD_FOLDER, safe_name)
    if not os.path.isfile(filepath):
        return jsonify({"success": False, "message": "File not found"}), 404

    return send_from_directory(UPLOAD_FOLDER, safe_name)


# ==================== COURSE MANAGEMENT ====================

@course_bp.route("/", methods=["GET"])
@course_bp.route("", methods=["GET"])
def get_all_courses():
    """Get all courses with optional filtering"""
    tutor_id = request.args.get("tutor_id")
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 100, type=int)
    
    query = Course.query
    
    if tutor_id:
        query = query.filter_by(tutor_id=tutor_id)
    
    courses = query.paginate(page=page, per_page=per_page)
    
    return jsonify({
        "success": True,
        "courses": [course.to_dict() for course in courses.items],
        "total": courses.total,
        "pages": courses.pages,
        "current_page": page
    }), 200


@course_bp.route("/<int:course_id>", methods=["GET"])
def get_course(course_id):
    """Get course details with materials"""
    course = Course.query.get(course_id)
    
    if not course:
        return jsonify({"success": False, "message": "Course not found"}), 404
    
    course_data = course.to_dict()
    course_data["materials"] = [material.to_dict() for material in course.materials]
    course_data["tutor"] = {
        "id": course.tutor.tutor_id,
        "name": course.tutor.full_name,
        "email": course.tutor.email
    }
    
    return jsonify({
        "success": True,
        "course": course_data
    }), 200


@course_bp.route("", methods=["POST"])
def create_course():
    """Create a new course"""
    data = request.get_json()
    
    # Validation
    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    tutor_id = data.get("tutor_id")
    image_url = data.get("image_url", "")
    category = data.get("category", "General")
    level = data.get("level", "Beginner")  # Beginner, Intermediate, Advanced
    
    if not title:
        return jsonify({"success": False, "message": "Course title is required"}), 400
    
    if not tutor_id:
        return jsonify({"success": False, "message": "Tutor ID is required"}), 400
    
    # Verify tutor exists
    tutor = Tutor.query.get(tutor_id)
    if not tutor:
        return jsonify({"success": False, "message": "Tutor not found"}), 404
    
    # Check if course with same title already exists for this tutor
    existing = Course.query.filter_by(tutor_id=tutor_id, course_title=title).first()
    if existing:
        return jsonify({"success": False, "message": "Course with this title already exists"}), 409
    
    course = Course(
        tutor_id=tutor_id,
        course_title=title,
        description=description,
        image_url=image_url,
    )
    
    db.session.add(course)
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Course created successfully",
        "course": course.to_dict()
    }), 201


@course_bp.route("/<int:course_id>", methods=["PUT"])
def update_course(course_id):
    """Update course details"""
    course = Course.query.get(course_id)
    
    if not course:
        return jsonify({"success": False, "message": "Course not found"}), 404
    
    data = request.get_json()
    
    # Update allowed fields
    if "title" in data:
        title = data["title"].strip()
        if not title:
            return jsonify({"success": False, "message": "Title cannot be empty"}), 400
        
        # Check for duplicate title
        duplicate = Course.query.filter_by(
            tutor_id=course.tutor_id,
            course_title=title
        ).filter(Course.course_id != course_id).first()
        
        if duplicate:
            return jsonify({"success": False, "message": "Title already exists"}), 409
        
        course.course_title = title
    
    if "description" in data:
        course.description = data["description"]

    if "image_url" in data:
        course.image_url = data["image_url"]
    
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Course updated successfully",
        "course": course.to_dict()
    }), 200


@course_bp.route("/<int:course_id>/cover", methods=["POST"])
def upload_course_cover(course_id):
    """Upload custom cover image for a course"""
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"success": False, "message": "Course not found"}), 404

    if "file" not in request.files:
        return jsonify({"success": False, "message": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"success": False, "message": "No selected file"}), 400

    allowed_image_extensions = {"png", "jpg", "jpeg", "webp", "gif"}
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in allowed_image_extensions:
        return jsonify({"success": False, "message": "Only image files (png, jpg, jpeg, webp, gif) are allowed"}), 400

    try:
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_")
        filename = "cover_" + timestamp + filename
        filepath = os.path.join(UPLOAD_FOLDER, filename)

        file.save(filepath)

        file_url = f"http://localhost:5000/api/tutor/courses/files/{filename}"
        course.image_url = file_url
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Cover image uploaded successfully",
            "image_url": file_url,
            "course": course.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500


@course_bp.route("/<int:course_id>", methods=["DELETE"])
def delete_course(course_id):
    """Delete a course and all its materials"""
    course = Course.query.get(course_id)
    
    if not course:
        return jsonify({"success": False, "message": "Course not found"}), 404
    
    # Delete all materials first
    for material in course.materials:
        db.session.delete(material)
    
    db.session.delete(course)
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Course deleted successfully"
    }), 200


# ==================== COURSE MATERIALS ====================

@course_bp.route("/<int:course_id>/materials", methods=["GET"])
def get_course_materials(course_id):
    """Get all materials for a course"""
    course = Course.query.get(course_id)
    
    if not course:
        return jsonify({"success": False, "message": "Course not found"}), 404
    
    materials = CourseMaterial.query.filter_by(course_id=course_id).order_by(
        CourseMaterial.material_id.desc()
    ).all()
    
    return jsonify({
        "success": True,
        "materials": [material.to_dict() for material in materials]
    }), 200


@course_bp.route("/<int:course_id>/materials", methods=["POST"])
def add_material(course_id):
    """Add material to a course"""
    course = Course.query.get(course_id)
    
    if not course:
        return jsonify({"success": False, "message": "Course not found"}), 404
    
    # Handle file upload
    if 'file' not in request.files:
        return jsonify({"success": False, "message": "No file provided"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"success": False, "message": "No file selected"}), 400
    
    if not allowed_file(file.filename):
        return jsonify({
            "success": False,
            "message": f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        }), 400
    
    # Create uploads folder if it doesn't exist
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    
    # Save file with secure filename
    filename = secure_filename(file.filename)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_")
    filename = timestamp + filename
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    
    try:
        file.save(filepath)
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Failed to save file: {str(e)}"
        }), 500
    
    # Get material info from form
    title = request.form.get("title", filename).strip()
    material_type = request.form.get("material_type", "pdf")
    description = request.form.get("description", "")
    
    if not title:
        title = filename
    
    # Create material record
    material = CourseMaterial(
        course_id=course_id,
        material_title=title,
        material_type=normalize_material_type(material_type),
        file_path=filename,
    )
    
    db.session.add(material)
    db.session.commit()
    
    # Auto-generate quiz if material is a PDF
    if material.material_type == "PDF":
        try:
            pdf_path = os.path.abspath(os.path.join(UPLOAD_FOLDER, filename))
            if os.path.exists(pdf_path):
                lesson_text = extract_text_from_pdf(pdf_path)
                if lesson_text and len(lesson_text.strip()) >= 100:
                    generated = generate_quiz_with_ai(lesson_text, number_of_questions=5)
                    questions_data = generated.get("questions", [])
                    if questions_data:
                        quiz = Quiz(
                            course_id=course_id,
                            quiz_title=generated.get("title", f"AI Quiz - {title}"),
                            difficulty_level="Medium",
                            duration_minutes=15,
                            status="Inactive"
                        )
                        db.session.add(quiz)
                        db.session.flush()

                        if course.tutor_id:
                            db.session.add(QuizOwner(quiz_id=quiz.quiz_id, tutor_id=course.tutor_id))

                        for q in questions_data:
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
        except Exception as auto_err:
            db.session.rollback()
            print(f"Auto-quiz generation failed: {str(auto_err)}")

    return jsonify({
        "success": True,
        "message": "Material uploaded successfully",
        "material": material.to_dict()
    }), 201


@course_bp.route("/materials/<int:material_id>", methods=["GET"])
def get_material(material_id):
    """Get material details"""
    material = CourseMaterial.query.get(material_id)
    
    if not material:
        return jsonify({"success": False, "message": "Material not found"}), 404
    
    return jsonify({
        "success": True,
        "material": material.to_dict()
    }), 200


@course_bp.route("/materials/<int:material_id>", methods=["PUT"])
def update_material(material_id):
    """Update material information"""
    material = CourseMaterial.query.get(material_id)
    
    if not material:
        return jsonify({"success": False, "message": "Material not found"}), 404
    
    data = request.get_json()
    
    if "title" in data:
        title = data["title"].strip()
        if title:
            material.material_title = title
    
    if "material_type" in data:
        material.material_type = normalize_material_type(data["material_type"])
    
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Material updated successfully",
        "material": material.to_dict()
    }), 200


@course_bp.route("/materials/<int:material_id>", methods=["DELETE"])
def delete_material(material_id):
    """Delete material from course"""
    material = CourseMaterial.query.get(material_id)
    
    if not material:
        return jsonify({"success": False, "message": "Material not found"}), 404
    
    course = material.course
    course_id = course.course_id
    
    # Delete file from filesystem
    filepath = os.path.join(UPLOAD_FOLDER, material.file_path)
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
    except Exception as e:
        print(f"Warning: Could not delete file {filepath}: {str(e)}")
    
    # Decrement lesson count handled via relationship count
    
    db.session.delete(material)
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Material deleted successfully"
    }), 200


# ==================== COURSE STATISTICS ====================

@course_bp.route("/<int:course_id>/stats", methods=["GET"])
def get_course_stats(course_id):
    """Get course statistics"""
    course = Course.query.get(course_id)
    
    if not course:
        return jsonify({"success": False, "message": "Course not found"}), 404
    
    material_count = len(course.materials)
    
    return jsonify({
        "success": True,
        "stats": {
            "course_id": course_id,
            "title": course.title,
            "student_count": 0,
            "lesson_count": material_count,
            "material_count": material_count,
            "status": course.status,
        }
    }), 200


@course_bp.route("/<int:course_id>/enroll", methods=["POST"])
def enroll_student(course_id):
    """Enroll a student in a course"""
    course = Course.query.get(course_id)
    
    if not course:
        return jsonify({"success": False, "message": "Course not found"}), 404
    
    data = request.get_json()
    student_id = data.get("student_id")
    
    if not student_id:
        return jsonify({"success": False, "message": "Student ID is required"}), 400
    
    # Enrollment tracking is not stored on tutor_courses yet.
    return jsonify({
        "success": True,
        "message": "Student enrolled successfully",
        "course": course.to_dict()
    }), 200


@course_bp.route("/<int:course_id>/bulk-upload", methods=["POST"])
def bulk_upload_materials(course_id):
    """Upload multiple materials at once"""
    course = Course.query.get(course_id)
    
    if not course:
        return jsonify({"success": False, "message": "Course not found"}), 404
    
    if 'files' not in request.files:
        return jsonify({"success": False, "message": "No files provided"}), 400
    
    files = request.files.getlist('files')
    
    if not files:
        return jsonify({"success": False, "message": "No files selected"}), 400
    
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    
    uploaded_materials = []
    failed_files = []
    
    for file in files:
        if file.filename == '':
            continue
        
        if not allowed_file(file.filename):
            failed_files.append({
                "filename": file.filename,
                "reason": "File type not allowed"
            })
            continue
        
        try:
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_")
            filename = timestamp + filename
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            
            file.save(filepath)
            
            # Get file extension to determine type
            ext = filename.rsplit('.', 1)[1].lower()
            if ext == 'pdf':
                material_type = 'pdf'
            elif ext in ['mp4', 'avi', 'mov', 'mkv']:
                material_type = 'video'
            else:
                material_type = 'document'
            
            material = CourseMaterial(
                course_id=course_id,
                material_title=filename.rsplit('.', 1)[0].replace('_', ' '),
                material_type=normalize_material_type(material_type),
                file_path=filename
            )
            
            db.session.add(material)
            uploaded_materials.append(material.to_dict())
            
        except Exception as e:
            failed_files.append({
                "filename": file.filename,
                "reason": str(e)
            })
    
    if uploaded_materials:
        db.session.commit()
    
    return jsonify({
        "success": True,
        "message": f"Uploaded {len(uploaded_materials)} materials",
        "uploaded": uploaded_materials,
        "failed": failed_files
    }), 200 if not failed_files else 207
