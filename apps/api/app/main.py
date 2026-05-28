import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.database import get_connection, init_db
from app.core.drive_storage import is_drive_configured

logger = logging.getLogger("class_learning_record")

app = FastAPI(title="Class Learning Record API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router, prefix="/api")


@app.on_event("startup")
def startup() -> None:
    try:
        init_db()
    except Exception:
        logger.exception("Database initialization failed during startup")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/system/status")
def system_status() -> dict[str, object]:
    database_ok = False
    database_error = None
    try:
        with get_connection() as db:
            db.execute("SELECT 1")
        database_ok = True
    except Exception as error:
        database_error = error.__class__.__name__

    return {
        "api": "ok",
        "database": "ok" if database_ok else "error",
        "database_error": database_error,
        "drive": "configured" if is_drive_configured() else "not_configured",
        "web_origin": os.getenv("WEB_ORIGIN", ""),
    }


@app.get("/roadmap")
def roadmap() -> dict[str, list[str]]:
    return {
        "mvp": [
            "teacher auth and class permissions",
            "PDF upload",
            "OCR review",
            "rubric-based evaluation",
            "student record draft generation",
        ],
        "next": [
            "student assessment player",
            "response event logging",
            "learning pattern analytics",
        ],
        "security": [
            "role-based access control",
            "audit logging for sensitive records",
            "AI request anonymization",
        ],
    }
