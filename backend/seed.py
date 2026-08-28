import os

import bcrypt
from sqlalchemy import inspect, text

from database import Base, engine, SessionLocal
from models import User


def seed_user(db, email: str, password: str, name: str, role: str) -> None:
    user = db.query(User).filter(User.email == email).first()
    if user:
        user.role = role
        return
    db.add(User(
        name=name,
        email=email,
        password_hash=bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode(),
        role=role,
    ))


Base.metadata.create_all(bind=engine)
if inspect(engine).has_table("users") and "role" not in {
    column["name"] for column in inspect(engine).get_columns("users")
}:
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'student'"))
with SessionLocal() as db:
    seed_user(db, os.environ["ADMIN_EMAIL"], os.environ["ADMIN_PASSWORD"], "Administrator", "admin")
    seed_user(db, os.environ["STUDENT_EMAIL"], os.environ["STUDENT_PASSWORD"], "Student User", "student")
    db.commit()
print("Admin and student users are ready.")