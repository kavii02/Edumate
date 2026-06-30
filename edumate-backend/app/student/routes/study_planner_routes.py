from flask import Blueprint, request, jsonify
from app import db
from ..models.study_planner_model import StudyPlanner
from ..models.student_model import Student
from datetime import datetime

planner_bp = Blueprint("planner", __name__)


@planner_bp.route("/list/<int:student_id>", methods=["GET"])
def get_tasks(student_id):
    if not Student.query.get(student_id):
        return jsonify({"success": False, "message": "Student not found"}), 404
    try:
        tasks = StudyPlanner.query.filter_by(student_id=student_id).order_by(StudyPlanner.scheduled_date.asc()).all()
        return jsonify({"success": True, "tasks": [t.to_dict() for t in tasks]}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@planner_bp.route("/add", methods=["POST"])
def add_task():
    data = request.get_json() or {}
    if not data.get("student_id"):
        return jsonify({"success": False, "message": "student_id is required"}), 400
    if not data.get("task_name"):
        return jsonify({"success": False, "message": "task_name is required"}), 400
    if not data.get("scheduled_date"):
        return jsonify({"success": False, "message": "scheduled_date is required"}), 400

    try:
        task = StudyPlanner(
            student_id=data["student_id"],
            task_name=data["task_name"],
            task_type=data.get("task_type", "study"),
            description=data.get("description", ""),
            scheduled_date=datetime.strptime(data["scheduled_date"], "%Y-%m-%d").date(),
            is_completed=False
        )
        db.session.add(task)
        db.session.commit()
        return jsonify({"success": True, "message": "Task added", "task": task.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500


@planner_bp.route("/update/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    task = StudyPlanner.query.get(task_id)
    if not task:
        return jsonify({"success": False, "message": "Task not found"}), 404

    data = request.get_json() or {}
    try:
        if "task_name" in data:
            task.task_name = data["task_name"]
        if "task_type" in data:
            task.task_type = data["task_type"]
        if "description" in data:
            task.description = data["description"]
        if "scheduled_date" in data:
            task.scheduled_date = datetime.strptime(data["scheduled_date"], "%Y-%m-%d").date()
        if "is_completed" in data:
            task.is_completed = bool(data["is_completed"])
            task.completed_at = datetime.utcnow() if data["is_completed"] else None
        db.session.commit()
        return jsonify({"success": True, "message": "Task updated", "task": task.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500


@planner_bp.route("/delete/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    task = StudyPlanner.query.get(task_id)
    if not task:
        return jsonify({"success": False, "message": "Task not found"}), 404
    try:
        db.session.delete(task)
        db.session.commit()
        return jsonify({"success": True, "message": "Task deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500


@planner_bp.route("/toggle/<int:task_id>", methods=["POST"])
def toggle_task(task_id):
    task = StudyPlanner.query.get(task_id)
    if not task:
        return jsonify({"success": False, "message": "Task not found"}), 404
    try:
        task.is_completed = not task.is_completed
        task.completed_at = datetime.utcnow() if task.is_completed else None
        db.session.commit()
        return jsonify({"success": True, "task": task.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
