from flask import Blueprint, request, jsonify
from .. import db
from ..models.course_material_model import CourseMaterial
from ..models.course_model import Course

material_bp = Blueprint("material", __name__)


@material_bp.route("/course/<int:course_id>", methods=["GET"])
def get_course_materials(course_id):
    if not Course.query.get(course_id):
        return jsonify({"success": False, "message": "Course not found"}), 404
    try:
        materials = CourseMaterial.query.filter_by(course_id=course_id).order_by(CourseMaterial.created_at.asc()).all()
        return jsonify({"success": True, "materials": [m.to_dict() for m in materials]}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@material_bp.route("/add", methods=["POST"])
def add_material():
    data = request.get_json() or {}
    if not data.get("course_id"):
        return jsonify({"success": False, "message": "course_id is required"}), 400
    if not data.get("title"):
        return jsonify({"success": False, "message": "title is required"}), 400
    if not Course.query.get(data["course_id"]):
        return jsonify({"success": False, "message": "Course not found"}), 404

    try:
        material = CourseMaterial(
            course_id=data["course_id"],
            title=data["title"],
            material_type=data.get("type", "pdf"),
            url=data.get("url"),
            file_size=data.get("size"),
            description=data.get("description"),
            uploaded_by=data.get("uploaded_by")
        )
        db.session.add(material)
        db.session.commit()
        return jsonify({"success": True, "material": material.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500


@material_bp.route("/delete/<int:material_id>", methods=["DELETE"])
def delete_material(material_id):
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
