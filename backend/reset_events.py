#!/usr/bin/env python3
"""Drop and recreate event tables"""

from sqlalchemy import text
from database import engine

with engine.begin() as connection:
    connection.execute(text("DROP TABLE IF EXISTS event_photos"))
    connection.execute(text("DROP TABLE IF EXISTS events"))
    print("✅ Tables dropped successfully")

# Recreate tables
from models import Base
Base.metadata.create_all(bind=engine)
print("✅ Tables recreated")
