from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from routes import auth_router, members_router, events_router, gallery_router, profile_router
from database import Base, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create DB tables on startup — using lifespan instead of the deprecated
    # @app.on_event("startup") decorator. If MySQL is unavailable, the error
    # surfaces clearly instead of freezing the process.
    try:
        Base.metadata.create_all(bind=engine)
        print("✅  Database tables verified / created.")
    except Exception as exc:
        print(f"⚠️   Could not create tables: {exc}")
    yield  # application runs here


app = FastAPI(title="Alumni Web App Backend", lifespan=lifespan)

# ── Static files ────────────────────────────────────────────────────────────
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