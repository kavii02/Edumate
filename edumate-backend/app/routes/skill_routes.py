from flask import Blueprint, request, jsonify
from sqlalchemy import text
from .. import db
from ..models.skill import Skill

skill_bp = Blueprint("skills", __name__)


@skill_bp.route("/", methods=["GET"])
def get_all_skills():
    sql = text("""
        SELECT
            s.skill_id,
            s.student_id,
            st.first_name,
            st.last_name,
            s.skill_name,
            s.category,
            s.skill_level,
            s.description
        FROM skills s
        LEFT JOIN students st ON s.student_id = st.student_id
    """)

    rows = db.session.execute(sql).fetchall()

    skills = []
    for row in rows:
        skills.append({
            "id": row.skill_id,
            "student_id": row.student_id,
            "student_name": f"{row.first_name or ''} {row.last_name or ''}".strip() or "Unknown Student",
            "skill": row.skill_name,
            "name": row.skill_name,
            "category": row.category,
            "level": row.skill_level,
            "description": row.description,
            "desc": row.description
        })

    return jsonify(skills), 200


@skill_bp.route("/student/<int:student_id>", methods=["GET"])
def get_student_skills(student_id):
    rows = db.session.execute(text("""
        SELECT skill_id, skill_name, category, skill_level, description
        FROM skills
        WHERE student_id = :sid
        ORDER BY skill_id ASC
    """), {"sid": student_id}).fetchall()

    skills = [{
        "id": r.skill_id,
        "name": r.skill_name,
        "category": r.category,
        "level": r.skill_level,
        "description": r.description
    } for r in rows]

    return jsonify(skills), 200


@skill_bp.route("/student/<int:student_id>", methods=["POST"])
def add_student_skill(student_id):
    data = request.get_json()

    if not data.get("name") or not data.get("description"):
        return jsonify({"error": "Skill name and description are required"}), 400

    db.session.execute(text("""
        INSERT INTO skills (student_id, skill_name, category, skill_level, description)
        VALUES (:sid, :name, :category, :level, :desc)
    """), {
        "sid": student_id,
        "name": data["name"],
        "category": data.get("category", "Programming"),
        "level": data.get("level", "Beginner"),
        "desc": data["description"]
    })
    db.session.commit()

    new_row = db.session.execute(text("""
        SELECT skill_id, skill_name, category, skill_level, description
        FROM skills
        WHERE student_id = :sid
        ORDER BY skill_id DESC LIMIT 1
    """), {"sid": student_id}).fetchone()

    return jsonify({
        "id": new_row.skill_id,
        "name": new_row.skill_name,
        "category": new_row.category,
        "level": new_row.skill_level,
        "description": new_row.description
    }), 201


@skill_bp.route("/<int:skill_id>", methods=["PUT"])
def update_skill(skill_id):
    data = request.get_json()

    db.session.execute(text("""
        UPDATE skills
        SET skill_name = :name,
            category   = :category,
            skill_level = :level,
            description = :desc
        WHERE skill_id = :sid
    """), {
        "name": data["name"],
        "category": data.get("category", "Programming"),
        "level": data.get("level", "Beginner"),
        "desc": data["description"],
        "sid": skill_id
    })
    db.session.commit()

    return jsonify({"message": "Skill updated successfully"}), 200


@skill_bp.route("/<int:skill_id>", methods=["DELETE"])
def delete_skill(skill_id):
    db.session.execute(
        text("DELETE FROM skills WHERE skill_id = :sid"),
        {"sid": skill_id}
    )
    db.session.commit()

    return jsonify({"message": "Skill deleted successfully"}), 200