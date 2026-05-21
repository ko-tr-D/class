import hashlib
import hmac
import secrets
from datetime import UTC, datetime, timedelta
from enum import Enum


class Role(str, Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"


SENSITIVE_SCOPES = {
    "student_profile",
    "evaluation",
    "teacher_observation",
    "record_draft",
    "source_document",
}

TOKEN_TTL_HOURS = 8


def should_audit(scope: str) -> bool:
    return scope in SENSITIVE_SCOPES


def hash_secret(secret: str) -> str:
    salt = "class-learning-record-v1"
    return hashlib.sha256(f"{salt}:{secret}".encode("utf-8")).hexdigest()


def verify_secret(secret: str, secret_hash: str) -> bool:
    return hmac.compare_digest(hash_secret(secret), secret_hash)


def issue_token() -> tuple[str, str]:
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(UTC) + timedelta(hours=TOKEN_TTL_HOURS)
    return token, expires_at.isoformat()


def anonymize_for_ai(payload: dict) -> dict:
    blocked_keys = {"student_name", "student_number", "phone", "email", "name", "display_name"}
    return {key: value for key, value in payload.items() if key not in blocked_keys}
