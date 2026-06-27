from flask import Blueprint, request, jsonify
from .. import db
from ..models.attendance_model import AttendanceRecord
from ..models.student_model import Student
from ..models.course_model import Course
from datetime import datetime, date

attendance_bp = Blueprint("attendance", __name__)


@attendance_bp.route("/student/<int:student_id>", methods=["GET"])
def get_student_attendance(student_id):
    if not Student.query.get(student_id):
        return jsonify({"success": False, "message": "Student not found"}), 404
    try:
        records = AttendanceRecord.query.filter_by(student_id=student_id).order_by(AttendanceRecord.session_date.desc()).all()
        total = len(records)
        attended = sum(1 for r in records if r.status in ('present', 'late'))
        percentage = round((attended / total * 100), 1) if total > 0 else 0
        return jsonify({
            "success": True,
            "records": [r.to_dict() for r in records],
            "summary": {
                "total_sessions": total,
                "attended": attended,
                "absent": total - attended,
                "attendance_percentage": percentage
            }
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@attendance_bp.route("/mark", methods=["POST"])
def mark_attendance():
    data = request.get_json() or {}
    required = ["student_id", "course_id", "session_date", "status"]
    for field in required:
        if not data.get(field):
            return jsonify({"success": False, "message": f"{field} is required"}), 400

    if not Student.query.get(data["student_id"]):
        return jsonify({"success": False, "message": "Student not found"}), 404
    if not Course.query.get(data["course_id"]):
        return jsonify({"success": False, "message": "Course not found"}), 404

    try:
        session_date = datetime.strptime(data["session_date"], "%Y-%m-%d").date()
        existing = AttendanceRecord.query.filter_by(
            student_id=data["student_id"],
            course_id=data["course_id"],
            session_date=session_date
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
                marked_by=data.get("marked_by")
            )
            db.session.add(record)

        db.session.commit()
        return jsonify({"success": True, "message": "Attendance recorded"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500


@attendance_bp.route("/course/<int:course_id>", methods=["GET"])
def get_course_attendance(course_id):
    if not Course.query.get(course_id):
        return jsonify({"success": False, "message": "Course not found"}), 404
    try:
        records = AttendanceRecord.query.filter_by(course_id=course_id).order_by(AttendanceRecord.session_date.desc()).all()
        return jsonify({"success": True, "records": [r.to_dict() for r in records]}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
