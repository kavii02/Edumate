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
    app.config.from_mapping(
        SECRET_KEY=os.getenv("SECRET_KEY", "change-me"),
        SQLALCHEMY_DATABASE_URI=os.getenv(
            "DATABASE_URL",
            f"mysql+pymysql://{os.getenv('MYSQL_USER','root')}:{os.getenv('MYSQL_PASSWORD','')}@{os.getenv('MYSQL_HOST','localhost')}/{os.getenv('MYSQL_DB','edumate_db')}"
        ),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
    )

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
    # Gmail Configuration
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
    # Import models
    # ==========================

    from . import models

    # ==========================
    # Register Blueprints
    # ==========================

    # 1. Auth and Admin Blueprints
    from .routes.auth_routes import auth_bp
    from .routes.admin_routes import admin_bp
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    # 2. Skill Barter Blueprints
    from .routes.skill_routes import skill_bp
    from .routes.skill_request_routes import skill_request_bp
    from .routes.skill_recommendation_routes import recommendation_bp
    from .routes.skill_message_route import skill_message_bp
    app.register_blueprint(skill_bp, url_prefix="/api/skills")
    app.register_blueprint(skill_request_bp, url_prefix="/api/skillrequests")
    app.register_blueprint(recommendation_bp, url_prefix="/api/recommendations")
    app.register_blueprint(skill_message_bp, url_prefix="/api/skillmessages")

    # 3. Tutor Blueprints
    from .routes.tutor_routes import tutor_bp
    app.register_blueprint(tutor_bp, url_prefix="/api/tutor")

    # 4. Course and Material Blueprints (registered for both tutor and student)
    from .routes.course_routes import course_bp
    from .routes.course_material_routes import material_bp
    app.register_blueprint(course_bp, url_prefix="/api/tutor/courses", name="tutor_courses")
    app.register_blueprint(course_bp, url_prefix="/api/course", name="student_courses")
    app.register_blueprint(material_bp, url_prefix="/api/materials")

    # 5. Student Blueprints
    from .student.routes.student_routes import student_bp
    from .student.routes.study_planner_routes import planner_bp
    from .student.routes.attendance_routes import attendance_bp
    app.register_blueprint(student_bp, url_prefix="/api/student")
    app.register_blueprint(planner_bp, url_prefix="/api/planner")
    app.register_blueprint(attendance_bp, url_prefix="/api/attendance")

    # 6. Quiz Blueprints
    from .routes.quiz_routes import quiz_bp as public_quiz_bp
    from .student.routes.quiz_routes import quiz_bp as student_quiz_bp
    app.register_blueprint(public_quiz_bp, url_prefix="/api/quizzes")
    app.register_blueprint(student_quiz_bp, url_prefix="/api/quiz")

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