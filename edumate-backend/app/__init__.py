import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_mail import Mail
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()
mail = Mail()


def create_app():

    app = Flask(__name__)

    # ==========================
    # Configuration
    # ==========================

    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "change-me")

    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL",
        f"mysql+pymysql://{os.getenv('MYSQL_USER','root')}:"
        f"{os.getenv('MYSQL_PASSWORD','')}@"
        f"{os.getenv('MYSQL_HOST','localhost')}/"
        f"{os.getenv('MYSQL_DB','edumate-db')}"
    )

    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # ==========================
    # Gmail
    # ==========================

    app.config["MAIL_SERVER"] = "smtp.gmail.com"
    app.config["MAIL_PORT"] = 587
    app.config["MAIL_USE_TLS"] = True
    app.config["MAIL_USE_SSL"] = False

    app.config["MAIL_USERNAME"] = "edumateprojectii@gmail.com"
    app.config["MAIL_PASSWORD"] = "eildqugafnlbdcjn"

    app.config["MAIL_DEFAULT_SENDER"] = (
        "EduMate",
        "edumateprojectii@gmail.com"
    )

    # ==========================
    # Extensions
    # ==========================

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": "http://localhost:5173"
            }
        },
        supports_credentials=True
    )

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
    from .routes.skill_routes import skill_bp
    from .routes.skill_request_routes import skill_request_bp
    from .routes.skill_recommendation_routes import recommendation_bp
    from .routes.skill_message_route import skill_message_bp
    from .routes.admin_routes import admin_bp
    from .routes.student_routes import student_bp
    from .routes.course_routes import course_bp
    from .routes.quiz_routes import quiz_bp
    from .routes.study_planner_routes import planner_bp
    from .routes.attendance_routes import attendance_bp
    from .routes.course_material_routes import material_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(skill_bp, url_prefix="/api/skills")
    app.register_blueprint(skill_request_bp, url_prefix="/api/skillrequests")
    app.register_blueprint(recommendation_bp, url_prefix="/api/recommendations")
    app.register_blueprint(skill_message_bp, url_prefix="/api/skillmessages")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(student_bp, url_prefix="/api/student")
    app.register_blueprint(course_bp, url_prefix="/api/course")
    app.register_blueprint(quiz_bp, url_prefix="/api/quiz")
    app.register_blueprint(planner_bp, url_prefix="/api/planner")
    app.register_blueprint(attendance_bp, url_prefix="/api/attendance")
    app.register_blueprint(material_bp, url_prefix="/api/materials")

    # ==========================
    # Create Tables
    # ==========================

    with app.app_context():
        db.create_all()

    @app.route("/health")
    def health():
        return {
            "status": "ok",
            "message": "EduMate backend running"
        }

    return app