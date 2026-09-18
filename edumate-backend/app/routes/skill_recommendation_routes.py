from flask import Blueprint
from ..services.peer_matching_service import generate_recommendations
from ..utils.student_auth import require_student

recommendation_bp = Blueprint(
    "recommendations",
    __name__
)


@recommendation_bp.route("/<int:student_id>")
@require_student
def get_recommendations(student_id, authenticated_student_id):
    if student_id != authenticated_student_id:
        return {"success": False, "message": "You can only view your own recommendations"}, 403

    return generate_recommendations(student_id), 200