from app import create_app, db
from app.models import Admin
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():

    hashed_password = generate_password_hash("admin2002")

    new_admin = Admin(
        full_name="Livini Budara",
        email="cst22008@std.uwu.ac.lk",
        password=hashed_password   # 👈 IMPORTANT FIX
    )

    db.session.add(new_admin)
    db.session.commit()

    print("Admin created successfully!")