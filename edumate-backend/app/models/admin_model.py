from app import db

class Admin(db.Model):
    __tablename__ = "admins"

    admin_id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)

    # IMPORTANT: match your DB column name
    password = db.Column(db.String(255), nullable=False)

    def to_dict(self):
        return {
            "admin_id": self.admin_id,
            "full_name": self.full_name,
            "email": self.email
        }