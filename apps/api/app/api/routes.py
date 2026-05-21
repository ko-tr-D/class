from fastapi import APIRouter

router = APIRouter()


@router.get("/structure")
def structure() -> dict[str, list[str]]:
    return {
        "teacher": [
            "dashboard",
            "classes",
            "documents",
            "ocr_review",
            "rubrics",
            "student_records",
            "record_drafts",
            "assessments",
            "analytics",
        ],
        "student": [
            "join",
            "assessment_player",
            "submission",
            "feedback",
        ],
        "security": [
            "teacher_email_login",
            "student_access_code",
            "authorization",
            "audit_logs",
            "data_anonymization",
        ],
    }
