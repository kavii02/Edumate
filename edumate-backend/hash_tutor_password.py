import sys

from werkzeug.security import generate_password_hash

from app import create_app, db
from app.models import Tutor
from app.utils.password_utils import validate_password

TUTOR_EMAIL = "sandu@edumate.lk"
DEFAULT_PASSWORD = "Sandu@123"


def hash_tutor_password(email=TUTOR_EMAIL, plain_password=DEFAULT_PASSWORD):
    is_valid, message = validate_password(plain_password)
    if not is_valid:
        raise ValueError(message)

    app = create_app()

    with app.app_context():
        tutor = Tutor.query.filter_by(email=email.lower()).first()
        if not tutor:
            print(f"Tutor not found. Creating new tutor for email: {email}")
            tutor = Tutor(
                first_name="Sandu",
                last_name="Tutor",
                email=email.lower(),
                specialization="Computer Science"
            )
            db.session.add(tutor)

        tutor.password = generate_password_hash(plain_password)
        db.session.commit()
        print(f"Tutor password set successfully for {email}")


if __name__ == "__main__":
    email = sys.argv[1] if len(sys.argv) > 1 else TUTOR_EMAIL
    password = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_PASSWORD
    hash_tutor_password(email, password)
