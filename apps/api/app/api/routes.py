from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class TeacherLoginRequest(BaseModel):
    email: str
    password: str


class StudentJoinRequest(BaseModel):
    code: str
    student_name: str


class StudentCreateRequest(BaseModel):
    number: str
    name: str
    tag: str | None = None


class DocumentCreateRequest(BaseModel):
    title: str
    unit: str
    filename: str


class EvaluationUpdateRequest(BaseModel):
    student_id: str
    rubric_level: str


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


@router.post("/auth/login")
def teacher_login(payload: TeacherLoginRequest) -> dict[str, str]:
    return {
        "token_type": "demo",
        "access_token": "teacher-demo-session",
        "email": payload.email,
        "role": "teacher",
    }


@router.post("/student-sessions")
def student_join(payload: StudentJoinRequest) -> dict[str, str]:
    return {
        "session_type": "student_access_code",
        "student_name": payload.student_name,
        "assessment_id": "demo-assessment",
    }


@router.post("/classes/{class_id}/students")
def create_student(class_id: str, payload: StudentCreateRequest) -> dict[str, str]:
    return {
        "class_id": class_id,
        "student_id": "demo-student",
        "name": payload.name,
        "status": "created",
    }


@router.post("/documents")
def create_document(payload: DocumentCreateRequest) -> dict[str, str]:
    return {
        "document_id": "demo-document",
        "title": payload.title,
        "unit": payload.unit,
        "filename": payload.filename,
        "status": "ocr_pending",
    }


@router.post("/evaluations")
def update_evaluation(payload: EvaluationUpdateRequest) -> dict[str, str]:
    return {
        "student_id": payload.student_id,
        "rubric_level": payload.rubric_level,
        "status": "saved",
    }
