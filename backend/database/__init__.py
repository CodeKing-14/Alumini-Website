from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

# MySQL Database connection with pymysql
# Override DATABASE_URL env var to change credentials
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:Prasanth_14@localhost:3306/alumni_db",
)

engine = create_engine(
    DATABASE_URL,
    future=True,
    pool_pre_ping=True,        # test connection before using from pool
    pool_timeout=10,           # seconds to wait for a connection from pool
    pool_recycle=280,          # recycle connections before MySQL 5min timeout
    connect_args={"connect_timeout": 10},  # TCP connect timeout in seconds
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
