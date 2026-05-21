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


def should_audit(scope: str) -> bool:
    return scope in SENSITIVE_SCOPES


def anonymize_for_ai(payload: dict[str, str]) -> dict[str, str]:
    blocked_keys = {"student_name", "student_number", "phone", "email"}
    return {key: value for key, value in payload.items() if key not in blocked_keys}
