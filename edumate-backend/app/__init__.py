import os
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()


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

    from .routes.auth_routes import auth_bp
    from .routes.quiz_routes import quiz_bp
    from .routes.tutor_routes import tutor_bp
    from .routes.course_routes import course_bp
    
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(quiz_bp, url_prefix="/api/quizzes")
    app.register_blueprint(tutor_bp, url_prefix="/api/tutor")
    app.register_blueprint(course_bp, url_prefix="/api/tutor/courses")

    with app.app_context():
        db.create_all()

    @app.route("/health")
    def health():
        return {"status": "ok"}, 200

    return app
