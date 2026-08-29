from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from sqlalchemy import inspect, text
from sqlalchemy.exc import OperationalError

from routes import auth_router, members_router, events_router, gallery_router, profile_router
from database import Base, engine


def _ensure_column(table: str, column: str, ddl: str) -> None:
    """Add `column` to `table` via `ddl` if the table exists but lacks it.
    Lets us evolve the schema without a full migration framework."""
    if inspect(engine).has_table(table) and column not in {
        col["name"] for col in inspect(engine).get_columns(table)
    }:
        with engine.begin() as connection:
            connection.execute(text(ddl))


def _ensure_nullable(table: str, column: str, col_type: str) -> None:
    """Make an existing column nullable if it isn't already.
    Needed when the schema evolved to stop writing a column that was
    originally NOT NULL."""
    if not inspect(engine).has_table(table):
        return
    for col in inspect(engine).get_columns(table):
        if col["name"] == column and not col["nullable"]:
            ddl = f"ALTER TABLE {table} MODIFY COLUMN {column} {col_type} NULL"
            with engine.begin() as connection:
                connection.execute(text(ddl))
            print(f"[OK] Made {table}.{column} nullable.")
            return


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create DB tables on startup — using lifespan instead of the deprecated
    # @app.on_event("startup") decorator. If MySQL is unavailable, the error
    # surfaces clearly instead of freezing the process.
    try:
        _ensure_column("users", "role", "ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'student'")
        _ensure_column("events", "event_type", "ALTER TABLE events ADD COLUMN event_type VARCHAR(20) NOT NULL DEFAULT 'Offline'")
        _ensure_column("events", "image_url", "ALTER TABLE events ADD COLUMN image_url VARCHAR(500) NULL")
        _ensure_column("gallery", "uploaded_by", "ALTER TABLE gallery ADD COLUMN uploaded_by VARCHAR(255) NULL")
        # New: add image_data column to event_images for base64 storage
        _ensure_column("event_images", "image_data", "ALTER TABLE event_images ADD COLUMN image_data LONGTEXT NULL")
        _ensure_column("gallery_images", "image_data", "ALTER TABLE gallery_images ADD COLUMN image_data LONGTEXT NOT NULL")

        # Ensure image_data columns are LONGTEXT in case they were previously TEXT (64KB)
        with engine.begin() as connection:
            if inspect(engine).has_table("gallery_images"):
                connection.execute(text("ALTER TABLE gallery_images MODIFY COLUMN image_data LONGTEXT NOT NULL"))
            if inspect(engine).has_table("event_images"):
                connection.execute(text("ALTER TABLE event_images MODIFY COLUMN image_data LONGTEXT NULL"))

        # Legacy columns that were originally NOT NULL but are no longer written
        # to now that images are stored as base64 data URLs instead of file paths.
        _ensure_nullable("event_images", "image_url", "VARCHAR(500)")
        _ensure_nullable("gallery", "image_url", "VARCHAR(500)")

        Base.metadata.create_all(bind=engine)
        print("[OK] Database tables verified / created.")
    except Exception as exc:
        print(f"[WARN] Could not create tables: {exc}")
    yield  # application runs here


app = FastAPI(title="Alumni Web App Backend", lifespan=lifespan)

# ── Static files (kept for profile photos, backward compat) ─────────────────
STATIC_DIR = Path(__file__).resolve().parent / "static"
STATIC_DIR.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# ── CORS ─────────────────────────────────────────────────────────────────────
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health check ─────────────────────────────────────────────────────────────
@app.get("/")
def read_root():
    return {"status": "ok", "message": "Alumni backend is running"}


# ── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth_router, prefix="/api/auth")
app.include_router(members_router, prefix="/api")
app.include_router(events_router, prefix="/api")
app.include_router(gallery_router, prefix="/api")
app.include_router(profile_router, prefix="/api")