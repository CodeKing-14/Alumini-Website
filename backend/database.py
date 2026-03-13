from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os


# Default to MySQL database; override with DATABASE_URL env var if needed.
# Example: mysql+mysqlconnector://user:password@localhost:3306/alumni_db
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+mysqlconnector://root:Prasanth_14@localhost:3306/alumni_db",
)

engine = create_engine(DATABASE_URL, future=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

