import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

db_name = os.getenv("MYSQL_DB", "edumate_db")
host = os.getenv("MYSQL_HOST", "localhost")
user = os.getenv("MYSQL_USER", "root")
password = os.getenv("MYSQL_PASSWORD", "")

print(f"Connecting to MySQL at {host} as {user}...")
conn = pymysql.connect(host=host, user=user, password=password)
cursor = conn.cursor()

# Create database using backticks for the name to handle hyphens correctly
cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
conn.close()
print(f"Database `{db_name}` created or already exists.")

from app import create_app, db
app = create_app()
with app.app_context():
    print("Creating all tables...")
    db.create_all()
    print("All tables created successfully!")
