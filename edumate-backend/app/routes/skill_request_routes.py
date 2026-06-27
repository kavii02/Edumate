from flask import Blueprint, request, jsonify
from sqlalchemy import text
from .. import db
from ..models.skill_request import SkillRequest

skill_request_bp = Blueprint("skillrequests", __name__)


@skill_request_bp.route("/send", methods=["POST"])
def send_request():
    data = request.get_json()

    req = SkillRequest(
        requester_student_id=data["requester_student_id"],
        provider_student_id=data["provider_student_id"],
        skill_id=data["skill_id"]
    )

    db.session.add(req)
    db.session.commit()

    return jsonify({"message": "Request Sent"}), 201


@skill_request_bp.route("/incoming/<int:student_id>", methods=["GET"])
def incoming_requests(student_id):
    rows = db.session.execute(text("""
        SELECT
            sr.request_id,
            sr.requester_student_id,
            sr.provider_student_id,
            sr.skill_id,
            sr.status,
            sr.request_date,
            CONCAT(req_st.first_name, ' ', req_st.last_name) AS requester_name,
            sk.skill_name
        FROM skill_requests sr
        JOIN students req_st ON sr.requester_student_id = req_st.student_id
        JOIN skills sk ON sr.skill_id = sk.skill_id
        WHERE sr.provider_student_id = :sid
        ORDER BY sr.request_date DESC
    """), {"sid": student_id}).fetchall()

    result = [{
        "request_id": r.request_id,
        "requester_student_id": r.requester_student_id,
        "provider_student_id": r.provider_student_id,
        "skill_id": r.skill_id,
        "status": r.status,
        "request_date": str(r.request_date),
        "requester_name": r.requester_name,
        "skill_name": r.skill_name
    } for r in rows]

    return jsonify(result), 200


@skill_request_bp.route("/sent/<int:student_id>", methods=["GET"])
def sent_requests(student_id):
    rows = db.session.execute(text("""
        SELECT
            sr.request_id,
            sr.requester_student_id,
            sr.provider_student_id,
            sr.skill_id,
            sr.status,
            sr.request_date,
            CONCAT(prov_st.first_name, ' ', prov_st.last_name) AS provider_name,
            sk.skill_name
        FROM skill_requests sr
        JOIN students prov_st ON sr.provider_student_id = prov_st.student_id
        JOIN skills sk ON sr.skill_id = sk.skill_id
        WHERE sr.requester_student_id = :sid
        ORDER BY sr.request_date DESC
    """), {"sid": student_id}).fetchall()

    result = [{
        "request_id": r.request_id,
        "requester_student_id": r.requester_student_id,
        "provider_student_id": r.provider_student_id,
        "skill_id": r.skill_id,
        "status": r.status,
        "request_date": str(r.request_date),
        "provider_name": r.provider_name,
        "skill_name": r.skill_name
    } for r in rows]

    return jsonify(result), 200


@skill_request_bp.route("/accept/<int:request_id>", methods=["PUT"])
def accept_request(request_id):
    req = SkillRequest.query.get_or_404(request_id)
    req.status = "Accepted"
    db.session.commit()
    return jsonify({"message": "Accepted"}), 200


@skill_request_bp.route("/reject/<int:request_id>", methods=["PUT"])
def reject_request(request_id):
    req = SkillRequest.query.get_or_404(request_id)
    req.status = "Rejected"
    db.session.commit()
    return jsonify({"message": "Rejected"}), 200
