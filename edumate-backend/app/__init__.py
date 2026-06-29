import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv

try:
    from flask_mail import Mail
except Exception:
    class Mail:
        def init_app(self, app):
            return None

        def send(self, message):
            return None

load_dotenv()

db = SQLAlchemy()
mail = Mail()


def create_app():

    app = Flask(__name__)
    app.config.from_mapping(
        SECRET_KEY=os.getenv("SECRET_KEY", "change-me"),
        SQLALCHEMY_DATABASE_URI=os.getenv(
            "DATABASE_URL",
            f"mysql+pymysql://{os.getenv('MYSQL_USER','root')}:{os.getenv('MYSQL_PASSWORD','')}@{os.getenv('MYSQL_HOST','localhost')}/{os.getenv('MYSQL_DB','edumate_db')}"
        ),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
    )

    CORS(app)
    db.init_app(app)
    mail.init_app(app)

    # ==========================
    # Import models
    # ==========================

    from . import models

    # ==========================
    # Register Blueprints
    # ==========================

    from .routes.auth_routes import auth_bp
    from .routes.course_routes import course_bp
    from .routes.tutor_routes import tutor_bp
    from .routes.quiz_routes import quiz_bp
    from .routes.skill_routes import skill_bp
    from .routes.skill_request_routes import skill_request_bp
    from .routes.skill_recommendation_routes import recommendation_bp
    from .routes.skill_message_route import skill_message_bp
    from .routes.admin_routes import admin_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(course_bp, url_prefix="/api/tutor/courses")
    app.register_blueprint(tutor_bp, url_prefix="/api/tutor")
    app.register_blueprint(quiz_bp, url_prefix="/api/quizzes")
    app.register_blueprint(skill_bp, url_prefix="/api/skills")
    app.register_blueprint(skill_request_bp, url_prefix="/api/skillrequests")
    app.register_blueprint(recommendation_bp, url_prefix="/api/recommendations")
    app.register_blueprint(skill_message_bp, url_prefix="/api/skillmessages")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    @app.route("/health")
    def health():
        return {
            "status": "ok",
            "message": "EduMate backend running"
        }

    return app