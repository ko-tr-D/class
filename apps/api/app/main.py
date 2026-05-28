import logging
import os
from urllib.parse import urlparse

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
def health() -> dict[str, str | bool | None]:
    database_url = os.getenv("DATABASE_URL", "")
    parsed = urlparse(database_url) if database_url else None
    return {
        "status": "ok",
        "version": "2026-05-28.4",
        "database_url_present": bool(database_url),
        "database_url_scheme": parsed.scheme if parsed else None,
        "database_url_host": parsed.hostname if parsed else None,
        "database_url_user": parsed.username if parsed else None,
        "database_url_password_present": bool(parsed.password) if parsed else False,
        "google_drive_root_present": bool(os.getenv("GOOGLE_DRIVE_ROOT_FOLDER_ID", "")),
        "google_credentials_json_present": bool(os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON", "")),
    }


@app.get("/api/system/status")
def system_status() -> dict[str, object]:
    table_counts: dict[str, int | None] = {}
    database_error = None
    try:
        with get_connection() as db:
            db.execute("SELECT 1")
            for table in ("users", "school_classes", "students", "standards", "assessments"):
                row = db.execute(f"SELECT COUNT(*) AS count FROM {table}").fetchone()
                table_counts[table] = row["count"]
    except Exception as error:
        database_error = f"{error.__class__.__name__}: {str(error)[:160]}"

    return {
        "api": "ok",
        "database": "ok" if database_error is None else "partial",
        "database_error": database_error,
        "table_counts": table_counts,
        "drive": "configured" if is_drive_configured() else "not_configured",
        "web_origin": os.getenv("WEB_ORIGIN", ""),
    }


@app.get("/api/system/db-ping")
def system_db_ping() -> dict[str, str | bool | None]:
    try:
        with get_connection() as db:
            db.execute("SELECT 1")
        return {"database": "ok", "error": None}
    except Exception as error:
        return {"database": "error", "error": error.__class__.__name__, "message": str(error)[:160]}


@app.get("/api/system/env-check")
def system_env_check() -> dict[str, str | bool | None]:
    database_url = os.getenv("DATABASE_URL", "")
    parsed = urlparse(database_url) if database_url else None
    return {
        "database_url_present": bool(database_url),
        "database_url_scheme": parsed.scheme if parsed else None,
        "database_url_host": parsed.hostname if parsed else None,
        "database_url_user": parsed.username if parsed else None,
        "database_url_password_present": bool(parsed.password) if parsed else False,
        "drive_configured": is_drive_configured(),
    }


@app.post("/api/system/init-db")
def system_init_db() -> dict[str, str]:
    init_db()
    return {"database": "initialized"}


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
