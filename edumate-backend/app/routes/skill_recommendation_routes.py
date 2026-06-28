from flask import Blueprint
from ..student.services.peer_matching_service import generate_recommendations

recommendation_bp = Blueprint(
    "recommendations",
    __name__
)


@recommendation_bp.route("/<int:student_id>")
def get_recommendations(student_id):

    return generate_recommendations(student_id), 200