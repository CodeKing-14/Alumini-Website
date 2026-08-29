#!/usr/bin/env python3
"""Drop and recreate gallery table"""

from sqlalchemy import text
from database import engine

with engine.begin() as connection:
    connection.execute(text("DROP TABLE IF EXISTS gallery"))
    print("✅ Gallery table dropped")

# Recreate tables
from models import Base, GalleryItem
Base.metadata.create_all(bind=engine)
print("✅ Gallery table recreated with correct schema")
