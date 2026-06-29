import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me")

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        f"mysql+pymysql://{os.getenv('MYSQL_USER','root')}:"
        f"{os.getenv('MYSQL_PASSWORD','')}@"
        f"{os.getenv('MYSQL_HOST','localhost')}/"
        f"{os.getenv('MYSQL_DB','edumate_db')}"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False